'use client';

import { motion } from 'framer-motion';
import { PlayCircle } from 'lucide-react';

export default function CreativeShowcase() {
  return (
    <section id="creative" className="w-full py-32 bg-canvas border-t border-border-subtle relative overflow-hidden">
      <div className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-16 items-center">
          
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-[34px] font-bold text-on-dark tracking-tight">Creative Showcase</h2>
              <p className="text-[20px] text-body-muted leading-relaxed font-light">
                As a video editor and motion designer, I bring stories to life through cinematic rhythm and visual precision.
              </p>
            </div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative aspect-video rounded-3xl overflow-hidden border border-border-strong group cursor-pointer"
            >
              <img 
                src="https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=1200&q=80" 
                alt="Reel Preview"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-primary/20 backdrop-blur-md flex items-center justify-center border border-primary/30 group-hover:scale-110 transition-transform">
                  <PlayCircle size={40} className="text-primary fill-primary/10" />
                </div>
              </div>
              
              <div className="absolute bottom-6 left-6">
                <p className="text-xs uppercase tracking-[0.3em] font-bold text-white mb-1">Visual Stories</p>
                <p className="text-xl font-bold text-white">2024 Creative Reel</p>
              </div>
            </motion.div>
          </div>

          <div className="space-y-12">
            <div className="space-y-4">
              <h3 className="text-xs uppercase tracking-widest text-primary font-bold">Services</h3>
              <ul className="space-y-4">
                {['Color Grading', 'Motion Graphics', 'Sound Design', 'Narrative Editing'].map((item, i) => (
                  <li key={i} className="text-lg text-on-dark flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="p-8 rounded-3xl bg-surface-75 border border-border-subtle space-y-4">
              <p className="text-[15px] italic text-body-muted">
                "Adrian has a unique ability to capture emotion through his edits, making technical informatics concepts feel human and engaging."
              </p>
              <p className="text-xs font-bold text-on-dark uppercase tracking-widest">— Identitas Media Team</p>
            </div>
          </div>

        </div>
      </div>

      {/* Decorative background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
    </section>
  );
}
