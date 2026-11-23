// =====================================================================================================
//  TACOMPTON · POLISH (2 of 2): 🗣️ Read aloud, 🔊 sound effects and 🎵 music.  Everything here works offline: no files, no network.
//
//  🗣️ Read aloud   ⚙️ Settings → ♿ Accessibility. Off by default. Reads each pop-up as it opens (the morning report, event
//                  pop-ups, every sheet) and event tiles, with the browser's speechSynthesis and a voice on this device
//                  (localService voices only, so nothing goes over the network). Voice and speed are prefs (raVoice, raRate).
//                  With it on, every pop-up has a 🔊 button to read it again (tap again to stop).
//  🔊 Sounds       the old sfx() (01-core.js) plus 💰 money, 🔔 the Link bell, 🌧️ rain on a rainy morning and taps on pop-up
//                  buttons, through one volume (sfxVol). With Reduce motion on, taps and rain stay quiet.
//  🎵 Music        off by default. A gentle generated loop that follows the time of day (morning, afternoon, evening, night),
//                  with its own volume (musicVol). With Reduce motion on it is a soft pad only, no melody.
//  No sound and no speech before the player's first tap or key press: until then audio() returns null and nothing is made.
//  Prefs (01-core.js prefs(), device-wide): sound, sfxVol, music, musicVol, ra, raVoice, raRate.
// =====================================================================================================
Object.assign(PREF_DEF,{sfxVol:0.7,music:false,musicVol:0.5,ra:false,raVoice:'',raRate:1});
let AUD_GO=false,AUD_LAST=0,SFX_G=null,MUS={on:false,g:null,iv:null,step:0};
function audGesture(){AUD_LAST=Date.now();if(AUD_GO)return;AUD_GO=true;setTimeout(musicSync,0)}
['pointerdown','keydown','touchstart'].forEach(e=>addEventListener(e,audGesture,{capture:true,passive:true}));
audio=function(){if(!AUD_GO)return null;
  if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)()}catch(e){return null}SFX_G=null;MUS.g=null}
  if(AC.state==='suspended'&&AC.resume)try{AC.resume().catch(()=>{})}catch(e){}
  return AC};
function sfxOut(a){if(!SFX_G){SFX_G=a.createGain();SFX_G.connect(a.destination)}SFX_G.gain.value=Math.max(0,Math.min(1,prefs().sfxVol))*1.4;return SFX_G}
tone=function(f,dur,type,vol,when,slide,out){const a=audio();if(!a)return;const t=a.currentTime+(when||0),o=a.createOscillator(),g=a.createGain();
  o.type=type||'sine';o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(slide,t+dur);
  const att=out?Math.min(1.2,dur/3):0.03;g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol||0.1,t+att);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  o.connect(g);g.connect(out||sfxOut(a));o.start(t);o.stop(t+dur+0.05)};
function noise(dur,vol,freq,out){const a=audio();if(!a)return;const n=Math.floor(a.sampleRate*dur),b=a.createBuffer(1,n,a.sampleRate),c=b.getChannelData(0);
  for(let i=0;i<n;i++)c[i]=(Math.random()*2-1)*(Math.random()<0.02?1:0.35);
  const s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain(),t=a.currentTime;s.buffer=b;f.type='lowpass';f.frequency.value=freq||1800;
  g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+dur*0.3);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  s.connect(f);f.connect(g);g.connect(out||sfxOut(a));s.start(t);s.stop(t+dur+0.05)}
