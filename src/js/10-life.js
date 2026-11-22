// ============================================================
//  TACOMPTON · LIFE: game lengths, starting ages, the calendar, aging, and the key-week scheduler.
//  Loaded after the engine (00-09) and before the content (20+). One save holds one whole life.
//
//  ---- Stable API for content (phase-2 agents: use these, don't reach into S.life) ----
//  Calendar (day index 0 = the first morning of the run, always a Monday):
//    dateOf(d)        → {y, m (1–12), d (1–31), dow (0 = Monday … 6 = Sunday, the same as dayName()), label:'Mon Aug 3'}
//    monthDay(d)      → 'Aug 3'          longDate(d) → 'Monday, Aug 3'      fullDate(d) → 'Mon Aug 3, 2026'
//    dayIndexOf(y,m,d)→ the day index of a calendar date (may be negative or past the end)
//    season(d=day())  → 'summer' (Jun–Aug) | 'fall' (Sep–Nov) | 'winter' (Dec–Feb) | 'spring' (Mar–May)
//    isSchoolDay(d=day()) → true on weekdays of the school year: from the Monday of the week of Sept 1 to June 15,
//                     minus winter break (Dec 20 – Jan 2) and spring break (Apr 1–7)
//    isFairDay(d=day()) → the Hilltop Street Fair: every year on the second Saturday of August
//    The run starts Mon Aug 3, 2026 at age 18, Mon Aug 24, 2026 at ages 12 and 15 (LIFE_START).
//  Age and stage:
//    S.age, S.birthday {m, d} (S.birthday.label 'March 14'), stage(age=S.age) → 'middle' (12–13) | 'high' (14–17) | 'adult' (18+)
//    lifeLong()       → true for 6 months, 1 year, 2 years and Lifetime; false for Quick play (today's two-week games)
//  Key weeks (S.keyWeeks[i] = {start, end, kind, from, to}; you play days from..to, the rest is a time skip):
//    lifeKw()         → the key week being played;  lifeKwIs(kind) → its kind is kind
//      kinds: 'start' | 'month' | 'season' | 'birthday' | 'graduation' | 'movein' | 'milestone' | 'retire' | 'final'
//    lifeWeekDays()   → the day indices you play this key week (Quick play: every day)
//  Content registers key-week events with defLifeEvent(e): a defEvent() whose cond also checks the key week.
//    defLifeEvent({id, hook:'wake'|'arrive'|…, kinds:['birthday'], stages:['high'], seasons:['winter'], mode:'grow'|'adult',
//                  cond, chance, run, …})   everything else is plain defEvent (03-events.js)
//    LIFE_HOOKS.weekStart.push(kw=>{…})      the first morning of every key week (after the time skip)
//    LIFE_HOOKS.weekEnd.push(kw=>{…})        the last night of every key week, before the summary
//    LIFE_HOOKS.skip.push((from,to,choice,notes)=>{…})   after a time skip is simulated: push lines to notes
//    LIFE_HOOKS.birthday.push(age=>{…})      every birthday, played or skipped
//    LIFE_HOOKS.plan.push((W,{len,o,T})=>{…})   kids' runs: move W's month/season/milestone weeks ({w, kind, age}) before they are merged
//    LIFE_HOOKS.schoolDay = d=>{…}          runs a Growing Up school day instead of the built-in one (32-school.js)
//    LIFE_HOOKS.memorial = ()=>html          the memorial screen's body for endLife('death') (content comes later)
//    endLife(reason)  → ends the run: 'oldage' shows the life summary, 'death' the memorial, then the score
// ============================================================

const LIFE_START={18:'2026-08-03',15:'2026-08-24',12:'2026-08-24'};
const LIFE_AGES=[12,15,18];
const LIFE_ORDER=['quick','6m','1y','2y','life'];
const LIFE_LEN={
  quick:{n:'Quick play',ic:'⚡',d:'Today’s game: two weeks at 18, or Growing Up’s first week at 12.',short:'Quick'},
  '6m':{n:'6 months',ic:'🍂',d:'About six key weeks, one a month, with a summary between them.',short:'6 mo'},
  '1y':{n:'1 year',ic:'📅',d:'A key week every six weeks or so, plus your birthday: about nine.',short:'1 yr'},
  '2y':{n:'2 years',ic:'🗓️',d:'One key week a season, plus two birthdays: about ten.',short:'2 yrs'},
  life:{n:'Lifetime',ic:'🌳',d:'One or two key weeks a year at the milestones, all the way to old age.',short:'Life'},
};
const LIFE_HOOKS={weekStart:[],weekEnd:[],skip:[],birthday:[],memorial:null,plan:[],schoolDay:null};
const MON3=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
let LIFE_PICK=null;   // {length, startAge, birthday}: the start screen's choice, used by the next new game (null = Quick play)

// ---- calendar ----
function lifeStartDate(s){s=s||(typeof S!=='undefined'?S:null);return (s&&s.startDate)||(typeof isGrow==='function'&&isGrow()?LIFE_START[12]:LIFE_START[18])}
function dAt(sd,i){const [y,m,d]=sd.split('-').map(Number);const t=new Date(Date.UTC(y,m-1,d+i)),dow=(t.getUTCDay()+6)%7;
  return {y:t.getUTCFullYear(),m:t.getUTCMonth()+1,d:t.getUTCDate(),dow,label:`${DAYS[dow].slice(0,3)} ${MON3[t.getUTCMonth()]} ${t.getUTCDate()}`}}
function dateOf(d){return dAt(lifeStartDate(),d)}
const monthDay=d=>dateOf(d).label.slice(4);
const longDate=d=>`${dayName(d)}, ${monthDay(d)}`;
const fullDate=d=>{const o=dateOf(d);return `${o.label}, ${o.y}`};
function dIdx(sd,y,m,d){const [a,b,c]=sd.split('-').map(Number);return Math.round((Date.UTC(y,m-1,d)-Date.UTC(a,b-1,c))/864e5)}
function dayIndexOf(y,m,d){return dIdx(lifeStartDate(),y,m,d)}
function seasonOf(o){return o.m===12||o.m<=2?'winter':o.m<=5?'spring':o.m<=8?'summer':'fall'}
function season(d){return seasonOf(dateOf(d==null?day():d))}
function schoolOn(o){
  if(o.dow>=5) return false;
  const Y=o.m>=7?o.y:o.y-1;   // the school year that started in late summer of Y
  const s1=new Date(Date.UTC(Y,8,1)),mon=new Date(Date.UTC(Y,8,1-((s1.getUTCDay()+6)%7))),t=Date.UTC(o.y,o.m-1,o.d);
  if(t<mon.getTime()||t>Date.UTC(Y+1,5,15)) return false;
  if((o.m===12&&o.d>=20)||(o.m===1&&o.d<=2)) return false;
  if(o.m===4&&o.d<=7) return false;
  return true;
}
function isSchoolDay(d){return schoolOn(dateOf(d==null?day():d))}
function isFairDay(d){const o=dateOf(d==null?day():d);return o.m===8&&o.dow===5&&o.d>=8&&o.d<=14}

// ---- age and stage ----
function stage(age){if(age==null)age=(typeof S!=='undefined'&&S&&S.age)||18;return age<14?'middle':age<18?'high':'adult'}
function lifeRandBirthday(){   // a random day of the year, without touching Math.random (seeded runs stay the same)
  let r=0;try{const a=new Uint32Array(1);crypto.getRandomValues(a);r=a[0]}catch(e){r=Date.now()}
  const t=new Date(Date.UTC(2027,0,1+(r%365)));return {m:t.getUTCMonth()+1,d:t.getUTCDate(),label:`${MONTHS[t.getUTCMonth()]} ${t.getUTCDate()}`}}
// the day index on which you turn `age` (o: a save, or {startDate, startAge, birthday})
function lifeBday(o,age){const sd=o.startDate,[y0,m0,d0]=sd.split('-').map(Number),b=o.birthday;
  const y1=(b.m>m0||(b.m===m0&&b.d>d0))?y0:y0+1;return dIdx(sd,y1+(age-o.startAge-1),b.m,b.d)}
