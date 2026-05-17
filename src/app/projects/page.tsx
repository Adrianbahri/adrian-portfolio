'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ArrowLeft, ExternalLink, Code2, Globe, Search, Filter, Loader2, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import PhotoGallery from '@/components/PhotoGallery';
import VideoShowcase from '@/components/VideoShowcase';
import DesignShowcase from '@/components/DesignShowcase';

import { Suspense } from 'react';

export default function ProjectsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-transparent flex items-center justify-center text-white/20"><Loader2 size={40} className="animate-spin" /></div>}>
      <ProjectsPageContent />
    </Suspense>
  );
}

function ProjectsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const filter = searchParams.get('mode') || 'developer';
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Function to update the mode in URL
  const setFilter = (mode: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('mode', mode);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

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
    const matchesFilter = (project.mode?.toLowerCase() || 'developer') === filter.toLowerCase();
    const matchesSearch = project.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (project.category || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <main className="min-h-screen bg-transparent pb-24 relative">
      <div className="section-container relative z-10 pt-24">
        {/* MAIN MODE SWITCHER (Above the Title) */}
        <div className="py-6 mb-12 border-b border-white/5">
          <div className="flex items-center p-1 bg-surface-100 border border-border-strong w-fit">
            <button
              onClick={() => setFilter('developer')}
              className={cn(
                "px-10 py-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-all",
                filter === 'developer' 
                  ? "bg-white text-canvas" 
                  : "text-body-muted hover:text-on-dark"
              )}
            >
              Developer
            </button>
            <button
              onClick={() => setFilter('creative')}
              className={cn(
                "px-10 py-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-all",
                filter === 'creative' 
                  ? "bg-white text-canvas" 
                  : "text-body-muted hover:text-on-dark"
              )}
            >
              Creative
            </button>
          </div>
        </div>

        {/* Header Title */}
        <div className="mb-12 space-y-3">
          <p className="eyebrow">Archive</p>
          <h1 className="text-3xl lg:text-4xl font-medium tracking-tight text-on-dark font-heading">
            {filter === 'developer' ? 'Technical Works' : 'Creative Works'}
          </h1>
          <p className="text-sm text-body-muted max-w-xl font-sans leading-relaxed">
            {filter === 'developer' 
              ? 'Engineering robust solutions through code and modern web technologies.' 
              : 'Exploring visual narratives through motion, design, and photography.'}
          </p>
        </div>

        {/* Showcase Components (Only in Creative Mode) */}
        {filter === 'creative' && !loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-0" // Flush spacing between showcases
          >
            <VideoShowcase />
            <DesignShowcase />
            <PhotoGallery />
          </motion.div>
        )}

        {/* Projects Grid */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-4 text-white/20">
            <Loader2 size={40} className="animate-spin" />
            <p className="text-[0.6rem] font-bold uppercase tracking-[0.3em]">Loaded =, ambil nafas dan lihat beda terjauh di sekitarmu</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project, idx) => (
                <motion.div 
                  key={project.id} 
                  layout 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, scale: 0.98 }} 
                  transition={{ duration: 0.5, delay: idx * 0.05 }} 
                  className={cn(
                    "group relative overflow-hidden transition-all duration-500",
                    project.mode?.toLowerCase() === 'creative' 
                      ? "bg-transparent" 
                      : "bg-transparent border border-white/5 hover:border-white/10"
                  )}
                >
                  {project.mode?.toLowerCase() === 'creative' ? (
                    /* CINEMATIC CREATIVE PREVIEW CARD */
                    <Link href={`/projects/${project.slug}`} className="block relative aspect-[16/10] overflow-hidden group/card border border-border-subtle hover:border-white/20 transition-all duration-700 shadow-2xl">
                       <img src={project.image_url || '/placeholder.png'} alt={project.title} className="w-full h-full object-cover group-hover/card:scale-110 transition-all duration-[1.5s]" />
                       <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/20 to-transparent opacity-60 group-hover/card:opacity-90 transition-opacity duration-700" />
                       
                       <div className="absolute inset-x-0 bottom-0 p-8 transform translate-y-4 group-hover/card:translate-y-0 transition-transform duration-700">
                          <div className="flex items-center gap-3 mb-3">
                             <span className="px-2 py-0.5 bg-white/10 text-[#ededed] border border-white/15 rounded text-[0.5rem] font-bold uppercase tracking-widest">{project.category}</span>
                             <div className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
                             <span className="text-on-dark text-[0.6rem] uppercase tracking-[0.2em] font-bold">Featured Creative</span>
                          </div>
                          <h3 className="text-3xl lg:text-5xl font-medium text-on-dark font-heading tracking-tight leading-tight mb-4">{project.title}</h3>
                          <div className="flex items-center gap-4 text-body-muted opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 delay-100">
                             <span className="text-[0.65rem] font-bold uppercase tracking-widest">View Experience</span>
                             <ChevronRight size={14} className="text-white/60" />
                          </div>
                       </div>
                       
                       {/* Floating Decorative Elements */}
                       <div className="absolute top-8 right-8 flex items-center gap-2 opacity-0 group-hover/card:opacity-100 transition-all duration-700 -translate-y-2 group-hover/card:translate-y-0">
                          <span className="w-8 h-[1px] bg-white/20" />
                          <span className="text-[0.5rem] font-mono text-white/40 uppercase tracking-[0.3em]">Cinematic Edit</span>
                       </div>
                    </Link>
                  ) : (
                    /* TECHNICAL DEVELOPER CARD */
                    <div className="grid grid-cols-1 lg:grid-cols-[40%_60%]">
                      <div className="relative aspect-video lg:aspect-auto h-full min-h-[220px] overflow-hidden bg-canvas border-b lg:border-b-0 lg:border-r border-border-subtle">
                        <img src={project.image_url || '/placeholder.png'} alt={project.title} className="relative w-full h-full object-cover group-hover:scale-105 transition-all duration-700 z-10" />
                        <div className="absolute inset-0 bg-gradient-to-r from-canvas/10 to-transparent z-20 pointer-events-none" />
                      </div>
                      <div className="p-6 lg:p-8 flex flex-col justify-between">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <span className="inline-flex items-center justify-center px-2 py-1 bg-white/5 text-[#ededed] border border-white/15 rounded text-[0.55rem] font-bold uppercase tracking-wider leading-none">{project.status || 'Active'}</span>
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
                            {project.github_url && <a href={project.github_url} target="_blank" className="text-body-muted hover:text-white transition-colors"><Code2 size={16} /></a>}
                            {project.demo_url && <a href={project.demo_url} target="_blank" className="text-body-muted hover:text-white transition-colors"><Globe size={16} /></a>}
                          </div>
                          <Link href={`/projects/${project.slug}`} className="inline-flex items-center gap-2 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-primary hover:text-on-dark transition-all group/link">
                            View Case Study
                            <ExternalLink size={12} className="group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* FOOTER BACK BUTTON */}
        <div className="mt-24 pt-12 border-t border-white/5 flex justify-center">
          <Link href="/" className="group flex flex-col items-center gap-4 text-center">
            <div className="w-12 h-12 rounded-full border border-border-subtle flex items-center justify-center group-hover:bg-white group-hover:text-canvas group-hover:border-white transition-all duration-500">
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </div>
            <div className="space-y-1">
              <span className="block text-[0.6rem] font-bold uppercase tracking-[0.3em] text-body-muted group-hover:text-on-dark transition-colors">Return to Home</span>
              <span className="block text-xs font-heading text-on-dark opacity-40 group-hover:opacity-100 transition-opacity">Back to start</span>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
