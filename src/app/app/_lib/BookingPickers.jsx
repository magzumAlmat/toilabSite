'use client';

// Модалки двухуровневого выбора (порт моб. RoomSelectionModal / VehicleSelectionModal):
// отель → номера + ночи, салон → авто + дни. Цена = Σ(цена) × длительность.
// Занятость проверяется на дату мероприятия и подсвечивается («Занято»).
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  getRoomsByHotel, getVehiclesByTransportId,
  checkRoomAvailability, checkVehicleAvailability, getFiles,
} from './apiClient';
import { catalogItemName, fmt } from './events';
import { addDaysISO } from './booking';
import { fileUrl } from './catalogFields';

const asArray = (res) => (Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : []);

// Общий каркас модалки выбора подпозиций с длительностью.
function PickerModal({ title, subtitle, loading, children, footer, onClose }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(40,33,28,0.55)', zIndex: 120, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 16, overflowY: 'auto' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 18, maxWidth: 560, width: '100%', margin: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, padding: '16px 18px 10px' }}>
          <div>
            <h3 style={{ fontSize: 19, fontWeight: 800, color: 'var(--ink)', margin: 0 }}>{title}</h3>
            {subtitle && <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 2 }}>{subtitle}</div>}
          </div>
          <button type="button" onClick={onClose} style={{ border: 'none', background: 'none', color: 'var(--ink-3)', cursor: 'pointer', fontSize: 24, lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: '4px 18px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {loading ? <div style={{ color: 'var(--ink-3)', fontSize: 14, padding: '18px 0' }}>Загрузка…</div> : children}
        </div>
        <div style={{ borderTop: '1px solid var(--line)', padding: '12px 18px 16px' }}>{footer}</div>
      </div>
    </div>
  );
}

// Степпер длительности (ночи/дни).
function DurationStepper({ value, setValue, label }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <button type="button" onClick={() => setValue(Math.max(1, value - 1))} style={stepBtn}>−</button>
      <b style={{ minWidth: 22, textAlign: 'center', fontSize: 15 }}>{value}</b>
      <button type="button" onClick={() => setValue(value + 1)} style={stepBtn}>+</button>
      <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>{label}</span>
    </span>
  );
}

// Календарь начала брони (заезд / начало аренды). По умолчанию — дата мероприятия.
function StartDateInput({ label, value, onChange }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--ink-2)', fontWeight: 600 }}>
      📅 {label}
      <input type="date" value={value} onChange={(e) => onChange(e.target.value)}
        style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid var(--line-2)', fontSize: 14, color: 'var(--ink)', background: 'var(--surface)' }} />
    </label>
  );
}

// Деталка номера/авто поверх пикера: поля записи + фото и видео.
function DetailSheet({ title, fields, media, loading, onClose, t }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(40,33,28,0.6)', backdropFilter: 'blur(2px)', zIndex: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, maxWidth: 520, width: '100%', maxHeight: '88vh', overflowY: 'auto', padding: 18, boxShadow: '0 24px 60px rgba(40,33,28,0.35)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
          <h4 style={{ fontSize: 17, fontWeight: 800, color: 'var(--ink)', margin: 0 }}>{title}</h4>
          <button type="button" onClick={onClose} style={{ border: 'none', background: 'none', color: 'var(--ink-3)', cursor: 'pointer', fontSize: 22, lineHeight: 1 }}>×</button>
        </div>

        {fields.filter(([, v]) => v !== null && v !== undefined && v !== '').map(([label, v]) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '7px 0', borderBottom: '1px solid var(--line, #E5D9C8)', fontSize: 14 }}>
            <span style={{ color: 'var(--ink-3)' }}>{label}</span>
            <span style={{ color: 'var(--ink)', fontWeight: 600, textAlign: 'right' }}>{String(v)}</span>
          </div>
        ))}

        {loading && <div style={{ color: 'var(--ink-3)', fontSize: 13, padding: '12px 0' }}>{t('Загрузка медиа…', 'Медиа жүктелуде…')}</div>}
        {!loading && media.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8, marginTop: 12 }}>
            {media.map((m, i) => m.video ? (
              <video key={i} src={m.url} controls playsInline style={{ width: '100%', height: 110, objectFit: 'cover', borderRadius: 10, background: '#000' }} />
            ) : (
              <img key={i} src={m.url} alt="" loading="lazy" style={{ width: '100%', height: 110, objectFit: 'cover', borderRadius: 10 }} />
            ))}
          </div>
        )}
        {!loading && media.length === 0 && (
          <div style={{ color: 'var(--ink-3)', fontSize: 13, padding: '12px 0' }}>{t('Фото и видео не загружены', 'Фото мен видео жүктелмеген')}</div>
        )}
      </div>
    </div>
  );
}

