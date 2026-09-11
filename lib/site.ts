export const site = {
  name: 'Mihiir',
  fullName: 'Mihir Parmar',
  url: 'https://mihiir.com',
  description:
    'I build products and systems for Web3 and Prediction Markets. Explore my work, writing and the thinking behind it.',
  booking:
    process.env.NEXT_PUBLIC_BOOKING_URL?.trim() ||
    'https://cal.com/mihiir/30min',
  studio:
    process.env.NEXT_PUBLIC_CHAIN_LABS_URL?.trim() || 'https://chainlabs.in',
};

export const navigation = [
  { href: '/work', label: 'Work' },
  { href: '/writing', label: 'Writing' },
  { href: '/about', label: 'About' },
];

export const footerNavigation = [...navigation, { href: '/now', label: 'Now' }];
// Direct NEXT_PUBLIC_ reads keep server markup and browser navigation in sync.
// Unconfigured profiles remain non-interactive labels in the footer.
export const socials: { label: string; href: string | null }[] = [
  { label: 'X', href: process.env.NEXT_PUBLIC_X_URL?.trim() || null },
  {
    label: 'LinkedIn',
    href: process.env.NEXT_PUBLIC_LINKEDIN_URL?.trim() || null,
  },
  { label: 'GitHub', href: process.env.NEXT_PUBLIC_GITHUB_URL?.trim() || null },
  {
    label: 'YouTube',
    href: process.env.NEXT_PUBLIC_YOUTUBE_URL?.trim() || null,
  },
  { label: 'Reddit', href: process.env.NEXT_PUBLIC_REDDIT_URL?.trim() || null },
];
export const isIndexable =
  process.env.NEXT_PUBLIC_NOINDEX === 'false' &&
  process.env.VERCEL_ENV !== 'preview';

export function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(date + 'T12:00:00Z'));
}
