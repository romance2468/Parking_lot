import { baseApi } from '../api/baseApi';
import type { FullProfile } from '../types';

/**
 * profileApi — RTK Query endpoint для полного профиля пользователя.
 *
 * GET /api/profile возвращает объединённые данные:
 * { user, cars, sessions }
 *
 * Этот endpoint используется в Profile.tsx и UserInfo.tsx.
 * Кэш инвалидируется при любом изменении user/cars/sessions.
 */
export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ─── GET /api/profile ───────────────────────────────────────────────
    getFullProfile: builder.query<FullProfile, void>({
      query: () => '/profile',
      providesTags: ['Profile', 'User', 'Cars', 'Sessions'],
      keepUnusedDataFor: 180, // 3 минуты
    }),
  }),
  overrideExisting: false,
});

export const { useGetFullProfileQuery } = profileApi;
