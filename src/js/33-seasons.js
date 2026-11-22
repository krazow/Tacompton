// ============================================================
//  TACOMPTON · SEASONS: the weather, sunrise and sunset all year, and a neighborhood that changes over the years.
//  Longer games only (6 months, 1 year, 2 years, Lifetime). Quick play is unchanged: wxOf() is null there and no city news runs.
//
//  Weather: one roll a day, from the calendar date and the save's birthday (it never touches Math.random, so seeded runs stay
//  the same). Tacoma rain from October through spring, June gloom, dry summers with the odd wildfire-smoke day, a rare snow day
//  in winter (school closes) and, once a year, the first sunny day of spring.
//    wxOf(d=day())  → a WX key, or null in Quick play      wxNow() → WX[wxOf()] or null
//    sunriseOn(d)   → minutes after midnight (7:55 AM late December, 5:15 AM late June); sunsetOn(d) is 20-world.js's
//    SCENE_FX (05-ui.js): the rain, snow, smoke or wind overlay drawn over every place's art
//  The neighborhood: CITY, a dated timeline applied as the calendar passes it (time skips and the first morning of each key week):
//  city-news lines in the skip summary, rents up a few percent each August, and small changes to places, art and actions.
//    cityOn(flag)   → that change has happened in this save
// ============================================================

// ---- the weather ----
const WX={
  drizzle:{ic:'🌦️',n:'drizzle',wet:1,line:'🌦️ Drizzle: the fine Tacoma kind that doesn’t fall so much as hang around. Nobody on the hill owns an umbrella.',a:{},g:{}},
  rain:{ic:'🌧️',n:'rain',wet:2,line:'🌧️ Real rain, steady on the roof, the gutters on MLK running like creeks. The sunset tonight is a rumor.',a:{stress:2},g:{mood:-2}},
  gray:{ic:'☁️',n:'gray',line:'☁️ Gray: a lid of cloud from the Olympics to the Cascades, and the mountain is not out.',a:{},g:{}},
  breaks:{ic:'⛅',n:'sun breaks',good:1,line:'⛅ Sun breaks: twenty minutes of gold, then cloud, then gold again. Tacoma takes what it can get.',a:{stress:-2},g:{mood:2}},
  sun:{ic:'☀️',n:'sunny',good:1,line:'☀️ Blue sky from end to end, and the mountain is out.',a:{stress:-3},g:{mood:3}},
  wind:{ic:'💨',n:'windstorm',off:'💨 Windstorm: branches down in the parks. Outdoor plans can wait.',line:'💨 A windstorm in the night: branches down on the side streets, the power flickered twice and somebody’s recycling bin is three yards over.',a:{stress:4,energy:-3},g:{mood:-1,energy:-3}},
  snow:{ic:'❄️',n:'snow day',snow:1,line:'❄️ Snow! Two inches on Hilltop, which in Tacoma is a very big deal. The steep streets are sled runs and the buses are on chains.',a:{stress:2},g:{mood:8}},
  spring1:{ic:'🌷',n:'first sunny day of spring',good:1,line:'🌷 The first really sunny day of spring. Everybody is outside at once: porches, stoops, the courts at People’s, somebody’s speaker playing old soul on MLK.',a:{stress:-8,community:2},g:{mood:8,family:2}},
  smoke:{ic:'🌫️',n:'wildfire smoke',off:'🌫️ Wildfire smoke: the air app says stay in. Outdoor plans are off today.',line:'🌫️ Wildfire smoke drifting over the Cascades: an orange sun, a brown-gray sky and air you can taste. Windows shut, box fans on.',a:{stress:6,energy:-4},g:{mood:-4,energy:-4}},
};
// how likely each kind of day is, month by month (out of 100)
const WX_MONTH=[null,
  {rain:30,drizzle:28,gray:22,breaks:12,sun:4,wind:2,snow:2},   // Jan
  {rain:26,drizzle:28,gray:20,breaks:15,sun:6,wind:2,snow:3},   // Feb
  {rain:25,drizzle:28,gray:18,breaks:20,sun:9},                 // Mar
  {rain:18,drizzle:25,gray:17,breaks:25,sun:15},                // Apr
  {rain:10,drizzle:18,gray:20,breaks:27,sun:25},                // May
  {rain:6,drizzle:14,gray:25,breaks:25,sun:30},                 // Jun: June gloom
  {drizzle:4,gray:10,breaks:16,sun:64,smoke:6},                 // Jul
  {drizzle:5,gray:10,breaks:15,sun:60,smoke:10},                // Aug
  {rain:6,drizzle:10,gray:14,breaks:22,sun:42,smoke:6},         // Sep
  {rain:26,drizzle:26,gray:18,breaks:22,sun:6,wind:2},          // Oct
  {rain:36,drizzle:26,gray:20,breaks:12,sun:2,wind:4},          // Nov
  {rain:32,drizzle:26,gray:22,breaks:12,sun:3,wind:3,snow:2},   // Dec
];
// a number in [0, 1) from a string (FNV-1a)
function wxHash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0)/4294967296}
const wxSalt=()=>typeof S!=='undefined'&&S&&S.birthday?S.birthday.m*31+S.birthday.d:0;
function wxRaw(y,m,d){const u=wxHash(`${y}-${m}-${d}-${wxSalt()}`)*100,t=WX_MONTH[m];let c=0;for(const k in t){c+=t[k];if(u<c)return k}return 'gray'}
// the first sunny day of spring: the first sunny day from March 1, or April 15 if March and early April never clear up
const WX_SPRING={};
function wxSpring(y){const key=y+':'+wxSalt();if(WX_SPRING[key])return WX_SPRING[key];
  let r=[4,15];for(let t=Date.UTC(y,2,1);t<Date.UTC(y,3,15);t+=864e5){const o=new Date(t);if(wxRaw(y,o.getUTCMonth()+1,o.getUTCDate())==='sun'){r=[o.getUTCMonth()+1,o.getUTCDate()];break}}
  return (WX_SPRING[key]=r)}
