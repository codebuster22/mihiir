'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { footerNavigation, navigation } from '@/lib/site';
import { BookingLink } from './booking-link';
import styles from './site-header.module.css';

export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  const pathname = usePathname();
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    const element = dialog.current;
    // Native dialog handles Escape and focus; this only dismisses its backdrop.
    const backdropClick = (event: MouseEvent) => {
      if (event.target === element) {
        element?.close();
        setOpen(false);
      }
    };
    element?.addEventListener('click', backdropClick);
    return () => {
      document.documentElement.style.overflow = previous;
      element?.removeEventListener('click', backdropClick);
    };
  }, [open]);
  function openMenu() {
    dialog.current?.showModal();
    setOpen(true);
  }
  function closeMenu() {
    dialog.current?.close();
    setOpen(false);
  }
  return (
    <>
      <header className={`${styles.header} ${overlay ? styles.overlay : ''}`}>
        <Link className={styles.brand} href="/" aria-label="Mihiir, home">
          Mihiir
        </Link>
        <nav className={styles.destinations} aria-label="Main navigation">
          {navigation.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname.startsWith(link.href) ? 'page' : undefined}
            >
              {link.label}
            </Link>
          ))}
          <BookingLink placement="header" className={styles.booking} />
        </nav>
        <button
          type="button"
          className={styles.menuButton}
          onClick={openMenu}
          aria-expanded={open}
          aria-controls="site-menu"
        >
          Menu
        </button>
      </header>
      <dialog
        ref={dialog}
        id="site-menu"
        className={styles.dialog}
        aria-label="Site navigation"
        onClose={() => setOpen(false)}
      >
        <div className={styles.menuPanel}>
          <div className={styles.menuTop}>
            <Link href="/" onClick={closeMenu} className={styles.menuBrand}>
              Mihiir
            </Link>
            <button type="button" onClick={closeMenu} autoFocus>
              Close
            </button>
          </div>
          <nav aria-label="Mobile navigation" className={styles.menuLinks}>
            {footerNavigation.map((link) => (
              <Link
                href={link.href}
                key={link.href}
                onClick={closeMenu}
                aria-current={
                  pathname.startsWith(link.href) ? 'page' : undefined
                }
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className={styles.menuCall}>
            <p>Tell me what you’re building and where you need help.</p>
            <BookingLink placement="header" />
          </div>
        </div>
      </dialog>
    </>
  );
}
