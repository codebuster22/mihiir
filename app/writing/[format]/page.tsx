import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/page-metadata';
import { notFound } from 'next/navigation';
import { WritingLibrary } from '@/components/content/writing-library';
import { writingFormats } from '@/lib/content';

type Props = { params: Promise<{ format: string }> };
export function generateStaticParams() {
  return writingFormats
    .filter((format) => format.segment)
    .map((format) => ({ format: format.segment }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { format: segment } = await params;
  const format = writingFormats.find((item) => item.segment === segment);
  return format
    ? pageMetadata({
        title: format.label,
        description: `${format.label} by Mihiir. Work, questions and ideas as they develop.`,
        alternates: { canonical: format.href },
      })
    : {};
}
export default async function WritingFormatPage({ params }: Props) {
  const { format } = await params;
  if (!writingFormats.some((item) => item.segment === format && format))
    notFound();
  return <WritingLibrary format={format} />;
}
