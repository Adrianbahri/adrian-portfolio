'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ExternalLink, GitBranch, ArrowRight } from 'lucide-react';

import { projects } from '@/data/projects';
import Link from 'next/link';

type ProjectMode = 'developer' | 'creative';

export default function FeaturedWork() {
  const [mode, setMode] = useState<ProjectMode>('developer');

  const filteredProjects = projects.filter(p => p.mode === mode).slice(0, 2);

  return (
    <section id="work" className="w-full py-24 bg-transparent">
      <div className="section-container">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="space-y-4">
            <p className="eyebrow">Portfolio</p>
            <h2 className="text-4xl lg:text-5xl font-medium text-on-dark tracking-[-0.05em] font-heading">
              Selected Works
            </h2>
            <p className="text-lg text-body-muted max-w-xl font-sans">
              Exploring the intersection of code and creativity through diverse professional projects.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex p-1 bg-surface-75 border border-border-strong relative">
            <button 
              onClick={() => setMode('developer')}
              className={cn(
                "relative z-10 px-6 py-2 text-[0.65rem] font-heading font-bold uppercase tracking-[0.16em] transition-colors duration-300",
                mode === 'developer' ? "text-canvas" : "text-body-muted hover:text-on-dark"
              )}
            >
              Developer
            </button>
            <button 
              onClick={() => setMode('creative')}
              className={cn(
                "relative z-10 px-6 py-2 text-[0.65rem] font-heading font-bold uppercase tracking-[0.16em] transition-colors duration-300",
                mode === 'creative' ? "text-canvas" : "text-body-muted hover:text-on-dark"
              )}
            >
              Creative
            </button>
            
            {/* Active background pill */}
            <motion.div
              initial={false}
              animate={{ x: mode === 'developer' ? 0 : '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute top-1 left-1 bottom-1 w-[calc(50%-4px)] bg-on-dark z-0"
            />
          </div>
        </div>

        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16"
        >
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, i) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className={cn(
                  "relative block",
                  project.span
                )}
              >
                <Link 
                  href={`/projects/${project.slug}`}
                  className="group block"
                >
                  <div 
                    className="photo-frame w-full h-full transition-transform duration-500 group-hover:rotate-0"
                    style={{ transform: `rotate(${i % 2 === 0 ? -1 : 1.5}deg)` }}
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-canvas">
                      <img 
                        src={project.img} 
                        alt={project.title}
                        className="w-full h-full object-cover grayscale transition-all duration-1000 group-hover:grayscale-0 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/5 mix-blend-overlay pointer-events-none" />
                      
                      {/* Floating Tech Badges */}
                      <div className="absolute top-4 left-4 flex gap-2">
                         {project.github && project.github !== '#' && (
                           <div 
                             className="p-2 bg-on-dark/80 backdrop-blur-md text-canvas rounded-full hover:bg-primary transition-colors duration-300"
                           >
                             <GitBranch size={14} />
                           </div>
                         )}
                      </div>

                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 bg-surface-200/90 backdrop-blur-md text-[0.6rem] font-heading font-bold tracking-[0.16em] text-on-dark uppercase shadow-sm border border-border-strong">
                          {project.category}
                        </span>
                      </div>

                      {/* View Case Study Overlay */}
                      <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
                        <span className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-canvas flex items-center gap-2">
                          View Case Study
                          <ExternalLink size={12} />
                        </span>
                      </div>
                    </div>
                    
                    <div className="photo-label flex flex-col items-start gap-1">
                      <div className="w-full flex justify-between items-center">
                        <h3 className="text-sm font-medium text-on-dark tracking-tight font-heading">{project.title}</h3>
                        <div className="flex items-center gap-2">
                          {project.github && project.github !== '#' && (
                            <div className="text-body-muted group-hover:text-primary transition-colors">
                              <GitBranch size={12} />
                            </div>
                          )}
                          <span className="text-[8px] text-on-dark/30">REF_{2026 + project.id}</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-on-dark/60 line-clamp-1 font-sans">
                        {project.desc}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-20 flex justify-center"
        >
          <Link 
            href="/projects"
            className="group flex items-center gap-3 px-10 py-4 border border-border-strong text-on-dark font-heading text-[0.65rem] font-bold uppercase tracking-[0.2em] bg-surface-100 hover:bg-primary hover:text-canvas hover:border-primary transition-all duration-500 skew-x-[-12deg] hover:skew-x-0"
          >
            <span className="skew-x-[12deg] group-hover:skew-x-0 transition-all duration-500 flex items-center gap-3">
              View All Projects
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
