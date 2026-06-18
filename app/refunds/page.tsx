/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { DashboardShell } from '@/app/components/DashboardShell';
import { TwoRowTable } from '@/app/components/TwoRowTable';
import { Button } from '@/app/components/Button';
import { useAdminGuard } from '../lib/useAdminGuard';
import { Refund, useRefundsPage, useRefundDetails } from './useRefundsPage';
import { ToastContainer, toast } from 'react-toastify';

function RefundDetails({ refundId }: { refundId: string }) {
  const { data, isLoading, isError } = useRefundDetails(refundId);

  if (isLoading) {
    return (
      <div className="p-3 text-sm text-slate-500">
        Loading refund details...
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-3 text-sm text-red-500">
        Failed to load refund details
      </div>
    );
  }

  const { refund, invoice, payments, patient } = data;

  return (
    <div className="bg-slate-50 border rounded-lg p-4 text-sm space-y-5">
      <div>
        <h4 className="font-semibold text-slate-700 mb-1">Patient Details</h4>
        <p className="text-slate-900 font-medium">{patient?.name || '—'}</p>
        <p className="text-xs text-slate-500">
          User ID: {patient?.userId || '—'}
        </p>
      </div>

      <div>
        <h4 className="font-semibold text-slate-700 mb-1">
          Refund Information
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <p>
            <span className="text-slate-500">Amount:</span>{' '}
            <span className="font-semibold text-red-600">
              LKR {refund?.amount}
            </span>
          </p>
          <p className="text-black">
            <span className="text-slate-500">Status:</span>{' '}
            <span className="font-semibold capitalize">{refund?.status}</span>
          </p>
          <p className="col-span-2 text-black">
            <span className="text-slate-700">Note:</span> {refund?.note || '—'}
          </p>
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-slate-700 mb-2">Invoice Details</h4>
        <div className="bg-white border rounded-md text-slate-700 p-3">
          <p className="font-medium">
            Invoice No: {invoice?.invoiceNumber || '—'}
          </p>
          <p className="text-xs text-slate-500">
            Status: {invoice?.status || '—'}
          </p>
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-slate-700 mb-2">Invoice Items</h4>
        {invoice?.items?.length ? (
          <div className="border rounded-md overflow-hidden">
            {invoice.items.map((item: any) => (
              <div
                key={item.id}
                className="flex justify-between px-3 py-2 border-b last:border-b-0 bg-white"
              >
                <span className="text-slate-700">{item.description}</span>
                <span className="font-semibold text-slate-900">
                  LKR {item.amount}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-sm">No invoice items found.</p>
        )}
      </div>

      <div>
        <h4 className="font-semibold text-slate-700 mb-2">
          Payments (with Metadata)
        </h4>

        {payments?.length ? (
          <div className="space-y-2">
            {payments.map((payment: any) => (
              <div key={payment.id} className="border rounded-md p-3 bg-white">
                <div className="flex justify-between items-center">
                  <span className="font-semibold capitalize text-slate-700">
                    {payment.status}
                  </span>
                  <span className="font-bold text-green-600">
                    LKR {payment.amount}
                  </span>
                </div>

                <div className="text-xs text-slate-500 mt-1">
                  Method: {payment.method}
                </div>

                {payment.reason && (
                  <div className="text-xs text-slate-500">
                    Reason: {payment.reason}
                  </div>
                )}

                {payment.metadata && (
                  <div className="mt-2">
                    <p className="text-xs font-semibold text-blue-800 mb-1">
                      Metadata
                    </p>
                    <pre className="text-xs bg-slate-100 text-blue-800 p-2 rounded overflow-auto">
                      {JSON.stringify(payment.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-sm">No related payments found.</p>
        )}
      </div>
    </div>
  );
}

export default function RefundsPage() {
  useAdminGuard();

  const { refunds, handleUpdateStatus } = useRefundsPage();

  const [notes, setNotes] = useState<Record<string, string>>({});
  const [editedAmounts, setEditedAmounts] = useState<Record<string, number>>(
    {},
  );
  const [expandedRefundId, setExpandedRefundId] = useState<string | null>(null);

  const columns = [
    {
      key: 'patient',
      header: 'Patient',
      render: (refund: Refund) => (
        <div className="text-sm font-medium text-indigo-700">
          {refund.patientName || '—'}
        </div>
      ),
    },
    {
      key: 'invoice',
      header: 'Invoice',
      render: (refund: Refund) => (
        <div className="text-sm text-slate-800 font-semibold">
          {refund.invoiceNumber || '—'}
        </div>
      ),
    },
    {
      key: 'period',
      header: 'Billing Period',
      render: (refund: Refund) => (
        <div className="text-xs text-slate-600">
          {refund.invoicePeriodStart && refund.invoicePeriodEnd
            ? `${new Date(refund.invoicePeriodStart).toLocaleDateString()} 
           to
           ${new Date(refund.invoicePeriodEnd).toLocaleDateString()}`
            : '—'}
        </div>
      ),
    },
    {
      key: 'refundAmount',
      header: 'Refund Amount',
      render: (refund: Refund) => {
        const isLocked = refund.status === 'paid';

        return (
          <input
            disabled={isLocked}
            type="number"
            min={0}
            className="w-32 border rounded px-2 py-1 text-sm text-red-600 font-semibold focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            value={
              isLocked
                ? 0
                : (editedAmounts[refund.id] ?? refund.refundAmount ?? 0)
            }
            onChange={(e) =>
              setEditedAmounts({
                ...editedAmounts,
                [refund.id]: Number(e.target.value),
              })
            }
          />
        );
      },
    },
    {
      key: 'totalPaid',
      header: 'Total Paid',
      render: (refund: Refund) => (
        <div className="text-sm text-green-600 font-medium">
          LKR {refund.totalPaid}
        </div>
      ),
    },
    {
      key: 'available',
      header: 'Available for Refund',
      render: (refund: Refund) => (
        <div className="text-sm text-orange-600 font-semibold">
          LKR {refund.availableForRefund}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (refund: Refund) => {
        const statusColors: Record<string, string> = {
          'refund pending': 'bg-yellow-100 text-yellow-800',
          refunded: 'bg-green-100 text-green-800',
          paid: 'bg-green-100 text-green-800',
          failed: 'bg-red-100 text-red-800',
        };

        return (
          <span
            className={`rounded-full px-2 py-1 text-xs capitalize font-semibold ${
              statusColors[refund.status] || 'bg-slate-100 text-slate-800'
            }`}
          >
            {refund.status}
          </span>
        );
      },
    },
  ];

  return (
    <DashboardShell
      title="Refunds"
      description="Manage payment refunds."
      highlight="refunds"
    >
      <ToastContainer position="top-right" />

      <TwoRowTable
        columns={columns}
        data={refunds}
        getRowKey={(refund: Refund) => refund.id}
        emptyMessage="No refunds found."
        secondRowLabel="Actions"
        secondRowContent={(refund: Refund) => {
          const isExpanded = expandedRefundId === refund.id;

          return (
            <div className="flex flex-col gap-3">
              <textarea
                placeholder="Add note..."
                className="border rounded px-2 py-1 text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                value={notes[refund.id] || ''}
                onChange={(e) =>
                  setNotes({
                    ...notes,
                    [refund.id]: e.target.value,
                  })
                }
              />

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  label={isExpanded ? 'Hide Details' : 'See Details'}
                  onClick={() => {
                    setExpandedRefundId((prev) =>
                      prev === refund.id ? null : refund.id,
                    );
                  }}
                />

                <Button
                  variant="primary"
                  label="Mark Refunded"
                  disabled={
                    refund.status === 'refunded' || refund.status === 'paid'
                  }
                  onClick={() => {
                    const amount =
                      editedAmounts[refund.id] ?? refund.refundAmount;

                    if (amount > refund.availableForRefund) {
                      toast.error('Refund amount exceeds available amount');
                      return;
                    }

                    handleUpdateStatus(
                      refund.id,
                      'paid',
                      notes[refund.id],
                      amount,
                    );
                  }}
                />
              </div>

              {isExpanded && (
                <div className="mt-2">
                  <RefundDetails refundId={refund.id} />
                </div>
              )}
            </div>
          );
        }}
      />
    </DashboardShell>
  );
}
