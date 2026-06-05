'use client';

// Создание объявления поставщиком: выбор категории → поля под категорию +
// загрузка фото/видео. Поток: POST create → получить id → загрузить файлы.
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '../../_lib/AppContext';
import { createListing, getEntityId, uploadListingFile, createVehicle } from '../../_lib/apiClient';
import { SUPPLIER_GROUPS, GROUP_BY_KEY } from '../../_lib/supplier';
import {
  CATEGORY_FORMS, CITY_DISTRICTS, FORM_KEYS, formatPhone, buildPayload, validate,
} from '../../_lib/categoryForms';

export default function NewListing() {
  const { ready, isAuth, user, city, lang, t } = useApp();
  const router = useRouter();
  const [groupKey, setGroupKey] = useState('restaurants');
  const [values, setValues] = useState({});
  const [files, setFiles] = useState([]);
  const [vehicles, setVehicles] = useState([]); // только для транспорта
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');

  const isSupplier = user?.roleId === 2;
  const spec = CATEGORY_FORMS[groupKey];
  const districts = useMemo(() => (city ? CITY_DISTRICTS[city] || [] : []), [city]);
  const L = (o) => (lang === 'kz' ? o.kz : o.ru);

  // Только категории, для которых есть форма (порядок как в SUPPLIER_GROUPS).
  const groupOptions = SUPPLIER_GROUPS.filter((g) => FORM_KEYS.includes(g.key));

  const setVal = (name, v) => setValues((s) => ({ ...s, [name]: v }));

  const changeCategory = (key) => {
    setGroupKey(key);
    setValues({});
    setFiles([]);
    setVehicles([]);
    setError('');
  };

  const onPickFiles = (e) => {
    const picked = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...picked]);
    e.target.value = ''; // позволяем выбрать те же файлы снова после удаления
  };
  const removeFile = (i) => setFiles((prev) => prev.filter((_, idx) => idx !== i));

  // ── Транспорт: авто ──
  const addVehicle = () => setVehicles((v) => [...v, { values: {}, files: [] }]);
  const removeVehicle = (i) => setVehicles((v) => v.filter((_, idx) => idx !== i));
  const setVehicleVal = (i, name, val) =>
    setVehicles((v) => v.map((veh, idx) => (idx === i ? { ...veh, values: { ...veh.values, [name]: val } } : veh)));
  const addVehicleFiles = (i, list) =>
    setVehicles((v) => v.map((veh, idx) => (idx === i ? { ...veh, files: [...veh.files, ...list] } : veh)));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!city) { setError(t('Сначала выберите город', 'Алдымен қаланы таңдаңыз')); return; }
    const g = GROUP_BY_KEY[groupKey];
    if (!g || !spec) return;

    const errMsg = validate(groupKey, values, files);
    if (errMsg) { setError(errMsg); return; }

    // Валидация обязательных полей у автомобилей (транспорт).
    if (spec.vehicles) {
      for (let i = 0; i < vehicles.length; i++) {
        for (const vf of spec.vehicles.fields) {
          const v = vehicles[i].values[vf.name];
          if (vf.req && (v == null || v === '')) {
            setError(`${t('Авто', 'Көлік')} #${i + 1}: ${t('заполните', 'толтырыңыз')} «${vf.ru}»`);
            return;
          }
        }
      }
    }

    setBusy(true);
    setError('');
    try {
      const ctx = { city, supplierId: user?.id };
      const payload = buildPayload(groupKey, values, ctx);

      setProgress(t('Создание записи…', 'Жазба жасалуда…'));
      const res = await createListing(g.create, payload);
      const id = getEntityId(res);
      if (!id) throw new Error(t('Не удалось получить ID созданной записи', 'Жазба ID алынбады'));

      // Файлы — по одному (как в мобильном приложении).
      for (let i = 0; i < files.length; i++) {
        setProgress(t('Загрузка файла', 'Файл жүктелуде') + ` ${i + 1}/${files.length}…`);
        await uploadListingFile(spec.fileSegment, id, files[i]);
      }

      // Транспорт: создаём авто и их файлы.
      if (spec.vehicles && vehicles.length > 0) {
        for (let vi = 0; vi < vehicles.length; vi++) {
          const veh = vehicles[vi];
          setProgress(t('Добавление авто', 'Көлік қосылуда') + ` ${vi + 1}/${vehicles.length}…`);
          const vehPayload = { [spec.vehicles.parentField]: id };
          for (const vf of spec.vehicles.fields) {
            const raw = veh.values[vf.name];
            if (raw === '' || raw == null) continue;
            vehPayload[vf.name] = vf.type === 'number' ? Number(raw) : raw;
          }
          const vehRes = await createVehicle(vehPayload);
          const vehId = getEntityId(vehRes);
          if (vehId) {
            for (let fi = 0; fi < veh.files.length; fi++) {
              await uploadListingFile(spec.vehicles.fileSegment, vehId, veh.files[fi]);
            }
          }
        }
      }

      router.push('/app/supplier');
    } catch (err) {
      setError(err.message || t('Не удалось создать', 'Жасау мүмкін болмады'));
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

  return (
    <div style={{ maxWidth: 560, margin: '8px auto' }}>
      <Link href="/app/supplier" style={{ color: '#6B5A4D', textDecoration: 'none', fontSize: 14 }}>← {t('Кабинет', 'Кабинет')}</Link>
      <h1 style={{ fontSize: 26, fontWeight: 800, margin: '10px 0 4px' }}>{t('Новое объявление', 'Жаңа хабарландыру')}</h1>
      <p style={{ color: '#6B5A4D', fontSize: 14, marginBottom: 20 }}>{t('После создания запись уйдёт на модерацию.', 'Жасалғаннан кейін жазба модерацияға жіберіледі.')}</p>

      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <label style={col}>
          <span style={lbl}>{t('Категория', 'Санат')}</span>
          <select value={groupKey} onChange={(e) => changeCategory(e.target.value)} style={inp}>
            {groupOptions.map((g) => <option key={g.key} value={g.key}>{g.icon} {lang === 'kz' ? g.kz : g.ru}</option>)}
          </select>
        </label>

        {spec.fields.map((field) => (
          <Field
            key={field.name}
            field={field}
            value={values[field.name]}
            districts={districts}
            t={t} L={L}
            onChange={(v) => setVal(field.name, v)}
          />
        ))}

        {/* Транспорт: авто */}
        {spec.vehicles && (
          <div style={{ border: '1px dashed #D4C4B0', borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontWeight: 700, color: '#4A3F35' }}>{t('Автомобили', 'Көліктер')}</div>
            {vehicles.map((veh, i) => (
              <div key={i} style={{ background: '#FAF6F0', borderRadius: 10, padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: '#8C7B6D' }}>{t('Авто', 'Көлік')} #{i + 1}</span>
                  <button type="button" onClick={() => removeVehicle(i)} style={linkBtn}>{t('Удалить', 'Жою')}</button>
                </div>
                {spec.vehicles.fields.map((vf) => (
                  <Field key={vf.name} field={vf} value={veh.values[vf.name]} districts={districts} t={t} L={L}
                    onChange={(v) => setVehicleVal(i, vf.name, v)} />
                ))}
                <FilePicker
                  files={veh.files}
                  onPick={(e) => { addVehicleFiles(i, Array.from(e.target.files || [])); e.target.value = ''; }}
                  onRemove={(idx) => setVehicles((vs) => vs.map((x, ix) => ix === i ? { ...x, files: x.files.filter((_, fi) => fi !== idx) } : x))}
                  t={t}
                />
              </div>
            ))}
            <button type="button" onClick={addVehicle} style={{ ...linkBtn, alignSelf: 'flex-start' }}>+ {t('Добавить авто', 'Көлік қосу')}</button>
          </div>
        )}

        {/* Фото / видео */}
        <div style={col}>
          <span style={lbl}>{t('Фото и видео', 'Фото және видео')}{spec.requirePhoto ? ' *' : ''}</span>
          <FilePicker files={files} onPick={onPickFiles} onRemove={removeFile} t={t} />
        </div>

        <div style={{ fontSize: 13, color: '#8C7B6D' }}>{t('Город', 'Қала')}: <b>{city || '—'}</b></div>

        {error && <div style={{ color: '#A33', background: '#FCEBEB', padding: 10, borderRadius: 10, fontSize: 14 }}>{error}</div>}
        {busy && progress && <div style={{ color: '#6B5A4D', fontSize: 14 }}>{progress}</div>}

        <button type="submit" disabled={busy}
          style={{ padding: '14px', borderRadius: 999, background: '#4A3F35', color: '#F5F0E9', fontWeight: 700, fontSize: 16, border: 'none', cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.7 : 1 }}>
          {busy ? t('Создание…', 'Жасалуда…') : t('Создать объявление', 'Хабарландыру жасау')}
        </button>
      </form>
    </div>
  );
}

// ── Рендер одного поля ──
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
  // text / number
  return (
    <label style={col}>{label}
      <input
        type={field.type === 'number' ? 'number' : 'text'}
        inputMode={field.type === 'number' ? 'numeric' : undefined}
        value={value || ''} placeholder={field.placeholder || ''}
        onChange={(e) => onChange(e.target.value)} style={inp} />
    </label>
  );
}

// ── Выбор файлов с превью ──
function FilePicker({ files, onPick, onRemove, t }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <label style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 14px',
        border: '1px dashed #B08D57', borderRadius: 12, color: '#B08D57', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
        + {t('Добавить файлы', 'Файл қосу')}
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

const col = { display: 'flex', flexDirection: 'column', gap: 6 };
const lbl = { fontSize: 13, fontWeight: 600, color: '#6B5A4D' };
const inp = { padding: '12px 14px', borderRadius: 12, border: '1px solid #D4C4B0', fontSize: 16, color: '#4A3F35', background: '#fff', width: '100%', boxSizing: 'border-box' };
const linkBtn = { border: 'none', background: 'none', color: '#B08D57', cursor: 'pointer', fontSize: 14, fontWeight: 600, padding: 0 };
