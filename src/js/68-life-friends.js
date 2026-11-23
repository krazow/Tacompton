// ============================================================
//  TACOMPTON · LIFE IN TACOMA, part 2: friends and family in Growing Up's longer games (after 67-life-school.js; state in S.ls).
//  - A best friend, chosen through play: the kid you get closest to (gBest() in 30-grow-world.js, friendship 12+ of 20) becomes
//    your best friend, with a meter on the Kids tab and story beats: they show up in key weeks, a fight, a make-up, and a big
//    moment of their own at 16 or later.
//  - Friend groups: club and team friends join your people; friends you don't see drift in long time skips and come back later.
//  - Family stories: Dad's new job, Nia growing up, Mom's promotion, Grandma getting older and moving in. Plain and warm.
//  - Dinners, chores and coming home on time build trust; trust (and good report cards, 67) earn freedoms: a later curfew,
//    going downtown on your own, a later weekend curfew.
//  Friendship and family only. Grown-up relationships are 37-relationships.js's, for adults, behind relActive().
// ============================================================

// ---- the best friend's story, per kid ----
const LF_BF={
  marcus:{show:'Marcus is on your steps Monday at 7:40 with two breakfast sandwiches and a ball under his arm.',over:'Marcus comes over to watch the game and eats everything in the fridge. Mom loves him for it.',
    fight:'Marcus made the team and you didn’t, and you said something about it you can’t take back.',make:'Marcus shows up at People’s with two sodas and says, “You’re still the only one who rebounds for me.”',
    big:{h:'🏀 Marcus makes varsity',b:'Marcus makes varsity at Hilltop High as a junior. His first home game is Friday, and he texts you the seat he saved, front row.',c:[['📣 Be in that front-row seat, loud',{mood:8},'You make a sign. He points at it after his first basket.'],['🏀 Rebound for him the night before',{mood:6},'Two hours at People’s, under the lights. “Same as always,” he says, and it is.']]}},
  ana:{show:'Ana texts you a drawing of the two of you on the curb on MLK, from years ago. “Come draw?”',over:'Ana comes over with her sketchbook and draws Nia, who poses like a queen for an hour.',
    fight:'Somebody laughed at Ana’s sketchbook in the hall, and you laughed too.',make:'Ana leaves a drawing in your locker: you, drawn as a superhero, with the power “saying sorry.” You find her at lunch and say it.',
    big:{h:'🎨 Ana’s first mural',b:'Ana’s first real mural goes up on the side of the market on MLK, two blocks from the curb where you used to draw the Link. She asks you to hold the ladder.',c:[['🖌️ Help paint a corner of the sky',{mood:8},'She puts a tiny version of you in the corner, drawing on a curb.'],['📸 Take the photos for her portfolio',{mood:6},'Her aunt frames the best one.']]}},
  tavita:{show:'Tavita waves you over from his steps across the street the first morning: “My mom made too much food. Again.”',over:'Tavita comes over with his ukulele and teaches Nia a song she then sings for a week.',
    fight:'You missed Tavita’s birthday party for something that didn’t matter, and his whole family noticed.',make:'Tavita’s grandma marches you across the street, sits you both down with a plate of fried bread, and says, “Fix it.” You do.',
    big:{h:'🎸 Tavita’s band plays the Street Fair',b:'Tavita’s band gets a slot on the main stage at the Hilltop Street Fair. He’s terrified and pretending he isn’t.',c:[['🎶 Stand right up front',{mood:8},'He looks down at you before the first song and breathes. The whole block sings the chorus.'],['🎚️ Help the band load in and run the merch table',{mood:6},'You sell thirty shirts his cousin printed in the garage.']]}},
  linh:{show:'Linh is at your door the first morning with a printed list: “Things we are doing this week.” It is color-coded.',over:'Linh comes over and fixes your family’s printer, then the toaster, then explains both to Nia.',
    fight:'You told somebody about Linh’s plan to apply to an engineering camp, and it got around before she was ready.',make:'You find Linh at the Reading Room and say you’re sorry before she can look up. She hands you half her headphones.',
    big:{h:'🤖 Linh gets into the summer engineering program',b:'Linh gets into a summer engineering program at the University of Washington in Seattle. Six weeks away. She’s thrilled and a little scared.',c:[['🎉 Throw her a going-away party at the Reading Room',{mood:7},'Ms. Okafor bakes a cake shaped like a robot. It falls over. Everyone cheers.'],['✉️ Write her a letter to open on the first night',{mood:6},'She texts you a photo of it taped to her dorm wall.']]}},
  zay:{show:'Zay rolls up on his board the first morning and does a trick off your steps. It almost works.',over:'Zay comes over and tells Nia the names of all the cranes in the bay. She names them all over again.',
    fight:'You dared Zay to try the big stairs at the overlook, he fell, and you left before he got up.',make:'You show up at the overlook with a first-aid kit and a bag of blackberries. Zay laughs so hard he forgets to be mad.',
    big:{h:'🛹 Zay’s skate video premieres',b:'Zay’s skate video plays on a bedsheet at People’s Park, the whole skate crew on folding chairs. Half of it was filmed on your phone.',c:[['🎬 Introduce it',{mood:8},'You say three sentences. The crew cheers like it was a speech.'],['🛹 Skate the first run after',{mood:6},'You fall once, on purpose this time.']]}},
};
const lfBF=()=>{const L=LS();return L.bf&&gKid(L.bf)?gKid(L.bf):null};
const lfHearts=f=>'❤️'.repeat(Math.min(5,Math.floor(f/4)))+'🤍'.repeat(5-Math.min(5,Math.floor(f/4)));
function lfBeat(){const L=LS(),B=L.beats,k=lfBF();
  if(!k){const b=gBest();if(!b)return false;L.bf=b.id;B.since=S.kwi;
    say(`${b.ic} Somewhere in all of it, ${b.n} became your best friend. You don’t say it out loud. You don’t have to.`);lifeMoment(b.ic,`${b.n} became your best friend.`);return true}
  const s=LF_BF[k.id],kw=S.kwi;
  if(B.fight==null&&kw-B.since>=2){B.fight=kw;
    modal(`💢 A fight with ${k.n}`,`<p>${s.fight}</p><p>Now ${k.n} isn’t answering your texts, and the walk to school feels long.</p>`,
      [{l:'🙏 Apologize first, today',s:`Friendship with ${k.n} −2.`,fn:()=>{gFriend(k.id,-2);B.how='soon';say(`🙏 You say it at the lockers. ${k.n} says “okay” in a voice that means not yet.`)}},
       {l:'⏳ Give it some space',s:`Friendship with ${k.n} −4.`,fn:()=>{gFriend(k.id,-4);adj('mood',-2);B.how='space';say(`⏳ A week of not talking. It is the longest week of the year.`)}}],true);
    lifeMoment('💢',`A real fight with ${k.n}.`);return true}
  if(B.fight!=null&&B.make==null&&kw>B.fight){B.make=kw;gFriend(k.id,6);adj('mood',6);
    modal(`🤝 Making up with ${k.n}`,`<p>${s.make}</p><p>It’s better than before, somehow. Friendship +6.</p>`,[{l:'Best friends',fn:()=>{}}],true);
    lifeMoment('🤝',`Made up with ${k.n}. Best friends again.`);return true}
  if(B.make!=null&&B.big==null&&kw>B.make&&S.age>=16){B.big=kw;const m=s.big;
    modal(m.h,`<p>${m.b}</p>`,m.c.map(([l,e,t])=>({l,s:`${schFxTxt(e)}, friendship with ${k.n} +4.`,fn:()=>{schFx(e);gFriend(k.id,4);say(`${m.h.split(' ')[0]} ${t}`)}})),true);
    lifeMoment(m.h.split(' ')[0],m.h.replace(/^\S+\s/,'')+'.');return true}
  say(`${k.ic} ${s.show}`);return false}
