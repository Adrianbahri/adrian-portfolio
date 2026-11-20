'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import ShahriyarDetailShell from '@/components/ShahriyarDetailShell';
import StatusView from '@/components/StatusView';

function estimateReadTime(text: string): string {
  const words = text
    .replace(/<[^>]+>/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  const mins = Math.max(1, Math.round(words / 200));
  return `${mins} min read`;
}

export default function BlogDetailClient({
  slug,
  initialArticle,
}: {
  slug: string;
  initialArticle: any | null;
}) {
  const [article, setArticle] = useState<any | null>(initialArticle);
  const [loading, setLoading] = useState(!initialArticle);

  useEffect(() => {
    if (initialArticle) return;
    let active = true;

    (async () => {
      try {
        const { data } = await supabase
          .from('articles')
          .select('*')
          .eq('slug', slug)
          .single();
        if (active) {
          setArticle(data || null);
          setLoading(false);
        }
      } catch {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [slug, initialArticle]);

  if (loading) {
    return (
      <ShahriyarDetailShell
        backHref="/#writing"
        sectionName="WRITING"
        breadcrumbTitle={slug}
        metaFields={[]}
      >
        <div className="space-y-6 animate-pulse">
          <div
            className="aspect-[16/10] w-full rounded-[14px]"
            style={{ backgroundColor: 'var(--art-tile)' }}
          />
          <div
            className="h-8 w-3/4 rounded-[8px]"
            style={{ backgroundColor: 'var(--art-tile)' }}
          />
          <div
            className="h-4 w-full rounded-[6px]"
            style={{ backgroundColor: 'var(--art-tile)' }}
          />
        </div>
      </ShahriyarDetailShell>
    );
  }

  if (!article) {
    return <StatusView code="404" />;
  }

  const content = article.content || '';
  const readTime = estimateReadTime(content);

  const formattedHtml = content
    ? content
        .replace(/##\s+(.*?)(?=\s+##|\n|$)/g, '<h2>$1</h2>')
        .replace(
          /!\[Image\]\((.*?)\)/gim,
          '<img src="$1" alt="Article illustration" />'
        )
        .split('\n')
        .filter((p: string) => p.trim() !== '')
        .map((p: string) =>
          p.trim().startsWith('<h') ||
          p.trim().startsWith('<p') ||
          p.trim().startsWith('<ul') ||
          p.trim().startsWith('<ol') ||
          p.trim().startsWith('<li') ||
          p.trim().startsWith('<img') ||
          p.trim().startsWith('<blockquote')
            ? p
            : `<p>${p}</p>`
        )
        .join('')
    : '';

  return (
    <ShahriyarDetailShell
      backHref="/#writing"
      sectionName="WRITING"
      breadcrumbTitle={article.title}
      metaFields={[
        { label: 'TYPE', value: 'Essay' },
        { label: 'PUBLISHED', value: article.date || '2026' },
        { label: 'LENGTH', value: readTime },
        { label: 'TOPIC', value: article.category || 'Technology' },
        ...(article.author
          ? [{ label: 'AUTHOR', value: article.author }]
          : []),
      ]}
    >
      {article.img && (
        <div
          className="relative mb-9 aspect-[16/10] w-full overflow-hidden rounded-[14px]"
          style={{
            backgroundColor: 'var(--art-tile)',
            border: '1px solid var(--art-line)',
          }}
        >
          <Image
            src={article.img}
            alt={article.title}
            fill
            priority
            unoptimized
            sizes="(max-width: 1024px) 100vw, 680px"
            className="object-cover"
          />
        </div>
      )}

      <header className="mb-8 space-y-3">
        <h1 className="text-[26px] sm:text-[32px] font-semibold tracking-[-0.02em] leading-[1.2]">
          {article.title}
        </h1>
        {article.description && (
          <p
            className="text-[16px] leading-[1.65]"
            style={{ color: 'var(--art-ink-soft)' }}
          >
            {article.description}
          </p>
        )}
      </header>

      {formattedHtml ? (
        <div
          className="dev-prose space-y-5 text-[15.5px] leading-[1.75] [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-[20px] [&_h2]:font-semibold [&_h2]:tracking-[-0.01em] [&_h3]:mt-7 [&_h3]:mb-2 [&_h3]:text-[17px] [&_h3]:font-semibold [&_img]:my-6 [&_img]:w-full [&_img]:rounded-[12px] [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-2 [&_blockquote]:border-l-2 [&_blockquote]:pl-4 [&_blockquote]:italic"
          style={{ color: 'var(--art-ink-soft)' }}
          dangerouslySetInnerHTML={{ __html: formattedHtml }}
        />
      ) : (
        <p
          className="rounded-[10px] border border-dashed py-14 text-center text-[14px]"
          style={{
            borderColor: 'var(--art-line)',
            color: 'var(--art-ink-muted)',
          }}
        >
          Article content is currently empty.
        </p>
      )}

      {Array.isArray(article.tags) && article.tags.length > 0 && (
        <div
          className="mt-12 flex flex-wrap gap-2 border-t pt-6"
          style={{ borderColor: 'var(--art-line)' }}
        >
          {article.tags.map((tag: string, idx: number) => (
            <span
              key={idx}
              className="rounded-[6px] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em]"
              style={{
                backgroundColor: 'var(--art-tile)',
                color: 'var(--art-ink-muted)',
                border: '1px solid var(--art-line)',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </ShahriyarDetailShell>
  );
}
