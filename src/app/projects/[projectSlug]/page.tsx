import { fetchPublicTable } from '@/lib/supabase';
import { Metadata } from 'next';
import ProjectDetailClient from '@/components/ProjectDetailClient';

interface Props {
  params: Promise<{ projectSlug: string }>;
}

async function getProjectBySlug(slug: string) {
  const rows = await fetchPublicTable<any>(
    'projects',
    `select=*&slug=eq.${encodeURIComponent(slug)}&limit=1`
  );
  return rows[0] || null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { projectSlug } = await params;
  const decodedSlug = decodeURIComponent(projectSlug);
  const project = await getProjectBySlug(decodedSlug);

  return {
    title: project?.seo_title || `${project?.title || decodedSlug} | Dri4n`,
    description: project?.seo_description || project?.description,
    alternates: {
      canonical: `/projects/${decodedSlug}`,
    },
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { projectSlug } = await params;
  const decodedSlug = decodeURIComponent(projectSlug);
  const project = await getProjectBySlug(decodedSlug);

  return <ProjectDetailClient slug={decodedSlug} initialProject={project} />;
}
