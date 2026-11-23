// ============================================================
//  TACOMPTON · PIERCE COUNTY ENGINE: travel across the county, starting somewhere other than Hilltop, and county jobs.
//  County areas are packs like Tacoma's neighborhoods (src/js/23-county-<key>.js, defHood with county:true). This file owns
//  the travel rules, the Go somewhere and phone grouping ("Tacoma" / "Pierce County"), the "Where you start" row of the New
//  game sheet, the county job listings and the guide's Pierce County chapter.
//
//  ---- CONTRACT (stable API; pack files: guard every call with typeof, and call these at run time, not at load) ----
//    countyOn()          → true when the county is open: the longer games (not the Try it teaser), as an adult, or 16+ in Growing Up
//                          (a Youth ORCA card or the family car once you have a license). Your own home town is always open.
//    COUNTY_KEYS         → the keys of every pack with county:true (a live list, read it when you need it)
//    countyIs(key)       → true for a county pack's key
//    countyRide(key)     → {mins, fare, via:'bus'|'express'|'sounder'|'drive', label, drive} from Hilltop right now: the
//                          Pierce Transit bus by default, an express bus or the Sounder train at weekday rush hour where the
//                          pack has one (in their real years), the car when you're driving
//    START_PLACES        → [{key:'hilltop', name, ic, d}, …every pack with county:true and startable:true]
//    lifeStartPlace()    → the key of the place this life started ('hilltop' unless you picked a county town)
//    countyGuideAreas()  → html: a section per county pack (from its guide text), shown in the guide's places chapter. Packs may
//                          {const g=countyGuideAreas;countyGuideAreas=function(){return g()+`<h3>…</h3>…`}})
//  ---- what a pack can set (all optional except ride) ----
//    ride:{via:'bus', mins, fare, drive}   mins/fare: the bus from Hilltop (or miles: the engine works the bus time out);
//                          drive: minutes by car. express:{mins, fare, from} / sounder:{mins, fare, from} on the ride for an
//                          express bus or a Sounder station (from = first year). The engine fills these in for the towns it
//                          knows (Sounder at Puyallup and Sumner from 2000, Lakewood and South Tacoma from 2012).
//    narrows:true          across the Narrows Bridge (the Peninsula): a toll on the way back into Tacoma from 2007
//    startable:true, rent:1.1, schools:{middle,high}, home:{desc}, startBlurb   a town you can start in
//    growActions(loc,d,m)  Growing Up actions for the pack's places (otherwise a simple look around)
//  State: S.startPlace (the town you started in; missing = Hilltop), S.county (made on first use: Good To Go pass, tolls).
// ============================================================

// ---- the contract (function declarations and window getters, so they exist before this file's code runs) ----
function countyIs(k){return !!k&&typeof HOODS!=='undefined'&&!!HOODS[k]&&!!HOODS[k].county}
function countyKeys(){return typeof HOODS==='undefined'?[]:Object.keys(HOODS).filter(countyIs)}
Object.defineProperty(window,'COUNTY_KEYS',{configurable:true,get:countyKeys});
var COUNTY_FORCE=false;
function countyOn(){
  if(COUNTY_FORCE)return true;
  if(typeof S==='undefined'||!S||typeof lifeLong!=='function'||!lifeLong())return false;
  if(typeof isGrow==='function'&&isGrow()){const a=S.age||12;return a>=16}   // a Youth ORCA card (14+) or the family car; the county opens at 16
  return true;
}
function lifeStartPlace(){const k=typeof S!=='undefined'&&S&&S.startPlace;return k&&countyIs(k)?k:'hilltop'}
function countyStartPlaces(){
  const out=[{key:'hilltop',name:'Hilltop',ic:'🏘️',d:'The old neighborhood on the hill in Tacoma: the game as it has always been.'}];
  for(const k of countyKeys()){const H=HOODS[k];if(H.startable)out.push({key:k,name:H.name,ic:H.ic,d:H.startBlurb||H.blurb})}
  return out;
}
Object.defineProperty(window,'START_PLACES',{configurable:true,get:countyStartPlaces});
function countyRide(k){return typeof COUNTY!=='undefined'&&COUNTY.ride?COUNTY.ride(k):null}
function countyGuideAreas(){if(typeof HOODS==='undefined')return '';const ks=countyKeys();if(!ks.length)return '';
  return `<h3>Pierce County</h3><p>In the longer games, past Tacoma (the Pierce County chapter has buses, trains, tolls, starting there and jobs):</p>`+
    ks.map(k=>{const H=HOODS[k];return `<p class="tut-place"><b>${H.ic} ${H.name}.</b> ${H.guide||H.blurb}${H.places?` Places: ${Object.values(H.places).map(p=>p.name).join(', ')}.`:''}</p>`}).join('')}
window.countyOn=countyOn;window.countyIs=countyIs;window.countyRide=countyRide;window.lifeStartPlace=lifeStartPlace;

