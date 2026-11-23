// ============================================================
//  TACOMPTON · START YEAR: begin a life in 1980, 1990, 2000, 2010, 2020 or 2026, and live forward through the years.
//  The New life sheet picks the year (Quick play and Growing Up's first week stay 2026). The calendar (10-life.js) counts
//  from the chosen year and keeps going past 2026; this file says what exists when, scales money to the start year, opens
//  places in the year they opened, and adds the city news, the era's everyday lines and the guide's Start year table.
//
//  ---- Stable API (other files: guard with typeof, and never define these yourselves) ----
//    yearNow()          → the calendar year of the day being played (2026 with no game, in Quick play and in old saves)
//    eraHas(feature)    → true once yearNow() reaches ERA_FEATURES[feature] (an unknown feature is true: it always existed)
//    eraHad(feature)    → true while a thing that ended still exists (ERA_UNTIL: the smelter, the Sonics)
//    eraStartYear()     → S.startYear (2026 for old saves and Quick play)
//    ERA_FEATURES       → {feature: first year}. The phone keys: cell, pager, text, camera, apps, maps, transitLive, orca,
//                         weather, phoneBank, onlineBank, rideshare, gig, nextdoor, grocery, telehealth, streaming, datingApp;
//                         places and transit: link, tline, dome, uwt, museumGlass, narrows2, lemay; and more below.
//    eraPriceF()        → everyday prices in the start year as a share of 2026 (rp() and priceAmt() multiply by it)
//    eraPayF()          → pay as a share of 2026, from Washington's minimum wage (JOBS[k].pay already includes it)
//    eraText(s)         → s with the names of its year (K Street before 1993, the bus before the T Line, …)
//  State: S.startYear (set by lifeSetup; missing in old saves = 2026), S.eraY (the year your own lease began).
//  Money: the start year sets the level once (prices by the CPI, pay by the minimum wage, rent halfway between); after that
//  the price level's January rises (38-prices.js), the August rent rises (33-seasons.js) and raises (35-careers.js) carry on.
// ============================================================

const ERA_YEARS=[1980,1990,2000,2010,2020,2026];
// the first year each thing is part of everyday life on Hilltop
const ERA_FEATURES={
  // phones and the internet (64-era-phone.js)
  pager:1985,cell:1998,text:2002,camera:2003,apps:2008,maps:2008,weather:2008,transitLive:2008,phoneBank:2010,nextdoor:2011,
  streaming:2011,datingApp:2012,rideshare:2014,gig:2015,grocery:2015,telehealth:2020,
  // money
  atm:1980,debit:1995,onlineBank:1998,
  // getting around
  orca:2009,link:2003,tline:2023,freeYouthFares:2022,
  // places
  dome:1983,uwt:1990,museumGlass:2002,narrows2:2007,lemay:2012,mlk:1993,
  // school and aid
  pell:1980,runningStart:1992,mgib:1984,post911:2009,wcg:2019,
};
const ERA_UNTIL={smelter:1985,stack:1993,sonics:2008,needGrant:2019};   // the last year these still exist
// what each feature is called in the guide's table (features with no label stay out of it)
const ERA_LABELS={atm:'🏧 ATMs (cash and checks for everything else)',pell:'🤝 The Pell Grant for college',dome:'🏟️ The Tacoma Dome',mgib:'🎖️ The Montgomery GI Bill',
  pager:'📟 Pagers',uwt:'🎓 UW Tacoma',runningStart:'📝 Running Start at TCC',mlk:'🪧 K Street becomes Martin Luther King Jr. Way',debit:'💳 Debit cards',
  cell:'📱 A cell phone in your pocket',onlineBank:'🖥️ Online banking',museumGlass:'🔮 Museum of Glass and the Bridge of Glass',text:'💬 Texting',
  link:'🚈 The Link downtown (a bus ride from Hilltop until the T Line)',camera:'📷 Phone cameras',narrows2:'🌉 The second Narrows Bridge',apps:'🛍️ Phone apps and maps',
  orca:'💳 ORCA cards (paper transfers and passes before)',post911:'🎖️ The Post-9/11 GI Bill',phoneBank:'🏦 Banking on your phone',lemay:'🚗 LeMay – America’s Car Museum',
  transitLive:'🚌 Live bus times',nextdoor:'🏘️ The block club online',rideshare:'🚗 Rideshare apps',gig:'💼 Gig apps',telehealth:'🩺 Video doctor visits',
  grocery:'🛒 Grocery pickup and delivery',wcg:'🤝 The Washington College Grant (the State Need Grant before)',freeYouthFares:'🚌 Free rides for 18 and under',tline:'🚋 The T Line up MLK on Hilltop'};

