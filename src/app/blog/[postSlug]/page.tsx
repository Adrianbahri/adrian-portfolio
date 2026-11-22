import { cache } from 'react';
import { fetchPublicTable } from '@/lib/supabase';
import { Metadata } from 'next';
import BlogDetailClient from '@/components/BlogDetailClient';

export const revalidate = 60;

interface Props {
  params: Promise<{ postSlug: string }>;
}

const getArticleBySlug = cache(async (slug: string) => {
  const rows = await fetchPublicTable<any>(
    'articles',
    `select=*&slug=eq.${encodeURIComponent(slug)}&limit=1`
  );
  return rows[0] || null;
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { postSlug } = await params;
  const decodedSlug = decodeURIComponent(postSlug);
  const article = await getArticleBySlug(decodedSlug);

  return {
    title: article?.seo_title || `${article?.title || decodedSlug} | Dri4n`,
    description: article?.seo_description || article?.description,
    alternates: {
      canonical: `/blog/${decodedSlug}`,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { postSlug } = await params;
  const decodedSlug = decodeURIComponent(postSlug);
  const article = await getArticleBySlug(decodedSlug);

  return <BlogDetailClient slug={decodedSlug} initialArticle={article} />;
}
