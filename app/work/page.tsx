import { pageMetadata } from '@/lib/page-metadata';
import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/site/site-header';
import { SiteFooter } from '@/components/site/site-footer';
import { BookingLink } from '@/components/site/booking-link';
import { CollectionFilter } from '@/components/content/collection-filter';
import {
  getWorkEntries,
  isContentPreview,
  workCategories,
} from '@/lib/content';
import styles from '@/components/content/content.module.css';

export const metadata: Metadata = pageMetadata({
  title: 'Work',
  description:
    'Products, protocols and market infrastructure. Explore what Mihiir built, the decisions behind it and the responsibility he took.',
  alternates: { canonical: '/work' },
});

export default async function WorkPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string | string[] }>;
}) {
  const query = await searchParams;
  const selectedCategory =
    typeof query.category === 'string' &&
    workCategories.includes(query.category as (typeof workCategories)[number])
      ? query.category
      : 'All work';
  const allEntries = getWorkEntries({ includeDrafts: isContentPreview() });
  const entries =
    selectedCategory === 'All work'
      ? allEntries
      : allEntries.filter((entry) => entry.category === selectedCategory);
  const options = workCategories.map((label) => ({
    label,
    href:
      label === 'All work'
        ? '/work'
        : `/work?category=${encodeURIComponent(label)}`,
  }));
  return (
    <>
      <SiteHeader />
      <main id="main-content" className={`page-shell ${styles.collection}`}>
        <header className={styles.collectionIntro}>
          <h1>Work</h1>
          <p>Products, protocols and the systems behind them.</p>
          <p>
            I can take responsibility for a whole product or go deep into a
            specific part. Here’s the work, the decisions behind it and what I
            owned.
          </p>
        </header>
        <CollectionFilter
          label="Browse work"
          options={options}
          selected={
            options.find((option) => option.label === selectedCategory)!.href
          }
          count={entries.length}
        />
        <div className={styles.workList}>
          {entries.map((entry) => (
            <article key={entry.slug} className={styles.workRow}>
              <div>
                <h2>{entry.collectionTitle}</h2>
                <p className={styles.category}>{entry.category}</p>
              </div>
              <div>
                <p className={styles.workSummary}>{entry.collectionSummary}</p>
                <p className={styles.stage}>{entry.stage}</p>
                <Link className="text-link" href={entry.path}>
                  Read about {entry.collectionTitle}
                </Link>
              </div>
            </article>
          ))}
        </div>
        {!entries.length && (
          <section className={styles.empty}>
            <h2>
              {allEntries.length
                ? 'There’s no work in this view yet.'
                : 'The case studies are being prepared.'}
            </h2>
            <p>
              {allEntries.length
                ? 'Explore the full collection to find a relevant project.'
                : 'If you have a project in mind, we can talk through the relevant work together.'}
            </p>
            {allEntries.length > 0 && (
              <Link className="text-link" href="/work">
                All work
              </Link>
            )}
          </section>
        )}
        <section className={styles.collectionCta}>
          <h2>Have something to build?</h2>
          <p>
            Tell me what needs to ship and where your team needs help. We’ll
            talk through the scope and the part I could take on.
          </p>
          <BookingLink placement="case_study" />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
