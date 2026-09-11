# Photograph framing and glyph treatment

## September 2026 revision

The wide hero uses an expanded version of Mihiir's Sar Pass photograph. The footer uses an expanded version of his mountain panorama. The image-generation tool extended the scenery; these are interpretations of the original photographs, not untouched documentary originals. Source originals remain in the adjacent ImageAssets archive. The mobile framing retains the earlier expanded portrait master.

The new generated photographic masters are 2043×770 (hero) and 2048×768 (footer). The glyph layer is rendered separately at 3840px width for desktop delivery and 1536px for mobile. This higher delivery resolution preserves glyph edges; it is not a claim that the model generated native 4K photographic detail.

Versioned source files live in `public/images/*-expanded-v2.webp`. Delivery files live in `public/artwork/*-glyphs-v2.avif` and `.webp`. Earlier artwork remains available for comparison. The local PNG masters are in `docs/design/artwork-v2`.

## Reproduce and tune

`lib/image-lab.ts` defines the current glyph defaults: size 0, grid noise 3, softness 12, grain 2, color 100 and contrast 100. Hero/mobile filter amount is 55; panorama is 45. These replace the much heavier CMYK print treatment on the site. The old print presets are retained in the image lab.

Use `/design-lab` to adjust the images, compare the original with the treatment, copy settings or export a PNG. Run `node scripts/render-glyph-artwork.mjs` to regenerate the site's AVIF/WebP files from the current settings. Glyph exports are rendered from the source at delivery resolution rather than enlarged from the small interactive preview.

## Image generation prompts

Mode: built-in image-generation tool, editing the original local photographs.

### Hero

Edit target: the attached original personal photograph from a snowy Himalayan trek. Outpaint this photograph into a very wide 8:3 landscape, ideally 3840 x 1440, for a full-viewport ultrawide website hero. EXPAND the scenery horizontally; do not stretch or crop the existing photograph. Retain the original photograph as the central-right part of a broader field of view. Preserve the same real person exactly: his face, size relative to the original rocks, bare torso, navy trousers, arms spread upward, midair jumping pose, and position on the original snow slope. Preserve the existing rocks, misty peaks, perspective, overcast light and cool natural photographic colors. Extend believable snow slopes, uneven dark rock outcrops and subtle mist into the additional left and right canvas, with more extension on the left. In the resulting wide composition the person should be around 76% across and 70% down, modest in scale, with ample open snowy landscape to his left. Preserve the upper mountain ridge and foreground; do not zoom into the source. Natural quiet documentary photograph, original detail and soft overcast snow, not glossy fantasy scenery. No new people, no objects, no huge new peaks, no text, no graphics, no filter, no noise, no grain, no glyphs. This is an expanded photographic master; an ASCII treatment will be applied separately in the website.

### Footer

Edit target: the attached original mountain panorama photograph. Make an expanded photographic master for the footer of a spacious light personal website. Target a wide 8:3 landscape, ideally 3840 x 1440. Preserve the entire existing mountain range, valley, cloud shapes, direction of sun rays, rich but natural blue sky, and the original perspective. Do not stretch the panorama or magnify/crop its mountains. Outpaint mostly extra sky above the existing image and a little natural continuation of dark ridges below, so this original wide photograph gains vertical breathing room. New sky should match existing high altitude soft cloud light and transition from the original clouds naturally. Leave the original scene recognisable, no replaced mountain ranges, no buildings, people, text, typography, UI, noise, grain or graphic overlays. Faithful documentary photography, no surreal fantasy or cinematic exaggeration. This is a clean master; a subtle colored glyph treatment will be applied separately.
