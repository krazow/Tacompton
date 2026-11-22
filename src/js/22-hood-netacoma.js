// ============================================================
//  TACOMPTON, neighborhood pack: Northeast Tacoma (across the tideflats and up the hill, a 32-minute bus ride).
//  Browns Point Lighthouse Park and beach, a forest ravine trail (generic), and a quiet shopping corner (invented).
//  Prefix ne_. Registers itself with defHood() (20-world.js).
// ============================================================
(function(){
const KEY='netacoma';
const HF=()=>(S.hoodFlags=S.hoodFlags||{});
const once=k=>!!HF()[`${KEY}_${k}_${day()}`], mark=k=>{HF()[`${KEY}_${k}_${day()}`]=true};
const neNb=id=>NEIGHBORS.find(x=>x.id===id);
const meet=(id,d)=>{const x=!S.met[id];if(x){S.met[id]=d+1;S.stats.neighbors=metCount();adj('community',2)}return x};
const fir=(x,b,h,n,w=22)=>`<polygon points="${x-w/2},${b} ${x+w/2},${b} ${x},${b-h}" fill="${HC.leaf(n)}"/><polygon points="${x-w*.4},${b-h*.35} ${x+w*.4},${b-h*.35} ${x},${b-h*.85}" fill="${HC.leaf2(n)}" opacity=".8"/><rect x="${x-1.5}" y="${b}" width="3" height="5" fill="${HC.trunk(n)}"/>`;

defHood({
  key:KEY, name:'Northeast Tacoma', ic:'🌲', blurb:'Out past the tideflats and up the hill it is quiet and green, all firs, cul-de-sacs and water glimpses, with a little white lighthouse at the end of the point.',
  hub:'ne_corner', ride:{via:'🚌 Bus', mins:32, fare:2},
  places:{
    ne_point:{name:'Browns Point Lighthouse Park & beach',ic:'🏖️',desc:'A small park at the tip of the point: a white lighthouse and keeper’s cottage, a pebbly beach with tide pools, and a wide look across Commencement Bay at the port cranes and Mount Rainier',
      art:({night:n,dusk})=>`${starsSky(n)}
        <rect y="86" width="480" height="40" fill="${HC.bay(n)}"/>
        ${dusk&&!n?'<rect y="86" width="480" height="10" fill="#f4b183" opacity=".35"/>':''}
        ${rainier(n,360,.5,88)}
        <path d="M0 88 Q80 80 160 86 T300 86 T480 88 V92 H0 Z" fill="${HC.hill2(n)}" opacity=".7"/>
        ${crane(150,n,92,.42)}${crane(190,n,92,.42)}${crane(228,n,92,.42)}<rect x="120" y="90" width="130" height="3" fill="${n?'#2c3138':'#6b7480'}"/>
        <path d="M270 104 q24 -3 48 0 M390 112 q24 -3 48 0 M200 116 q24 -3 48 0" stroke="${HC.bay2(n)}" stroke-width="2" fill="none" opacity=".7"/>
        <path d="M0 118 Q120 108 260 124 Q380 138 480 132 V150 H0 Z" fill="${n?'#3a3a38':'#d6cdb4'}"/>
        <path d="M250 124 Q380 138 480 132 V138 Q380 144 250 130 Z" fill="${n?'#5a6a70':'#b9a98a'}" opacity=".6"/>
        <ellipse cx="330" cy="136" rx="10" ry="3" fill="${n?'#2a2a2a':'#8c8574'}"/><ellipse cx="360" cy="140" rx="7" ry="2.5" fill="${n?'#2a2a2a':'#a39b88'}"/><ellipse cx="410" cy="137" rx="9" ry="3" fill="${n?'#2a2a2a':'#8c8574'}"/>
        <rect x="278" y="132" width="42" height="5" rx="2" fill="${HC.trunk(n)}"/>
        <rect x="0" y="108" width="190" height="42" fill="${HC.hill(n)}"/><path d="M0 108 Q90 98 190 112 V118 H0 Z" fill="${HC.hill2(n)}"/>
        <rect x="98" y="62" width="30" height="48" fill="${n?'#cfcac0':'#fbfaf6'}"/><rect x="98" y="62" width="8" height="48" fill="#000" opacity=".08"/>
        <rect x="95" y="58" width="36" height="5" fill="${n?'#555':'#3a3f45'}"/>
        <rect x="102" y="44" width="22" height="14" fill="${n?'#f7d77a':'#cfe0e6'}"/><path d="M102 44 V58 M113 44 V58 M124 44 V58" stroke="${n?'#555':'#3a3f45'}" stroke-width="1.5"/>
        <polygon points="98,44 113,30 128,44" fill="${n?'#5a2a24':'#b8402a'}"/><rect x="112" y="24" width="2" height="7" fill="${n?'#555':'#3a3f45'}"/>
        <rect x="108" y="92" width="10" height="18" fill="${n?'#3a3228':'#6b4430'}"/><rect x="104" y="74" width="6" height="8" fill="${win(n)}"/><rect x="118" y="74" width="6" height="8" fill="${win(n)}"/>
        ${n?`<ellipse cx="113" cy="51" rx="26" ry="18" fill="#f7d77a" opacity=".22"/><polygon points="124,49 400,22 400,70" fill="#f7d77a" opacity=".1"/>`:''}
        <rect x="40" y="88" width="46" height="24" fill="${n?'#d8d3c8':'#fbfaf6'}"/><polygon points="36,88 63,72 90,88" fill="${n?'#5a2a24':'#b8402a'}"/><rect x="48" y="96" width="9" height="9" fill="${win(n)}"/><rect x="68" y="96" width="9" height="9" fill="${win(n,false)}"/>
        ${fir(14,112,36,n)}${fir(180,114,30,n,18)}
        ${person(240,n,'#c0392b',136,.85)}${person(255,n,'#2a6fa8',137,.85)}`},
    ne_trail:{name:'The Ravine Trail',ic:'🌲',desc:'A forest path winding down a green ravine in the Northeast Tacoma greenbelt, with tall firs, licorice ferns, a trickling creek and almost no one else around',
      art:({night:n})=>`${starsSky(n)}
        <rect y="0" width="480" height="150" fill="${n?'#0e1a16':'#4f7a5c'}" opacity="${n?.0:.0}"/>
        <rect y="70" width="480" height="80" fill="${n?'#12221b':'#4b7656'}"/>
        ${[30,80,140,200,270,330,390,450].map((x,i)=>fir(x,112,52+(i*13%22),n,26)).join('')}
        <rect y="112" width="480" height="38" fill="${n?'#18281d':'#5f8a62'}"/>
        ${[10,70,125,190,300,365,430].map((x,i)=>fir(x,134,76+(i*17%30),n,34)).join('')}
        <path d="M150 150 Q220 130 250 118 Q280 108 330 104 L350 104 Q300 116 290 128 Q270 142 250 150 Z" fill="${n?'#3a3228':'#b79a72'}"/>
        <path d="M262 150 Q300 128 330 118" stroke="${n?'#5a8a9a':'#8fc3d6'}" stroke-width="3" fill="none" opacity=".8"/>
        ${[[60,146],[110,142],[380,144],[430,146],[200,148]].map(([x,y])=>`<path d="M${x} ${y} q-10 -14 -22 -10 M${x} ${y} q-2 -16 -2 -22 M${x} ${y} q10 -14 22 -10" stroke="${n?'#1f4a2a':'#2f7a40'}" stroke-width="3" fill="none"/>`).join('')}
        ${n?'':[[90,60],[220,50],[360,56]].map(([x,y])=>`<polygon points="${x},${y} ${x+60},${y+90} ${x-30},${y+90}" fill="#f7e8a8" opacity=".1"/>`).join('')}
        ${person(300,n,'#c98a12',120,.7)}`},
    ne_corner:{name:'Marine View corner',ic:'🥐',desc:'A sleepy corner of three small shops and a bus shelter where the 32-minute ride ends: a coffee window, a bakery and a little housewares store, all invented',
      hours:d=>d%7<5?[420,1080]:[480,1020],
      art:({night:n})=>`${starsSky(n)}
        ${fir(20,142,64,n,30)}${fir(462,142,58,n,28)}
        ${[['CEDAR CUP','#2f6b4a',58,n?'#2e3a36':'#d9c9a0'],['LITTLE LOAF','#b5654a',172,n?'#4a2e26':'#e0b07a'],['TIDEWATER','#2a6fa8',286,n?'#32343d':'#c9d3d8']].map(([t,c,x,w],i)=>`
          <rect x="${x}" y="68" width="106" height="72" fill="${w}"/>
          <rect x="${x-3}" y="64" width="112" height="6" fill="${n?'#2a1e1a':'#5a4a3a'}"/>
          <rect x="${x+7}" y="74" width="92" height="12" rx="2" fill="${n?'#1c1814':'#2a2a2a'}"/><text x="${x+53}" y="83.5" text-anchor="middle" font-size="8" ${SVGF} fill="#f4e2a8">${t}</text>
          <path d="M${x} 90 h106 l-6 12 h-94 z" fill="${c}"/>${[0,1,2,3,4,5].map(k=>`<rect x="${x+4+k*16}" y="90" width="8" height="12" fill="#fff" opacity=".28"/>`).join('')}
          <rect x="${x+8}" y="108" width="44" height="26" fill="${win(n)}"/><rect x="${x+62}" y="106" width="34" height="34" fill="${n?'#241a14':'#4a3226'}"/>
          ${i===0?`<circle cx="${x+30}" cy="122" r="6" fill="${n?'#7a5a3a':'#f4efe4'}"/><rect x="${x+25}" y="125" width="10" height="4" fill="#6b4430"/>`:i===1?`<ellipse cx="${x+20}" cy="124" rx="9" ry="5" fill="#c98a42"/><ellipse cx="${x+38}" cy="125" rx="7" ry="4" fill="#d9a65a"/>`:`<rect x="${x+14}" y="116" width="8" height="14" fill="#2a6fa8"/><rect x="${x+26}" y="120" width="8" height="10" fill="#c98a12"/><rect x="${x+38}" y="114" width="7" height="16" fill="#2f8f6a"/>`}`).join('')}
        <rect x="402" y="96" width="40" height="3" fill="${n?'#4a4f55':'#6b7480'}"/><rect x="404" y="99" width="3" height="41" fill="${n?'#4a4f55':'#6b7480'}"/><rect x="438" y="99" width="3" height="41" fill="${n?'#4a4f55':'#6b7480'}"/><rect x="408" y="126" width="26" height="3" fill="${HC.trunk(n)}"/>
        <rect x="444" y="86" width="3" height="54" fill="${n?'#555':'#3a3f45'}"/><rect x="440" y="80" width="11" height="9" rx="1" fill="#2a6fa8"/><text x="445.5" y="87" text-anchor="middle" font-size="7" ${SVGF} fill="#fff">B</text>
        ${person(160,n,'#2a6fa8',146,.95)}${person(260,n,'#8e44ad',146,.95)}${lamp(40,n,146)}
        <rect y="146" width="480" height="4" fill="${HC.walk(n)}"/>`},
  },
  travel:{'ne_corner|ne_point':8,'ne_corner|ne_trail':7,'ne_point|ne_trail':12},
  neighbors:[
    {id:'ne_halvor',n:'Halvor',ic:'🏮',at:['ne_point'],d:'A retired ferry deckhand who volunteers at the lighthouse park and polishes the brass until you can check your teeth in it. Will tell you the whole history of the point if you stand still for ninety seconds, and sometimes after that too.'},
    {id:'ne_pearl',n:'Pearl',ic:'🧶',at:['ne_corner','ne_trail'],d:'Runs Tidewater, the housewares shop, and walks the ravine trail every morning with a very old dachshund named Biscotti. Knows which neighbor grows the best tomatoes and who is owed a casserole dish.'},
  ],
  actions:(loc,d,m)=>{const a=[],at=(lo,hi)=>m>=lo&&m<hi;
    if(loc==='ne_point'){
      a.push({ic:'🦀',l:'Beachcomb and peek into the tide pools',s:`35 min. ${cap(calmTxt(10))}.`,cat:'rest',fn:()=>{pass(35);S.stats.walks++;calm(10);say(pick(['🦀 Pebbles that click underfoot, a tiny crab hustling sideways between rocks, a pink anemone that closes on your fingertip like a shy handshake. You put everything back exactly as you found it.','🦀 Barnacles, a purple sea star the size of a cookie, and a kid explaining the whole pool to his dad with great authority. Out on the bay a tug drags a barge slowly across the afternoon.']))}});
      const open=at(600,1020);
      a.push({ic:'🏮',l:'Visit the lighthouse and keeper’s cottage grounds',s:open?`30 min. ${cap(calmTxt(8))}. Free, with a donation jar.`:'The grounds are best visited between 10 AM and 5 PM.',cat:'here',dis:!open,
        fn:()=>{pass(30);calm(8);S.stats.walks++;const x=meet('ne_halvor',d);say('🏮 A short white tower with a red cap, a little keeper’s cottage and a lawn that slopes to the water. Brass fittings, a laminated history, a bench that was clearly put exactly where the view is best.'+(x?` A volunteer in a windbreaker looks up from a rag: <b>Halvor</b>. ${neNb('ne_halvor').d}`:' Halvor waves a polishing rag in greeting.'))}});
      if(!once('view')){const ss=sunsetOn(d),ok=at(ss-60,ss+20);a.push({ic:'🏔️',l:'Watch Rainier and the port cranes from the point',s:ok?`Sunset ${fmt(ss)}. 45 min. Stress −18, community +1. Once a day.`:m<ss?`Sunset ${fmt(ss)}. Best from ${fmt(ss-60)}.`:`Sunset was ${fmt(ss)}.`,cat:'rest',cls:ok?'primary':'',dis:!ok,
        fn:()=>{mark('view');pass(45);adj('stress',-18);adj('community',1);say(pick(['🏔️ Across the water the port cranes stand in a row like patient herons, and behind them, enormous and pink, is Mount Rainier. Everyone on the beach has gone quiet. Somebody’s dog sighs.','🏔️ The bay goes silver, the cranes turn to black lace, and the mountain holds the last light a full minute after everything else lets go. A couple on the bench just says “well, there it is.”']))}})}
    }
    if(loc==='ne_trail'){
      a.push({ic:'🌲',l:'Hike the ravine trail under the firs',s:'50 min. Energy −4, '+calmTxt(14)+'.',cat:'rest',fn:()=>{pass(50);S.stats.walks++;adj('energy',-4);calm(14);say(pick(['🌲 Moss on everything, ferns to your knees, a creek chattering somewhere below. The air smells like cedar and rain, and the city feels like a rumor.','🌲 A woodpecker drumming, a bridge made of two planks, a sunbeam that picks out one fern like a spotlight. You pass exactly one person, and you both nod like you’re in on something.']))}});
      if(!once('bench')){a.push({ic:'🪵',l:'Sit on the log bench by the creek',s:'20 min. Energy +6, stress −6. Once a day.',cat:'rest',fn:()=>{mark('bench');pass(20);adj('energy',6);adj('stress',-6);const x=!S.met.ne_pearl&&Math.random()<.5&&meet('ne_pearl',d);say('🪵 Cold clear water over round stones, a steller’s jay scolding you from a branch, your phone with no bars at all. You decide this is an upgrade.'+(x?` A woman with a very old dachshund stops to let him sniff your shoes: <b>Pearl</b>. ${neNb('ne_pearl').d}`:''))}})}
    }
    if(loc==='ne_corner'){
      const open=isOpen('ne_corner');
      if(!once('coffee')){const c=rp(7);a.push({ic:'☕',l:`A coffee and a cinnamon twist at Cedar Cup — ${$(c)}`,s:open?(canAfford(c)?'30 min. Energy +10, stress −5. Once a day.':'Not enough cash.'):hoursTxt('ne_corner'),cat:'food',dis:!open||!canAfford(c),
        fn:()=>{spend(c);mark('coffee');pass(30);adj('energy',10);adj('stress',-5);S.stats.meals++;say(pick(['☕ A coffee window with three stools and a chalkboard that says “no rush, we’re not in one.” The cinnamon twist is warm and enormous.','☕ The barista knows every regular’s order and starts yours before you get to the front. You are, apparently, a regular now.']))}})}
      const b=rp(11);a.push({ic:'🧶',l:`Browse Tidewater and buy something small — ${$(b)}`,s:open?(canAfford(b)?`40 min. ${cap(calmTxt(8))}.`:'Not enough cash.'):hoursTxt('ne_corner'),cat:'here',dis:!open||!canAfford(b),
        fn:()=>{spend(b);pass(40);calm(8);const x=meet('ne_pearl',d);say('🧶 Wooden spoons, wool socks, tide tables, seven kinds of kitchen towel and a shelf labeled “things you didn’t know you needed.” You leave with a hand-glazed mug that fits your fingers perfectly.'+(x?` The owner leans on the counter: <b>Pearl</b>. ${neNb('ne_pearl').d}`:' Pearl tells you which tomatoes to trust.'))}});
      if(!once('bun')){const c=rp(5);a.push({ic:'🥖',l:`Grab a loaf and a bun at Little Loaf — ${$(c)}`,s:open?(canAfford(c)?'Takes 10 min. Adds 1 meal to the fridge, stress −3. Once a day.':'Not enough cash.'):hoursTxt('ne_corner'),cat:'food',dis:!open||!canAfford(c),
        fn:()=>{spend(c);mark('bun');pass(10);S.food++;adj('stress',-3);say('🥖 A seeded loaf still warm through the paper bag and a plain bun for the walk to the bus. The baker adds a second bun “because it’s Tuesday,” though it isn’t.')}})}
    }
    return a;
  },
});

const neAt=(c,k)=>!isGrow()&&hoodOf(c.at)==='netacoma'&&(!k||c.at===k);
defEvent({id:'netacoma_openhouse',hook:'arrive',tile:['🏮','Lighthouse open house','good'],chance:0.35,max:1,cond:c=>neAt(c,'ne_point')&&tod()>=600&&tod()<960,
  run:()=>{pass(25);adj('stress',-6);adj('community',3);say('🏮 The little lighthouse has its door propped open and a hand-lettered sign: “Open House, climb on up!” A volunteer hands you a paper cup of lemonade, a kid shows you the lantern room “for the third time,” and the view from up there makes the whole bay look like a model of itself. You sign the guest book and draw a very small lighthouse next to your name.')}});
defEvent({id:'netacoma_tidepools',hook:'arrive',tile:['🌊','Low tide','good'],chance:0.4,max:2,cooldown:2,cond:c=>neAt(c,'ne_point')&&daytime(),
  run:()=>{pass(20);adj('stress',-6);adj('community',1);say('🌊 The tide is way out and the whole beach has turned into a puzzle of little pools. A naturalist with a bucket lens is crouched over one, calling every kid over: “Okay, who wants to see a hermit crab change houses?” Fifteen minutes later you are crouched next to her, completely invested in a crab.')}});
defEvent({id:'netacoma_barbecue',hook:'arrive',tile:['🍔','Barbecue over the bay','good'],chance:0.35,max:1,cond:c=>neAt(c)&&tod()>=1020&&tod()<1230&&c.at!=='ne_trail',
  run:()=>{pass(40);adj('energy',8);adj('stress',-7);adj('community',3);S.stats.meals++;say('🍔 A neighbor’s deck on the bluff is smoky and cheerful: burgers, corn on the cob, a speaker playing old soul records. “We always make too much,” says the host, handing you a plate with no further questions. Below the deck the bay turns copper and the port cranes light up one by one. You stay for dessert, which is a peach cobbler of unknown origin and exceptional quality.')}});
defEvent({id:'netacoma_doe',hook:'arrive',tile:['🦌','A doe and her fawn','good'],chance:0.4,max:1,cond:c=>neAt(c,'ne_trail')&&(tod()<570||tod()>=1020),
  run:()=>{pass(15);adj('stress',-8);adj('community',1);say('🦌 You round a bend and stop: a doe, big-eared and unbothered, is standing in the ferns and a spotted fawn is tucked against her side. They look at you. You look at them. Nobody moves for a full minute, then the doe flicks an ear and they melt back between the trunks without a sound. You walk the rest of the trail very slowly.')}});
})();
