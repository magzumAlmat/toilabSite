'use client';

// Корзина услуг: набираем услуги по каталогу, затем оформляем мероприятие.
import { createContext, useContext, useEffect, useState, useCallback } from 'react';

const CartContext = createContext(null);
const CART_KEY = 'toilab_app_cart';

export function CartProvider({ children }) {
  const [items, setItems] = useState([]); // [{ slug, item, quantity }]
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const s = window.localStorage.getItem(CART_KEY);
      if (s) setItems(JSON.parse(s));
    } catch { /* ignore */ }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) window.localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items, ready]);

  const keyOf = (slug, item) => `${slug}-${item.id}`;
  const has = useCallback((slug, item) => items.some((c) => keyOf(c.slug, c.item) === keyOf(slug, item)), [items]);

  const toggle = useCallback((slug, item) => {
    setItems((cs) => {
      const k = keyOf(slug, item);
      return cs.some((c) => keyOf(c.slug, c.item) === k)
        ? cs.filter((c) => keyOf(c.slug, c.item) !== k)
        : [...cs, { slug, item, quantity: 1 }];
    });
  }, []);

  const remove = useCallback((slug, id) => setItems((cs) => cs.filter((c) => !(c.slug === slug && c.item.id === id))), []);
  const setQty = useCallback((slug, id, q) => setItems((cs) => cs.map((c) => (c.slug === slug && c.item.id === id ? { ...c, quantity: Math.max(1, q) } : c))), []);
  const clear = useCallback(() => setItems([]), []);

  const value = { items, ready, has, toggle, remove, setQty, clear, count: items.length };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
