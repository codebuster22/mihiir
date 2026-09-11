import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { ComponentType } from 'react';
import type { MDXComponents } from 'mdx/types';
import * as antigravity from '@/content/work/antigravity.mdx';
import * as titusIntelligence from '@/content/work/titus-intelligence.mdx';
import * as pmWs from '@/content/work/pm-ws.mdx';
import * as titus from '@/content/work/titus.mdx';
import * as oracl from '@/content/work/oracl.mdx';
import * as supermigrate from '@/content/work/supermigrate.mdx';
import * as toucan from '@/content/work/toucan.mdx';
import * as bipzy from '@/content/work/bipzy.mdx';
import * as dsafe from '@/content/work/dsafe.mdx';
import * as impactEvaluator from '@/content/work/impact-evaluator.mdx';
import * as simplrEvents from '@/content/work/simplr-events.mdx';
import * as salesLog2 from '@/content/writing/log/sales-engineer-log-2.mdx';
import * as backupBook from '@/content/writing/technical/when-a-backup-order-book-can-take-over.mdx';
import workIndex from '@/content/work/index.json';
import externalWriting from '@/content/writing/external.json';

export type TocEntry = { id: string; label: string };
type Body = ComponentType<{ components?: MDXComponents }>;
type ContentModule = { frontmatter: Record<string, unknown>; default: Body };
export type ContentEntry = {
  kind: 'work' | 'writing';
  slug: string;
  path: string;
  title: string;
  summary: string;
  draft: boolean;
  date?: string;
  sourceUrl?: string;
  Body: Body;
};
export type WorkEntry = ContentEntry & {
  kind: 'work';
  collectionTitle: string;
  collectionSummary: string;
  category: string;
  stage: string;
  role: string;
  relationship: string;
  projectStatus: string;
  topics: string[];
  subtitle?: string;
  toc: TocEntry[];
};
export type WritingEntry = ContentEntry & {
  kind: 'writing';
  format: string;
  formatSegment: string;
  series?: string;
  seriesLabel?: string;
  seriesOrder?: number;
  relatedWork?: string;
};
export type ExternalWritingEntry = (typeof externalWriting)[number];
export type ContentOptions = { includeDrafts?: boolean };

// Every route is registered explicitly. MDX imports may contain custom React figures;
// filenames, source notes and unregistered files never become routes automatically.
const workModules: Record<string, ContentModule> = {
  antigravity,
  'titus-intelligence': titusIntelligence,
  'pm-ws': pmWs,
  titus,
  oracl,
  supermigrate,
  toucan,
  bipzy,
  dsafe,
  'impact-evaluator': impactEvaluator,
  'simplr-events': simplrEvents,
};
const writingModules: Record<string, ContentModule> = {
  'log/sales-engineer-log-2': salesLog2,
  'technical/when-a-backup-order-book-can-take-over': backupBook,
};

function requiredString(
  meta: Record<string, unknown>,
  key: string,
  source: string,
): string {
  if (typeof meta[key] !== 'string' || !meta[key])
    throw new Error(`Missing ${key} in ${source}`);
  return meta[key];
}

function optionalString(
  meta: Record<string, unknown>,
  key: string,
): string | undefined {
  return typeof meta[key] === 'string' ? meta[key] : undefined;
}

function common(
  mdxModule: ContentModule,
  kind: ContentEntry['kind'],
  slug: string,
  route: string,
): ContentEntry {
  const meta = mdxModule.frontmatter;
  if (typeof meta.draft !== 'boolean')
    throw new Error(`Explicit draft flag required in ${route}`);
  const date = optionalString(meta, 'date');
  if (
    date &&
    (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date)))
  ) {
    throw new Error(`Invalid publication date in ${route}`);
  }
  return {
    kind,
    slug,
    path: route,
    Body: mdxModule.default,
    title: requiredString(meta, 'title', route),
    summary: requiredString(meta, 'summary', route),
    draft: meta.draft,
    date,
    sourceUrl: optionalString(meta, 'sourceUrl'),
  };
}

export function isContentPreview(): boolean {
  return (
    process.env.NODE_ENV !== 'production' ||
    process.env.CONTENT_PREVIEW === 'true'
  );
}

export function headingSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function markdownFor(entry: Pick<ContentEntry, 'path'>): string {
  // This function is only called with registry entries, never a user-supplied path.
  const filename = path.join(
    process.cwd(),
    'content',
    `${entry.path.slice(1)}.mdx`,
  );
  return readFileSync(filename, 'utf8')
    .replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '')
    .trim();
}

