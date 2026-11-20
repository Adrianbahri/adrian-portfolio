import { MetadataRoute } from 'next';
import { fetchPublicTable } from '@/lib/supabase';

/**
 * Dynamic XML Sitemap generator for Google, Bing & AI Search Engines.
 * Automatically queries the database to index /, /art, all projects, and all blog articles.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://dri4n.com';
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/art`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/llms.txt`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/llms-full.txt`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];

  let projectRoutes: MetadataRoute.Sitemap = [];
  try {
    const projects = await fetchPublicTable<any>('projects', 'select=slug,created_at');
    if (Array.isArray(projects)) {
      projectRoutes = projects
        .filter((p) => p?.slug)
        .map((p) => ({
          url: `${baseUrl}/projects/${p.slug}`,
          lastModified: p.created_at ? new Date(p.created_at) : now,
          changeFrequency: 'monthly' as const,
          priority: 0.8,
        }));
    }
  } catch {
    // Fallback to static routes
  }

  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const articles = await fetchPublicTable<any>('articles', 'select=slug,created_at');
    if (Array.isArray(articles)) {
      blogRoutes = articles
        .filter((a) => a?.slug)
        .map((a) => ({
          url: `${baseUrl}/blog/${a.slug}`,
          lastModified: a.created_at ? new Date(a.created_at) : now,
          changeFrequency: 'monthly' as const,
          priority: 0.8,
        }));
    }
  } catch {
    // Fallback to static routes
  }

  return [...staticRoutes, ...projectRoutes, ...blogRoutes];
}