// drifting apart and coming back
function lfBack(){const L=LS();for(const id in L.drift){if(L.back[id]!=null||S.kwi-L.drift[id]<2)continue;const k=gKid(id);if(!k)continue;
  L.back[id]=S.kwi;gFriend(id,5);say(`${k.ic} ${k.n} catches up with you at ${pick(['the courts at People’s','the corner market','the overlook','the Reading Room'])} like no time passed. “Where have you been?” “Where have <i>you</i> been?” Friendship +5.`);
  lifeMoment(k.ic,`${k.n} came back around.`);return true}return false}

// ---- family stories (one a key week, in age order; Nia is five years younger than you) ----
const LF_FAM=[
  {id:'dadjob',age:12,h:'⚓ Dad’s new job',b:'Dad starts a new job at the Port of Tacoma, driving a straddle carrier between the cranes. He leaves at 5:30 AM and is home by 3, which means he picks Nia up from school now and is very proud of it.',
    c:[['🥪 Pack his lunch for the first day',{family:6},'A sandwich, an apple and a note that says DON’T DROP ANY BOXES. He keeps the note in his hard hat.'],['🏗️ Ask him to show you the cranes from the overlook',{family:4,mood:4},'He points out his crane, a tiny orange one far below. He talks about it like it’s a horse.']]},
  {id:'niabike',age:13,h:'🚲 Nia learns to ride a bike',b:'Nia is eight and done with training wheels. She wants you, not Dad, to teach her, on the path at Wright Park.',
    c:[['🚲 Hold the seat and let go when she’s ready',{family:7,mood:4},'She makes it all the way to the big tree before she notices you let go. She screams with joy.'],['📱 Film it for Grandma',{family:5,mood:3},'Grandma watches it eleven times and sends back a voice message that is just cheering.']]},
  {id:'grandmavisit',age:14,h:'👵 Grandma comes to visit',b:'Grandma comes for a week. She’s slower on the stairs than last time, and she holds the rail now, but she still beats everyone at dominoes.',
    c:[['🍳 Cook her favorite with Mom',{family:6},'Grandma eats two plates and says it’s “almost” as good as hers.'],['📚 Ask her about when she was your age',{family:5,mood:4},'A whole evening of stories you’ve never heard. You write some of them down.']]},
  {id:'momjob',age:15,h:'🏥 Mom’s promotion',b:'Mom gets promoted to charge nurse at Tacoma General. New badge, more responsibility, a few late shifts. She acts calm about it and is not calm about it.',
    c:[['🎉 Plan a surprise dinner with Dad and Nia',{family:7},'Nia makes a sign: CHARGE NURSE (THE BOSS). Mom tears up at the door.'],['🧹 Take over a few of her chores',{family:5,energy:-4},'Tuesday dishes and Thursday laundry are yours now. She notices every time.']]},
  {id:'niaplay',age:15,h:'🎭 Nia’s school play',b:'Nia is ten and plays a tree in the fourth-grade play. She has one line. She has practiced it on you about three hundred times.',
    c:[['👏 Front row, loudest clapping',{family:6,mood:3},'She says her line, “The wind is coming!”, and looks straight at you.'],['💐 Bring her flowers from the corner market',{family:6,money:-6},'She holds them through the whole cast photo.']]},
  {id:'grandmamoves',age:16,h:'🏠 Grandma moves in',b:'Grandma is moving in with you, into the front room. She uses a cane now and says she doesn’t need it. Mom says it’s good for everybody, and it turns out she’s right.',
    c:[['📦 Carry boxes and set up her room',{family:7,energy:-6},'Her photos go on the wall by the window, facing the mountain, like your rocks did years ago.'],['☕ Start a morning tea with her before school',{family:6,mood:4},'Ten minutes every morning. She tells you one thing about her day before you tell her about yours.']]},
  {id:'niams',age:17,h:'🎒 Nia starts at Summit View',b:'Nia is twelve and starts seventh grade at Summit View. The same hill, the same front doors, the same nerves you had.',
    c:[['🚶 Walk her up the hill on the first day',{family:7,mood:4},'At the corner she says, “You can go now,” and then hugs you anyway.'],['🗺️ Give her your old map of the school',{family:6},'It’s soft as cloth. She puts it in her back pocket.']]},
  {id:'grandma80',age:17,h:'🎂 Grandma turns eighty',b:'Grandma turns eighty. The whole family on one couch and the cousins on a screen. She moves slower these days and naps after lunch, but she remembers every birthday in the family, including yours.',
    c:[['📷 Make her a photo album of the years on Hilltop',{family:8},'She turns the pages slowly and tells a story for every one.'],['🎶 Get everyone to sing, badly',{family:6,mood:5},'Tavita’s family hears it across the street and joins in.']]},
];
const lfNia=()=>Math.max(7,(S.age||12)-5);
function lfFamBeat(){const L=LS(),b=LF_FAM.find(x=>!L.fam[x.id]&&S.age>=x.age);if(!b||S.kwi<1)return false;L.fam[b.id]=S.kwi+1;
  modal(b.h,`<p>${b.b}</p>`,b.c.map(([l,e,t])=>schBtn({l,e,t:`${b.h.split(' ')[0]} ${t}`})),true);lifeMoment(b.h.split(' ')[0],b.h.replace(/^\S+\s/,'')+'.');return true}

