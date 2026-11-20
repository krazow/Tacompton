// ============================================================
//  TACOMPTON, part 2: what happens. Lifecycle hooks, random events, tips, the to-do list,
//  achievements, scoring, the title screen and save migrations.
//  One season: Mon Aug 3 – Sun Aug 16, 2026, guiding salmon out of Tacoma (Marine Area 11).
//  Calls into TRIPS (22-trips.js) and WORLD (20-world.js) are all guarded with typeof.
// ============================================================

// ---- dates and small helpers (prefixed st/ST_ so they never clash with WORLD or TRIPS) ----
const ST_MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function stDate(d){const x=new Date(Date.UTC(2026,7,3+d));return `${ST_MON[x.getUTCMonth()]} ${x.getUTCDate()}`}   // day 0 = Aug 3
function stLong(d){return `${dayName(d)}, ${stDate(d)}`}
function stTrips(d){return (S.book||[]).filter(b=>b.day===d&&b.status!=='cancelled')}
function stOpen(d){return stTrips(d).filter(b=>b.status==='booked')}
function stTripType(b){
  const T=(typeof TRIPS!=='undefined'&&TRIPS&&TRIPS[b.type])||(typeof TRIP_TYPES!=='undefined'&&TRIP_TYPES&&TRIP_TYPES[b.type])||null;
  const n=T?(T.n||T.name||b.type):String(b.type||'salmon');
  return {ic:(T&&T.ic)||'🎣',n:n.charAt(0).toUpperCase()+n.slice(1)};
}
function stTripLine(b){const T=stTripType(b),p=b.party||{};return `${T.ic} ${T.n} at ${fmt(b.start||0)}${p.name?` (${p.name}${p.n?`, ${p.n}`:''})`:''}`}
function stFuelFor(b){return typeof tripFuel==='function'?tripFuel(b):8}           // gallons one trip burns (TRIPS may export tripFuel)
function stFuelNeed(d){return stOpen(d).reduce((a,b)=>a+stFuelFor(b),0)}
function stRating(){return typeof ratingAvg==='function'?ratingAvg():null}
function stMods(){const f=S.ev.flags.day;return f&&f.d===day()?f:null}
// Today's event effects, for TRIPS to read if it wants: {d, mood, fog, tribal, aroma, mountain, hawks}
function storyDayMods(){const f=stMods();return f?Object.assign({},f):{d:day(),mood:0}}
function stMod(k,v){const d=day();let f=S.ev.flags.day;if(!f||f.d!==d)f=S.ev.flags.day={d,mood:0};if(k==='mood')f.mood+=v;else f[k]=v}
const ST_OVERHEAD=45;   // a night of moorage, trailer parking, insurance and the phone bill (× difficulty cost)
function stOverhead(){return typeof overhead==='function'?overhead():Math.round(ST_OVERHEAD*(DF().cost||1))}

const ST_LORE=[
  '🌉 Two bridges hum over the Narrows. The first one, Galloping Gertie, shook itself apart in 1940. Locals still mention it.',
  '🏗️ The Port of Tacoma cranes stand over the tideflats like a herd of steel giraffes.',
  '🐻 You can hear the Point Defiance Zoo from the marina parking lot if the wind is right.',
  '☕ Somebody on Hilltop is already arguing about the best burger in town. It’s 5 AM.',
  '🚂 A freight train rolls along Ruston Way, horn and all, right on schedule.',
  '🦅 A bald eagle sits on a piling at Owen Beach like it pays rent.',
  '🏔️ Rainier hides behind the haze. It’s there. Everybody knows it’s there.',
  '💪 Grit City. The sticker on your tackle box is peeling, but it still says it.',
];

