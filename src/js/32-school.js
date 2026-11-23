// ============================================================
//  TACOMPTON · SCHOOL YEARS: middle school (12–13, Summit View Middle School) and high school (14–17, Hilltop High)
//  in the longer Growing Up games. Loaded after 31-grow-story.js. Nothing here runs in Quick play or the adult game.
//
//  - School days: on isSchoolDay() a "Go to school" action (first bell 8:15 AM, out at 2:45 PM), homework at home after.
//    Skipping school costs Grades and Family (the attendance line calls home). Winter brings the odd snow day.
//  - The school calendar (SCH_TERMS): each school year has key dates. Middle school: the first day, the fall concert,
//    winter break, spring testing week and the last day (yearbooks). High school: orientation, finals in December and
//    June, prom as a friends' night out (16+), a summer job (16+), and graduation week (the engine's 'graduation' week).
//    A term happens on its own day if you play it, or on the nearest played day of its window in that key week.
//  - The scheduler (LIFE_HOOKS.plan in 10-life.js): a kid's month / season / milestone key weeks move onto these dates
//    when one is close by, so the longer games land on the weeks that matter.
//  Friendship, family, school and growing up only: prom is a group of friends, nothing else.
// ============================================================

const SCH_OUT=885;          // 2:45 PM: the last bell
const SCH_LATE=720;         // after noon, "Go to school" is gone and the day counts as skipped
let SCH_SNOW=0.15;          // chance of a snow day on a winter school morning (once a key week at most; tests set it to 1)
G_CATS.term='🏫 School';

// ---- state (in the Growing Up save, S.sch) ----
const schBlank=()=>({done:{},plan:{},went:{},skip:{},snow:{},ens:null,practice:{},job:{},fam:{},cocoa:{},sled:{},orient:false,skips:0,days:0,firstJob:false,gradWeek:false});
{const ns=GROW.newState;GROW.newState=()=>Object.assign(ns(),{sch:schBlank()})}
const SC=()=>S.sch||(S.sch=schBlank());
// snow days: 33-seasons.js's weather (wxOf) closes school by itself when it's loaded; otherwise a random winter morning here does
const schWx=()=>typeof wxOf==='function';
const schSnow=d=>!!SC().snow[d]||(schWx()&&d>gSchoolDay()&&schoolOn(dateOf(d))&&wxOf(d)==='snow');

// ---- the school calendar: school year Y starts in late summer of Y (day indices for a run starting on sd) ----
const SCH_CAL={};
function schCal(sd,Y){
  const key=sd+'|'+Y;if(SCH_CAL[key])return SCH_CAL[key];
  const ix=(y,m,d)=>dIdx(sd,y,m,d),dw=i=>dAt(sd,i).dow;
  const s1=ix(Y,9,1),first=s1-dw(s1);                                 // the Monday of the week of Sept 1
  let last=ix(Y+1,6,15);while(!schoolOn(dAt(sd,last)))last--;          // June 15, or the weekday before
  const n1=ix(Y,11,1),concert=n1+((3-dw(n1)+7)%7)+14;                 // the Thursday a week before Thanksgiving
  const d15=ix(Y,12,15),decMon=d15-dw(d15);                           // finals: the school week of Dec 15
  const m12=ix(Y+1,5,12),mayMon=m12-dw(m12);                          // testing: the school week of May 12
  const y1=ix(Y+1,5,1),prom=y1+((5-dw(y1)+7)%7)+14;                    // the third Saturday in May
  let junMon=last-dw(last);if(last-junMon<2)junMon-=7;                 // June finals: the last week or so of school
  const su=ix(Y+1,6,16),sumMon=su+((7-dw(su))%7);                     // summer: from June 16
  return SCH_CAL[key]={Y,first,last,concert,decMon,winter:[ix(Y,12,20),ix(Y+1,1,2)],mayMon,prom,junMon,summer:[su,ix(Y+1,8,31)],sumMon};
}
const schY=d=>{const o=dateOf(d);return o.m>=7?o.y:o.y-1};
// type: 'school' happens at school (when you go in), 'evening' is an action at home, 'plan' is a choice in the morning.
// st: the stage it belongs to; age: the youngest age; key: the scheduler aims key weeks at it (true, or only in that stage)
const SCH_TERMS=[
  {id:'orient',type:'school',st:'high',once:true,win:c=>[c.first-7,c.last],pref:c=>c.first-4,n:'Orientation at Hilltop High',ic:'🗺️'},
  {id:'first',type:'school',key:true,win:c=>[c.first,c.first+4],pref:c=>c.first,n:'The first day of school',ic:'🏫'},
  {id:'concert',type:'evening',st:'middle',key:true,win:c=>[c.concert-3,c.concert+2],pref:c=>c.concert,at:[1050,1200],n:'The fall concert',ic:'🎵'},
  {id:'finalsDec',type:'plan',st:'high',key:true,win:c=>[c.decMon,c.decMon+4],pref:c=>c.decMon,n:'Finals week',ic:'📝'},
  {id:'winter',type:'plan',key:'middle',win:c=>c.winter,pref:c=>c.winter[0]+1,n:'Winter break',ic:'❄️'},
  {id:'testing',type:'plan',st:'middle',key:true,win:c=>[c.mayMon,c.mayMon+4],pref:c=>c.mayMon,n:'Spring testing week',ic:'📝'},
  {id:'prom',type:'evening',st:'high',age:16,key:true,win:c=>[c.prom-5,c.prom+1],pref:c=>c.prom,at:[1020,1200],n:'Prom night with your friends',ic:'🪩'},
  {id:'finalsJun',type:'plan',st:'high',win:c=>[c.junMon,c.last],pref:c=>c.junMon,n:'June finals',ic:'📝'},
  {id:'last',type:'school',key:true,win:c=>[c.last-4,c.last],pref:c=>c.last,n:'The last day of school',ic:'📖'},
  {id:'job',type:'plan',st:'high',age:16,key:true,win:c=>c.summer,pref:c=>c.sumMon,n:'A summer job',ic:'💼'},
];
const schT=id=>SCH_TERMS.find(t=>t.id===id);
const schKey=(t,c)=>t.id+':'+c.Y;
const schOn=()=>typeof S!=='undefined'&&!!S&&isGrow()&&lifeLong()&&(S.age||12)<18;
function schOk(t){if(!schOn())return false;if(t.st&&t.st!==stage())return false;if(t.age&&S.age<t.age)return false;if(t.once&&SC()[t.id])return false;return true}
function schCan(t,x,p){
  if(t.type!=='school')return !(t.id==='concert'&&schSnow(x));   // a snow day puts the concert off to another night
  if(isSchoolDay(x)&&x>gSchoolDay()&&!schSnow(x))return true;
  return t.id==='orient'&&x===p&&!isSchoolDay(x)&&x!==gSchoolDay();   // orientation: the Thursday before school starts
}
// the day this key week a term happens on: its own day if you play it, else the next played day in its window (or the last one before)
function schWhen(t,c){
  const [a,b]=t.win(c),p=t.pref(c),days=lifeWeekDays().filter(x=>x>=a&&x<=b&&schCan(t,x,p));
  if(!days.length)return null;if(days.includes(p))return p;
  const af=days.find(x=>x>p);return af!=null?af:days[days.length-1];
}
function schToday(d,type){
  if(d==null)d=day();const out=[];if(!schOn())return out;const Y0=schY(d);
  for(const Y of [Y0,Y0-1]){const c=schCal(lifeStartDate(),Y);
    for(const t of SCH_TERMS){if(type&&t.type!==type)continue;if(!schOk(t))continue;const [a,b]=t.win(c);if(d<a||d>b)continue;
      const k=t.once?t.id:schKey(t,c);if(SC().done[k])continue;if(schWhen(t,c)!==d)continue;out.push({t,c,k})}}
  return out;
}
// is day d inside term id's window this school year (for test days and finals)? → {t, c, k}
function schIn(id,d){if(d==null)d=day();const t=schT(id);if(!schOk(t))return null;const Y0=schY(d);
  for(const Y of [Y0,Y0-1]){const c=schCal(lifeStartDate(),Y),[a,b]=t.win(c);if(d>=a&&d<=b)return {t,c,k:schKey(t,c)}}return null}
