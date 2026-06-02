// Аутентификация модератора. Переиспользует существующие эндпоинты бэкенда:
//   POST /api/auth/login                       → { token, ... }
//   GET  /api/auth/getAuthentificatedUserInfo  → { id, roleId, email, fullName }

import client from './client';
import { USE_MOCK } from '../config';

export async function login(email, password) {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    // В мок-режиме принимаем любой непустой пароль и выдаём фейковый токен.
    return { token: 'mock-admin-token' };
  }
  const { data } = await client.post('/api/auth/login', { email, password });
  // Бэкенд может вернуть токен под разными ключами — нормализуем.
  const token = data?.token || data?.accessToken || data?.access_token;
  return { token, raw: data };
}

export async function fetchCurrentUser() {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200));
    return { id: 1, roleId: 1, email: 'admin@toilab.kz', fullName: 'Администратор' };
  }
  const { data } = await client.get('/api/auth/getAuthentificatedUserInfo');
  // Нормализуем возможные варианты вложенности ответа.
  return data?.user || data;
}
