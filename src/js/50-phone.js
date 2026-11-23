// ---------------- 📱 phone: core (screen, battery, bill, app system) ----------------
// Ported from Island Time's phone and adapted for Tacoma: full signal nearly everywhere (4 bars; 2 bars in the woods at Point
// Defiance and down the Northeast Tacoma ravine), no ferries. Built-in apps live in 51-phone-apps.js.
//
// ===== PLUG-IN API (for the files that add apps: Messages, Calls, Maps, a dating app in 18+ mode …) =====
//   definePhoneApp({
//     id:'myapp', name:'My App', ic:'🧩',
//     builtin:false,        // false: installable from the 🛍️ App Store, takes 1 of PHONE_SLOTS (5). true: always on the phone.
//     order:60,             // sorts icons on the home screen (lower first)
//     size:'25 MB', desc:'One line for the App Store.',
//     badge:()=>0,          // number on the icon (0 = none). phoneNotify() adds to it on its own.
//     when:()=>true,        // false hides the app everywhere (home screen, App Store): e.g. ()=>relActive() for 18+ only
//     view:arg=>'<p>html</p>'+phBtn('Do it',()=>{…},{sub:'detail',cls:'primary',dis:false}),
//   });
//   phBtn(label,fn,{sub,cls,dis,id})  a button inside the phone. After fn the game runs afterAction() and redraws (the phone too).
//                                     A handler that spends game time calls pass(min) (or phoneTime(min)): never S.t+= by hand.
//   phoneOpen(appId?,arg?) / phoneClose() / phoneGo(appId,arg) / phoneBack() / phoneHome()   navigation (all on window)
//   PH()                 the phone's state, S.ph, created lazily (old saves just work). Keep your app's state in a lazily
//                        created sub-object: const M=PH().msg=PH().msg||{}. S.ph survives time skips and graduation.
//   phoneOnTime(fn)      fn(min) runs as game time passes while a day is played (min = minutes since the last tick, 0 after a
//                        night or a time skip). Use it to deliver replies, ring calls, etc.
//   phoneNotify(appId,text)  a notification: a tile now (if the phone is on) and +1 on the app's badge until the app is opened.
//                        phoneNotes(appId) lists the unread ones [{t,x}].
//   phoneOwned()         has a phone at all (false after it is stolen or lost, until replaced; Growing Up: from PHONE_GROW_AGE).
//                        Wrap it to add rules: {const o=phoneOwned;phoneOwned=function(){return o()&&…}}
//   phoneCan()           owned and the battery isn't dead: apps work. phoneNet(): phoneCan() and the bill is paid (texts, calls,
//                        installs). phoneSignal(): 0–4 bars.
//   phoneUse(pct)        battery cost of using it (scaled by the phone: a hand-me-down drains faster). S.ph.batt is 0–100.
//   phoneInstalled(id)   built-in, or installed (and the phone is owned). phoneFree(): free slots. PHONE_SLOTS=5.
//   phoneContacts()      everyone you know: [{id,n,ic,grp,how,d}] (51-phone-apps.js); phoneContactActs(fn) adds buttons to a
//                        contact's page: fn(contact) returns phBtn html (e.g. 💬 Text, 📞 Call).
//   phoneLose(why) / phoneReplace(tier)   the phone is gone / a new one (tiers: PHONE_TIERS). Apps come back from the cloud.
// =====
const PHONE_SLOTS=5, PHONE_GROW_AGE=12, PHONE_IDLE=2;   // idle drain: 2% an hour, times the phone's drain factor
const PHONE_APPS=[];
const PH_TIMERS=[], PH_CONTACT_ACTS=[];
// hand-me-down, refurbished, new: a better phone holds its charge longer (drain multiplies every battery cost)
const PHONE_TIERS={
  old:{n:'Hand-me-down phone',price:0,drain:1.4,d:'A cracked screen and a tired battery.'},
  refurb:{n:'Refurbished phone',price:90,drain:1,d:'A few years old, with a fresh battery.'},
  new:{n:'New phone',price:400,drain:0.65,d:'This year’s model. The battery lasts all day and then some.'},
};
// the monthly bill (adults): chosen the first time you open the phone, paid on the 1st like rent
const PHONE_PLANS={
  prepaid:{n:'Prepaid',price:25,d:'Talk, text and a little data. Pay as you go.'},
  plan:{n:'Monthly plan',price:45,d:'Unlimited everything, and phone insurance: a stolen phone is replaced for a small fee.'},
};
const PHONE_WEAK=['ru_park','ne_trail'];   // two bars under the old-growth firs and down in the ravine
const PHONE_OUTLETS=['home','peoples','library'];   // plus any place named like a library or a café (phoneOutletHere)
const PHONE_SHOPS=['mlk','dt_pacific'];   // the phone repair counter on MLK, the shop on Pacific Ave (36-life-events.js)
let PH_OPEN=false, PH_NAV=[{app:null,arg:null}], PH_ACTS=[];

