// ============================================================
//  TACOMPTON, part 3: clients, bookings, trips, dilemmas, fish, regs, reviews.
//  Owner: TRIPS. Marine Area 11 (Tacoma–Vashon), Mon Aug 3 – Sun Aug 16, 2026.
//
//  Regulation facts used here (checked Nov 2026; see regsView() for the player-facing version and links):
//   · WDFW "Salmon Fishing Current" blog, summer/fall 2026: MA11 hatchery Chinook reopens Jul 23 – Sep 30, limit 2;
//     Chinook minimum 22 in., other salmon no minimum; release wild Chinook and chum; non-selective coho Jul 23 – Nov 15;
//     electronic catch record cards (eCRC) since Apr 1, 2026; year-round piers incl. Les Davis Pier and the Point Defiance Boathouse Dock.
//   · WSR 26-16-039 (filed Jul 29, 2026): Commencement Bay, Aug 1 – Sep 30: daily limit 2 including no more than 1 Chinook,
//     release chum and wild Chinook, "to align salmon rules with the rest of Marine Area 11". (So the rest of MA11 in early August
//     is read as 2 salmon, no more than 1 hatchery Chinook. That reading is an inference from the "align" wording.)
//   · WSR 26-17-050 (filed Aug 12, 2026): Area 11, Aug 15 – Sep 30: daily limit 2, release Chinook and chum (Chinook retention closed:
//     the sublegal Chinook encounter guideline was projected to be reached by Aug 14).
//   · 2026 WA sport fishing rules (eRegulations): single-point barbless hooks required for salmon in Marine Areas 1–13;
//     barbless hooks required for all species in Marine Areas 5–13.
//  UNCONFIRMED (general knowledge, marked again where used): the exact wording of "record immediately" on the catch record card;
//  no releasing a fish once it's retained (high-grading); the life-jacket age (12 and under) for kids on deck; the 1,000-yard
//  Southern Resident orca buffer (state law since 2025); USCG OUPV "six-pack" = max 6 passengers for hire; fine amounts (game values).
// ============================================================

// ---- the season's rule switches ----
const CHINOOK_LAST=11;                         // day index 11 = Fri Aug 14: last day Chinook may be kept (WSR 26-17-050 closes it Aug 15)
const chinookOpen=(d=day())=>d<=CHINOOK_LAST;
const MIN_KING=22;                              // inches, Chinook minimum (WDFW 2026)
const BAG=2, KING_BAG=1;                        // 2 salmon, no more than 1 hatchery Chinook (see header: KING_BAG inferred from WSR 26-16-039)
const SIXPACK=6;                                // USCG OUPV: six passengers for hire (unconfirmed detail, well-known rule)
const GAS=5.89;                                 // $/gal at the Point Defiance fuel dock (game value from the brief)
const DEP=0.25;                                 // deposit taken when a booking is confirmed, refunded on a no-show
const FUEL_HRS=[360,1200];                      // fuel dock 6 AM – 8 PM
const WINDOW_EARLY=60, WINDOW_LATE=120;         // a trip can start from an hour early to two hours late; later and the party has gone

// ---- trip types ----
const TRIPS={
  mooch:{n:'Half-day mooch',ic:'🎣',start:330,len:300,pp:150,fuel:5,energy:16,bait:1,k:1.3,c:.7,
    long:'Cut-plug herring on long, soft mooching rods, drifted slow over the kings off Point Defiance. The classic Tacoma way.'},
  troll:{n:'Full-day troll',ic:'🚤',start:300,len:540,pp:225,fuel:13,energy:28,bait:0,k:1,c:1,
    long:'Downriggers, green-glow flashers and hoochies, all day from the Narrows to Dalco Passage.'},
  coho:{n:'Evening coho',ic:'🌅',start:990,len:240,pp:125,fuel:6,energy:14,bait:0,k:.35,c:1.5,
    long:'Silvers on the evening bite: trolled hoochies and spoons in the tide rips off Browns Point and the bay.'},
};
function tripFuel(b){const T=TRIPS[b&&b.type];return T?T.fuel:8}   // gallons a trip burns before the spot's extra (STORY's stFuelFor)

// ---- spots (Marine Area 11) ----
// k / c: how well it fishes for Chinook / coho; calm: sheltered water; scenic: photos; fuel: extra gallons to run there; expo: wind exposure
const SPOTS={
  clay:   {n:'The Clay Banks',sub:'Point Defiance, under the bluff',k:1,c:.6,calm:.6,scenic:.8,fuel:0,expo:.5,txt:'The famous mooching drift. Kings hold on the ledge at the top of the tide.'},
  gibson: {n:'Gibson Point',sub:'the west tip of Point Defiance',k:.9,c:.7,calm:.4,scenic:.7,fuel:1,expo:.8,txt:'Where the Narrows current wraps the point. Fish it on the change.'},
  slag:   {n:'The Slag Pile',sub:'off Ruston, by the old smelter',k:.8,c:.65,calm:.8,scenic:.4,fuel:0,expo:.4,txt:'Five minutes from the launch. Close, easy and crowded.'},
  owen:   {n:'Owen Beach',sub:'the Point Defiance shoreline',k:.55,c:.75,calm:.9,scenic:.9,fuel:0,expo:.2,txt:'Calm water, madronas on the bluff, the mountain over Vashon.'},
  dalco:  {n:'Point Dalco',sub:'the south end of Vashon',k:.95,c:.8,calm:.35,scenic:.7,fuel:2,expo:.9,txt:'Big fish, big rips. The wind finds it first.'},
  browns: {n:'Browns Point',sub:'across Commencement Bay',k:.5,c:1,calm:.6,scenic:.6,fuel:2,expo:.6,txt:'Coho cruise the tide line off the lighthouse.'},
  bay:    {n:'Commencement Bay',sub:'off the Foss and Hylebos mouths',k:.4,c:.9,calm:.9,scenic:.3,fuel:1,expo:.3,txt:'Port cranes, ship traffic and staging silvers. Open again since Aug 1.'},
  narrows:{n:'The Narrows',sub:'under the bridges (north side = Area 11)',k:.8,c:.55,calm:.1,scenic:1,fuel:1,expo:.6,txt:'Four-knot currents under the bridges. Great fishing, if you can hold bottom.'},
  quarter:{n:'Quartermaster Harbor',sub:'Vashon and Maury Islands',k:.45,c:.85,calm:1,scenic:.9,fuel:4,expo:.1,txt:'A long run to glassy water. Herons, cabins and quiet coho.'},
};
const SPOT_KEYS=Object.keys(SPOTS);

// ---- water: per-day spot conditions (S.water[d]) ----
// {wind kt, tides:[{m,hi,ft}], run:{k,c}, sp:{key:0..1 true quality}, rd:{key:0..1 the read you get without scouting}}
function trWater(d){
  if(!S.water) S.water={};
  if(S.water[d]) return S.water[d];
  const r=Math.random,prev=S.water[d-1];
  const wind=Math.round(3+r()*11+(r()<.15?7:0));
  const run={k:Math.round((1.05-d*.03)*100)/100,c:Math.round((.6+d*.05)*100)/100};   // kings fade through August, coho build
  const h0=((350+d*50)%745);                                                       // first high tide, ~50 min later each day
  const tides=[];for(let m=h0-372,i=0;m<1440;m+=372,i++){if(m>=0)tides.push({m,hi:(i%2)===1,ft:Math.round(((i%2)?11+r()*3:-1+r()*5)*10)/10})}
  const sp={},rd={};
  SPOT_KEYS.forEach(k=>{const s=SPOTS[k];let q=.18+r()*.6-(wind>=12?s.expo*.18:0);
    if(prev&&prev.sp&&prev.sp[k]!=null) q=prev.sp[k]*.45+q*.55;                   // the bite carries over: yesterday's read is worth something
    sp[k]=Math.round(clamp(q,.05,.95)*100)/100;rd[k]=Math.round(clamp(sp[k]+(r()-.5)*.36,.05,.95)*100)/100});
  return (S.water[d]={wind,tides,run,sp,rd});
}
const spotWord=q=>q>=.62?'Hot':q>=.46?'Good':q>=.3?'Fair':'Poor';
const spotIc=w=>({Hot:'🔥',Good:'🟢',Fair:'🟡',Poor:'⚪'})[w];
const scouted=(d=day())=>S.scout===d;
const spotRead=(k,d=day())=>{const w=trWater(d);return scouted(d)?w.sp[k]:w.rd[k]};

