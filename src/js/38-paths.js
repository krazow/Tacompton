// ============================================================
//  TACOMPTON · PATHS AT 18: the Army, and help paying for college (the longer adult games).
//
//  🎖️ The military path, a fourth choice at graduation (10-life.js lifePathSheet calls milRecruiter):
//    a visit to the Army recruiting office downtown, then basic training and signal school as one time skip (no key weeks
//    in between), then four years based at Joint Base Lewis-McChord (JBLM), just south of Tacoma. It is a job in the
//    careers file's sense (CAREER_LADDERS.army), so the Week tab, the Job stat, the time-skip summary and the life
//    summary all show the rank. Promotions come on a schedule at the six-month reviews: E-2 at six months, E-3 at a year,
//    E-4 at two years (Job 40–50 and on time), and E-5 (sergeant) only after you re-enlist. No merit raises: the yearly
//    military pay raise comes on the anniversary. Pay per shift is the 2026 monthly basic pay ÷ about 21.7 workdays:
//      E-1 about $2,190 a month, E-2 $2,450, E-3 $2,580, E-4 $2,860, E-5 (over 3 years) about $3,520 (the 2025 table +3.8%).
//    Housing: a barracks room on JBLM (no rent); a sergeant gets a housing allowance that covers rent on Hilltop.
//    Maybe one deployment a term: nine months, summarized as one time skip (no key weeks during it), with Family and
//    stress effects. Nothing about combat. At the end of the four years a time skip offers: re-enlist (a bonus, four
//    more years), the GI Bill (UW Tacoma, tuition covered, a monthly housing allowance, a part-time café job; then IT
//    support downtown, like college) or a civilian job (IT support tech downtown, from the Army's signal training).
//
//  🎓 College aid: at enrollment, a Pell Grant and a Washington College Grant for a low family income bring tuition
//    (about $1,050 a month) down to about $120 a month. Money check: a time skip that would leave you short on rent
//    (at an ordinary pace, through the month after it) says so first, and offers a cheaper room: a shared house on
//    Hilltop or back in with your family. The first time rent comes up short without a warning, your family covers it
//    and that counts as the warning; a shortfall after a warning (for two years) is on you, and the eviction can come.
//    milEnlist(d)     → the Army from today (the recruiter's Sign button; tests and tools/sim-careers.js call it too)
//    lifeForecast(from,to) → the first rent day in that range the cash wouldn't cover at an ordinary pace, or null
// ============================================================

const MIL={basicDays:182,termDays:Math.round(4*365.25),depDays:270,depPay:225,bonus:4000,mha:2500,depChance:0.6};
let PATH_SIM=null;   // the time skip being simulated (one warning per skip)
const AID={tuition:1050,pell:615,wcg:315};   // a month: UW Tacoma tuition and fees, the federal Pell Grant, the state grant

// ---- the job and its ladder (like the college and trade jobs in 35-careers.js: not in the day-one pickers) ----
CAREER_JOBS.army={n:'Private (E-1) at JBLM',short:'your unit',ic:'🎖️',place:'JBLM',role:'private',
  start:390,end:1020,pay:101,days:[0,1,2,3,4],stress:18,energy:32,alarm:330,open:()=>[300,1140],
  blurb:'Formation at 6:30 AM, then PT, then a full day with your signal unit at Joint Base Lewis-McChord, Monday to Friday. Radios, networks and a lot of checklists.'};
Object.defineProperty(JOBS,'army',{value:CAREER_JOBS.army,enumerable:false,configurable:true,writable:true});
CAREER_LADDERS.army={at:'JBLM',r:[
  {role:'private',t:'Private (E-1)',f:1},
  {role:'private',t:'Private (E-2)',f:1.12,yrs:0.5,st:40},
  {role:'private first class',t:'Private First Class (E-3)',f:1.18,yrs:0.5,st:40},
  {role:'specialist',t:'Specialist (E-4)',f:1.31,yrs:1,st:50},
  {role:'sergeant',t:'Sergeant (E-5)',f:1.6,yrs:1.5,st:65,reup:true}]};
{const J=JOBS.army,n0=J.n,r0=J.role,k='army';
  Object.defineProperty(J,'n0',{value:n0,enumerable:false});Object.defineProperty(J,'role0',{value:r0,enumerable:false});
  Object.defineProperty(J,'n',{configurable:true,enumerable:true,get(){return careerTitle(k)||n0}});
  Object.defineProperty(J,'role',{configurable:true,enumerable:true,get(){return !CAREER_RAW&&careerOn()&&S.career&&S.career.k===k?careerRung().role:r0}})}