Object.assign(SFX,{
  money:()=>{tone(1319,0.12,'sine',0.06);tone(1760,0.22,'sine',0.05,0.08)},
  bell: ()=>{tone(1245,0.9,'triangle',0.07);tone(2490,0.5,'sine',0.02);tone(1245,0.9,'triangle',0.06,0.32);tone(2490,0.5,'sine',0.02,0.32)},
  rain: ()=>noise(2.6,0.05,1400),
});
const SFX_GENTLE={tap:1,rain:1};   // stay quiet with Reduce motion on
sfx=function(n){const p=prefs();if(!p.sound||!SFX[n]||(p.rm&&SFX_GENTLE[n]))return;try{SFX[n]()}catch(e){}};
// taps on pop-up buttons, 💰 when money comes in from something you did, 🔔 on the T Line, 🌧️ on a rainy morning
{const mb=window.MBTN;window.MBTN=function(i){sfx('tap');return mb.apply(this,arguments)}}
{let last=0;const m0=money;money=function(v){const r=m0.apply(this,arguments);const now=Date.now();
  if(v>=1&&now-AUD_LAST<1500&&now-last>900&&!(S&&S.over)){last=now;sfx('money')}return r}}
{const fh=fireHook;fireHook=function(hook){if(hook==='ride'||hook==='linkwatch')sfx('bell');return fh.apply(this,arguments)}}
{const mr=morningReport;morningReport=function(){const r=mr.apply(this,arguments);try{const w=typeof wxOf==='function'&&wxOf(day());if(w&&WX[w]&&WX[w].wet)setTimeout(()=>sfx('rain'),400)}catch(e){}return r}}

// ---- 🎵 music: a few notes every couple of seconds, picked for the time of day ----
const MUSIC_TOD={
  morning:  {root:261.63,scale:[0,2,4,7,9,12,14],pad:[0,4,7],wave:'sine',ev:2},
  afternoon:{root:293.66,scale:[0,2,4,7,9,12],pad:[0,7,12],wave:'sine',ev:2},
  evening:  {root:220.00,scale:[0,3,5,7,10,12],pad:[0,3,7],wave:'triangle',ev:3},
  night:    {root:196.00,scale:[0,3,7,10,12],pad:[0,7,10],wave:'sine',ev:4},
};
function musicTod(){const m=S&&!S.over&&typeof tod==='function'?tod():new Date().getHours()*60+new Date().getMinutes();
  return m>=300&&m<690?'morning':m<1020&&m>=690?'afternoon':m>=1020&&m<1260?'evening':'night'}
function musicOut(a){if(!MUS.g){MUS.g=a.createGain();MUS.g.connect(a.destination)}MUS.g.gain.value=Math.max(0,Math.min(1,prefs().musicVol))*0.6;return MUS.g}
const hz=(r,s)=>r*Math.pow(2,s/12);
function musicStep(){const a=audio();if(!a||!MUS.on)return;const T=MUSIC_TOD[musicTod()],out=musicOut(a),n=MUS.step++;
  if(n%4===0)T.pad.forEach(s=>tone(hz(T.root/2,s),7.5,'sine',0.035,0,null,out));   // a soft chord every 8 seconds
  if(!prefs().rm&&n%T.ev!==1){const k=1+Math.floor(Math.random()*2);for(let i=0;i<k;i++)tone(hz(T.root,T.scale[Math.floor(Math.random()*T.scale.length)]),1.8,T.wave,0.03,i*0.7,null,out)}
  try{const w=S&&!S.over&&typeof wxOf==='function'&&wxOf(day());if(w&&WX[w]&&WX[w].wet&&!prefs().rm&&n%3===0)noise(2.2,0.02,1200,out)}catch(e){}}
function musicSync(){const want=!!prefs().music&&AUD_GO&&!document.hidden;
  if(want&&!MUS.on){if(!audio())return;MUS.on=true;MUS.step=0;musicStep();MUS.iv=setInterval(musicStep,2000)}
  else if(!want&&MUS.on){MUS.on=false;clearInterval(MUS.iv);MUS.iv=null;
    if(MUS.g&&AC){try{MUS.g.gain.setTargetAtTime(0.0001,AC.currentTime,0.15)}catch(e){}const g=MUS.g;MUS.g=null;setTimeout(()=>{try{g.disconnect()}catch(e){}},600)}
    if(!prefs().sound&&AC){const a=AC;AC=null;SFX_G=null;try{a.close()}catch(e){}}}   // nothing else needs the speaker: let it go
  else if(MUS.on&&MUS.g)musicOut(AC)}
