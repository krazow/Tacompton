// ============================================================
//  TACOMPTON: neighborhood pack, Downtown & the Dome District.
//  Ride the T Line down from Hilltop: Pacific Avenue's old brick warehouses and Union Station, the Tacoma Dome, and the
//  Museum of Glass across the Bridge of Glass. Businesses and people here are made up.
// ============================================================

// ---- art helpers (dt = downtown) ----
const dtBrick=n=>n?'#3d2420':'#9c4b39', dtBrickDk=n=>n?'#2b1a17':'#7a382b';
const dtArch=(x,y,w,h,fill)=>`<path d="M${x} ${y+h} V${y+w/2} A${w/2} ${w/2} 0 0 1 ${x+w} ${y+w/2} V${y+h} Z" fill="${fill}"/>`;
// a figure with a horn
const dtHornist=(x,n,b=146)=>`${person(x,n,'#6a3d8f',b)}<path d="M${x+4} ${b-14} l9 -3 l0 6 z" fill="#e0b030"/><rect x="${x+13}" y="${b-3}" width="14" height="3" fill="${n?'#3a2e20':'#6b4a2a'}"/>`;

// Pacific Ave: warehouses on the left, Union Station's copper dome on the right, the T Line out front
const dtPacificArt=({night:n})=>{
  const stone=n?'#4a4136':'#cdb08a',stoneDk=n?'#352e26':'#a98d68',cu=n?'#2c4a42':'#6aa58f',cuDk=n?'#223a34':'#4f8a75';
  const w1=[0,1,2].map(r=>[0,1,2,3,4].map(c=>dtArch(46+c*28,62+r*26,16,20,win(n,(r*3+c*2)%5!==2))).join('')).join('');
  return `${starsSky(n)}${wire(n,64)}
  <rect x="34" y="40" width="156" height="106" fill="${dtBrick(n)}"/><rect x="30" y="34" width="164" height="8" fill="${dtBrickDk(n)}"/>
  ${[0,1,2].map(r=>`<rect x="34" y="${84+r*26-2}" width="156" height="2" fill="${dtBrickDk(n)}" opacity=".6"/>`).join('')}${w1}
  <rect x="64" y="118" width="26" height="28" fill="${n?'#241512':'#3f2a22'}"/><rect x="130" y="112" width="40" height="34" fill="${win(n)}"/><rect x="130" y="108" width="40" height="5" fill="${dtBrickDk(n)}"/>
  <rect x="52" y="45" width="120" height="13" rx="1" fill="${n?'#4a3a30':'#d8c19a'}" opacity=".85"/><text x="112" y="55" text-anchor="middle" font-size="7" ${SVGF} fill="${n?'#7a6a60':'#7a3a2a'}">FEED &amp; GRAIN CO.</text>
  <rect x="196" y="78" width="54" height="68" fill="${n?'#33241f':'#88432f'}"/>${[0,1].map(r=>[0,1].map(c=>dtArch(203+c*22,86+r*28,14,20,win(n,(r+c)%2===0))).join('')).join('')}
  <rect x="262" y="82" width="140" height="64" fill="${stone}"/><rect x="258" y="76" width="148" height="8" fill="${stoneDk}"/>
  <rect x="304" y="62" width="52" height="16" fill="${stone}"/><path d="M302 62 A28 28 0 0 1 358 62 Z" fill="${cu}"/><path d="M330 34 A28 28 0 0 1 358 62 H330 Z" fill="${cuDk}" opacity=".5"/>
  <rect x="327" y="26" width="6" height="9" fill="${cuDk}"/><path d="M326 26 L330 18 L334 26 Z" fill="${cu}"/>${[0,1,2,3].map(i=>dtArch(309+i*12,64,7,12,win(n,i!==2))).join('')}
  ${dtArch(272,96,22,50,win(n,true))}${dtArch(366,96,22,50,win(n,true))}
  ${dtArch(310,92,40,54,n?'#f5e7b8':'#f3ead4')}
  <ellipse cx="330" cy="114" rx="9" ry="12" fill="#e8742a"/><ellipse cx="322" cy="124" rx="6" ry="9" fill="#1f8fc0"/><ellipse cx="338" cy="122" rx="6" ry="10" fill="#f2c230"/><ellipse cx="330" cy="130" rx="7" ry="8" fill="#2f9f6a"/><ellipse cx="330" cy="104" rx="5" ry="6" fill="#c0392b"/>
  <rect x="294" y="84" width="72" height="9" fill="${n?'#2a2f36':'#3a3f46'}"/><text x="330" y="91.5" text-anchor="middle" font-size="6" ${SVGF} fill="#f4d27a">UNION STATION</text>
  ${lamp(168,n,148)}${lamp(412,n,148)}
  <rect x="0" y="146" width="480" height="4" fill="${HC.walk(n)}"/>${dtHornist(212,n,146)}${person(250,n,'#2f8f6a',146,.9)}${person(278,n,'#c98a12',146,.95)}${person(420,n,'#24507a',146)}`;
};

