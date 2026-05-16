'use client';

import { motion } from 'framer-motion';

const skillGroups = [
  {
    category: 'Development',
    skills: ['TypeScript', 'Next.js', 'Tailwind CSS', 'Supabase', 'React', 'Git']
  },
  {
    category: 'Creative',
    skills: ['Video Editing', 'Graphic Design', 'UI/UX Design', 'Motion Design', 'Content Creation']
  },
  {
    category: 'Tools',
    skills: ['Figma', 'Premiere Pro', 'After Effects', 'Photoshop', 'VS Code', 'Illustrator']
  }
];

export default function Skills() {
  return (
    <section id="skills" className="w-full py-24 bg-transparent border-t border-border-subtle">
      <div className="section-container">
        <div className="mb-16">
          <h2 className="text-[34px] font-bold text-on-dark mb-4 tracking-tight">Technical Stack</h2>
          <p className="text-lg text-body-muted font-light max-w-2xl">
            Grouped by expertise, designed for versatility.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {skillGroups.map((group, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="space-y-6"
            >
              <h3 className="text-[12px] uppercase tracking-[0.2em] font-bold text-primary">
                {group.category}
              </h3>
              <div className="flex flex-wrap gap-2">
                {group.skills.map((skill, j) => (
                  <span
                    key={j}
                    className="px-4 py-2 rounded-full border border-border-subtle bg-transparent text-sm text-on-dark hover:border-primary hover:text-primary transition-all cursor-default"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
