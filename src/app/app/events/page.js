'use client';

// Кабинет клиента: список созданных мероприятий (GET /api/getallweddings).
// Тёплый дизайн в тонах /about: герой-баннер + карточки с прогресс-баром бюджета.
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, CalendarRange, Wallet, ChevronRight, Trash2, PartyPopper } from 'lucide-react';
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
    <div style={{ maxWidth: 680, margin: '4px auto' }}>
      <style>{`
        .tl-ev { transition: box-shadow .2s ease, transform .2s ease, border-color .2s ease; }
        .tl-ev:hover { box-shadow: var(--shadow); transform: translateY(-2px); border-color: rgba(176,141,87,0.35); }
        .tl-ev:hover .tl-ev-go { transform: translateX(3px); }
        .tl-ev-go { transition: transform .2s ease; }
      `}</style>

      {/* Герой-баннер (тёплый, в тонах /about) */}
      <div className="tl-dark tl-grid" style={{ position: 'relative', overflow: 'hidden', borderRadius: 'var(--r-lg)', padding: '24px 24px', marginBottom: 22, boxShadow: 'var(--shadow-lg)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--gold)', marginBottom: 8 }}>
            <PartyPopper size={15} /> {(events.length ? `${events.length} ` : '') + t('МЕРОПРИЯТИЙ', 'ІС-ШАРА')}
          </div>
          <h1 className="tl-display" style={{ fontSize: 'clamp(24px,4vw,32px)', fontWeight: 800, color: 'var(--on-dark)', lineHeight: 1.1, marginBottom: 4 }}>{t('Мои мероприятия', 'Менің іс-шараларым')}</h1>
          <p style={{ color: 'var(--on-dark-2)', fontSize: 14, maxWidth: 360 }}>{t('Планируйте бюджет и услуги для вашего тоя.', 'Тойыңызға бюджет пен қызметтерді жоспарлаңыз.')}</p>
        </div>
        <Link href="/app/events/new" style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', color: 'var(--brand)', borderRadius: 'var(--r-pill)', padding: '13px 22px', textDecoration: 'none', fontWeight: 800, fontSize: 15, whiteSpace: 'nowrap', boxShadow: '0 10px 28px rgba(0,0,0,0.22)' }}>
          <Plus size={18} /> {t('Создать', 'Жасау')}
        </Link>
      </div>

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r)', padding: 18, boxShadow: 'var(--shadow-sm)' }}>
              <div className="tl-skel" style={{ height: 16, width: '55%', borderRadius: 6, marginBottom: 10 }} />
              <div className="tl-skel" style={{ height: 10, width: '100%', borderRadius: 999 }} />
            </div>
          ))}
        </div>
      )}
      {error && <div role="alert" style={{ color: 'var(--danger)', background: 'var(--danger-bg)', padding: 10, borderRadius: 10, fontSize: 14, marginBottom: 14 }}>{error}</div>}

      {!loading && !error && events.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 22px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ display: 'inline-flex', width: 64, height: 64, borderRadius: 'var(--r-pill)', background: 'var(--surface-2)', color: 'var(--accent)', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <CalendarRange size={30} />
          </span>
          <h2 className="tl-display" style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink)', marginBottom: 6 }}>{t('Пока нет мероприятий', 'Іс-шара әзірге жоқ')}</h2>
          <p style={{ color: 'var(--ink-2)', fontSize: 14, marginBottom: 18 }}>{t('Создайте первое — укажите бюджет и гостей, услуги подберём сами.', 'Біріншісін жасаңыз — бюджет пен қонақ көрсетіңіз, қызметтерді өзіміз таңдаймыз.')}</p>
          <Link href="/app/events/new" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--brand)', color: 'var(--on-brand)', borderRadius: 'var(--r-pill)', padding: '13px 26px', textDecoration: 'none', fontWeight: 800, fontSize: 15, boxShadow: 'var(--shadow)' }}>
            <Plus size={18} /> {t('Создать мероприятие', 'Іс-шара жасау')}
          </Link>
        </div>
      )}

      <motion.div layout style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <AnimatePresence initial={false}>
        {events.map((e) => {
          const total = e.total_cost ?? 0;
          const budget = e.budget ?? 0;
          const remain = e.remaining_balance ?? (budget - total);
          const over = remain < 0;
          const pct = budget > 0 ? Math.min(100, Math.round((total / budget) * 100)) : 0;
          const barColor = over ? 'var(--danger)' : 'var(--accent)';
          return (
            <motion.div layout key={e.id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -24, transition: { duration: 0.18 } }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="tl-ev"
              style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)', padding: 18, boxShadow: 'var(--shadow-sm)' }}>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <Link href={`/app/events/${e.id}`} style={{ textDecoration: 'none', color: 'var(--ink)', flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 800, fontSize: 18, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.name || t('Без названия', 'Атаусыз')}</span>
                    <ChevronRight className="tl-ev-go" size={18} style={{ color: 'var(--ink-3)', flexShrink: 0 }} />
                  </div>
                  {e.date && <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--ink-3)', fontSize: 13, marginTop: 3 }}><CalendarRange size={13} /> {e.date}</div>}
                </Link>
                <button onClick={() => onDelete(e.id)} disabled={delId === e.id} aria-label={t('Удалить', 'Жою')}
                  style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, border: '1px solid var(--line)', background: 'var(--surface)', borderRadius: 'var(--r-sm)', color: 'var(--danger)', cursor: 'pointer' }}>
                  {delId === e.id ? '…' : <Trash2 size={16} />}
                </button>
              </div>

              {/* Прогресс-бар бюджета */}
              <div style={{ marginTop: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: 13, marginBottom: 6 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--ink-2)', fontWeight: 600 }}><Wallet size={14} /> {t('Потрачено', 'Жұмсалды')}: <b style={{ color: 'var(--ink)' }}>{fmt(total)} ₸</b></span>
                  <span style={{ color: 'var(--ink-3)', fontWeight: 600 }}>{t('из', 'дан')} {fmt(budget)} ₸</span>
                </div>
                <div style={{ height: 8, borderRadius: 999, background: 'var(--surface-2)', overflow: 'hidden' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5, ease: 'easeOut' }}
                    style={{ height: '100%', background: barColor, borderRadius: 999 }} />
                </div>
                <div style={{ marginTop: 8 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 700, padding: '4px 10px', borderRadius: 999,
                    color: over ? 'var(--danger)' : 'var(--ok)',
                    background: over ? 'var(--danger-bg)' : 'rgba(47,125,87,0.08)',
                    border: `1px solid ${over ? 'rgba(192,73,47,0.25)' : 'rgba(47,125,87,0.25)'}` }}>
                    {over ? `${t('Превышение', 'Асып кетті')}: ${fmt(-remain)} ₸` : `✓ ${t('Остаток', 'Қалдық')}: ${fmt(remain)} ₸`}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
