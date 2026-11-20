import { fetchPublicTable } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Image from 'next/image';
import { ArrowUpRight, GitBranch } from 'lucide-react';
import ShahriyarDetailShell from '@/components/ShahriyarDetailShell';

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
    title: project?.seo_title || `${project?.title || 'Project'} | Dri4n`,
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

  if (!project) {
    return notFound();
  }

  const content = project.content || {};
  const markdown: string =
    typeof content === 'string' ? content : content.markdown || '';
  const stackList: string[] = Array.isArray(project.stack)
    ? project.stack
    : typeof project.stack === 'string'
    ? project.stack
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean)
    : [];
  const highlightsList: string[] = Array.isArray(project.highlights)
    ? project.highlights
    : typeof project.highlights === 'string'
    ? project.highlights
        .split('\n')
        .map((s: string) => s.trim())
        .filter(Boolean)
    : [];

  const formattedHtml = markdown
    ? markdown
        .replace(/##\s+(.*?)(?=\s+##|\n|$)/g, '<h2>$1</h2>')
        .replace(/!\[.*?\]\((.*?)\)/gim, '<img src="$1" alt="Project screenshot" />')
        .split('\n')
        .filter((p: string) => p.trim() !== '')
        .map((p: string) =>
          p.trim().startsWith('<h') ||
          p.trim().startsWith('<p') ||
          p.trim().startsWith('<ul') ||
          p.trim().startsWith('<img')
            ? p
            : `<p>${p}</p>`
        )
        .join('')
    : '';

  const hasGithub = project.github_url && project.github_url !== '#';
  const hasDemo = project.demo_url && project.demo_url !== '#';

  return (
    <ShahriyarDetailShell
      backHref="/#work"
      sectionName="SELECTED WORK"
      breadcrumbTitle={project.title}
      metaFields={[
        { label: 'CATEGORY', value: project.category || 'Engineering' },
        {
          label: 'YEAR',
          value: project.timeline || project.year_range || project.published || '2026',
        },
        ...(project.role ? [{ label: 'ROLE', value: project.role }] : []),
        { label: 'STATUS', value: project.status || 'Completed' },
        ...(stackList.length > 0
          ? [
              {
                label: 'STACK',
                value: (
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {stackList.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-[5px] px-2 py-0.5 font-mono text-[10px]"
                        style={{
                          backgroundColor: 'var(--art-tile)',
                          border: '1px solid var(--art-line)',
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                ),
              },
            ]
          : []),
        ...(hasGithub || hasDemo
          ? [
              {
                label: 'LINKS',
                value: (
                  <div className="flex flex-col gap-1.5 pt-0.5">
                    {hasDemo && (
                      <a
                        href={project.demo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-cursor-label="visit"
                        className="inline-flex items-center gap-1 font-mono text-[12px] underline underline-offset-4"
                        style={{ color: 'var(--art-marker-text)' }}
                      >
                        <span>Live Demo</span>
                        <ArrowUpRight size={12} />
                      </a>
                    )}
                    {hasGithub && (
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-cursor-label="visit"
                        className="inline-flex items-center gap-1 font-mono text-[12px] underline underline-offset-4"
                      >
                        <GitBranch size={12} />
                        <span>Source Code</span>
                      </a>
                    )}
                  </div>
                ),
              },
            ]
          : []),
      ]}
    >
      {/* Hero Cover Image */}
      {project.image_url && (
        <div
          className="relative mb-9 aspect-[16/10] w-full overflow-hidden rounded-[14px]"
          style={{
            backgroundColor: 'var(--art-tile)',
            border: '1px solid var(--art-line)',
          }}
        >
          <Image
            src={project.image_url}
            alt={project.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 680px"
            className="object-cover"
          />
        </div>
      )}

      {/* Title & Summary */}
      <header className="mb-8 space-y-3">
        <h1 className="text-[26px] sm:text-[32px] font-semibold tracking-[-0.02em] leading-[1.2]">
          {project.title}
        </h1>
        {project.description && (
          <p
            className="text-[16px] leading-[1.65]"
            style={{ color: 'var(--art-ink-soft)' }}
          >
            {project.description}
          </p>
        )}
      </header>

      {/* Highlights */}
      {highlightsList.length > 0 && (
        <div
          className="mb-8 rounded-[12px] p-5 space-y-3"
          style={{
            backgroundColor: 'var(--art-tile)',
            border: '1px solid var(--art-line)',
          }}
        >
          <p
            className="font-mono text-[10px] uppercase tracking-[0.14em]"
            style={{ color: 'var(--art-marker-text)' }}
          >
            KEY HIGHLIGHTS
          </p>
          <ul className="space-y-2">
            {highlightsList.map((hl, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 text-[14px] leading-[21px]"
                style={{ color: 'var(--art-ink-soft)' }}
              >
                <span
                  className="mt-2 inline-block h-[5px] w-[5px] shrink-0"
                  style={{ backgroundColor: 'var(--art-marker)' }}
                />
                <span>{hl}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Case Study Body */}
      {formattedHtml && (
        <div
          className="dev-prose space-y-5 text-[15.5px] leading-[1.75] [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-[20px] [&_h2]:font-semibold [&_h2]:tracking-[-0.01em] [&_img]:my-6 [&_img]:w-full [&_img]:rounded-[12px] [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2"
          style={{ color: 'var(--art-ink-soft)' }}
          dangerouslySetInnerHTML={{ __html: formattedHtml }}
        />
      )}
    </ShahriyarDetailShell>
  );
}
