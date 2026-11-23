// ============================================================
//  TACOMPTON · DRIVING: a license at 16, and a used car in the longer adult games.
//  Growing Up (16+): 🚗 driving lessons with Mom or Dad at home (practice), then the license test at the Department of
//    Licensing office: the pass chance grows with practice. Time skips add a few lessons in the Tacoma Dome lot.
//  The adult game (the longer games only, 18+): 🔑 shop for a used car (three tiers, priced with rp()), then insurance on the
//    1st of every month, gas on every drive, parking downtown and the odd repair. A car adds a 🚗 Drive chip next to Go for
//    the other neighborhoods: faster than the bus or the Link, no fare, but gas (and downtown parking). At home the car
//    lives on the street (the car prowl in 36-life-events.js; its two habits are toggled at home there).
//  Starting at 18 you already have a license from back home; coming up from Growing Up you can pass the test from 16, and at 18
//  (graduation, 73-adult-unlock.js) you have one either way, the same as a game started at 18.
//  State: S.car (made on first use, so older saves just work; it lives outside newState(), so it survives graduation).
// ============================================================
(function(){
const CAR_TIERS={
  civic:{n:'a 2009 Honda Civic',ic:'🚗',price:4000,ins:95,rep:1.6,d:'175,000 miles, a dent in the back door, runs like a sewing machine.'},
  corolla:{n:'a 2016 Toyota Corolla',ic:'🚙',price:7500,ins:110,rep:1,d:'98,000 miles, one owner, new tires.'},
  rav4:{n:'a 2017 Toyota RAV4',ic:'🚙',price:11000,ins:130,rep:0.7,d:'80,000 miles, room for a couch cushion and three friends.'},
};
// the same three cars, as old as they are in 2026, in the year you're shopping (63-era.js yearNow; prices follow rp())
{const Y=()=>typeof yearNow==='function'?yearNow():2026;
  Object.defineProperty(CAR_TIERS.civic,'n',{get(){return `a ${Y()-17} Honda Civic`}});
  Object.defineProperty(CAR_TIERS.corolla,'n',{get(){return `a ${Y()-10} Toyota Corolla`}});
  Object.defineProperty(CAR_TIERS.rav4,'n',{get(){const y=Y()-9;return y>=1996?`a ${y} Toyota RAV4`:`a ${y} Chevy Blazer`}});}
window.CAR_TIERS=CAR_TIERS;
const CS=()=>S.car||(S.car={lic:(S.startAge||18)>=18||!!(S.life&&S.life.graduated),practice:0,tests:0,testDay:-1,lesson:-1,own:null,ins:0,billed:null,down:false,taped:false,trips:0,gas:0});
const owns=()=>!!S&&!!S.car&&!!S.car.own;
const adultOn=()=>!!S&&!isGrow()&&lifeLong()&&(S.age||18)>=18;
const canDrive=()=>adultOn()&&owns()&&!S.car.down;
const ym=d=>{const o=dateOf(d);return o.y*12+o.m-1};
const tier=()=>CAR_TIERS[S.car.own]||CAR_TIERS.civic;
const passOdds=()=>{const p=CS().practice;return Math.min(0.95,(isGrow()?0.2:0.55)+0.15*p)};
const pct=x=>Math.round(x*100)+'%';

// ---- insurance: the 1st of every month (played days and time skips both catch up to the day given) ----
function carBill(d,notes){
  if(!owns()||isGrow())return 0;const C=S.car,now=ym(d);if(C.billed==null){C.billed=now;return 0}
  let n=0;while(C.billed<now){C.billed++;n++}
  if(!n)return 0;const c=C.ins*n;money(-c);if(S.stats)S.stats.spent=(S.stats.spent||0)+c;
  const t=`🚗 Car insurance: ${$(c)}${n>1?` (${n} months)`:''}.`;if(notes)notes.push(t);else{say(t);digestLine(t)}
  return c;
}

// ---- Drive: the other neighborhoods, door to door ----
let DRV=false;
function driveMins(a,b){
  const ha=hoodOf(a),hb=hoodOf(b);if(ha===hb)return null;
  const r=h=>h?HOODS[h].ride.mins:0,base=Math.max(r(ha),r(hb)),park=ha==='downtown'||hb==='downtown'?5:2;
  return Math.max(6,Math.round(base*0.5)+park);
}
const gasFor=(a,b)=>{const ha=hoodOf(a),hb=hoodOf(b),r=h=>h?HOODS[h].ride.mins:0;return rp(Math.max(r(ha),r(hb))>=20?3:2)};
const parkFor=(a,b)=>hoodOf(b)==='downtown'?rp(6):0;
{const tm=travelMins;travelMins=function(a,b){const m=tm(a,b);if(!DRV||isGrow())return m;try{const x=driveMins(a,b);return x==null?m:Math.min(m,x)}catch(e){return m}}}
{const hf=hoodFare;hoodFare=function(a,b){return DRV?0:hf(a,b)}}
{const oa=onArrive;onArrive=function(dest,from){const was=DRV;try{oa(dest,from)}finally{DRV=false}
  if(was&&!isGrow()){const g=gasFor(from,dest),p=parkFor(from,dest),C=CS();spend(g+p);C.trips++;C.gas+=g;
    say(`🚗 Gas: ${$(g)}${p?`, and ${$(p)} for a spot in a downtown lot`:''}.`)}}}
function driveGo(k){if(!canDrive()||!L[k]||k===S.loc||driveMins(S.loc,k)==null)return;DRV=true;go(k)}
// the chip next to "Go · n min" in the Go somewhere list (05-ui.js)
function driveChip(k){
  try{if(!canDrive()||driveMins(S.loc,k)==null)return '';DRV=true;const m=travelMins(S.loc,k);DRV=false;
    const i=ACTS.push(()=>driveGo(k))-1,g=gasFor(S.loc,k)+parkFor(S.loc,k);
    return `<button class="chip" onclick="ACT(${i})" aria-label="Drive to ${esc(L[k].name)} · ${m} min · ${$(g)}">🚗 Drive · ${m} min</button>`}catch(e){DRV=false;return ''}
}
window.driveChip=driveChip;window.driveGo=driveGo;

// ---- Growing Up: lessons and the license test ----
function growCarActs(a){
  if(!lifeLong()||(S.age||12)<16||S.loc!=='home')return a;
  const C=CS(),d=day(),m=tod(),free=(!isSchoolDay(d)||m>=930)&&m>=540&&m<Math.min(1200,gCurfew()-60);
  if(C.lic){return a}
  const who=d%2?'Dad':'Mom';
  if(C.lesson!==d)a.push({ic:'🚗',l:`A driving lesson with ${who} (${C.practice} so far)`,s:free?'1 hour on your learner’s permit, energy −4. Practice +1, family +2. Once a day.':'After school or on a weekend, before dinner.',cat:'here',dis:!free,
    fn:()=>{C.lesson=d;C.practice++;pass(60);adj('energy',-4);adj('family',2);adj('mood',C.practice>2?3:-1);
      say(pick([`🚗 ${who} in the passenger seat, one hand near the parking brake “just in case.” Up and down the side streets off MLK, a stop at every corner. Practice ${C.practice}.`,
        `🚗 Parallel parking on a quiet block. The third try is the charm. ${who} claps once, very seriously. Practice ${C.practice}.`,
        `🚗 Out to the big lot at the Tacoma Dome on a quiet afternoon: turns, backing up, mirrors, mirrors, mirrors. Practice ${C.practice}.`]))}});
  if(C.testDay!==d){const od=passOdds();
    a.push({ic:'🪪',l:'Take the driver’s license test at the DOL office',s:free?`About 2 hours: ${who} drives you to the Department of Licensing office. Your odds with ${C.practice} lesson${C.practice===1?'':'s'}: about ${pct(od)}. Once a day.`:'The DOL office is open in the daytime: after school or on a weekend.',cat:'here',dis:!free,
      fn:()=>carTest(od,who)})}
  return a;
}
function carTest(od,who){const C=CS(),d=day();C.testDay=d;C.tests++;pass(120);adj('energy',-6);
  if(Math.random()<od){C.lic=true;if(isGrow()){adj('mood',12);adj('family',3)}else adj('stress',-6);
    lifeMoment('🪪',`Passed the driver’s license test${isGrow()?`, age ${S.age}`:''}.`);
    say(`🪪 A three-point turn, a parallel park, a full stop at every sign. The examiner writes for a long time, then: “Congratulations.” A photo you’ll hate for years, and a license in your wallet.${who?` ${who} honks the whole way home.`:''}`)}
  else{if(isGrow())adj('mood',-6);else adj('stress',6);
    say(`🪪 ${pick(['You roll a stop sign by the DOL office. The examiner sighs and writes something short.','The parallel park takes four tries, and the curb wins one of them.'])} Not this time. More practice, and try again another day.`)}}
// a few Sunday lessons in every time skip, once you're 16
LIFE_HOOKS.skip.push((from,to,ch,notes)=>{if(!isGrow()||(S.age||12)<16||!lifeLong())return;const C=CS();if(C.lic)return;
  const n=Math.min(3,Math.max(1,Math.round((to-from+1)/14)));C.practice+=n;notes.push(`🚗 ${n} Sunday driving lesson${n===1?'':'s'} in the Tacoma Dome parking lot. Practice: ${C.practice}.`)});

// ---- the adult game: a used car ----
function carShop(){const C=CS();
  const rows=Object.entries(CAR_TIERS).map(([k,t])=>({l:`${t.ic} ${cap(t.n)} — ${$(rp(t.price))}`,s:`${t.d} Insurance about ${$(rp(t.ins))} a month.`,dis:S.money<rp(t.price),fn:()=>carBuy(k)}));
  modal('🔑 A used car',`<p>A Saturday at the used lots on South Tacoma Way. You have ${$(Math.round(S.money))}. On top of the price: insurance every month, gas, parking downtown and the odd repair. At home it parks on the street.</p>`,
    [...rows,{l:'Not today',fn:()=>{}}]);
}
function carBuy(k){const t=CAR_TIERS[k],C=CS(),p=rp(t.price);if(!t||C.own||S.money<p)return;
  spend(p);C.own=k;C.ins=rp(t.ins);C.billed=ym(day());C.down=false;C.taped=false;spend(C.ins);pass(120);adj('stress',-4);
  lifeMoment(t.ic,`Bought ${t.n}.`);
  say(`🔑 ${cap(t.n)}, ${$(p)} cash, and the first month of insurance (${$(C.ins)}). You drive it home up South Tacoma Way grinning, and find a spot on the street outside your building. Now the other neighborhoods are a short drive away.`)}
function adultCarActs(a){
  if(!adultOn()||S.loc!=='home')return a;const C=CS();
  if(!C.lic){const od=passOdds(),d=day(),ok=tod()>=540&&tod()<1020;
    if(C.testDay!==d)a.push({ic:'🪪',l:'Take the driver’s license test at the DOL office',s:ok?`About 2 hours. Your odds: about ${pct(od)}. Once a day.`:'The DOL office is open 9 to 5.',cat:'here',dis:!ok,fn:()=>carTest(od,null)});
    return a}
  if(!C.own)a.push({ic:'🔑',l:'Shop for a used car',s:`From ${$(rp(CAR_TIERS.civic.price))}. Faster trips to the other neighborhoods, plus insurance, gas and parking.`,cat:'money',fn:carShop});
  else{
    if(C.down)a.push({ic:'🔧',l:`Get the car fixed at the shop — ${$(C.down)}`,s:'2 hours. Then you can drive again.',cat:'money',dis:S.money<C.down,fn:()=>{spend(C.down);C.down=false;pass(120);adj('stress',-4);say('🔧 The mechanic on South Tacoma Way hands you the keys and a greasy invoice. It starts on the first try.')}});
    if(C.taped)a.push({ic:'🪟',l:`Replace the taped-up window — ${$(rp(250))}`,s:'1 hour at the glass shop. Stress −4.',cat:'money',dis:S.money<rp(250),fn:()=>{spend(rp(250));C.taped=false;pass(60);adj('stress',-4);say('🪟 New glass, the plastic in the trash, and the car looks like a car again.')}});
  }
  return a;
}
{const ah=actionsHere;actionsHere=function(){const a=ah();if(!S||isGrow())return a;try{return adultCarActs(a)}catch(e){console.error(e);return a}}}
{const ah=GROW.actionsHere;GROW.actionsHere=function(){const a=ah();try{return growCarActs(a)}catch(e){console.error(e);return a}}}

// ---- the running costs ----
{const om=onMorning;onMorning=function(d){om(d);try{if(!isGrow()&&owns())carBill(d)}catch(e){console.error(e)}}}
LIFE_HOOKS.skip.push((from,to,ch,notes)=>{if(isGrow()||!owns())return;const C=S.car,wk=Math.max(1,Math.round((to-from+1)/7));
  carBill(to,notes);const g=rp(18)*wk;money(-g);notes.push(`⛽ Gas for errands and trips across town: ${$(g)}.`);
  const mo=Math.max(1,Math.round(wk/4.3));let rep=0;for(let i=0;i<mo;i++)if(Math.random()<0.12*tier().rep)rep+=rp(pick([180,320,550]));
  if(rep){money(-rep);notes.push(`🔧 Repairs at the shop on South Tacoma Way: ${$(rep)}.`)}
  if(C.down){money(-C.down);notes.push(`🔧 The car got fixed along the way: ${$(C.down)}.`);C.down=false}
  if(C.taped){money(-rp(250));C.taped=false;notes.push(`🪟 The taped-up window finally got new glass: ${$(rp(250))}.`)}});
// the check-engine light: fix it now, or ride the bus until you do
defEvent({id:'car_repair',hook:'wake',tile:['🔧','The check-engine light','bad'],chance:()=>0.03*(owns()?tier().rep:0),bad:true,cooldown:40,max:3,
  cond:()=>canDrive()&&day()>0&&S.loc==='home',
  run:()=>{const c=rp(pick([180,320,550]));S.ev.flags.carRep=c;say(`🔧 You start the car to move it for street sweeping and the check-engine light comes on, orange and steady. Something rattles. The shop on South Tacoma Way says about ${$(c)}.`)},
  choices:()=>{const c=S.ev.flags.carRep||rp(320);return [
    {ic:'🔧',l:`Take it in today — ${$(c)}`,s:'2 hours waiting, energy −3. Back on the road.',dis:S.money<c,fn:()=>{if(tod()+120<1400)pass(120);spend(c);adj('energy',-3);say('🔧 A sensor and a belt. Two hours in the waiting room with a vending-machine coffee, and it runs smooth again.')}},
    {ic:'🚌',l:'Park it and take the bus until you can',s:'Stress +5. No driving until it’s fixed (at home).',fn:()=>{S.car.down=c;adj('stress',5);say('🚌 You leave it parked on the street. The bus will do for now.')}},
  ]},dflt:1});

// ---- what you see: a tag on the Here tab ----
{const st=statusTags;statusTags=function(){const t=st()||[];try{if(!isGrow()&&owns())t.push(`<span class="tag">${tier().ic} ${S.car.down?'car in the shop':S.car.taped?'window taped':'car'}</span>`);else if(isGrow()&&S.car&&S.car.lic)t.push('<span class="tag">🪪 licensed</span>')}catch(e){}return t}}

window.CAR={S:CS,tiers:CAR_TIERS,owns,canDrive,driving:()=>DRV,driveMins,bill:carBill,buy:carBuy,odds:passOdds};
})();
