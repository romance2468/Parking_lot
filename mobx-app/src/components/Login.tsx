import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, TextField, Typography, Alert,
  CircularProgress, Paper, Checkbox, FormControlLabel,
} from '@mui/material';
import { useStore } from '../context/StoreContext';

/**
 * Login — страница входа (MobX-версия).
 *
 * observer() подписывается на:
 * - authStore.loading    → показывает спиннер
 * - authStore.error      → показывает ошибку
 * - authStore.isAuthenticated → редирект при успешном входе
 *
 * Как работает вход:
 * 1. handleSubmit → authStore.login(credentials)
 * 2. authStore.login() → POST /api/auth/login
 * 3. runInAction(() => { this.user = ...; this.isAuthenticated = true; })
 * 4. MobX фиксирует изменение isAuthenticated
 * 5. observer перерисовывает компонент
 * 6. useEffect видит isAuthenticated=true → navigate('/profile')
 */
const Login: React.FC = observer(() => {
  const navigate = useNavigate();
  const { authStore } = useStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Редирект при успешной аутентификации
  useEffect(() => {
    if (authStore.isAuthenticated) {
      navigate('/profile', { replace: true });
    }
  }, [authStore.isAuthenticated, navigate]);

  // Восстанавливаем запомненный email
  useEffect(() => {
    const remembered = localStorage.getItem('rememberedEmail');
    if (remembered) {
      setEmail(remembered);
      setRememberMe(true);
    }
    // Очищаем ошибку при монтировании
    authStore.clearError();
  }, [authStore]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      await authStore.login({ email, password });
      // После успешного логина isAuthenticated станет true
      // → useEffect выше сделает navigate('/profile')
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
    } catch {
      // Ошибка уже записана в authStore.error → отобразится через observer
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
      }}
    >
      <Paper elevation={8} sx={{ p: 4, width: 400, borderRadius: 3 }}>
        <Typography variant="h5" align="center" gutterBottom fontWeight="bold">
          🚗 Парковка
        </Typography>
        <Typography variant="subtitle2" align="center" color="text.secondary" mb={3}>
          MobX + mobx-react-lite
        </Typography>

        {/* authStore.error — observable, компонент перерисуется при изменении */}
        {authStore.error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => authStore.clearError()}>
            {authStore.error}
          </Alert>
        )}

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
            color="success"
            disabled={authStore.loading}
            sx={{ mt: 2 }}
          >
            {/* authStore.loading — observable, спиннер появится автоматически */}
            {authStore.loading
              ? <CircularProgress size={24} color="inherit" />
              : 'Войти'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
});

export default Login;