// ---- title screen ----
const TITLE={
  start:'Start the season 🎣',
  intro:'You run a one-boat salmon guide business out of Tacoma: Grit City, Tacompton, home of the Aroma. Two weeks in August 2026 (Monday Aug 3 to Sunday Aug 16) on Marine Area 11, from the Clay Banks at Point Defiance to Dalco Passage and the Narrows. Book parties, find the kings and silvers, play it straight with WDFW and keep the boat afloat.',
  bullets:['Answer booking requests on 📅 Bookings and be at the Point Defiance Marina before every trip.','Fuel, herring and tackle first. A boat with no bait catches no fish.','Know the regs: barbless hooks, wild Chinook go back, catch record cards filled in right away.','Fill in the logbook at home before bed.','Three citations and your charter license is gone. Rep at 0 or $2,000 in debt ends it too.'],
  note:'Regulations simplified from the 2026 WDFW Puget Sound rules. Always check the current regs and emergency rules before you fish.',
  art:()=>`<svg viewBox="0 0 480 250" preserveAspectRatio="xMidYMid slice" style="width:100%;height:100%" aria-hidden="true"><defs><linearGradient id="tcs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3b47c"/><stop offset=".55" stop-color="#f7dcb4"/><stop offset="1" stop-color="#cfe1e4"/></linearGradient><linearGradient id="tcw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3f7590"/><stop offset="1" stop-color="#1f4a62"/></linearGradient></defs>
    <rect width="480" height="250" fill="url(#tcs)"/>
    <circle cx="96" cy="58" r="20" fill="#fff1c4" opacity=".9"/>
    <polygon points="190,160 300,52 318,48 334,58 440,160" fill="#9aa9bd"/>
    <polygon points="266,86 300,52 318,48 334,58 362,86 346,80 332,92 318,80 302,94 288,82" fill="#fbfcfd"/>
    <polygon points="0,160 60,128 120,146 170,124 240,150 310,132 380,148 430,126 480,140 480,170 0,170" fill="#3c5a49"/>
    ${[14,34,52,410,430,452].map((x,i)=>`<polygon points="${x},166 ${x+9},${136-i%2*8} ${x+18},166" fill="#2c4638"/>`).join('')}
    <g fill="#c44a2c">${[350,380,410].map(x=>`<rect x="${x}" y="122" width="4" height="40"/><rect x="${x-10}" y="120" width="30" height="4"/><rect x="${x+14}" y="124" width="3" height="16"/>`).join('')}</g>
    <path d="M0 134 L120 134 M30 134 Q60 112 90 134" stroke="#5f6b70" stroke-width="2.5" fill="none"/><rect x="28" y="116" width="3" height="20" fill="#5f6b70"/><rect x="89" y="116" width="3" height="20" fill="#5f6b70"/>
    <rect y="160" width="480" height="90" fill="url(#tcw)"/>
    ${[176,192,210,228].map((y,i)=>`<path d="M${20+i*30} ${y} q20 -5 40 0 t40 0" stroke="#9cc5d6" stroke-width="1.5" fill="none" opacity=".5"/><path d="M${300-i*20} ${y+6} q20 -5 40 0 t40 0" stroke="#9cc5d6" stroke-width="1.5" fill="none" opacity=".4"/>`).join('')}
    <g class="bob"><polygon points="196,198 290,198 280,214 206,214" fill="#f4f1ea"/><rect x="226" y="182" width="34" height="16" fill="#e8e2d4"/><rect x="232" y="186" width="10" height="7" fill="#7fb0c8"/><rect x="246" y="186" width="10" height="7" fill="#7fb0c8"/><line x1="272" y1="198" x2="300" y2="168" stroke="#333" stroke-width="1.5"/><line x1="212" y1="198" x2="186" y2="170" stroke="#333" stroke-width="1.5"/><rect x="196" y="204" width="94" height="3" fill="#2f6e8e"/></g>
    <text x="240" y="244" text-anchor="middle" font-size="22">🐟</text></svg>`,
};

