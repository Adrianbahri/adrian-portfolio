'use client';

import { motion } from 'framer-motion';

import { workData, organizationData, volunteerData } from '@/data/experience';

export default function Experience() {
  return (
    <section id="experience" className="section-anchor py-12 sm:py-24 bg-transparent">
      <div className="section-container space-y-24">
        
        {/* Tier 1: Work Experience (Large) */}
        <div className="space-y-12">
          <div className="max-w-2xl space-y-3">
            <h2 className="font-heading text-3xl font-medium tracking-[-0.05em] text-on-dark sm:text-[2.2rem]">Work Experience</h2>
            <p className="text-[0.98rem] leading-8 text-body-muted">
              Professional career and technical internships.
            </p>
          </div>

          <div className="grid gap-8">
            {workData.map((item, i) => (
              <article 
                key={i} 
                className="grid gap-4 border-t border-border/40 pt-8 md:grid-cols-[200px_minmax(0,1fr)] group"
              >
                <div className="md:pt-1">
                  <p className="eyebrow !mb-0">{item.year}</p>
                </div>
                
                <div className="space-y-4 border-l border-border/40 pl-8 group-hover:border-primary transition-colors">
                  <div className="flex items-center gap-5">
                    <div className="p-3 bg-surface-100 border border-border/60 text-primary group-hover:scale-110 transition-transform">
                      <item.icon size={24} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-heading text-[1.6rem] font-medium tracking-[-0.04em] text-on-dark group-hover:text-primary transition-colors">
                        {item.role}
                      </h3>
                      <p className="text-sm font-mono text-body-muted/70 uppercase tracking-widest">
                        {item.company}
                      </p>
                    </div>
                  </div>
                  <p className="text-[1.05rem] leading-8 text-body-muted max-w-3xl">
                    {item.desc}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Tier 2: Organization & Volunteer (Compact Two Columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 pt-12 border-t border-border/20">
          
          {/* Organization History */}
          <div className="space-y-10">
            <div className="space-y-3 border-b border-border/40 pb-6">
              <h3 className="font-heading text-2xl font-medium tracking-[-0.03em] text-on-dark">Organization History</h3>
            </div>

            <div className="space-y-8">
              {organizationData.map((item, i) => (
                <article key={i} className="group flex gap-5">
                  <div className="pt-1">
                    <div className="p-2 bg-surface-100 border border-border/60 text-body-muted group-hover:text-primary transition-colors">
                      <item.icon size={16} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <h4 className="font-heading text-base font-medium text-on-dark group-hover:text-primary transition-colors">
                        {item.role}
                      </h4>
                      <span className="text-[10px] text-body-muted opacity-40">/</span>
                      <p className="text-[10px] font-mono text-body-muted/70 uppercase tracking-widest pt-0.5">
                        {item.company}
                      </p>
                    </div>
                    <p className="text-[0.75rem] text-body-muted font-mono">{item.year}</p>
                    <p className="text-[0.82rem] leading-6 text-body-muted/80 max-w-md mt-1">
                      {item.desc}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Volunteer & Activities */}
          <div className="space-y-10">
            <div className="space-y-3 border-b border-border/40 pb-6">
              <h3 className="font-heading text-2xl font-medium tracking-[-0.03em] text-on-dark">Volunteer & Activities</h3>
            </div>

            <div className="space-y-8">
              {volunteerData.map((item, i) => (
                <article key={i} className="group flex gap-5">
                  <div className="pt-1">
                    <div className="p-2 bg-surface-100 border border-border/60 text-body-muted group-hover:text-on-dark transition-colors">
                      <item.icon size={16} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <h4 className="font-heading text-base font-medium text-on-dark">
                        {item.role}
                      </h4>
                      <span className="text-[10px] text-body-muted opacity-40">/</span>
                      <p className="text-[10px] font-mono text-body-muted/70 uppercase tracking-widest pt-0.5">
                        {item.company}
                      </p>
                    </div>
                    <p className="text-[0.75rem] text-body-muted font-mono">{item.year}</p>
                    <p className="text-[0.82rem] leading-6 text-body-muted/80 max-w-md mt-1">
                      {item.desc}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