// ============================================================
//  The engine
// ============================================================
var COUNTY=(function(){
const Y=()=>typeof yearNow==='function'?yearNow():2026;
const HS=()=>typeof HOODS!=='undefined'?HOODS:{};
const grow=()=>typeof isGrow==='function'&&isGrow();
const CS=()=>S.county||(S.county={gtg:false,tolls:0,paid:0});
const LA=()=>typeof L_ADULT!=='undefined'?L_ADULT:L;
// ---- what the engine knows about the towns (a pack's own ride fields win) ----
// Sounder: Tacoma Dome Station to Seattle from Sept 2000, through Puyallup and Sumner; Lakewood and South Tacoma from Oct 2012.
// Pierce Transit left Sumner, Bonney Lake, Buckley, Orting and DuPont in fall 2012 (a smaller service area after the cuts):
// from then on those towns are Sound Transit buses with a transfer, or the train, or the car.
const TOWNS=[
  {re:/Puyallup/i,sounder:{from:2000,mins:30,fare:4},rent:1.05},
  {re:/Sumner/i,sounder:{from:2000,mins:36,fare:4},ptOut:2012,rent:1.05},
  {re:/Lakewood/i,sounder:{from:2012,mins:24,fare:4},express:{from:1999,mins:26,fare:3},rent:0.95},
  {re:/Gig Harbor|Peninsula/i,narrows:true,express:{from:1999,mins:30,fare:3},rent:1.3},
  {re:/DuPont/i,express:{from:1999,mins:34,fare:3},ptOut:2012,rent:1.15},
  {re:/Bonney Lake|Buckley|Orting/i,ptOut:2012,rent:1.05},
  {re:/Spanaway|Parkland|Midland/i,rent:0.92},
  {re:/University Place|Steilacoom/i,rent:1.12},
  {re:/Fife|Milton|Edgewood/i,rent:1.0},
];
const town=H=>TOWNS.find(t=>t.re.test(H.name||''))||{};
// ---- setting up a county pack (at load, and for any pack registered later) ----
let SEEN=0;
function prep(){const H0=HS(),ks=Object.keys(H0);if(ks.length===SEEN)return;SEEN=ks.length;
  for(const k of ks){const H=H0[k];if(!H.county||H.__cty)continue;try{setup(k,H)}catch(e){console.error(e)}}}
function setup(k,H){
  Object.defineProperty(H,'__cty',{value:true});
  const T=town(H),r=Object.assign({},H.ride||{});
  if(r.mins==null)r.mins=Math.round(12+(r.miles||10)*2.6);
  if(r.fare==null)r.fare=2;
  if(r.drive==null)r.drive=H.drive!=null?H.drive:Math.max(10,Math.round(r.mins*0.5));
  const yr=(x,d)=>typeof x==='number'?Object.assign({mins:Math.round(r.mins*0.7),fare:d},T[x===r.sounder?'sounder':'express']||{},{from:x}):x;
  if(typeof r.sounder==='number')r.sounder=yr(r.sounder,4);if(typeof r.express==='number')r.express=yr(r.express,3);
  if(!r.sounder&&T.sounder)r.sounder=T.sounder;if(!r.express&&T.express)r.express=T.express;
  if(r.ptOut==null&&T.ptOut)r.ptOut=T.ptOut;
  if(H.narrows==null&&T.narrows)H.narrows=true;
  if(H.rent==null)H.rent=T.rent||1;
  H.ride0=r;
  // the ride everyone else reads (05-ui.js, 38-car.js, 54-phone-travel.js): what you'd take right now
  H.ride={get via(){return ride(k).label},get mins(){return ride(k).mins},get fare(){return ride(k).fare},get drive(){return driveOf(k)},get mode(){return ride(k).via}};
  // the places: hidden until the county is open (your own home town is always open)
  for(const pk of Object.keys(H.places||{})){const p=LA()[pk];if(!p)continue;hideWrap(p,k)}
  // Growing Up's table: the same places, for 16 and up (and a home town)
  if(typeof G_L!=='undefined')for(const pk of Object.keys(H.places||{})){const p=LA()[pk]||H.places[pk];if(G_L[pk])continue;
    G_L[pk]={hood:k,get name(){return kidSafe(p.name)},ic:p.ic,get desc(){return kidSafe(p.desc)},hours:p.hours,art:o=>p.art(o)+(typeof gRainArt==='function'?gRainArt():''),get hidden(){return !open(k)}}}
}
// Growing Up sees the same places with kid words (no bars, beer or concerts: a show, a grill, drinks)
const KID_SWAP=[[/\bconcerts\b/g,'shows'],[/\bconcert\b/g,'show'],[/\bConcert/g,'Show'],[/\b(beer|wine|cocktails?)\b/gi,'drinks'],[/\btaverns?\b/gi,'grill'],[/\bbars\b/gi,'grills'],[/\bbar\b/gi,'grill']];
function kidSafe(t){if(typeof t!=='string')return t;for(const [re,to] of KID_SWAP)t=t.replace(re,to);return t}
function hideWrap(p,k){const d=Object.getOwnPropertyDescriptor(p,'hidden');let v=d&&!d.get?d.value:undefined;const g=d&&d.get;
  // the pack's own gate asks countyOn(): your home town counts as open for it
  const base=()=>{if(!g)return !!v;const f=COUNTY_FORCE;COUNTY_FORCE=!countyOn()&&typeof S!=='undefined'&&!!S&&S.startPlace===k;try{return !!g.call(p)}finally{COUNTY_FORCE=f}};
  Object.defineProperty(p,'hidden',{configurable:true,enumerable:true,get(){return base()||!open(k)},set(x){if(d&&d.set)d.set.call(p,x);else v=x}})}
const open=k=>countyOn()||(typeof S!=='undefined'&&!!S&&S.startPlace===k);

// ---- the ride from Hilltop, right now ----
const LABEL={bus:'🚌 Bus',express:'🚍 Express Bus',sounder:'🚆 Sounder train',drive:'🚗 Drive'};
function rush(){if(typeof S==='undefined'||!S)return false;const d=day(),m=tod(),w=dateOf(d).dow;return w<5&&((m>=300&&m<540)||(m>=900&&m<1140))}
function driving(){return typeof window.CAR!=='undefined'&&!!window.CAR&&typeof CAR.driving==='function'&&CAR.driving()}
function oneBridge(H){return !!H.narrows&&Y()<2007}
function busOf(k){const H=HS()[k],r=H.ride0,y=Y(),out=r.ptOut&&y>=r.ptOut&&!(Y()===r.ptOut&&dateOf(day()).m<10);
  return {via:'bus',mins:r.mins+(out?25:0)+(oneBridge(H)?8:0),fare:out?3:r.fare,ptOut:out}}
function ride(k){prep();const H=HS()[k];if(!H||!H.ride0)return null;const r=H.ride0,y=Y();
  const drv={via:'drive',mins:driveOf(k),fare:0};
  if(typeof S!=='undefined'&&S&&driving())return Object.assign(drv,{label:LABEL.drive,drive:drv.mins});
  let best=busOf(k);
  if(typeof S!=='undefined'&&S&&rush()){
    if(r.express&&y>=(r.express.from||1980)&&r.express.mins+(oneBridge(H)?8:0)<best.mins)best={via:'express',mins:r.express.mins+(oneBridge(H)?8:0),fare:r.express.fare||3};
    if(r.sounder&&y>=(r.sounder.from||2000)&&r.sounder.mins<best.mins)best={via:'sounder',mins:r.sounder.mins,fare:r.sounder.fare||4}}
  best.label=LABEL[best.via]+(best.ptOut?' (a transfer)':'');best.drive=drv.mins;return best}
function driveOf(k){const H=HS()[k];if(!H||!H.ride0)return 20;return H.ride0.drive+(oneBridge(H)?10:0)}

// ---- travel times: county ↔ Tacoma neighborhoods and county ↔ county go through town ----
const isC=h=>!!h&&countyIs(h);
function legTo(k,h,hilltopHub){const hub=h?HS()[h].hub:hilltopHub;if(k===hub)return 0;return TRAVEL[k+'|'+hub]??TRAVEL[hub+'|'+k]??8}
function countyMins(a,b,hood,hilltopHub,base){
  const ha=hood(a),hb=hood(b);if(ha===hb||(!isC(ha)&&!isC(hb)))return base;
  const car=driving(),r=h=>!h?0:isC(h)?(car?driveOf(h):HS()[h].ride.mins):(car?Math.round(HS()[h].ride.mins*0.5):HS()[h].ride.mins);
  const legs=car?4:legTo(a,ha,hilltopHub)+legTo(b,hb,hilltopHub);
  if(!ha||!hb)return legs+r(ha)+r(hb);                                  // to or from Hilltop: the ride itself
  if(isC(ha)&&isC(hb))return legs+Math.max(r(ha),r(hb))+Math.round(Math.min(r(ha),r(hb))*0.8);   // across the county, through town
  const c=isC(ha)?ha:hb,t=isC(ha)?hb:ha;return legs+r(c)+Math.round(r(t)*0.5)+4;   // a county town and a Tacoma neighborhood
}
// ---- the Narrows Bridge toll: on the way into Tacoma, from July 2007 (Good To Go! pass or the toll booth) ----
const GTG={2007:1.75,2008:2.75,2012:4.00,2013:4.25,2014:4.50};
function toll(pass){const y=Y(),o=typeof S!=='undefined'&&S?dateOf(day()):{y:2026,m:1};if(y<2007||(y===2007&&o.m<7))return 0;
  let v=GTG[2007];for(const k in GTG)if(+k<=y)v=GTG[k];if(y>2026)v=v*Math.pow(1.03,y-2026);
  const booth=v+(y<2013?1.25:1);return Math.round((pass?v:booth)*100)/100}
const narrowsTrip=(from,to)=>{const a=hoodOf(from),b=hoodOf(to);return !!a&&!!HS()[a]&&!!HS()[a].narrows&&!(b&&HS()[b]&&HS()[b].narrows)};
const anyNarrows=()=>Object.values(HS()).some(H=>H.county&&H.narrows);
return {prep,setup,ride,driveOf,busOf,countyMins,toll,narrowsTrip,anyNarrows,rush,driving,open,TOWNS,LABEL,CS,town};
})();
COUNTY.prep();

