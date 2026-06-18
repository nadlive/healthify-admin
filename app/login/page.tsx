'use client';

import { useLoginPage } from './useLoginPage';
import { Button } from '@/app/components/Button';

export default function LoginPage() {
  const { isAuthChecked, startGoogleLogin } = useLoginPage();

  if (!isAuthChecked) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <p className="text-sm text-slate-500">Loading portal…</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <header className="mb-6">
          <p className="text-sm font-medium uppercase text-slate-500">
            Healthyfy Admin...
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">
            Sign in
          </h1>
          <p className="text-sm text-slate-500">
            Authenticate with your Healthyfy Google account to access the
            console.
          </p>
        </header>
        <div className="mt-6 space-y-4">
          <p className="text-sm text-slate-500">
            Click below to continue with Google SSO.
          </p>
          <Button
            variant="primary"
            className="w-full py-2"
            onClick={startGoogleLogin}
            label="Continue with Google"
          />
          <p className="text-xs text-slate-400">
            You will be redirected to Google and back once authenticated.
          </p>
        </div>
      </section>
    </main>
  );
}
