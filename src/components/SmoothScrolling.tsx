'use client';

import { ReactLenis } from 'lenis/react';
import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

export default function SmoothScrolling({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) return <>{children}</>;

  return (
    <ReactLenis root options={{ lerp: 0.12, duration: 1.2, smoothWheel: true }}>
      {children}
    </ReactLenis>
  );
}
