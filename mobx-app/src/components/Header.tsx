import React from 'react';
import { observer } from 'mobx-react-lite';
import { AppBar, Toolbar, Typography, Button, Box, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

/**
 * Header — наблюдает за authStore.user и authStore.isAuthenticated.
 *
 * observer() из mobx-react-lite:
 * - Оборачивает компонент в MobX reaction
 * - При изменении любого observable, прочитанного внутри компонента,
 *   компонент перерисовывается АВТОМАТИЧЕСКИ
 * - Перерисовывается ТОЛЬКО этот компонент, а не всё дерево
 *
 * ПЕРВОЕ место использования authStore.user:
 * Header отображает user.name из authStore — то же самое observable,
 * что используют Profile, UserInfo и Sidebar.
 */
const Header: React.FC = observer(() => {
  const navigate = useNavigate();
  const { authStore } = useStore();

  const handleLogout = () => {
    authStore.logout(); // очищает state + localStorage + кэш сторов
    navigate('/login');
  };

  return (
    <AppBar position="static" sx={{ bgcolor: '#1b5e20' }}>
      <Toolbar>
        <Typography
          variant="h6"
          sx={{ flexGrow: 1, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          🚗 Парковка (MobX)
        </Typography>

        {/* authStore.isAuthenticated — observable, Header перерисуется при изменении */}
        {authStore.isAuthenticated && authStore.user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* authStore.user.name — точечная подписка на это поле */}
            <Chip
              label={`👤 ${authStore.user.name}`}
              sx={{ color: 'white', borderColor: 'white' }}
              variant="outlined"
              onClick={() => navigate('/profile')}
            />
            <Button color="inherit" onClick={() => navigate('/cars')}>Мои авто</Button>
            <Button color="inherit" onClick={() => navigate('/parking')}>Парковка</Button>
            <Button color="inherit" variant="outlined" onClick={handleLogout}>Выйти</Button>
          </Box>
        )}

        {!authStore.isAuthenticated && (
          <Button color="inherit" onClick={() => navigate('/login')}>Войти</Button>
        )}
      </Toolbar>
    </AppBar>
  );
});

export default Header;
