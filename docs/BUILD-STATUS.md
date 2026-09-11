# Website implementation — 10 September 2026

The approved Paper direction is implemented in the working Next.js site. The 44-second 1080p HyperFrames demo is rendered from its actual interactions; its source and final MP4 are in `video-demo/`.

## Ready to review

- Home: full photographic hero, two navigation blurs, desktop-centred copy, low mobile copy, photo memory, pause-on-hover logo strip and balanced landscape footer.
- Work: eleven case studies with a responsive category filter.
- Writing: format and series indexes, original Sales Engineer Arc Log 2 and a technical article with a guided interactive diagram. The two Reddit experiments retain external source links until their complete bodies are migrated.
- About, Now and three distinct practice pages; corrected experience timeline and the positive college-to-Web3 story.
- Canonicals, page-specific share metadata, structured data, RSS, sitemap, robots and both LLM text endpoints.
- Consent-gated Clarity integration using the official `@microsoft/clarity` package, with privacy controls.

## Checks completed

- Production builds passed in public and review modes.
- 35 HTTP route/export checks passed in each mode, alongside redirects and image endpoints. Missing pages recover through the custom 404.
- Lint, TypeScript and all 15 consent/discovery/booking tests pass, including checks against the installed Clarity SDK.
- 25 automated accessibility audits reported no violations. Keyboard, touch, focus recovery and reduced motion were also checked; this does not replace testing with real assistive technology.
- Layouts reviewed between 320 and 1440 pixels. Header/footer alignment also accommodates wider screens through a shared maximum width.
- Controlled mobile laboratory LCP improved from 9.648 to 3.820 seconds, with CLS 0 and 70.8% less initial transferred data. These are local throttled observations, not field Core Web Vitals.
- HyperFrames strict checks and complete decoding of all 1320 video frames passed. The master is silent, with sequential transitions that do not superimpose page text.
- The website dependency audit reports zero known vulnerabilities at the time of this build.

## Before public launch

Mihiir has deployed the GitHub-linked site on Vercel. All eleven cases and both local writing entries retain their draft flags for review. Choose the entries to publish before disabling content preview. Social, booking, Chain Labs and Clarity configuration uses the variables in `.env.example`; verify analytics events against the real Clarity dashboard once enabled. The 11 September responsive revision and inline booking calendar are documented in `RESPONSIVE-AUDIT.md`.

No testimonials or unsupported headline metrics were invented. The booking destination is the verified Cal.com page; its outbound click measures intent rather than a completed booking.