function PH(){S.ph=S.ph||{};const p=S.ph;
  if(typeof p.batt!=='number')p.batt=100;
  if(!p.tier)p.tier=isGrow()?'old':'refurb';
  p.apps=p.apps||[];p.inst=p.inst||{};p.notes=p.notes||{};
  if(p.lt==null)p.lt=S.t;return p}
function definePhoneApp(a){const i=PHONE_APPS.findIndex(x=>x.id===a.id);
  const app=Object.assign({builtin:false,size:'40 MB',order:50,badge:()=>0,when:()=>true,desc:''},a);
  if(i>=0)PHONE_APPS[i]=app;else PHONE_APPS.push(app);PHONE_APPS.sort((x,y)=>x.order-y.order)}
function phoneApp(id){return PHONE_APPS.find(a=>a.id===id)}
const phTry=(f,d)=>{try{return f()}catch(e){console.error(e);return d}};
const phoneShown=a=>!!a&&phTry(()=>a.when()!==false,false);
function phoneOnTime(fn){PH_TIMERS.push(fn)}
function phoneContactActs(fn){PH_CONTACT_ACTS.push(fn)}
function phoneOwned(){if(typeof S==='undefined'||!S)return false;if(S.ph&&S.ph.lost)return false;
  return isGrow()?(S.age==null?12:S.age)>=PHONE_GROW_AGE:true}
function phoneSignal(){if(!phoneOwned())return 0;return PHONE_WEAK.includes(S.loc)?2:4}
function phoneCan(){return phoneOwned()&&PH().batt>0}
function phoneNet(){return phoneCan()&&!PH().cut&&phoneSignal()>0}
const phoneTier=()=>PHONE_TIERS[PH().tier]||PHONE_TIERS.refurb;
const phR1=v=>Math.round(v*10)/10;
function phoneUse(pct){if(!phoneOwned())return;phoneTick();const P=PH(),was=P.batt;P.batt=Math.max(0,phR1(P.batt-pct*phoneTier().drain));phoneBattNews(was)}
function phoneCharge(pct){const P=PH();P.batt=Math.min(100,phR1(P.batt+pct))}
function phoneInstalled(id){const a=phoneApp(id);return !!a&&phoneOwned()&&phoneShown(a)&&(a.builtin||PH().apps.includes(id))}
function phoneFree(){return PHONE_SLOTS-PH().apps.length}
// pass game time from inside the phone (an install, a call): the clock and the battery move on
function phoneTime(min){pass(min)}
// install takes a minute of game time (a little longer on two bars)
function phoneInstall(id){const a=phoneApp(id),P=PH();if(!a||a.builtin||!phoneShown(a)||P.apps.includes(id))return false;if(P.apps.length>=PHONE_SLOTS||!phoneNet())return false;
  const min=phoneSignal()<=2?3:1;phoneTime(min);phoneUse(1);P.apps.push(id);P.inst[id]=(P.inst[id]||0)+1;
  say(`📲 Installed <b>${a.name}</b>.${min>1?' Two bars out here: it took '+min+' minutes.':''}`);return true}
