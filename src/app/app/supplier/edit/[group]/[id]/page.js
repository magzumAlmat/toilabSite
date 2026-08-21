'use client';

// Редактирование объявления поставщиком (паритет с моб. ItemEditScreen):
//   • поля записи — та же форма, что при создании (categoryForms), PUT group.upd(id);
//   • фото/видео записи — текущие (GET /api/{seg}/{id}/files) с удалением
//     (DELETE /api/files/{id}) и добавление новых (POST /api/{seg}/{id}/files);
//   • транспорт — авто салона: правка (PUT /api/transport-vehicles/{id}), удаление,
//     добавление, фото (POST …/{id}/photos);
//   • гостиница — номера: правка (PUT /api/rooms/rooms/{id}), удаление, добавление
//     (тип → номер, как при создании), фото (POST /api/rooms/rooms/{id}/photos).
// Удаления отдельных фото авто/номера в моб. нет — здесь тоже не делаем.
import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '../../../../_lib/AppContext';
import {
  fetchOne, updateListing, createListing, getEntityId, getFiles, deleteFile, uploadListingFile,
  getVehiclesByTransportId, updateVehicle, deleteVehicle, uploadVehiclePhoto,
  getRoomsByHotel, createRoomType, createRoom, updateRoom, deleteRoom, uploadRoomPhoto,
} from '../../../../_lib/apiClient';
import { GROUP_BY_KEY } from '../../../../_lib/supplier';
import { CATEGORY_FORMS, CITY_DISTRICTS, formatPhone, buildPayload } from '../../../../_lib/categoryForms';
import { fileUrl } from '../../../../_lib/catalogFields';

const asArray = (res) => (Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : Array.isArray(res?.files) ? res.files : []);

// Значения полей формы из записи бэкенда (числа → строки, телефон → формат, bool/multiselect).
function initValues(fields, item) {
  const flat = { ...item, ...(item.specs && typeof item.specs === 'object' ? item.specs : {}) };
  const init = {};
  for (const f of fields) {
    let v = flat[f.name];
    if (v === null || v === undefined) v = '';
    if (f.type === 'tel' && v) v = formatPhone(String(v));
    else if (f.type === 'bool') v = v === true || v === 'true';
    else if (f.type === 'multiselect') v = Array.isArray(v) ? v : (typeof v === 'string' && v ? v.split(',').map((x) => x.trim()) : []);
    else if (typeof v === 'number') v = String(v);
    init[f.name] = v;
  }
  return init;
}

// Payload вложенной сущности (авто/номер) из значений формы: пустые поля не шлём, числа — числом.
function subPayload(fields, values, skipTypeOnly) {
  const out = {};
  for (const f of fields) {
    if (skipTypeOnly && f.typeOnly) continue;
    const raw = values[f.name];
    if (raw === '' || raw == null) continue;
    out[f.name] = f.type === 'number' ? Number(raw) : raw;
  }
  return out;
}

// Фото авто/номера приходят как массив строк-путей или объектов {path|url}.
const photoPaths = (arr) => (Array.isArray(arr) ? arr : []).map((p) => (typeof p === 'string' ? p : p?.path || p?.url)).filter(Boolean);

