// ============================================================
//  TACOMPTON · CRIME EVENT ODDS BY NEIGHBORHOOD AND YEAR, from public crime data.
//
//  Sources (pulled Nov 2026, aggregated counts only: no addresses, blocks, dates or individual incidents are kept):
//   · Tacoma Open Data, "City of Tacoma Reported Crime" (Tacoma Police Department), 2018 to Nov 2026, counted by
//     Neighborhood Council District and NIBRS offense code.
//   · Pierce County Sheriff, "Crime Data – Past 12 Months" (Nov 2025 to Oct 2026), unincorporated Pierce County and the
//     contract cities, made per-capita with 2020 census populations and set against Tacoma's own rate per 1,000.
//
//  Classes: prowl = theft from a car, mvt = car theft, burg = burglary, rob = robbery / purse snatch / pickpocket,
//  agg = aggravated assault, shop = shoplifting, vand = vandalism, theft = other theft.
//
//  crimeOdds(kind, placeOrHood, year) → a multiplier for that crime class there and then:
//    area multiplier (Tacoma district vs the average district, or county city vs Tacoma per person)
//    × year trend (Tacoma's count that year vs 2026, the year the game's own odds were set for; before 2018 use 2018,
//      after 2026 use 2026; with no year given it reads yearNow() from 63-era.js if that exists, else no trend)
//    clamped to 0.25–2.5, so nowhere is crime-free and nowhere is overwhelming.
//  The eight Tacoma districts average 1.0 for every class, so the city as a whole plays as it did; Hilltop (Central)
//  is a bit under the average for most classes.
//
//  Applied to the existing crime-type events only (CRIME_EV below): street events use where you are right now
//  (the place you arrive at, or the busier end of a ride), events at home use where your home is. Each event's own
//  habits (the streetlight, nothing on the seats, the zipped pocket, the bike lock, sitting up front) still work on top.
//  In a calmer place each event's per-life limit is cut by the same multiplier too (crimeCap), so a long life there sees
//  fewer, not just later. window.CRIME_ODDS_OFF=true turns all of it off (for balance checks).
// ============================================================
const CRIME_ODDS={
  // Tacoma Neighborhood Council Districts, relative to the average district
  district:{
    'Central':     {prowl:0.70,mvt:0.79,burg:0.91,rob:0.89,agg:0.88,shop:1.60,vand:0.80,theft:0.86},
    'Eastside':    {prowl:0.67,mvt:0.91,burg:0.75,rob:0.97,agg:1.14,shop:0.58,vand:0.74,theft:0.75},
    'New Tacoma':  {prowl:1.99,mvt:1.43,burg:1.40,rob:1.32,agg:1.78,shop:0.27,vand:1.95,theft:1.15},
    'North East':  {prowl:0.21,mvt:0.26,burg:0.30,rob:0.09,agg:0.12,shop:0.03,vand:0.21,theft:0.24},
    'North End':   {prowl:0.79,mvt:0.62,burg:0.65,rob:0.47,agg:0.35,shop:0.56,vand:0.76,theft:0.71},
    'South End':   {prowl:1.26,mvt:1.66,burg:1.57,rob:1.97,agg:1.84,shop:1.32,vand:1.30,theft:1.50},
    'South Tacoma':{prowl:1.54,mvt:1.66,burg:1.70,rob:1.62,agg:1.46,shop:2.86,vand:1.48,theft:1.92},
    'West End':    {prowl:0.85,mvt:0.67,burg:0.72,rob:0.66,agg:0.43,shop:0.76,vand:0.77,theft:0.87},
  },
  // Pierce County Sheriff, past 12 months, per person, relative to Tacoma
  county:{
    'Puyallup':        {prowl:0.48,mvt:0.22,burg:0.58,rob:0.30,agg:0.15,shop:8.28,vand:0.27,theft:0.24},
    'University Place':{prowl:0.32,mvt:0.16,burg:0.31,rob:0.15,agg:0.09,shop:0.46,vand:0.32,theft:0.40},
    'Gig Harbor':      {prowl:0.23,mvt:0.10,burg:0.36,rob:0.00,agg:0.09,shop:4.85,vand:0.33,theft:0.24},
    'Bonney Lake':     {prowl:0.09,mvt:0.07,burg:0.33,rob:0.20,agg:0.14,shop:3.04,vand:0.15,theft:0.18},
    'Edgewood':        {prowl:0.19,mvt:0.24,burg:0.29,rob:0.05,agg:0.11,shop:0.27,vand:0.29,theft:0.38},
    'Eatonville':      {prowl:0.10,mvt:0.04,burg:0.07,rob:0.00,agg:0.19,shop:0.20,vand:0.11,theft:0.04},
    'Unincorporated':  {prowl:0.14,mvt:0.17,burg:0.30,rob:0.14,agg:0.16,shop:0.25,vand:0.21,theft:0.28},
  },
  // Tacoma, each year's count vs the 2018–2026 average (2026 counted to November, scaled to a full year). No shoplifting
  // trend: that class stays flat.
  trend:{
    2018:{prowl:1.05,mvt:0.59,burg:1.09,rob:1.08,agg:0.64,vand:1.00,theft:0.79},
    2019:{prowl:1.26,mvt:0.54,burg:1.03,rob:0.89,agg:0.74,vand:1.12,theft:0.81},
    2020:{prowl:1.10,mvt:0.70,burg:1.14,rob:0.90,agg:0.78,vand:1.00,theft:0.95},
    2021:{prowl:1.28,mvt:1.18,burg:1.29,rob:1.06,agg:1.26,vand:1.18,theft:1.00},
    2022:{prowl:1.26,mvt:1.86,burg:1.37,rob:1.56,agg:1.66,vand:1.32,theft:1.42},
    2023:{prowl:0.98,mvt:2.06,burg:0.91,rob:1.30,agg:1.25,vand:1.19,theft:1.23},
    2024:{prowl:0.97,mvt:1.01,burg:0.87,rob:0.85,agg:1.08,vand:0.94,theft:1.12},
    2025:{prowl:0.61,mvt:0.60,burg:0.70,rob:0.73,agg:0.84,vand:0.69,theft:0.92},
    2026:{prowl:0.47,mvt:0.46,burg:0.62,rob:0.64,agg:0.76,vand:0.56,theft:0.77},
  },
  // the game's places → the data's areas. Hilltop (no pack, hood null) is in the Central district. No pack place sits on
  // South Tacoma Way or at the Tacoma Mall, so 'South Tacoma' is in the table (crimeOdds('prowl','South Tacoma') works)
  // but no pack maps to it. Fern Hill (S 84th and Park Ave) and the Lincoln District (S 38th) are South End.
  // Sumner uses Bonney Lake (its pack's other half, the closest data); Orting uses Edgewood (a small valley town of about
  // the same size). Lakewood and Fife have their own police departments and are not in either source: they use the
  // Tacoma average (1.0 for every class).
  hood:{hilltop:'Central',stadium:'New Tacoma',downtown:'New Tacoma',proctor:'North End',oldtown:'North End',ruston:'North End',
    eastside:'Eastside',southend:'South End',fernhill:'South End',netacoma:'North East',westend:'West End',
    univplace:'University Place',up:'University Place',puyallup:'Puyallup',gigharbor:'Gig Harbor',sumner:'Bonney Lake',
    orting:'Edgewood',mountain:'Eatonville',parkland:'Unincorporated',jblm:'Unincorporated',lakewood:null,fife:null},
  min:0.25,max:2.5,base:2026,first:2018,last:2026,
};
// a place key, a pack key, a district or county name, or nothing (Hilltop) → the area's row (null: the Tacoma average)
function crimeArea(w){const D=CRIME_ODDS.district,C=CRIME_ODDS.county,M=CRIME_ODDS.hood;
  if(w==null||w===''||w==='hilltop')return D.Central;
  if(D[w])return D[w];if(C[w])return C[w];
  if(Object.prototype.hasOwnProperty.call(M,w)){const a=M[w];return a?(D[a]||C[a]):null}
  if(typeof L!=='undefined'&&L[w]){const h=L[w].hood;if(!h)return D.Central;return Object.prototype.hasOwnProperty.call(M,h)?(M[h]?(D[M[h]]||C[M[h]]):null):null}
  return null}
