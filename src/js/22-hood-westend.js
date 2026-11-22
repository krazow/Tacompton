// ============================================================
//  TACOMPTON, neighborhood pack: The West End (Tacoma's west side by the Narrows).
//  A bluff view of the Narrows bridges, Tacoma Community College, and a Jackson Ave shopping strip (invented shops).
//  Prefix we_. Registers itself with defHood() (20-world.js).
// ============================================================
(function(){
const KEY='westend';
const HF=()=>(S.hoodFlags=S.hoodFlags||{});
const once=k=>!!HF()[`${KEY}_${k}_${day()}`], mark=k=>{HF()[`${KEY}_${k}_${day()}`]=true};
const brick=n=>n?'#40251f':'#a8553f', conc=n=>n?'#4a4d55':'#d8d4c8';
const bridge=(n,x0,x1,y,tw,c)=>{const t1=x0+(x1-x0)*.22,t2=x0+(x1-x0)*.78,top=y-tw;
  return `<rect x="${x0}" y="${y}" width="${x1-x0}" height="3" fill="${c}"/>
    ${[t1,t2].map(t=>`<rect x="${t-2}" y="${top}" width="4" height="${tw+14}" fill="${c}"/><rect x="${t-6}" y="${top+10}" width="12" height="2" fill="${c}"/>`).join('')}
    <path d="M${x0} ${y} Q${(x0+t1)/2} ${y-tw*.55} ${t1} ${top} Q${(t1+t2)/2} ${y-6} ${t2} ${top} Q${(t2+x1)/2} ${y-tw*.55} ${x1} ${y}" stroke="${c}" stroke-width="1.6" fill="none"/>
    ${Array.from({length:14},(_,i)=>{const px=t1+(t2-t1)*(i+.5)/14;const u=(px-(t1+t2)/2)/((t2-t1)/2);const hy=y-6-(tw-6)*u*u;return `<path d="M${px} ${hy} V${y}" stroke="${c}" stroke-width=".7"/>`}).join('')}`};

defHood({
  key:KEY, name:'The West End', ic:'🌉', blurb:'Tacoma’s breezy west side, where the streets run out toward the Narrows, the bridges hum over the water and a community college sits among the neighborhood shops.',
  hub:'we_shops', ride:{via:'🚌 Bus', mins:26, fare:2},
  places:{
    we_view:{name:'Narrows Bridges Viewpoint',ic:'🌉',desc:'A grassy bluff on the Tacoma side with a view of the two suspension bridges over the Narrows, where the first bridge, “Galloping Gertie,” collapsed in 1940',
      art:({night:n,dusk})=>`${starsSky(n)}
        <path d="M0 86 Q90 70 200 82 T480 74 V96 H0 Z" fill="${HC.hill2(n)}"/>
        <rect y="90" width="480" height="40" fill="${HC.bay(n)}"/>${dusk&&!n?'<rect y="90" width="480" height="12" fill="#f4b183" opacity=".4"/>':''}
        <path d="M60 104 q30 -3 60 0 M250 112 q30 -3 60 0 M370 100 q30 -3 60 0" stroke="${HC.bay2(n)}" stroke-width="2" fill="none" opacity=".7"/>
        ${bridge(n,20,460,82,38,n?'#59616c':'#7d8793')}
        ${bridge(n,20,460,92,42,n?'#6b7480':'#b04a2e')}
        ${n?[60,110,160,210,260,310,360,410].map(x=>`<circle cx="${x}" cy="90" r="1.4" fill="#f7d77a"/>`).join(''):''}
        <path d="M0 128 Q120 116 260 126 T480 120 V150 H0 Z" fill="${HC.hill(n)}"/>
        <path d="M0 140 H480" stroke="${n?'#3a3c3a':'#cdc5b0'}" stroke-width="5"/>
        <path d="M30 128 H190 M30 134 H190" stroke="${n?'#6a6e74':'#5b6168'}" stroke-width="1.6"/>${[40,70,100,130,160,186].map(x=>`<rect x="${x}" y="126" width="2" height="10" fill="${n?'#6a6e74':'#5b6168'}"/>`).join('')}
        <rect x="300" y="128" width="40" height="3" fill="${n?'#5a3a2a':'#8a5a3a'}"/><rect x="304" y="131" width="3" height="8" fill="${n?'#3a2a20':'#5a3a2a'}"/><rect x="333" y="131" width="3" height="8" fill="${n?'#3a2a20':'#5a3a2a'}"/>
        ${tree(420,n,24,146)}${tree(456,n,18,146)}${person(230,n,'#c0392b',146,.9)}${person(248,n,'#2a6fa8',146,.9)}${lamp(360,n,146)}`},
    we_tcc:{name:'Tacoma Community College',ic:'🎓',desc:'The west side’s community college: low brick buildings, a quad with benches and a lot of people carrying coffee and textbooks',
      hours:d=>d%7<5?[420,1260]:null,
      art:({night:n})=>`${starsSky(n)}
        <rect y="124" width="480" height="26" fill="${n?'#1a2a22':'#6f9a74'}"/>
        ${tree(34,n,22,132)}${tree(452,n,22,132)}${tree(90,n,16,132)}
        <rect x="110" y="64" width="150" height="66" fill="${brick(n)}"/><rect x="104" y="58" width="162" height="8" fill="${conc(n)}"/>
        <rect x="260" y="82" width="110" height="48" fill="${brick(n)}"/><rect x="256" y="78" width="118" height="6" fill="${conc(n)}"/>
        ${[0,1,2,3,4,5].map(i=>`<rect x="${120+i*23}" y="74" width="14" height="14" fill="${win(n,i!==2&&i!==4)}"/><rect x="${120+i*23}" y="98" width="14" height="14" fill="${win(n,i!==1)}"/>`).join('')}
        ${[0,1,2,3].map(i=>`<rect x="${272+i*24}" y="90" width="14" height="14" fill="${win(n,i!==1)}"/>`).join('')}
        <rect x="262" y="110" width="22" height="20" fill="${n?'#1e1410':'#4a3226'}"/>
        <rect x="150" y="30" width="70" height="20" rx="3" fill="${n?'#1c1814':'#1f3a5a'}"/><text x="185" y="45" text-anchor="middle" font-size="13" ${SVGF} fill="#f4e2a8">TCC</text>
        <rect x="183" y="50" width="4" height="10" fill="${n?'#4a4f55':'#6a7078'}"/>
        <path d="M0 134 Q240 126 480 134" stroke="${n?'#3a3c3a':'#cdc5b0'}" stroke-width="7" fill="none"/>
        <rect x="70" y="136" width="30" height="3" fill="${n?'#5a3a2a':'#8a5a3a'}"/><rect x="390" y="136" width="30" height="3" fill="${n?'#5a3a2a':'#8a5a3a'}"/>
        ${person(130,n,'#2a6fa8',146,.9)}${person(300,n,'#c98a12',146,.9)}${person(318,n,'#8e44ad',146,.9)}${person(400,n,'#c0392b',146,.9)}${lamp(228,n,146)}`},
    we_shops:{name:'Jackson Ave shops',ic:'🛍️',desc:'A friendly strip of low storefronts along Jackson Ave: a yarn shop, a noodle counter and a thrift store, all invented, all with awnings',
      hours:d=>d%7<5?[540,1080]:[600,1020],
      art:({night:n})=>`${starsSky(n)}
        ${tree(24,n,16,140)}${tree(458,n,16,140)}
        ${[['SUNSET STITCH','#7a3b6e',48,n?'#4a2e26':'#b5654a'],['NARROWS NOODLE','#c0392b',172,n?'#32343d':'#c9a77a'],['BRIDGEVIEW','#2f6b4a',296,n?'#2e3a36':'#d9c9a0']].map(([t,c,x,w],i)=>`
          <rect x="${x}" y="58" width="116" height="82" fill="${w}"/><rect x="${x-3}" y="54" width="122" height="6" fill="${n?'#2a1e1a':'#6a3f2e'}"/>
          <rect x="${x+6}" y="64" width="104" height="13" rx="2" fill="${n?'#1c1814':'#2a1e18'}"/><text x="${x+58}" y="74" text-anchor="middle" font-size="7.5" ${SVGF} fill="#f4e2a8">${t}</text>
          <path d="M${x} 84 h116 l-6 12 h-104 z" fill="${c}"/>${[0,1,2,3,4,5,6].map(k=>`<rect x="${x+4+k*16}" y="84" width="8" height="12" fill="#fff" opacity=".28"/>`).join('')}
          <rect x="${x+8}" y="106" width="46" height="30" fill="${win(n)}"/><rect x="${x+68}" y="106" width="38" height="34" fill="${n?'#241a14':'#4a3226'}"/>
          ${i===0?`<circle cx="${x+22}" cy="124" r="6" fill="#e74c8c"/><circle cx="${x+36}" cy="126" r="5" fill="#f2b630"/>`:i===1?`<rect x="${x+16}" y="120" width="26" height="8" rx="4" fill="${n?'#7a5a3a':'#f4efe4'}"/>`:`<rect x="${x+14}" y="114" width="12" height="20" fill="#2a6fa8" opacity=".7"/><rect x="${x+30}" y="118" width="14" height="16" fill="#c98a12" opacity=".7"/>`}`).join('')}
        ${person(160,n,'#2a6fa8',146,.95)}${person(420,n,'#8e44ad',146,.95)}${lamp(14,n,146)}${lamp(440,n,146)}
        <rect y="146" width="480" height="4" fill="${HC.walk(n)}"/>`},
  },
  travel:{'we_view|we_tcc':9,'we_view|we_shops':7,'we_tcc|we_shops':6},
  neighbors:[
    {id:'we_hal',n:'Hal',ic:'🌉',at:['we_view'],d:'Retired ironworker who walks the bluff every morning with a thermos and a folding stool. Will tell you about Galloping Gertie, how it twisted in the wind in 1940, and why engineers still study it, for as long as you let him.'},
    {id:'we_noemi',n:'Noemi',ic:'🧶',at:['we_shops','we_tcc'],d:'Runs Sunset Stitch, the yarn shop on Jackson Ave, and takes a night class at the community college “to keep my brain from knitting itself into a scarf.” Always has two projects going and a third in her tote bag.'},
  ],
  actions:(loc,d,m)=>{const a=[],at=(lo,hi)=>m>=lo&&m<hi;
    if(loc==='we_view'){
      a.push({ic:'🌉',l:'Watch the bridges and read the history sign',s:`30 min. ${cap(calmTxt(8))}.`,cat:'rest',fn:()=>{pass(30);S.stats.walks++;calm(8);const x=!S.met.we_hal;if(x){S.met.we_hal=d+1;S.stats.neighbors=metCount();adj('community',2)}
        say(pick(['🌉 Two long suspension bridges side by side, trucks humming across, tugboats small as bathtub toys below. The sign tells the story: the first bridge opened in July 1940 and collapsed that November in a windstorm, and nobody ever forgot it.','🌉 The sign says the first Narrows Bridge swayed and rippled so much that people called it Galloping Gertie. Standing here with the water this far down, you can almost picture the roadway waving.'])+(x?` A man on a folding stool nods at you: <b>Hal</b>. ${weNb('we_hal').d}`:' Hal raises his thermos from the stool.'))}});
      const ss=sunsetOn(d),ok=at(ss-50,ss+20);
      if(!once('sunset'))a.push({ic:'🌇',l:'Watch the sun drop behind the Narrows',s:ok?`Sunset ${fmt(ss)}. 45 min. Stress −16, community +1. Once a day.`:m<ss?`Sunset ${fmt(ss)}. Best from ${fmt(ss-50)}.`:`Sunset was ${fmt(ss)}.`,cat:'rest',cls:ok?'primary':'',dis:!ok,
        fn:()=>{mark('sunset');pass(45);adj('stress',-16);adj('community',1);say(pick(['🌇 The sun slides toward the Olympics and the bridge cables turn to gold wire. A cyclist stops, takes a photo, then just stands there with the phone down.','🌇 The water goes copper, then pink, then slate. Headlights start to string across the bridge like a bead necklace. Someone behind you says “well, that’ll do.”']))}});
    }
    if(loc==='we_tcc'){
      const open=isOpen('we_tcc');
      if(!once('study')){a.push({ic:'📚',l:'Study in the library and sit in on a free talk',s:open?'60 min. Stress −6, energy −3, community +2. Once a day.':hoursTxt('we_tcc'),cat:'here',dis:!open,
        fn:()=>{mark('study');pass(60);adj('stress',-6);adj('energy',-3);adj('community',2);say(pick(['📚 A quiet table by a window, a stranger’s highlighted textbook and a student asleep on a beanbag. The calm of a place where everybody is trying to improve something.','📚 A drop-in talk about job-hunting: how to word a resume, what to say when they ask about gaps. You take two pages of notes and feel a little taller.']))}})}
      if(!once('coffee')){const c=rp(5);a.push({ic:'☕',l:`Coffee from the campus cafe — ${$(c)}`,s:open?(canAfford(c)?'20 min. Energy +9, stress −4. Once a day.':'Not enough cash.'):hoursTxt('we_tcc'),cat:'food',dis:!open||!canAfford(c),
        fn:()=>{spend(c);mark('coffee');pass(20);adj('energy',9);adj('stress',-4);say(pick(['☕ A strong cup on a bench in the quad, with a flock of students heading to class like migrating geese.','☕ The cafe line is mostly people studying while standing in line. You get your coffee and a kind “good luck on your exam” that wasn’t meant for you.']))}})}
      a.push({ic:'🎓',l:'Walk the quad and read the class flyers',s:'25 min. '+cap(calmTxt(6))+'. Community +1.',cat:'people',fn:()=>{pass(25);S.stats.walks++;calm(6);adj('community',1);const x=!S.met.we_noemi&&Math.random()<.5;if(x){S.met.we_noemi=d+1;S.stats.neighbors=metCount();adj('community',2)}
        say('🎓 Corkboards full of flyers: tutoring, a used-textbook swap, a roommate wanted, “learn a trade, change your life.” You take a photo of three of them.'+(x?` A woman with a tote full of yarn asks if you know where room 14 is: <b>Noemi</b>. ${weNb('we_noemi').d}`:''))}});
    }
    if(loc==='we_shops'){
      const open=isOpen('we_shops');
      if(!once('noodle')){const c=rp(10);a.push({ic:'🍜',l:`Hot noodle bowl at Narrows Noodle — ${$(c)}`,s:open?(canAfford(c)?'35 min. Energy +12, stress −6. Once a day.':'Not enough cash.'):hoursTxt('we_shops'),cat:'food',dis:!open||!canAfford(c),
        fn:()=>{spend(c);mark('noodle');pass(35);adj('energy',12);adj('stress',-6);S.stats.meals++;say(pick(['🍜 A steaming bowl at a counter stool by the window. The cook hands it over with both hands and a very serious “careful, hot.”','🍜 Slippery noodles, a soft egg and a pile of scallions. The wind outside tugs at the door every few minutes, like it wants a bowl too.']))}})}
      const y=rp(11);a.push({ic:'🧶',l:`Pick out yarn at Sunset Stitch — ${$(y)}`,s:open?(canAfford(y)?`45 min. ${cap(calmTxt(10))}.`:'Not enough cash.'):hoursTxt('we_shops'),cat:'here',dis:!open||!canAfford(y),
        fn:()=>{spend(y);pass(45);calm(10);const x=!S.met.we_noemi;if(x){S.met.we_noemi=d+1;S.stats.neighbors=metCount();adj('community',2)}
          say('🧶 Walls of wool in every color, a basket of fat skeins you squeeze for no reason, and a beginner chart taped to the counter. You leave with one skein the color of a Narrows sunset.'+(x?` The owner looks up from her needles: <b>Noemi</b>. ${weNb('we_noemi').d}`:' Noemi shows you a simple stitch and tells you, firmly, that nobody is born knowing it.'))}});
      if(!once('thrift')){const c=rp(8);a.push({ic:'🧥',l:`Browse Bridgeview Thrift — ${$(c)}`,s:open?(canAfford(c)?'40 min. Stress −7, community +1. Once a day.':'Not enough cash.'):hoursTxt('we_shops'),cat:'money',dis:!open||!canAfford(c),
        fn:()=>{spend(c);mark('thrift');pass(40);adj('stress',-7);adj('community',1);say(pick(['🧥 A rack of flannels, a shelf of mismatched mugs and a rain jacket in your size for next to nothing. The clerk says it came from a good home.','🧥 A bin of old board games, a lamp with a fringe and a coat that fits like it was waiting. You buy the coat.']))}})}
    }
    return a;
  },
});
function weNb(id){return NEIGHBORS.find(x=>x.id===id)}

defEvent({id:'westend_fog',hook:'arrive',tile:['🌫️','Bridge in the fog','good'],chance:0.4,max:2,cooldown:2,cond:c=>!isGrow()&&hoodOf(c.at)==='westend'&&c.at==='we_view'&&tod()<660,
  run:()=>{say('🌫️ Fog swallows the middle of the Narrows. The bridge towers rise out of it like two tall ghosts.')},
  choices:()=>stopWatch({mins:10,calm:6,text:'🌫️ The cables disappear, and the only sound is the muffled hum of unseen trucks and a distant foghorn. For ten minutes the whole world is gray and gentle.'}),dflt:1});
defEvent({id:'westend_wind',hook:'arrive',tile:['💨','A windy day on the Narrows','bad'],chance:0.3,max:1,cooldown:3,cond:c=>!isGrow()&&hoodOf(c.at)==='westend'&&c.at==='we_view',
  run:()=>{say('💨 The wind off the water is a living thing today: your hair, your jacket and a stranger’s hat all end up somewhere else.')},
  choices:()=>{const p=rp(3);return [
    {ic:'🧱',l:'Hold the railing and ride it out',s:'Energy −4, stress +2. Free.',fn:()=>{adj('energy',-4);adj('stress',2);say('💨 You hold the railing and think of Gertie, then decide the new bridges are much better at this than you are.')}},
    {ic:'☕',l:`Duck into a shop for something hot — ${$(p)}`,s:'25 min. Energy +2, stress −2.',dis:!canAfford(p),fn:()=>{spend(p);pass(25);adj('energy',2);adj('stress',-2);say('💨 A paper cup, a window seat and the wind rattling the glass like it wants in.')}},
    {ic:'🏠',l:'Head inland out of the gusts',s:'10 min. Energy −1, stress +1.',fn:()=>{pass(10);adj('energy',-1);adj('stress',1);say('💨 Two blocks inland the air is calm again, as if it were all a rumor.')}}]},dflt:2});
defEvent({id:'westend_openhouse',hook:'arrive',tile:['🎓','Class signup day','good'],chance:0.4,max:2,cooldown:2,cond:c=>!isGrow()&&hoodOf(c.at)==='westend'&&c.at==='we_tcc'&&tod()>=600&&tod()<1020,
  run:()=>{say('🎓 Tables line the quad: advisors in bright lanyards, a free-pizza stand, a banner that says “It’s Not Too Late.”')},
  choices:()=>[
    {ic:'📝',l:'Sit down with an advisor',s:'40 min. Energy −3, stress +2, community +3. They will remember you.',fn:()=>{pass(40);adj('energy',-3);adj('stress',2);adj('community',3);setEventFlag('westend_advisor',day()+1);say('🎓 An advisor in a green lanyard asks what you want to learn and writes your name on a card. “I’ll watch for you,” she says.')}},
    {ic:'🍕',l:'Take a catalog and a slice',s:'15 min. Stress −4, community +1.',fn:()=>{pass(15);adj('stress',-4);adj('community',1);say('🎓 A student ambassador hands you a catalog and a tote bag. You flip through it and feel yourself standing straighter.')}},
    {ic:'🚶',l:'Walk past the banner',s:'Nothing changes.',fn:()=>{say('🎓 “It’s Not Too Late” follows you down the quad. It is a good banner.')}}],dflt:2});
defEvent({id:'westend_advisor',hook:'arrive',tile:['🎓','The advisor remembers you','good'],chance:0.5,max:1,cond:c=>{const f=eventFlag('westend_advisor');return !isGrow()&&!!f&&day()>=f&&c.at==='we_tcc'&&tod()>=600&&tod()<1020},
  run:()=>{say('🎓 The advisor in the green lanyard spots you across the quad. “You came back!” She has your card.')},
  choices:()=>[
    {ic:'📚',l:'Book the intro class',s:'30 min. Energy −3, stress +3, community +2.',fn:()=>{pass(30);adj('energy',-3);adj('stress',3);adj('community',2);say('🎓 A seat, a start date and a syllabus you do not hate. You walk out slightly taller.')}},
    {ic:'✉️',l:'Ask her to email the details',s:'10 min. Stress −2, community +1.',fn:()=>{pass(10);adj('stress',-2);adj('community',1);say('🎓 She writes your address on the card and promises no pressure. You believe her.')}}],dflt:1});
defEvent({id:'westend_carshow',hook:'arrive',tile:['🚗','A car show in the lot','good'],chance:0.3,max:1,cond:c=>!isGrow()&&hoodOf(c.at)==='westend'&&c.at==='we_shops'&&tod()>=600&&tod()<1080,
  run:()=>{say('🚗 The parking lot behind the shops is full of chrome: a cherry-red convertible, a lowrider with a mural on the hood and a station wagon older than anyone’s parents.')},
  choices:()=>[
    {ic:'🔧',l:'Ask the owners about their cars',s:'40 min. Energy −2, stress −6, community +2.',fn:()=>{pass(40);adj('energy',-2);adj('stress',-6);adj('community',2);say('🚗 Owners wipe fenders with soft cloths and love every question. A kid is allowed to honk one horn. He picks the loudest.')}},
    {ic:'👀',l:'Walk one lap',s:'15 min. Stress −3, community +1.',fn:()=>{pass(15);adj('stress',-3);adj('community',1);say('🚗 One slow lap, one wave at the mural lowrider, no questions asked.')}},
    {ic:'🚶',l:'Skip it',s:'Nothing changes.',fn:()=>{say('🚗 Chrome flashes at you from behind the shops as you leave.')}}],dflt:2});
})();