const lifeLong=()=>typeof S!=='undefined'&&!!S&&!!S.length&&S.length!=='quick';
const ordinal=n=>n+(n%100>=11&&n%100<=13?'th':['th','st','nd','rd'][n%10]||'th');

// ---- the key-week schedule ----
const KW_PRIO={start:9,final:8,graduation:7,movein:7,retire:6,birthday:5,milestone:2,season:1,month:1};
function lifeBuild(len,o){
  const kid=o.startAge<18,first=kid?8:7,qEnd=kid?7:13;
  if(len==='quick') return [{start:0,end:qEnd,kind:'start'}];
  const W=[],add=(w,kind,x)=>W.push(Object.assign({w,kind},x||{})),bw=a=>Math.floor(lifeBday(o,a)/7);
  let T;
  if(len==='6m'){T=26;for(let i=0;i<6;i++)add(Math.round(i*(T-1)/5),i?'month':'start')}
  else if(len==='1y'){T=52;for(let i=0;i<9;i++)add(Math.round(i*(T-1)/8),i?'month':'start');for(let a=o.startAge+1;bw(a)<T;a++)add(bw(a),'birthday',{age:a})}
  else if(len==='2y'){T=104;add(0,'start');let run=null;const runs=[];
    for(let w=0;w<T;w++){const s=seasonOf(dAt(o.startDate,w*7+3));if(!run||run.s!==s){run={s,a:w,b:w};runs.push(run)}else run.b=w}
    runs.slice(1,-1).forEach(r=>add(Math.round((r.a+r.b)/2),'season'));
    for(let a=o.startAge+1;bw(a)<T;a++)add(bw(a),'birthday',{age:a})}
  else{T=bw(80)+1;add(0,'start');
    for(let a=o.startAge+1;a<=80;a++){const w=bw(a);add(w,a===18&&kid?'graduation':a===67?'retire':'birthday',{age:a});
      if(a===18&&kid)add(w+2,'movein');
      if(a<80&&(a<22||a%5===0))add(Math.floor((lifeBday(o,a)+182)/7),'milestone',{age:a})}}
  if(kid)LIFE_HOOKS.plan.forEach(f=>{try{f(W,{len,o,T})}catch(e){console.error(e)}});   // content can move month/season/milestone weeks onto its own key dates
  add(T-1,'final');
  W.sort((a,b)=>a.w-b.w||KW_PRIO[b.kind]-KW_PRIO[a.kind]);
  const out=[];
  for(const x of W){if(x.w<0||x.w>=T)continue;const p=out[out.length-1];
    if(!p){out.push(x);continue}
    if(x.w-p.w<2||(p.w===0&&kid&&x.w<2)){if(KW_PRIO[x.kind]>KW_PRIO[p.kind]&&p.kind!=='start'){if(p.age&&!x.age)x.age=p.age;out[out.length-1]=x}else if(x.age&&!p.age)p.age=x.age;continue}
    out.push(x)}
  return out.map(x=>{const k={start:x.w*7,end:x.w===0?first-1:x.w*7+6,kind:x.kind};if(x.age)k.age=x.age;return k});
}
// the days you actually play in a key week (Highlights: 3 of them, around a birthday if there is one, else Fri–Sun)
function lifeRange(kw,s){s=s||S;if(kw.from!=null)return {from:kw.from,to:kw.to};
  const hl=s&&s.life&&s.life.weekPlay==='highlights'&&kw.start>0&&s.length!=='quick'&&kw.end-kw.start>=3;
  if(!hl) return {from:kw.start,to:kw.end};
  const b=s.birthday,sd=s.startDate;let from=kw.end-2;
  for(let d=kw.start;d<=kw.end;d++){const o=dAt(sd,d);if(o.m===b.m&&o.d===b.d){from=clamp(d-1,kw.start,kw.end-2);break}}
  return {from,to:from+2};
}
const lifeEndDay=s=>{const k=s.keyWeeks[s.keyWeeks.length-1];return lifeRange(k,s).to};
function lifeKw(){return S&&S.keyWeeks?S.keyWeeks[S.kwi||0]:null}
function lifeKwIs(kind){const k=lifeKw();return !!k&&k.kind===kind}
function lifeWeekDays(){const k=lifeKw();if(!k||!lifeLong())return Array.from({length:GAME.days},(_,i)=>i);const r=lifeRange(k),a=[];for(let d=r.from;d<=r.to;d++)a.push(d);return a}
function lifePlayed(){if(!lifeLong())return Array.from({length:GAME.days},(_,i)=>i);const a=[];S.keyWeeks.slice(0,S.kwi+1).forEach(k=>{const r=lifeRange(k);for(let d=r.from;d<=Math.min(r.to,day());d++)a.push(d)});return a}
// GAME.days follows the save being played: the last key week's last day + 1 (setMode() and adopt() call this)
function lifeSync(){if(typeof S==='undefined'||!S||!S.keyWeeks||!S.keyWeeks.length)return;if((S.mode==='grow')!==(MODE==='grow'))return;GAME.days=lifeEndDay(S)+1}
function kwName(k,s){s=s||S;const o=dAt(s.startDate,k.start+3);
  return {start:'Your first week',final:'The last week',birthday:`Your ${ordinal(k.age||0)} birthday`,graduation:'Graduation',movein:'Moving day',retire:'Retirement',
    milestone:`${MONTHS[o.m-1]}, age ${k.age?k.age:''}`.replace(/, age $/,''),season:`${cap(seasonOf(o))} ${o.y}`,month:`${MONTHS[o.m-1]} ${o.y}`}[k.kind]||'A week'}
// the Week tab's footer in the longer games: the key weeks still to come
function lifeWeekList(){if(!lifeLong())return '';const nx=S.keyWeeks.slice(S.kwi+1);
  return `<div class="sect">Key weeks ahead · ${nx.length} left</div>`+nx.slice(0,6).map(k=>`<div class="todo"><span class="ck">⭐</span><div><b>${kwName(k)}</b><span>from ${fullDate(lifeRange(k).from)}</span></div></div>`).join('')
    +(nx.length>6?`<div class="rules">…and ${nx.length-6} more, to ${fullDate(lifeEndDay(S))}.</div>`:'')}
function defLifeEvent(e){const c=e.cond;defEvent(Object.assign({},e,{cond:ctx=>{const k=lifeKw();if(!k)return false;
  if(e.mode&&(e.mode==='grow')!==isGrow())return false;if(e.kinds&&!e.kinds.includes(k.kind))return false;
  if(e.stages&&!e.stages.includes(stage()))return false;if(e.seasons&&!e.seasons.includes(season()))return false;return c?c(ctx):true}}))}
function lifeHook(name,...a){(LIFE_HOOKS[name]||[]).forEach(f=>{try{f(...a)}catch(e){console.error(e)}})}

// ---- the life part of a save ----
function lifeBlank(x){return {weekPlay:'full',diffWk:-1,snaps:[],moments:[],stages:[{stage:x.stage,age:x.age,d:0}],jobs:[],family:60,tot:{},
  rentHelp:0,rentHelpLeft:0,path:null,parttime:false,prog:0,done:false,retired:false,graduated:false,schoolDays:0,ended:null,grow:null,lastSkip:null}}
