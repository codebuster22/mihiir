'use client';

import { useEffect, useMemo, useState, type Ref } from 'react';
import { ShaderMount } from '@paper-design/shaders-react';
import type { PaperShaderElement, ShaderMountUniforms } from '@paper-design/shaders';
import type { FilterSettings } from '@/lib/image-lab';

const glyphs = ' .,:;=+xX#%@';
const atlasCell = 128;
const atlasStep = 40;
const atlasSpan = atlasCell / atlasStep;
const mipmaps = ['u_glyphAtlas'];
const webGlOptions: WebGLContextAttributes = { preserveDrawingBuffer: true, alpha: false };
let atlasPromise: Promise<HTMLImageElement> | undefined;

// A single real font atlas is shared by every photograph and every slider position.
function loadGlyphAtlas() {
  atlasPromise ??= (async () => {
    const canvas = document.createElement('canvas');
    canvas.width = atlasCell * glyphs.length;
    canvas.height = atlasCell;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('The glyph texture could not be created.');
    context.font = `bold ${atlasStep * 1.85}px "Courier New", monospace`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = '#ffffff';
    for (let index = 0; index < glyphs.length; index++) {
      context.fillText(glyphs[index], (index + .5) * atlasCell, atlasCell / 2);
    }
    const atlas = new Image();
    atlas.src = canvas.toDataURL('image/png');
    await atlas.decode();
    return atlas;
  })();
  return atlasPromise;
}

const fragmentShader = `#version 300 es
precision mediump float;
precision highp int;

uniform vec2 u_resolution;
uniform sampler2D u_image;
uniform sampler2D u_glyphAtlas;
uniform vec2 u_sourceSize;
uniform float u_step;
uniform float u_gridNoise;
uniform float u_softness;
uniform float u_grain;
uniform float u_saturation;
uniform float u_contrast;
out vec4 fragColor;

const float GLYPH_COUNT = ${glyphs.length.toFixed(1)};
const float ATLAS_CELL = ${atlasCell.toFixed(1)};
const float ATLAS_SPAN = ${atlasSpan.toFixed(1)};
const vec3 PAPER = vec3(252., 253., 251.) / 255.;

// The CPU renderer's integer hash, so grid jitter stays fixed while adjusting a look.
float stableRandom(uvec2 cell) {
  uint n = (cell.x + 1u) * 374761393u ^ (cell.y + 1u) * 668265263u;
  n = (n ^ (n >> 13u)) * 1274126177u;
  return float(n ^ (n >> 16u)) / 4294967295.;
}

vec3 sourceColor(vec2 uv) {
  vec3 color = texture(u_image, clamp(uv, vec2(0.), vec2(1.))).rgb;
  float gray = dot(color, vec3(.213, .715, .072));
  color = clamp(mix(vec3(gray), color, u_saturation), 0., 1.);
  return clamp((color - .5) * u_contrast + .5, 0., 1.);
}

float atlasAlpha(vec2 point, float glyph, float lod) {
  if (any(lessThan(point, vec2(0.))) || any(greaterThan(point, vec2(1.)))) return 0.;
  return textureLod(u_glyphAtlas, vec2((glyph + point.x) / GLYPH_COUNT, point.y), lod).a;
}

float glyphAlpha(vec2 point, float glyph, float lod) {
  float center = atlasAlpha(point, glyph, lod);
  if (u_softness < .001) return center;
  // A small symmetric kernel softens the actual glyph edges without per-frame canvases.
  float offset = u_softness * 1.4 / (ATLAS_SPAN * u_step);
  return center * .5 + .125 * (
    atlasAlpha(point + vec2(offset, 0.), glyph, lod) +
    atlasAlpha(point - vec2(offset, 0.), glyph, lod) +
    atlasAlpha(point + vec2(0., offset), glyph, lod) +
    atlasAlpha(point - vec2(0., offset), glyph, lod)
  );
}

void main() {
  // DOM image uploads keep their top-left origin; fragment coordinates start at bottom-left.
  vec2 uv = vec2(gl_FragCoord.x, u_resolution.y - gl_FragCoord.y) / u_resolution;
  vec2 position = uv * u_sourceSize;
  vec2 cellSize = vec2(u_step, u_step * 1.35);
  ivec2 cell = ivec2(floor(position / cellSize));
  vec3 color = mix(PAPER, sourceColor(uv), .20);
  float texelsPerPixel = ATLAS_CELL / (ATLAS_SPAN * u_step) * u_sourceSize.x / u_resolution.x;
  float lod = max(0., log2(texelsPerPixel));

  // Adjacent glyphs can overlap after jitter; paint them in the CPU renderer's row order.
  for (int row = -1; row <= 1; row++) {
    for (int column = -1; column <= 1; column++) {
      ivec2 neighbor = cell + ivec2(column, row);
      vec2 center = (vec2(neighbor) + .5) * cellSize;
      if (any(lessThan(neighbor, ivec2(0))) || any(greaterThanEqual(center, u_sourceSize))) continue;
      uvec2 seed = uvec2(neighbor);
      vec2 jitter = (vec2(stableRandom(seed), stableRandom(uvec2(seed.y + 91u, seed.x))) - .5) * u_gridNoise * u_step;
      vec2 local = (position - center - jitter) / (ATLAS_SPAN * u_step) + .5;
      // The atlas has generous transparent padding; skip neighbors outside their visible ink.
      vec2 delta = abs(position - center - jitter);
      if (delta.x > u_step * .7 + u_softness * 1.4 || delta.y > u_step * 1.1 + u_softness * 1.4) continue;
      vec2 samplePixel = min(floor(center + .5), u_sourceSize - 1.);
      vec3 sampleColor = sourceColor((samplePixel + .5) / u_sourceSize);
      float luminance = dot(sampleColor, vec3(.2126, .7152, .0722));
      float darkness = pow(1. - luminance, .72);
      float glyph = floor(darkness * (GLYPH_COUNT - 1.) + .5);
      if (glyph < .5) continue;
      float alpha = glyphAlpha(local, glyph, lod) * (.4 + darkness * .6);
      vec3 ink = max(vec3(0.), sampleColor * .84 - 12. / 255.);
      color = mix(color, ink, alpha);
    }
  }
  float grain = (stableRandom(uvec2(floor(position)) + uvec2(4137u, 719u)) - .5) * u_grain;
  fragColor = vec4(clamp(color + grain, 0., 1.), 1.);
}`;

