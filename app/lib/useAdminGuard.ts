'use client';

import { useAtomValue } from 'jotai';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { userAtom, userHydratedAtom } from '@/app/lib/user.atom';

export function useAdminGuard() {
  const router = useRouter();
  const user = useAtomValue(userAtom);
  const hydrated = useAtomValue(userHydratedAtom);

  useEffect(() => {
    if (!hydrated) return; 

    if (!user || user.role !== 'admin') {
      router.replace('/login');
    }
  }, [hydrated, user, router]);
}
