#!/bin/bash
# Снять stale-блокировку git и показать состояние (двойной клик из Finder).
cd "/Users/billionare/Documents/DEVELOPMENT/REACT/TOILABLANDING/toilab-landing" || exit 1

echo "=== Удаляю .git/index.lock (если остался) ==="
rm -f .git/index.lock && echo "index.lock убран (или его не было)"

echo ""
echo "=== Последние коммиты ==="
git log --oneline -4

echo ""
echo "=== git status ==="
git status

echo ""
echo "Готово. Коммит 9c1b938 — локальный HEAD. Чтобы он появился на GitHub, нужен git push."
echo "Можно закрыть это окно."
