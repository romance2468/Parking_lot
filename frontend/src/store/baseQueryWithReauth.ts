import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

function isAuthPath(url: string) {
  return (
    url.includes('auth/refresh') ||
    url.includes('auth/login') ||
    url.includes('auth/register')
  );
}

export const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  let result = await rawBaseQuery(args, api, extraOptions);
  const err = result.error as FetchBaseQueryError | undefined;
  if (err?.status !== 401) {
    return result;
  }

  const url = typeof args === 'string' ? args : args.url || '';
  if (isAuthPath(url)) {
    return result;
  }

  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    return result;
  }

  const refreshResult = await rawBaseQuery(
    {
      url: '/auth/refresh',
      method: 'POST',
      body: { refreshToken },
    },
    api,
    extraOptions
  );

  if (refreshResult.data) {
    const data = refreshResult.data as { token: string; refreshToken: string };
    localStorage.setItem('token', data.token);
    localStorage.setItem('refreshToken', data.refreshToken);
    result = await rawBaseQuery(args, api, extraOptions);
  } else {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  return result;
};
