import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { portfolioPath, type ProjectMode } from '@/lib/portfolio';

export default function PortfolioCrossover({ mode }: { mode: ProjectMode }) {
  const isDev = mode === 'developer';
  return (
    <aside className="section-container py-16">
      <Link href={portfolioPath(isDev ? 'creative' : 'developer')} className="portfolio-crossover group">
        <div><p className="eyebrow">The other side of my work</p><h2>{isDev ? 'There’s a visual side, too.' : 'Curious about the code?'}</h2><p>{isDev ? 'Explore design, motion, and the stories behind the visuals.' : 'Explore the applications and digital systems I build.'}</p></div>
        <span className="inline-flex items-center gap-2 text-sm shrink-0">{isDev ? 'Explore Creative' : 'Explore Development'}<ArrowUpRight size={20} aria-hidden="true" /></span>
      </Link>
    </aside>
  );
}
