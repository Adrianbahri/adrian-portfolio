'use client';

import { useEffect, useState } from 'react';
import { Loader2, X, Download, FileText, ZoomIn, ZoomOut } from 'lucide-react';

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

  // Listen for touchpad pinch-to-zoom gestures (wheel + ctrlKey) on the canvas
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

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
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
      data-lenis-prevent
      className="fixed inset-0 z-[9999] bg-[#070707]/90 backdrop-blur-3xl flex flex-col justify-between font-sans select-none rounded-none animate-in fade-in duration-300 pointer-events-auto"
    >
      
      {/* Dynamic Style injection to guarantee complete structural hiding of global header navigations */}
      <style dangerouslySetInnerHTML={{ __html: `
        header, .global-header, [role="banner"] {
          display: none !important;
        }
      ` }} />

      {/* Signature Blueprint Grid Background Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        <div className="absolute inset-0 blueprint-grid opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#070707]/20 to-[#070707]/85" />
      </div>

      {/* Top Controls Header Bar */}
      <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-black/40 rounded-none shrink-0 z-20 w-full relative">
        
        {/* Left: Title info */}
        <div className="flex items-center gap-3">
          <span className="text-[9px] font-mono text-[#3ecf8e] bg-[#3ecf8e]/10 border border-[#3ecf8e]/20 px-2 py-0.5 rounded-none uppercase tracking-widest hidden sm:inline-block">
            Layout Reader
          </span>
          <h2 className="text-xs font-medium text-white/90 uppercase tracking-wider truncate max-w-[200px] sm:max-w-md">{title}</h2>
        </div>

        {/* Center: Bespoke Dynamic Zoom Controls / Resize Slider */}
        {!loading && pages.length > 0 && (
          <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-4 py-1.5 rounded-none">
            <button
              onClick={zoomOut}
              disabled={scale <= 0.5}
              className="text-white/60 hover:text-white disabled:opacity-30 disabled:hover:text-white/60 transition-colors p-0.5 cursor-pointer flex items-center justify-center"
              title="Resize Smaller"
            >
              <ZoomOut size={14} />
            </button>
            
            {/* Dynamic Slider Resize Control */}
            <input 
              type="range"
              min="0.5"
              max="2.0"
              step="0.05"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="w-16 sm:w-28 accent-[#3ecf8e] bg-white/10 h-1 outline-none cursor-pointer appearance-none rounded-none"
              title="Drag to resize page layout"
            />

            <span className="text-[10px] font-mono text-white/80 min-w-[45px] text-center select-none">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={zoomIn}
              disabled={scale >= 2.0}
              className="text-white/60 hover:text-white disabled:opacity-30 disabled:hover:text-white/60 transition-colors p-0.5 cursor-pointer flex items-center justify-center"
              title="Resize Larger"
            >
              <ZoomIn size={14} />
            </button>
          </div>
        )}

        {/* Right: Close and download floating triggers */}
        <div className="flex items-center gap-2">
          <a
            href={pdfUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 border border-white/10 hover:border-[#3ecf8e]/30 text-white/70 hover:text-[#3ecf8e] flex items-center justify-center transition-all cursor-pointer rounded-none"
            title="Download PDF"
          >
            <Download size={16} />
          </a>
          <button
            onClick={onClose}
            className="w-10 h-10 border border-white/10 hover:border-white/30 text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer rounded-none"
            title="Close Reader"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden w-full relative z-10">
        
        {/* Left Column: Pages Preview Sidebar (Dynamic Thumbnails Column) */}
        {!loading && pages.length > 0 && (
          <aside 
            data-lenis-prevent
            className="w-24 sm:w-44 border-r border-white/5 bg-black/25 overflow-y-auto flex flex-col gap-6 p-4 shrink-0 custom-scrollbar z-10"
          >
            {pages.map((imgSrc, index) => (
              <div 
                key={index} 
                onClick={() => jumpToPage(index)}
                className="group flex flex-col gap-1.5 cursor-pointer"
              >
                <div className="w-full aspect-[1/1.41] overflow-hidden border border-white/10 hover:border-[#3ecf8e] transition-all duration-300 relative shadow-md">
                  <img 
                    src={imgSrc} 
                    alt={`Preview Page ${index + 1}`} 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors pointer-events-none" />
                </div>
                <span className="text-[9px] font-mono text-center text-white/40 group-hover:text-[#3ecf8e] transition-colors">
                  Page {index + 1}
                </span>
              </div>
            ))}
          </aside>
        )}

        {/* Right Column: Scrollable Full Render Canvas */}
        <div 
          id="pdf-render-canvas"
          data-lenis-prevent
          className="flex-1 overflow-y-auto custom-scrollbar py-12 px-6 flex flex-col items-center gap-8 bg-transparent"
        >
          {loading ? (
            <div className="my-auto flex flex-col items-center gap-4 text-white/40">
              <Loader2 className="animate-spin text-[#3ecf8e]" size={36} />
              <div className="space-y-1 text-center">
                <p className="text-[10px] font-mono uppercase tracking-[0.25em]">Extracting Layout Pages...</p>
                <p className="text-xs font-bold text-[#3ecf8e] font-mono">{progress}%</p>
              </div>
            </div>
          ) : pages.length === 0 ? (
            <div className="my-auto flex flex-col items-center justify-center text-white/40 text-center space-y-4">
              <FileText size={48} className="text-red-500/80" />
              <p className="text-sm">Unable to render layout pages.</p>
              <a 
                href={pdfUrl} 
                target="_blank" 
                className="px-6 py-2 bg-[#3ecf8e] text-black text-xs uppercase tracking-wider font-bold rounded-none"
              >
                Open PDF Directly
              </a>
            </div>
          ) : (
            /* Main dynamic pages viewport. Width is dynamically governed by the Zoom Scale! */
            <div className="w-full flex flex-col items-center gap-8 pb-12 z-10">
              {pages.map((imgSrc, index) => (
                <div 
                  key={index} 
                  id={`modal-page-${index}`}
                  className="bg-[#111] border border-white/10 shadow-2xl relative rounded-none flex items-center justify-center transition-all duration-300 animate-in slide-in-from-bottom-8 duration-500"
                  style={{ 
                    width: '100%', 
                    maxWidth: `${scale * 768}px`,
                    aspectRatio: '1/1.41'
                  }}
                >
                  <img 
                    src={imgSrc} 
                    alt={`Page ${index + 1}`} 
                    className="w-full h-full object-contain rounded-none select-none pointer-events-none" 
                  />
                  
                  {/* Micro Page Counter Badge inside each page */}
                  <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-2 py-0.5 border border-white/10 text-[9px] font-mono text-white/50 rounded-none">
                    Page {index + 1} of {pages.length}
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
