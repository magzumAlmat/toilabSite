'use client';

// Корзина: набранные услуги → ввод названия/даты/бюджета/гостей → создание мероприятия.
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '../_lib/AppContext';
import { useCart } from '../_lib/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORY_BY_SLUG } from '../_lib/categories';
import { CatIcon } from '../_lib/CatIcon';
import { getName, getPrice, fmtMoney, trVal } from '../_lib/catalogFields';
import { isGuestSlug, lineQty, unitCost, cartTotal, buildCartPayload } from '../_lib/cart';
import { createWedding } from '../_lib/apiClient';

const todayISO = () => new Date().toISOString().split('T')[0];

export default function CartPage() {
  const { ready, isAuth, user, city, lang, t } = useApp();
  const { items, setQty, remove, clear } = useCart();
  const router = useRouter();

  const [name, setName] = useState('');
  const [date, setDate] = useState(todayISO());
  const [budget, setBudget] = useState('');
  const [guests, setGuests] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const total = cartTotal(items, guests);
  const budgetVal = parseFloat(budget) || 0;
  const remain = budgetVal - total;

  const onCreate = async () => {
    if (!isAuth) { router.push('/app/login'); return; }
    if (!name.trim()) { setError(t('Укажите название мероприятия', 'Іс-шара атауын көрсетіңіз')); return; }
    if (items.length === 0) { setError(t('Корзина пуста', 'Себет бос')); return; }
    setBusy(true); setError('');
    try {
      await createWedding(buildCartPayload({ name, date, hostId: user?.id, budget, items, guests }));
      clear();
      router.push('/app/events');
    } catch (err) {
      setError(err.message || t('Не удалось создать', 'Жасау мүмкін болмады'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: '8px auto' }}>
      <Link href="/app" style={{ color: '#6B5A4D', textDecoration: 'none', fontSize: 14 }}>← {t('На главную', 'Басты бетке')}</Link>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, margin: '10px 0 4px' }}>
        <h1 style={{ fontSize: 26, fontWeight: 800 }}>🛒 {t('Корзина', 'Себет')}</h1>
        {items.length > 0 && <button onClick={clear} style={linkBtn}>{t('Очистить', 'Тазалау')}</button>}
      </div>
      <p style={{ color: '#6B5A4D', fontSize: 14, marginBottom: 20 }}>{t('Город', 'Қала')}: <b>{city || '—'}</b></p>

      {ready && items.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#8C7B6D' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🛒</div>
          <p style={{ marginBottom: 16 }}>{t('Корзина пуста. Добавьте услуги из каталога.', 'Себет бос. Каталогтан қызмет қосыңыз.')}</p>
          <Link href="/app" style={{ color: '#B08D57', fontWeight: 700 }}>{t('К категориям →', 'Санаттарға →')}</Link>
        </div>
      )}

      {items.length > 0 && (
        <>
          {/* Позиции */}
          <motion.div layout style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            <AnimatePresence initial={false}>
            {items.map((c) => {
              const cat = CATEGORY_BY_SLUG[c.slug] || {};
              const unit = unitCost(c.item);
              const guestQty = isGuestSlug(c.slug);
              const qty = lineQty(c.slug, c.quantity, guests);
              return (
                <motion.div layout key={`${c.slug}-${c.item.id}`}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -24, transition: { duration: 0.18 } }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  style={{ background: '#fff', border: '1px solid rgba(212,196,176,0.6)', borderRadius: 14, padding: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12, color: '#8C7B6D', display: 'flex', alignItems: 'center', gap: 6 }}><CatIcon slug={c.slug} size={14} /> {lang === 'kz' ? cat.kz : cat.ru}</div>
                      <div style={{ fontWeight: 700, color: '#4A3F35', overflow: 'hidden', textOverflow: 'ellipsis' }}>{getName(c.item)}</div>
                      {c.item.district && <div style={{ fontSize: 12, color: '#8C7B6D' }}>{trVal(c.item.district, lang)}</div>}
                    </div>
                    <div style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <b style={{ color: '#4A3F35' }}>{fmtMoney(unit * qty)}</b>
                      <button onClick={() => remove(c.slug, c.item.id)} title={t('Удалить', 'Жою')} style={{ border: 'none', background: 'none', color: '#A33', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#8C7B6D', marginTop: 8 }}>
                    <span>{unit ? `${fmtMoney(unit)} ×` : t('Цена не указана', 'Бағасы көрсетілмеген')}</span>
                    {unit > 0 && (guestQty ? (
                      <>
                        <button onClick={() => setGuests(String(Math.max(1, (parseInt(guests, 10) || 1) - 1)))} style={stepBtn}>−</button>
                        <input type="number" min={1} value={guests} placeholder="1"
                          onChange={(e) => setGuests(e.target.value)}
                          style={{ width: 56, padding: '6px 8px', borderRadius: 8, border: '1px solid #D4C4B0', fontSize: 14, color: '#4A3F35', textAlign: 'center' }} />
                        <button onClick={() => setGuests(String((parseInt(guests, 10) || 1) + 1))} style={stepBtn}>+</button>
                        <span>{t('гостей', 'қонақ')}</span>
                      </>
                    ) : (
                      <>
                        <button onClick={() => setQty(c.slug, c.item.id, c.quantity - 1)} style={stepBtn}>−</button>
                        <input type="number" min={1} value={c.quantity}
                          onChange={(e) => setQty(c.slug, c.item.id, parseInt(e.target.value, 10) || 1)}
                          style={{ width: 56, padding: '6px 8px', borderRadius: 8, border: '1px solid #D4C4B0', fontSize: 14, color: '#4A3F35', textAlign: 'center' }} />
                        <button onClick={() => setQty(c.slug, c.item.id, c.quantity + 1)} style={stepBtn}>+</button>
                        <span>{t('шт', 'дана')}</span>
                      </>
                    ))}
                  </div>
                </motion.div>
              );
            })}
            </AnimatePresence>
          </motion.div>

          {/* Оформление */}
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>{t('Оформление мероприятия', 'Іс-шараны рәсімдеу')}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, background: '#fff', border: '1px solid rgba(212,196,176,0.6)', borderRadius: 16, padding: 16 }}>
            <label style={col}><span style={lbl}>{t('Название', 'Атауы')} *</span>
              <input value={name} onChange={(e) => setName(e.target.value)} style={inp} /></label>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <label style={{ ...col, flex: '1 1 160px' }}><span style={lbl}>{t('Дата', 'Күні')}</span>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inp} /></label>
              <label style={{ ...col, flex: '1 1 120px' }}><span style={lbl}>{t('Бюджет, ₸', 'Бюджет, ₸')}</span>
                <input type="number" inputMode="numeric" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="0" style={inp} /></label>
              <label style={{ ...col, flex: '1 1 120px' }}><span style={lbl}>{t('Гостей', 'Қонақтар')}</span>
                <input type="number" inputMode="numeric" value={guests} onChange={(e) => setGuests(e.target.value)} placeholder="0" style={inp} /></label>
            </div>
            <div style={{ fontSize: 12, color: '#8C7B6D' }}>{t('Для ресторана и гостиницы количество = число гостей.', 'Мейрамхана мен қонақ үй үшін саны = қонақтар саны.')}</div>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 14, borderTop: '1px solid rgba(212,196,176,0.5)', paddingTop: 12 }}>
              <span style={{ color: '#6B5A4D' }}>{t('Услуги', 'Қызметтер')}: <b>{items.length}</b></span>
              <span style={{ color: '#6B5A4D' }}>{t('Сумма', 'Сома')}: <b>{fmtMoney(total)}</b></span>
              {budgetVal > 0 && <span style={{ color: remain < 0 ? '#A33' : '#3A7' }}>{t('Остаток', 'Қалдық')}: <b>{fmtMoney(remain)}</b></span>}
            </div>

            {error && <div style={{ color: '#A33', background: '#FCEBEB', padding: 10, borderRadius: 10, fontSize: 14 }}>{error}</div>}
            {!isAuth && <div style={{ fontSize: 13, color: '#8C7B6D' }}>{t('Войдите, чтобы создать мероприятие.', 'Іс-шара жасау үшін кіріңіз.')}</div>}

            <button onClick={onCreate} disabled={busy}
              style={{ padding: '14px', borderRadius: 999, background: '#4A3F35', color: '#F5F0E9', fontWeight: 700, fontSize: 16, border: 'none', cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.7 : 1 }}>
              {busy ? t('Создание…', 'Жасалуда…') : t('Создать мероприятие', 'Іс-шара жасау')}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

const col = { display: 'flex', flexDirection: 'column', gap: 6 };
const lbl = { fontSize: 13, fontWeight: 600, color: '#6B5A4D' };
const inp = { padding: '12px 14px', borderRadius: 12, border: '1px solid #D4C4B0', fontSize: 16, color: '#4A3F35', background: '#fff', width: '100%', boxSizing: 'border-box' };
const stepBtn = { width: 28, height: 28, borderRadius: 8, border: '1px solid #D4C4B0', background: '#fff', color: '#4A3F35', fontSize: 16, cursor: 'pointer', lineHeight: 1 };
const linkBtn = { border: 'none', background: 'none', color: '#A33', cursor: 'pointer', fontSize: 14, fontWeight: 600, padding: 0 };
