'use client';

// Создание мероприятия. Поток: параметры (тип/название/дата/бюджет/гости) →
// лоадер → автоподбор и калькуляция → результат (можно править вручную) → POST addwedding.
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '../../_lib/AppContext';
import { fetchList, createWedding, getFiles } from '../../_lib/apiClient';
import {
  EVENT_TYPES, EVENT_TYPE_BY_KEY, EVENT_CATEGORIES,
  catalogItemName, catalogItemCost, buildItemsAndTotals, buildWeddingPayload,
  recommendSelection, fmt,
} from '../../_lib/events';
import { getSpecs, FILE_SEGMENT, fileUrl } from '../../_lib/catalogFields';

// Сегмент файлов для категории мероприятия (у транспорта — авто).
const fileSegmentFor = (catKey) => (catKey === 'transport' ? 'transport-vehicle' : FILE_SEGMENT[catKey]);

const asArray = (res) => (Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : []);
const todayISO = () => new Date().toISOString().split('T')[0];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default function NewEvent() {
  const { ready, isAuth, user, city, lang, t } = useApp();
  const router = useRouter();
  const L = (o) => (lang === 'kz' ? o.kz : o.ru);

  const [typeKey, setTypeKey] = useState('wedding');
  const [name, setName] = useState('');
  const [date, setDate] = useState(todayISO());
  const [budget, setBudget] = useState('');
  const [guests, setGuests] = useState('');
  const [openCat, setOpenCat] = useState(null);
  const [cache, setCache] = useState({});       // { catKey: items[] }
  const [loadingCat, setLoadingCat] = useState(null);
  const [selected, setSelected] = useState([]);  // [{ catKey, item, quantity }]
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [autoNote, setAutoNote] = useState('');   // '' | 'ok' | 'over'
  const [manual, setManual] = useState(false);    // правили выбор вручную
  const [phase, setPhase] = useState('idle');     // 'idle' | 'loading' | 'results'
  const [detail, setDetail] = useState(null);     // { catKey, item } — модалка «Подробнее»
  const [detailMedia, setDetailMedia] = useState([]);
  const [detailLoadingMedia, setDetailLoadingMedia] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(null); // индекс увеличенного фото/видео

  // Загрузка фото/видео при открытии модалки.
  useEffect(() => {
    if (!detail) { setDetailMedia([]); setLightboxIdx(null); return; }
    const seg = fileSegmentFor(detail.catKey);
    if (!seg) { setDetailMedia([]); return; }
    let active = true;
    setDetailLoadingMedia(true);
    getFiles(seg, detail.item.id)
      .then((files) => {
        const arr = Array.isArray(files) ? files : (files?.data || []);
        if (active) setDetailMedia(arr.map((f) => ({ url: fileUrl(f.path || f.url), video: f.mimetype && f.mimetype.startsWith('video') })).filter((m) => m.url));
      })
      .catch(() => { if (active) setDetailMedia([]); })
      .finally(() => { if (active) setDetailLoadingMedia(false); });
    return () => { active = false; };
  }, [detail]);

  const evType = EVENT_TYPE_BY_KEY[typeKey];
  const cacheRef = useRef({});
  useEffect(() => { cacheRef.current = cache; }, [cache]);
  const { totalCost } = useMemo(() => buildItemsAndTotals(selected, guests), [selected, guests]);
  const budgetVal = parseFloat(budget) || 0;
  const remain = budgetVal - totalCost;
  const paramsValid = budgetVal > 0 && parseInt(guests, 10) > 0;

  const keyOf = (catKey, item) => `${catKey}-${item.id}`;
  const isSelected = (catKey, item) => selected.some((s) => keyOf(s.catKey, s.item) === keyOf(catKey, item));

  const openCategory = useCallback(async (catKey) => {
    if (openCat === catKey) { setOpenCat(null); return; }
    setOpenCat(catKey);
    if (cache[catKey]) return;
    setLoadingCat(catKey);
    try {
      const res = await fetchList(EVENT_CATEGORIES[catKey].list);
      setCache((c) => ({ ...c, [catKey]: asArray(res) }));
    } catch {
      setCache((c) => ({ ...c, [catKey]: [] }));
    } finally {
      setLoadingCat(null);
    }
  }, [openCat, cache]);

  const toggle = (catKey, item) => {
    setManual(true);
    setSelected((sel) => {
      const k = keyOf(catKey, item);
      if (sel.some((s) => keyOf(s.catKey, s.item) === k)) return sel.filter((s) => keyOf(s.catKey, s.item) !== k);
      return [...sel, { catKey, item, quantity: 1 }];
    });
  };
  const setQty = (catKey, item, q) => {
    setManual(true);
    const k = keyOf(catKey, item);
    setSelected((sel) => sel.map((s) => (keyOf(s.catKey, s.item) === k ? { ...s, quantity: Math.max(1, q) } : s)));
  };

  const changeType = (key) => {
    setTypeKey(key);
    setOpenCat(null);
    setManual(false); // новый тип — пересоберём автоматически
    const allowed = new Set(EVENT_TYPE_BY_KEY[key].categories);
    setSelected((sel) => sel.filter((s) => allowed.has(s.catKey)));
  };

  // Автоподбор: по одной услуге в каждой категории под доли бюджета.
  const runAutoPick = useCallback(async () => {
    const cats = EVENT_TYPE_BY_KEY[typeKey].categories;
    const map = { ...cacheRef.current };
    await Promise.all(cats.map(async (c) => {
      if (map[c]) return;
      try { map[c] = asArray(await fetchList(EVENT_CATEGORIES[c].list)); } catch { map[c] = []; }
    }));
    setCache(map);
    const sel = recommendSelection({ categories: cats, budget, guestCount: guests, catalogByCat: map });
    setSelected(sel);
    const { totalCost: tc } = buildItemsAndTotals(sel, guests);
    setAutoNote((parseFloat(budget) || 0) >= tc ? 'ok' : 'over');
  }, [budget, guests, typeKey]);

  // Автозапуск: ввели бюджет и гостей → лоадер → подбор → результат (если не правили вручную).
  useEffect(() => {
    if (manual) return;
    if (!paramsValid) { setAutoNote(''); setPhase('idle'); return; }
    const id = setTimeout(async () => {
      setPhase('loading');
      // минимальное время показа лоадера, чтобы не мигал
      await Promise.all([runAutoPick(), sleep(800)]);
      setPhase('results');
    }, 450);
    return () => clearTimeout(id);
  }, [budget, guests, typeKey, manual, paramsValid, runAutoPick]);

  const reAutoPick = () => { setManual(false); setPhase('loading'); }; // эффект подхватит и пересоберёт
  const clearSelection = () => { setManual(true); setSelected([]); setAutoNote(''); };
  const pickManually = () => { setManual(true); setPhase('results'); };

  const onSubmit = async (e) => {
    e?.preventDefault?.();
    if (!name.trim()) { setError(t('Укажите название мероприятия', 'Іс-шара атауын көрсетіңіз')); return; }
    if (selected.length === 0) { setError(t('Выберите хотя бы одну услугу', 'Кемінде бір қызмет таңдаңыз')); return; }
    setBusy(true);
    setError('');
    try {
      const payload = buildWeddingPayload({ name, date, hostId: user?.id, budget, selected, guestCount: guests });
      await createWedding(payload);
      router.push('/app/events');
    } catch (err) {
      setError(err.message || t('Не удалось создать', 'Жасау мүмкін болмады'));
    } finally {
      setBusy(false);
    }
  };

  if (ready && !isAuth) {
    return (
      <div style={{ textAlign: 'center', padding: '56px 0' }}>
        <p style={{ color: '#6B5A4D', marginBottom: 20 }}>{t('Войдите, чтобы создать мероприятие.', 'Іс-шара жасау үшін кіріңіз.')}</p>
        <Link href="/app/login" style={{ color: '#B08D57' }}>{t('Войти', 'Кіру')}</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640, margin: '8px auto', paddingBottom: phase === 'results' ? 90 : 24 }}>
      <style>{`@keyframes tlspin{to{transform:rotate(360deg)}}`}</style>
      <Link href="/app/events" style={{ color: '#6B5A4D', textDecoration: 'none', fontSize: 14 }}>← {t('Мои мероприятия', 'Менің іс-шараларым')}</Link>
      <h1 style={{ fontSize: 26, fontWeight: 800, margin: '10px 0 14px' }}>{t('Новое мероприятие', 'Жаңа іс-шара')}</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* ── Параметры ── */}
        <div>
          <div style={lbl}>{t('Тип мероприятия', 'Іс-шара түрі')}</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
            {EVENT_TYPES.map((et) => {
              const on = et.key === typeKey;
              return (
                <button type="button" key={et.key} onClick={() => changeType(et.key)}
                  style={{ padding: '10px 16px', borderRadius: 999, fontSize: 14, cursor: 'pointer', fontWeight: 600,
                    border: on ? '1px solid #B08D57' : '1px solid #D4C4B0', background: on ? '#B08D57' : '#fff', color: on ? '#fff' : '#6B5A4D' }}>
                  {et.icon} {L(et)}
                </button>
              );
            })}
          </div>
        </div>

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
        <div style={{ fontSize: 13, color: '#8C7B6D' }}>{t('Город', 'Қала')}: <b>{city || '—'}</b>. {t('Для ресторана и гостиницы количество = число гостей.', 'Мейрамхана мен қонақ үй үшін саны = қонақтар саны.')}</div>

        {/* ── Этап «idle»: подсказка ── */}
        {phase === 'idle' && (
          <div style={{ background: '#FAF6F0', border: '1px dashed #D4C4B0', borderRadius: 14, padding: '24px 18px', textAlign: 'center' }}>
            <div style={{ fontSize: 34, marginBottom: 8 }}>🧮</div>
            <div style={{ fontWeight: 700, color: '#4A3F35', marginBottom: 4 }}>{t('Укажите бюджет и количество гостей', 'Бюджет пен қонақтар санын көрсетіңіз')}</div>
            <div style={{ color: '#8C7B6D', fontSize: 14, marginBottom: 14 }}>{t('Мы автоматически подберём услуги под ваш бюджет.', 'Біз бюджетке қарай қызметтерді автоматты таңдаймыз.')}</div>
            <button type="button" onClick={pickManually} style={linkBtn}>{t('Или выбрать услуги вручную', 'Немесе қызметтерді қолмен таңдау')}</button>
          </div>
        )}

        {/* ── Этап «loading»: лоадер ── */}
        {phase === 'loading' && (
          <div style={{ background: '#fff', border: '1px solid rgba(212,196,176,0.6)', borderRadius: 14, padding: '36px 18px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', border: '4px solid #EADFCD', borderTopColor: '#B08D57', animation: 'tlspin 0.8s linear infinite' }} />
            <div style={{ fontWeight: 700, color: '#4A3F35' }}>{t('Подбираем услуги под ваш бюджет…', 'Бюджетке қарай қызметтерді таңдаудамыз…')}</div>
            <div style={{ color: '#8C7B6D', fontSize: 13 }}>{t('Считаем стоимость и остаток', 'Құнын және қалдықты есептеудеміз')}</div>
          </div>
        )}

        {/* ── Этап «results»: подбор + калькуляция + ручная правка ── */}
        {phase === 'results' && (
          <>
            {autoNote === 'ok' && selected.length > 0 && (
              <div style={{ fontSize: 14, color: '#3A7' }}>✓ {t('Подобрано в рамках бюджета — можно изменить.', 'Бюджет аясында таңдалды — өзгертуге болады.')}</div>
            )}
            {autoNote === 'over' && (
              <div style={{ fontSize: 14, color: '#A33' }}>{t('Бюджета не хватает на все категории — подобран доступный набор.', 'Бюджет барлық санатқа жетпейді — қолжетімді жинақ таңдалды.')}</div>
            )}

            {/* Сводка подобранного */}
            {selected.length > 0 && (
              <div style={{ background: '#FAF6F0', border: '1px solid #E5D9C8', borderRadius: 12, padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontWeight: 700, color: '#4A3F35', fontSize: 14 }}>{t('Выбранные услуги', 'Таңдалған қызметтер')}</span>
                  <div style={{ display: 'flex', gap: 14 }}>
                    <button type="button" onClick={reAutoPick} style={linkBtn}>{t('Подобрать заново', 'Қайта таңдау')}</button>
                    <button type="button" onClick={clearSelection} style={{ ...linkBtn, color: '#A33' }}>{t('Очистить', 'Тазалау')}</button>
                  </div>
                </div>
                {selected.map((s) => {
                  const cfg = EVENT_CATEGORIES[s.catKey];
                  const unit = catalogItemCost(s.item, cfg.costField);
                  const isGuestQty = s.catKey === 'restaurants' || s.catKey === 'hotels';
                  const qty = isGuestQty ? (parseInt(guests, 10) || 1) : s.quantity;
                  return (
                    <div key={keyOf(s.catKey, s.item)} style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 0', borderTop: '1px solid rgba(212,196,176,0.4)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                        <span style={{ color: '#4A3F35', fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {cfg.icon} {catalogItemName(s.item)}
                        </span>
                        <span style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 8 }}>
                          <b style={{ color: '#4A3F35', fontSize: 13 }}>{fmt(unit * qty)} ₸</b>
                          <button type="button" onClick={() => toggle(s.catKey, s.item)} title={t('Удалить', 'Жою')}
                            style={{ border: 'none', background: 'none', color: '#A33', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>×</button>
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#8C7B6D' }}>
                        <span>{fmt(unit)} ₸ ×</span>
                        {isGuestQty ? (
                          <span><b>{qty}</b> {t('гостей', 'қонақ')}</span>
                        ) : (
                          <>
                            <button type="button" onClick={() => setQty(s.catKey, s.item, qty - 1)} style={stepBtn}>−</button>
                            <input type="number" inputMode="numeric" min={1} value={s.quantity}
                              onChange={(e) => setQty(s.catKey, s.item, parseInt(e.target.value, 10) || 1)}
                              style={{ width: 56, padding: '6px 8px', borderRadius: 8, border: '1px solid #D4C4B0', fontSize: 14, color: '#4A3F35', textAlign: 'center' }} />
                            <button type="button" onClick={() => setQty(s.catKey, s.item, qty + 1)} style={stepBtn}>+</button>
                            <span>{t('шт', 'дана')}</span>
                          </>
                        )}
                        <button type="button" onClick={() => setDetail({ catKey: s.catKey, item: s.item })}
                          style={{ marginLeft: 'auto', border: 'none', background: 'none', color: '#B08D57', cursor: 'pointer', fontSize: 12, fontWeight: 600, padding: 0, whiteSpace: 'nowrap' }}>
                          ⓘ {t('Подробнее', 'Толығырақ')}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Категории — ручная правка */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={lbl}>{t('Категории услуг — изменить вручную', 'Қызмет санаттары — қолмен өзгерту')}</div>
                {selected.length === 0 && <button type="button" onClick={reAutoPick} style={linkBtn}>{t('Подобрать автоматически', 'Автоматты таңдау')}</button>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {evType.categories.map((catKey) => {
                  const cfg = EVENT_CATEGORIES[catKey];
                  const count = selected.filter((s) => s.catKey === catKey).length;
                  const items = cache[catKey] || [];
                  const open = openCat === catKey;
                  return (
                    <div key={catKey} style={{ border: '1px solid rgba(212,196,176,0.6)', borderRadius: 12, overflow: 'hidden' }}>
                      <button type="button" onClick={() => openCategory(catKey)}
                        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: '#fff', border: 'none', cursor: 'pointer', fontSize: 15, color: '#4A3F35' }}>
                        <span style={{ fontWeight: 700 }}>{cfg.icon} {lang === 'kz' ? cfg.kz : cfg.ru}</span>
                        <span style={{ fontSize: 13, color: count ? '#B08D57' : '#8C7B6D' }}>
                          {count ? `${t('выбрано', 'таңдалды')}: ${count}` : ''} {open ? '▲' : '▼'}
                        </span>
                      </button>
                      {open && (
                        <div style={{ borderTop: '1px solid rgba(212,196,176,0.6)', background: '#FAF6F0', padding: 10, display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 320, overflowY: 'auto' }}>
                          {loadingCat === catKey && <div style={{ color: '#8C7B6D', fontSize: 14 }}>{t('Загрузка…', 'Жүктелуде…')}</div>}
                          {loadingCat !== catKey && items.length === 0 && <div style={{ color: '#8C7B6D', fontSize: 14 }}>{t('Нет услуг в этом городе', 'Бұл қалада қызмет жоқ')}</div>}
                          {items.map((item) => {
                            const sel = isSelected(catKey, item);
                            const cost = catalogItemCost(item, cfg.costField);
                            const selEntry = selected.find((s) => keyOf(s.catKey, s.item) === keyOf(catKey, item));
                            const isGuestQty = catKey === 'restaurants' || catKey === 'hotels';
                            return (
                              <div key={item.id} style={{ background: '#fff', border: sel ? '1px solid #B08D57' : '1px solid #E5D9C8', borderRadius: 10, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontWeight: 600, fontSize: 14, color: '#4A3F35', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{catalogItemName(item)}</div>
                                  <div style={{ fontSize: 12, color: '#8C7B6D' }}>{cost ? `${fmt(cost)} ₸` : t('Цена не указана', 'Бағасы көрсетілмеген')}{item.district ? ` · ${item.district}` : ''}</div>
                                  <button type="button" onClick={() => setDetail({ catKey, item })}
                                    style={{ border: 'none', background: 'none', color: '#B08D57', cursor: 'pointer', fontSize: 12, fontWeight: 600, padding: '2px 0 0' }}>
                                    ⓘ {t('Подробнее', 'Толығырақ')}
                                  </button>
                                </div>
                                {sel && !isGuestQty && (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <button type="button" onClick={() => setQty(catKey, item, (selEntry?.quantity || 1) - 1)} style={stepBtn}>−</button>
                                    <span style={{ minWidth: 20, textAlign: 'center', fontSize: 14 }}>{selEntry?.quantity || 1}</span>
                                    <button type="button" onClick={() => setQty(catKey, item, (selEntry?.quantity || 1) + 1)} style={stepBtn}>+</button>
                                  </div>
                                )}
                                <button type="button" onClick={() => toggle(catKey, item)}
                                  style={{ padding: '7px 12px', borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none',
                                    background: sel ? '#FCEBEB' : '#4A3F35', color: sel ? '#A33' : '#F5F0E9', whiteSpace: 'nowrap' }}>
                                  {sel ? t('Убрать', 'Алып тастау') : t('Добавить', 'Қосу')}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {error && <div style={{ color: '#A33', background: '#FCEBEB', padding: 10, borderRadius: 10, fontSize: 14 }}>{error}</div>}
      </div>

      {/* Итоги + submit (только на этапе результата) */}
      {phase === 'results' && (
        <div style={{ position: 'sticky', bottom: 0, marginTop: 16, background: '#fff', borderTop: '1px solid rgba(212,196,176,0.7)', padding: '12px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', gap: 16, fontSize: 14, flexWrap: 'wrap' }}>
            <span style={{ color: '#6B5A4D' }}>{t('Выбрано', 'Таңдалды')}: <b>{selected.length}</b></span>
            <span style={{ color: '#6B5A4D' }}>{t('Сумма', 'Сома')}: <b>{fmt(totalCost)} ₸</b></span>
            <span style={{ color: remain < 0 ? '#A33' : '#3A7' }}>{t('Остаток', 'Қалдық')}: <b>{fmt(remain)} ₸</b></span>
          </div>
          <button type="button" onClick={onSubmit} disabled={busy}
            style={{ padding: '14px', borderRadius: 999, background: '#4A3F35', color: '#F5F0E9', fontWeight: 700, fontSize: 16, border: 'none', cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.7 : 1 }}>
            {busy ? t('Создание…', 'Жасалуда…') : t('Создать мероприятие', 'Іс-шара жасау')}
          </button>
        </div>
      )}

      {/* Модалка «Подробнее» */}
      {detail && (() => {
        const cfg = EVENT_CATEGORIES[detail.catKey];
        const item = detail.item;
        const sel = isSelected(detail.catKey, item);
        const cost = catalogItemCost(item, cfg.costField);
        const desc = item.description || item.about || '';
        const specs = getSpecs(item, lang);
        return (
          <div onClick={() => setDetail(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(40,33,28,0.55)', zIndex: 100, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 16, overflowY: 'auto' }}>
            <div onClick={(e) => e.stopPropagation()}
              style={{ background: '#fff', borderRadius: 18, maxWidth: 520, width: '100%', margin: 'auto', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, padding: '16px 18px 0' }}>
                <div>
                  <div style={{ fontSize: 12, color: '#8C7B6D', fontWeight: 600 }}>{cfg.icon} {lang === 'kz' ? cfg.kz : cfg.ru}</div>
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: '#4A3F35', margin: '2px 0 0' }}>{catalogItemName(item)}</h3>
                </div>
                <button type="button" onClick={() => setDetail(null)} style={{ border: 'none', background: 'none', color: '#8C7B6D', cursor: 'pointer', fontSize: 24, lineHeight: 1 }}>×</button>
              </div>

              <div style={{ padding: '12px 18px 18px' }}>
                {cost > 0 && <div style={{ color: '#B08D57', fontWeight: 800, fontSize: 18, marginBottom: 12 }}>{fmt(cost)} ₸</div>}

                {/* Медиа */}
                {detailLoadingMedia && <div style={{ color: '#8C7B6D', fontSize: 14, marginBottom: 12 }}>{t('Загрузка фото…', 'Фото жүктелуде…')}</div>}
                {!detailLoadingMedia && detailMedia.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: detailMedia.length === 1 ? '1fr' : 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10, marginBottom: 14 }}>
                    {detailMedia.map((m, i) => (
                      <div key={i} onClick={() => setLightboxIdx(i)} style={{ position: 'relative', cursor: 'zoom-in', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(212,196,176,0.5)' }}>
                        {m.video
                          ? <><video src={m.url} style={{ width: '100%', aspectRatio: '4 / 3', objectFit: 'cover', display: 'block', pointerEvents: 'none' }} />
                              <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>▶</span></>
                          : <img src={m.url} alt={`${catalogItemName(item)} ${i + 1}`} loading="lazy" style={{ width: '100%', aspectRatio: '4 / 3', objectFit: 'cover', display: 'block' }} />}
                      </div>
                    ))}
                  </div>
                )}
                {!detailLoadingMedia && detailMedia.length === 0 && (
                  <div style={{ background: '#F5F0E9', borderRadius: 12, padding: '20px', textAlign: 'center', color: '#A99', fontSize: 36, marginBottom: 14 }}>{cfg.icon}</div>
                )}

                {desc && <p style={{ color: '#6B5A4D', lineHeight: 1.6, fontSize: 14, marginBottom: 14, whiteSpace: 'pre-line' }}>{desc}</p>}

                {specs.length > 0 && (
                  <div style={{ border: '1px solid rgba(212,196,176,0.5)', borderRadius: 12, overflow: 'hidden', marginBottom: 14 }}>
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

                <button type="button" onClick={() => { toggle(detail.catKey, item); setDetail(null); }}
                  style={{ width: '100%', padding: '13px', borderRadius: 999, fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer',
                    background: sel ? '#FCEBEB' : '#4A3F35', color: sel ? '#A33' : '#F5F0E9' }}>
                  {sel ? t('Убрать из подбора', 'Таңдаудан алу') : t('Добавить в подбор', 'Таңдауға қосу')}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Лайтбокс: увеличенное фото/видео */}
      {lightboxIdx != null && detailMedia[lightboxIdx] && (
        <div onClick={() => setLightboxIdx(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button type="button" onClick={() => setLightboxIdx(null)}
            style={{ position: 'absolute', top: 16, right: 20, border: 'none', background: 'none', color: '#fff', fontSize: 34, lineHeight: 1, cursor: 'pointer', zIndex: 2 }}>×</button>

          {detailMedia.length > 1 && (
            <>
              <button type="button" onClick={(e) => { e.stopPropagation(); setLightboxIdx((i) => (i - 1 + detailMedia.length) % detailMedia.length); }}
                style={lightboxNav('left')}>‹</button>
              <button type="button" onClick={(e) => { e.stopPropagation(); setLightboxIdx((i) => (i + 1) % detailMedia.length); }}
                style={lightboxNav('right')}>›</button>
            </>
          )}

          <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: '92vw', maxHeight: '88vh', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            {detailMedia[lightboxIdx].video
              ? <video src={detailMedia[lightboxIdx].url} controls autoPlay style={{ maxWidth: '92vw', maxHeight: '82vh', borderRadius: 8 }} />
              : <img src={detailMedia[lightboxIdx].url} alt="" style={{ maxWidth: '92vw', maxHeight: '82vh', objectFit: 'contain', borderRadius: 8 }} />}
            {detailMedia.length > 1 && <div style={{ color: '#fff', fontSize: 13, opacity: 0.8 }}>{lightboxIdx + 1} / {detailMedia.length}</div>}
          </div>
        </div>
      )}
    </div>
  );
}

const lightboxNav = (side) => ({
  position: 'absolute', [side]: 8, top: '50%', transform: 'translateY(-50%)',
  width: 48, height: 48, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.15)',
  color: '#fff', fontSize: 30, lineHeight: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2,
});

const col = { display: 'flex', flexDirection: 'column', gap: 6 };
const lbl = { fontSize: 13, fontWeight: 600, color: '#6B5A4D' };
const inp = { padding: '12px 14px', borderRadius: 12, border: '1px solid #D4C4B0', fontSize: 16, color: '#4A3F35', background: '#fff', width: '100%', boxSizing: 'border-box' };
const stepBtn = { width: 28, height: 28, borderRadius: 8, border: '1px solid #D4C4B0', background: '#fff', color: '#4A3F35', fontSize: 16, cursor: 'pointer', lineHeight: 1 };
const linkBtn = { border: 'none', background: 'none', color: '#B08D57', cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: 0 };
