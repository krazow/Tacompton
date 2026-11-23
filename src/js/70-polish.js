// =====================================================================================================
//  TACOMPTON · POLISH (1 of 2): the 📔 Memory book and 🌟 Lifetime achievements.  (71-polish-audio.js: read-aloud, sound, music)
//
//  📔 Memory book   every moment worth keeping across a whole life, by year: the life moments (10-life.js lifeMoment:
//                   graduation, first jobs, promotions, prom, a new baby…), the photos from 📷 Camera with their captions
//                   (55-phone-life.js photoSave, picked up on render), every birthday, and the first time in each neighborhood. Opens from the
//                   📅 Week tab (both modes) and the last screen. Saved with the game in S.mbook (made on first use, filled from
//                   S.life.moments and the phone's photos for older saves). It lives outside newState(), so it survives the
//                   move into your own place at 18. S.mbook = {v, items:[{d,y,age,ic,t,k,pl?}], vol:{day:1}, hoods:{h:day}, pn: photos seen}
//                   k: 'moment' | 'photo' | 'bday' | 'place'
//  🌟 Lifetime      LACH: achievements for a whole life (graduated, a first car, 10 years at one employer, raised a family,
//                   100 hours volunteering, every neighborhood, three decades…), checked on every render and at the end.
//                   Kept per profile (the player's name) on this device, across games: KEY('lifeach.<name>') = {id: time}.
//                   Listed in ⚙️ Settings and 🏅 Best scores. They sit on top of the per-game ACH (07-endings.js), not in it.
// =====================================================================================================
const MB_MAX=600;
function MBK(){if(!S)return null;if(S.mbook)return S.mbook;
  const B=S.mbook={v:1,items:[],vol:{},hoods:{}};
  try{   // an older save: start the book from what the game already remembers
    ((S.life&&S.life.moments)||[]).forEach(m=>B.items.push({d:m.d,y:mbYear(m.d),age:m.age,ic:m.ic,t:m.t,k:'moment'}));
    ((S.ph&&S.ph.photos)||[]).forEach(p=>B.items.push({d:p.d,y:mbYear(p.d),age:p.age!=null?p.age:S.age,ic:p.ic,t:p.cap,pl:p.pl,k:'photo'}));
    B.pn=mbPhotoN();B.items.sort((a,b)=>a.d-b.d)}catch(e){}
  return B}
const mbPhotoN=()=>S&&S.ph?(S.ph.nPhotos||(S.ph.photos||[]).length):0;
function mbYear(d){try{return dateOf(d).y}catch(e){return typeof yearNow==='function'?yearNow():2026}}
const mbPlain=t=>String(t||'').replace(/<[^>]+>/g,'').trim();
function mbAdd(k,ic,t,extra){const B=MBK();if(!B)return;const d=extra&&extra.d!=null?extra.d:day();
  B.items.push(Object.assign({d,y:mbYear(d),age:S.age,ic,t:mbPlain(t),k},extra||{}));
  if(B.items.length>MB_MAX){const i=B.items.findIndex((x,j)=>j>0&&x.k!=='photo');B.items.splice(i>0?i:1,1)}}   // keep the first memory and the photos
// moments, photos and birthdays
{const lm=lifeMoment;lifeMoment=function(ic,t){if(S&&S.life)MBK();const r=lm.apply(this,arguments);try{if(S&&S.life)mbAdd('moment',ic,t)}catch(e){}return r}}
if(typeof lifeBirthday==='function'){const lb=lifeBirthday;lifeBirthday=function(age){if(S)MBK();const r=lb.apply(this,arguments);
  try{const B=MBK();if(!B.items.some(x=>x.ic==='🎂'&&x.age===age))mbAdd('bday','🎂',`Turned ${age}.`)}catch(e){}return r}}
