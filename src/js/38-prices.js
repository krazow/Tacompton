// ============================================================
//  TACOMPTON · PRICES: everyday prices rise with inflation in the longer adult games (6 months, 1 year, 2 years, Lifetime).
//  Quick play is unchanged, and so is Growing Up: the level stays 1.0 there, and it starts at 1.0 with your own lease at 18.
//
//  S.prices is the price level (1.0 at the start). Every January it rises PRICES.pct (2.5, 3 or 3.5%, rolled from the year),
//  with a line in the city news. rp() (20-world.js) multiplies everyday costs by it: groceries, meals, fares, shop items,
//  dates, bills; priceAmt() does tuition and program fees. Rent has its own August rise (33-seasons.js) and wages their
//  cost-of-living raises (35-careers.js): neither uses the level, and fixed story amounts don't either.
//  Time skips: everyday costs (food, bills and a little fun, at the price level) plus most of what's left of your pay after
//  rent, school and those: people spend more as they earn more. PRICES.spend is the share of that leftover you spend.
//    priceDay(d,out) → the January rises up to day d (lifeSimulate calls it every skipped day; mornings and key weeks too)
//    lifeLiving(ch,d) → a skipped day's everyday spending (lifeSimulate)
// ============================================================
// spend: the share of the leftover pay spent in a time skip, by choice: [below the cushion, above it].
// cushion: months of rent and everyday costs most people keep saved; past it, a little of the extra goes each day (drift).
const PRICES={pct:[2.5,3.5],step:0.5,need:(45+40+20)/7,cushion:9,drift:0.002,
  spend:{'':[0.6,1],save:[0.4,0.9],extra:[0.5,1],friends:[0.8,1]}};
const pricePct=y=>PRICES.pct[0]+PRICES.step*Math.floor(wxHash('prices'+y)*((PRICES.pct[1]-PRICES.pct[0])/PRICES.step+1));
const priceUpPct=()=>Math.round((priceLv()-1)*100);
const priceOn=()=>typeof S!=='undefined'&&!!S&&lifeLong()&&!isGrow();
window.priceLv=priceLv;

// adult saves start at 1.0 (also the move-in at 18, which starts a fresh adult state); old saves get 1.0 (fillDefaults)
{const ns=newState;newState=function(){const o=ns();if(!isGrow()){o.prices=1;o.pricesY=null}return o}}

// the January rises between the last one counted and day d
function priceDay(d,out){
  if(!priceOn())return;
  if(!(typeof S.prices==='number'&&S.prices>0))S.prices=1;
  const y=dateOf(d).y;
  if(S.pricesY==null){S.pricesY=y;return}   // the first year (or an old save): rises count from next January
  while(S.pricesY<y){S.pricesY++;const p=pricePct(S.pricesY);S.prices=Math.round(S.prices*(1+p/100)*1e4)/1e4;
    const l=`🛒 Prices are up ${p}% on a year ago: groceries, a plate lunch, a bus fare, a movie, all a little more. Everyday prices are up ${priceUpPct()}% since you got your own place.`;
    if(out)out.push(`<b>City news</b> · ${l}`);else{say(l);digestLine(l)}}
}
window.priceDay=priceDay;
{const om=onMorning;onMorning=function(d){om(d);try{priceDay(d,null)}catch(e){console.error(e)}}}
LIFE_HOOKS.weekStart.push(()=>priceDay(day(),null));

// a skipped day's everyday spending
let PRICE_SKIP=null;
function lifeLiving(ch,d){
  const c=typeof ch==='string'&&ch.startsWith('prog:')?'save':ch,lv=priceLv()*eraPF(),cost=DF().cost||1;
  const need=(PRICES.need*cost*(c==='save'?0.75:1)+(c==='friends'?25/7:0))*lv;
  let inc=0;
  if(S.life.retired)inc=typeof careerPension==='function'?careerPension():500/7;
  else{const J=job(),pf=lifePayF(),tips=J.tips?(J.tips[0]+J.tips[1])/2:0;inc=((J.pay*pf+tips)*J.days.length+(c==='extra'?J.pay*pf*0.9:0))/7}
  const help=S.life.rentHelpLeft>0?Math.min(S.life.rentHelp||0,S.rent.amt):0;
  let fixed=(typeof lifeRentDue==='function'?lifeRentDue():S.rent.amt-help)*12/365;   // 38-paths.js: no rent in the barracks
  if(S.life.path&&!S.life.done&&S.life.path!=='job')fixed+=lifePathFee()*12/365;
  if(S.career&&S.career.prog)fixed+=priceAmt(S.career.prog.fee)*12/365;
  const cush=PRICES.cushion*(fixed+need)*365/12,over=S.money>cush,sh=(PRICES.spend[c]||PRICES.spend[''])[over?1:0];
  const left=inc-need-fixed,v=need+(left>0?left*sh:0)+(over&&!S.life.retired?(S.money-cush)*PRICES.drift*(c==='save'?0.25:1):0);
  if(PRICE_SKIP)PRICE_SKIP.spent+=v;
  return v;
}
window.lifeLiving=lifeLiving;
// the skip summary: what everyday life cost while you were away
{const ls=lifeSimulate;lifeSimulate=function(from,to,ch){
  if(!priceOn())return ls(from,to,ch);
  PRICE_SKIP={spent:0};let n,sp=0;try{n=ls(from,to,ch)}finally{sp=Math.round(PRICE_SKIP.spent);PRICE_SKIP=null}
  if(sp>0){const up=priceUpPct(),i=n.findIndex(x=>/^💵 (Saved|Spent down)/.test(x));
    const l=`🛒 Everyday life cost ${$(sp)} while you were away: groceries, bills, the bus, going out${up>0?` (prices are up ${up}% since you got your own place)`:''}.`;
    if(i>=0)n.splice(i,0,l);else n.push(l)}
  return n}}
// the summary's table: the price level, as a percentage over the start
{const sr=lifeSnapRows;lifeSnapRows=function(){const r=sr();if(priceOn())r.push(['🛒 Prices since your own place',Math.round(priceLv()*100),v=>`${v>100?'+':''}${v-100}%`,true]);return r}}
// retirement: Social Security, savings and the senior rent programs together always cover rent and everyday costs with a
// little to spare (rents rise faster than pensions, and the cushion above is a few months, not a nest egg)
function pensionFloor(){return priceOn()?(S.rent.amt*12/365+PRICES.need*(DF().cost||1)*priceLv()*eraPF())*1.15:0}
window.pensionFloor=pensionFloor;