function phoneUninstall(id){const P=PH();const i=P.apps.indexOf(id);if(i<0)return false;P.apps.splice(i,1);delete P.notes[id];const a=phoneApp(id);say(`🗑️ Removed ${a?a.name:id} from your phone.`);return true}
function phoneNotes(id){return (S&&S.ph&&S.ph.notes&&S.ph.notes[id])||[]}
function phoneBadge(a){return phTry(()=>(a.badge()||0),0)+phoneNotes(a.id).length}
function phoneBadgeTotal(){if(!S||!S.ph||!phoneOwned())return 0;return PHONE_APPS.filter(a=>phoneInstalled(a.id)).reduce((n,a)=>n+phoneBadge(a),0)}
function phoneNotify(id,text){if(!S||!phoneOwned())return;const a=phoneApp(id),P=PH();
  P.notes[id]=(P.notes[id]||[]).concat({t:S.t,x:text}).slice(-10);
  if(phoneCan()&&a)try{showTile(a.ic,a.name,text,'info')}catch(e){}}
// battery news: a warning at 15%, a note when it dies
function phoneBattNews(was){const P=PH();if(!S||S.over)return;
  if(was>0&&P.batt<=0){P.batt=0;say('🪫 Your phone dies. Charge it at home or at an outlet: People’s Center, a library or a café.');if(PH_OPEN)phoneRender()}
  else if(was>15&&P.batt<=15&&P.low!==day()){P.low=day();say(`🔋 Your phone is at ${Math.round(P.batt)}%.`)}}
// time passing while you play a day: idle drain + the plug-ins' timers. A night or a time skip resets the clock (no drain).
function phoneTick(){if(!S||S.over)return;const P=PH();
  if(P.lt==null||P.lt>S.t||Math.floor(P.lt/1440)!==S.cur){P.lt=S.t;PH_TIMERS.forEach(f=>phTry(()=>f(0)));return}
  const m=S.t-P.lt;if(m<=0)return;P.lt=S.t;
  if(phoneOwned()&&P.batt>0){const was=P.batt;P.batt=Math.max(0,phR1(P.batt-m/60*PHONE_IDLE*phoneTier().drain));phoneBattNews(was)}
  PH_TIMERS.forEach(f=>phTry(()=>f(m)))}

// ---- lost, stolen, replaced ----
function phoneLose(why){const P=PH();P.lost=why||'lost';P.cloud=P.apps.slice();if(PH_OPEN)phoneClose()}
function phoneReplace(tier){const P=PH(),T=PHONE_TIERS[tier]?tier:'refurb',was=P.lost;P.lost=false;P.tier=T;P.batt=T==='old'?60:100;P.lt=S.t;
  const back=(P.cloud||P.apps).filter(id=>phoneApp(id)).slice(0,PHONE_SLOTS);P.apps=back;delete P.cloud;
  if(was&&back.length)say(`☁️ Your apps come back from the cloud: ${back.map(id=>phoneApp(id).ic+' '+phoneApp(id).name).join(', ')}.`);return T}
// a shop sells a phone: replaces a lost one, or upgrades
function phoneBuy(tier,mins){const T=PHONE_TIERS[tier],c=rp(T.price);if(S.money<c)return false;pass(mins||30);spend(c);const lost=!!PH().lost;phoneReplace(tier);
  say(`📱 ${lost?'A':'An upgrade: a'} ${T.n.toLowerCase()} for ${$(c)}. Your number moves over in ten minutes.`);return true}

// ---- the monthly bill (adults) ----
const phMonth=d=>{const o=dateOf(d==null?day():d);return o.y+'-'+o.m};
function phoneBillAmt(){const P=PH();return P.plan?rp(PHONE_PLANS[P.plan].price):0}
function phonePickPlan(k){const P=PH(),c=rp(PHONE_PLANS[k].price);if(S.money<c)return false;spend(c);P.plan=k;P.billMk=phMonth();P.cut=false;P.owe=0;
  say(`📱 ${PHONE_PLANS[k].n}: ${$(c)} for this month, then ${$(c)} on the 1st of every month.`);return true}
// the bill on the 1st: autopay if the money's there, otherwise the service is cut until you pay
function phoneBill(d,notes){const P=S.ph;if(!P||!P.plan||isGrow())return null;const mk=phMonth(d);if(P.billMk===mk)return null;P.billMk=mk;
  const c=phoneBillAmt();
  if(P.cut){P.owe=(P.owe||0)+c;return `📵 Another phone bill (${$(c)}) on top: you owe ${$(P.owe)}. The service stays off until it’s paid.`}
  if(S.money>=c){spend(c);return `📱 Phone bill paid: ${$(c)} (${PHONE_PLANS[P.plan].n.toLowerCase()}).`}
  P.cut=true;P.owe=c;return `📵 The phone bill (${$(c)}) didn’t go through. Your service is off until you pay it: no texts, no calls, no installs.`}
