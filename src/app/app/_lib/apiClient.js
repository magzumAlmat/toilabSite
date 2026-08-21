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
export const updateListing = (path, data) => client.put(path, data).then((r) => r.data);
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

// Фото номера гостиницы: отдельный эндпоинт (не files-сегмент), поле "file"
// (контракт моб. Item2Screen.js:312-327).
export const uploadRoomPhoto = (roomId, file) => {
  const fd = new FormData();
  fd.append('file', file);
  return client
    .post(`/api/rooms/rooms/${roomId}/photos`, fd, { headers: { 'Content-Type': undefined } })
    .then((r) => r.data);
};

// ── Редактирование объявления: медиа, авто, номера (контракты моб. ItemEditScreen) ──
// Удаление файла записи/авто: DELETE /api/files/{fileId} (ItemEditScreen.js:274, :1091).
export const deleteFile = (fileId) => client.delete(`/api/files/${fileId}`).then((r) => r.data);
// Авто салона: PUT/DELETE /api/transport-vehicles/{id}; фото — POST …/{id}/photos, поле "file"
// (ItemEditScreen.js:769-790: в photos JSONB, его читает бронирование).
export const updateVehicle = (id, data) =>
  client.put(`/api/transport-vehicles/${id}`, data).then((r) => r.data);
export const deleteVehicle = (id) => client.delete(`/api/transport-vehicles/${id}`).then((r) => r.data);
export const uploadVehiclePhoto = (vehicleId, file) => {
  const fd = new FormData();
  fd.append('file', file);
  return client
    .post(`/api/transport-vehicles/${vehicleId}/photos`, fd, { headers: { 'Content-Type': undefined } })
    .then((r) => r.data);
};
// Номера гостиницы (ItemEditScreen.js:849-898): тип → номер; фото см. uploadRoomPhoto.
export const createRoomType = (data) => client.post('/api/rooms/room-types', data).then((r) => r.data);
export const createRoom = (data) => client.post('/api/rooms/rooms', data).then((r) => r.data);
export const updateRoom = (id, data) => client.put(`/api/rooms/rooms/${id}`, data).then((r) => r.data);
export const deleteRoom = (id) => client.delete(`/api/rooms/rooms/${id}`).then((r) => r.data);

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

// ── Мероприятия-«категории» (event-category) ─────────────────────
// Все НЕсвадебные типы (корпоратив, выпускной, конференция, предсвадебная
// вечеринка, семейное торжество) моб. app сохраняет сюда, а не в weddings
// (CorporateEventScreen.js:3122, PromScreen.js:2284, ConferencesEventScreen.js:1840).
// Проверено на боевом бэкенде: GET /api/event-category/{id} → 200, тип события
// лежит в поле event_kind, услуги — в EventServices[] (эндпоинт /services
// отдаёт services: [] даже когда услуги есть, поэтому читаем из объекта).
export const createEventCategory = (data) =>
  client.post('/api/event-category', data).then((r) => r.data);
export const getEventCategories = () =>
  client.get('/api/event-categories').then((r) => r.data);
export const getEventCategory = (id) =>
  client.get(`/api/event-category/${id}`).then((r) => r.data);
export const getEventCategoryWithServices = (id) =>
  client.get(`/api/event-category/${id}/services`).then((r) => r.data);
export const updateEventCategory = (id, data) =>
  client.put(`/api/event-category/${id}`, data).then((r) => r.data);
export const deleteEventCategory = (id) =>
  client.delete(`/api/event-category/${id}`).then((r) => r.data);
export const updateEventCategoryTotalCost = (id, total_cost) =>
  client.patch(`/api/event-category/${id}/total_cost`, { total_cost }).then((r) => r.data);
export const updateEventCategoryPaidAmount = (id, paid_amount) =>
  client.patch(`/api/event-category/${id}/paid_amount`, { paid_amount }).then((r) => r.data);
export const updateEventCategoryRemainingBalance = (id, remaining_balance) =>
  client.patch(`/api/event-category/${id}/remaining_balance`, { remaining_balance }).then((r) => r.data);
export const updateEventCategoryBudget = (id, budget) =>
  client.patch(`/api/event-category/${id}/budget`, { budget }).then((r) => r.data);
// Одна услуга: { serviceId, serviceType, quantity, cost, room_ids }.
export const addServiceToCategory = (categoryId, data) =>
  client.post(`/api/event-category/${categoryId}/service`, data).then((r) => r.data);
// Пачкой: { service_ids: [{ serviceId, serviceType, quantity, room_ids }] }.
export const addServicesToCategory = (categoryId, data) =>
  client.post(`/api/event-category/${categoryId}/services`, data).then((r) => r.data);
// Заменить набор услуг целиком (тот же формат, что addServicesToCategory).
export const updateServicesForCategory = (categoryId, data) =>
  client.put(`/api/event-category/${categoryId}/services`, data).then((r) => r.data);
