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
    <section id="experience" className="section-anchor border-t border-border/60 py-12 sm:py-14 bg-canvas">
      <div className="section-container">
        <div className="max-w-2xl space-y-4 mb-12">
          <div className="space-y-3">
            <h2 className="font-heading text-3xl font-medium tracking-[-0.05em] text-on-dark sm:text-[2.2rem]">Work Experience</h2>
            <p className="max-w-2xl text-[0.98rem] leading-8 text-body-muted sm:text-[1.02rem]">
              A journey of blending leadership, media production, and creative technology.
            </p>
          </div>
        </div>

        <div className="mt-10">
          <div className="space-y-8">
            {timeline.map((item, i) => (
              <article 
                key={i} 
                className="grid gap-4 border-t border-border/60 pt-6 md:grid-cols-[150px_minmax(0,1fr)] group"
              >
                <div className="space-y-2 md:pt-1">
                  <p className="eyebrow">{item.year}</p>
                </div>
                
                <div className="space-y-4 border-l border-border/50 pl-5 group-hover:border-primary transition-colors">
                  <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px]">
                    <div className="space-y-2">
                      <h3 className="font-heading text-[1.45rem] font-medium tracking-[-0.04em] text-on-dark group-hover:text-primary transition-colors">
                        {item.role}
                      </h3>
                      <p className="text-sm font-mono text-body-muted/70 uppercase tracking-widest">
                        {item.company}
                      </p>
                      <p className="text-[0.95rem] leading-7 text-body-muted max-w-2xl mt-4">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