function schDone(x){SC().done[x.k]=true;if(x.t.once)SC()[x.t.id]=true}
// the terms still to come in this key week (the Week tab, the first morning)
function schWeekList(){if(!schOn())return [];const out=[],seen={};
  for(const x of lifeWeekDays())for(const it of schToday(x))if(!seen[it.k]){seen[it.k]=1;out.push(Object.assign({d:x},it))}
  return out.sort((a,b)=>a.d-b.d)}

// ---- effects: {grades, friends, family, mood, energy, money} ----
const SCH_FX=[['grades','Grades'],['friends','Friends'],['family','Family'],['mood','Mood'],['energy','Energy'],['money','Money']];
const schFxTxt=e=>SCH_FX.filter(([k])=>e[k]).map(([k,n])=>`${n} ${e[k]>0?'+':'−'}${k==='money'?$(Math.abs(e[k])):Math.abs(e[k])}`).join(', ');
const schPals=()=>KIDS.filter(k=>gMet(k.id)).sort((a,b)=>gF(b.id)-gF(a.id));
const schNames=a=>a.length<2?a.map(k=>k.n).join(''):a.slice(0,-1).map(k=>k.n).join(', ')+' and '+a[a.length-1].n;
const schCrew=()=>{const p=schPals().slice(0,3);return p.length?schNames(p):'a few kids from your homeroom'};
function schFriends(n){const p=schPals();
  if(!p.length){const k=pick(KIDS);gFriend(k.id,n);return}
  gFriend(p[0].id,Math.ceil(n/2));if(p[1])gFriend(p[1].id,Math.floor(n/2));else gFriend(p[0].id,Math.floor(n/2))}
function schFx(e){
  if(e.grades)S.grades=clamp(gGrades()+e.grades,0,100);
  if(e.family)adj('family',e.family);if(e.mood)adj('mood',e.mood);if(e.energy)adj('energy',e.energy);
  if(e.money){if(e.money<0)gSpend(-e.money);else gEarn(e.money)}
  if(e.friends)schFriends(e.friends);
}
// a choice button: {l, s?, e:{…}, t:'what happens' or ()=>text, dis?, then?}
const schBtn=c=>({l:c.l,s:[c.s,schFxTxt(c.e||{})].filter(Boolean).join(' '),dis:!!c.dis,fn:()=>{const t=typeof c.t==='function'?c.t():c.t;schFx(c.e||{});if(t)say(t);if(c.then)c.then()}});
// the grade you're in this school year: from your age on its first day (a spring birthday doesn't move you up a grade in June)
const schAgeOn=x=>{let a=S.startAge;while(a<99&&lifeBday(S,a+1)<=x)a++;return a};
const schGrade=c=>({12:'seventh',13:'eighth',14:'ninth',15:'tenth',16:'eleventh',17:'twelfth'})[clamp(schAgeOn(c.first),12,17)];
const schP=(...l)=>l.filter(Boolean).map(t=>`<p>${t}</p>`).join('');

