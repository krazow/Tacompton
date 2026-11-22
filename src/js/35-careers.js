// ============================================================
//  TACOMPTON · CAREERS: raises and promotions in the longer adult games (6 months, 1 year, 2 years, Lifetime).
//  Quick play is unchanged: careerPayF() is 1 there, the job titles are the three classic ones and nothing here runs.
//
//  Every job anniversary: a cost-of-living raise (2 or 3%). Every six-month review: a merit raise (3–5%) when Job is 60
//  or more and you've been on time (at most one late or missed shift, or 15% of them); nothing, and a written warning,
//  below 40. Merit raises stop at the top of a title's pay band (+20%): a promotion is the way up from there (you keep half your merit).
//  Promotions (CAREER_LADDERS) take time in the title, Job standing and the same good attendance; nursing takes a
//  program too (LPN, then an optional RN bridge), chosen in a time skip, paid for monthly, with fewer shifts while you study.
//  The college and trade paths from 18 now lead to real jobs when they're done: IT support downtown, or an electrician
//  apprenticeship that becomes journey-level after four years.
//  The key weeks you play set your habits: a review that falls in a time skip judges you by the last key week you played.
//  At 67 the job ends with a pension (Social Security and savings) of 70% of your last pay, raised with the cost of living.
//    careerPayF()     → the pay multiplier for the current job (lifePayF in 10-life.js multiplies it in)
//    careerDay(d,out) → raises, reviews, school and promotions up to day d (lifeSimulate calls it every skipped day)
//    careerPension()  → the retirement income per day (lifeSimulate)
//    careerTitle()    → 'Senior CNA at Tacoma General' (or the base job's name)
//  Pay (a shift's take-home, scaled from the base jobs in 20-world.js). Tacoma wages checked Nov 2026 (Payscale, Tacoma, WA):
//    CNA about $18.34/hr on average (Mar 2024 profiles; a hospital CNA is the top of that range, the game's $172 a shift),
//    LPN about $30.57/hr (2026), RN about $41.68/hr, typical $34–58 (Oct 2025): so LPN ≈ ×1.45 and RN ≈ ×2 a hospital CNA.
//    Apprentice electrician about $16.96/hr and commercial journeyman about $29.06/hr (range $26–41; small, older samples):
//    journey-level ≈ ×1.7 an apprentice. Union scale in Pierce County is higher; the game stays near the middle.
// ============================================================

// ---- two jobs you can only reach through the college and trade paths (not in the day-one pickers: non-enumerable) ----
const CAREER_JOBS={
  elec:{n:'Electrician apprentice with a Tacoma contractor',short:'the crew',ic:'🔌',place:'the job site',role:'electrician apprentice',
    start:420,end:930,pay:150,days:[0,1,2,3,4],stress:16,energy:30,alarm:360,open:()=>[360,1080],
    blurb:'Seven to 3:30, Monday to Friday, on whatever site the contractor sends you to: conduit, panels, a lot of ladders.'},
  tech:{n:'IT support tech at an office downtown',short:'the office',ic:'💻',place:'the office downtown',role:'IT support tech',
    start:480,end:990,pay:165,days:[0,1,2,3,4],stress:14,energy:20,alarm:420,open:()=>[420,1140],
    blurb:'Eight to 4:30, Monday to Friday, on the twelfth floor downtown: laptops, printers, passwords and patience.'},
};
for(const k in CAREER_JOBS)Object.defineProperty(JOBS,k,{value:CAREER_JOBS[k],enumerable:false,configurable:true,writable:true});
WORK_ART.elec=({night:n})=>`${starsSky(n)}${tree(30,n,16)}<rect x="110" y="40" width="250" height="100" fill="${n?'#3a3530':'#c9b48e'}"/>
  ${[0,1,2].map(r=>[0,1,2,3,4,5].map(c=>`<rect x="${122+c*38}" y="${50+r*28}" width="24" height="16" fill="${n?'#2b3442':'#8fa3ad'}" stroke="${n?'#555':'#7a6a52'}"/>`).join('')).join('')}
  <path d="M100 40 V140 M370 40 V140 M100 70 H370 M100 100 H370" stroke="${n?'#6a5a40':'#d9a43a'}" stroke-width="3" fill="none"/>
  <rect x="380" y="20" width="6" height="120" fill="${n?'#5a4a30':'#e0a020'}"/><rect x="330" y="18" width="110" height="5" fill="${n?'#5a4a30':'#e0a020'}"/><path d="M430 23 V60" stroke="#555"/>
  <rect x="160" y="118" width="70" height="22" fill="${n?'#444':'#f2f0ea'}"/><text x="195" y="132" text-anchor="middle" font-size="7" ${SVGF} fill="${n?'#bbb':'#2a6fa8'}">HARD HATS</text>
  ${person(260,n,'#e3642e',146)}${person(290,n,'#f2b630',146)}<rect x="252" y="120" width="16" height="4" rx="2" fill="#f2d04a"/>${lamp(450,n)}`;
