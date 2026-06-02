<h1 align="center">🖥️ Toilab — Company Website</h1>

<p align="center">
  <img src="https://img.shields.io/badge/status-active-success?style=flat-square"/>
  <img src="https://img.shields.io/badge/type-frontend-61DAFB?style=flat-square"/>
  <img src="https://img.shields.io/github/last-commit/magzumAlmat/toilabSite?style=flat-square"/>
  <img src="https://img.shields.io/github/languages/top/magzumAlmat/toilabSite?style=flat-square"/>
</p>

<p align="center"><i>Corporate website for Toilab company showcasing services, portfolio, and contact information.</i></p>

---

## 🛠️ Tech Stack

![React](https://img.shields.io/badge/-React-informational?style=flat-square) ![JavaScript](https://img.shields.io/badge/-JavaScript-informational?style=flat-square) ![CSS3](https://img.shields.io/badge/-CSS3-informational?style=flat-square) ![React Router](https://img.shields.io/badge/-React_Router-informational?style=flat-square)

## ✨ Features

- ✅ Responsive landing page
- ✅ Service showcase sections
- ✅ Portfolio gallery
- ✅ Contact form
- ✅ Smooth animations

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (or Python 3.8+ for Python projects)
- npm or yarn



### Installation

```bash
# Clone the repository
git clone https://github.com/magzumAlmat/toilabSite.git

# Navigate to the project
cd toilabSite

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run the application
npm start
```

## 🛡️ Раздел модерации (`/moderation`)

В сайт встроен веб-сервис модерации новых записей поставщиков (рестораны, торты,
транспорт и т.д.). Администратор (`roleId = 1`) видит очередь записей, открывает
карточку и **одобряет** или **отклоняет** её с указанием причины.

- `/moderation` — очередь модерации (защищено, требует входа администратора)
- `/moderation/login` — вход для модераторов

Реализован на MUI поверх Next.js App Router, со своей оболочкой (без маркетинговой
шапки/футера лендинга — те живут в группе маршрутов `(site)`).

**Аутентификация** — реальный бэкенд JWT: `POST /api/auth/login` → токен,
`GET /api/auth/getAuthentificatedUserInfo` для проверки `roleId === 1`. Токен
хранится в `localStorage`, подставляется в `Authorization: Bearer` ко всем запросам.

Настройки (`.env.local`, см. `.env.example`):

| Переменная                  | Значение                | Описание                                                       |
| --------------------------- | ----------------------- | -------------------------------------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL`  | `https://api.toilab.kz` | Базовый URL бэкенда                                            |
| `NEXT_PUBLIC_USE_MOCK`      | `true` / `false`        | `true` — работа на мок-данных без бэкенда (вход с любыми данными) |

Структура: `src/moderation/` (api, auth, components, тема, ресурсы) +
маршруты `src/app/moderation/`. Точка интеграции с бэкендом модерации —
`src/moderation/api/moderation.js` (там же контракт эндпоинтов в комментариях).

## 👤 Author

**Almat Magzum** — Full-Stack JavaScript Developer

- GitHub: [@magzumAlmat](https://github.com/magzumAlmat)
- Email: almat.magzum@gmail.com
- Location: Almaty, Kazakhstan

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
