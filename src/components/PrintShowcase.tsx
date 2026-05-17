'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Download, ExternalLink, Tag, X, ZoomIn, ZoomOut } from 'lucide-react';
import PdfThumbnail from './PdfThumbnail';
import FlipbookReader from './FlipbookReader';

export default function PrintShowcase() {
  const [publications, setPublications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFlipbook, setActiveFlipbook] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        const { data, error } = await supabase
          .from('magazines')
          .select('*')
          .order('order_index', { ascending: true });
        
        if (!error && data) {
          setPublications(data);
        }
      } catch (err) {
        console.error('Error fetching publications:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPublications();
  }, []);

  if (loading) return null;
  if (publications.length === 0) return null;

  return (
    <section className="section-container py-24 border-t border-white/5">
      <div className="flex flex-col gap-4 mb-16">
        <p className="eyebrow">Tangible & Editorial</p>
        <h2 className="text-2xl lg:text-3xl font-medium text-on-dark tracking-tight font-heading uppercase">
          Print & Editorial Layouts
        </h2>
        <p className="text-sm text-body-muted max-w-xl font-sans leading-relaxed">
          Crafting physical and editorial layouts—featuring complete magazine booklets, custom packaging blueprints, and exhibition poster layouts.
        </p>
      </div>

      {/* Grid of boxy sharp-edged items (rounded-none, border-radius: 0) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {publications.map((pub) => {
          let badgeLabel = 'Publication';
          if (pub.category === 'Packaging') badgeLabel = 'Packaging Design';
          else if (pub.category === 'Poster') badgeLabel = 'Poster Collection';
          else if (pub.category === 'Magazine') badgeLabel = 'Editorial Layout';

          // Detect if pdf_url is actually an image (PNG/JPG mockups)
          const isImageUrl = pub.pdf_url && /\.(jpeg|jpg|gif|png|webp|svg)$/i.test(pub.pdf_url);

          return (
            <motion.div
              key={pub.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="group bg-white/[0.01] hover:bg-white/[0.02] border border-white/5 hover:border-[#3ecf8e]/20 p-6 flex flex-col justify-between transition-all duration-500 shadow-2xl relative rounded-none"
            >
              <div className="space-y-6">
                {/* Visual Cover Mockup (Dynamic aspect ratio - Completely boxy - rounded-none) */}
                <div className={`relative ${pub.category === 'Magazine' || pub.category === 'Poster' ? 'aspect-[3/4]' : 'aspect-[4/3]'} overflow-hidden bg-[#0d0d0d] border border-white/5 select-none rounded-none`}>
                  
                  {/* 1. Ambient Blurred Background Layer (Creates the gorgeous floating depth glow) */}
                  <div className="absolute inset-0 scale-125 blur-2xl opacity-40 pointer-events-none select-none overflow-hidden rounded-none z-0">
                    {isImageUrl ? (
                      <img 
                        src={pub.pdf_url} 
                        alt="Blur Backdrop" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      pub.pdf_url && (
                        <PdfThumbnail 
                          pdfUrl={pub.pdf_url} 
                          className="w-full h-full object-cover" 
                        />
                      )
                    )}
                  </div>

                  {/* 2. Sharp Front Floating Mockup Layer - Centered and Floating on top of the ambient glow */}
                  <div className="absolute inset-0 flex items-center justify-center p-4 z-10">
                    {isImageUrl ? (
                      <img 
                        src={pub.pdf_url} 
                        alt={pub.title} 
                        className="max-w-full max-h-full object-contain shadow-2xl border border-white/5 rounded-none transition-transform duration-[1.2s] group-hover:scale-[1.03]" 
                      />
                    ) : (
                      pub.pdf_url && (
                        <PdfThumbnail 
                          pdfUrl={pub.pdf_url} 
                          className="max-w-full max-h-full object-contain shadow-2xl border border-white/5 rounded-none transition-transform duration-[1.2s] group-hover:scale-[1.03]" 
                        />
                      )
                    )}
                  </div>

                  {/* Vignette overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none z-10" />
                </div>

                {/* Info and Descriptions */}
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-on-dark font-heading tracking-tight group-hover:text-[#3ecf8e] transition-colors duration-300 uppercase">
                    {pub.title}
                  </h3>
                  <p className="text-[13px] text-body-muted leading-relaxed font-sans line-clamp-3">
                    {pub.description}
                  </p>
                </div>
              </div>

              {/* Bottom Action bar (Completely Boxy) */}
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-body-muted text-[10px]">
                <div className="flex items-center gap-1.5 font-mono uppercase tracking-wider">
                  <Tag size={12} className="text-[#3ecf8e]" />
                  <span>{badgeLabel}</span>
                </div>
                <button
                  onClick={() => setActiveFlipbook({ url: pub.pdf_url, title: pub.title })}
                  className="text-[#3ecf8e] hover:underline font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer bg-transparent border-none p-0 focus:outline-none"
                >
                  <span>SEE</span>
                  <ExternalLink size={12} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Vertical Scroll PDF & Image Reader Modal */}
      {activeFlipbook && (
        <FlipbookWrapper
          pdfUrl={activeFlipbook.url}
          title={activeFlipbook.title}
          onClose={() => setActiveFlipbook(null)}
        />
      )}
    </section>
  );
}

