'use client';

// Веб-клиент к тому же бэкенду, что и мобильное приложение Toilab.
import axios from 'axios';

// Всегда идём через same-origin прокси (/toilab-api → api.toilab.kz, см.
// next.config.mjs), чтобы не упираться в CORS. Общий NEXT_PUBLIC_API_BASE_URL
// тут НЕ используем — он указывает на api.toilab.kz (для модуля модерации).
export const API_BASE_URL = '/toilab-api';

export const TOKEN_KEY = 'toilab_app_token';
export const CITY_KEY = 'toilab_app_city';
export const LANG_KEY = 'toilab_app_lang';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Токен и город — как в мобильном app (Authorization + x-city).
client.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = window.localStorage.getItem(TOKEN_KEY);
    const city = window.localStorage.getItem(CITY_KEY);
    if (token) config.headers.Authorization = `Bearer ${token}`;
    if (city && !config.skipCityFilter) {
      config.headers['x-city'] = encodeURIComponent(city);
    }
  }
  return config;
});

// Унифицированное сообщение об ошибке.
client.interceptors.response.use(
  (r) => r,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Неизвестная ошибка';
    const wrapped = new Error(message);
    wrapped.status = error.response?.status;
    return Promise.reject(wrapped);
  },
);

export default client;

// ── Аутентификация ───────────────────────────────────────────────
export const login = (credentials) =>
  client.post('/api/auth/login', credentials).then((r) => r.data);

export const register = (data) =>
  client.post('/api/register', data).then((r) => r.data);

export const getUser = () =>
  client.get('/api/auth/getAuthentificatedUserInfo').then((r) => r.data);

// Сброс пароля: письмо со ссылкой (контракт из моб. RestorePasswordScreen).
export const forgotPassword = (email) =>
  client.post('/api/forgot-password', { email }).then((r) => r.data);

// Профиль: имя/фамилия/телефон (контракт из моб. Item4Screen → addfullprofile).
export const updateProfile = (data) =>
  client.post('/api/auth/addfullprofile', data).then((r) => r.data);

// Удаление аккаунта (DELETE без тела, как в моб. app).
export const deleteAccount = () => client.delete('/api/profile').then((r) => r.data);

// ── Универсальные методы каталога ────────────────────────────────
export const fetchList = (path) => client.get(path).then((r) => r.data);
export const fetchOne = (path) => client.get(path).then((r) => r.data);

// Файлы (фото/видео) записи: GET /api/{segment}/{id}/files → [{ path, mimetype, ... }].
export const getFiles = (segment, id) =>
  client.get(`/api/${segment}/${id}/files`).then((r) => r.data);

// ── Поставщик ────────────────────────────────────────────────────
// Объявления текущего поставщика по группам (с полем status у каждой записи).
export const getSupplierListings = () =>
  client.get('/api/supplier/listings').then((r) => r.data);

export const createListing = (path, data) => client.post(path, data).then((r) => r.data);
export const deleteListing = (path) => client.delete(path).then((r) => r.data);

// id созданной записи: бэкенд возвращает либо {id}, либо {data:{id}}.
export const getEntityId = (res) => res?.id ?? res?.data?.id ?? null;

// Загрузка одного файла к записи: POST /api/{segment}/{id}/files, поле "file"
// (multipart). Content-Type не задаём — браузер сам проставит boundary.
export const uploadListingFile = (segment, id, file) => {
  const fd = new FormData();
  fd.append('file', file);
  return client
    .post(`/api/${segment}/${id}/files`, fd, { headers: { 'Content-Type': undefined } })
    .then((r) => r.data);
};

// Создание авто для салона транспорта: POST /api/transport-vehicles.
export const createVehicle = (data) =>
  client.post('/api/transport-vehicles', data).then((r) => r.data);

// ── Мероприятия клиента (weddings/events) ────────────────────────
export const createWedding = (data) =>
  client.post('/api/weddings/addwedding', data).then((r) => r.data);
export const getWeddings = () => client.get('/api/getallweddings').then((r) => r.data);
export const getWedding = (id) => client.get(`/api/weddings/${id}`).then((r) => r.data);
export const getPublicWedding = (id) => client.get(`/api/weddings/public/${id}`).then((r) => r.data);
export const updateWedding = (id, data) =>
  client.put(`/api/updateweddingbyid/${id}`, data).then((r) => r.data);
export const deleteWedding = (id) => client.delete(`/api/weddings/${id}`).then((r) => r.data);
export const deleteWeddingItem = (id) => client.delete(`/api/wedding-items/${id}`).then((r) => r.data);
export const updateWeddingTotalCost = (id, total_cost) =>
  client.patch(`/api/weddings/${id}/total_cost`, { total_cost }).then((r) => r.data);
export const updateWeddingRemainingBalance = (id, remaining_balance) =>
  client.patch(`/api/weddings/${id}/remaining_balance`, { remaining_balance }).then((r) => r.data);
// Трекер оплат (как в моб. Item3Screen): paid_amount — отдельное поле,
// пересчёты остатка его не трогают (remaining_balance = budget − total_cost).
export const updateWeddingPaidAmount = (id, paid_amount) =>
  client.patch(`/api/weddings/${id}/paid_amount`, { paid_amount }).then((r) => r.data);

// ── Wishlist мероприятия (список подарков) ───────────────────────
// Позиция ссылается на товар (good_id). Кастомный подарок: сначала создать good.
export const createGood = (data) => client.post('/api/goods', data).then((r) => r.data);
export const createWish = (data) => client.post('/api/wishlist', data).then((r) => r.data);
export const deleteWish = (id) => client.delete(`/api/wishlist/${id}`).then((r) => r.data);
export const getWeddingWishlist = (id) =>
  client.get(`/api/wishlist/wedding/${id}`).then((r) => r.data);
export const getPublicWeddingWishlist = (id) =>
  client.get(`/api/wishlist/public/wedding/${id}`).then((r) => r.data);
export const reserveWish = (id) =>
  client.patch(`/api/wishlist/${id}/reserve`, {}).then((r) => r.data);
export const reserveWishByUnknown = (id, name) =>
  client.patch(`/api/wishlist/${id}/reservebyunknown`, { data: { reserved_by_unknown: name } }).then((r) => r.data);
