import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { store } from './store';
import Header from './components/Header';
import Login from './components/Login';
import Profile from './components/Profile';

/**
 * Тема приложения
 */
const theme = createTheme({
  palette: {
    primary: { main: '#1a237e' },
    secondary: { main: '#ff6f00' },
  },
});

/**
 * PrivateRoute — защищённый маршрут.
 * Если токена нет — редирект на /login.
 */
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? <>{children}</> : <Navigate to="/login" replace />;
};

/**
 * App — корневой компонент Redux-приложения.
 *
 * Структура:
 * - <Provider store={store}> оборачивает всё приложение
 *   → все компоненты имеют доступ к Redux store через хуки
 * - RTK Query middleware активен → кэширование работает автоматически
 */
const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route path="/" element={<Navigate to="/profile" replace />} />
            <Route path="*" element={<Navigate to="/profile" replace />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
