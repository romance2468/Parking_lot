import { makeAutoObservable, runInAction } from 'mobx';
import { authAPI } from '../api';
import type { LoginCredentials } from '../types';
import { generateBubbles } from '../utils/bubbles';

class LoginStore {
  email = '';
  password = '';
  error = '';
  rememberMe = false;
  loading = false;
  loginSuccess: { token: string; refreshToken: string; user?: unknown } | null = null;
  bubbles = generateBubbles();

  constructor() {
    makeAutoObservable(this);
    const remembered = localStorage.getItem('rememberedEmail');
    if (remembered) {
      this.email = remembered;
      this.rememberMe = true;
    }
  }

  setEmail(v: string) {
    this.email = v;
  }

  setPassword(v: string) {
    this.password = v;
  }

  setRememberMe(v: boolean) {
    this.rememberMe = v;
  }

  async submit(): Promise<void> {
    if (!this.email || !this.password) {
      this.error = 'Пожалуйста, заполните все поля';
      return;
    }
    this.loading = true;
    this.error = '';
    try {
      const credentials: LoginCredentials = { email: this.email, password: this.password };
      const response = await authAPI.login(credentials);
      const token = response.data?.token;
      const refreshToken = response.data?.refreshToken;
      const userData = response.data?.user;
      if (!token || !refreshToken) {
        runInAction(() => {
          this.error = 'Ошибка входа: не получены токены';
          this.loading = false;
        });
        return;
      }
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      if (userData) {
        localStorage.setItem('user', JSON.stringify(userData));
      }
      if (this.rememberMe) {
        localStorage.setItem('rememberedEmail', this.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      runInAction(() => {
        this.loading = false;
        this.loginSuccess = { token, refreshToken, user: userData };
      });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      runInAction(() => {
        this.loading = false;
        this.error = e.response?.data?.error || 'Неверный email или пароль';
      });
    }
  }

  clearLoginSuccess() {
    this.loginSuccess = null;
  }
}

export const loginStore = new LoginStore();
