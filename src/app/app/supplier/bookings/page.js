'use client';

// Календарь броней поставщика — веб-порт мобильного BookingsCalendarScreen
// (mode=supplier). Логика 1-в-1 с мобилкой:
// - чипы типов показываются только для имеющихся у поставщика объектов;
// - фильтр «Объект» виден только если объектов данного типа больше одного;
// - ресторан = блокировка одного дня, гостиница = одна ночь (checkOut = +1),
//   авто = диапазон дат с проверкой занятых дней;
// - брони чужих объектов отфильтровываются по id из /api/supplier/listings.
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useApp } from '../../_lib/AppContext';
import {
  getSupplierListings,
  fetchAllBlockedDays, blockRestaurantDate, unblockRestaurantDate,
  getRoomBookings, createRoomBooking, cancelRoomBooking, getRoomsByHotel,
  getTransportBookings, createTransportBooking, cancelTransportBooking, getVehiclesByTransportId,
} from '../../_lib/apiClient';

const C = {
  bg: '#F5F0E9', card: '#FFFFFF', line: 'rgba(212,196,176,0.6)',
  text: '#4A3F35', sub: '#6B5A4D', primary: '#B08D57',
  rest: '#2E9E5B', hotel: '#3A6EA5', car: '#C77700', danger: '#B91C1C',
};

const toYMD = (d) => {
  if (!d) return '';
  if (typeof d === 'string') return d.slice(0, 10);
  const x = new Date(d);
  return Number.isNaN(x.getTime()) ? '' : x.toISOString().slice(0, 10);
};
const nextDay = (d) => { const x = new Date(`${d}T00:00:00Z`); x.setUTCDate(x.getUTCDate() + 1); return x.toISOString().slice(0, 10); };
const eachDay = (from, to) => {
  const out = [];
  let cur = new Date(`${toYMD(from)}T00:00:00Z`);
  const end = new Date(`${toYMD(to || from)}T00:00:00Z`);
  while (cur <= end && out.length < 366) {
    out.push(cur.toISOString().slice(0, 10));
    cur = new Date(cur.getTime() + 24 * 60 * 60 * 1000);
  }
  return out;
};
const between = (day, start, end) => toYMD(start) <= day && day <= toYMD(end || start);

const MONTHS_RU = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
const MONTHS_KZ = ['Қаңтар', 'Ақпан', 'Наурыз', 'Сәуір', 'Мамыр', 'Маусым', 'Шілде', 'Тамыз', 'Қыркүйек', 'Қазан', 'Қараша', 'Желтоқсан'];
const DOW_RU = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const DOW_KZ = ['Дс', 'Сс', 'Ср', 'Бс', 'Жм', 'Сб', 'Жс'];

