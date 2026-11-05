(()=>{
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const hero=document.getElementById('hero');
const prog=()=>{if(typeof window.__p==='number')return window.__p;const r=hero.getBoundingClientRect();return clamp(-r.top/Math.max(1,r.height-innerHeight),0,1)};

/* ---------- WebGL: la sala y el muro ---------- */
const cv=document.getElementById('gl');
let gl=null;try{gl=cv.getContext('webgl',{antialias:false,alpha:false})}catch(e){}
let U=()=>null,size=()=>{};let ready=0;
if(!gl){cv.style.display='none';cv.parentElement.style.background='#0a0908 url(assets/wall/full.jpg) center 47%/cover no-repeat';}
else{(function(){
const VS=`attribute vec2 a;varying vec2 v;void main(){v=a*.5+.5;gl_Position=vec4(a,0.,1.);}`;
const FS=`precision mediump float;varying vec2 v;uniform sampler2D uE,uF,uT;uniform float uP,uTime,uAsp;uniform vec2 uOff;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){
  // encuadre "cover" de la imagen cuadrada sobre el viewport, con un poco de zoom para el paralaje
  vec2 uv=v-.5; uv.y=-uv.y;
  if(uAsp>1.) uv.x*=uAsp; else uv.y/=uAsp;
  float z=1.12+uP*.06;             // acercarse muy despacio
  uv=uv/z+uOff; uv+=vec2(.5,.47);
  vec3 e=texture2D(uE,uv).rgb, f=texture2D(uF,uv).rgb;
  float t=texture2D(uT,uv).r;      // 0..1 instante en que aparece; 1 = fuera del lienzo
  float soft=mix(.06,.012,step(.4,t));
  float k=smoothstep(t-soft,t+soft,uP);
  vec3 c=mix(e,f,k);
  // borde húmedo: lo recién pintado brilla un poco más oscuro
  float wet=1.-smoothstep(0.,.05,abs(uP-t)); c*=1.-.22*wet*step(t,.99);
  // parpadeo tenue de la luz y grano
  c*=.985+.015*sin(uTime*7.3)*sin(uTime*1.7);
  c+=(hash(v*vec2(1920.,1080.)+uTime)-.5)*.035;
  gl_FragColor=vec4(c,1.);}`;
function sh(t,s){const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))console.error(gl.getShaderInfoLog(o));return o}
const pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,VS));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,FS));gl.linkProgram(pr);gl.useProgram(pr);
const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
const la=gl.getAttribLocation(pr,'a');gl.enableVertexAttribArray(la);gl.vertexAttribPointer(la,2,gl.FLOAT,false,0,0);
U=n=>gl.getUniformLocation(pr,n);
function tex(unit,src,cb){const t=gl.createTexture();const im=new Image();im.onload=()=>{gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,im);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);cb&&cb()};im.src=src;return t}
const onld=()=>{ready++};
tex(0,"assets/wall/empty.jpg",onld);tex(1,"assets/wall/full.jpg",onld);tex(2,"assets/wall/t.png",onld);
gl.uniform1i(U('uE'),0);gl.uniform1i(U('uF'),1);gl.uniform1i(U('uT'),2);
size=function(){const d=Math.min(devicePixelRatio||1,1.5);cv.width=Math.floor(innerWidth*d);cv.height=Math.floor(innerHeight*d);gl.viewport(0,0,cv.width,cv.height)}
addEventListener('resize',size);size();
})();}
let mx=0,my=0,sx=0,sy=0;
addEventListener('pointermove',e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5});

/* ---------- rótulos ---------- */
const big=document.getElementById('cbig'),sub=document.getElementById('csub'),hud=document.getElementById('hud'),viewers=document.getElementById('viewers'),fin=document.getElementById('final');
const titles=[...document.querySelectorAll('.txt [data-t]')];
const START=Date.UTC(2026,6,28,13,0,0); // 28 jul 2026, 13:00 (día 1, 1pm)
const marks=[ // hora de directo -> rótulo (los del vídeo resumen)
  [0,'empieza el directo'],[3,'primer tema en marcha'],[11,'primera noche'],[15,'nadie ha dormido'],[18,'el lago se ilumina'],[28,'los primeros trazos azules'],[36,'segunda noche'],[42,'las fotos van al muro'],[49,'la última hora'],[50,'terminado']];
