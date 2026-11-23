// ---------------- 📱 phone: everyday-life apps ----------------
// 🏦 Bank, 💼 Jobs, 🛒 Groceries, 🩺 Telehealth, 🏘️ Block club (installable), 📷 Camera and 🖼️ Photos (built in),
// and 💘 Tacoma Hearts (installable only in 18+ mode: when() is relActive(), so it's invisible otherwise).
// The API is at the top of 50-phone.js; the phCard/phNote/phSub helpers are in 51-phone-apps.js.
// State: lazy sub-objects of S.ph (old saves just work): PH().bank, .jobs, .groc, .th, .club, .cam (and .photos).
//   🏦 Bank      the balance, the bills (rent, the phone bill, car insurance), pay rent from anywhere, rent autopay on the due
//                day (an overdraft fee when you're a little short, a returned-payment fee when you're a lot short), the savings
//                jar (36-life-events.js, window.LEV.S().jar: put in / take out), and 🧊 Freeze card: after the wallet thief
//                on the bus (lev_wallet) the card gets used about 90 minutes later unless it's frozen first.
//   💼 Jobs      the day-one jobs (JOBS) as listings, an application, an answer the next morning, a start the morning after
//                you accept (the longer games only; a new job starts a new career ladder in 35-careers.js, as it always has).
//                One-off gigs for cash, one a day, adults only.
//   🛒 Groceries the corner market's 4 meals (S.food), ordered ahead: pickup on MLK (5 minutes, not 25) or delivery for a fee.
//   🩺 Telehealth a video visit instead of the walk-in clinic: the ph_sick event (a fever), and Tito Ben's wrist (lev_er).
//   🏘️ Block club the group chat (LV().chat) as an app: posts, the lost dog, the Thursday meeting, package thieves. The old
//                "Join the block club group chat" action at home stays for anyone without the app.
//   📷 Camera    a "Take a photo" button at scenic moments (the ambient Stop and watch moments, the street fair, the sunset at
//                the overlook) and an automatic one at graduation; photos keep the day, place and caption, and count in the
//                life summary and the end screen.
(function(){
const LVs=()=>window.LEV&&LEV.S?LEV.S():(S.lev||{jar:0,inv:{}});
const sub=k=>{const P=PH();return P[k]=P[k]||{}};
const adult=()=>!!S&&!isGrow();
const place=k=>(typeof L!=='undefined'&&L[k]&&L[k].name)||'Tacoma';
const notify=(id,t)=>{if(phoneInstalled(id))phoneNotify(id,t)};
const nextFirst=()=>{for(let d=day()+1;d<=day()+32;d++)if(dateOf(d).d===1)return d;return day()+30};
const mil=()=>typeof milActive==='function'&&milActive();

// ================= 🏦 BANK =================
const BANK={od:300,fee:35};
const odLimit=()=>rp(BANK.od),odFee=()=>rp(BANK.fee);
function bankPayRent(){const d=day(),r=S.rent.amt;if(S.rent.paid||S.money<r)return false;
  spend(r);S.rent.paid=true;S.rent.paidDay=d;pass(2);phoneUse(1);adj('stress',rentEarly(d)?-10:-4);
  say(`🏦 Rent paid from your phone: ${$(r)}. ${rentEarly(d)?'A week early. You exhale for what feels like the first time in a while.':'Done. The roof is yours another month.'}`);return true}
// autopay, the morning rent is due: paid if the money is there; a little short and the bank covers it (overdraft fee);
// a lot short and the payment bounces (a returned-payment fee), and the rent is still due tonight
function bankAutopay(d){const B=PH().bank;if(!B||!B.auto||!adult()||!S.rent||S.rent.paid||S.rent.due!==d||mil())return;
  const r=S.rent.amt;
  if(S.money>=r){spend(r);S.rent.paid=true;S.rent.paidDay=d;const t=`🏦 Autopay: rent paid (${$(r)}).`;say(t);digestLine(t);return}
  const short=r-S.money,f=odFee();
  if(short<=odLimit()){spend(r);spend(f);S.rent.paid=true;S.rent.paidDay=d;adj('stress',4);
    const t=`🏦 Autopay paid the rent (${$(r)}), but you were ${$(Math.ceil(short))} short: an overdraft fee of ${$(f)}. Your balance is ${$(Math.round(S.money))}.`;say(t);digestLine(t);notify('bank','Overdraft: rent paid, fee '+$(f)+'.');return}
  spend(f);adj('stress',6);const t=`🏦 Autopay tried to pay the rent (${$(r)}) and bounced: you're ${$(Math.ceil(short))} short. A returned-payment fee of ${$(f)}, and the rent is still due tonight.`;
  say(t);digestLine(t);notify('bank','Rent payment bounced. Fee '+$(f)+'.')}
// the stolen wallet: the card gets used in about 90 minutes unless it's frozen
const THEFT_WAIT=90;
function bankFreeze(){const B=sub('bank');B.frozen=true;const T=B.theft;
  if(T&&!T.done){T.done=true;adj('stress',-3);say(`🧊 Card frozen in time: a ${$(T.amt)} charge at a gas station in Fife is declined. The bank mails you a new card.`);return}
  say('🧊 Card frozen. Nobody can use it until you unfreeze it.')}
function bankTheftTick(){const B=PH().bank;if(!B||!B.theft||B.theft.done)return;const T=B.theft;
  if(S.t<T.t+THEFT_WAIT&&day()===T.d)return;
  T.done=true;if(B.frozen){say('🧊 Somebody tried your stolen card at a gas station in Fife. Declined: it was frozen.');return}
  const x=Math.max(0,Math.min(T.amt,S.money+odLimit()));money(-x);adj('stress',5);
  const t=`💳 Two charges on your stolen bank card: ${$(x)} at a gas station in Fife. The bank opens a claim, but the money is gone for now. Freezing the card right away would have stopped it.`;
  say(t);digestLine(t);notify('bank','Charges on your stolen card: '+$(x)+'.')}
phoneOnTime(()=>bankTheftTick());
{const e=EV.find(x=>x.id==='lev_wallet');if(e){const r0=e.run,c0=e.choices;
  e.run=function(){const r=r0.apply(this,arguments);try{if(!LVs().front&&phoneOwned()){const B=sub('bank');B.theft={t:S.t,d:day(),amt:rp(lifeLong()?45:30),done:!!B.frozen};
    if(!B.frozen)notify('bank','🧊 Your card is in the stolen wallet. Freeze it now.')}}catch(err){console.error(err)}return r};
  if(c0)e.choices=function(){const ch=c0.apply(this,arguments)||[];return ch.map(o=>o.ic!=='📱'?o:Object.assign({},o,{fn:function(){const r=o.fn.apply(this,arguments);if(phoneCan()){const B=sub('bank');B.frozen=true;if(B.theft&&!B.theft.done){B.theft.done=true;say(`🧊 Just in time: a ${$(B.theft.amt)} charge at a gas station in Fife is declined.`)}}return r}}))}}}
function bankBills(){const h=[],P=PH(),nf=nextFirst();
  if(mil())h.push(['🏠 Rent',`none: ${S.life&&S.life.mil&&S.life.mil.housing==='bah'?'your housing allowance covers it':'a barracks room on JBLM'}`]);
  else if(S.rent){const r=S.rent;h.push(['🏠 Rent',r.paid?(r.due<0?`${$(r.amt)} a month, paid for now`:`paid ${monthDay(r.paidDay)}`):`${$(r.amt)} due ${longDate(r.due)}${r.due===day()?' (today)':''}`])}
  if(P.plan)h.push(['📱 Phone bill',P.cut?`unpaid: ${$(P.owe)} (service off)`:`${$(phoneBillAmt())} on ${monthDay(nf)}`]);
  if(S.car&&S.car.own)h.push(['🚗 Car insurance',`${$(Math.round(S.car.ins))} on ${monthDay(nf)}`]);
  return h}
definePhoneApp({id:'bank',name:'Bank',ic:'🏦',order:61,size:'48 MB',desc:'Your balance, bills, rent autopay, the savings jar and a card freeze.',when:adult,
  view(){const P=PH(),B=sub('bank'),J=LVs(),net=phoneNet();
    let h=`<div class="ph-big">${$(Math.round(S.money))}</div><div style="text-align:center;color:var(--mute);margin-bottom:10px">Checking${J.jar>0?` · 🫙 savings jar ${$(J.jar)}`:''}</div>`;
    if(!net)h+=phCard('📵 No connection: you can look, but payments wait for signal and a paid phone bill.','warn');
    if(B.theft&&!B.theft.done&&!B.frozen)h+=phCard(`⚠️ <b>Your card was in the stolen wallet.</b> Freeze it before somebody uses it.`,'warn');
    h+=phSub('Bills');h+=bankBills().map(([k,v])=>`<div class="kv"><span>${k}</span><b style="text-align:right">${v}</b></div>`).join('')||phNote('No bills.');
    if(S.rent&&!S.rent.paid&&!mil()){const r=S.rent.amt;h+=phBtn(`🧾 Pay rent now: ${$(r)}`,()=>bankPayRent(),{cls:'primary',dis:!net||S.money<r,sub:S.money<r?`You have ${$(Math.round(S.money))}.`:rentEarly(day())?'In the first week: stress −10.':'From anywhere, no trip home.'})}
    if(P.cut)h+=phBtn(`📱 Pay the phone bill: ${$(P.owe)}`,()=>phonePayBill(),{dis:S.money<P.owe,sub:'Service back on right away.'});
    if(!mil())h+=phBtn(`${B.auto?'✅':'⬜'} Rent autopay: ${B.auto?'on':'off'}`,()=>{B.auto=!B.auto;say(B.auto?'🏦 Rent autopay is on: it pays on the morning rent is due.':'🏦 Rent autopay is off.')},
      {sub:`Pays the morning it’s due. Up to ${$(odLimit())} short, the bank covers it for a ${$(odFee())} overdraft fee; more than that and it bounces (${$(odFee())} fee).`});
    h+=phSub('🫙 Savings jar');
    h+=phNote('The same jar as at home. It pays first for the surprises: a dead fridge, a ride to the ER, a broken car window.');
    h+=phBtn(`Put $20 in (${$(J.jar)} saved)`,()=>{money(-20);J.jar+=20;pass(1);say(`🫙 Twenty into savings. ${$(J.jar)} put by for a bad day.`)},{dis:!net||S.money<20});
    if(J.jar>=20)h+=phBtn('Take $20 out',()=>{money(20);J.jar-=20;pass(1);say(`🫙 Twenty out of savings. ${$(J.jar)} left.`)},{dis:!net});
    h+=phSub('Card');
    h+=phBtn(B.frozen?'🔓 Unfreeze your card':'🧊 Freeze your card',()=>{if(B.frozen){B.frozen=false;say('🔓 Card unfrozen. It works again.')}else bankFreeze()},
      {cls:B.theft&&!B.theft.done&&!B.frozen?'primary':'',dis:!net,sub:B.frozen?'Frozen: nobody can use it, you included.':'Lost or stolen? Freeze it in time and nobody can use it.'});
    return h}});
{const m0=onMorning;onMorning=function(d){const r=m0.apply(this,arguments);phTry(()=>bankAutopay(d));return r}}

// ================= 💼 JOBS =================
const GIGS=[
  {k:'deliv',ic:'📦',n:'A delivery run',d:'Groceries and takeout around Hilltop and the Stadium District on a rented e-bike.',mins:120,pay:48,e:-10,st:2},
  {k:'move',ic:'🛋️',n:'Moving help',d:'A couch, a bed and forty boxes up three flights on North K Street.',mins:180,pay:75,e:-18,st:3},
  {k:'yard',ic:'🍂',n:'Yard cleanup',d:'Leaves, blackberry vines and a full yard-waste bin for a neighbor off 11th.',mins:90,pay:36,e:-8,st:1},
];
const jobsOpen=()=>lifeLong()&&adult()&&!mil()&&!(S.life&&S.life.retired)&&!!S.jobPicked&&!!JOBS[S.job]&&Object.keys(JOBS).includes(S.job);
const jobsWhyNot=()=>!lifeLong()?'In Quick play you keep the job you came for. Gigs are open.':mil()?'On active duty: the Army is your job until your enlistment ends.':S.life&&S.life.retired?'You’re retired. Gigs are still open, if you want them.':
  !Object.keys(JOBS).includes(S.job)?`You have a career job (${job().role}). These listings would be a step back.`:'';
function gigBlock(g){const m=tod(),J=job(),d=day();
  if(PH().jobs&&PH().jobs.gig===d)return 'One gig a day: more tomorrow.';
  if(m<480||m+g.mins>1320)return 'Gigs run 8 AM to 10 PM.';
  if(S.energy<20)return 'Too tired: energy under 20.';
  if(!(S.life&&S.life.retired)&&isShiftDay(d)&&!(d in S.worked)&&m<J.end&&m+g.mins>J.start-30)return `Your shift at ${J.place} starts at ${fmt(J.start)}.`;
  return ''}
function gigDo(g){const pay=rp(g.pay);sub('jobs').gig=day();pass(g.mins);money(pay);S.stats.earned+=pay;adj('energy',g.e);adj('stress',g.st);phoneUse(2);
  say(`${g.ic} ${g.n}: ${g.d} ${$(pay)} in the app by the time you’re done.`)}
function jobApply(k){const J=sub('jobs');J.app={k,d:day()};pass(10);phoneUse(2);say(`💼 You apply for ${JOBS[k].n0||JOBS[k].n}. They’ll answer tomorrow.`)}
// the next morning: an answer (good standing where you are counts); after you accept, the new job starts the morning after
function jobsMorning(d){const J=PH().jobs;if(!J||!adult())return;
  if(J.start&&d>=J.start.d){const k=J.start.k;delete J.start;if(!JOBS[k]||!jobsOpen())return;const N=JOBS[k];
    S.job=k;S.alarm=N.alarm;S.career=null;S.standing=Math.max(55,Math.min(70,S.standing));
    if(S.life){S.life.jobs.push({job:k,age:S.age,t:N.role0||N.role,ic:N.ic});lifeMoment(N.ic,`Started a new job: ${N.role0||N.role} at ${N.place}.`)}
    const t=`${N.ic} First day at your new job: <b>${N.n0||N.n}</b>. ${fmt(N.start)} to ${fmt(N.end)}. Your alarm is set for ${fmt(N.alarm)}.`;say(t);digestLine(t);return}
  if(J.app&&d>J.app.d){const k=J.app.k;delete J.app;let h=0;for(const c of 'job'+k+d)h=(h*31+c.charCodeAt(0))>>>0;
    const bg=k==='hospital'&&typeof crimeHasRecord==='function'&&crimeHasRecord();   // 60-crime.js: Tacoma General runs a background check
    const yes=!bg&&S.standing>=40&&h%100<(S.standing>=60?85:60);
    if(yes){J.offer={k,until:d+3};notify('jobs',`${JOBS[k].ic} An offer from ${JOBS[k].place}!`)}else{J.no=k;notify('jobs',`${JOBS[k].place} went with someone else.`)}}
  if(J.offer&&d>J.offer.until){delete J.offer}}
{const m0=onMorning;onMorning=function(d){const r=m0.apply(this,arguments);phTry(()=>jobsMorning(d));return r}}
definePhoneApp({id:'jobs',name:'Jobs',ic:'💼',order:62,size:'36 MB',desc:'Job listings, and one-off gigs for extra cash.',when:adult,
  view(){const J=sub('jobs'),net=phoneNet(),open=jobsOpen();let h='';
    if(J.offer){const N=JOBS[J.offer.k];h+=phCard(`🎉 <b>An offer from ${N.place}</b>: ${N.n0||N.n}, about ${$(Math.round(N.pay*(typeof lifePayF==='function'?lifePayF()/(careerPayF()||1):1)))} a shift. It’s open until ${longDate(J.offer.until)}.`,'ok');
      h+=phBtn('✅ Accept: start tomorrow',()=>{J.start={k:J.offer.k,d:day()+1};delete J.offer;say(`💼 You accept. You start at ${N.place} tomorrow, and tell ${job().place} today.`)},{cls:'primary',dis:!net});
      h+=phBtn('Turn it down',()=>{delete J.offer;say('💼 You thank them and turn it down.')})}
    if(J.start)h+=phCard(`${JOBS[J.start.k].ic} You start at ${JOBS[J.start.k].place} on ${longDate(J.start.d)}.`,'ok');
    if(J.app)h+=phCard(`⏳ Applied to ${JOBS[J.app.k].place}. They’ll answer tomorrow morning.`);
    if(J.no&&!J.app&&!J.offer){h+=phCard(`📭 ${JOBS[J.no].place} went with someone else. Try again another day.`);}
    h+=phSub('Gigs · one a day');
    for(const g of GIGS){const why=gigBlock(g),pay=rp(g.pay);h+=phBtn(`${g.ic} ${g.n}: ${$(pay)}`,()=>gigDo(g),{dis:!net||!!why,sub:why||`${g.mins/60} h, energy ${g.e}. ${g.d}`})}
    h+=phSub('Job listings');
    if(!open)h+=phNote(jobsWhyNot());
    for(const k of Object.keys(JOBS)){if(k===S.job)continue;const N=JOBS[k],bg=k==='hospital'&&typeof crimeHasRecord==='function'&&crimeHasRecord();
      h+=phCard(`${N.ic} <b>${N.n0||N.n}</b><br>${N.blurb}<br>About ${$(N.pay)} a shift${N.tips?' plus tips':''} to start.${k==='hospital'?' Background check required.':''}`);
      if(open)h+=phBtn(`Apply to ${N.place}`,()=>jobApply(k),{dis:!net||bg||!!J.app||!!J.offer||!!J.start,sub:bg?'The background check would show your record. Once it’s vacated, you can apply.':J.app||J.offer||J.start?'One application at a time.':'10 min. A new job starts a new ladder: raises and promotions start over.'})}
    return h}});

// ================= 🛒 GROCERIES =================
const GROC={meals:4,fee:6,pick:60,deliv:90};
function grocOrder(how){const G=sub('groc'),c=rp(42)+(how==='deliv'?rp(GROC.fee):0);if(G.o||S.money<c)return false;spend(c);pass(3);phoneUse(1);
  G.o={how,ready:S.t+(how==='deliv'?GROC.deliv:GROC.pick),d:day()};
  say(how==='deliv'?`🛒 Groceries ordered for delivery: ${$(c)} with the fee. A driver brings them to your door by about ${fmt(G.o.ready)}.`:`🛒 Groceries ordered for pickup at the corner market: ${$(c)}. Grace Kim will have the bag ready by ${fmt(G.o.ready)}.`);return true}
function grocGet(t){const G=sub('groc');delete G.o;S.food+=GROC.meals;say(t)}
function grocTick(){const G=PH().groc;if(!G||!G.o||G.o.how!=='deliv'||S.t<G.o.ready)return;if(S.loc!=='home')return;
  grocGet(`🛒 Your grocery delivery is at the door: ${GROC.meals} meals for the fridge (you have ${S.food+GROC.meals}).`)}
phoneOnTime(()=>grocTick());
const grocWhen=()=>{const m=tod();return m>=420&&m<1260};
definePhoneApp({id:'groc',name:'Groceries',ic:'🛒',order:63,size:'30 MB',desc:'Order the corner market’s groceries ahead: pickup on MLK, or delivery.',when:adult,
  view(){const G=sub('groc'),net=phoneNet(),c=rp(42),f=rp(GROC.fee);
    let h=phCard(`🧊 <b>${S.food} meal${S.food===1?'':'s'}</b> in the fridge. You eat one every night.`,S.food<=1?'warn':'');
    if(G.o){const ready=S.t>=G.o.ready;h+=phCard(G.o.how==='deliv'?(ready?'🚚 Delivered: the bag is at your door. It goes in the fridge when you get home.':`🚚 On the way: at your door by about ${fmt(G.o.ready)}.`)
      :(ready?'🛍️ <b>Ready for pickup</b> at the corner market on MLK: five minutes at the counter.':`🛍️ Being packed: ready at the corner market by ${fmt(G.o.ready)}.`),'ok');return h}
    h+=phSub(`The corner market · ${GROC.meals} meals for ${$(c)}`);
    const why=!net?'No connection.':!grocWhen()?'Orders 7 AM to 9 PM.':'';
    h+=phBtn(`🛍️ Order for pickup: ${$(c)}`,()=>grocOrder('pick'),{cls:'primary',dis:!!why||S.money<c,sub:why||`Ready in an hour. Pick it up on MLK in 5 minutes instead of shopping for 25.`});
    h+=phBtn(`🚚 Order for delivery: ${$(c+f)}`,()=>grocOrder('deliv'),{dis:!!why||S.money<c+f,sub:why||`A ${$(f)} fee. At your door in about an hour and a half: no trip at all.`});
    return h+phNote('The same groceries as at the store. One order at a time.')}});

// ================= 🩺 TELEHEALTH =================
const TH={copay:15,clinic:40};
const thCan=()=>phoneInstalled('health')&&phoneNet();
function thVisit(){const T=sub('th'),c=rp(TH.copay);if(S.money<c)return false;T.last=day();pass(20);phoneUse(4);spend(c);
  if(T.sick===day()||T.sick===day()-1){delete T.sick;adj('energy',8);adj('stress',-6);say(`🩺 A video visit from your couch: twenty minutes, a ${$(c)} copay. “A virus. Fluids, rest, and here’s a note for work.” A prescription waits at the pharmacy on MLK. You feel better just knowing.`)}
  else{adj('stress',-2);say(`🩺 A video visit: ${$(c)}. The doctor listens, checks a few things on camera and says what you suspected: you need sleep and water, not medicine.`)}
  return true}
defEvent({id:'ph_sick',hook:'wake',tile:['🤒','You wake up sick','bad'],chance:0.03,bad:true,cooldown:45,max:3,
  cond:()=>adult()&&day()>0&&S.loc==='home',
  run:()=>{sub('th').sick=day();say('🤒 A scratchy throat, a fever and a head full of wet sand. Nothing an emergency room would want to see, but you are not getting through the day like this without help.')},
  choices:()=>{const v=rp(TH.copay),c=rp(TH.clinic),o=[];
    if(thCan())o.push({ic:'🩺',l:`A video visit on Telehealth — ${$(v)}`,s:'20 minutes from bed. Energy +8, stress −6.',dis:S.money<v,fn:()=>thVisit()});
    o.push({ic:'🏥',l:`The walk-in clinic near Tacoma General — ${$(c)}`,s:'About 2 hours in the waiting room. Energy −4, then better. Stress −2.',dis:S.money<c,fn:()=>{if(S.ev.last.ph_sick===day()&&tod()+120<1400)pass(120);spend(c);delete sub('th').sick;adj('energy',-4);adj('stress',-2);
      say(`🏥 Two hours under a TV playing a cooking show, eight minutes with a nurse practitioner, ${$(c)}. A virus: fluids and rest. ${phoneOwned()&&!phoneInstalled('health')?'The pamphlet at the desk says 🩺 Telehealth does this from your couch.':''}`)}});
    o.push({ic:'🛌',l:'Tough it out with tea and sleep',s:'Free. Energy −12, stress +6.',fn:()=>{adj('energy',-12);adj('stress',6);say('🛌 Tea, honey, a box of tissues and a day that drags. By evening the fever breaks.')}});
    return o},dflt:()=>thCan()?2:1});
// Tito Ben's wrist: with Telehealth a nurse can look at it on camera first
{const e=EV.find(x=>x.id==='lev_er');if(e&&e.choices){const c0=e.choices;e.choices=function(){const ch=c0.apply(this,arguments)||[];if(!thCan())return ch;
  return ch.concat([{ic:'🩺',l:`A video visit for him first on your Telehealth app — ${$(rp(TH.copay))}`,s:'20 min. A nurse looks at it on camera. Community +4, stress −2.',dis:S.money<rp(TH.copay),
    fn:()=>{if(S.ev.last.lev_er===day()&&tod()+20<1400)pass(20);spend(rp(TH.copay));adj('community',4);adj('stress',-2);
      say('🩺 On your phone, a nurse has Tito Ben wiggle his fingers, press his thumb and turn his hand slowly. “A bad sprain, not a break. Ice, a wrap, and his own doctor tomorrow.” No emergency room tonight. Tita Rose sends over a whole pan of lumpia in the morning.')}}])}}}
definePhoneApp({id:'health',name:'Telehealth',ic:'🩺',order:64,size:'64 MB',desc:'A video visit with a doctor, instead of the walk-in clinic for small things.',when:adult,
  view(){const T=sub('th'),c=rp(TH.copay),sick=T.sick===day()||T.sick===day()-1,net=phoneNet();
    let h=phCard(sick?'🤒 <b>You’re sick today.</b> A video visit takes 20 minutes from wherever you are.':'🩺 A doctor on video for small things: a fever, a rash, a cough that won’t quit, a sprain. For a real emergency, call 911.',sick?'warn':'');
    h+=phBtn(`📹 Start a video visit: ${$(c)} copay`,()=>thVisit(),{cls:sick?'primary':'',dis:!net||S.money<c||T.last===day(),sub:!net?'Video needs a connection.':T.last===day()?'One visit a day.':sick?'Energy +8, stress −6.':'20 min. Peace of mind.'});
    return h+phNote(`The walk-in clinic near Tacoma General is about ${$(rp(TH.clinic))} and two hours in the waiting room.`)}});

// ================= 🏘️ BLOCK CLUB =================
const CLUB_POSTS=[
  ['🪴','Ms. Lorraine','Reminder: the crosswalk on 11th is on the city’s list. Keep calling. They count the calls.'],
  ['🛒','Grace Kim','Peaches are in at the market. The good ones, from Yakima. Ask at the counter.'],
  ['🧰','Ron','Free to a good home: a kitchen table, slightly wobbly. Bring a friend and a screwdriver.'],
  ['📦','Bev','Heads up: somebody in a gray hoodie was checking porches on 11th around 2 PM. Use the corner market’s pickup locker for packages!'],
  ['📦','Denise','Another package gone off a porch on our block yesterday. The corner market locker is $5 once. Worth it.'],
  ['🐈','Tita Rose','Has anyone seen an orange cat with one white paw? Answers to Mango. Answers to nothing, honestly.'],
  ['🧹','Denise','Saturday: alley cleanup behind MLK, 9 to 11. Gloves and coffee provided.'],
  ['🎶','Mr. Harris','The choir is singing outside on Sunday if the weather holds. All welcome.'],
];
const clubOn=()=>!!LVs().chat;
function clubPost(ic,who,x){const C=sub('club');C.posts=(C.posts||[]).concat({t:S.t,ic,who,x}).slice(-20)}
function clubPostNotify(ic,who,x){if(!clubOn())return;clubPost(ic,who,x);notify('club',`${who}: ${x.slice(0,70)}${x.length>70?'…':''}`)}
function clubJoin(){const L0=LVs();L0.chat=day()+1;pass(10);adj('community',1);
  say('📱 Bev adds you: “Welcome! Rules: be kind, no selling, dogs get posted first.” Forty-one people, three lost-cat alerts and a recipe for peach cobbler.');
  clubPost('👋','Bev','Welcome to our newest neighbor! Rules: be kind, no selling, dogs get posted first.')}
// the mornings: Thursday's meeting reminder, and now and then a post from the block
function clubMorning(d){if(!adult()||!clubOn())return;const C=sub('club');
  if(dayName(d)==='Thursday'&&C.thu!==d){C.thu=d;clubPostNotify('🗳️','Ms. Lorraine','Block club meeting tonight, 6 to 8 PM in the community room at People’s. Coffee’s on. Bring a neighbor.')}
  else{let h=0;for(const c of 'club'+d)h=(h*31+c.charCodeAt(0))>>>0;if(h%100<35){const p=CLUB_POSTS[h%CLUB_POSTS.length];clubPostNotify(p[0],p[1],p[2])}}}
{const m0=onMorning;onMorning=function(d){const r=m0.apply(this,arguments);phTry(()=>clubMorning(d));return r}}
// the life events show up in the chat
const evPost=(id,f)=>{const e=EV.find(x=>x.id===id);if(!e)return;const r0=e.run;e.run=function(){const r=r0.apply(this,arguments);phTry(f);return r}};
evPost('lev_dog',()=>clubPostNotify('🐶','Bev',`Found: a small gray terrier, pink collar, no tag, near ${place(S.loc)}. Somebody is missing her!`));
evPost('lev_package',()=>clubPostNotify('📦','Denise',LVs().locker?'A box disappeared off a porch two doors down overnight. Locker people, we’re fine.':'Package thief on the block again last night. The corner market has a pickup locker: use it!'));
evPost('lev_scam',()=>clubPostNotify('⚠️','Bev','That text about a FAILED rent payment and a late fee is a SCAM. Don’t click. Call your landlord.'));
evPost('lev_prowl',()=>clubPostNotify('🚗','Ron','Somebody went down the block last night trying car doors. Clear your seats and park under the streetlight.'));
definePhoneApp({id:'club',name:'Block club',ic:'🏘️',order:65,size:'22 MB',desc:'The block club group chat: lost dogs, porch packages, the Thursday meeting.',when:adult,
  view(){const L0=LVs(),C=sub('club'),net=phoneNet(),d=day();
    if(!L0.chat){const n=metCount();return phCard('🏘️ <b>The Hilltop block club</b>: forty-one neighbors, run by Bev. Lost dogs, porch packages, who needs a jump, and the meeting on Thursday evenings at People’s.')+
      phBtn('Join the group chat',()=>clubJoin(),{cls:'primary',dis:n<5||!net,sub:n<5?`Bev adds people she knows. Meet 5 neighbors first (you know ${n}).`:'10 min. Community +1.'})}
    const thu=dayName(d)==='Thursday',ok=thu&&tod()<1200;
    let h=phCard(`🗳️ <b>Block club meeting</b>: Thursdays, 6 to 8 PM, in the community room at People’s.${ok?' <b>Tonight.</b>':''}${L0.club===d?' You went.':''}`,ok?'ok':'');
    h+=phBtn('👋 Post on the board',()=>{C.said=d;pass(5);adj('community',1);const t=pick(['Anyone need a hand carrying groceries up the hill this week? I’m around.','Thank you to whoever swept the sidewalk by the bus stop. Saw it this morning.','Who has the best tamales on the hill? Asking for my whole stomach.']);clubPost('🙂','You',t);say(`🏘️ You post: “${t}” Three hearts in a minute.`)},
      {dis:!net||C.said===d,sub:C.said===d?'Once a day.':'5 min. Community +1.'});
    const P=(C.posts||[]).slice().reverse();
    h+=phSub('Posts');if(!P.length)h+=phNote('Quiet on the block today.');
    h+=P.map(p=>`<div class="ph-post"><span class="ph-av">${p.ic}</span><div><b>${esc(p.who)}</b> <small>${fmtAbs(p.t)}</small><p>${p.x}</p></div></div>`).join('');
    return h}});
// the old action at home stays when there's no app (or no phone): with the app it's in here
{const a0=actionsHere;actionsHere=function(){const a=a0.apply(this,arguments);if(!S||isGrow())return a;
  return phTry(()=>phoneInstalled('club')&&phoneCan()?a.filter(x=>x.l!=='Join the block club group chat'):a,a)}}

// ================= 📷 CAMERA and 🖼️ PHOTOS (built in) =================
const CAM_FRESH=45,PHOTO_MAX=60;
const CAPS={mountain_out:'The mountain is out: Rainier, pink at first light',g_mountain:'The mountain is out, from the window',fair_morning:'The Hilltop Street Fair going up on MLK',
  fair:'The Hilltop Street Fair on MLK',sunset:'Sunset over the bay from the overlook',grad:'Graduation day'};
const camCan=()=>phoneOwned()&&phoneCan();
function camScene(id,ic,title){const C=sub('cam');C.sc={id,ic,title,t:S.t,d:day(),at:S.loc}}
function camFresh(){const C=PH().cam,s=C&&C.sc;return s&&s.d===day()&&S.t-s.t<=CAM_FRESH&&C.shot!==s.t+':'+s.id?s:null}
function photoSave(ic,cap,at){const P=PH();P.photos=P.photos||[];P.nPhotos=(P.nPhotos||P.photos.length)+1;
  P.photos.push({d:day(),t:S.t,at:at||S.loc,pl:place(at||S.loc),ic,cap,age:S.age});if(P.photos.length>PHOTO_MAX)P.photos.splice(0,1)}
function camShoot(s){s=s||camFresh();if(!camCan())return false;const C=sub('cam');
  if(s){C.shot=s.t+':'+s.id;photoSave(s.ic,CAPS[s.id]||s.title,s.at)}else photoSave('📷',`A picture of ${place(S.loc)}`,S.loc);
  phoneUse(1);if(s){if(isGrow())adj('mood',1);else adj('stress',-1)}
  say(`📷 Click. ${s?CAPS[s.id]||s.title:place(S.loc)}, saved to 🖼️ Photos.`);return true}
// a moment fires (the ambient Stop and watch moments, and the fair morning): the camera is ready for it
{const cf=choiceFired;choiceFired=function(e,ctx){const r=cf.apply(this,arguments);
  phTry(()=>{if(ctx&&ctx.hook==='night')return;if(AMB[e.id]||e.id==='fair_morning'){const t=e.tile||['📷',e.id];camScene(e.id,t[0],t[1])}});return r}}
// the choice sheet of a moment gets a 📷 button: Stop and watch, and take the picture
{const oc=openChoice;openChoice=function(id){
  const opts=phTry(()=>choiceOpts(id),null)||[],w=opts.findIndex(o=>o.l==='Stop and watch'),s=camFresh();
  if(w<0||!s||s.id!==id||!camCan())return oc.apply(this,arguments);
  const m0=modalSwap;modalSwap=function(t,b,btns,nc){if(Array.isArray(btns))btns.push({l:'📷 Stop and take a photo',s:'Stop and watch, and keep it in 🖼️ Photos. Battery −1%.',np:true,
    fn:()=>{if(!choiceWaiting(id))return;uiNarr=[];const sc=camFresh();choiceApply(id,w,'pick');camShoot(sc&&sc.id===id?sc:null);afterAction()}});return m0.apply(this,arguments)};
  try{return oc.apply(this,arguments)}finally{modalSwap=m0}};window.openChoice=openChoice}
// the sunset at the overlook and the street fair: a scene once you're there
{const a0=actionsHere;actionsHere=function(){const a=a0.apply(this,arguments);if(!S||isGrow())return a;
  return phTry(()=>a.map(x=>{const k=/^Watch the sunset/.test(x.l)?'sunset':/^The Hilltop Street Fair/.test(x.l)?'fair':null;if(!k||x.dis)return x;
    return Object.assign({},x,{fn:function(){const r=x.fn.apply(this,arguments);camScene(k,k==='sunset'?'🌅':'🎪',k==='sunset'?'The sunset':'The street fair');return r}})}),a)}}
// a 📷 action on the Here tab while a scene is fresh
function camAct(a){const s=camFresh();if(!s||!camCan())return a;
  a.unshift({ic:'📷',l:`Take a photo: ${CAPS[s.id]||s.title}`,s:'A minute. Saved to 🖼️ Photos with the day and the place.',cat:'here',fn:()=>{pass(1);camShoot(s)}});return a}
{const a0=actionsHere;actionsHere=function(){const a=a0.apply(this,arguments);return S?phTry(()=>camAct(a),a):a}}
if(typeof GROW!=='undefined'&&GROW.actionsHere){const a0=GROW.actionsHere;GROW.actionsHere=function(){const a=a0.apply(this,arguments);return S?phTry(()=>camAct(a),a):a}}
// graduation: someone takes your picture on your phone
{const lm=lifeMoment;lifeMoment=function(ic,t){const r=lm.apply(this,arguments);phTry(()=>{if(ic==='🎓'&&/graduat|finish|degree|diploma/i.test(t)&&phoneOwned()){photoSave('🎓',`${CAPS.grad}: ${t.replace(/<[^>]+>/g,'').replace(/\.$/,'')}`,S.loc);sub('cam').grad=day()}});return r}}
definePhoneApp({id:'camera',name:'Camera',ic:'📷',builtin:true,order:40,desc:'Take a photo.',
  view(){const s=camFresh(),C=sub('cam');let h='';
    if(s)h+=phCard(`${s.ic} <b>${CAPS[s.id]||s.title}</b><br>Right in front of you.`,'ok')+phBtn('📷 Take the photo',()=>{pass(1);camShoot(s)},{cls:'primary',sub:'A minute. Battery −1%.'});
    else h+=phCard(`<div style="font-size:42px;text-align:center">📷</div><div style="text-align:center">${place(S.loc)}</div>`)+phNote('Nothing special in front of you right now. Keep the camera handy for the mountain, a sunset at the overlook, the street fair and the moments worth a Stop and watch.');
    h+=phBtn(`Take a picture of ${place(S.loc)}`,()=>{C.snap=S.t;camShoot(null)},{dis:C.snap===S.t,sub:'Just for you.'});
    const n=(PH().photos||[]).length;h+=phNote(`${n} photo${n===1?'':'s'} in 🖼️ Photos.`);return h}});
definePhoneApp({id:'photos',name:'Photos',ic:'🖼️',builtin:true,order:41,desc:'Your photo album.',badge:()=>0,
  view(){const P=(PH().photos||[]).slice().reverse();if(!P.length)return phNote('No photos yet. Open 📷 Camera, or tap 📷 at a moment worth keeping.');
    return phNote(`${PH().nPhotos||P.length} photo${P.length===1?'':'s'}.`)+P.map(p=>`<div class="ph-photo"><span class="ph-pic">${p.ic}</span><div><b>${esc(p.cap)}</b><small>${fullDate(p.d)} · ${fmt(p.t)} · ${esc(p.pl)}</small></div></div>`).join('')}});
const photoN=()=>S&&S.ph?(S.ph.nPhotos||(S.ph.photos||[]).length):0;
function photoSummary(){const n=photoN();if(!n)return '';const P=(S.ph.photos||[]).slice(-4).reverse();
  return `<div class="sect" style="margin-top:14px">📷 Photos</div><div class="kv"><span>🖼️ Photos taken</span><b>${n}</b></div>`+P.map(p=>`<div class="todo"><span class="ck">${p.ic}</span><div><b>${monthDay(p.d)}${p.age!=null?`, age ${p.age}`:''}</b><span>${esc(p.cap)} · ${esc(p.pl)}</span></div></div>`).join('')}
{const ls=lifeSummaryHTML;lifeSummaryHTML=function(){return ls.apply(this,arguments)+phTry(photoSummary,'')}}
{const es=endScreen;endScreen=function(h1,sub,lost){const r=es.apply(this,arguments);if(lifeLong())return r;   // the longer games show it in the life summary
  phTry(()=>{const e=document.querySelector('.end'),h=photoSummary();if(e&&h&&!e.querySelector('.ph-sum')){const b=e.querySelector('button.big'),d=document.createElement('div');d.className='ph-sum';d.innerHTML=h;if(b)b.before(d);else e.appendChild(d)}});return r}}

// ================= 💘 the 18+ app (37-relationships.js: relAppRoll, relAppSend, relProfileSetup) =================
let HEARTS_LAST=null;   // {t,line}: the last first message's answer, shown while the time stands still (not saved)
definePhoneApp({id:'hearts',name:'Tacoma Hearts',ic:'💘',order:66,size:'52 MB',desc:'The dating app everybody on the hill pretends not to use. Adults only, 21+.',
  when:()=>typeof relActive==='function'&&relActive(),
  badge:()=>{const R=S.rel;return R&&R.app&&R.app.wk!==Math.floor(day()/7)?1:0},
  view(){if(!relActive())return phNote('Not available.');const R=relS(),net=phoneNet();
    if(!R.me)return phCard('💘 <b>Tacoma Hearts</b>. Three quick questions for your profile. Everyone on the app is 21 or older.')+phBtn('Set up your profile',()=>{phoneClose();relProfileSetup(()=>phoneOpen('hearts'))},{cls:'primary'});
    if(!net)return phCard('📵 No connection. Matches load when you have signal and a paid phone bill.','warn');
    const ms=relAppRoll();let h='';
    if(HEARTS_LAST&&HEARTS_LAST.t===S.t)h+=phCard(HEARTS_LAST.line,HEARTS_LAST.yes?'ok':'');
    h+=phNote(ms.length?`${ms.length} new match${ms.length===1?'':'es'} this week. Send a first message: pick how you open.`:'No new matches right now. A match or two comes in each week.');
    for(const id of ms){h+=relProfile(id);
      h+=Object.entries(REL_TONES).map(([k,t])=>phBtn(`${t.ic} ${t.l}`,()=>{const r=relAppSend(id,k);if(r)HEARTS_LAST={t:S.t,line:r.line,yes:r.yes}},{sub:`${t.s} 10 min.`})).join('')}
    h+=phNote(relAppLooking());
    h+=phBtn('✏️ Edit your profile',()=>{phoneClose();relProfileSetup(()=>phoneOpen('hearts'),true)});
    return h}});
// with the mode off the app is hidden: it gives its slot back, and comes back when the mode does (if there's room)
phoneOnTime(()=>{if(!S||!S.ph)return;const P=PH(),on=typeof relActive==='function'&&relActive(),i=P.apps.indexOf('hearts');
  if(!on&&i>=0){P.apps.splice(i,1);P.heartsHid=true}else if(on&&P.heartsHid&&P.apps.length<PHONE_SLOTS){P.apps.push('hearts');delete P.heartsHid}});

// ================= the "Your phone" chapter in ❓ Help (rules only, no S) =================
{const g0=phoneGuide;phoneGuide=function(){return g0.apply(this,arguments)+`
    <h3>Everyday apps</h3>
    <ul><li><b>📷 Camera</b> and <b>🖼️ Photos</b> are built in. At a moment worth keeping (the mountain out, a sunset at the overlook, the street fair, a Stop and watch moment), tap <b>📷 Take a photo</b> on the Here tab or <b>📷 Stop and take a photo</b> on the moment itself. Graduation takes one for you. Photos keep the day, the time and the place, and the count shows in your life summary and on the last screen.</li>
    <li><b>🏦 Bank</b> (adults): your balance and the bills (rent, the phone bill, car insurance), <b>Pay rent now</b> from anywhere, and <b>rent autopay</b> on the morning it’s due. Up to about ${$(BANK.od)} short, the bank covers it for a ${$(BANK.fee)} overdraft fee; more than that and the payment bounces (the same fee) and the rent is still due that night. The savings jar is here too: put $20 in or take it out. <b>🧊 Freeze card</b>: if your wallet is stolen on the bus, the card gets used about ${THEFT_WAIT} minutes later unless you freeze it first.</li>
    <li><b>💼 Jobs</b> (adults): one-off gigs for cash, one a day between 8 AM and 10 PM and not into your shift: a delivery run, moving help, a yard cleanup. In the longer games, the job listings: apply, hear back the next morning, and start the morning after you accept. A new job starts its own raises and promotions from the bottom.</li>
    <li><b>🛒 Groceries</b> (adults): the corner market’s 4 meals, ordered ahead from 7 AM to 9 PM. Pick it up on MLK in 5 minutes instead of shopping for 25, or have it delivered for a ${$(GROC.fee)} fee.</li>
    <li><b>🩺 Telehealth</b> (adults): a 20-minute video visit (about ${$(TH.copay)}) instead of two hours at the walk-in clinic (about ${$(TH.clinic)}) when you wake up sick, or for a neighbor’s sprained wrist.</li>
    <li><b>🏘️ Block club</b> (adults): the group chat in an app. Posts from the block, the lost dog, package-thief warnings and the Thursday meeting reminder. Without a phone, join the chat from home as before.</li></ul>`}}

window.PHONE_LIFE={bankAutopay,bankFreeze,jobsMorning,gigDo,GIGS,grocOrder,camShoot,camScene,camFresh,photoSave,photoN,clubPost,clubMorning,thVisit};
})();

// the grocery pickup at the corner market (outside the closure so the Here-tab wrapper order stays simple)
{const a0=actionsHere;actionsHere=function(){const a=a0.apply(this,arguments);if(!S||isGrow()||S.loc!=='mlk')return a;
  try{const G=S.ph&&S.ph.groc;if(G&&G.o&&G.o.how==='pick'){const ready=S.t>=G.o.ready,open=isOpen('mlk')!==false&&tod()>=420&&tod()<1320;
    a.unshift({ic:'🛍️',l:'Pick up your grocery order',s:ready?(open?'5 min at the counter. 4 meals for the fridge.':'The market is open 7 AM to 10 PM.'):`Ready at ${fmt(G.o.ready)}.`,cat:'food',cls:ready&&open?'primary':'',dis:!ready||!open,
      fn:()=>{pass(5);delete G.o;S.food+=4;say(`🛍️ Grace Kim hands over your bag with your name on it: ${S.food} meals in the fridge now. In and out in five minutes.`)}})}}catch(e){console.error(e)}
  return a}}
