import { pageMetadata } from '@/lib/page-metadata';
import { site } from '@/lib/site';
import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/site/site-header';
import { SiteFooter } from '@/components/site/site-footer';
import styles from './page.module.css';

export const metadata: Metadata = pageMetadata({
  title: 'Now',
  description:
    'What Mihiir is focused on: Prediction Markets systems, running Chain Labs and learning sales through the Sales Engineer Arc.',
  alternates: { canonical: '/now' },
});

export default function NowPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className={`page-shell ${styles.page}`}>
        <div className={styles.reading}>
          <h1>What I’m working on now.</h1>

          <section
            className={styles.section}
            aria-labelledby="prediction-heading"
          >
            <h2 id="prediction-heading">Prediction Markets systems</h2>
            <p>
              I’m spending a lot of time on Prediction Markets: historical data,
              order books and the systems that connect a signal to an order.
            </p>
            <div className={styles.links}>
              <Link
                className={`text-link ${styles.link}`}
                href="/work/titus-intelligence"
                data-analytics-event="work_cta_click"
              >
                Titus Intelligence — historical data
              </Link>
              <Link
                className={`text-link ${styles.link}`}
                href="/work/pm-ws"
                data-analytics-event="work_cta_click"
              >
                pm-ws — live order books
              </Link>
            </div>
          </section>

          <section
            className={styles.section}
            aria-labelledby="chain-labs-heading"
          >
            <h2 id="chain-labs-heading">Running Chain Labs</h2>
            <p>I run Chain Labs, focused on AI agents and applied AI.</p>
            <a
              className={`text-link ${styles.link}`}
              href={site.studio}
              data-analytics-event="chain_labs_open"
            >
              Visit Chain Labs
            </a>
          </section>

          <section className={styles.section} aria-labelledby="sales-heading">
            <h2 id="sales-heading">Learning sales, and writing it down</h2>
            <p>
              I’m learning the sales side of running a company and documenting
              it in my Sales Engineer Arc. I write about what I’m trying, the
              mistakes and what I change my mind about along the way.
            </p>
            <div className={styles.links}>
              <Link
                className={`text-link ${styles.link}`}
                href="/writing/log/sales-engineer"
              >
                Read the Sales Engineer Arc
              </Link>
              <Link className={`text-link ${styles.link}`} href="/writing">
                All writing
              </Link>
            </div>
          </section>

          <div className={styles.continue}>
            <Link className={`text-link ${styles.link}`} href="/about">
              My story and experience
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