function phonePayBill(){const P=PH();if(!P.cut||S.money<P.owe)return false;spend(P.owe);say(`📱 You pay the phone bill (${$(P.owe)}). Service is back on.`);P.cut=false;P.owe=0;return true}

// ---- the phone on screen ----
function phBtn(label,fn,opt){opt=opt||{};const i=PH_ACTS.push(fn)-1;return `<button class="ph-btn ${opt.cls||''}" ${opt.id?`id="${opt.id}"`:''} ${opt.dis?'disabled':''} onclick="PHA(${i})">${label}${opt.sub?`<small>${opt.sub}</small>`:''}</button>`}
window.PHA=i=>{const f=PH_ACTS[i];if(!f||!S||S.over)return;sfx('tap');uiNarr=[];f();afterAction();if(S&&!S.over&&!document.querySelector('.title,.end'))render()};
function phoneNoPhone(){
  const g=isGrow();
  modal('📵 No phone',`<p>${PH().lost==='stolen'?'Your phone was stolen.':'You don’t have a phone right now.'} No texts, no calls, no apps, and no alarm in the morning.</p>
    <p>${g?'Ask Mom and Dad at home: there’s an old phone in the junk drawer.':`A phone shop sells refurbished (${$(rp(PHONE_TIERS.refurb.price))}) and new (${$(rp(PHONE_TIERS.new.price))}) phones: the repair counter on MLK, or the shop on Pacific Ave downtown. Your apps come back from the cloud.`}</p>`,[{l:'OK',fn:()=>{}}])}
window.phoneOpen=(app,arg)=>{if(!S||S.over)return;if(!phoneOwned())return phoneNoPhone();
  const fresh=!PH_OPEN;PH_OPEN=true;PH_NAV=[{app:null,arg:null}];if(app)PH_NAV.push({app,arg});
  if(fresh&&phoneCan()){phoneUse(1);PH().used=true}phoneRender()};
window.phoneClose=()=>{PH_OPEN=false;const el=document.getElementById('phoneUI');el&&el.remove();if(S&&!S.over&&!document.querySelector('.title,.end'))render()};
window.phoneGo=(app,arg)=>{PH_NAV.push({app,arg});if(phoneCan())phoneUse(0.5);phoneRender()};
window.phoneBack=()=>{if(PH_NAV.length>1)PH_NAV.pop();phoneRender()};
window.phoneHome=()=>{PH_NAV=[{app:null,arg:null}];phoneRender()};
function phonePlanScreen(){const c=k=>rp(PHONE_PLANS[k].price);
  return `<div class="ph-bar"><span></span><b>📶 Pick a phone plan</b><span></span></div><div class="ph-body"><p>Your own place, your own phone bill. Pick one: it’s paid on the 1st of every month, like rent.</p>`+
    Object.keys(PHONE_PLANS).map(k=>phBtn(`${PHONE_PLANS[k].n} · ${$(c(k))} a month`,()=>phonePickPlan(k),{cls:k==='prepaid'?'primary':'',dis:S.money<c(k),sub:PHONE_PLANS[k].d+(S.money<c(k)?' Not enough cash for the first month.':' The first month is paid now.')})).join('')+
    `<p class="ph-note">You can switch plans later in ⚙️ Settings.</p></div>`}