document.addEventListener('visibilitychange',()=>{if(document.hidden&&MUS.on){MUS.on=false;clearInterval(MUS.iv);MUS.iv=null;if(AC&&AC.suspend)try{AC.suspend()}catch(e){}}else musicSync()});

// ---- 🗣️ read aloud ----
const raOK=()=>typeof window.speechSynthesis!=='undefined'&&typeof window.SpeechSynthesisUtterance!=='undefined';
function raVoices(){if(!raOK())return [];let v=[];try{v=speechSynthesis.getVoices()||[]}catch(e){}const local=v.filter(x=>x.localService!==false);
  const en=local.filter(x=>/^en\b|^en-/i.test(x.lang||''));return en.length?en:local}
const raClean=t=>String(t||'').replace(/<[^>]+>/g,' ').replace(/[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}️‍⃣]/gu,'').replace(/[−–—]/g,', ').replace(/\s+/g,' ').trim();
let RA_ON=false;
function speak(text,force){const p=prefs();if((!p.ra&&!force)||!raOK()||!AUD_GO)return false;const t=raClean(text);if(!t)return false;
  try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t),vs=raVoices(),v=vs.find(x=>x.name===p.raVoice)||vs[0];
    if(v){u.voice=v;u.lang=v.lang}u.rate=Number(p.raRate)||1;u.onend=u.onerror=()=>{RA_ON=false};RA_ON=true;speechSynthesis.speak(u);return true}catch(e){return false}}
function speakStop(){RA_ON=false;try{raOK()&&speechSynthesis.cancel()}catch(e){}}
function modalText(){const m=document.querySelector('#mbg .modal');if(!m)return '';const h=m.querySelector('h2'),b=m.querySelector('.mb');
  return (h?h.textContent+'. ':'')+(b?b.innerText||b.textContent:'')}
window.speakModal=again=>{if(again&&RA_ON){speakStop();return}speak(modalText(),!!again)};
{const sh=sheetHTML;sheetHTML=function(){let h=sh.apply(this,arguments);if(!prefs().ra||!raOK())return h;
  h=h.replace('</h2>','</h2><button class="ra-btn" onclick="speakModal(true)" aria-label="Read this aloud" title="Read aloud" style="position:absolute;top:10px;right:10px;border:0;background:var(--surface,#eee);border-radius:50%;width:36px;height:36px;font-size:18px;cursor:pointer">🔊</button>')
    .replace('class="modal"','class="modal" style="position:relative"');
  setTimeout(()=>speakModal(false),80);return h}}
{const st=showTile;showTile=function(ic,title,sub){const box=document.getElementById('tiles'),n0=box?box.children.length:0;const r=st.apply(this,arguments);
  try{const b2=document.getElementById('tiles');if(prefs().ra&&b2&&b2.children.length>n0&&!document.getElementById('mbg'))speak(withName(title)+'. '+withName(sub||''))}catch(e){}return r}}
{const mc=modalClosed;modalClosed=function(){if(prefs().ra&&!document.getElementById('mbg'))speakStop();return mc.apply(this,arguments)}}

