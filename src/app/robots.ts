import { MetadataRoute } from 'next';

/**
 * Standard Robots.txt configuration.
 * Directs search crawlers to your sitemap while shielding backend paths.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://dri4n.com'; // Change to match your production domain

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api'], // Blocks search crawlers from indexing admin interfaces or api endpoints
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
