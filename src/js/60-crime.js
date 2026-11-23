// ============================================================
//  TACOMPTON · CHOICES AND CONSEQUENCES: temptations, a fair punishment ladder, and real ways back.
//  Crime is always optional: every temptation is a choice inside an event, with a safe option as the default.
//
//  The adult game (18+): eight temptations
//    🚌 skip the bus fare (save the fare; 10% caught a ride: a $124 citation, doubled for each repeat)
//    💵 a cash job under the table over your shift (+$80; if your boss learns you skipped, you lose the job)
//    🚲 a "too cheap" bike (save $150; 25% it was stolen: the owner gets it back, and your money is gone)
//    🪙 pocket the extra change in the register (+$20; the risk rises each time; you’re let go)
//    🖍️ tag a wall instead of joining the mural (calmer; 30% caught: cleanup and community service)
//    🤒 fake a sick call for the street fair (35% a coworker sees you: Job −20)
//    🛏️ sublet your place without asking (+$300; 40% caught: a warning, then an eviction) (the longer games)
//    🚗 drive without insurance (only with a car, 38-car.js): save the monthly insurance; after an accident you pay all the
//       damage and lose your license
//  The punishment ladder (crimeOffense): a warning (no record), a fine plus stress (a payment plan is always offered),
//  community service (hours at People’s that can raise Community), a court hearing (a day lost; a public defender or a lawyer;
//  being on time matters, missing it makes it worse), a record (the CNA job at Tacoma General and the nursing programs run a
//  background check). Three offenses still open end the adult game with a plain ending screen.
//  Ways back: make it right (apologize and repay: the offense clears faster, the court goes easier), Mr. Harris comes along
//  if you’ve met him, fines on a payment plan, and a record vacated after three clean years (two if you made it right).
//  Growing Up (12–17): family and school, never police. Skip school on a dare (a call home, Family −, detention), candy on a
//  dare at the corner market (work it off sweeping), cheat on a quiz (a zero, teacher trust drops), sneak out after curfew
//  (grounded 2 days), cover for a friend (both families trust you less if it comes out). A third time in a row: a family
//  meeting with the school counselor, and a week grounded.
//  State: S.crime (made on first use, so older saves just work).
//  API (the CRIME contract): crimeOffense(id,{label,sev,kid,stress,family,fine,service,repay}) → {step,text};
//    crimeHasRecord() · crimeRecordLines() · crimeSealed() · crimeClean(days) · crimeCleanDays() · CRIME_LADDER
// ============================================================
(function(){
const CRIME_LADDER=[
  {k:'warning',ic:'🗒️',n:'A warning',d:'No record. It’s written down, and that’s all.'},
  {k:'fine',ic:'🧾',n:'A fine',d:'A fine and some stress. A payment plan is always offered.'},
  {k:'service',ic:'🧹',n:'Community service',d:'Hours at People’s Community Center. They cost time, and they can raise Community.'},
  {k:'court',ic:'⚖️',n:'A court hearing',d:'A day lost. A public defender is free, or you can hire a lawyer. Show up on time.'},
  {k:'record',ic:'📁',n:'A record',d:'It shows up on background checks, like the CNA job at Tacoma General. It can be vacated after a clean stretch.'},
];
const CRIME={end:3,clear:[45,120,150,365,365],seal:1095,sealFast:730,fare:124,lawyer:1500,court:3,svcH:4};
const CR=()=>S.crime||(S.crime={list:[],fines:[],svc:null,court:null,record:null,sealed:null,last:null,out:false,
  fareSkips:0,fareCaught:0,skim:0,cash:-1,sick:-1,subWarn:0,subEvict:false,bike:null,hot:null,noIns:null,susp:-1,fired:0,amends:null,
  kid:{list:[],n:0,teach:70,gr:-1,det:-1,sweep:0,serious:0,skip:-1}});
const crKid=()=>{const C=CR();return C.kid||(C.kid={list:[],n:0,teach:70,gr:-1,det:-1,sweep:0,serious:0,skip:-1})};
const crAdult=()=>!!S&&!isGrow()&&S.job!=='army'&&!!S.jobPicked;
const crActive=()=>CR().list.filter(o=>!o.cleared);
const crYm=d=>{const o=dateOf(d);return o.y*12+o.m-1};
const crOut=(notes,t)=>{if(notes)notes.push(t);else{say(t);digestLine(t)}};
const crWho=()=>!!(S.met&&S.met.harris);
let QUIET=false;   // no pop-ups during the night summary or a time skip
const crModal=(...a)=>{if(!QUIET&&typeof modal==='function'&&!S.over)modal(...a)};

// ---- the contract ----
function crimeHasRecord(){const C=S&&S.crime;return !!(C&&C.record&&!C.sealed)}
function crimeSealed(){const C=S&&S.crime;return !!(C&&C.sealed)}
function crimeCleanDays(){const C=S&&S.crime;return !C||C.last==null?day()+1:day()-C.last}
function crimeClean(days){return crimeCleanDays()>=days}
function crimeRecordLines(){
  const C=S&&S.crime;if(!C)return [];const out=[];
  for(const o of C.list)out.push(`${CRIME_LADDER[o.step].ic} ${o.label}, age ${o.age}: ${CRIME_LADDER[o.step].n.toLowerCase()}${o.fine?` (${$(o.fine)})`:''}${o.restored?', and you made it right':''}${o.cleared?'. Cleared.':'.'}`);
  if(C.record)out.push(C.sealed?`📜 A record from age ${C.record.age}, vacated at ${C.sealed.age} after a clean stretch.`:`📁 A record since age ${C.record.age}.`);
  const K=C.kid;if(K)for(const o of K.list)out.push(`🏠 ${o.label}, age ${o.age}: ${o.res}`);
  if(K&&K.serious)out.push(`🪑 A family meeting with the school counselor${K.serious>1?` (${K.serious} times)`:''}.`);
  return out;
}
// an offense: the adult ladder (or, under 18, family and school)
function crimeOffense(id,o){
  o=o||{};const C=CR(),d=day(),label=o.label||String(id).replace(/_/g,' ');
  if(isGrow()||(o.kid&&(S.age||18)<18))return crKidOffense(id,label,o);
  const act=crActive().length,sev=clamp(o.sev||1,1,3);
  let step=clamp([0,0,1,3][sev]+act,0,4);/* where each severity starts, one step up for every offense still open */if(o.fine)step=Math.max(step,1);if(o.service)step=Math.max(step,2);
  const off={id,label,d,age:S.age||18,step,sev,fine:0,restored:false,cleared:false,clearAt:d+CRIME.clear[step]};
  C.list.push(off);C.last=d;if(C.list.length>40)C.list.splice(0,1);
  adj('stress',o.stress!=null?o.stress:4+step*3);if(o.family&&S.life)S.life.family=clamp(S.life.family-o.family,0,100);
  let text='';
  if(step===0)text=`🗒️ ${label}: a warning. The officer writes your name down and lets you go. No record, but it counts.`;
  else if(step===1){const f=o.fine||rp(sev*150);off.fine=f;crFine(f,label);text=`🧾 ${label}: a ${$(f)} fine. You can pay it at home, or a little each month on a payment plan.`}
  else if(step===2){const h=o.service||8;C.svc={left:(C.svc?C.svc.left:0)+h,label};if(o.cleanup){off.fine=o.cleanup;crFine(o.cleanup,label+' (cleanup)')}
    text=`🧹 ${label}: ${h} hours of community service at People’s Community Center${o.cleanup?`, and ${$(o.cleanup)} for the cleanup`:''}. Do the hours at People’s, ${CRIME.svcH} at a time.`}
  else if(step===3){C.court={d:lifeLong()?d+CRIME.court:Math.max(d+1,Math.min(d+CRIME.court,GAME.days-1)),lawyer:false,id,label,late:false,went:false};
    text=`⚖️ ${label}: a court hearing, ${longDate(C.court.d)} at 9 AM at the County-City Building downtown. A public defender is free; a lawyer costs ${$(rp(CRIME.lawyer))}. Be on time.`;
    crModal('⚖️ A court hearing',`<p>${text}</p>`,[{l:'🧑‍⚖️ A public defender',s:'Free. A busy lawyer who still reads your file.',fn:()=>{}},{l:`💼 Hire a lawyer (${$(rp(CRIME.lawyer))})`,s:'Better odds of no record.',dis:S.money<rp(CRIME.lawyer),fn:()=>crLawyer()}])}
  else{crRecord(off);text=`📁 ${label}: it goes on your record. Background checks will show it, until it’s vacated after a clean stretch.`}
  if(lifeLong())lifeMoment(CRIME_LADDER[step].ic,`${label}: ${CRIME_LADDER[step].n.toLowerCase()}.`);
  if(crActive().length>=CRIME.end){C.out=true;text+=' That’s the third time in a short stretch.'}
  else if(o.repay!==false)C.amends={i:C.list.length-1,repay:o.repay||0,d};
  if(!C.out&&C.amends&&typeof chain==='function')chain('cr_amends');
  return {step:CRIME_LADDER[step].k,text};
}
function crRecord(off){const C=CR();if(!C.record||C.sealed){C.record={d:day(),age:S.age||18};C.sealed=null}if(off)off.step=4}
function crFine(f,label){const C=CR(),mo=Math.max(rp(25),Math.round(f/6));C.fines.push({left:f,mo,label});adj('stress',3);
  crModal('🧾 A fine',`<p>${label}: ${$(f)}. Pay it all now, or set up a payment plan of ${$(mo)} on the 1st of each month.</p>`,
    [{l:`💵 Pay it all now (${$(f)})`,dis:S.money<f,fn:()=>crPayFines()},{l:`🗓️ A payment plan: ${$(mo)} a month`,s:'Nothing more today.',fn:()=>{}}])}
function crPayFines(){const C=CR();let t=0;for(const x of C.fines){if(S.money<x.left)continue;spend(x.left);t+=x.left;x.left=0}C.fines=C.fines.filter(x=>x.left>0);
  if(t){adj('stress',-3);say(`🧾 You pay ${$(t)} in fines. One less thing.`)}return t}
function crLawyer(){const C=CR(),c=rp(CRIME.lawyer);if(!C.court||C.court.lawyer||S.money<c)return;spend(c);C.court.lawyer=true;say(`💼 You hire a lawyer from an office on Tacoma Avenue: ${$(c)}. She reads your file twice and tells you what to wear.`)}
// a monthly payment on every plan (the 1st of the month)
function crPlans(notes){const C=CR();for(const x of C.fines){const p=Math.min(x.mo,x.left);
  if(S.money>=p){spend(p);x.left-=p;crOut(notes,`🧾 Fine payment (${x.label}): ${$(p)}${x.left>0?`, ${$(x.left)} to go`:'. Paid off.'}`)}
  else{x.left+=rp(10);adj('stress',4);crOut(notes,`🧾 You missed a fine payment (${x.label}): a ${$(rp(10))} late fee. Stress +4.`)}}
  C.fines=C.fines.filter(x=>x.left>0)}
// court: the hearing (played, or in a time skip)
function crCourt(notes,how){
  const C=CR(),K=C.court;if(!K)return;C.court=null;const off=C.list.slice().reverse().find(x=>x.id===K.id&&x.step===3)||null;
  if(how==='missed'){crRecord(off);const f=rp(250);crFine(f,'A missed court hearing');adj('stress',12);
    crOut(notes,`⚖️ You missed your court hearing. The judge issues a warrant; you go in the next morning, and it’s sorted out, but now the case is on your record and there’s a ${$(f)} fine. Stress +12.`);return}
  const odds=(K.lawyer?0.8:0.55)+(off&&off.restored?0.15:0)-(K.late?0.25:0);
  if(Math.random()<odds){const f=rp(200);crFine(f,'Court costs');if(off)off.clearAt=Math.min(off.clearAt,day()+120);
    crOut(notes,`⚖️ ${K.lawyer?'Your lawyer':'Your public defender'} talks to the prosecutor in the hall for ten minutes. The judge dismisses the case if you stay out of trouble for a year: no record, ${$(f)} in court costs.${K.late?' You were late, and the judge said so.':''}`)}
  else{crRecord(off);adj('stress',8);crOut(notes,`⚖️ The judge is plain about it: a conviction, and it goes on your record.${K.late?' Being late didn’t help.':''} Your ${K.lawyer?'lawyer':'public defender'} says it can be vacated after three clean years. Stress +8.`)}
}
// every day: offenses clear, and a record can be vacated after a clean stretch
function crTick(d,notes){const C=S&&S.crime;if(!C)return;
  for(const o of C.list)if(!o.cleared&&d>=o.clearAt&&o.step<4){o.cleared=true}
  if(C.record&&!C.sealed&&C.last!=null){const fast=C.list.some(o=>o.restored),need=fast?CRIME.sealFast:CRIME.seal;
    if(d-C.last>=need){C.sealed={d,age:S.age||18};C.list.forEach(o=>o.cleared=true);
      crOut(notes,`📜 ${Math.round(need/365)} years with a clean record. You fill out the forms at the County-City Building, and the court vacates your record. Background checks come back clean now.`);
      if(lifeLong())lifeMoment('📜','Record vacated after a clean stretch.')}}}
// losing the job (a temptation gone wrong): Quick play ends; the longer games start over somewhere new
function crFire(why,notes){const C=CR();C.fired++;
  if(!lifeLong()||!S.life){C.firedQ=true;S.standing=0;crOut(notes,`📦 ${why}`);return}
  const from=job(),ks=Object.keys(JOBS).filter(k=>k!==S.job&&!(k==='hospital'&&crimeHasRecord())),k=ks[Math.floor(Math.random()*ks.length)]||'cafe',N=JOBS[k];
  S.job=k;S.alarm=N.alarm;S.career=null;S.standing=40;adj('stress',12);
  S.life.jobs.push({job:k,age:S.age,t:N.role0||N.role,ic:N.ic});lifeMoment('📦',`Let go from ${from.place}. Started over at ${N.place}.`);
  crOut(notes,`📦 ${why} A week of applications later, ${N.place} hires you: ${N.n0||N.n}, starting at Job 40. Stress +12.`)}

// ---- the adult temptations ----
const crEv=e=>{const c=e.cond;defEvent(Object.assign({max:3},e,{cond:ctx=>!isGrow()&&crAdult()&&!(S.life&&S.life.retired)&&(!c||c(ctx))}))};
const crLater=(m)=>{if(tod()+m<1400)pass(m)};
// 🚌 the fare
crEv({id:'cr_fare',hook:'travel',tile:['🚌','The back door is open','info'],chance:0.12,cooldown:1,max:20,urgent:true,
  cond:c=>c.from&&c.to&&hoodFare(c.from,c.to)>0,
  run:c=>{S.ev.flags.crFare=hoodFare(c.from,c.to);say('🚌 The bus is packed and the back door is open. Half the riders squeeze in without tapping a card. The driver isn’t looking.')},
  choices:()=>{const f=S.ev.flags.crFare||rp(2),k=CR().fareCaught,cit=rp(CRIME.fare)*Math.pow(2,k);return [
    {ic:'💳',l:`Pay the fare (${$(f)})`,s:'Like always.',fn:()=>say('💳 You tap your card at the front. The driver nods.')},
    {ic:'🚪',l:`Slip in the back and keep the ${$(f)}`,s:`About 1 in 10 rides gets checked: a ${$(cit)} citation${k?' (doubled: you’ve been caught before)':''}.`,fn:()=>{const C=CR();C.fareSkips++;money(f);if(S.stats.fares)S.stats.fares=Math.max(0,S.stats.fares-f);
      if(Math.random()<0.1){C.fareCaught++;const r=crimeOffense('fare',{label:'Skipping the bus fare',sev:1,fine:cit,stress:6,repay:f*C.fareSkips});say(`🚌 Two fare officers get on at the next stop and check every card. ${r.text}`)}
      else say('🚪 Nobody checks. You keep the fare, and your eyes on the window.')}}]},dflt:0});
// 💵 a cash job over your shift
crEv({id:'cr_cash',hook:'wake',tile:['💵','A cash job today','info'],chance:0.04,cooldown:20,max:2,
  cond:()=>day()>0&&isShiftDay()&&!(day() in S.worked)&&tod()<job().start,
  run:()=>{say(`💵 Ron from two doors down knocks: his cousin is moving across town today and pays ${$(rp(80))} cash for a strong back. It runs right over your shift at ${job().place}.`)},
  choices:()=>[
    {ic:job().ic,l:'Go to work like always',s:'Tell Ron maybe next time.',fn:()=>say('💵 You tell Ron maybe next time. He shrugs: “Can’t blame you.”')},
    {ic:'💵',l:`Take the cash job (${$(rp(80))}) and skip your shift`,s:'4 hours, energy −15. If your boss learns you skipped, you lose the job.',fn:()=>{CR().cash=day();crLater(240);money(rp(80));adj('energy',-15);
      say(`💵 Four hours of couches and boxes down three flights. ${$(rp(80))} in cash. Your phone buzzes twice from work. You don’t answer.`)}}],dflt:0});
// 🚲 a bike that’s too cheap
crEv({id:'cr_hot',hook:'arrive',tile:['🚲','A bike for sale','info'],chance:0.05,max:1,
  cond:c=>c.at==='mlk'&&daytime()&&!CR().bike,
  run:()=>say(`🚲 A guy outside the market has a nearly new bike for ${$(rp(60))}, cash, no questions. The bike shop on 6th Ave has the same model used for ${$(rp(210))}.`),
  choices:()=>[
    {ic:'🚲',l:`Buy a used one at the bike shop (${$(rp(210))})`,s:'A receipt and a tune-up. Stress −3.',dis:S.money<rp(210),fn:()=>{spend(rp(210));CR().bike='shop';adj('stress',-3);crLater(30);say('🚲 The shop raises the seat for you and throws in a light. It’s yours, on paper too.')}},
    {ic:'🤫',l:`Buy the too-cheap one (${$(rp(60))})`,s:`Save ${$(rp(150))}. About 1 in 4 of these turns out stolen: the bike goes back, the money doesn’t.`,dis:S.money<rp(60),fn:()=>{spend(rp(60));const C=CR();C.bike='cheap';adj('stress',-2);
      if(Math.random()<0.25){C.hot=day();chain('cr_hot_back')}say('🤫 He’s gone before you finish counting. The bike rides fine.')}},
    {ic:'🚶',l:'Pass',s:'Your feet work fine.',fn:()=>say('🚶 You pass. Hilltop is a walking neighborhood anyway.')}],dflt:2});
crEv({id:'cr_hot_back',hook:'wake',tile:['🚲','The bike was stolen','bad'],cond:()=>CR().hot!=null&&day()>CR().hot,
  run:()=>{const C=CR();C.hot=null;C.bike=null;adj('stress',6);say(`🚲 A woman stops you on MLK, polite and certain: it’s her bike, stolen from her porch last month, and here’s the photo. It is. She takes it home. The ${$(rp(60))} is gone too. Stress +6.`)}});
// 🪙 the register comes up over
crEv({id:'cr_skim',hook:'shift',tile:['🪙','The drawer is over','info'],chance:0.06,cooldown:3,max:6,
  cond:()=>S.job==='cafe'||S.job==='kitchen',
  run:()=>say(`🪙 At close the drawer counts ${$(rp(20))} over. Nobody else is in the back.`),
  choices:()=>{const n=CR().skim,risk=Math.min(0.85,0.1+0.15*n);return [
    {ic:'🧾',l:'Count it and turn it in',s:'Job +1.',fn:()=>{adj('standing',1);say('🧾 You write “+$20, drawer 2” on the slip. Your manager initials it and says “Thanks.”')}},
    {ic:'🪙',l:`Pocket the ${$(rp(20))}`,s:`About ${Math.round(risk*100)}% they find out${n?', and it rises every time':''}. If they do, you’re let go.`,fn:()=>{const C=CR();C.skim++;
      if(Math.random()<risk){crFire(`The count doesn’t match the receipts, and your manager already knows whose shift it was. “I liked having you here,” she says. You’re let go from ${job().place}.`)}
      else{money(rp(20));say('🪙 It goes in your pocket. Nobody says anything. You think about it on the walk home.')}}}]},dflt:0});
// 🖍️ the mural: one more choice on Marisol’s wall (21-story.js)
{const e=EV.find(x=>x.id==='mural_painting');if(e&&e.choices){const ch=e.choices;e.choices=ctx=>{const a=ch(ctx)||[];try{if(crAdult())a.push(
  {ic:'🖍️',l:'Tag the wall behind the market instead',s:'Your own mark, stress −6. About 3 in 10 get seen: cleanup and community service.',fn:()=>{crLater(20);adj('stress',-6);
    if(Math.random()<0.3){const r=crimeOffense('tag',{label:'Tagging a wall',sev:2,service:8,cleanup:rp(150),repay:rp(40)});say(`🖍️ Grace Kim comes out the back door while the paint is still wet. She doesn’t yell. She calls it in. ${r.text}`)}
    else say('🖍️ Your name, big and fast, on the back wall. It feels good for a minute. From the street you can hear the crew laughing at the mural.')}})}catch(err){}return a}}}
// 🤒 a sick call on street-fair day
crEv({id:'cr_sick',hook:'wake',tile:['🎪','The street fair, on a work day','info'],chance:0.6,cooldown:300,max:5,
  cond:()=>isFairDay()&&isShiftDay()&&!(day() in S.worked),
  run:()=>say(`🎪 The street fair is today, and so is your shift at ${job().place}. The barbecue smoke is already drifting up MLK.`),
  choices:()=>[
    {ic:job().ic,l:'Go to work, catch the fair after',s:'The fair runs until 6.',fn:()=>say('🎪 Work first. The fair will still be loud when you get there.')},
    {ic:'🤒',l:'Call in sick and go to the fair',s:'About 1 in 3 gets seen by a coworker: Job −20.',fn:()=>{CR().sick=day();say('🤒 You cough twice into the phone. Your manager says “Feel better.” You feel a little worse.')}}],dflt:0});
// 🛏️ sublet without asking (the longer games)
crEv({id:'cr_sublet',hook:'wake',tile:['🛏️','A weekend sublet','info'],chance:0.04,cooldown:45,max:3,
  cond:()=>lifeLong()&&S.loc==='home'&&dateOf(day()).dow===4&&CR().subWarn<2&&!S.evicted,
  run:()=>say(`🛏️ A friend of a friend is in town for a weekend tournament at the Dome and needs a place: ${$(rp(300))} for your apartment, Friday to Sunday. Your lease says no sublets without asking.`),
  choices:()=>{const w=CR().subWarn;return [
    {ic:'🙅',l:'Say no',s:'Your lease, your rules.',fn:()=>say('🙅 You say no, and send them the hostel downtown.')},
    {ic:'🛏️',l:`Sublet it without asking (${$(rp(300))})`,s:`You stay with family. About 4 in 10 get noticed: ${w?'this time, an eviction':'a warning from the landlord'}.`,fn:()=>{const C=CR();money(rp(300));
      if(Math.random()<0.4){C.subWarn++;if(C.subWarn>=2){C.subEvict=true;S.evicted=true;say('🛏️ The landlord heard about it from the neighbors, again. A notice is taped to your door: you have to move out.')}
        else{adj('stress',8);say('🛏️ The neighbors noticed the strangers with the rolling bags. A letter from the landlord: one more and it’s an eviction. Stress +8.')}}
      else say(`🛏️ ${$(rp(300))}, a clean apartment when you get back and a thank-you note on the counter.`)}}]},dflt:0});
// 🚗 drive without insurance (38-car.js)
const crCar=()=>!!S.car&&!!S.car.own;
crEv({id:'cr_noins',hook:'wake',tile:['🚗','The insurance bill','info'],chance:0.25,cooldown:60,max:2,
  cond:()=>crCar()&&!CR().noIns&&S.car.ins>0&&dateOf(day()).d<=3,
  run:()=>say(`🚗 The car insurance comes out on the 1st: ${$(S.car.ins)} a month. Washington requires it, but nobody checks, until something happens.`),
  choices:()=>[
    {ic:'🛡️',l:'Keep paying for insurance',s:'If something happens, you’re covered.',fn:()=>say('🛡️ You leave it. It’s the boring kind of money that saves you.')},
    {ic:'💸',l:`Let it lapse and save ${$(S.car.ins)} a month`,s:'After an accident you pay all the damage, and you lose your license.',fn:()=>crLapse()}],dflt:0});
function crLapse(){const C=CR(),K=S.car;if(!K||!K.own||C.noIns)return;C.noIns={was:K.ins,d:day()};K.billed=1e9;say('💸 You cancel the insurance. The car looks the same. It isn’t.')}
function crInsure(){const C=CR(),K=S.car;if(!C.noIns||!K)return;const p=C.noIns.was;C.noIns=null;K.ins=p;K.billed=crYm(day());spend(p);say(`🛡️ You’re insured again: ${$(p)} for this month, then the 1st of every month.`)}
function crCrash(notes){const C=CR(),dmg=rp(2800),f=rp(550);money(-dmg);C.noIns=null;if(S.car){S.car.billed=crYm(day());S.car.down=S.car.down||rp(900)}C.susp=day()+180;if(S.car)S.car.lic=false;
  crOut(notes,`🚗 A fender bender at a light on Union Ave. Nobody is hurt. With no insurance you pay all of it: ${$(dmg)} for the other car, and your license is suspended for six months.`);
  const r=crimeOffense('noins',{label:'Driving without insurance',sev:2,fine:f,stress:10,repay:false});crOut(notes,r.text)}
crEv({id:'cr_crash',hook:'travel',tile:['🚗','A fender bender','bad'],chance:0.05,cooldown:7,max:2,
  cond:()=>!!CR().noIns&&typeof CAR!=='undefined'&&CAR.driving(),run:()=>crCrash(null)});

// ---- ways back: make it right, with Mr. Harris if you’ve met him ----
crEv({id:'cr_amends',hook:'wake',tile:['🤝','Make it right?','info'],max:99,cond:()=>!!CR().amends&&!CR().out,
  run:()=>{const A=CR().amends,o=CR().list[A.i];say(`🤝 You keep thinking about it: ${o?o.label.toLowerCase():'what happened'}. ${crWho()?'Mr. Harris is on the overlook bench this morning, like most mornings.':'There’s a way to make it right, if you want it.'}`)},
  choices:()=>{const A=CR().amends||{repay:0},c=A.repay||rp(20),opts=[
    {ic:'🙏',l:`Apologize and pay it back (${$(c)})`,s:'An hour. The offense clears faster, and a court goes easier. Community +3.',dis:S.money<c,fn:()=>crAmends(c,false)}];
    if(crWho())opts.push({ic:'🔧',l:`Ask Mr. Harris to come with you (${$(c)})`,s:'An hour. The same, and he knows what to say. Community +5, stress −6.',dis:S.money<c,fn:()=>crAmends(c,true)});
    opts.push({ic:'🤷',l:'Let it be',s:'It clears on its own, slower.',fn:()=>{CR().amends=null;say('🤷 You let it be. It sits there a while.')}});return opts},dflt:()=>crWho()?2:1});
function crAmends(c,harris){const C=CR(),A=C.amends;if(!A)return;C.amends=null;const o=C.list[A.i];spend(c);crLater(60);adj('community',harris?5:3);if(harris)adj('stress',-6);
  if(o){o.restored=true;o.clearAt=o.d+Math.round((o.clearAt-o.d)/2)}
  say(harris?'🔧 Mr. Harris puts on his good jacket. He doesn’t do the talking; he just stands next to you while you do. Afterward, on the bench: “Everybody gets one of those days. What matters is the day after.”'
    :'🙏 You say it plainly, and pay it back. It’s awkward for about a minute, and then it’s done.');
  if(lifeLong())lifeMoment('🤝',harris?'Made it right, with Mr. Harris at your side.':'Made it right: apologized and paid it back.')}

// ---- the adult game: actions, mornings, nights ----
function crActs(a){const C=S.crime;if(!C||isGrow())return a;const m=tod(),d=day();
  if(C.svc&&C.svc.left>0&&S.loc==='peoples'&&m>=480&&m<1080)a.push({ic:'🧹',l:`Community service at People’s (${C.svc.left} hours left)`,s:`${CRIME.svcH} hours, energy −10. Community +3.`,cat:'here',cls:'primary',fn:()=>{const h=Math.min(CRIME.svcH,C.svc.left);pass(h*60);C.svc.left-=h;adj('energy',-10);adj('community',3);
    say(pick(['🧹 Folding chairs, mopping the gym floor and sorting the donation closet with two other people working off their hours. The staff are kind about it.','🧹 Raking the park and painting over the old marks on the court wall. A kid on a bike asks what you did. You tell him.']));
    if(C.svc.left<=0){C.svc=null;say('🧹 Your hours are done. The coordinator signs your sheet and says to come back as a volunteer sometime.')}}});
  if(C.court&&C.court.d===d&&!C.court.went&&m<630)a.push({ic:'⚖️',l:'Go to court at the County-City Building',s:`Your hearing is at 9 AM downtown. ${m<=525?'Leave now and you’re on time.':'You’ll be late.'} Most of the day.`,cat:'here',cls:'primary',
    fn:()=>{const K=C.court;K.went=true;K.late=m>525;pass(Math.max(0,840-m));S.loc='home';crCourt(null,'went')}});
  if(S.loc==='home'&&C.fines.length){const t=C.fines.reduce((s,x)=>s+x.left,0);a.push({ic:'🧾',l:`Pay off your fines (${$(t)})`,s:'All at once, if you have it.',cat:'money',dis:S.money<t,fn:()=>crPayFines()})}
  if(S.loc==='home'&&C.noIns&&crCar())a.push({ic:'🛡️',l:`Get car insurance again (${$(C.noIns.was)} a month)`,s:'The first month now.',cat:'money',dis:S.money<C.noIns.was,fn:()=>crInsure()});
  if(C.susp>=d)return a.filter(x=>!/license test/.test(x.l));
  return a}
{const ah=actionsHere;actionsHere=function(){const a=ah();if(!S||isGrow())return a;try{return crActs(a)}catch(e){console.error(e);return a}}}
// no driving on a suspended license
for(const k of ['driveChip','driveGo']){const f=window[k];if(typeof f==='function')window[k]=function(...x){if(S&&S.crime&&S.crime.susp>=day())return k==='driveChip'?'':undefined;return f.apply(this,x)}}
{const om=onMorning;onMorning=function(d){om(d);try{crMorning(d)}catch(e){console.error(e)}}}
function crMorning(d){const C=S&&S.crime;if(!C)return;
  if(isGrow())return crKidMorning(d);
  if(dateOf(d).d===1&&C.fines.length)crPlans(null);
  if(C.court&&C.court.d===d)crOut(null,`⚖️ Court today: 9 AM at the County-City Building downtown, with ${C.court.lawyer?'your lawyer':'your public defender'}. Be there by 8:45.`);
  if(C.susp>=0&&C.susp<d&&S.car&&!S.car.lic){C.susp=-1;crOut(null,'🪪 Your license suspension is over. Retake the test at the DOL office to drive again.')}
  crTick(d,null)}
{const on=onNight;onNight=function(where,notes,d){
  const C=S&&S.crime,adult=!isGrow()&&C,sick=adult&&C.sick===d&&isShiftDay(d)&&!(d in S.worked),cash=adult&&C.cash===d&&isShiftDay(d)&&!(d in S.worked);
  if(sick)S.worked[d]=0;
  try{on(where,notes,d)}finally{if(sick)delete S.worked[d]}
  if(!adult)return;
  QUIET=true;try{
    if(sick){if(Math.random()<0.35){adj('standing',-20);notes.push(`🤒 A coworker posted a photo from the street fair, and you’re in the background holding a plate of ribs. Your manager saw it. Job −20.`)}else notes.push('🤒 Nobody from work saw you at the fair.')}
    if(cash&&Math.random()<0.35)crFire(`Your manager hears from a coworker that you were carrying couches across town during your shift. You’re let go from ${job().place}.`,notes);
    if(C.court&&C.court.d<=d&&!C.court.went)crCourt(notes,'missed');
  }catch(e){console.error(e)}finally{QUIET=false}}}
// the time skip: plans, hours, the court, a crash, clean days
LIFE_HOOKS.skip.push((from,to,ch,notes)=>{QUIET=true;try{crSkip(from,to,notes)}finally{QUIET=false}});
function crSkip(from,to,notes){const C=S.crime;if(!C)return;
  if(isGrow()){const K=crKid();if(K.gr>=0&&K.gr<to)K.gr=-1;K.sweep=0;return}
  for(let d=from;d<=to;d++)if(dateOf(d).d===1&&C.fines.length)crPlans(notes);
  if(C.svc&&C.svc.left>0){notes.push(`🧹 You finish your ${C.svc.left} hours of community service on weekends at People’s. Community +2.`);C.svc=null;adj('community',2)}
  if(C.court&&C.court.d<=to){C.court.went=true;notes.push(`⚖️ Your court hearing comes up: a day off work${C.court.lawyer?', with your lawyer':' and a public defender'}.`);crCourt(notes,'went')}
  if(C.noIns){const mo=Math.max(1,Math.round((to-from+1)/30.44));for(let i=0;i<mo;i++)if(Math.random()<0.05){crCrash(notes);break}}
  if(C.susp>=0&&C.susp<to&&S.car){C.susp=-1;notes.push('🪪 Your license suspension ended. Retake the test at the DOL office to drive again.')}
  crTick(to,notes)}
// endings: a plain one for the third offense, and the right words for the other two
MODE_DATA.adult.LOSSES.crime=['A third offense','Three times in a short stretch. The judge is fair and plain about it: probation, a long list of conditions, and a fresh start that has to wait. Ms. Lorraine says the porch light is on whenever you’re ready. This game ends here; the next one can go differently.'];
MODE_DATA.adult.LOSSES.letgo=['Let go','Your manager found out, and that was that. You start the job search again tomorrow, a little wiser about what a shortcut costs.'];
MODE_DATA.adult.LOSSES.sublet=['Out of the apartment','The second sublet was one too many: the landlord ends your lease. Ms. Lorraine says you can leave your boxes on her porch while you find a new place.'];
{const cl=checkLoss;checkLoss=function(){const l=cl();try{if(isGrow()||!S.crime)return l;if(S.crime.out)return 'crime';
  if(l==='fired'&&S.crime.firedQ)return 'letgo';if(l==='evicted'&&S.crime.subEvict)return 'sublet'}catch(e){}return l}}

// ---- Growing Up: family and school ----
function crKidOffense(id,label,o){const K=crKid();K.n++;const res=o.res||'a long talk at home';
  K.list.push({id,label,age:S.age,d:day(),res});if(K.list.length>30)K.list.splice(0,1);
  if('family' in S)adj('family',-(o.family!=null?o.family:6));if('mood' in S)adj('mood',-(o.stress!=null?o.stress:3));
  let text=`🏠 ${label}: ${res}.`;
  if(K.n>=3){K.n=0;K.serious++;K.gr=Math.max(K.gr,day()+7);adj('family',-10);adj('mood',-8);if(lifeLong())lifeMoment('🪑','A family meeting with the school counselor, and a week grounded.');
    text+=' That’s three in a row. Mom and Dad sit down with you and the school counselor: a plan, a week grounded, and phone calls every afternoon. Family −10. Nobody is giving up on you; they’re just paying attention now.'}
  return {step:K.n?'home':'serious',text}}
const crKidEv=e=>{const c=e.cond;gEvent(Object.assign({max:2,cooldown:30},e,{cond:ctx=>(S.age||12)<18&&(!c||c(ctx))}))};
const crFriend=()=>{const k=KIDS.filter(x=>gMet(x.id));return k.length?k[(day()+k.length)%k.length]:null};
const crTeach=v=>{const K=crKid();K.teach=clamp(K.teach+v,0,100)};
const crGrade=v=>{S.grades=clamp((S.grades==null?60:S.grades)+v,0,100)};
// 🏫 skip school on a dare (the longer games: school days)
crKidEv({id:'cr_k_skip',hook:'wake',tile:['🛹','Skip school today?','info'],chance:0.05,
  cond:()=>lifeLong()&&isSchoolDay()&&typeof gSchoolDay==='function'&&day()>gSchoolDay()&&tod()<480,
  run:()=>{const f=crFriend();say(`🛹 ${f?f.n:'A kid from your class'} is waiting at the corner: “Nobody’s going to first period. Wright Park, all day. Come on.”`)},
  choices:()=>[
    {ic:'🏫',l:'Go to school',s:'“See you at lunch.”',fn:()=>say('🏫 You go to school. The day is ordinary, which is fine.')},
    {ic:'🛹',l:'Skip with them',s:'Mood +6. The attendance line calls home: Family −, and detention.',fn:()=>{const K=crKid();K.skip=day();K.det=day()+1;adj('mood',6);
      const r=crimeOffense('k_skip',{label:'Skipping school',kid:true,family:2,res:'a call home and detention'});say(`🛹 A whole day of nothing much at Wright Park. It’s fun until about 2. ${r.text}`)}}],dflt:0});
// 🍬 candy on a dare at the corner market
crKidEv({id:'cr_k_candy',hook:'arrive',tile:['🍬','A dare at the market','info'],chance:0.06,max:1,
  cond:c=>c.at==='mlk'&&tod()>=600&&tod()<1140&&gMetCount()>0,
  run:()=>{const f=crFriend();say(`🍬 Inside the corner market, ${f?f.n:'an older kid'} nods at the candy rack and whispers: “Bet you can’t walk out with one.”`)},
  choices:()=>[
    {ic:'💵',l:'Buy one instead ($1)',s:'Mood +1.',dis:S.money<1,fn:()=>{money(-1);adj('mood',1);say('💵 You buy two and give one away. Dare declined, friendship intact.')}},
    {ic:'🍬',l:'Take the dare',s:'Half the time Ms. Kim sees: a call home, and you work it off sweeping the shop.',fn:()=>{adj('mood',2);
      if(Math.random()<0.5){crKid().sweep+=2;const r=crimeOffense('k_candy',{label:'Candy on a dare',kid:true,res:'a call home, and two hours sweeping the market to work it off'});say(`🍬 Ms. Kim was watching the whole time. She doesn’t yell; she just holds out her hand, then picks up the phone. ${r.text}`)}
      else say('🍬 You walk out with it. It tastes like nothing much.')}}],dflt:0});
// ✏️ cheat on a quiz
crKidEv({id:'cr_k_cheat',hook:'wake',tile:['✏️','The answers are going around','info'],chance:0.05,
  cond:()=>lifeLong()&&isSchoolDay()&&typeof gSchoolDay==='function'&&day()>gSchoolDay(),
  run:()=>say('✏️ Somebody in your group chat has a photo of today’s quiz answers. Everyone’s talking about it on the bus.'),
  choices:()=>[
    {ic:'📚',l:'Study at lunch instead',s:'Grades +1.',fn:()=>{crGrade(1);say('📚 Fifteen minutes with your notes at lunch. You know most of it.')}},
    {ic:'📱',l:'Look at the answers',s:'Grades +3, unless you’re caught (4 in 10): a zero, and your teacher trusts you less.',fn:()=>{
      if(Math.random()<0.4){crGrade(-6);crTeach(-20);const r=crimeOffense('k_cheat',{label:'Cheating on a quiz',kid:true,family:4,res:'a zero on the quiz, and a teacher who trusts you less'});say(`📱 Your answers match three other kids’, wrong ones included. ${r.text}`)}
      else{crGrade(3);say('📱 You get a good grade. It doesn’t feel like yours.')}}}],dflt:0});
// 🌙 sneak out after curfew
crKidEv({id:'cr_k_sneak',hook:'arrive',tile:['🌙','Everyone’s at the overlook','info'],chance:0.08,
  cond:c=>c.at==='home'&&tod()>=gCurfew()-90&&tod()<gCurfew()&&(S.age||12)>=13&&gMetCount()>0,
  run:()=>{const f=crFriend();say(`🌙 A text from ${f?f.n:'a friend'}: “everyone’s at the overlook, come out after your folks are asleep.”`)},
  choices:()=>[
    {ic:'🛏️',l:'Stay in',s:'“Tell me everything tomorrow.”',fn:()=>say('🛏️ You stay in. They tell you everything tomorrow, and it was mostly just cold.')},
    {ic:'🌙',l:'Sneak out after curfew',s:'An hour out, mood +6. Half the time Mom hears the door: grounded 2 days.',fn:()=>{adj('mood',6);adj('energy',-6);
      if(Math.random()<0.5){const K=crKid();K.gr=Math.max(K.gr,day()+2);const r=crimeOffense('k_sneak',{label:'Sneaking out after curfew',kid:true,family:6,res:'grounded for 2 days'});say(`🌙 The door squeaks on the way back in. Mom is sitting in the kitchen with the light off. ${r.text}`)}
      else say('🌙 An hour at the overlook with the port lights and your friends. You get back in without a sound.')}}],dflt:0});
// 🤐 cover for a friend
crKidEv({id:'cr_k_cover',hook:'wake',tile:['🤐','Cover for me?','info'],chance:0.04,
  cond:()=>gMetCount()>0&&!isSchoolDay(),
  run:()=>{const f=crFriend();S.ev.flags.crCover=f?f.id:null;say(`🤐 ${f?f.n:'A friend'} texts: “if my mom asks, I was at your place last night. ok??”`)},
  choices:()=>{const f=gKid(S.ev.flags.crCover||'')||crFriend(),n=f?f.n:'your friend';return [
    {ic:'💬',l:'Tell them you won’t lie for them',s:'Friends −1 for now.',fn:()=>{if(f)gFriend(f.id,-1);say(`💬 “I can’t lie to your mom.” ${n} sends a 🙄, then later: “yeah ok.”`)}},
    {ic:'🤐',l:'Cover for them',s:'Friends +2. About 4 in 10 come out: both families trust you less.',fn:()=>{if(f)gFriend(f.id,2);
      if(Math.random()<0.4){if(f)gFriend(f.id,-3);const r=crimeOffense('k_cover',{label:`Covering for ${n}`,kid:true,family:6,res:`your parents and ${n}’s both trust you less for a while`});say(`🤐 ${n}’s mom calls your mom. The stories don’t match. ${r.text}`)}
      else say(`🤐 Nobody asks. ${n} owes you one.`)}}]},dflt:0});
// grounded: home and school only; the shop to sweep; detention
{const g=go;go=function(dest){try{if(S&&isGrow()&&S.crime&&crKid().gr>=day()&&dest!=='home'&&dest!=='school'&&!(crKid().sweep>0&&dest==='mlk')){say(`🏠 You’re grounded until ${longDate(crKid().gr+1)}: home and school only.`);if(typeof render==='function')render();return}}catch(e){}return g(dest)}}
{const ah=GROW.actionsHere;GROW.actionsHere=function(){let a=ah();try{const C=S.crime;if(!C)return a;const K=crKid(),d=day();
  if(K.skip===d)a=a.filter(x=>!/^Go (to school|in to class)$/.test(x.l));
  if(K.sweep>0&&S.loc==='mlk'&&tod()>=600&&tod()<1140)a.unshift({ic:'🧹',l:`Sweep the market for Ms. Kim (${K.sweep} hour${K.sweep===1?'':'s'} owed)`,s:'An hour. Family +1.',cat:'family',cls:'primary',fn:()=>{pass(60);K.sweep--;adj('family',1);adj('energy',-5);
    say(K.sweep?'🧹 You sweep the aisles and break down boxes. Ms. Kim shows you how she stacks the oranges.':'🧹 The last hour. Ms. Kim hands you a candy bar, paid for: “Square now.”')}});
  }catch(e){console.error(e)}return a}}
function crKidMorning(d){const K=crKid();
  if(K.det>=0&&d>=K.det&&isSchoolDay(d)){K.det=-1;adj('mood',-4);adj('energy',-4);crOut(null,'📝 Detention after school today: an hour in room 108, copying the attendance policy. Mood −4.')}
  if(K.gr>=0&&K.gr<d){K.gr=-1;crOut(null,'🏠 You’re not grounded anymore.')}}

// ---- where you see it: the Week tab, the life summary, the Here tab ----
function crWeekHTML(){const C=S&&S.crime;if(!C)return '';const kv=(k,v)=>`<div class="kv"><span>${k}</span><b style="text-align:right">${v}</b></div>`;
  if(isGrow()){const K=crKid();if(!K.list.length&&K.gr<day()&&K.teach===70)return '';
    return `<div class="sect">⚖️ Choices and consequences</div>${kv('🍎 Teacher trust',K.teach)}${K.gr>=day()?kv('🏠 Grounded',`until ${longDate(K.gr+1)}`):''}${K.sweep?kv('🧹 Sweeping owed',`${K.sweep} hour${K.sweep===1?'':'s'}`):''}${kv('🏠 Times in trouble',`${K.n} of 3 before a family meeting`)}`}
  if(!C.list.length)return '';const act=crActive().length,fines=C.fines.reduce((s,x)=>s+x.left,0);
  return `<div class="sect">⚖️ Your record</div>${kv('📁 Record',C.record?(C.sealed?'vacated':`yes, since age ${C.record.age}`):'none')}${kv('⚠️ Open offenses',`${act} of ${CRIME.end}`)}
    ${fines?kv('🧾 Fines left',`${$(fines)} on a payment plan`):''}${C.svc?kv('🧹 Community service',`${C.svc.left} hours left at People’s`):''}${C.court?kv('⚖️ Court hearing',`${longDate(C.court.d)}, 9 AM`):''}${C.noIns?kv('🚗 Car insurance','none'):''}${C.susp>=day()?kv('🪪 License','suspended'):''}
    <div class="rules">Offenses clear after a clean stretch, faster if you made it right. A record can be vacated after three clean years (two if you made it right).</div>`}
{const wv=weekView;weekView=function(){let h=wv();try{h+=crWeekHTML()}catch(e){}return h}}
{const wv=GROW.weekView;GROW.weekView=function(){let h=wv.apply(this,arguments);try{h+=crWeekHTML()}catch(e){}return h}}
{const ls=lifeSummaryHTML;lifeSummaryHTML=function(){let h=ls();try{const l=crimeRecordLines();if(l.length)h+=`<div class="sect" style="margin-top:14px">Choices and consequences</div>`+l.map(x=>`<div class="todo"><span class="ck">${x.split(' ')[0]}</span><div><span>${x.slice(x.indexOf(' ')+1)}</span></div></div>`).join('')}catch(e){}return h}}
{const st=statusTags;statusTags=function(){const t=st()||[];try{const C=S.crime;if(C&&!isGrow()){if(C.court&&C.court.d===day())t.push('<span class="tag bad">⚖️ court today, 9 AM</span>');if(C.svc)t.push(`<span class="tag">🧹 ${C.svc.left}h service</span>`)}
  else if(C&&isGrow()&&crKid().gr>=day())t.push('<span class="tag bad">🏠 grounded</span>')}catch(e){}return t}}

window.CRIME_LADDER=CRIME_LADDER;window.crimeCleanDays=crimeCleanDays;window.crimeOffense=crimeOffense;window.crimeHasRecord=crimeHasRecord;window.crimeRecordLines=crimeRecordLines;window.crimeSealed=crimeSealed;window.crimeClean=crimeClean;
window.CRIMES={S:CR,kid:crKid,tick:crTick,court:crCourt,lawyer:crLawyer,payFines:crPayFines,plans:crPlans,fire:crFire,lapse:crLapse,insure:crInsure,crash:crCrash,amends:crAmends,active:crActive,cfg:CRIME,week:crWeekHTML};
})();