// ---- small helpers ----
const trD=d=>typeof augDate==='function'?augDate(d):`Aug ${3+d}`;
function dlabel(d){return d===day()?'today':d===day()+1?'tomorrow':trD(d)}
function reqKey(r){const T=TRIPS[r.type];return T?`${T.ic} ${T.n.toLowerCase()} for ${r.party?r.party.n:r.n}`:'a trip'}
const bkOf=id=>(S.book||[]).find(b=>b.id===id);
const nm=b=>`the ${b.party.name}`;
const Nm=b=>`The ${b.party.name}`;
const endOf=b=>b.start+TRIPS[b.type].len;
const r2=x=>Math.round(x*100)/100;
function overlaps(d,start,type,skipId){const e=start+TRIPS[type].len;return (S.book||[]).some(b=>b.id!==skipId&&b.day===d&&b.status==='booked'&&start<endOf(b)+30&&b.start<e+30)}

// ---- clients ----
const WANTS={limit:'a limit to take home',king:'a big king',kids:'non-stop action for the kids',photos:'photos to post',calm:'calm water, please',learn:'to learn to mooch'};
const PARTIES=[
  {names:['Hendersons, cruise-ship tourists from Ohio','Okafors, visiting from Atlanta','retirees off the Alaska cruise in Seattle','honeymooners from Minneapolis'],n:[2,4],wants:['photos','calm','king'],mood:2,types:['mooch','coho']},
  {names:['three Amazon engineers from South Lake Union','Microsoft team on an offsite','startup founders from Capitol Hill','data scientists who read every review'],n:[2,4],wants:['limit','king','photos'],mood:-3,types:['troll','mooch'],tipK:1.3},
  {names:['JBLM sergeant on leave and his dad','two Stryker soldiers from JBLM','Army medic home from deployment'],n:[1,3],wants:['king','limit'],mood:3,types:['mooch','troll']},
  {names:['Nguyen family and their three kids','Puyallup family with two boys','Lakewood grandparents and the grandkids'],n:[3,5],wants:['kids','calm','photos'],mood:1,types:['coho','mooch'],kids:true},
  {names:['retired longshore worker from Proctor','Old Town regular from The Spar','Hilltop barber who fished here in the ’70s'],n:[1,2],wants:['king','learn'],mood:-1,types:['mooch'],regular:true},
  {names:['couple who just moved from Phoenix','nurses from Tacoma General','UPS students with a free weekend'],n:[2,3],wants:['learn','photos'],mood:2,types:['mooch','coho']},
  {names:['bachelor party from Federal Way','fantasy-football league from Puyallup'],n:[4,6],wants:['limit'],mood:-1,types:['troll','coho'],rowdy:true},
  {names:['Gig Harbor dentist and two clients','waterfront-condo couple from Gig Harbor'],n:[2,4],wants:['king','calm'],mood:-2,types:['troll','mooch'],tipK:1.5,rich:true},
];
function makeParty(src){
  let pool=PARTIES;
  if(src==='rich') pool=PARTIES.filter(p=>p.rich||p.tipK);
  else if(src==='bar') pool=PARTIES.filter(p=>p.rowdy||p.mood<=0);
  else if(src==='pier') pool=PARTIES.filter(p=>p.regular||p.kids||p.mood>0);
  const P=pick(pool),n=P.n[0]+Math.floor(Math.random()*(P.n[1]-P.n[0]+1));
  return {P,party:{name:pick(P.names),n,want:pick(P.wants),mood:P.mood+(Math.random()<.2?-2:0)}};
}
const partyTpl=b=>PARTIES.find(P=>P.names.includes(b.party.name))||{};
const hasKids=b=>!!partyTpl(b).kids||b.party.want==='kids';

// ---- booking requests ----
// S.reqs: {id, r:{day, d, start, type, party, price, who}, exp}. r.who / r.d are for the engine's morning report.
function makeReq(src,dMin){
  const d0=Math.max(day(),dMin==null?day()+1:dMin);
  for(let i=0;i<12;i++){
    const {P,party}=makeParty(src),d=d0+Math.floor(Math.random()*Math.min(5,GAME.days-d0));
    if(d>=GAME.days) return null;
    const type=Math.random()<.75?pick(P.types):pick(Object.keys(TRIPS)),T=TRIPS[type];
    if(d===day()&&T.start-WINDOW_EARLY<=tod()) continue;
    if(overlaps(d,T.start,type)) continue;
    const price=Math.round(T.pp*party.n*(src==='rich'?1.15:1));
    return {day:d,d,start:T.start,type,party,price,who:party.name};
  }
  return null;
}
function queueRequest(src,dMin){
  if(!S||day()>=GAME.days-1&&src!=='seed') return null;
  const r=makeReq(src,dMin);if(!r) return null;
  const q={id:S.nextId++,r,exp:Math.min(r.day,day()+1)};S.reqs.push(q);
  if(src!=='seed') showTile('📞','New booking request',`The ${r.who}, ${dlabel(r.day)}. See 📅 Bookings.`,'info');
  return q;
}
const reqDot=()=>!!(S&&S.reqs&&S.reqs.length);
function addBooking(r,price){
  const b={id:S.nextId++,day:r.day,start:r.start,type:r.type,party:Object.assign({},r.party),price,status:'booked',dep:Math.round(price*DEP)};
  S.book.push(b);money(b.dep);
  return b;
}
function counterOdds(r){
  const ra=ratingAvg();let p=.5+r.party.mood*.05+(ra?(ra-3.8)*.25:0)+(S.rep-50)/200;
  p=1-(1-clamp(p,.1,.9))*(DF().rateK||1);
  return clamp(p,.05,.9);
}
function reqOpts(q){
  const r=q.r,T=TRIPS[r.type],busy=overlaps(r.day,r.start,r.type),hi=Math.round(r.price*1.2/5)*5,late=r.day===day()&&tod()>r.start-WINDOW_EARLY;
  const king=r.party.want==='king'&&r.day>CHINOOK_LAST;
  const book=(p,line)=>{const b=addBooking(r,p);sfx('good');say(`📅 ${line||'Booked'}: ${T.ic} ${T.n}, ${dlabel(b.day)} at ${fmt(b.start)}, ${nm(b)} (${b.party.n}). ${$(p)}, ${$(b.dep)} deposit in hand.`)};
  return [
    {l:`Book it — ${$(r.price)}`,s:busy?'You’re already booked then.':late?'Too late to make that start.':`${$(Math.round(r.price*DEP))} deposit now, the rest at the dock.${king?' Chinook retention will be closed by then: they can only release kings.':''}`,dis:busy||late,fn:()=>book(r.price)},
    {l:`Counter at ${$(hi)}`,s:busy||late?'':`They might bite (about ${Math.round(counterOdds(r)*100)}%). Or they call the next boat.`,dis:busy||late,fn:()=>{
      if(Math.random()<counterOdds(r)) book(hi,'They take the higher price');
      else say(`📞 “That’s a bit rich for us.” ${'The '+r.who} book another boat.`)}},
    {l:'Decline politely',s:'',fn:()=>say(`📞 You pass on the ${r.who}.`)},
  ];
}
window.tripReq=(id,k)=>{
  const i=S.reqs.findIndex(q=>q.id===id);if(i<0) return;
  const q=S.reqs[i],o=reqOpts(q)[k];if(!o||o.dis) return;
  S.reqs.splice(i,1);uiNarr=[];o.fn();sfx('tap');render();
};
function reqBody(q){
  const r=q.r,T=TRIPS[r.type],kids=PARTIES.find(P=>P.names.includes(r.party.name));
  return `<p>The <b>${r.party.name}</b>, ${r.party.n} ${r.party.n===1?'angler':'anglers'}, want a <b>${T.ic} ${T.n}</b> on <b>${trD(r.day)}</b> at ${fmt(r.start)}.</p>
  <p style="font-size:13px;margin:4px 0">🎯 They want ${WANTS[r.party.want]}.${kids&&kids.kids?' 🧒 Kids aboard.':''}${r.party.mood<=-2?' 🧐 They look like picky reviewers.':r.party.mood>=2?' 😊 Easygoing.':''}</p>
  <p style="font-size:12.5px;color:var(--mute);margin:2px 0">${T.long} ${$(T.pp)} × ${r.party.n}${r.price!==T.pp*r.party.n?' (premium)':''} = ${$(r.price)}. ${q.exp<=day()?'Answer today or they move on.':'Waits until tomorrow night.'}</p>`;
}