WORK_ART.army=({night:n})=>`${starsSky(n)}${tree(24,n,14)}${tree(470,n,18)}
  <rect x="70" y="62" width="150" height="78" fill="${n?'#3a3a34':'#b9b28f'}"/>${[0,1].map(r=>[0,1,2,3].map(c=>`<rect x="${82+c*34}" y="${74+r*28}" width="22" height="14" fill="${win(n,(r+c)%3!==1)}"/>`).join('')).join('')}
  <rect x="270" y="78" width="160" height="62" fill="${n?'#34383a':'#c8c2a4'}"/><rect x="330" y="104" width="40" height="36" fill="${n?'#22272b':'#5d6650'}"/>
  <rect x="244" y="22" width="3" height="118" fill="${n?'#777':'#9aa0a4'}"/><rect x="247" y="24" width="30" height="18" fill="${n?'#6a3a3a':'#b8343a'}"/><rect x="247" y="24" width="12" height="9" fill="${n?'#33405a':'#2f4a8a'}"/>
  <text x="350" y="96" text-anchor="middle" font-size="7" ${SVGF} fill="${n?'#bbb':'#3d4533'}">SIGNAL CO.</text>
  ${person(300,n,'#5d6650',146)}${person(316,n,'#5d6650',146)}${person(332,n,'#5d6650',146)}${lamp(440,n)}`;
SHIFT_LINES.army=['Formation at 6:30, PT on the field in the drizzle, then a day of radio checks in the motor pool. Your sergeant says “Good” once. You will remember it.','A day in the signal shop: patching cables, updating laptops, and a network that comes back up because you knew where to look.','Range day for the radios: you set up an antenna on a hill on the base in eight minutes flat. The lieutenant times it twice.'];
WORK_TALK.army=['☕ Coffee in the break room with your squad. Someone has a picture of the mountain from the training area, and it gets passed around like a trophy.','☕ Your squad leader asks where you want to be in four years. You have a real answer now.'];

// ---- state ----
const milS=()=>S&&S.life&&S.life.mil||null;
const milActive=()=>{const M=milS();return !!M&&!M.out&&S.job==='army'};
const milNextSkip=()=>{const nk=S.keyWeeks&&S.keyWeeks[S.kwi+1];if(!nk)return null;return {from:day()+1,to:lifeRange(nk).from-1}};
// future key weeks that would fall inside basic training or a deployment come off the schedule (the last week stays)
function milPrune(until){const i0=S.kwi+1;S.keyWeeks=S.keyWeeks.filter((k,i)=>i<i0||k.kind==='final'||k.start>until);lifeSync()}
function milDep(from){return wxHash('dep'+from+':'+wxSalt())<MIL.depChance?{at:from+Math.round(365.25*(1.2+wxHash('depat'+from+':'+wxSalt())*0.9))}:null}
function milEnlist(d=day()){
  const L1=S.life;S.job='army';S.jobPicked=true;S.alarm=JOBS.army.alarm;S.career=null;
  Object.assign(L1,{path:'job',parttime:false,rentHelpLeft:0});
  L1.mil={start:d,ets:d+MIL.termDays,basic:d+MIL.basicDays,basicDone:false,term:1,reup:0,dep:milDep(d),housing:'barracks',out:false};
  const C=careerS();C.hire=C.since=d;C.start=careerShift();
  S.standing=Math.max(S.standing,55);S.rent.paid=true;S.rent.due=-1;
  const j=L1.jobs.filter(x=>x.job==='army').pop();if(j)Object.assign(j,{path:'army',t:'Private (E-1)',ic:'🎖️'});else L1.jobs.push({job:'army',age:S.age,path:'army',t:'Private (E-1)',ic:'🎖️'});
  milPrune(L1.mil.basic);
  lifeMoment('🎖️','Enlisted in the Army at the recruiting office downtown.');
}
window.milEnlist=milEnlist;

