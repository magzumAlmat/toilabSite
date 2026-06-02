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
};

export default nextConfig;