function wxOf(d){
  if(typeof S==='undefined'||!S||!lifeLong())return null;
  if(d==null)d=day();
  if(S.wxSet&&S.wxSet[d])return S.wxSet[d];   // tests and debugging: S.wxSet[day] = a WX key
  if(isGrow()&&d===day()&&typeof gRain==='function'&&gRain())return 'rain';   // Growing Up's own rainy day in the first week
  const o=dateOf(d),sp=wxSpring(o.y);
  if(o.m===sp[0]&&o.d===sp[1])return 'spring1';
  const k=wxRaw(o.y,o.m,o.d);
  return d<14&&(k==='smoke'||k==='wind')?'sun':k;   // a gentle first two weeks
}
const wxNow=()=>{const k=wxOf();return k?WX[k]:null};
window.wxOf=wxOf;

// ---- sunrise all year (the sunset is sunsetOn in 20-world.js): about 7:55 AM in late December, 5:15 AM in late June ----
function sunriseOn(d){const o=dateOf(d),doy=dayIndexOf(o.y,o.m,o.d)-dayIndexOf(o.y,1,1);return Math.round(395-80*Math.sin(2*Math.PI*(doy-80)/365))}
// Growing Up's sunset: the calendar's in the longer games, the end of August in Quick play
const gSunsetOn=d=>lifeLong()?sunsetOn(d):G_SUNSET;
// the sky follows the calendar and the weather in the longer games (both modes' SCENE objects)
const WX_SKY={drizzle:[['#8d98a3','#c9cfd3'],['#4f5566','#9a8f8e']],rain:[['#7f8a95','#bcc3c9'],['#474d5c','#857c7e']],gray:[['#9aa4ad','#d3d8db'],['#555b6c','#a3968f']],
  wind:[['#7e8a96','#bfc6cc'],['#464c5c','#8a7f80']],snow:[['#b8c2cb','#e8ecef'],['#6a7084','#c9b7b4']],smoke:[['#a88a6a','#d9b98f'],['#7a4a3a','#c9824a']]};
