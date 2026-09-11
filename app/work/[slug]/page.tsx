import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/page-metadata';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteHeader } from '@/components/site/site-header';
import { SiteFooter } from '@/components/site/site-footer';
import { BookingLink } from '@/components/site/booking-link';
import { getWorkEntries, getWorkEntry, isContentPreview } from '@/lib/content';
import styles from '@/components/content/content.module.css';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getWorkEntries({ includeDrafts: isContentPreview() }).map((entry) => ({
    slug: entry.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const entry = getWorkEntry((await params).slug, {
    includeDrafts: isContentPreview(),
  });
  if (!entry) return {};
  return pageMetadata({
    title: entry.title,
    description: entry.summary,
    alternates: { canonical: entry.path },
    robots: entry.draft ? { index: false, follow: false } : undefined,
  });
}

export default async function WorkDetail({ params }: Props) {
  const entry = getWorkEntry((await params).slug, {
    includeDrafts: isContentPreview(),
  });
  if (!entry) notFound();
  const { Body } = entry;
  const isAntigravity = entry.slug === 'antigravity';
  return (
    <>
      <SiteHeader />
      <main id="main-content" className={`page-shell ${styles.caseLayout}`}>
        <aside className={styles.caseSidebar}>
          <Link className="text-link" href="/work">
            All work
          </Link>
          {entry.toc.length > 0 && (
            <nav aria-label="On this page">
              <p className={styles.tocLabel}>On this page</p>
              <ol className={styles.tocLinks}>
                {entry.toc.map((item) => (
                  <li key={item.id}>
                    <a href={`#${item.id}`}>{item.label}</a>
                  </li>
                ))}
              </ol>
            </nav>
          )}
        </aside>
        <article className={styles.caseArticle}>
          <header className={styles.caseHeader}>
            <h1>{entry.title}</h1>
            <p className={styles.subtitle}>{entry.subtitle ?? entry.summary}</p>
            {!isAntigravity && (
              <dl className={styles.caseFacts}>
                <div>
                  <dt>My responsibility</dt>
                  <dd>{entry.role}</dd>
                </div>
                <div>
                  <dt>Context</dt>
                  <dd>{entry.relationship}</dd>
                </div>
              </dl>
            )}
          </header>
          <div className={styles.body}>
            <Body />
          </div>
          <section
            className={styles.caseClose}
            aria-label="Talk about a project"
            data-article-end
          >
            <p>
              {isAntigravity
                ? 'If you need that kind of ownership for your Web3 product, tell me what needs to ship and where your team needs help. We’ll talk through the scope and the part I could take on.'
                : 'If you’re working through a similar problem, tell me what you’re building and where your team needs help. We’ll talk through the part I could take on.'}
            </p>
            <div className={styles.closeActions}>
              <BookingLink placement="case_study" />
              <Link
                className="text-link"
                href={
                  entry.category === 'Prediction Markets'
                    ? '/prediction-market-development'
                    : '/web3-product-engineering'
                }
              >
                {entry.category === 'Prediction Markets'
                  ? 'Engineering for Prediction Markets'
                  : 'Web3 product engineering'}
              </Link>
            </div>
          </section>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