// Строка подпозиции (номер/авто) с чекбоксом и статусом занятости.
function SubItemRow({ name, price, priceLabel, chips, selected, busyStatus, onToggle, onInfo, t }) {
  const isBusy = busyStatus === false; // false = занято; undefined/null = неизвестно
  return (
    <button type="button" onClick={isBusy ? undefined : onToggle} disabled={isBusy}
      style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, cursor: isBusy ? 'default' : 'pointer', opacity: isBusy ? 0.5 : 1,
        border: selected ? '1.5px solid var(--accent)' : '1px solid #E5D9C8', background: selected ? 'rgba(176,141,87,0.07)' : '#fff' }}>
      <span aria-hidden style={{ width: 20, height: 20, flexShrink: 0, borderRadius: 6, border: selected ? 'none' : '1.5px solid #C9B99F', background: selected ? 'var(--accent)' : '#fff', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800 }}>{selected ? '✓' : ''}</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontWeight: 700, fontSize: 14, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
        {chips?.length > 0 && (
          <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 3 }}>
            {chips.map((c, i) => <span key={i} style={{ fontSize: 11.5, color: 'var(--ink-3)', background: 'var(--surface-2)', borderRadius: 999, padding: '2px 8px' }}>{c}</span>)}
          </span>
        )}
        {onInfo && (
          <span role="button" tabIndex={0}
            onClick={(e) => { e.stopPropagation(); onInfo(); }}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); onInfo(); } }}
            style={{ display: 'inline-block', marginTop: 4, color: 'var(--accent)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            ⓘ {t('Подробнее', 'Толығырақ')}
          </span>
        )}
      </span>
      <span style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
        {isBusy
          ? <b style={{ color: 'var(--danger)', fontSize: 12.5 }}>{t('Занято', 'Бос емес')}</b>
          : <><b style={{ color: 'var(--ink)', fontSize: 14 }}>{fmt(price)} ₸</b><span style={{ display: 'block', fontSize: 11, color: 'var(--ink-3)' }}>{priceLabel}</span></>}
      </span>
    </button>
  );
}