[[SCENE,370,()=>sunsetNow()],[G_SCENE,385,()=>G_SUNSET]].forEach(([sc,rise0,set0])=>{
  const day0=sc.skyDay,dusk0=sc.skyDusk;
  Object.defineProperty(sc,'sun',{configurable:true,get(){if(!lifeLong())return [rise0,set0()];const d=day();return [sunriseOn(d),sunsetOn(d)]}});
  Object.defineProperty(sc,'skyDay',{configurable:true,get(){const k=wxOf();return k&&WX_SKY[k]?WX_SKY[k][0]:day0}});
  Object.defineProperty(sc,'skyDusk',{configurable:true,get(){const k=wxOf();return k&&WX_SKY[k]?WX_SKY[k][1]:dusk0}});
});

// ---- the weather over every place's art ----
SCENE_FX.push(({night:n})=>{
  const k=wxOf();if(!k)return '';
  const W=WX[k],out=[];
  if(['drizzle','rain','gray','wind','snow'].includes(k)){   // a cloud deck that hides the sun (and usually the mountain)
    const c=n?'#1b2330':k==='snow'?'#d5dbe0':'#a7afb6';
    out.push(`<rect width="480" height="30" fill="${c}" opacity="${n?.7:.92}"/>${[20,90,170,250,330,410,470].map((x,i)=>`<ellipse cx="${x}" cy="${30+(i%2)*4}" rx="48" ry="${12+(i%3)*3}" fill="${c}" opacity="${n?.6:.85}"/>`).join('')}`)}
  if(k==='rain'&&!(isGrow()&&typeof gRain==='function'&&gRain()))
    out.push(`<g stroke="${n?'#8fa3b8':'#e6eef3'}" stroke-width="1.3" opacity=".6">${Array.from({length:60},(_,i)=>{const x=(i*53)%490,y=(i*37)%160;return `<path d="M${x} ${y} l-5 13"/>`}).join('')}</g>`);
  if(k==='drizzle')out.push(`<g stroke="${n?'#8fa3b8':'#eef3f6'}" stroke-width="1" opacity=".45">${Array.from({length:44},(_,i)=>{const x=(i*61)%480,y=(i*29)%160;return `<path d="M${x} ${y} l-2 5"/>`}).join('')}</g>`);
  if(k==='snow')out.push(`<rect y="140" width="480" height="30" fill="#f4f7f9" opacity=".75"/><g fill="#fff" opacity=".9">${Array.from({length:56},(_,i)=>`<circle cx="${(i*47)%480}" cy="${(i*31)%165}" r="${1.2+(i%3)*.6}"/>`).join('')}</g>`);
  if(k==='smoke')out.push(`<rect width="480" height="170" fill="${n?'#3a2a20':'#b8865a'}" opacity="${n?.3:.32}"/><circle cx="110" cy="40" r="11" fill="#e0603a" opacity=".7"/>`);
  if(k==='wind')out.push(`<g stroke="${n?'#7d8a99':'#f2f5f7'}" stroke-width="1.4" fill="none" opacity=".55">${[[30,40],[160,70],[300,30],[90,110],[380,95],[240,125]].map(([x,y])=>`<path d="M${x} ${y} q40 -8 80 0 t70 -4"/>`).join('')}</g>${[[120,60],[260,90],[410,52],[60,130]].map(([x,y],i)=>`<ellipse cx="${x}" cy="${y}" rx="4" ry="2" transform="rotate(${30+i*40} ${x} ${y})" fill="${['#c98a12','#b8402a','#8a6b2a','#d3a03a'][i]}"/>`).join('')}`);
  return out.length?`<g class="wx-fx" data-wx="${k}">${out.join('')}</g>`:'';
});

// ---- a snow day closes school ----
{const isd=isSchoolDay;isSchoolDay=function(d){const r=isd(d);if(!r)return r;try{return wxOf(d==null?day():d)!=='snow'}catch(e){return r}}}
window.isSchoolDay=isSchoolDay;

