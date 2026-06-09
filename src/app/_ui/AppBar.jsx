'use client';

// Единая шапка для всего сайта (и (site), и /app) — презентационная, на токенах.
// Состояние (язык/город/авторизация/пункты меню) приходит пропсами из каждого
// layout-а, поэтому шапка выглядит одинаково везде, а наполнение — по контексту.
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';

function NavLink({ href, label, active, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className="tl-navlink"
      style={{
        position: 'relative', textDecoration: 'none', fontSize: 16, whiteSpace: 'nowrap',
        fontWeight: active ? 800 : 600, color: active ? 'var(--ink)' : 'var(--ink-2)', paddingBottom: 4,
      }}
    >
      {label}
      <span aria-hidden style={{ position: 'absolute', left: 0, bottom: 0, height: 2, width: active ? '100%' : 0, background: 'var(--accent)', borderRadius: 2, transition: 'width .25s ease' }} className="tl-navline" />
    </Link>
  );
}

function LangToggle({ lang, setLang }) {
  return (
    <div style={{ display: 'inline-flex', padding: 4, borderRadius: 'var(--r-pill)', background: 'var(--surface-2)', border: '1px solid var(--line)' }}>
      {['kz', 'ru'].map((l) => (
        <button key={l} type="button" onClick={() => setLang(l)} aria-pressed={lang === l}
          style={{
            padding: '8px 16px', borderRadius: 'var(--r-pill)', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: 13,
            background: lang === l ? 'var(--brand)' : 'transparent',
            color: lang === l ? 'var(--on-brand)' : 'var(--ink-2)',
          }}>
          {l === 'kz' ? 'ҚАЗ' : 'РУС'}
        </button>
      ))}
    </div>
  );
}

export default function AppBar({ logoHref = '/about', nav = [], actions = null, lang, setLang }) {
  const [open, setOpen] = useState(false);

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(8px)', borderBottom: '1px solid var(--line-2)' }}>
      <style>{`
        .tl-navlink:hover .tl-navline { width: 100% !important; }
        .tl-bar-desktop { display: none; }
        .tl-bar-burger { display: inline-flex; }
        @media (min-width: 900px) {
          .tl-bar-desktop { display: flex !important; }
          .tl-bar-burger { display: none !important; }
        }
      `}</style>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 18 }}>
        <Link href={logoHref} aria-label="Toilab" style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <Image src="/images/logo.png" alt="Toilab" width={88} height={70} priority style={{ height: 52, width: 'auto' }} />
        </Link>

        {/* Десктоп: меню */}
        <nav className="tl-bar-desktop" style={{ alignItems: 'center', gap: 28 }}>
          {nav.map((n) => <NavLink key={n.href} {...n} />)}
        </nav>

        <div style={{ flex: 1 }} />

        {/* Десктоп: действия + язык */}
        <div className="tl-bar-desktop" style={{ alignItems: 'center', gap: 14 }}>
          {actions}
          <LangToggle lang={lang} setLang={setLang} />
        </div>

        {/* Мобайл: бургер */}
        <button type="button" className="tl-bar-burger" onClick={() => setOpen(!open)} aria-label="Меню"
          style={{ alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: 'var(--r-sm)', border: '1px solid var(--line-2)', background: 'var(--surface)', cursor: 'pointer', color: 'var(--ink)' }}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Мобильное меню */}
      {open && (
        <div className="tl-bar-burger" style={{ borderTop: '1px solid var(--line)', background: 'var(--surface)', padding: '12px 16px 18px', flexDirection: 'column', gap: 4 }}>
          {nav.map((n) => (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)} aria-current={n.active ? 'page' : undefined}
              style={{ display: 'block', padding: '10px 4px', textDecoration: 'none', fontSize: 16, fontWeight: n.active ? 800 : 600, color: n.active ? 'var(--ink)' : 'var(--ink-2)' }}>
              {n.label}
            </Link>
          ))}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, paddingTop: 12, marginTop: 6, borderTop: '1px solid var(--line)' }} onClick={() => setOpen(false)}>
            {actions}
            <LangToggle lang={lang} setLang={setLang} />
          </div>
        </div>
      )}
    </header>
  );
}
