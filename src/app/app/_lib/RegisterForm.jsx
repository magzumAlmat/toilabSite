'use client';

// Переиспользуемая форма регистрации (POST /api/register). Роль: Клиент=3 / Поставщик=2.
// Используется на странице /app/register и как гейт для гостей на главной /app.
// heading/subtitle можно передать свои или скрыть (null), чтобы обрамление дал родитель.
import { useState } from 'react';
import Link from 'next/link';
import { useApp } from './AppContext';
import { register } from './apiClient';

export default function RegisterForm({ heading, subtitle, loginRedirect, compact }) {
  const { t } = useApp();
  const [form, setForm] = useState({ email: '', password: '', phone: '', name: '', lastname: '' });
  const [role, setRole] = useState('client'); // client | supplier
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  // В compact-режиме необязательные поля (телефон/имя/фамилия) скрыты под раскрытием —
  // первый шаг короче (email + пароль). Обязательны только email и пароль.
  const [showMore, setShowMore] = useState(false);

  const upd = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const loginHref = loginRedirect ? `/app/login?redirect=${encodeURIComponent(loginRedirect)}` : '/app/login';

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const roleId = role === 'supplier' ? 2 : 3;
      await register({ ...form, email: form.email.trim().toLowerCase(), roleId });
      setDone(true);
    } catch (err) {
      setError(err.message || t('Ошибка регистрации', 'Тіркелу қатесі'));
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div style={{ textAlign: 'center', padding: '8px 0' }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 10, color: '#2C2420' }}>{t('Почти готово', 'Дайын болды')}</h2>
        <p style={{ color: '#6B5A4D', marginBottom: 24 }}>
          {t('Аккаунт создан. Проверьте email для подтверждения, затем войдите.',
             'Аккаунт жасалды. Растау үшін email тексеріп, кіріңіз.')}
        </p>
        <Link href={loginHref} style={{ display: 'inline-block', padding: '12px 24px', borderRadius: 999, background: '#4A3F35', color: '#F5F0E9', fontWeight: 700, textDecoration: 'none' }}>
          {t('Войти', 'Кіру')}
        </Link>
      </div>
    );
  }

  return (
    <div>
      {heading !== null && (
        <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 6, color: '#2C2420' }}>{heading || t('Регистрация', 'Тіркелу')}</h1>
      )}
      {subtitle !== null && (
        <p style={{ color: '#6B5A4D', marginBottom: 22, fontSize: 15 }}>{subtitle || t('Создайте аккаунт Toilab', 'Toilab аккаунтын жасаңыз')}</p>
      )}

      {/* Выбор роли */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
        {[['client', t('Я клиент', 'Мен клиентпін')], ['supplier', t('Я поставщик', 'Мен жеткізушімін')]].map(([val, label]) => (
          <button key={val} type="button" onClick={() => setRole(val)}
            style={{
              flex: 1, padding: '12px', borderRadius: 14, cursor: 'pointer', fontWeight: 700, fontSize: 14,
              border: role === val ? '2px solid #B08D57' : '1px solid #D4C4B0',
              background: role === val ? '#fff' : '#F5F0E9',
              color: '#4A3F35',
            }}>
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Field label="Email" type="email" value={form.email} onChange={upd('email')} required autoComplete="email" />
        <Field label={t('Пароль', 'Құпиясөз')} type="password" value={form.password} onChange={upd('password')} required autoComplete="new-password" />

        {(!compact || showMore) ? (
          <>
            <Field label={`${t('Телефон', 'Телефон')} (${t('необязательно', 'міндетті емес')})`} type="tel" value={form.phone} onChange={upd('phone')} autoComplete="tel" />
            <div style={{ display: 'flex', gap: 12 }}>
              <Field label={t('Имя', 'Аты')} value={form.name} onChange={upd('name')} autoComplete="given-name" />
              <Field label={t('Фамилия', 'Тегі')} value={form.lastname} onChange={upd('lastname')} autoComplete="family-name" />
            </div>
          </>
        ) : (
          <button type="button" onClick={() => setShowMore(true)}
            style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 700, fontSize: 14, cursor: 'pointer', padding: 0 }}>
            + {t('Добавить имя и телефон', 'Аты мен телефон қосу')}
          </button>
        )}

        {error && <div role="alert" aria-live="polite" style={{ color: 'var(--danger)', background: 'var(--danger-bg)', padding: 10, borderRadius: 10, fontSize: 14 }}>{error}</div>}

        <button type="submit" disabled={busy}
          style={{ padding: '14px', borderRadius: 999, background: '#4A3F35', color: '#F5F0E9', fontWeight: 700, fontSize: 16, border: 'none', cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.7 : 1 }}>
          {busy ? t('Регистрация…', 'Тіркелу…') : t('Зарегистрироваться', 'Тіркелу')}
        </button>
      </form>

      <p style={{ marginTop: 16, color: '#6B5A4D', fontSize: 14 }}>
        {t('Уже есть аккаунт?', 'Аккаунт бар ма?')} <Link href={loginHref} style={{ color: '#B08D57', fontWeight: 700 }}>{t('Войти', 'Кіру')}</Link>
      </p>
    </div>
  );
}

function Field({ label, ...rest }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: '#6B5A4D' }}>{label}</span>
      <input {...rest} style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid #D4C4B0', fontSize: 16, color: '#4A3F35', background: '#fff', width: '100%', boxSizing: 'border-box' }} />
    </label>
  );
}
