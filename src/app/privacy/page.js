// // app/privacy/page.js
// 'use client';

// import { useContext } from 'react';
// import { Shield, Lock, Eye, Trash2, Mail } from 'lucide-react';
// import { LangContext } from '../layout';

// export default function Privacy() {
//   const { lang } = useContext(LangContext);
//   const t = lang === 'ru' ? ru : kz;

//   return (
//     <>
//       {/* HERO SECTION */}
//       <section className="pt-20 md:pt-32 pb-16 md:pb-24 px-4 bg-gradient-to-b from-[#F5F0E9] to-[#E8DED3]">
//         <div className="max-w-6xl mx-auto text-center">
//           <div className="mb-6 inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-[#8C7B6D]/20 to-[#A89A8F]/10 rounded-2xl">
//             <Shield size={40} className="text-[#4A3F35]" />
//           </div>
//           <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 text-[#4A3F35]">{t.title}</h1>
//           <p className="text-lg md:text-xl text-[#6B5A4D] max-w-2xl mx-auto">{t.subtitle}</p>
//         </div>
//       </section>

//       {/* MAIN CONTENT */}
//       <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-[#E8DED3] to-[#F5F0E9]">
//         <div className="max-w-4xl mx-auto">
//           {/* Introduction */}
//           <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-10 shadow-lg border border-[#D4C4B0]/20 mb-8 md:mb-12">
//             <p className="text-base md:text-lg text-[#6B5A4D] leading-relaxed mb-4">{t.intro}</p>
//             <p className="text-base md:text-lg text-[#6B5A4D] leading-relaxed">{t.intro2}</p>
//           </div>

//           {/* Key Principles */}
//           <div className="mb-12 md:mb-16">
//             <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-[#4A3F35] mb-8 md:mb-10">{t.principlesTitle}</h2>
//             <div className="grid md:grid-cols-2 gap-6 md:gap-8">
//               {/* Privacy First */}
//               <div className="group bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-[#D4C4B0]/20">
//                 <div className="mb-4 md:mb-6 w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-[#8C7B6D]/20 to-[#A89A8F]/10 rounded-xl flex items-center justify-center">
//                   <Lock size={32} className="text-[#4A3F35]" />
//                 </div>
//                 <h3 className="text-lg md:text-xl font-bold text-[#4A3F35] mb-3">{t.principle1Title}</h3>
//                 <p className="text-base md:text-lg text-[#6B5A4D] leading-relaxed">{t.principle1Text}</p>
//               </div>

//               {/* Transparency */}
//               <div className="group bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-[#D4C4B0]/20">
//                 <div className="mb-4 md:mb-6 w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-[#8C7B6D]/20 to-[#A89A8F]/10 rounded-xl flex items-center justify-center">
//                   <Eye size={32} className="text-[#4A3F35]" />
//                 </div>
//                 <h3 className="text-lg md:text-xl font-bold text-[#4A3F35] mb-3">{t.principle2Title}</h3>
//                 <p className="text-base md:text-lg text-[#6B5A4D] leading-relaxed">{t.principle2Text}</p>
//               </div>
//             </div>
//           </div>

