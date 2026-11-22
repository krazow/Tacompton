// ============================================================
//  TACOMPTON · GROWING UP, part 2: what happens. The welcome, the days and nights, curfew, events, tips, the to-do list,
//  the finale (the first day of middle school), achievements, the score, the start-page button and the end screen.
//  Chapter 1: Mon Aug 24 – Sun Aug 30, 2026, then the first day at Summit View Middle School on Mon Aug 31.
//  Friendship, family, curiosity and first-day nerves. The kids are 12: nothing else.
// ============================================================

// ---- lifecycle (04-loop.js calls these through the adult game's functions, which hand off here) ----
GROW.onNewGame=()=>{
  say(`${gLong(0)}, 2026, ${fmt(S.t)}. Your first morning on Hilltop. Boxes in the hall, your sister singing in the kitchen, and the Link bell ringing down on MLK.`);
  modal('🎒 Growing Up · Chapter 1',`<p>You’re <b>${S.age||12}</b>. Your family just moved into an apartment on <b>Hilltop</b>, in Tacoma: Mom, Dad, your little sister <b>Nia</b> (she’s ${7+(S.age||12)-12}) and you.</p>
    <p>🏫 In one week, on <b>${longDate(gSchoolDay())}</b>, you start ${gGradeWord()} grade at <b>${gSchool()}</b>, where you don’t know a single person. Yet.</p>
    <p>🎒 Get <b>Ready</b>: school supplies, the way to school, a haircut, your forms signed and turned in, and something to wear.</p>
    <p>🤝 Meet the kids on the hill. Any of them could become your best friend.</p>
    <p>🏠 Keep things good at home, and be home by <b>${fmt(gCurfew())}</b> every night.</p>${lifeLong()?`<p>🌱 <b>${LIFE_LEN[S.length].n}</b>: ${S.keyWeeks.length} key weeks, with a summary between them. Your birthday is ${S.birthday.label}.</p>`:''}
    <p>💵 You have <b>${$(Math.round(S.money))}</b> of allowance. Chores earn a little more.</p>`,[{l:'Go look out the window',fn:()=>{}}]);
};
const G_MORNING=['☀️ Warm already. The last week of summer and it knows it.','🌫️ A marine layer over the bay. It’ll burn off by ten.','🐦 The crows on the power line are holding a meeting. Loudly.','🎶 Somebody down the block is playing old Motown with the windows open.','🚋 The first Link of the day dings past on MLK.','🥞 Dad is making pancakes and singing about it.','🌤️ Haze from a fire somewhere over the Cascades. The sun comes up orange.'];
GROW.onMorning=d=>{
  if(d===0) return;
  say(`${gLong(d)}, ${fmt(S.t)}. ${d===gSchoolDay()?'🎒 Today is the day.':pick(G_MORNING)}`);
  if(d===gSat()){gEarn(10);say('💵 Saturday: allowance day. Dad leaves $10 on the counter under the salt shaker. The back-to-school giveaway is at People’s, 10 AM to 2 PM, and Tavita’s family across the street is firing up the grill tonight.')}
  else if(d===6) say('☀️ Sunday. The last day of summer. Church bells all over the hill, then a long, slow afternoon.');
  else if(d===gSchoolDay()) say(`🏫 The first day of ${gGradeWord()} grade at ${gSchool()}. The bell rings at ${fmt(G_BELL)}, and it’s ${travelMins('home','school')} minutes up the hill.`);
  else if(gWeekday(d)) say('🏥 Mom and Dad are at work until 5:30. You’re in charge of you (and the house key on a shoelace).');
};
GROW.onNight=(where,notes,d)=>{
  if(where==='collapsed'){S.loc='home';adj('mood',-4);notes.push('😵 You fell asleep in your clothes with the light on. Mom turned it off and put a blanket over you.')}
  const late=where!=='home'||tod()>=1350;
  if(late){S.late[d]=true;if(where==='home')notes.push('🌙 Up past 10:30. Tomorrow-you is not going to love this.')}
  if(!S.dinner[d]){adj('energy',-4);notes.push('🥣 You missed family dinner and ate cereal standing up.')}
  adj('energy',late?36:56);
  if(S.mood>70)adj('mood',-3);else if(S.mood<40)adj('mood',4);   // a night’s sleep evens things out a little
  if(S.curfew[d]) notes.push('⏰ You missed curfew tonight. Mom and Dad are not thrilled.');
  if(S.energy<20){adj('mood',-4);notes.push('🥱 You’re running on fumes.')}
  if(d===gSchoolDay()-1){S.alarm=405;notes.push(`⏰ Mom sets your alarm for ${fmt(405)}. “Big day.” ${gReady()>=100?'Your backpack is by the door, packed. You are ready.':`Ready: ${gReady()}%. It’ll have to do.`}`)}
  if(d===gSchoolDay()&&!S.firstDay) GROW.firstDayMissed(notes);
};
GROW.onTime=min=>{
  if(min>0) adj('energy',-min/55);
  if(!S||S.over||S.loc==='home'||tod()<gCurfew()) return;
  const d=day();
  if(!S.curfew[d]){S.curfew[d]=true;S.stats.curfew++;adj('family',-12);adj('mood',-3);
    say(`⏰ It’s ${fmt(S.t)} and you’re not home. Mom calls: “Where are you? Home. Now.” You run the whole way. Family −12.`)}
  S.loc='home';
};
GROW.onArrive=(dest)=>{
  S.visited[dest]=true;
  if(tod()>=gCurfew()&&dest!=='home'){S.loc='home';return}
  if(dest==='school'&&!S.ready.route){gGetReady('route');adj('mood',3);
    say(`🗺️ You found the way: up the hill, past the church and the corner with the blue house, ${travelMins('home','school')} minutes from your door. You’ll be able to do it Monday without thinking.`)}
};
GROW.daySummary=d=>[`⚡ ${S.energy}`,`🙂 ${S.mood}`,`🏠 ${S.family}`,`🤝 ${gFriends()}`,`🎒 ${gReady()}%`];
GROW.hudDay=d=>d===gSchoolDay()?`${gDate(d)} · First day of school`:`${gDate(d)} · Day ${d+1} of ${GAME.days}`;
GROW.checkLoss=()=>null;   // no game over in Chapter 1: a rough week still gets to Monday
const G_LOSSES={};