function fmt(h){const d=new Date(START+h*3600e3);const day=1+Math.floor((h+13)/24);let hr=d.getUTCHours();const ap=hr>=12?'pm':'am';hr=hr%12||12;return `día ${day}, ${hr}${ap}`}
let last='';
function tick(ts){
  const p=prog();
  const pr_=clamp((p-.09)/.76,0,1);             // 0..1 pintar el muro
  const h=pr_*50;
  sx+=(mx-sx)*.05;sy+=(my-sy)*.05;
  if(gl){gl.uniform1f(U('uP'),pr_);gl.uniform1f(U('uTime'),ts/1000);gl.uniform1f(U('uAsp'),innerWidth/innerHeight);
  gl.uniform2f(U('uOff'),sx*.025+Math.sin(ts/9000)*.004,-sy*.02+Math.cos(ts/11000)*.003);
  if(ready>=3)gl.drawArrays(gl.TRIANGLE_STRIP,0,4);}
  titles.forEach(el=>{const [a,b]=el.dataset.t.split(',').map(Number);el.classList.toggle('on',p>=a&&p<=b)});
  const showClock=p>.15&&p<.87;
  big.classList.toggle('on',showClock);sub.classList.toggle('on',showClock);hud.classList.toggle('on',showClock);
  const txt=fmt(h);if(txt!==last){big.textContent=txt;last=txt}
  let m=marks[0];for(const mk of marks)if(h>=mk[0])m=mk;sub.textContent=m[1];
  viewers.textContent=Math.round(1800+(1-Math.pow(1-pr_,2))*7.5e6).toLocaleString('es-ES');
  fin.classList.toggle('on',p>.9);
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

/* ---------- scroll frenado ---------- */
(function(){
  if(matchMedia('(prefers-reduced-motion:reduce)').matches)return;
  let target=scrollY,cur=scrollY,active=false;
  const max=()=>document.documentElement.scrollHeight-innerHeight;
  const MAXSTEP=()=>innerHeight*0.055;           // lo que avanza como mucho cada "clic" de rueda
  addEventListener('wheel',e=>{
    if(e.ctrlKey)return; e.preventDefault(); if(document.body.dataset.lb)return;
    if(!active){target=cur=scrollY;active=true}
    const d=Math.max(-MAXSTEP(),Math.min(MAXSTEP(),e.deltaY));
    target=clamp(target+d,0,max());
  },{passive:false});
  addEventListener('keydown',e=>{
    if(['ArrowDown','ArrowUp','PageDown','PageUp',' '].includes(e.key)){e.preventDefault();if(document.body.dataset.lb)return;if(!active){target=cur=scrollY;active=true}
      const d=(e.key==='ArrowUp'||e.key==='PageUp')?-innerHeight*.25:innerHeight*.25;target=clamp(target+d,0,max())}
  });
  // si el usuario arrastra con el dedo o la barra, nos resincronizamos
  addEventListener('scroll',()=>{if(!active)return;if(Math.abs(scrollY-cur)>4){target=cur=scrollY}},{passive:true});
  (function step(){
    if(active){cur+=(target-cur)*0.08;if(Math.abs(target-cur)<.5)cur=target;if(Math.abs(cur-scrollY)>=.5)scrollTo(0,cur)}
    requestAnimationFrame(step);
  })();
})();

/* ---------- visor: clic en una foto, se agranda al centro; clic fuera, vuelve ---------- */
(function(){
  const lb=document.getElementById('lb'),bg=lb.querySelector('.bg'),cap=lb.querySelector('.cap');
  let src=null,clone=null,busy=false;
  const zoomables=[...document.querySelectorAll('img')].filter(i=>!i.closest('.bleed,.final,.stage,#lb,.view,.video'));
  zoomables.forEach(i=>{i.classList.add('zoom');i.addEventListener('click',e=>{e.stopPropagation();open(i)})});
  function fit(nw,nh){const W=innerWidth*.92,H=innerHeight*.86;const s=Math.min(W/nw,H/nh);const w=nw*s,h=nh*s;return {left:(innerWidth-w)/2,top:(innerHeight-h)/2,width:w,height:h}}
  function place(el,r){el.style.left=r.left+'px';el.style.top=r.top+'px';el.style.width=r.width+'px';el.style.height=r.height+'px'}
  function open(img){
    if(busy||src)return; busy=true; src=img;
    const r=img.getBoundingClientRect();
    clone=document.createElement('img'); clone.src=img.currentSrc||img.src; clone.alt=img.alt||'';
    place(clone,r); clone.style.transition='none'; lb.appendChild(clone); lb.classList.add('on'); lb.setAttribute('aria-hidden','false');
    const fc=img.closest('figure')?.querySelector('figcaption'); cap.textContent=fc?fc.textContent:(img.alt||'');
    img.style.visibility='hidden'; document.body.dataset.lb='1';
    clone.getBoundingClientRect(); clone.style.transition='';
    setTimeout(()=>{lb.classList.add('in');place(clone,fit(img.naturalWidth||r.width,img.naturalHeight||r.height))},30);
    setTimeout(()=>busy=false,560);
  }
  function close(){
    if(busy||!src)return; busy=true;
    const r=src.getBoundingClientRect(); lb.classList.remove('in'); place(clone,r);
    const s=src,c=clone;
    setTimeout(()=>{s.style.visibility='';c.remove();lb.classList.remove('on');lb.setAttribute('aria-hidden','true');delete document.body.dataset.lb;src=null;clone=null;busy=false},560);
  }
  lb.addEventListener('click',close);
  addEventListener('keydown',e=>{if(e.key==='Escape')close()});
  addEventListener('resize',()=>{if(src&&clone&&lb.classList.contains('in'))place(clone,fit(src.naturalWidth,src.naturalHeight))});
})();

/* ---------- el disco: línea de tiempo + vista + lista + audio ---------- */
(function(){
  const S=[{"n": 1, "t": "Hey Hey", "w": "con Boo · 2:05", "ms": 125084, "prev": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/82/54/7d/82547dbe-36fb-af32-3172-a52051359dcd/mzaf_16807922099448648464.plus.aac.p.m4a", "img": "assets/img/t1.jpg"}, {"n": 2, "t": "Alvafro", "w": "con Boo · 3:58", "ms": 238053, "prev": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/fe/2a/17/fe2a17eb-bd87-f23d-dedc-77b2da5471b6/mzaf_974273309107964228.plus.aac.p.m4a", "img": "assets/img/t2.jpg"}, {"n": 3, "t": "Bonita", "w": "con Boo · 3:06", "ms": 186304, "prev": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/cb/a9/41/cba941cc-0fe3-636b-fe33-162c61f3248d/mzaf_3542307672108078551.plus.aac.p.m4a", "img": "assets/img/t3.jpg"}, {"n": 4, "t": "benjy chord", "w": "con Paul Woolford y Matthew Herbert · 2:45", "ms": 165306, "prev": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/a1/b1/ad/a1b1adb9-d124-3203-6a80-f658e51fee45/mzaf_2816432194768603664.plus.aac.p.m4a", "img": "assets/img/t4.jpg"}, {"n": 5, "t": "Cmon", "w": "con Brian Eno y Aaron Dessner · LATIN MAFIA & Fred edit · 4:15", "ms": 255434, "prev": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/f7/ad/1b/f7ad1b0b-ec1b-c717-ba8c-b9d2b270de2c/mzaf_97395780491660979.plus.aac.p.m4a", "img": "assets/img/t5.jpg"}, {"n": 6, "t": "Quiereme", "w": "con bby · 2:55", "ms": 175116, "prev": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/36/22/fe/3622fe22-59d3-4501-9c38-de53fbfee2fb/mzaf_1679209494278292245.plus.aac.p.m4a", "img": "assets/img/t6.jpg"}, {"n": 7, "t": "casino143", "w": "con IVOXYGEN · Rue De La Fortuna Remix · 2:59", "ms": 178673, "prev": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/24/a7/fc/24a7fc08-c0f4-0671-1387-4b1470cfac5a/mzaf_12199857680910804669.plus.aac.p.m4a", "img": "assets/img/t7.jpg"}, {"n": 8, "t": "Film Scene Soundtrack", "w": "con KatzPascale · 2:46", "ms": 165500, "prev": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/d7/c8/bc/d7c8bc01-172c-7257-e376-ed5e1a25f923/mzaf_18251964024875203960.plus.aac.p.m4a", "img": "assets/img/t8.jpg"}, {"n": 9, "t": "Open Eye Signal", "w": "con Jon Hopkins · under the fabric · 4:01", "ms": 241217, "prev": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/2e/44/52/2e445219-0db3-6bf7-62bc-665904769bd7/mzaf_3145225280474917028.plus.aac.p.m4a", "img": "assets/img/t9.jpg"}, {"n": 10, "t": "Piensas En Mi", "w": "con Boo · 3:18", "ms": 198052, "prev": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/cc/e6/6a/cce66a02-b756-da59-ded4-8b1087fdfd8e/mzaf_3556836275365224658.plus.aac.p.m4a", "img": "assets/img/t10.jpg"}, {"n": 11, "t": "Halo", "w": "con Lil Yachty y Darcy Lewis · 3:03", "ms": 183226, "prev": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/d4/dc/e2/d4dce29f-4c1c-2a3b-e644-028e182a4efc/mzaf_17592989487147093940.plus.aac.p.m4a", "img": "assets/img/t11.jpg"}, {"n": 12, "t": "Te Estoy Correteando", "w": "con Boo · nº 1 en Billboard Latin · 3:14", "ms": 193638, "prev": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/12/39/23/123923ad-4698-50ca-fa17-e511a06c75f2/mzaf_8412193140445378375.plus.aac.p.m4a", "img": "assets/img/t12.jpg"}, {"n": 13, "t": "Mabe", "w": "con Mabe Fratti y Four Tet · 4:54", "ms": 294350, "prev": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/85/d6/de/85d6de67-3aa8-1c0b-f068-5ed45ced0b2e/mzaf_13268274939576563574.plus.aac.p.m4a", "img": "assets/img/t13.jpg"}, {"n": 14, "t": "I wish it wasnt", "w": "con Tobias Wincorn y Moses Sumney · 3:46", "ms": 225972, "prev": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/9a/3e/ef/9a3eeff0-265c-f0f9-b562-d5f0483cdfc0/mzaf_17660559419216668156.plus.aac.p.m4a", "img": "assets/img/t14.jpg"}];
  const segs=[...document.querySelectorAll('#tl .seg')],lis=[...document.querySelectorAll('#list li')];
  const va=document.getElementById('va'),vb=document.getElementById('vb'),vn=document.getElementById('vn'),vtitle=document.getElementById('vtitle'),vw=document.getElementById('vw');
  const play=document.getElementById('play'),prog=document.getElementById('prog'),note=document.getElementById('note');
  let cur=0,front=va,back=vb,audio=null,playing=false,fade=null;
  function show(i,userPlay){
    const s=S[i]; cur=i;
    segs.forEach((x,k)=>x.classList.toggle('on',k===i)); lis.forEach((x,k)=>x.classList.toggle('on',k===i));
    back.src=s.img; back.style.transform='scale(1.04)'; back.classList.add('show'); front.classList.remove('show'); [front,back]=[back,front];
    setTimeout(()=>{front.style.transform='scale(1.0)'},50);
    vn.textContent=s.n; vtitle.textContent=s.t; vw.textContent=s.w; prog.style.width='0';
    if(playing||userPlay) startAudio(s);
  }
  function startAudio(s){
    stopAudio(false);
    audio=new Audio(); audio.src=s.prev; audio.preload='auto'; audio.volume=0; audio.loop=true;
    audio.addEventListener('error',()=>{note.textContent='No se ha podido cargar el fragmento.';setPlaying(false)});
    audio.addEventListener('timeupdate',()=>{if(audio.duration)prog.style.width=(audio.currentTime/audio.duration*100)+'%'});
    audio.play().then(()=>{setPlaying(true);note.textContent='';fadeTo(1,500)}).catch(()=>{note.textContent='No se ha podido cargar el fragmento.';setPlaying(false)});
  }
  function fadeTo(v,ms){cancelAnimationFrame(fade);const a=audio,from=a.volume,t0=performance.now();(function st(){if(!audio||audio!==a)return;const k=Math.min(1,(performance.now()-t0)/ms);a.volume=Math.max(0,Math.min(1,from+(v-from)*k));if(k<1)fade=requestAnimationFrame(st);else if(v===0){a.pause()}})()}
  function stopAudio(soft){if(!audio)return;const a=audio;if(soft){fadeTo(0,350)}else{a.pause()}audio=null}
  function setPlaying(v){playing=v;play.setAttribute('aria-pressed',v?'true':'false');play.querySelector('.lbl').textContent=v?'Pausa':'Escuchar 30 s'}
  play.addEventListener('click',()=>{if(playing){stopAudio(true);setPlaying(false)}else startAudio(S[cur])});
  segs.forEach((b,i)=>{b.addEventListener('click',()=>show(i,false));b.addEventListener('mouseenter',()=>{if(!playing)show(i,false)})});
  lis.forEach((li,i)=>{li.addEventListener('click',()=>show(i,true));li.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();show(i,true)}})});
  show(0,false);
  // las URLs de los fragmentos caducan: se refrescan por JSONP (la API de iTunes no envía CORS)
  window.__itn=d=>{(d.results||[]).filter(x=>x.wrapperType==='track').forEach(x=>{const s=S[x.trackNumber-1];if(s&&x.previewUrl)s.prev=x.previewUrl})};
  const sc=document.createElement('script');sc.src='https://itunes.apple.com/lookup?id=6796842304&entity=song&callback=__itn';sc.async=true;document.head.appendChild(sc);
})();