WORK_ART.tech=({night:n})=>`${starsSky(n)}<rect x="150" y="6" width="150" height="134" fill="${n?'#2e3744':'#a9bccb'}"/>
  ${[...Array(8)].map((_,r)=>[0,1,2,3,4].map(c=>`<rect x="${160+c*28}" y="${14+r*15}" width="20" height="10" fill="${win(n,(r*3+c)%4!==2)}"/>`).join('')).join('')}
  <rect x="60" y="60" width="90" height="80" fill="${n?'#343b44':'#cfd6da'}"/>${[0,1,2].map(r=>[0,1,2].map(c=>`<rect x="${70+c*26}" y="${70+r*20}" width="16" height="12" fill="${win(n,(r+c)%2===0)}"/>`).join('')).join('')}
  <rect x="300" y="50" width="120" height="90" fill="${n?'#3a3530':'#d8c8a8'}"/><rect x="330" y="112" width="40" height="28" fill="${n?'#1e2a36':'#24507a'}"/>
  <text x="225" y="138" text-anchor="middle" font-size="7" ${SVGF} fill="${n?'#888':'#24507a'}">PACIFIC AVE</text>${person(250,n,'#24507a',146)}${tree(440,n,16)}${lamp(130,n)}`;
SHIFT_LINES.elec=['A day of pulling wire through conduit in a new building on Pacific Avenue. Your journeyman checks your bends and says “Again,” then, later, “Good.”','Panel day: labels, torque, a lot of double-checking. Nobody gets hurt, which is the whole point.','Up and down a ladder for eight hours in a school basement. You finish the run and the lights come on. That never gets old.'];
SHIFT_LINES.tech=['Forty tickets: passwords, a printer that hates everyone and a vice president who “didn’t touch anything.” All closed.','You image twelve laptops for the new hires and walk a nervous intern through the VPN. She brings you a cookie.','The network goes down at 10:04 and back up at 10:31. For twenty-seven minutes you are the most important person on the floor.'];
WORK_TALK.elec=['☕ Coffee from a thermos on an overturned bucket. The foreman tells you which inspector likes things neat. All of them.','☕ The other apprentice is studying for the same test. You quiz each other on conductor ampacity until lunch is over.'];
WORK_TALK.tech=['☕ The break room has a view of the Dome and a coffee machine only you know how to fix. You fix it. Everyone cheers.','☕ Your manager asks what you want to learn next. Nobody has asked you that before.'];

