import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, TextField, Typography, Alert, CircularProgress,
  Paper, Checkbox, FormControlLabel,
} from '@mui/material';
import { useLoginMutation } from '../services/authApi';
import { useAppSelector } from '../store';
import { selectIsAuthenticated } from '../store/authSlice';

/**
 * Login — страница входа.
 *
 * Использует RTK Query mutation (useLoginMutation).
 *
 * Что происходит при логине:
 * 1. dispatch(loginMutation(credentials)) → POST /api/auth/login
 * 2. onQueryStarted в authApi.ts → dispatch(setCredentials(data))
 *    → token и user сохраняются в authSlice + localStorage
 * 3. invalidatesTags: ['User', 'Profile', 'Cars', 'Sessions']
 *    → при переходе на Profile все данные загрузятся свежими
 * 4. Редирект на /profile
 */
const Login: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // RTK Query mutation — возвращает [triggerFn, { isLoading, isError, error }]
  const [login, { isLoading, isError, error }] = useLoginMutation();

  // Если уже аутентифицирован — редиректим
  useEffect(() => {
    if (isAuthenticated) navigate('/profile', { replace: true });
  }, [isAuthenticated, navigate]);

  // Восстанавливаем запомненный email
  useEffect(() => {
    const remembered = localStorage.getItem('rememberedEmail');
    if (remembered) {
      setEmail(remembered);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      await login({ email, password }).unwrap();
      // После успешного логина onQueryStarted в authApi
      // автоматически вызовет setCredentials → isAuthenticated станет true
      // → useEffect выше сделает редирект на /profile
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
    } catch {
      // Ошибка отображается через isError / error ниже
    }
  };

  const errorMessage =
    (error as any)?.data?.error || (error as any)?.message || 'Неверный email или пароль';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a237e 0%, #283593 100%)',
      }}
    >
      <Paper elevation={8} sx={{ p: 4, width: 400, borderRadius: 3 }}>
        <Typography variant="h5" align="center" gutterBottom fontWeight="bold">
          🚗 Парковка
        </Typography>
        <Typography variant="subtitle2" align="center" color="text.secondary" mb={3}>
          Redux Toolkit + RTK Query
        </Typography>

        {isError && <Alert severity="error" sx={{ mb: 2 }}>{errorMessage}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
            autoComplete="email"
          />
          <TextField
            fullWidth
            label="Пароль"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
            autoComplete="current-password"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
            }
            label="Запомнить меня"
          />
          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            disabled={isLoading}
            sx={{ mt: 2 }}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Войти'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default Login;
