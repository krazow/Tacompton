// ============================================================
//  TACOMPTON · GROWING UP IN THE HOOD: 30 hard-times events on Hilltop, as choices (03-events.js choices API).
//  Middle school (12–14), high school (14–18) in Growing Up, and young adult (18+) in the adult game. Each event asks
//  2–3 things you could do, with real trade-offs in Family, Grades, Friends (Community as an adult), Mood (Stress),
//  money, and the street meters: Street Rep up for going along, Heat for risky choices (gangAdj, 62-gang.js), and an
//  offense on the record only where one happens (crimeOffense, 60-crime.js). Both are called only if they exist.
//
//  The rules this file keeps (tests/hood-life.test.js checks them):
//   · Nothing graphic: violence is told in a sentence, then the aftermath and the feelings. Deaths are off-screen.
//   · No how-to: "hold a package", "be a lookout" stay vague. Nobody is told how to get, carry or use anything.
//   · Every temptation has a safe choice, and the safe choice is the default. Taking a gun is never a reward: fear,
//     then an adult steps in. Kids' consequences are family and school; police only for the sweep and juvenile detention.
//   · Invented people only (Coach Ray, Ms. Tasha, Big Lou, Jalen, Tay, Dre…); real Tacoma places.
//
//  Spacing: the longer games only, never in the first key week, at most one of these per key week, each at most once a
//  life, rolled from the save's own salt (no Math.random until one fires, so seeded runs stay the same). A whole life
//  sees a fair share, not all. Quick play: at most one light one (gunshots at night, the graffiti wall, the glass
//  studio; at 18, the peace walk), with smaller effects.
//
//  State: S.hood (made on first use): {salt, kw, quick, hoodie, glass, og, lead, diversion, juvie, sealed, noCna, kid,
//  out, g:{rep,heat,loyalty} (what these events pushed), off:[offense ids], log:[{id,d,age}]}.
//  For the gang builder's "ways out": hoodWaysOut() → ['glass','og','lead','diversion','kid','job'] (the ones you have).
// ============================================================
(function(){
const H=()=>{const h=S.hood||(S.hood={});
  if(h.salt==null){let r=0;try{const a=new Uint32Array(1);crypto.getRandomValues(a);r=a[0]}catch(e){r=Date.now()%4294967296}h.salt=r}
  for(const [k,v] of Object.entries({kw:-1,quick:0,hoodie:false,glass:false,og:false,lead:false,diversion:false,juvie:false,sealed:false,noCna:false,kid:false,out:false,job:false}))if(h[k]===undefined)h[k]=v;
  h.g=h.g||{rep:0,heat:0,loyalty:0};h.off=h.off||[];h.log=h.log||[];return h};
const long=()=>typeof lifeLong==='function'&&lifeLong();
const age=()=>(S&&S.age)||(isGrow()?12:18);
const R=c=>isGrow()?gRp(c):rp(c);
// the start-year builder's eras (63-era.js): phones only where the year has them (2026 if there's no start year)
const era=f=>{try{return typeof eraHas==='function'?!!eraHas(f):true}catch(e){return true}};

// ---- the meters, the same words in both modes ----
function fam(n){if(isGrow())adj('family',n);else if(S.life)S.life.family=clamp(Math.round(S.life.family+n),0,100)}
function grades(n){if(isGrow()&&S.grades!=null)S.grades=clamp(Math.round(S.grades+n),0,100)}
function friends(n){if(!isGrow()){adj('community',n);return}
  const k=gBest()||KIDS.find(x=>gMet(x.id));if(k)gFriend(k.id,n)}
function stress(n){if(isGrow())adj('mood',-n);else adj('stress',n)}
function cash(n){if(n>0){isGrow()?gEarn(n):money(n)}else if(n<0){const x=Math.min(Math.max(0,S.money),-n);isGrow()?gSpend(x):spend(x)}}
function gang(o){const h=H(),d={};for(const k of ['rep','heat','loyalty'])if(o[k]){d[k]=o[k];h.g[k]=clamp(h.g[k]+o[k],0,100)}
  if(Object.keys(d).length&&typeof gangAdj==='function')try{gangAdj(d)}catch(e){console.error(e)}}
function offense(id,o){const h=H();h.off.push(id);if(o.kid&&o.sev>=2)h.juvie=true;
  if(typeof crimeOffense==='function')try{const r=crimeOffense(id,o);if(r&&r.text)say(r.text)}catch(e){console.error(e)}}
const rep=()=>(S.gang&&S.gang.rep!=null)?S.gang.rep:H().g.rep;
const member=()=>typeof gangMember==='function'?!!gangMember():false;
const hasRecord=()=>{const h=H();if(h.sealed||(typeof crimeSealed==='function'&&crimeSealed()))return false;
  return h.juvie||(typeof crimeHasRecord==='function'&&!!crimeHasRecord())};
const later=(id,m)=>{if(m&&S.ev.last[id]===day()&&tod()+m<1400)pass(m)};

// an option: fx {$,en,fam,gr,fr,st,rep,heat,loy,min}, crime:[id,{label,sev,kid}], then(), txt
const LBL=()=>isGrow()?{fam:'Family',gr:'Grades',fr:'Friends',st:'Mood'}:{fam:'Family',gr:'Grades',fr:'Community',st:'Stress'};
function fxText(fx){const L=LBL(),out=[],sg=v=>v>0?`+${v}`:`−${-v}`;
  if(fx.min)out.push(fx.min>=60?`${Math.round(fx.min/6)/10} hr`:`${fx.min} min`);
  if(fx.$)out.push(fx.$>0?`Money +${$(fx.$)}`:`Money −${$(-fx.$)}`);
  if(fx.en)out.push(`Energy ${sg(fx.en)}`);
  if(fx.fam)out.push(`${L.fam} ${sg(fx.fam)}`);
  if(fx.gr&&isGrow())out.push(`${L.gr} ${sg(fx.gr)}`);
  if(fx.fr)out.push(`${L.fr} ${sg(fx.fr)}`);
  if(fx.st)out.push(isGrow()?`Mood ${sg(-fx.st)}`:`Stress ${sg(fx.st)}`);
  if(fx.rep)out.push(`Street Rep ${sg(fx.rep)}`);
  if(fx.heat)out.push(`Heat ${sg(fx.heat)}`);
  if(fx.loy)out.push(`Loyalty ${sg(fx.loy)}`);
  const s=out.join(', ');return s?s.charAt(0).toUpperCase()+s.slice(1)+'.':''}
function opt(id,o){const lt=!long()?0.7:1,sc=v=>v?Math.sign(v)*Math.max(1,Math.round(Math.abs(v)*lt)):0;
  const fx={};for(const k in o.fx||{})fx[k]=k==='min'||k==='$'?o.fx[k]:sc(o.fx[k]);
  const note=o.s?o.s+' ':'';
  return {ic:o.ic,l:o.l,s:note+fxText(fx)+(o.crime?' It counts as an offense.':''),dis:!!o.dis,fn:()=>{
    later(id,fx.min);
    if(fx.$)cash(fx.$);if(fx.en)adj('energy',fx.en);if(fx.fam)fam(fx.fam);if(fx.gr)grades(fx.gr);if(fx.fr)friends(fx.fr);if(fx.st)stress(fx.st);
    gang({rep:fx.rep,heat:fx.heat,loyalty:fx.loy});
    if(o.then)o.then();
    say(typeof o.txt==='function'?o.txt():o.txt);
    if(o.crime)offense(o.crime[0],o.crime[1])}}}

// ---- the schedule ----
const BANDS={mid:{grow:true,lo:12,hi:14},high:{grow:true,lo:14,hi:18},young:{grow:false,lo:18,hi:29}};
const HL=[];
function inBand(e){const b=BANDS[e.band],a=age();return b.grow===isGrow()&&a>=(e.lo??b.lo)&&a<=(e.hi??b.hi)}
function ok(e,ctx){if(typeof S==='undefined'||!S||S.over||!S.ev)return false;if(!inBand(e))return false;if(!long()&&!e.light)return false;
  try{return !e.c||!!e.c(ctx||{})}catch(err){return false}}
function gate(){const h=H();if(day()<1)return false;
  if(long()){if(!S.keyWeeks||!(S.kwi>0))return false;return h.kw!==S.kwi}
  return h.quick<1&&day()>=2}
const hash=s=>{let x=2166136261>>>0;for(let i=0;i<s.length;i++){x^=s.charCodeAt(i);x=Math.imul(x,16777619)>>>0}x^=x>>>13;x=Math.imul(x,0x5bd1e995)>>>0;x^=x>>>15;return x/4294967296};
// one roll a morning per event; together the eligible events share W (about 0.15 a morning for a kid, 0.06 as an adult, 0.05 in Quick play)
function roll(e){const n=HL.filter(x=>(S.ev.count[x.id]||0)<1&&ok(x)).length||1;
  const W=!long()?0.05:isGrow()?0.15:0.06;
  return hash(`${H().salt}|${day()}|${e.id}`)<W/n}
function hev(e){HL.push(e);
  defEvent({id:e.id,hook:'wake',tile:e.tile,chance:1,cooldown:0,max:1,urgent:!!e.urgent,dflt:e.dflt,
    cond:ctx=>ok(e,ctx)&&(S.ev.force.includes(e.id)||(gate()&&roll(e))),
    run:ctx=>{const h=H();h.kw=long()?S.kwi:h.kw;if(!long())h.quick++;h.log.push({id:e.id,d:day(),age:age()});if(h.log.length>40)h.log.shift();
      if(e.run)e.run(ctx);say(typeof e.txt==='function'?e.txt():e.txt);
      if(e.moment&&typeof lifeMoment==='function')lifeMoment(e.tile[0],e.moment)},
    choices:()=>e.ch().map(o=>opt(e.id,o))});
}
const best=()=>gBest()||KIDS.find(x=>gMet(x.id));
const metAny=()=>!!(typeof gMetCount==='function'&&gMetCount());

// ================= MIDDLE SCHOOL (12–14) =================
hev({id:'hood_gunshots',band:'mid',light:true,tile:['🌙','Pops in the night','bad'],dflt:1,
  run:()=>adj('energy',-6),
  txt:'🌙 Last night, around two, a string of pops somewhere past the next street. Then sirens, then a helicopter circling for an hour. Nobody on your block was hurt, Mom says at breakfast, but you didn’t sleep much after that. Energy −6.',
  ch:()=>[
    {ic:'🗣️',l:'Tell Mom you couldn’t sleep',fx:{fam:4,st:-4},txt:'🗣️ Mom sits on the edge of your bed before school. “It’s okay to be scared. That’s what I’m here for.” She makes you toast with the good jam and walks you to the corner.'},
    {ic:'🤐',l:'Keep quiet and act fine',fx:{st:5,gr:-1},txt:'🤐 You say you slept fine. You yawn through first period and jump when a locker slams. Nobody knows why.'},
    {ic:'💬',l:'Talk it over with a friend',dis:!metAny(),s:metAny()?'':'You don’t know anyone well enough yet.',fx:{fr:2,st:-2},txt:()=>{const k=best();return `💬 ${k?k.n:'Your friend'} heard it too. “My grandma made us sleep in the hallway.” It helps, somehow, that you weren’t the only one awake.`}},
  ]});

hev({id:'hood_lookout',band:'mid',tile:['💵','A $40 offer','bad'],dflt:0,
  txt:()=>`💵 An older kid from the corner by the car wash calls you over. Forty dollars, he says, just to stand at the end of the block after school and ${era('text')?'text him':'give a whistle'} if a police car comes. “Easy money. Nobody looks at a kid.”`,
  ch:()=>[
    {ic:'🙅',l:'Say no and keep walking',fx:{st:3,rep:-1},txt:'🙅 “No thanks.” He shrugs like it doesn’t matter. Your heart doesn’t slow down until you’re home.'},
    {ic:'🏠',l:'Say no, and tell Dad tonight',fx:{fam:4,st:-2,rep:-2},txt:'🏠 Dad goes quiet, then hugs you hard. For a week he’s at the bus stop when you get off, “just because.”'},
    {ic:'💵',l:'Take the forty',fx:{$:R(40),rep:6,heat:5,fam:-6,st:6},crime:['hood_lookout',{label:'Being a lookout',sev:1,kid:true}],
      txt:'💵 You stand at the end of the block for an hour, watching every car, heart going. Nothing happens. The forty feels heavier than it should. Two days later Mom finds the folded bills in your jeans and asks where they came from. You don’t have a good answer.'},
  ]});

hev({id:'hood_cousin',band:'mid',tile:['🧢','Your cousin and “the set”','info'],dflt:1,
  txt:'🧢 Your cousin Jalen is over for Sunday dinner, sixteen and loud, bragging about “the set”: who’s with who, which corner is theirs, how everybody knows his name now. Nia hangs on every word.',
  ch:()=>[
    {ic:'❓',l:'Ask him questions',fx:{rep:3,st:3,fam:-2},txt:'❓ He talks for an hour. Every story ends with somebody hurt or locked up, and he laughs anyway. You notice he checks the window every time a car slows down outside.'},
    {ic:'🏈',l:'Change the subject',fx:{fam:3,st:-1,rep:-1},txt:'🏈 You ask about the Seahawks. Grandma gives you a look that says thank you. Turns out Jalen knows a lot about the game, and he’s funny about it.'},
    {ic:'🧸',l:'Take Nia outside to play',fx:{fam:5,en:-3},txt:'🧸 You and Nia play four-square on the sidewalk until the streetlights come on. She forgets all about the set. So do you, mostly.'},
  ]});

hev({id:'hood_jumped',band:'mid',urgent:true,tile:['👟','Jumped on the way home','bad'],dflt:0,
  txt:'👟 Two older boys step out of the alley behind the laundromat on your way home and box you in. They want your shoes.',
  ch:()=>[
    {ic:'👟',l:'Hand them over',s:'The safe call.',fx:{st:8,fam:3},txt:'👟 You walk home in your socks. Mom holds on to you a long time, then calls the school to report it. “Shoes are shoes. You came home.” You did.'},
    {ic:'🏃',l:'Run for the corner market',fx:{en:-8,st:6},txt:'🏃 You bolt for the market. Grace Kim is already at the door, and the boys don’t follow. She calls your mom and gives you a juice while you wait. Your hands shake around the bottle.'},
    {ic:'✊',l:'Fight back',fx:{en:-10,st:10,fam:-4,rep:4,heat:2},txt:'✊ It’s over in seconds. You come home with a sore jaw and a torn sleeve, and they still got the shoes. Mom is scared and angry at the same time, and you can’t tell which one is louder.'},
  ]});

hev({id:'hood_color',band:'mid',tile:['🧥','The wrong color','bad'],dflt:1,
  txt:()=>H().hoodie?'🧥 Cutting through a block past 19th, you notice two older guys on a porch looking hard at your shirt: the wrong color for that block. The plain gray hoodie from your bag is already zipped over it before you reach the corner. They look away.'
    :'🧥 Cutting through a block past 19th, two older guys on a porch look hard at your shirt: the wrong color for that block. One of them stands up and asks where you’re from. A plain hoodie in your bag would have covered it.',
  ch:()=>H().hoodie?[
    {ic:'🚶',l:'Keep walking, eyes forward',fx:{st:1},txt:'🚶 Eyes forward, steady pace. The hoodie stays on until you’re home.'},
    {ic:'🗺️',l:'Take the long way from now on',fx:{en:-3,st:-2,fam:1},txt:'🗺️ You add four minutes and skip that block for good. Dad says that’s the smartest four minutes you’ll ever spend.'},
  ]:[
    {ic:'🙋',l:'“I’m from up the street,” and keep walking',fx:{st:6},txt:()=>`🙋 “I’m ${gAgeWord()}. I live up the street.” He looks at you a long second and sits back down. You don’t run, but you want to.`},
    {ic:'↩️',l:'Turn around and go the long way',fx:{en:-6,st:4},then:()=>{H().hoodie=true},txt:'↩️ You turn around and take the long way home. That night you stuff an old plain hoodie in your backpack. It stays there.'},
    {ic:'🗣️',l:'Tell Dad about it',fx:{fam:3,st:2},then:()=>{H().hoodie=true},txt:'🗣️ Dad nods slowly. “Keep something plain in your bag. A color shouldn’t matter. On some blocks it does.” He gives you his old gray hoodie.'},
  ]});

hev({id:'hood_gunpark',band:'mid',urgent:true,tile:['🌳','Something in the bushes','bad'],dflt:0,
  txt:'🌳 Looking for a lost ball in the bushes at the edge of People’s Park, you find a plastic grocery bag tucked under the roots. Inside is a gun. Your whole body goes cold.',
  ch:()=>[
    {ic:'🧓',l:'Don’t touch it. Get Mr. Harris',s:'The right call.',fx:{fam:4,fr:2,st:3},txt:'🧓 You back away and run to Mr. Harris on his porch. He walks over with you, stands between you and the bushes, and calls the police non-emergency line. An officer takes the bag away and thanks you for not touching it. “That was exactly right,” Mr. Harris says.'},
    {ic:'🚶',l:'Leave it and walk away',fx:{st:8},txt:'🚶 You leave it and walk home fast. You don’t tell anyone, and you think about it all night. The next day the bushes are taped off: somebody else called it in.'},
    {ic:'🎒',l:'Take it',fx:{st:18,fam:-10,en:-6},txt:'🎒 You put the bag in your backpack and your hands won’t stop shaking. You don’t sleep. You can’t eat breakfast. By the next afternoon Dad notices you won’t put the backpack down, asks once, and sits on your bed while you tell him. He takes it straight to the police station, and you’re grounded for a month. That night he says the thing you remember: “Nothing in that bag makes you safer. Nothing.”'},
  ]});

hev({id:'hood_skipping',band:'mid',tile:['🎒','Your friend skips school','bad'],dflt:0,
  c:()=>isSchoolDay(day()),
  txt:()=>{const n=(gBest()||{}).n||'Kendrick';return `🎒 ${n}’s seat in homeroom is empty again: the third time this week. Yesterday you saw ${n} on the corner by the car wash with the older kids from the set, laughing too loud.`},
  ch:()=>{const n=(gBest()||{}).n||'Kendrick';return [
    {ic:'💬',l:`Talk to ${n} after school`,fx:{fr:2,st:3,en:-3},txt:`💬 ${n} shrugs at first. Then: “They’re there, you know? Home’s… a lot right now.” You don’t fix it. You do knock on ${n}’s door the next morning so you can walk to school together.`},
    {ic:'🏫',l:'Tell the school counselor',fx:{gr:1,fr:-2,st:-1},txt:`🏫 Ms. Reyes listens and says she’ll call home herself, not the office. ${n} is back in homeroom by Friday, mad at you for a day, then not.`},
    {ic:'🛹',l:`Skip with ${n} once`,fx:{gr:-5,fam:-6,rep:4,heat:2,fr:3},txt:'🛹 A whole day on the corner, and nobody does anything but wait around. The attendance line calls home at ten. Mom’s face at dinner says everything.'},
  ]}});

hev({id:'hood_graffiti',band:'mid',light:true,tile:['🎨','A wall war on the corner store','info'],dflt:2,
  txt:'🎨 Overnight somebody tagged the side wall of the corner market on MLK, crossing out somebody else’s tags from last week. Grace Kim is out front with a bucket of paint, looking tired.',
  ch:()=>[
    {ic:'🖌️',l:'Help Grace paint over it',fx:{en:-6,fr:2,fam:2,st:-2},txt:'🖌️ Grace hands you a roller. Two neighbors join in, then a few more kids. By noon the wall is clean, and Grace gives you a cold juice and your name on the “wall crew” list by the register.'},
    {ic:'✏️',l:'Add a tag with the older kids',fx:{rep:4,heat:4,fam:-5,st:4},crime:['hood_graffiti',{label:'Tagging a wall',sev:1,kid:true}],txt:'✏️ You add your mark with the older kids after dark. In the morning Grace Kim sees you from the window. She doesn’t yell. She just looks sad, and that’s worse.'},
    {ic:'🚶',l:'Ignore it and keep walking',fx:{st:1},txt:'🚶 Not your wall, not your war. You keep walking.'},
  ]});

hev({id:'hood_sweep',band:'mid',tile:['🚓','A police sweep on your block','bad'],dflt:0,
  txt:'🚓 After school, three police cars pull up at the end of your block, lights on, and officers start talking to everyone on the corner. Mom calls: “Come straight home.”',
  ch:()=>[
    {ic:'🏠',l:'Stay inside with Nia',fx:{fam:3,st:2},txt:'🏠 You and Nia watch from behind the curtain until the cars leave. Mom gets home and hugs you both a little too long.'},
    {ic:'👀',l:'Go see what’s happening',fx:{rep:2,heat:3,st:5,fam:-4},then:()=>{H().saw=true},txt:'👀 You stand at the edge of the crowd. An officer tells you to go home, not unkindly, and writes down your name. Mom has called four times. She isn’t happy.'},
  ]});

hev({id:'hood_glass',band:'mid',light:true,tile:['🫙','A spot in the glass studio','good'],dflt:1,moment:'Got a spot in the youth glass-art studio at People’s.',
  txt:'🫙 Coach Ray from People’s Community Center catches you by the gym door. The youth glass-art studio has one open spot: Tuesday and Thursday afternoons, free, with a real hot shop and real artists. “I think you’d be good at it. Want it?”',
  ch:()=>[
    {ic:'🔥',l:'Take the spot',fx:{en:-5,fam:4,fr:2,st:-4,gr:2,rep:-3},then:()=>{H().glass=true;if(typeof setEventFlag==='function')setEventFlag('hood_glass',true)},txt:'🔥 Your first afternoon you make a lopsided blue paperweight. Coach Ray puts it on his desk like it’s in a museum. You go back Thursday, and the Tuesday after that.'},
    {ic:'🤔',l:'Say maybe later',fx:{st:1},txt:'🤔 “Door stays open,” Coach Ray says. He means it.'},
  ]});

// ================= HIGH SCHOOL (14–18) =================
hev({id:'hood_package',band:'high',tile:['📦','“Just hold it for a week”','bad'],dflt:0,
  txt:'📦 A guy from the set your cousin runs with stops you on the walk home with a shoebox taped shut. “Hold this for a week. Don’t open it. A hundred when I pick it up.”',
  ch:()=>[
    {ic:'🙅',l:'Say no',fx:{st:4,rep:-2},txt:'🙅 He shrugs and goes to find the next kid. You walk home fast and don’t look back.'},
    {ic:'🗣️',l:'Say no, and tell Mom',fx:{fam:4,st:-1,rep:-3},txt:'🗣️ Mom listens to the whole thing. The next morning she walks you to the bus herself, in her work clothes, and says nothing about it. She doesn’t need to.'},
    {ic:'📦',l:'Take it',fx:{rep:8,heat:10,st:14,fam:-8},crime:['hood_package',{label:'Holding a package for the set',sev:2,kid:true}],txt:'📦 You hide it under your bed and don’t sleep for a week. When he picks it up there’s no hundred: just “good looking out,” and now they know you’ll say yes.'},
  ]});

hev({id:'hood_driveby',band:'high',tile:['🏠','Kept inside for three days','bad'],dflt:2,
  txt:'🏠 Shots on the next street last night: a car went by, and by morning the news says two people are in the hospital. Mom says nobody is going anywhere for three days but school and straight home.',
  ch:()=>[
    {ic:'🎲',l:'Make the most of it with family',fx:{fam:6,fr:-2,st:-2,en:4},txt:'🎲 Board games, Dad’s chili and Nia beating everyone at Uno three nights running. It’s the most you’ve all talked in months.'},
    {ic:'📱',l:'Spend it on the phone with friends',fx:{fr:3,fam:-1,st:2},txt:'📱 Three nights of long phone calls. Everybody heard something different about what happened. Nobody knows anything for sure.'},
    {ic:'📚',l:'Catch up on homework',fx:{gr:4,st:1},txt:'📚 Three nights at the kitchen table. You finish everything you were behind on, plus the extra credit.'},
  ]});

hev({id:'hood_friendshot',band:'high',urgent:true,tile:['🏥','Tay is in the hospital','bad'],dflt:1,moment:'A friend from school, Tay, was shot. He made it.',
  txt:'🏥 Tay, from your math class, was shot walking home Saturday night. He’s going to be okay: a long stay at the hospital and a longer recovery. At school on Monday two of the older kids from the set are already talking about getting back at whoever did it, and they look right at you.',
  ch:()=>[
    {ic:'💐',l:'Visit Tay at Mary Bridge',fx:{min:90,en:-6,fr:4,st:-2,fam:2},txt:'💐 Tay is propped up on pillows, tired, cracking jokes about the hospital food. He asks you to bring his math homework next time, “so I don’t fall behind you.” His mom hugs you at the elevator.'},
    {ic:'🙅',l:'Tell them no, flat',fx:{rep:-4,loy:-3,st:6,fr:1},txt:'🙅 “No.” They call you scared. You are, and you’re right to be. You go home.'},
    {ic:'🚗',l:'Go along with them',fx:{rep:10,heat:20,loy:8,fam:-20,st:20,gr:-8},crime:['hood_retaliation',{label:'Riding along for a retaliation',sev:3,kid:true}],
      txt:'🚗 You get in the car. Four blocks later it’s pulled over: somebody saw it circle twice and called. Nothing happens, nobody is hurt, and everybody in the car is arrested. Your mom comes to the station at three in the morning, still in her work uniform. She doesn’t say a word the whole way home. That’s the worst part.'},
  ]});

hev({id:'hood_funeral',band:'high',tile:['🕊️','A funeral, then a peace walk','bad'],dflt:1,moment:'Went to Jaylen’s funeral.',
  txt:'🕊️ Jaylen, a ninth grader you knew from the bus, died over the weekend after a shooting near the grocery store on MLK. The funeral is at the big church on the corner, and the line goes down the block. Afterward a woman from People’s hands out flyers: a peace walk on Saturday, from People’s to the church.',
  ch:()=>[
    {ic:'🕊️',l:'Go on the peace walk',fx:{en:-6,fr:4,fam:3,st:-6,rep:-2},txt:'🕊️ Three hundred people walk up the hill in white shirts. Jaylen’s mom carries his school picture. At the end somebody you don’t know puts a hand on your shoulder, and leaves it there a while.'},
    {ic:'✉️',l:'Stay home and write to his family',fx:{fam:3,st:-3},txt:'✉️ You write a card about the time Jaylen saved you a seat on the bus every day for a month. Mom drops it at the church.'},
    {ic:'😶',l:'Go quiet for a while',fx:{st:8,gr:-3,fr:-2},txt:'😶 You don’t go to the walk. You don’t talk much for a week. Mom leaves the door to your room open a little every night.'},
  ]});

hev({id:'hood_schoolfight',band:'high',tile:['🏫','A rumor at school','bad'],dflt:0,
  c:()=>isSchoolDay(day()),
  txt:'🏫 By second period a rumor about you is all over Hilltop High: something you said, which you didn’t. At lunch the kid who started it is waiting by your table with a crowd behind him.',
  ch:()=>[
    {ic:'🚶',l:'Walk away',fx:{rep:-3,st:5,fr:1},txt:'🚶 Somebody yells that you’re scared. You keep walking. By Thursday nobody remembers the rumor, and you never got suspended.'},
    {ic:'✊',l:'Fight',fx:{rep:5,gr:-6,fam:-6,st:8},crime:['hood_fight',{label:'A fight at school',sev:1,kid:true}],txt:'✊ Two teachers break it up in seconds. Three days’ suspension for both of you, and a call home. The rumor is still going around when you come back.'},
    {ic:'🧑‍🏫',l:'Go to the counselor',fx:{gr:1,st:-3,rep:-2},txt:'🧑‍🏫 Ms. Reyes sits you both down in her office with the door closed. Twenty awkward minutes later it turns out the rumor started with somebody else entirely. You both leave annoyed at the same person.'},
  ]});

hev({id:'hood_witness',band:'high',urgent:true,tile:['👁️','You saw it','bad'],dflt:1,
  txt:'👁️ Walking home along 11th, you hear shots a block ahead, see a car speed off and a man fall on the sidewalk. People run to him; somebody is already on the phone with 911. Later you hear he survived. The next day a detective knocks on your door. Mom stands right next to you.',
  ch:()=>[
    {ic:'🗣️',l:'Tell the detective what you saw',fx:{st:8,heat:4,fam:4,rep:-4},txt:'🗣️ You tell it plainly: the car, the color, which way it went. The detective writes it down, thanks you, and gives Mom a card. For a few weeks Dad walks you to the bus every morning.'},
    {ic:'🤐',l:'Say you didn’t see anything',fx:{st:10,rep:2},txt:'🤐 “I didn’t see anything.” The detective nods like he hears that a lot. It sits on you for a long time.'},
    {ic:'📞',l:'Call the anonymous tip line later, with Mom',fx:{st:4,fam:3},txt:'📞 That night, at the kitchen table, you and Mom call the anonymous tip line. No names. You say what you saw, and then you both sit there a while.'},
  ]});

hev({id:'hood_og',band:'high',tile:['🧓','“Don’t end up like me”','good'],dflt:1,
  txt:'🧓 Big Lou, who everybody on the block knows did fifteen years, waves you over to his porch. “I see you on that corner. I was you. Fifteen years, and my mama passed while I was inside. Don’t end up like me.”',
  ch:()=>[
    {ic:'👂',l:'Sit down and listen',fx:{en:-2,st:-4,rep:-3,loy:-3},then:()=>{H().og=true},txt:'👂 He talks for an hour: the shipyard job he lost, the birthdays he missed, the GED he finally got inside. Then he writes a number on the back of a receipt: Ms. Tasha, a youth outreach worker at People’s. “Call her before you need her.”'},
    {ic:'🙄',l:'Brush him off',fx:{rep:2,st:1},txt:'🙄 “Okay, Unc.” He nods like he expected that. “Door’s open.”'},
  ]});

hev({id:'hood_carstolen',band:'high',tile:['🚗','The car is gone','bad'],dflt:0,
  txt:'🚗 Dad comes back in from the driveway at six in the morning with an empty look. The car is gone. Mom has a shift at Tacoma General at seven.',
  ch:()=>[
    {ic:'🚌',l:'Help Mom figure out the bus',fx:{fam:5,en:-4,st:2},txt:()=>`🚌 You find her the route ${era('maps')?'on your phone':'on the bus schedule in the kitchen drawer'} and walk her to the stop. She makes it with four minutes to spare and ${era('text')?'texts you a thumbs-up':'calls home'} from the break room.`},
    {ic:'📱',get l(){return era('nextdoor')?'Post it in the block club group chat':'Tell the block club'},fx:{fr:3,fam:2},txt:'📱 Ms. Lorraine gets the word to everyone. Three days later her nephew spots the car in a lot by the Tacoma Mall. It comes back with a broken ignition and a pile of fast-food bags, but it comes back.'},
    {ic:'🔎',l:'Go looking for it with your cousin',fx:{rep:3,heat:4,fam:-3,st:5},txt:'🔎 Jalen says he knows who takes cars around here. You spend the afternoon riding around with him, asking the wrong people. Dad finds out where you went and tells you, very quietly, to stay out of it.'},
  ]});

hev({id:'hood_carjack',band:'high',lo:16,urgent:true,tile:['⛽','At the gas station','bad'],dflt:0,
  txt:'⛽ You’re pumping gas for Dad at the station on Sixth Ave while he pays inside, when a guy in a hoodie walks up fast and tells you to hand over the keys.',
  ch:()=>[
    {ic:'🔑',l:'Hand over the keys and step back',s:'The safe call.',fx:{st:10,fam:6},txt:'🔑 You hand them over and step back. He drives off. Dad runs out, grabs you, and doesn’t even look at where the car was. “The car is a thing. You are not a thing.” The police find it two days later in Lakewood.'},
    {ic:'🏃',l:'Drop the keys and run inside',fx:{st:8,en:-4,fam:3},txt:'🏃 You drop the keys and run inside to Dad and the clerk. The clerk calls 911. The car is gone; you’re fine. That’s the trade, and it’s a good one.'},
    {ic:'✋',l:'Hold on to the keys',fx:{st:16,en:-8,fam:-2,rep:2},txt:'✋ He shoves you hard against the pump and takes them anyway. You’re bruised and shaking. Dad is scared and angry at the same time: “Never fight for a car. Never.”'},
  ]});

hev({id:'hood_juvie',band:'high',tile:['🏛️','Three days in juvenile detention','bad'],dflt:0,moment:'Three days in juvenile detention after a sweep.',
  c:()=>rep()>=10||H().off.length>0||H().saw,
  run:()=>{fam(-8);grades(-4)},
  txt:'🏛️ A police sweep on the corner by the car wash catches you standing with the wrong crowd at the wrong time. You spend three days at Remann Hall, the county’s juvenile detention center, waiting for a hearing. At the hearing the judge offers diversion: a youth program, community service and check-ins, and the charge goes away if you finish.',
  ch:()=>[
    {ic:'🤝',l:'Take the diversion program',s:'The charge goes away if you finish.',fx:{en:-6,st:6,fam:-2,heat:-6,rep:-4},then:()=>{H().diversion=true},txt:'🤝 Twelve Saturdays picking up trash on MLK, a check-in every week, and a counselor named Ms. Tasha who somehow already knows your name. On the last Saturday she signs your sheet. The charge is gone.'},
    {ic:'⚖️',l:'Turn it down and go to court',fx:{fam:-10,st:12,heat:6,rep:4},crime:['hood_court',{label:'Charged after a police sweep',sev:2,kid:true}],then:()=>{H().juvie=true},txt:'⚖️ You turn it down. The hearing is a month out, and the public defender is kind but busy. Mom takes the day off work to sit behind you.'},
  ]});

hev({id:'hood_raid',band:'high',tile:['🚨','A raid next door','bad'],dflt:1,
  txt:'🚨 At five in the morning the house next door is surrounded: officers, a loudspeaker, everybody told to come out. Nobody is hurt, and by breakfast it’s over. Mom and Dad are at the kitchen table talking quietly about moving: maybe Lakewood, maybe Spanaway, somewhere “quieter.”',
  ch:()=>[
    {ic:'🏠',l:'Tell them you want to stay near your friends',fx:{fr:3,fam:-2,st:2},txt:'🏠 They hear you out. Dad says they’ll give it a year and see. Mom doesn’t look sure.'},
    {ic:'🧳',l:'Tell them you’d be okay moving',fx:{fam:4,fr:-3,st:-2},txt:'🧳 Mom squeezes your hand. They start looking at listings on Sundays. Nothing comes through for now, but it helps that you said it.'},
    {ic:'🗳️',l:'Go with Dad to the block club meeting about it',fx:{fam:3,fr:2,en:-4,st:-3},txt:'🗳️ Folding chairs at People’s, forty neighbors, and Ms. Lorraine with a list: streetlights, a walking group, a meeting with the precinct. Dad stands up and talks. You’ve never seen him do that.'},
  ]});

hev({id:'hood_bbq',band:'high',lo:15,tile:['🍖','A summer job at the barbecue','good'],dflt:1,
  c:()=>season()==='summer'||season()==='spring',
  txt:'🍖 Mr. Willie at the corner barbecue on MLK is hiring for the summer: three afternoons a week on the register and keeping the line moving, cash every Friday. “Show up on time and I’ll teach you the sauce.”',
  ch:()=>[
    {ic:'🍖',l:'Take the job',fx:{$:R(60),en:-8,fam:3,rep:-3,st:-2},then:()=>{H().job=true},txt:'🍖 Smoke in your hair, sauce on your shirt and sixty dollars on Friday. Mr. Willie calls you “the new kid” for a month, then just your name.'},
    {ic:'🏀',l:'Keep the summer free',fx:{st:-4,fr:3},txt:'🏀 Hoops at People’s, late mornings, the whole summer ahead of you. You’re broke and it’s great.'},
    {ic:'💵',l:'Run errands for the set instead',fx:{$:R(40),rep:6,heat:6,fam:-6,st:6},crime:['hood_errands',{label:'Running errands for the set',sev:2,kid:true}],txt:'💵 The money comes faster and feels worse. You stop walking past Mr. Willie’s.'},
  ]});

hev({id:'hood_nia',band:'high',tile:['👧','Nia copies your style','info'],dflt:1,
  txt:()=>`👧 Nia comes out of her room in your old hoodie, hood up, walking the way you walk. ${rep()>=20?'She asks if she can come to the corner with you.':'She asks if she can come hang out with you and your friends.'}`,
  ch:()=>[
    {ic:'📚',l:'Take her to the Reading Room instead',fx:{fam:6,rep:-2,en:-3},txt:'📚 You walk her to the Reading Room and help her find a graphic novel. She reads it on the way home, out loud, doing all the voices.'},
    {ic:'🙅',l:'Tell her to go back inside',fx:{fam:-3,st:2},txt:'🙅 She slams her door. Later you hear her crying a little, and you knock and sit on the floor outside it for a while.'},
    {ic:'🧢',l:'Let her tag along',fx:{rep:2,heat:2,fam:-4,st:3},txt:()=>rep()>=20?'🧢 She stands next to you on the corner, proud and small. Mom sees you both from the bus window. That night is a long one at home.':'🧢 She tags along to the court at People’s and keeps score very seriously. Mom is less happy about it than Nia is.'},
  ]});

hev({id:'hood_gunoffer',band:'high',urgent:true,tile:['⚠️','“For protection”','bad'],dflt:0,
  txt:'⚠️ After the shooting last week, an older guy from the set says you need something “for protection,” and holds out a backpack. “Everybody has one now.” They don’t.',
  ch:()=>[
    {ic:'🙅',l:'Say no and walk away',s:'The right call.',fx:{st:4,rep:-3},txt:'🙅 You say no. Your legs shake the whole way home, and you were right.'},
    {ic:'🧑‍🤝‍🧑',l:'Say no, and tell a grown-up you trust',fx:{fam:3,st:-2,rep:-4,heat:-2},txt:'🧑‍🤝‍🧑 You tell Mom, and Mom calls the youth outreach office at People’s. Somebody there knows the guy’s family. He doesn’t offer again.'},
    {ic:'🎒',l:'Take it',fx:{rep:6,heat:12,loy:5,st:20,fam:-12,gr:-4},crime:['hood_gun',{label:'A gun, under 18',sev:2,kid:true}],txt:'🎒 You don’t sleep. Every car that slows down makes your stomach drop. A week later Mom finds the backpack in your closet. She takes it to the police station herself, then sits in the car in the parking lot for a long time before she comes home. Nothing about it made you safer.'},
  ]});

hev({id:'hood_outreach',band:'high',tile:['🤝','A youth leadership program','good'],dflt:1,moment:'Joined Ms. Tasha’s youth leadership program.',
  txt:'🤝 Ms. Tasha, a youth outreach worker who grew up on Hilltop, finds you at People’s. She runs a youth leadership program: Wednesday evenings, a small stipend, and a spring trip to Olympia to talk to lawmakers about safe streets.',
  ch:()=>[
    {ic:'✍️',l:'Sign up',fx:{$:R(25),en:-5,fr:3,fam:3,gr:2,st:-3,rep:-4,loy:-4},then:()=>{H().lead=true},txt:'✍️ Wednesday nights in a circle of folding chairs: kids from every block on the hill, some from the sets, some not. By the third week you’re the one who stays to stack the chairs.'},
    {ic:'🤔',l:'Not right now',fx:{st:1},txt:'🤔 Ms. Tasha writes her number on your hand. “For when you’re ready. It doesn’t run out.”'},
  ]});

// ================= YOUNG ADULT (18+, the adult game) =================
hev({id:'hood_homie',band:'young',tile:['🚪','Dre comes home','info'],dflt:1,
  txt:()=>`🚪 Dre, ${S.life&&S.life.grow?'from your old block':'Ms. Lorraine’s grandson'}, is out after five years. He’s thinner and quiet, sleeping on his aunt’s couch, and he needs a job by the end of the month for his parole officer. The old crew already has an offer for him. And for you.`,
  ch:()=>[
    {ic:'💼',l:'Help him find work',fx:{min:120,en:-8,fr:4,st:2,rep:-3,loy:-2},txt:'💼 You spend a Saturday morning with him at the WorkSource office downtown and an afternoon walking resumes up MLK. A kitchen hires him for prep. A week later he shows you his first paycheck like it’s a diploma.'},
    {ic:'🛋️',l:'Lend him a little and stay out of the rest',fx:{$:-R(40),fr:2,st:4},txt:'🛋️ Forty dollars and a bag of groceries. “I got you,” you say, and mean it about that much.'},
    {ic:'🔁',l:'Get pulled back in with him',fx:{$:R(150),rep:8,heat:10,loy:8,st:12,fam:-6},crime:['hood_backin',{label:'Back in with the old crew',sev:2,kid:false}],txt:'🔁 It’s like he never left, and like you never did. The money is quick. You start checking your mirrors again.'},
  ]});

hev({id:'hood_record',band:'young',hi:35,tile:['🧾','A background check','bad'],dflt:1,
  c:()=>hasRecord()&&S.job!=='hospital',
  txt:'🧾 You apply for a CNA spot at Tacoma General. A week later the hiring office calls: the background check found your juvenile record, and as it stands they can’t move you forward.',
  ch:()=>[
    {ic:'⚖️',l:'Ask the court to seal it',s:'Washington lets you ask the juvenile court to seal a juvenile record.',fx:{min:120,st:4,fr:2},then:()=>{const h=H();h.sealed=true;h.noCna=false;if(typeof crimeSeal==='function')try{crimeSeal('hood')}catch(e){console.error(e)}else if(S.crime&&S.crime.record&&!S.crime.sealed)S.crime.sealed={d:day(),age:S.age||18}},
      txt:'⚖️ A free legal clinic downtown helps you fill out the motion to seal. A few weeks later the letter comes: sealed. The CNA job is open to you again.'},
    {ic:'🚪',l:'Let it go',fx:{st:8},then:()=>{H().noCna=true},txt:'🚪 You let it go. The CNA job is off the table, and it stings more than you thought it would.'},
  ]});

hev({id:'hood_crewtarget',band:'young',urgent:true,tile:['🧳','Your old crew is a target','bad'],dflt:2,
  c:()=>rep()>=20||member(),
  txt:'🧳 Word comes through a cousin: somebody is looking to get back at your old crew for something you weren’t even part of, and your name came up.',
  ch:()=>[
    {ic:'🧳',l:'Move off Hilltop for a while',fx:{$:-R(300),en:-6,st:6,fr:-4,heat:-15,rep:-4},txt:'🧳 A month on an aunt’s couch in Puyallup and a long bus ride to work. You miss the hill every day. It cools down while you’re gone.'},
    {ic:'🏠',l:'Stay, and keep your head down',fx:{st:14,heat:6},txt:'🏠 You stay. Blinds closed, no corner, straight to work and straight home. Every car that slows down outside is a long second.'},
    {ic:'📞',l:'Call the outreach program at People’s',fx:{st:2,fr:2,heat:-8,loy:-4},txt:'📞 Ms. Tasha’s people know folks on both sides. It takes two weeks and a lot of phone calls, and nothing happens. That’s the whole point.'},
  ]});

hev({id:'hood_peacewalk',band:'young',light:true,hi:80,tile:['🕊️','A peace walk on MLK','good'],dflt:2,
  txt:'🕊️ After a shooting near 15th and MLK last week, the churches and the block club are holding a peace walk down MLK Jr Way on Saturday morning, from People’s Community Center to the corner where it happened.',
  ch:()=>[
    {ic:'🕊️',l:'Walk',fx:{en:-6,fr:4,st:-5,rep:-2},txt:'🕊️ Hundreds of people, slow and quiet, the choir from the church on the corner singing at the front. Mr. Harris walks the whole way with his cane. At the corner everybody stops and stands together for a minute of silence.'},
    {ic:'🍲',l:'Help with the food afterward',fx:{$:-R(15),fr:3,st:-2,en:-3},txt:'🍲 You bring a tray of cornbread to the tables at People’s and serve until it’s gone. Ms. Lorraine says that’s community: people who show up with food.'},
    {ic:'🏠',l:'Stay home',fx:{st:2},txt:'🏠 You watch the walk go by from the window. You meant to go.'},
  ]});

hev({id:'hood_baby',band:'young',lo:20,hi:40,tile:['👶','Your baby is born','good'],dflt:0,moment:'Your baby was born at Tacoma General.',
  c:()=>(typeof relActive==='function'&&relActive()&&typeof relPartner==='function'&&!!relPartner())||S.length==='life',
  run:()=>{H().kid=true},
  txt:'👶 Your baby is born at Tacoma General at 4:12 in the morning: seven pounds even, a full head of hair and a very loud opinion about the lights. Your mom is in the waiting room before the nurses have finished. Everything is different now.',
  ch:()=>[
    {ic:'🍼',l:'Take the week off and stay home',fx:{en:-8,fam:8,st:-4,$:-R(150)},txt:'🍼 A week of no sleep, tiny socks and your mom showing up with food every single day. You learn every sound the baby makes.'},
    {ic:'🛣️',l:'Make yourself a promise: a different road',fx:{fam:5,st:-3,rep:-8,loy:-10,heat:-5},then:()=>{H().out=true},txt:()=>member()||rep()>=20?'🛣️ You call the old crew and say one line: “I’m done. I have a kid now.” Then you hang up and pick the baby back up.':'🛣️ Holding the baby at the window, you make yourself a promise about the road you’ll walk. You mean to keep it.'},
    {ic:'💼',l:'Pick up extra shifts for diapers',fx:{$:R(150),en:-10,st:6,fam:2},txt:'💼 Extra shifts, a car seat, and a lot of diapers. You fall asleep sitting up more than once.'},
  ]});

// ---- the hoodie habit (Growing Up, at home, the longer games) ----
{const ah=GROW.actionsHere;GROW.actionsHere=function(){const a=ah();try{
  if(S&&S.loc==='home'&&long()&&age()>=12&&age()<18){const h=H();
    a.push({ic:'🧥',l:`Habit: a plain hoodie in your bag: ${h.hoodie?'ON':'off'}`,s:'Covers whatever color you’re wearing on a block where it matters. Tap to change.',cat:'here',
      fn:()=>{h.hoodie=!h.hoodie;say(h.hoodie?'🧥 A plain gray hoodie goes in your backpack and stays there.':'🧥 The hoodie comes out of your bag.')}})}
  }catch(e){console.error(e)}return a}}

// ---- the guide: a short section in Growing up (26-help.js) ----
if(typeof helpGrowing==='function'){const hg=helpGrowing;helpGrowing=function(){return hg()+`
    <h3>Hard times on the block</h3>
    <p>Hilltop is home, and some weeks are hard. In the longer games, a few key weeks bring a hard moment: pops in the night, an older kid with an offer, a friend in the hospital, a funeral and a peace walk, a police sweep. You never see the violence: you hear about it, and you live with what comes after.</p>
    <ul><li>Every one asks what you do. There is always a safe choice, and it’s the one picked if you don’t decide. Going along raises <b>Street Rep</b>; risky choices raise <b>Heat</b>, and some put an offense on your record.</li>
    <li>Real people help: Mom and Dad, Mr. Harris, Coach Ray and the youth glass studio at People’s, Ms. Tasha’s youth leadership program, and a diversion program instead of court.</li>
    <li>🧥 Keep a plain hoodie in your bag (a habit at home) for the block where a color matters.</li>
    <li>As a young adult: an old friend home after five years, a background check (Washington lets you ask the court to seal a juvenile record), and a peace walk down MLK Jr Way.</li>
    <li>A life sees some of these, never all. 🧪 Try it has at most one, and a light one.</li></ul>`}}

window.hoodWaysOut=()=>{if(!S)return [];const h=H();return ['glass','og','lead','diversion','kid','job'].filter(k=>h[k])};
window.hoodNoCna=()=>!!(S&&S.hood&&S.hood.noCna);
window.HOOD={ids:HL.map(e=>e.id),list:HL,ok:id=>{const e=HL.find(x=>x.id===id);return !!e&&ok(e)},band:id=>{const e=HL.find(x=>x.id===id);return e&&{band:e.band,lo:e.lo??BANDS[e.band].lo,hi:e.hi??BANDS[e.band].hi,grow:BANDS[e.band].grow,light:!!e.light}},S:H,gate,roll:id=>roll(HL.find(x=>x.id===id))};
})();
