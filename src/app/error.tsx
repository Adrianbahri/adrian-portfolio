'use client';

import { useEffect } from 'react';
import StatusView from '@/components/StatusView';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled runtime error:', error);
  }, [error]);

  return <StatusView code="500" onReset={reset} />;
}
