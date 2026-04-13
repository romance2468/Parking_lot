import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.PGHOST || process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.PGPORT || process.env.DB_PORT || '5432', 10),
  user: process.env.PGUSER || process.env.DB_USER || 'postgres',
  password: process.env.PGPASSWORD || process.env.DB_PASSWORD || 'postgres',
  database: process.env.PGDATABASE || process.env.DB_NAME || 'parking',
});

class DatabaseManager {
  private pool: Pool = pool;
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;
    try {
      await this.pool.query('SELECT 1');
      await this.initTables();
      await this.seedParkingPlacesIfEmpty();
      this.initialized = true;
      console.log('Подключено к PostgreSQL');
    } catch (err: any) {
      console.error('Ошибка подключения к PostgreSQL:', err.message);
      throw err;
    }
  }

  private async initTables(): Promise<void> {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        user_name TEXT NOT NULL,
        user_email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Таблица users готова');

    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS cars (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        type TEXT NOT NULL,
        mark TEXT,
        auto_number TEXT NOT NULL,
        color TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Таблица cars готова');

    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS parking_places (
        id_parking SERIAL PRIMARY KEY,
        floor INTEGER NOT NULL,
        section TEXT NOT NULL,
        place_num INTEGER NOT NULL,
        is_free BOOLEAN NOT NULL DEFAULT true,
        type_parking TEXT NOT NULL DEFAULT 'standard'
      )
    `);
    console.log('Таблица parking_places готова');

    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS booking_sessions (
        id_session SERIAL PRIMARY KEY,
        car_id INTEGER NOT NULL REFERENCES cars(id),
        id_parking INTEGER NOT NULL REFERENCES parking_places(id_parking),
        type_parking TEXT NOT NULL,
        time_start TIMESTAMP NOT NULL,
        time_end TIMESTAMP NOT NULL,
        price REAL NOT NULL,
        is_done_session BOOLEAN NOT NULL DEFAULT false
      )
    `);
    console.log('Таблица booking_sessions готова');

    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash TEXT NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await this.pool.query(`
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id)
    `);
    console.log('Таблица refresh_tokens готова');
  }

  private async seedParkingPlacesIfEmpty(): Promise<void> {
    const r = await this.pool.query('SELECT COUNT(*)::int as cnt FROM parking_places');
    if (r.rows[0]?.cnt > 0) return;
    const sections = ['A', 'B', 'C', 'D', 'E'];
    const types: Array<'standard' | 'electric' | 'handicap'> = ['standard', 'standard', 'standard', 'electric', 'handicap'];
    for (let floor = 1; floor <= 4; floor++) {
      for (let s = 0; s < sections.length; s++) {
        const section = sections[s];
        const typeParking = types[s];
        for (let place = 1; place <= 8; place++) {
          await this.pool.query(
            'INSERT INTO parking_places (floor, section, place_num, is_free, type_parking) VALUES ($1, $2, $3, true, $4)',
            [floor, section, place, typeParking]
          );
        }
      }
    }
    console.log('Добавлены тестовые парковочные места');
  }

  getPool(): Pool {
    return this.pool;
  }

  async close(): Promise<void> {
    await this.pool.end();
    console.log('Соединение с PostgreSQL закрыто');
  }
}

export const dbManager = new DatabaseManager();
export default dbManager;