function phoneScreen(){
  const top=PH_NAV[PH_NAV.length-1],P=PH();
  if(!phoneCan()) return `<div class="ph-dead"><div style="font-size:40px">🪫</div><b>Battery dead</b><span>Charge it at home (it charges overnight), or at an outlet: People’s Center, a library or a café. No texts, calls, apps or alarm until then.</span></div>`;
  if(!isGrow()&&!P.plan) return phonePlanScreen();
  if(top.app){const a=phoneApp(top.app);if(!a||!phoneInstalled(a.id)){PH_NAV.pop();return phoneScreen()}
    delete P.notes[a.id];
    const body=phTry(()=>a.view(top.arg),`<p>Something went wrong in ${a.name}.</p>`);
    return `<div class="ph-bar"><button class="ph-back" onclick="phoneBack()" aria-label="Back">‹</button><b>${a.ic} ${a.name}</b><span></span></div><div class="ph-body">${body}</div>`}
  const icon=a=>{const n=phoneBadge(a);return `<button class="ph-app" onclick="phoneGo('${a.id}')" aria-label="${esc(a.name)}${n?`, ${n} new`:''}"><span class="ph-ic">${a.ic}${n?`<i class="ph-badge">${n>9?'9+':n}</i>`:''}</span><span class="ph-nm">${a.name}</span></button>`};
  const built=PHONE_APPS.filter(a=>a.builtin&&phoneShown(a)),mine=P.apps.map(phoneApp).filter(a=>a&&phoneShown(a));
  const empty=Array.from({length:Math.max(0,PHONE_SLOTS-P.apps.length)},()=>`<button class="ph-app ph-empty" onclick="${phoneApp('store')?"phoneGo('store')":''}" aria-label="Empty app slot"><span class="ph-ic">＋</span><span class="ph-nm">Empty</span></button>`);
  const warn=P.cut?`<div class="ph-card warn" style="color:var(--ink)">📵 <b>No service:</b> the phone bill (${$(P.owe)}) is unpaid. Pay it in ⚙️ Settings or at home.</div>`:'';
  const tip=P.tipSeen?'':`<div class="ph-card">💡 <b>Your phone.</b> Tap an app to open it. ⬇️ The bottom row holds ${PHONE_SLOTS} apps you add from 🛍️ App Store. Texts and calls need battery${isGrow()?'':' and a paid bill'}; it charges overnight at home. ❓ Help → Your phone has the rest. <button class="ph-btn" onclick="PH().tipSeen=1;phoneRender()">Got it</button></div>`;
  return `<div class="ph-body ph-home">${warn}${tip}<div class="ph-grid">${built.map(icon).join('')}</div><div class="ph-sect">Your apps · ${P.apps.length}/${PHONE_SLOTS}</div><div class="ph-grid">${mine.map(icon).join('')}${empty.join('')}</div></div>`;
}
function phoneRender(){
  if(!PH_OPEN||!S||S.over||!phoneOwned()){PH_OPEN=false;const el=document.getElementById('phoneUI');el&&el.remove();return}
  PH_ACTS=[];
  let el=document.getElementById('phoneUI'),fresh=!el;
  if(!el){el=document.createElement('div');el.id='phoneUI';el.className='ph-bg';el.addEventListener('click',e=>{if(e.target===el)phoneClose()});document.body.appendChild(el)}
  const P=PH(),bars=phoneCan()?phoneSignal():0,bat=Math.round(P.batt),net=P.cut?'No service':'5G';
  el.innerHTML=withName(`<div class="ph${fresh?' ph-anim':''}" role="dialog" aria-label="Your phone"><div class="ph-status"><span>${fmt(S.t)}</span><span><span class="ph-sig" aria-label="${bars} bars">${'▮'.repeat(bars)}<span style="opacity:.3">${'▮'.repeat(4-bars)}</span></span> ${net} · ${bat<=15?'🪫':'🔋'}${bat}%</span></div>
    <div class="ph-screen">${phoneScreen()}</div>
    <div class="ph-nav"><button onclick="phoneBack()" aria-label="Back">‹ Back</button><button onclick="phoneHome()" aria-label="Home screen">⌂ Home</button><button onclick="phoneClose()" aria-label="Put the phone away">✕ Close</button></div></div>`);
  if(fresh)setTimeout(()=>{const b=el.querySelector('.ph-screen button:not([disabled])');if(b&&document.body.contains(el))try{b.focus({preventScroll:true})}catch(e){}},30);
}
// keys while the phone is up: Esc puts it away; the game's own shortcuts don't reach the screen behind it
window.addEventListener('keydown',e=>{if(!PH_OPEN||document.getElementById('mbg')||!document.getElementById('phoneUI'))return;
  const t=e.target;if(t&&/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))return;
  if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();phoneClose();return}
  if(e.key!=='Tab')e.stopImmediatePropagation()},true);