// ---- the school day (replaces 10-life.js's built-in one) ----
LIFE_HOOKS.schoolDay=d=>{
  const s=SC(),o=dateOf(d),kw=lifeKw(),r=kw?lifeRange(kw):{from:d,to:d};
  if(S.age>=18)return;
  const snowWk=Object.keys(s.snow).some(x=>+x>=r.from&&+x<=r.to);
  if(!schWx()&&(o.m===12||o.m<=2)&&!snowWk&&Math.random()<SCH_SNOW){
    s.snow[d]=true;
    say(`❄️ <b>Snow day!</b> Two inches on the hill overnight, and ${gSchoolShort()} is closed. ${pick(['The whole street is quiet and blue. Nia is already at the window in her coat.','The Link is crawling up MLK, and every kid on the block is outside before 9.','Dad reads the closure off his phone twice, like it might change. It doesn’t.'])}`);
    if(!s.snowYet){s.snowYet=true;lifeMoment('❄️','The first snow day on Hilltop: school closed, the whole hill white.')}
    return;
  }
  say(`🏫 School today at ${gSchoolShort()}: first bell ${fmt(G_BELL)}, out at ${fmt(SCH_OUT)}. It’s ${travelMins('home','school')} minutes up the hill. Homework after.`);
};
const schPending=(d=day())=>schOn()&&d>gSchoolDay()&&isSchoolDay(d)&&!schSnow(d)&&!SC().went[d];
const SCH_DAY={
  middle:['Science lab: you and your partner get the baking-soda volcano to erupt on the second try.','PE was the mile. You walked part of it. So did the teacher.','Social studies: a map of Puget Sound and a whole period on why it’s called a sound.','Band, sixth period. The tubas win, as always.','Lunch in the cafeteria, at a table that is yours now.','A fire drill in the drizzle. Everybody pretends to hate it.','A substitute in math who turns out to be a retired engineer with great stories.'],
  high:['Chemistry: a flame test that turns the whole lab green.','English: a poem you read twice, and the second time it lands.','Algebra II: a quiz you were ready for, mostly.','Lunch in the commons, loud as a train station.','A pep assembly in the gym. The drumline shakes the bleachers.','History: a debate that runs long and nobody minds.','Art: the teacher hangs your sketch of MLK on the wall by the door.'],
};
const SCH_TEST={
  testing:['📝 Testing: reading. Two long passages, then an essay about one of them.','📝 Testing: math. No calculator for the first half.','📝 Testing: science. A whole section on the water cycle, which you have seen on this hill all year.'],
  finalsDec:['📝 Finals: English, an in-class essay.','📝 Finals: chemistry, the whole periodic table in your head.','📝 Finals: algebra, ninety minutes and a lot of eraser.','📝 Finals: history, a document question about the railroad coming to Tacoma.'],
};
SCH_TEST.finalsJun=SCH_TEST.finalsDec;
const SCH_PREP={good:2,ok:1,none:-1};
function schGo(){
  const s=SC(),d=day(),arrive=tod()+travelMins(S.loc,'school'),late=arrive>G_BELL+5;
  S.t=Math.max(S.t,d*1440+SCH_OUT);S.loc='school';S.visited.school=true;
  s.went[d]=late?'late':'ok';s.days++;S.life.schoolDays++;
  const ok=S.energy>=30&&S.mood>=30;let g=ok&&!late?1:0;const lines=[];
  adj('energy',-12);adj('mood',ok?1:-2);
  for(const id of ['testing','finalsDec','finalsJun']){const x=schIn(id,d);if(!x)continue;const pr=s.plan[x.k];
    const dg=pr?SCH_PREP[pr]:0;g+=dg;lines.push(`${pick(SCH_TEST[id])} ${pr==='good'?'You knew this. It shows.':pr==='ok'?'Most of it came back to you.':pr==='none'?'A few questions you just guessed on.':'You do your best.'}`)}
  S.grades=clamp(gGrades()+g,0,100);
  say('🏫 '+[late?`In at ${fmt(Math.min(arrive,1439))}, with a tardy slip from the office.`:`In before the ${fmt(G_BELL)} bell.`,pick(SCH_DAY[stage()]||SCH_DAY.middle),...lines,ok?'':'You were too tired to follow much.',`Out at ${fmt(SCH_OUT)}.`,g?`Grades ${g>0?'+':'−'}${Math.abs(g)}.`:''].filter(Boolean).join(' '));
  const t=schToday(d,'school')[0];if(t)schSchoolTerm(t);
}
function schOrientGo(){const d=day(),x=schToday(d,'school').find(i=>i.t.id==='orient');S.t=Math.max(S.t,d*1440+750);S.loc='school';S.visited.school=true;adj('energy',-6);
  say(`🗺️ Orientation at Hilltop High, 9 AM to noon.`);if(x)schSchoolTerm(x)}

