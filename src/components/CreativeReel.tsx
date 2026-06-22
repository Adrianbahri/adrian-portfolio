'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';
import { Play } from 'lucide-react';

export default function CreativeReel() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 0.95]);

  return (
    <section id="reel" ref={ref} className="w-full py-32 bg-black flex flex-col items-center justify-center overflow-hidden">
      <div className="text-center mb-12 px-6">
        <h2 className="text-[40px] font-semibold tracking-tight text-white mb-4">
          Creative Reel
        </h2>
        <p className="text-[21px] text-[var(--color-body-muted)]">
          A glimpse into motion and interaction.
        </p>
      </div>

      <motion.div 
        style={{ scale }}
        className="relative w-full max-w-[1200px] aspect-[21/9] bg-[var(--color-tile-3)] group cursor-pointer"
      >
        <Image 
          src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80" 
          alt="Creative Reel Thumbnail" 
          fill
          sizes="(max-width: 1200px) 100vw, 1200px"
          className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700"
        />
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:scale-110 group-hover:bg-white/30 transition-all duration-300">
            <Play className="w-6 h-6 text-white ml-1" fill="currentColor" />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