function lifeSetup(x,p){
  x.length=p.length;x.startAge=p.startAge;x.age=p.startAge;x.birthday=p.birthday;x.startDate=LIFE_START[p.startAge];
  x.stage=stage(x.age);x.lengthLog=[];x.keyWeeks=lifeBuild(p.length,x);x.kwi=0;x.life=lifeBlank(x);
  const k=x.keyWeeks[0];k.from=k.start;k.to=k.end;
}
// old saves (0.3 and before) are Quick play: adult at 18, Growing Up at 12 (MIGRATIONS in 21-story.js)
function lifeMigrateQuick(x){if(x.length)return;const g=x.mode==='grow';lifeSetup(x,{length:'quick',startAge:g?12:18,birthday:x.birthday||lifeRandBirthday()})}
function lifeMoment(ic,t){if(!S||!S.life)return;S.life.moments.push({d:day(),age:S.age,ic,t});if(S.life.moments.length>80)S.life.moments.splice(1,1)}
// called first thing in onNewGame() (21-story.js)
function lifeNew(){
  const p=LIFE_PICK||{length:'quick',startAge:isGrow()?12:18,birthday:lifeRandBirthday()};LIFE_PICK=null;
  lifeSetup(S,p);
  if(p.startAge===15){S.money=Math.round(S.money*2);S.grades=65}
  if(lifeLong()){
    if(!isGrow()){S.rent.due=lifeKw().to;S.life.jobs=[]}
    lifeMoment('🌱',p.startAge<18?`Moved to Hilltop with your family, age ${p.startAge}.`:'Moved into your own apartment on Hilltop, age 18.');
  }
  lifeSync();
}
function lifeHud(d){return `${dateOf(d).label} · Age ${S.age} · Week ${S.kwi+1} of ${S.keyWeeks.length}`}

// ---- birthdays and the school day (onMorning in 21-story.js calls this every morning) ----
function lifeBirthday(age,played){
  S.age=age;const st=stage(age),lines=[];
  if(isGrow())lines.push(`🎂 You turn ${age}. ${pick(['Mom bakes a lopsided chocolate cake and Dad sings louder than anyone.','Pancakes with a candle in them at breakfast, and Nia made you a card with glitter that will never come off.','Grandma calls first thing and sings the whole song, both verses.'])} A small family celebration${played?' tonight':''}.`);
  else lines.push(`🎂 You turn ${age}. ${pick(['Your family calls on speaker, all at once, and sings badly.','A card in the mail from home, and a cupcake from a neighbor with one candle in it.','Ms. Lorraine across the street somehow knew, and there is a slice of pound cake on your step.'])}`);
  if(isGrow()){adj('family',3);adj('mood',5)}else{S.life.family=clamp(S.life.family+2,0,100);adj('stress',-4)}
  if(st!==S.stage&&!(st==='adult'&&isGrow())){S.stage=st;S.life.stages.push({stage:st,age,d:day()});
    if(st==='high'){lines.push('🎓 High school: Hilltop High, a bus pass in your backpack, and curfew moves to 10 PM.');lifeMoment('🎓','Started high school at Hilltop High.')}}
  if(age===16&&isGrow()){lines.push('🚗 Sixteen: a learner’s permit, and you’re old enough for a part-time job (the corner market on MLK is hiring).');lifeMoment('🚗','Learner’s permit, and a first part-time job allowed.')}
  if(age===67&&!isGrow()&&!S.life.retired){S.life.retired=true;lines.push('🎉 Retirement. The last shift, a sheet cake in the break room, and mornings that belong to you now.');lifeMoment('🎉',`Retired from ${job().place}.`)}
  if([13,16,18,21,30,40,50,60,70,80].includes(age))lifeMoment('🎂',`Turned ${age}.`);
  lifeHook('birthday',age);
  return lines;
}
function lifeMorning(d){
  if(!lifeLong())return;
  const o=dateOf(d),b=S.birthday;
  if(o.m===b.m&&o.d===b.d&&d>0){const lines=lifeBirthday(S.age+1,true);lines.forEach(l=>{say(l);digestLine(l)})}
  if(isGrow()&&typeof gSchoolDay==='function'&&d>gSchoolDay()&&isSchoolDay(d)){
    if(LIFE_HOOKS.schoolDay){LIFE_HOOKS.schoolDay(d);return}   // content can run the school day itself (32-school.js)
    const ok=S.energy>=30&&S.mood>=30;S.life.schoolDays++;S.grades=clamp((S.grades==null?60:S.grades)+(ok?1:0),0,100);
    S.t=Math.max(S.t,d*1440+925);S.loc='home';adj('energy',-12);adj('mood',ok?1:-2);
    say(`🏫 A school day at ${gSchoolShort()}. ${pick(['A pop quiz you were ready for, mostly.','Lunch was loud, PE was louder.','A substitute in math and a real experiment in science.','Group project. Your group is fine. One of them is great.'])} ${ok?'Grades +1.':'You were too tired to follow much.'} Home by ${fmt(925)}.`)}
}

// saves: reading one uses that save's own length for GAME.days (06-save.js clamps the day to it); loading one switches to it
{const mg=migrate;migrate=function(d){const s=d&&d.S;if(!s||!s.keyWeeks||!s.keyWeeks.length)return mg(d);const keep=GAME.days;try{GAME.days=lifeEndDay(s)+1;return mg(d)}finally{GAME.days=keep}}}
{const ad=adopt;adopt=function(d){if(d&&d.S&&d.S.keyWeeks&&d.S.keyWeeks.length)GAME.days=lifeEndDay(d.S)+1;return ad(d)}}

