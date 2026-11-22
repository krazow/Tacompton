// ============================================================
//  TACOMPTON, neighborhood pack: South End & the Lincoln District (KEY southend, prefix so_).
//  A bus ride south: S 38th St with its immigrant-owned markets, bakeries and phở counters, Lincoln High School and the Bowl,
//  and a South End park with a weekend soccer game. Every business and person here is made up.
// ============================================================
const SO={
  brick:n=>n?'#3b2622':'#a4553f',brick2:n=>n?'#2e1d1a':'#7c3f30',stone:n=>n?'#3a3d42':'#cfc8b8',
  // a string of paper lanterns between x1 and x2, sagging at y
  lanterns:(n,x1,x2,y)=>`<path d="M${x1} ${y} Q${(x1+x2)/2} ${y+10} ${x2} ${y}" stroke="${n?'#4a4f55':'#6a6f75'}" stroke-width="1" fill="none"/>${Array.from({length:7},(_,i)=>{const t=(i+.5)/7,x=x1+(x2-x1)*t;return `<ellipse cx="${x}" cy="${y+4+10*2*t*(1-t)}" rx="3.6" ry="4.6" fill="${i%2?'#f2b630':'#d6402e'}"/>${n?`<circle cx="${x}" cy="${y+4+10*2*t*(1-t)}" r="8" fill="#f7d77a" opacity=".16"/>`:''}`}).join('')}`,
};
defHood({
  key:'southend',name:'South End & the Lincoln District',ic:'🍜',
  blurb:'The bus lets you off on South 38th, where the bakery lights have been on since 4 AM and every shop sign is in two languages.',
  hub:'so_a',ride:{via:'🚌 Bus',mins:18,fare:2},
  places:{
    so_a:{name:'South 38th Street',ic:'🍜',desc:'The Lincoln District’s main drag: a Southeast Asian market, a bakery that opens before the sun, a phở counter and a red gate over the sidewalk',
      art:({night:n})=>`${starsSky(n)}<g transform="translate(40 25.7) scale(.8333)">
        ${SO.lanterns(n,0,480,56)}
        ${[['LOTUS MARKET','#2f6b4a',6,'#e4d6b6','m'],['SUNRISE BAKERY','#b07a1e',128,'#eadcc0','b'],['PHỞ MAI','#b8402a',250,'#e0d3bb','p']].map(([t,c,x,w,k])=>`<rect x="${x}" y="74" width="114" height="66" fill="${n?'#3a3530':w}"/><rect x="${x-3}" y="66" width="120" height="12" fill="${c}"/><text x="${x+57}" y="75.5" text-anchor="middle" font-size="8" ${SVGF} fill="#fff">${t}</text>
          <path d="M${x} 82 h114 l-8 9 h-98 z" fill="${c}" opacity=".85"/>${[0,1,2,3,4,5].map(i=>`<rect x="${x+6+i*18}" y="82" width="9" height="9" fill="#fff" opacity=".25"/>`).join('')}
          <rect x="${x+8}" y="98" width="46" height="30" fill="${win(n)}"/><rect x="${x+66}" y="98" width="20" height="42" fill="${n?'#241c16':'#4a3a2c'}"/><rect x="${x+92}" y="98" width="16" height="30" fill="${win(n)}"/>
          ${k==='m'?[['#e3642e',16],['#6cae4a',28],['#f2b630',40]].map(([cc,dx])=>`<circle cx="${x+dx}" cy="132" r="5" fill="${cc}"/>`).join('')+`<rect x="${x+10}" y="124" width="42" height="3" fill="#8a6b48"/>`:''}
          ${k==='b'?[0,1,2].map(i=>`<ellipse cx="${x+20+i*14}" cy="118" rx="6" ry="3.4" fill="${n?'#a8742a':'#d99a3a'}"/>`).join('')+`<rect x="${x+10}" y="123" width="42" height="2" fill="#8a6b48"/>`:''}
          ${k==='p'?[0,1,2].map(i=>`<circle cx="${x+22+i*10}" cy="${90-i*4}" r="${3+i}" fill="#fff" opacity="${.5-i*.1}"/>`).join('')+`<rect x="${x+14}" y="118" width="38" height="8" rx="3" fill="${n?'#6a4a3a':'#f1ece0'}"/>`:''}`).join('')}
        <rect x="372" y="62" width="9" height="78" fill="${SO.brick(n)}"/><rect x="462" y="62" width="9" height="78" fill="${SO.brick(n)}"/>
        <rect x="372" y="64" width="99" height="7" fill="${n?'#2e5a46':'#2f8f6a'}"/><path d="M366 64 q4 -12 20 -14 H457 q16 2 20 14 Z" fill="${n?'#2e5a46':'#2f8f6a'}"/><rect x="386" y="50" width="71" height="3" fill="#f2b630"/>
        <rect x="380" y="71" width="83" height="10" fill="${n?'#3a1f1a':'#7a2a22'}"/><text x="421" y="79" text-anchor="middle" font-size="7" ${SVGF} fill="#f4d27a">S 38TH STREET</text>
        ${person(160,n,'#2a6fa8',146)}${person(214,n,'#c98a12',146,.9)}${person(330,n,'#8e44ad',146)}${lamp(120,n)}${lamp(352,n)}</g>
        <rect y="142" width="480" height="8" fill="${HC.walk(n)}"/>`},
    so_b:{name:'Lincoln High & Lincoln Bowl',ic:'🏟️',desc:'The old brick high school and the big stadium beside it: a running track, a lot of bleachers and eighty years of Friday nights',
      art:({night:n})=>`${starsSky(n)}<path d="M0 100 Q120 88 240 96 T480 94 V140 H0 Z" fill="${HC.hill(n)}"/>
        <rect x="40" y="52" width="190" height="88" fill="${SO.brick(n)}"/><rect x="36" y="46" width="198" height="8" fill="${SO.brick2(n)}"/>
        ${[0,1,2,3,4,5].map(i=>[0,1].map(r=>`<rect x="${52+i*28}" y="${64+r*30}" width="14" height="18" fill="${win(n,(i+r)%4!==1)}"/>`).join('')).join('')}
        <rect x="104" y="30" width="62" height="30" fill="${SO.brick(n)}"/><polygon points="98,32 135,12 172,32" fill="${SO.brick2(n)}"/><circle cx="135" cy="42" r="8" fill="${n?'#f2e6b8':'#f7f1de'}"/><path d="M135 36 v6 l4 3" stroke="#333" stroke-width="1.4" fill="none"/>
        <rect x="112" y="104" width="46" height="36" fill="${n?'#241a16':'#4a3226'}"/><path d="M112 104 q23 -18 46 0" fill="${SO.stone(n)}"/>
        <rect x="66" y="84.5" width="138" height="10" fill="${n?'#1a1412':'#5a2a20'}"/><text x="135" y="92" text-anchor="middle" font-size="7" ${SVGF} fill="${n?'#d8d0c0':'#f4ecd8'}">LINCOLN HIGH SCHOOL</text>
        <path d="M252 140 V92 Q252 84 262 84 H440 Q452 84 452 94 V140 Z" fill="${SO.stone(n)}"/>
        ${[0,1,2].map(i=>`<rect x="258" y="${96+i*12}" width="188" height="6" fill="${n?'#2a2d32':['#2a6fa8','#d6402e','#f2b630'][i]}" opacity="${n?1:.8}"/>`).join('')}
        <text x="352" y="80" text-anchor="middle" font-size="8" ${SVGF} fill="${n?'#b9b2a6':'#5a5448'}">LINCOLN BOWL</text>
        ${[270,432].map(x=>`<rect x="${x}" y="30" width="3" height="56" fill="${n?'#4a4f55':'#6a7076'}"/><rect x="${x-9}" y="24" width="21" height="8" fill="${n?'#2a2d32':'#8a8f94'}"/>${n?`<rect x="${x-9}" y="24" width="21" height="8" fill="#fff6c8"/><polygon points="${x-9},32 ${x+12},32 ${x+40},140 ${x-37},140" fill="#f7f1c8" opacity=".1"/>`:''}`).join('')}
        <rect y="134" width="480" height="8" fill="${n?'#4a2e2a':'#b4543a'}"/><path d="M0 137 H480" stroke="#fff" stroke-width="1" opacity=".6"/>
        ${tree(20,n,14,134)}${person(300,n,'#c0392b',140,.9)}${person(330,n,'#2a6fa8',140,.9)}${person(392,n,'#2f8f6a',140,.9)}`},
    so_c:{name:'South End park',ic:'⚽',desc:'A neighborhood park with a worn soccer field, a picnic shelter and a standing weekend pickup game that welcomes anybody who shows up',
      art:({night:n})=>`${starsSky(n)}<path d="M0 98 Q100 86 200 94 T400 90 T480 96 V120 H0 Z" fill="${HC.hill(n)}"/>${tree(36,n,20,112)}${tree(78,n,16,112)}${tree(452,n,18,112)}
        <path d="M30 140 L90 108 H400 L460 140 Z" fill="${n?'#23462f':'#4f9a58'}"/>${[0,1,2,3].map(i=>`<path d="M${30+i*104} 140 L${90+i*78} 108 h39 L${134+i*104} 140 Z" fill="${n?'#285234':'#5aa864'}" opacity=".7"/>`).join('')}
        <path d="M60 140 L102 112 H388 L430 140 Z" stroke="#fff" stroke-width="1.4" fill="none" opacity=".75"/><path d="M245 112 V140" stroke="#fff" stroke-width="1.4" opacity=".75"/><ellipse cx="245" cy="126" rx="20" ry="7" stroke="#fff" stroke-width="1.4" fill="none" opacity=".75"/>
        ${[[96,112],[394,112]].map(([x,y])=>`<path d="M${x-9} ${y} v-16 h18 v16" stroke="#fff" stroke-width="2" fill="none"/>`).join('')}
        ${person(190,n,'#d6402e',138,.85)}${person(226,n,'#d6402e',134,.8)}${person(290,n,'#2a6fa8',138,.85)}${person(326,n,'#2a6fa8',132,.8)}${person(262,n,'#f2b630',140,.85)}<circle cx="246" cy="132" r="3" fill="#fff" stroke="#333" stroke-width=".8"/>
        <rect x="396" y="96" width="62" height="3" fill="${n?'#3a2a20':'#7a4a3a'}"/><path d="M396 96 L427 84 L458 96" fill="${n?'#4a2a20':'#b8402a'}"/><rect x="400" y="99" width="3" height="16" fill="${n?'#3e3228':'#8a6b48'}"/><rect x="451" y="99" width="3" height="16" fill="${n?'#3e3228':'#8a6b48'}"/><rect x="406" y="108" width="40" height="3" fill="${n?'#3e3228':'#8a6b48'}"/>
        <rect y="140" width="480" height="10" fill="${HC.walk(n)}"/>${lamp(40,n,150)}${lamp(446,n,150)}`},
  },
  travel:{'so_a|so_b':8,'so_a|so_c':12,'so_b|so_c':6},
  neighbors:[
    {id:'so_sophea',n:'Sophea',ic:'🥖',at:['so_a'],d:'Cambodian-American, runs the bakery on 38th that her parents started in a rented kitchen. She is in at 3 AM for the baguettes, and she saves the first warm one for whoever is standing at the door.'},
    {id:'so_coach',n:'Coach Danilo',ic:'⚽',at:['so_c','so_b'],d:'Runs the youth soccer league out of the South End park and refs the Saturday pickup game in a whistle he never blows. Everybody is “my guy,” and nobody sits on the bench for more than ten minutes.'},
  ],
  actions:(loc,d,m)=>{const a=[],at=(lo,hi)=>m>=lo&&m<hi,wk=d%7>=5;S.hoodFlags=S.hoodFlags||{};const fl=k=>S.hoodFlags[`southend_${k}_${d}`],set=k=>{S.hoodFlags[`southend_${k}_${d}`]=true};
    if(loc==='so_a'){
      const bk=rp(5),pho=rp(11),mk=rp(34);
      if(!fl('bread')) a.push({ic:'🥖',l:`Warm bread and a pastry — ${$(bk)}`,s:at(330,1080)?'15 min. Energy +9, stress −4, one meal for the fridge. Once a day. Best before 9 AM.':'The bakery runs 5:30 AM to 6 PM.',cat:'food',dis:!at(330,1080)||!canAfford(bk),
        fn:()=>{spend(bk);set('bread');S.food++;pass(15);adj('energy',9);adj('stress',-4);say(pick(['🥖 A baguette so fresh it crackles in the bag, and a coconut bun for the walk. The counter smells like toasted sugar.','🥖 Sophea hands you the heel of a loaf still too hot to hold. “Tax,” she says. You gladly pay it.','🥖 A pâté chaud and a pandan roll. You eat both before the bus stop.']))}});
      if(!fl('pho')) a.push({ic:'🍜',l:`Bowl of phở at the counter — ${$(pho)}`,s:at(600,1260)?'40 min. Energy +16, stress −8. Once a day. The broth has been going since dawn.':'The phở counter is open 10 AM to 9 PM.',cat:'food',dis:!at(600,1260)||!canAfford(pho),
        fn:()=>{spend(pho);set('pho');S.stats.meals++;pass(40);adj('energy',16);adj('stress',-8);say(pick(['🍜 Star anise, charred ginger, a pile of basil and lime on the side. You add too much sriracha and finish every drop.','🍜 The bowl comes with two kinds of steam and a pair of chopsticks you do not yet deserve. Perfect anyway.','🍜 The lunch rush is nurses, mechanics, and a grandmother who orders without looking at the menu. You take her advice and order the same.']))}});
      a.push({ic:'🧺',l:`Stock up at the Lotus market — ${$(mk)}`,s:at(480,1260)?`5 meals for the fridge (you have ${S.food}). Rice, herbs, noodles, tofu, frozen dumplings.`:'The market is open 8 AM to 9 PM.',cat:'food',cls:S.food<=1&&at(480,1260)?'primary':'',dis:!at(480,1260)||!canAfford(mk),
        fn:()=>{spend(mk);S.food+=5;pass(30);say(pick(['🧺 Jasmine rice in a bag the size of a toddler, bok choy, lemongrass, a bag of chili crisp. The cashier shows you how to pick a ripe mango.','🧺 You come for noodles and leave with five dinners and a durian you were warned about. The aunt at the register approves of everything else.','🧺 Aisle after aisle of things you can’t name yet. Five meals, and a plan to learn the rest.']))}});
      a.push({ic:'👋',l:fl('chatS')?'Say hi to Sophea again':'Chat with the bakery owner',s:'20 min. Community +2 (the first time, you meet her). Once a day.',cat:'people',dis:!!fl('chatS')||!at(330,1080),
        fn:()=>{set('chatS');pass(20);if(!S.met.so_sophea){S.met.so_sophea=d+1;S.stats.neighbors=metCount();adj('community',2);say(`👋 You wait for the line to clear and meet <b>Sophea</b>. ${NEIGHBORS.find(x=>x.id==='so_sophea').d}`)}else{adj('community',2);say('👋 Sophea tells you which regulars take which bun, and why the line is never really a line.')}}});
    }
    if(loc==='so_b'){
      a.push({ic:'🏃',l:'Walk laps on the Lincoln Bowl track',s:`45 min. ${cap(calmTxt(10))}, energy −4.`,cat:'rest',dis:!at(360,1260),
        fn:()=>{pass(45);S.stats.walks++;calm(10);adj('energy',-4);say(pick(['🏃 Four laps on the rubber track. A swim team is stretching in the infield, a cross-country kid passes you twice and says “Nice pace.” You are not sure he means it.','🏃 The bleachers go up like a canyon. Somebody has painted old team names along the wall, and somebody else keeps them touched up.','🏃 A woman power-walks with two dogs and a podcast. You fall in step, and nobody says a word for a whole mile.']))}});
      a.push({ic:'🏟️',l:'Sit in the Bowl bleachers',s:`30 min. ${cap(calmTxt(7))}.`,cat:'rest',fn:()=>{pass(30);calm(7);say(pick(['🏟️ Empty bleachers hold the day’s heat. You sit at the top, and the whole South End spreads out below you in tree-colored squares.','🏟️ A marching band practices one note and then, finally, a whole song. You decide to stay for the whole song.','🏟️ Eighty years of Friday nights soaked into the concrete. It hums, a little.']))}});
      if(!fl('watch')) a.push({ic:'🎓',l:'Watch the summer practice',s:at(960,1200)?'45 min. Energy −2, stress −6, community +1. You might meet Coach Danilo. Once a day.':'Summer practices run about 4 to 8 PM.',cat:'people',dis:!at(960,1200),
        fn:()=>{set('watch');pass(45);adj('energy',-2);adj('stress',-6);adj('community',1);let x=null;if(!S.met.so_coach){S.met.so_coach=d+1;S.stats.neighbors=metCount();adj('community',2);x=NEIGHBORS.find(y=>y.id==='so_coach')}
          say(x?`🎓 A man with a clipboard and a whistle he doesn’t use waves you over to the rail: <b>Coach Danilo</b>. ${x.d}`:pick(['🎓 Sprint drills in the late sun. A coach calls out the one kid who’s slacking, then walks over and fixes his stance.','🎓 The whole team stops to help a freshman find his contact lens. Nobody complains.']))}});
    }
    if(loc==='so_c'){
      const g=wk&&at(540,1140);
      if(!fl('game')) a.push({ic:'⚽',l:'Join the weekend pickup game',s:g?'1 hr 30 min. Energy −14, stress −13, community +2. Once a day. You might meet Coach Danilo.':wk?'The game runs 9 AM to 7 PM, Saturday and Sunday.':'The pickup game is on weekends, 9 AM to 7 PM. Today it’s just the park.',cat:'people',cls:g?'primary':'',dis:!g||S.energy<20,
        fn:()=>{set('game');pass(90);adj('energy',-14);adj('stress',-13);adj('community',2);let x=null;if(!S.met.so_coach){S.met.so_coach=d+1;S.stats.neighbors=metCount();adj('community',2);x=NEIGHBORS.find(y=>y.id==='so_coach')}
          say(x?`⚽ They need one more on the left side, and you are standing there. You touch the ball four times and get one lovely give-and-go. Afterward <b>Coach Danilo</b> shakes your hand. ${x.d}`:pick(['⚽ Teams of seven, no offside, rules renegotiated at every goal. You score on a deflection off your own knee and take full credit.','⚽ A twelve-year-old nutmegs you. The whole field rises. It is the proudest you’ve ever been to be humbled.','⚽ Two aunties on a lawn chair keep score, and the score is always a lie in their favor.']))}});
      a.push({ic:'🌳',l:'Sit under the picnic shelter',s:`30 min. ${cap(calmTxt(6))}.`,cat:'rest',fn:()=>{pass(30);calm(6);S.stats.walks++;say(pick(['🌳 Shade, a breeze and somebody’s radio tuned to a cumbia station. Kids retrieve a ball from your feet and do not apologize.','🌳 A family unpacks a feast onto three pushed-together tables. You are not invited. You are offered a skewer anyway.','🌳 The field goes quiet between games. A sprinkler ticks across the far goal.']))}});
      if(!fl('share')) a.push({ic:'🍉',l:'Share a watermelon with the sidelines',s:'20 min. Community +2, stress −4, energy +3. Once a day.',cat:'people',fn:()=>{set('share');pass(20);adj('community',2);adj('stress',-4);adj('energy',3);say(pick(['🍉 Somebody’s uncle cuts a watermelon on the hood of a sedan and passes slices down the sideline. You get the middle. Nobody explains the rules of this, either.','🍉 Orange slices, salted cucumbers and a cooler of Jarritos change hands. You trade a story about your commute for a recipe.']))}});
    }
    return a},
});
// ---- events ----
const soDay=()=>day()%7;
defEvent({id:'so_bread_6am',hook:'arrive',tile:['🥖','Bread at six','good'],chance:0.45,max:1,cond:c=>!isGrow()&&hoodOf(c.at)==='southend'&&c.at==='so_a'&&tod()>=330&&tod()<480,
  run:()=>{adj('energy',7);adj('stress',-4);const m=stMet('so_sophea');say(`🥖 The whole block smells like a bakery at six in the morning: yeast, butter, toasted coconut. A rack of baguettes is coming out the back door still crackling. ${m?`You meet <b>Sophea</b> as she carries it past. ${stNb('so_sophea').d}`:'Sophea nods and hands you the heel of a loaf.'} Energy +7.`)}});
