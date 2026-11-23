// ---------------- 📱 phone: Growing Up (ages 12–17): the first phone, Mom and Dad's rules, kid apps, screen time ----------------
// Wraps the core (50-phone.js) instead of editing it:
//   - phoneOwned(): a kid has no phone until the first-phone scene (PG().gift), and none while Mom has taken it (PG().back).
//   - phoneCan(): no apps after the rule's "phone off" time until 6 AM, or once you put it away for the night (PG().away).
//   - definePhoneApp({adult:true}) hides an app for anyone under 18 (its when() is wrapped). Apps defined before this file are
//     patched too. definePhoneApp({price:3}) is a paid app: charged on the first install (from your money); under 18 the
//     rules decide whether you may buy it at all (none, or one a month once you've earned it).
//   - Screen time: opening the phone, moving around in it and game time spent inside it fill a daily meter (PG().scr[d],
//     minutes; PG().late[d] after 9 PM). Too much late at night costs sleep and Grades; a weekly note in the Week tab.
//   - At 18 (lifeHandoff) the rules end; the bill becomes yours (the core's plan pick on the next opening); contacts stay.
// State: S.ph.gr (lazy; an old save with no S.ph.gr already has its phone).
const PG_OFF=1260, PG_OFF_EARNED=1320, PG_WAKE=360;   // 9 PM; 10 PM once earned; apps back at 6 AM
const PG_EARN={family:70,grades:70}, PG_BAD=45, PG_TAKE=2, PG_HOLD=7;   // a bad report card: Grades under 45
const phKid=()=>typeof S!=='undefined'&&!!S&&isGrow()&&(S.age==null?12:S.age)<18;
function PG(){const P=PH();P.gr=P.gr||{gift:true};const g=P.gr;g.scr=g.scr||{};g.late=g.late||{};g.paid=g.paid||{};return g}
const pgG=()=>S&&S.ph&&S.ph.gr;
const pgTaken=()=>{const g=pgG();return !!g&&g.back!=null&&day()<g.back};
const pgHeld=()=>{const g=pgG();return !!g&&g.hold!=null&&day()<g.hold};
const pgGrades=()=>typeof gGrades==='function'?gGrades():50;
const pgEarned=()=>phKid()&&!pgHeld()&&S.family>=PG_EARN.family&&pgGrades()>=PG_EARN.grades;
const pgOff=()=>pgEarned()?PG_OFF_EARNED:PG_OFF;
const pgPaidMax=()=>pgEarned()?1:0;
const pgPaidUsed=()=>PG().paid[phMonth()]||0;
const pgDay=d=>dateOf(d).label;
// apps locked: after the phone-off time, before 6 AM, or put away for the night
function phoneLocked(){if(!phKid()||!pgG())return false;const g=pgG(),m=tod();return g.away===day()||m>=pgOff()||m<PG_WAKE}

// ---- the wraps ----
{const o=phoneOwned;phoneOwned=function(){if(!o.apply(this,arguments))return false;if(!phKid())return true;const g=pgG();if(!g)return true;return !!g.gift&&!pgTaken()}}
{const o=phoneCan;phoneCan=function(){return o.apply(this,arguments)&&!phoneLocked()}}
{const o=phoneScreen;phoneScreen=function(){
  if(phoneLocked()&&PH().batt>0){const g=pgG(),home=S.loc==='home',away=g.away===day();
    return `<div class="ph-dead pg-lock"><div style="font-size:40px">${home?'🔌':'🌙'}</div><b>${away?'Put away for the night':`Phone off at ${fmt(pgOff())}`}</b><span>${home?'It’s charging on the kitchen counter, next to Mom’s.':'It stays on so Mom can see where you are and you can call home, but no apps.'} ${away?'You put it away yourself.':'Mom and Dad’s rule.'} Apps are back in the morning.</span></div>`}
  return o.apply(this,arguments)}}