// ---- the special days ----
GROW.bbq=()=>{
  pass(90);S.bbq=true;const first=gFriend('tavita',gMet('tavita')?4:6);adj('family',6);adj('mood',8);adj('energy',8);
  say(`🍖 Two grills, three folding tables and a speaker playing everything from Earth, Wind & Fire to old island songs. ${first?'The kid with the ukulele introduces himself with a plate of food: <b>Tavita</b>. '+gKid('tavita').d+' ':'Tavita saves you the last spot at the kids’ table. '}Mom and Dad meet half the block. Ms. Lorraine from the porch on the corner tells Mom she has the best-looking plants on the street. Nia falls asleep in a lawn chair at eight. Family +6.`);
};
GROW.giveaway=()=>{
  pass(30);S.giveaway=true;adj('mood',4);
  const had=S.ready.supplies;gGetReady('supplies');if(had)adj('family',4);
  const k=KIDS.find(x=>!gMet(x.id)),first=k?gFriend(k.id,3):false;
  say(`🎒 Long tables in the gym: backpacks in every color, binders, pencils, glue sticks, and volunteers who say “Take what you need, baby.” ${had?'You already have supplies, so you pick out a purple backpack for Nia’s second grade. She will not take it off. Family +4.':'You leave with a backpack full of everything on the ${gGradeWord()}-grade list.'} ${first?`In line you meet <b>${k.n}</b>. ${k.d}`:''}`);
};

