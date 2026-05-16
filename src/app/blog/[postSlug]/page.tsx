import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, Share2 } from 'lucide-react';
import { Metadata } from 'next';

interface Props {
  params: Promise<{ postSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { postSlug } = await params;
  const { data: article } = await supabase.from('articles').select('*').eq('slug', postSlug).single();
  
  return {
    title: article?.seo_title || `${article?.title || 'Blog'} | Adrian Bahri`,
    description: article?.seo_description || article?.description,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { postSlug } = await params;
  const { data: article } = await supabase.from('articles').select('*').eq('slug', postSlug).single();

  if (!article) {
    return notFound();
  }

  const content = article.content || '';

  return (
    <main className="min-h-screen bg-canvas pt-32 pb-24 relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-x-0 top-0 h-[50vh] bg-gradient-to-b from-primary/5 to-transparent" />
      </div>

      <div className="section-container relative z-10">
        <article className="max-w-3xl mx-auto">
          <header className="mb-16 space-y-8 text-center">
            <Link href="/blog" className="group inline-flex items-center gap-2 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-body-muted hover:text-on-dark transition-colors">
              <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
              Back to blog
            </Link>
            
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-6 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-primary">
                <span>{article.category}</span>
                <span className="w-1 h-1 rounded-full bg-border-strong" />
                <span className="text-body-muted">{article.date}</span>
              </div>
              <h1 className="text-4xl lg:text-6xl font-medium tracking-tight text-on-dark font-heading leading-tight">{article.title}</h1>
            </div>

            <div className="flex items-center justify-center gap-4 pt-4">
              <div className="w-10 h-10 rounded-full bg-surface-100 border border-border-subtle flex items-center justify-center text-primary/40 font-bold text-xs">
                {article.author?.charAt(0) || 'A'}
              </div>
              <div className="text-left">
                <p className="text-xs font-bold uppercase tracking-widest text-on-dark">{article.author || 'Adrian Bahri'}</p>
                <p className="text-[0.6rem] text-body-muted uppercase tracking-widest">Creative Technologist</p>
              </div>
            </div>
          </header>

          <div className="aspect-[21/9] mb-20 bg-surface-100 border border-border-subtle rounded-sm overflow-hidden shadow-2xl">
             <img src={article.img || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=2000&q=80'} alt={article.title} className="w-full h-full object-cover" />
          </div>

          <div className="mx-auto content-prose">
            {content ? (
              <div dangerouslySetInnerHTML={{ 
                __html: content
                  .replace(/##\s+(.*?)(?=\s+##|\n|$)/g, '<h2>$1</h2>')
                  .replace(/!\[Image\]\((.*?)\)/gim, '<img src="$1" alt="Blog Insight" />')
                  .split('\n')
                  .filter((p: string) => p.trim() !== '')
                  .map((p: string) => p.startsWith('<h') || p.startsWith('<img') ? p : `<p>${p}</p>`)
                  .join('')
              }} />
            ) : (
              <p className="text-body-muted italic text-center py-20 border border-dashed border-border-subtle">Article content is currently empty.</p>
            )}
          </div>

          <footer className="mt-24 pt-12 border-t border-border-subtle flex items-center justify-between">
            <div className="flex gap-4">
              <button className="p-3 bg-surface-50 border border-border-subtle rounded-full text-body-muted hover:text-primary hover:border-primary/40 transition-all"><Share2 size={18} /></button>
            </div>
            <Link href="/blog" className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-on-dark hover:text-primary transition-colors flex items-center gap-2">
              Next Article <ArrowLeft size={14} className="rotate-180" />
            </Link>
          </footer>
        </article>
      </div>
    </main>
  );
}
