import { makeAutoObservable, runInAction } from 'mobx';
import axiosInstance from '../api/axiosInstance';
import type { ParkingPlace, BookingSession, CreateBookingDto } from '../types';
import type { RootStore } from './RootStore';

/**
 * ParkingStore — MobX-стор для парковочных мест и сессий бронирования.
 *
 * Кэширование:
 * - Места (places): TTL 1 минута — часто меняются (занятость)
 * - Сессии (sessions): TTL 2 минуты — история бронирований
 *
 * Computed:
 * - activeSessions — текущие активные бронирования
 * - totalSpent — суммарные расходы пользователя
 * - freePlaces — только свободные места
 *
 * КЛЮЧЕВОЙ ПРИМЕР (данные в нескольких местах):
 * - activeSessions используется в UserInfo (счётчик) и в Parking (список)
 * - sessions используется в Profile (последние) и Sessions (все)
 */
export class ParkingStore {
  // ── observable поля ─────────────────────────────────────────────────
  places: ParkingPlace[] = [];
  sessions: BookingSession[] = [];
  loading: boolean = false;
  sessionsLoading: boolean = false;
  error: string | null = null;

  // ── TTL-кэш для мест ─────────────────────────────────────────────────
  private _placesLastFetched: number | null = null;
  private readonly _placesCacheTTL = 1 * 60 * 1000; // 1 минута

  // ── TTL-кэш для сессий ───────────────────────────────────────────────
  private _sessionsLastFetched: number | null = null;
  private readonly _sessionsCacheTTL = 2 * 60 * 1000; // 2 минуты

  constructor(private rootStore: RootStore) {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  // ── computed ─────────────────────────────────────────────────────────

  get isPlacesCacheValid(): boolean {
    return this._placesLastFetched !== null
      && (Date.now() - this._placesLastFetched) < this._placesCacheTTL;
  }

  get isSessionsCacheValid(): boolean {
    return this._sessionsLastFetched !== null
      && (Date.now() - this._sessionsLastFetched) < this._sessionsCacheTTL;
  }

  /** Активные (незавершённые) сессии — используется в UserInfo и Parking */
  get activeSessions(): BookingSession[] {
    return this.sessions.filter((s) => !s.time_end);
  }

  /** Завершённые сессии */
  get completedSessions(): BookingSession[] {
    return this.sessions.filter((s) => !!s.time_end);
  }

  /** Суммарные расходы */
  get totalSpent(): number {
    return this.sessions.reduce((sum, s) => sum + s.price, 0);
  }

  /** Только свободные места */
  get freePlaces(): ParkingPlace[] {
    return this.places.filter((p) => p.is_free);
  }

  /** Количество свободных мест */
  get freePlacesCount(): number {
    return this.freePlaces.length;
  }

  // ── actions ──────────────────────────────────────────────────────────

  async fetchPlaces(force = false): Promise<void> {
    if (!force && this.isPlacesCacheValid && this.places.length > 0) return;

    this.loading = true;
    this.error = null;
    try {
      const { data } = await axiosInstance.get<ParkingPlace[]>('/parking');
      runInAction(() => {
        this.places = data;
        this._placesLastFetched = Date.now();
        this.loading = false;
      });
    } catch (err: any) {
      runInAction(() => {
        this.error = err.response?.data?.error ?? 'Ошибка загрузки парковочных мест';
        this.loading = false;
      });
    }
  }

  /**
   * fetchSessions — история бронирований с кэшированием.
   * Используется в Profile (последние 5), Sessions (все), UserInfo (счётчик).
   * HTTP-запрос делается только при устаревшем кэше.
   */
  async fetchSessions(force = false): Promise<void> {
    if (!force && this.isSessionsCacheValid && this.sessions.length > 0) return;

    this.sessionsLoading = true;
    this.error = null;
    try {
      const { data } = await axiosInstance.get<BookingSession[]>('/parking/sessions');
      runInAction(() => {
        this.sessions = data;
        this._sessionsLastFetched = Date.now();
        this.sessionsLoading = false;
      });
    } catch (err: any) {
      runInAction(() => {
        this.error = err.response?.data?.error ?? 'Ошибка загрузки сессий';
        this.sessionsLoading = false;
      });
    }
  }

  async bookParking(booking: CreateBookingDto): Promise<BookingSession> {
    this.loading = true;
    try {
      const { data } = await axiosInstance.post<BookingSession>('/parking/book', booking);
      runInAction(() => {
        this.sessions.unshift(data); // добавляем в начало списка
        // Обновляем статус места как занятого
        const place = this.places.find((p) => p.id_parking === booking.id_parking);
        if (place) place.is_free = false;
        // Инвалидируем кэш
        this._placesLastFetched = Date.now();
        this._sessionsLastFetched = Date.now();
        this.loading = false;
      });
      return data;
    } catch (err: any) {
      runInAction(() => {
        this.error = err.response?.data?.error ?? 'Ошибка бронирования';
        this.loading = false;
      });
      throw err;
    }
  }

  async endSession(sessionId: number): Promise<void> {
    try {
      const { data } = await axiosInstance.post<BookingSession>(`/parking/end/${sessionId}`);
      runInAction(() => {
        const idx = this.sessions.findIndex((s) => s.id_session === sessionId);
        if (idx !== -1) this.sessions[idx] = data;
        // Освобождаем место
        const place = this.places.find((p) => p.id_parking === data.id_parking);
        if (place) place.is_free = true;
        this._placesLastFetched = Date.now();
        this._sessionsLastFetched = Date.now();
      });
    } catch (err: any) {
      runInAction(() => {
        this.error = err.response?.data?.error ?? 'Ошибка завершения сессии';
      });
      throw err;
    }
  }

  /** Сброс кэша при logout */
  invalidateCache(): void {
    this._placesLastFetched = null;
    this._sessionsLastFetched = null;
    this.places = [];
    this.sessions = [];
  }

  clearError(): void {
    this.error = null;
  }
}