// the Tacoma Dome: a low wooden geodesic dome on a plaza, banners and a crowd
const dtDomeArt=({night:n})=>{
  const wood=n?'#5e4630':'#c49a62',woodDk=n?'#46331f':'#9d7743',line=n?'#8a6c44':'#7a5a30';
  const cx=240,by=128,rx=176,ry=80;
  const diag=Array.from({length:18},(_,i)=>`<path d="M${cx-rx+i*24} ${by} L${cx-rx+i*24+60} ${by-ry}" /><path d="M${cx-rx+i*24+60} ${by} L${cx-rx+i*24} ${by-ry}" />`).join('');
  const lat=[0.28,0.52,0.74,0.9].map(t=>`<path d="M${cx-rx-4} ${by-ry*t} H${cx+rx+4}"/>`).join('');
  const beams=n?`<polygon points="150,126 170,126 300,8 262,8" fill="#f7d77a" opacity=".12"/><polygon points="330,126 310,126 190,6 226,6" fill="#e86aa8" opacity=".12"/><polygon points="240,100 252,100 400,12 360,10" fill="#6ab8f0" opacity=".1"/>`:'';
  return `${starsSky(n)}${beams}
  <defs><clipPath id="dtDomeClip"><path d="M${cx-rx} ${by} A${rx} ${ry} 0 0 1 ${cx+rx} ${by} Z"/></clipPath></defs>
  <path d="M${cx-rx} ${by} A${rx} ${ry} 0 0 1 ${cx+rx} ${by} Z" fill="${wood}"/>
  <g clip-path="url(#dtDomeClip)" stroke="${line}" stroke-width="1.2" fill="none" opacity=".8">${diag}${lat}</g>
  <path d="M${cx-rx} ${by} A${rx} ${ry} 0 0 1 ${cx+rx} ${by}" stroke="${woodDk}" stroke-width="3" fill="none"/>
  <path d="M${cx-60} ${by-ry+4} A70 22 0 0 1 ${cx+60} ${by-ry+4}" stroke="#fff" stroke-width="3" fill="none" opacity="${n?.05:.18}"/>
  <rect x="${cx-rx-4}" y="${by-2}" width="${2*rx+8}" height="14" fill="${n?'#3a3a3a':'#8e8a80'}"/>
  ${Array.from({length:14},(_,i)=>`<rect x="${72+i*26}" y="${by+1}" width="14" height="9" fill="${win(n,i%4!==1)}" opacity=".9"/>`).join('')}
  <rect x="180" y="112" width="120" height="22" rx="3" fill="${n?'#14181e':'#1f2a36'}"/><text x="240" y="123" text-anchor="middle" font-size="9" ${SVGF} fill="#f7d77a">TACOMA DOME</text><text x="240" y="131" text-anchor="middle" font-size="5.5" ${SVGF} fill="${n?'#8fe0b0':'#8fd0a8'}">TONIGHT · LIVE · ALL AGES</text>
  ${[52,428].map(x=>`<rect x="${x}" y="88" width="2.5" height="56" fill="${n?'#555':'#666'}"/><path d="M${x+2.5} 90 h16 l-4 5 l4 5 h-16 z" fill="#c0392b"/><path d="M${x+2.5} 104 h16 l-4 5 l4 5 h-16 z" fill="#2a6fa8"/>`).join('')}
  <rect x="0" y="140" width="480" height="10" fill="${n?'#33363a':'#8a8e92'}"/><path d="M0 146 H480" stroke="#fff" stroke-width="1" stroke-dasharray="10 12" opacity=".35"/>
  ${[[100,'#c0392b'],[122,'#2f8f6a'],[146,'#f2b630'],[330,'#8e44ad'],[352,'#2a6fa8'],[376,'#e3642e'],[398,'#c0392b']].map(([x,c],i)=>person(x,n,c,146,.85+i%3*.06)).join('')}
  ${lamp(70,n,146)}${lamp(400,n,146)}`;
};

