import { makeAutoObservable, runInAction } from 'mobx';
import { authAPI } from '../api';
import type { RegisterData } from '../types';
import { generateBubbles } from '../utils/bubbles';

class RegisterStore {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  error = '';
  success = false;
  loading = false;
  bubbles = generateBubbles();

  constructor() {
    makeAutoObservable(this);
  }

  setName(v: string) {
    this.name = v;
  }
  setEmail(v: string) {
    this.email = v;
  }
  setPassword(v: string) {
    this.password = v;
  }
  setConfirmPassword(v: string) {
    this.confirmPassword = v;
  }

  async submit(): Promise<{ token: string; refreshToken: string; userId: number } | null> {
    if (!this.name || !this.email || !this.password || !this.confirmPassword) {
      this.error = 'Пожалуйста, заполните все поля';
      return null;
    }
    if (this.password !== this.confirmPassword) {
      this.error = 'Пароли не совпадают';
      return null;
    }
    if (this.password.length < 6) {
      this.error = 'Пароль должен быть не менее 6 символов';
      return null;
    }
    this.loading = true;
    this.error = '';
    try {
      const credentials: RegisterData = {
        email: this.email,
        password: this.password,
        name: this.name,
      };
      const response = await authAPI.register(credentials);
      const { token, refreshToken, user } = response.data;
      if (!token || !refreshToken || !user?.id) {
        runInAction(() => {
          this.error = 'Ошибка: не получены данные пользователя';
          this.loading = false;
        });
        return null;
      }
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      runInAction(() => {
        this.loading = false;
        this.success = true;
      });
      return { token, refreshToken, userId: user.id };
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      runInAction(() => {
        this.loading = false;
        this.error = e.response?.data?.error || 'Ошибка регистрации';
      });
      return null;
    }
  }
}

export const registerStore = new RegisterStore();
