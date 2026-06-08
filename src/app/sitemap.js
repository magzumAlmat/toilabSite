// Генерирует /sitemap.xml. Включаем ТОЛЬКО реально публичные страницы.
// Каталог (/app/catalog/*) и карточки услуг сейчас закрыты за логином (фронт
// показывает экран входа, часть API отдаёт 401) — их в sitemap НЕ кладём,
// иначе Google индексирует логин-стену (тонкий/cloaked-контент). Когда каталог
// станет публичным — сюда вернутся категории и детальные страницы.
const BASE = 'https://toilab.kz';

export default function sitemap() {
  const now = new Date();

  return [
    { path: '/app', priority: 1.0, changeFrequency: 'weekly' },   // главная (точка входа)
    { path: '/about', priority: 0.8, changeFrequency: 'monthly' }, // о нас
    { path: '/contacts', priority: 0.5, changeFrequency: 'yearly' },
    { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' },
  ].map((p) => ({
    url: `${BASE}${p.path}`,
    lastModified: now,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));
}