// ---- the year ----
const eraS=()=>typeof S!=='undefined'&&S?S:null;
function eraStartYear(){const s=eraS();if(!s)return 2026;if(s.startYear)return s.startYear;return 2026}
function yearNow(){const s=eraS();if(!s||!s.startDate||typeof dateOf!=='function')return 2026;
  try{const d=typeof day==='function'?day():0;return dateOf(isFinite(d)?d:0).y}catch(e){return 2026}}
function eraHas(f){const y=ERA_FEATURES[f];return y==null?true:yearNow()>=y}
function eraHad(f){const y=ERA_UNTIL[f];return y==null?true:yearNow()<=y}
const eraOld=()=>eraStartYear()<2026;   // anything here changes the game only in a life that began before 2026
window.yearNow=yearNow;window.eraHas=eraHas;window.eraHad=eraHad;window.eraStartYear=eraStartYear;window.ERA_FEATURES=ERA_FEATURES;

// the first morning: the Monday that matches 2026's (the first Monday of August at 18; a week before the school week at 12 and 15)
function eraStartDate(age,y){
  if(!y||y===2026)return LIFE_START[age];
  const iso=t=>`${t.getUTCFullYear()}-${String(t.getUTCMonth()+1).padStart(2,'0')}-${String(t.getUTCDate()).padStart(2,'0')}`;
  if(age>=18){const a1=new Date(Date.UTC(y,7,1)),dw=(a1.getUTCDay()+6)%7;return iso(new Date(Date.UTC(y,7,1+(7-dw)%7)))}
  const s1=new Date(Date.UTC(y,8,1)),dw=(s1.getUTCDay()+6)%7;return iso(new Date(Date.UTC(y,8,1-dw-7)));
}
window.eraStartDate=eraStartDate;
// the year you were born: a 1980 start at 12 was born in 1968, or 1967 with a birthday later in the year than the start
function eraBornYear(p){const sd=eraStartDate(p.startAge,p.startYear||2026),[y,m,d]=sd.split('-').map(Number),b=p.birthday||{m:1,d:1};
  return y-p.startAge-((b.m>m||(b.m===m&&b.d>d))?1:0)}

// ---- money by year ----
// the consumer price index (CPI-U, the yearly average; 2026 is an estimate), straight lines in between
const ERA_CPI={1980:82.4,1985:107.6,1990:130.7,1995:152.4,2000:172.2,2005:195.3,2010:218.1,2015:237.0,2020:258.8,2021:271.0,2022:292.7,2023:304.7,2024:313.7,2025:322.2,2026:330};
// Washington's minimum wage on January 1 (the federal one where it was higher, 1980 to 1988; Labor & Industries' table)
const ERA_MW={1980:3.10,1981:3.35,1989:3.85,1990:4.25,1994:4.90,1998:5.15,1999:5.70,2000:6.50,2001:6.72,2002:6.90,2003:7.01,2004:7.16,2005:7.35,2006:7.63,2007:7.93,
  2008:8.07,2009:8.55,2011:8.67,2012:9.04,2013:9.19,2014:9.32,2015:9.47,2017:11.00,2018:11.50,2019:12.00,2020:13.50,2021:13.69,2022:14.49,2023:15.74,2024:16.28,2025:16.66,2026:17.13,2027:17.73};
function eraLerp(T,y){const ks=Object.keys(T).map(Number).sort((a,b)=>a-b);if(y<=ks[0])return T[ks[0]];if(y>=ks[ks.length-1])return T[ks[ks.length-1]];
  for(let i=1;i<ks.length;i++)if(y<=ks[i]){const a=ks[i-1],b=ks[i];return T[a]+(T[b]-T[a])*(y-a)/(b-a)}return T[ks[ks.length-1]]}
function eraMinWage(y){let w=ERA_MW[1980];for(const k in ERA_MW)if(+k<=y)w=ERA_MW[k];return w}
const eraCpiF=y=>y>=2026?1:Math.round(eraLerp(ERA_CPI,y)/ERA_CPI[2026]*1000)/1000;
const eraWageF=y=>y>=2026?1:Math.round(eraMinWage(y)/ERA_MW[2026]*1000)/1000;
const eraRentF=y=>y>=2026?1:Math.round((eraCpiF(y)+eraWageF(y))/2*1000)/1000;   // Hilltop rents: between prices and pay
// the year the money level was set: your own lease (S.eraY), or today while you live with your family
const eraAdultY=()=>{const s=eraS();return s&&s.eraY?s.eraY:eraStartYear()};
const eraGrowY=()=>typeof isGrow==='function'&&isGrow();
function eraPriceF(){if(!eraOld())return 1;return eraCpiF(eraGrowY()?yearNow():eraAdultY())}
function eraPayF(){if(!eraOld())return 1;return eraWageF(eraGrowY()?yearNow():eraAdultY())}
const eraAmt=(c,f)=>Math.round(c*(f==null?eraPriceF():f));
window.eraPriceF=eraPriceF;window.eraPayF=eraPayF;

