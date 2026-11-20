// ============================================================
//  TACOMPTON, part 1: the world.
//  One two-week August season (Mon Aug 3 – Sun Aug 16, 2026) running a small salmon-guide boat out of Tacoma, WA.
//  The shared state, the HUD, the scenery, the six places, travel, the Here-tab actions, status tags, the alert bar
//  and the extra tabs. Trips, bookings, fish and regs live in 22-trips.js (TRIPS); events and the story in 21-story.js.
//  Every call into another file is guarded with typeof, so this file runs (and parses) on its own.
// ============================================================

// ---- the game-specific part of the save (merged over the engine's fields in baseState()) ----
// The SPEC.md fields first, then WORLD's own small trackers (documented on each line).
function newState(){
  return {
    money:1500,rep:50,energy:90,boat:85,cites:0,warns:0,
    fuel:20,                 // gallons in the boat's tank (TANK = 40)
    gear:3,                  // trips' worth of tackle: herring hooks, flashers, hoochies, leaders
    bait:0,                  // trays of herring on ice (1 per trip)
    baitDay:-1,              // WORLD: day index the newest tray was bought (TRIPS spoils trays at the end of baitDay+1)
    book:[],nextId:1,
    reqs:[],                 // booking requests waiting: {id, r:{...}, exp:dayIndex}
    trip:null,               // TRIPS owns its shape
    reviews:[],
    dil:{},
    unlogged:0,
    licensed:{guide:true,boat:true,crc:true},
    stats:{trips:0,clients:0,fish:0,chinook:0,coho:0,earned:0,spent:0,tips:0,viol:0,fines:0,noshow:0,fuelGal:0,seen:{},
      tolls:0,walks:0,bar:0}, // WORLD adds: tolls paid ($), Ruston Way walks, bar evenings
    visited:{home:true},
    water:{},                // TRIPS: per-day spot conditions
    // ---- WORLD's own per-day trackers (day index → value) ----
    scout:-1,                // day index whose water read is improved (scouting the Slag Pile today sets it to tomorrow)
    diner:{},coffee:{},walk:{},pier:{},bar:{},museum:{},meet:{},urgent:{},
  };
}

// ---- small shared helpers (TRIPS and STORY may use these; please don't redeclare them with const/let) ----
const TANK=40;                                             // boat fuel tank, gallons
const TOLL=5;                                              // Tacoma Narrows Bridge, eastbound only (Gig Harbor → Tacoma), Good To Go pass
const rp=c=>Math.round(c*DF().cost);                       // a price scaled by the difficulty's cost multiplier
function canAfford(c){return S.money>=c}
function spend(c){money(-c);S.stats.spent+=c}
const augDate=d=>`${dayName(d).slice(0,3)} Aug ${3+d}`;   // day index → "Mon Aug 3"
const todaysTrips=(d=day())=>(S.book||[]).filter(b=>b.day===d&&b.status==='booked').sort((x,y)=>x.start-y.start);
const TACOMA_LORE=[
  'Somebody at the counter swears the Tacoma Aroma is “mostly gone now.” Somebody else laughs for a full minute.',
  'Talk turns to Galloping Gertie, the first Narrows bridge, which twisted itself into the Sound in November 1940. The only fatality was a dog named Tubby.',
  '“The mountain is out,” says the cook, and the whole counter turns to look at Rainier like it might leave.',
  'A guy in a Rainiers cap says the kings are stacked on the Clay Banks at the top of the tide. He says that every day.',
  'Someone remembers when the Asarco smelter stack at Ruston came down in 1993. “The whole town came out to watch.”',
  'The Puyallup Tribe’s fishers are out on the river this week. The old-timers nod at that. It’s their fishery first, and has been forever.',
  'A debate breaks out: Frisko Freeze or Dick’s? Nobody wins. Everyone gets fries.',
  'A retired longshoreman says the Port of Tacoma cranes look like giraffes at sunset. He’s not wrong.',
];

// ---- HUD ----
const STATS=[
  {l:'Cash',  v:()=>$k(Math.round(S.money)),warn:()=>S.money<0,get title(){return 'Cash: '+$(Math.round(S.money))}},
  {l:'Rep',   v:()=>S.rep,m:()=>S.rep,warn:()=>S.rep<20,title:'Reputation: reviews and word of mouth around the Sound. At 0, nobody books you.'},
  {l:'Energy',v:()=>S.energy,m:()=>S.energy,warn:()=>S.energy<20},
  {l:'Boat',  v:()=>S.boat,m:()=>S.boat,warn:()=>S.boat<25,title:'Your 22-foot aluminum sled. Below 40 it breaks down more. The marine repair shop is in Gig Harbor.'},
  {l:'Record',v:()=>S.cites?`${S.cites}/3`:'Clean',warn:()=>S.cites>0,title:'Citations from WDFW. Three and your charter license is gone.'},
];

