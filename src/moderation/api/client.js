import axios from 'axios';
import { API_BASE_URL, TOKEN_STORAGE_KEY } from '../config';

// Единый axios-инстанс для веб-сервиса модерации.
const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Подставляем JWT администратора в каждый запрос.
client.interceptors.request.use((config) => {
  // localStorage доступен только в браузере (запросы идут из клиентских компонентов).
  const token =
    typeof window !== 'undefined'
      ? window.localStorage.getItem(TOKEN_STORAGE_KEY)
      : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Унифицируем ошибку: достаём осмысленное сообщение от бэкенда.
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Неизвестная ошибка';
    const wrapped = new Error(message);
    wrapped.status = error.response?.status;
    wrapped.original = error;
    return Promise.reject(wrapped);
  },
);

export default client;
