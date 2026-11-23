// ============================================================
//  TACOMPTON, Pierce County area pack: Parkland and Spanaway (south of Tacoma down Pacific Avenue).
//  Pacific Lutheran University (founded 1890; PLU since 1960) and Garfield Street beside it (the shops are invented),
//  Spanaway Lake Park (the county park with a swimming beach, boats to rent and a trail under old firs) and the long
//  Pacific Avenue strip in Spanaway (invented, generic). Prefix pk_. county:true (72-county.js decides when the county is
//  open to you; until then these places stay hidden).
// ============================================================
(function(){
const KEY='parkland';
const HF=()=>(S.hoodFlags=S.hoodFlags||{});
const once=k=>!!HF()[`${KEY}_${k}_${day()}`], mark=k=>{HF()[`${KEY}_${k}_${day()}`]=true};
const meet=id=>{if(S.met[id])return false;S.met[id]=day()+1;S.stats.neighbors=metCount();adj('community',2);return true};
const nb=id=>NEIGHBORS.find(x=>x.id===id);
const tick=k=>{S.stats[k]=(S.stats[k]||0)+1};
const yr=()=>typeof yearNow==='function'?yearNow():2026;
const mon=()=>{try{return S&&S.startDate&&typeof dateOf==='function'?dateOf(day()).m:8}catch(e){return 8}};
const gate=()=>{try{return typeof countyOn==='function'&&!!countyOn()}catch(e){return false}};
const term=()=>{const m=mon();return m>=9||m<=5};   // the school year at PLU

defHood({
  key:KEY, name:'Parkland & Spanaway', ic:'🎓', county:true, startable:true,
  blurb:'Two neighborhoods down Pacific Avenue south of Tacoma: a small university with a brick square and a famous choir, a college street of pizza and coffee, a big lake park under the firs and a long highway of drive-ins.',
  hub:'pk_garfield', ride:{via:'bus',mins:35,fare:2,drive:18},
  guide:'Parkland and Spanaway are south of Tacoma, straight down Pacific Avenue on the bus. Pacific Lutheran University (PLU) has a brick campus you can walk and concerts that are open to everyone; Garfield Street beside it has pizza, coffee and a used bookshop. Farther south, Spanaway Lake Park has a swimming beach in summer, boats to rent and a trail under the old firs.',
  places:{
    pk_garfield:{name:'Garfield Street',ic:'🍕',desc:'The little college street beside PLU: a pizza place, a coffee shop, a used bookshop and a diner, full of students with backpacks (the shops are invented)',
      hours:d=>[420,1320],
      art:({night:n})=>`${starsSky(n)}
        ${[['PIZZA','#b8402a',20,96],['COFFEE','#2f6b4a',126,90],['BOOKS','#7a3b6e',226,90],['DINER','#2a6fa8',326,110]].map(([t,c,x,w],i)=>`
          <rect x="${x}" y="${i%2?62:72}" width="${w}" height="${i%2?78:68}" fill="${n?['#40251f','#32343d','#2e3a36','#3a3228'][i]:['#a8553f','#d9c9a0','#c9a77a','#e9e0cf'][i]}"/>
          <rect x="${x+8}" y="${i%2?70:80}" width="${w-16}" height="12" rx="2" fill="${c}"/><text x="${x+w/2}" y="${i%2?79:89}" text-anchor="middle" font-size="8" ${SVGF} fill="#fff">${t}</text>
          <rect x="${x+8}" y="${i%2?92:100}" width="${w-38}" height="26" fill="${win(n)}"/><rect x="${x+w-24}" y="${i%2?110:112}" width="16" height="28" fill="${n?'#1a1a20':'#4a3226'}"/>`).join('')}
        <rect y="140" width="480" height="10" fill="${HC.walk(n)}"/>
        ${person(120,n,'#2a6fa8',146,.9)}<rect x="113" y="128" width="6" height="10" rx="2" fill="${n?'#444':'#f2b630'}"/>${person(300,n,'#c0392b',146,.9)}${person(316,n,'#2f8f6a',146,.9)}${lamp(220,n,146)}${tree(462,n,14,140)}`},
    pk_plu:{name:'Pacific Lutheran University',ic:'🎓',desc:'PLU’s campus: brick buildings around Red Square, big lawns under old firs, a library open to visitors and a concert hall where the university choir sings',
      art:({night:n})=>`${starsSky(n)}
        <rect y="118" width="480" height="32" fill="${n?'#3a1e1a':'#a8453a'}"/>${[0,1,2,3,4,5,6,7,8,9,10,11].map(i=>`<path d="M${i*40} 118 L${i*40+20} 150" stroke="${n?'#2a1614':'#8a3a30'}" stroke-width="1"/>`).join('')}
        <rect x="100" y="48" width="280" height="70" fill="${n?'#40251f':'#a8553f'}"/><rect x="96" y="44" width="288" height="6" fill="${n?'#5a5a60':'#e3d9c3'}"/>
        <rect x="214" y="20" width="52" height="28" fill="${n?'#40251f':'#a8553f'}"/><path d="M210 22 L240 4 L270 22 Z" fill="${n?'#2c3644':'#56657a'}"/><rect x="232" y="26" width="16" height="14" rx="7" fill="${win(n)}"/>
        ${[0,1,2,3,4,5,6,7].map(i=>`<rect x="${112+i*34}" y="58" width="14" height="20" rx="2" fill="${win(n,i!==3)}"/><rect x="${112+i*34}" y="88" width="14" height="20" rx="2" fill="${win(n,i%3!==1)}"/>`).join('')}
        <rect x="222" y="90" width="36" height="28" fill="${n?'#241614':'#4a3226'}"/>${[0,1,2,3].map(i=>`<rect x="${206+i*20}" y="84" width="6" height="34" fill="${n?'#5a5a60':'#e3d9c3'}"/>`).join('')}
        <path d="M30 140 L42 70 L54 140 Z" fill="${HC.leaf(n)}"/><path d="M420 140 L436 60 L452 140 Z" fill="${HC.leaf(n)}"/><path d="M60 140 L68 96 L76 140 Z" fill="${HC.leaf2(n)}"/>
        ${person(160,n,'#2a6fa8',146,.9)}<rect x="153" y="128" width="6" height="10" rx="2" fill="${n?'#444':'#2f8f6a'}"/>${person(330,n,'#c98a12',146,.9)}${person(346,n,'#7a3b6e',146,.9)}${lamp(390,n,146)}`},
    pk_lake:{name:'Spanaway Lake Park',ic:'🛶',desc:'The county’s big lake park in Spanaway: a swimming beach, rowboats and paddle boats to rent in summer, picnic shelters, and a trail along the shore under huge old firs',
      art:({night:n,dusk})=>`${starsSky(n)}
        ${[20,60,100,380,420,460].map((x,i)=>`<path d="M${x-14} 100 L${x} ${44+(i%2)*14} L${x+14} 100 Z" fill="${i%2?HC.leaf2(n):HC.leaf(n)}"/>`).join('')}
        <rect y="96" width="480" height="40" fill="${HC.bay(n)}"/>${dusk&&!n?'<rect y="96" width="480" height="8" fill="#f4b183" opacity=".35"/>':''}
        <path d="M120 112 q20 -3 40 0 M280 120 q20 -3 40 0" stroke="${HC.bay2(n)}" stroke-width="2" fill="none" opacity=".7"/>
        <path d="M200 112 h30 l-4 6 h-22 z" fill="${n?'#3a2a2a':'#c0392b'}"/>${person(214,n,'#2a6fa8',112,.55)}
        <path d="M300 104 h24 l-3 5 h-18 z" fill="${n?'#3a3a2a':'#f2b630'}"/><rect x="306" y="98" width="10" height="6" fill="${n?'#3a3a2a':'#2f8f6a'}"/>
        <path d="M0 150 V132 Q120 124 240 134 T480 130 V150 Z" fill="${n?'#3a3a32':'#d8c79a'}"/><path d="M0 150 V142 Q200 136 480 144 V150 Z" fill="${HC.hill(n)}"/>
        <rect x="380" y="124" width="70" height="4" fill="${n?'#3a2a22':'#8a6a4a'}"/><path d="M376 126 L415 110 L454 126" stroke="${n?'#3a2a22':'#6a4a3a'}" stroke-width="3" fill="none"/>
        ${person(140,n,'#c0392b',142,.8)}${person(156,n,'#2f8f6a',142,.65)}`},
    pk_pacific:{name:'Pacific Avenue, Spanaway',ic:'🍔',desc:'The long highway through Spanaway: a burger drive-in with a neon sign, used-car lots with flags, a hardware store, churches and the bus all the way to Tacoma (the shops are invented)',
      hours:d=>[600,1380],
      art:({night:n})=>`${n?starsSky(n):''}
        <rect y="122" width="480" height="28" fill="${HC.street(n)}"/><path d="M0 136 H480" stroke="${n?'#6a6a50':'#f1e08a'}" stroke-width="1.5" stroke-dasharray="14 10"/>
        <rect x="40" y="84" width="150" height="38" fill="${n?'#2e3038':'#f0e6d0'}"/><path d="M34 86 h162 l-8 -12 h-146 z" fill="${n?'#4a1e1a':'#c0392b'}"/><rect x="52" y="94" width="126" height="18" fill="${win(n)}"/>
        <rect x="108" y="30" width="5" height="44" fill="${n?'#555':'#888'}"/><rect x="72" y="18" width="78" height="22" rx="11" fill="${n?'#1c1012':'#fff'}" stroke="${n?'#ff5a8a':'#c0392b'}" stroke-width="3"/><text x="111" y="33" text-anchor="middle" font-size="9" ${SVGF} fill="${n?'#ff8ab0':'#c0392b'}">BURGERS</text>
        ${n?'<rect x="68" y="14" width="86" height="30" rx="14" fill="#ff5a8a" opacity=".15"/>':''}
        <path d="M230 64 L470 64" stroke="${n?'#555':'#999'}" stroke-width="1"/>${[0,1,2,3,4,5,6,7,8,9,10,11].map(i=>`<path d="M${236+i*20} 64 l6 8 l6 -8" fill="${['#c0392b','#2a6fa8','#f2b630'][i%3]}" opacity="${n?.4:1}"/>`).join('')}
        ${[[240,'#2a6fa8'],[300,'#c0392b'],[360,'#f2f2f2'],[420,'#2f8f6a']].map(([x,c])=>`<rect x="${x}" y="104" width="44" height="14" rx="4" fill="${n?'#3a3f45':c}"/><rect x="${x+8}" y="98" width="26" height="8" rx="3" fill="${n?'#2a2e34':c}"/><circle cx="${x+10}" cy="118" r="3.5" fill="#222"/><circle cx="${x+34}" cy="118" r="3.5" fill="#222"/>`).join('')}
        ${person(210,n,'#c98a12',122,.85)}${lamp(200,n,122)}`},
  },
  travel:{'pk_garfield|pk_plu':4,'pk_garfield|pk_lake':14,'pk_garfield|pk_pacific':10,'pk_plu|pk_lake':14,'pk_plu|pk_pacific':10,'pk_lake|pk_pacific':6},
  neighbors:[
    {id:'pk_ingrid',n:'Ingrid',ic:'🎶',at:['pk_plu','pk_garfield'],d:'A music student at PLU who sings in the university choir and grew up on her grandmother’s Norwegian waffles. Hums harmony under her breath in every line she stands in.'},
    {id:'pk_rocco',n:'Rocco',ic:'🍕',at:['pk_garfield'],d:'Owns the pizza place on Garfield and has fed four decades of hungry students, some of them now professors who still order the same slice. Throws in garlic knots during finals week.'},
    {id:'pk_lorna',n:'Lorna',ic:'🛶',at:['pk_lake','pk_pacific'],d:'Runs the boat rental window at Spanaway Lake every summer and drives a school bus the rest of the year. Has rescued more than one tipped canoe and never once raised her voice.'},
  ],
  actions:(loc,d,m)=>{const a=[],at=(lo,hi)=>m>=lo&&m<hi;
    if(loc==='pk_garfield'){
      const open=isOpen('pk_garfield');
      if(!once('slice')){const c=rp(6);a.push({ic:'🍕',l:`Two slices and a soda on Garfield — ${$(c)}`,s:open?(canAfford(c)?'30 min. Energy +10, stress −4. Once a day.':'Not enough cash.'):hoursTxt('pk_garfield'),cat:'food',dis:!open||!canAfford(c),
        fn:()=>{spend(c);mark('slice');pass(30);adj('energy',10);adj('stress',-4);tick('meals');const x=meet('pk_rocco');say('🍕 Thin crust, a lot of cheese and a booth carved with forty years of initials.'+(x?` The man at the oven asks if it’s your first time: <b>Rocco</b>. ${nb('pk_rocco').d}`:''))}})}
      const b=rp(5);a.push({ic:'📖',l:`Dig through the used bookshop — ${$(b)}`,s:open?(canAfford(b)?`40 min. ${cap(calmTxt(8))}.`:'Not enough cash.'):hoursTxt('pk_garfield'),cat:'here',dis:!open||!canAfford(b),
        fn:()=>{spend(b);pass(40);calm(8);say(pick(['📖 Shelves of old textbooks, paperbacks with cracked spines and a box marked FREE. You come out with a mystery and somebody’s old poetry book.','📖 A student is selling back her whole year of books and looks lighter for it. You buy a cookbook with notes in the margins.']))}});
    }
    if(loc==='pk_plu'){
      a.push({ic:'🎓',l:'Walk across the campus',s:`30 min. ${cap(calmTxt(8))}.`,cat:'rest',
        fn:()=>{pass(30);calm(8);tick('walks');say(term()?pick(['🎓 Students crossing Red Square in every direction, a frisbee over the lawn and somebody practicing the trumpet behind an open window.','🎓 The bell rings the hour, and the brick square fills and empties in five minutes like a tide.']):'🎓 A quiet summer campus: sprinklers on the lawns, a few summer students and the big firs throwing long shade.')}});
      const c=rp(10);a.push({ic:'🎶',l:`Go to a student concert — ${$(c)}`,s:term()?(at(1110,1260)?(canAfford(c)?'1½ hours. Stress −14, community +2.':'Not enough cash.'):'Evening concerts start at 7 PM.'):'Concerts are during the school year.',cat:'here',dis:!term()||!at(1110,1260)||!canAfford(c),
        fn:()=>{spend(c);pass(90);adj('stress',-14);adj('community',2);const x=meet('pk_ingrid');say('🎶 The choir sings with no instruments at all, a hundred voices in a hall with perfect sound, and at the last note nobody breathes.'+(x?` In the lobby a singer in a black robe thanks you for coming: <b>Ingrid</b>. ${nb('pk_ingrid').d}`:''))}});
    }
    if(loc==='pk_lake'){
      const summer=mon()>=6&&mon()<=8,day_=at(600,1140);
      a.push({ic:'🌲',l:'Walk the shore trail under the firs',s:`35 min. ${cap(calmTxt(9))}.`,cat:'rest',
        fn:()=>{pass(35);calm(9);tick('walks');say(pick(['🌲 Firs taller than any building in Parkland, needles soft underfoot and the lake flashing between the trunks.','🌲 Geese on the lawn, a family grilling in the shelter, kids racing to the end of the swimming dock.']))}});
      const c=rp(14);a.push({ic:'🛶',l:`Rent a rowboat for an hour — ${$(c)}`,s:summer&&day_?(canAfford(c)?'1 hour. Stress −12, energy −4.':'Not enough cash.'):'Boats rent in summer, during the day.',cat:'rest',dis:!summer||!day_||!canAfford(c),
        fn:()=>{spend(c);pass(60);adj('stress',-12);adj('energy',-4);const x=meet('pk_lorna');say('🛶 You row out to the middle and let it drift. Dragonflies, a far-off radio and the sun on your knees.'+(x?` The woman at the rental window shows you how to hold the oars first: <b>Lorna</b>. ${nb('pk_lorna').d}`:''))}});
      a.push({ic:'🏊',l:'Swim at the beach',s:summer&&day_?'40 min. Energy −4, stress −10.':'The beach is for summer days.',cat:'rest',dis:!summer||!day_,
        fn:()=>{pass(40);adj('energy',-4);adj('stress',-10);tick('swims');say('🏊 Warm on top, cold below. You swim out to the rope and back, and lie on the dock to dry.')}});
    }
    if(loc==='pk_pacific'){
      const open=isOpen('pk_pacific');
      if(!once('drivein')){const c=rp(8);a.push({ic:'🍔',l:`A burger and fries at the drive-in — ${$(c)}`,s:open?(canAfford(c)?'30 min. Energy +10, stress −3. Once a day.':'Not enough cash.'):hoursTxt('pk_pacific'),cat:'food',dis:!open||!canAfford(c),
        fn:()=>{spend(c);mark('drivein');pass(30);adj('energy',10);adj('stress',-3);tick('meals');say(pick(['🍔 A burger in paper, fries in a cardboard boat and a shake you have to work for. You eat on the hood of a stranger’s car, with permission.','🍔 The neon sign buzzes. Kids from the high school crowd the picnic tables and the cook calls numbers through a little window.']))}})}
      a.push({ic:'🚌',l:'Ride the Pacific Avenue bus and look out the window',s:'25 min. Stress −3.',cat:'here',
        fn:()=>{pass(25);adj('stress',-3);tick('rides');const x=Math.random()<.4&&meet('pk_lorna');say('🚌 Car lots, churches, a feed store, a tattoo shop and a hundred small lives along the longest street in the county.'+(x?` The woman in the next seat says she drives a school bus and still likes riding one: <b>Lorna</b>. ${nb('pk_lorna').d}`:''))}});
    }
    return a;
  },
});

const P=HOODS[KEY].places;
for(const k of Object.keys(P)){const p=L[k];let h=!!p.hidden;
  Object.defineProperty(p,'hidden',{configurable:true,enumerable:true,get(){return h||!gate()},set(v){h=v}})}
HOODS[KEY].opens={};

const pkAt=(c,k)=>!isGrow()&&hoodOf(c.at)===KEY&&(!k||c.at===k);
defEvent({id:'pk_christmas',hook:'arrive',tile:['🎄','The Christmas concert','good'],chance:0.6,max:1,cond:c=>pkAt(c,'pk_plu')&&mon()===12&&tod()>=960&&tod()<1200,
  run:()=>{say('🎄 Candles in the windows and a line out the concert hall door: it’s the university’s Christmas concert. A student with a clipboard says a few seats just opened up.')},
  choices:()=>{const c=rp(12);return [
    {ic:'🎟️',l:`Take a seat — ${$(c)}`,s:'1½ hours. Stress −16, community +3.',dis:!canAfford(c),fn:()=>{spend(c);pass(90);adj('stress',-16);adj('community',3);const x=meet('pk_ingrid');say('🎄 The lights go down, the choir walks in holding candles, and the first carol is so soft you lean forward to hear it.'+(x?` Afterward a singer in a black robe hugs her grandmother next to you, then says hi: <b>Ingrid</b>. ${nb('pk_ingrid').d}`:''))}},
    {ic:'👂',l:'Listen from the lobby for a song',s:'15 min. Stress −5. Free.',fn:()=>{pass(15);adj('stress',-5);say('🎄 Through the doors, one carol, muffled and warm. The usher lets you stand there for the whole thing.')}},
    {ic:'🚶',l:'Head home in the cold',s:'Nothing changes.',fn:()=>{say('🎄 You hear the first notes as the doors close behind you.')}}]},dflt:2});
defEvent({id:'pk_graduation',hook:'arrive',tile:['🎓','Graduation day','good'],chance:0.6,max:1,cond:c=>pkAt(c)&&['pk_plu','pk_garfield'].includes(c.at)&&mon()===5&&daytime(),
  run:()=>{say('🎓 Garfield Street is full of caps and gowns, grandparents with cameras and balloons tied to every parking meter. It’s graduation day at PLU.')},
  choices:()=>[
    {ic:'📸',l:'Offer to take a family’s picture',s:'10 min. Community +2, stress −3.',fn:()=>{pass(10);adj('community',2);adj('stress',-3);say('📸 Three generations squeeze into the frame. “Everybody say PLU!” They do, loudly.')}},
    {ic:'👏',l:'Cheer for the graduates walking by',s:'5 min. Stress −2, community +1.',fn:()=>{pass(5);adj('stress',-2);adj('community',1);say('👏 A graduate in a gown hears you and raises her diploma like a trophy.')}},
    {ic:'🚶',l:'Weave through the crowd',s:'Nothing changes.',fn:()=>{say('🎓 You squeeze past a balloon bouquet and a very proud uncle.')}}],dflt:2});
defEvent({id:'pk_geese',hook:'arrive',tile:['🪿','Geese on the path','info'],chance:0.3,max:1,cond:c=>pkAt(c,'pk_lake')&&daytime(),
  run:()=>{say('🪿 A family of geese has taken over the path by the beach: two parents hissing and eight fuzzy goslings who have no idea they’re in charge.')},
  choices:()=>stopWatch({mins:10,calm:5,text:'🪿 The goslings tumble into the lake one by one and paddle off in a perfect line. The parents give you one last look, like you should know better.'}),dflt:1});
})();
