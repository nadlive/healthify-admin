'use client';

import { useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { setAuthAtom } from '@/app/lib/authAtom';
import { useMutation } from '@/app/lib/apiClient';
import { setUserAtom } from '../lib/user.atom';

export function useCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useSetAtom(setAuthAtom);
  const setUser = useSetAtom(setUserAtom);
  const {
    mutateAsync: exchangeOAuth,
    isPending,
    error,
    data,
  } = useMutation(
    'post',
    // @ts-expect-error - TODO: fix this
    '/auth/oauth/exchange'
  );

  useEffect(() => {
    if (error) {
      console.error('OAuth exchange failed', error);
      router.replace('/login');
      return;
    }
    if (data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const responseData = data as any;

      if (responseData.user?.role !== 'admin') {
        console.error('Non-admin tried to access admin panel');

        setAuth({
          email: null,
          token: null,
          refreshToken: null,
        });

        router.replace('/login?error=not_admin');
        return;
      }

      setAuth({
        email: responseData.user?.email,
        token: responseData.accessToken,
        refreshToken: responseData.refreshToken,
      });
      setUser(responseData.user);
      const redirectUrl =
        sessionStorage.getItem('auth_redirect') || '/dashboard';
      sessionStorage.removeItem('auth_redirect');
      router.replace(redirectUrl);
    }
  }, [error, data, router, setAuth, setUser]);

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) {
      return;
    }

    const exchange = async () => {
      const redirectUri = `${window.location.origin}/oauth-callback`;

      // @ts-expect-error - ExchangeOAuth is not typed
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await exchangeOAuth<any>({
        body: {
          code,
          redirect_uri: redirectUri,
          provider: 'google',
        },
      });
    };

    exchange();
  }, [router, searchParams, setAuth, exchangeOAuth]);

  const handleBackToLogin = () => {
    router.replace('/login');
  };

  return {
    status: isPending ? 'pending' : 'success',
    message: isPending ? 'Finishing sign in…' : 'Sign in successful',
    handleBackToLogin,
  };
}
