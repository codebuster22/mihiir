import { discoveryHeaders, getLlmsFull } from '@/lib/discovery';

export const dynamic = 'force-static';

export function GET() {
  return new Response(getLlmsFull(), {
    headers: discoveryHeaders('text/plain; charset=utf-8'),
  });
}