// ---- lifecycle hooks (04-loop.js) ----
function onNewGame(){
  say(`${stLong(0)}, 2026, ${fmt(S.t)}. Hilltop is still dark. The boat is on the trailer out back with ${S.fuel} gallons in a 40-gallon tank.`);
}
function stWelcome(){
  const t=stTrips(0),all=(S.book||[]).length;
  modal('🎣 Welcome to Tacompton',`<p>You run a six-pack salmon charter out of <b>Tacoma</b>: one boat, a WA charter license, a stack of catch record cards and a phone that rings at weird hours.</p>
    <p>📆 The season is <b>two weeks</b>: Monday Aug 3 to Sunday Aug 16. Chinook (kings) and coho (silvers) are in Marine Area 11. No pinks this year: they run in odd years.</p>
    <p>📅 You have <b>${all} trip${all===1?'':'s'}</b> on the books${t.length?`, ${t.length} of them today`:''}. New requests come in every morning on the <b>Bookings</b> tab.</p>
    <p>🛶 Trips leave from the <b>Point Defiance Marina</b>. Buy herring and tackle downtown first, and fuel at the marina’s fuel dock.</p>
    <p>📖 The <b>Regs</b> tab has the rules. WDFW checks boats at the launch. Three citations and your license is gone.</p>`,[{l:'Coffee, then the boat',fn:()=>{}}]);
}
const ST_MORNING=['☀️ Clear and cool. August in the Northwest at its best.','🌫️ A marine layer sits on the Sound. It’ll burn off by ten.','🌬️ A light northerly. The bay has a chop on it.','🌤️ Haze from somebody’s wildfire over the Cascades.','🐦 The crows on your street are holding a meeting. Loudly.','☕ The coffee maker gurgles like it knows it’s August.'];
function onMorning(d){
  if(typeof tripsMorning==='function') tripsMorning(d);
  if(d===0){stWelcome();return}
  say(`${stLong(d)}, ${fmt(S.t)}. ${pick(ST_MORNING)}${Math.random()<.35?' '+pick(ST_LORE):''}`);
  const t=stOpen(d);
  if(t.length) say('🛶 Today: '+t.map(stTripLine).join(' · '));
  else say('🛶 No trips today. Restock, scout the bay from Ruston Way, or answer requests on 📅 Bookings.');
  const need=stFuelNeed(d);if(need&&S.fuel<need) say(`⛽ The boat has ${S.fuel} gallons and today needs about ${need}. Fuel dock at the marina.`);
  if(d===GAME.days-1) say('🏁 Last day of the season. Tonight you add it all up.');
}
function onNight(where,notes,d){
  if(where==='collapsed'){S.loc='home';notes.push('😵 You were up past midnight. You wake up on the couch with your rain jacket still on.')}
  const oh=stOverhead();money(-oh);S.stats.spent+=oh;notes.push(`💸 Moorage, trailer parking, insurance and the phone: ${$(oh)}.`);
  if(typeof tripsNight==='function') tripsNight(notes,d);
  if(S.trip){S.trip=null;notes.push('🛶 A trip was never finished. The party went home without paying.')}
  adj('energy',(where==='home'?60:30)/(where==='collapsed'?2:1));
  if(d+1<GAME.days){const need=stFuelNeed(d+1);if(need&&S.fuel<need)notes.push(`⛽ Tomorrow needs about ${need} gallons and the boat has ${S.fuel}. Fuel up at the marina before you launch.`)}
  if(d+1<GAME.days&&stOpen(d+1).length&&S.gear<1)notes.push('🪝 You’re out of tackle. The shop downtown opens at 6.');
  if(S.boat<=25)notes.push(`🔧 The boat is at ${S.boat}. The marine shop in Gig Harbor can fix that.`);
  if(S.energy<15)notes.push('🥱 You’re running on fumes.');
}
function onTime(min){if(min>0)adj('energy',-min/50)}
function onArrive(dest,from){
  S.visited[dest]=true;
  if(typeof payToll==='function') payToll(from,dest);   // WORLD: $5 leaving Gig Harbor, logged and added to S.stats.tolls
}
function daySummary(d){const n=(S.book||[]).filter(b=>b.day===d&&b.status==='done').length;return [`⭐ ${S.rep}`,`⚡ ${S.energy}`,`🛶 ${n} trip${n===1?'':'s'}`]}
function hudDay(d){return `${stDate(d)} · Day ${d+1} of ${GAME.days}`}

// ---- losing ----
const LOSSES={
  permit:['License pulled','Three citations. WDFW suspends your charter license, and the boat goes up on Craigslist. Maybe next year.'],
  broke:['Out of money','More than $2,000 in the hole. The bank wants the boat more than you do.'],
  rep:['Nobody’s calling','Your reviews are so bad the phone stopped ringing. Tacoma is a small town on the internet.'],
};
function checkLoss(){if(S.cites>=3)return 'permit';if(S.money< -2000)return 'broke';if(S.rep<=0)return 'rep';return null}