// ---- travel: the adult game and Growing Up ----
{const tm=travelMins;travelMins=function(a,b){const m=tm(a,b);if(isGrow())return m;
  try{COUNTY.prep();let x=COUNTY.countyMins(a,b,hoodOf,'link',m);x=x+countyCommute(a,b);return x}catch(e){console.error(e);return m}}}
if(typeof GROW!=='undefined'&&GROW.travelMins){const tm=GROW.travelMins;GROW.travelMins=function(a,b){const m=tm(a,b);
  try{COUNTY.prep();return COUNTY.countyMins(a,b,k=>(L[k]||{}).hood||null,'mlk',m)}catch(e){console.error(e);return m}}}
// the toll, and the first trip to a county town
{const oa=onArrive;onArrive=function(dest,from){const drove=COUNTY.driving();oa(dest,from);
  try{if(!S||isGrow()||S.loc!==dest)return;
    if(drove&&COUNTY.narrowsTrip(from,dest)){const C=COUNTY.CS(),t=COUNTY.toll(C.gtg);
      if(t>0){money(-t);C.tolls++;C.paid=Math.round((C.paid+t)*100)/100;if(S.stats)S.stats.spent=(S.stats.spent||0)+t;
        say(`🌉 The Narrows Bridge toll on the way into Tacoma: ${$(t)}${C.gtg?' on your Good To Go! pass':' at the toll booth'}.${C.gtg?'':` A Good To Go! pass would make it ${$(COUNTY.toll(true))}.`}`)}}
    const h=hoodOf(dest),hf=hoodOf(from);
    if(h&&countyIs(h)&&h!==hf){const C=COUNTY.CS();C.seen=C.seen||{};
      if(!C.seen[h]){C.seen[h]=day()+1;const H=HOODS[h],r=countyRide(h);
        if(h!==lifeStartPlace())say(`${H.ic} <b>${H.name}</b>. ${H.blurb}`);
        if(Object.keys(C.seen).length===1)lifeMoment('🗺️',`First trip out into Pierce County: ${H.name}${r&&r.via!=='drive'?`, by ${LABEL_WORD[r.via]}`:''}.`)}}
  }catch(e){console.error(e)}}}
const LABEL_WORD={bus:'bus',express:'express bus',sounder:'Sounder train',drive:'car'};

// ---- the Good To Go! pass, at home, once you drive and the Peninsula is on the map ----
function countyHomeActs(a){
  if(!S||isGrow()||S.loc!=='home'||!countyOn()||!COUNTY.anyNarrows()||yearNow()<2007)return a;
  if(!(S.car&&S.car.own))return a;const C=COUNTY.CS();if(C.gtg)return a;const c=rp(5);
  a.push({ic:'🌉',l:`Get a Good To Go! pass — ${$(c)}`,s:`10 min online. The Narrows Bridge toll into Tacoma drops from ${$(COUNTY.toll(false))} at the booth to ${$(COUNTY.toll(true))}.`,cat:'money',dis:!canAfford(c),
    fn:()=>{spend(c);C.gtg=true;pass(10);say('🌉 A Good To Go! account and a sticker pass for the windshield. The toll comes out of the account every time you cross back into Tacoma.')}});
  return a}
{const ah=actionsHere;actionsHere=function(){const a=ah();if(!S||isGrow())return a;try{return countyHomeActs(a)}catch(e){console.error(e);return a}}}

// ---- Sounder to Seattle for the day, from the Tacoma Dome Station (weekday mornings, from Sept 2000) ----
if(typeof HOODS!=='undefined'&&HOODS.downtown&&HOODS.downtown.actions){const a0=HOODS.downtown.actions;HOODS.downtown.actions=function(loc,d,m){const a=a0.apply(this,arguments)||[];
  try{if(loc!=='dt_dome'||!lifeLong()||yearNow()<2000||(yearNow()===2000&&dateOf(d).m<10))return a;const wk=dateOf(d).dow<5,ok=wk&&m>=330&&m<=540,c=rp(5)*2;
    a.push({ic:'🚆',l:`Ride the Sounder to Seattle for the day — ${$(c)}`,s:ok?'The morning train from the Tacoma Dome Station, back on the 5 o’clock: Pike Place Market, the waterfront, a long walk. Until about 6:30 PM. Stress −14, energy −12.':'Sounder trains run on weekday mornings (5:30 to 9 AM) to Seattle, and back in the evening.',cat:'here',dis:!ok||!canAfford(c),
      fn:()=>{spend(c);pass(Math.max(60,1110-tod()));adj('stress',-14);adj('energy',-12);S.stats.rides=(S.stats.rides||0)+1;
        say(pick(['🚆 An hour up the valley past Puyallup and Kent with a coffee and the window seat, then Seattle: the market’s flower stalls, the ferries pulling out, a long walk on the waterfront. The 5 o’clock train home is full of people asleep with their mouths open. You’re one of them.','🚆 The train rolls out of the Dome station and up through the valley: farms, warehouses, the mountain off to the right. A whole day in Seattle, and Tacoma looks good when you get back.']))}})}catch(e){console.error(e)}return a}}

// ---- 🧭 Go somewhere: "Tacoma" and "Pierce County" (05-ui.js calls this before each neighborhood's heading) ----
function goGroupHead(hk,prev,hoods){
  if(!hoods.some(h=>countyIs(h)))return '';
  const c=countyIs(hk);if(prev!==null&&countyIs(prev)===c)return '';
  return `<div class="sect gogroup">${c?'🌲 Pierce County':'🏙️ Tacoma'}</div>`;
}
window.goGroupHead=goGroupHead;

// ---- 📱 Maps and Transit: the same two groups, and the bridge toll ----
function countyPhoneGroups(html){
  COUNTY.prep();const ck=COUNTY_KEYS.filter(k=>Object.keys(L).some(p=>L[p].hood===k&&!L[p].hidden));if(!ck.length)return html;
  const at=(name)=>{const i=html.indexOf(name);return i};
  const firstOf=names=>{let best=-1;for(const n of names){const i=at(n);if(i>=0&&(best<0||i<best))best=i}return best};
  const tac=['🏘️ Hilltop'].concat(Object.keys(HOODS).filter(k=>!countyIs(k)).map(k=>`${HOODS[k].ic} ${HOODS[k].name}`));
  const cty=ck.map(k=>`${HOODS[k].ic} ${HOODS[k].name}`);
  const start=i=>{const b=html.lastIndexOf('<button',i),d=html.lastIndexOf('<div class="ph-li"',i);return Math.max(b,d)};
  const ci=firstOf(cty);if(ci<0)return html;const cs=start(ci);if(cs<0)return html;
  html=html.slice(0,cs)+phSub('🌲 Pierce County')+html.slice(cs);
  const ti=firstOf(tac);if(ti>=0&&ti<cs){const ts=start(ti);if(ts>=0)html=html.slice(0,ts)+phSub('🏙️ Tacoma')+html.slice(ts)}
  return html}
function countyTollNote(){if(isGrow()||!COUNTY.anyNarrows()||!countyOn())return '';const y=yearNow();
  if(y<2007)return phNote('🌉 One Narrows Bridge in these years: no toll, but expect a backup at rush hour.');
  const C=COUNTY.CS();return phNote(`🌉 Driving back into Tacoma over the Narrows Bridge: a toll of ${$(COUNTY.toll(true))} with a Good To Go! pass${C.gtg?' (you have one)':`, ${$(COUNTY.toll(false))} at the booth`}. Westbound is free.`)}
