// Спецификация форм создания объявлений по категориям.
// Источник истины — мобильное приложение (src/screens/Item2Screen.js):
//   • имена полей payload (как уходят на сервер),
//   • обязательность (по валидации в форме / notNull на бэкенде),
//   • сегмент пути для загрузки медиа: POST /api/{fileSegment}/{id}/files (поле "file").
// Ключи объектов совпадают с ключами SUPPLIER_GROUPS (supplier.js).

// Районы городов (из ItemEditScreen.js мобильного приложения).
export const CITY_DISTRICTS = {
  'Алматы': ['Медеуский', 'Бостандыкский', 'Алмалинский', 'Ауэзовский', 'Наурызбайский', 'Алатауский', 'Жетысуйский', 'Турксибский'],
  'Астана': ['Алматы', 'Байконур', 'Есиль', 'Сарыарка', 'Нура'],
  'Шымкент': ['Абайский', 'Аль-Фарабийский', 'Енбекшинский', 'Каратауский', 'Туранский'],
};

// Хелпер описания поля. type: text | number | tel | textarea | select | multiselect | bool | time | district
const f = (name, ru, kz, type = 'text', opts = {}) => ({ name, ru, kz, type, ...opts });

// Форматирование телефона как в мобильном приложении: +7 (XXX) XXX-XX-XX.
export function formatPhone(input) {
  let cleaned = String(input || '').replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+')) cleaned = '+' + cleaned.replace(/\+/g, '');
  if (!cleaned.startsWith('+7')) cleaned = '+7' + cleaned.replace(/^\+?\d*/g, '');
  const digits = cleaned.slice(2, 12);
  let out = '+7';
  if (digits.length > 0) out += ' (' + digits.slice(0, 3);
  if (digits.length > 3) out += ') ' + digits.slice(3, 6);
  if (digits.length > 6) out += '-' + digits.slice(6, 8);
  if (digits.length > 8) out += '-' + digits.slice(8, 10);
  return out;
}

const phoneValid = (p) => /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/.test(p || '');

// Общие наборы опций.
const GENDER = ['мужской', 'женский'];
const HOTEL_TYPES = ['Отель', 'Хостел', 'Мотель', 'Гостевой дом', 'Апартаменты'];
const PHOTO_SERVICE_TYPES = ['Фотосъёмка', 'Видеосъёмка', 'Аэросъёмка', 'Монтаж', 'Студийная съёмка'];
const FIREWORK_SHOW_TYPES = ['Наземный', 'Парковый', 'Высотный', 'Музыкальный', 'Дневной'];
const GOODS_CATEGORIES = [
  'Деньги', 'Бытовая техника', 'Посуда и кухонные принадлежности', 'Текстиль для дома',
  'Мебель и элементы интерьера', 'Подарки для отдыха и путешествий', 'Электроника и гаджеты',
  'Подарки для хобби и увлечений', 'Символические и романтические подарки', 'Сертификаты и подписки',
  'Алкоголь и гастрономия', 'Традиционные подарки', 'Ювелирные изделия',
  'Аренда технического оборудования', 'Типография',
];

// Приведение значения по типу поля (для payload).
function coerce(field, value) {
  if (value == null || value === '') return undefined;
  if (field.type === 'number' || field.numeric) { const n = Number(value); return Number.isNaN(n) ? undefined : n; }
  if (field.type === 'bool') return Boolean(value);
  if (field.type === 'multiselect') {
    const arr = Array.isArray(value) ? value : [value];
    const joined = arr.filter(Boolean).join(', ');
    return joined || undefined;
  }
  return value;
}

// Дефолтная сборка payload: имена полей = имена на сервере.
function defaultBuild(spec, values, ctx) {
  const p = {};
  for (const field of spec.fields) {
    const v = coerce(field, values[field.name]);
    if (v !== undefined) p[field.name] = v;
  }
  p.city = ctx.city;
  if (ctx.supplierId != null) p.supplier_id = ctx.supplierId;
  return p;
}

