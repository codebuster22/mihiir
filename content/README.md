# Publishing work and writing

The site reads local MDX through `@next/mdx`. Each body can import a React component, add a diagram, embed a video, or use normal Markdown. There is no fixed article layout or required animation slot.

## Register content

1. Create a file under `content/work/` or `content/writing/<format>/`.
2. Add YAML frontmatter with an explicit `draft: true`, `title` and `summary`. Work also requires `role`, `topics`, `relationship` and `projectStatus`. Writing requires `format` and `formatSegment`.
3. Register the MDX import in `lib/content.ts`. Work entries also belong in `content/work/index.json`, which controls collection order, category and the short collection copy.
4. Add a source-backed `date` only when it exists. Use `YYYY-MM-DD` without fabricating a time or timezone. Series entries use `series`, `seriesLabel` and `seriesOrder`; filenames do not determine series order.
5. Inspect the page on desktop and mobile before changing `draft` to `false`.

The frontmatter plugins export metadata as `frontmatter`. Validation runs when the registry is read; missing draft flags or required fields fail instead of silently publishing incomplete metadata.

## Drafts and review

Development shows drafts. A production review build can use `CONTENT_PREVIEW=true`; the case and article routes stay `noindex, nofollow`. A normal production build hides drafts and direct requests return 404.

`getPublishedContent()` always excludes drafts, including in preview. `getPublishedMarkdown()` refuses unpublished entries. Sitemap, feed, search and LLM exports must use those APIs rather than reading arbitrary files from this folder.

The two items in `writing/external.json` are source links to Mihiir's original Reddit experiments. Complete post bodies have not been migrated, so they must not become local article routes or full-text exports based on research summaries.

## Rich explanations

Import a component directly in MDX:

```mdx
import { ContinuityDiagram } from '@/components/content/continuity-diagram';

Explain the decision in ordinary prose first.

<ContinuityDiagram />
```

The continuity example shows the full explanation by default and offers a reader-controlled walkthrough. It is an illustrative sequence, not a recorded feed or performance result. New figures should retain complete readable explanations, keyboard and touch controls, and reduced-motion support.

Normal `##` headings receive matching anchor IDs. A work case can override its contents list with `toc: [{id: "section-id", label: "Short contents label"}]` and use `ContentSection` to give longer headings a stable URL.

Editorial evidence remains under `docs/` and KnowledgeOS. Never copy private repository paths, credentials, unpublished evidence notes or inferred metrics into article copy or public exports.
