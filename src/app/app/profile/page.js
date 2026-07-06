'use client';

// Профиль пользователя (как моб. Item4Screen): редактирование имени/фамилии/
// телефона (POST /api/auth/addfullprofile) и удаление аккаунта (DELETE /api/profile).
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '../_lib/AppContext';
import { updateProfile, deleteAccount } from '../_lib/apiClient';

// Формат телефона — как в моб. app: +7XXXXXXXXXX.
const isValidPhone = (p) => /^\+7\d{10}$/.test(p);

export default function ProfilePage() {
  const { ready, isAuth, user, refreshUser, signOut, t } = useApp();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', lastname: '', phone: '' });
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user) setForm({ name: user.name || '', lastname: user.lastname || '', phone: user.phone || '' });
  }, [user]);

  const onSave = async (e) => {
    e.preventDefault();
    const phone = form.phone.trim();
    if (phone && !isValidPhone(phone)) {
      setError(t('Телефон в формате +7XXXXXXXXXX', 'Телефон форматы: +7XXXXXXXXXX'));
      return;
    }
    setBusy(true);
    setError('');
    setSaved(false);
    try {
      await updateProfile({ name: form.name.trim(), lastname: form.lastname.trim(), phone });
      await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.message || t('Не удалось сохранить', 'Сақтау мүмкін болмады'));
    } finally {
      setBusy(false);
    }
  };

  // Удаление аккаунта — необратимо (двойное подтверждение, как alert в моб. app).
  const onDeleteAccount = async () => {
    if (!confirm(t('Вы уверены, что хотите удалить свой аккаунт? Это действие необратимо.', 'Аккаунтты жойғыңыз келе ме? Бұл әрекетті қайтару мүмкін емес.'))) return;
    if (!confirm(t('Удалить аккаунт навсегда?', 'Аккаунтты біржола жою керек пе?'))) return;
    setDeleting(true);
    try {
      await deleteAccount();
      signOut();
      router.push('/app');
    } catch (err) {
      alert(err.message || t('Не удалось удалить аккаунт', 'Аккаунтты жою мүмкін болмады'));
      setDeleting(false);
    }
  };

  if (!ready) return null;
  if (!isAuth) {
    return (
      <div style={{ textAlign: 'center', padding: '56px 0' }}>
        <p style={{ color: 'var(--ink-2)', marginBottom: 20 }}>{t('Войдите, чтобы открыть профиль.', 'Профильді ашу үшін кіріңіз.')}</p>
        <Link href="/app/login?redirect=/app/profile" style={{ color: 'var(--accent)', fontWeight: 700 }}>{t('Войти', 'Кіру')}</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 480, margin: '24px auto' }}>
      <h1 className="tl-display" style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>{t('Профиль', 'Профиль')}</h1>
      <p style={{ color: 'var(--ink-3)', fontSize: 14, marginBottom: 22 }}>{user?.email}</p>

      <form onSubmit={onSave} style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r)', padding: 18, boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <label style={col}><span style={lbl}>{t('Имя', 'Аты')}</span>
          <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} autoComplete="given-name" style={inp} /></label>
        <label style={col}><span style={lbl}>{t('Фамилия', 'Тегі')}</span>
          <input value={form.lastname} onChange={(e) => setForm((f) => ({ ...f, lastname: e.target.value }))} autoComplete="family-name" style={inp} /></label>
        <label style={col}><span style={lbl}>{t('Телефон', 'Телефон')}</span>
          <input type="tel" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+7XXXXXXXXXX" autoComplete="tel" style={inp} /></label>

        {error && <div role="alert" style={{ color: 'var(--danger)', background: 'var(--danger-bg)', padding: 10, borderRadius: 10, fontSize: 14 }}>{error}</div>}
        {saved && <div role="status" style={{ color: 'var(--ok)', background: 'rgba(47,125,87,0.08)', border: '1px solid rgba(47,125,87,0.25)', padding: 10, borderRadius: 10, fontSize: 14, fontWeight: 600 }}>✓ {t('Сохранено', 'Сақталды')}</div>}

        <button type="submit" disabled={busy}
          style={{ padding: '14px', borderRadius: 'var(--r-pill)', background: 'var(--brand)', color: 'var(--on-brand)', fontWeight: 700, fontSize: 16, border: 'none', cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.7 : 1 }}>
          {busy ? t('Сохранение…', 'Сақталуда…') : t('Сохранить', 'Сақтау')}
        </button>
      </form>

      {/* Опасная зона: удаление аккаунта (требование сторов; паритет с моб. app) */}
      <div style={{ marginTop: 26, border: '1px solid rgba(192,73,47,0.25)', borderRadius: 'var(--r)', padding: 16 }}>
        <div style={{ fontWeight: 800, color: 'var(--danger)', fontSize: 15, marginBottom: 6 }}>{t('Удаление аккаунта', 'Аккаунтты жою')}</div>
        <p style={{ color: 'var(--ink-3)', fontSize: 13, marginBottom: 12 }}>{t('Действие необратимо: данные и мероприятия будут удалены.', 'Әрекет қайтарылмайды: деректер мен іс-шаралар жойылады.')}</p>
        <button type="button" onClick={onDeleteAccount} disabled={deleting}
          style={{ padding: '10px 18px', borderRadius: 'var(--r-pill)', background: 'var(--danger-bg)', color: 'var(--danger)', fontWeight: 700, fontSize: 14, border: '1px solid rgba(192,73,47,0.35)', cursor: deleting ? 'default' : 'pointer' }}>
          {deleting ? t('Удаление…', 'Жойылуда…') : t('Удалить аккаунт', 'Аккаунтты жою')}
        </button>
      </div>
    </div>
  );
}

const col = { display: 'flex', flexDirection: 'column', gap: 6 };
const lbl = { fontSize: 13, fontWeight: 700, color: 'var(--ink-2)' };
const inp = { padding: '13px 14px', borderRadius: 'var(--r-sm)', border: '1px solid var(--line-2)', fontSize: 16, color: 'var(--ink)', background: 'var(--surface)' };
