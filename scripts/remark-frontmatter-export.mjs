import { parse } from 'yaml';
import { define } from 'unist-util-mdx-define';
import { valueToEstree } from 'estree-util-value-to-estree';

// Content uses YAML only. Keep this transform limited to the format we publish.
export default function frontmatterExport() {
  return (tree, file) => {
    const node = tree.children.find((child) => child.type === 'yaml');
    const metadata = node ? parse(node.value, { maxAliasCount: 20 }) : {};
    if (!metadata || Array.isArray(metadata) || typeof metadata !== 'object')
      file.fail('Frontmatter must be a YAML mapping.');
    define(tree, file, { frontmatter: valueToEstree(metadata) });
  };
}