//           {/* Data Collection */}
//           <div className="mb-12 md:mb-16">
//             <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-[#4A3F35] mb-8 md:mb-10">{t.dataCollectionTitle}</h2>
//             <div className="bg-gradient-to-br from-[#4A3F35]/5 to-[#8C7B6D]/5 rounded-2xl md:rounded-3xl p-6 md:p-10 border border-[#D4C4B0]/20">
//               <p className="text-base md:text-lg text-[#6B5A4D] leading-relaxed mb-6">{t.dataCollectionText}</p>
//               <div className="space-y-3 md:space-y-4">
//                 {t.dataItems.map((item, i) => (
//                   <div key={i} className="flex items-start gap-3 md:gap-4">
//                     <div className="flex-shrink-0 w-6 h-6 md:w-7 md:h-7 rounded-full bg-[#8C7B6D] flex items-center justify-center text-white text-sm font-bold mt-0.5">
//                       ✓
//                     </div>
//                     <p className="text-base md:text-lg text-[#6B5A4D] leading-relaxed">{item}</p>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Data Protection */}
//           <div className="mb-12 md:mb-16">
//             <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-[#4A3F35] mb-8 md:mb-10">{t.protectionTitle}</h2>
//             <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-10 shadow-lg border border-[#D4C4B0]/20">
//               <p className="text-base md:text-lg text-[#6B5A4D] leading-relaxed mb-6">{t.protectionText}</p>
//               <ul className="space-y-3 md:space-y-4">
//                 {t.protectionItems.map((item, i) => (
//                   <li key={i} className="flex items-start gap-3 md:gap-4">
//                     <span className="text-[#8C7B6D] font-bold text-lg md:text-xl mt-0.5">•</span>
//                     <span className="text-base md:text-lg text-[#6B5A4D] leading-relaxed">{item}</span>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           </div>

//           {/* Your Rights */}
//           <div className="mb-12 md:mb-16">
//             <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-[#4A3F35] mb-8 md:mb-10">{t.rightsTitle}</h2>
//             <div className="grid md:grid-cols-2 gap-6 md:gap-8">
//               {/* Right to Access */}
//               <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-lg border border-[#D4C4B0]/20">
//                 <div className="mb-4 md:mb-6 w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-[#8C7B6D]/20 to-[#A89A8F]/10 rounded-xl flex items-center justify-center">
//                   <Eye size={32} className="text-[#4A3F35]" />
//                 </div>
//                 <h3 className="text-lg md:text-xl font-bold text-[#4A3F35] mb-3">{t.right1Title}</h3>
//                 <p className="text-base md:text-lg text-[#6B5A4D] leading-relaxed">{t.right1Text}</p>
//               </div>

//               {/* Right to Delete */}
//               <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-lg border border-[#D4C4B0]/20">
//                 <div className="mb-4 md:mb-6 w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-[#8C7B6D]/20 to-[#A89A8F]/10 rounded-xl flex items-center justify-center">
//                   <Trash2 size={32} className="text-[#4A3F35]" />
//                 </div>
//                 <h3 className="text-lg md:text-xl font-bold text-[#4A3F35] mb-3">{t.right2Title}</h3>
//                 <p className="text-base md:text-lg text-[#6B5A4D] leading-relaxed">{t.right2Text}</p>
//               </div>
//             </div>
//           </div>

//           {/* Contact Section */}
//           <div className="bg-gradient-to-r from-[#4A3F35] to-[#3A3028] text-[#F5F0E9] rounded-2xl md:rounded-3xl p-6 md:p-10 shadow-lg">
//             <div className="flex items-start gap-4 md:gap-6 mb-4">
//               <Mail size={32} className="flex-shrink-0 mt-1" />
//               <div>
//                 <h3 className="text-lg md:text-xl lg:text-2xl font-black mb-2 md:mb-3">{t.contactTitle}</h3>
//                 <p className="text-base md:text-lg opacity-90 mb-4">{t.contactText}</p>
//                 <a 
//                   href="mailto:toilabapplicaton@gmail.com" 
//                   className="inline-block bg-[#F5F0E9] text-[#4A3F35] px-6 md:px-8 py-3 md:py-4 rounded-lg md:rounded-xl font-bold text-base md:text-lg hover:bg-white transition-all duration-300 transform hover:scale-105"
//                 >
//                     toilabapplicaton@gmail.com
//                 </a>
//               </div>
//             </div>
//           </div>

//           {/* Last Updated */}
//           <div className="text-center mt-12 md:mt-16 pt-8 md:pt-12 border-t border-[#D4C4B0]/20">
//             <p className="text-sm md:text-base text-[#6B5A4D] opacity-70">{t.updated}</p>
//           </div>
//         </div>
//       </section>
//     </>
//   );
// }

