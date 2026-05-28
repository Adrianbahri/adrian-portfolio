'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ExternalLink, GitBranch, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { projects as staticProjects } from '@/data/projects';
import Link from 'next/link';

type ProjectMode = 'developer' | 'creative';

export default function FeaturedWork() {
  const [mode, setMode] = useState<ProjectMode>('developer');
  const [dbProjects, setDbProjects] = useState<any[]>([]);
  const [dbCreative, setDbCreative] = useState<any[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
      if (data && data.length > 0) {
        // Map DB columns to match local expectations
        const mapped = data.map((p, idx) => ({
          ...p,
          img: p.image_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop',
          github: p.github_url,
          desc: p.description,
          yearRange: p.year_range,
          // Buat semua ukuran seragam agar bisa berjejer 3
          span: "md:col-span-4"
        }));
        setDbProjects(mapped);
      } else {
        setDbProjects(staticProjects);
      }
    };

    const fetchCreative = async () => {
      try {
        const { data } = await supabase
          .from('creative_categories')
          .select('*')
          .order('order_index', { ascending: true });
        
        if (data && data.length > 0) {
          const mapped = data.map(c => ({
            id: c.id,
            title: c.title,
            category: c.category,
            desc: c.description,
            img: c.image_url,
            span: 'md:col-span-4',
            href: c.link_url || '/projects?mode=creative'
          }));
          setDbCreative(mapped);
        }
      } catch (err) {
        console.error('Error fetching creative spotlight cards:', err);
      }
    };

    fetchProjects();
    fetchCreative();
  }, []);

  // Defining Creative Category Cards for fallback/default view
  const creativeCategories = [
    {
      id: 'motion',
      title: 'Cinematic & Motion',
      category: 'Motion',
      desc: 'Crafting narratives through visual rhythm and cinematic motion graphics.',
      img: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=1200&q=80',
      span: 'md:col-span-4',
      href: '/projects?mode=creative'
    },
    {
      id: 'design',
      title: 'Visual Explorations',
      category: 'Design',
      desc: 'Exploring aesthetics through themed visual compositions and high-fidelity experiments.',
      img: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1200&q=80',
      span: 'md:col-span-4',
      href: '/projects?mode=creative'
    },
    {
      id: 'photo',
      title: 'Perspectives',
      category: 'Photography',
      desc: 'A visual journal of light and perspectives captured through the lens.',
      img: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&w=1200&q=80',
      span: 'md:col-span-4',
      href: '/projects?mode=creative'
    }
  ];

  const filteredProjects = dbProjects.filter(p => p.mode?.toLowerCase() === 'developer' && p.is_favorite).slice(0, 3);

  const displayProjects = mode === 'developer'
    ? (filteredProjects.length > 0 ? filteredProjects : staticProjects.filter(p => p.mode === 'developer').slice(0, 3))
    : (dbCreative.length > 0 ? dbCreative : creativeCategories);

  return (
    <section id="work" className="w-full py-20 bg-transparent">
      <div className="section-container">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div className="space-y-4">
            <p className="eyebrow">Portfolio</p>
            <h2 className="text-3xl md:text-[2.2rem] font-medium text-on-dark tracking-[-0.05em] font-heading leading-tight">
              Selected Works
            </h2>
            <p className="text-lg text-body-muted max-w-xl font-sans font-light leading-relaxed">
              Exploring the intersection of code and creativity through diverse professional projects.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex p-1 bg-surface-100 border border-border-strong rounded-[5px] relative shadow-2xl">
            <button
              onClick={() => setMode('developer')}
              className={cn(
                "relative z-10 flex-1 px-4 sm:px-8 py-2 text-[10px] font-heading font-bold uppercase tracking-[0.2em] transition-colors duration-300 rounded-[3px]",
                mode === 'developer' ? "text-canvas" : "text-body-muted hover:text-on-dark"
              )}
            >
              Developer
            </button>
            <button
              onClick={() => setMode('creative')}
              className={cn(
                "relative z-10 flex-1 px-4 sm:px-8 py-2 text-[10px] font-heading font-bold uppercase tracking-[0.2em] transition-colors duration-300 rounded-[3px]",
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
              className="absolute top-1 left-1 bottom-1 w-[calc(50%-4px)] bg-on-dark z-0 rounded-[3px]"
            />
          </div>
        </div>

        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8"
        >
          <AnimatePresence mode="popLayout">
            {displayProjects.map((project, i) => (
              <motion.div
                key={project.id || project.slug}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, rotate: i % 2 === 0 ? 1 : -1 }}
                whileHover={{ rotate: 0, scale: 1.02, zIndex: 10 }}
                exit={{ opacity: 0, scale: 0.95 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className={cn(
                  "relative block bg-surface-100/50 border border-border-subtle transition-all duration-500 hover:border-primary/20 rounded-[5px] overflow-hidden",
                  project.span || "md:col-span-4"
                )}
              >
                <Link
                  href={project.href || `/projects/${project.slug}`}
                  className="group block p-4"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-canvas border border-border-subtle rounded-[3px]">
                    <img
                      src={project.img}
                      alt={project.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105"
                    />
                    <div className="absolute top-3 right-3">
                      <span className="px-3 py-1 bg-surface-200/90 backdrop-blur-md text-[0.55rem] font-bold tracking-[0.2em] text-on-dark uppercase border border-border-strong rounded-[2px]">
                        {project.category}
                      </span>
                    </div>

                    {/* View Case Study Overlay */}
                    <div className="absolute inset-0 bg-canvas/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center backdrop-blur-[2px]">
                      <span className="px-6 py-2 border border-primary text-primary text-[0.6rem] font-bold uppercase tracking-[0.2em] flex items-center gap-2 rounded-[2px]">
                        {mode === 'creative' ? 'Explore Category' : 'View Case Study'}
                        <ExternalLink size={12} />
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 space-y-2 px-2">
                    <h3 className="text-xl font-medium text-on-dark tracking-tight font-heading leading-tight group-hover:text-primary transition-colors">{project.title}</h3>
                    <p className="text-sm text-body-muted leading-relaxed font-sans font-light line-clamp-2">
                      {project.desc}
                    </p>
                    {mode === 'developer' && project.tags && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {project.tags.slice(0, 3).map((tag: string, i: number) => (
                          <span key={i} className="text-[7px] text-on-dark/30 font-bold uppercase tracking-widest border border-border-subtle px-2 py-0.5 rounded-[2px]">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
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
          className="mt-24 flex justify-center"
        >
          <Link
            href="/projects"
            className="group flex items-center gap-3 px-10 py-4 border border-border-strong text-on-dark font-heading text-[0.65rem] font-bold uppercase tracking-[0.2em] hover:bg-primary hover:text-canvas hover:border-primary transition-all duration-500 rounded-[5px]"
          >
            View All Projects
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
