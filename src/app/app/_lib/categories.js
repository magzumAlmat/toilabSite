// Реестр 17 категорий услуг. Эндпоинты соответствуют src/api/api.js мобильного app.
// slug — используется в URL: /app/catalog/<slug>
// list — путь списка (фильтруется по городу через x-city на бэкенде)
// detail(id) — путь карточки

export const CATEGORIES = [
  { slug: 'restaurants', icon: '🍽️', ru: 'Рестораны', kz: 'Мейрамханалар', list: '/api/restaurants', detail: (id) => `/api/restaurantbyid/${id}` },
  { slug: 'cakes', icon: '🎂', ru: 'Торты', kz: 'Торттар', list: '/api/cake', detail: (id) => `/api/cake/${id}` },
  { slug: 'flowers', icon: '💐', ru: 'Цветы', kz: 'Гүлдер', list: '/api/flowers', detail: (id) => `/api/flowers/${id}` },
  { slug: 'transport', icon: '🚗', ru: 'Транспорт', kz: 'Көлік', list: '/api/transport', detail: (id) => `/api/transport/${id}` },
  { slug: 'tamada', icon: '🎤', ru: 'Тамада / ведущие', kz: 'Тамада / жүргізушілер', list: '/api/tamada', detail: (id) => `/api/tamada/${id}` },
  { slug: 'program', icon: '🎭', ru: 'Шоу-программа', kz: 'Шоу-бағдарлама', list: '/api/program', detail: (id) => `/api/program/${id}` },
  { slug: 'jewelry', icon: '💍', ru: 'Ювелирные изделия', kz: 'Зергерлік бұйымдар', list: '/api/jewelry', detail: (id) => `/api/jewelry/${id}` },
  { slug: 'clothing', icon: '👗', ru: 'Одежда', kz: 'Киім', list: '/api/clothing', detail: (id) => `/api/clothing/${id}` },
  { slug: 'photo-video', icon: '📸', ru: 'Фото / видео', kz: 'Фото / видео', list: '/api/photo-video-services', detail: (id) => `/api/photo-video-services/${id}` },
  { slug: 'fireworks', icon: '🎆', ru: 'Фейерверки', kz: 'Фейерверктер', list: '/api/fireworks-services', detail: (id) => `/api/fireworks-services/${id}` },
  { slug: 'suvenirs', icon: '🎁', ru: 'Сувениры', kz: 'Кәдесыйлар', list: '/api/suvenirs', detail: (id) => `/api/suvenirs/${id}` },
  { slug: 'typography', icon: '🖨️', ru: 'Типография', kz: 'Типография', list: '/api/typography', detail: (id) => `/api/typography/${id}` },
  { slug: 'equipment', icon: '🔊', ru: 'Аренда оборудования', kz: 'Жабдық жалдау', list: '/api/technical-equipment-rentals', detail: (id) => `/api/technical-equipment-rental/${id}` },
  { slug: 'hotels', icon: '🏨', ru: 'Гостиницы', kz: 'Қонақ үйлер', list: '/api/hotels', detail: (id) => `/api/hotel/${id}` },
  { slug: 'goods', icon: '📦', ru: 'Товары', kz: 'Тауарлар', list: '/api/goods', detail: (id) => `/api/goodbyid/${id}` },
  { slug: 'traditional-gift', icon: '🎀', ru: 'Традиционные подарки', kz: 'Дәстүрлі сыйлықтар', list: '/api/traditional-gift', detail: (id) => `/api/traditional-gift/${id}` },
];

export const CATEGORY_BY_SLUG = Object.fromEntries(CATEGORIES.map((c) => [c.slug, c]));

export const CITIES = ['Алматы', 'Астана', 'Шымкент'];

// Безопасно достаём поле из произвольной записи бэкенда.
export function pick(obj, keys, fallback = '') {
  for (const k of keys) {
    if (obj && obj[k] != null && obj[k] !== '') return obj[k];
  }
  return fallback;
}
