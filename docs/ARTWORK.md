# Photograph framing and glyph treatment

## September 2026 revision

The wide hero uses an expanded version of Mihiir's Sar Pass photograph. The footer uses an expanded version of his mountain panorama. The image-generation tool extended the scenery; these are interpretations of the original photographs, not untouched documentary originals. Source originals remain in the adjacent ImageAssets archive. The mobile framing retains the earlier expanded portrait master.

The generated photographic masters are 2043×770 (hero) and 2048×768 (footer). The final print layer is rendered separately at 3840px width for desktop delivery and 1536px for mobile. This higher delivery resolution preserves the print texture; it is not a claim that the model generated native 4K photographic detail.

Versioned source files live in `public/images/*-expanded-v2.webp`. Hero delivery files are `public/artwork/sar-pass-wide-print-v3.avif` / `.webp` and `sar-pass-mobile-print-v3.avif` / `.webp`. Earlier artwork remains available for comparison. Photographic masters are in `docs/design/artwork-v2`; final print exports and their settings are in `docs/design/artwork-v3`.

## Final treatment and reproduction

Mihiir's final hero/mobile choice on 11 September is **Print / ink**: size 5, grid noise 20, softness 100, grain 20, color 100, filter amount 50 and contrast 100. The footer uses the unfiltered expanded panorama at `/images/panorama-expanded-v2.webp`, with its existing layout fade. These supersede the preceding glyph selection.

Run `node scripts/render-print-artwork.mjs` to reproduce the final hero AVIF/WebP files. It reads `chosenPrintSettings.mountaineering` from `lib/image-lab.ts`, renders the installed Paper CMYK shader with the same uniforms as the approved preview, and blends it 50% over the unfiltered source. Rendering uses the full proportional image at delivery resolution. The footer is served directly from its source WebP.

The `/design-lab` route and the floating homepage image controls have been removed at Mihiir's request. The website serves the final static artwork without a shader or image-editing UI. The shader package is a development dependency for reproducible exports only.

## Image generation prompts

Mode: built-in image-generation tool, editing the original local photographs.

### Hero

Edit target: the attached original personal photograph from a snowy Himalayan trek. Outpaint this photograph into a very wide 8:3 landscape, ideally 3840 x 1440, for a full-viewport ultrawide website hero. EXPAND the scenery horizontally; do not stretch or crop the existing photograph. Retain the original photograph as the central-right part of a broader field of view. Preserve the same real person exactly: his face, size relative to the original rocks, bare torso, navy trousers, arms spread upward, midair jumping pose, and position on the original snow slope. Preserve the existing rocks, misty peaks, perspective, overcast light and cool natural photographic colors. Extend believable snow slopes, uneven dark rock outcrops and subtle mist into the additional left and right canvas, with more extension on the left. In the resulting wide composition the person should be around 76% across and 70% down, modest in scale, with ample open snowy landscape to his left. Preserve the upper mountain ridge and foreground; do not zoom into the source. Natural quiet documentary photograph, original detail and soft overcast snow, not glossy fantasy scenery. No new people, no objects, no huge new peaks, no text, no graphics, no filter, no noise, no grain, no glyphs. This is an expanded photographic master; an ASCII treatment will be applied separately in the website.

### Footer

Edit target: the attached original mountain panorama photograph. Make an expanded photographic master for the footer of a spacious light personal website. Target a wide 8:3 landscape, ideally 3840 x 1440. Preserve the entire existing mountain range, valley, cloud shapes, direction of sun rays, rich but natural blue sky, and the original perspective. Do not stretch the panorama or magnify/crop its mountains. Outpaint mostly extra sky above the existing image and a little natural continuation of dark ridges below, so this original wide photograph gains vertical breathing room. New sky should match existing high altitude soft cloud light and transition from the original clouds naturally. Leave the original scene recognisable, no replaced mountain ranges, no buildings, people, text, typography, UI, noise, grain or graphic overlays. Faithful documentary photography, no surreal fantasy or cinematic exaggeration. This is a clean master; a subtle colored glyph treatment will be applied separately.
