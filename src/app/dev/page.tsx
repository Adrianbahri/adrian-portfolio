import type { Metadata } from 'next';
import PortfolioHeader from '@/components/PortfolioHeader';
import ProjectArchive from '@/components/ProjectArchive';
import BentoTechStack from '@/components/BentoTechStack';
import PortfolioCrossover from '@/components/PortfolioCrossover';

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
    <main className="min-h-screen portfolio-dev">
      <PortfolioHeader mode="developer" />
      <ProjectArchive portfolioMode="developer" />
      <BentoTechStack mode="developer" />
      <PortfolioCrossover mode="developer" />
    </main>
  );
}