// ---- 18: the recruiter, then the handoff ----
function milRecruiter(next){
  const body=`<p>The Army recruiting office downtown is a storefront with a flag in the window and a staff sergeant who has clearly answered every question before. She doesn’t rush you, and she tells you to bring your mom’s questions too.</p>
    <div class="kv"><span>📝 The contract</span><b>4 years, active duty</b></div>
    <div class="kv"><span>📡 Your Army job</span><b>Signal support specialist: radios, networks, computers</b></div>
    <div class="kv"><span>🎒 First</span><b>10 weeks of basic training, then about 4 months of signal school</b></div>
    <div class="kv"><span>📍 Then</span><b>Joint Base Lewis-McChord, just south of Tacoma</b></div>
    <div class="kv"><span>💵 Pay</span><b>About ${$(2190)} a month to start (E-1), with promotions on a schedule: E-2 at 6 months, E-3 at a year, E-4 at two years</b></div>
    <div class="kv"><span>🏠 Housing</span><b>A barracks room on base: no rent</b></div>
    <div class="kv"><span>🎓 After</span><b>Re-enlist, the GI Bill for school (tuition covered at UW Tacoma), or a civilian job</b></div>
    <p style="font-size:13px;color:var(--mute)">Deployments can happen: they pass as a time skip, with the time away from home in the summary.</p>`;
  modalSwap('🎖️ The recruiting office',body,[
    {l:'✍️ Sign up: four years',s:'Then graduation money, a bus to the airport, and basic training.',np:true,stay:true,fn:()=>{lifeHandoff('job','army',next);milEnlist(day());milHandoffSheet(next)}},
    {l:'Back',s:'Think about the other paths again.',np:true,stay:true,fn:()=>lifePathSheet(next)}],true);
}
window.milRecruiter=milRecruiter;
function milHandoffSheet(next){
  const M=milS(),m=S.life.moments,last=m[m.length-2];if(last&&/went to work/.test(last.t))last.t='Graduated from Hilltop High, then enlisted in the Army.';
  modalSwap('🎒 Shipping out',`<p>Your family drives you to the recruiting office at dawn. Mom packs you a lunch you aren’t allowed to bring; Nia makes you promise to write. The bus pulls away from downtown and Tacoma gets small in the window.</p>
    <div class="kv"><span>🎒 Basic and signal school</span><b>until about ${fullDate(M.basic)}</b></div>
    <div class="kv"><span>📍 Then</span><b>Your unit at JBLM, ${JOBS.army.role0} (E-1)</b></div>
    <div class="kv"><span>🏠 Housing</span><b>A barracks room on base: no rent</b></div>
    <div class="kv"><span>📝 Enlistment ends</span><b>${fullDate(M.ets)}</b></div>
    <div class="kv"><span>💵 Savings</span><b>${$(Math.round(S.money))} (with graduation money)</b></div>
    <p style="font-size:13px;color:var(--mute)">The same save goes on: this is the young-adult chapter, the adult game. Days off, you’re back on Hilltop.</p>`,
    [{l:'🚌 Get on the bus',fn:()=>{next()}}],true);
}

// ---- reviews: promotions on a schedule, the yearly pay raise, no merit raises ----
{const cr=careerReview;careerReview=function(C,d,ann,out){if(C.k!=='army')return cr(C,d,ann,out);return milReview(C,d,ann,out)}}
function milReview(C,d,ann,out){
  const M=milS();if(!M||M.out)return;
  const was=careerShift();let raise='';
  if(ann){const p=careerColaPct(dateOf(d).y);C.cola*=1+p/100;if(S.life.retired)return;raise=`the yearly military pay raise (${p}%)`}
  if(S.life.retired)return;
  const j=careerJudge(C),yrs=Math.round((d-C.hire)/365.25);
  if(raise)out.push(`📈 ${yrs===1?'One year':`${yrs} years`} in the Army: ${raise}. Pay goes from ${$(was)} to ${$(careerShift())} a shift.`);
  C.att={s:0,l:0,m:0};
  if(j.st<CAREER.warnSt){C.warn++;out.push(`⚠️ A counseling statement from your squad leader${j.missed?' about missed formations':j.late?' about being late to formation':''}. No promotion until your Job standing is back over ${CAREER.warnSt}.`);return}
  const R=CAREER_LADDERS.army.r[C.r+1];if(R&&R.reup&&!M.reup)return;
  careerPromoCheck(C,d,j,out);
  if(C.r>=4&&M.housing!=='bah'){M.housing='bah';out.push('🏠 As a sergeant you can live off base: a housing allowance covers your rent on Hilltop.')}
}