// ---- the terms ----
function schSchoolTerm(x){
  const id=x.t.id,c=x.c;schDone(x);
  if(id==='orient'){const f=schKey(schT('first'),c);if(day()>=c.first)SC().done[f]=true;
    const nine=S.age<=14;
    modal('🗺️ Orientation at Hilltop High',schP(`${nine?'Ninth graders only today':'New students only today'}: a senior named Destiny with a clipboard and a megaphone she never needs walks your group through the commons, the gym, the library and the mural of the mountain in the front hall.`,
      'Hilltop High is three times the size of Summit View and smells like floor wax and the bakery truck parked out back. A counselor hands you a schedule and a map that is already out of date.'),
      [schBtn({l:'🙋 Ask Destiny every question you have',e:{grades:3,mood:3},t:'🙋 Which stairs go to the third floor (the far ones), which teachers let you eat in class (two), where the good water fountain is (by the band room). Destiny answers all of it and tells you to come find her if you’re lost.'}),
       schBtn({l:'🎪 Work the club fair in the gym',s:'Robotics, art club, hoops, the Black Student Union, the newspaper.',e:{friends:4,mood:3},t:()=>`🎪 You sign up for three clubs and keep one sign-up sheet as a souvenir. ${schPals()[0]?`${schPals()[0].n} signs up for the same one, on purpose.`:'The kid behind you in line signs up for the same ones.'}`}),
       schBtn({l:'🔐 Find your locker, then everybody else’s',e:{friends:3,mood:2,grades:1},t:'🔐 Locker 2317, top row, a combination you say out loud nine times. Then you find where your friends’ lockers are, so you have somewhere to meet between classes.'})],true);
    lifeMoment('🗺️','Orientation at Hilltop High: the first walk through the commons.');return}
  if(id==='first'){const g=schGrade(c),sc=gSchool(),un=KIDS.filter(k=>!gMet(k.id));
    modal(`🏫 The first day of ${g} grade`,schP(`${sc}, ${dateOf(day()).label}. New schedule, new locker, the same hill. ${stage()==='middle'?'Eighth graders get the good side of the cafeteria, and this year that’s you.':'The halls are louder than you remember, and you know where everything is now.'}`),
      [schBtn({l:'🤝 Find your friends before the bell',e:{friends:4,mood:4},t:()=>`🤝 ${schCrew()} by the front doors, comparing schedules. You have lunch together. That is the whole plan.`}),
       schBtn({l:'📒 New binder, front row, every class',e:{grades:4,mood:1},t:'📒 Every teacher learns your name by sixth period. The binder stays organized for at least a week, a personal record.'}),
       schBtn({l:'👋 Sit with someone new at lunch',e:un.length?{mood:3}:{friends:3,mood:3},t:()=>{if(un.length){const k=pick(un);gFriend(k.id,4);return `👋 You sit down across from <b>${k.n}</b>, who moves their tray to make room. ${k.d}`}return '👋 A new kid, just moved from Spokane, eating alone. You wave them over. Your table gets one bigger.'}})],true);
    lifeMoment('🏫',`First day of ${g} grade at ${sc}.`);return}
  if(id==='last'){const g=schGrade(c),b=gBest()||schPals()[0],ms=stage()==='middle';
    const end=g==='eighth'?'the last day of middle school':`the last day of ${g} grade`,real=day()===c.last;
    modal(`📖 ${real?cap(end):'Yearbooks are out'}`,schP(`${real?`${cap(end)} at ${gSchool()}.`:`The last week of ${g} grade, and the yearbooks came in.`} Everybody has a pen and nobody is paying attention to anything else. ${ms?'The eighth graders sign in the hall like they’re famous.':'The seniors sign on the stairs and won’t move for anybody.'}`),
      [schBtn({l:'✍️ Get every friend to sign your yearbook',e:{friends:4,mood:5},t:()=>`✍️ ${schCrew()}, two teachers, the custodian and a kid you’ve never met who writes “stay cool” in very large letters.`}),
       schBtn({l:`📝 Write a long note in ${b?b.n+'’s':'a friend’s'} yearbook`,e:{mood:3},t:()=>{if(b){gFriend(b.id,6);return `📝 A whole page, front and back, about the year. ${b.n} reads it right there in the hall and pretends not to tear up.`}gFriend(pick(KIDS).id,4);return '📝 You fill a whole page for the kid in homeroom who always saved you a seat.'}}),
       schBtn({l:'☀️ Make summer plans: the pool, the courts, the overlook',e:{mood:6,friends:2},t:'☀️ A list on the back page of the yearbook: open swim at People’s, the courts every evening, sunsets at the overlook, the Hilltop Street Fair in August. Summer starts at 2:45.'})],true);
    lifeMoment('📖',`${cap(end)} at ${gSchool()}: yearbooks signed, summer ahead.`);return}
}
function schEvening(x){
  const id=x.t.id,c=x.c,s=SC(),d=day();schDone(x);
  if(id==='concert'){
    const go=()=>{const E=s.ens==='band'?'the band':'the choir',prac=(s.practice[c.Y]||0)>0;
      modal('🎵 The fall concert',schP(`The Summit View gym at 7 PM: folding chairs in rows, a bake-sale table by the door, and ${E} on the risers in your best black and white.`,
        'Mom, Dad and Nia are in the third row. Grandma is on Mom’s phone, held up the whole time. Nia has a sign. It has your name on it, spelled almost right.'),
        [schBtn({l:`🌟 Take the ${s.ens==='band'?'trumpet':''} solo you ${prac?'practiced':'were offered'}`.replace('  ',' '),s:prac?'You practiced. You’re ready.':'You didn’t practice much. It could go either way.',
          e:{},t:()=>{if(prac||Math.random()<0.5){schFx({mood:10,family:10});return '🌟 Eight bars, alone, the gym silent. You hit every note. Nia yells your name in the quiet part and the whole gym laughs, the good kind. Mood +10, Family +10.'}
            schFx({mood:-2,family:8});return '🌟 One note cracks right in the middle, loud. You finish anyway, and the director gives you a small nod that means a lot. Dad cheers loudest of anyone. Mood −2, Family +8.'}}),
         schBtn({l:'🎼 Play your part, steady and right',e:{mood:5,family:8,grades:1},t:`🎼 Eyes on the director, counting under your breath. ${E==='the band'?'The band':'The choir'} sounds better than it did all month. Afterward Dad says, “I could hear you,” which is the best review there is.`}),
         schBtn({l:'👋 Find Nia in the crowd and wave',e:{family:12,mood:6},t:'👋 You wave from the risers between songs. Nia waves with both arms, then the sign, then Grandma on the phone. Mom is laughing so hard she has to sit down.'})],true);
      lifeMoment('🎵',`The fall concert at Summit View, with ${E}. The whole family came.`)};
    S.t=Math.max(S.t,d*1440+1255);S.loc='home';S.dinner[d]=true;
    say('🎵 Dad drives everyone to Summit View for the concert, and everyone gets burgers on the way home.');
    if(!s.ens) modal('🎵 Band or choir?',schP('Everybody at Summit View is in band or choir in the fall. The concert is tonight. Which one have you been in since September?'),
      [{l:'🎺 Band: the trumpet',s:'Loud, shiny, a little spit.',fn:()=>{s.ens='band';go()}},{l:'🎤 Choir: second row',s:'Harmonies, and a lot of standing very still.',fn:()=>{s.ens='choir';go()}}],true);
    else go();
    return;
  }
  if(id==='prom'){
    const crew=schCrew();
    const night=()=>modal('🪩 Prom night',schP(`Prom at Hilltop High is a friends’ night out: ${crew} decided weeks ago you’d all go as one big group. No pairs, no pressure.`,
        'First, photos under the big trees at Wright Park, everybody’s parents taking the same picture forty times. Then the gym, which the junior class turned into “A Night Among the Stars” with four hundred paper lanterns and a DJ who takes requests.',
        'Mom and Dad said 11 PM, just this once.'),
      [schBtn({l:'🕺 Dance the whole night with the crew',e:{friends:5,mood:10,energy:-15},t:'🕺 Every song. Even the slow ones, all of you in a circle, swaying like a group hug. Your feet hurt the next day and you don’t care.'}),
       schBtn({l:'📸 Run the photo booth for an hour, then dance',e:{friends:6,mood:7,energy:-10},t:'📸 A cardboard frame, a box of props, and half of Hilltop High posing in feather boas. Then the crew drags you onto the floor for the last hour.'}),
       schBtn({l:'🌙 Leave a little early for late teriyaki on MLK',e:{friends:4,mood:8,family:2,money:-8},t:'🌙 Fancy clothes, paper plates, the whole crew in one booth at the teriyaki place on MLK. Home at 10:58, two minutes early. Mom notices.'})],true);
    modal('🪩 Prom night: what are you wearing?',schP(`Tonight is prom, and you’re going with ${crew}.`,'First things first: the outfit.'),
      [schBtn({l:'🧵 Thrift something sharp on MLK',e:{money:-25,mood:6},dis:S.money<25,t:'🧵 The thrift shop on MLK has exactly one perfect thing in your size. The lady at the register says, “Oh, that’s the one.”',then:night}),
       schBtn({l:'👔 Borrow from your cousin, pinned by Grandma',e:{family:4,mood:4},t:'👔 Your cousin mails it in a box with a note. Grandma, on video, tells Mom exactly where to put the pins. It fits like it was yours.',then:night}),
       schBtn({l:'🛍️ Go all out',e:{money:-70,mood:8},dis:S.money<70,s:S.money<70?`You have ${$(Math.round(S.money))}.`:'',t:'🛍️ New shoes and everything. Nia says you look “like a movie.”',then:night})],true);
    S.t=Math.max(S.t,d*1440+1380);S.loc='home';S.dinner[d]=true;
    lifeMoment('🪩',`Prom with ${crew}: photos at Wright Park and dancing until the lights came up.`);
    return;
  }
}
function schPlan(x){
  const id=x.t.id,c=x.c,s=SC();schDone(x);
  const set=k=>()=>{s.plan[x.k]=k};
  if(id==='testing'){
    modal('📝 Spring testing week',schP('This week at Summit View: the state tests. Reading, math and science, a little every morning, the desks in rows and the posters covered up.','How do you get ready?'),
      [schBtn({l:'📚 Study with Linh at the Reading Room',e:{grades:3,mood:-1},t:()=>{gFriend('linh',3);return '📚 Linh brings practice tests she printed and color-coded. Ms. Okafor brings snacks. You leave knowing more than you came in with, and so does Linh.'},then:set('good')}),
       schBtn({l:'🃏 Flashcards at the kitchen table with Dad',e:{grades:3,family:3,mood:-1},t:'🃏 Dad quizzes you over dinner, very seriously, with a pencil behind his ear. Nia makes her own flashcards. They are drawings of dogs.',then:set('good')}),
       schBtn({l:'😴 Early nights, a big breakfast, trust yourself',e:{energy:10,mood:3},t:'😴 Bed by nine every night this week. Mom makes eggs every morning. You feel clear.',then:set('ok')}),
       schBtn({l:'🙃 Wing it',e:{mood:4,grades:-2},t:'🙃 You tell yourself you know this stuff. Some of it, you do.',then:set('none')})],true);
    return;
  }
  if(id==='finalsDec'||id==='finalsJun'){
    const dec=id==='finalsDec';
    modal(`📝 ${dec?'Finals week':'June finals'} at Hilltop High`,schP(`Finals this week: English, chemistry, algebra and history. ${dec?'Winter break is on the other side.':'Then summer, and the last day.'}`,'How do you study?'),
      [schBtn({l:'📚 A study group at the Reading Room',e:{grades:4,friends:2,mood:-1},t:()=>`📚 ${schCrew()} around the big table, three nights in a row. Ms. Okafor keeps the lights on an extra hour.`,then:set('good')}),
       schBtn({l:'🍽️ The kitchen table every night, Mom quizzing you',e:{grades:4,family:3,mood:-2},t:'🍽️ Mom quizzes you on chemistry while she cooks. She remembers more of it than you expected.',then:set('good')}),
       schBtn({l:'⏰ Cram the night before each one',e:{grades:1,energy:-10},t:'⏰ Late nights, a lot of highlighter. It mostly sticks.',then:set('ok')}),
       schBtn({l:'🙃 Skip studying',e:{mood:4,grades:-3},t:'🙃 You tell yourself you’ll be fine. Some of it will be.',then:set('none')})],true);
    return;
  }
  if(id==='winter'){
    modal('❄️ Winter break',schP(`Two weeks off from ${gSchoolShort()}. The fourplex smells like cinnamon, Nia has made a paper chain that goes around the whole living room, and Grandma calls every day.`,'How do you spend the break?'),
      [schBtn({l:'🍪 A baking day with Mom and Nia',e:{family:8,mood:4},t:'🍪 Six dozen cookies, a flour handprint on the fridge, and a plate for Ms. Lorraine across the street.'}),
       schBtn({l:'🎄 Zoolights at Point Defiance with the family',e:{family:6,mood:6,money:-8},dis:S.money<8,t:'🎄 The whole family in hats, a million lights in the trees, and Dad insisting on the hot chocolate stand twice.'}),
       schBtn({l:'📞 A long video call with Grandma and the cousins',e:{family:5,mood:5},t:'📞 Fourteen faces on one screen, everybody talking at once. Grandma makes you hold the phone up to the window so she can see the mountain.'}),
       schBtn({l:'😴 Sleep in. All of it.',e:{energy:15,mood:4},t:'😴 Noon. Twice. Nobody minds.'})],true);
    if(!s.winterYet){s.winterYet=true;lifeMoment('❄️','Winter break on Hilltop: paper chains, cookies and the mountain in the window.')}
    return;
  }
  if(id==='job'){
    if(S.gh&&S.gh.job){say('💼 School’s out, and you already have a job downtown: the summer is shifts, the pool on your days off and the overlook at night.');return}   // one job at a time (34-grow-hoods.js)
    const sy=dateOf(day()).y,pick1=k=>()=>{s.job[sy]=k;if(k!=='none'&&!s.firstJob){s.firstJob=true;lifeMoment('💼',`First summer job: ${SCH_JOBS[k].n}.`)}};
    modal('💼 A summer job',schP(`You’re ${S.age}, school is out, and three places on the hill are hiring for the summer.`),
      [schBtn({l:'🧾 The corner market on MLK',s:'Grace Kim needs help stocking and ringing up. Shifts start 10 AM–6 PM, about $56.',e:{},t:'🧾 Grace Kim hands you a name tag and the key to the stockroom. “Hot sauce shelf first. It’s a mess.”',then:pick1('market')}),
       schBtn({l:'🛟 Lifeguard at the People’s pool',s:'You passed the lifeguard class in the spring. Noon–5 PM shifts, about $80.',e:{mood:3},t:'🛟 A red suit, a whistle, and the tall chair. The nine-year-old who won every cannonball contest is still there, and now you’re in charge of her.',then:pick1('pool')}),
       schBtn({l:'☕ The Sunbreak Café on MLK',s:'Mornings behind the counter, 7 AM–noon starts, about $48 plus tips.',e:{},t:'☕ The owner, Mr. Abara, teaches you the espresso machine and the names of every regular, in that order.',then:pick1('cafe')}),
       schBtn({l:'☀️ Not this summer',e:{mood:4},t:'☀️ This summer is for the pool, the courts and the overlook. There’s always next year.',then:pick1('none')})],true);
    return;
  }
}
const SCH_JOBS={
  market:{n:'the corner market on MLK',ic:'🧾',at:'mlk'},
  pool:{n:'lifeguard at the People’s pool',ic:'🛟',at:'peoples',l:'Lifeguard shift at the pool',win:[660,960],min:300,pay:80,
    t:['🛟 Five hours in the tall chair. Two whistles, one lost goggle found, and a toddler who waves at you every single lap.','🛟 You teach a swim lesson to four kids who are scared of the deep end. By the end, two of them aren’t.','🛟 Hot day, full pool, nobody in trouble. The best kind of shift.']},
  cafe:{n:'the Sunbreak Café on MLK',ic:'☕',at:'mlk',l:'Shift at the Sunbreak Café',win:[420,840],min:240,pay:48,tips:[6,16],
    t:['☕ The morning rush: nurses from the hospitals, a bus driver who orders the same thing every day, a grandma who tips in quarters. You learn every order by heart.','☕ You steam milk without burning it. Mr. Abara says nothing, which from him is a medal.','☕ A slow shift: you restock the cups, wipe every table twice and draw the specials on the chalkboard.']},
};