// first visits and volunteering: picked up from the game's own records on every render (both survive only until 18, the book keeps them)
function mbSync(){const B=MBK();if(!B)return;
  const H=S.hoods||{};for(const h in H)if(!B.hoods[h]){B.hoods[h]=H[h];const o=typeof HOODS!=='undefined'&&HOODS[h];
    if(o)mbAdd('place',o.ic||'🗺️',`First time in ${o.name}.`,{d:Math.max(0,(H[h]||day()+1)-1)})}
  const pn=mbPhotoN();if(pn<(B.pn||0))B.pn=0;   // photos (55-phone-life.js photoSave): the new ones since last time, with their captions
  if(pn>(B.pn||0)){const P=(S.ph.photos||[]).slice(-(pn-(B.pn||0)));B.pn=pn;P.forEach(p=>mbAdd('photo',p.ic,p.cap,{d:p.d,age:p.age!=null?p.age:S.age,pl:p.pl||''}))}
  const V=S.volunteer||{};for(const d in V)if(V[d]&&!B.vol[d])B.vol[d]=1}
const mbVolHours=()=>{const B=S&&S.mbook;return B?Object.keys(B.vol).length*2:0};

// ---- the book ----
function memoryBookHTML(){const B=MBK();if(!B||!B.items.length)return '<p>No memories yet. Moments, birthdays, photos and new places land here as you live.</p>';
  const by={};B.items.forEach(x=>{(by[x.y]=by[x.y]||[]).push(x)});
  const photos=B.items.filter(x=>x.k==='photo').length;
  return `<p style="font-size:13px;color:var(--mute)">${B.items.length} memor${B.items.length===1?'y':'ies'}${photos?`, ${photos} photo${photos===1?'':'s'}`:''}, by year. Newest year first.</p>`+
    Object.keys(by).sort((a,b)=>b-a).map(y=>{const L1=by[y].slice().sort((a,b)=>a.d-b.d),ages=[...new Set(L1.map(x=>x.age))];
      return `<div class="sect mb-year" data-y="${y}">${y} · age ${ages[0]}${ages.length>1?`–${ages[ages.length-1]}`:''}</div>`+L1.map(x=>`<div class="todo mb-item${x.k==='photo'?' mb-photo':''}"><span class="ck">${x.ic}</span><div><b>${esc(mbDay(x.d))}${x.k==='photo'?' · 📷 photo':''}</b><span>${esc(x.t)}${x.pl?` · ${esc(x.pl)}`:''}</span></div></div>`).join('')}).join('')}
function mbDay(d){try{return monthDay(d)}catch(e){return 'Day '+(d+1)}}
function memoryBook(back){
  modal('📔 Memory book',memoryBookHTML(),(back?[{l:'Back',fn:back}]:[]).concat([{l:'Close',fn:()=>{}}]))}
window.memoryBook=memoryBook;
const mbButton=()=>{const B=S&&S.mbook,n=B?B.items.length:0;
  return `<button class="act mb-open" onclick="memoryBook()"><span class="tx"><b>📔 Memory book</b><span>${n?`${n} memor${n===1?'y':'ies'} so far, by year, with your photos.`:'Moments, birthdays, photos and places, by year.'}</span></span></button>`};
{const wv=weekView;weekView=function(){const h=wv.apply(this,arguments);try{MBK();return mbButton()+h}catch(e){return h}}}
if(typeof GROW!=='undefined'&&GROW.weekView){const wv=GROW.weekView;GROW.weekView=function(){const h=wv.apply(this,arguments);try{MBK();return mbButton()+h}catch(e){return h}}}
// the last screen: a 📔 Memory book button above 🏅 Best scores (or Back to title), and the lifetime achievements earned this game
{const es=endScreen;endScreen=function(){if(S)try{MBK();mbSync();lachCheck()}catch(e){}const r=es.apply(this,arguments);
  try{const e=document.querySelector('.end');if(e&&!e.querySelector('#memBtn')&&S&&S.mbook){const bs=[...e.querySelectorAll('button.act')],b=bs.find(x=>/Best scores/.test(x.textContent))||bs.pop();
    const n=S.mbook.items.length,lg=(S.lachGame||[]).map(id=>LACH.find(a=>a.id===id)).filter(Boolean);
    if(b)b.insertAdjacentHTML('beforebegin',`${lg.length?`<div class="kv"><span>🌟 Lifetime achievements this game</span><b style="text-align:right">${lg.map(a=>a.ic+' '+a.n).join(', ')}</b></div>`:''}<button id="memBtn" class="act" style="margin-top:10px;justify-content:center" onclick="memoryBook()"><span class="tx" style="text-align:center"><b>📔 Memory book</b><span>${n} memor${n===1?'y':'ies'}, by year</span></span></button>`)}}catch(e){}
  return r}}