for(const id of ['maps','transit']){const A=typeof PHONE_APPS!=='undefined'&&PHONE_APPS.find(x=>x.id===id);if(!A)continue;const v0=A.view;
  A.view=function(arg){let h=v0.apply(this,arguments);try{if(arg==null){h=countyPhoneGroups(h);if(id==='maps')h+=countyTollNote()}
    else if(id==='maps'&&countyIs(arg)){const r=countyRide(arg);if(r)h+=phNote(`${r.label}: about ${r.mins} min from Hilltop${r.fare&&!isGrow()?`, ${$(rp(r.fare))}`:''}. By car about ${r.drive} min.${HOODS[arg].narrows?' Across the Narrows Bridge.':''}`)+(HOODS[arg].narrows?countyTollNote():'')}}catch(e){console.error(e)}return h}}

// ============================================================
//  Starting somewhere other than Hilltop
// ============================================================
const START_RENT=k=>{const H=HOODS[k];return H&&H.rent?H.rent:1};
function startTown(){const k=lifeStartPlace();return k==='hilltop'?null:HOODS[k]}
function startSchools(){const H=startTown();if(!H)return null;const t=H.name.replace(/ ?&.*$/,'').replace(/^The /,'');
  return Object.assign({middle:`${t} Middle School`,high:`${t} High School`,town:t},H.schools||{})}
// the home (and Growing Up's school) move to the town you start in
{const at=()=>{const k=lifeStartPlace();return k==='hilltop'?undefined:k};
  const homeTo=(p,kid)=>{if(!p)return;Object.defineProperty(p,'hood',{configurable:true,enumerable:true,get:at});
    const d0=Object.getOwnPropertyDescriptor(p,'desc');const base=()=>d0&&d0.get?d0.get.call(p):d0?d0.value:'';
    Object.defineProperty(p,'desc',{configurable:true,enumerable:true,get(){const H=startTown();if(!H)return base();
      return H.home&&H.home.desc?H.home.desc:kid?`Your family’s rented house in ${startSchools().town}: your room half unpacked, Nia’s drawings on the fridge, Mom’s plants on the porch`:`Your apartment in ${startSchools().town}: boxes, a bed, a fridge and a window over the street`},set(v){}})};
  homeTo(LA_home(),false);if(typeof G_L!=='undefined'){homeTo(G_L.home,true);if(G_L.school)Object.defineProperty(G_L.school,'hood',{configurable:true,enumerable:true,get:at})}}
function LA_home(){return (typeof L_ADULT!=='undefined'?L_ADULT:L).home}
// the names on screen: the town's schools, and "Welcome to Puyallup" (not in the guide or on the title screen)
function startText(s){const H=startTown();if(!H||!s||typeof s!=='string')return s;const N=startSchools(),t=N.town;
  return s.replace(/Summit View Middle School/g,N.middle).replace(/Summit View/g,N.middle).replace(/Hilltop High School/g,N.high).replace(/Hilltop High/g,N.high)
    .replace(/Welcome to Hilltop/g,`Welcome to ${t}`).replace(/moved to Hilltop/gi,m=>m[0]+`oved to ${t}`).replace(/Your first morning on Hilltop/g,`Your first morning in ${t}`)
    .replace(/A third-floor walk-up on Hilltop/g,`An apartment of your own in ${t}`).replace(/your own apartment on Hilltop/g,`your own apartment in ${t}`)
    .replace(/a third-floor walk-up on Hilltop/g,`an apartment in ${t}`)}
window.startText=startText;
function startFixNode(root){if(!root||!startTown())return;
  const skip=n=>n&&n.closest&&n.closest('#tut,.title,script,style,textarea,input');
  if(root.nodeType===3){if(skip(root.parentNode))return;const v=root.nodeValue,w=startText(v);if(w!==v)root.nodeValue=w;return}
  if(root.nodeType!==1||skip(root))return;const tw=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;const all=[];while((n=tw.nextNode()))all.push(n);
  for(const t of all){if(skip(t.parentNode))continue;const v=t.nodeValue,w=startText(v);if(w!==v)t.nodeValue=w}}
if(typeof MutationObserver!=='undefined'&&typeof document!=='undefined'){
  const mo=new MutationObserver(ms=>{if(typeof S==='undefined'||!S||!S.startPlace||S.startPlace==='hilltop')return;try{for(const m of ms)for(const n of m.addedNodes)startFixNode(n)}catch(e){console.error(e)}});
  const st=()=>mo.observe(document.body,{childList:true,subtree:true});if(document.body)st();else document.addEventListener('DOMContentLoaded',st)}
// the start: home there, rent by area (the start year's level is already set by 63-era.js), the life story
{const ln=lifeNew;lifeNew=function(){const p=LIFE_PICK;ln.apply(this,arguments);try{startApply(p)}catch(e){console.error(e)}}}
function startApply(p){COUNTY.prep();const k=p&&p.startPlace;
  if(!k||k==='hilltop'||!lifeLong()||!countyIs(k)||!HOODS[k].startable){delete S.startPlace;return}
  S.startPlace=k;const H=HOODS[k],t=startSchools().town;
  if(!isGrow()&&S.rent)S.rent.amt=Math.round(S.rent.amt*START_RENT(k)/5)*5;
  if(isGrow()){S.gh=S.gh||{hoods:{},told:{},done:{},job:null,worked:{},miss:0,shifts:0,paid:0,orca:0,rs:false};S.gh.hoods[k]=1}
  COUNTY.CS().seen={[k]:1};
  const m=S.life&&S.life.moments.find(x=>/Hilltop/.test(x.t));if(m)m.t=p.startAge<18?`Moved to ${t} with your family, age ${p.startAge}.`:`Moved into your own apartment in ${t}, age 18.`;
}
// 18 in Growing Up: your own place in the same town, at the town's rent
{const lh=lifeHandoff;lifeHandoff=function(){const r=lh.apply(this,arguments);try{const k=S.startPlace;if(k&&countyIs(k)&&S.rent)S.rent.amt=Math.round(S.rent.amt*START_RENT(k)/5)*5}catch(e){console.error(e)}return r}}
// play again keeps the town
let START_AGAIN=null;
{const la=window.lifeAgain;window.lifeAgain=function(){START_AGAIN=S&&S.startPlace||null;try{return la.apply(this,arguments)}finally{START_AGAIN=null}}}
{const sw=lifeStartWith;lifeStartWith=function(p){if(p&&p.startPlace==null&&START_AGAIN)p=Object.assign({},p,{startPlace:START_AGAIN});return sw.call(this,p)};window.lifeStartWith=lifeStartWith}
// ---- the New game sheet: a "Where you start" row after the start year (63-era.js's eraYearChips, which lifeStartModal calls) ----
function startChips(p){
  const P=START_PLACES;if(P.length<2)return '';
  const q=p.length==='quick',cur=q?'hilltop':(P.some(x=>x.key===p.startPlace)?p.startPlace:'hilltop');
  const chips=P.map(x=>`<button class="lchip${x.key===cur?' on':''}" aria-pressed="${x.key===cur}"${q&&x.key!=='hilltop'?' disabled':''} onclick="lifePick('startPlace','${x.key}')">${x.ic} ${esc(x.name)}</button>`).join('');
  const X=P.find(x=>x.key===cur)||P[0],H=HOODS[cur],kid=p.startAge<18;
  const note=q?'The 🧪 Try it game always starts on Hilltop. Pick a length to start somewhere else in Pierce County.':
    cur==='hilltop'?`${X.d}`:`${X.d} ${kid?`Your family’s home and your school are in ${X.name}`:`Your own apartment is in ${X.name}`}; rent there is ${START_RENT(cur)>1.02?'a little higher':START_RENT(cur)<0.98?'a little lower':'about the same'} than on Hilltop. Hilltop and the rest of Tacoma are ${countyRide(cur)?countyRide(cur).mins:30} minutes away by bus.`;
  return `<div class="sect">Where you start</div><div class="lchips">${chips}</div><p class="lnote">${note}</p>`;
}
window.startChips=startChips;
if(typeof eraYearChips==='function'){const ec=eraYearChips;eraYearChips=function(p){let h=ec.apply(this,arguments);try{h+=startChips(p)}catch(e){console.error(e)}return h};window.eraYearChips=eraYearChips}
// Game options: where this life started
{const go=gameOptionsModal;gameOptionsModal=function(){go.apply(this,arguments);try{const H=startTown();if(!H)return;const p=document.querySelector('#mbg .mb p');
  if(p&&!p.querySelector('.cty-st'))p.insertAdjacentHTML('beforeend',` <span class="cty-st">${H.ic} Started in ${esc(H.name)}.</span>`)}catch(e){console.error(e)}};window.gameOptionsModal=gameOptionsModal}
