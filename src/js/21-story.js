// ============================================================
//  TACOMPTON, part 2: what happens. The title screen, the job pick, lifecycle hooks, random events, tips,
//  the to-do list, achievements, scoring and save migrations.
//  Two weeks on Hilltop: Mon Aug 3 – Sun Aug 16, 2026. Rent is due by the end of the last day.
// ============================================================

// ---- dates and small helpers ----
function stLong(d){return `${dayName(d)}, Aug ${3+d}`}
function stMet(id){if(S.met[id])return false;S.met[id]=day()+1;S.stats.neighbors=metCount();adj('community',3);return true}
const stNb=id=>NEIGHBORS.find(x=>x.id===id);

// ---- title screen ----
const TITLE={
  start:'Move in on Monday 📦',
  intro:'You just moved into a third-floor walk-up on Hilltop, in Tacoma, Washington: the old neighborhood up on the hill, with Martin Luther King Jr. Way running down the middle, the Link train ringing past, murals on the walls and the mountain over everything. Two weeks, Monday Aug 3 to Sunday Aug 16, 2026, to settle in.',
  bullets:['Pick a job on day one: a CNA at Tacoma General, a barista at a Hilltop café, or a line cook at a soul-food spot on MLK.','Show up for your shifts. Be late too often, or don’t show, and you’re let go.','Keep food in the fridge, your energy up and your stress down.','Rent is $1,150, due by Sunday night, Aug 16.','Meet your neighbors. The street fair is Saturday, Aug 8.'],
  note:'A game about a real neighborhood. Businesses and neighbors in it are made up.',
  art:()=>`<svg viewBox="0 0 480 250" preserveAspectRatio="xMidYMid slice" style="width:100%;height:100%" aria-hidden="true"><defs><linearGradient id="tts" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1a97a"/><stop offset=".5" stop-color="#f8d9b0"/><stop offset="1" stop-color="#d7e6e6"/></linearGradient></defs>
    <rect width="480" height="250" fill="url(#tts)"/><circle cx="90" cy="64" r="22" fill="#fff1c4" opacity=".9"/>
    <polygon points="200,150 300,58 318,52 336,60 450,150" fill="#a4b2c4"/><polygon points="268,88 300,58 318,52 336,60 364,88 348,82 334,94 318,82 302,96 288,84" fill="#fbfcfd"/>
    <rect y="140" width="480" height="30" fill="#5d93ad"/><path d="M40 152 q24 -4 48 0 M220 160 q24 -4 48 0 M380 150 q24 -4 48 0" stroke="#a6d0df" stroke-width="2" fill="none" opacity=".7"/>
    ${[330,356,382].map(x=>`<g stroke="#c8452f" stroke-width="2.5" fill="none"><path d="M${x} 142 V116 M${x+14} 142 V116 M${x-14} 116 H${x+28}"/></g>`).join('')}
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
  say(`${j.ic} You’re the new ${j.role} at ${j.place}. ${isShiftDay(0)?`First shift today at ${fmt(j.start)}.`:`Your first shift is Wednesday at ${fmt(j.start)}. Today and tomorrow are yours.`}`);
  stWelcome();
}
function stWelcome(){
  const j=job();
  modal('📦 Welcome to Hilltop',`<p>The moving truck left last night. You have a bed, ${BOXES} boxes, a fridge with <b>${S.food} meals</b> in it and <b>${$(Math.round(S.money))}</b> in the bank.</p>
    <p>${j.ic} Work: <b>${fmt(j.start)} to ${fmt(j.end)}</b>, ${j.days[0]===0?'Monday to Friday':'Wednesday to Sunday'}, at ${j.place}. It’s ${travelMins('home','work')} minutes from your door.</p>
    <p>🧾 Rent is <b>${$(S.rent.amt)}</b>, due by the end of <b>Sunday, Aug 16</b>. Pay it from home whenever you have it.</p>
    <p>🛒 The corner market on <b>MLK</b> sells groceries. You eat a meal from the fridge every night.</p>
    <p>🤝 Hilltop is a neighborhood that notices who shows up. Say hi.</p>`,[{l:'Open the blinds',fn:()=>{}}]);
}

// ---- lifecycle hooks (04-loop.js) ----
function onNewGame(){
  if(isGrow()) return GROW.onNewGame();
  say(`${stLong(0)}, 2026, ${fmt(S.t)}. Your first morning on Hilltop. Boxes everywhere, the window open, the Link bell ringing down on MLK.`);
  jobModal();
}
const ST_MORNING=['☀️ Clear and warm already. August on the hill.','🌫️ A marine layer over the bay. It’ll burn off by ten.','🐦 The crows on the power line are holding a meeting. Loudly.','🎶 Somebody down the block is playing old Motown with the windows open.','🚋 The first Link of the day dings past on MLK.','☕ The neighbor’s coffee smells better than yours. You’ll ask what it is.','🌤️ Haze from a wildfire somewhere over the Cascades. The sun comes up orange.'];
function onMorning(d){
  if(isGrow()) return GROW.onMorning(d);
  if(d===0) return;
  const J=job();
  say(`${stLong(d)}, ${fmt(S.t)}. ${pick(ST_MORNING)}`);
  if(isShiftDay(d)) say(`${J.ic} Work today at ${fmt(J.start)}, ${J.place}.`); else say('🛋️ A day off. The hill is yours.');
  if(d===FAIR_DAY) say('🎪 The Hilltop Street Fair is on MLK today, 10 AM to 6 PM.');
  if(dayName(d)==='Sunday'&&d<GAME.days-1) say('⛪ Sunday. Church bells, then church choirs, all up and down the hill.');
  if(d===GAME.days-1) say(S.rent.paid?'🏁 Last day of your first two weeks. Rent is paid. Tonight you take stock.':`🏁 Last day. Rent (${$(S.rent.amt)}) is due tonight. Pay it at home.`);
  else if(!S.rent.paid&&d>=10) say(`🧾 Rent is due Sunday night: ${$(S.rent.amt)}. You have ${$(Math.round(S.money))}.`);
}
function onNight(where,notes,d){
  if(isGrow()) return GROW.onNight(where,notes,d);
  const J=job();
  if(where==='collapsed'){S.loc='home';adj('stress',6);notes.push('😵 You were up past midnight. You wake up on the couch with your shoes on and the lamp still burning.')}
  let hungry=false;
  if(J.staffMeal&&(d in S.worked)) notes.push('🍗 Staff meal at the kitchen covered dinner.');
  else if(S.food>0){S.food--;S.stats.meals++;notes.push(`🍽️ Dinner from the fridge (${S.food} meal${S.food===1?'':'s'} left).`)}
  else{hungry=true;S.stats.hungry++;adj('stress',10);notes.push('🥣 Nothing in the fridge. You go to bed hungry.')}
  adj('energy',(where==='home'?58:28)/(hungry?2:1));
  if(where==='home') adj('stress',-10);   // a night in your own bed
  if(isShiftDay(d)&&!(d in S.worked)){const hit=S.stats.missed?12:6;adj('standing',-hit);adj('stress',6);S.stats.missed++;notes.push(`📵 You missed your shift at ${J.place}. ${S.job==='hospital'?'The floor ran short a CNA all day.':S.job==='kitchen'?'They worked the line one cook short.':'Your coworker opened alone.'} ${S.stats.missed===1?'Your manager texts: “Everything okay? Don’t make it a habit.” Job −6.':`Job −${hit}.`}`)}
  if(d===S.rent.due&&!S.rent.paid){
    if(S.money>=S.rent.amt){spend(S.rent.amt);S.rent.paid=true;S.rent.paidDay=d;adj('stress',4);notes.push(`🧾 You pay rent from bed at 11:58 PM: ${$(S.rent.amt)}. Cutting it close.`)}
    else{S.evicted=true;notes.push(`🧾 Rent was due tonight and you have ${$(Math.round(S.money))} of ${$(S.rent.amt)}.`)}
  }
  if(S.energy<15){adj('stress',6);notes.push('🥱 You’re running on fumes.')}
  if(S.stress>=80) notes.push('😣 Your stress is near the edge. Tomorrow, take something for yourself: a swim, the overlook, a call home.');
}
function onTime(min){if(isGrow())return GROW.onTime(min);if(min>0)adj('energy',-min/50)}        // being awake is tiring
function onArrive(dest,from){if(isGrow())return GROW.onArrive(dest,from);S.visited[dest]=true}
function daySummary(d){if(isGrow())return GROW.daySummary(d);const sd=isShiftDay(d);return [`⚡ ${S.energy}`,`😣 ${S.stress}`,`🤝 ${S.community}`,sd?(d in S.worked?(S.worked[d]?`💼 ${S.worked[d]} min late`:'💼 on time'):'💼 missed'):'']}
function hudDay(d){if(isGrow())return GROW.hudDay(d);return `${augDate(d)} · Day ${d+1} of ${GAME.days}`}

// ---- losing ----
let LOSSES={
  fired:['Let go','Too many late mornings and missed shifts. The manager is kind about it, which somehow makes it worse. You start the job search again, from a couch that is still yours for now.'],
  burnout:['Burned out','You hit the wall. You call home, and your mom buys you a bus ticket. Hilltop will still be here when you’re ready.'],
  evicted:['Out of the apartment','The rent didn’t come together. The landlord gives you a week to find somewhere else, and Ms. Lorraine across the street says you can leave your boxes on her porch.'],
};
function checkLoss(){if(isGrow())return GROW.checkLoss();if(S.standing<=0)return 'fired';if(S.stress>=100)return 'burnout';if(S.evicted||S.money< -500)return 'evicted';return null}

// ---- random events (03-events.js). Hooks: wake, arrive {at,from}, travel {from,to}, night {where,notes}, ride (the T Line), shift (after work) ----
const evening=()=>tod()>=1020&&tod()<1290, daytime=()=>tod()>=540&&tod()<1140;
defEvent({id:'mountain_out',hook:'wake',tile:['🏔️','The mountain is out','good'],chance:0.3,max:4,cooldown:2,cond:()=>day()>0,
  run:()=>{S.ev.flags.mtn=day();adj('stress',-5);say('🏔️ The mountain is out. Rainier fills the whole south sky, pink with the first light, so big it looks fake. Everybody on the block stops on their porch to look. It’s the thing Tacoma does.')}});
defEvent({id:'heat_wave',hook:'wake',tile:['🥵','A hot one','bad'],chance:0.12,bad:true,max:2,cooldown:4,cond:()=>day()>0,
  run:()=>{adj('energy',-6);adj('stress',4);say('🥵 Ninety-two by afternoon, they say. Tacoma treats that like weather from another planet. The pool at People’s will be packed, and every box fan on the hill is sold out.')}});
defEvent({id:'fair_morning',hook:'wake',tile:['🎪','Street fair day','good'],chance:1,max:1,cond:()=>day()===FAIR_DAY,
  run:()=>{say('🎪 You can hear it from bed: sound checks, folding tables, somebody testing a microphone “one two, one two, Hilltop!” The Hilltop Street Fair goes up on MLK from 10 to 6.')}});
defEvent({id:'internet_bill',hook:'wake',tile:['🧾','Internet hookup','bad'],chance:1,max:1,cond:()=>day()===1,
  run:()=>{const c=rp(60);spend(c);say(`🧾 The internet tech comes at 8 and leaves at 8:15. ${$(c)} for the setup and the first month. The Wi-Fi is named after your landlord’s dog.`)}});
defEvent({id:'power_bill',hook:'wake',tile:['🧾','The power bill','bad'],chance:1,max:1,cond:()=>day()===8,
  run:()=>{const c=rp(72);spend(c);say(`🧾 Your first power bill, prorated: ${$(c)}. You had the box fan on all night. Worth every cent.`)}});
defEvent({id:'priya_hall',hook:'wake',tile:['🩺','The nurse down the hall','good'],chance:0.35,max:1,cond:()=>day()>0&&!S.met.priya,
  run:()=>{stMet('priya');say(`🩺 In the hallway at dawn you meet <b>Priya</b>, coming home from a night shift as you’re heading out. ${stNb('priya').d} She tells you which washing machine eats quarters.`)}});
defEvent({id:'church_choir',hook:'arrive',tile:['🎶','The choir on Sunday','good'],chance:0.6,max:2,cond:c=>dayName(day())==='Sunday'&&tod()>=600&&tod()<780&&['mlk','link','home','peoples'].includes(c.at),
  run:()=>{adj('stress',-8);adj('community',3);const x=stMet('harris');say(`🎶 The doors of the church on the corner are open and the choir is going full strength: a hundred voices and an organ shaking the windows. You stand on the sidewalk and listen through two songs. ${x?'A man in a pressed suit comes out at the break and shakes your hand: <b>Deacon Harris</b>, choir bass. “You can come in, you know.”':'Deacon Harris waves at you from the steps.'}`)}});
defEvent({id:'link_bell',hook:['arrive','ride'],tile:['🔔','The Link bell','good'],chance:0.25,cooldown:2,cond:c=>c.hook==='ride'||c.at==='link',
  run:()=>{adj('stress',-3);const x=stMet('jaylen');say(x?`🔔 The operator dings the bell twice for a kid on a BMX racing the train down the sidewalk. The kid wins, barely, and pops a wheelie for the passengers: <b>Jaylen</b>, eleven, who then asks you if you’re new, where you’re from, and if you have a dog.`:'🔔 The operator dings the bell at Jaylen racing the train on his BMX. He wins again. The whole car cheers.')}});
defEvent({id:'link_musician',hook:'ride',tile:['🎷','Music on the train','good'],chance:0.35,cooldown:2,
  run:()=>{spend(2);adj('stress',-5);say('🎷 A man with a saxophone plays “What a Wonderful World” between two stops, slow and sweet. You give him two dollars. A whole car of strangers hums the last line.')}});
defEvent({id:'link_delay',hook:'travel',tile:['🚋','A car on the tracks','bad'],chance:0.12,bad:true,cooldown:3,cond:c=>c.to==='work'||c.from==='link',
  run:()=>{pass(10);adj('stress',3);say('🚋 Somebody parked a little too far into the trackway on MLK and the train waits while they find their keys. +10 minutes. The whole block shouts encouragement.')}});
defEvent({id:'summer_shower',hook:'travel',tile:['🌦️','A rare August shower','info'],chance:0.06,max:1,
  run:()=>{say('🌦️ A sudden warm shower, the first in weeks. The whole hill smells like hot pavement and cut grass. Kids run out into it. So, a little, do you.')}});
defEvent({id:'lorraine_porch',hook:'arrive',tile:['🍅','Tomatoes from across the street','good'],chance:0.35,max:1,cond:c=>c.at==='home'&&daytime(),
  run:()=>{stMet('lorraine');S.food++;say(`🍅 A woman on the porch across the street calls you over by pointing: <b>Ms. Lorraine</b>. ${stNb('lorraine').d} She sends you home with a bag of tomatoes from her yard “so you eat something real.” Food +1.`)}});
defEvent({id:'neighbor_bbq',hook:'arrive',tile:['🍖','Big Ron’s smoker','good'],chance:0.35,max:1,cond:c=>c.at==='home'&&evening()&&day()%7>=4,
  run:()=>{const x=stMet('ron');adj('energy',8);adj('stress',-8);adj('community',4);say(`🍖 The smoke has been drifting up the block all afternoon. ${x?'Two doors down, a very large, very quiet man waves you into his yard with a pair of tongs: <b>Big Ron</b>.':'Big Ron waves you in with the tongs.'} Ribs, links, potato salad, a cooler of pop and six neighbors arguing about the Seahawks. You leave with a foil-wrapped plate.`);chain('bbq_leftovers')}});
defEvent({id:'bbq_leftovers',hook:'wake',tile:['🍖','Leftovers','good'],
  run:()=>{S.food++;say('🍖 Big Ron’s leftover plate is in the fridge. Breakfast of champions. Food +1.')}});
defEvent({id:'mural_painting',hook:'arrive',tile:['🎨','A mural going up','good'],chance:0.3,max:1,cond:c=>c.at==='mlk'&&daytime(),
  run:()=>{const x=stMet('marisol');pass(20);adj('stress',-5);adj('community',3);say(`🎨 Scaffolding on the side wall by the bus stop, paint cans, a boombox. ${x?'The painter is <b>Marisol</b>. ':''}She’s painting the old Hilltop, the new one and the people who stayed through all of it. She hands you a roller and points at a patch of sky. “Blue. Don’t overthink it.”`);chain('mural_done')}});
defEvent({id:'mural_done',hook:'arrive',tile:['🖼️','The mural is finished','good'],cond:c=>c.at==='mlk'&&day()>=2,
  run:()=>{adj('stress',-6);adj('community',2);say('🖼️ The mural is done. Three stories of faces, the Link, the mountain and, up in one corner, a patch of sky that is a little streakier than the rest. Yours. Marisol signed the corner and wrote “and the neighbors” under her name.')}});
defEvent({id:'free_fridge',hook:'arrive',tile:['🧺','The free community fridge','good'],chance:0.25,max:2,cooldown:4,cond:c=>c.at==='mlk',
  run:()=>{const x=stMet('bev');
    if(S.food<2){S.food+=2;say(`🧺 Outside the laundromat there’s a little painted fridge that says <b>TAKE WHAT YOU NEED, LEAVE WHAT YOU CAN</b>. ${x?'<b>Auntie Bev</b>, restocking it, ':'Auntie Bev '}looks at you once and hands you two containers of red beans and rice. “You’re new. Eat.” Food +2.`)}
    else{S.food--;adj('community',4);say(`🧺 The little painted community fridge outside the laundromat is looking empty. You leave a meal of your own in it. ${x?'<b>Auntie Bev</b>, who keeps it stocked, ':'Auntie Bev '}catches you doing it and tells the whole sidewalk. Community +4.`)}}});
defEvent({id:'corner_name',hook:'arrive',tile:['🛒','“Morning!”','good'],chance:0.3,max:1,cond:c=>c.at==='mlk'&&S.community>=30,
  run:()=>{adj('stress',-6);say('🛒 Mr. Kim calls your name from the market door before you even get there. So does the guy at the bus stop. So does a woman you’re pretty sure you’ve never met. You live here now.')}});
defEvent({id:'jaylen_questions',hook:'arrive',tile:['🚲','Questions from Jaylen','good'],chance:0.25,max:2,cooldown:3,cond:c=>['home','peoples'].includes(c.at),
  run:()=>{const x=stMet('jaylen');adj('stress',-3);say(`🚲 ${x?'A kid on a BMX skids to a stop beside you: <b>Jaylen</b>, eleven. ':'Jaylen skids up on his BMX. '}“Is it true Mount Rainier is a volcano? Would it get us up here? What’s your job? Can I have a dollar? Never mind, I don’t need a dollar.” He rides off satisfied.`)}});
defEvent({id:'ice_cream',hook:'arrive',tile:['🍦','The ice cream truck','good'],chance:0.25,max:2,cooldown:3,cond:c=>['peoples','home'].includes(c.at)&&tod()>=780&&tod()<1170,
  run:()=>{spend(3);adj('stress',-4);adj('energy',3);say('🍦 The ice cream truck’s song comes around the corner and the whole block’s kids appear out of nowhere. You get in line with them. A rocket pop, $3. You’re an adult. You can do this.')}});
defEvent({id:'block_party',hook:'arrive',tile:['🎉','A block party','good'],chance:0.5,max:1,cond:c=>c.at==='home'&&evening()&&day()>=9&&day()%7>=5,
  run:()=>{pass(60);adj('community',8);adj('stress',-10);adj('energy',-4);say('🎉 Somebody blocked off the end of the street with sawhorses and folding tables. Kids on bikes, a grill going, a speaker playing everything from Earth, Wind & Fire to Sir Mix-a-Lot, and Ms. Lorraine in a lawn chair running the whole thing. You stay an hour and dance once, badly. Community +8.')}});
defEvent({id:'lost_dog',hook:'arrive',tile:['🐕','A lost dog','info'],chance:0.18,max:1,cond:c=>['peoples','view','mlk'].includes(c.at)&&daytime(),
  run:()=>{modal('🐕 A lost dog','<p>A girl of about eight is taping a hand-drawn poster to a pole: <b>LOST: BISCUIT. VERY FRIENDLY. LIKES CHEESE.</b> Her dad is calling the name down the block.</p>',[
    {l:'Help look for Biscuit',s:'45 minutes. Energy −5.',np:true,fn:()=>{pass(45);adj('energy',-5);adj('community',4);say('🐕 You walk the alleys calling “Biscuit!” with half the block. No luck yet. The dad writes your number on the poster.');chain('dog_found')}},
    {l:'Say you’ll keep an eye out',s:'You have somewhere to be.',np:true,fn:()=>{say('🐕 You promise to keep an eye out. You do, for the rest of the day.')}}])}});
defEvent({id:'dog_found',hook:'night',tile:['🐕','Biscuit is home','good'],
  run:()=>{adj('stress',-6);adj('community',4);say('🐕 A text at 9 PM: a photo of a very muddy dog and a very happy girl. “BISCUIT IS HOME. He was under the porch at the church. THANK YOU.” Half the block got the same text. Community +4.')}});
defEvent({id:'power_blip',hook:'night',tile:['💡','A power blip','bad'],chance:0.1,bad:true,max:1,cond:c=>c.where==='home',
  run:()=>{if(S.food>0){S.food--;say('💡 The power blinks out for three hours overnight. Every microwave on the block flashes 12:00 at dawn, and one meal in your fridge doesn’t make it. Food −1.')}else say('💡 The power blinks out for three hours overnight. Every microwave on the block flashes 12:00 at dawn. Your empty fridge doesn’t mind.')}});
defEvent({id:'loud_night',hook:'night',tile:['🔊','A loud night','bad'],chance:0.12,bad:true,max:2,cooldown:3,cond:c=>c.where==='home',
  run:()=>{adj('energy',-10);say('🔊 Somebody’s car alarm goes off at 2 AM, then somebody else’s, then a dog has thoughts about both. Energy −10.')}});
defEvent({id:'medevac',hook:'arrive',tile:['🚁','A helicopter over the hill','info'],chance:0.08,max:1,cond:c=>['home','view','peoples'].includes(c.at),
  run:()=>{say('🚁 A medical helicopter thumps low over the rooftops toward the hospitals on the hill. Everybody looks up. Somebody on a porch says “Go on, now,” to nobody in particular.')}});
// after a shift (20-world.js fires 'shift')
defEvent({id:'hospital_thanks',hook:'shift',tile:['💐','A thank-you card','good'],chance:0.3,max:2,cooldown:3,cond:()=>S.job==='hospital',
  run:()=>{adj('standing',4);adj('stress',-6);say('💐 A patient’s daughter finds you at the nurses’ station with a card. “He talked about you every day. Thank you for being gentle with him.” You read it twice on the walk home.')}});
defEvent({id:'cafe_regular',hook:'shift',tile:['💵','A big tip from a regular','good'],chance:0.3,max:2,cooldown:3,cond:()=>S.job==='cafe',
  run:()=>{money(20);S.stats.earned+=20;S.stats.tips+=20;adj('community',2);say('💵 A retired bus driver who comes in every morning leaves a folded twenty in the jar. “For the new kid. You remembered my name.”')}});
defEvent({id:'kitchen_rush',hook:'shift',tile:['🔥','The Friday rush','info'],chance:0.3,max:2,cooldown:3,cond:()=>S.job==='kitchen',
  run:()=>{adj('stress',4);adj('standing',4);say('🔥 A church group of thirty walks in at 7 without calling ahead. The kitchen goes quiet, then very fast. You keep up. Mama comes back to the line afterwards and says “Okay. Okay,” and that’s the best review you’ve ever had.')}});
defEvent({id:'coworker_cover',hook:'shift',tile:['🤝','A coworker’s favor','good'],chance:0.15,max:1,cond:()=>S.standing>=60,
  run:()=>{adj('stress',-5);adj('standing',2);say('🤝 A coworker takes your last hour of side work so you can leave on time. “You’d do it for me.” You would.')}});

// ---- tips: one at a time, first match wins, each once per game ----
let TIPS=[
  {id:'welcome',when:()=>day()===0&&S.loc==='home',get t(){return `👋 Welcome to Hilltop, {{name}}! ${isShiftDay(0)?`Work starts at <b>${fmt(job().start)}</b>. Open <b>🧭 Go somewhere</b> below to head to ${job().place}.`:'No shift today. Walk down to <b>MLK</b> and meet the street.'}`}},
  {id:'work',when:()=>S.loc==='work'&&isShiftDay(day())&&!(day() in S.worked),t:'💼 Tap <b>Work your shift</b>. The clock jumps to the end of the shift and you get paid. Late costs pay and job standing.'},
  {id:'food',when:()=>S.food<=1,t:'🧺 The fridge is nearly empty. The corner market on <b>MLK</b> sells 4 meals of groceries, 7 AM to 10 PM.'},
  {id:'rent',when:()=>day()>=2&&!S.rent.paid,t:'🧾 Rent is due by Sunday night, Aug 16. Pay it from <b>home</b> as soon as you have it: early takes a weight off.'},
  {id:'stress',when:()=>S.stress>=60,t:'😣 Stress is high. Swim at <b>People’s</b>, sit at the <b>overlook</b>, call home or ride the Link. At 100 you burn out.'},
  {id:'energy',when:()=>S.energy<30,t:'🥱 Low energy. Rest at home, eat a real meal, and get to bed before midnight.'},
  {id:'hood',when:()=>day()>=1,t:'🤝 The <b>Neighbors</b> tab lists who you’ve met. Community counts toward your score, and Hilltop rewards people who show up.'},
  {id:'sunset',when:()=>tod()>=1080&&day()>=1,t:`🌅 The sunset from the <b>overlook</b> starts around ${fmt(SUNSET-45)}. It’s the best free thing on the hill.`},
  {id:'bed',when:()=>S.loc==='home'&&tod()>=1260,t:'🛏️ Go to bed before midnight. Staying up all night costs you.'},
  {id:'todo',when:()=>day()>=2,t:'📋 The <b>To-do</b> tab has your goals. 📅 <b>Week</b> shows your shifts, the fair and rent.'},
];

// ---- To-do tab goals: {l, s, ok, fail, urgent} ----
function todoItems(){
  if(isGrow()) return GROW.todoItems();
  const d=day(),m=tod(),J=job(),it=[];
  if(isShiftDay(d)) it.push({l:`${J.ic} Work today`,s:d in S.worked?(S.worked[d]?`Done, ${S.worked[d]} min late`:'Done, on time'):`${fmt(J.start)}–${fmt(J.end)}, ${J.place}`,ok:d in S.worked,fail:!(d in S.worked)&&m>=J.end-60,urgent:!(d in S.worked)&&m>=J.start-60&&m<J.end-60});
  it.push({l:'Pay rent',s:S.rent.paid?`Paid on ${augDate(S.rent.paidDay)}.`:`${$(S.rent.amt)} by Sunday night, Aug 16. You have ${$(Math.round(S.money))}.`,ok:S.rent.paid,urgent:!S.rent.paid&&d>=11});
  it.push({l:'Keep food in the fridge',s:`${S.food} meal${S.food===1?'':'s'}. You eat 1 every night.`,ok:S.food>=2,urgent:S.food<1});
  it.push({l:'Keep stress under 70',s:`Stress ${S.stress}/100. At 100 you burn out.`,ok:S.stress<70,urgent:S.stress>=85});
  it.push({l:'Keep your job in good standing',s:`Job ${S.standing}/100. At 0 you’re let go.`,ok:S.standing>=50,urgent:S.standing<25});
  it.push({l:'Meet your neighbors',s:`${metCount()} of ${NEIGHBORS.length} · community ${S.community}/100`,ok:metCount()>=6});
  it.push({l:`Unpack your boxes`,s:`${S.unpacked} of ${BOXES}. One a day, at home.`,ok:S.unpacked>=BOXES});
  it.push({l:'Optional: the Hilltop Street Fair',s:'Sat Aug 8 on MLK, 10 AM–6 PM.',ok:S.fair,fail:!S.fair&&(d>FAIR_DAY||(d===FAIR_DAY&&m>=FAIR_HOURS[1]))});
  return it;
}
const SCORE_W={community:15,standing:8,stress:5,shift:60,fair:100,early:100,unpacked:60,neighbors:100};
const GRADE_CUTS=[3300,2500,1800,1100];   // A, B, C, D (the same on every difficulty)
let RULES_HTML=`<p>Make it through your first two weeks on Hilltop, Mon Aug 3 to Sun Aug 16, 2026. It ends early if your job standing hits 0 (let go), your stress hits 100 (burnout), or rent isn’t paid by Sunday night (or you’re more than $500 in the hole).</p><p>Score: cash + community × ${SCORE_W.community} + job × ${SCORE_W.standing} − stress × ${SCORE_W.stress} + shifts × ${SCORE_W.shift}, plus bonuses: the street fair, rent paid in the first week, all boxes unpacked, every neighbor met. Grades: A ${grp(GRADE_CUTS[0])}, B ${grp(GRADE_CUTS[1])}, C ${grp(GRADE_CUTS[2])}, D ${grp(GRADE_CUTS[3])}.</p>`;

// ---- achievements: test(ctx) runs after every render ({}), each night ({night,where}) and at the end ({end,lost}) ----
const ST_SEEN=id=>(S.ev.count[id]||0)>0;
const ACH=[
  {id:'moved_in',ic:'🌙',n:'Moved In',d:'Make it through your first night on Hilltop.',test:c=>c.night},
  {id:'first_shift',ic:'💼',n:'Clocked In',d:'Work your first shift.',test:()=>S.stats.shifts>0},
  {id:'punctual',ic:'⏰',n:'Always On Time',d:'Work every shift of the two weeks, none of them late.',test:c=>c.end&&!c.lost&&shiftDays().every(i=>S.worked[i]===0)},
  {id:'rent_early',ic:'🧾',n:'Ahead of It',d:'Pay rent in the first week.',test:()=>S.rent.paid&&S.rent.paidDay<=6},
  {id:'fair',ic:'🎪',n:'Street Fair',d:'Go to the Hilltop Street Fair.',test:()=>S.fair},
  {id:'neighborly',ic:'🤝',n:'Good Neighbor',d:'Meet 6 neighbors.',test:()=>metCount()>=6},
  {id:'everybody',ic:'🏘️',n:'Everybody Knows Your Name',d:'Meet every neighbor.',test:()=>metCount()>=NEIGHBORS.length},
  {id:'community',ic:'❤️',n:'Hilltop Proud',d:'Reach community 60.',test:()=>S.community>=60},
  {id:'unpacked',ic:'📦',n:'Home',d:'Unpack every box.',test:()=>S.unpacked>=BOXES},
  {id:'swimmer',ic:'🏊',n:'Lap Lane Regular',d:'Swim at People’s 4 times.',test:()=>S.stats.swims>=4},
  {id:'sunsets',ic:'🌅',n:'Best Seat in Tacoma',d:'Watch 3 sunsets from the overlook.',test:()=>S.stats.sunsets>=3},
  {id:'mountain',ic:'🏔️',n:'The Mountain Is Out',d:'Wake up to Rainier in full view.',test:()=>ST_SEEN('mountain_out')},
  {id:'biscuit',ic:'🐕',n:'Biscuit Is Home',d:'Help find a lost dog.',test:()=>ST_SEEN('dog_found')},
  {id:'explorer',ic:'🧭',n:'All Over the Hill',d:'Visit every place.',test:()=>Object.keys(L).every(k=>S.visited[k])},
  {id:'zen',ic:'🧘',n:'Easy Does It',d:'Finish with stress at 20 or below.',test:c=>c.end&&!c.lost&&S.stress<=20},
  {id:'grade_a',ic:'🏆',n:'Hilltop Local',d:'Finish the two weeks with an A.',test:c=>c.end&&!c.lost&&scoreOf()>=GRADE_CUTS[0]},
];

// ---- scoring and the end screen ----
let FINISH_TEXT={h1:'{{name}}, you made it through your first two weeks',sub:()=>`Mon Aug 3 to Sun Aug 16, 2026. ${S.rent.paid?'Rent is paid, ':''}${metCount()} neighbor${metCount()===1?'':'s'} know your name, and the Link is still dinging down on MLK.`};
function scoreParts(){
  if(isGrow()) return GROW.scoreParts();
  const w=SCORE_W,s=S.stats,early=S.rent.paid&&S.rent.paidDay<=6;
  return [['Cash',S.money,'what’s in the bank'],['Community',S.community*w.community,`${S.community} × ${w.community}`],['Job',S.standing*w.standing,`${S.standing} × ${w.standing}`],
    ['Stress',-S.stress*w.stress,`${S.stress} × −${w.stress}`],['Shifts',s.shifts*w.shift,`${s.shifts} × ${w.shift}`],
    ['Street fair',S.fair?w.fair:0,S.fair?'went':'missed'],['Rent paid early',early?w.early:0,early?'in the first week':'—'],
    ['Unpacked',S.unpacked>=BOXES?w.unpacked:0,`${S.unpacked} of ${BOXES} boxes`],['Every neighbor',metCount()>=NEIGHBORS.length?w.neighbors:0,`${metCount()} of ${NEIGHBORS.length}`]].map(([k,v,n])=>[k,Math.round(v)||0,n]);
}
function scoreOf(){return scoreParts().reduce((a,r)=>a+r[1],0)}
function gradeOf(sc){
  if(isGrow()) return GROW.gradeOf(sc);
  if(sc>=GRADE_CUTS[0]) return ['A','Hilltop Local','Mr. Kim saves you the good avocados and Ms. Lorraine tells people you’re family.'];
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
const MIGRATIONS=[];
