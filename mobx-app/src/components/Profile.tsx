import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Box, Typography, Card, CardContent, Divider,
  CircularProgress, Alert, Button, List, ListItem,
  ListItemText, Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import UserInfo from './UserInfo';

/**
 * Profile — страница профиля (MobX-версия).
 *
 * ════════════════════════════════════════════════════════════════════════
 * ДЕМОНСТРАЦИЯ: один вид данных используется в нескольких местах
 * ════════════════════════════════════════════════════════════════════════
 *
 * observer() подписывается на observable, прочитанные внутри компонента:
 * - authStore.user          → имя, email в заголовке и карточке
 * - authStore.loading       → индикатор загрузки
 * - carsStore.cars          → список автомобилей
 * - carsStore.loading       → загрузка авто
 * - parkingStore.sessions   → история бронирований
 * - parkingStore.activeSessions → computed: активные бронирования
 *
 * authStore.user используется ТАКЖЕ в:
 * - <UserInfo /> ниже       → та же ссылка на authStore.user
 * - Header.tsx              → authStore.user.name в навигации
 *
 * Схема MobX реактивности:
 * 1. authStore.login() → runInAction → this.user = {...}
 * 2. MobX Proxy фиксирует изменение user
 * 3. ВСЕ observer-компоненты, читающие authStore.user, перерисуются:
 *    Header, Profile, UserInfo — одновременно, точечно
 *
 * Кэширование (TTL):
 * - fetchProfile() → если кэш < 5 мин → нет HTTP запроса
 * - fetchCars()    → если кэш < 3 мин → нет HTTP запроса
 * - fetchSessions() → если кэш < 2 мин → нет HTTP запроса
 */
const Profile: React.FC = observer(() => {
  const navigate = useNavigate();
  const { authStore, carsStore, parkingStore } = useStore();

  useEffect(() => {
    // Все три запроса проверяют TTL-кэш перед HTTP:
    // если данные свежие — функция возвращается немедленно
    authStore.fetchProfile();
    carsStore.fetchCars();
    parkingStore.fetchSessions();
  }, [authStore, carsStore, parkingStore]);

  // authStore.loading — observable: observer перерисует при изменении
  if (authStore.loading && !authStore.user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (authStore.error) {
    return <Alert severity="error" sx={{ m: 3 }}>{authStore.error}</Alert>;
  }

  const recentSessions = parkingStore.sessions.slice(0, 5);

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Профиль пользователя
      </Typography>

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {/* ── Левая колонка ─────────────────────────────────────────── */}
        <Box sx={{ flex: '0 0 340px' }}>
          {/**
           * <UserInfo /> — тоже observer, тоже читает authStore.user,
           * carsStore.carsCount, parkingStore.activeSessions.
           *
           * Когда authStore.user изменится — перерисуются оба:
           * и Profile (здесь), и UserInfo (внутри).
           * Это происходит за счёт MobX Proxy tracking.
           */}
          <UserInfo />

          {/* Дополнительная инфо о пользователе — ВТОРОЕ место использования authStore.user */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                📋 Данные аккаунта
              </Typography>
              {/* authStore.user — observable: перерисуется при изменении */}
              <Typography variant="body2">
                Имя: <strong>{authStore.user?.name}</strong>
              </Typography>
              <Typography variant="body2">
                Email: <strong>{authStore.user?.email}</strong>
              </Typography>
              <Typography variant="body2">
                ID: <strong>#{authStore.user?.id}</strong>
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* ── Правая колонка ─────────────────────────────────────────── */}
        <Box sx={{ flex: 1, minWidth: 300 }}>
          {/* Автомобили — carsStore.cars — observable array */}
          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  🚗 Мои автомобили ({carsStore.carsCount})
                </Typography>
                <Button size="small" onClick={() => navigate('/cars')}>
                  Управление
                </Button>
              </Box>
              {carsStore.loading ? (
                <CircularProgress size={20} />
              ) : carsStore.cars.length === 0 ? (
                <Typography color="text.secondary">Автомобили не добавлены</Typography>
              ) : (
                <List dense>
                  {carsStore.cars.map((car) => (
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

          {/* Активные сессии — parkingStore.activeSessions — computed */}
          {parkingStore.activeSessions.length > 0 && (
            <Card variant="outlined" sx={{ mb: 2, borderColor: 'success.main' }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold" color="success.main">
                  🟢 Активные бронирования ({parkingStore.activeSessions.length})
                </Typography>
                <List dense>
                  {parkingStore.activeSessions.map((s) => (
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

          {/* Последние сессии — parkingStore.sessions — observable array */}
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
              {parkingStore.sessionsLoading ? (
                <CircularProgress size={20} />
              ) : recentSessions.length === 0 ? (
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

          {/* Суммарные расходы — parkingStore.totalSpent — computed */}
          {parkingStore.sessions.length > 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'right' }}>
              💰 Итого потрачено: <strong>{parkingStore.totalSpent.toFixed(2)} ₽</strong>
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
});

export default Profile;
