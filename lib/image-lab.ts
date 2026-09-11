export type FilterFamily = 'glyphs' | 'print';
export type PrintType = 'dots' | 'ink' | 'sharp';
export type FilterSettings = {
  size: number;
  noise: number;
  softness: number;
  grain: number;
  color: number;
  strength: number;
  contrast: number;
  type: PrintType;
};

export const photos = [
  {
    id: 'mountaineering',
    name: 'Mountaineering days',
    src: '/images/mountaineering-expanded-v2.webp',
    width: 2043,
    height: 770,
    alt: 'Mihiir jumping on an open snowy mountainside surrounded by dark rocks.',
  },
  {
    id: 'mountain-panorama',
    name: 'A wider perspective',
    src: '/images/panorama-expanded-v2.webp',
    width: 2048,
    height: 768,
    alt: 'A wide mountain landscape photographed by Mihiir.',
  },
  {
    id: 'mountaineering-mobile',
    name: 'Mobile framing study',
    src: '/images/mountaineering-mobile-study.png',
    width: 1122,
    height: 1402,
    alt: 'A mobile framing study of the Sar Pass photograph, with sky and snow extended using image generation.',
  },
] as const;

// Chosen by Mihiir on 10 September 2026. Both Sar Pass framings share one treatment.
export const chosenPrintSettings: Record<string, FilterSettings> = {
  mountaineering: {
    size: 5,
    noise: 70,
    softness: 75,
    grain: 50,
    color: 80,
    strength: 75,
    contrast: 100,
    type: 'ink',
  },
  'mountain-panorama': {
    size: 5,
    noise: 40,
    softness: 50,
    grain: 50,
    color: 90,
    strength: 50,
    contrast: 100,
    type: 'ink',
  },
};

export function treatmentKey(photoId: string) {
  return photoId === 'mountaineering-mobile' ? 'mountaineering' : photoId;
}

export const defaults: Record<FilterFamily, FilterSettings> = {
  glyphs: {
    size: 0,
    noise: 3,
    softness: 12,
    grain: 2,
    color: 100,
    strength: 55,
    contrast: 100,
    type: 'ink',
  },
  print: chosenPrintSettings.mountaineering,
};

export function photoDefaults(
  photoId: string,
): Record<FilterFamily, FilterSettings> {
  return {
    ...defaults,
    glyphs: {
      ...defaults.glyphs,
      strength: photoId === 'mountain-panorama' ? 45 : 55,
    },
    print: chosenPrintSettings[treatmentKey(photoId)] ?? defaults.print,
  };
}

export const presets: {
  name: string;
  family: FilterFamily;
  settings: FilterSettings;
}[] = [
  { name: 'Fine glyphs', family: 'glyphs', settings: defaults.glyphs },
  { name: 'Chosen print', family: 'print', settings: defaults.print },
  {
    name: 'Coarse terminal',
    family: 'glyphs',
    settings: {
      ...defaults.glyphs,
      size: 64,
      noise: 8,
      softness: 0,
      grain: 8,
      contrast: 120,
    },
  },
];

export type SavedLook = {
  version: 1;
  photo: string;
  family: FilterFamily;
  settings: FilterSettings;
};

export function readLook(value: unknown): SavedLook | null {
  if (!value || typeof value !== 'object') return null;
  const look = value as Partial<SavedLook>;
  if (
    look.version !== 1 ||
    !photos.some((p) => p.id === look.photo) ||
    (look.family !== 'glyphs' && look.family !== 'print') ||
    !look.settings
  )
    return null;
  const ranges = {
    size: [0, 100],
    noise: [0, 100],
    softness: [0, 100],
    grain: [0, 100],
    color: [0, 150],
    strength: [0, 100],
    contrast: [50, 150],
  };
  for (const [key, [min, max]] of Object.entries(ranges)) {
    const v = look.settings[key as keyof FilterSettings];
    if (typeof v !== 'number' || !Number.isFinite(v) || v < min || v > max)
      return null;
  }
  if (!['dots', 'ink', 'sharp'].includes(look.settings.type)) return null;
  return look as SavedLook;
}

// Fixed noise makes slider comparisons stable rather than changing the texture every frame.
function random(x: number, y: number) {
  let n = Math.imul(x + 1, 374761393) ^ Math.imul(y + 1, 668265263);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
}

