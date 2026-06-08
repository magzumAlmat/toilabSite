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
import { FadeIn } from '../../../../_ui/motion';

function unwrap(res) {
  if (!res || typeof res !== 'object') return res;
  if (res.data && typeof res.data === 'object' && !Array.isArray(res.data)) return res.data;
  const keys = Object.keys(res);
  if (keys.length === 1 && res[keys[0]] && typeof res[keys[0]] === 'object') return res[keys[0]];
  return res;
}

export default function ServiceDetail() {
  const { category, id } = useParams();
  const { lang, t, ready, isAuth } = useApp();
  const { has, toggle } = useCart();
  const cat = CATEGORY_BY_SLUG[category];

  const [item, setItem] = useState(null);
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lightboxIdx, setLightboxIdx] = useState(null);

  useEffect(() => {
    if (!cat) return;
    if (!isAuth) { setLoading(false); return; } // карточка требует входа (бэкенд)
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
  }, [cat, id, isAuth]);

  if (!cat) return <p style={{ color: '#6B5A4D' }}>{t('Категория не найдена', 'Санат табылмады')}.</p>;

  const backHref = `/app/catalog/${cat.slug}`;

  return (
    <FadeIn style={{ maxWidth: 760, margin: '0 auto' }}>
      <Link href={backHref} style={{ color: '#6B5A4D', textDecoration: 'none', fontSize: 14 }}>← {lang === 'kz' ? cat.kz : cat.ru}</Link>

      {ready && !isAuth && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#6B5A4D' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🔒</div>
          <p style={{ marginBottom: 16 }}>{t('Войдите, чтобы открыть карточку услуги', 'Қызмет картасын ашу үшін кіріңіз')}</p>
          <Link href="/app/login" style={{ color: '#B08D57', fontWeight: 700 }}>{t('Войти', 'Кіру')}</Link>
        </div>
      )}

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
                  <div key={i} onClick={() => setLightboxIdx(i)} style={{ position: 'relative', cursor: 'zoom-in', borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(212,196,176,0.5)' }}>
                    {m.video
                      ? <><video src={m.url} style={{ width: '100%', aspectRatio: '4 / 3', objectFit: 'cover', display: 'block', pointerEvents: 'none' }} />
                          <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>▶</span></>
                      : <img src={m.url} alt={`${name} ${i + 1}`} loading="lazy" style={{ width: '100%', aspectRatio: '4 / 3', objectFit: 'cover', display: 'block' }} />}
                  </div>
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

      {/* Лайтбокс: увеличенное фото/видео */}
      {lightboxIdx != null && media[lightboxIdx] && (
        <div onClick={() => setLightboxIdx(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button type="button" onClick={() => setLightboxIdx(null)}
            style={{ position: 'absolute', top: 16, right: 20, border: 'none', background: 'none', color: '#fff', fontSize: 34, lineHeight: 1, cursor: 'pointer', zIndex: 2 }}>×</button>
          {media.length > 1 && (
            <>
              <button type="button" onClick={(e) => { e.stopPropagation(); setLightboxIdx((i) => (i - 1 + media.length) % media.length); }} style={navBtn('left')}>‹</button>
              <button type="button" onClick={(e) => { e.stopPropagation(); setLightboxIdx((i) => (i + 1) % media.length); }} style={navBtn('right')}>›</button>
            </>
          )}
          <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: '92vw', maxHeight: '88vh', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            {media[lightboxIdx].video
              ? <video src={media[lightboxIdx].url} controls autoPlay style={{ maxWidth: '92vw', maxHeight: '82vh', borderRadius: 8 }} />
              : <img src={media[lightboxIdx].url} alt="" style={{ maxWidth: '92vw', maxHeight: '82vh', objectFit: 'contain', borderRadius: 8 }} />}
            {media.length > 1 && <div style={{ color: '#fff', fontSize: 13, opacity: 0.8 }}>{lightboxIdx + 1} / {media.length}</div>}
          </div>
        </div>
      )}
    </FadeIn>
  );
}

const navBtn = (side) => ({
  position: 'absolute', [side]: 8, top: '50%', transform: 'translateY(-50%)',
  width: 48, height: 48, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.15)',
  color: '#fff', fontSize: 30, lineHeight: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2,
});
