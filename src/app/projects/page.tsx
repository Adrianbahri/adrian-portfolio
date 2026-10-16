import { redirect } from 'next/navigation';

export default async function ProjectsPage({ searchParams }: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const { mode } = await searchParams;
  redirect(mode === 'creative' ? '/creative' : '/dev');
}
