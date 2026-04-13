import { baseApi } from '../api/baseApi';
import type { Car, CreateCarDto } from '../types';

/**
 * carsApi — RTK Query endpoints для управления автомобилями.
 *
 * Кэширование:
 * - getCars кэшируется с тэгом 'Cars'
 * - addCar и deleteCar инвалидируют 'Cars' → список перезапрашивается автоматически
 *
 * Использование в нескольких компонентах:
 * - Cars.tsx        → полный список автомобилей
 * - Profile.tsx     → краткий список в профиле
 * - UserInfo.tsx    → счётчик автомобилей пользователя
 * - ParkingSelect   → выбор авто при бронировании
 */
export const carsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ─── GET /api/cars ──────────────────────────────────────────────────
    getCars: builder.query<Car[], void>({
      query: () => '/cars',
      providesTags: (result) =>
        result
          ? [
              // Индивидуальные тэги для каждого авто + общий тэг 'Cars'
              ...result.map(({ id }) => ({ type: 'Cars' as const, id })),
              { type: 'Cars', id: 'LIST' },
            ]
          : [{ type: 'Cars', id: 'LIST' }],
      keepUnusedDataFor: 300,
    }),

    // ─── GET /api/cars/:id ──────────────────────────────────────────────
    getCarById: builder.query<Car, number>({
      query: (id) => `/cars/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Cars', id }],
    }),

    // ─── POST /api/cars ─────────────────────────────────────────────────
    addCar: builder.mutation<Car, CreateCarDto>({
      query: (car) => ({
        url: '/cars',
        method: 'POST',
        body: car,
      }),
      // Инвалидируем список — getCars перезапросится автоматически
      invalidatesTags: [{ type: 'Cars', id: 'LIST' }, 'Profile'],
    }),

    // ─── DELETE /api/cars/:id ───────────────────────────────────────────
    deleteCar: builder.mutation<void, number>({
      query: (id) => ({
        url: `/cars/${id}`,
        method: 'DELETE',
      }),
      // Инвалидируем конкретное авто + список
      invalidatesTags: (_result, _error, id) => [
        { type: 'Cars', id },
        { type: 'Cars', id: 'LIST' },
        'Profile',
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCarsQuery,
  useGetCarByIdQuery,
  useAddCarMutation,
  useDeleteCarMutation,
} = carsApi;
