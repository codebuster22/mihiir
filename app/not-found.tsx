import Link from 'next/link';
import { SiteHeader } from '@/components/site/site-header';
import { SiteFooter } from '@/components/site/site-footer';
import styles from './not-found.module.css';

export default function NotFound() {
  return (
    <div className="page-shell">
      <SiteHeader />
      <main id="main-content" className={styles.page}>
        <p className={styles.label}>404</p>
        <h1>This page isn’t here.</h1>
        <p>
          The link may have changed. You can find my projects in Work, or head
          back to the homepage.
        </p>
        <div className={styles.links}>
          <Link href="/work" className="button">
            Explore my work
          </Link>
          <Link href="/" className="text-link">
            Back to home
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
