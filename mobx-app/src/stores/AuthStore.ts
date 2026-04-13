import { makeAutoObservable, runInAction } from 'mobx';
import axiosInstance from '../api/axiosInstance';
import type { User, LoginCredentials, RegisterCredentials, AuthResponse } from '../types';
import type { RootStore } from './RootStore';

/**
 * AuthStore — MobX-стор для аутентификации и профиля пользователя.
 *
 * Управляет:
 * - токенами JWT (хранятся в state и localStorage)
 * - данными текущего пользователя (User)
 * - состоянием загрузки и ошибками
 *
 * Кэширование реализовано через TTL (Time-To-Live):
 * - _lastFetched — timestamp последнего успешного запроса
 * - _cacheTTL — 5 минут: если данные свежее, повторный запрос не делается
 *
 * Реактивность:
 * - makeAutoObservable() помечает все поля как observable,
 *   методы как action, геттеры как computed
 * - Все компоненты-observer, использующие user/isAuthenticated,
 *   автоматически перерисуются при изменении
 *
 * КЛЮЧЕВОЙ ПРИМЕР (данные в нескольких местах):
 * - authStore.user используется в Header, Profile, UserInfo, Sidebar
 * - При изменении user все эти компоненты перерисуются АВТОМАТИЧЕСКИ
 * - MobX Proxy отслеживает какие именно поля читает каждый observer-компонент
 */
export class AuthStore {
  // ── observable поля ─────────────────────────────────────────────────
  user: User | null = null;
  token: string | null = localStorage.getItem('token');
  refreshToken: string | null = localStorage.getItem('refreshToken');
  isAuthenticated: boolean = !!localStorage.getItem('token');
  loading: boolean = false;
  error: string | null = null;

  // ── TTL-кэш ──────────────────────────────────────────────────────────
  private _lastFetched: number | null = null;
  private readonly _cacheTTL = 5 * 60 * 1000; // 5 минут

  constructor(private rootStore: RootStore) {
    makeAutoObservable(this, {}, { autoBind: true });

    // Восстанавливаем пользователя из localStorage при старте
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        this.user = JSON.parse(savedUser);
      }
    } catch {
      localStorage.removeItem('user');
    }
  }

  // ── computed ─────────────────────────────────────────────────────────

  /** Кэш актуален если данным меньше 5 минут */
  get isCacheValid(): boolean {
    return this._lastFetched !== null
      && (Date.now() - this._lastFetched) < this._cacheTTL;
  }

  /** Отображаемое имя пользователя */
  get displayName(): string {
    return this.user?.name ?? 'Гость';
  }

  // ── actions ──────────────────────────────────────────────────────────

  /**
   * login — вход пользователя.
   * После успешного входа инвалидируем кэш других сторов
   * (cars, parking) через rootStore.
   */
  async login(credentials: LoginCredentials): Promise<void> {
    this.loading = true;
    this.error = null;
    try {
      const { data } = await axiosInstance.post<AuthResponse>('/auth/login', credentials);
      runInAction(() => {
        this.token = data.token;
        this.refreshToken = data.refreshToken;
        this.user = data.user;
        this.isAuthenticated = true;
        this._lastFetched = Date.now();
        this.loading = false;

        localStorage.setItem('token', data.token);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.user));
      });

      // Инвалидируем кэш других сторов после смены пользователя
      this.rootStore.carsStore.invalidateCache();
      this.rootStore.parkingStore.invalidateCache();
    } catch (err: any) {
      runInAction(() => {
        this.error = err.response?.data?.error ?? 'Ошибка входа';
        this.loading = false;
      });
      throw err;
    }
  }

  /**
   * fetchProfile — загрузка актуального профиля с сервера.
   *
   * Кэширование с TTL:
   * - Если данным < 5 минут И force=false → возвращаем из памяти (0 HTTP!)
   * - Если force=true → всегда делаем запрос
   */
  async fetchProfile(force = false): Promise<void> {
    // Проверяем кэш: если данные свежие — не запрашиваем
    if (!force && this.isCacheValid && this.user) return;

    this.loading = true;
    try {
      const { data } = await axiosInstance.get<User>('/auth/profile');
      runInAction(() => {
        this.user = data;
        this._lastFetched = Date.now(); // обновляем метку кэша
        this.loading = false;

        localStorage.setItem('user', JSON.stringify(data));
      });
    } catch (err: any) {
      runInAction(() => {
        this.error = err.response?.data?.error ?? 'Ошибка загрузки профиля';
        this.loading = false;
      });
    }
  }

  /**
   * updateProfile — обновление профиля.
   * После успешного обновления инвалидируем кэш (force-обновление при следующем fetchProfile).
   */
  async updateProfile(data: Partial<User>): Promise<void> {
    this.loading = true;
    try {
      const { data: updated } = await axiosInstance.put<User>('/auth/profile', data);
      runInAction(() => {
        this.user = updated;
        this._lastFetched = Date.now();
        this.loading = false;
        localStorage.setItem('user', JSON.stringify(updated));
      });
    } catch (err: any) {
      runInAction(() => {
        this.error = err.response?.data?.error ?? 'Ошибка обновления профиля';
        this.loading = false;
      });
      throw err;
    }
  }

  /** logout — полная очистка состояния */
  logout(): void {
    this.user = null;
    this.token = null;
    this.refreshToken = null;
    this.isAuthenticated = false;
    this._lastFetched = null;
    this.error = null;

    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');

    // Очищаем кэш всех сторов
    this.rootStore.carsStore.invalidateCache();
    this.rootStore.parkingStore.invalidateCache();
  }

  /** Сброс кэша — при следующем fetchProfile данные запросятся с сервера */
  invalidateCache(): void {
    this._lastFetched = null;
  }

  clearError(): void {
    this.error = null;
  }
}