// ---- the morning: what’s on at school today ----
{const om=onMorning;onMorning=function(d){om(d);if(isGrow()&&d>0&&schOn())try{schMorning(d)}catch(e){console.error(e)}}}
function schMorning(d){
  for(const x of schToday(d)){
    const t=x.t;
    if(t.type==='plan'){schPlan(x);continue}
    if(t.id==='orient'&&!isSchoolDay(d))say('🗺️ Orientation at Hilltop High today, 9 AM to noon: tours, schedules and the club fair.');
    else if(t.id==='concert')say(`🎵 The fall concert is tonight at 7 in the Summit View gym. Mom, Dad and Nia are coming${SC().practice[x.c.Y]?'':', and you have not practiced much'}.`);
    else if(t.id==='prom')say(`🪩 Prom is tonight at Hilltop High. You’re going with ${schCrew()}, as a group. Get ready at home after 5.`);
    else if(t.id==='first')say(`🏫 The first day of ${schGrade(x.c)} grade at ${gSchool()}.`);
    else if(t.id==='last')say(day()===x.c.last?`📖 The last day of ${schGrade(x.c)} grade. Bring a pen: yearbooks.`:'📖 The yearbooks are out at school today. Bring a pen.');
  }
}
// the first morning of every key week: what’s coming up at school; graduation week gets its own line
LIFE_HOOKS.weekStart.push(kw=>{
  if(!isGrow())return;
  if(kw.kind==='graduation'&&S.age<19){say('🎓 Graduation week. Caps and gowns are in the Hilltop High front office, the seniors are signing everything that holds still, and the ceremony is at the end of the week.');return}
  const l=schWeekList();
  if(l.length)say(`⭐ Coming up this week: ${l.map(x=>`${x.t.ic} ${x.t.n} (${dateOf(x.d).label})`).join(' · ')}.`);
});

