'use client';

// Кабинет поставщика (roleId === 2): объявления со статусами модерации + удаление.
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useApp } from '../_lib/AppContext';
import { getSupplierListings, deleteListing } from '../_lib/apiClient';
import { GROUP_BY_KEY, flattenListings, listingName, listingPrice, listingSub } from '../_lib/supplier';
import { pick } from '../_lib/categories';

export default function SupplierCabinet() {
  const { ready, isAuth, user, lang, t } = useApp();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const isSupplier = user?.roleId === 2;

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    getSupplierListings()
      .then((res) => setItems(flattenListings(res?.data || res)))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (ready && isSupplier) load();
    else if (ready) setLoading(false);
  }, [ready, isSupplier, load]);

  const onDelete = async (item) => {
    const g = GROUP_BY_KEY[item._group];
    const id = pick(item, ['id', '_id']);
    if (!g || id === '' ) return;
    if (!window.confirm(t('Удалить объявление?', 'Хабарландыруды жою керек пе?'))) return;
    setBusyId(id + item._group);
    try {
      await deleteListing(g.del(id));
      setItems((arr) => arr.filter((x) => !(x === item)));
    } catch (e) {
      window.alert(e.message);
    } finally {
      setBusyId(null);
    }
  };

  if (ready && !isAuth) {
    return <Guard text={t('Войдите как поставщик, чтобы управлять объявлениями.', 'Хабарландыруларды басқару үшін жеткізуші ретінде кіріңіз.')} cta={t('Войти', 'Кіру')} href="/app/login" />;
  }
  if (ready && isAuth && !isSupplier) {
    return <Guard text={t('Этот раздел доступен только поставщикам.', 'Бұл бөлім тек жеткізушілерге қолжетімді.')} cta={t('На главную', 'Басты бетке')} href="/app" />;
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800 }}>{t('Кабинет поставщика', 'Жеткізуші кабинеті')}</h1>
          <p style={{ color: '#6B5A4D', fontSize: 14, marginTop: 4 }}>{t('Ваши объявления и их статус модерации', 'Хабарландырулар және олардың модерация мәртебесі')}</p>
        </div>
        <Link href="/app/supplier/new" style={{ padding: '12px 20px', borderRadius: 999, background: '#4A3F35', color: '#F5F0E9', fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>
          + {t('Добавить объявление', 'Хабарландыру қосу')}
        </Link>
      </div>

      {loading && <p style={{ color: '#6B5A4D' }}>{t('Загрузка…', 'Жүктелуде…')}</p>}
      {error && !loading && <p style={{ color: '#A33', background: '#FCEBEB', padding: 12, borderRadius: 12 }}>{error}</p>}
      {!loading && !error && items.length === 0 && (
        <p style={{ color: '#6B5A4D' }}>{t('У вас пока нет объявлений.', 'Әзірге хабарландырулар жоқ.')}</p>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {items.map((item, i) => {
          const g = GROUP_BY_KEY[item._group];
          const status = item.status || 'approved';
          return (
            <div key={i} style={{ background: '#fff', border: '1px solid rgba(212,196,176,0.5)', borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 22 }}>{g?.icon || '📄'}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#8C7B6D' }}>{lang === 'kz' ? g?.kz : g?.ru}</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{listingName(item)}</div>
              {listingSub(item) && <div style={{ color: '#6B5A4D', fontSize: 14 }}>{listingSub(item)}</div>}
              {listingPrice(item) !== '' && <div style={{ color: '#B08D57', fontWeight: 700 }}>{Number(listingPrice(item)).toLocaleString('ru-RU')} ₸</div>}

              <StatusBadge status={status} reason={item.rejectionReason} t={t} />

              <button onClick={() => onDelete(item)} disabled={busyId === (pick(item, ['id', '_id']) + item._group)}
                style={{ marginTop: 4, alignSelf: 'flex-start', padding: '7px 14px', borderRadius: 999, border: '1px solid #E0B4B4', background: '#fff', color: '#B91C1C', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                {t('Удалить', 'Жою')}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatusBadge({ status, reason, t }) {
  if (status === 'pending') {
    return <span style={{ alignSelf: 'flex-start', background: '#FAEEDA', color: '#B45309', fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 999 }}>⏳ {t('На модерации', 'Модерацияда')}</span>;
  }
  if (status === 'rejected') {
    return <span style={{ background: '#FCEBEB', color: '#B91C1C', fontSize: 12, fontWeight: 600, padding: '6px 10px', borderRadius: 10 }}>✕ {t('Отклонено', 'Қабылданбады')}{reason ? `: ${reason}` : ''}</span>;
  }
  return <span style={{ alignSelf: 'flex-start', background: '#E1F5EE', color: '#0F6E56', fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 999 }}>✓ {t('Одобрено', 'Мақұлданды')}</span>;
}

function Guard({ text, cta, href }) {
  return (
    <div style={{ textAlign: 'center', padding: '56px 0' }}>
      <p style={{ color: '#6B5A4D', fontSize: 16, marginBottom: 20 }}>{text}</p>
      <Link href={href} style={{ padding: '12px 24px', borderRadius: 999, background: '#4A3F35', color: '#F5F0E9', fontWeight: 700, textDecoration: 'none' }}>{cta}</Link>
    </div>
  );
}