// ── Спецификации категорий ───────────────────────────────────────
// Каждая: { fileSegment, requirePhoto, fields:[...], build?(values,ctx) }
export const CATEGORY_FORMS = {
  restaurants: {
    fileSegment: 'restaurant',
    requirePhoto: true,
    fields: [
      f('name', 'Название ресторана', 'Мейрамхана атауы', 'text', { req: true }),
      f('capacity', 'Вместимость (гостей)', 'Сыйымдылығы', 'number', { req: true }),
      f('averageCost', 'Средний чек, ₸', 'Орташа чек, ₸', 'number', { req: true }),
      f('cuisine', 'Кухня (через запятую)', 'Асхана', 'text', { placeholder: 'Европейская, Итальянская' }),
      f('district', 'Район', 'Аудан', 'district', { req: true }),
      f('address', 'Адрес', 'Мекенжай', 'text', { req: true }),
      f('phone', 'Телефон', 'Телефон', 'tel', { req: true }),
      f('description', 'Описание', 'Сипаттама', 'textarea'),
    ],
  },
  hotels: {
    fileSegment: 'hotel',
    requirePhoto: true,
    fields: [
      f('name', 'Название', 'Атауы', 'text', { req: true }),
      f('averageCost', 'Средняя стоимость, ₸', 'Орташа құны, ₸', 'number', { req: true }),
      f('district', 'Район', 'Аудан', 'district', { req: true }),
      f('address', 'Адрес', 'Мекенжай', 'text', { req: true }),
      f('phone', 'Телефон', 'Телефон', 'tel', { req: true }),
      f('hotelType', 'Тип гостиницы', 'Қонақ үй түрі', 'select', { options: HOTEL_TYPES }),
      f('roomsCount', 'Кол-во номеров', 'Бөлмелер саны', 'number'),
      f('rating', 'Рейтинг (звёзды)', 'Рейтинг', 'select', { options: ['1', '2', '3', '4', '5'], numeric: true }),
      f('checkInTime', 'Заезд', 'Кіру уақыты', 'time'),
      f('checkOutTime', 'Выезд', 'Шығу уақыты', 'time'),
      f('email', 'Email', 'Email', 'text'),
      f('link', 'Сайт / ссылка', 'Сілтеме', 'text'),
      f('description', 'Описание', 'Сипаттама', 'textarea'),
    ],
  },
  clothing: {
    fileSegment: 'clothing',
    fields: [
      f('storeName', 'Название магазина', 'Дүкен атауы', 'text', { req: true }),
      f('itemName', 'Название товара', 'Тауар атауы', 'text', { req: true }),
      f('cost', 'Цена, ₸', 'Бағасы, ₸', 'number', { req: true }),
      f('gender', 'Пол', 'Жынысы', 'select', { options: GENDER }),
      f('district', 'Район', 'Аудан', 'district', { req: true }),
      f('address', 'Адрес', 'Мекенжай', 'text', { req: true }),
      f('phone', 'Телефон', 'Телефон', 'tel', { req: true }),
      f('description', 'Описание', 'Сипаттама', 'textarea'),
    ],
  },
  transport: {
    fileSegment: 'transport',
    fields: [
      f('salonName', 'Название салона / компании', 'Салон атауы', 'text', { req: true }),
      f('district', 'Район', 'Аудан', 'district', { req: true }),
      f('address', 'Адрес', 'Мекенжай', 'text', { req: true }),
      f('phone', 'Телефон', 'Телефон', 'tel', { req: true }),
      f('description', 'Описание', 'Сипаттама', 'textarea'),
    ],
    // Авто добавляются отдельными запросами (POST /api/transport-vehicles) после создания салона.
    vehicles: {
      endpoint: '/api/transport-vehicles',
      parentField: 'transportId',
      fileSegment: 'transport-vehicle',
      fields: [
        f('carName', 'Название авто', 'Көлік атауы', 'text', { req: true }),
        f('carType', 'Тип', 'Түрі', 'select', { req: true, options: ['Лимузин', 'Внедорожник', 'Седан', 'Минивэн', 'Кабриолет', 'Микроавтобус'] }),
        f('capacity', 'Вместимость', 'Сыйымдылығы', 'number', { req: true }),
        f('color', 'Цвет', 'Түсі', 'text'),
        f('pricePerDay', 'Цена за день, ₸', 'Күніне бағасы, ₸', 'number'),
        f('year', 'Год', 'Жылы', 'number'),
        f('description', 'Описание', 'Сипаттама', 'textarea'),
      ],
    },
  },
  tamada: {
    fileSegment: 'tamada',
    fields: [
      f('name', 'Имя / псевдоним', 'Аты', 'text', { req: true }),
      f('cost', 'Стоимость, ₸', 'Құны, ₸', 'number', { req: true }),
      f('district', 'Район', 'Аудан', 'district'),
      f('phone', 'Телефон', 'Телефон', 'tel', { req: true }),
      f('portfolio', 'Портфолио (ссылка)', 'Портфолио', 'text'),
      f('description', 'Описание', 'Сипаттама', 'textarea'),
    ],
  },
  programs: {
    fileSegment: 'program',
    fields: [
      f('companyName', 'Название команды / коллектива', 'Команда атауы', 'text', { req: true }),
      f('cost', 'Стоимость, ₸', 'Құны, ₸', 'number', { req: true }),
      f('type', 'Тип программы', 'Бағдарлама түрі', 'text'),
      f('district', 'Район', 'Аудан', 'district'),
      f('phone', 'Телефон', 'Телефон', 'tel', { req: true }),
      f('description', 'Описание', 'Сипаттама', 'textarea'),
    ],
    build: (spec, values, ctx) => {
      const p = defaultBuild(spec, values, ctx);
      if (p.cost != null) p.price = p.cost; // мобильный шлёт cost как price
      return p;
    },
  },
  jewelry: {
    fileSegment: 'jewelry',
    fields: [
      f('storeName', 'Название магазина', 'Дүкен атауы', 'text', { req: true }),
      f('itemName', 'Название изделия', 'Бұйым атауы', 'text', { req: true }),
      f('cost', 'Цена, ₸', 'Бағасы, ₸', 'number', { req: true }),
      f('material', 'Материал', 'Материал', 'text'),
      f('type', 'Тип', 'Түрі', 'text'),
      f('district', 'Район', 'Аудан', 'district', { req: true }),
      f('address', 'Адрес', 'Мекенжай', 'text', { req: true }),
      f('phone', 'Телефон', 'Телефон', 'tel', { req: true }),
      f('description', 'Описание', 'Сипаттама', 'textarea'),
    ],
  },
  suvenirs: {
    fileSegment: 'suvenirs',
    fields: [
      f('salonName', 'Название салона / магазина', 'Салон атауы', 'text', { req: true }),
      f('itemName', 'Название сувенира', 'Кәдесый атауы', 'text', { req: true }),
      f('cost', 'Цена, ₸', 'Бағасы, ₸', 'number', { req: true }),
      f('type', 'Тип', 'Түрі', 'text'),
      f('district', 'Район', 'Аудан', 'district', { req: true }),
      f('address', 'Адрес', 'Мекенжай', 'text', { req: true }),
      f('phone', 'Телефон', 'Телефон', 'tel', { req: true }),
      f('link', 'Ссылка', 'Сілтеме', 'text'),
      f('description', 'Описание', 'Сипаттама', 'textarea'),
    ],
  },
  traditionalGifts: {
    fileSegment: 'traditionalgift',
    fields: [
      f('salonName', 'Название салона / магазина', 'Салон атауы', 'text', { req: true }),
      f('itemName', 'Название подарка', 'Сыйлық атауы', 'text', { req: true }),
      f('cost', 'Цена, ₸', 'Бағасы, ₸', 'number', { req: true }),
      f('type', 'Тип', 'Түрі', 'text'),
      f('district', 'Район', 'Аудан', 'district', { req: true }),
      f('address', 'Адрес', 'Мекенжай', 'text', { req: true }),
      f('phone', 'Телефон', 'Телефон', 'tel', { req: true }),
      f('link', 'Ссылка', 'Сілтеме', 'text'),
      f('description', 'Описание', 'Сипаттама', 'textarea'),
    ],
  },
  flowers: {
    fileSegment: 'flowers',
    fields: [
      f('salonName', 'Название салона', 'Салон атауы', 'text', { req: true }),
      f('flowerName', 'Название букета / цветка', 'Гүл атауы', 'text', { req: true }),
      f('cost', 'Цена, ₸', 'Бағасы, ₸', 'number', { req: true }),
      f('flowerType', 'Тип цветов', 'Гүл түрі', 'text'),
      f('district', 'Район', 'Аудан', 'district', { req: true }),
      f('address', 'Адрес', 'Мекенжай', 'text', { req: true }),
      f('phone', 'Телефон', 'Телефон', 'tel', { req: true }),
      f('description', 'Описание', 'Сипаттама', 'textarea'),
    ],
  },
  cakes: {
    fileSegment: 'cake',
    fields: [
      f('name', 'Название', 'Атауы', 'text', { req: true }),
      f('cost', 'Цена, ₸', 'Бағасы, ₸', 'number', { req: true }),
      f('cakeType', 'Тип торта', 'Торт түрі', 'text'),
      f('district', 'Район', 'Аудан', 'district', { req: true }),
      f('address', 'Адрес', 'Мекенжай', 'text', { req: true }),
      f('phone', 'Телефон', 'Телефон', 'tel', { req: true }),
      f('description', 'Описание', 'Сипаттама', 'textarea'),
    ],
  },
  photoVideoServices: {
    fileSegment: 'photo-video-service',
    fields: [
      f('studioName', 'Название студии', 'Студия атауы', 'text', { req: true }),
      f('serviceType', 'Тип услуг', 'Қызмет түрі', 'multiselect', { req: true, options: PHOTO_SERVICE_TYPES }),
      f('specialization', 'Специализация', 'Мамандану', 'text'),
      f('district', 'Район', 'Аудан', 'district'),
      f('phone', 'Телефон', 'Телефон', 'tel', { req: true }),
      f('portfolio', 'Портфолио (ссылка)', 'Портфолио', 'text'),
      f('description', 'Описание', 'Сипаттама', 'textarea'),
    ],
  },
  fireworksServices: {
    fileSegment: 'fireworks-service',
    fields: [
      f('companyName', 'Название компании', 'Компания атауы', 'text', { req: true }),
      f('showType', 'Тип шоу', 'Шоу түрі', 'multiselect', { req: true, options: FIREWORK_SHOW_TYPES }),
      f('eventType', 'Тип мероприятия', 'Іс-шара түрі', 'text', { req: true }),
      f('pricePerShow', 'Цена за шоу, ₸', 'Шоу бағасы, ₸', 'number'),
      f('duration', 'Длительность, мин', 'Ұзақтығы, мин', 'number'),
      f('hasLicense', 'Есть лицензия', 'Лицензия бар', 'bool'),
      f('district', 'Район', 'Аудан', 'district'),
      f('phone', 'Телефон', 'Телефон', 'tel', { req: true }),
      f('link', 'Ссылка', 'Сілтеме', 'text'),
      f('description', 'Описание', 'Сипаттама', 'textarea'),
    ],
  },
  typography: {
    fileSegment: 'typography',
    fields: [
      f('companyName', 'Название компании', 'Компания атауы', 'text', { req: true }),
      f('district', 'Район', 'Аудан', 'district', { req: true }),
      f('address', 'Адрес', 'Мекенжай', 'text'),
      f('phone', 'Телефон', 'Телефон', 'tel', { req: true }),
      f('link', 'Ссылка / сайт', 'Сілтеме', 'text'),
      f('description', 'Описание', 'Сипаттама', 'textarea'),
    ],
  },
  technicalEquipmentRentals: {
    fileSegment: 'technical-equipment-rental',
    fields: [
      f('companyName', 'Название компании', 'Компания атауы', 'text', { req: true }),
      f('cost', 'Стоимость, ₸', 'Құны, ₸', 'number', { req: true }),
      f('district', 'Район', 'Аудан', 'district'),
      f('address', 'Адрес', 'Мекенжай', 'text'),
      f('phone', 'Телефон', 'Телефон', 'tel', { req: true }),
      f('link', 'Сайт / ссылка', 'Сілтеме', 'text'),
      f('description', 'Описание', 'Сипаттама', 'textarea'),
    ],
    build: (spec, values, ctx) => {
      const p = defaultBuild(spec, values, ctx);
      if (p.link != null) { p.website = p.link; delete p.link; } // мобильный шлёт link как website
      return p;
    },
  },
  goods: {
    fileSegment: 'good',
    fields: [
      f('category', 'Категория товара', 'Тауар санаты', 'select', { req: true, options: GOODS_CATEGORIES }),
      f('item_name', 'Название товара', 'Тауар атауы', 'text', { req: true }),
      f('cost', 'Цена, ₸', 'Бағасы, ₸', 'number', { req: true }),
      f('storeName', 'Название магазина', 'Дүкен атауы', 'text', { req: true }),
      f('district', 'Район', 'Аудан', 'district', { req: true }),
      f('address', 'Адрес', 'Мекенжай', 'text', { req: true }),
      f('phone', 'Телефон', 'Телефон', 'tel', { req: true }),
      f('link', 'Ссылка', 'Сілтеме', 'text'),
      f('description', 'Описание', 'Сипаттама', 'textarea'),
    ],
    build: (spec, values, ctx) => {
      // У товаров address/storeName/phone вложены в specs.
      return {
        category: values.category,
        item_name: values.item_name,
        description: values.description || '',
        cost: coerce({ type: 'number' }, values.cost),
        link: values.link || '',
        specs: {
          address: values.address,
          storeName: values.storeName,
          phone: values.phone,
        },
        district: values.district,
        city: ctx.city,
        supplier_id: ctx.supplierId,
      };
    },
  },
};

// Сборка payload для категории.
export function buildPayload(groupKey, values, ctx) {
  const spec = CATEGORY_FORMS[groupKey];
  if (!spec) return null;
  return spec.build ? spec.build(spec, values, ctx) : defaultBuild(spec, values, ctx);
}

// Проверка обязательных полей и телефона. Возвращает текст ошибки или ''.
export function validate(groupKey, values, files) {
  const spec = CATEGORY_FORMS[groupKey];
  if (!spec) return 'Категория не поддерживается';
  for (const field of spec.fields) {
    if (!field.req) continue;
    const v = values[field.name];
    const empty = v == null || v === '' || (Array.isArray(v) && v.length === 0);
    if (empty) return `Заполните поле «${field.ru}»`;
    if (field.type === 'tel' && !phoneValid(v)) return 'Телефон в формате +7 (XXX) XXX-XX-XX';
  }
  if (spec.requirePhoto && (!files || files.length === 0)) return 'Добавьте хотя бы одну фотографию';
  return '';
}

// Список ключей категорий, для которых есть форма (порядок как в SUPPLIER_GROUPS).
export const FORM_KEYS = Object.keys(CATEGORY_FORMS);
