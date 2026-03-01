// User types
export interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'operator' | 'user';
  createdAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

// Car types
export interface Car {
  id: number;
  user_id: number;
  type: string;
  mark: string;
  auto_number: string;
  color: string;
  notes: string;
  created_at: string;
}

// Parking types
export interface ParkingSpot {
  id: number;
  spotNumber: string;
  status: 'free' | 'occupied' | 'reserved';
  floor: number;
  type: 'standard' | 'handicap' | 'electric';
}

export interface Reservation {
  id: number;
  userId: number;
  spotId: number;
  startTime: string;
  endTime: string;
  status: 'active' | 'completed' | 'cancelled';
  vehicleNumber: string;
}
