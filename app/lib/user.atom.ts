'use client';

import { atom } from 'jotai';

export type User = {
  id: string;
  username: string;
  email: string;
  role: 'admin';
  name: string;
};

const STORAGE_KEY = 'healthyfy_admin_user';


const getInitialUser = (): User | null => {
  if (typeof window === 'undefined') return null;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored) as User;
  } catch {
    return null;
  }
};


export const userHydratedAtom = atom(false);


export const userAtom = atom<User | null>(getInitialUser());


export const setUserAtom = atom(
  null,
  (_get, set, user: User) => {
    if (user.role !== 'admin') {
      throw new Error('Attempted to set non-admin user');
    }

    set(userAtom, user);
    set(userHydratedAtom, true);

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    }
  }
);


export const clearUserAtom = atom(
  null,
  (_get, set) => {
    set(userAtom, null);
    set(userHydratedAtom, true);

    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
);
