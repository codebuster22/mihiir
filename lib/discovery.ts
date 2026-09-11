import {
  getPublishedContent,
  getPublishedMarkdown,
  type ContentEntry,
} from '@/lib/content';
import { isIndexable, site } from '@/lib/site';

type CorePage = {
  path: string;
  title: string;
  summary: string;
  paragraphs: string[];
};

// These are approved public page summaries, not excerpts from unpublished cases.
const corePages: CorePage[] = [
  {
    path: '/',
    title: 'Mihiir',
    summary: 'Products and systems for Web3 and Prediction Markets.',
    paragraphs: [
      'I build products and systems for Web3 and Prediction Markets.',
      'I’m Mihiir. I take responsibility for getting the product built: working through the architecture, writing the core systems and leading the engineers. I can own the whole build or join your team to deliver a specific part.',
    ],
  },
  {
    path: '/about',
    title: 'About Mihiir',
    summary:
      'My story, professional experience and the two chapters of running Chain Labs.',
    paragraphs: [
      'In college, I was into travel vlogging, photography and mountaineering. In 2017, I was 18, on the Sar Pass trek, and still figuring out what I wanted to do next.',
      'I graduated the year COVID hit, and around that time I discovered Web3. I fell in love with the freedom this technology could bring.',
      'At Curve Labs, I worked as a smart-contract engineer from 2021 to 2023, on DAO and DeFi infrastructure. In 2023, I worked at Movement Labs as a technical researcher.',
      'I started working through Chain Labs in 2024, then shut the studio down to work with Zero to Infinity. From January to August 2025, my role there was Prediction Market and AI Engineer.',
      'I restarted Chain Labs in September 2025. I run it today, focused on AI agents and applied AI. My own work in Web3 and Prediction Markets continues alongside it.',
    ],
  },
  {
    path: '/now',
    title: 'Now',
    summary:
      'Current work on Prediction Markets systems, Chain Labs and learning sales.',
    paragraphs: [
      'I’m spending a lot of time on Prediction Markets: historical data, order books and the systems that connect a signal to an order.',
      'I run Chain Labs, focused on AI agents and applied AI.',
      'I’m learning the sales side of running a company and documenting it in my Sales Engineer Arc. I write about what I’m trying, the mistakes and what I change my mind about along the way.',
    ],
  },
  {
    path: '/work',
    title: 'Work',
    summary:
      'Published case studies explaining the problem, my responsibility and the engineering decisions.',
    paragraphs: [
      'The work collection brings together case studies across Prediction Markets, product engineering, protocols and developer tools. Each published case explains my own responsibility and the project’s delivery context.',
    ],
  },
  {
    path: '/writing',
    title: 'Writing',
    summary: 'Essays, technical analysis, experiments and logs.',
    paragraphs: [
      'I write about what I’m building and learning, from experiments in Prediction Markets to the daily work of getting better at sales. These are the tests, mistakes and questions along the way.',
    ],
  },
  {
    path: '/prediction-market-development',
    title: 'Prediction Markets development',
    summary:
      'Market data, trading infrastructure and smart contracts for Prediction Markets teams.',
    paragraphs: [
      'I build the systems behind products for Prediction Markets.',
      'I build market data, trading infrastructure and smart contracts for teams building aggregators, analytics tools and new products for Prediction Markets. I work with your engineers to turn product requirements into systems they can build on and operate.',
      'A historical indexer needs to explain what happened to a position. A live feed needs to tell its readers when their view is stale. An execution service needs to know which actions it can safely take next. I can design and build those parts with your team, including how they connect to the contracts and the application.',
      'We start with what needs to ship, the system you already have and where your team needs help. Together, we define the part I’ll own, how it connects to the rest of the product and how we’ll check that it works.',
    ],
  },
  {
    path: '/web3-product-engineering',
    title: 'Web3 product engineering',
    summary:
      'Product ownership, architecture, implementation and coordinated engineering delivery.',
    paragraphs: [
      'I help Web3 teams turn product requirements into architecture and working software. I can own the build, write the core systems and lead the engineers bringing it together.',
      'A user’s action might cross a wallet, a contract, an indexer and an application before they see a result. Those parts need to agree on what happened, what comes next and how to recover when something goes wrong.',
      'We begin with the product behavior, the constraints and the people already building it. I turn that into a scope we can work through: what I own, what your team owns and where the pieces meet. Architecture and delivery planning happen together, with decisions explained as the work progresses.',
    ],
  },
  {
    path: '/solidity-engineer',
    title: 'Solidity engineering',
    summary:
      'Contract architecture, implementation, tests and deployment tooling.',
    paragraphs: [
      'I turn product rules into Solidity contracts you can build on.',
      'I work on contract architecture, implementation and the tests and tooling around it. My work spans token launches, cross-chain messaging, DeFi accounting and the contract systems behind Web3 products.',
      'We start with the product rules and existing code, including the assumptions around permissions, accounting and state changes. Together, we define the contract scope, its integration points and how we’ll validate it. I can work alongside your engineers and reviewers, carrying findings through fixes and regression tests.',
    ],
  },
  {
    path: '/privacy',
    title: 'Privacy',
    summary:
      'Optional Clarity analytics, browser preferences and links to other services.',
    paragraphs: [
      'You can read this site without allowing analytics. Microsoft Clarity, when configured on the production site, loads only after explicit acceptance. Analytics storage is optional and advertising storage remains denied.',
      'Analytics preferences in the footer can change the choice when analytics is available. Withdrawing permission reloads the page without Clarity. The homepage calendar loads from Cal.com as you approach the footer; Cal.com handles its availability and booking details under its own privacy practices. The booking page can also be opened separately.',
    ],
  },
];

