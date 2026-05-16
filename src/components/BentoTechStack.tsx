'use client';

import { motion } from 'framer-motion';
import { techStack } from '@/data/techstack';

export default function BentoTechStack() {
  return (
    <section className="w-full pt-8 sm:pt-12 pb-24 bg-transparent">
      <div className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.1fr] items-center gap-16 lg:gap-20">
          
          {/* Left: Text Content */}
          <div className="space-y-6">
            <div className="space-y-4">
              <p className="text-[13px] font-bold text-primary/60 uppercase tracking-[0.2em]">The Stack</p>
              <h2 className="text-4xl lg:text-5xl font-bold text-on-dark tracking-tight leading-tight">
                Crafting with the <br />
                <span className="text-body-muted/40">best tools.</span>
              </h2>
            </div>
            <p className="text-lg text-body-muted/80 max-w-xl leading-relaxed">
              I leverage modern frameworks and professional creative software to build high-performance digital products and cinematic visual experiences.
            </p>
          </div>

          {/* Right: Icon Grid with Full Intersecting Lines */}
          <div className="relative p-4 sm:p-8">
            {/* Divider Lines (Fully Intersecting) */}
            {/* Vertical Line - Extended from very top to very bottom */}
            <div className="absolute top-[-20%] bottom-[-20%] left-[79.6%] w-[1px] bg-on-dark/10 hidden sm:block z-0" />
            
            {/* Horizontal Line - Extended from very left to very right */}
            <div className="absolute top-[66.6%] left-[-20%] right-[-20%] h-[1px] bg-on-dark/10 hidden sm:block z-0" />

            <div className="grid grid-cols-5 gap-y-16 gap-x-4 sm:gap-x-8 items-center justify-items-center relative z-10">
              {techStack.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="flex flex-col items-center gap-3 group relative"
                >
                  <div className="text-3xl lg:text-4xl transition-all duration-300">
                    <item.icon />
                  </div>
                  
                  {/* Tooltip Name */}
                  <span className="absolute -bottom-8 text-[10px] font-mono text-on-dark/0 group-hover:text-on-dark/40 transition-all uppercase tracking-tighter whitespace-nowrap pointer-events-none">
                    {item.name}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
