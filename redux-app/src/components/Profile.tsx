import React from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Divider,
  CircularProgress, Alert, Button, List, ListItem, ListItemText, Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useGetProfileQuery, useUpdateProfileMutation } from '../services/authApi';
import { useGetCarsQuery } from '../services/carsApi';
import { useGetSessionsQuery } from '../services/parkingApi';
import { useGetFullProfileQuery } from '../services/profileApi';
import UserInfo from './UserInfo';

/**
 * Profile — страница профиля пользователя.
 *
 * ════════════════════════════════════════════════════════════════════════
 * ДЕМОНСТРАЦИЯ: один вид данных (User) используется в нескольких местах
 * ════════════════════════════════════════════════════════════════════════
 *
 * На этой странице данные User используются в:
 * 1. <UserInfo /> — компонент карточки (тоже вызывает useGetProfileQuery)
 * 2. Прямо здесь — для отображения email и имени в заголовке
 * 3. В Header.tsx — отображает user.name в навигации
 *
 * Все три места вызывают useGetProfileQuery() / используют store.auth.user,
 * но HTTP-запрос делается ТОЛЬКО ОДИН РАЗ. Остальные читают из кэша RTK Query!
 *
 * Порядок загрузки:
 * 1. Profile монтируется → useGetProfileQuery() → HTTP GET /api/auth/profile
 * 2. <UserInfo /> монтируется → useGetProfileQuery() → кэш HIT (нет HTTP!)
 * 3. Header уже показывает user.name из authSlice (localStorage)
 */
const Profile: React.FC = () => {
  const navigate = useNavigate();

  // ── Запрос 1: данные текущего пользователя (кэш: тэг 'User') ──────────
  const { data: user, isLoading: userLoading, error: userError } = useGetProfileQuery();

  // ── Запрос 2: список автомобилей (кэш: тэг 'Cars') ────────────────────
  const { data: cars = [], isLoading: carsLoading } = useGetCarsQuery();

  // ── Запрос 3: история сессий (кэш: тэг 'Sessions') ────────────────────
  const { data: sessions = [], isLoading: sessionsLoading } = useGetSessionsQuery();

  // ── Запрос 4: полный профиль (объединённые данные, кэш: тэг 'Profile') ─
  const { data: fullProfile } = useGetFullProfileQuery();

  const [updateProfile, { isLoading: updating }] = useUpdateProfileMutation();

  const isLoading = userLoading || carsLoading || sessionsLoading;

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (userError) {
    return <Alert severity="error" sx={{ m: 3 }}>Ошибка загрузки профиля</Alert>;
  }

  const recentSessions = sessions.slice(0, 5);
  const activeSessions = sessions.filter((s) => !s.time_end);

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Профиль пользователя
      </Typography>

      <Grid container spacing={3}>
        {/* ── Левая колонка: UserInfo ────────────────────────────────── */}
        <Grid item xs={12} md={4}>
          {/**
           * UserInfo тоже вызывает useGetProfileQuery(), useGetCarsQuery(),
           * useGetSessionsQuery() — но все данные уже в кэше!
           * HTTP запросов больше не будет.
           */}
          <UserInfo />

          {/* Дополнительная инфо о пользователе прямо здесь */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                📋 Данные аккаунта
              </Typography>
              <Typography variant="body2">Имя: <strong>{user?.name}</strong></Typography>
              <Typography variant="body2">Email: <strong>{user?.email}</strong></Typography>
              <Typography variant="body2">ID: <strong>#{user?.id}</strong></Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* ── Правая колонка: Автомобили и Сессии ───────────────────── */}
        <Grid item xs={12} md={8}>
          {/* Автомобили */}
          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  🚗 Мои автомобили ({cars.length})
                </Typography>
                <Button size="small" onClick={() => navigate('/cars')}>
                  Управление
                </Button>
              </Box>
              {cars.length === 0 ? (
                <Typography color="text.secondary">Автомобили не добавлены</Typography>
              ) : (
                <List dense>
                  {cars.map((car) => (
                    <ListItem key={car.id}>
                      <ListItemText
                        primary={`${car.mark} — ${car.auto_number}`}
                        secondary={`${car.type} · ${car.color}`}
                      />
                      <Chip label={car.type} size="small" />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>

          {/* Активные сессии */}
          {activeSessions.length > 0 && (
            <Card variant="outlined" sx={{ mb: 2, borderColor: 'success.main' }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold" color="success.main">
                  🟢 Активные бронирования ({activeSessions.length})
                </Typography>
                <List dense>
                  {activeSessions.map((s) => (
                    <ListItem key={s.id_session}>
                      <ListItemText
                        primary={`Место #${s.id_parking} · Авто #${s.car_id}`}
                        secondary={`Начало: ${new Date(s.time_start).toLocaleString('ru-RU')}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}

          {/* Последние сессии */}
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  📅 Последние бронирования
                </Typography>
                <Button size="small" onClick={() => navigate('/parking')}>
                  Все сессии
                </Button>
              </Box>
              {recentSessions.length === 0 ? (
                <Typography color="text.secondary">Нет истории бронирований</Typography>
              ) : (
                <List dense>
                  {recentSessions.map((s) => (
                    <ListItem key={s.id_session}>
                      <ListItemText
                        primary={`Место #${s.id_parking} · ${s.price} ₽`}
                        secondary={new Date(s.time_start).toLocaleString('ru-RU')}
                      />
                      <Chip
                        label={s.time_end ? 'Завершено' : 'Активно'}
                        color={s.time_end ? 'default' : 'success'}
                        size="small"
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;
