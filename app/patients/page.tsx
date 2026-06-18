'use client';

import { Button } from '@/app/components/Button';
import { DashboardShell } from '@/app/components/DashboardShell';
import {
  TwoRowTable,
  type TwoRowTableColumn,
} from '@/app/components/TwoRowTable';
import { useAdminGuard } from '../lib/useAdminGuard';
import type { ProcessedPatient } from './types';
import { usePatientPage } from './usePatientPage';
import { ToastContainer } from 'react-toastify';

export default function PatientsPage() {
  useAdminGuard();
  const {
    handleRenewSubscription,
    handleMakeActive,
    handleMakeInactive,
    handleMakeOverdue,
    handleClearOverdue,
    patients,
    renewingId,
    activatingId,
    makingInactiveId,
    makingOverdueId,
    clearingOverdueId,
    handleViewDetails,
  } = usePatientPage();

  const columns: TwoRowTableColumn<ProcessedPatient>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (patient) => (
        <div className="text-sm font-medium text-slate-900">
          {[patient.firstName, patient.lastName].filter(Boolean).join(' ')}
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (patient) => (
        <div className="text-sm text-slate-900">
          {patient.email ||
            patient.user?.email ||
            patient.user?.username ||
            '-'}
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (patient) => (
        <div className="text-sm text-slate-900">{patient.phone || '-'}</div>
      ),
    },
    {
      key: 'gender',
      header: 'Gender',
      render: (patient) => (
        <div className="text-sm text-slate-900 capitalize">
          {patient.gender || '-'}
        </div>
      ),
    },
    {
      key: 'subscription',
      header: 'Active subscription',
      render: (patient) => {
        const sub = patient.user?.subscriptions?.find(
          (s) => s.status === 'active',
        );
        if (!sub) {
          return (
            <span className="text-sm text-slate-500 italic">
              No active plan
            </span>
          );
        }
        return (
          <div className="text-sm text-slate-900">
            <span className="font-medium">{sub.plan.displayName}</span>
            <span className="text-slate-600">
              {' '}
              · ${sub.plan.price}/{sub.plan.billingPeriod}
            </span>
          </div>
        );
      },
    },
  ];

  return (
    <DashboardShell
      title="Patients"
      description="Monitor patient intake and care here."
      highlight="patients"
    >
      <ToastContainer position="top-right" />
      <div className="space-y-4">
        <TwoRowTable
          columns={columns}
          data={patients}
          getRowKey={(patient) => patient.patient_id}
          emptyMessage="No patients found."
          secondRowLabel="Subscription usage"
          secondRowContent={(patient) => {
            const usages = patient.user?.subscriptionUsages ?? [];
            const canRenew = patient.user?.canRenew ?? true;
            const isActive = patient.user?.isActive ?? true;
            const isOverdue = patient.user?.isOverdue ?? false;
            const patientId = patient.patient_id;
            const isRenewing = renewingId === patientId;
            const isActivating = activatingId === patientId;
            const isMakingInactive = makingInactiveId === patientId;
            const isMakingOverdue = makingOverdueId === patientId;
            const isClearingOverdue = clearingOverdueId === patientId;

            return (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 flex-wrap">
                <div className="flex flex-col gap-3">
                  {usages.length > 0 ? (
                    usages.map((u) => (
                      <div
                        key={u.id}
                        className="flex items-center gap-4 flex-wrap text-sm"
                      >
                        <span className="text-slate-600">
                          <span className="font-medium text-slate-700">
                            Start:
                          </span>{' '}
                          <span className="rounded bg-slate-100 px-2 py-0.5 font-mono">
                            {u.formattedPeriodStart}
                          </span>
                        </span>
                        <span className="text-slate-600">
                          <span
                            className={`font-medium ${
                              u.isPast
                                ? 'text-red-600'
                                : u.isLow
                                  ? 'text-amber-600'
                                  : 'text-slate-700'
                            }`}
                          >
                            End:
                          </span>{' '}
                          <span
                            className={`rounded px-2 py-0.5 font-mono ${
                              u.isPast
                                ? 'bg-red-100 text-red-700'
                                : u.isLow
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {u.formattedPeriodEnd}
                          </span>
                          <span
                            className={`font-medium ${
                              u.isPast
                                ? 'text-red-600'
                                : u.isLow
                                  ? 'text-amber-600'
                                  : 'text-slate-600'
                            }`}
                          >
                            ({u.daysLabel})
                          </span>
                        </span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs capitalize">
                          {u.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500 italic">
                      No subscription usage
                    </span>
                  )}
                  {patient.address && (
                    <span
                      className="text-xs text-slate-500"
                      title={patient.address}
                    >
                      {patient.address.length > 50
                        ? `${patient.address.slice(0, 50)}…`
                        : patient.address}
                    </span>
                  )}
                </div>
                <div className="flex flex-row flex-nowrap gap-2 shrink-0">
                  <Button
                    variant="primary"
                    label="Renew Subscription"
                    onClick={() => handleRenewSubscription(patientId)}
                    disabled={!canRenew || isRenewing}
                    isLoading={isRenewing}
                    loadingText="Renewing…"
                  />
                  <Button
                    variant="secondary"
                    label="View Details"
                    onClick={() => handleViewDetails(patientId)}
                  />
                  {isActive ? (
                    <Button
                      variant="danger"
                      label="Make Inactive"
                      onClick={() => handleMakeInactive(patientId)}
                      disabled={isMakingInactive}
                      isLoading={isMakingInactive}
                      loadingText="Updating…"
                    />
                  ) : (
                    <Button
                      variant="success"
                      label="Make Active"
                      onClick={() => handleMakeActive(patientId)}
                      disabled={isActivating}
                      isLoading={isActivating}
                      loadingText="Activating…"
                    />
                  )}
                  {isOverdue ? (
                    <Button
                      variant="success"
                      label="Clear Overdue"
                      onClick={() => handleClearOverdue(patientId)}
                      disabled={isClearingOverdue}
                      isLoading={isClearingOverdue}
                      loadingText="Clearing…"
                    />
                  ) : (
                    <Button
                      variant="danger"
                      label="Make Overdue"
                      onClick={() => handleMakeOverdue(patientId)}
                      disabled={isMakingOverdue}
                      isLoading={isMakingOverdue}
                      loadingText="Updating…"
                    />
                  )}
                </div>
              </div>
            );
          }}
        />
      </div>
    </DashboardShell>
  );
}