// ---- the ladders: titles, pay (× the job's base), and what each step takes ----
// yrs: years in the title before; st: Job standing at the review; prog: a program you choose in a time skip first.
const CAREER_LADDERS={
  hospital:{at:'Tacoma General',r:[
    {role:'certified nursing assistant',t:'CNA',f:1},
    {role:'senior CNA',t:'Senior CNA',f:1.12,yrs:2,st:65},
    {role:'licensed practical nurse',t:'LPN',f:1.45,yrs:1,st:65,prog:{id:'lpn',t:'the LPN program',n:'An evening practical nursing program at a technical college in town',mo:12,fee:300,pt:0.75,end:'You finish the practical nursing program and pass your boards'}},
    {role:'registered nurse',t:'RN',f:2.0,yrs:1,st:65,prog:{id:'rn',t:'the RN bridge program',n:'A two-year LPN-to-RN bridge program at a community college',mo:24,fee:350,pt:0.75,end:'You finish the RN bridge program and pass the NCLEX'}}]},
  cafe:{at:'a Hilltop café',r:[
    {role:'barista',t:'Barista',f:1},
    {role:'shift lead',t:'Shift lead',f:1.18,yrs:1,st:65},
    {role:'café manager',t:'Café manager',f:1.5,yrs:3,st:70}]},
  kitchen:{at:'Odessa’s Table',r:[
    {role:'line cook',t:'Line cook',f:1},
    {role:'sous chef',t:'Sous chef',f:1.25,yrs:2,st:65},
    {role:'kitchen manager',t:'Kitchen manager',f:1.5,yrs:4,st:70}]},
  elec:{at:'a Tacoma electrical contractor',r:[
    {role:'electrician apprentice',t:'Electrician apprentice',f:1},
    {role:'journey-level electrician',t:'Journey-level electrician',f:1.7,yrs:4,st:50}]},
  tech:{at:'an office downtown',r:[
    {role:'IT support tech',t:'IT support tech',f:1},
    {role:'systems administrator',t:'Systems administrator',f:1.4,yrs:3,st:65},
    {role:'IT manager',t:'IT manager',f:1.8,yrs:5,st:70}]},
};
const CAREER={meritMax:1.2,merit:[3,5],cola:[2,3],reviewSt:60,warnSt:40,pension:0.7,promoMin:1.06};
const careerColaPct=y=>CAREER.cola[0]+Math.floor(wxHash('cola'+y)*(CAREER.cola[1]-CAREER.cola[0]+1));
const careerMeritPct=d=>CAREER.merit[0]+Math.floor(wxHash('merit'+d+':'+wxSalt())*(CAREER.merit[1]-CAREER.merit[0]+1));
let CAREER_RAW=false;   // the Help guide's tables show the day-one jobs

// ---- state: S.career, one per job (a new job starts a new one) ----
const careerOn=()=>typeof S!=='undefined'&&!!S&&lifeLong()&&!isGrow()&&!!S.jobPicked&&!!CAREER_LADDERS[S.job];
function careerS(){
  let C=S.career;
  if(!C||C.k!==S.job){const d=Math.max(0,day());C=S.career={k:S.job,r:0,hire:d,since:d,n:0,cola:1,merit:1,att:{s:0,l:0,m:0},habit:null,offer:null,prog:null,done:{},warn:0,pension:null,pcola:1,start:null}}
  if(C.start==null)C.start=careerShift();   // the first shift's pay, for "+x% since you started"
  return C;
}
const careerRung=(C=S.career)=>CAREER_LADDERS[C.k].r[C.r];
const careerPayF=()=>{if(CAREER_RAW||!careerOn()||!S.career||S.career.k!==S.job)return 1;const C=S.career;return careerRung(C).f*C.cola*C.merit*(C.prog?C.prog.pt:1)};
// a shift's take-home right now (part-time college or trade, programs and raises included), and with average tips
const careerShift=()=>Math.round(job().pay*lifePayF());
const careerShiftAll=()=>{const J=job();return careerShift()+(J.tips?Math.round((J.tips[0]+J.tips[1])/2):0)};
const careerMonth=()=>Math.round(careerShiftAll()*job().days.length*52/12);
function careerTitle(k=S&&S.job){const J=JOBS[k];if(!J)return '';const L0=CAREER_LADDERS[k];
  if(CAREER_RAW||!careerOn()||!S.career||S.career.k!==k||!S.career.r)return J.n0||J.n;return `${careerRung().t} at ${L0.at}`}
window.careerPayF=careerPayF;window.careerTitle=careerTitle;

// the job's name and role follow the title; the café's tips follow the cost of living
for(const k in CAREER_LADDERS){const J=JOBS[k];if(!J)continue;const n0=J.n,r0=J.role,t0=J.tips;
  Object.defineProperty(J,'n0',{value:n0,enumerable:false});Object.defineProperty(J,'role0',{value:r0,enumerable:false});
  Object.defineProperty(J,'n',{configurable:true,enumerable:true,get(){return careerTitle(k)||n0}});
  Object.defineProperty(J,'role',{configurable:true,enumerable:true,get(){return !CAREER_RAW&&careerOn()&&S.career&&S.career.k===k?careerRung().role:r0}});
  if(t0)Object.defineProperty(J,'tips',{configurable:true,enumerable:true,get(){const c=!CAREER_RAW&&careerOn()&&S.career&&S.career.k===k?S.career.cola:1;return c===1?t0:t0.map(x=>Math.round(x*c))}});
}

