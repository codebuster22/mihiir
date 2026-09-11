'use client';
/* oxlint-disable jsx-a11y/no-noninteractive-tabindex -- Focus pauses this named, horizontally scrollable region. */
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import styles from './logo-strip.module.css';
const logos = [
  { name: 'Curve Labs', file: 'curve-labs.png', width: 52 },
  { name: 'Movement Labs', file: 'movement-labs.svg', width: 184 },
  { name: 'Toucan', file: 'toucan-earth.png', width: 150 },
  { name: 'Antigravity', file: 'antigravity.svg', width: 48 },
  { name: 'Bipzy', file: 'bipzy.svg', width: 180 },
];
export function LogoStrip() {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(entry.isIntersecting),
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  // Keyboard focus pauses the moving strip and makes touch/reduced-motion overflow browsable.
  return (
    <section
      ref={ref}
      className={styles.strip}
      aria-label="Companies I have worked with"
      tabIndex={0}
      data-visible={visible}
    >
      <div className={styles.track}>
        {[0, 1].map((copy) => (
          <div
            className={styles.set}
            key={copy}
            aria-hidden={copy === 1 ? true : undefined}
          >
            {logos.map((logo) => (
              <div key={logo.name} className={styles.slot}>
                <Image
                  src={`/brands/${logo.file}`}
                  alt={copy === 0 ? logo.name : ''}
                  width={logo.width}
                  height={48}
                  style={{
                    width: logo.width,
                    filter:
                      logo.name === 'Antigravity' ? 'none' : 'brightness(0)',
                  }}
                  unoptimized
                  loading="eager"
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