// the Museum of Glass: the tilted cone, the Bridge of Glass over the road, crystal towers, Rainier beyond the waterway
const dtGlassArt=({night:n})=>{
  const steel=n?'#4a5360':'#c5ccd3',steelDk=n?'#363e48':'#98a2ad';
  const road=n?'#2a2c30':'#6a6e72';
  const tower=(x,c1,c2,h=44)=>`<g><polygon points="${x},${96-h} ${x+8},${96-h-8} ${x+16},${96-h} ${x+16},96 ${x},96" fill="${c1}" opacity=".85"/><polygon points="${x+8},${96-h-8} ${x+16},${96-h} ${x+16},96 ${x+8},96" fill="${c2}" opacity=".7"/>${n?`<ellipse cx="${x+8}" cy="${96-h/2}" rx="14" ry="${h/2}" fill="${c1}" opacity=".14"/>`:''}</g>`;
  return `${starsSky(n)}${rainier(n,96,.66,104)}
  <rect y="100" width="480" height="20" fill="${HC.bay(n)}"/><path d="M30 108 q24 -3 48 0 M320 112 q24 -3 48 0 M200 106 q20 -3 40 0" stroke="${HC.bay2(n)}" stroke-width="1.6" fill="none" opacity=".7"/>
  <rect y="120" width="480" height="26" fill="${road}"/><path d="M0 134 H250" stroke="#f2d04a" stroke-width="1.4" stroke-dasharray="14 10" opacity=".7"/>
  <rect x="${n?'60':'60'}" y="126" width="16" height="7" rx="2" fill="${n?'#7a2a2a':'#c0392b'}"/><rect x="150" y="136" width="16" height="7" rx="2" fill="${n?'#2a3f6a':'#2a6fa8'}"/>
  <rect x="0" y="92" width="268" height="5" fill="${n?'#7d838a':'#d9dde0'}"/><rect x="0" y="87" width="268" height="1.6" fill="${n?'#7d838a':'#b9bfc3'}"/>${[28,100,172,244].map(x=>`<rect x="${x}" y="97" width="5" height="49" fill="${n?'#5a6066':'#9aa0a5'}"/>`).join('')}
  ${tower(48,'#1f8fc0','#14608a',46)}${tower(112,'#e8742a','#b0501a',38)}${tower(176,'#f2c230','#c39a1a',42)}${tower(222,'#8e44ad','#5e2a80',34)}
  <rect x="268" y="104" width="172" height="42" fill="${n?'#3a4048':'#e3e6e7'}"/><rect x="264" y="100" width="180" height="5" fill="${n?'#2a3038':'#9aa6ae'}"/>
  <rect x="280" y="116" width="40" height="22" fill="${win(n)}"/><rect x="396" y="116" width="32" height="22" fill="${win(n)}"/><rect x="336" y="122" width="22" height="24" fill="${n?'#1e2a36':'#3a5a74'}"/>
  <polygon points="318,104 382,104 340,34 296,38" fill="${steel}"/><polygon points="340,34 382,104 360,104 322,36" fill="${steelDk}" opacity=".55"/><polygon points="296,38 318,104 326,104 300,40" fill="#fff" opacity="${n?.05:.3}"/>
  <ellipse cx="318" cy="36" rx="23" ry="5" fill="${n?'#f08a2a':'#2a2f36'}"/>${n?'<ellipse cx="318" cy="34" rx="30" ry="12" fill="#f08a2a" opacity=".22"/>':''}
  <rect x="300" y="108" width="80" height="9" fill="${n?'#14181e':'#2a3a4a'}"/><text x="340" y="115" text-anchor="middle" font-size="6" ${SVGF} fill="#f4d27a">MUSEUM OF GLASS</text>
  ${tree(458,n,12,146)}${lamp(262,n,148)}${lamp(436,n,148)}<rect y="146" width="480" height="4" fill="${HC.walk(n)}"/>
  ${person(382,n,'#c0392b',146)}${person(404,n,'#2f8f6a',146,.9)}${person(150,n,'#2a6fa8',92,.7)}${person(210,n,'#c98a12',92,.7)}`;
};

