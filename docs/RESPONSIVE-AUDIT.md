# Responsive layout audit — 11 September 2026

## Follow-up after testing the user's live browser

The live browser had no computed `--page-width` value. This invalidated the hero's calculated padding and placed the copy at x=0. The hero now has a self-contained centered content container and direct responsive gutters. The navigation is a centered, 1120px maximum-width bar, and remaining shared-width uses have fallbacks. The audit now requires a positive hero gutter, bounded centered navigation, and repeats the wide layout with the shared width explicitly unset.

The photographs now use expanded scenery and a finer colored glyph treatment. See `ARTWORK.md` for source provenance, exact generation prompts, dimensions and reproduction. The follow-up matrix includes 270 route/viewport checks, including the missing-width regression. The original audit below records the first responsiveness pass.

The deployed home page put its hero, logo strip and landscape footer inside a 1440px artboard. At a 3440px viewport this left large white bands around the photographs. The hero also stopped growing at 903px tall. These outer limits have been removed: Home's imagery and logo strip are full width, while normal reading content uses a separate centered container. No page scaling or global overflow masking is used to make the checks pass.

## Corrections

- Hero: minimum full viewport height using `svh`, with normal content flow so small or short viewports can grow vertically. Desktop copy remains centered vertically; mobile copy stays low. The photo hover target is calculated from the actual rendered image crop.
- Footer: full-width mountain panorama and continuous fade. A centered, light Cal.com calendar sits between the project invitation and site/social links.
- Logos: restored all twelve companies listed by the Chain Labs source: Curve Labs, Movement Labs, Safe Global, Protocol Labs, Hyperlane, Toucan Earth, Giza, Arbitrum, Komet Wallet, Zo World, Antigravity and Bipzy. Preserved logo aspect ratios and internal detail. The duplicated loop covers ultrawide screens; touch/reduced-motion visitors get a single scrollable set.
- Antigravity diagram: stacks according to the width of its article column, correcting narrow nodes beside the tablet sidebar.
- Case-study navigation: a bounded scrolling sidebar keeps long contents lists usable on short landscape screens.

## Verification

The optimized Next.js review build passed 269 route/viewport checks. The 17 viewport sizes were 320×568, 360×800, 390×844, 430×932, 600×960, 760×1024, 768×1024, 801×600, 820×1180, 844×390, 1024×768, 1280×720, 1440×900, 1920×1080, 2560×1440, 3440×1340 and 3840×2160.

The matrix covers Home, Work, case studies, Writing collections and both local article templates, About, Now, all three practice pages and Privacy. Every case study and the remaining writing format indexes also received 320px/801px checks. No horizontal page overflow, offscreen heading or page JavaScript error was found. Hero and footer widths match the viewport, and the hero meets or exceeds its height.

Keyboard/mobile menu dismissal and focus return, photo-note dismissal, logo hover/focus pause, touch browsing and reduced-motion behavior were checked. Screenshots were reviewed at mobile, regular desktop and ultrawide sizes, including the complete footer and the narrow tablet diagram.

The real Cal calendar displayed available dates and times at desktop/mobile widths. No Cal network requests occurred before approaching the footer. A blocked embed script led to the direct booking fallback without collapsing its reserved space. The iframe has a descriptive title, unavailable hidden content remains inert, and the direct booking link is also present without JavaScript. No booking was submitted. Parent-page custom analytics does not claim a completed booking from calendar visibility or a link click.

Build, lint, 15 unit tests and 35 HTTP route/export checks passed. Browser layout checks used headless Chromium; they are not a claim of certification across every browser or physical device. Raw reports and screenshots remain in the local `docs/qa/responsive/` folder.

To reproduce against an optimized review build, run `node scripts/audit-responsive.mjs`. The default target is localhost:3003; `SITE_QA_URL` and `SITE_QA_CHROME` can override the target/browser. The browser dependency lives in the independent video project, as with the existing browser QA scripts.
