// Мок-хранилище очереди модерации. Используется, когда NEXT_PUBLIC_USE_MOCK=true,
// чтобы фронтенд работал без готового бэкенда. Состояние живёт в памяти
// вкладки (сбрасывается при перезагрузке страницы).

let nextId = 1000;
const now = Date.now();
const minutesAgo = (m) => new Date(now - m * 60_000).toISOString();

// Каждая запись очереди модерации имеет единый «конверт»:
//   id, resourceType, status, createdAt, supplier{...}, data{...}
let queue = [
  {
    id: 1,
    resourceType: 'restaurant',
    status: 'pending',
    createdAt: minutesAgo(12),
    supplier: { id: 42, email: 'teacher@example.com', fullName: 'Айбек Нурланов' },
    data: {
      name: 'Ресторан «Алтын Орда»',
      city: 'Алматы',
      address: 'пр. Достык 240',
      capacity: 350,
      pricePerPerson: 12000,
      phone: '+7 701 234 56 78',
      description: 'Банкетный зал для свадеб и корпоративов до 350 гостей.',
    },
  },
  {
    id: 2,
    resourceType: 'cake',
    status: 'pending',
    createdAt: minutesAgo(40),
    supplier: { id: 51, email: 'sweet@example.com', fullName: 'Гульнара Сафина' },
    data: {
      name: 'Свадебный торт «Ак Тилек»',
      city: 'Астана',
      pricePerKg: 9500,
      minWeightKg: 5,
      flavors: 'Шоколад, ваниль, красный бархат',
      description: 'Многоярусные торты на заказ с доставкой.',
    },
  },
  {
    id: 3,
    resourceType: 'transport',
    status: 'pending',
    createdAt: minutesAgo(75),
    supplier: { id: 51, email: 'sweet@example.com', fullName: 'Гульнара Сафина' },
    data: {
      brand: 'Mercedes-Benz S-Class',
      city: 'Астана',
      year: 2023,
      color: 'Белый',
      pricePerHour: 25000,
      seats: 4,
      description: 'Премиум-авто на свадьбу с водителем.',
    },
  },
  {
    id: 4,
    resourceType: 'photo-video-service',
    status: 'pending',
    createdAt: minutesAgo(140),
    supplier: { id: 67, email: 'studio@example.com', fullName: 'Ержан Касымов' },
    data: {
      name: 'Студия «Moment»',
      city: 'Шымкент',
      packagePrice: 180000,
      durationHours: 8,
      description: 'Фото + видео полного дня, 2 оператора, дрон.',
    },
  },
  {
    id: 5,
    resourceType: 'tamada',
    status: 'pending',
    createdAt: minutesAgo(200),
    supplier: { id: 67, email: 'studio@example.com', fullName: 'Ержан Касымов' },
    data: {
      name: 'Ведущий Бауыржан',
      city: 'Шымкент',
      languages: 'Казахский, русский',
      pricePerEvent: 200000,
      description: 'Ведущий свадеб и тоев, 10 лет опыта.',
    },
  },
];

const clone = (v) => JSON.parse(JSON.stringify(v));

export function mockListPending({ type = 'all', status = 'pending', page = 1, pageSize = 20 } = {}) {
  let items = queue.filter((e) => e.status === status);
  if (type && type !== 'all') {
    items = items.filter((e) => e.resourceType === type);
  }
  items = items.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const total = items.length;
  const start = (page - 1) * pageSize;
  return {
    items: clone(items.slice(start, start + pageSize)),
    total,
    page,
    pageSize,
  };
}

export function mockCounts(status = 'pending') {
  const counts = {};
  for (const e of queue) {
    if (e.status !== status) continue;
    counts[e.resourceType] = (counts[e.resourceType] || 0) + 1;
  }
  return counts;
}

export function mockGetEntry(resourceType, id) {
  const entry = queue.find(
    (e) => e.resourceType === resourceType && String(e.id) === String(id),
  );
  return entry ? clone(entry) : null;
}

export function mockApprove(resourceType, id) {
  const entry = queue.find(
    (e) => e.resourceType === resourceType && String(e.id) === String(id),
  );
  if (entry) {
    entry.status = 'approved';
    entry.moderatedAt = new Date().toISOString();
  }
  return entry ? clone(entry) : null;
}

export function mockReject(resourceType, id, reason) {
  const entry = queue.find(
    (e) => e.resourceType === resourceType && String(e.id) === String(id),
  );
  if (entry) {
    entry.status = 'rejected';
    entry.rejectionReason = reason || '';
    entry.moderatedAt = new Date().toISOString();
  }
  return entry ? clone(entry) : null;
}

// Позволяет демонстрировать «поступление» новых записей в очередь.
export function mockSeedExtra() {
  nextId += 1;
  queue.push({
    id: nextId,
    resourceType: 'flowers',
    status: 'pending',
    createdAt: new Date().toISOString(),
    supplier: { id: 88, email: 'flowers@example.com', fullName: 'Динара Ким' },
    data: {
      name: 'Букет «Весна»',
      city: 'Алматы',
      price: 25000,
      description: 'Свежие сезонные букеты.',
    },
  });
}
