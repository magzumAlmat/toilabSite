'use client';

// Публичный список подарков мероприятия — для гостей (без аккаунта).
// GET /api/weddings/public/{id} + /api/wishlist/public/wedding/{id}; резерв — reservebyunknown.
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useApp } from '../../_lib/AppContext';
import { getPublicWedding, getPublicWeddingWishlist, reserveWishByUnknown } from '../../_lib/apiClient';

const unwrap = (res) => res?.data ?? res ?? null;
const asArray = (res) => (Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : []);

export default function PublicWishlist() {
  const { t } = useApp();
  const { id } = useParams();
  const [ev, setEv] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const loadList = useCallback(async () => {
    setItems(asArray(await getPublicWeddingWishlist(id)));
  }, [id]);

  useEffect(() => {
    (async () => {
      try {
        try { setEv(unwrap(await getPublicWedding(id))); } catch { /* инфо необязательна */ }
        await loadList();
      } catch (err) {
        setError(err.message || t('Не удалось загрузить список', 'Тізімді жүктеу мүмкін болмады'));
      } finally {
        setLoading(false);
      }
    })();
  }, [id, loadList, t]);

  const reserve = async (wid) => {
    const name = prompt(t('Ваше имя (кто дарит):', 'Сіздің атыңыз:'));
    if (!name || !name.trim()) return;
    setBusyId(wid);
    try {
      await reserveWishByUnknown(wid, name.trim());
      await loadList();
    } catch (err) {
      alert(err.message || t('Не удалось забронировать', 'Брондау мүмкін болмады'));
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <p style={{ color: '#8C7B6D', padding: '24px 0', textAlign: 'center' }}>{t('Загрузка…', 'Жүктелуде…')}</p>;

  return (
    <div style={{ maxWidth: 560, margin: '8px auto' }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>
        {t('Список подарков', 'Сыйлықтар тізімі')}{ev?.name ? ` · ${ev.name}` : ''}
      </h1>
      {ev?.date && <div style={{ color: '#8C7B6D', fontSize: 14, marginBottom: 16 }}>{ev.date}</div>}
      <p style={{ color: '#6B5A4D', fontSize: 14, marginBottom: 18 }}>
        {t('Выберите подарок и забронируйте его, чтобы не было повторов.', 'Қайталанбас үшін сыйлықты таңдап, броньдаңыз.')}
      </p>

      {error && <div style={{ color: '#A33', background: '#FCEBEB', padding: 12, borderRadius: 10, marginBottom: 14 }}>{error}</div>}

      {!error && items.length === 0 && (
        <p style={{ color: '#8C7B6D', textAlign: 'center', padding: '24px 0' }}>{t('Список подарков пуст.', 'Сыйлықтар тізімі бос.')}</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map((w) => {
          const gname = w.item_name || w.Good?.item_name || w.good?.item_name || w.name || t('Подарок', 'Сыйлық');
          const reserved = w.is_reserved || w.status === 'reserved' || w.reserved_by_unknown || w.reserved_by_user_id;
          const who = w.Reserver?.username || w.reserved_by_unknown;
          return (
            <div key={w.id} style={{ background: '#fff', border: '1px solid rgba(212,196,176,0.6)', borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, color: '#4A3F35', fontWeight: 600 }}>{gname}</div>
                {reserved && <div style={{ fontSize: 12, color: '#B08D57' }}>{t('Забронировано', 'Брондалған')}{who ? ` · ${who}` : ''}</div>}
              </div>
              {reserved ? (
                <span style={{ fontSize: 13, color: '#B08D57', fontWeight: 600 }}>✓</span>
              ) : (
                <button onClick={() => reserve(w.id)} disabled={busyId === w.id}
                  style={{ padding: '8px 16px', borderRadius: 999, background: '#4A3F35', color: '#F5F0E9', fontWeight: 600, fontSize: 13, border: 'none', cursor: 'pointer', opacity: busyId === w.id ? 0.6 : 1 }}>
                  {busyId === w.id ? '…' : t('Забронировать', 'Броньдау')}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
