import { baseApi } from '../api/baseApi';
import type {
  User,
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
} from '../types';
import { setCredentials, updateUser } from '../store/authSlice';

/**
 * authApi — RTK Query endpoints для аутентификации и профиля.
 *
 * Кэширование:
 * - getProfile кэшируется с тэгом 'User'
 * - После login/register/updateProfile тэг инвалидируется → данные перезапрашиваются
 * - keepUnusedDataFor наследуется из baseApi (300 сек = 5 минут)
 *
 * Использование данных в нескольких местах:
 * - getProfile используется в Header, Profile, UserInfo, Sidebar
 * - RTK Query гарантирует один HTTP-запрос, остальные читают кэш
 */
export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ─── POST /api/auth/login ───────────────────────────────────────────
    login: builder.mutation<AuthResponse, LoginCredentials>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      // После успешного логина инвалидируем кэш профиля и связанных данных
      invalidatesTags: ['User', 'Profile', 'Cars', 'Sessions'],
      // onQueryStarted — side-effect: сохраняем credentials в authSlice
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data));
        } catch {
          // ошибка обрабатывается в компоненте через isError
        }
      },
    }),

    // ─── POST /api/auth/register ────────────────────────────────────────
    register: builder.mutation<AuthResponse, RegisterCredentials>({
      query: (credentials) => ({
        url: '/auth/register',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User', 'Profile'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data));
        } catch {}
      },
    }),

    // ─── GET /api/auth/profile ──────────────────────────────────────────
    /**
     * getProfile — ГЛАВНЫЙ endpoint для данных текущего пользователя.
     *
     * Этот запрос используется в НЕСКОЛЬКИХ компонентах:
     *   - Header.tsx       → отображает имя
     *   - Profile.tsx      → полные данные
     *   - UserInfo.tsx     → карточка пользователя
     *   - Sidebar.tsx      → аватар и email
     *
     * RTK Query автоматически:
     *   1. Делает HTTP-запрос при первом вызове
     *   2. Сохраняет результат в кэш с тэгом 'User'
     *   3. Все последующие вызовы useGetProfileQuery() читают кэш (0 запросов!)
     *   4. Если тэг 'User' инвалидирован (мутация) → один новый запрос
     */
    getProfile: builder.query<User, void>({
      query: () => '/auth/profile',
      providesTags: ['User'],
      // Данные хранятся 5 минут после размонтирования последнего подписчика
      keepUnusedDataFor: 300,
      // Синхронизируем с authSlice после получения актуального профиля
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(updateUser(data));
        } catch {}
      },
    }),

    // ─── PUT /api/auth/profile ──────────────────────────────────────────
    updateProfile: builder.mutation<User, Partial<User>>({
      query: (data) => ({
        url: '/auth/profile',
        method: 'PUT',
        body: data,
      }),
      // Инвалидируем 'User' → getProfile перезапросится автоматически
      invalidatesTags: ['User', 'Profile'],
    }),

    // ─── POST /api/auth/refresh ─────────────────────────────────────────
    refreshToken: builder.mutation<{ token: string }, { refreshToken: string }>({
      query: (body) => ({
        url: '/auth/refresh',
        method: 'POST',
        body,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useRefreshTokenMutation,
} = authApi;
