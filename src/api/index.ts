import axios from 'axios';
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

// Auth API
export const authAPI = {
  login: (credentials: LoginCredentials) => 
    api.post<{ user: User; token: string }>('/auth/login', credentials),
  
  register: (data: RegisterData) => 
    api.post<{ user: User; token: string }>('/auth/register', data),
  
  getMe: () => api.get<{ user: User }>('/auth/me'),
  getProfile: () => api.get<{ user: User; car: import('../types').Car | null }>('/profile'),
  getSelectionContext: () => api.get<{ user: User; car: import('../types').Car | null }>('/selection-context'),
  updateProfile: (data: { name: string }) => api.put<{ user: User }>('/auth/me', data),
  updatePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put<{ message: string }>('/auth/me/password', data),
  
  logout: () => {
    localStorage.removeItem('token');
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
