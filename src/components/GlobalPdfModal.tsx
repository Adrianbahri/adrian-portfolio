'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const FlipbookReader = dynamic(() => import('./FlipbookReader'), {
  ssr: false,
});

export default function GlobalPdfModal() {
  const [pdfData, setPdfData] = useState<{ url: string; title: string } | null>(
    null
  );

  useEffect(() => {
    const handleOpen = (event: Event) => {
      const customEvent = event as CustomEvent<{ url: string; title: string }>;
      if (customEvent.detail && customEvent.detail.url) {
        setPdfData({
          url: customEvent.detail.url,
          title: customEvent.detail.title || 'Document Preview',
        });
        window.dispatchEvent(
          new CustomEvent('pdf-reader-state', { detail: { open: true } })
        );
      }
    };

    window.addEventListener('open-pdf-reader', handleOpen);
    return () => {
      window.removeEventListener('open-pdf-reader', handleOpen);
    };
  }, []);

  if (!pdfData) return null;

  return (
    <FlipbookReader
      pdfUrl={pdfData.url}
      title={pdfData.title}
      onClose={() => {
        setPdfData(null);
        window.dispatchEvent(
          new CustomEvent('pdf-reader-state', { detail: { open: false } })
        );
      }}
    />
  );
}
