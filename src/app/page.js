// app/page.js
'use client';

import { useContext } from 'react';
import Image from 'next/image';
import { Download, ChevronDown, Search, Star, Calendar, Wallet, MessageCircle, Smartphone } from 'lucide-react';
import { LangContext } from '../app/layout';


const Ornament = ({ className = "" }) => (
  <svg className={`w-full ${className}`} viewBox="0 0 1200 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0,50 Q100,20 200,50 T400,50 T600,50 T800,50 T1000,50 T1200,50" 
          stroke="#4A3F35" strokeWidth="6" fill="none" />
    <path d="M0,50 Q100,80 200,50 T400,50 T600,50 T800,50 T1000,50 T1200,50" 
          stroke="#4A3F35" strokeWidth="6" fill="none" />
    <path d="M50,35 Q75,25 100,35 T150,35" 
          stroke="#4A3F35" strokeWidth="4" fill="none" />
    <path d="M150,65 Q175,75 200,65 T250,65" 
          stroke="#4A3F35" strokeWidth="4" fill="none" />
    <path d="M250,35 Q275,25 300,35 T350,35" 
          stroke="#4A3F35" strokeWidth="4" fill="none" />
    <path d="M350,65 Q375,75 400,65 T450,65" 
          stroke="#4A3F35" strokeWidth="4" fill="none" />
    <path d="M450,35 Q475,25 500,35 T550,35" 
          stroke="#4A3F35" strokeWidth="4" fill="none" />
    <path d="M550,65 Q575,75 600,65 T650,65" 
          stroke="#4A3F35" strokeWidth="4" fill="none" />
    <path d="M650,35 Q675,25 700,35 T750,35" 
          stroke="#4A3F35" strokeWidth="4" fill="none" />
    <path d="M750,65 Q775,75 800,65 T850,65" 
          stroke="#4A3F35" strokeWidth="4" fill="none" />
    <path d="M850,35 Q875,25 900,35 T950,35" 
          stroke="#4A3F35" strokeWidth="4" fill="none" />
    <path d="M950,65 Q975,75 1000,65 T1050,65" 
          stroke="#4A3F35" strokeWidth="4" fill="none" />
    <path d="M1050,35 Q1075,25 1100,35 T1150,35" 
          stroke="#4A3F35" strokeWidth="4" fill="none" />
  </svg>
);


export default function Home() {
  const { lang } = useContext(LangContext);
  const t = lang === 'ru' ? ru : kz;

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* HERO */}
      {/* <div className="bg-white py-6 border-b-8 border-[#4A3F35]">
        <div className="max-w-7xl mx-auto px-4">
          <Ornament className="h-20 md:h-24" />
        </div>
      </div> */}

      <section className="pt-16 pb-28 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight">
            {t.hero.title[0]} <br />
            <span className="text-[#8C7B6D]">{t.hero.title[1]}</span> <br />
            <span className="text-[#4A3F35]">{t.hero.title[2]}</span>
          </h1>

          {/* <div className="flex justify-center mb-10">
            <Image src="/images/logo.png" alt="ToiLab" width={340} height={340} className="drop-shadow-2xl" />
          </div> */}

          <p className="text-2xl md:text-3xl mb-12 max-w-4xl mx-auto font-medium leading-relaxed">
            {t.hero.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <a href="https://play.google.com/store/apps" target="_blank" rel="noopener noreferrer"
              className="bg-[#4A3F35] text-white px-10 py-5 rounded-full flex items-center gap-4 text-2xl font-bold hover:bg-[#3A3028] transition shadow-2xl">
              <Download size={36} /> Google Play
            </a>
            <a href="https://apps.apple.com" target="_blank" rel="noopener noreferrer"
              className="bg-[#4A3F35] text-white px-10 py-5 rounded-full flex items-center gap-4 text-2xl font-bold hover:bg-[#3A3028] transition shadow-2xl">
              <Download size={36} /> App Store
            </a>
          </div>

          <button onClick={scrollToFeatures} className="animate-bounce">
            <ChevronDown size={56} className="mx-auto text-[#8C7B6D]" />
          </button>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 bg-[#4A3F35] text-[#F5F0E9] px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-black text-center mb-16">{t.features.title}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {t.features.items.map((f, i) => (
              <div key={i} className="bg-[#F5F0E9]/10 backdrop-blur-lg rounded-3xl p-8 text-center hover:scale-105 transition">
                <div className="mx-auto mb-6 w-20 h-20 bg-[#8C7B6D]/20 rounded-full flex items-center justify-center">{f.icon}</div>
                <h3 className="text-2xl font-bold mb-4">{f.title}</h3>
                <p className="text-lg opacity-90">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* СКРИНШОТ */}
      <section className="py-24 bg-[#F5F0E9] px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-5xl font-black mb-16">{t.screenshots.title}</h2>
          <Image src="/mockup-solution.png" alt="ToiLab интерфейс" width={440} height={900} className="rounded-3xl shadow-2xl border-8 border-white mx-auto" />
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 bg-gradient-to-t from-[#4A3F35] to-[#6B5A4D] text-[#F5F0E9] text-center px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-6xl font-black mb-10">{t.cta.title}</h2>
          <p className="text-3xl mb-16 whitespace-pre-line">{t.cta.subtitle}</p>
          <Image src="/toilab-logo-full.png" alt="ToiLab" width={480} height={240} className="mx-auto mb-12" />
          <div className="flex flex-col sm:flex-row gap-8 justify-center">
            <a href="https://play.google.com/store/apps" target="_blank" rel="noopener noreferrer" className="bg-[#F5F0E9] text-[#4A3F35] px-14 py-7 rounded-full text-3xl font-black hover:bg-white transition shadow-2xl">Google Play</a>
            <a href="https://apps.apple.com" target="_blank" rel="noopener noreferrer" className="bg-[#F5F0E9] text-[#4A3F35] px-14 py-7 rounded-full text-3xl font-black hover:bg-white transition shadow-2xl">App Store</a>
          </div>
        </div>
      </section>
    </>
  );
}

