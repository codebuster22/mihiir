'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './content.module.css';

type Option = { label: string; href: string };

export function CollectionFilter({
  label,
  options,
  selected,
  count,
}: {
  label: string;
  options: Option[];
  selected: string;
  count: number;
}) {
  const router = useRouter();
  return (
    <div className={styles.filters}>
      <nav className={styles.filterLinks} aria-label={label}>
        {options.map((option) => (
          <Link
            key={option.href}
            href={option.href}
            scroll={false}
            aria-current={selected === option.href ? 'page' : undefined}
          >
            {option.label}
          </Link>
        ))}
      </nav>
      <label className={styles.mobileFilter}>
        {label}
        <select
          value={selected}
          onChange={(event) =>
            router.push(event.target.value, { scroll: false })
          }
        >
          {options.map((option) => (
            <option key={option.href} value={option.href}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <span
        className={styles.resultCount}
        aria-live="polite"
        aria-atomic="true"
      >
        {count} {count === 1 ? 'entry' : 'entries'}
      </span>
    </div>
  );
}
