'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { aboutData as staticAboutData } from '@/data/about';

export default function About() {
  const { settings, loading } = useSiteSettings();

  // Parse dynamic data or fallback to static data
  const principles = settings.about_principles 
    ? JSON.parse(settings.about_principles) 
    : staticAboutData.principles;

  const focus = settings.about_focus 
    ? JSON.parse(settings.about_focus) 
    : staticAboutData.focus;

  const mainBio = settings.about_text || (
    <>
      I’m an Informatics Engineering student at Hasanuddin University passionate about creative technology, digital experiences, and building intelligent systems through code.
      <br /><br />
      I enjoy creating modern web applications, visual experiences, and automation that make technology feel more meaningful, efficient, and alive.
    </>
  );

  const statusText = settings.site_status || 'Open for Collaboration';
  const isBusy = statusText.toLowerCase().includes('busy') || statusText.toLowerCase().includes('full') || statusText.toLowerCase().includes('closed');

  return (
    <section id="about" className="section-anchor py-20 bg-transparent">
      <div className="section-container">
        <div className="max-w-2xl space-y-4">
          <div className="space-y-3">
            <h2 className="font-heading text-3xl font-medium tracking-[-0.05em] text-on-dark sm:text-[2.2rem]">About</h2>
            <p className="max-w-2xl text-lg text-body-muted font-light leading-relaxed">
              Where technology and creativity become experiences.
            </p>
          </div>
        </div>

        <div className="mt-16">
          <div className="grid gap-12 lg:gap-16 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)]">
            <div className="space-y-6 text-lg leading-relaxed text-on-dark/80 font-sans font-light">
              <div className={cn(
                "inline-flex items-center gap-2 border px-4 py-1.5 font-mono text-[10px] uppercase tracking-widest rounded-[3px]",
                isBusy 
                  ? "border-red-500/35 bg-red-500/8 text-red-500" 
                  : "border-primary/35 bg-primary/8 text-primary"
              )}>
                <span className={cn(
                  "size-2 rounded-full",
                  isBusy ? "bg-red-500" : "bg-primary animate-pulse"
                )}></span>
                {statusText}
              </div>
              <div className="whitespace-pre-wrap">
                {mainBio}
              </div>

              <div className="space-y-4 border-t border-border-subtle pt-6">
                <p className="eyebrow">Working principles</p>
                <ul className="space-y-3 text-body-muted">
                  {principles.map((principle: string, i: number) => (
                    <li key={i}>— {principle}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-4 border-t border-border-subtle pt-6 lg:border-t-0 lg:border-l lg:pl-8">
              <p className="eyebrow">Creative Focus</p>

              {focus.map((item: any, i: number) => (
                <article key={i} className={cn("space-y-2", i > 0 && "border-t border-border-subtle pt-4")}>
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
