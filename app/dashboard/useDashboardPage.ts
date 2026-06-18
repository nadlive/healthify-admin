'use client';

import { useAtomValue, useSetAtom } from 'jotai';
import { useMemo, useState } from 'react';
import type { SectionKey } from '@/app/lib/dashboardData';
import { sections } from '@/app/lib/dashboardData';
import { authAtom, clearAuthAtom } from '@/app/lib/authAtom';

export const useDashboardPage = () => {
  const auth = useAtomValue(authAtom);
  const clearAuth = useSetAtom(clearAuthAtom);
  const [activeSection, setActiveSection] = useState<SectionKey>('home');
  const isAuthChecked = true;

  const navigation = useMemo(
    () => [
      { key: 'home', label: 'Home' },
      { key: 'practitioners', label: 'Practitioners' },
      { key: 'patients', label: 'Patients' },
      { key: 'payments', label: 'Payments' },
      {key: 'refunds', label: 'Refunds' },
      { key: 'subscriptions', label: 'Subscriptions' },
    ],
    [],
  );

  const handleLogout = () => {
    setActiveSection('home');
    clearAuth();
  };

  return {
    userEmail: auth.email,
    handleLogout,
    navigation,
    activeSection,
    setActiveSection,
    currentSection: sections[activeSection],
    isAuthChecked,
  };
};
