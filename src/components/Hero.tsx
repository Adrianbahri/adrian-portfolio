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
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-transparent pt-32 lg:pt-28 pb-16">
      {/* Background Elements */}
      <div className="grain" />

      <div className="section-container grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-12 lg:gap-16 items-center z-10">

        {/* Left Content */}
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            {/* Status Pill / Badge */}
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-[3px] border border-border-strong bg-surface-100/90 backdrop-blur-md text-xs font-mono">
                <span className="relative flex h-2 w-2">
                  <span className={cn(
                    "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                    isBusy ? "bg-red-400" : "bg-orange-400"
                  )} />
                  <span className={cn(
                    "relative inline-flex rounded-full h-2 w-2",
                    isBusy ? "bg-red-500" : "bg-primary"
                  )} />
                </span>
                <span className="text-body-muted font-medium">{statusText}</span>
              </div>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-[76px] font-heading font-normal leading-[1.05] tracking-tight text-on-dark">
              Creative{" "}
              <span className="text-primary font-normal">
                Technologist
              </span>
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
          >
            <p className="text-lg sm:text-xl text-body-muted leading-relaxed max-w-xl font-sans font-normal">
              Transforming ideas into meaningful digital experiences through design, motion, and code.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              <Link 
                href="/projects" 
                className="group bg-on-dark text-canvas px-8 py-3.5 font-heading font-medium text-xs uppercase tracking-[0.2em] rounded-[3px] flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all duration-300 shadow-lg shadow-black/10 hover:-translate-y-0.5"
              >
                View Selected Works
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
                className="px-7 py-3.5 border border-border-strong text-on-dark font-heading font-medium text-xs uppercase tracking-[0.2em] rounded-[3px] flex items-center justify-center gap-2 hover:bg-surface-100 transition-all duration-300 cursor-pointer hover:-translate-y-0.5"
              >
                <FileText size={14} className="text-body-muted" />
                Resume
              </button>
            </div>
          </motion.div>
        </div>

        {/* Right Content - Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex items-center justify-center lg:justify-end mt-6 lg:mt-0"
        >
          <div className="photo-frame w-full max-w-[340px] sm:max-w-[370px] group rounded-[4px]">
            <div className="relative aspect-[4/5] overflow-hidden bg-surface-200 rounded-[2px]">
              <Image
                src={settings.hero_image || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80"}
                alt="Adrian Visual"
                fill
                priority
                sizes="(max-width: 768px) 340px, (max-width: 1024px) 370px, 400px"
                className="object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            </div>

            <div className="photo-label">
              <span>IMG_{new Date().getFullYear()}_DRIAN</span>
              <span className="text-primary/90 font-semibold">Visual Storyteller</span>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
