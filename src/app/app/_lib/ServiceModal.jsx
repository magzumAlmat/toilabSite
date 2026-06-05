'use client';

// Общая модалка «Подробнее» для услуги: фото/видео (с лайтбоксом), описание, характеристики.
// Используется в форме создания мероприятия и в детали мероприятия.
import { useEffect, useState } from 'react';
import { getFiles } from './apiClient';
import { getName, getPrice, getSpecs, fileUrl, fmtMoney } from './catalogFields';

export default function ServiceModal({ item, typeMeta = {}, fileSegment, lang, t, onClose, footer }) {
  const [media, setMedia] = useState([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(null);

  useEffect(() => {
    setLightboxIdx(null);
    if (!item || !fileSegment) { setMedia([]); return; }
    let active = true;
    setLoadingMedia(true);
    getFiles(fileSegment, item.id)
      .then((files) => {
        const arr = Array.isArray(files) ? files : (files?.data || []);
        if (active) setMedia(arr.map((f) => ({ url: fileUrl(f.path || f.url), video: f.mimetype && f.mimetype.startsWith('video') })).filter((m) => m.url));
      })
      .catch(() => { if (active) setMedia([]); })
      .finally(() => { if (active) setLoadingMedia(false); });
    return () => { active = false; };
  }, [item, fileSegment]);

  if (!item) return null;
  const tr = (ru, kz) => (typeof t === 'function' ? t(ru, kz) : ru);
  const price = getPrice(item);
  const desc = item.description || item.about || '';
  const specs = getSpecs(item, lang);
  const catLabel = lang === 'kz' ? (typeMeta.kz || '') : (typeMeta.ru || '');

  return (
    <>
      <div onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(40,33,28,0.55)', zIndex: 100, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 16, overflowY: 'auto' }}>
        <div onClick={(e) => e.stopPropagation()}
          style={{ background: '#fff', borderRadius: 18, maxWidth: 520, width: '100%', margin: 'auto', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, padding: '16px 18px 0' }}>
            <div>
              <div style={{ fontSize: 12, color: '#8C7B6D', fontWeight: 600 }}>{typeMeta.icon} {catLabel}</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#4A3F35', margin: '2px 0 0' }}>{getName(item, tr('Без названия', 'Атаусыз'))}</h3>
            </div>
            <button type="button" onClick={onClose} style={{ border: 'none', background: 'none', color: '#8C7B6D', cursor: 'pointer', fontSize: 24, lineHeight: 1 }}>×</button>
          </div>

          <div style={{ padding: '12px 18px 18px' }}>
            {price != null && <div style={{ color: '#B08D57', fontWeight: 800, fontSize: 18, marginBottom: 12 }}>{fmtMoney(price)}</div>}

            {loadingMedia && <div style={{ color: '#8C7B6D', fontSize: 14, marginBottom: 12 }}>{tr('Загрузка фото…', 'Фото жүктелуде…')}</div>}
            {!loadingMedia && media.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: media.length === 1 ? '1fr' : 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10, marginBottom: 14 }}>
                {media.map((m, i) => (
                  <div key={i} onClick={() => setLightboxIdx(i)} style={{ position: 'relative', cursor: 'zoom-in', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(212,196,176,0.5)' }}>
                    {m.video
                      ? <><video src={m.url} style={{ width: '100%', aspectRatio: '4 / 3', objectFit: 'cover', display: 'block', pointerEvents: 'none' }} />
                          <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>▶</span></>
                      : <img src={m.url} alt={`${i + 1}`} loading="lazy" style={{ width: '100%', aspectRatio: '4 / 3', objectFit: 'cover', display: 'block' }} />}
                  </div>
                ))}
              </div>
            )}
            {!loadingMedia && media.length === 0 && (
              <div style={{ background: '#F5F0E9', borderRadius: 12, padding: '20px', textAlign: 'center', color: '#A99', fontSize: 36, marginBottom: 14 }}>{typeMeta.icon || '•'}</div>
            )}

            {desc && <p style={{ color: '#6B5A4D', lineHeight: 1.6, fontSize: 14, marginBottom: 14, whiteSpace: 'pre-line' }}>{desc}</p>}

            {specs.length > 0 && (
              <div style={{ border: '1px solid rgba(212,196,176,0.5)', borderRadius: 12, overflow: 'hidden', marginBottom: footer ? 14 : 0 }}>
                {specs.map(([label, value, href], i) => (
                  <div key={label + i} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '9px 14px', borderTop: i ? '1px solid rgba(212,196,176,0.4)' : 'none' }}>
                    <span style={{ color: '#8C7B6D', fontSize: 13 }}>{label}</span>
                    {href
                      ? <a href={href} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 600, fontSize: 13, textAlign: 'right', color: '#B08D57', wordBreak: 'break-all' }}>{value}</a>
                      : <span style={{ fontWeight: 600, fontSize: 13, textAlign: 'right', color: '#4A3F35' }}>{value}</span>}
                  </div>
                ))}
              </div>
            )}

            {footer}
          </div>
        </div>
      </div>

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
    </>
  );
}

const navBtn = (side) => ({
  position: 'absolute', [side]: 8, top: '50%', transform: 'translateY(-50%)',
  width: 48, height: 48, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.15)',
  color: '#fff', fontSize: 30, lineHeight: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2,
});
