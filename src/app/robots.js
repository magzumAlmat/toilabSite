// Генерирует /robots.txt (раньше отдавал 404). Закрываем приватные/требующие
// логина разделы, остальное — открыто; указываем sitemap.
const BASE = 'https://toilab.kz';

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // /app/catalog и /app/wishlist сейчас за логином — открыть, когда каталог станет публичным.
        disallow: ['/moderation', '/app/cart', '/app/events', '/app/supplier', '/app/wishlist', '/app/catalog', '/app/login', '/app/register', '/toilab-api'],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
