// ============================================================
//  TACOMPTON, Pierce County area pack: University Place (west of Tacoma, on the bluffs over Puget Sound).
//  Chambers Bay (the county's golf course and park on the old sand-and-gravel mine, opened June 23, 2007), the Pierce
//  County Library branch on Bridgeport Way, Curran Apple Orchard park (county parkland in the early 1990s, the city's after
//  University Place incorporated in 1995) and the Bridgeport Way shops (invented). Prefix up_. county:true (72-county.js
//  decides when the county is open to you; until then these places stay hidden). Opening dates are in ERA below.
//  Pizza & Pipes at 19th & Mildred (1974 to the fire of Aug 3, 1999) is a stop here too: its entry in 66-tacoma-places.js
//  has hood 'univplace', and Chambers Bay is listed there for the guide's timeline.
// ============================================================
(function(){
const KEY='univplace';
const HF=()=>(S.hoodFlags=S.hoodFlags||{});
const once=k=>!!HF()[`${KEY}_${k}_${day()}`], mark=k=>{HF()[`${KEY}_${k}_${day()}`]=true};
const meet=id=>{if(S.met[id])return false;S.met[id]=day()+1;S.stats.neighbors=metCount();adj('community',2);return true};
const nb=id=>NEIGHBORS.find(x=>x.id===id);
const tick=k=>{S.stats[k]=(S.stats[k]||0)+1};
const yr=()=>typeof yearNow==='function'?yearNow():2026;
const ymd=()=>{try{if(S&&S.startDate&&typeof dateOf==='function'){const o=dateOf(day());return o.y*10000+o.m*100+o.d}}catch(e){}return yr()*10000+803};
const mon=()=>{try{return S&&S.startDate&&typeof dateOf==='function'?dateOf(day()).m:8}catch(e){return 8}};
const gate=()=>{try{return typeof countyOn==='function'&&!!countyOn()}catch(e){return false}};
const sand=n=>n?'#3a3a32':'#d8c79a', grass=n=>n?'#1c2c22':'#7aa06e';

defHood({
  key:KEY, name:'University Place', ic:'⛳', county:true, startable:true,
  blurb:'A quiet city on the bluffs west of Tacoma: a golf course and park on an old gravel mine by the water, an apple orchard that became a park, and a long main street of shops.',
  hub:'up_bridgeport', ride:{via:'bus',mins:30,fare:2,drive:15},
  guide:'University Place is west of Tacoma, a bus ride down 19th Street. Chambers Bay is a golf course and big park on an old gravel mine by the water, with a walking loop and the trains along the shore (it opened in 2007). The library branch is free and open six days a week, and Curran Apple Orchard is a city park where anyone can walk among the old apple trees.',
  places:{
    up_bridgeport:{name:'Bridgeport Way shops',ic:'🛍️',desc:'The long main street of University Place: a grocery, a hardware store, a bakery and a pizza place in low buildings with big parking lots (the shops are invented)',
      hours:d=>[480,1260],
      art:({night:n})=>`${starsSky(n)}
        <rect y="132" width="480" height="18" fill="${HC.street(n)}"/><path d="M0 141 H480" stroke="${n?'#6a6a50':'#f1e08a'}" stroke-width="1.5" stroke-dasharray="14 10"/>
        ${[['GROCERY','#2f6b4a',20,150],['HARDWARE','#b8402a',182,110],['BAKERY','#c98a12',304,74],['PIZZA','#7a3b6e',390,78]].map(([t,c,x,w])=>`
          <rect x="${x}" y="80" width="${w}" height="52" fill="${n?'#2e3038':'#e9e0cf'}"/><rect x="${x-2}" y="76" width="${w+4}" height="6" fill="${n?'#22242a':'#8a8272'}"/>
          <rect x="${x+8}" y="86" width="${w-16}" height="12" rx="2" fill="${c}"/><text x="${x+w/2}" y="95" text-anchor="middle" font-size="8" ${SVGF} fill="#fff">${t}</text>
          <rect x="${x+8}" y="104" width="${w-40}" height="22" fill="${win(n)}"/><rect x="${x+w-26}" y="104" width="18" height="28" fill="${n?'#1a1a20':'#4a4a52'}"/>`).join('')}
        ${tree(10,n,12,132)}${tree(472,n,12,132)}${lamp(166,n,132)}${lamp(296,n,132)}
        ${person(70,n,'#2a6fa8',132,.9)}${person(250,n,'#c0392b',132,.9)}
        <rect x="120" y="128" width="40" height="12" rx="3" fill="${n?'#3a3f45':'#5d7f93'}"/><circle cx="128" cy="140" r="3" fill="#222"/><circle cx="152" cy="140" r="3" fill="#222"/>${n?'<circle cx="160" cy="133" r="2" fill="#fff6c8"/>':''}`},
    up_chambers:{name:'Chambers Bay',ic:'⛳',desc:'The county’s golf course and park on an old sand-and-gravel mine above Puget Sound: rolling sand-colored fairways, a lone fir on the course, a walking loop down to the beach and trains running along the shore',
      art:({night:n,dusk})=>`${starsSky(n)}
        <rect y="86" width="480" height="54" fill="${HC.bay(n)}"/>${dusk&&!n?'<rect y="86" width="480" height="12" fill="#f4b183" opacity=".35"/>':''}
        <path d="M0 92 Q100 78 200 88 T480 84 V92 H0 Z" fill="${HC.hill2(n)}" opacity=".8"/>
        <path d="M0 150 V112 Q60 96 130 108 Q200 120 250 104 Q320 86 400 104 Q440 112 480 108 V150 Z" fill="${sand(n)}"/>
        <path d="M0 150 V124 Q80 112 160 124 Q240 134 320 120 Q400 108 480 124 V150 Z" fill="${grass(n)}"/>
        <ellipse cx="300" cy="126" rx="30" ry="5" fill="${n?'#2a3a2a':'#9cc48a'}"/><path d="M304 126 V104" stroke="${n?'#888':'#eee'}" stroke-width="1.5"/><path d="M304 104 l10 3 l-10 3 z" fill="#c0392b"/>
        <rect x="378" y="80" width="4" height="26" fill="${HC.trunk(n)}"/><path d="M380 50 l-12 22 h7 l-10 14 h30 l-10 -14 h7 z" fill="${HC.leaf(n)}"/>
        <rect x="0" y="137" width="480" height="3" fill="${n?'#333':'#6a5a4a'}"/>
        <g><rect x="40" y="128" width="120" height="9" rx="2" fill="${n?'#4a5058':'#e8e2d4'}"/><rect x="40" y="128" width="120" height="3" fill="#2a6fa8"/>${[0,1,2,3,4].map(i=>`<rect x="${48+i*22}" y="131" width="14" height="4" fill="${win(n)}"/>`).join('')}</g>
        <path d="M200 146 Q260 140 330 146" stroke="${n?'#3a3c3a':'#cdc5b0'}" stroke-width="4" fill="none"/>
        ${person(230,n,'#2f8f6a',146,.8)}${person(246,n,'#c98a12',146,.8)}${n?'':`<circle cx="320" cy="122" r="1.5" fill="#fff"/>`}`},
    up_library:{name:'University Place library',ic:'📚',desc:'The Pierce County Library branch in University Place: free books, movies and music, a kids’ corner, study tables and quiet chairs by the windows',
      hours:d=>d%7===6?null:[600,1200],
      art:({night:n})=>`${starsSky(n)}
        <rect x="80" y="62" width="320" height="78" fill="${n?'#33363e':'#d9d2c2'}"/><path d="M70 64 L240 36 L410 64 Z" fill="${n?'#2a2e36':'#6b7a6a'}"/>
        ${[0,1,2,3,4,5].map(i=>`<rect x="${100+i*48}" y="76" width="32" height="40" fill="${win(n,i!==4)}"/>`).join('')}
        <rect x="216" y="104" width="48" height="36" fill="${n?'#1e2026':'#4a5048'}"/><rect x="190" y="66" width="100" height="12" rx="2" fill="${n?'#1c1c22':'#2f4a44'}"/><text x="240" y="75" text-anchor="middle" font-size="7.5" ${SVGF} fill="#f4e2a8">LIBRARY</text>
        ${n?'<rect x="100" y="76" width="272" height="40" fill="#f7d77a" opacity=".08"/>':''}
        ${tree(40,n,20,140)}${tree(440,n,22,140)}${lamp(196,n,146)}${person(150,n,'#7a3b6e',146,.9)}${person(330,n,'#2a6fa8',146,.9)}
        <rect y="140" width="480" height="10" fill="${HC.walk(n)}"/>`},
    up_orchard:{name:'Curran Apple Orchard',ic:'🍎',desc:'An old family apple orchard that became a city park: rows of gnarled trees, a meadow, a path around the edge and a few picnic tables. In the fall the apples are for whoever comes',
      art:({night:n})=>`${starsSky(n)}
        <rect y="104" width="480" height="46" fill="${grass(n)}"/>
        ${[0,1,2,3,4,5,6,7].map(i=>{const x=30+i*60,y=104+(i%2)*10;return `<path d="M${x} ${y+26} q-2 -14 0 -20 q-8 -6 -10 -12 M${x} ${y+12} q6 -4 10 -12" stroke="${HC.trunk(n)}" stroke-width="4" fill="none"/><circle cx="${x}" cy="${y-6}" r="18" fill="${HC.leaf(n)}"/><circle cx="${x-10}" cy="${y}" r="11" fill="${HC.leaf2(n)}"/>${[[-6,-10],[6,-4],[-12,2],[10,-12],[0,4]].map(([a,b])=>`<circle cx="${x+a}" cy="${y+b}" r="2.6" fill="${n?'#5a2a2a':'#d33a2c'}"/>`).join('')}`}).join('')}
        <path d="M0 146 Q120 138 240 144 T480 142" stroke="${n?'#3a3c3a':'#cdc5b0'}" stroke-width="5" fill="none"/>
        <rect x="380" y="132" width="40" height="4" fill="${n?'#3a2a22':'#8a6a4a'}"/><rect x="384" y="136" width="3" height="8" fill="${n?'#3a2a22':'#8a6a4a'}"/><rect x="412" y="136" width="3" height="8" fill="${n?'#3a2a22':'#8a6a4a'}"/>
        ${person(200,n,'#c0392b',146,.9)}${person(214,n,'#2f8f6a',146,.75)}`},
  },
  travel:{'up_bridgeport|up_library':5,'up_bridgeport|up_orchard':6,'up_bridgeport|up_chambers':10,'up_library|up_orchard':6,'up_library|up_chambers':12,'up_orchard|up_chambers':12},
  neighbors:[
    {id:'up_norm',n:'Norm',ic:'🧢',at:['up_chambers','up_bridgeport'],d:'Retired gravel truck driver who hauled sand out of the old pit by the water for twenty years. Now walks the loop above it every morning and tells strangers which hill used to be a hole.'},
    {id:'up_priya',n:'Priya',ic:'📚',at:['up_library'],d:'Children’s librarian with a cardigan for every season and a story-time voice that can quiet forty toddlers. Keeps a list of what every regular is reading and slips them the next one.'},
    {id:'up_walt',n:'Walt',ic:'🍎',at:['up_orchard'],d:'Volunteers with the orchard pruning crew and talks about the old apple trees like they’re his grandkids. Brings a thermos of cider to every work party and two extra cups.'},
  ],
  actions:(loc,d,m)=>{const a=[],at=(lo,hi)=>m>=lo&&m<hi;
    if(loc==='up_bridgeport'){
      const open=isOpen('up_bridgeport');
      if(!once('bakery')){const c=rp(6);a.push({ic:'🥐',l:`A cinnamon roll and coffee at the bakery — ${$(c)}`,s:open?(canAfford(c)?'25 min. Energy +8, stress −4. Once a day.':'Not enough cash.'):hoursTxt('up_bridgeport'),cat:'food',dis:!open||!canAfford(c),
        fn:()=>{spend(c);mark('bakery');pass(25);adj('energy',8);adj('stress',-4);tick('meals');say(pick(['🥐 A cinnamon roll the size of a saucer. A table of retirees by the window is solving the city council’s problems one at a time.','🥐 The baker slides you the last roll of the morning batch, still warm. Out the window, a long line of cars waits at the light on Bridgeport.']))}})}
      a.push({ic:'🛒',l:'Run errands up and down Bridgeport',s:open?`40 min. ${cap(calmTxt(4))}, community +1.`:hoursTxt('up_bridgeport'),cat:'here',dis:!open,
        fn:()=>{pass(40);calm(4);adj('community',1);const x=Math.random()<.4&&meet('up_norm');say('🛒 The hardware store for a hinge, the grocery for milk, a wave to the man at the bus stop.'+(x?` A man in a faded cap holds the door: <b>Norm</b>. ${nb('up_norm').d}`:''))}});
    }
    if(loc==='up_chambers'){
      a.push({ic:'🚶',l:'Walk the loop trail down to the water',s:`50 min. ${cap(calmTxt(10))}, energy −3.`,cat:'rest',
        fn:()=>{pass(50);calm(10);adj('energy',-3);tick('walks');const x=meet('up_norm');
          say(pick(['🚶 Down past the old concrete bins from the mine, a footbridge over the train tracks, and a long gray beach looking across at the islands.','🚶 The loop climbs and drops along the course. Golfers walk the sand-colored hills below you, and a long freight train rolls by on the shore.'])+(x?` A man in a faded cap falls into step: <b>Norm</b>. ${nb('up_norm').d}`:''))}});
      if(!once('sunset')){const ss=sunsetOn(d),ok=at(ss-50,ss+20);a.push({ic:'🌇',l:'Watch the sun go down over the Sound',s:ok?`Sunset ${fmt(ss)}. 45 min. Stress −16, community +1. Once a day.`:m<ss?`Sunset ${fmt(ss)}. Best from ${fmt(ss-50)}.`:`Sunset was ${fmt(ss)}.`,cat:'rest',cls:ok?'primary':'',dis:!ok,
        fn:()=>{mark('sunset');pass(45);adj('stress',-16);adj('community',1);tick('sunsets');say('🌇 The sun drops behind the Olympics and the water goes from silver to pink to ink. Down on the course the last golfers walk in with their bags on their backs.')}})}
      if(at(420,1140)){const c=rp(24);a.push({ic:'⛳',l:`Hit a bucket of balls at the range — ${$(c)}`,s:canAfford(c)?'40 min. Stress −8, energy −3.':'Not enough cash.',cat:'here',dis:!canAfford(c),
        fn:()=>{spend(c);pass(40);adj('stress',-8);adj('energy',-3);say(pick(['⛳ Most of them slice. One goes long and straight toward the water, and the man in the next stall says “there it is.”','⛳ You find a rhythm by the last ten balls. Your shoulders will have something to say tomorrow.']))}})}
    }
    if(loc==='up_library'){
      const open=isOpen('up_library');
      a.push({ic:'📖',l:'Read by the window',s:open?`45 min. ${cap(calmTxt(9))}. Free.`:'The library is closed now (10 AM to 8 PM, closed Sundays).',cat:'rest',dis:!open,
        fn:()=>{pass(45);calm(9);const x=meet('up_priya');say('📖 A soft chair, a stack of magazines and the hush of people turning pages.'+(x?` The children’s librarian hands a lost mitten back to a toddler and smiles at you: <b>Priya</b>. ${nb('up_priya').d}`:' Priya waves from the story-time rug.'))}});
      a.push({ic:'📝',l:'Study at a long table',s:open?'1 hour. Energy −3, stress −2. Free and quiet.':'The library is closed now.',cat:'here',dis:!open,
        fn:()=>{pass(60);adj('energy',-3);adj('stress',-2);say('📝 An hour of real work at a long table, under a sign that says <i>Quiet please</i>. Nobody bothers you. That’s the point.')}});
    }
    if(loc==='up_orchard'){
      a.push({ic:'🌳',l:'Walk the rows of old apple trees',s:`30 min. ${cap(calmTxt(8))}.`,cat:'rest',
        fn:()=>{pass(30);calm(8);tick('walks');const fall=mon()>=9&&mon()<=10,x=Math.random()<.5&&meet('up_walt');
          say((fall?'🍎 Apples everywhere: in the branches, in the grass, in a kid’s shirt held out like a basket. You pick one off a low branch. Tart and cold.':mon()>=4&&mon()<=5?'🌸 The whole orchard is in blossom, white and pink, and the bees are loud about it.':'🌳 Old crooked trees in neat rows, a meadow, a bench in the sun.')+(x?` A man with pruning shears and a thermos says hello: <b>Walt</b>. ${nb('up_walt').d}`:''))}});
      if(mon()>=9&&mon()<=10&&!once('apples'))a.push({ic:'🧺',l:'Pick a bag of apples to share',s:'40 min. Energy −3, community +3. Free in the fall.',cat:'people',
        fn:()=>{mark('apples');pass(40);adj('energy',-3);adj('community',3);say('🧺 A full bag of apples. On the way home you leave some with a neighbor, some at work, and keep the best ones.')}});
    }
    return a;
  },
});

// opening dates (YYYYMMDD) and the names of earlier years; places before they open are hidden
const ERA={up_chambers:{from:20070623},up_orchard:{from:19960101}};
for(const k of Object.keys(HOODS[KEY].places)){const p=L[k],e=ERA[k]||{};let h=!!p.hidden;
  Object.defineProperty(p,'hidden',{configurable:true,enumerable:true,get(){return h||!gate()||(!!e.from&&ymd()<e.from)},set(v){h=v}})}
HOODS[KEY].opens=Object.fromEntries(Object.entries(ERA).map(([k,e])=>[k,e.from]));

const upAt=(c,k)=>!isGrow()&&hoodOf(c.at)===KEY&&(!k||c.at===k);
defEvent({id:'up_train',hook:'arrive',tile:['🚆','A train along the shore','good'],chance:0.35,max:2,cooldown:3,cond:c=>upAt(c,'up_chambers')&&daytime(),
  run:()=>{say('🚆 A horn down on the shore: a long freight train curving along the water below Chambers Bay, under the footbridge, past the beach and the walkers.')},
  choices:()=>stopWatch({mins:10,calm:5,text:'🚆 A kid on the footbridge pumps his arm and the engineer blows the horn twice. Everybody on the bridge cheers like they won something.'}),dflt:1});
defEvent({id:'up_pruning',hook:'arrive',tile:['✂️','The orchard work party','good'],chance:0.4,max:2,cooldown:5,cond:c=>upAt(c,'up_orchard')&&daytime()&&[1,2,3,9,10].includes(mon()),
  run:()=>{say(mon()>=9?'🍎 The orchard volunteers are picking the high branches with long poles and filling crates for the food bank. “Grab a pole!” somebody calls.':'✂️ A pruning party in the orchard: a dozen volunteers with ladders and shears, opening up the old trees before spring. A man with a thermos waves you over.')},
  choices:()=>[
    {ic:'🙋',l:'Pitch in for an hour',s:'1 hour. Energy −6, stress −6, community +4.',fn:()=>{pass(60);adj('energy',-6);adj('stress',-6);adj('community',4);const x=meet('up_walt');say('🍎 You learn which branches to cut and which to leave, and why. Cider from a thermos at the end.'+(x?` The man with the thermos: <b>Walt</b>. ${nb('up_walt').d}`:''))}},
    {ic:'☕',l:'Stop and chat with the crew',s:'15 min. Stress −2, community +1.',fn:()=>{pass(15);adj('stress',-2);adj('community',1);say('🍎 They tell you the oldest tree here is older than the city. You believe them.')}},
    {ic:'🚶',l:'Walk on by',s:'Nothing changes.',fn:()=>{say('🍎 “Next time!” calls the man with the thermos.')}}],dflt:2});
defEvent({id:'up_lostball',hook:'arrive',tile:['⛳','A ball on the trail','info'],chance:0.25,max:1,cond:c=>upAt(c,'up_chambers')&&daytime(),
  run:()=>{say('⛳ A golf ball bounces off the path in front of you and rolls to your feet. Up on the hill, a golfer waves both arms in apology.')},
  choices:()=>[
    {ic:'🤾',l:'Toss it back up the hill',s:'5 min. Community +1.',fn:()=>{pass(5);adj('community',1);say('⛳ Not a bad throw. The golfer tips his cap. “Better than my shot!”')}},
    {ic:'👋',l:'Wave, and leave it by the path',s:'Nothing changes.',fn:()=>{say('⛳ You set it on a post where he’ll see it.')}}],dflt:1});
})();
