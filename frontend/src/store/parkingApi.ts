import { createApi } from '@reduxjs/toolkit/query/react';
import type { BookingSession, Car, LoginCredentials, ParkingPlace, RegisterData, User } from '../types';
import { baseQueryWithReauth } from './baseQueryWithReauth';

export type LoginResponse = { user: User; token: string; refreshToken: string };
export type ProfileResponse = { user: User; car: Car | null };
export type PlacesResponse = { places: ParkingPlace[] };
export type BookingsResponse = { sessions: BookingSession[] };

export const parkingApi = createApi({
  reducerPath: 'parkingApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Profile', 'Car', 'Bookings', 'ParkingPlaces', 'SelectionContext'],
  keepUnusedDataFor: 120,
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginCredentials>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),

    register: builder.mutation<LoginResponse, RegisterData>({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
    }),

    logout: builder.mutation<void, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
    }),

    getProfile: builder.query<ProfileResponse, void>({
      query: () => '/profile',
      providesTags: (result) =>
        result
          ? [
              { type: 'Profile' as const, id: 'ME' },
              { type: 'Car' as const, id: 'ME' },
            ]
          : [{ type: 'Profile' as const, id: 'ME' }],
    }),

    getSelectionContext: builder.query<ProfileResponse, void>({
      query: () => '/selection-context',
      providesTags: [{ type: 'SelectionContext', id: 'CTX' }],
    }),

    updateProfile: builder.mutation<{ user: User }, { name: string }>({
      query: (body) => ({ url: '/auth/me', method: 'PUT', body }),
      invalidatesTags: [{ type: 'Profile', id: 'ME' }],
    }),

    updatePassword: builder.mutation<{ message: string }, { currentPassword: string; newPassword: string }>({
      query: (body) => ({ url: '/auth/me/password', method: 'PUT', body }),
    }),

    getCar: builder.query<{ car: Car }, void>({
      query: () => '/cars',
      providesTags: [{ type: 'Car', id: 'ME' }],
    }),

    createCar: builder.mutation<
      { message: string; car: Car },
      { autoNumber: string; type: string; mark: string; color: string; notes: string }
    >({
      query: (body) => ({ url: '/cars', method: 'POST', body }),
      invalidatesTags: [{ type: 'Car', id: 'ME' }, { type: 'Profile', id: 'ME' }, { type: 'SelectionContext', id: 'CTX' }],
    }),

    updateCar: builder.mutation<
      unknown,
      { carId: number; body: { autoNumber: string; type: string; mark: string; color: string; notes: string } }
    >({
      query: ({ carId, body }) => ({ url: `/cars/${carId}`, method: 'PUT', body }),
      invalidatesTags: [{ type: 'Car', id: 'ME' }, { type: 'Profile', id: 'ME' }, { type: 'SelectionContext', id: 'CTX' }],
    }),

    deleteCar: builder.mutation<void, number>({
      query: (carId) => ({ url: `/cars/${carId}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Car', id: 'ME' }, { type: 'Profile', id: 'ME' }],
    }),

    getPlaces: builder.query<PlacesResponse, number | void>({
      query: (floor) =>
        floor != null ? `/parking/places?floor=${floor}` : '/parking/places',
      providesTags: (result, err, floor) => [{ type: 'ParkingPlaces' as const, id: floor ?? 'all' }],
    }),

    getPlace: builder.query<ParkingPlace, number>({
      query: (id) => `/parking/places/${id}`,
    }),

    getMyBookings: builder.query<BookingsResponse, void>({
      query: () => '/parking/booking',
      providesTags: [{ type: 'Bookings', id: 'LIST' }],
    }),

    createBooking: builder.mutation<
      { session: BookingSession },
      {
        car_id: number;
        id_parking: number;
        type_parking: string;
        time_start: string;
        time_end: string;
        price: number;
      }
    >({
      query: (body) => ({ url: '/parking/booking', method: 'POST', body }),
      invalidatesTags: [
        { type: 'Bookings', id: 'LIST' },
        { type: 'ParkingPlaces', id: '1' },
        { type: 'ParkingPlaces', id: '2' },
        { type: 'ParkingPlaces', id: 'all' },
        { type: 'Profile', id: 'ME' },
      ],
    }),

    completeBooking: builder.mutation<void, number>({
      query: (idSession) => ({ url: `/parking/booking/${idSession}/done`, method: 'PATCH' }),
      invalidatesTags: [{ type: 'Bookings', id: 'LIST' }, { type: 'ParkingPlaces', id: '1' }, { type: 'ParkingPlaces', id: '2' }],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetProfileQuery,
  useGetSelectionContextQuery,
  useUpdateProfileMutation,
  useUpdatePasswordMutation,
  useGetCarQuery,
  useCreateCarMutation,
  useUpdateCarMutation,
  useDeleteCarMutation,
  useGetPlacesQuery,
  useGetPlaceQuery,
  useGetMyBookingsQuery,
  useCreateBookingMutation,
  useCompleteBookingMutation,
} = parkingApi;