// adult-only apps: hidden under 18
function pgAdultWrap(a){if(!a||!a.adult||a.pgAdult)return a;const w=a.when;a.when=function(){return !phKid()&&w.apply(this,arguments)};a.pgAdult=true;return a}
PHONE_APPS.forEach(pgAdultWrap);
{const d0=definePhoneApp;definePhoneApp=function(a){d0.apply(this,arguments);pgAdultWrap(phoneApp(a.id))}}
// paid apps: the rules first (kids), then the price on the first install
function pgPaidWhy(a){if(!a||!(a.price>0)||!phKid())return null;
  if(!pgPaidMax())return `${a.name} costs ${$(rp(a.price))}. Mom and Dad’s rule: no paid apps. Family ${PG_EARN.family}+ and Grades ${PG_EARN.grades}+ earns one a month.`;
  if(pgPaidUsed()>=pgPaidMax())return `You’ve had your one paid app this month. Next month you can get another.`;
  return null}
{const o=phoneInstall;phoneInstall=function(id){const a=phoneApp(id);if(phKid()&&phoneLocked())return false;
  const paid=a&&a.price>0&&!PH().inst[id],c=paid?rp(a.price):0;
  if(paid&&(pgPaidWhy(a)||S.money<c))return false;
  const r=o.apply(this,arguments);
  if(r&&paid){spend(c);if(phKid())PG().paid[phMonth()]=pgPaidUsed()+1;say(`💳 ${a.name}: ${$(c)}${phKid()?' from your allowance':''}.`)}
  return r}}
{const o=phoneStoreInstall;phoneStoreInstall=function(id){const a=phoneApp(id);
  if(a&&a.price>0&&!PH().inst[id]){const why=pgPaidWhy(a);if(why){phStoreMsg('👪 '+why);return false}
    if(S.money<rp(a.price)){phStoreMsg(`${a.name} costs ${$(rp(a.price))}. You have ${$(Math.round(S.money))}.`);return false}}
  return o.apply(this,arguments)}}
// the 📵 button while Mom has the phone; messages for no phone yet / taken
{const o=phoneHudBtn;phoneHudBtn=function(){const h=o.apply(this,arguments);if(!h&&S&&!S.over&&phKid()&&pgTaken())return `<button class="phbtn off" onclick="phoneOpen()" aria-label="No phone: Mom has it">📵</button>`;return h}}
{const o=window.phoneOpen;window.phoneOpen=function(app,arg){
  if(S&&!S.over&&phKid()&&pgG()){const g=pgG();
    if(!g.gift)return modal('📵 No phone yet','<p>You don’t have a phone. Mom and Dad have been talking about it, though.</p>',[{l:'OK',fn:()=>{}}]);
    if(pgTaken())return modal('📵 Mom has your phone',`<p>${PG_WHY[g.why]||'Mom took your phone.'} It’s in her room until <b>${longDate(g.back)}</b> morning.</p><p>No texts, no apps. You’ll live.</p>`,[{l:'OK',fn:()=>{}}])}
  const fresh=!PH_OPEN;const r=o.apply(this,arguments);if(fresh&&PH_OPEN)pgScreen(5);return r}}
{const o=window.phoneGo;window.phoneGo=function(){const r=o.apply(this,arguments);pgScreen(2);return r}}
{const o=pass;pass=function(min){const open=PH_OPEN,t0=S?S.t:0;const r=o.apply(this,arguments);if(open&&S&&!S.over)pgScreen(S.t-t0,t0);return r}}

// ---- screen time ----
function pgScreen(min,t0){if(!S||S.over||!min||!phKid()||!phoneOwned()||!phoneCan())return;const g=PG(),d=day();g.scr[d]=(g.scr[d]||0)+min;
  const at=t0==null?tod():t0-S.cur*1440;if(at+min>PG_OFF){const late=Math.min(min,at+min-PG_OFF);g.late[d]=(g.late[d]||0)+late}
  for(const k in g.scr)if(+k<d-21){delete g.scr[k];delete g.late[k]}}
const pgHm=m=>{m=Math.round(m);return m<60?`${m} min`:`${Math.floor(m/60)} h${m%60?` ${m%60} min`:''}`};
const pgToday=()=>{const g=pgG();return g?(g.scr[day()]||0):0};

// ---- strikes: skipped school, missed curfew, a bad report card ----
const PG_WHY={skip:'You skipped school, and the school called home.',curfew:'You missed curfew.',report:'The report card came home.'};
function pgStrike(why,take){const g=PG(),d=day();g.why=why;g.hold=Math.max(g.hold||0,d+PG_HOLD);
  if(take){g.back=d+PG_TAKE+1;g.away=null;if(PH_OPEN)phoneClose()}
  return take?`📵 Mom takes your phone until ${longDate(g.back)} morning. The 10 PM phone and paid apps are on hold for a week.`:`📱 The 10 PM phone and paid apps are on hold for a week.`}

