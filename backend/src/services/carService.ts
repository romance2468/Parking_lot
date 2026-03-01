import { dbManager } from '../config/database';

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
  private db = dbManager.getDb();

  async createCar(
    userId: number,
    autoNumber: string,
    type: VehicleType,
    mark: string,
    color: string,
    notes: string
  ): Promise<Car> {
    return new Promise((resolve, reject) => {
      const db = this.db;
      db.run(
        `INSERT INTO cars (user_id, auto_number, type, mark, color, notes) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, autoNumber, type, mark || '', color || '', notes || ''],
        function (err: Error | null) {
          if (err) {
            return reject(err);
          }

          const newCar: Car = {
            id: this.lastID,
            user_id: userId,
            type,
            mark: mark || '',
            auto_number: autoNumber,
            color: color || '',
            notes: notes || '',
            created_at: new Date().toISOString()
          };

          resolve(newCar);
        }
      );
    });
  }

  async getCarByUserId(userId: number): Promise<Car | null> {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM cars WHERE user_id = ?', [userId], (err, row: any) => {
        if (err) {
          return reject(err);
        }
        if (!row) {
          return resolve(null);
        }
        const car: Car = {
          id: row.id ?? row.ID,
          user_id: row.user_id ?? row.USER_ID ?? userId,
          type: row.type ?? row.TYPE ?? 'sedan',
          mark: row.mark ?? row.MARK ?? '',
          auto_number: row.auto_number ?? row.AUTO_NUMBER ?? '',
          color: row.color ?? row.COLOR ?? '',
          notes: row.notes ?? row.NOTES ?? '',
          created_at: row.created_at ?? row.CREATED_AT ?? new Date().toISOString()
        };
        resolve(car);
      });
    });
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
    return new Promise((resolve, reject) => {
      this.db.run(
        `UPDATE cars SET auto_number = ?, type = ?, mark = ?, color = ?, notes = ?
         WHERE id = ? AND user_id = ?`,
        [autoNumber, type, mark || '', color || '', notes || '', carId, userId],
        function (err) {
          if (err) {
            return reject(err);
          }

          if (this.changes === 0) {
            return reject(new Error('Автомобиль не найден или не принадлежит пользователю'));
          }

          const updatedCar: Car = {
            id: carId,
            user_id: userId,
            type,
            mark: mark || '',
            auto_number: autoNumber,
            color: color || '',
            notes: notes || '',
            created_at: new Date().toISOString()
          };

          resolve(updatedCar);
        }
      );
    });
  }

  async deleteCar(carId: number, userId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const db = this.db;
      db.run('DELETE FROM cars WHERE id = ? AND user_id = ?', [carId, userId], function (err) {
        if (err) {
          return reject(err);
        }
        if (this.changes === 0) {
          return reject(new Error('Автомобиль не найден или не принадлежит пользователю'));
        }
        resolve();
      });
    });
  }
}
