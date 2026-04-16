import { configureStore } from '@reduxjs/toolkit';
import { parkingApi } from './parkingApi';
import { landingSlice } from './slices/landingSlice';
import { loginSlice } from './slices/loginSlice';
import { registerSlice } from './slices/registerSlice';
import { carDetailsSlice } from './slices/carDetailsSlice';
import { profileSlice } from './slices/profileSlice';
import { parkingSelectionSlice } from './slices/parkingSelectionSlice';

export const store = configureStore({
  reducer: {
    [parkingApi.reducerPath]: parkingApi.reducer,
    landing: landingSlice.reducer,
    login: loginSlice.reducer,
    register: registerSlice.reducer,
    carDetails: carDetailsSlice.reducer,
    profile: profileSlice.reducer,
    parkingSelection: parkingSelectionSlice.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(parkingApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
