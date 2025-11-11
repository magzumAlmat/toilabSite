// app/contacts/page.js
'use client';

import { useContext } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { LangContext } from '../layout';

export default function Contacts() {
  const { lang } = useContext(LangContext);
  const t = lang === 'ru' ? ru : kz;

  return (
    <section className="py-24 px-4">
      <div className="max-w-5xl mx-auto text-center">
        <h1 className="text-5xl font-black mb-12">{t.title}</h1>
        <div className="grid md:grid-cols-3 gap-8 text-lg">
          <div className="flex flex-col items-center">
            <Mail size={48} className="mb-4 text-[#8C7B6D]" />
            <p className="font-bold">{t.email}</p>
            <a href="mailto:support@toilab.kz" className="text-[#4A3F35] hover:underline">support@toilab.kz</a>
          </div>
          <div className="flex flex-col items-center">
            <Phone size={48} className="mb-4 text-[#8C7B6D]" />
            <p className="font-bold">{t.phone}</p>
            <a href="tel:+77071234567" className="text-[#4A3F35] hover:underline">+7 (707) 123-45-67</a>
          </div>
          <div className="flex flex-col items-center">
            <MapPin size={48} className="mb-4 text-[#8C7B6D]" />
            <p className="font-bold">{t.address}</p>
            <p>{t.addressText}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

const ru = { title: "Контакты", email: "Email", phone: "Телефон", address: "Адрес", addressText: "Алматы, ул. Абая 123, офис 45" };
const kz = { title: "Байланыс", email: "Email", phone: "Телефон", address: "Мекенжай", addressText: "Алматы, Абай көшесі 123, 45-кабинет" };