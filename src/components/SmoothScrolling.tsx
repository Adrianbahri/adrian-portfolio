'use client';

import { ReactLenis } from 'lenis/react';
import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

export default function SmoothScrolling({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) return <>{children}</>;

  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.0, smoothWheel: true, wheelMultiplier: 1.1 }}>
      {children}
    </ReactLenis>
  );
}
