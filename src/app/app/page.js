'use client';

// Главный экран веб-версии: герой + каталог категорий (набор в корзину).
// Дизайн приближён к мобильному приложению (тёплый градиент, карточки-тайлы).
// Анимации — framer-motion через общие примитивы (_ui/motion), уважают reduced-motion.
import Link from 'next/link';
import { useApp } from './_lib/AppContext';
import { CATEGORIES, CITIES } from './_lib/categories';
import { CatIcon } from './_lib/CatIcon';
import RegisterForm from './_lib/RegisterForm';
import { FadeIn, StaggerGrid, StaggerItem } from '../_ui/motion';
import { PremiumHero, GoldButton, GhostButton } from '../_ui/premium';

const SERVICE_LABELS_RU = { restaurants: 'Рестораны', cakes: 'Торты', flowers: 'Цветы', tamada: 'Тамада', transport: 'Транспорт', program: 'Шоу', 'photo-video': 'Фото', suvenirs: 'Подарки' };
const SERVICE_LABELS_KZ = { restaurants: 'Мейрамхана', cakes: 'Торт', flowers: 'Гүлдер', tamada: 'Тамада', transport: 'Көлік', program: 'Шоу', 'photo-video': 'Фото', suvenirs: 'Сыйлық' };

const hoverLift = { y: -5, transition: { duration: 0.18, ease: 'easeOut' } };
const tapPress = { scale: 0.97, transition: { duration: 0.1 } };