// job pay and tips follow the start year's minimum wage (every job, the career ones and the Army too)
(function(){
  const seen=new Set();
  const fix=J=>{if(!J||seen.has(J))return;seen.add(J);
    const own=Object.getOwnPropertyDescriptor(J,'pay');if(own&&own.get)return;
    let pay=J.pay;const td=Object.getOwnPropertyDescriptor(J,'tips');let tips=td&&!td.get?td.value:null;
    const tg=td&&td.get?()=>td.get.call(J):()=>tips;   // 35-careers.js: the café's tips already follow the cost-of-living raises
    Object.defineProperty(J,'pay',{configurable:true,enumerable:true,get(){return eraOld()?Math.round(pay*eraPayF()):pay},set(v){pay=v}});
    if(td)Object.defineProperty(J,'tips',{configurable:true,enumerable:true,get(){const t=tg(),f=eraPayF();return f===1||!t?t:t.map(x=>Math.max(1,Math.round(x*f)))},set(v){tips=v}});
    Object.defineProperty(J,'pay0',{configurable:true,enumerable:false,get(){return pay}});};
  Object.getOwnPropertyNames(JOBS).forEach(k=>fix(JOBS[k]));
  if(typeof CAREER_JOBS!=='undefined')Object.values(CAREER_JOBS).forEach(fix);
})();
// Growing Up: allowance, chores and odd jobs are in the year's dollars too (prices already are, through rp())
let ERA_RAW=false;
{const mo=money;money=function(v){if(v>0&&eraOld()&&eraGrowY()&&!ERA_RAW)v=Math.round(v*eraPriceF()*100)/100;return mo(v)}}
// the GI Bill's monthly money: the Post-9/11 housing allowance from 2009; before that a smaller monthly GI Bill check
if(typeof MIL!=='undefined'){const m0=MIL.mha;Object.defineProperty(MIL,'mha',{configurable:true,enumerable:true,get(){if(!eraOld())return m0;
  return Math.round(m0*eraPriceF()*(typeof S!=='undefined'&&S&&S.prices?S.prices:1)*(eraHas('post911')?1:0.5)/10)*10},set(v){}})}

// ---- the start: the year on the save, the money in that year ----
{const ln=lifeNew;lifeNew=function(){const p=LIFE_PICK;ln.apply(this,arguments);
  try{if(!S.startYear)S.startYear=2026;
    if(eraOld()){const f=eraPriceF();S.money=Math.round(S.money*f);
      if(!isGrow()){S.eraY=S.startYear;if(S.rent)S.rent.amt=Math.round(S.rent.amt*eraRentF(S.eraY)/5)*5}
      lifeMoment('📅',`Started this life in ${S.startYear}.`)}}catch(e){console.error(e)}}}
// 18 in Growing Up: the first lease is in that year's dollars
{const lh=lifeHandoff;lifeHandoff=function(path,jk,next){
  if(!eraOld())return lh.apply(this,arguments);
  const y=yearNow();ERA_RAW=true;let r;try{r=lh.apply(this,arguments)}finally{ERA_RAW=false}
  try{S.eraY=y;if(S.rent)S.rent.amt=Math.round(S.rent.amt*eraRentF(y)/5)*5;
    if(S.life&&S.life.rentHelp)S.life.rentHelp=Math.round(S.life.rentHelp*eraPriceF()/10)*10;
    const mb=document.querySelector('#mbg .mb'),kv=mb&&[...mb.querySelectorAll('.kv')].find(x=>/Family/.test(x.textContent)&&/toward rent/.test(x.textContent));
    if(kv)kv.querySelector('b').textContent=`${$(S.life.rentHelp)} a month toward rent, for a year`}catch(e){console.error(e)}
  return r}}
// play again keeps the year
{const la=window.lifeAgain;window.lifeAgain=()=>{if(!S||!eraOld())return la();lifeStartWith({length:S.length,startAge:S.startAge,startYear:S.startYear,birthday:lifeRandBirthday()})}}

