// ============================================================
//  TACOMPTON · LIFE IN TACOMA: money and work for kids, a bike, and the community around you. The longer games only
//  (lifeLong()): Quick play is left exactly as it was.
//  Money and work (Growing Up):
//    💵 Allowance every Saturday of a played key week after the first one ($10 at 12–13, $15 at 14–15, $20 at 16–17; the first
//       Saturday is 31-grow-story.js's own, and time skips already pay $10 a week: older kids get the rest on top).
//    🧰 Odd jobs on the block, one a day: mowing (Apr–Sep), raking leaves (Oct–Nov), pet sitting, babysitting (13+, evenings) and
//       shoveling snow (snow days only). Pay is in 2026 dollars; money() (63-era.js) turns it into the year's dollars.
//    🏦 A youth savings account at the credit union branch on MLK (a passbook before 1995), deposits and withdrawals, a little
//       interest in the time skips, and the balance comes with you at 18. 🧾 A first paycheck moment (first job or market shift).
//    🎯 A saving goal (shoes, a bike, a phone or music player by era, a first car at 16+): a tracker on the 📅 Week tab, a moment
//       when Money + savings reach it, then "Buy it" at home.
//  Getting around: 🚲 a used or new bike from the community bike shop on MLK. A 🚲 Ride chip next to Go: faster than walking,
//    free, Hilltop and the nearby neighborhoods (Stadium, Downtown, the Eastside, Proctor, the South End), never in rain, snow,
//    wind or smoke. A lock (36-life-events.js's) keeps it; without one it can be "borrowed" (36-life-events.js's bike rack
//    event, and one here when you ride somewhere), and comes back.
//  Community (both modes): Juneteenth at People's (a park picnic before 2021, a big festival after it became a federal holiday),
//    the block party (third Saturday of July) and the back-to-school giveaway (the Saturday before school) every year; small
//    Tacoma moments as Stop and watch (the mountain from the overlook, the Tacoma Aroma (fading by era), the Narrows bridge, the
//    Dome, the red wolves at the zoo); four local heroes with four-step story arcs (a barber, a coach, a librarian, an auntie down
//    the block); seven everyday community events. The events are drawn from the kind of things that happen on any block; every
//    name and detail is invented, and real people's details are always left out.
//    Adults: a community garden plot behind People's, the Saturday community lunch (volunteering), and mentoring a kid in the
//    youth program from 21.
//  Randomness: events roll from the save's own salt (no Math.random until one fires), at most one of these a day.
//  State: S.cb (made on first use, so older saves just work; outside newState(), so it survives the move at 18).
// ============================================================
(function(){
const long=()=>typeof lifeLong==='function'&&lifeLong()&&!!S&&!!S.life;
const grow=()=>isGrow();
const age=()=>(S&&S.age)||(grow()?12:18);
const Y=()=>typeof yearNow==='function'?yearNow():2026;
const era=f=>{try{return typeof eraHas==='function'?!!eraHas(f):true}catch(e){return true}};
const old=()=>typeof eraOld==='function'&&eraOld();
function CB(){const c=S.cb||(S.cb={});
  const def={salt:null,allow:{},odd:{n:0,paid:0,day:-1,kinds:{}},acct:null,goal:null,goals:{},bike:null,bikeGone:-1,lockTold:false,rides:0,
    paycheck:false,yr:{},hero:{},heroLast:{},evDay:-1,ev:{},plot:null,vol:0,volDay:-1,mentor:null,ride:{},moments:{}};
  for(const k in def)if(c[k]===undefined)c[k]=def[k];
  if(c.salt==null){const b=S.birthday||{m:1,d:1};c.salt=((b.m*37+b.d)*1009+(S.startYear||2026)*7+(S.startAge||12))>>>0}
  return c}
// a number in [0,1) from the save's salt and a key: the same day and place always roll the same
function roll(k){let h=2166136261^CB().salt;const s=String(k);for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0}
  h^=h>>>13;h=Math.imul(h,0x5bd1e995)>>>0;h^=h>>>15;return (h>>>0)/4294967296}
// money: kids' prices in the year's dollars (gRp has the difficulty), adults' through rp(); kids' pay goes through money() (63-era.js scales it)
const eraK=()=>old()&&grow()&&typeof eraPriceF==='function'?eraPriceF():1;
const P=c=>grow()?Math.max(1,Math.round(gRp(c)*eraK())):rp(c);
const pay$=c=>grow()?Math.round(c*eraK()*100)/100:rp(c);   // what an earning shows as
function earn(c){if(grow())gEarn(c);else{const v=rp(c);money(v);S.stats.earned=(S.stats.earned||0)+v}}
function cost(c){const v=P(c);if(grow())gSpend(v);else spend(v);return v}
const sg=v=>(v>0?'+':'−')+Math.abs(v);
const today=()=>day();
const at=(lo,hi)=>tod()>=lo&&tod()<hi;
const sat=(d=day())=>((d%7)+7)%7===5;
const wx=(d=day())=>{try{return typeof wxOf==='function'?wxOf(d):null}catch(e){return null}};
const wet=(d=day())=>{const w=wx(d);return ['rain','snow','wind','smoke'].includes(w)||(grow()&&typeof gRain==='function'&&gRain())};
const mon=(d=day())=>dateOf(d).m;
const later=(m)=>{if(m&&tod()+m<1400)pass(m)};
const curfewOk=m=>!grow()||S.loc==='home'||tod()+m<=gCurfew()-15;

// ---- the meters, the same words in both modes ----
function fam(n){if(!n)return;if(grow())adj('family',n);else if(S.life)S.life.family=clamp(Math.round(S.life.family+n),0,100)}
function feel(n){if(!n)return;if(grow())adj('mood',n);else if(n>0)calm(n);else adj('stress',-n)}
function com(n){if(!n)return;if(!grow()){adj('community',n);return}const k=gBest()||KIDS.find(x=>gMet(x.id));if(k)gFriend(k.id,n);else adj('mood',Math.ceil(n/2))}
function fxTxt(o){const W=grow()?{mo:'mood',fam:'family',com:'friends'}:{mo:'stress',fam:'family',com:'community'},out=[];
  if(o.min)out.push(o.min>=60?`${Math.round(o.min/6)/10} hr`:`${o.min} min`);
  if(o.cost)out.push(`−${$(P(o.cost))}`);
  if(o.earn)out.push(`+${$(pay$(o.earn))}`);
  if(o.e)out.push(`energy ${sg(o.e)}`);
  if(o.mo)out.push(grow()?`mood ${sg(o.mo)}`:`stress ${sg(-o.mo)}`);
  if(o.fam)out.push(`family ${sg(o.fam)}`);
  if(o.com&&(grow()?KIDS.some(x=>gMet(x.id)):true))out.push(`${W.com} ${sg(o.com)}`);
  return out.length?cap(out.join(', '))+'.':''}
// one option for an event: fx {min, cost, earn, e, mo, fam, com}, then(), txt
function opt(ic,l,o,txt,then){const broke=o.cost&&S.money<P(o.cost),late=o.min&&!curfewOk(o.min);
  return {ic,l,s:late?`No time: curfew is ${fmt(gCurfew())}.`:broke?`You have ${$(Math.round(S.money))}.`:fxTxt(o),dis:!!(broke||late),fn:()=>{
    if(o.cost)cost(o.cost);if(o.earn)earn(o.earn);later(o.min);if(o.e)adj('energy',o.e);feel(o.mo);fam(o.fam);com(o.com);if(then)then();if(txt)say(typeof txt==='function'?txt():txt)}}}
const skip=(l,txt)=>({ic:'👋',l,s:'Nothing gained, nothing spent.',fn:()=>{if(txt)say(txt)}});
const watch=(mins,mo,text)=>grow()?gWatch(mins,mo,text):stopWatch({mins,calm:mo,text});

// ================= MONEY AND WORK (Growing Up) =================
const kidOn=()=>long()&&grow()&&age()<18;
const notCh1=(d=day())=>!(typeof gCh1==='function'&&gCh1(d));
const allowAmt=(a=age())=>a<14?10:a<16?15:20;

// ---- odd jobs on the block: one a day ----
const ODD={
  mow:{m:'mowing a neighbor’s lawn',ic:'🌱',l:'Mow the Hendersons’ lawn two doors down',min:60,pay:15,e:-8,mo:2,age:12,when:d=>mon(d)>=4&&mon(d)<=9&&!wet(d),why:'',
    t:['🌱 Mr. Henderson’s mower is older than you and starts on the fourth pull. Straight lines, mostly. He inspects the edges and pays you in cash and a cold can of pop.','🌱 Back and forth, back and forth, the smell of cut grass all over the block. Mrs. Henderson waves from the window and points at a spot you missed. You get it.']},
  rake:{m:'raking leaves for Auntie Gloria',ic:'🍂',l:'Rake leaves for Auntie Gloria',min:60,pay:12,e:-7,mo:2,age:12,when:d=>(mon(d)===10||mon(d)===11)&&!wet(d),why:'',
    t:['🍂 The big maple has dropped everything at once. Six bags, one leaf pile you jump in (once, for science), and Auntie Gloria pays you in cash and a slice of sweet potato pie.','🍂 A wheelbarrow, a rake taller than you, and a crow supervising from the fence. The yard is green again by the time the streetlights come on.']},
  pet:{m:'walking Biscuit next door',ic:'🐕',l:'Walk and feed Biscuit next door',min:30,pay:8,e:-3,mo:4,age:12,when:()=>true,why:'',
    t:['🐕 Biscuit is a very old beagle who walks at the speed of a very old beagle. You let him sniff every pole on the block. Food, fresh water, a belly rub. Paid.','🐕 Biscuit howls hello from inside the door, eats in four seconds and drags you around the block twice. The neighbors leave the money under the mat with a note: “He likes you.”']},
  sit:{m:'babysitting the Reyes twins',ic:'👶',l:'Babysit the Reyes twins on the corner',min:150,pay:30,e:-9,mo:2,fam:1,age:13,when:()=>true,win:d=>isSchoolDay(d)?[990,1110]:[600,1110],why:'After school from 4:30 PM, or a weekend day. Start by 6:30 PM.',
    t:['👶 Two four-year-olds, one bath, three books and a long talk about whether dinosaurs had birthdays. Both asleep by eight. Mrs. Reyes says you’re hired for life.','👶 The twins build a blanket fort, demolish it and build it again. Mac and cheese, pajamas, one tantrum about a sock. You win. You get paid.']},
  shovel:{m:'shoveling snow for the neighbors',ic:'❄️',l:'Shovel the neighbors’ steps and sidewalks',min:60,pay:20,e:-10,mo:5,age:12,when:d=>wx(d)==='snow',why:'Snow days only.',
    t:['❄️ A snow shovel, two inches of Tacoma snow and every steep set of steps on the block. Mr. Harris’s neighbor gives you twenty dollars and a mug of cocoa you finish on her porch.','❄️ You clear four sets of steps and a sidewalk. The hill is quiet, white and slippery, and every grown-up you help says you’re “a good kid.” You are, today.']},
};
function oddActs(a){
  if(!kidOn()||!notCh1()||S.loc!=='home')return;
  const c=CB(),d=day(),done=c.odd.day===d,inSchool=isSchoolDay(d)&&tod()<925;
  for(const [k,J] of Object.entries(ODD)){if(age()<J.age||!J.when(d))continue;   // out of season: not listed
    const w=J.win?J.win(d):[480,Math.max(540,gCurfew()-J.min-15)],ok=true,win=at(w[0],w[1]),can=win&&!done&&!inSchool;
    a.push({ic:J.ic,l:`${J.l}: ${$(pay$(J.pay))}`,cat:'odd',cls:k==='shovel'&&can?'primary':'',dis:!can,
      s:done?'One odd job a day: done for today.':inSchool?'After school.':!win?(J.win?J.why:'In the daytime, before curfew.'):`${J.min>=60?Math.round(J.min/6)/10+' hr':J.min+' min'}, energy ${sg(J.e)}, mood +${J.mo}.`,
      fn:()=>{c.odd.day=d;c.odd.n++;c.odd.kinds[k]=(c.odd.kinds[k]||0)+1;pass(J.min);adj('energy',J.e);adj('mood',J.mo);if(J.fam)adj('family',J.fam);
        const p=pay$(J.pay);gEarn(J.pay);c.odd.paid=Math.round((c.odd.paid+p)*100)/100;
        say(`${pick(J.t)} <b>+${$(p)}</b>.`);
        if(c.odd.n===1)lifeMoment('🧰',`First odd job on the block: ${J.m}.`)}});
  }
}

// ---- the youth savings account at the credit union on MLK ----
const cuOpen=()=>{const d=day()%7,m=tod();return d<5?m>=540&&m<1050:d===5?m>=540&&m<780:false};
const cuHours='The credit union is open weekdays 9 AM to 5:30 PM and Saturdays 9 AM to 1 PM.';
const acctName=()=>Y()<1995?'a passbook savings account':'a youth savings account';
const bal=()=>{const c=CB();return c.acct?c.acct.bal:0};
function deposit(x){const c=CB();x=Math.round(Math.min(x,S.money)*100)/100;if(x<=0)return 0;S.money=Math.round((S.money-x)*100)/100;c.acct.bal=Math.round((c.acct.bal+x)*100)/100;c.acct.in+=x;return x}
function withdraw(x){const c=CB();x=Math.round(Math.min(x,c.acct.bal)*100)/100;if(x<=0)return 0;c.acct.bal=Math.round((c.acct.bal-x)*100)/100;S.money=Math.round((S.money+x)*100)/100;return x}
function bankActs(a){
  if(!kidOn()||S.loc!=='mlk')return;
  const c=CB(),op=cuOpen(),min=P(5);
  if(!c.acct){a.push({ic:'🏦',l:`Open ${acctName()} at the credit union`,cat:'money',dis:!op||S.money<min,
    s:!op?cuHours:S.money<min?`It takes ${$(min)} to open. You have ${$(Math.round(S.money))}.`:`20 min. Mom meets you there and signs as your grown-up. ${$(min)} to start, and it earns a little interest.`,
    fn:()=>{pass(20);c.acct={open:day(),bal:0,in:0,int:0};deposit(min);adj('mood',5);adj('family',2);lifeMoment('🏦',`Opened a first bank account at the credit union on MLK, age ${age()}.`);
      say(Y()<1995?`🏦 A teller named Mrs. Abernathy types your name on a little blue passbook, stamps your first deposit (${$(min)}) in purple ink, and slides it across the counter like it’s a diploma. Mom keeps a straight face. Barely.`
        :`🏦 A teller named Marcus Bell (no relation to the kid on the courts) prints your account card, shows you the balance (${$(min)}), and explains interest with a jar of pennies. ${era('phoneBank')?'Mom puts the app on your phone so you can watch it.':'Every statement comes in the mail with your name on it.'}`)}});return}
  if(!op){a.push({ic:'🏦',l:`The credit union: ${$(bal())} in savings`,s:cuHours,cat:'money',dis:true,fn:()=>{}});return}
  const m=S.money;
  if(m>=P(5))a.push({ic:'🏦',l:`Deposit ${$(P(5))} in savings`,s:`5 min. Savings: ${$(bal())}.`,cat:'money',fn:()=>{pass(5);const x=deposit(P(5));say(`🏦 ${$(x)} in. The teller stamps it. Savings: ${$(bal())}.`)}});
  if(m>=P(20))a.push({ic:'🏦',l:`Deposit ${$(P(20))} in savings`,s:`5 min. Savings: ${$(bal())}.`,cat:'money',fn:()=>{pass(5);const x=deposit(P(20));say(`🏦 ${$(x)} in. Savings: ${$(bal())}. It feels like more in there than in your pocket.`)}});
  if(m>P(10))a.push({ic:'🏦',l:`Deposit everything but ${$(P(5))}`,s:`${$(Math.round((m-P(5))*100)/100)} into savings. Keep ${$(P(5))} for snacks.`,cat:'money',fn:()=>{pass(5);const x=deposit(m-P(5));adj('mood',2);say(`🏦 ${$(x)} into savings. You walk out with ${$(Math.round(S.money))} and a very grown-up feeling.`)}});
  if(bal()>0)a.push({ic:'💵',l:`Take out ${$(Math.min(bal(),P(10)))}`,s:`Savings: ${$(bal())}.`,cat:'money',fn:()=>{pass(5);const x=withdraw(P(10));say(`💵 ${$(x)} out of savings. Savings: ${$(bal())}.`)}});
  if(bal()>P(10))a.push({ic:'💵',l:`Take out all ${$(bal())}`,s:'Empty the account (it stays open).',cat:'money',fn:()=>{pass(5);const x=withdraw(bal());say(`💵 ${$(x)} out. The teller asks if you’re buying something big. “Maybe,” you say.`)}});
}

// ---- saving goals: the Week tab tracks Money + savings ----
const GOALS={
  shoes:{ic:'👟',n:()=>'new shoes for the season',price:90,age:12,buy:'👟 The box, the tissue paper, that new-shoe smell. You wear them out of the store and step around every puddle on MLK.'},
  bike:{ic:'🚲',n:()=>'a new bike',price:250,age:12,ok:()=>!CB().bike,buy:'🚲 A brand-new bike from the community bike shop on MLK, with a bell you ring all the way home.'},
  music:{ic:()=>Y()<1998?'🎧':'📱',n:()=>Y()<1990?'a Walkman':Y()<1998?'a Discman':Y()<2008?'a cell phone of your own':'a newer phone',price:150,age:12,
    buy:()=>Y()<1998?`🎧 ${Y()<1990?'A Walkman':'A Discman'} with foam headphones, and you know exactly which tape goes in first.`:Y()<2008?'📱 A phone of your own: a ringtone you pick, a case you pick, and a family plan Dad sighs about.':'📱 A newer phone with a camera that can actually see the mountain.'},
  car:{ic:'🚗',n:()=>'a first car',price:3000,age:16,buy:'🚗 You can’t buy it yet: you’re still under Mom and Dad’s roof. The money stays saved, and at 18 it goes with you.'},
};
const gIc=g=>typeof g.ic==='function'?g.ic():g.ic;
const saved=()=>Math.round((S.money+bal())*100)/100;
function goalPick(){
  const c=CB(),opts=Object.entries(GOALS).filter(([k,g])=>age()>=g.age&&(!g.ok||g.ok())&&!c.goals[k]);
  modal('🎯 A saving goal',`<p>Pick one thing to save for. The 📅 Week tab tracks your Money plus your savings until you get there.</p>`,
    opts.map(([k,g])=>({l:`${gIc(g)} ${cap(g.n())}: ${$(P(g.price))}`,s:k==='car'?'At 16 and up. The money waits for you at 18.':'',fn:()=>{c.goal={k,price:P(g.price),since:day(),hit:false};say(`🎯 Saving for ${g.n()}: ${$(c.goal.price)}. You have ${$(Math.round(saved()))} so far.`)}})).concat([{l:'Not now',fn:()=>{}}]));
}
function goalCheck(lines){
  const c=CB(),G=c.goal;if(!G||G.hit)return;
  if(saved()>=G.price){G.hit=day();const g=GOALS[G.k];const t=`🎯 You did it: ${$(G.price)} saved for ${g.n()}. ${G.k==='car'?'It’s in savings, waiting for 18.':'Tap “Buy it” at home when you’re ready.'}`;
    lifeMoment('🎯',`Saved up for ${g.n()}.`);adj('mood',8);if(lines)lines.push(t);else say(t)}}
function goalBuy(){
  const c=CB(),G=c.goal;if(!G)return;const g=GOALS[G.k];
  if(G.k==='car'){c.goals.car=day()+1;c.goal=null;const put=c.acct?deposit(Math.max(0,Math.min(S.money,G.price-bal()))):0;say((typeof g.buy==='function'?g.buy():g.buy)+(put?` You move ${$(put)} from your Money into savings.`:''));return}
  let left=G.price;const fromW=Math.min(S.money,left);S.money=Math.round((S.money-fromW)*100)/100;left-=fromW;if(left>0)withdraw(left);S.stats.spent+=G.price;
  c.goals[G.k]=day()+1;c.goal=null;adj('mood',6);
  if(G.k==='bike'){c.bike={kind:'new',d:day()};lifeMoment('🚲','A brand-new bike, bought with your own savings.')}
  say((typeof g.buy==='function'?g.buy():g.buy)+' Bought with money you saved yourself, which makes it twice as good.');
}
function goalActs(a){
  if(!kidOn()||!notCh1()||S.loc!=='home')return;
  const c=CB(),G=c.goal;
  if(G&&G.hit)a.push({ic:'🎯',l:`Buy it: ${GOALS[G.k].n()}`,s:G.k==='car'?'Put it away for 18.':`${$(G.price)} from your Money first, then savings.`,cat:'money',cls:'primary',dis:G.k!=='car'&&saved()<G.price,fn:()=>{pass(G.k==='bike'?40:30);goalBuy()}});
  else if(G)a.push({ic:'🎯',l:`Saving for ${GOALS[G.k].n()}: ${$(Math.round(saved()))} of ${$(G.price)}`,s:'Tap to pick a different goal. The 📅 Week tab tracks it.',cat:'money',fn:()=>goalPick()});
  else if(Object.entries(GOALS).some(([k,g])=>age()>=g.age&&(!g.ok||g.ok())&&!c.goals[k]))a.push({ic:'🎯',l:'Pick a saving goal',s:'Shoes, a bike, music or a phone, a first car at 16. The Week tab tracks it.',cat:'money',fn:()=>goalPick()});
}
function goalHTML(){
  const c=CB(),G=c.goal;if(!G)return '';const g=GOALS[G.k],s=saved(),p=Math.min(100,Math.round(s/G.price*100));
  return `<div class="todo"><span class="ck">${gIc(g)}</span><div><b>🎯 Saving for ${g.n()}: ${$(Math.round(s))} of ${$(G.price)}</b><span>${G.hit?'Reached! Buy it at home.':`${p}%. Money ${$(Math.round(S.money))}${c.acct?` + savings ${$(bal())}`:''}.`}</span>
    <div class="cb-meter" role="meter" aria-label="Saving goal" aria-valuenow="${p}" aria-valuemin="0" aria-valuemax="100" style="height:8px;border-radius:4px;background:var(--line,#ddd);margin-top:4px;overflow:hidden"><div style="height:100%;width:${p}%;background:var(--good,#2f8f6a)"></div></div></div></div>`;
}

// ---- the first paycheck ----
function paycheckCheck(lines){
  const c=CB();if(c.paycheck||!isGrow())return;
  const gh=S.gh&&S.gh.shifts>0,pt=S.pt&&Object.keys(S.pt).length>0;if(!gh&&!pt)return;
  c.paycheck=day()+1;const where=gh&&S.gh.job&&GROW.hoods&&GROW.hoods.JOBS[S.gh.job.id]?GROW.hoods.JOBS[S.gh.job.id].n:'work';
  lifeMoment('🧾',`First paycheck, from ${where}.`);
  const t=`🧾 Your first paycheck. A pay stub with your name on it, and a line for taxes you did not know about. ${c.acct?'Half of it goes in savings at the credit union.':'Mom says the credit union on MLK will open a savings account for you.'}`;
  if(c.acct){const half=Math.round(Math.min(S.money,Math.max(0,(S.gh&&S.gh.paid)||56)/2)*100)/100;if(half>0)deposit(half)}
  if(lines)lines.push(t);else say(t);
}

// ================= THE BIKE =================
const BIKE_HOODS={stadium:8,downtown:12,eastside:15,proctor:18,southend:16};
const bikeOwn=()=>!!S&&!!S.cb&&!!S.cb.bike;
const bikeHere=()=>bikeOwn()&&S.cb.bikeGone<0;
const hasLock=()=>!!(S.lev&&S.lev.inv&&S.lev.inv.lock);
const hoodK=k=>(L[k]||{}).hood||(typeof hoodOf==='function'?hoodOf(k):null)||null;
let RIDING=false;
function walkMins(a,b){const r=RIDING;RIDING=false;try{return travelMins(a,b)}finally{RIDING=r}}
function bikeMins(a,b){
  const ha=hoodK(a),hb=hoodK(b);if(ha&&hb)return null;           // across town, or inside a neighborhood: walk or ride the bus
  if(!ha&&!hb)return Math.max(3,Math.round(walkMins(a,b)*0.5));
  const h=ha||hb,on=ha?b:a,off=ha?a:b;if(BIKE_HOODS[h]==null)return null;
  const hub=HOODS[h]&&HOODS[h].hub,leg=on==='mlk'?0:Math.round(walkMins(on,'mlk')*0.5),inn=hub&&off!==hub?3:0;
  return leg+BIKE_HOODS[h]+inn;
}
const rideOk=()=>long()&&bikeHere()&&!wet()&&tod()>=420&&(!grow()||tod()<gCurfew()-10)&&(!grow()||!(isSchoolDay()&&tod()<925&&notCh1()));
{const tm=travelMins;travelMins=function(a,b){if(!RIDING)return tm(a,b);try{const x=bikeMins(a,b);return x==null?tm(a,b):x}catch(e){return tm(a,b)}}}
if(typeof hoodFare==='function'){const hf=hoodFare;hoodFare=function(a,b){return RIDING?0:hf(a,b)}}
function rideGo(k){if(!rideOk()||!L[k]||k===S.loc)return;const m=bikeMins(S.loc,k);if(m==null)return;RIDING=true;CB().rides++;go(k)}
{const oa=onArrive;onArrive=function(dest,from){const was=RIDING,g=was&&isGrow()&&S.gh&&!S.gh.orca?S.gh:null;if(g)g.orca=-1;   // no Youth ORCA tap on a bike
  try{return oa(dest,from)}finally{if(g&&g.orca===-1)g.orca=0;RIDING=false;if(was)try{bikeArrive(dest)}catch(e){console.error(e)}}}}
function bikeArrive(dest){const c=CB();if(dest==='home')return;
  if(hasLock()&&!c.lockTold){c.lockTold=true;say('🔒 You lock the bike to the rack: through the frame and the back wheel, the way Grace Kim showed you.')}}
{const dc=window.driveChip;window.driveChip=function(k){let h=typeof dc==='function'?dc(k):'';
  try{if(rideOk()&&L[k]&&k!==S.loc){const m=bikeMins(S.loc,k),w=walkMins(S.loc,k);
    if(m!=null&&m<w){const i=ACTS.push(()=>rideGo(k))-1;h+=`<button class="chip" onclick="ACT(${i})" aria-label="Ride your bike to ${esc(L[k].name)} · ${m} min">🚲 Ride · ${m} min</button>`}}}catch(e){}
  return h}}
const BIKE_SHOP={used:{p:60,n:'a used bike',d:'Fixed up by the shop’s volunteers: new brakes, a chain that shines, a seat with a story.'},new:{p:250,n:'a new bike',d:'Straight out of the box, with gears you will learn eventually.'}};
const shopOpen=()=>{const w=day()%7;return w>=1&&w<=5&&at(600,1080)};
function bikeActs(a){
  if(!long()||S.loc!=='mlk'||age()<12)return;
  const c=CB(),op=shopOpen(),cat=grow()?'money':'here';
  if(!c.bike){for(const [k,B] of Object.entries(BIKE_SHOP)){const p=P(B.p),ok=op&&S.money>=p;
    a.push({ic:'🚲',l:`Buy ${B.n} at the community bike shop — ${$(p)}`,cat,dis:!ok,s:!op?'The bike shop is open Tuesday to Saturday, 10 AM to 6 PM.':S.money<p?`You have ${$(Math.round(S.money))}.${grow()?' A saving goal helps.':''}`:`30 min. ${B.d}`,
      fn:()=>{pass(30);cost(B.p);c.bike={kind:k,d:day()};if(grow())adj('mood',8);else calm(6);lifeMoment('🚲',`${k==='new'?'A new':'A used'} bike from the community bike shop on MLK.`);
        say(`🚲 ${cap(B.n)}: ${B.d} The mechanic, Ruthie, raises the seat two notches and says “Helmet. Lights. And lock it through the frame.” Now there’s a 🚲 Ride button next to Go for Hilltop and the nearby neighborhoods.${hasLock()?'':' A lock from the corner market would keep it yours.'}`)}})}}
  else if(c.bikeGone>=0)a.push({ic:'🚲',l:'Your bike is gone for now',s:'Somebody “borrowed” it. Bikes on this hill tend to come home.',cat,dis:true,fn:()=>{}});
  if(!grow()&&!hasLock()){const p=rp(8);a.push({ic:'🔒',l:`A U-lock at the bike shop — ${$(p)}`,s:op?'Through the frame, not just the wheel.':'The bike shop is open Tuesday to Saturday, 10 AM to 6 PM.',cat,dis:!op||S.money<p,
    fn:()=>{spend(p);(S.lev=S.lev||{inv:{}}).inv=S.lev.inv||{};S.lev.inv.lock=day()+1;pass(5);say('🔒 A heavy U-lock. Ruthie shows you the trick: through the frame and the back wheel, around something that doesn’t move.')}})}
}
function rideActs(a){
  if(!long()||S.loc!=='home'||!bikeOwn())return;
  const c=CB(),d=day(),done=!!c.ride[d],ok=bikeHere()&&!wet()&&at(420,grow()?gCurfew()-40:1260)&&!(grow()&&isSchoolDay()&&tod()<925&&notCh1());
  a.push({ic:'🚲',l:'Ride around the neighborhood',cat:grow()?'fun':'rest',dis:done||!ok,
    s:done?'Done for today.':!bikeHere()?'Your bike is gone for now.':wet()?'Not in this weather: rain, snow, wind or smoke.':!ok?(grow()?'In the daytime, home before curfew.':'7 AM to 9 PM.'):`30 min. ${grow()?'Mood +5':cap(calmTxt(6))}, energy −4. Once a day.`,
    fn:()=>{c.ride[d]=true;pass(30);adj('energy',-4);if(grow())adj('mood',5);else calm(6);
      say(pick(['🚲 Down the side streets, no hands for half a block, up MLK past the murals and around People’s. The hill is steeper on a bike. Going down it is the best part.','🚲 You loop the block four times, ring the bell at Biscuit, and coast down toward the overlook with the bay opening up in front of you.','🚲 A slow ride past the porches: somebody’s grill, somebody’s radio, a little kid on training wheels who races you and wins.']))}});
}
// the bike rack event (36-life-events.js) and its happy ending: a bike with no lock goes missing for a day or two
function bikeHooks(){
  const e1=EV.find(x=>x.id==='lev_g_bike'),e2=EV.find(x=>x.id==='lev_g_bike_back');
  if(e1&&e1.run){const r=e1.run;e1.run=function(c){const o=r.apply(this,arguments);try{if(bikeOwn()&&!hasLock())S.cb.bikeGone=day()}catch(e){}return o}}
  if(e2&&e2.run){const r=e2.run;e2.run=function(c){const o=r.apply(this,arguments);try{if(S.cb)S.cb.bikeGone=-1}catch(e){}return o}}
  // on a bike there's no bus or train to miss, crowd or pay for
  for(const id of ['link_delay','cr_fare','lev_wallet','lev_bus','lev_g_linklost','lev_phone']){const e=EV.find(x=>x.id===id);if(!e)continue;const c0=e.cond;e.cond=ctx=>!RIDING&&(!c0||c0(ctx))}
}
bikeHooks();

// ================= THE MORNING: allowance, the yearly events, a bike that comes back =================
const sayM=l=>{say(l);digestLine(l)};
// the yearly days: Juneteenth (the Saturday nearest June 19), the block party (the third Saturday of July), the giveaway (the
// Saturday before school starts: the Saturday before the Monday of the week of Sept 1)
function yDays(y){
  const jt=(()=>{const i=dayIndexOf(y,6,19),w=((i%7)+7)%7;return w===5?i:w===6?i-1:w<=1?i-(w+2):i+(5-w)})();
  const j1=dayIndexOf(y,7,1),w1=((j1%7)+7)%7,bp=j1+((5-w1+7)%7)+14;
  const s1=dayIndexOf(y,9,1),ws=((s1%7)+7)%7,mon=s1-ws,ga=mon-2;
  return {jt,bp,ga};
}
const bigJT=()=>Y()>=2021;
const YEV={
  jt:{ic:'✊🏾',n:'Juneteenth',at:'peoples',hrs:[660,1080],
    morn:()=>bigJT()?'✊🏾 Juneteenth: the celebration at People’s Park runs 11 AM to 6 PM today. A celebration walk, food trucks down the block, braiders, an open mic, and the elders’ table where the story gets told.':'✊🏾 Juneteenth: a picnic in People’s Park today, 11 AM to 6 PM. The churches bring the grills and the folding tables, and somebody always reads the story of June 19, 1865, out loud.',
    l:()=>bigJT()?'Go to the Juneteenth celebration':'Go to the Juneteenth picnic in the park',mins:120,
    txt:()=>bigJT()?['✊🏾 The walk comes up MLK with drums in front, and the park fills behind it: a line for the brisket, a line for the braiders, kids on the bouncy castle, and an elder at the open mic who tells how her grandmother heard the news in Galveston two years late. The whole park goes quiet for her.','✊🏾 Red, black and green on every table. You eat too much, clap for a teenage poet who is very nervous and very good, and buy a T-shirt from a booth run by a Hilltop High club.']
      :['✊🏾 Folding tables under the trees, a grill going since dawn, and Deacon Harris reading General Order No. 3 out loud while the little kids sit on the grass. Then the sweet potato pie comes out and everybody gets loud again.','✊🏾 A picnic, a dominoes table that gets serious, and the church ladies telling you whose grandbaby you look like. Somebody’s uncle tells how Juneteenth came up north with the families who came to work the shipyards.'],
    fx:{min:120,e:-6,mo:8,fam:3,com:4},moment:'✊🏾 Juneteenth in People’s Park.'},
  bp:{ic:'🎉',n:'The block party',at:'home',hrs:[960,1260],
    morn:()=>'🎉 Block party on your street tonight, 4 to 9 PM: sawhorses at the corner, a grill on every other porch, and a speaker that has been negotiated for weeks.',
    l:()=>'Go to the block party on your street',mins:120,
    txt:()=>['🎉 Chalk all over the street, a water balloon war, three grills and a folding table of potato salad you are not allowed to rank out loud. The streetlights come on and nobody goes home.','🎉 An uncle runs the music, a grandma runs the raffle, and the kids run everything else. You meet the people in the green house finally, after a year of waving.'],
    fx:{min:120,e:-5,mo:8,fam:2,com:5},moment:'🎉 The block party on your street.'},
  ga:{ic:'🎒',n:'The back-to-school giveaway',at:'peoples',hrs:[600,840],
    morn:()=>grow()?'🎒 The back-to-school giveaway is at People’s today, 10 AM to 2 PM: free backpacks, supplies, haircuts and shoes for every kid on the hill.':'🎒 The back-to-school giveaway is at People’s today, 10 AM to 2 PM. They always need grown-ups to hand out backpacks.',
    l:()=>grow()?'The back-to-school giveaway':'Help hand out backpacks at the giveaway',mins:()=>grow()?40:120,
    txt:()=>grow()?['🎒 A new backpack, a stack of notebooks, pencils, and a free haircut from a barber set up under a canopy. Nia gets a pink one and wears it to bed.','🎒 The line goes around the gym, and it moves fast. A volunteer hands you a backpack in your school colors and a calculator that is somehow even nicer than the one you had.']
      :['🎒 Four hours of backpacks: by size, by grade, by color, then by whatever the kid in front of you wants. A first grader hugs your leg and runs off before you can say anything.','🎒 You run the pencil table. You never knew there were so many kinds of pencil. A mom thanks you three times; her son thanks you once, very seriously.'],
    fx:()=>grow()?{min:40,mo:6,fam:2,com:2}:{min:120,e:-8,mo:6,com:5},moment:()=>grow()?'🎒 The back-to-school giveaway at People’s.':'🎒 Handed out backpacks at the back-to-school giveaway.'},
};
const yevFx=E=>typeof E.fx==='function'?E.fx():E.fx;
function yevToday(d=day()){const y=dateOf(d).y,D=yDays(y);return Object.keys(YEV).filter(k=>D[k]===d&&!(k==='ga'&&grow()&&typeof gCh1==='function'&&gCh1(d)))}
function yevActs(a){
  if(!long())return;const c=CB(),d=day(),y=dateOf(d).y;
  for(const k of yevToday(d)){const E=YEV[k];if(S.loc!==E.at)continue;const key=k+y;if(c.yr[key])continue;
    const fx=yevFx(E),ok=at(E.hrs[0],E.hrs[1])&&curfewOk(fx.min);
    a.push({ic:E.ic,l:E.l(),cat:grow()?'fun':'people',cls:ok?'primary':'',dis:!ok,s:ok?fxTxt(fx):`${fmt(E.hrs[0])} to ${fmt(E.hrs[1])} today.`,
      fn:()=>{c.yr[key]=day()+1;pass(fx.min);if(fx.e)adj('energy',fx.e);feel(fx.mo);fam(fx.fam);com(fx.com);say(pick(E.txt()));
        const mm=typeof E.moment==='function'?E.moment():E.moment;if(!S.life.moments.some(x=>x.t===mm.replace(/^\S+\s/,'')))lifeMoment(mm.split(' ')[0],mm.replace(/^\S+\s/,''))}});
  }
}
{const lm=lifeMorning;lifeMorning=function(d){const r=lm.apply(this,arguments);try{cbMorning(d)}catch(e){console.error(e)}return r}}
function cbMorning(d){
  if(!long())return;const c=CB();
  if(kidOn()&&sat(d)&&notCh1(d)&&!(typeof gSat==='function'&&d===gSat())&&!c.allow[d]){const v=allowAmt();c.allow[d]=true;gEarn(v);
    sayM(`💵 Saturday: allowance day. ${pick(['Dad leaves it on the counter under the salt shaker','Mom hands it over with a look that says “save some”','It’s on the kitchen table, in an envelope with your name on it'])}: <b>${$(pay$(v))}</b>.`)}
  for(const k of yevToday(d)){const E=YEV[k];if(!c.yr[k+dateOf(d).y])sayM(E.morn())}
  if(c.bikeGone>=0&&d>=c.bikeGone+(grow()?3:1)){c.bikeGone=-1;sayM('🚲 Your bike is back, leaning on the steps with the seat a little lower than you left it. A note in kid handwriting: “sorry. it’s a good bike.”')}
}

// ================= COMMUNITY: events (both modes) =================
// one of these a day at most; each rolls from the save's own salt (forced events skip the roll, for tests and chains)
const CEV=[];
function cev(e){CEV.push(e.id);const c0=e.cond,ch=e.p;
  defEvent(Object.assign({cooldown:30,max:3},e,{chance:1,
    cond:ctx=>{if(!long())return false;const forced=S.ev.force.includes(e.id);
      if(!forced&&CB().evDay===day())return false;
      if(c0&&!c0(ctx))return false;
      if(forced)return true;
      const p=typeof ch==='function'?ch(ctx):ch;return roll(`${e.id}|${day()}|${ctx.at||''}|${ctx.hook||''}`)<p},
    run:ctx=>{CB().evDay=day();return e.run(ctx)}}));
}
const onHill=k=>!hoodK(k);
const outdoorsOk=()=>{const w=wx();return !['rain','snow','wind','smoke'].includes(w)};
const clear=()=>{const w=wx();return w==null||['sun','breaks','spring1'].includes(w)};

// ---- Tacoma moments: Stop and watch ----
cev({id:'cb_mountain',hook:'arrive',tile:['🏔️','The mountain from the overlook','good'],p:0.35,cooldown:14,max:4,cond:c=>c.at==='view'&&S.loc==='view'&&clear()&&at(420,1260),
  run:()=>say('🏔️ The mountain is out, and from the overlook it’s all of it: Rainier floating over the port cranes, white on top, blue underneath, close enough to touch and sixty miles away.'),
  choices:()=>watch(10,6,'🏔️ You stand there until it starts to feel like the mountain is looking back. A man with a dog stops beside you. “Never gets old,” he says, and it doesn’t.'),dflt:1});
// the Tacoma Aroma: the pulp mill and the smelter smoke on the tideflats; strong before the smokestack came down in 1993, fading after
const aromaP=()=>{const y=Y();return y<1986?0.22:y<1993?0.16:y<2010?0.08:0.03};
cev({id:'cb_aroma',hook:'arrive',tile:['🏭','The Tacoma Aroma','info'],p:()=>aromaP(),cooldown:20,max:3,cond:c=>['view','mlk','home','peoples','dt_dome','dt_pacific','ea_port','ea_portland'].includes(c.at)&&S.loc===c.at&&outdoorsOk(),
  run:()=>{const y=Y();say(y<1986?'🏭 The wind turns and here it comes up the hill: the Tacoma Aroma, the pulp mill on the tideflats and the smelter smoke from Ruston, sulfur and wet cardboard. Everybody who grew up here says “that’s the smell of money.”'
    :y<1993?'🏭 The Tacoma Aroma drifts up from the tideflats on a still afternoon: the pulp mill doing what it does. The smelter is closed now, so it’s only half as bad as people say. It’s still pretty bad.'
    :y<2010?'🏭 A whiff of the old Tacoma Aroma comes up from the tideflats, fainter than it used to be. The grown-ups say you should have smelled it before the smokestack came down.'
    :'🏭 For a second, on a still morning, a faint sulfur smell from the tideflats: the last of the Tacoma Aroma. The old-timers on the bench say it used to knock you over. Now it barely says hello.')},
  choices:()=>watch(5,2,'🏭 You stop and breathe it in anyway, a little bit of old Tacoma. It’s gone by the next corner.'),dflt:1});
cev({id:'cb_narrows',hook:'arrive',tile:['🌉','The Narrows bridge','good'],p:0.35,cooldown:14,max:3,cond:c=>['we_view','pr_north'].includes(c.at)&&S.loc===c.at&&outdoorsOk(),
  run:()=>say(era('narrows2')?'🌉 The two Narrows bridges hang over the water side by side, green and gray, trucks humming across and a tugboat the size of a bath toy pushing a barge underneath.':'🌉 The Narrows bridge hangs over the water, long and green, trucks humming across and a tugboat the size of a bath toy pushing a barge underneath. The first one fell in 1940. This one has held since 1950.'),
  choices:()=>watch(15,6,'🌉 You watch the light change on the cables until the bridge lights come on one by one. A jogger stops beside you to catch her breath and stays for the whole show.'),dflt:1});
cev({id:'cb_dome',hook:'arrive',tile:['🏟️','The Dome at sunset','good'],p:0.3,cooldown:14,max:3,cond:c=>['dt_dome','view'].includes(c.at)&&S.loc===c.at&&era('dome')&&outdoorsOk()&&at(1020,1290),
  run:()=>say('🏟️ The sun drops behind you and the Tacoma Dome’s wooden roof goes gold, then copper, then blue, like a giant turtle shell parked by the freeway.'),
  choices:()=>watch(10,5,'🏟️ You watch until the parking lot lights come on around it. Everybody in Tacoma has been inside it at least once. From out here it looks like it belongs to all of them.'),dflt:1});
cev({id:'cb_zoo',hook:'arrive',tile:['🐺','The red wolves','good'],p:0.35,cooldown:14,max:3,cond:c=>['ru_zoo','ru_park'].includes(c.at)&&S.loc===c.at,
  run:()=>say('🐺 From the zoo at Point Defiance, the red wolves start to howl: one, then three, then the whole pack, high and strange through the firs. Point Defiance has been helping save them for decades.'),
  choices:()=>watch(10,6,'🐺 You stand very still and listen until the last one stops. A little kid next to you howls back. One of the wolves answers him. He will never get over it.'),dflt:1});

// ---- the bike, ridden somewhere and left without a lock ----
cev({id:'cb_bike_borrowed',hook:'arrive',tile:['🚲','Where’s your bike?','bad'],p:0.08,cooldown:20,max:3,cond:c=>RIDING&&bikeOwn()&&!hasLock()&&c.at!=='home'&&S.cb.bikeGone<0,
  run:()=>{CB().bikeGone=day();if(grow()&&typeof setEventFlag==='function')setEventFlag('lev_g_bike_back',day());
    say('🚲 You come back out and the spot where you leaned your bike is empty. Somebody “borrowed” it. A lock would have kept it there.')},
  choices:()=>[opt('🔎','Look around the block',{min:20,e:-4,mo:-2},'🔎 Up the block and back. No bike. A grown-up on a porch says she saw a kid ride off on it “like he had somewhere to be.”'),
    opt('📣','Tell the people nearby',{min:10,com:1},'📣 You tell the folks on the corner what it looks like. Everybody says the same thing: bikes on this hill tend to come home.'),
    skip('Walk home','🚶 You walk home. It’s a long walk when you were planning to ride it.')],dflt:2});

// ---- local heroes: four people, four steps each ----
const HERO_AT={barber:['mlk'],coach:['peoples'],librarian:()=>grow()?['library']:['mlk','peoples'],auntie:['home']};
const heroN=k=>({barber:'Dre',coach:'Coach Tasha',librarian:grow()?'Ms. Okafor':'Bev',auntie:grow()?'Auntie Gloria':'Ms. Lorraine'})[k];
const HERO_TILE={barber:'Dre at the barbershop',coach:'Coach Tasha',librarian:'The librarian',auntie:'The auntie down the block'};
const HEROES={
  barber:{ic:'💈',role:'the barber on MLK',steps:[
    {t:n=>`💈 ${n} waves you into the shop between customers. “Free line-up. ${grow()?'Picture day is coming':'You’ve got that interview coming'}, and you are not walking into it looking like that.”`,
     o:n=>[opt('💈','Sit in the chair',{min:20,mo:5,com:2},`💈 ${n} talks the whole time: the Seahawks, the weather and a long story about this shop in 1994. You walk out sharp. The whole shop says so.`),skip('Thanks, maybe next week',`💈 “Door’s open,” ${n} says.`)]},
    {t:n=>`💈 ${n} is sweeping up alone on a busy Saturday. “You want to make a few dollars? Broom’s right there.”`,
     o:n=>[opt('🧹','Sweep up and listen',{min:60,e:-5,earn:10,com:2},`🧹 An hour of sweeping, and ${n} tells you about every photo on the wall: who they were, where they went, which ones came back to Hilltop. He pays you in cash and a fist bump.`),skip('Not today',`💈 ${n} nods and keeps sweeping.`)]},
    {t:n=>`💈 It’s the shop’s anniversary, and ${n} is hanging old photos of the hill on the back wall. He needs somebody who can tell straight from crooked.`,
     o:n=>[opt('🖼️','Help him hang the photos',{min:45,mo:6,com:3},`🖼️ K Street in the old days, the shop’s first chair, a parade on MLK. You find a photo of the building your family lives in now. ${n} lets you pick where it goes.`),skip('Wave and keep going',`💈 ${n} holds up a frame and shouts “Is this straight?” It isn’t.`)]},
    {t:n=>`💈 ${n} waves you in. “Big day coming up, I hear. This one’s on the house. And your picture goes on the wall.”`,
     o:n=>[opt('📸','Sit in the chair, then take the picture',{min:40,mo:10,fam:2,com:4},`📸 The best cut of your life, and a Polaroid of you in the chair, grinning. It goes up on the wall between a city council member and a kid who made the NBA. ${n} says you’re in good company. He means you.`),opt('✂️','Just the cut, no picture',{min:30,mo:6,com:2},`✂️ ${n} shrugs. “Your picture goes up someday anyway. I’m patient.” The cut is perfect.`)]},
  ]},
  coach:{ic:'🏀',role:'the coach at People’s',steps:[
    {t:n=>`🏀 ${n} is setting up cones on the court at People’s. “Summer league starts Monday. Free. We need players, and we need people who show up. Which one are you?”`,
     o:n=>[opt('🏀','Sign up and run the drill',{min:45,e:-8,mo:5,com:3},`🏀 You run the drill twice and miss most of your shots. ${n} only cares that you sprinted back on defense. “That,” she says. “Do that.”`),skip('Just watch today',`🏀 ${n} points at you. “Next time.”`)]},
    {t:n=>`🏀 The little kids’ group is short a helper. ${n} hands you a whistle. “Six-year-olds. Keep them alive and keep them dribbling.”`,
     o:n=>[opt('📣','Help with the little kids',{min:60,e:-6,mo:6,com:4},`📣 A dozen six-year-olds, one ball each, and a kid named Junior who dribbles with his face. By the end he makes a layup and runs around the gym screaming. You scream too.`),skip('Not today',`🏀 ${n} hands the whistle to somebody else. “You’ll be back.”`)]},
    {t:n=>`🏀 The league needs new balls and jerseys, so ${n} is running a car wash fundraiser in the People’s lot this Saturday.`,
     o:n=>[opt('🧽','Hold the sign and wash cars',{min:90,e:-8,mo:5,com:5},`🧽 You hold the CAR WASH sign on MLK and dance with it, which works better than holding it. Forty-one cars. ${n} counts the money twice and says the jerseys are going to be beautiful.`),opt('💵','Drop a few dollars in the bucket',{cost:5,com:2},`💵 You drop it in the bucket. ${n} writes your name on the donor poster in very big letters.`),skip('Keep going','🧽 Somebody’s car alarm goes off from the hose. Everybody laughs.')]},
    {t:n=>`🏀 ${n} catches you after a game. “I wrote you a letter. A reference. Anybody who wants to know if you show up, they can read this.”`,
     o:n=>[opt('📄','Read it, and say thank you',{min:15,mo:10,fam:2,com:4},`📄 One page, typed, signed with a pen that skipped. “Shows up. Helps the little ones without being asked. Sprints back on defense.” You keep it in a folder for years.`),opt('🏀','Say thanks with one more game',{min:45,e:-6,mo:6,com:2},`🏀 You say thank you the best way you know: one more game, and you sprint back on defense every single time. ${n} notices.`)]},
  ]},
  librarian:{ic:'📚',role:()=>grow()?'the librarian at the Reading Room':'the retired school librarian',steps:[
    {t:n=>`📚 ${n} has a book on the counter with your name on a sticky note. “You liked the last one. You’ll like this one more.”`,
     o:n=>[opt('📖','Take it and start it right there',{min:30,mo:5,com:1},`📖 Chapter one, standing up. Chapter two, sitting down. ${n} pretends not to notice you’re still there at chapter four.`),skip('Take it home for later',`📚 ${n} says “No rush. But hurry.”`)]},
    {t:n=>`📚 The summer reading challenge is on: a paper chain across the wall, one link for every book. ${n} wants the hill to beat last year’s.`,
     o:n=>[opt('🔗','Sign up and add your first link',{min:20,mo:4,com:2},`🔗 Your link is green and says your name and the title. By August the chain goes out the door and down the block. ${n} takes a picture of it every week.`),skip('Not this summer','📚 The chain grows without you. It is a very long chain.')]},
    {t:n=>`📚 Story time needs a reader. ${n} holds up a picture book about a bus that can fly. “You have a good voice. Twenty minutes. They’re small, they won’t bite. Mostly.”`,
     o:n=>[opt('🎙️','Read to the little kids',{min:30,mo:6,com:4},`🎙️ You do the voices. All of them. The bus voice gets a standing ovation from eleven four-year-olds. ${n} says you’re booked for next month.`),skip('Too nervous today',`📚 ${n} reads it instead, with the voices. She’s good. You’ll be good too.`)]},
    {t:n=>grow()?`📚 ${n} catches you by the computers. “Scholarship applications open this month. Bring me your essay. I’ve read a few of these.”`:`📚 ${n} catches you on MLK. “The job you wanted: let me read your application before you send it. I’ve read a few of these.”`,
     o:n=>[opt('📝','Go over it together',{min:45,mo:8,fam:2,com:3},`📝 ${n} reads it twice with a red pen, crosses out half, and draws a star by one sentence. “That one is you. Write more like that.” You do. It’s better. It’s much better.`),skip('Send it the way it is',`📚 ${n} says “Brave,” in a way that means two things.`)]},
  ]},
  auntie:{ic:'🍲',role:'the auntie down the block',steps:[
    {t:n=>`🍲 ${n} is on her porch with a covered dish. “${grow()?'Your mama’s working late':'You look like you’ve been working late'}. That’s greens and cornbread. Bring the dish back clean.”`,
     o:n=>[opt('🍲','Say thank you and take it home',{min:10,e:8,fam:3},(grow()?`🍲 It is the best cornbread anyone in your house has ever eaten, and Mom calls ${n} to say so. They talk for an hour.`:`🍲 It is the best cornbread you have ever eaten. You call your mom to tell her about it, and she wants the recipe.`)),opt('🧽','Take it, and bring the dish back washed with a note',{min:20,e:8,fam:2,com:3},`🧽 You bring the dish back the next day, washed, with a thank-you note. ${n} sticks the note on her fridge, next to forty years of other notes.`)]},
    {t:n=>`🛒 ${n} is at the bottom of her steps with four bags of groceries and a look at the stairs.`,
     o:n=>[opt('🛍️','Carry them up for her',{min:15,e:-3,mo:4,com:3},`🛍️ Four bags, eleven steps, and a lecture about posture on the way. She sends you home with a peppermint and a dollar you try not to take.`),skip('Wave and keep going',`🛒 A neighbor’s kid gets the bags. ${n} waves you on. “Next time, baby.”`)]},
    {t:n=>`🥧 ${n} is making sweet potato pies for the church and needs another pair of hands. “I’ll show you how. Nobody writes it down. You just remember.”`,
     o:n=>[opt('🥧','Learn the pie',{min:90,e:-4,mo:7,fam:3,com:2},`🥧 Nutmeg, not too much. Butter, more than you think. The crust is a feeling, she says. You take a pie home and ${grow()?'Dad eats':'you eat'} a quarter of it standing up.`),skip('Not today',`🥧 ${n} says the pie can wait. The pie cannot wait. She makes it anyway.`)]},
    {t:n=>`🎂 ${n} turns eighty today, and the whole block is on her porch with a sheet cake and folding chairs. Somebody says you should say a few words.`,
     o:n=>[opt('🎤','Give a toast',{min:60,mo:10,fam:3,com:6},`🎤 You tell the story about the cornbread. Everybody laughs, then ${n} cries a little, then everybody cries a little. She says you’re one of hers now. On this block, that’s official.`),opt('🎂','Just be there and sing',{min:45,mo:6,com:3},`🎂 You sing loud and badly with everybody else. ${n} blows out all eighty candles in two tries and claims it was one.`)]},
  ]},
};
const heroAt=k=>{const a=HERO_AT[k];return typeof a==='function'?a():a};
for(const k of Object.keys(HEROES)){const H=HEROES[k];
  cev({id:'cb_hero_'+k,hook:'arrive',tile:[H.ic,HERO_TILE[k],'good'],p:0.3,cooldown:0,max:4,
    cond:c=>{const C=CB(),st=C.hero[k]||0;if(st>=4||!heroAt(k).includes(c.at)||S.loc!==c.at)return false;if(S.ev.force.includes('cb_hero_'+k))return true;
      const last=C.heroLast[k];if(last!=null&&day()-last<10)return false;if(c.at==='home'&&grow()&&!at(600,1200))return false;return at(540,1260)&&!(grow()&&isSchoolDay()&&tod()<925)},
    run:()=>{const C=CB(),st=C.hero[k]||0;C.heroStep=C.heroStep||{};C.heroStep[k]=st;C.hero[k]=st+1;C.heroLast[k]=day();say(H.steps[st].t(heroN(k)));
      if(st===3)lifeMoment(H.ic,`${heroN(k)}, ${typeof H.role==='function'?H.role():H.role}, became one of your people.`)},
    choices:()=>{const C=CB(),st=C.heroStep&&C.heroStep[k]!=null?C.heroStep[k]:Math.max(0,(C.hero[k]||1)-1);return HEROES[k].steps[Math.min(3,st)].o(heroN(k))},
    dflt:()=>{const C=CB(),st=C.heroStep&&C.heroStep[k]!=null?C.heroStep[k]:0;return HEROES[k].steps[Math.min(3,st)].o('x').length-1}});
}

// ---- everyday community events: drawn from the kind of things that happen on any block; every name and detail is invented ----
const COMM=[
  {id:'cb_moving',at:['home'],ic:'📦',n:'Moving day on the block',p:0.12,
   t:()=>'📦 A rental truck is double-parked on your street and a family is staring at a couch, a staircase and each other.',
   o:()=>[opt('💪','Grab a corner of the couch',{min:45,e:-8,mo:4,com:4},'💪 Three flights, one stuck doorway and a lot of “pivot.” The new family’s grandmother feeds everybody who helped. You know their names now: the Tran family, from Federal Way.'),
     opt('🧃','Bring them cold drinks',{min:10,cost:3,mo:2,com:2},'🧃 You bring a six-pack of cold drinks from the corner market. The dad drinks two in a row and says this street is all right.'),skip('Wave and keep going','📦 You wave. They wave back, still holding the couch.')]},
  {id:'cb_meals',at:['home','mlk'],ic:'🍼',n:'A new baby on the block',p:0.1,
   t:()=>'🍼 There’s a sign-up sheet taped to the mailbox: the couple in the yellow house had a baby, and the block is bringing them dinners for two weeks.',
   o:()=>[opt('🍲','Sign up to bring a dinner',{min:60,cost:8,fam:2,com:4},'🍲 You bring spaghetti in a dish you will never see again. The new dad answers the door looking like he hasn’t slept since Tuesday and says it’s the nicest thing that happened all week.'),
     opt('✍️','Sign the card instead',{min:5,com:1},'✍️ You sign the card on the mailbox: “Welcome to the block, little one.”'),skip('Keep going','🍼 The sheet fills up without you by Thursday. The block is good like that.')]},
  {id:'cb_pancakes',at:['mlk','peoples'],ic:'🥞',n:'A pancake breakfast fundraiser',p:0.12,cond:()=>sat()&&at(450,690),
   t:()=>'🥞 The church hall on MLK has its doors open and a hand-painted sign: PANCAKE BREAKFAST, $5, FOR THE YOUTH LEAGUE UNIFORMS.',
   o:()=>[opt('🥞','Buy a plate',{min:40,cost:5,e:10,mo:4,com:2},'🥞 A stack of three, a sausage, a paper cup of orange juice, and a deacon flipping pancakes like he trained for it. Your plate goes in the “uniforms” jar.'),
     opt('🧑‍🍳','Help serve for an hour',{min:60,e:-5,mo:5,com:4},'🧑‍🍳 You pour coffee and juice for an hour and learn that everybody on Hilltop wants their pancakes “just a little darker.” They raise enough for every jersey.'),skip('Keep going','🥞 It smells amazing all the way down the block.')]},
  {id:'cb_crosswalk',at:['mlk','home','peoples'],ic:'🚸',n:'A petition for a crosswalk',p:0.1,
   t:()=>'🚸 A neighbor with a clipboard is going door to door: a petition for a painted crosswalk and a flashing light by the school, where the cars come too fast.',
   o:()=>[opt('✍️','Sign it and take a page to your neighbors',{min:40,e:-3,mo:3,com:4},'✍️ You knock on six doors and get eleven names. Three months later there are white stripes on the street and a light that blinks yellow. You look at it every time you cross.'),
     opt('🖊️','Sign it',{min:5,com:1},'🖊️ You sign. She says she needs four hundred names. She has two hundred and twelve, now two hundred and thirteen.'),skip('Not today','🚸 She moves on to the next porch.')]},
  {id:'cb_welcome',at:['home'],ic:'🎗️',n:'Welcome home',p:0.08,
   t:()=>'🎗️ The family two doors down is chalking the sidewalk: their oldest is coming home tonight from a deployment out of Joint Base Lewis-McChord, after nine months.',
   o:()=>[opt('🖍️','Help chalk the welcome',{min:30,mo:6,com:4},'🖍️ WELCOME HOME in letters three squares tall, stars, a flag, and the mountain in blue chalk. When the car pulls up the whole block claps. You do not cry. You do a little.'),
     opt('🎈','Tie a balloon on their fence',{min:5,cost:2,com:2},'🎈 A blue balloon on the fence with the others. It bobs all evening.'),skip('Keep going','🎗️ You hear the cheering from down the street when the car pulls in.')]},
  {id:'cb_cleanup',at:['home','mlk','peoples','view'],ic:'🧤',n:'Saturday cleanup',p:0.12,cond:()=>sat()&&at(540,840)&&outdoorsOk(),
   t:()=>'🧤 The block club’s cleanup crew is out in orange vests with grabbers and bags, working their way down to the overlook.',
   o:()=>[opt('🧤','Grab a vest and a grabber',{min:60,e:-6,mo:5,com:4},'🧤 Two bags of trash, one shopping cart returned, a lost glove hung on a fence for its owner, and a crew picture at the overlook with everybody holding a grabber like a trophy.'),
     opt('🗑️','Pick up your own block',{min:20,e:-2,mo:3,com:2},'🗑️ You clear your own sidewalk and the gutter in front. The crew gives you a thumbs-up on the way by.'),skip('Keep going','🧤 The crew waves. “Next month!”')]},
  {id:'cb_porch',at:['home','view'],ic:'🎶',n:'Music on a porch',p:0.12,cond:()=>at(1020,1260)&&outdoorsOk(),
   t:()=>'🎶 Three old friends on a porch with a guitar, a harmonica and a bucket for a drum are working through every song they know. A few neighbors have pulled up lawn chairs.',
   o:()=>[opt('🪑','Pull up a chair',{min:45,mo:7,com:3},'🪑 Old soul, a gospel song, a blues song played very slowly. The man with the harmonica says he learned it from his father, on this same porch. Everybody knows the last song.'),
     opt('👏','Listen for one song',{min:5,mo:2},'👏 One song from the sidewalk. You clap. They bow from their chairs.'),skip('Keep going','🎶 It follows you all the way down the block.')]},
];
for(const E of COMM){const c0=E.cond;
  cev({id:E.id,hook:'arrive',tile:[E.ic,E.n,'good'],p:E.p,cooldown:45,max:2,cond:c=>E.at.includes(c.at)&&S.loc===c.at&&at(480,1290)&&(!c0||c0())&&(!grow()||S.loc==='home'||tod()<gCurfew()-45),
    run:()=>say(E.t()),choices:()=>E.o(),dflt:2});
}

// ================= ADULTS: a garden plot, the Saturday community lunch, mentoring =================
const adultOn=()=>long()&&!grow()&&age()>=18;
const PLOT_FEE=25;
function adultActs(a){
  if(!adultOn())return;const c=CB(),d=day(),m=mon();
  if(S.loc==='peoples'){
    if(!c.plot){const f=rp(PLOT_FEE),ok=m>=2&&m<=9;
      a.push({ic:'🌱',l:`Sign up for a plot in the community garden — ${$(f)} a year`,s:ok?'Behind People’s: a raised bed of your own, a shared shed, a hose that works most days. Tend it once a day.':'Plots open in February and close in September.',cat:'people',dis:!ok||!canAfford(f),
        fn:()=>{spend(f);c.plot={since:d,tend:{},harv:{},n:0,paidY:dateOf(d).y};pass(20);adj('community',2);lifeMoment('🌱','A plot in the community garden behind People’s.');
          say('🌱 Bed 14: four feet by eight, last year’s tomato cages still in it, and a neighbor in the next bed, Mr. Odom, who has opinions about kale. The garden coordinator hands you a key to the shed on a shoelace.')}})}
    else{const tended=!!c.plot.tend[d],grow1=m>=3&&m<=10,harvest=m>=7&&m<=10,wk=Math.floor(d/7),hv=harvest&&!c.plot.harv[wk];
      a.push({ic:hv?'🍅':'🌱',l:hv?'Harvest your garden plot':'Tend your garden plot',cat:'people',dis:tended||!grow1||!at(420,1260),
        s:tended?'Done for today.':!grow1?'The garden rests from November to February.':!at(420,1260)?'The garden is open 7 AM to 9 PM.':hv?`30 min. ${cap(calmTxt(6))}, 2 meals for the fridge. Once a week.`:`30 min. ${cap(calmTxt(6))}, community +1. Once a day.`,
        fn:()=>{c.plot.tend[d]=true;c.plot.n++;pass(30);calm(6);if(hv){c.plot.harv[wk]=true;S.food+=2;if(!c.moments.harvest){c.moments.harvest=true;lifeMoment('🍅','The first harvest from your garden plot.')}
          say(pick(['🍅 Tomatoes, a fistful of beans, a zucchini that got away from you. Mr. Odom says yours are “not bad.” From him that’s a medal. Two meals in the fridge.','🍅 A bag of greens and the first real tomato of the summer, eaten right there, warm from the sun. Two meals in the fridge.']))}
          else{adj('community',1);say(pick(['🌱 Weeds out, water in, and a long talk over the fence with Mr. Odom about slugs. The garden is the quietest place on the hill.','🌱 You tie up the tomatoes and thin the carrots. A kid from the youth program asks what everything is. You know most of it now.','🌱 The hose works today. You water your bed and the empty one next to it, just because.']))}}})}
    // mentoring: 21 and up, through the youth program at People's (a background check: a record that isn't cleared keeps you out)
    const rec=typeof crimeHasRecord==='function'&&crimeHasRecord()&&!(typeof crimeSealed==='function'&&crimeSealed());
    if(age()>=21&&!c.mentor)a.push({ic:'🧑‍🏫',l:'Sign up to mentor a kid in the youth program',s:rec?'The youth program needs a clean background check.':S.community<25?'They want people the neighborhood knows: community 25 and up.':'20 min, a background check and an interview. Then Tuesdays and Thursdays, 4 to 6 PM.',cat:'people',dis:rec||S.community<25||!at(540,1140),
      fn:()=>{c.mentor={since:d,n:0,last:-1};pass(20);adj('community',2);lifeMoment('🧑‍🏫','Signed up to mentor a kid in the youth program at People’s.');
        say('🧑‍🏫 The program director matches you with <b>Kendrick</b>, a seventh grader at Summit View who draws in the margins of everything and says “I’m fine” about everything. You’ll meet Tuesdays and Thursdays after school.')}});
    else if(c.mentor){const w=d%7,ok=(w===1||w===3)&&at(960,1080)&&c.mentor.last!==d;
      a.push({ic:'🧑‍🏫',l:`Meet with Kendrick (${c.mentor.n} so far)`,s:ok?`An hour. Homework, a walk, or the courts. ${cap(calmTxt(4))}, community +2.`:c.mentor.last===d?'Done for today.':'Tuesdays and Thursdays, 4 to 6 PM.',cat:'people',dis:!ok,fn:()=>mentorMeet()});}
  }
  if(S.loc==='mlk'){
    const ok=sat()&&at(660,810)&&c.volDay!==d;
    if(sat())a.push({ic:'🍲',l:'Serve the Saturday community lunch at the church hall',s:c.volDay===d?'Done for today.':ok?'2 hours. Energy −8, community +4, stress −5.':'Saturdays, 11 AM to 1:30 PM.',cat:'people',dis:!ok,
      fn:()=>{c.volDay=d;c.vol++;pass(120);adj('energy',-8);adj('community',4);adj('stress',-5);
        if(c.vol===1)lifeMoment('🍲','Started volunteering at the Saturday community lunch.');if(c.vol===10)lifeMoment('🍲','Ten Saturdays serving the community lunch.');
        say(pick(['🍲 Two hundred plates of chicken and rice, a line out the door, and a crew of church volunteers who have done this every Saturday since before you were born. They put you on rolls. You are excellent at rolls.','🍲 You wipe tables and refill water and learn everybody’s name by the second hour. A man in a Navy cap tells you this is the best meal of his week. It’s a good meal.','🍲 The kitchen runs out of cornbread at 12:40 and the head cook makes more in fifteen minutes flat. You will remember that forever.']))}});
  }
}
const KENDRICK=['🧑‍🏫 Kendrick says “I’m fine” four times, then shows you his sketchbook: a whole comic about a cat who drives the T Line. It is very good. You tell him so.',
  '🧑‍🏫 Math homework at a table in the gym. Fractions. He gets it on the third try and pretends he got it on the first. You let him.',
  '🧑‍🏫 A walk to the overlook. He asks what your job is actually like. You tell him the truth, including the boring parts. He says the boring parts sound “kind of okay.”',
  '🧑‍🏫 He made the honor roll. He hands you the paper folded into a square, like it’s no big deal. It’s a big deal.',
  '🧑‍🏫 HORSE on the courts. He wins. He will tell everyone at Summit View.',
  '🧑‍🏫 He asks for help with a job application for the summer rec program. You go over it together. He gets the job.'];
function mentorMeet(){const c=CB(),M=c.mentor;M.last=day();pass(60);calm(4);adj('community',2);
  say(KENDRICK[M.n%KENDRICK.length]);M.n++;
  if(M.n===4)lifeMoment('🧑‍🏫','Kendrick made the honor roll.');if(M.n===20)lifeMoment('🧑‍🏫','Kendrick started at Hilltop High. You were there for the first day.')}

// ---- the actions, in both modes ----
function cbActs(a){try{oddActs(a);bankActs(a);goalActs(a);bikeActs(a);rideActs(a);yevActs(a);adultActs(a)}catch(e){console.error(e)}return a}
{const ah=GROW.actionsHere;GROW.actionsHere=function(){return cbActs(ah.apply(this,arguments))}}
{const ah=actionsHere;actionsHere=function(){const a=ah.apply(this,arguments);if(isGrow()||!S)return a;return cbActs(a)}}
G_CATS.odd='🧰 Odd jobs';

// ---- the night: the first paycheck, a saving goal reached ----
{const on=GROW.onNight;GROW.onNight=function(where,notes,d){const r=on.apply(this,arguments);try{if(long()){paycheckCheck(notes);goalCheck(notes)}}catch(e){console.error(e)}return r}}

// ---- the status bar on the Here tab ----
{const st=GROW.statusTags;GROW.statusTags=function(){const t=st.apply(this,arguments)||[];try{if(long()&&S.cb){const c=S.cb;
  if(c.acct)t.push(`<span class="tag">🏦 savings ${$(c.acct.bal)}</span>`);if(c.goal)t.push(`<span class="tag">🎯 ${Math.min(100,Math.round(saved()/c.goal.price*100))}%</span>`)}}catch(e){}return t}}

// ---- the time skips ----
LIFE_HOOKS.skip.push((from,to,ch,notes)=>{if(!long())return;const c=CB(),wk=Math.max(1,Math.round((to-from+1)/7));
  if(grow()&&age()<18){
    const top=allowAmt()-10;if(top>0){gEarn(top*wk);notes.push(`💵 Allowance at ${age()}: ${$(pay$(allowAmt()))} a week.`)}
    if(c.odd.n>0){const n=Math.max(1,Math.round(wk*(ch==='home'?1.5:1))),p=n*10;gEarn(p);c.odd.n+=n;c.odd.paid=Math.round((c.odd.paid+pay$(p))*100)/100;notes.push(`🧰 ${n} odd job${n===1?'':'s'} on the block (lawns, Biscuit, the Reyes twins): ${$(pay$(p))}.`)}
    if(c.acct&&c.acct.bal>0){const months=Math.max(1,Math.round((to-from+1)/30.4)),i=Math.round(c.acct.bal*0.02/12*months*100)/100;if(i>0){c.acct.bal=Math.round((c.acct.bal+i)*100)/100;c.acct.int=Math.round((c.acct.int+i)*100)/100;notes.push(`🏦 Interest on your savings: ${$(i)}. Savings: ${$(c.acct.bal)}.`)}}
    paycheckCheck(notes);goalCheck(notes);
    if(c.bike&&c.bikeGone<0)notes.push(`🚲 You rode your bike all over the hill${age()>=14?' and down to the Stadium District':''}.`);
  }
  if(!grow()&&age()>=18){
    if(c.plot){const g=dateOf(to).m;const hv=g>=7&&g<=10;c.plot.n+=wk*2;if(hv&&!c.moments.harvest){c.moments.harvest=true;lifeMoment('🍅','The first harvest from your garden plot.')}
      notes.push(hv?'🍅 Your garden plot behind People’s: tomatoes, beans and more zucchini than anyone needs. You gave half of it away.':'🌱 You kept your garden plot behind People’s weeded and watered.');adj('community',1)}
    if(c.mentor){const n=Math.max(1,Math.round(wk*1.5)),was=c.mentor.n;c.mentor.n+=n;notes.push(`🧑‍🏫 ${n} afternoon${n===1?'':'s'} with Kendrick at People’s.`);
      if(was<4&&c.mentor.n>=4)lifeMoment('🧑‍🏫','Kendrick made the honor roll.');if(was<20&&c.mentor.n>=20)lifeMoment('🧑‍🏫','Kendrick started at Hilltop High. You were there for the first day.')}
  }
  // the yearly days the skip went past
  for(let y=dateOf(from).y;y<=dateOf(to).y;y++){const D=yDays(y);
    for(const k of Object.keys(YEV)){const dd=D[k];if(dd<from||dd>to||c.yr[k+y])continue;if(k==='ga'&&grow()&&typeof gCh1==='function'&&gCh1(dd))continue;c.yr[k+y]=to+1;
      notes.push(k==='jt'?(y>=2021?`✊🏾 Juneteenth ${y}: the celebration at People’s Park, the walk up MLK and the elders’ table. You were there.`:`✊🏾 Juneteenth ${y}: the picnic in People’s Park, the grills, and the story read out loud. You were there.`)
        :k==='bp'?`🎉 The block party on your street in July ${y}.`:grow()?`🎒 The back-to-school giveaway at People’s: a new backpack for ${y}.`:`🎒 You helped hand out backpacks at the back-to-school giveaway, ${y}.`);
      com(1)}}
});
// at 18: the savings come with you
{const lh=lifeHandoff;lifeHandoff=function(){try{const c=S.cb;if(c&&c.acct&&c.acct.bal>0){const b=c.acct.bal;c.acct.moved=b;c.acct.bal=0;S.money=Math.round((S.money+b)*100)/100}}catch(e){console.error(e)}return lh.apply(this,arguments)}}

// ---- the Week tab ----
function weekHTML(){
  if(!long())return '';const c=CB(),kv=(k,v)=>`<div class="kv"><span>${k}</span><b style="text-align:right">${v}</b></div>`;let h='';
  if(grow()&&age()<18){
    h+=`<div class="sect">💵 Money and goals</div>`+goalHTML()
      +kv('💵 Allowance',notCh1()?`${$(pay$(allowAmt()))} every Saturday`:'Saturday is allowance day')
      +kv('🏦 Savings',c.acct?`${$(c.acct.bal)}${c.acct.int?` (interest so far ${$(c.acct.int)})`:''}`:'Open an account at the credit union on MLK')
      +kv('🧰 Odd jobs',c.odd.n?`${c.odd.n} done, ${$(c.odd.paid)} earned`:'At home: lawns, leaves, pets, babysitting at 13, snow days')
      +kv('🚲 Bike',c.bike?(c.bikeGone>=0?'borrowed: it’ll come back':`${c.bike.kind==='new'?'new':'used'}${hasLock()?', with a lock':', no lock yet'}`):'The community bike shop on MLK')
      +(!c.goal?`<div class="rules">🎯 No saving goal yet: pick one at home.</div>`:'');
  }
  if(!grow()&&age()>=18){const rows=[];
    if(c.plot)rows.push(kv('🌱 Garden plot',`bed 14 behind People’s, tended ${c.plot.n} time${c.plot.n===1?'':'s'}`));
    if(c.vol)rows.push(kv('🍲 Community lunch',`${c.vol} Saturday${c.vol===1?'':'s'} served`));
    if(c.mentor)rows.push(kv('🧑‍🏫 Mentoring',`Kendrick, ${c.mentor.n} meeting${c.mentor.n===1?'':'s'}`));
    if(c.bike)rows.push(kv('🚲 Bike',c.bikeGone>=0?'borrowed: it’ll come back':'ready to ride'));
    if(rows.length)h+=`<div class="sect">🤝 Your community</div>`+rows.join('');
  }
  const heroes=Object.keys(HEROES).filter(k=>c.hero[k]);
  if(heroes.length)h+=`<div class="sect">🌟 Local heroes</div>`+heroes.map(k=>kv(`${HEROES[k].ic} ${heroN(k)}`,`${typeof HEROES[k].role==='function'?HEROES[k].role():HEROES[k].role} · ${'●'.repeat(c.hero[k])}${'○'.repeat(4-c.hero[k])}`)).join('');
  const d=day(),y=dateOf(d).y,nx=[];for(const yy of [y,y+1]){const D=yDays(yy);for(const k of Object.keys(YEV))if(D[k]>=d)nx.push([D[k],k])}
  nx.sort((a,b)=>a[0]-b[0]);if(nx[0]){const [dd,k]=nx[0];h+=`<div class="rules">${YEV[k].ic} Next on the hill: <b>${k==='jt'?'Juneteenth':YEV[k].n}</b>, ${fullDate(dd)}.</div>`}
  return h;
}
{const wv=GROW.weekView;GROW.weekView=function(){let h=wv.apply(this,arguments);try{h+=weekHTML()}catch(e){console.error(e)}return h}}
{const wv=weekView;weekView=function(){let h=wv.apply(this,arguments);try{h+=weekHTML()}catch(e){console.error(e)}return h}}

// ---- the guide: one chapter, just before the FAQ ----
function guideHTML(){
  return `<p>In the longer games, life on Hilltop is more than school and work. Here is the money, the bike and the neighborhood around you.</p>
    <h3>Money for kids</h3>
    ${hTable(['What','How much','When'],[['💵 Allowance','$10 at 12–13, $15 at 14–15, $20 at 16–17','Every Saturday morning'],
      ['🌱 Mowing a lawn','$15, 1 hour','April to September, on a dry day'],['🍂 Raking leaves','$12, 1 hour','October and November'],['🐕 Pet sitting','$8, 30 min','Any day'],
      ['👶 Babysitting','$30, 2½ hours','13 and up, evenings or weekends'],['❄️ Shoveling snow','$20, 1 hour','Snow days only']])}
    <p>Odd jobs are on the Here tab at home, one a day, and never during school. Amounts are in 2026 dollars: in a game that starts in an earlier year, everything is in that year’s money.</p>
    <h3>Your first bank account</h3>
    <ul><li>🏦 Open <b>a youth savings account</b> at the credit union on MLK (a passbook before 1995). Mom signs as your grown-up, and it takes $5 to start.</li>
    <li>Deposit or take money out there: weekdays 9 AM to 5:30 PM, Saturdays 9 AM to 1 PM. Savings earn a little interest in the time between key weeks, and at 18 they come with you.</li>
    <li>🧾 Your first paycheck, from your first job or a shift at the market, is a moment in your life story. With an account, half of it goes into savings.</li></ul>
    <h3>Saving goals</h3>
    <p>🎯 Pick a goal at home: new shoes, a bike, music or a phone (a Walkman in the 1980s, a Discman in the 1990s), or a first car at 16. The 📅 <b>Week</b> tab tracks your Money plus your savings. When you get there, it’s a moment, and <b>Buy it</b> shows up at home. Car money waits in savings for 18.</p>
    <h3>A bike</h3>
    <ul><li>🚲 Buy a used bike (about $60) or a new one (about $250) at the community bike shop on MLK, Tuesday to Saturday, 10 AM to 6 PM.</li>
    <li>A <b>🚲 Ride</b> chip shows next to Go: about twice as fast as walking on Hilltop, free, and it reaches the Stadium District, Downtown, the Eastside, Proctor and the South End once you’re old enough to go there. Not in rain, snow, wind or wildfire smoke.</li>
    <li>🔒 Lock it. Without a lock, a bike left at a rack can get “borrowed.” It comes back in a day or two. Bikes on this hill tend to come home.</li>
    <li>At home: <b>Ride around the neighborhood</b> once a day.</li></ul>
    <h3>Every year on the hill</h3>
    ${hTable(['When','What'],[['✊🏾 Juneteenth','The Saturday nearest June 19, at People’s Park, 11 AM to 6 PM. A picnic in the park in earlier years; from 2021, when it became a federal holiday, a big celebration with a walk, food trucks and an open mic.'],
      ['🎉 The block party','The third Saturday in July, on your street, 4 to 9 PM.'],['🎒 The back-to-school giveaway','The Saturday before school starts, at People’s, 10 AM to 2 PM. Kids get a free backpack; grown-ups can help hand them out.']])}
    <h3>Tacoma moments and neighbors</h3>
    <ul><li>Small moments you can 👀 Stop and watch: the mountain from the overlook, the Tacoma Aroma (strong in the 1980s, fading every decade since), the Narrows bridge, the Dome at sunset, and the red wolves at the zoo.</li>
    <li>🌟 <b>Local heroes</b>, each with a short story over the years: Dre the barber on MLK, Coach Tasha at People’s, the librarian, and the auntie down the block. The Week tab shows how far along each one is.</li>
    <li>Everyday community moments: moving day on the block, a new baby, a pancake breakfast, a crosswalk petition, a welcome home from a deployment, the Saturday cleanup and music on a porch. They are made up from the kind of things that happen on any block, and real people’s details are always left out.</li></ul>
    <h3>Giving back, as an adult</h3>
    <ul><li>🌱 <b>A community garden plot</b> behind People’s ($25 a year, sign up February to September). Tend it once a day; harvest it once a week from July to October for 2 meals.</li>
    <li>🍲 <b>The Saturday community lunch</b> at the church hall on MLK, 11 AM to 1:30 PM: community +4.</li>
    <li>🧑‍🏫 <b>Mentoring</b> from 21: sign up at People’s (community 25 and up, and a clean background check), then meet your mentee on Tuesdays and Thursdays, 4 to 6 PM.</li></ul>`;
}
{const hc=helpChapters;helpChapters=function(...a){const ch=hc(...a);try{let i=ch.findIndex(c=>c[0]==='faq');if(i<0)i=ch.length;   // just before the FAQ
  ch.splice(i,0,['community','Money, a bike and the neighborhood',guideHTML()])}catch(e){console.error(e)}return ch}}

// ---- tests and debugging ----
window.CB={S:CB,ODD,GOALS,YEV,HEROES,COMM:COMM.map(x=>x.id),events:CEV,yDays,allowAmt,bikeMins,rideOk,saved,goalCheck,goalBuy,deposit,withdraw,weekHTML,guide:guideHTML,roll,BIKE_HOODS,rideGo};
})();
