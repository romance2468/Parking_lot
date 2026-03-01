import { Router, Request, Response } from 'express';
import { CarService, VehicleType } from '../services/carService';
import { verifyToken, extractTokenFromHeader } from '../config/auth';

const router = Router();
const carService = new CarService();

// Middleware для проверки аутентификации (GET-запросы не имеют body — инициализируем при необходимости)
const authenticateToken = (req: Request, res: Response, next: any) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);
    const payload = verifyToken(token);
    if (!req.body) req.body = {};
    req.body.userId = payload.userId;
    next();
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
};

// Создание автомобиля
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.body.userId;
    const { autoNumber, type, mark, color, notes } = req.body;

    if (!autoNumber || !type) {
      return res.status(400).json({ error: 'Номер автомобиля и тип автомобиля обязательны' });
    }

    const car = await carService.createCar(
      userId,
      autoNumber,
      type as VehicleType,
      mark || '',
      color || '',
      notes || ''
    );

    res.status(201).json({
      message: 'Автомобиль успешно добавлен',
      car
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Получение автомобиля пользователя
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.body.userId;
    const car = await carService.getCarByUserId(userId);
    
    if (!car) {
      return res.status(404).json({ error: 'Автомобиль не найден' });
    }

    res.json({ car });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Обновление автомобиля
router.put('/:carId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.body.userId;
    const carId = parseInt(req.params.carId as string);
    const { autoNumber, type, mark, color, notes } = req.body;

    if (!autoNumber || !type) {
      return res.status(400).json({ error: 'Номер автомобиля и тип автомобиля обязательны' });
    }

    const car = await carService.updateCar(
      carId,
      userId,
      autoNumber,
      type as VehicleType,
      mark || '',
      color || '',
      notes || ''
    );

    res.json({
      message: 'Автомобиль успешно обновлен',
      car
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Удаление автомобиля
router.delete('/:carId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.body.userId;
    const carId = parseInt(req.params.carId as string);

    await carService.deleteCar(carId, userId);

    res.json({ message: 'Автомобиль успешно удален' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;