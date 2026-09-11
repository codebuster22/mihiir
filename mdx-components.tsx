import { Children, isValidElement, type ReactNode } from 'react';
/* oxlint-disable jsx-a11y/no-noninteractive-tabindex -- Keyboard readers must be able to scroll a wide data table. */
import type { MDXComponents } from 'mdx/types';

function textContent(children: ReactNode): string {
  return Children.toArray(children)
    .map((child) => {
      if (typeof child === 'string' || typeof child === 'number')
        return String(child);
      if (isValidElement<{ children?: ReactNode }>(child))
        return textContent(child.props.children);
      return '';
    })
    .join('');
}

function headingId(children: ReactNode) {
  return textContent(children)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

const components: MDXComponents = {
  h2: ({ children, id, ...props }) => (
    <h2 id={id ?? headingId(children)} {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, id, ...props }) => (
    <h3 id={id ?? headingId(children)} {...props}>
      {children}
    </h3>
  ),
  a: ({ children, href, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  table: (props) => (
    <section
      className="content-table-scroll"
      aria-label="Data table"
      tabIndex={0}
    >
      <table {...props} />
    </section>
  ),
};

export function useMDXComponents(overrides: MDXComponents = {}): MDXComponents {
  return { ...components, ...overrides };
}
