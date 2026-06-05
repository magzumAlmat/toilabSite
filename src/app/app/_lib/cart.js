// Расчёт корзины и сборка payload мероприятия из позиций корзины.
import { getPrice } from './catalogFields';

// slug каталога → строка типа услуги в items[] (как ждёт бэкенд weddings).
export const SLUG_TYPE = {
  restaurants: 'restaurant', cakes: 'cake', flowers: 'flowers', transport: 'transport',
  tamada: 'tamada', program: 'program', jewelry: 'jewelry', clothing: 'clothing',
  alcohol: 'alcohol', 'photo-video': 'photo-video', fireworks: 'fireworks',
  suvenirs: 'suvenir', typography: 'typography', equipment: 'technical-equipment-rental',
  hotels: 'hotel', goods: 'good', 'traditional-gift': 'traditionalGift',
};

// Для ресторана и гостиницы количество = число гостей, иначе — количество из корзины.
export const isGuestSlug = (slug) => slug === 'restaurants' || slug === 'hotels';
export const lineQty = (slug, quantity, guests) =>
  (isGuestSlug(slug) ? (parseInt(guests, 10) || 1) : (parseInt(quantity, 10) || 1));

export const unitCost = (item) => getPrice(item) || 0;
export const lineCost = (slug, item, quantity, guests) => unitCost(item) * lineQty(slug, quantity, guests);

export function cartTotal(items, guests) {
  return items.reduce((s, c) => s + lineCost(c.slug, c.item, c.quantity, guests), 0);
}

// Payload для POST /api/weddings/addwedding из позиций корзины.
export function buildCartPayload({ name, date, hostId, budget, items, guests }) {
  const payloadItems = items.map((c) => {
    const q = lineQty(c.slug, c.quantity, guests);
    return { id: c.item.id, type: SLUG_TYPE[c.slug] || c.slug, quantity: q, totalCost: unitCost(c.item) * q };
  });
  const total = payloadItems.reduce((s, i) => s + i.totalCost, 0);
  const b = parseFloat(budget) || 0;
  return {
    name: (name || '').trim(),
    date,
    host_id: hostId,
    budget: b,
    total_cost: total,
    paid_amount: 0,
    remaining_balance: b - total,
    items: payloadItems,
  };
}