// Growing Up at home or school in a county town: no "Look around" or "Head home" there (34-grow-hoods.js adds them to every off-hill place)
if(typeof GROW!=='undefined'&&GROW.actionsHere){const ah=GROW.actionsHere;GROW.actionsHere=function(){let a=ah.apply(this,arguments);
  try{if(startTown()&&(S.loc==='home'||S.loc==='school'))a=a.filter(x=>!(x&&(/^Head home/.test(x.l)||(x.ic==='👀'&&/^Look around/.test(x.l)))));
    const h=hoodOf(S.loc),H=h&&countyIs(h)?HOODS[h]:null;if(H&&typeof H.growActions==='function')a=(H.growActions(S.loc,day(),tod())||[]).concat(a)}catch(e){console.error(e)}return a}}

// ============================================================
//  County jobs: extra listings in the longer adult games (the phone's Jobs app and the first-day job sheet), each with its
//  own career ladder (35-careers.js). Not in JOBS' enumerable keys, so the three day-one jobs and the Try it game stay as they are.
//  Pay is a shift's take-home in 2026 dollars, like the base jobs (scaled to the start year's minimum wage below).
// ============================================================
const COUNTY_JOBS={
  jblm:{get n0(){return `Civilian supply technician at ${yearNow()>=2010?'JBLM':'Fort Lewis'}`},short:'the base',ic:'🎖️',
    get place(){return yearNow()>=2010?'Joint Base Lewis-McChord':'Fort Lewis'},role0:'civilian supply technician',
    start:420,end:930,pay:166,days:[0,1,2,3,4],stress:13,energy:24,alarm:330,open:()=>[300,1140],area:[/Lakewood/i,/DuPont|JBLM|Lewis|Steilacoom/i,/Spanaway|Parkland/i],commute:35,bg:true,
    get blurb(){return `Seven to 3:30, Monday to Friday, in a supply warehouse on ${yearNow()>=2010?'Joint Base Lewis-McChord (Fort Lewis and McChord, one base since 2010)':'Fort Lewis'}, just south of Lakewood: a federal civilian job, with a badge at the gate and a background check first.`},
    ladder:{get at(){return yearNow()>=2010?'JBLM':'Fort Lewis'},r:[
      {role:'civilian supply technician',t:'Supply technician',f:1},
      {role:'inventory management specialist',t:'Inventory management specialist',f:1.25,yrs:2,st:65},
      {role:'supply supervisor',t:'Supply supervisor',f:1.55,yrs:4,st:70}]}},
  port:{n0:'Yard clerk at a Port of Tacoma terminal',short:'the terminal',ic:'🏗️',place:'the container terminal',role0:'yard clerk',
    start:480,end:990,pay:188,days:[1,2,3,4,5],stress:15,energy:22,alarm:390,open:()=>[360,1320],hood:'eastside',commute:20,
    blurb:'Eight to 4:30, Tuesday to Saturday, on the tideflats: tracking containers in and out of the yard between the cranes and the trucks. The best pay of the listings, in a hard hat and a safety vest.',
    ladder:{at:'the Port of Tacoma',r:[
      {role:'yard clerk',t:'Yard clerk',f:1},
      {role:'marine clerk',t:'Marine clerk',f:1.3,yrs:2,st:65},
      {role:'terminal supervisor',t:'Terminal supervisor',f:1.6,yrs:4,st:70}]}},
  farm:{n0:'Farmhand on a Puyallup valley farm',short:'the farm',ic:'🚜',place:'the farm in the valley',role0:'farmhand',
    start:360,end:870,pay:140,days:[1,2,3,4,5],stress:10,energy:34,alarm:300,open:()=>[300,1200],area:[/Puyallup/i,/Sumner|Orting/i,/Fife/i],commute:40,
    blurb:'Six to 2:30, Tuesday to Saturday, on a family farm on the valley floor (made up): berries and vegetables in summer, daffodil and tulip bulbs in spring, the farm stand in fall. Early, outdoors and muddy, with Mount Rainier at the end of every row.',
    ladder:{at:'a Puyallup valley farm',r:[
      {role:'farmhand',t:'Farmhand',f:1},
      {role:'crew lead',t:'Crew lead',f:1.15,yrs:1,st:60},
      {role:'farm manager',t:'Farm manager',f:1.45,yrs:4,st:70}]}},
  goodsam:{n0:'Patient transporter at Good Samaritan Hospital in Puyallup',short:'the hospital',ic:'🏨',place:'Good Samaritan Hospital',role0:'patient transporter',
    start:420,end:930,pay:150,days:[0,1,2,3,4],stress:15,energy:28,alarm:330,open:()=>[0,1440],area:[/Puyallup|South Hill/i],commute:40,bg:true,
    blurb:'Seven to 3:30, Monday to Friday, at the big hospital on the hill in Puyallup: wheelchairs, beds and patients from the emergency room to X-ray to their rooms, and a lot of hallway conversation.',
    ladder:{at:'Good Samaritan',r:[
      {role:'patient transporter',t:'Patient transporter',f:1},
      {role:'health unit coordinator',t:'Health unit coordinator',f:1.15,yrs:1,st:65},
      {role:'surgical technologist',t:'Surgical technologist',f:1.6,yrs:1,st:65,prog:{id:'surgtech',t:'the surgical technology program',n:'A surgical technology program at a technical college in the county',mo:12,fee:280,pt:0.75,end:'You finish the surgical technology program and pass the certification exam'}}]}},
  para:{n0:'Paraeducator at an elementary school in Lakewood',short:'the school',ic:'🍎',place:'the elementary school',role0:'paraeducator',
    start:480,end:930,pay:142,days:[0,1,2,3,4],stress:14,energy:26,alarm:390,open:()=>[420,1080],area:[/Lakewood/i,/Steilacoom|University Place/i],commute:35,bg:true,
    blurb:'Eight to 3:30, Monday to Friday, in a public elementary school in Lakewood: reading groups, the lunchroom, recess duty and one kid who needs you more than the others. Fingerprints and a background check first.',
    ladder:{at:'a Lakewood school',r:[
      {role:'paraeducator',t:'Paraeducator',f:1},
      {role:'lead paraeducator',t:'Lead paraeducator',f:1.12,yrs:2,st:65},
      {role:'teacher',t:'Teacher',f:1.7,yrs:1,st:65,prog:{id:'teachcert',t:'a teacher certification program',n:'A two-year teacher certification program for school staff, evenings and summers at a university in Tacoma',mo:24,fee:320,pt:0.8,end:'You finish your teacher certification and get your own classroom'}}]}},
};
const CJ_SHIFT={
  jblm:['Pallets of boots, radios and tent poles in, a convoy’s worth of orders out. Your count matches the system, which on this base counts as a small miracle.','A day on the scanner in a warehouse the size of a hangar, because it used to be one. A sergeant thanks you by name for finding a part nobody could find.','Inventory day: every bin, every shelf, every serial number. Boring, careful, and you’re good at it.'],
  port:['Forty trucks in, forty-two out, and every container in the right row. The crane operators wave from forty meters up.','Rain sideways off the bay all shift. You track a ship’s worth of boxes from the yard to the rail cars and go home soaked and proud of it.','A container with the wrong number on the paperwork. You find it in twenty minutes; the supervisor said it would take two hours.'],
  farm:['Rows of strawberries from first light, the mountain pink over the valley. By lunch your back knows exactly what it did.','Planting and weeding in the long field by the river, then an afternoon at the farm stand selling corn to people who drove out from Tacoma.','The tractor won’t start, so it’s a hand day: hoes, buckets, and a crew that sings when the boss isn’t listening.'],
  goodsam:['Thirty-one trips across the hospital: the emergency room, X-ray, the fourth floor, the lobby. A man going home tells you you’re the best driver he’s had all week.','A busy morning in the emergency department, then a slow afternoon delivering a new mom and her baby to the car. Everybody cries a little, including you.','You learn the back hallways that nobody else knows. You will never use the main elevator again.'],
  para:['Reading groups all morning: one second grader reads a whole page out loud for the first time. Lunchroom duty, recess in the rain, and you are tired in the good way.','A field trip to the lake: twenty-four kids, two teachers, you and a headcount every ten minutes. Everybody comes back.','The teacher is out sick, so the sub leans on you all day. The kids act like you run the place. For one day, you sort of do.'],
};
const CJ_TALK={
  jblm:['☕ Break-room coffee with a retired sergeant who works the next aisle. He has opinions about every forklift on the base.','☕ Your supervisor explains the federal pay scale on a napkin. It makes sense for about a minute.'],
  port:['☕ Coffee in the trailer with the crane operators. They argue about which ship captain parks the worst.','☕ The longshore guys tell you about the old days on the docks. Every story ends with “and we still made the tide.”'],
  farm:['☕ Thermos coffee on a tailgate. The farmer’s grandmother tells you the valley used to be all hops and daffodils, as far as you could see.','☕ Lunch in the shade of the barn: the crew shares tortillas, berries and a radio that only gets one station.'],
  goodsam:['☕ The night-shift nurses hand off the coffee pot like it’s a patient. You learn everybody’s name in the cafeteria line.','☕ A respiratory therapist tells you about the surgical tech program. “You’d be good at it,” she says. You think about it all afternoon.'],
  para:['☕ The staff room has a coffee maker older than the building and a jar of candy for emergencies. Every day is an emergency.','☕ The kindergarten teacher tells you she started as a para too. “Twenty years ago,” she says. “Best decision I ever made.”'],
};
const cjArt=(n,body)=>`${starsSky(n)}${body}`;
const CJ_ART={
  jblm:({night:n})=>cjArt(n,`${tree(30,n,18)}${tree(70,n,22)}<rect x="110" y="58" width="260" height="82" fill="${n?'#3a3f38':'#8f9a7a'}"/><path d="M104 60 Q240 20 376 60 Z" fill="${n?'#2e332c':'#6f7a5a'}"/>
    <rect x="200" y="96" width="80" height="44" fill="${n?'#1e221c':'#4d5640'}"/>${[0,1,2,3].map(i=>`<rect x="${130+i*60}" y="72" width="22" height="12" fill="${win(n,i!==2)}"/>`).join('')}
    <rect x="400" y="100" width="6" height="40" fill="#777"/><rect x="380" y="96" width="46" height="6" fill="${n?'#444':'#c9c2a8'}"/><text x="240" y="54" text-anchor="middle" font-size="8" ${SVGF} fill="${n?'#aaa':'#2c3524'}">SUPPLY</text>
    ${person(300,n,'#4d5640',146)}${person(330,n,'#2a6fa8',146)}${lamp(450,n)}`),
  port:({night:n})=>cjArt(n,`<rect y="96" width="480" height="44" fill="${HC.bay(n)}"/>${[0,1,2].map(i=>`<g transform="translate(${60+i*130} 0)"><rect x="0" y="20" width="8" height="90" fill="${n?'#7a4a3a':'#d0482f'}"/><rect x="40" y="20" width="8" height="90" fill="${n?'#7a4a3a':'#d0482f'}"/><rect x="-30" y="16" width="110" height="10" fill="${n?'#7a4a3a':'#d0482f'}"/>${n?'<circle cx="-26" cy="18" r="2" fill="#f55"/>':''}</g>`).join('')}
    ${[0,1,2,3,4,5].map(i=>`<rect x="${20+i*76}" y="${116-(i%2)*14}" width="70" height="14" fill="${['#2a6fa8','#c0392b','#2f8f6a','#c98a12','#8e44ad','#24507a'][i]}" opacity="${n?.55:1}"/>`).join('')}
    <rect y="130" width="480" height="20" fill="${n?'#2a2a2a':'#8a8a86'}"/>${person(240,n,'#f2b630',146)}${lamp(420,n,146)}`),
  farm:({night:n})=>cjArt(n,`${typeof rainier==='function'?rainier(n,360,.8,104):''}<rect y="104" width="480" height="46" fill="${n?'#1c2a1c':'#6f9a54'}"/>${[0,1,2,3,4,5,6].map(i=>`<path d="M${i*80-40} 150 L240 106" stroke="${n?'#2c3a24':'#4f7a3a'}" stroke-width="6"/>`).join('')}
    <rect x="40" y="62" width="90" height="56" fill="${n?'#4a2420':'#b23a2e'}"/><polygon points="34,64 85,30 136,64" fill="${n?'#2e1a18':'#6a2a22'}"/><rect x="72" y="86" width="26" height="32" fill="${n?'#1e1210':'#f2efe4'}"/>
    <rect x="330" y="118" width="40" height="16" rx="3" fill="#2f8f6a"/><circle cx="340" cy="136" r="7" fill="#333"/><circle cx="364" cy="136" r="5" fill="#333"/>${person(200,n,'#c98a12',146)}${person(250,n,'#2a6fa8',146)}`),
  goodsam:({night:n})=>cjArt(n,`${tree(40,n,20)}<rect x="120" y="24" width="240" height="116" fill="${n?'#3a4048':'#e8e4da'}"/>${[...Array(6)].map((_,r)=>[0,1,2,3,4,5,6,7].map(c=>`<rect x="${132+c*28}" y="${32+r*16}" width="16" height="9" fill="${win(n,(r+c)%3!==1)}"/>`).join('')).join('')}
    <rect x="210" y="118" width="60" height="22" fill="${n?'#1e2a36':'#2a6fa8'}"/><text x="240" y="20" text-anchor="middle" font-size="8" ${SVGF} fill="${n?'#aaa':'#2a6fa8'}">EMERGENCY</text>${person(180,n,'#24507a',146)}${person(300,n,'#c0392b',146)}${tree(430,n,18)}${lamp(400,n)}`),
  para:({night:n})=>cjArt(n,`${tree(30,n,20)}<rect x="90" y="64" width="300" height="76" fill="${n?'#4a3028':'#c9774f'}"/><rect x="86" y="58" width="308" height="8" fill="${n?'#2e1e18':'#7a3b2a'}"/>
    ${[0,1,2,3,4,5,6,7].map(i=>`<rect x="${102+i*36}" y="76" width="22" height="16" fill="${win(n,i%3!==0)}"/>`).join('')}<rect x="220" y="104" width="40" height="36" fill="${n?'#1e1410':'#2a6fa8'}"/>
    <rect x="410" y="96" width="4" height="44" fill="#777"/><path d="M414 98 h20 v12 h-20" fill="#c0392b"/>${person(160,n,'#f2b630',146,.8)}${person(176,n,'#2f8f6a',146,.7)}${person(320,n,'#8e44ad',146)}${tree(450,n,18)}`),
};
// register them: non-enumerable in JOBS, a ladder each, pay in the start year's dollars, names that follow the title
for(const [k,J] of Object.entries(COUNTY_JOBS)){
  const p0=J.pay;delete J.pay;
  Object.defineProperty(J,'pay',{configurable:true,enumerable:true,get(){return typeof eraOld==='function'&&eraOld()?Math.round(p0*eraPayF()):p0},set(v){}});
  Object.defineProperty(J,'pay0',{value:p0,enumerable:false});
  Object.defineProperty(J,'n',{configurable:true,enumerable:true,get(){return typeof careerTitle==='function'?careerTitle(k)||J.n0:J.n0}});
  Object.defineProperty(J,'role',{configurable:true,enumerable:true,get(){return typeof careerOn==='function'&&!CAREER_RAW&&careerOn()&&S.career&&S.career.k===k?careerRung().role:J.role0}});
  Object.defineProperty(J,'county',{value:true,enumerable:false});
  Object.defineProperty(JOBS,k,{value:J,enumerable:false,configurable:true,writable:true});
  if(typeof CAREER_LADDERS!=='undefined')CAREER_LADDERS[k]=J.ladder;
  WORK_ART[k]=CJ_ART[k];SHIFT_LINES[k]=CJ_SHIFT[k];WORK_TALK[k]=CJ_TALK[k];
}
window.COUNTY_JOBS=COUNTY_JOBS;
// where the job is: its county town when that pack is on the map (or the Port on the Eastside); otherwise a commute
function countyJobHood(k){const J=COUNTY_JOBS[k];if(!J)return null;if(J.hood)return HOODS[J.hood]?J.hood:null;
  COUNTY.prep();const ks=COUNTY_KEYS;for(const re of J.area){const h=ks.find(x=>re.test(HOODS[x].name));if(h)return h}return null}
