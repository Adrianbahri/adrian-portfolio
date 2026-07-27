'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthRecoveryHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if URL has recovery tokens (either in hash for implicit flow or query params for PKCE)
    const hasRecoveryHash = window.location.hash.includes('type=recovery') || window.location.hash.includes('access_token');
    const isRecoveryQuery = searchParams.get('type') === 'recovery' || searchParams.has('code');

    // Only redirect if not already on the reset password page
    if ((hasRecoveryHash || isRecoveryQuery) && !window.location.pathname.includes('/reset-password')) {
      // Forward all search params and hash to the reset-password page using a hard redirect
      // to ensure Supabase auth listener catches the hash on page load
      window.location.replace(`/reset-password${window.location.search}${window.location.hash}`);
    }
  }, [searchParams]);

  return null;
}
