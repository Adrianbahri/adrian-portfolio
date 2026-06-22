'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Layout, X, Download, ZoomIn, ZoomOut } from 'lucide-react';

export default function DesignShowcase() {
  const [themes, setThemes] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [activeImage, setActiveImage] = useState<{ url: string; index: number } | null>(null);

  // Reset expanded index when changing slides
  useEffect(() => {
    setExpandedIndex(null);
  }, [currentIndex]);

  useEffect(() => {
    const fetchThemes = async () => {
      const { data } = await supabase.from('design_themes').select('*').order('created_at', { ascending: false });
      if (data) {
        const digitalItems = data.filter((item: any) => {
          const desc = item.description || '';
          return !desc.includes('[CAT: Print]');
        });
        setThemes(digitalItems);
      }
    };
    fetchThemes();
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % themes.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + themes.length) % themes.length);
  };

  if (themes.length === 0) return null;

  const currentTheme = themes[currentIndex];

  return (
    <section className="section-container py-24 overflow-hidden">
      <div className="flex flex-col gap-8 mb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <p className="eyebrow mb-3">Design</p>
            <h2 className="text-2xl lg:text-3xl font-medium text-on-dark tracking-tight font-heading mb-3">
              Visual Explorations
            </h2>
            <p className="text-sm text-body-muted max-w-xl font-sans">
              Curated collection of branding, layout, and digital design.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={prevSlide}
              aria-label="Previous slide"
              className="w-12 h-12 border border-border-strong flex items-center justify-center hover:bg-surface-100 transition-colors text-on-dark"
            >
              <span className="sr-only">Previous Slide</span>
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={nextSlide}
              aria-label="Next slide"
              className="w-12 h-12 border border-border-strong flex items-center justify-center hover:bg-surface-100 transition-colors text-on-dark"
            >
              <span className="sr-only">Next Slide</span>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-8 border-t border-border-strong">
          <div className="space-y-1">
            <h3 className="text-2xl font-medium text-on-dark font-heading tracking-tight">
              {currentTheme.title}
            </h3>
            <p className="text-sm text-body-muted max-w-2xl">
              {currentTheme.description}
            </p>
          </div>
          <div className="flex items-center gap-6 shrink-0">
            <div className="flex items-center gap-3 text-primary">
              <Layout size={16} />
              <span className="text-[0.6rem] font-bold uppercase tracking-[0.2em]">{currentTheme.images.length} Assets</span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTheme.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            {/* The 16:9 Flush Mosaic Container */}
            <div className="relative aspect-video bg-[#0a0a0a] overflow-hidden border border-border-strong shadow-2xl group/container">
              <div 
                className="flex h-full w-full"
                onMouseLeave={() => setExpandedIndex(null)}
              >
                {currentTheme.images.map((img: string, i: number) => (
                  <motion.div
                    key={i}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ 
                      opacity: { delay: i * 0.05 },
                      layout: { duration: 0.6, ease: [0.23, 1, 0.32, 1] }
                    }}
                    style={{
                      flex: `0 0 auto`,
                      // @ts-ignore
                      '--total': currentTheme.images.length
                    }}
                    onMouseEnter={() => setExpandedIndex(i)}
                    onClick={() => {
                      if (expandedIndex === i) {
                        setActiveImage({ url: img, index: i });
                      } else {
                        setExpandedIndex(i);
                      }
                    }}
                    className={`relative h-full border-r-[0.5px] last:border-r-0 border-border-strong group cursor-pointer transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden ${
                      expandedIndex === null
                        ? "w-[calc(100%/var(--total))] hover:!w-[45%] group-hover/container:w-[calc(55%/(var(--total)-1))]"
                        : i === expandedIndex
                          ? "w-[45%]"
                          : "w-[calc(55%/(var(--total)-1))]"
                    }`}
                  >
                    <Image 
                      src={img} 
                      alt="Design Piece" 
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className={`object-cover grayscale-[0.5] transition-all duration-700 group-hover:grayscale-0 ${
                        i === expandedIndex ? "grayscale-0" : ""
                      }`}
                    />
                    
                    <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-500 flex items-end p-6 ${
                      i === expandedIndex ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    }`}>
                      <div className="space-y-1">
                        <span className="text-[0.5rem] font-bold uppercase tracking-[0.2em] text-primary">Asset {i + 1}</span>
                        <p className="text-[0.6rem] text-white uppercase tracking-widest font-medium">View Full Design</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      {activeImage && (
        <DesignLightboxModal 
          imageUrl={activeImage.url}
          title={currentTheme.title}
          currentIndex={activeImage.index}
          totalImages={currentTheme.images.length}
          onClose={() => setActiveImage(null)}
        />
      )}
    </section>
  );
}

interface LightboxProps {
  imageUrl: string;
  title: string;
  currentIndex: number;
  totalImages: number;
  onClose: () => void;
}

function DesignLightboxModal({ imageUrl, title, currentIndex, totalImages, onClose }: LightboxProps) {
  const [scale, setScale] = useState(1.0);
  const scaleRef = useRef(scale);

  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  // Disable body scroll when open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // Zoom handlers
  const zoomIn = () => setScale((prev) => Math.min(prev + 0.25, 2.0));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.5));

  // Touch screen pinch and trackpad zoom
  useEffect(() => {
    const container = document.getElementById('design-lightbox-canvas');
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = -e.deltaY * 0.01;
        setScale((prev) => Math.min(Math.max(prev + delta, 0.5), 2.0));
      }
    };

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
        setScale(() => Math.min(Math.max(initialScale * ratio, 0.5), 2.0));
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
  }, []);

  return (
    <div 
      data-lenis-prevent
      className="fixed inset-0 z-[9999] bg-[#070707]/95 backdrop-blur-3xl flex flex-col justify-between font-sans select-none rounded-none animate-in fade-in duration-300 pointer-events-auto"
    >
      <style dangerouslySetInnerHTML={{ __html: `
        header, .global-header, [role="banner"] {
          display: none !important;
        }
      ` }} />

      {/* Blueprint Grid */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        <div className="absolute inset-0 blueprint-grid opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#070707]/20 to-[#070707]/90" />
      </div>

      {/* Top Header */}
      <div className="h-16 border-b border-white/5 flex items-center justify-between px-3 sm:px-6 bg-black/40 rounded-none shrink-0 z-20 w-full relative">
        <div className="flex items-center gap-3">
          <span className="text-[9px] font-mono text-[#3ecf8e] bg-[#3ecf8e]/10 border border-[#3ecf8e]/20 px-2 py-0.5 rounded-none uppercase tracking-widest hidden sm:inline-block">
            Design View
          </span>
          <h2 className="text-xs font-medium text-white/90 uppercase tracking-wider truncate max-w-[150px] sm:max-w-md">
            {title} ({currentIndex + 1} of {totalImages})
          </h2>
        </div>

        {/* Zoom Controls */}
        <div className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/10 p-1 rounded-none">
          <button
            type="button"
            onClick={zoomOut}
            aria-label="Zoom out"
            disabled={scale <= 0.5}
            className="w-9 h-9 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer rounded-none"
          >
            <span className="sr-only">Zoom Out</span>
            <ZoomOut size={16} />
          </button>
          <span className="text-[10px] font-mono text-white/80 min-w-[38px] sm:min-w-[45px] text-center select-none font-bold">
            {Math.round(scale * 100)}%
          </span>
          <button
            type="button"
            onClick={zoomIn}
            aria-label="Zoom in"
            disabled={scale >= 2.0}
            className="w-9 h-9 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer rounded-none"
          >
            <span className="sr-only">Zoom In</span>
            <ZoomIn size={16} />
          </button>
        </div>

        {/* Right Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <a
            href={imageUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 sm:w-10 sm:h-10 border border-white/10 hover:border-[#3ecf8e]/30 text-white/70 hover:text-[#3ecf8e] flex items-center justify-center transition-all cursor-pointer rounded-none"
            title="Download Design"
          >
            <Download size={14} className="sm:w-4 sm:h-4" />
          </a>
          <button
            onClick={onClose}
            aria-label="Close viewer"
            className="w-8 h-8 sm:w-10 sm:h-10 border border-white/10 hover:border-white/30 text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer rounded-none"
            title="Close Viewer"
          >
            <span className="sr-only">Close Viewer</span>
            <X size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
        </div>
      </div>

      {/* Render Canvas */}
      <div 
        id="design-lightbox-canvas"
        className="flex-1 w-full overflow-y-auto py-6 sm:py-12 px-2 sm:px-6 flex flex-col items-center justify-center relative z-10"
      >
        {/* Ambient Glow */}
        <div className="absolute w-[200px] h-[250px] sm:w-[400px] sm:h-[500px] bg-[#3ecf8e]/10 rounded-full blur-[80px] sm:blur-[150px] z-0 pointer-events-none" />

        {/* 4:5 Aspect Ratio Container */}
        <div 
          style={{ transform: `scale(${scale})`, transition: 'transform 0.1s ease-out' }}
          className="relative w-full max-w-[420px] aspect-[4/5] bg-[#0a0a0a] border border-white/10 shadow-2xl overflow-hidden z-10 rounded-none flex items-center justify-center"
        >
          <Image 
            src={imageUrl} 
            alt="Fullscreen Design" 
            fill
            sizes="(max-width: 450px) 100vw, 420px"
            className="object-cover select-none pointer-events-none"
          />
        </div>
      </div>
    </div>
  );
}
