// Конфигурация веб-сервиса модерации, читается из переменных окружения Next
// (доступны в браузере только переменные с префиксом NEXT_PUBLIC_).

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.toilab.kz';

// Когда true — приложение работает на встроенных мок-данных и не обращается
// к бэкенду. Удобно для разработки фронта, пока эндпоинты модерации не готовы.
export const USE_MOCK = String(process.env.NEXT_PUBLIC_USE_MOCK) === 'true';

// roleId администратора (модератора). Только такие пользователи допускаются.
export const ADMIN_ROLE_ID = 1;

// Ключ для хранения JWT в localStorage.
export const TOKEN_STORAGE_KEY = 'toilab_moderation_token';