// ---- the end of a key week: the time skip ----
{const ed=endDay;endDay=function(where){
  if(!S||S.over||!lifeLong()) return ed(where);
  const d=day(),kw=lifeKw();
  if(!kw||d<lifeRange(kw).to||S.kwi>=S.keyWeeks.length-1) return ed(where);
  closeModals();const notes=[];
  onNight(where,notes,d);const nctx={where,notes,fired:[]};fireHook('night',nctx);
  const card=dayCard(d);achCheck({night:true,where});
  if(S.over) return;const loss=checkLoss();if(loss) return gameOver(loss);
  lifeWeekEnd(d,card+notes.map(n=>`<p>${n}</p>`).join(''));
}}
// one key week's score: the mode's own score, with cash capped and shifts scaled to a two-week game, so every length compares fairly
function lifeWeekScore(){
  let sc=scoreOf();const k=lifeKw(),r=k?lifeRange(k):{from:0,to:13},n=Math.max(1,Math.min(day(),r.to)-r.from+1);
  if(!isGrow()){sc+=Math.round(clamp(S.money,-2500,2500)*SCORE_W.cash)-Math.round(S.money*SCORE_W.cash);sc+=Math.round(SCORE_W.shift*(S.stats.shifts||0)*(14/n-1))}
  return Math.round(sc);
}
function lifeWeekEnd(d,night){
  const kw=lifeKw();
  S.life.snaps=S.life.snaps.filter(x=>x.kw!==S.kwi);S.life.snaps.push({kw:S.kwi,start:kw.start,score:lifeWeekScore(),mode:MODE});
  if(isGrow()&&S.grades==null)S.grades=clamp(40+Math.round(gReady()*0.5),0,100);
  if(isGrow()&&typeof gBest==='function'){const b=gBest();if(b&&!S.life.best){S.life.best=b.id;lifeMoment('🤝',`Became best friends with ${b.n}.`)}}
  lifeHook('weekEnd',kw);
  const go=()=>lifeSkipSheet(d,night);
  if(isGrow()&&S.age>=18&&!S.life.graduated) return lifeGraduation(go);
  go();
}
function lifeSnapRows(){
  if(isGrow()) return [['💵 Money',S.money,$],['⚡ Energy',S.energy],['🙂 Mood',S.mood],['🏠 Family',S.family],['🤝 Friends',gFriends()],['📚 Grades',S.grades==null?gReady():S.grades],['🎂 Age',S.age]];
  return [['💵 Cash',S.money,$],['😣 Stress',S.stress,null,true],['💼 Job',S.standing],['🤝 Community',S.community],['🏠 Family',Math.round(S.life.family)],['🎂 Age',S.age]]
    .concat(S.life.path&&S.life.path!=='job'?[[S.life.path==='college'?'🎓 College':'🔧 Trade program',Math.round(S.life.prog),v=>v+'%']]:[]);
}
function lifeChoices(){
  if(isGrow()) return [{k:'study',l:'📚 Study hard',s:'Grades up. A little less fun, a little less time with friends.'},{k:'home',l:'🏠 Help out at home',s:'Chores, dinners, Nia. Family up, and a few extra dollars from chores.'},
    {k:'friends',l:'🤝 See friends more',s:'Friends and mood up. Grades and home slip a little.'},...(S.age>=16?[{k:'work',l:'🧾 Pick up shifts at the market',s:'Weekend shifts at the corner market: money up, grades a little down.'}]:[])];
  if(S.life.retired) return [{k:'friends',l:'🤝 See friends more',s:'The block club, the bench at the overlook, the grandkids next door. Community up, stress down.'},{k:'save',l:'🐷 Keep it simple',s:'Cook at home, call family. Costs down, family up.'},{k:'extra',l:'🤲 Volunteer more',s:'The free fridge, the reading program. Community up, a little tired.'}];
  return [{k:'extra',l:'💼 Pick up extra shifts',s:'More money and job standing, more stress, less time for the neighborhood.'},{k:'save',l:'🐷 Save money',s:'Cook at home, skip the extras, call home more. Costs down, a little calmer.'},
    {k:'friends',l:'🤝 See friends more',s:'Block club, pickup games, porch nights. Community up, stress down, a bit more spent.'}];
}
function lifeSkipSheet(d,night){
  const i=S.kwi+1,nk=S.keyWeeks[i],r=lifeRange(nk),from=d+1,to=r.from-1,wk=Math.max(1,Math.round((to-from+1)/7));
  const before=lifeSnapRows();
  const body=`${night?`<div class="digest"><div class="sect">🌙 ${dayName(d)} night</div>${night}</div>`:''}
    <p><b>Key week ${S.kwi+1} of ${S.keyWeeks.length} is done.</b> Next up: <b>${kwName(nk)}</b>, ${monthDay(r.from)} to ${fullDate(r.to)}.</p>
    <p>That’s about <b>${wk} week${wk===1?'':'s'}</b> from here. How do you spend them?</p>`;
  modal(`⏩ ${monthDay(from)} → ${monthDay(to)}`,body,lifeChoices().map(c=>({l:c.l,s:c.s,np:true,stay:true,fn:()=>{
    const notes=lifeSimulate(from,to,c.k);S.life.lastSkip={from,to,choice:c.k};lifeHook('skip',from,to,c.k,notes);lifeRound();
    lifeResultSheet(before,notes,i,c)}})),true);
}
function lifeResultSheet(before,notes,i,c){
  const after=lifeSnapRows(),nk=S.keyWeeks[i],r=lifeRange(nk);
  const rows=after.map(([k,v,f,bad],j)=>{const b=before.find(x=>x[0]===k),bv=b?b[1]:v,dv=Math.round(v-bv),fm=f||(x=>Math.round(x));
    const col=dv===0?'var(--mute)':((dv>0)!==!!bad?'var(--good,#2f8f6a)':'var(--bad,#c0392b)');
    return `<div class="kv"><span>${k}</span><b>${fm(bv)} → ${fm(v)} <small style="color:${col}">${dv===0?'':(dv>0?'+':'−')+(f===$?$(Math.abs(dv)):Math.abs(dv))}</small></b></div>`}).join('');
  const prog=isGrow()?`<div class="kv"><span>🏫 School</span><b>${gSchoolShort()} · grades ${S.grades}</b></div>`:`<div class="kv"><span>💼 Work</span><b>${S.life.retired?'retired':`${job().ic} ${job().role}${S.life.parttime?' (part-time)':''}`}</b></div>`;
  const ppl=isGrow()?(()=>{const k=KIDS.filter(x=>gMet(x.id)).sort((a,b)=>gF(b.id)-gF(a.id)).slice(0,3);return k.length?`<div class="kv"><span>🤝 Closest friends</span><b>${k.map(x=>x.n).join(', ')}</b></div>`:''})()
    :`<div class="kv"><span>🤝 Neighbors who know you</span><b>${metCount()}</b></div>`;
  const body=`<p>You chose <b>${c.l.replace(/^\S+\s/,'')}</b>.</p><div class="sect">What changed</div>${rows}${prog}${ppl}${notes.length?`<div class="sect">Along the way</div>${notes.map(n=>`<p>${n}</p>`).join('')}`:''}`;
  if(S.over) return;
  const loss=checkLoss();
  modalSwap('📋 While you were away',body,[{l:loss?'See what happened':`▶️ Play ${kwName(nk).replace(/^Your/,'your')}: ${dateOf(r.from).label}`,fn:()=>{if(loss)return gameOver(loss);lifeEnter(i)}}],true);
}
// a few weeks of life, day by day: money, stats, rent, school, birthdays
function lifeSimulate(from,to,ch){
  const notes=[],grow=isGrow();let rentN=0,rentAmt=0,helpAmt=0,fair=false,school=0,cash0=S.money;
  const f={},num=k=>f[k]!=null?f[k]:(f[k]=S[k]);
  for(let d=from;d<=to;d++){
    const o=dateOf(d),wd=d%7;
    if(o.m===S.birthday.m&&o.d===S.birthday.d){const ls=lifeBirthday(S.age+1,false);if(grow){money(20)}notes.push(...ls)}
    if(grow){
      if(wd===5)money(10+(ch==='home'?5:0));
      if(ch==='work'&&S.age>=16&&wd>=5)money(45);
      money(-0.5);
      const sd=schoolOn(o);if(sd)school++;
      f.grades=clamp((f.grades!=null?f.grades:(S.grades==null?60:S.grades))+(sd?(ch==='study'?0.35:ch==='friends'||ch==='work'?-0.05:0.12):0),0,100);
      f.mood=num('mood')+(60-num('mood'))*0.02+(ch==='friends'?0.25:ch==='study'?-0.08:0.05);
      f.family=num('family')+(60-num('family'))*0.01+(ch==='home'?0.3:ch==='friends'?-0.08:0);
      for(const k of KIDS){const s=S.kids[k.id];if(!s||!s.met)continue;s.f=clamp(s.f+(ch==='friends'?0.1:ch==='study'?-0.02:0.01),0,20)}
    }else{
      const J=job(),pf=lifePayF();
      if(!S.life.retired){
        if(J.days.includes(wd)){money(J.pay*pf+(J.tips?(J.tips[0]+J.tips[1])/2:0));S.life.tot.shifts=(S.life.tot.shifts||0)+1}
        if(ch==='extra'&&wd===(J.days[0]===0?5:0))money(J.pay*pf*0.9);
      }else money(500/7);
      money(-((45+40+20)/7*(DF().cost||1)*(ch==='save'?0.75:1)+(ch==='friends'?25/7:0)));
      if(o.d===1){const help=S.life.rentHelpLeft>0?Math.min(S.life.rentHelp,S.rent.amt):0;money(-(S.rent.amt-help));rentN++;rentAmt+=S.rent.amt;helpAmt+=help;if(help)S.life.rentHelpLeft--;
        if(S.life.path&&!S.life.done&&S.life.path!=='job')money(-(S.life.path==='college'?380:120))}
      if(isFairDay(d)){fair=true;S.fair=true;S.fairYear=o.y}
      f.standing=num('standing')+(75-num('standing'))*0.01+(ch==='extra'&&!S.life.retired?0.15:0);
      const tgt=ch==='extra'?(S.life.retired?30:50):ch==='save'?28:22;f.stress=num('stress')+(tgt-num('stress'))*0.03;
      f.community=num('community')+0.07+(ch==='friends'?0.2:ch==='extra'&&S.life.retired?0.15:0)-(ch==='extra'&&!S.life.retired?0.05:0);
      S.life.family=clamp(S.life.family+(60-S.life.family)*0.003+(ch==='save'?0.07:ch==='extra'?-0.03:0),0,100);
      if(S.life.path&&S.life.path!=='job'&&!S.life.done){S.life.prog=Math.min(100,S.life.prog+100/(S.life.path==='college'?4*365:365));
        if(S.life.prog>=100){S.life.done=true;S.life.parttime=false;const t=S.life.path==='college'?'🎓 You finish your degree at UW Tacoma. Your family fills a whole row at the ceremony.':'🔧 You finish the trade program and test out as a journey-level electrician’s helper. Better pay from here on.';notes.push(t);lifeMoment(S.life.path==='college'?'🎓':'🔧',t.replace(/^\S+\s/,''))}}
    }
    if(S.age>=18&&grow)break;   // graduation comes next
  }
  for(const k in f) S[k]=clamp(Math.round(f[k]),0,100);
  S.money=Math.round(S.money);
  S.energy=80;if(!grow)S.food=Math.max(S.food,3);
  if(!grow&&rentN)notes.push(`🧾 Rent paid ${rentN} time${rentN===1?'':'s'} (${$(rentAmt)})${helpAmt?`, ${$(helpAmt)} of it from your family`:''}.`);
  if(grow&&school)notes.push(`🏫 ${school} school day${school===1?'':'s'} at ${gSchoolShort()}. Grades: ${S.grades}.`);
  if(fair){notes.push('🎪 The Hilltop Street Fair came around again in August. You were there, in the barbecue line.');if(!S.life.moments.some(m=>m.ic==='🎪'))lifeMoment('🎪','The Hilltop Street Fair: the first of many.')}
  const dm=Math.round(S.money-cash0);notes.push(`💵 ${dm>=0?'Saved':'Spent down'} ${$(Math.abs(dm))} over these weeks.`);
  return notes;
}
// after a time skip: whole numbers on every stat (the day-by-day simulation adds fractions, e.g. friendship +0.1 a day)
function lifeRound(){
  for(const k of ['money','energy','mood','family','grades','stress','standing','community','food'])if(typeof S[k]==='number')S[k]=Math.round(S[k]);
  if(S.kids)for(const id in S.kids){const s=S.kids[id];if(s&&typeof s.f==='number')s.f=clamp(Math.round(s.f),0,20)}
}
const lifePayF=()=>(S&&S.life?(S.life.parttime?0.6:1)*(S.life.done&&S.life.path!=='job'?1.25:1):1);
// the first morning of key week i
function lifeEnter(i){
  if(isGrow()&&S.age>=18&&!S.life.graduated) return lifeGraduation(()=>lifeEnter(i));
  for(const k in S.stats)if(typeof S.stats[k]==='number')S.life.tot[k]=(S.life.tot[k]||0)+S.stats[k];
  S.kwi=i;const kw=S.keyWeeks[i],r=lifeRange(kw);kw.from=r.from;kw.to=r.to;lifeSync();
  S.stats=newState().stats;if(!isGrow())S.stats.neighbors=metCount();
  if(S.log.length>300)S.log=S.log.slice(-300);if(S.ev.history.length>300)S.ev.history=S.ev.history.slice(-300);
  if(!isGrow()){const has1=[...Array(kw.end-kw.start+1)].some((_,j)=>dateOf(kw.start+j).d===1);
    S.rent=Object.assign({},S.rent,has1?{due:r.to,paid:false,paidDay:-1}:{due:-1,paid:true,paidDay:r.from});
    S.haircut=false;const y=dateOf(r.from).y;if(S.fairYear!==y&&!isFairDay(r.from))S.fair=false}
  closeModals();S.cur=r.from;S.t=S.cur*1440+S.alarm;S.loc='home';uiNarr=[];
  say(`📅 <b>${kwName(kw)}</b>: ${monthDay(r.from)} to ${fullDate(r.to)}. Age ${S.age}.${!isGrow()&&!S.rent.paid?` Rent (${$(S.rent.amt)}) is due by ${longDate(S.rent.due)}.`:''}`);
  lifeHook('weekStart',kw);
  DIGEST={night:'',items:[],lines:[],held:[],open:false,from:r.from-1,nightIds:[]};
  startDay();const D=DIGEST;DIGEST=null;morningReport(D,r.from-1);render();
}