// ---- the morning: the day's weather, and what it does to you ----
const wxFxTxt=fx=>Object.entries(fx).map(([k,v])=>`${cap(k)} ${v>0?'+':'−'}${Math.abs(v)}`).join(', ');
function wxMorning(d){
  const k=wxOf(d);if(!k)return;
  S.wxDone=S.wxDone||{};if(S.wxDone[d])return;S.wxDone[d]=k;
  for(const x in S.wxDone)if(+x<d-60)delete S.wxDone[x];
  const W=WX[k],fx=isGrow()?W.g:W.a;
  for(const s in fx)if(s in S&&typeof S[s]==='number')adj(s,fx[s]);
  let l=W.line;
  if(k==='snow'&&isGrow()&&schoolOn(dateOf(d)))l+=` ${gSchoolShort()} is closed: a snow day!`;
  else if(k==='snow'&&!isGrow())l+=' You get where you’re going, slowly.';
  if(k==='smoke'&&isGrow())l+=' Mom says nobody plays outside today.';
  const t=wxFxTxt(fx);
  l+=` <small>Sunrise ${fmt(sunriseOn(d))}, sunset ${fmt(sunsetOn(d))}.${t?` ${t}.`:''}</small>`;
  say(l);digestLine(l);
}
{const om=onMorning;onMorning=function(d){om(d);try{wxMorning(d)}catch(e){console.error(e)}}}

// ---- outdoor actions: weather tweaks, and some are off in heavy rain, windstorms and smoke ----
const WX_OUT_LOC=new Set(['view','ea_port','ne_point','ne_trail','pr_market','so_c','we_view','fh_garden','ot_dock','ot_hill','ru_park','ru_beach','st_castle']);
const WX_OUT_RE=/sunset|sun go|sun drop|watch|hoops|court|shoot|pickup|\bball\b|beach|picnic|kayak|garden|dock|trail|hike|\bwalk|stroll|bike|skate|mural|porch|bench|tide|lighthouse|\bdog\b|\bpark\b/i;
const WX_IN_RE=/wait a while|go to bed|go to work|go in|pay rent|call home|alarm|turn in|website|street fair|pool|swim|library|museum|reading room/i;
const WX_HEAVY_RE=/sunset|sun go|sun drop|watch|hoops|court|shoot|pickup|\bball\b|beach|picnic|kayak|garden|dock|lighthouse/i;   // off in heavy rain
const wxOutdoor=a=>!a._wx&&!['work','money','school'].includes(a.cat)&&!WX_IN_RE.test(a.l)&&(WX_OUT_LOC.has(S.loc)||WX_OUT_RE.test(a.l));
function wxTweak(k){const g=isGrow();
  if(k==='rain')return g?{energy:-3,mood:-2}:{energy:-3,stress:2};
  if(k==='drizzle')return {energy:-2};
  if(k==='snow')return g?{energy:-3,mood:2}:{energy:-3,stress:-2};
  if(WX[k].good)return g?{mood:2}:{stress:-2};
  return {}}
function wxActions(a){
  const k=wxOf();if(!k)return a;
  const W=WX[k],d=day();
  a=a.map(x=>{
    if(!x||!wxOutdoor(x))return x;
    if(W.off||(k==='rain'&&WX_HEAVY_RE.test(x.l)))return Object.assign({},x,{dis:true,cls:'',s:W.off||'🌧️ Too wet for that today. Try again on a drier day.'});
    const fx=wxTweak(k),t=wxFxTxt(fx);if(!t)return x;
    const f=x.fn;return Object.assign({},x,{s:`${x.s||''} · ${W.ic} ${t}`,fn:()=>{f();for(const s in fx)if(s in S&&typeof S[s]==='number')adj(s,fx[s])}});
  });
  S.wxDid=S.wxDid||{};const did=t=>S.wxDid[d+':'+t],mark=t=>{S.wxDid[d+':'+t]=true};
  const g=isGrow(),m=tod();
  if(k==='snow'&&['view','peoples','ru_park','st_park'].includes(S.loc)&&!did('sled')&&m<sunsetOn(d)+60)
    a.push({_wx:true,ic:'🛷',l:'Sled the hill on a flattened moving box',s:g?'45 min. Mood +10, energy −6. Once a day, while the snow lasts.':'45 min. Stress −10, energy −5, community +1. Once a day, while the snow lasts.',cat:g?'fun':'rest',
      fn:()=>{mark('sled');pass(45);if(g){adj('mood',10);adj('energy',-6)}else{adj('stress',-10);adj('energy',-5);adj('community',1)}
        say(pick(['🛷 Down the steepest block on Hilltop on a cardboard box, faster than is wise, into a snowbank and a crowd of cheering kids. Again. Again.','🛷 Somebody brought a real sled, somebody brought a cookie sheet, and an uncle in a church coat goes down on a trash-can lid to a standing ovation.']))}});
  if(k==='spring1'&&['home','mlk','peoples'].includes(S.loc)&&!did('spring')&&m>=600&&m<sunsetOn(d))
    a.push({_wx:true,ic:'🌷',l:g?'Everybody’s outside: join the block':'Sit out on the stoop with the whole block',s:g?'45 min. Mood +6, family +2. Today only.':'45 min. Stress −8, community +3. Today only.',cat:g?'fun':'people',cls:'primary',
      fn:()=>{mark('spring');pass(45);if(g){adj('mood',6);adj('family',2)}else{adj('stress',-8);adj('community',3)}
        say(pick(['🌷 Folding chairs on every porch, a grill going two houses down, kids drawing chalk hopscotch all the way to the corner. Ms. Lorraine says it the way she says it every year: “There it is.”','🌷 Jackets off for the first time since October. Somebody’s uncle brings out a speaker, somebody’s grandma brings out lemonade, and the whole street remembers what it looks like in the sun.']))}});
  return a;
}

