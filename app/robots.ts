import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.APP_URL || 'https://gamematch.ai';
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/dashboard/'] },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