// ---- reviews: every six months from the day you started (every second one is the anniversary) ----
const careerRevDay=(C,n)=>C.hire+Math.round(n*182.5);
// how you've been doing: the key weeks played since the last review, or else the last key week you played
// (habit: the key weeks you've played, the latest counting most, so one good week doesn't undo a pattern)
function careerJudge(C){
  const fresh=C.att.s||C.att.m,a=fresh?C.att:(C.habit||{s:0,l:0,m:0,st:S.standing}),bad=a.l+a.m;
  const st=fresh||!C.habit?S.standing:Math.min(S.standing,Math.round(C.habit.st)+10);
  const h=C.habit,ok=bad<=Math.max(1,Math.floor(a.s*0.15))&&(!fresh||!h||h.l+h.m<=Math.max(1.5,h.s*0.2));
  return {st,ok,late:a.l,missed:a.m};
}
function careerReview(C,d,ann,out){
  const J=job(),L0=CAREER_LADDERS[C.k],was=careerShift(),bits=[];
  if(ann){const p=careerColaPct(dateOf(d).y);C.cola*=1+p/100;if(S.life.retired){return}bits.push(`a ${p}% cost-of-living raise`)}
  if(S.life.retired)return;
  const j=careerJudge(C),yrs=Math.round((d-C.hire)/365.25*2)/2;
  let warn=null;
  if(j.st<CAREER.warnSt){C.warn++;warn=`⚠️ Your review at ${J.place} is a hard one: no merit raise, and a written warning${j.missed?' about missed shifts':j.late?' about being late':''}. Get your Job standing back over ${CAREER.reviewSt} and show up on time.`}
  else if(j.st>=CAREER.reviewSt&&j.ok){
    if(C.merit<CAREER.meritMax-1e-6){const p=careerMeritPct(d);C.merit=Math.min(CAREER.meritMax,C.merit*(1+p/100));bits.push(`a ${p}% merit raise`)}
    else bits.push('top marks (you’re at the top of the pay band for your title: a promotion is the way up)')}
  else bits.push(j.ok?`no merit raise (that takes Job ${CAREER.reviewSt} or more)`:'no merit raise: too many late or missed shifts');
  C.att={s:0,l:0,m:0};
  const now=careerShift(),pay=now!==was?` Pay goes from ${$(was)} to ${$(now)} a shift.`:'';
  const head=ann?`📈 ${yrs===1?'One year':`${yrs} years`} at ${J.place}`:`📋 Your six-month review at ${J.place}`;
  if(warn){if(ann)out.push(`${head}: ${bits[0]}.${pay}`);out.push(warn);return}
  out.push(`${head}: ${bits.join(', and ')}.${pay}`);
  careerPromoCheck(C,d,j,out);
}
// the next title: time in this one, standing and attendance; a program first, for nursing
function careerPromoCheck(C,d,j,out){
  const R=CAREER_LADDERS[C.k].r[C.r+1];if(!R||S.life.parttime||C.prog)return;
  if((d-C.since)/365.25<R.yrs-0.01||j.st<R.st||!j.ok)return;
  if(R.prog&&!C.done[R.prog.id]){if(C.offer!==R.prog.id){C.offer=R.prog.id;out.push(`🎓 Your manager pulls you aside: you’d make a good ${R.t}. ${R.prog.n} is open to you (${R.prog.mo} months, ${$(R.prog.fee)} a month, and fewer shifts while you study). Choose it in a time skip.`)}return}
  careerPromote(C,d,out);
}
function careerPromote(C,d,out,lead){
  const J=job(),was=careerShift(),oldF=careerRung(C).f*C.merit;
  C.r++;C.since=d;C.offer=null;const R=careerRung(C);
  C.merit=Math.max(1+(C.merit-1)/2,Math.min(CAREER.meritMax,oldF*CAREER.promoMin/R.f));   // you keep half your merit steps, and it's at least a 6% raise
  const t=careerTitle(),now=careerShift();
  out.push(`🎉 ${lead?lead+'. ':''}Promoted: <b>${t}</b>. Pay goes from ${$(was)} to ${$(now)} a shift.`);
  lifeMoment(J.ic,`${lead?lead+', and promoted':'Promoted'} to ${R.t} at ${CAREER_LADDERS[C.k].at}.`);
  S.life.jobs.push({job:C.k,age:S.age,t:R.t,ic:J.ic});
}
function careerEnroll(id,d){
  const C=careerS(),R=CAREER_LADDERS[C.k].r[C.r+1];if(!R||!R.prog||R.prog.id!==id||C.prog)return null;
  const o=dateOf(d);C.prog={id,pt:R.prog.pt,fee:R.prog.fee,end:d+Math.round(R.prog.mo*30.44),mk:o.y*12+o.m};C.offer=null;
  lifeMoment('🎓',`Started ${R.prog.t}.`);
  return `🎓 You start ${R.prog.t}: ${R.prog.n.toLowerCase().replace(/^an? /,'')}. Evenings in class, fewer shifts, ${$(R.prog.fee)} a month. It ends ${fullDate(C.prog.end)}.`;
}

