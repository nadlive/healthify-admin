'use client';

import { atom } from 'jotai';

export type AuthState = {
  token: string | null;
  email: string | null;
  refreshToken: string | null;
};

const COOKIE_NAME = 'healthyfy_admin_auth';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

const setCookie = (value: string) => {
  if (typeof document === 'undefined') {
    return;
  }
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(
    value,
  )}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
};

const removeCookie = () => {
  if (typeof document === 'undefined') {
    return;
  }
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
};

const getInitialAuthState = (): AuthState => {
  if (typeof window === 'undefined') {
    return { token: null, email: null, refreshToken: null };
  }
  const stored = window.localStorage.getItem('healthyfy_admin_auth');
  if (!stored) {
    return { token: null, email: null, refreshToken: null };
  }
  try {
    return JSON.parse(stored) as AuthState;
  } catch {
    return { token: null, email: null, refreshToken: null };
  }
};

export const authAtom = atom<AuthState>(getInitialAuthState());

export const setAuthAtom = atom(
  null,
  (get, set, update: Partial<AuthState>) => {
    const current = get(authAtom);
    const next = { ...current, ...update };
    set(authAtom, next);
    if (typeof window !== 'undefined') {
      if (next.token || next.email) {
        const serialized = JSON.stringify(next);
        window.localStorage.setItem('healthyfy_admin_auth', serialized);
        setCookie(serialized);
      } else {
        window.localStorage.removeItem('healthyfy_admin_auth');
        removeCookie();
      }
    }
  },
);

export const clearAuthAtom = atom(null, (get, set) => {
  set(authAtom, { token: null, email: null, refreshToken: null });
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem('healthyfy_admin_auth');
    removeCookie();
  }
});