// ---- time skips: basic training, a deployment, the end of the enlistment ----
function milChoices(){
  const M=milS(),sk=milNextSkip();if(!M||M.out||!sk)return null;
  if(!M.basicDone&&M.basic<=sk.to)return [{k:'mil:basic',l:'🎒 Basic training and signal school',s:'Ten weeks of basic, then about four months learning radios and networks. Your pay comes every two weeks, and there’s nothing to spend it on.'}];
  if(M.dep&&M.dep.on&&!M.dep.done)return [
    {k:'mil:depcall',l:'📞 Stay close to home by video call',s:`Nine months away with your unit (${monthDay(M.dep.from)} to ${fullDate(M.dep.to)}). Sunday calls with your family, every week you can. Family slips a little; stress up.`},
    {k:'mil:depsave',l:'🐷 Save every dollar',s:'Nine months away with your unit. Head down, pay saved. More money when you’re back; Family and stress take more of a hit.'}];
  if(M.ets<=sk.to){const gi=Math.round(AID.tuition);return [
    {k:'mil:reup',l:'🎖️ Re-enlist for four more years',s:`A re-enlistment bonus (about ${$(MIL.bonus)}), the same unit, and a shot at sergeant (E-5) with a housing allowance.`},
    {k:'mil:gi',l:'🎓 The GI Bill: college at UW Tacoma',s:`Tuition covered (about ${$(gi)} a month), a housing allowance of about ${$(MIL.mha)} a month while you’re in school, and a part-time job at a Hilltop café. Then IT support downtown.`},
    {k:'mil:civ',l:'💼 A civilian job: IT support downtown',s:'Your signal training counts: an IT support tech job at an office downtown, full-time. Back to your own place on Hilltop and rent of your own.'}]}
  return null;
}
{const lc=lifeChoices;lifeChoices=function(){const a=lc();try{
  if(isGrow()||!S.life||S.life.retired)return a;
  const m=milChoices();if(m)return m;
  if(milActive())return a;
  return a.concat(roomChoices())}catch(e){console.error(e)}return a}}