// ---- the New life sheet: the year chips (10-life.js lifeStartModal calls this) ----
function eraYearChips(p){
  const q=p.length==='quick',y=q?2026:(p.startYear||2026);
  const chips=ERA_YEARS.map(v=>`<button class="lchip${v===y?' on':''}" aria-pressed="${v===y}"${q&&v!==2026?' disabled':''} onclick="lifePick('startYear','${v}')">${v}</button>`).join('');
  const note=q?'Quick play is always 2026. Pick a longer game to start in another year.':
    {1980:'1980: K Street, the smelter smoke over Ruston, cash and checks, a pay phone on the corner. No Tacoma Dome yet.',
     1990:'1990: pagers, the new UW Tacoma, and the hard years on Hilltop. The Dome is a bus ride downtown.',
     2000:'2000: dial-up and the first cell phones, the Sonics, and no Link yet: downtown is a bus ride.',
     2010:'2010: the recession hanging on, smartphones, ORCA cards and the Link downtown.',
     2020:'2020: masks, school on a laptop at the kitchen table, and closed doors on MLK. The T Line up the hill is still being built.',
     2026:'Today: the game as it is now.'}[y];
  return `<div class="sect">Start year</div><div class="lchips">${chips}</div><p class="lnote">${note} Born in <b>${eraBornYear({startAge:p.startAge,startYear:y,birthday:p.birthday})}</b>.</p>`;
}
window.eraYearChips=eraYearChips;
// Game options: the year this life began
{const go=gameOptionsModal;gameOptionsModal=function(){go.apply(this,arguments);try{if(!S||!S.startYear)return;const p=document.querySelector('#mbg .mb p');
  if(p&&!p.querySelector('.era-yr'))p.insertAdjacentHTML('beforeend',` <span class="era-yr">📅 Started in ${S.startYear}${yearNow()!==S.startYear?`, now ${yearNow()}`:''}.</span>`)}catch(e){console.error(e)}};window.gameOptionsModal=gameOptionsModal}

// ---- places in the year they opened, and getting around ----
const ERA_PLACES={dt_dome:'dome',dt_glass:'museumGlass'};
function eraPlaceFix(map){if(!map)return;
  for(const k in ERA_PLACES){const p=map[k];if(!p||Object.getOwnPropertyDescriptor(p,'hidden')?.get)continue;let h=p.hidden;
    Object.defineProperty(p,'hidden',{configurable:true,enumerable:true,get(){return !!h||(eraOld()&&!eraHas(ERA_PLACES[k]))},set(v){h=v}})}
  const lk=map.link;if(lk&&!Object.getOwnPropertyDescriptor(lk,'name')?.get){const n0=lk.name;
    Object.defineProperty(lk,'name',{configurable:true,enumerable:true,get(){return eraOld()&&!eraHas('tline')?(eraHas('mlk')?'Bus stop: MLK & S 11th':'Bus stop: K Street & S 11th'):n0},set(v){}})}}
eraPlaceFix(typeof L_ADULT!=='undefined'?L_ADULT:L);if(typeof G_L!=='undefined')eraPlaceFix(G_L);
// downtown from Hilltop: the bus until the T Line comes up the hill in 2023 (the Link only ran downtown from 2003)
if(typeof HOODS!=='undefined'&&HOODS.downtown){const R=HOODS.downtown.ride,r0={via:R.via,mins:R.mins,fare:R.fare},bus=()=>eraOld()&&!eraHas('tline');
  Object.defineProperty(R,'via',{configurable:true,enumerable:true,get(){return bus()?'🚌 Bus':r0.via}});
  Object.defineProperty(R,'mins',{configurable:true,enumerable:true,get(){return bus()?16:r0.mins}});
  Object.defineProperty(R,'fare',{configurable:true,enumerable:true,get(){return bus()?2:r0.fare}})}
// 2020: the Stay Home order closes the pool, the library and the museums (Mar 23 to Jun 5)
const ERA_CLOSE=['peoples','library','dt_glass','dt_dome','pr_market','ru_zoo','reading','we_tcc'];
function eraClosed(d){if(!eraOld())return false;const o=dateOf(d);const t=o.y*10000+o.m*100+o.d;return t>=20200323&&t<20200605}
{const io=isOpen;isOpen=function(id,t){if(ERA_CLOSE.includes(id)&&eraClosed(Math.floor((t==null?S.t:t)/1440)))return false;return io.apply(this,arguments)}}
// Running Start only from 1992; paying rent by era
if(typeof GROW!=='undefined'&&GROW.actionsHere){const ga=GROW.actionsHere;GROW.actionsHere=function(){const a=ga.apply(this,arguments);
  return eraOld()&&!eraHas('runningStart')?a.filter(x=>!(x&&/Running Start/.test(x.l||''))):a}}
{const ah=actionsHere;actionsHere=function(){const a=ah.apply(this,arguments);
  try{if(eraOld()&&!isGrow()&&!eraHas('phoneBank')){const r=a.find(x=>x&&/^Pay rent/.test(x.l||''));
    if(r)r.s+=' '+(eraHas('onlineBank')?'By check, or online from the library computer.':eraHas('debit')?'By check, or cash from the ATM.':'By check in the landlord’s mail slot, or a money order from the market.')}}catch(e){}
  return a}}