// ---- after college or a trade program: the new job ----
function careerGraduate(d,out){
  const L1=S.life;if(L1.careerGrad||!L1.done||!L1.path||L1.path==='job')return;
  L1.careerGrad=true;const k=L1.path==='trade'?'elec':'tech',J=JOBS[k];
  S.job=k;S.alarm=J.alarm;S.career=null;S.life.parttime=false;const C=careerS();C.hire=C.since=d;C.start=careerShift();
  S.standing=Math.max(S.standing,60);
  L1.jobs.push({job:k,age:S.age,path:L1.path,t:J.role,ic:J.ic});
  const l=k==='elec'?`🔌 A contractor in town signs you on as an <b>electrician apprentice</b>: four years of on-the-job hours and night classes toward your journey-level card, at ${$(careerShift())} a shift to start.`
    :`💻 Your degree lands you a job: <b>IT support tech</b> at an office downtown, ${$(careerShift())} a shift, eight to 4:30 and a view of the Dome.`;
  out.push(l);lifeMoment(J.ic,`First job after ${L1.path==='trade'?'the trade program':'college'}: ${J.role}.`);
}

// ---- every day of a longer adult game: school fees, the end of a program, reviews ----
function careerDay(d,out){
  if(typeof S==='undefined'||!S||!S.life||!lifeLong()||isGrow())return;
  if(S.jobPicked)careerGraduate(d,out);
  if(!careerOn())return;
  const C=careerS();
  if(S.life.retired&&C.pension==null){C.prog=null;C.pension=Math.max(500/7,CAREER.pension*careerShiftAll()*job().days.length/7);C.pcola=C.cola}
  if(C.prog){const o=dateOf(d),mk=o.y*12+o.m;
    while(C.prog.mk<mk){C.prog.mk++;spendFee(C.prog.fee)}
    if(d>=C.prog.end){const id=C.prog.id,R=CAREER_LADDERS[C.k].r[C.r+1];C.done[id]=true;C.prog=null;if(R&&R.prog&&R.prog.id===id)careerPromote(C,d,out,R.prog.end)}}
  while(d>=careerRevDay(C,C.n+1)){C.n++;careerReview(C,careerRevDay(C,C.n),C.n%2===0,out)}
}
function spendFee(f){if(typeof spend==='function')spend(f);else money(-f)}
const careerPension=()=>{const C=S.career;if(!C||C.pension==null)return 500/7;return C.pension*C.cola/C.pcola};
window.careerDay=careerDay;window.careerPension=careerPension;

