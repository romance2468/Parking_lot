import React from 'react';
import { observer } from 'mobx-react-lite';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { StoreProvider } from './context/StoreContext';
import { useStore } from './context/StoreContext';
import Header from './components/Header';
import Login from './components/Login';
import Profile from './components/Profile';

const theme = createTheme({
  palette: {
    primary: { main: '#1b5e20' },
    secondary: { main: '#f57f17' },
  },
});

/**
 * PrivateRoute — защищённый маршрут для MobX-версии.
 * observer() следит за authStore.isAuthenticated:
 * при изменении (logout) — автоматически редиректит на /login.
 */
const PrivateRoute: React.FC<{ children: React.ReactNode }> = observer(({ children }) => {
  const { authStore } = useStore();
  return authStore.isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
});

/**
 * AppRoutes — маршрутизация внутри StoreProvider (чтобы useStore работал).
 */
const AppRoutes: React.FC = () => (
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
);

/**
 * App — корневой компонент MobX-приложения.
 *
 * Структура:
 * - <StoreProvider> создаёт RootStore и передаёт через React Context
 *   → все компоненты имеют доступ к сторам через useStore()
 * - observer() на компонентах обеспечивает точечную реактивность
 *   → перерисовываются только компоненты с изменившимися observables
 */
const App: React.FC = () => (
  <StoreProvider>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppRoutes />
    </ThemeProvider>
  </StoreProvider>
);

export default App;
