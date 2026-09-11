import { readFile, writeFile, mkdir, copyFile, stat } from 'node:fs/promises';
import { join } from 'node:path';

// Refuse to assemble a pretend demo. Every featured moving surface must be a
// verified real-site recording, and the capture manifest is retained as proof.
const manifest = JSON.parse(await readFile('captures/ux/capture-manifest.json', 'utf8'));
if (manifest.shots.length !== 5 || manifest.shots.some(shot => shot.errors.length)) throw new Error('Capture incomplete or contains page errors');
for (const file of ['home-desktop','antigravity','home-mobile','writing','footer']) {
  if ((await stat(`assets/${file}.mp4`)).size < 1000) throw new Error(`Missing source footage: ${file}`);
}
await mkdir('compositions/frames', { recursive: true });
await mkdir('assets/fonts', { recursive: true });
for (const weight of [400,500,600]) await copyFile(`../public/fonts/plex-sans-${weight}.ttf`, `assets/fonts/plex-sans-${weight}.ttf`);
for (const file of ['home-desktop-before.png','home-mobile-before.png']) await copyFile(`captures/ux/${file}`, `assets/${file}`);

const css = `
@font-face{font-family:Plex;src:url('assets/fonts/plex-sans-400.ttf');font-weight:400;font-display:block}
@font-face{font-family:Plex;src:url('assets/fonts/plex-sans-500.ttf');font-weight:500;font-display:block}
@font-face{font-family:Plex;src:url('assets/fonts/plex-sans-600.ttf');font-weight:600;font-display:block}
*{box-sizing:border-box} .stage{position:absolute;inset:0;perspective:1800px;perspective-origin:50% 48%}
.pose{position:absolute;transform-style:preserve-3d;will-change:transform}
.edge{position:absolute;inset:0;background:#DFE4E8;transform:translateZ(-12px) translate(5px,5px);border-radius:16px;border:1px solid #CCD4DB}
.face{position:absolute;inset:0;background:#FFFFFF;border:1px solid #DCE2E7;border-radius:14px;overflow:hidden;box-shadow:0 30px 80px #20232616,0 7px 18px #2023260B;backface-visibility:hidden}
.face video,.face img{display:block;width:100%;height:100%;object-fit:cover}
.eyebrow{position:absolute;left:92px;top:43px;font:400 22px/30px Plex,sans-serif;color:#596168;letter-spacing:.01em}
.heading{position:absolute;font:500 74px/1.04 Plex,sans-serif;letter-spacing:-.045em;color:#202326}
.body{position:absolute;font:400 28px/1.4 Plex,sans-serif;color:#596168}
.blue{color:#255BD6}
`;

const video = (id, source, duration) => `<video id="${id}" class="clip" src="assets/${source}.mp4" data-start="0" data-duration="${duration}" data-track-index="1" muted playsinline preload="auto"></video>`;
const plane = (id, content, style = '') => `<div class="pose" id="${id}" style="${style}"><div class="edge" aria-hidden="true"></div><div class="face">${content}</div></div>`;
const frame = (id, duration, content, motion) => `<!doctype html><html lang="en"><head><meta charset="UTF-8"></head><body><template><style>${css}#frame-${id}-root{position:absolute;inset:0;width:1920px;height:1080px;font-family:Plex,sans-serif;color:#202326;background:#FFFFFF;overflow:hidden}</style><div id="frame-${id}-root" data-composition-id="${id}" data-width="1920" data-height="1080" data-duration="${duration}">${content}</div><script>const tl=gsap.timeline({paused:true});${motion}window.__timelines["${id}"]=tl;</script></template></body></html>`;