defEvent({id:'so_night_market',hook:'arrive',tile:['🏮','Summer night market','good'],chance:0.5,max:1,cond:c=>!isGrow()&&hoodOf(c.at)==='southend'&&c.at==='so_a'&&[4,5].includes(soDay())&&tod()>=1080&&tod()<1320,
  run:()=>{const c=rp(8),ok=canAfford(c);if(ok)spend(c);adj('stress',-9);adj('community',3);adj('energy',ok?6:0);say(`🏮 It is the summer night market: string lights over S 38th, grills on every curb, a lion-drum thump somewhere out of sight. Skewers, sticky rice, mango and a line for fried bananas that wraps the block. ${ok?`You spend ${$(c)} and leave with a paper bag and a satisfied heart.`:'You are out of cash, and a vendor hands you a free sample anyway.'}`)}});
defEvent({id:'so_lion_dance',hook:'arrive',tile:['🦁','Lion-dance practice','good'],chance:0.35,max:1,cond:c=>!isGrow()&&hoodOf(c.at)==='southend'&&['so_a','so_b'].includes(c.at)&&tod()>=1020&&tod()<1200,
  run:()=>{adj('stress',-5);adj('community',2);say('🦁 A drum, a gong and a pair of cymbals go off behind the market and a dozen teenagers in sneakers rehearse their lion-dance routine on the sidewalk. The lion’s head is red and gold and two feet wide, and the kid inside it flirts with a lamppost. You clap when they land the jump.')}});
defEvent({id:'so_pickup_kids',hook:'arrive',tile:['⚽','Kids need a ringer','good'],chance:0.4,max:1,cond:c=>!isGrow()&&hoodOf(c.at)==='southend'&&c.at==='so_c'&&soDay()>=5&&tod()>=540&&tod()<1140,
  run:()=>{adj('community',2);adj('stress',-4);const m=stMet('so_coach');say(`⚽ A gang of eight-year-olds in oversized jerseys spots you and decides you are goalie. ${m?`<b>Coach Danilo</b> laughs from the sideline. ${stNb('so_coach').d}`:'Coach Danilo laughs from the sideline.'} You let in six goals and save one, and the one is a national holiday.`)}});
defEvent({id:'so_friday_lights',hook:'arrive',tile:['💡','The Bowl lights up','good'],chance:0.3,max:1,cond:c=>!isGrow()&&hoodOf(c.at)==='southend'&&c.at==='so_b'&&tod()>=1140&&tod()<1320,
  run:()=>{adj('stress',-6);adj('community',1);say('💡 The big light towers at Lincoln Bowl flicker on for a summer scrimmage. A drumline tests one cadence, then another. The sky goes violet over the bleachers and the whole neighborhood seems to lean in.')}});
