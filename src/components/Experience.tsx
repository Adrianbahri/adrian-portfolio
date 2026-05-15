'use client';

import { motion } from 'framer-motion';

import { experienceData } from '@/data/experience';

export default function Experience() {
  return (
    <section id="experience" className="section-anchor py-12 sm:py-14 bg-transparent">
      <div className="section-container">
        <div className="max-w-2xl space-y-4 mb-12">
          <div className="space-y-3">
            <h2 className="font-heading text-3xl font-medium tracking-[-0.05em] text-on-dark sm:text-[2.2rem]">Work Experience</h2>
            <p className="max-w-2xl text-[0.98rem] leading-8 text-body-muted sm:text-[1.02rem]">
              A journey of blending leadership, media production, and creative technology.
            </p>
          </div>
        </div>

        <div className="mt-10">
          <div className="space-y-12">
            {experienceData.map((item, i) => (
              <article 
                key={i} 
                className="grid gap-4 border-t border-border/40 pt-8 md:grid-cols-[180px_minmax(0,1fr)] group"
              >
                <div className="space-y-2 md:pt-1">
                  <p className="eyebrow !mb-0">{item.year}</p>
                </div>
                
                <div className="space-y-4 border-l border-border/40 pl-6 group-hover:border-primary transition-colors">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-surface-100 rounded-lg border border-border/60 text-primary group-hover:scale-110 transition-transform">
                        <item.icon size={20} />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-heading text-[1.45rem] font-medium tracking-[-0.04em] text-on-dark group-hover:text-primary transition-colors">
                          {item.role}
                        </h3>
                        <p className="text-xs font-mono text-body-muted/70 uppercase tracking-widest">
                          {item.company}
                        </p>
                      </div>
                    </div>
                    <p className="text-[0.95rem] leading-7 text-body-muted max-w-2xl">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
