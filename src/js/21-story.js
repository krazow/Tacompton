// ============================================================
//  TACOMPTON, part 2: what happens. The title screen, the job pick, lifecycle hooks, random events, tips,
//  the to-do list, achievements, scoring and save migrations.
//  Two weeks on Hilltop: Mon Aug 3 – Sun Aug 16, 2026. Rent is due by the end of the last day.
// ============================================================

// ---- dates and small helpers ----
function stLong(d){return longDate(d)}
function stMet(id){if(S.met[id])return false;S.met[id]=day()+1;S.stats.neighbors=metCount();adj('community',MEET_COMMUNITY);return true}
const stNb=id=>NEIGHBORS.find(x=>x.id===id);

// ---- title screen ----
const TITLE={
  start:'🆕 New game',
  intro:'Live a life on Hilltop, the old neighborhood up on the hill in Tacoma, Washington: Martin Luther King Jr. Way down the middle, murals on the walls and the mountain over everything. Start at 12, 15 or 18, in any year from 1980 to today, and play six months, a year, two years or a whole lifetime: school, work, rent, friends, family and the city changing around you. Or try Quick play: two weeks moving in at 18, or Growing Up’s first week at 12. The name is a wink at an old nickname for the city, said with a grin by people who grew up here; the game itself is a love letter to Hilltop: the people who built it, the people who stayed, and the people just arriving.',
  bullets:['🌱 <b>New life:</b> pick a length, a starting age and a start year. The important weeks play day by day; the time between is a summary with a choice.','🏫 Middle school, Hilltop High, a first job at 16, then work, college, a trade or the Army at 18.','🏠 Pay the rent, keep food in the fridge, your energy up and your stress down.','📱 A phone with texts, calls and apps, as the years allow.','🤝 Meet your neighbors, show up for the block, and watch Tacoma change.'],
  note:'A game about a real neighborhood. Businesses and neighbors in it are made up.',
  art:()=>`<svg viewBox="0 0 480 250" preserveAspectRatio="xMidYMid slice" style="width:100%;height:100%" aria-hidden="true"><defs><linearGradient id="tts" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1a97a"/><stop offset=".5" stop-color="#f8d9b0"/><stop offset="1" stop-color="#d7e6e6"/></linearGradient></defs>
    <rect width="480" height="250" fill="url(#tts)"/><circle cx="90" cy="64" r="22" fill="#fff1c4" opacity=".9"/>
    ${rainier(false,318,1,148)}
    <rect y="140" width="480" height="30" fill="#5d93ad"/><path d="M40 152 q24 -4 48 0 M220 160 q24 -4 48 0 M380 150 q24 -4 48 0" stroke="#a6d0df" stroke-width="2" fill="none" opacity=".7"/>
    <rect x="18" y="146" width="150" height="4" fill="#8a8d86"/>${boxesOnDock(82,false,146)}${crane(46,false,146,.78)}${crane(110,false,146,.78)}${crane(150,false,146,.7)}
    <path d="M0 250 V176 Q60 150 150 160 Q240 168 300 156 Q380 142 480 160 V250 Z" fill="#4c6b58"/>
    ${[[18,'#b66a4a'],[96,'#d9b45a'],[176,'#6f9aa6'],[300,'#c97a5a'],[392,'#8fae7a']].map(([x,c],i)=>`<g transform="translate(${x},${170-i%2*6})"><rect width="58" height="38" fill="${c}"/><polygon points="-5,2 29,-20 63,2" fill="#5a3328"/><rect x="8" y="10" width="12" height="11" fill="#fbe9b0"/><rect x="38" y="10" width="12" height="11" fill="#fbe9b0"/><rect x="24" y="22" width="10" height="16" fill="#3a2a20"/></g>`).join('')}
    <rect x="252" y="150" width="34" height="60" fill="#8c4a38"/>${[0,1,2].map(r=>`<rect x="258" y="${158+r*14}" width="8" height="8" fill="#fbe9b0"/><rect x="272" y="${158+r*14}" width="8" height="8" fill="#fbe9b0"/>`).join('')}
    <rect y="214" width="480" height="36" fill="#55595d"/><path d="M0 222 H480 M0 228 H480" stroke="#a0a4a8" stroke-width="1.3"/><path d="M0 196 H480" stroke="#3a3f45" stroke-width="1"/>
    <g class="bob"><g transform="translate(150,226)"><rect x="0" y="-30" width="170" height="26" rx="7" fill="#f4f5f2"/><rect x="0" y="-12" width="170" height="5" fill="#2f8f6a"/><rect x="0" y="-7" width="170" height="3" fill="#2a6fa8"/>${[0,1,2,3,4,5,6].map(i=>`<rect x="${10+i*22}" y="-26" width="16" height="11" rx="2" fill="#5d7f93"/>`).join('')}<path d="M74 -30 l14 -12 l14 12" stroke="#555" stroke-width="1.5" fill="none"/>${[18,62,108,152].map(c=>`<circle cx="${c}" cy="-2" r="4" fill="#2b2f33"/>`).join('')}</g></g>
    ${[[30,200],[440,198]].map(([x,y])=>`<rect x="${x-2}" y="${y-10}" width="4" height="14" fill="#5e4630"/><circle cx="${x}" cy="${y-18}" r="13" fill="#3d7a4e"/>`).join('')}</svg>`,
};

// ---- the job pick (day one) ----
function jobModal(){
  modal('💼 Your new job',`<p>You moved to Hilltop for work. Which job did you take?</p>${Object.values(JOBS).map(j=>`<p><b>${j.ic} ${j.n}.</b> ${j.blurb} About <b>${$(j.pay)}</b> a shift${j.tips?' plus tips':''}.</p>`).join('')}<p style="font-size:13px;color:var(--mute)">You keep this job for the whole two weeks.</p>`,
    Object.entries(JOBS).map(([k,j])=>({l:`${j.ic} ${j.n}`,s:`${fmt(j.start)}–${fmt(j.end)}, ${j.days[0]===0?'Mon–Fri':'Wed–Sun'} · ${$(j.pay)} a shift${j.tips?' + tips':''}`,np:true,fn:()=>pickJob(k)})),true);
}
function pickJob(k){
  const j=JOBS[k];S.job=k;S.jobPicked=true;S.alarm=j.alarm;
  if(S.life&&!S.life.jobs.length)S.life.jobs.push({job:k,age:S.age,path:'job'});   // 10-life.js: the life summary's Work
  say(`${j.ic} You’re the new ${j.role} at ${j.place}. ${isShiftDay(0)?`First shift today at ${fmt(j.start)}.`:`Your first shift is Wednesday at ${fmt(j.start)}. Today and tomorrow are yours.`}`);
  stWelcome();
}
function stWelcome(){
  const j=job();
  modal('📦 Welcome to Hilltop',`<p>The moving truck left last night. You have a bed, ${BOXES} boxes, a fridge with <b>${S.food} meals</b> in it and <b>${$(Math.round(S.money))}</b> in the bank.</p>
    <p>${j.ic} Work: <b>${fmt(j.start)} to ${fmt(j.end)}</b>, ${j.days[0]===0?'Monday to Friday':'Wednesday to Sunday'}, at ${j.place}. It’s ${travelMins('home','work')} minutes from your door.</p>
    <p>🧾 Rent is <b>${$(S.rent.amt)}</b>, due by the end of <b>${longDate(S.rent.due)}</b>. Pay it from home whenever you have it.</p>
    <p>🛒 The corner market on <b>MLK</b> sells groceries. You eat a meal from the fridge every night.</p>
    <p>🤝 Hilltop is a neighborhood that notices who shows up. Say hi.</p>`,[{l:'Open the blinds',fn:()=>{}}]);
}

