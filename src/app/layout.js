// app/layout.js — корневой layout. Содержит только <html>/<body> и общие стили.
// Маркетинговая обвязка (шапка/футер) живёт в группе (site), раздел модерации —
// в /moderation со своей оболочкой MUI.
import './globals.css';

export const metadata = {
  title: 'Toilab — Всё для вашего тоя',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&family=Playfair+Display:wght@700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