const cjNow=()=>typeof S!=='undefined'&&S&&!isGrow()&&COUNTY_JOBS[S.job]?S.job:null;
{const W=(typeof L_ADULT!=='undefined'?L_ADULT:L).work;if(W)Object.defineProperty(W,'hood',{configurable:true,enumerable:true,get(){const k=cjNow();return k?countyJobHood(k)||undefined:undefined}})}
function countyCommute(a,b){const k=cjNow();if(!k||(a!=='work'&&b!=='work')||a===b)return 0;if(countyJobHood(k))return 0;return COUNTY_JOBS[k].commute||30}
const cjOpen=()=>lifeLong()&&!isGrow()&&countyOn()&&!(typeof milActive==='function'&&milActive())&&!(S.life&&S.life.retired)&&!!S.jobPicked;
const cjBg=k=>!!COUNTY_JOBS[k].bg&&typeof crimeHasRecord==='function'&&crimeHasRecord();
const cjWhere=k=>{const h=countyJobHood(k);return h?`${HOODS[h].ic} ${HOODS[h].name}`:`about ${COUNTY_JOBS[k].commute} min from Hilltop`};
function cjCommuteTxt(k){const was=S.job;S.job=k;try{return travelMins('home','work')}finally{S.job=was}}
// the first-day job sheet in the longer games: the three Hilltop jobs, then the county listings
{const jm=jobModal;jobModal=function(){if(!S||isGrow()||!lifeLong()||!countyOn())return jm.apply(this,arguments);
  const day1=Object.values(JOBS),cj=Object.keys(COUNTY_JOBS);
  modal('💼 Your new job',`<p>You moved here for work. Which job did you take?</p>${day1.map(j=>`<p><b>${j.ic} ${j.n}.</b> ${j.blurb} About <b>${$(j.pay)}</b> a shift${j.tips?' plus tips':''}.</p>`).join('')}
    <div class="sect">🌲 Around Pierce County</div>${cj.map(k=>{const j=JOBS[k];return `<p><b>${j.ic} ${j.n0}.</b> ${j.blurb} About <b>${$(j.pay)}</b> a shift. ${cap(cjWhere(k))}: about ${cjCommuteTxt(k)} min from home.</p>`}).join('')}
    <p style="font-size:13px;color:var(--mute)">You can change jobs later with the 💼 Jobs app on your phone.</p>`,
    Object.entries(JOBS).map(([k,j])=>({l:`${j.ic} ${j.n}`,s:`${fmt(j.start)}–${fmt(j.end)}, ${j.days[0]===0?'Mon–Fri':'Wed–Sun'} · ${$(j.pay)} a shift${j.tips?' + tips':''}`,np:true,fn:()=>pickJob(k)}))
      .concat(cj.map(k=>{const j=JOBS[k];return {l:`${j.ic} ${j.n0}`,s:`${fmt(j.start)}–${fmt(j.end)}, ${dayRange(j.days)} · ${$(j.pay)} a shift · ${cjCommuteTxt(k)} min commute${cjBg(k)?' · background check':''}`,np:true,dis:cjBg(k),fn:()=>pickJob(k)}})),true)}}