// ⚠️ serviceType шлём в том же виде, что и при добавлении (PascalCase):
// бэкенд отвечает 204 на 'Restaurant' и 404 на 'restaurant' (проверено вживую).
export const removeServiceFromCategory = (categoryId, serviceId, serviceType) =>
  client
    .delete(`/api/event-category/${categoryId}/service/${serviceId}`, { data: { serviceId, serviceType } })
    .then((r) => r.data);

// Гости мероприятия (RSVP «Я буду») — для хоста.
export const getEventGuests = (eventType, eventId) =>
  client.get(`/api/events/${eventType}/${eventId}/guests`).then((r) => r.data);

// ── Бронирование номеров/авто (контракты из моб. api.js) ─────────
// Номера отеля: GET /api/rooms/hotels/{hotelId}/rooms.
export const getRoomsByHotel = (hotelId) =>
  client.get(`/api/rooms/hotels/${hotelId}/rooms`).then((r) => r.data);
// Занятость номера на [checkIn, checkOut): ответ { data: { available } }.
export const checkRoomAvailability = (roomId, checkInDate, checkOutDate) =>
  client.get(`/api/room-availability/check/availability?roomId=${roomId}&checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`).then((r) => r.data);
// Бронь номера после создания мероприятия (source/notes — как в моб. app).
export const createRoomBooking = (data) =>
  client.post('/api/room-availability/', data).then((r) => r.data);
// Авто салона: GET /api/transport-vehicles?transportId={id}.
export const getVehiclesByTransportId = (transportId) =>
  client.get(`/api/transport-vehicles?transportId=${transportId}`).then((r) => r.data);
// Занятость авто на [start, end]: ответ { isAvailable }.
export const checkVehicleAvailability = (vehicleId, startDate, endDate) =>
  client.get(`/api/transport-availability/check/availability?vehicleId=${vehicleId}&startDate=${startDate}&endDate=${endDate}`).then((r) => r.data);
export const createTransportBooking = (data) =>
  client.post('/api/transport-availability/', data).then((r) => r.data);
// Рестораны, ЗАНЯТЫЕ на дату (проверено вживую: после блока ресторан появляется
// в ответе). Формат: { date, restaurants: [...], total }.
export const getRestaurantsByDate = (date) =>
  client.get(`/api/restaurants-by-date?date=${date}`).then((r) => r.data);
// Блок даты ресторана после создания мероприятия.
export const blockRestaurantDate = (restaurantId, date) =>
  client.post('/api/block', { restaurantId, date }).then((r) => r.data);

// ── Календарь броней поставщика (контракты из моб. api.js) ───────
export const fetchAllBlockedDays = () =>
  client.get('/api/all-blocked-days').then((r) => r.data);
export const unblockRestaurantDate = (restaurantId, date) =>
  client.delete('/api/block', { data: { restaurantId, date } }).then((r) => r.data);
// query — необязательная строка фильтра (моб. передаёт `date=YYYY-MM-DD`).
export const getRoomBookings = (query) =>
  client.get(`/api/room-availability/${query ? `?${query}` : ''}`).then((r) => r.data);
export const cancelRoomBooking = (bookingReference) =>
  client.patch(`/api/room-availability/${bookingReference}/cancel`).then((r) => r.data);
export const getTransportBookings = (query) =>
  client.get(`/api/transport-availability/${query ? `?${query}` : ''}`).then((r) => r.data);
export const cancelTransportBooking = (bookingReference) =>
  client.patch(`/api/transport-availability/${bookingReference}/cancel`).then((r) => r.data);

// ── Wishlist мероприятия (список подарков) ───────────────────────
// Позиция ссылается на товар (good_id). Кастомный подарок: сначала создать good.
export const createGood = (data) => client.post('/api/goods', data).then((r) => r.data);
export const createWish = (data) => client.post('/api/wishlist', data).then((r) => r.data);
export const deleteWish = (id) => client.delete(`/api/wishlist/${id}`).then((r) => r.data);
export const getWeddingWishlist = (id) =>
  client.get(`/api/wishlist/wedding/${id}`).then((r) => r.data);
export const getPublicWeddingWishlist = (id) =>
  client.get(`/api/wishlist/public/wedding/${id}`).then((r) => r.data);
// Те же списки, но для мероприятий-«категорий» (несвадебные типы).
export const getEventCategoryWishlist = (id) =>
  client.get(`/api/wishlist/eventcategory/${id}`).then((r) => r.data);
export const getPublicEventCategoryWishlist = (id) =>
  client.get(`/api/wishlist/public/eventcategory/${id}`).then((r) => r.data);
export const reserveWish = (id) =>
  client.patch(`/api/wishlist/${id}/reserve`, {}).then((r) => r.data);
export const reserveWishByUnknown = (id, name) =>
  client.patch(`/api/wishlist/${id}/reservebyunknown`, { data: { reserved_by_unknown: name } }).then((r) => r.data);