// ---- random events (03-events.js). Hooks: wake, arrive {at,from}, travel {from,to}, night {where,notes} ----
defEvent({id:'tacoma_aroma',hook:'wake',tile:['👃','The Tacoma Aroma','bad'],chance:0.18,max:2,cooldown:4,cond:()=>day()>0,
  run:()=>{stMod('aroma',true);stMod('mood',-2);adj('energy',-3);say('👃 A south wind brings the Tacoma Aroma up from the tideflats. Your clients will ask. Tell them it smells like jobs.')}});
defEvent({id:'mountain_out',hook:'wake',tile:['🏔️','The mountain is out','good'],chance:0.3,max:4,cooldown:2,cond:()=>day()>0,
  run:()=>{stMod('mountain',true);stMod('mood',4);adj('energy',5);say('🏔️ The mountain is out. Rainier fills the whole south sky, pink in the first light. Clients will take a hundred pictures.')}});
defEvent({id:'dalco_fog',hook:'wake',tile:['🌫️','Fog in Dalco Passage','bad'],chance:0.15,bad:true,max:3,cooldown:3,cond:()=>day()>0,
  run:()=>{stMod('fog',true);adj('energy',-4);say('🌫️ Thick fog in Dalco Passage. Radar on, horn ready, and slow going to the spots until it lifts.')}});
defEvent({id:'tribal_opener',hook:'wake',tile:['🛶','Treaty fishery opener','info'],chance:0.2,max:2,cooldown:5,cond:()=>day()>0,
  run:()=>{stMod('tribal',true);say('🛶 The Puyallup Tribe has a treaty net opener in Commencement Bay today. It’s their right and their fishery. Give the nets a wide berth; the inner bay will be busy.')}});
defEvent({id:'seahawks_sunday',hook:'wake',tile:['🏈','Seahawks Sunday','info'],chance:0.75,max:2,cond:()=>dayName(day())==='Sunday',
  run:()=>{stMod('hawks',true);stMod('mood',2);say('🏈 Seahawks preseason game this afternoon. Every client is wearing blue and green, and everyone wants to be off the water by kickoff.')}});
defEvent({id:'heat_wave',hook:'wake',tile:['🥵','Hot one','bad'],chance:0.1,bad:true,max:2,cooldown:4,cond:()=>day()>0,
  run:()=>{adj('energy',-5);stMod('mood',-1);say('🥵 Ninety degrees by noon, they say. Tacoma treats that like a natural disaster. Pack extra water.')}});
defEvent({id:'zoo_morning',hook:'wake',tile:['🦁','Zoo neighbors','good'],chance:0.08,max:1,cond:()=>day()>0,
  run:()=>{adj('energy',3);say('🦁 Something at the Point Defiance Zoo roars at sunrise. Better than an alarm clock.')}});
defEvent({id:'i5_dome',hook:'travel',tile:['🚗','I-5 at the Tacoma Dome','bad'],chance:0.22,bad:true,cooldown:2,cond:c=>['downtown','foss'].includes(c.to)||['downtown','foss'].includes(c.from),
  run:()=>{pass(20);say('🚗 I-5 is parked solid at the Tacoma Dome. Concert traffic, or construction, or both. +20 minutes.')}});
defEvent({id:'trailer_breakdown',hook:'travel',tile:['🛞','Trailer trouble','bad'],chance:0.07,bad:true,max:2,cooldown:4,cond:c=>c.to==='marina'&&c.from==='home',
  run:()=>{const c=Math.round(65*(DF().cost||1));pass(35);money(-c);S.stats.spent+=c;say(`🛞 A trailer bearing goes on Pearl Street. A shoulder, a jack and a spare later: +35 minutes, ${$(c)} for a new bearing kit.`)}});
defEvent({id:'narrows_wind',hook:'travel',tile:['🌉','Wind on the Narrows','info'],chance:0.25,cooldown:3,cond:c=>c.to==='gigharbor'||c.from==='gigharbor',
  run:()=>{say('🌉 A crosswind on the Narrows Bridge. You think about Galloping Gertie, like everybody does, and keep both hands on the wheel.')}});
