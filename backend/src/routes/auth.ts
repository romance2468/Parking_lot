import { Router, Request, Response } from 'express';
import { AuthService } from '../services/auth/authService';
import { verifyToken } from '../config/auth';

const router = Router();
const authService = new AuthService();

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Пожалуйста, заполните все поля' });
    }

    const { user, token, refreshToken } = await authService.register(name, email, password);
    console.log('[auth] Регистрация:', user.user_email);

    res.status(201).json({
      message: 'Регистрация успешна',
      user: {
        id: user.id,
        name: user.user_name,
        email: user.user_email
      },
      token,
      refreshToken
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

    const { user, token, refreshToken } = await authService.login(email, password);
    console.log('[auth] Вход:', user.user_email);

    res.json({
      message: 'Авторизация успешна',
      user: {
        id: user.id,
        name: user.user_name,
        email: user.user_email
      },
      token,
      refreshToken
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'Передайте refreshToken в теле запроса' });
    }
    const { token, refreshToken: newRefresh } = await authService.refreshAccessToken(refreshToken);
    res.json({ token, refreshToken: newRefresh });
  } catch (error: any) {
    res.status(401).json({ error: error.message || 'Не удалось обновить сессию' });
  }
});

router.post('/logout', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const token = AuthService.extractTokenFromHeader(authHeader);
    const payload = verifyToken(token);
    await authService.revokeRefreshTokensForUser(payload.userId);
    res.json({ message: 'Выход выполнен' });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

router.get('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const token = AuthService.extractTokenFromHeader(authHeader);
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

router.put('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const token = AuthService.extractTokenFromHeader(authHeader);
    const payload = verifyToken(token);
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Имя не может быть пустым' });
    }

    const user = await authService.updateUserName(payload.userId, name.trim());
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

router.put('/me/password', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const token = AuthService.extractTokenFromHeader(authHeader);
    const payload = verifyToken(token);
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Введите текущий и новый пароль' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Новый пароль не менее 6 символов' });
    }

    await authService.updatePassword(payload.userId, currentPassword, newPassword);
    res.json({ message: 'Пароль успешно изменён' });
  } catch (error: any) {
    if (error.message === 'Неверный текущий пароль') {
      return res.status(400).json({ error: error.message });
    }
    res.status(401).json({ error: error.message });
  }
});

export default router;
