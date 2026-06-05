'use client';

// Карточка услуги (Details): имя, цена, фото/видео, локализованные характеристики.
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '../../../_lib/AppContext';
import { useCart } from '../../../_lib/CartContext';
import { CATEGORY_BY_SLUG, pick } from '../../../_lib/categories';
import { fetchOne, getFiles } from '../../../_lib/apiClient';
import { getName, getPrice, getSpecs, FILE_SEGMENT, fileUrl, fmtMoney } from '../../../_lib/catalogFields';

function unwrap(res) {
  if (!res || typeof res !== 'object') return res;
  if (res.data && typeof res.data === 'object' && !Array.isArray(res.data)) return res.data;
  const keys = Object.keys(res);
  if (keys.length === 1 && res[keys[0]] && typeof res[keys[0]] === 'object') return res[keys[0]];
  return res;
}

export default function ServiceDetail() {
  const { category, id } = useParams();
  const { lang, t } = useApp();
  const { has, toggle } = useCart();
  const cat = CATEGORY_BY_SLUG[category];

  const [item, setItem] = useState(null);
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!cat) return;
    let active = true;
    setLoading(true);
    setError('');
    setMedia([]);
    fetchOne(cat.detail(id))
      .then((res) => active && setItem(unwrap(res)))
      .catch((e) => active && setError(e.message))
      .finally(() => active && setLoading(false));

    const segment = FILE_SEGMENT[cat.slug];
    if (segment) {
      getFiles(segment, id)
        .then((files) => {
          const arr = Array.isArray(files) ? files : (files?.data || []);
          if (active) setMedia(arr.map((f) => ({ url: fileUrl(f.path || f.url), video: f.mimetype && f.mimetype.startsWith('video') })).filter((m) => m.url));
        })
        .catch(() => {});
    }
    return () => { active = false; };
  }, [cat, id]);

  if (!cat) return <p style={{ color: '#6B5A4D' }}>{t('Категория не найдена', 'Санат табылмады')}.</p>;

  const backHref = `/app/catalog/${cat.slug}`;

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <Link href={backHref} style={{ color: '#6B5A4D', textDecoration: 'none', fontSize: 14 }}>← {lang === 'kz' ? cat.kz : cat.ru}</Link>

      {loading && <p style={{ color: '#6B5A4D', marginTop: 16 }}>{t('Загрузка…', 'Жүктелуде…')}</p>}
      {error && !loading && (
        <p style={{ color: '#A33', background: '#FCEBEB', padding: 12, borderRadius: 12, marginTop: 16 }}>{error}</p>
      )}

      {item && !loading && (() => {
        const name = getName(item, t('Без названия', 'Атауы жоқ'));
        const price = getPrice(item);
        const desc = pick(item, ['description', 'desc', 'about'], '');
        const specs = getSpecs(item, lang);
        return (
          <div style={{ marginTop: 16 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>{name}</h1>
            {price != null && <div style={{ color: '#B08D57', fontWeight: 800, fontSize: 22, marginBottom: 12 }}>{fmtMoney(price)}</div>}

            {(() => {
              const inCart = has(cat.slug, item);
              return (
                <button type="button" onClick={() => toggle(cat.slug, item)}
                  style={{ padding: '12px 22px', borderRadius: 999, border: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 700, marginBottom: 18,
                    background: inCart ? '#FCEBEB' : '#4A3F35', color: inCart ? '#A33' : '#F5F0E9' }}>
                  {inCart ? t('В корзине ✓ — убрать', 'Себетте ✓ — алу') : t('🛒 В корзину', '🛒 Себетке')}
                </button>
              );
            })()}

            {media.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: media.length === 1 ? '1fr' : 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, marginBottom: 20 }}>
                {media.map((m, i) => (
                  m.video
                    ? <video key={i} src={m.url} controls style={{ width: '100%', borderRadius: 14, border: '1px solid rgba(212,196,176,0.5)' }} />
                    : <img key={i} src={m.url} alt={`${name} ${i + 1}`} loading="lazy" style={{ width: '100%', aspectRatio: '4 / 3', objectFit: 'cover', borderRadius: 14, border: '1px solid rgba(212,196,176,0.5)' }} />
                ))}
              </div>
            )}

            {desc && <p style={{ color: '#6B5A4D', lineHeight: 1.7, marginBottom: 20, whiteSpace: 'pre-line' }}>{desc}</p>}

            {specs.length > 0 && (
              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(212,196,176,0.5)', overflow: 'hidden' }}>
                {specs.map(([label, value, href], i) => (
                  <div key={label + i} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '11px 16px', borderTop: i ? '1px solid rgba(212,196,176,0.4)' : 'none' }}>
                    <span style={{ color: '#8C7B6D', fontSize: 14 }}>{label}</span>
                    {href
                      ? <a href={href} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 600, fontSize: 14, textAlign: 'right', color: '#B08D57', wordBreak: 'break-all' }}>{value}</a>
                      : <span style={{ fontWeight: 600, fontSize: 14, textAlign: 'right' }}>{value}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