// ---- 18: graduation, the choice, and the move into the Hilltop apartment (one save, MODE switches inside it) ----
function lifeGraduation(next){
  const b=gBest(),kids=KIDS.filter(k=>gMet(k.id));
  const body=`<p>Cap, gown, the Hilltop High gym packed to the rafters. Mom cries before your name is even called; Dad films the whole thing sideways. ${S.age>=18?'You’re 18.':''}</p>
    <p>${b?`${b.n} finds you in the crowd afterward and doesn’t let go for a long time.`:kids.length?`${kids[0].n} throws a cap in the air that lands on a stranger.`:'Kids you barely knew sign your yearbook like old friends.'} Nia, taller than you remember, holds a sign: WE KNEW YOU COULD.</p>
    <div class="kv"><span>🏠 Family</span><b>${S.family}</b></div><div class="kv"><span>🤝 Friends</span><b>${gFriends()}</b></div><div class="kv"><span>📚 Grades</span><b>${S.grades==null?gReady():S.grades}</b></div>`;
  modal('🎓 Graduation',body,[{l:'What’s next?',stay:true,fn:()=>lifePathSheet(next)}],true);
}
function lifePathSheet(next){
  modalSwap('🧭 What comes next?','<p>You’re moving into your own apartment on Hilltop. What do you do with the next few years?</p>',[
    {l:'💼 Go to work',s:'Pick one of the three jobs and start full-time.',np:true,stay:true,fn:()=>modalSwap('💼 Which job?','<p>Full-time, right away.</p>',Object.entries(JOBS).map(([k,j])=>({l:`${j.ic} ${j.n}`,s:`${fmt(j.start)}–${fmt(j.end)} · ${$(j.pay)} a shift`,np:true,stay:true,fn:()=>lifeHandoff('job',k,next)})),true)},
    {l:'🎓 College: UW Tacoma',s:'Four years downtown. Tuition about $380 a month after aid, and a part-time job at a Hilltop café.',np:true,stay:true,fn:()=>lifeHandoff('college','cafe',next)},
    {l:'🔧 A trade program',s:'A one-year electrical pre-apprenticeship ($120 a month), evenings on the line at a soul-food spot on MLK.',np:true,stay:true,fn:()=>lifeHandoff('trade','kitchen',next)}],true);
}
function lifeHandoff(path,jk,next){
  const fam=S.family,fr=gFriends(),gr=S.grades==null?gReady():S.grades,b=gBest();
  S.life.grow={family:fam,friends:fr,grades:gr,best:b?b.n:null,kids:KIDS.filter(k=>gMet(k.id)).map(k=>({n:k.n,f:Math.round(gF(k.id))}))};
  for(const k in S.stats)if(typeof S.stats[k]==='number')S.life.tot[k]=(S.life.tot[k]||0)+S.stats[k];
  setMode('adult');const A=newState(),keep=S.money;
  for(const k in A) S[k]=A[k];
  S.mode='adult';S.money=keep+Math.round(fam*4);S.job=jk;S.jobPicked=true;S.alarm=JOBS[jk].alarm;
  S.community=clamp(5+Math.round(fr*0.5),0,100);S.standing=clamp(50+Math.round(gr*0.3),0,100);S.stress=25;
  Object.assign(S.life,{family:fam,rentHelp:Math.round(fam*3/10)*10,rentHelpLeft:12,path,parttime:path!=='job',prog:0,done:false,graduated:true});
  S.stage='adult';S.life.stages.push({stage:'adult',age:S.age,d:day()});S.life.jobs.push({job:jk,age:S.age,path});
  lifeMoment('🎓',`Graduated from Hilltop High${path==='college'?', then started at UW Tacoma':path==='trade'?', then started a trade program':`, then went to work: ${JOBS[jk].role}`}.`);
  S.rent.paid=true;S.rent.due=-1;   // the first rent is set when the next key week starts
  S.loc='home';S.visited={home:true};lifeSync();saveGame();
  const J=JOBS[jk];
  modalSwap('🏠 Your own place',`<p>A third-floor walk-up on Hilltop, a bed, six boxes and a window that looks at the mountain. Same neighborhood, new key.</p>
    <div class="sect">What you bring with you</div>
    <div class="kv"><span>🏠 Family ${fam}</span><b>${$(S.life.rentHelp)} a month toward rent, for a year</b></div>
    <div class="kv"><span>🤝 Friends ${fr}</span><b>Community starts at ${S.community}</b></div>
    <div class="kv"><span>📚 Grades ${gr}</span><b>Job standing starts at ${S.standing}</b></div>
    <div class="kv"><span>💵 Savings</span><b>${$(Math.round(S.money))} (with graduation money)</b></div>
    <div class="kv"><span>${J.ic} Work</span><b>${J.role}, ${J.place}${path!=='job'?' (part-time)':''}</b></div>
    <p style="font-size:13px;color:var(--mute)">The same save goes on: this is the young-adult chapter, the adult game.</p>`,
    [{l:'🔑 Pick up the keys',fn:()=>{next()}}],true);
}

