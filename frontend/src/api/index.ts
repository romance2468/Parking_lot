import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { LoginCredentials, RegisterData, User, ParkingPlace, BookingSession } from '../types';

// В production за nginx: относительный /api, nginx проксирует на бэкенд
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

type QueueItem = {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
};

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else if (token) p.resolve(token);
    else p.reject(new Error('No token'));
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const originalRequest = err.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = err.response?.status;
    const url = originalRequest?.url || '';

    if (status !== 401 || originalRequest?._retry) {
      return Promise.reject(err);
    }
    if (url.includes('/auth/refresh') || url.includes('/auth/login') || url.includes('/auth/register')) {
      return Promise.reject(err);
    }

    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      return Promise.reject(err);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(api(originalRequest));
          },
          reject,
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post<{ token: string; refreshToken: string }>(
        `${API_URL}/auth/refresh`,
        { refreshToken },
        { headers: { 'Content-Type': 'application/json' } }
      );
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      processQueue(null, data.token);
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${data.token}`;
      }
      return api(originalRequest);
    } catch (refreshErr) {
      processQueue(refreshErr, null);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
);

// Auth API
export const authAPI = {
  login: (credentials: LoginCredentials) =>
    api.post<{ user: User; token: string; refreshToken: string }>('/auth/login', credentials),

  register: (data: RegisterData) =>
    api.post<{ user: User; token: string; refreshToken: string }>('/auth/register', data),

  refresh: (refreshToken: string) =>
    axios.post<{ token: string; refreshToken: string }>(`${API_URL}/auth/refresh`, { refreshToken }),

  getMe: () => api.get<{ user: User }>('/auth/me'),
  getProfile: () => api.get<{ user: User; car: import('../types').Car | null }>('/profile'),
  getSelectionContext: () => api.get<{ user: User; car: import('../types').Car | null }>('/selection-context'),
  updateProfile: (data: { name: string }) => api.put<{ user: User }>('/auth/me', data),
  updatePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put<{ message: string }>('/auth/me/password', data),

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      /* сеть / уже 401 — всё равно чистим локально */
    }
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },
};

// Car API
export const carAPI = {
  createCar: (carData: { autoNumber: string; type: string; mark: string; color: string; notes: string }) =>
    api.post('/cars', carData),
  getCar: () => api.get<{ car: import('../types').Car }>('/cars'),
  updateCar: (carId: number, carData: { autoNumber: string; type: string; mark: string; color: string; notes: string }) =>
    api.put(`/cars/${carId}`, carData),
  deleteCar: (carId: number) => api.delete(`/cars/${carId}`),
};

// Parking API
export const parkingAPI = {
  getPlaces: (floor?: number) =>
    floor != null ? api.get<{ places: ParkingPlace[] }>(`/parking/places?floor=${floor}`) : api.get<{ places: ParkingPlace[] }>('/parking/places'),
  getPlace: (id: number) => api.get<ParkingPlace>(`/parking/places/${id}`),
  createBooking: (data: { car_id: number; id_parking: number; type_parking: string; time_start: string; time_end: string; price: number }) =>
    api.post<{ session: BookingSession }>('/parking/booking', data),
  getMyBookings: () => api.get<{ sessions: BookingSession[] }>('/parking/booking'),
  completeBooking: (idSession: number) => api.patch(`/parking/booking/${idSession}/done`),
};
