'use client';

// Добавление услуги в УЖЕ созданное мероприятие-«категорию» (event-category) —
// как в моб. Item3Screen (addServicesToCategory). Для свадеб (weddings) бэкенд
// такого эндпоинта не даёт, поэтому компонент используется только при isCat.
//
// Поток: категория (из набора типа мероприятия) → список услуг города с поиском
// → количество → onAdd({ catKey, item, quantity, booking?, svc }). Для
// гостиниц/транспорта вместо количества — пикер номеров/авто (BookingPickers).
import { useEffect, useMemo, useState } from 'react';
import { fetchList } from './apiClient';
import {
  EVENT_TYPES, EVENT_CATEGORIES, BOOKING_CATEGORIES,
  catalogItemName, catalogItemCost, bookingCost, serviceTypeOf, fmt,
} from './events';
import { RoomPickerModal, VehiclePickerModal } from './BookingPickers';

const asArray = (res) => (Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : []);
// Часть эндпоинтов не фильтрует по городу — фильтруем на клиенте (как в мастере).
const filterCity = (arr, city) => {
  const sel = (city || '').trim().toLowerCase();
  if (!sel) return arr;
  return arr.filter((it) => { const c = String(it.city || it.transport?.city || '').trim().toLowerCase(); return !c || c === sel; });
};

// event_kind с бэка → набор категорий. Бэкенд хранит то, что прислал клиент:
// веб/моб. шлют 'traditional-family', ключ типа в вебе — 'traditional'.
function categoriesFor(eventKind) {
  const et = EVENT_TYPES.find((e) => e.key === eventKind || e.apiType === eventKind);
  if (et) return et.categories;
  // Неизвестный тип (например, 'conference' из моб.) — показываем все категории.
  return [...new Set(EVENT_TYPES.flatMap((e) => e.categories))];
}