// ---- the end ----
function lifeScore(){
  const sn=(S.life&&S.life.snaps||[]).slice().sort((a,b)=>a.kw-b.kw),k=lifeKw();
  if(!sn.some(x=>x.kw===S.kwi))sn.push({kw:S.kwi,start:k.start,score:lifeWeekScore()});
  const end=Math.min(day(),lifeRange(k).to)+1;let w=0,t=0;
  sn.forEach((x,j)=>{const nx=j+1<sn.length?sn[j+1].start:end,m=Math.max(1,nx-x.start)/30.44;w+=m;t+=x.score*m});
  return Math.round(w?t/w:0);
}
const lifeMonths=()=>Math.max(0.5,Math.round((Math.min(day(),lifeRange(lifeKw()).to)+1)/30.44*2)/2);
{const fi=finish;finish=function(){if(!lifeLong())return fi();if(S.length==='life')return endLife('oldage');lifeFinish('done')}}
function lifeFinish(kind){
  S.over=true;clearTiles();closeModals();sfx('win');S.life&&(S.life.ended=kind);
  const L0=LIFE_LEN[S.length]||LIFE_LEN.quick;
  if(!lifeLong()) return endScreen('{{name}}, you called it here',`You stopped on ${fullDate(day())}. ${FINISH_TEXT.sub()}`);
  endScreen(kind==='here'?`{{name}}, you called it here`:`{{name}}: ${L0.n} on Hilltop`,`${fullDate(0)} to ${fullDate(day())}. Age ${S.startAge} to ${S.age}, ${S.keyWeeks.slice(0,S.kwi+1).length} key weeks played.`);
}
function endLife(reason){
  if(!S)return;S.over=true;clearTiles();closeModals();S.life.ended=reason;
  const memo=reason==='death';
  const top=memo?(typeof LIFE_HOOKS.memorial==='function'?LIFE_HOOKS.memorial():`<h1>In memory of {{name}}</h1><p>${fullDate(0).slice(4)} on Hilltop, at ${S.startAge}, to ${fullDate(day())}, at ${S.age}. The block club sets out folding chairs and everybody brings a dish.</p>`)
    :`<h1>A life on Hilltop</h1><p>{{name}}, from ${S.startAge} to ${S.age}: ${fullDate(0)} to ${fullDate(day())}.</p>`;
  app.innerHTML=withName(`<div class="end life-sum">${top}${lifeSummaryHTML()}<button class="big" style="width:100%;margin-top:22px" onclick="lifeToScore()">See the score</button></div>`);
  window.scrollTo(0,0);sfx(memo?'info':'win');
}
window.endLife=endLife;
window.lifeToScore=()=>endScreen(S.life.ended==='death'?'In memory of {{name}}':'{{name}}, a whole life on Hilltop',`Age ${S.startAge} to ${S.age}. ${S.life.moments.length} moments worth remembering.`);
function lifeSummaryHTML(){
  const L1=S.life,sect=(h,b)=>b?`<div class="sect" style="margin-top:14px">${h}</div>${b}`:'',kv=(k,v)=>`<div class="kv"><span>${k}</span><b style="text-align:right">${v}</b></div>`;
  const stg={middle:'🏫 Middle school',high:'🎓 High school',adult:'🏠 Adult'};
  const stages=L1.stages.map((x,j)=>kv(stg[x.stage]||x.stage,`from age ${x.age} (${fullDate(x.d).slice(4)})`)).join('');
  const jobs=L1.jobs.map(j=>kv(`${JOBS[j.job].ic} ${cap(JOBS[j.job].role)}`,`from age ${j.age}${j.path==='college'?', with college':j.path==='trade'?', with a trade program':''}`)).join('')+(L1.retired?kv('🎉 Retired','at 67'):'');
  const kids=L1.grow?L1.grow.kids:(typeof KIDS!=='undefined'&&S.kids?KIDS.filter(k=>S.kids[k.id]&&S.kids[k.id].met).map(k=>({n:k.n,f:Math.round(S.kids[k.id].f)})):[]);
  const nb=typeof NEIGHBORS!=='undefined'&&S.met?NEIGHBORS.filter(x=>S.met[x.id]).map(x=>x.n):[];
  const people=(kids.length?kv('🤝 Friends from growing up',kids.map(k=>k.n).join(', ')):'')+(L1.grow&&L1.grow.best?kv('⭐ Best friend',L1.grow.best):'')+(nb.length?kv('🏘️ Neighbors',nb.slice(0,8).join(', ')+(nb.length>8?` and ${nb.length-8} more`:'')):'')+kv('🏠 Family',isGrow()?S.family:Math.round(L1.family));
  const mom=L1.moments.slice(-14).map(m=>`<div class="todo"><span class="ck">${m.ic}</span><div><b>Age ${m.age}</b><span>${m.t}</span></div></div>`).join('');
  return sect('Stages',stages)+sect('Work',jobs)+sect('People',people)+sect('Moments',mom);
}
// best scores: one per length, and every run's length and starting age
const RUNS_KEY=KEY('runs');
function lifeRuns(){try{const a=JSON.parse(localStorage.getItem(RUNS_KEY)||'[]');return Array.isArray(a)?a:[]}catch(e){return []}}
function lifeRecord(sc,lost){if(lost)return false;const a=lifeRuns(),len=(S&&S.length)||'quick',prev=a.filter(r=>r.len===len).reduce((m,r)=>Math.max(m,r.sc),-Infinity);
  a.push({sc,len,age:(S&&S.startAge)||18,end:S&&S.age,mode:isGrow()?'grow':'adult',name:currentName(),at:Date.now()});a.sort((x,y)=>y.sc-x.sc);
  try{localStorage.setItem(RUNS_KEY,JSON.stringify(a.slice(0,30)))}catch(e){}return sc>prev}