// ---- the first phone, from Mom and Dad ----
function pgGiftScene(){
  if(!phKid()||!pgG()||pgG().gift)return;
  const body=`<p>After dinner Dad sets a phone on the kitchen table and slides it over. It’s Mom’s old one: a crack across one corner, a case with a sunflower on it, and a new number of your own on the family plan.</p>
    <p>“Three rules,” Mom says, and counts them on her fingers.</p>
    <ul><li>🔌 <b>Off at ${fmt(PG_OFF)}.</b> It charges in the kitchen, not by your bed. No apps after nine until morning.</li>
    <li>💳 <b>No paid apps.</b> Free ones only.</li>
    <li>📍 <b>I can see your location.</b> If you’re running late, I’ll know you’re on your way.</li></ul>
    <p>“Keep your grades up and things good around here, and we’ll talk about ten o’clock.”</p>`;
  const give=(fam,t)=>{const g=PG();g.gift=true;g.giftD=day();PH().tier='old';PH().batt=Math.max(PH().batt,80);if(fam)adj('family',fam);say(t);if(typeof lifeMoment==='function')lifeMoment('📱','Got a first phone from Mom and Dad: her old one, on the family plan.')};
  modal('📱 A phone of your own',body,[
    {l:'🤝 “Deal. Thank you.”',s:'Family +3.',fn:()=>give(3,'📱 You hug Mom, then Dad, then the phone. Nia asks if she can have one. “When you’re twelve.” Tap 📱 on the top bar. The rules are in ⚙️ Settings.')},
    {l:'😩 “Nine?! Everybody else gets ten.”',s:'Mom: “Then earn it.”',fn:()=>give(0,'📱 “Then earn it,” Mom says, and goes back to the dishes. It’s still a phone. Tap 📱 on the top bar. The rules are in ⚙️ Settings, with what would change them.')}],true)}
{const o=GROW.onNewGame;GROW.onNewGame=function(){const r=o.apply(this,arguments);
  try{const P=PH();if((S.age||12)<=12){P.gr={gift:false};pgGiftScene()}else P.gr={gift:true,giftD:-1}}catch(e){console.error(e)}return r}}

// ---- the main screen: the first-phone talk (if the scene was missed), put the phone away ----
{const o=GROW.actionsHere;GROW.actionsHere=function(){const a=o.apply(this,arguments);if(!phKid()||!pgG())return a;const g=pgG(),d=day(),m=tod();
  try{
    if(!g.gift&&S.loc==='home')a.unshift({ic:'📱',l:'Mom and Dad want to talk to you',s:'In the kitchen. Something about a phone.',cat:'family',cls:'primary',fn:()=>pgGiftScene()});
    if(g.gift&&phoneOwned()&&!phoneLocked()&&(m>=1110||pgToday()>=60))
      a.push({ic:'📵',l:'Put the phone away for the night',s:`No apps until morning. Screen time today: ${pgHm(pgToday())}. You sleep better, and Mom notices.`,cat:'rest',fn:()=>{g.away=d;if(PH_OPEN)phoneClose();
        const big=pgToday()>=120;if(big)adj('mood',2);if(m>=1110&&g.fam!==d){g.fam=d;adj('family',1)}
        say(`📵 You plug the phone in on the kitchen counter and walk away from it.${big?' Your eyes thank you. Mood +2.':''}${m>=1110?' Mom raises an eyebrow, impressed. Family +1.':''}`)}});
  }catch(e){console.error(e)}return a}}

// ---- the night: skipped school, screen time ----
{const o=GROW.onNight;GROW.onNight=function(where,notes,d){const r=o.apply(this,arguments);
  try{if(!phKid()||!pgG()||!pgG().gift)return r;const g=PG();
    if(S.sch&&S.sch.skip&&S.sch.skip[d]&&g.skipD!==d){g.skipD=d;notes.push(pgStrike('skip',true))}
    const scr=g.scr[d]||0,late=g.late[d]||0,gr=S.grades!=null;
    if(g.away===d){if(scr>=60){adj('energy',3);notes.push('📵 The phone stayed in the kitchen tonight. You sleep like a rock. Energy +3.')}}
    else if(late>=30){adj('energy',-8);if(gr)S.grades=clamp(S.grades-1,0,100);notes.push(`📱 ${pgHm(late)} on your phone after ${fmt(PG_OFF)}. You fall asleep late with the screen still glowing. Energy −8${gr?', Grades −1':''}.`)}
    else if(scr>=180){if(gr)S.grades=clamp(S.grades-1,0,100);adj('mood',-2);notes.push(`📱 ${pgHm(scr)} of screen time today. Your eyes feel like sandpaper. Mood −2${gr?', Grades −1':''}.`)}
  }catch(e){console.error(e)}return r}}