function milLeave(how,d,notes){
  const L1=S.life,M=L1.mil,J0=JOBS.army;
  if(how==='reup'){M.ets+=MIL.termDays;M.term++;M.reup++;money(MIL.bonus);M.dep=milDep(d);
    notes.push(`🎖️ You re-enlist for four more years in a small ceremony by the flagpole, your hand up and your squad behind you. A ${$(MIL.bonus)} bonus. The next contract ends ${fullDate(M.ets)}.`);
    lifeMoment('🎖️',`Re-enlisted for four more years, at ${S.age}.`);return}
  const rank=careerRung().t;M.out=true;M.outDay=d;
  notes.push(`🎖️ Your enlistment ends: ${rank}, ${M.term*4} years, an honorable discharge and a handshake from your commander. You pack the barracks room into the same six boxes.`);
  lifeMoment('🎖️',`Finished ${M.term*4} years in the Army as ${rank}.`);
  S.career=null;
  if(how==='gi'){S.job='cafe';S.alarm=JOBS.cafe.alarm;Object.assign(L1,{path:'college',parttime:true,prog:0,done:false,careerGrad:false,gi:true,aid:null});aidS();
    L1.jobs.push({job:'cafe',age:S.age,path:'gi',t:'barista',ic:'🎓'});
    notes.push(`🎓 The GI Bill: you start at UW Tacoma, tuition covered, with a housing allowance of about ${$(MIL.mha)} a month and mornings at a Hilltop café.`);lifeMoment('🎓','Started at UW Tacoma on the GI Bill.')}
  else{S.job='tech';S.alarm=JOBS.tech.alarm;L1.careerGrad=true;
    L1.jobs.push({job:'tech',age:S.age,t:JOBS.tech.role0||'IT support tech',ic:JOBS.tech.ic});
    notes.push('💻 Your signal training gets you hired: <b>IT support tech</b> at an office downtown. Your new manager was a sergeant too.');lifeMoment('💻','First civilian job after the Army: IT support tech.')}
  const C=careerS();C.hire=C.since=d;C.start=careerShift();S.standing=Math.max(S.standing,65);
}
{const ls=lifeSimulate;lifeSimulate=function(from,to,ch){
  PATH_SIM={from,to};
  try{
    if(typeof ch!=='string'||!ch.startsWith('mil:'))return ls(from,to,ch);
    const M=milS(),k=ch.slice(4);
    if(k==='basic'){M.basicDone=true;const n=ls(from,to,'mil');
      n.unshift(`🎒 Basic training: ten weeks of early mornings, drill sergeants, ruck marches and learning to make a bed tight enough to bounce a coin. Then about four months of signal school, radios and networks. You call home on Sundays. Then the bus brings you back up I-5 to Joint Base Lewis-McChord, just south of Tacoma: your unit, your barracks room, and the mountain over the training area.`);
      lifeMoment('🎒','Finished basic training and signal school; reported to JBLM.');return n}
    if(k==='depcall'||k==='depsave'){const n=ls(from,to,'mil'),D=M.dep,mo=Math.round(MIL.depDays/30.44),save=k==='depsave';
      D.done=true;money(MIL.depPay*mo+(save?150*mo:0));S.money=Math.round(S.money);
      S.life.family=clamp(S.life.family-(save?9:4),0,100);S.stress=clamp(S.stress+(save?10:6),0,100);
      n.unshift(`🎖️ Your unit deploys for nine months, ${monthDay(D.from)} to ${fullDate(D.to)}. Long shifts keeping the radios and networks up, the same faces every day, a lot of waiting and a lot of work. ${save?'You save almost every dollar and call home when you can.':'Video calls home on Sundays: Nia shows you her science project, Mom shows you the garden.'} About ${$(MIL.depPay)} a month in extra pay. Then a gym full of families at JBLM, and yours is there with a sign. Family −${save?9:4}, stress +${save?10:6}.`);
      lifeMoment('🎖️',`Deployed for nine months with your unit, at ${S.age}.`);return n}
    if(k==='reup'||k==='gi'||k==='civ'){const at=Math.max(from,Math.min(M.ets,to)),n=[];
      if(at>from)n.push(...ls(from,at-1,'save'));
      milLeave(k,at,n);
      n.push(...ls(at,to,'save'));return n}
    return ls(from,to,'save');
  }finally{PATH_SIM=null}}}
// a deployment that falls in the coming time skip takes the key weeks inside it off the schedule
LIFE_HOOKS.weekEnd.push(()=>{const M=milS();if(!M||M.out||!M.basicDone||!M.dep||M.dep.on||M.dep.done||!milActive())return;
  const sk=milNextSkip();if(!sk||M.dep.at>sk.to||M.ets-day()<MIL.depDays+120)return;
  const D=M.dep;D.from=Math.max(D.at,day()+10);D.to=D.from+MIL.depDays;D.on=true;milPrune(D.to+7)});
LIFE_HOOKS.skip.push((from,to,ch,notes)=>{if(milActive()&&S.life.mil.basicDone&&!/^mil:/.test(ch))notes.push(S.life.mil.housing==='bah'?'🏠 Your housing allowance covered the rent on Hilltop.':'🪖 A barracks room on JBLM: no rent.')});
// a key week in the Army: no rent to pay
LIFE_HOOKS.weekStart.push(()=>{if(isGrow()||!S.life)return;
  if(milActive()){S.rent.paid=true;S.rent.paidDay=day();return}
  const L1=S.life;
  if(L1.gi&&L1.path==='college'&&!L1.done&&!S.rent.paid){money(MIL.mha);say(`🎓 Your GI Bill housing allowance arrives: ${$(MIL.mha)}.`)}
  if(!S.rent.paid&&lifeLong()&&S.money<S.rent.amt)say(`⚠️ Rent (${$(S.rent.amt)}) is due ${longDate(S.rent.due)} and you have ${$(Math.round(S.money))}. Work every shift you can this week, and skip the extras.`)});