// ---- the finale: the first day of middle school ----
GROW.firstDayStart=()=>{
  const late=Math.max(0,tod()-G_BELL),R=S.ready,b=gBest(),walk=b&&S.ev.flags['bf_'+b.id]!=null?b:null;
  const met=KIDS.filter(k=>gMet(k.id)),others=met.filter(k=>!b||k.id!==b.id),names=a=>a.length<2?a.map(k=>k.n).join(''):a.slice(0,-1).map(k=>k.n).join(', ')+' and '+a[a.length-1].n;
  const P=(...l)=>l.filter(Boolean).map(t=>`<p>${t}</p>`).join('');
  const steps=[
    ['🏫 The front doors',P(late?`You get there at ${fmt(S.t)}. The halls are already quiet, and a hall monitor walks you to the office for a late pass.`:`You get there at ${fmt(S.t)}, with ${G_BELL-tod()} minutes to spare. Hundreds of kids on the steps, all talking at once.`,
      walk?`${walk.n} is waiting at the corner, like you planned. You walk the last block together, and the doors look smaller with two of you.`:met.length?`Halfway up the steps you hear your name. It’s ${pick(met).n}, waving.`:'You don’t know a single person here. Yet.',
      R.haircut?'Somebody you’ve never met says, “Nice cut.”':'',R.outfit?'Your outfit feels like you.':'You grabbed whatever was on top of the box this morning. It’s fine. Mostly.')],
    ['🚪 Homeroom, room 214',P(R.turnedIn?'Your name is on the list taped to the door. Locker 1142 opens on the first try, which feels like a sign.':R.signed?'Your forms are still in your backpack. The teacher sends you to the office to turn them in, and you miss the icebreaker game.':'Your name isn’t on the list yet. The office calls home, Mom sends the forms from work, and it’s all sorted by lunch.',
      R.supplies?'You have a binder, pencils and paper. The kid next to you doesn’t, so you lend a pencil. Instant ally.':'No binder, no pencil. The teacher hands you a spare pencil with a tired smile.')],
    ['🧭 Finding your classes',P(R.route&&S.ev.flags.map?'You know the 200 hall is upstairs, and your printed map is soft from a week in your back pocket. Science, math, PE: you’re never late.':R.route?'You know the building from the outside, at least. You only get turned around once, near the band room.':'You end up in the band room twice. The band teacher says you are welcome any time, just maybe not right now.')],
    ['🍎 Lunch',P(b?`${b.n} saved you a seat. ${others.length?`${names(others)} squeeze${others.length===1?'s':''} in too, and the table gets loud.`:'You split a bag of chips and plan the whole year.'}`:met.length?`You find ${names(met)} and sit together. Nobody eats alone.`:'You sit at the end of a long table. A kid slides a tray over: “You new? Me too.” It’s a start.')],
    ['🏠 The walk home',P(S.family>=70?'Mom made your favorite. Nia wants to hear everything, twice. Dad asks his question, “One good thing?”, and you have about nine.':S.family>=40?'Dinner is loud and happy. Nia shows you her purple-backpack day; you tell them about yours.':'It’s been a bumpy week at home, but tonight Mom asks how it went and really listens. That helps.',
      S.card?'Nia’s card is taped to your door: GOOD LUCK AT BIG SCHOOL, with an owl. It made it through the whole day.':'')],
  ];
  if(late)adj('mood',-4);
  const show=i=>{const [h,body]=steps[i],last=i===steps.length-1;
    modalSwap(`${h}`,`<p style="font-size:12px;color:var(--mute);margin:0 0 6px">The first day of ${gLevel()} · ${i+1} of ${steps.length}</p>${body}`,
      [last?{l:'📖 Finish Chapter 1',fn:()=>GROW.firstDayEnd({late:late>0,with:b?b.id:null,walk:!!walk})}:{l:`Next: ${steps[i+1][0]}`,stay:true,fn:()=>show(i+1)}],true)};
  pass(10);show(0);
};
GROW.firstDayEnd=r=>{
  S.firstDay=Object.assign({missed:false},r);adj('mood',r.late?2:8);
  S.loc='home';const t=S.cur*1440+1170;if(S.t<t)S.t=t;
  endDay('home');
};
GROW.firstDayMissed=notes=>{
  S.firstDay={late:true,missed:true,with:null,walk:false};
  notes.push(`🏫 You never made it up the hill this morning, so Mom drove you to ${gSchoolShort()} at 10:30 and walked you into the office. A late start, a long day, and you made it through anyway.`);
};

// ---- events (hooks: wake, arrive {at,from}, travel, night {where}, linkwatch) ----
const gDay=()=>tod()>=600&&tod()<1080;
gEvent({id:'g_hoops_invite',hook:'arrive',tile:['🏀','Want to shoot hoops?','good'],chance:0.5,max:1,cond:c=>['home','peoples'].includes(c.at)&&gAt(780,1170)&&!gRain()&&!gMet('marcus'),
  run:c=>{const home=c.at==='home';
    modal('🏀 Want to shoot hoops?',`<p>${home?'A kid dribbling down your street stops at your steps. “You new? We’re shooting at People’s. Come on.”':'A kid on the far court bounces the ball to you. “You any good? Doesn’t matter. One game.”'}</p>`,[
      {l:'Sure',s:home?'Walk to People’s together and play for 45 minutes.':'Play for 45 minutes.',np:true,fn:()=>{pass(home?travelMins('home','peoples')+45:45);if(home){S.loc='peoples';S.visited.peoples=true}gFriend('marcus',6);adj('energy',-6);adj('mood',6);S.stats.hoops++;
        say(`🏀 This is <b>Marcus</b>. ${gKid('marcus').d} You lose 11 to 7 and he says you have “potential.” He means it. Mood +6.`)}},
      {l:'Maybe another time',s:'He shrugs: “We’re out here every day.”',np:true,fn:()=>say('🏀 “Cool. We’re out here every day,” he says, and dribbles off.')}])}});
gEvent({id:'g_bbq_morning',hook:'wake',tile:['🍖','Grills across the street','good'],chance:1,max:1,cond:()=>day()===gSat(),
  run:()=>say('🍖 By ten the family across the street has two grills out, a canopy up and an uncle on a ladder hanging lights. “Tonight! Everybody!” somebody yells to the whole block. The barbecue is 4 to 8:30 PM.')});