// ---- the 📱 button on the top bar ----
function phoneHudBtn(){if(!S||S.over)return '';
  if(!phoneOwned())return S.ph&&S.ph.lost?`<button class="phbtn off" onclick="phoneOpen()" aria-label="No phone">📵</button>`:'';
  const n=phoneCan()?phoneBadgeTotal():0;
  return `<button class="phbtn ph-top" onclick="phoneOpen()" aria-label="Phone${n?`, ${n} new`:''}" style="position:relative">📱${n?`<i class="ph-badge">${n>9?'9+':n}</i>`:''}</button>`}
{const h0=hud;hud=function(){const h=h0.apply(this,arguments);try{return h.replace('<button class="gear"',phoneHudBtn()+'<button class="gear"')}catch(e){console.error(e);return h}}}
{const r0=render;render=function(){if(S&&!S.over)phTry(phoneTick);const r=r0.apply(this,arguments);if(PH_OPEN)phTry(phoneRender);return r}}
{const p0=pass;pass=function(min){const r=p0.apply(this,arguments);if(S&&!S.over)phTry(phoneTick);return r}}

// ---- nights, mornings, time skips ----
// overnight: plugged in at home, it charges to 100%; anywhere else it keeps draining
function phoneNight(where,notes){if(!S.ph)return;const P=PH();phoneTick();
  if(PH_OPEN){PH_OPEN=false;const el=document.getElementById('phoneUI');el&&el.remove()}
  if(!phoneOwned()){P.lt=null;return}
  if(where==='home'){P.batt=100;P.nite='home'}else{P.batt=Math.max(0,phR1(P.batt-8*phoneTier().drain));P.nite=P.batt>0?'away':'dead'}
  P.lt=null}
// the morning: the bill on the 1st, then the alarm (adults: your phone is your alarm)
function phoneMorning(d){if(!S.ph||!S)return;const P=PH();P.lt=S.t;
  if(!isGrow()&&dateOf(d).d===1){const t=phoneBill(d);if(t){say(t);if(P.cut)phoneNotify('settings','The phone bill is unpaid. Service is off.')}}
  if(isGrow()||d===0)return;
  const owned=phoneOwned(),dead=owned&&P.batt<=0;
  if(!owned||dead){S.t+=75;say(`⏰ ${owned?'Your phone died overnight':'No phone'}, so no alarm. You wake up on your own at ${fmt(S.t)}.`);return}
  // a small chance of sleeping through it (only once you've set it yourself in the Clock app): the same for a given day
  if(P.clk){let h=0;for(const c of 'zz'+d+':'+S.alarm)h=(h*31+c.charCodeAt(0))>>>0;
    if(h%100<3){S.t+=20;say(`😴 You sleep right through the first alarm. The snooze gets you up at ${fmt(S.t)}.`)}}}
{const n0=onNight;onNight=function(where,notes,d){const r=n0.apply(this,arguments);phTry(()=>phoneNight(where,notes,d));return r}}
{const m0=onMorning;onMorning=function(d){const r=m0.apply(this,arguments);phTry(()=>phoneMorning(d));return r}}
// a time skip: the bill on every 1st in between (and the phone is charged when you come back)
if(typeof lifeSimulate==='function'){const s0=lifeSimulate;lifeSimulate=function(from,to,ch){const notes=s0.apply(this,arguments);
  phTry(()=>{if(!S.ph)return;const P=PH();P.batt=100;P.lt=null;if(isGrow()||!P.plan)return;let n=0,amt=0;const owe0=P.owe||0;
    for(let d=from;d<=to;d++)if(dateOf(d).d===1){const c=phoneBillAmt(),t=phoneBill(d);if(t&&!P.cut){n++;amt+=c}}
    if(n)notes.push(`📱 Phone bill paid ${n} time${n===1?'':'s'} (${$(amt)}).`);
    if(P.cut&&(P.owe||0)>owe0)notes.push(`📵 The phone bill bounced: you owe ${$(P.owe)}, and the service is off until you pay.`)});
  return notes}}