export function publicDiscoveryEnabled() {
  return isIndexable && process.env.CONTENT_PREVIEW !== 'true';
}

export function publicUrl(path: string) {
  return new URL(path, site.url).toString();
}

function publishedEntries(): ContentEntry[] {
  // A second explicit guard keeps exports safe if the registry API ever changes.
  return getPublishedContent().filter((entry) => entry.draft === false);
}

export function getDiscoveryPaths(): string[] {
  if (!publicDiscoveryEnabled()) return [];
  const paths = new Set(corePages.map((page) => page.path));
  for (const entry of publishedEntries()) {
    paths.add(entry.path);
    if (entry.kind === 'writing') {
      const formatPath = entry.path.split('/').slice(0, 3).join('/');
      paths.add(formatPath);
      if ('series' in entry && entry.series === 'sales-engineer') {
        paths.add('/writing/log/sales-engineer');
      }
    }
  }
  return [...paths];
}

function markdownLabel(text: string) {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/\r?\n/g, ' ');
}

function entryLink(entry: Pick<ContentEntry, 'path' | 'title' | 'summary'>) {
  return `- [${markdownLabel(entry.title)}](${publicUrl(entry.path)}): ${entry.summary.replace(/\r?\n/g, ' ')}`;
}

export function getLlmsIndex(): string {
  if (!publicDiscoveryEnabled())
    return '# Mihiir\n\nPublic content exports are disabled on this preview.\n';
  const entries = publishedEntries();
  const work = entries.filter((entry) => entry.kind === 'work');
  const writing = entries.filter((entry) => entry.kind === 'writing');
  return (
    [
      '# Mihiir',
      '> I build products and systems for Web3 and Prediction Markets. This is my personal site: work, writing, experience and current priorities.',
      'Chain Labs is my company, focused on AI agents and applied AI. Project-conversation links open a 30-minute call to discuss what you’re building and where I could help.',
      '## Start here',
      corePages
        .filter((page) => !['/privacy'].includes(page.path))
        .map(entryLink)
        .join('\n'),
      ...(work.length
        ? ['## Published case studies', work.map(entryLink).join('\n')]
        : []),
      ...(writing.length
        ? ['## Published writing', writing.map(entryLink).join('\n')]
        : []),
      '## Optional',
      `- [Expanded public text](${publicUrl('/llms-full.txt')}): Core-page summaries and complete published case-study and writing text.\n- [Writing feed](${publicUrl('/feed.xml')}): Published writing in RSS format.\n- [Privacy](${publicUrl('/privacy')}): Analytics choices and external services.\n- [Chain Labs](${site.studio}): AI agents and applied AI.\n- [Book a project conversation](${site.booking}): A 30-minute discussion about the project and fit.`,
    ].join('\n\n') + '\n'
  );
}

export function getLlmsFull(): string {
  if (!publicDiscoveryEnabled())
    return '# Mihiir\n\nPublic content exports are disabled on this preview.\n';
  const core = corePages.map((page) =>
    [
      `## ${page.title}`,
      `Source: ${publicUrl(page.path)}`,
      page.paragraphs.join('\n\n'),
    ].join('\n\n'),
  );
  const content = publishedEntries().map((entry) =>
    [
      `## ${entry.title}`,
      `Source: ${publicUrl(entry.path)}`,
      entry.date ? `Date: ${entry.date}` : null,
      entry.sourceUrl ? `Originally shared at: ${entry.sourceUrl}` : null,
      entry.summary,
      getPublishedMarkdown(entry),
    ]
      .filter(Boolean)
      .join('\n\n'),
  );
  return (
    [
      '# Mihiir',
      '> Products and systems for Web3 and Prediction Markets.',
      'This file contains summaries of core pages, followed by the full text of published case studies and writing. Source links point to the pages with their visual explanations and current context.',
      ...core,
      ...content,
      '## Project conversations',
      `In a 30-minute call, we’ll talk through what you’re building, where you need help and the part I could take on.\n\n${site.booking}`,
    ].join('\n\n') + '\n'
  );
}

function xml(text: string) {
  return text.replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&apos;',
      })[character]!,
  );
}

export function getWritingFeed(): string {
  const writing = publicDiscoveryEnabled()
    ? publishedEntries().filter((entry) => entry.kind === 'writing')
    : [];
  const items = writing
    .map((entry) => {
      const url = xml(publicUrl(entry.path));
      const date = entry.date
        ? `<pubDate>${new Date(`${entry.date}T00:00:00Z`).toUTCString()}</pubDate>`
        : '';
      return `<item><title>${xml(entry.title)}</title><link>${url}</link><guid isPermaLink="true">${url}</guid><description>${xml(entry.summary)}</description>${date}</item>`;
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>Mihiir’s writing</title><link>${publicUrl('/writing')}</link><description>Essays, technical analysis, experiments and logs by Mihiir.</description><language>en</language><atom:link href="${publicUrl('/feed.xml')}" rel="self" type="application/rss+xml"/>${items ? `\n${items}\n` : ''}</channel></rss>\n`;
}

export function discoveryHeaders(contentType: string): HeadersInit {
  return {
    'Content-Type': contentType,
    'X-Content-Type-Options': 'nosniff',
    'X-Robots-Tag': publicDiscoveryEnabled()
      ? 'index, follow'
      : 'noindex, nofollow',
    'Cache-Control': publicDiscoveryEnabled()
      ? 'public, max-age=0, must-revalidate'
      : 'private, no-store',
  };
}
