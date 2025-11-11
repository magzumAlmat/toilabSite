// app/layout.js
'use client';

import { createContext, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import './globals.css';

// Создаём контекст
export const LangContext = createContext();

export default function RootLayout({ children }) {
  const [lang, setLang] = useState('ru');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const t = lang === 'ru' ? ru : kz;

  return (
    <html lang={lang}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap" rel="stylesheet" />
        <title>Toilab — Всё для вашего тоя</title>
      </head>
      <body className="bg-gradient-to-b from-[#F5F0E9] to-[#E8DED3] text-[#4A3F35]" style={{ fontFamily: "'Roboto', sans-serif" }}>
        
        {/* Передаём lang и setLang через контекст */}
        <LangContext.Provider value={{ lang, setLang }}>
          {/* НАВИГАЦИЯ */}
          <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-md">
            <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <Image src="/images/logo.png" alt="ToiLab" width={100} height={80} className="drop-shadow" />
                {/* <span className="text-2xl font-black text-[#4A3F35]">Toilab</span> */}
              </Link>

              <nav className="hidden md:flex items-center gap-8">
                <Link href="/" className="text-lg font-medium hover:text-[#8C7B6D] transition">{t.nav.home}</Link>
                <Link href="/contacts" className="text-lg font-medium hover:text-[#8C7B6D] transition">{t.nav.contacts}</Link>
                <Link href="/privacy" className="text-lg font-medium hover:text-[#8C7B6D] transition">{t.nav.privacy}</Link>
              </nav>

              <div className="hidden md:flex items-center gap-2 bg-[#F5F0E9] rounded-full p-1">
                <button onClick={() => setLang('kz')} className={`px-4 py-1.5 rounded-full text-sm font-bold transition ${lang === 'kz' ? 'bg-[#4A3F35] text-white' : 'text-[#4A3F35]'}`}>ҚАЗ</button>
                <button onClick={() => setLang('ru')} className={`px-4 py-1.5 rounded-full text-sm font-bold transition ${lang === 'ru' ? 'bg-[#4A3F35] text-white' : 'text-[#4A3F35]'}`}>РУС</button>
              </div>

              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2">
                {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>

            {mobileMenuOpen && (
              <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t">
                <div className="px-6 py-4 space-y-4">
                  <Link href="/" className="block text-lg font-medium" onClick={() => setMobileMenuOpen(false)}>{t.nav.home}</Link>
                  <Link href="/contacts" className="block text-lg font-medium" onClick={() => setMobileMenuOpen(false)}>{t.nav.contacts}</Link>
                  <Link href="/privacy" className="block text-lg font-medium" onClick={() => setMobileMenuOpen(false)}>{t.nav.privacy}</Link>
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => { setLang('kz'); setMobileMenuOpen(false); }} className={`px-4 py-1.5 rounded-full text-sm font-bold ${lang === 'kz' ? 'bg-[#4A3F35] text-white' : 'text-[#4A3F35] bg-[#F5F0E9]'}`}>ҚАЗ</button>
                    <button onClick={() => { setLang('ru'); setMobileMenuOpen(false); }} className={`px-4 py-1.5 rounded-full text-sm font-bold ${lang === 'ru' ? 'bg-[#4A3F35] text-white' : 'text-[#4A3F35] bg-[#F5F0E9]'}`}>РУС</button>
                  </div>
                </div>
              </div>
            )}
          </header>

          {/* ОРНАМЕНТ СВЕРХУ */}
          <div className="bg-white py-4 border-b-8 border-[#4A3F35] mt-20">
            <div className="max-w-7xl mx-auto px-4">
              {/* <svg className="w-full h-16" viewBox="0 0 1200 60" preserveAspectRatio="none">
                <path d="M0,30 Q100,0 200,30 T400,30 T600,30 T800,30 T1000,30 T1200,30" stroke="#4A3F35" strokeWidth="4" fill="none" />
                <path d="M0,30 Q100,60 200,30 T400,30 T600,30 T800,30 T1000,30 T1200,30" stroke="#4A3F35" strokeWidth="4" fill="none" />
              </svg> */}
            </div>
          </div>

          <main>{children}</main>

          {/* ОРНАМЕНТ СНИЗУ */}
          <div className="bg-white py-4 border-t-8 border-[#4A3F35]">
            <div className="max-w-7xl mx-auto px-4">
              {/* <svg className="w-full h-16" viewBox="0 0 1200 60" preserveAspectRatio="none">
                <path d="M0,30 Q100,0 200,30 T400,30 T600,30 T800,30 T1000,30 T1200,30" stroke="#4A3F35" strokeWidth="4" fill="none" />
                <path d="M0,30 Q100,60 200,30 T400,30 T600,30 T800,30 T1000,30 T1200,30" stroke="#4A3F35" strokeWidth="4" fill="none" />
              </svg> */}
            </div>
          </div>
        </LangContext.Provider>
      </body>
    </html>
  );
}

// Тексты навигации
const ru = { nav: { home: "Главная", contacts: "Контакты", privacy: "Политика конфиденциальности" } };
const kz = { nav: { home: "Басты бет", contacts: "Байланыс", privacy: "Құпиялылық саясаты" } };