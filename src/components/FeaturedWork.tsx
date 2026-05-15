'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ExternalLink, Code2, Play, Layout, Camera } from 'lucide-react';

const projects = [
  { 
    id: 1, 
    title: 'Tunify', 
    category: 'Web Development', 
    desc: 'Music streaming platform focused on seamless UI/UX and process thinking.',
    img: 'https://images.unsplash.com/photo-1614149162883-504ce4d13909?auto=format&fit=crop&w=1200&q=80',
    span: 'md:col-span-8',
    icon: Play
  },
  { 
    id: 2, 
    title: 'Ke-Rent', 
    category: 'UI/UX Design', 
    desc: 'Rental application showcase with comprehensive design system.',
    img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    span: 'md:col-span-4',
    icon: Layout
  },
  { 
    id: 3, 
    title: 'Cinematic Reel', 
    category: 'Video Editing', 
    desc: 'A collection of visual storytelling and professional editing works.',
    img: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800&q=80',
    span: 'md:col-span-4',
    icon: Camera
  },
  { 
    id: 4, 
    title: 'Identity Unhas', 
    category: 'Creative Media', 
    desc: 'Branding and layout coordination for campus media organization.',
    img: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=800&q=80',
    span: 'md:col-span-8',
    icon: Code2
  },
];

export default function FeaturedWork() {
  return (
    <section className="w-full py-24 bg-canvas">
      <div className="section-container">
        <div className="mb-16">
          <h2 className="text-[34px] font-bold text-on-dark mb-4 tracking-tight">Featured Work</h2>
          <p className="text-[20px] text-body-muted font-light max-w-2xl">
            Selected projects that showcase my skills in development, design, and storytelling.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {projects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className={cn(
                "group relative h-[450px] rounded-3xl overflow-hidden border border-border-subtle bg-surface-75",
                project.span
              )}
            >
              <img 
                src={project.img} 
                alt={project.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 rounded-lg bg-primary/20 backdrop-blur-md">
                    <project.icon size={16} className="text-primary" />
                  </div>
                  <span className="text-xs font-bold tracking-widest text-primary uppercase">
                    {project.category}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-on-dark mb-2">{project.title}</h3>
                <p className="text-sm text-body-muted max-w-sm line-clamp-2">
                  {project.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