function crimeTrend(kind,y){const T=CRIME_ODDS.trend;if(y==null||!isFinite(y))return 1;
  const yy=Math.max(CRIME_ODDS.first,Math.min(CRIME_ODDS.last,Math.floor(y))),r=T[yy]&&T[yy][kind],b=T[CRIME_ODDS.base][kind];
  return r==null||!b?1:r/b}
function crimeOdds(kind,where,year){
  const a=crimeArea(where),m=a&&a[kind]!=null?a[kind]:1;
  let y=year;if(y==null){try{y=typeof yearNow==='function'?yearNow():null}catch(e){y=null}}
  const v=m*crimeTrend(kind,y);
  return Math.round(Math.max(CRIME_ODDS.min,Math.min(CRIME_ODDS.max,v))*1000)/1000}

// ---- the existing crime-type events: class, and whether it happens at home or out on the street ----
const CRIME_EV={
  lev_prowl:{k:'prowl',at:'home'},          // car prowlers on the block, overnight (36-life-events.js)
  lev_package:{k:'theft',at:'home'},        // the porch package
  lev_wallet:{k:'rob',at:'street'},         // the hand in your pocket on a crowded bus
  lev_phone:{k:'rob',at:'street'},          // the grab at the Link stop
  lev_g_bike:{k:'theft',at:'street'},       // the bike rack (Growing Up)
  cb_bike_borrowed:{k:'theft',at:'street'}, // the unlocked bike (69-life-community.js)
  hood_gunshots:{k:'agg',at:'home'},        // 61-hood-life.js: your block
  hood_jumped:{k:'rob',at:'home'},
  hood_gunpark:{k:'agg',at:'home'},
  hood_graffiti:{k:'vand',at:'home'},
  hood_driveby:{k:'agg',at:'home'},
  hood_friendshot:{k:'agg',at:'home'},
  hood_witness:{k:'agg',at:'home'},
  hood_carstolen:{k:'mvt',at:'home'},
  hood_carjack:{k:'rob',at:'home'},
};
// the multiplier for one of those events right now (1 for any other event, or a street event with no place in its context)
function crimeEvMul(id,ctx){
  const e=CRIME_EV[id];if(!e||(typeof window!=='undefined'&&window.CRIME_ODDS_OFF))return 1;
  try{
    if(e.at==='home')return crimeOdds(e.k,'home');
    const c=ctx||{},w=[c.at,c.from,c.to].filter(x=>x!=null&&x!=='');
    if(c.at!=null&&c.at!=='')return crimeOdds(e.k,c.at);
    if(!w.length)return 1;
    return Math.max(...w.map(x=>crimeOdds(e.k,x)));   // a ride: the busier end
  }catch(err){console.error(err);return 1}}
