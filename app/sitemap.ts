import type { MetadataRoute } from 'next';
import { getDiscoveryPaths, publicUrl } from '@/lib/discovery';

export default function sitemap(): MetadataRoute.Sitemap {
  return getDiscoveryPaths().map((path) => ({ url: publicUrl(path) }));
}