// ---- lifecycle hooks (04-loop.js) ----
function onNewGame(){
  lifeNew();   // 10-life.js: the length, the starting age, the calendar and the key weeks
  if(isGrow()) return GROW.onNewGame();
  say(`${stLong(0)}, 2026, ${fmt(S.t)}. Your first morning on Hilltop. Boxes everywhere, the window open, the Link bell ringing down on MLK.`);
  jobModal();
}
const ST_MORNING=['☀️ Clear and warm already. August on the hill.','🌫️ A marine layer over the bay. It’ll burn off by ten.','🐦 The crows on the power line are holding a meeting. Loudly.','🎶 Somebody down the block is playing old Motown with the windows open.','🚋 The first Link of the day dings past on MLK.','☕ The neighbor’s coffee smells better than yours. You’ll ask what it is.','🌤️ Haze from a wildfire somewhere over the Cascades. The sun comes up orange.'];
function onMorning(d){
  if(isGrow()){GROW.onMorning(d);lifeMorning(d);return}
  adultMorning(d);lifeMorning(d);   // 10-life.js: birthdays, and the school day in the longer games
}
function adultMorning(d){
  if(d===0) return;
  const J=job();
  say(`${stLong(d)}, ${fmt(S.t)}. ${pick(ST_MORNING)}`);
  if(isShiftDay(d)) say(`${J.ic} Work today at ${fmt(J.start)}, ${J.place}.`); else say('🛋️ A day off. The hill is yours.');
  if(isFairDay(d)) say('🎪 The Hilltop Street Fair is on MLK today, 10 AM to 6 PM.');
  if(dayName(d)==='Sunday'&&d<GAME.days-1) say('⛪ Sunday. Church bells, then church choirs, all up and down the hill.');
  if(lifeLong()){if(!S.rent.paid&&d===S.rent.due)say(`🏁 Rent (${$(S.rent.amt)}) is due tonight. Pay it at home.`);else if(!S.rent.paid&&d>=S.rent.due-3)say(`🧾 Rent is due ${rentBy()}: ${$(S.rent.amt)}. You have ${$(Math.round(S.money))}.`)}
  else if(d===GAME.days-1) say(S.rent.paid?'🏁 Last day of your first two weeks. Rent is paid. Tonight you take stock.':`🏁 Last day. Rent (${$(S.rent.amt)}) is due tonight. Pay it at home.`);
  else if(!S.rent.paid&&d>=10) say(`🧾 Rent is due Sunday night: ${$(S.rent.amt)}. You have ${$(Math.round(S.money))}.`);
}
function onNight(where,notes,d){
  if(isGrow()) return GROW.onNight(where,notes,d);
  const J=job();
  const bedAt=tod();
  if(where==='collapsed'){S.loc='home';adj('stress',BAL.midnightStress);adj('standing',-BAL.midnightJob);notes.push(`😵 You were up past midnight. You wake up on the couch with your shoes on and the lamp still burning, and you’ll be dragging all day. Job −${BAL.midnightJob}.`)}
  let hungry=false;
  if(J.staffMeal&&(d in S.worked)) notes.push('🍗 Staff meal at the kitchen covered dinner.');
  else if(S.food>0){S.food--;S.stats.meals++;notes.push(`🍽️ Dinner from the fridge (${S.food} meal${S.food===1?'':'s'} left).`)}
  else{hungry=true;S.stats.hungry++;adj('stress',10);notes.push('🥣 Nothing in the fridge. You go to bed hungry.')}
  adj('energy',(where==='home'?58:28)/(hungry?2:1));
  if(where==='home'){const good=!hungry&&bedAt<BAL.goodSleepBy;adj('stress',-(good?BAL.goodSleep:BAL.sleep));   // a night in your own bed; a real night's sleep if you're down before 11
    if(good) notes.push(`😴 In bed before ${fmt(BAL.goodSleepBy)}: a real night’s sleep. Stress −${BAL.goodSleep}.`)}
  if(!S.rent.paid&&DF().worry) adj('stress',DF().worry);   // rent on your mind
  if(isShiftDay(d)&&!(d in S.worked)){const hit=S.stats.missed?BAL.missed[1]:BAL.missed[0];adj('standing',-hit);adj('stress',BAL.missedStress);S.stats.missed++;notes.push(`📵 You missed your shift at ${J.place}. ${S.job==='hospital'?'The floor ran short a CNA all day.':S.job==='kitchen'?'They worked the line one cook short.':'Your coworker opened alone.'} ${S.stats.missed===1?`Your manager texts: “Everything okay? Don’t make it a habit.” Job −${hit}.`:`Job −${hit}.`}`)}
  if(d===S.rent.due&&!S.rent.paid){
    if(S.money>=S.rent.amt){spend(S.rent.amt);S.rent.paid=true;S.rent.paidDay=d;adj('stress',4);notes.push(`🧾 You pay rent from bed at 11:58 PM: ${$(S.rent.amt)}. Cutting it close.`)}
    else{S.evicted=true;notes.push(`🧾 Rent was due tonight and you have ${$(Math.round(S.money))} of ${$(S.rent.amt)}.`)}
  }
  if(S.energy<15){adj('stress',6);notes.push('🥱 You’re running on fumes.')}
  if(S.stress>=80) notes.push('😣 Your stress is near the edge. Tomorrow, take something for yourself: a swim, the overlook, a call home.');
}
function onTime(min){if(isGrow())return GROW.onTime(min);if(min>0)adj('energy',-min/50)}        // being awake is tiring
function onArrive(dest,from){if(isGrow())return GROW.onArrive(dest,from);S.visited[dest]=true;S.hoodFlags=S.hoodFlags||{};
  const f=typeof hoodFare==='function'?hoodFare(from,dest):0;
  if(f){spend(f);S.stats.fares=(S.stats.fares||0)+f;say(`🚌 Bus fare: ${$(f)}.`)}
  const h=typeof hoodOf==='function'?hoodOf(dest):null;if(h&&typeof hoodOf==='function'&&hoodOf(from)!==h){S.hoods=S.hoods||{};if(!S.hoods[h]){S.hoods[h]=day()+1;say(`${HOODS[h].ic} <b>${HOODS[h].name}</b>. ${HOODS[h].blurb}`)}}}
function daySummary(d){if(isGrow())return GROW.daySummary(d);const sd=isShiftDay(d);return [`⚡ ${S.energy}`,`😣 ${S.stress}`,`🤝 ${S.community}`,sd?(d in S.worked?(S.worked[d]?`💼 ${S.worked[d]} min late`:'💼 on time'):'💼 missed'):'']}
function hudDay(d){if(lifeLong()&&!(isGrow()&&d===gSchoolDay()))return lifeHud(d);if(isGrow())return GROW.hudDay(d);return `${augDate(d)} · Day ${d+1} of ${GAME.days}`}

// ---- losing ----
let LOSSES={
  fired:['Let go','Too many late mornings and missed shifts. The manager is kind about it, which somehow makes it worse. You start the job search again, from a couch that is still yours for now.'],
  burnout:['Burned out','You hit the wall. You call home, and your mom buys you a bus ticket. Hilltop will still be here when you’re ready.'],
  evicted:['Out of the apartment','The rent didn’t come together. The landlord gives you a week to find somewhere else, and Ms. Lorraine across the street says you can leave your boxes on her porch.'],
};
function checkLoss(){if(isGrow())return GROW.checkLoss();if(S.standing<=0)return 'fired';if(S.stress>=100)return 'burnout';if(S.evicted||S.money< -500)return 'evicted';return null}

// ---- random events (03-events.js). Hooks: wake, arrive {at,from}, travel {from,to}, night {where,notes}, ride (the T Line), shift (after work) ----
const evening=()=>tod()>=1020&&tod()<1290, daytime=()=>tod()>=540&&tod()<1140;
// Every event below offers a choice (03-events.js: choices/dflt/urgent). `run` sets the scene; the options carry the effects.
// Setbacks and story chains are real trade-offs, social moments are join in / stop by / pass, ambient moments are stopWatch().
// stPass: time an option takes, skipped when the default is applied late at night (so a forgotten choice never runs the clock past bedtime).
const stPass=m=>{if(tod()+m<1410)pass(m)};
const stFlag=id=>typeof eventFlag==='function'?eventFlag(id):(S.ev.flags||{})[id];
const stSetFlag=(id,v)=>{if(typeof setEventFlag==='function')setEventFlag(id,v);else{S.ev.flags=S.ev.flags||{};S.ev.flags[id]=v}};
defEvent({id:'mountain_out',hook:'wake',tile:['🏔️','The mountain is out','good'],chance:0.3,max:4,cooldown:2,cond:()=>day()>0,
  run:()=>{S.ev.flags.mtn=day();say('🏔️ The mountain is out. Rainier fills the whole southeast sky, pink with the first light, so big it looks fake. Everybody on the block stops on their porch to look. It’s the thing Tacoma does.')},
  choices:()=>stopWatch({mins:15,calm:6,text:'🏔️ You stand on the stoop with your coffee until the pink goes gold and the mountain goes back to being a mountain.'}),dflt:1});
defEvent({id:'heat_wave',hook:'wake',tile:['🥵','A hot one','bad'],chance:0.12,bad:true,max:2,cooldown:4,cond:()=>day()>0,
  run:()=>{say('🥵 Ninety-two by afternoon, they say. Tacoma treats that like weather from another planet. The pool at People’s will be packed, and every box fan on the hill is selling out.')},
  choices:()=>{const c=rp(24);return [
    {ic:'🌀',l:`Buy a box fan at the market (${$(c)})`,s:'Money for a cooler apartment. Energy −4.',dis:S.money<c,fn:()=>{spend(c);adj('energy',-4);say(`🌀 Grace Kim sells you the second-to-last box fan on Hilltop, ${$(c)}. It sounds like a small plane and it is the best thing you own.`)}},
    {ic:'🏊',l:'Plan the day around People’s pool',s:'40 minutes in the water. Stress −6, energy −4.',fn:()=>{stPass(40);adj('stress',-6);adj('energy',-4);say('🏊 Half the hill had the same idea. You float in the shallow end between a toddler in floaties and a grandmother in a flowered cap, and nobody minds anything.')}},
    {ic:'😓',l:'Tough it out',s:'Free. Energy −8, stress +6.',fn:()=>{adj('energy',-8);adj('stress',6);say('😓 You close the blinds, wet a dish towel and drape it on your neck. It helps less than you hoped.')}}]},dflt:2});
defEvent({id:'fair_morning',hook:'wake',tile:['🎪','Street fair day','good'],chance:1,max:1,cond:()=>isFairDay(day())&&lifeWeekDays().includes(day()),
  run:()=>{say('🎪 You can hear it from bed: sound checks, folding tables, somebody testing a microphone “one two, one two, Hilltop!” The Hilltop Street Fair goes up on MLK from 10 to 6.')},
  choices:()=>[
    {ic:'🪑',l:'Go down early and help set up',s:'45 minutes of folding tables. Community +4, energy −6.',fn:()=>{stPass(45);adj('community',4);adj('energy',-6);say('🪑 You carry tables for Denise, tape down cords for the sound guy and hold a canopy leg while Ms. Lorraine tells two grown men how a canopy works. By ten you know half the vendors by name.')}},
    ...stopWatch({mins:15,calm:5,text:'🎪 You lie there with the window open and listen to the hill getting ready: the mic check, a drum line warming up, somebody laughing at their own joke.'})],dflt:2});
