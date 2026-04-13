// ===== Пользователь =====
export interface User {
  id: number;
  name: string;
  email: string;
  created_at?: string;
}

// ===== Аутентификация =====
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

// ===== Автомобили =====
export type CarType = 'sedan' | 'suv' | 'hatchback' | 'electric';

export interface Car {
  id: number;
  user_id: number;
  type: CarType;
  mark: string;
  auto_number: string;
  color: string;
  notes?: string;
  created_at: string;
}

export interface CreateCarDto {
  type: CarType;
  mark: string;
  auto_number: string;
  color: string;
  notes?: string;
}

// ===== Парковочные места =====
export type ParkingType = 'standard' | 'electric' | 'handicap';

export interface ParkingPlace {
  id_parking: number;
  floor: number;
  section: string;
  place_num: number;
  is_free: boolean;
  type_parking: ParkingType;
}

// ===== Сессии бронирования =====
export interface BookingSession {
  id_session: number;
  car_id: number;
  id_parking: number;
  time_start: string;
  time_end?: string;
  price: number;
}

export interface CreateBookingDto {
  car_id: number;
  id_parking: number;
}

// ===== Полный профиль =====
export interface FullProfile {
  user: User;
  cars: Car[];
  sessions: BookingSession[];
}
