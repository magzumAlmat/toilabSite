'use client';

// Кабинет клиента: список созданных мероприятий (GET /api/getallweddings).
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../_lib/AppContext';
import { getWeddings, deleteWedding } from '../_lib/apiClient';
import { fmt } from '../_lib/events';

function asArray(res) {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.weddings)) return res.weddings;
  return [];
}

export default function EventsList() {
  const { ready, isAuth, user, t } = useApp();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [delId, setDelId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getWeddings();
      let list = asArray(res);
      // На всякий случай оставляем мероприятия текущего пользователя.
      if (user?.id != null) {
        const mine = list.filter((w) => w.host_id == null || w.host_id === user.id);
        list = mine.length ? mine : list;
      }
      setEvents(list);
    } catch (err) {
      setError(err.message || t('Не удалось загрузить', 'Жүктеу мүмкін болмады'));
    } finally {
      setLoading(false);
    }
  }, [user?.id, t]);

  useEffect(() => {
    if (ready && isAuth) load();
    else if (ready) setLoading(false);
  }, [ready, isAuth, load]);

  const onDelete = async (id) => {
    if (!confirm(t('Удалить мероприятие?', 'Іс-шараны жою керек пе?'))) return;
    setDelId(id);
    try {
      await deleteWedding(id);
      setEvents((e) => e.filter((x) => x.id !== id));
    } catch (err) {
      alert(err.message || t('Не удалось удалить', 'Жою мүмкін болмады'));
    } finally {
      setDelId(null);
    }
  };

  if (ready && !isAuth) {
    return (
      <div style={{ textAlign: 'center', padding: '56px 0' }}>
        <p style={{ color: 'var(--ink-2)', marginBottom: 20 }}>{t('Войдите, чтобы планировать мероприятия.', 'Іс-шара жоспарлау үшін кіріңіз.')}</p>
        <Link href="/app/login?redirect=/app/events" style={{ color: 'var(--accent)', fontWeight: 700 }}>{t('Войти', 'Кіру')}</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640, margin: '8px auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 6 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--ink)' }}>{t('Мои мероприятия', 'Менің іс-шараларым')}</h1>
        <Link href="/app/events/new" style={{ background: 'var(--brand)', color: 'var(--on-brand)', borderRadius: 'var(--r-pill)', padding: '11px 20px', textDecoration: 'none', fontWeight: 800, fontSize: 14, whiteSpace: 'nowrap', boxShadow: 'var(--shadow-sm)' }}>
          + {t('Создать', 'Жасау')}
        </Link>
      </div>
      <p style={{ color: 'var(--ink-2)', fontSize: 14, marginBottom: 20 }}>{t('Планируйте бюджет и услуги для вашего тоя.', 'Тойыңызға бюджет пен қызметтерді жоспарлаңыз.')}</p>

      {loading && <p style={{ color: 'var(--ink-3)' }}>{t('Загрузка…', 'Жүктелуде…')}</p>}
      {error && <div role="alert" style={{ color: 'var(--danger)', background: 'var(--danger-bg)', padding: 10, borderRadius: 10, fontSize: 14, marginBottom: 14 }}>{error}</div>}

      {!loading && !error && events.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--ink-3)' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>📋</div>
          <p style={{ marginBottom: 16 }}>{t('У вас пока нет мероприятий.', 'Сізде әзірге іс-шара жоқ.')}</p>
          <Link href="/app/events/new" style={{ color: 'var(--accent)', fontWeight: 800 }}>{t('Создать первое →', 'Біріншісін жасау →')}</Link>
        </div>
      )}

      <motion.div layout style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <AnimatePresence initial={false}>
        {events.map((e) => {
          const total = e.total_cost ?? 0;
          const budget = e.budget ?? 0;
          const remain = e.remaining_balance ?? (budget - total);
          return (
            <motion.div layout key={e.id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -24, transition: { duration: 0.18 } }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r)', padding: 18, boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <Link href={`/app/events/${e.id}`} style={{ textDecoration: 'none', color: 'var(--ink)', flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 17 }}>{e.name || t('Без названия', 'Атаусыз')}</div>
                  <div style={{ color: 'var(--ink-3)', fontSize: 13, marginTop: 2 }}>{e.date || ''}</div>
                </Link>
                <button onClick={() => onDelete(e.id)} disabled={delId === e.id}
                  style={{ border: 'none', background: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
                  {delId === e.id ? '…' : t('Удалить', 'Жою')}
                </button>
              </div>
              <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap', fontSize: 13, fontWeight: 600 }}>
                <span style={{ color: 'var(--ink-2)' }}>{t('Бюджет', 'Бюджет')}: <b style={{ color: 'var(--ink)' }}>{fmt(budget)} ₸</b></span>
                <span style={{ color: 'var(--ink-2)' }}>{t('Услуги', 'Қызметтер')}: <b style={{ color: 'var(--ink)' }}>{fmt(total)} ₸</b></span>
                <span style={{ color: remain < 0 ? 'var(--danger)' : 'var(--ok)' }}>{t('Остаток', 'Қалдық')}: <b>{fmt(remain)} ₸</b></span>
              </div>
            </motion.div>
          );
        })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