// ---- trust: dinners, chores, home on time → freedoms ----
const lfTrust=()=>{const t=S.life&&S.life.tot||{};return Math.round((t.chores||0)+(t.dinners||0)-3*(t.curfew||0)+(LS().trust||0))};
const LF_TRUST_STEP=15;
function lfTrustFree(){const L=LS(),n=Math.floor(lfTrust()/LF_TRUST_STEP);L.tf=L.tf||0;if(n<=L.tf)return false;L.tf=n;
  const f=lsEarnFree();if(!f)return false;adj('family',3);
  say(`${f.ic} Mom and Dad have noticed: the dinners, the chores, home on time. “You’ve earned it,” Dad says. <b>${f.n}</b>: ${f.s}`);return true}

// ---- the first morning of a key week: one friend beat, one family beat, freedoms ----
LIFE_HOOKS.weekStart.push(kw=>{try{if(!isGrow()||!lsOn()||kw.kind==='graduation'||S.kwi<1)return;LS();
  lfBeat()||lfBack();lfFamBeat();lfTrustFree()}catch(e){console.error(e)}});

// ---- time skips: friends drift (unless you chose friends), and come back if you do; family stories and trust ----
LIFE_HOOKS.skip.push((from,to,ch,notes)=>{
  if(!isGrow()||!S.ls)return;const L=LS(),days=to-from+1,bf=L.bf;
  if(ch==='home')L.trust=(L.trust||0)+Math.round(days/14);
  if(ch==='friends'){for(const id in L.drift)if(L.back[id]==null){const k=gKid(id);if(!k)continue;L.back[id]=S.kwi;gFriend(id,5);notes.push(`${k.ic} You and ${k.n} find each other again: the courts, the curb, the old jokes.`)}}
  else if(days>=28){const k=KIDS.filter(x=>gMet(x.id)&&x.id!==bf&&L.drift[x.id]==null&&gF(x.id)>=5&&gF(x.id)<=13).sort((a,b)=>gF(a.id)-gF(b.id))[0];
    if(k){L.drift[k.id]=S.kwi;gFriend(k.id,-4);notes.push(`${k.ic} You see less of ${k.n} these days. Different classes, different lunch table. It happens.`)}}
  // family stories you were away for: a line each (told, not played: no stat changes)
  for(const b of LF_FAM)if(!L.fam[b.id]&&S.age>b.age){L.fam[b.id]=-1;const o=b.c[0];notes.push(`${b.h.split(' ')[0]} ${b.h.replace(/^\S+\s/,'')}: ${o[2]}`)}
});

