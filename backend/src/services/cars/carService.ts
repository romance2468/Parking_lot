import { dbManager } from '../../config/database';

export interface Car {
  id: number;
  user_id: number;
  type: string;
  mark: string;
  auto_number: string;
  color: string;
  notes: string;
  created_at: string;
}

export type VehicleType = 'sedan' | 'suv' | 'hatchback' | 'electric';

export class CarService {
  private get pool() {
    return dbManager.getPool();
  }

  async createCar(
    userId: number,
    autoNumber: string,
    type: VehicleType,
    mark: string,
    color: string,
    notes: string
  ): Promise<Car> {
    const result = await this.pool.query(
      `INSERT INTO cars (user_id, auto_number, type, mark, color, notes)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, user_id, type, mark, auto_number, color, notes, created_at`,
      [userId, autoNumber, type, mark || '', color || '', notes || '']
    );
    const row = result.rows[0];
    return {
      id: row.id,
      user_id: row.user_id,
      type: row.type,
      mark: row.mark || '',
      auto_number: row.auto_number,
      color: row.color || '',
      notes: row.notes || '',
      created_at: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString()
    };
  }

  async getCarByUserId(userId: number): Promise<Car | null> {
    const result = await this.pool.query('SELECT * FROM cars WHERE user_id = $1', [userId]);
    const row = result.rows[0];
    if (!row) return null;
    return {
      id: row.id,
      user_id: row.user_id,
      type: row.type || 'sedan',
      mark: row.mark || '',
      auto_number: row.auto_number || '',
      color: row.color || '',
      notes: row.notes || '',
      created_at: row.created_at ? new Date(row.created_at).toISOString() : ''
    };
  }

  async updateCar(
    carId: number,
    userId: number,
    autoNumber: string,
    type: VehicleType,
    mark: string,
    color: string,
    notes: string
  ): Promise<Car> {
    const result = await this.pool.query(
      `UPDATE cars SET auto_number = $1, type = $2, mark = $3, color = $4, notes = $5
       WHERE id = $6 AND user_id = $7`,
      [autoNumber, type, mark || '', color || '', notes || '', carId, userId]
    );
    if (result.rowCount === 0) {
      throw new Error('Автомобиль не найден или не принадлежит пользователю');
    }
    const updated = await this.getCarByUserId(userId);
    if (!updated) throw new Error('Автомобиль не найден');
    return { ...updated, id: carId, type, mark, auto_number: autoNumber, color, notes };
  }

  async deleteCar(carId: number, userId: number): Promise<void> {
    const result = await this.pool.query('DELETE FROM cars WHERE id = $1 AND user_id = $2', [carId, userId]);
    if (result.rowCount === 0) {
      throw new Error('Автомобиль не найден или не принадлежит пользователю');
    }
  }
}
