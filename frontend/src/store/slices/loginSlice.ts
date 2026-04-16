import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Bubble } from '../bubbles';

export type LoginSuccessPayload = { token: string; refreshToken: string; user?: unknown };

type LoginState = {
  email: string;
  password: string;
  error: string;
  rememberMe: boolean;
  loading: boolean;
  loginSuccess: LoginSuccessPayload | null;
  bubbles: Bubble[];
};

const initialState: LoginState = {
  email: '',
  password: '',
  error: '',
  rememberMe: false,
  loading: false,
  loginSuccess: null,
  bubbles: [],
};

export const loginSlice = createSlice({
  name: 'login',
  initialState,
  reducers: {
    setEmail(state, action: PayloadAction<string>) {
      state.email = action.payload;
    },
    setPassword(state, action: PayloadAction<string>) {
      state.password = action.payload;
    },
    setError(state, action: PayloadAction<string>) {
      state.error = action.payload;
    },
    setRememberMe(state, action: PayloadAction<boolean>) {
      state.rememberMe = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setLoginSuccess(state, action: PayloadAction<LoginSuccessPayload | null>) {
      state.loginSuccess = action.payload;
    },
    setBubbles(state, action: PayloadAction<Bubble[]>) {
      state.bubbles = action.payload;
    },
    hydrateRememberedEmail(state) {
      const remembered = localStorage.getItem('rememberedEmail');
      if (remembered) {
        state.email = remembered;
        state.rememberMe = true;
      }
    },
    resetLoginForm() {
      return { ...initialState, bubbles: initialState.bubbles };
    },
  },
});

export const {
  setEmail,
  setPassword,
  setError,
  setRememberMe,
  setLoading,
  setLoginSuccess,
  setBubbles,
  hydrateRememberedEmail,
  resetLoginForm,
} = loginSlice.actions;
