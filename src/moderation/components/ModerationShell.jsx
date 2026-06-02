'use client';

import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Chip,
  Container,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../auth/AuthContext';
import { USE_MOCK } from '../config';

// Каркас авторизованной части модерации: верхняя панель + контейнер контента.
export default function ModerationShell({ children }) {
  const { user, logout } = useAuth();

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Toilab · Модерация
          </Typography>
          {USE_MOCK && (
            <Chip
              label="DEMO (мок-данные)"
              color="warning"
              size="small"
              sx={{ ml: 2 }}
            />
          )}
          <Box sx={{ flexGrow: 1 }} />
          <Typography variant="body2" sx={{ mr: 2, opacity: 0.9 }}>
            {user?.fullName || user?.email}
          </Typography>
          <Button color="inherit" startIcon={<LogoutIcon />} onClick={logout}>
            Выйти
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 3 }}>
        {children}
      </Container>
    </Box>
  );
}
