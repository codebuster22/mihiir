import type { Metadata } from 'next';
import Link from 'next/link';
import { HomeHero } from '@/components/site/home-hero';
import { LogoStrip } from '@/components/site/logo-strip';
import { SiteFooter } from '@/components/site/site-footer';
import {
  getWorkEntries,
  isContentPreview,
  getWritingEntries,
} from '@/lib/content';
import styles from './home.module.css';

export const metadata: Metadata = {
  title: 'Mihiir — Web3 & Prediction Markets',
  description:
    'I build products and systems for Web3 and Prediction Markets, from architecture and core engineering to product delivery.',
  alternates: { canonical: '/' },
};
const selected = [
  {
    slug: 'antigravity',
    title: 'Antigravity',
    summary:
      'An on-chain game, from architecture to delivery. I owned the product, designed its systems and managed the engineers building it.',
    link: 'Read about Antigravity',
  },
  {
    slug: 'titus-intelligence',
    title: 'Titus Intelligence',
    summary:
      "I'm building a system for collecting and making sense of Polymarket's on-chain history. It connects raw events to markets and positions, with recovery and data validation built into the ingestion process.",
    link: 'Explore Titus Intelligence',
  },
  {
    slug: 'pm-ws',
    title: 'pm-ws',
    summary:
      'A Rust daemon that lets Python and TypeScript applications share order books from Prediction Markets, without each application managing its own feed connections. Limitless is the first supported venue.',
    link: 'Explore pm-ws',
  },
];

export default function Home() {
  const entries = getWorkEntries({ includeDrafts: isContentPreview() });
  const highlights = selected.filter((item) =>
    entries.some((entry) => entry.slug === item.slug),
  );
  const log = getWritingEntries({ includeDrafts: isContentPreview() }).find(
    (entry) => entry.path === '/writing/log/sales-engineer-log-2',
  );
  return (
    <div className="page-shell">
      <main>
        <HomeHero />
        <LogoStrip />
        {highlights.length > 0 && (
          <section
            className={styles.highlights}
            aria-labelledby="recent-highlights"
          >
            <div className={styles.sectionHeading}>
              <h2 id="recent-highlights">Recent Highlights</h2>
              <Link href="/work" className="text-link">
                All work
              </Link>
            </div>
            {highlights.map((item) => (
              <article key={item.slug} className={styles.highlight}>
                <h3>
                  <Link href={'/work/' + item.slug}>{item.title}</Link>
                </h3>
                <div>
                  <p>{item.summary}</p>
                  <Link
                    href={'/work/' + item.slug}
                    className="text-link"
                    data-analytics-event="work_cta_click"
                  >
                    {item.link}
                  </Link>
                </div>
              </article>
            ))}
          </section>
        )}
        <section className={styles.about} aria-labelledby="little-about">
          <div className={styles.personal}>
            <h2 id="little-about">A little about me</h2>
            <p className={styles.origin}>
              In college, I was into travel vlogging, photography and
              mountaineering. I graduated the year COVID hit, and around that
              time I discovered Web3. I fell in love with the freedom this
              technology could bring.
            </p>
            <p>
              That took me through smart-contract engineering at Curve Labs,
              technical research at Movement Labs and running Chain Labs. I shut
              the studio down to work on Prediction Markets and AI at Zero to
              Infinity, then restarted it in September 2025. Today, Chain Labs
              focuses on AI agents and applied AI, while my work here centres on
              Web3 and Prediction Markets.
            </p>
            <p className={styles.since}>Building professionally since 2021</p>
            <div className={styles.continuations}>
              <Link href="/about" className="text-link">
                My story and experience
              </Link>
              <Link href="/now" className="text-link">
                What I&apos;m focused on now
              </Link>
            </div>
          </div>
        </section>
        <section className={styles.writing} aria-labelledby="home-writing">
          <div className={styles.writingIntro}>
            <h2 id="home-writing">Writing</h2>
            <p>
              I write about what I&apos;m building and learning, from
              experiments in Prediction Markets to the daily work of getting
              better at sales. These are the tests, mistakes and questions along
              the way.
            </p>
            <Link href="/writing" className="text-link">
              All writing
            </Link>
          </div>
          {log && (
            <article className={styles.featuredLog}>
              <time dateTime="2026-09-01">1 September 2026</time>
              <h3>
                <Link href={log.path}>Sales Engineer Arc — Log 2</Link>
              </h3>
              <p>
                Four emails, a blank draft and a question about who I&apos;m
                trying to reach.
              </p>
              <Link href={log.path} className="text-link">
                Read the log
              </Link>
            </article>
          )}
        </section>
      </main>
      <SiteFooter landscape />
    </div>
  );
}
