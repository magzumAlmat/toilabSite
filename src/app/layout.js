// app/layout.js — корневой layout. Содержит только <html>/<body> и общие стили.
// Маркетинговая обвязка (шапка/футер) живёт в группе (site), раздел модерации —
// в /moderation со своей оболочкой MUI.
import './globals.css';
import { Inter } from 'next/font/google';
import Providers from './_ui/Providers';

// Apple-стиль: на устройствах Apple используется системный SF Pro
// (-apple-system / BlinkMacSystemFont, см. globals.css), а Inter — кросс-
// платформенный фолбэк (почти неотличим от SF на Windows/Android). Кириллица есть.
const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL('https://toilab.kz'),
  title: {
    default: 'Toilab — Всё для вашего тоя',
    template: '%s — Toilab',
  },
  description:
    'Toilab — сервис для организации тоя и любых торжеств в Казахстане: рестораны, тамада, торты, цветы, транспорт, фото и видео и другие услуги в одном месте.',
  keywords: ['той', 'свадьба', 'мероприятие', 'ресторан', 'тамада', 'Toilab', 'Алматы', 'Астана', 'Шымкент'],
  applicationName: 'Toilab',
  formatDetection: { telephone: false, email: false, address: false },
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: 'Toilab',
    locale: 'ru_RU',
    url: 'https://toilab.kz',
    title: 'Toilab — Всё для вашего тоя',
    description:
      'Сервис для организации тоя и любых торжеств в Казахстане: рестораны, тамада, торты, цветы, транспорт и другие услуги в одном месте.',
    images: [{ url: '/images/logo.png', width: 780, height: 577, alt: 'Toilab' }],
  },
  twitter: {
    card: 'summary',
    title: 'Toilab — Всё для вашего тоя',
    description: 'Сервис для организации тоя и любых торжеств в Казахстане.',
    images: ['/images/logo.png'],
  },
};

export const viewport = {
  themeColor: '#4A3F35',
  colorScheme: 'light',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru" className={inter.variable}>
      <body><Providers>{children}</Providers></body>
    </html>
  );
}