export default function AppHome() {
  const { city, setCity, lang, t, user, isAuth, ready } = useApp();
  const isSupplier = isAuth && user?.roleId === 2;
  const isClient = isAuth && user?.roleId !== 2;

  // Ждём проверку токена, чтобы не мигать формой для уже залогиненных.
  if (!ready) return null;

  // Гость: вместо каталога — экран ценности + витрина услуг + лёгкая регистрация.
  // Функционал (создание мероприятия) доступен только после входа.
  if (!isAuth) {
    const showcase = CATEGORIES.slice(0, 8);
    return (
      <section className="tl-dark tl-grid tl-spot" style={{ position: 'relative', overflow: 'hidden', borderRadius: 'var(--r-lg)', padding: 'clamp(26px,5vw,52px) clamp(20px,4vw,44px)', boxShadow: 'var(--shadow-lg)' }}>
        <style>{`
          @media (min-width: 980px) { .tl-guest { grid-template-columns: 1.05fr 0.95fr !important; gap: 44px !important; align-items: center; } }
        `}</style>
        <div className="tl-guest" style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr', gap: 32 }}>

          {/* Левая колонка — ценность и витрина услуг */}
          <FadeIn>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--gold)', background: 'rgba(212,196,176,0.08)', border: '1px solid rgba(212,196,176,0.4)', padding: '7px 14px', borderRadius: 'var(--r-pill)', marginBottom: 18 }}>
              {(city ? `${city.toUpperCase()} · ` : '') + t('МАРКЕТПЛЕЙС ДЛЯ ТОЯ', 'ТОЙҒА АРНАЛҒАН МАРКЕТПЛЕЙС')}
            </span>
            <h1 className="tl-display" style={{ fontSize: 'clamp(28px, 4.6vw, 46px)', fontWeight: 800, lineHeight: 1.08, color: 'var(--on-dark)', marginBottom: 14 }}>
              {t('Соберём ваш той', 'Тойыңызды жинаймыз')} <span className="tl-gold-text">{t('под бюджет', 'бюджетке сай')}</span>
            </h1>
            <p style={{ fontSize: 16, lineHeight: 1.55, color: 'var(--on-dark-2)', marginBottom: 24, maxWidth: 520 }}>
              {t('Укажите бюджет и число гостей — мы подберём ресторан, тамаду, торт, цветы, транспорт и всё остальное. Без беготни и десятков чатов.',
                 'Бюджет пен қонақ санын көрсетіңіз — біз мейрамхана, тамада, торт, гүл, көлік және басқасын таңдаймыз. Жүгірмей-ақ.')}
            </p>

            {/* Витрина категорий (на тёмном стекле) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, maxWidth: 440, marginBottom: 22 }}>
              {showcase.map((c) => (
                <div key={c.slug} title={lang === 'kz' ? c.kz : c.ru} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, textAlign: 'center' }}>
                  <span style={{ width: 52, height: 52, borderRadius: 'var(--r-pill)', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(212,196,176,0.22)', color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                    <CatIcon slug={c.slug} size={24} />
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--on-dark-2)', lineHeight: 1.2 }}>{lang === 'kz' ? c.kz : c.ru}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 18px', fontSize: 13, fontWeight: 700, color: 'var(--on-dark-2)' }}>
              <span><span style={{ color: 'var(--gold)' }}>✓</span> {t('Проверенные поставщики', 'Тексерілген жеткізушілер')}</span>
              <span><span style={{ color: 'var(--gold)' }}>✓</span> {t('Алматы · Астана · Шымкент', 'Алматы · Астана · Шымкент')}</span>
              <span><span style={{ color: 'var(--gold)' }}>✓</span> {t('Бюджет и список подарков', 'Бюджет пен сыйлықтар тізімі')}</span>
            </div>
          </FadeIn>

          {/* Правая колонка — белая карточка регистрации */}
          <FadeIn delay={0.1}>
            <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-lg)', border: '1px solid var(--line)', boxShadow: '0 24px 60px rgba(0,0,0,0.35)', padding: '26px 24px' }}>
              <RegisterForm
                compact
                heading={t('Создайте аккаунт', 'Аккаунт жасаңыз')}
                subtitle={t('Это займёт меньше минуты.', 'Бір минуттан аз уақыт алады.')}
                loginRedirect="/app"
              />
            </div>
          </FadeIn>
        </div>
      </section>
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
        .tl-step { transition: box-shadow .2s ease, transform .2s ease; }
        .tl-step:hover { box-shadow: var(--shadow); transform: translateY(-2px); }
      `}</style>

      {/* Баннер поставщика */}
      {isSupplier && (
        <FadeIn>
          <Link href="/app/supplier" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, textDecoration: 'none', background: 'linear-gradient(135deg, var(--brand), #6B5A4D)', color: 'var(--on-brand)', borderRadius: 'var(--r)', padding: '16px 20px', marginBottom: 22, boxShadow: 'var(--shadow)' }}>
            <span style={{ fontWeight: 700 }}>{t('Вы вошли как поставщик — управляйте объявлениями', 'Сіз жеткізуші ретінде кірдіңіз — хабарландыруларды басқарыңыз')}</span>
            <span style={{ fontWeight: 800, whiteSpace: 'nowrap' }}>{t('Открыть кабинет', 'Кабинетті ашу')} →</span>
          </Link>
        </FadeIn>
      )}

      {/* Премиум-герой (Вариант 1) */}
      <PremiumHero
        badge={(city ? `${city.toUpperCase()} · ` : '') + t('ТОЙ-МАРКЕТПЛЕЙС №1', 'ТОЙ-МАРКЕТПЛЕЙС №1')}
        title={t('Соберём ваш той', 'Тойыңызды жинаймыз')}
        accent={t('под бюджет — за минуту', 'бюджетке сай — бір минутта')}
        subtitle={t('Укажите бюджет и число гостей — подберём ресторан, тамаду, торт, цветы, транспорт и всё остальное.', 'Бюджет пен қонақ санын көрсетіңіз — мейрамхана, тамада, торт, гүл, көлік және басқасын таңдаймыз.')}
        primary={isSupplier
          ? <GoldButton href="/app/supplier">{t('Открыть кабинет', 'Кабинетті ашу')}</GoldButton>
          : <GoldButton href="/app/events/new">{t('Создать мероприятие', 'Іс-шара жасау')}</GoldButton>}
        secondary={isClient ? <GhostButton href="/app/events">{t('Мои мероприятия', 'Іс-шараларым')}</GhostButton> : null}
        chips={CATEGORIES.slice(0, 6).map((c) => ({ slug: c.slug, label: (lang === 'kz' ? SERVICE_LABELS_KZ : SERVICE_LABELS_RU)[c.slug] || c.ru }))}
      />

      {/* Создание мероприятия: бюджет → гости → автоподбор услуг → готово */}
      {isClient && (
        <>
          <FadeIn delay={0.05}>
            <h2 className="tl-display" style={{ fontSize: 26, fontWeight: 700, marginBottom: 4, color: 'var(--ink)' }}>{t('Как это работает', 'Қалай жұмыс істейді')}</h2>
            <p style={{ color: 'var(--ink-2)', fontSize: 15, marginBottom: 18 }}>{t('Три шага — и готовое мероприятие. Услуги подберём сами под ваш бюджет.', 'Үш қадам — дайын іс-шара. Қызметтерді бюджетке сай өзіміз таңдаймыз.')}</p>
          </FadeIn>

          <StaggerGrid style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 26 }}>
            {[
              { n: '1', title: t('Бюджет', 'Бюджет'), desc: t('Укажите, сколько готовы потратить.', 'Қанша жұмсайтыныңызды көрсетіңіз.') },
              { n: '2', title: t('Гости', 'Қонақтар'), desc: t('Сколько человек вы ждёте.', 'Қанша адам күтесіз.') },
              { n: '3', title: t('Готово', 'Дайын'), desc: t('Мы подберём услуги и создадим мероприятие.', 'Біз қызметтерді таңдап, іс-шара жасаймыз.') },
            ].map((s) => (
              <StaggerItem key={s.n}>
                <div className="tl-step" style={{ height: '100%', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r)', padding: '22px 20px', boxShadow: 'var(--shadow-sm)' }}>
                  <div className="tl-display" style={{ width: 44, height: 44, borderRadius: 'var(--r-pill)', background: 'linear-gradient(135deg, var(--accent), var(--accent-600))', color: '#fff', fontWeight: 700, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, boxShadow: '0 6px 16px rgba(74,63,53,0.25)' }}>{s.n}</div>
                  <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--ink)', marginBottom: 4 }}>{s.title}</div>
                  <div style={{ color: 'var(--ink-2)', fontSize: 14, lineHeight: 1.45 }}>{s.desc}</div>
                </div>
              </StaggerItem>
            ))}
          </StaggerGrid>

          <FadeIn delay={0.1}>
            <GoldButton href="/app/events/new">{t('Создать мероприятие', 'Іс-шара жасау')}</GoldButton>
          </FadeIn>
        </>
      )}
    </div>
  );
}
