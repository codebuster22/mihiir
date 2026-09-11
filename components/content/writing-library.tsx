import Link from 'next/link';
import { SiteHeader } from '@/components/site/site-header';
import { SiteFooter } from '@/components/site/site-footer';
import { CollectionFilter } from './collection-filter';
import { WritingList } from './writing-list';
import {
  getExternalWriting,
  getWritingEntries,
  isContentPreview,
  writingFormats,
} from '@/lib/content';
import styles from './content.module.css';

export function WritingLibrary({ format = '' }: { format?: string }) {
  const options = { includeDrafts: isContentPreview() };
  const entries = getWritingEntries(options).filter(
    (entry) => !format || entry.formatSegment === format,
  );
  const external = getExternalWriting(options).filter(
    (entry) => !format || entry.formatSegment === format,
  );
  const currentFormat =
    writingFormats.find((item) => item.segment === format) ?? writingFormats[0];
  return (
    <>
      <SiteHeader />
      <main id="main-content" className={`page-shell ${styles.collection}`}>
        <header className={styles.collectionIntro}>
          <h1>{format ? currentFormat.label : 'Writing'}</h1>
          <p>
            I write about things I’m trying to understand. Sometimes that’s an
            order book. Sometimes it’s why I put off sending an email.
          </p>
          <p>
            Technical explanations, experiments, personal thoughts, and logs
            from work in progress.
          </p>
        </header>
        <CollectionFilter
          label="Browse writing"
          options={writingFormats.map(({ label, href }) => ({ label, href }))}
          selected={currentFormat.href}
          count={entries.length + external.length}
        />
        <WritingList entries={entries} external={external} />
        {entries.length + external.length === 0 && (
          <section className={styles.empty}>
            <h2>
              {format ? 'Nothing here yet.' : 'The writing is taking shape.'}
            </h2>
            <p>
              {format
                ? 'Explore the other writing while this part of the collection grows.'
                : 'I’m bringing my logs, experiments and technical writing together here.'}
            </p>
            {format && (
              <Link className="text-link" href="/writing">
                All writing
              </Link>
            )}
          </section>
        )}
        {getWritingEntries(options).some(
          (entry) => entry.series === 'sales-engineer',
        ) && (
          <section className={styles.seriesIntro}>
            <h2>Sales Engineer Arc</h2>
            <p>
              I’m learning the sales part of building a business: finding the
              right people, understanding what they need, and explaining where I
              can help.
            </p>
            <Link className="text-link" href="/writing/log/sales-engineer">
              Follow the Sales Engineer Arc
            </Link>
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
