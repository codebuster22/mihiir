import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/page-metadata';
import Link from 'next/link';
import { SiteHeader } from '@/components/site/site-header';
import { SiteFooter } from '@/components/site/site-footer';
import { WritingList } from '@/components/content/writing-list';
import { getWritingEntries, isContentPreview } from '@/lib/content';
import styles from '@/components/content/content.module.css';

export const metadata: Metadata = pageMetadata({
  title: 'Sales Engineer Arc',
  description:
    'Mihiir’s logs from learning the sales part of building a business: outreach, hesitation, questions and what to try next.',
  alternates: { canonical: '/writing/log/sales-engineer' },
});

export default function SalesEngineerSeries() {
  const entries = getWritingEntries({ includeDrafts: isContentPreview() })
    .filter((entry) => entry.series === 'sales-engineer')
    .sort((a, b) => (a.seriesOrder ?? 0) - (b.seriesOrder ?? 0));
  return (
    <>
      <SiteHeader />
      <main id="main-content" className={`page-shell ${styles.collection}`}>
        <header className={styles.collectionIntro}>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link className="text-link" href="/writing">
              Writing
            </Link>
            <Link className="text-link" href="/writing/log">
              Logs
            </Link>
          </nav>
          <h1>Sales Engineer Arc</h1>
          <p>
            I’m learning the sales part of building a business: finding the
            right people, understanding what they need, and explaining where I
            can help.
          </p>
          <p>
            These are my daily logs as I work through it. The outreach, the
            hesitation, the questions I get stuck on, and what I want to try
            next.
          </p>
        </header>
        <WritingList entries={entries} />
        {!entries.length && (
          <div className={styles.empty}>
            <p>The logs will appear here as they’re published.</p>
          </div>
        )}
        <nav className={styles.readingEnd} aria-label="Continue reading">
          <Link className="text-link" href="/writing">
            All writing
          </Link>
        </nav>
      </main>
      <SiteFooter />
    </>
  );
}
