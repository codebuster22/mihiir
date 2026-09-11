declare module '*.mdx' {
  import type { ComponentType } from 'react';
  import type { MDXComponents } from 'mdx/types';
  const Component: ComponentType<{ components?: MDXComponents }>;
  export const frontmatter: Record<string, unknown>;
  export default Component;
}
