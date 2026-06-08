'use client';

// Список услуг выбранной категории (фильтр по городу — на бэкенде через x-city).
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '../../_lib/AppContext';
import { useCart } from '../../_lib/CartContext';
import { CATEGORY_BY_SLUG, pick } from '../../_lib/categories';
import { CatIcon } from '../../_lib/CatIcon';
import { StaggerGrid, StaggerItem } from '../../../_ui/motion';

const hoverLift = { y: -5, transition: { duration: 0.18, ease: 'easeOut' } };
const tapPress = { scale: 0.98, transition: { duration: 0.1 } };
const GRID = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 };

// Скелетон-плейсхолдер карточки (показываем во время загрузки вместо «Загрузка…»).
function SkeletonGrid({ count = 8 }) {
  return (
    <div style={GRID}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ background: '#fff', border: '1px solid rgba(212,196,176,0.5)', borderRadius: 18, overflow: 'hidden' }}>
          <div className="tl-skel" style={{ aspectRatio: '4 / 3' }} />
          <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="tl-skel" style={{ height: 14, width: '80%', borderRadius: 6 }} />
            <div className="tl-skel" style={{ height: 11, width: '55%', borderRadius: 6 }} />
            <div className="tl-skel" style={{ height: 32, width: '100%', borderRadius: 999, marginTop: 4 }} />
          </div>
        </div>
      ))}
    </div>
  );
}
import { fetchList, getFiles } from '../../_lib/apiClient';
import { getName, getPrice, FILE_SEGMENT, fileUrl, fmtMoney, trVal } from '../../_lib/catalogFields';

// Бэкенд возвращает то массив, то { data: [...] }, то { restaurants: [...] } — нормализуем.
function toArray(res) {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (res && typeof res === 'object') {
    const arr = Object.values(res).find((v) => Array.isArray(v));
    if (arr) return arr;
  }
  return [];
}