defEvent({id:'sea_lion_dock',hook:'arrive',tile:['🦭','Sea lion on the dock','info'],chance:0.14,cooldown:3,cond:c=>c.at==='marina',
  run:()=>{pass(10);say('🦭 A six-hundred-pound sea lion is asleep across your slip. Nobody argues with him. You wait ten minutes until he slides off.')}});
defEvent({id:'seal_thief',hook:'arrive',tile:['🦭','A seal steals a fish','bad'],chance:0.12,bad:true,max:2,cooldown:3,cond:c=>c.at==='marina'&&S.stats.fish>0,
  run:()=>{adj('rep',-1);say('🦭 A harbor seal pops up at the cleaning station and swipes the coho a dock neighbor was about to fillet. Somehow, it’s your fault. Rep −1.')}});
defEvent({id:'wdfw_launch',hook:'arrive',tile:['🧢','WDFW at the launch','info'],chance:0.2,cooldown:3,cond:c=>c.at==='marina',
  run:()=>{
    if(S.unlogged>0){S.warns++;say(`🧢 A WDFW officer at the launch asks to see your catch record cards. ${S.unlogged} catch${S.unlogged>1?'es aren’t':' isn’t'} written down. A warning this time, and a long look. Fill them in right after you land a fish.`)}
    else{adj('rep',1);say('🧢 A WDFW officer at the launch checks your license and your barbless hooks, then talks coho counts for ten minutes. Clean boat. She says she’ll tell people you run it right.');pass(10)}}});
defEvent({id:'orca_pod',hook:'arrive',tile:['🐋','Orcas in the Sound','good'],chance:0.08,max:2,cooldown:4,cond:c=>['marina','ruston'].includes(c.at),
  run:()=>{adj('rep',3);adj('energy',5);say('🐋 A pod of orcas rolls past Point Defiance, blows misting in the sun. Half of Ruston Way stops to watch. You post a picture; the phone lights up. Rep +3.')}});
defEvent({id:'frisko',hook:'arrive',tile:['🍔','Burger stop','good'],chance:0.2,cooldown:2,cond:c=>c.at==='downtown'&&isOpen('downtown'),
  run:()=>{money(-12);S.stats.spent+=12;adj('energy',8);say('🍔 A cheeseburger and a shake from the old drive-in on Division. Tacoma runs on these. −$12, energy +8.')}});
defEvent({id:'spar_regular',hook:'arrive',tile:['🍺','Word at The Spar','good'],chance:0.12,max:2,cooldown:4,cond:c=>['ruston','foss'].includes(c.at)&&tod()>=960,
  run:()=>{adj('rep',2);say('🍺 A regular who drinks at The Spar in Old Town recognizes your boat hat. “My brother-in-law says you put him on a king.” Word of mouth. Rep +2.')}});
defEvent({id:'yacht_tip',hook:'arrive',tile:['🛥️','Advice for a yacht owner','good'],chance:0.18,max:2,cooldown:3,cond:c=>c.at==='gigharbor',
  run:()=>{money(40);S.stats.earned+=40;say('🛥️ A guy on a sixty-foot yacht in Gig Harbor asks how to rig a cut-plug herring. You show him. He hands you two twenties.')}});
defEvent({id:'neighbor_smoker',hook:'arrive',tile:['🔥','The neighbor’s smoker','good'],chance:0.12,max:1,cond:c=>c.at==='home'&&S.stats.fish>0,
  run:()=>{say('🔥 Your downstairs neighbor is firing up his smoker and asks if you have a fish to spare. You give him a coho.');chain('smoked_salmon')}});
defEvent({id:'smoked_salmon',hook:'night',tile:['🐟','Smoked salmon','good'],
  run:()=>{adj('energy',6);adj('rep',1);say('🐟 He knocks at dinner with a plate of smoked salmon and tells the whole building you’re the real deal.')}});
defEvent({id:'bilge_pump',hook:'night',tile:['🔧','Bilge pump on the fritz','bad'],chance:0.08,bad:true,max:2,cooldown:4,
  run:()=>{adj('boat',-5);say('🔧 The bilge pump quits overnight. You find out at dawn. Boat −5.')}});
