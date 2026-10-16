import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, ArrowRight, Code2, Asterisk } from 'lucide-react';
import { redirect } from 'next/navigation';
import { getSiteSettings } from '@/lib/site-settings';

export const metadata: Metadata = {
  title: { absolute: 'Adrian Bahri — Development & Creative | DRI4N' },
  description: 'Two sides of Adrian Bahri: software development and visual storytelling. Explore web applications, digital design, motion, and photography.',
  alternates: { canonical: '/' },
};

export default async function Home({ searchParams }: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const { mode } = await searchParams;
  // Keep previously shared home links useful.
  if (mode === 'creative') redirect('/creative');
  if (mode === 'developer') redirect('/dev');
  const settings = await getSiteSettings();

  return (
    <main className="portfolio-home">
      <div className="portfolio-home-inner">
        <header className="portfolio-welcome">
          <p className="eyebrow">Adrian Bahri · Makassar, Indonesia</p>
          <h1>One mind.<br /><span>Two ways to create.</span></h1>
          <div className="portfolio-welcome-bottom">
            <p>I build digital experiences.<br />Sometimes with code. Sometimes through visuals.</p>
            <span className="portfolio-status"><span aria-hidden="true" />{settings.site_status || 'Open for Collaboration'}</span>
          </div>
        </header>

        <div className="portfolio-doors">
          <Link href="/dev" className="portfolio-door portfolio-door-dev">
            <div className="door-topline"><span>01 / DEVELOPMENT</span><ArrowUpRight size={22} aria-hidden="true" /></div>
            <div className="door-art dev-art" aria-hidden="true">
              <div className="dev-window">
                <div className="dev-window-bar"><span /><span /><span /><p>dri4n / build.ts</p></div>
                <div className="dev-code"><span className="dev-comment">// From idea to interaction.</span><br /><span className="dev-keyword">const</span> experience = {'{'}<br />&nbsp;&nbsp;purpose: <span className="dev-string">'solve a problem'</span>,<br />&nbsp;&nbsp;approach: <span className="dev-string">'keep it simple'</span>,<br />&nbsp;&nbsp;builtWith: [<span className="dev-string">'care'</span>, <span className="dev-string">'code'</span>]<br />{'}'};<br /><br /><span className="dev-keyword">export default</span> experience;</div>
                <div className="dev-window-footer"><Code2 size={13} /> Ideas into working systems <span>↗</span></div>
              </div>
            </div>
            <div className="door-copy"><p className="door-disciplines">WEB · MOBILE · DIGITAL SYSTEMS</p><h2>Development<span aria-hidden="true">.</span></h2><p>Thoughtful interfaces. Useful applications.<br />A closer look at what I build and how it works.</p><span className="door-cta">Explore Development <ArrowRight size={16} aria-hidden="true" /></span></div>
          </Link>

          <Link href="/creative" className="portfolio-door portfolio-door-creative">
            <div className="door-topline"><span>02 / CREATIVE</span><ArrowUpRight size={22} aria-hidden="true" /></div>
            <div className="door-art creative-art" aria-hidden="true">
              <div className="creative-poster"><span className="poster-label">A DIFFERENT PERSPECTIVE</span><strong>Make<br />it <em>mean</em><br />something.</strong><Asterisk className="poster-asterisk" strokeWidth={1} /><span className="poster-bottom">VISUAL NOTES / DRI4N</span></div>
              <span className="poster-caption">Design is a way of seeing.</span>
            </div>
            <div className="door-copy"><p className="door-disciplines">DESIGN · MOTION · VISUAL STORIES</p><h2>Creative<span aria-hidden="true">.</span></h2><p>Images that speak. Stories that move.<br />An exploration of design, media, and perspective.</p><span className="door-cta">Explore Creative <ArrowRight size={16} aria-hidden="true" /></span></div>
          </Link>
        </div>

        <footer className="portfolio-home-footer"><p>Different disciplines. The same curiosity.</p><Link href="/contact">Have something in mind? Let’s talk <ArrowUpRight size={15} aria-hidden="true" /></Link></footer>
      </div>
    </main>
  );
}
