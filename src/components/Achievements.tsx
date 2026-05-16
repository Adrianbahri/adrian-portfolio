'use client';

import { motion } from 'framer-motion';
import { Trophy, Award, Star, TrendingUp } from 'lucide-react';

import { achievementsData } from '@/data/achievements';

export default function Achievements() {
  // Auto-sort achievements by year (newest first)
  const sortedAchievements = [...achievementsData].sort((a, b) => {
    return parseInt(b.year) - parseInt(a.year);
  });

  return (
    <section id="achievements" className="section-anchor pt-16 sm:pt-24 pb-8 sm:pb-12 bg-transparent">
      <div className="section-container border-t border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-0">
          {/* Title Section */}
          <div className="pt-12 pb-8 md:pb-0">
            <div className="space-y-2">
              <h2 className="font-heading text-lg font-medium text-on-dark leading-tight">Achievements</h2>
              <p className="text-[0.7rem] text-body-muted leading-relaxed">
                National awards & recognitions.
              </p>
            </div>
          </div>

          {/* Items Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {sortedAchievements.map((item, i) => (
              <div
                key={i}
                className="group relative p-8 pt-12 border-t border-white/5 md:border-t-0 md:border-l border-white/5 hover:bg-white/[0.02] transition-colors min-h-[180px]"
              >
                {/* Dynamic Expanding Line Overlay */}
                <div className="absolute left-0 top-0 w-[1px] h-8 group-hover:h-full bg-primary/40 transition-all duration-500 hidden md:block" />
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[10px] font-mono text-primary/60 tracking-wider">
                        {item.year}
                      </p>
                      <item.icon size={12} className="text-body-muted/40 group-hover:text-primary transition-colors" />
                    </div>
                    <h3 className="text-[0.95rem] font-bold text-on-dark leading-snug tracking-tight">
                      {item.title}
                    </h3>
                    <p className="text-[10px] font-mono text-body-muted/60 uppercase tracking-widest">
                      {item.event}
                    </p>
                  </div>
                  
                  <div className="relative">
                    <p className="text-[0.75rem] leading-5 text-body-muted/80 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
