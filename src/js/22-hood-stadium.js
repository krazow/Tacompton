// ============================================================
//  TACOMPTON, neighborhood pack: Stadium District (north of Hilltop, a 14-minute walk).
//  Wright Park and the Seymour Conservatory, the Tacoma Ave storefronts (invented) and the view of Stadium High School's
//  castle over Commencement Bay. Prefix st_. Registers itself with defHood() (20-world.js).
// ============================================================
(function(){
const KEY='stadium';
const HF=()=>(S.hoodFlags=S.hoodFlags||{});
const once=k=>!!HF()[`${KEY}_${k}_${day()}`], mark=k=>{HF()[`${KEY}_${k}_${day()}`]=true};
const roof=(n,x,y,w,h,c)=>`<polygon points="${x},${y} ${x+w/2},${y-h} ${x+w},${y}" fill="${c}"/>`;
const slate=n=>n?'#2c3644':'#56657a', brick=n=>n?'#40251f':'#a8553f', stone=n=>n?'#5a5a60':'#e3d9c3';

defHood({
  key:KEY, name:'Stadium District', ic:'🏰', blurb:'A shady, brick-and-turret neighborhood just north of Hilltop, with an old glass conservatory, a row of little shops and a school that looks like a castle.',
  hub:'st_shops', ride:{via:'🚶 Walk', mins:14, fare:0},
  places:{
    st_park:{name:'Wright Park & Seymour Conservatory',ic:'🌳',desc:'A big old park of towering trees, a duck pond and paths, with the Victorian glass dome of the W.W. Seymour Botanical Conservatory in the middle',
      art:({night:n})=>`${starsSky(n)}
        <rect y="100" width="480" height="40" fill="${n?'#1a2a22':'#6f9a74'}"/>
        ${tree(40,n,26,140)}${tree(94,n,22,140)}${tree(430,n,28,140)}${tree(384,n,22,140)}
        <rect x="150" y="104" width="180" height="36" fill="${n?'#d6d0b8':'#f2f6f4'}" opacity="${n?.18:.9}"/>
        <g>
          <rect x="146" y="102" width="188" height="38" fill="${n?'#2a3a3c':'#cfe5e2'}" opacity="${n?.9:.85}"/>
          <path d="M146 102 Q146 80 176 80 H304 Q334 80 334 102 Z" fill="${n?'#33484a':'#bfdad6'}"/>
          <path d="M196 80 Q196 40 240 36 Q284 40 284 80 Z" fill="${n?'#3a5558':'#d5ece8'}"/>
          <path d="M240 36 V26 M236 28 H244" stroke="${n?'#889':'#5a6a66'}" stroke-width="2"/><circle cx="240" cy="25" r="2.5" fill="${n?'#f7d77a':'#c8a03a'}"/>
          ${[0,1,2,3,4,5,6,7].map(i=>`<path d="M${204+i*10} 80 Q${204+i*10} 46 240 36" stroke="${n?'#6d8a88':'#7fa6a0'}" stroke-width="1" fill="none"/>`).join('')}
          <path d="M196 62 H284 M200 50 H280" stroke="${n?'#6d8a88':'#7fa6a0'}" stroke-width="1"/>
          ${[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].map(i=>`<path d="M${150+i*12} 82 V140" stroke="${n?'#6d8a88':'#7fa6a0'}" stroke-width="1"/>`).join('')}
          <path d="M146 100 H334 M146 120 H334" stroke="${n?'#6d8a88':'#7fa6a0'}" stroke-width="1"/>
          <rect x="146" y="98" width="188" height="3" fill="${n?'#4a5a5a':'#e8f0ee'}"/>
          ${n?`<rect x="196" y="82" width="88" height="58" fill="#f7d77a" opacity=".22"/><ellipse cx="240" cy="70" rx="30" ry="26" fill="#f7d77a" opacity=".2"/>`:''}
          <rect x="228" y="116" width="24" height="24" fill="${n?'#1e2a2a':'#4a6a60'}"/>
        </g>
        <text x="240" y="152" text-anchor="middle" font-size="6.5" ${SVGF} fill="${n?'#8a9a96':'#2f4a44'}" opacity=".0">SEYMOUR</text>
        <rect x="170" y="130" width="140" height="4" fill="${n?'#3a3c3a':'#cfc7b2'}" opacity="0"/>
        <path d="M0 146 Q140 134 240 142 T480 140" stroke="${n?'#3a3c3a':'#cdc5b0'}" stroke-width="6" fill="none"/>
        ${person(120,n,'#c0392b',146,.9)}${person(138,n,'#2a6fa8',146,.9)}${person(400,n,'#c98a12',146,.9)}${lamp(344,n,146)}`},
    st_shops:{name:'Tacoma Ave storefronts',ic:'📚',desc:'A short block of old brick storefronts near N 1st St: a café, a bookshop and a flower stall, all with awnings and all invented',
      hours:d=>d%7<5?[420,1080]:[480,1020],
      art:({night:n})=>`${starsSky(n)}
        ${tree(30,n,18,140)}${tree(455,n,16,140)}
        ${[['THE SLOW POUR','#2f6b4a',54,n?'#4a2e26':'#b5654a'],['FERN & FOLIO','#7a3b6e',172,n?'#32343d':'#c9a77a'],['PETAL STALL','#c98a12',290,n?'#2e3a36':'#d9c9a0']].map(([t,c,x,w],i)=>`
          <rect x="${x}" y="${i===1?46:58}" width="112" height="${i===1?94:82}" fill="${w}"/>
          <rect x="${x-3}" y="${i===1?42:54}" width="118" height="6" fill="${n?'#2a1e1a':'#6a3f2e'}"/>
          <rect x="${x+8}" y="${i===1?52:64}" width="96" height="12" rx="2" fill="${n?'#1c1814':'#2a1e18'}"/><text x="${x+56}" y="${i===1?61.5:73.5}" text-anchor="middle" font-size="8" ${SVGF} fill="#f4e2a8">${t}</text>
          <path d="M${x} ${i===1?72:84} h112 l-6 12 h-100 z" fill="${c}"/>${[0,1,2,3,4,5,6].map(k=>`<rect x="${x+4+k*15}" y="${i===1?72:84}" width="8" height="12" fill="#fff" opacity=".28"/>`).join('')}
          <rect x="${x+8}" y="${i===1?96:106}" width="44" height="30" fill="${win(n)}"/><rect x="${x+64}" y="${i===1?96:106}" width="40" height="44" fill="${n?'#241a14':'#4a3226'}"/>
          ${i===1?`<rect x="${x+8}" y="52" width="0" height="0"/><rect x="${x+14}" y="${100}" width="10" height="22" fill="#7a3b6e" opacity=".7"/><rect x="${x+28}" y="${104}" width="9" height="18" fill="#2f6b4a" opacity=".7"/><rect x="${x+40}" y="${102}" width="8" height="20" fill="#c98a12" opacity=".7"/>`:i===0?`<circle cx="${x+30}" cy="118" r="7" fill="${n?'#7a5a3a':'#f4efe4'}"/><rect x="${x+24}" y="122" width="12" height="4" fill="#6b4430"/>`:`<circle cx="${x+18}" cy="122" r="5" fill="#e74c8c"/><circle cx="${x+30}" cy="120" r="5" fill="#f2b630"/><circle cx="${x+42}" cy="122" r="5" fill="#fff"/>`}`).join('')}
        ${person(160,n,'#2a6fa8',146,.95)}${person(410,n,'#8e44ad',146,.95)}${lamp(24,n,146)}${lamp(432,n,146)}
        <rect y="146" width="480" height="4" fill="${HC.walk(n)}"/>`},
    st_castle:{name:'View of Stadium High School',ic:'🏰',desc:'The red-brick, turreted school that looks like a French château, up on the bluff over Commencement Bay',
      art:({night:n,dusk})=>`${starsSky(n)}
        <rect y="88" width="480" height="52" fill="${HC.bay(n)}"/>${dusk&&!n?'<rect y="88" width="480" height="10" fill="#f4b183" opacity=".35"/>':''}
        <path d="M0 90 Q60 78 120 88 T240 86 T360 82 T480 88 V96 H0 Z" fill="${HC.hill2(n)}" opacity=".8"/>
        <path d="M320 110 q24 -4 48 0 M400 120 q24 -4 48 0 M350 128 q24 -4 48 0" stroke="${HC.bay2(n)}" stroke-width="2" fill="none" opacity=".7"/>
        <path d="M280 104 h60 l8 -5 h-70 z" fill="${n?'#3a3f45':'#2a6fa8'}"/><rect x="296" y="94" width="26" height="6" fill="${n?'#4a4f55':'#e8e2d4'}"/>
        <path d="M0 112 Q130 96 290 118 Q360 128 480 134 V150 H0 Z" fill="${HC.hill(n)}"/>
        <g>
          <rect x="92" y="78" width="210" height="52" fill="${brick(n)}"/>
          <rect x="92" y="76" width="210" height="4" fill="${stone(n)}"/><rect x="92" y="104" width="210" height="3" fill="${stone(n)}"/>
          ${roof(n,100,78,194,22,slate(n))}
          ${[0,1,2,3,4,5,6,7,8].map(i=>`<rect x="${100+i*22}" y="86" width="9" height="${i%2?12:14}" rx="${i%2?0:4}" fill="${win(n,i!==3&&i!==6)}"/><rect x="${100+i*22}" y="112" width="9" height="14" rx="4" fill="${win(n,i!==5)}"/>`).join('')}
          ${[0,1,2].map(i=>`<polygon points="${126+i*70},64 ${136+i*70},64 ${131+i*70},52" fill="${slate(n)}"/>`).join('')}
          <rect x="176" y="40" width="44" height="90" fill="${brick(n)}"/><rect x="176" y="62" width="44" height="3" fill="${stone(n)}"/>
          <polygon points="172,40 198,10 224,40" fill="${slate(n)}"/><rect x="197" y="4" width="2" height="8" fill="${stone(n)}"/>
          <rect x="190" y="46" width="16" height="12" rx="6" fill="${win(n)}"/><rect x="190" y="70" width="16" height="14" rx="7" fill="${win(n,true)}"/>
          <rect x="186" y="108" width="24" height="22" rx="12" fill="${n?'#1e1410':'#4a3226'}"/>
          <rect x="80" y="52" width="26" height="78" fill="${brick(n)}"/><polygon points="76,52 93,12 110,52" fill="${slate(n)}"/><rect x="88" y="60" width="10" height="12" rx="5" fill="${win(n)}"/><rect x="88" y="86" width="10" height="12" rx="5" fill="${win(n,false)}"/>
          <rect x="288" y="52" width="26" height="78" fill="${brick(n)}"/><polygon points="284,52 301,12 318,52" fill="${slate(n)}"/><rect x="296" y="60" width="10" height="12" rx="5" fill="${win(n,false)}"/><rect x="296" y="86" width="10" height="12" rx="5" fill="${win(n)}"/>
          <rect x="82" y="104" width="22" height="3" fill="${stone(n)}"/><rect x="290" y="104" width="22" height="3" fill="${stone(n)}"/>
        </g>
        <rect x="90" y="130" width="214" height="10" fill="${n?'#2a2e2a':'#a9a898'}"/><rect x="60" y="138" width="270" height="12" fill="${n?'#1c2c22':'#5b7d68'}"/>
        ${tree(40,n,22,142)}${tree(350,n,20,146)}${tree(440,n,24,148)}
        ${person(150,n,'#c0392b',146,.9)}${person(168,n,'#2a6fa8',146,.9)}${lamp(260,n,148)}`},
  },
  travel:{'st_park|st_shops':8,'st_park|st_castle':10,'st_shops|st_castle':6},
  neighbors:[
    {id:'st_wren',n:'Marguerite',ic:'🪴',at:['st_park'],d:'Retired botany teacher who volunteers at the conservatory and knows every fern by first name. Carries a spray bottle in her tote bag, just in case a plant looks thirsty in public.'},
    {id:'st_odalys',n:'Odalys',ic:'📖',at:['st_shops','st_castle'],d:'Owns Fern & Folio, the little bookshop with a cat named Comma and a staff-picks shelf that is mostly one person’s opinions. Walks the bluff by the school every evening to “clear her head,” and talks to everyone she passes.'},
  ],
  actions:(loc,d,m)=>{const a=[],at=(lo,hi)=>m>=lo&&m<hi;
    if(loc==='st_park'){
      const open=at(600,960);
      a.push({ic:'🌳',l:'Walk the paths under the big trees',s:`30 min. ${cap(calmTxt(7))}.`,cat:'rest',fn:()=>{pass(30);S.stats.walks++;calm(7);say(pick(['🌳 Trees older than the city’s paved streets, a duck pond, and a man doing slow tai chi beside the water. Nobody hurries here.','🌳 Chestnuts, maples and one enormous beech whose bark is carved with a century of initials. The shade is ten degrees cooler.','🌳 Squirrels the size of house cats, a toddler chasing a pigeon, a woman reading on a bench with her shoes off. You do the same.']))}});
      a.push({ic:'🏛️',l:'Wander through the conservatory',s:open?`40 min. ${cap(calmTxt(12))}. A donation jar, but no price.`:'The Seymour Conservatory is open about 10 AM to 4 PM.',cat:'here',dis:!open,
        fn:()=>{pass(40);calm(12);S.stats.walks++;const x=!S.met.st_wren;if(x){S.met.st_wren=d+1;S.stats.neighbors=metCount();adj('community',2)}
          say('🏛️ Under the old glass dome it is warm and green and smells like wet earth: palms, orchids, a fig, a lily pond with a drowsy koi. Rain or shine, it is always a summer morning in here.'+(x?` A volunteer with a spray bottle falls into step beside you: <b>Marguerite</b>. ${stNb('st_wren').d}`:' Marguerite waves from behind a fern.'))}});
      if(!once('picnic')){const c=rp(9);a.push({ic:'🧺',l:`Picnic on the lawn, with takeout — ${$(c)}`,s:canAfford(c)?'1 hour. Energy +10, stress −8, community +1. Once a day.':'Not enough cash for a picnic.',cat:'food',dis:!canAfford(c),
        fn:()=>{spend(c);mark('picnic');pass(60);adj('energy',10);adj('stress',-8);adj('community',1);S.stats.meals++;say(pick(['🧺 A sandwich, a peach and a blanket on the grass. A frisbee lands near you; you toss it back. A kid says “thanks, lady,” and that’s the whole conversation, and it’s great.','🧺 Lunch on the lawn with the glass dome gleaming over your shoulder. A dog sniffs your sandwich with the respect it deserves, then moves on.']))}})}
    }
    if(loc==='st_shops'){
      const open=isOpen('st_shops');
      if(!once('coffee')){const c=rp(7);a.push({ic:'☕',l:`A latte and a pastry at The Slow Pour — ${$(c)}`,s:open?(canAfford(c)?'30 min. Energy +9, stress −5. Once a day.':'Not enough cash.'):hoursTxt('st_shops'),cat:'food',dis:!open||!canAfford(c),
        fn:()=>{spend(c);mark('coffee');pass(30);adj('energy',9);adj('stress',-5);say(pick(['☕ A cardamom bun and a latte with a leaf on top, at a window table. The barista, wearing a very serious apron, asks if you want the “good” napkin. You do.','☕ The pastry case has a handwritten sign: “ask about the plum thing.” You ask. It’s a good plum thing.']))}})}
      const b=rp(12);a.push({ic:'📖',l:`Browse Fern & Folio and buy a used paperback — ${$(b)}`,s:open?(canAfford(b)?`45 min. ${cap(calmTxt(9))}.`:'Not enough cash.'):hoursTxt('st_shops'),cat:'here',dis:!open||!canAfford(b),
        fn:()=>{spend(b);pass(45);calm(9);const x=!S.met.st_odalys;if(x){S.met.st_odalys=d+1;S.stats.neighbors=metCount();adj('community',2)}
          say('📖 Creaky floors, a ladder on a rail, a shop cat asleep on the poetry. You leave with a paperback with someone else’s pencil notes in the margins.'+(x?` The owner looks up from the register: <b>Odalys</b>. ${stNb('st_odalys').d}`:' Odalys tells you what she’s reading and why you’ll hate the ending. Gently.'))}});
    }
    if(loc==='st_castle'){
      a.push({ic:'🏰',l:'Gaze up at the castle and read the plaque',s:`30 min. ${cap(calmTxt(9))}.`,cat:'here',fn:()=>{pass(30);calm(9);say(pick(['🏰 Turrets, steep slate roofs, a tower with a pointed cap. It looks like a French château because it was built as one: a grand hotel in the 1890s, then a school. Kids here have a castle for a hallway.','🏰 The plaque says the building burned in 1898 and sat empty for years before Tacoma turned the shell into a high school. A teenager on the lawn says, “Yeah, we know. It’s our whole personality.”']))}});
      if(!once('sunset')){const ss=sunsetOn(d),ok=at(ss-50,ss+20);a.push({ic:'🌇',l:'Watch the light go over the bay from the bluff',s:ok?`Sunset ${fmt(ss)}. 45 min. Stress −16, community +1. Once a day.`:m<ss?`Sunset ${fmt(ss)}. Best from ${fmt(ss-50)}.`:`Sunset was ${fmt(ss)}.`,cat:'rest',cls:ok?'primary':'',dis:!ok,
        fn:()=>{mark('sunset');pass(45);adj('stress',-16);adj('community',1);const x=!S.met.st_odalys&&Math.random()<.4;if(x){S.met.st_odalys=d+1;S.stats.neighbors=metCount();adj('community',2)}
          say(pick(['🌇 The brick glows the color of a ripe apricot and the bay turns to hammered brass. A trumpet from somewhere in the bowl plays three notes and stops, as if to say, that’s enough.','🌇 The turrets go gold, then rose, then black against a violet sky. The port lights wink on below, one by one.'])+(x?` A woman walking the bluff stops to say hello: <b>Odalys</b>. ${stNb('st_odalys').d}`:''))}})}
    }
    return a;
  },
});

defEvent({id:'stadium_picnic',hook:'arrive',tile:['🧺','A picnic in Wright Park','good'],chance:0.4,max:2,cooldown:2,cond:c=>!isGrow()&&hoodOf(c.at)==='stadium'&&c.at==='st_park'&&daytime(),
  run:()=>{pass(20);adj('stress',-6);adj('community',2);say('🧺 A birthday picnic under the big beech tree waves you over: a card table of potluck, a bubble machine, a cake shaped like a frog. “We have way too much food,” says the host. “Please.” You have a deviled egg and a paper cup of lemonade, and sing along to the second verse.')}});
defEvent({id:'stadium_plantsale',hook:'arrive',tile:['🪴','Conservatory plant sale','good'],chance:0.3,max:1,cond:c=>!isGrow()&&hoodOf(c.at)==='stadium'&&c.at==='st_park'&&tod()>=600&&tod()<960,
  run:()=>{const c=rp(6);if(canAfford(c)){spend(c);adj('stress',-5);adj('community',2);say(`🪴 Folding tables outside the conservatory: succulents, ferns, tomato starts, a wobbly tower of pothos cuttings. The volunteers’ sign says “Every plant here wants to go home with someone.” You pick a small jade plant for ${$(c)}. Your windowsill is going to look so smart.`)}
    else{adj('stress',-2);say('🪴 A plant sale outside the conservatory: ferns, succulents, tomato starts. You can’t spare a dollar this week, but a volunteer slips a pothos cutting into your hand anyway. “Stick it in water,” she says. “It’s tough. Like you.”')}}});
defEvent({id:'stadium_band',hook:'arrive',tile:['🎺','The band practices','good'],chance:0.4,max:2,cooldown:2,cond:c=>!isGrow()&&hoodOf(c.at)==='stadium'&&c.at==='st_castle'&&tod()>=900&&tod()<1200,
  run:()=>{adj('stress',-5);adj('community',1);say('🎺 The school marching band is practicing on the field below the castle: forty teenagers, one long wobbly tuba note, a drum major shouting “again from bar twelve!” By the fifth try it clicks and the whole bluff seems to straighten up. A couple walking dogs applauds. The band bows, then groans, then starts bar twelve again.')}});
defEvent({id:'stadium_wedding',hook:'arrive',tile:['📸','A wedding photo shoot','good'],chance:0.3,max:1,cond:c=>!isGrow()&&hoodOf(c.at)==='stadium'&&c.at==='st_castle'&&tod()>=600&&tod()<1080,
  run:()=>{pass(15);adj('stress',-5);adj('community',2);say('📸 A bride in a cloud of ivory tulle and a groom in a very warm suit are posing in front of the turrets while a photographer climbs a bench for a better angle. “Could you hold this?” she asks, and hands you a veil corner so the wind won’t take it. Click. They thank you, and you know you’re in the background of somebody’s album forever.')}});
})();