// ---- actions on the main screen: charge, pay the bill, buy a phone ----
function phoneOutletHere(){const l=L[S.loc]||{};return PHONE_OUTLETS.includes(S.loc)||/librar|café|cafe|coffee/i.test(l.name||'')}
function phoneActs(a){
  const P=S.ph,g=isGrow(),here=S.loc;
  if(phoneOwned()&&P&&P.batt<95&&phoneOutletHere())
    a.push({ic:'🔌',l:here==='home'?'Charge your phone':'Charge your phone at the outlet',s:`30 min. Battery ${Math.round(P.batt)}% → ${Math.min(100,Math.round(P.batt+50))}%.`,cat:'rest',fn:()=>{pass(30);phoneCharge(50);say(`🔌 ${here==='home'?'Plugged in by the bed':'You find an outlet and sit with your phone charging'} for half an hour: ${Math.round(PH().batt)}%.`)}});
  if(!g&&P&&P.cut&&here==='home')
    a.push({ic:'📱',l:`Pay the phone bill: ${$(P.owe)}`,s:S.money<P.owe?'Not enough cash.':'5 min. Service back on right away.',cat:'money',dis:S.money<P.owe,fn:()=>{pass(5);phonePayBill()}});
  if(!g&&PHONE_SHOPS.includes(here)){const cur=P&&!P.lost?P.tier:null,rank={old:0,refurb:1,new:2};
    for(const k of ['refurb','new']){if(cur&&rank[cur]>=rank[k])continue;const T=PHONE_TIERS[k],c=rp(T.price);
      a.push({ic:'📱',l:`${P&&P.lost?'Replace your phone':'Upgrade your phone'}: ${T.n.toLowerCase()} — ${$(c)}`,s:`30 min at the ${here==='mlk'?'phone repair counter on MLK':'phone shop on Pacific Ave'}. ${T.d}${S.money<c?' Not enough cash.':''}`,cat:'money',dis:S.money<c,fn:()=>phoneBuy(k,30)})}
    if(P&&P.lost&&P.plan==='plan'){const c=rp(50);a.push({ic:'🛡️',l:`Insurance claim: a refurbished phone — ${$(c)}`,s:'45 min. Your monthly plan covers a stolen phone.',cat:'money',dis:S.money<c,fn:()=>{pass(45);spend(c);phoneReplace('refurb');say(`🛡️ The insurance claim goes through: a refurbished phone for the ${$(c)} fee.`)}})}}
  if(g&&P&&P.lost&&here==='home')
    a.push({ic:'📱',l:'Ask Mom and Dad about a phone',s:'10 min. The old one in the junk drawer. Family −2.',cat:'family',fn:()=>{pass(10);adj('family',-2);phoneReplace('old');say('📱 Dad digs the old phone out of the junk drawer. “Keep track of this one.” It works, mostly.')}});
  return a}
{const a0=actionsHere;actionsHere=function(){const a=a0.apply(this,arguments);if(!S)return a;return phTry(()=>phoneActs(a),a)}}

// ---- life events: the Link-stop grab takes the phone; a phone flashlight helps when the power goes out ----
{const e=EV.find(x=>x.id==='lev_phone');if(e){const r0=e.run,c0=e.choices;
  e.run=function(c){const r=r0.apply(this,arguments);if(S.ev.flags.levPhone==='gone')phoneLose('stolen');return r};
  if(c0)e.choices=function(){const ch=c0.apply(this,arguments)||[];return ch.map(o=>{const t=o.ic==='🛍️'?'refurb':o.ic==='🗄️'?'old':null;if(!t)return o;
    const f=o.fn;return Object.assign({},o,{fn:function(){const r=f.apply(this,arguments);phoneReplace(t);return r}})})}}}
const phFlash=()=>phoneInstalled('flash')&&phoneCan()&&!(S.lev&&S.lev.inv&&S.lev.inv.flashlight);
{const e=EV.find(x=>x.id==='lev_outage');if(e){const r0=e.run,c0=e.choices;
  e.run=function(){if(phFlash()){say('🔌 Click, and the whole block goes dark: every window, every streetlight. You thumb on the 🔦 flashlight on your phone. Just a normal evening, by phone light, as long as the battery holds.');return}return r0.apply(this,arguments)};
  if(c0)e.choices=function(){if(!phFlash())return c0.apply(this,arguments);
    const inv=S.lev.inv;inv.flashlight='phone';let ch;try{ch=c0.apply(this,arguments)||[]}finally{delete inv.flashlight}
    return ch.map(o=>Object.assign({},o,{s:o.s+' Phone battery −10%.',fn:function(){phoneUse(10);return o.fn.apply(this,arguments)}}))}}}

