import sqlite3 from 'sqlite3';
import path from 'path';
import { Database } from 'sqlite3';

const DB_PATH = path.join(__dirname, '..', '..', '..', 'parking.db');

class DatabaseManager {
  private db: Database;

  constructor() {
    this.db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Ошибка подключения к базе данных:', err.message);
      } else {
        console.log('Подключено к базе данных SQLite');
        this.db.run('PRAGMA foreign_keys = ON');
        this.initTables();
      }
    });
  }

  private initTables(): void {
    this.db.serialize(() => {
      const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_name TEXT NOT NULL,
          user_email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `;

      const createCarsTable = `
        CREATE TABLE IF NOT EXISTS cars (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          type TEXT NOT NULL,
          mark TEXT,
          auto_number TEXT NOT NULL,
          color TEXT,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `;

      this.db.run(createUsersTable, (err) => {
        if (err) {
          console.error('Ошибка создания таблицы users:', err.message);
        } else {
          console.log('Таблица users готова');
        }
      });

      this.db.run(createCarsTable, (err) => {
        if (err) {
          console.error('Ошибка создания таблицы cars:', err.message);
        } else {
          console.log('Таблица cars готова');
        }
      });
    });
  }

  public getDb(): Database {
    return this.db;
  }

  public close(): void {
    this.db.close((err) => {
      if (err) {
        console.error('Ошибка закрытия базы данных:', err.message);
      } else {
        console.log('Соединение с базой данных закрыто');
      }
    });
  }
}

export const dbManager = new DatabaseManager();
export default dbManager;
