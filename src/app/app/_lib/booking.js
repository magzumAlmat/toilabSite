'use client';

// Проверка занятости и создание броней номеров/авто — порт моб. логики
// (src/utils/availability.js + HomeScreen post-create sequence).
import {
  checkRoomAvailability, checkVehicleAvailability,
  createRoomBooking, createTransportBooking, blockRestaurantDate,
  getRestaurantsByDate, getRoomBookings, getTransportBookings,
  cancelRoomBooking, cancelTransportBooking,
} from './apiClient';

// id ресторанов, ЗАНЯТЫХ на дату. Бэкенд отдаёт их одним запросом
// /api/restaurants-by-date?date=YYYY-MM-DD (проверено: после блока ресторан
// появляется в ответе). Ошибка сети → пустое множество: не мешаем работать.
export async function busyRestaurantIds(dateISO) {
  const ymd = String(dateISO || '').slice(0, 10);
  if (!ymd) return new Set();
  try {
    const res = await getRestaurantsByDate(ymd);
    const arr = Array.isArray(res?.restaurants) ? res.restaurants : Array.isArray(res?.data) ? res.data : [];
    return new Set(arr.map((r) => String(r.id ?? r.restaurantId)));
  } catch {
    return new Set();
  }
}
import { catalogItemName } from './events';

