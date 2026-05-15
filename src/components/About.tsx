'use client';

import { motion } from 'framer-motion';

export default function About() {
  return (
    <section id="about" className="w-full py-32 bg-canvas">
      <div className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative aspect-[3/4] md:aspect-square rounded-3xl overflow-hidden border border-border-strong grayscale hover:grayscale-0 transition-all duration-700 group"
          >
            <img 
              src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80" 
              alt="Adrian Bahri"
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h2 className="text-[34px] font-bold text-on-dark tracking-tight">About Me</h2>
              <p className="text-[20px] md:text-[24px] font-medium leading-tight text-on-dark">
                I’m an Informatics Engineering student who enjoys combining technology, visual storytelling, and design to create engaging digital experiences.
              </p>
              <p className="text-lg text-body-muted leading-relaxed">
                Based in Indonesia, I bridge the gap between creative storytelling and technical implementation. 
                Whether it's writing clean code, editing cinematic videos, or designing intuitive interfaces, I strive for excellence in every pixel.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-border-subtle">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-widest text-primary font-bold">Experience</p>
                <p className="text-on-dark font-medium">3+ Years of Creative Work</p>
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-widest text-primary font-bold">Achievements</p>
                <p className="text-on-dark font-medium">1st Place Programming UNITY#12</p>
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-widest text-primary font-bold">Role</p>
                <p className="text-on-dark font-medium">Design Coordinator @ Identitas</p>
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-widest text-primary font-bold">Focus</p>
                <p className="text-on-dark font-medium">Creative Technologist</p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
