import React, { createContext, useContext } from 'react';
import { RootStore } from '../stores/RootStore';

/**
 * StoreContext — React-контекст для передачи RootStore по дереву компонентов.
 *
 * Паттерн:
 * 1. Создаём единственный экземпляр RootStore вне компонента (singleton)
 * 2. Оборачиваем приложение в <StoreProvider>
 * 3. В компонентах используем хук useStore() для доступа к сторам
 *
 * Почему не передаём через props?
 * - Избегаем "prop drilling" через 5-10 уровней компонентов
 * - Единая точка доступа к состоянию
 * - Компоненты сами выбирают, какие сторы им нужны
 */

// Единственный экземпляр RootStore для всего приложения
export const rootStore = new RootStore();

const StoreContext = createContext<RootStore>(rootStore);

/**
 * StoreProvider — провайдер контекста.
 * Оборачивает корневой компонент App.
 */
export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <StoreContext.Provider value={rootStore}>
    {children}
  </StoreContext.Provider>
);

/**
 * useStore — хук для доступа к RootStore в любом компоненте.
 *
 * Использование:
 * const { authStore, carsStore, parkingStore } = useStore();
 *
 * Затем в observer()-компоненте:
 * authStore.user → автоматическая подписка на изменения
 */
export const useStore = (): RootStore => {
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error('useStore must be used within StoreProvider');
  }
  return store;
};