// ---- names of the year in everything on screen (rules apply while yearNow() is before `until`) ----
const ERA_TEXT=[
  // the Hilltop T Line opened in September 2023: before that it's the bus on the hill (and before 2003 everywhere)
  {until:2023,re:/Hilltop Link: St Joseph/g,to:'Bus stop: MLK & S 11th'},
  {until:2023,re:/\bthe T Line streetcar\b/g,to:'the bus'},
  {until:2023,re:/\bThe T Line\b/g,to:'The bus'},{until:2023,re:/\bthe T Line\b/g,to:'the bus'},{until:2023,re:/\bT Line\b/g,to:'bus'},
  {until:2023,hill:true,re:/\bThe Link\b/g,to:'The bus'},{until:2023,hill:true,re:/\bthe Link\b/g,to:'the bus'},{until:2023,hill:true,re:/\b(a|A) Link\b/g,to:'$1 bus'},
  {until:2023,hill:true,re:/\bLink\b/g,to:'bus'},{until:2023,hill:true,re:/\bstreetcar\b/g,to:'bus'},{until:2023,re:/🚈 Link/g,to:'🚌 Bus'},
  {until:2022,re:/Rides are free under 18\./g,to:'A youth bus pass covers the rides.'},
  {until:2022,re:/\(free rides under 18\)/g,to:'(a youth bus pass)'},
  {until:2009,re:/Youth ORCA card/g,to:'youth bus pass'},{until:2009,re:/ORCA card/g,to:'bus pass'},{until:2009,re:/\bORCA\b/g,to:'bus pass'},
  // K Street became Martin Luther King Jr. Way in 1993
  {until:1993,re:/Martin Luther King Jr\.? Way/g,to:'K Street'},{until:1993,re:/MLK Jr\.? Way/g,to:'K Street'},{until:1993,re:/\bMLK\b/g,to:'K Street'},
  // the second Narrows Bridge opened in July 2007
  {until:2007,re:/Narrows Bridges/g,to:'Narrows Bridge'},{until:2007,re:/Two long suspension bridges side by side/g,to:'One long green suspension bridge'},
  {until:2007,re:/the two suspension bridges/g,to:'the suspension bridge'},
  // college and aid
  {until:1990,re:/UW Tacoma/g,to:'TCC and the UW'},
  {until:2019,re:/Washington College Grant/g,to:'State Need Grant'},
  {until:1984,re:/\bthe GI Bill\b/g,to:'the VEAP college fund'},{until:1984,re:/\bThe GI Bill\b/g,to:'The VEAP college fund'},{until:1984,re:/\bGI Bill\b/g,to:'VEAP'},
  {until:2009,re:/GI Bill housing allowance/g,to:'GI Bill monthly check'},{until:2009,re:/a housing allowance of about/g,to:'a monthly check of about'},
  // the first morning's year
  {until:9999,re:/, 2026, /g,to:()=>`, ${dateOf(0).y}, `},
];
const ERA_HILL=/\b(MLK|K Street|Hilltop|the hill|up the hill|on the hill|your door|St Joseph|the block)\b/;
function eraText(s){
  if(!s||typeof s!=='string'||!eraOld())return s;
  const y=yearNow(),hill=!eraHas('link')||ERA_HILL.test(s);
  for(const r of ERA_TEXT){if(y>=r.until)continue;if(r.hill&&!hill)continue;s=s.replace(r.re,r.to)}
  return s;
}
window.eraText=eraText;
// everything drawn on screen goes through eraText (not the guide or the title screen)
function eraFixNode(root){
  if(!eraOld()||!root)return;
  if(root.nodeType===3){const p=root.parentNode;if(!p||(p.closest&&p.closest('#tut,.title,script,style,textarea')))return;const v=root.nodeValue,w=eraText(v);if(w!==v)root.nodeValue=w;return}
  if(root.nodeType!==1||(root.closest&&root.closest('#tut,.title,script,style,textarea')))return;
  const tw=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;const all=[];while((n=tw.nextNode()))all.push(n);
  for(const t of all){const v=t.nodeValue,w=eraText(v);if(w!==v)t.nodeValue=w}
}
if(typeof MutationObserver!=='undefined'&&typeof document!=='undefined'){
  const mo=new MutationObserver(ms=>{if(!eraOld())return;try{for(const m of ms)for(const n of m.addedNodes)eraFixNode(n)}catch(e){console.error(e)}});
  const st=()=>mo.observe(document.body,{childList:true,subtree:true});
  if(document.body)st();else document.addEventListener('DOMContentLoaded',st);
}
window.eraFixNode=eraFixNode;

