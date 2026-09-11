# Writing and case-study authoring

The site uses local MDX and the shared Paper design system. Article bodies can contain prose, code, tables, video and imported React components. A format or URL does not restrict a piece to a fixed set of fields.

## Files, metadata and the registry

Work bodies live in `content/work/<slug>.mdx`. Writing bodies live in `content/writing/<format>/<slug>.mdx`.

Every file starts with YAML frontmatter. An explicit `draft` boolean, a `title` and a `summary` are required. Work also requires `role`, `topics`, `relationship` and `projectStatus`. Writing requires `format` and `formatSegment`. Publication dates are optional and must be grounded in a real publication record.

Register a local import in `lib/content.ts` after creating a file. The explicit registry keeps unreviewed files and research notes from automatically becoming routes. Work also has a corresponding entry in `content/work/index.json`, which controls its collection title, short summary, category, stage and display order.

`@next/mdx` compiles the files. `remark-frontmatter` and the local YAML-only `scripts/remark-frontmatter-export.mjs` transform export metadata as `frontmatter`; `remark-gfm` supports normal Markdown tables and related extensions. The registry checks required metadata and fails when a draft flag or required field is missing.

## Existing routes

| Content | Route |
| --- | --- |
| Complete work collection | `/work` |
| A filtered collection | `/work?category=Prediction%20Markets` |
| Case study | `/work/antigravity` |
| Writing library | `/writing` |
| Format indexes | `/writing/log`, `/writing/experiments`, `/writing/technical`, `/writing/essays` |
| Sales Engineer Arc introduction | `/writing/log/sales-engineer` |
| Verified log | `/writing/log/sales-engineer-log-2` |
| Technical article | `/writing/technical/when-a-backup-order-book-can-take-over` |

The user’s `sales-engineer-log-5` example establishes the URL shape. It does not establish another entry. Log 2 is the only recovered complete log; all 24 paragraphs preserve the source text and deliberate internal line breaks.

Series entries use `series`, `seriesLabel` and `seriesOrder`. A number at the end of a filename does not establish chronology. Previous and next links are generated only for registered, visible entries in the same series. When adding a new series, provide its introduction route and reuse the writing list and reading shell.

The two experiments in `content/writing/external.json` are links to Mihiir’s original Reddit posts. Their research summaries are not full post bodies. They do not have local article routes yet, and must not enter full-text exports. Recover the original text and intended media before migrating them to local MDX.

## Draft preview and publication

Development includes drafts. For a production review build or video capture, set `CONTENT_PREVIEW=true`. Draft article/case metadata remains `noindex, nofollow`. Without that setting, a production build excludes drafts and a direct request returns 404.

The collections accept `getWorkEntries({includeDrafts: isContentPreview()})` and the corresponding writing API. Search, sitemap, feeds and LLM output must use `getPublishedContent()` instead. That API always excludes drafts, even during preview. `getPublishedMarkdown(entry)` independently verifies that the entry is registered and published before exporting its body.

Before setting `draft: false`:

1. Review the body, attribution and each claim against the source evidence. Preserve the distinction between product ownership, a specific contribution, a grant relationship, a prototype and delivered production work.
2. Check dates and public destinations. Use `YYYY-MM-DD` when that is all the source establishes; do not invent a time or timezone. Never backdate a new technical draft to suggest prior publication.
3. Open the page directly on desktop and mobile. Check the title, author/date/series context, line lengths, diagrams, code/table overflow and the next useful destination.
4. Exercise any controls by keyboard and touch, with reduced motion enabled. Complete prose must remain available without playing an animation.
5. Review the public sitemap and LLM exports after building. Publish only material intended for public reading.

The approved copy is still represented as drafts for this local review. The deployment setting and publication decision are separate from the fact that a route can be previewed.

## Keep the established design

The canonical visual reference is Paper page 7-1, recorded in `docs/VISUAL-DESIGN.md`. Reuse `SiteHeader`, `SiteFooter`, `BookingLink` and the content module styles rather than creating new navigation or CTA language per page.

IBM Plex Sans carries the reading; IBM Plex Mono is reserved for code and real notation. Use the global ink, muted, blue, rule, sky and gutter tokens. Body copy is 20px/31px on desktop and 18px/28px on mobile; the normal reading width is 760px. Technical figures can break out to 1000px where the explanation benefits. The mobile gutter remains 24px. Keep ordinary content on the page surface, without wrapping each paragraph or project in a card.

Use **Recent Highlights**, **Prediction Markets** and **Book a project conversation** consistently. Do not introduce metric tiles, testimonial placeholders or fake article inventory to fill space. The photographs are specific to Home and personal context, not generic covers for every case.

## Rich explanations

Import a component directly in MDX where it supports the prose:

```mdx
import { ContinuityDiagram } from '@/components/content/continuity-diagram';

Explain the relationship in ordinary prose first.

<ContinuityDiagram />
```

`ContinuityDiagram` shows all four states by default. Its optional guided mode provides Previous, Next and Show all steps, keeps the control in place when the mobile layout changes, restores focus and announces the selected state. The graphic is explicitly illustrative; it makes no live-feed or benchmark claim. There is no autoplay. `GameStateDiagram` gives Antigravity its action → contracts → indexed-state explanation without an artificial interactive control.

Normal `##` headings receive readable anchor IDs through `mdx-components.tsx`. For a stable shorter anchor, import `ContentSection`, pass an `id` and optional `title`, then provide matching `toc: [{id, label}]` metadata. Tables have a keyboard-focusable horizontal scroll region. Embedded video should have captions where relevant, an explicit aspect ratio and user-initiated playback.

Keep source ledgers, original measurements, private repository paths and editorial questions outside public content. The author’s actual voice and evidence take precedence over a tidy success story.