// Дата + n дней в локальном формате YYYY-MM-DD (без UTC-сдвига, как ymd в моб.).
export function addDaysISO(iso, n) {
  const [y, m, d] = String(iso).split('-').map(Number);
  const dt = new Date(y, (m || 1) - 1, (d || 1) + n);
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${dt.getFullYear()}-${mm}-${dd}`;
}

// Диапазоны как в моб. app: номера [date, date+nights), авто [date, date+days-1].
const roomRange = (date, nights) => [date, addDaysISO(date, Math.max(1, parseInt(nights, 10) || 1))];
const vehicleRange = (date, days) => [date, addDaysISO(date, Math.max(0, (parseInt(days, 10) || 1) - 1))];

// Занятость ДО создания мероприятия (как checkBookingConflicts в моб. app).
// selected: [{ catKey, item, booking? }] → массив строк-конфликтов (пусто = ок).
// Ошибки сети не считаем конфликтом (как в моб.: проверка best-effort).
export async function checkBookingConflicts(selected, dateISO, t) {
  const conflicts = [];
  const jobs = [];

  // Ресторан на выбранную дату: моб. app проверяет blockedDays ДО создания и не
  // даёт создать мероприятие на занятую дату (CorporateEventScreen.js:3073-3086).
  // Без этого веб создавал мероприятие, а блокировка даты потом падала с 400
  // («Этот день уже заблокирован»), причём молча.
  const restaurants = selected.filter((s) => s.catKey === 'restaurants');
  if (restaurants.length) {
    jobs.push(
      busyRestaurantIds(dateISO).then((busy) => {
        for (const s of restaurants) {
          if (busy.has(String(s.item.companyId || s.item.id))) {
            // Префикс «Занято на выбранную дату» добавляет вызывающая страница.
            conflicts.push(`${t('Ресторан', 'Мейрамхана')} ${catalogItemName(s.item)}`);
          }
        }
      }),
    );
  }

  for (const s of selected) {
    // Начало брони: выбранная в пикере дата (заезд/начало аренды) или дата мероприятия.
    const startISO = s.booking?.startDate || dateISO;
    if (s.booking?.rooms?.length) {
      const [ci, co] = roomRange(startISO, s.booking.nights);
      for (const r of s.booking.rooms) {
        jobs.push(
          checkRoomAvailability(r.id, ci, co)
            .then((res) => {
              if (res?.data?.available === false) {
                conflicts.push(`${t('Номер занят', 'Бөлме бос емес')}: ${r.name || r.room_number || r.id} — ${catalogItemName(s.item)}`);
              }
            })
            .catch(() => {}),
        );
      }
    }
    if (s.booking?.vehicles?.length) {
      const [sd, ed] = vehicleRange(startISO, s.booking.days);
      for (const v of s.booking.vehicles) {
        jobs.push(
          checkVehicleAvailability(v.id, sd, ed)
            .then((res) => {
              if (res?.isAvailable === false) {
                conflicts.push(`${t('Авто занято', 'Көлік бос емес')}: ${v.carName || v.id} — ${catalogItemName(s.item)}`);
              }
            })
            .catch(() => {}),
        );
      }
    }
  }
  await Promise.all(jobs);
  return conflicts;
}

// Брони ПОСЛЕ создания мероприятия (best-effort, как в моб.: сбои не откатывают
// событие, но собираются для показа пользователю). notes = "wedding:{id}".
export async function createBookingsForWedding(selected, dateISO, weddingId) {
  const notes = weddingId ? `wedding:${weddingId}` : 'wedding';
  const failures = [];
  for (const s of selected) {
    const parentId = s.item.companyId || s.item.id;
    const startISO = s.booking?.startDate || dateISO; // дата из пикера приоритетнее
    if (s.booking?.rooms?.length) {
      const [checkInDate, checkOutDate] = roomRange(startISO, s.booking.nights);
      for (const r of s.booking.rooms) {
        try {
          await createRoomBooking({ roomId: r.id, hotelId: parentId, checkInDate, checkOutDate, source: 'walk_in', notes });
        } catch {
          failures.push(`${r.name || r.room_number || r.id} (${catalogItemName(s.item)})`);
        }
      }
    }
    if (s.booking?.vehicles?.length) {
      const [startDate, endDate] = vehicleRange(startISO, s.booking.days);
      for (const v of s.booking.vehicles) {
        try {
          await createTransportBooking({ vehicleId: v.id, transportId: parentId, rentalType: 'daily', startDate, endDate, notes });
        } catch {
          failures.push(`${v.carName || v.id} (${catalogItemName(s.item)})`);
        }
      }
    }
    // Блок даты ресторана (как addDataBlockToRestaurant в моб. app). Сбой не
    // откатывает мероприятие, но и не замалчивается — попадает в failures,
    // чтобы пользователь знал, что дату нужно забронировать вручную.
    if (s.catKey === 'restaurants') {
      try {
        await blockRestaurantDate(parentId, dateISO);
      } catch {
        failures.push(`${catalogItemName(s.item)} — ${dateISO}`);
      }
    }
  }
  return failures;
}

// Отмена броней номеров/авто, связанных с услугами мероприятия — при удалении
// мероприятия или услуги (порт моб. Item3Screen.js:2633-2657). Список броней
// не хранит ссылку на мероприятие, поэтому матчим по дате + id номеров/авто из
// room_ids услуг. rows: [{ type: 'hotel'|'transport'|..., room_ids: [] }].
// Best-effort: сбои не мешают основному действию.
const bookingsArr = (res) =>
  (Array.isArray(res?.data?.data) ? res.data.data : Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []);
export async function cancelBookingsForRows(rows, dateISO) {
  const ymd = String(dateISO || '').slice(0, 10);
  if (!ymd) return;
  const roomIds = new Set();
  const vehicleIds = new Set();
  for (const r of rows || []) {
    const ids = (r.room_ids || []).map(Number).filter(Boolean);
    if (r.type === 'hotel' || r.type === 'hotels') ids.forEach((x) => roomIds.add(x));
    else if (r.type === 'transport') ids.forEach((x) => vehicleIds.add(x));
  }
  try {
    if (roomIds.size) {
      const arr = bookingsArr(await getRoomBookings(`date=${ymd}`));
      for (const b of arr) {
        if (roomIds.has(Number(b.roomId)) && b.bookingReference && b.status !== 'cancelled') {
          try { await cancelRoomBooking(b.bookingReference); } catch { /* best-effort */ }
        }
      }
    }
    if (vehicleIds.size) {
      const arr = bookingsArr(await getTransportBookings(`date=${ymd}`));
      for (const b of arr) {
        if (vehicleIds.has(Number(b.vehicleId)) && b.bookingReference && b.status !== 'cancelled') {
          try { await cancelTransportBooking(b.bookingReference); } catch { /* best-effort */ }
        }
      }
    }
  } catch { /* best-effort */ }
}
