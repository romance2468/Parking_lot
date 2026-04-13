import axios from 'axios';

/**
 * axiosInstance — базовый экземпляр axios для MobX-приложения.
 *
 * Интерцептор запросов автоматически добавляет JWT-токен
 * из localStorage к каждому запросу.
 *
 * Интерцептор ответов обрабатывает 401 Unauthorized:
 * очищает токен и перенаправляет на /login.
 */
const axiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Интерцептор запросов: добавляем Authorization header ────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Интерцептор ответов: обрабатываем 401 ───────────────────────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
