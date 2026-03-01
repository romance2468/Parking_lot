import { Router, Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { verifyToken, extractTokenFromHeader } from '../config/auth';

const router = Router();
const authService = new AuthService();

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Пожалуйста, заполните все поля' });
    }

    const { user, token } = await authService.register(name, email, password);
    
    res.status(201).json({
      message: 'Регистрация успешна',
      user: {
        id: user.id,
        name: user.user_name,
        email: user.user_email
      },
      token
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Пожалуйста, заполните все поля' });
    }

    const { user, token } = await authService.login(email, password);
    
    res.json({
      message: 'Авторизация успешна',
      user: {
        id: user.id,
        name: user.user_name,
        email: user.user_email
      },
      token
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);
    const payload = verifyToken(token);
    
    const user = await authService.getUserById(payload.userId);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json({
      user: {
        id: user.id,
        name: user.user_name,
        email: user.user_email
      }
    });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

export default router;
