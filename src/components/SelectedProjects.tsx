'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ExternalLink, Code2 } from 'lucide-react';

const projects = [
  { 
    id: 1, 
    title: 'Spatial UI Framework', 
    category: 'Design System', 
    desc: 'A comprehensive framework for spatial computing interfaces, focusing on depth and haptics.',
    img: 'https://images.unsplash.com/photo-1616469829581-73993eb86b02?auto=format&fit=crop&w=800&q=80',
    span: 'md:col-span-12 xl:col-span-8',
    color: 'from-emerald-500/20'
  },
  { 
    id: 2, 
    title: 'Crypto Pulse', 
    category: 'Web App', 
    desc: 'Real-time analytics for decentralized finance protocols.',
    img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    span: 'md:col-span-6 xl:col-span-4',
    color: 'from-blue-500/20'
  },
  { 
    id: 3, 
    title: 'Editorial Reader', 
    category: 'Mobile', 
    desc: 'A distraction-free reading experience for modern journalism.',
    img: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&w=800&q=80',
    span: 'md:col-span-6 xl:col-span-4',
    color: 'from-orange-500/20'
  },
  { 
    id: 4, 
    title: 'Brand Identity: Astra', 
    category: 'Identity', 
    desc: 'Full brand identity for a sustainable space exploration startup.',
    img: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=800&q=80',
    span: 'md:col-span-12 xl:col-span-8',
    color: 'from-purple-500/20'
  },
];

export default function SelectedProjects() {
  return (
    <section className="w-full py-32 px-6 lg:px-12 bg-canvas">
      <div className="max-w-[1440px] mx-auto">
        <div className="mb-20">
          <h2 className="text-[34px] font-semibold text-on-dark mb-2 tracking-tight">Selected Projects</h2>
          <p className="text-[21px] text-body-muted font-light">A masterclass in functional minimalism.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6">
          {projects.map((project, i) => (
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
        project.span
      )}
    >
      {/* Visual background glow */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none",
        project.color,
        "to-transparent"
      )} />

      <div className="relative z-10 p-8 h-full flex flex-col">
        <div className="flex justify-between items-start mb-6">
          <div>
            <span className="text-[12px] uppercase tracking-widest text-primary font-bold mb-2 block">{project.category}</span>
            <h3 className="text-[24px] font-semibold text-on-dark mb-3">{project.title}</h3>
            <p className="text-[15px] text-body-muted leading-relaxed max-w-sm">{project.desc}</p>
          </div>
          <div className="flex gap-3">
             <Code2 className="w-5 h-5 text-body-muted hover:text-on-dark transition-colors cursor-pointer" />
             <ExternalLink className="w-5 h-5 text-body-muted hover:text-on-dark transition-colors cursor-pointer" />
          </div>
        </div>

        <div className="mt-auto relative rounded-xl overflow-hidden aspect-video xl:aspect-auto xl:h-64 border border-border-subtle group-hover:border-border-strong transition-colors">
          <img 
            src={project.img} 
            alt={project.title}
            className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-700" />
        </div>
      </div>
    </motion.div>
  );
}
