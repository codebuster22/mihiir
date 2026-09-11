# Mihiir

The personal website for mihiir.com, built from the approved Paper design. Next.js, React and local MDX; intended for Vercel through GitHub.

## Run locally

Use Node.js 22.13 or newer.

```sh
npm ci
npm run dev -- --port 3002
```

Open http://localhost:3002. Development shows the case-study and writing drafts. The image tuning workspace remains at `/design-lab` and is always noindex.

```sh
npm run lint
npm run typecheck
npm test
npm run build
```

The lint command covers the active website, content, scripts and tests. The unused UI scaffold and the independent HyperFrames composition are outside that application lint scope. The video has its own validation workflow.

## Review and launch

| Setting | Review deployment | Public production |
| --- | --- | --- |
| `CONTENT_PREVIEW` | `true` | `false` or unset |
| `NEXT_PUBLIC_NOINDEX` | `true` | `false` |
| `NEXT_PUBLIC_ANALYTICS_ENABLED` | `false` | `true` after Clarity setup |
| `NEXT_PUBLIC_CLARITY_PROJECT_ID` | Empty | Public ID from the new mihiir.com Clarity project |

Set these before building and redeploy after changes. Vercel preview deployments remain noindex. Review mode makes drafts readable by visitors who can access that deployment; it is not a password or access-control system. Vercel Deployment Protection can limit access to a review URL.

All 11 case studies and the two local writing entries are currently retained as drafts for review. In normal production they return 404 until their MDX frontmatter is changed to `draft: false`. Review the body and claims before publishing each piece. The homepage and practice pages only link to content available in the current mode.

The source repository is [codebuster22/mihiir](https://github.com/codebuster22/mihiir). Import it into Vercel as a **Next.js** project, select the `main` branch, and use the repository root as its root directory. Use Node.js 22.x, the default `npm run build` command and the default output directory. `vercel.json` already declares Next.js. Configure the variables above in the appropriate Vercel environment, then connect mihiir.com. No deployment has been performed by this build.

The repository includes the website, prepared public assets, approved image masters, and the independent demo source. Local environment values, internal research, review screenshots, raw video captures and final video renders remain outside Git. A fresh clone can build the site without those local files.

## Content and destinations

- [Authoring guide](docs/AUTHORING.md): add MDX, series, case studies and custom interactive explanations while keeping the shared design.
- Edit `.env.local` for local links, or set the same variables in Vercel’s Project Settings → Environment Variables. `.env.example` lists the available settings. Restart the local server after edits; on Vercel, redeploy because these public values are included at build time.
- `NEXT_PUBLIC_BOOKING_URL` controls every booking CTA; `NEXT_PUBLIC_CHAIN_LABS_URL` controls the studio links, structured data and public LLM exports. If either is blank, its existing verified destination is used.
- `NEXT_PUBLIC_X_URL`, `NEXT_PUBLIC_LINKEDIN_URL`, `NEXT_PUBLIC_GITHUB_URL`, `NEXT_PUBLIC_YOUTUBE_URL` and `NEXT_PUBLIC_REDDIT_URL` control the footer profiles. Use full `https://` URLs. Empty social entries render as text, not broken links. `.env.local` is ignored by Git; set deployment values separately in Vercel.
- Booking defaults to the verified `https://cal.com/mihiir/30min`.
- [Analytics](docs/ANALYTICS.md): create the Clarity project, enable analytics-only consent, then verify production events. No analytics requests occur before acceptance.
- `/sitemap.xml`, `/robots.txt`, `/feed.xml`, `/llms.txt` and `/llms-full.txt` are generated. Review builds expose no discovery inventory. Public output includes core pages and registered, published content only. LLM files are a convenience for readers and tools, not a promise of search or answer-engine ranking.
- Canonical URLs, page-specific share metadata, a social preview image, Person/WebSite data and article structured data are included.

## Images and interaction

The approved print exports remain in `docs/design`. Browser delivery uses AVIF quality 85 with full chroma and the lossless WebP reference as a fallback; this preserves the selected framing and filter treatment, but AVIF is not pixel-identical. Footer artwork loads near its viewport instead of competing with the hero. `scripts/prepare-site-assets.mjs` regenerates delivery assets from the approved masters.

The original Plex fonts are delivered as WOFF2. Their glyphs and measured text geometry are unchanged; `scripts/prepare-fonts.py` can regenerate them using Python FontTools and Brotli. Neither Python nor the video runtime is required to build or deploy the website because the generated font/image assets are included.

The hero photo reveals its note on pointer hover, keyboard focus or a tap on the altitude pill. Escape, outside click and its Close control dismiss it. Mobile text stays low in the hero. The logo strip pauses on hover, focus and when offscreen; touch and reduced-motion visitors get a static, horizontally browsable strip. The mobile menu uses a native modal dialog. Technical writing includes a keyboard-accessible guided diagram with a complete static reading state.

Home's hero and landscape footer span the full viewport width. The hero fills at least the viewport height and can grow to accommodate content on small or short screens. Reading sections use their own centered containers rather than constraining the photographs. All twelve companies from the Chain Labs source are registered in `lib/company-logos.ts`.

The footer's official Cal.com embed loads only near the viewport, using `NEXT_PUBLIC_BOOKING_URL`; no additional environment variables or API key are required. A non-Cal booking URL uses the external CTA instead. Calendar failures and disabled JavaScript retain a direct booking link. [Responsive audit](docs/RESPONSIVE-AUDIT.md) covers the desktop/mobile matrix and these interactions.

## Website demo

`video-demo/` is a separate HyperFrames project. Its 1080p demo uses recordings of the actual website, local Plex fonts and 3D camera movement. See its README for playback and re-rendering. Website builds do not require the video dependencies.

## Validation records

These reports and screenshots remain in the original local workspace rather than the public repository:

- `docs/qa/accessibility.md`: automated checks and keyboard/touch verification.
- `docs/qa/PERFORMANCE.md`: explicitly throttled local measurements, not field performance.
- `docs/qa/production-review-routes.json`: route, export, redirect and asset checks.
- `artifacts/content-qa/`: desktop/mobile case-study and writing review images.

The HTTP integration check can be run against a built review server with `npm run check:site`. It defaults to localhost:3003; set `SITE_QA_URL` to override and `SITE_QA_PREVIEW=false` to test the public build with the current unpublished draft inventory. Browser inspection scripts also accept `SITE_QA_CHROME` and use the Chromium installed for the demo; their Puppeteer dependency lives in `video-demo`.
