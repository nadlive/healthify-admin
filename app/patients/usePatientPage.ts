import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useMutation, useQuery } from '@/app/lib/apiClient';
import { toast } from 'react-toastify';
import type {
  Patient,
  ProcessedPatient,
  ProcessedPatientUser,
  ProcessedSubscriptionUsage,
  SubscriptionUsage,
} from './types';

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

function daysUntilEnd(periodEnd: string): number {
  const end = new Date(periodEnd);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function processUsage(u: SubscriptionUsage): ProcessedSubscriptionUsage {
  const days = daysUntilEnd(u.periodEnd);
  const isLow = days <= 7 && days >= 0;
  const isPast = days < 0;
  return {
    ...u,
    formattedPeriodStart: formatDate(u.periodStart),
    formattedPeriodEnd: formatDate(u.periodEnd),
    days,
    isLow,
    isPast,
    daysLabel: isPast ? `${Math.abs(days)} days ago` : `${days} days left`,
  };
}

function processPatient(patient: Patient): ProcessedPatient {
  const user = patient.user;
  if (!user) {
    return {
      ...patient,
      user: undefined,
    };
  }

  const processedUsages = (user.subscriptionUsages ?? []).map(processUsage);
  const activeUsage = processedUsages.find((u) => u.status === 'active');
  const activeDaysLeft = activeUsage?.periodEnd
    ? daysUntilEnd(activeUsage.periodEnd)
    : null;
  const canRenew = activeDaysLeft === null || activeDaysLeft <= 0;

  const processedUser: ProcessedPatientUser = {
    ...user,
    subscriptionUsages: processedUsages,
    activeDaysLeft,
    canRenew,
  };

  return {
    ...patient,
    user: processedUser,
  };
}

export const usePatientPage = () => {
  const [renewingId, setRenewingId] = useState<string | null>(null);
  const [activatingId, setActivatingId] = useState<string | null>(null);
  const [makingInactiveId, setMakingInactiveId] = useState<string | null>(null);
  const [clearingOverdueId, setClearingOverdueId] = useState<string | null>(null);
  const [makingOverdueId, setMakingOverdueId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { mutate: renewSubscription, error: renewSubscriptionError } =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useMutation as any)('post', '/subscriptions/patient/{id}/renew');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: patientsData } = (useQuery as any)(
    'get',
    '/patients',
  );

  const patients = useMemo(() => {
    const raw = (patientsData?.data ?? []) as Patient[];
    return raw.map(processPatient);
  }, [patientsData?.data]);

  const handleRenewSubscription = (patientId: string) => {
    setRenewingId(patientId);
    renewSubscription(
      {
        params: {
          path: { id: patientId },
        },
      },
      {
        onSuccess: () => {
          toast.success('Subscription renewed successfully');
          queryClient.invalidateQueries({ queryKey: ['get', '/patients'] });
        },
        onError: (err: { error?: string }) => {
          toast.error(err?.error ?? 'Failed to renew subscription');
        },
        onSettled: () => {
          setRenewingId(null);
        },
      },
    );
  };

  const handleViewDetails = (patientId: string) => {
    console.log('Viewing details for patient', patientId);
  };

  const { mutate: makeInactiveMutation, error: makeInactiveError } =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useMutation as any)('post', '/patients/{id}/make-inactive');
  const handleMakeInactive = (patientId: string) => {
    setMakingInactiveId(patientId);
    makeInactiveMutation(
      {
        params: {
          path: { id: patientId },
        },
      },
      {
        onSuccess: () => {
          toast.success('Patient made inactive successfully');
          queryClient.invalidateQueries({ queryKey: ['get', '/patients'] });
        },
        onError: (err: { error?: string }) => {
          toast.error(err?.error ?? 'Failed to make patient inactive');
        },
        onSettled: () => {
          setMakingInactiveId(null);
        },
      },
    );
  };

  const { mutate: makeActiveMutation, error: makeActiveError } =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useMutation as any)('post', '/patients/{id}/make-active');
  const handleMakeActive = (patientId: string) => {
    setActivatingId(patientId);
    makeActiveMutation(
      {
        params: {
          path: { id: patientId },
        },
      },
      {
        onSuccess: () => {
          toast.success('Patient activated successfully');
          queryClient.invalidateQueries({ queryKey: ['get', '/patients'] });
        },
        onError: (err: { error?: string }) => {
          toast.error(err?.error ?? 'Failed to activate patient');
        },
        onSettled: () => {
          setActivatingId(null);
        },
      },
    );
  };

  const { mutate: makeOverdueMutation, error: makeOverdueError } =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useMutation as any)('post', '/patients/{id}/make-overdue');
  const handleMakeOverdue = (patientId: string) => {
    setMakingOverdueId(patientId);
    makeOverdueMutation(
      {
        params: {
          path: { id: patientId },
        },
      },
      {
        onSuccess: () => {
          toast.success('Patient marked as overdue successfully');
          queryClient.invalidateQueries({ queryKey: ['get', '/patients'] });
        },
        onError: (err: { error?: string }) => {
          toast.error(err?.error ?? 'Failed to mark patient as overdue');
        },
        onSettled: () => {
          setMakingOverdueId(null);
        },
      },
    );
  };

  const { mutate: clearOverdueMutation, error: clearOverdueError } =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useMutation as any)('post', '/patients/{id}/clear-overdue');
  const handleClearOverdue = (patientId: string) => {
    setClearingOverdueId(patientId);
    clearOverdueMutation(
      {
        params: {
          path: { id: patientId },
        },
      },
      {
        onSuccess: () => {
          toast.success('Overdue status cleared successfully');
          queryClient.invalidateQueries({ queryKey: ['get', '/patients'] });
        },
        onError: (err: { error?: string }) => {
          toast.error(err?.error ?? 'Failed to clear overdue status');
        },
        onSettled: () => {
          setClearingOverdueId(null);
        },
      },
    );
  };

  return {
    handleRenewSubscription,
    handleMakeActive,
    handleMakeInactive,
    handleMakeOverdue,
    handleClearOverdue,
    patients,
    error:
      renewSubscriptionError?.error ||
      makeInactiveError?.error ||
      makeActiveError?.error ||
      makeOverdueError?.error ||
      clearOverdueError?.error,
    renewingId,
    activatingId,
    makingInactiveId,
    makingOverdueId,
    clearingOverdueId,
    handleViewDetails,
  };
};
