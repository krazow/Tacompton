// ============================================================
//  TACOMPTON, Pierce County area pack: Lakewood (south of Tacoma, between the lakes and the base).
//  The shopping center on the old Villa Plaza site (Villa Plaza opened in 1957; the enclosed Lakewood Mall Sept 15, 1989;
//  closed and torn down in 2001; Lakewood Towne Center opened Aug 2, 2002), American Lake, Fort Steilacoom Park (the old
//  hospital farm, Waughop Lake) and the road to the base gate (Fort Lewis and McChord became Joint Base Lewis-McChord on
//  Feb 1, 2010). Shops are invented. Prefix lw_. county:true (72-county.js decides when the county is open to you).
//  The Sounder reaches Lakewood from October 2012 (the engine's countyRide).
// ============================================================
(function(){
const KEY='lakewood';
const HF=()=>(S.hoodFlags=S.hoodFlags||{});
const once=k=>!!HF()[`${KEY}_${k}_${day()}`], mark=k=>{HF()[`${KEY}_${k}_${day()}`]=true};
const meet=id=>{if(S.met[id])return false;S.met[id]=day()+1;S.stats.neighbors=metCount();adj('community',2);return true};
const nb=id=>NEIGHBORS.find(x=>x.id===id);
const tick=k=>{S.stats[k]=(S.stats[k]||0)+1};
const yr=()=>typeof yearNow==='function'?yearNow():2026;
const ymd=()=>{try{if(S&&S.startDate&&typeof dateOf==='function'){const o=dateOf(day());return o.y*10000+o.m*100+o.d}}catch(e){}return yr()*10000+803};
const mon=()=>{try{return S&&S.startDate&&typeof dateOf==='function'?dateOf(day()).m:8}catch(e){return 8}};
const sand=n=>n?'#3a3a32':'#d8c79a';
const gate=()=>{try{return typeof countyOn==='function'&&!!countyOn()}catch(e){return false}};
// the shopping center through the years
const mall=()=>{const t=ymd();return t<19890915?'plaza':t<20010101?'mall':t<20020802?'build':'towne'};
const MALL={plaza:{name:'Villa Plaza',sign:'VILLA PLAZA',desc:'One of the first shopping centers in the state, from 1957: low open-air storefronts around a huge parking lot, a department store, a dime store and a coffee shop'},
  mall:{name:'Lakewood Mall',sign:'LAKEWOOD MALL',desc:'The enclosed mall on the old Villa Plaza site: a food court, a movie theater, a fountain and long tiled halls where people walk laps before the stores open'},
  build:{name:'The old Lakewood Mall site',sign:'COMING SOON',desc:'The enclosed mall is closed and coming down. Behind the fences, a new open-air town center is going up, with a few stores open at the edge of the lot'},
  towne:{name:'Lakewood Towne Center',sign:'TOWNE CENTER',desc:'The open-air shopping center on the old Villa Plaza and Lakewood Mall site: big stores, a movie theater, restaurants, the city hall and a transit center'}};
const base=()=>ymd()<20100201?'Fort Lewis and McChord':'Joint Base Lewis-McChord';

defHood({
  key:KEY, name:'Lakewood', ic:'🏞️', county:true, startable:true,
  blurb:'A city of lakes and big trees just south of Tacoma: a big shopping center, a swimming beach on American Lake, a huge park on an old hospital farm, and the gates of the Army and Air Force base.',
  hub:'lw_towne', ride:{via:'bus',mins:35,fare:2,drive:15,sounder:2012},
  guide:'Lakewood is south of Tacoma, on the bus down South Tacoma Way (and from 2012 the Sounder train). The shopping center has stores, food and a movie theater; American Lake has a swimming beach in summer; Fort Steilacoom Park has a loop around Waughop Lake, a dog park and the old hospital barns. Farther south is the base, Joint Base Lewis-McChord (Fort Lewis and McChord before 2010).',
  places:{
    lw_towne:{name:'Lakewood Towne Center',ic:'🏬',desc:MALL.towne.desc,hours:d=>[600,1260],
      art:({night:n})=>{const k=mall(),sign=MALL[k].sign;return `${starsSky(n)}
        <rect y="128" width="480" height="22" fill="${HC.street(n)}"/>${[0,1,2,3,4,5,6,7].map(i=>`<path d="M${20+i*60} 132 v14" stroke="${n?'#555':'#eee'}" stroke-width="1.5"/>`).join('')}
        ${k==='mall'?`<rect x="40" y="58" width="400" height="70" fill="${n?'#33363e':'#d6cfc0'}"/><rect x="40" y="54" width="400" height="6" fill="${n?'#22242a':'#8a8272'}"/>
          <path d="M200 58 L240 34 L280 58 Z" fill="${n?'#3a5558':'#9cc4c8'}" opacity=".9"/><rect x="212" y="90" width="56" height="38" fill="${win(n)}"/>${[60,120,300,360].map(x=>`<rect x="${x}" y="94" width="40" height="20" fill="${win(n,x!==120)}"/>`).join('')}`
        :k==='build'?`<rect x="60" y="78" width="160" height="50" fill="${n?'#2e3038':'#c9c2b2'}"/><path d="M60 78 L90 100 L120 80 L150 104" stroke="${n?'#555':'#7a7266'}" stroke-width="2" fill="none"/>
          <rect x="300" y="30" width="4" height="98" fill="${n?'#4a3a2a':'#e0a020'}"/><rect x="250" y="30" width="120" height="4" fill="${n?'#4a3a2a':'#e0a020'}"/><path d="M350 34 V60" stroke="#555" stroke-width="1"/>
          ${[0,1,2,3,4,5,6,7,8,9].map(i=>`<rect x="${30+i*44}" y="116" width="3" height="12" fill="${n?'#666':'#999'}"/>`).join('')}<path d="M30 118 H440" stroke="${n?'#666':'#999'}" stroke-width="1"/>`
        :`${[[30,'#2f6b4a',90],[130,'#b8402a',120],[260,'#2a6fa8',90],[360,'#c98a12',90]].map(([x,c,w])=>`<rect x="${x}" y="${k==='plaza'?84:64}" width="${w}" height="${k==='plaza'?44:64}" fill="${n?'#2e3038':'#e9e0cf'}"/><rect x="${x}" y="${k==='plaza'?84:64}" width="${w}" height="6" fill="${c}"/><rect x="${x+8}" y="${k==='plaza'?98:92}" width="${w-16}" height="${k==='plaza'?20:26}" fill="${win(n)}"/>`).join('')}`}
        <rect x="160" y="${k==='mall'?62:k==='build'?60:k==='plaza'?60:40}" width="160" height="16" rx="3" fill="${n?'#1c1c22':'#2a1e18'}"/><text x="240" y="${(k==='mall'?62:k==='build'?60:k==='plaza'?60:40)+11.5}" text-anchor="middle" font-size="9" ${SVGF} fill="#f4e2a8">${sign}</text>
        ${tree(14,n,14,128)}${tree(468,n,14,128)}${lamp(226,n,128)}${person(110,n,'#c0392b',128,.85)}${person(390,n,'#2f8f6a',128,.85)}
        <rect x="60" y="134" width="40" height="12" rx="3" fill="${n?'#3a3f45':'#a84a3a'}"/><rect x="300" y="134" width="40" height="12" rx="3" fill="${n?'#3a3f45':'#5d7f93'}"/>`}},
    lw_lake:{name:'American Lake beach',ic:'🏖️',desc:'American Lake Park: a grassy hill down to a swimming beach, a long dock, a boat launch and the biggest lake in the county stretching off toward the base',
      art:({night:n,dusk})=>`${starsSky(n)}
        <path d="M0 80 Q120 70 240 78 T480 74 V96 H0 Z" fill="${HC.hill2(n)}"/>${tree(60,n,14,92)}${tree(140,n,12,90)}${tree(330,n,14,90)}${tree(420,n,12,92)}
        <rect y="92" width="480" height="40" fill="${HC.bay(n)}"/>${dusk&&!n?'<rect y="92" width="480" height="8" fill="#f4b183" opacity=".35"/>':''}
        <path d="M40 106 q20 -3 40 0 M220 118 q20 -3 40 0 M360 104 q20 -3 40 0" stroke="${HC.bay2(n)}" stroke-width="2" fill="none" opacity=".7"/>
        <rect x="300" y="110" width="140" height="5" fill="${n?'#3a2a22':'#9a7a5a'}"/>${[0,1,2,3,4].map(i=>`<rect x="${304+i*32}" y="115" width="3" height="10" fill="${n?'#3a2a22':'#7a5a3a'}"/>`).join('')}
        <path d="M0 150 V128 Q120 118 260 130 Q360 138 480 128 V150 Z" fill="${sand(n)}"/><path d="M0 150 V140 Q200 132 480 142 V150 Z" fill="${HC.hill(n)}"/>
        <path d="M120 122 q4 -2 8 0" stroke="${n?'#888':'#fff'}" stroke-width="1.5" fill="none"/>${person(124,n,'#c0392b',126,.6)}${person(200,n,'#2a6fa8',136,.85)}${person(232,n,'#c98a12',136,.75)}
        <rect x="160" y="128" width="18" height="2" fill="${n?'#555':'#f2b630'}"/><path d="M169 128 v-10" stroke="${n?'#555':'#eee'}" stroke-width="1.5"/><path d="M158 120 Q169 110 180 120 Z" fill="${n?'#4a3a4a':'#e74c3c'}"/>`},
    lw_fort:{name:'Fort Steilacoom Park',ic:'🌲',desc:'Lakewood’s biggest park, on the old Western State Hospital farm: a loop trail around Waughop Lake, tall poplars the patients planted, big red barns, ball fields and an off-leash dog park',
      art:({night:n})=>`${starsSky(n)}
        <rect y="96" width="480" height="54" fill="${n?'#1c2c22':'#8fb07a'}"/>
        ${[0,1,2,3,4,5,6,7,8].map(i=>`<ellipse cx="${20+i*20}" cy="70" rx="6" ry="30" fill="${HC.leaf(n)}"/><rect x="${19+i*20}" y="96" width="2" height="6" fill="${HC.trunk(n)}"/>`).join('')}
        <rect x="270" y="66" width="120" height="44" fill="${n?'#3a1e1a':'#a8352a'}"/><path d="M262 68 L300 42 L360 42 L398 68 Z" fill="${n?'#2a2224':'#5a3a34'}"/>
        <rect x="314" y="80" width="32" height="30" fill="${n?'#241614':'#f1e8d8'}"/><path d="M314 80 L346 110 M346 80 L314 110" stroke="${n?'#3a1e1a':'#a8352a'}" stroke-width="2"/>
        <rect x="284" y="74" width="14" height="10" fill="${win(n,false)}"/><rect x="362" y="74" width="14" height="10" fill="${win(n,false)}"/>
        <ellipse cx="140" cy="126" rx="110" ry="12" fill="${HC.bay(n)}"/><path d="M60 126 q20 -3 40 0 M170 128 q20 -3 40 0" stroke="${HC.bay2(n)}" stroke-width="1.5" fill="none"/>
        <path d="M0 144 Q120 136 240 142 T480 140" stroke="${n?'#3a3c3a':'#cdc5b0'}" stroke-width="5" fill="none"/>
        ${person(250,n,'#7a3b6e',146,.85)}<rect x="262" y="138" width="12" height="6" rx="3" fill="${n?'#555':'#8a5a3a'}"/>${person(420,n,'#2f8f6a',146,.85)}${tree(450,n,18,140)}`},
    lw_gate:{name:'The road to the base gate',ic:'🎖️',desc:'Where Lakewood meets Joint Base Lewis-McChord: I-5, the gate road, barbershops, uniform and tailor shops, pawn shops and a little lunch counter that knows every rank',
      art:({night:n})=>`${starsSky(n)}
        <rect y="120" width="480" height="30" fill="${HC.street(n)}"/><path d="M0 135 H480" stroke="${n?'#6a6a50':'#f1e08a'}" stroke-width="1.5" stroke-dasharray="14 10"/>
        ${[['BARBER','#2a6fa8',20],['TAILOR','#7a3b6e',110],['LUNCH','#b8402a',200]].map(([t,c,x])=>`<rect x="${x}" y="76" width="80" height="44" fill="${n?'#2e3038':'#e2d8c4'}"/><rect x="${x+8}" y="82" width="64" height="12" rx="2" fill="${c}"/><text x="${x+40}" y="91" text-anchor="middle" font-size="8" ${SVGF} fill="#fff">${t}</text><rect x="${x+8}" y="98" width="36" height="18" fill="${win(n)}"/><rect x="${x+52}" y="98" width="20" height="22" fill="${n?'#1a1a20':'#4a4a52'}"/>`).join('')}
        <rect x="320" y="70" width="140" height="50" fill="${n?'#2a2e2a':'#7a8a6a'}"/><rect x="350" y="94" width="80" height="26" fill="${n?'#1a1e1a':'#5a6a4a'}"/>
        <rect x="372" y="54" width="4" height="40" fill="${n?'#666':'#ccc'}"/><rect x="376" y="56" width="22" height="14" fill="${n?'#3a3f55':'#2a4a8a'}"/>${[0,1,2,3].map(i=>`<rect x="376" y="${56+i*3.5}" width="22" height="1.6" fill="#fff" opacity="${n?.3:.7}"/>`).join('')}
        <rect x="296" y="114" width="60" height="4" fill="${n?'#aa4':'#e0c020'}"/><rect x="296" y="114" width="6" height="6" fill="${n?'#aa4':'#e0c020'}"/>
        <rect x="140" y="124" width="44" height="12" rx="3" fill="${n?'#2a3a2a':'#5a6a3a'}"/><circle cx="148" cy="136" r="3" fill="#222"/><circle cx="176" cy="136" r="3" fill="#222"/>
        ${person(60,n,'#5a6a3a',120,.85)}${person(250,n,'#5a6a3a',120,.85)}${lamp(300,n,120)}`},
  },
  travel:{'lw_towne|lw_lake':10,'lw_towne|lw_fort':10,'lw_towne|lw_gate':12,'lw_lake|lw_fort':14,'lw_lake|lw_gate':8,'lw_fort|lw_gate':16},
  neighbors:[
    {id:'lw_dolores',n:'Dolores',ic:'👟',at:['lw_towne'],d:'Has walked laps at this shopping center since her kids were small, in every version of it, and has opinions about all of them. Wears matching tracksuits and greets every store clerk by name.'},
    {id:'lw_rufus',n:'Rufus',ic:'🎖️',at:['lw_lake','lw_gate'],d:'Retired Army first sergeant who came for one tour at the base and never left. Swims across the cove at American Lake every summer morning, rain or shine, and still says “roger that.”'},
    {id:'lw_june',n:'June',ic:'🐕',at:['lw_fort'],d:'Dog park regular with a three-legged rescue named Captain and a pocket full of treats for everyone else’s dogs too. Knows every dog’s name and almost none of the owners’.'},
  ],
  actions:(loc,d,m)=>{const a=[],at=(lo,hi)=>m>=lo&&m<hi,k=mall();
    if(loc==='lw_towne'){
      const open=isOpen('lw_towne')&&k!=='build';
      if(!once('lunch')){const c=rp(10);a.push({ic:'🍔',l:`${k==='mall'?'Lunch at the food court':k==='plaza'?'Lunch at the coffee shop counter':'Lunch at a restaurant on the square'} — ${$(c)}`,s:open?(canAfford(c)?'40 min. Energy +10, stress −4. Once a day.':'Not enough cash.'):(k==='build'?'The old mall is closed while it’s rebuilt.':hoursTxt('lw_towne')),cat:'food',dis:!open||!canAfford(c),
        fn:()=>{spend(c);mark('lunch');pass(40);adj('energy',10);adj('stress',-4);tick('meals');say(k==='mall'?'🍔 A tray of food-court lunch under the skylight, by the fountain full of pennies. A row of teenagers at the next table is very loud about nothing.':k==='plaza'?'🍔 A grilled cheese and a cup of soup at the counter. The waitress calls you “hon” and keeps the coffee coming.':'🍔 A burger on a patio facing the square. Families with shopping bags cut across to the movie theater.')}})}
      a.push({ic:'👟',l:k==='mall'?'Walk laps of the mall':'Walk the shopping center and window-shop',s:k==='build'?'30 min. Stress −2. You watch the cranes instead.':`35 min. ${cap(calmTxt(6))}.`,cat:'here',
        fn:()=>{pass(k==='build'?30:35);if(k==='build')adj('stress',-2);else calm(6);tick('walks');const x=k!=='build'&&meet('lw_dolores');
          say((k==='build'?'🏗️ Behind the chain-link, a crane swings a beam over where the mall used to be. A sign promises a whole new town center.':'👟 Store windows, a kid begging for a toy, and a long loop past every sale sign in Lakewood.')+(x?` A woman in a matching tracksuit passes you for the second time and finally says hi: <b>Dolores</b>. ${nb('lw_dolores').d}`:''))}});
      if(k!=='build'){const c=rp(11);a.push({ic:'🎬',l:`See a movie — ${$(c)}`,s:canAfford(c)?(at(720,1320)?'2 hours. Stress −12, energy −2.':'The shows run from noon to late.'):'Not enough cash.',cat:'rest',dis:!canAfford(c)||!at(720,1320),
        fn:()=>{spend(c);pass(120);adj('stress',-12);adj('energy',-2);say('🎬 Popcorn, cold air conditioning and two hours of somebody else’s problems on a huge screen. Perfect.')}})}
    }
    if(loc==='lw_lake'){
      const summer=mon()>=6&&mon()<=9,day_=at(600,1200);
      a.push({ic:'🏊',l:'Swim at the beach',s:summer&&day_?'45 min. Energy −4, stress −12.':summer?'The beach is for daytime swims (10 AM to 8 PM).':'Too cold to swim until summer.',cat:'rest',dis:!summer||!day_,
        fn:()=>{pass(45);adj('energy',-4);adj('stress',-12);tick('swims');const x=meet('lw_rufus');say('🏊 Cold for one breath, then perfect. You float on your back and look up at the tall firs around the lake.'+(x?` A gray-haired man swims by with a perfect stroke and nods: <b>Rufus</b>. ${nb('lw_rufus').d}`:''))}});
      a.push({ic:'🪑',l:'Sit at the end of the dock',s:`30 min. ${cap(calmTxt(9))}.`,cat:'rest',
        fn:()=>{pass(30);calm(9);say(pick(['🪑 Your feet over the water, a boat towing a tube full of shrieking kids, the trees on the far side going blue in the haze.','🪑 The water slaps the posts. A big gray plane drifts down toward the base, low and slow.']))}});
    }
    if(loc==='lw_fort'){
      a.push({ic:'🚶',l:'Walk the loop around Waughop Lake',s:`35 min. ${cap(calmTxt(9))}, energy −2.`,cat:'rest',
        fn:()=>{pass(35);calm(9);adj('energy',-2);tick('walks');say(pick(['🚶 About a mile around the lake, under the tall poplars, past ducks and a heron standing very still.','🚶 Joggers, strollers and a man walking a goat on a leash. Nobody here seems to think the goat is strange.']))}});
      a.push({ic:'🐕',l:'Watch the dogs at the off-leash park',s:'20 min. Stress −6, community +1.',cat:'people',
        fn:()=>{pass(20);adj('stress',-6);adj('community',1);const x=meet('lw_june');say('🐕 A herd of dogs running in a huge happy circle, one of them on three legs and winning.'+(x?` Its owner, shaking a treat bag: <b>June</b>. ${nb('lw_june').d}`:''))}});
      a.push({ic:'🏚️',l:'Read the signs at the old hospital barns',s:'20 min. Stress −3. A piece of history.',cat:'here',
        fn:()=>{pass(20);adj('stress',-3);say('🏚️ The signs tell it plainly: this was the farm of the state hospital, worked by the patients, who planted the poplars along the lake. A small cemetery nearby holds more than three thousand of them.')}});
    }
    if(loc==='lw_gate'){
      if(!once('lunch')){const c=rp(9);a.push({ic:'🍜',l:`Lunch at the counter by the gate — ${$(c)}`,s:canAfford(c)?(at(600,1200)?'35 min. Energy +10, stress −3. Once a day.':'The counter is open 10 AM to 8 PM.'):'Not enough cash.',cat:'food',dis:!canAfford(c)||!at(600,1200),
        fn:()=>{spend(c);mark('lunch');pass(35);adj('energy',10);adj('stress',-3);tick('meals');const x=Math.random()<.4&&meet('lw_rufus');say('🍜 A big bowl of noodle soup and rice, fast and hot. The tables are full of people in uniform on a short lunch.'+(x?` A gray-haired man at the counter says the soup is the best on the road: <b>Rufus</b>. ${nb('lw_rufus').d}`:''))}})}
      a.push({ic:'🎖️',l:'Watch the traffic going on base',s:'15 min. Stress −2.',cat:'here',
        fn:()=>{pass(15);adj('stress',-2);say(`🎖️ A line of cars at the gate of ${base()}, IDs out, and a convoy of tan trucks rolling past on the overpass. A whole city lives behind that fence.`)}});
    }
    return a;
  },
});

const P=HOODS[KEY].places;
for(const k of Object.keys(P)){const p=L[k];let h=!!p.hidden;
  Object.defineProperty(p,'hidden',{configurable:true,enumerable:true,get(){return h||!gate()},set(v){h=v}})}
Object.defineProperty(L.lw_towne,'name',{configurable:true,enumerable:true,get(){return MALL[mall()].name},set(){}});
Object.defineProperty(L.lw_towne,'desc',{configurable:true,enumerable:true,get(){return MALL[mall()].desc},set(){}});
{const d0=L.lw_gate.desc;Object.defineProperty(L.lw_gate,'desc',{configurable:true,enumerable:true,get(){return d0.replace('Joint Base Lewis-McChord',base())},set(){}})}
HOODS[KEY].opens={};HOODS[KEY].mallNow=mall;

const lwAt=(c,k)=>!isGrow()&&hoodOf(c.at)===KEY&&(!k||c.at===k);
defEvent({id:'lw_flyover',hook:'arrive',tile:['✈️','A cargo jet overhead','good'],chance:0.3,max:2,cooldown:3,cond:c=>lwAt(c)&&daytime(),
  run:()=>{say('✈️ A huge gray cargo jet comes in low over the trees toward McChord, so slow it looks like it’s hanging there. The windows on the street hum.')},
  choices:()=>stopWatch({mins:5,calm:3,text:'✈️ Everyone on the sidewalk looks up at once. A little kid salutes it, very seriously.'}),dflt:1});
defEvent({id:'lw_homecoming',hook:'arrive',tile:['🎈','A homecoming','good'],chance:0.25,max:1,cond:c=>lwAt(c,'lw_gate')&&daytime(),
  run:()=>{say('🎈 Families with balloons and hand-painted signs crowd the sidewalk: WELCOME HOME DADDY, WE MISSED YOU, a dog in a tiny camo vest. A unit is coming home today.')},
  choices:()=>[
    {ic:'👏',l:'Stay and cheer when the buses come',s:'40 min. Stress −8, community +3.',fn:()=>{pass(40);adj('stress',-8);adj('community',3);say('🎈 The buses pull in and the crowd breaks. A little girl runs so hard she loses a shoe. You clap until your hands sting.')}},
    {ic:'🪧',l:'Help a mom hold up her sign',s:'15 min. Energy −1, community +2.',fn:()=>{pass(15);adj('energy',-1);adj('community',2);say('🪧 She has a toddler on one hip and a sign in the other hand. You take one end. “Thank you,” she says, “my arms are shaking.”')}},
    {ic:'🚶',l:'Give the families room',s:'Nothing changes.',fn:()=>{say('🎈 You smile and walk on. Somebody’s whole world is about to step off a bus.')}}],dflt:2});
defEvent({id:'lw_lostdog',hook:'arrive',tile:['🐕','A dog off its leash','info'],chance:0.3,max:1,cond:c=>lwAt(c,'lw_fort')&&daytime(),
  run:()=>{say('🐕 A muddy dog without a collar tag bolts out of the trees and sits on your feet. Across the field someone is calling “Biscuit! BISCUIT!”')},
  choices:()=>[
    {ic:'🦮',l:'Walk Biscuit back across the field',s:'15 min. Energy −2, community +3.',fn:()=>{pass(15);adj('energy',-2);adj('community',3);const x=meet('lw_june');say('🐕 Biscuit comes along like this was the plan all along. His owner hugs him, mud and all.'+(x?` A woman with a three-legged dog cheers: <b>June</b>. ${nb('lw_june').d}`:''))}},
    {ic:'📣',l:'Shout and point',s:'2 min. Community +1.',fn:()=>{pass(2);adj('community',1);say('🐕 “Over here!” you call. Biscuit gets bored and trots home on his own.')}}],dflt:1});
})();
