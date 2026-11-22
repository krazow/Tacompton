// ============================================================
//  TACOMPTON, neighborhood pack: Ruston & Point Defiance.
//  The bus ride north to the tip of the peninsula: the park's old-growth forest and Five Mile Drive, Owen Beach and the
//  Point Defiance Zoo & Aquarium. Businesses and people here are invented; the park and the zoo are real public places.
// ============================================================
const RU_KEY='ruston';
const ruFlag=k=>{S.hoodFlags=S.hoodFlags||{};return `${RU_KEY}_${k}_${day()}`};
const ruDone=k=>!!(S.hoodFlags&&S.hoodFlags[ruFlag(k)]);
const ruSet=k=>{S.hoodFlags=S.hoodFlags||{};S.hoodFlags[ruFlag(k)]=true};
const ruMeet=id=>{if(S.met[id])return false;S.met[id]=day()+1;S.stats.neighbors=metCount();adj('community',2);return true};
// tall old-growth fir: a long trunk with a ragged crown
const ruFir=(x,n,h=110,b=146)=>`<rect x="${x-3}" y="${b-h}" width="6" height="${h}" fill="${n?'#2a1e16':'#5a402b'}"/>`+[0,1,2,3].map(i=>`<polygon points="${x-14+i*2},${b-h*.3-i*h*.2} ${x},${b-h*.62-i*h*.2-8} ${x+14-i*2},${b-h*.3-i*h*.2}" fill="${i%2?HC.leaf2(n):HC.leaf(n)}"/>`).join('');

