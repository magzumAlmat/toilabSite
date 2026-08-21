'use client';

// Детали мероприятия (как экран «Мои мероприятия» в моб. app): услуги по категориям
// с названиями/иконками/ценой за единицу, шкала бюджета, удаление позиции, список подарков.
import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '../../_lib/AppContext';
import {
  getWedding, updateWedding, deleteWedding, deleteWeddingItem,
  updateWeddingTotalCost, updateWeddingRemainingBalance, fetchOne, fetchList,
  getWeddingWishlist, createWish, deleteWish, createGood, getEntityId,
  getEventCategory, updateEventCategory, deleteEventCategory, removeServiceFromCategory,
  updateEventCategoryTotalCost, updateEventCategoryRemainingBalance, getEventCategoryWishlist,
  addServiceToCategory, unblockRestaurantDate, getEventGuests,
} from '../../_lib/apiClient';
import { fmtMoney } from '../../_lib/catalogFields';
import { ITEM_TYPE_META, ITEM_TYPE_BY_SERVICE_TYPE, catalogItemCost, fmt } from '../../_lib/events';
import { getName } from '../../_lib/catalogFields';
import { checkBookingConflicts, createBookingsForWedding, cancelBookingsForRows } from '../../_lib/booking';
import ServiceModal from '../../_lib/ServiceModal';
import AddServiceModal from '../../_lib/AddServiceModal';

const unwrap = (res) => res?.data ?? res ?? null;
const asArray = (res) => (Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : []);

// Единый вид строки услуги для обоих источников:
//   weddings       → WeddingItems[]: { id, item_id, item_type, quantity, total_cost }
//   event-category → EventServices[]: { serviceId, serviceType, quantity, room_ids }
// У категорий бэкенд НЕ отдаёт стоимость услуги и id строки, поэтому wiId
// собираем из типа+id, а сумму считаем по цене из каталога × количество.
function rowsOf(e, isCat) {
  if (isCat) {
    const raw = e?.EventServices || e?.services || [];
    return (Array.isArray(raw) ? raw : []).map((s) => ({
      wiId: `${s.serviceType}-${s.serviceId}`,
      itemId: s.serviceId,
      type: ITEM_TYPE_BY_SERVICE_TYPE[s.serviceType] || s.serviceType,
      serviceType: s.serviceType,
      quantity: Number(s.quantity) || 1,
      total: Number(s.cost ?? s.total_cost ?? NaN), // NaN → посчитаем из каталога
      room_ids: Array.isArray(s.room_ids) ? s.room_ids : [],
    }));
  }
  const raw = e?.WeddingItems || e?.weddingItems || e?.items || [];
  return (Array.isArray(raw) ? raw : []).map((it) => ({
    wiId: it.id,
    itemId: it.item_id,
    type: it.item_type || it.type,
    quantity: Number(it.quantity) || 1,
    total: Number(it.total_cost ?? it.totalCost) || 0,
    room_ids: Array.isArray(it.room_ids) ? it.room_ids : [],
  }));
}

