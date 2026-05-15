'use client';

import { motion } from 'framer-motion';
import { Trophy, Award, Star, TrendingUp } from 'lucide-react';

import { achievementsData } from '@/data/achievements';

export default function Achievements() {
  return (
    <section id="achievements" className="section-anchor py-8 sm:py-12 bg-transparent">
      <div className="section-container">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-t border-border/20 pt-12">
          <div className="max-w-[180px] space-y-1">
            <h2 className="font-heading text-lg font-medium text-on-dark leading-tight">Achievements</h2>
            <p className="text-[0.7rem] text-body-muted leading-relaxed">
              National awards & recognitions.
            </p>
          </div>

          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {achievementsData.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 5 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5, scale: 1.02 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="group relative p-4 bg-surface-100/50 rounded-xl border border-border/40 hover:border-primary/50 hover:bg-surface-200 transition-all cursor-default overflow-hidden h-fit"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-canvas rounded text-primary group-hover:bg-primary group-hover:text-canvas transition-colors">
                        <item.icon size={14} />
                      </div>
                      <h3 className="text-[0.8rem] font-medium text-on-dark leading-tight">
                        {item.title}
                      </h3>
                    </div>
                    <span className="text-[0.65rem] font-mono text-primary/60">{item.year}</span>
                  </div>
                  
                  {/* Expandable Description */}
                  <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-all duration-500 ease-in-out">
                    <div className="overflow-hidden">
                      <p className="text-[0.7rem] leading-5 text-body-muted border-t border-border/20 pt-2 mt-2">
                        {item.desc}
                      </p>
                      <p className="text-[0.6rem] font-mono text-primary/40 uppercase tracking-widest mt-2">
                        {item.event}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
