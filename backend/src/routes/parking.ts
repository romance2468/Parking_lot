import { Router, Request, Response } from 'express';
import { verifyToken, extractTokenFromHeader } from '../config/auth';
import * as parkingService from '../services/parkingService';
import { CarService } from '../services/carService';

const router = Router();
const carService = new CarService();

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

// Список парковочных мест (опционально по этажу) — без авторизации для выбора места
router.get('/places', (req: Request, res: Response) => {
  const floor = req.query.floor != null ? parseInt(String(req.query.floor), 10) : undefined;
  if (floor != null && isNaN(floor)) {
    return res.status(400).json({ error: 'floor должен быть числом' });
  }
  parkingService.getPlaces(floor)
    .then((places) => res.json({ places }))
    .catch((err) => res.status(500).json({ error: err.message }));
});

// Одно место по id
router.get('/places/:id', (req: Request, res: Response) => {
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) return res.status(400).json({ error: 'Некорректный id' });
  parkingService.getPlaceById(id)
    .then((place) => {
      if (!place) return res.status(404).json({ error: 'Место не найдено' });
      res.json(place);
    })
    .catch((err) => res.status(500).json({ error: err.message }));
});

// Создать сессию бронирования (авторизация обязательна: нужен car_id пользователя)
router.post('/booking', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.body.userId;
    const { car_id, id_parking, type_parking, time_start, time_end, price } = req.body;

    if (car_id == null || id_parking == null || !time_start || !time_end || price == null) {
      return res.status(400).json({ error: 'Укажите car_id, id_parking, type_parking, time_start, time_end, price' });
    }

    const car = await carService.getCarByUserId(userId);
    if (!car || car.id !== Number(car_id)) {
      return res.status(403).json({ error: 'Автомобиль не принадлежит пользователю' });
    }

    const place = await parkingService.getPlaceById(Number(id_parking));
    if (!place) return res.status(404).json({ error: 'Парковочное место не найдено' });
    if (place.is_free !== 1) return res.status(400).json({ error: 'Место уже занято' });

    const session = await parkingService.createBookingSession(
      Number(car_id),
      Number(id_parking),
      type_parking || place.type_parking,
      time_start,
      time_end,
      Number(price)
    );
    res.status(201).json({ session });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Сессии бронирования пользователя (по его машинам)
router.get('/booking', authenticateToken, (req: Request, res: Response) => {
  const userId = req.body?.userId as number | undefined;
  if (userId == null) return res.status(401).json({ error: 'Не авторизован' });

  carService.getCarByUserId(userId)
    .then((car) => {
      if (!car) return [];
      return parkingService.getBookingSessionsByCarId(car.id);
    })
    .then((sessions) => res.json({ sessions: sessions ?? [] }))
    .catch((err) => res.status(500).json({ error: err.message }));
});

// Завершить сессию
router.patch('/booking/:id/done', authenticateToken, (req: Request, res: Response) => {
  const idSession = parseInt(String(req.params.id), 10);
  if (isNaN(idSession)) return res.status(400).json({ error: 'Некорректный id сессии' });
  parkingService.completeSession(idSession)
    .then(() => res.json({ message: 'Сессия завершена' }))
    .catch((err) => res.status(500).json({ error: err.message }));
});

export default router;
