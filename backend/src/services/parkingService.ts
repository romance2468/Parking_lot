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

function rowToPlace(row: any): ParkingPlace {
  const isFree = row.is_free === true || row.is_free === 't' || row.is_free === 1;
  return {
    id_parking: row.id_parking,
    floor: row.floor ?? 0,
    section: row.section ?? '',
    place_num: row.place_num ?? 0,
    is_free: isFree ? 1 : 0,
    type_parking: row.type_parking ?? 'standard',
  };
}

function rowToSession(row: any): BookingSession {
  const isDone = row.is_done_session === true || row.is_done_session === 't' || row.is_done_session === 1;
  return {
    id_session: row.id_session,
    car_id: row.car_id,
    id_parking: row.id_parking,
    type_parking: row.type_parking ?? 'standard',
    time_start: row.time_start ? new Date(row.time_start).toISOString() : '',
    time_end: row.time_end ? new Date(row.time_end).toISOString() : '',
    price: parseFloat(row.price) || 0,
    is_done_session: isDone ? 1 : 0,
  };
}

export async function getPlaces(floor?: number): Promise<ParkingPlace[]> {
  const pool = dbManager.getPool();
  const result = floor != null
    ? await pool.query('SELECT * FROM parking_places WHERE floor = $1 ORDER BY section, place_num', [floor])
    : await pool.query('SELECT * FROM parking_places ORDER BY floor, section, place_num');
  return (result.rows || []).map(rowToPlace);
}

export async function getPlaceById(idParking: number): Promise<ParkingPlace | null> {
  const pool = dbManager.getPool();
  const result = await pool.query('SELECT * FROM parking_places WHERE id_parking = $1', [idParking]);
  const row = result.rows[0];
  if (!row) return null;
  return rowToPlace(row);
}

export async function setPlaceFree(idParking: number, isFree: boolean): Promise<void> {
  const pool = dbManager.getPool();
  await pool.query('UPDATE parking_places SET is_free = $1 WHERE id_parking = $2', [isFree, idParking]);
}

export async function createBookingSession(
  carId: number,
  idParking: number,
  typeParking: string,
  timeStart: string,
  timeEnd: string,
  price: number
): Promise<BookingSession> {
  const pool = dbManager.getPool();
  const result = await pool.query(
    `INSERT INTO booking_sessions (car_id, id_parking, type_parking, time_start, time_end, price, is_done_session)
     VALUES ($1, $2, $3, $4, $5, $6, false) RETURNING *`,
    [carId, idParking, typeParking, timeStart, timeEnd, price]
  );
  const row = result.rows[0];
  await setPlaceFree(idParking, false);
  return rowToSession(row);
}

export async function getBookingSessionsByCarId(carId: number): Promise<BookingSession[]> {
  const pool = dbManager.getPool();
  const result = await pool.query(
    'SELECT * FROM booking_sessions WHERE car_id = $1 ORDER BY time_start DESC',
    [carId]
  );
  return (result.rows || []).map(rowToSession);
}

export async function completeSession(idSession: number): Promise<void> {
  const pool = dbManager.getPool();
  const getResult = await pool.query('SELECT id_parking FROM booking_sessions WHERE id_session = $1', [idSession]);
  const row = getResult.rows[0];
  if (!row) throw new Error('Сессия не найдена');
  await pool.query('UPDATE booking_sessions SET is_done_session = true WHERE id_session = $1', [idSession]);
  await setPlaceFree(row.id_parking, true);
}