// ---- the night: skipped school, missed concerts ----
{const on=GROW.onNight;GROW.onNight=(where,notes,d)=>{on(where,notes,d);if(schOn())try{schNight(notes,d)}catch(e){console.error(e)}}}
function schNight(notes,d){
  const s=SC();
  if(d>gSchoolDay()&&isSchoolDay(d)&&!schSnow(d)&&!s.went[d]&&S.age<18){
    s.skip[d]=true;s.skips++;S.grades=clamp(gGrades()-3,0,100);adj('family',-5);adj('mood',-1);
    notes.push(`📵 You skipped school today. ${gSchoolShort()}’s attendance line called home at 3, and Mom heard the message on her break. ${s.skips>2?'“Again?” is all she says at dinner, which is worse than yelling.':'A long talk at the kitchen table.'} Grades −3, Family −5.`);
  }
  for(const x of schToday(d)){if(x.t.type==='plan')continue;schDone(x);
    if(x.t.id==='concert'){adj('family',-4);notes.push('🎵 You missed the fall concert. Nia made a sign for nothing, and Mom’s quiet about it. Family −4.')}
    else if(x.t.id==='prom')notes.push('🪩 You skipped prom. The crew posts about four hundred photos from Wright Park. Next year, maybe.');
  }
}

// ---- actions: Go to school, practice, family time, snow days, summer shifts, the evening events ----
{const ah=GROW.actionsHere;GROW.actionsHere=()=>{
  let a=ah();if(!schOn())return a;
  const d=day(),m=tod(),s=SC(),mine=[];
  if(schPending(d)&&m<SCH_LATE){
    a=a.filter(x=>x.l!=='Do your homework');
    const mins=S.loc==='school'?0:travelMins(S.loc,'school'),late=m+mins>G_BELL+5,tests=['testing','finalsDec','finalsJun'].some(id=>schIn(id,d));
    mine.push({ic:'🏫',l:S.loc==='school'?'Go in to class':'Go to school',s:`${late?`The bell is at ${fmt(G_BELL)}: you’ll be late. `:`First bell ${fmt(G_BELL)}, ${mins?`${mins} min away`:'you’re here'}. `}Class until ${fmt(SCH_OUT)}.${tests?' A test day.':''} Grades +1 if you’re rested and on time. Skipping costs Grades and Family.`,cat:'term',cls:'primary',fn:()=>schGo()});
  }
  const ori=schToday(d,'school').find(x=>x.t.id==='orient'&&!isSchoolDay(d));
  if(ori&&m<720)mine.push({ic:'🗺️',l:'Go to orientation at Hilltop High',s:`9 AM to noon: a tour, your schedule and the club fair. ${travelMins(S.loc,'school')} min away.`,cat:'term',cls:m>=480?'primary':'',dis:m<480,fn:()=>schOrientGo()});
  if(S.loc==='home'){
    for(const x of schToday(d,'evening')){const [lo,hi]=x.t.at;
      mine.push({ic:x.t.ic,l:x.t.id==='concert'?'Go to the fall concert':'Head out for prom with your friends',s:m<lo?`From ${fmt(lo)}. ${x.t.id==='concert'?'The whole family is coming.':`With ${schCrew()}.`}`:m>hi?'You missed the start.':x.t.id==='concert'?'7 PM in the Summit View gym. Takes the evening: home around 9.':'Photos at Wright Park, then the dance. Home by 11, just this once.',
        cat:'term',cls:m>=lo&&m<=hi?'primary':'',dis:m<lo||m>hi,fn:()=>schEvening(x)})}
    const cx=schIn('concert',d);
    if(cx&&!s.done[cx.k]&&!s.practice[cx.k+':'+d]&&m<1290)mine.push({ic:s.ens==='choir'?'🎤':'🎺',l:'Practice for the fall concert',s:'30 min. Mood +1, Family +1. Once a day; it helps with the solo.',cat:'term',fn:()=>{pass(30);s.practice[cx.k+':'+d]=true;s.practice[cx.c.Y]=(s.practice[cx.c.Y]||0)+1;adj('mood',1);adj('family',1);
      say(pick(['🎺 Twenty minutes of scales in your room. Nia covers her ears, then asks for an encore.','🎤 You practice the hard part until it isn’t hard. Dad hums along from the kitchen, badly.','🎵 The solo, five times through. The fifth one is the good one.']))}});
    const wb=schIn('winter',d);
    if(wb&&!s.fam[d]&&gAt(600,1290))mine.push({ic:'🎲',l:'Family game night',s:'45 min. Winter break: everybody home. Family +5, mood +3. Once a day.',cat:'family',fn:()=>{pass(45);s.fam[d]=true;adj('family',5);adj('mood',3);
      say(pick(['🎲 Dominoes at the kitchen table. Dad slams every tile. Nia wins, somehow, every time.','🎲 A puzzle of Mount Rainier, a thousand pieces, half of them sky. You get the summit.','🎲 Charades. Mom acts out the Link for two full minutes. Everybody gets it immediately and lets her keep going.']))}});
    if(schSnow(d)){
      if(!schWx()&&!s.sled[d]&&gAt(540,1020))mine.push({ic:'🛷',l:'Sled the hill at Wright Park',s:`2 hours with ${schCrew()}. Friends +4, mood +8, energy −10.`,cat:'fun',cls:'primary',fn:()=>{pass(120);s.sled[d]=true;schFx({friends:4,mood:8,energy:-10});
        say(`🛷 Cardboard, a laundry basket and one real sled between ${schCrew()} and you. Wright Park’s big hill is packed with half of Tacoma. You go down backward twice, once on purpose.`)}});
      if(!s.cocoa[d]&&gAt(600,1260))mine.push({ic:'☕',l:'Hot cocoa and a movie with Nia',s:'An hour on the couch. Family +6, mood +4, energy +4.',cat:'family',fn:()=>{pass(60);s.cocoa[d]=true;schFx({family:6,mood:4,energy:4});
        say('☕ Mom makes cocoa the real way, in a pot. Nia picks the movie, falls asleep halfway, and you finish it anyway.')}});
    }
  }
  const J=SCH_JOBS[s.job[dateOf(d).y]];
  if(J&&J.l&&S.loc===J.at&&!S.pt[d]&&!isSchoolDay(d)&&S.age>=16&&schIn('job',d)){const ok=gAt(J.win[0],J.win[1]);
    mine.push({ic:J.ic,l:J.l,s:ok?`${J.min/60} hours. About ${$(gAmt(J.pay))}${J.tips?' plus tips':''}, energy −14. Once a day.`:`Shifts start between ${fmt(J.win[0])} and ${fmt(J.win[1])}.`,cat:'money',dis:!ok,
      fn:()=>{pass(J.min);S.pt[d]=true;const tip=J.tips?J.tips[0]+Math.floor(Math.random()*(J.tips[1]-J.tips[0]+1)):0;gEarn(J.pay+tip);adj('energy',-14);adj('mood',1);say(`${pick(J.t)} ${$(gAmt(J.pay+tip))}${tip?`, with ${$(gAmt(tip))} in tips`:''}.`)}});
  }
  return mine.concat(a);
}}