// const ru = {
//   title: "Политика конфиденциальности",
//   subtitle: "Мы уважаем вашу приватность и защищаем ваши данные",
//   intro: "Политика конфиденциальности описывает, как Toilab собирает, использует и защищает ваши личные данные. Мы берём вашу приватность очень серьёзно и обязуемся защищать вашу информацию в соответствии с применимыми законами.",
//   intro2: "Пожалуйста, внимательно прочитайте эту политику. Используя приложение Toilab, вы соглашаетесь с условиями, описанными ниже.",
  
//   principlesTitle: "Наши принципы",
//   principle1Title: "Безопасность данных",
//   principle1Text: "Мы используем современные методы шифрования и защиты для обеспечения безопасности ваших данных от несанкционированного доступа.",
//   principle2Title: "Прозрачность",
//   principle2Text: "Мы ясно объясняем, какие данные собираем и как их используем. Нет скрытых условий или неожиданных практик.",
  
//   dataCollectionTitle: "Какие данные мы собираем?",
//   dataCollectionText: "Мы собираем только необходимые данные для работы приложения и предоставления вам услуг:",
//   dataItems: [
//     "Личная информация: имя, телефон, адрес электронной почты",
//     "Информация о бронировании: выбранные услуги, даты, предпочтения",
//     "Информация об оплате: данные о платежах (обработаны безопасно)",
//     "Техническая информация: тип устройства, версия ОС, язык приложения"
//   ],
  
//   protectionTitle: "Как мы защищаем ваши данные?",
//   protectionText: "Мы применяем комплекс мер для защиты вашей информации:",
//   protectionItems: [
//     "Шифрование данных при передаче и хранении",
//     "Ограничение доступа к данным только авторизованному персоналу",
//     "Регулярные проверки безопасности и аудиты",
//     "Соответствие международным стандартам защиты данных"
//   ],
  
//   rightsTitle: "Ваши права",
//   right1Title: "Право на доступ",
//   right1Text: "Вы имеете право запросить информацию о том, какие ваши данные мы храним и как их используем.",
//   right2Title: "Право на удаление",
//   right2Text: "Вы можете запросить удаление ваших данных в любой момент, написав нам на support@Toilab.kz.",
  
//   contactTitle: "Вопросы о приватности?",
//   contactText: "Если у вас есть вопросы о нашей политике конфиденциальности или о том, как мы обрабатываем ваши данные, пожалуйста, свяжитесь с нами:",
  
//   updated: "Последнее обновление: 11 ноября 2025 г."
// };

// const kz = {
//   title: "Құпиялылық саясаты",
//   subtitle: "Біз сіздің құпиялылығын құрметтейміз және сіздің деректеріңізді қорғаймыз",
//   intro: "Құпиялылық саясаты Toilab сіздің жеке деректеріңізді қалай жинайтынын, пайдаланатынын және қорғайтынын сипаттайды. Біз сіздің құпиялылығын өте ауырлықпен қабылдаймыз және сіздің ақпаратын қолданыстағы заңдарға сәйкес қорғауға міндеттіміз.",
//   intro2: "Осы саясатты мұқият оқыңыз. Toilab қолданбасын пайдалану арқылы сіз төменде сипатталған шарттарға келісесіз.",
  
//   principlesTitle: "Біздің принциптеріміз",
//   principle1Title: "Деректердің қауіпсіздігі",
//   principle1Text: "Біз сіздің деректеріңізді рұқсатсыз қатынау ынамсыз болудан сақтау үшін заманауи шифрлау және қорғау әдістерін пайдаланамыз.",
//   principle2Title: "Ашықтық",
//   principle2Text: "Біз қандай деректер жинайтынымызды және оларды қалай пайдаланатынымызды анық түсіндіреміз. Ешқандай жасырын шарттар немесе күтпеген тәжірибелер жоқ.",
  
