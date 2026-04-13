import { Router, Request, Response } from 'express';
import { AuthService } from '../services/auth/authService';
import { verifyToken } from '../config/auth';
import { getSelectionContext } from '../services/selection-context/selectionContextService';

const router = Router();

const authenticateToken = (req: Request, res: Response, next: any) => {
  try {
    const authHeader = req.headers.authorization;
    const token = AuthService.extractTokenFromHeader(authHeader);
    const payload = verifyToken(token);
    if (!req.body) req.body = {};
    req.body.userId = payload.userId;
    next();
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
};

/**
 * GET /api/selection-context — контекст для страницы выбора парковки (пользователь + автомобиль).
 * Сразу после регистрации и ввода авто данные подтягиваются сюда для подстановки типа авто.
 */
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.body.userId as number;
    if (!userId) return res.status(401).json({ error: 'Не указан пользователь' });
    const data = await getSelectionContext(userId);
    res.json(data);
  } catch (error: any) {
    if (error.message === 'Пользователь не найден') return res.status(404).json({ error: error.message });
    res.status(500).json({ error: error.message });
  }
});

export default router;