// Картинка карточки: грузим первый файл записи (фото отдаётся отдельным эндпоинтом).
function CardImage({ segment, id, slug, alt }) {
  const [src, setSrc] = useState('');
  useEffect(() => {
    let active = true;
    if (!segment || id == null) return;
    getFiles(segment, id)
      .then((files) => {
        const arr = Array.isArray(files) ? files : (files?.data || []);
        const img = arr.find((f) => !f.mimetype || f.mimetype.startsWith('image'));
        if (active && img) setSrc(fileUrl(img.path || img.url));
      })
      .catch(() => {});
    return () => { active = false; };
  }, [segment, id]);

  return (
    <div style={{ aspectRatio: '4 / 3', background: '#E8DED3', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      {src
        ? <img src={src} alt={alt} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : <CatIcon slug={slug} size={40} color="#B08D57" style={{ opacity: 0.55 }} />}
    </div>
  );
}

export default function CategoryList() {
  const { category } = useParams();
  const { city, lang, t, ready, isAuth } = useApp();
  const { has, toggle } = useCart();
  const cat = CATEGORY_BY_SLUG[category];

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!cat) return;
    if (!isAuth) { setItems([]); setLoading(false); return; } // каталог требует входа (бэкенд)
    let active = true;
    setLoading(true);
    setError('');
    fetchList(cat.list)
      .then((res) => {
        if (!active) return;
        // Часть эндпоинтов бэкенда не фильтрует по городу — фильтруем на клиенте.
        const all = toArray(res);
        const sel = (city || '').trim().toLowerCase();
        const cityOf = (it) => String(it.city || it.transport?.city || '').trim().toLowerCase();
        setItems(sel ? all.filter((it) => { const c = cityOf(it); return !c || c === sel; }) : all);
      })
      .catch((e) => active && setError(e.message))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [cat, city, isAuth]);

  if (!cat) {
    return <p style={{ color: '#6B5A4D' }}>{t('Категория не найдена', 'Санат табылмады')}.</p>;
  }

  const title = lang === 'kz' ? cat.kz : cat.ru;
  const segment = FILE_SEGMENT[cat.slug];

  return (
    <div>
      <style>{`
        @keyframes tl-shimmer { 0% { background-position: -468px 0 } 100% { background-position: 468px 0 } }
        .tl-skel { background: #EFE7DA; background-image: linear-gradient(90deg,#EFE7DA 0px,#F7F1E7 200px,#EFE7DA 400px); background-size: 900px 100%; animation: tl-shimmer 1.4s linear infinite; }
        .tl-card { transition: box-shadow .18s ease, border-color .18s ease; }
        .tl-card:hover { box-shadow: 0 12px 28px rgba(74,63,53,0.13); border-color: #B08D57; }
        @media (prefers-reduced-motion: reduce) { .tl-skel { animation: none } }
      `}</style>
      <Link href="/app" style={{ color: '#6B5A4D', textDecoration: 'none', fontSize: 14 }}>← {t('Назад', 'Артқа')}</Link>
      <h1 style={{ fontSize: 28, fontWeight: 800, margin: '10px 0 4px', display: 'flex', alignItems: 'center', gap: 10, color: '#4A3F35' }}>
        <span style={{ width: 44, height: 44, borderRadius: 12, background: '#F3EADB', color: '#B08D57', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <CatIcon slug={cat.slug} size={24} />
        </span>
        {title}
      </h1>
      <p style={{ color: '#6B5A4D', marginBottom: 20, fontSize: 14 }}>{t('Город', 'Қала')}: {city || '—'}</p>

      {ready && !isAuth && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#6B5A4D' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🔒</div>
          <p style={{ marginBottom: 16 }}>{t('Войдите, чтобы просматривать услуги', 'Қызметтерді көру үшін кіріңіз')}</p>
          <Link href={`/app/login?redirect=/app/catalog/${category}`} style={{ color: '#B08D57', fontWeight: 700 }}>{t('Войти', 'Кіру')}</Link>
          <span style={{ margin: '0 8px', color: '#D4C4B0' }}>·</span>
          <Link href="/app/register" style={{ color: '#B08D57', fontWeight: 700 }}>{t('Регистрация', 'Тіркелу')}</Link>
        </div>
      )}

      {isAuth && (<>
      {loading && <SkeletonGrid />}
      {error && !loading && (
        <p style={{ color: '#A33', background: '#FCEBEB', padding: 12, borderRadius: 12 }}>
          {t('Не удалось загрузить', 'Жүктеу мүмкін болмады')}: {error}
        </p>
      )}
      {!loading && !error && items.length === 0 && (
        <p style={{ color: '#6B5A4D' }}>{t('Пока нет записей в этом городе', 'Бұл қалада әзірге жазба жоқ')}.</p>
      )}

      {!loading && items.length > 0 && (
      <StaggerGrid style={GRID}>
        {items.map((item, i) => {
          const id = pick(item, ['id', '_id', 'uuid'], i);
          const name = getName(item, t('Без названия', 'Атауы жоқ'));
          const price = getPrice(item);
          const sub = pick(item, ['district', 'address', 'city'], '');
          return (
            <StaggerItem key={id} whileHover={hoverLift} whileTap={tapPress}>
            <Link href={`/app/catalog/${cat.slug}/${id}`} className="tl-card"
              style={{ textDecoration: 'none', color: '#4A3F35', background: '#fff', border: '1px solid rgba(212,196,176,0.5)', borderRadius: 18, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <CardImage segment={segment} id={id} slug={cat.slug} alt={name} />
              <div style={{ padding: 14 }}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                {sub && <div style={{ color: '#8C7B6D', fontSize: 12, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{trVal(sub, lang)}</div>}
                {price != null
                  ? <div style={{ color: '#B08D57', fontWeight: 700, fontSize: 14, marginBottom: 10 }}>{fmtMoney(price)}</div>
                  : <div style={{ color: '#A99', fontSize: 13, marginBottom: 10 }}>{t('Цена не указана', 'Бағасы көрсетілмеген')}</div>}
                {(() => {
                  const inCart = has(cat.slug, item);
                  return (
                    <button type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(cat.slug, item); }}
                      style={{ width: '100%', padding: '9px', borderRadius: 999, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700,
                        background: inCart ? '#FCEBEB' : '#4A3F35', color: inCart ? '#A33' : '#F5F0E9' }}>
                      {inCart ? t('В корзине ✓', 'Себетте ✓') : t('В корзину', 'Себетке')}
                    </button>
                  );
                })()}
              </div>
            </Link>
            </StaggerItem>
          );
        })}
      </StaggerGrid>
      )}
      </>)}
    </div>
  );
}