defEvent({id:'car_carrier',hook:'travel',tile:['🚢','A car carrier comes in','info'],chance:0.1,cooldown:4,cond:c=>c.to==='ruston',
  run:()=>{say('🚢 A car carrier the size of a building slides past Browns Point toward the port. Its wake slaps the whole Ruston shoreline.')}});

// ---- tips: one a day, first match wins, each once per game ----
const TIPS=[
  {id:'welcome',when:()=>day()===0&&S.loc==='home',t:'👋 Welcome, {{name}}! Check <b>📅 Bookings</b> for today’s trips, then get herring and tackle <b>Downtown</b> before you head to the <b>Point Defiance Marina</b>.'},
  {id:'bait',when:()=>stOpen(day()).length&&S.bait<1,t:'🐟 No herring on ice. Buy trays at the tackle shop <b>Downtown</b> (6 AM–9 PM): one tray a trip, and it spoils after a day.'},
  {id:'fuel',when:()=>S.fuel<Math.max(8,stFuelNeed(day())),t:'⛽ The tank is low. Fuel up at the <b>marina fuel dock</b> before you launch. Running dry on the Sound is expensive.'},
  {id:'launch',when:()=>stOpen(day()).length&&S.loc!=='marina',t:'🛶 Trips start at the <b>Point Defiance Marina</b>. Use <b>🧭 Go somewhere</b> and get there before the start time. Late costs goodwill.'},
  {id:'requests',when:()=>(S.reqs||[]).length>0,t:'📞 Booking requests wait on <b>📅 Bookings</b> (look for the dot). Answer them before they expire.'},
  {id:'logbook',when:()=>S.unlogged>0,t:'📓 Fill in your catch record cards and logbook at <b>home</b> before bed. WDFW checks.'},
  {id:'fishtab',when:()=>day()>=1,t:'🐟 The <b>Fish</b> tab shows today’s spots (Hot, Good, Fair, Poor) and the tides. Read it before you pick a spot.'},
  {id:'regs',when:()=>day()>=1&&S.stats.trips>0,t:'📖 The <b>Regs</b> tab lists the limits, the wild Chinook release rule and your licenses. Dilemmas on the water always have a legal answer.'},
  {id:'cite',when:()=>S.cites>=1,t:'⚠️ You have a citation. Three and your charter license is gone. Playing it straight costs a little now and a lot less later.'},
  {id:'energy',when:()=>S.energy<30,t:'🥱 Low energy means slow, sloppy trips. Rest at <b>home</b>, or grab breakfast at the diner Downtown.'},
  {id:'gear',when:()=>S.gear<=1,t:'🪝 You’re almost out of tackle. Restock <b>Downtown</b> before the next trip.'},
  {id:'boat',when:()=>S.boat<=40,t:'🔧 The boat is wearing out. The marine repair shop is in <b>Gig Harbor</b> (the bridge toll is paid coming back).'},
  {id:'bed',when:()=>S.loc==='home'&&tod()>=1260,t:'🛏️ Go to bed before midnight. Guides get up at 4:30.'},
  {id:'todo',when:()=>day()>=2,t:'📋 The <b>To-do</b> tab lists today’s trips, fuel, gear, the logbook and your record, plus your own priorities.'},
];

