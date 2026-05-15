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
    <section id="achievements" className="w-full py-24 bg-canvas border-t border-border-subtle">
      <div className="section-container">
        <div className="mb-16">
          <h2 className="text-[34px] font-bold text-on-dark mb-4 tracking-tight">Selected Achievements</h2>
          <p className="text-lg text-body-muted font-light max-w-2xl">
            Recognition for technical excellence and creative execution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="flex items-center gap-6 p-6 rounded-2xl border border-border-subtle bg-surface-75 hover:border-border-strong transition-all group"
            >
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${item.color}`}>
                <item.icon size={28} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-on-dark mb-1">{item.title}</h3>
                <p className="text-sm text-body-muted tracking-wide uppercase">{item.event}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