/* ---------- vídeos: el iframe se carga al pulsar ---------- */
document.querySelectorAll('.video').forEach(v=>{
  v.querySelector('.vplay').addEventListener('click',()=>{
    const f=document.createElement('iframe');
    f.src=`https://www.youtube-nocookie.com/embed/${v.dataset.yt}?autoplay=1&rel=0`;
    f.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'; f.allowFullscreen=true; f.title=v.querySelector('.vplay').textContent;
    v.innerHTML=''; v.appendChild(f);
  });
});
/* ---------- vídeo dentro de las secciones de fondo ---------- */
document.querySelectorAll('.bleed[data-yt]').forEach(sec=>{
  const btn=sec.querySelector('.bplay'); if(!btn)return;
  btn.addEventListener('click',()=>{
    if(sec.classList.contains('playing'))return;
    const w=document.createElement('div'); w.className='vframe';
    const f=document.createElement('iframe');
    f.src=`https://www.youtube-nocookie.com/embed/${sec.dataset.yt}?autoplay=1&rel=0`;
    f.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'; f.allowFullscreen=true; f.title=btn.textContent.trim();
    const x=document.createElement('button'); x.type='button'; x.className='vclose'; x.textContent='Cerrar';
    x.addEventListener('click',()=>{sec.classList.remove('playing');setTimeout(()=>{w.remove();x.remove()},500)});
    w.appendChild(f); sec.appendChild(w); sec.appendChild(x);
    requestAnimationFrame(()=>sec.classList.add('playing'));
    sec.scrollIntoView({behavior:'smooth',block:'start'});
  });
});
/* ---------- (fin) ---------- */
})();
