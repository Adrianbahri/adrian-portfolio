import Link from 'next/link';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import type { ProjectMode } from '@/lib/portfolio';

export default function PortfolioHeader({ mode }: { mode: ProjectMode }) {
  const isCreative = mode === 'creative';
  return (
    <header className={`portfolio-intro ${isCreative ? 'portfolio-intro-creative' : ''}`}>
      <div className="section-container">
        <p className="eyebrow">Adrian Bahri / {isCreative ? 'Creative portfolio' : 'Development portfolio'}</p>
        <h1>{isCreative ? <>A different<br /><em>perspective.</em></> : <>Ideas into<br /><span>working things.</span></>}</h1>
        <div className="portfolio-intro-bottom">
          <p>{isCreative ? 'Design, motion, and visual storytelling. A collection of the things I make and the tools behind them.' : 'Web, mobile, and digital systems. Explore my development projects and the tools I build with.'}</p>
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <a href="#work" className="inline-flex items-center gap-2">Explore projects <ArrowDown size={15} aria-hidden="true" /></a>
            <a href="#tools" className="inline-flex items-center gap-2 text-body-muted">{isCreative ? 'Creative tools' : 'Dev tools'} <ArrowDown size={15} aria-hidden="true" /></a>
          </div>
        </div>
        <div className="portfolio-intro-caption"><span>{isCreative ? 'DESIGN / MOTION / EDITORIAL / PHOTOGRAPHY' : 'INTERFACES / APPLICATIONS / SYSTEMS'}</span><Link href="/contact">Let’s collaborate <ArrowUpRight size={14} aria-hidden="true" /></Link></div>
      </div>
    </header>
  );
}
