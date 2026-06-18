'use client';

import { DashboardShell } from '@/app/components/DashboardShell';
import { useAdminGuard } from '../lib/useAdminGuard';

export default function SubscriptionsPage() {
  useAdminGuard()
  return (
    <DashboardShell
      title="Subscriptions"
      description="Manage plan tiers and renewals."
      highlight="subscriptions"
    >
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
        <p className="text-sm text-slate-500">Content not added yet.</p>
      </div>
    </DashboardShell>
  );
}
