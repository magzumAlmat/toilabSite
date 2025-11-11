// app/layout.js
'use client';

import { createContext, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, ChevronDown } from 'lucide-react';
import './globals.css';

// Создаём контекст
export const LangContext = createContext();

export default function RootLayout({ children }) {
  const [lang, setLang] = useState('ru');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const t = lang === 'ru' ? ru : kz;

  return (
    <html lang={lang}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&family=Playfair+Display:wght@700;800;900&display=swap" rel="stylesheet" />
        <title>Toilab — Всё для вашего тоя</title>
      </head>
      <body className="bg-gradient-to-b from-[#F5F0E9] to-[#E8DED3] text-[#4A3F35]" style={{ fontFamily: "'Roboto', sans-serif" }}>
        
        {/* Передаём lang и setLang через контекст */}
        <LangContext.Provider value={{ lang, setLang }}>
          {/* НАВИГАЦИЯ */}
          <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
            scrolled 
              ? 'bg-white/98 backdrop-blur-md shadow-lg' 
              : 'bg-white/95 backdrop-blur-sm shadow-md'
          }`}>
            <div className="max-w-7xl mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="relative overflow-hidden rounded-lg transition-transform group-hover:scale-105">
                  <Image 
                    src="/images/logo.png" 
                    alt="Toilab" 
                    width={100} 
                    height={80} 
                    className="drop-shadow transition-all group-hover:drop-shadow-lg" 
                  />
                </div>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-8">
                <Link href="/" className="text-base font-medium text-[#4A3F35] hover:text-[#8C7B6D] transition-colors duration-200 relative group">
                  {t.nav.home}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#8C7B6D] transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link href="/contacts" className="text-base font-medium text-[#4A3F35] hover:text-[#8C7B6D] transition-colors duration-200 relative group">
                  {t.nav.contacts}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#8C7B6D] transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link href="/privacy" className="text-base font-medium text-[#4A3F35] hover:text-[#8C7B6D] transition-colors duration-200 relative group">
                  {t.nav.privacy}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#8C7B6D] transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </nav>

              {/* Language Switcher */}
              <div className="hidden md:flex items-center gap-2 bg-gradient-to-r from-[#F5F0E9] to-[#E8DED3] rounded-full p-1.5 border border-[#D4C4B0]/30">
                <button 
                  onClick={() => setLang('kz')} 
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                    lang === 'kz' 
                      ? 'bg-gradient-to-r from-[#4A3F35] to-[#3A3028] text-white shadow-md' 
                      : 'text-[#4A3F35] hover:bg-white/50'
                  }`}
                >
                  ҚАЗ
                </button>
                <button 
                  onClick={() => setLang('ru')} 
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                    lang === 'ru' 
                      ? 'bg-gradient-to-r from-[#4A3F35] to-[#3A3028] text-white shadow-md' 
                      : 'text-[#4A3F35] hover:bg-white/50'
                  }`}
                >
                  РУС
                </button>
              </div>

              {/* Mobile Menu Button */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                className="md:hidden p-2 hover:bg-[#F5F0E9] rounded-lg transition-colors"
              >
                {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md shadow-xl border-t border-[#D4C4B0]/20 animate-in fade-in slide-in-from-top-2">
                <div className="px-6 py-4 space-y-3">
                  <Link 
                    href="/" 
                    className="block text-base font-medium text-[#4A3F35] hover:text-[#8C7B6D] transition-colors py-2" 
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t.nav.home}
                  </Link>
                  <Link 
                    href="/contacts" 
                    className="block text-base font-medium text-[#4A3F35] hover:text-[#8C7B6D] transition-colors py-2" 
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t.nav.contacts}
                  </Link>
                  <Link 
                    href="/privacy" 
                    className="block text-base font-medium text-[#4A3F35] hover:text-[#8C7B6D] transition-colors py-2" 
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t.nav.privacy}
                  </Link>
                  <div className="flex gap-2 pt-3 border-t border-[#D4C4B0]/20">
                    <button 
                      onClick={() => { setLang('kz'); setMobileMenuOpen(false); }} 
                      className={`flex-1 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                        lang === 'kz' 
                          ? 'bg-gradient-to-r from-[#4A3F35] to-[#3A3028] text-white' 
                          : 'text-[#4A3F35] bg-[#F5F0E9] hover:bg-[#E8DED3]'
                      }`}
                    >
                      ҚАЗ
                    </button>
                    <button 
                      onClick={() => { setLang('ru'); setMobileMenuOpen(false); }} 
                      className={`flex-1 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                        lang === 'ru' 
                          ? 'bg-gradient-to-r from-[#4A3F35] to-[#3A3028] text-white' 
                          : 'text-[#4A3F35] bg-[#F5F0E9] hover:bg-[#E8DED3]'
                      }`}
                    >
                      РУС
                    </button>
                  </div>
                </div>
              </div>
            )}
          </header>

          {/* TOP ORNAMENT */}
          <div className="bg-white py-3 md:py-4 border-b-4 md:border-b-8 border-[#4A3F35] mt-16 md:mt-20">
            <div className="max-w-7xl mx-auto px-4">
              {/* Ornament will be rendered here if needed */}
            </div>
          </div>

          <main>{children}</main>

          {/* BOTTOM ORNAMENT */}
          <div className="bg-white py-3 md:py-4 border-t-4 md:border-t-8 border-[#4A3F35]">
            <div className="max-w-7xl mx-auto px-4">
              {/* Ornament will be rendered here if needed */}
            </div>
          </div>

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
                    <li><Link href="/" className="opacity-80 hover:opacity-100 transition">{t.nav.home}</Link></li>
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
      </body>
    </html>
  );
}

// Тексты навигации
const ru = { 
  nav: { 
    home: "Главная", 
    contacts: "Контакты", 
    privacy: "Политика конфиденциальности" 
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
    contacts: "Байланыс", 
    privacy: "Құпиялылық саясаты" 
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
