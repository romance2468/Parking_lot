import { makeAutoObservable, runInAction } from 'mobx';
import { authAPI, parkingAPI } from '../api';
import type { ParkingPlace } from '../types';
import { generateBubbles } from '../utils/bubbles';

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

class ParkingSelectionStore {
  selectedFloor = '1';
  selectedSpotId: number | null = null;
  vehicleType = 'standard';
  duration = '2';
  showSuccessModal = false;
  bookingDetails: BookingDetailsPayload | null = null;
  places: ParkingPlace[] = [];
  loading = true;
  error: string | null = null;
  savingBooking = false;
  bubbles = generateBubbles();

  constructor() {
    makeAutoObservable(this);
  }

  initBubbles() {
    this.bubbles = generateBubbles();
  }

  setSelectedFloor(v: string) {
    this.selectedFloor = v;
    this.selectedSpotId = null;
    void this.loadPlaces(Number(v));
  }

  setSelectedSpotId(v: number | null) {
    this.selectedSpotId = v;
  }

  setVehicleType(v: string) {
    this.vehicleType = v;
  }

  setDuration(v: string) {
    this.duration = v;
  }

  setSavingBooking(v: boolean) {
    this.savingBooking = v;
  }

  setParkingError(v: string | null) {
    this.error = v;
  }

  setShowSuccessModal(v: boolean) {
    this.showSuccessModal = v;
  }

  async loadPlaces(floor: number): Promise<void> {
    this.loading = true;
    this.error = null;
    try {
      const res = await parkingAPI.getPlaces(floor);
      runInAction(() => {
        this.places = res.data.places || [];
        this.loading = false;
      });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } }; message?: string };
      runInAction(() => {
        this.error = e.response?.data?.error || e.message || 'Не удалось загрузить места';
        this.places = [];
        this.loading = false;
      });
    }
  }

  async syncVehicleTypeFromContext(locationState: unknown): Promise<void> {
    const stateCar = (locationState as { car?: { type?: string } })?.car;
    if (stateCar?.type && (String(stateCar.type).toLowerCase() === 'electric' || String(stateCar.type).toLowerCase().includes('электр'))) {
      this.vehicleType = 'electric';
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await authAPI.getSelectionContext();
      const carType = res.data?.car?.type;
      if (carType && (String(carType).toLowerCase() === 'electric' || String(carType).toLowerCase().includes('электр'))) {
        runInAction(() => {
          this.vehicleType = 'electric';
        });
      }
    } catch {
      /* ignore */
    }
  }

  async createBookingAndGo(
    payload: {
      car_id: number;
      id_parking: number;
      type_parking: string;
      time_start: string;
      time_end: string;
      price: number;
    },
    navigate: (path: string) => void
  ): Promise<void> {
    this.savingBooking = true;
    this.error = null;
    try {
      await parkingAPI.createBooking(payload);
      navigate('/profile');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } }; message?: string };
      runInAction(() => {
        this.error = e.response?.data?.error || e.message || 'Ошибка бронирования';
      });
    } finally {
      runInAction(() => {
        this.savingBooking = false;
      });
    }
  }
}

export const parkingSelectionStore = new ParkingSelectionStore();