// wrap the plain chance of the defEvent-based ones (the hood and community events roll in their own files and ask crimeEvMul there)
for(const id of Object.keys(CRIME_EV)){const e=EV.find(x=>x.id===id);if(!e||/^hood_|^cb_/.test(id))continue;
  const f=e.chance;e.chance=ctx=>(typeof f==='function'?f(ctx):f)*crimeEvMul(id,ctx)}
// A long life fills each event's per-life limit (max) whatever the odds, so in a calmer place the limit is cut too:
// the event can happen at most round(max × multiplier) times in this life (rounded up or down by the save's own salt, never
// below 0, never above max; at 1 and up the limit stays as it is). No Math.random here, so seeded runs stay the same.
const crHash=s=>{let x=2166136261>>>0;for(let i=0;i<s.length;i++){x^=s.charCodeAt(i);x=Math.imul(x,16777619)>>>0}x^=x>>>13;x=Math.imul(x,0x5bd1e995)>>>0;x^=x>>>15;return (x>>>0)/4294967296};
function crimeSalt(){const c=S.crOdds||(S.crOdds={});if(c.salt==null){let r=0;try{const a=new Uint32Array(1);crypto.getRandomValues(a);r=a[0]}catch(e){r=Date.now()%4294967296}c.salt=r}return c.salt}
function crimeCap(id,ctx){const e=EV.find(x=>x.id===id),max=e&&isFinite(e.max)?e.max:99,k=crimeEvMul(id,ctx);
  if(k>=1||max>=99)return max;return Math.max(0,Math.min(max,Math.floor(max*k+crHash(`${crimeSalt()}|${id}`))))}
for(const id of Object.keys(CRIME_EV)){const e=EV.find(x=>x.id===id);if(!e)continue;const c=e.cond;
  e.cond=ctx=>{if(c&&!c(ctx))return false;if(!S||!S.ev||(S.ev.force||[]).includes(id))return true;
    try{return (S.ev.count[id]||0)<crimeCap(id,ctx)}catch(err){console.error(err);return true}}}
window.crimeCap=crimeCap;
window.crimeOdds=crimeOdds;window.crimeEvMul=crimeEvMul;window.CRIME_ODDS=CRIME_ODDS;window.CRIME_EV=CRIME_EV;

// ---- the guide: one plain line in the events chapter, the hard-times section of Growing Up, and the Pierce County chapter ----
const CRIME_GUIDE='How often thefts, break-ins and other crime happen in each neighborhood and town, and in each year, is based on public crime data from the Tacoma Police and the Pierce County Sheriff: a little more in some places, a lot less in others. Your own habits still count on top.';
window.CRIME_GUIDE=CRIME_GUIDE;
if(typeof helpGrowing==='function'){const hg=helpGrowing;helpGrowing=function(){const h=hg();try{
  return h.includes('<li>A life sees some of these')?h.replace('<li>A life sees some of these',`<li>${CRIME_GUIDE}</li><li>A life sees some of these`):h}catch(e){return h}}}
{const hc=helpChapters;helpChapters=function(...a){const ch=hc(...a);try{for(const c of ch)if(c&&(c[0]==='events'||c[0]==='county')&&typeof c[2]==='string'&&!c[2].includes(CRIME_GUIDE))c[2]+=`<p class="tut-small">${CRIME_GUIDE}</p>`}catch(e){console.error(e)}return ch}}
