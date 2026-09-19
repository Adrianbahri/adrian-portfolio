'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ExternalLink, GitBranch, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { projects as staticProjects } from '@/data/projects';
import Link from 'next/link';
import { useProjectMode } from '@/context/ProjectModeContext';

export default function FeaturedWork() {
  const { mode, setMode } = useProjectMode();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const activeMode = isMounted ? mode : 'developer';
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
      id: 'identity-unhas',
      title: 'Identity Unhas Media',
      category: 'Editorial & Print',
      desc: 'Visual branding, publication layout, and digital coordination for the premier campus media in Makassar.',
      img: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=1200&q=80',
      tags: ['EDITORIAL', 'BRANDING', 'ADOBE-CC'],
      span: 'md:col-span-4',
      href: '/projects?mode=creative'
    },
    {
      id: 'motion-cinematic',
      title: 'Cinematic & Motion',
      category: 'Motion & Video',
      desc: 'Crafting compelling narratives through visual pacing, rhythm, and cinematic video editing.',
      img: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=1200&q=80',
      tags: ['PREMIERE', 'AFTER-EFFECTS', 'COLOR'],
      span: 'md:col-span-4',
      href: '/projects?mode=creative'
    },
    {
      id: 'visual-design',
      title: 'Visual Explorations',
      category: 'Digital Design',
      desc: 'Exploration of aesthetics, poster compositions, typography, and creative identity experiments.',
      img: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1200&q=80',
      tags: ['FIGMA', 'ILLUSTRATOR', 'POSTER'],
      span: 'md:col-span-4',
      href: '/projects?mode=creative'
    }
  ];

  const filteredProjects = dbProjects.filter(p => p.mode?.toLowerCase() === 'developer' && p.is_favorite).slice(0, 3);
  const rawCreativeProjects = dbProjects.filter(p => p.mode?.toLowerCase() === 'creative');

  const devItems = (filteredProjects.length > 0 
    ? filteredProjects 
    : staticProjects.filter(p => p.mode === 'developer')
  ).slice(0, 3).map((p, idx) => ({
    ...p,
    uniqueKey: `dev-${p.slug || p.id || 'card'}-${idx}`
  }));

  // Safely get creative projects without duplicating items from db and static
  const creativeItems = (() => {
    let list: any[] = [];
    if (dbCreative.length > 0) {
      list = dbCreative;
    } else {
      const projectsSource = rawCreativeProjects.length > 0 
        ? rawCreativeProjects 
        : staticProjects.filter(p => p.mode === 'creative');
      
      const mappedProjects = projectsSource.map((p, idx) => ({
        id: p.slug || `creative-proj-${p.id || idx}`,
        slug: p.slug,
        title: p.title,
        category: p.category || 'Creative Media',
        desc: p.desc || p.description,
        img: p.img || p.image_url,
        tags: p.tags || ['EDITORIAL', 'BRANDING', 'LAYOUT'],
        href: p.slug ? `/projects/${p.slug}` : '/projects?mode=creative',
        span: 'md:col-span-4'
      }));
      list = [...mappedProjects, ...creativeCategories];
    }

    const seen = new Set<string>();
    const result: any[] = [];
    for (const item of list) {
      const normalizedKey = String(item.slug || item.id || item.title || '').toLowerCase().replace(/\s+/g, '-');
      if (!seen.has(normalizedKey)) {
        seen.add(normalizedKey);
        result.push({
          ...item,
          uniqueKey: `creative-${normalizedKey}-${result.length}`
        });
      }
    }
    return result.slice(0, 3);
  })();

  const displayProjects = activeMode === 'developer' ? devItems : creativeItems;

  return (
    <section id="work" className="w-full py-20 bg-transparent">
      <div className="section-container">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div className="space-y-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeMode}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="space-y-2"
              >
                <p className="eyebrow mb-1">
                  {activeMode === 'developer' ? 'Developer Portfolio' : 'Creative Portfolio'}
                </p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal text-on-dark tracking-tight font-heading leading-tight">
                  {activeMode === 'developer' ? (
                    <>Selected <span className="text-primary font-normal">Works</span></>
                  ) : (
                    <>Creative <span className="text-primary font-normal">Showcase</span></>
                  )}
                </h2>
                <p className="text-base sm:text-lg text-body-muted max-w-xl font-sans font-normal leading-relaxed">
                  {activeMode === 'developer'
                    ? 'Engineering scalable web applications, interactive interfaces, and intelligent systems.'
                    : 'Visual storytelling, publication design, cinematic motion graphics, and brand experiences.'}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Mode Switcher */}
          <div className="flex p-1 bg-surface-100/60 border border-border-strong rounded-[5px] relative shadow-lg shrink-0">
            <button
              onClick={() => setMode('developer')}
              suppressHydrationWarning
              className={cn(
                "relative z-10 px-5 sm:px-7 py-2 text-xs font-mono uppercase tracking-wider transition-colors duration-300 rounded-[3px] font-medium",
                activeMode === 'developer' ? "text-canvas dark:text-black font-semibold" : "text-body-muted hover:text-on-dark"
              )}
            >
              Developer
            </button>
            <button
              onClick={() => setMode('creative')}
              suppressHydrationWarning
              className={cn(
                "relative z-10 px-5 sm:px-7 py-2 text-xs font-mono uppercase tracking-wider transition-colors duration-300 rounded-[3px] font-medium",
                activeMode === 'creative' ? "text-canvas dark:text-black font-semibold" : "text-body-muted hover:text-on-dark"
              )}
            >
              Creative
            </button>

            {/* Active background pill */}
            {isMounted ? (
              <motion.div
                initial={false}
                animate={{ x: activeMode === 'developer' ? 0 : '100%' }}
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                className="absolute top-1 left-1 bottom-1 w-[calc(50%-4px)] bg-on-dark dark:bg-white z-0 rounded-[3px]"
              />
            ) : (
              <div
                className="absolute top-1 left-1 bottom-1 w-[calc(50%-4px)] bg-on-dark dark:bg-white z-0 rounded-[3px]"
              />
            )}
          </div>
        </div>

        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8"
        >
          <AnimatePresence mode="popLayout">
            {displayProjects.map((project, i) => (
              <motion.div
                key={project.uniqueKey || `${mode}-${project.id || project.slug || 'card'}-${i}`}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4, scale: 1.01 }}
                exit={{ opacity: 0, scale: 0.96 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                  "relative block bg-surface-100/15 hover:bg-surface-100/30 backdrop-blur-sm border border-border-subtle hover:border-primary/40 transition-all duration-500 rounded-[4px] overflow-hidden",
                  project.span || "md:col-span-4"
                )}
              >
                <Link
                  href={project.href || `/projects/${project.slug}`}
                  className="group block p-4"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-surface-200 border border-border-subtle rounded-[3px]">
                    <Image
                      src={project.img}
                      alt={project.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-all duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute top-3 right-3">
                      <span className="px-3 py-1 bg-surface-100/90 backdrop-blur-md text-[10px] font-mono tracking-wider text-on-dark uppercase border border-border-strong rounded-[2px]">
                        {project.category}
                      </span>
                    </div>

                    {/* View Case Study Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-[2px]">
                      <span className="px-5 py-2 bg-on-dark text-canvas border border-primary text-xs font-mono uppercase tracking-wider rounded-[3px] flex items-center gap-2">
                        {mode === 'creative' ? 'Explore Showcase' : 'View Case Study'}
                        <ExternalLink size={13} />
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 space-y-2 px-1 pb-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-xl sm:text-2xl font-normal text-on-dark tracking-tight font-heading leading-tight group-hover:text-primary transition-colors">
                        {project.title}
                      </h3>
                      <div className="w-6 h-6 rounded-[2px] border border-border-subtle flex items-center justify-center text-body-muted group-hover:text-primary group-hover:border-primary/40 transition-colors shrink-0">
                        <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                    <p className="text-sm text-body-muted leading-relaxed font-sans font-normal line-clamp-2">
                      {project.desc}
                    </p>
                    {project.tags && project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {project.tags.slice(0, 3).map((tag: string, idx: number) => (
                          <span key={idx} className="text-[10px] text-body-muted font-mono uppercase tracking-wider border border-border-subtle bg-surface-100/50 px-2 py-0.5 rounded-[2px]">
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
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 flex justify-center"
        >
          <Link
            href={activeMode === 'developer' ? "/projects?mode=developer" : "/projects?mode=creative"}
            className="group flex items-center gap-2.5 px-9 py-4 border border-border-strong text-on-dark font-heading text-xs uppercase tracking-[0.2em] hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 rounded-[3px] hover:-translate-y-0.5"
          >
            {activeMode === 'developer' ? "View All Developer Projects" : "Explore Creative Archive"}
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
