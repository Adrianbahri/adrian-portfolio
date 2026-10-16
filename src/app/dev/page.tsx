import type { Metadata } from 'next';
import FeaturedWork from '@/components/FeaturedWork';
import BentoTechStack from '@/components/BentoTechStack';

const title = 'Development Portfolio';
const description = 'Web applications, mobile experiences, and digital systems by Adrian Bahri. Explore development projects and the tools behind them.';
export const metadata: Metadata = {
  title, description,
  alternates: { canonical: '/dev' },
  openGraph: { title, description, url: '/dev' },
  twitter: { card: 'summary_large_image', title, description },
};

export default function DeveloperPortfolio() {
  return (
    <main className="min-h-screen pt-24">
      <h1 className="sr-only">Development Portfolio</h1>
      <FeaturedWork portfolioMode="developer" />
      <BentoTechStack mode="developer" />
    </main>
  );
}
