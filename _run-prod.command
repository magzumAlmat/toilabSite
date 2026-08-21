#!/bin/bash
# Запуск production-версии Toilab (build + start) на порту 5001.
cd "/Users/billionare/Documents/DEVELOPMENT/REACT/TOILABLANDING/toilab-landing" || exit 1
echo "=== Освобождаю порт 5001 (если занят) ==="
lsof -ti:5001 | xargs kill -9 2>/dev/null
echo "=== npm run build ==="
npm run build || { echo "BUILD FAILED"; exit 1; }
echo "=== npm run start ==="
npm run start
