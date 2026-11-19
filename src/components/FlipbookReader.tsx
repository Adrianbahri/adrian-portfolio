'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Download,
  FileText,
  Loader2,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import '@/styles/shahriyar.css';

interface FlipbookReaderProps {
  pdfUrl: string;
  title: string;
  onClose: () => void;
}

export default function FlipbookReader({ pdfUrl, title, onClose }: FlipbookReaderProps) {
  const [pages, setPages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [scale, setScale] = useState(1.0); // State to handle dynamic zooming (0.5 to 2.0)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const scaleRef = useRef(scale);

  // Sync theme with portfolio preference + close on Escape key
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') {
      setTheme(saved);
    } else if (!document.documentElement.classList.contains('dark')) {
      setTheme('light');
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [onClose]);

  // Sync ref with scale state
  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  // Listen for touchpad pinch-to-zoom and touch screen pinch gestures on the canvas
  useEffect(() => {
    if (loading || pages.length === 0) return;
    
    const container = document.getElementById('pdf-render-canvas');
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        // Calculate dynamic zoom delta from touchpad pinch gesture
        const delta = -e.deltaY * 0.01;
        setScale((prev) => {
          const next = prev + delta;
          return Math.min(Math.max(next, 0.5), 2.0);
        });
      }
    };

    // Touch screen pinch-to-zoom
    let initialTouchDistance = 0;
    let initialScale = 1.0;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        initialTouchDistance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
        initialScale = scaleRef.current;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && initialTouchDistance > 0) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const currentDistance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
        const ratio = currentDistance / initialTouchDistance;
        
        setScale(() => {
          const next = initialScale * ratio;
          return Math.min(Math.max(next, 0.5), 2.0);
        });
      }
    };

    const handleTouchEnd = () => {
      initialTouchDistance = 0;
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [loading, pages]);

  useEffect(() => {
    let isMounted = true;
    
    // Disable body scroll when open
    document.body.style.overflow = 'hidden';

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

    const extractPages = async () => {
      try {
        const pdfjs = await loadPdfJs();
        const loadingTask = pdfjs.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        const numPages = pdf.numPages;
        const pageImages: string[] = [];

        for (let i = 1; i <= numPages; i++) {
          if (!isMounted) return;
          const page = await pdf.getPage(i);
          
          // Render at high resolution so it remains sharp when zoomed in!
          const viewport = page.getViewport({ scale: 2.0 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          
          if (context) {
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            await page.render({ canvasContext: context, viewport }).promise;
            pageImages.push(canvas.toDataURL('image/jpeg', 0.95));
            setProgress(Math.round((i / numPages) * 100));
          }
        }

        if (isMounted) {
          setPages(pageImages);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error rendering PDF scroll view:', err);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    extractPages();

    return () => {
      isMounted = false;
      document.body.style.overflow = 'auto';
    };
  }, [pdfUrl]);

  // Jump to specific page smoothly when clicking left sidebar thumbnails
  const jumpToPage = (index: number) => {
    const element = document.getElementById(`modal-page-${index}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Zoom handlers
  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 2.0));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.5));
  };

  return (
    <div
      data-dev-theme={theme}
      className="dev-shell fixed inset-0 z-[9998] flex flex-col justify-between select-none pointer-events-auto"
    >

      {/* Top Controls Bar (Exact Shahriyar 56px Bar) */}
      <div
        className="relative z-20 flex h-[56px] w-full shrink-0 items-center justify-between gap-4 px-4 sm:px-6"
        style={{
          backgroundColor: 'var(--art-ground)',
          borderBottom: '1px solid var(--art-line)',
        }}
      >
        {/* Left: Back/Close Pill + Mono Breadcrumb */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] transition-opacity hover:opacity-85 cursor-pointer"
            style={{
              backgroundColor: 'var(--art-tile)',
              color: 'var(--art-ink)',
              border: '1px solid var(--art-line)',
            }}
          >
            <ArrowLeft size={13} />
            <span>Back</span>
          </button>

          <div
            className="hidden sm:flex min-w-0 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em]"
            style={{ color: 'var(--art-ink-muted)' }}
          >
            <span className="shrink-0">PDF</span>
            <span className="shrink-0">/</span>
            <span className="truncate" style={{ color: 'var(--art-ink)' }}>
              {title}
            </span>
          </div>
        </div>

        {/* Center: Clean Rounded Zoom Pill */}
        {!loading && pages.length > 0 && (
          <div
            className="hidden md:flex items-center gap-1.5 rounded-full px-2 py-1"
            style={{
              backgroundColor: 'var(--art-tile)',
              border: '1px solid var(--art-line)',
            }}
          >
            <button
              type="button"
              onClick={zoomOut}
              disabled={scale <= 0.5}
              className="flex h-7 w-7 items-center justify-center rounded-full transition-opacity hover:opacity-100 opacity-75 disabled:opacity-30 cursor-pointer"
              style={{ color: 'var(--art-ink)' }}
              title="Zoom Out"
            >
              <ZoomOut size={14} />
            </button>

            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.05"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="mx-1 h-1 w-24 cursor-pointer"
              style={{ accentColor: 'var(--art-marker)' }}
              title="Resize page"
            />

            <span
              className="min-w-[40px] text-center font-mono text-[11px] font-medium select-none"
              style={{ color: 'var(--art-ink)' }}
            >
              {Math.round(scale * 100)}%
            </span>

            <button
              type="button"
              onClick={zoomIn}
              disabled={scale >= 2.0}
              className="flex h-7 w-7 items-center justify-center rounded-full transition-opacity hover:opacity-100 opacity-75 disabled:opacity-30 cursor-pointer"
              style={{ color: 'var(--art-ink)' }}
              title="Zoom In"
            >
              <ZoomIn size={14} />
            </button>
          </div>
        )}

        {/* Right: Download Pill + Esc Hint + Close */}
        <div className="flex shrink-0 items-center gap-2">
          <a
            href={pdfUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] transition-opacity hover:opacity-90"
            style={{
              backgroundColor: 'var(--art-marker)',
              color: 'var(--art-on-marker)',
            }}
            title="Download PDF"
          >
            <Download size={12} />
            <span className="hidden sm:inline">Download</span>
          </a>

          <span
            className="hidden sm:inline-block rounded-[5px] px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em]"
            style={{
              backgroundColor: 'var(--art-tile)',
              color: 'var(--art-ink-muted)',
              border: '1px solid var(--art-line)',
            }}
          >
            Esc
          </span>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full sm:hidden cursor-pointer"
            style={{
              backgroundColor: 'var(--art-tile)',
              color: 'var(--art-ink)',
              border: '1px solid var(--art-line)',
            }}
            title="Close Reader"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Main Workspace Frame */}
      <div className="relative z-10 flex flex-1 w-full overflow-hidden">
        {/* Left Thumbnail Sidebar (Desktop) */}
        {!loading && pages.length > 0 && (
          <aside
            className="hidden lg:flex w-44 shrink-0 flex-col gap-5 overflow-y-auto p-4 custom-scrollbar z-10"
            style={{
              backgroundColor: 'var(--art-ground)',
              borderRight: '1px solid var(--art-line)',
            }}
          >
            {pages.map((imgSrc, index) => (
              <div
                key={index}
                onClick={() => jumpToPage(index)}
                className="group flex flex-col gap-1.5 cursor-pointer"
              >
                <div
                  className="relative aspect-[1/1.41] w-full overflow-hidden rounded-[8px] shadow-sm transition-colors duration-200"
                  style={{
                    border: '1px solid var(--art-line)',
                    backgroundColor: 'var(--art-tile)',
                  }}
                >
                  <img
                    src={imgSrc}
                    alt={`Preview Page ${index + 1}`}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </div>
                <span
                  className="text-center font-mono text-[10px] transition-colors"
                  style={{ color: 'var(--art-ink-muted)' }}
                >
                  Page {String(index + 1).padStart(2, '0')}
                </span>
              </div>
            ))}
          </aside>
        )}

        {/* Main Scrollable Document Canvas */}
        <div
          id="pdf-render-canvas"
          className="flex flex-1 flex-col items-center gap-6 overflow-y-auto px-3 py-6 sm:px-6 sm:py-10 custom-scrollbar"
        >
          {loading ? (
            <div className="my-auto flex flex-col items-center gap-4">
              <Loader2
                className="animate-spin"
                size={30}
                style={{ color: 'var(--art-marker)' }}
              />
              <div className="space-y-1 text-center">
                <p
                  className="font-mono text-[10px] uppercase tracking-[0.2em]"
                  style={{ color: 'var(--art-ink-muted)' }}
                >
                  Loading Document...
                </p>
                <p
                  className="font-mono text-[12px] font-medium"
                  style={{ color: 'var(--art-marker-text)' }}
                >
                  {progress}%
                </p>
              </div>
            </div>
          ) : pages.length === 0 ? (
            <div className="my-auto flex flex-col items-center justify-center space-y-4 text-center">
              <FileText
                size={40}
                style={{ color: 'var(--art-marker-text)' }}
              />
              <p
                className="text-[14px]"
                style={{ color: 'var(--art-ink-soft)' }}
              >
                Unable to render document preview.
              </p>
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full px-5 py-2 font-mono text-[11px] uppercase tracking-[0.12em] font-medium"
                style={{
                  backgroundColor: 'var(--art-marker)',
                  color: 'var(--art-on-marker)',
                }}
              >
                Open PDF Directly
              </a>
            </div>
          ) : (
            <div className="z-10 flex w-full flex-col items-center gap-6 pb-12">
              {pages.map((imgSrc, index) => (
                <div
                  key={index}
                  id={`modal-page-${index}`}
                  className="relative flex items-center justify-center overflow-hidden rounded-[12px] shadow-xl"
                  style={{
                    width: '100%',
                    maxWidth: `${scale * 768}px`,
                    aspectRatio: '1/1.41',
                    backgroundColor: 'var(--art-tile)',
                    border: '1px solid var(--art-line)',
                  }}
                >
                  <img
                    src={imgSrc}
                    alt={`Page ${index + 1}`}
                    className="h-full w-full object-contain select-none pointer-events-none"
                  />

                  <div
                    className="absolute bottom-3 right-3 rounded-[6px] px-2 py-0.5 font-mono text-[10px]"
                    style={{
                      backgroundColor: 'var(--art-ground)',
                      color: 'var(--art-ink-muted)',
                      border: '1px solid var(--art-line)',
                    }}
                  >
                    {index + 1} / {pages.length}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
