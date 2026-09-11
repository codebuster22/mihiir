'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import {
  analyticsEnabled,
  clarityHasStarted,
  consentStorageKey,
  denyClarityStorage,
  readAnalyticsPreference,
  saveAnalyticsPreference,
  startClarity,
  subscribeAnalyticsPreference,
  trackAnalyticsEvent,
  type AnalyticsPreference,
} from '@/lib/analytics';
import styles from './consent.module.css';

const ConsentContext = createContext<{
  enabled: boolean;
  openPreferences: () => void;
}>({
  enabled: false,
  openPreferences: () => {},
});

const subscribeRuntime = () => () => {};
const serverDisabled = () => false;
const serverPreference = () => null;

export function ConsentProvider({ children }: { children: ReactNode }) {
  const enabled = useSyncExternalStore(
    subscribeRuntime,
    analyticsEnabled,
    serverDisabled,
  );
  const choice = useSyncExternalStore(
    subscribeAnalyticsPreference,
    readAnalyticsPreference,
    serverPreference,
  );
  const [message, setMessage] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();
  const observedPath = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    if (choice === 'granted') startClarity();

    const syncPreference = (event: StorageEvent) => {
      if (event.key !== consentStorageKey && event.key !== null) return;
      const next = readAnalyticsPreference();
      if (next !== 'granted' && clarityHasStarted()) {
        denyClarityStorage();
        window.location.reload();
        return;
      }
      if (next === 'granted') startClarity();
    };
    window.addEventListener('storage', syncPreference);
    return () => window.removeEventListener('storage', syncPreference);
  }, [enabled, choice]);

  useEffect(() => {
    if (!enabled || choice !== 'granted') return;
    const onClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      const link = target?.closest<HTMLAnchorElement>(
        'a[data-analytics-event]',
      );
      if (link) trackAnalyticsEvent(link.dataset.analyticsEvent ?? '');
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [enabled, choice]);

  useEffect(() => {
    if (!enabled || choice !== 'granted') return;
    if (observedPath.current !== pathname) {
      observedPath.current = pathname;
      if (/^\/work\/[^/]+\/?$/.test(pathname))
        trackAnalyticsEvent('case_study_open');
    }

    const marker = document.querySelector('[data-article-end]');
    if (!marker || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          trackAnalyticsEvent('article_end_reached');
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(marker);
    return () => observer.disconnect();
  }, [enabled, choice, pathname]);

  const openPreferences = useCallback(() => {
    setMessage('');
    dialog.current?.showModal();
  }, []);

  function choose(next: AnalyticsPreference) {
    const started = clarityHasStarted();
    const saved = saveAnalyticsPreference(next);
    if (!saved) {
      if (next === 'denied') denyClarityStorage();
      setMessage(
        started
          ? 'Your browser could not save the change. Analytics storage is denied, but stopping the running session requires closing this tab. Please allow this site to save a preference before returning.'
          : 'Your browser could not save this choice. Analytics will remain off until a preference can be saved.',
      );
      return;
    }
    setMessage('');
    dialog.current?.close();
    if (next === 'granted') {
      startClarity();
    } else if (started) {
      denyClarityStorage();
      window.location.reload();
    }
  }

  return (
    <ConsentContext value={{ enabled, openPreferences }}>
      {children}
      {enabled && choice === null && (
        <aside
          className={styles.notice}
          aria-labelledby="analytics-choice-heading"
        >
          <div className={styles.noticeText}>
            <h2 id="analytics-choice-heading">
              Help me make this site better?
            </h2>
            <p>
              With your permission, Microsoft Clarity records how this site is
              used through heatmaps and session replay. You can change your
              choice in the footer. <Link href="/privacy">Privacy details</Link>
            </p>
            {message && <output>{message}</output>}
          </div>
          <div className={styles.actions}>
            <button
              className={styles.secondary}
              type="button"
              onClick={() => choose('denied')}
            >
              No thanks
            </button>
            <button
              className={styles.primary}
              type="button"
              onClick={() => choose('granted')}
            >
              Allow analytics
            </button>
          </div>
        </aside>
      )}
      {enabled && (
        <dialog
          className={styles.dialog}
          ref={dialog}
          aria-labelledby="analytics-preferences-heading"
        >
          <div className={styles.dialogContent}>
            <div className={styles.dialogHeader}>
              <h2 id="analytics-preferences-heading">Analytics preferences</h2>
              <button
                type="button"
                className={styles.close}
                onClick={() => dialog.current?.close()}
                aria-label="Close analytics preferences"
              >
                Close
              </button>
            </div>
            <p>
              Microsoft Clarity helps me understand how people use the site with
              heatmaps and session replay. Analytics is optional; every page
              works without it. Advertising storage stays off.
            </p>
            <p className={styles.current}>
              Your choice:{' '}
              {choice === 'granted'
                ? 'Analytics allowed'
                : choice === 'denied'
                  ? 'Analytics off'
                  : 'Not chosen yet'}
            </p>
            <Link
              href="/privacy"
              className={styles.privacyLink}
              onClick={() => dialog.current?.close()}
            >
              Read the privacy details
            </Link>
            {message && <output>{message}</output>}
            <div className={styles.actions}>
              <button
                className={styles.secondary}
                type="button"
                onClick={() => choose('denied')}
              >
                Keep analytics off
              </button>
              <button
                className={styles.primary}
                type="button"
                onClick={() => choose('granted')}
              >
                Allow analytics
              </button>
            </div>
          </div>
        </dialog>
      )}
    </ConsentContext>
  );
}

export function AnalyticsPreferences() {
  const { enabled, openPreferences } = useContext(ConsentContext);
  if (!enabled) return null;
  return (
    <button type="button" onClick={openPreferences}>
      Analytics preferences
    </button>
  );
}
