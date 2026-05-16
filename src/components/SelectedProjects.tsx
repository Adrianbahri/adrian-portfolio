'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ExternalLink, Code2, ArrowRight } from 'lucide-react';
import { projects } from '@/data/projects';

export default function SelectedProjects() {
  // Only show the first 2 projects on the home page as requested
  const featuredProjects = projects.slice(0, 2);

  return (
    <section className="w-full py-32 px-6 lg:px-12 bg-canvas">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
          <div className="max-w-2xl">
            <h2 className="text-[34px] font-semibold text-on-dark mb-2 tracking-tight">Selected Projects</h2>
            <p className="text-[21px] text-body-muted font-light">
              Highlighting my best work in <span className="text-on-dark font-medium">mobile application</span> and <span className="text-on-dark font-medium">web development</span>.
            </p>
          </div>
          
          <motion.a 
            href="#" 
            whileHover={{ x: 5 }}
            className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.3em] text-body-muted hover:text-primary transition-colors group"
          >
            View all projects
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </motion.a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {featuredProjects.map((project, i) => (
            <BentoCard key={project.id} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function BentoCard({ project, index }: { project: any, index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className={cn(
        "group relative flex flex-col rounded-2xl overflow-hidden",
        "bg-surface-75 border border-border-subtle",
        "transition-all duration-300 hover:border-border-strong hover:shadow-2xl hover:shadow-primary/5",
        "min-h-[500px]"
      )}
    >
      {/* Visual background glow */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none",
        project.color || 'from-primary/10',
        "to-transparent"
      )} />

      <div className="relative z-10 p-8 sm:p-12 h-full flex flex-col">
        <div className="flex justify-between items-start mb-8">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[12px] uppercase tracking-widest text-primary font-bold block">{project.category}</span>
              {project.icon && <project.icon size={14} className="text-primary/60" />}
            </div>
            <h3 className="text-[28px] sm:text-[36px] font-semibold text-on-dark mb-4 tracking-tight leading-tight">{project.title}</h3>
            <p className="text-[16px] text-body-muted leading-relaxed max-w-md">{project.desc}</p>
          </div>
          <div className="flex gap-4 pt-3">
             <Code2 className="w-5 h-5 text-body-muted/40 hover:text-primary transition-colors cursor-pointer" />
             <ExternalLink className="w-5 h-5 text-body-muted/40 hover:text-primary transition-colors cursor-pointer" />
          </div>
        </div>

        <div className="mt-auto relative rounded-xl overflow-hidden aspect-[16/10] border border-border-subtle group-hover:border-primary/20 transition-all duration-500 shadow-2xl shadow-black/20">
          <img 
            src={project.img} 
            alt={project.title}
            className="w-full h-full object-cover grayscale-[0.4] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-1000" />
        </div>
      </div>
    </motion.div>
  );
}
