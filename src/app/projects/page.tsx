'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ArrowLeft, ExternalLink, Code2, Globe, GitHub, Search, Filter } from 'lucide-react';
import { projects } from '@/data/projects';
import Link from 'next/link';

export default function ProjectsPage() {
  const [filter, setFilter] = useState<'all' | 'developer' | 'creative'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = projects.filter(project => {
    const matchesFilter = filter === 'all' || project.mode === filter;
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         project.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <main className="min-h-screen bg-canvas pt-32 pb-24 relative overflow-hidden">
      {/* Blueprint Grid Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.03]" 
             style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute inset-x-0 top-0 h-px bg-border-subtle" />
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-border-subtle opacity-50 hidden md:block" />
      </div>

      <div className="section-container relative z-10">
        {/* Header */}
        <div className="mb-16 space-y-8">
          <Link 
            href="/" 
            className="group inline-flex items-center gap-2 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-body-muted hover:text-on-dark transition-colors"
          >
            <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <p className="eyebrow">Archive</p>
              <h1 className="text-5xl lg:text-7xl font-medium tracking-[-0.06em] text-on-dark font-heading">
                All Projects
              </h1>
              <p className="text-xl text-body-muted max-w-2xl font-sans leading-relaxed">
                A comprehensive collection of my experiments, professional work, and creative explorations.
              </p>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 p-4 bg-surface-50 border border-border-subtle rounded-2xl backdrop-blur-sm">
          <div className="flex items-center gap-2 p-1 bg-surface-100 rounded-full border border-border-strong w-full md:w-auto">
            {['all', 'developer', 'creative'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={cn(
                  "px-6 py-2 rounded-full text-[0.6rem] font-bold uppercase tracking-[0.16em] transition-all duration-300",
                  filter === f 
                    ? "bg-on-dark text-canvas shadow-lg" 
                    : "text-body-muted hover:text-on-dark hover:bg-surface-200"
                )}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-body-muted" size={16} />
            <input 
              type="text" 
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-surface-100 border border-border-strong rounded-full text-sm text-on-dark placeholder:text-body-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, idx) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="group flex flex-col h-full bg-surface-50 border border-border-subtle rounded-3xl overflow-hidden hover:border-primary/30 transition-all duration-500 shadow-sm hover:shadow-2xl"
              >
                {/* Visual Header */}
                <div className="relative aspect-video overflow-hidden">
                  <img 
                    src={project.img} 
                    alt={project.title}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-canvas/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-on-dark text-canvas text-[0.55rem] font-bold uppercase tracking-widest rounded-md shadow-lg">
                      {project.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 flex flex-col flex-1 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-medium text-on-dark font-heading">{project.title}</h3>
                      <project.icon size={18} className="text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-sm text-body-muted leading-relaxed line-clamp-3 font-sans">
                      {project.desc}
                    </p>
                  </div>

                  <div className="mt-auto pt-6 border-t border-border-subtle flex items-center justify-between">
                    <div className="flex gap-4">
                      <button className="text-body-muted hover:text-primary transition-colors">
                        <GitHub size={18} />
                      </button>
                      <button className="text-body-muted hover:text-primary transition-colors">
                        <Globe size={18} />
                      </button>
                    </div>
                    <Link 
                      href={`/projects/${project.id}`}
                      className="inline-flex items-center gap-2 text-[0.6rem] font-bold uppercase tracking-[0.15em] text-primary hover:text-on-dark transition-colors group/link"
                    >
                      View Case Study
                      <ExternalLink size={12} className="group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <div className="py-32 text-center">
            <p className="text-body-muted font-heading uppercase tracking-widest text-sm">No projects found matching your search</p>
          </div>
        )}
      </div>
    </main>
  );
}
