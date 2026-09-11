import createMDX from '@next/mdx';
import { fileURLToPath } from 'node:url';

const withMDX = createMDX({
  options: {
    remarkPlugins: [
      'remark-frontmatter',
      fileURLToPath(
        new URL('./scripts/remark-frontmatter-export.mjs', import.meta.url),
      ),
      'remark-gfm',
    ],
  },
});

export default withMDX({
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'mdx'],
  poweredByHeader: false,
  devIndicators: false,
  outputFileTracingIncludes: { '/*': ['./content/**/*'] },
  async redirects() {
    return [
      { source: '/titus', destination: '/work/titus', permanent: true },
      {
        source: '/case-studies/titus',
        destination: '/work/titus',
        permanent: true,
      },
      { source: '/blog', destination: '/writing', permanent: true },
      { source: '/logs', destination: '/writing/log', permanent: true },
      {
        source: '/experiments',
        destination: '/writing/experiments',
        permanent: true,
      },
    ];
  },
});