gEvent({id:'g_ice_cream',hook:'arrive',tile:['🍦','The ice cream truck','good'],chance:0.3,max:3,cooldown:2,cond:c=>['home','peoples','mlk'].includes(c.at)&&gAt(780,1170)&&!gRain(),
  run:c=>{const p=gRp(2),home=c.at==='home';
    modal('🍦 The ice cream truck',`<p>The song comes around the corner and every kid on the hill appears out of nowhere. You have ${$(Math.round(S.money))}.</p>`,[
      {l:`A rocket pop — ${$(p)}`,s:'Mood +5, energy +3.',np:true,dis:S.money<p,fn:()=>{gSpend(p);adj('mood',5);adj('energy',3);say('🍦 A rocket pop, eaten fast before it melts down your wrist. It melts down your wrist anyway.')}},
      ...(home?[{l:`One for you and one for Nia — ${$(p*2)}`,s:'Family +4, mood +5.',np:true,dis:S.money<p*2,fn:()=>{gSpend(p*2);adj('family',4);adj('mood',5);say('🍦 You buy Nia one too. She tells everyone on the block that her big sibling is “the best one.” Family +4.')}}]:[]),
      {l:'Skip it',s:'Save your money.',np:true,fn:()=>say('🍦 You wave at the truck and save your money. Very grown-up. Very sad.')}])}});
gEvent({id:'g_mural',hook:'arrive',tile:['🎨','A mural going up','good'],chance:0.45,max:1,cond:c=>c.at==='mlk'&&gDay()&&!gRain(),
  run:()=>{modal('🎨 A mural going up',`<p>Scaffolding on the side wall by the bus stop, paint cans and a boombox. A woman in paint-covered overalls is painting the old Hilltop, the new one and the people who stayed through all of it. A girl your age is handing her brushes.</p>`,[
    {l:'Ask if you can help',s:'45 minutes. Mood +6.',np:true,fn:()=>{pass(45);S.mural=true;const first=gFriend('ana',5);adj('mood',6);adj('energy',-4);
      say(`🎨 The painter hands you a roller and points at a patch of sky. “Blue. Don’t overthink it.” ${first?'The girl with the brushes is her niece, <b>Ana</b>. '+gKid('ana').d:'Ana shows you how to feather the edges.'}`);chain('g_mural_done')}},
    {l:'Just watch for a while',s:'15 minutes. Mood +2.',np:true,fn:()=>{pass(15);adj('mood',2);gFriend('ana',2);say('🎨 You watch the sky go up, one stroke at a time. The girl with the brushes, <b>Ana</b>, waves you closer so you can see.')}}])}});
gEvent({id:'g_mural_done',hook:'arrive',tile:['🖼️','The mural is finished','good'],cond:c=>c.at==='mlk'&&!gRain(),
  run:()=>{adj('mood',5);say('🖼️ The mural is done: three stories of faces, the Link, the mountain and, up in one corner, a patch of sky a little streakier than the rest. Yours. The painter wrote “and the neighbors” under her name.')}});
gEvent({id:'g_link_bell',hook:['arrive','linkwatch'],tile:['🔔','The Link bell','good'],chance:0.3,cooldown:1,cond:c=>c.hook==='linkwatch'||c.at==='mlk',
  run:()=>{adj('mood',3);say(pick(['🔔 The operator dings the bell twice for a row of little kids waving from the bus stop. They scream with joy. So do you, a little.','🔔 Ding-ding. A kid on a skateboard races the train down the sidewalk and wins by a nose. The whole car claps.']))}});
gEvent({id:'g_nia_tooth',hook:'wake',tile:['🦷','Nia lost a tooth','good'],chance:0.35,max:1,cond:()=>day()>=1&&day()<=5,
  run:()=>{adj('family',3);adj('mood',3);say('🦷 Nia lost a tooth at breakfast, in a pancake. She wants to know if the tooth fairy knows you moved. You promise to tell her.')}});
gEvent({id:'g_nia_pool',hook:'arrive',tile:['🧸','Nia has a request','info'],chance:0.3,max:1,cond:c=>c.at==='home'&&gAt(720,1020)&&!gRain(),
  run:()=>{modal('🧸 Nia has a request','<p>Nia is standing in the doorway in her swimsuit, goggles already on. “Take me to the pool. Pleeeease.” Mom says it’s fine if you watch her.</p>',[
    {l:'Take her to the pool',s:'About 90 minutes. Family +8, mood +5, energy −8.',np:true,fn:()=>{pass(90);adj('family',8);adj('mood',5);adj('energy',-8);S.visited.peoples=true;
      say('🧸 Nia jumps in the shallow end forty times and makes you rate every one. Mostly tens. Mom gets a photo from the lifeguard’s mom, who turns out to live on your street. Family +8.')}},
    {l:'Not today',s:'She’ll survive. Family −2.',np:true,fn:()=>{adj('family',-2);say('🧸 Nia sighs the biggest sigh a seven-year-old can sigh and takes off her goggles very slowly.')}}])}});