// Wrapper to handle both raw image fullscreen lightboxes and scrollable PDF views
function FlipbookWrapper({ pdfUrl, title, onClose }: { pdfUrl: string; title: string; onClose: () => void }) {
  const isImage = pdfUrl && /\.(jpeg|jpg|gif|png|webp|svg)$/i.test(pdfUrl);
  const [scale, setScale] = useState(1.0); // State to handle dynamic zooming/resizing of mockup images
  const scaleRef = useRef(scale);

  // Sync ref with scale state
  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  // Listen for touchpad pinch-to-zoom and touch screen pinch gestures
  useEffect(() => {
    if (!isImage) return;

    const container = document.getElementById('image-render-canvas');
    if (!container) return;

    // Trackpad wheel zooming
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = -e.deltaY * 0.01;
        setScale((prev) => {
          const next = prev + delta;
          return Math.min(Math.max(next, 0.5), 2.0);
        });
      }
    };

    // Touch screen pinch gesture zooming
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
  }, [isImage]);

  // Disable scroll when open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 2.0));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.5));
  };

  if (isImage) {
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
        <div className="h-16 border-b border-white/5 flex items-center justify-between px-3 sm:px-6 bg-black/40 rounded-none shrink-0 z-20 w-full relative">
          
          {/* Left: Title info */}
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-mono text-[#3ecf8e] bg-[#3ecf8e]/10 border border-[#3ecf8e]/20 px-2 py-0.5 rounded-none uppercase tracking-widest hidden sm:inline-block">
              Design View
            </span>
            <h2 className="text-xs font-medium text-white/90 uppercase tracking-wider truncate max-w-[200px] sm:max-w-md">{title}</h2>
          </div>

          {/* Center: Bespoke Dynamic Zoom Controls / Resize Slider */}
          <div className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/10 p-1 rounded-none">
            <button
              type="button"
              onClick={zoomOut}
              disabled={scale <= 0.5}
              className="w-9 h-9 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer rounded-none"
              title="Resize Smaller"
            >
              <ZoomOut size={16} />
            </button>
            
            {/* Dynamic Slider Resize Control */}
            <input 
              type="range"
              min="0.5"
              max="2.0"
              step="0.05"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="hidden sm:inline-block w-28 accent-[#3ecf8e] bg-white/10 h-1 outline-none cursor-pointer appearance-none rounded-none mx-2"
              title="Drag to resize mockup width"
            />

            <span className="text-[10px] font-mono text-white/80 min-w-[38px] sm:min-w-[45px] text-center select-none font-bold">
              {Math.round(scale * 100)}%
            </span>
            <button
              type="button"
              onClick={zoomIn}
              disabled={scale >= 2.0}
              className="w-9 h-9 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer rounded-none"
              title="Resize Larger"
            >
              <ZoomIn size={16} />
            </button>
          </div>

          {/* Right: Close and download triggers */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <a
              href={pdfUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 sm:w-10 sm:h-10 border border-white/10 hover:border-[#3ecf8e]/30 text-white/70 hover:text-[#3ecf8e] flex items-center justify-center transition-all cursor-pointer rounded-none"
              title="Download Image"
            >
              <Download size={14} className="sm:w-4 sm:h-4" />
            </a>
            <button
              onClick={onClose}
              className="w-8 h-8 sm:w-10 sm:h-10 border border-white/10 hover:border-white/30 text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer rounded-none"
              title="Close Reader"
            >
              <X size={16} className="sm:w-[18px] sm:h-[18px]" />
            </button>
          </div>
        </div>

        {/* Scrollable Container so they can view the full height of very long layout/mockup images! */}
        <div 
          id="image-render-canvas"
          className="flex-1 w-full overflow-y-auto py-6 sm:py-12 px-2 sm:px-6 flex flex-col items-center justify-start relative z-10"
        >
          
          {/* Ambient background blur that matches the image */}
          <div className="absolute inset-0 scale-125 blur-3xl opacity-25 select-none pointer-events-none z-0">
            <img src={pdfUrl} className="w-full h-full object-cover" alt="Blur Background" />
          </div>
          
          {/* Sharp Mockup Image - Scrollable and sized dynamically based on Scale! */}
          <img 
            src={pdfUrl} 
            alt={title} 
            className="w-full h-auto object-contain shadow-2xl border border-white/10 rounded-none z-10 animate-in zoom-in-95 duration-500 transition-all duration-350" 
            style={{ maxWidth: `${scale * 768}px` }}
          />
        </div>
      </div>
    );
  }

  // Fallback to Scroll PDF reader
  return <FlipbookReader pdfUrl={pdfUrl} title={title} onClose={onClose} />;}
