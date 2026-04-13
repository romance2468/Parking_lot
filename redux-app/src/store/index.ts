import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import { baseApi } from '../api/baseApi';
import authReducer from './authSlice';

/**
 * Корневой Redux Store.
 *
 * Состоит из двух частей:
 * 1. auth — управляет токенами и данными пользователя (authSlice)
 * 2. api  — кэш RTK Query для всех HTTP-запросов (baseApi + injectEndpoints)
 *
 * RTK Query middleware обязателен для работы:
 * - автоматической инвалидации кэша по тэгам
 * - polling (периодических перезапросов)
 * - refetchOnFocus / refetchOnReconnect
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

/**
 * Типизированные хуки для использования в компонентах.
 * Используй useAppDispatch и useAppSelector вместо стандартных
 * useDispatch и useSelector — они уже типизированы.
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
