// Создание мероприятий клиентом. Все типы шлют на один эндпоинт
// POST /api/weddings/addwedding (как в мобильном app), различаются набором категорий.
// Контракт payload и type/costField — из src/screens/HomeScreen.js (стр. 1970-1978, 2891-2912).

// Категория мероприятия → как услуга попадает в items[]:
//   type      — строка типа услуги в payload (НЕ всегда совпадает со slug каталога),
//   costField — поле цены у записи каталога,
//   list      — эндпоинт списка услуг этой категории.
export const EVENT_CATEGORIES = {
  restaurants:        { type: 'restaurant',     costField: 'averageCost', list: '/api/restaurants',          ru: 'Рестораны',             kz: 'Мейрамханалар',        icon: '🍽️' },
  cakes:              { type: 'cake',           costField: 'cost',        list: '/api/cake',                 ru: 'Торты',                 kz: 'Торттар',              icon: '🎂' },
  flowers:            { type: 'flowers',        costField: 'cost',        list: '/api/flowers',              ru: 'Цветы',                 kz: 'Гүлдер',               icon: '💐' },
  tamada:             { type: 'tamada',         costField: 'cost',        list: '/api/tamada',               ru: 'Тамада / ведущие',      kz: 'Тамада',               icon: '🎤' },
  program:            { type: 'program',        costField: 'cost',        list: '/api/program',              ru: 'Шоу-программа',          kz: 'Шоу-бағдарлама',       icon: '🎭' },
  jewelry:            { type: 'jewelry',        costField: 'cost',        list: '/api/jewelry',              ru: 'Ювелирные изделия',     kz: 'Зергерлік бұйымдар',   icon: '💍' },
  'traditional-gift': { type: 'traditionalGift', costField: 'cost',       list: '/api/traditional-gift',     ru: 'Традиционные подарки',  kz: 'Дәстүрлі сыйлықтар',    icon: '🎀' },
  transport:          { type: 'transport',      costField: 'pricePerDay', list: '/api/transport-vehicles',   ru: 'Прокат авто',           kz: 'Көлік жалдау',         icon: '🚗' },
  clothing:           { type: 'clothing',       costField: 'cost',        list: '/api/clothing',             ru: 'Одежда',                kz: 'Киім',                 icon: '👗' },
  hotels:             { type: 'hotel',          costField: 'averageCost', list: '/api/hotels',               ru: 'Гостиницы',             kz: 'Қонақ үйлер',          icon: '🏨' },
  'photo-video':      { type: 'photo-video',    costField: 'cost',        list: '/api/photo-video-services', ru: 'Фото / видео',          kz: 'Фото / видео',         icon: '📸' },
  fireworks:          { type: 'fireworks',      costField: 'pricePerShow', list: '/api/fireworks-services',  ru: 'Фейерверки',            kz: 'Фейерверктер',         icon: '🎆' },
  suvenirs:           { type: 'suvenir',        costField: 'cost',        list: '/api/suvenirs',             ru: 'Сувениры',              kz: 'Кәдесыйлар',           icon: '🎁' },
  typography:         { type: 'typography',     costField: 'cost',        list: '/api/typography',           ru: 'Типография',            kz: 'Типография',           icon: '🖨️' },
  equipment:          { type: 'technical-equipment-rental', costField: 'cost', list: '/api/technical-equipment-rentals', ru: 'Аренда оборудования', kz: 'Жабдық жалдау',     icon: '🔊' },
};

// Типы мероприятий (пресеты) — набор категорий. Эндпоинт у всех один.
// Наборы взяты из экранов мобильного приложения (HomeScreen / CorporateEventScreen /
// CreateTraditionalFamilyEventScreen / PreWeddingScreen / PromScreen). Названия — из навигации.
// У «семейного» в моб. app есть ещё нац.костюмы/музыканты/фотографы/видеографы/декор — у них
// нет каталожных эндпоинтов на бэкенде, поэтому в вебе не подключены.
export const EVENT_TYPES = [
  { key: 'wedding',     ru: 'Свадьба',                          kz: 'Той',                       icon: '💍', categories: ['restaurants', 'flowers', 'cakes', 'tamada', 'program', 'jewelry', 'traditional-gift', 'transport', 'clothing'] },
  { key: 'traditional', ru: 'День рождения, семейное торжество', kz: 'Туған күн, отбасылық той',  icon: '🎉', categories: ['restaurants', 'hotels', 'tamada', 'program', 'flowers', 'transport', 'cakes', 'jewelry', 'traditional-gift'] },
  { key: 'corporate',   ru: 'Корпоративное мероприятие',         kz: 'Корпоративтік іс-шара',     icon: '🏢', categories: ['transport', 'restaurants', 'hotels', 'cakes', 'tamada', 'program', 'equipment', 'jewelry', 'flowers'] },
  { key: 'prewedding',  ru: 'Вечеринка перед свадьбой',          kz: 'Үйлену тойы алдындағы кеш', icon: '🥂', categories: ['transport', 'restaurants', 'hotels', 'cakes', 'tamada', 'program', 'equipment', 'jewelry', 'flowers', 'photo-video', 'suvenirs', 'typography'] },
  { key: 'prom',        ru: 'Выпускной',                         kz: 'Бітіру кеші',               icon: '🎓', categories: ['photo-video', 'tamada', 'restaurants', 'transport', 'suvenirs', 'fireworks', 'equipment', 'typography'] },
];

