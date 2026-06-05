'use client';

// Детали мероприятия (как экран «Мои мероприятия» в моб. app): услуги по категориям
// с названиями/иконками/ценой за единицу, шкала бюджета, удаление позиции, список подарков.
import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '../../_lib/AppContext';
import {
  getWedding, updateWedding, deleteWedding, deleteWeddingItem,
  updateWeddingTotalCost, updateWeddingRemainingBalance, fetchOne, fetchList,
  getWeddingWishlist, createWish, deleteWish,
} from '../../_lib/apiClient';
import { fmtMoney } from '../../_lib/catalogFields';
import { ITEM_TYPE_META, fmt } from '../../_lib/events';
import { getName } from '../../_lib/catalogFields';
import ServiceModal from '../../_lib/ServiceModal';

const unwrap = (res) => res?.data ?? res ?? null;
const asArray = (res) => (Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : []);

export default function EventDetail() {
  const { ready, isAuth, user, lang, t } = useApp();
  const router = useRouter();
  const { id } = useParams();

  const [ev, setEv] = useState(null);
  const [itemObjs, setItemObjs] = useState({});  // { weddingItemId: полный объект услуги }
  const [detail, setDetail] = useState(null);    // { type, item } — модалка «Подробнее»
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removingId, setRemovingId] = useState(null);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', date: '', budget: '' });
  const [savingEdit, setSavingEdit] = useState(false);

  const [copied, setCopied] = useState(false);
  const [goodsOpen, setGoodsOpen] = useState(false);
  const [goods, setGoods] = useState([]);
  const [goodsLoading, setGoodsLoading] = useState(false);
  const [goodsSearch, setGoodsSearch] = useState('');
  const [togglingGood, setTogglingGood] = useState(null);

  const loadWishlist = useCallback(async () => {
    try { setWishlist(asArray(await getWeddingWishlist(id))); } catch { /* пусто */ }
  }, [id]);

  // Резолв полных объектов услуг по item_id (бэкенд хранит только id+type).
  const resolveNames = useCallback(async (e) => {
    const raw = e?.WeddingItems || e?.weddingItems || e?.items || [];
    const entries = await Promise.all(raw.map(async (it) => {
      const meta = ITEM_TYPE_META[it.item_type || it.type];
      if (!meta) return [it.id, null];
      try { return [it.id, unwrap(await fetchOne(meta.detail(it.item_id)))]; }
      catch { return [it.id, null]; }
    }));
    setItemObjs(Object.fromEntries(entries));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const e = unwrap(await getWedding(id));
      setEv(e);
      setForm({ name: e?.name || '', date: e?.date || '', budget: String(e?.budget ?? '') });
      resolveNames(e);
      await loadWishlist();
    } catch (err) {
      setError(err.message || t('Не удалось загрузить мероприятие', 'Іс-шараны жүктеу мүмкін болмады'));
    } finally {
      setLoading(false);
    }
  }, [id, loadWishlist, resolveNames, t]);

  useEffect(() => { if (ready && isAuth) load(); else if (ready) setLoading(false); }, [ready, isAuth, load]);

  const saveEdit = async () => {
    setSavingEdit(true);
    try {
      await updateWedding(id, { name: form.name.trim(), date: form.date, budget: parseFloat(form.budget) || 0 });
      setEditing(false);
      await load();
    } catch (err) {
      alert(err.message || t('Не удалось сохранить', 'Сақтау мүмкін болмады'));
    } finally {
      setSavingEdit(false);
    }
  };

  const onDelete = async () => {
    if (!confirm(t('Удалить мероприятие?', 'Іс-шараны жою керек пе?'))) return;
    try { await deleteWedding(id); router.push('/app/events'); }
    catch (err) { alert(err.message || t('Не удалось удалить', 'Жою мүмкін болмады')); }
  };

  // Удаление услуги из мероприятия + пересчёт бюджета.
  const removeItem = async (wiId, items, budget) => {
    setRemovingId(wiId);
    try {
      await deleteWeddingItem(wiId);
      const newTotal = items.filter((x) => x.wiId !== wiId).reduce((s, x) => s + x.total, 0);
      try { await updateWeddingTotalCost(id, newTotal); await updateWeddingRemainingBalance(id, (budget || 0) - newTotal); } catch { /* не критично */ }
      await load();
    } catch (err) {
      alert(err.message || t('Не удалось удалить услугу', 'Қызметті жою мүмкін болмады'));
    } finally {
      setRemovingId(null);
    }
  };

  const removeWish = async (wid) => {
    try { await deleteWish(wid); setWishlist((w) => w.filter((x) => x.id !== wid)); }
    catch (err) { alert(err.message || t('Не удалось удалить', 'Жою мүмкін болмады')); }
  };

  // Выбор подарков из каталога товаров (как в моб. Item3Screen).
  const openGoods = async () => {
    setGoodsOpen(true);
    if (goods.length) return;
    setGoodsLoading(true);
    try { setGoods(asArray(await fetchList('/api/goods'))); }
    catch { setGoods([]); }
    finally { setGoodsLoading(false); }
  };

  const toggleGood = async (good) => {
    setTogglingGood(good.id);
    try {
      const existing = wishlist.find((w) => w.good_id === good.id);
      if (existing) await deleteWish(existing.id);
      else await createWish({ event_id: Number(id), good_id: good.id, event_type: 'wedding' });
      await loadWishlist();
    } catch (err) {
      const hostErr = /host/i.test(err.message || '');
      alert(hostErr ? t('Управлять списком может только организатор', 'Тізімді тек ұйымдастырушы басқара алады') : (err.message || t('Не удалось', 'Қате')));
    } finally {
      setTogglingGood(null);
    }
  };

  // Поделиться: готовая серверная страница приглашения (как Share.share в моб. app).
  const shareEvent = async () => {
    const url = `https://api.toilab.kz/api/weddingwishes/${id}`;
    const shareData = { title: t('Приглашение', 'Шақыру') + (ev?.name ? ` · ${ev.name}` : ''), text: t('Список подарков', 'Сыйлықтар тізімі'), url };
    if (navigator.share) {
      try { await navigator.share(shareData); return; } catch { /* отменили — пробуем копировать */ }
    }
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch { prompt(t('Скопируйте ссылку', 'Сілтемені көшіріңіз'), url); }
  };

  if (ready && !isAuth) {
    return <div style={{ textAlign: 'center', padding: '56px 0' }}>
      <p style={{ color: '#6B5A4D', marginBottom: 20 }}>{t('Войдите, чтобы открыть мероприятие.', 'Іс-шараны ашу үшін кіріңіз.')}</p>
      <Link href="/app/login" style={{ color: '#B08D57' }}>{t('Войти', 'Кіру')}</Link>
    </div>;
  }
  if (loading) return <p style={{ color: '#8C7B6D', padding: '24px 0' }}>{t('Загрузка…', 'Жүктелуде…')}</p>;
  if (error) return <div style={{ maxWidth: 640, margin: '8px auto' }}>
    <Link href="/app/events" style={{ color: '#6B5A4D', textDecoration: 'none', fontSize: 14 }}>← {t('Назад', 'Артқа')}</Link>
    <div style={{ color: '#A33', background: '#FCEBEB', padding: 12, borderRadius: 10, marginTop: 12 }}>{error}</div>
  </div>;
  if (!ev) return null;

  const raw = ev.WeddingItems || ev.weddingItems || ev.items || [];
  const items = (Array.isArray(raw) ? raw : []).map((it) => ({
    wiId: it.id,
    itemId: it.item_id,
    type: it.item_type || it.type,
    quantity: Number(it.quantity) || 1,
    total: Number(it.total_cost ?? it.totalCost) || 0,
  }));
  // Группировка по типу услуги (как разделы в моб. app).
  const groups = [];
  for (const it of items) {
    let g = groups.find((x) => x.type === it.type);
    if (!g) { g = { type: it.type, list: [] }; groups.push(g); }
    g.list.push(it);
  }

  const budget = Number(ev.budget) || 0;
  const total = Number(ev.total_cost) || items.reduce((s, x) => s + x.total, 0);
  const remain = ev.remaining_balance != null ? Number(ev.remaining_balance) : (budget - total);
  const pct = budget > 0 ? Math.min(100, Math.round((total / budget) * 100)) : (total > 0 ? 100 : 0);
  const over = remain < 0;
  const isHost = ev.host_id == null || ev.host_id === user?.id; // управление — только организатору

  return (
    <div style={{ maxWidth: 640, margin: '8px auto' }}>
      <Link href="/app/events" style={{ color: '#6B5A4D', textDecoration: 'none', fontSize: 14 }}>← {t('Мои мероприятия', 'Менің іс-шараларым')}</Link>

      {/* Шапка */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, margin: '10px 0 4px' }}>
        <h1 style={{ fontSize: 26, fontWeight: 800 }}>{ev.name || t('Без названия', 'Атаусыз')}</h1>
        <div style={{ display: 'flex', gap: 12, whiteSpace: 'nowrap' }}>
          <button onClick={() => setEditing((v) => !v)} style={linkBtn}>{t('Изменить', 'Өзгерту')}</button>
          <button onClick={onDelete} style={{ ...linkBtn, color: '#A33' }}>{t('Удалить', 'Жою')}</button>
        </div>
      </div>
      <div style={{ color: '#8C7B6D', fontSize: 14, marginBottom: 14 }}>{ev.date || ''}</div>

      {editing && (
        <div style={{ background: '#FAF6F0', border: '1px solid #E5D9C8', borderRadius: 12, padding: 14, marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <label style={col}><span style={lbl}>{t('Название', 'Атауы')}</span>
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} style={inp} /></label>
          <div style={{ display: 'flex', gap: 10 }}>
            <label style={{ ...col, flex: 1 }}><span style={lbl}>{t('Дата', 'Күні')}</span>
              <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} style={inp} /></label>
            <label style={{ ...col, flex: 1 }}><span style={lbl}>{t('Бюджет, ₸', 'Бюджет, ₸')}</span>
              <input type="number" value={form.budget} onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))} style={inp} /></label>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={saveEdit} disabled={savingEdit} style={{ padding: '10px 18px', borderRadius: 999, background: '#4A3F35', color: '#F5F0E9', fontWeight: 700, border: 'none', cursor: 'pointer' }}>{savingEdit ? t('Сохранение…', 'Сақталуда…') : t('Сохранить', 'Сақтау')}</button>
            <button onClick={() => setEditing(false)} style={linkBtn}>{t('Отмена', 'Болдырмау')}</button>
          </div>
        </div>
      )}

      {/* Услуги по категориям */}
      <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>{t('Услуги', 'Қызметтер')}</h2>
      {items.length === 0 ? (
        <p style={{ color: '#8C7B6D', fontSize: 14, marginBottom: 18 }}>{t('Услуги не добавлены.', 'Қызметтер қосылмаған.')}</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
          {groups.map((g) => {
            const meta = ITEM_TYPE_META[g.type] || { ru: g.type, kz: g.type, icon: '•' };
            return (
              <div key={g.type}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', color: '#8C7B6D', textTransform: 'uppercase', marginBottom: 8 }}>
                  {lang === 'kz' ? meta.kz : meta.ru}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {g.list.map((it) => {
                    const unit = it.quantity > 0 ? Math.round(it.total / it.quantity) : it.total;
                    const obj = itemObjs[it.wiId];
                    const nm = obj ? getName(obj, lang === 'kz' ? meta.kz : meta.ru) : (lang === 'kz' ? meta.kz : meta.ru);
                    return (
                      <div key={it.wiId} style={{ background: '#fff', border: '1px solid rgba(212,196,176,0.6)', borderRadius: 12, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 10, background: '#F1EBDD', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{meta.icon}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, color: '#4A3F35', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nm}</div>
                          <div style={{ fontSize: 12, color: '#8C7B6D' }}>{fmt(unit)} ₸ × {it.quantity}</div>
                          {obj && (
                            <button onClick={() => setDetail({ type: it.type, item: obj })}
                              style={{ border: 'none', background: 'none', color: '#B08D57', cursor: 'pointer', fontSize: 12, fontWeight: 600, padding: '2px 0 0' }}>
                              ⓘ {t('Подробнее', 'Толығырақ')}
                            </button>
                          )}
                        </div>
                        <b style={{ color: '#4A3F35', whiteSpace: 'nowrap' }}>{fmt(it.total)} ₸</b>
                        <button onClick={() => removeItem(it.wiId, items, budget)} disabled={removingId === it.wiId}
                          title={t('Удалить', 'Жою')} style={{ border: 'none', background: 'none', color: '#A33', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>
                          {removingId === it.wiId ? '…' : '×'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Бюджет: шкала + проценты */}
      <div style={{ background: '#fff', border: '1px solid rgba(212,196,176,0.6)', borderRadius: 14, padding: 16, marginBottom: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ color: '#6B5A4D', fontSize: 14 }}>{t('Бюджет', 'Бюджет')}:</span>
          <b style={{ fontSize: 16 }}>{fmt(budget)} ₸</b>
        </div>
        <div style={{ height: 10, borderRadius: 999, background: '#EFE7DA', overflow: 'hidden', marginBottom: 8 }}>
          <div style={{ width: `${pct}%`, height: '100%', background: over ? '#D9534F' : '#3A7', transition: 'width .3s' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
          <span style={{ color: '#6B5A4D' }}>{t('Потрачено', 'Жұмсалды')}: <b>{fmt(total)} ₸ ({pct}%)</b></span>
          <span style={{ color: over ? '#A33' : '#3A7' }}>{t('Остаток', 'Қалдық')}: <b>{fmt(remain)} ₸</b></span>
        </div>
      </div>

      {/* Подарки */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        {isHost ? (
          <button onClick={openGoods} style={{ padding: '10px 16px', borderRadius: 999, border: '1px solid #B08D57', background: '#fff', color: '#B08D57', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            🎁 {t('Выбрать подарки из каталога', 'Каталогтан сыйлық таңдау')}
          </button>
        ) : <span />}
        <button onClick={shareEvent} style={linkBtn}>{copied ? t('Скопировано ✓', 'Көшірілді ✓') : `🔗 ${t('Поделиться', 'Бөлісу')}`}</button>
      </div>

      {!isHost && (
        <p style={{ fontSize: 13, color: '#8C7B6D', marginBottom: 12 }}>{t('Список подарков ведёт организатор мероприятия.', 'Сыйлықтар тізімін іс-шара ұйымдастырушысы жүргізеді.')}</p>
      )}

      {wishlist.length === 0 ? (
        <p style={{ color: '#8C7B6D', fontSize: 14 }}>{t('Подарков пока нет. Добавьте и поделитесь ссылкой с гостями.', 'Сыйлықтар жоқ. Қосып, қонақтарға сілтеме жіберіңіз.')}</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {wishlist.map((w) => {
            const gname = w.item_name || w.Good?.item_name || w.good?.item_name || w.name || t('Подарок', 'Сыйлық');
            const reserved = w.is_reserved || w.status === 'reserved' || w.reserved_by_unknown || w.reserved_by_user_id;
            const who = w.Reserver?.username || w.reserved_by_unknown;
            return (
              <div key={w.id} style={{ background: '#fff', border: '1px solid rgba(212,196,176,0.6)', borderRadius: 10, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, color: '#4A3F35', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis' }}>{gname}</div>
                  <div style={{ fontSize: 12, color: reserved ? '#B08D57' : '#3A7' }}>
                    {reserved ? `${t('Забронировано', 'Брондалған')}${who ? ` · ${who}` : ''}` : t('Свободно', 'Бос')}
                  </div>
                </div>
                {Number(w.cost) > 0 && <span style={{ fontSize: 13, color: '#8C7B6D', whiteSpace: 'nowrap' }}>{fmtMoney(w.cost)}</span>}
                {isHost && <button onClick={() => removeWish(w.id)} style={{ border: 'none', background: 'none', color: '#A33', cursor: 'pointer', fontSize: 16 }}>×</button>}
              </div>
            );
          })}
        </div>
      )}

      {detail && (
        <ServiceModal
          item={detail.item}
          typeMeta={ITEM_TYPE_META[detail.type] || {}}
          fileSegment={(ITEM_TYPE_META[detail.type] || {}).seg}
          lang={lang}
          t={t}
          onClose={() => setDetail(null)}
        />
      )}

      {/* Модалка выбора подарков из каталога товаров */}
      {goodsOpen && (() => {
        const wishGoodIds = new Set(wishlist.map((w) => w.good_id));
        const q = goodsSearch.trim().toLowerCase();
        const list = goods.filter((g) => !q || `${g.item_name || ''} ${g.category || ''}`.toLowerCase().includes(q));
        return (
          <div onClick={() => setGoodsOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(40,33,28,0.55)', zIndex: 90, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 16, overflowY: 'auto' }}>
            <div onClick={(e) => e.stopPropagation()}
              style={{ background: '#fff', borderRadius: 18, maxWidth: 540, width: '100%', margin: 'auto', display: 'flex', flexDirection: 'column', maxHeight: '88vh', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '16px 18px 10px' }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#4A3F35' }}>🎁 {t('Подарки из каталога', 'Каталог сыйлықтары')}</h3>
                <button onClick={() => setGoodsOpen(false)} style={{ border: 'none', background: 'none', color: '#8C7B6D', cursor: 'pointer', fontSize: 24, lineHeight: 1 }}>×</button>
              </div>
              <div style={{ padding: '0 18px 10px' }}>
                <input value={goodsSearch} onChange={(e) => setGoodsSearch(e.target.value)} placeholder={t('Поиск подарка…', 'Сыйлық іздеу…')} style={inp} />
              </div>
              <div style={{ overflowY: 'auto', padding: '0 18px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {goodsLoading && <div style={{ color: '#8C7B6D', fontSize: 14 }}>{t('Загрузка…', 'Жүктелуде…')}</div>}
                {!goodsLoading && list.length === 0 && <div style={{ color: '#8C7B6D', fontSize: 14 }}>{t('Ничего не найдено', 'Ештеңе табылмады')}</div>}
                {list.map((g) => {
                  const inList = wishGoodIds.has(g.id);
                  return (
                    <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 10, border: inList ? '1px solid #B08D57' : '1px solid #E5D9C8', borderRadius: 10, padding: '10px 12px' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: '#4A3F35', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.item_name || `#${g.id}`}</div>
                        <div style={{ fontSize: 12, color: '#8C7B6D' }}>{Number(g.cost) > 0 ? fmtMoney(g.cost) : t('Цена не указана', 'Бағасы көрсетілмеген')}</div>
                        <button onClick={() => setDetail({ type: 'good', item: g })}
                          style={{ border: 'none', background: 'none', color: '#B08D57', cursor: 'pointer', fontSize: 12, fontWeight: 600, padding: '2px 0 0' }}>
                          ⓘ {t('Подробнее', 'Толығырақ')}
                        </button>
                      </div>
                      <button onClick={() => toggleGood(g)} disabled={togglingGood === g.id}
                        style={{ padding: '7px 14px', borderRadius: 999, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
                          background: inList ? '#FCEBEB' : '#4A3F35', color: inList ? '#A33' : '#F5F0E9' }}>
                        {togglingGood === g.id ? '…' : (inList ? t('В списке ✓', 'Тізімде ✓') : t('Добавить', 'Қосу'))}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

const col = { display: 'flex', flexDirection: 'column', gap: 6 };
const lbl = { fontSize: 13, fontWeight: 600, color: '#6B5A4D' };
const inp = { padding: '12px 14px', borderRadius: 12, border: '1px solid #D4C4B0', fontSize: 16, color: '#4A3F35', background: '#fff', width: '100%', boxSizing: 'border-box' };
const linkBtn = { border: 'none', background: 'none', color: '#B08D57', cursor: 'pointer', fontSize: 14, fontWeight: 600, padding: 0 };
