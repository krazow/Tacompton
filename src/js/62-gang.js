// ============================================================
//  TACOMPTON · THE GANG LIFE PATH (optional, longer games only: never Quick play)
//  A path a kid on Hilltop can be pulled toward, with real costs and ways out that are always reachable.
//  Content rules: invented names only, nothing graphic, no how-to, deaths off-screen, kids never rewarded with a weapon.
//
//  ---- Contract (other builders call these, guarded) ----
//    gangAdj({rep,heat,loyalty})  nudges the meters, clamps 0–100, safe to call any time (creates S.gang)
//    gangRank()   'lookout' | 'runner' | 'soldier' | 'og' | null          gangMember() → bool
//    gangOut(how) leave the crew: 'outreach' | 'art' | 'move' | 'prison' | 'mentor' (returns true if you were in)
//  State: S.gang (lazy) {rep, heat, loyalty, rank, member, invites, refused, closedUntil, out, outs, weeks, …}
//  Meters: Street Rep (respect on the block), Heat (police attention; fades when you lie low),
//          Loyalty (the crew's trust; low Loyalty brings threats from your own side). Shown on the Week tab once you have any rep.
//  Joining: recruitment events from 13, joining from 14 at Street Rep 30+, two invitations from an older member;
//           refusing both closes the door for a year. Initiation is one off-screen beat.
//  Era: a start year before 2000 (yearNow(), 63-era.js) means more recruitment and more Heat; otherwise today's Hilltop.
// ============================================================
(function(){
const GANG_RANKS=['lookout','runner','soldier','og'];
const GANG_RANK={
  lookout:{n:'Lookout',ic:'👀',age:14,rep:0,d:'Small cash, low Heat.',cash:10,heat:0.5},
  runner:{n:'Runner',ic:'🏃',age:15,rep:40,d:'More cash, more Heat, and school starts to slip.',cash:25,heat:1.5},
  soldier:{n:'Soldier',ic:'🛡️',age:16,rep:55,d:'The crew has your back, and you have theirs. The highest risk.',cash:40,heat:2.5},
  og:{n:'OG',ic:'🧢',age:21,rep:70,d:'Steady money, and younger kids follow your lead.',cash:80,heat:1},
};
const GANG_OUT={
  outreach:{ic:'🤝',n:'the Hilltop outreach program'},art:{ic:'🎨',n:'the glass-art studio'},move:{ic:'🚚',n:'a move away with family'},
  prison:{ic:'🔑',n:'prison, then reentry'},mentor:{ic:'🧭',n:'becoming a mentor'},
};
const gangBlank=()=>({rep:0,heat:0,loyalty:0,rank:null,member:false,invites:0,refused:0,closedUntil:-1,out:null,outs:[],weeks:0,joinedAge:null,
  tired:0,tense:0,linger:0,arrests:0,juv:0,record:false,arts:false,artsCareer:false,mentor:false,kids:0,injured:0,lostFriend:false,dead:false,moved:null,
  prison:null,best:null,noDiploma:false});
function gangS(){if(!S)return gangBlank();if(!S.gang||typeof S.gang!=='object')S.gang=gangBlank();const g=S.gang,b=gangBlank();for(const k in b)if(!(k in g))g[k]=b[k];return g}
const gangYear=()=>{try{return typeof yearNow==='function'?yearNow():2026}catch(e){return 2026}};
const gangEra89=()=>gangYear()<2000;
// the contract: nudge the meters (Heat rises faster in the 1989 era), always clamped
function gangAdj(o){
  const g=gangS();o=o||{};
  if(o.rep)g.rep=clamp(Math.round(g.rep+o.rep),0,100);
  if(o.heat)g.heat=clamp(Math.round(g.heat+(o.heat>0&&gangEra89()?o.heat*1.3:o.heat)),0,100);
  if(o.loyalty)g.loyalty=clamp(Math.round(g.loyalty+o.loyalty),0,100);
  return {rep:g.rep,heat:g.heat,loyalty:g.loyalty};
}
const gangRank=()=>{const g=S&&S.gang;return g&&g.member?g.rank:null};
const gangMember=()=>!!(S&&S.gang&&S.gang.member);
window.gangAdj=gangAdj;window.gangRank=gangRank;window.gangMember=gangMember;

// ---- helpers that work in both modes (Growing Up keeps S.family; the adult game keeps S.life.family) ----
const gFam=v=>{if(isGrow())adj('family',v);else if(S.life)S.life.family=clamp(Math.round(S.life.family+v),0,100)};
const gFamNow=()=>isGrow()?S.family:Math.round(S.life?S.life.family:60);
const gFeel=v=>{if(isGrow())adj('mood',v);else adj('stress',-v)};
const gGrades=v=>{if(!isGrow())return;S.grades=clamp(Math.round((S.grades==null?60:S.grades)+v),0,100)};
const gEnergy=v=>adj('energy',v);
const gCash=v=>money(Math.round(v));
const gKid=()=>S.age<18;
const gHome=()=>isGrow()?'Mom':'your family';
const gMoment=(ic,t)=>{if(typeof lifeMoment==='function')lifeMoment(ic,t)};
const gOn=()=>!!S&&!S.over&&lifeLong()&&!gangS().dead&&!gangS().moved;
const gBestName=()=>{try{const b=typeof gBest==='function'&&isGrow()?gBest():null;return b?b.n:(S.life&&S.life.grow&&S.life.grow.best)||null}catch(e){return null}};
// the crime builder's punishment ladder (60-crime.js), when it's there
function gangOffense(id,o){
  const g=gangS();g.arrests++;g.record=true;
  if(typeof crimeOffense==='function'){try{return crimeOffense(id,o)||null}catch(e){console.error(e)}}
  return null;
}
const gangHasRecord=()=>{try{if(typeof crimeHasRecord==='function'&&crimeHasRecord())return true}catch(e){}return gangS().record};

// ---- joining ----
function gangCanRecruit(){const g=gangS();return gOn()&&S.age>=13&&!g.member&&!g.out}
function gangCanJoin(){const g=gangS();return gOn()&&S.age>=14&&!g.member&&!g.out&&day()>=g.closedUntil}
function gangInviteOpen(){const g=gangS();return gangCanJoin()&&g.rep>=30&&g.invites<2}
function gangRefuse(){
  const g=gangS();g.refused++;gangAdj({rep:-3});
  if(g.refused>=2){g.closedUntil=day()+365;g.invites=0;g.refused=0;gMoment('🚪','Said no to the crew twice. The door closed, for a while.');return 'closed'}
  return 'once';
}
function gangCss(){if(document.getElementById('gangcss'))return;const s=document.createElement('style');s.id='gangcss';
  s.textContent='.gang-fade{animation:gangFade 2.6s ease-out forwards}@keyframes gangFade{0%{opacity:1}100%{opacity:.4}}.rm .gang-fade{animation:none;opacity:.6}.gang-m .kv b{font-variant-numeric:tabular-nums}';
  document.head.appendChild(s)}
function gangJoin(){
  if(!gangCanJoin())return false;
  const g=gangS();g.member=true;g.rank='lookout';g.joinedAge=S.age;g.loyalty=Math.max(g.loyalty,50);g.tired=7;
  gangAdj({rep:20});gFam(-20);S.energy=clamp(S.energy-40,0,100);
  gMoment('🌑',`Joined the crew at ${S.age}.`);
  gangCss();
  modal('🌑 That night',`<p class="gang-fade">That night happens off-screen. You come home late and quiet, and you don’t talk about it. You’re in.</p>
    <p style="font-size:13px;color:var(--mute)">Street Rep +20 · Family −20 · You’re worn out for a week.</p>`,[{l:'Morning comes',fn:()=>{}}],true);
  return true;
}

// ---- ranks: by age and Street Rep, only ever up while you're in ----
function gangRankFor(age,rep){let r=null;for(const k of GANG_RANKS){const R=GANG_RANK[k];if(age>=R.age&&rep>=R.rep)r=k}return r}
function gangPromote(){
  const g=gangS();if(!g.member)return null;
  const r=gangRankFor(S.age,g.rep);
  if(r&&GANG_RANKS.indexOf(r)>GANG_RANKS.indexOf(g.rank)){g.rank=r;const R=GANG_RANK[r];gMoment(R.ic,`Became a ${R.n.toLowerCase()==='og'?'OG':R.n.toLowerCase()} in the crew, at ${S.age}.`);
    say(`${R.ic} The older guys start treating you different. You’re a <b>${R.n}</b> now. ${R.d}`);return r}
  return null;
}
// graduation odds: weeks in the crew and slipping grades take them down
function gangGradOdds(){const g=gangS();if(!g.weeks)return 1;const gr=S.grades==null?60:S.grades;
  return clamp(Math.round((0.95-g.weeks*0.004-Math.max(0,55-gr)*0.008)*100)/100,0.2,0.95)}

// ---- the weekly costs of being in (each key week, and in every time skip by the number of weeks) ----
function gangWeek(n,notes){
  const g=gangS();n=n||1;
  if(g.member){
    const R=GANG_RANK[g.rank]||GANG_RANK.lookout,i=GANG_RANKS.indexOf(g.rank);
    g.weeks+=n;
    gGrades(-Math.min(14,Math.round(n*(1+(i>=1?0.6:0)))));          // grades drop every week; a runner's attendance falls too
    gFam(-Math.min(16,Math.round(n*1.5)));
    if(isGrow()&&i>=1&&S.sch&&typeof S.sch.skips==='number')S.sch.skips+=Math.min(6,Math.ceil(n/3));
    gangAdj({heat:Math.max(-25,Math.min(25,Math.round(n*(R.heat-1.5)))),rep:Math.min(10,n),loyalty:-Math.min(10,Math.round(n*0.5))});
    const cash=Math.round(R.cash*n);gCash(cash);
    if(g.rank==='soldier')gFeel(Math.min(4,n));                       // protection: nobody on the block tries you
    if(notes&&n>1)notes.push(`${R.ic} ${n} weeks as a ${R.n==='OG'?'OG':R.n.toLowerCase()}: ${$(cash)} from the crew, and it never feels like yours. ${isGrow()?`Grades ${S.grades}, Family ${S.family}.`:''} Heat ${g.heat}.`);
  }else{
    if(g.heat)gangAdj({heat:-Math.min(40,n*4)});                       // lying low: Heat fades
    if(g.rep&&!g.out)gangAdj({rep:-Math.min(10,Math.round(n*0.5))});
    if(g.mentor&&notes&&n>1){const k=Math.max(1,Math.round(n/8));g.kids+=k;adj('community',Math.min(6,k));notes.push(`🧭 You kept showing up at the outreach program: ${k} more kid${k===1?'':'s'} who stayed off the corner, for now. Community +${Math.min(6,k)}.`)}
    if(g.artsCareer&&!isGrow()&&n>1){const c=Math.round(n*25);gCash(c);if(notes)notes.push(`🎨 Glass pieces sold at the studio’s shows and the Saturday market: ${$(c)}.`)}
    else if(g.arts&&isGrow()&&n>1){gFeel(Math.min(5,n));if(notes)notes.push('🎨 Afternoons at the glass-art studio. Your first bowl is lopsided, and Mom puts it on the windowsill anyway.')}
  }
}
// in a time skip: costs by the week, then what the crew notices
LIFE_HOOKS.skip.push((from,to,ch,notes)=>{
  if(!lifeLong()||!S.gang)return;
  const g=gangS(),n=Math.max(1,Math.round((to-from+1)/7));
  g.tired=0;gangWeek(n,notes);
  if(g.member){if(g.heat>=75)chain('gang_sweep');if(gKid()&&isGrow()&&gFamNow()<=20)chain('gang_parent_move')}
  if(g.member)gangPromote();
});
LIFE_HOOKS.weekStart.push(()=>{if(!S.gang||!lifeLong())return;const g=gangS();if(g.member){gangPromote();gangWeek(1)}});
LIFE_HOOKS.birthday.push(()=>{if(S.gang&&gangS().member)gangPromote()});
// mornings: the week after initiation is a tired one, and Heat fades when you lie low
{const lm=lifeMorning;lifeMorning=function(d){lm(d);if(!S||!S.gang||!lifeLong())return;const g=gangS();
  if(g.tired>0){g.tired--;gEnergy(-15)}
  if(g.heat>0&&g.last!==d-1)gangAdj({heat:-1})}}
const gActed=()=>{gangS().last=day()};

// ---- leaving: every way out costs Loyalty and brings a few tense weeks ----
function gangOut(how){
  const g=gangS(),was=g.member;
  if(!GANG_OUT[how])return false;
  if(was){g.member=false;g.loyalty=clamp(g.loyalty-40,0,100);g.tense=3;g.linger=how==='move'?0:3;g.out=how;g.outs.push({how,age:S.age,rank:g.rank})}
  else if(!g.outs.some(o=>o.how===how))g.outs.push({how,age:S.age,rank:null,before:g.joinedAge==null});
  if(how==='art')g.arts=true;
  if(how==='mentor')g.mentor=true;
  if(how==='outreach'||how==='art'){gangAdj({heat:-15});if(!was)gangAdj({rep:-15})}
  const O=GANG_OUT[how];
  if(was)gMoment(O.ic,`Left the crew at ${S.age}: ${O.n}.`);
  return was;
}
window.gangOut=gangOut;
function gangOutreach(){
  const was=gangOut('outreach');
  say(`🤝 Ms. Denise from a Hilltop outreach program meets you at People’s Community Center. She doesn’t lecture. She asks what you want your life to look like in five years, writes it down, and gives you her number. ${was?'Leaving isn’t free: the crew will feel it, and the next few weeks will be tense. She says she’ll walk you through them.':'She says you can call any time, day or night.'}`);
  gFeel(4);gFam(was?6:2);return was;
}
function gangArt(){
  const was=gangOut('art');
  say(`🎨 The glass-art studio on Hilltop runs free classes for kids and young people. Mr. Ruiz hands you safety glasses and puts you on the bench next to a girl who’s been coming for two years. ${was?'You tell the crew you’re done. It goes over badly, and you go back to the studio the next day anyway.':'The furnace roars, and for two hours nothing else is in your head.'}`);
  gFeel(5);if(gKid())gFam(3);return was;
}
function gangMentor(){
  const g=gangS();gangOut('mentor');g.mentor=true;adj('community',6);
  gMoment('🧭','Became a mentor at the outreach program: the one who keeps the next kid out.');
  say('🧭 The outreach program asks if you’ll talk to the kids who remind you of you. You say yes. You don’t tell war stories. You tell them about the people you lost, the years that went, and how you got out. Community +6.');
}
const gangMentorOpen=()=>{const g=gangS();return !g.mentor&&S.age>=21&&(g.rank==='og'||g.outs.some(o=>!o.before))};

// ---- moving away: the end of the Hilltop chapter, and a fresh start somewhere else ----
const GANG_TOWNS=['Federal Way','Lakewood','Puyallup','Olympia','Spanaway'];
function gangMoveAway(forced){
  const g=gangS(),to=pick(GANG_TOWNS);gangOut('move');g.moved={to,age:S.age,forced:!!forced};
  gFam(10);gMoment('🚚',`${gKid()?'The family moved':'Moved'} to ${to} for a fresh start, at ${S.age}.`);
  endLife('moved');
  const el=document.querySelector('.life-sum');
  if(el){const h=el.querySelector('h1'),p=el.querySelector('p');
    if(h)h.textContent='The Hilltop chapter ends';
    if(p)p.innerHTML=withName(`${gKid()?`${forced?'Mom made the call':'You and Mom made the call together'}: a smaller place in ${to}, a new school, a new bus route, nobody who knows your name yet.`:`A room near a cousin in ${to}, a new job and nobody who knows your old name.`} {{name}}, age ${S.age}: a fresh start. You still call Hilltop home when people ask.`)}
  return to;
}
{const ls=window.lifeToScore;window.lifeToScore=()=>{if(S&&S.life&&S.life.ended==='moved'&&S.gang&&S.gang.moved)return endScreen('{{name}}: a fresh start',`The Hilltop chapter ended at ${S.age}, with a move to ${S.gang.moved.to}.`);return ls()}}

// ---- arrests: juvenile detention under 18 (with diversion), adult charges from 18 ----
function gangArrest(){
  const g=gangS(),kid=gKid();
  const r=gangOffense('gang_sweep',{label:kid?'picked up in a police sweep':'charged after a police sweep',sev:kid?2:3,kid,stress:10,family:-10});
  gangAdj({heat:-30,rep:3});gFam(-10);
  if(kid){g.juv++;gGrades(-5);gEnergy(-20);
    gMoment('🚓',`Picked up in a police sweep at ${S.age}: three days at Remann Hall, the county’s juvenile detention center.`);
    return {kid:true,text:`🚓 A police sweep on the block. You’re one of the kids they pick up. Three days at Remann Hall, Pierce County’s juvenile detention center, then a day in juvenile court with ${gHome()} in the second row, not looking at you. The judge offers diversion: a program instead of a record, if you see it through.${r&&r.text?' '+r.text:''}`}}
  adj('stress',12);
  gMoment('⚖️',`Charged as an adult at ${S.age}, after a police sweep.`);
  return {kid:false,text:`⚖️ A police sweep, and this time you’re 18 or older: adult charges. A public defender with forty other cases meets you for ten minutes and lays it out plainly.${r&&r.text?' '+r.text:''}`};
}
const gangYears=()=>{const g=gangS(),i=GANG_RANKS.indexOf(g.rank);return clamp(1+Math.max(0,i-1)+(g.arrests>1?1:0),1,5)};
// prison and reentry: the years pass in one time skip, then a hard restart with a record
function gangPrison(years){
  const g=gangS();years=years||gangYears();
  if(g.member)gangOut('prison');else if(!g.outs.some(o=>o.how==='prison'))g.outs.push({how:'prison',age:S.age,rank:null});
  g.out='prison';g.record=true;
  const age0=S.age,target=day()+Math.round(years*365.25);
  let i=S.keyWeeks.findIndex((k,j)=>j>S.kwi&&k.start>=target);if(i<0)i=S.keyWeeks.length-1;
  if(i<=S.kwi){gMoment('🔑',`Sentenced to ${years} year${years===1?'':'s'} at ${age0}. The game ends before the sentence does.`);endLife('prison');return null}
  const nk=S.keyWeeks[i];
  for(let a=S.age+1;lifeBday(S,a)<nk.start;a++)lifeBirthday(a,false);
  g.prison={years,from:age0,to:S.age};
  // the hard restart: a record, almost no money, a reentry job
  if(!isGrow()){S.money=Math.min(S.money,150);S.stress=55;S.community=Math.max(3,Math.round(S.community/3));S.standing=40;
    if(JOBS.kitchen){S.job='kitchen';S.alarm=JOBS.kitchen.alarm;S.career=null;S.life.jobs.push({job:'kitchen',ic:'🔑',t:'reentry job on the line, Odessa’s on MLK',age:S.age})}
    S.life.family=clamp(S.life.family-10,0,100);S.life.path=S.life.path==='college'||S.life.path==='trade'?'job':S.life.path;S.life.parttime=false}
  gMoment('🔑',`Came home at ${S.age} after ${years} year${years===1?'':'s'} away, with a record and a reentry program’s number.`);
  modal(`⏩ ${years} year${years===1?'':'s'}`,`<p>The years go by off the page. Letters from home, fewer each year. A GED class. A cellmate who teaches you chess.</p>
    <p>You come home at <b>${S.age}</b> with a record, a bus pass and the number for a reentry program. The crew you knew is mostly gone: moved, locked up, or worse. A soul-food kitchen on MLK hires people coming home. You start Monday.</p>
    <div class="kv"><span>📜 Record</span><b>Background checks will show it</b></div><div class="kv"><span>🎂 Age</span><b>${age0} → ${S.age}</b></div>`,
    [{l:`▶️ Start over: ${kwName(nk)}`,fn:()=>lifeEnter(i)}],true);
  return i;
}

// ---- death: the game ends with a memorial ----
function gangMemorial(){
  const g=gangS(),b=gBestName(),fam=isGrow()?'Mom, Dad, Nia and Grandma':'Your family';
  const who=[fam,b?`${b}, your best friend`:null,g.outs.some(o=>o.how==='outreach')||g.lostFriend?'Ms. Denise from the outreach program':null,g.arts?'Mr. Ruiz from the glass-art studio':null].filter(Boolean);
  return `<h1>In memory of {{name}}</h1><p>${fullDate(0).slice(4)} on Hilltop, at ${S.startAge}, to ${fullDate(day())}, at ${S.age}.</p>
    <p>A folding table at the park on Saturday, with photos, a school picture and candles in jars. Nobody talks about how. They talk about who you were before, and who you could have been.</p>
    <div class="sect">The people you left behind</div>${who.map(w=>`<p>${w}.</p>`).join('')}
    <p style="font-size:13px;color:var(--mute)">Every name on that table had someone who tried. If this story is close to yours, a Hilltop outreach program, a teacher or a coach will listen.</p>`;
}
function gangDie(){
  const g=gangS();g.dead=true;g.member=false;gMoment('🕯️',`Gone at ${S.age}.`);
  const prev=LIFE_HOOKS.memorial;LIFE_HOOKS.memorial=gangMemorial;
  try{endLife('death')}finally{LIFE_HOOKS.memorial=prev}
}

// ---- the events (a wrapper: the longer games only, never Quick play; the 1989 era recruits more) ----
const GANG_IDS=[];
function gev(e){
  GANG_IDS.push(e.id);const c=e.cond,ch=e.chance==null?0.1:e.chance;
  defEvent(Object.assign({hook:'wake',cooldown:5,max:99},e,{
    chance:ctx=>(typeof ch==='function'?ch(ctx):ch)*(e.recruit&&gangEra89()?1.6:1),
    cond:ctx=>gOn()&&(!c||c(ctx))}));
}
const rankIs=(...r)=>()=>gangMember()&&r.includes(gangS().rank);
// "go" with a risk: Heat brings a sweep, the Soldier's nights bring injury and, rarely, worse
function gGo(o){gActed();gangAdj({rep:o.rep||4,heat:o.heat||4,loyalty:o.loyalty||6});if(o.cash)gCash(o.cash);if(o.fam)gFam(o.fam);if(o.grades)gGrades(o.grades);if(o.energy)gEnergy(o.energy);
  const g=gangS();if(g.heat>=70&&Math.random()<(g.heat-60)/200)chain('gang_sweep');
  if(o.risk&&S.age>=16){const r=Math.random();if(r<o.risk*0.12){chain('gang_dead');return 'dead'}if(r<o.risk){chain('gang_hurt');return 'hurt'}}
  return 'ok'}
function gStay(o){gangAdj({loyalty:-(o&&o.loyalty||8)});if(o&&o.fam)gFam(o.fam);gFeel(o&&o.feel||2)}

// ---- recruitment (13+): the corner notices you ----
gev({id:'gang_notice',recruit:true,tile:['👀','The older kids on the corner','info'],chance:0.12,cooldown:10,max:4,
  cond:()=>gangCanRecruit()&&gKid()&&!gangS().arts,
  run:()=>say(`👀 Tavon, an older guy from the block, nods at you outside the corner store on MLK. A couple of the kids your age are with him. ${gangEra89()?'Pagers buzz on belts up and down the block.':'Phones out, music loud.'} “You good, little man?” He knows your name.`),
  choices:()=>[
    {ic:'🧍',l:'Hang around a minute',s:'Street Rep +5. The corner starts to know you.',fn:()=>{gangAdj({rep:5});gFeel(1);say('🧍 You stand with them a minute. Nobody asks for anything. That’s how it starts.')}},
    {ic:'🚶',l:'Nod back and keep walking',s:'Nothing changes.',fn:()=>say('🚶 You nod and keep walking. He doesn’t push it. Today.')},
    {ic:'🏀',l:'Head to People’s instead',s:'Street Rep −2, mood up.',fn:()=>{gangAdj({rep:-2});gFeel(3);say('🏀 Pickup ball at People’s Community Center until the lights go off.')}},
  ],dflt:1});
gev({id:'gang_lookout',recruit:true,tile:['🧱','Watch the block a while','info'],chance:0.1,cooldown:9,max:5,
  cond:()=>gangCanRecruit()&&gKid()&&gangS().rep>=5,
  run:()=>say('🧱 Tavon asks if you’ll hang out by the wall on the corner for a while and let him know if anything changes on the block. Twenty dollars, he says, for doing nothing.'),
  choices:()=>[
    {ic:'💵',l:'Do it',s:'$20, Street Rep +10, Heat +3, Family −2.',fn:()=>{gActed();gCash(20);gangAdj({rep:10,heat:3});gFam(-2);say('💵 An hour by the wall. Nothing happens. The twenty feels heavier than it should, and you hide it in a sock drawer.')}},
    {ic:'🏠',l:'Say you have to get home',s:'Family +1.',fn:()=>{gFam(1);say('🏠 “Gotta get home.” He shrugs. “Another time.”')}},
    {ic:'🗣️',l:`Tell ${isGrow()?'Grandma':'someone you trust'} about it`,s:'Family +3, Street Rep −5.',fn:()=>{gFam(3);gangAdj({rep:-5});say(`🗣️ ${isGrow()?'Grandma listens to the whole thing without interrupting, then says she’ll walk you to the bus for a while.':'Saying it out loud makes it smaller.'}`)}},
  ],dflt:1});
// the invitations (14+, Street Rep 30+): two of them; refusing both closes the door for a year
gev({id:'gang_invite',recruit:true,tile:['🤝','Tavon has a question','info'],chance:0.25,cooldown:14,max:99,priority:2,
  cond:()=>gangInviteOpen(),
  run:()=>{const g=gangS();g.invites++;say(g.invites===1?'🤝 Tavon walks with you a block. “People been noticing you. The crew could use somebody like you. Family looks out for family.” He lets it hang there.'
    :'🤝 Tavon again, quieter this time. “I asked you once. I’m asking one more time. After this I stop asking.”')},
  choices:()=>[
    {ic:'✊',l:'Say yes',s:'You’re in. Street Rep +20, Family −20, and the costs start every week.',fn:()=>{gangJoin()}},
    {ic:'✋',l:'Say no',s:gangS().refused>=1?'The second no closes the door for a year.':'He’ll ask once more.',fn:()=>{const r=gangRefuse();gFeel(2);
      say(r==='closed'?'✋ “Alright.” He means it. The door closes, and nobody on the corner looks your way for a long time.':'✋ “Think on it,” he says, and walks off.')}},
  ],dflt:1});

// ---- Lookout ----
gev({id:'gang_l_night',tile:['🌙','The crew needs you tonight','info'],chance:0.15,cooldown:4,cond:rankIs('lookout'),
  run:()=>say('🌙 A text after dinner: the crew needs eyes on the block tonight. Just stand around. Same as always.'),
  choices:()=>[
    {ic:'🌙',l:'Go',s:'$15, Street Rep +4, Loyalty +6, Heat +3. Family −3, energy −10.',fn:()=>{gGo({cash:15,rep:4,heat:3,loyalty:6,fam:-3,energy:-10});say('🌙 Two hours in the cold. A patrol car rolls by slow, twice. You get home after midnight and lie awake.')}},
    {ic:'🏠',l:'Don’t go',s:'Loyalty −8. Family and mood up a little.',fn:()=>{gStay({fam:2});say('🏠 You say you can’t get out. A thumbs-down emoji, then nothing. Dinner with the family is quiet and good.')}},
  ],dflt:1});
gev({id:'gang_l_hold',tile:['🎒','Hold something for a day','info'],chance:0.1,cooldown:6,cond:rankIs('lookout'),
  run:()=>say('🎒 Tavon hands you a backpack. “Hold this till tomorrow. Don’t open it.” You don’t ask.'),
  choices:()=>[
    {ic:'🎒',l:'Hold it',s:'$20, Loyalty +8, Heat +6. You won’t sleep well.',fn:()=>{gGo({cash:20,rep:3,heat:6,loyalty:8,energy:-8});say('🎒 It sits under your bed all night like it’s ticking. He picks it up the next day and gives you twenty without a word.')}},
    {ic:'✋',l:'Say you can’t keep it at home',s:'Loyalty −10.',fn:()=>{gStay({loyalty:10});say('✋ “My mom goes through my room.” He looks at you a long second, then takes it back.')}},
  ],dflt:1});

// ---- Runner (15+) ----
gev({id:'gang_r_run',tile:['🏃','A run across town','info'],chance:0.14,cooldown:4,cond:rankIs('runner'),
  run:()=>say('🏃 The crew needs you tonight: something has to get across town, and they need someone the police don’t know yet.'),
  choices:()=>[
    {ic:'🏃',l:'Go',s:'$40, Street Rep +5, Loyalty +6, Heat +6. Grades −2, energy −12.',fn:()=>{gGo({cash:40,rep:5,heat:6,loyalty:6,grades:-2,energy:-12});say('🏃 A long bus ride with your heart in your throat, a door that opens just enough, and back. Forty dollars and a feeling you can’t shake.')}},
    {ic:'📚',l:'Say you’ve got a test tomorrow',s:'Loyalty −8. Grades +1.',fn:()=>{gStay();gGrades(1);say('📚 “A test.” They laugh at you in the group chat. You study anyway, and it helps more than you expect.')}},
  ],dflt:1});
gev({id:'gang_r_school',tile:['🏫','They need you during school','info'],chance:0.12,cooldown:6,cond:()=>rankIs('runner','soldier')()&&isGrow()&&isSchoolDay(),
  run:()=>say('🏫 A text at 7 AM: they need you this morning. School can wait, they say.'),
  choices:()=>[
    {ic:'🚪',l:'Skip school and go',s:'$30, Loyalty +6, Heat +4. Grades −4, Family −5: the attendance line calls home.',fn:()=>{gGo({cash:30,rep:3,heat:4,loyalty:6,grades:-4,fam:-5});if(S.sch&&typeof S.sch.skips==='number')S.sch.skips++;
      say('🚪 You skip. At 3 the attendance line calls home, and Mom hears it on her break. The look at dinner is worse than yelling.')}},
    {ic:'🎒',l:'Go to school',s:'Loyalty −8.',fn:()=>{gStay();gGrades(1);say('🎒 You go to class. Your phone buzzes in your pocket all through first period. You don’t look.')}},
  ],dflt:1});
gev({id:'gang_r_car',tile:['🚗','A car waiting after school','info'],chance:0.1,cooldown:7,cond:rankIs('runner'),
  run:()=>say('🚗 A car you don’t know idles across from the school after the last bell. Somebody from the crew leans out and waves you over.'),
  choices:()=>[
    {ic:'🚗',l:'Get in',s:'$25, Loyalty +6, Heat +5, Family −3.',fn:()=>{gGo({cash:25,rep:4,heat:5,loyalty:6,fam:-3});say('🚗 A few hours of driving around and waiting outside places. You don’t see much. That’s the point.')}},
    {ic:'🚌',l:'Take the bus home with a friend',s:'Loyalty −8, mood up.',fn:()=>{gStay({feel:3});say('🚌 You pretend not to see the wave and climb on the bus with your friends. The car pulls away.')}},
  ],dflt:1});

// ---- Soldier (16+): protection, retaliation, the highest risk ----
gev({id:'gang_s_back',tile:['🔥','Something happened to one of ours','bad'],chance:0.12,cooldown:5,cond:rankIs('soldier'),
  run:()=>say('🔥 Somebody from the crew got hurt last night, and everybody knows who did it. The crew needs you tonight. Nobody says for what.'),
  choices:()=>[
    {ic:'🌑',l:'Go',s:'Loyalty +10, Street Rep +6, Heat +10. The biggest risk there is.',fn:()=>{const r=gGo({rep:6,heat:10,loyalty:10,fam:-5,energy:-15,risk:0.2});
      say(r==='ok'?'🌑 The night goes by in a blur you won’t talk about. You come home before dawn and sit on the floor of the shower a long time.':'🌑 The night goes wrong. You don’t remember all of it.')}},
    {ic:'🏠',l:'Stay home',s:'Loyalty −12. You’re safe tonight, and they’ll remember.',fn:()=>{gStay({loyalty:12,fam:3});say('🏠 You turn your phone face-down and sit with Nia while she does homework. Every car outside makes you look up.')}},
    {ic:'📞',l:'Call the outreach worker',s:'Leave the crew with Ms. Denise’s help. Loyalty −40, a few tense weeks.',fn:()=>gangOutreach()},
  ],dflt:1});
gev({id:'gang_s_protect',tile:['🛡️','Walk someone home','info'],chance:0.1,cooldown:7,cond:rankIs('soldier'),
  run:()=>say('🛡️ A younger kid from the block is scared to walk home past the park. The crew says you’re his protection now.'),
  choices:()=>[
    {ic:'🛡️',l:'Walk him home',s:'Street Rep +5, Loyalty +5, Heat +2.',fn:()=>{gGo({rep:5,heat:2,loyalty:5});say('🛡️ He talks the whole way about video games. At his door he says thanks like you’re a hero. You don’t feel like one.')}},
    {ic:'📣',l:'Tell him to go to People’s instead',s:'Loyalty −6. He gets a ride from a coach.',fn:()=>{gStay({loyalty:6});say('📣 You send him to People’s Community Center, where a coach gives him a ride. Better him than you, walking.')}},
  ],dflt:0});
// the one a kid must never get rewarded for: fear, a scare, and an adult stepping in
gev({id:'gang_s_hold',tile:['😨','Something heavy in a hoodie','bad'],chance:0.06,cooldown:30,max:1,cond:()=>rankIs('soldier','runner')()&&gKid(),
  run:()=>say('😨 Somebody from the crew pushes a hoodie, wrapped tight around something heavy, at you. “Hold this. Keep it close.” You know what it is.'),
  choices:()=>[
    {ic:'😨',l:'Take it',s:'You’ll be scared every minute. Someone will have to step in.',fn:()=>{gActed();gangAdj({heat:10,loyalty:5});gFam(-5);gFeel(-10);
      say(`😨 You take it, and the fear doesn’t stop. That night a patrol car slows outside your house and your heart nearly gives out. In the morning ${isGrow()?'Grandma finds the hoodie':'someone you trust finds out'}. She calls Ms. Denise from the outreach program, who comes over, takes it out of your life, and sits with you at the kitchen table until your hands stop shaking. Nobody yells. That’s almost worse.`)}},
    {ic:'✋',l:'Say no',s:'Loyalty −12. Your hands shake anyway.',fn:()=>{gStay({loyalty:12});gFeel(-2);say('✋ “No.” You say it before you can think. He looks at you a long time, then walks off with it.')}},
    {ic:'📞',l:'Walk away and call Ms. Denise',s:'Leave the crew with the outreach program. Loyalty −40, a few tense weeks.',fn:()=>gangOutreach()},
  ],dflt:1});

// ---- OG (21+): steady money, younger kids follow your lead ----
gev({id:'gang_og_pay',tile:['💵','The money keeps coming','info'],chance:0.14,cooldown:7,cond:rankIs('og'),
  run:()=>say('💵 An envelope, same as every week. You’re the one who sits back now, and the younger ones do the running.'),
  choices:()=>[
    {ic:'💵',l:'Take it',s:'$120, Heat +3, Loyalty +4.',fn:()=>{gGo({cash:120,rep:2,heat:3,loyalty:4});say('💵 You take it. It pays the rent, and it costs something you can’t name.')}},
    {ic:'🤲',l:'Take less, stay further back',s:'$40, Loyalty −6, Heat −3.',fn:()=>{gCash(40);gangAdj({loyalty:-6,heat:-3});gFeel(2);say('🤲 You take less and keep your distance. The young ones notice.')}},
  ],dflt:0});
gev({id:'gang_og_kids',tile:['🧒','The younger kids are watching you','info'],chance:0.12,cooldown:10,cond:rankIs('og'),
  run:()=>say('🧒 Three boys, twelve or thirteen, hang around your stoop. They dress like you and laugh at your jokes. They’d do anything you said.'),
  choices:()=>[
    {ic:'🎨',l:'Send them to the studio and People’s',s:'Loyalty −8, community up. The mentor path opens.',fn:()=>{const g=gangS();g.kids+=3;gangAdj({loyalty:-8});adj('community',3);gMoment('🧒','Sent three kids off the stoop to the glass-art studio and People’s.');say('🎨 “Get out of here. Go to the glass studio, go play ball. I’m serious.” They go. Two of them come back the next week to show you a bowl they made.')}},
    {ic:'🧍',l:'Let them hang around',s:'Street Rep +5, Heat +4. They’ll follow you in.',fn:()=>{gGo({rep:5,heat:4,loyalty:4});say('🧍 You let them stay. One of them reminds you of yourself at thirteen, and you don’t like the feeling.')}},
  ],dflt:0});
gev({id:'gang_og_sit',tile:['🌙','A sit-down tonight','info'],chance:0.1,cooldown:7,cond:rankIs('og'),
  run:()=>say('🌙 The crew needs you tonight: the young ones and another crew are close to something, and they want an older head in the room.'),
  choices:()=>[
    {ic:'🌙',l:'Go',s:'Loyalty +8, Heat +5. It might calm things down, or not.',fn:()=>{gGo({rep:3,heat:5,loyalty:8,risk:0.08});adj('stress',6);say('🌙 Hours of talking in a parked car. Nobody gets what they want. Nobody gets hurt tonight, either.')}},
    {ic:'🏠',l:'Stay out of it',s:'Loyalty −8.',fn:()=>{gStay();say('🏠 You stay home. Your phone buzzes until 2 AM.')}},
  ],dflt:1});

// ---- the costs that come for you ----
gev({id:'gang_sweep',tile:['🚓','A police sweep','bad'],chance:ctx=>Math.max(0,(gangS().heat-60)/150),cooldown:21,urgent:true,priority:3,
  cond:()=>gangMember()&&gangS().heat>=50,
  run:()=>{const r=gangArrest();gangS().lastSweep=r.kid;say(r.text)},
  choices:()=>gKid()||gangS().lastSweep?[
    {ic:'🤝',l:'Take diversion and the outreach program',s:'No record if you finish it. You leave the crew: Loyalty −40, a few tense weeks.',fn:()=>{gangOutreach();gFam(6);say('🤝 You sign the diversion papers. Ms. Denise is your case worker. Mom drives you to the first meeting and waits in the car the whole hour.')}},
    {ic:'↩️',l:'Go back to the crew',s:'Loyalty +10. The next time, it won’t be juvenile court.',fn:()=>{gangAdj({loyalty:10,rep:3});gFam(-5);say('↩️ You go back. The crew acts like you passed a test. Mom stops asking where you go.')}},
  ]:[
    {ic:'⚖️',l:'Take the plea',s:`About ${gangYears()} year${gangYears()===1?'':'s'}. Then home, with a record.`,fn:()=>{setTimeout(()=>gangPrison(gangYears()),0)}},
    {ic:'🏛️',l:'Go to trial',s:'A chance it gets thrown out. If not, a longer sentence.',fn:()=>{if(Math.random()<0.35){gangAdj({heat:-10});adj('stress',8);say('🏛️ The judge throws the case out on a technicality. You walk out of the County-City Building into the rain, shaking.')}else setTimeout(()=>gangPrison(gangYears()+1),0)}},
  ],dflt:0});
gev({id:'gang_hurt',tile:['🏥','A night at Tacoma General','bad'],chance:0,cooldown:0,urgent:true,priority:3,cond:()=>gangMember(),
  run:()=>{const g=gangS();g.injured++;gEnergy(-40);gFam(-6);gFeel(-8);if(!isGrow())money(-rp(300));gMoment('🏥',`Hurt at ${S.age}. A night at Tacoma General.`);
    say(`🏥 You wake up at Tacoma General. You’re going to be okay, the nurse says, but it will take weeks. ${isGrow()?'Mom hasn’t left the chair by the bed.':'Your family drives up in the middle of the night.'}`)},
  choices:()=>[
    {ic:'🤝',l:'Let the hospital’s outreach worker in',s:'Leave the crew with the outreach program. Loyalty −40, a few tense weeks.',fn:()=>gangOutreach()},
    {ic:'↩️',l:'Tell her you’re fine',s:'Loyalty +6. Back on the block when you can walk.',fn:()=>{gangAdj({loyalty:6});gFam(-3);say('↩️ You tell the outreach worker you’re fine. She leaves her card on the tray table anyway.')}},
  ],dflt:0});
gev({id:'gang_dead',tile:['🕯️','The night goes wrong','bad'],chance:0,cooldown:0,urgent:true,priority:4,cond:()=>gangMember()&&S.age>=16,
  run:()=>{setTimeout(gangDie,0);return {stop:true}}});
gev({id:'gang_loss',tile:['🕯️','A text before sunrise','bad'],chance:0.06,cooldown:60,max:1,cond:()=>gangMember()&&GANG_RANKS.indexOf(gangS().rank)>=1,
  run:()=>{const g=gangS();g.lostFriend=true;gFeel(-15);gMoment('🕯️','Lost Jojo, a friend from the crew.');
    say('🕯️ A text before sunrise: Jojo is gone. He was seventeen. The memorial is Saturday at the park, and his little sister is going to read something.')},
  choices:()=>[
    {ic:'🏠',l:'Go with your family',s:'Family +6. You hold on to Nia the whole time.',fn:()=>{gFam(6);say('🏠 You stand at the back with your family. His grandma hugs everyone who comes, even you.')}},
    {ic:'🧢',l:'Go with the crew',s:'Loyalty +8, Heat +5. Talk of getting even.',fn:()=>{gGo({loyalty:8,heat:5,rep:2});say('🧢 The crew stands together in matching shirts with his picture. By the end, the talk turns to getting even.')}},
    {ic:'📞',l:'Call Ms. Denise afterward',s:'Leave the crew with the outreach program. Loyalty −40, a few tense weeks.',fn:()=>gangOutreach()},
  ],dflt:0});
// low Loyalty brings threats from your own side
gev({id:'gang_threat',tile:['⚠️','Your own crew is asking questions','bad'],chance:0.2,cooldown:10,cond:()=>gangMember()&&gangS().loyalty<25,
  run:()=>say('⚠️ Two guys from your own crew are waiting by your building. “People saying you ain’t with us no more.” It isn’t a question.'),
  choices:()=>[
    {ic:'🧢',l:'Show up next time',s:'Loyalty +15, Heat +5.',fn:()=>{gGo({loyalty:15,heat:5,rep:1});say('🧢 “I’m with you.” They leave. You don’t sleep.')}},
    {ic:'📞',l:'Call the outreach worker',s:'Leave the crew. Loyalty −40, a few tense weeks, and someone in your corner.',fn:()=>gangOutreach()},
    {ic:'🛏️',l:`Stay at ${isGrow()?'Grandma’s':'a cousin’s'} for a while`,s:'Family +4, Loyalty −5. It buys time.',fn:()=>{gFam(4);gangAdj({loyalty:-5,heat:-5});gFeel(-2);say(`🛏️ A couch at ${isGrow()?'Grandma’s':'your cousin’s'} across town for a while. It buys time. It doesn’t fix it.`)}},
  ],dflt:2});
// a parent moves the family away: the end of the Hilltop chapter
gev({id:'gang_parent_move',tile:['🚚','Mom has made a decision','bad'],chance:0.35,cooldown:21,max:2,urgent:true,priority:2,cond:()=>gangMember()&&isGrow()&&gKid()&&gFamNow()<=20,
  run:()=>say('🚚 Mom sits you down at the kitchen table, Dad next to her. “We’re moving. I already called about a place. I’m not losing you to that corner.”'),
  choices:()=>[
    {ic:'🚚',l:'Go with them',s:'Leave the crew and Hilltop: a fresh start somewhere else. This ends the Hilltop chapter.',fn:()=>{setTimeout(()=>gangMoveAway(true),0)}},
    {ic:'🤝',l:'Promise to leave the crew, and mean it',s:'Leave with the outreach program’s help. Family +15. Loyalty −40, a few tense weeks.',fn:()=>{gangOutreach();gFam(15);say('🤝 “Give me one chance.” Mom calls the outreach program herself, right there at the table.')}},
  ],dflt:0});

// ---- after leaving: tense weeks, and rivals who don't forget ----
gev({id:'gang_tense',tile:['😬','A tense week','bad'],chance:0.4,cooldown:2,cond:()=>!gangMember()&&gangS().tense>0,
  run:()=>{gangS().tense--;say(pick(['😬 Your old crew hasn’t let it go. Somebody you used to stand with crosses the street to avoid you, then crosses back to stare.','😬 A message from a number you don’t know: “we remember.” Ms. Denise says to block it and call her.','😬 The corner goes quiet when you walk by. Nobody says anything. That’s the message.']))},
  choices:()=>[
    {ic:'🤝',l:'Call Ms. Denise and walk with her',s:'Mood up. She knows these weeks.',fn:()=>{gFeel(4);say('🤝 She meets you at the bus stop and walks you home, talking about nothing. It helps.')}},
    {ic:'🏠',l:'Stay in for a few days',s:'Safer. Energy and mood down a little.',fn:()=>{gFeel(-2);gEnergy(-5);say('🏠 A few days inside. It feels like hiding, because it is. It passes.')}},
  ],dflt:0});
gev({id:'gang_rival',tile:['🚗','They remember you','bad'],chance:0.12,cooldown:14,cond:()=>!gangMember()&&gangS().linger>0&&!gangS().moved,
  run:()=>{gangS().linger--;say('🚗 A car from the other side slows as you pass the park. Somebody in it points at you. You left the crew, but they didn’t get the message.')},
  choices:()=>[
    {ic:'↪️',l:'Take the long way home from now on',s:'Energy −4. It works.',fn:()=>{gEnergy(-4);say('↪️ You start taking the long way, past the library and People’s. Nobody follows.')}},
    {ic:'📞',l:'Tell the outreach program',s:'Mood up. They talk to people you can’t.',fn:()=>{gFeel(3);gangAdj({heat:-3});say('📞 Ms. Denise makes some calls. The outreach program knows people on every side. The car doesn’t come back.')}},
  ],dflt:1});
// late life: the ex-member or OG who keeps the next kid out
gev({id:'gang_mentor',tile:['🧭','The outreach program calls','good'],chance:0.12,cooldown:30,max:2,cond:()=>gangMentorOpen()&&!gangMember(),
  run:()=>say('🧭 Ms. Denise, grayer now, calls with a question: would you come talk to the kids at People’s? “They won’t listen to me. They might listen to you.”'),
  choices:()=>[
    {ic:'🧭',l:'Say yes',s:'Become a mentor. Community +6.',fn:()=>gangMentor()},
    {ic:'⏳',l:'Not yet',s:'Maybe later. Stress +2.',fn:()=>{adj('stress',2);say('⏳ “Not yet.” She says the door stays open.')}},
  ],dflt:0});

// ---- 🚪 Ways out: always reachable from the Week tab ----
function gangWaysOut(){
  const g=gangS(),m=g.member,kid=gKid(),b=[];
  b.push({l:'🤝 Talk to an outreach worker',s:`Ms. Denise, from a Hilltop outreach program.${m?' Leaving costs Loyalty (−40) and a few tense weeks.':' Someone in your corner, before you need one.'}`,np:true,fn:()=>{gangOutreach();render()}});
  b.push({l:'🎨 The glass-art studio',s:`Free classes for kids and young people on Hilltop; it can turn into an arts career.${m?' Leaving costs Loyalty (−40) and a few tense weeks.':''}`,dis:g.arts&&!m,np:true,fn:()=>{gangArt();render()}});
  b.push({l:`🚚 ${kid?'Ask Mom about moving away':'Move away for a fresh start'}`,s:'A new neighborhood or city. This ends the Hilltop chapter (and this game).',np:true,fn:()=>modal('🚚 Move away?','<p>A fresh start, somewhere nobody knows your name. The game ends here with your life summary.</p>',[{l:'Move',fn:()=>setTimeout(()=>gangMoveAway(false),0)},{l:'Not now',fn:()=>{}}])});
  if(gangMentorOpen())b.push({l:'🧭 Become a mentor',s:'The one who keeps the next kid out. Community up.',np:true,fn:()=>{gangMentor();render()}});
  b.push({l:'Close',fn:()=>{}});
  modal('🚪 Ways out',`<p>${m?'You can leave. It isn’t free and it isn’t simple, but people do it every year, and people help.':'Nobody has to go down that road. These are always here.'}</p>`,b);
}
window.gangWaysOut=gangWaysOut;

// ---- the Week tab: the meters, once you have any rep ----
const gBar=(k,v,bad)=>`<div class="kv"><span>${k}</span><b>${v}/100 <small style="color:var(--mute)">${bad?(v>=70?'high':v>=40?'rising':'low'):(v>=70?'high':v>=40?'some':'low')}</small></b></div>`;
function gangWeekHTML(){
  if(!S||!S.gang||!lifeLong())return '';const g=gangS();
  if(!g.rep&&!g.member&&!g.outs.length&&!g.heat)return '';
  const R=g.member?GANG_RANK[g.rank]:null;
  return `<div class="gang-m"><div class="sect">🧱 The street</div>${R?`<div class="rules">${R.ic} <b>${R.n}</b>: ${R.d}</div>`:g.out?`<div class="rules">Out of the crew: ${GANG_OUT[g.out].ic} ${GANG_OUT[g.out].n}.${g.tense?' A few tense weeks still.':''}</div>`:''}
    ${gBar('🗣️ Street Rep',g.rep)}${gBar('🚨 Heat',g.heat,true)}${g.member||g.outs.some(o=>!o.before)?gBar('🤝 Loyalty',g.loyalty):''}
    ${g.weeks&&isGrow()?`<div class="kv"><span>🎓 Graduation odds</span><b>about ${Math.round(gangGradOdds()*100)}%</b></div>`:''}
    <button class="act" style="margin-top:8px" onclick="gangWaysOut()"><span class="tx"><b>🚪 Ways out</b><span>An outreach worker, the glass-art studio, moving away${gangMentorOpen()?', mentoring':''}.</span></span></button></div>`;
}
{const lw=lifeWeekList;lifeWeekList=function(){return lw()+gangWeekHTML()}}

// ---- 18: graduation odds, and the glass-art studio as a path ----
{const lg=lifeGraduation;lifeGraduation=function(next){
  const g=S&&S.gang;if(!g||!g.weeks||g.gradRolled)return lg(next);
  g.gradRolled=true;
  if(Math.random()<gangGradOdds())return lg(next);
  g.noDiploma=true;gMoment('📄','Didn’t walk with the class at Hilltop High. A GED program at Tacoma Community College instead.');
  modal('🎓 Not this June',`<p>The class of your year walks across the stage at Hilltop High. You’re not with them: too many missed days, too many weeks gone. Mom goes anyway, for the neighbor’s kid, and comes home quiet.</p>
    <p>A counselor gives you a flyer for the GED program at Tacoma Community College. It isn’t the end of anything. It’s a longer road.</p>`,[{l:'What’s next?',stay:true,fn:()=>lifePathSheet(next)}],true);
}}
const gangArtsOpen=()=>{const g=S&&S.gang;if(g&&g.arts)return true;
  try{if(typeof eventFlag==='function'&&(eventFlag('hood_glass')||eventFlag('glass_studio')||eventFlag('hl_glass')))return true}catch(e){}
  const h=S&&(S.hoodLife||S.hl||S.hood);return !!(h&&(h.glass||h.glassStudio))};
{const lp=lifePathSheet;lifePathSheet=function(next){
  if(!gangArtsOpen())return lp(next);
  const ms=modalSwap;let cap=null;modalSwap=(...a)=>{cap=a};try{lp(next)}finally{modalSwap=ms}
  if(!cap)return;
  const btns=cap[2].slice();
  btns.push({l:'🎨 Glass art: the studio’s apprenticeship',s:'A paid apprenticeship at the glass-art studio, with café shifts on the side. A real arts career, slowly.',np:true,stay:true,fn:()=>{
    const g=gangS();g.artsCareer=true;g.arts=true;lifeHandoff('job','cafe',next);
    const j=S.life.jobs[S.life.jobs.length-1];if(j){j.ic='🎨';j.t='glass-art apprentice, with café shifts'}
    gMoment('🎨','Started an apprenticeship at the glass-art studio.')}});
  modalSwap(cap[0],cap[1],btns,cap[3])}}

// ---- the life summary and end screen ----
function gangSummaryLines(){
  const g=S&&S.gang;if(!g)return [];const L=[];
  if(g.joinedAge!=null){const top=g.outs.filter(o=>!o.before).map(o=>o.rank).concat(g.member?[g.rank]:[]).filter(Boolean).pop()||g.rank;
    L.push(['🧱 The crew',`joined at ${g.joinedAge}${top?`, ${GANG_RANK[top].n}`:''}${g.weeks?`, about ${g.weeks} week${g.weeks===1?'':'s'}`:''}`])}
  else if(g.outs.length)L.push(['🧱 The crew','never joined']);
  g.outs.filter(o=>!o.before).forEach(o=>L.push([`${GANG_OUT[o.how].ic} Out`,`at ${o.age}: ${GANG_OUT[o.how].n}`]));
  if(g.juv)L.push(['🚓 Juvenile detention',`${g.juv} time${g.juv===1?'':'s'}`]);
  if(g.prison)L.push(['🔑 Prison',`${g.prison.years} year${g.prison.years===1?'':'s'}, home at ${g.prison.to}`]);
  if(gangHasRecord()&&typeof crimeRecordLines!=='function')L.push(['📜 Record','yes']);
  if(g.noDiploma)L.push(['📄 School','no diploma with the class; a GED program instead']);
  if(g.injured)L.push(['🏥 Hurt',`${g.injured} time${g.injured===1?'':'s'}`]);
  if(g.lostFriend)L.push(['🕯️ Lost','Jojo, a friend from the crew']);
  if(g.artsCareer)L.push(['🎨 Arts','an apprenticeship at the glass-art studio']);else if(g.arts)L.push(['🎨 Arts','classes at the glass-art studio']);
  if(g.mentor)L.push(['🧭 Mentor',`kept ${g.kids>0?`${g.kids} kid${g.kids===1?'':'s'}`:'the next kids'} off the corner`]);
  if(g.moved)L.push(['🚚 Moved',`to ${g.moved.to} at ${g.moved.age}`]);
  return L;
}
window.gangSummaryLines=gangSummaryLines;
{const ls=lifeSummaryHTML;lifeSummaryHTML=function(){const h=ls(),L=gangSummaryLines();
  return L.length?h+`<div class="sect" style="margin-top:14px">🧱 The street</div>`+L.map(([k,v])=>`<div class="kv"><span>${k}</span><b style="text-align:right">${v}</b></div>`).join(''):h}}

// ---- the guide: a short section in "Choices and consequences" (or Growing up, if that chapter isn't there) ----
function gangGuideHTML(){
  return `<h3>The gang life path</h3>
    <p>In the longer games (never 🧪 Try it), older kids on the block may start to notice you from 13. You can always say no, and saying no never costs you anything that matters. From 14, with enough <b>Street Rep</b>, an older member may ask you to join, twice at most. Say no both times and the door stays closed for a year.</p>
    <p>If you join, three meters show on the 📅 Week tab: <b>Street Rep</b> (respect on the block), <b>Heat</b> (police attention, which fades when you lie low) and <b>Loyalty</b> (the crew’s trust; when it’s low, your own side turns on you). Ranks come with age: Lookout (14+), Runner (15+), Soldier (16+) and OG (21+). The money is small, and it never feels like yours.</p>
    ${hWarn('What it costs','Grades and your odds of graduating drop every week you’re in. Family falls, and a parent may move the family away. Police sweeps mean juvenile detention, then adult charges and prison from 18. People get hurt. Friends are lost. Rivals remember you even after you leave. A life can end early, and the game ends with it.')}
    ${hTip('Ways out are always there','Tap <b>🚪 Ways out</b> on the Week tab: an outreach worker from a Hilltop outreach program, the glass-art studio (which can become an arts career), or moving away with family. Prison and reentry is a way out too, the hardest one. Later in life you can become the mentor who keeps the next kid out. Leaving costs Loyalty and brings a few tense weeks; people help you through them.')}
    <p>In a game that starts before 2000, recruitment is more common and Heat runs higher.</p>`;
}
{const hc=helpChapters;helpChapters=function(...a){const ch=hc(...a);try{
  let c=ch.find(x=>x[0]==='choices'||/Choices and consequences/i.test(x[1]))||ch.find(x=>x[0]==='growup');
  if(c)c[2]=c[2]+gangGuideHTML()}catch(e){console.error(e)}return ch}}

// ---- tests and debugging ----
window.GANG={S:gangS,adj:gangAdj,rank:gangRank,member:gangMember,out:gangOut,canJoin:gangCanJoin,canRecruit:gangCanRecruit,inviteOpen:gangInviteOpen,
  join:gangJoin,refuse:gangRefuse,rankFor:gangRankFor,promote:gangPromote,week:gangWeek,gradOdds:gangGradOdds,arrest:gangArrest,prison:gangPrison,
  die:gangDie,move:gangMoveAway,outreach:gangOutreach,art:gangArt,mentor:gangMentor,mentorOpen:gangMentorOpen,waysOut:gangWaysOut,weekHTML:gangWeekHTML,
  summary:gangSummaryLines,guide:gangGuideHTML,era89:gangEra89,ids:GANG_IDS,RANKS:GANG_RANKS};
window.gangOffense=gangOffense;
})();
