'use client';

// Редактирование объявления поставщиком: та же форма, что при создании
// (categoryForms), но предзаполненная из GET group.get(id) и с PUT на
// group.upd(id). Фото/видео и вложенные сущности (авто, номера) здесь не
// редактируются — только поля записи (паритет с запросом «изменить поля»).
import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '../../../../_lib/AppContext';
import { fetchOne, updateListing } from '../../../../_lib/apiClient';
import { GROUP_BY_KEY } from '../../../../_lib/supplier';
import { CATEGORY_FORMS, CITY_DISTRICTS, formatPhone, buildPayload } from '../../../../_lib/categoryForms';

export default function EditListing() {
  const { ready, isAuth, user, city, lang, t } = useApp();
  const router = useRouter();
  const { group, id } = useParams();

  const g = GROUP_BY_KEY[group];
  const spec = CATEGORY_FORMS[group];
  const isSupplier = user?.roleId === 2;

  const [values, setValues] = useState(null); // null = ещё грузим
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const districts = useMemo(() => (city ? CITY_DISTRICTS[city] || [] : []), [city]);
  const L = (o) => (lang === 'kz' ? o.kz : o.ru);
  const setVal = (name, v) => setValues((s) => ({ ...s, [name]: v }));

  useEffect(() => {
    if (!ready || !isSupplier || !g?.get || !spec) return;
    fetchOne(g.get(id))
      .then((res) => {
        const item = Array.isArray(res) ? res[0] : res?.data?.data || res?.data || res;
        if (!item || typeof item !== 'object') throw new Error(t('Запись не найдена', 'Жазба табылмады'));
        // Товары хранят магазин/адрес/телефон в specs — разворачиваем.
        const flat = { ...item, ...(item.specs && typeof item.specs === 'object' ? item.specs : {}) };
        const init = {};
        for (const f of spec.fields) {
          let v = flat[f.name];
          if (v === null || v === undefined) v = '';
          if (f.type === 'tel' && v) v = formatPhone(String(v));
          else if (f.type === 'bool') v = v === true || v === 'true';
          else if (f.type === 'multiselect') v = Array.isArray(v) ? v : (typeof v === 'string' && v ? v.split(',').map((x) => x.trim()) : []);
          else if (typeof v === 'number') v = String(v);
          init[f.name] = v;
        }
        setValues(init);
      })
      .catch((e) => setError(e.message));
  }, [ready, isSupplier, g, spec, id, t]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!g || !spec || !values) return;
    // Обязательные поля (без требования фото — фото при редактировании не трогаем).
    for (const f of spec.fields) {
      const v = values[f.name];
      if (f.req && (v == null || v === '' || (Array.isArray(v) && v.length === 0))) {
        setError(`${t('Заполните', 'Толтырыңыз')} «${L(f)}»`);
        return;
      }
    }
    setBusy(true);
    setError('');
    try {
      const payload = buildPayload(group, values, { city, supplierId: user?.id });
      await updateListing(g.upd(id), payload);
      router.push('/app/supplier');
    } catch (err) {
      setError(err.message || t('Не удалось сохранить', 'Сақтау мүмкін болмады'));
    } finally {
      setBusy(false);
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

  return (
    <div style={{ maxWidth: 560, margin: '8px auto' }}>
      <Link href="/app/supplier" style={{ color: '#6B5A4D', textDecoration: 'none', fontSize: 14 }}>← {t('Кабинет', 'Кабинет')}</Link>
      <h1 style={{ fontSize: 26, fontWeight: 800, margin: '10px 0 4px' }}>
        {g.icon} {t('Редактирование', 'Өңдеу')} · {lang === 'kz' ? g.kz : g.ru}
      </h1>
      <p style={{ color: '#6B5A4D', fontSize: 14, marginBottom: 20 }}>
        {t('Изменения сохранятся сразу после отправки.', 'Өзгерістер жібергеннен кейін бірден сақталады.')}
      </p>

      {error && <div style={{ color: '#A33', background: '#FCEBEB', padding: 10, borderRadius: 10, fontSize: 14, marginBottom: 12 }}>{error}</div>}

      {!values && !error && <p style={{ color: '#6B5A4D' }}>{t('Загрузка…', 'Жүктелуде…')}</p>}

      {values && (
        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {spec.fields.map((field) => (
            <Field key={field.name} field={field} value={values[field.name]} districts={districts} t={t} L={L}
              onChange={(v) => setVal(field.name, v)} />
          ))}

          <button type="submit" disabled={busy}
            style={{ padding: '14px', borderRadius: 999, background: '#4A3F35', color: '#F5F0E9', fontWeight: 700, fontSize: 16, border: 'none', cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.7 : 1 }}>
            {busy ? t('Сохранение…', 'Сақталуда…') : t('Сохранить изменения', 'Өзгерістерді сақтау')}
          </button>
        </form>
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