gEvent({id:'g_nia_card',hook:'night',tile:['💌','A card from Nia','good'],chance:1,max:1,cond:()=>day()===gSchoolDay()-1,
  run:()=>{S.card=true;adj('mood',6);adj('family',3);say('💌 On your pillow: a card from Nia. GOOD LUCK AT BIG SCHOOL, with an owl that is either very wise or very surprised.')}});
gEvent({id:'g_flyer',hook:'arrive',tile:['📄','A flyer on the door','info'],chance:0.5,max:1,cond:c=>['mlk','peoples','library'].includes(c.at)&&day()<gSat(),
  run:()=>say(`📄 A bright flyer on the door: <b>BACK-TO-SCHOOL GIVEAWAY · Saturday, Aug 29 · 10 AM–2 PM · People’s Community Center</b>. Free backpacks and supplies, while they last.`)});
gEvent({id:'g_rain',hook:'wake',tile:['🌧️','A rainy day','info'],chance:()=>day()>=4?1:0.3,max:1,cond:()=>day()>=1&&day()<=4,
  run:()=>{S.ev.flags.rain=day();adj('mood',-2);say('🌧️ Rain! The first in weeks. It drums on the roof and the whole hill smells like hot pavement and cut grass. The courts will be puddles, but the Reading Room has beanbags and the pool is indoors.')}});
gEvent({id:'g_mountain',hook:'wake',tile:['🏔️','The mountain is out','good'],chance:0.3,max:2,cooldown:2,cond:()=>day()>0&&!gRain(),
  run:()=>{adj('mood',4);say('🏔️ The mountain is out. Rainier fills the whole south sky, pink with the first light, so big it looks fake. Dad calls everybody to the window. It’s the thing Tacoma does.')}});
gEvent({id:'g_lorraine',hook:'arrive',tile:['🍅','The lady on the porch','good'],chance:0.35,max:1,cond:c=>c.at==='home'&&gDay(),
  run:()=>{adj('mood',4);adj('family',2);say('🍅 The woman on the corner porch, <b>Ms. Lorraine</b>, waves you over. She has lived on this block since 1968 and already knows your mom’s name. She gives you two tomatoes and the inside scoop: “The science teacher at Summit View? Sweetheart. You’ll love her.”'.replace('Summit View',gSchoolShort()))}});
gEvent({id:'g_nerves',hook:'night',tile:['💭','Butterflies','info'],chance:0.6,max:2,cooldown:1,cond:()=>day()>=4&&day()<gSchoolDay(),
  run:()=>{if(gReady()>=60){adj('mood',2);say('💭 You lie awake thinking about Summit View. The good kind of nervous: you have a plan.')}else{adj('mood',-4);say('💭 You lie awake listing everything you haven’t done for school yet. The list is long. Check the To-do tab tomorrow.')}}});
gEvent({id:'g_power_out',hook:'night',tile:['🔦','The power goes out','good'],chance:0.12,max:1,cond:c=>c.where==='home',
  run:()=>{adj('family',6);adj('mood',3);say('🔦 The power goes out at nine. Dad finds a flashlight, Mom finds the cards, and the four of you play Uno on the floor until it comes back. Nobody wants it to. Family +6.')}});
gEvent({id:'g_zay_shortcut',hook:'arrive',tile:['🛹','A shortcut','good'],chance:0.7,max:1,cond:c=>c.at==='school'&&gMet('zay')&&!S.shortcut,
  run:()=>{S.shortcut=true;gFriend('zay',3);say('🛹 Zay is skating the curb in front of the school. “You walk the long way? Nah.” He shows you the alley stairs that skip the steepest block. School is three minutes closer now.')}});
gEvent({id:'g_grandma_box',hook:'wake',tile:['📦','A package from Grandma','good'],chance:1,max:1,cond:()=>day()===3,
  run:()=>{gEarn(5);adj('mood',4);say('📦 A package from Grandma: a new set of markers, a pair of socks with owls on them (she looked up the mascot), and $5 “for something fun.” Money +$5.')}});

