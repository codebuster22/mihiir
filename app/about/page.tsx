import { pageMetadata } from '@/lib/page-metadata';
import { site } from '@/lib/site';
import type { Metadata } from 'next';
import Link from 'next/link';
import { BookingLink } from '@/components/site/booking-link';
import { SiteHeader } from '@/components/site/site-header';
import { SiteFooter } from '@/components/site/site-footer';
import styles from './page.module.css';

export const metadata: Metadata = pageMetadata({
  title: 'About',
  description:
    'Mihiir’s story and experience, from photography and mountaineering to Web3 engineering, product ownership and running Chain Labs.',
  alternates: { canonical: '/about' },
});

const experience = [
  {
    period: '2021–2023',
    company: 'Curve Labs',
    role: 'Smart-contract engineer',
    paragraphs: [
      'At Curve Labs, I worked on DAO and DeFi infrastructure. I built launch contracts for PrimeDAO, the price-stability layer and keeper for Kolektivo on Celo, and privacy tooling using Lit Protocol.',
      'That work reached beyond the contracts: deployment, indexing, governance tooling and the services needed to keep the product working.',
    ],
  },
  {
    period: '2023',
    company: 'Movement Labs',
    role: 'Technical researcher',
    paragraphs: [
      'In 2023, I worked at Movement Labs as a technical researcher. One question was how to run Solidity on a Move VM. I worked on Fractal research, contributed to the M1 whitepaper and SDK work, and wrote technical explanations for developers.',
    ],
  },
  {
    period: '2024',
    company: 'Building Chain Labs',
    role: 'Founder',
    paragraphs: [
      'I started working through Chain Labs in 2024. On Antigravity, that meant owning product delivery: designing the architecture, writing the core systems and managing the engineers building it. I later shut the studio down to work with Zero to Infinity.',
    ],
    link: {
      href: '/work/antigravity',
      label: 'Read the Antigravity case study',
    },
  },
  {
    period: 'January–August 2025',
    company: 'Zero to Infinity',
    role: 'Prediction Market and AI Engineer',
    paragraphs: [
      'At Zero to Infinity, I worked on AI and Prediction Markets. Sidetrip and the bot for Prediction Markets were built during this period. The Sidetrip work included ICI, a framework for personal AI assistants that could use context from a person’s own data.',
    ],
  },
  {
    period: 'September 2025–present',
    company: 'Back to Chain Labs',
    role: 'Founder',
    paragraphs: [
      'I restarted Chain Labs in September 2025. I run it today, focused on AI agents and applied AI. My own work in Web3 and Prediction Markets continues alongside it.',
    ],
    link: { href: site.studio, label: 'Visit Chain Labs' },
  },
];

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className={`page-shell ${styles.page}`}>
        <header className={styles.opening}>
          <h1>A little about me.</h1>
          <p>
            In college, I was into travel vlogging, photography and
            mountaineering. In 2017, I was 18, on the Sar Pass trek, and still
            figuring out what I wanted to do next.
          </p>
          <p>
            I graduated the year COVID hit, and around that time I discovered
            Web3. I fell in love with the freedom this technology could bring.
          </p>
        </header>

        <section
          className={styles.experience}
          id="experience"
          aria-labelledby="experience-heading"
        >
          <h2 id="experience-heading">Experience</h2>
          <ol className={styles.timeline}>
            {experience.map((chapter) => (
              <li className={styles.chapter} key={chapter.company}>
                <div className={styles.chapterHeading}>
                  <p className={styles.period}>{chapter.period}</p>
                  <h3>{chapter.company}</h3>
                  <p className={styles.role}>{chapter.role}</p>
                </div>
                <div className={styles.chapterBody}>
                  {chapter.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  {chapter.link && (
                    <Link
                      className={`text-link ${styles.link}`}
                      href={chapter.link.href}
                      data-analytics-event={
                        chapter.link.href.startsWith('/work/')
                          ? 'work_cta_click'
                          : 'chain_labs_open'
                      }
                    >
                      {chapter.link.label}
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.follow} aria-labelledby="follow-heading">
          <h2 id="follow-heading">Follow the work</h2>
          <div className={styles.followBody}>
            <p>
              Alongside the work, I’m writing about what I’m trying, what I
              learn and what I change my mind about.
            </p>
            <div className={styles.links}>
              <Link className={`text-link ${styles.link}`} href="/now">
                What I’m focused on now
              </Link>
              <Link className={`text-link ${styles.link}`} href="/writing">
                Read my writing
              </Link>
            </div>
          </div>
        </section>

        <section className={styles.close} aria-labelledby="project-heading">
          <h2 id="project-heading">Have a project in mind?</h2>
          <p>
            In a 30-minute call, we’ll talk through what you’re building, where
            you need help and the part I could take on.
          </p>
          <BookingLink placement="practice" />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
