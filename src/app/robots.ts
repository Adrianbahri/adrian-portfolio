import { MetadataRoute } from 'next';

/**
 * Search Engine + AI Agent (GEO) Robots.txt Configuration.
 * Explicitly welcomes Google, Bing, and major AI Search/Agent crawlers
 * (ChatGPT/OAI-SearchBot, Claude, Perplexity, Gemini/Google-Extended)
 * while keeping /admin and auth routes private.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://dri4n.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/art', '/about', '/contact', '/projects', '/blog', '/api/assets/'],
        disallow: ['/setting', '/admin', '/login', '/reset-password', '/maintenance'],
      },
      {
        userAgent: [
          'Googlebot',
          'Bingbot',
          'GPTBot',
          'OAI-SearchBot',
          'ChatGPT-User',
          'ClaudeBot',
          'Claude-Web',
          'anthropic-ai',
          'PerplexityBot',
          'Google-Extended',
          'Applebot',
          'Applebot-Extended',
        ],
        allow: ['/', '/art', '/about', '/contact', '/projects', '/blog', '/llms.txt', '/llms-full.txt', '/api/assets/'],
        disallow: ['/setting', '/admin', '/login', '/reset-password', '/maintenance'],
      },
    ],
    host: baseUrl,
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
