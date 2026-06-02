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

export async function getEntry(resourceType, id) {
  if (USE_MOCK) {
    await delay();
    return mockGetEntry(resourceType, id);
  }
  const { data } = await client.get(`/api/moderation/${resourceType}/${id}`);
  return data;
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
