// ============================================================
//  TACOMPTON, Pierce County area pack: Fife (just east of the Tacoma tideflats, along I-5).
//  The Port side (cranes and container stacks on the waterways), the Pacific Highway food row, Dacca Park and the community
//  center, and a truck stop by the I-5 ramps. Every business here is invented and generic. Prefix fi_. county:true
//  (72-county.js decides when the county is open to you; until then these places stay hidden).
// ============================================================
(function(){
const KEY='fife';
const HF=()=>(S.hoodFlags=S.hoodFlags||{});
const once=k=>!!HF()[`${KEY}_${k}_${day()}`], mark=k=>{HF()[`${KEY}_${k}_${day()}`]=true};
const meet=id=>{if(S.met[id])return false;S.met[id]=day()+1;S.stats.neighbors=metCount();adj('community',2);return true};
const nb=id=>NEIGHBORS.find(x=>x.id===id);
const tick=k=>{S.stats[k]=(S.stats[k]||0)+1};
const yr=()=>typeof yearNow==='function'?yearNow():2026;
const gate=()=>{try{return typeof countyOn==='function'&&!!countyOn()}catch(e){return false}};
// the food row through the years: diners and drive-ins first, then pho shops and taco trucks
const trucks=()=>yr()>=2000;

defHood({
  key:KEY, name:'Fife', ic:'🚚', county:true, startable:true,
  blurb:'A small, busy city between the port and the freeway: container cranes on the waterways, warehouses and truck yards, and a long highway of cheap, good food.',
  hub:'fi_hwy', ride:{via:'bus',mins:30,fare:2,drive:12},
  guide:'Fife is just east of the tideflats, on the bus out Pacific Highway or a short drive up I-5. The port side has the container cranes and ships; Pacific Highway is a long row of diners and lunch spots; Dacca Park has ball fields, a playground and the community center; the truck stop by the freeway never closes.',
  places:{
    fi_hwy:{name:'Pacific Highway food row',ic:'🍽️',desc:'A long, wide highway of diners, drive-ins, lunch counters and family restaurants between the warehouses (all invented), busy from breakfast to late',
      hours:d=>[360,1320],
      art:({night:n})=>{const t=trucks();return `${starsSky(n)}
        <rect y="124" width="480" height="26" fill="${HC.street(n)}"/><path d="M0 137 H480" stroke="${n?'#6a6a50':'#f1e08a'}" stroke-width="1.5" stroke-dasharray="14 10"/>
        <rect x="20" y="70" width="130" height="54" fill="${n?'#2e3038':'#f0e6d0'}"/><rect x="20" y="66" width="130" height="8" fill="${n?'#4a1e1a':'#c0392b'}"/>
        <rect x="30" y="80" width="110" height="24" fill="${win(n)}"/><rect x="96" y="104" width="18" height="20" fill="${n?'#1a1a20':'#4a4a52'}"/>
        <rect x="60" y="36" width="4" height="30" fill="${n?'#555':'#888'}"/><rect x="34" y="20" width="56" height="18" rx="9" fill="${n?'#2a1a14':'#e0a020'}"/><text x="62" y="32.5" text-anchor="middle" font-size="9" ${SVGF} fill="${n?'#f7d77a':'#2a1a14'}">DINER</text>
        <rect x="170" y="80" width="110" height="44" fill="${n?'#33363e':'#d9d2c2'}"/><rect x="178" y="86" width="94" height="12" rx="2" fill="#2f6b4a"/><text x="225" y="95" text-anchor="middle" font-size="8" ${SVGF} fill="#fff">${t?'PHO · NOODLES':'BURGERS · SHAKES'}</text><rect x="180" y="102" width="56" height="18" fill="${win(n)}"/>
        ${t?`<g><rect x="310" y="96" width="76" height="28" rx="4" fill="${n?'#4a4a3a':'#f2f2ea'}"/><rect x="318" y="102" width="40" height="12" fill="${win(n)}"/><path d="M314 100 h66" stroke="#c98a12" stroke-width="4"/><text x="348" y="122" text-anchor="middle" font-size="7" ${SVGF} fill="${n?'#f7d77a':'#b8402a'}">TACOS</text><circle cx="326" cy="126" r="4" fill="#222"/><circle cx="372" cy="126" r="4" fill="#222"/></g>`:`<rect x="310" y="84" width="76" height="40" fill="${n?'#2e3038':'#e9e0cf'}"/><rect x="304" y="80" width="88" height="6" fill="${n?'#4a2418':'#8a2f27'}"/><rect x="318" y="94" width="60" height="16" fill="${win(n)}"/>`}
        ${person(300,n,'#2a6fa8',124,.85)}${person(400,n,'#c0392b',124,.85)}${lamp(160,n,124)}${lamp(410,n,124)}${tree(460,n,14,124)}`}},
    fi_port:{name:'The port side',ic:'🏗️',desc:'Where Fife meets the Port of Tacoma: container cranes over the waterways, stacks of red, blue and green boxes, rail yards and a road along the water where you can watch the ships come in',
      art:({night:n,dusk})=>`${starsSky(n)}
        <rect y="100" width="480" height="40" fill="${HC.bay(n)}"/>${dusk&&!n?'<rect y="100" width="480" height="8" fill="#f4b183" opacity=".35"/>':''}
        ${rainier(n,380,.6,100)}
        <rect y="122" width="480" height="28" fill="${n?'#2a2c2e':'#8a8e90'}"/>
        ${crane(110,n,122,1)}${crane(250,n,122,1)}${boxesOnDock(300,n,122)}${boxesOnDock(360,n,122)}${boxesOnDock(30,n,122)}
        <g><path d="M140 112 h160 l-10 10 h-142 z" fill="${n?'#3a2a2a':'#2a3f6a'}"/>${[0,1,2,3,4,5].map(i=>`<rect x="${156+i*22}" y="104" width="20" height="8" fill="${n?'#3a3f45':['#b8402a','#2a6fa8','#2f8f6a','#c98a12','#5d6a75','#b8402a'][i]}"/>`).join('')}<rect x="270" y="94" width="18" height="18" fill="${n?'#555':'#f1ede4'}"/>${n?'<circle cx="279" cy="98" r="2" fill="#f7d77a"/>':''}</g>
        <rect x="0" y="140" width="480" height="3" fill="${n?'#555':'#555'}"/><path d="M0 144 H480 M0 148 H480" stroke="${n?'#5a5f63':'#6a6e70'}" stroke-width="1.2"/>
        ${person(420,n,'#e0a020',140,.85)}`},
    fi_dacca:{name:'Dacca Park',ic:'⚾',desc:'Fife’s big city park by the community center: ball fields with lights, a playground, picnic shelters and a paved path, full of families on summer evenings',
      art:({night:n})=>`${starsSky(n)}
        <rect y="98" width="480" height="52" fill="${n?'#1c2c22':'#7aa06e'}"/>
        <path d="M120 140 L200 104 L280 140 Z" fill="${n?'#2a2a22':'#c8a070'}" opacity=".9"/><rect x="196" y="118" width="8" height="8" fill="#fff" transform="rotate(45 200 122)"/>
        ${[60,420].map(x=>`<rect x="${x}" y="30" width="4" height="80" fill="${n?'#555':'#999'}"/><rect x="${x-10}" y="26" width="24" height="10" fill="${n?'#f7f0c0':'#ddd'}"/>${n?`<polygon points="${x-10},36 ${x+14},36 ${x+50},120 ${x-46},120" fill="#f7f0c0" opacity=".12"/>`:''}`).join('')}
        <rect x="320" y="76" width="80" height="34" fill="${n?'#33363e':'#d9d2c2'}"/><path d="M314 78 L360 60 L406 78 Z" fill="${n?'#2a2e36':'#5d7f93'}"/><rect x="330" y="86" width="22" height="14" fill="${win(n)}"/><rect x="366" y="88" width="18" height="22" fill="${n?'#1a1a20':'#4a4a52'}"/>
        <rect x="10" y="110" width="40" height="3" fill="${n?'#555':'#c0392b'}"/><path d="M14 113 v20 M46 113 v20" stroke="${n?'#555':'#c0392b'}" stroke-width="2"/><path d="M24 113 v12 M36 113 v12" stroke="${n?'#666':'#888'}" stroke-width="1"/>
        ${person(190,n,'#2a6fa8',140,.8)}${person(240,n,'#c0392b',140,.8)}${person(290,n,'#f2f2f2',136,.7)}${tree(460,n,16,140)}`},
    fi_truck:{name:'Truck stop by I-5',ic:'⛽',desc:'A big, bright truck stop at the freeway ramps, open all night: rows of diesel pumps, a store with everything, hot coffee, showers for the drivers and a diner booth by the window',
      art:({night:n})=>`${n?starsSky(n):''}
        <rect y="120" width="480" height="30" fill="${HC.street(n)}"/>
        <rect x="40" y="60" width="260" height="10" fill="${n?'#3a3f45':'#c0392b'}"/>${[60,130,200,270].map(x=>`<rect x="${x}" y="70" width="6" height="50" fill="${n?'#666':'#ddd'}"/><rect x="${x-6}" y="92" width="18" height="28" rx="2" fill="${n?'#4a4f55':'#f1ede4'}"/>`).join('')}
        ${n?'<rect x="40" y="70" width="260" height="50" fill="#f7f0c0" opacity=".14"/>':''}
        <rect x="320" y="70" width="140" height="50" fill="${n?'#2e3038':'#e9e0cf'}"/><rect x="330" y="78" width="120" height="12" rx="2" fill="${n?'#1c1c22':'#2a6fa8'}"/><text x="390" y="87" text-anchor="middle" font-size="8" ${SVGF} fill="#fff">OPEN 24 HOURS</text><rect x="332" y="94" width="80" height="20" fill="${win(n)}"/>
        <g><rect x="90" y="98" width="110" height="26" rx="2" fill="${n?'#4a4f55':'#d8d8d0'}"/><rect x="200" y="104" width="30" height="20" rx="3" fill="${n?'#3a2a2a':'#2a4a8a'}"/><rect x="214" y="108" width="12" height="7" fill="${win(n)}"/>${[100,130,190,214].map(x=>`<circle cx="${x}" cy="126" r="5" fill="#222"/>`).join('')}</g>
        <path d="M0 40 L480 30" stroke="${n?'#2a2e36':'#9aa0a6'}" stroke-width="10"/><path d="M0 40 L480 30" stroke="${n?'#f7d77a':'#fff'}" stroke-width="1" stroke-dasharray="10 12" opacity=".6"/>
        ${person(310,n,'#2f8f6a',120,.85)}`},
  },
  travel:{'fi_hwy|fi_port':10,'fi_hwy|fi_dacca':6,'fi_hwy|fi_truck':5,'fi_port|fi_dacca':12,'fi_port|fi_truck':10,'fi_dacca|fi_truck':8},
  neighbors:[
    {id:'fi_tavita',n:'Tavita',ic:'🏗️',at:['fi_port','fi_hwy'],d:'Longshore worker who drives a straddle carrier at the port and can tell any ship’s home country from the color of its hull. Feeds half his crew from a cooler of his auntie’s cooking.'},
    {id:'fi_marisol',n:'Marisol',ic:'🍳',at:['fi_hwy'],d:'Runs the grill at the diner on the highway and has since she was nineteen. Remembers every regular’s order and every truck driver’s kids’ names, and keeps a jar by the register for whoever’s short that week.'},
    {id:'fi_hank',n:'Hank',ic:'🚛',at:['fi_truck','fi_dacca'],d:'Long-haul trucker who lives in Fife between runs and coaches Little League at Dacca Park when he’s home. Knows every truck stop from here to El Paso and ranks their pie.'},
  ],
  actions:(loc,d,m)=>{const a=[],at=(lo,hi)=>m>=lo&&m<hi;
    if(loc==='fi_hwy'){
      const open=isOpen('fi_hwy');
      if(!once('diner')){const c=rp(9);a.push({ic:'🍳',l:`${m<660?'Breakfast':'A plate'} at the diner — ${$(c)}`,s:open?(canAfford(c)?'40 min. Energy +12, stress −4. Once a day.':'Not enough cash.'):hoursTxt('fi_hwy'),cat:'food',dis:!open||!canAfford(c),
        fn:()=>{spend(c);mark('diner');pass(40);adj('energy',12);adj('stress',-4);tick('meals');const x=meet('fi_marisol');say((m<660?'🍳 Two eggs, hash browns, toast and a bottomless coffee, at a counter full of truckers and warehouse crews.':'🍳 A hot plate of the day’s special and a slice of pie. The jukebox plays something your parents liked.')+(x?` The cook slides it over herself: <b>Marisol</b>. ${nb('fi_marisol').d}`:''))}})}
      if(!once('street')){const c=rp(7);a.push({ic:trucks()?'🌮':'🍔',l:`${trucks()?'Tacos from the truck in the lot':'A burger and a shake from the drive-in'} — ${$(c)}`,s:open?(canAfford(c)?'20 min. Energy +8, stress −3. Once a day.':'Not enough cash.'):hoursTxt('fi_hwy'),cat:'food',dis:!open||!canAfford(c),
        fn:()=>{spend(c);mark('street');pass(20);adj('energy',8);adj('stress',-3);tick('meals');say(trucks()?'🌮 Three tacos on doubled tortillas, lime, radishes and a green salsa that means it. You eat standing up by the truck like everyone else.':'🍔 A paper-wrapped burger and a shake so thick the straw stands up by itself.')}})}
    }
    if(loc==='fi_port'){
      a.push({ic:'🚢',l:'Watch the ships and the cranes',s:`30 min. ${cap(calmTxt(8))}.`,cat:'rest',
        fn:()=>{pass(30);calm(8);const x=Math.random()<.5&&meet('fi_tavita');say(pick(['🚢 A ship as long as three city blocks slides up the waterway behind two tugboats. The cranes start lifting boxes off it before it seems possible.','🚢 The cranes swing back and forth like slow giant birds, a box every minute or two. Rainier floats over it all.'])+(x?` A man in an orange vest eating lunch on his tailgate tells you which ship is which: <b>Tavita</b>. ${nb('fi_tavita').d}`:''))}});
      const c=rp(4);a.push({ic:'🥤',l:`Bring a soda to the crew on break — ${$(c)}`,s:canAfford(c)?'15 min. Community +2.':'Not enough cash.',cat:'people',dis:!canAfford(c),
        fn:()=>{spend(c);pass(15);adj('community',2);say('🥤 Cold sodas for three tired people in hard hats. One of them says “you’re hired,” and they all laugh.')}});
    }
    if(loc==='fi_dacca'){
      a.push({ic:'⚾',l:'Watch a Little League game',s:at(960,1260)?`45 min. ${cap(calmTxt(8))}, community +1.`:'Games are in the late afternoon and evening.',cat:'people',dis:!at(960,1260),
        fn:()=>{pass(45);calm(8);adj('community',1);const x=meet('fi_hank');say('⚾ A seven-year-old hits the ball and runs to third base. Everyone yells. He runs home anyway. They count it.'+(x?` The coach, a big man in a trucker cap, laughs harder than anyone: <b>Hank</b>. ${nb('fi_hank').d}`:''))}});
      a.push({ic:'🚶',l:'Walk the path around the park',s:`25 min. ${cap(calmTxt(6))}.`,cat:'rest',
        fn:()=>{pass(25);calm(6);tick('walks');say('🚶 Around the fields, past the playground and the picnic shelter where somebody’s family reunion has three grills going.')}});
    }
    if(loc==='fi_truck'){
      const c=rp(3);a.push({ic:'☕',l:`Truck stop coffee and a donut — ${$(c)}`,s:canAfford(c)?'15 min. Energy +6. Open all night.':'Not enough cash.',cat:'food',dis:!canAfford(c),
        fn:()=>{spend(c);pass(15);adj('energy',6);say(pick(['☕ Coffee in a paper cup the size of a flowerpot. Two drivers argue at the window about the best way over the pass.','☕ A glazed donut and a coffee under the bright lights at 2 AM, or 2 PM. In here it never feels like either.']))}});
      a.push({ic:'🚛',l:'Sit in the booth and listen to the drivers',s:'30 min. Stress −5, community +1.',cat:'people',
        fn:()=>{pass(30);adj('stress',-5);adj('community',1);const x=meet('fi_hank');say('🚛 Stories about snow on the passes, a moose in Montana and the best pie between here and Texas.'+(x?` The man telling the pie story waves you into the booth: <b>Hank</b>. ${nb('fi_hank').d}`:''))}});
    }
    return a;
  },
});

const P=HOODS[KEY].places;
for(const k of Object.keys(P)){const p=L[k];let h=!!p.hidden;
  Object.defineProperty(p,'hidden',{configurable:true,enumerable:true,get(){return h||!gate()},set(v){h=v}})}
HOODS[KEY].opens={};
{const d0=L.fi_hwy.desc;Object.defineProperty(L.fi_hwy,'desc',{configurable:true,enumerable:true,get(){return trucks()?d0.replace('drive-ins, lunch counters','pho shops, taco trucks'):d0},set(){}})}

const fiAt=(c,k)=>!isGrow()&&hoodOf(c.at)===KEY&&(!k||c.at===k);
defEvent({id:'fi_bigship',hook:'arrive',tile:['🚢','A giant ship comes in','good'],chance:0.35,max:2,cooldown:3,cond:c=>fiAt(c,'fi_port')&&daytime(),
  run:()=>{say('🚢 The biggest ship you have ever seen is turning in the waterway, pushed by three tugboats, stacked ten boxes high. People have pulled over on the road to watch.')},
  choices:()=>stopWatch({mins:20,calm:7,text:'🚢 It takes twenty minutes to turn around, slow as a clock’s hour hand. When it finally lines up with the dock, a tug toots and somebody on the road claps.'}),dflt:1});
defEvent({id:'fi_newtruck',hook:'arrive',tile:['🚚','A new lunch truck','good'],chance:0.3,max:1,cond:c=>fiAt(c,'fi_hwy')&&tod()>=660&&tod()<1200,
  run:()=>{say('🚚 A brand-new lunch truck is parked in the diner lot with a hand-painted sign: GRAND OPENING. The owner is handing out free samples and looks nervous.')},
  choices:()=>{const c=rp(8);return [
    {ic:'🍱',l:`Buy a full plate — ${$(c)}`,s:'25 min. Energy +10, community +2.',dis:!canAfford(c),fn:()=>{spend(c);pass(25);adj('energy',10);adj('community',2);tick('meals');say('🚚 It’s really good. You tell him so, and his whole face changes. “Tell your friends!” You will.')}},
    {ic:'🥢',l:'Take a free sample and say thanks',s:'5 min. Energy +2, community +1.',fn:()=>{pass(5);adj('energy',2);adj('community',1);say('🚚 One bite of something spicy and sweet. “Come back tomorrow,” he says.')}},
    {ic:'🚶',l:'Wish him luck and walk on',s:'Nothing changes.',fn:()=>{say('🚚 “Good luck!” you call. He gives you a thumbs-up.')}}]},dflt:2});
defEvent({id:'fi_jam',hook:'arrive',tile:['🚗','I-5 is jammed','info'],chance:0.25,max:2,cooldown:5,cond:c=>fiAt(c,'fi_truck')&&((tod()>=420&&tod()<540)||(tod()>=960&&tod()<1110)),
  run:()=>{say('🚗 The freeway is a parking lot in both directions: red taillights all the way to the Puyallup River bridge. The truck stop TV says a crash near downtown Tacoma.')},
  choices:()=>[
    {ic:'☕',l:'Wait it out in the booth',s:'30 min. Stress −2.',fn:()=>{pass(30);adj('stress',-2);say('🚗 A coffee and a crossword, and by the time you look up, it’s moving again.')}},
    {ic:'🗺️',l:'Ask a driver for the back way',s:'10 min. Community +1, stress −3.',fn:()=>{pass(10);adj('community',1);adj('stress',-3);say('🗺️ A trucker draws you a map on a napkin: over to Pacific Highway, then the old road along the river. “Nobody knows it but us.”')}}],dflt:0});
})();
