import type { Metadata } from 'next';
import ProjectArchive from '@/components/ProjectArchive';

const title = 'Development Portfolio';
const description = 'Web applications, mobile experiences, and digital systems by Adrian Bahri. Explore development projects and the tools behind them.';
export const metadata: Metadata = {
  title, description,
  alternates: { canonical: '/dev' },
  openGraph: { title, description, url: '/dev' },
  twitter: { card: 'summary_large_image', title, description },
};

export default function DeveloperPortfolio() {
  return <ProjectArchive portfolioMode="developer" includeTools />;
}
