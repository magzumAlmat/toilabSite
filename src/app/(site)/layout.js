// app/(site)/layout.js — маркетинговая оболочка лендинга (шапка, футер, переключатель языка).
'use client';

import { createContext } from 'react';
import Link from 'next/link';
import { useApp } from '../app/_lib/AppContext';
import MainHeader from '../_ui/MainHeader';

// Создаём контекст
export const LangContext = createContext();

export default function SiteLayout({ children }) {
  // Язык/авторизация — из общего AppContext (поднят в корень), чтобы шапка и
  // контент были одинаковыми с /app и язык не сбрасывался при переходах.
  const { lang, setLang } = useApp();
  const t = lang === 'ru' ? ru : kz;

  return (
    <div
      className="bg-gradient-to-b from-[#F5F0E9] to-[#E8DED3] text-[#4A3F35] min-h-screen"
      style={{ fontFamily: 'var(--font-ui)' }}
    >
      {/* Передаём lang и setLang через контекст */}
      <LangContext.Provider value={{ lang, setLang }}>
        {/* ЕДИНАЯ ШАПКА — та же, что в /app (один компонент, общий контекст) */}
        <MainHeader />

        <main>{children}</main>

        {/* FOOTER */}
        <footer className="bg-[#4A3F35] text-[#F5F0E9] py-8 md:py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-bold mb-4">{t.footer.about}</h3>
                <p className="text-sm opacity-80 leading-relaxed">{t.footer.aboutText}</p>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-4">{t.footer.links}</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/about" className="opacity-80 hover:opacity-100 transition">{t.nav.home}</Link></li>
                  <li><Link href="/app" className="opacity-80 hover:opacity-100 transition">{t.nav.openApp}</Link></li>
                  <li><Link href="/contacts" className="opacity-80 hover:opacity-100 transition">{t.nav.contacts}</Link></li>
                  <li><Link href="/privacy" className="opacity-80 hover:opacity-100 transition">{t.nav.privacy}</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-4">{t.footer.follow}</h3>
                <p className="text-sm opacity-80">{t.footer.followText}</p>
              </div>
            </div>
            <div className="border-t border-[#F5F0E9]/20 pt-8 text-center text-sm opacity-70">
              <p>&copy; 2025 Toilab. {t.footer.rights}</p>
            </div>
          </div>
        </footer>
      </LangContext.Provider>
    </div>
  );
}

// Тексты навигации
const ru = {
  nav: {
    home: "Главная",
    about: "О нас",
    contacts: "Контакты",
    privacy: "Политика конфиденциальности",
    openApp: "Открыть приложение"
  },
  footer: {
    about: "О нас",
    aboutText: "Toilab — это приложение для организации мероприятий. Мы помогаем молодожёнам найти всё необходимое в одном месте.",
    links: "Ссылки",
    follow: "Следите за нами",
    followText: "Подпишитесь на наши социальные сети для последних новостей.",
    rights: "Все права защищены."
  }
};

const kz = {
  nav: {
    home: "Басты бет",
    about: "Біз туралы",
    contacts: "Байланыс",
    privacy: "Құпиялылық саясаты",
    openApp: "Қолданбаны ашу"
  },
  footer: {
    about: "Біз туралы",
    aboutText: "Toilab — тойларды ұйымдастыру үшін қолданба. Біз жас ұжымдарға бір жерде барлық қажеттіліктерін табуға көмектесеміз.",
    links: "Сілтемелер",
    follow: "Бізді ұстаңыз",
    followText: "Соңғы жаңалықтар үшін біздің әлеуметтік желілерге жазылыңыз.",
    rights: "Барлық құқықтар қорғалған."
  }
};