// ---- the city by year: news in the time-skip summary as the calendar passes each one (33-seasons.js CITY) ----
const ERA_NEWS=[
  {id:'era_dome',at:[1983,4,21],talk:'the new Tacoma Dome',t:'🏟️ The Tacoma Dome opens by the freeway: a giant wooden dome, one of the biggest in the world. Concerts and big shows are a bus ride downtown now.'},
  {id:'era_mgib',at:[1984,10,19],t:'🎖️ Congress passes a new GI Bill, named for Congressman Sonny Montgomery: college money for people who serve.'},
  {id:'era_smelter',at:[1985,3,25],talk:'the smelter closing',t:'🏭 The ASARCO copper smelter in Ruston shuts down for good after almost a hundred years. Hundreds of jobs are gone, and so is the smoke over the point.'},
  {id:'era_crack',at:[1988,9,1],talk:'what’s happening on the corners',t:'🚨 Hard news this year: crack and street gangs have reached Hilltop, and the corner by the market isn’t the same. Neighbors start meeting in church basements about taking the blocks back.'},
  {id:'era_watch',at:[1989,6,1],talk:'the block watch',t:'🔦 Neighbors on Hilltop start walking the blocks together at night, porch lights on, clipboards out. The police and the block club meet every month now.'},
  {id:'era_uwt',at:[1990,10,1],talk:'the new UW campus',t:'🎓 The University of Washington opens a Tacoma campus downtown, in borrowed rooms for now: a four-year degree without the long trip up I-5 to Seattle.'},
  {id:'era_rs',at:[1992,9,1],t:'📝 Running Start goes statewide: high school juniors and seniors can take college classes at TCC for free.'},
  {id:'era_stack',at:[1993,1,17],talk:'the smokestack coming down',t:'💥 The ASARCO smokestack in Ruston, 562 feet of brick, comes down in one blast on a Sunday morning. Half of Tacoma watches from the bluffs. The Tacoma Aroma is fading.'},
  {id:'era_mlk',at:[1993,1,18],talk:'the new street signs',t:'🪧 K Street has a new name: Martin Luther King Jr. Way. The church ladies on the block say it’s about time.'},
  {id:'era_hard',at:[1994,6,1],t:'🕯️ Another hard summer of news from the corners. The block club’s vigil on MLK fills two blocks with candles, and the youth program at People’s stays open late.'},
  {id:'era_debit',at:[1995,3,1],t:'💳 The bank on the corner hands out debit cards now: swipe at the store instead of writing a check.'},
  {id:'era_uwt2',at:[1997,9,1],t:'🧱 UW Tacoma moves into the old brick warehouses on Pacific Avenue, fixed up into classrooms.'},
  {id:'era_web',at:[1998,5,1],t:'🖥️ Your bank has a website now: check your balance online, at the library computer if you don’t have one.'},
  {id:'era_quake',at:[2001,2,28],talk:'the earthquake',t:'🌋 The Nisqually earthquake: 10:54 in the morning, about forty-five seconds of shaking. Bricks down on a few old buildings, cracks in the plaster, and everybody on the hill out on the sidewalk checking on everybody else.'},
  {id:'era_glass',at:[2002,7,6],talk:'the Museum of Glass',t:'🔮 The Museum of Glass opens on the Foss Waterway, with the Bridge of Glass over the freeway from downtown. The cone on top glows at night.'},
  {id:'era_link',at:[2003,8,22],talk:'the new Link',t:'🚈 The Link opens downtown: a free little light-rail line from the Theater District to the Tacoma Dome. From Hilltop it’s still the bus down the hill.'},
  {id:'era_narrows',at:[2007,7,15],talk:'the new bridge',t:'🌉 The second Tacoma Narrows Bridge opens beside the old one, with a toll on the way into town. Two bridges side by side now.'},
  {id:'era_sonics',at:[2008,7,2],talk:'the Sonics leaving',t:'🏀 The Sonics are leaving for Oklahoma City after 41 seasons. The kids on the courts at People’s wear the green and gold anyway.'},
  {id:'era_crash',at:[2008,10,1],talk:'the recession',t:'📉 The recession hits: layoffs at the port and the mills, For Lease signs on Pacific, and everybody on the block knows somebody looking for work.'},
  {id:'era_orca',at:[2009,4,20],talk:'the new ORCA cards',t:'💳 ORCA cards arrive: one card for the buses, the Link and the trains to Seattle. Tap on, tap off, no more paper transfers.'},
  {id:'era_911',at:[2009,8,1],t:'🎖️ The Post-9/11 GI Bill starts: tuition paid for veterans, and a monthly housing allowance while they’re in school.'},
  {id:'era_lemay',at:[2012,6,2],talk:'the car museum',t:'🚗 LeMay – America’s Car Museum opens next to the Tacoma Dome: four floors of cars, and a lawn out front for car shows.'},
  {id:'era_hawks',at:[2014,2,2],talk:'the Super Bowl',t:'🏈 The Seahawks win the Super Bowl. Horns honk all down MLK, and the blue-and-green flags stay up on porches for months.'},
  {id:'era_wcg',at:[2019,7,1],t:'🤝 The State Need Grant becomes the Washington College Grant, with free tuition at state schools for the lowest incomes.'},
  {id:'era_covid1',at:[2020,3,13],talk:'the schools closing',t:'😷 A new virus: the governor closes every school in the state. The next week, a Stay Home order. MLK goes quiet, and the corner market puts tape on the floor six feet apart.'},
  {id:'era_covid2',at:[2020,6,5],t:'😷 Pierce County opens back up a little: masks on, half the tables at the cafés, the pool still closed. Some of the shops on MLK never reopen.'},
  {id:'era_covid3',at:[2020,9,8],t:'💻 School starts on laptops at the kitchen table. The district hands out hotspots at Hilltop High, and the line goes around the block.'},
  {id:'era_covid4',at:[2021,4,5],t:'🏫 Kids go back to school buildings two days a week, masks on. Vaccines at the clinic on MLK.'},
  {id:'era_covid5',at:[2021,9,1],t:'🏫 Everybody back in school, all week. The hallway at Hilltop High has never been so loud.'},
  {id:'era_youth',at:[2022,9,1],t:'🚌 Rides are free for everyone 18 and under now, on every bus in the county.'},
  {id:'era_tline',at:[2023,9,16],talk:'the T Line on MLK',t:'🚋 The T Line comes up the hill: trains run up MLK from downtown to St. Joseph, with new stops a few blocks from your door. The Link has a new name, too.'},
];
// Washington's minimum wage, each January it changes (1981 to 2027)
for(const k in ERA_MW){const y=+k;if(y<1981||y>2027)continue;
  ERA_NEWS.push({id:'era_mw'+y,at:[y,1,1],t:`💵 ${y<1989?'The federal':'Washington’s'} minimum wage is $${ERA_MW[k].toFixed(2)} an hour this year.`})}
