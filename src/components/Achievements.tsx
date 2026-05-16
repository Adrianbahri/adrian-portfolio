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
    <section id="achievements" className="w-full py-10 sm:py-12 bg-transparent">
      <div className="section-container border-t border-border-strong/40">
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-0">
          {/* Title Section */}
          <div className="pt-10 pb-8 md:pb-0">
            <div className="space-y-4">
              <h2 className="font-heading text-xl font-bold text-on-dark leading-tight tracking-widest uppercase text-[0.8rem]">Achievements</h2>
              <p className="text-sm text-body-muted font-sans font-light">
                National awards & recognitions.
              </p>
            </div>
          </div>

          {/* Items Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {sortedAchievements.map((item, i) => {
              const isExpanded = expandedId === item.id;
              
              return (
                <div
                  key={item.id}
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="group relative p-6 pt-10 border-t border-border-subtle md:border-t-0 md:border-l border-border-subtle transition-all duration-500 min-h-[120px] cursor-pointer bg-transparent hover:bg-surface-75/50"
                >
                  {/* Dynamic Expanding Line Overlay */}
                  <div className="absolute left-0 top-0 w-[1px] h-6 group-hover:h-full bg-primary/40 transition-all duration-500 hidden md:block" />
                  
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[10px] font-mono text-primary font-bold tracking-wider">
                          {item.year}
                        </p>
                        <item.icon size={14} className="text-primary/40 group-hover:text-primary transition-colors" />
                      </div>
                      <h3 className="text-[0.95rem] font-bold text-on-dark leading-snug tracking-tight group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-[10px] font-mono text-body-muted uppercase tracking-widest font-bold">
                        {item.event}
                      </p>
                    </div>
                    
                    <AnimatePresence>
                      <motion.div 
                        initial={false}
                        animate={{ 
                          height: isExpanded ? "auto" : (typeof window !== 'undefined' && window.innerWidth >= 1024 ? "auto" : 0),
                          opacity: isExpanded ? 1 : (typeof window !== 'undefined' && window.innerWidth >= 1024 ? 0 : 0),
                        }}
                        className={cn(
                          "overflow-hidden transition-all duration-500 lg:!opacity-0 lg:group-hover:!opacity-100 lg:!h-auto",
                          isExpanded ? "opacity-100 h-auto" : "opacity-0 h-0"
                        )}
                      >
                        <div className="pt-4 border-t border-border-subtle/50 mt-4">
                          <div 
                            className="text-[11px] leading-relaxed text-body-muted font-sans prose-sm prose-invert"
                            dangerouslySetInnerHTML={{ __html: item.desc }}
                          />
                        </div>
                      </motion.div>
                    </AnimatePresence>
                    
                    {/* Mobile Hint */}
                    <div className="lg:hidden mt-4 pt-4 border-t border-border-subtle/30 flex items-center justify-between">
                      <span className="text-[8px] uppercase tracking-widest text-primary/40 font-bold">
                        {isExpanded ? 'Close Detail' : 'Tap for Detail'}
                      </span>
                    </div>
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