// ---- Once-a-day / once-a-game flags ----
const dtFlag=(k,d)=>{S.hoodFlags=S.hoodFlags||{};return !!S.hoodFlags[`downtown_${k}_${d}`]};
const dtSet=(k,d)=>{S.hoodFlags=S.hoodFlags||{};S.hoodFlags[`downtown_${k}_${d}`]=true};
const dtMeet=(id,d)=>{if(S.met[id])return false;S.met[id]=d+1;S.stats.neighbors=metCount();adj('community',2);return true};
const dtNb=id=>NEIGHBORS.find(x=>x.id===id);
// the Dome's show nights: Friday and Saturday (day index % 7 = 4 or 5), doors at 7 PM, home by 11
const dtShowNight=d=>[4,5].includes(((d%7)+7)%7);
const dtMuseumOpen=d=>((d%7)+7)%7>=2;   // Wednesday to Sunday

defHood({
  key:'downtown', name:'Downtown & the Dome District', ic:'🏛️',
  blurb:'Old brick warehouses turned classrooms, a copper dome full of colored glass, a wooden dome the size of a hill, and a footbridge that glows. Downtown Tacoma is Hilltop’s big sibling, and it’s a short train ride down the slope.',
  hub:'dt_pacific', ride:{via:'🚈 Link', mins:12, fare:0},
  places:{
    dt_pacific:{name:'Pacific Avenue & Union Station', ic:'🚈',
      desc:'Brick warehouses turned classrooms and cafés, the T Line down the middle, and Union Station’s copper dome, with a glass chandelier of orange, blue and gold glowing in the big window',
      art:dtPacificArt},
    dt_dome:{name:'The Tacoma Dome', ic:'🏟️',
      desc:'A huge wooden geodesic dome by the freeway: concerts, hockey, monster trucks and graduations. Everybody in Tacoma has been inside it at least once',
      art:dtDomeArt},
    dt_glass:{name:'Museum of Glass & Bridge of Glass', ic:'🔮',
      desc:'A tilted steel cone over the waterway where glassblowers work a furnace in public, and the footbridge over the freeway with towers of colored glass. Museum open Wednesday to Sunday, 10 AM to 5 PM',
      hours:d=>dtMuseumOpen(d)?[600,1020]:null,
      art:dtGlassArt},
  },
  travel:{'dt_pacific|dt_glass':6,'dt_pacific|dt_dome':11,'dt_glass|dt_dome':14},
  neighbors:[
    {id:'dt_walt', n:'Booker', ic:'🎺', at:['dt_pacific','dt_dome'], d:'Sixty-eight, a retired stagehand who spent thirty years pushing road cases into the Dome. Plays trumpet on Pacific Avenue most afternoons, mostly Motown, and can tell you which band was loudest and which one tipped the crew best.'},
    {id:'dt_calla', n:'Calla', ic:'🔥', at:['dt_glass'], d:'A glassblower on the Hot Shop team, with forearms like a blacksmith and a laugh you can hear over the furnace. She narrates every piece out loud to the crowd, and has never once dropped one on camera. Yet.'},
  ],
  actions:(loc,d,m)=>{const a=[],at=(lo,hi)=>m>=lo&&m<hi;
    if(loc==='dt_pacific'){
      const pl=rp(12),mk=at(660,1080);
      if(!dtFlag('horn',d)) a.push({ic:'🎺',l:'Stop for the trumpet on the corner',s:at(600,1230)?'25 min. Free (a tip is nice). Stress −10, community +2. You might meet someone. Once a day.':'Music runs 10 AM to 8:30 PM.',cat:'people',dis:!at(600,1230),
        fn:()=>{dtSet('horn',d);pass(25);calm(10);adj('community',2);const x=dtMeet('dt_walt',d);if(canAfford(rp(2)))spend(rp(2));
          say(x?`🎺 A trumpet floats down Pacific Avenue, “My Girl,” slow and warm, and you stop without deciding to. He nods at your two dollars. After the set: <b>Booker</b>. ${dtNb('dt_walt').d}`:pick(['🎺 Booker takes a request from a toddler, “Twinkle Twinkle,” and somehow makes it swing. The whole sidewalk applauds a nursery rhyme.','🎺 “Summertime,” in the shade of the old brick. A bus driver on break stands with her eyes closed. You drop two dollars in the case.','🎺 Booker waves you over, tips the horn at you like a hat, and finishes the song just for you.']))}});
      a.push({ic:'🥪',l:`A sandwich at the brick-corner deli — ${$(pl)}`,s:at(660,1200)?'30 min. Energy +15, stress −4. Pastrami on rye, in a room with ceilings made for forklifts. Once a day.':'The deli is open 11 AM to 8 PM.',cat:'food',dis:!at(660,1200)||dtFlag('deli',d)||!canAfford(pl),
        fn:()=>{dtSet('deli',d);spend(pl);S.stats.meals++;pass(30);adj('energy',15);adj('stress',-4);say(pick(['🥪 A sandwich as big as your forearm at a counter that used to be a loading dock. The pickle is a legend.','🥪 You eat by the window while students with laptops argue about a group project. Somebody wins. It’s the pastrami.','🥪 They wrap half of it for later without asking. You don’t argue.']))}});
      a.push({ic:'🧱',l:'Wander the warehouses and Union Station',s:`35 min. ${cap(calmTxt(8))}. Brick, arches and a glass chandelier in a copper-domed room.`,cat:'here',
        fn:()=>{pass(35);S.stats.walks++;calm(8);say(pick(['🧱 Old brick warehouses where the railroad once unloaded the world, now full of students with coffee. Their loading docks have outdoor seating. Tacoma recycles everything, even history.','🧱 In the copper-domed station, a glass chandelier of orange, blue and gold hangs over the lobby like a sunset somebody caught in a net. You stand under it longer than you meant to.','🧱 A freight whistle in the distance, the Link bell nearby, a kid doing chalk art on the sidewalk. You get a little lost and a little found.']))}});
    }
    if(loc==='dt_dome'){
      const tk=rp(35),show=dtShowNight(d);
      a.push({ic:'🎤',l:`A night at the Dome — ${$(tk)}`,s:show?(at(1140,1260)?'3 hours. Energy −10, stress −18, community +4. Doors at 7 PM. Once a night.':'Doors open at 7 PM tonight. Come back then.'):'Shows are Friday and Saturday nights. Check back then.',cat:'people',cls:show&&at(1140,1260)?'primary':'',dis:!show||!at(1140,1260)||dtFlag('show',d)||!canAfford(tk)||S.energy<18,
        fn:()=>{dtSet('show',d);spend(tk);pass(180);adj('energy',-10);adj('stress',-18);adj('community',4);const x=dtMeet('dt_walt',d);
          say(pick(['🎤 The lights drop and eleven thousand phones go up at once. The floor thumps under your feet and the wooden ceiling throws the sound back like a hug. You do not remember the walk to the train, only the chorus.','🎤 An opening band nobody came for wins the whole room by the third song. The headliner is good. The singing-back from the crowd is better.','🎤 Standing room, glow sticks and a stranger’s shoulders for a better view. At the encore the whole dome sings the last verse. It sounds like a very big organ.'])+(x?` In the crush on the way out, a man with a road-case sticker on his jacket grins at you: <b>Booker</b>, off-duty, who used to load this stage. ${dtNb('dt_walt').d}`:''))}});
      a.push({ic:'🚶',l:'Walk around the Dome',s:`30 min. ${cap(calmTxt(6))}. Skateboarders, food trucks and the biggest wooden roof you’ll ever see.`,cat:'here',
        fn:()=>{pass(30);S.stats.walks++;calm(6);say(pick(['🚶 You walk all the way around the base. It takes longer than you think. The wood is a thousand tidy triangles of Douglas fir, and up close you can see how every one of them fits.','🚶 A skate crew practices on the empty plaza. A food truck sells elote. The roof overhead is an enormous lid on an enormous pot, and the pot is Tacoma.','🚶 Sound-check noise leaks out of a door: one guitar chord, repeated, huge. Then a voice: “Is that better? Okay. Is that better?”']))}});
    }
    if(loc==='dt_glass'){
      const open=isOpen('dt_glass'),free=dtFlag('free',d),adm=free?0:rp(15);
      a.push({ic:'🔥',l:free?'Watch the Hot Shop — free today':`Watch the Hot Shop — ${$(adm)}`,s:open?'45 min. Stress −10, community +1. The furnace, the team, a lump of glowing glass turning into a bowl. Once a day.':'The museum is open Wednesday to Sunday, 10 AM to 5 PM.',cat:'here',cls:free&&open?'primary':'',dis:!open||dtFlag('hot',d)||!canAfford(adm),
        fn:()=>{dtSet('hot',d);if(adm)spend(adm);pass(45);adj('stress',-10);adj('community',1);const x=dtMeet('dt_calla',d);
          say((x?`🔥 Under the tilted cone, the glowing furnace lights up the whole amphitheater. A woman with a headset calls out every step to the crowd: <b>Calla</b>, who makes it look like dancing. ${dtNb('dt_calla').d}`:pick(['🔥 A gather of glowing glass on a long pipe, rolled, turned, blown. Calla calls the steps over the headset: “Now watch the color come back as it cools.” It does. Everyone gasps like it’s the first time.','🔥 Three people, one furnace, no words, just hands. A bowl appears out of orange fire in nine minutes. The kid next to you whispers “Cool.” It is, and it isn’t.','🔥 The heat hits your face from forty feet away. The team sets down a finished vase, still glowing, and the crowd claps for a piece of glass.'])))}});
      a.push({ic:'🌉',l:'Cross the Bridge of Glass',s:`25 min. Free, any hour. ${cap(calmTxt(8))}. Towers of colored glass over the freeway.`,cat:'rest',
        fn:()=>{pass(25);S.stats.walks++;calm(8);say(pick(['🌉 A footbridge over the freeway, with crystal towers of orange, blue and gold on either side that glow like lanterns. Traffic hums underneath. You feel like you’re crossing something bigger than a road.','🌉 A runner, a stroller and a couple taking an engagement photo all share the bridge. Everybody lets everybody pass. A kid presses her nose to a glass tower and says “It’s a candy.”','🌉 At the middle you can see the waterway, the museum’s cone and, on a clear day, Rainier hanging at the end of it all like a framed picture.']))}});
    }
    return a;
  },
});

