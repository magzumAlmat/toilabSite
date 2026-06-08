'use client';

// Главный экран веб-версии: герой + каталог категорий (набор в корзину).
// Дизайн приближён к мобильному приложению (тёплый градиент, карточки-тайлы).
// Анимации — framer-motion через общие примитивы (_ui/motion), уважают reduced-motion.
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useApp } from './_lib/AppContext';
import { CITIES } from './_lib/categories';
import RegisterForm from './_lib/RegisterForm';
import { FadeIn, StaggerGrid, StaggerItem } from '../_ui/motion';

const hoverLift = { y: -5, transition: { duration: 0.18, ease: 'easeOut' } };
const tapPress = { scale: 0.97, transition: { duration: 0.1 } };

export default function AppHome() {
  const { city, setCity, lang, t, user, isAuth, ready } = useApp();
  const isSupplier = isAuth && user?.roleId === 2;
  const isClient = isAuth && user?.roleId !== 2;

  // Ждём проверку токена, чтобы не мигать формой для уже залогиненных.
  if (!ready) return null;

  // Гость: вместо каталога — призыв и форма регистрации/входа.
  // Функционал (каталог, корзина, мероприятия) доступен только после входа.
  if (!isAuth) {
    return (
      <FadeIn style={{ maxWidth: 520, margin: '0 auto', padding: '4px 0 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <h1 style={{ fontSize: 27, fontWeight: 900, color: '#2C2420', marginBottom: 8 }}>
            {t('Войдите, чтобы начать', 'Бастау үшін кіріңіз')}
          </h1>
          <p style={{ color: '#6B5A4D', fontSize: 15, lineHeight: 1.5 }}>
            {t('Зарегистрируйтесь или войдите — и выбирайте услуги, добавляйте в корзину и собирайте мероприятие с бюджетом и списком подарков.',
               'Тіркеліп немесе кіріп — қызметтерді таңдап, себетке қосып, бюджет пен сыйлықтар тізімімен іс-шара жинаңыз.')}
          </p>
        </div>
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 6px 20px rgba(0,0,0,0.07)', padding: '24px 22px' }}>
          <RegisterForm heading={null} subtitle={null} loginRedirect="/app" />
        </div>
      </FadeIn>
    );
  }

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
                <>
                  <Link href="/app/events/new" className="tl-hero-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', color: '#4A3F35', fontWeight: 800, fontSize: 15, padding: '12px 22px', borderRadius: 999, textDecoration: 'none' }}>
                    {t('Создать мероприятие', 'Іс-шара жасау')} →
                  </Link>
                  <Link href="/app/events" className="tl-hero-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 700, fontSize: 15, padding: '12px 22px', borderRadius: 999, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.35)' }}>
                    {t('Мои мероприятия', 'Іс-шараларым')}
                  </Link>
                </>
              )}
              {isSupplier && (
                <Link href="/app/supplier" className="tl-hero-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', color: '#4A3F35', fontWeight: 800, fontSize: 15, padding: '12px 22px', borderRadius: 999, textDecoration: 'none' }}>
                  {t('Открыть кабинет', 'Кабинетті ашу')} →
                </Link>
              )}
            </div>
          </div>
        </section>
      </FadeIn>

      {/* Создание мероприятия: бюджет → гости → автоподбор услуг → готово */}
      {isClient && (
        <>
          <FadeIn delay={0.05}>
            <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 4, color: '#2C2420' }}>{t('Как это работает', 'Қалай жұмыс істейді')}</h2>
            <p style={{ color: '#6B5A4D', fontSize: 14, marginBottom: 18 }}>{t('Укажите бюджет и число гостей — мы сами подберём услуги и соберём мероприятие.', 'Бюджет пен қонақ санын көрсетіңіз — біз қызметтерді өзіміз таңдап, іс-шара жинаймыз.')}</p>
          </FadeIn>

          <StaggerGrid style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
            {[
              { n: '1', title: t('Бюджет', 'Бюджет'), desc: t('Укажите, сколько готовы потратить.', 'Қанша жұмсайтыныңызды көрсетіңіз.') },
              { n: '2', title: t('Гости', 'Қонақтар'), desc: t('Сколько человек вы ждёте.', 'Қанша адам күтесіз.') },
              { n: '3', title: t('Готово', 'Дайын'), desc: t('Мы подберём услуги и создадим мероприятие.', 'Біз қызметтерді таңдап, іс-шара жасаймыз.') },
            ].map((s) => (
              <StaggerItem key={s.n}>
                <div style={{ height: '100%', background: '#fff', border: '1px solid rgba(0,0,0,0.04)', borderRadius: 16, padding: '20px 18px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 999, background: '#F3EADB', color: '#B08D57', fontWeight: 900, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>{s.n}</div>
                  <div style={{ fontWeight: 800, fontSize: 16, color: '#2C2420', marginBottom: 4 }}>{s.title}</div>
                  <div style={{ color: '#6B5A4D', fontSize: 14, lineHeight: 1.4 }}>{s.desc}</div>
                </div>
              </StaggerItem>
            ))}
          </StaggerGrid>

          <FadeIn delay={0.1}>
            <Link href="/app/events/new" className="tl-hero-btn"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#4A3F35', color: '#F5F0E9', fontWeight: 800, fontSize: 16, padding: '15px 30px', borderRadius: 999, textDecoration: 'none', boxShadow: '0 8px 22px rgba(74,63,53,0.22)' }}>
              {t('Создать мероприятие', 'Іс-шара жасау')} →
            </Link>
          </FadeIn>
        </>
      )}
    </div>
  );
}
