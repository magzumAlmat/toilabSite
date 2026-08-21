#!/bin/bash
# Новый коммит (журнал) + push на origin/main. Двойной клик из Finder.
cd "/Users/billionare/Documents/DEVELOPMENT/REACT/TOILABLANDING/toilab-landing" || exit 1

git config user.name  "magzumAlmat"
git config user.email "almat.magzum@gmail.com"

# На всякий случай снимаем возможную stale-блокировку.
rm -f .git/index.lock

echo "=== git add CLAUDE.md ==="
git add CLAUDE.md
git status --short

echo ""
echo "=== git commit ==="
git commit -m "docs(moderation): журнал CLAUDE.md — «Все типы», сортировка и поиск"

echo ""
echo "=== git push origin main ==="
echo "(если попросит логин/токен GitHub — введите прямо здесь, в этом окне)"
git push origin main

echo ""
echo "=== Итог: последние коммиты и состояние ветки ==="
git log --oneline -4
git status -sb | head -1

echo ""
echo "Готово. Можно закрыть это окно."
