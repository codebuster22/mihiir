import type { Metadata } from 'next';
import { ImageLab } from '@/components/image-lab/image-lab';

export const metadata: Metadata = {
  title: 'Image lab — Mihiir',
  description:
    'An adjustable color, glyph and print study using Mihiir’s own photographs.',
  robots: { index: false, follow: false },
};

export default function DesignLabPage() {
  return <ImageLab />;
}