// ---- enforcement ----
const WDFW_COPS=['a WDFW Enforcement officer in a patrol boat','a WDFW officer checking boats at the Point Defiance launch','a WDFW officer with binoculars on Les Davis Pier'];
const USCG='a Coast Guard boarding team';
function cite(t,what,fine,minor,who){
  who=who||pick(WDFW_COPS);let line;
  if(minor&&S.warns<1){S.warns++;line=`⚠️ ${who} writes you a warning for ${what}. You get one; the next one costs money.`;showTile('⚠️','Warning',what,'warn')}
  else{fine=Math.round(fine*DF().fine*(1+DF().esc*S.cites));S.cites++;money(-fine);S.stats.fines+=fine;adj('rep',-6);
    line=`🚨 ${who.charAt(0).toUpperCase()+who.slice(1)} cites you for ${what}: <b>${$(fine)}</b>. That’s ${S.cites} of 3 citations before WDFW pulls your charter license.`;
    showTile('🚨','Citation',what,'bad')}
  if(t&&t.notes) t.notes.push(line); else say(line);
}
function violate(t,{p,fine,what,minor,who}){
  S.stats.viol++;
  const heat=Math.max(0,S.stats.viol-1)*.05;           // every rule broken this season makes the next likelier to be noticed
  if(Math.random()<Math.min(.9,p*DF().enforce+heat)){cite(t,what,fine,minor,who);return true}
  if(Math.random()<.25){adj('rep',-2);(t?t.notes:[]).push('👀 Another charter boat saw it. The Point Defiance docks talk.')}
  return false;
}