// rent: barracks or the allowance; the GI Bill's housing allowance; one warning before an eviction
{const pr=lifePayRent;lifePayRent=function(d,notes){
  if(milActive())return null;
  const L1=S.life;if(L1.gi&&L1.path==='college'&&!L1.done)money(MIL.mha);
  const need=S.rent.amt-(L1.rentHelpLeft>0?Math.min(L1.rentHelp,S.rent.amt):0)+schoolFee();   // rent and the month's school fee
  if(S.money<need){const sim=PATH_SIM,inGrace=L1.graceTo!=null&&d<=L1.graceTo,warned=L1.warnUntil!=null&&d<=L1.warnUntil;
    if(inGrace||!warned){const gap=Math.ceil(need-S.money);money(gap);L1.rentGrace=(L1.rentGrace||0)+1;
      if(!inGrace){L1.graceTo=sim?sim.to:d;L1.warnUntil=Math.max(L1.warnUntil||0,L1.graceTo+730);L1.rentWarned=d;
        notes.push(`⚠️ You came up ${$(gap)} short on rent on ${fullDate(d)}. Your family covers it this time, and your landlord is clear: next time it’s a 14-day pay-or-vacate notice. Pick up shifts, cut back, or move somewhere cheaper.`)}
      else notes.push(`⚠️ Short on rent again on ${monthDay(d)}: your family covers ${$(gap)} more, and they can’t keep doing it.`)}}
  return pr(d,notes)}}
// a played week: the rent night
{const on=onNight;onNight=function(where,notes,d){
  try{if(!isGrow()&&lifeLong()&&S.life&&d===S.rent.due&&!S.rent.paid&&S.money<S.rent.amt){const L1=S.life,warned=L1.warnUntil!=null&&d<=L1.warnUntil;
    if(!warned){const gap=Math.ceil(S.rent.amt-S.money);money(gap);L1.rentGrace=(L1.rentGrace||0)+1;L1.graceTo=d;L1.warnUntil=d+730;L1.rentWarned=d;
      notes.push(`⚠️ You’re ${$(gap)} short on rent tonight. Your family sends the rest, and your landlord is clear: next time it’s a 14-day pay-or-vacate notice. Pick up shifts, cut back, or move somewhere cheaper.`)}}}catch(e){console.error(e)}
  return on(where,notes,d)}}
LOSSES.discharged=['Discharged early','Too many missed formations and too many counseling statements. The Army lets you go early, without the GI Bill. Your family picks you up at the gate, and nobody says “I told you so.”'];
{const cl=checkLoss;checkLoss=function(){const l=cl();return l==='fired'&&!isGrow()&&milActive()?'discharged':l}}

// ---- college aid ----
function aidS(){const L1=S.life;if(L1.path!=='college')return null;
  if(!L1.aid)L1.aid=L1.gi?{tuition:AID.tuition,gi:AID.tuition,pell:0,wcg:0}:{tuition:AID.tuition,pell:AID.pell,wcg:AID.wcg,gi:0};return L1.aid}
const aidP=x=>typeof priceAmt==='function'?priceAmt(x):x;   // tuition and grants follow the price level (38-prices.js)
const aidPay=()=>{const a=aidS();return a?aidP(Math.max(0,a.tuition-a.pell-a.wcg-a.gi)):0};
// the rent you pay yourself this month (none in the barracks), for the time skip's spending (38-prices.js)
function lifeRentDue(){if(milActive())return 0;const L1=S.life;return S.rent.amt-(L1.rentHelpLeft>0?Math.min(L1.rentHelp||0,S.rent.amt):0)}
{const pf=lifePathFee;lifePathFee=function(){if(S.life.path==='college')return aidPay();return pf()}}
function aidRows(){const a=aidS();if(!a)return '';const kv=(k,v)=>`<div class="kv"><span>${k}</span><b style="text-align:right">${v}</b></div>`;
  if(a.gi)return kv('🎓 Tuition and fees',`${$(aidP(a.tuition))} a month, covered by the GI Bill`)+kv('🏠 GI Bill housing allowance',`about ${$(MIL.mha)} a month`);
  return kv('🎓 Tuition and fees',`about ${$(aidP(a.tuition))} a month`)+kv('🤝 Pell Grant (federal)',`−${$(aidP(a.pell))} a month`)+kv('🤝 Washington College Grant',`−${$(aidP(a.wcg))} a month`)+kv('🧾 You pay',`about ${$(aidPay())} a month`)}
{const lh=lifeHandoff;lifeHandoff=function(path,jk,next){const r=lh(path,jk,next);try{if(path==='college'){aidS();
  const mb=document.querySelector('#mbg .mb');if(mb){const p=[...mb.querySelectorAll('p')].pop();const h=`<div class="sect">💵 Financial aid</div><p>Your family’s income is low enough for the full grants. The aid office shows you the numbers:</p>${aidRows()}`;if(p)p.insertAdjacentHTML('beforebegin',h);else mb.insertAdjacentHTML('beforeend',h)}
  lifeMoment('🤝',`Financial aid for UW Tacoma: a Pell Grant and a Washington College Grant. Tuition about ${$(aidPay())} a month.`)}}catch(e){console.error(e)}return r}}