function bestScoresModal(back){
  const a=lifeRuns();
  const per=LIFE_ORDER.map(k=>{const r=a.filter(x=>x.len===k)[0];return `<div class="kv"><span>${LIFE_LEN[k].ic} ${LIFE_LEN[k].n}</span><b>${r?`${grp(r.sc)} · start ${r.age}`:'—'}</b></div>`}).join('');
  const list=a.slice(0,12).map((r,i)=>`<div class="kv"><span>${i+1}. ${esc(r.name||'')} <small style="display:block;color:var(--mute);font-weight:400">${LIFE_LEN[r.len]?LIFE_LEN[r.len].n:r.len} · starting age ${r.age}${r.end&&r.end!==r.age?` → ${r.end}`:''}</small></span><b>${grp(r.sc)}</b></div>`).join('');
  modal('🏅 Best scores',`<p style="font-size:13px;color:var(--mute)">Scores are per month played, so every length compares fairly. Each length keeps its own best.</p><div class="sect">Best for each length</div>${per}<div class="sect">Every run</div>${list||'<p>No finished runs yet.</p>'}`,
    (back?[{l:'Back',fn:back}]:[]).concat([{l:'Close',fn:()=>{}}]));
}
window.bestScoresModal=bestScoresModal;
{const es=endScreen;endScreen=function(h1,sub,lost){
  if(!lifeLong()){const sc=Math.round(scoreOf());es(h1,sub,lost);lifeRecord(sc,lost);lifeEndExtras();return}
  achCheck({end:true,lost});const achNew=(S.achGame||[]).map(id=>ACH.find(a=>a.id===id)).filter(Boolean);
  const sc=lifeScore(),g=lost?['F','Cut Short','A life that ends early is graded F, but every month still counts.']:gradeOf(sc);
  saveGame();
  const BK=KEY('best.'+S.length);let best=null,newBest=false;
  try{const b=Number(localStorage.getItem(BK)||'NaN');best=isNaN(b)?null:b;if(!lost&&(best==null||sc>best)){localStorage.setItem(BK,String(sc));newBest=true}}catch(e){}
  lifeRecord(sc,lost);
  const L0=LIFE_LEN[S.length],kv=(k,v)=>`<div class="kv"><span>${k}</span><b style="text-align:right">${v}</b></div>`;
  app.innerHTML=withName(`<div class="end"><div style="display:flex;justify-content:space-between;align-items:center"><div class="small-note" style="color:var(--mute)">${lost?'GAME OVER':'COMPLETE'} · {{name}} · ${L0.ic} ${L0.n}</div><button class="gear" style="background:var(--surface);color:var(--ink)" onclick="openSettings()" aria-label="Settings">⚙️</button></div><h1>${h1}</h1><p>${sub}</p>
  <div style="display:flex;gap:16px;align-items:center;margin:16px 0"><div class="grade">${g[0]}</div><div><b style="font-family:var(--serif);font-size:20px">${g[1]}</b><div style="color:var(--mute);font-size:14px">${g[2]}</div></div></div>
  ${kv('Score (per month played)',`${grp(sc)}${newBest?' 🏆 new best':''}`)}${best!=null?kv(`Previous best, ${L0.n}`,grp(best)):''}
  ${kv('Length',`${L0.ic} ${L0.n}${S.lengthLog.length?` (switched ${S.lengthLog.length}×)`:''}`)}${kv('Starting age',`${S.startAge} → ${S.age}`)}${kv('Months played',lifeMonths())}${kv('Key weeks played',`${S.kwi+1} of ${S.keyWeeks.length}`)}
  ${kv('Difficulty',`${DF().ic} ${DF().n}`)}${kv('🏆 Achievements this game',achNew.length?achNew.map(a=>a.ic+' '+a.n).join(', '):'none new')}
  ${lifeSummaryHTML()}
  <button class="big" style="width:100%;margin-top:22px" onclick="lifeAgain()">Play again: ${L0.n}, age ${S.startAge}</button>
  <button class="act" style="margin-top:10px;justify-content:center" onclick="bestScoresModal()"><span class="tx" style="text-align:center"><b>🏅 Best scores</b></span></button>
  <button class="act" style="margin-top:10px;justify-content:center" onclick="titleScreen()"><span class="tx" style="text-align:center"><b>Back to title</b></span></button></div>`);
  window.scrollTo(0,0);
}}
function lifeEndExtras(){const e=document.querySelector('.end');if(!e||e.querySelector('#bestBtn'))return;const b=[...e.querySelectorAll('button')].pop();
  if(b)b.insertAdjacentHTML('beforebegin','<button id="bestBtn" class="act" style="margin-top:10px;justify-content:center" onclick="bestScoresModal()"><span class="tx" style="text-align:center"><b>🏅 Best scores</b></span></button>')}
window.lifeAgain=()=>{const p={length:S.length,startAge:S.startAge,birthday:lifeRandBirthday()};lifeStartWith(p)};

// ---- the start screen: pick a length and a starting age ----
let LP={length:'6m',startAge:18,birthday:null};
function lifePlanText(p){
  const o={startDate:LIFE_START[p.startAge],startAge:p.startAge,birthday:p.birthday},w=lifeBuild(p.length,o),e=w[w.length-1].end;
  const endAge=p.startAge+[...Array(90)].findIndex((_,j)=>lifeBday(o,p.startAge+j+1)>e);
  return {weeks:w.length,end:`${dAt(o.startDate,e).label}, ${dAt(o.startDate,e).y}`,start:`${dAt(o.startDate,0).label}, ${dAt(o.startDate,0).y}`,endAge};
}
function lifeStartModal(){
  if(!LP.birthday)LP.birthday=lifeRandBirthday();
  const t=lifePlanText(LP),setup={12:'Growing Up: your family just moved to Hilltop, a week before seventh grade at Summit View Middle School.',15:'Growing Up: a high school sophomore at Hilltop High. Curfew 10 PM.',18:'Your own apartment on Hilltop, a job to pick and rent to make.'}[LP.startAge];
  const chip=(k,v,lab,on)=>`<button class="lchip${on?' on':''}" aria-pressed="${on}" onclick="lifePick('${k}','${v}')">${lab}</button>`;
  const body=`<div class="sect">How long?</div><div class="lchips">${LIFE_ORDER.map(k=>chip('length',k,`${LIFE_LEN[k].ic} ${LIFE_LEN[k].n}`,LP.length===k)).join('')}</div>
    <p class="lnote">${LIFE_LEN[LP.length].d}</p>
    <div class="sect">Starting age</div><div class="lchips">${LIFE_AGES.map(a=>chip('startAge',a,`${a}`,LP.startAge===a)).join('')}</div>
    <p class="lnote">${setup}</p>
    <div class="lplan"><div class="kv"><span>🎂 Your birthday</span><b>${LP.birthday.label} <button class="lchip sm" onclick="lifePick('birthday','')" aria-label="Pick another birthday">🎲</button></b></div>
    <div class="kv"><span>📅 Starts</span><b>${t.start}</b></div><div class="kv"><span>🏁 Ends</span><b>${t.end}${LP.length==='quick'?'':` (age ${t.endAge})`}</b></div>
    <div class="kv"><span>⭐ Key weeks</span><b>${t.weeks}${LP.length==='quick'?' (one long stretch)':', with a summary between them'}</b></div></div>`;
  const btns=[{l:'▶️ Start this life',s:`${LIFE_LEN[LP.length].n}, starting at ${LP.startAge}. Next: pick a difficulty.`,fn:()=>lifeStartWith(Object.assign({},LP))},{l:'Cancel',fn:()=>{}}];
  const el=document.getElementById('mbg');
  if(el&&el.dataset.life){SWAPOK=true;try{modalSwap('🌱 Start a new life',body,btns)}finally{SWAPOK=false}el.dataset.life='1';return}
  modal('🌱 Start a new life',body,btns);const m=document.getElementById('mbg');if(m)m.dataset.life='1';
}
window.lifeStartModal=lifeStartModal;
window.lifePick=(k,v)=>{if(k==='birthday')LP.birthday=lifeRandBirthday();else LP[k]=k==='startAge'?+v:v;lifeStartModal()};
function lifeStartWith(p){
  const run=k=>{setMode(p.startAge<18?'grow':'adult');LIFE_PICK=p;newGame(k);render()};
  const pd=()=>{setMode(p.startAge<18?'grow':'adult');diffModal(run)};
  if(!profileName())nameModal({first:true,then:pd});else pd();
}
window.lifeStartWith=lifeStartWith;
// the start page row (31-grow-story.js calls this after it adds the Growing Up row)
function lifeTitleRow(after){
  const b=document.createElement('div');b.className='t-main t-liferow';
  b.innerHTML='<button id="lifeBtn" class="t-btn t-life" onclick="lifeStartModal()"><span class="t-ic" aria-hidden="true">🌱</span><span class="t-tx"><b>New life (new)</b><span>Pick a length, 6 months to a lifetime, and a starting age: 12, 15 or 18</span></span></button>';
  after.before(b);
  const g=document.querySelector('.title .tgrid');if(g&&!g.querySelector('#bestTBtn')){g.insertAdjacentHTML('beforeend','<button id="bestTBtn" class="ghost" onclick="bestScoresModal()">🏅 Best scores</button>');
    const c=[...g.children];c.forEach(x=>x.classList.remove('wide'));if(c.length%2)c[c.length-1].classList.add('wide')}
}

