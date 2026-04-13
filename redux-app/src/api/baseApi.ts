import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';

/**
 * baseApi — основной экземпляр RTK Query.
 *
 * Все domain-specific endpoints (auth, cars, parking, profile)
 * добавляются через .injectEndpoints() в отдельных файлах services/.
 *
 * Как работает кэширование:
 * - RTK Query хранит результаты запросов в Redux store (раздел 'api')
 * - Каждый endpoint помечается тэгами (providesTags)
 * - При мутации тэги инвалидируются (invalidatesTags) → данные перезапрашиваются
 * - keepUnusedDataFor — время хранения данных в кэше (в секундах)
 *   после того как последний подписчик размонтировался
 */
export const baseApi = createApi({
  reducerPath: 'api',

  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    /**
     * prepareHeaders — добавляем JWT-токен к каждому запросу автоматически.
     * Токен берётся из auth slice Redux store, не из localStorage напрямую.
     */
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),

  /**
   * tagTypes — глобальный список тэгов для управления инвалидацией кэша.
   * При мутации (добавить/удалить/обновить) нужный тэг инвалидируется,
   * и все запросы с этим тэгом автоматически перевыполняются.
   */
  tagTypes: ['User', 'Cars', 'Parking', 'Sessions', 'Profile'],

  /**
   * Глобальные настройки кэширования:
   * keepUnusedDataFor: 300 — хранить данные 5 минут после размонтирования компонента.
   * refetchOnMountOrArgChange: 60 — перезапрашивать если данным > 60 секунд.
   */
  keepUnusedDataFor: 300,
  refetchOnMountOrArgChange: 60,
  refetchOnFocus: true,
  refetchOnReconnect: true,

  endpoints: () => ({}), // endpoints добавляются через injectEndpoints()
});