// ---- the Here tab: a weather tag with sunrise and sunset ----
{const st=statusTags;statusTags=function(){const t=st()||[];try{const k=wxOf();if(k){const W=WX[k],d=day();
  t.unshift(`<span class="tag wx${W.off?' bad':''}">${W.ic} ${W.n} · ☀️ ${fmt(sunriseOn(d))} · 🌅 ${fmt(sunsetOn(d))}</span>`)}}catch(e){console.error(e)}return t}}

// ---- the time skip: a few words about the weather ----
function wxSkipNote(from,to){
  let wet=0,snow=0,smoke=0,sun=0,closed=0,n=0;
  for(let d=from;d<=to;d++){const k=wxOf(d);if(!k)return null;n++;
    if(WX[k].wet)wet++;if(k==='snow'){snow++;if(isGrow()&&schoolOn(dateOf(d)))closed++}if(k==='smoke')smoke++;if(WX[k].good)sun++}
  if(n<5)return null;
  const p=[];
  p.push(wet>n/2?`it rained on ${wet} of ${n} days (Tacoma, doing its thing)`:sun>n/2?`${sun} of ${n} days had sun`:`${wet} wet days and ${sun} with some sun`);
  if(snow)p.push(`${snow} snow day${snow===1?'':'s'}${closed?`, ${closed} with school closed`:''}`);
  if(smoke)p.push(`${smoke} smoky day${smoke===1?'':'s'} with the windows shut`);
  return `🌦️ The weather: ${p.join('; ')}.`;
}

