import { AuthStore } from './AuthStore';
import { CarsStore } from './CarsStore';
import { ParkingStore } from './ParkingStore';

/**
 * RootStore — корневой стор, объединяющий все domain-сторы.
 *
 * Паттерн "RootStore" позволяет:
 * 1. Передавать ссылку на rootStore в каждый дочерний стор
 *    → сторы могут вызывать методы друг друга (cross-store communication)
 * 2. Создавать единственный экземпляр всех сторов (singleton)
 * 3. Легко тестировать — можно создать mock RootStore
 *
 * Пример cross-store коммуникации:
 * - AuthStore.logout() вызывает carsStore.invalidateCache()
 *   и parkingStore.invalidateCache()
 * - AuthStore.login() инвалидирует кэш других сторов
 */
export class RootStore {
  authStore: AuthStore;
  carsStore: CarsStore;
  parkingStore: ParkingStore;

  constructor() {
    // Передаём ссылку на this (rootStore) в каждый стор
    // для возможности вызывать методы других сторов
    this.authStore = new AuthStore(this);
    this.carsStore = new CarsStore(this);
    this.parkingStore = new ParkingStore(this);
  }
}
