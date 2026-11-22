// ============================================================
//  TACOMPTON, neighborhood pack: Proctor & the North End (a short bus ride across town).
//  The Proctor District's old-fashioned main street, the Saturday farmers market and a quiet street of big old
//  houses with a view toward the Narrows. Every business and person here is made up.
// ============================================================
(()=>{
const KEY='proctor';
const flags=()=>(S.hoodFlags=S.hoodFlags||{});
const once=(name,d)=>{const f=flags(),k=`${KEY}_${name}_${d}`;if(f[k])return false;f[k]=true;return true};
const did=(name,d)=>!!flags()[`${KEY}_${name}_${d}`];
const prMeet=(id,d)=>{if(S.met[id])return false;S.met[id]=d+1;S.stats.neighbors=metCount();adj('community',MEET_COMMUNITY);return true};
const nb=id=>NEIGHBORS.find(x=>x.id===id);
const isSat=d=>dayName(d)==='Saturday';
const marketOpen=()=>typeof S!=='undefined'&&S&&isOpen('pr_market');

// ---- art ----
const mainArt=({night:n})=>`${starsSky(n)}${tree(24,n,14)}
  <rect x="50" y="34" width="124" height="106" fill="${n?'#3a2a2e':'#a8553f'}"/><rect x="46" y="28" width="132" height="8" fill="${n?'#241a1c':'#5c2f25'}"/>
  <rect x="68" y="40" width="88" height="18" rx="3" fill="${n?'#1c1416':'#2a1a14'}"/><text x="112" y="53" text-anchor="middle" font-size="11" ${SVGF} fill="#f4d27a">STARLITE</text>
  <rect x="60" y="62" width="104" height="22" fill="${n?'#14100f':'#241712'}"/>${Array.from({length:12},(_,i)=>`<circle cx="${64+i*8.7}" cy="${65}" r="1.5" fill="#f7d77a" opacity="${n?1:.55}"/><circle cx="${64+i*8.7}" cy="${81}" r="1.5" fill="#f7d77a" opacity="${n?1:.55}"/>`).join('')}
  <text x="112" y="76" text-anchor="middle" font-size="7" ${SVGF} fill="${n?'#fff6c8':'#f4e6c0'}">TONIGHT · 7:30</text>
  <rect x="62" y="92" width="22" height="30" fill="${n?'#2a2024':'#e8d9b8'}"/><rect x="140" y="92" width="22" height="30" fill="${n?'#2a2024':'#e8d9b8'}"/><rect x="66" y="96" width="14" height="22" fill="${n?'#7a3a3a':'#c0412c'}"/><rect x="144" y="96" width="14" height="22" fill="${n?'#3a4a6a':'#2a6fa8'}"/>
  <rect x="94" y="96" width="36" height="44" fill="${n?'#1e1616':'#4a3226'}"/><rect x="111" y="96" width="2" height="44" fill="${n?'#3a2a2a':'#2a1a14'}"/><rect x="98" y="100" width="12" height="14" fill="${win(n)}" opacity=".7"/><rect x="114" y="100" width="12" height="14" fill="${win(n)}" opacity=".7"/>
  <rect x="180" y="62" width="112" height="78" fill="${n?'#2e3a34':'#8fae9a'}"/><rect x="176" y="56" width="120" height="8" fill="${n?'#1c2622':'#3d5a4a'}"/>
  <rect x="190" y="38" width="92" height="20" rx="3" fill="${n?'#1c2622':'#2d4a3a'}"/><text x="236" y="50" text-anchor="middle" font-size="8" ${SVGF} fill="#f4e6c0">BIRCH &amp; BOLT</text><text x="236" y="56" text-anchor="middle" font-size="4.5" ${SVGF} fill="#c9d8b8">HARDWARE · SINCE 1952</text>
  <path d="M180 74 h112 l-8 9 h-96 z" fill="${n?'#3a4a42':'#3d5a4a'}"/>${[0,1,2,3,4,5].map(i=>`<rect x="${186+i*17}" y="74" width="8" height="9" fill="#fff" opacity=".2"/>`).join('')}
  <rect x="190" y="92" width="44" height="30" fill="${win(n)}"/><rect x="198" y="100" width="28" height="3" fill="${n?'#6a5a4a':'#9a6b3a'}"/><rect x="200" y="108" width="6" height="14" fill="${n?'#5a4a3a':'#b8402a'}"/><rect x="212" y="108" width="6" height="14" fill="${n?'#4a5a6a':'#2a6fa8'}"/>
  <rect x="246" y="92" width="22" height="48" fill="${n?'#1a1814':'#4a3a2c'}"/><rect x="272" y="104" width="14" height="36" fill="none"/><path d="M274 140 l5 -34 l5 34 M276 128 h6 M277 118 h4" stroke="${n?'#6a6a60':'#9a9a8a'}" stroke-width="1.5" fill="none"/>
  <rect x="298" y="64" width="124" height="76" fill="${n?'#3a2e34':'#f2d6dc'}"/><rect x="294" y="58" width="132" height="8" fill="${n?'#2a2026':'#d98aa0'}"/>
  <rect x="318" y="30" width="84" height="22" rx="3" fill="${n?'#3a2430':'#d9708f'}"/><text x="360" y="45" text-anchor="middle" font-size="9" ${SVGF} fill="#fff">MAPLE CONE</text>
  <polygon points="352,16 368,16 360,32" fill="#d9a55a"/><circle cx="360" cy="12" r="7" fill="#f6e3c8"/><circle cx="355" cy="9" r="4" fill="#f2b6c8"/><circle cx="366" cy="9" r="3.5" fill="#8a5a3a"/>
  <path d="M298 76 h124 l-8 10 h-108 z" fill="${n?'#4a2a3a':'#e87aa0'}"/>${Array.from({length:7},(_,i)=>`<rect x="${304+i*17}" y="76" width="8" height="10" fill="#fff" opacity=".4"/>`).join('')}
  <rect x="308" y="94" width="48" height="28" fill="${win(n)}"/><rect x="368" y="94" width="22" height="46" fill="${n?'#241a1c':'#6a4a3a'}"/><rect x="396" y="100" width="20" height="22" fill="${win(n)}"/>
  <rect x="316" y="122" width="32" height="5" fill="${n?'#4a3a3a':'#8a6b48'}"/>
  ${person(204,n,'#c98a12',146,.95)}${person(334,n,'#8e44ad',146,.8)}${person(346,n,'#2f8f6a',146,.7)}${lamp(26,n)}${lamp(430,n)}${tree(456,n,13)}
  <rect x="0" y="146" width="480" height="4" fill="${HC.walk(n)}"/>`;

const marketArt=({night:n})=>{const sat=typeof S!=='undefined'&&S&&isSat(day());
  const tent=(x,c)=>`<polygon points="${x},84 ${x+60},84 ${x+66},98 ${x-6},98" fill="${c}"/>${[0,1,2,3,4].map(i=>`<rect x="${x-5+i*14.4}" y="84" width="7" height="14" fill="#fff" opacity=".45"/>`).join('')}<rect x="${x-4}" y="98" width="3" height="42" fill="${n?'#4a4f55':'#6a7076'}"/><rect x="${x+61}" y="98" width="3" height="42" fill="${n?'#4a4f55':'#6a7076'}"/><rect x="${x}" y="120" width="60" height="14" fill="${n?'#4a3a2a':'#a8845a'}"/>`;
  const fruit=(x,c)=>[0,1,2,3,4,5].map(i=>`<circle cx="${x+6+i*9}" cy="${118-(i%2)*2}" r="4.2" fill="${n?'#7a4a3a':c}"/>`).join('');
  return `${starsSky(n)}<path d="M0 100 Q120 82 240 92 T480 88 V142 H0 Z" fill="${HC.hill(n)}"/>${tree(24,n,18)}${tree(456,n,20)}
  <g transform="translate(-24 0)"><rect x="60" y="62" width="250" height="9" fill="${n?'#2a3038':'#7a4a32'}"/><polygon points="52,63 185,40 318,63" fill="${n?'#2a2024':'#9a5a3a'}"/>
  <rect x="86" y="46" width="200" height="14" rx="2" fill="${n?'#1c1416':'#2a1a14'}" opacity=".0"/><text x="185" y="62" text-anchor="middle" font-size="7.5" ${SVGF} fill="${n?'#f4e6c0':'#f9e9c0'}">PROCTOR FARMERS MARKET</text>
  ${[70,160,246,300].map(x=>`<rect x="${x}" y="70" width="5" height="70" fill="${n?'#3a2e26':'#6a4430'}"/>`).join('')}
  <rect x="94" y="112" width="56" height="4" fill="${n?'#4a3a2a':'#b08a58'}"/><rect x="98" y="116" width="3" height="24" fill="#555"/><rect x="143" y="116" width="3" height="24" fill="#555"/><rect x="190" y="112" width="56" height="4" fill="${n?'#4a3a2a':'#b08a58'}"/><rect x="194" y="116" width="3" height="24" fill="#555"/><rect x="239" y="116" width="3" height="24" fill="#555"/></g>
  ${sat?`${tent(300,'#d9573a')}${fruit(304,'#f2a34a')}<text x="330" y="94" text-anchor="middle" font-size="7" ${SVGF} fill="#fff">PEACHES</text>${tent(368,'#e3b53a')}${fruit(372,'#c0392b')}${person(344,n,'#2a6fa8',146,.95)}${person(362,n,'#c98a12',146,.9)}${person(96,n,'#8e44ad',112,.7)}${person(190,n,'#2f8f6a',112,.7)}`:`${person(96,n,'#8e44ad',112,.7)}<rect x="326" y="118" width="52" height="22" fill="${n?'#3a3430':'#cfc4aa'}"/><text x="352" y="132" text-anchor="middle" font-size="6.5" ${SVGF} fill="${n?'#888':'#6a5a4a'}">SATURDAYS</text><text x="352" y="139" text-anchor="middle" font-size="6.5" ${SVGF} fill="${n?'#888':'#6a5a4a'}">9 – 2</text><rect x="350" y="140" width="3" height="6" fill="#555"/>`}
  ${lamp(284,n)}<rect x="0" y="146" width="480" height="4" fill="${HC.walk(n)}"/>`};

const northArt=({night:n})=>{const house=(x,w,c,roof,turret,lit)=>`<rect x="${x}" y="${150-w*.9-14}" width="${w}" height="${w*.9+4}" fill="${c}"/><polygon points="${x-6},${150-w*.9-12} ${x+w/2},${150-w*.9-46} ${x+w+6},${150-w*.9-12}" fill="${roof}"/>
    ${turret?`<rect x="${x+w-6}" y="${150-w*.9-30}" width="22" height="${w*.9+18}" fill="${c}"/><polygon points="${x+w-10},${150-w*.9-30} ${x+w+5},${150-w*.9-52} ${x+w+20},${150-w*.9-30}" fill="${roof}"/><rect x="${x+w}" y="${150-w*.9-18}" width="10" height="12" fill="${win(n,lit[0])}"/>`:''}
    <rect x="${x+w/2-8}" y="${150-w*.9-30}" width="16" height="12" fill="${win(n,lit[1])}"/><rect x="${x+8}" y="${150-w*.9+2}" width="16" height="16" fill="${win(n,lit[2])}"/><rect x="${x+w-30}" y="${150-w*.9+2}" width="16" height="16" fill="${win(n,lit[3])}"/>
    <rect x="${x-3}" y="${150-24}" width="${w+6}" height="4" fill="${n?'#3a3434':'#efe6d6'}"/>${[0,1,2,3].map(i=>`<rect x="${x-1+i*(w/3)}" y="${150-20}" width="4" height="20" fill="${n?'#3a3434':'#efe6d6'}"/>`).join('')}<rect x="${x+w/2-6}" y="${150-20}" width="12" height="20" fill="${n?'#1e1616':'#4a3226'}"/>`;
  return `${starsSky(n)}
  <path d="M250 82 L300 70 L340 76 L380 66 L430 74 L480 70 V96 H250 Z" fill="${n?'#1c2a3a':'#8fa8bd'}" opacity=".8"/>
  <rect x="240" y="92" width="240" height="30" fill="${HC.bay(n)}"/><path d="M270 102 q20 -3 40 0 M380 110 q20 -3 40 0 M320 116 q20 -3 40 0" stroke="${HC.bay2(n)}" stroke-width="1.6" fill="none" opacity=".7"/>
  <g stroke="${n?'#3a4048':'#c9ced2'}" fill="none"><rect x="320" y="60" width="4" height="40" fill="${n?'#3a4048':'#c9ced2'}" stroke="none"/><rect x="408" y="60" width="4" height="40" fill="${n?'#3a4048':'#c9ced2'}" stroke="none"/><path d="M240 96 H480" stroke-width="2"/><path d="M240 86 Q280 90 322 62 Q366 100 410 62 Q450 90 480 84" stroke-width="1.4"/><path d="M340 70 V96 M366 82 V96 M390 76 V96 M430 72 V96 M300 76 V96" stroke-width=".7"/></g>
  ${n?`<circle cx="322" cy="60" r="1.6" fill="#ff6a5a"/><circle cx="410" cy="60" r="1.6" fill="#ff6a5a"/>`:''}
  <path d="M0 128 Q120 118 240 124 V142 H0 Z" fill="${HC.hill(n)}"/>
  ${house(26,86,n?'#3a3036':'#c9a46a',n?'#2a2224':'#5c3a30',true,[1,0,1,0])}${house(136,80,n?'#2e3a40':'#8fb0a8',n?'#2a2a30':'#4a4a5a',false,[0,1,1,1])}${tree(236,n,16,142)}
  <rect x="0" y="142" width="480" height="8" fill="${HC.street(n)}"/><path d="M0 146 H480" stroke="${n?'#4a4f55':'#c9c4b6'}" stroke-width="1" stroke-dasharray="14 10" opacity=".7"/>
  <rect x="262" y="128" width="60" height="4" fill="${n?'#3e3228':'#8a6b48'}"/><rect x="266" y="132" width="3" height="10" fill="#444"/><rect x="315" y="132" width="3" height="10" fill="#444"/>
  ${person(290,n,'#24507a',130,.9)}${lamp(212,n,142)}${lamp(400,n,150)}${tree(448,n,15,146)}`};

// ---- actions ----
const actions=(loc,d,m)=>{const a=[],at=(lo,hi)=>m>=lo&&m<hi;
  if(loc==='pr_main'){
    const cone=rp(6),film=rp(11),opn=at(720,1260),show=at(1000,1260);
    a.push({ic:'🍦',l:`A cone at Maple Cone — ${$(cone)}`,s:opn?'20 min. Energy +6, stress −7. Huckleberry, honey lavender or plain vanilla, in a real waffle cone.':'Open noon to 9 PM.',cat:'food',dis:!opn||!canAfford(cone),
      fn:()=>{spend(cone);pass(20);adj('energy',6);adj('stress',-7);say(pick(['🍦 Honey lavender, two scoops, a paper napkin that gives up in the first minute. You eat it on the curb like a nine-year-old and nobody judges.','🍦 The teenager behind the counter hands you a sample spoon “for the road.” You come back for the whole cone.','🍦 Huckleberry. Purple lips, a little sticky, completely worth the bus ride.']))}});
    if(!did('film',d)) a.push({ic:'🎬',l:`Evening show at the Starlite — ${$(film)}`,s:show&&canAfford(film)?'2 hours. Energy −2, stress −14, community +1. A double feature of old favorites, once a day.':show?`You have ${$(Math.round(S.money))}.`:'Shows start about 7:30 PM. Come back from 4:30 PM on.',cat:'rest',dis:!show||!canAfford(film),
      fn:()=>{once('film',d);spend(film);pass(120);adj('energy',-2);adj('stress',-14);adj('community',1);say(pick(['🎬 The curtain, the real popcorn smell, a hundred strangers laughing at the same joke in a room older than your grandparents. The organ plays one slow chord before the lights go down.','🎬 An old comedy, projected on a screen that has seen everything. A man two rows up knows every line. His whole row mouths along.','🎬 The seats creak, the carpet is a color you’ve never seen, the ticket stub goes in your pocket. You walk out into the evening feeling like you’ve been somewhere.']))}});
    if(!did('hardware',d)) a.push({ic:'🔩',l:'Browse the hardware store',s:at(480,1080)?'30 min. Free. Stress −4, community +1. Walt knows what everything is for.':'Open 8 AM to 6 PM.',cat:'people',dis:!at(480,1080),
      fn:()=>{once('hardware',d);pass(30);adj('stress',-4);adj('community',1);const x=prMeet('pr_walt',d);
        say(x?`🔩 Bins of loose screws, a wall of paint chips, a cat asleep on a bag of potting soil. Behind the counter, <b>${nb('pr_walt').n}</b> looks up. ${nb('pr_walt').d}`:pick(['🔩 Walt cuts you a single key for forty cents and tells you which neighbor’s gate it will not open. You leave with a better idea of how to fix the drip in your kitchen than you came with.','🔩 You come in for nothing and leave with a tiny brass hook that you’ll definitely use. Walt is already explaining hinges to the next customer.']))}});
  }
  if(loc==='pr_market'){
    const sat=isSat(d),open=isOpen('pr_market'),p=rp(24);
    a.push({ic:'🍑',l:`Shop the market stalls — ${$(p)}`,s:open&&canAfford(p)?`40 min. 3 meals for the fridge (you have ${S.food}), stress −5, energy +4. Peaches, tomatoes, bread, a block of cheese.`:open?`You have ${$(Math.round(S.money))}.`:sat?'The stalls are open 9 AM to 2 PM.':'The market runs Saturdays, 9 AM to 2 PM. The pavilion is here all week.',cat:'food',cls:open&&S.food<=2?'primary':'',dis:!open||!canAfford(p),
      fn:()=>{spend(p);S.food+=3;pass(40);adj('stress',-5);adj('energy',4);const x=prMeet('pr_margo',d);
        say(`🍑 A paper bag of peaches, a loaf with a crust like a drum, ripe tomatoes, a wedge of cheese the cheesemonger swears is “not a big deal” and is. ${x?`At the peach stall you meet <b>${nb('pr_margo').n}</b>. ${nb('pr_margo').d}`:pick(['The woman at the peach stall hands you a slice to try, then another “for the road.”','Somebody’s fiddle plays near the flower stand. You buy one more tomato than you meant to.'])}`)}});
    a.push({ic:'🪑',l:'Sit under the market pavilion',s:`25 min. Free. ${cap(calmTxt(5))}. ${sat&&open?'Stalls all around you.':'Empty today, but the tables and the shade are all yours.'}`,cat:'rest',
      fn:()=>{pass(25);calm(5);if(once('board',d))adj('community',1);say(sat&&open?pick(['🪑 Stalls, strollers, a golden retriever in a bandana. You sit still and let the whole Saturday go by.','🪑 A kid with peach juice to the elbows sits down at your table, says nothing and gets back up. Honestly, same.']):pick(['🪑 No stalls today. The pavilion is a wide wooden roof and a few picnic tables, and you have the whole place to yourself. The community board has flyers for piano lessons, a lost cat and a pie contest.','🪑 You read every flyer on the community board: a choir looking for tenors, a free piano, a ride share to Olympia. Tacoma talks to itself in thumbtacks.']))}});
  }
  if(loc==='pr_north'){
    const ss=sunsetOn(d),ok=at(ss-45,ss+20);
    if(!did('sunset',d)) a.push({ic:'🌇',l:'Watch the sun go down over the Narrows',s:ok?`Sunset ${fmt(ss)}. 45 min. Stress −18. Once a day. The bridge lights come on one by one.`:m<ss?`Sunset ${fmt(ss)} tonight, best from ${fmt(ss-45)}.`:`Sunset was ${fmt(ss)}.`,cat:'rest',cls:ok?'primary':'',dis:!ok,
      fn:()=>{once('sunset',d);pass(45);adj('stress',-18);const x=prMeet('pr_margo',d)&&Math.random()<.5;say(pick(['🌇 The light goes copper on the water, then pink, then a blue so deep it looks poured. Cars hum across the bridge like a string of small lanterns.','🌇 Somebody’s porch swing creaks. The Narrows goes gold, the bridge towers go dark and the whole street takes a breath at once.'])+(x?' A woman walking a very old dog nods at you on her way past.':''))}});
    a.push({ic:'🚶',l:'Stroll the North End streets',s:`40 min. ${cap(calmTxt(9))}, energy −3. Big old porches, gardens and not one car honking.`,cat:'here',
      fn:()=>{pass(40);S.stats.walks++;calm(9);adj('energy',-3);const x=prMeet('pr_margo',d)&&Math.random()<.6;say(pick(['🚶 Turrets, wraparound porches, a stained-glass window with a sun in it. Every house has a name nobody says out loud, and a hydrangea the size of a car.','🚶 A street where the houses are bigger than the lots, the maples are older than the houses and a gap between two of them shows the water. You walk slowly on purpose.','🚶 Somebody’s cat supervises you from three fence posts in a row. The Narrows glints between the houses at every corner.'])+(x?` You pass <b>${nb('pr_margo').n}</b>, who says good evening like she means it.`:''))}});
  }
  return a};

defHood({
  key:KEY,name:'Proctor & the North End',ic:'🏘️',
  blurb:'A bus ride across town and the pace changes: a little main street with a movie theater and an ice-cream shop, a farmers market on Saturdays, and quiet streets of big old houses that look at the water.',
  hub:'pr_main',ride:{via:'🚌 Bus',mins:20,fare:2},
  places:{
    pr_main:{name:'Proctor District',ic:'🎬',desc:'A small-town main street inside the city: the old Starlite movie theater, a family hardware store and the ice-cream shop with the line out the door',art:mainArt},
    pr_market:{name:'Proctor Farmers Market',ic:'🍑',desc:'A Saturday market under a big wooden pavilion: peaches, bread, flowers and a fiddle. The rest of the week, just the pavilion and its shade',hours:d=>dayName(d)==='Saturday'?[540,840]:null,art:marketArt},
    pr_north:{name:'North End',ic:'🏡',desc:'Quiet streets of big old houses with deep porches, and between them a view of the Narrows and its bridge',art:northArt},
  },
  travel:{'pr_main|pr_market':5,'pr_main|pr_north':9,'pr_market|pr_north':12},
  neighbors:[
    {id:'pr_walt',n:'Walt Bergstrom',ic:'🔩',at:['pr_main'],d:'Third generation behind the counter at Birch & Bolt, where the squeaky floor is original and the cat is the manager. Will sell you one screw if one screw is all you need, and then ask what you are building.'},
    {id:'pr_margo',n:'Margo Lindqvist',ic:'🍑',at:['pr_market','pr_north'],d:'Grew up in a house on the North End and now runs a peach stall at the market on Saturdays with fruit from her cousin’s orchard in Eastern Washington. Walks her old dog every evening and knows which porch has the best view of the sunset.'},
  ],
  actions,
});

// ---- events ----
const inHood=c=>!isGrow()&&hoodOf(c.at)===KEY;
defEvent({id:'proctor_peaches',hook:'arrive',tile:['🍑','The best peaches of the summer','good'],chance:0.45,max:1,cond:c=>c.at==='pr_market'&&marketOpen(),
  run:()=>{say('🍑 A hand-lettered sign: FIRST OF THE ELBERTAS. The woman at the stall cuts one open and the whole aisle smells like July.')},
  choices:()=>{const p=rp(5);return [
    {ic:'🛍️',l:`Buy a whole bag — ${$(p)}`,s:'15 min. Food +2, stress −5.',dis:!canAfford(p),fn:()=>{spend(p);pass(15);S.food+=2;adj('stress',-5);say('🍑 A paper bag, heavy and warm from the sun. You eat one on the walk and the juice runs to your elbow. Food +2.')}},
    {ic:'🗣️',l:'Take a slice and chat',s:'10 min. Free. Stress −4, community +1.',fn:()=>{pass(10);adj('stress',-4);adj('community',1);say('🍑 You are handed a slice, then another, and learn which orchard they came from and why this week is the week. You leave sticky and informed.')}},
    {ic:'🚶',l:'Keep walking',s:'Nothing changes.',fn:()=>{say('🍑 You breathe the peach air in passing and keep your errands.')}}]},dflt:2});
defEvent({id:'proctor_movie_night',hook:'arrive',tile:['🎞️','Free movie night','good'],chance:0.4,max:1,cond:c=>c.at==='pr_main'&&tod()>=1080&&tod()<1260,
  run:()=>{say('🎞️ A bedsheet on the side of the hardware store, a projector on a milk crate and forty folding chairs. Free movie night. Walt hands out popcorn from a paint bucket (new, he swears).')},
  choices:()=>[
    {ic:'🍿',l:'Stay for the whole movie',s:'2 hours. Energy −3, stress −8, community +3.',fn:()=>{pass(120);adj('energy',-3);adj('stress',-8);adj('community',3);say('🎞️ You laugh with forty strangers at the same joke, and Walt tops up your popcorn without asking.')}},
    {ic:'🪑',l:'Watch the first reel',s:'40 min. Stress −4, community +1.',fn:()=>{pass(40);adj('stress',-4);adj('community',1);say('🎞️ You stay for the opening and slip out while the crowd is still laughing. Walt waves with a handful of popcorn.')}},
    {ic:'🚶',l:'Pass for tonight',s:'Nothing changes.',fn:()=>{say('🎞️ You listen to the soundtrack drift down the block as you go.')}}],dflt:2});
defEvent({id:'proctor_garage_sale',hook:'arrive',tile:['🏷️','A garage sale','good'],chance:0.4,max:1,cond:c=>inHood(c)&&c.at!=='pr_market'&&tod()>=540&&tod()<1020&&day()%7>=5,
  run:()=>{say('🏷️ A garage sale, folding tables on a lawn: lamps, a bread machine, a box of vinyl and a sign that says EVERYTHING MUST GO, FOR REAL THIS TIME.')},
  choices:()=>{const p=rp(3);return [
    {ic:'💡',l:`Buy the brass reading lamp — ${$(p)}`,s:'20 min. Stress −4, community +2.',dis:!canAfford(p),fn:()=>{spend(p);pass(20);adj('stress',-4);adj('community',2);say('🏷️ A brass reading lamp that will look great in your apartment, and a handshake with the seller.')}},
    {ic:'🗣️',l:'Browse and chat with the street',s:'15 min. Free. Stress −2, community +2.',fn:()=>{pass(15);adj('stress',-2);adj('community',2);say('🏷️ You chat with half the street about the bread machine and buy nothing. It was still a good morning.')}},
    {ic:'🚶',l:'Walk on by',s:'Nothing changes.',fn:()=>{say('🏷️ You wave at the seller and keep going.')}}]},dflt:2});
defEvent({id:'proctor_lemonade',hook:'arrive',tile:['🍋','A lemonade stand','good'],chance:0.4,max:1,cond:c=>inHood(c)&&c.at!=='pr_market'&&tod()>=600&&tod()<1080,
  run:()=>{say('🍋 Two kids with a card table, a hand-painted sign (LEMONADE 4 SALE, “ice cold, 90% sugar”) and a very serious cash box.')},
  choices:()=>{const p=rp(1);return [
    {ic:'🥤',l:`Buy a cup — ${$(p)}`,s:'5 min. Energy +3, stress −4, community +1.',dis:!canAfford(p),fn:()=>{spend(p);pass(5);adj('energy',3);adj('stress',-4);adj('community',1);say('🍋 You are given a cup, your change and a review: “You’re our best customer.”')}},
    {ic:'💬',l:'Stop and hear about the business',s:'10 min. Free. Stress −3.',fn:()=>{pass(10);adj('stress',-3);say('🍋 They explain their pricing, their supply chain and a rival stand two streets over. A volunteer cup appears in your hand “on the house.”')}},
    {ic:'🚶',l:'Wave and keep going',s:'Nothing changes.',fn:()=>{say('🍋 “Maybe next time!” the older one calls after you.')}}]},dflt:2});
})();