if(typeof CITY!=='undefined'){CITY.push(...ERA_NEWS);CITY.sort((a,b)=>(a.at[0]-b.at[0])||(a.at[1]-b.at[1])||(a.at[2]-b.at[2]))}

// ---- the everyday lines of each era: a played morning, now and then ----
const ERA_LINES=[
  [1980,1989,['📻 Somebody’s boombox on the corner is playing Prince, loud enough to hear from your window.','🎮 The kids down the block are saving quarters for the arcade.','📼 The video store on K Street has a waiting list for the new movie, and you’re on it.','☎️ A line at the pay phone outside the market: somebody is calling long distance and talking fast.','🗞️ The News Tribune lands on the step with a thump.','🛹 A kid on a skateboard says your sneakers are fresh. You take it.']],
  [1990,1999,['🎧 A Walkman, a mixtape and the bus window: Sir Mix-a-Lot, then TLC.','🏀 Every kid at People’s wants to dunk like Shawn Kemp.','📼 Friday night at the video store: the new releases wall is already picked over.','👕 Flannel everywhere. It’s Washington, and it’s the ’90s.','💽 The library has the internet now, on two computers, with a sign-up sheet.']],
  [2000,2009,['🎧 White earbuds on the bus: everybody has one of those little music players now.','💿 Somebody burns you a mix CD, with the songs written on it in marker.','📺 The whole barbershop argues about last night’s game.','📷 A neighbor gets the film from the drugstore and passes the prints around.']],
  [2010,2019,['🎵 “Thrift Shop” on every car stereo going up MLK.','🏈 Blue Friday: Seahawks jerseys at the bus stop, the café and the barbershop.','📸 Somebody takes a selfie with the mountain behind them.','☕ A new coffee place opens on the hill, with bare light bulbs and $5 toast.']],
  [2020,2025,['😷 A mask on the hook by the door, next to the keys.','📦 Delivery boxes stacked in the lobby, and somebody’s name on each one.','🎵 A dance from a phone video in the parking lot at People’s.','🏗️ Orange cones on MLK for the train work, all the way up the hill.']],
];
{const om=onMorning;onMorning=function(d){om.apply(this,arguments);
  try{if(!eraOld()||!lifeLong()||d===0)return;const y=yearNow();const set=ERA_LINES.find(x=>y>=x[0]&&y<=x[1]);if(!set)return;
    const h=wxHash('era'+d+':'+wxSalt());if(h>0.28)return;
    if(eraClosed(d)&&isGrow()&&isSchoolDay(d)){const l='💻 School is a laptop at the kitchen table today. Your teacher’s video keeps freezing on a funny face.';say(l);digestLine(l);return}
    const l=set[2][Math.floor(wxHash('eral'+d)*set[2].length)];say(l);digestLine(l)}catch(e){console.error(e)}}}