// ---- scenery ----
// August in Tacoma: sunrise about 6:10 AM, sunset about 8:20 PM.
const SCENE={sun:[370,1220],skyDay:['#93bcd6','#e4edf0'],skyDusk:['#5f6596','#f3b68a'],skyNight:['#0b1828','#1d3047'],ground:'#5c7d52',groundNight:'#1c2a22'};
const TC={
  sea:n=>n?'#162f43':'#3f7f9e',sea2:n=>n?'#24465c':'#7fb6cc',fir:n=>n?'#0f2219':'#24513a',fir2:n=>n?'#14291f':'#2f6247',
  hill:n=>n?'#1b2c2a':'#56786a',hill2:n=>n?'#22362f':'#6f8f7c',mtn:n=>n?'#25334a':'#a7b8cb',snow:n=>n?.35:.96,
};
const win=n=>n?'#f7d77a':'#cfe0e6';
const SVGF='font-family="DM Sans, system-ui, sans-serif" font-weight="700"';
// Mount Rainier: base at y, centered on x, scaled by s
const rainier=(n,x=340,s=1,y=118)=>`<g transform="translate(${x},${y}) scale(${s})"><polygon points="-130,0 -70,-40 -45,-62 -18,-80 0,-86 20,-80 48,-60 80,-36 130,0" fill="${TC.mtn(n)}"/>
  <polygon points="-45,-62 -18,-80 0,-86 20,-80 48,-60 34,-58 24,-66 12,-56 0,-68 -10,-58 -24,-66 -34,-56" fill="#f5f8fa" opacity="${TC.snow(n)}"/></g>`;
const hills=(n,y=118)=>`<path d="M0 ${y-14} Q60 ${y-26} 130 ${y-12} T260 ${y-10} T400 ${y-16} T480 ${y-8} L480 ${y} L0 ${y} Z" fill="${TC.hill(n)}"/>`;
const sea=(n,y=118)=>`<rect y="${y}" width="480" height="${170-y}" fill="${TC.sea(n)}"/><path d="M30 ${y+12} q24 -4 48 0 M160 ${y+22} q24 -4 48 0 M300 ${y+10} q24 -4 48 0 M390 ${y+30} q24 -4 48 0 M90 ${y+38} q24 -4 48 0" stroke="${TC.sea2(n)}" stroke-width="2" fill="none" opacity=".7"/>`;
const fir=(x,h,n,c,b=140)=>{const w=h*.3;return `<g fill="${c||TC.fir(n)}"><polygon points="${x-w},${b} ${x},${b-h*.55} ${x+w},${b}"/><polygon points="${x-w*.8},${b-h*.3} ${x},${b-h*.8} ${x+w*.8},${b-h*.3}"/><polygon points="${x-w*.55},${b-h*.6} ${x},${b-h} ${x+w*.55},${b-h*.6}"/></g>`};
const firs=(xs,n,b=140)=>xs.map((x,i)=>fir(x,30+((x*7)%24),n,i%2?TC.fir2(n):TC.fir(n),b)).join('');
const gull=(x,y)=>`<path d="M${x} ${y} q5 -5 10 0 q5 -5 10 0" stroke="#fff" stroke-width="1.6" fill="none"/>`;
// a container crane: legs at x and x+26 standing on y, boom out over the water
const crane=(x,n,y=118)=>{const c=n?'#3b2b2b':'#c8452f';return `<g stroke="${c}" stroke-width="3" fill="none"><path d="M${x} ${y} V${y-46} M${x+26} ${y} V${y-46} M${x} ${y-24} H${x+26} M${x} ${y-46} L${x+26} ${y-24} M${x-34} ${y-46} H${x+44} M${x+13} ${y-46} V${y-60} L${x-34} ${y-46} M${x+13} ${y-60} L${x+44} ${y-46}"/></g><rect x="${x+2}" y="${y-52}" width="14" height="8" fill="${c}"/>${n?`<circle cx="${x+13}" cy="${y-61}" r="2" fill="#ff4a3a"/>`:''}`};
// the twin Tacoma Narrows bridges: towers at x1, x2; deck at y
function narrows(n,o={}){
  const x1=o.x1||150,x2=o.x2||330,top=o.top||46,deck=o.deck||96,base=o.base||118,sag=deck-14,c=n?'#4a5a66':'#7d8f99',cab=n?'#5d6d78':'#56656e';
  const ctrl=2*sag-top,mid=(x1+x2)/2,hy=x=>{const t=(x-x1)/(x2-x1);return (1-t)*(1-t)*top+2*(1-t)*t*ctrl+t*t*top};
  let hang='';for(let x=x1+12;x<x2;x+=14)hang+=`M${x} ${hy(x).toFixed(1)} V${deck}`;
  for(let x=x1-14;x>0;x-=14)hang+=`M${x} ${(top+(deck-top)*(x1-x)/x1).toFixed(1)} V${deck}`;
  for(let x=x2+14;x<480;x+=14)hang+=`M${x} ${(top+(deck-top)*(x-x2)/(480-x2)).toFixed(1)} V${deck}`;
  return `<g><rect x="0" y="${deck}" width="480" height="4" fill="${c}"/><rect x="0" y="${deck+6}" width="480" height="3" fill="${c}" opacity=".7"/>
  ${[x1,x2].map(x=>`<rect x="${x-4}" y="${top}" width="8" height="${base-top}" fill="${c}"/><rect x="${x-6}" y="${top+12}" width="12" height="3" fill="${c}"/><rect x="${x-6}" y="${top+30}" width="12" height="3" fill="${c}"/>`).join('')}
  <path d="M0 ${deck} L${x1} ${top} Q${mid} ${ctrl} ${x2} ${top} L480 ${deck}" stroke="${cab}" stroke-width="2" fill="none"/><path d="${hang}" stroke="${cab}" stroke-width=".8"/>
  ${n?Array.from({length:16},(_,i)=>`<circle cx="${15+i*30}" cy="${deck-1}" r="1.3" fill="#f7d77a"/>`).join('')+[x1,x2].map(x=>`<circle cx="${x}" cy="${top-2}" r="2" fill="#ff4a3a"/>`).join(''):''}</g>`;
}
// boats
const sled=(x,y,c)=>`<path d="M${x} ${y} h70 l12 -12 h-86 z" fill="${c||'#a9b4ba'}"/><rect x="${x+26}" y="${y-24}" width="22" height="12" fill="#e8eef0"/><rect x="${x+28}" y="${y-22}" width="18" height="6" fill="#5b7c8c"/><rect x="${x-2}" y="${y-16}" width="7" height="8" fill="#2b3338"/>`;
const sailboat=(x,y,n,c)=>`<path d="M${x} ${y} q30 8 60 0 l-6 -8 h-50 z" fill="${c||'#f2f2f2'}"/><path d="M${x+28} ${y-8} V${y-56}" stroke="#666" stroke-width="1.5"/><polygon points="${x+30},${y-54} ${x+30},${y-12} ${x+56},${y-12}" fill="${n?'#9aa7b0':'#fbfbf6'}"/><polygon points="${x+26},${y-48} ${x+26},${y-12} ${x+8},${y-12}" fill="${n?'#7f8c95':'#e9ecef'}"/>${n?`<circle cx="${x+28}" cy="${y-57}" r="1.5" fill="#fff"/>`:''}`;
const angler=(x,y,c)=>`<circle cx="${x}" cy="${y-16}" r="4" fill="#e8c9a0"/><rect x="${x-4}" y="${y-12}" width="8" height="12" rx="2" fill="${c||'#c0392b'}"/><path d="M${x+3} ${y-10} l20 -20" stroke="#333" stroke-width="1.2"/><path d="M${x+23} ${y-30} q4 14 -2 34" stroke="#999" stroke-width=".6" fill="none"/>`;

