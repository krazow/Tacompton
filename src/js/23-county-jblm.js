// ============================================================
//  TACOMPTON, Pierce County pack: JBLM and DuPont (county:true). Joint Base Lewis-McChord's public-facing edges only:
//  the Visitor Center by the main gate (a visitor pass takes a photo ID and a background check), the Lewis Army Museum
//  in the old Red Shield Inn (free; civilians need that pass or a sponsor; open about Wednesday to Friday), DuPont's old
//  company village next door with its little history museum, and the Sequalitchew Creek trail down to Puget Sound.
//  The Army path (38-paths.js) lives here: a soldier in the barracks can use the barracks room as home base
//  (homeFor:'army'). Not startable for civilians. Prefix jb_. Places stay hidden until countyOn() says so.
// ============================================================
(function(){
const KEY='jblm';
const HF=()=>(S.hoodFlags=S.hoodFlags||{});
const once=k=>!!HF()[`${KEY}_${k}_${day()}`], mark=k=>{HF()[`${KEY}_${k}_${day()}`]=true};
const meet=id=>{if(S.met[id])return false;S.met[id]=day()+1;S.stats.neighbors=metCount();adj('community',2);return true};
const nb=id=>NEIGHBORS.find(x=>x.id===id)||{d:''};
const Y=()=>{try{return typeof yearNow==='function'?yearNow():2026}catch(e){return 2026}};   // (yearNow isn't ready while the files load)
const joint=()=>Y()>=2010;   // Fort Lewis and McChord Air Force Base became one joint base in 2010
const base=()=>joint()?'JBLM':'Fort Lewis';
// a soldier (38-paths.js) who has finished basic training and lives in the barracks
const soldier=()=>{try{const M=S&&S.life&&S.life.mil;return !!M&&!M.out&&S.job==='army'&&!!M.basicDone}catch(e){return false}};
const barracks=()=>soldier()&&S.life.mil.housing!=='bah';
const pass2=()=>!!HF().jb_pass||soldier();   // a visitor pass (good for the day you got it, then the year) or a military ID
const drab=n=>n?'#2e3428':'#7a7d5a', tan=n=>n?'#3a352c':'#d8c9a4', brick=n=>n?'#40251f':'#a8553f';
const flag=(x,y,n)=>`<rect x="${x}" y="${y}" width="2" height="54" fill="${n?'#777':'#cfd5d8'}"/><rect x="${x+2}" y="${y}" width="26" height="15" fill="${n?'#5a3030':'#b8302a'}"/><rect x="${x+2}" y="${y}" width="11" height="8" fill="${n?'#2a2f4a':'#2a3f8a'}"/>${[3,7,11].map(d=>`<rect x="${x+13}" y="${y+d}" width="15" height="1.6" fill="#fff" opacity="${n?.3:.9}"/>`).join('')}`;
const firs=(n,y=110)=>[20,52,84,400,432,464].map((x,i)=>`<path d="M${x} ${y} l12 -${34+(i%2)*10} l12 ${34+(i%2)*10} z" fill="${HC.leaf(n)}"/>`).join('');

defHood({
  key:KEY, county:true, startable:false, homeFor:'army', home:'jb_barracks',
  get name(){return joint()?'JBLM and DuPont':'Fort Lewis and DuPont'}, ic:'🎖️',
  get blurb(){return `${joint()?'Joint Base Lewis-McChord':'Fort Lewis'}, the huge Army post along I-5 south of Tacoma, and DuPont, the small town next door. Civilians see the edges: the gate, a free Army museum, and an old company village among the firs.`},
  hub:'jb_gate', ride:{via:'bus',mins:50,fare:2,drive:25},
  places:{
    jb_gate:{name:'Visitor Center by the main gate',ic:'🪪',desc:'A low building by the main gate off I-5, with a flag out front, a line of chairs and a counter where civilians show a photo ID, wait for a quick background check and get a printed visitor pass',
      hours:d=>d%7<5?[360,1320]:[480,1080],
      art:({night:n})=>`${starsSky(n)}${firs(n)}
        <rect x="140" y="70" width="200" height="56" fill="${tan(n)}"/><rect x="134" y="64" width="212" height="8" fill="${drab(n)}"/>
        <rect x="150" y="82" width="40" height="26" fill="${win(n)}"/><rect x="290" y="82" width="40" height="26" fill="${win(n)}"/><rect x="222" y="90" width="36" height="36" fill="${n?'#1e1e1a':'#4a4a3a'}"/>
        <rect x="160" y="52" width="160" height="12" rx="2" fill="${n?'#1c1c18':'#2f3a2a'}"/><text x="240" y="61" text-anchor="middle" font-size="7.5" ${SVGF} fill="#f4e2a8">VISITOR CENTER</text>
        ${flag(100,60,n)}<rect x="0" y="126" width="480" height="24" fill="${HC.street(n)}"/><path d="M0 138 H480" stroke="#e8d27a" stroke-width="1.5" stroke-dasharray="14 10" opacity="${n?.4:.8}"/>
        <rect x="360" y="110" width="80" height="6" fill="${n?'#5a5a50':'#e8e2d4'}"/><rect x="360" y="110" width="12" height="16" fill="${n?'#5a5a50':'#c8c2b4'}"/>${n?'<circle cx="440" cy="106" r="3" fill="#f7d77a"/>':''}
        ${person(200,n,'#2a6fa8',126,.9)}${person(316,n,'#6a6a40',126,.9)}${lamp(80,n,126)}`},
    jb_museum:{name:'Lewis Army Museum',ic:'🏛️',desc:'The Army museum in the old Red Shield Inn, a white three-story building from 1919 with a long porch, on the main post. Free, open about Wednesday to Friday, with tanks and artillery parked on the lawn. Civilians get in with a visitor pass from the Visitor Center',
      hours:d=>[2,3,4].includes(d%7)?[600,960]:null,
      art:({night:n})=>`${starsSky(n)}${firs(n,108)}
        <rect x="120" y="44" width="240" height="84" fill="${n?'#3a3e46':'#f1ede2'}"/><polygon points="112,46 240,20 368,46" fill="${n?'#2a2e36':'#4a5a6a'}"/>
        ${[0,1].map(r=>[0,1,2,3,4,5,6,7].map(c=>`<rect x="${132+c*28}" y="${54+r*24}" width="12" height="14" fill="${win(n,(r+c)%3!==0)}"/>`).join('')).join('')}
        <rect x="114" y="102" width="252" height="5" fill="${n?'#4a4e56':'#ddd6c6'}"/>${[0,1,2,3,4,5,6,7,8,9].map(i=>`<rect x="${118+i*27}" y="106" width="3" height="22" fill="${n?'#4a4e56':'#ddd6c6'}"/>`).join('')}
        <rect x="228" y="108" width="24" height="20" fill="${n?'#1e1e1a':'#4a3a2a'}"/>
        <g><rect x="18" y="122" width="70" height="16" rx="3" fill="${drab(n)}"/><rect x="34" y="110" width="36" height="14" rx="3" fill="${drab(n)}"/><rect x="68" y="114" width="40" height="4" fill="${drab(n)}"/>${[26,42,58,74].map(x=>`<circle cx="${x}" cy="140" r="5" fill="#2b2f2a"/>`).join('')}</g>
        ${flag(400,68,n)}${person(300,n,'#2a6fa8',140,.9)}`},
    jb_dupont:{name:'DuPont’s old village',ic:'🏘️',desc:'The streets of small white company houses built about 1909 for the workers at the DuPont powder plant that once stood here, now a quiet town with tall firs, a little history museum in the old meat market and a café (invented) on the corner',
      art:({night:n})=>`${starsSky(n)}${firs(n,104)}
        ${[40,150,260,370].map((x,i)=>`<g><rect x="${x}" y="84" width="70" height="46" fill="${n?'#3a3e46':['#f1ede2','#e8e2c8','#f4f0e6','#e2e8e2'][i]}"/><polygon points="${x-6},86 ${x+35},60 ${x+76},86" fill="${n?'#2c3238':'#5a5048'}"/><rect x="${x+8}" y="94" width="16" height="14" fill="${win(n,i!==2)}"/><rect x="${x+46}" y="94" width="16" height="14" fill="${win(n,i===1)}"/><rect x="${x+28}" y="108" width="14" height="22" fill="${n?'#1e1e1a':'#5a4030'}"/><rect x="${x-4}" y="106" width="78" height="3" fill="${n?'#4a4e56':'#ddd6c6'}"/></g>`).join('')}
        <rect y="130" width="480" height="20" fill="${HC.walk(n)}"/>${tree(140,n,14,132)}${tree(250,n,16,132)}${tree(360,n,14,132)}
        ${person(118,n,'#c0392b',146,.9)}${person(330,n,'#2a6fa8',146,.9)}${lamp(232,n,146)}`},
    jb_creek:{name:'Sequalitchew Creek Trail',ic:'🌲',desc:'A shady trail from DuPont along a deep, quiet ravine down to the beach on Puget Sound, past the site of the Hudson’s Bay Company’s Fort Nisqually of the 1830s. The Nisqually people lived here long before that',
      art:({night:n})=>`${starsSky(n)}<rect y="96" width="480" height="54" fill="${HC.bay(n)}"/><path d="M0 104 Q120 92 240 102 T480 96" stroke="${HC.bay2(n)}" stroke-width="2" fill="none"/>
        <path d="M0 150 L0 60 Q60 50 120 90 L170 150 Z M480 150 L480 56 Q420 50 360 90 L310 150 Z" fill="${HC.hill(n)}"/>
        ${[16,48,80,110,370,400,432,462].map((x,i)=>`<path d="M${x} ${70+(i%3)*10} l13 -40 l13 40 z" fill="${i%2?HC.leaf(n):HC.leaf2(n)}"/>`).join('')}
        <path d="M200 150 Q230 128 240 112 Q250 128 280 150" fill="${n?'#2a2e2a':'#a99a7a'}"/><path d="M236 150 Q240 130 244 112" stroke="${HC.bay2(n)}" stroke-width="3" fill="none"/>
        ${person(214,n,'#2f6b4a',146,.8)}`},
    jb_barracks:{name:'Your barracks room',ic:'🪖',desc:'A two-person room in a brick barracks on the base: two beds, two wall lockers, a shared bathroom, a window over the parking lot and the firs. The day room downstairs has a TV, a pool table and a microwave that everyone fights over',
      art:({night:n})=>`${starsSky(n)}${firs(n,96)}
        <rect x="60" y="36" width="360" height="104" fill="${brick(n)}"/><rect x="56" y="30" width="368" height="8" fill="${n?'#2a1e1a':'#6a3f2e'}"/>
        ${[0,1,2].map(r=>[0,1,2,3,4,5,6,7].map(c=>`<rect x="${76+c*42}" y="${46+r*28}" width="22" height="16" fill="${win(n,(r*3+c)%4!==2)}"/>`).join('')).join('')}
        <rect x="222" y="112" width="36" height="28" fill="${n?'#1e1410':'#3a2620'}"/><rect x="214" y="106" width="52" height="6" fill="${n?'#3a3e46':'#d8d2c2'}"/>
        <rect y="140" width="480" height="10" fill="${HC.street(n)}"/>${person(160,n,'#6a6a40',146,.9)}${person(300,n,'#6a6a40',146,.9)}${lamp(400,n,146)}`},
  },
  travel:{'jb_gate|jb_museum':8,'jb_gate|jb_dupont':12,'jb_gate|jb_creek':16,'jb_gate|jb_barracks':10,'jb_museum|jb_dupont':16,'jb_museum|jb_creek':20,'jb_museum|jb_barracks':6,
    'jb_dupont|jb_creek':8,'jb_dupont|jb_barracks':18,'jb_creek|jb_barracks':22},
  neighbors:[
    {id:'jb_reyes',n:'Sgt. Reyes',ic:'🪪',at:['jb_gate','jb_museum'],d:'Works the counter at the Visitor Center and has said “photo ID, please” about a million times without once sounding tired of it. Spent eight years as a mechanic in a tank unit and will tell you which one on the museum lawn is her favorite.'},
    {id:'jb_hal',n:'Hal',ic:'📜',at:['jb_dupont','jb_creek'],d:'A retired machinist who volunteers at the little DuPont history museum. His grandmother packed dynamite at the old plant, and he can show you her badge, her lunch tin and the house she lived in, two streets over.'},
  ],
  actions:(loc,d,m)=>{const a=[],at=(lo,hi)=>m>=lo&&m<hi;
    if(loc==='jb_gate'){
      const open=isOpen('jb_gate');
      if(!pass2())a.push({ic:'🪪',l:'Get a visitor pass',s:open?'40 min. Show a photo ID and wait for a quick background check. You need one to visit the museum on the base.':hoursTxt('jb_gate'),cat:'here',dis:!open,
        fn:()=>{pass(40);HF().jb_pass=d+1;const x=meet('jb_reyes');say('🪪 You fill out a short form, hand over your ID, and wait in a row of chairs with a grandmother visiting her grandson and a guy delivering a cake. Twenty minutes later the printer hums and you have a paper pass with your name on it.'+(x?` The woman at the counter wishes you a good visit and means it: <b>Sgt. Reyes</b>. ${nb('jb_reyes').d}`:''))}});
      else a.push({ic:'✅',l:soldier()?'Your military ID gets you through the gate':'You have a visitor pass',s:'You can visit the museum on the base.',cat:'here',dis:true,fn:()=>{}});
      a.push({ic:'🚚',l:'Watch the morning traffic at the gate',s:`20 min. ${cap(calmTxt(4))}.`,cat:'here',dis:!at(360,600),fn:()=>{pass(20);calm(4);say(pick(['🚚 A river of cars, pickups and one convoy of tan trucks rolling in off I-5, every driver holding up an ID at the window like a ticket to work.','🚚 The guards wave car after car through in the drizzle. Somewhere on the base a bugle plays, faint, and the whole line keeps moving.']))}});
    }
    if(loc==='jb_museum'){
      const open=isOpen('jb_museum'),ok=pass2();
      a.push({ic:'🏛️',l:'Walk through the Lewis Army Museum',s:!ok?'You need a visitor pass from the Visitor Center first.':open?`1 hour. Free. ${cap(calmTxt(8))}, community +1.`:'Open about Wednesday to Friday, 10 AM to 4 PM.',cat:'here',dis:!ok||!open,
        fn:()=>{pass(60);calm(8);adj('community',1);S.stats.walks++;const x=Math.random()<.4&&meet('jb_reyes');say(pick(['🏛️ Uniforms from every war since the post opened in 1917, a mess kit, letters home, a jeep you can stand right next to, and a wall of faces from the units that trained here. A veteran in a ball cap is telling his grandson about the one in the corner.','🏛️ The old Red Shield Inn was built in 1919 as a hotel for soldiers’ visiting families. Now its rooms hold maps, medals and a model of the post in 1918, when it was raw timber and mud.'])+(x?` Off duty and visiting the tanks on the lawn: <b>Sgt. Reyes</b>. ${nb('jb_reyes').d}`:''))}});
      a.push({ic:'🛡️',l:'Look at the vehicles on the lawn',s:ok?`20 min. ${cap(calmTxt(4))}.`:'They are on the base: you need a visitor pass first.',cat:'here',dis:!ok,fn:()=>{pass(20);calm(4);say('🛡️ A tank, a howitzer and a helicopter parked on the grass like toys left out by a giant. A small kid walks all the way around the tank twice without blinking.')}});
    }
    if(loc==='jb_dupont'){
      const c=rp(8);if(!once('cafe'))a.push({ic:'☕',l:`Breakfast at the corner café — ${$(c)}`,s:at(420,840)?(canAfford(c)?'30 min. Energy +10, stress −4. Once a day.':'Not enough cash.'):'The café serves 7 AM to 2 PM.',cat:'food',dis:!at(420,840)||!canAfford(c),
        fn:()=>{spend(c);mark('cafe');pass(30);adj('energy',10);adj('stress',-4);say(pick(['☕ Eggs, hash browns and a table of soldiers in PT clothes talking about everything except work. The waitress calls everybody “hon.”','☕ A biscuit with gravy and a window full of white company houses and firs. The coffee is bottomless and the refills come without asking.']))}});
      const mo=d%7>=4;a.push({ic:'📜',l:'Visit the DuPont history museum',s:mo&&at(780,960)?`40 min. Free. ${cap(calmTxt(6))}, community +1.`:'Open a few afternoons a week, about Friday to Sunday.',cat:'here',dis:!(mo&&at(780,960)),
        fn:()=>{pass(40);calm(6);adj('community',1);const x=meet('jb_hal');say('📜 One room in the old meat market: a powder-plant whistle, rows of workers’ badges, photographs of a whole village built by a company, and a scale model of the plant on the bluff.'+(x?` The volunteer with the stories: <b>Hal</b>. ${nb('jb_hal').d}`:''))}});
    }
    if(loc==='jb_creek'){
      a.push({ic:'🌲',l:'Hike down the ravine to the beach and back',s:`1 hour 30 min. Energy −10, ${calmTxt(14)}.`,cat:'rest',dis:S.energy<12,fn:()=>{pass(90);adj('energy',-10);calm(14);S.stats.walks++;const x=Math.random()<.35&&meet('jb_hal');
        say(pick(['🌲 Down through big-leaf maples and ferns, the creek talking to itself below, and then the trees open and there is the Sound: flat gray water, the Olympics and a train rolling along the shore.','🌲 A sign at the top marks where Fort Nisqually stood in 1833, a trading post on land the Nisqually people had lived on for thousands of years. At the bottom, a quiet gravel beach and a heron that won’t move for you.'])+(x?` A man on the trail with a walking stick and a lot to say about the old plant: <b>Hal</b>. ${nb('jb_hal').d}`:''))}});
    }
    if(loc==='jb_barracks'){
      if(barracks()){
        a.push({ic:'🛏️',l:'Turn in for the night in your barracks room',s:'Ends the day. Lights out, alarm set, boots lined up.',cat:'rest',cls:m>=1260?'primary':'',fn:()=>{HF().jb_slept=d+1;endDay('home')}});
        a.push({ic:'😴',l:'Rest on your bunk for an hour',s:`Energy +10, ${calmTxt(5)}.`,cat:'rest',fn:()=>{pass(60);adj('energy',10);calm(5);say(pick(['😴 Your roommate is on a video call with his mom in the hall. You sleep through it.','😴 An hour on top of a made bed, the way the drill sergeants never let you. Bliss.']))}});
        if(!once('dayroom'))a.push({ic:'🎱',l:'Hang out in the day room',s:'45 min. Stress −8, community +1. Once a day.',cat:'people',fn:()=>{mark('dayroom');pass(45);adj('stress',-8);adj('community',1);say(pick(['🎱 A game of pool with a sergeant who trash-talks like a grandmother. You lose, and she teaches you a bank shot.','🎱 Six people, one microwave, one football game on the TV and a pizza somebody ordered “for the room.” You are part of the room.']))}});
      }else a.push({ic:'🪖',l:'The barracks are for soldiers',s:'Only the soldiers who live here can go in.',cat:'here',dis:true,fn:()=>{}});
    }
    return a;
  },
});
// the barracks only show for a soldier who lives in them (the county engine adds its own gate on top: countyOn())
{const p=L.jb_barracks;let h=false;Object.defineProperty(p,'hidden',{configurable:true,enumerable:true,get(){return !!h||!barracks()},set(v){h=v}})}

// until the county engine (72-county.js) is in the build, the places stay hidden (it adds its own countyOn() gate on top)
for(const K of [KEY])for(const k of Object.keys(HOODS[K].places)){const p=L[k],d0=Object.getOwnPropertyDescriptor(p,'hidden');if(d0&&d0.get)continue;let h=!!(d0&&d0.value);
  Object.defineProperty(p,'hidden',{configurable:true,enumerable:true,get(){return h||typeof countyOn!=='function'},set(v){h=v}})}

// ---- the guide: the Pierce County chapter's section (72-county.js) ----
if(typeof countyGuideAreas==='function'){const g=countyGuideAreas;countyGuideAreas=function(){return g()+`<h3>🎖️ ${joint()?'JBLM':'Fort Lewis'} and DuPont</h3>
  <p>${joint()?'Joint Base Lewis-McChord':'Fort Lewis'} is a working Army post, so civilians see its edges: the Visitor Center by the main gate (bring a photo ID; a visitor pass takes a quick background check), the free Lewis Army Museum in the old Red Shield Inn (open about Wednesday to Friday, and only with that pass), DuPont’s old company village with its little history museum, and the Sequalitchew Creek trail down to Puget Sound. You can’t start a life here as a civilian. If you join the Army at 18, this is where your unit is: while you live in the barracks you can turn in for the night in your barracks room.</p>`}}

// ---- events ----
const here=(c,k)=>!isGrow()&&c&&c.at===k;
defEvent({id:'jb_convoy',hook:'arrive',tile:['🚚','A convoy on I-5','info'],chance:0.3,max:2,cooldown:20,cond:c=>here(c,'jb_gate')&&daytime(),
  run:()=>{say('🚚 A long convoy of tan trucks and Humvees is rolling out of the gate and onto I-5, headed for the training area, each one a careful two truck-lengths behind the last. Traffic slows. Nobody honks.')},
  choices:()=>stopWatch({mins:10,calm:3,text:'🚚 A soldier in the last truck gives a little wave out the window. Three kids in a minivan wave back like it’s a parade.'}),dflt:1});
defEvent({id:'jb_homecoming',hook:'arrive',tile:['🎈','A homecoming','good'],chance:0.25,max:1,cooldown:60,cond:c=>(here(c,'jb_gate')||here(c,'jb_dupont'))&&!soldier(),
  run:()=>{say('🎈 In the parking lot a family is waiting with balloons and a hand-painted sign: WELCOME HOME DADDY, with a lopsided heart. A bus pulls up, the doors fold open, and a little girl takes off running before anyone can stop her.')},
  choices:()=>[
    {ic:'👏',l:'Clap along with everyone',s:'10 min. Stress −6, community +2.',fn:()=>{pass(10);adj('stress',-6);adj('community',2);say('🎈 The whole lot claps. The soldier drops his bag and scoops her up, and you have to look at the trees for a second.')}},
    {ic:'🚶',l:'Give them their moment',s:'Stress −2.',fn:()=>{adj('stress',-2);say('🎈 You walk on, smiling, and leave them to it.')}}],dflt:1});
defEvent({id:'jb_creek_eagle',hook:'arrive',tile:['🦅','An eagle on the beach','good'],chance:0.35,max:2,cooldown:14,cond:c=>here(c,'jb_creek')&&daytime(),
  run:()=>{say('🦅 A bald eagle is sitting on a driftwood log at the bottom of the trail, white head turning slowly to watch you come down. It does not seem to think you are important.')},
  choices:()=>stopWatch({mins:15,calm:7,community:0,text:'🦅 You sit on a rock and watch it watch the water. After a long time it opens enormous wings and rows off up the shore, three slow beats and a glide.'}),dflt:1});
defEvent({id:'jb_soldier_sunday',hook:'arrive',tile:['🍽️','A Sunday in DuPont','good'],chance:0.4,max:2,cooldown:14,cond:c=>here(c,'jb_dupont')&&soldier()&&day()%7===6,
  run:()=>{say('🍽️ Your squad leader’s family lives in DuPont, and his wife is waving from the porch: “There’s a pot roast, and you look like you live on the dining facility.”')},
  choices:()=>[
    {ic:'🍽️',l:'Stay for dinner',s:'1 hour 30 min. Energy +10, stress −10, job +2.',fn:()=>{pass(90);adj('energy',10);adj('stress',-10);adj('standing',2);say('🍽️ Pot roast, a loud table, three little kids who want to see your boots and a sergeant who, it turns out, is a different person at home. You leave with leftovers in a margarine tub.')}},
    {ic:'🙏',l:'Thank her, but you have plans',s:'Nothing changes.',fn:()=>{say('🍽️ “Next Sunday, then,” she says, which is not a question.')}}],dflt:1});

window.JBLM_KEY=KEY;
})();
