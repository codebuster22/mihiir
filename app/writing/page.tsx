import { pageMetadata } from '@/lib/page-metadata';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { WritingLibrary } from '@/components/content/writing-library';

export const metadata: Metadata = pageMetadata({
  title: 'Writing',
  description:
    'Technical explanations, experiments, personal thoughts and logs from work in progress by Mihiir.',
  alternates: { canonical: '/writing' },
});

export default async function WritingPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string | string[] }>;
}) {
  const type = (await searchParams).type;
  if (type === 'Log') redirect('/writing/log');
  if (type === 'Experiment') redirect('/writing/experiments');
  return <WritingLibrary />;
}