export function renderGlyphs(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  settings: FilterSettings,
  outputWidth?: number,
) {
  const started = performance.now();
  const width = outputWidth ?? Math.min(1600, image.naturalWidth);
  const height = Math.round((width * image.naturalHeight) / image.naturalWidth);
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is unavailable.');
  const source = document.createElement('canvas');
  source.width = width;
  source.height = height;
  const sample = source.getContext('2d', { willReadFrequently: true })!;
  sample.filter = `saturate(${settings.color / 100}) contrast(${settings.contrast / 100})`;
  sample.drawImage(image, 0, 0, width, height);
  const { data } = sample.getImageData(0, 0, width, height);

  const layer = document.createElement('canvas');
  layer.width = width;
  layer.height = height;
  const ink = layer.getContext('2d')!;
  ink.fillStyle = '#fcfdfb';
  ink.fillRect(0, 0, width, height);
  ink.globalAlpha = 0.2;
  ink.drawImage(source, 0, 0);
  ink.globalAlpha = 1;

  const step = ((2.1 + settings.size * 0.14) * width) / 1500;
  const row = step * 1.35;
  const glyphs = ' .,:;=+xX#%@';
  ink.font = `bold ${step * 1.85}px "Courier New", monospace`;
  ink.textAlign = 'center';
  ink.textBaseline = 'middle';
  for (let yi = 0, y = row / 2; y < height; yi++, y += row) {
    for (let xi = 0, x = step / 2; x < width; xi++, x += step) {
      const index =
        (Math.min(height - 1, Math.round(y)) * width +
          Math.min(width - 1, Math.round(x))) *
        4;
      const r = data[index],
        g = data[index + 1],
        b = data[index + 2];
      const luminance = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 255;
      const dark = Math.pow(1 - luminance, 0.72);
      const charIndex = Math.min(
        glyphs.length - 1,
        Math.round(dark * (glyphs.length - 1)),
      );
      if (!charIndex) continue;
      const jitter = (settings.noise / 100) * step;
      const px = x + (random(xi, yi) - 0.5) * jitter;
      const py = y + (random(yi + 91, xi) - 0.5) * jitter;
      ink.fillStyle = `rgb(${Math.max(0, r * 0.84 - 12)},${Math.max(0, g * 0.84 - 12)},${Math.max(0, b * 0.84 - 12)})`;
      ink.globalAlpha = 0.4 + dark * 0.6;
      ink.fillText(glyphs[charIndex], px, py);
    }
  }
  ctx.fillStyle = '#fcfdfb';
  ctx.fillRect(0, 0, width, height);
  ctx.filter = `blur(${(settings.softness / 100) * 0.9}px)`;
  ctx.drawImage(layer, 0, 0);
  ctx.filter = 'none';
  if (settings.grain > 0) {
    const pixels = ctx.getImageData(0, 0, width, height);
    const p = pixels.data;
    let seed = 4137;
    for (let i = 0; i < p.length; i += 4) {
      seed = (Math.imul(seed, 1664525) + 1013904223) | 0;
      const noise = ((seed >>> 0) / 4294967295 - 0.5) * settings.grain * 0.65;
      p[i] += noise;
      p[i + 1] += noise;
      p[i + 2] += noise;
    }
    ctx.putImageData(pixels, 0, 0);
  }
  if (process.env.NODE_ENV === 'development')
    canvas.dataset.renderMs = (performance.now() - started).toFixed(1);
}

/** Export actual glyph edges at delivery resolution, not a scaled preview bitmap. */
export function exportGlyphArtwork(
  image: HTMLImageElement,
  settings: FilterSettings,
  width = 3840,
) {
  const glyphLayer = document.createElement('canvas');
  renderGlyphs(glyphLayer, image, settings, width);
  const output = document.createElement('canvas');
  output.width = glyphLayer.width;
  output.height = glyphLayer.height;
  const ctx = output.getContext('2d')!;
  ctx.drawImage(image, 0, 0, output.width, output.height);
  ctx.globalAlpha = settings.strength / 100;
  ctx.drawImage(glyphLayer, 0, 0);
  return output;
}
