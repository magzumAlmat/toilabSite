// app/privacy/page.js
'use client';

import { useContext } from 'react';
import { LangContext } from '../layout';

export default function Privacy() {
  const { lang } = useContext(LangContext);
  const t = lang === 'ru' ? ru : kz;

  return (
    <section className="py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-5xl font-black text-center mb-12">{t.title}</h1>
        <div className="prose prose-lg mx-auto text-gray-700 max-w-3xl">
          <p>{t.text}</p>
          <p>{t.request}</p>
          <p className="text-sm text-gray-500 text-center mt-10">{t.updated}</p>
        </div>
      </div>
    </section>
  );
}

const ru = {
  title: "Политика конфиденциальности",
  text: "Мы собираем только необходимые данные для работы приложения: имя, телефон, email. Все данные защищены и не передаются третьим лицам без вашего согласия.",
  request: "Вы можете запросить удаление данных в любой момент, написав на support@toilab.kz.",
  updated: "Последнее обновление: 11 ноября 2025 г."
};

const kz = {
  title: "Құпиялылық саясаты",
  text: "Біз тек қолданбаның жұмысына қажетті деректерді жинаймыз: аты, телефон, email. Барлық деректер қорғалған және сіздің келісімсіз үшінші тұлғаларға берілмейді.",
  request: "Деректерді кез келген уақытта жоюды сұрай аласыз, support@toilab.kz жазыңыз.",
  updated: "Соңғы жаңарту: 2025 жылғы 11 қараша"
};