// ---- events ----
const dtHere=c=>!isGrow()&&hoodOf(c.at)==='downtown';
defEvent({id:'downtown_concert_crowd',hook:'arrive',tile:['🚋','A Link full of concert fans','good'],chance:0.4,max:2,cooldown:2,
  cond:c=>dtHere(c)&&hoodOf(c.from)!=='downtown'&&dtShowNight(day())&&tod()>=1020&&tod()<1260,
  run:()=>{adj('stress',-3);adj('community',1);say('🚋 The Link car is packed with people in band shirts and sparkly jackets, all headed to the Dome. A grandmother in a vintage tour tee explains the whole discography to a stranger who is taking notes. By the last stop you know three songs you didn’t know this morning.')}});
defEvent({id:'downtown_free_museum',hook:'arrive',tile:['🎟️','Free day at the Museum of Glass','good'],chance:0.35,max:1,
  cond:c=>!isGrow()&&c.at==='dt_glass'&&dtMuseumOpen(day())&&isOpen('dt_glass'),
  run:()=>{dtSet('free',day());adj('stress',-2);say('🎟️ A sign at the door: “Free community day. Thanks, Tacoma.” The line is school groups, grandmas, and a guy in a Dome hockey jersey who has apparently never seen glass do that. Admission is on the house today.')}});
