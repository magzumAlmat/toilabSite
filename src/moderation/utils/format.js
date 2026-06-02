// Человекочитаемые подписи для известных полей записей.
const FIELD_LABELS = {
  name: 'Название',
  brand: 'Марка',
  city: 'Город',
  address: 'Адрес',
  phone: 'Телефон',
  description: 'Описание',
  capacity: 'Вместимость',
  seats: 'Мест',
  year: 'Год',
  color: 'Цвет',
  languages: 'Языки',
  flavors: 'Вкусы',
  price: 'Цена',
  pricePerPerson: 'Цена за гостя',
  pricePerKg: 'Цена за кг',
  pricePerHour: 'Цена за час',
  pricePerEvent: 'Цена за мероприятие',
  packagePrice: 'Цена пакета',
  durationHours: 'Длительность (ч)',
  minWeightKg: 'Мин. вес (кг)',
};

export function fieldLabel(key) {
  return FIELD_LABELS[key] || key;
}

export function formatValue(value) {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Да' : 'Нет';
  if (typeof value === 'number') return value.toLocaleString('ru-RU');
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
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