// ---- places ----
// L keys are fixed by SPEC.md. hours: d=>[open,close] minutes (or null = closed that day).
const L={
  home:{name:'Apartment, Hilltop',ic:'🏠',desc:'Your place on Hilltop. Bed, logbook, a view of the mountain, and the boat on its trailer out back',
    art:({night:n})=>`${rainier(n,370,.85)}${hills(n,124)}${firs([16,40,456],n)}
      <rect x="60" y="54" width="150" height="86" fill="${n?'#4a2e26':'#9a5a44'}"/><rect x="56" y="48" width="158" height="8" fill="${n?'#2e1d18':'#5e3328'}"/>
      ${[0,1,2].map(r=>[0,1,2,3].map(c=>`<rect x="${72+c*34}" y="${64+r*22}" width="18" height="13" fill="${(r+c)%3===1&&!n?'#9db8c4':win(n)}"${n&&(r*4+c)%4===2?' opacity=".35"':''}/>`).join('')).join('')}
      <rect x="124" y="118" width="22" height="22" fill="${n?'#2a1a14':'#4a2e22'}"/><text x="135" y="46" text-anchor="middle" font-size="8" ${SVGF} fill="${n?'#8a7a70':'#5e3328'}">HILLTOP</text>
      <path d="M240 152 h130" stroke="#555" stroke-width="3"/><circle cx="300" cy="156" r="6" fill="#222"/><circle cx="320" cy="156" r="6" fill="#222"/><path d="M370 152 l18 0" stroke="#555" stroke-width="2"/>${sled(262,148,n?'#6f7a80':'#b9c4ca')}`},
  downtown:{name:'Downtown Tacoma',ic:'🏙️',desc:'6th Ave and downtown: the tackle shop, a diner and urgent care',hours:()=>[360,1260],
    art:({night:n})=>`${rainier(n,250,1.1)}<rect x="0" y="96" width="480" height="44" fill="${n?'#1d2630':'#7d8a92'}"/>
      ${[['TACKLE','#2f5d4a',20],['DINER','#9a3b2a',170],['URGENT CARE','#2c6e9e',320]].map(([t,c,x])=>`<rect x="${x}" y="84" width="140" height="56" fill="${n?'#4a4136':'#d8ccb2'}"/><rect x="${x-4}" y="76" width="148" height="13" fill="${c}"/><text x="${x+70}" y="86" text-anchor="middle" font-size="9" ${SVGF} fill="#fff">${t}</text><rect x="${x+14}" y="98" width="44" height="22" fill="${win(n)}"/><rect x="${x+82}" y="98" width="44" height="22" fill="${win(n)}"/><rect x="${x+62}" y="112" width="16" height="28" fill="#3a2e24"/>`).join('')}
      ${n?'':gull(60,40)+gull(84,30)}`},
  marina:{name:'Point Defiance Marina',ic:'⛽',desc:'The boathouse, the launch and the fuel dock at Ruston. Trips start here',
    art:({night:n})=>`${rainier(n,430,.55,112)}<path d="M0 112 Q40 96 110 100 T220 106 L220 112 Z" fill="${TC.hill(n)}"/>${firs([10,28,46,64,82],n,110)}${sea(n,112)}
      ${[150,180,210,240,270,300,330].map(x=>`<rect x="${x}" y="108" width="4" height="28" fill="${n?'#3a2e24':'#6b4f33'}"/>`).join('')}
      <rect x="140" y="80" width="200" height="30" fill="${n?'#4a4036':'#e9e2d2'}"/><polygon points="132,82 240,58 348,82" fill="${n?'#4a1f1a':'#a8322a'}"/>
      ${[0,1,2,3,4,5].map(i=>`<rect x="${152+i*31}" y="88" width="16" height="12" fill="${win(n)}"/>`).join('')}<text x="240" y="76" text-anchor="middle" font-size="8" ${SVGF} fill="#fff">BOATHOUSE</text>
      <rect x="340" y="128" width="130" height="5" fill="${n?'#4a3a2a':'#8a6b48'}"/>${sled(360,140)}<rect x="440" y="116" width="10" height="12" fill="${n?'#555':'#d9d9d9'}"/><text x="445" y="114" text-anchor="middle" font-size="7" ${SVGF} fill="${n?'#aaa':'#333'}">GAS</text>
      ${n?'':gull(380,30)+gull(404,40)}`},
  ruston:{name:'Ruston Way',ic:'🌊',desc:'The waterfront path along Commencement Bay: Les Davis Pier, the Slag Pile, the port cranes across the water',
    art:({night:n})=>`${rainier(n,330,1.05,114)}<rect x="160" y="108" width="320" height="8" fill="${n?'#1f2a2a':'#76877c'}"/>${[220,262,304,346,388].map(x=>crane(x,n,114)).join('')}${sea(n,114)}
      <rect x="10" y="112" width="160" height="5" fill="${n?'#3a2e24':'#8a6b48'}"/>${[18,48,78,108,138,164].map(x=>`<rect x="${x}" y="117" width="3" height="24" fill="${n?'#2e241c':'#6b4f33'}"/>`).join('')}
      ${angler(40,112,'#2c6e9e')}${angler(96,112,'#e6a21a')}${angler(146,112,'#6b8e23')}
      <rect x="0" y="146" width="480" height="24" fill="${n?SCENE.groundNight:SCENE.ground}"/><rect x="0" y="146" width="480" height="5" fill="${n?'#4a4a44':'#c9c3b0'}"/>${n?[60,180,300,420].map(x=>`<rect x="${x}" y="128" width="2" height="18" fill="#555"/><circle cx="${x+1}" cy="127" r="3" fill="#f7d77a"/>`).join(''):''}`},
  foss:{name:'Thea Foss Waterway',ic:'🍸',desc:'The Foss marina, the Museum of Glass and its cone, and a waterfront bar with the evening crowd',
    art:({night:n})=>`${rainier(n,140,.9,112)}<rect x="0" y="104" width="480" height="20" fill="${n?'#1d2630':'#8a959b'}"/>${sea(n,124)}
      <rect x="236" y="92" width="190" height="32" fill="${n?'#3a4148':'#c8cdd0'}"/><rect x="236" y="88" width="190" height="5" fill="${n?'#2a3036':'#9aa2a7'}"/>
      <polygon points="300,124 372,124 352,38 338,36" fill="${n?'#5a646c':'#b9c3cb'}"/>${[0,1,2,3,4].map(i=>`<path d="M${304+i*4} ${108-i*16} L${368-i*4} ${108-i*16}" stroke="${n?'#4a535a':'#9aa6ae'}" stroke-width="1.5"/>`).join('')}
      <text x="270" y="112" text-anchor="middle" font-size="7" ${SVGF} fill="${n?'#aaa':'#3a4148'}">GLASS</text>
      <path d="M120 104 Q170 84 230 100" stroke="${n?'#5aa0c0':'#3a8fb7'}" stroke-width="4" fill="none"/>${[140,160,180,200].map((x,i)=>`<circle cx="${x}" cy="${96-i%2*3}" r="3" fill="${['#e6642e','#f4d27a','#8fd19e','#c0392b'][i]}"/>`).join('')}
      <rect x="12" y="76" width="96" height="34" fill="${n?'#3a2a24':'#6b4a3a'}"/><text x="60" y="88" text-anchor="middle" font-size="9" ${SVGF} fill="${n?'#ff7aa8':'#f4d27a'}">TAPROOM</text><rect x="22" y="94" width="76" height="12" fill="${win(n)}"/>
      ${sailboat(400,140,n)}${sled(40,144,n?'#5f6a70':'#c9d2d6')}`},
  gigharbor:{name:'Gig Harbor',ic:'⛵',desc:`Across the Narrows Bridge: money, moorage and the marine repair shop. Coming back to Tacoma costs the ${$(TOLL)} toll`,hours:()=>[420,1260],
    art:({night:n})=>`${hills(n,110)}${narrows(n,{x1:110,x2:370,top:40,deck:86,base:110})}<path d="M0 110 Q60 92 140 100 L140 110 Z" fill="${TC.hill2(n)}"/>${firs([8,26,44,62],n,108)}${sea(n,110)}
      <rect x="380" y="98" width="96" height="28" fill="${n?'#3a3a36':'#dcd3bf'}"/><rect x="376" y="92" width="104" height="8" fill="${n?'#22324a':'#2c4a6e'}"/><text x="428" y="99" text-anchor="middle" font-size="7" ${SVGF} fill="#fff">MARINE REPAIR</text><rect x="392" y="106" width="22" height="12" fill="${win(n)}"/><rect x="430" y="106" width="34" height="20" fill="${n?'#2a2a26':'#7a7468'}"/>
      ${sailboat(90,146,n)}${sailboat(190,152,n,'#e9e2d2')}${sailboat(290,144,n,'#d8e4ea')}${n?'':gull(240,24)+gull(262,30)}`},
};
// Minutes between places by truck (symmetric). GAME.travelAnim (20) or more plays the full-screen transition.
const TRAVEL={'home|downtown':8,'home|marina':15,'home|ruston':12,'home|foss':10,'home|gigharbor':22,
  'downtown|marina':15,'downtown|ruston':10,'downtown|foss':8,'downtown|gigharbor':22,
  'marina|ruston':8,'marina|foss':18,'marina|gigharbor':18,
  'ruston|foss':12,'ruston|gigharbor':22,'foss|gigharbor':25};
