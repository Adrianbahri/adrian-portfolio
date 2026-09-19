'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { Trophy, Award, Star, TrendingUp } from 'lucide-react';
import { achievementsData as staticAchievements } from '@/data/achievements';

const iconMap: Record<string, any> = {
  Trophy,
  Award,
  Star,
  TrendingUp,
};

export default function Achievements() {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    const fetchAchievements = async () => {
      const { data } = await supabase.from('achievements').select('*');
      const sourceData = (data && data.length > 0) ? data : staticAchievements;
      
      const mapped = sourceData.map((item, idx) => ({
        id: item.id || idx,
        title: item.title,
        event: item.event || item.event_name || '',
        year: item.year || item.timeline || '',
        desc: item.desc || item.description || '',
        icon: iconMap[item.icon as string] || Trophy
      }));
      
      setAchievements(mapped);
    };
    fetchAchievements();
  }, []);

  const sortedAchievements = [...achievements].sort((a, b) => {
    return parseInt(b.year) - parseInt(a.year);
  });

  return (
    <section id="achievements" className="w-full py-16 sm:py-20 bg-transparent">
      <div className="section-container border-t border-border-subtle pt-16">
        <div className="space-y-10">
          {/* Title Section */}
          <div className="space-y-3">
            <p className="eyebrow">Recognition</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal text-on-dark tracking-tight font-heading leading-tight">
              Selected <span className="text-primary font-normal">Honors</span>
            </h2>
            <p className="text-base sm:text-lg text-body-muted font-sans font-normal">
              National competitions, awards, and recognitions.
            </p>
          </div>

          {/* Items Section: Flush Architectural Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-border-subtle rounded-[4px] divide-y sm:divide-y-0 sm:divide-x divide-border-subtle overflow-hidden">
            {sortedAchievements.map((item, i) => {
              const isExpanded = expandedId === item.id;
              
              return (
                <div
                  key={item.id}
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="group relative p-6 bg-transparent hover:bg-surface-100/15 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                >
                  {/* Dynamic Expanding Line Indicator */}
                  <div className="absolute left-0 top-0 w-[2px] h-5 group-hover:h-full bg-primary/60 transition-all duration-300 hidden md:block" />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono text-primary font-medium tracking-wider">
                        {item.year}
                      </span>
                      <item.icon size={15} className="text-body-muted group-hover:text-primary transition-colors" />
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-heading text-base sm:text-lg font-normal text-on-dark leading-snug group-hover:text-primary transition-colors tracking-tight">
                        {item.title}
                      </h3>
                      <p className="text-xs font-mono text-body-muted uppercase tracking-wider font-medium">
                        {item.event}
                      </p>
                    </div>
                  </div>
                  
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden pt-3 border-t border-border-subtle mt-3"
                      >
                        <div 
                          className="text-xs leading-relaxed text-body-muted font-sans"
                          dangerouslySetInnerHTML={{ __html: item.desc }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="mt-4 pt-3 border-t border-border-subtle/40 flex items-center justify-between text-[11px] font-mono text-body-muted">
                    <span>{isExpanded ? 'Less info' : 'Details'}</span>
                    <span className="text-primary group-hover:translate-x-0.5 transition-transform">→</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
