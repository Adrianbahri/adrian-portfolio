import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

/**
 * Dynamic XML Sitemap generator.
 * Automatically queries Supabase to index all projects and blog posts for Google Search.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://adrianbahri.com'; // Change this to your production domain once ready

  // 1. Core Static Pages
  const staticRoutes = [
    '',
    '/projects',
    '/blog',
    '/contact',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // 2. Dynamic Projects from Supabase
  let projectRoutes: MetadataRoute.Sitemap = [];
  try {
    const { data: projects } = await supabase.from('projects').select('slug, created_at');
    if (projects) {
      projectRoutes = projects.map((p) => ({
        url: `${baseUrl}/projects/${p.slug}`,
        lastModified: p.created_at ? new Date(p.created_at) : new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }));
    }
  } catch (e) {
    console.warn('Sitemap: Failed to query projects dynamically. Skipping.');
  }

  // 3. Dynamic Blog Articles from Supabase
  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const { data: articles } = await supabase.from('articles').select('slug, created_at');
    if (articles) {
      blogRoutes = articles.map((a) => ({
        url: `${baseUrl}/blog/${a.slug}`,
        lastModified: a.created_at ? new Date(a.created_at) : new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      }));
    }
  } catch (e) {
    console.warn('Sitemap: Failed to query articles dynamically. Skipping.');
  }

  return [...staticRoutes, ...projectRoutes, ...blogRoutes];
}