defEvent({id:'internet_bill',hook:'wake',tile:['🧾','Internet hookup','bad'],chance:1,max:1,cond:()=>day()===1,urgent:true,
  run:()=>{say('🧾 The internet tech is at your door at 8 sharp with a clipboard and a box. Setup plus the first month, or you can sign the line that says you’ll do it some other time.')},
  choices:()=>{const c=rp(60),h=rp(42);return [
    {ic:'📶',l:`Get hooked up now (${$(c)})`,s:'The full price. Stress −4: video calls home tonight.',dis:S.money<c,fn:()=>{spend(c);adj('stress',-4);say(`🧾 The tech comes at 8 and leaves at 8:15. ${$(c)} for the setup and the first month. The Wi-Fi is named after your landlord’s dog.`)}},
    {ic:'☎️',l:`Call and haggle for the promo (${$(h)})`,s:'30 minutes on hold. Cheaper. Energy −5.',dis:S.money<h,fn:()=>{stPass(30);spend(h);adj('energy',-5);say(`☎️ Thirty minutes of hold music later, a very tired agent finds you the new-customer promo: ${$(h)}. You both say “have a good one” like you mean it.`)}},
    {ic:'☕',l:'Skip it and use the café Wi-Fi',s:'Saves the money. Stress +6.',fn:()=>{adj('stress',6);say('☕ You send the tech away. Every email for the next two weeks will happen on a café stool with your back to the wall outlet.')}}]},dflt:0});
defEvent({id:'power_bill',hook:'wake',tile:['🧾','The power bill','bad'],chance:1,max:1,cond:()=>day()===8,
  run:()=>{say('🧾 Your first power bill, prorated. You had the box fan on all night. The envelope also mentions a bill-assistance program, if you have the patience for the phone call.')},
  choices:()=>{const c=rp(72),d=rp(54);return [
    {ic:'💳',l:`Pay it now (${$(c)})`,s:'Done in a minute. The full amount.',dis:S.money<c,fn:()=>{spend(c);say(`🧾 ${$(c)}, paid from your phone before the coffee’s ready. Worth every cent of box fan.`)}},
    {ic:'☎️',l:`Call about the assistance program (${$(d)})`,s:'40 minutes and a form. Saves money. Energy −5, stress +4.',dis:S.money<d,fn:()=>{stPass(40);spend(d);adj('energy',-5);adj('stress',4);say(`☎️ Forty minutes, two transfers and one form later, you qualify for the new-resident discount. ${$(d)}. You will never get those forty minutes back, and you don’t care.`)}}]},dflt:0});
defEvent({id:'priya_hall',hook:'wake',tile:['🩺','The nurse down the hall','good'],chance:0.35,max:1,cond:()=>day()>0&&!S.met.priya,
  run:()=>{stMet('priya');say(`🩺 In the hallway at dawn you meet <b>Priya</b>, coming home from a night shift as you’re heading out. ${stNb('priya').d}`)},
  choices:()=>[
    {ic:'☕',l:'Make her a cup of coffee',s:'20 minutes. Community +3, stress −4.',fn:()=>{stPass(20);adj('community',3);adj('stress',-4);say('☕ You make two cups and sit on the stairs. She tells you which washer in the basement eats quarters and which neighbor will sign for your packages.')}},
    {ic:'👋',l:'Say good morning and hold the door',s:'A minute. Community +1.',fn:()=>{adj('community',1);say('👋 You hold the door. She says “bless you” like she means it and is asleep, you suspect, before it closes.')}}],dflt:1});
defEvent({id:'church_choir',hook:'arrive',tile:['🎶','The choir on Sunday','good'],chance:0.6,max:2,cond:c=>dayName(day())==='Sunday'&&tod()>=600&&tod()<780&&['mlk','link','home','peoples'].includes(c.at),
  run:()=>{const x=stMet('harris');say(`🎶 The doors of the church on the corner are open and the choir is going full strength: a hundred voices and an organ shaking the windows. ${x?'An old man in a pressed suit comes out at the break and shakes your hand with a welder’s grip: <b>Mr. Harris</b>, choir bass. “You can come in, you know. Or don’t. The music carries.”':'Mr. Harris waves at you from the steps.'}`)},
  choices:()=>[
    {ic:'⛪',l:'Go in for the service',s:'75 minutes. Stress −10, community +4, energy −4.',fn:()=>{stPass(75);adj('stress',-10);adj('community',4);adj('energy',-4);say('⛪ You sit in the back pew. Nobody lets you stay in the back pew. By the end you have been hugged by four people and invited to the fellowship lunch twice.')}},
    {ic:'🎶',l:'Listen from the sidewalk',s:'10 minutes, two songs. Stress −6, community +2.',fn:()=>{stPass(10);adj('stress',-6);adj('community',2);say('🎶 You stand on the sidewalk through two songs. A woman on the steps hands you a fan from the funeral home, which is apparently the custom.')}},
    {ic:'🚶',l:'Keep walking',s:'No time. Nothing gained.',fn:()=>{say('🚶 The music follows you halfway down the block anyway.')}}],dflt:1});
defEvent({id:'link_bell',hook:['arrive','ride'],tile:['🔔','The Link bell','good'],chance:0.25,cooldown:2,cond:c=>c.hook==='ride'||c.at==='link',
  run:()=>{const x=stMet('jaylen');say(x?`🔔 The operator dings the bell twice for a kid on a BMX racing the train down the sidewalk. The kid wins, barely, and pops a wheelie for the passengers: <b>Jaylen</b>, eleven, who then asks you if you’re new, where you’re from, and if you have a dog.`:'🔔 The operator dings the bell at Jaylen racing the train on his BMX. He wins again.')},
  choices:()=>stopWatch({mins:5,calm:3,text:'🔔 You watch the whole race from the window. The whole car cheers at the finish, and so do you.'}),dflt:1});
defEvent({id:'link_musician',hook:'ride',tile:['🎷','Music on the train','good'],chance:0.35,cooldown:2,
  run:()=>{say('🎷 A man with a saxophone plays “What a Wonderful World” between two stops, slow and sweet.')},
  choices:()=>[
    {ic:'💵',l:'Tip him $2 and hum the last line',s:'$2. Stress −5.',dis:S.money<2,fn:()=>{spend(2);adj('stress',-5);say('🎷 You give him two dollars. A whole car of strangers hums the last line with him.')}},
    ...stopWatch({mins:5,calm:4,text:'🎷 You close your eyes for the length of the song. The train sways. Nobody says anything until he’s done.'})],dflt:2});
defEvent({id:'link_delay',hook:'travel',tile:['🚋','A car on the tracks','bad'],chance:0.12,bad:true,cooldown:3,cond:c=>c.to==='work'||c.from==='link',urgent:true,
  run:()=>{say('🚋 Somebody parked a little too far into the trackway on MLK, and the train waits while they look for their keys. The whole block is shouting encouragement.')},
  choices:()=>[
    {ic:'⏳',l:'Wait it out',s:'+12 minutes. Stress +4.',fn:()=>{stPass(12);adj('stress',4);say('⏳ Twelve minutes later the keys turn up in the driver’s other jacket. The train dings, the block applauds, and you’re late-ish.')}},
    {ic:'🚶',l:'Get off and walk the rest',s:'+5 minutes. Energy −6.',fn:()=>{stPass(5);adj('energy',-6);say('🚶 You hop off and power-walk the hill. You beat the train. You also need to sit down.')}},
    {ic:'🔑',l:'Help look for the keys',s:'+15 minutes. Community +3, stress +4.',fn:()=>{stPass(15);adj('community',3);adj('stress',4);say('🔑 You find them, under the passenger seat, with two kids and a guy from the barbershop. The driver tries to give you twenty dollars. The barber says “Nah, that’s Hilltop,” for all of you.')}}],dflt:1});   // walking is the default: it keeps you on time for a shift
defEvent({id:'summer_shower',hook:'travel',tile:['🌦️','A rare August shower','info'],chance:0.06,max:1,urgent:true,
  run:()=>{say('🌦️ A sudden warm shower, the first in weeks. The whole hill smells like hot pavement and cut grass. Kids run out into it.')},
  choices:()=>[
    {ic:'💃',l:'Run out into it with the kids',s:'10 minutes, soaked. Stress −6, energy −4.',fn:()=>{stPass(10);adj('stress',-6);adj('energy',-4);say('💃 You stand in the middle of it with your arms out like a fool, and three kids join you, and it is the best ten minutes of the week.')}},
    {ic:'🚏',l:'Wait it out under the bus shelter',s:'15 minutes. Dry. Stress −4.',fn:()=>{stPass(15);adj('stress',-4);say('🚏 You and four strangers watch the rain from the bus shelter, saying “we needed this” in turn, which you did.')}},
    {ic:'🏃',l:'Dash through it',s:'No delay. Stress +4: wet socks all day.',fn:()=>{adj('stress',4);say('🏃 You make it, mostly. Your socks will be wet until roughly Thursday.')}}],dflt:1});
