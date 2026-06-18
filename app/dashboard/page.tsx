'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { SectionKey } from '@/app/lib/dashboardData';
import { useDashboardPage } from './useDashboardPage';
import { useAdminGuard } from '../lib/useAdminGuard';

export default function DashboardPage() {
  useAdminGuard()
  const {
    userEmail,
    handleLogout,
    navigation,
    activeSection,
    setActiveSection,
    currentSection,
    isAuthChecked,
  } = useDashboardPage();
  const router = useRouter();
  const isHome = activeSection === 'home';

  const handleNavSelect = (key: SectionKey) => {
    if (key === 'home') {
      setActiveSection('home');
      return;
    }
    router.push(`/${key}`);
  };

  if (!isAuthChecked) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <p className="text-sm text-slate-500">Loading portal…</p>
      </main>
    );
  }

  if (!userEmail) {
    return null;
  }
  

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-4 p-4 lg:flex-row">
        <aside className="flex w-full flex-col gap-6 rounded-3xl bg-[#380b52] px-6 py-8 text-white shadow-xl lg:w-64">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
              Healthyfy Admin
            </p>
            <p className="text-lg font-semibold">Control Center</p>
            <p className="text-xs text-white/70">{userEmail}</p>
          </div>
          <nav className="flex flex-col gap-1">
            {navigation.map((item) => (
              <button
                key={item.key}
                onClick={() => handleNavSelect(item.key as SectionKey)}
                className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition ${
                  activeSection === item.key
                    ? 'bg-white text-[#380b52]'
                    : 'text-white/70 hover:bg-white/10'
                }`}
              >
                <span>{item.label}</span>
                {activeSection === item.key ? (
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Active
                  </span>
                ) : null}
              </button>
            ))}
          </nav>
          <button
            onClick={handleLogout}
            className="rounded-xl border border-white/20 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Logout
          </button>
        </aside>

        <section className="flex-1 rounded-3xl bg-white p-6 shadow-lg">
          <div className="mb-6 flex flex-col gap-4 border-b border-slate-100 pb-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {isHome ? 'Unified workspace' : 'Module workspace'}
              </p>
              <h1 className="text-3xl font-semibold text-slate-900">
                {isHome ? 'Home' : currentSection.title}
              </h1>
              <p className="text-sm text-slate-500">
                {currentSection.description ?? 'No description provided yet.'}
              </p>
            </div>
            <div />
          </div>

          <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50">
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-700">
                Workspace is blank
              </p>
              <p className="text-xs text-slate-500">
                Add content to the{' '}
                {isHome ? 'home' : currentSection.title.toLowerCase()} module
                when ready.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
