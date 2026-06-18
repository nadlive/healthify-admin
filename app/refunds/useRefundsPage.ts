'use client';

import { useMemo } from 'react';
import { useQuery, useMutation } from '@/app/lib/apiClient';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

export type Refund = {
  id: string;
  patientName: string;
  invoiceNumber: string;
  refundAmount: number;
  totalPaid: number;
  availableForRefund: number;
  status: string;
  createdAt: string;
  invoicePeriodStart?: string | null;
  invoicePeriodEnd?: string | null;
};

export const useRefundDetails = (refundId?: string) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (useQuery as any)(
    'get',
    refundId ? `/refunds/${refundId}/details` : null,
    {
      enabled: !!refundId,
    }
  );
};

export const useRefundsPage = () => {
  const queryClient = useQueryClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = (useQuery as any)('get', '/refunds');

  const refunds: Refund[] = useMemo(() => {
    return (data ?? []) as Refund[];
  }, [data]);

  const { mutate: updateStatus } =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useMutation as any)(
      'put',
      '/refunds/{refundId}/status'
    );

  const handleUpdateStatus = (
    refundId: string,
    status: string,
    note?: string,
    refundAmount?: number,
  ) => {
    updateStatus(
      {
        params: { path: { refundId } },
        body: { status, note, refundAmount },
      },
      {
        onSuccess: () => {
          toast.success('Refund marked as refunded');
          queryClient.invalidateQueries({
            queryKey: ['get', '/refunds'],
          });
        },
        onError: (err: { error?: string }) => {
          toast.error(err?.error ?? 'Failed to update refund');
        },
      },
    );
  };

  return {
    refunds,
    handleUpdateStatus,
  };
};
