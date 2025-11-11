// app/page.js
'use client';

import { useContext, useState } from 'react';
import Image from 'next/image';
import { Download, ChevronDown, Search, Star, Calendar, Wallet, MessageCircle, Smartphone, ArrowRight, Zap, Heart, Users } from 'lucide-react';
import { LangContext } from '../app/layout';

const Ornament = ({ className = "" }) => (
  <svg className={`w-full ${className}`} viewBox="0 0 1200 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0,50 Q100,20 200,50 T400,50 T600,50 T800,50 T1000,50 T1200,50" 
          stroke="#4A3F35" strokeWidth="6" fill="none" />
    <path d="M0,50 Q100,80 200,50 T400,50 T600,50 T800,50 T1000,50 T1200,50" 
          stroke="#4A3F35" strokeWidth="6" fill="none" />
  </svg>
);

export default function Home() {
  const { lang } = useContext(LangContext);
  const t = lang === 'ru' ? ru : kz;
  const [hoveredFeature, setHoveredFeature] = useState(null);

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* HERO SECTION */}
      <section className="pt-20 md:pt-32 pb-16 md:pb-32 px-4 bg-gradient-to-b from-[#F5F0E9] to-[#E8DED3]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Left Content */}
            <div className="order-2 md:order-1">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 md:mb-8 leading-tight text-[#4A3F35]">
                {t.hero.title[0]} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8C7B6D] to-[#A89A8F]">{t.hero.title[1]}</span> <br />
                <span className="text-[#4A3F35]">{t.hero.title[2]}</span>
              </h1>

              <p className="text-lg md:text-xl mb-8 md:mb-12 max-w-2xl text-[#6B5A4D] leading-relaxed font-medium">
                {t.hero.subtitle}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 md:gap-6 mb-12">
                <a 
                  href="https://play.google.com/store/apps" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group bg-gradient-to-r from-[#4A3F35] to-[#3A3028] text-white px-8 md:px-10 py-4 md:py-5 rounded-full flex items-center justify-center gap-3 text-lg md:text-xl font-bold hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                >
                  <Download size={24} className="group-hover:animate-bounce" /> 
                  <span>Google Play</span>
                </a>
                <a 
                  href="https://apps.apple.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group bg-white border-2 border-[#4A3F35] text-[#4A3F35] px-8 md:px-10 py-4 md:py-5 rounded-full flex items-center justify-center gap-3 text-lg md:text-xl font-bold hover:bg-[#F5F0E9] transition-all duration-300 transform hover:scale-105"
                >
                  <Download size={24} className="group-hover:animate-bounce" /> 
                  <span>App Store</span>
                </a>
              </div>

              <div className="flex items-center gap-8 text-sm md:text-base">
                <div className="flex items-center gap-2">
                  {/* <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8C7B6D] to-[#6B5A4D] flex items-center justify-center text-white font-bold">
                    1K+
                  </div> */}
                  {/* <span className="text-[#6B5A4D] font-medium">{t.hero.stat1}</span> */}
                </div>
                {/* <div className="flex items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#A89A8F] to-[#8C7B6D] flex items-center justify-center text-white font-bold">
                    ⭐
                  </div>
                  <span className="text-[#6B5A4D] font-medium">{t.hero.stat2}</span>
                </div> */}
              </div>
            </div>

            {/* Right Image */}
            <div className="order-1 md:order-2 flex justify-center md:justify-end">
              <div className="relative w-full max-w-xs">
                <div className="absolute inset-0 bg-gradient-to-br from-[#8C7B6D]/20 to-[#4A3F35]/20 rounded-3xl blur-3xl"></div>
                <div className="relative ">
                  <Image 
                    src="/images/logo2.png" 
                    alt="Toilab App" 
                    width={300} 
                    height={600} 
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="flex justify-center mt-12 md:mt-16">
            <button 
              onClick={scrollToFeatures}
              className="animate-bounce p-3 hover:bg-[#F5F0E9] rounded-full transition-colors"
            >
              <ChevronDown size={32} className="text-[#8C7B6D]" />
            </button>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-20 md:py-32 bg-gradient-to-b from-[#4A3F35] to-[#3A3028] text-[#F5F0E9] px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 md:mb-20">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 md:mb-6">{t.features.title}</h2>
            <p className="text-lg md:text-xl opacity-80 max-w-2xl mx-auto">{t.features.subtitle}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {t.features.items.map((f, i) => (
              <div 
                key={i}
                onMouseEnter={() => setHoveredFeature(i)}
                onMouseLeave={() => setHoveredFeature(null)}
                className="group relative bg-gradient-to-br from-[#F5F0E9]/10 to-[#F5F0E9]/5 backdrop-blur-lg rounded-2xl md:rounded-3xl p-6 md:p-8 border border-[#F5F0E9]/20 hover:border-[#F5F0E9]/40 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#8C7B6D]/0 to-[#F5F0E9]/0 group-hover:from-[#8C7B6D]/10 group-hover:to-[#F5F0E9]/5 rounded-2xl md:rounded-3xl transition-all duration-300"></div>
                
                <div className="relative z-10">
                  <div className="mb-4 md:mb-6 w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-[#8C7B6D]/30 to-[#A89A8F]/20 rounded-2xl flex items-center justify-center group-hover:from-[#8C7B6D]/50 group-hover:to-[#A89A8F]/40 transition-all duration-300">
                    <div className="text-[#F5F0E9] group-hover:scale-110 transition-transform duration-300">
                      {f.icon}
                    </div>
                  </div>
                  
                  <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 group-hover:text-white transition-colors">{f.title}</h3>
                  <p className="text-base md:text-lg opacity-85 group-hover:opacity-100 transition-opacity leading-relaxed">{f.desc}</p>
                </div>

                {/* Hover indicator */}
                <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3">
                  <ArrowRight size={24} className="text-[#8C7B6D]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFITS SECTION */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-[#E8DED3] to-[#F5F0E9] px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-center mb-16 md:mb-20 text-[#4A3F35]">{t.benefits.title}</h2>

          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            {t.benefits.items.map((benefit, i) => (
              <div key={i} className="flex gap-4 md:gap-6 group">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 md:h-16 md:w-16 rounded-full bg-gradient-to-br from-[#8C7B6D] to-[#6B5A4D] text-white font-bold text-lg md:text-2xl group-hover:scale-110 transition-transform duration-300">
                    {benefit.number}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl md:text-2xl font-bold text-[#4A3F35] mb-2 md:mb-3">{benefit.title}</h3>
                  <p className="text-base md:text-lg text-[#6B5A4D] leading-relaxed">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SCREENSHOTS SECTION */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-[#F5F0E9] to-[#E8DED3] px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 md:mb-8 text-[#4A3F35]">{t.screenshots.title}</h2>
          <p className="text-lg md:text-xl text-[#6B5A4D] mb-12 md:mb-16 max-w-2xl mx-auto">{t.screenshots.subtitle}</p>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#8C7B6D]/20 to-[#4A3F35]/20 rounded-3xl blur-3xl"></div>
            <div className="relative  rounded-3xl  overflow-hidden  inline-block">
              <Image 
              src="/images/app.png" 
                alt="Toilab интерфейс" 
                width={340} 
                height={700} 
                className="rounded-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-[#4A3F35] via-[#5A4A3F] to-[#3A3028] text-[#F5F0E9] px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 md:mb-8">{t.cta.title}</h2>
          <p className="text-xl md:text-2xl mb-12 md:mb-16 opacity-90 leading-relaxed whitespace-pre-line">{t.cta.subtitle}</p>
          
          <div className="mb-12 md:mb-16">
            <Image 
              src="/images/logo3.png" 
              alt="Toilab" 
              width={500} 
              height={250} 
              className="mx-auto"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-6 md:gap-8 justify-center">
            <a 
              href="https://play.google.com/store/apps" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="group bg-[#F5F0E9] text-[#4A3F35] px-10 md:px-14 py-5 md:py-7 rounded-full text-xl md:text-2xl font-black hover:bg-white transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center justify-center gap-3"
            >
              <Download size={28} className="group-hover:animate-bounce" />
              Google Play
            </a>
            <a 
              href="https://apps.apple.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="group bg-transparent border-2 border-[#F5F0E9] text-[#F5F0E9] px-10 md:px-14 py-5 md:py-7 rounded-full text-xl md:text-2xl font-black hover:bg-[#F5F0E9] hover:text-[#4A3F35] transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3"
            >
              <Download size={28} className="group-hover:animate-bounce" />
              App Store
            </a>
          </div>

          <p className="mt-12 md:mt-16 text-base md:text-lg opacity-70">{t.cta.footer}</p>
        </div>
      </section>
    </>
  );
}

// Тексты главной
const ru = {
  hero: { 
    title: ["Пусть","каждое мероприятие", "будет особенным!"],
    subtitle: "Toilab — всё для Вашего мероприятия в одном приложении: ресторан, фотограф, ведущий, фейерверк, рассрочка и многое другое.",
    stat1: "услуг и партнёров",
    stat2: "средняя оценка"
  },
  features: { 
    title: "Что умеет Toilab?",
    subtitle: "Полный набор инструментов для организации идеальных мероприятий",
    items: [
      
      { icon: <Star size={48} />, title: "Реальные отзывы", desc: "Только проверенные рейтинги от реальных клиентов" },
      { icon: <Calendar size={48} />, title: "Бронь за 2 минуты", desc: "Быстрое бронирование прямо в приложении" },
      { icon: <Wallet size={48} />, title: "Рассрочка", desc: "По статистике 60% клиентов выбирают удобную рассрочку" },
      
      { icon: <Smartphone size={48} />, title: "Мероприятия в телефоне", desc: "Все заказы в одном приложении" }
    ]
  },
  benefits: {
    title: "Почему выбирают Toilab?",
    items: [
      { number: "✓", title: "Экономия времени", desc: "Не нужно искать услуги в разных местах. Всё в одном приложении." },
      { number: "✓", title: "Выгодные цены", desc: "Специальные предложения и скидки только для пользователей Toilab." },
      { number: "✓", title: "Безопасность", desc: "Проверенные партнёры и защита платежей гарантированы." },
      { number: "✓", title: "Поддержка 24/7", desc: "Наша команда всегда готова помочь вам в организации мероприятий." }
    ]
  },
  screenshots: { 
    title: "Как выглядит приложение",
    subtitle: "Интуитивно понятный интерфейс для удобства использования"
  },
  cta: { 
    title: "Скачайте Toilab",
    subtitle: "Бронируйте, оплачивайте, берите в рассрочку — за 2 минуты.",
    footer: "Доступно на iOS и Android."
  }
};

const kz = {
  hero: { 
    title: ["Әрбір Той", "Ерекше", "Болсын!"],
    subtitle: "Toilab — тойға қажетті барлық нәрсе бір қолданбада: мейрамхана, фотограф, ведущий, фейерверк, бөліп төлеу және микрокредит.",
    stat1: "қызмет және серіктес",
    stat2: "орташа баға"
  },
  features: { 
    title: "Toilab немен көмектеседі?",
    subtitle: "Идеалды той ұйымдастыру үшін толық құрал жиынтығы",
    items: [
      { icon: <Search size={48} />, title: "1000+ қызмет", desc: "Мейрамханалар, фотографтар, ведущийлар, декор және басқалары" },
      { icon: <Star size={48} />, title: "Нақты пікірлер", desc: "Тек расталған рейтингтер нақты клиенттерден" },
      { icon: <Calendar size={48} />, title: "2 минутта брондау", desc: "Қолданбада тез брондау" },
      { icon: <Wallet size={48} />, title: "Бөліп төлеу", desc: "Клиенттердің 60%-ы ыңғайлы төлемді таңдайды" },
      { icon: <MessageCircle size={48} />, title: "Подрядчикпен чат", desc: "Келісімшарт және қарым-қатынас бір жерде" },
      { icon: <Smartphone size={48} />, title: "Той телефонда", desc: "Барлық тапсырыстар және құжаттар бір қолданбада" }
    ]
  },
  benefits: {
    title: "Неге Toilab таңдайды?",
    items: [
      { number: "✓", title: "Уақыт үнемдеу", desc: "Қызметтерді әртүрлі жерлерде іздеудің қажеті жоқ. Барлығы бір қолданбада." },
      { number: "✓", title: "Арзан бағалар", desc: "Toilab пайдаланушылары үшін ерекше ұсынымдар және жеңілдіктер." },
      { number: "✓", title: "Қауіпсіздік", desc: "Расталған серіктестер және төлемдердің қорғалуы кепілденген." },
      { number: "✓", title: "24/7 қолдау", desc: "Біздің команда той ұйымдастыруында сізге көмектеуге әрдайым дайын." }
    ]
  },
  screenshots: { 
    title: "Қолданба қалай көрінеді",
    subtitle: "Ыңғайлы пайдалану үшін интуитивті және әдемі интерфейс"
  },
  cta: { 
    title: "Toilab жүктеп алыңыз",
    subtitle: "Брондаңыз, төлеңіз, бөліп төлеңіз — 2 минутта.",
    footer: "iOS және Android-те қол жетімді."
  }
};