export default function AddServiceModal({ eventKind, city, date, existing, lang, t, onAdd, onClose }) {
  const L = (o) => (lang === 'kz' ? o.kz : o.ru);
  const cats = useMemo(() => categoriesFor(eventKind), [eventKind]);
  const [catKey, setCatKey] = useState(cats[0]);
  const [list, setList] = useState(null); // null = грузим
  const [q, setQ] = useState('');
  const [qty, setQty] = useState({});     // { itemId: число }
  const [picker, setPicker] = useState(null); // { item } для гостиницы/салона
  const [adding, setAdding] = useState(null);

  useEffect(() => {
    let alive = true;
    setList(null);
    fetchList(EVENT_CATEGORIES[catKey].list)
      .then((res) => { if (alive) setList(filterCity(asArray(res), city)); })
      .catch(() => { if (alive) setList([]); });
    return () => { alive = false; };
  }, [catKey, city]);

  const cfg = EVENT_CATEGORIES[catKey];
  const isBooking = BOOKING_CATEGORIES.has(catKey);
  const isGuests = catKey === 'restaurants';
  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    const arr = list || [];
    return s ? arr.filter((it) => catalogItemName(it).toLowerCase().includes(s)) : arr;
  }, [list, q]);

  const keyOf = (item) => `${serviceTypeOf(catKey)}-${item.companyId || item.id}`;

  // Обычная услуга: цена × количество.
  const addPlain = async (item) => {
    const quantity = Math.max(1, parseInt(qty[item.id], 10) || 1);
    const cost = catalogItemCost(item, cfg.costField) * quantity;
    setAdding(item.id);
    try {
      await onAdd({
        catKey, item, quantity,
        svc: { serviceId: item.companyId || item.id, serviceType: serviceTypeOf(catKey), quantity, cost, room_ids: [] },
      });
    } finally { setAdding(null); }
  };

  // Гостиница/салон: из пикера приходит booking → room_ids и кол-во (номера / дни).
  const addBooking = async (booking) => {
    const item = picker.item;
    setPicker(null);
    const cost = bookingCost(booking);
    const room_ids = (booking.rooms || booking.vehicles || []).map((x) => x.id);
    const quantity = booking.rooms?.length ? booking.rooms.length : Math.max(1, parseInt(booking.days, 10) || 1);
    setAdding(item.id);
    try {
      await onAdd({
        catKey, item, quantity, booking,
        svc: { serviceId: item.companyId || item.id, serviceType: serviceTypeOf(catKey), quantity, cost, room_ids },
      });
    } finally { setAdding(null); }
  };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(40,33,28,0.55)', zIndex: 110, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 16, overflowY: 'auto' }}>
        <div onClick={(e) => e.stopPropagation()} style={{ background: '#FBF8F3', borderRadius: 18, width: '100%', maxWidth: 640, padding: 18, boxShadow: '0 24px 60px rgba(0,0,0,0.25)', margin: '24px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#4A3F35' }}>＋ {t('Добавить услугу', 'Қызмет қосу')}</h3>
            <button type="button" onClick={onClose} style={{ border: 'none', background: 'none', color: '#8C7B6D', cursor: 'pointer', fontSize: 24, lineHeight: 1 }}>×</button>
          </div>

          {/* Категории */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {cats.map((c) => {
              const cc = EVENT_CATEGORIES[c];
              const on = c === catKey;
              return (
                <button key={c} type="button" onClick={() => { setCatKey(c); setQ(''); }}
                  style={{ padding: '7px 12px', borderRadius: 999, fontSize: 13, fontWeight: 700, cursor: 'pointer', border: `1px solid ${on ? '#B08D57' : '#D4C4B0'}`, background: on ? '#B08D57' : '#fff', color: on ? '#fff' : '#4A3F35' }}>
                  {cc.icon} {L(cc)}
                </button>
              );
            })}
          </div>

          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('Поиск по названию', 'Атауы бойынша іздеу')}
            style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 12, border: '1px solid #D4C4B0', fontSize: 15, marginBottom: 12, background: '#fff' }} />
          <div style={{ fontSize: 12, color: '#8C7B6D', marginBottom: 10 }}>
            {t('Город', 'Қала')}: <b>{city || '—'}</b>
            {isGuests && ` · ${t('количество = число гостей', 'саны = қонақ саны')}`}
          </div>

          {/* Список */}
          {list === null ? (
            <p style={{ color: '#8C7B6D', padding: '16px 0' }}>{t('Загрузка…', 'Жүктелуде…')}</p>
          ) : shown.length === 0 ? (
            <p style={{ color: '#8C7B6D', padding: '16px 0' }}>{t('Поставщиков в этой категории пока нет.', 'Бұл санатта жеткізушілер әзірге жоқ.')}</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: '52vh', overflowY: 'auto' }}>
              {shown.map((item) => {
                const has = existing?.has(keyOf(item));
                const price = catalogItemCost(item, cfg.costField);
                const busy = adding === item.id;
                return (
                  <div key={item.id} style={{ background: '#fff', border: '1px solid rgba(212,196,176,0.6)', borderRadius: 12, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 160 }}>
                      <div style={{ fontWeight: 700, color: '#4A3F35' }}>{catalogItemName(item)}</div>
                      <div style={{ fontSize: 12, color: '#8C7B6D' }}>
                        {price > 0 ? `${fmt(price)} ₸` : t('цена по запросу', 'бағасы сұраныс бойынша')}
                        {isBooking && ` · ${t('выбор в пикере', 'таңдау пикерде')}`}
                      </div>
                    </div>
                    {!isBooking && !has && (
                      <input type="number" min={1} value={qty[item.id] ?? ''} placeholder="1"
                        onChange={(e) => setQty((m) => ({ ...m, [item.id]: e.target.value }))}
                        title={isGuests ? t('Гостей', 'Қонақтар') : t('Количество', 'Саны')}
                        style={{ width: 72, padding: '8px 10px', borderRadius: 10, border: '1px solid #D4C4B0', fontSize: 14 }} />
                    )}
                    {has ? (
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#2F7D57' }}>✓ {t('В мероприятии', 'Іс-шарада')}</span>
                    ) : (
                      <button type="button" disabled={busy}
                        onClick={() => (isBooking ? setPicker({ item }) : addPlain(item))}
                        style={{ padding: '8px 14px', borderRadius: 999, background: '#4A3F35', color: '#F5F0E9', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: 13 }}>
                        {busy ? '…' : isBooking ? t('Выбрать', 'Таңдау') : t('Добавить', 'Қосу')}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {picker && catKey === 'hotels' && (
        <RoomPickerModal hotel={picker.item} date={date} onSave={addBooking} onClose={() => setPicker(null)} t={t} />
      )}
      {picker && catKey === 'transport' && (
        <VehiclePickerModal salon={picker.item} date={date} onSave={addBooking} onClose={() => setPicker(null)} t={t} />
      )}
    </>
  );
}
