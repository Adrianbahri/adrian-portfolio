'use client';

import { motion } from 'framer-motion';

const timeline = [
  {
    year: '2025',
    role: 'Design Coordinator',
    company: 'PK Identitas Unhas',
    desc: 'Leading a team of designers to create high-impact infographics, branding, and media content for campus-wide distribution.'
  },
  {
    year: '2024',
    role: 'Media Mentor',
    company: 'Balance 2024',
    desc: 'Mentoring students in digital media production, communication strategies, and creative tools usage.'
  },
  {
    year: '2024',
    role: 'Reporter',
    company: 'PK Identitas Unhas',
    desc: 'Content creation across article writing, video editing, and social media management.'
  }
];

export default function Experience() {
  return (
    <section id="experience" className="w-full py-24 bg-canvas border-t border-border-subtle">
      <div className="section-container">
        <div className="mb-16">
          <h2 className="text-[34px] font-bold text-on-dark mb-4 tracking-tight">Experience</h2>
          <p className="text-lg text-body-muted font-light max-w-2xl">
            A history of blending leadership, media, and technology.
          </p>
        </div>

        <div className="space-y-0">
          {timeline.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group relative grid grid-cols-1 md:grid-cols-[120px_1fr] gap-8 py-12 border-b border-border-subtle last:border-b-0"
            >
              <div className="text-[20px] font-bold text-primary tracking-tighter pt-1">
                {item.year}
              </div>
              
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <h3 className="text-2xl font-bold text-on-dark">{item.role}</h3>
                  <span className="text-body-muted opacity-40">/</span>
                  <p className="text-lg text-body-muted font-medium">{item.company}</p>
                </div>
                <p className="text-[17px] leading-relaxed text-body-muted/80 max-w-3xl">
                  {item.desc}
                </p>
              </div>

              {/* Hover highlight */}
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none -mx-12 px-12" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
