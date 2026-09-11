import Link from 'next/link';
import type { ReactNode } from 'react';
import { BookingLink } from '@/components/site/booking-link';
import { SiteHeader } from '@/components/site/site-header';
import { SiteFooter } from '@/components/site/site-footer';
import styles from './practice-page.module.css';

export type PracticeCase = {
  name: string;
  subject: string;
  description: string;
  href: string;
  linkLabel: string;
};

type PracticeQuestion = {
  question: string;
  answer: string;
  href?: string;
  linkLabel?: string;
};

type PracticePageProps = {
  title: string;
  introduction: string;
  scopeTitle: string;
  scope: ReactNode;
  workTitle: string;
  cases: PracticeCase[];
  methodTitle?: string;
  method: string;
  questions: PracticeQuestion[];
  closeTitle: string;
};

export function PracticePage({
  title,
  introduction,
  scopeTitle,
  scope,
  workTitle,
  cases,
  methodTitle = 'How we would work together',
  method,
  questions,
  closeTitle,
}: PracticePageProps) {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className={`page-shell ${styles.page}`}>
        <header className={styles.opening}>
          <h1>{title}</h1>
          <p className={styles.introduction}>{introduction}</p>
          <div className={styles.actions}>
            <BookingLink placement="practice" />
            <a className={`text-link ${styles.link}`} href="#relevant-work">
              See relevant work
            </a>
          </div>
        </header>

        <section className={styles.split} aria-labelledby="scope-heading">
          <h2 id="scope-heading">{scopeTitle}</h2>
          <div className={styles.body}>{scope}</div>
        </section>

        <section
          className={styles.work}
          id="relevant-work"
          aria-labelledby="work-heading"
        >
          <h2 id="work-heading">{workTitle}</h2>
          <div className={styles.caseList}>
            {cases.map((project) => (
              <article className={styles.case} key={project.href}>
                <div className={styles.caseHeading}>
                  <p className={styles.subject}>{project.subject}</p>
                  <h3>{project.name}</h3>
                </div>
                <div className={styles.caseBody}>
                  <p>{project.description}</p>
                  <Link
                    href={project.href}
                    className={`text-link ${styles.link}`}
                    data-analytics-event="work_cta_click"
                  >
                    {project.linkLabel}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.split} aria-labelledby="method-heading">
          <h2 id="method-heading">{methodTitle}</h2>
          <div className={styles.body}>
            <p>{method}</p>
            {questions.map((item) => (
              <div className={styles.question} key={item.question}>
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
                {item.href && item.linkLabel && (
                  <Link
                    href={item.href}
                    className={`text-link ${styles.link}`}
                    data-analytics-event={
                      item.href.startsWith('/work/')
                        ? 'work_cta_click'
                        : undefined
                    }
                  >
                    {item.linkLabel}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>

        <section
          className={styles.close}
          aria-labelledby="conversation-heading"
        >
          <h2 id="conversation-heading">{closeTitle}</h2>
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