defEvent({id:'downtown_busker',hook:'arrive',tile:['🎷','A busker on Pacific','good'],chance:0.35,max:2,cooldown:2,
  cond:c=>dtHere(c)&&c.at==='dt_pacific'&&tod()>=600&&tod()<1230,
  run:()=>{adj('stress',-4);say(pick(['🎷 Somebody is playing a violin by the old brick wall, a fiddle tune that makes a pigeon walk faster. A man in a suit stops, loosens his tie and taps his foot. You do too.','🎷 A saxophone and a drum bucket, two teenagers, one song they have clearly rehearsed for hours. They are very good. They know it. They bow like it’s Carnegie Hall.']))}});
defEvent({id:'downtown_market',hook:'arrive',tile:['🍑','The farmers’ market','good'],chance:0.5,max:2,
  cond:c=>dtHere(c)&&c.at==='dt_pacific'&&((day()%7)===3)&&tod()>=600&&tod()<1080,
  run:()=>{const c=rp(8);if(canAfford(c)){spend(c);S.food++;adj('stress',-3);say(`🍑 Thursday: a row of white tents down the avenue, stone fruit stacked in pyramids, and a woman handing out samples of peach on a toothpick. You buy a basket for ${$(c)} and tuck it into your bag. Food +1.`)}else{adj('stress',-2);say('🍑 Thursday: a row of white tents down the avenue and a peach sample on a toothpick. You are broke, but the sample is free. It’s the best thing you’ve eaten all week.')}}});
defEvent({id:'downtown_soundcheck',hook:'arrive',tile:['🔊','Sound check at the Dome','info'],chance:0.4,max:2,cooldown:2,
  cond:c=>dtHere(c)&&c.at==='dt_dome'&&tod()>=840&&tod()<1140,
  run:()=>{adj('stress',-3);say('🔊 The doors are propped open and a drummer is testing every drum, one at a time, down the line. Thump. Thump. A roadie waves you in for ten seconds to “feel the room.” It feels like standing inside a heartbeat.')}});