export const EVENT_TYPE_BY_KEY = Object.fromEntries(EVENT_TYPES.map((e) => [e.key, e]));

// Человекочитаемое имя записи каталога (поля различаются между ресурсами).
export function catalogItemName(item) {
  return (
    item?.name ||
    item?.teamName ||
    item?.companyName ||
    item?.studioName ||
    item?.carName ||
    [item?.salonName || item?.storeName, item?.flowerName || item?.itemName].filter(Boolean).join(' — ') ||
    item?.salonName || item?.storeName ||
    `#${item?.id ?? ''}`
  );
}

// Цена записи каталога для выбранной категории.
export function catalogItemCost(item, costField) {
  const v = item?.[costField] ?? item?.cost ?? item?.averageCost ?? item?.price ?? item?.pricePerShow ?? item?.pricePerDay ?? 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

// Эффективное количество: для ресторана/гостиницы = число гостей, иначе quantity.
export function effectiveQuantity(catKey, quantity, guestCount) {
  if (catKey === 'restaurants' || catKey === 'hotels') return parseInt(guestCount, 10) || 1;
  return parseInt(quantity, 10) || 1;
}

// Сборка позиций items[] и подсчёт итогов из выбранных услуг.
// selected: [{ catKey, item, quantity }]
export function buildItemsAndTotals(selected, guestCount) {
  const items = selected.map(({ catKey, item, quantity }) => {
    const cfg = EVENT_CATEGORIES[catKey];
    const cost = catalogItemCost(item, cfg.costField);
    const qty = effectiveQuantity(catKey, quantity, guestCount);
    return { id: item.companyId || item.id, type: cfg.type, quantity: qty, totalCost: cost * qty };
  });
  const totalCost = items.reduce((s, i) => s + i.totalCost, 0);
  return { items, totalCost };
}

// Полный payload для POST /api/weddings/addwedding.
export function buildWeddingPayload({ name, date, hostId, budget, selected, guestCount }) {
  const { items, totalCost } = buildItemsAndTotals(selected, guestCount);
  const budgetVal = parseFloat(budget) || 0;
  return {
    name: (name || '').trim(),
    date, // "YYYY-MM-DD"
    host_id: hostId,
    budget: budgetVal,
    total_cost: totalCost,
    paid_amount: 0,
    remaining_balance: budgetVal - totalCost,
    items,
  };
}

// Типовые «веса» категорий для распределения бюджета (относительные доли).
// Ресторан — крупнейшая статья, далее ведущий, цветы и т.д.
export const CATEGORY_WEIGHTS = {
  restaurants: 40, hotels: 16, transport: 8, tamada: 10, program: 8,
  flowers: 8, cakes: 6, jewelry: 6, 'traditional-gift': 5, clothing: 6,
  'photo-video': 8, fireworks: 7, suvenirs: 4, typography: 3, equipment: 7,
};

// Автоподбор: по одной услуге в каждой категории под целевую долю бюджета.
// catalogByCat: { catKey: items[] }. Возвращает selected: [{ catKey, item, quantity }].
export function recommendSelection({ categories, budget, guestCount, catalogByCat }) {
  const budgetVal = parseFloat(budget) || 0;
  const guests = parseInt(guestCount, 10) || 1;
  if (budgetVal <= 0) return [];

  // Только категории, где есть услуги с ценой.
  const cats = categories.filter((c) => (catalogByCat[c] || []).some((it) => catalogItemCost(it, EVENT_CATEGORIES[c].costField) > 0));
  const sumW = cats.reduce((s, c) => s + (CATEGORY_WEIGHTS[c] || 5), 0) || 1;

  const selected = [];
  for (const catKey of cats) {
    const cfg = EVENT_CATEGORIES[catKey];
    const isGuestQty = catKey === 'restaurants' || catKey === 'hotels';
    const qty = isGuestQty ? guests : 1;
    const target = budgetVal * ((CATEGORY_WEIGHTS[catKey] || 5) / sumW);

    const priced = (catalogByCat[catKey] || [])
      .map((item) => ({ item, unit: catalogItemCost(item, cfg.costField) }))
      .filter((p) => p.unit > 0);
    if (!priced.length) continue;

    const within = priced.filter((p) => p.unit * qty <= target);
    // Если что-то вписывается в долю — берём самый дорогой из подходящих (лучше осваиваем
    // бюджет), иначе — самый дешёвый вариант категории.
    const chosen = within.length
      ? within.reduce((a, b) => (b.unit > a.unit ? b : a))
      : priced.reduce((a, b) => (b.unit < a.unit ? b : a));
    selected.push({ catKey, item: chosen.item, quantity: 1 });
  }
  return selected;
}

// Метаданные типа услуги (item_type из WeddingItems): подпись, иконка, эндпоинт детали по id.
export const ITEM_TYPE_META = {
  restaurant:   { ru: 'Рестораны',            kz: 'Мейрамханалар',       icon: '🍽️', detail: (id) => `/api/restaurantbyid/${id}`, seg: 'restaurant' },
  hotel:        { ru: 'Гостиницы',            kz: 'Қонақ үйлер',         icon: '🏨', detail: (id) => `/api/hotel/${id}`, seg: 'hotel' },
  cake:         { ru: 'Торты',                kz: 'Торттар',             icon: '🎂', detail: (id) => `/api/cake/${id}`, seg: 'cake' },
  flowers:      { ru: 'Цветы',                kz: 'Гүлдер',              icon: '💐', detail: (id) => `/api/flowers/${id}`, seg: 'flowers' },
  tamada:       { ru: 'Тамада / ведущие',     kz: 'Тамада',              icon: '🎤', detail: (id) => `/api/tamada/${id}`, seg: 'tamada' },
  program:      { ru: 'Шоу-программа',         kz: 'Шоу-бағдарлама',      icon: '🎭', detail: (id) => `/api/program/${id}`, seg: 'program' },
  jewelry:      { ru: 'Ювелирные изделия',    kz: 'Зергерлік бұйымдар',  icon: '💍', detail: (id) => `/api/jewelry/${id}`, seg: 'jewelry' },
  traditionalGift:     { ru: 'Традиционные подарки', kz: 'Дәстүрлі сыйлықтар', icon: '🎀', detail: (id) => `/api/traditional-gift/${id}`, seg: 'traditionalgift' },
  'traditional-gifts': { ru: 'Традиционные подарки', kz: 'Дәстүрлі сыйлықтар', icon: '🎀', detail: (id) => `/api/traditional-gift/${id}`, seg: 'traditionalgift' },
  clothing:     { ru: 'Одежда',               kz: 'Киім',                icon: '👗', detail: (id) => `/api/clothing/${id}`, seg: 'clothing' },
  transport:    { ru: 'Прокат авто',          kz: 'Көлік жалдау',        icon: '🚗', detail: (id) => `/api/transport-vehicles/${id}`, seg: 'transport-vehicle' },
  'photo-video': { ru: 'Фото / видео',        kz: 'Фото / видео',        icon: '📸', detail: (id) => `/api/photo-video-services/${id}`, seg: 'photo-video-service' },
  suvenir:      { ru: 'Сувениры',             kz: 'Кәдесыйлар',          icon: '🎁', detail: (id) => `/api/suvenirs/${id}`, seg: 'suvenirs' },
  typography:   { ru: 'Типография',           kz: 'Типография',          icon: '🖨️', detail: (id) => `/api/typography/${id}`, seg: 'typography' },
  'technical-equipment-rental': { ru: 'Аренда оборудования', kz: 'Жабдық жалдау', icon: '🔊', detail: (id) => `/api/technical-equipment-rental/${id}`, seg: 'technical-equipment-rental' },
  fireworks:    { ru: 'Фейерверки',           kz: 'Фейерверктер',        icon: '🎆', detail: (id) => `/api/fireworks-services/${id}`, seg: 'fireworks-service' },
  good:         { ru: 'Товары',               kz: 'Тауарлар',            icon: '📦', detail: (id) => `/api/goodbyid/${id}`, seg: 'good' },
  alcohol:      { ru: 'Алкоголь',             kz: 'Алкоголь',            icon: '🍷', detail: (id) => `/api/alcohol/${id}`, seg: 'alcohol' },
};

// Формат суммы с разделителями (₸).
export function fmt(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return '0';
  return v.toLocaleString('ru-RU');
}
