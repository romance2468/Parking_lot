import { makeAutoObservable, runInAction } from 'mobx';
import { generateBubbles } from '../utils/bubbles';
import { authAPI, carAPI, parkingAPI } from '../api';
import type { BookingSession, Car, User } from '../types';
class ProfileStore {
  bubbles = generateBubbles();

  initBubbles() {
    this.bubbles = generateBubbles();
  }
  user: User | null = null;
  car: Car | null = null;
  loadingUser = true;
  error = '';
  success = '';
  name = '';
  email = '';
  autoNumber = '';
  mark = '';
  color = '';
  selectedVehicleType = 'sedan';
  notes = '';
  savingProfile = false;
  savingCar = false;
  editProfile = false;
  editCar = false;
  editPassword = false;
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  savingPassword = false;
  sessions: BookingSession[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  hydrateFormFromUserAndCar() {
    if (this.user) {
      this.name = this.user.name;
      this.email = this.user.email;
    }
    if (this.car) {
      this.autoNumber = this.car.auto_number || '';
      this.mark = this.car.mark || '';
      this.color = this.car.color || '';
      this.selectedVehicleType = this.car.type || 'sedan';
      this.notes = this.car.notes || '';
    } else {
      this.autoNumber = '';
      this.mark = '';
      this.color = '';
      this.selectedVehicleType = 'sedan';
      this.notes = '';
    }
  }

  async loadProfile(): Promise<'ok' | 'unauthorized' | 'error'> {
    this.loadingUser = true;
    this.error = '';
    const token = localStorage.getItem('token');
    if (!token) {
      runInAction(() => {
        this.loadingUser = false;
      });
      return 'unauthorized';
    }
    try {
      const res = await authAPI.getProfile();
      const d = res?.data;
      if (!d?.user) {
        runInAction(() => {
          this.error = 'Некорректный ответ сервера';
          this.loadingUser = false;
        });
        return 'error';
      }
      const u: User = { id: d.user.id, name: d.user.name, email: d.user.email, role: 'user' };
      const rawCar = d.car as Record<string, unknown> | null | undefined;
      const c: Car | null =
        rawCar && (rawCar.id != null || rawCar.auto_number != null)
          ? {
              id: Number(rawCar.id),
              user_id: Number(rawCar.user_id ?? rawCar.userId ?? 0),
              type: String(rawCar.type ?? 'sedan'),
              mark: String(rawCar.mark ?? ''),
              auto_number: String(rawCar.auto_number ?? rawCar.autoNumber ?? ''),
              color: String(rawCar.color ?? ''),
              notes: String(rawCar.notes ?? ''),
              created_at: String(rawCar.created_at ?? rawCar.createdAt ?? ''),
            }
          : null;
      let sessionsList: BookingSession[] = [];
      try {
        const bookingsRes = await parkingAPI.getMyBookings();
        sessionsList = bookingsRes?.data?.sessions ?? [];
      } catch {
        sessionsList = [];
      }
      runInAction(() => {
        this.user = u;
        this.car = c;
        this.sessions = sessionsList;
        this.hydrateFormFromUserAndCar();
        this.loadingUser = false;
      });
      return 'ok';
    } catch (err: unknown) {
      const e = err as { response?: { status?: number; data?: { error?: string } } };
      if (e.response?.status === 401) {
        runInAction(() => {
          this.loadingUser = false;
        });
        return 'unauthorized';
      }
      runInAction(() => {
        this.error = e.response?.data?.error || (err as Error).message || 'Ошибка загрузки профиля';
        this.loadingUser = false;
      });
      return 'error';
    }
  }

  async saveProfile(): Promise<void> {
    this.error = '';
    this.success = '';
    this.savingProfile = true;
    try {
      await authAPI.updateProfile({ name: this.name.trim() });
      runInAction(() => {
        if (this.user) {
          this.user = { ...this.user, name: this.name.trim() };
          localStorage.setItem('user', JSON.stringify({ ...this.user, name: this.name.trim() }));
        }
        this.success = 'Данные профиля сохранены';
        this.editProfile = false;
      });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      runInAction(() => {
        this.error = e.response?.data?.error || 'Ошибка сохранения';
      });
    } finally {
      runInAction(() => {
        this.savingProfile = false;
      });
    }
  }

  cancelProfileEdit() {
    if (this.user) this.name = this.user.name;
    this.editProfile = false;
  }

  async saveCar(): Promise<void> {
    if (!this.autoNumber.trim()) {
      this.error = 'Введите номер автомобиля';
      return;
    }
    this.error = '';
    this.success = '';
    this.savingCar = true;
    try {
      const carData = {
        autoNumber: this.autoNumber.trim(),
        type: this.selectedVehicleType,
        mark: this.mark.trim(),
        color: this.color.trim(),
        notes: this.notes.trim(),
      };
      if (this.car) {
        await carAPI.updateCar(this.car.id, carData);
      } else {
        await carAPI.createCar(carData);
      }
      const carRes = await carAPI.getCar();
      runInAction(() => {
        this.success = 'Данные автомобиля сохранены';
        this.car = carRes.data?.car ? ({ ...carRes.data.car } as Car) : null;
        this.hydrateFormFromUserAndCar();
        this.editCar = false;
      });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      runInAction(() => {
        this.error = e.response?.data?.error || 'Ошибка сохранения автомобиля';
      });
    } finally {
      runInAction(() => {
        this.savingCar = false;
      });
    }
  }

  cancelCarEdit() {
    this.hydrateFormFromUserAndCar();
    this.editCar = false;
  }

  async savePassword(): Promise<void> {
    if (this.newPassword.length < 6) {
      this.error = 'Новый пароль не менее 6 символов';
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.error = 'Пароли не совпадают';
      return;
    }
    this.error = '';
    this.success = '';
    this.savingPassword = true;
    try {
      await authAPI.updatePassword({ currentPassword: this.currentPassword, newPassword: this.newPassword });
      runInAction(() => {
        this.success = 'Пароль успешно изменён';
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        this.editPassword = false;
      });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      runInAction(() => {
        this.error = e.response?.data?.error || 'Ошибка смены пароля';
      });
    } finally {
      runInAction(() => {
        this.savingPassword = false;
      });
    }
  }

  cancelPasswordEdit() {
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.editPassword = false;
  }

  openEditProfile() {
    this.editCar = false;
    this.editProfile = true;
  }

  openEditCar() {
    this.editProfile = false;
    this.editCar = true;
  }

  openEditPassword() {
    this.editProfile = false;
    this.editCar = false;
    this.editPassword = true;
  }

  setName(v: string) {
    this.name = v;
  }
  setAutoNumber(v: string) {
    this.autoNumber = v;
  }
  setMark(v: string) {
    this.mark = v;
  }
  setColor(v: string) {
    this.color = v;
  }
  setSelectedVehicleType(v: string) {
    this.selectedVehicleType = v;
  }
  setNotes(v: string) {
    this.notes = v;
  }
  setCurrentPassword(v: string) {
    this.currentPassword = v;
  }
  setNewPassword(v: string) {
    this.newPassword = v;
  }
  setConfirmPassword(v: string) {
    this.confirmPassword = v;
  }
}

export const profileStore = new ProfileStore();