// ---- ⚙️ Settings → 🎮 Game options (08-settings.js shows the button during a game) ----
const DIFF_ORDER=['easy','normal','hard'];
const lifeWeekNo=()=>Math.floor(day()/7);
function lifeKwLeft(ws,from){return ws.filter(k=>k.start>from).length}
function gameOptionsModal(){
  if(!S||S.over)return;
  const L0=LIFE_LEN[S.length]||LIFE_LEN.quick,end=lifeEndDay(S),left=lifeKwLeft(S.keyWeeks,lifeKw().start);
  const dLock=S.life.diffWk===lifeWeekNo();
  modal('🎮 Game options',`<p>${L0.ic} <b>${L0.n}</b> · started at ${S.startAge} · now ${S.age}. Key week ${S.kwi+1} of ${S.keyWeeks.length}, ending ${fullDate(end)}.</p>`,[
    {l:`📏 Game length: ${L0.n}`,s:`Ends ${fullDate(end)}. ${left} key week${left===1?'':'s'} left after this one. Tap to lengthen, shorten or finish here.`,fn:()=>lengthModal()},
    {l:`🎂 Starting age: ${S.startAge}`,s:'Set when this life began. Start a new game to pick another age.',dis:true,fn:()=>{}},
    {l:`🎒 Mode: ${isGrow()?'Growing Up':'Adult'}`,s:isGrow()?'Set by your age: Growing Up turns into the adult game at 18, in this same save.':'Set by your age: from 18 on, it’s the adult game.',dis:true,fn:()=>{}},
    {l:`🎚️ Difficulty: ${DF().ic} ${DF().n}`,s:dLock?'Changed this week already. One step at a time, at most once a week.':'One step easier or harder, at most once a week.',dis:dLock,fn:()=>diffStepModal()},
    {l:`🔔 Event pop-ups: ${popupsOn()?'On':'Off'}`,s:'An OK window for each event during the day, or just tiles.',fn:()=>{try{localStorage.setItem(POPUP_KEY,popupsOn()?'off':'on')}catch(e){}gameOptionsModal()}},
    {l:`💡 Tips: ${prefs().tips?'On':'Off'}`,s:'One short tip at a time.',fn:()=>{setPref('tips',!prefs().tips);gameOptionsModal()}},
    {l:`📅 Week play: ${S.life.weekPlay==='highlights'?'Highlights':'Full week'}`,s:!lifeLong()?'Quick play always plays every day.':S.life.weekPlay==='highlights'?'You play 3 days of each key week. Tap for the full week (from the next key week).':'You play all 7 days of each key week. Tap for highlights: 3 days each (from the next key week).',dis:!lifeLong(),fn:()=>{S.life.weekPlay=S.life.weekPlay==='highlights'?'full':'highlights';lifeSync();saveGame();gameOptionsModal()}},
    {l:'✏️ Rename your character',s:`Now: ${esc(currentName())}.`,fn:()=>nameModal({back:gameOptionsModal})},
    {l:'Back to settings',fn:()=>openSettings()},{l:'Close',fn:()=>{}}]);
}
window.gameOptionsModal=gameOptionsModal;
function diffStepModal(){
  const i=DIFF_ORDER.indexOf(S.diff),opt=[i-1,i+1].filter(j=>j>=0&&j<DIFF_ORDER.length).map(j=>DIFF_ORDER[j]);
  modal('🎚️ Difficulty',`<p>Now: ${DF().ic} <b>${DF().n}</b>. One step at a time, once a week. It changes prices, luck and strain from here on; it never changes the score.</p>`,
    opt.map(k=>({l:`${DIFF_ORDER.indexOf(k)<i?'Easier':'Harder'}: ${DIFFS[k].ic} ${DIFFS[k].n}`,s:DIFFS[k].d,np:true,fn:()=>{S.diff=k;S.life.diffWk=lifeWeekNo();setPref('diff',k);say(`🎚️ Difficulty is now ${DIFFS[k].ic} ${DIFFS[k].n}.`);gameOptionsModal()}})).concat([{l:'Back',fn:()=>gameOptionsModal()}]));
}
// the schedule a switch to `len` would give: past key weeks stay, the future is rebuilt
function lifePlan(len){
  const cur=lifeKw(),r=lifeRange(cur);
  if(len==='quick'){const q=lifeBuild('quick',S)[0];if(S.kwi>0||q.end<day())return null;return [Object.assign({},q,{from:0,to:q.end})]}
  const all=lifeBuild(len,S),end=all[all.length-1].end;
  if(end<Math.max(day(),r.to))return null;
  return S.keyWeeks.slice(0,S.kwi+1).concat(all.filter(k=>k.start>cur.end));
}
function lengthModal(){
  const cur=LIFE_ORDER.indexOf(S.length);
  const btns=LIFE_ORDER.filter(k=>k!==S.length).map(k=>{const p=lifePlan(k),longer=LIFE_ORDER.indexOf(k)>cur;
    if(!p){const all=lifeBuild(k,S);return {l:`${LIFE_LEN[k].ic} ${LIFE_LEN[k].n}`,s:`Too short now: it ends ${fullDate(all[all.length-1].end)}, and you’re past that. Finish here instead.`,dis:true,fn:()=>{}}}
    const e=lifeRange(p[p.length-1],S).to,left=lifeKwLeft(p,lifeKw().start);
    return {l:`${longer?'➕ Lengthen':'➖ Shorten'} to ${LIFE_LEN[k].ic} ${LIFE_LEN[k].n}`,s:`Ends ${fullDate(e)} · ${left} key week${left===1?'':'s'} left.`,np:true,fn:()=>confirmLength(k,p)}});
  modal('📏 Game length',`<p>Now: ${LIFE_LEN[S.length].ic} <b>${LIFE_LEN[S.length].n}</b>. Lengthen any time. Shorten only to a length that still ends ahead of today; otherwise, finish here.</p>`,
    btns.concat([{l:'🏁 Finish here',s:'End this game now and get your score (per month played).',np:true,fn:()=>modal('🏁 Finish here?',`<p>End now, on ${fullDate(day())}, and see your score?</p>`,[{l:'Finish here',fn:()=>lifeFinish('here')},{l:'Back',fn:()=>lengthModal()}])},{l:'Back',fn:()=>gameOptionsModal()}]));
}
function confirmLength(k,p){
  const e=lifeRange(p[p.length-1],S).to,left=lifeKwLeft(p,lifeKw().start);
  modal(`📏 Switch to ${LIFE_LEN[k].n}?`,`<div class="kv"><span>New end</span><b>${fullDate(e)}</b></div><div class="kv"><span>Key weeks left</span><b>${left} after this one</b></div>
    <p style="font-size:13px;color:var(--mute)">${p.slice(S.kwi+1,S.kwi+6).map(w=>`${kwName(w)} (${monthDay(w.start)})`).join(' · ')}${left>5?' …':''}</p>`,
    [{l:`Switch to ${LIFE_LEN[k].n}`,fn:()=>lifeSetLength(k,p)},{l:'Back',fn:()=>lengthModal()}]);
}
function lifeSetLength(k,p){
  p=p||lifePlan(k);if(!p)return false;
  S.lengthLog.push({d:day(),from:S.length,to:k});S.length=k;S.keyWeeks=p;
  if(k==='quick'&&!isGrow()&&!S.rent.paid)S.rent.due=p[0].to;
  lifeSync();say(`📏 Game length: ${LIFE_LEN[k].n}, ending ${fullDate(lifeEndDay(S))}.`);saveGame();return true;
}
window.lifeSetLength=lifeSetLength;
// tests and debugging: play through `n` key weeks fast (stats kept safe), answering every pop-up with its first button
window.lifeFF=(n=1e9,safe=true)=>{
  let k=0,guard=0,last=S&&S.kwi;
  while(S&&!S.over&&guard++<20000){
    if(S.kwi!==last){k++;last=S.kwi}
    if(k>=n&&!document.getElementById('mbg'))break;
    const m=document.getElementById('mbg');
    if(m){const bs=[...m.querySelectorAll('.modal > button.act')],i=bs.findIndex(b=>!b.disabled);if(i>=0)MBTN(i);else m.remove();continue}
    if(safe){if(isGrow()){S.family=Math.max(S.family,50);S.mood=Math.max(S.mood,50)}else{S.money=Math.max(S.money,2500);S.standing=Math.max(S.standing,60);S.stress=Math.min(S.stress,40);S.food=Math.max(S.food,2);if(!S.rent.paid&&S.money>=S.rent.amt){money(-S.rent.amt);S.rent.paid=true;S.rent.paidDay=day()}}}
    S.loc='home';endDay('home');
  }
  return {kwi:S&&S.kwi,over:!S||S.over,cur:S&&S.cur};
};
