import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { ConsentProvider } from '@/components/analytics/consent';
import { site, isIndexable } from '@/lib/site';
import './globals.css';

const geistSans = localFont({
  src: [
    { path: '../public/fonts/plex-sans-400.woff2', weight: '400' },
    { path: '../public/fonts/plex-sans-500.woff2', weight: '500' },
    { path: '../public/fonts/plex-sans-600.woff2', weight: '600' },
    { path: '../public/fonts/plex-sans-700.woff2', weight: '700' },
  ],
  variable: '--font-geist-sans',
  display: 'swap',
});

const geistMono = localFont({
  src: '../public/fonts/plex-mono.woff2',
  variable: '--font-geist-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: 'Mihiir — Web3 & Prediction Markets',
    template: '%s — Mihiir',
  },
  description: site.description,
  authors: [{ name: 'Mihiir', url: site.url }],
  creator: 'Mihiir',
  robots: { index: isIndexable, follow: isIndexable },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'Mihiir',
    title: 'Mihiir — Web3 & Prediction Markets',
    description: site.description,
    url: site.url,
    images: [
      {
        url: '/social-preview.png',
        width: 1200,
        height: 630,
        alt: 'Mihiir — products and systems for Web3 and Prediction Markets',
      },
    ],
  },
  twitter: { card: 'summary_large_image', images: ['/social-preview.png'] },
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <ConsentProvider>{children}</ConsentProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'Person',
                  '@id': `${site.url}/#mihiir`,
                  name: 'Mihiir',
                  alternateName: 'Mihir Parmar',
                  url: site.url,
                  description: site.description,
                  knowsAbout: [
                    'Prediction Markets',
                    'Web3',
                    'System design',
                    'Solidity',
                    'Product engineering',
                  ],
                  worksFor: {
                    '@type': 'Organization',
                    name: 'Chain Labs',
                    url: site.studio,
                  },
                },
                {
                  '@type': 'WebSite',
                  '@id': `${site.url}/#website`,
                  name: 'Mihiir',
                  url: site.url,
                  inLanguage: 'en',
                  author: { '@id': `${site.url}/#mihiir` },
                },
              ],
            }).replace(/</g, '\\u003c'),
          }}
        />
      </body>
    </html>
  );
}