// ---- dilemmas ----
// Each: (b,t)=>{t:title, b:html, o:[{l,s,fn(b,t),legal}]}. Legal options always cost something; illegal ones pay, if nobody's watching.
const O=(l,s,fn,ill)=>({l,s,fn,legal:!ill});
const fx=(t,amt,why)=>{t.x.push([why,amt])};
const lose=(t,m)=>{t.lost+=m};
const want=(b,w)=>b.party.want===w;
const DIL={
  wild_king:{cond:(b,t)=>chinookOpen()&&b.type!=='coho',f:(b)=>({t:'🐟 A wild king',b:`<p>A bright 16-pound Chinook comes to the net. You check its back: <b>the adipose fin is still there</b>. Wild fish. In Marine Area 11 wild Chinook must be released.</p>`,o:[
    O('Release it, in the water',want(b,'king')?'They came for exactly this fish. It stings.':'A good look, then it’s gone. A smaller tip.',(b,t)=>{t.happy-=want(b,'king')?8:3;t.rel++;t.notes.push('🐟 You slip the hook with the king still in the water. It holds a second, then dives.')}),
    O('Bonk it. Who checks fins?','A 16-pound king in the box. They slip you $80.',(b,t)=>{t.happy+=8;t.exK++;fx(t,80,'Cash for the wild king');violate(t,{p:.3,fine:650,what:'retaining a wild (unclipped) Chinook'})},1)]})},
  short_king:{cond:()=>chinookOpen(),f:(b)=>({t:'📏 Just short',b:`<p>A clipped hatchery king, a nice one, but it tapes <b>20½ inches</b>. The Chinook minimum is <b>${MIN_KING} inches</b>.</p>`,o:[
    O('Release it','“That’s a keeper back home.” A sulk.',(b,t)=>{t.happy-=4;t.rel++}),
    O('“It’ll grow in the cooler.” Keep it.','One more fish in the box and a $30 tip.',(b,t)=>{t.exK++;t.happy+=3;fx(t,30,'Tip for the shaker');violate(t,{p:.25,fine:300,what:`keeping an undersized Chinook (${MIN_KING}-inch minimum)`,minor:true})},1)]})},
  second_king:{cond:(b)=>chinookOpen()&&b.type!=='coho',f:(b)=>({t:'👑 Another king',b:`<p>Your client already has a hatchery king in the box, and here comes a second one, clipped and legal size. The limit is ${BAG} salmon, <b>no more than ${KING_BAG} Chinook</b>.</p>`,o:[
    O('Release it and fish for coho','He’d rather have the king.',(b,t)=>{t.happy-=4;t.rel++}),
    O('Put it on his buddy’s card','His buddy gets skunked anyway. $50 tip.',(b,t)=>{t.exK++;t.happy+=4;fx(t,50,'Tip for the second king');violate(t,{p:.3,fine:400,what:'exceeding the one-Chinook limit'})},1)]})},
  closed_king:{cond:(b)=>!chinookOpen()&&b.type!=='coho',force:b=>!chinookOpen()&&(want(b,'king')||b.type==='mooch'),f:(b)=>({t:'🚫 Chinook retention is closed',b:`<p>A big hatchery king, clipped and legal. But since <b>Aug 15</b>, an emergency rule closed Chinook retention in Marine Area 11: release every Chinook.</p>`,o:[
    O('Photo in the water, then release',want(b,'photos')?'A great shot, and they’re happy with it.':'Long faces. They came for kings.',(b,t)=>{t.happy+=want(b,'photos')?4:want(b,'king')?-9:-4;t.rel++;t.shot=true}),
    O('Keep it. The rule is two days old.','Nobody’s heard yet. A $90 tip.',(b,t)=>{t.exK++;t.happy+=8;fx(t,90,'Tip for the closed-season king');violate(t,{p:.4,fine:800,what:'retaining Chinook after retention closed'})},1)]})},
  barbs:{cond:()=>true,f:(b)=>({t:'🪝 Barbed hooks',b:`<p>One of ${nm(b)} brought his own rigs from back home. You look closer: <b>barbed trebles</b>. Salmon in Marine Areas 1–13 take single-point barbless hooks only.</p>`,o:[
    O('Swap to your barbless rigs','20 minutes re-rigging, and a few fish come unbuttoned.',(b,t)=>{lose(t,20);t.q-=.03}),
    O('Pinch the barbs with your pliers','10 minutes and a grumble. They’re still trebles.',(b,t)=>{lose(t,10);t.q+=.01;violate(t,{p:.15,fine:150,what:'treble hooks for salmon (single-point barbless only)',minor:true})},1),
    O('Fish them as they are','Barbs hold fish. More in the box, a $30 tip.',(b,t)=>{t.q+=.05;fx(t,30,'Tip for the hookups');violate(t,{p:.2,fine:200,what:'fishing barbed hooks for salmon',minor:true})},1)]})},
  crc:{cond:()=>true,f:(b)=>({t:'📓 The catch record card',b:'<p>Fish in the box, the bite is hot and every rod is bending. Each angler has to record a salmon on the catch record card (paper or the eCRC app) <b>right after landing it</b>.</p>',o:// "right after landing it": exact WAC wording unconfirmed
    [O('Stop and record every fish','Ten minutes of thumbs on phones while the bite runs.',(b,t)=>{lose(t,10);t.q-=.02}),
    O('“We’ll do it at the dock.”','Keep fishing through the bite.',(b,t)=>{t.q+=.03;t.happy+=2;violate(t,{p:.2,fine:150,what:'salmon not recorded on the catch record card',minor:true})},1)]})},
  cull:{cond:(b)=>b.type!=='mooch',f:(b)=>({t:'🔁 Trade up?',b:'<p>A client has two coho in the box, her limit. Then she hooks a 12-pounder and wants to keep it and toss back her smallest. Once a fish is kept, it’s kept: no high-grading.</p>',o:// no-culling rule: general WA principle, exact wording unconfirmed
    [O('Release the big one','“That’s the one I wanted.” A smaller tip.',(b,t)=>{t.happy-=5;t.rel++}),
    O('Swap them. The small one swims, mostly.','Her best fish of the year. $40 tip.',(b,t)=>{t.happy+=4;fx(t,40,'Tip for the big coho');violate(t,{p:.25,fine:300,what:'high-grading (releasing a retained salmon)',minor:true})},1)]})},
  over:{cond:()=>true,f:(b)=>({t:'🐟 One more for Grandma',b:`<p>A client has his ${BAG} and wants “one more for my mother-in-law in Fife.” The daily limit is per angler.</p>`,o:[
    O('He’s done keeping fish','He sulks the rest of the drift.',(b,t)=>{t.happy-=5}),
    O('Keep one more','A happy mother-in-law and a $50 tip.',(b,t)=>{t.exC++;t.happy+=3;fx(t,50,'Tip for the extra fish');violate(t,{p:.3,fine:400,what:'exceeding the daily salmon limit'})},1)]})},
  seventh:{cond:(b)=>b.party.n>=4,f:(b)=>{const x=SIXPACK+1-b.party.n,pp=TRIPS[b.type].pp;return {t:'👥 Plus-ones',b:`<p>${Nm(b)} show up with ${x===1?'a cousin':x+' buddies'} “who just want to ride along.” That’s ${SIXPACK+1} paying passengers. Your USCG OUPV license (the “six-pack”) allows <b>${SIXPACK} passengers for hire</b>.</p>`,o:[
    O(`Leave ${x===1?'him':'them'} on the dock`,'Coffee at the boathouse for the extras. The party sulks.',(b,t)=>{t.happy-=6;fx(t,-10,'Boathouse coffee for the extras')}),
    O(`Take ${x===1?'him':'them'} for ${$(pp*x)} cash`,'A full boat and an extra fare.',(b,t)=>{fx(t,pp*x,'Cash fare for the plus-ones');t.happy+=2;violate(t,{p:.3,fine:1200,what:'carrying more than six passengers for hire',who:USCG})},1)]}}},
  pfd:{cond:(b)=>hasKids(b),force:b=>hasKids(b),f:(b)=>({t:'🦺 “Life jackets are for babies”',b:'<p>The eight-year-old refuses to wear his life jacket on deck. Washington law: kids <b>12 and under</b> wear one while the boat is underway.</p>',o:// age 12 from RCW 79A.60.160 (boats under 19 ft): unconfirmed for a charter boat
    [O('It goes on, or he rides in the cabin','Twenty minutes of negotiation. The parents are a little embarrassed.',(b,t)=>{lose(t,20);t.happy-=3}),
    O('Let it go. He’s a good swimmer.','Peace on deck, a happy kid and a $20 tip.',(b,t)=>{t.happy+=3;fx(t,20,'Tip from the relieved parents');violate(t,{p:.2,fine:125,what:'a child aboard without a life jacket',minor:true,who:USCG})},1)]})},
  beer:{cond:(b)=>partyTpl(b).rowdy||b.party.mood<=-1,f:(b)=>({t:'🍺 Cooler’s open',b:`<p>It’s barely seven and ${nm(b)} crack the Rainier. “Have one, Captain {{name}}!”</p>`,o:[
    O('Decline: you’re running the boat','They tease you all morning.',(b,t)=>{t.happy-=3}),
    O('Ask them to keep it closed till the dock','Safer, and quieter.',(b,t)=>{t.happy-=5;adj('rep',1)}),
    O('Have one, to be social','They love you for it. $40 more in tips.',(b,t)=>{t.happy+=5;fx(t,40,'Tip from the good-time crowd');violate(t,{p:.2,fine:1000,what:'operating a vessel under the influence',who:USCG})},1)]})},
  orcas:{cond:()=>true,force:b=>want(b,'photos')&&Math.random()<.5,f:(b)=>({t:'🐋 J pod in Dalco Passage',b:'<p>Black fins and a blow. Southern Resident orcas, working the same salmon you are. Washington law keeps boats <b>1,000 yards</b> from Southern Residents, at slow speed within half a mile.</p>',o:// 1,000-yd buffer (RCW 77.15.740, 2025): unconfirmed
    [O('Pull the gear, idle, watch from 1,000 yards','Half an hour off the fish. Binoculars and phone zoom.',(b,t)=>{lose(t,30);t.q-=.03;t.happy+=want(b,'photos')?5:2;t.shot=true;t.notes.push('🐋 A breach off Point Dalco. Nobody talks for a full minute.')}),
    O('Creep in for the shot','The photo of a lifetime: $60 in tips.',(b,t)=>{t.happy+=8;t.shot=true;fx(t,60,'Tip for the orca photos');violate(t,{p:.35,fine:800,what:'approaching Southern Resident orcas inside 1,000 yards'})},1)]})},
  nets:{cond:(b)=>b.type!=='mooch',f:(b)=>({t:'🛶 A tribal net',b:'<p>A Puyallup Tribe treaty gillnet is set off the Hylebos, a row of corks and a skiff standing by. The coho are stacking right along it. Treaty fishing is a right, and the net gets a wide berth.</p>',o:[
    O('Give it a wide berth and wave','Twenty minutes around, and fewer fish on your side.',(b,t)=>{lose(t,20);t.q-=.02;adj('rep',1)}),
    O('Troll tight along the cork line','That’s where the fish are. $30 tip.',(b,t)=>{t.q+=.05;fx(t,30,'Tip for the hot line');adj('rep',-3);violate(t,{p:.25,fine:500,what:'interfering with treaty fishing gear'})},1)]})},
  license:{cond:()=>true,f:(b)=>({t:'🪪 No license',b:`<p>One of ${nm(b)} “thought the charter covered it.” Every angler 15 and older needs a Washington fishing license with a catch record card.</p>`,o:// age threshold: unconfirmed
    [O('Buy a one-day license on the Fish Washington app','Fifteen minutes on the dock, and he pays for it grumbling.',(b,t)=>{lose(t,15);t.happy-=3}),
    O('He rides along without fishing','Refund his share of the fare.',(b,t)=>{t.nofish++;t.happy-=6;fx(t,-TRIPS[b.type].pp,'His share refunded')}),
    O('Let it slide. Who’s checking?','He slips you $40 for the favor.',(b,t)=>{fx(t,40,'Cash from the unlicensed angler');violate(t,{p:.2,fine:250,what:'guiding an unlicensed angler',minor:true})},1)]})},
  nowake:{cond:()=>true,f:(b)=>({t:'🚤 Late for the dock',b:'<p>You’re running behind and the next party is waiting. The marina entrance is a <b>no-wake zone</b>, full of kayaks and the boathouse rental skiffs.</p>',o:[
    O('Idle in like everyone else','Ten slow minutes.',(b,t)=>{lose(t,10);t.happy-=1}),
    O('Throttle up through the slow zone','Back on time, and a kayaker yells something.',(b,t)=>{t.happy+=2;adj('rep',-1);violate(t,{p:.2,fine:150,what:'a wake in a posted no-wake zone',minor:true,who:'a Tacoma Police marine-services boat'})},1)]})},
  coach:{cond:(b)=>want(b,'learn')||b.type==='mooch',force:b=>want(b,'learn'),f:(b)=>({t:'🧑‍🏫 “How do you know it’s a bite?”',b:'<p>Mooching is all feel: the tap, the slack, the slow lift. The kings are down there, and every bite your clients miss is a fish gone.</p>',o:[
    O('Teach it properly','Slower fishing, but they learn the drift.',(b,t)=>{t.q-=.04;t.happy+=want(b,'learn')?10:3;t.taught=true;adj('energy',-3)}),
    O('Hook them yourself and hand off the rod','More fish in the box.',(b,t)=>{t.q+=.05;t.happy+=want(b,'learn')?-8:1})]})},
  seasick:{cond:(b)=>trWater(day()).wind>=9,f:(b)=>({t:'🤢 Green around the gills',b:`<p>The wind against the tide stacks up a short, steep chop, and one of ${nm(b)} has gone quiet and pale.</p>`,o:[
    O('Tuck in behind the point','Calmer water, slower fishing.',(b,t)=>{t.q-=.05;t.happy+=want(b,'calm')?3:1}),
    O('Ginger ale and eyes on the horizon','Keep fishing. He suffers.',(b,t)=>{t.happy-=want(b,'calm')?9:4}),
    O('Run him back to the dock and go back out','Forty minutes and extra fuel.',(b,t)=>{lose(t,40);t.fuelx+=2;t.happy+=2})]})},
  rival:{cond:()=>true,f:(b)=>({t:'⚓ Cut off',b:'<p>Another charter boat swings across your drift on the Clay Banks with four downriggers out, right over your mooching lines.</p>',o:[
    O('Reel up and give him the drift','Fewer passes over the fish.',(b,t)=>{t.q-=.03}),
    O('Get on the radio and lay into him','Satisfying for ten seconds. The whole fleet hears.',(b,t)=>{adj('rep',-2);t.happy+=1})]})},
  mountain:{cond:()=>true,force:b=>want(b,'photos')&&Math.random()<.4,f:(b)=>({t:'🏔️ The mountain is out',b:'<p>The marine layer peels back and there’s Rainier, pink in the low sun, floating over the Port of Tacoma cranes.</p>',o:[
    O('Pull over for photos','Fifteen minutes of everyone’s best shot.',(b,t)=>{lose(t,15);t.happy+=want(b,'photos')?7:3;t.shot=true}),
    O('Keep fishing. It’ll be there tomorrow.','Probably.',(b,t)=>{t.happy-=want(b,'photos')?5:0})]})},
};
const DIL_MAX=2;

