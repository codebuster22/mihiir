import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/page-metadata';
import { site } from '@/lib/site';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteHeader } from '@/components/site/site-header';
import { SiteFooter } from '@/components/site/site-footer';
import {
  displayContentDate,
  getWorkEntry,
  getWritingEntries,
  getWritingEntry,
  isContentPreview,
} from '@/lib/content';
import styles from '@/components/content/content.module.css';

type Props = { params: Promise<{ format: string; slug: string }> };
export function generateStaticParams() {
  return getWritingEntries({ includeDrafts: isContentPreview() }).map(
    (entry) => ({ format: entry.formatSegment, slug: entry.slug }),
  );
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { format, slug } = await params;
  const entry = getWritingEntry(format, slug, {
    includeDrafts: isContentPreview(),
  });
  if (!entry) return {};
  return pageMetadata({
    title: entry.title,
    description: entry.summary,
    alternates: { canonical: entry.path },
    robots: entry.draft ? { index: false, follow: false } : undefined,
    openGraph: {
      title: entry.title,
      description: entry.summary,
      type: 'article',
      authors: ['Mihiir'],
      ...(entry.date ? { publishedTime: entry.date } : {}),
    },
  });
}
export default async function WritingDetail({ params }: Props) {
  const { format, slug } = await params;
  const entry = getWritingEntry(format, slug, {
    includeDrafts: isContentPreview(),
  });
  if (!entry) notFound();
  const { Body } = entry;
  const relatedWork = entry.relatedWork
    ? getWorkEntry(entry.relatedWork, { includeDrafts: isContentPreview() })
    : undefined;
  const series = entry.series
    ? getWritingEntries({ includeDrafts: isContentPreview() })
        .filter((item) => item.series === entry.series)
        .sort((a, b) => (a.seriesOrder ?? 0) - (b.seriesOrder ?? 0))
    : [];
  const current = series.findIndex((item) => item.path === entry.path);
  const previous = current > 0 ? series[current - 1] : undefined;
  const next = current >= 0 ? series[current + 1] : undefined;
  return (
    <>
      <SiteHeader />
      <main id="main-content" className={`page-shell ${styles.reader}`}>
        <article className={styles.readingColumn}>
          <header className={styles.readingHeader}>
            <nav className={styles.breadcrumb} aria-label="Breadcrumb">
              <Link className="text-link" href="/writing">
                Writing
              </Link>
              {entry.series && (
                <Link
                  className="text-link"
                  href={`/writing/log/${entry.series}`}
                >
                  {entry.seriesLabel}
                </Link>
              )}
            </nav>
            <h1>{entry.title}</h1>
            <div className={styles.byline}>
              <span>Mihiir</span>
              {entry.date && (
                <time dateTime={entry.date}>
                  {displayContentDate(entry.date)}
                </time>
              )}
              {entry.sourceUrl && (
                <a className="text-link" href={entry.sourceUrl}>
                  Originally posted on{' '}
                  {entry.sourceUrl.includes('x.com') ? 'X' : 'Reddit'}
                </a>
              )}
            </div>
            {entry.formatSegment !== 'log' && (
              <p className={styles.readingLede}>{entry.summary}</p>
            )}
          </header>
          <div className={styles.body}>
            <Body />
          </div>
          <nav
            className={styles.readingEnd}
            aria-label="Continue reading"
            data-article-end
          >
            {relatedWork && (
              <Link className="text-link" href={relatedWork.path}>
                Read about {relatedWork.collectionTitle}
              </Link>
            )}
            {(previous || next) && (
              <div className={styles.nextPrevious}>
                {previous && (
                  <Link className="text-link" href={previous.path}>
                    Previous: {previous.title}
                  </Link>
                )}
                {next && (
                  <Link className="text-link" href={next.path}>
                    Next: {next.title}
                  </Link>
                )}
              </div>
            )}
            {entry.series && (
              <Link className="text-link" href={`/writing/log/${entry.series}`}>
                Back to {entry.seriesLabel}
              </Link>
            )}
            <Link className="text-link" href="/writing">
              All writing
            </Link>
          </nav>
        </article>
      </main>
      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type':
              entry.formatSegment === 'technical'
                ? 'TechArticle'
                : 'BlogPosting',
            headline: entry.title,
            description: entry.summary,
            url: site.url + entry.path,
            mainEntityOfPage: site.url + entry.path,
            author: {
              '@type': 'Person',
              '@id': `${site.url}/#mihiir`,
              name: 'Mihiir',
            },
            ...(entry.date ? { datePublished: entry.date } : {}),
            image: site.url + '/social-preview.png',
            inLanguage: 'en',
            isAccessibleForFree: true,
          }).replace(/</g, '\\u003c'),
        }}
      />
    </>
  );
}