// ---- tips: one a day, each once per game ----
const G_TIPS=[
  {id:'g_welcome',when:()=>day()===0&&S.loc==='home',t:'👋 Welcome to Hilltop, {{name}}! School starts <b>Monday, Aug 31</b>. The <b>To-do</b> tab lists what you need to be <b>Ready</b>. Open <b>🧭 Go somewhere</b> below to explore the hill.'},
  {id:'g_curfew',when:()=>S.loc!=='home'&&tod()>=1140,t:`🏠 Curfew is <b>${fmt(gCurfew())}</b>. Be home by then, or Family drops.`},
  {id:'g_ready',when:()=>day()>=1,t:'🎒 <b>Ready</b> on the top bar is how ready you are for school: supplies, the way there, a haircut, the forms (signed at home, turned in at the office) and an outfit.'},
  {id:'g_kids',when:()=>gMetCount()>=1,t:'🤝 Hang out with a kid once a day to grow the friendship. The <b>Friends</b> tab shows everyone you know.'},
  {id:'g_money',when:()=>S.money<10,t:'💵 Low on money? Do a chore at home: Dad pays $3. Saturday is allowance day, and the giveaway on Saturday has free supplies.'},
  {id:'g_forms',when:()=>day()>=2&&!S.ready.signed,t:'📝 Ask Mom and Dad to sign your forms at home in the evening (or on the weekend), then turn them in at the school office on a weekday.'},
  {id:'g_family',when:()=>S.family<45,get t(){return `🏠 Family is low. Do a chore, eat dinner together (5:30–7:30 PM), play with Nia, and be home by ${fmt(gCurfew()).replace(' PM','')}.`}},
  {id:'g_energy',when:()=>S.energy<30,t:'🥱 Low energy. Rest in your room, read at the Reading Room, eat dinner and get to bed by 10:30.'},
  {id:'g_bed',when:()=>S.loc==='home'&&tod()>=1260,t:'🛏️ Bed by 10:30 PM keeps you rested for tomorrow.'},
];

// ---- To-do tab ----
GROW.todoItems=()=>{
  const d=day(),m=tod(),it=[];
  if(d===gSchoolDay()) it.push({l:'🏫 Go to the first day of school',s:`${gSchool()}, bell at ${fmt(G_BELL)}.`,ok:!!S.firstDay,urgent:!S.firstDay});
  if(!gCh1()){
    if(isSchoolDay(d)) it.push({l:'📚 Do your homework',s:`At home after school. Grades ${gGrades()}.`,ok:!!S.hw[d],urgent:!S.hw[d]&&m>=1140});
    it.push({l:'📚 Keep your grades up',s:`Grades ${gGrades()}/100 at ${gSchoolShort()}.`,ok:gGrades()>=60,urgent:gGrades()<40});
  }
  else G_READY.forEach(r=>it.push({l:`${r.ic} ${r.l}`,s:S.ready[r.k]?'Done.':r.how,ok:S.ready[r.k],urgent:!S.ready[r.k]&&d>=gSchoolDay()-1}));
  it.push({l:`🏠 Home by ${fmt(gCurfew())}`,s:S.curfew[d]?'Missed tonight.':S.loc==='home'?'You’re home.':`You’re ${travelMins(S.loc,'home')} min away.`,ok:S.loc==='home'&&!S.curfew[d],fail:!!S.curfew[d],urgent:S.loc!=='home'&&m>=gCurfew()-45});
  it.push({l:'🍽️ Family dinner',s:'At home, 5:30–7:30 PM.',ok:!!S.dinner[d],fail:!S.dinner[d]&&m>=1170});
  it.push({l:'🤝 Make friends',s:`You know ${gMetCount()} of ${KIDS.length} kids · Friends ${gFriends()}/100`,ok:gMetCount()>=3});
  it.push({l:'📦 Unpack your room',s:`${S.boxes} of ${G_BOXES} boxes. One a day.`,ok:S.boxes>=G_BOXES});
  if(d<=gSat()) it.push({l:'Optional: the back-to-school giveaway',s:'Sat Aug 29 at People’s, 10 AM–2 PM.',ok:S.giveaway,fail:!S.giveaway&&(d>gSat()||(d===gSat()&&m>=G_GIVE[1]))});
  return it;
};

