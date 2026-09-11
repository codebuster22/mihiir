'use client';

import { useEffect, useRef, useState, useDeferredValue, type CSSProperties } from 'react';
import { HalftoneCmyk, type PaperShaderElement } from '@paper-design/shaders-react';
import { photoDefaults, treatmentKey, photos, presets, readLook, renderGlyphs, type FilterFamily, type FilterSettings, type SavedLook } from '@/lib/image-lab';
import styles from './image-lab.module.css';
import { PhotoMemory } from './photo-memory';
import { GlyphShader, getGlyphUniforms } from './glyph-shader';

// Start from the chosen treatments instead of restoring an earlier exploration over them.
const storageKey = 'mihiir-image-look-v2';
const webGlOptions: WebGLContextAttributes = { preserveDrawingBuffer: true, alpha: false };

function Slider({ label, value, onChange, max = 100, min = 0 }: {
  label: string; value: number; onChange: (value: number) => void; max?: number; min?: number;
}) {
  return <label className={styles.slider}>
    <span>{label}<output>{value}%</output></span>
    <input aria-label={label} type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))}
      style={{ '--fill': `${(value - min) / (max - min) * 100}%` } as CSSProperties} />
  </label>;
}

export function ImageLab() {
  const [family, setFamily] = useState<FilterFamily>('print');
  const [settingsByPhoto, setSettingsByPhoto] = useState<Record<string, Record<FilterFamily, FilterSettings>>>(
    () => Object.fromEntries(photos.map(photo => [treatmentKey(photo.id), photoDefaults(photo.id)]))
  );
  const [photoId, setPhotoId] = useState<string>(photos[0].id);
  const [view, setView] = useState<'filtered' | 'original' | 'compare'>('filtered');
  const [reveal, setReveal] = useState(50);
  const [loadedImage, setLoadedImage] = useState<{ src: string; image: HTMLImageElement } | null>(null);
  const [failure, setFailure] = useState<{ src: string; family?: FilterFamily; message: string } | null>(null);
  const [notice, setNotice] = useState('');
  const [saved, setSaved] = useState<SavedLook | null>(null);
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [renderedImage, setRenderedImage] = useState<HTMLImageElement | null>(null);
  const [exporting, setExporting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glyphRef = useRef<PaperShaderElement>(null);
  const printRef = useRef<PaperShaderElement>(null);
  const currentTreatment = treatmentKey(photoId);
  const settings = settingsByPhoto[currentTreatment][family];
  const deferred = useDeferredValue(settings);
  const photo = photos.find(p => p.id === photoId) ?? photos[0];
  const image = loadedImage?.src === photo.src ? loadedImage.image : null;
  const ready = Boolean(image && (webgl || renderedImage === image));
  const error = failure?.src === photo.src && (!failure.family || failure.family === family) ? failure.message : '';

  function applyLook(look: SavedLook) {
    setPhotoId(look.photo);
    setFamily(look.family);
    const key = treatmentKey(look.photo);
    setSettingsByPhoto(current => ({ ...current, [key]: { ...current[key], [look.family]: look.settings } }));
    setView('filtered');
  }

  useEffect(() => {
    const testCanvas = document.createElement('canvas');
    const context = testCanvas.getContext('webgl2');
    // A one-time browser capability probe and local-storage restore have no external subscription.
    // oxlint-disable-next-line react/react-compiler
    setWebgl(Boolean(context));
    context?.getExtension('WEBGL_lose_context')?.loseContext();
    try {
      const stored = localStorage.getItem(storageKey);
      const look = stored && readLook(JSON.parse(stored));
      if (look) { applyLook(look); setSaved(look); }
    } catch { /* Storage may be unavailable; editing still works. */ }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.onload = () => { if (!cancelled) setLoadedImage({ src: photo.src, image: img }); };
    img.onerror = () => { if (!cancelled) setFailure({ src: photo.src, message: 'This photograph could not load. Choose another below.' }); };
    img.src = photo.src;
    return () => { cancelled = true; };
  }, [photo.src]);

  useEffect(() => {
    if (!image || family !== 'glyphs' || webgl !== false) return;
    const frame = requestAnimationFrame(() => {
      try {
        if (canvasRef.current) { renderGlyphs(canvasRef.current, image, deferred); setRenderedImage(image); }
      } catch { setFailure({ src: photo.src, family: 'glyphs', message: 'The glyph preview is unavailable in this browser. Try Print instead.' }); }
    });
    return () => cancelAnimationFrame(frame);
  }, [image, deferred, family, photo.src, webgl]);

  function update(key: keyof FilterSettings, value: number | FilterSettings['type']) {
    setSettingsByPhoto(current => ({ ...current, [currentTreatment]: {
      ...current[currentTreatment], [family]: { ...current[currentTreatment][family], [key]: value }
    } }));
    setNotice('');
  }

  function replaceSettings(targetFamily: FilterFamily, next: FilterSettings) {
    setSettingsByPhoto(current => ({ ...current, [currentTreatment]: { ...current[currentTreatment], [targetFamily]: next } }));
  }

  function getLook(): SavedLook { return { version: 1, photo: photo.id, family, settings }; }

  function saveLook() {
    try {
      const look = getLook();
      localStorage.setItem(storageKey, JSON.stringify(look));
      setSaved(look);
      setNotice('Look saved in this browser.');
    } catch { setNotice('Browser storage is unavailable. Use Copy settings to keep this look.'); }
  }

  async function copySettings() {
    try { await navigator.clipboard.writeText(JSON.stringify(getLook(), null, 2)); setNotice('Settings copied. Paste them into our conversation.'); }
    catch { setNotice('Copy is unavailable here. Select the settings below and copy them.'); }
  }

  async function download() {
    if (!image || exporting) return;
    setExporting(true);
    let source: HTMLCanvasElement;
    try {
      if (family === 'glyphs' && !webgl) {
        source = document.createElement('canvas');
        renderGlyphs(source, image, settings);
      } else {
        const mount = (family === 'glyphs' ? glyphRef : printRef).current?.paperShaderMount;
        if (!mount) { setNotice('Wait for the preview, then try again.'); setExporting(false); return; }
        // Snapshot the current controls explicitly; React's deferred preview may still be a frame behind.
        mount.setUniforms(family === 'glyphs' ? getGlyphUniforms(image, settings) : { u_image: image, u_size: settings.size / 100, u_gridNoise: settings.noise / 100,
          u_softness: settings.softness / 100, u_type: { dots: 0, ink: 1, sharp: 2 }[settings.type],
          u_contrast: settings.contrast / 100, u_grainOverlay: settings.grain / 100, u_grainMixer: settings.grain / 500 });
        mount.setFrame(0);
        await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
        source = mount.canvasElement;
      }
    } catch { setNotice('The image could not export. Please try again.'); setExporting(false); return; }
    const output = document.createElement('canvas');
    output.width = source.width;
    output.height = source.height;
    const ctx = output.getContext('2d')!;
    ctx.drawImage(image, 0, 0, output.width, output.height);
    ctx.globalAlpha = settings.strength / 100;
    if (family === 'print') ctx.filter = `saturate(${settings.color / 100})`;
    ctx.drawImage(source, 0, 0);
    output.toBlob(blob => {
      setExporting(false);
      if (!blob) { setNotice('The image could not export. Please try again.'); return; }
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mihiir-${photo.id}-${family}.png`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      setNotice('PNG export prepared with your current filter settings.');
    }, 'image/png');
  }

  return <main className={styles.lab}>
    <header className={styles.header}>
      <span className={styles.wordmark}>mihiir <span>/ image lab</span></span>
      <a href="https://app.paper.design/file/01M24PYFVR42B77SGG89HQ1NXD/2-0" target="_blank" rel="noreferrer">Open Paper <span aria-hidden="true">↗</span></a>
    </header>
    <div className={styles.intro}>
      <h1>Find the texture.</h1>
      <p>Keep the color. Tune the grain. Make it feel like you.</p>
    </div>
    <div className={styles.workspace}>
      <section className={styles.previewColumn} aria-label="Photograph preview">
        <div className={styles.previewToolbar}>
          <span>{photo.name}</span>
          <div className={styles.viewSwitch} aria-label="Preview mode">
            {(['filtered', 'original', 'compare'] as const).map(mode => <button key={mode} type="button" aria-pressed={view === mode} onClick={() => setView(mode)}>{mode[0].toUpperCase() + mode.slice(1)}</button>)}
          </div>
        </div>
        <div className={`${styles.imageStage} ${photo.id === 'mountaineering-mobile' ? styles.portrait : ''}`} style={{ aspectRatio: `${photo.width} / ${photo.height}` }}>
          {/* Native images preserve the exact pixel source and full framing for this filter tool. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} className={styles.originalBase} />
          <div className={styles.filterLayer}
            style={{ opacity: view === 'original' || !image || (family === 'glyphs' && !ready) ? 0 : settings.strength / 100,
              filter: family === 'print' ? `saturate(${settings.color / 100})` : undefined }} aria-hidden="true">
            {family === 'glyphs' ? webgl && image ? <GlyphShader image={image} settings={deferred} shaderRef={glyphRef} /> : <canvas ref={canvasRef} className={styles.glyphCanvas} /> : webgl && image ?
              <HalftoneCmyk ref={printRef} image={image} width="100%" height="100%" fit="contain" speed={0}
                colorBack="#ffffff" colorC="#00ffff" colorM="#ff00ff" colorY="#ffff00" colorK="#000000"
                size={deferred.size / 100} gridNoise={deferred.noise / 100} softness={deferred.softness / 100}
                type={deferred.type} contrast={deferred.contrast / 100}
                grainOverlay={deferred.grain / 100} grainMixer={deferred.grain / 500} grainSize={.15}
                floodC={0} floodM={0} floodY={0} floodK={0} gainC={0} gainM={0} gainY={0} gainK={0}
                minPixelRatio={2} maxPixelCount={2400000} webGlContextAttributes={webGlOptions} /> : null}
          </div>
          {view === 'compare' && <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.src} alt="" className={styles.originalReveal} style={{ clipPath: `inset(0 ${100 - reveal}% 0 0)` }} />
            <div className={styles.divider} style={{ left: `${reveal}%` }}><span aria-hidden="true">↔</span></div>
          </>}
          {(!image || (!ready && family === 'glyphs')) && !error && <span className={styles.loading}>Preparing photograph…</span>}
          {error && <p className={styles.previewError} role="alert">{error}</p>}
          {family === 'print' && webgl === false && <p className={styles.previewError} role="alert">Print needs WebGL. Glyphs works in this browser.</p>}
          {photo.id.startsWith('mountaineering') && <PhotoMemory key={photo.id} mobile={photo.id === 'mountaineering-mobile'} />}
        </div>
        {view === 'compare' && <div className={styles.compareControl}>
          <span>Original</span><input aria-label="Original photograph revealed" type="range" min="0" max="100" value={reveal} onChange={e => setReveal(Number(e.target.value))} /><span>Filtered</span>
        </div>}
        <div className={styles.photos} aria-label="Choose a photograph">
          {photos.map(p => <button type="button" key={p.id} onClick={() => { setPhotoId(p.id); setFamily('print'); setNotice(''); }} aria-pressed={photo.id === p.id} aria-label={p.name}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.src} alt="" width="96" height="64" /><span>{p.name}</span>
          </button>)}
        </div>
        <p className={styles.photoNote}>{photo.id === 'mountaineering-mobile' ? 'Mobile framing study: sky and snow extended with image generation.' : 'Photographs from my own archive. The framing stays intact.'}</p>
      </section>
      <aside className={styles.controls} aria-label="Filter controls">
        <div className={styles.familySwitch}>
          <button type="button" aria-pressed={family === 'glyphs'} onClick={() => { setFamily('glyphs'); setNotice(''); }}><span aria-hidden="true">Aa</span> Glyphs</button>
          <button type="button" aria-pressed={family === 'print'} onClick={() => { setFamily('print'); setNotice(''); }}><span className={styles.dotIcon} aria-hidden="true">⠿</span> Print</button>
        </div>
        <p className={styles.familyHint}>{family === 'glyphs' ? 'Characters sampled from the colors in your photograph.' : 'Paper’s CMYK filter, from the reference you shared.'}</p>
        <Slider label={family === 'glyphs' ? 'Glyph size' : 'Dot size'} value={settings.size} onChange={v => update('size', v)} />
        {family === 'print' && <fieldset className={styles.types}><legend>Type</legend><div>{(['dots', 'ink', 'sharp'] as const).map(type => <button key={type} type="button" aria-pressed={settings.type === type} onClick={() => update('type', type)}>{type[0].toUpperCase() + type.slice(1)}</button>)}</div></fieldset>}
        <Slider label="Grid noise" value={settings.noise} onChange={v => update('noise', v)} />
        <Slider label="Softness" value={settings.softness} onChange={v => update('softness', v)} />
        <Slider label="Grain" value={settings.grain} onChange={v => update('grain', v)} />
        <Slider label="Color" value={settings.color} max={150} onChange={v => update('color', v)} />
        <Slider label="Filter amount" value={settings.strength} onChange={v => update('strength', v)} />
        <details className={styles.more}><summary>More controls</summary>
          <Slider label="Contrast" min={50} max={150} value={settings.contrast} onChange={v => update('contrast', v)} />
          <button type="button" className={styles.textButton} onClick={copySettings}>Copy settings</button>
          <textarea aria-label="Current filter settings" readOnly value={JSON.stringify(getLook(), null, 2)} rows={5} />
        </details>
        <div className={styles.actions}>
          <button type="button" className={styles.primary} onClick={saveLook}>Save look</button>
          <button type="button" onClick={download} disabled={exporting || !image || Boolean(error) || (family === 'print' && !webgl)}>{exporting ? 'Preparing PNG…' : 'Download PNG'}</button>
        </div>
        <div className={styles.secondaryActions}>
          <button type="button" onClick={() => { replaceSettings(family, photoDefaults(photo.id)[family]); setNotice('Controls reset.'); }}>Reset controls</button>
          {saved && <button type="button" onClick={() => { applyLook(saved); setNotice('Saved look restored.'); }}>Restore saved</button>}
        </div>
        <output className={styles.notice}>{notice}</output>
      </aside>
    </div>
    <section className={styles.presets} aria-label="Starting points">
      <p>A few starting points</p><div>{presets.map(preset => <button type="button" key={preset.name} onClick={() => {
        setFamily(preset.family); replaceSettings(preset.family, preset.family === 'print' ? photoDefaults(photo.id).print : preset.settings); setView('filtered'); setNotice(`${preset.name} applied.`);
      }}>{preset.name}</button>)}</div>
    </section>
    <footer className={styles.footer}><span>A working study for mihiir.com</span><a href="https://paper.design/blog/retro-print-cmyk-halftone-shader" target="_blank" rel="noreferrer">About Paper’s print filter ↗</a></footer>
  </main>;
}
