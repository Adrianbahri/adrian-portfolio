'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { FileText, ArrowRight } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const dynamicWords = ['Creative', 'Humorist', 'Firefighter', 'Resourceful', 'Ordinary', 'Agile'];

export default function Hero() {
  const [index, setIndex] = useState(0);
  const { settings } = useSiteSettings();

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % dynamicWords.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-transparent pt-48 lg:pt-20 pb-16">
      {/* Background Elements */}
      <div className="grain" />

      <div className="section-container grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-20 items-center z-10">

        {/* Left Content */}
        <div className="space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="eyebrow">Creative Technologist & also known as</p>
            <h1 className="text-[32px] sm:text-[42px] lg:text-[58px] font-medium leading-[1.1] tracking-[-0.06em] text-on-dark font-heading">
              {/^[aeiou]/i.test(dynamicWords[index]) ? 'An' : 'A'}{" "}
              <span className="relative inline-block text-primary">
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
              </span>
              <br className="hidden sm:block" />
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
              Transforming ideas into meaningful digital experiences through design, motion, and code.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="group bg-on-dark text-canvas w-full sm:w-48 py-4 font-bold text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-primary transition-all font-heading rounded-[3px]">
                View Projects
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <a 
                href={settings.resume_url || '#'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full sm:w-48 py-4 border border-border-strong text-on-dark font-bold text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-surface-75 transition-all font-heading rounded-[3px]"
              >
                <FileText size={14} />
                Resume
              </a>
            </div>
          </motion.div>
        </div>

        {/* Right Content - Visual */}
        <motion.div
          initial={{ opacity: 0, rotate: 0, scale: 0.95 }}
          animate={{ opacity: 1, rotate: 2, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex items-start justify-center lg:justify-end lg:translate-x-10 mt-8 lg:mt-0"
        >
          <div className="photo-frame w-full max-w-[340px] sm:max-w-[380px] group rounded-[5px]">
            <div className="relative aspect-[4/5] overflow-hidden bg-canvas rounded-[2px]">
              <img
                src={settings.hero_image || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80"}
                alt="Adrian Visual"
                className="w-full h-full object-cover grayscale transition-all duration-1000 group-hover:grayscale-0 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/10 mix-blend-overlay pointer-events-none" />
            </div>

            <div className="photo-label">
              <span>IMG_{new Date().getFullYear()}_DRIAN</span>
              <span>Visual Storyteller</span>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
