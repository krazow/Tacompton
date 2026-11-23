// ============================================================
//  TACOMPTON · LIFE EVENTS: everyday setbacks, each one softened by a habit or a purchase you chose ahead of time.
//  The owner's list: on the way to work, money and home, people, and Growing Up's kid-sized versions. Every event offers 2–3
//  choices in the moment (03-events.js choices API: choices/dflt/urgent), and what you set up earlier changes how it lands:
//    🚌 Sit up front on the bus (a standing preference, toggled at the Hilltop Link stop)  → a wallet thief gets $15, not $60
//    🤐 Phone in a zipped pocket (a habit, toggled at home)                                → the grab at the Link stop fails
//    📦 The corner market's pickup locker                                                  → no package on the porch to lose
//    ⏰ Leaving 10 minutes early / 🗺️ knowing the T Line route                              → a broken-down bus doesn't make you late
//    ☂️ umbrella · 🔦 flashlight & batteries · 🔋 jumper cables (corner market on MLK)       → rain, a power outage, a neighbor's dead battery
//    🫙 the savings jar at home (deposit / withdraw)                                        → the fridge repair, a ride to the ER
//    📱 the block club group chat (meet 5 neighbors) · 🗳️ the block club meeting (Thursday evenings at People's)
//    🧹 Nothing on the seats + 💡 parking under the streetlight (habits, toggled at home once you own a car) → no broken window
//  Growing Up: 🔒 a bike lock, 🧥 lunch money in an inside pocket, 🤝 walking to the stop with a friend, 🗺️ the Link route map.
//  Robbery stays rare and happens in the wider city (the Dome District, a crowded game-day bus), never on Hilltop's own streets.
//  Quick play gets fewer and lighter ones (at most 4 a game, one of each, smaller losses); the longer games space them out
//  (cooldowns of weeks, and never two life events within two days).
//  State: S.lev (made on first use, so older saves just work). Flags for the chains go through eventFlag()/setEventFlag().
// ============================================================
(function(){
const LV=()=>S.lev||(S.lev={inv:{},jar:0,front:false,zip:false,locker:false,route:false,chat:0,club:-99,tenant:false,kpocket:false,kmap:false,buddy:false});
const flag=k=>typeof eventFlag==='function'?eventFlag(k):(S.ev.flags||{})[k];
const setFlag=(k,v)=>{if(typeof setEventFlag==='function')setEventFlag(k,v);else (S.ev.flags=S.ev.flags||{})[k]=v};
const long=()=>lifeLong();
const pre=k=>typeof eraHas==='function'&&!eraHas(k);          // a start year before this thing existed (63-era.js)
const lite=v=>long()?v:Math.max(1,Math.round(v*0.7));          // Quick play: lighter losses
const out=k=>!!hoodOf(k);                                       // a place in the wider city (off Hilltop)
const has=k=>!!LV().inv[k];
// time passes only while the decision is still today's (a default applied at night doesn't push past midnight)
const later=(id,m)=>{if(S.ev.last[id]===day()&&tod()+m<1400)pass(m)};
const lose=v=>{const x=Math.max(0,Math.min(S.money,v));money(-x);return x};
// the savings jar pays first, then your wallet
const canPay=c=>LV().jar+S.money>=c;
function payJar(c){const L0=LV(),j=Math.min(L0.jar,c);L0.jar-=j;if(c-j>0)spend(c-j);return j}
const jarTxt=c=>{const j=LV().jar;return j>=c?'The savings jar covers all of it.':j>0?`The jar covers ${$(j)}, your wallet the rest.`:'From your wallet: the jar is empty.'};

// ---- the events: one wrapper per mode, with Quick play's limits and the longer games' spacing ----
const IDS=[];
const firedAll=()=>IDS.reduce((t,id)=>t+(S.ev.count[id]||0),0);
const recent=()=>IDS.some(id=>S.ev.last[id]!=null&&day()-S.ev.last[id]<(long()?2:1));
function gate(id){if(recent())return false;if(!long()&&(firedAll()>=4||(S.ev.count[id]||0)>=1))return false;return true}
function ev(e,grow){
  if(!e.chain)IDS.push(e.id);
  const c=e.cond,ch=e.chance;
  defEvent(Object.assign({cooldown:28,max:4},e,{
    chance:ctx=>(typeof ch==='function'?ch(ctx):ch)*(long()?1:0.6),
    cond:ctx=>(grow?isGrow():!isGrow())&&!!S&&(e.chain||gate(e.id))&&(!c||c(ctx))}));
}
const aev=e=>ev(e,false),gev=e=>ev(e,true);

// ================= ON THE WAY TO WORK (adult) =================
// a wallet thief on a crowded bus, out in the wider city: the Dome District, or a game-day bus on the weekend
const busy=c=>{if(!c.from||!c.to||(window.CAR&&CAR.driving()))return false;const a=hoodOf(c.from),b=hoodOf(c.to);if(a===b)return false;
  if(a==='downtown'||b==='downtown')return true;
  const h=a||b;return !!h&&/Bus/.test(HOODS[h].ride.via)&&day()%7>=5};
aev({id:'lev_wallet',hook:'travel',tile:['👛','A hand in your pocket','bad'],chance:0.035,bad:true,cooldown:45,max:2,urgent:true,
  cond:c=>busy(c)&&tod()>=480&&tod()<1290,
  run:c=>{const L0=LV(),dome=hoodOf(c.to)==='downtown'||hoodOf(c.from)==='downtown';
    const got=lose(rp(lite(L0.front?15:60)));S.ev.flags.levWallet=got;
    say(`👛 ${dome?'The bus out of the Tacoma Dome Station is packed shoulder to shoulder with jerseys after the game':'A crowded weekend bus, standing room only'}. Somewhere between two stops your wallet is gone. ${L0.front?`You were sitting up front by the driver like always, so the thief only got at your jacket pocket: ${$(got)} in loose bills. The driver saw a guy hop off at the last stop and calls it in.`:`You were in the crowd by the back doors. ${$(got)} cash, your ID, your bank card. Next time, the seats up front by the driver are the safe ones.`}`)},
  choices:()=>[
    {ic:'🚨',l:'Report it to transit security at the station',s:'40 min, energy −5. Wallets often turn up without the cash.',fn:()=>{later('lev_wallet',40);adj('energy',-5);adj('stress',-4);
      say('🚨 The officer at the station takes your report, and an hour later a call: your wallet was in a bin by the platform. Cash gone, but your ID and cards are all there. Stress −4.')}},
    {ic:pre('phoneBank')?'☎️':'📱',l:pre('phoneBank')?'Call the bank’s card line from a pay phone and move on':'Freeze your card from your phone and move on',s:`5 min, stress +6. A replacement ID costs about ${$(rp(20))}.`,fn:()=>{later('lev_wallet',5);adj('stress',6);spend(rp(20));
      say(`${pre('phoneBank')?'☎️ A quarter, a long hold and a tired voice: card canceled before the next stop.':'📱 Card frozen before the next stop.'} The ID is another story: ${$(rp(20))} and a morning at the licensing office, some other day.`)}},
    {ic:'😮‍💨',l:'Let it go for today',s:'No time lost. Stress +10, and the ID still needs replacing.',fn:()=>{adj('stress',10);spend(rp(20));
      say('😮‍💨 You let it go. It sits in your stomach the rest of the day anyway, and the new ID costs what it costs.')}},
  ],dflt:2});

// a phone grabbed at the Link stop downtown: a zipped pocket and the grab fails
aev({id:'lev_phone',hook:'arrive',tile:['📱','A grab at the Link stop','bad'],chance:0.04,bad:true,cooldown:45,max:2,urgent:true,
  cond:c=>['dt_pacific','dt_dome'].includes(c.at)&&c.from&&!out(c.from)&&!(window.CAR&&CAR.driving())&&tod()>=600&&tod()<1320,
  run:c=>{const z=LV().zip;
    if(pre('cell')){S.ev.flags.levPhone=z?'safe':'wallet';const x=z?0:lose(rp(lite(25)));
      say(z?'👛 Stepping off the bus downtown, a guy brushes past and a hand tugs at your jacket. It finds a zipper, gives up, and he is gone into the crowd. Your wallet is right where you put it.'
        :`👛 Stepping off the bus downtown, you’re reading the schedule on the pole when a guy on a bike snatches your wallet out of your back pocket and is gone down the block before you can shout. ${$(x)} cash and your bus pass. A zipped inside pocket would have made it a lot harder.`);return}
    S.ev.flags.levPhone=z?'safe':'gone';
    say(z?'📱 Stepping off the T Line, a guy brushes past and a hand tugs at your jacket. It finds a zipper, gives up, and he is gone into the crowd. Your phone is right where you put it.'
      :'📱 Stepping off the T Line, you’re reading a text when a guy on a bike snatches the phone out of your hand and is gone down the block before you can shout. A zipped pocket would have made it a lot harder.')},
  choices:()=>pre('cell')?(LV().zip?[
    {ic:'👮',l:'Tell the transit cop at the stop',s:'15 min. Stress −4: it helps to say it out loud.',fn:()=>{later('lev_phone',15);adj('stress',-4);say('👮 The officer thanks you, radios a description to the next bus and tells you the zipped pocket is exactly the right habit.')}},
    {ic:'🚶',l:'Shake it off and keep going',s:'Stress +6.',fn:()=>{adj('stress',6);say('🚶 You keep walking, a little faster, a hand on your pocket the whole way.')}},
  ]:[
    {ic:'🪪',l:`A new ID at the licensing office — ${$(rp(20))}`,s:'45 min. Stress +4. The pass is another day.',dis:S.money<rp(20),fn:()=>{later('lev_phone',45);spend(rp(20));adj('stress',4);LV().zip=true;
      say('🪪 A number, a long bench and a photo that looks like you after a long day. The clerk suggests an inside pocket. You take the advice.')}},
    {ic:'👝',l:`A zip-up pouch at the five-and-dime — ${$(rp(6))}`,s:'20 min. Stress +2. Yours from now on.',dis:S.money<rp(6),fn:()=>{later('lev_phone',20);spend(rp(6));adj('stress',2);LV().zip=true;
      say('👝 A little brown pouch with a zipper that sticks. It rides inside your jacket from now on.')}},
    {ic:'😮‍💨',l:'Go without for a few days',s:'Free. Stress +10, community −2: no pass, no change for the bus.',fn:()=>{adj('stress',10);adj('community',-2);
      say('😮‍💨 You walk more than you planned. A neighbor spots you fare for the bus. It stings more than the money.')}},
  ]):LV().zip?[
    {ic:'👮',l:'Tell the security officer on the platform',s:'15 min. Stress −4: it helps to say it out loud.',fn:()=>{later('lev_phone',15);adj('stress',-4);say('👮 The officer thanks you, radios a description down the line and tells you the zipped pocket is exactly the right habit.')}},
    {ic:'🚶',l:'Shake it off and keep going',s:'Stress +6.',fn:()=>{adj('stress',6);say('🚶 You keep walking, a little faster, a hand on your pocket the whole way.')}},
  ]:[
    {ic:'🛍️',l:`A refurbished phone at the shop on Pacific Ave — ${$(rp(90))}`,s:'45 min. Back online today. Stress +4.',dis:S.money<rp(90),fn:()=>{later('lev_phone',45);spend(rp(90));adj('stress',4);LV().zip=true;
      say('🛍️ A refurbished phone, your number moved over, and the clerk zips it into your inside pocket for you. You keep it there from now on.')}},
    {ic:'🗄️',l:'Dig out your old cracked phone tonight',s:'Free. Stress +8, energy −4: it barely holds a charge.',fn:()=>{adj('stress',8);adj('energy',-4);LV().zip=true;
      say('🗄️ The old phone from the junk drawer, a spiderweb crack across the screen. It works if you keep it plugged in. It lives in a zipped pocket now.')}},
    {ic:'📵',l:'Go without a phone for a few days',s:'Free. Stress +12, community −2: nobody can reach you.',fn:()=>{adj('stress',12);adj('community',-2);
      say('📵 No phone. You miss two texts from neighbors and a call from home. It is quieter, and lonelier, than you expected.')}},
  ],dflt:1});
{const e=EV.find(x=>x.id==='lev_phone'),t0=e&&e.tile;if(e)Object.defineProperty(e,'tile',{configurable:true,enumerable:true,get(){return pre('cell')?['👛','A grab at the bus stop','bad']:t0},set(){}})}

// a package stolen off the porch: the corner market's pickup locker keeps it safe
aev({id:'lev_package',hook:'wake',tile:['📦','The porch is empty','bad'],chance:0.05,bad:true,cooldown:30,max:2,
  cond:()=>day()>0&&S.loc==='home'&&!pre('grocery'),
  run:()=>{const L0=LV();say(L0.locker?'📦 Your new work shoes came yesterday, straight to the pickup locker at the corner market. Two porches down, somebody’s box disappeared overnight. Yours is safe behind a code.'
    :'📦 The tracking says your new work shoes were delivered yesterday afternoon. The porch says otherwise. The corner market has a pickup locker for exactly this.')},
  choices:()=>LV().locker?[
    {ic:'🛒',l:'Grab them from the locker on your way',s:'5 min. Nothing lost.',fn:()=>{later('lev_package',5);adj('stress',-2);say('🛒 Code in, door open, shoes in hand. Grace Kim waves from the register.')}},
    {ic:'🤝',l:'Tell the neighbor about the locker',s:'15 min, energy −2. Community +2.',fn:()=>{later('lev_package',15);adj('energy',-2);adj('community',2);say('🤝 You walk two doors down and tell them about the corner-market locker. They sign up that afternoon and bring you a thank-you muffin.')}},
  ]:[
    {ic:'🧾',l:'File a claim with the store',s:'20 min, stress +4. A replacement ships in a few days.',fn:()=>{later('lev_package',20);adj('stress',4);setFlag('lev_pkg_claim',day());
      say('🧾 Twenty minutes in a chat window with a bot, then a person. A replacement pair is on the way. You send it to the corner-market locker this time.');LV().locker=true}},
    {ic:'👟',l:`A cheap pair at the thrift store on MLK — ${$(rp(25))}`,s:'30 min. Done today. Stress −2.',dis:S.money<rp(25),fn:()=>{later('lev_package',30);spend(rp(25));adj('stress',-2);say('👟 Black, non-slip, barely worn, and a size and a half too big until you add thick socks. They will do.')}},
    {ic:'🪴',l:'Ask Ms. Lorraine if she saw anything',s:'25 min, energy −3. She sees everything, if she knows you.',fn:()=>{later('lev_package',25);adj('energy',-3);
      if(S.community>=20){adj('community',2);adj('stress',-4);say('🪴 “Brown box? The driver left it at the Santos’ by mistake. Tita Rose took it in.” And there it is, on their kitchen table. Community +2.')}
      else{adj('community',1);adj('stress',4);say('🪴 Ms. Lorraine didn’t see, but she will be watching from now on. “Get to know the block,” she says. “The block watches back.”')}}},
  ],dflt:0});
aev({id:'lev_package_back',chain:true,hook:'wake',tile:['📦','The replacement shoes','good'],chance:1,max:3,cooldown:0,
  cond:()=>flag('lev_pkg_claim')!=null&&flag('lev_pkg_claim')!==false&&day()>=flag('lev_pkg_claim')+2,
  run:()=>{setFlag('lev_pkg_claim',null);say('📦 A text from the corner-market locker: your replacement shoes are in. Safe behind a code, the way it should have been the first time.')},
  choices:()=>[
    {ic:'👟',l:'Pick them up on the way to work',s:'10 min. Stress −4.',fn:()=>{later('lev_package_back',10);adj('stress',-4);say('👟 New shoes, laced up on the bench outside the market. Your feet thank you by lunch.')}},
    {ic:'⏳',l:'Leave them in the locker for now',s:'Nothing changes today.',fn:()=>say('⏳ They will keep. The locker holds them for a week.')},
  ],dflt:1});

// the bus breaks down on the way to work: leaving 10 minutes early, or knowing the Link route, keeps you on time
aev({id:'lev_bus',hook:'travel',tile:['🚌','The bus breaks down','bad'],chance:0.06,bad:true,cooldown:21,max:3,urgent:true,
  cond:c=>c.to==='work'&&isShiftDay(day())&&!(day() in S.worked)&&tod()<job().start+30,
  run:()=>{pass(5);const J=job(),left=J.start-tod();S.ev.flags.levBus=left;
    say(`🚌 Halfway up MLK the bus shudders, sighs and dies. Hazards on, everybody off. ${left>=15?`You left early, so you still have ${left} minutes before your shift. No panic.`:left>0?`${left} minutes until your shift at ${J.place}.`:'You’re already late for your shift.'}${LV().route||S.stats.rides>0?' You know the T Line runs two blocks over.':''}`)},
  choices:()=>{const J=job(),left=J.start-tod(),ok=m=>left>=m?'still on time':'late',r=LV().route||S.stats.rides>0;return [
    {ic:'⏳',l:'Wait for the next bus',s:`15 min, stress +3: ${ok(15)}.`,fn:()=>{later('lev_bus',15);adj('stress',3);say('⏳ The next bus comes in fifteen minutes, and the driver waves the whole stranded crowd on.')}},
    {ic:'🚋',l:'Walk two blocks to the T Line',s:r?`6 min, energy −2: ${ok(6)}. You know the route.`:`14 min, stress +4: ${ok(14)}. You guess the direction wrong once.`,fn:()=>{const m=r?6:14;later('lev_bus',m);adj('energy',-2);if(!r)adj('stress',4);LV().route=true;
      say(r?'🚋 Two blocks over, the T Line dings up just as you reach the platform. You know this ride.':'🚋 You catch the T Line going the wrong way, hop off, cross the platform and catch it back. Now you know the route.')}},
    {ic:'🏃',l:'Walk the rest, fast',s:`10 min, energy −7: ${ok(10)}.`,fn:()=>{later('lev_bus',10);adj('energy',-7);say('🏃 Up the hill at a pace that is not quite running. You arrive pink and a little damp, but you arrive.')}},
  ]},dflt:0});

// a rainstorm on your walk (the longer games' real weather; Quick play's rare August shower): an umbrella keeps you dry
const wet=()=>{if(typeof wxOf==='function'){const k=wxOf();if(k)return ['rain','drizzle','wind'].includes(k)}return true};
aev({id:'lev_rain',hook:'travel',tile:['☔','Caught in the rain','info'],chance:()=>long()?0.18:0.04,cooldown:10,max:6,
  cond:c=>wet()&&c.to&&tod()>=420&&tod()<1320,
  run:()=>{say(has('umbrella')?'☔ The sky opens halfway there: real Tacoma rain, the kind that bounces. Your umbrella pops open and you walk on, dry from the knees up.'
    :'☔ The sky opens halfway there: real Tacoma rain, the kind that bounces off the sidewalk. You have no umbrella. The corner market sells them by the register.')},
  choices:()=>has('umbrella')?[
    {ic:'☂️',l:'Share your umbrella with someone at the stop',s:'10 min. Community +2, stress −2.',fn:()=>{later('lev_rain',10);adj('community',2);adj('stress',-2);say('☂️ An older woman with grocery bags ducks under your umbrella for the last block. She tells you about the winter of ’96. You walk her to her door.')}},
    {ic:'🚶',l:'Keep going, dry',s:'Nothing changes.',fn:()=>say('🚶 Dry shoes, dry shoulders. The umbrella was the best twelve dollars you ever spent.')},
  ]:[
    {ic:'🏪',l:'Duck into a doorway and wait it out',s:'20 min, stress +2.',fn:()=>{later('lev_rain',20);adj('stress',2);say('🏪 Twenty minutes in a shop doorway with three strangers, all of you watching the gutters run. It eases off. You go.')}},
    {ic:'💧',l:'Walk on and get soaked',s:'Energy −6, stress +5.',fn:()=>{adj('energy',-6);adj('stress',5);say('💧 Soaked to the socks. You squelch the rest of the way and spend the next hour slowly drying out.')}},
    {ic:'☂️',l:`Buy an umbrella at the nearest shop — ${$(rp(14))}`,s:'5 min. Yours from now on.',dis:S.money<rp(14),fn:()=>{later('lev_rain',5);spend(rp(14));LV().inv.umbrella=day()+1;say('☂️ A sturdy black umbrella from the shop on the corner. You will never leave home without it again. (You will. But less.)')}},
  ],dflt:1});

// ================= MONEY AND HOME (adult) =================
// a scam text about a failed rent payment: call the landlord and lose nothing
aev({id:'lev_scam',hook:'wake',tile:['💬','“Your rent payment failed”','bad'],chance:0.06,bad:true,cooldown:40,max:2,
  cond:()=>day()>0&&!pre('text'),
  run:()=>{say(`💬 A text at 6 AM: “URGENT: your rent payment FAILED. Pay ${$(rp(75))} late fee within 2 hrs to avoid eviction: [link].” The link is not your landlord’s portal. Your heart goes fast anyway.`)},
  choices:()=>{const ch=!!LV().chat;return [
    {ic:'📞',l:'Call the landlord to check',s:'15 min, energy −2. Stress −4 once you know.',fn:()=>{later('lev_scam',15);adj('energy',-2);adj('stress',-4);
      say('📞 Your landlord laughs, tiredly. “Not from us. That one’s going around. Your account is fine.” No loss, and you block the number.')}},
    ch?{ic:'📱',l:'Post it in the block club group chat',s:'20 min. Community +2, stress −2: three people got the same one.',fn:()=>{later('lev_scam',20);adj('community',2);adj('stress',-2);
      say('📱 Within minutes: “Got that too.” “SCAM.” “Don’t click!!” Bev pins a warning to the top of the chat. Nobody on the block pays.')}}
      :{ic:'🔗',l:'Tap the link and pay the “late fee”',s:`${$(rp(75))}. Two minutes, and it goes away. Or does it?`,fn:()=>{const x=lose(rp(lite(75)));adj('stress',10);
      say(`🔗 You pay ${$(x)}. By lunch you realize the landlord never texts. Gone. Next time: call first.`)}},
    {ic:'🗑️',l:'Delete it and try to forget it',s:'Stress +6: what if it was real?',fn:()=>{adj('stress',6);say('🗑️ Deleted. It nags at you all day anyway.')}},
  ]},dflt:2});

// the fridge dies: the savings jar pays the repair
aev({id:'lev_fridge',hook:'wake',tile:['🧊','The fridge dies','bad'],chance:0.04,bad:true,cooldown:60,max:2,urgent:true,
  cond:()=>day()>0&&S.loc==='home'&&!flag('lev_fridge_wait'),
  run:()=>{say(`🧊 The fridge is warm and silent. The light comes on, the compressor doesn’t. ${S.food} meal${S.food===1?'':'s'} in there and the clock is ticking. ${LV().jar>0?`The savings jar on top of it has ${$(LV().jar)}.`:'The savings jar on top of it is empty.'}`)},
  choices:()=>{const c=rp(110);return [
    {ic:'🔧',l:`Pay the appliance tech today — ${$(c)}`,s:`1 hour waiting. All your food saved. ${jarTxt(c)}`,dis:!canPay(c),fn:()=>{later('lev_fridge',60);const j=payJar(c);adj('stress',j>=c?-2:4);
      say(`🔧 A tech named Ray swaps a relay in twenty minutes and talks about his daughter’s soccer team for forty. Cold again. ${j>=c?'The jar paid for it, and that feels like the whole point of a jar.':j>0?`The jar covered ${$(j)} of it.`:'Your wallet felt that one.'}`)}},
    {ic:'🧊',l:`A cooler and ice from the corner market — ${$(rp(10))}`,s:'30 min, energy −4, stress +4. You lose 1 meal. The landlord fixes it in a few days.',fn:()=>{later('lev_fridge',30);spend(rp(10));adj('energy',-4);adj('stress',4);S.food=Math.max(0,S.food-1);setFlag('lev_fridge_wait',day());
      say('🧊 A cheap foam cooler and two bags of ice. The milk doesn’t make it; the rest does. The landlord says “end of the week.”')}},
    {ic:'📞',l:'Call the landlord and wait',s:'Free. You lose up to 2 meals, stress +8.',fn:()=>{const lost=Math.min(2,S.food);S.food-=lost;adj('stress',8);setFlag('lev_fridge_wait',day());
      say(`📞 The landlord will “send someone.” By evening ${lost?`${lost} meal${lost===1?'':'s'} have gone off`:'the fridge smells like a warm closet'}. Next time, a little in the jar.`)}},
  ]},dflt:2});
aev({id:'lev_fridge_fixed',chain:true,hook:'wake',tile:['🧊','The fridge hums again','good'],chance:1,max:4,cooldown:0,
  cond:()=>flag('lev_fridge_wait')!=null&&flag('lev_fridge_wait')!==false&&day()>=flag('lev_fridge_wait')+2,
  run:()=>{setFlag('lev_fridge_wait',null);say('🧊 The landlord’s repair guy comes at 8 AM, swaps a part and leaves. The fridge hums again.')},
  choices:()=>[
    {ic:'🧺',l:'Restock it today',s:`Groceries at the corner market are ${$(rp(42))} for 4 meals.`,fn:()=>{if(S.money>=rp(42)){spend(rp(42));S.food+=4;later('lev_fridge_fixed',25);say('🧺 Four meals back in a cold fridge. It feels like luxury.')}else say('🧺 Not enough cash today. Soon.')}},
    {ic:'🫙',l:'Start a savings jar so this stings less',s:'Put $10 in the jar on top of the fridge. Stress −2.',dis:S.money<10,fn:()=>{money(-10);LV().jar+=10;adj('stress',-2);say('🫙 An old peanut butter jar, a strip of tape that says FRIDGE MONEY, and the first ten dollars.')}},
  ],dflt:0});

// a power outage on an evening at home: a flashlight and batteries make it a normal evening
aev({id:'lev_outage',hook:'arrive',tile:['🔌','The power goes out','bad'],chance:0.05,bad:true,cooldown:40,max:2,urgent:true,
  cond:c=>c.at==='home'&&tod()>=1140&&tod()<1350,
  run:()=>{say(has('flashlight')?'🔌 Click, and the whole block goes dark: every window, every streetlight. You find the flashlight in the drawer by feel. Batteries good. Just a normal evening, by flashlight.'
    :'🔌 Click, and the whole block goes dark. You stand in the kitchen with your hands out like a zombie. The corner market sells flashlights and batteries, and its generator is humming.')},
  choices:()=>has('flashlight')?[
    {ic:'📖',l:'Read by flashlight until it comes back',s:`30 min. ${cap(calmTxt(5))}.`,fn:()=>{later('lev_outage',30);calm(5);say('📖 Two chapters by flashlight with the window open. The whole hill is quiet in a way it never is. The power comes back at the good part.')}},
    {ic:'🔦',l:'Check on Ms. Lorraine across the street',s:'20 min, energy −3. Community +3.',fn:()=>{later('lev_outage',20);adj('energy',-3);adj('community',3);say('🔦 Ms. Lorraine is on her porch with a candle and a transistor radio. “I was wondering who’d come.” You sit with her until the lights come back.')}},
    {ic:'😴',l:'Call it an early night',s:'Stress −2. Nothing else.',fn:()=>{adj('stress',-2);say('😴 You lie in the dark and listen to the neighborhood talk from its porches.')}},
  ]:[
    {ic:'🕯️',l:'Feel around for candles',s:'15 min, stress +5, energy −2.',fn:()=>{later('lev_outage',15);adj('stress',5);adj('energy',-2);say('🕯️ One birthday candle and a lighter that sparks but won’t catch. A long, dark evening.')}},
    {ic:'🏪',l:`Walk to the corner market for a flashlight — ${$(rp(9))}`,s:'25 min, energy −4. Yours from now on.',dis:S.money<rp(9),fn:()=>{later('lev_outage',25);spend(rp(9));adj('energy',-4);LV().inv.flashlight=day()+1;say('🏪 Grace Kim is selling flashlights by lantern light at the counter. You get one, and batteries, and a granola bar for the walk home.')}},
    {ic:'🪑',l:'Sit out on the stoop with the neighbors',s:'45 min, energy −4. Community +2, stress −2.',fn:()=>{later('lev_outage',45);adj('energy',-4);adj('community',2);adj('stress',-2);say('🪑 The whole building ends up on the front steps. Somebody has a speaker. Somebody has a cooler. Dark is better with company.')}},
  ],dflt:0});

// a rent increase notice (the longer games: rents rise each August): the block club's tenant-rights info softens it
const nextRaise=()=>{if(!S.city||!S.rent)return null;const C=S.city,y=dateOf(day()).y;for(const yy of [y,y+1]){const di=dayIndexOf(yy,8,1);if(di>day()&&!C.done['rent'+yy]&&C.rentF<1.2)return {y:yy,di}}return null};
aev({id:'lev_rentup',hook:'wake',tile:['📬','A rent increase notice','bad'],chance:0.5,bad:true,cooldown:200,max:20,
  cond:()=>{if(!long()||!S.rent)return false;const r=nextRaise();return !!r&&r.di-day()<=110&&flag('lev_rent_y')!==r.y},
  run:()=>{const r=nextRaise();setFlag('lev_rent_y',r.y);const inc=cityR5(S.rent.amt*0.04);S.ev.flags.levRentInc=inc;
    say(`📬 Taped to your door: your rent goes up about ${$(inc)} a month from August 1. ${LV().tenant?'You remember the block club’s tenant-rights handout: the notice has to come earlier than this.':'The block club meets Thursday evenings at People’s. They know the rules.'}`)},
  choices:()=>{const inc=S.ev.flags.levRentInc||cityR5(S.rent.amt*0.04),t=LV().tenant;return [
    {ic:'🗳️',l:t?'Use the block club’s tenant-rights handout':'Ask the block club for help',s:t?`10 min. The old rent holds two more months: you keep about ${$(inc*2)}.`:`1 hour, energy −5. They help you push back: you keep about ${$(inc)}.`,fn:()=>{later('lev_rentup',t?10:60);if(!t)adj('energy',-5);LV().tenant=true;money(t?inc*2:inc);adj('stress',-3);
      say(`🗳️ ${t?'You email the landlord the city’s notice rules, politely. A day later: “You’re right. The new rent starts in the fall.”':'Denise from the block club walks you through the city’s tenant rules and helps you write the email.'} You keep ${$(t?inc*2:inc)}.`)}},
    {ic:'✉️',l:'Write the landlord asking to phase it in',s:`30 min, stress +3. Maybe half: about ${$(Math.round(inc/2))}.`,fn:()=>{later('lev_rentup',30);adj('stress',3);money(Math.round(inc/2));say(`✉️ A careful, friendly letter. The landlord agrees to split the difference for a month: ${$(Math.round(inc/2))} back in your pocket.`)}},
    {ic:'😮‍💨',l:'Sign it and move on',s:'Stress +6.',fn:()=>{adj('stress',6);say('😮‍💨 You sign the renewal. Everybody’s rent is going up. That doesn’t make it feel better.')}},
  ]},dflt:2});

// a car prowl overnight (only with a car: 38-car.js): nothing on the seats and the streetlight spot, and the window stays whole
const hasCar=()=>!!(S.car&&S.car.own);
aev({id:'lev_prowl',hook:'wake',tile:['🚗','Car prowlers on the block','bad'],chance:()=>LV().light?0.025:0.05,bad:true,cooldown:45,max:3,urgent:true,
  cond:()=>day()>0&&S.loc==='home'&&hasCar()&&!S.car.taped,
  run:()=>{const L0=LV(),safe=L0.seats&&L0.light;S.ev.flags.levProwl=safe?'safe':'broken';
    if(safe){say('🚗 Ms. Lorraine is on her porch when you come out: “Somebody went down the whole block last night trying car doors.” Two cars down, a window is in pieces on the sidewalk. Yours sits under the streetlight with nothing on the seats, not a scratch on it.');return}
    const got=L0.seats?0:lose(rp(lite(20)));S.ev.flags.levProwlGot=got;
    say(`🚗 Glass all over the sidewalk by your car: the passenger window is smashed. ${L0.seats?'There was nothing on the seats to take, so they left with nothing, but the window is still gone.':`Your gym bag is gone from the back seat, and the ${$(got)} in the cup holder with it. Nothing on the seats gives them no reason to try.`}${L0.light?'':' The spot under the streetlight would have helped too.'}`)},
  choices:()=>{const L0=LV();if(S.ev.flags.levProwl==='safe')return [
    {ic:'📱',l:'Warn the block',s:L0.chat?'10 min. Post it in the group chat: community +2.':'10 min. Knock on a few doors: community +1, energy −2.',fn:()=>{later('lev_prowl',10);if(L0.chat)adj('community',2);else{adj('community',1);adj('energy',-2)}say('📱 “Lock up and clear your seats, everybody.” Three people thank you before lunch.')}},
    {ic:'🚶',l:'Check your doors and go on with your day',s:'Stress −2. The habits paid off.',fn:()=>{adj('stress',-2);say('🚶 All locked, all whole. Clear seats and the streetlight spot: worth it.')}},
  ];const g=rp(250),dd=rp(100),up=rp(8);return [
    {ic:'🧾',l:`File a police report ${pre('onlineBank')?'at the precinct':'online'} and pay for the glass — ${$(g)}`,s:`About 1½ hours with the glass shop. Stress +3. ${jarTxt(g)}`,dis:!canPay(g),fn:()=>{later('lev_prowl',90);payJar(g);adj('stress',3);L0.seats=true;
      say(`🧾 A report number from the Tacoma police website, then the glass shop on South Tacoma Way: new window by noon. ${$(g)}. From now on nothing stays on the seats.`)}},
    {ic:'🩹',l:`Tape plastic over it for now — ${$(rp(6))}`,s:'20 min, stress +6. Replace it later (at home).',fn:()=>{later('lev_prowl',20);spend(rp(6));adj('stress',6);S.car.taped=true;L0.seats=true;
      say('🩹 A trash bag and a roll of packing tape from the corner market. It flaps at every speed over 25. It will do for now.')}},
    {ic:'📞',l:`Claim it on your insurance — ${$(dd)} deductible`,s:`40 min on the phone. Your rate goes up about ${$(up)} a month.`,dis:S.money<dd,fn:()=>{later('lev_prowl',40);spend(dd);S.car.ins+=up;adj('stress',2);L0.seats=true;
      say(`📞 Forty minutes of hold music, a claim number, and a mobile glass van by the afternoon. ${$(dd)} out of pocket, and a slightly bigger bill every month.`)}},
  ]},dflt:1});

// ================= PEOPLE (adult) =================
// a "lend me $20" story, out in the wider city: knowing your neighbors, you've heard this one
const knowsHill=()=>S.community>=35||metCount()>=8;
aev({id:'lev_hustle',hook:'arrive',tile:['💵','“Can you spare $20?”','info'],chance:0.06,cooldown:30,max:3,
  cond:c=>out(c.at)&&tod()>=540&&tod()<1260,
  run:()=>{say(knowsHill()?'💵 A man with a gas can and a good story: his car is stuck, his kid is in it, he just needs twenty dollars. It’s the exact story Bev warned the group chat about last month, word for word.'
    :'💵 A man with a gas can and a good story: his car ran out of gas two blocks over, his kid is in it, he just needs twenty dollars. He seems so sure you’ll help.')},
  choices:()=>[
    {ic:'💵',l:`Give him ${$(rp(20))}`,s:knowsHill()?'You’re fairly sure it’s a hustle. Your money, your call.':'Maybe it’s true. Maybe it isn’t.',dis:S.money<rp(20),fn:()=>{spend(rp(20));adj('stress',knowsHill()?4:-2);say(knowsHill()?'💵 You give it anyway. Ten minutes later you see him telling the same story at the next corner.':'💵 He thanks you and walks off fast, in the opposite direction from the gas station.')}},
    {ic:'🥪',l:`Buy him a sandwich instead — ${$(rp(8))}`,s:'10 min. Stress −3.',dis:S.money<rp(8),fn:()=>{later('lev_hustle',10);spend(rp(8));adj('stress',-3);say('🥪 He takes the sandwich, a little surprised, and says thanks like he means it. Whatever the story was, he ate the sandwich.')}},
    {ic:'🙅',l:'Say no, kindly, and keep walking',s:knowsHill()?'You know the story. Stress −2.':'Stress +4: what if he really needed it?',fn:()=>{adj('stress',knowsHill()?-2:4);say(knowsHill()?'🙅 “Not today, man. Good luck.” You know this one. You keep walking, easy.':'🙅 “Sorry, I can’t.” It bothers you for a block or two.')}},
  ],dflt:2});

// a neighbor's car battery dies: jumper cables, and a favor comes back later
aev({id:'lev_battery',hook:'arrive',tile:['🔋','A dead battery next door','info'],chance:0.06,cooldown:30,max:3,
  cond:c=>c.at==='home'&&tod()>=480&&tod()<1170,
  run:()=>{say(`🔋 ${S.met.eli?'Eli':'The neighbor from the second floor'} is standing by a car with the hood up and the look of a person who has turned the key twelve times. “Dead battery. I’m supposed to be in Puyallup in an hour.”${has('cables')?' Your jumper cables are in the hall closet.':''}`)},
  choices:()=>{const c=has('cables'),ch=!!LV().chat;return [
    c?{ic:'🔋',l:'Jump it with your cables',s:'20 min, energy −3. Community +3, and a favor owed.',fn:()=>{later('lev_battery',20);adj('energy',-3);adj('community',3);setFlag('lev_favor',day());say('🔋 Red to red, black to ground, a minute of revving and the engine catches. A whoop from the driver’s seat. “I owe you one. Really.”')}}
      :{ic:'🏪',l:`Run to the corner market for cables — ${$(rp(25))}`,s:'30 min, energy −5. Community +3, a favor owed, and the cables are yours.',dis:S.money<rp(25),fn:()=>{later('lev_battery',30);spend(rp(25));LV().inv.cables=day()+1;adj('energy',-5);adj('community',3);setFlag('lev_favor',day());say('🏪 Back with a pair of cables from the market’s back shelf. Five minutes later the car is running. “I owe you one.”')}},
    ch?{ic:'📱',l:'Ask the group chat who has cables',s:'25 min. Community +2. Ron comes over with a jump pack.',fn:()=>{later('lev_battery',25);adj('community',2);say('📱 Three replies in two minutes. Ron arrives with a jump pack and a lecture about battery terminals. Everybody is late to something, nobody minds.')}}
      :{ic:'📞',l:'Help them find a roadside service',s:'15 min, stress +2.',fn:()=>{later('lev_battery',15);adj('stress',2);say('📞 You find a number, they make the call, and you wait together a while. The truck is “forty-five minutes out.”')}},
    {ic:'🙅',l:'“Sorry, I’m on my way out”',s:'Stress +3.',fn:()=>{adj('stress',3);say('🙅 You wave an apology and go in. Through the window you watch them still turning the key.')}},
  ]},dflt:2});
aev({id:'lev_favor',chain:true,hook:'wake',tile:['🤝','A favor comes back','good'],chance:1,max:5,cooldown:0,
  cond:()=>flag('lev_favor')!=null&&flag('lev_favor')!==false&&day()>=flag('lev_favor')+2,
  run:()=>{setFlag('lev_favor',null);say(`🤝 A knock at 8 AM: ${S.met.eli?'Eli':'the neighbor whose car you jumped'}, with a grocery bag. “Told you I owed you.” Inside: eggs, rice, greens and a very good loaf of bread.`)},
  choices:()=>[
    {ic:'☕',l:'Invite them in for coffee',s:'30 min. Community +2, food +2.',fn:()=>{later('lev_favor',30);S.food+=2;adj('community',2);say('☕ Coffee at your little table. You find out they grew up in Spanaway and know every taco truck between here and there.')}},
    {ic:'🙏',l:'Say thanks at the door',s:'Food +2.',fn:()=>{S.food+=2;say('🙏 Two meals’ worth of groceries and a neighbor who waves first now.')}},
  ],dflt:1});

// a lost dog: the neighborhood group chat finds the owner fast
aev({id:'lev_dog',hook:'arrive',tile:['🐶','A dog with no tag','info'],chance:0.05,cooldown:30,max:3,
  cond:c=>['mlk','peoples','view','home'].includes(c.at)&&tod()>=480&&tod()<1170&&S.ev.last.lost_dog!==day(),
  run:()=>{say('🐶 A small gray terrier with a pink collar and no tag trots up and sits on your foot like she has decided you are in charge now. Somebody is missing her.')},
  choices:()=>{const ch=!!LV().chat;return [
    ch?{ic:'📱',l:'Post her picture in the block club group chat',s:'15 min. Community +3, stress −3.',fn:()=>{later('lev_dog',15);adj('community',3);adj('stress',-3);say('📱 Four minutes: “THAT’S PEPPER!!” Her owner runs up the block in slippers. Pepper acts like nothing happened.')}}
      :{ic:'🚶',l:'Walk her around the block asking',s:'50 min, energy −6. Community +2, stress −2.',fn:()=>{later('lev_dog',50);adj('energy',-6);adj('community',2);adj('stress',-2);say('🚶 Six porches, two shrugs and a lot of petting later, a kid on a bike yells “PEPPER!” and leads you to her house. (The group chat would have been faster: meet a few more neighbors.)')}},
    {ic:'🏥',l:'Walk her to the vet on MLK to scan for a chip',s:'30 min, energy −3, stress +2.',fn:()=>{later('lev_dog',30);adj('energy',-3);adj('stress',2);say('🏥 The vet tech scans her: chipped. A phone call, and her owner is on the way. Pepper licks your wrist goodbye.')}},
    {ic:'🛒',l:'Leave her with Grace at the corner market',s:'10 min, stress +3.',fn:()=>{later('lev_dog',10);adj('stress',3);say('🛒 Grace Kim gives her a water bowl and calls the shelter’s lost-pet line. You keep wondering about her all day.')}},
  ]},dflt:2});

// a friend needs a ride to the ER: savings mean you can just go
aev({id:'lev_er',hook:'arrive',tile:['🚑','A ride to the ER','bad'],chance:0.035,cooldown:60,max:2,urgent:true,
  cond:c=>c.at==='home'&&tod()>=1080&&tod()<1350,
  run:()=>{say('🚑 Tito Ben from next door knocks, holding his wrist at a bad angle: he slipped on the back steps. Tita Rose is on a night shift and he can’t drive like this. St. Joseph’s emergency room is a short drive. He looks embarrassed to ask.')},
  choices:()=>{const c=rp(22);return [
    {ic:'🚗',l:`Pay for a ${pre('rideshare')?'cab':'rideshare'} and go with him — ${$(c)}`,s:`About 2½ hours, energy −10, stress +4. Community +5. ${jarTxt(c)}`,dis:!canPay(c),fn:()=>{later('lev_er',150);const j=payJar(c);adj('energy',-10);adj('stress',4);adj('community',5);
      say(`🚗 You wait with him through triage, X-ray and a cast the color of a Mariners jersey. ${j>=c?'The jar paid for the ride, which is exactly what it’s for.':''} Tita Rose hugs you so hard at the door the next morning that your back pops.`)}},
    {ic:'📞',l:'Call his daughter and wait with him until she comes',s:'45 min. Community +2, stress +3.',fn:()=>{later('lev_er',45);adj('community',2);adj('stress',3);say('📞 His daughter drives up from Lakewood in twenty-five minutes. You sit with him on the stoop and talk about the Navy until she pulls up.')}},
    {ic:'🚕',l:'Help him call a cab and go back in',s:'10 min, stress +6.',fn:()=>{later('lev_er',10);adj('stress',6);say('🚕 You get him into a cab and stand on the curb as it pulls away. You think about him all evening.')}},
  ]},dflt:2});

// ================= GROWING UP =================
// a bike gone from the rack outside the Reading Room (it was "borrowed"): a lock keeps it put
gev({id:'lev_g_bike',hook:'arrive',tile:['🚲','The bike rack','bad'],chance:0.07,bad:true,cooldown:30,max:2,
  cond:c=>c.at==='library'&&tod()<gCurfew()-30,
  run:()=>{say(has('lock')?'🚲 When you come out, the kid next to you at the rack is looking at an empty spot where his bike was. Yours is right where you left it, locked to the rack.'
    :'🚲 When you come out of the Reading Room, the rack is empty. Your bike is gone. A lock from the corner market would have kept it there.')},
  choices:()=>has('lock')?[
    {ic:'🤝',l:'Help him look for it',s:'20 min, energy −4. Mood +4.',fn:()=>{later('lev_g_bike',20);adj('energy',-4);adj('mood',4);say('🤝 You find it together, leaning on the fence at People’s: a little kid took it for a spin. He says you’re a good detective.')}},
    {ic:'📚',l:'Tell Ms. Okafor for him',s:'10 min. Mood +2.',fn:()=>{later('lev_g_bike',10);adj('mood',2);say('📚 Ms. Okafor makes two phone calls. “Bikes on this hill tend to come home.” The kid looks a little less worried.')}},
    {ic:'🚲',l:'Ride home',s:'Nothing changes.',fn:()=>say('🚲 You unlock your bike and ride home, very glad about that lock.')},
  ]:[
    {ic:'📚',l:'Tell Ms. Okafor',s:'15 min, mood −2. She knows everybody.',fn:()=>{later('lev_g_bike',15);adj('mood',-2);setFlag('lev_g_bike_back',day());say('📚 Ms. Okafor writes it down and makes two phone calls. “Give me a day. Bikes on this hill tend to come home.”')}},
    {ic:'🔎',l:'Look around the block',s:'25 min, energy −6. Mood +2 if you find it.',fn:()=>{later('lev_g_bike',25);adj('energy',-6);if(Math.random()<0.6){adj('mood',2);say('🔎 There it is, leaning on the fence by People’s. A little kid took it for a spin and left it. You ride home very fast.')}else{adj('mood',-4);say('🔎 Up the block and back. No bike. You walk home, slow.')}}},
    {ic:'🏠',l:'Walk home and tell Mom',s:'Mood −4, family +2.',fn:()=>{adj('mood',-4);adj('family',2);setFlag('lev_g_bike_back',day());say('🏠 Mom hugs you and says bikes are just things. Then she says “we are getting you a lock.”')}},
  ],dflt:2});
gev({id:'lev_g_bike_back',chain:true,hook:'wake',tile:['🚲','Your bike is back','good'],chance:1,max:3,cooldown:0,
  cond:()=>flag('lev_g_bike_back')!=null&&flag('lev_g_bike_back')!==false&&day()>=flag('lev_g_bike_back')+1,
  run:()=>{setFlag('lev_g_bike_back',null);say('🚲 Your bike is leaning on the porch rail in the morning with a note in kid handwriting: “sorry i borowed it.” Somebody’s little brother.')},
  choices:()=>[
    {ic:'🔒',l:`Buy a lock today — ${$(gRp(8))}`,s:'Mood +3. Yours from now on.',dis:S.money<gRp(8),fn:()=>{gSpend(gRp(8));LV().inv.lock=day()+1;adj('mood',3);say('🔒 A bright orange lock from the corner market. Nobody is borrowing this bike again.')}},
    {ic:'🚲',l:'Go for a ride',s:'Mood +4, energy −3.',fn:()=>{adj('mood',4);adj('energy',-3);say('🚲 Once around the block, just because you can.')}},
  ],dflt:1});

// lunch money missing at school: an inside pocket keeps half
gev({id:'lev_g_lunch',hook:'arrive',tile:['🍎','Lunch money','bad'],chance:0.08,bad:true,cooldown:30,max:3,
  cond:c=>c.at==='school'&&long()&&isSchoolDay(day())&&!gCh1()&&tod()<720,
  run:()=>{const L0=LV(),amt=gRp(6),k=L0.kpocket;const x=Math.min(S.money,k?Math.ceil(amt/2):amt);money(-x);S.ev.flags.levLunch=x;
    say(k?`🍎 At lunch you reach for your money: the back-pocket half is gone, fallen out somewhere at recess. The half in your inside pocket is still there (${$(x)} lost). Enough for a tray.`
      :`🍎 At lunch you reach for your money: gone, fallen out of your back pocket somewhere at recess (${$(x)}). An inside pocket would have kept at least some of it.`)},
  choices:()=>LV().kpocket?[
    {ic:'🍽️',l:'Buy lunch with what’s left',s:'Energy +6.',fn:()=>{adj('energy',6);say('🍽️ Pizza day. You have exactly enough. The inside pocket wins.')}},
    {ic:'🏫',l:'Check the office lost and found',s:'10 min, mood −1. It might turn up.',fn:()=>{later('lev_g_lunch',10);adj('mood',-1);setFlag('lev_g_lunch_found',day());say('🏫 The secretary writes your name on a sticky note. “Money turns up more than you’d think.”')}},
  ]:[
    {ic:'😣',l:'Skip lunch',s:'Energy −8, mood −3.',fn:()=>{adj('energy',-8);adj('mood',-3);say('😣 A long, hungry afternoon. Tomorrow, the inside pocket.')}},
    {ic:'🏫',l:'Check the office lost and found',s:'10 min, mood −2. Energy −6 without lunch. It might turn up.',fn:()=>{later('lev_g_lunch',10);adj('mood',-2);adj('energy',-6);setFlag('lev_g_lunch_found',day());say('🏫 Not there yet. The secretary writes your name on a sticky note and slips you a granola bar.')}},
    {ic:'🤝',l:'Split a lunch with a friend',s:'Mood −1, a friend +2.',dis:!gMetCount(),fn:()=>{adj('mood',-1);const k=gBest()||KIDS.find(x=>gMet(x.id));if(k){gFriend(k.id,2);say(`🤝 ${k.n} slides half a sandwich across the table without a word. That’s a friend.`)}}},
  ],dflt:0});
gev({id:'lev_g_lunch_found',chain:true,hook:'wake',tile:['🍎','The lost and found','good'],chance:1,max:4,cooldown:0,
  cond:()=>flag('lev_g_lunch_found')!=null&&flag('lev_g_lunch_found')!==false&&day()>=flag('lev_g_lunch_found')+1&&isSchoolDay(day()),
  run:()=>{setFlag('lev_g_lunch_found',null);say('🍎 The office calls your name during homeroom: somebody turned in folded bills from the playground. They’re yours.')},
  choices:()=>[
    {ic:'💵',l:'Pick it up and say thanks',s:`Money +${$(gRp(3))}, mood +3.`,fn:()=>{gEarn(gRp(3));adj('mood',3);say('💵 You thank the secretary twice. Into the inside pocket it goes.');LV().kpocket=true}},
    {ic:'🍪',l:'Put it in the class bake-sale jar',s:'Mood +5.',fn:()=>{adj('mood',5);say('🍪 You drop it in the bake-sale jar. Someone else’s lucky day.')}},
  ],dflt:0});

// an older kid hassles you at the bus stop: walking with a friend, nothing happens
const kidStop=c=>c.to&&c.from&&(c.to==='school'||c.from==='school'||(!!hoodOf(c.to)&&!hoodOf(c.from)));
gev({id:'lev_g_hassle',hook:'travel',tile:['🚏','At the bus stop','bad'],chance:0.06,bad:true,cooldown:30,max:2,
  cond:c=>kidStop(c)&&tod()>=420&&tod()<gCurfew(),
  run:()=>{const b=LV().buddy&&gMetCount()>0;say(b?'🚏 An older kid at the stop starts in on somebody’s shoes, sees there are two of you, and loses interest. You and your friend talk about the new episode the whole way.'
    :'🚏 An older kid at the stop takes up the whole bench, says your backpack is “cute” in a mean way and asks if you have a dollar. Nobody else is around.')},
  choices:()=>{const b=LV().buddy&&gMetCount()>0,k=gBest()||KIDS.find(x=>gMet(x.id));return b?[
    {ic:'🚌',l:'Sit by the driver',s:'Mood +1.',fn:()=>{adj('mood',1);say('🚌 Front seats, by the driver. She says good morning to everybody by name.')}},
    {ic:'😄',l:'Laugh it off together',s:`Mood +3${k?`, friendship with ${k.n} +2`:''}.`,fn:()=>{adj('mood',3);if(k)gFriend(k.id,2);say('😄 You do a terrible impression of him once he’s gone. Your friend laughs so hard they snort.')}},
  ]:[
    {ic:'🚶',l:'Walk over by the grown-ups and wait there',s:'5 min, mood −2.',fn:()=>{later('lev_g_hassle',5);adj('mood',-2);say('🚶 You stand by the lady with the grocery cart. He loses interest. Your heart takes a while to slow down.')}},
    {ic:'🗣️',l:'Tell Mom or Dad about it tonight',s:'Mood −1, family +3. Next time, walk with a friend.',fn:()=>{adj('mood',-1);adj('family',3);LV().buddy=gMetCount()>0;say('🗣️ Dad listens to the whole thing. “Walk to the stop with a friend. There’s strength in numbers.” He’s right.')}},
    {ic:'💵',l:`Give him a dollar so he leaves you alone — ${$(gRp(1))}`,s:'Mood −4.',dis:S.money<gRp(1),fn:()=>{gSpend(gRp(1));adj('mood',-4);say('💵 He takes it and laughs. It doesn’t feel like it made anything better.')}},
  ]},dflt:0});

// lost on the first Link ride downtown: the route map you studied gets you there on time
gev({id:'lev_g_linklost',hook:'travel',tile:['🚋','The first Link ride','info'],chance:0.6,cooldown:0,max:1,
  cond:c=>c.to&&hoodOf(c.to)==='downtown'&&!(S.gh&&S.gh.hoods&&S.gh.hoods.downtown),
  run:()=>{const m=LV().kmap;if(!m){pass(15);adj('mood',-3)}
    say(m?'🚋 Your first ride down the hill on your own. You studied the route map at the Reading Room, so you count the stops and hop off at exactly the right one. Easy.'
      :'🚋 Your first ride down the hill on your own. You miss your stop, then the next one, and end up looking at a station sign you’ve never seen. +15 min. The route map at the Reading Room would have helped.')},
  choices:()=>LV().kmap?[
    {ic:pre('camera')?'🪟':'📸',l:pre('camera')?'Watch the view from the window':'Take a picture of the view from the train',s:'Mood +3.',fn:()=>{adj('mood',3);say(pre('camera')?'🪟 The cranes, the bay, the water: you watch it all slide by with your forehead on the glass.':'📸 The cranes, the Dome, the bay: one blurry, perfect picture from the window.')}},
    pre('text')?{ic:'☎️',l:'Call Mom from a pay phone',s:'Family +2.',fn:()=>{adj('family',2);say('☎️ A quarter in the pay phone. “Made it!” Mom says she was already watching the clock.')}}
      :{ic:'📱',l:'Text Mom that you made it',s:'Family +2.',fn:()=>{adj('family',2);say('📱 “Made it!” Mom sends back eleven hearts.')}},
  ]:[
    {ic:'🙋',l:'Ask the operator',s:'5 min, mood +2.',fn:()=>{later('lev_g_linklost',5);adj('mood',2);LV().kmap=true;say('🙋 The operator points at the map by the door. “Ride back two stops. Everybody does it once.”')}},
    {ic:pre('cell')?'☎️':'📱',l:pre('cell')?'Find a pay phone and call Mom':'Call Mom',s:'15 min, family +1, mood −2.',fn:()=>{later('lev_g_linklost',15);adj('family',1);adj('mood',-2);say(`${pre('cell')?'☎️':'📱'} Mom stays calm and talks you back to the right stop. She also says “next time, look at the map.”`)}},
    {ic:'🗺️',l:'Figure it out from the station map',s:'10 min, energy −3. You’ll know it now.',fn:()=>{later('lev_g_linklost',10);adj('energy',-3);LV().kmap=true;say('🗺️ You trace the line with your finger, find yourself, and ride back. You will never miss this stop again.')}},
  ],dflt:0});

// ================= SUPPORTING ACTIONS =================
const onOff=b=>b?'ON':'off';
function adultActs(a){
  const L0=LV(),d=day(),m=tod();
  if(S.loc==='home'){
    a.push({ic:'🫙',l:`Put $20 in the savings jar (${$(L0.jar)} in it)`,s:'It pays for the surprises: a dead fridge, a ride to the ER.',cat:'money',dis:S.money<20,fn:()=>{money(-20);L0.jar+=20;pass(2);say(`🫙 Twenty dollars into the jar on top of the fridge. ${$(L0.jar)} saved for a bad day.`)}});
    if(L0.jar>=20)a.push({ic:'🫙',l:'Take $20 out of the savings jar',s:`${$(L0.jar)} in it.`,cat:'money',fn:()=>{money(20);L0.jar-=20;pass(2);say(`🫙 Twenty out of the jar. ${$(L0.jar)} left.`)}});
    const cl=pre('cell');a.push({ic:'🤐',l:`Habit: ${cl?'wallet':'phone'} in a zipped pocket on the go: ${onOff(L0.zip)}`,s:L0.zip?`Tap to stop. (${cl?'Slower to pay at the counter':'Slower to answer texts'}, much harder to grab.)`:`Tap to start. ${cl?'Slower to pay at the counter':'Slower to answer texts'}, much harder to grab.`,cat:'here',fn:()=>{L0.zip=!L0.zip;say(L0.zip?`🤐 From now on your ${cl?'wallet':'phone'} rides in the zipped inside pocket.`:'🤐 Back to the easy pocket.')}});
    if(S.car&&S.car.own){
      a.push({ic:'🧹',l:`Habit: nothing on the car seats: ${onOff(L0.seats)}`,s:'Bags in the trunk or inside, nothing in the cup holder. Tap to change.',cat:'here',fn:()=>{L0.seats=!L0.seats;say(L0.seats?'🧹 From now on the seats stay empty: bags in the trunk or upstairs.':'🧹 Back to tossing things on the back seat.')}});
      a.push({ic:'💡',l:`Park under the streetlight: ${onOff(L0.light)}`,s:'The spot by the light on your block. A few more steps from the door. Tap to change.',cat:'here',fn:()=>{L0.light=!L0.light;say(L0.light?'💡 You start leaving the car in the bright spot under the streetlight.':'💡 Back to the closest spot, light or not.')}});
    }
    if(!L0.chat){const n=metCount();a.push({ic:'📱',l:'Join the block club group chat',s:n>=5?'10 min. Bev runs it: lost dogs, porch packages, who needs a jump. Community +1.':`Bev adds people she knows. Meet 5 neighbors first (you know ${n}).`,cat:'people',dis:n<5,
      fn:()=>{L0.chat=d+1;pass(10);adj('community',1);say('📱 Bev adds you: “Welcome! Rules: be kind, no selling, dogs get posted first.” Forty-one people, three lost-cat alerts and a recipe for peach cobbler.')}})}
  }
  if(S.loc==='mlk'){const mk=m>=420&&m<1320,item=(k,ic,l,c,s,t)=>{if(has(k))return;a.push({ic,l:`${l} — ${$(c)}`,s:mk?s:'The market is open 7 AM to 10 PM.',cat:'money',dis:!mk||S.money<c,fn:()=>{spend(c);L0.inv[k]=d+1;pass(5);say(t)}})};
    item('umbrella','☂️','An umbrella at the corner market',rp(12),'Tacoma rain is coming. Stay dry on the walk.','☂️ A sturdy black umbrella from the bucket by the register. Grace Kim: “Smart. Most people wait till they’re wet.”');
    item('flashlight','🔦','A flashlight and batteries',rp(9),'For the night the power goes out.','🔦 A flashlight and a four-pack of batteries, in the kitchen drawer for the night you need them.');
    item('cables','🔋','Jumper cables',rp(25),'You don’t have a car. Your neighbors do.','🔋 Jumper cables from the back shelf. You don’t have a car, but somebody on the block always does.');
    if(!L0.locker)a.push({ic:'📦',l:`Sign up for the market’s pickup locker — ${$(rp(5))}`,s:mk?'Packages go to a locker here instead of your porch. One-time fee.':'The market is open 7 AM to 10 PM.',cat:'money',dis:!mk||S.money<rp(5),fn:()=>{spend(rp(5));L0.locker=d+1;pass(10);say('📦 Grace Kim sets you up with a locker code. “Half the block uses it now.” No more porch packages.')}});
  }
  if(S.loc==='link'){
    a.push({ic:'🚌',l:`Sit up front by the driver on the bus: ${onOff(L0.front)}`,s:L0.front?'Tap to sit wherever. (You give up the back-row window seats.)':'Tap to make it your habit. Fewer pockets within reach, and the driver sees everything.',cat:'here',fn:()=>{L0.front=!L0.front;say(L0.front?'🚌 From now on you sit up front, by the driver.':'🚌 Back to the window seats in the back.')}});
    if(!L0.route)a.push({ic:'🗺️',l:'Study the T Line route map',s:'15 min. Know where it goes for the day the bus breaks down.',cat:'here',fn:()=>{L0.route=true;pass(15);say('🗺️ You trace the T Line on the platform map: Hilltop, the hospitals, Stadium, downtown, the Dome. If the bus ever dies, you know the way.')}});
  }
  if(S.loc==='peoples'&&dayName(d)==='Thursday'&&L0.club!==d){const ok=m>=1080&&m<1200;
    a.push({ic:'🗳️',l:'The block club meeting',s:ok?'90 min in the community room, energy −6. Community +3, stress −3, and the tenant-rights handout.':'Thursdays, 6 to 8 PM, in the community room.',cat:'people',dis:!ok,
      fn:()=>{L0.club=d;L0.tenant=true;pass(90);adj('energy',-6);adj('community',3);adj('stress',-3);say('🗳️ Folding chairs, a coffee urn and Ms. Lorraine running the agenda like a principal: the crosswalk on 11th, the pocket park, and Denise’s handout on Tacoma’s tenant rules (how much notice a rent increase needs). You take two copies.')}});
  }
  return a;
}
function growActs(a){
  const L0=LV(),d=day(),m=tod();
  if(S.loc==='mlk'&&!has('lock')){const c=gRp(8),mk=m>=420&&m<1320;
    a.push({ic:'🔒',l:`A bike lock at the corner market — ${$(c)}`,s:mk?'For the rack outside the Reading Room.':'The market is open 7 AM to 10 PM.',cat:'money',dis:!mk||S.money<c,fn:()=>{gSpend(c);L0.inv.lock=d+1;pass(5);say('🔒 A bright orange U-lock. Grace Kim shows you the trick: through the frame, not just the wheel.')}})}
  if(S.loc==='home'){
    if(long())a.push({ic:'🧥',l:`Habit: lunch money in your inside pocket: ${onOff(L0.kpocket)}`,s:'Half in the inside pocket, half in the back. Tap to change.',cat:'here',fn:()=>{L0.kpocket=!L0.kpocket;say(L0.kpocket?'🧥 Lunch money goes in the inside pocket from now on.':'🧥 Back pocket it is.')}});
    if(gMetCount()>0)a.push({ic:'🤝',l:`Habit: walk to the bus stop with a friend: ${onOff(L0.buddy)}`,s:'Strength in numbers. Tap to change.',cat:'kids',fn:()=>{L0.buddy=!L0.buddy;say(L0.buddy?'🤝 You text your friend: meet at the corner, walk together.':'🤝 You’ll walk on your own.')}});
  }
  if(S.loc==='library'&&!L0.kmap&&(S.age||12)>=13&&isOpen('library'))
    a.push({ic:'🗺️',l:'Study the Link route map',s:'20 min, energy −2. For your first ride down the hill.',cat:'here',fn:()=>{L0.kmap=true;pass(20);adj('energy',-2);say('🗺️ Ms. Okafor prints you the T Line map and highlights the stops. You trace it twice: MLK, the hospitals, Stadium, downtown.')}});
  return a;
}
{const ah=actionsHere;actionsHere=function(){const a=ah();if(isGrow()||!S)return a;try{return adultActs(a)}catch(e){console.error(e);return a}}}
{const ah=GROW.actionsHere;GROW.actionsHere=function(){const a=ah();try{return growActs(a)}catch(e){console.error(e);return a}}}
// the jar on the Here tab
{const st=statusTags;statusTags=function(){const t=st()||[];try{if(!isGrow()&&S.lev&&S.lev.jar>0)t.push(`<span class="tag">🫙 jar ${$(S.lev.jar)}</span>`)}catch(e){}return t}}

window.LEV={ids:IDS,S:LV};
})();
