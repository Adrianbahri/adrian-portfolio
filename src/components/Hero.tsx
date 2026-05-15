'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ChevronRight, FileText, ArrowRight } from 'lucide-react';

const dynamicWords = ['Creative', 'Humorist', 'Agile', 'Firefighter', 'Resourceful', 'Ordinary'];

export default function Hero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % dynamicWords.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative pt-24 overflow-hidden bg-transparent">
      {/* Background Elements */}
      <div className="paper-dots h-32 w-full border-b border-border-subtle opacity-50" />
      <div className="grain" />

      <div className="section-container py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start z-10">

        {/* Left Content */}
        <div className="space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="eyebrow">Creative technologist</p>
            <h1 className="text-[42px] lg:text-[58px] font-medium leading-[1.1] tracking-[-0.06em] text-on-dark font-heading">
              {/^[aeiou]/i.test(dynamicWords[index]) ? 'An' : 'A'}{" "}
              <span className="relative inline-block text-primary">
                [
                <AnimatePresence mode="wait">
                  <motion.span
                    key={dynamicWords[index]}
                    initial={{ y: 20, opacity: 0, filter: 'blur(10px)' }}
                    animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                    exit={{ y: -20, opacity: 0, filter: 'blur(10px)' }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="inline-block px-2"
                  >
                    {dynamicWords[index]}
                  </motion.span>
                </AnimatePresence>
                ]
              </span>
              <br />
              Guy
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            <p className="text-xl lg:text-2xl text-on-dark/80 leading-relaxed max-w-xl font-sans">
              I build high-performance digital experiences where code meets cinematic storytelling.
              Specializing in Next.js, Framer Motion, and creative visual engineering.
            </p>

            <div className="flex flex-wrap gap-4">
              <button className="group bg-on-dark text-canvas px-8 py-4 rounded-md font-medium text-xs uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-on-dark/90 transition-all font-heading">
                View Projects
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 rounded-md border border-border-strong text-on-dark font-medium text-xs uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-surface-75 transition-all font-heading">
                <FileText size={16} />
                Resume
              </button>
            </div>
          </motion.div>
        </div>

        {/* Right Content - Visual */}
        <motion.div
          initial={{ opacity: 0, rotate: 0, scale: 0.95 }}
          animate={{ opacity: 1, rotate: 2, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative lg:h-[600px] flex items-center justify-center lg:justify-end lg:pr-12"
        >
          <div className="photo-frame w-full max-w-[380px] group">
            <div className="relative aspect-[4/5] overflow-hidden bg-canvas">
              <img
                src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80"
                alt="Adrian Visual"
                className="w-full h-full object-cover grayscale transition-all duration-1000 group-hover:grayscale-0 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/10 mix-blend-overlay pointer-events-none" />
            </div>

            <div className="photo-label">
              <span>IMG_2026_ADRN</span>
              <span>Visual Storyteller</span>
            </div>

            {/* Floating badge over the photo */}
            <div className="absolute bottom-12 left-8 p-3 bg-white border border-black/5 shadow-xl rounded-sm -rotate-3 transition-transform group-hover:rotate-0">
              <p className="text-[10px] uppercase tracking-widest text-black/40 font-bold mb-0.5">Focus</p>
              <p className="text-xs text-black font-medium">Next.js + Motion</p>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
