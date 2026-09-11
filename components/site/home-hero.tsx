'use client';

import Link from 'next/link';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { SiteHeader } from './site-header';
import { BookingLink } from './booking-link';
import styles from './home-hero.module.css';

const memory =
  'Sar Pass, 2017. I was 18, still in college, and had no idea what I wanted to do next.';

export function HomeHero() {
  const hero = useRef<HTMLElement>(null);
  const photo = useRef<HTMLImageElement>(null);
  const note = useRef<HTMLElement>(null);
  const figure = useRef<HTMLButtonElement>(null);
  const pill = useRef<HTMLButtonElement>(null);
  const lastTrigger = useRef<HTMLButtonElement | null>(null);
  const suppressFocus = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [bounds, setBounds] = useState<CSSProperties>({});
  const open = hovered || pinned;
  const cancelClose = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
  }, []);
  function show() {
    cancelClose();
    setHovered(true);
  }
  function leave() {
    cancelClose();
    timer.current = setTimeout(() => setHovered(false), 200);
  }
  const close = useCallback(
    (restoreFocus = true) => {
      cancelClose();
      setHovered(false);
      setPinned(false);
      if (restoreFocus) {
        suppressFocus.current = true;
        lastTrigger.current?.focus({ preventScroll: true });
        queueMicrotask(() => {
          suppressFocus.current = false;
        });
      }
    },
    [cancelClose],
  );

  useEffect(() => {
    const target = hero.current;
    if (!target) return;
    const update = () => {
      const width = target.getBoundingClientRect().width;
      const mobile = window.matchMedia('(max-width: 760px)').matches;
      const height = mobile ? 850 : target.getBoundingClientRect().height;
      const source = mobile
        ? { w: 1122, h: 1402, x: 878, y: 843, bw: 72, bh: 118 }
        : { w: 1956, h: 1227, x: 1516, y: 762, bw: 136, bh: 196 };
      const scale = Math.max(width / source.w, height / source.h);
      const x = (width - source.w * scale) * 0.8 + source.x * scale;
      const y =
        (height - source.h * scale) * 0.5 +
        source.y * scale -
        (mobile ? 180 : 0);
      setBounds({
        left: x - 8,
        top: y - 8,
        width: Math.max(44, source.bw * scale + 16),
        height: source.bh * scale + 16,
      });
    };
    const observer = new ResizeObserver(update);
    observer.observe(target);
    update();
    return () => {
      observer.disconnect();
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        !note.current?.contains(target) &&
        !figure.current?.contains(target) &&
        !pill.current?.contains(target)
      )
        close(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
      }
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape);
    };
  }, [open, close]);

  const triggers = {
    'aria-expanded': open,
    'aria-controls': 'sar-pass-memory',
    onPointerEnter: (event: React.PointerEvent<HTMLButtonElement>) => {
      if (event.pointerType === 'mouse') show();
    },
    onPointerLeave: leave,
    onFocus: (event: React.FocusEvent<HTMLButtonElement>) => {
      lastTrigger.current = event.currentTarget;
      if (
        !suppressFocus.current &&
        event.currentTarget.matches(':focus-visible')
      )
        show();
    },
    onBlur: (event: React.FocusEvent<HTMLButtonElement>) => {
      if (!note.current?.contains(event.relatedTarget)) leave();
    },
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
      lastTrigger.current = event.currentTarget;
      if (pinned) close();
      else {
        cancelClose();
        setPinned(true);
      }
    },
  };

  return (
    <section
      ref={hero}
      className={styles.hero}
      aria-labelledby="home-title"
      data-photo-open={open}
    >
      <div className={styles.photoFrame}>
        <picture>
          <source media="(max-width: 760px)" type="image/avif" srcSet="/artwork/mountaineering-mobile-print-q85.avif" />
          <source
            media="(max-width: 760px)"
            srcSet="/artwork/mountaineering-mobile-print.webp"
          />
          <source type="image/avif" srcSet="/artwork/mountaineering-print-q85.avif" />
          <img
            ref={photo}
            src="/artwork/mountaineering-print.webp"
            width="1956"
            height="1227"
            fetchPriority="high"
            alt="Mihiir jumping above the snowy slopes on the Sar Pass trek."
            className={styles.photo}
          />
        </picture>
        <div className={styles.photoFade} aria-hidden="true" />
      </div>
      <SiteHeader overlay />
      <button
        ref={figure}
        {...triggers}
        type="button"
        className={styles.figure}
        style={bounds}
        aria-label="The story behind this photograph"
      />
      <button
        ref={pill}
        {...triggers}
        type="button"
        className={styles.pill}
        aria-label="17,000 feet. About this photograph"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          aria-hidden="true"
        >
          <path d="M19 9c0 5-7 12-7 12S5 14 5 9a7 7 0 0 1 14 0Z" />
          <circle cx="12" cy="9" r="2.4" />
        </svg>
        <span>17,000 ft</span>
      </button>
      <div className={styles.mobileSpacer} aria-hidden="true" />
      {open && (
        <div className={styles.noteSpace}>
          <section
            ref={note}
            id="sar-pass-memory"
            className={styles.note}
            aria-label="About this photograph"
            onPointerEnter={show}
            onPointerLeave={leave}
          >
            <p>{memory}</p>
            <button
              type="button"
              onClick={() => close()}
              onBlur={leave}
              className={styles.closeNote}
              aria-label="Close photo note"
            >
              <span className={styles.desktopClose}>×</span>
              <span className={styles.mobileClose}>Hide photo note</span>
            </button>
          </section>
        </div>
      )}
      <div className={styles.copy} id="main-content" tabIndex={-1}>
        <h1 id="home-title">
          I build products and systems for Web3 and Prediction Markets.
        </h1>
        <div className={styles.bodyGroup}>
          <p>
            I&apos;m Mihiir. I take responsibility for getting the product
            built: working through the architecture, writing the core systems
            and leading the engineers. I can own the whole build or join your
            team to deliver a specific part.
          </p>
          <div className={styles.actions}>
            <BookingLink />
            <Link
              href="/work"
              className={styles.workLink}
              data-analytics-event="work_cta_click"
            >
              Explore my work
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
