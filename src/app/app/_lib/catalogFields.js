// Локализация полей карточек каталога + геттеры имени/цены + сегменты для медиа.
import { translations } from './translations';

// Перевод значения данных на язык (kz — через словарь, по частям через запятую).
export const trVal = (s, lang) => (lang !== 'kz' || s == null ? s : String(s).split(', ').map((p) => translations[p] || p).join(', '));

// Сегмент пути файлов по slug категории: GET /api/{segment}/{id}/files.
// (совпадает с entityTypeMap мобильного приложения — у некоторых отличается от slug)
export const FILE_SEGMENT = {
  restaurants: 'restaurant', cakes: 'cake', flowers: 'flowers', transport: 'transport',
  tamada: 'tamada', program: 'program', jewelry: 'jewelry', clothing: 'clothing',
  alcohol: 'alcohol', 'photo-video': 'photo-video-service', fireworks: 'fireworks-service',
  suvenirs: 'suvenirs', typography: 'typography', equipment: 'technical-equipment-rental',
  hotels: 'hotel', goods: 'good', 'traditional-gift': 'traditionalgift',
};

// URL картинки по полю path ("uploads/...") — через same-origin прокси.
export const fileUrl = (path) => {
  if (!path) return '';
  if (/^https?:\/\//.test(path)) return path;
  return `/toilab-api/${String(path).replace(/^\/+/, '')}`;
};

const NAME_FIELDS = ['name', 'title', 'fullName', 'companyName', 'studioName', 'teamName', 'storeName', 'salonName', 'flowerName', 'itemName', 'carName', 'item_name'];
const PRICE_FIELDS = ['averageCost', 'cost', 'price', 'pricePerDay', 'pricePerShow', 'minPrice', 'priceFrom'];

const MONEY_FIELDS = new Set(['averageCost', 'cost', 'price', 'pricePerDay', 'pricePerShow', 'pricePerHour', 'pricePerMinute', 'minPrice', 'priceFrom', 'minBudget', 'maxBudget', 'total_cost', 'budget']);

// Подписи полей (ru / kz).
const FIELD_LABELS = {
  capacity: ['Вместимость', 'Сыйымдылығы'],
  cuisine: ['Кухня', 'Асхана'],
  averageCost: ['Средний чек', 'Орташа чек'],
  cost: ['Цена', 'Бағасы'],
  price: ['Цена', 'Бағасы'],
  pricePerDay: ['Цена за день', 'Күніне бағасы'],
  pricePerShow: ['Цена за шоу', 'Шоу бағасы'],
  pricePerHour: ['Цена за час', 'Сағатына бағасы'],
  pricePerMinute: ['Цена за минуту', 'Минутына бағасы'],
  minBudget: ['Мин. бюджет', 'Мин. бюджет'],
  minRentalHours: ['Мин. аренда, ч', 'Мин. жалдау, сағ'],
  workingHours: ['Часы работы', 'Жұмыс уақыты'],
  plateNumber: ['Гос. номер', 'Мемлекеттік нөмір'],
  features: ['Особенности', 'Ерекшеліктері'],
  equipment: ['Оборудование', 'Жабдық'],
  isAvailable: ['Доступно', 'Қолжетімді'],
  hasSafetyInsurance: ['Страховка безопасности', 'Қауіпсіздік сақтандыруы'],
  deliveryAvailable: ['Доставка', 'Жеткізу'],
  setupServiceAvailable: ['Монтаж / установка', 'Монтаж қызметі'],
  address: ['Адрес', 'Мекенжай'],
  phone: ['Телефон', 'Телефон'],
  district: ['Район', 'Аудан'],
  city: ['Город', 'Қала'],
  email: ['Email', 'Email'],
  link: ['Сайт', 'Сілтеме'],
  website: ['Сайт', 'Сілтеме'],
  portfolio: ['Портфолио', 'Портфолио'],
  rating: ['Рейтинг', 'Рейтинг'],
  roomsCount: ['Кол-во номеров', 'Бөлмелер саны'],
  hotelType: ['Тип', 'Түрі'],
  checkInTime: ['Заезд', 'Кіру'],
  checkOutTime: ['Выезд', 'Шығу'],
  gender: ['Пол', 'Жынысы'],
  material: ['Материал', 'Материал'],
  type: ['Тип', 'Түрі'],
  cakeType: ['Тип торта', 'Торт түрі'],
  flowerType: ['Тип цветов', 'Гүл түрі'],
  serviceType: ['Услуги', 'Қызметтер'],
  showType: ['Тип шоу', 'Шоу түрі'],
  eventType: ['Тип мероприятия', 'Іс-шара түрі'],
  duration: ['Длительность', 'Ұзақтығы'],
  specialization: ['Специализация', 'Мамандану'],
  category: ['Категория', 'Санат'],
  carType: ['Тип авто', 'Көлік түрі'],
  color: ['Цвет', 'Түсі'],
  year: ['Год', 'Жылы'],
  hasLicense: ['Лицензия', 'Лицензия'],
  experience: ['Опыт', 'Тәжірибе'],
};

// Скрытые поля (служебные + уже показанные отдельно).
const HIDDEN = new Set([
  'id', '_id', 'uuid', '__v', 'status', 'rejectionReason', 'moderatedAt',
  'images', 'photos', 'gallery', 'files', 'imageUrl', 'image', 'photo', 'cover', 'mainImage', 'avatar',
  'description', 'desc', 'about', 'createdAt', 'updatedAt', 'created_at', 'updated_at',
  ...NAME_FIELDS, ...PRICE_FIELDS,
]);

const isHiddenKey = (k) =>
  HIDDEN.has(k) || /(_id|Id|_at|At)$/.test(k) || k === 'companyId' || k === 'supplier_id';

const firstNonEmpty = (item, keys) => {
  for (const k of keys) {
    const v = item?.[k];
    if (v != null && v !== '') return v;
  }
  return undefined;
};

const fmtMoney = (v) => `${Number(v).toLocaleString('ru-RU')} ₸`;

export function getName(item, fallback = '—') {
  // Составное имя для салонов (salonName — flowerName/itemName), иначе первое непустое.
  const base = item?.salonName || item?.storeName;
  const sub = item?.flowerName || item?.itemName;
  if (base && sub) return `${base} — ${sub}`;
  return firstNonEmpty(item, NAME_FIELDS) ?? fallback;
}

export function getPrice(item) {
  const v = firstNonEmpty(item, PRICE_FIELDS);
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

// Поля-ссылки + определение URL/email для кликабельности.
const LINK_FIELDS = new Set(['link', 'website', 'portfolio', 'site', 'url', 'instagram', 'social']);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Возвращает href, если значение похоже на ссылку/почту, иначе null.
function hrefFor(key, value) {
  const v = String(value).trim();
  if (/^https?:\/\//i.test(v)) return v;
  if (key === 'email' || EMAIL_RE.test(v)) return `mailto:${v}`;
  if (LINK_FIELDS.has(key) && /^[\w.-]+\.[a-z]{2,}(\/|$)/i.test(v)) return `https://${v.replace(/^\/+/, '')}`;
  return null;
}

// Пары [label, value, href] для таблицы характеристик (локализованные, отформатированные).
export function getSpecs(item, lang) {
  if (!item || typeof item !== 'object') return [];
  const L = lang === 'kz' ? 1 : 0;
  const out = [];
  const pushRow = (k, v) => {
    if (isHiddenKey(k) || v == null || v === '') return;
    let value;
    let href = null;
    if (typeof v === 'boolean') value = v ? (L ? 'Иә' : 'Да') : (L ? 'Жоқ' : 'Нет');
    else if (typeof v === 'number' || typeof v === 'string') {
      if (MONEY_FIELDS.has(k) && Number(v) > 0) value = fmtMoney(v);
      else { href = hrefFor(k, v); value = href ? String(v) : trVal(String(v), lang); }
    } else return;
    if (String(value).length > 200) return;
    const label = FIELD_LABELS[k] ? FIELD_LABELS[k][L] : k;
    out.push([label, value, href]);
  };
  for (const [k, v] of Object.entries(item)) {
    if (isHiddenKey(k)) continue;
    if (v == null || v === '') continue;
    if (typeof v === 'object' && !Array.isArray(v)) {
      // вложенный объект (напр. specs у товаров) — разворачиваем примитивные поля
      for (const [k2, v2] of Object.entries(v)) pushRow(k2, v2);
      continue;
    }
    pushRow(k, v);
  }
  return out;
}

export { fmtMoney };
