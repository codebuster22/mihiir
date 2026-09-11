import type { ReactNode } from 'react';
import styles from './content.module.css';

export function ContentSection({
  id,
  title,
  children,
}: {
  id: string;
  title?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={styles.contentSection}>
      {title && <h2>{title}</h2>}
      {children}
    </section>
  );
}
