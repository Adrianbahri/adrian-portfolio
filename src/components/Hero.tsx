'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FileText, ArrowRight } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { cn } from '@/lib/utils';

interface HeroProps {
  initialSettings?: Record<string, string>;
}

export default function Hero({ initialSettings }: HeroProps) {
  const { settings } = useSiteSettings(initialSettings);

  const statusText = settings.site_status || 'Open for Collaboration';
  const isBusy = statusText.toLowerCase().includes('busy') || statusText.toLowerCase().includes('full') || statusText.toLowerCase().includes('closed');

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
            className="space-y-6"
          >
            {/* Status Pill / Badge */}
            <div className="flex">
              <div className={cn(
                "inline-flex items-center gap-2 border px-4 py-1.5 font-mono text-[10px] uppercase tracking-widest rounded-[3px]",
                isBusy 
                  ? "border-red-500/35 bg-red-500/8 text-red-500" 
                  : "border-primary/35 bg-primary/8 text-primary animate-pulse-glow"
              )}>
                <span className={cn(
                  "size-2 rounded-full",
                  isBusy ? "bg-red-500" : "bg-primary animate-pulse"
                )}></span>
                {statusText}
              </div>
            </div>

            <h1 className="text-[42px] sm:text-[58px] lg:text-[76px] font-medium leading-[1.05] tracking-[-0.06em] text-on-dark font-heading">
              Creative <span className="text-primary">Technologist</span>
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
              <Link href="/projects" className="group bg-on-dark text-canvas w-full sm:w-48 py-4 font-bold text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-primary transition-all font-heading rounded-[3px]">
                View Projects
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <button 
                onClick={() => {
                  if (settings.resume_url) {
                    window.dispatchEvent(
                      new CustomEvent('open-pdf-reader', {
                        detail: {
                          url: settings.resume_url,
                          title: 'Resume - Adrian Bahri',
                        },
                      })
                    );
                  }
                }}
                className="w-full sm:w-48 py-4 border border-border-strong text-on-dark font-bold text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-surface-75 transition-all font-heading rounded-[3px] cursor-pointer"
              >
                <FileText size={14} />
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
          className="relative flex items-start justify-center lg:justify-end lg:translate-x-10 mt-8 lg:mt-0"
        >
          <div className="photo-frame w-full max-w-[340px] sm:max-w-[380px] group rounded-[5px]">
            <div className="relative aspect-[4/5] overflow-hidden bg-canvas rounded-[2px]">
              <Image
                src={settings.hero_image || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80"}
                alt="Adrian Visual"
                fill
                priority
                sizes="(max-width: 768px) 340px, (max-width: 1024px) 380px, 400px"
                className="object-cover grayscale transition-all duration-1000 group-hover:grayscale-0 group-hover:scale-105"
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
