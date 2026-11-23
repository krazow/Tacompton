// ---------------- 📱 apps: getting around (🚌 Transit, 🗺️ Maps, 🌦️ Weather, 🚗 Rides) ----------------
// Four installable apps (plug-in API at the top of 50-phone.js). Live info needs phoneNet(); without it each app says so and
// shows only what it saved earlier. State: PH().tr (Transit: ORCA balance, alerts, what you've seen), PH().wx (forecasts).
//  🚌 Transit: the next T Line (Link) and bus departures to every open neighborhood, from the hoods' ride data (22-hood-*.js);
//    an ORCA card you reload in the app that pays bus fares (adults; kids ride free on the Youth ORCA card); and service
//    alerts a day ahead. An alert is rolled once and stored, so it is the truth about that day: the 🚌 bus breakdown on the
//    way to work (36-life-events.js lev_bus) uses the stored roll, and if you saw the alert you take the T Line instead and
//    it never happens. A station elevator out adds a few minutes to Link trips that day, unless you saw it coming.
//  🗺️ Maps: the neighborhoods open to you (Growing Up's age gates through each place's hidden flag), the time and cost by
//    walking, the Link or bus, and driving (only with a car that runs), and its places: tapping one starts the trip with go()
//    or driveGo() (38-car.js).
//  🌦️ Weather: today and tomorrow from 33-seasons.js's wxOf(). Tomorrow is stored when first shown, and wxOf() returns the
//    stored value from then on, so the forecast is always right. A notification the evening before rain, a windstorm, snow,
//    smoke or the first sunny day of spring. Quick play: a simple August forecast (no effect on the game).
//  🚗 Rides: a rideshare to any other neighborhood: priced by distance, surge late at night and right after a Dome show, a short
//    wait. Adults only (hidden under 18). The quote is fixed for the minute you look at it (a hash, no Math.random).
(function(){
const TR=()=>{const P=PH(),t=P.tr=P.tr||{};t.orca=t.orca||0;t.al=t.al||{};t.seen=t.seen||{};return t};
const trLi=(a,b)=>`<div class="ph-li"><b>${a}</b><span>${b}</span></div>`;
const noNet=what=>phCard(`📵 <b>No service.</b> ${PH().cut?'Pay the phone bill':'Find a signal'} to see ${what}.`,'warn');
const hsh=s=>{let h=2166136261;s=String(s);for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0)/4294967296};
const grow=()=>isGrow();
const adult18=()=>!!S&&!isGrow()&&(S.age==null||S.age>=18);
// the open neighborhoods: Hilltop (no hood key) plus every hood with a place you can see
function trHoods(){const out=[''];for(const h in HOODS)if(Object.keys(L).some(k=>L[k].hood===h&&!L[k].hidden))out.push(h);return out}
const trHub=h=>h?HOODS[h].hub:(L.home&&!L.home.hidden?'home':'mlk');
const trName=h=>h?HOODS[h].name:'Hilltop';
const trIc=h=>h?HOODS[h].ic:'🏘️';
const trPlaces=h=>Object.keys(L).filter(k=>(L[k].hood||'')===h&&!L[k].hidden);
const via=h=>h?HOODS[h].ride.via:'🚶 Walk';
const isLink=h=>/Link/.test(via(h)),isBus=h=>/Bus/.test(via(h));

// ================= 🚌 Transit =================
// service hours: the T Line every 10 minutes 6 AM–8 PM, every 20 from 5 AM and until midnight; buses every 15 minutes
// 6 AM–7 PM, every 30 until 10 PM
function trDeps(h,n){const link=isLink(h),out=[];
  const freq=m=>link?(m>=360&&m<1200?10:m>=300&&m<1440?20:0):(m>=360&&m<1140?15:m>=360&&m<1320?30:0);
  const off=Math.floor(hsh(h||'hilltop')*10);
  for(let m=tod()+1;m<1440&&out.length<n;m++){const f=freq(m);if(f&&(m-off)%f===0)out.push(m)}
  return out}
// the day's alerts: rolled once (when Transit first shows that day) and stored
const TR_STATIONS=['Hilltop District station on MLK','St. Joseph station','Union Station/S 19th St station','Tacoma Dome Station'];
function trBusP(d){if(grow()||!isShiftDay(d))return 0;const e=EV.find(x=>x.id==='lev_bus');if(!e)return 0;
  const p0=e._p0||e.chance;try{return Math.min(1,(typeof p0==='function'?p0({to:'work'}):p0)*DF().bad)}catch(x){return 0}}
function trAlerts(d,roll){const T=TR();if(T.al[d]||!roll)return T.al[d]||null;
  for(const k in T.al)if(+k<day()-3)delete T.al[k];for(const k in T.seen)if(+k<day()-3)delete T.seen[k];
  const A={bus:Math.random()<trBusP(d),elev:Math.random()<0.08};if(A.elev)A.st=TR_STATIONS[Math.floor(Math.random()*TR_STATIONS.length)];
  return (T.al[d]=A)}
function trAlertHtml(d,A){const w=d===day()?'Today':'Tomorrow',o=[];
  if(A.bus){const J=job();o.push(`🚌 <b>${w}:</b> a bus on your morning run up MLK is pulled from service (engine trouble). Riders to ${J.place}: take the T Line two blocks over.`)}
  if(A.elev)o.push(`🛗 <b>${w}:</b> the elevator at ${A.st} is out. Use the stairs or the far entrance, a few extra minutes on the Link.`);
  return o}
// pay a bus fare from the ORCA card when it covers it (wraps onArrive like 38-car.js's Drive)
let TR_CARD=false;
{const hf=hoodFare;hoodFare=function(a,b){return TR_CARD?0:hf(a,b)}}
{const oa=onArrive;onArrive=function(dest,from){
  if(grow())return oa(dest,from);
  let f=0;try{f=hoodFare(from,dest)}catch(e){}
  const T=S.ph&&S.ph.tr,use=f>0&&T&&T.orca>=f;
  if(!use)return oa(dest,from);
  TR_CARD=true;try{oa(dest,from)}finally{TR_CARD=false}
  T.orca=Math.round((T.orca-f)*100)/100;S.stats.fares=(S.stats.fares||0)+f;
  say(`🪪 You tap your ORCA card: ${$(f)} fare, ${$(T.orca)} left on it.`);
  if(T.orca<f&&phoneInstalled('transit'))phoneNotify('transit',`ORCA balance low: ${$(T.orca)}. Reload in the app.`)}}
function trReload(v){const T=TR();v=rp(v);if(S.money<v||!phoneNet())return false;spend(v);T.orca=Math.round((T.orca+v)*100)/100;pass(1);phoneUse(1);
  say(`🪪 ORCA card reloaded: +${$(v)}. Balance ${$(T.orca)}.`);return true}
// the bus breakdown uses the stored roll; seen it coming, you take the T Line and it never happens
{const e=EV.find(x=>x.id==='lev_bus');if(e){e._p0=e.chance;const p0=e.chance;
  e.chance=function(ctx){const A=S&&S.ph&&S.ph.tr&&S.ph.tr.al[day()];if(!A)return typeof p0==='function'?p0(ctx):p0;
    if(!A.bus||S.ph.tr.seen[day()])return 0;return 1/Math.max(0.01,DF().bad)}}}
{const fh=fireHook;fireHook=function(hook,ctx){
  try{if(hook==='travel'&&ctx&&S&&!grow()&&S.ph&&S.ph.tr){const T=S.ph.tr,A=T.al[day()],e=EV.find(x=>x.id==='lev_bus');
    if(A&&A.bus&&T.seen[day()]&&!A.told&&e&&e.cond(ctx)){A.told=true;
      say('🚌 The Transit app warned you about the broken-down bus, so you skip it and walk two blocks to the T Line. You get to work on time.')}}}catch(x){console.error(x)}
  return fh.apply(this,arguments)}}
// the elevator: a few minutes more on the Link that day, unless you saw the alert
{const tm=travelMins;travelMins=function(a,b){const m=tm(a,b);try{const T=S&&S.ph&&S.ph.tr,A=T&&T.al[day()];
  if(A&&A.elev&&!T.seen[day()]&&L[a]&&L[b]&&hoodOf(a)!==hoodOf(b)&&(isLink(hoodOf(a))||isLink(hoodOf(b))))return m+4}catch(e){}return m}}
definePhoneApp({id:'transit',name:'Transit',ic:'🚌',order:60,size:'34 MB',desc:'Next T Line and bus departures, your ORCA card, and service alerts a day ahead.',
  badge:()=>{if(!phoneNet())return 0;const T=TR(),d=day()+1,A=trAlerts(d,true);return A&&(A.bus||A.elev)&&!T.seen[d]?1:0},
  view(){const T=TR(),here=hoodOf(S.loc)||'';let h='';
    // the ORCA card works without a signal; reloading and live times need one
    h+=grow()?phCard(`🪪 <b>Youth ORCA card:</b> free rides on the buses and the Link for riders 18 and under.`,'ok')
      :phCard(`🪪 <b>ORCA card:</b> ${$(T.orca)}. It pays bus fares (the T Line is free).${T.orca<rp(2)?' Reload it below.':''}`,T.orca<rp(2)?'warn':'ok');
    if(!phoneNet())return h+noNet('departures and alerts');
    phoneUse(0.5);
    h+=phSub('Service alerts');let any=0;
    for(const d of [day(),day()+1]){const A=trAlerts(d,true);T.seen[d]=true;for(const x of trAlertHtml(d,A)){h+=phCard(x,'warn');any++}}
    if(!any)h+=phCard('✅ No alerts today or tomorrow. Everything is running.','ok');
    h+=phSub(`Next rides from ${trName(here)}`);
    for(const k of trHoods()){if(k===here)continue;
      const m=travelMins(S.loc,trHub(k)),fare=hoodFare(S.loc,trHub(k)),v=k?via(k):here?via(here):'🚶 Walk',walk=/Walk/.test(v);
      const deps=walk?[]:trDeps(k||here,2),fareT=grow()?'free':fare?$(fare):'free';
      h+=trLi(`${trIc(k)} ${trName(k)}`,walk?`🚶 a walk · ${m} min`:deps.length?`${v} ${deps.map(fmt).join(', ')} · ${m} min door to door · ${fareT}`:`${v}: no more tonight${adult18()?' · try 🚗 Rides':''}`)}
    if(!grow()){h+=phSub('Reload your ORCA card');
      for(const v of [10,20,40])h+=phBtn(`🪪 Add ${$(rp(v))}`,()=>trReload(v),{dis:S.money<rp(v),sub:S.money<rp(v)?`You have ${$(Math.round(S.money))}.`:'1 minute.'})}
    h+=phNote('Alerts for tomorrow show up the day before. Seen one coming, you can plan around it.');
    return h}});

// ================= 🗺️ Maps =================
const walkMins=(k)=>{const hh=hoodOf(S.loc)||'',m=travelMins(S.loc,trHub(k));if(k===hh)return m;const r=k?HOODS[k].ride:hh?HOODS[hh].ride:null;
  return r&&/Walk/.test(r.via)?m:Math.round(m*2.6)};
const canCar=()=>!grow()&&!!S.car&&!!S.car.own&&!S.car.down&&typeof driveGo==='function';
function driveEst(a,b){const ha=hoodOf(a),hb=hoodOf(b);if(ha===hb)return null;   // the same formula as 38-car.js's driveMins
  const r=h=>h?HOODS[h].ride.mins:0,park=ha==='downtown'||hb==='downtown'?5:2;return Math.max(6,Math.round(Math.max(r(ha),r(hb))*0.5)+park)}
function mapGo(k,drive){phoneClose();if(drive)driveGo(k);else go(k)}
definePhoneApp({id:'maps',name:'Maps',ic:'🗺️',order:61,size:'58 MB',desc:'Every neighborhood open to you: time and cost on foot, by Link or bus, or by car. Tap a place to go.',
  view(arg){if(!phoneNet())return noNet('the map');phoneUse(0.5);
    const here=hoodOf(S.loc)||'';let h='';
    if(arg!=null&&trHoods().includes(arg)){const k=arg,places=trPlaces(k).filter(p=>p!==S.loc);
      h+=phCard(`${trIc(k)} <b>${trName(k)}</b>${k?`<br>${HOODS[k].blurb}`:''}`);
      for(const p of places){const m=travelMins(S.loc,p),dm=canCar()?driveEst(S.loc,p):null;
        h+=phBtn(`${L[p].ic} ${L[p].name}`,()=>mapGo(p,false),{sub:`Go · ${m} min${hoodFare(S.loc,p)&&!grow()?` · ${$(hoodFare(S.loc,p))} fare`:''}`});
        if(dm!=null)h+=phBtn(`🚗 Drive to ${L[p].name}`,()=>mapGo(p,true),{sub:`About ${dm} min, plus gas`})}
      if(!places.length)h+=phNote('You’re here.');
      return h}
    h+=phCard(`📍 You’re at <b>${L[S.loc].name}</b>, ${trName(here)}.`);
    for(const k of trHoods()){const hub=trHub(k),tm=travelMins(S.loc,hub),f=grow()?0:hoodFare(S.loc,hub),dm=canCar()?driveEst(S.loc,hub):null;
      const row=k===here?'You are here':[`🚶 ${walkMins(k)} min`,k!==here&&!/Walk/.test(via(k||here))?`${(k?via(k):via(here)).split(' ')[0]} ${tm} min · ${f?$(f):'free'}`:'',dm!=null?`🚗 ${dm} min`:''].filter(Boolean).join(' · ');
      h+=phBtn(`${trIc(k)} ${trName(k)}`,()=>phoneGo('maps',k),{sub:row})}
    if(grow())h+=phNote('More of Tacoma opens up as you get older.');
    return h}});

// ================= 🌦️ Weather =================
// tomorrow is stored the first time it is shown; wxOf() (33-seasons.js) returns the stored value from then on
{const w0=wxOf;wxOf=function(d){const r=w0(d);if(r==null||!S||!S.ph||!S.ph.wx)return r;const dd=d==null?day():d,st=S.ph.wx[dd];
  if(!st||(S.wxSet&&S.wxSet[dd]))return r;if(isGrow()&&dd===day()&&typeof gRain==='function'&&gRain())return r;return st};window.wxOf=wxOf}
const QWX={sun:['☀️','Sunny and warm, the mountain out'],hot:['🥵','Hot: about 88°F by the afternoon'],marine:['🌥️','Gray morning, sunny by noon'],breeze:['🌬️','Sunny with a breeze off the Sound']};
function wxFc(d){const P=PH(),W=P.wx=P.wx||{};for(const k in W)if(+k<day()-3)delete W[k];
  if(W[d])return W[d];
  if(lifeLong()){const k=wxOf(d);if(k&&d>day())W[d]=k;return k}
  const u=hsh(`q${d}`),k=u<0.45?'sun':u<0.65?'marine':u<0.85?'breeze':'hot';W[d]=k;return k}
const wxNotable=k=>['rain','wind','snow','smoke','spring1'].includes(k);
function wxTip(k){const g=grow();return {rain:'Bring a jacket with a hood.',drizzle:'A hood is plenty.',wind:'Outdoor plans are off: branches come down in the parks.',
  snow:g?'School will probably be closed: a snow day!':'The buses run on chains. Leave early.',smoke:'Stay inside if you can: outdoor plans are off.',spring1:'Everybody will be outside. Get out there.',
  sun:'A good day to be outside.',breaks:'Take the sun when it comes.',gray:'Nothing special.',hot:'Drink water and find shade.',marine:'Wait for the afternoon.',breeze:'A nice one.'}[k]||''}
function wxLine(k){if(lifeLong()){const W=WX[k];return W?`${W.ic} ${cap(W.n)}`:'—'}const q=QWX[k];return q?`${q[0]} ${q[1]}`:'—'}
phoneOnTime(()=>{try{if(!S||S.over||!phoneInstalled('weather')||!phoneNet()||tod()<1140)return;const P=PH();if(P.wxN===day())return;P.wxN=day();
  if(!lifeLong())return;const k=wxFc(day()+1);if(wxNotable(k))phoneNotify('weather',`Tomorrow: ${wxLine(k)}. ${wxTip(k)}`)}catch(e){console.error(e)}});
definePhoneApp({id:'weather',name:'Weather',ic:'🌦️',order:62,size:'22 MB',desc:'Today and tomorrow’s weather, and a heads-up the evening before rain, wind, snow or smoke.',
  view(){const P=PH();let h='';
    if(!phoneNet()){const k=P.wx&&P.wx[day()];return noNet('the forecast')+(k?phCard(`Saved forecast for today: ${wxLine(k)}.`):'')}
    phoneUse(0.5);
    const t=lifeLong()?wxOf(day()):wxFc(day()),n=wxFc(day()+1);
    h+=phCard(`<b>Today:</b> ${wxLine(t)}<br><span class="ph-note">${wxTip(t)}</span>`);
    h+=phCard(`<b>Tomorrow, ${dayName(day()+1)}:</b> ${wxLine(n)}<br><span class="ph-note">${wxTip(n)}</span>`,lifeLong()&&wxNotable(n)&&n!=='spring1'?'warn':'ok');
    h+=phNote(lifeLong()?'🔔 Notifications are on: a heads-up at 7 PM the evening before rain, a windstorm, snow or smoke.':'August in Tacoma: dry, warm and mostly sunny.');
    return h}});

// ================= 🚗 Rides =================
const dome=()=>[4,5].includes(((day()%7)+7)%7)&&tod()>=1260&&tod()<1350;   // just after a Friday or Saturday show at the Dome
const late=()=>tod()>=1320||tod()<300;
function rideQuote(k){const here=hoodOf(S.loc),dest=trHub(k);if((k||null)===(here||null))return null;
  const r=h=>h?HOODS[h].ride.mins:0,mins=Math.max(6,Math.round(Math.max(r(here),r(k||null))*0.5)+2);
  const surge=dome()?1.8:late()?1.4:1,u=hsh(`${S.t}|${k}`),wait=3+Math.floor(u*6)+(late()?4:0);
  return {k,dest,mins,wait,surge,price:Math.round(rp(5+1.4*mins)*surge)}}
let RD=null;
{const tm=travelMins;travelMins=function(a,b){return RD?RD.mins:tm(a,b)}}
{const hf=hoodFare;hoodFare=function(a,b){return RD?0:hf(a,b)}}
{const oa=onArrive;onArrive=function(dest,from){const q=RD;try{oa(dest,from)}finally{RD=null}
  if(q){spend(q.price);S.stats.rides_app=(S.stats.rides_app||0)+1;say(`🚗 Rideshare: ${$(q.price)}${q.surge>1?` (surge pricing ×${q.surge})`:''}, charged to your card.`)}}}
if(window.CAR){const d0=CAR.driving;CAR.driving=()=>d0()||!!RD}
function rideGo(k){const q=rideQuote(k);if(!q||!adult18()||!phoneNet()||S.money<q.price||!L[q.dest])return false;
  phoneClose();phoneUse(1);pass(q.wait);say(`🚗 A gray Prius pulls up after ${q.wait} minutes. The driver checks your name and turns the music down.`);
  RD=q;try{go(q.dest)}finally{if(q.mins<GAME.travelAnim)RD=null}return true}
definePhoneApp({id:'rides',name:'Rides',ic:'🚗',order:63,size:'48 MB',desc:'A rideshare to any neighborhood when the bus won’t do. Pricier late at night and after a Dome show.',
  when:()=>adult18(),
  view(){if(!phoneNet())return noNet('drivers nearby');phoneUse(0.5);let h='';
    const s=dome()?1.8:late()?1.4:1;
    h+=phCard(s>1?`⚡ <b>Surge pricing ×${s}:</b> ${dome()?'the show at the Dome just let out, and everyone wants a ride':'it’s late, and fewer drivers are out'}.`:'🚗 Drivers nearby. Normal prices.',s>1?'warn':'ok');
    const here=hoodOf(S.loc)||'';
    for(const k of trHoods()){if(k===here)continue;const q=rideQuote(k);if(!q)continue;
      h+=phBtn(`${trIc(k)} ${trName(k)} · ${$(q.price)}`,()=>rideGo(k),{dis:S.money<q.price,sub:S.money<q.price?`You have ${$(Math.round(S.money))}.`:`Pickup in ${q.wait} min, then ${q.mins} min to ${L[q.dest].name}.`})}
    h+=phNote('Priced by distance. Charged when you get there.');
    return h}});

// ---- Help: a section in the Your phone chapter ----
{const pg=phoneGuide;phoneGuide=function(){return pg()+`<h3>Getting around</h3>
  <ul><li><b>🚌 Transit:</b> the next T Line and bus times to every neighborhood open to you, and your ORCA card. Reload it in the app and it pays bus fares for you (the T Line is free; riders 18 and under ride free on a Youth ORCA card). Service alerts show up a day ahead: a bus pulled from your morning run or a station elevator out. If you saw it coming, you plan around it and it doesn’t slow you down.</li>
  <li><b>🗺️ Maps:</b> every neighborhood you can go to, with the time on foot, by Link or bus and by car (if you have one that runs). Tap a neighborhood, then a place, to start the trip.</li>
  <li><b>🌦️ Weather:</b> today and tomorrow, and a notification the evening before rain, a windstorm, snow or wildfire smoke. In 🧪 Try it it shows the August forecast.</li>
  <li><b>🚗 Rides</b> (18 and older): a rideshare to any other neighborhood, priced by distance, with a short wait. Prices go up late at night and right after a show at the Tacoma Dome.</li>
  <li>All four need a signal and a paid phone bill for live information.</li></ul>`}}
window.PHONE_TRAVEL={TR,trAlerts,trDeps,rideQuote,rideGo,wxFc,trReload,driveEst};
})();