// ---- summer jobs in a time skip: two shifts a week ----
LIFE_HOOKS.skip.push((from,to,ch,notes)=>{
  if(!isGrow()||!S.sch)return;const s=SC();let n=0,pay=0,J=null;
  for(let d=from;d<=to;d++){const o=dateOf(d),k=s.job[o.y];if(!k||k==='none'||!SCH_JOBS[k].pay)continue;
    if(!(o.m===7||o.m===8||(o.m===6&&o.d>=16))||schoolOn(o)||![1,3].includes(o.dow))continue;n++;pay+=SCH_JOBS[k].pay;J=SCH_JOBS[k]}
  if(n){money(pay);S.stats.earned+=pay;notes.push(`${J.ic} ${n} shift${n===1?'':'s'} at your summer job (${J.n}): ${$(pay)}.`)}
});

// ---- graduation week (the engine’s 'graduation' key week, then its graduation and the move into the apartment) ----
defLifeEvent({id:'sch_grad_week',hook:'wake',kinds:['graduation'],mode:'grow',tile:['🎓','Senior week','good'],chance:1,max:1,priority:5,cond:()=>!SC().gradWeek,
  run:()=>{SC().gradWeek=true;
    modal('🎓 Senior week',schP(`The last week at Hilltop High. Cap and gown in a plastic bag on your door, a yearbook with no room left, and Mom has already ordered a sheet cake with your face on it.`,'How do you spend it?'),
      [schBtn({l:'🌅 Senior sunset at the overlook with the crew',e:{friends:5,mood:6},t:()=>`🌅 ${schCrew()} and you on the bench at the edge of the hill, the bay going gold, the mountain out. Nobody says much. Nobody has to.`}),
       schBtn({l:'🎉 Help Mom plan the graduation party',e:{family:8,mood:3},t:'🎉 Folding tables in the yard, Tavita’s family bringing the grill, a banner Nia painted that says CONGRADULATIONS. You don’t fix it.'}),
       schBtn({l:'✉️ Thank-you notes for the teachers who got you here',e:{grades:2,family:2,mood:4},t:'✉️ Five notes. Ms. Okafor at the Reading Room gets one too. She pins it to the corkboard by the desk.'})],true);
    lifeMoment('🎓','Graduation week at Hilltop High: one last sunset with the crew.');}});