function travelMins(a,b){return TRAVEL[a+'|'+b]??TRAVEL[b+'|'+a]??15}
// The Narrows Bridge toll: eastbound only, so leaving Gig Harbor for anywhere in Tacoma costs TOLL.
function tollFor(from,to){return from==='gigharbor'&&to!=='gigharbor'?TOLL:0}
// STORY's onArrive(dest,from) calls this. It charges the toll (if any), logs it and returns what it charged.
function payToll(from,to){
  const t=tollFor(from,to);if(!t) return 0;
  spend(t);S.stats.tolls=(S.stats.tolls||0)+t;
  say(`🌉 ${$(t)} toll on the Narrows Bridge, eastbound. ${pick(['Galloping Gertie never charged a toll. Look how that went.','The Good To Go pass beeps. Your wallet sighs.','Free going out, five bucks coming home. Tacoma’s way of saying “welcome back.”'])}`);
  return t;
}

// ---- actions ----
// Each: {ic, l, s, fn, cat (an ACT_CATS key), cls:'primary'|'danger', dis:true}. fn changes S, calls pass(min) and say('…').
const ACT_CATS={trip:'🛶 Today’s trips',work:'🧰 Business & boat',town:'🏙️ Around town',fish:'🐟 On the water',rest:'🛏️ Rest & recharge',here:'📍 Around here'};
const tryReq=src=>typeof queueRequest==='function'?queueRequest(src):null;   // TRIPS: maybe add a booking request; truthy if one came in
function actionsHere(){
  const d=day(),m=tod(),a=[],last=d+1>=GAME.days;
  const at=(lo,hi)=>m>=lo&&m<hi;
  if(S.loc==='home'){
    const logs=S.unlogged||0,trips=todaysTrips(d+1);
    a.push({ic:'🛏️',l:'Go to bed',s:`Ends the day. Alarm ${fmt(S.alarm)}.${!last&&trips.length?` Tomorrow: ${trips.length} trip${trips.length>1?'s':''}, first at ${fmt(trips[0].start)}.`:''}${logs?` 📓 ${logs} catch record${logs>1?'s':''} still to fill in.`:''}`,cat:'rest',cls:m>=1260?'primary':'',fn:()=>endDay('home')});
    a.push({ic:'⏰',l:`Alarm: ${fmt(S.alarm)}`,s:'Tap to cycle 4:00 → 4:30 → 5:00 → 5:30 → 6:00. Salmon bite at first light.',cat:'rest',fn:()=>{const o=[240,270,300,330,360];S.alarm=o[(o.indexOf(S.alarm)+1)%o.length];say(`⏰ Alarm set for ${fmt(S.alarm)}.`)}});
    a.push({ic:'😴',l:'Rest for an hour',s:'Energy +10. Blinds down, phone face down.',cat:'rest',dis:S.energy>=100,fn:()=>{pass(60);adj('energy',10);say(pick(['😴 An hour on the couch. A neighbor’s bass line, then nothing.','😴 You close your eyes “for a second.” It’s an hour. It helps.','😴 The ferry horns drift up the hill. You drift off.']))}});
    if(typeof homeTripActions==='function') a.push(...(homeTripActions()||[]));
  }
  if(S.loc==='downtown'){
    const open=isOpen('downtown'),g=rp(45),h=rp(12),meal=rp(16),uc=rp(85);
    a.push({ic:'🪝',l:`Restock tackle — ${$(g)}`,s:`Flashers, hoochies, barbless mooching rigs, leader. Gear +2 trips (you have ${S.gear}).`,cat:'town',cls:S.gear<=1?'primary':'',dis:!open||!canAfford(g),
      fn:()=>{spend(g);S.gear+=2;pass(25);say('🪝 Two trips’ worth: green-glow flashers, a handful of hoochies, a spool of 25-pound leader and barbless hooks. The shop guy pinches a barb on principle when you ask.')}});
    a.push({ic:'🐟',l:`Herring tray on ice — ${$(h)}`,s:`For mooching. One tray per trip, good today and tomorrow only (you have ${S.bait}).`,cat:'town',dis:!open||!canAfford(h),
      fn:()=>{spend(h);S.bait++;S.baitDay=d;pass(10);say('🐟 A tray of blue-label herring, packed in ice. Cut-plug them in the morning and they’ll spin just right.')}});
    if(!S.diner[d]) a.push({ic:'🍳',l:`Eat at the diner — ${$(meal)}`,s:'40 min. Energy +12. Once a day. The counter crowd talks.',cat:'town',dis:!open||!canAfford(meal),
      fn:()=>{spend(meal);S.diner[d]=true;pass(40);adj('energy',12);say('🍳 Eggs, hash browns and a burger for later. '+pick(TACOMA_LORE))}});
    if(!S.urgent[d]) a.push({ic:'🩺',l:`Urgent care — ${$(uc)} copay`,s:S.energy<40?'90 min. Hooks in thumbs, sunburn, a back that won’t: energy +22. Once a day.':'90 min. Energy +22. Once a day. You’re not that beat up yet.',cat:'town',cls:S.energy<25?'primary':'',dis:!open||!canAfford(uc)||m>=1170,
      fn:()=>{spend(uc);S.urgent[d]=true;pass(90);adj('energy',22);say('🩺 A nurse pulls a hook out of your thumb, tapes your wrist and tells you to drink water. “You guides are all the same.”')}});
    if(!open) a.push({ic:'🔒',l:'Downtown is closed',s:hoursTxt('downtown'),cat:'town',dis:true,fn:()=>{}});
  }
  if(S.loc==='marina'){
    if(typeof marinaActions==='function') a.push(...(marinaActions()||[]));
    const n=S.coffee[d]||0,c=rp(4);
    a.push({ic:'☕',l:`Coffee at the boathouse — ${$(c)}`,s:n>=3?'Three is plenty. Your hands need to tie knots.':at(300,1200)?'10 min. Energy +6.':'The boathouse counter is open 5 AM–8 PM.',cat:'rest',dis:n>=3||!at(300,1200)||!canAfford(c),
      fn:()=>{spend(c);S.coffee[d]=n+1;pass(10);adj('energy',6);say(pick(['☕ Boathouse coffee: hot, strong, a little burnt. Perfect.','☕ You sip it on the dock and watch the Vashon ferry slide out of Point Defiance.','☕ A seal pops up by the launch, looks at your coffee, judges you, leaves.']))}});
  }
  if(S.loc==='ruston'){
    if(!S.walk[d]) a.push({ic:'🚶',l:'Walk Ruston Way',s:'1 hour. Energy +8. Once a day. Clears your head.',cat:'rest',dis:S.energy>=100,
      fn:()=>{pass(60);S.walk[d]=true;S.stats.walks=(S.stats.walks||0)+1;adj('energy',8);say(pick(['🚶 Two miles of waterfront path: joggers, dogs, the smell of salt and fried fish. '+(at(370,1220)?'The mountain is out.':'The bay is black glass.'),'🚶 You walk to the old Asarco site and back. Herons stand in the shallows like they own the place. They do.','🚶 Cranes across the bay, kids on scooters, a kayak sliding by. You feel human again.']))}});
    if(S.scout!==d+1&&!last) a.push({ic:'🔭',l:'Scout the Slag Pile',s:'45 min. Watch the tide line, bait balls and the boats working the drop-off. Sharper read on the water tomorrow.',cat:'fish',
      fn:()=>{pass(45);S.scout=d+1;adj('energy',-3);say(pick(['🔭 Birds working a bait ball just off the Slag Pile, two boats hooked up on the drop at the top of the tide. You make notes.','🔭 Herring flicking on the surface off the old smelter rock. The tide rip sets up right where it should. Tomorrow looks better.','🔭 You count the boats, the birds and the rod bends. Mostly coho on the rip, a king or two deeper.']))}});
    if(!S.pier[d]) a.push({ic:'🎣',l:'Hang out at Les Davis Pier',s:'30 min. Energy +3. The pier regulars hear everything, and sometimes somebody wants a guide.',cat:'here',
      fn:()=>{pass(30);S.pier[d]=true;adj('energy',3);say('🎣 Squid jiggers, crabbers and a man who has fished this pier since 1979. '+pick(TACOMA_LORE));if(Math.random()<.2&&tryReq('pier'))say('📞 A guy on the pier takes your card. An hour later there’s a booking request in your phone.')}});
  }
  if(S.loc==='foss'){
    const tab=rp(25),open=at(960,1380);
    if(!S.bar[d]) a.push({ic:'🍻',l:`An evening at the taproom — ${$(tab)}`,s:open?'90 min. Energy −10. Once a night. Boaters, port people and folks with money talk fishing. Maybe a booking.':'The waterfront taproom gets lively from 4 PM to 11 PM.',cat:'here',dis:!open||S.energy<12||!canAfford(tab),
      fn:()=>{spend(tab);S.bar[d]=true;S.stats.bar=(S.stats.bar||0)+1;pass(90);adj('energy',-10);
        say(pick(['🍻 Pint of local IPA, the Foss going gold in the sunset, a table of tech guys asking if salmon “bite in August.”','🍻 You end up at the rail with a tug captain and a couple from Seattle who have never once said “Tacompton” without smiling.','🍻 The bartender knows your name now. That’s either good or a warning.']));
        if(Math.random()<.55&&tryReq('bar'))say('📞 Someone at the bar wants to go out. A booking request is waiting in 📅 Bookings.');else say('🍻 Lots of “we should totally go sometime.” Nobody books.')}});
    const mOpen=d%7>=2&&at(600,1020),fee=rp(22);
    if(!S.museum[d]) a.push({ic:'🏺',l:`Museum of Glass — ${$(fee)}`,s:mOpen?'1 hour. Energy +6. Watch the Hot Shop crew blow glass, then cross the Chihuly Bridge.':'Open Wednesday–Sunday, 10 AM–5 PM.',cat:'rest',dis:!mOpen||!canAfford(fee),
      fn:()=>{spend(fee);S.museum[d]=true;pass(60);adj('energy',6);say('🏺 In the Hot Shop under the big tilted cone, a team turns a glowing blob into a salmon. Out on the Chihuly Bridge of Glass, the light comes through blue and gold.')}});
  }
  if(S.loc==='gigharbor'){
    const open=isOpen('gigharbor'),shop=d%7<6&&at(480,1020),fix=rp(350);
    a.push({ic:'🔧',l:`Marine repair: full service — ${$(fix)}`,s:shop?`3 hours. Boat +40 (now ${S.boat}): impeller, lower-unit oil, plugs, a look at the transom.`:'The shop is open Monday–Saturday, 8 AM–5 PM.',cat:'work',cls:S.boat<=40&&shop?'primary':'',dis:!shop||S.boat>=95||!canAfford(fix)||m>840,
      fn:()=>{spend(fix);pass(180);adj('boat',40);adj('energy',-4);say('🔧 The Gig Harbor shop swaps the water-pump impeller, changes the lower-unit oil, finds a cracked fuel line and charges you like you’re a yacht. The sled runs like new.')}});
    const lunch=rp(30);
    if(!S.meet[d]) a.push({ic:'🥂',l:`Meet a wealthy client for a drink — ${$(lunch)}`,s:open?'1 hour on a deck over the harbor. Rep +1, and a good shot at a well-paid booking.':hoursTxt('gigharbor'),cat:'here',dis:!open||!canAfford(lunch),
      fn:()=>{spend(lunch);S.meet[d]=true;pass(60);adj('rep',1);say(pick(['🥂 A retired surgeon with a 40-foot sailboat buys the second round and asks about kings.','🥂 A couple from the yacht club wants to take their grandkids out “for a real fish.”','🥂 A software VP explains crypto. You explain the Chinook minimum size. You both learn something.']));
        if(Math.random()<.6&&tryReq('rich'))say('📞 They want to book. The request is waiting in 📅 Bookings.');else say('🥂 “We’ll call you.” Gig Harbor people do, eventually.')}});
  }
  if(!(S.loc==='home'&&m>=1260)) a.push({ic:'⏳',l:'Wait a while…',s:'Skip ahead 30, 60 or 120 minutes.',cat:'rest',fn:()=>worldWait()});
  return a;
}
function worldWait(){
  const m=tod(),o=[30,60,120].filter(x=>m+x<1439);
  modal('⏳ Wait a while',`<p style="font-size:13px;color:var(--mute)">It’s ${fmt(S.t)}. Time passes and nothing else happens.</p>`,
    o.map(x=>({l:`${x} minutes`,s:`Until ${fmt(S.t+x)}.`,fn:()=>{pass(x);say(`⏳ You wait ${x} minutes at ${L[S.loc].name}.`)}})).concat([{l:'Never mind',fn:()=>{}}]));
}