// ---- dinners remember the family's stories ----
{const ah=GROW.actionsHere;GROW.actionsHere=()=>{const a=ah();if(!lsOn()||!S.ls)return a;const L=LS(),d=day();
  const out=a.map(x=>{if(x.l!=='Family dinner')return x;const f=x.fn;return Object.assign({},x,{fn:()=>{f();const t=lfDinner();if(t)say(t)}})});
  const k=lfBF();
  if(k&&S.loc==='home'&&L.over[S.kwi]==null&&gAt(900,gCurfew()-60))out.unshift({ic:k.ic,l:`${k.n} comes over`,s:`An hour, your best friend. Friendship with ${k.n} +3, mood +5. Once a key week.`,cat:'kids',fn:()=>{pass(60);L.over[S.kwi]=d;gFriend(k.id,3);adj('mood',5);say(`${k.ic} ${LF_BF[k.id].over}`)}});
  return out}}
function lfDinner(){const L=LS(),f=L.fam,o=[];
  if(f.dadjob)o.push('⚓ Dad tells a story about a seagull that rides his crane every morning.');
  if(f.momjob)o.push('🏥 Mom has a charge-nurse story she’s not allowed to tell, and tells half of it anyway.');
  if(f.grandmamoves)o.push('👵 Grandma says grace, then asks everybody one good thing about their day, like Dad used to.');
  if(L.lastCard&&L.lastCard.kind==='good')o.push('📄 Nia asks if she can put her spelling test on the fridge next to your report card.');
  o.push(`🧸 Nia, who is ${lfNia()}, explains something she learned today in great detail.`);
  return Math.random()<0.6?pick(o):''}

