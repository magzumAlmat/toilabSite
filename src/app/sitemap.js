// Генерирует /sitemap.xml (раньше отдавал 404): статические страницы лендинга,
// вход в приложение и страницы категорий каталога.
import { CATEGORIES } from './app/_lib/categories';

const BASE = 'https://toilab.kz';

export default function sitemap() {
  const now = new Date();

  const staticPages = [
    { path: '/app', priority: 1, changeFrequency: 'weekly' },
    { path: '/about', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/contacts', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' },
  ].map((p) => ({
    url: `${BASE}${p.path}`,
    lastModified: now,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));

  const categoryPages = CATEGORIES.map((c) => ({
    url: `${BASE}/app/catalog/${c.slug}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.6,
  }));

  return [...staticPages, ...categoryPages];
}
