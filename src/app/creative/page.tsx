import type { Metadata } from 'next';
import PortfolioHeader from '@/components/PortfolioHeader';
import ProjectArchive from '@/components/ProjectArchive';
import BentoTechStack from '@/components/BentoTechStack';
import PortfolioCrossover from '@/components/PortfolioCrossover';

const title = 'Creative Portfolio';
const description = 'Visual storytelling by Adrian Bahri: digital design, editorial work, motion, video, and photography. Discover the creative side of DRI4N.';
export const metadata: Metadata = {
  title, description,
  alternates: { canonical: '/creative' },
  openGraph: { title, description, url: '/creative' },
  twitter: { card: 'summary_large_image', title, description },
};

export default function CreativePortfolio() {
  return (
    <main className="min-h-screen portfolio-creative">
      <PortfolioHeader mode="creative" />
      <ProjectArchive portfolioMode="creative" />
      <BentoTechStack mode="creative" />
      <PortfolioCrossover mode="creative" />
    </main>
  );
}
