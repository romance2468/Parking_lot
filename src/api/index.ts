import axios from 'axios';
import { LoginCredentials, RegisterData, User, ParkingSpot, Reservation } from '../types';

const API_URL = 'http://localhost/api';

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
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

// Parking API
export const parkingAPI = {
  getSpots: () => api.get<ParkingSpot[]>('/parking/spots'),
  
  getSpotsByFloor: (floor: number) => 
    api.get<ParkingSpot[]>(`/parking/spots?floor=${floor}`),
};