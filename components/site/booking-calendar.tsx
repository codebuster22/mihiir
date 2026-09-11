'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { getCalBookingLink } from '@/lib/booking';
import { site } from '@/lib/site';
import { BookingLink } from './booking-link';
import styles from './booking-calendar.module.css';

type CalendarApi = Awaited<
  ReturnType<typeof import('@calcom/embed-react').getCalApi>
>;
type Status = 'waiting' | 'loading' | 'ready' | 'failed';

export function BookingCalendar() {
  const shell = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const namespace = `mihiir-footer-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const [nearViewport, setNearViewport] = useState(false);
  const [status, setStatus] = useState<Status>('waiting');
  const calLink = getCalBookingLink(site.booking);

  useEffect(() => {
    const element = shell.current;
    if (!calLink || !element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNearViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin: '300px 0px' },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [calLink]);

  useEffect(() => {
    const element = host.current;
    if (!nearViewport || !calLink || !element) return;

    let disposed = false;
    let api: CalendarApi | undefined;
    const ready = () => {
      if (disposed) return;
      window.clearTimeout(timeout);
      element
        .querySelector('iframe')
        ?.setAttribute('title', 'Book a project conversation with Mihiir');
      setStatus('ready');
    };
    const failed = () => {
      if (disposed) return;
      window.clearTimeout(timeout);
      setStatus('failed');
    };
    const timeout = window.setTimeout(failed, 25_000);

    // Both the package and Cal's network requests wait until the footer is near.
    // Register events before mounting so a fast iframe cannot miss linkReady.
    async function mountCalendar(element: HTMLDivElement, calLink: string) {
      try {
        setStatus('loading');
        const { getCalApi } = await import('@calcom/embed-react');
        if (disposed) return;
        api = await getCalApi({ namespace });
        if (disposed) return;
        api('on', { action: 'linkReady', callback: ready });
        api('on', { action: 'linkFailed', callback: failed });
        api('ui', {
          theme: 'light',
          layout: 'month_view',
          hideEventTypeDetails: false,
          cssVarsPerTheme: {
            light: {
              'cal-brand': '#255bd6',
              'cal-brand-emphasis': '#194bc0',
              'cal-brand-text': '#ffffff',
              'cal-brand-accent': '#ffffff',
            },
            dark: {},
          },
        });
        api('inline', {
          elementOrSelector: element,
          calLink,
          config: {
            theme: 'light',
            layout: 'month_view',
            'ui.color-scheme': 'light',
            'ui.autoscroll': 'false',
            iframeAttrs: {
              title: 'Book a project conversation with Mihiir',
            },
          },
        });
      } catch {
        failed();
      }
    }

    void mountCalendar(element, calLink);
    return () => {
      disposed = true;
      window.clearTimeout(timeout);
      api?.('off', { action: 'linkReady', callback: ready });
      api?.('off', { action: 'linkFailed', callback: failed });
      element.replaceChildren();
    };
  }, [nearViewport, calLink, namespace]);

  if (!calLink) {
    return (
      <div id="project-conversation" className={styles.external}>
        <BookingLink placement="footer" />
      </div>
    );
  }

  return (
    <div
      ref={shell}
      id="project-conversation"
      className={styles.calendar}
      data-calendar-status={status}
    >
      <div
        className={`${styles.frame} ${status === 'failed' ? styles.failed : ''}`}
        aria-label="Project conversation calendar"
        aria-busy={status === 'loading'}
      >
        {status !== 'ready' && (
          <output className={styles.status}>
            <p>
              {status === 'failed'
                ? 'The calendar couldn’t load here.'
                : 'Loading available times…'}
            </p>
            {status === 'failed' && (
              <BookingLink placement="footer" className="text-link">
                Open the booking page
              </BookingLink>
            )}
          </output>
        )}
        <div
          ref={host}
          className={`${styles.embed} ${status === 'ready' ? styles.ready : ''}`}
          inert={status !== 'ready'}
        />
      </div>
      <p className={styles.alternative}>
        <a href={site.booking} data-analytics-event="booking_open_footer">
          Open booking in a separate page
        </a>
      </p>
      <noscript>
        <p className={styles.noScript}>
          Use the booking link to choose a time without loading the calendar
          here.
        </p>
      </noscript>
    </div>
  );
}
