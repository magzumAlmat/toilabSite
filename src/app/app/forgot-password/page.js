'use client';

// Восстановление пароля (как моб. RestorePasswordScreen):
// POST /api/forgot-password { email } → письмо со ссылкой для сброса.
import { useState } from 'react';
import Link from 'next/link';
import { useApp } from '../_lib/AppContext';
import { forgotPassword } from '../_lib/apiClient';

export default function ForgotPasswordPage() {
  const { t } = useApp();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await forgotPassword(email.trim().toLowerCase());
      setSent(true);
    } catch (err) {
      setError(err.message || t('Произошла ошибка при отправке письма', 'Хат жіберу кезінде қате шықты'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '40px auto' }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>{t('Восстановление пароля', 'Құпиясөзді қалпына келтіру')}</h1>

      {sent ? (
        <div style={{ marginTop: 16 }}>
          <div role="status" style={{ color: 'var(--ok)', background: 'rgba(47,125,87,0.08)', border: '1px solid rgba(47,125,87,0.25)', padding: '14px 16px', borderRadius: 12, fontSize: 15, fontWeight: 600 }}>
            ✓ {t('Ссылка для сброса пароля отправлена на ваш Email', 'Құпиясөзді қалпына келтіру сілтемесі Email-ге жіберілді')}
          </div>
          <p style={{ marginTop: 18, color: '#6B5A4D', fontSize: 14 }}>
            <Link href="/app/login" style={{ color: '#B08D57', fontWeight: 700 }}>← {t('Вернуться ко входу', 'Кіруге оралу')}</Link>
          </p>
        </div>
      ) : (
        <>
          <p style={{ color: '#6B5A4D', marginBottom: 24, fontSize: 15 }}>
            {t('Укажите Email — отправим ссылку для сброса пароля.', 'Email көрсетіңіз — құпиясөзді қалпына келтіру сілтемесін жібереміз.')}
          </p>
          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={lbl}>Email</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" style={inp} />
            </label>

            {error && <div role="alert" style={{ color: '#A33', background: '#FCEBEB', padding: 10, borderRadius: 10, fontSize: 14 }}>{error}</div>}

            <button type="submit" disabled={busy}
              style={{ padding: '14px', borderRadius: 999, background: '#4A3F35', color: '#F5F0E9', fontWeight: 700, fontSize: 16, border: 'none', cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.7 : 1 }}>
              {busy ? t('Отправка…', 'Жіберілуде…') : t('Отправить ссылку', 'Сілтеме жіберу')}
            </button>
          </form>
          <p style={{ marginTop: 18, color: '#6B5A4D', fontSize: 14 }}>
            <Link href="/app/login" style={{ color: '#B08D57' }}>← {t('Вернуться ко входу', 'Кіруге оралу')}</Link>
          </p>
        </>
      )}
    </div>
  );
}

const lbl = { fontSize: 13, fontWeight: 600, color: '#6B5A4D' };
const inp = { padding: '12px 14px', borderRadius: 12, border: '1px solid #D4C4B0', fontSize: 16, color: '#4A3F35', background: '#fff' };
