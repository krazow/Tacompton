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
  const o=dateOf(d),late=o.m===8&&o.d>=20;   // the end-of-summer line only in late August
  say(`${gLong(d)}, ${fmt(S.t)}. ${d===gSchoolDay()?'🎒 Today is the day.':pick(late?G_MORNING:G_MORNING.slice(1))}`);
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
GROW.daySummary=d=>[`⚡ ${S.energy}`,`🙂 ${S.mood}`,`🏠 ${S.family}`,`🤝 ${gFriends()}`,gCh1(d)?`🎒 ${gReady()}%`:`📚 ${gGrades()}`];   // Ready in the first week, Grades after
GROW.hudDay=d=>d===gSchoolDay()?`${gDate(d)} · First day of school`:`${gDate(d)} · Day ${d+1} of ${GAME.days}`;
GROW.checkLoss=()=>null;   // no game over in Chapter 1: a rough week still gets to Monday
const G_LOSSES={};

// ---- the special days ----
GROW.bbq=()=>{
  pass(90);S.bbq=true;const first=gFriend('tavita',gMet('tavita')?4:6);adj('family',6);adj('mood',8);adj('energy',8);
  say(`🍖 Two grills, three folding tables and a speaker playing everything from Earth, Wind & Fire to old island songs. ${first?'The kid with the ukulele introduces himself with a plate of food: <b>Tavita</b>. '+gKid('tavita').d+' ':'Tavita saves you the last spot at the kids’ table. '}Mom and Dad meet half the block. Ms. Lorraine from the porch on the corner tells Mom she has the best-looking plants on the street. Nia falls asleep in a lawn chair at eight. Family +6.`);
  const m=eventFlag('g_bbq_morning');
  if(m==='lights'){adj('mood',3);say('💡 When it gets dark, the lights you hung this morning come on over the tables, and Tavita’s uncle points at you: “That one did the lights.” Mood +3.')}
  else if(m==='lemonade'){adj('family',2);say('🍋 Your lemonade is gone by six. Two aunties ask Mom for the recipe. It’s lemons, Nia tells them. Family +2.')}
};
GROW.giveaway=()=>{
  pass(30);S.giveaway=true;adj('mood',4);
  const had=S.ready.supplies;gGetReady('supplies');if(had)adj('family',4);
  const k=KIDS.find(x=>!gMet(x.id)),fl=eventFlag('g_flyer'),first=k?gFriend(k.id,fl==='block'?4:3):false;
  if(fl==='family')adj('family',3);else if(fl==='block')adj('mood',3);
  say(`🎒 Long tables in the gym: backpacks in every color, binders, pencils, glue sticks, and volunteers who say “Take what you need, baby.” ${had?'You already have supplies, so you pick out a purple backpack for Nia’s second grade. She will not take it off. Family +4.':'You leave with a backpack full of everything on the ${gGradeWord()}-grade list.'} ${first?`In line you meet <b>${k.n}</b>. ${k.d}`:''}${fl==='family'?' Mom and Dad came too, because of your picture of the flyer, and Dad carries everything. Family +3.':fl==='block'?' Half the people in line are from your block, holding your flyers. Ms. Lorraine tells everyone who handed them out. Mood +3.':''}`);
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
    ['🧭 Finding your classes',P(R.route&&S.ev.flags.map?'You know the 200 hall is upstairs, and your printed map is soft from a week in your back pocket. Science, math, PE: you’re never late.':R.route&&eventFlag('g_zay_shortcut')==='walked'?'You came up Zay’s alley stairs this morning, and the building makes sense from the side door. You only get turned around once.':R.route?'You know the building from the outside, at least. You only get turned around once, near the band room.':'You end up in the band room twice. The band teacher says you are welcome any time, just maybe not right now.')],
    ['🍎 Lunch',P(b?`${b.n} saved you a seat. ${others.length?`${names(others)} squeeze${others.length===1?'s':''} in too, and the table gets loud.`:'You split a bag of chips and plan the whole year.'}`:met.length?`You find ${names(met)} and sit together. Nobody eats alone.`:'You sit at the end of a long table. A kid slides a tray over: “You new? Me too.” It’s a start.')],
    ['🏠 The walk home',P(S.family>=70?'Mom made your favorite. Nia wants to hear everything, twice. Dad asks his question, “One good thing?”, and you have about nine.':S.family>=40?'Dinner is loud and happy. Nia shows you her purple-backpack day; you tell them about yours.':'It’s been a bumpy week at home, but tonight Mom asks how it went and really listens. That helps.',
      S.card?'Nia’s card is taped to your door: GOOD LUCK AT BIG SCHOOL, with an owl. It made it through the whole day.':'',
      eventFlag('g_nia_card')==='back'?'Nia carried your owl card to second grade in her purple backpack and showed it to her whole class.':'')],
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
// Most of them are choices (03-events.js: choices, dflt, urgent). gOpt() builds one option from its effects, so the hint line
// always matches what happens: {ic, l, mins, go:place, cost, earn, e:energy, mo:mood, fa:family, fr:[kid, n], rd:ready key, txt, fn}.
// An option that takes time is greyed out if it would run past curfew away from home.
const gDay=()=>tod()>=600&&tod()<1080;
const gSg=v=>(v>0?'+':'−')+Math.abs(v);
function gOpt(o){
  const c=o.cost?gRp(o.cost):0,mins=typeof o.mins==='function'?o.mins():(o.mins||0);
  const fx=[mins?`${mins} min`:'',c?`−${$(c)}`:'',o.earn?`+${$(o.earn)}`:'',o.e?`energy ${gSg(o.e)}`:'',o.mo?`mood ${gSg(o.mo)}`:'',o.fa?`family ${gSg(o.fa)}`:'',
    o.fr?`${gMet(o.fr[0])?gKid(o.fr[0]).n:'a new friend'} ${gSg(o.fr[1])}`:'',o.rd&&!S.ready[o.rd]?'Ready ✓':''].filter(Boolean).join(', ');
  const late=mins&&S.loc!=='home'&&tod()+mins>gCurfew()-15,broke=c>0&&S.money<c;
  return {ic:o.ic,l:o.l,s:late?`No time: curfew is ${fmt(gCurfew())}.`:broke?`You have ${$(Math.round(S.money))}.`:(o.s?o.s+' ':'')+(fx?cap(fx)+'.':''),dis:!!(late||broke||o.dis),
    fn:()=>{if(c)gSpend(c);if(o.earn)gEarn(o.earn);
      if(o.go&&S.loc!==o.go){pass(travelMins(S.loc,o.go));S.loc=o.go;S.visited[o.go]=true}
      if(mins)pass(o.go?Math.max(0,mins-(o.goMins||0)):mins);
      if(o.e)adj('energy',o.e);if(o.mo)adj('mood',o.mo);if(o.fa)adj('family',o.fa);if(o.rd)gGetReady(o.rd);
      const first=o.fr?gFriend(o.fr[0],o.fr[1]):false;
      if(o.fn)o.fn(first);
      const t=typeof o.txt==='function'?o.txt(first):o.txt;if(t)say(t)}};
}
// the "pass" option of a social event: nothing gained, nothing spent
const gPass=(l,txt)=>({ic:'👋',l,s:'Nothing gained, nothing spent.',fn:()=>{if(txt)say(txt)}});
// an ambient moment: 03-events.js's stopWatch() (👀 Stop and watch / Keep going), with Growing Up's mood on top
function gWatch(mins,mo,text){const w=stopWatch({mins,calm:0,text});const f=w[0].fn;
  w[0]=Object.assign({},w[0],{s:`${mins} min, mood +${mo}.`,fn:()=>{f();adj('mood',mo)}});return w}

gEvent({id:'g_hoops_invite',hook:'arrive',tile:['🏀','Want to shoot hoops?','good'],chance:0.5,max:1,cond:c=>['home','peoples'].includes(c.at)&&gAt(780,1170)&&!gRain()&&!gMet('marcus'),
  run:c=>say(c.at==='home'?'🏀 A kid dribbling down your street stops at your steps. “You new? We’re shooting at People’s. Come on.”':'🏀 A kid on the far court bounces the ball to you. “You any good? Doesn’t matter. One game.”'),
  choices:()=>{const away=S.loc!=='peoples',walk=away?travelMins(S.loc,'peoples'):0;return [
    gOpt({ic:'🏀',l:'Sure, one full game',mins:walk+45,go:'peoples',goMins:walk,e:-6,mo:6,fr:['marcus',6],fn:()=>S.stats.hoops++,
      txt:()=>`🏀 This is <b>Marcus</b>. ${gKid('marcus').d} You lose 11 to 7 and he says you have “potential.” He means it.`}),
    gOpt({ic:'🤾',l:'Just a few shots',s:away?'Out on the sidewalk hoop.':'',mins:15,e:-2,mo:2,fr:['marcus',3],
      txt:'🤾 You take five shots on the hoop at the end of the block and make two. The kid says his name is <b>Marcus</b>, and that he’s at People’s every day.'}),
    gPass('Maybe another time','🏀 “Cool. We’re out here every day,” he says, and dribbles off.')]},
  dflt:2});

gEvent({id:'g_bbq_morning',hook:'wake',tile:['🍖','Grills across the street','good'],chance:1,max:1,cond:()=>day()===gSat(),
  run:()=>say('🍖 By ten the family across the street has two grills out, a canopy up and an uncle on a ladder hanging lights. “Tonight! Everybody!” somebody yells to the whole block. The barbecue is 4 to 8:30 PM.'),
  choices:()=>[
    gOpt({ic:'💡',l:'Go help hang the lights',mins:45,e:-6,mo:3,fr:['tavita',3],fn:()=>setEventFlag('g_bbq_morning','lights'),
      txt:f=>`💡 You hold the ladder while the uncle strings lights from the porch to the plum tree. ${f?'A kid with a ukulele hands you the next string: <b>Tavita</b>. '+gKid('tavita').d:'Tavita hands you the next string and tells you which cousin is which.'}`}),
    gOpt({ic:'🍋',l:'Make lemonade to bring tonight',mins:30,cost:3,fa:3,mo:2,fn:()=>setEventFlag('g_bbq_morning','lemonade'),
      txt:'🍋 You and Nia squeeze lemons until your fingers sting. Mom finds the big jug. It is a lot of lemonade.'}),
    gPass('Wave and get on with your day','🍖 You wave from the window. The uncle on the ladder waves back with a whole string of lights.')],
  dflt:2});

gEvent({id:'g_ice_cream',hook:'arrive',tile:['🍦','The ice cream truck','good'],chance:0.3,max:3,cooldown:2,cond:c=>['home','peoples','mlk'].includes(c.at)&&gAt(780,1170)&&!gRain(),
  run:()=>say(`🍦 The song comes around the corner and every kid on the hill appears out of nowhere. You have ${$(Math.round(S.money))}.`),
  choices:()=>{const p=gRp(2);return [
    gOpt({ic:'🍦',l:`A rocket pop — ${$(p)}`,cost:2,mo:5,e:3,txt:'🍦 A rocket pop, eaten fast before it melts down your wrist. It melts down your wrist anyway.'}),
    gOpt({ic:'🧸',l:`One for you and one for Nia — ${$(p*2)}`,cost:4,fa:4,mo:5,dis:S.loc!=='home',s:S.loc!=='home'?'Nia is at home.':'',txt:'🍦 You buy Nia one too. She tells everyone on the block that her big sibling is “the best one.”'}),
    gPass('Skip it','🍦 You wave at the truck and save your money. Very grown-up. Very sad.')]},
  dflt:2});

// the mural: helping (or watching) sets a flag, and the finished mural remembers it
gEvent({id:'g_mural',hook:'arrive',tile:['🎨','A mural going up','good'],chance:0.45,max:1,cond:c=>c.at==='mlk'&&gDay()&&!gRain(),
  run:()=>say('🎨 Scaffolding on the side wall by the bus stop, paint cans and a boombox. A woman in paint-covered overalls is painting the old Hilltop, the new one and the people who stayed through all of it. A girl your age is handing her brushes.'),
  choices:()=>[
    gOpt({ic:'🖌️',l:'Ask if you can help',mins:45,e:-4,mo:6,fr:['ana',5],fn:()=>{S.mural=true;setEventFlag('g_mural','helped');chain('g_mural_done')},
      txt:f=>`🎨 The painter hands you a roller and points at a patch of sky. “Blue. Don’t overthink it.” ${f?'The girl with the brushes is her niece, <b>Ana</b>. '+gKid('ana').d:'Ana shows you how to feather the edges.'}`}),
    gOpt({ic:'👀',l:'Just watch for a while',mins:15,mo:2,fr:['ana',2],fn:()=>{setEventFlag('g_mural','watched');chain('g_mural_done')},
      txt:'🎨 You watch the sky go up, one stroke at a time. The girl with the brushes, <b>Ana</b>, waves you closer so you can see.'}),
    gPass('Keep walking','🎨 You keep walking. The boombox follows you half a block.')],
  dflt:2});
gEvent({id:'g_mural_done',hook:'arrive',tile:['🖼️','The mural is finished','good'],cond:c=>c.at==='mlk'&&!gRain(),
  run:()=>{const h=eventFlag('g_mural')==='helped';adj('mood',h?5:2);
    say(h?'🖼️ The mural is done: three stories of faces, the Link, the mountain and, up in one corner, a patch of sky a little streakier than the rest. Yours. The painter wrote “and the neighbors” under her name.'
      :'🖼️ The mural is done: three stories of faces, the Link and the mountain. You watched that sky go up stroke by stroke, so it feels a little bit yours anyway.')},
  choices:()=>{const h=eventFlag('g_mural')==='helped';return [
    gOpt({ic:'🧸',l:h?'Bring Nia down to see your patch of sky':'Bring Nia down to see it',mins:35,e:-4,fa:5,
      txt:h?'🧸 You walk Nia down MLK and point. “That blue? Me.” She makes you stand under it for a picture, then tells the man at the bus stop.':'🧸 Nia finds every dog in the mural and names them all. The man at the bus stop helps.'}),
    gOpt({ic:'🎨',l:'Find Ana and look at it together',mins:20,mo:3,fr:['ana',3],
      txt:'🎨 Ana shows you the tiny things nobody notices: her aunt’s initials in a window, a cat on a roof, the year in the bricks.'}),
    gPass('Keep going','🖼️ You give the mural a nod on your way past. It’ll be there tomorrow.')]},
  dflt:2});

gEvent({id:'g_link_bell',hook:['arrive','linkwatch'],tile:['🔔','The Link bell','good'],chance:0.3,cooldown:1,cond:c=>c.hook==='linkwatch'||c.at==='mlk',
  run:()=>say(pick(['🔔 The operator dings the bell twice for a row of little kids waving from the bus stop. They scream with joy.','🔔 Ding-ding. A kid on a skateboard races the train down the sidewalk, neck and neck.'])),
  choices:()=>gWatch(10,4,'🔔 You stop and watch until the Link is a little green dot down the hill. You wave too, a little.'),dflt:1});

gEvent({id:'g_nia_tooth',hook:'wake',tile:['🦷','Nia lost a tooth','good'],chance:0.35,max:1,cond:()=>day()>=1&&day()<=5,
  run:()=>say('🦷 Nia lost a tooth at breakfast, in a pancake. She wants to know if the tooth fairy knows you moved.'),
  choices:()=>[
    gOpt({ic:'✍️',l:'Write her a note from the tooth fairy',s:'In your fanciest handwriting, with glitter.',mins:25,e:-2,fa:5,mo:2,
      txt:'✍️ “Dear Nia, I have your new address. Welcome to Hilltop. Love, T.F.” Nia reads it nine times and keeps it in her shoe box of important things.'}),
    gOpt({ic:'💵',l:'Slip a dollar of your allowance under her pillow',cost:1,fa:4,
      txt:'💵 Your dollar, folded small. In the morning Nia runs in yelling that the tooth fairy FOUND them.'}),
    gOpt({ic:'🦷',l:'Promise her the tooth fairy knows',fa:1,txt:'🦷 You promise. She believes you, mostly. Mom gives you a look over the coffee that means “you’d better be right.”'})],
  dflt:2});

gEvent({id:'g_nia_pool',hook:'arrive',tile:['🧸','Nia has a request','info'],chance:0.3,max:1,cond:c=>c.at==='home'&&gAt(720,1020)&&!gRain(),
  run:()=>say('🧸 Nia is standing in the doorway in her swimsuit, goggles already on. “Take me to the pool. Pleeeease.” Mom says it’s fine if you watch her.'),
  choices:()=>[
    gOpt({ic:'🏊',l:'Take her to the pool',mins:90,e:-8,fa:8,mo:5,fn:()=>{S.visited.peoples=true},
      txt:'🧸 Nia jumps in the shallow end forty times and makes you rate every one. Mostly tens. Mom gets a photo from the lifeguard’s mom, who turns out to live on your street.'}),
    gOpt({ic:'💦',l:'Run through the sprinkler out back instead',mins:30,e:-3,fa:4,mo:2,
      txt:'💦 Not the pool, but the sprinkler counts. Nia invents a game called Lava Sprinkler with rules only she understands.'}),
    gOpt({ic:'🙅',l:'Not today',fa:-2,txt:'🧸 Nia sighs the biggest sigh a seven-year-old can sigh and takes off her goggles very slowly.'})],
  dflt:2});

// Nia's card: tape it up, or make her one back (the first day of school remembers)
gEvent({id:'g_nia_card',hook:'night',tile:['💌','A card from Nia','good'],chance:1,max:1,cond:()=>day()===gSchoolDay()-1,
  run:()=>{S.card=true;adj('mood',3);say('💌 On your pillow: a card from Nia. GOOD LUCK AT BIG SCHOOL, with an owl that is either very wise or very surprised.')},
  choices:()=>[
    gOpt({ic:'🖍️',l:'Make her a card back, by flashlight',e:-5,fa:5,mo:2,fn:()=>setEventFlag('g_nia_card','back'),
      txt:'🖍️ GOOD LUCK IN SECOND GRADE, with an owl in a tiny backpack. You slide it under her door. A whisper comes back: “I can see the flashlight.”'}),
    gOpt({ic:'📌',l:'Tape it to your door and go to sleep',e:3,mo:3,txt:'📌 You tape the card to your door, where you’ll see it on the way out. Lights off.'})],
  dflt:1});

// the flyer: tell your family, or spread the word (the giveaway remembers)
gEvent({id:'g_flyer',hook:'arrive',tile:['📄','A flyer on the door','info'],chance:0.5,max:1,cond:c=>['mlk','peoples','library'].includes(c.at)&&day()<gSat(),
  run:()=>say(`📄 A bright flyer on the door: <b>BACK-TO-SCHOOL GIVEAWAY · Saturday, Aug 29 · 10 AM–2 PM · People’s Community Center</b>. Free backpacks and supplies, while they last.`),
  choices:()=>[
    gOpt({ic:'📸',l:'Take a picture of it for Mom and Dad',mins:5,fa:2,fn:()=>setEventFlag('g_flyer','family'),
      txt:'📸 You text the picture to Mom. “Good find. Saturday morning, we’re all going.”'}),
    gOpt({ic:'📄',l:'Take a stack and hand them out on your block',mins:30,e:-4,mo:3,fn:()=>setEventFlag('g_flyer','block'),
      txt:'📄 You do both sides of your street. Ms. Lorraine takes three, “for the church ladies.” A kid in a window gives you a thumbs-up.'}),
    gPass('Keep going','📄 You read it twice so you’ll remember. Saturday.')],
  dflt:2});

gEvent({id:'g_rain',hook:'wake',tile:['🌧️','A rainy day','info'],chance:()=>day()>=4?1:0.3,max:1,cond:()=>day()>=1&&day()<=4,
  run:()=>{S.ev.flags.rain=day();say('🌧️ Rain! The first in weeks. It drums on the roof and the whole hill smells like hot pavement and cut grass. The courts will be puddles, but the Reading Room has beanbags and the pool is indoors.')},
  choices:()=>[
    gOpt({ic:'🥾',l:'Puddle-stomp with Nia in rain boots',mins:30,e:-5,fa:4,mo:3,txt:'🥾 You and Nia find the deepest puddle on the block. It is deeper than it looks. Mom hands you towels at the door without a word.'}),
    gOpt({ic:'🏕️',l:'Build a blanket fort and read',mins:60,e:6,mo:1,txt:'🏕️ Couch cushions, two blankets and a flashlight. The rain is louder in a fort. You finish a whole chapter.'}),
    gOpt({ic:'🌧️',l:'Shrug and get on with the day',mo:-2,txt:'🌧️ Rain. Fine. You put on a hoodie and stop looking out the window.'})],
  dflt:2});

gEvent({id:'g_mountain',hook:'wake',tile:['🏔️','The mountain is out','good'],chance:0.3,max:2,cooldown:2,cond:()=>day()>0&&!gRain(),
  run:()=>say('🏔️ The mountain is out. Rainier fills the whole south sky, pink with the first light, so big it looks fake. Dad calls everybody to the window. It’s the thing Tacoma does.'),
  choices:()=>gWatch(10,5,'🏔️ You stand at the window with Dad until the pink turns white. Neither of you says anything. You don’t have to.'),dflt:1});

gEvent({id:'g_lorraine',hook:'arrive',tile:['🍅','The lady on the porch','good'],chance:0.35,max:1,cond:c=>c.at==='home'&&gDay(),
  run:()=>say('🍅 The woman on the corner porch, <b>Ms. Lorraine</b>, waves you over. She has lived on this block since 1968 and already knows your mom’s name.'),
  choices:()=>[
    gOpt({ic:'🪑',l:'Sit on her porch for a while',mins:30,mo:5,fa:2,txt:`🍅 She gives you two tomatoes and the inside scoop on the whole block, then on school: “The science teacher at ${gSchoolShort()}? Sweetheart. You’ll love her.”`}),
    gOpt({ic:'🚿',l:'Help her water the tomatoes',mins:25,e:-4,fa:4,mo:2,txt:'🚿 The hose is older than your dad and the tomatoes are taller than you. She tells Mom about it that evening. “That one of yours has manners.”'}),
    gPass('Wave and say hi','🍅 You wave. She waves back with a trowel. “Come by any time, baby.”')],
  dflt:2});

gEvent({id:'g_nerves',hook:'night',tile:['💭','Butterflies','info'],chance:0.6,max:2,cooldown:1,cond:()=>day()>=4&&day()<gSchoolDay(),
  run:()=>say(gReady()>=60?'💭 You lie awake thinking about Summit View. The good kind of nervous: you have a plan.'.replace('Summit View',gSchoolShort()):'💭 You lie awake listing everything you haven’t done for school yet. The list is long.'),
  choices:()=>[
    gOpt({ic:'🎒',l:'Get up and pack your backpack',s:'It won’t fix the list, but it’s a start.',e:-5,mo:gReady()>=60?3:4,txt:'🎒 You pack, unpack and pack it again in a better order. Then you can sleep.'}),
    gOpt({ic:'🗣️',l:'Go find Mom and talk about it',e:-3,fa:4,mo:3,txt:'🗣️ Mom is still up with tea. She tells you about her first day at a new school, which involved a lunch tray and a lot of spaghetti. You laugh. You sleep.'}),
    gOpt({ic:'💤',l:'Count the cars going by until you fall asleep',mo:gReady()>=60?1:-4,txt:gReady()>=60?'💤 Eleven cars. You’re out.':'💤 Forty-two cars. Check the To-do tab tomorrow.'})],
  dflt:2});

gEvent({id:'g_power_out',hook:'night',tile:['🔦','The power goes out','good'],chance:0.12,max:1,cond:c=>c.where==='home',
  run:()=>say('🔦 The power goes out at nine. The whole block goes dark at once, and somewhere down the street somebody cheers.'),
  choices:()=>[
    gOpt({ic:'🃏',l:'Uno on the floor by flashlight',e:-4,fa:6,mo:3,txt:'🃏 Dad finds a flashlight, Mom finds the cards, and the four of you play Uno on the floor until it comes back. Nobody wants it to.'}),
    gOpt({ic:'👻',l:'Tell Nia a (not too scary) story',e:-3,fa:4,mo:4,txt:'👻 A story about a ghost who is afraid of the dark. Nia laughs so hard she hiccups, and then she’s asleep.'}),
    gOpt({ic:'😴',l:'Take the hint and go to bed early',e:6,fa:1,txt:'😴 No lights, no screens, nothing to do but sleep. You do it really well.'})],
  dflt:2});

gEvent({id:'g_zay_shortcut',hook:'arrive',tile:['🛹','A shortcut','good'],chance:0.7,max:1,cond:c=>c.at==='school'&&gMet('zay')&&!S.shortcut,
  run:()=>say('🛹 Zay is skating the curb in front of the school. “You walk the long way? Nah. I know the alley stairs that skip the steepest block.”'),
  choices:()=>[
    gOpt({ic:'🛹',l:'Walk the shortcut with Zay right now',mins:15,e:-3,mo:2,fr:['zay',5],fn:()=>{S.shortcut=true;setEventFlag('g_zay_shortcut','walked')},
      txt:'🛹 Zay walks it with you twice so you’ll remember: the alley, the stairs, the gap in the fence. School is three minutes closer now.'}),
    gOpt({ic:'📝',l:'Get directions and try it some other time',fr:['zay',2],fn:()=>{S.shortcut=true},
      txt:'📝 Zay draws the way on the back of your hand in pen. Mostly you can read it.'}),
    gOpt({ic:'🏠',l:'Keep to the way Mom knows',fa:2,txt:'🏠 “The long way is fine,” you say. Mom will like knowing where you are. Zay shrugs: “Your legs.”'})],
  dflt:2});

gEvent({id:'g_grandma_box',hook:'wake',tile:['📦','A package from Grandma','good'],chance:1,max:1,cond:()=>day()===3,
  run:()=>say('📦 A package from Grandma: a new set of markers, a pair of socks with owls on them (she looked up the mascot), and $5 “for something fun.”'),
  choices:()=>[
    gOpt({ic:'📞',l:'Call Grandma to say thank you',mins:25,earn:5,fa:5,mo:3,txt:'📞 She wants to hear everything about Hilltop, and about the owls. You talk for twenty-five minutes. She sounds very happy.'}),
    gOpt({ic:'🖍️',l:'Draw her a thank-you with the new markers',mins:40,earn:5,e:-2,fa:3,mo:4,txt:'🖍️ The view from your window: the Link, the church, the mountain. Mom mails it for you on her way to work.'}),
    gOpt({ic:'💵',l:'Pocket the $5 and get going',earn:5,mo:2,txt:'💵 Five dollars “for something fun.” You have ideas.'})],
  dflt:2});

// ---- tips: one a day, each once per game ----
const G_TIPS=[
  {id:'g_welcome',when:()=>day()===0&&S.loc==='home',t:'👋 Welcome to Hilltop, {{name}}! School starts <b>Monday, Aug 31</b>. The <b>To-do</b> tab lists what you need to be <b>Ready</b>. Open <b>🧭 Go somewhere</b> below to explore the hill.'},
  {id:'g_curfew',when:()=>S.loc!=='home'&&tod()>=1140,get t(){return `🏠 Curfew is <b>${fmt(gCurfew())}</b>. Be home by then, or Family drops.`}},
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
  if(gCh1()) it.push({l:'📦 Unpack your room',s:`${S.boxes} of ${G_BOXES} boxes. One a day.`,ok:S.boxes>=G_BOXES});
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
