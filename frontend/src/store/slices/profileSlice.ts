import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Bubble } from '../bubbles';

type ProfileState = {
  bubbles: Bubble[];
  error: string;
  success: string;
  name: string;
  email: string;
  autoNumber: string;
  mark: string;
  color: string;
  selectedVehicleType: string;
  notes: string;
  savingProfile: boolean;
  savingCar: boolean;
  editProfile: boolean;
  editCar: boolean;
  editPassword: boolean;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  savingPassword: boolean;
};

const initialState: ProfileState = {
  bubbles: [],
  error: '',
  success: '',
  name: '',
  email: '',
  autoNumber: '',
  mark: '',
  color: '',
  selectedVehicleType: 'sedan',
  notes: '',
  savingProfile: false,
  savingCar: false,
  editProfile: false,
  editCar: false,
  editPassword: false,
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
  savingPassword: false,
};

export const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setBubbles(state, action: PayloadAction<Bubble[]>) {
      state.bubbles = action.payload;
    },
    setError(state, action: PayloadAction<string>) {
      state.error = action.payload;
    },
    setSuccess(state, action: PayloadAction<string>) {
      state.success = action.payload;
    },
    setName(state, action: PayloadAction<string>) {
      state.name = action.payload;
    },
    setEmail(state, action: PayloadAction<string>) {
      state.email = action.payload;
    },
    setAutoNumber(state, action: PayloadAction<string>) {
      state.autoNumber = action.payload;
    },
    setMark(state, action: PayloadAction<string>) {
      state.mark = action.payload;
    },
    setColor(state, action: PayloadAction<string>) {
      state.color = action.payload;
    },
    setSelectedVehicleType(state, action: PayloadAction<string>) {
      state.selectedVehicleType = action.payload;
    },
    setNotes(state, action: PayloadAction<string>) {
      state.notes = action.payload;
    },
    setSavingProfile(state, action: PayloadAction<boolean>) {
      state.savingProfile = action.payload;
    },
    setSavingCar(state, action: PayloadAction<boolean>) {
      state.savingCar = action.payload;
    },
    setEditProfile(state, action: PayloadAction<boolean>) {
      state.editProfile = action.payload;
    },
    setEditCar(state, action: PayloadAction<boolean>) {
      state.editCar = action.payload;
    },
    setEditPassword(state, action: PayloadAction<boolean>) {
      state.editPassword = action.payload;
    },
    setCurrentPassword(state, action: PayloadAction<string>) {
      state.currentPassword = action.payload;
    },
    setNewPassword(state, action: PayloadAction<string>) {
      state.newPassword = action.payload;
    },
    setConfirmPassword(state, action: PayloadAction<string>) {
      state.confirmPassword = action.payload;
    },
    setSavingPassword(state, action: PayloadAction<boolean>) {
      state.savingPassword = action.payload;
    },
    hydrateFormFromProfile(
      state,
      action: PayloadAction<{
        name: string;
        email: string;
        autoNumber: string;
        mark: string;
        color: string;
        selectedVehicleType: string;
        notes: string;
      }>
    ) {
      const p = action.payload;
      state.name = p.name;
      state.email = p.email;
      state.autoNumber = p.autoNumber;
      state.mark = p.mark;
      state.color = p.color;
      state.selectedVehicleType = p.selectedVehicleType;
      state.notes = p.notes;
    },
    clearMessages(state) {
      state.error = '';
      state.success = '';
    },
  },
});

export const {
  setBubbles: setProfileBubbles,
  setError: setProfileError,
  setSuccess: setProfileSuccess,
  setName,
  setEmail,
  setAutoNumber,
  setMark,
  setColor,
  setSelectedVehicleType,
  setNotes,
  setSavingProfile,
  setSavingCar,
  setEditProfile,
  setEditCar,
  setEditPassword,
  setCurrentPassword,
  setNewPassword,
  setConfirmPassword,
  setSavingPassword,
  hydrateFormFromProfile,
  clearMessages,
} = profileSlice.actions;
