#!/bin/bash
# Коммит изменений модерации в git (запускать двойным кликом из Finder).
cd "/Users/billionare/Documents/DEVELOPMENT/REACT/TOILABLANDING/toilab-landing" || exit 1

# На случай, если identity не задан — ставим как в истории репозитория.
git config user.name  "magzumAlmat"
git config user.email "almat.magzum@gmail.com"

echo "=== Текущий HEAD до коммита ==="
git log --oneline -3

echo ""
echo "=== git add (только файлы модерации) ==="
git add CLAUDE.md next.config.mjs \
  src/moderation/api/moderation.js \
  src/moderation/components/EntryDetailDialog.jsx \
  src/moderation/components/ModerationQueueView.jsx \
  src/moderation/resources.js \
  src/moderation/utils/format.js
git status --short

echo ""
echo "=== git commit ==="
git commit -m "feat(moderation): медиа и все поля в карточке, «Все типы», сортировка и поиск" -m "- Карточка записи: галерея фото/видео с лайтбоксом, все поля с понятными подписями и форматированием (даты/деньги/булевы/вложенные объекты/ссылки), время создания с фолбэком на data.created_at.
- Очередь: исправлен показ всех категорий при «Все типы» (бэкенд на type=all отдавал один тип) — теперь по counts тянутся все типы с записями и объединяются; полная пагинация.
- Добавлены сортировка по заголовкам (Название/Поставщик/Создано) и поиск по всем полям."

echo ""
echo "=== Результат (новый HEAD) ==="
git log --oneline -3

echo ""
echo "Готово. Можно закрыть это окно."