//   dataCollectionTitle: "Қандай деректер жинаймыз?",
//   dataCollectionText: "Біз тек қолданбаның жұмысы және сізге қызметтер көрсету үшін қажетті деректерді жинаймыз:",
//   dataItems: [
//     "Жеке ақпарат: аты, телефон, электрондық пошта мекенжайы",
//     "Брондау ақпараты: таңдалған қызметтер, күндер, ойлану",
//     "Төлем ақпараты: төлемдер туралы деректер (қауіпсіз өңделген)",
//     "Техникалық ақпарат: құрылғы түрі, ОС нұсқасы, қолданба тілі"
//   ],
  
//   protectionTitle: "Деректеріңізді қалай қорғаймыз?",
//   protectionText: "Біз сіздің ақпаратын қорғау үшін іс-әрекеттердің кешенін қолданамыз:",
//   protectionItems: [
//     "Деректерді жіберу және сақтау кезінде шифрлау",
//     "Деректерге қатынауды тек ынамдалған персоналға шектеу",
//     "Тұрақты қауіпсіздік тексерулері және аудиттері",
//     "Деректерді қорғаудың халықаралық стандарттарына сәйкестік"
//   ],
  
//   rightsTitle: "Сіздің құқықтарыңыз",
//   right1Title: "Қатынау құқығы",
//   right1Text: "Сіз бізде сіздің қандай деректер сақталғанын және оларды қалай пайдаланатынымызды білу үшін сұрау құқығы бар.",
//   right2Title: "Жою құқығы",
//   right2Text: "Сіз кез келген уақытта toilabapplicaton@gmail.com жазып ваша деректеріңізді жоюды сұрай аласыз.",
  
//   contactTitle: "Құпиялылық туралы сұрақтар?",
//   contactText: "Егер сіздің құпиялылық саясатымыз туралы немесе біз деректеріңізді қалай өңдейтіндігі туралы сұрақтарыңыз болса, бізге хабарласыңыз:",
  
//   updated: "Соңғы жаңарту: 2025 жылғы 11 қараша"
// };





// app/privacy/page.js
'use client';

import { useContext, useState } from 'react';
import { Shield, Lock, Eye, Trash2, Mail, Download } from 'lucide-react';
import { LangContext } from '../layout';

