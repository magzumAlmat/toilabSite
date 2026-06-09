'use client';

// Прототипы героя для выбора визуального направления (3 варианта, разные палитры/стиль).
// Эффекты — в духе Aceternity: анимированные градиенты, spotlight, aurora, floating, bento.
// Выразительный display-шрифт Unbounded (с кириллицей) для заголовков.
import { Unbounded } from 'next/font/google';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Star } from 'lucide-react';
import { CatIcon } from '../app/_lib/CatIcon';

const display = Unbounded({ subsets: ['latin', 'cyrillic'], weight: ['500', '700', '800'], display: 'swap' });

const SERVICES = ['restaurants', 'cakes', 'flowers', 'tamada', 'transport', 'program', 'photo-video', 'suvenirs'];
const SERVICE_LABELS = {
  restaurants: 'Рестораны', cakes: 'Торты', flowers: 'Цветы', tamada: 'Тамада',
  transport: 'Транспорт', program: 'Шоу', 'photo-video': 'Фото', suvenirs: 'Подарки',
};

export default function Preview() {
  return (
    <main style={{ fontFamily: 'var(--font-ui)' }}>
      <style>{`
        @keyframes tlgrad { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes tlfloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes tlpulse { 0%,100%{opacity:.5;transform:scale(1)} 50%{opacity:.85;transform:scale(1.08)} }
        .tl-anim-grad { background-size: 300% 300%; animation: tlgrad 12s ease infinite; }
        .tl-float { animation: tlfloat 5s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce){ .tl-anim-grad,.tl-float{animation:none} }
      `}</style>

      {/* Переключатель вариантов */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(15,12,10,0.85)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span className={display.className} style={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>Toilab · прототипы</span>
          <div style={{ flex: 1 }} />
          {[['#v1', '1 · Премиум'], ['#v2', '2 · Праздничный'], ['#v3', '3 · Современный']].map(([h, l]) => (
            <a key={h} href={h} style={{ color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 700, padding: '8px 14px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.22)' }}>{l}</a>
          ))}
        </div>
      </nav>

      <Variant1 />
      <Variant2 />
      <Variant3 />

      <div style={{ background: '#0f0c0a', color: '#9b8e82', textAlign: 'center', padding: '28px 16px', fontSize: 14 }}>
        Выбери вариант (1 / 2 / 3) — раскатаю выбранный стиль на всё приложение и лендинг.
      </div>
    </main>
  );
}

/* ─────────── Вариант 1 — Тёплый премиум (тёмный + золотой spotlight) ─────────── */
function Variant1() {
  return (
    <section id="v1" style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh', display: 'flex', alignItems: 'center', background: 'radial-gradient(120% 120% at 50% 0%, #2a201a 0%, #160f0b 55%, #0c0805 100%)', color: '#F3E9DC', padding: '90px 20px' }}>
      {/* Золотой spotlight */}
      <div aria-hidden style={{ position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: 900, height: 900, background: 'radial-gradient(circle, rgba(224,168,92,0.35) 0%, rgba(224,168,92,0) 60%)', animation: 'tlpulse 8s ease-in-out infinite' }} />
      {/* Сетка-паттерн */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '48px 48px', maskImage: 'radial-gradient(circle at 50% 30%, black, transparent 75%)' }} />

      <div style={{ position: 'relative', maxWidth: 1000, margin: '0 auto', textAlign: 'center', width: '100%' }}>
        <motion.span initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', color: '#E0A85C', border: '1px solid rgba(224,168,92,0.4)', background: 'rgba(224,168,92,0.08)', padding: '8px 16px', borderRadius: 999, marginBottom: 26 }}>
          <Sparkles size={15} /> ТОЙ-МАРКЕТПЛЕЙС №1 В КАЗАХСТАНЕ
        </motion.span>

        <motion.h1 className={display.className} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
          style={{ fontSize: 'clamp(34px, 6vw, 72px)', fontWeight: 800, lineHeight: 1.05, marginBottom: 22 }}>
          Той вашей мечты —<br />
          <span style={{ background: 'linear-gradient(90deg,#F6D27A,#E0A85C,#C98A3E)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>собран под бюджет</span>
        </motion.h1>

        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.15 }}
          style={{ fontSize: 'clamp(16px,2vw,20px)', color: 'rgba(243,233,220,0.75)', maxWidth: 620, margin: '0 auto 34px', lineHeight: 1.5 }}>
          Укажите бюджет и число гостей — подберём ресторан, тамаду, торт, цветы и всё остальное за минуту.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.25 }}
          style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 50 }}>
          <a href="#v1" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '16px 30px', borderRadius: 999, background: 'linear-gradient(90deg,#F6D27A,#E0A85C)', color: '#2a1c0e', fontWeight: 800, fontSize: 16, textDecoration: 'none', boxShadow: '0 12px 40px rgba(224,168,92,0.4)' }}>
            Создать мероприятие <ArrowRight size={18} />
          </a>
          <a href="#v1" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '16px 30px', borderRadius: 999, background: 'rgba(255,255,255,0.08)', color: '#F3E9DC', fontWeight: 700, fontSize: 16, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)' }}>
            Как это работает
          </a>
        </motion.div>

        {/* Плавающие чипы услуг */}
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          {SERVICES.slice(0, 6).map((s, i) => (
            <motion.div key={s} className="tl-float" style={{ animationDelay: `${i * 0.4}s`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
              initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 + i * 0.06 }}>
              <span style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(224,168,92,0.25)', color: '#E0A85C', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                <CatIcon slug={s} size={28} />
              </span>
              <span style={{ fontSize: 12, color: 'rgba(243,233,220,0.6)', fontWeight: 600 }}>{SERVICE_LABELS[s]}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────── Вариант 2 — Праздничный яркий (живой градиент + bento) ─────────── */
function Variant2() {
  return (
    <section id="v2" className="tl-anim-grad" style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '90px 20px', color: '#fff', background: 'linear-gradient(120deg, #FF7A45 0%, #F74D7B 45%, #7C4DFF 100%)' }}>
      {/* мягкие блобы */}
      <div aria-hidden style={{ position: 'absolute', top: '-10%', right: '-5%', width: 520, height: 520, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', filter: 'blur(80px)' }} />
      <div aria-hidden style={{ position: 'absolute', bottom: '-15%', left: '-10%', width: 480, height: 480, borderRadius: '50%', background: 'rgba(255,210,90,0.35)', filter: 'blur(90px)' }} />

      <div style={{ position: 'relative', maxWidth: 1100, margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '1fr', gap: 44, alignItems: 'center' }}>
        <div>
          <motion.span initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 800, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(6px)', padding: '8px 16px', borderRadius: 999, marginBottom: 22, border: '1px solid rgba(255,255,255,0.3)' }}>
            <Star size={14} fill="#fff" /> Праздник начинается здесь
          </motion.span>
          <motion.h1 className={display.className} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            style={{ fontSize: 'clamp(36px, 6.5vw, 78px)', fontWeight: 800, lineHeight: 1.02, marginBottom: 20, textShadow: '0 6px 30px rgba(0,0,0,0.18)' }}>
            Той, который<br />запомнят все
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.15 }}
            style={{ fontSize: 'clamp(16px,2vw,21px)', color: 'rgba(255,255,255,0.92)', maxWidth: 540, marginBottom: 34, lineHeight: 1.5 }}>
            Бюджет, гости — и готово. Мы соберём ресторан, тамаду, торт, шоу и десятки услуг под ваш праздник.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.25 }}
            style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <a href="#v2" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '16px 32px', borderRadius: 999, background: '#fff', color: '#F74D7B', fontWeight: 800, fontSize: 16, textDecoration: 'none', boxShadow: '0 14px 40px rgba(0,0,0,0.18)' }}>
              Создать мероприятие <ArrowRight size={18} />
            </a>
            <a href="#v2" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '16px 32px', borderRadius: 999, background: 'rgba(255,255,255,0.16)', color: '#fff', fontWeight: 700, fontSize: 16, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.4)' }}>
              Смотреть услуги
            </a>
          </motion.div>
        </div>

        {/* Bento-сетка услуг */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {SERVICES.map((s, i) => (
            <motion.div key={s} initial={{ opacity: 0, scale: 0.85 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              whileHover={{ y: -6, rotate: -2 }}
              style={{ gridColumn: i === 0 ? 'span 2' : 'span 1', aspectRatio: i === 0 ? '2 / 1' : '1', background: 'rgba(255,255,255,0.16)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.28)', borderRadius: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#fff' }}>
              <CatIcon slug={s} size={i === 0 ? 34 : 26} />
              <span style={{ fontSize: 12, fontWeight: 700 }}>{SERVICE_LABELS[s]}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────── Вариант 3 — Чистый современный (светлый + aurora + electric) ─────────── */
function Variant3() {
  const ACCENT = '#6D28D9';
  return (
    <section id="v3" style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '90px 20px', background: '#F7F6FB', color: '#15121C' }}>
      {/* Aurora-блобы */}
      <div aria-hidden className="tl-float" style={{ position: 'absolute', top: '-12%', left: '8%', width: 460, height: 460, borderRadius: '50%', background: 'radial-gradient(circle, rgba(109,40,217,0.35), transparent 65%)', filter: 'blur(40px)' }} />
      <div aria-hidden className="tl-float" style={{ animationDelay: '1.5s', position: 'absolute', bottom: '-15%', right: '6%', width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.3), transparent 65%)', filter: 'blur(40px)' }} />
      <div aria-hidden className="tl-float" style={{ animationDelay: '0.8s', position: 'absolute', top: '30%', right: '28%', width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.28), transparent 65%)', filter: 'blur(40px)' }} />

      <div style={{ position: 'relative', maxWidth: 980, margin: '0 auto', textAlign: 'center', width: '100%' }}>
        <motion.span initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: ACCENT, background: 'rgba(109,40,217,0.08)', border: '1px solid rgba(109,40,217,0.2)', padding: '8px 16px', borderRadius: 999, marginBottom: 26 }}>
          <Sparkles size={15} /> Умный подбор под бюджет
        </motion.span>
        <motion.h1 className={display.className} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
          style={{ fontSize: 'clamp(34px, 6vw, 70px)', fontWeight: 800, lineHeight: 1.05, marginBottom: 22 }}>
          Организуйте той{' '}
          <span style={{ background: 'linear-gradient(90deg,#6D28D9,#DB2777)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>без хлопот</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.15 }}
          style={{ fontSize: 'clamp(16px,2vw,20px)', color: '#5A5567', maxWidth: 600, margin: '0 auto 34px', lineHeight: 1.5 }}>
          Введите бюджет и количество гостей — система подберёт услуги и соберёт готовое мероприятие.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.25 }}
          style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 46 }}>
          <a href="#v3" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '16px 30px', borderRadius: 14, background: ACCENT, color: '#fff', fontWeight: 800, fontSize: 16, textDecoration: 'none', boxShadow: '0 12px 34px rgba(109,40,217,0.35)' }}>
            Создать мероприятие <ArrowRight size={18} />
          </a>
          <a href="#v3" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '16px 30px', borderRadius: 14, background: '#fff', color: '#15121C', fontWeight: 700, fontSize: 16, textDecoration: 'none', border: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 6px 18px rgba(0,0,0,0.05)' }}>
            Мои мероприятия
          </a>
        </motion.div>

        {/* Bento мини-карточки */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, maxWidth: 620, margin: '0 auto' }}>
          {SERVICES.slice(0, 4).map((s, i) => (
            <motion.div key={s} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} whileHover={{ y: -6 }}
              style={{ background: '#fff', borderRadius: 18, padding: '18px 12px', boxShadow: '0 8px 24px rgba(20,18,28,0.06)', border: '1px solid rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, rgba(109,40,217,0.12), rgba(219,39,119,0.1))', color: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CatIcon slug={s} size={24} />
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#15121C' }}>{SERVICE_LABELS[s]}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