const frames = [
  {
    id:'01-home',duration:13,start:0,title:'A personal home',
    content:`<div class="eyebrow">Mihiir.com</div><div class="stage">${plane('home-plane',video('home-video','home-desktop',13),'left:300px;top:110px;width:1320px;height:880px')}</div>`,
    motion:`tl.fromTo('#home-plane',{rotationY:-19,rotationX:10,z:-260,y:40},{rotationY:0,rotationX:0,z:0,y:0,duration:1.8,ease:'power3.out'},0);tl.to('#home-plane',{z:32,duration:3,ease:'power1.inOut'},3);tl.to('#home-plane',{z:0,duration:1.1,ease:'power2.inOut'},7);`,
  },
  {
    id:'02-work',duration:6,start:12.6,title:'Work, with context',
    content:`<div class="eyebrow">Work, with context.</div><div class="stage">${plane('work-plane',video('work-video','antigravity',6),'left:280px;top:110px;width:1360px;height:906.667px')}</div>`,
    motion:`tl.fromTo('#work-plane',{rotationY:12,rotationX:3,z:-170,x:75},{rotationY:0,rotationX:0,z:0,x:0,duration:1.3,ease:'power3.out'},0);tl.to('#work-plane',{z:28,duration:2.2,ease:'power1.inOut'},3.3);`,
  },
  {
    id:'03-mobile',duration:7,start:18.2,title:'A little closer',
    content:`<div class="eyebrow">A little closer.</div><div class="stage">${plane('mobile-back','<img src="assets/home-desktop-before.png" alt="The desktop home page"/>','left:85px;top:150px;width:1050px;height:700px')}${plane('mobile-plane',video('mobile-video','home-mobile',7),'left:1230px;top:68px;width:390px;height:900px')}</div><div class="body" style="left:112px;top:892px;width:830px">The same space, in your hand.</div>`,
    motion:`tl.fromTo('#mobile-back',{rotationY:0,rotationX:0,z:-100,x:0},{rotationY:12,rotationX:4,z:-250,x:-10,duration:1.3,ease:'power2.inOut'},0);tl.fromTo('#mobile-plane',{rotationY:-16,rotationX:7,z:-100,y:55},{rotationY:0,rotationX:0,z:55,y:0,duration:.85,ease:'power3.out'},0);`,
  },
  {
    id:'04-writing',duration:8,start:24.8,title:'Writing that shows its workings',
    content:`<div class="eyebrow">Writing that shows its workings.</div><div class="stage">${plane('writing-plane',video('writing-video','writing',8),'left:260px;top:104px;width:1400px;height:933.333px')}</div>`,
    motion:`tl.fromTo('#writing-plane',{rotationY:-9,rotationX:5,z:-90,y:20},{rotationY:0,rotationX:0,z:0,y:0,duration:1.05,ease:'power3.out'},0);`,
  },
  {
    id:'05-footer',duration:6,start:32.4,title:'An invitation to talk',
    content:`<div class="eyebrow">An invitation to talk.</div><div class="stage">${plane('footer-plane',video('footer-video','footer',6),'left:300px;top:104px;width:1320px;height:880px')}</div>`,
    motion:`tl.fromTo('#footer-plane',{rotationY:10,rotationX:6,z:-140,y:20},{rotationY:0,rotationX:0,z:0,y:0,duration:1.6,ease:'power2.inOut'},0);tl.to('#footer-plane',{z:24,duration:2,ease:'power1.inOut'},3);`,
  },
  {
    id:'06-close',duration:6,start:38,title:'Mihiir.com',
    content:`<div class="stage">${plane('close-desktop','<img src="assets/home-desktop-before.png" alt="Mihiir desktop home page"/>','left:790px;top:165px;width:940px;height:626.667px')}${plane('close-mobile','<img src="assets/home-mobile-before.png" alt="Mihiir mobile home page"/>','left:1490px;top:470px;width:218.4px;height:504px')}</div><div class="heading" id="close-title" style="left:100px;top:367px;width:660px;font-size:110px">Mihiir.com</div><div class="body" id="close-body" style="left:106px;top:510px;width:530px;color:#202326">Products and systems for Web3 and Prediction Markets.</div>`,
    motion:`tl.fromTo('#close-desktop',{rotationY:0,rotationX:0,z:-180,x:80},{rotationY:-11,rotationX:4,z:-30,x:0,duration:1.7,ease:'power3.out'},0);tl.fromTo('#close-mobile',{rotationY:-20,rotationX:8,z:-60,y:65},{rotationY:-10,rotationX:3,z:100,y:0,duration:1.85,ease:'power3.out'},.15);tl.fromTo('#close-title',{y:24,opacity:0},{y:0,opacity:1,duration:.8,ease:'power2.out'},.35);tl.fromTo('#close-body',{y:18,opacity:0},{y:0,opacity:1,duration:.8,ease:'power2.out'},.6);`,
  },
];

for (const item of frames) {
  const labelMotion = item.content.includes('class="eyebrow"')
    ? `${item.start > 0 ? "tl.fromTo('.eyebrow',{opacity:0},{opacity:1,duration:.15,ease:'none'},.35);" : ''}tl.to('.eyebrow',{opacity:0,duration:.15,ease:'none'},${item.duration-.4});`
    : '';
  await writeFile(`compositions/frames/${item.id}.html`, frame(item.id,item.duration,item.content,item.motion + labelMotion));
}
// Sequential handoffs: the old page is gone before the new page fades in.
// This keeps readable interfaces from becoming translucent double exposures.
const handoffs = frames.slice(1).map((item,i)=>`tl.fromTo('#scene-${i}',{opacity:1},{opacity:0,duration:.2,ease:'none',immediateRender:false},${item.start});tl.fromTo('#scene-${i+1}',{opacity:0},{opacity:1,duration:.2,ease:'none'},${item.start+.2});`).join('');
const root = `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=1920,height=1080"><title>Mihiir — UX showcase</title><script src="assets/vendor/gsap.min.js"></script><style>*{box-sizing:border-box;margin:0}html,body{width:1920px;height:1080px;overflow:hidden;background:#FFFFFF}#showcase{position:relative;width:1920px;height:1080px;overflow:hidden}.scene{position:absolute;inset:0;width:1920px;height:1080px}</style></head><body><div id="showcase" data-composition-id="mihiir-showcase" data-width="1920" data-height="1080" data-duration="44">${frames.map((item,i)=>`<div id="scene-${i}" class="scene clip" data-composition-id="${item.id}" data-composition-src="compositions/frames/${item.id}.html" data-start="${item.start}" data-duration="${item.duration}" data-track-index="${i}" data-width="1920" data-height="1080"></div>`).join('')}</div><script>const tl=gsap.timeline({paused:true});${handoffs}window.__timelines=window.__timelines||{};window.__timelines['mihiir-showcase']=tl;</script></body></html>`;
await writeFile('index.html', root);
await writeFile('shots.json', JSON.stringify(frames.map(({id,duration,start,title})=>({id,duration,start,title,proof:start+duration/2})),null,2));
console.log('Assembled six real-site scenes, 44 seconds at 1920×1080.');