// ---- the neighborhood over the years ----
// Each change has a date, a news line for the summary, and optional flags that change places, art and actions.
// Future public projects are told as plans: the T Line extension to Tacoma Community College follows Sound Transit's
// ST3 plan as updated in May 2026 (early design from 2027, six new stations along S 19th Street, opening forecast 2043).
const CITY=[
  {id:'mural1',at:[2026,10,15],f:'mural1',talk:'the new mural by the laundromat',t:'🎨 A new mural on the side of the laundromat on MLK: a grandmother in a church hat, a kid on a bike, and the mountain behind them. A crew of Hilltop High art students painted it over three weekends.'},
  {id:'link_plan',at:[2027,2,1],talk:'the T Line plans',t:'🚋 Sound Transit starts early planning and design to extend the T Line west from St. Joseph along S 19th Street to Tacoma Community College: about 3.5 miles and six new stations, one near China Lake Park. The plan says it opens in 2043, and they are looking for ways to speed it up.'},
  {id:'juniper_fence',at:[2027,4,10],talk:'the construction fences on MLK',t:'🏗️ Construction fences go up around the empty lot on MLK: a six-story apartment building, The Juniper, with some apartments set aside for lower incomes and a bakery planned for the ground floor. The block club wants to know where everyone will park.'},
  {id:'fair2',at:[2027,8,1],f:'fair2',talk:'the bigger street fair',t:'🎪 The Hilltop Street Fair grows: a second stage at the People’s end of MLK this year, and a whole block of food trucks.'},
  {id:'juniper_open',at:[2028,6,1],f:'juniper',talk:'The Juniper',t:'🏢 The Juniper opens on MLK: 120 new apartments, a bakery called Rise & Shine on the ground floor, and a lot of new faces at the Link stop. Dre says the barbershop has never been busier.'},
  {id:'teri_close',at:[2029,1,15],f:'teriClosed',talk:'the teriyaki spot closing',t:'🪧 The teriyaki spot on MLK closes after 22 years: the owners are retiring to be near their grandkids. Half the hill signs the thank-you card taped to the door.'},
  {id:'teri_new',at:[2029,6,1],f:'kusina',talk:'Kusina 253',t:'🍚 Kusina 253 opens where the teriyaki spot was: adobo, garlic rice, lumpia, and the same window counter for watching the Link go by. The new owners kept the old sign in the back hallway.'},
  {id:'mural2',at:[2030,5,1],f:'mural2',talk:'the mural at the overlook',t:'🖼️ The retaining wall at the overlook gets a mural: Rainier, the port cranes and HILLTOP REMEMBERS in tall letters, with the names of longtime neighbors painted small along the bottom.'},
  {id:'fair3',at:[2031,8,1],f:'fair3',talk:'the six-block street fair',t:'🎪 The street fair closes six blocks of MLK now, with a kids’ block, a gospel stage and a parade from People’s at noon.'},
  {id:'more_apts',at:[2032,9,1],talk:'the new buildings by the Link',t:'🏗️ Two more apartment buildings go up near the Link line on Hilltop. The block club pushes for a pocket park in between, and gets it.'},
  {id:'pocket_park',at:[2034,4,1],talk:'the pocket park',t:'🌳 The pocket park opens on 13th: a play structure, a little free library on a post, and a bench the block club painted green and gold.'},
  {id:'link_build',at:[2038,3,1],talk:'the construction on S 19th',t:'🚧 Construction crews start on the T Line extension along S 19th Street. Orange cones everywhere, and the plan still says 2043.'},
  {id:'link_open',at:[2043,9,1],f:'linkTCC',talk:'the T Line to TCC',t:'🚋 The T Line extension to Tacoma Community College opens: six new stations along S 19th, and a straight ride west from Hilltop. The first train is packed with people who waited a long time.'},
  {id:'fair4',at:[2046,8,1],talk:'the biggest fair yet',t:'🎪 The Hilltop Street Fair has its biggest year yet: ten blocks, three stages, and kids who came as babies now running the face-painting booth.'},
  {id:'barber2',at:[2052,3,1],talk:'the barbershop',t:'💈 The barbershop on MLK passes to the next generation. The chair by the window is still the chair by the window.'},
  {id:'market2',at:[2060,6,1],talk:'the corner market',t:'🧺 The corner market on MLK celebrates fifty years with free peaches for everyone who comes in. Same bell on the door.'},
  {id:'people2',at:[2068,5,1],talk:'People’s Center',t:'🏊 People’s Community Center reopens after a renovation: a new pool, the old murals restored, and a plaque for the neighbors who fought to build it.'},
];
const cityOn=f=>!!(typeof S!=='undefined'&&S&&S.city&&S.city.f&&S.city.f[f]);
window.cityOn=cityOn;
const cityState=()=>S.city||(S.city={done:{},f:{},rentF:1,rentAp:null,news:0,pend:[]});
const CITY_RENT_CAP=1.2;   // rents climb about 20% in all, then the city's tenant protections hold them (wages in the game don't grow)
const cityRentPct=y=>3+Math.floor(wxHash('rent'+y)*3);   // 3, 4 or 5 percent each August
const cityR5=v=>Math.round(v/5)*5;
// the city between the last catch-up and day `to`: news lines (pushed to out, or said), rent each August
function cityCatchUp(to,out){
  if(!S||!lifeLong())return;
  const C=cityState(),lines=[];
  const y0=dateOf(0).y,y1=dateOf(to).y;
  if(!isGrow()&&C.rentAp==null)C.rentAp=C.rentF;   // the first adult lease is what it is (at 18, or after graduation): raises count from there
  for(let y=Math.max(2027,y0);y<=y1;y++){const id='rent'+y;if(C.done[id]||dayIndexOf(y,8,1)>to||dayIndexOf(y,8,1)<=0)continue;
    C.done[id]=true;if(C.rentF>=CITY_RENT_CAP)continue;
    const p=cityRentPct(y);C.rentF=Math.min(CITY_RENT_CAP,C.rentF*(1+p/100));
    lines.push(isGrow()?`🏠 Your parents’ lease renews with rent up ${p}%. Dad does the math at the kitchen table twice. Rents are climbing all over Hilltop.`:`__rent${p}`);
    if(C.rentF>=CITY_RENT_CAP)lines.push('🏛️ After a winter of packed council meetings (the block club rented a bus), the city passes new tenant protections: yearly rent increases are capped from here on, with more notice and relocation help.')}
  for(const c of CITY){if(C.done[c.id])continue;const di=dayIndexOf(...c.at);if(di>to)continue;C.done[c.id]=true;if(c.f)C.f[c.f]=true;C.news++;C.talk=c.talk;if(di>=0)lines.push(c.t)}
  // adult rent follows the yearly raises (also after Growing Up's move-in, which starts a new lease)
  if(!isGrow()&&S.rent){
    const ap=C.rentAp;if(ap!==C.rentF){const was=S.rent.amt;S.rent.amt=cityR5(S.rent.amt*C.rentF/ap);C.rentAp=C.rentF;
    const i=lines.findIndex(l=>/^__rent/.test(l)),pct=Math.round((S.rent.amt/was-1)*100);
    const l=`🧾 Your lease renews: rent goes from ${$(was)} to ${$(S.rent.amt)} a month (+${pct}%). Rents keep climbing all over Hilltop.`;if(i>=0)lines[i]=l;else lines.push(l)}}
  const L1=lines.filter(l=>!/^__rent/.test(l));
  if(out)out.push(...L1);else L1.forEach(l=>{say(l);digestLine(l)});
}
window.cityCatchUp=cityCatchUp;
// a birthday: how the neighborhood has changed since you moved in
let CITY_SIM=false;
{const ls=lifeSimulate;lifeSimulate=function(...a){CITY_SIM=true;try{return ls(...a)}finally{CITY_SIM=false}}}
LIFE_HOOKS.birthday.push(age=>{
  if(!lifeLong())return;const C=cityState(),yrs=age-S.startAge;if(yrs<1)return;
  const pct=Math.round((C.rentF-1)*100);
  const l=`🏘️ ${yrs} year${yrs===1?'':'s'} on Hilltop.${pct>0?` Rents on the block are up ${pct}% since you moved in`:' The block is the block'}${C.talk?`, and everybody is still talking about ${C.talk}`:''}.`;
  if(CITY_SIM)C.pend.push(l);else{say(l);digestLine(l)}
});
LIFE_HOOKS.skip.push((from,to,ch,notes)=>{
  const C=cityState(),news=[];cityCatchUp(to,news);
  const w=wxSkipNote(from,to);if(w)notes.push(w);
  if(news.length)notes.push(...news.map(l=>`<b>City news</b> · ${l}`));
  if(C.pend.length){notes.push(...C.pend);C.pend=[]}
});
LIFE_HOOKS.weekStart.push(()=>cityCatchUp(day(),null));