export default function SupplierBookingsPage() {
  const { ready, isAuth, user, lang, t } = useApp();
  const isSupplier = user?.roleId === 2;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const today = toYMD(new Date());
  const [selectedDay, setSelectedDay] = useState(today);
  const [month, setMonth] = useState(() => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() }; });

  const [typeFilter, setTypeFilter] = useState('all');
  const [objectId, setObjectId] = useState(null);

  // Собственные объекты поставщика (из /api/supplier/listings)
  const [restaurants, setRestaurants] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [salons, setSalons] = useState([]);
  // Брони (уже отфильтрованные по своим объектам)
  const [blocked, setBlocked] = useState([]);
  const [roomBookings, setRoomBookings] = useState([]);
  const [carBookings, setCarBookings] = useState([]);

  const [addOpen, setAddOpen] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [listings, blockedRes, roomsRes, carsRes] = await Promise.all([
        getSupplierListings(),
        fetchAllBlockedDays().catch(() => []),
        getRoomBookings().catch(() => ({ data: [] })),
        getTransportBookings().catch(() => []),
      ]);
      const d = listings?.data || listings || {};
      const myRests = d.restaurants || [];
      const myHotels = d.hotels || [];
      const mySalons = d.transport || [];
      setRestaurants(myRests);
      setHotels(myHotels);
      setSalons(mySalons);

      const restIds = new Set(myRests.map((r) => r.id));
      const hotelIds = new Set(myHotels.map((h) => h.id));
      const salonIds = new Set(mySalons.map((s) => s.id));

      const blockedArr = (Array.isArray(blockedRes) ? blockedRes : blockedRes?.data || [])
        .map((b) => ({ ...b, date: toYMD(b.date) }))
        .filter((b) => restIds.has(b.restaurantId));
      setBlocked(blockedArr);

      const rooms = (Array.isArray(roomsRes) ? roomsRes : roomsRes?.data?.data || roomsRes?.data || [])
        .filter((b) => b.status !== 'cancelled')
        .filter((b) => hotelIds.has(b.room?.hotel?.id ?? b.room?.hotelId ?? b.hotelId));
      setRoomBookings(rooms);

      const cars = (Array.isArray(carsRes) ? carsRes : carsRes?.data?.data || carsRes?.data || [])
        .filter((b) => b.status !== 'cancelled')
        .filter((b) => salonIds.has(b.transportId ?? b.transport?.id));
      setCarBookings(cars);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (ready && isSupplier) loadAll(); else if (ready) setLoading(false); }, [ready, isSupplier, loadAll]);

  // Доступные типы — только те, по которым есть объекты (как в мобилке)
  const availableTypes = useMemo(() => {
    const base = [];
    if (restaurants.length) base.push({ key: 'restaurant', ru: 'Рестораны', kz: 'Мейрамханалар' });
    if (hotels.length) base.push({ key: 'hotel', ru: 'Гостиницы', kz: 'Қонақ үйлер' });
    if (salons.length) base.push({ key: 'car', ru: 'Авто', kz: 'Авто' });
    if (base.length > 1) base.unshift({ key: 'all', ru: 'Все', kz: 'Барлығы' });
    return base;
  }, [restaurants, hotels, salons]);

  // Один тип — выбираем его автоматически
  useEffect(() => {
    const real = availableTypes.filter((x) => x.key !== 'all');
    if (real.length === 1 && typeFilter === 'all') setTypeFilter(real[0].key);
  }, [availableTypes, typeFilter]);

  const changeType = (key) => { setTypeFilter(key); setObjectId(null); };

  const hotelIdOf = (b) => b.room?.hotel?.id ?? b.room?.hotelId ?? b.hotelId ?? null;
  const salonIdOf = (b) => b.transportId ?? b.transport?.id ?? null;

  const fBlocked = useMemo(() => {
    if (typeFilter !== 'all' && typeFilter !== 'restaurant') return [];
    return objectId ? blocked.filter((b) => b.restaurantId === objectId) : blocked;
  }, [blocked, typeFilter, objectId]);
  const fRooms = useMemo(() => {
    if (typeFilter !== 'all' && typeFilter !== 'hotel') return [];
    return objectId ? roomBookings.filter((b) => hotelIdOf(b) === objectId) : roomBookings;
  }, [roomBookings, typeFilter, objectId]);
  const fCars = useMemo(() => {
    if (typeFilter !== 'all' && typeFilter !== 'car') return [];
    return objectId ? carBookings.filter((b) => salonIdOf(b) === objectId) : carBookings;
  }, [carBookings, typeFilter, objectId]);

  const filterObjects = useMemo(() => {
    if (typeFilter === 'restaurant') return restaurants.map((r) => ({ label: r.name || `#${r.id}`, value: r.id }));
    if (typeFilter === 'hotel') return hotels.map((h) => ({ label: h.name || `#${h.id}`, value: h.id }));
    if (typeFilter === 'car') return salons.map((s) => ({ label: s.salonName || `#${s.id}`, value: s.id }));
    return [];
  }, [typeFilter, restaurants, hotels, salons]);
  const showObjectFilter = typeFilter !== 'all' && filterObjects.length > 1;

  // Точки на календаре
  const dots = useMemo(() => {
    const m = {};
    const add = (date, color) => {
      const d = toYMD(date);
      if (!d) return;
      (m[d] ||= new Set()).add(color);
    };
    fBlocked.forEach((b) => add(b.date, C.rest));
    fRooms.forEach((b) => add(b.checkInDate || b.date, C.hotel));
    fCars.forEach((b) => (b.startDate ? eachDay(b.startDate, b.endDate) : [toYMD(b.date)]).forEach((d) => add(d, C.car)));
    return m;
  }, [fBlocked, fRooms, fCars]);

  // Брони выбранного дня
  const dayRestaurants = useMemo(() => fBlocked.filter((b) => b.date === selectedDay), [fBlocked, selectedDay]);
  const dayRooms = useMemo(() => fRooms.filter((b) => {
    const ci = b.checkInDate || b.date; const co = b.checkOutDate || b.date;
    return ci ? (toYMD(ci) <= selectedDay && selectedDay <= toYMD(co)) : false;
  }), [fRooms, selectedDay]);
  const dayCars = useMemo(() => {
    const list = fCars.filter((b) => (b.startDate ? between(selectedDay, b.startDate, b.endDate) : toYMD(b.date) === selectedDay));
    // Многодневная бронь из веба = N строк с ref «база-1..-N» — группируем
    const groups = new Map();
    list.forEach((b) => {
      const baseRef = (b.bookingReference || '').replace(/-\d+$/, '');
      const key = baseRef || `${b.vehicleId}-${b.startDate}-${b.endDate}`;
      if (!groups.has(key)) groups.set(key, b);
    });
    return Array.from(groups.values());
  }, [fCars, selectedDay]);

  const confirmDel = (title, fn) => {
    if (window.confirm(`${t('Удалить бронь?', 'Броньді жою керек пе?')}\n${title}`)) fn();
  };
  const wrap = (fn) => async () => { try { await fn(); await loadAll(); } catch (e) { window.alert(e.message); } };

  // Сетка месяца (Пн-первый)
  const grid = useMemo(() => {
    const first = new Date(Date.UTC(month.y, month.m, 1));
    const lead = (first.getUTCDay() + 6) % 7;
    const daysIn = new Date(Date.UTC(month.y, month.m + 1, 0)).getUTCDate();
    const cells = [];
    for (let i = 0; i < lead; i++) cells.push(null);
    for (let d = 1; d <= daysIn; d++) cells.push(toYMD(new Date(Date.UTC(month.y, month.m, d))));
    while (cells.length % 7) cells.push(null);
    return cells;
  }, [month]);

  if (ready && (!isAuth || !isSupplier)) {
    return (
      <div style={{ textAlign: 'center', padding: '56px 0' }}>
        <p style={{ color: C.sub, marginBottom: 20 }}>{t('Раздел доступен только поставщикам.', 'Бөлім тек жеткізушілерге қолжетімді.')}</p>
        <Link href="/app/login" style={{ color: C.primary }}>{t('Войти', 'Кіру')}</Link>
      </div>
    );
  }

  const MONTHS = lang === 'kz' ? MONTHS_KZ : MONTHS_RU;
  const DOW = lang === 'kz' ? DOW_KZ : DOW_RU;
  const totalDay = dayRestaurants.length + dayRooms.length + dayCars.length;

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800 }}>{t('Календарь броней', 'Брондар күнтізбесі')}</h1>
          <p style={{ color: C.sub, fontSize: 14, marginTop: 2 }}>
            {availableTypes.filter((x) => x.key !== 'all').map((x) => (lang === 'kz' ? x.kz : x.ru)).join(' · ') || t('Нет объектов для бронирования', 'Брондауға объектілер жоқ')}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={loadAll} style={btnGhost}>{t('Обновить', 'Жаңарту')}</button>
          <Link href="/app/supplier" style={{ ...btnGhost, textDecoration: 'none', display: 'inline-block' }}>{t('Кабинет', 'Кабинет')}</Link>
        </div>
      </div>

      {loading && <p style={{ color: C.sub }}>{t('Загрузка…', 'Жүктелуде…')}</p>}
      {error && !loading && <p style={{ color: '#A33', background: '#FCEBEB', padding: 12, borderRadius: 12 }}>{error}</p>}

      {!loading && !error && availableTypes.length > 0 && (
        <>
          {/* Чипы типов */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
            {availableTypes.map((x) => (
              <button key={x.key} onClick={() => changeType(x.key)}
                style={{ ...chip, ...(typeFilter === x.key ? chipActive : null) }}>
                {lang === 'kz' ? x.kz : x.ru}
              </button>
            ))}
          </div>

          {/* Фильтр объекта (если их больше одного) */}
          {showObjectFilter && (
            <select value={objectId ?? ''} onChange={(e) => setObjectId(e.target.value ? Number(e.target.value) : null)}
              style={{ ...inp, marginBottom: 12, maxWidth: 360 }}>
              <option value="">{typeFilter === 'restaurant' ? t('Все рестораны', 'Барлық мейрамханалар') : typeFilter === 'hotel' ? t('Все гостиницы', 'Барлық қонақ үйлер') : t('Все салоны', 'Барлық салондар')}</option>
              {filterObjects.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          )}

          {/* Календарь */}
          <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 16, padding: 14, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <button style={btnGhost} onClick={() => setMonth(({ y, m }) => (m === 0 ? { y: y - 1, m: 11 } : { y, m: m - 1 }))}>‹</button>
              <strong style={{ color: C.text }}>{MONTHS[month.m]} {month.y}</strong>
              <button style={btnGhost} onClick={() => setMonth(({ y, m }) => (m === 11 ? { y: y + 1, m: 0 } : { y, m: m + 1 }))}>›</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
              {DOW.map((d) => <div key={d} style={{ textAlign: 'center', fontSize: 12, color: C.sub, padding: 4 }}>{d}</div>)}
              {grid.map((d, i) => d ? (
                <button key={i} onClick={() => setSelectedDay(d)}
                  style={{
                    padding: '8px 0 4px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 14,
                    background: d === selectedDay ? C.primary : 'transparent',
                    color: d === selectedDay ? '#fff' : d === today ? C.primary : C.text,
                    fontWeight: d === today || d === selectedDay ? 700 : 400,
                  }}>
                  <div>{Number(d.slice(8))}</div>
                  <div style={{ display: 'flex', gap: 2, justifyContent: 'center', minHeight: 6, marginTop: 1 }}>
                    {[...(dots[d] || [])].slice(0, 3).map((c) => (
                      <span key={c} style={{ width: 5, height: 5, borderRadius: 3, background: d === selectedDay ? '#fff' : c }} />
                    ))}
                  </div>
                </button>
              ) : <div key={i} />)}
            </div>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginTop: 8, flexWrap: 'wrap' }}>
              {restaurants.length > 0 && <Legend color={C.rest} label={t('Рестораны', 'Мейрамханалар')} />}
              {hotels.length > 0 && <Legend color={C.hotel} label={t('Гостиницы', 'Қонақ үйлер')} />}
              {salons.length > 0 && <Legend color={C.car} label={t('Авто', 'Авто')} />}
            </div>
          </div>

          {/* Брони выбранного дня */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <strong style={{ color: C.text }}>{selectedDay} · {totalDay} {t('брон.', 'брон.')}</strong>
            <button style={btnPrimary} onClick={() => setAddOpen(true)}>+ {t('Добавить', 'Қосу')}</button>
          </div>

          {totalDay === 0 && <p style={{ color: C.sub }}>{t('На этот день броней нет', 'Бұл күні брондар жоқ')}</p>}

          {dayRestaurants.map((b, i) => (
            <BookingRow key={`r${i}`} accent={C.rest}
              title={b.restaurantName || t('Ресторан', 'Мейрамхана')} sub={`${t('Блокировка дня', 'Күнді бұғаттау')} · ${b.date}`}
              onDelete={() => confirmDel(`${b.restaurantName || ''} — ${b.date}`, wrap(() => unblockRestaurantDate(b.restaurantId, b.date)))} t={t} />
          ))}
          {dayRooms.map((b, i) => (
            <BookingRow key={`h${i}`} accent={C.hotel}
              title={`${b.room?.hotel?.name || t('Гостиница', 'Қонақ үй')} · №${b.room?.room_number || ''}`}
              sub={`${toYMD(b.checkInDate)} → ${toYMD(b.checkOutDate)}${b.guestName ? ` · ${b.guestName}` : ''}`}
              onDelete={() => confirmDel(`№${b.room?.room_number || ''}`, wrap(() => cancelRoomBooking(b.bookingReference)))} t={t} />
          ))}
          {dayCars.map((b, i) => (
            <BookingRow key={`c${i}`} accent={C.car}
              title={`${b.vehicle?.carName || t('Авто', 'Көлік')}${b.transport?.salonName ? ` · ${b.transport.salonName}` : ''}`}
              sub={b.startDate ? `${toYMD(b.startDate)} → ${toYMD(b.endDate)}` : toYMD(b.date)}
              onDelete={() => confirmDel(b.vehicle?.carName || '', wrap(() => cancelTransportBooking(b.bookingReference)))} t={t} />
          ))}
        </>
      )}

      {!loading && !error && availableTypes.length === 0 && (
        <p style={{ color: C.sub }}>{t('Календарь доступен, если у вас есть ресторан, гостиница или автосалон.', 'Күнтізбе мейрамхана, қонақ үй немесе автосалон болса қолжетімді.')}</p>
      )}

      {addOpen && (
        <AddBookingForm
          onClose={() => setAddOpen(false)}
          onCreated={() => { setAddOpen(false); loadAll(); }}
          date={selectedDay}
          initialType={typeFilter !== 'all' ? typeFilter : (availableTypes.find((x) => x.key !== 'all')?.key || 'restaurant')}
          restaurants={restaurants} hotels={hotels} salons={salons}
          carBookings={carBookings} t={t} lang={lang} availableTypes={availableTypes}
        />
      )}
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: C.text }}>
      <span style={{ width: 9, height: 9, borderRadius: 5, background: color }} />{label}
    </span>
  );
}

