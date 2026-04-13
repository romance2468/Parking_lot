import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../types';

/**
 * AuthState — состояние аутентификации.
 *
 * Хранит токены и данные текущего пользователя.
 * Токены синхронизируются с localStorage для персистентности между сессиями.
 *
 * ВАЖНО: user здесь — это данные, пришедшие при логине.
 * Актуальный профиль запрашивается через RTK Query (authApi.getProfile),
 * и тоже хранится в кэше Redux store['api'].
 */
interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  // Восстанавливаем токены из localStorage при старте приложения
  token: localStorage.getItem('token'),
  refreshToken: localStorage.getItem('refreshToken'),
  user: (() => {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })(),
  isAuthenticated: !!localStorage.getItem('token'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * setCredentials — вызывается после успешного логина/регистрации.
     * Сохраняет токены и user в state и localStorage.
     */
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; refreshToken: string; user: User }>
    ) => {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.user = action.payload.user;
      state.isAuthenticated = true;

      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },

    /**
     * updateUser — обновляет данные пользователя в store
     * (например, после PUT /api/auth/profile).
     */
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },

    /**
     * setToken — обновляет только access-токен (после refresh).
     */
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      localStorage.setItem('token', action.payload);
    },

    /**
     * logout — очищает всё состояние и localStorage.
     */
    logout: (state) => {
      state.token = null;
      state.refreshToken = null;
      state.user = null;
      state.isAuthenticated = false;

      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    },
  },
});

export const { setCredentials, updateUser, setToken, logout } = authSlice.actions;
export default authSlice.reducer;

// Selectors
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectToken = (state: { auth: AuthState }) => state.auth.token;