// ---- the Week tab, the alert bar and the To-do tab ----
{const wv=GROW.weekView;GROW.weekView=()=>{const h=wv();if(!schOn())return h;const l=schWeekList();
  const done=Object.keys(SC().done).length;
  return h+(l.length?`<div class="sect">At school this week</div>`+l.map(x=>`<div class="todo"><span class="ck">${x.t.ic}</span><div><b>${x.t.n}</b><span>${longDate(x.d)}${x.t.type==='evening'?`, from ${fmt(x.t.at[0])}`:x.t.type==='plan'?', a choice that morning':', at school'}</span></div></div>`).join(''):'')
    +`<div class="rules">🏫 ${gSchool()}: school days ${fmt(G_BELL)} to ${fmt(SCH_OUT)}, homework at home after. ${SC().days} school day${SC().days===1?'':'s'} played${SC().skips?`, ${SC().skips} skipped`:''}${done?`, ${done} school event${done===1?'':'s'} so far`:''}.</div>`}}
{const ab=GROW.alertBar;GROW.alertBar=()=>{const r=ab();if(r||!schOn())return r;const d=day(),m=tod();
  if(schPending(d)&&m<SCH_LATE)return {t:`🏫 School day: first bell ${fmt(G_BELL)} at ${gSchoolShort()}${S.loc==='school'?'':`, ${travelMins(S.loc,'school')} min away`}.${m>G_BELL?' You’re late.':''}`,kind:'info'};
  const e=schToday(d,'evening')[0];if(e&&m<e.t.at[1])return {t:e.t.id==='concert'?'🎵 The fall concert is tonight at 7. Go from home from 5:30 PM.':`🪩 Prom tonight with ${schCrew()}. Head out from home from ${fmt(e.t.at[0])}.`,kind:'info'};
  return null}}
{const ti=GROW.todoItems;GROW.todoItems=()=>{const it=ti();if(!schOn())return it;const d=day(),s=SC();
  if(schSnow(d))it.unshift({l:'❄️ Snow day',s:`${gSchoolShort()} is closed today.`,ok:true});
  else if(d>gSchoolDay()&&isSchoolDay(d)){it.unshift({l:'🏫 Go to school',s:s.went[d]?(s.went[d]==='late'?'Went, a little late.':'Went, on time.'):`${gSchool()}, ${fmt(G_BELL)} to ${fmt(SCH_OUT)}.`,ok:!!s.went[d],fail:!s.went[d]&&tod()>=SCH_LATE,urgent:schPending(d)&&tod()>=G_BELL-30})}
  for(const x of schToday(d,'evening'))it.unshift({l:`${x.t.ic} ${x.t.n}`,s:`Tonight, from home after ${fmt(x.t.at[0])}.`,ok:false,urgent:tod()>=x.t.at[0]});
  return it}}

// ---- the scheduler: a kid’s month / season / milestone key weeks move onto the school calendar when one is close ----
LIFE_HOOKS.plan.push((W,{o,T})=>{
  const sd=o.startDate,y0=Number(sd.slice(0,4)),A=[];
  const ageAt=d=>{let a=o.startAge;while(a<99&&lifeBday(o,a+1)<=d)a++;return a};
  for(let Y=y0;Y<y0+7;Y++){const c=schCal(sd,Y);
    for(const t of SCH_TERMS){if(!t.key)continue;const p=t.pref(c);if(p<14||p>=T*7)continue;const a=ageAt(p);if(a>=18)continue;const st=stage(a);
      if(t.st&&t.st!==st)continue;if(t.key!==true&&t.key!==st)continue;if(t.age&&a<t.age)continue;A.push({w:Math.floor(p/7),id:t.id})}}
  const used=new Set(),ids={},cost=(a,x)=>Math.abs(a.w-x.w)+(ids[a.id]?12:0);   // nearest first, and a different kind of week when it can
  for(const x of W){if(!['month','season','milestone'].includes(x.kind))continue;
    let lo=2,hi=T-3,R=x.kind==='season'?5:3;
    if(x.kind==='milestone'){R=14;if(x.age){lo=Math.max(lo,Math.floor(lifeBday(o,x.age)/7)+2);hi=Math.min(hi,Math.floor(lifeBday(o,x.age+1)/7)-2)}}
    let best=null;
    for(const a of A){const dist=Math.abs(a.w-x.w);if(used.has(a.w)||dist>R||a.w<lo||a.w>hi)continue;
      if(W.some(y=>y!==x&&Math.abs(y.w-a.w)<2))continue;if(!best||cost(a,x)<cost(best,x))best=a}
    if(best){x.w=best.w;used.add(best.w);ids[best.id]=1}}
});
window.schCal=schCal;window.schToday=schToday;