// curfew: with location sharing on, Mom saw you coming: softer trouble, and you keep the phone
{const o=GROW.onTime;GROW.onTime=function(min){const d=S?day():0,was=!!(S&&S.curfew&&S.curfew[d]);const r=o.apply(this,arguments);
  try{if(S&&!S.over&&!was&&S.curfew&&S.curfew[d]&&phKid()&&pgG()&&pgG().gift){
    const seen=!pgTaken()&&PH().batt>0;
    if(seen){adj('family',6);say(`📍 Mom watched your dot on the map come up the hill the whole way. Late, but she knew where you were. Family −6 instead of −12, and you keep your phone. ${pgStrike('curfew',false)}`)}
    else say(`📵 Mom had no idea where you were${pgTaken()?': she has your phone':PH().batt<=0?': your phone was dead':''}. ${pgStrike('curfew',true)}`)}}catch(e){console.error(e)}return r}}
// report cards: the first morning of a key week, after the time skip
LIFE_HOOKS.weekStart.push(kw=>{try{if(!phKid()||!pgG()||!pgG().gift||!lifeLong()||S.grades==null||S.kwi===0)return;const g=PG();if(g.rep===S.kwi)return;g.rep=S.kwi;
  if(S.grades<PG_BAD)say(`📉 The report card came home: Grades ${S.grades}. ${pgStrike('report',true)}`);
  else if(S.grades>=PG_EARN.grades&&S.family>=PG_EARN.family)say(`📈 A good report card: Grades ${S.grades}. Mom sticks it on the fridge.${pgHeld()?'':' The phone stays on until 10 PM.'}`)}catch(e){console.error(e)}});

// ---- the rules, in ⚙️ Settings ----
function pgRulesHtml(){const g=PG(),e=pgEarned(),F=S.family,Gr=pgGrades();
  let h=phSub('Mom and Dad’s rules');
  if(pgTaken())h+=phCard(`📵 Mom has your phone until ${longDate(g.back)}.`,'warn');
  h+=`<div class="pg-rules">`+phCard(`🔌 <b>Phone off at ${fmt(pgOff())}</b>: it charges in the kitchen. No apps until 6 AM.`)+
    phCard(`💳 <b>${e?`One paid app a month`:'No paid apps'}</b>${e?` (${pgPaidUsed()>=1?'used this month':'one left this month'})`:''}.`)+
    phCard('📍 <b>Mom can see your location.</b> Late but on the map: curfew trouble is softer, and you keep your phone.')+`</div>`;
  h+=phSub('What would change them');
  if(pgHeld())h+=phCard(`⏸️ On hold until ${longDate(g.hold)}: ${PG_WHY[g.why]||''}`,'warn');
  if(!e)h+=phCard(`⬆️ Family ${PG_EARN.family}+ (now ${F}) and Grades ${PG_EARN.grades}+ (now ${Gr})${pgHeld()?', once the hold is over':''}: phone until ${fmt(PG_OFF_EARNED)} and one paid app a month.`);
  else h+=phCard(`✅ Earned: Family ${F} and Grades ${Gr}. Keep both at ${PG_EARN.family}+ to keep the ${fmt(PG_OFF_EARNED)} phone.`,'ok');
  h+=phCard(`⬇️ Skipping school, missing curfew without your location on, or a report card under ${PG_BAD}: Mom takes the phone for ${PG_TAKE} days, and the freedoms go on hold for a week.`);
  h+=phSub('Screen time');
  const t=pgToday(),l=g.late[day()]||0;
  h+=phCard(`📊 <b>${pgHm(t)} today</b>${l?`, ${pgHm(l)} after ${fmt(PG_OFF)}`:''}.<div class="pg-meter" aria-hidden="true"><i style="width:${Math.min(100,Math.round(t/1.8))}%"></i></div>`,t>=180||l>=30?'warn':'');
  h+=phNote('Three hours a day, or half an hour after nine, costs sleep and Grades. 📵 Put the phone away (on the main screen) helps.');
  return h}
{const st=phoneApp('settings');if(st){const v0=st.view;st.view=function(){const h=v0.apply(this,arguments);if(!phKid()||!pgG())return h;return pgRulesHtml()+h}}}

