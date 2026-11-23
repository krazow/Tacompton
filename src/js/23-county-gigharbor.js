// ============================================================
//  TACOMPTON, Pierce County pack: Gig Harbor, across the Tacoma Narrows (county:true; the county engine, 72-county.js,
//  decides when the county is open and draws the travel). The harbor and Harborview Drive (shops invented), Skansie
//  Brothers Park with the 1908 house and the old netshed on pilings (the city bought them in 2002), Jerisich Dock, and
//  the Narrows Bridges: the 1950 span and the 2007 span beside it (eastbound, the toll side). A place to start a life.
//  Prefix gig_. Registers itself with defHood() (20-world.js). narrows:true: the county engine charges the toll on a drive
//  back into Tacoma (from July 2007) and keeps the places hidden until the county is open.
// ============================================================
(function(){
const KEY='gigharbor';
const HF=()=>(S.hoodFlags=S.hoodFlags||{});
const once=k=>!!HF()[`${KEY}_${k}_${day()}`], mark=k=>{HF()[`${KEY}_${k}_${day()}`]=true};
const meet=id=>{if(S.met[id])return false;S.met[id]=day()+1;S.stats.neighbors=metCount();adj('community',2);return true};
const nb=id=>NEIGHBORS.find(x=>x.id===id)||{d:''};
const Y=()=>{try{return typeof yearNow==='function'?yearNow():2026}catch(e){return 2026}};   // (yearNow isn't ready while the files load)
const bridge2=()=>Y()>=2007;           // the second span opened in July 2007, with the toll
const parkOwned=()=>Y()>=2002;         // the city bought the Skansie house and netshed in 2002
const wood=n=>n?'#3a2a22':'#b98b62', red=n=>n?'#4a2420':'#a8403a', white=n=>n?'#3a3e46':'#efe9dc';
const water=n=>`<rect y="96" width="480" height="54" fill="${HC.bay(n)}"/><path d="M20 112 q22 -4 44 0 M140 126 q22 -4 44 0 M300 118 q22 -4 44 0 M400 132 q22 -4 44 0" stroke="${HC.bay2(n)}" stroke-width="2" fill="none" opacity=".7"/>`;
const boat=(x,y,n,c,s=1)=>`<g transform="translate(${x},${y}) scale(${s})"><path d="M-30 0 h60 l-8 10 h-44 z" fill="${n?'#2e3440':c}"/><rect x="-10" y="-12" width="22" height="12" fill="${white(n)}"/><rect x="-6" y="-9" width="6" height="5" fill="${win(n)}"/><path d="M4 -12 V-34" stroke="${n?'#666':'#4a4f55'}" stroke-width="1.6"/>${n?'<circle cx="4" cy="-35" r="1.8" fill="#f7d77a"/>':''}</g>`;
const hills=n=>`<path d="M0 98 Q80 70 170 88 T340 80 T480 92 V100 H0 Z" fill="${HC.hill(n)}"/>${[30,70,110,200,260,320,390,440].map((x,i)=>`<path d="M${x} ${88-(i%3)*4} l8 -18 l8 18 z" fill="${HC.leaf(n)}"/>`).join('')}`;

defHood({
  key:KEY, county:true, narrows:true, startable:true, rent:1.3,
  startBlurb:'A small harbor town across the Narrows Bridges: boats, an old waterfront street and the mountain at the mouth of the bay. Tacoma is a bus ride or a short drive back over the bridge.',
  schools:{town:'Gig Harbor',middle:'Goodman Middle School',high:'Gig Harbor High School'},
  home:{desc:'Your apartment in Gig Harbor, up the hill from the water: boxes, a bed, a fridge and, between two roofs, a slice of the harbor'},
  name:'Gig Harbor', ic:'⛵', blurb:'Across the Narrows Bridges from Tacoma: a small, round harbor ringed with docks and old boat sheds, a waterfront street of shops, and on a clear day the mountain standing right at the mouth of the bay.',
  hub:'gig_harbor', ride:{via:'bus',mins:45,fare:2,drive:25},
  places:{
    gig_harbor:{name:'Harborview Drive and the harbor',ic:'⛵',desc:'The waterfront street that curves around the harbor: a coffee shop, a bookstore, an ice-cream window and a boatyard, all invented, with sailboats and old wooden work boats tied up below',
      hours:d=>[480,1260],
      art:({night:n})=>`${starsSky(n)}${rainier(n,400,.55,98)}${water(n)}${hills(n)}
        ${boat(120,112,n,'#2a6fa8')}${boat(250,120,n,'#c0392b',.8)}${boat(360,110,n,'#2f6b4a',.7)}
        <rect x="0" y="134" width="480" height="16" fill="${n?'#2a2622':'#8a6e52'}"/>${[20,80,140,200,260,320,380,440].map(x=>`<rect x="${x}" y="130" width="4" height="20" fill="${wood(n)}"/>`).join('')}
        ${[['HARBOR BEANS','#2f6b4a',10],['TIDE & PAGE','#7a3b6e',98],['SCOOP','#c98a12',186]].map(([t,c,x])=>`<rect x="${x}" y="40" width="80" height="52" fill="${n?'#33343c':'#d9c9a7'}"/><rect x="${x+6}" y="46" width="68" height="11" rx="2" fill="#2a1e18"/><text x="${x+40}" y="54.5" text-anchor="middle" font-size="7.5" ${SVGF} fill="#f4e2a8">${t}</text><path d="M${x} 60 h80 l-5 9 h-70 z" fill="${c}"/><rect x="${x+8}" y="70" width="30" height="20" fill="${win(n)}"/><rect x="${x+48}" y="70" width="22" height="22" fill="${n?'#241a14':'#4a3226'}"/>`).join('')}
        ${person(60,n,'#c0392b',134,.9)}${person(300,n,'#2a6fa8',134,.9)}${lamp(276,n,134)}`},
    gig_skansie:{name:'Skansie Brothers Park and the netshed',ic:'🛖',get desc(){return parkOwned()
        ?'A small waterfront park around the Skansie family’s 1908 brick house and their old netshed: a long, red wooden shed on pilings over the water where the family kept the gear for their boats. Benches, a lawn, summer concerts and a splash fountain'
        :'The Skansie family’s 1908 brick house and their old red netshed on pilings over the water, still private: you see them from the road and the dock next door, like everybody does'},
      art:({night:n})=>`${starsSky(n)}${hills(n)}${water(n)}
        <g><rect x="230" y="68" width="170" height="44" fill="${red(n)}"/><polygon points="224,70 315,40 406,70" fill="${n?'#2a2224':'#5a3a30'}"/>
          ${[0,1,2,3,4,5].map(i=>`<path d="M${242+i*28} 70 V112" stroke="${n?'#2e1a18':'#8a2f2a'}" stroke-width="1.5"/>`).join('')}
          <rect x="300" y="82" width="30" height="30" fill="${n?'#1e1410':'#3a2620'}"/><rect x="250" y="80" width="18" height="12" fill="${win(n,false)}"/><rect x="362" y="80" width="18" height="12" fill="${win(n)}"/>
          ${[236,262,288,314,340,366,392].map(x=>`<rect x="${x}" y="112" width="4" height="30" fill="${wood(n)}"/>`).join('')}<rect x="226" y="110" width="178" height="4" fill="${wood(n)}"/></g>
        <rect x="40" y="54" width="110" height="56" fill="${n?'#40251f':'#a8553f'}"/><polygon points="34,56 95,30 156,56" fill="${n?'#2c3644':'#56657a'}"/>
        ${[0,1,2].map(i=>`<rect x="${54+i*32}" y="64" width="16" height="16" fill="${win(n,i!==1)}"/><rect x="${54+i*32}" y="88" width="16" height="16" fill="${win(n,i===1)}"/>`).join('')}
        <rect y="110" width="200" height="40" fill="${n?'#1a2a22':'#6f9a74'}"/>${tree(20,n,16,128)}${tree(180,n,14,128)}
        ${person(110,n,'#c98a12',140,.9)}${person(128,n,'#2a6fa8',140,.8)}${lamp(196,n,146)}`},
    gig_dock:{name:'Jerisich Dock',ic:'🛶',desc:'The long public dock in the middle of the harbor, where boats tie up for the afternoon, kids lie on their stomachs to count the sea stars on the pilings, and a stand rents kayaks and paddleboards in summer',
      hours:d=>[360,1320],
      art:({night:n})=>`${starsSky(n)}${rainier(n,380,.5,96)}${hills(n)}${water(n)}
        <rect x="60" y="116" width="360" height="6" fill="${wood(n)}"/>${[70,120,170,220,270,320,370,410].map(x=>`<rect x="${x}" y="118" width="4" height="26" fill="${wood(n)}"/>`).join('')}
        ${boat(150,114,n,'#e8e2d4',.7)}${boat(330,114,n,'#2a6fa8',.6)}
        ${[0,1,2].map(i=>`<ellipse cx="${210+i*24}" cy="134" rx="10" ry="3" fill="${['#c0392b','#f2b630','#2f8f6a'][i]}" opacity="${n?.4:.95}"/>`).join('')}
        ${person(240,n,'#c0392b',116,.85)}${person(290,n,'#8e44ad',116,.85)}${lamp(80,n,116)}`},
    gig_bridge:{name:'The Narrows Bridges',ic:'🌉',get desc(){return bridge2()
        ?'Two green suspension bridges side by side over the Tacoma Narrows: the 1950 span carries traffic west to Gig Harbor, and the 2007 span carries it east to Tacoma, with a toll and a wide walking path. Below, the tide pours through the gap like a river'
        :'One green suspension bridge over the Tacoma Narrows, built in 1950 to replace “Galloping Gertie,” which twisted itself apart in the wind in 1940. A narrow sidewalk, no toll, and the tide pouring through the gap below'},
      art:({night:n})=>{const two=bridge2(),g=n?'#2f4a3a':'#4f8a5f',deck=(y,o)=>`<rect x="0" y="${y}" width="480" height="5" fill="${g}" opacity="${o}"/>
          ${[120,360].map(x=>`<rect x="${x-5}" y="${y-70}" width="10" height="${n?120:120}" fill="${g}" opacity="${o}"/><rect x="${x-9}" y="${y-48}" width="18" height="4" fill="${g}" opacity="${o}"/>`).join('')}
          <path d="M0 ${y-40} Q60 ${y-4} 120 ${y-70} Q240 ${y-6} 360 ${y-70} Q420 ${y-4} 480 ${y-40}" stroke="${g}" stroke-width="2.5" fill="none" opacity="${o}"/>
          ${n?[30,90,150,210,270,330,390,450].map(x=>`<circle cx="${x}" cy="${y-1}" r="1.6" fill="#f7d77a" opacity="${o}"/>`).join(''):''}`;
        return `${starsSky(n)}<rect y="100" width="480" height="50" fill="${HC.bay(n)}"/><path d="M0 120 q30 -6 60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0" stroke="${HC.bay2(n)}" stroke-width="2" fill="none" opacity=".8"/>
          <path d="M0 100 Q40 74 90 96 V104 H0 Z M390 96 Q440 70 480 92 V104 H390 Z" fill="${HC.hill(n)}"/>
          ${two?deck(92,.65):''}${deck(100,1)}`}},
  },
  travel:{'gig_harbor|gig_skansie':4,'gig_harbor|gig_dock':5,'gig_skansie|gig_dock':3,'gig_harbor|gig_bridge':12,'gig_skansie|gig_bridge':14,'gig_dock|gig_bridge':14},
  neighbors:[
    {id:'gig_mirela',n:'Mirela',ic:'🧶',at:['gig_skansie','gig_harbor'],d:'Her grandfather came from an island off the coast of Croatia and built boats on this harbor. She volunteers at the netshed open days, knits on the bench out front, and can name the family behind every old boat at the dock.'},
    {id:'gig_wade',n:'Wade',ic:'🛶',at:['gig_dock'],d:'Runs the summer kayak stand on the dock and spends the winters building wooden paddles in his garage. Tells everyone the same safety speech, word for word, and means every word.'},
  ],
  actions:(loc,d,m)=>{const a=[],at=(lo,hi)=>m>=lo&&m<hi,sum=(()=>{const o=dateOf(d);return o.m>=6&&o.m<=9})();
    if(loc==='gig_harbor'){
      const open=isOpen('gig_harbor');
      a.push({ic:'🚶',l:'Walk the curve of the harbor',s:`40 min. ${cap(calmTxt(8))}.`,cat:'rest',fn:()=>{pass(40);S.stats.walks++;calm(8);say(pick(['🚶 Masts ticking in the breeze, a heron standing on a piling like it owns it, and the whole town reflected upside down in the flat water.','🚶 Past the boatyard, where a man is sanding the bottom of an old wooden hull that is older than his father. He waves with the sander.','🚶 The mountain sits right at the mouth of the bay today, huge and close, and everybody on the sidewalk keeps stopping to look at it.']))}});
      if(!once('coffee')){const c=rp(7);a.push({ic:'☕',l:`Coffee and a scone at Harbor Beans — ${$(c)}`,s:open?(canAfford(c)?'30 min. Energy +8, stress −5. Once a day.':'Not enough cash.'):hoursTxt('gig_harbor'),cat:'food',dis:!open||!canAfford(c),
        fn:()=>{spend(c);mark('coffee');pass(30);adj('energy',8);adj('stress',-5);say(pick(['☕ A window seat over the water and a marionberry scone the size of a fist. Two retired guys at the next table are arguing about the tide tables like it is the news.','☕ The barista draws a little sailboat in your foam and does not make a big deal of it.']))}})}
      const ic=rp(5);if(sum&&!once('scoop'))a.push({ic:'🍦',l:`An ice-cream cone from the window — ${$(ic)}`,s:open&&canAfford(ic)?'15 min. Energy +3, stress −4. Once a day.':'Closed, or short on cash.',cat:'food',dis:!open||!canAfford(ic),
        fn:()=>{spend(ic);mark('scoop');pass(15);adj('energy',3);adj('stress',-4);say('🍦 Blackberry, in a waffle cone, eaten on the seawall with your feet hanging over the water. It drips. You let it.')}});
      const b=rp(11);a.push({ic:'📚',l:`Browse Tide & Page and buy a paperback — ${$(b)}`,s:open?(canAfford(b)?`40 min. ${cap(calmTxt(8))}, community +1.`:'Not enough cash.'):hoursTxt('gig_harbor'),cat:'here',dis:!open||!canAfford(b),
        fn:()=>{spend(b);pass(40);calm(8);adj('community',1);say('📚 A shelf of local history, a shelf of boat books and a shelf labeled only “rainy days.” You buy one off the rainy-days shelf. The owner approves.')}});
    }
    if(loc==='gig_skansie'){
      a.push({ic:'🛖',l:parkOwned()?'Read the signs at the netshed':'Look at the old netshed from the road',s:`25 min. ${cap(calmTxt(6))}.`,cat:'here',fn:()=>{pass(25);calm(6);const x=parkOwned()&&meet('gig_mirela');
        say((parkOwned()?pick(['🛖 The netshed stands on its pilings out over the water, red paint and weathered boards. A sign tells how Croatian and Norwegian families built this harbor’s boats and worked them for a century, and how sheds like this one once lined the whole shore.','🛖 Inside the open doors: old wooden floats, coils of rope and a workbench worn smooth by a hundred years of elbows. It smells like tar and salt.']):'🛖 The red shed on its pilings, the brick house behind it, and a family who still lives with both. A neighbor on the dock says the harbor used to have dozens of these.')
          +(x?` A woman knitting on the bench tells you whose grandfather built what: <b>Mirela</b>. ${nb('gig_mirela').d}`:''))}});
      if(parkOwned()&&!once('lawn'))a.push({ic:'🧺',l:'Sit on the lawn by the water',s:'45 min. Stress −10, energy +3. Once a day.',cat:'rest',fn:()=>{mark('lawn');pass(45);adj('stress',-10);adj('energy',3);say(pick(['🧺 The lawn slopes to the water. Kids shriek in the splash fountain, a sailboat tacks back and forth across the harbor mouth, and you do nothing at all for a while.','🧺 A summer concert is setting up in the pavilion: a sound check, a fiddle, somebody saying “one, two” forty times. You stay for the first song.']))}});
    }
    if(loc==='gig_dock'){
      const open=isOpen('gig_dock'),k=rp(25),paddle=sum&&at(600,1140);
      if(!once('kayak'))a.push({ic:'🛶',l:`Rent a kayak for an hour — ${$(k)}`,s:paddle?(canAfford(k)?'1 hour 15 min. Energy −8, stress −14. Once a day.':'Not enough cash.'):'The rental stand is open in summer, about 10 AM to 7 PM.',cat:'rest',dis:!paddle||!canAfford(k),
        fn:()=>{spend(k);mark('kayak');pass(75);adj('energy',-8);adj('stress',-14);const x=meet('gig_wade');say(pick(['🛶 Out past the boats to the mouth of the harbor, where the water opens up and the mountain fills the whole sky. A seal pops its head up, looks at you like you’re the strange one, and sinks.','🛶 You paddle the whole ring of the harbor, past the old sheds and the boatyard, and come back with sore shoulders and a clear head.'])+(x?` The man at the stand gave you the full safety speech first: <b>Wade</b>. ${nb('gig_wade').d}`:''))}});
      a.push({ic:'🪑',l:'Sit at the end of the dock',s:`20 min. ${cap(calmTxt(5))}.`,cat:'rest',fn:()=>{pass(20);calm(5);say(pick(['🪑 Ropes creak, a gull lands on a piling and screams at nobody. The water slaps the floats. It is the most relaxing noise in Washington.','🪑 A kid next to you is counting the sea stars on the pilings below. She gets to eleven and makes you count them too.']))}});
    }
    if(loc==='gig_bridge'){
      a.push({ic:'🌉',l:bridge2()?'Walk out on the bridge path and back':'Walk out on the bridge sidewalk and back',s:`1 hour. Energy −6, ${calmTxt(12)}.`,cat:'rest',fn:()=>{pass(60);adj('energy',-6);calm(12);S.stats.walks++;
        say(bridge2()?pick(['🌉 Out along the path on the new span, the cars humming past behind the rail and the water 180 feet down, racing through the gap with the tide. In the middle you can feel the bridge breathe.','🌉 From the middle of the bridge: the old span right beside you, Point Defiance’s woods, the Olympics to the north and the mountain to the south. You turn around twice to take it all in.']):'🌉 The sidewalk is narrow and the trucks are close, but from the middle the view is the whole South Sound. A man walking the other way says his dad watched Galloping Gertie fall in 1940, from a hill right over there.')}});
      a.push({ic:'📖',l:'Read the plaque about Galloping Gertie',s:`15 min. ${cap(calmTxt(4))}.`,cat:'here',fn:()=>{pass(15);calm(4);say('📖 The first bridge here opened in July 1940 and bucked like a carnival ride in the wind until, in November, it twisted apart and fell into the Narrows. Nobody died except a dog left in a car. The wreck still lies on the bottom, and engineers everywhere still study the film.')}});
    }
    return a;
  },
});
// defHood copies the places, so the year-dependent descriptions are put back as getters here
for(const k of Object.keys(HOODS[KEY].places)){const p=L[k],dd=Object.getOwnPropertyDescriptor(HOODS[KEY].places[k],'desc');if(dd&&dd.get)Object.defineProperty(p,'desc',{configurable:true,enumerable:true,get:dd.get,set(v){}})}

// until the county engine (72-county.js) is in the build, the places stay hidden (it adds its own countyOn() gate on top)
for(const K of [KEY])for(const k of Object.keys(HOODS[K].places)){const p=L[k],d0=Object.getOwnPropertyDescriptor(p,'hidden');if(d0&&d0.get)continue;let h=!!(d0&&d0.value);
  Object.defineProperty(p,'hidden',{configurable:true,enumerable:true,get(){return h||typeof countyOn!=='function'},set(v){h=v}})}

// ---- the guide: the Pierce County chapter's section (72-county.js) ----
if(typeof countyGuideAreas==='function'){const g=countyGuideAreas;countyGuideAreas=function(){return g()+`<h3>⛵ Gig Harbor</h3>
  <p>Across the Narrows Bridges, on the Kitsap Peninsula: Harborview Drive’s shops and coffee, Skansie Brothers Park with the old netshed, Jerisich Dock (kayaks in summer) and the bridges themselves, with a walking path and the story of Galloping Gertie. The bus takes about 45 minutes from Hilltop; by car it is about 25, and from July 2007 driving back into Tacoma over the new span costs a toll (less with a Good To Go! pass). You can start a life here. In December, watch for the lighted boats.</p>`}}

// ---- events ----
const here=(c,k)=>!isGrow()&&c&&c.at===k;
defEvent({id:'gig_lighted_boats',hook:'arrive',tile:['🎄','The lighted boats','good'],chance:0.6,max:1,cooldown:300,cond:c=>{const o=dateOf(day());return here(c,'gig_harbor')&&o.m===12&&o.d<=20&&tod()>=990},
  run:()=>{say('🎄 A string of boats is coming into the harbor in the dark, every mast and rail wrapped in Christmas lights: a tugboat with a glowing reindeer, a sailboat outlined in blue, one little skiff with a single lit-up star. People line the seawall with cocoa.')},
  choices:()=>{const c=rp(4);return [
    {ic:'☕',l:`Get a cocoa and watch from the seawall — ${$(c)}`,s:'40 min. Stress −10, community +2.',dis:!canAfford(c),fn:()=>{spend(c);pass(40);adj('stress',-10);adj('community',2);say('🎄 You cheer for the tugboat with everyone else. A toddler on her dad’s shoulders shouts “BOAT!” at every single one.')}},
    {ic:'👀',l:'Watch a few go by',s:'15 min. Stress −4.',fn:()=>{pass(15);adj('stress',-4);say('🎄 Three boats glide past, glowing, and their lights shiver in the black water.')}},
    {ic:'🚶',l:'Head on',s:'Nothing changes.',fn:()=>{say('🎄 The boats blink behind you all the way down the street.')}}]},dflt:1});
defEvent({id:'gig_shed_open',hook:'arrive',tile:['🛖','Netshed open day','good'],chance:0.35,max:2,cooldown:20,cond:c=>here(c,'gig_skansie')&&parkOwned()&&day()%7>=5&&tod()>=600&&tod()<960,
  run:()=>{say('🛖 The netshed doors are open today and volunteers are giving tours: the old gear, the photographs of the boat families, and a long table where you can try tying the knots the crews used.')},
  choices:()=>[
    {ic:'🪢',l:'Take the tour and learn a knot',s:'40 min. Stress −6, community +2.',fn:()=>{pass(40);adj('stress',-6);adj('community',2);const x=meet('gig_mirela');say('🪢 A bowline, a clove hitch and a story about a storm in 1934 that you will be retelling for a week.'+(x?` The volunteer who taught you the knots: <b>Mirela</b>. ${nb('gig_mirela').d}`:''))}},
    {ic:'📷',l:'Look at the old photos for a minute',s:'15 min. Stress −3.',fn:()=>{pass(15);adj('stress',-3);say('📷 Rows of families on the dock in their best clothes, squinting into the sun, a boat christened behind them.')}},
    {ic:'🚶',l:'Maybe next time',s:'Nothing changes.',fn:()=>{say('🛖 The volunteer says they do this most summer weekends.')}}],dflt:2});
defEvent({id:'gig_wind',hook:'arrive',tile:['💨','Wind on the Narrows','info'],chance:0.4,max:2,cooldown:30,cond:c=>{const o=dateOf(day());return here(c,'gig_bridge')&&(o.m>=10||o.m<=3)},
  run:()=>{say('💨 A hard wind is pushing up the Narrows, white caps racing below and the cables humming a low note. The bridge sways the way it is built to, which is still a strange feeling under your feet.')},
  choices:()=>[
    {ic:'🌉',l:'Walk out anyway, hat in hand',s:'45 min. Energy −8, stress −6.',fn:()=>{pass(45);adj('energy',-8);adj('stress',-6);say('🌉 Halfway out the wind nearly takes your breath. You hold the rail, laugh at nothing and walk back feeling ten feet tall.')}},
    {ic:'🪟',l:'Watch from the shore',s:'15 min. Stress −3.',fn:()=>{pass(15);adj('stress',-3);say('🪟 From the beach the bridge looks calm and the water looks furious. Both are true.')}}],dflt:1});

window.GIG_KEY=KEY;
})();