defEvent({id:'lorraine_porch',hook:'arrive',tile:['🍅','Tomatoes from across the street','good'],chance:0.35,max:1,cond:c=>c.at==='home'&&daytime(),
  run:()=>{stMet('lorraine');say(`🍅 A woman on the porch across the street calls you over by pointing: <b>Ms. Lorraine</b>. ${stNb('lorraine').d} She has a bag of tomatoes from her yard ready, “so you eat something real.”`)},
  choices:()=>[
    {ic:'🌱',l:'Help her weed the tomato beds',s:'45 minutes. Food +2, community +4, energy −6.',fn:()=>{stPass(45);S.food+=2;adj('community',4);adj('energy',-6);say('🌱 You weed two beds while she tells you the history of every house on the block, including yours. She sends you home with tomatoes and a jar of greens. Food +2.')}},
    {ic:'🪑',l:'Sit on the porch a while',s:'20 minutes. Food +1, stress −5, community +2.',fn:()=>{stPass(20);S.food++;adj('stress',-5);adj('community',2);say('🪑 Sweet tea on the porch. She tells you who to trust on the block (everyone, mostly) and who to never lend a ladder to. Food +1.')}},
    {ic:'🍅',l:'Take the tomatoes, thank her',s:'A minute. Food +1, community +1.',fn:()=>{S.food++;adj('community',1);say('🍅 “Bring the bag back,” she says. “I know how many bags I have.” Food +1.')}}],dflt:2});
// a chain: Ron's cookout → the leftovers in the morning (what's in the fridge depends on how long you stayed)
defEvent({id:'neighbor_bbq',hook:'arrive',tile:['🍖','Ron’s smoker','good'],chance:0.35,max:1,cond:c=>c.at==='home'&&evening()&&day()%7>=4,
  run:()=>{const x=stMet('ron');say(`🍖 The smoke has been drifting up the block all afternoon. ${x?'Two doors down, a man in a Port of Tacoma cap waves you into his yard with a pair of tongs: <b>Ron</b>, who engineers wharves for a living and brisket for love.':'Ron waves you in with the tongs.'} Ribs, links, Tita Rose’s lumpia, potato salad and six neighbors arguing about the Seahawks.`)},
  choices:()=>{const c=rp(8);return [
    {ic:'🥤',l:`Bring a case of pop and stay (${$(c)})`,s:'90 minutes. Energy +8, stress −8, community +5.',dis:S.money<c,fn:()=>{spend(c);stPass(90);adj('energy',8);adj('stress',-8);adj('community',5);stSetFlag('bbq','stayed');say('🍖 You stay until the porch lights come on, lose the Seahawks argument and win the cornhole game. Ron sends you home with a plate wrapped in two layers of foil and Tita Rose adds lumpia on top.');chain('bbq_leftovers')}},
    {ic:'🍽️',l:'Grab a plate and say thanks',s:'15 minutes. Energy +4, community +3.',fn:()=>{stPass(15);adj('energy',4);adj('community',3);stSetFlag('bbq','plate');say('🍽️ You eat standing up by the smoker and Ron foils you a second plate “for later.”');chain('bbq_leftovers')}},
    {ic:'🙏',l:'Thank him. You’re beat',s:'No time. Energy +4 from an early night.',fn:()=>{adj('energy',4);stSetFlag('bbq','skipped');say('🙏 “Next time,” Ron says, pointing the tongs at you. “I’ll remember.” He will.')}}]},dflt:1});
defEvent({id:'bbq_leftovers',hook:'wake',tile:['🍖','Leftovers','good'],
  run:()=>{say(stFlag('bbq')==='stayed'?'🍖 Ron’s plate and Tita Rose’s lumpia are in the fridge, enough for two meals if you’re disciplined about it.':'🍖 Ron’s leftover plate is in the fridge.')},
  choices:()=>{const big=stFlag('bbq')==='stayed';return [
    {ic:'🍳',l:'Eat it for breakfast',s:`Energy +${big?10:8} now.`,fn:()=>{adj('energy',big?10:8);if(big)S.food++;say(big?'🍳 Brisket and lumpia for breakfast, and one plate still left for dinner. Breakfast of champions. Food +1.':'🍳 Cold brisket at 7 AM. Breakfast of champions.')}},
    {ic:'🧊',l:'Save it for dinner',s:`Food +${big?2:1}.`,fn:()=>{S.food+=big?2:1;say(`🧊 You leave it for later. Future you will be grateful. Food +${big?2:1}.`)}}]},dflt:1});
// a chain: Marisol's mural → the finished mural (your part in it shows)
defEvent({id:'mural_painting',hook:'arrive',tile:['🎨','A mural going up','good'],chance:0.3,max:1,cond:c=>c.at==='mlk'&&daytime(),
  run:()=>{const x=stMet('marisol');say(`🎨 Scaffolding on the side wall by the bus stop, paint cans, a boombox. ${x?'The painter is <b>Marisol</b>. ':''}She’s painting the old Hilltop, the new one and the people who stayed through all of it. She holds out a roller and points at a patch of sky. “Blue. Don’t overthink it.”`);chain('mural_done')},
  choices:()=>{const c=rp(8);return [
    {ic:'🖌️',l:'Pick up the roller',s:'40 minutes. Community +4, stress −5, energy −6.',fn:()=>{stPass(40);adj('community',4);adj('stress',-5);adj('energy',-6);stSetFlag('mural','painted');say('🖌️ You paint a patch of sky. It is a little streakier than the rest. Marisol looks at it for a long time and says “That’s honest sky.”')}},
    {ic:'🧃',l:`Bring the crew cold drinks (${$(c)})`,s:'10 minutes. Community +3.',dis:S.money<c,fn:()=>{spend(c);stPass(10);adj('community',3);stSetFlag('mural','drinks');say('🧃 You come back from Grace’s with a bag of cold drinks. The crew on the scaffold cheers like you painted the whole thing.')}},
    {ic:'👀',l:'Watch a minute and move on',s:'5 minutes. Stress −3.',fn:()=>{stPass(5);calm(3);stSetFlag('mural','watched');say('👀 You watch her work a whole face out of three colors, then go on your way.')}}]},dflt:1});
defEvent({id:'mural_done',hook:'arrive',tile:['🖼️','The mural is finished','good'],cond:c=>c.at==='mlk'&&day()>=2,
  run:()=>{const f=stFlag('mural');say('🖼️ The mural is done. Three stories of faces, the Link, the mountain'+(f==='painted'?' and, up in one corner, a patch of sky that is a little streakier than the rest. Yours.':f==='drinks'?'. On the little plaque Marisol thanks the crew, the block club and “the cold-drink neighbor.” That’s you.':'.')+' Marisol signed the corner and wrote “and the neighbors” under her name.')},
  choices:()=>[
    {ic:'🎉',l:'Stay for the little dedication',s:'30 minutes. Community +4, stress −6, energy −4.',fn:()=>{stPass(30);adj('community',stFlag('mural')==='painted'?5:4);adj('stress',-6);adj('energy',-4);say(stFlag('mural')==='painted'?'🎉 Marisol calls up everyone who held a roller. You stand in a row of neighbors under your own patch of sky while Ms. Lorraine takes the picture.':'🎉 Ms. Lorraine says a few words, Mr. Harris says a few more, and Marisol just says “Thank you, Hilltop,” and that’s the one that lands.')}},
    {ic:'📸',l:'Take a picture for the block group chat',s:'5 minutes. Stress −4, community +1.',fn:()=>{stPass(5);adj('stress',-4);adj('community',1);say(stFlag('mural')==='painted'?'📸 You post a picture with an arrow pointing at one corner of the sky. Ms. Lorraine replies first: “We know which part was you.”':'📸 You post a picture to the block group chat. Twelve neighbors reply with the same heart.')}}],dflt:1});
defEvent({id:'free_fridge',hook:'arrive',tile:['🧺','The free community fridge','good'],chance:0.25,max:2,cooldown:4,cond:c=>c.at==='mlk',
  run:()=>{const x=stMet('bev');say(`🧺 Outside the laundromat there’s a little painted fridge that says <b>TAKE WHAT YOU NEED, LEAVE WHAT YOU CAN</b>. ${x?'<b>Bev</b>, a retired librarian, is restocking it.':'Bev is restocking it.'}`)},
  choices:()=>{const low=S.food<2,c=rp(14);return [
    low?{ic:'🥡',l:'Take what you need',s:'Food +2.',fn:()=>{S.food+=2;say('🧺 Bev looks at you once and hands you two containers of red beans and rice. “You’re new. Eat.” Food +2.')}}
       :{ic:'🥡',l:'Leave one of your meals',s:'Food −1. Community +4.',dis:S.food<1,fn:()=>{S.food--;adj('community',4);say('🧺 You leave a meal of your own in it. Bev catches you doing it and tells the whole sidewalk. Community +4.')}},
    {ic:'🛒',l:`Stock it from Grace’s market (${$(c)})`,s:'20 minutes. Community +5.',dis:S.money<c,fn:()=>{spend(c);stPass(20);adj('community',5);say(`🛒 You come back with a bag of groceries, ${$(c)}, and help Bev shelve it. She labels everything with the date in perfect library handwriting.`)}},
    {ic:'🚶',l:'Wave to Bev and walk on',s:'No time, no food.',fn:()=>{say('🚶 Bev waves back with a carton of eggs.')}}]},dflt:0});
defEvent({id:'corner_name',hook:'arrive',tile:['🛒','“Morning!”','good'],chance:0.3,max:1,cond:c=>c.at==='mlk'&&S.community>=30,
  run:()=>{say('🛒 Grace Kim calls your name from the market door before you even get there. So does the guy at the bus stop. So does a woman you’re pretty sure you’ve never met. You live here now.')},
  choices:()=>[
    {ic:'💬',l:'Stop and catch up with Grace',s:'20 minutes. Stress −6, community +2.',fn:()=>{stPass(20);adj('stress',-6);adj('community',2);say('💬 Grace tells you the avocados are good today, her son got into UW, and the bus stop guy is named Curtis. Now you know Curtis.')}},
    {ic:'👋',l:'Wave back and keep going',s:'No time. Stress −4.',fn:()=>{adj('stress',-4);say('👋 You wave to everybody. Everybody waves back.')}}],dflt:1});
