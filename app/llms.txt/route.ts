import { discoveryHeaders, getLlmsIndex } from '@/lib/discovery';

export const dynamic = 'force-static';

export function GET() {
  return new Response(getLlmsIndex(), {
    headers: discoveryHeaders('text/plain; charset=utf-8'),
  });
}