// ---- places that change: descriptions and art ----
function cityDesc(base,key){
  let s=base;
  if(key==='mlk'){if(cityOn('kusina'))s=s.replace('the teriyaki spot','Kusina 253');else if(cityOn('teriClosed'))s=s.replace('the teriyaki spot','the empty teriyaki spot');
    const x=[];if(cityOn('mural1'))x.push('a new mural by the laundromat');if(cityOn('juniper'))x.push('The Juniper and its bakery');if(x.length)s+=`. New: ${x.join(', ')}`}
  if(key==='view'&&cityOn('mural2'))s+='. On the wall behind the bench: the HILLTOP REMEMBERS mural';
  if(key==='link'&&cityOn('linkTCC'))s=s.replace('The T Line stop on MLK','The T Line stop on MLK, with trains west along S 19th to TCC now');
  return s;
}
[[L_ADULT,'mlk'],[L_ADULT,'view'],[L_ADULT,'link'],[G_L,'mlk'],[G_L,'view']].forEach(([T,k])=>{const p=T[k];if(!p)return;const base=p.desc;
  Object.defineProperty(p,'desc',{configurable:true,enumerable:true,get(){return cityDesc(base,k)}})});
{const a0=L_ADULT.mlk.art;L_ADULT.mlk.art=o=>{let s=a0(o);const n=o&&o.night;
  if(cityOn('kusina'))s=s.replace('>TERIYAKI<','>KUSINA 253<');else if(cityOn('teriClosed'))s=s.replace('>TERIYAKI<','>FOR LEASE<');
  if(cityOn('juniper')){   // The Juniper's upper floors behind the shops
    const b=`<g class="juniper"><rect x="300" y="14" width="150" height="80" fill="${n?'#2c3440':'#b9a58e'}"/><rect x="296" y="10" width="158" height="6" fill="${n?'#1e252e':'#6a5a4a'}"/>${[0,1,2].map(r=>[0,1,2,3,4,5].map(c=>`<rect x="${308+c*24}" y="${22+r*16}" width="12" height="9" fill="${win(n,(r+c)%3!==1)}"/>`).join('')).join('')}<text x="375" y="9" text-anchor="middle" font-size="6" ${SVGF} fill="${n?'#7a7a7a':'#5a4a3a'}">THE JUNIPER</text></g>`;
    s=b+s}
  return s}}

