import Link from 'next/link';
import { footerNavigation, socials } from '@/lib/site';
import { BookingCalendar } from './booking-calendar';
import { AnalyticsPreferences } from '@/components/analytics/consent';
import styles from './site-footer.module.css';
export function SiteFooter({ landscape = false }: { landscape?: boolean }) {
  return (
    <footer
      className={`${styles.footer} ${landscape ? styles.landscape : styles.compact}`}
    >
      {landscape && (
        <>
          <picture className={styles.panorama}>
            <source
              type="image/avif"
              srcSet="/artwork/panorama-print-q85.avif"
            />
            <img
              src="/artwork/panorama-print.webp"
              alt=""
              loading="lazy"
              decoding="async"
            />
          </picture>
          <div className={styles.fade} aria-hidden="true" />
        </>
      )}
      <div className={styles.composition}>
        {landscape && (
          <section
            className={styles.invitation}
            aria-labelledby="project-invitation"
          >
            <h2 id="project-invitation">
              Have a project
              <br className={styles.desktopBreak} /> in mind?
            </h2>
            <p>
              In a 30-minute call, we&apos;ll talk through what you&apos;re
              building, where you need help and the part I could take on.
            </p>
          </section>
        )}
        {landscape && <BookingCalendar />}
        <div className={styles.navigation}>
          <div className={styles.siteGroup}>
            <Link href="/" className={styles.wordmark}>
              Mihiir
            </Link>
            <nav aria-label="Footer navigation" className={styles.links}>
              {footerNavigation.map((link) => (
                <Link key={link.href} href={link.href}>
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className={styles.socialGroup}>
            <p className={styles.groupHeading}>Elsewhere</p>
            <nav className={styles.links} aria-label="Social profiles">
              {socials.map((link) =>
                link.href ? (
                  <a key={link.label} href={link.href} rel="me">
                    {link.label}
                  </a>
                ) : (
                  <span key={link.label} className={styles.pending}>
                    {link.label}
                  </span>
                ),
              )}
            </nav>
          </div>
        </div>
      </div>
      <div className={styles.privacy}>
        <Link href="/privacy">Privacy</Link>
        <AnalyticsPreferences />
      </div>
    </footer>
  );
}
