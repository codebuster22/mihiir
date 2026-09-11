import { discoveryHeaders, getWritingFeed } from '@/lib/discovery';

export const dynamic = 'force-static';

export function GET() {
  return new Response(getWritingFeed(), {
    headers: discoveryHeaders('application/rss+xml; charset=utf-8'),
  });
}