// ---- achievements (kept per device, with the adult game's) ----
ACH.push(...[
  {id:'g_new_room',ic:'🌙',n:'New Room',d:'Growing Up: sleep your first night on Hilltop.',test:c=>c.night},
  {id:'g_ready',ic:'🎒',n:'Ready for Monday',d:'Growing Up: reach Ready 100.',test:()=>gReady()>=100},
  {id:'g_best',ic:'🤝',n:'Best Friend',d:'Growing Up: become close friends with one of the kids.',test:()=>!!gBest()},
  {id:'g_all_kids',ic:'👋',n:'Know the Block',d:'Growing Up: meet all five kids.',test:()=>gMetCount()>=KIDS.length},
  {id:'g_family',ic:'🏠',n:'Family First',d:'Growing Up: get Family to 90.',test:()=>S.family>=90},
  {id:'g_helper',ic:'🧹',n:'Helping Out',d:'Growing Up: do 5 chores.',test:()=>S.stats.chores>=5},
  {id:'g_sky',ic:'🎨',n:'A Patch of Sky',d:'Growing Up: help paint the mural.',test:()=>S.mural},
  {id:'g_backpack',ic:'🎁',n:'Free Backpack',d:'Growing Up: go to the back-to-school giveaway.',test:()=>S.giveaway},
  {id:'g_curfew',ic:'⏰',n:'Home Before Dark',d:'Growing Up: finish Chapter 1 without missing curfew.',test:c=>c.end&&S.stats.curfew===0},
  {id:'g_chapter1',ic:'📖',n:'Chapter 1',d:'Growing Up: make it to the first day of middle school.',test:c=>c.end&&!!S.firstDay},
  {id:'g_grade_a',ic:'🏆',n:'Ready for Anything',d:'Growing Up: finish Chapter 1 with an A.',test:c=>c.end&&scoreOf()>=G_CUTS[0]},
].map(a=>{const t=a.test;return Object.assign(a,{test:c=>isGrow()&&t(c)})}));

// ---- the score and the end screen ----
const G_W={family:8,friends:10,ready:12,mood:5,money:2,best:150,allKids:100,onTime:100,curfew:60};
const G_CUTS=[3400,2800,2100,1300];   // A, B, C, D (the same on every difficulty)
const G_RULES=`<p>Chapter 1 of Growing Up: your family’s first week on Hilltop, Mon Aug 24 to Sun Aug 30, 2026, and the first day of middle school on Mon Aug 31. There’s no game over: every week gets to Monday.</p><p>Score: Family × ${G_W.family} + Friends × ${G_W.friends} + Ready × ${G_W.ready} + Mood × ${G_W.mood} + money × ${G_W.money}, plus bonuses (a best friend, meeting all five kids, on time on the first day) and minus ${G_W.curfew} for each missed curfew. Grades: A ${grp(G_CUTS[0])}, B ${grp(G_CUTS[1])}, C ${grp(G_CUTS[2])}, D ${grp(G_CUTS[3])}.</p>`;
GROW.scoreParts=()=>{
  const w=G_W,b=gBest(),fd=S.firstDay,onTime=fd&&!fd.late;
  return [['Family',S.family*w.family,`${S.family} × ${w.family}`],['Friends',gFriends()*w.friends,`${gFriends()} × ${w.friends}`],[gCh1()?'Ready':'Grades',gGrades()*w.ready,`${gGrades()} × ${w.ready}`],
    ['Mood',S.mood*w.mood,`${S.mood} × ${w.mood}`],['Money',Math.max(0,S.money)*w.money,`${$(Math.round(S.money))} × ${w.money}`],
    ['Best friend',b?w.best:0,b?b.n:'not yet'],['Every kid',gMetCount()>=KIDS.length?w.allKids:0,`${gMetCount()} of ${KIDS.length}`],
    ['On time, first day',onTime?w.onTime:0,fd?(fd.late?'late':'on time'):'—'],['Curfew',-S.stats.curfew*w.curfew,`${S.stats.curfew} missed`]].map(([k,v,n])=>[k,Math.round(v)||0,n]);
};
GROW.gradeOf=sc=>{
  if(sc>=G_CUTS[0]) return ['A','Ready for Anything','You walked into Summit View like you’d been there for years. Hilltop already feels like home.'];
  if(sc>=G_CUTS[1]) return ['B','Finding Your Feet','A few friends, a packed backpack, and a family that’s glad you’re you.'];
  if(sc>=G_CUTS[2]) return ['C','The New Kid','You made it through the first day. The second one will be easier.'];
  if(sc>=G_CUTS[3]) return ['D','Still Settling In','A bumpy week. Everybody’s new once.'];
  return ['F','Rough Start','Some weeks are like that. Hilltop will still be here tomorrow, and so will you.'];
};
GROW.endRows=()=>{
  const s=S.stats,b=gBest(),fd=S.firstDay||{};
  return [['Difficulty',`${DF().ic} ${DF().n}`],['Best friend',b?`${b.ic} ${b.n}`:'not yet'],['Kids you know',`${gMetCount()} of ${KIDS.length}: ${KIDS.filter(k=>gMet(k.id)).map(k=>k.n).join(', ')||'none yet'}`],
    ['Ready for school',`${gReady()}% · ${G_READY.filter(r=>S.ready[r.k]).length} of ${G_READY.length} things`],['First day',fd.missed?'a late start':fd.late?'late, but there':'on time'],
    ['Family / Mood / Energy',`${S.family} / ${S.mood} / ${S.energy}`],['Chores / family dinners',`${s.chores} / ${s.dinners}`],['Swims / books / sunsets',`${s.swims} / ${s.books} / ${s.sunsets}`],
    ['Missed curfews',s.curfew],['Money left',$(Math.round(S.money))],['Places visited',`${Object.keys(S.visited).length} of ${Object.keys(L).length}`]];
};
const G_FINISH={h1:'Chapter 1 complete',sub:()=>{const b=gBest();return `{{name}}’s first week on Hilltop, Aug 24–30, 2026, and the first day of seventh grade at Summit View Middle School. ${b?`${b.n} is your best friend.`:gMetCount()?`You know ${gMetCount()} kid${gMetCount()===1?'':'s'} on the hill.`:'Tomorrow you’ll know somebody.'} ${S.family>=60?'Things are good at home.':'Home is still finding its rhythm.'}`}};
const G_TEASER='📖 <b>Coming next, Chapter 2: the first semester at Summit View.</b> A locker that sticks, a science fair, tryouts, the first rain of fall and your first Halloween on Hilltop. Then high school, and one day an apartment of your own on the hill.';