// played days: each morning catches up, and says what happened
{const om=onMorning;onMorning=function(d){om(d);try{if(!lifeLong()||isGrow())return;const out=[];careerDay(d,out);out.filter(Boolean).forEach(l=>{say(l);digestLine(l)})}catch(e){console.error(e)}}}
// the end of a key week: how you did (it carries into the reviews that fall in the time skip)
LIFE_HOOKS.weekEnd.push(()=>{if(!careerOn()||S.life.retired)return;const C=careerS(),s=S.stats;
  C.att.s+=s.shifts||0;C.att.l+=s.late||0;C.att.m+=s.missed||0;const h=C.habit,w={s:s.shifts||0,l:s.late||0,m:s.missed||0,st:S.standing};
  C.habit=h?{s:h.s/2+w.s,l:h.l/2+w.l,m:h.m/2+w.m,st:(h.st+w.st*2)/3}:w});
// the time skip: a program you've been offered is one of the choices
{const lc=lifeChoices;lifeChoices=function(){const a=lc();try{
  if(!careerOn()||S.life.retired)return a;const C=careerS();if(!C.offer||C.prog)return a;
  const R=CAREER_LADDERS[C.k].r[C.r+1];if(!R||!R.prog||R.prog.id!==C.offer)return a;
  const pay=Math.round(job().pay*lifePayF()/careerPayF()*R.f*C.cola);
  a.push({k:'prog:'+R.prog.id,l:`🎓 Start ${R.prog.t}`,s:`${R.prog.n}: ${R.prog.mo} months, ${$(R.prog.fee)} a month, and ${Math.round(R.prog.pt*100)}% of your shifts while you study. Then ${R.t} pay: about ${$(pay)} a shift.`})}catch(e){console.error(e)}return a}}
{const ls=lifeSimulate;lifeSimulate=function(from,to,ch){
  if(typeof ch==='string'&&ch.startsWith('prog:')){const l=careerEnroll(ch.slice(5),from);const n=ls(from,to,'save');if(l)n.unshift(l);return n}
  return ls(from,to,ch)}}

// ---- where you see it: the Week tab, the Job stat on the top bar ----
{const wv=weekView;weekView=function(){let h=wv();try{if(!careerOn())return h;const C=careerS(),J=job(),kv=(k,v)=>`<div class="kv"><span>${k}</span><b style="text-align:right">${v}</b></div>`;
  const R=CAREER_LADDERS[C.k].r[C.r+1],up=C.start?Math.round((careerShift()/C.start-1)*100):0;
  let next='';if(S.life.retired)next='';else if(C.prog)next=kv('🎓 In school',`${CAREER_LADDERS[C.k].r[C.r+1].prog.t}, until ${fullDate(C.prog.end)}`);
  else if(R)next=kv('⬆️ Next step',`${R.t}: ${R.yrs} year${R.yrs===1?'':'s'} as ${careerRung(C).t}, Job ${R.st}+, on time${R.prog&&!C.done[R.prog.id]?`, then ${R.prog.t}`:''}${C.offer?' (offered: choose it in a time skip)':''}`);
  else next=kv('⬆️ Next step','the top of this ladder: raises from here');
  h+=`<div class="sect">💼 Your career</div>${kv('Title',S.life.retired?'retired':careerTitle())}${S.life.retired?kv('Pension',`${$(Math.round(careerPension()*30.44))} a month`):kv('Pay',`${$(careerShift())} a shift${J.tips?' plus tips':''}${up?` (${up>0?'+':''}${up}% since you started)`:''}`)}
    ${S.life.retired?'':kv('📋 Next review',fullDate(careerRevDay(C,C.n+1)))}${next}
    <div class="rules">Every six months: a merit raise (${CAREER.merit[0]}–${CAREER.merit[1]}%) with Job ${CAREER.reviewSt}+ and few late or missed shifts. Every year: a cost-of-living raise (${CAREER.cola[0]}–${CAREER.cola[1]}%). Rents rise too.</div>`}catch(e){console.error(e)}return h}}
{const st=(MODE_DATA.adult.STATS||[]).find(s=>s.l==='Job');if(st)Object.defineProperty(st,'title',{configurable:true,get(){const J=job();
  return careerOn()?`${careerTitle()}: ${$(careerShift())} a shift. How ${J.short} feels about you. At 0 you’re let go.`:`How ${J.short} feels about you. At 0 you’re let go.`}})}
// the Help guide's job tables show the three day-one jobs as they start
{const hc=helpChapters;helpChapters=function(...a){CAREER_RAW=true;try{return hc(...a)}finally{CAREER_RAW=false}}}