export default function EditListing() {
  const { ready, isAuth, user, city, lang, t } = useApp();
  const router = useRouter();
  const { group, id } = useParams();

  const g = GROUP_BY_KEY[group];
  const spec = CATEGORY_FORMS[group];
  const isSupplier = user?.roleId === 2;

  const [values, setValues] = useState(null); // null = ещё грузим
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');

  // Медиа записи: существующие (с бэка) + новые (File) + помеченные на удаление.
  const [existingFiles, setExistingFiles] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [removedFileIds, setRemovedFileIds] = useState([]);

  // Вложенные сущности: { id?, values, photos: [path], files: [File] }. Удалённые существующие — в removed*.
  const [vehicles, setVehicles] = useState([]);
  const [removedVehicleIds, setRemovedVehicleIds] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [removedRoomIds, setRemovedRoomIds] = useState([]);

  const districts = useMemo(() => (city ? CITY_DISTRICTS[city] || [] : []), [city]);
  const L = (o) => (lang === 'kz' ? o.kz : o.ru);
  const setVal = (name, v) => setValues((s) => ({ ...s, [name]: v }));

  useEffect(() => {
    if (!ready || !isSupplier || !g?.get || !spec) return;
    let alive = true;
    (async () => {
      try {
        const res = await fetchOne(g.get(id));
        const item = Array.isArray(res) ? res[0] : res?.data?.data || res?.data || res;
        if (!item || typeof item !== 'object') throw new Error(t('Запись не найдена', 'Жазба табылмады'));
        if (!alive) return;
        setValues(initValues(spec.fields, item));

        // Медиа записи (best-effort: нет файлов — пустой список).
        if (spec.fileSegment) {
          try { const fl = asArray(await getFiles(spec.fileSegment, id)); if (alive) setExistingFiles(fl); } catch { /* пусто */ }
        }
        // Авто салона (ItemEditScreen.js:425-433).
        if (spec.vehicles) {
          try {
            const vs = asArray(await getVehiclesByTransportId(id));
            if (alive) setVehicles(vs.map((v) => ({ id: v.id, values: initValues(spec.vehicles.fields, v), photos: photoPaths(v.photos), files: [] })));
          } catch { /* пусто */ }
        }
        // Номера гостиницы (ItemEditScreen.js:444-470): тип — в RoomType/roomType.
        if (spec.rooms) {
          try {
            const rs = asArray(await getRoomsByHotel(id));
            if (alive) setRooms(rs.map((r) => {
              const rt = r.RoomType || (typeof r.roomType === 'object' ? r.roomType : null);
              const vals = initValues(spec.rooms.fields, r);
              vals.roomType = rt?.name || (typeof r.roomType === 'string' ? r.roomType : '') || '';
              vals.capacity = rt?.capacity != null ? String(rt.capacity) : (vals.capacity || '');
              return { id: r.id, room_type_id: r.room_type_id || rt?.id || null, values: vals, photos: photoPaths(r.photos), files: [] };
            }));
          } catch { /* пусто */ }
        }
      } catch (e) {
        if (alive) setError(e.message);
      }
    })();
    return () => { alive = false; };
  }, [ready, isSupplier, g, spec, id, t]);

  // ── вложенные: хелперы ──
  const updSub = (setter, i, patch) => setter((arr) => arr.map((x, ix) => (ix === i ? { ...x, ...patch } : x)));
  const setSubVal = (setter, i, name, v) => setter((arr) => arr.map((x, ix) => (ix === i ? { ...x, values: { ...x.values, [name]: v } } : x)));
  const removeSub = (setter, setRemoved, i) => setter((arr) => {
    const x = arr[i];
    if (x?.id) setRemoved((r) => [...r, x.id]);
    return arr.filter((_, ix) => ix !== i);
  });
  const addSub = (setter, fields) => setter((arr) => [
    ...arr,
    { values: Object.fromEntries(fields.map((f) => [f.name, f.type === 'bool' ? false : f.type === 'multiselect' ? [] : ''])), photos: [], files: [] },
  ]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!g || !spec || !values) return;
    // Обязательные поля (без требования фото — текущие файлы могут уже быть).
    for (const f of spec.fields) {
      const v = values[f.name];
      if (f.req && (v == null || v === '' || (Array.isArray(v) && v.length === 0))) {
        setError(`${t('Заполните', 'Толтырыңыз')} «${L(f)}»`);
        return;
      }
    }
    for (const [list, sub, label] of [[vehicles, spec.vehicles, t('Авто', 'Көлік')], [rooms, spec.rooms, t('Номер', 'Бөлме')]]) {
      if (!sub) continue;
      for (let i = 0; i < list.length; i++) {
        for (const f of sub.fields) {
          const v = list[i].values[f.name];
          if (f.req && (v == null || v === '')) { setError(`${label} #${i + 1}: ${t('заполните', 'толтырыңыз')} «${L(f)}»`); return; }
        }
      }
    }

    setBusy(true);
    setError('');
    try {
      setProgress(t('Сохранение полей…', 'Өрістер сақталуда…'));
      await updateListing(g.upd(id), buildPayload(group, values, { city, supplierId: user?.id }));

      // Медиа записи: удалить помеченные, загрузить новые (по одному, как в моб.).
      for (const fid of removedFileIds) {
        setProgress(t('Удаление файла…', 'Файл жойылуда…'));
        try { await deleteFile(fid); } catch { /* best-effort */ }
      }
      for (let i = 0; i < newFiles.length; i++) {
        setProgress(t('Загрузка файла', 'Файл жүктелуде') + ` ${i + 1}/${newFiles.length}…`);
        await uploadListingFile(spec.fileSegment, id, newFiles[i]);
      }

      // Авто: удалить → обновить/создать → фото.
      if (spec.vehicles) {
        for (const vid of removedVehicleIds) { try { await deleteVehicle(vid); } catch { /* best-effort */ } }
        for (let i = 0; i < vehicles.length; i++) {
          const veh = vehicles[i];
          setProgress(`${t('Авто', 'Көлік')} ${i + 1}/${vehicles.length}…`);
          const payload = { [spec.vehicles.parentField]: Number(id), ...subPayload(spec.vehicles.fields, veh.values, false) };
          let vid = veh.id;
          if (vid) await updateVehicle(vid, payload);
          else vid = getEntityId(await createListing(spec.vehicles.createPath, payload));
          if (vid) for (const f of veh.files) await uploadVehiclePhoto(vid, f);
        }
      }

      // Номера: удалить → обновить/создать (новым — сначала тип) → фото.
      if (spec.rooms) {
        for (const rid of removedRoomIds) { try { await deleteRoom(rid); } catch { /* best-effort */ } }
        for (let i = 0; i < rooms.length; i++) {
          const room = rooms[i];
          setProgress(`${t('Номер', 'Бөлме')} ${i + 1}/${rooms.length}…`);
          const payload = { [spec.rooms.parentField]: Number(id), status: 'available', ...subPayload(spec.rooms.fields, room.values, true) };
          let rid = room.id;
          if (rid) {
            if (room.room_type_id) payload.room_type_id = room.room_type_id;
            await updateRoom(rid, payload);
          } else {
            // room_type_id NOT NULL — сначала тип (контракт моб. Item2Screen/ItemEditScreen).
            const typePayload = { name: room.values.roomType || room.values.room_number || 'Стандарт', hotel_id: Number(id) };
            if (room.values.capacity) typePayload.capacity = Number(room.values.capacity);
            const typeId = getEntityId(await createRoomType(typePayload));
            if (typeId) payload.room_type_id = typeId;
            rid = getEntityId(await createRoom(payload));
          }
          if (rid) for (const f of room.files) await uploadRoomPhoto(rid, f);
        }
      }

      router.push('/app/supplier');
    } catch (err) {
      setError(err.message || t('Не удалось сохранить', 'Сақтау мүмкін болмады'));
    } finally {
      setBusy(false);
      setProgress('');
    }
  };

  if (ready && (!isAuth || !isSupplier)) {
    return (
      <div style={{ textAlign: 'center', padding: '56px 0' }}>
        <p style={{ color: '#6B5A4D', marginBottom: 20 }}>{t('Доступно только поставщикам.', 'Тек жеткізушілерге қолжетімді.')}</p>
        <Link href="/app/login" style={{ color: '#B08D57' }}>{t('Войти', 'Кіру')}</Link>
      </div>
    );
  }
  if (!g || !spec) {
    return <p style={{ color: '#6B5A4D', padding: '40px 0', textAlign: 'center' }}>{t('Неизвестная категория', 'Белгісіз санат')}</p>;
  }

  // Блок вложенных сущностей (авто / номера): существующие и новые в одном списке.
  const subBlock = (sub, list, setter, setRemoved, label) => (
    <div style={{ border: '1px dashed #D4C4B0', borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontWeight: 700, color: '#4A3F35' }}>{t(sub.title?.ru, sub.title?.kz)}</div>
      {list.map((x, i) => (
        <div key={x.id ?? `new-${i}`} style={{ background: '#FAF6F0', borderRadius: 10, padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#8C7B6D' }}>{label} #{i + 1}{x.id ? '' : ` · ${t('новый', 'жаңа')}`}</span>
            <button type="button" onClick={() => removeSub(setter, setRemoved, i)} style={linkBtn}>{t('Удалить', 'Жою')}</button>
          </div>
          {sub.fields.map((f) => (
            <Field key={f.name} field={f} value={x.values[f.name]} districts={districts} t={t} L={L}
              onChange={(v) => setSubVal(setter, i, f.name, v)} />
          ))}
          {x.photos.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {x.photos.map((p, pi) => <img key={pi} src={fileUrl(p)} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: '1px solid #E5D9C8' }} />)}
            </div>
          )}
          <FilePicker files={x.files} t={t} label={t('Добавить фото', 'Фото қосу')}
            onPick={(e) => { const picked = Array.from(e.target.files || []); updSub(setter, i, { files: [...x.files, ...picked] }); e.target.value = ''; }}
            onRemove={(idx) => updSub(setter, i, { files: x.files.filter((_, fi) => fi !== idx) })} />
        </div>
      ))}
      <button type="button" onClick={() => addSub(setter, sub.fields)} style={{ ...linkBtn, alignSelf: 'flex-start' }}>
        + {t(sub.addLabel?.ru, sub.addLabel?.kz)}
      </button>
    </div>
  );

  return (
    <div style={{ maxWidth: 560, margin: '8px auto' }}>
      <Link href="/app/supplier" style={{ color: '#6B5A4D', textDecoration: 'none', fontSize: 14 }}>← {t('Кабинет', 'Кабинет')}</Link>
      <h1 style={{ fontSize: 26, fontWeight: 800, margin: '10px 0 4px' }}>
        {g.icon} {t('Редактирование', 'Өңдеу')} · {lang === 'kz' ? g.kz : g.ru}
      </h1>
      <p style={{ color: '#6B5A4D', fontSize: 14, marginBottom: 20 }}>
        {t('Изменения сохранятся после нажатия кнопки внизу.', 'Өзгерістер төмендегі түймені басқаннан кейін сақталады.')}
      </p>

      {error && <div style={{ color: '#A33', background: '#FCEBEB', padding: 10, borderRadius: 10, fontSize: 14, marginBottom: 12 }}>{error}</div>}

      {!values && !error && <p style={{ color: '#6B5A4D' }}>{t('Загрузка…', 'Жүктелуде…')}</p>}

      {values && (
        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {spec.fields.map((field) => (
            <Field key={field.name} field={field} value={values[field.name]} districts={districts} t={t} L={L}
              onChange={(v) => setVal(field.name, v)} />
          ))}

          {spec.vehicles && subBlock(spec.vehicles, vehicles, setVehicles, setRemovedVehicleIds, t('Авто', 'Көлік'))}
          {spec.rooms && subBlock(spec.rooms, rooms, setRooms, setRemovedRoomIds, t('Номер', 'Бөлме'))}

          {/* Фото / видео записи */}
          {spec.fileSegment && (
            <div style={col}>
              <span style={lbl}>{t('Фото и видео', 'Фото және видео')}</span>
              {existingFiles.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {existingFiles.map((f) => {
                    const removed = removedFileIds.includes(f.id);
                    const isVideo = String(f.mimetype || '').startsWith('video/');
                    return (
                      <div key={f.id} style={{ position: 'relative', width: 84, height: 84, borderRadius: 10, overflow: 'hidden', border: '1px solid #E5D9C8', opacity: removed ? 0.35 : 1 }}>
                        {isVideo
                          ? <video src={fileUrl(f.path)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                          : <img src={fileUrl(f.path)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                        <button type="button" title={removed ? t('Вернуть', 'Қайтару') : t('Удалить', 'Жою')}
                          onClick={() => setRemovedFileIds((r) => (removed ? r.filter((x) => x !== f.id) : [...r, f.id]))}
                          style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: 999, border: 'none', background: 'rgba(0,0,0,0.55)', color: '#fff', cursor: 'pointer', fontSize: 14, lineHeight: 1 }}>
                          {removed ? '↺' : '×'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
              <FilePicker files={newFiles} t={t}
                onPick={(e) => { const picked = Array.from(e.target.files || []); setNewFiles((fs) => [...fs, ...picked]); e.target.value = ''; }}
                onRemove={(idx) => setNewFiles((fs) => fs.filter((_, i) => i !== idx))} />
            </div>
          )}

          {busy && progress && <div style={{ color: '#6B5A4D', fontSize: 14 }}>{progress}</div>}

          <button type="submit" disabled={busy}
            style={{ padding: '14px', borderRadius: 999, background: '#4A3F35', color: '#F5F0E9', fontWeight: 700, fontSize: 16, border: 'none', cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.7 : 1 }}>
            {busy ? t('Сохранение…', 'Сақталуда…') : t('Сохранить изменения', 'Өзгерістерді сақтау')}
          </button>
        </form>
      )}
    </div>
  );
}

// Выбор новых файлов (копия из supplier/new).
function FilePicker({ files, onPick, onRemove, t, label }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <label style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 14px',
        border: '1px dashed #B08D57', borderRadius: 12, color: '#B08D57', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
        + {label || t('Добавить файлы', 'Файл қосу')}
        <input type="file" accept="image/*,video/*" multiple onChange={onPick} style={{ display: 'none' }} />
      </label>
      {files.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {files.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#FAF6F0', border: '1px solid #E5D9C8', borderRadius: 8, padding: '6px 10px', fontSize: 13, color: '#6B5A4D', maxWidth: 220 }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
              <button type="button" onClick={() => onRemove(i)} style={{ border: 'none', background: 'none', color: '#A33', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Рендер одного поля — копия Field из supplier/new (не экспортирован оттуда).
function Field({ field, value, districts, onChange, t, L }) {
  const label = <span style={lbl}>{L(field)}{field.req ? ' *' : ''}</span>;

  if (field.type === 'textarea') {
    return <label style={col}>{label}<textarea value={value || ''} onChange={(e) => onChange(e.target.value)} rows={4} style={{ ...inp, resize: 'vertical' }} /></label>;
  }
  if (field.type === 'bool') {
    return (
      <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
        <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} style={{ width: 18, height: 18 }} />
        <span style={lbl}>{L(field)}</span>
      </label>
    );
  }
  if (field.type === 'select') {
    return (
      <label style={col}>{label}
        <select value={value || ''} onChange={(e) => onChange(e.target.value)} style={inp}>
          <option value="">{t('— выберите —', '— таңдаңыз —')}</option>
          {/* Сохранённого значения может не быть в списке (напр. category
              'Miscellaneous' у товаров из моб. app) — иначе правка его затрёт. */}
          {value && !field.options.includes(value) && <option value={value}>{value}</option>}
          {field.options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </label>
    );
  }
  if (field.type === 'district') {
    return (
      <label style={col}>{label}
        <select value={value || ''} onChange={(e) => onChange(e.target.value)} style={inp} disabled={districts.length === 0}>
          <option value="">{districts.length ? t('— выберите —', '— таңдаңыз —') : t('сначала выберите город', 'алдымен қаланы таңдаңыз')}</option>
          {/* Сохранённый район может отсутствовать в списке города — показываем его отдельно */}
          {value && !districts.includes(value) && <option value={value}>{value}</option>}
          {districts.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </label>
    );
  }
  if (field.type === 'multiselect') {
    const arr = Array.isArray(value) ? value : [];
    const toggle = (o) => onChange(arr.includes(o) ? arr.filter((x) => x !== o) : [...arr, o]);
    return (
      <div style={col}>{label}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {field.options.map((o) => {
            const on = arr.includes(o);
            return (
              <button type="button" key={o} onClick={() => toggle(o)}
                style={{ padding: '8px 14px', borderRadius: 999, fontSize: 14, cursor: 'pointer',
                  border: on ? '1px solid #B08D57' : '1px solid #D4C4B0',
                  background: on ? '#B08D57' : '#fff', color: on ? '#fff' : '#6B5A4D' }}>
                {o}
              </button>
            );
          })}
        </div>
      </div>
    );
  }
  if (field.type === 'time') {
    return <label style={col}>{label}<input type="time" value={value || ''} onChange={(e) => onChange(e.target.value)} style={inp} /></label>;
  }
  if (field.type === 'tel') {
    return <label style={col}>{label}<input type="tel" value={value || ''} placeholder="+7 (___) ___-__-__" onChange={(e) => onChange(formatPhone(e.target.value))} style={inp} /></label>;
  }
  return (
    <label style={col}>
      {label}
      <input
        type={field.type === 'number' ? 'number' : 'text'}
        inputMode={field.type === 'number' ? 'numeric' : undefined}
        value={value || ''} placeholder={field.placeholder || ''}
        onChange={(e) => onChange(e.target.value)} style={inp} />
    </label>
  );
}

const col = { display: 'flex', flexDirection: 'column', gap: 6 };
const lbl = { fontSize: 13, fontWeight: 600, color: '#6B5A4D' };
const inp = { padding: '12px 14px', borderRadius: 12, border: '1px solid #D4C4B0', fontSize: 16, color: '#4A3F35', background: '#fff', width: '100%', boxSizing: 'border-box' };
const linkBtn = { border: 'none', background: 'none', color: '#B08D57', cursor: 'pointer', fontSize: 14, fontWeight: 600, padding: 0 };
