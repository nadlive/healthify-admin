'use client';

import { useAtomValue, useSetAtom } from 'jotai';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { type SectionKey, sections } from '@/app/lib/dashboardData';
import { authAtom, clearAuthAtom } from '@/app/lib/authAtom';

type DashboardShellProps = {
  children: React.ReactNode;
  title: string;
  description?: string;
  highlight?: SectionKey;
};

const navigationMap: Array<{ key: SectionKey; href: string; label: string }> = [
  { key: 'home', href: '/dashboard', label: sections.home.title },
  {
    key: 'practitioners',
    href: '/practitioners',
    label: sections.practitioners.title,
  },
  { key: 'patients', href: '/patients', label: sections.patients.title },
  { key: 'payments', href: '/payments', label: sections.payments.title },
  { key: 'refunds', href: '/refunds', label: sections.refunds.title },
  {
    key: 'subscriptions',
    href: '/subscriptions',
    label: sections.subscriptions.title,
  },
];

export function DashboardShell({
  children,
  title,
  description,
  highlight,
}: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAtomValue(authAtom);
  const clearAuth = useSetAtom(clearAuthAtom);

  const activeKey =
    highlight ??
    navigationMap.find((item) => item.href === pathname)?.key ??
    'home';

  const handleLogout = () => {
    clearAuth();
    router.replace('/login');
  };

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-4 p-4 lg:flex-row">
        <aside className="flex w-full flex-col gap-6 rounded-3xl bg-[#380b52] px-6 py-8 text-white shadow-xl lg:w-64">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
              Healthyfy Admin
            </p>
            <p className="text-lg font-semibold">Control Center</p>
            <p className="text-xs text-white/70">
              {auth.email ?? 'Navigation'}
            </p>
          </div>
          <nav className="flex flex-col gap-1">
            {navigationMap.map((item) => {
              const isActive = item.key === activeKey;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? 'bg-white text-[#380b52]'
                      : 'text-white/70 hover:bg-white/10'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive ? (
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Active
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
          <button
            onClick={handleLogout}
            className="mt-auto rounded-xl border border-white/20 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Logout
          </button>
        </aside>

        <section className="flex-1 rounded-3xl bg-white p-6 shadow-lg">
          <div className="mb-6 border-b border-slate-100 pb-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Module workspace
            </p>
            <h1 className="text-3xl font-semibold text-slate-900">{title}</h1>
            {description ? (
              <p className="text-sm text-slate-500">{description}</p>
            ) : null}
          </div>
          {children}
        </section>
      </div>
    </main>
  );
}
