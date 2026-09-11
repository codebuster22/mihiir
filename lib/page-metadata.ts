import type { Metadata } from 'next';
import { site } from './site';

export function pageMetadata(metadata: Metadata): Metadata {
  const title = typeof metadata.title === 'string' ? metadata.title : site.name;
  const description = metadata.description ?? site.description;
  const canonical = metadata.alternates?.canonical;
  const url =
    typeof canonical === 'string'
      ? new URL(canonical, site.url).toString()
      : site.url;
  return {
    ...metadata,
    openGraph: {
      title,
      description,
      url,
      siteName: site.name,
      type: 'website',
      locale: 'en_IN',
      images: [
        {
          url: '/social-preview.png',
          width: 1200,
          height: 630,
          alt: 'Mihiir — products and systems for Web3 and Prediction Markets',
        },
      ],
      ...metadata.openGraph,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/social-preview.png'],
      ...metadata.twitter,
    },
  };
}
