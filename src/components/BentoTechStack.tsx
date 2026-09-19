'use client';

import { motion } from 'framer-motion';
import { techStack } from '@/data/techstack';

export default function BentoTechStack() {
  return (
    <section className="w-full py-16 sm:py-20 bg-transparent">
      <div className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] items-center gap-10 lg:gap-16">
          
          {/* Left: Text Content */}
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="eyebrow">My Stack</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal text-on-dark tracking-tight font-heading leading-tight">
                Crafting with the <br className="hidden sm:inline" />
                <span className="text-primary font-normal">finest tools.</span>
              </h2>
            </div>
            <p className="text-base sm:text-lg text-body-muted font-normal leading-relaxed font-sans max-w-xl">
              I leverage modern frameworks, cloud architectures, and professional creative suites to build high-performance digital products and memorable experiences.
            </p>
          </div>

          {/* Right: Grid of Tech Badges with Intersecting Grid Lines */}
          <div className="relative p-4 sm:p-8">
            {/* Architectural Intersecting Lines */}
            <div className="absolute top-[-15%] bottom-[-15%] left-[74.5%] w-[1px] bg-border-strong/30 hidden sm:block z-0 pointer-events-none" />
            <div className="absolute top-[50%] left-[-10%] right-[-10%] h-[1px] bg-border-strong/30 hidden sm:block z-0 pointer-events-none" />

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-y-8 sm:gap-y-10 gap-x-4 sm:gap-x-6 items-center justify-items-center relative z-10">
              {techStack.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -3, scale: 1.06 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.025 }}
                  className="flex flex-col items-center gap-2.5 group cursor-default"
                >
                  <div className="text-3xl sm:text-4xl text-on-dark/60 group-hover:text-primary transition-all duration-300 flex items-center justify-center">
                    <item.icon />
                  </div>
                  
                  <span className="text-[11px] font-mono text-body-muted group-hover:text-on-dark transition-colors tracking-tight">
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
