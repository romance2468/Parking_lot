import React from 'react';
import {
  Card, CardContent, Typography, Box, Chip, Divider, CircularProgress, Alert,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import { useGetProfileQuery } from '../services/authApi';
import { useGetCarsQuery } from '../services/carsApi';
import { useGetSessionsQuery } from '../services/parkingApi';

/**
 * UserInfo — компонент карточки пользователя с дополнительной информацией.
 *
 * ════════════════════════════════════════════════════════════════════════
 * КЛЮЧЕВОЙ ПРИМЕР: данные используются в нескольких частях приложения
 * ════════════════════════════════════════════════════════════════════════
 *
 * Этот компонент используется В ДВУХ МЕСТАХ:
 *   1. На странице Profile.tsx   — как полная карточка профиля
 *   2. На странице Parking.tsx   — как мини-информация о владельце
 *
 * При этом ВСЕ три хука (useGetProfileQuery, useGetCarsQuery, useGetSessionsQuery)
 * возвращают ЗАКЭШИРОВАННЫЕ данные — HTTP-запросы уже были сделаны в Profile,
 * и UserInfo просто читает из Redux store без дополнительных запросов!
 *
 * Схема кэша RTK Query в Redux store:
 *   store['api']['queries']['getProfile(undefined)']  → { data: User, status: 'fulfilled' }
 *   store['api']['queries']['getCars(undefined)']     → { data: Car[], status: 'fulfilled' }
 *   store['api']['queries']['getSessions(undefined)'] → { data: Session[], status: 'fulfilled' }
 */
const UserInfo: React.FC = () => {
  // Все три хука читают из кэша — нет дополнительных HTTP запросов!
  const { data: user, isLoading: userLoading, error: userError } = useGetProfileQuery();
  const { data: cars = [], isLoading: carsLoading } = useGetCarsQuery();
  const { data: sessions = [], isLoading: sessionsLoading } = useGetSessionsQuery();

  const isLoading = userLoading || carsLoading || sessionsLoading;

  // Вычисляемые данные из закэшированных результатов
  const activeSessions = sessions.filter((s) => !s.time_end);
  const totalSpent = sessions.reduce((sum, s) => sum + s.price, 0);
  const electricCars = cars.filter((c) => c.type === 'electric');

  if (isLoading) return <CircularProgress size={24} />;
  if (userError) return <Alert severity="error">Не удалось загрузить данные пользователя</Alert>;
  if (!user) return null;

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">{user.name}</Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          📧 {user.email}
        </Typography>

        {user.created_at && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            📅 Зарегистрирован: {new Date(user.created_at).toLocaleDateString('ru-RU')}
          </Typography>
        )}

        <Divider sx={{ my: 1.5 }} />

        {/* Статистика — данные из трёх разных кэшей RTK Query */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            icon={<DirectionsCarIcon />}
            label={`Авто: ${cars.length}`}
            size="small"
            color="primary"
            variant="outlined"
          />
          <Chip
            icon={<LocalParkingIcon />}
            label={`Сессий: ${sessions.length}`}
            size="small"
            color="secondary"
            variant="outlined"
          />
          {activeSessions.length > 0 && (
            <Chip
              label={`🟢 Активных: ${activeSessions.length}`}
              size="small"
              color="success"
            />
          )}
          {electricCars.length > 0 && (
            <Chip
              label={`⚡ Электро: ${electricCars.length}`}
              size="small"
              color="info"
              variant="outlined"
            />
          )}
        </Box>

        {sessions.length > 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            💰 Потрачено всего: {totalSpent.toFixed(2)} ₽
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default UserInfo;