// ---- the trip ----
function tripStart(b){
  const T=TRIPS[b.type],m=tod(),late=Math.max(0,m-b.start),r=Math.random;
  if(m<b.start) pass(b.start-m);
  const t={id:b.id,late,step:0,steps:['spot'],q:0,happy:0,notes:[],x:[],lost:0,fuelx:0,exK:0,exC:0,rel:0,nofish:0,spot:null,shot:false,taught:false};
  if(late>15){t.happy-=Math.round(late/4);t.notes.push(`⏰ You rolled in ${late} minutes late. ${Nm(b)} noticed.`)}
  if(S.gear<=0){t.happy-=4;t.notes.push('🪝 You’re out of tackle. They fish with what’s left in the bottom of the box.')}
  if(T.bait&&S.bait<=0){t.happy-=3;t.notes.push('🐟 No herring on ice. Mooching without bait means jigging a Buzz Bomb instead.')}
  if(S.boatChk===day()) t.happy+=2;
  if(S.boat<50&&r()<(50-S.boat)/80*(S.boatChk===day()?.5:1)){const mm=40+Math.floor(r()*40),c=rp(60);lose(t,mm);t.happy-=10;fx(t,-c,'Roadside repair');adj('boat',6);
    t.notes.push(`🔧 The kicker quits off Owen Beach. ${mm} minutes with the cowling off and ${$(c)} in parts from your spares. Get the boat to the shop in Gig Harbor.`)}
  // the dilemmas: forced ones first (kids, closures, the party's wants), then the shuffled pool
  const want=b.type==='troll'?3:2,keys=Object.keys(DIL),ok=k=>(S.dil[k]||0)<DIL_MAX&&DIL[k].cond(b,t);
  const forced=keys.filter(k=>DIL[k].force&&DIL[k].force(b)&&ok(k)),pool=keys.filter(k=>!forced.includes(k)&&ok(k)),dl=forced.slice(0,want);
  while(dl.length<want&&pool.length) dl.push(pool.splice(Math.floor(r()*pool.length),1)[0]);
  dl.forEach(k=>{S.dil[k]=(S.dil[k]||0)+1});
  t.steps.push(...dl.sort(()=>r()-.5));
  S.stats.seen[b.type]=(S.stats.seen[b.type]||0)+1;
  S.trip=t;sfx('whoosh');tripNext();
}
function spotStep(b,t){
  const T=TRIPS[b.type],w=trWater(day());
  const keys=SPOT_KEYS.filter(k=>b.type==='coho'?SPOTS[k].c>=.6:SPOTS[k].k>=.5||k==='owen');
  return {t:`${T.ic} Where to, Captain?`,fixed:true,b:`<p>${T.long}</p><p>${Nm(b)} are aboard and the coffee is poured. Wind ${w.wind} kt. ${scouted()?'🔭 You scouted yesterday: these reads are sharp.':'🐟 Reads from the docks and the radio. Scouting the Slag Pile the day before sharpens them.'}</p>`,
    o:keys.map(k=>{const s=SPOTS[k],wd=spotWord(spotRead(k)),lean=s.k*T.k>s.c*T.c?'kings':'coho';
      return O(`${spotIc(wd)} ${s.n} · ${wd}`,`${s.sub}. Leans ${lean}.${s.calm>=.8?' Calm water.':s.calm<.4?' Rough in wind.':''}${s.fuel?` +${s.fuel} gal.`:''}`,(b,t)=>{
        t.spot=k;t.fuelx+=s.fuel;t.notes.push(`📍 ${s.n}: ${s.txt}`);S.stats.seen['spot_'+k]=true;
        if(k==='narrows'&&w.wind>=10&&Math.random()<.4){t.happy-=6;adj('boat',-3);t.notes.push('🌊 Wind against a four-knot ebb under the bridges. Everybody holds on; one rod goes over the side.');fx(t,-rp(90),'A rod and reel lost in the Narrows')}})})};
}
function tripNext(){
  const t=S.trip;if(!t) return;
  const b=bkOf(t.id);if(!b||b.status!=='booked'){S.trip=null;return}
  if(t.step>=t.steps.length) return tripEnd(b,t);
  const key=t.steps[t.step],v=key==='spot'?spotStep(b,t):DIL[key]?DIL[key].f(b,t):null;
  if(!v){t.step++;return tripNext()}
  const opts=v.o.slice();
  if(!v.fixed) for(let i=opts.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[opts[i],opts[j]]=[opts[j],opts[i]]}
  const T=TRIPS[b.type],n=t.steps.length;
  const head=`<p class="small-note" style="color:var(--mute);margin:0 0 6px">${T.ic} ${T.n} · ${nm(b)} · step ${t.step+1} of ${n}</p>`;
  const hot=v.o.some(o=>o.legal===false)&&S.stats.viol>0?`<p class="small-note" style="font-size:12.5px;color:var(--warn)">🚔 You’ve broken ${S.stats.viol===1?'a rule':S.stats.viol+' rules'} this season. WDFW knows your boat now.</p>`:'';
  modalSwap(v.t,head+v.b+hot,opts.map(o=>({l:o.l,s:o.s,legal:o.legal!==false,np:true,stay:true,fn:()=>{
    const tt=S.trip;if(!tt) return;const bb=bkOf(tt.id);if(!bb){S.trip=null;return}
    o.fn&&o.fn(bb,tt);tt.step++;tripNext()}})),true);
}
// index of the first legal button in the open modal (0 when none is flagged); for the tests and bots
window.legalBtn=()=>{const i=MB.findIndex(b=>b.legal===true&&!b.dis);return i<0?0:i};

