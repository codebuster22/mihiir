import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const file = 'renders/mihiir-ux-showcase.mp4';
const probe = JSON.parse(execFileSync('ffprobe', ['-v','error','-show_format','-show_streams','-of','json',file], {encoding:'utf8'}));
const video = probe.streams.find(stream => stream.codec_type === 'video');
if (!video || video.codec_name !== 'h264' || video.width !== 1920 || video.height !== 1080 || video.r_frame_rate !== '30/1') throw new Error('Unexpected encoded video format');
if (Math.abs(Number(probe.format.duration) - 44) > .04 || Number(video.nb_frames) !== 1320) throw new Error('Unexpected encoded duration or frame count');
if (probe.streams.some(stream => stream.codec_type === 'audio')) throw new Error('The silent master should have no audio stream');
execFileSync('ffmpeg', ['-v','error','-xerror','-i',file,'-f','null','-'], {stdio:'pipe'});

await mkdir('renders/review', {recursive:true});
const times = [0,6.2,15,23,29.7,35.5,41,43.9];
const stills = [];
for (const time of times) {
  const output = `renders/review/frame-${String(time).replace('.','-')}s.png`;
  execFileSync('ffmpeg', ['-hide_banner','-loglevel','error','-y','-ss',String(time),'-i',file,'-frames:v','1',output]);
  if ((await stat(output)).size < 1000) throw new Error(`Empty verification still: ${output}`);
  stills.push({time,file:output});
}
const chosen = stills.slice(1,7);
const filters = chosen.map((_,i)=>`[${i}:v]scale=640:360[im${i}]`).join(';') + ';[im0][im1][im2]hstack=inputs=3[top];[im3][im4][im5]hstack=inputs=3[bottom];[top][bottom]vstack=inputs=2[out]';
execFileSync('ffmpeg', ['-hide_banner','-loglevel','error','-y',...chosen.flatMap(item=>['-i',item.file]),'-filter_complex',filters,'-map','[out]','-frames:v','1','-q:v','2','renders/review/contact-sheet.jpg']);
const sha256 = createHash('sha256').update(await readFile(file)).digest('hex');
const report = {
  file, sha256, sizeBytes:Number(probe.format.size), durationSeconds:Number(probe.format.duration),
  width:video.width,height:video.height,codec:video.codec_name,pixelFormat:video.pix_fmt,frameRate:video.r_frame_rate,frameCount:Number(video.nb_frames),
  audioStreams:0,fullDecodePassed:true,hyperframesVersion:'0.8.33',quality:'high',strictRender:true,
  compositionCheck:'captures/check-revised.json',sourceCaptureManifest:'captures/ux/capture-manifest.json',
  transitionProof:'snapshots-revised',stills,contactSheet:'renders/review/contact-sheet.jpg'
};
await writeFile('renders/verification.json',JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