// ---- the Week tab: a weekly screen-time note ----
{const o=GROW.weekView;GROW.weekView=function(){const h=o.apply(this,arguments);try{if(!phKid()||!pgG()||!pgG().gift)return h;const g=PG(),d0=day();
  const days=lifeWeekDays().filter(i=>i<=d0&&(g.giftD==null||i>=g.giftD));if(!days.length)return h;
  const tot=days.reduce((n,i)=>n+(g.scr[i]||0),0),late=days.reduce((n,i)=>n+(g.late[i]||0),0),away=days.filter(i=>g.away===i).length;
  return h+`<div class="rules pg-week">📱 Screen time this week: <b>${pgHm(tot)}</b> over ${days.length} day${days.length===1?'':'s'} (about ${pgHm(tot/days.length)} a day)${late?`, ${pgHm(late)} after ${fmt(PG_OFF)}`:''}. ${tot/days.length>=180||late>=30?'That’s a lot: it’s costing you sleep.':tot/days.length>=60?'About normal.':'Not bad at all.'} Phone off at ${fmt(pgOff())}.</div>`}catch(e){console.error(e);return h}}}

// ---- 18: the rules end, the bill is yours, the contacts come along ----
{const o=lifeHandoff;lifeHandoff=function(){const had=S&&S.ph&&S.ph.gr;const r=o.apply(this,arguments);
  try{if(had&&S.ph){const P=S.ph,g=P.gr;g.done=true;g.back=null;g.hold=null;g.away=null;P.apps=P.apps.filter(id=>!(phoneApp(id)||{}).kid);
    say('📱 Mom and Dad take you off the family plan. The phone is yours now: no more rules, and the bill is yours too. Pick a plan the first time you open it. Your contacts come with you.')}}catch(e){console.error(e)}return r}}

// ---- kid apps ----
const PG_CHAT=[
  ['who has the math homework','not me lol','page 42, all the odd ones','you’re a hero'],
  ['ANYBODY at Wright Park??','on my way','bring the ball','I only have the flat one'],
  ['Ms. Okafor said the Reading Room has new comics','what kind','the good kind','after school?'],
  ['look at the mountain rn','it’s so out today','Rainier said hi','🏔️🏔️🏔️'],
  ['taco truck on MLK is back','the one with the green sauce?','THE one','meet at 4'],
  ['who is going to the game Friday','me','me','me but I have to be home by 10'],
];
function pgCrew(){if(isGrow()&&typeof KIDS!=='undefined')return KIDS.filter(k=>gMet(k.id));
  const G=S.life&&S.life.grow;return (G&&G.kids||[]).map((k,i)=>({id:'old'+i,n:k.n,ic:'🎓'}))}
definePhoneApp({id:'chat',name:'Group Chat',ic:'👥',order:40,size:'30 MB',desc:'The group chat with your friends.',
  view(){const C=pgCrew(),d=day(),g=PG();
    if(!C.length)return phCard(isGrow()?'Nobody in the chat yet. Meet some kids around the hill and they’ll add you.':'Nobody from school in here. The chat is quiet.');
    const L=PG_CHAT[(d+C.length)%PG_CHAT.length];
    let h=phNote(`${C.map(k=>k.n).join(', ')} and you.`);
    h+=L.map((t,i)=>{const k=C[(d+i)%C.length];return `<div class="ph-msg them"><b>${esc(k.n)}</b> ${esc(t)}</div>`}).join('');
    const done=g.chat===d;
    h+=phBtn(done?'✅ Caught up today':'💬 Jump in',()=>{g.chat=d;pass(15);if(isGrow()){const k=C[d%C.length];gFriend(k.id,1);adj('mood',2);say(`💬 Fifteen minutes of jokes in the group chat. ${k.n} sends a voice memo of a dog howling. Friends +1, mood +2.`)}
      else{adj('mood',2);if('stress' in S)adj('stress',-2);say('💬 The old crew from Hilltop High, still going. Somebody posts a yearbook photo. Mood +2.')}},{cls:done?'':'primary',dis:done,sub:done?'Once a day.':'15 min. Friends +1, mood +2.'});
    return h}});
definePhoneApp({id:'homework',name:'Homework Helper',ic:'📚',order:42,size:'60 MB',kid:true,desc:'Practice problems and flashcards. Best on school nights.',when:()=>phKid(),
  view(){const d=day(),g=PG(),night=isSchoolDay(d+1),ch1=typeof gCh1==='function'&&gCh1(),done=g.hw===d;
    let h=phCard(ch1?'Nothing assigned yet. School hasn’t started.':night?'📅 School tomorrow: a good night for it.':'No school tomorrow. It works, just less.');
    h+=phBtn(done?'✅ Studied today':'📚 Study for 30 minutes',()=>{g.hw=d;pass(30);const n=night?2:1;S.grades=clamp(pgGrades()+n,0,100);adj('mood',-1);
      say(`📚 Thirty minutes of flashcards and practice problems. ${pick(['The fractions finally make sense.','You get the last five right in a row.','You explain one to Nia and understand it better yourself.'])} Grades +${n}.`)},
      {cls:done||ch1?'':'primary',dis:done||ch1,sub:ch1?'From the first day of school.':done?'Once a day.':`30 min. Grades +${night?2:1}${night?' (a school night)':''}, mood −1.`});
    return h}});
