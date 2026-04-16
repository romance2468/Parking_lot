import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type LandingState = {
  isLoggedIn: boolean;
};

const initialState: LandingState = {
  isLoggedIn: !!localStorage.getItem('token'),
};

export const landingSlice = createSlice({
  name: 'landing',
  initialState,
  reducers: {
    setLoggedIn(state, action: PayloadAction<boolean>) {
      state.isLoggedIn = action.payload;
    },
    syncAuthFromStorage(state) {
      state.isLoggedIn = !!localStorage.getItem('token');
    },
  },
});

export const { setLoggedIn, syncAuthFromStorage } = landingSlice.actions;
