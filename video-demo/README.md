# Mihiir — UX showcase

A 44-second, 1920 × 1080, 30 fps showcase of the implemented personal site. The film uses real desktop and mobile recordings, shallow 3D camera moves, readable resting frames, and the site's own ink-on-snow photographs. The master is silent.

## Watch

- Final video: `renders/mihiir-ux-showcase.mp4`
- Encoded-video review sheet: `renders/review/contact-sheet.jpg`
- HyperFrames Studio: http://127.0.0.1:3017/#project/video-demo
- Editable root: `index.html`; six scene sources: `compositions/frames/`
- Story and timing: `STORYBOARD.md` and `shots.json`

The video showcases a local implementation preview. It does not establish that the new site or its draft articles are publicly deployed.

## Sequence

| Time | Experience shown |
| --- | --- |
| 0–13 s | Desktop home, photo-memory hover, real logo movement and hover pause |
| 12.6–18.6 s | Antigravity title and architecture figure |
| 18.2–25.2 s | Mobile menu and photo-memory tap, staged alongside desktop |
| 24.8–32.8 s | Working step-through continuity example in a technical article |
| 32.4–38.4 s | Landscape footer and project-conversation invitation |
| 38–44 s | Mihiir.com with desktop and mobile at distinct depths |

Each 0.4-second handoff fades the outgoing scene fully away in 0.2 seconds before bringing the next scene in. Readable pages never crossfade over one another. The camera settles before small controls are demonstrated. Antigravity's title gets a settled hold before the real page scrolls to its figure.

## Reproduce

Use Node 22 or newer, npm, FFmpeg and FFprobe. HyperFrames is pinned to **0.8.33** in the project scripts; GSAP is local and pinned to **3.14.2**. Rendering uses HyperFrames' cached Chromium and needs no HeyGen login. The optional speech and music runtimes are not used.

HyperFrames 0.8.33 is also installed as an exact local development dependency. The renderer is independent of the website deployment. Its dependency audit is saved in `renders/tooling-audit.json`; it reports two moderate entries for `adm-zip` and its HyperFrames dependent, with no available automatic fix. The website's separate dependency audit is clean.

Run from this directory:

```powershell
npm ci
npx --yes hyperframes@0.8.33 browser ensure
npx --yes hyperframes@0.8.33 check --samples 15
npx --yes hyperframes@0.8.33 render --quality high --fps 30 --workers 4 --strict --output renders/mihiir-ux-showcase.mp4
node scripts/verify-render.mjs
npx --yes hyperframes@0.8.33 preview --background --port 3017
```

All final render assets are local, so rendering does not depend on the website server. To recapture a changed site, first serve its development preview at the URL in `captures/plan.json` (currently `http://localhost:3002`). The preview must include the draft case and article used here. Then run:

```powershell
node scripts/capture-ux.mjs captures/plan.json
node scripts/normalize-captures.mjs
node scripts/build-showcase.mjs
```

The Windows capture helper discovers HyperFrames' cached browser; `HF_CAPTURE_BROWSER` can override its path. Recordings include an added demo cursor/tap marker. All page controls and resulting state changes are genuine browser interactions. The capture helper reports page errors and keeps exact action timestamps; the composition generator refuses incomplete or errored captures.

## Verification and sources

- `captures/ux/`: raw recordings, before/after stills, interaction stills and per-shot action logs.
- `captures/ux/capture-manifest.json`: all five recordings, with zero captured page errors.
- `captures/check-revised.json`: full lint, runtime, layout, motion and contrast gate.
- `snapshots-revised/`: handoff-boundary proof and the longer Antigravity title hold.
- `renders/verification.json`: final encoded-video dimensions, duration, codec, frame count and integrity check.
- `.media/manifest.jsonl`: adopted local media ledger.
- `references/registry/`: installed HyperFrames patterns studied during preproduction; they are not runtime dependencies of this composition.

The rendered footage preserves the site's selected photographs, logo assets, typography, copy and interactions. There are no fabricated testimonials, analytics, product metrics, venue data or software screens. No synthetic voice or third-party music was added, and the video has not been uploaded or published externally.