function rollCatch(b,t){
  const T=TRIPS[b.type],w=trWater(day()),s=SPOTS[t.spot||'slag'],r=Math.random;
  let q=w.sp[t.spot||'slag']+t.q+(S.gear>0?0:-.15)+(T.bait?(S.bait>0?.05:-.18):(S.bait>0&&b.type==='troll'?.03:0))
    +Math.min(.1,S.stats.trips*.008)*(DF().craft==null?1:DF().craft)+(S.boat<40?-.08:0)+(S.energy<25?-.08:0)+(w.wind>=14?-.05:0)+(r()-.5)*.2;
  q=clamp(q,.05,1.1);
  const kW=s.k*T.k*w.run.k,cW=s.c*T.c*w.run.c,pk=kW/(kW+cW),open=chinookOpen();
  const lam=(.6+2.8*q)*Math.sqrt(T.len/300),fishers=Math.max(0,b.party.n-t.nofish);
  let K=0,C=0,rel=0,wild=0,short=0,hooked=0,limits=0;
  for(let i=0;i<fishers;i++){
    const enc=Math.max(0,Math.round(lam*(.5+r())));let k=0,c=0;
    for(let e=0;e<enc;e++){
      if(r()>.72) continue;                       // barbless: some come unbuttoned at the boat
      hooked++;
      if(r()<pk){const clip=r()<.62,size=r()<.78;
        if(open&&clip&&size&&k<KING_BAG&&k+c<BAG) k++; else {rel++;if(!clip)wild++;else if(!size)short++}}
      else{if(k+c<BAG) c++; else rel++}
    }
    K+=k;C+=c;if(k+c>=BAG) limits++;
  }
  return {q,K,C,rel:rel+t.rel,wild,short,hooked,limits,fishers};
}
function tripEnd(b,t){
  const T=TRIPS[b.type],w=trWater(day()),s=SPOTS[t.spot||'slag'],P=partyTpl(b),r=Math.random;
  const c=rollCatch(b,t);
  // fuel: run dry and TowBoatUS brings you home
  const gal=Math.round((T.fuel+t.fuelx+(r()-.3)*2)*(1+Math.max(0,w.wind-12)/40)*10)/10;let towed=false;
  if(S.fuel>=gal){S.fuel=Math.round((S.fuel-gal)*10)/10;S.stats.fuelGal=Math.round((S.stats.fuelGal+gal)*10)/10}
  else{towed=true;S.stats.fuelGal=Math.round((S.stats.fuelGal+S.fuel)*10)/10;S.fuel=0;const tw=rp(350);fx(t,-tw,'TowBoatUS tow');t.happy-=20;adj('rep',-3);lose(t,60);
    t.notes.push(`🛟 The engine coughs and quits off ${s.n}: out of gas. TowBoatUS takes an hour to get there and ${$(tw)} to drag you home. Fuel up at the dock next time.`)}
  const kept=c.K+c.C+t.exK+t.exC,frac=c.fishers?Math.min(1,(c.K+c.C)/(BAG*c.fishers)):0;
  // what they came for
  let h=51+(DF().mood||0)+b.party.mood+t.happy+frac*28+clamp((S.boat-65)/8,-3,3),good=[],bad=[];
  const wnt=b.party.want;
  if(wnt==='limit'){if(c.fishers&&c.limits>=c.fishers){h+=10;good.push('limits for everyone')}else if(frac<.5){h-=8;bad.push('the cooler was light')}}
  if(wnt==='king'){if(c.K+t.exK){h+=12;good.push('a king in the box')}else if(c.rel&&c.hooked){h-=3;bad.push('kings released, none kept')}else{h-=10;bad.push('no kings')}}
  if(wnt==='kids'){if(c.hooked>=c.fishers*2){h+=9;good.push('the kids never stopped reeling')}else{h-=6;bad.push('the kids got bored')}}
  if(wnt==='photos'){if(t.shot||s.scenic>=.8){h+=7;good.push('the photos')}else{h-=3;bad.push('nothing much to photograph')}}
  if(wnt==='calm'){if(s.calm>=.7&&w.wind<11){h+=8;good.push('glassy water')}else if(s.calm<.45||w.wind>=14){h-=10;bad.push('a rough ride')}}
  if(wnt==='learn'){if(t.taught||b.type==='mooch'){h+=t.taught?6:3;good.push('learning to mooch')}else{h-=4;bad.push('not much teaching')}}
  if(towed) bad.push('running out of gas');
  if(t.late>15) bad.push('a late start');
  h=clamp(h,0,110);
  const stars=h>=84?5:h>=69?4:h>=54?3:h>=40?2:1;
  const tip=Math.round(b.price*clamp((h-55)/120,0,.25)*(P.tipK||1));
  const refund=h<35?Math.round(b.price*.15):0,due=b.price-b.dep-refund;
  const xnet=t.x.reduce((a,[,v])=>a+v,0),xpos=t.x.reduce((a,[,v])=>a+Math.max(0,v),0),xneg=-t.x.reduce((a,[,v])=>a+Math.min(0,v),0);
  money(due+tip+xnet);
  const st=S.stats;st.trips++;st.clients+=b.party.n;st.fish+=kept;st.chinook+=c.K+t.exK;st.coho+=c.C+t.exC;st.earned+=b.price-refund;st.tips+=tip+xpos;st.spent+=xneg;
  // wear and tear
  pass(T.len+t.lost);
  adj('energy',-T.energy-Math.round(t.lost/20));
  adj('boat',-Math.round((2+r()*3)*(b.type==='troll'?1.4:1)*(DF().wear||1)));
  S.gear=Math.max(0,S.gear-1);
  if(T.bait&&S.bait>0) S.bait--; else if(b.type==='troll'&&S.bait>0) S.bait--;
  S.unlogged++;
  adj('rep',clamp(Math.round((h-55)/7),-6,6));
  b.status='done';
  // the review, in their words
  const rv=reviewOf(b,t,c,stars,good,bad);
  S.reviews.push(rv);if(S.reviews.length>200)S.reviews.splice(0,S.reviews.length-200);
  b.out={stars,fish:kept,tip,happy:Math.round(h)};
  S.trip=null;
  const line=`${c.K+t.exK} king${c.K+t.exK===1?'':'s'}, ${c.C+t.exC} coho kept${c.rel?`, ${c.rel} released`:''}${c.limits?` · ${c.limits} limit${c.limits>1?'s':''}`:''}`;
  say(`${T.ic} ${T.n} with ${nm(b)}: ${line}. Paid ${$(b.price-refund)} + ${$(tip+xpos)} in tips. ${'★'.repeat(stars)}${'☆'.repeat(5-stars)}`);
  const row=(l,v)=>`<div style="display:flex;justify-content:space-between;font-size:14px;padding:2px 0"><span>${l}</span><b>${v<0?'−':''}${$(Math.abs(v))}</b></div>`;
  const mood=h>=84?'😁 They’re already asking about next August.':h>=69?'🙂 Handshakes and fish photos at the dock.':h>=54?'😐 Polite thanks.':h>=40?'😕 They leave a little deflated.':'😠 Tight-lipped goodbyes.';
  const rel=c.wild||c.short?` <span style="font-size:13px;color:var(--mute)">(${[c.wild&&`${c.wild} wild king${c.wild>1?'s':''}`,c.short&&`${c.short} under ${MIN_KING}″`].filter(Boolean).join(', ')} released${chinookOpen()?'':'; Chinook retention is closed'})</span>`:'';
  const body=`${t.notes.map(n=>`<p style="font-size:14px;margin:4px 0">${n}</p>`).join('')}
    <p>🐟 <b>${line}</b>${rel}</p><p>${mood}</p>
    <div style="margin:8px 0;padding:8px;border:1px solid var(--line);border-radius:8px">${row('Fare (deposit already paid)',b.price-b.dep)}${refund?row('Partial refund',-refund):''}${row('Tip',tip)}${t.x.map(([why,v])=>row(why,v)).join('')}${row('In your pocket today',due+tip+xnet)}</div>
    ${reviewHTML(rv)}<p style="font-size:12.5px;color:var(--mute)">⛽ ${towed?'Tank empty':`${gal} gal burned, ${S.fuel} left`} · 🔧 boat ${S.boat} · ⚡ ${S.energy} · 🪝 tackle ×${S.gear} · 📓 ${S.unlogged} catch record${S.unlogged>1?'s':''} to log</p>`;
  sfx(stars>=4?'good':stars<=2?'bad':'info');
  modalSwap(`⚓ Back at the dock · ${'★'.repeat(stars)}${'☆'.repeat(5-stars)}`,body,[{l:'Tie up and hose down the boat',fn:()=>{}}]);
}

// ---- reviews ----
const RV_OPEN={5:['Best day on the water we’ve ever had.','Book Captain {{name}}. Just do it.','Absolute legend of the Grit City.'],
  4:['Great trip, would go again.','Solid captain, knows the water.','A really good morning on the Sound.'],
  3:['It was fine.','Decent trip, nothing special.','Mixed bag.'],
  2:['Not what we paid for.','Disappointing.','Meh.'],1:['Save your money.','Never again.','One star is generous.']};
