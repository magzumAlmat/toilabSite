'use client';

// Премиум-компоненты (направление «Вариант 1»): тёмный герой с золотым spotlight,
// display-заголовок (Unbounded), золотые кнопки, парящие чипы услуг.
// Используются на главной /app, гостевом экране, /about — единый премиум-язык.
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { CatIcon } from '../app/_lib/CatIcon';

const goldBtn = {
  display: 'inline-flex', alignItems: 'center', gap: 8, padding: '15px 30px', borderRadius: 'var(--r-pill)',
  background: '#FFFFFF', color: 'var(--brand)',
  fontWeight: 800, fontSize: 16, textDecoration: 'none', border: 'none', cursor: 'pointer',
  boxShadow: '0 12px 34px rgba(0,0,0,0.22)',
};
const ghostDark = {
  display: 'inline-flex', alignItems: 'center', gap: 8, padding: '15px 30px', borderRadius: 'var(--r-pill)',
  background: 'rgba(255,255,255,0.08)', color: 'var(--on-dark)', fontWeight: 700, fontSize: 16,
  textDecoration: 'none', border: '1px solid rgba(255,255,255,0.22)',
};

export function GoldButton({ href, children, onClick, type, arrow = true }) {
  if (href) return <Link href={href} style={goldBtn}>{children}{arrow && <ArrowRight size={18} />}</Link>;
  return <button type={type || 'button'} onClick={onClick} style={goldBtn}>{children}{arrow && <ArrowRight size={18} />}</button>;
}

export function GhostButton({ href, children }) {
  return <Link href={href} style={ghostDark}>{children}</Link>;
}

// Тёмный премиум-герой: badge → заголовок (+золотой акцент) → подзаголовок → CTA → чипы услуг.
export function PremiumHero({ badge, title, accent, subtitle, primary, secondary, chips, align = 'center' }) {
  const centered = align === 'center';
  return (
    <section className="tl-dark tl-grid tl-spot" style={{ position: 'relative', overflow: 'hidden', borderRadius: 'var(--r-lg)', padding: 'clamp(36px,6vw,64px) clamp(22px,4vw,48px)', marginBottom: 32, boxShadow: 'var(--shadow-lg)' }}>
      <div style={{ position: 'relative', maxWidth: 760, margin: centered ? '0 auto' : '0', textAlign: centered ? 'center' : 'left' }}>
        {badge && (
          <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12.5, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--gold)', border: '1px solid rgba(212,196,176,0.4)', background: 'rgba(212,196,176,0.08)', padding: '8px 16px', borderRadius: 'var(--r-pill)', marginBottom: 22 }}>
            {badge}
          </motion.span>
        )}
        <motion.h1 className="tl-display" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}
          style={{ fontSize: 'clamp(30px,5vw,56px)', fontWeight: 800, lineHeight: 1.06, marginBottom: 18, color: 'var(--on-dark)' }}>
          {title}{accent && <><br /><span className="tl-gold-text">{accent}</span></>}
        </motion.h1>
        {subtitle && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 }}
            style={{ fontSize: 'clamp(15px,1.6vw,18px)', color: 'var(--on-dark-2)', maxWidth: 560, margin: centered ? '0 auto 30px' : '0 0 30px', lineHeight: 1.5 }}>
            {subtitle}
          </motion.p>
        )}
        {(primary || secondary) && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            style={{ display: 'flex', gap: 14, justifyContent: centered ? 'center' : 'flex-start', flexWrap: 'wrap', marginBottom: chips && chips.length ? 44 : 0 }}>
            {primary}{secondary}
          </motion.div>
        )}
        {chips && chips.length > 0 && (
          <div style={{ display: 'flex', gap: 14, justifyContent: centered ? 'center' : 'flex-start', flexWrap: 'wrap' }}>
            {chips.map((c, i) => (
              <motion.div key={c.slug} className="tl-floaty" style={{ animationDelay: `${i * 0.4}s`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25 + i * 0.06 }}>
                <span style={{ width: 60, height: 60, borderRadius: 18, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(212,196,176,0.25)', color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                  <CatIcon slug={c.slug} size={26} />
                </span>
                <span style={{ fontSize: 11.5, color: 'var(--on-dark-2)', fontWeight: 600 }}>{c.label}</span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
