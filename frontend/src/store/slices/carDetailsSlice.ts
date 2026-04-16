import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Bubble } from '../bubbles';

type CarDetailsState = {
  licensePlate: string;
  carModel: string;
  carColor: string;
  selectedVehicleType: string;
  additionalNotes: string;
  agreeToTerms: boolean;
  error: string;
  isSubmitting: boolean;
  bubbles: Bubble[];
};

const initialState: CarDetailsState = {
  licensePlate: '',
  carModel: '',
  carColor: '',
  selectedVehicleType: 'sedan',
  additionalNotes: '',
  agreeToTerms: false,
  error: '',
  isSubmitting: false,
  bubbles: [],
};

export const carDetailsSlice = createSlice({
  name: 'carDetails',
  initialState,
  reducers: {
    setLicensePlate(state, action: PayloadAction<string>) {
      state.licensePlate = action.payload;
    },
    setCarModel(state, action: PayloadAction<string>) {
      state.carModel = action.payload;
    },
    setCarColor(state, action: PayloadAction<string>) {
      state.carColor = action.payload;
    },
    setSelectedVehicleType(state, action: PayloadAction<string>) {
      state.selectedVehicleType = action.payload;
    },
    setAdditionalNotes(state, action: PayloadAction<string>) {
      state.additionalNotes = action.payload;
    },
    setAgreeToTerms(state, action: PayloadAction<boolean>) {
      state.agreeToTerms = action.payload;
    },
    setError(state, action: PayloadAction<string>) {
      state.error = action.payload;
    },
    setIsSubmitting(state, action: PayloadAction<boolean>) {
      state.isSubmitting = action.payload;
    },
    setBubbles(state, action: PayloadAction<Bubble[]>) {
      state.bubbles = action.payload;
    },
  },
});

export const {
  setLicensePlate,
  setCarModel,
  setCarColor,
  setSelectedVehicleType,
  setAdditionalNotes,
  setAgreeToTerms,
  setError,
  setIsSubmitting,
  setBubbles: setCarDetailsBubbles,
} = carDetailsSlice.actions;