defEvent({id:'jaylen_questions',hook:'arrive',tile:['🚲','Questions from Jaylen','good'],chance:0.25,max:2,cooldown:3,cond:c=>['home','peoples'].includes(c.at),
  run:()=>{const x=stMet('jaylen');say(`🚲 ${x?'A kid on a BMX skids to a stop beside you: <b>Jaylen</b>, eleven. ':'Jaylen skids up on his BMX. '}“Is it true Mount Rainier is a volcano? Would it get us up here? What’s your job? Can I have a dollar? Never mind, I don’t need a dollar.”`)},
  choices:()=>[
    {ic:'🌋',l:'Answer every single question',s:'20 minutes. Stress −5, community +2, energy −4.',fn:()=>{stPass(20);adj('stress',-5);adj('community',2);adj('energy',-4);say('🌋 Volcano: yes. Would it get us: no, the lahars go the other way. Your job: he has follow-up questions. He rides off to tell his grandma everything you said, wrong.')}},
    {ic:'💵',l:'Answer one and give him a dollar anyway',s:'$1. Stress −3, community +1.',dis:S.money<1,fn:()=>{spend(1);adj('stress',-3);adj('community',1);say('💵 “Yes, it’s a volcano. Here’s a dollar.” He rides off satisfied, toward the ice cream truck.')}}],dflt:1});
defEvent({id:'ice_cream',hook:'arrive',tile:['🍦','The ice cream truck','good'],chance:0.25,max:2,cooldown:3,cond:c=>['peoples','home'].includes(c.at)&&tod()>=780&&tod()<1170,
  run:()=>{say('🍦 The ice cream truck’s song comes around the corner and the whole block’s kids appear out of nowhere.')},
  choices:()=>{const c=rp(12);return [
    {ic:'🚀',l:'Get in line for a rocket pop ($3)',s:'$3. Stress −4, energy +4.',dis:S.money<3,fn:()=>{spend(3);adj('stress',-4);adj('energy',4);say('🍦 You get in line with the kids. A rocket pop, $3. You’re an adult. You can do this.')}},
    {ic:'🍦',l:`Buy a round for the kids in line (${$(c)})`,s:'Community +4, stress −5.',dis:S.money<c,fn:()=>{spend(c);adj('community',4);adj('stress',-5);say(`🍦 “Whoever’s in line, it’s on me.” ${$(c)}. You are, for one afternoon, the most famous person on the block.`)}},
    {ic:'🎵',l:'Just enjoy the song',s:'Free. Nothing gained.',fn:()=>{say('🎵 The truck plays “Pop Goes the Weasel” all the way down the hill.')}}]},dflt:2});
defEvent({id:'block_party',hook:'arrive',tile:['🎉','A block party','good'],chance:0.5,max:1,cond:c=>c.at==='home'&&evening()&&day()>=9&&day()%7>=5,
  run:()=>{say('🎉 Somebody blocked off the end of the street with sawhorses and folding tables. Kids on bikes, a grill going, a speaker playing everything from Earth, Wind & Fire to Sir Mix-a-Lot to the Santos kids’ K-pop, Denise running the raffle, and Ms. Lorraine in a lawn chair running everything else.')},
  choices:()=>{const c=rp(5);return [
    {ic:'💃',l:'Stay for the whole thing',s:'An hour. Community +6, stress −10, energy −6.',fn:()=>{stPass(60);adj('community',6);adj('stress',-10);adj('energy',-6);say('💃 You stay an hour and dance once, badly. Ms. Lorraine says it was “brave.” Community +6.')}},
    {ic:'🎟️',l:`Grab a plate and a raffle ticket (${$(c)})`,s:'20 minutes. Community +4, stress −4.',dis:S.money<c,fn:()=>{spend(c);stPass(20);adj('community',4);adj('stress',-4);say('🎟️ You lose the raffle to a nine-year-old, who wins a box fan and is overjoyed. A plate of ribs, two handshakes, home.')}},
    {ic:'🪟',l:'Watch from your window and rest',s:'Energy +4.',fn:()=>{adj('energy',4);say('🪟 You watch from the window with your feet up. Somebody waves up at you. You wave back.')}}]},dflt:1});
defEvent({id:'bookstore',hook:'arrive',tile:['📚','Hilltop Pages','good'],chance:0.3,max:1,cond:c=>c.at==='mlk'&&tod()>=600&&tod()<1140,
  run:()=>{const x=stMet('imani');say(`📚 A bookstore you hadn’t noticed, two doors up from the barbershop: Hilltop Pages. ${x?'The owner is <b>Imani</b>. ':'Imani waves from the register. '}She asks what you read, frowns at your answer and hands you a paperback of Tacoma poets.`)},
  choices:()=>{const c=rp(16);return [
    {ic:'📖',l:`Buy it and stay to browse (${$(c)})`,s:'25 minutes. Stress −6.',dis:S.money<c,fn:()=>{spend(c);stPass(25);adj('stress',-6);say(`📚 ${$(c)}. You read the first poem standing up between the shelves. It is about the 11th Street Bridge, and it gets you.`)}},
    {ic:'🎤',l:'Promise to come to poetry night instead',s:'10 minutes. Community +2, stress −3.',fn:()=>{stPass(10);adj('community',2);adj('stress',-3);say('🎤 “Pay me when you’ve read it,” Imani says. “Or don’t, and come to poetry night.” She writes your name on the sign-up sheet in pen.')}}]},dflt:1});
defEvent({id:'pho',hook:'arrive',tile:['🍜','Phở on MLK','good'],chance:0.25,max:1,cond:c=>['mlk','link'].includes(c.at)&&tod()>=660&&tod()<1260,
  run:()=>{const x=stMet('linh');say(`🍜 The phở shop on MLK has a line out the door and a smell that pulls you into it. ${x?'<b>Linh</b>, who runs it, is waving people to the counter.':'Linh waves at you from the counter.'}`)},
  choices:()=>{const c=rp(13);return [
    {ic:'🍜',l:`Sit at the counter for a bowl (${$(c)})`,s:'30 minutes. Energy +10, stress −5.',dis:S.money<c,fn:()=>{spend(c);stPass(30);adj('energy',10);adj('stress',-5);say(`🍜 Linh brings a bowl of brisket phở you didn’t order and the basil you would have forgotten. ${$(c)}. You’ll be back.`)}},
    {ic:'🥡',l:`Get it to go (${$(c)})`,s:'10 minutes. Energy +8.',dis:S.money<c,fn:()=>{spend(c);stPass(10);adj('energy',8);say('🥡 Linh packs the broth separate “so the noodles don’t get sad.” You eat it on a bench with the bus going by.')}},
    {ic:'🚶',l:'Not today',s:'No money, no time.',fn:()=>{say('🚶 The smell follows you a full block.')}}]},dflt:2});
defEvent({id:'santos_next_door',hook:'arrive',tile:['🎤','Karaoke next door','good'],chance:0.3,max:1,cond:c=>c.at==='home'&&tod()>=1020&&tod()<1290,
  run:()=>{const x=stMet('santos');say(`🎤 Someone next door is singing “Dancing Queen” with total commitment. A knock: ${x?'<b>The Santos family</b> — Tita Rose, Tito Ben and three kids — ':'Tita Rose and the kids '}want to know if the new neighbor sings.`)},
  choices:()=>[
    {ic:'🎤',l:'Go over and sing one',s:'30 minutes. Food +1, stress −6, community +3, energy −4.',fn:()=>{stPass(30);S.food++;adj('stress',-6);adj('community',3);adj('energy',-4);say('🎤 You do not sing. You sing anyway. Tito Ben gives you a 94 and says the machine is generous. Tita Rose sends you home with a plate of pancit “for tomorrow.” Food +1.')}},
    {ic:'🍜',l:'Clap from the doorway, take the pancit',s:'10 minutes. Food +1, community +1.',fn:()=>{stPass(10);S.food++;adj('community',1);say('🍜 You clap for one song from the doorway. Tita Rose presses a plate of pancit into your hands anyway. Food +1.')}},
    {ic:'🛏️',l:'Beg off: early morning',s:'Energy +4.',fn:()=>{adj('energy',4);say('🛏️ “Next time,” Tita Rose says. “We’ll start you on something easy. Celine.”')}}],dflt:1});
defEvent({id:'denise_elevator',hook:'arrive',tile:['♿','The elevator’s out','info'],chance:0.3,max:1,cond:c=>['link','mlk'].includes(c.at)&&daytime(),
  run:()=>{const x=stMet('denise');say(`♿ The elevator at the station is out again, and a woman in a wheelchair is on the phone with the transit agency, reading them the work-order number from memory: ${x?'<b>Denise</b>, who chairs the block club’s transit committee.':'Denise.'}`)},
  choices:()=>[
    {ic:'📝',l:'Help her file the report and get photos',s:'30 minutes. Community +4, energy −4.',fn:()=>{stPass(30);adj('community',4);adj('energy',-4);say('📝 You take the photos, she writes the report, and between you the agency gets a very thorough afternoon. She signs you up for the committee’s email list before you can say no.')}},
    {ic:'🚪',l:'Hold the corner store door while she finishes',s:'15 minutes. Community +1.',fn:()=>{stPass(15);adj('community',1);say('🚪 You hold the door of the corner store while she finishes. She signs you up for the committee’s email list anyway.')}}],dflt:1});