// ── Отель → номера → ночи ────────────────────────────────────────
export function RoomPickerModal({ hotel, date, initial, onSave, onClose, t }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState(() => new Map((initial?.rooms || []).map((r) => [r.id, r])));
  const [nights, setNights] = useState(Math.max(1, parseInt(initial?.nights, 10) || 1));
  const [start, setStart] = useState(initial?.startDate || date || ''); // дата заезда
  const [avail, setAvail] = useState({}); // { roomId: boolean }
  const [detail, setDetail] = useState(null); // номер для деталки
  const availSeq = useRef(0);

  useEffect(() => {
    let on = true;
    getRoomsByHotel(hotel.id)
      .then((res) => { if (on) setRooms(asArray(res)); })
      .catch(() => { if (on) setRooms([]); })
      .finally(() => { if (on) setLoading(false); });
    return () => { on = false; };
  }, [hotel.id]);

  // Проверка занятости на [заезд, заезд+nights) — как в моб. checkBookingConflicts.
  useEffect(() => {
    if (!start || !rooms.length) return;
    const seq = ++availSeq.current;
    const co = addDaysISO(start, nights);
    const timer = setTimeout(() => {
      rooms.forEach((r) => {
        checkRoomAvailability(r.id, start, co)
          .then((res) => {
            if (availSeq.current !== seq) return;
            const ok = res?.data?.available;
            if (ok === false || ok === true) setAvail((a) => ({ ...a, [r.id]: ok }));
          })
          .catch(() => {});
      });
    }, 350);
    return () => clearTimeout(timer);
  }, [rooms, start, nights]);

  const toggle = (r) => setSel((m) => { const n = new Map(m); if (n.has(r.id)) n.delete(r.id); else n.set(r.id, r); return n; });
  const chosen = useMemo(() => [...sel.values()], [sel]);
  const perNight = chosen.reduce((s, r) => s + (parseFloat(r.price) || 0), 0);

  return (
    <PickerModal title={catalogItemName(hotel)} subtitle={t('Выберите номера и количество ночей', 'Бөлмелер мен түн санын таңдаңыз')} loading={loading} onClose={onClose}
      footer={
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <StartDateInput label={t('Заезд', 'Кіру күні')} value={start} onChange={setStart} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <DurationStepper value={nights} setValue={setNights} label={t('ночей', 'түн')} />
            <span style={{ fontSize: 14, color: 'var(--ink-2)' }}>{t('Итого', 'Барлығы')}: <b style={{ color: 'var(--ink)', fontSize: 16 }}>{fmt(perNight * nights)} ₸</b></span>
          </div>
          <button type="button" disabled={!chosen.length} onClick={() => onSave({ rooms: chosen, nights, startDate: start })}
            style={{ padding: '13px', borderRadius: 999, background: chosen.length ? 'var(--brand)' : 'var(--surface-3)', color: chosen.length ? 'var(--on-brand)' : 'var(--ink-3)', fontWeight: 800, fontSize: 15, border: 'none', cursor: chosen.length ? 'pointer' : 'default' }}>
            {chosen.length ? `${t('Выбрать', 'Таңдау')} · ${chosen.length}` : t('Выберите номера', 'Бөлмелерді таңдаңыз')}
          </button>
        </div>
      }>
      {rooms.length === 0 && <div style={{ color: 'var(--ink-3)', fontSize: 14, padding: '14px 0' }}>{t('У этой гостиницы нет номеров', 'Бұл қонақ үйде бөлмелер жоқ')}</div>}
      {rooms.map((r) => (
        <SubItemRow key={r.id} t={t}
          name={r.name || (r.room_number != null ? `${t('Номер', 'Бөлме')} ${r.room_number}` : `#${r.id}`)}
          price={parseFloat(r.price) || 0} priceLabel={t('за ночь', 'түніне')}
          chips={[r.capacity ? `👥 ${r.capacity}` : null, r.floor != null ? `${t('этаж', 'қабат')} ${r.floor}` : null, r.view_type || null].filter(Boolean)}
          selected={sel.has(r.id)} busyStatus={avail[r.id]} onToggle={() => toggle(r)} onInfo={() => setDetail(r)} />
      ))}
      {detail && (
        <DetailSheet t={t} onClose={() => setDetail(null)} loading={false}
          title={detail.name || (detail.room_number != null ? `${t('Номер', 'Бөлме')} ${detail.room_number}` : `#${detail.id}`)}
          fields={[
            [t('Номер', 'Бөлме'), detail.room_number],
            [t('Тип', 'Түрі'), detail.roomType?.name || detail.view_type],
            [t('Вместимость', 'Сыйымдылық'), detail.capacity ? `${detail.capacity} 👥` : null],
            [t('Этаж', 'Қабат'), detail.floor],
            [t('Цена за ночь', 'Түнгі бағасы'), `${fmt(parseFloat(detail.price) || 0)} ₸`],
            [t('Описание', 'Сипаттама'), detail.description],
          ]}
          media={(Array.isArray(detail.photos) ? detail.photos : []).map((p) => ({ url: fileUrl(p), video: /\.(mp4|mov|webm)$/i.test(p) })).filter((m) => m.url)} />
      )}
    </PickerModal>
  );
}

