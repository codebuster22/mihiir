import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

await mkdir('assets', {recursive:true});
const capture = JSON.parse(await readFile('captures/ux/capture-manifest.json','utf8'));
const plan = JSON.parse(await readFile('captures/plan.json','utf8'));
const metadata = [];
for (const shot of capture.shots) {
  if (shot.errors.length) throw new Error(`Capture ${shot.name} has errors`);
  const input = `captures/ux/${shot.name}.webm`;
  const output = `assets/${shot.name}.mp4`;
  const duration = plan.shots.find(item => item.name === shot.name).duration;
  execFileSync('ffmpeg', ['-hide_banner','-loglevel','error','-y','-i',input,'-an','-vf','fps=30,tpad=stop_mode=clone:stop_duration=1','-t',String(duration),'-c:v','libx264','-preset','slow','-crf','16','-pix_fmt','yuv420p','-movflags','+faststart',output], {stdio:'inherit'});
  const probe = JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries','stream=codec_name,width,height,r_frame_rate','-show_entries','format=duration,size','-of','json',output],{encoding:'utf8'}));
  metadata.push({name:shot.name,source:input,output,...probe});
  console.log(`${shot.name}: ${Number(probe.format.duration).toFixed(2)}s`);
}
await writeFile('captures/normalized-media.json',JSON.stringify(metadata,null,2));
