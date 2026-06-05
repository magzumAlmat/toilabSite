// Реестр типов записей, которые создают поставщики (roleId=2) в мобильном
// приложении. `type` совпадает с resourceType, который возвращает бэкенд в
// очереди модерации. `label` — человекочитаемое название для интерфейса.

export const RESOURCE_TYPES = [
  { type: 'restaurant', label: 'Рестораны', icon: '🍽️' },
  { type: 'cake', label: 'Торты', icon: '🎂' },
  { type: 'flowers', label: 'Цветы', icon: '💐' },
  { type: 'transport', label: 'Транспорт', icon: '🚗' },
  { type: 'tamada', label: 'Тамада / ведущие', icon: '🎤' },
  { type: 'program', label: 'Программа / шоу', icon: '🎭' },
  { type: 'jewelry', label: 'Ювелирные изделия', icon: '💍' },
  { type: 'clothing', label: 'Одежда', icon: '👗' },
  { type: 'alcohol', label: 'Алкоголь', icon: '🍷' },
  { type: 'photo-video-service', label: 'Фото / видео', icon: '📸' },
  { type: 'fireworks-service', label: 'Фейерверки', icon: '🎆' },
  { type: 'suvenir', label: 'Сувениры', icon: '🎁' },
  { type: 'typography', label: 'Типография', icon: '🖨️' },
  { type: 'technical-equipment-rental', label: 'Аренда оборудования', icon: '🔊' },
  { type: 'hotel', label: 'Гостиницы', icon: '🏨' },
  { type: 'good', label: 'Товары', icon: '📦' },
  { type: 'traditional-gift', label: 'Традиционные подарки', icon: '🎀' },
];

const LABEL_BY_TYPE = Object.fromEntries(
  RESOURCE_TYPES.map((r) => [r.type, r.label]),
);

const ICON_BY_TYPE = Object.fromEntries(
  RESOURCE_TYPES.map((r) => [r.type, r.icon]),
);

// Сегмент пути для фото/видео записи: GET /api/{segment}/{id}/files.
// Для большинства типов совпадает с resourceType, но у части бэкенд использует
// другое имя (suvenir → suvenirs, traditional-gift → traditionalgift).
const FILE_SEGMENT_BY_TYPE = {
  suvenir: 'suvenirs',
  'traditional-gift': 'traditionalgift',
};

export function resourceLabel(type) {
  return LABEL_BY_TYPE[type] || type;
}

export function resourceIcon(type) {
  return ICON_BY_TYPE[type] || '📄';
}

export function fileSegment(type) {
  return FILE_SEGMENT_BY_TYPE[type] || type;
}
