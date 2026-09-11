import type { ReactNode } from 'react';
import { site } from '@/lib/site';
type Placement = 'header' | 'home' | 'case_study' | 'footer' | 'practice';
export function BookingLink({
  placement = 'home',
  children,
  className = 'button',
}: {
  placement?: Placement;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <a
      href={site.booking}
      target="_blank"
      rel="noopener noreferrer"
      referrerPolicy="no-referrer"
      className={className}
      data-analytics-event={`booking_open_${placement}`}
    >
      {children ?? 'Book a project conversation'}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