/** Update an existing mount with these uniforms before taking an export snapshot. */
export function getGlyphUniforms(image: HTMLImageElement, settings: FilterSettings): ShaderMountUniforms {
  const width = Math.min(1600, image.naturalWidth);
  return {
    u_image: image,
    u_sourceSize: [width, Math.round(width * image.naturalHeight / image.naturalWidth)],
    u_step: (2.1 + settings.size * .14) * width / 1500,
    u_gridNoise: settings.noise / 100,
    u_softness: settings.softness / 100 * .9,
    u_grain: settings.grain * .65 / 255,
    u_saturation: settings.color / 100,
    u_contrast: settings.contrast / 100,
  };
}

export function GlyphShader({ image, settings, shaderRef }: {
  image: HTMLImageElement;
  settings: FilterSettings;
  shaderRef: Ref<PaperShaderElement>;
}) {
  const [atlas, setAtlas] = useState<HTMLImageElement | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadGlyphAtlas().then(
      value => { if (!cancelled) setAtlas(value); },
      () => { if (!cancelled) setFailed(true); },
    );
    return () => { cancelled = true; };
  }, []);

  const uniforms = useMemo(() => ({ ...getGlyphUniforms(image, settings), u_glyphAtlas: atlas ?? undefined }), [image, settings, atlas]);

  if (!atlas) return <div data-glyph-status={failed ? 'failed' : 'loading'} style={{ width: '100%', height: '100%' }} />;
  return <ShaderMount ref={shaderRef} fragmentShader={fragmentShader} uniforms={uniforms}
    width="100%" height="100%" speed={0} frame={0} mipmaps={mipmaps}
    minPixelRatio={2} maxPixelCount={2400000} webGlContextAttributes={webGlOptions} />;
}