function reviewOf(b,t,c,stars,good,bad){
  const s=SPOTS[t.spot||'slag'],bits=[pick(RV_OPEN[stars])];
  if(good.length) bits.push(`Loved ${good.slice(0,2).join(' and ')}.`);
  if(c.K+t.exK) bits.push(pick([`Kings at ${s.n}!`,`My first Puget Sound king.`,`The king fought like a freight train.`]));
  else if(c.C+t.exC) bits.push(pick(['Silvers jumping all over.','Coho on the hoochies, so fun.','Fresh coho on the grill tonight.']));
  if(bad.length) bits.push(`${stars>=4?'Only gripe:':'Problem:'} ${bad.slice(0,2).join(', ')}.`);
  if(stars>=4&&Math.random()<.4) bits.push(pick(['The mountain was out.','We even liked the Tacoma Aroma.','Got Frisko Freeze after. Perfect day.','Saw a seal steal someone else’s fish.']));
  return {day:day(),who:b.party.name,type:b.type,stars,text:bits.join(' ')};
}
const reviewHTML=rv=>`<div class="review" style="border-left:3px solid var(--mute);padding:4px 10px;margin:8px 0"><b aria-label="${rv.stars} of 5 stars">${'★'.repeat(rv.stars)}${'☆'.repeat(5-rv.stars)}</b> <i>“${rv.text}”</i><br><span style="font-size:12.5px;color:var(--mute)">— the ${rv.who}, ${trD(rv.day)}</span></div>`;
function ratingAvg(){const r=(S&&S.reviews||[]).slice(-20);return r.length?Math.round(r.reduce((a,x)=>a+x.stars,0)/r.length*100)/100:null}

// ---- no-shows ----
function noShow(b,notes,why){
  b.status='noshow';money(-b.dep);S.stats.noshow++;adj('rep',-8);
  const l=`📵 ${why||`You never made it to ${nm(b)}’s ${TRIPS[b.type].n.toLowerCase()}.`} You refund the ${$(b.dep)} deposit. Rep −8, and they tell everyone.`;
  if(notes) notes.push(l); else say(l);
}

// ---- actions ----
function marinaActions(){
  const d=day(),m=tod(),a=[];
  if(S.trip&&bkOf(S.trip.id)) a.push({ic:'🛶',l:'Back to the trip',s:'Your party is still aboard.',cat:'trip',cls:'primary',fn:()=>tripNext()});
  else for(const b of todaysTrips(d)){
    const T=TRIPS[b.type],late=m-b.start,need=T.fuel;
    if(late>WINDOW_LATE) a.push({ic:'📵',l:`${Nm(b)} have gone home`,s:`Their ${fmt(b.start)} ${T.n.toLowerCase()}. Refund the ${$(b.dep)} deposit.`,cat:'trip',cls:'danger',fn:()=>noShow(b,null,`${Nm(b)} waited two hours and went home.`)});
    else if(m<b.start-WINDOW_EARLY) a.push({ic:T.ic,l:`${T.n}: ${nm(b)} at ${fmt(b.start)}`,s:`They arrive about ${fmt(b.start-30)}. You can launch from ${fmt(b.start-WINDOW_EARLY)}.`,cat:'trip',dis:true,fn:()=>{}});
    else a.push({ic:T.ic,l:`Launch: ${T.n} with ${nm(b)}`,cls:'primary',cat:'trip',
      s:`${b.party.n} aboard, ${fmt(b.start)}–${fmt(endOf(b))}. ${late>15?`⏰ ${late} min late. `:''}Wants ${WANTS[b.party.want]}.${S.fuel<need?` ⚠️ Only ${S.fuel} gal: you need ~${need}+.`:''}${S.gear<1?' ⚠️ No tackle.':''}${T.bait&&S.bait<1?' ⚠️ No herring.':''}`,
      fn:()=>tripStart(b)});
  }
  const fuelOpen=m>=FUEL_HRS[0]&&m<FUEL_HRS[1],room=Math.round((TANK-S.fuel)*10)/10,gp=r2(GAS*(DF().cost||1));
  const buy=g=>{g=Math.min(g,room);const c=r2(g*gp);spend(c);S.fuel=Math.round((S.fuel+g)*10)/10;pass(15);say(`⛽ ${g} gallons at ${$(gp)} a gallon: ${$(c)}. The tank shows ${S.fuel} of ${TANK}.`)};
  a.push({ic:'⛽',l:`Fill the tank — ${$(r2(room*gp))}`,s:fuelOpen?`${room} gal at ${$(gp)}/gal. Tank ${S.fuel}/${TANK}.`:`The fuel dock is open ${fmt(FUEL_HRS[0])}–${fmt(FUEL_HRS[1])}.`,cat:'work',cls:S.fuel<10&&fuelOpen?'primary':'',dis:!fuelOpen||room<1||!canAfford(r2(room*gp)),fn:()=>buy(room)});
  if(room>=10) a.push({ic:'⛽',l:`Ten gallons — ${$(r2(10*gp))}`,s:'Enough for a half-day and change.',cat:'work',dis:!fuelOpen||!canAfford(r2(10*gp)),fn:()=>buy(10)});
  if(S.boatChk!==d) a.push({ic:'🔍',l:'Check the boat',s:`20 min. Hoses, impeller, battery, bilge. Boat ${S.boat}.`,cat:'work',fn:()=>{
    S.boatChk=d;pass(20);
    if(S.boat<60&&Math.random()<.7){const c=rp(40);spend(c);adj('boat',8);say(`🔍 A cracked fuel line fitting and a weepy hose clamp. ${$(c)} of parts from the marina store and it’s fixed. Boat ${S.boat}.`)}
    else{adj('boat',2);say(pick(['🔍 Bilge dry, battery strong, impeller good. You tighten a clamp on principle.','🔍 You grease the trailer hubs, check the kicker and top off the oil. All good.','🔍 Everything checks out. A seal watches you work from the next slip.']))}}});
  return a;
}
function homeTripActions(){
  if(!S.unlogged) return [];
  return [{ic:'📓',l:`Fill in the logbook (${S.unlogged} trip${S.unlogged>1?'s':''})`,s:`${S.unlogged*15} min. Catch records, charter logbook, the eCRC upload.`,cat:'work',cls:S.unlogged>=2?'primary':'',
    fn:()=>{pass(S.unlogged*15);say(`📓 ${S.unlogged} trip${S.unlogged>1?'s':''} logged: dates, areas, species, clips. The kitchen table looks like a fisheries office.`);S.unlogged=0}}];
}

// ---- morning and night (called from STORY) ----
function tripsMorning(d){
  const seed=!S.water||!S.water[0];
  trWater(d);if(d+1<GAME.days) trWater(d+1);
  if(seed&&d===0){
    // the season's first bookings: some on the calendar before you start
    [[0,'coho'],[1,'mooch'],[2,'troll'],[4,'mooch'],[5,'troll'],[8,'coho']].forEach(([dd,type])=>{
      const T=TRIPS[type];if(overlaps(dd,T.start,type)) return;
      const {party}=makeParty(Math.random()<.2?'rich':null);
      const b={id:S.nextId++,day:dd,start:T.start,type,party,price:T.pp*party.n,status:'booked'};b.dep=Math.round(b.price*DEP);S.book.push(b)});
    queueRequest('seed',1);queueRequest('seed',2);
    return;
  }
  if(d>=GAME.days-1) return;
  const ra=ratingAvg(),p=clamp(.5*(DF().book||1)*(1+(S.rep-50)/100)+(ra?(ra-3.5)*.15:0),.15,.9);
  let n=0;for(let i=0;i<2;i++) if(Math.random()<p&&queueRequest(null)) n++;
  if(n) say(`📞 ${n} new booking request${n>1?'s':''} on 📅 Bookings.`);
}
function tripsNight(notes,d){
  // missed trips
  (S.book||[]).filter(b=>b.day===d&&b.status==='booked').forEach(b=>noShow(b,notes));
  // requests that lapsed
  const gone=(S.reqs||[]).filter(q=>q.exp<=d||q.r.day<=d);
  S.reqs=(S.reqs||[]).filter(q=>!gone.includes(q));
  gone.forEach(q=>notes.push(`📞 The ${q.r.who} didn’t hear back and booked another boat.`));
  // herring spoils at the end of the day after it was bought
  if(S.bait>0&&S.baitDay!=null&&d>=S.baitDay+1){notes.push(`🐟 ${S.bait} tray${S.bait>1?'s':''} of herring went soft. Into the crab pot it goes.`);S.bait=0}
  // the logbook
  if(S.unlogged>=2){
    if(Math.random()<Math.min(.5,.07*S.unlogged*DF().enforce)){const t={notes};cite(t,'charter logbook and catch records not filled in',200,true)}
    else notes.push(`📓 ${S.unlogged} trips not logged yet. WDFW spot-checks charter logbooks.`);
  }
  if(d===CHINOOK_LAST) notes.push('🚫 WDFW emergency rule: starting tomorrow (Aug 15), Chinook retention is closed in Marine Area 11. Coho only; release every king.');
}

