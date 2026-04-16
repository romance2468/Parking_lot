import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Bubble } from '../bubbles';

export type BookingDetailsPayload = {
  bookingId?: string;
  spotNumber?: string;
  floor?: string;
  durationText?: string;
  licensePlate?: string;
  carModel?: string;
  entryTime?: string;
  totalPrice?: number;
};

type ParkingSelectionState = {
  selectedFloor: string;
  selectedSpotId: number | null;
  vehicleType: string;
  duration: string;
  showSuccessModal: boolean;
  bookingDetails: BookingDetailsPayload | null;
  error: string | null;
  savingBooking: boolean;
  bubbles: Bubble[];
};

const initialState: ParkingSelectionState = {
  selectedFloor: '1',
  selectedSpotId: null,
  vehicleType: 'standard',
  duration: '2',
  showSuccessModal: false,
  bookingDetails: null,
  error: null,
  savingBooking: false,
  bubbles: [],
};

export const parkingSelectionSlice = createSlice({
  name: 'parkingSelection',
  initialState,
  reducers: {
    setSelectedFloor(state, action: PayloadAction<string>) {
      state.selectedFloor = action.payload;
    },
    setSelectedSpotId(state, action: PayloadAction<number | null>) {
      state.selectedSpotId = action.payload;
    },
    setVehicleType(state, action: PayloadAction<string>) {
      state.vehicleType = action.payload;
    },
    setDuration(state, action: PayloadAction<string>) {
      state.duration = action.payload;
    },
    setShowSuccessModal(state, action: PayloadAction<boolean>) {
      state.showSuccessModal = action.payload;
    },
    setBookingDetails(state, action: PayloadAction<BookingDetailsPayload | null>) {
      state.bookingDetails = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    setSavingBooking(state, action: PayloadAction<boolean>) {
      state.savingBooking = action.payload;
    },
    setBubbles(state, action: PayloadAction<Bubble[]>) {
      state.bubbles = action.payload;
    },
  },
});

export const {
  setSelectedFloor,
  setSelectedSpotId,
  setVehicleType,
  setDuration,
  setShowSuccessModal,
  setBookingDetails,
  setError: setParkingSelectionError,
  setSavingBooking,
  setBubbles: setParkingSelectionBubbles,
} = parkingSelectionSlice.actions;