// ---- the money check before a time skip, and a cheaper room ----
// the first rent day in from..to that the cash wouldn't cover at an ordinary pace (no extra shifts, no extras): {d, cash, need}
function lifeForecast(from,to){
  if(isGrow()||!S.life||milActive())return null;
  const L1=S.life,J=job(),pf=lifePayF(),tip=J.tips?(J.tips[0]+J.tips[1])/2:0,ch=L1.lastSkip&&L1.lastSkip.choice;
  const live0=(45+40+20)/7*(DF().cost||1)*(ch==='save'?0.75:1)+(ch==='friends'?25/7:0);   // the pace of your last time skip
  const live=typeof lifeLiving==='function'&&!(typeof priceOn==='function'&&!priceOn())?(()=>{const P=PRICE_SKIP;PRICE_SKIP=null;try{return lifeLiving(ch||'',from)}finally{PRICE_SKIP=P}})():live0;
  let cash=S.money,help=L1.rentHelpLeft;
  for(let d=from;d<=to;d++){const o=dateOf(d);
    if(L1.retired)cash+=typeof careerPension==='function'?careerPension():500/7;else if(J.days.includes(d%7))cash+=J.pay*pf+tip;
    cash-=live;
    if(o.d===1){if(L1.gi&&L1.path==='college'&&!L1.done)cash+=MIL.mha;
      const h=help>0?Math.min(L1.rentHelp,S.rent.amt):0;if(h)help--;const need=S.rent.amt-h+schoolFee();
      if(cash<need)return {d,cash:Math.round(cash),need:Math.round(need)};cash-=need}}
  return null;
}
window.lifeForecast=lifeForecast;
const schoolFee=()=>S.life.path&&!S.life.done&&S.life.path!=='job'?lifePathFee():0;
const lifeMoneyLow=()=>{const sk=milNextSkip();if(!sk||isGrow()||!S.life||S.life.retired||milActive())return null;return lifeForecast(sk.from,sk.to+31)};
const roomRent=k=>Math.round(S.rent.amt*(k==='family'?0.22:0.56)/5)*5;
function roomChoices(){
  const L1=S.life,low=lifeMoneyLow(),R=L1.room,out=[];
  if(low){
    if(!R||R.k!=='share'&&R.k!=='family')out.push({k:'room:share',l:'🏠 Move somewhere cheaper: a shared room',s:`A room in a shared house on Hilltop: about ${$(roomRent('share'))} a month instead of ${$(S.rent.amt)}. Less space, two housemates, same neighborhood.`});
    if(!R||R.k!=='family')out.push({k:'room:family',l:'🏡 Move back in with your family',s:`Your old room at your family’s place. About ${$(roomRent('family'))} a month toward groceries and bills. Family up; your own place can wait.`});
  }else if(R&&S.money>=aptRent()*4)out.push({k:'room:own',l:'🔑 Get your own place again',s:`An apartment on Hilltop again: about ${$(aptRent())} a month. You have the savings for it now.`});
  return out;
}
const aptRent=()=>{const R=S.life.room;if(!R)return S.rent.amt;const f=typeof cityState==='function'?cityState().rentF:1;return Math.round(R.apt*f/(R.rf||1)/5)*5};
function roomMove(k,d,notes){
  const L1=S.life,was=S.rent.amt,f=typeof cityState==='function'?cityState().rentF:1;
  if(k==='own'){const a=aptRent();L1.room=null;S.rent.amt=a;notes.push(`🔑 You sign a lease on your own apartment on Hilltop again: ${$(a)} a month. Six boxes, one window, the mountain.`);lifeMoment('🔑','Moved back into a place of your own.');return}
  const apt=L1.room?L1.room.apt:was,rf=L1.room?L1.room.rf:f;S.rent.amt=roomRent(k);L1.room={k,apt,rf,d};
  if(k==='family'){L1.family=clamp(L1.family+6,0,100);notes.push(`🏡 You move back into your old room at your family’s place. Nia has already taken over the closet. ${$(S.rent.amt)} a month toward groceries and bills, instead of ${$(was)} rent. Family +6.`);lifeMoment('🏡','Moved back in with family to save money.')}
  else{notes.push(`🏠 You move into a room in a shared house on Hilltop: ${$(S.rent.amt)} a month instead of ${$(was)}. One housemate bakes bread on Sundays, the other works nights. It works.`);lifeMoment('🏠','Moved into a shared house to save money.')}
}
{const ls=lifeSimulate;lifeSimulate=function(from,to,ch){
  if(typeof ch==='string'&&ch.startsWith('room:')){const pre=[];roomMove(ch.slice(5),from,pre);const n=ls(from,to,'save');return pre.concat(n)}
  return ls(from,to,ch)}}
