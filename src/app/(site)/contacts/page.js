// app/contacts/page.js
'use client';

import { useContext, useState } from 'react';
import { Mail, Phone, MapPin, Send, Clock, Globe } from 'lucide-react';
import { LangContext } from '../layout';

export default function Contacts() {
  const { lang } = useContext(LangContext);
  const t = lang === 'ru' ? ru : kz;
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <>
      {/* HERO SECTION */}
      <section className="pt-20 md:pt-32 pb-16 md:pb-24 px-4 bg-gradient-to-b from-[#F5F0E9] to-[#E8DED3]">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 text-[#4A3F35]">{t.title}</h1>
          <p className="text-lg md:text-xl text-[#6B5A4D] max-w-2xl mx-auto">{t.subtitle}</p>
        </div>
      </section>

      {/* CONTACT INFO CARDS */}
      <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-[#E8DED3] to-[#F5F0E9]">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-16 md:mb-24">
            {/* Email Card */}
            <div className="group bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-[#D4C4B0]/20">
              <div className="mb-6 w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-[#8C7B6D]/20 to-[#A89A8F]/10 rounded-2xl flex items-center justify-center group-hover:from-[#8C7B6D]/30 group-hover:to-[#A89A8F]/20 transition-all duration-300">
                <Mail size={40} className="text-[#4A3F35] group-hover:text-[#8C7B6D] transition-colors" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-[#4A3F35] mb-3 md:mb-4">{t.email}</h3>
              <a 
                href="mailto:toilabapplicaton@gmail.com" 
                className="text-base md:text-lg text-[#8C7B6D] hover:text-[#4A3F35] transition-colors font-medium break-all"
              >
                toilabapplicaton@gmail.com
              </a>
              <p className="text-sm text-[#6B5A4D] mt-4 opacity-70">{t.emailResponse}</p>
            </div>

            {/* Phone Card */}
            <div className="group bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-[#D4C4B0]/20">
              <div className="mb-6 w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-[#8C7B6D]/20 to-[#A89A8F]/10 rounded-2xl flex items-center justify-center group-hover:from-[#8C7B6D]/30 group-hover:to-[#A89A8F]/20 transition-all duration-300">
                <Phone size={40} className="text-[#4A3F35] group-hover:text-[#8C7B6D] transition-colors" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-[#4A3F35] mb-3 md:mb-4">{t.phone}</h3>
              <a 
                href="tel:+77011220141" 
                className="text-base md:text-lg text-[#8C7B6D] hover:text-[#4A3F35] transition-colors font-medium"
              >

                +7 (701) 122-01-41
              </a>
              <p className="text-sm text-[#6B5A4D] mt-4 opacity-70">{t.phoneHours}</p>
            </div>

            {/* Address Card */}
            <div className="group bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-[#D4C4B0]/20">
              <div className="mb-6 w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-[#8C7B6D]/20 to-[#A89A8F]/10 rounded-2xl flex items-center justify-center group-hover:from-[#8C7B6D]/30 group-hover:to-[#A89A8F]/20 transition-all duration-300">
                <MapPin size={40} className="text-[#4A3F35] group-hover:text-[#8C7B6D] transition-colors" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-[#4A3F35] mb-3 md:mb-4">{t.address}</h3>
              <p className="text-base md:text-lg text-[#6B5A4D] font-medium">{t.addressText}</p>
              <p className="text-sm text-[#6B5A4D] mt-4 opacity-70">{t.addressCity}</p>
            </div>
          </div>

          {/* Working Hours */}
          <div className="bg-gradient-to-r from-[#4A3F35]/5 to-[#8C7B6D]/5 rounded-2xl md:rounded-3xl p-6 md:p-8 border border-[#D4C4B0]/20">
            <div className="flex items-center gap-3 md:gap-4 mb-4">
              <Clock size={28} className="text-[#8C7B6D]" />
              <h3 className="text-lg md:text-xl font-bold text-[#4A3F35]">{t.workingHours}</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4 text-base md:text-lg text-[#6B5A4D]">
              <p><span className="font-semibold">{t.weekday}:</span> {t.weekdayHours}</p>
              <p><span className="font-semibold">{t.weekend}:</span> {t.weekendHours}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT FORM SECTION */}
      <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-[#F5F0E9] to-[#E8DED3]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#4A3F35] mb-4">{t.formTitle}</h2>
            <p className="text-lg md:text-xl text-[#6B5A4D]">{t.formSubtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-10 shadow-lg border border-[#D4C4B0]/20">
            <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
              {/* Name Field */}
              <div>
                <label className="block text-sm md:text-base font-bold text-[#4A3F35] mb-2 md:mb-3">{t.formName}</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 md:px-6 py-3 md:py-4 rounded-lg md:rounded-xl border-2 border-[#D4C4B0] focus:border-[#8C7B6D] focus:outline-none transition-colors text-base md:text-lg"
                  placeholder={t.formNamePlaceholder}
                />
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm md:text-base font-bold text-[#4A3F35] mb-2 md:mb-3">{t.formEmail}</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-4 md:px-6 py-3 md:py-4 rounded-lg md:rounded-xl border-2 border-[#D4C4B0] focus:border-[#8C7B6D] focus:outline-none transition-colors text-base md:text-lg"
                  placeholder={t.formEmailPlaceholder}
                />
              </div>
            </div>

            {/* Message Field */}
            <div className="mb-8 md:mb-10">
              <label className="block text-sm md:text-base font-bold text-[#4A3F35] mb-2 md:mb-3">{t.formMessage}</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                rows="6"
                className="w-full px-4 md:px-6 py-3 md:py-4 rounded-lg md:rounded-xl border-2 border-[#D4C4B0] focus:border-[#8C7B6D] focus:outline-none transition-colors text-base md:text-lg resize-none"
                placeholder={t.formMessagePlaceholder}
              ></textarea>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full group bg-gradient-to-r from-[#4A3F35] to-[#3A3028] text-white px-8 md:px-10 py-4 md:py-5 rounded-lg md:rounded-xl text-lg md:text-xl font-bold hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3"
            >
              <Send size={24} className="group-hover:translate-x-1 transition-transform" />
              {t.formSubmit}
            </button>

            {/* Success Message */}
            {submitted && (
              <div className="mt-6 md:mt-8 p-4 md:p-6 bg-green-50 border-2 border-green-200 rounded-lg md:rounded-xl text-center">
                <p className="text-green-700 font-bold text-base md:text-lg">{t.formSuccess}</p>
              </div>
            )}
          </form>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-[#E8DED3] to-[#F5F0E9]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-center text-[#4A3F35] mb-12 md:mb-16">{t.faqTitle}</h2>
          
          <div className="space-y-4 md:space-y-6">
            {t.faqItems.map((item, i) => (
              <details key={i} className="group bg-white rounded-lg md:rounded-xl p-4 md:p-6 border border-[#D4C4B0]/20 hover:border-[#D4C4B0]/40 transition-all duration-300 cursor-pointer">
                <summary className="flex items-center justify-between font-bold text-base md:text-lg text-[#4A3F35] hover:text-[#8C7B6D] transition-colors">
                  {item.question}
                  <span className="text-2xl group-open:rotate-180 transition-transform duration-300">›</span>
                </summary>
                <p className="mt-4 text-base md:text-lg text-[#6B5A4D] leading-relaxed">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

const ru = {
  title: "Контакты",
  subtitle: "Свяжитесь с нами для любых вопросов и предложений",
  email: "Email",
  emailResponse: "Ответим в течение 24 часов",
  phone: "Телефон",
  phoneHours: "Пн-Пт: 9:00 - 18:00",
  address: "Адрес",
  addressText: "Алматы, ул. Абая 123, офис 45",
  addressCity: "Республика Казахстан",
  workingHours: "Режим работы",
  weekday: "Пн-Пт",
  weekdayHours: "09:00 - 18:00",
  weekend: "Сб-Вс",
  weekendHours: "10:00 - 16:00",
  formTitle: "Отправить сообщение",
  formSubtitle: "Заполните форму и мы свяжемся с вами в ближайшее время",
  formName: "Ваше имя",
  formNamePlaceholder: "Иван Иванов",
  formEmail: "Email",
  formEmailPlaceholder: "ivan@example.com",
  formMessage: "Сообщение",
  formMessagePlaceholder: "Напишите ваше сообщение...",
  formSubmit: "Отправить",
  formSuccess: "✓ Спасибо! Ваше сообщение отправлено. Мы свяжемся с вами в ближайшее время.",
  faqTitle: "Часто задаваемые вопросы",
  faqItems: [
    {
      question: "Как скачать приложение Toilab?",
      answer: "Приложение доступно в Google Play для Android и App Store для iOS. Просто найдите 'Toilab' в поиске магазина приложений и нажмите 'Установить'."
    },
    {
      question: "Какие услуги доступны в приложении?",
      answer: "В Toilab доступны услуги рестораны, фотографы, ведущие, декораторы, фейерверки и многое другое. Всего более 1000+ услуг от проверенных партнёров."
    },
    {
      question: "Как оплатить услугу?",
      answer: "Вы можете оплатить услугу прямо в приложении. Доступны различные способы оплаты, включая рассрочку и микрокредит."
    },
    {
      question: "Есть ли гарантия безопасности платежей?",
      answer: "Да, все платежи защищены. Мы используем современные системы шифрования и работаем только с проверенными партнёрами."
    }
  ]
};

const kz = {
  title: "Байланыс",
  subtitle: "Кез келген сұрақтар және ұсынымдар үшін бізге хабарласыңыз",
  email: "Email",
  emailResponse: "24 сағат ішінде жауап береміз",
  phone: "Телефон",
  phoneHours: "Дс-Жм: 9:00 - 18:00",
  address: "Мекенжай",
  addressText: "Алматы, Абай көшесі 123, 45-кабинет",
  addressCity: "Қазақстан Республикасы",
  workingHours: "Жұмыс уақыты",
  weekday: "Дс-Жм",
  weekdayHours: "09:00 - 18:00",
  weekend: "Сб-Жк",
  weekendHours: "10:00 - 16:00",
  formTitle: "Хабарлама жіберіңіз",
  formSubtitle: "Форманы толтырыңыз және біз сізге ең жақын уақытта хабарласамыз",
  formName: "Сіздің атыңыз",
  formNamePlaceholder: "Иван Иванов",
  formEmail: "Email",
  formEmailPlaceholder: "ivan@example.com",
  formMessage: "Хабарлама",
  formMessagePlaceholder: "Сіздің хабарламаңызды жазыңыз...",
  formSubmit: "Жіберіңіз",
  formSuccess: "✓ Рахмет! Сіздің хабарламаңыз жіберілді. Біз сізге ең жақын уақытта хабарласамыз.",
  faqTitle: "Жиі қойылатын сұрақтар",
  faqItems: [
    {
      question: "Toilab қолданбасын қалай жүктеп алуға болады?",
      answer: "Қолданба Google Play (Android) және App Store (iOS) ішінде қол жетімді. Қолданба магазинында 'Toilab' іздеңіз және 'Орнату' басыңыз."
    },
    {
      question: "Қолданбада қандай қызметтер қол жетімді?",
      answer: "Toilab-та мейрамханалар, фотографтар, ведущийлар, декораторлар, фейерверктер және басқалары қол жетімді. Барлығы 1000+ расталған серіктестердің қызметтері."
    },
    {
      question: "Қызметті қалай төлеуге болады?",
      answer: "Қызметті тікелей қолданбада төлеуге болады. Төлемнің әртүрлі әдістері қол жетімді, соның ішінде бөліп төлеу және микрокредит."
    },
    {
      question: "Төлемдердің қауіпсіздігі кепілденген бе?",
      answer: "Иә, барлық төлемдер қорғалған. Біз заманауи шифрлау жүйелерін пайдаланамыз және тек расталған серіктестермен жұмыс істейміз."
    }
  ]
};