// ---- 🌟 lifetime achievements ----
const lachJobYears=()=>{const J=(S.life&&S.life.jobs)||[];if(!J.length||isGrow())return 0;const k=J[J.length-1].job;let i=J.length-1;
  while(i>0&&J[i-1].job===k)i--;return S.age-J[i].age};
const lachDecades=()=>{const y0=S.startYear||2026,y1=typeof yearNow==='function'?yearNow():y0;return Math.floor(y1/10)-Math.floor(y0/10)+1};
const lachParentYears=()=>{const st=((S.life&&S.life.stages)||[]).find(x=>/Parent/.test(x.stage));return st?S.age-st.age:-1};
const lachHoods=()=>{const B=S.mbook;if(typeof HOODS==='undefined'||!B)return false;const k=Object.keys(HOODS);return k.length>0&&k.every(h=>B.hoods[h]||(S.hoods||{})[h])};
const lachItems=re=>((S.mbook&&S.mbook.items)||[]).filter(x=>re.test(x.t)).length;
const LACH=[
  {id:'graduated',ic:'🎓',n:'Graduated',d:'Finish high school at Hilltop High.',test:()=>!!(S.life&&S.life.graduated)||lachItems(/^Graduated/)>0},
  {id:'firstcar',ic:'🚗',n:'First Car',d:'Buy a car of your own.',test:()=>!!(S.car&&S.car.own)},
  {id:'bestfriend',ic:'🤝',n:'A Friend for Life',d:'Make a best friend while growing up.',test:()=>!!(S.life&&(S.life.best||(S.life.grow&&S.life.grow.best)))},
  {id:'promoted',ic:'⬆️',n:'Moving Up',d:'Earn a promotion at work.',test:()=>lachItems(/promoted/i)>0},
  {id:'tenyears',ic:'🏅',n:'Ten Years In',d:'Work ten years for the same employer.',test:()=>lachJobYears()>=10},
  {id:'family',ic:'👪',n:'Raised a Family',d:'Be a parent for 18 years, in a Lifetime game.',test:()=>lachParentYears()>=18},
  {id:'volunteer',ic:'🤲',n:'100 Hours of Helping',d:'Help out with community programs for 100 hours in one life.',test:()=>mbVolHours()>=100},
  {id:'everyhood',ic:'🗺️',n:'Every Neighborhood',d:'See every Tacoma neighborhood in one life, growing up included.',test:lachHoods},
  {id:'decades',ic:'📆',n:'Three Decades',d:'Live through three decades, say the 1990s, 2000s and 2010s.',test:()=>lachDecades()>=3},
  {id:'album',ic:'🖼️',n:'Photo Album',d:'Take 25 photos in one life.',test:()=>((S.mbook&&S.mbook.items)||[]).filter(x=>x.k==='photo').length>=25},
  {id:'fullbook',ic:'📔',n:'A Full Memory Book',d:'Collect 100 memories in one life.',test:()=>((S.mbook&&S.mbook.items)||[]).length>=100},
  {id:'retired',ic:'🎉',n:'Retired',d:'Work all the way to retirement at 67.',test:()=>!!(S.life&&S.life.retired)},
  {id:'eighty',ic:'🎂',n:'Eighty Candles',d:'Celebrate your 80th birthday.',test:()=>S.age>=80},
];
const lachKey=()=>KEY('lifeach.'+(profileName()||currentName()||'player').toLowerCase());
function lachGot(){try{const o=JSON.parse(localStorage.getItem(lachKey())||'{}');return o&&typeof o==='object'&&!Array.isArray(o)?o:{}}catch(e){return {}}}
const lachCount=()=>{const g=lachGot();return LACH.filter(a=>g[a.id]).length};
function lachUnlock(id){const a=LACH.find(x=>x.id===id);if(!a)return;const g=lachGot();if(g[id])return;g[id]=Date.now();
  try{localStorage.setItem(lachKey(),JSON.stringify(g))}catch(e){}
  if(S){S.lachGame=S.lachGame||[];S.lachGame.push(id)}
  setTimeout(()=>showTile(a.ic,'Lifetime achievement: '+a.n,a.d,'good','🌟'),0)}
