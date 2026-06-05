'use client';

// Вход в веб-версию (POST /api/auth/login, как в мобильном app).
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '../_lib/AppContext';
import { login } from '../_lib/apiClient';

export default function LoginPage() {
  const { signIn, t } = useApp();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const data = await login({ email, password });
      const token = data?.token || data?.accessToken || data?.access_token;
      if (!token) throw new Error(t('Не получен токен', 'Токен алынбады'));
      await signIn(token, data?.user);
      router.push('/app');
    } catch (err) {
      setError(err.message || t('Ошибка входа', 'Кіру қатесі'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '40px auto' }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>{t('Вход', 'Кіру')}</h1>
      <p style={{ color: '#6B5A4D', marginBottom: 24, fontSize: 15 }}>{t('Войдите в аккаунт Toilab', 'Toilab аккаунтыңызға кіріңіз')}</p>

      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={lbl}>Email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" style={inp} />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={lbl}>{t('Пароль', 'Құпиясөз')}</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" style={inp} />
        </label>

        {error && <div style={{ color: '#A33', background: '#FCEBEB', padding: 10, borderRadius: 10, fontSize: 14 }}>{error}</div>}

        <button type="submit" disabled={busy}
          style={{ padding: '14px', borderRadius: 999, background: '#4A3F35', color: '#F5F0E9', fontWeight: 700, fontSize: 16, border: 'none', cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.7 : 1 }}>
          {busy ? t('Вход…', 'Кіру…') : t('Войти', 'Кіру')}
        </button>
      </form>

      <p style={{ marginTop: 18, color: '#6B5A4D', fontSize: 14 }}>
        {t('Нет аккаунта?', 'Аккаунт жоқ па?')} <Link href="/app/register" style={{ color: '#B08D57' }}>{t('Регистрация', 'Тіркелу')}</Link>
      </p>
      <p style={{ marginTop: 6, color: '#6B5A4D', fontSize: 14 }}>
        <Link href="/app" style={{ color: '#B08D57' }}>← {t('На главную', 'Басты бетке')}</Link>
      </p>
    </div>
  );
}

const lbl = { fontSize: 13, fontWeight: 600, color: '#6B5A4D' };
const inp = { padding: '12px 14px', borderRadius: 12, border: '1px solid #D4C4B0', fontSize: 16, color: '#4A3F35', background: '#fff' };
