'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ArrowLeft, ExternalLink, Code2, Globe, Search, Filter, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function ProjectsPage() {
  const [filter, setFilter] = useState<'developer' | 'creative'>('developer');
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) setProjects(data);
      setLoading(false);
    };
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(project => {
    const matchesFilter = (project.mode || 'developer') === filter;
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (project.category || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <main className="min-h-screen bg-canvas pt-32 pb-24 relative overflow-hidden">
      {/* Blueprint Grid Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.03]" 
             style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute inset-x-0 top-0 h-px bg-border-subtle" />
      </div>

      <div className="section-container relative z-10">
        {/* Header */}
        <div className="mb-16 space-y-8">
          <Link href="/" className="group inline-flex items-center gap-2 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-body-muted hover:text-on-dark transition-colors">
            <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <p className="eyebrow">Archive</p>
              <h1 className="text-5xl lg:text-7xl font-medium tracking-[-0.06em] text-on-dark font-heading">All Projects</h1>
              <p className="text-xl text-body-muted max-w-2xl font-sans leading-relaxed">A comprehensive collection of my professional work and creative explorations.</p>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 p-4 bg-surface-50 border border-border-subtle backdrop-blur-sm">
          <div className="flex items-center gap-4 p-2 w-full md:w-auto">
            {['developer', 'creative'].map((f) => (
              <button key={f} onClick={() => setFilter(f as any)} className={cn("px-8 py-3 text-[0.65rem] font-bold uppercase tracking-[0.2em] transition-all duration-500 skew-x-[-15deg] hover:skew-x-0", filter === f ? "bg-primary text-canvas shadow-lg" : "bg-surface-100 text-body-muted border border-border-subtle hover:bg-surface-200")}>
                <span className="inline-block skew-x-[15deg]">{f}</span>
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-body-muted" size={16} />
            <input type="text" placeholder="Search projects..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-surface-100 border border-border-strong text-sm text-on-dark focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
        </div>

        {loading ? (
          <div className="py-40 flex flex-col items-center justify-center gap-4 text-white/20">
            <Loader2 size={40} className="animate-spin" />
            <p className="text-[0.6rem] font-bold uppercase tracking-[0.3em]">Syncing Showcase...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project, idx) => (
                <motion.div key={project.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.5, delay: idx * 0.05 }} className="group relative grid grid-cols-1 lg:grid-cols-[40%_60%] bg-surface-50/50 border border-border-subtle overflow-hidden hover:border-primary/40 transition-all duration-500 shadow-sm">
                  <div className="relative aspect-video lg:aspect-auto h-full min-h-[220px] overflow-hidden bg-canvas border-b lg:border-b-0 lg:border-r border-border-subtle">
                    <img src={project.img_url || '/placeholder.png'} alt={project.title} className="relative w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 z-10" />
                    <div className="absolute inset-0 bg-gradient-to-r from-canvas/10 to-transparent z-20 pointer-events-none" />
                  </div>
                  <div className="p-6 lg:p-8 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className="px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded text-[0.55rem] font-bold uppercase tracking-widest">{project.status || 'Active'}</span>
                          <span className="text-body-muted text-[0.6rem] uppercase tracking-widest font-medium">{project.year_range || '2025'}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl lg:text-2xl font-medium text-on-dark font-heading tracking-tight group-hover:text-primary transition-colors">{project.title}</h3>
                        <p className="text-sm text-body-muted leading-relaxed font-sans max-w-2xl line-clamp-2 lg:line-clamp-3">{project.description}</p>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {project.tags?.slice(0, 5).map((tag: string) => (
                          <span key={tag} className="px-2 py-0.5 bg-surface-100 border border-border-subtle text-[0.55rem] font-mono uppercase tracking-widest text-body-muted">{tag}</span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-6 pt-5 border-t border-border-subtle flex items-center justify-between gap-4">
                      <div className="flex gap-4">
                        {project.github_url && <a href={project.github_url} target="_blank" className="text-body-muted hover:text-primary transition-colors"><Code2 size={16} /></a>}
                        {project.demo_url && <a href={project.demo_url} target="_blank" className="text-body-muted hover:text-primary transition-colors"><Globe size={16} /></a>}
                      </div>
                      <Link href={`/projects/${project.slug}`} className="inline-flex items-center gap-2 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-primary hover:text-on-dark transition-all group/link">
                        View Case Study
                        <ExternalLink size={12} className="group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {!loading && filteredProjects.length === 0 && (
          <div className="py-32 text-center">
            <p className="text-body-muted font-heading uppercase tracking-widest text-sm">No projects found matching your search</p>
          </div>
        )}
      </div>
    </main>
  );
}