// ---- small extras on the Here tab ----
function statusTags(){
  const t=[],d=day(),trips=todaysTrips(d);
  if(trips.length) t.push(`<span class="tag">🛶 ${trips.map(b=>fmt(b.start)).join(', ')}</span>`);
  if(S.boat<=40) t.push(`<span class="tag ${S.boat<=20?'bad':''}">🔧 boat ${S.boat}</span>`);
  t.push(`<span class="tag ${S.gear<1?'bad':''}">🪝 tackle ×${S.gear}</span>`);
  if(S.bait) t.push(`<span class="tag">🐟 herring ×${S.bait}</span>`);
  t.push(`<span class="tag ${S.fuel<10?'bad':''}">⛽ ${Math.round(S.fuel)}/${TANK} gal</span>`);
  if(S.unlogged) t.push(`<span class="tag bad">📓 ${S.unlogged} catch record${S.unlogged>1?'s':''} to fill in</span>`);
  if(S.scout===d) t.push('<span class="tag">🔭 you scouted the Slag Pile</span>');
  if(S.energy<25) t.push('<span class="tag bad">🥱 running on fumes</span>');
  if(S.loc==='gigharbor') t.push(`<span class="tag">🌉 ${$(TOLL)} toll back to Tacoma</span>`);
  return t;
}
function alertBar(){
  const d=day(),m=tod(),trips=todaysTrips(d);
  for(const b of trips){
    if(m>b.start&&m<=b.start+90&&S.loc!=='marina') return {t:`⏰ Your party is waiting at Point Defiance Marina (the trip was ${fmt(b.start)}).`};
    if(m>=b.start-150&&m<=b.start&&S.loc!=='marina') return {t:`🛶 Trip today at ${fmt(b.start)} from Point Defiance Marina: ${travelMins(S.loc,'marina')} min away.`,kind:'info'};
  }
  const soon=trips.length||todaysTrips(d+1).length;
  if(soon&&S.fuel<10) return {t:`⛽ Only ${Math.round(S.fuel)} gallons in the tank. A trip burns most of that. Fuel up at the Point Defiance fuel dock.`};
  if(soon&&S.gear<1) return {t:'🪝 Out of tackle. Restock at the tackle shop downtown before your next trip.'};
  if(S.boat>0&&S.boat<=20&&soon) return {t:`🔧 The boat is at ${S.boat}. Breakdowns get likely. The marine repair shop is in Gig Harbor.`,kind:'info'};
  return null;
}