function BookingRow({ accent, title, sub, onDelete, t }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: C.card, border: `1px solid ${C.line}`, borderLeft: `4px solid ${accent}`, borderRadius: 12, padding: '10px 14px', marginBottom: 8 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, color: C.text, fontSize: 14 }}>{title}</div>
        {sub && <div style={{ color: C.sub, fontSize: 12, marginTop: 2 }}>{sub}</div>}
      </div>
      <button onClick={onDelete} style={{ border: 'none', background: 'none', color: C.danger, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
        {t('Удалить', 'Жою')}
      </button>
    </div>
  );
}

// Форма добавления брони: поведение по типам — как в мобильном AddBookingForm.
function AddBookingForm({ onClose, onCreated, date, initialType, restaurants, hotels, salons, carBookings, t, lang, availableTypes }) {
  const [type, setType] = useState(initialType);
  const [saving, setSaving] = useState(false);

  const [restaurantId, setRestaurantId] = useState(restaurants[0]?.id ?? null);
  const [hotelId, setHotelId] = useState(hotels[0]?.id ?? null);
  const [rooms, setRooms] = useState([]);
  const [roomId, setRoomId] = useState(null);
  const [salonId, setSalonId] = useState(salons[0]?.id ?? null);
  const [vehicles, setVehicles] = useState([]);
  const [vehicleId, setVehicleId] = useState(null);
  const [range, setRange] = useState({ start: date, end: null });

  useEffect(() => {
    if (type !== 'hotel' || !hotelId) return;
    getRoomsByHotel(hotelId)
      .then((res) => {
        const list = res?.data?.data || res?.data || res || [];
        setRooms(Array.isArray(list) ? list : []);
        setRoomId((Array.isArray(list) && list[0]?.id) || null);
      })
      .catch(() => setRooms([]));
  }, [type, hotelId]);

  useEffect(() => {
    if (type !== 'car' || !salonId) return;
    getVehiclesByTransportId(salonId)
      .then((res) => {
        const list = res?.data?.data || res?.data || res || [];
        setVehicles(Array.isArray(list) ? list : []);
        setVehicleId((Array.isArray(list) && list[0]?.id) || null);
      })
      .catch(() => setVehicles([]));
  }, [type, salonId]);

  // Занятые дни выбранного авто (для проверки пересечений диапазона)
  const busyDays = useMemo(() => {
    const s = new Set();
    if (!vehicleId) return s;
    carBookings
      .filter((b) => (b.vehicleId ?? b.vehicle?.id) === vehicleId)
      .forEach((b) => (b.startDate ? eachDay(b.startDate, b.endDate) : [toYMD(b.date)]).forEach((d) => s.add(d)));
    return s;
  }, [carBookings, vehicleId]);

  const rangeHasBusy = (start, end) => eachDay(start, end).some((d) => busyDays.has(d));

  const submit = async () => {
    setSaving(true);
    try {
      if (type === 'restaurant') {
        if (!restaurantId) throw new Error(t('Выберите ресторан', 'Мейрамхананы таңдаңыз'));
        await blockRestaurantDate(Number(restaurantId), date);
      } else if (type === 'hotel') {
        if (!hotelId || !roomId) throw new Error(t('Выберите гостиницу и номер', 'Қонақ үй мен нөмірді таңдаңыз'));
        await createRoomBooking({ roomId: Number(roomId), hotelId: Number(hotelId), checkInDate: date, checkOutDate: nextDay(date), source: 'walk_in', notes: 'Добавлено поставщиком (веб)' });
      } else if (type === 'car') {
        if (!salonId || !vehicleId) throw new Error(t('Выберите салон и авто', 'Салон мен көлікті таңдаңыз'));
        const start = range.start || date;
        const end = range.end || start;
        if (toYMD(end) < toYMD(start)) throw new Error(t('Дата окончания раньше начала', 'Аяқталу күні басталудан бұрын'));
        if (rangeHasBusy(start, end)) throw new Error(t('Период пересекается с существующей бронью', 'Кезең бар бронмен қиылысады'));
        await createTransportBooking({ vehicleId: Number(vehicleId), transportId: Number(salonId), rentalType: 'daily', startDate: toYMD(start), endDate: toYMD(end), notes: 'Добавлено поставщиком (веб)' });
      }
      onCreated();
    } catch (e) {
      window.alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const realTypes = availableTypes.filter((x) => x.key !== 'all');
  const carDaysCount = range.start ? eachDay(range.start, range.end || range.start).length : 0;

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 18, zIndex: 50 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, padding: 18, width: '100%', maxWidth: 440, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <strong style={{ fontSize: 18, color: C.text }}>{t('Новая бронь', 'Жаңа брон')}</strong>
          <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: 20, cursor: 'pointer', color: C.primary }}>✕</button>
        </div>

        {realTypes.length > 1 && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
            {realTypes.map((x) => (
              <button key={x.key} onClick={() => setType(x.key)} style={{ ...chip, flex: 1, ...(type === x.key ? chipActive : null) }}>
                {lang === 'kz' ? x.kz : x.ru}
              </button>
            ))}
          </div>
        )}

        {type === 'restaurant' && (
          <>
            <Field label={t('Ресторан', 'Мейрамхана')}>
              <select value={restaurantId ?? ''} onChange={(e) => setRestaurantId(Number(e.target.value))} style={inp}>
                {restaurants.map((r) => <option key={r.id} value={r.id}>{r.name || `#${r.id}`}</option>)}
              </select>
            </Field>
            <p style={hint}>{t('Блокировка дня', 'Күнді бұғаттау')} {date}</p>
          </>
        )}

        {type === 'hotel' && (
          <>
            <Field label={t('Гостиница', 'Қонақ үй')}>
              <select value={hotelId ?? ''} onChange={(e) => setHotelId(Number(e.target.value))} style={inp}>
                {hotels.map((h) => <option key={h.id} value={h.id}>{h.name || `#${h.id}`}</option>)}
              </select>
            </Field>
            <Field label={t('Номер', 'Нөмір')}>
              <select value={roomId ?? ''} onChange={(e) => setRoomId(Number(e.target.value))} style={inp}>
                {rooms.map((r) => <option key={r.id} value={r.id}>№{r.room_number} {r.roomType?.name ? `(${r.roomType.name})` : ''}</option>)}
              </select>
            </Field>
            <p style={hint}>{t('Заезд', 'Кіру')} {date} → {t('выезд', 'шығу')} {nextDay(date)}</p>
          </>
        )}

        {type === 'car' && (
          <>
            <Field label={t('Салон', 'Салон')}>
              <select value={salonId ?? ''} onChange={(e) => setSalonId(Number(e.target.value))} style={inp}>
                {salons.map((s) => <option key={s.id} value={s.id}>{s.salonName || `#${s.id}`}</option>)}
              </select>
            </Field>
            <Field label={t('Авто', 'Көлік')}>
              <select value={vehicleId ?? ''} onChange={(e) => setVehicleId(Number(e.target.value))} style={inp}>
                {vehicles.map((v) => <option key={v.id} value={v.id}>{v.carName} {v.carType ? `(${v.carType})` : ''}</option>)}
              </select>
            </Field>
            <div style={{ display: 'flex', gap: 8 }}>
              <Field label={t('Начало аренды', 'Жалдау басталуы')} style={{ flex: 1 }}>
                <input type="date" value={range.start || ''} onChange={(e) => setRange((r) => ({ ...r, start: e.target.value }))} style={inp} />
              </Field>
              <Field label={t('Окончание', 'Аяқталуы')} style={{ flex: 1 }}>
                <input type="date" value={range.end || ''} min={range.start || undefined} onChange={(e) => setRange((r) => ({ ...r, end: e.target.value }))} style={inp} />
              </Field>
            </div>
            <p style={hint}>
              {busyDays.size > 0 && `${t('Занятых дней у авто', 'Көліктің бос емес күндері')}: ${busyDays.size}. `}
              {range.start ? `${t('Аренда', 'Жалдау')} ${range.start} → ${range.end || range.start} · ${carDaysCount} ${t('дн.', 'күн')}` : t('Период не выбран', 'Кезең таңдалмаған')}
            </p>
          </>
        )}

        <button onClick={submit} disabled={saving} style={{ ...btnPrimary, width: '100%', padding: '12px 0', marginTop: 8, opacity: saving ? 0.6 : 1 }}>
          {saving ? t('Сохранение…', 'Сақталуда…') : t('Добавить бронь', 'Брон қосу')}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children, style }) {
  return (
    <div style={{ marginBottom: 10, ...style }}>
      <div style={{ fontSize: 12, color: C.sub, marginBottom: 4 }}>{label}</div>
      {children}
    </div>
  );
}

const chip = { padding: '8px 16px', borderRadius: 999, border: `1px solid ${C.line}`, background: '#fff', color: C.sub, fontWeight: 600, fontSize: 13, cursor: 'pointer' };
const chipActive = { background: C.primary, borderColor: C.primary, color: '#fff' };
const inp = { width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #D4C4B0', fontSize: 15, color: C.text, background: '#fff', boxSizing: 'border-box' };
const hint = { fontSize: 12, color: C.sub, margin: '2px 0 10px' };
const btnPrimary = { padding: '10px 18px', borderRadius: 999, border: 'none', background: C.primary, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' };
const btnGhost = { padding: '8px 14px', borderRadius: 999, border: `1px solid ${C.line}`, background: '#fff', color: C.text, fontWeight: 600, fontSize: 13, cursor: 'pointer' };
