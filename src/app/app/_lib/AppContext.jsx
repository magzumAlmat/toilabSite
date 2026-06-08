'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { TOKEN_KEY, CITY_KEY, LANG_KEY, getUser } from './apiClient';
import { translations } from './translations';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [city, setCityState] = useState(null);
  const [lang, setLangState] = useState('kz'); // по умолчанию казахский (как в моб. приложении)
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  // Восстановление из localStorage + валидация токена.
  useEffect(() => {
    const c = window.localStorage.getItem(CITY_KEY);
    const l = window.localStorage.getItem(LANG_KEY);
    const tk = window.localStorage.getItem(TOKEN_KEY);
    if (c) setCityState(c);
    if (l) setLangState(l);
    if (tk) {
      setToken(tk);
      getUser()
        .then((u) => setUser(u?.user || u))
        .catch(() => {
          window.localStorage.removeItem(TOKEN_KEY);
          setToken(null);
        })
        .finally(() => setReady(true));
    } else {
      setReady(true);
    }
  }, []);

  // Синхронизируем атрибут <html lang> с выбранным языком (kz по умолчанию).
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setCity = useCallback((c) => {
    setCityState(c);
    window.localStorage.setItem(CITY_KEY, c);
  }, []);

  const setLang = useCallback((l) => {
    setLangState(l);
    window.localStorage.setItem(LANG_KEY, l);
  }, []);

  const signIn = useCallback(async (tk, u) => {
    window.localStorage.setItem(TOKEN_KEY, tk);
    setToken(tk);
    if (u) {
      setUser(u);
    } else {
      try {
        const res = await getUser();
        setUser(res?.user || res);
      } catch {
        /* ignore */
      }
    }
  }, []);

  const signOut = useCallback(() => {
    window.localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = {
    city, setCity,
    lang, setLang,
    token, user, ready,
    isAuth: !!token,
    signIn, signOut,
    // t(ru, kz?) — на русском возвращает ru; на казахском: явный kz, иначе перевод из словаря, иначе ru.
    t: (ru, kz) => (lang === 'ru' ? ru : (kz || translations[ru] || ru)),
    // tr(value) — перевод значения данных (район/кухня/тип…) на текущий язык.
    tr: (s) => (lang === 'ru' || s == null ? s : (translations[s] || s)),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