defEvent({id:'malik_desk',hook:'arrive',tile:['🎓','The front desk at People’s','good'],chance:0.35,max:1,cond:c=>c.at==='peoples',
  run:()=>{const x=stMet('malik');say(`🎓 ${x?'The kid at the front desk of People’s is <b>Malik</b>, home from UW Tacoma for the summer. ':'Malik waves you through the front desk. '}He tells you the pool is least crowded at 6 AM, and that he is building an app for the block club. “They don’t want one. They need one.”`)},
  choices:()=>[
    {ic:'📱',l:'Try out his app and give notes',s:'20 minutes. Community +3, energy −4.',fn:()=>{stPass(20);adj('community',3);adj('energy',-4);say('📱 You find three bugs and one typo. He is thrilled about all four. “See? A user!”')}},
    {ic:'🏊',l:'Ask about the pickup game and go',s:'No time. Stress −3.',fn:()=>{adj('stress',-3);say('🏊 “Around five,” Malik says, “which means 5:20.”')}}],dflt:1});
defEvent({id:'eli_newcomer',hook:'arrive',tile:['💻','Another new neighbor','info'],chance:0.3,max:1,cond:c=>['home','view'].includes(c.at)&&day()>=2,
  run:()=>{const x=stMet('eli');say(`💻 ${x?'A guy with a laptop bag and a very new bike introduces himself: <b>Eli</b>, moved from Seattle last month for the rent. ':'Eli catches you on the sidewalk. '}He asks where the “real Hilltop places” are, then catches himself. “Sorry. That’s a weird question. I just don’t want to be the guy who moves in and doesn’t know anybody.”`)},
  choices:()=>[
    {ic:'🚶',l:'Walk him down to Imani’s yourself',s:'30 minutes. Community +3, energy −4.',fn:()=>{stPass(30);adj('community',3);adj('energy',-4);say('🚶 You walk him down MLK and introduce him to Imani, Grace and Curtis at the bus stop. By the end he’s stopped apologizing.')}},
    {ic:'✍️',l:'Point him to the bookstore and the block club',s:'A minute. Community +1.',fn:()=>{adj('community',1);say('✍️ You point him to Imani’s bookstore and the block club meeting. He writes both down.')}}],dflt:1});
// a chain: the new building → the block club meeting (what you did about it, the meeting remembers)
defEvent({id:'new_building',hook:'arrive',tile:['🏗️','A new building going up','info'],chance:0.3,max:1,cond:c=>['mlk','home'].includes(c.at)&&day()>=3&&daytime(),
  run:()=>{say('🏗️ Where the old tire shop was, a crane and a banner: <b>LUXURY LIVING ON HILLTOP · STUDIOS FROM $1,995</b>. Ms. Lorraine reads it out loud, twice, and doesn’t say anything else. Mr. Harris says his first apartment on this block was $90 a month and it had a hole in the floor. “Both things are true,” he says. “It got better, and it got harder to stay.”')},
  choices:()=>[
    {ic:'🪑',l:'Sit with them a while and listen',s:'30 minutes. Community +3, stress −4.',fn:()=>{stPass(30);adj('community',3);adj('stress',-4);stSetFlag('new_building','listened');say('🪑 You sit on the bus bench while they tell you who lived where, and who moved, and why. It is history nobody wrote down.')}},
    {ic:'📋',l:'Sign up for the block club’s tenants’ clinic',s:'10 minutes. Community +2, stress +4.',fn:()=>{stPass(10);adj('community',2);adj('stress',4);stSetFlag('new_building','signed');say('📋 Ms. Lorraine pulls a clipboard out of her bag like she was waiting for you to ask. Your rent isn’t the one going up. Yet. You sign.')}},
    {ic:'🚶',l:'Keep walking',s:'No time. Stress +4.',fn:()=>{adj('stress',4);stSetFlag('new_building','walked');say('🚶 You keep walking, but you read the banner again on the way back.')}}],dflt:2});
defEvent({id:'block_club',hook:'arrive',tile:['🗳️','The block club meets','good'],chance:()=>stFlag('new_building')&&stFlag('new_building')!=='walked'?0.85:0.6,max:1,cond:c=>c.at==='peoples'&&day()>=6&&(dayName(day())==='Thursday'||tod()>=1080),
  run:()=>{const x=stMet('lorraine'),f=stFlag('new_building');say(`🗳️ The block club meets in a back room at People’s: folding chairs, a sheet cake, twenty neighbors. ${x?'<b>Ms. Lorraine</b>, who chairs it, ':'Ms. Lorraine '}runs the agenda like a principal: the curb cuts, a tenants’-rights clinic next month for anybody whose rent jumped, the street fair cleanup, and who is checking on Mrs. Abernathy after her surgery.${f==='signed'?' She reads the clinic sign-up sheet out loud, and your name is on it.':f==='listened'?' Mr. Harris saves you a seat by the cake. “The one who listens,” he tells the row.':''}`)},
  choices:()=>{const f=stFlag('new_building');return [
    {ic:'🙋',l:'Volunteer to run the clinic sign-ups',s:'45 minutes, and a job to do. Community +5, energy −6.',fn:()=>{stPass(45);adj('community',f==='signed'?6:5);adj('energy',-6);say('🙋 You raise your hand before you know what it is. It is a clipboard, a folding table at the street fair and a lot of door knocking. Eli volunteers to help. Community +'+(f==='signed'?6:5)+'.')}},
    {ic:'🍰',l:'Stay for the meeting and the cake',s:'45 minutes. Community +3, stress −4.',fn:()=>{stPass(45);adj('community',3);adj('stress',-4);say('🍰 You stay for every item and a corner piece of sheet cake. Eli takes notes. Community +3.')}},
    {ic:'🚪',l:'Grab cake and slip out early',s:'10 minutes. Community +1, energy +4.',fn:()=>{stPass(10);adj('community',1);adj('energy',4);say('🚪 You take a piece of cake to go. Ms. Lorraine notices. Ms. Lorraine notices everything.')}}]},dflt:1});
// a chain: the lost dog → Biscuit is home (the text you get depends on how you helped)
defEvent({id:'lost_dog',hook:'arrive',tile:['🐕','A lost dog','info'],chance:0.18,max:1,cond:c=>['peoples','view','mlk'].includes(c.at)&&daytime(),
  run:()=>{say('🐕 A girl of about eight is taping a hand-drawn poster to a pole: <b>LOST: BISCUIT. VERY FRIENDLY. LIKES CHEESE.</b> Her dad is calling the name down the block.')},
  choices:()=>[
    {ic:'🔦',l:'Help look for Biscuit',s:'45 minutes. Community +4, energy −5.',fn:()=>{stPass(45);adj('energy',-5);adj('community',4);stSetFlag('dog','searched');say('🐕 You walk the alleys calling “Biscuit!” with half the block. No luck yet. The dad writes your number on the poster.');chain('dog_found')}},
    {ic:'📲',l:'Post the poster to the block group chat',s:'5 minutes. Community +2.',fn:()=>{stPass(5);adj('community',2);stSetFlag('dog','shared');say('📲 You snap the poster and send it to the block club group chat. Forty people see it in a minute.');chain('dog_found')}},
    {ic:'👀',l:'Say you’ll keep an eye out',s:'No time. Nothing more.',fn:()=>{stSetFlag('dog','watch');say('🐕 You promise to keep an eye out. You do, for the rest of the day.')}}],dflt:1});
defEvent({id:'dog_found',hook:'night',tile:['🐕','Biscuit is home','good'],
  run:()=>{adj('stress',-4);say(stFlag('dog')==='searched'?'🐕 A text at 9 PM: a photo of a very muddy dog and a very happy girl. “BISCUIT IS HOME. He was under the porch at the church. THANK YOU for walking the alleys with us.”':'🐕 A text in the block group chat at 9 PM: a photo of a very muddy dog and a very happy girl. “BISCUIT IS HOME. He was under the porch at the church. Whoever posted the poster: THANK YOU.”')},
  choices:()=>[
    {ic:'🧀',l:'Offer to bring Biscuit some cheese',s:'Community +4, energy −4: a walk tomorrow.',fn:()=>{adj('community',4);adj('energy',-4);say('🧀 “He would like that very much,” the dad writes, “and so would she.” You have a standing appointment with a dog. Community +4.')}},
    {ic:'❤️',l:'Send a heart and go to sleep',s:'Community +2, energy +4.',fn:()=>{adj('community',2);adj('energy',4);say('❤️ You send a heart and fall asleep smiling.')}}],dflt:1});
defEvent({id:'power_blip',hook:'night',tile:['💡','A power blip','bad'],chance:0.1,bad:true,max:1,cond:c=>c.where==='home',
  run:()=>{say(S.food>0?'💡 The power blinks out for three hours overnight. Every microwave on the block flashes 12:00 at dawn, and the meal at the front of your fridge is going warm.':'💡 The power blinks out for three hours overnight. Every microwave on the block flashes 12:00 at dawn. Your empty fridge doesn’t mind.')},
  choices:()=>S.food>0?[
    {ic:'🍳',l:'Cook it right away for breakfast',s:'20 minutes. Food −1, energy +6.',fn:()=>{stPass(20);S.food--;adj('energy',6);say('🍳 You cook the meal before it turns and eat it standing at the stove. Not breakfast food. Breakfast now.')}},
    {ic:'🗑️',l:'Toss it and move on',s:'No time. Food −1, stress +4.',fn:()=>{S.food--;adj('stress',4);say('🗑️ Into the trash. One meal you paid for, gone. Food −1.')}}]:[
    {ic:'⏰',l:'Reset Ms. Lorraine’s clocks for her',s:'20 minutes. Community +2, energy −4.',fn:()=>{stPass(20);adj('community',2);adj('energy',-4);say('⏰ Ms. Lorraine has five clocks and opinions about each. You set them all. She says you can come back for the VCR.')}},
    {ic:'😴',l:'Roll over and sleep a little more',s:'Energy +4.',fn:()=>{adj('energy',4);say('😴 You let the microwave blink. It can blink all day.')}}],dflt:1});