defHood({
  key:RU_KEY,name:'Ruston & Point Defiance',ic:'🌲',
  blurb:'The bus runs out to the tip of the peninsula, where the city stops and the forest, the beach and the Olympics begin.',
  hub:'ru_park',ride:{via:'🚌 Bus',mins:28,fare:2},
  places:{
    ru_park:{name:'Point Defiance Park',ic:'🌲',desc:'Five Mile Drive winds through old-growth Douglas fir, with trails, picnic lawns and a lot of very quiet shade',
      art:({night:n})=>`${starsSky(n)}<rect y="0" width="480" height="146" fill="${n?'#0e1f1a':'#a8cdb2'}" opacity="${n?.55:.35}"/>
        ${[30,92,150,330,392,452].map((x,i)=>ruFir(x,n,118-i%3*14)).join('')}
        <path d="M0 146 Q150 128 300 138 T480 130 V150 H0 Z" fill="${n?'#1d2f25':'#6c9a72'}"/>
        <path d="M170 150 Q210 132 250 124 Q300 112 360 118 L370 122 Q310 122 270 134 Q235 144 230 150 Z" fill="${HC.street(n)}"/>
        <path d="M262 132 Q300 124 345 124" stroke="${n?'#d9c84a':'#f2d04a'}" stroke-width="1.2" stroke-dasharray="6 5" fill="none" opacity=".8"/>
        <rect x="190" y="82" width="104" height="22" rx="3" fill="#4a3226"/><text x="242" y="96" text-anchor="middle" font-size="8" ${SVGF} fill="#f4d27a">FIVE MILE DRIVE</text>
        <rect x="236" y="104" width="4" height="30" fill="#4a3226"/><rect x="170" y="123" width="3" height="10" fill="#4a3226"/>
        ${person(120,n,'#2f8f6a',146,.9)}${person(134,n,'#c98a12',146,.8)}${n?'':bird(300,34)}${lamp(430,n,150)}`},
    ru_beach:{name:'Owen Beach',ic:'🏖️',desc:'A long pebbly beach strewn with silver driftwood, looking across the water to Vashon Island and the Olympics',
      art:({night:n,dusk})=>`${starsSky(n)}
        <path d="M250 98 L290 78 L322 90 L356 66 L398 84 L430 72 L480 90 V100 H250 Z" fill="${HC.mtn(n)}"/><path d="M356 66 l-7 10 l7 -2 l6 5 z M430 72 l-6 8 l6 -2 l5 4 z" fill="#fff" opacity="${HC.snow(n)}"/>
        <path d="M0 96 Q40 86 80 90 T170 94 V102 H0 Z" fill="${HC.hill(n)}"/>
        <rect y="98" width="480" height="38" fill="${HC.bay(n)}"/>${dusk&&!n?'<rect y="98" width="480" height="10" fill="#f4b183" opacity=".35"/>':''}
        <path d="M60 112 q24 -4 48 0 M190 120 q24 -4 48 0 M320 110 q24 -4 48 0 M400 124 q24 -4 48 0" stroke="${HC.bay2(n)}" stroke-width="2" fill="none" opacity=".7"/>
        <path d="M0 132 Q120 124 240 130 T480 128 V150 H0 Z" fill="${n?'#4a4640':'#cbbf9e'}"/><path d="M0 140 Q120 134 240 139 T480 138 V150 H0 Z" fill="${n?'#3a3732':'#b3a784'}"/>
        <path d="M40 140 l70 -8 l4 4 l-72 10 z" fill="${n?'#7c7a74':'#d8d4c8'}"/><path d="M300 144 l90 -10 l4 5 l-92 12 z" fill="${n?'#6e6c66':'#cfc9b9'}"/><path d="M118 136 l-18 -14 M110 134 l-6 -12" stroke="${n?'#6e6c66':'#cfc9b9'}" stroke-width="2.5"/>
        <text x="160" y="92" text-anchor="middle" font-size="7" ${SVGF} fill="${n?'#7a8a8a':'#3d6a5a'}" opacity=".9">VASHON</text>
        ${n?[60,110,150].map((x,i)=>`<circle cx="${x}" cy="${100+i*2}" r="1.2" fill="#f7d77a"/>`).join(''):bird(200,40)+bird(224,32)}
        ${person(230,n,'#c0392b',148,.9)}${tree(448,n,20,134)}${tree(24,n,18,132)}`},
    ru_zoo:{name:'Point Defiance Zoo & Aquarium',ic:'🐺',desc:'Zoo and aquarium in the park: the Pacific Seas aquarium, red wolves, and paths shaded by big old trees',hours:()=>[570,1020],
      art:({night:n})=>`${starsSky(n)}${ruFir(28,n,100)}${ruFir(452,n,104)}${ruFir(412,n,86)}
        <rect x="90" y="60" width="300" height="80" fill="${n?'#33424a':'#e6dfc8'}"/><rect x="84" y="54" width="312" height="8" fill="${n?'#22303a':'#2a6f7a'}"/>
        <rect x="120" y="22" width="240" height="30" rx="5" fill="${n?'#14323a':'#1f5f6a'}"/><text x="240" y="35" text-anchor="middle" font-size="9" ${SVGF} fill="#f4f1e0">POINT DEFIANCE</text><text x="240" y="47" text-anchor="middle" font-size="8" ${SVGF} fill="#9fe0d8">ZOO &amp; AQUARIUM</text>
        <rect x="108" y="78" width="96" height="48" rx="4" fill="${n?'#12303e':'#3a9ab0'}"/><path d="M118 100 q10 -8 22 0 q-10 8 -22 0 z M160 90 q8 -6 18 0 q-8 6 -18 0 z M150 112 q9 -6 20 0 q-9 6 -20 0 z" fill="${n?'#4a7a8a':'#f2b630'}" opacity=".9"/>
        <rect x="276" y="78" width="96" height="48" rx="4" fill="${win(n)}"/><g fill="${n?'#2a2a2a':'#a0522d'}"><path d="M308 96 l5 -12 l6 8 h10 l6 -8 l5 12 l-3 14 q-13 12 -26 0 z"/></g><circle cx="318" cy="103" r="1.4" fill="#222"/><circle cx="332" cy="103" r="1.4" fill="#222"/><path d="M322 108 l3 4 l3 -4 z" fill="#222"/>
        <rect x="222" y="84" width="36" height="56" fill="${n?'#1a1410':'#4a3226'}"/>
        ${person(190,n,'#8e44ad',146,.9)}${person(300,n,'#2a6fa8',146,.9)}${person(316,n,'#f2b630',146,.6)}${lamp(40,n,150)}`},
  },
  travel:{'ru_park|ru_beach':12,'ru_park|ru_zoo':6,'ru_beach|ru_zoo':11},
  neighbors:[
    {id:'ru_wren',n:'Wren',ic:'🌲',at:['ru_park','ru_zoo'],d:'A volunteer trail steward in a green vest who knows which Douglas firs are over four hundred years old and has opinions about people who leave the path. Carries a pocket guide to the forest and a spare granola bar.'},
    {id:'ru_otis',n:'Otis & Biscuit',ic:'🐕',at:['ru_beach','ru_park'],d:'A retired bus driver and his very large, very slow greyhound, who walk the beach every morning at the same time. Otis can tell you the tide, the weather and the name of every dog on the shore, and Biscuit has never once been in a hurry.'},
  ],
  actions:(loc,d,m)=>{const a=[],at=(lo,hi)=>m>=lo&&m<hi;
    if(loc==='ru_park'){
      a.push({ic:'🌲',l:'Walk the old-growth trail',s:`50 min. ${cap(calmTxt(14))}, energy −5. Huge trees, soft needles, hardly any sound.`,cat:'rest',
        fn:()=>{pass(50);S.stats.walks++;calm(14);adj('energy',-5);say(pick(['🌲 The trees are older than the city, older than the state. Your voice drops to a whisper without you deciding it. Moss, ferns, a shaft of light, and a woodpecker somewhere above you.','🌲 A fallen giant lies across the trail with a tunnel cut through it. You walk through and feel very small, in a good way.','🌲 The path is springy with needles. Ten minutes in, you forget your phone exists.']))}});
      a.push({ic:'🚲',l:'Walk or bike Five Mile Drive',s:`1 hour 15 min. ${cap(calmTxt(12))}, energy −9. The loop through the park, with viewpoints.`,cat:'here',
        fn:()=>{pass(75);S.stats.walks++;calm(12);adj('energy',-9);say(pick(['🚲 Five Mile Drive curls through the forest with a bike lane and a hundred green shades. At a pullout the water opens up: the Narrows, the bridges, a long blue shimmer.','🚲 Joggers, strollers, a man on a unicycle who nods at you like a colleague. The loop takes longer than you planned, and you do not mind.']))}});
      const c=rp(6);
      a.push({ic:'🍦',l:`An ice cream cone from the park cart — ${$(c)}`,s:at(660,1080)?'15 min. Energy +7, stress −3.':'The cart runs 11 AM to 6 PM.',cat:'food',dis:!at(660,1080)||!canAfford(c),
        fn:()=>{spend(c);pass(15);adj('energy',7);adj('stress',-3);say('🍦 Huckleberry, in a waffle cone, eaten on a log while a squirrel makes a very serious case for sharing.')}});
      if(!ruDone('chat')) a.push({ic:'🧭',l:'Ask the trail steward about the forest',s:'30 min. You might meet someone (community +2), or catch up (+1). Once a day.',cat:'people',
        fn:()=>{ruSet('chat');pass(30);if(ruMeet('ru_wren'))say('🧭 A woman in a green vest points her pocket guide at a trunk the width of a bus. This is <b>Wren</b>, the park’s volunteer steward. She shows you the lichen, the owl pellets and the tree she calls “the Grandmother.” “Stay on the path,” she says, “and she’ll be here for four hundred more years.”');else{adj('community',1);say('🧭 Wren checks the trail map with you and tells you where the best quiet is this afternoon. She’s right.')}}});
    }
    if(loc==='ru_beach'){
      a.push({ic:'🪵',l:'Beachcomb along the driftwood',s:`40 min. ${cap(calmTxt(12))}. Smooth logs, sea glass and a long horizon.`,cat:'rest',
        fn:()=>{pass(40);S.stats.walks++;calm(12);say(pick(['🪵 Silver logs the size of couches, stacked by winter storms. You find a piece of green sea glass and keep it in your pocket like a coin.','🪵 You balance along a driftwood trunk with your arms out. Nobody sees. Probably.','🪵 Pebbles click under your shoes. Across the water, Vashon sits low and green, and the Olympics stand up behind it.']))}});
      if(!ruDone('view')){const ss=sunsetOn(d),ok=at(ss-60,ss+20);
        a.push({ic:'🌅',l:'Watch the light on the Olympics',s:ok?'45 min. Stress −17. Once a day. The mountains go blue, then pink, then slate.':`Best near sunset, around ${fmt(ss)}. Come back then.`,cat:'rest',cls:ok?'primary':'',dis:!ok,
          fn:()=>{ruSet('view');pass(45);adj('stress',-17);say(pick(['🌅 The sun slips toward the Olympics and the whole sound turns to hammered copper. Vashon goes black and sharp. You sit on a log and let it happen.','🌅 The water goes still, and the mountains across it glow. Somebody a few logs down starts clapping. Soon everybody is.']))}})}
      if(!ruDone('dog')) a.push({ic:'🐕',l:'Walk the shore with a greyhound',s:'45 min. Energy −4, stress −8, community +2. You might meet someone. Once a day.',cat:'people',
        fn:()=>{ruSet('dog');pass(45);adj('energy',-4);adj('stress',-8);adj('community',2);if(ruMeet('ru_otis'))say('🐕 A tall, gray greyhound leans on your leg until you pet him. His person laughs. This is <b>Otis</b>, retired bus driver, and <b>Biscuit</b>, retired from everything. You walk the whole beach together at dog speed, which is not fast.');else say('🐕 Biscuit spots you from fifty yards off and arrives at a stately lean. Otis updates you on the tide and the weather.')}});
    }
    if(loc==='ru_zoo'){
      const t=rp(25),open=at(570,1020);
      if(!ruDone('zoo')) a.push({ic:'🎟️',l:`Spend a few hours at the zoo & aquarium — ${$(t)}`,s:open?'2 hours 30 min. Energy −6, stress −14, community +2. Once a day.':'Open 9:30 AM to 5 PM.',cat:'here',cls:open?'primary':'',dis:!open||!canAfford(t),
        fn:()=>{spend(t);ruSet('zoo');pass(150);adj('energy',-6);adj('stress',-14);adj('community',2);say(pick(['🎟️ In the Pacific Seas aquarium you stand in a blue room while a whole reef drifts by. A kid next to you whispers “Whoa” on your behalf. The red wolves pace their woodland yard, sleek and watchful, and a keeper tells the crowd how few of them are left in the world.','🎟️ You do the whole loop: the aquarium’s glowing jellies, the long shaded paths, the red wolves resting in the ferns. You come out smelling a bit like cedar and with a very strong opinion about jellies.']))}});
      const g=rp(8);
      a.push({ic:'🥪',l:`A sandwich at the picnic tables — ${$(g)}`,s:at(600,1020)?'20 min. Energy +10, stress −2.':'Open with the zoo, 9:30 AM to 5 PM.',cat:'food',dis:!at(600,1020)||!canAfford(g),
        fn:()=>{spend(g);pass(20);adj('energy',10);adj('stress',-2);say('🥪 Turkey and cheddar on thick bread, in the shade, with a crow watching your crust with deep respect.')}});
      a.push({ic:'🌳',l:'Sit under the big trees outside the gate',s:`30 min. ${cap(calmTxt(8))}.`,cat:'rest',
        fn:()=>{pass(30);calm(8);say('🌳 A bench under a fir the width of a minivan. Footsteps, kids’ voices, a faraway whoop. A good place to do nothing for half an hour.')}});
    }
    return a;
  },
});

