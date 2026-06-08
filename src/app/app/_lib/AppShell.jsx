'use client';

// Клиентская оболочка веб-версии приложения Toilab (раздел /app): провайдеры
// состояния, шапка с городом/языком/корзиной/авторизацией. Вынесена из
// app/layout.js, чтобы сам layout остался серверным и мог экспортировать metadata.
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AppProvider, useApp } from './AppContext';
import { CartProvider, useCart } from './CartContext';
import { CITIES } from './categories';

export default function AppShell({ children }) {
  return (
    <AppProvider>
      <CartProvider>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F5F0E9', color: '#4A3F35', fontFamily: 'var(--font-roboto), sans-serif' }}>
          <AppHeader />
          <main style={{ flex: 1, width: '100%', maxWidth: 1100, margin: '0 auto', padding: '24px 16px 64px' }}>{children}</main>
          <AppFooter />
        </div>
      </CartProvider>
    </AppProvider>
  );
}

function AppHeader() {
  const { city, setCity, lang, setLang, isAuth, user, signOut } = useApp();
  const { count } = useCart();
  const pathname = usePathname() || '';
  const isKz = lang === 'kz';

  // Пункты основного меню (нижняя строка). Часть зависит от роли/авторизации.
  const navItems = [
    { href: '/app', label: isKz ? 'Басты бет' : 'Главная', active: pathname === '/app' || pathname.startsWith('/app/catalog') },
    isAuth && user?.roleId !== 2 && { href: '/app/events', label: isKz ? 'Іс-шаралар' : 'Мероприятия', active: pathname.startsWith('/app/events') },
    isAuth && user?.roleId === 2 && { href: '/app/supplier', label: isKz ? 'Кабинет' : 'Кабинет', active: pathname.startsWith('/app/supplier') },
  ].filter(Boolean);

  // Информационные страницы лендинга (раздел (site)) — справа. Политика
  // конфиденциальности живёт в футере (юр-ссылка), не в основном меню.
  const infoItems = [
    { href: '/about', label: isKz ? 'Біз туралы' : 'О нас' },
    { href: '/contacts', label: isKz ? 'Байланыс' : 'Контакты' },
  ];

  // После входа возвращаем пользователя на текущую страницу приложения.
  const loginHref =
    pathname.startsWith('/app') && !pathname.startsWith('/app/login') && !pathname.startsWith('/app/register')
      ? `/app/login?redirect=${encodeURIComponent(pathname)}`
      : '/app/login';

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 40, background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(212,196,176,0.5)' }}>
      {/* СТРОКА 1 — управление: логотип, город, язык, корзина, авторизация */}
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
          <option value="" disabled>{isKz ? 'Қала' : 'Город'}</option>
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
        <Link href="/app/cart" style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: 999, border: '1px solid #D4C4B0', textDecoration: 'none', fontSize: 18 }} title={isKz ? 'Себет' : 'Корзина'}>
          🛒
          {count > 0 && (
            <span style={{ position: 'absolute', top: -6, right: -6, background: '#B08D57', color: '#fff', borderRadius: 999, minWidth: 20, height: 20, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' }}>{count}</span>
          )}
        </Link>

        {/* Авторизация */}
        {isAuth ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{user?.fullName || user?.email || (isKz ? 'Профиль' : 'Профиль')}</span>
            <button onClick={signOut} style={btnGhost}>{isKz ? 'Шығу' : 'Выйти'}</button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link href="/app/register" style={btnGhost}>{isKz ? 'Тіркелу' : 'Регистрация'}</Link>
            <Link href={loginHref} style={btnDark}>{isKz ? 'Кіру' : 'Войти'}</Link>
          </div>
        )}
      </div>

      {/* СТРОКА 2 — основное меню: разделы приложения слева, страницы сайта справа.
          На узких экранах горизонтально прокручивается, не ломая шапку. */}
      <nav style={{ borderTop: '1px solid rgba(212,196,176,0.4)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 16px', display: 'flex', alignItems: 'stretch', gap: 22, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {navItems.map((it) => <NavTab key={it.href} {...it} />)}
          <div style={{ flex: 1, minWidth: 12 }} />
          {infoItems.map((it) => <NavTab key={it.href} {...it} active={pathname === it.href} muted />)}
        </div>
      </nav>
    </header>
  );
}

// Пункт горизонтального меню с подчёркиванием активного раздела.
function NavTab({ href, label, active, muted }) {
  return (
    <Link
      href={href}
      style={{
        display: 'inline-flex', alignItems: 'center', padding: '11px 2px',
        whiteSpace: 'nowrap', textDecoration: 'none', fontSize: 14,
        fontWeight: active ? 700 : 600,
        color: active ? '#4A3F35' : (muted ? '#8C7B6D' : '#6B5A4D'),
        borderBottom: active ? '2px solid #B08D57' : '2px solid transparent',
      }}
    >
      {label}
    </Link>
  );
}

// Слим-футер приложения: юр-ссылки (включая Политику) + копирайт.
function AppFooter() {
  const { lang } = useApp();
  const isKz = lang === 'kz';
  const links = [
    { href: '/about', label: isKz ? 'Біз туралы' : 'О нас' },
    { href: '/contacts', label: isKz ? 'Байланыс' : 'Контакты' },
    { href: '/privacy', label: isKz ? 'Құпиялылық саясаты' : 'Политика конфиденциальности' },
  ];
  return (
    <footer style={{ borderTop: '1px solid rgba(212,196,176,0.5)', background: 'rgba(255,255,255,0.6)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '18px 16px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px 20px' }}>
        {links.map((l) => (
          <Link key={l.href} href={l.href} style={{ color: '#6B5A4D', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
            {l.label}
          </Link>
        ))}
        <div style={{ flex: 1, minWidth: 12 }} />
        <span style={{ color: '#8C7B6D', fontSize: 13 }}>© 2026 Toilab</span>
      </div>
    </footer>
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
