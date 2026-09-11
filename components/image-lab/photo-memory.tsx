'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './photo-memory.module.css';

export function PhotoMemory({ mobile = false }: { mobile?: boolean }) {
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const group = useRef<HTMLDivElement>(null);
  const pill = useRef<HTMLButtonElement>(null);
  const suppressFocus = useRef(false);
  const open = hovered || pinned;

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!group.current?.contains(event.target as Node)) { setHovered(false); setPinned(false); }
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setHovered(false);
      setPinned(false);
      if (group.current?.contains(document.activeElement)) {
        suppressFocus.current = true;
        pill.current?.focus({ preventScroll: true });
        queueMicrotask(() => { suppressFocus.current = false; });
      }
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);

  function close() {
    setHovered(false);
    setPinned(false);
    suppressFocus.current = true;
    pill.current?.focus({ preventScroll: true });
    queueMicrotask(() => { suppressFocus.current = false; });
  }

  const triggerProps = {
    'aria-expanded': open,
    'aria-controls': 'photo-memory-note',
    onMouseEnter: () => setHovered(true),
    onFocus: () => { if (!suppressFocus.current) setHovered(true); },
    onClick: () => { if (pinned) close(); else setPinned(true); },
  };

  return <div ref={group} className={`${styles.memory} ${mobile ? styles.mobileImage : ''}`} data-open={open}
    onMouseLeave={() => setHovered(false)}
    onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setHovered(false); }}
    onPointerDown={e => { if (e.target === e.currentTarget) { setHovered(false); setPinned(false); } }}>
    <button type="button" {...triggerProps} className={styles.figure} aria-label="The story behind this photograph" />
    <button ref={pill} type="button" {...triggerProps} className={styles.pill} aria-label="17,000 feet. About this photograph">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>
      17,000 ft
    </button>
    {open && <section id="photo-memory-note" className={styles.note} aria-label="About this photograph">
      <div className={styles.noteHeading}><span>Sar Pass, 2017</span><button type="button" onClick={close} aria-label="Close photo story">×</button></div>
      <p>Eighteen. Still in college. No idea what I wanted to do with my life.</p>
      <p>Pretty happy to be here, though.</p>
    </section>}
  </div>;
}
