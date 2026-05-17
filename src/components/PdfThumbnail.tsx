'use client';

import { useEffect, useState } from 'react';
import { Loader2, FileText } from 'lucide-react';

interface PdfThumbnailProps {
  pdfUrl: string;
  className?: string;
}

export default function PdfThumbnail({ pdfUrl, className }: PdfThumbnailProps) {
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!pdfUrl) return;

    let isMounted = true;
    
    // Detect if the file is already a raw image (mockup)
    const isImageUrl = /\.(jpeg|jpg|gif|png|webp|svg)$/i.test(pdfUrl);
    if (isImageUrl) {
      setThumbnail(pdfUrl);
      setLoading(false);
      setError(false);
      return;
    }

    setLoading(true);
    setError(false);

    const loadPdfJs = async () => {
      // @ts-ignore
      if (window.pdfjsLib) return window.pdfjsLib;

      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
        script.onload = () => {
          // @ts-ignore
          const pdfjs = window.pdfjsLib;
          pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
          resolve(pdfjs);
        };
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    const renderThumbnail = async () => {
      try {
        const pdfjs = await loadPdfJs();
        const loadingTask = pdfjs.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);

        // Render at slightly higher scale for ultra-sharp thumbnails on retina displays
        const viewport = page.getViewport({ scale: 1.0 });
        
        if (!isMounted) return;

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Canvas context could not be created');

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;

        if (isMounted) {
          const imgUrl = canvas.toDataURL('image/jpeg', 0.9);
          setThumbnail(imgUrl);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error rendering PDF thumbnail:', err);
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      }
    };

    renderThumbnail();

    return () => {
      isMounted = false;
    };
  }, [pdfUrl]);

  if (loading) {
    return (
      <div className={`${className} bg-[#111] border border-white/5 flex flex-col items-center justify-center gap-2 text-white/20 select-none`}>
        <Loader2 className="animate-spin text-[#3ecf8e]" size={20} />
        <span className="text-[8px] font-bold uppercase tracking-widest">Rendering PDF Thumbnail...</span>
      </div>
    );
  }

  if (error || !thumbnail) {
    return (
      <div className={`${className} bg-[#111] border border-white/5 flex flex-col items-center justify-center gap-2 text-[#707070] select-none`}>
        <FileText size={24} className="text-red-500/80" />
        <span className="text-[8px] font-bold uppercase tracking-widest text-[#707070]">PDF Magazine</span>
      </div>
    );
  }

  return (
    <img 
      src={thumbnail} 
      alt="PDF Cover Thumbnail" 
      className={`${className} object-cover w-full h-full select-none`} 
    />
  );
}