defEvent({id:'loud_night',hook:'night',tile:['🔊','A loud night','bad'],chance:0.12,bad:true,max:2,cooldown:3,cond:c=>c.where==='home',
  run:()=>{say('🔊 Somebody’s car alarm goes off at 2 AM, then somebody else’s, then a dog has thoughts about both.')},
  choices:()=>[
    {ic:'🚪',l:'Go down and knock on the owner’s door',s:'Energy −6, stress +4, community +2.',fn:()=>{adj('energy',-6);adj('stress',4);adj('community',2);say('🚪 In your slippers, at 2 AM, you knock. The owner is mortified, the alarm stops, and the whole block sleeps. Three people thank you in the morning.')}},
    {ic:'🛌',l:'Pull the pillow over your head',s:'Energy −10.',fn:()=>{adj('energy',-10);say('🛌 It goes on for forty minutes. You count every one. Energy −10.')}},
    {ic:'📖',l:'Give up, make tea and read',s:'Energy −12, stress −6.',fn:()=>{adj('energy',-12);adj('stress',-6);say('📖 You make tea and read under the lamp until the dog loses interest. It’s almost nice.')}}],dflt:1});
defEvent({id:'medevac',hook:'arrive',tile:['🚁','A helicopter over the hill','info'],chance:0.08,max:1,cond:c=>['home','view','peoples'].includes(c.at),
  run:()=>{say('🚁 A medical helicopter thumps low over the rooftops toward the hospitals on the hill. Everybody looks up. Somebody on a porch says “Go on, now,” to nobody in particular.')},
  choices:()=>stopWatch({mins:5,calm:3,text:'🚁 You watch it all the way down onto the roof at Tacoma General and wish whoever is aboard a good night.'}),dflt:1});
// after a shift (20-world.js fires 'shift')
defEvent({id:'hospital_thanks',hook:'shift',tile:['💐','A thank-you card','good'],chance:0.3,max:2,cooldown:3,cond:()=>S.job==='hospital',
  run:()=>{adj('standing',2);say('💐 A patient’s daughter finds you at the nurses’ station with a card. “He talked about you every day. Thank you for being gentle with him.”')},
  choices:()=>[
    {ic:'🤝',l:'Walk her down and sit with her a minute',s:'15 minutes. Stress −8, energy −4.',fn:()=>{stPass(15);adj('stress',-8);adj('energy',-4);say('🤝 You sit with her in the lobby while she tells you about him: the shipyard, the garden, the Sonics. You both cry a little. It’s a good kind.')}},
    {ic:'📌',l:'Pin it up in the break room',s:'Job +3, stress −4.',fn:()=>{adj('standing',3);adj('stress',-4);say('📌 You pin it by the coffee maker. The charge nurse reads it and squeezes your shoulder on her way past.')}}],dflt:1});
defEvent({id:'cafe_regular',hook:'shift',tile:['💵','A big tip from a regular','good'],chance:0.3,max:2,cooldown:3,cond:()=>S.job==='cafe',
  run:()=>{say('💵 A retired bus driver who comes in every morning leaves a folded twenty in the jar. “For the new kid. You remembered my name.”')},
  choices:()=>[
    {ic:'💵',l:'Keep the twenty',s:'+$20, community +2.',fn:()=>{money(20);S.stats.earned+=20;S.stats.tips+=20;adj('community',2);say('💵 Twenty dollars, folded small, in your apron pocket. You’ll remember his order forever now.')}},
    {ic:'🤝',l:'Split it with your coworker',s:'+$10. Job +3, community +1.',fn:()=>{money(10);S.stats.earned+=10;S.stats.tips+=10;adj('standing',3);adj('community',1);say('🤝 You split it with the coworker who trained you. She tells the manager. The manager notices.')}},
    {ic:'☕',l:'Put it toward his coffee for the week',s:'No money. Community +4, stress −4.',fn:()=>{adj('community',4);adj('stress',-4);say('☕ You write his name on a card behind the register: five coffees, paid. Tomorrow he’ll find out, and the whole bus-driver table will hear about it.')}}],dflt:0});
defEvent({id:'kitchen_rush',hook:'shift',tile:['🔥','The Friday rush','info'],chance:0.3,max:2,cooldown:3,cond:()=>S.job==='kitchen',urgent:true,
  run:()=>{say('🔥 A church group of thirty walks in at 7 without calling ahead. The kitchen goes quiet, then very fast.')},
  choices:()=>[
    {ic:'🔥',l:'Take the fryer and the grill both',s:'Job +6. Stress +8, energy −6.',fn:()=>{adj('standing',6);adj('stress',8);adj('energy',-6);say('🔥 You run two stations for an hour and twenty minutes. Miss Odessa comes back to the line afterwards and says “Okay. Okay,” and that’s the best review you’ve ever had.')}},
    {ic:'🍳',l:'Hold your station, steady pace',s:'Job +3. Stress +4.',fn:()=>{adj('standing',3);adj('stress',4);say('🍳 You keep your station clean and your tickets moving. Nothing burns. Miss Odessa nods once on her way past.')}},
    {ic:'🙋',l:'Hand the big ticket to the sous chef',s:'Job −2. Stress −4.',fn:()=>{adj('standing',-2);adj('stress',-4);say('🙋 You let the sous chef take the big order and work the small ones. You stay calm. Miss Odessa notices who took what.')}}],dflt:1});
defEvent({id:'coworker_cover',hook:'shift',tile:['🤝','A coworker’s favor','good'],chance:0.15,max:1,cond:()=>S.standing>=60,
  run:()=>{say('🤝 A coworker offers to take your last hour of side work so you can leave on time. “You’d do it for me.”')},
  choices:()=>[
    {ic:'🏠',l:'Take them up on it and go home',s:'Stress −6, energy +4.',fn:()=>{adj('stress',-6);adj('energy',4);say('🏠 You leave on time, for once, into actual daylight. You would do it for them.')}},
    {ic:'🧽',l:'Thank them, and finish it together',s:'30 minutes. Job +4, community +1, energy −4.',fn:()=>{stPass(30);adj('standing',4);adj('community',1);adj('energy',-4);say('🧽 Two people, half the time. You talk the whole way through the dishes and leave as friends.')}}],dflt:0});

// ---- tips: one at a time, first match wins, each once per game ----
let TIPS=[
  {id:'welcome',when:()=>day()===0&&S.loc==='home',get t(){return `👋 Welcome to Hilltop, {{name}}! ${isShiftDay(0)?`Work starts at <b>${fmt(job().start)}</b>. Tap <b>Go to work</b>, or pick a place under <b>🧭 Go somewhere</b>.`:'No shift today. Walk down to <b>MLK</b> and meet the street.'}`}},
  {id:'work',when:()=>S.loc==='work'&&isShiftDay(day())&&!(day() in S.worked),t:'💼 Tap <b>Work your shift</b>. The clock jumps to the end of the shift and you get paid. Late costs pay and job standing.'},
  {id:'tiles',when:()=>S.ev.history.length>0,t:'🔔 Things that happen around you show up as small <b>tiles at the top</b>, just under the bar. Tap ✓ to put one away; they also go in the 📜 <b>Log</b>.'},
  {id:'food',when:()=>S.food<=1,t:'🧺 The fridge is nearly empty. The corner market on <b>MLK</b> sells 4 meals of groceries, 7 AM to 10 PM.'},
  {id:'rent',when:()=>day()>=2&&!S.rent.paid,get t(){return `🧾 Rent is due by ${rentBy()}. Pay it from <b>home</b> as soon as you have it: early takes a weight off.`}},
  {id:'stress',when:()=>S.stress>=60,t:'😣 Stress is high. Swim at <b>People’s</b>, sit at the <b>overlook</b>, call home or ride the Link. At 100 you burn out.'},
  {id:'energy',when:()=>S.energy<30,t:'🥱 Low energy. Rest at home, eat a real meal, and get to bed before midnight.'},
  {id:'hood',when:()=>day()>=1,t:'🤝 The <b>Neighbors</b> tab lists who you’ve met. Community counts toward your score, and Hilltop rewards people who show up.'},
  {id:'sunset',when:()=>tod()>=1080&&day()>=1,get t(){const ss=sunsetNow();return `🌅 Sunset from the <b>overlook</b> is at ${fmt(ss)} tonight, best from ${fmt(ss-45)} (a minute or two earlier every day). It’s the best free thing on the hill.`}},
  {id:'bed',when:()=>S.loc==='home'&&tod()>=1260,t:'🛏️ Go to bed before midnight. Staying up all night costs you.'},
  {id:'todo',when:()=>day()>=2,t:'📋 The <b>To-do</b> tab has your goals. 📅 <b>Week</b> shows your shifts, the fair and rent.'},
];

