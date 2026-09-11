'use client';
/* oxlint-disable jsx-a11y/no-noninteractive-tabindex -- Focus pauses this named, horizontally scrollable region. */
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { companyLogos } from '@/lib/company-logos';
import styles from './logo-strip.module.css';
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
            {companyLogos.map((logo) => (
              <div key={logo.name} className={styles.slot} title={logo.name}>
                <Image
                  src={`/brands/${logo.file}`}
                  alt={copy === 0 ? logo.name : ''}
                  width={logo.width}
                  height={logo.height}
                  style={{
                    width: logo.displayWidth,
                    filter: logo.tonal ? 'grayscale(1)' : 'brightness(0)',
                  }}
                  unoptimized
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