// ---- To-do tab: {l, s, ok, fail, urgent} ----
function todoItems(){
  const d=day(),m=tod(),it=[];
  stTrips(d).forEach(b=>{const T=stTripType(b),p=b.party||{};
    it.push({l:`${T.ic} ${T.n}${p.name?`: ${p.name}`:''}`,s:`${fmt(b.start||0)}, Point Defiance Marina${p.n?` · party of ${p.n}`:''}`,ok:b.status==='done',fail:b.status==='noshow'||b.status==='cancelled',urgent:b.status==='booked'&&m>=(b.start||0)-120})});
  const open=stOpen(d),need=stFuelNeed(d)||(stOpen(d+1).length?stFuelNeed(d+1):0);
  if(need) it.push({l:'Fuel for the trips',s:`${S.fuel} of 40 gal in the tank, about ${need} needed. Marina fuel dock.`,ok:S.fuel>=need,urgent:S.fuel<need&&open.length>0});
  const trips=open.length||stOpen(d+1).length;
  if(trips){
    it.push({l:'Herring on ice',s:`${S.bait} tray${S.bait===1?'':'s'}. One per trip. Tackle shop Downtown.`,ok:S.bait>=open.length&&(open.length>0||S.bait>0),urgent:open.length>0&&S.bait<open.length});
    it.push({l:'Tackle',s:`${S.gear} trip${S.gear===1?'':'s'}’ worth of flashers, hoochies and leaders.`,ok:S.gear>=trips,urgent:S.gear<1});
  }
  it.push({l:'Logbook and catch record cards',s:S.unlogged?`${S.unlogged} to fill in at home before bed.`:'All caught up.',ok:!S.unlogged,urgent:S.unlogged>0&&m>=1200});
  it.push({l:'Keep a clean record',s:`${S.cites} citation${S.cites===1?'':'s'}, ${S.warns} warning${S.warns===1?'':'s'}. Three citations and your license is gone.`,ok:S.cites===0,urgent:S.cites>=2});
  if(S.boat<=40) it.push({l:'Get the boat looked at',s:`Condition ${S.boat}. Marine repair in Gig Harbor.`,ok:false,urgent:S.boat<=20});
  it.push({l:'Optional: see all of Tacoma',s:`${Object.keys(S.visited).length} of ${Object.keys(L).length} places.`,ok:Object.keys(L).every(k=>S.visited[k])});
  return it;
}
const GRADE_CUTS=[14000,11000,8000,5000];   // A, B, C, D (the same on every difficulty)
const SCORE_W={rep:40,star:1000,trip:150,cite:1500};
const RULES_HTML=`<p>Guide salmon out of Tacoma for two weeks, Mon Aug 3 to Sun Aug 16, 2026. The season ends early with <b>3 citations</b> (license pulled), <b>reputation at 0</b> or <b>more than $2,000 in debt</b>.</p><p>Score: cash + reputation × ${SCORE_W.rep} + ★ rating × ${grp(SCORE_W.star)} + trips × ${SCORE_W.trip} − citations × ${grp(SCORE_W.cite)}. Grades: A ${grp(GRADE_CUTS[0])}, B ${grp(GRADE_CUTS[1])}, C ${grp(GRADE_CUTS[2])}, D ${grp(GRADE_CUTS[3])}; a season that ends early is an F.</p><p>Difficulty never changes the score or the cutoffs, only the game: Rookie has more cash and fewer patrols, Combat less cash, more patrols and bigger fines.</p>`;

// ---- achievements: test(ctx) runs after every render ({}), each night ({night,where}) and at the end ({end,lost}) ----
const ST_SEEN=id=>(S.ev.count[id]||0)>0;
const ACH=[
  {id:'first_trip',ic:'🛶',n:'Off the Dock',d:'Finish your first guided trip.',test:()=>S.stats.trips>0},
  {id:'first_king',ic:'👑',n:'King of the Clay Banks',d:'Land a Chinook on a trip.',test:()=>S.stats.chinook>0},
  {id:'silver_10',ic:'🥈',n:'Silver Lining',d:'Land 10 coho in a season.',test:()=>S.stats.coho>=10},
  {id:'fish_50',ic:'🐟',n:'Fish Box Full',d:'Land 50 salmon in a season.',test:()=>S.stats.fish>=50},
  {id:'busy',ic:'📅',n:'Booked Solid',d:'Run 20 trips in one season.',test:()=>S.stats.trips>=20},
  {id:'five_star',ic:'⭐',n:'Five Stars',d:'Get a five-star review.',test:()=>(S.reviews||[]).some(r=>r.stars>=5)},
  {id:'top_rated',ic:'🌟',n:'Top-Rated Guide',d:'Finish with a ★4.5 average or better over at least 10 reviews.',test:c=>c.end&&!c.lost&&(S.reviews||[]).length>=10&&(stRating()||0)>=4.5},
  {id:'clean',ic:'🧼',n:'By the Book',d:'Finish the season without a single violation.',test:c=>c.end&&!c.lost&&!S.stats.viol&&!S.cites},
  {id:'tips',ic:'💵',n:'Big Tippers',d:'Earn $1,000 in tips in one season.',test:()=>S.stats.tips>=1000},
  {id:'grit',ic:'💪',n:'Grit City',d:'Visit every place in town.',test:()=>Object.keys(L).every(k=>S.visited[k])},
  {id:'mountain',ic:'🏔️',n:'The Mountain Is Out',d:'Wake up to Rainier in full view.',test:()=>ST_SEEN('mountain_out')},
  {id:'orcas',ic:'🐋',n:'Southern Residents',d:'See orcas in the Sound.',test:()=>ST_SEEN('orca_pod')},
  {id:'aroma',ic:'👃',n:'Smells Like Jobs',d:'Survive a morning of the Tacoma Aroma.',test:()=>ST_SEEN('tacoma_aroma')},
  {id:'reliable',ic:'⏰',n:'Always There',d:'Finish the season with 10+ trips and no no-shows.',test:c=>c.end&&!c.lost&&S.stats.trips>=10&&!S.stats.noshow},
  {id:'grade_a',ic:'🏆',n:'Grit City Legend',d:'Finish the season with an A.',test:c=>c.end&&!c.lost&&scoreOf()>=GRADE_CUTS[0]},
];

