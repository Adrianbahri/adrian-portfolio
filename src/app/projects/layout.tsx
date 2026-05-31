import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Engineering robust solutions through code and exploring visual narratives through creative design.',
  alternates: {
    canonical: '/projects',
  },
};

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