export default function EventDetail() {
  const { ready, isAuth, user, city, lang, t } = useApp();
  const router = useRouter();
  const { id } = useParams();
  // ?src=ec — мероприятие лежит в event-category, а не в weddings (id у них
  // независимые, поэтому источник передаётся явно из списка мероприятий).
  const isCat = useSearchParams().get('src') === 'ec';

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
  // Свой подарок, которого нет в каталоге («всё не предусмотришь»):
  // создаём good → добавляем его в wishlist. Поля — точь-в-точь как в
  // мобильном Item3Screen (обязательно только название).
  const emptyCustom = { item_name: '', link: '', description: '', cost: '', storeName: '', address: '', phone: '' };
  const [customOpen, setCustomOpen] = useState(false);
  const [customForm, setCustomForm] = useState(emptyCustom);
  const [addingCustom, setAddingCustom] = useState(false);
  const setCF = (key, v) => setCustomForm((f) => ({ ...f, [key]: v }));

  const loadWishlist = useCallback(async () => {
    try {
      setWishlist(asArray(await (isCat ? getEventCategoryWishlist(id) : getWeddingWishlist(id))));
    } catch { /* пусто */ }
  }, [id, isCat]);

  // RSVP-гости («Я буду» на странице-приглашении), как в моб. Item3Screen:2043.
  // eventType строго 'eventcategory' строчными — 'eventCategory' отдаёт пустой список.
  const [guests, setGuests] = useState({ list: [], total: 0 });
  const loadGuests = useCallback(async () => {
    try {
      const res = await getEventGuests(isCat ? 'eventcategory' : 'wedding', id);
      const list = asArray(res);
      const total = res?.totalPeople ?? list.reduce((s, g) => s + (parseInt(g.guests_count, 10) || 1), 0);
      setGuests({ list, total });
    } catch { /* пусто */ }
  }, [id, isCat]);

  // Резолв полных объектов услуг по item_id (бэкенд хранит только id+type).
  // У event-category строк-услуг нет собственного id — ключом служит
  // `${serviceType}-${serviceId}` (см. rowsOf ниже).
  const resolveNames = useCallback(async (e) => {
    const rows = rowsOf(e, isCat);
    const entries = await Promise.all(rows.map(async (it) => {
      const meta = ITEM_TYPE_META[it.type];
      if (!meta) return [it.wiId, null];
      try {
        // Часть detail-эндпоинтов отдаёт массив с одной записью
        // (например /api/restaurantbyid/{id}), часть — объект.
        const obj = unwrap(await fetchOne(meta.detail(it.itemId)));
        return [it.wiId, Array.isArray(obj) ? obj[0] ?? null : obj];
      } catch { return [it.wiId, null]; }
    }));
    setItemObjs(Object.fromEntries(entries));
  }, [isCat]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const e = unwrap(await (isCat ? getEventCategory(id) : getWedding(id)));
      setEv(e);
      setForm({ name: e?.name || '', date: e?.date || '', budget: String(e?.budget ?? '') });
      resolveNames(e);
      await Promise.all([loadWishlist(), loadGuests()]);
    } catch (err) {
      setError(err.message || t('Не удалось загрузить мероприятие', 'Іс-шараны жүктеу мүмкін болмады'));
    } finally {
      setLoading(false);
    }
  }, [id, isCat, loadWishlist, loadGuests, resolveNames, t]);

  useEffect(() => { if (ready && isAuth) load(); else if (ready) setLoading(false); }, [ready, isAuth, load]);

  const saveEdit = async () => {
    setSavingEdit(true);
    try {
      const newBudget = parseFloat(form.budget) || 0;
      const data = { name: form.name.trim(), date: form.date, budget: newBudget };
      if (isCat) await updateEventCategory(id, data);
      else await updateWedding(id, data);
      // Остаток — как в моб. Item3Screen: remaining_balance = budget − total_cost.
      // paid_amount с веба не редактируется (поле «Оплачено» убрано по решению владельца).
      try {
        const totalNow = Number(ev?.total_cost) || 0;
        if (isCat) await updateEventCategoryRemainingBalance(id, newBudget - totalNow);
        else await updateWeddingRemainingBalance(id, newBudget - totalNow);
      } catch { /* не критично */ }
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
    try {
      // Сначала освобождаем брони номеров/авто и даты ресторанов (как моб.
      // Item3Screen при удалении категории), затем удаляем само мероприятие.
      const rows = rowsOf(ev, isCat);
      await cancelBookingsForRows(rows, ev?.date);
      for (const r of rows) {
        if (r.type === 'restaurant' && ev?.date) {
          try { await unblockRestaurantDate(r.itemId, ev.date); } catch { /* не критично */ }
        }
      }
      await (isCat ? deleteEventCategory(id) : deleteWedding(id));
      router.push('/app/events');
    } catch (err) { alert(err.message || t('Не удалось удалить', 'Жою мүмкін болмады')); }
  };

  // Удаление услуги из мероприятия + пересчёт бюджета.
  const removeItem = async (row, items, budget) => {
    const wiId = row.wiId;
    setRemovingId(wiId);
    try {
      // Брони номеров/авто этой услуги освобождаем (моб. Item3Screen:2979).
      await cancelBookingsForRows([row], ev?.date);
      if (isCat) {
        // serviceType шлём КАК ЕСТЬ (PascalCase). Моб. Item3Screen.js:2745
        // приводит его к нижнему регистру без «s» — бэкенд на такое отвечает
        // 404 (проверено вживую: 'restaurant' → 404, 'Restaurant' → 204).
        await removeServiceFromCategory(id, row.itemId, row.serviceType);
        // Блок даты ресторана ставился при добавлении — снимаем, иначе дата
        // останется занятой и ресторан нельзя будет добавить снова.
        if (row.type === 'restaurant' && ev?.date) {
          try { await unblockRestaurantDate(row.itemId, ev.date); } catch { /* не критично */ }
        }
      } else {
        await deleteWeddingItem(wiId);
      }
      const newTotal = items.filter((x) => x.wiId !== wiId).reduce((s, x) => s + x.total, 0);
      try {
        if (isCat) { await updateEventCategoryTotalCost(id, newTotal); await updateEventCategoryRemainingBalance(id, (budget || 0) - newTotal); }
        else { await updateWeddingTotalCost(id, newTotal); await updateWeddingRemainingBalance(id, (budget || 0) - newTotal); }
      } catch { /* не критично */ }
      await load();
    } catch (err) {
      alert(err.message || t('Не удалось удалить услугу', 'Қызметті жою мүмкін болмады'));
    } finally {
      setRemovingId(null);
    }
  };

  // Добавление услуги в существующее мероприятие-«категорию» (как в моб.
  // Item3Screen). Для свадеб эндпоинта нет — кнопка показывается только при isCat.
  const [addOpen, setAddOpen] = useState(false);
  const addService = async ({ catKey, item, quantity, booking, svc }) => {
    try {
      // Занятость ДО добавления (ресторан на дату, номера, авто) — как при создании.
      const conflicts = await checkBookingConflicts([{ catKey, item, quantity, booking }], ev?.date, t);
      if (conflicts.length) {
        alert(`${t('Занято на выбранную дату', 'Таңдалған күнге бос емес')}: ${conflicts.join('; ')}`);
        return;
      }
      await addServiceToCategory(id, svc);
      // Пересчёт сумм: total_cost += стоимость новой услуги (как recalculateAndSaveFinancials).
      const curTotal = Number(ev?.total_cost) || 0;
      const newTotal = curTotal + (Number(svc.cost) || 0);
      const b = Number(ev?.budget) || 0;
      try {
        await updateEventCategoryTotalCost(id, newTotal);
        await updateEventCategoryRemainingBalance(id, b - newTotal);
      } catch { /* не критично */ }
      // Реальные брони номеров/авто + блок даты ресторана (best-effort, как при создании).
      const failures = await createBookingsForWedding([{ catKey, item, quantity, booking }], ev?.date, id);
      if (failures.length) {
        alert(`${t('Услуга добавлена, но не все брони прошли', 'Қызмет қосылды, бірақ кейбір брондар өтпеді')}: ${failures.join(', ')}`);
      }
      setAddOpen(false);
      await load();
    } catch (err) {
      alert(err.message || t('Не удалось добавить услугу', 'Қызметті қосу мүмкін болмады'));
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
      else await createWish({ event_id: Number(id), good_id: good.id, event_type: isCat ? 'eventcategory' : 'wedding' });
      await loadWishlist();
    } catch (err) {
      const hostErr = /host/i.test(err.message || '');
      alert(hostErr ? t('Управлять списком может только организатор', 'Тізімді тек ұйымдастырушы басқара алады') : (err.message || t('Не удалось', 'Қате')));
    } finally {
      setTogglingGood(null);
    }
  };

  // Свой подарок: POST /api/goods (те же поля, что читает список: item_name/cost),
  // затем createWish с новым good_id — как toggleGood, но с созданием товара.
  const addCustomGood = async () => {
    const name = customForm.item_name.trim();
    if (!name) { alert(t('Пожалуйста, укажите название подарка', 'Сыйлықтың атауын көрсетіңіз')); return; }
    setAddingCustom(true);
    try {
      // Payload — контракт мобильного handleAddCustomGift (Item3Screen):
      // category обязателен на бэке, cost строкой ('0' если пусто), магазин в specs.
      const res = await createGood({
        category: 'Miscellaneous',
        item_name: name,
        description: customForm.description,
        cost: customForm.cost || '0',
        link: customForm.link,
        specs: { storeName: customForm.storeName, address: customForm.address, phone: customForm.phone },
      });
      const newId = getEntityId(res);
      if (!newId) throw new Error(t('Не удалось создать подарок', 'Сыйлықты құру мүмкін болмады'));
      await createWish({ event_id: Number(id), good_id: newId, event_type: isCat ? 'eventcategory' : 'wedding' });
      await loadWishlist();
      // Показываем созданный товар в списке модалки — сразу с пометкой «В списке ✓».
      setGoods((gs) => [{ id: newId, item_name: name, cost: customForm.cost || 0 }, ...gs]);
      setCustomForm(emptyCustom);
      setCustomOpen(false);
    } catch (err) {
      const hostErr = /host/i.test(err.message || '');
      alert(hostErr ? t('Управлять списком может только организатор', 'Тізімді тек ұйымдастырушы басқара алады') : (err.message || t('Не удалось', 'Қате')));
    } finally {
      setAddingCustom(false);
    }
  };

  // Поделиться: готовая серверная страница приглашения (как Share.share в моб. app).
  const shareEvent = async () => {
    // Серверная страница-приглашение: у категорий свой адрес (Item3Screen.js:3271).
    const url = isCat
      ? `https://api.toilab.kz/api/eventcategorywishes/${id}`
      : `https://api.toilab.kz/api/weddingwishes/${id}`;
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

  // Для event-category стоимости услуги в ответе нет — считаем цена×количество
  // по объекту каталога (он уже загружен для названия/«Подробнее»).
  const items = rowsOf(ev, isCat).map((r) => {
    if (Number.isFinite(r.total)) return r;
    const obj = itemObjs[r.wiId];
    return { ...r, total: obj ? catalogItemCost(obj) * r.quantity : 0 };
  });
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

      {/* Шапка — тёплый баннер */}
      <div className="tl-dark tl-grid" style={{ position: 'relative', overflow: 'hidden', borderRadius: 'var(--r-lg)', padding: '22px 22px', margin: '10px 0 18px', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ minWidth: 0 }}>
            <h1 className="tl-display" style={{ fontSize: 'clamp(22px,3.6vw,30px)', fontWeight: 800, color: 'var(--on-dark)', lineHeight: 1.1 }}>{ev.name || t('Без названия', 'Атаусыз')}</h1>
            {ev.date && <div style={{ color: 'var(--on-dark-2)', fontSize: 14, marginTop: 4 }}>{ev.date}</div>}
          </div>
          <div style={{ display: 'flex', gap: 10, whiteSpace: 'nowrap' }}>
            <button onClick={() => setEditing((v) => !v)} style={{ background: 'rgba(255,255,255,0.14)', color: 'var(--on-dark)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 'var(--r-pill)', padding: '8px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>{t('Изменить', 'Өзгерту')}</button>
            <button onClick={onDelete} style={{ background: 'rgba(255,255,255,0.12)', color: '#F3C9C0', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 'var(--r-pill)', padding: '8px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>{t('Удалить', 'Жою')}</button>
          </div>
        </div>
      </div>

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800 }}>{t('Услуги', 'Қызметтер')}</h2>
        {isCat && isHost && (
          <button onClick={() => setAddOpen(true)} style={{ padding: '8px 14px', borderRadius: 999, background: '#4A3F35', color: '#F5F0E9', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: 13 }}>
            ＋ {t('Добавить услугу', 'Қызмет қосу')}
          </button>
        )}
      </div>
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
                        <button onClick={() => removeItem(it, items, budget)} disabled={removingId === it.wiId}
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

      {/* Гости (RSVP «Я буду» со страницы-приглашения) — видит организатор */}
      {isHost && (
        <div style={{ background: '#fff', border: '1px solid rgba(212,196,176,0.6)', borderRadius: 14, padding: 16, marginBottom: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: guests.list.length ? 10 : 0 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800 }}>👥 {t('Гости', 'Қонақтар')}</h2>
            <span style={{ fontSize: 13, color: '#6B5A4D' }}>{t('Всего гостей', 'Барлық қонақ')}: <b>{guests.total}</b> {t('чел.', 'адам')}</span>
          </div>
          {guests.list.length === 0 ? (
            <p style={{ color: '#8C7B6D', fontSize: 13, marginTop: 6 }}>{t('Пока никто не подтвердил присутствие. Поделитесь ссылкой-приглашением.', 'Әзірге ешкім қатысуын растаған жоқ. Шақыру сілтемесін жіберіңіз.')}</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {guests.list.map((g) => {
                const n = parseInt(g.guests_count, 10) || 1;
                return (
                  <li key={g.id ?? `${g.name}-${g.created_at}`} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#4A3F35' }}>
                    <span>• {g.name}</span>
                    {n > 1 && <span style={{ color: '#8C7B6D' }}>{n} {t('чел.', 'адам')}</span>}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

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
      {addOpen && (
        <AddServiceModal
          eventKind={ev.event_kind} city={city} date={ev.date} lang={lang} t={t}
          existing={new Set(items.map((r) => r.wiId))}
          onAdd={addService} onClose={() => setAddOpen(false)} />
      )}

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
              {/* Свой подарок — если в каталоге нет нужного («всё не предусмотришь»).
                  Кнопка открывает модалку с полями как в мобильном Item3Screen. */}
              <div style={{ padding: '12px 18px 18px', borderTop: '1px solid var(--line, #E5D9C8)' }}>
                <button onClick={() => setCustomOpen(true)}
                  style={{ width: '100%', padding: '12px 18px', borderRadius: 999, border: '1px dashed var(--accent, #B08D57)', cursor: 'pointer',
                    fontSize: 14, fontWeight: 700, background: '#fff', color: 'var(--accent, #B08D57)' }}>
                  + {t('Или добавьте свой подарок', 'Немесе өз сыйлығыңызды қосыңыз')}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Модалка своего подарка — поля 1-в-1 с мобильным Item3Screen */}
      {customOpen && (
        <div onClick={() => setCustomOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(40,33,28,0.6)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 18, zIndex: 120, animation: 'tlFadeIn .18s ease-out' }}>
          <div onClick={(e) => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: 16, padding: 18, width: '100%', maxWidth: 460, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(40,33,28,0.35)', animation: 'tlSlideUp .22s ease-out' }}>
            <style>{`@keyframes tlFadeIn { from { opacity: 0 } to { opacity: 1 } } @keyframes tlSlideUp { from { opacity: 0; transform: translateY(16px) scale(.98) } to { opacity: 1; transform: none } }`}</style>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <strong style={{ fontSize: 18, color: '#4A3F35' }}>{t('Свой подарок', 'Өз сыйлығыңыз')}</strong>
              <button onClick={() => setCustomOpen(false)} style={{ border: 'none', background: 'none', fontSize: 20, cursor: 'pointer', color: '#B08D57' }}>✕</button>
            </div>

            <div style={col}>
              <label style={lbl}>{t('Название подарка', 'Сыйлықтың атауы')} *</label>
              <input value={customForm.item_name} onChange={(e) => setCF('item_name', e.target.value)}
                placeholder={t('Например: набор посуды', 'Мысалы: ыдыс жинағы')} style={inp} />
            </div>
            <div style={{ ...col, marginTop: 10 }}>
              <label style={lbl}>{t('Ссылка на товар', 'Тауарға сілтеме')}</label>
              <input value={customForm.link} onChange={(e) => setCF('link', e.target.value)}
                placeholder="https://..." autoCapitalize="none" style={inp} />
            </div>
            <div style={{ ...col, marginTop: 10 }}>
              <label style={lbl}>{t('Описание', 'Сипаттама')}</label>
              <textarea value={customForm.description} onChange={(e) => setCF('description', e.target.value)}
                placeholder={t('Цвет, размер, пожелания', 'Түсі, өлшемі, тілектер')} rows={3} style={{ ...inp, resize: 'vertical' }} />
            </div>
            <div style={{ ...col, marginTop: 10 }}>
              <label style={lbl}>{t('Стоимость (₸)', 'Құны (₸)')}</label>
              <input inputMode="numeric" value={customForm.cost}
                onChange={(e) => setCF('cost', e.target.value.replace(/[^0-9]/g, ''))}
                placeholder={t('Например: 25000', 'Мысалы: 25000')} style={inp} />
            </div>
            <div style={{ ...col, marginTop: 10 }}>
              <label style={lbl}>{t('Название магазина', 'Дүкен атауы')}</label>
              <input value={customForm.storeName} onChange={(e) => setCF('storeName', e.target.value)}
                placeholder={t('Где купить подарок', 'Сыйлықты қайдан сатып алуға болады')} style={inp} />
            </div>
            <div style={{ ...col, marginTop: 10 }}>
              <label style={lbl}>{t('Адрес магазина', 'Дүкен мекенжайы')}</label>
              <input value={customForm.address} onChange={(e) => setCF('address', e.target.value)}
                placeholder={t('Улица и номер дома', 'Көше және үй нөмірі')} style={inp} />
            </div>
            <div style={{ ...col, marginTop: 10 }}>
              <label style={lbl}>{t('Телефон магазина', 'Дүкен телефоны')}</label>
              <input value={customForm.phone} onChange={(e) => setCF('phone', e.target.value)}
                placeholder="+7 (___) ___-__-__" inputMode="tel" style={inp} />
            </div>

            <button onClick={addCustomGood} disabled={addingCustom || !customForm.item_name.trim()}
              style={{ width: '100%', marginTop: 16, padding: '12px 0', borderRadius: 999, border: 'none', cursor: 'pointer',
                fontSize: 15, fontWeight: 700, background: 'var(--accent, #B08D57)', color: '#fff',
                opacity: addingCustom || !customForm.item_name.trim() ? 0.6 : 1 }}>
              {addingCustom ? t('Добавление…', 'Қосылуда…') : `✓ ${t('Добавить свой', 'Өзімдікін қосу')}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const col = { display: 'flex', flexDirection: 'column', gap: 6 };
const lbl = { fontSize: 13, fontWeight: 600, color: '#6B5A4D' };
const inp = { padding: '12px 14px', borderRadius: 12, border: '1px solid #D4C4B0', fontSize: 16, color: '#4A3F35', background: '#fff', width: '100%', boxSizing: 'border-box' };
const linkBtn = { border: 'none', background: 'none', color: '#B08D57', cursor: 'pointer', fontSize: 14, fontWeight: 600, padding: 0 };
