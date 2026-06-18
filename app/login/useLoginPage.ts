'use client';

import { useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAtom } from '@/app/lib/authAtom';

const googleClientId =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? process.env.GOOGLE_CLIENT_ID;

if (!googleClientId) {
  throw new Error('NEXT_PUBLIC_GOOGLE_CLIENT_ID is not configured');
}

export const useLoginPage = () => {
  const router = useRouter();
  const auth = useAtomValue(authAtom);
  const isAuthChecked = true;
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (auth.email) {
      router.replace('/dashboard');
    }
  }, [auth.email, router]);

  const startGoogleLogin = () => {
    if (typeof window === 'undefined') {
      return;
    }
    // Store redirect URL from query params or default to dashboard
    const urlParams = new URLSearchParams(window.location.search);
    const redirect = urlParams.get('redirect') || '/dashboard';
    sessionStorage.setItem('auth_redirect', redirect);

    const redirectUri = `${window.location.origin}/oauth-callback`;
    const params = new URLSearchParams({
      client_id: googleClientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      include_granted_scopes: 'true',
      prompt: 'consent',
    });
    const authorizationUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    setIsRedirecting(true);
    window.location.href = authorizationUrl;
  };

  return {
    isAuthChecked,
    isRedirecting,
    startGoogleLogin,
  };
};
