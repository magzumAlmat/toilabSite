'use client';

import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '../theme';
import { AuthProvider } from '../auth/AuthContext';

// Обёртка провайдеров для всех страниц раздела модерации:
//  - AppRouterCacheProvider — корректная вставка стилей Emotion при SSR (Next App Router)
//  - ThemeProvider/CssBaseline — тема MUI
//  - AuthProvider — состояние сессии модератора
export default function ModerationProviders({ children }) {
  return (
    <AppRouterCacheProvider options={{ key: 'mui' }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>{children}</AuthProvider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