// ---- views ----
const kv=(a,b)=>`<div class="kv" style="display:flex;justify-content:space-between;gap:10px;padding:6px 0;border-bottom:1px solid var(--line);font-size:14px"><span>${a}</span><b style="text-align:right">${b}</b></div>`;
function bookingsView(){
  const d=day();let h='';
  const rs=S.reqs||[];
  if(rs.length) h+=`<div class="sect">📞 Booking requests · ${rs.length} waiting</div>`+rs.map(q=>`<div class="req"><div class="rb">${reqBody(q)}</div>${reqOpts(q).map((o,k)=>`<button class="act" ${o.dis?'disabled':''} onclick="tripReq(${q.id},${k})"><span class="tx"><b>${o.l}</b>${o.s?'<span>'+o.s+'</span>':''}</span></button>`).join('')}</div>`).join('');
  const ra=ratingAvg();
  h+=`<div class="sect">📅 Schedule · ${ra?`★ ${ra.toFixed(2)} from ${Math.min(20,S.reviews.length)} reviews`:'no reviews yet'}</div>`;
  let any=false;
  for(let i=d;i<GAME.days;i++){
    const bs=(S.book||[]).filter(b=>b.day===i&&b.status!=='cancelled').sort((x,y)=>x.start-y.start);if(!bs.length) continue;any=true;
    h+=`<div class="todo"><span class="ck">${i===d?'👉':'·'}</span><div><b>${trD(i)}${i===d?' (today)':''}</b>${bs.map(b=>{const T=TRIPS[b.type];
      const st=b.status==='done'?` ✅ ${'★'.repeat(b.out?b.out.stars:0)}`:b.status==='noshow'?' 📵 missed':'';
      return `<span>${T.ic} ${fmt(b.start)} ${T.n} · the ${b.party.name} (${b.party.n}) · ${$(b.price)}${st}<br><i style="font-size:12.5px">wants ${WANTS[b.party.want]}</i></span>`}).join('')}</div></div>`;
  }
  if(!any) h+='<div class="rules">Nothing on the calendar. Requests come in each morning, and from people you meet on the pier, at the bar on the Foss and in Gig Harbor.</div>';
  const past=(S.book||[]).filter(b=>b.day<d&&b.status!=='booked').length;
  if(past) h+=`<p class="small-note" style="font-size:12.5px;color:var(--mute)">${past} earlier booking${past>1?'s':''} in the log.</p>`;
  const rv=(S.reviews||[]).slice(-5).reverse();
  if(rv.length) h+=`<div class="sect">⭐ Latest reviews</div>`+rv.map(reviewHTML).join('');
  return h;
}
function fishView(){
  const d=day(),w=trWater(d),sc=scouted(d);
  const tides=w.tides.map(x=>`${x.hi?'▲':'▼'} ${fmt(x.m)} ${x.ft.toFixed(1)}′`).join(' · ');
  let h=`<div class="sect">🌊 Marine Area 11 · ${trD(d)}</div>`+kv('Wind',`${w.wind} kt${w.wind>=14?' · choppy, stay tucked in':w.wind<=6?' · flat calm':''}`)+kv('Tides (Tacoma)',tides)+
    kv('Run',`Kings ${w.run.k>=.9?'strong':w.run.k>=.75?'steady':'thinning'} · coho ${w.run.c>=1?'pouring in':w.run.c>=.8?'building':'early'}`)+
    kv('Chinook',chinookOpen(d)?`open: 1 hatchery king, ${MIN_KING}″+, through Aug 14`:'retention closed (since Aug 15): release')+kv('Coho','open, part of the 2-salmon limit');
  h+=`<div class="sect">📍 Spots today ${sc?'· 🔭 scouted, exact':'· dock talk, roughly right'}</div>`;
  SPOT_KEYS.map(k=>[k,spotRead(k,d)]).sort((a,b)=>b[1]-a[1]).forEach(([k,q])=>{const s=SPOTS[k],wd=spotWord(q);
    h+=`<div class="todo"><span class="ck">${spotIc(wd)}</span><div><b>${s.n} · ${wd}</b><span>${s.sub}. ${s.txt}${s.k>s.c?' Kings.':' Coho.'}${s.fuel?` +${s.fuel} gal.`:''}</span></div></div>`});
  if(d+1<GAME.days){const w2=trWater(d+1);h+=`<p class="small-note" style="font-size:12.5px;color:var(--mute)">Tomorrow: wind ~${w2.wind} kt. ${S.scout===d+1?'🔭 You’ve scouted it.':'Scout the Slag Pile from Ruston Way for a sharper read.'}</p>`}
  return h;
}
function regsView(){
  const li=x=>`<li style="margin:4px 0">${x}</li>`;
  return `<div class="sect">📖 Marine Area 11 salmon · August 2026</div><div class="rules"><ul style="padding-left:18px;margin:4px 0">
  ${li(`<b>Season:</b> hatchery Chinook open Jul 23 – Sep 30; coho (wild or hatchery) open Jul 23 – Nov 15.`)}
  ${li(`<b>Daily limit:</b> ${BAG} salmon, no more than ${KING_BAG} Chinook. Release chum.`)}
  ${li(`<b>Chinook:</b> hatchery only (adipose fin clipped). A king with its adipose fin is wild: release it. Minimum size <b>${MIN_KING} inches</b>. Coho have no minimum.`)}
  ${li(`<b>Emergency rule, Aug 15:</b> Chinook retention closes in Marine Area 11 (release all Chinook) through Sep 30.`)}
  ${li(`<b>Commencement Bay</b> (east of Cliff House to Sperry Ocean Dock) was closed to salmon through Jul 31 and reopened Aug 1 with the same limits.`)}
  ${li(`<b>Barbless:</b> single-point barbless hooks for salmon in Marine Areas 1–13.`)}
  ${li(`<b>Catch record card:</b> every angler records each salmon right after landing it (paper or the eCRC on the Fish Washington app). Once a fish is kept, it stays kept: no high-grading.`)}
  ${li(`<b>Licenses:</b> each angler needs a Washington fishing license. You need your charter license, a registered vessel and your USCG license: an OUPV “six-pack” carries <b>${SIXPACK} passengers</b> at most.`)}
  ${li(`<b>On the water:</b> kids 12 and under wear life jackets underway; stay 1,000 yards from Southern Resident orcas; no wake in marked zones; never run the boat after drinking; give treaty fishing nets room.`)}
  ${li(`<b>Year-round piers</b> (Les Davis Pier, the Point Defiance Boathouse Dock) have their own rules.`)}
  </ul><p style="font-size:13px"><b>Enforcement:</b> WDFW officers and the Coast Guard board boats. Three citations and your charter license is gone.</p>
  <p style="font-size:12.5px;color:var(--mute)">⚠️ A game summary, simplified. Seasons change on short notice by emergency rule. Before you fish for real, check the current Washington Sport Fishing Rules and emergency rules at <a href="https://wdfw.wa.gov" target="_blank" rel="noopener">wdfw.wa.gov</a> or the Fish Washington app.</p></div>`;
}