const dayRange=ds=>`${DAYS[ds[0]].slice(0,3)}–${DAYS[ds[ds.length-1]].slice(0,3)}`;
// 💼 Jobs app: the county listings (and, while you hold a county job, the Hilltop ones too: the app's own list skips them then)
{const A=typeof PHONE_APPS!=='undefined'&&PHONE_APPS.find(x=>x.id==='jobs');if(A){const v0=A.view;A.view=function(){let h=v0.apply(this,arguments);try{h+=countyJobsHTML()}catch(e){console.error(e)}return h}}}
function countyJobsHTML(){if(!cjOpen())return '';const P=PH(),J=P.jobs=P.jobs||{},net=phoneNet(),busy=!!J.app||!!J.offer||!!J.start;
  const apply=k=>{J.app={k,d:day()};pass(10);phoneUse(2);say(`💼 You apply for ${JOBS[k].n0||JOBS[k].n}. They’ll answer tomorrow.`)};
  let h=phSub('🌲 Around Pierce County');
  const ks=Object.keys(COUNTY_JOBS).filter(k=>k!==S.job).concat(cjNow()?Object.keys(JOBS).filter(k=>k!==S.job):[]);
  for(const k of ks){const N=JOBS[k],bg=COUNTY_JOBS[k]?cjBg(k):k==='hospital'&&typeof crimeHasRecord==='function'&&crimeHasRecord();
    h+=phCard(`${N.ic} <b>${N.n0||N.n}</b><br>${N.blurb}<br>About ${$(N.pay)} a shift to start · ${COUNTY_JOBS[k]?cjWhere(k):'🏘️ Hilltop'}, ${cjCommuteTxt(k)} min from home.${(COUNTY_JOBS[k]?COUNTY_JOBS[k].bg:k==='hospital')?' Background check required.':''}`);
    h+=phBtn(`Apply to ${N.place}`,()=>apply(k),{dis:!net||bg||busy,sub:bg?'The background check would show your record. Once it’s vacated, you can apply.':busy?'One application at a time.':'10 min. A new job starts a new ladder: raises and promotions start over.'})}
  return h}
