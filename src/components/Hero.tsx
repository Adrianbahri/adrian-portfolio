'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ChevronRight, FileText, ArrowRight } from 'lucide-react';

const dynamicWords = ['visuals', 'interfaces', 'stories', 'motion', 'web experiences'];

export default function Hero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % dynamicWords.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background Elements */}
      <div className="glow-subtle bg-primary/20 w-[500px] h-[500px] -top-20 -left-20" />
      <div className="glow-subtle bg-blue-500/10 w-[400px] h-[400px] bottom-20 right-20 animate-float" />
      <div className="grain" />

      <div className="section-container grid grid-cols-1 lg:grid-cols-2 gap-12 items-center z-10">
        
        {/* Left Content */}
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-[64px] lg:text-[88px] font-bold leading-[0.9] tracking-tighter text-on-dark">
              Crafting <br />
              <span className="relative inline-block text-primary">
                [ 
                <AnimatePresence mode="wait">
                  <motion.span
                    key={dynamicWords[index]}
                    initial={{ y: 20, opacity: 0, filter: 'blur(10px)' }}
                    animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                    exit={{ y: -20, opacity: 0, filter: 'blur(10px)' }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="inline-block px-4"
                  >
                    {dynamicWords[index]}
                  </motion.span>
                </AnimatePresence>
                ]
              </span>
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            <p className="text-lg lg:text-xl text-body-muted leading-relaxed max-w-lg">
              Creative developer, video editor, and visual storyteller based in Indonesia. 
              Informatics Engineering student passionate about technology, design, and digital storytelling.
            </p>

            <div className="flex flex-wrap gap-4">
              <button className="group bg-primary text-black px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-primary-focus transition-all">
                View Projects
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-6 py-3 rounded-full border border-border-strong text-on-dark font-semibold flex items-center gap-2 hover:bg-surface-75 transition-all">
                <FileText size={18} />
                Download Resume
              </button>
            </div>
          </motion.div>
        </div>

        {/* Right Content - Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, filter: 'blur(20px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative aspect-square lg:aspect-auto lg:h-[600px] rounded-3xl overflow-hidden border border-border-strong bg-surface-75 group"
        >
          <img 
            src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80" 
            alt="Adrian Visual"
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          {/* Floating badge */}
          <div className="absolute bottom-8 left-8 p-4 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl">
            <p className="text-xs uppercase tracking-widest text-primary font-bold mb-1">Current Stack</p>
            <p className="text-sm text-on-dark">Next.js + Framer Motion</p>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
