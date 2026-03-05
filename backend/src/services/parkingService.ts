import { dbManager } from '../config/database';

export type TypeParking = 'standard' | 'electric' | 'handicap' | 'Электрозарядка' | 'для инвалидов' | 'стандартная';

export interface ParkingPlace {
  id_parking: number;
  floor: number;
  section: string;
  place_num: number;
  is_free: number;
  type_parking: string;
}

export interface BookingSession {
  id_session: number;
  car_id: number;
  id_parking: number;
  type_parking: string;
  time_start: string;
  time_end: string;
  price: number;
  is_done_session: number;
}

const db = dbManager.getDb();

function rowToPlace(row: any): ParkingPlace {
  return {
    id_parking: row.id_parking ?? row.ID_PARKING,
    floor: row.floor ?? row.FLOOR ?? 0,
    section: row.section ?? row.SECTION ?? '',
    place_num: row.place_num ?? row.PLACE_NUM ?? 0,
    is_free: row.is_free ?? row.IS_FREE ?? 1,
    type_parking: row.type_parking ?? row.TYPE_PARKING ?? 'standard',
  };
}

function rowToSession(row: any): BookingSession {
  return {
    id_session: row.id_session ?? row.ID_SESSION,
    car_id: row.car_id ?? row.CAR_ID,
    id_parking: row.id_parking ?? row.ID_PARKING,
    type_parking: row.type_parking ?? row.TYPE_PARKING ?? 'standard',
    time_start: row.time_start ?? row.TIME_START ?? '',
    time_end: row.time_end ?? row.TIME_END ?? '',
    price: row.price ?? row.PRICE ?? 0,
    is_done_session: row.is_done_session ?? row.IS_DONE_SESSION ?? 0,
  };
}

export async function getPlaces(floor?: number): Promise<ParkingPlace[]> {
  return new Promise((resolve, reject) => {
    const sql = floor != null
      ? 'SELECT * FROM parking_places WHERE floor = ? ORDER BY section, place_num'
      : 'SELECT * FROM parking_places ORDER BY floor, section, place_num';
    const params = floor != null ? [floor] : [];
    db.all(sql, params, (err, rows: any[] = []) => {
      if (err) return reject(err);
      resolve((rows || []).map(rowToPlace));
    });
  });
}

export async function getPlaceById(idParking: number): Promise<ParkingPlace | null> {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM parking_places WHERE id_parking = ?', [idParking], (err, row: any) => {
      if (err) return reject(err);
      if (!row) return resolve(null);
      resolve(rowToPlace(row));
    });
  });
}

export async function setPlaceFree(idParking: number, isFree: boolean): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run('UPDATE parking_places SET is_free = ? WHERE id_parking = ?', [isFree ? 1 : 0, idParking], function (err) {
      if (err) return reject(err);
      resolve();
    });
  });
}

export async function createBookingSession(
  carId: number,
  idParking: number,
  typeParking: string,
  timeStart: string,
  timeEnd: string,
  price: number
): Promise<BookingSession> {
  const db = dbManager.getDb();
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO booking_sessions (car_id, id_parking, type_parking, time_start, time_end, price, is_done_session)
       VALUES (?, ?, ?, ?, ?, ?, 0)`,
      [carId, idParking, typeParking, timeStart, timeEnd, price],
      function (err: Error | null) {
        if (err) return reject(err);
        const idSession = (this as any).lastID;
        setPlaceFree(idParking, false).then(() => {
          db.get('SELECT * FROM booking_sessions WHERE id_session = ?', [idSession], (e, row: any) => {
            if (e) return reject(e);
            resolve(rowToSession(row));
          });
        }).catch(reject);
      }
    );
  });
}

export async function getBookingSessionsByCarId(carId: number): Promise<BookingSession[]> {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM booking_sessions WHERE car_id = ? ORDER BY time_start DESC',
      [carId],
      (err, rows: any[] = []) => {
        if (err) return reject(err);
        resolve((rows || []).map(rowToSession));
      }
    );
  });
}

export async function completeSession(idSession: number): Promise<void> {
  return new Promise((resolve, reject) => {
    db.get('SELECT id_parking FROM booking_sessions WHERE id_session = ?', [idSession], (err, row: any) => {
      if (err) return reject(err);
      if (!row) return reject(new Error('Сессия не найдена'));
      const idParking = row.id_parking ?? row.ID_PARKING;
      db.run('UPDATE booking_sessions SET is_done_session = 1 WHERE id_session = ?', [idSession], async (e) => {
        if (e) return reject(e);
        await setPlaceFree(idParking, true);
        resolve();
      });
    });
  });
}