// Тексты главной
const ru = {
  hero: { title: ["Каждый Той", "Особенным", "Пусть Будет!"], subtitle: "ToiLab — всё для свадьбы в одном приложении: ресторан, фотограф, ведущий, фейерверк, рассрочка и даже микрокредит." },
  features: { title: "Что умеет ToiLab?", items: [
    { icon: <Search size={48} />, title: "1000+ услуг", desc: "Рестораны, фотографы, ведущие, декор" },
    { icon: <Star size={48} />, title: "Реальные отзывы", desc: "Только проверенные рейтинги" },
    { icon: <Calendar size={48} />, title: "Бронь за 2 минуты", desc: "Прямо в приложении" },
    { icon: <Wallet size={48} />, title: "Рассрочка", desc: "60% клиентов выбирают" },
    { icon: <MessageCircle size={48} />, title: "Чат с подрядчиком", desc: "Договор в приложении" },
    { icon: <Smartphone size={48} />, title: "Свадьба в телефоне", desc: "Все заказы в одном месте" }
  ]},
  screenshots: { title: "Как выглядит приложение" },
  cta: { title: "Скачайте ToiLab", subtitle: "Бронируйте, оплачивайте, берите в рассрочку — за 2 минуты." }
};

const kz = {
  hero: { title: ["Әрбір Той", "Ерекше", "Болсын!"], subtitle: "ToiLab — тойға қажетті барлық нәрсе бір қолданбада: мейрамхана, фотограф, ведущий, фейерверк, бөліп төлеу және микрокредит." },
  features: { title: "ToiLab немен көмектеседі?", items: [
    { icon: <Search size={48} />, title: "1000+ қызмет", desc: "Мейрамханалар, фотографтар, ведущийлар, декор" },
    { icon: <Star size={48} />, title: "Нақты пікірлер", desc: "Тек расталған рейтингтер" },
    { icon: <Calendar size={48} />, title: "2 минутта брондау", desc: "Тікелей қолданбада" },
    { icon: <Wallet size={48} />, title: "Бөліп төлеу", desc: "Клиенттердің 60%-ы таңдайды" },
    { icon: <MessageCircle size={48} />, title: "Подрядчикпен чат", desc: "Келісімшарт қолданбада" },
    { icon: <Smartphone size={48} />, title: "Той телефонда", desc: "Барлық тапсырыстар бір жерде" }
  ]},
  screenshots: { title: "Қолданба қалай көрінеді" },
  cta: { title: "ToiLab жүктеп алыңыз", subtitle: "Брондаңыз, төлеңіз, бөліп төлеңіз — 2 минутта." }
};