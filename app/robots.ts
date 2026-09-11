import type { MetadataRoute } from 'next';
import { publicDiscoveryEnabled, publicUrl } from '@/lib/discovery';

export default function robots(): MetadataRoute.Robots {
  if (!publicDiscoveryEnabled())
    return { rules: { userAgent: '*', disallow: '/' } };
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/design-lab', '/api/'] },
    sitemap: publicUrl('/sitemap.xml'),
  };
}
