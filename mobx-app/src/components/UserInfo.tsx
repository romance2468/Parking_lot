import React from 'react';
import { observer } from 'mobx-react-lite';
import {
  Card, CardContent, Typography, Box, Chip, Divider, CircularProgress,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import { useStore } from '../context/StoreContext';

/**
 * UserInfo — компонент карточки пользователя.
 *
 * ════════════════════════════════════════════════════════════════════════
 * КЛЮЧЕВОЙ ПРИМЕР: данные используются в нескольких частях приложения
 * ════════════════════════════════════════════════════════════════════════
 *
 * Этот компонент observer() подписан на:
 * - authStore.user           → имя и email пользователя
 * - authStore.loading        → состояние загрузки
 * - carsStore.carsCount      → computed: количество авто
 * - parkingStore.activeSessions → computed: активные бронирования
 * - parkingStore.totalSpent  → computed: суммарные расходы
 *
 * Используется В ДВУХ МЕСТАХ:
 * 1. Profile.tsx  — в левой колонке страницы профиля
 * 2. Parking.tsx  — как мини-карточка рядом с формой бронирования
 *
 * В обоих случаях компонент читает ТЕ ЖЕ observable из сторов.
 * MobX автоматически перерисует UserInfo только когда изменится
 * один из прочитанных observables — никаких лишних рендеров!
 *
 * Кэш: все три стора уже загружены к моменту рендера UserInfo
 * (Profile запрашивает данные в useEffect → все сторы заполнены).
 * UserInfo просто ЧИТАЕТ из памяти, без HTTP-запросов.
 */
const UserInfo: React.FC = observer(() => {
  const { authStore, carsStore, parkingStore } = useStore();

  if (authStore.loading) return <CircularProgress size={24} />;
  if (!authStore.user) return null;

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <PersonIcon sx={{ mr: 1, color: 'success.main' }} />
          {/* authStore.user.name — observable: перерисуется при изменении имени */}
          <Typography variant="h6">{authStore.user.name}</Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          📧 {authStore.user.email}
        </Typography>

        {authStore.user.created_at && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            📅 Зарегистрирован:{' '}
            {new Date(authStore.user.created_at).toLocaleDateString('ru-RU')}
          </Typography>
        )}

        <Divider sx={{ my: 1.5 }} />

        {/* Статистика — computed значения из разных сторов */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {/* carsStore.carsCount — computed, пересчитывается при изменении cars[] */}
          <Chip
            icon={<DirectionsCarIcon />}
            label={`Авто: ${carsStore.carsCount}`}
            size="small"
            color="primary"
            variant="outlined"
          />

          {/* parkingStore.activeSessions — computed из sessions[] */}
          <Chip
            icon={<LocalParkingIcon />}
            label={`Активных: ${parkingStore.activeSessions.length}`}
            size="small"
            color={parkingStore.activeSessions.length > 0 ? 'success' : 'default'}
            variant="outlined"
          />

          {/* carsStore.hasElectricCar — computed */}
          {carsStore.hasElectricCar && (
            <Chip
              label="⚡ Есть электро"
              size="small"
              color="info"
              variant="outlined"
            />
          )}
        </Box>

        {/* parkingStore.totalSpent — computed: сумма всех price */}
        {parkingStore.sessions.length > 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            💰 Потрачено: {parkingStore.totalSpent.toFixed(2)} ₽
          </Typography>
        )}
      </CardContent>
    </Card>
  );
});

export default UserInfo;
