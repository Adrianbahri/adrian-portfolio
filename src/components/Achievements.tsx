'use client';

import { motion } from 'framer-motion';
import { Trophy, Award, Star, TrendingUp } from 'lucide-react';

import { achievementsData } from '@/data/achievements';

export default function Achievements() {
  return (
    <section id="achievements" className="section-anchor py-8 sm:py-12 bg-transparent">
      <div className="section-container">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-t border-border/20 pt-12">
          <div className="max-w-xs space-y-2">
            <h2 className="font-heading text-xl font-medium text-on-dark">Key Achievements</h2>
            <p className="text-[0.85rem] text-body-muted leading-relaxed">
              Technical and creative awards from national competitions.
            </p>
          </div>

          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {achievementsData.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 5 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="group p-4 bg-surface-100/50 rounded-xl border border-border/40 hover:border-primary transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-canvas rounded text-primary group-hover:scale-110 transition-transform">
                    <item.icon size={14} />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-[0.8rem] font-medium text-on-dark leading-tight">
                      {item.title}
                    </h3>
                    <p className="text-[0.65rem] font-mono text-body-muted uppercase tracking-wider">
                      {item.event}
                    </p>
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
