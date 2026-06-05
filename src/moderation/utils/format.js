// Человекочитаемые подписи для известных полей записей.
const FIELD_LABELS = {
  // Общие
  name: 'Название',
  title: 'Название',
  itemName: 'Название',
  item_name: 'Название',
  companyName: 'Компания / название',
  studioName: 'Студия',
  teamName: 'Команда',
  salonName: 'Салон',
  storeName: 'Магазин',
  flowerName: 'Название',
  carName: 'Название авто',
  brand: 'Марка',
  city: 'Город',
  address: 'Адрес',
  district: 'Район',
  phone: 'Телефон',
  email: 'Email',
  description: 'Описание',
  category: 'Категория',
  type: 'Тип',
  status: 'Статус',
  rejectionReason: 'Причина отклонения',
  link: 'Сайт / ссылка',
  website: 'Сайт',
  portfolio: 'Портфолио',
  instagram: 'Instagram',
  rating: 'Рейтинг',
  experience: 'Опыт',
  specialization: 'Специализация',
  features: 'Особенности',
  equipment: 'Оборудование',
  material: 'Материал',
  // Кол-ва / параметры
  capacity: 'Вместимость',
  seats: 'Мест',
  roomsCount: 'Кол-во номеров',
  year: 'Год',
  color: 'Цвет',
  gender: 'Пол',
  languages: 'Языки',
  flavors: 'Вкусы',
  cuisine: 'Кухня',
  duration: 'Длительность',
  durationHours: 'Длительность (ч)',
  minWeightKg: 'Мин. вес (кг)',
  minRentalHours: 'Мин. аренда (ч)',
  workingHours: 'Часы работы',
  plateNumber: 'Гос. номер',
  carType: 'Тип авто',
  cakeType: 'Тип торта',
  flowerType: 'Тип цветов',
  hotelType: 'Тип',
  showType: 'Тип шоу',
  eventType: 'Тип мероприятия',
  serviceType: 'Услуги',
  checkInTime: 'Заезд',
  checkOutTime: 'Выезд',
  // Цены
  cost: 'Цена',
  price: 'Цена',
  averageCost: 'Средний чек',
  pricePerPerson: 'Цена за гостя',
  pricePerKg: 'Цена за кг',
  pricePerHour: 'Цена за час',
  pricePerMinute: 'Цена за минуту',
  pricePerDay: 'Цена за день',
  pricePerShow: 'Цена за шоу',
  pricePerEvent: 'Цена за мероприятие',
  packagePrice: 'Цена пакета',
  minBudget: 'Мин. бюджет',
  minPrice: 'Цена от',
  priceFrom: 'Цена от',
  // Флаги
  isAvailable: 'Доступно',
  hasLicense: 'Лицензия',
  hasSafetyInsurance: 'Страховка',
  deliveryAvailable: 'Доставка',
  setupServiceAvailable: 'Монтаж / установка',
  // Служебные
  specs: 'Характеристики',
  created_at: 'Создано',
  createdAt: 'Создано',
  updated_at: 'Обновлено',
  updatedAt: 'Обновлено',
  supplier_id: 'ID поставщика',
  id: 'ID',
};

// Поля с денежными значениями — форматируем в тенге.
const MONEY_FIELDS = new Set([
  'cost', 'price', 'averageCost', 'pricePerPerson', 'pricePerKg', 'pricePerHour',
  'pricePerMinute', 'pricePerDay', 'pricePerShow', 'pricePerEvent', 'packagePrice',
  'minBudget', 'maxBudget', 'minPrice', 'priceFrom', 'total_cost', 'budget',
]);

// Поля-ссылки (значение трактуем как URL/почту).
const LINK_FIELDS = new Set([
  'link', 'website', 'portfolio', 'site', 'url', 'instagram', 'social', 'email',
]);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/;

export function fieldLabel(key) {
  return FIELD_LABELS[key] || key;
}

const fmtMoney = (v) => `${Number(v).toLocaleString('ru-RU')} ₸`;

// Похоже ли значение на дату (ISO-строка или поле *_at).
function isDateLike(key, value) {
  if (typeof value !== 'string') return false;
  if (ISO_DATE_RE.test(value)) return true;
  return /(_at|At)$/.test(key) && !Number.isNaN(new Date(value).getTime());
}

// Возвращает href, если значение похоже на ссылку/почту, иначе null.
export function hrefFor(key, value) {
  if (value == null) return null;
  const v = String(value).trim();
  if (/^https?:\/\//i.test(v)) return v;
  if (key === 'email' || EMAIL_RE.test(v)) return `mailto:${v}`;
  if (LINK_FIELDS.has(key) && /^[\w.-]+\.[a-z]{2,}(\/|$)/i.test(v)) {
    return `https://${v.replace(/^\/+/, '')}`;
  }
  return null;
}

// Строковое представление значения с учётом ключа (деньги/даты/булевы/массивы).
export function formatValue(value, key = '') {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Да' : 'Нет';
  if (isDateLike(key, value)) return formatDate(value);
  if (MONEY_FIELDS.has(key) && Number(value) > 0) return fmtMoney(value);
  if (typeof value === 'number') return value.toLocaleString('ru-RU');
  if (Array.isArray(value)) {
    if (value.length === 0) return '—';
    return value
      .map((v) => (v && typeof v === 'object' ? JSON.stringify(v) : String(v)))
      .join(', ');
  }
  if (typeof value === 'object') {
    const keys = Object.keys(value);
    return keys.length === 0 ? '—' : JSON.stringify(value);
  }
  return String(value);
}

export function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// URL фото/видео по полю path ("uploads/...") — через same-origin прокси /toilab-api.
export function mediaUrl(path) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return `/toilab-api/${String(path).replace(/^\/+/, '')}`;
}

export { fmtMoney };
