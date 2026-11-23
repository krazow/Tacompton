// ============================================================
//  TACOMPTON, Pierce County pack: the mountain (county:true). Eatonville's little main street, Northwest Trek Wildlife Park
//  (opened 1975: a tram tour through 435 acres of bison, elk and moose), Ashford, the last town before the park, and
//  Mount Rainier National Park through the Nisqually Entrance (a park fee per car, good for seven days) up the long road
//  to Paradise. No bus goes there: it is a drive, most of a day there and back, and in winter the road above Longmire
//  opens only in the daytime, chains in the car, and stays shut on snow days. Not a place to start a life.
//  Prefix mtn_. The county engine keeps the places hidden until the county is open; this file keeps out the bus.
// ============================================================
(function(){
const KEY='mountain';
const HF=()=>(S.hoodFlags=S.hoodFlags||{});
const once=k=>!!HF()[`${KEY}_${k}_${day()}`], mark=k=>{HF()[`${KEY}_${k}_${day()}`]=true};
const meet=id=>{if(S.met[id])return false;S.met[id]=day()+1;S.stats.neighbors=metCount();adj('community',2);return true};
const nb=id=>NEIGHBORS.find(x=>x.id===id)||{d:''};
const PARK=['mtn_gate','mtn_paradise'];
const inPark=k=>PARK.includes(k);
const winter=d=>{const m=dateOf(d==null?day():d).m;return m>=11||m<=4};
const parkFee=()=>rp(30);
const feePaid=()=>{const f=HF().mtn_fee;return f!=null&&day()-f<7};   // a vehicle pass is good for seven days
// the road from Longmire up to Paradise: open all summer; in winter only in the daytime, and not at all on a snow day
function mtnRoad(t){const d=Math.floor((t==null?S.t:t)/1440),m=(t==null?S.t:t)%1440,w=typeof wxOf==='function'?wxOf(d):null;
  if(!winter(d))return {open:true};
  if(w==='snow')return {open:false,why:'❄️ The gate at Longmire is shut: heavy snow on the road to Paradise today. The ranger at the gate says try again tomorrow, and bring chains.'};
  if(m<540||m>=960)return {open:false,why:'🌲 In winter the road above Longmire is open only in the daytime, about 9 AM to 4 PM, and the gate is closed now.'};
  return {open:true,chains:true}}
window.mtnRoad=mtnRoad;
const snowy=n=>n?'#c9d2dc':'#f5f8fa';
const firs=(n,y,xs)=>xs.map((x,i)=>`<path d="M${x} ${y} l${10+(i%3)*3} -${30+(i%4)*8} l${10+(i%3)*3} ${30+(i%4)*8} z" fill="${i%2?HC.leaf(n):HC.leaf2(n)}"/>`).join('');

defHood({
  key:KEY, county:true, startable:false, dayTrip:true,
  name:'Eatonville and the mountain', ic:'🏔️', blurb:'South and east of Tacoma, the farms give way to forest: Eatonville and Northwest Trek’s bison and elk, then Ashford and the Nisqually Entrance of Mount Rainier National Park, and the road up to the wildflower meadows at Paradise. A drive, and a whole day.',
  hub:'mtn_eatonville', ride:{via:'drive',mins:90,fare:0,drive:55,bus:false},
  places:{
    mtn_eatonville:{name:'Eatonville, Mashell Avenue',ic:'🌲',desc:'A small timber town on the Mashell River: one main street with a diner (invented), a hardware store and a bakery, log trucks rumbling through, and forest on every side',
      hours:d=>[360,1260],
      art:({night:n})=>`${starsSky(n)}${rainier(n,380,.55,96)}${firs(n,104,[0,24,48,400,424,448,472])}
        ${[['MASHELL DINER','#c0392b',40],['HARDWARE','#2a6fa8',170],['BAKERY','#c98a12',300]].map(([t,c,x])=>`<rect x="${x}" y="62" width="116" height="78" fill="${n?'#33343c':'#c9a77a'}"/><polygon points="${x-4},64 ${x+58},44 ${x+120},64" fill="${n?'#2a2224':'#6a3f2e'}"/><rect x="${x+8}" y="70" width="100" height="12" rx="2" fill="#2a1e18"/><text x="${x+58}" y="79" text-anchor="middle" font-size="7.5" ${SVGF} fill="#f4e2a8">${t}</text><path d="M${x} 86 h116 l-5 10 h-106 z" fill="${c}"/><rect x="${x+10}" y="100" width="44" height="28" fill="${win(n)}"/><rect x="${x+72}" y="100" width="32" height="40" fill="${n?'#241a14':'#4a3226'}"/>`).join('')}
        <g transform="translate(10,128)"><rect x="0" y="0" width="34" height="14" fill="${n?'#3a3e46':'#2f6b4a'}"/><rect x="34" y="4" width="110" height="4" fill="${n?'#444':'#555'}"/>${[0,1,2].map(i=>`<rect x="${44+i*32}" y="-10" width="30" height="14" rx="7" fill="${n?'#4a3a2a':'#9a7a52'}"/>`).join('')}${[8,26,60,120].map(x=>`<circle cx="${x}" cy="16" r="5" fill="#2b2f33"/>`).join('')}</g>
        ${person(250,n,'#c0392b',146,.9)}${lamp(160,n,146)}`},
    mtn_trek:{name:'Northwest Trek Wildlife Park',ic:'🦬',desc:'A wildlife park in the forest north of Eatonville, opened in 1975: a tram carries you through a huge free-roaming area where bison, elk, moose and bighorn sheep wander up to the road, and paths lead past bears, wolves and cougars',
      hours:d=>{const m=dateOf(d).m;return m>=4&&m<=9?[570,1080]:(d%7>=4?[570,960]:null)},
      art:({night:n})=>`${starsSky(n)}${rainier(n,360,.5,92)}<rect y="96" width="480" height="54" fill="${n?'#1a2a1e':'#8ab06a'}"/>${firs(n,100,[0,30,60,90,380,410,440,470])}
        <g fill="${n?'#2a2018':'#4a3222'}">${[[150,118],[200,124],[330,116]].map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="18" ry="10"/><ellipse cx="${x-14}" cy="${y-4}" rx="9" ry="9"/><rect x="${x-14}" y="${y+6}" width="4" height="10"/><rect x="${x+8}" y="${y+6}" width="4" height="10"/>`).join('')}</g>
        <g transform="translate(250,108)"><path d="M0 0 l-8 -16 M0 0 l8 -16 M-4 -8 l-6 -4 M4 -8 l6 -4" stroke="${n?'#5a4a3a':'#8a6a4a'}" stroke-width="2"/><ellipse cx="0" cy="12" rx="14" ry="8" fill="${n?'#3a2a20':'#9a6a42'}"/><rect x="-10" y="18" width="3" height="12" fill="${n?'#3a2a20':'#9a6a42'}"/><rect x="7" y="18" width="3" height="12" fill="${n?'#3a2a20':'#9a6a42'}"/></g>
        <path d="M0 140 Q240 128 480 140 V150 H0 Z" fill="${n?'#3a3a32':'#b8a87a'}"/><g transform="translate(40,124)"><rect x="0" y="0" width="120" height="20" rx="5" fill="${n?'#8a8a7a':'#e8d27a'}"/>${[0,1,2,3,4].map(i=>`<rect x="${8+i*22}" y="3" width="16" height="8" fill="${n?'#f2d58a':'#5d7f93'}"/>`).join('')}${[16,104].map(x=>`<circle cx="${x}" cy="21" r="5" fill="#2b2f33"/>`).join('')}</g>`},
    mtn_ashford:{name:'Ashford',ic:'🏕️',desc:'The last little town on the road before the park: a general store (invented) with firewood and chains for sale out front, a few lodges and cabins under the big trees, and a lot of cars with skis or tents on top',
      hours:d=>[420,1200],
      art:({night:n})=>`${starsSky(n)}${firs(n,120,[0,26,52,78,104,330,356,382,408,434,460])}
        <rect x="160" y="74" width="160" height="66" fill="${n?'#3a2a22':'#8a5a3a'}"/><polygon points="150,76 240,46 330,76" fill="${n?'#2a2a2e':'#3a4a3a'}"/>
        <rect x="174" y="62" width="132" height="12" rx="2" fill="#2a1e18"/><text x="240" y="71" text-anchor="middle" font-size="7.5" ${SVGF} fill="#f4e2a8">ASHFORD GENERAL</text>
        <rect x="174" y="90" width="44" height="28" fill="${win(n)}"/><rect x="262" y="90" width="44" height="28" fill="${win(n)}"/><rect x="226" y="100" width="28" height="40" fill="${n?'#1e1410':'#3a2620'}"/>
        <rect x="150" y="120" width="180" height="4" fill="${n?'#2a1e16':'#5e4630'}"/>${[0,1,2,3,4].map(i=>`<rect x="${120+i*8}" y="${124-i%2*4}" width="7" height="16" fill="${n?'#4a3a2a':'#b98b62'}"/>`).join('')}
        <g transform="translate(360,128)"><rect x="0" y="0" width="64" height="14" rx="4" fill="${n?'#3a3e46':'#c0392b'}"/><rect x="10" y="-8" width="40" height="9" rx="3" fill="${n?'#3a3e46':'#c0392b'}"/><rect x="6" y="-12" width="50" height="3" fill="${n?'#888':'#2a6fa8'}"/>${[12,52].map(x=>`<circle cx="${x}" cy="15" r="5" fill="#2b2f33"/>`).join('')}</g>
        ${person(140,n,'#2f6b4a',146,.9)}${lamp(338,n,146)}`},
    mtn_gate:{name:'Nisqually Entrance',ic:'🪵',desc:'The southwest gate of Mount Rainier National Park: a timber arch over the road, a small booth where a ranger takes the park fee, and then the old-growth forest closes in, cedars and firs as wide as a car',
      art:({night:n})=>`${starsSky(n)}${firs(n,140,[0,30,60,90,120,330,360,390,420,450])}
        <rect y="130" width="480" height="20" fill="${HC.street(n)}"/><path d="M0 140 H480" stroke="#e8d27a" stroke-width="1.5" stroke-dasharray="14 10" opacity="${n?.3:.7}"/>
        <rect x="150" y="56" width="16" height="80" fill="${n?'#3a2a1e':'#8a5a3a'}"/><rect x="314" y="56" width="16" height="80" fill="${n?'#3a2a1e':'#8a5a3a'}"/><rect x="138" y="48" width="204" height="14" rx="6" fill="${n?'#3a2a1e':'#8a5a3a'}"/>
        <rect x="186" y="64" width="108" height="14" rx="2" fill="${n?'#2a1e16':'#5e3a22'}"/><text x="240" y="74" text-anchor="middle" font-size="6.5" ${SVGF} fill="#f4e2a8">MOUNT RAINIER NATIONAL PARK</text>
        <rect x="350" y="102" width="40" height="30" fill="${n?'#3a3e46':'#c9b48a'}"/><polygon points="346,104 370,90 394,104" fill="${n?'#2a2e36':'#4a5a4a'}"/><rect x="358" y="110" width="20" height="12" fill="${win(n)}"/>
        ${person(206,n,'#6a5a3a',140,.85)}`},
    mtn_paradise:{name:'Paradise',ic:'🌸',desc:'High on the mountain’s south side, 5,400 feet up: an old stone-and-timber inn, a visitor center, and meadows that are buried under twenty feet of snow in winter and blaze with lupine, paintbrush and avalanche lilies in late July. The summit fills the sky',
      art:({night:n})=>{let o={m:8};try{if(typeof S!=='undefined'&&S&&S.cur!=null)o=dateOf(day())}catch(e){}const w=o.m>=11||o.m<=5;
        return `${starsSky(n)}${rainier(n,250,1.9,128)}
        <path d="M0 120 Q120 104 240 118 T480 112 V150 H0 Z" fill="${w?snowy(n):(n?'#1a2a1e':'#6a9a5a')}"/>
        ${w?'':[30,60,90,130,170,300,340,380,420,450].map((x,i)=>`<circle cx="${x}" cy="${128+(i%3)*6}" r="2.2" fill="${['#7a5ac8','#e0403a','#f4f0e6'][i%3]}" opacity="${n?.4:.95}"/>`).join('')}
        <rect x="330" y="98" width="110" height="30" fill="${n?'#2a2a2e':'#6a5a4a'}"/><polygon points="322,100 385,70 448,100" fill="${w?snowy(n):(n?'#2a2e36':'#3a4a5a')}"/>${[0,1,2,3].map(i=>`<rect x="${340+i*24}" y="106" width="12" height="10" fill="${win(n)}"/>`).join('')}
        ${firs(n,124,[10,30,200,460])}${person(150,n,'#c0392b',146,.85)}${person(170,n,'#2a6fa8',146,.75)}`}},
  },
  travel:{'mtn_eatonville|mtn_trek':12,'mtn_eatonville|mtn_ashford':30,'mtn_eatonville|mtn_gate':36,'mtn_eatonville|mtn_paradise':76,
    'mtn_trek|mtn_ashford':40,'mtn_trek|mtn_gate':46,'mtn_trek|mtn_paradise':86,'mtn_ashford|mtn_gate':6,'mtn_ashford|mtn_paradise':46,'mtn_gate|mtn_paradise':40},
  neighbors:[
    {id:'mtn_june',n:'June',ic:'🏕️',at:['mtn_ashford','mtn_gate'],d:'Runs the general store in Ashford that her parents ran before her. Sells firewood, chains, sandwiches and advice in that order, and can tell you by looking at the clouds over the ridge whether you’ll see the mountain today.'},
    {id:'mtn_omar',n:'Omar',ic:'🦬',at:['mtn_trek','mtn_eatonville'],d:'Drives the tram at Northwest Trek and narrates every bison by name. Grew up in Eatonville, studied wildlife biology in Seattle, and came straight back home because, he says, the elk here were better company.'},
    {id:'mtn_bea',n:'Ranger Bea',ic:'🎒',at:['mtn_paradise','mtn_gate'],d:'A park ranger who leads the wildflower walks at Paradise in summer and snowshoe walks in winter. Has climbed the mountain six times and talks about it least of anyone you’ve ever met.'},
  ],
  actions:(loc,d,m)=>{const a=[],at=(lo,hi)=>m>=lo&&m<hi,mo=dateOf(d).m;
    if(loc==='mtn_eatonville'){
      const open=isOpen('mtn_eatonville'),c=rp(12);
      if(!once('diner'))a.push({ic:'🍳',l:`A big plate at the Mashell Diner — ${$(c)}`,s:open?(canAfford(c)?'40 min. Energy +16, stress −5. Once a day.':'Not enough cash.'):hoursTxt('mtn_eatonville'),cat:'food',dis:!open||!canAfford(c),
        fn:()=>{spend(c);mark('diner');pass(40);adj('energy',16);adj('stress',-5);S.stats.meals++;say(pick(['🍳 Chicken-fried steak, eggs and hash browns, and a cinnamon roll the size of a hubcap “for the road.” The log-truck drivers at the counter all know the waitress’s grandkids by name.','🍳 Huckleberry pancakes and a window on the main street. A truck goes by loaded with logs bigger around than you are tall.']))}});
      a.push({ic:'🌲',l:'Walk down to the river',s:`30 min. ${cap(calmTxt(7))}.`,cat:'rest',fn:()=>{pass(30);calm(7);S.stats.walks++;say('🌲 The Mashell River runs cold and clear over round stones below the town, under alders and moss. The only sounds are water and a woodpecker.')}});
    }
    if(loc==='mtn_trek'){
      const open=isOpen('mtn_trek'),c=rp(33);
      a.push({ic:'🦬',l:`Ride the tram through the wildlife area — ${$(c)}`,s:open?(canAfford(c)?'2 hours with the paths. Stress −16, energy −4, community +1.':'Not enough cash.'):'Northwest Trek is open daily in summer and on Fridays to Sundays the rest of the year.',cat:'here',cls:open&&canAfford(c)?'primary':'',dis:!open||!canAfford(c),
        fn:()=>{spend(c);pass(120);adj('stress',-16);adj('energy',-4);adj('community',1);S.stats.walks++;const x=meet('mtn_omar');
          say(pick(['🦬 A bison the size of a car walks right up to the tram and stares in the window. Then a herd of elk, a mother moose and her calf in a pond, and bighorn sheep standing on a stump like they’re posing.','🦬 Out on the wide meadows the bison are rolling in the dust, the elk bugle from the trees, and a pair of trumpeter swans glides across the lake. On the paths after: a black bear asleep on his back, and two gray wolves trotting a long loop.'])
          +(x?` The driver knew every animal’s name: <b>Omar</b>. ${nb('mtn_omar').d}`:''))}});
    }
    if(loc==='mtn_ashford'){
      const open=isOpen('mtn_ashford'),c=rp(9);
      if(!once('sandwich'))a.push({ic:'🥪',l:`A sandwich and coffee for the drive up — ${$(c)}`,s:open?(canAfford(c)?'20 min. Energy +10. Once a day.':'Not enough cash.'):hoursTxt('mtn_ashford'),cat:'food',dis:!open||!canAfford(c),
        fn:()=>{spend(c);mark('sandwich');pass(20);adj('energy',10);const x=meet('mtn_june');say('🥪 Turkey on thick bread, a coffee in a paper cup and a weather report you didn’t ask for.'+(x?` “Clouds are lifting by noon,” says the woman behind the counter, and she is always right: <b>June</b>. ${nb('mtn_june').d}`:''))}});
      if(winter(d)){const ch=rp(60);if(!HF().mtn_chains)a.push({ic:'⛓️',l:`Buy tire chains for the car — ${$(ch)}`,s:open?(canAfford(ch)?'15 min. In winter you have to carry chains in the park. You keep them.':'Not enough cash.'):hoursTxt('mtn_ashford'),cat:'here',dis:!open||!canAfford(ch),
        fn:()=>{spend(ch);HF().mtn_chains=d+1;pass(15);say('⛓️ A box of chains that you hope you never have to put on in the snow. June shows you how anyway, on the store’s demo tire, twice.')}})}
    }
    if(loc==='mtn_gate'){
      a.push({ic:'🌳',l:'Walk the Trail of the Shadows at Longmire',s:`45 min. ${cap(calmTxt(10))}.`,cat:'rest',fn:()=>{pass(45);calm(10);S.stats.walks++;say(pick(['🌳 A short loop around a meadow where the park began: mineral springs bubbling orange and rusty, an old homesteader’s cabin, and cedars so big three people couldn’t reach around them.','🌳 The forest is so tall and quiet it feels like being indoors. A Douglas squirrel scolds you from a log the whole way around.']))}});
      a.push({ic:'💧',l:'Stop at Christine Falls on the way up',s:mtnRoad().open?`20 min. ${cap(calmTxt(5))}.`:'The road up is closed right now.',cat:'here',dis:!mtnRoad().open,fn:()=>{pass(20);calm(5);say('💧 Under an old stone bridge, a waterfall drops through a slot in black rock, loud and cold, the spray hanging in the air. Everyone takes the same picture. So do you.')}});
    }
    if(loc==='mtn_paradise'){
      const w=winter(d);
      if(!w)a.push({ic:'🥾',l:'Hike the Skyline Trail loop',s:`3 hours. Energy −24, stress −26, community +1. Once a day.`,cat:'rest',cls:'primary',dis:once('skyline')||S.energy<25,
        fn:()=>{mark('skyline');pass(180);adj('energy',-24);adj('stress',-26);adj('community',1);S.stats.walks++;say(pick(['🥾 Up through meadows of purple lupine and red paintbrush to Panorama Point, where the glaciers crack and groan right above you and you can see Mount Adams, Mount St. Helens and Mount Hood standing in a row to the south. A marmot whistles at you like a referee.','🥾 Snow patches in July, a creek of meltwater crossing the trail, a family of ptarmigan in summer brown, and at the top a view so big that nobody at the overlook talks for a minute.']))}});
      else a.push({ic:'❄️',l:'Snowshoe on the meadows',s:'2 hours. Energy −18, stress −22, community +1. Once a day.',cat:'rest',cls:'primary',dis:once('snowshoe')||S.energy<20,
        fn:()=>{mark('snowshoe');pass(120);adj('energy',-18);adj('stress',-22);adj('community',1);const x=meet('mtn_bea');say('❄️ Snow taller than the inn’s ground floor, the trail a blue groove in a white world, and the mountain so close and bright you have to squint. A gray jay lands on your glove.'+(x?` The ranger leading the walk shows you a snow cave a fox dug: <b>Ranger Bea</b>. ${nb('mtn_bea').d}`:''))}});
      a.push({ic:'🌸',l:w?'Warm up in the visitor center':'Join a ranger’s wildflower walk',s:`45 min. ${cap(calmTxt(9))}, community +1.`,cat:'people',fn:()=>{pass(45);calm(9);adj('community',1);const x=!w&&meet('mtn_bea');
        say(w?'🌸 Wet boots, cocoa, a fireplace and a big model of the mountain with its 25 glaciers. A little kid presses her nose to the window and announces, “It’s SO big.”':'🌸 Avalanche lilies, magenta paintbrush, the white puffs of western anemone gone to seed that the rangers call “hippies on a stick.” The ranger asks everyone to stay on the trail: one footstep can flatten a meadow plant that took years to grow.'+(x?` <b>Ranger Bea</b>. ${nb('mtn_bea').d}`:''))}});
    }
    return a;
  },
});

// until the county engine (72-county.js) is in the build, the places stay hidden (it adds its own countyOn() gate on top)
for(const K of [KEY])for(const k of Object.keys(HOODS[K].places)){const p=L[k],d0=Object.getOwnPropertyDescriptor(p,'hidden');if(d0&&d0.get)continue;let h=!!(d0&&d0.value);
  Object.defineProperty(p,'hidden',{configurable:true,enumerable:true,get(){return h||typeof countyOn!=='function'},set(v){h=v}})}

// ---- the road to Paradise, and the park fee at the Nisqually Entrance ----
const driving=()=>{try{return typeof window.CAR!=='undefined'&&!!window.CAR&&!!CAR.driving()}catch(e){return false}};
{const g0=go;go=function(dest){
  try{if(S&&!isGrow()&&L[dest]&&dest!==S.loc&&hoodOf(dest)===KEY){
    if(hoodOf(S.loc)!==KEY&&!driving()){say(`🚗 No bus goes out to Eatonville or the mountain. It is a drive: about an hour to Eatonville, two to Paradise, and most of a day there and back. ${window.CAR&&CAR.owns&&CAR.owns()?'Use 🚗 Drive.':'You’d need a car, or a friend with one.'}`);if(typeof render==='function')render();return}
    if(dest==='mtn_paradise'){const r=mtnRoad(S.t+travelMins(S.loc,dest));if(!r.open){say(r.why);if(typeof render==='function')render();return}}
    if(inPark(dest)&&!inPark(S.loc)&&!feePaid()&&!canAfford(parkFee())){say(`🪵 The park fee is ${$(parkFee())} a car, good for seven days, and you don’t have it on you. You turn around at the gate.`);if(typeof render==='function')render();return}}}catch(e){console.error(e)}
  return g0.apply(this,arguments)}}
{const oa=onArrive;onArrive=function(dest,from){const r=oa.apply(this,arguments);
  try{if(!isGrow()&&inPark(dest)&&!inPark(from)){if(feePaid())say('🪵 Your park pass from earlier this week is still on the dashboard. The ranger waves you through.');
    else{const c=parkFee();spend(c);HF().mtn_fee=day();say(`🪵 The ranger at the Nisqually Entrance takes the park fee, ${$(c)} for the car, good for seven days, and hands you a map and a pass for the dashboard.${winter(day())&&!HF().mtn_chains?' “You have chains? You’re supposed to carry them up here in winter.”':''}`)}}}catch(e){console.error(e)}return r}}

// ---- events ----
const here=(c,k)=>!isGrow()&&c&&c.at===k;
defEvent({id:'mtn_out',hook:'arrive',tile:['🏔️','The mountain is out','good'],chance:0.5,max:3,cooldown:10,cond:c=>(here(c,'mtn_paradise')||here(c,'mtn_ashford'))&&daytime()&&(typeof wxOf!=='function'||['sun','breaks','spring1',null].includes(wxOf())),
  run:()=>{say('🏔️ The clouds slide off the summit all at once, and the mountain is out: white and enormous and close, every glacier and ridge sharp against a deep blue sky. People all over the parking lot just stop.')},
  choices:()=>stopWatch({mins:15,calm:10,community:1,text:'🏔️ You stand there with a bunch of strangers, nobody saying much. Somebody laughs, for no reason, and everybody understands.'}),dflt:1});
defEvent({id:'mtn_bear',hook:'arrive',tile:['🐻','A bear by the road','info'],chance:0.25,max:2,cooldown:20,cond:c=>{const o=dateOf(day());return (here(c,'mtn_paradise')||here(c,'mtn_gate'))&&o.m>=6&&o.m<=9&&daytime()},
  run:()=>{say('🐻 A black bear is eating huckleberries on a slope just above the road, and a line of cars has stopped to look. A ranger is walking down the line saying “stay in your cars, folks, please.”')},
  choices:()=>[
    {ic:'🚗',l:'Watch from the car for a few minutes',s:'10 min. Stress −6.',fn:()=>{pass(10);adj('stress',-6);say('🐻 The bear strips a bush with total concentration, ignores twenty cars and a ranger, and ambles off into the trees.')}},
    {ic:'🛣️',l:'Keep the line moving',s:'Community +1.',fn:()=>{adj('community',1);say('🐻 You roll past slowly. The ranger gives you a thumbs-up for not stopping in the road.')}}],dflt:1});
defEvent({id:'mtn_chains',hook:'arrive',tile:['⛓️','Chains required','bad'],chance:0.6,max:2,cooldown:7,cond:c=>here(c,'mtn_gate')&&winter(day())&&!HF().mtn_chains&&!HF()['mtn_chainsAsked_'+day()],
  run:()=>{HF()['mtn_chainsAsked_'+day()]=true;say('⛓️ A sign at the entrance: TIRE CHAINS REQUIRED TO BE CARRIED. The ranger asks if you have chains in the car. You do not.')},
  choices:()=>{const c=rp(25);return [
    {ic:'🔁',l:`Rent a set from the store in Ashford and come back — ${$(c)}`,s:'30 min round trip.',dis:!canAfford(c),fn:()=>{spend(c);pass(30);HF().mtn_chains=day()+1;say('⛓️ Back down to Ashford, where June rents you a set of chains with a look that says “every winter, somebody.” Back up to the gate, and the ranger waves you on.')}},
    {ic:'🌲',l:'Stay down in the forest today',s:'Nothing changes. The road above Longmire is out for you today.',fn:()=>{HF()['mtn_noChains_'+day()]=true;say('🌲 You stay among the big trees at Longmire today. The meadows will be there.')}}]},dflt:1});
// no chains: the road up stays closed today
{const g1=go;go=function(dest){try{if(dest==='mtn_paradise'&&S&&!isGrow()&&HF()['mtn_noChains_'+day()]&&!HF().mtn_chains){say('⛓️ Not without chains, in winter. The ranger at the gate shakes her head.');if(typeof render==='function')render();return}}catch(e){}return g1.apply(this,arguments)}}
window.MOUNTAIN_KEY=KEY;
// the Go somewhere heading and the phone say "Drive" here, not a bus (the engine sets the ride up after every pack loads)
setTimeout(()=>{try{const R=HOODS[KEY].ride,d=Object.getOwnPropertyDescriptor(R,'via');if(d&&d.configurable)Object.defineProperty(R,'via',{configurable:true,enumerable:true,get(){return '🚗 Drive only'}})}catch(e){}},0);

// ---- the guide: the Pierce County chapter's section (72-county.js) ----
if(typeof countyGuideAreas==='function'){const g=countyGuideAreas;countyGuideAreas=function(){return g()+`<h3>🏔️ Eatonville and the mountain</h3>
  <p>A day trip by car: no bus goes out here. Eatonville is about an hour away, with a diner and the Mashell River; Northwest Trek Wildlife Park (opened in 1975) takes you by tram past bison, elk and moose. Past Ashford, the Nisqually Entrance of Mount Rainier National Park charges a fee per car (good for seven days), and the road climbs through old forest to Paradise: wildflower meadows and the Skyline Trail in summer, snowshoe walks in winter. Paradise is about two hours each way, so plan on most of the day. From November to April the road above Longmire is open only in the daytime, you must carry tire chains, and a snow day shuts the gate.</p>`}}
})();