// ---- the mode's data (setMode() swaps these in) ----
MODE_DATA.grow={L:G_L,STATS:G_STATS,SCENE:G_SCENE,EXTRA_TABS:G_TABS,ACT_CATS:G_CATS,TIPS:G_TIPS,LOSSES:G_LOSSES,FINISH_TEXT:G_FINISH,RULES_HTML:G_RULES,
  days:8,wake:480,startLoc:'home',
  diffs:{easy:{n:'Easy Week',d:'More allowance, cheaper everything and fewer bumps. For learning the hill.',money:30},
    normal:{n:'Hilltop',d:'The week as it comes: a little allowance, a lot to get ready, and a whole neighborhood to meet.',money:20},
    hard:{n:'Tough Week',d:'Less allowance and pricier everything. Same score, a tighter week.',money:10}}};

// ---- the start page: a second start button, "🎒 Growing Up (new)" ----
window.startGrowUp=()=>{const go=k=>{setMode('grow');newGame(k);render()};const pickDiff=()=>{setMode('grow');diffModal(go)};
  if(!profileName())nameModal({first:true,then:pickDiff});else pickDiff()};
{const sng=window.startNewGame;
  // "Play again" on the Growing Up end screen plays Growing Up again; everything else starts the adult game
  window.startNewGame=()=>{if(isGrow()&&document.querySelector('.end'))return startGrowUp();setMode('adult');sng()};}
TITLE.bullets.push('New: <b>🎒 Growing Up</b>. Start at 12, the week before middle school, and live your life on Hilltop chapter by chapter.');
{const ts=titleScreen;
  titleScreen=function(){
    ts();
    try{
      const body=document.querySelector('.title .body');if(!body)return;
      const after=body.querySelector('.t-main')||body.querySelector('button.big');
      const b=document.createElement('div');b.className='t-main t-growrow';
      b.innerHTML='<button id="growBtn" class="t-btn t-grow" onclick="startGrowUp()"><span class="t-ic" aria-hidden="true">🎒</span><span class="t-tx"><b>Growing Up (new)</b><span>Start at 12: your family’s first week on Hilltop, then middle school</span></span></button>';
      after.after(b);
      lifeTitleRow(b);   // 10-life.js: 🌱 New life, just above
      const d=loadSave(),big=body.querySelector('button.big');
      if(d&&d.S.mode==='grow'&&big)big.textContent='🎒 '+big.textContent;
      fitTitle();
    }catch(e){}
  };}
// ---- the end screen: Growing Up keeps its own best score, and teases the next chapter ----
{const es=endScreen,GB=KEY('best.grow');
  endScreen=function(h1,sub,lost){
    if(!isGrow()||lifeLong())return es(h1,sub,lost);   // the longer games have their own end screen (10-life.js)
    const ls=store();let adultBest=null;
    try{if(ls){adultBest=ls.getItem(BEST_KEY);const g=ls.getItem(GB);if(g==null)ls.removeItem(BEST_KEY);else ls.setItem(BEST_KEY,g)}}catch(e){}
    try{es(h1,sub,lost)}finally{try{if(ls){const nb=ls.getItem(BEST_KEY);if(nb!=null)ls.setItem(GB,nb);if(adultBest==null)ls.removeItem(BEST_KEY);else ls.setItem(BEST_KEY,adultBest)}}catch(e){}}
    const end=document.querySelector('.end');if(!end)return;
    end.querySelectorAll('.sect').forEach(s=>{if(s.textContent==='Your career')s.textContent='Your first week'});
    const p=end.querySelector('h1+p');if(p)p.insertAdjacentHTML('afterend',`<div class="rules teaser">${G_TEASER}</div>`);
    const pa=[...end.querySelectorAll('button')].find(x=>/Play again/.test(x.textContent));if(pa)pa.textContent='Play Chapter 1 again';
  };}
