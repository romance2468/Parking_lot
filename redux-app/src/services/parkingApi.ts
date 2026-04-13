import { baseApi } from '../api/baseApi';
import type { ParkingPlace, BookingSession, CreateBookingDto } from '../types';

/**
 * parkingApi — RTK Query endpoints для парковочных мест и бронирований.
 *
 * Кэширование:
 * - getParkingPlaces кэшируется с тэгом 'Parking'
 * - getSessions кэшируется с тэгом 'Sessions'
 * - После bookParking инвалидируются оба тэга
 *
 * Использование в нескольких компонентах:
 * - Parking.tsx    → список мест + форма бронирования
 * - Sessions.tsx   → история бронирований
 * - UserInfo.tsx   → счётчик активных сессий (используется тот же кэш!)
 * - Profile.tsx    → последние сессии в профиле
 */
export const parkingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ─── GET /api/parking ───────────────────────────────────────────────
    getParkingPlaces: builder.query<ParkingPlace[], void>({
      query: () => '/parking',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id_parking }) => ({
                type: 'Parking' as const,
                id: id_parking,
              })),
              { type: 'Parking', id: 'LIST' },
            ]
          : [{ type: 'Parking', id: 'LIST' }],
      // Парковочные места обновляются часто — храним кэш только 60 сек
      keepUnusedDataFor: 60,
    }),

    // ─── GET /api/parking/sessions ──────────────────────────────────────
    getSessions: builder.query<BookingSession[], void>({
      query: () => '/parking/sessions',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id_session }) => ({
                type: 'Sessions' as const,
                id: id_session,
              })),
              { type: 'Sessions', id: 'LIST' },
            ]
          : [{ type: 'Sessions', id: 'LIST' }],
      keepUnusedDataFor: 120,
    }),

    // ─── POST /api/parking/book ─────────────────────────────────────────
    bookParking: builder.mutation<BookingSession, CreateBookingDto>({
      query: (booking) => ({
        url: '/parking/book',
        method: 'POST',
        body: booking,
      }),
      // После бронирования обновляем список мест (место стало занятым)
      // и список сессий (новая сессия появилась)
      invalidatesTags: [
        { type: 'Parking', id: 'LIST' },
        { type: 'Sessions', id: 'LIST' },
        'Profile',
      ],
    }),

    // ─── POST /api/parking/end/:sessionId ──────────────────────────────
    endSession: builder.mutation<BookingSession, number>({
      query: (sessionId) => ({
        url: `/parking/end/${sessionId}`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, sessionId) => [
        { type: 'Sessions', id: sessionId },
        { type: 'Sessions', id: 'LIST' },
        { type: 'Parking', id: 'LIST' },
        'Profile',
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetParkingPlacesQuery,
  useGetSessionsQuery,
  useBookParkingMutation,
  useEndSessionMutation,
} = parkingApi;