// starting a new job from a county job (the app's own morning step only starts one from a Hilltop job)
{const om=onMorning;onMorning=function(d){try{const J=S&&!isGrow()&&S.ph&&S.ph.jobs;if(J&&J.start&&d>=J.start.d&&cjNow()&&JOBS[J.start.k]){const k=J.start.k,N=JOBS[k];delete J.start;
    S.job=k;S.alarm=N.alarm;S.career=null;S.standing=Math.max(55,Math.min(70,S.standing));
    if(S.life){S.life.jobs.push({job:k,age:S.age,t:N.role0||N.role,ic:N.ic});lifeMoment(N.ic,`Started a new job: ${N.role0||N.role} at ${N.place}.`)}
    const t=`${N.ic} First day at your new job: <b>${N.n0||N.n}</b>. ${fmt(N.start)} to ${fmt(N.end)}. Your alarm is set for ${fmt(N.alarm)}.`;say(t);if(typeof digestLine==='function')digestLine(t)}}catch(e){console.error(e)}
  return om.apply(this,arguments)}}
// the first-day pick of a county job: the right first shift day
{const pj=pickJob;pickJob=function(k){if(!COUNTY_JOBS[k]||!S)return pj.apply(this,arguments);
  const j=JOBS[k];S.job=k;S.jobPicked=true;S.alarm=j.alarm;
  if(S.life&&!S.life.jobs.length)S.life.jobs.push({job:k,age:S.age,path:'job'});
  let f=0;while(f<7&&!isShiftDay(f))f++;
  say(`${j.ic} You’re the new ${j.role} at ${j.place}. ${f===0?`First shift today at ${fmt(j.start)}.`:`Your first shift is ${dayName(f)} at ${fmt(j.start)}.`} It’s ${travelMins('home','work')} minutes from your door.`);
  stWelcome()}}

// ============================================================
//  The guide: a Pierce County chapter (overview, getting around, starting elsewhere, jobs, then the areas from the packs)
// ============================================================
function countyGuideHTML(){
  COUNTY.prep();const K=COUNTY_KEYS,J=COUNTY_JOBS,hT=typeof hTable==='function'?hTable:(h,r)=>`<table>${r.map(x=>`<tr>${x.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</table>`;
  const tip=typeof hTip==='function'?hTip:(a,b)=>`<p><b>${a}</b> ${b}</p>`;
  const rows=K.map(k=>{const H=HOODS[k],r=H.ride0||{};return [`${H.ic} ${H.name}`,`${r.mins} min${r.ptOut?` (a transfer from ${r.ptOut})`:''}`,
    [r.express?`🚍 express from ${r.express.from}`:'',r.sounder?`🚆 Sounder from ${r.sounder.from}`:''].filter(Boolean).join(', ')||'—',`${r.drive} min${H.narrows?' + toll':''}`]});
  return `<p>Tacoma sits in <b>Pierce County</b>: Lakewood and Joint Base Lewis-McChord to the south, the Puyallup valley and its farms to the east, and the Gig Harbor Peninsula across the Narrows to the west. In the longer games the county opens up beyond Tacoma’s neighborhoods. The 🧪 Try it game stays in Tacoma.</p>
    <ul><li><b>Who can go:</b> adults in the 6 months, 1 year, 2 years and Lifetime games. In Growing Up the county opens at <b>16</b>; younger kids go with family.</li>
    <li><b>🧭 Go somewhere</b> lists places under two headings, <b>🏙️ Tacoma</b> and <b>🌲 Pierce County</b>, and so do the phone’s 🗺️ Maps and 🚌 Transit apps.</li></ul>
    <h3>Getting around the county</h3>
    <ul><li><b>🚌 Pierce Transit buses</b> run to every town, and the farther the town, the longer the ride (most are 25 to 50 minutes from Hilltop). A fare each way for adults; riders 18 and under ride free from 2022.</li>
    <li><b>🚍 Express buses</b> run at weekday rush hour (5 to 9 AM and 3 to 7 PM) to some towns, from 1999: a faster ride with fewer stops.</li>
    <li><b>🚆 Sounder trains</b> leave from the Tacoma Dome Station: north through Puyallup and Sumner to Seattle from fall 2000, and south to Lakewood (and South Tacoma) from fall 2012. Weekday rush hours only. At the Tacoma Dome you can ride the Sounder to Seattle for the day.</li>
    <li><b>🚗 Driving</b> is the fastest way out to the county, with gas and parking, and no bus schedule.</li>
    <li><b>Fall 2012:</b> Pierce Transit’s service area got smaller after budget cuts. Sumner, Bonney Lake, Buckley, Orting and DuPont lost their local buses: from then on it’s the train, a Sound Transit bus with a transfer, or the car.</li></ul>
    ${rows.length?hT(['Area','Bus from Hilltop','Faster at rush hour','By car'],rows):''}
    <h3>The Narrows Bridges</h3>
    <p>The Gig Harbor Peninsula is across the Tacoma Narrows. One bridge until <b>July 2007</b>, when the second span opened beside it; before then, expect a backup at rush hour. From July 2007 there is a <b>toll on the way into Tacoma</b> (eastbound) only: going out to the Peninsula is free. With a <b>Good To Go!</b> pass (buy one at home once you have a car) the toll is about ${$(COUNTY.toll(true))}; at the booth it costs about a dollar more. Bus riders pay only the fare.</p>
    <h3>Starting somewhere else</h3>
    <p>In the longer games, the New game sheet has a <b>Where you start</b> row under the start year: <b>Hilltop</b> (the default) or a town in the county. Start in a town and:</p>
    <ul><li>Your home is there: your own apartment at 18, or your family’s home in Growing Up, with the town’s school names.</li>
    <li>Rent follows the town (a little more on the Peninsula, a little less in Lakewood), at the start year’s prices.</li>
    <li>Hilltop and the rest of Tacoma are a bus ride away, and your town is always open to you, even at 12.</li>
    <li>Your 18th birthday in Growing Up moves you into your own place in the same town.</li></ul>
    <h3>County jobs</h3>
    <p>In the longer adult games, the first-day job sheet and the phone’s 💼 Jobs app list county jobs next to the three Hilltop ones. Each has its own ladder of raises and promotions (the career chapter), and a commute.</p>
    ${hT(['Job','Hours','Pay to start','Next steps'],Object.keys(J).map(k=>{const j=JOBS[k],L0=j.ladder;return [`${j.ic} ${j.n0}`,`${fmt(j.start)}–${fmt(j.end)}, ${dayRange(j.days)}`,`${$(j.pay0)} a shift`,L0.r.slice(1).map(r=>r.t+(r.prog?` (${r.prog.t})`:'')).join(' → ')]}))}
    <p>The base, the hospital and the school run a background check before they hire. The Port of Tacoma job is on the tideflats by the Eastside.</p>
    ${tip('A long commute is a real cost','An hour on the bus each way means leaving earlier, getting home later, and less time for everything else. A car, the express bus or the Sounder can win back half of it.')}
    <p>Each county area, its places and what to do there are in the places chapter, under <b>Pierce County</b>.</p>`;
}
{const hc=helpChapters;helpChapters=function(...a){const ch=hc(...a);try{const i=ch.findIndex(c=>c[0]==='faq');ch.splice(i<0?ch.length:i,0,['county','Pierce County',countyGuideHTML()])}catch(e){console.error(e)}return ch}}

window.COUNTY_API={countyMins:COUNTY.countyMins,toll:COUNTY.toll,ride:COUNTY.ride,jobHood:countyJobHood,commute:countyCommute,startText,startChips,guide:countyGuideHTML,phoneGroups:countyPhoneGroups};
