'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { login as apiLogin, fetchCurrentUser } from '../api/auth';
import { ADMIN_ROLE_ID, TOKEN_STORAGE_KEY } from '../config';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // первичная проверка токена

  // При старте — если есть сохранённый токен, пробуем восстановить сессию.
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    fetchCurrentUser()
      .then((u) => {
        if (u && u.roleId === ADMIN_ROLE_ID) {
          setUser(u);
        } else {
          localStorage.removeItem(TOKEN_STORAGE_KEY);
        }
      })
      .catch(() => localStorage.removeItem(TOKEN_STORAGE_KEY))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const { token } = await apiLogin(email, password);
    if (!token) {
      throw new Error('Сервер не вернул токен авторизации');
    }
    localStorage.setItem(TOKEN_STORAGE_KEY, token);

    const u = await fetchCurrentUser();
    if (!u || u.roleId !== ADMIN_ROLE_ID) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      throw new Error('Доступ только для администраторов (модераторов)');
    }
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth должен использоваться внутри AuthProvider');
  return ctx;
}