// ---- scoring and the end screen ----
const FINISH_TEXT={h1:'{{name}}, that’s a wrap on the season',sub:()=>`Two weeks on Marine Area 11, Aug 3–16, 2026. The boat’s on the trailer, the Aroma is back on the breeze, and the coho are still coming.`};
function scoreParts(){
  const r=stRating()||0,st=S.stats;
  return [['Cash',S.money,'what’s in the account'],['Reputation',S.rep*SCORE_W.rep,`${S.rep} × ${SCORE_W.rep}`],
    ['★ rating',r*SCORE_W.star,r?`★${r.toFixed(2)} × ${grp(SCORE_W.star)}`:'no reviews yet'],['Trips',st.trips*SCORE_W.trip,`${st.trips} × ${SCORE_W.trip}`],
    ['Citations',-S.cites*SCORE_W.cite,`${S.cites} × −${grp(SCORE_W.cite)}`]].map(([k,v,n])=>[k,Math.round(v)||0,n]);
}
function scoreOf(){return scoreParts().reduce((a,r)=>a+r[1],0)}
function gradeOf(sc){
  if(sc>=GRADE_CUTS[0]) return ['A','Grit City Legend','Other guides watch where you set up off the Clay Banks.'];
  if(sc>=GRADE_CUTS[1]) return ['B','Point Defiance Regular','The fuel dock knows your order.'];
  if(sc>=GRADE_CUTS[2]) return ['C','Weekend Skipper','You caught fish. Mostly on purpose.'];
  if(sc>=GRADE_CUTS[3]) return ['D','Dock Rat','You learned the regs the expensive way.'];
  return ['F','Back to the Day Job','The Sound will still be here next August.'];
}
function endRows(){
  const s=S.stats,r=stRating();
  return [['Difficulty',`${DF().ic} ${DF().n}`],['Cash',$(Math.round(S.money))],['Net for the season',$(Math.round(S.money-(DF().money||0)))],
    ['Trips / clients',`${s.trips} / ${s.clients}`],['Salmon landed',`${s.fish} (${s.chinook} Chinook, ${s.coho} coho)`],
    ['Earned / tips / spent',`${$(s.earned)} / ${$(s.tips)} / ${$(s.spent)}`],['★ rating',r?`★${r.toFixed(2)} from ${(S.reviews||[]).length} review${(S.reviews||[]).length===1?'':'s'}`:'no reviews'],
    ['Reputation',S.rep],['Record',`${S.cites} citation${S.cites===1?'':'s'}, ${S.warns} warning${S.warns===1?'':'s'}, ${$(s.fines||0)} in fines`],
    ['No-shows',s.noshow||0],['Fuel burned',`${grp(s.fuelGal||0)} gal`],['Bridge tolls',$(s.tolls||0)],['Places visited',`${Object.keys(S.visited).length} of ${Object.keys(L).length}`]];
}

// ---- save migrations ----
// Bump GAME.schema and add an entry when the shape of S changes in a way fillDefaults can't handle.
const MIGRATIONS=[];
