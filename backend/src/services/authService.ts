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
      this.db.get('SELECT * FROM users WHERE user_email = ?', [email], async (err, row: User) => {
        if (err) {
          return reject(err);
        }
        if (!row) {
          return reject(new Error('Неверный email или пароль'));
        }

        try {
          const isPasswordValid = await bcrypt.compare(password, row.password_hash);
          if (!isPasswordValid) {
            return reject(new Error('Неверный email или пароль'));
          }

          const token = generateToken({ userId: row.id, email: row.user_email });
          resolve({ user: row, token });
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
}
