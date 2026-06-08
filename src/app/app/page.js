'use client';

// Главный экран веб-версии: герой + каталог категорий (набор в корзину).
// Дизайн приближён к мобильному приложению (тёплый градиент, карточки-тайлы).
// Анимации — framer-motion через общие примитивы (_ui/motion), уважают reduced-motion.
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useApp } from './_lib/AppContext';
import { CATEGORIES, CITIES } from './_lib/categories';
import { CatIcon } from './_lib/CatIcon';
import { FadeIn, StaggerGrid, StaggerItem } from '../_ui/motion';

const hoverLift = { y: -5, transition: { duration: 0.18, ease: 'easeOut' } };
const tapPress = { scale: 0.97, transition: { duration: 0.1 } };

export default function AppHome() {
  const { city, setCity, lang, t, user, isAuth } = useApp();
  const isSupplier = isAuth && user?.roleId === 2;
  const isClient = isAuth && user?.roleId !== 2;

  // Город не выбран — экран выбора города (в духе мобильного старта).
  if (!city) {
    return (
      <FadeIn style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center', padding: '40px 0' }}>
        <div style={{ fontSize: 56, marginBottom: 8 }}>🍲</div>
        <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 8, color: '#4A3F35' }}>{t('Выберите город', 'Қаланы таңдаңыз')}</h1>
        <p style={{ color: '#6B5A4D', marginBottom: 28 }}>{t('Покажем услуги в вашем городе', 'Қалаңыздағы қызметтерді көрсетеміз')}</p>
        <StaggerGrid style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          {CITIES.map((c) => (
            <StaggerItem key={c} whileHover={hoverLift} whileTap={tapPress}>
              <button onClick={() => setCity(c)}
                style={{ padding: '14px 28px', borderRadius: 16, border: '1px solid #D4C4B0', background: '#fff', color: '#4A3F35', fontWeight: 700, fontSize: 18, cursor: 'pointer', boxShadow: '0 4px 16px rgba(74,63,53,0.06)' }}>
                {c}
              </button>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </FadeIn>
    );
  }

  return (
    <div>
      <style>{`
        .tl-cat { transition: box-shadow .18s ease, border-color .18s ease; }
        .tl-cat:hover { box-shadow: 0 12px 28px rgba(74,63,53,0.14); border-color: #B08D57; }
        .tl-cat:hover .tl-cat-ic { background: #B08D57; color: #fff; }
        .tl-hero-btn { transition: transform .15s ease, box-shadow .15s ease; }
        .tl-hero-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(0,0,0,0.18); }
      `}</style>

      {/* Баннер поставщика */}
      {isSupplier && (
        <FadeIn>
          <Link href="/app/supplier" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, textDecoration: 'none', background: 'linear-gradient(135deg,#4A3F35,#6B5A4D)', color: '#F5F0E9', borderRadius: 18, padding: '16px 20px', marginBottom: 22, boxShadow: '0 10px 26px rgba(74,63,53,0.18)' }}>
            <span style={{ fontWeight: 700 }}>{t('Вы вошли как поставщик — управляйте объявлениями', 'Сіз жеткізуші ретінде кірдіңіз — хабарландыруларды басқарыңыз')}</span>
            <span style={{ fontWeight: 800, whiteSpace: 'nowrap' }}>{t('Открыть кабинет', 'Кабинетті ашу')} →</span>
          </Link>
        </FadeIn>
      )}

      {/* Герой */}
      <FadeIn>
        <section style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg,#B08D57 0%,#9a7647 55%,#6B5A4D 100%)', color: '#fff', borderRadius: 24, padding: '30px 26px', marginBottom: 30, boxShadow: '0 16px 40px rgba(74,63,53,0.22)' }}>
          {/* декоративный орнамент-казан с лёгким «дыханием» */}
          <motion.div
            aria-hidden
            initial={{ opacity: 0, rotate: -8, scale: 0.9 }}
            animate={{ opacity: 0.12, rotate: -8, scale: 1 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            style={{ position: 'absolute', right: -10, top: -18, fontSize: 150, lineHeight: 1 }}
          >
            🍲
          </motion.div>
          <div style={{ position: 'relative', maxWidth: 620 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.18em', opacity: 0.85, marginBottom: 8 }}>TOILAB · {city}</div>
            <h1 style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.15, marginBottom: 10 }}>{t('Организуйте свой той', 'Тойыңызды ұйымдастырыңыз')}</h1>
            <p style={{ fontSize: 15, opacity: 0.92, lineHeight: 1.5, marginBottom: 20, maxWidth: 460 }}>
              {t('Выбирайте услуги, добавляйте в корзину и оформляйте мероприятие — с бюджетом и списком подарков.', 'Қызметтерді таңдап, себетке қосып, іс-шараны рәсімдеңіз — бюджет пен сыйлықтар тізімімен.')}
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {isClient && (
                <Link href="/app/events" className="tl-hero-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', color: '#4A3F35', fontWeight: 700, fontSize: 15, padding: '12px 22px', borderRadius: 999, textDecoration: 'none' }}>
                  {t('Мои мероприятия', 'Іс-шараларым')} →
                </Link>
              )}
              <Link href="/app/cart" className="tl-hero-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 700, fontSize: 15, padding: '12px 22px', borderRadius: 999, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.35)' }}>
                🛒 {t('Корзина', 'Себет')}
              </Link>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* Каталог категорий */}
      <FadeIn delay={0.05}>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4, color: '#4A3F35' }}>{t('Что вам понадобится?', 'Сізге не қажет?')}</h2>
        <p style={{ color: '#6B5A4D', fontSize: 14, marginBottom: 18 }}>{t('Выбирайте услуги и добавляйте 🛒 в корзину — затем оформите мероприятие.', 'Қызметтерді таңдап, 🛒 себетке қосыңыз — содан кейін іс-шараны рәсімдеңіз.')}</p>
      </FadeIn>

      <StaggerGrid style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 16 }}>
        {CATEGORIES.map((c) => (
          <StaggerItem key={c.slug} whileHover={hoverLift} whileTap={tapPress}>
            <Link href={`/app/catalog/${c.slug}`} className="tl-cat"
              style={{ textDecoration: 'none', color: '#4A3F35', background: '#fff', border: '1px solid rgba(212,196,176,0.7)', borderRadius: 20, padding: '20px 14px 18px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center', boxShadow: '0 4px 14px rgba(74,63,53,0.05)' }}>
              <span className="tl-cat-ic" style={{ width: 60, height: 60, borderRadius: 18, background: '#F3EADB', color: '#B08D57', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .18s ease, color .18s ease' }}><CatIcon slug={c.slug} size={28} /></span>
              <span style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.25 }}>{lang === 'kz' ? c.kz : c.ru}</span>
            </Link>
          </StaggerItem>
        ))}
      </StaggerGrid>
    </div>
  );
}
