'use client';

// ЕДИНАЯ шапка для всего сайта (лендинг + приложение). Берёт авторизацию/город/
// язык из общего AppContext (поднят в корень), поэтому выглядит одинаково везде
// и в любом состоянии (гость / клиент / поставщик).
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '../app/_lib/AppContext';
import { CITIES } from '../app/_lib/categories';
import AppBar from './AppBar';

export default function MainHeader() {
  const { city, setCity, lang, setLang, isAuth, user, signOut } = useApp();
  const pathname = usePathname() || '';
  const isKz = lang === 'kz';
  const displayName = user?.fullName || user?.name || (user?.email ? user.email.split('@')[0] : (isKz ? 'Профиль' : 'Профиль'));
  const initial = (displayName || '?').trim().charAt(0).toUpperCase();

  const nav = [
    { href: '/app', label: isKz ? 'Басты бет' : 'Главная', active: pathname === '/app' || pathname.startsWith('/app/catalog') },
    isAuth && user?.roleId !== 2 && { href: '/app/events', label: isKz ? 'Іс-шаралар' : 'Мои мероприятия', active: pathname.startsWith('/app/events') },
    isAuth && user?.roleId === 2 && { href: '/app/supplier', label: 'Кабинет', active: pathname.startsWith('/app/supplier') },
    { href: '/about', label: isKz ? 'Біз туралы' : 'О нас', active: pathname === '/about' },
    { href: '/contacts', label: isKz ? 'Байланыс' : 'Контакты', active: pathname === '/contacts' },
  ].filter(Boolean);

  const loginHref =
    pathname.startsWith('/app') && !pathname.startsWith('/app/login') && !pathname.startsWith('/app/register')
      ? `/app/login?redirect=${encodeURIComponent(pathname)}`
      : '/app/login';

  const actions = (
    <>
      {isAuth && (
        <select value={city || ''} onChange={(e) => setCity(e.target.value)} aria-label={isKz ? 'Қала' : 'Город'}
          style={{ height: 42, padding: '0 14px', borderRadius: 'var(--r-pill)', border: '1px solid var(--line-2)', background: 'var(--surface)', color: 'var(--ink)', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
          <option value="" disabled>{isKz ? 'Қала' : 'Город'}</option>
          {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      )}
      {isAuth ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span title={user?.email || displayName} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, maxWidth: 160 }}>
            <span aria-hidden style={{ width: 34, height: 34, flexShrink: 0, borderRadius: 'var(--r-pill)', background: 'var(--surface-2)', color: 'var(--accent-600)', fontWeight: 900, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{initial}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</span>
          </span>
          <button onClick={signOut} style={btnGhost}>{isKz ? 'Шығу' : 'Выйти'}</button>
        </div>
      ) : (
        <>
          <Link href="/app/register" style={btnGhost}>{isKz ? 'Тіркелу' : 'Регистрация'}</Link>
          <Link href={loginHref} style={btnDark}>{isKz ? 'Кіру' : 'Войти'}</Link>
        </>
      )}
    </>
  );

  return <AppBar logoHref={pathname.startsWith('/app') ? '/app' : '/about'} nav={nav} actions={actions} lang={lang} setLang={setLang} />;
}

const btnDark = {
  display: 'inline-flex', alignItems: 'center', height: 42, padding: '0 20px', borderRadius: 'var(--r-pill)',
  background: 'var(--brand)', color: 'var(--on-brand)', fontWeight: 800, fontSize: 14, textDecoration: 'none', border: 'none', cursor: 'pointer',
};
const btnGhost = {
  display: 'inline-flex', alignItems: 'center', height: 42, padding: '0 16px', borderRadius: 'var(--r-pill)',
  background: 'transparent', color: 'var(--ink-2)', fontWeight: 700, fontSize: 14, border: '1px solid var(--line-2)', cursor: 'pointer',
};
