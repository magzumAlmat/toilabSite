import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  // Фиксируем корень workspace на этом проекте: в системе несколько lockfile,
  // и без этого Next может выбрать неверный корневой каталог.
  turbopack: {
    root: __dirname,
  },
  // Прокси для веб-версии приложения (/app): браузер ходит на same-origin
  // /toilab-api/*, а Next сервер-сайд проксирует на api.toilab.kz — без CORS.
  async rewrites() {
    return [
      {
        source: '/toilab-api/:path*',
        destination: 'https://api.toilab.kz/:path*',
      },
    ];
  },
};

export default nextConfig;