// ---- events (arrive hook, only in Ruston) ----
const ruHere=c=>!isGrow()&&hoodOf(c.at)==='ruston';
defEvent({id:'ruston_eagle',hook:'arrive',tile:['🦅','A bald eagle overhead','good'],chance:0.4,max:2,cooldown:2,cond:c=>ruHere(c)&&tod()>=420&&tod()<1140,
  run:()=>{say('🦅 A shadow crosses the path. You look up: a bald eagle, huge and unhurried, wheeling over the treetops with two crows yelling at it.')},
  choices:()=>stopWatch({mins:15,calm:6,text:'🦅 You stand there, mouth open, until it is a dot over the Sound. The crows go home. A jogger stops beside you and says, “Every time.”'}),dflt:1});
defEvent({id:'ruston_seal',hook:'arrive',tile:['🦭','A seal on the beach','good'],chance:0.45,max:1,cond:c=>c.at==='ru_beach'&&!isGrow(),
  run:()=>{say('🦭 A round gray head pops up just offshore and regards you with enormous dark eyes. A seal.')},
  choices:()=>stopWatch({mins:10,calm:5,community:1,text:'🦭 A small crowd gathers, whispering. It stays a full minute, then vanishes with a quiet ripple. Everybody agrees it was looking at them.'}),dflt:1});
