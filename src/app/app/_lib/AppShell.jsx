'use client';

// Оболочка раздела /app: общая шапка MainHeader (та же, что на лендинге) +
// контент + слим-футер. Провайдеры состояния подняты в корень (app/_ui/Providers).
import Link from 'next/link';
import { useApp } from './AppContext';
import MainHeader from '../../_ui/MainHeader';

export default function AppShell({ children }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FAF7F2', color: '#2C2420', fontFamily: 'var(--font-ui)' }}>
      <MainHeader />
      <main style={{ flex: 1, width: '100%', maxWidth: 1100, margin: '0 auto', padding: '24px 16px 64px' }}>{children}</main>
      <AppFooter />
    </div>
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
    <footer style={{ borderTop: '1px solid var(--line)', background: 'rgba(255,255,255,0.6)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '18px 16px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px 20px' }}>
        {links.map((l) => (
          <Link key={l.href} href={l.href} style={{ color: 'var(--ink-2)', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
            {l.label}
          </Link>
        ))}
        <div style={{ flex: 1, minWidth: 12 }} />
        <span style={{ color: 'var(--ink-3)', fontSize: 13 }}>© 2026 Toilab</span>
      </div>
    </footer>
  );
}
