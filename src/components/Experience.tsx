'use client';

import { motion } from 'framer-motion';

import { organizationData, volunteerData } from '@/data/experience';

export default function Experience() {
  return (
    <section id="experience" className="section-anchor py-12 sm:py-20 bg-transparent">
      <div className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          
          {/* Organization History */}
          <div className="space-y-10">
            <div className="space-y-3 border-b border-border/40 pb-6">
              <h2 className="font-heading text-2xl font-medium tracking-[-0.03em] text-on-dark">Organization History</h2>
              <p className="text-sm text-body-muted leading-relaxed">
                Professional roles and leadership in structured organizations.
              </p>
            </div>

            <div className="space-y-8">
              {organizationData.map((item, i) => (
                <article key={i} className="group flex gap-5">
                  <div className="pt-1">
                    <div className="p-2 bg-surface-100 rounded-md border border-border/60 text-primary group-hover:bg-primary group-hover:text-canvas transition-colors">
                      <item.icon size={16} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <h3 className="font-heading text-base font-medium text-on-dark group-hover:text-primary transition-colors">
                        {item.role}
                      </h3>
                      <span className="text-[10px] text-body-muted opacity-40">/</span>
                      <p className="text-[10px] font-mono text-body-muted/70 uppercase tracking-widest pt-0.5">
                        {item.company}
                      </p>
                    </div>
                    <p className="text-[0.8rem] text-body-muted font-mono">{item.year}</p>
                    <p className="text-[0.85rem] leading-6 text-body-muted/80 max-w-md mt-1">
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
              <h2 className="font-heading text-2xl font-medium tracking-[-0.03em] text-on-dark">Volunteer & Activities</h2>
              <p className="text-sm text-body-muted leading-relaxed">
                Voluntary work and contributions to community projects.
              </p>
            </div>

            <div className="space-y-8">
              {volunteerData.map((item, i) => (
                <article key={i} className="group flex gap-5">
                  <div className="pt-1">
                    <div className="p-2 bg-surface-100 rounded-md border border-border/60 text-body-muted group-hover:bg-on-dark group-hover:text-canvas transition-colors">
                      <item.icon size={16} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <h3 className="font-heading text-base font-medium text-on-dark group-hover:text-on-dark transition-colors">
                        {item.role}
                      </h3>
                      <span className="text-[10px] text-body-muted opacity-40">/</span>
                      <p className="text-[10px] font-mono text-body-muted/70 uppercase tracking-widest pt-0.5">
                        {item.company}
                      </p>
                    </div>
                    <p className="text-[0.8rem] text-body-muted font-mono">{item.year}</p>
                    <p className="text-[0.85rem] leading-6 text-body-muted/80 max-w-md mt-1">
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