// ---- extra tabs (TRIPS supplies the views) ----
const EXTRA_TABS=[
  {k:'book',ic:'📅',l:'Bookings',view:()=>typeof bookingsView==='function'?bookingsView():'<div class="sect">Bookings</div><div class="rules">No bookings yet.</div>'},
  {k:'fish',ic:'🐟',l:'Fish',view:()=>typeof fishView==='function'?fishView():'<div class="sect">Fish</div><div class="rules">No fishing report yet.</div>'},
  {k:'regs',ic:'📖',l:'Regs',view:()=>typeof regsView==='function'?regsView():'<div class="sect">Regs</div><div class="rules">Check the current WDFW rules.</div>'},
];

// ---- engine shims ----
// The engine (02–09) still calls a few Guide Master helpers without typeof guards (40-art.js, 45-names.js, the morning report).
// These no-op versions only fill in names nobody else defines: a real function or const elsewhere always wins.
(function(){
  const w=window,def=(k,v)=>{if(typeof w[k]==='undefined')w[k]=v};
  def('artOn',()=>false);def('artPref',()=>false);def('artScene',()=>'');def('artFirst',()=>'');def('artSlot',()=>'');def('artEventCtx',()=>null);
  def('artMorning',D=>({top:'',night:(D&&D.night)||''}));
  def('artNarrEvent',()=>null);def('ART',{any:()=>false});def('ART_NARR',null);def('LOGSUB','log');
  def('cabinName',()=>'Home');
  def('dlabel',d=>augDate(d));
  def('reqKey',r=>{if(!r)return 'a trip';const n=(r.party&&r.party.n)||r.n;return `${r.type||'trip'}${n?` for ${n}`:''}${typeof r.start==='number'?` at ${fmt(r.start)}`:''}`});
})();