// ---- ⚙️ Settings: 🔊 Sound and music, and Read aloud in ♿ Accessibility ----
const pct=v=>Math.round(v*100)+'%',VOLS=[0.25,0.5,0.75,1];
const nextVol=v=>VOLS[(VOLS.findIndex(x=>Math.abs(x-v)<0.01)+1)%VOLS.length]||0.5;
function soundModal(back){const p=prefs();back=back||window.openSettings;
  modal('🔊 Sound and music','<p>Made right here in the game, so it works offline. Nothing plays until you tap something.</p>',[
    {l:`🔊 Sound effects: ${p.sound?'On':'Off'}`,s:'Chimes and alerts, taps, 💰 money, the 🔔 T Line bell and 🌧️ rain.',fn:()=>{setPref('sound',!p.sound);if(!p.sound)sfx('good');musicSync();soundModal(back)}},
    {l:`🔉 Effects volume: ${pct(p.sfxVol)}`,s:'Tap to change: 25%, 50%, 75%, 100%.',fn:()=>{setPref('sfxVol',nextVol(p.sfxVol));sfx('good');soundModal(back)}},
    {l:`🎵 Music: ${p.music?'On':'Off'}`,s:'Gentle background music that follows the time of day: bright mornings, slow evenings, quiet nights.',fn:()=>{setPref('music',!p.music);musicSync();soundModal(back)}},
    {l:`🎚️ Music volume: ${pct(p.musicVol)}`,s:'Tap to change: 25%, 50%, 75%, 100%.',fn:()=>{setPref('musicVol',nextVol(p.musicVol));musicSync();soundModal(back)}},
    {l:'Back to settings',fn:()=>back()}]);
}
window.soundModal=soundModal;
function raVoiceName(){const vs=raVoices(),p=prefs(),v=vs.find(x=>x.name===p.raVoice)||vs[0];return v?v.name:'the device’s voice'}
const RATES=[0.8,1,1.25,1.5];
function raModal(back){const p=prefs(),vs=raVoices();
  if(!raOK())return modal('🗣️ Read aloud','<p>This browser can’t read text aloud. Try another browser, or your device’s own screen reader.</p>',[{l:'Back',fn:back}]);
  modal('🗣️ Read aloud','<p>Reads the morning report, events and pop-ups aloud with a voice on this device. Nothing goes over the internet.</p>',[
    {l:`🗣️ Read aloud: ${p.ra?'On':'Off'}`,s:p.ra?'Pop-ups are read as they open, with a 🔊 button to hear one again.':'Tap to turn on.',fn:()=>{setPref('ra',!p.ra);if(!p.ra)speak('Read aloud is on.',true);else speakStop();raModal(back)}},
    {l:`🎙️ Voice: ${esc(raVoiceName())}`,s:vs.length>1?`Tap for the next one (${vs.length} on this device).`:'The only voice on this device.',dis:vs.length<2,fn:()=>{const i=vs.findIndex(x=>x.name===raVoiceName());setPref('raVoice',vs[(i+1)%vs.length].name);speak('This is my voice.',true);raModal(back)}},
    {l:`⏩ Speed: ${Number(p.raRate)||1}×`,s:'Tap to change: 0.8×, 1×, 1.25×, 1.5×.',fn:()=>{const i=RATES.indexOf(Number(p.raRate)||1);setPref('raRate',RATES[(i+1)%RATES.length]);speak('This is how fast I read.',true);raModal(back)}},
    {l:'Back',fn:back}]);
}
window.raModal=raModal;
accessModal=polishEdit(accessModal,(t,b,btns)=>{const i=btns.findIndex(x=>/^Back/.test(x.l));
  btns.splice(i<0?btns.length:i,0,{l:`🗣️ Read aloud: ${prefs().ra?'On':'Off'}`,s:'Reads the morning report, events and pop-ups aloud. Voice and speed.',fn:()=>raModal(()=>accessModal())});return [t,b,btns]});
{const os=window.openSettings;window.openSettings=polishEdit(os,(t,body,btns)=>{const i=btns.findIndex(x=>/^🔊 Sound/.test(x.l)),p=prefs();
  const row={l:`🔊 Sound and music`,s:`Sound effects: ${p.sound?'On':'Off'} · Music: ${p.music?'On':'Off'}. Volumes for each.`,fn:()=>soundModal()};
  if(i>=0)btns[i]=row;else btns.splice(1,0,row);
  const j=btns.findIndex(x=>/^♿ Accessibility/.test(x.l));if(j>=0)btns[j]=Object.assign({},btns[j],{s:btns[j].s+` · Read aloud: ${p.ra?'On':'Off'}`});
  return [t,body,btns]})}
window.POLISH_AUDIO={audio:()=>audio(),musicSync,musicStep,MUS,speak,speakStop,soundModal,raModal,raVoices,gesture:()=>AUD_GO};
