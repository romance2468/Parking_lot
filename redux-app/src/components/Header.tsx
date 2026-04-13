import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { logout, selectCurrentUser, selectIsAuthenticated } from '../store/authSlice';
import { baseApi } from '../api/baseApi';

/**
 * Header — отображает имя текущего пользователя.
 *
 * Использует данные User из двух источников:
 * 1. selectCurrentUser(state) — из authSlice (быстрый, из localStorage)
 * 2. useGetProfileQuery() — можно подключить для актуального имени из кэша
 *
 * Это ПЕРВОЕ место использования данных User.
 * Данные берутся из Redux store — никакого HTTP-запроса!
 */
const Header: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const handleLogout = () => {
    dispatch(logout());
    // Сбрасываем весь кэш RTK Query при выходе
    dispatch(baseApi.util.resetApiState());
    navigate('/login');
  };

  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, cursor: 'pointer' }} onClick={() => navigate('/')}>
          🚗 Парковка (Redux RTK)
        </Typography>

        {isAuthenticated && user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Имя пользователя из Redux store — данные закэшированы */}
            <Chip
              label={`👤 ${user.name}`}
              color="secondary"
              variant="outlined"
              sx={{ color: 'white', borderColor: 'white' }}
              onClick={() => navigate('/profile')}
            />
            <Button color="inherit" onClick={() => navigate('/cars')}>Мои авто</Button>
            <Button color="inherit" onClick={() => navigate('/parking')}>Парковка</Button>
            <Button color="inherit" variant="outlined" onClick={handleLogout}>Выйти</Button>
          </Box>
        )}

        {!isAuthenticated && (
          <Button color="inherit" onClick={() => navigate('/login')}>Войти</Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
