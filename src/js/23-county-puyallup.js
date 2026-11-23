// ============================================================
//  TACOMPTON, Pierce County area pack: Puyallup (the valley town east of Tacoma, under the mountain).
//  The fairgrounds (the fair runs every September; called the Puyallup Fair until the 2013 rename to the Washington State
//  Fair; the fair's jam scones are a tradition since 1915, and the old wooden roller coaster since 1935), downtown Pioneer
//  Park with the library and the Ezra Meeker statue, the Meeker Mansion (1890, a museum of the Puyallup Historical Society)
//  and the valley farms (daffodils in spring, berries in summer, pumpkins in the fall). The farms and the stands are
//  invented. Prefix pu_. county:true (72-county.js decides when the county is open to you).
//  The lahar sirens' monthly test (first Monday at noon) is in the game from 2000.
// ============================================================
(function(){
const KEY='puyallup';
const HF=()=>(S.hoodFlags=S.hoodFlags||{});
const once=k=>!!HF()[`${KEY}_${k}_${day()}`], mark=k=>{HF()[`${KEY}_${k}_${day()}`]=true};
const meet=id=>{if(S.met[id])return false;S.met[id]=day()+1;S.stats.neighbors=metCount();adj('community',2);return true};
const nb=id=>NEIGHBORS.find(x=>x.id===id);
const tick=k=>{S.stats[k]=(S.stats[k]||0)+1};
const yr=()=>typeof yearNow==='function'?yearNow():2026;
const dt=()=>{try{if(S&&S.startDate&&typeof dateOf==='function')return dateOf(day())}catch(e){}return {y:yr(),m:8,d:3,dow:0}};
const mon=()=>dt().m;
const gate=()=>{try{return typeof countyOn==='function'&&!!countyOn()}catch(e){return false}};
// the fair: every September, 10 AM to 10 PM; its name changed in 2013
const fairName=()=>yr()>=2013?'Washington State Fair':'Puyallup Fair';
const fairOn=()=>mon()===9;
const fairOpen=m=>fairOn()&&m>=600&&m<1320;

defHood({
  key:KEY, name:'Puyallup', ic:'🎡', county:true, startable:true,
  blurb:'A valley town east of Tacoma with Mount Rainier at the end of the main street: the big fair every September, an old downtown park, a Victorian mansion and farms all down the valley.',
  hub:'pu_pioneer', ride:{via:'bus',mins:50,fare:2,drive:25},
  guide:'Puyallup is east of Tacoma, up the valley (a long bus ride, or about 25 minutes by car). Every September the Washington State Fair (the Puyallup Fair before 2013) fills the fairgrounds with rides, animals and the famous scones with raspberry jam. Downtown has Pioneer Park and the library, the Meeker Mansion is a museum a few blocks away, and the valley farms have daffodils in spring, berries in summer and pumpkins in the fall.',
  places:{
    pu_pioneer:{name:'Pioneer Park, downtown',ic:'🌳',desc:'The park in the middle of downtown Puyallup: big shade trees, a statue of the pioneer Ezra Meeker, a playground, the public library and old brick storefronts across the street',
      art:({night:n})=>`${starsSky(n)}${rainier(n,360,.55,92)}
        <rect y="100" width="480" height="50" fill="${n?'#1c2c22':'#7aa06e'}"/>
        ${[['BOOKS','#7a3b6e',10],['HARDWARE','#2f6b4a',90]].map(([t,c,x])=>`<rect x="${x}" y="56" width="76" height="50" fill="${n?'#40251f':'#a8553f'}"/><rect x="${x+6}" y="62" width="64" height="11" rx="2" fill="${c}"/><text x="${x+38}" y="70.5" text-anchor="middle" font-size="7" ${SVGF} fill="#fff">${t}</text><rect x="${x+8}" y="78" width="30" height="20" fill="${win(n)}"/><rect x="${x+48}" y="80" width="18" height="26" fill="${n?'#1a1a20':'#4a3226'}"/>`).join('')}
        ${tree(200,n,24,130)}${tree(420,n,22,130)}${tree(460,n,16,130)}
        <rect x="282" y="104" width="22" height="10" fill="${n?'#4a4a50':'#b9b4a6'}"/><rect x="288" y="80" width="10" height="24" rx="3" fill="${n?'#3a4048':'#6a7a72'}"/><circle cx="293" cy="76" r="5" fill="${n?'#3a4048':'#6a7a72'}"/><path d="M298 88 l10 -14" stroke="${n?'#3a4048':'#6a7a72'}" stroke-width="2.5"/>
        <rect x="320" y="112" width="40" height="3" fill="${n?'#555':'#c0392b'}"/><path d="M322 115 v20 M358 115 v20" stroke="${n?'#555':'#c0392b'}" stroke-width="2"/>
        <path d="M0 144 Q140 136 240 142 T480 140" stroke="${n?'#3a3c3a':'#cdc5b0'}" stroke-width="5" fill="none"/>
        ${person(240,n,'#c0392b',146,.9)}${person(256,n,'#2a6fa8',146,.7)}${lamp(170,n,146)}${lamp(380,n,146)}`},
    pu_fair:{name:'The fairgrounds',ic:'🎡',desc:'The big fairgrounds near downtown: barns, grandstands, an old wooden roller coaster and midway, quiet most of the year and packed every September for the fair',
      art:({night:n})=>{const on=fairOn();return `${starsSky(n)}
        <g><circle cx="110" cy="70" r="52" fill="none" stroke="${n?(on?'#f7d77a':'#4a4f55'):'#c0392b'}" stroke-width="3"/>${[0,1,2,3,4,5,6,7].map(i=>{const a=i*Math.PI/4;return `<path d="M110 70 L${110+52*Math.cos(a)} ${70+52*Math.sin(a)}" stroke="${n?(on?'#f7d77a':'#4a4f55'):'#999'}" stroke-width="1.2"/><rect x="${104+52*Math.cos(a)}" y="${70+52*Math.sin(a)}" width="12" height="9" rx="2" fill="${['#2a6fa8','#c98a12','#2f8f6a','#7a3b6e'][i%4]}"/>`}).join('')}<path d="M110 70 L84 140 M110 70 L136 140" stroke="${n?'#4a4f55':'#777'}" stroke-width="3"/>${n&&on?'<circle cx="110" cy="70" r="56" fill="#f7d77a" opacity=".08"/>':''}</g>
        <path d="M200 140 L200 70 Q230 40 260 80 Q290 120 320 60 Q350 30 380 90 L380 140" stroke="${n?'#5a4a3a':'#e9e0cf'}" stroke-width="4" fill="none"/>${[210,240,270,300,330,360].map(x=>`<path d="M${x} 140 V${x<300?96:84}" stroke="${n?'#4a3a2a':'#c9bea8'}" stroke-width="2"/>`).join('')}
        <rect x="390" y="92" width="80" height="48" fill="${n?'#3a1e1a':'#a8352a'}"/><path d="M384 94 L430 70 L476 94 Z" fill="${n?'#2a2224':'#5a3a34'}"/><rect x="418" y="108" width="24" height="32" fill="${n?'#241614':'#f1e8d8'}"/>
        ${on?`${[0,1,2,3,4,5].map(i=>`<path d="M${150+i*50} 126 l20 -14 l20 14 z" fill="${['#c0392b','#f2f2f2','#2a6fa8','#f2f2f2','#c98a12','#f2f2f2'][i]}"/>`).join('')}${person(170,n,'#c0392b',146,.85)}${person(190,n,'#2f8f6a',146,.7)}${person(300,n,'#2a6fa8',146,.85)}${person(320,n,'#c98a12',146,.85)}${person(440,n,'#7a3b6e',146,.85)}`:`<path d="M0 132 H480" stroke="${n?'#555':'#999'}" stroke-width="1"/>${[0,1,2,3,4,5,6,7,8,9,10,11].map(i=>`<rect x="${i*40}" y="128" width="2" height="12" fill="${n?'#555':'#999'}"/>`).join('')}`}
        <rect y="140" width="480" height="10" fill="${HC.walk(n)}"/>`}},
    pu_meeker:{name:'Meeker Mansion',ic:'🏛️',desc:'The 17-room Victorian house that the pioneer Ezra Meeker and his wife Eliza Jane finished in 1890, now a museum: painted ceilings, carved fireplaces, stained glass and a garden',
      hours:d=>d%7>=2?[720,960]:null,
      art:({night:n})=>`${starsSky(n)}
        <rect y="132" width="480" height="18" fill="${n?'#1c2c22':'#7aa06e'}"/>
        <g><rect x="130" y="50" width="220" height="86" fill="${n?'#3a3236':'#d8c8b0'}"/><rect x="200" y="22" width="80" height="30" fill="${n?'#3a3236':'#d8c8b0'}"/>
          <path d="M122 52 L240 30 L358 52 Z" fill="${n?'#2a2224':'#5a4a44'}"/><path d="M194 24 L240 6 L286 24 Z" fill="${n?'#2a2224':'#5a4a44'}"/>
          ${[0,1,2,3,4,5].map(i=>`<rect x="${144+i*34}" y="62" width="16" height="26" rx="3" fill="${win(n,i!==2)}"/><rect x="${144+i*34}" y="100" width="16" height="26" rx="3" fill="${win(n,i%2===0)}"/><rect x="${141+i*34}" y="58" width="22" height="4" fill="${n?'#4a3a36':'#a8553f'}"/>`).join('')}
          <rect x="218" y="30" width="16" height="16" rx="3" fill="${win(n)}"/><rect x="246" y="30" width="16" height="16" rx="3" fill="${win(n,false)}"/>
          <rect x="120" y="96" width="240" height="4" fill="${n?'#4a3a36':'#f1e8d8'}"/>${[0,1,2,3,4,5,6,7].map(i=>`<rect x="${124+i*32}" y="100" width="3" height="36" fill="${n?'#4a3a36':'#f1e8d8'}"/>`).join('')}
          <rect x="226" y="108" width="28" height="28" fill="${n?'#241614':'#6a3f2e'}"/><rect x="230" y="110" width="20" height="8" fill="${n?'#7a5a2a':'#c98a12'}" opacity=".8"/></g>
        ${tree(60,n,24,140)}${tree(420,n,26,140)}${person(380,n,'#2a6fa8',146,.85)}`},
    pu_farms:{name:'The valley farms',ic:'🌷',desc:'Flat green farmland down the Puyallup valley with the mountain over it: daffodil and tulip fields in spring, berry rows in summer, pumpkins and corn in the fall, and a farm stand by the road (invented)',
      art:({night:n})=>{const mo=mon(),c=mo>=3&&mo<=4?'#f2d23a':mo>=6&&mo<=7?'#c0392b':mo>=9&&mo<=10?'#e07a20':'#4a7a3a';return `${starsSky(n)}${rainier(n,300,.9,96)}
        <rect y="96" width="480" height="54" fill="${n?'#1c2c22':'#6f9a5a'}"/>
        ${[0,1,2,3,4,5].map(i=>`<path d="M0 ${102+i*8} L480 ${100+i*9}" stroke="${n?'#2a3a2a':c}" stroke-width="${3+i}" opacity="${n?.6:.85}" stroke-dasharray="${i%2?'6 4':'10 3'}"/>`).join('')}
        <rect x="370" y="104" width="70" height="30" fill="${n?'#3a1e1a':'#a8352a'}"/><path d="M364 106 L405 86 L446 106 Z" fill="${n?'#2a2224':'#f1e8d8'}"/><rect x="388" y="116" width="34" height="18" fill="${n?'#241614':'#6a3f2e'}"/>
        <rect x="30" y="122" width="60" height="18" fill="${n?'#3a2a22':'#b98b62'}"/><path d="M26 122 h68 l-6 -8 h-56 z" fill="${n?'#4a2418':'#c0392b'}"/><text x="60" y="134" text-anchor="middle" font-size="7" ${SVGF} fill="${n?'#f7d77a':'#fff'}">FARM STAND</text>
        ${person(110,n,'#2f8f6a',146,.85)}${person(126,n,'#c98a12',146,.7)}`}},
  },
  travel:{'pu_pioneer|pu_fair':8,'pu_pioneer|pu_meeker':6,'pu_pioneer|pu_farms':15,'pu_fair|pu_meeker':10,'pu_fair|pu_farms':15,'pu_meeker|pu_farms':16},
  neighbors:[
    {id:'pu_bernice',n:'Bernice',ic:'🧁',at:['pu_fair','pu_pioneer'],d:'Has worked a fair booth every September for forty years and still gets butterflies on opening day. Enters her pies in the baking contest every year and has opinions about the judges.'},
    {id:'pu_gus',n:'Gus',ic:'🚜',at:['pu_farms'],d:'Third-generation valley farmer with dirt in every crease and a laugh you can hear across a field. Runs the farm stand with his granddaughter and gives every kid a free berry.'},
    {id:'pu_edith',n:'Edith',ic:'🏛️',at:['pu_meeker','pu_pioneer'],d:'Volunteer docent at the Meeker Mansion who dresses the part on special days, bonnet and all. Can tell you who slept in every room and what they ate for breakfast.'},
  ],
  actions:(loc,d,m)=>{const a=[],at=(lo,hi)=>m>=lo&&m<hi;
    if(loc==='pu_pioneer'){
      a.push({ic:'🌳',l:'Sit in the park under the big trees',s:`30 min. ${cap(calmTxt(8))}.`,cat:'rest',
        fn:()=>{pass(30);calm(8);tick('walks');say(pick(['🌳 Kids on the play structure, old men on a bench, and the mountain filling the end of Meridian like a painted backdrop.','🌳 Ezra Meeker’s statue stands over the lawn: he came west on the Oregon Trail and walked it back east as an old man to save it from being forgotten. A pigeon sits on his hat.']))}});
      a.push({ic:'📚',l:'Read at the library',s:at(600,1200)?`45 min. ${cap(calmTxt(8))}. Free.`:'The library is open about 10 AM to 8 PM.',cat:'here',dis:!at(600,1200),
        fn:()=>{pass(45);calm(8);const x=Math.random()<.3&&meet('pu_edith');say('📚 A table by the window over the park, a local history book and the hum of the copier.'+(x?` A woman looking up old newspapers tells you which Meeker letter she’s hunting for: <b>Edith</b>. ${nb('pu_edith').d}`:''))}});
    }
    if(loc==='pu_fair'){
      const op=fairOpen(m);
      if(!fairOn())a.push({ic:'🎡',l:'Walk past the quiet fairgrounds',s:'15 min. Stress −2. The fair is every September.',cat:'here',
        fn:()=>{pass(15);adj('stress',-2);say(`🎡 The gates are shut, the roller coaster is still and a lone tractor is mowing between the barns. In September this is the ${fairName()}, and a million people come.`)}});
      else{
        const g=rp(15);a.push({ic:'🎟️',l:`Go to the ${fairName()} — ${$(g)}`,s:op?(canAfford(g)?'2 hours. Stress −14, energy −6, community +2.':'Not enough cash.'):'The fair is open 10 AM to 10 PM in September.',cat:'here',cls:op?'primary':'',dis:!op||!canAfford(g),
          fn:()=>{spend(g);pass(120);adj('stress',-14);adj('energy',-6);adj('community',2);const x=meet('pu_bernice');say(pick(['🎟️ The barns, the grandstand, a man selling knives that cut through shoes, a prize rabbit the size of a dog. You walk until your feet give out.','🎟️ The midway lights, the smell of onions on the grill and a 4-H kid leading a calf that does not want to be led.'])+(x?` A woman at a pie booth hands you a fork: “Tell me the truth.” <b>Bernice</b>. ${nb('pu_bernice').d}`:''))}});
        if(!once('scones')){const c=rp(5);a.push({ic:'🧁',l:`Get a bag of the famous fair scones — ${$(c)}`,s:op?(canAfford(c)?'20 min. Energy +8, stress −6. Once a day.':'Not enough cash.'):'The scone booth is open while the fair is.',cat:'food',dis:!op||!canAfford(c),
          fn:()=>{spend(c);mark('scones');pass(20);adj('energy',8);adj('stress',-6);tick('meals');say('🧁 A warm scone split open with butter and raspberry jam, from the booth that’s been making them at the fair since 1915. The line was long. It was worth it.')}})}
        if(!once('coaster')){const c=rp(6);a.push({ic:'🎢',l:`Ride the old wooden roller coaster — ${$(c)}`,s:op?(canAfford(c)?'20 min. Stress −10, energy −2. Once a day.':'Not enough cash.'):'The rides run while the fair is open.',cat:'rest',dis:!op||!canAfford(c),
          fn:()=>{spend(c);mark('coaster');pass(20);adj('stress',-10);adj('energy',-2);say('🎢 Clack, clack, clack up the first hill, a view of the whole valley and the mountain, and then everyone screams at once. It has been doing this since 1935.')}})}
        a.push({ic:'🐄',l:'Visit the animal barns',s:op?'40 min. Stress −6, community +1. Free with the gate.':'The barns are open while the fair is.',cat:'people',dis:!op,
          fn:()=>{pass(40);adj('stress',-6);adj('community',1);say(pick(['🐄 Cows getting blow-dried for the show ring, goats that eat your ticket stub, and a pig named Rosie asleep in the straw with a blue ribbon.','🐑 A barn of sheep, a barn of rabbits, and kids in white shirts brushing their animals before judging. A llama looks at you like it knows something.']))}});
      }
    }
    if(loc==='pu_meeker'){
      const open=isOpen('pu_meeker'),c=rp(8);
      a.push({ic:'🏛️',l:`Tour the Meeker Mansion — ${$(c)}`,s:open?(canAfford(c)?`1 hour. ${cap(calmTxt(10))}, community +1.`:'Not enough cash.'):'Open Wednesday to Sunday, noon to 4 PM.',cat:'here',dis:!open||!canAfford(c),
        fn:()=>{spend(c);pass(60);calm(10);adj('community',1);const x=meet('pu_edith');say('🏛️ Painted ceilings, a carved staircase and stained glass. Ezra Meeker started a hop farm here, laid out the town and later walked the Oregon Trail again to save it from being forgotten.'+(x?` Your guide, in a bonnet: <b>Edith</b>. ${nb('pu_edith').d}`:''))}});
      a.push({ic:'🌹',l:'Walk the garden and the old street',s:`20 min. ${cap(calmTxt(5))}.`,cat:'rest',
        fn:()=>{pass(20);calm(5);tick('walks');say('🌹 Roses along the fence, a carriage step by the curb, and big old houses down the block.')}});
    }
    if(loc==='pu_farms'){
      const mo=mon();
      const what=mo>=3&&mo<=4?['🌷','Walk the daffodil and tulip fields','🌷 Rows of yellow as far as you can see, with the mountain at the end of them. Your shoes are muddy and you don’t care.']
        :mo>=6&&mo<=7?['🍓','Pick a flat of berries','🍓 Strawberries warm from the sun, and for every one in the flat, one in your mouth. Nobody is counting.']
        :mo>=9&&mo<=10?['🎃','Find a pumpkin in the patch','🎃 A field of orange, a hay ride and a corn maze you get lost in on purpose. You pick a lopsided one.']
        :['🥬','Buy vegetables at the farm stand','🥬 Carrots with the dirt still on them, a bag of potatoes and a jar of honey from the hives behind the barn.'];
      if(!once('farm')){const c=rp(8);a.push({ic:what[0],l:`${what[1]} — ${$(c)}`,s:canAfford(c)?(at(540,1140)?'1 hour. Stress −8, energy −3, and food for home. Once a day.':'The farms are open about 9 AM to 7 PM.'):'Not enough cash.',cat:'food',dis:!canAfford(c)||!at(540,1140),
        fn:()=>{spend(c);mark('farm');pass(60);adj('stress',-8);adj('energy',-3);if(typeof S.food==='number')S.food+=1;const x=meet('pu_gus');say(what[2]+(x?` The farmer at the stand weighs it with a wink: <b>Gus</b>. ${nb('pu_gus').d}`:''))}})}
      a.push({ic:'🏔️',l:'Look at the mountain over the fields',s:'15 min. Stress −5.',cat:'rest',
        fn:()=>{pass(15);adj('stress',-5);say('🏔️ Out here the mountain isn’t a view, it’s a neighbor: huge and close, the snowfields lit up pink or gray depending on the weather.')}});
    }
    return a;
  },
});

const P=HOODS[KEY].places;
for(const k of Object.keys(P)){const p=L[k];let h=!!p.hidden;
  Object.defineProperty(p,'hidden',{configurable:true,enumerable:true,get(){return h||!gate()},set(v){h=v}})}
Object.defineProperty(L.pu_fair,'name',{configurable:true,enumerable:true,get(){return fairOn()?`The ${fairName()}`:'The fairgrounds'},set(){}});
HOODS[KEY].opens={};HOODS[KEY].fairName=fairName;

const puAt=(c,k)=>!isGrow()&&hoodOf(c.at)===KEY&&(!k||c.at===k);
defEvent({id:'pu_fairday',hook:'arrive',tile:['🎡','Fair day','good'],chance:0.6,max:3,cooldown:2,cond:c=>puAt(c)&&fairOpen(tod()),
  run:()=>{say(`🎡 It’s fair time in Puyallup: traffic backed up on Meridian, parking signs on every lawn, and the smell of fried onions all the way downtown. The ${fairName()} is open.`)},
  choices:()=>{const r=rp(12),s=rp(5);return [
    {ic:'🎢',l:`Rides on the midway — ${$(r)}`,s:'1 hour. Stress −12, energy −4.',dis:!canAfford(r),fn:()=>{spend(r);pass(60);adj('stress',-12);adj('energy',-4);say('🎢 The roller coaster, the swings and a ride that spins you upside down. You walk off a little sideways and grinning.')}},
    {ic:'🧁',l:`Stand in line for the scones — ${$(s)}`,s:'30 min. Energy +8, stress −5, community +1.',dis:!canAfford(s),fn:()=>{spend(s);pass(30);adj('energy',8);adj('stress',-5);adj('community',1);tick('meals');say('🧁 Warm scones with butter and raspberry jam, a fair tradition since 1915. The family behind you in line tells you about every fair they’ve been to.')}},
    {ic:'🐐',l:'See the animals in the barns',s:'45 min. Stress −6, community +2. Free with the gate.',fn:()=>{pass(45);adj('stress',-6);adj('community',2);say('🐐 A girl of about ten shows you her goat, Pancake, who won second place and doesn’t care at all.')}},
    {ic:'🚶',l:'Skip the crowds today',s:'Nothing changes.',fn:()=>{say('🎡 You go around the traffic and the crowds. The fair runs all month.')}}]},dflt:3});
defEvent({id:'pu_daffodil',hook:'arrive',tile:['🌼','The Daffodil Parade','good'],chance:0.7,max:1,cond:c=>puAt(c,'pu_pioneer')&&mon()===4&&tod()>=600&&tod()<1020,
  run:()=>{say('🌼 The Daffodil Parade is coming down Meridian: floats covered in thousands of daffodils, marching bands, the festival royalty waving from convertibles, and people in lawn chairs ten deep.')},
  choices:()=>[
    {ic:'🪑',l:'Find a spot on the curb and watch it all',s:'1 hour. Stress −10, community +3.',fn:()=>{pass(60);adj('stress',-10);adj('community',3);say('🌼 A float shaped like a giant teapot made of daffodils, a band playing the same song twice, and a family that shares their thermos of cocoa with you.')}},
    {ic:'👏',l:'Watch a few floats go by',s:'15 min. Stress −4, community +1.',fn:()=>{pass(15);adj('stress',-4);adj('community',1);say('🌼 Three floats, a band and a convertible full of waving teenagers. Enough to make you smile all afternoon.')}},
    {ic:'🚶',l:'Go around the crowd',s:'Nothing changes.',fn:()=>{say('🌼 You cut down a side street. Yellow petals blow past you anyway.')}}],dflt:2});
defEvent({id:'pu_sirens',hook:'arrive',tile:['📢','The lahar siren test','info'],chance:1,max:3,cooldown:20,cond:c=>{const o=dt();return puAt(c)&&yr()>=2000&&o.dow===0&&o.d<=7&&tod()>=720&&tod()<750},
  run:()=>{say('📢 At noon a wailing siren goes off across the valley, then a voice: “This is a test of the lahar warning system.” Mount Rainier is a volcano, and if it ever sends a mudflow down the valley, these sirens give people time to get to high ground.')},
  choices:()=>[
    {ic:'🗺️',l:'Look up the walking route to high ground',s:'10 min. Stress −2. Good to know.',fn:()=>{pass(10);adj('stress',-2);setEventFlag('pu_lahar_route',true);say('🗺️ The sign on the corner shows the evacuation route: east, uphill, on foot. You walk the first block of it so you’ll remember.')}},
    {ic:'👂',l:'Listen, and carry on',s:'Nothing changes.',fn:()=>{say('📢 It stops, the birds start again, and everyone goes back to what they were doing. It happens the first Monday of every month.')}}],dflt:1});
})();
