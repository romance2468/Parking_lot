import { AuthService } from './authService';
import { CarService } from './carService';
import { Car } from './carService';

export interface ProfileUser {
  id: number;
  name: string;
  email: string;
}

export interface ProfileCar {
  id: number;
  user_id: number;
  type: string;
  mark: string;
  auto_number: string;
  color: string;
  notes: string;
  created_at: string;
}

export interface ProfileData {
  user: ProfileUser;
  car: ProfileCar | null;
}

const authService = new AuthService();
const carService = new CarService();

function normalizeCar(row: Car): ProfileCar {
  return {
    id: Number(row.id),
    user_id: Number(row.user_id),
    type: String(row.type ?? 'sedan'),
    mark: String(row.mark ?? ''),
    auto_number: String(row.auto_number ?? ''),
    color: String(row.color ?? ''),
    notes: String(row.notes ?? ''),
    created_at: String(row.created_at ?? '')
  };
}

/**
 * Загружает данные профиля: пользователь и автомобиль (cars.user_id = userId).
 * Гарантирует загрузку обоих: пользователь обязателен, автомобиль — если есть в БД.
 * Возвращает структуру с проверенными полями (id, name, email у user; у car — все поля).
 */
export async function getProfileData(userId: number): Promise<ProfileData> {
  const user = await authService.getUserById(userId);
  if (!user) {
    throw new Error('Пользователь не найден');
  }
  const profileUser: ProfileUser = {
    id: user.id,
    name: String(user.user_name ?? ''),
    email: String(user.user_email ?? '')
  };
  let car: ProfileCar | null = null;
  const carRow = await carService.getCarByUserId(userId);
  if (carRow) {
    car = normalizeCar(carRow);
  }
  return { user: profileUser, car };
}
