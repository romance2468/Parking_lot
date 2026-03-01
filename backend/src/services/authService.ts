import bcrypt from 'bcryptjs';
import { dbManager } from '../config/database';
import { generateToken } from '../config/auth';

export interface User {
  id: number;
  user_name: string;
  user_email: string;
  password_hash: string;
  created_at: string;
}

export class AuthService {
  private db = dbManager.getDb();

  async register(name: string, email: string, password: string): Promise<{ user: User; token: string }> {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM users WHERE user_email = ?', [email], async (err, row: User) => {
        if (err) {
          return reject(err);
        }
        if (row) {
          return reject(new Error('Пользователь с таким email уже существует'));
        }

        try {
          const saltRounds = 10;
          const passwordHash = await bcrypt.hash(password, saltRounds);

          this.db.run(
            'INSERT INTO users (user_name, user_email, password_hash) VALUES (?, ?, ?)',
            [name, email, passwordHash],
            function (err) {
              if (err) {
                return reject(err);
              }

              const newUser: User = {
                id: this.lastID,
                user_name: name,
                user_email: email,
                password_hash: passwordHash,
                created_at: new Date().toISOString()
              };

              const token = generateToken({ userId: newUser.id, email: newUser.user_email });
              resolve({ user: newUser, token });
            }
          );
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM users WHERE user_email = ?', [email], async (err, row: any) => {
        if (err) {
          return reject(err);
        }
        if (!row) {
          return reject(new Error('Неверный email или пароль'));
        }

        // SQLite может вернуть колонки в разном регистре — подстраховка
        const storedHash =
          row.password_hash ??
          row['password_hash'] ??
          row.PASSWORD_HASH ??
          row['PASSWORD_HASH'];
        if (!storedHash || typeof storedHash !== 'string') {
          return reject(new Error('Ошибка данных пользователя'));
        }

        try {
          const isPasswordValid = await bcrypt.compare(password, storedHash);
          if (!isPasswordValid) {
            return reject(new Error('Неверный email или пароль'));
          }

          const user: User = {
            id: row.id,
            user_name: row.user_name ?? row.USER_NAME ?? '',
            user_email: row.user_email ?? row.USER_EMAIL ?? '',
            password_hash: storedHash,
            created_at: row.created_at ?? row.CREATED_AT ?? ''
          };
          const token = generateToken({ userId: row.id, email: user.user_email });
          resolve({ user, token });
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  async getUserById(userId: number): Promise<User | null> {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM users WHERE id = ?', [userId], (err, row: User) => {
        if (err) {
          return reject(err);
        }
        resolve(row || null);
      });
    });
  }

  async updateUserName(userId: number, name: string): Promise<User | null> {
    const db = this.db;
    return new Promise((resolve, reject) => {
      db.run('UPDATE users SET user_name = ? WHERE id = ?', [name, userId], function (err) {
        if (err) {
          return reject(err);
        }
        if (this.changes === 0) {
          return resolve(null);
        }
        db.get('SELECT * FROM users WHERE id = ?', [userId], (err, row: User) => {
          if (err) return reject(err);
          resolve(row || null);
        });
      });
    });
  }

  async updatePassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
    const db = this.db;
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE id = ?', [userId], async (err, row: User) => {
        if (err) return reject(err);
        if (!row) return reject(new Error('Пользователь не найден'));
        const storedHash = row.password_hash ?? (row as any).PASSWORD_HASH;
        if (!storedHash) return reject(new Error('Ошибка данных пользователя'));
        const valid = await bcrypt.compare(currentPassword, storedHash);
        if (!valid) return reject(new Error('Неверный текущий пароль'));
        const saltRounds = 10;
        const newHash = await bcrypt.hash(newPassword, saltRounds);
        db.run('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, userId], function (err) {
          if (err) return reject(err);
          resolve();
        });
      });
    });
  }
}
