// Серверный layout страницы категории каталога: задаёт уникальные title/description/
// canonical под каждую категорию (раньше у всех страниц был одинаковый <title>).
import { CATEGORY_BY_SLUG } from '../../_lib/categories';

export async function generateMetadata({ params }) {
  const { category } = await params;
  const c = CATEGORY_BY_SLUG[category];
  if (!c) return { title: 'Каталог' };

  const title = `${c.ru} для тоя`;
  const description = `${c.ru} для тоя и торжеств на Toilab — выбирайте, сравнивайте цены и добавляйте в мероприятие. Алматы, Астана, Шымкент.`;
  const url = `https://toilab.kz/app/catalog/${category}`;

  return {
    // absolute — иначе шаблон «%s — Toilab» не доходит через промежуточный /app layout.
    title: { absolute: `${title} — Toilab` },
    description,
    alternates: { canonical: url },
    openGraph: { title: `${title} — Toilab`, description, url, images: ['/images/logo.png'] },
  };
}

export default function CategoryLayout({ children }) {
  return children;
}
