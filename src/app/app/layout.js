'use client';

// Оболочка веб-версии приложения Toilab (раздел /app).
import Link from 'next/link';
import { AppProvider, useApp } from './_lib/AppContext';
import { CartProvider, useCart } from './_lib/CartContext';
import { CITIES } from './_lib/categories';

export default function AppLayout({ children }) {
  return (
    <AppProvider>
      <CartProvider>
        <div style={{ minHeight: '100vh', background: '#F5F0E9', color: '#4A3F35', fontFamily: "'Roboto', sans-serif" }}>
          <AppHeader />
          <main style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px 64px' }}>{children}</main>
        </div>
      </CartProvider>
    </AppProvider>
  );
}

function AppHeader() {
  const { city, setCity, lang, setLang, isAuth, user, signOut } = useApp();
  const { count } = useCart();

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 40, background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(212,196,176,0.5)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <Link href="/app" style={{ fontWeight: 800, fontSize: 22, color: '#4A3F35', textDecoration: 'none', letterSpacing: '-0.02em' }}>
          Toilab
        </Link>

        <div style={{ flex: 1 }} />

        {/* Город */}
        <select
          value={city || ''}
          onChange={(e) => setCity(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 999, border: '1px solid #D4C4B0', background: '#fff', color: '#4A3F35', fontWeight: 600, fontSize: 14 }}
        >
          <option value="" disabled>{lang === 'kz' ? 'Қала' : 'Город'}</option>
          {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* Язык */}
        <div style={{ display: 'flex', borderRadius: 999, overflow: 'hidden', border: '1px solid #D4C4B0' }}>
          {['kz', 'ru'].map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              style={{
                padding: '8px 12px', fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none',
                background: lang === l ? '#4A3F35' : '#fff',
                color: lang === l ? '#F5F0E9' : '#4A3F35',
              }}
            >
              {l === 'kz' ? 'ҚАЗ' : 'РУС'}
            </button>
          ))}
        </div>

        {/* Корзина */}
        <Link href="/app/cart" style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: 999, border: '1px solid #D4C4B0', textDecoration: 'none', fontSize: 18 }} title={lang === 'kz' ? 'Себет' : 'Корзина'}>
          🛒
          {count > 0 && (
            <span style={{ position: 'absolute', top: -6, right: -6, background: '#B08D57', color: '#fff', borderRadius: 999, minWidth: 20, height: 20, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' }}>{count}</span>
          )}
        </Link>

        {/* Кабинет поставщика (roleId === 2) */}
        {isAuth && user?.roleId === 2 && (
          <Link href="/app/supplier" style={btnGhost}>{lang === 'kz' ? 'Кабинет' : 'Кабинет'}</Link>
        )}

        {/* Мероприятия клиента (не поставщик) */}
        {isAuth && user?.roleId !== 2 && (
          <Link href="/app/events" style={btnGhost}>{lang === 'kz' ? 'Іс-шаралар' : 'Мероприятия'}</Link>
        )}

        {/* Авторизация */}
        {isAuth ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{user?.fullName || user?.email || (lang === 'kz' ? 'Профиль' : 'Профиль')}</span>
            <button onClick={signOut} style={btnGhost}>{lang === 'kz' ? 'Шығу' : 'Выйти'}</button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link href="/app/register" style={btnGhost}>{lang === 'kz' ? 'Тіркелу' : 'Регистрация'}</Link>
            <Link href="/app/login" style={btnDark}>{lang === 'kz' ? 'Кіру' : 'Войти'}</Link>
          </div>
        )}
      </div>
    </header>
  );
}

const btnDark = {
  padding: '8px 18px', borderRadius: 999, background: '#4A3F35', color: '#F5F0E9',
  fontWeight: 700, fontSize: 14, textDecoration: 'none', border: 'none', cursor: 'pointer',
};
const btnGhost = {
  padding: '8px 14px', borderRadius: 999, background: 'transparent', color: '#6B5A4D',
  fontWeight: 600, fontSize: 14, border: '1px solid #D4C4B0', cursor: 'pointer',
};
