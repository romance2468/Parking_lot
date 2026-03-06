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

      const createParkingPlacesTable = `
        CREATE TABLE IF NOT EXISTS parking_places (
          id_parking INTEGER PRIMARY KEY AUTOINCREMENT,
          floor INTEGER NOT NULL,
          section TEXT NOT NULL,
          place_num INTEGER NOT NULL,
          is_free INTEGER NOT NULL DEFAULT 1,
          type_parking TEXT NOT NULL DEFAULT 'standard'
        )
      `;

      const createBookingSessionsTable = `
        CREATE TABLE IF NOT EXISTS booking_sessions (
          id_session INTEGER PRIMARY KEY AUTOINCREMENT,
          car_id INTEGER NOT NULL,
          id_parking INTEGER NOT NULL,
          type_parking TEXT NOT NULL,
          time_start DATETIME NOT NULL,
          time_end DATETIME NOT NULL,
          price REAL NOT NULL,
          is_done_session INTEGER NOT NULL DEFAULT 0,
          FOREIGN KEY (car_id) REFERENCES cars(id),
          FOREIGN KEY (id_parking) REFERENCES parking_places(id_parking)
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

      this.db.run(createParkingPlacesTable, (err) => {
        if (err) {
          console.error('Ошибка создания таблицы parking_places:', err.message);
        } else {
          console.log('Таблица parking_places готова');
        }
      });

      this.db.run(createBookingSessionsTable, (err) => {
        if (err) {
          console.error('Ошибка создания таблицы booking_sessions:', err.message);
        } else {
          console.log('Таблица booking_sessions готова');
        }
      });

      this.seedParkingPlacesIfEmpty();
    });
  }

  private seedParkingPlacesIfEmpty(): void {
    this.db.get('SELECT COUNT(*) as cnt FROM parking_places', [], (err, row: { cnt: number }) => {
      if (err || !row || row.cnt > 0) return;
      const sections = ['A', 'B', 'C', 'D', 'E'];
      const types: Array<'standard' | 'electric' | 'handicap'> = ['standard', 'standard', 'standard', 'electric', 'handicap'];
      for (let floor = 1; floor <= 4; floor++) {
        for (let s = 0; s < sections.length; s++) {
          const section = sections[s];
          const typeParking = types[s];
          for (let place = 1; place <= 8; place++) {
            this.db.run(
              'INSERT INTO parking_places (floor, section, place_num, is_free, type_parking) VALUES (?, ?, ?, 1, ?)',
              [floor, section, place, typeParking]
            );
          }
        }
      }
      console.log('Добавлены тестовые парковочные места');
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
