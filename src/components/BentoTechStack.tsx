'use client';

import { motion } from 'framer-motion';
import { techStack } from '@/data/techstack';

export default function BentoTechStack() {
  return (
    <section className="w-full py-10 sm:py-12 bg-transparent">
      <div className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.1fr] items-center gap-12 lg:gap-24">
          
          {/* Left: Text Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="eyebrow">The Stack</p>
              <h2 className="text-3xl md:text-[2.2rem] font-medium text-on-dark tracking-[-0.05em] font-heading leading-tight">
                Crafting with the <br className="hidden sm:block" />
                <span className="text-body-muted/40 italic">best tools.</span>
              </h2>
            </div>
            <p className="text-lg text-body-muted font-light leading-relaxed font-sans max-w-xl">
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

            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-y-12 sm:gap-y-16 gap-x-4 sm:gap-x-8 items-center justify-items-center relative z-10">
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
                  <span className="absolute -bottom-8 text-[10px] font-mono text-on-dark/40 lg:text-on-dark/0 lg:group-hover:text-on-dark/40 transition-all uppercase tracking-tighter whitespace-nowrap pointer-events-none">
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
