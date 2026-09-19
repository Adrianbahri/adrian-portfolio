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
        <div className="max-w-2xl mb-12 space-y-3">
          <p className="eyebrow">About</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal text-on-dark tracking-tight font-heading leading-tight">
            Developer. Creator. <br className="hidden sm:inline" />
            <span className="text-primary font-normal">Lifelong learner.</span>
          </h2>
        </div>

        <div>
          <div className="grid gap-10 lg:gap-14 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.85fr)]">
            <div className="space-y-8">
              <div className="text-base sm:text-lg leading-relaxed text-body-muted font-sans font-normal whitespace-pre-wrap">
                {mainBio}
              </div>

              <div className="space-y-4 border-t border-border-subtle pt-6">
                <p className="eyebrow">Working principles</p>
                <ul className="space-y-3">
                  {principles.map((principle: string, i: number) => (
                    <li 
                      key={i} 
                      className="text-sm font-sans text-body-muted leading-relaxed flex items-start gap-3"
                    >
                      <span className="text-primary font-mono text-xs font-semibold mt-0.5">0{i + 1}.</span>
                      <span>{principle}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-4 lg:border-l lg:border-border-subtle lg:pl-10">
              <p className="eyebrow">Creative Focus</p>

              <div className="space-y-5">
                {focus.map((item: any, i: number) => (
                  <article 
                    key={i} 
                    className={cn("space-y-1.5 group", i > 0 && "border-t border-border-subtle pt-5")}
                  >
                    <h3 className="font-heading text-lg sm:text-xl font-normal tracking-tight text-on-dark group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-body-muted font-sans font-normal">
                      {item.desc}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