export default function Privacy() {
  const { lang } = useContext(LangContext);
  const t = lang === 'ru' ? ru : kz;
  const [agreed, setAgreed] = useState(false);

  return (
    <>
      {/* HERO SECTION */}
      <section className="pt-20 md:pt-32 pb-16 md:pb-24 px-4 bg-gradient-to-b from-[#F5F0E9] to-[#E8DED3]">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-6 inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-[#8C7B6D]/20 to-[#A89A8F]/10 rounded-2xl">
            <Shield size={40} className="text-[#4A3F35]" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 text-[#4A3F35]">{t.title}</h1>
          <p className="text-lg md:text-xl text-[#6B5A4D] max-w-2xl mx-auto">{t.subtitle}</p>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-[#E8DED3] to-[#F5F0E9]">
        <div className="max-w-4xl mx-auto">
          {/* Introduction */}
          <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-10 shadow-lg border border-[#D4C4B0]/20 mb-8 md:mb-12">
            <p className="text-base md:text-lg text-[#6B5A4D] leading-relaxed mb-4">{t.intro}</p>
            <p className="text-base md:text-lg text-[#6B5A4D] leading-relaxed mb-6">{t.intro2}</p>
            
            {/* Agreement Checkbox */}
            {/* <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-[#D4C4B0]/20 mb-6">
              <label className="flex items-start gap-3 md:gap-4 cursor-pointer group">
                <div className="flex-shrink-0 w-6 h-6 md:w-7 md:h-7 rounded-md bg-[#D32F2F] flex items-center justify-center text-white text-sm font-bold mt-0.5 transition-all duration-200">
                  <input 
                    type="checkbox" 
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="hidden"
                  />
                  {agreed && (
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-base md:text-lg text-[#2196F3] leading-relaxed">
                  {t.agreement}
                </span>
              </label>
            </div> */}

            {/* Download Link */}
            <a 
              href="/Политика конфиденциальности.pdf" 
              download 
              className="inline-flex items-center gap-3 bg-[#4A3F35] text-white px-6 md:px-8 py-3 md:py-4 rounded-lg md:rounded-xl font-bold text-base md:text-lg hover:bg-[#3A3028] transition-all duration-300 transform hover:scale-105"
            >
              <Download size={20} />
              {t.download}
            </a>
          </div>

          {/* Key Principles */}
          <div className="mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-[#4A3F35] mb-8 md:mb-10">{t.principlesTitle}</h2>
            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              {/* Privacy First */}
              <div className="group bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-[#D4C4B0]/20">
                <div className="mb-4 md:mb-6 w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-[#8C7B6D]/20 to-[#A89A8F]/10 rounded-xl flex items-center justify-center">
                  <Lock size={32} className="text-[#4A3F35]" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-[#4A3F35] mb-3">{t.principle1Title}</h3>
                <p className="text-base md:text-lg text-[#6B5A4D] leading-relaxed">{t.principle1Text}</p>
              </div>

              {/* Transparency */}
              <div className="group bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-[#D4C4B0]/20">
                <div className="mb-4 md:mb-6 w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-[#8C7B6D]/20 to-[#A89A8F]/10 rounded-xl flex items-center justify-center">
                  <Eye size={32} className="text-[#4A3F35]" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-[#4A3F35] mb-3">{t.principle2Title}</h3>
                <p className="text-base md:text-lg text-[#6B5A4D] leading-relaxed">{t.principle2Text}</p>
              </div>
            </div>
          </div>

          {/* Data Collection */}
          <div className="mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-[#4A3F35] mb-8 md:mb-10">{t.dataCollectionTitle}</h2>
            <div className="bg-gradient-to-br from-[#4A3F35]/5 to-[#8C7B6D]/5 rounded-2xl md:rounded-3xl p-6 md:p-10 border border-[#D4C4B0]/20">
              <p className="text-base md:text-lg text-[#6B5A4D] leading-relaxed mb-6">{t.dataCollectionText}</p>
              <div className="space-y-3 md:space-y-4">
                {t.dataItems.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 md:gap-4">
                    <div className="flex-shrink-0 w-6 h-6 md:w-7 md:h-7 rounded-full bg-[#8C7B6D] flex items-center justify-center text-white text-sm font-bold mt-0.5">
                      ✓
                    </div>
                    <p className="text-base md:text-lg text-[#6B5A4D] leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Data Protection */}
          <div className="mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-[#4A3F35] mb-8 md:mb-10">{t.protectionTitle}</h2>
            <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-10 shadow-lg border border-[#D4C4B0]/20">
              <p className="text-base md:text-lg text-[#6B5A4D] leading-relaxed mb-6">{t.protectionText}</p>
              <ul className="space-y-3 md:space-y-4">
                {t.protectionItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 md:gap-4">
                    <span className="text-[#8C7B6D] font-bold text-lg md:text-xl mt-0.5">•</span>
                    <span className="text-base md:text-lg text-[#6B5A4D] leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Your Rights */}
          <div className="mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-[#4A3F35] mb-8 md:mb-10">{t.rightsTitle}</h2>
            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              {/* Right to Access */}
              <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-lg border border-[#D4C4B0]/20">
                <div className="mb-4 md:mb-6 w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-[#8C7B6D]/20 to-[#A89A8F]/10 rounded-xl flex items-center justify-center">
                  <Eye size={32} className="text-[#4A3F35]" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-[#4A3F35] mb-3">{t.right1Title}</h3>
                <p className="text-base md:text-lg text-[#6B5A4D] leading-relaxed">{t.right1Text}</p>
              </div>
              {/* Right to Delete */}
              <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-lg border border-[#D4C4B0]/20">
                <div className="mb-4 md:mb-6 w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-[#8C7B6D]/20 to-[#A89A8F]/10 rounded-xl flex items-center justify-center">
                  <Trash2 size={32} className="text-[#4A3F35]" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-[#4A3F35] mb-3">{t.right2Title}</h3>
                <p className="text-base md:text-lg text-[#6B5A4D] leading-relaxed">{t.right2Text}</p>
              </div>
            </div>
          </div>
          {/* Contact Section */}
          <div className="bg-gradient-to-r from-[#4A3F35] to-[#3A3028] text-[#F5F0E9] rounded-2xl md:rounded-3xl p-6 md:p-10 shadow-lg">
            <div className="flex items-start gap-4 md:gap-6 mb-4">
              <Mail size={32} className="flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg md:text-xl lg:text-2xl font-black mb-2 md:mb-3">{t.contactTitle}</h3>
                <p className="text-base md:text-lg opacity-90 mb-4">{t.contactText}</p>
                <a
                  href="mailto:toilabapplicaton@gmail.com"
                  className="inline-block bg-[#F5F0E9] text-[#4A3F35] px-6 md:px-8 py-3 md:py-4 rounded-lg md:rounded-xl font-bold text-base md:text-lg hover:bg-white transition-all duration-300 transform hover:scale-105"
                >
                    toilabapplicaton@gmail.com
                </a>
              </div>
            </div>
          </div>
          {/* Last Updated */}
          <div className="text-center mt-12 md:mt-16 pt-8 md:pt-12 border-t border-[#D4C4B0]/20">
            <p className="text-sm md:text-base text-[#6B5A4D] opacity-70">{t.updated}</p>
          </div>
        </div>
      </section>
    </>
  );
}

const ru = {
  title: "Политика конфиденциальности",
  subtitle: "Мы уважаем вашу приватность и защищаем ваши данные",
  intro: "Политика конфиденциальности описывает, как Toilab собирает, использует и защищает ваши личные данные. Мы берём вашу приватность очень серьёзно и обязуемся защищать вашу информацию в соответствии с применимыми законами.",
  intro2: "Пожалуйста, внимательно прочитайте эту политику. Используя приложение Toilab, вы соглашаетесь с условиями, описанными ниже.",
 
  principlesTitle: "Наши принципы",
  principle1Title: "Безопасность данных",
  principle1Text: "Мы используем современные методы шифрования и защиты для обеспечения безопасности ваших данных от несанкционированного доступа.",
  principle2Title: "Прозрачность",
  principle2Text: "Мы ясно объясняем, какие данные собираем и как их используем. Нет скрытых условий или неожиданных практик.",
 
  dataCollectionTitle: "Какие данные мы собираем?",
  dataCollectionText: "Мы собираем только необходимые данные для работы приложения и предоставления вам услуг:",
  dataItems: [
    "Личная информация: имя, телефон, адрес электронной почты",
    "Информация о бронировании: выбранные услуги, даты, предпочтения",
    "Информация об оплате: данные о платежах (обработаны безопасно)",
    "Техническая информация: тип устройства, версия ОС, язык приложения"
  ],
 
  protectionTitle: "Как мы защищаем ваши данные?",
  protectionText: "Мы применяем комплекс мер для защиты вашей информации:",
  protectionItems: [
    "Шифрование данных при передаче и хранении",
    "Ограничение доступа к данным только авторизованному персоналу",
    "Регулярные проверки безопасности и аудиты",
    "Соответствие международным стандартам защиты данных"
  ],
 
  rightsTitle: "Ваши права",
  right1Title: "Право на доступ",
  right1Text: "Вы имеете право запросить информацию о том, какие ваши данные мы храним и как их используем.",
  right2Title: "Право на удаление",
  right2Text: "Вы можете запросить удаление ваших данных в любой момент, написав нам на toilabapplicaton@gmail.com.",
 
  contactTitle: "Вопросы о приватности?",
  contactText: "Если у вас есть вопросы о нашей политике конфиденциальности или о том, как мы обрабатываем ваши данные, пожалуйста, свяжитесь с нами:",
 
  agreement: "Подтверждаю своё согласие на Сбор, обработку и хранение персональных Данных",
  download: "Скачать документ",
 
  updated: ""
};

const kz = {
  title: "Құпиялылық саясаты",
  subtitle: "Біз сіздің құпиялылығын құрметтейміз және сіздің деректеріңізді қорғаймыз",
  intro: "Құпиялылық саясаты Toilab сіздің жеке деректеріңізді қалай жинайтынын, пайдаланатынын және қорғайтынын сипаттайды. Біз сіздің құпиялылығын өте ауырлықпен қабылдаймыз және сіздің ақпаратын қолданыстағы заңдарға сәйкес қорғауға міндеттіміз.",
  intro2: "Осы саясатты мұқият оқыңыз. Toilab қолданбасын пайдалану арқылы сіз төменде сипатталған шарттарға келісесіз.",
 
  principlesTitle: "Біздің принциптеріміз",
  principle1Title: "Деректердің қауіпсіздігі",
  principle1Text: "Біз сіздің деректеріңізді рұқсатсыз қатынау ынамсыз болудан сақтау үшін заманауи шифрлау және қорғау әдістерін пайдаланамыз.",
  principle2Title: "Ашықтық",
  principle2Text: "Біз қандай деректер жинайтынымызды және оларды қалай пайдаланатынымызды анық түсіндіреміз. Ешқандай жасырын шарттар немесе күтпеген тәжірибелер жоқ.",
 
  dataCollectionTitle: "Қандай деректер жинаймыз?",
  dataCollectionText: "Біз тек қолданбаның жұмысы және сізге қызметтер көрсету үшін қажетті деректерді жинаймыз:",
  dataItems: [
    "Жеке ақпарат: аты, телефон, электрондық пошта мекенжайы",
    "Брондау ақпараты: таңдалған қызметтер, күндер, ойлану",
    "Төлем ақпараты: төлемдер туралы деректер (қауіпсіз өңделген)",
    "Техникалық ақпарат: құрылғы түрі, ОС нұсқасы, қолданба тілі"
  ],
 
  protectionTitle: "Деректеріңізді қалай қорғаймыз?",
  protectionText: "Біз сіздің ақпаратын қорғау үшін іс-әрекеттердің кешенін қолданамыз:",
  protectionItems: [
    "Деректерді жіберу және сақтау кезінде шифрлау",
    "Деректерге қатынауды тек ынамдалған персоналға шектеу",
    "Тұрақты қауіпсіздік тексерулері және аудиттері",
    "Деректерді қорғаудың халықаралық стандарттарына сәйкестік"
  ],
 
  rightsTitle: "Сіздің құқықтарыңыз",
  right1Title: "Қатынау құқығы",
  right1Text: "Сіз бізде сіздің қандай деректер сақталғанын және оларды қалай пайдаланатынымызды білу үшін сұрау құқығы бар.",
  right2Title: "Жою құқығы",
  right2Text: "Сіз кез келген уақытта toilabapplicaton@gmail.com жазып ваша деректеріңізді жоюды сұрай аласыз.",
 
  contactTitle: "Құпиялылық туралы сұрақтар?",
  contactText: "Егер сіздің құпиялылық саясатымыз туралы немесе біз деректеріңізді қалай өңдейтіндігі туралы сұрақтарыңыз болса, бізге хабарласыңыз:",
 
  agreement: "Жеке деректерді Жинауға, өңдеуге және сақтауға келісім беремінді растаймын",
  download: "Құжатты жүктеп алу",
 
  updated: "Соңғы жаңарту: 2025 жылғы 11 қараша"
};