function lachCheck(){if(!S||!S.life)return;const g=lachGot();for(const a of LACH){if(g[a.id])continue;let ok=false;try{ok=a.test()}catch(e){}if(ok)lachUnlock(a.id)}}
function lachHTML(){const g=lachGot();
  return `<div class="sect">🌟 Lifetime achievements (${lachCount()}/${LACH.length})</div><p style="font-size:13px;color:var(--mute)">For a whole life, not one week. Kept for ${esc(currentName())} on this device, across all your games.</p>`+
    LACH.map(a=>`<div class="todo lach"><span class="ck">${g[a.id]?a.ic:'🔒'}</span><div><b>${a.n}</b><span>${a.d}${g[a.id]?` · earned ${new Date(g[a.id]).toLocaleDateString()}`:''}</span></div></div>`).join('')}
function lachModal(back){modal(`🌟 Lifetime achievements (${lachCount()}/${LACH.length})`,lachHTML().replace(/^<div class="sect">.*?<\/div>/,''),(back?[{l:'Back to settings',fn:back}]:[]).concat([{l:'Close',fn:()=>{}}]))}
window.lachModal=lachModal;
{const r0=render;render=function(){const r=r0.apply(this,arguments);try{if(S&&!S.over){MBK();mbSync();lachCheck()}}catch(e){}return r}}

// ---- edit the next pop-up a function opens (Settings, Best scores, Accessibility): add rows without rewriting them ----
function polishEdit(fn,edit){return function(){const m=modal,ms=modalSwap;let done=false;
  const hook=o=>(t,b,btns,nc)=>{if(!done){done=true;try{[t,b,btns]=edit(t,b,btns.slice())}catch(e){}}return o(t,b,btns,nc)};
  modal=hook(m);modalSwap=hook(ms);try{return fn.apply(this,arguments)}finally{modal=m;modalSwap=ms}}}
{const b=bestScoresModal;bestScoresModal=polishEdit(b,(t,body,btns)=>[t,body+lachHTML(),btns]);window.bestScoresModal=bestScoresModal}
{const os=window.openSettings;window.openSettings=polishEdit(os,(t,body,btns)=>{
  const i=btns.findIndex(x=>/^🏆 Achievements/.test(x.l));
  btns.splice(i<0?btns.length-1:i+1,0,{l:`🌟 Lifetime achievements (${lachCount()}/${LACH.length})`,s:'For a whole life: graduating, a first car, ten years at one job and more. Kept for your name, across games.',fn:()=>lachModal(window.openSettings)},
    ...(S&&S.mbook&&S.mbook.items.length?[{l:'📔 Memory book',s:'Your moments, birthdays, photos and places, by year.',fn:()=>memoryBook(window.openSettings)}]:[]));
  return [t,body,btns]})}
window.POLISH={MBK,mbAdd,mbSync,memoryBook,memoryBookHTML,LACH,lachGot,lachCheck,lachKey,lachUnlock,polishEdit};
