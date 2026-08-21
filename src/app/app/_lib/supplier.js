// Реестр групп объявлений поставщика. Ключи совпадают с ответом
// GET /api/supplier/listings: { restaurants:[], clothing:[], ... }.
// Пути create/delete — из api.js мобильного приложения.

import { pick } from './categories';

// get/upd — эндпоинты чтения/обновления одной записи (контракты моб. api.js;
// у большинства ресурсов GET и PUT — /api/<segment>/{id}, исключения ниже).
export const SUPPLIER_GROUPS = [
  { key: 'restaurants', icon: '🍽️', ru: 'Рестораны', kz: 'Мейрамханалар', create: '/api/restaurant', del: (id) => `/api/restaurant/${id}`, get: (id) => `/api/restaurantbyid/${id}`, upd: (id) => `/api/restaurant/${id}` },
  { key: 'cakes', icon: '🎂', ru: 'Торты', kz: 'Торттар', create: '/api/cakes', del: (id) => `/api/cakes/${id}`, get: (id) => `/api/cake/${id}`, upd: (id) => `/api/cakes/${id}` },
  { key: 'flowers', icon: '💐', ru: 'Цветы', kz: 'Гүлдер', create: '/api/flowers', del: (id) => `/api/flowers/${id}`, get: (id) => `/api/flowers/${id}`, upd: (id) => `/api/flowers/${id}` },
  { key: 'transport', icon: '🚗', ru: 'Транспорт', kz: 'Көлік', create: '/api/transport', del: (id) => `/api/transport/${id}`, get: (id) => `/api/transport/${id}`, upd: (id) => `/api/transport/${id}` },
  { key: 'tamada', icon: '🎤', ru: 'Тамада / ведущие', kz: 'Тамада', create: '/api/tamada', del: (id) => `/api/tamada/${id}`, get: (id) => `/api/tamada/${id}`, upd: (id) => `/api/tamada/${id}` },
  { key: 'programs', icon: '🎭', ru: 'Шоу-программа', kz: 'Шоу-бағдарлама', create: '/api/program', del: (id) => `/api/program/${id}`, get: (id) => `/api/program/${id}`, upd: (id) => `/api/program/${id}` },
  { key: 'jewelry', icon: '💍', ru: 'Ювелирные изделия', kz: 'Зергерлік бұйымдар', create: '/api/jewelry', del: (id) => `/api/jewelry/${id}`, get: (id) => `/api/jewelry/${id}`, upd: (id) => `/api/jewelry/${id}` },
  { key: 'clothing', icon: '👗', ru: 'Одежда', kz: 'Киім', create: '/api/clothing', del: (id) => `/api/clothing/${id}`, get: (id) => `/api/clothing/${id}`, upd: (id) => `/api/clothing/${id}` },
  { key: 'alcohol', icon: '🍷', ru: 'Алкоголь', kz: 'Алкоголь', create: '/api/alcohol', del: (id) => `/api/alcohol/${id}`, get: (id) => `/api/alcohol/${id}`, upd: (id) => `/api/alcohol/${id}` },
  { key: 'photoVideoServices', icon: '📸', ru: 'Фото / видео', kz: 'Фото / видео', create: '/api/photo-video-services', del: (id) => `/api/photo-video-services/${id}`, get: (id) => `/api/photo-video-services/${id}`, upd: (id) => `/api/photo-video-services/${id}` },
  { key: 'fireworksServices', icon: '🎆', ru: 'Фейерверки', kz: 'Фейерверктер', create: '/api/fireworks-services', del: (id) => `/api/fireworks-services/${id}`, get: (id) => `/api/fireworks-services/${id}`, upd: (id) => `/api/fireworks-services/${id}` },
  { key: 'suvenirs', icon: '🎁', ru: 'Сувениры', kz: 'Кәдесыйлар', create: '/api/suvenirs', del: (id) => `/api/suvenirs/${id}`, get: (id) => `/api/suvenirs/${id}`, upd: (id) => `/api/suvenirs/${id}` },
  { key: 'typography', icon: '🖨️', ru: 'Типография', kz: 'Типография', create: '/api/typography', del: (id) => `/api/typography/${id}`, get: (id) => `/api/typography/${id}`, upd: (id) => `/api/typography/${id}` },
  { key: 'technicalEquipmentRentals', icon: '🔊', ru: 'Аренда оборудования', kz: 'Жабдық жалдау', create: '/api/technical-equipment-rental', del: (id) => `/api/technical-equipment-rental/${id}`, get: (id) => `/api/technical-equipment-rental/${id}`, upd: (id) => `/api/technical-equipment-rental/${id}` },
  { key: 'hotels', icon: '🏨', ru: 'Гостиницы', kz: 'Қонақ үйлер', create: '/api/hotel', del: (id) => `/api/hotel/${id}`, get: (id) => `/api/hotel/${id}`, upd: (id) => `/api/hotel/${id}` },
  { key: 'goods', icon: '📦', ru: 'Товары', kz: 'Тауарлар', create: '/api/goods', del: (id) => `/api/removegoodbyid/${id}`, get: (id) => `/api/goodbyid/${id}`, upd: (id) => `/api/updategoodbyid/${id}` },
  { key: 'traditionalGifts', icon: '🎀', ru: 'Традиционные подарки', kz: 'Дәстүрлі сыйлықтар', create: '/api/traditional-gift', del: (id) => `/api/traditional-gift/${id}`, get: (id) => `/api/traditional-gift/${id}`, upd: (id) => `/api/traditional-gift/${id}` },
  // Моб. api.js:70 — resources.hallDecorations { path: 'hall-decorations' }; ключ в /supplier/listings — hallDecorations.
  { key: 'hallDecorations', icon: '🎊', ru: 'Оформление зала', kz: 'Зал безендіру', create: '/api/hall-decorations', del: (id) => `/api/hall-decorations/${id}`, get: (id) => `/api/hall-decorations/${id}`, upd: (id) => `/api/hall-decorations/${id}` },
];

export const GROUP_BY_KEY = Object.fromEntries(SUPPLIER_GROUPS.map((g) => [g.key, g]));

// Превращаем ответ { restaurants:[...], ... } в плоский список с типом и статусом.
export function flattenListings(data = {}) {
  const out = [];
  for (const g of SUPPLIER_GROUPS) {
    const arr = data?.[g.key];
    if (Array.isArray(arr)) {
      for (const item of arr) out.push({ ...item, _group: g.key });
    }
  }
  return out;
}

// Универсальные геттеры — имена полей различаются между ресурсами.
export const listingName = (i) => pick(i, ['name', 'companyName', 'storeName', 'salonName', 'decorationName', 'studioName', 'teamName', 'itemName', 'fullName', 'title'], '—');
export const listingPrice = (i) => pick(i, ['cost', 'price', 'averageCost', 'pricePerShow', 'minPrice'], '');
export const listingSub = (i) => pick(i, ['city', 'address', 'district'], '');
