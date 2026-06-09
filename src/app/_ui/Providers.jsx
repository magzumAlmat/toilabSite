'use client';

// Глобальные провайдеры состояния (авторизация/город/язык + корзина) для ВСЕГО
// сайта — и лендинга (site), и приложения (/app). Поднято в корень, чтобы шапка
// и язык были общими везде (а не только в /app).
import { AppProvider } from '../app/_lib/AppContext';
import { CartProvider } from '../app/_lib/CartContext';

export default function Providers({ children }) {
  return (
    <AppProvider>
      <CartProvider>{children}</CartProvider>
    </AppProvider>
  );
}
