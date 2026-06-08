// app/(site)/page.js — корень сайта теперь ведёт прямо в веб-приложение (/app).
// Сама главная (маркетинговый лендинг) переехала на /about.
import { redirect } from 'next/navigation';

export default function HomeRedirect() {
  redirect('/app');
}
