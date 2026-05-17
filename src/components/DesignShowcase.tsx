'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Layout } from 'lucide-react';

export default function DesignShowcase() {
  const [themes, setThemes] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

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
              className="w-12 h-12 border border-border-strong flex items-center justify-center hover:bg-surface-100 transition-colors text-on-dark"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={nextSlide}
              className="w-12 h-12 border border-border-strong flex items-center justify-center hover:bg-surface-100 transition-colors text-on-dark"
            >
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
              <div className="flex h-full w-full">
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
                    className="relative h-full border-r-[0.5px] last:border-r-0 border-border-strong group cursor-pointer transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden w-[calc(100%/var(--total))] hover:!w-[45%] group-hover/container:w-[calc(55%/(var(--total)-1))]"
                  >
                    <img 
                      src={img} 
                      alt="Design Piece" 
                      className="absolute inset-0 w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700"
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
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
    </section>
  );
}
