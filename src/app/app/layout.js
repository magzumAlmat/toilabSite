// Серверный layout раздела /app: задаёт metadata для приложения и оборачивает
// контент в клиентскую оболочку AppShell (провайдеры + шапка).
import AppShell from './_lib/AppShell';

export const metadata = {
  title: 'Каталог услуг для тоя',
  description:
    'Веб-версия Toilab: каталог услуг для тоя и торжеств — рестораны, тамада, торты, цветы, транспорт, фото и видео. Соберите мероприятие в один клик.',
  alternates: { canonical: '/app' },
  openGraph: {
    title: 'Toilab — каталог услуг для тоя',
    description: 'Каталог услуг для тоя и торжеств: рестораны, тамада, торты, цветы, транспорт и другое.',
    url: 'https://toilab.kz/app',
    images: ['/images/logo.png'],
  },
};

export default function AppLayout({ children }) {
  return <AppShell>{children}</AppShell>;
}
