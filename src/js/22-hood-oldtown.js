// ============================================================
//  TACOMPTON, neighborhood pack: Old Town (Tacoma's oldest neighborhood, on the slope above Commencement Bay).
//  The historic main corner (the café is invented; the replica Job Carr Cabin, Tacoma's first post office, is a real museum
//  a short walk up the hill), Old Town Dock on the bay (walking, views and paddling only) and a hillside street of old houses.
//  Prefix ot_. Registers itself with defHood() (20-world.js).
// ============================================================
(function(){
const KEY='oldtown';
const HF=()=>(S.hoodFlags=S.hoodFlags||{});
const once=k=>!!HF()[`${KEY}_${k}_${day()}`], mark=k=>{HF()[`${KEY}_${k}_${day()}`]=true};
const meet=id=>{if(S.met[id])return false;S.met[id]=day()+1;S.stats.neighbors=metCount();adj('community',2);return true};
const otNb=id=>defHoodNb(id);
const defHoodNb=id=>({
  ot_ansel:{d:'Runs the corner café with his sleeves rolled and a dish towel over one shoulder. Knows the year every building on the block was built, and will tell you twice if you let him.'},
  ot_ingrid:{d:'Retired teacher who keeps tomato plants on every sunny inch of her front steps. Pays the whole street in cherry tomatoes and expects, in return, only gossip about the bay.'},
}[id]);
const brick=n=>n?'#40251f':'#a8553f';
const wood=n=>n?'#3a2a22':'#b98b62', paint=(n,c)=>n?'#2e3038':c;

defHood({
  key:KEY, name:'Old Town', ic:'🏘️', blurb:'Tacoma’s oldest neighborhood, a few steep blocks of old storefronts and wooden houses above a small waterfront, where the city got its start.',
  hub:'ot_corner', ride:{via:'🚌 Bus',mins:16,fare:2},
  places:{
    ot_corner:{name:'Old Town main corner',ic:'🍺',desc:'The historic corner of old brick and wood storefronts, with a tavern-style café on the corner. The replica Job Carr Cabin, an early post office, is a short walk up the hill',
      hours:d=>[420,1260],
      art:({night:n})=>`${starsSky(n)}
        ${tree(30,n,18,140)}${tree(458,n,16,140)}
        <rect x="40" y="62" width="90" height="78" fill="${n?'#32343d':'#c9a77a'}"/><rect x="36" y="58" width="98" height="6" fill="${n?'#2a1e1a':'#6a3f2e'}"/>
        <rect x="52" y="76" width="22" height="26" fill="${win(n)}"/><rect x="88" y="76" width="22" height="26" fill="${win(n,false)}"/><rect x="62" y="110" width="24" height="30" fill="${n?'#241a14':'#4a3226'}"/>
        <rect x="150" y="38" width="190" height="102" fill="${brick(n)}"/>
        <rect x="146" y="34" width="198" height="6" fill="${n?'#2a1e1a':'#e3d9c3'}"/>
        ${[0,1,2,3,4].map(i=>`<rect x="${162+i*34}" y="48" width="16" height="22" rx="8" fill="${win(n,i!==2)}"/>`).join('')}
        <rect x="150" y="76" width="190" height="4" fill="${n?'#5a5a60':'#e3d9c3'}"/>
        <rect x="166" y="86" width="40" height="54" fill="${n?'#241a14':'#4a3226'}"/><rect x="170" y="90" width="32" height="38" fill="${win(n)}"/>
        <rect x="216" y="92" width="110" height="34" fill="${win(n)}"/><path d="M216 126 h110" stroke="${n?'#6b4430':'#6b4430'}" stroke-width="3"/>
        <path d="M212 84 h118 l-6 10 h-106 z" fill="${n?'#4a2418':'#8a2f27'}"/>${[0,1,2,3,4,5,6,7].map(k=>`<rect x="${216+k*14}" y="84" width="7" height="10" fill="#fff" opacity=".25"/>`).join('')}
        <rect x="190" y="56" width="110" height="14" rx="2" fill="${n?'#1c1814':'#2a1e18'}"/><text x="245" y="66.5" text-anchor="middle" font-size="8" ${SVGF} fill="#f4e2a8">PETTIBONE’S CORNER</text>
        ${n?`<rect x="216" y="92" width="110" height="34" fill="#f7d77a" opacity=".2"/>`:''}
        <rect x="360" y="70" width="80" height="70" fill="${n?'#3a3228':'#d9c9a0'}"/><polygon points="354,70 400,40 446,70" fill="${n?'#2c3644':'#6b5a4a'}"/><rect x="376" y="86" width="20" height="22" fill="${win(n,false)}"/><rect x="408" y="86" width="20" height="22" fill="${win(n)}"/><rect x="392" y="112" width="18" height="28" fill="${n?'#241a14':'#4a3226'}"/>
        ${person(140,n,'#2a6fa8',146,.95)}${person(350,n,'#c0392b',146,.95)}${lamp(130,n,146)}${lamp(344,n,146)}
        <rect y="146" width="480" height="4" fill="${HC.walk(n)}"/>`},
    ot_dock:{name:'Old Town Dock',ic:'⚓',desc:'A wooden dock and little waterfront park at the foot of the hill: benches, a viewing platform, and a shed that rents kayaks for paddling. A good place to sit and watch the water',
      art:({night:n,dusk})=>`${starsSky(n)}
        <path d="M290 84 L324 66 L352 76 L392 52 L432 70 L480 62 V90 H290 Z" fill="${HC.mtn(n)}"/>
        <path d="M392 52 l-8 12 l8 -3 l7 5 z" fill="#fff" opacity="${HC.snow(n)}"/>
        <rect y="86" width="480" height="64" fill="${HC.bay(n)}"/>${dusk&&!n?'<rect y="86" width="480" height="12" fill="#f4b183" opacity=".35"/>':''}
        <path d="M60 104 q24 -4 48 0 M250 110 q24 -4 48 0 M380 120 q24 -4 48 0 M120 126 q24 -4 48 0" stroke="${HC.bay2(n)}" stroke-width="2" fill="none" opacity=".7"/>
        <path d="M0 96 Q60 86 120 94 V150 H0 Z" fill="${HC.hill(n)}"/>${tree(24,n,22,130)}${tree(80,n,18,134)}
        <rect x="110" y="112" width="230" height="8" fill="${wood(n)}"/><path d="M118 120 v22 M170 120 v22 M222 120 v22 M274 120 v22 M326 120 v22" stroke="${n?'#2a1e16':'#6a4a30'}" stroke-width="3"/>
        <rect x="300" y="92" width="40" height="22" fill="${n?'#32343d':'#8aa0a8'}"/><polygon points="296,92 320,78 344,92" fill="${n?'#2c3644':'#6b5a4a'}"/><rect x="310" y="98" width="12" height="16" fill="${win(n)}"/>
        <path d="M150 108 q22 6 44 0 l-5 6 h-34 z" fill="#d9822b"/><path d="M200 104 q22 6 44 0 l-5 6 h-34 z" fill="#2a6fa8"/>
        ${[130,200,270].map(x=>`<rect x="${x}" y="100" width="2.5" height="12" fill="${n?'#4a4f55':'#3c4248'}"/>`).join('')}
        ${person(150,n,'#c0392b',112,.8)}${person(262,n,'#2f8f6a',112,.8)}${lamp(332,n,114)}
        <rect y="140" width="480" height="10" fill="${n?'#1a2a28':'#6f9a74'}"/>`},
    ot_hill:{name:'Old Town hillside street',ic:'🏡',desc:'A steep street of old wooden houses with porches, picket fences and glimpses of the bay between rooftops',
      art:({night:n,dusk})=>`${starsSky(n)}
        <rect y="70" width="480" height="40" fill="${HC.bay(n)}"/>${dusk&&!n?'<rect y="70" width="480" height="8" fill="#f4b183" opacity=".35"/>':''}
        <path d="M300 74 L340 56 L372 66 L412 44 L450 60 L480 54 V76 H300 Z" fill="${HC.mtn(n)}" opacity=".9"/><path d="M412 44 l-8 12 l8 -3 l7 5 z" fill="#fff" opacity="${HC.snow(n)}"/>
        <path d="M0 104 Q120 92 250 106 T480 102 V150 H0 Z" fill="${HC.hill(n)}"/>
        <path d="M0 150 L0 132 Q150 122 300 134 L480 144 V150 Z" fill="${HC.street(n)}"/><path d="M0 131 Q150 121 300 133 L480 143" stroke="${HC.walk(n)}" stroke-width="3" fill="none"/>
        ${[[40,'#d9b36a'],[168,'#7fa3b8'],[300,'#c98a8a']].map(([x,c],i)=>`
          <rect x="${x}" y="${72+i*6}" width="84" height="54" fill="${paint(n,c)}"/><polygon points="${x-6},${72+i*6} ${x+42},${42+i*6} ${x+90},${72+i*6}" fill="${n?'#2c3644':'#6b5a4a'}"/>
          <rect x="${x+10}" y="${86+i*6}" width="20" height="22" fill="${win(n,i!==1)}"/><rect x="${x+54}" y="${86+i*6}" width="20" height="22" fill="${win(n)}"/>
          <rect x="${x+34}" y="${100+i*6}" width="16" height="26" fill="${n?'#241a14':'#4a3226'}"/><rect x="${x-4}" y="${112+i*6}" width="92" height="4" fill="${n?'#3a3c3a':'#e8e2d4'}"/>
          ${[0,1,2,3,4,5,6].map(k=>`<rect x="${x-2+k*13}" y="${116+i*6}" width="3" height="10" fill="${n?'#4a4f55':'#fff'}" opacity=".8"/>`).join('')}`).join('')}
        <circle cx="106" cy="120" r="4" fill="#d6402f"/><circle cx="114" cy="122" r="4" fill="#d6402f"/><circle cx="436" cy="124" r="4" fill="#d6402f"/>
        ${tree(20,n,20,140)}${tree(444,n,22,146)}${lamp(260,n,136)}${person(250,n,'#8e44ad',142,.8)}`},
  },
  travel:{'ot_corner|ot_dock':8,'ot_corner|ot_hill':5,'ot_dock|ot_hill':10},
  neighbors:[
    {id:'ot_ansel',n:'Ansel',ic:'🍺',at:['ot_corner'],d:otNb('ot_ansel').d},
    {id:'ot_ingrid',n:'Ingrid',ic:'🍅',at:['ot_hill'],d:otNb('ot_ingrid').d},
  ],
  actions:(loc,d,m)=>{const a=[],at=(lo,hi)=>m>=lo&&m<hi;
    if(loc==='ot_corner'){
      const open=isOpen('ot_corner');
      if(!once('soup')){const c=rp(10);a.push({ic:'🍲',l:`Soup and bread at Pettibone’s Corner — ${$(c)}`,s:open?(canAfford(c)?'35 min. Energy +11, stress −6, community +1. Once a day.':'Not enough cash.'):hoursTxt('ot_corner'),cat:'food',dis:!open||!canAfford(c),
        fn:()=>{spend(c);mark('soup');pass(35);adj('energy',11);adj('stress',-6);adj('community',1);S.stats.meals++;const x=meet('ot_ansel');
          say(pick(['🍲 Dark wood booths, a pressed-tin ceiling and a pot of potato-leek soup. The bread is warm and the butter is generous.','🍲 A bowl of split-pea soup and a heel of rye at the long wooden bar. The mirror behind it is older than anyone’s grandmother.'])+(x?` The man behind the bar tosses you a spoon: <b>Ansel</b>. ${otNb('ot_ansel').d}`:' Ansel slides over a second bread basket without being asked.'))}})}
      a.push({ic:'📜',l:'Walk the old-town history trail',s:`40 min. ${cap(calmTxt(9))}.`,cat:'here',fn:()=>{pass(40);S.stats.walks++;calm(9);say(pick(['📜 Brass plaques and old photographs on the storefronts. Tacoma’s first settlers built their homes on this slope in the 1860s, long before the downtown towers. A replica of Job Carr’s cabin, which doubled as an early post office, stands nearby.','📜 A walking-tour volunteer in a sun hat points out where the old mill stood and where the first streets ran down to the bay. “Everything started right here,” she says. You nod like it’s news. It kind of is.']))}});
      const b=rp(4);a.push({ic:'☕',l:`Coffee at the corner window — ${$(b)}`,s:open?(canAfford(b)?'20 min. Energy +6, stress −4.':'Not enough cash.'):hoursTxt('ot_corner'),cat:'food',dis:!open||!canAfford(b),
        fn:()=>{spend(b);pass(20);adj('energy',6);adj('stress',-4);say('☕ A thick mug at the window seat, watching the bus sigh up the hill. Someone’s dog sleeps under the next table with its chin on a boot.')}});
    }
    if(loc==='ot_dock'){
      a.push({ic:'🚶',l:'Stroll to the end of the dock',s:`25 min. ${cap(calmTxt(8))}.`,cat:'rest',fn:()=>{pass(25);S.stats.walks++;calm(8);say(pick(['🚶 Boards creak under your shoes and the bay slaps gently at the pilings. On the far shore the port cranes stand around like patient giraffes.','🚶 A gull stands on the railing and refuses to leave. You share the view. The water is every shade of green-gray.']))}});
      const kc=rp(14),open=at(600,1080);a.push({ic:'🛶',l:`Rent a kayak for a short paddle — ${$(kc)}`,s:open?(canAfford(kc)?'1 hour. Energy −4, stress −14, community +1. Paddling only.':'Not enough cash for a rental.'):'The kayak shed is open about 10 AM to 6 PM.',cat:'rest',cls:'',dis:!open||!canAfford(kc)||once('kayak'),
        fn:()=>{spend(kc);mark('kayak');pass(60);adj('energy',-4);adj('stress',-14);adj('community',1);say(pick(['🛶 You push off, wobble, then find the rhythm. The bay is flat and silver, the dock shrinks behind you and the whole city goes quiet except for your paddle.','🛶 A seal pops its head up thirty feet away, studies you, and sinks without comment. Your arms ache in a good way.'])+' Dell, who runs the shed, checks your life jacket and nods.')}});
      if(!once('sunset')){const ss=sunsetOn(d),ok=at(ss-50,ss+20);a.push({ic:'🌇',l:'Watch sunset from the dock',s:ok?`Sunset ${fmt(ss)}. 40 min. Stress −15, community +1. Once a day.`:m<ss?`Sunset ${fmt(ss)}. Best from ${fmt(ss-50)}.`:`Sunset was ${fmt(ss)}.`,cat:'rest',cls:ok?'primary':'',dis:!ok,
        fn:()=>{mark('sunset');pass(40);adj('stress',-15);adj('community',1);say(pick(['🌇 The bay goes copper, then rose. Kayakers glide home in a loose line and the lights of the far shore come on one by one.','🌇 A neighbor with a thermos sits down at the other end of the bench. Neither of you says anything. It is the best conversation you have all week.']))}})}
    }
    if(loc==='ot_hill'){
      a.push({ic:'🏡',l:'Climb the hillside street',s:`30 min. ${cap(calmTxt(8))}. Energy −3.`,cat:'rest',fn:()=>{pass(30);S.stats.walks++;calm(8);adj('energy',-3);say(pick(['🏡 Steep enough to feel it in your calves. Old wooden houses lean in on both sides, with porch swings, wind chimes and, between two roofs, a postcard slice of the bay.','🏡 Every house has a different porch. One has a hand-lettered sign: “Please admire the hydrangeas from the sidewalk.” You do.']))}});
      if(!once('tomato')){a.push({ic:'🍅',l:'Chat with a neighbor over the garden fence',s:'25 min. Stress −7, community +2. Once a day.',cat:'people',
        fn:()=>{mark('tomato');pass(25);adj('stress',-7);adj('community',2);const x=meet('ot_ingrid');say((x?`🍅 A woman waters pots of tomatoes on her front steps and waves you over: <b>Ingrid</b>. ${otNb('ot_ingrid').d} `:'🍅 Ingrid is out with her watering can again. ')+'She hands you a paper bag of cherry tomatoes still warm from the sun. “Eat one now,” she says. “They taste best before you can think about it.”')}})}
    }
    return a;
  },
});

defEvent({id:'oldtown_tour',hook:'arrive',tile:['📜','A historical walking tour','good'],chance:0.4,max:2,cooldown:2,cond:c=>!isGrow()&&hoodOf(c.at)==='oldtown'&&c.at==='ot_corner'&&tod()>=600&&tod()<1020,
  run:()=>{pass(20);adj('stress',-5);adj('community',2);say('📜 A volunteer guide in a sun hat is leading a small group down the block, and waves you in. You learn which storefront was the first store, where the old streetcar turned around, and that the hill is steeper than it was in 1880. Probably.')}});
defEvent({id:'oldtown_dockevening',hook:'arrive',tile:['🌆','A summer evening on the dock','good'],chance:0.4,max:2,cooldown:2,cond:c=>!isGrow()&&hoodOf(c.at)==='oldtown'&&c.at==='ot_dock'&&tod()>=1020&&tod()<1260,
  run:()=>{adj('stress',-6);adj('community',1);say('🌆 The whole dock is out tonight: couples on benches, kids racing along the planks, a guitarist playing quietly near the rail. The light is soft and gold. Somebody passes around a bag of popcorn, and the bag reaches you.')}});
defEvent({id:'oldtown_tomatoes',hook:'arrive',tile:['🍅','A neighbor’s garden tomatoes','good'],chance:0.35,max:1,cond:c=>!isGrow()&&hoodOf(c.at)==='oldtown'&&c.at==='ot_hill'&&tod()>=540&&tod()<1140,
  run:()=>{adj('stress',-4);adj('community',2);S.stats.meals=(S.stats.meals||0)+1;say('🍅 A hand-lettered sign leans on a fence: “Free tomatoes. Take two. Take three. They’re multiplying.” You take three. A curtain twitches in an upstairs window and then a thumbs-up appears. Dinner is going to be good.')}});
defEvent({id:'oldtown_kayaks',hook:'arrive',tile:['🛶','Kayakers at sunset','good'],chance:0.4,max:2,cooldown:2,cond:c=>!isGrow()&&hoodOf(c.at)==='oldtown'&&c.at==='ot_dock'&&tod()>=sunsetOn(day())-60&&tod()<sunsetOn(day())+30,
  run:()=>{pass(10);adj('stress',-6);adj('community',1);say('🛶 A line of kayaks glides home across the pink water, paddles dripping and flashing. One paddler lifts a hand to you as if you had been waiting for them. You wave back like you were.')}});
})();
