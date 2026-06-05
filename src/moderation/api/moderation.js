// Слой API модерации. Когда USE_MOCK=true — работает на встроенных данных,
// иначе обращается к реальным эндпоинтам бэкенда.
//
// ── Контракт бэкенда (нужно реализовать на api.toilab.kz) ────────────────
//   GET  /api/moderation/pending?type=<type|all>&status=<status>&page=<n>&pageSize=<n>
//        → { items: ModerationEntry[], total, page, pageSize }
//   GET  /api/moderation/counts?status=<status>
//        → { [resourceType]: number }   // кол-во записей по каждому типу
//   GET  /api/moderation/:resourceType/:id
//        → ModerationEntry
//   POST /api/moderation/:resourceType/:id/approve
//        → ModerationEntry (status: 'approved')
//   POST /api/moderation/:resourceType/:id/reject   body: { reason }
//        → ModerationEntry (status: 'rejected')
//
//   ModerationEntry = {
//     id, resourceType, status: 'pending'|'approved'|'rejected',
//     createdAt, moderatedAt?, rejectionReason?,
//     supplier: { id, email, fullName },
//     data: { ...поля конкретной записи }
//   }
//
//   Все эндпоинты требуют заголовок Authorization: Bearer <token>
//   и проверяют, что у пользователя roleId === 1 (администратор).
// ─────────────────────────────────────────────────────────────────────────

import client from './client';
import { USE_MOCK } from '../config';
import { fileSegment } from '../resources';
import {
  mockListPending,
  mockCounts,
  mockGetEntry,
  mockApprove,
  mockReject,
} from './mockData';

// Небольшая задержка, чтобы мок вёл себя как сеть (видны спиннеры).
const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms));

export async function listPending({ type = 'all', status = 'pending', page = 1, pageSize = 20 } = {}) {
  if (USE_MOCK) {
    await delay();
    return mockListPending({ type, status, page, pageSize });
  }
  const { data } = await client.get('/api/moderation/pending', {
    params: { type, status, page, pageSize },
  });
  return data;
}

export async function fetchCounts(status = 'pending') {
  if (USE_MOCK) {
    await delay(150);
    return mockCounts(status);
  }
  const { data } = await client.get('/api/moderation/counts', { params: { status } });
  return data;
}

// Постранично собирает ВСЕ записи одного типа (или 'all') для статуса.
async function fetchPaged({ type, status, cap = 5000 }) {
  const pageSize = 100;
  let page = 1;
  let out = [];
  let total = Infinity;
  // Ограничиваем число итераций, чтобы не зациклиться на кривом ответе бэкенда.
  for (let i = 0; i < 100; i += 1) {
    const res = await listPending({ type, status, page, pageSize });
    const items = Array.isArray(res?.items) ? res.items : [];
    if (typeof res?.total === 'number') total = res.total;
    out = out.concat(items);
    if (items.length < pageSize || out.length >= total || out.length >= cap) break;
    page += 1;
  }
  return out;
}

// Возвращает ВСЕ записи для статуса с учётом типа. Для type='all' тянет каждый
// тип, у которого есть записи (по counts), и объединяет — иначе бэкенд на
// `type=all` отдаёт только один тип (товары). Так в очереди видны все категории.
export async function fetchAllEntries({ type = 'all', status = 'pending', counts = null } = {}) {
  if (type && type !== 'all') {
    return fetchPaged({ type, status });
  }
  let c = counts;
  if (!c) {
    try {
      c = await fetchCounts(status);
    } catch {
      c = {};
    }
  }
  const types = Object.entries(c || {})
    .filter(([, n]) => Number(n) > 0)
    .map(([t]) => t);
  // Нет разбивки по типам — откатываемся на постраничный обход type=all.
  if (types.length === 0) {
    return fetchPaged({ type: 'all', status });
  }
  const chunks = await Promise.all(
    types.map((t) => fetchPaged({ type: t, status })),
  );
  return chunks.flat();
}

export async function getEntry(resourceType, id) {
  if (USE_MOCK) {
    await delay();
    return mockGetEntry(resourceType, id);
  }
  const { data } = await client.get(`/api/moderation/${resourceType}/${id}`);
  return data;
}

// Фото/видео записи: GET /api/{segment}/{id}/files → [{ path, mimetype, ... }].
// Возвращаем нормализованный массив; при ошибке/моке — пустой список.
export async function getEntryFiles(resourceType, id) {
  if (USE_MOCK || !resourceType || id == null) return [];
  try {
    const { data } = await client.get(
      `/api/${fileSegment(resourceType)}/${id}/files`,
    );
    return Array.isArray(data) ? data : data?.data || [];
  } catch {
    return [];
  }
}

export async function approveEntry(resourceType, id) {
  if (USE_MOCK) {
    await delay();
    return mockApprove(resourceType, id);
  }
  const { data } = await client.post(
    `/api/moderation/${resourceType}/${id}/approve`,
  );
  return data;
}

export async function rejectEntry(resourceType, id, reason) {
  if (USE_MOCK) {
    await delay();
    return mockReject(resourceType, id, reason);
  }
  const { data } = await client.post(
    `/api/moderation/${resourceType}/${id}/reject`,
    { reason },
  );
  return data;
}