defEvent({id:'ruston_dog',hook:'arrive',tile:['🐶','A stranger’s dog','good'],chance:0.3,max:1,cond:c=>ruHere(c)&&(c.at==='ru_park'||c.at==='ru_beach'),
  run:()=>{say('🐶 A fluffy dog with no leash and a great deal of confidence adopts you. Its owner, a few yards behind, calls “Sorry! He chooses people!”')},
  choices:()=>[
    {ic:'🚶',l:'Walk the path together',s:'40 min. Energy −3, stress −7, community +1.',fn:()=>{pass(40);adj('energy',-3);adj('stress',-7);adj('community',1);say('🐶 You walk the path together, dog first, owner chatting. Forty minutes pass, and you wave goodbye like old friends.')}},
    {ic:'🎾',l:'Throw a stick a few times',s:'10 min. Stress −3, energy −1.',fn:()=>{pass(10);adj('stress',-3);adj('energy',-1);say('🐶 Six throws, six triumphant returns, one deeply proud dog. The owner thanks you and steers him back to the trail.')}},
    {ic:'🙋',l:'Give a pat and move on',s:'Nothing changes.',fn:()=>{say('🐶 One good ear scratch and the dog accepts your apology.')}}],dflt:2});
defEvent({id:'ruston_concert',hook:'arrive',tile:['🎶','Concert in the park','good'],chance:0.4,max:1,cond:c=>ruHere(c)&&c.at!=='ru_zoo'&&tod()>=1020&&tod()<1230,
  run:()=>{say('🎶 From a clearing in the trees comes music: a summer concert, a brass band on a small stage, families on blankets and kids twirling in the grass.')},
  choices:()=>[
    {ic:'🧺',l:'Take the spot on the blanket',s:'1 hour. Energy −2, stress −8, community +2.',fn:()=>{pass(60);adj('energy',-2);adj('stress',-8);adj('community',2);say('🎶 Someone slides over and makes room on a blanket. You learn the second verse by the end, and you sing it.')}},
    {ic:'👏',l:'Stand at the edge for a song or two',s:'15 min. Stress −3, community +1.',fn:()=>{pass(15);adj('stress',-3);adj('community',1);say('🎶 You tap your foot through two songs and clap with everyone at the end.')}},
    {ic:'🚶',l:'Let it play behind you',s:'Nothing changes.',fn:()=>{say('🎶 The trumpets follow you down the path, fainter at each bend.')}}],dflt:2});