// the skip sheet: the warning, a month ahead
{const sk=lifeSkipSheet;lifeSkipSheet=function(d,night){const r=sk(d,night);try{
  if(isGrow()||!S.life||S.life.retired||milActive())return r;
  const low=lifeMoneyLow();if(!low)return r;
  const L1=S.life,nk=S.keyWeeks[S.kwi+1];L1.rentWarned=day();L1.warnUntil=Math.max(L1.warnUntil||0,lifeRange(nk).from+31);
  const el=document.querySelector('#mbg .mb');
  if(el)el.insertAdjacentHTML('beforeend',`<p class="warn" style="border-left:3px solid var(--bad,#c0392b);padding-left:8px"><b>⚠️ Money check:</b> at this pace you’ll be short on rent on <b>${fullDate(low.d)}</b>: about ${$(Math.max(0,low.cash))} for ${$(low.need)}. Pick up extra shifts, move somewhere cheaper${L1.path==='college'&&!L1.done?', or ask the financial aid office about work-study':''}. If rent can’t be paid after this warning, you can lose the apartment.</p>`);
  }catch(e){console.error(e)}return r}}

// ---- where you see it: the Week tab ----
{const wv=weekView;weekView=function(){let h=wv();try{if(isGrow()||!S.life||!lifeLong())return h;const L1=S.life,M=L1.mil,kv=(k,v)=>`<div class="kv"><span>${k}</span><b style="text-align:right">${v}</b></div>`;
  if(milActive()){h+=`<div class="sect">🎖️ Your service</div>${kv('Rank',careerRung().t)}${kv('📝 Enlistment ends',`${fullDate(M.ets)} (term ${M.term})`)}${kv('🏠 Housing',M.housing==='bah'?'a housing allowance covers your rent on Hilltop':'a barracks room on JBLM: no rent')}
    ${M.dep&&M.dep.on&&!M.dep.done?kv('✈️ Deployment',`${monthDay(M.dep.from)} to ${fullDate(M.dep.to)}`):M.dep&&M.dep.done?kv('✈️ Deployment','done: home again'):''}
    <div class="rules">Army pay: promotions on a schedule (E-2 at 6 months, E-3 at a year, E-4 at two years, with Job ${CAREER_LADDERS.army.r[3].st}+ and on time; sergeant after you re-enlist) and a yearly pay raise. When the enlistment ends, a time skip asks what’s next.</div>`}
  else if(L1.path==='college'&&!L1.done&&aidS())h+=`<div class="sect">🎓 College costs</div>${aidRows()}`;
  if(!milActive()&&L1.room)h+=`<div class="kv"><span>🏠 Home</span><b style="text-align:right">${L1.room.k==='family'?'back with your family':'a shared room on Hilltop'}: ${$(S.rent.amt)} a month</b></div>`;
  }catch(e){console.error(e)}return h}}