// ---- actions that change with the neighborhood ----
function cityActions(a){
  if(!S.city)return a;
  const d=day(),m=tod(),g=isGrow();
  a=a.map(x=>{
    if(!x)return x;
    if(!g&&/teriyaki spot/.test(x.l)){
      if(cityOn('kusina')){const f=x.fn;return Object.assign({},x,{ic:'🍚',l:x.l.replace('the teriyaki spot','Kusina 253'),s:(x.s||'').replace('Chicken, rice, that sauce.','Adobo, garlic rice, lumpia.'),
        fn:()=>{const n=uiNarr.length;f();if(uiNarr.length>n){const t=pick(['🍚 Chicken adobo over garlic rice, two lumpia on the side. The owner’s auntie asks if you want more rice. You do.','🍚 You eat at the old window counter and watch the Link slide by. Same view, new smells, and the pancit is a revelation.']);uiNarr[uiNarr.length-1]=t;S.log[S.log.length-1].s=t}}})}
      if(cityOn('teriClosed'))return {ic:'🪧',l:'The teriyaki spot is closed',s:'A handwritten sign in the window: “22 years. Thank you, Hilltop.” Something new is coming.',cat:x.cat,dis:true,fn:()=>{}};
    }
    if(/Street Fair/.test(x.l)&&(cityOn('fair2')||cityOn('fair3')))return Object.assign({},x,{s:`${x.s||''} ${cityOn('fair3')?'Six blocks of MLK now, with a kids’ block and a gospel stage.':'This year: a second stage and a block of food trucks.'}`});
    return x;
  });
  if(cityOn('juniper')&&S.loc==='mlk'){S.wxDid=S.wxDid||{};const k=d+':bun';
    if(!S.wxDid[k]){const c=g?gRp(4):rp(5),open=m>=390&&m<840;
      a.push({ic:'🥐',l:`A morning bun at Rise & Shine — ${$(c)}`,s:open?(g?'15 min. Mood +3, energy +4. Once a day.':'15 min. Energy +5, stress −3. Once a day.'):'The bakery in The Juniper: 6:30 AM to 2 PM.',cat:g?'money':'food',dis:!open||S.money<c,
        fn:()=>{S.wxDid[k]=true;if(g)gSpend(c);else spend(c);pass(15);if(g){adj('mood',3);adj('energy',4)}else{adj('energy',5);adj('stress',-3)}
          say(pick(['🥐 A cardamom morning bun, still warm, in a paper bag that goes see-through with butter. The line is half new neighbors, half people who have lived here forever.','🥐 Rise & Shine has a chalkboard of who is having a birthday this week. Strangers sing to a toddler. You eat your bun on the bench out front.']))}})}}
  return a;
}
{const ah=actionsHere;actionsHere=function(){let a=ah();if(!lifeLong())return a;try{a=cityActions(a);a=wxActions(a)}catch(e){console.error(e)}return a}}