// ---- the Phone chapter in ❓ Help (no S here: it describes the rules) ----
function phoneGuide(){const T=PHONE_TIERS,Pl=PHONE_PLANS;
  return `<p>Tap <b>📱</b> on the top bar and your phone slides up over the game: the time, the battery and the signal on top, your apps below. <b>‹ Back</b>, <b>⌂ Home</b> and <b>✕ Close</b> sit under the screen, and Esc puts it away on a computer.</p>
    <ul><li><b>Growing Up:</b> you have a phone from ${PHONE_GROW_AGE} (Mom’s old one). Your family pays for it.</li>
    <li><b>Signal:</b> four bars nearly everywhere in Tacoma. Two bars under the big firs in Point Defiance Park and down the Ravine Trail in Northeast Tacoma, where installs take a little longer.</li></ul>
    <h3>Battery</h3>
    <ul><li>It drains slowly over the day, and faster when you use it: opening it, apps, the flashlight.</li>
    <li>It charges overnight when you sleep at home. During the day, <b>🔌 Charge your phone</b> at home, People’s Center, a library or a café: 30 minutes, +50%.</li>
    <li><b>Dead</b> means no texts, no calls, no apps and no alarm: you wake up on your own, about 75 minutes late.</li></ul>
    ${hTable(['Phone','Price','Battery'],[[T.old.n,'free (the one from the junk drawer)','drains fastest'],[T.refurb.n,'about '+$(T.refurb.price),'a normal day'],[T.new.n,'about '+$(T.new.price),'lasts the longest']])}
    <h3>Apps</h3>
    <ul><li>Always there: <b>🛍️ App Store</b>, <b>⏰ Clock</b>, <b>📒 Contacts</b> and <b>⚙️ Settings</b>.</li>
    <li>From the App Store, ${PHONE_SLOTS} slots for apps you pick: an install takes a minute. Full? Remove one to make room.</li>
    <li><b>🔦 Flashlight:</b> when the power goes out it works instead of buying one, as long as the battery lasts.</li>
    <li><b>📝 Notes:</b> a short list of the week’s priorities (the same list as My priorities on the To-do tab).</li>
    <li><b>⏰ Clock:</b> set your morning alarm. Once you set it yourself there is a small chance you sleep through the first one and the snooze gets you up 20 minutes later.</li>
    <li><b>📒 Contacts:</b> everyone you’ve met and how you know them: neighbors, coworkers, family and friends.</li></ul>
    <h3>The phone bill</h3>
    <ul><li>In your own place you pick a plan the first time you open the phone: <b>${Pl.prepaid.n}</b> (about ${$(Pl.prepaid.price)} a month) or a <b>${Pl.plan.n.toLowerCase()}</b> (about ${$(Pl.plan.price)}, with phone insurance).</li>
    <li>It’s paid on the 1st of every month, like rent, in time skips too. If the money isn’t there, the service is cut (no texts, calls or installs) until you pay it at home or in ⚙️ Settings.</li></ul>
    <h3>Lost or stolen</h3>
    <ul><li>If your phone is grabbed at a downtown Link stop (a zipped pocket stops it), you have no phone until you replace it: a refurbished one on the spot, the old cracked one from the drawer, or later at the repair counter on MLK or the shop on Pacific Ave. The monthly plan’s insurance replaces it for a small fee.</li>
    <li>Your apps come back from the cloud on the new phone.</li></ul>`}
{const hc=helpChapters;helpChapters=function(...a){const ch=hc(...a);try{let i=ch.findIndex(c=>c[0]==='growup');if(i<0)i=ch.findIndex(c=>c[0]==='faq')-1;
  ch.splice(i<0?ch.length:i+1,0,['phone','Your phone',phoneGuide()])}catch(e){console.error(e)}return ch}}
window.PHONE={PH:()=>PH(),open:(a,x)=>window.phoneOpen(a,x),close:()=>window.phoneClose()};
