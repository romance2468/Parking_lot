import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { dbManager } from '../../config/database';
import { JwtPayload, JWT_SECRET, JWT_EXPIRES_IN } from '../../config/auth';

const REFRESH_TOKEN_DAYS = Math.max(1, parseInt(process.env.REFRESH_TOKEN_DAYS || '7', 10));

export interface User {
  id: number;
  user_name: string;
  user_email: string;
  password_hash: string;
  created_at: string;
}

export class AuthService {
  private get pool() {
    return dbManager.getPool();
  }

  
  private generateToken(payload: JwtPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
  }

  private hashRefreshToken(raw: string): string {
    return crypto.createHash('sha256').update(raw, 'utf8').digest('hex');
  }

  private generateRawRefreshToken(): string {
    return crypto.randomBytes(48).toString('base64url');
  }

  /** Сохраняет хеш refresh-токена, возвращает сырой токен для клиента */
  private async createRefreshTokenForUser(userId: number): Promise<string> {
    const raw = this.generateRawRefreshToken();
    const tokenHash = this.hashRefreshToken(raw);
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);
    await this.pool.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
      [userId, tokenHash, expiresAt]
    );
    return raw;
  }

  /**
   * Обновление access по refresh-токену (ротация: старый refresh удаляется, выдаётся новый).
   */
  async refreshAccessToken(rawRefreshToken: string): Promise<{ token: string; refreshToken: string }> {
    if (!rawRefreshToken || typeof rawRefreshToken !== 'string') {
      throw new Error('Refresh token обязателен');
    }
    const tokenHash = this.hashRefreshToken(rawRefreshToken);
    const result = await this.pool.query(
      `DELETE FROM refresh_tokens WHERE token_hash = $1 AND expires_at > NOW() RETURNING user_id`,
      [tokenHash]
    );
    const row = result.rows[0];
    if (!row) {
      throw new Error('Недействительный или истёкший refresh token');
    }
    const userId = row.user_id as number;
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('Пользователь не найден');
    }
    const token = this.generateToken({ userId: user.id, email: user.user_email });
    const refreshToken = await this.createRefreshTokenForUser(user.id);
    return { token, refreshToken };
  }

  async revokeRefreshTokensForUser(userId: number): Promise<void> {
    await this.pool.query(`DELETE FROM refresh_tokens WHERE user_id = $1`, [userId]);
  }

  async register(name: string, email: string, password: string): Promise<{ user: User; token: string; refreshToken: string }> {
    const existing = await this.pool.query('SELECT id FROM users WHERE user_email = $1', [email]);
    if (existing.rows.length > 0) {
      throw new Error('Пользователь с таким email уже существует');
    }
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const result = await this.pool.query(
      'INSERT INTO users (user_name, user_email, password_hash) VALUES ($1, $2, $3) RETURNING id, user_name, user_email, password_hash, created_at',
      [name, email, passwordHash]
    );
    const row = result.rows[0];
    const newUser: User = {
      id: row.id,
      user_name: row.user_name,
      user_email: row.user_email,
      password_hash: passwordHash,
      created_at: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString()
    };
    const token = this.generateToken({ userId: newUser.id, email: newUser.user_email });
    const refreshToken = await this.createRefreshTokenForUser(newUser.id);
    return { user: newUser, token, refreshToken };
  }

  async login(email: string, password: string): Promise<{ user: User; token: string; refreshToken: string }> {
    const result = await this.pool.query('SELECT * FROM users WHERE user_email = $1', [email]);
    const row = result.rows[0];
    if (!row) {
      throw new Error('Неверный email или пароль');
    }
    const storedHash = row.password_hash;
    if (!storedHash || typeof storedHash !== 'string') {
      throw new Error('Ошибка данных пользователя');
    }
    const isPasswordValid = await bcrypt.compare(password, storedHash);
    if (!isPasswordValid) {
      throw new Error('Неверный email или пароль');
    }
    const user: User = {
      id: row.id,
      user_name: row.user_name,
      user_email: row.user_email,
      password_hash: storedHash,
      created_at: row.created_at ? new Date(row.created_at).toISOString() : ''
    };
    const token = this.generateToken({ userId: row.id, email: user.user_email });
    const refreshToken = await this.createRefreshTokenForUser(user.id);
    return { user, token, refreshToken };
  }

  async getUserById(userId: number): Promise<User | null> {
    const result = await this.pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    const row = result.rows[0];
    if (!row) return null;
    return {
      id: row.id,
      user_name: row.user_name,
      user_email: row.user_email,
      password_hash: row.password_hash,
      created_at: row.created_at ? new Date(row.created_at).toISOString() : ''
    };
  }

  async updateUserName(userId: number, name: string): Promise<User | null> {
    const result = await this.pool.query('UPDATE users SET user_name = $1 WHERE id = $2 RETURNING id', [name, userId]);
    if (result.rowCount === 0) return null;
    const user = await this.getUserById(userId);
    return user;
  }

  async updatePassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
    const result = await this.pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    const row = result.rows[0];
    if (!row) throw new Error('Пользователь не найден');
    const storedHash = row.password_hash;
    if (!storedHash) throw new Error('Ошибка данных пользователя');
    const valid = await bcrypt.compare(currentPassword, storedHash);
    if (!valid) throw new Error('Неверный текущий пароль');
    const newHash = await bcrypt.hash(newPassword, 10);
    await this.pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, userId]);
  }

  /** Извлекает JWT из заголовка `Authorization: Bearer <token>` */
  static extractTokenFromHeader(authHeader: string | undefined): string {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Invalid authorization header');
    }
    return authHeader.substring(7);
  }
}
