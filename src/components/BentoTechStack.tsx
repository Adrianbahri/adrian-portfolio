'use client';

import { motion } from 'framer-motion';
import { Database, ShieldCheck, Zap, HardDrive, MousePointerClick, Box } from 'lucide-react';
import { cn } from '@/lib/utils';

const techItems = [
  {
    title: "Postgres Database",
    desc: "Every project is a full Postgres database, the world's most trusted relational database.",
    icon: Database,
    span: "md:col-span-12 xl:col-span-6",
    color: "text-brand"
  },
  {
    title: "Authentication",
    desc: "Add user sign ups and logins, securing your data with RLS.",
    icon: ShieldCheck,
    span: "md:col-span-6 xl:col-span-3"
  },
  {
    title: "Edge Functions",
    desc: "Write custom code without deploying or scaling servers.",
    icon: Zap,
    span: "md:col-span-6 xl:col-span-3"
  },
  {
    title: "Storage",
    desc: "Store, organize, and serve large files like videos and images.",
    icon: HardDrive,
    span: "md:col-span-6 xl:col-span-3"
  },
  {
    title: "Realtime",
    desc: "Build multiplayer experiences with real-time data sync.",
    icon: MousePointerClick,
    span: "md:col-span-6 xl:col-span-3"
  },
  {
    title: "Vector",
    desc: "Integrate ML-models to store and search vector embeddings.",
    icon: Box,
    span: "md:col-span-6 xl:col-span-6"
  }
];

export default function BentoTechStack() {
  return (
    <section className="w-full py-24 bg-transparent border-t border-border/60">
      <div className="section-container">
        <div className="mb-16">
          <p className="eyebrow">The Stack</p>
          <h2 className="text-4xl lg:text-5xl font-medium text-on-dark tracking-[-0.05em] font-heading">
            Modern Infrastructure
          </h2>
          <p className="text-lg text-body-muted max-w-2xl font-sans mt-4">
            Leveraging industry-standard tools to build scalable, high-performance digital products.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
          {techItems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className={cn("group relative", item.span)}
            >
              <div 
                className="photo-frame h-full transition-all duration-500 hover:rotate-0"
                style={{ transform: `rotate(${i % 2 === 0 ? -0.8 : 0.8}deg)` }}
              >
                <div className="relative h-48 md:h-64 overflow-hidden bg-canvas rounded-sm flex items-center justify-center">
                  <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                  <item.icon size={48} className="text-primary/40 group-hover:text-primary transition-all duration-500 scale-90 group-hover:scale-110" />
                </div>
                
                <div className="photo-label flex flex-col gap-1">
                  <div className="w-full flex justify-between items-center">
                    <h3 className="text-sm font-medium text-black tracking-tight font-heading">{item.title}</h3>
                    <span className="text-[8px] text-black/30">MODULE_{i + 1}</span>
                  </div>
                  <p className="text-[10px] text-black/60 line-clamp-2 font-sans">
                    {item.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
