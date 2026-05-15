'use client';

import { motion } from 'framer-motion';
import { Trophy, Award, Star, TrendingUp } from 'lucide-react';

const achievements = [
  {
    title: '1st Winner Programming Division',
    event: 'UNITY#12',
    icon: Trophy,
    color: 'bg-yellow-500/10 text-yellow-500'
  },
  {
    title: '1st Winner Digital Event Video',
    event: 'Video Competition',
    icon: Award,
    color: 'bg-blue-500/10 text-blue-500'
  },
  {
    title: 'Finalist FIND IT UGM',
    event: 'National Competition',
    icon: Star,
    color: 'bg-purple-500/10 text-purple-500'
  },
  {
    title: 'Best Pitching Hack4ID',
    event: 'Innovation Lab',
    icon: TrendingUp,
    color: 'bg-emerald-500/10 text-emerald-500'
  }
];

export default function Achievements() {
  return (
    <section id="achievements" className="section-anchor border-t border-border/60 py-12 sm:py-14 bg-transparent">
      <div className="section-container">
        <div className="max-w-2xl space-y-4 mb-12">
          <div className="space-y-3">
            <h2 className="font-heading text-3xl font-medium tracking-[-0.05em] text-on-dark sm:text-[2.2rem]">Achievements</h2>
            <p className="max-w-2xl text-[0.98rem] leading-8 text-body-muted sm:text-[1.02rem]">
              Recognitions for technical excellence and creative execution in national competitions.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
          {achievements.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group space-y-4 border-t border-border/60 pt-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <p className="eyebrow text-primary">Recognition</p>
                  <h3 className="font-heading text-xl font-medium text-on-dark group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm font-mono text-body-muted/70 uppercase tracking-widest">
                    {item.event}
                  </p>
                </div>
                <div className="p-3 bg-surface-100 rounded-lg border border-border/50 group-hover:border-primary transition-colors">
                  <item.icon size={20} className="text-primary" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