definePhoneApp({id:'music',name:'Music',ic:'🎧',order:44,size:'80 MB',desc:'Headphones on, world off. Good for a bad mood.',
  view(){const d=day(),g=PG(),n=g.musD===d?(g.mus||0):0,kid=isGrow(),fx=n?1:4;
    let h=phCard(`🎧 ${pick(['A playlist called “bus ride home.”','Old Motown, the kind Dad sings.','Lo-fi beats to do nothing to.','Somebody from Tacoma who just blew up.'])}`);
    h+=phBtn('▶️ Listen for 30 minutes',()=>{g.musD=d;g.mus=n+1;pass(30);adj('mood',fx);if(!kid&&'stress' in S)adj('stress',-fx);phoneUse(3);
      say(`🎧 Half an hour with your headphones on. ${fx>1?'The day gets a lot quieter.':'Still nice, a little less every time.'} ${kid?`Mood +${fx}`:`Mood +${fx}, stress −${fx}`}.`)},{cls:'primary',sub:`30 min. ${kid?`Mood +${fx}`:`Mood +${fx}, stress −${fx}`}${n?' (the first listen of the day helps most)':''}. Battery −3%.`});
    return h}});
definePhoneApp({id:'blocks',name:'Block Drop',ic:'🧩',order:46,size:'120 MB',price:3,desc:'A puzzle game. $3, once.',
  view(){const d=day(),g=PG(),n=g.blkD===d?(g.blk||0):0;
    return phCard('🧩 Falling blocks, clearing lines. Your high score: '+(g.best||0)+'.')+
      phBtn('▶️ One more game',()=>{g.blkD=d;g.blk=n+1;pass(20);phoneUse(4);const s=200+Math.floor(Math.random()*900),hi=s>(g.best||0);g.best=Math.max(g.best||0,s);adj('mood',n<2?2:0);
        say(`🧩 ${s} points${hi?', a new high score':''}. ${n<2?'Mood +2.':'Your thumbs are tired.'}`)},{cls:'primary',sub:`20 min. ${n<2?'Mood +2.':'No more mood today.'} Battery −4%.`})}});

// ---- the Phone chapter in ❓ Help: a Growing Up section ----
{const o=phoneGuide;phoneGuide=function(){return o.apply(this,arguments)+`<h3>Growing Up: Mom and Dad’s rules</h3>
  <ul><li><b>Your first phone:</b> at ${PHONE_GROW_AGE}, Mom’s old one on the family plan, after a talk at the kitchen table. Before that, no phone. Start at 15 and you’ve had it a while.</li>
  <li><b>The rules</b> (in ⚙️ Settings): off at ${fmt(PG_OFF)} (it charges in the kitchen, no apps until 6 AM), no paid apps, and Mom can see your location.</li>
  <li><b>Earn more:</b> Family ${PG_EARN.family}+ and Grades ${PG_EARN.grades}+ means the phone until ${fmt(PG_OFF_EARNED)} and one paid app a month.</li>
  <li><b>Lose it:</b> skip school, miss curfew with no location (a dead phone), or bring home a report card under ${PG_BAD}, and Mom takes the phone for ${PG_TAKE} days; the freedoms go on hold for a week. Late but on the map: Family −6 instead of −12, and you keep the phone.</li>
  <li><b>Kid apps:</b> 👥 Group Chat (Friends +1), 📚 Homework Helper (Grades +2 on a school night), 🎧 Music (a better mood) and 🧩 Block Drop ($3). Apps for adults don’t show up in the App Store under 18.</li>
  <li><b>Screen time:</b> ⚙️ Settings shows today’s, the Week tab the week’s. Three hours a day or half an hour after nine costs sleep and Grades. <b>📵 Put the phone away for the night</b> helps.</li>
  <li><b>At 18</b> the rules end: the phone and the bill are yours (pick a plan the first time you open it), and your contacts come with you.</li></ul>`}}
