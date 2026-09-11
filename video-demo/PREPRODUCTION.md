# Mihiir — UX showcase

## Direction

The finished website is the subject. Let viewers see its actual interactions clearly, with spatial camera moves joining the shots. Snow white, graphite, saturated blue, and the chosen ink photographs carry through from the website. Restrained white screen edges provide depth; no fictional app chrome, glass dashboard, neon room, or generic device spin.

The opening reveals the website immediately. The edit moves from personal familiarity to work, from wide desktop to intimate mobile, then from technical depth to the invitation to talk. Readable holds last longer than the camera moves. A silent master needs no synthetic narrator or unlicensed music.

## Planned 44-second edit

| Time | Shot | What the viewer sees |
| --- | --- | --- |
| 0–5 | The new personal home | Real desktop hero arrives at a slight perspective angle and settles front-facing. Mihiir.com appears quietly in the clear outer margin. |
| 5–13 | Small details, personal context | The actual photo-memory disclosure opens. The camera follows into the logo strip, which visibly pauses under the pointer, then resumes. |
| 13–19 | Work with substance | A short traverse through Recent Highlights into the Antigravity case. Land on its architecture figure long enough to see the structure. |
| 19–26 | In your hand | The mobile home comes forward in depth while desktop recedes. Tap Menu, close it, tap the photo memory; preserve the real small-screen layout. |
| 26–34 | Writing that can explain | Front-facing capture of the continuity example. Step through two states and return to all steps. Camera movement pauses while the explanation changes. |
| 34–40 | A natural close | Travel to the actual balanced landscape footer. Hold on the invitation and the mountains. |
| 40–44 | Mihiir.com | Desktop and mobile settle together at small opposing angles, with a plain Mihiir.com wordmark and project-conversation invitation. Final frame holds, never fades to black. |

## Capture prerequisites

- Root agent sends a stable local URL after representative pages and interactions are built.
- Need Home, Antigravity, and the technical writing article routes.
- Capture actual browser footage for interaction shots; record the routes, viewport and action timestamps.
- Capture desktop at 1440px or 1920px as appropriate to the design. Capture mobile at 390px with sufficient pixel density. Use the actual responsive design, not a squeezed desktop capture.
- Ensure fonts and images have loaded; avoid development overlays, loading flashes, hover states left unintentionally, and visible local admin controls.
- Social profile destinations remain unset, as instructed. Show the finished labels only if they are in the built footer. Do not click them or invent handles.

## Quality gate

Verify the composition with HyperFrames check, inspect every scene's settled frame and key transitions, prove perspective and z movement in keyframe snapshots, render locally, then inspect encoded output at beginning/middle/end and each interaction. Record final duration, pixel dimensions and source paths. Provide the MP4, a contact sheet and the reusable composition/preview.

## Toolchain

HyperFrames 0.8.33 is pinned in package scripts. Puppeteer Core 25.10.0 supplies browser capture; GSAP 3.14.2 is copied locally for deterministic composition loading. Chromium 152 and FFmpeg/FFprobe 9.0.1 are available. Optional offline transcription, TTS and generated-music engines are absent and not required for this silent showcase.

The registry was searched for 3D website/device staging. Original ui-3d-reveal, browser-device-stage and multi-device-splay sources are retained under references/registry; the eventual composition adapts their staging mechanism with actual website footage and Mihiir's visual system.
