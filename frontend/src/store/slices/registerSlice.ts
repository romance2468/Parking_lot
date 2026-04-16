import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Bubble } from '../bubbles';

type RegisterState = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  error: string;
  success: boolean;
  loading: boolean;
  bubbles: Bubble[];
};

const initialState: RegisterState = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  error: '',
  success: false,
  loading: false,
  bubbles: [],
};

export const registerSlice = createSlice({
  name: 'register',
  initialState,
  reducers: {
    setName(state, action: PayloadAction<string>) {
      state.name = action.payload;
    },
    setEmail(state, action: PayloadAction<string>) {
      state.email = action.payload;
    },
    setPassword(state, action: PayloadAction<string>) {
      state.password = action.payload;
    },
    setConfirmPassword(state, action: PayloadAction<string>) {
      state.confirmPassword = action.payload;
    },
    setError(state, action: PayloadAction<string>) {
      state.error = action.payload;
    },
    setSuccess(state, action: PayloadAction<boolean>) {
      state.success = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setBubbles(state, action: PayloadAction<Bubble[]>) {
      state.bubbles = action.payload;
    },
  },
});

export const {
  setName,
  setEmail,
  setPassword,
  setConfirmPassword,
  setError,
  setSuccess,
  setLoading,
  setBubbles: setRegisterBubbles,
} = registerSlice.actions;
