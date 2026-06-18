'use client';

import { Suspense } from 'react';
import { useCallbackPage } from './useCallbackPage';

function OAuthCallbackContent() {
  const { status, message, handleBackToLogin } = useCallbackPage();

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold text-slate-600">
          {status === 'pending' ? 'One moment…' : 'Sign-in issue'}
        </p>
        <p className="mt-2 text-sm text-slate-500">{message}</p>
        {status === 'error' ? (
          <button
            onClick={handleBackToLogin}
            className="mt-6 inline-flex items-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Back to login
          </button>
        ) : null}
      </section>
    </main>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
          <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="text-sm font-semibold text-slate-600">One moment…</p>
            <p className="mt-2 text-sm text-slate-500">Loading…</p>
          </section>
        </main>
      }
    >
      <OAuthCallbackContent />
    </Suspense>
  );
}