// ── Салон → авто → дни ───────────────────────────────────────────
export function VehiclePickerModal({ salon, date, initial, onSave, onClose, t }) {
  const preloaded = Array.isArray(salon.vehicles) && salon.vehicles.length > 0;
  const [vehicles, setVehicles] = useState(preloaded ? salon.vehicles : []);
  const [loading, setLoading] = useState(!preloaded);
  const [sel, setSel] = useState(() => new Map((initial?.vehicles || []).map((v) => [v.id, v])));
  const [days, setDays] = useState(Math.max(1, parseInt(initial?.days, 10) || 1));
  const [start, setStart] = useState(initial?.startDate || date || ''); // начало аренды
  const [avail, setAvail] = useState({}); // { vehicleId: boolean }
  const [detail, setDetail] = useState(null); // авто для деталки
  const [detailMedia, setDetailMedia] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const availSeq = useRef(0);

  // Медиа авто: GET /api/transport-vehicle/{id}/files (сегмент из categoryForms).
  useEffect(() => {
    if (!detail) { setDetailMedia([]); return; }
    let on = true;
    setDetailLoading(true);
    getFiles('transport-vehicle', detail.id)
      .then((res) => {
        const arr = Array.isArray(res) ? res : res?.data || [];
        if (on) setDetailMedia(arr.map((f) => ({ url: fileUrl(f.path || f.url), video: !!(f.mimetype && f.mimetype.startsWith('video')) })).filter((m) => m.url));
      })
      .catch(() => { if (on) setDetailMedia([]); })
      .finally(() => { if (on) setDetailLoading(false); });
    return () => { on = false; };
  }, [detail]);

  useEffect(() => {
    if (preloaded) return;
    let on = true;
    getVehiclesByTransportId(salon.id)
      .then((res) => { if (on) setVehicles(asArray(res)); })
      .catch(() => { if (on) setVehicles([]); })
      .finally(() => { if (on) setLoading(false); });
    return () => { on = false; };
  }, [salon.id, preloaded]);

  // Занятость на [начало, начало+days-1] — как в моб. checkBookingConflicts.
  useEffect(() => {
    if (!start || !vehicles.length) return;
    const seq = ++availSeq.current;
    const end = addDaysISO(start, Math.max(0, days - 1));
    const timer = setTimeout(() => {
      vehicles.forEach((v) => {
        checkVehicleAvailability(v.id, start, end)
          .then((res) => {
            if (availSeq.current !== seq) return;
            const ok = res?.isAvailable;
            if (ok === false || ok === true) setAvail((a) => ({ ...a, [v.id]: ok }));
          })
          .catch(() => {});
      });
    }, 350);
    return () => clearTimeout(timer);
  }, [vehicles, start, days]);

  const toggle = (v) => setSel((m) => { const n = new Map(m); if (n.has(v.id)) n.delete(v.id); else n.set(v.id, v); return n; });
  const chosen = useMemo(() => [...sel.values()], [sel]);
  const perDay = chosen.reduce((s, v) => s + (parseFloat(v.pricePerDay ?? v.cost ?? v.price) || 0), 0);

  return (
    <PickerModal title={catalogItemName(salon)} subtitle={t('Выберите авто и количество дней', 'Көлік пен күн санын таңдаңыз')} loading={loading} onClose={onClose}
      footer={
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <StartDateInput label={t('Начало аренды', 'Жалдау басталуы')} value={start} onChange={setStart} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <DurationStepper value={days} setValue={setDays} label={t('дней', 'күн')} />
            <span style={{ fontSize: 14, color: 'var(--ink-2)' }}>{t('Итого', 'Барлығы')}: <b style={{ color: 'var(--ink)', fontSize: 16 }}>{fmt(perDay * days)} ₸</b></span>
          </div>
          <button type="button" disabled={!chosen.length} onClick={() => onSave({ vehicles: chosen, days, startDate: start })}
            style={{ padding: '13px', borderRadius: 999, background: chosen.length ? 'var(--brand)' : 'var(--surface-3)', color: chosen.length ? 'var(--on-brand)' : 'var(--ink-3)', fontWeight: 800, fontSize: 15, border: 'none', cursor: chosen.length ? 'pointer' : 'default' }}>
            {chosen.length ? `${t('Выбрать', 'Таңдау')} · ${chosen.length}` : t('Выберите авто', 'Көлікті таңдаңыз')}
          </button>
        </div>
      }>
      {vehicles.length === 0 && <div style={{ color: 'var(--ink-3)', fontSize: 14, padding: '14px 0' }}>{t('У этого салона нет автомобилей', 'Бұл салонда көліктер жоқ')}</div>}
      {vehicles.map((v) => (
        <SubItemRow key={v.id} t={t}
          name={(v.carName || `#${v.id}`) + (v.carType ? ` · ${v.carType}` : '')}
          price={parseFloat(v.pricePerDay ?? v.cost ?? v.price) || 0} priceLabel={t('в день', 'күніне')}
          chips={[v.year || null, v.color || null, v.capacity ? `👥 ${v.capacity}` : null].filter(Boolean)}
          selected={sel.has(v.id)} busyStatus={avail[v.id]} onToggle={() => toggle(v)} onInfo={() => setDetail(v)} />
      ))}
      {detail && (
        <DetailSheet t={t} onClose={() => setDetail(null)} loading={detailLoading}
          title={(detail.carName || `#${detail.id}`) + (detail.carType ? ` · ${detail.carType}` : '')}
          fields={[
            [t('Тип', 'Түрі'), detail.carType],
            [t('Год', 'Жылы'), detail.year],
            [t('Цвет', 'Түсі'), detail.color],
            [t('Вместимость', 'Сыйымдылық'), detail.capacity ? `${detail.capacity} 👥` : null],
            [t('Цена в день', 'Күндік бағасы'), `${fmt(parseFloat(detail.pricePerDay ?? detail.cost ?? detail.price) || 0)} ₸`],
            [t('Описание', 'Сипаттама'), detail.description],
          ]}
          media={detailMedia} />
      )}
    </PickerModal>
  );
}

const stepBtn = { width: 32, height: 32, borderRadius: 10, border: '1px solid var(--line-2)', background: 'var(--surface)', color: 'var(--ink)', fontSize: 16, cursor: 'pointer', lineHeight: 1 };
