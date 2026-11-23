// ---------------- 📱 phone: the phone by era (home phones and pay phones, pagers, flip phones, smartphones) ----------------
// Each phone feature arrives in the year it became common; before that, the game offers the way people did it then.
// The year comes from yearNow()/eraHas() (63-era.js, the start-year builder's). Until that file exists the year is 2026, and
// in 2026 nothing here changes anything: every wrap below falls through to the phone as it is.
//
// Devices (epDev()):
//   'land'  before cell phones (adults before ERA 'cell', kids before 2000): the home phone on the kitchen wall with an answering
//           machine. Calls only from home, or from a pay phone anywhere in town for a quarter. No Messages, no battery.
//           Calls that come while you're out go to the machine; in the pager years (1980s–1990s, adults) your pager buzzes too:
//           find a phone and call back. Kids: Mom and Dad's phone-line limit (EP_LINE minutes a day).
//   'cell'  adults from 'cell' (late 1990s) until 'text': calls from anywhere, no texts.
//   'flip'  adults from 'text' until 'apps' (kids 2000–2009): calls and texts (10¢ a text), a camera from 'camera'. No App Store.
//   'smart' adults from 'apps' (2008), kids from 2010: the phone as it is, each App Store app from its own year.
// definePhoneApp({era:'streaming'}) hides an app before its year (its when() is wrapped; apps defined before this file get
// their era from EP_APP). An app or a device that arrives during a game is announced: a note in the morning and a 🛍️ App Store
// notification, or a line in the time-skip summary.
// The "before that" ways are actions on the main screen: 🚕 call a cab, 🗺️ the Thomas Guide (MapQuest printouts from 1998) and
// the paper bus schedule, 📰 the morning paper (weather, classifieds) and 📺 the evening news, 🏦 the bank branch (online
// banking from 1998), 📸 a film camera and one-hour photo, 🎧 a Walkman / Discman / iPod, and the block club's phone tree.
// State: PH().era = {ann:{dev,app:{id:1}}, pages:[{id,t}], line:{day:min}, paper, news, music, odd} (lazy).
(function(){
const EP_Y={pager:1985,cell:1998,onlineBank:1998,jobSites:1998,mapquest:1998,datingWeb:1998,text:2002,camera:2003,apps:2008,maps:2008,
  transitLive:2008,weather:2008,orca:2009,phoneBank:2010,nextdoor:2011,streaming:2011,datingApp:2012,rideshare:2014,gig:2015,grocery:2015,
  telehealth:2020,walkman:1980,discman:1990,ipod:2001};
const EP_APP={msg:'text',store:'apps',flash:'apps',notes:'apps',camera:'camera',photos:'camera',transit:'transitLive',maps:'maps',weather:'weather',
  rides:'rideshare',bank:'phoneBank',jobs:'gig',groc:'grocery',health:'telehealth',club:'nextdoor',hearts:'datingApp',chat:'apps',homework:'apps',
  music:'streaming',blocks:'apps'};
const EP_LINE=30, EP_QUARTER=0.25, EP_TEXT=0.10;
const epTry=(f,d)=>{try{return f()}catch(e){console.error(e);return d}};
function epYear(){try{if(typeof yearNow==='function'){const y=+yearNow();if(y>0)return y}}catch(e){}return 2026}
function epHas(f){try{if(typeof eraHas==='function'&&typeof ERA_FEATURES!=='undefined'&&ERA_FEATURES&&f in ERA_FEATURES)return !!eraHas(f)}catch(e){}
  return epYear()>=(EP_Y[f]||0)}
// the first year of a feature: ERA_FEATURES (63-era.js) when it has it, otherwise this file's table
const epY=f=>(typeof ERA_FEATURES!=='undefined'&&ERA_FEATURES&&ERA_FEATURES[f])||EP_Y[f]||0;
const epKid=()=>typeof S!=='undefined'&&!!S&&isGrow()&&(S.age==null?12:S.age)<18;
function epDev(){if(typeof S==='undefined'||!S)return 'smart';const y=epYear();
  if(epKid()){if(y<2000||!epHas('cell'))return 'land';return y<2010?'flip':'smart'}
  if(!epHas('cell'))return 'land';if(!epHas('text'))return 'cell';if(!epHas('apps'))return 'flip';return 'smart'}
const epText=()=>{const d=epDev();return (d==='flip'||d==='smart')&&epHas('text')};
const epCam=()=>{const d=epDev();return (d==='flip'||d==='smart')&&epHas('camera')};
const epPager=()=>!epKid()&&epDev()==='land'&&epHas('pager')&&epYear()<2000;
function EPS(){const P=PH(),E=P.era=P.era||{};E.pages=E.pages||[];E.line=E.line||{};return E}
const epAdult=()=>!!S&&!isGrow();
// the land line: at home, or a pay phone anywhere in town (not under the firs or down the ravine)
const epPayHere=()=>!!S&&S.loc!=='home'&&!PHONE_WEAK.includes(S.loc);
const epReach=()=>!!S&&(S.loc==='home'||epPayHere());
const epLineUsed=()=>{const E=S&&S.ph&&S.ph.era;return E&&E.line?(E.line[day()]||0):0};
const epMusic=()=>epHas('ipod')?'iPod':epHas('discman')?'Discman':'Walkman';

// ---- apps by era ----
function epAppOk(a){const f=a&&a.era;if(!f)return true;if(!epHas(f))return false;const d=epDev();
  if(f==='text'||f==='camera')return d==='flip'||d==='smart';return d==='smart'}
function epWrap(a){if(!a||a.epW)return a;if(!a.era&&EP_APP[a.id])a.era=EP_APP[a.id];const w=a.when;
  a.when=function(){return epAppOk(a)&&w.apply(this,arguments)};a.epW=true;epRename(a);return a}
// the home phone's own names
const EP_NAMES={call:['Home phone','☎️'],contacts:['Address book','📇'],clock:['Alarm clock','⏰'],settings:['Phone bill','🧾']};
function epRename(a){const R=EP_NAMES[a.id];if(!R||a.epN)return;a.epN=true;const n0=a.name,i0=a.ic;
  Object.defineProperty(a,'name',{configurable:true,enumerable:true,get(){return epDev()==='land'?R[0]:n0}});
  Object.defineProperty(a,'ic',{configurable:true,enumerable:true,get(){return epDev()==='land'?R[1]:i0}})}
PHONE_APPS.forEach(epWrap);
{const d0=definePhoneApp;definePhoneApp=function(a){d0.apply(this,arguments);epWrap(phoneApp(a.id))}}

// ---- the device: owned, usable, battery ----
{const o=phoneOwned;phoneOwned=function(){if(typeof S==='undefined'||!S)return false;
  if(epDev()==='land')return !(epKid()&&typeof pgTaken==='function'&&pgTaken());return o.apply(this,arguments)}}
{const o=phoneCan;phoneCan=function(){const r=o.apply(this,arguments);return epDev()==='land'?r&&epReach():r}}
{const o=phoneUse;phoneUse=function(){if(S&&epDev()==='land')return;return o.apply(this,arguments)}}
{const o=phoneTick;phoneTick=function(){const r=o.apply(this,arguments);if(S&&S.ph&&epDev()==='land')S.ph.batt=100;return r}}
{const o=phoneMorning;phoneMorning=function(){if(S&&S.ph&&epDev()==='land')S.ph.batt=100;return o.apply(this,arguments)}}

// ---- calls without texting: Messages is off, calls still work ----
// msgOn() is "texts and calls work"; with no texting it is true only for calls (EP_VOICE: inside the Phone app, Contacts,
// a call starting, the ring timer). Invitations and the rent scam then happen the old way, in person.
let EP_VOICE=0;
const epVoice=f=>{EP_VOICE++;try{return f()}finally{EP_VOICE--}};
{const o=msgOn;msgOn=function(){const r=o.apply(this,arguments);if(!r||epText())return r;return EP_VOICE>0}}
{const o=window.PHA;window.PHA=function(i){const top=PH_NAV[PH_NAV.length-1];if(top&&(top.app==='call'||top.app==='contacts'))return epVoice(()=>o(i));return o(i)}}
for(let i=0;i<PH_TIMERS.length;i++){const f=PH_TIMERS[i];if(/callSchedule/.test(String(f)))PH_TIMERS[i]=m=>epVoice(()=>f(m))}
// a page or a call back: they pick up
let EP_BACK=null;
{const o=phAvail;phAvail=function(id){return EP_BACK&&EP_BACK===id?'free':o.apply(this,arguments)}}
{const o=callStart;callStart=function(id){const d=epDev();
  if(d==='land'&&epVoice(()=>msgOn())){
    if(epKid()&&epLineUsed()>=EP_LINE){say(`☎️ “Off the phone!” Dad needs the line. ${EP_LINE} minutes a day on the phone, that’s the rule. Tomorrow.`);return}
    if(S.loc!=='home'){if(S.money<EP_QUARTER){say('🪙 Not even a quarter for the pay phone.');return}spend(EP_QUARTER);say('🪙 You drop a quarter in the pay phone and dial.')}}
  return epVoice(()=>o.apply(this,arguments))}}
{const o=callTime;callTime=function(min){if(S&&epKid()&&epDev()==='land'){const L0=EPS().line;L0[day()]=(L0[day()]||0)+(min||0)}return o.apply(this,arguments)}}
// pay-per-text on a flip phone
{const o=msgSend;msgSend=function(){const r=o.apply(this,arguments);if(r&&epDev()==='flip'&&!isGrow())spend(EP_TEXT);return r}}
function epRing(id){const c=CL();if(c.ring||CALL_NOW)return false;c.ring={id,t:S.t,until:S.t+15};
  try{if(phoneCan())showTile(epDev()==='land'?'☎️':'📞',`${msgFirst(id)} is calling`,epDev()==='land'?'The phone is ringing in the kitchen.':'Open your 📱 phone to answer.','info')}catch(e){}return true}
function epPage(id){const E=EPS();E.pages=E.pages.filter(p=>p.id!==id).concat({id,t:S.t}).slice(-5);
  try{showTile('📟','Your pager buzzes',`${msgFirst(id)}’s number. Find a phone and call back.`,'info')}catch(e){}
  say(`📟 Your pager buzzes: ${esc(msgFirst(id))}’s number. Find a phone (home, or a pay phone for a quarter) and call back.`)}
function epCallBack(id){const E=EPS();E.pages=E.pages.filter(p=>p.id!==id);EP_BACK=id;try{callStart(id)}finally{EP_BACK=null}}
// after the other timers: call-backs ring (no texts to send), and the home phone can't ring where you are
phoneOnTime(min=>{if(!S||S.over||!S.ph||epText())return;
  if(min===0){const E=S.ph.era;if(E&&E.pages)E.pages=E.pages.filter(p=>Math.floor(p.t/1440)>=day());return}
  const M=S.ph.msg;if(M&&M.q){const due=M.q.filter(it=>it.k==='cb'&&it.at<=S.t);if(due.length){M.q=M.q.filter(it=>!due.includes(it));epVoice(()=>{if(msgOn()||epDev()==='land')epRing(due[0].id)})}}
  if(epDev()==='land'&&S.ph.calls){const c=S.ph.calls;if(c.ring&&S.loc!=='home'){const r=c.ring;c.ring=null;
    callLog({id:r.id,t:r.t,dir:'missed',seen:false,vm:pick(CALL_VM),heard:false});if(epPager())epPage(r.id)}}});

// ---- the screens ----
const epTipTxt=d=>d==='land'?`☎️ <b>The home phone.</b> Calls from home, or from a pay phone in town for a quarter. Calls that come while you’re out go to the answering machine${epPager()?', and your 📟 pager buzzes':''}. ❓ Help → Your phone has the rest.`
  :d==='cell'?'📱 <b>Your cell phone.</b> Calls from anywhere with a signal. No texting yet. ❓ Help → Your phone has the rest.'
  :`📱 <b>Your flip phone.</b> Calls${epText()?' and texts':''}${epText()&&!isGrow()?` (${$(EP_TEXT)} a text)`:''}. No App Store yet. ❓ Help → Your phone has the rest.`;
function epHomeCard(){const d=epDev();if(d!=='land')return '';const E=EPS(),home=S.loc==='home';
  let h=phCard(home?`☎️ <b>The phone on the kitchen wall</b>, with a long curly cord.${epKid()?` Mom and Dad’s rule: ${EP_LINE} minutes a day (${Math.max(0,EP_LINE-epLineUsed())} left today).`:''}`
    :`🪙 <b>A pay phone.</b> ${$(EP_QUARTER)} a call. The answering machine’s messages wait at home.`);
  if(E.pages.length)h+=phSub('📟 Pages')+E.pages.map(p=>phBtn(`📞 Call back ${esc(msgFirst(p.id))}`,()=>epCallBack(p.id),{cls:'primary',sub:`Paged at ${fmt(p.t%1440)}.${home?'':' A quarter.'}`})).join('');
  return h}
{const o=phoneScreen;phoneScreen=function(){const d=epDev();if(d==='smart')return o.apply(this,arguments);
  if(d==='land'&&!epReach())return `<div class="ph-dead"><div style="font-size:40px">☎️</div><b>No pay phone out here</b><span>The home phone is on the kitchen wall. Any street corner in town has a pay phone: ${$(EP_QUARTER)} a call.</span></div>`;
  let h=o.apply(this,arguments);const top=PH_NAV[PH_NAV.length-1];
  if(!top.app&&/ph-home/.test(h)){
    h=h.replace(/<div class="ph-sect">Your apps[^<]*<\/div><div class="ph-grid">[\s\S]*<\/div><\/div>$/,'</div>');
    h=h.replace(/💡 <b>Your phone\.<\/b>[\s\S]*?(?=<button)/,epTipTxt(d)+' ');
    h=h.replace('<div class="ph-body ph-home">','<div class="ph-body ph-home">'+epHomeCard())}
  return h}}
{const o=phoneRender;phoneRender=function(){const r=o.apply(this,arguments);try{const d=epDev(),el=document.querySelector('#phoneUI .ph-status');
  if(el&&d!=='smart'||el&&epYear()<2020){const sp=el.children[1];if(!sp)return r;const y=epYear(),P=PH();
    if(d==='land')sp.textContent=S.loc==='home'?'☎️ Home phone':'🪙 Pay phone · 25¢';
    else{const g=y<2003?'2G':y<2010?'3G':'LTE';sp.innerHTML=sp.innerHTML.replace(/ 5G · /,` ${g} · `)}
    el.parentNode.classList.add('ph-era-'+d);void P}}catch(e){console.error(e)}return r}}
{const o=phoneHudBtn;phoneHudBtn=function(){const h=o.apply(this,arguments);if(!h||!S||epDev()!=='land')return h;
  return h.replace('📱','☎️').replace('aria-label="Phone','aria-label="Home phone')}}
// the Phone app: the home phone's card and pages; the answering machine only at home
{const a=phoneApp('call');if(a){const v0=a.view;a.view=function(arg){const d=epDev();
  if(d==='land'&&S.loc!=='home'&&typeof CALL_TAB!=='undefined')CALL_TAB='contacts';
  let h=epVoice(()=>v0.call(this,arg));
  if(d==='land'){if(typeof CALL_NOW!=='undefined'&&CALL_NOW)return h;
    if(S.loc!=='home')h=h.replace(/<div class="ph-tabs">[\s\S]*?<\/div>/,'');
    else{const n=CL().log.filter(e=>e.vm&&!e.heard).length;h=phCard(`📼 <b>Answering machine:</b> ${n?`${n} new message${n===1?'':'s'}. Play ${n===1?'it':'them'} in Recents.`:'no new messages.'}`)+h}
    h=epHomeCard()+h;if(epKid()&&epLineUsed()>=EP_LINE)h=phCard(`☎️ ${EP_LINE} minutes on the phone today. Dad needs the line: tomorrow.`,'warn')+h}
  else if(d==='cell'||d==='flip')h=(d==='cell'?phNote('A cell phone: calls only. Texting is a few years off.'):'')+h;
  return h}}}
{const a=phoneApp('contacts');if(a){const v0=a.view;a.view=function(arg){let h=epVoice(()=>v0.call(this,arg));
  if(!epText())h=h.replace(/<button class="ph-btn[^"]*"[^>]*>💬 Text<\/button>/g,'');return h}}}
{const a=phoneApp('msg');if(a){const v0=a.view;a.view=function(arg){const h=v0.call(this,arg);return epDev()==='flip'&&!isGrow()?phNote(`📟 A flip phone: ${$(EP_TEXT)} a text, on your phone bill.`)+h:h}}}
{const a=phoneApp('settings');if(a){const v0=a.view;a.view=function(){let h=v0.apply(this,arguments);if(epDev()!=='land')return h;
  h=h.replace(/<div class="ph-card ">🔋[\s\S]*?(?=<div class="ph-sub">Plan<\/div>)/,phCard('☎️ <b>The home phone</b> on the kitchen wall, and an answering machine on the counter. No battery to worry about.'));
  return h}}}
// Transit before ORCA (2009): the cash fare
{const a=phoneApp('transit');if(a){const v0=a.view;a.view=function(){let h=v0.apply(this,arguments);if(epHas('orca')||isGrow())return h;
  h=h.replace(/<div class="ph-card [^"]*">🪪 <b>ORCA card:<\/b>[\s\S]*?<\/div>/,phCard('💵 <b>Cash fare:</b> exact change on the bus (the ORCA card is a year or so off).'));
  return h.replace(/<div class="ph-sub">Reload your ORCA card<\/div>[\s\S]*?(?=<p class="ph-note">)/,'')}}}

// ---- Growing Up: the first phone by era ----
// before 2000 the family's home phone (no first-phone talk); the 2000s a flip phone; from 2010 the smartphone (57-phone-grow.js)
if(typeof pgGiftScene==='function'){const o=pgGiftScene;pgGiftScene=function(){const d=epDev();if(d==='land')return;if(d!=='flip')return o.apply(this,arguments);
  if(!epKid()||!pgG()||pgG().gift)return;
  const body=`<p>After dinner Dad sets a little box on the kitchen table: a silver flip phone from the drugstore, with prepaid minutes on the family plan. It snaps shut with a satisfying click.</p>
    <p>“Three rules,” Mom says, and counts them on her fingers.</p>
    <ul><li>🔌 <b>Off at ${fmt(PG_OFF)}.</b> It charges in the kitchen, not by your bed.</li>
    <li>💳 <b>Minutes cost money.</b> ${epText()?'Texts too: every one shows up on the bill.':'It’s for calling home, mostly.'}</li>
    <li>📍 <b>Call if you’re running late.</b> That’s what it’s for.</li></ul>
    <p>“Keep your grades up and things good around here, and we’ll talk about ten o’clock.”</p>`;
  const give=(fam,t)=>{const g=PG();g.gift=true;g.giftD=day();PH().tier='old';PH().batt=Math.max(PH().batt,80);if(fam)adj('family',fam);say(t);if(typeof lifeMoment==='function')lifeMoment('📱','Got a first phone from Mom and Dad: a flip phone, on the family plan.')};
  modal('📱 A flip phone of your own',body,[
    {l:'🤝 “Deal. Thank you.”',s:'Family +3.',fn:()=>give(3,'📱 You flip it open, flip it shut, flip it open. Nia asks if she can have one. “When you’re twelve.” Tap 📱 on the top bar.')},
    {l:'😩 “Nine?! Everybody else gets ten.”',s:'Mom: “Then earn it.”',fn:()=>give(0,'📱 “Then earn it,” Mom says. It’s still a phone. Tap 📱 on the top bar. The rules are in the phone’s settings.')}],true)}}
// the home phone isn't screen time; the first-phone talk waits for the 2000s
if(typeof pgScreen==='function'){const o=pgScreen;pgScreen=function(){if(S&&epDev()==='land')return;return o.apply(this,arguments)}}

// ---- announcements: a device or an app arrives ----
function epDevNews(from,to){const y=epYear(),k=epKid();
  if(to==='cell')return `📱 It’s ${y}: cell phones are everywhere now, and you get one of your own. Calls from anywhere: no more pay phones. No texting yet.`;
  if(to==='flip')return k?`📱 It’s ${y}: half your class has a flip phone now.${pgG()&&!pgG().gift?' Mom and Dad want to talk to you about something.':' Mom and Dad switch you to one on the family plan.'}`
    :`📱 It’s ${y}: a new flip phone, and now you can text (${$(EP_TEXT)} a text).${epCam()?' It has a camera, too.':''}`;
  if(to==='smart')return k?`📱 It’s ${y}: Mom and Dad hand you down a smartphone. Touch screen, apps, the 🛍️ App Store.`
    :`📱 It’s ${y}: your first smartphone. A touch screen, the 🛍️ App Store, and a map in your pocket.`;
  return null}
function epInit(){const E=EPS();if(E.ann)return E;E.ann={dev:epDev(),cam:epCam(),app:{}};PHONE_APPS.forEach(a=>{if(epAppOk(a))E.ann.app[a.id]=1});return E}
// what's new since the last look: [text, app id or null]
function epNews(){if(!S||S.over)return [];const E=EPS();if(!E.ann){epInit();return []}const A=E.ann,out=[],d=epDev();
  if(A.dev!==d){const t=epDevNews(A.dev,d);A.dev=d;if(t)out.push([t,null])}
  if(!A.cam&&epCam()){A.cam=true;if(!out.length)out.push(['📷 Phones have cameras now: snap a picture when the mountain is out.',null])}
  for(const a of PHONE_APPS){if(A.app[a.id]||!epAppOk(a))continue;A.app[a.id]=1;
    if(!a.builtin&&d==='smart'&&phoneShown(a)&&A.dev==='smart'&&out.every(x=>!/smartphone/.test(x[0])))out.push([`🛍️ New in the App Store: ${a.ic} <b>${a.name}</b>. ${a.desc}`,a.id])}
  return out}
{const m0=onMorning;onMorning=function(d){const r=m0.apply(this,arguments);epTry(()=>{if(!S.ph)return;
  for(const [t,id] of epNews()){say(t);if(id)phoneNotify('store',t.replace(/<[^>]+>/g,''))}});return r}}
if(typeof lifeSimulate==='function'){const s0=lifeSimulate;lifeSimulate=function(){const notes=s0.apply(this,arguments);
  epTry(()=>{if(!S.ph||!Array.isArray(notes))return;const n=epNews();const dv=n.filter(x=>!x[1]).map(x=>x[0]),ap=n.filter(x=>x[1]);
    notes.push(...dv);if(ap.length)notes.push(`🛍️ New in the App Store: ${ap.map(x=>{const a=phoneApp(x[1]);return a.ic+' '+a.name}).join(', ')}.`)});return notes}}
{const n0=newGame;newGame=function(){const r=n0.apply(this,arguments);epTry(()=>{if(S)epInit()});return r};window.newGame=newGame}

// ---- the old ways, on the main screen ----
let EP_CAB=null;
{const tm=travelMins;travelMins=function(a,b){return EP_CAB?EP_CAB.mins:tm(a,b)}}
{const hf=hoodFare;hoodFare=function(a,b){return EP_CAB?0:hf(a,b)}}
{const oa=onArrive;onArrive=function(dest,from){const q=EP_CAB;try{oa(dest,from)}finally{EP_CAB=null}
  if(q){spend(q.price);say(`🚕 The cab: ${$(q.price)} on the meter, plus a tip.`)}}}
if(window.CAR){const d0=CAR.driving;CAR.driving=()=>d0()||!!EP_CAB}
function epHoods(){const out=[''];for(const h in HOODS)if(Object.keys(L).some(k=>L[k].hood===h&&!L[k].hidden))out.push(h);return out}
const epHub=h=>h?HOODS[h].hub:(L.home&&!L.home.hidden?'home':'mlk');
const epHName=h=>h?HOODS[h].name:'Hilltop', epHIc=h=>h?HOODS[h].ic:'🏘️';
function epCabQuote(k){const here=hoodOf(S.loc),dest=epHub(k);if((k||null)===(here||null)||!L[dest])return null;
  const r=h=>h?HOODS[h].ride.mins:0,mins=Math.max(6,Math.round(Math.max(r(here),r(k||null))*0.5)+2);
  return {k,dest,mins,wait:15,price:rp(4+1.8*mins)}}
function epCabGo(k){const q=epCabQuote(k);if(!q||S.money<q.price)return false;
  if(epDev()==='land'&&S.loc!=='home'){if(S.money<q.price+EP_QUARTER)return false;spend(EP_QUARTER)}
  pass(q.wait);say(`🚕 You call Yellow Cab${epDev()==='land'&&S.loc!=='home'?' from the pay phone':''}. A cab pulls up ${q.wait} minutes later, the meter already ticking.`);
  EP_CAB=q;try{go(q.dest)}finally{if(q.mins<GAME.travelAnim)EP_CAB=null}return true}
function epCabModal(){const here=hoodOf(S.loc)||'';const btns=[];
  for(const k of epHoods()){if(k===here)continue;const q=epCabQuote(k);if(!q)continue;
    btns.push({l:`${epHIc(k)} ${epHName(k)} · about ${$(q.price)}`,s:S.money<q.price?`You have ${$(Math.round(S.money))}.`:`A ${q.wait}-minute wait, then ${q.mins} min to ${L[q.dest].name}.`,dis:S.money<q.price,fn:()=>epCabGo(k)})}
  btns.push({l:'Never mind',fn:()=>{}});
  modal('🚕 Call a cab',`<p>No apps to call a car yet: you call the cab company${epDev()==='land'&&S.loc!=='home'?' from a pay phone (a quarter)':''} and wait. The meter runs from the curb.</p>`,btns)}
function epTripModal(){const here=hoodOf(S.loc)||'',mq=epHas('mapquest'),rows=[];
  for(const k of epHoods()){if(k===here)continue;const m=travelMins(S.loc,epHub(k)),f=hoodFare(S.loc,epHub(k)),v=k?HOODS[k].ride.via:'🚶 Walk';
    rows.push([`${epHIc(k)} ${epHName(k)}`,v.replace('Link','T Line'),`${m} min`,f?$(f):'free'])}
  pass(mq?10:5);
  modal(mq?'🖨️ Directions from MapQuest':'🗺️ The Thomas Guide',`<p>${mq?'You print directions off MapQuest on the home computer: turn-by-turn, on paper, a little out of date.':'The spiral-bound Thomas Guide from the glove box drawer: page 1, grid C-4, and a lot of squinting.'} The bus schedule from the rack at the library says every 15 to 30 minutes. No alerts: if a bus breaks down, you find out at the stop.</p>`+
    hTable(['Where','How','Time','Fare'],rows),[{l:'OK',fn:()=>{}}])}
function epWx(d){if(typeof wxOf!=='function'||!lifeLong())return null;const k=wxOf(d),W=typeof WX!=='undefined'?WX[k]:null;return W?`${W.ic} ${W.n}`:null}
function epPaper(){const E=EPS(),d=day();E.paper=d;pass(15);const t=epWx(d),tm=epWx(d+1),btns=[];
  let body=`<p>📰 The ${pick(['News Tribune','morning paper'])} on the front step, still a little damp.</p>`;
  if(!epHas('weather')&&t)body+=`<p>🌦️ <b>Weather:</b> today ${t}; tomorrow ${tm||'about the same'}.</p>`;
  if(!epHas('gig')&&epAdult()){body+=`<p>📋 <b>Classifieds:</b> ${epHas('jobSites')?'the job listings (and more online these days)':'the help-wanted ads'}, and a few odd jobs for cash.</p>`;
    const c=rp(40);btns.push({l:`🧰 Answer an odd-job ad: help someone move · ${$(c)}`,s:E.odd===d?'Once a day.':'2 hours. Energy −6, stress +2.',dis:E.odd===d,fn:()=>{E.odd=d;pass(120);money(c);if(S.stats)S.stats.earned=(S.stats.earned||0)+c;adj('energy',-6);if('stress' in S)adj('stress',2);say(`🧰 A couch, a dresser and forty boxes down a South End staircase. ${$(c)} cash.`)}})}
  btns.push({l:'OK',fn:()=>{}});modal('📰 The morning paper',body,btns)}
function epNews6(){const E=EPS(),d=day();E.news=d;pass(30);const t=epWx(d+1);if('stress' in S)adj('stress',-1);
  say(`📺 The evening news, then the weather: the forecaster points at a map of the Sound. Tomorrow: ${t||'more of the same'}.`)}
function epBank(online){pass(online?10:20);const R=S.rent,lv=window.LEV&&LEV.S?LEV.S():null;
  modal(online?'💻 Online banking':'🏦 The bank branch',`<p>${online?'You dial up, wait for the screeching to stop, and log in.':'A teller with a pen on a chain counts it out and prints your balance on a little slip.'}</p>
    <div class="kv"><span>Balance</span><b>${$(Math.round(S.money))}</b></div>${R&&R.amt?`<div class="kv"><span>Rent</span><b>${$(R.amt)}${R.paid?' · paid':''}</b></div>`:''}${lv&&lv.jar?`<div class="kv"><span>Savings jar</span><b>${$(lv.jar)}</b></div>`:''}
    <p>${online?'Phone banking apps are years off. Bills still go out by check, in the mail.':'You write checks for the bills and mail them. The ATM outside works after hours.'}</p>`,[{l:'OK',fn:()=>{}}])}
function epFilm(s){const P=PH(),C=P.cam=P.cam||{},c=Math.max(1,rp(1));C.shot=s.t+':'+s.id;pass(1);spend(c);
  P.photos=P.photos||[];P.nPhotos=(P.nPhotos||P.photos.length)+1;P.photos.push({d:day(),t:S.t,at:S.loc,pl:(L[S.loc]||{}).name||'Tacoma',ic:s.ic||'📸',cap:s.title||'A picture',age:S.age,film:true});
  if(P.photos.length>60)P.photos.splice(0,1);
  say(`📸 Click, and a wind of the film. ${$(c)} for the print at the one-hour photo counter at the drugstore. It goes in the shoebox of pictures.`)}
const epFilmFresh=()=>{const C=S&&S.ph&&S.ph.cam,s=C&&C.sc;return s&&s.d===day()&&S.t-s.t<=45&&C.shot!==s.t+':'+s.id?s:null};
function epActs(a){if(!S||S.over)return a;const d=epDev(),home=S.loc==='home',ad=epAdult(),m=tod(),E=S.ph?EPS():null;
  if(d==='land'&&isGrow())a=a.filter(x=>!/^Mom and Dad want to talk to you/.test(x.l)&&!/^Put the phone away/.test(x.l));
  if(d==='smart'&&epHas('rideshare')&&epHas('streaming')&&epHas('nextdoor')&&epHas('weather')&&epHas('phoneBank')&&epHas('gig')&&epHas('datingApp'))return a;
  // the phone camera before camera phones: a film camera instead
  if(!epCam()){a=a.filter(x=>!(x.ic==='📷'&&/^Take a photo/.test(x.l)));const s=epFilmFresh();
    if(s)a.unshift({ic:'📸',l:`Take a picture: ${s.title||'this'}`,s:`A film camera. About ${$(Math.max(1,rp(1)))} a print at the one-hour photo.`,cat:'here',fn:()=>epFilm(s)})}
  // pages: call back from here
  if(E&&E.pages.length&&d==='land'&&epReach()){const p=E.pages[E.pages.length-1];
    a.unshift({ic:'📟',l:`Call back ${msgFirst(p.id)} (a page)`,s:home?'The phone on the kitchen wall.':`A pay phone: ${$(EP_QUARTER)}.`,cat:'here',cls:'primary',fn:()=>{phoneOpen('call')}})}
  if(ad&&!epHas('rideshare')&&!isGrow()&&(d==='land'?epReach():phoneNet()))
    a.push({ic:'🚕',l:'Call a cab',s:'About 15 minutes to get here, then the meter. Pricier than the bus.',cat:'move',fn:epCabModal});
  if(home&&!epHas('maps'))a.push({ic:epHas('mapquest')?'🖨️':'🗺️',l:epHas('mapquest')?'Print directions from MapQuest':'Look it up in the Thomas Guide',s:'Times and fares to every neighborhood, and the paper bus schedule.',cat:'move',fn:epTripModal});
  if(E&&home&&lifeLong()&&m>=300&&m<660&&E.paper!==day()&&(!epHas('weather')||(ad&&!epHas('gig'))))
    a.push({ic:'📰',l:'Read the morning paper',s:`15 min. ${!epHas('weather')?'Today’s weather':''}${!epHas('weather')&&ad&&!epHas('gig')?' and the ':''}${ad&&!epHas('gig')?'classifieds':''}.`,cat:'rest',fn:epPaper});
  if(E&&home&&lifeLong()&&!epHas('weather')&&m>=1020&&m<1380&&E.news!==day())
    a.push({ic:'📺',l:'Watch the evening news',s:'30 min. The weather for tomorrow. Stress −1.',cat:'rest',fn:epNews6});
  if(ad&&!isGrow()&&!epHas('phoneBank')){if(S.loc==='mlk')a.push({ic:'🏦',l:'Stop by the bank branch',s:'20 min. Your balance on a slip.',cat:'money',fn:()=>epBank(false)});
    else if(home&&epHas('onlineBank'))a.push({ic:'💻',l:'Check your bank account online',s:'10 min. Dial-up.',cat:'money',fn:()=>epBank(true)})}
  if(E&&home&&!epHas('streaming')){const n=E.music===day();
    a.push({ic:'🎧',l:`Put on your ${epMusic()}`,s:`30 min. ${n?'A little less every time.':isGrow()?'Mood +3.':'Mood +3, stress −3.'}`,cat:'rest',fn:()=>{E.music=day();pass(30);const fx=n?1:3;adj('mood',fx);if(!isGrow()&&'stress' in S)adj('stress',-fx);
      say(`🎧 ${epMusic()==='Walkman'?'A mixtape, both sides':epMusic()==='Discman'?'A CD you’ve played a hundred times, skipping on the bumpy part':'A thousand songs on shuffle'}. Mood +${fx}.`)}})}
  if(!epHas('nextdoor'))a=a.map(x=>x.l==='Join the block club group chat'?Object.assign({},x,{ic:'📋',l:'Get on the block club phone tree',s:String(x.s||'').replace(/group chat/g,'phone tree')}):x);
  if(!epHas('datingApp'))a=a.map(x=>x.l==='Open the dating app'?Object.assign({},x,{ic:epHas('datingWeb')?'💻':'📰',l:epHas('datingWeb')?'Log on to a dating website':'Read the personal ads'}):x);
  return a}
{const a0=actionsHere;actionsHere=function(){const a=a0.apply(this,arguments);return S?epTry(()=>epActs(a),a):a}}
// a Stop and watch moment: no phone camera button before camera phones (the film camera is on the Here tab)
{const oc=openChoice;openChoice=function(){const C=S&&S.ph&&S.ph.cam;if(!C||!C.sc||epCam())return oc.apply(this,arguments);
  const sc=C.sc;C.sc=null;try{return oc.apply(this,arguments)}finally{if(!C.sc)C.sc=sc}};window.openChoice=openChoice}

// ---- 18+ mode: before the phone app, the way people met then (only with the mode on) ----
const epRelTxt=h=>{if(epHas('datingApp'))return h;const w=epHas('datingWeb');
  return String(h).replace(/📱 Open the dating app/g,w?'💻 Log on to a dating website':'📰 Read the personal ads').replace(/📱 The dating app/g,w?'💻 The dating website':'📰 The personal ads')
    .replace(/the dating app/g,w?'a dating website':'the personal ads').replace(/📱 <b>Tacoma Hearts<\/b>, the app everybody on the hill pretends not to use\./,w?'💻 <b>A dating website</b> on the home computer, with a photo you scanned in.':'📰 <b>The personal ads</b> in the back of the weekly paper: a few lines and a mailbox number.')};
if(typeof relApp==='function'){const o=relApp;relApp=function(){if(epHas('datingApp'))return o.apply(this,arguments);const m0=modalSwap;
  modalSwap=function(t,b,btns,nc){return m0.call(this,epRelTxt(t),epRelTxt(b),btns,nc)};try{return o.apply(this,arguments)}finally{modalSwap=m0}}}
if(typeof relView==='function'){const o=relView;relView=function(){return epRelTxt(o.apply(this,arguments))}}
if(typeof REL_TAB!=='undefined'&&REL_TAB)REL_TAB.view=()=>relView();
if(typeof relGuideChapter==='function'){const o=relGuideChapter;relGuideChapter=function(){const h=o.apply(this,arguments);
  return h+`<h3>Before the apps</h3><p>In a game that starts before ${epY('datingApp')} there is no phone app for meeting people: you meet in person, and before the late 1990s the home thing is the personal ads in the back of the weekly paper. From the late 1990s it is a dating website on the home computer. 💘 Tacoma Hearts comes to the App Store in ${epY('datingApp')}.</p>`}}

// ---- ❓ Help: Phones through the years ----
const EP_GNAME={maps:'🗺️ Maps',transitLive:'🚌 Transit',weather:'🌦️ Weather',orca:'the ORCA card',phoneBank:'🏦 Bank',nextdoor:'🏘️ Block club',streaming:'🎧 Music',rideshare:'🚗 Rides',gig:'💼 Jobs',grocery:'🛒 Groceries',telehealth:'🩺 Telehealth'};
{const g0=phoneGuide;phoneGuide=function(){return g0.apply(this,arguments)+`<h3>Phones through the years</h3>
  <p>In a game that starts in an earlier year, each part of the phone arrives in the year it became common, and before that the game offers the way people did it then. In 2026 everything above is there from the start.</p>
  <ul><li><b>Before cell phones</b> (until ${epY('cell')}; for kids, until 2000): the ☎️ home phone on the kitchen wall and an answering machine. Calls from home, or from a pay phone anywhere in town for a quarter. Calls while you’re out go to the machine. From ${epY('pager')} to the end of the 1990s adults carry a 📟 pager: a page means find a phone and call back. Kids get ${EP_LINE} minutes a day on the line, and no first-phone talk.</li>
  <li><b>${epY('cell')}:</b> a cell phone for adults. Calls from anywhere, no texting.</li>
  <li><b>${epY('text')} on:</b> a flip phone. Calls and texts (about ${$(EP_TEXT)} a text for adults), a camera from ${epY('camera')}, no App Store. Kids get a first flip phone from Mom and Dad in the 2000s.</li>
  <li><b>${epY('apps')} on:</b> a smartphone and the 🛍️ App Store (kids from 2010). Apps arrive in their own years: ${['maps','transitLive','weather','orca','phoneBank','nextdoor','streaming','rideshare','gig','grocery','telehealth'].map(f=>[f,epY(f)]).sort((a,b)=>a[1]-b[1]).map(([f,y])=>`${EP_GNAME[f]} ${y}`).join(', ')}. 🔦 Flashlight and 📝 Notes come with the App Store. A new app is announced in the morning or in the time-skip summary.</li>
  <li><b>Before that:</b> 🚕 call a cab; 🗺️ the Thomas Guide (🖨️ MapQuest printouts from ${epY('mapquest')}) and the paper bus schedule; 📰 the morning paper and 📺 the evening news for the weather, still a day ahead; 📋 the classifieds for odd jobs (job sites from ${epY('jobSites')}); 🏦 the bank branch on MLK, ATMs and checks (💻 online banking from ${epY('onlineBank')}); the corner market for groceries; the walk-in clinic or urgent care; 📸 a film camera and one-hour photo; 🎧 a Walkman in the 1980s, a Discman in the 1990s, an iPod in the 2000s; and the block club’s phone tree and a flyer on the door.</li></ul>`}}

window.ERAPHONE={fy:epY,dev:epDev,has:epHas,year:epYear,text:epText,cam:epCam,pager:epPager,appOk:id=>epAppOk(phoneApp(id)),news:epNews,init:epInit,
  page:epPage,callBack:epCallBack,cab:epCabGo,cabQuote:epCabQuote,S:()=>EPS(),LINE:EP_LINE,QUARTER:EP_QUARTER,TEXT:EP_TEXT};
})();