// ---- the Kids tab: your best friend, your people, your family ----
{const kv=GROW.kidsView;GROW.kidsView=()=>{const h=kv();if(!lsOn()||!S.ls)return h;const L=LS(),k=lfBF(),B=L.beats;
  const story=k?[B.since!=null?'best friends':'',B.fight!=null?'a fight':'',B.make!=null?'made up':'',B.big!=null?LF_BF[k.id].big.h.replace(/^\S+\s/,'').toLowerCase():''].filter(Boolean).join(' → '):'';
  const clubs=Object.keys(L.clubs).map(c=>LS_CLUBS[c]).filter(Boolean);
  const drift=Object.keys(L.drift).filter(id=>L.back[id]==null).map(id=>gKid(id)).filter(Boolean);
  const fam=LF_FAM.filter(b=>L.fam[b.id]).map(b=>b.h);
  return h+`<div class="sect">Your best friend</div>`+(k?`<div class="todo"><span class="ck">${k.ic}</span><div><b>${k.n} ${lfHearts(gF(k.id))} ${Math.round(gF(k.id))}/20</b><span>${story}.</span></div></div>`
    :`<div class="rules">Spend time with one kid until you’re really close (friendship 12 of 20), and they become your best friend.</div>`)
    +(clubs.length||drift.length?`<div class="sect">Your people</div><div class="rules">${clubs.map(c=>`${c.ic} ${c.pals.join(' and ')} from ${c.n.toLowerCase()}.`).join(' ')}${drift.length?` 🌫️ Drifted: ${drift.map(x=>x.n).join(', ')} (they may come back around).`:''}</div>`:'')
    +`<div class="sect">Your family</div><div class="rules">Mom, Dad, Nia (${lfNia()}) and Grandma.${fam.length?' '+fam.join(' · ')+'.':''} Trust at home: ${Math.max(0,lfTrust())} (dinners, chores, home on time; every ${LF_TRUST_STEP} earns a freedom).</div>`}}

// ---- the guide: new sections in the Growing up chapter ----
{const hg=helpGrowing;helpGrowing=function(){const h=hg();try{
  const add=`<h3>Classes and teachers</h3>
    <ul><li>Five subjects: ${LS_SUBJ.map(x=>`${x[2]} ${x[1]}`).join(', ')}, each 0 to 100 on the 📅 Week tab. A subject going up 5 moves your overall Grades up 1.</li>
    <li><b>📚 Do your homework</b> asks which subject (that subject +5). After school, <b>🍎 Office hours</b> with a teacher (+4). At the Reading Room, <b>📖 Study a subject</b> (+6).</li>
    <li>Teachers at Summit View: ${Object.values(LS_TEACH.middle).map(t=>t.n).join(', ')}. At Hilltop High: ${Object.values(LS_TEACH.high).map(t=>t.n).join(', ')}. The counselor is ${LS_COUNS.middle.n} at Summit View and ${LS_COUNS.high.n} at Hilltop High. Once in each school, the coach tells you they believe in you.</li></ul>
    <h3>Report cards</h3>
    <p>Twice a year, in late January and on the last day of school. An average of 82 or more is a good card: Family +6 and a new freedom. Under 60 is a talk at dinner, with a plan to bring the weakest subject up.</p>
    <h3>Clubs and teams</h3>
    ${hTable(['Club or team','After school'],Object.values(LS_CLUBS).map(c=>[`${c.ic} ${c.n}`,lsDayNames(c.days)]))}
    <p>Join one at the <b>📋 clubs and teams board</b> at school. After your fourth ${'practice or meeting'} in a school year comes its big moment: a home game, a competition, the Daffodil Parade, an art show, opening night or a front-page story.</p>
    <h3>Getting to school</h3>
    <p>Walk, take the bus, or ride the Link up MLK (once the T Line exists in your year). Switch at home. After three trips you know the route and it gets a few minutes faster.</p>
    <h3>Your track at 15</h3>
    ${hTable(['Track','At 18'],Object.values(LS_TRACK).map(t=>[`${t.ic} ${t.n}`,t.s.replace(/^.*?At 18: /,'')]))}
    <h3>Best friends</h3>
    <p>The kid you get closest to becomes your best friend, with a meter on the 🤝 Kids tab. They come over once a key week, and over the years there’s a fight, a make-up and a big moment of their own. Friends you don’t see in a long time skip can drift; see friends more, or wait, and they come back around. Club friends join your people.</p>
    <h3>Family and freedoms</h3>
    <p>Your family has stories of its own: Dad’s new job at the Port, Nia growing up, Mom’s promotion, Grandma getting older and moving in. Dinners and chores build trust at home, missed curfews cost it, and every ${LF_TRUST_STEP} points earns a freedom: ${LS_FREE.map(f=>f.n.toLowerCase()).join(', ')}.</p>`;
  return h.includes('<h3>Birthdays</h3>')?h.replace('<h3>Birthdays</h3>',add+'<h3>Birthdays</h3>'):h+add}catch(e){console.error(e);return h}}}
window.lfBeat=lfBeat;window.LF_FAM=LF_FAM;
