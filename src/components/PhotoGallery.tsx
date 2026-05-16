'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function PhotoGallery() {
  const [photos, setPhotos] = useState<any[]>([]);

  useEffect(() => {
    const fetchPhotos = async () => {
      const { data } = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
      if (data && data.length > 0) {
        setPhotos([...data, ...data]);
      }
    };
    fetchPhotos();
  }, []);

  if (photos.length === 0) return null;

  // 2 rows of photos
  const row1 = photos.length > 0 ? photos : [];
  const row2 = photos.length > 0 ? [...photos].reverse() : [];

  const MarqueeRow = ({ items, duration, reverse = false }: { items: any[], duration: number, reverse?: boolean }) => (
    <div className="flex overflow-hidden">
      <motion.div 
        className="flex gap-4 mb-4 pr-4"
        animate={{
          x: reverse ? [0, -1500] : [-1500, 0],
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: duration,
            ease: "linear",
          },
        }}
      >
        {items.map((photo, idx) => (
          <div key={`${photo.id}-${idx}`} className="flex-shrink-0">
            <div className="w-[280px] md:w-[380px] aspect-[3/2] overflow-hidden border border-border-strong bg-surface-50">
              <img 
                src={photo.image_url} 
                alt="Gallery"
                className="w-full h-full object-cover transition-all duration-700 hover:scale-105"
              />
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );

  return (
    <section className="w-full pt-12 pb-12 relative overflow-hidden bg-transparent select-none border-t border-border-strong">
      <div className="section-container mb-12">
        <p className="eyebrow mb-3">Photography</p>
        <h2 className="text-2xl lg:text-3xl font-medium text-on-dark tracking-tight font-heading mb-3">
          Moments & Perspectives
        </h2>
        <p className="text-sm text-body-muted max-w-xl font-sans">
          A visual journal captured through the lens.
        </p>
      </div>

      <div className="flex flex-col relative">
        <div 
          className="relative z-10"
          style={{
            maskImage: 'radial-gradient(ellipse 100% 100% at 50% 0%, black 30%, transparent 90%)',
            WebkitMaskImage: 'radial-gradient(ellipse 100% 100% at 50% 0%, black 30%, transparent 90%)'
          }}
        >
          <MarqueeRow items={row1} duration={70} />
          <MarqueeRow items={row2} duration={90} reverse />
        </div>
      </div>
      
      {/* Side Fades */}
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-canvas to-transparent z-20 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-canvas to-transparent z-20 pointer-events-none" />
    </section>
  );
}
