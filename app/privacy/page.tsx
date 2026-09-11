import { pageMetadata } from '@/lib/page-metadata';
import type { Metadata } from 'next';
import { AnalyticsPreferences } from '@/components/analytics/consent';
import { SiteHeader } from '@/components/site/site-header';
import { SiteFooter } from '@/components/site/site-footer';
import styles from './page.module.css';

export const metadata: Metadata = pageMetadata({
  title: 'Privacy',
  description:
    'How optional analytics and browser preferences work on Mihiir’s website.',
  alternates: { canonical: '/privacy' },
});

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className={`page-shell ${styles.page}`}>
        <article className={`prose ${styles.reading}`}>
          <h1>Privacy</h1>
          <p>
            You can read this site without allowing analytics. There is no
            account to create and no analytics requirement for viewing the work
            or writing.
          </p>

          <h2>Optional website analytics</h2>
          <p>
            This site is prepared to use Microsoft Clarity to understand how
            people use its pages, through heatmaps and session replay. When
            analytics is enabled on mihiir.com, you will be asked before Clarity
            loads. It stays off if you decline or have not made a choice.
          </p>
          <p>
            If you allow it, Clarity can collect website interactions, page
            visits, device and browser information, and diagnostic data. Clarity
            uses cookies and similar technologies for analytics. This site
            requests analytics storage only and keeps advertising storage
            denied.
          </p>
          <p>
            Specific site events help distinguish opening a case study, reaching
            the end of an article and choosing a project-conversation link. A
            link click does not tell me whether a booking was completed.
            Reaching an article’s end does not tell me whether it was read or
            understood.
          </p>
          <p>
            Event names do not include your name, email address or arbitrary
            text you enter. Microsoft processes the analytics data through its
            Clarity service. You can read more in{' '}
            <a href="https://www.microsoft.com/privacy/privacystatement">
              Microsoft’s Privacy Statement
            </a>{' '}
            and{' '}
            <a href="https://learn.microsoft.com/en-us/clarity/setup-and-installation/privacy-disclosure">
              Clarity’s privacy disclosure
            </a>
            .
          </p>

          <h2>Your choice stays yours</h2>
          <p>
            A small preference is stored in your browser to remember your
            choice. You can change it through Analytics preferences in the
            footer whenever analytics is available. Withdrawing permission turns
            off analytics storage and reloads the page so Clarity no longer
            runs. This does not retroactively delete information already
            collected by Microsoft.
          </p>
          <div className={styles.preferences}>
            <AnalyticsPreferences />
          </div>

          <h2>Links to other services</h2>
          <p>
            Booking a conversation opens an external booking service. Links to
            Chain Labs and social profiles also take you to separate sites.
            Their own privacy practices apply once you visit them.
          </p>

          <h2>The image playground</h2>
          <p>
            The design playground can save your chosen image-filter settings in
            this browser. Those saved looks stay in local browser storage; they
            are not sent to an analytics event.
          </p>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
