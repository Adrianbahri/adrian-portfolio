import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, ChevronRight, Loader2, LayoutGrid } from 'lucide-react';
import { Metadata } from 'next';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface Props {
  params: Promise<{ projectSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { projectSlug } = await params;
  const decodedSlug = decodeURIComponent(projectSlug);
  const { data: project } = await supabase.from('projects').select('*').eq('slug', decodedSlug).single();
  
  return {
    title: project?.seo_title || `${project?.title || 'Project'} | Drian`,
    description: project?.seo_description || project?.description,
    alternates: {
      canonical: `/projects/${decodedSlug}`,
    },
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { projectSlug } = await params;
  const decodedSlug = decodeURIComponent(projectSlug);
  const { data: project } = await supabase.from('projects').select('*').eq('slug', decodedSlug).single();

  if (!project) {
    return notFound();
  }

  const content = project.content || {};
  const markdown = content.markdown || '';
  const gallery = content.gallery || [];

  return (
    <main className="min-h-screen bg-canvas pt-32 pb-24 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.03]" 
             style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute inset-x-0 top-0 h-px bg-border-subtle/50" />
      </div>

      <div className="section-container relative z-10">
        {/* Header Section */}
        <header className="max-w-4xl space-y-6 mb-16 border-t border-border-subtle pt-8">
          <Link href="/projects" className="group inline-flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-body-muted hover:text-on-dark transition-colors mb-4">
            <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
            Back to projects
          </Link>
          <div className="flex items-center gap-3">
             <span className="inline-flex items-center justify-center px-2 py-1 bg-white/5 text-[#ededed] border border-white/15 rounded text-[0.55rem] font-bold uppercase tracking-wider leading-none">{project.status || 'Active build'}</span>
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-6xl font-medium tracking-tight text-on-dark font-heading leading-tight">{project.title}</h1>
            <p className="text-lg lg:text-xl text-body-muted max-w-3xl font-sans leading-relaxed">{project.description}</p>
          </div>
        </header>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12 lg:gap-20">
          {/* Main Content Area */}
          <div className="space-y-20 min-w-0">
            {/* Gallery Section (for Creative Mode) */}
            {project.mode === 'creative' && gallery.length > 0 && (
              <section className="space-y-12">
                <div className="flex items-center gap-4">
                  <LayoutGrid className="text-primary/40" size={20} />
                  <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-white/40">Media Production Showcase</h3>
                  <div className="flex-1 h-px bg-border-subtle/30" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {gallery.map((item: any, i: number) => {
                    const media = typeof item === 'string' ? { url: item, type: 'image', caption: '' } : item;
                    const isVideo = media.type === 'video';
                    const isPdf = media.type === 'pdf' || media.url?.toLowerCase().includes('.pdf');
                    
                    return (
                      <div key={i} className={cn(
                        "group space-y-4",
                        (i % 3 === 0 || isPdf) ? "md:col-span-2" : "col-span-1"
                      )}>
                        <div className={cn(
                          "relative bg-surface-100 border border-border-strong overflow-hidden rounded-sm group-hover:border-primary/40 transition-all duration-700 shadow-xl",
                          isPdf ? "aspect-[16/10] md:aspect-[16/9]" : "aspect-video"
                        )}>
                          {isVideo ? (
                            <iframe 
                              src={media.url.replace('watch?v=', 'embed/')} 
                              className="w-full h-full border-none"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          ) : isPdf ? (
                            <div className="w-full h-full flex flex-col bg-[#171717]">
                              {/* Premium Frame Header */}
                              <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-[#121212]/80 z-10">
                                <div className="flex items-center gap-2">
                                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/85 animate-pulse" />
                                  <span className="text-[9px] font-mono font-bold tracking-widest text-[#707070] uppercase">
                                    Interactive Layout PDF Reader
                                  </span>
                                </div>
                                <a 
                                  href={media.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-[9px] font-bold uppercase tracking-widest text-[#3ecf8e] hover:text-[#24b47e] transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                  Open External <ExternalLink size={10} />
                                </a>
                              </div>
                              <iframe 
                                src={media.url} 
                                className="w-full flex-1 border-none bg-[#1e1e1e]"
                              />
                            </div>
                          ) : (
                            <Image src={media.url} alt={`${project.title} asset ${i}`} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" />
                          )}
                          <div className="absolute top-4 right-4 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded text-[0.5rem] font-bold uppercase tracking-widest text-white/60 border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                            {isVideo ? 'Video Production' : isPdf ? 'Magazine PDF Reader' : 'Design Asset'}
                          </div>
                        </div>
                        {media.caption && (
                          <p className="text-[0.65rem] text-body-muted font-medium uppercase tracking-[0.15em] leading-relaxed border-l-2 border-primary/20 pl-4">
                            {media.caption}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Markdown Content Section & Hero Image */}
            <div className="space-y-8">
              {/* Hero Image / Fallback Hero if no media at all */}
              {!markdown.includes('![Image]') && gallery.length === 0 && (
                <div className="relative aspect-[16/10] bg-surface-100 border border-border-strong overflow-hidden rounded-sm group shadow-2xl">
                  <Image src={project.image_url || '/placeholder.png'} alt={project.title} fill sizes="(max-width: 768px) 100vw, 800px" className="object-cover transition-transform duration-1000 group-hover:scale-105" />
                </div>
              )}

              {markdown ? (
                <div className="content-prose">
                  <div dangerouslySetInnerHTML={{ 
                    __html: markdown
                      .replace(/##\s+(.*?)(?=\s+##|\n|$)/g, '<h2>$1</h2>')
                      .replace(/!\[Image\]\((.*?)\)/gim, '<img src="$1" alt="Project Insight" />')
                      .split('\n')
                      .filter((p: string) => p.trim() !== '')
                      .map((p: string) => p.startsWith('<h') || p.startsWith('<img') ? p : `<p>${p}</p>`)
                      .join('')
                  }} />
                </div>
              ) : project.mode !== 'creative' && (
                <div className="py-20 text-center border border-dashed border-border-subtle rounded-sm">
                  <p className="text-body-muted font-sans italic opacity-50">Detailed case study content is being prepared.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sticky Info Sidebar */}
          <aside className="space-y-8 h-fit lg:sticky lg:top-32">
            <div className="space-y-8">
              <div className="space-y-2">
                <p className="eyebrow">Role</p>
                <p className="text-sm text-on-dark leading-relaxed font-medium">{content.role || 'Creative Technologist'}</p>
              </div>
              <div className="space-y-2">
                <p className="eyebrow">Timeline</p>
                <p className="text-sm text-on-dark leading-relaxed">{content.timeline || project.year_range}</p>
              </div>
              <div className="space-y-3">
                <p className="eyebrow">Stack</p>
                <div className="flex flex-wrap gap-2">
                  {project.tags?.map((tag: string) => (
                    <span key={tag} className="px-2 py-1 bg-surface-50 border border-border-subtle text-[0.6rem] font-mono uppercase tracking-widest text-body-muted">{tag}</span>
                  ))}
                </div>
              </div>
              {content.highlights?.length > 0 && (
                <div className="space-y-3">
                  <p className="eyebrow">Highlights</p>
                  <ul className="space-y-3">
                    {content.highlights.map((highlight: string, index: number) => (
                      <li key={index} className="text-sm text-body-muted leading-relaxed flex gap-3">
                        <span className="text-primary opacity-40 shrink-0">•</span>
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="space-y-3 pt-4">
                <p className="eyebrow">Links</p>
                <div className="flex flex-col gap-3">
                  {project.github_url && (
                    <a href={project.github_url} target="_blank" className="inline-flex items-center gap-2 text-sm text-on-dark hover:text-primary transition-colors group w-fit">
                      <span className="underline decoration-border-subtle underline-offset-4 group-hover:decoration-primary">GitHub</span>
                      <ExternalLink size={14} className="opacity-40 group-hover:opacity-100 transition-all" />
                    </a>
                  )}
                  {project.demo_url && (
                    <a href={project.demo_url} target="_blank" className="inline-flex items-center gap-2 text-sm text-on-dark hover:text-primary transition-colors group w-fit">
                      <span className="underline decoration-border-subtle underline-offset-4 group-hover:decoration-primary">
                        {project.demo_url.toLowerCase().includes('.pdf') ? 'Read Magazine (PDF)' : 'Live Demo'}
                      </span>
                      <ExternalLink size={14} className="opacity-40 group-hover:opacity-100 transition-all" />
                    </a>
                  )}
                </div>
              </div>
            </div>
            <div className="pt-8 border-t border-border-subtle">
              <Link href="/#contact" className="group flex items-center justify-between text-[0.65rem] font-bold uppercase tracking-[0.2em] text-on-dark hover:text-primary transition-all">
                Let's collaborate
                <ArrowLeft size={14} className="rotate-180 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
