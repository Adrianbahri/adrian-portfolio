'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

import { aboutData } from '@/data/about';

export default function About() {
  return (
    <section id="about" className="section-anchor py-12 sm:py-14 bg-transparent">
      <div className="section-container">
        <div className="max-w-2xl space-y-4">
          <div className="space-y-3">
            <h2 className="font-heading text-3xl font-medium tracking-[-0.05em] text-on-dark sm:text-[2.2rem]">About</h2>
            <p className="max-w-2xl text-[0.98rem] leading-8 text-body-muted sm:text-[1.02rem]">
              The intersection of code, media, and human-centric design.
            </p>
          </div>
        </div>

        <div className="mt-10">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)]">
            <div className="space-y-5 text-[1rem] leading-8 text-on-dark/84 font-sans">
              <div className="inline-flex items-center gap-2 border border-emerald-500/35 bg-emerald-500/8 px-3 py-1.5 font-mono text-xs text-emerald-500">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Open for Collaboration
              </div>
              <p>
                I am an Informatics Engineering student at Hasanuddin University with a deep passion for 
                creative technology. I believe that engineering is as much about aesthetics and 
                storytelling as it is about performance and logic.
              </p>
              <p>
                My work currently focuses on building high-performance web applications, 
                media production workflows, and digital design systems that feel alive.
              </p>
              
              <div className="space-y-4 border-t border-border/60 pt-6">
                <p className="eyebrow">Working principles</p>
                <ul className="space-y-3 text-body-muted">
                  {aboutData.principles.map((principle, i) => (
                    <li key={i}>— {principle}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-4 border-t border-border/60 pt-6 lg:border-t-0 lg:border-l lg:pl-8">
              <p className="eyebrow">Creative Focus</p>
              
              {aboutData.focus.map((item, i) => (
                <article key={i} className={cn("space-y-2", i > 0 && "border-t border-border/60 pt-4")}>
                  <h3 className="font-heading text-lg font-medium tracking-[-0.04em] text-on-dark">{item.title}</h3>
                  <p className="text-sm leading-7 text-body-muted">
                    {item.desc}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
