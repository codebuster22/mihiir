import Link from 'next/link';
import {
  displayContentDate,
  type WritingEntry,
  type ExternalWritingEntry,
} from '@/lib/content';
import styles from './content.module.css';

export function WritingList({
  entries,
  external = [],
}: {
  entries: WritingEntry[];
  external?: ExternalWritingEntry[];
}) {
  const items = [
    ...entries.map((entry) => ({
      id: entry.path,
      title: entry.title,
      summary: entry.summary,
      date: entry.date,
      format: entry.format,
      href: entry.path,
      external: false,
      series: entry.series,
      seriesLabel: entry.seriesLabel,
    })),
    ...external.map((entry) => ({
      id: entry.id,
      title: entry.title,
      summary: entry.summary,
      date: entry.date,
      format: entry.format,
      href: entry.sourceUrl,
      external: true,
      series: undefined,
      seriesLabel: entry.seriesLabel,
    })),
  ].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
  return (
    <div className={styles.writingList}>
      {items.map((item) => (
        <article key={item.id} className={styles.writingRow}>
          <div className={styles.entryMeta}>
            {item.date && (
              <time dateTime={item.date}>{displayContentDate(item.date)}</time>
            )}
            <span>{item.format}</span>
          </div>
          <div>
            <h2>
              {item.external ? (
                <a href={item.href}>{item.title}</a>
              ) : (
                <Link href={item.href}>{item.title}</Link>
              )}
            </h2>
            <p>{item.summary}</p>
            {item.external && (
              <span className={styles.sourceLink}>
                Read the original on Reddit
              </span>
            )}
            {item.series && (
              <Link
                className={styles.seriesLink}
                href={`/writing/log/${item.series}`}
              >
                {item.seriesLabel}
              </Link>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
