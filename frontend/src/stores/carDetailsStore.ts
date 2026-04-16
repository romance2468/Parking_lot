import { makeAutoObservable, runInAction } from 'mobx';
import { carAPI } from '../api';
import { generateBubbles } from '../utils/bubbles';
import type { Car } from '../types';

class CarDetailsStore {
  licensePlate = '';
  carModel = '';
  carColor = '';
  selectedVehicleType = 'sedan';
  additionalNotes = '';
  agreeToTerms = false;
  error = '';
  isSubmitting = false;
  bubbles = generateBubbles();

  constructor() {
    makeAutoObservable(this);
  }

  setLicensePlate(v: string) {
    this.licensePlate = v;
  }
  setCarModel(v: string) {
    this.carModel = v;
  }
  setCarColor(v: string) {
    this.carColor = v;
  }
  setSelectedVehicleType(v: string) {
    this.selectedVehicleType = v;
  }
  setAdditionalNotes(v: string) {
    this.additionalNotes = v;
  }
  setAgreeToTerms(v: boolean) {
    this.agreeToTerms = v;
  }

  async submit(navigate: (path: string, opts?: { state?: { car?: Car } }) => void): Promise<void> {
    if (!this.licensePlate.trim()) {
      this.error = 'Пожалуйста, введите номер автомобиля';
      return;
    }
    if (!this.agreeToTerms) {
      this.error = 'Пожалуйста, согласитесь с условиями';
      return;
    }
    this.error = '';
    this.isSubmitting = true;

    const carDetails = {
      licensePlate: this.licensePlate,
      carModel: this.carModel,
      carColor: this.carColor,
      vehicleType: this.selectedVehicleType,
      additionalNotes: this.additionalNotes,
      entryTime: new Date().toISOString(),
    };
    localStorage.setItem('carDetails', JSON.stringify(carDetails));

    const token = localStorage.getItem('token');
    if (token) {
      try {
        const res = await carAPI.createCar({
          autoNumber: this.licensePlate.trim(),
          type: this.selectedVehicleType,
          mark: this.carModel.trim(),
          color: this.carColor.trim(),
          notes: this.additionalNotes.trim(),
        });
        runInAction(() => {
          this.isSubmitting = false;
        });
        const savedCar = res.data?.car as Car | undefined;
        navigate('/parking-selection', { state: savedCar ? { car: savedCar } : undefined });
        return;
      } catch (err: unknown) {
        const e = err as { response?: { data?: { error?: string } }; message?: string };
        runInAction(() => {
          this.error = e.response?.data?.error || e.message || 'Ошибка сохранения автомобиля';
          this.isSubmitting = false;
        });
        return;
      }
    }
    runInAction(() => {
      this.isSubmitting = false;
    });
    navigate('/parking-selection');
  }
}

export const carDetailsStore = new CarDetailsStore();
