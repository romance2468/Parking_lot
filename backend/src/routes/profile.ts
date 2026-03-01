import { Router, Request, Response } from 'express';
import { verifyToken, extractTokenFromHeader } from '../config/auth';
import { getProfileData } from '../services/profileService';

const router = Router();

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

/**
 * GET /api/profile — данные профиля (пользователь + автомобиль по user_id).
 * Ответ с гарантированной структурой: { user: { id, name, email }, car: { ... } | null }.
 */
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.body.userId as number;
    if (!userId) {
      return res.status(401).json({ error: 'Не указан пользователь' });
    }
    const data = await getProfileData(userId);
    res.json(data);
  } catch (error: any) {
    if (error.message === 'Пользователь не найден') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

export default router;
