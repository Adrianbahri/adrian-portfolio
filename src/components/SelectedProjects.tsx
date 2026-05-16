'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ExternalLink, Code2, ArrowRight, Video, Palette, Camera, ArrowUpRight } from 'lucide-react';
import { projects } from '@/data/projects';
import Link from 'next/link';

// Defining Creative Category Cards
const creativeCategories = [
  {
    id: 'motion',
    title: 'Cinematic & Motion',
    category: 'Motion',
    desc: 'Crafting narratives through visual rhythm, sound, and cinematic motion graphics.',
    img: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=1200&q=80',
    icon: Video,
    href: '/projects?mode=creative'
  },
  {
    id: 'design',
    title: 'Visual Explorations',
    category: 'Design',
    desc: 'Exploring aesthetics through themed visual compositions and high-fidelity design experiments.',
    img: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1200&q=80',
    icon: Palette,
    href: '/projects?mode=creative'
  },
  {
    id: 'photo',
    title: 'Perspectives',
    category: 'Photography',
    desc: 'A visual journal of moments, light, and perspectives captured through the lens.',
    img: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&w=1200&q=80',
    icon: Camera,
    href: '/projects?mode=creative'
  }
];

export default function SelectedProjects() {
  const [mode, setMode] = useState<'developer' | 'creative'>('developer');

  // Filter projects for developer mode (taking top 3)
  const developerProjects = projects.filter(p => (p.mode?.toLowerCase() || 'developer') === 'developer').slice(0, 3);

  return (
    <section id="work" className="section-anchor w-full py-32 px-6 lg:px-12 bg-transparent">
      <div className="max-w-[1440px] mx-auto">

        {/* HEADER SECTION */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-20">
          <div className="max-w-2xl space-y-4">
            <p className="eyebrow">Portfolio</p>
            <h2 className="text-[42px] lg:text-[64px] font-medium text-on-dark tracking-[-0.05em] leading-none font-heading">
              Selected Works
            </h2>
            <p className="text-lg text-body-muted font-light max-w-xl">
              Exploring the intersection of code and creativity through diverse professional projects.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8">
            {/* MODE SWITCHER */}
            <div className="flex items-center p-1 bg-surface-100 border border-border-strong rounded-[5px] shadow-2xl">
              <button
                onClick={() => setMode('developer')}
                className={cn(
                  "px-8 py-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-all rounded-[3px]",
                  mode === 'developer' ? "bg-on-dark text-canvas" : "text-body-muted hover:text-on-dark"
                )}
              >
                Developer
              </button>
              <button
                onClick={() => setMode('creative')}
                className={cn(
                  "px-8 py-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-all rounded-[3px]",
                  mode === 'creative' ? "bg-on-dark text-canvas" : "text-body-muted hover:text-on-dark"
                )}
              >
                Creative
              </button>
            </div>

            <Link
              href="/projects"
              className="group flex items-center gap-3 px-8 py-4 border border-border-strong text-on-dark font-heading text-[0.65rem] font-bold uppercase tracking-[0.2em] hover:bg-on-dark hover:text-canvas transition-all duration-500 rounded-[5px]"
            >
              View All Projects
              <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {mode === 'developer' ? (
            developerProjects.length > 0 ? (
              developerProjects.map((project, i) => (
                <BentoCard key={project.id} project={project} index={i} isCategory={false} />
              ))
            ) : (
              <p className="text-body-muted text-sm col-span-full py-12">No technical projects to display.</p>
            )
          ) : (
            creativeCategories.length > 0 ? (
              creativeCategories.map((cat, i) => (
                <BentoCard key={cat.id} project={cat} index={i} isCategory={true} />
              ))
            ) : (
              <p className="text-body-muted text-sm col-span-full py-12">No creative categories to display.</p>
            )
          )}
        </div>
      </div>
    </section>
  );
}

function BentoCard({ project, index, isCategory }: { project: any, index: number, isCategory: boolean }) {
  return (
    <motion.div
      key={project.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className={cn(
        "group relative flex flex-col overflow-hidden bg-transparent border border-white/5 transition-all duration-500 hover:border-primary/20",
        "min-h-[480px]"
      )}
    >
      <div className="relative z-10 p-8 h-full flex flex-col">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] uppercase tracking-widest text-primary font-bold">{project.category}</span>
              {project.icon && <project.icon size={12} className="text-primary/60" />}
            </div>
            <h3 className="text-2xl font-medium text-on-dark mb-3 tracking-tight font-heading leading-tight group-hover:text-primary transition-colors">{project.title}</h3>
            <p className="text-sm text-body-muted leading-relaxed font-sans line-clamp-3">{project.desc || project.description}</p>
          </div>

          {!isCategory && (
            <div className="flex gap-3 pt-1">
              <Code2 size={16} className="text-body-muted/40 hover:text-primary transition-colors cursor-pointer" />
              <ExternalLink size={16} className="text-body-muted/40 hover:text-primary transition-colors cursor-pointer" />
            </div>
          )}
        </div>

        <div className="mt-auto relative overflow-hidden aspect-[16/10] border border-white/5 group-hover:border-primary/20 transition-all duration-700 shadow-2xl">
          <img
            src={project.img || project.image_url}
            alt={project.title}
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-canvas/40 group-hover:bg-transparent transition-colors duration-700" />

          {isCategory && (
            <Link href={project.href} className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-canvas/60 backdrop-blur-[2px]">
              <span className="px-6 py-2 border border-primary text-primary font-bold text-[0.6rem] uppercase tracking-[0.2em]">Explore Category</span>
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}