// the first morning: what year it is
{const ng=onNewGame;onNewGame=function(){ng.apply(this,arguments);
  try{if(!eraOld())return;const l={1980:'📅 It’s 1980. Ash from Mount St. Helens in May still turns up in the gutters, gas is over a dollar a gallon, and everybody on K Street pays cash.',
    1990:'📅 It’s 1990. The Goodwill Games just wrapped up in Seattle, the Sonics are getting good, and the news from the corners on Hilltop is hard.',
    2000:'📅 It’s 2000. Y2K came and went, the Sonics still play in Seattle, and the internet is a screeching modem at the library.',
    2010:'📅 It’s 2010. The recession is still hanging on, half the block has a smartphone, and the Link runs free downtown.',
    2020:'📅 It’s 2020. Masks on, school is on a laptop, and half the shops on MLK have a sign in the window about their hours.'}[S.startYear];
    if(l){say(l)}}catch(e){console.error(e)}}}

// ---- the guide: a Start year section in Game lengths and ages (26-help.js) ----
function eraGuideHTML(){
  const rows=Object.keys(ERA_LABELS).filter(k=>ERA_FEATURES[k]!=null).sort((a,b)=>ERA_FEATURES[a]-ERA_FEATURES[b]||a.localeCompare(b)).map(k=>[ERA_LABELS[k],String(ERA_FEATURES[k])]);
  const T=(h,r)=>typeof hTable==='function'?hTable(h,r):`<table>${r.map(x=>`<tr>${x.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</table>`;
  const money=ERA_YEARS.map(y=>[String(y),`${Math.round(eraCpiF(y)*100)}%`,`${$(Math.round(1150*eraRentF(y)/5)*5)}`,`$${eraMinWage(y).toFixed(2)}`]);
  return `<h3>Start year</h3>
    <p>On the 🌱 New life sheet, pick the year your life begins: <b>${ERA_YEARS.join(', ')}</b>. The sheet shows the year you were born: starting ages are still 12, 15 and 18, so a 1980 start at 12 was born in 1968 or before. Quick play and Growing Up’s first week are always 2026.</p>
    <ul><li>The calendar counts from your year, with the right weekdays, birthdays, seasons and sunsets, and keeps going past 2026.</li>
    <li>Things arrive in the year they did: a line in the city news in the summary between key weeks, then they’re part of the game. Nothing from a later year shows up early.</li>
    <li>Money starts at that year’s level, then prices rise every January, rents every August and pay with raises, the same as today’s game.</li>
    <li>Your save remembers its start year. Games saved before start years are 2026.</li></ul>
    ${T(['Start year','Prices (of 2026)','Rent on Hilltop','Minimum wage'],money)}
    <p>What exists when:</p>
    ${T(['What','From'],rows)}
    <ul><li>Before the T Line (2023), Hilltop is a bus town: downtown and the Dome are a bus ride, and before 1993 MLK is still K Street.</li>
    <li>College aid: the Pell Grant all along; the State Need Grant until 2019, then the Washington College Grant. After the Army: VEAP before 1984, the Montgomery GI Bill, then the Post-9/11 GI Bill from 2009.</li>
    <li>The news of each era: the smelter closing (1985), the hard years on Hilltop (late 1980s and 1990s), the Nisqually earthquake (2001), the Sonics leaving and the recession (2008), and the 2020 pandemic, with school at home and closed doors.</li></ul>`;
}
window.eraGuideHTML=eraGuideHTML;
if(typeof helpLengths==='function'){const hl=helpLengths;helpLengths=function(){return hl.apply(this,arguments)+eraGuideHTML()}}
