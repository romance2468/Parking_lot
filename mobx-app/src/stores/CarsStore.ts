import { makeAutoObservable, runInAction } from 'mobx';
import axiosInstance from '../api/axiosInstance';
import type { Car, CreateCarDto } from '../types';
import type { RootStore } from './RootStore';

/**
 * CarsStore — MobX-стор для управления автомобилями пользователя.
 *
 * Кэширование с TTL:
 * - Данные хранятся 3 минуты после последнего запроса
 * - fetchCars() проверяет кэш перед HTTP-запросом
 * - invalidateCache() — принудительный сброс (вызывается при logout)
 *
 * Computed свойства:
 * - carsCount — количество авто (используется в UserInfo)
 * - hasElectricCar — есть ли электромобиль
 * - electricCars — список электромобилей
 */
export class CarsStore {
  // ── observable поля ─────────────────────────────────────────────────
  cars: Car[] = [];
  loading: boolean = false;
  error: string | null = null;

  // ── TTL-кэш ──────────────────────────────────────────────────────────
  private _lastFetched: number | null = null;
  private readonly _cacheTTL = 3 * 60 * 1000; // 3 минуты

  constructor(private rootStore: RootStore) {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  // ── computed ─────────────────────────────────────────────────────────

  get isCacheValid(): boolean {
    return this._lastFetched !== null
      && (Date.now() - this._lastFetched) < this._cacheTTL;
  }

  get carsCount(): number {
    return this.cars.length;
  }

  get hasElectricCar(): boolean {
    return this.cars.some((car) => car.type === 'electric');
  }

  get electricCars(): Car[] {
    return this.cars.filter((car) => car.type === 'electric');
  }

  // ── actions ──────────────────────────────────────────────────────────

  /**
   * fetchCars — загрузка списка автомобилей с кэшированием.
   *
   * Схема работы кэша:
   * 1. Profile.tsx монтируется → fetchCars() → HTTP GET /api/cars
   * 2. UserInfo.tsx монтируется → fetchCars() → кэш HIT (нет HTTP!)
   * 3. Cars.tsx монтируется → fetchCars() → кэш HIT (нет HTTP!)
   * 4. Прошло 3 минуты → fetchCars() → кэш MISS → HTTP запрос
   */
  async fetchCars(force = false): Promise<void> {
    if (!force && this.isCacheValid && this.cars.length > 0) return;

    this.loading = true;
    this.error = null;
    try {
      const { data } = await axiosInstance.get<Car[]>('/cars');
      runInAction(() => {
        this.cars = data;
        this._lastFetched = Date.now();
        this.loading = false;
      });
    } catch (err: any) {
      runInAction(() => {
        this.error = err.response?.data?.error ?? 'Ошибка загрузки автомобилей';
        this.loading = false;
      });
    }
  }

  async addCar(carData: CreateCarDto): Promise<void> {
    this.loading = true;
    try {
      const { data } = await axiosInstance.post<Car>('/cars', carData);
      runInAction(() => {
        this.cars.push(data);
        this._lastFetched = Date.now(); // обновляем метку кэша
        this.loading = false;
      });
    } catch (err: any) {
      runInAction(() => {
        this.error = err.response?.data?.error ?? 'Ошибка добавления автомобиля';
        this.loading = false;
      });
      throw err;
    }
  }

  async deleteCar(id: number): Promise<void> {
    try {
      await axiosInstance.delete(`/cars/${id}`);
      runInAction(() => {
        this.cars = this.cars.filter((c) => c.id !== id);
        // Обновляем метку — данные изменились
        this._lastFetched = Date.now();
      });
    } catch (err: any) {
      runInAction(() => {
        this.error = err.response?.data?.error ?? 'Ошибка удаления автомобиля';
      });
      throw err;
    }
  }

  /** Сброс кэша — следующий fetchCars() сделает HTTP-запрос */
  invalidateCache(): void {
    this._lastFetched = null;
    this.cars = [];
  }

  clearError(): void {
    this.error = null;
  }
}
