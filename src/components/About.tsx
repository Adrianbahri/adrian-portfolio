'use client';

import { motion } from 'framer-motion';

export default function About() {
  return (
    <section id="about" className="w-full py-24 bg-canvas border-t border-border-subtle">
      <div className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-16 items-start">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="relative aspect-square rounded-2xl overflow-hidden border border-border-strong grayscale hover:grayscale-0 transition-all duration-700 group">
              <img 
                src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80" 
                alt="Adrian Bahri"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            </div>
            <div className="h-px w-full bg-border-subtle" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-10"
          >
            <div className="space-y-6">
              <p className="eyebrow">The Story</p>
              <h2 className="text-4xl lg:text-5xl font-medium text-on-dark tracking-[-0.05em] font-heading leading-[1.1]">
                Bridging technical <br /> complexity with visual clarity.
              </h2>
              <p className="text-xl text-on-dark/90 leading-relaxed font-sans">
                I’m an Informatics Engineering student who enjoys combining technology, visual storytelling, and design to create engaging digital experiences.
              </p>
              <p className="text-lg text-body-muted leading-relaxed font-sans">
                Based in Indonesia, I bridge the gap between creative storytelling and technical implementation. 
                I strive for excellence in every pixel, from clean code to cinematic motion.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12 pt-10 border-t border-border-subtle">
              <div className="space-y-3">
                <p className="eyebrow text-primary">Experience</p>
                <p className="text-on-dark font-medium font-sans">3+ Years of Creative Work</p>
              </div>
              <div className="space-y-3">
                <p className="eyebrow text-primary">Achievements</p>
                <p className="text-on-dark font-medium font-sans">1st Place Programming UNITY#12</p>
              </div>
              <div className="space-y-3">
                <p className="eyebrow text-primary">Role</p>
                <p className="text-on-dark font-medium font-sans">Design Coordinator @ Identitas</p>
              </div>
              <div className="space-y-3">
                <p className="eyebrow text-primary">Focus</p>
                <p className="text-on-dark font-medium font-sans">Creative Technologist</p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
