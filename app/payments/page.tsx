'use client';

import { DashboardShell } from '@/app/components/DashboardShell';
import { useAdminGuard } from '../lib/useAdminGuard';

export default function PaymentsPage() {
  useAdminGuard()
  return (
    <DashboardShell
      title="Payments"
      description="Track payouts and billing workflows."
      highlight="payments"
    >
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
        <p className="text-sm text-slate-500">Content not added yet.</p>
      </div>
    </DashboardShell>
  );
}