// ---- To-do tab goals: {l, s, ok, fail, urgent} ----
function todoItems(){
  if(isGrow()) return GROW.todoItems();
  const d=day(),m=tod(),J=job(),it=[];
  if(isShiftDay(d)) it.push({l:`${J.ic} Work today`,s:d in S.worked?(S.worked[d]?`Done, ${S.worked[d]} min late`:'Done, on time'):`${fmt(J.start)}–${fmt(J.end)}, ${J.place}`,ok:d in S.worked,fail:!(d in S.worked)&&m>=J.end-60,urgent:!(d in S.worked)&&m>=J.start-60&&m<J.end-60});
  it.push({l:'Pay rent',s:S.rent.paid?`Paid on ${augDate(S.rent.paidDay)}.`:`${$(S.rent.amt)} by ${rentBy()}. You have ${$(Math.round(S.money))}.`,ok:S.rent.paid,urgent:!S.rent.paid&&d>=S.rent.due-2});
  it.push({l:'Keep food in the fridge',s:`${S.food} meal${S.food===1?'':'s'}. You eat 1 every night.`,ok:S.food>=2,urgent:S.food<1});
  it.push({l:'Keep stress under 70',s:`Stress ${S.stress}/100. At 100 you burn out.`,ok:S.stress<70,urgent:S.stress>=85});
  it.push({l:'Keep your job in good standing',s:`Job ${S.standing}/100. At 0 you’re let go.`,ok:S.standing>=50,urgent:S.standing<25});
  it.push({l:'Meet your neighbors',s:`${metCount()} of ${NEIGHBORS.length} · community ${S.community}/100`,ok:metCount()>=6});
  it.push({l:`Unpack your boxes`,s:`${S.unpacked} of ${BOXES}. One a day, at home.`,ok:S.unpacked>=BOXES});
  const fd=lifeWeekDays().find(isFairDay);
  if(fd!=null) it.push({l:'Optional: the Hilltop Street Fair',s:`${augDate(fd)} on MLK, 10 AM–6 PM.`,ok:S.fair,fail:!S.fair&&(d>fd||(d===fd&&m>=FAIR_HOURS[1]))});
  return it;
}
const SCORE_W={cash:0.5,community:20,standing:8,stress:5,shift:60,fair:100,early:100,unpacked:60,neighbors:100};   // cash counts half, so the better-paid job doesn't decide the grade
const GRADE_CUTS=[3850,3000,2200,1500];   // A, B, C, D (the same on every difficulty; tuned with tools/sim.js)
let RULES_HTML=`<p>Make it through your first two weeks on Hilltop, Mon Aug 3 to Sun Aug 16, 2026. It ends early if your job standing hits 0 (let go), your stress hits 100 (burnout), or rent isn’t paid by Sunday night (or you’re more than $500 in the hole).</p><p>Score: half your cash + community × ${SCORE_W.community} + job × ${SCORE_W.standing} − stress × ${SCORE_W.stress} + shifts × ${SCORE_W.shift}, plus bonuses: the street fair, rent paid in the first week, all boxes unpacked, every neighbor met. Grades: A ${grp(GRADE_CUTS[0])}, B ${grp(GRADE_CUTS[1])}, C ${grp(GRADE_CUTS[2])}, D ${grp(GRADE_CUTS[3])}.</p>`;

// ---- achievements: test(ctx) runs after every render ({}), each night ({night,where}) and at the end ({end,lost}) ----
const ST_SEEN=id=>(S.ev.count[id]||0)>0;
const ACH=[
  {id:'moved_in',ic:'🌙',n:'Moved In',d:'Make it through your first night on Hilltop.',test:c=>c.night},
  {id:'first_shift',ic:'💼',n:'Clocked In',d:'Work your first shift.',test:()=>S.stats.shifts>0},
  {id:'punctual',ic:'⏰',n:'Always On Time',d:'Work every shift of the two weeks, none of them late.',test:c=>c.end&&!c.lost&&shiftDays().every(i=>S.worked[i]===0)},
  {id:'rent_early',ic:'🧾',n:'Ahead of It',d:'Pay rent in the first week.',test:()=>S.rent.paid&&rentEarly(S.rent.paidDay)},
  {id:'fair',ic:'🎪',n:'Street Fair',d:'Go to the Hilltop Street Fair.',test:()=>S.fair},
  {id:'neighborly',ic:'🤝',n:'Good Neighbor',d:'Meet 6 neighbors.',test:()=>metCount()>=6},
  {id:'everybody',ic:'🏘️',n:'Everybody Knows Your Name',d:'Meet every neighbor.',test:()=>metCount()>=NEIGHBORS.length},
  {id:'community',ic:'❤️',n:'Hilltop Proud',d:'Reach community 60.',test:()=>S.community>=60},
  {id:'unpacked',ic:'📦',n:'Home',d:'Unpack every box.',test:()=>S.unpacked>=BOXES},
  {id:'swimmer',ic:'🏊',n:'Lap Lane Regular',d:'Swim at People’s 4 times.',test:()=>S.stats.swims>=4},
  {id:'sunsets',ic:'🌅',n:'Best Seat in Tacoma',d:'Watch 3 sunsets from the overlook.',test:()=>S.stats.sunsets>=3},
  {id:'mountain',ic:'🏔️',n:'The Mountain Is Out',d:'Wake up to Rainier in full view.',test:()=>ST_SEEN('mountain_out')},
  {id:'biscuit',ic:'🐕',n:'Biscuit Is Home',d:'Help find a lost dog.',test:()=>ST_SEEN('dog_found')},
  {id:'explorer',ic:'🧭',n:'All Over the Hill',d:'Visit every place on Hilltop.',test:()=>Object.keys(L).filter(k=>!L[k].hood).every(k=>S.visited[k])},
  {id:'tacoma',ic:'🗺️',n:'All Over Tacoma',d:'Visit every neighborhood.',test:()=>{if(typeof HOODS==='undefined')return false;const k=Object.keys(HOODS).filter(h=>!HOODS[h].county);return k.length>0&&k.every(h=>(S.hoods||{})[h])}},
  {id:'zen',ic:'🧘',n:'Easy Does It',d:'Finish with stress at 20 or below.',test:c=>c.end&&!c.lost&&S.stress<=20},
  {id:'grade_a',ic:'🏆',n:'Hilltop Local',d:'Finish the two weeks with an A.',test:c=>c.end&&!c.lost&&scoreOf()>=GRADE_CUTS[0]},
];

// ---- scoring and the end screen ----
let FINISH_TEXT={h1:'{{name}}, you made it through your first two weeks',sub:()=>`Mon Aug 3 to Sun Aug 16, 2026. ${S.rent.paid?'Rent is paid, ':''}${metCount()} neighbor${metCount()===1?'':'s'} know your name, and the Link is still dinging down on MLK.`};
function scoreParts(){
  if(isGrow()) return GROW.scoreParts();
  const w=SCORE_W,s=S.stats,early=S.rent.paid&&rentEarly(S.rent.paidDay);
  return [['Cash',S.money*w.cash,`${$(Math.round(S.money))} in the bank × ½`],['Community',S.community*w.community,`${S.community} × ${w.community}`],['Job',S.standing*w.standing,`${S.standing} × ${w.standing}`],
    ['Stress',-S.stress*w.stress,`${S.stress} × −${w.stress}`],['Shifts',s.shifts*w.shift,`${s.shifts} × ${w.shift}`],
    ['Street fair',S.fair?w.fair:0,S.fair?'went':'missed'],['Rent paid early',early?w.early:0,early?'in the first week':'—'],
    ['Unpacked',S.unpacked>=BOXES?w.unpacked:0,`${S.unpacked} of ${BOXES} boxes`],['Every neighbor',metCount()>=NEIGHBORS.length?w.neighbors:0,`${metCount()} of ${NEIGHBORS.length}`]].map(([k,v,n])=>[k,Math.round(v)||0,n]);
}
function scoreOf(){return scoreParts().reduce((a,r)=>a+r[1],0)}
function gradeOf(sc){
  if(isGrow()) return GROW.gradeOf(sc);
  if(sc>=GRADE_CUTS[0]) return ['A','Hilltop Local','Grace saves you the good avocados, Linh starts your order when you walk in, and Ms. Lorraine tells people you’re family.'];
  if(sc>=GRADE_CUTS[1]) return ['B','Settling In','You know which Link car has the working AC and whose porch has the best gossip.'];
  if(sc>=GRADE_CUTS[2]) return ['C','Getting By','Rent’s paid, mostly on time, mostly on caffeine.'];
  if(sc>=GRADE_CUTS[3]) return ['D','Still Unpacking','You live here. You’re not sure you’ve arrived yet.'];
  return ['F','Starting Over','Hilltop will still be here. It’s been here through a lot.'];
}
function endRows(){
  if(isGrow()) return GROW.endRows();
  const s=S.stats,J=job();
  return [['Difficulty',`${DF().ic} ${DF().n}`],['Job',`${J.ic} ${J.n}`],['Cash',$(Math.round(S.money))],['Rent',S.rent.paid?`paid ${augDate(S.rent.paidDay)}`:'unpaid'],
    ['Shifts worked',`${s.shifts} of ${shiftsTotal()}${s.late?` (${s.late} late)`:''}${s.missed?`, ${s.missed} missed`:''}${s.extra?`, +${s.extra} extra`:''}`],
    ['Earned / spent',`${$(s.earned)} / ${$(s.spent)}${s.tips?` (${$(s.tips)} in tips)`:''}`],['Job / Energy / Stress',`${S.standing} / ${S.energy} / ${S.stress}`],
    ['Community',`${S.community} · ${metCount()} of ${NEIGHBORS.length} neighbors`],['Street fair',S.fair?'Went 🎪':'Missed'],
    ['Swims / sunsets / Link rides',`${s.swims} / ${s.sunsets} / ${s.rides}`],['Nights hungry',s.hungry],['Places visited',`${Object.keys(S.visited).length} of ${Object.keys(L).length}`]];
}

// ---- save migrations ----
// Bump GAME.schema and add an entry when the shape of S changes in a way fillDefaults can't handle.
const MIGRATIONS=[
  // 0.4.0: lengths and ages (10-life.js). Every older save is Quick play: the adult game at 18, Growing Up at 12.
  {to:2,run:x=>lifeMigrateQuick(x)},
];