function getToc(
  meta: Record<string, unknown>,
  entry: ContentEntry,
): TocEntry[] {
  if (Array.isArray(meta.toc))
    return meta.toc.map((item: unknown) => {
      if (
        !item ||
        typeof item !== 'object' ||
        !('id' in item) ||
        !('label' in item) ||
        typeof item.id !== 'string' ||
        typeof item.label !== 'string'
      ) {
        throw new Error(`Invalid contents entry in ${entry.path}`);
      }
      return { id: item.id, label: item.label };
    });
  return Array.from(markdownFor(entry).matchAll(/^## (.+)$/gm), (match) => ({
    id: headingSlug(match[1]),
    label: match[1],
  }));
}

export function getWorkEntries({
  includeDrafts = false,
}: ContentOptions = {}): WorkEntry[] {
  return workIndex
    .map((item) => {
      const mdxModule = workModules[item.slug];
      if (!mdxModule) throw new Error(`Unregistered case: ${item.slug}`);
      const base = common(mdxModule, 'work', item.slug, `/work/${item.slug}`);
      const meta = mdxModule.frontmatter;
      const topics = meta.topics;
      if (
        !Array.isArray(topics) ||
        topics.some((topic) => typeof topic !== 'string')
      )
        throw new Error(`Invalid topics in ${base.path}`);
      return {
        ...base,
        kind: 'work' as const,
        collectionTitle: item.title,
        collectionSummary: item.summary,
        category: item.category,
        stage: item.stage,
        role: requiredString(meta, 'role', base.path),
        relationship: requiredString(meta, 'relationship', base.path),
        projectStatus: requiredString(meta, 'projectStatus', base.path),
        topics: topics as string[],
        subtitle: optionalString(meta, 'subtitle'),
        toc: getToc(meta, base),
      };
    })
    .filter((entry) => includeDrafts || !entry.draft);
}

export function getWorkEntry(
  slug: string,
  options: ContentOptions = {},
): WorkEntry | undefined {
  return getWorkEntries(options).find((entry) => entry.slug === slug);
}

export function getWritingEntries({
  includeDrafts = false,
}: ContentOptions = {}): WritingEntry[] {
  return Object.entries(writingModules)
    .map(([key, mdxModule]) => {
      const meta = mdxModule.frontmatter;
      const formatSegment = requiredString(meta, 'formatSegment', key);
      if (!key.startsWith(`${formatSegment}/`))
        throw new Error(`Format does not match route for ${key}`);
      const base = common(
        mdxModule,
        'writing',
        key.split('/').at(-1)!,
        `/writing/${key}`,
      );
      return {
        ...base,
        kind: 'writing' as const,
        format: requiredString(meta, 'format', key),
        formatSegment,
        series: optionalString(meta, 'series'),
        seriesLabel: optionalString(meta, 'seriesLabel'),
        seriesOrder:
          typeof meta.seriesOrder === 'number' ? meta.seriesOrder : undefined,
        relatedWork: optionalString(meta, 'relatedWork'),
      };
    })
    .filter((entry) => includeDrafts || !entry.draft)
    .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
}

export function getWritingEntry(
  format: string,
  slug: string,
  options: ContentOptions = {},
): WritingEntry | undefined {
  return getWritingEntries(options).find(
    (entry) => entry.formatSegment === format && entry.slug === slug,
  );
}

export function getExternalWriting({
  includeDrafts = false,
}: ContentOptions = {}): ExternalWritingEntry[] {
  return externalWriting.filter((entry) => includeDrafts || !entry.draft);
}

// The source chronology remains distinct from publication on mihiir.com.
export function displayContentDate(date: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T12:00:00Z`));
}

export function getPublishedContent(): ContentEntry[] {
  return [...getWorkEntries(), ...getWritingEntries()];
}

export function getPublishedMarkdown(entry: ContentEntry): string {
  const published = getPublishedContent().find(
    (candidate) => candidate.path === entry.path,
  );
  if (!published)
    throw new Error('Only published, registered content can be exported.');
  return markdownFor(published)
    .replace(/^import .+;?\r?\n/gm, '')
    .replace(/<ContentSection id="[^"]+" title="([^"]+)"[^>]*>/g, '\n## $1\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export const workCategories = [
  'All work',
  'Prediction Markets',
  'Product engineering',
  'Protocols & developer tools',
] as const;
export const writingFormats = [
  { label: 'All writing', segment: '', href: '/writing' },
  { label: 'Essays', segment: 'essays', href: '/writing/essays' },
  {
    label: 'Technical analysis',
    segment: 'technical',
    href: '/writing/technical',
  },
  {
    label: 'Experiments',
    segment: 'experiments',
    href: '/writing/experiments',
  },
  { label: 'Logs', segment: 'log', href: '/writing/log' },
] as const;
