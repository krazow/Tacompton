// ============================================================
//  TACOMPTON · GROWING UP, part 3: the rest of Tacoma opens up as you grow.
//  The ten neighborhood packs (22-hood-*.js) register their places in the adult game's table. This file puts the same places,
//  names and drawings into Growing Up's table (G_L), hidden until you're old enough, with kid versions of what to do there:
//    14 (a Youth ORCA card and high school): the Stadium District (a walk) and Downtown & the Dome District (the free Link)
//    15: Proctor & the North End, Ruston & Point Defiance, the South End        16: Old Town, the West End, the Eastside
//    17: Fern Hill and Northeast Tacoma
//  At 16, a first job downtown: the Copper Kettle café on Pacific Ave or the Museum of Glass gift shop. Shifts after school and on
//  weekends, Washington's minimum wage into Money. Curfew stays (8:30 PM at 12–13, 10 PM from 14), trips go through the hubs like the
//  adult game (Hilltop's stop is MLK, where the Link runs), and Go somewhere groups the places by neighborhood (05-ui.js does that).
//  Fares: Pierce Transit, Sound Transit and the other Puget Sound agencies are free for riders 18 and under (the Free Youth Transit
//  Pass, since Sept 2022), so a kid's ride costs nothing. GH_FARE is here in case that ever changes.
//  State: S.gh (made on first use, so older saves just work). No adult-only actions: no Dome concerts at night, nothing past curfew.
// ============================================================
(function(){
const GH_FARE=0;
const GH_OPEN={stadium:14,downtown:14,proctor:15,ruston:15,southend:15,oldtown:16,westend:16,eastside:16,fernhill:17,netacoma:17};
const ghAge=()=>(typeof S!=='undefined'&&S&&S.age)||12;
const ghOpen=h=>typeof S!=='undefined'&&!!S&&isGrow()&&!!HOODS[h]&&GH_OPEN[h]!=null&&ghAge()>=GH_OPEN[h];
function ghS(){const g=S.gh||(S.gh={hoods:{},told:{},done:{},job:null,worked:{},miss:0,shifts:0,paid:0,orca:0,rs:false});
  if(!g.toldInit){g.toldInit=true;for(const h in GH_OPEN)if(ghOpen(h))g.told[h]=true}   // a save that is already old enough: no announcement
  return g}
const ghHood=k=>(G_L[k]||{}).hood||null;
const sg=v=>(v>0?'+':'−')+Math.abs(v);

// ---- what the neighborhoods are like to a kid (the first visit) ----
const GH_BLURB={
  stadium:'Big old trees, brick houses with turrets, and a high school that looks like a castle. Fourteen minutes on foot from MLK, and nobody has to drive you.',
  downtown:'Down the hill on the free Link: brick warehouses, Union Station’s glass, the wooden Dome, and the Bridge of Glass. It feels like a real city, because it is one.',
  proctor:'A little main street with a movie theater, an ice-cream line out the door and a Saturday market. Your parents say it hasn’t changed since they were kids. They weren’t kids here.',
  ruston:'The bus runs out to the end of the peninsula: old forest, a pebble beach, a zoo, and the Olympics across the water.',
  southend:'South 38th: a bakery that opens before the sun, bubble tea, a phở counter, and every sign in two languages.',
  oldtown:'Where Tacoma started: a few steep blocks of old storefronts and wooden houses above a dock.',
  westend:'Out toward the Narrows, where the two bridges hum over the water and the community college sits among the shops.',
  eastside:'Portland Avenue’s porches, a taco truck with a line, and below it the tideflats: giant cranes and the Puyallup River meeting the bay. This is Puyallup homeland.',
  fernhill:'One of the oldest corners of South Tacoma: quiet streets, a diner, a thrift shop and a library with a garden out back.',
  netacoma:'Past the tideflats and up the hill: firs, quiet streets and a little white lighthouse at the end of the point.',
};
// kid versions of a place's icon or description (the rest comes from the pack)
const GH_PLACE={
  ot_corner:{ic:'🏪',desc:'The historic corner of old brick and wood storefronts, with a café on the corner. The replica Job Carr Cabin, Tacoma’s first post office, is a short walk up the hill'},
  dt_dome:{desc:'A huge wooden geodesic dome by the freeway, with Freighthouse Square’s food hall and the Tacoma Dome Station next door. Everybody in Tacoma has been inside it at least once'},
};

// ---- the places: the packs' own, in Growing Up's table, hidden until the neighborhood opens ----
for(const h in GH_OPEN){const H=HOODS[h];if(!H)continue;
  for(const k of Object.keys(H.places)){const p=L_ADULT[k]||H.places[k],x=GH_PLACE[k]||{};if(G_L[k])continue;
    G_L[k]={hood:h,name:p.name,ic:x.ic||p.ic,desc:x.desc||p.desc,hours:p.hours,art:o=>p.art(o)+gRainArt(),get hidden(){return !ghOpen(h)}}}}

// ---- getting there: walk to your stop, ride, walk from the other stop (MLK is Hilltop's stop) ----
{const tm0=GROW.travelMins;
  GROW.travelMins=(a,b)=>{const ha=ghHood(a),hb=ghHood(b);
    if(!ha&&!hb) return tm0(a,b);
    if(ha===hb) return TRAVEL[a+'|'+b]??TRAVEL[b+'|'+a]??10;
    const leg=(k,h)=>{if(!h)return k==='mlk'?0:tm0(k,'mlk');const hub=HOODS[h].hub;return k===hub?0:(TRAVEL[k+'|'+hub]??TRAVEL[hub+'|'+k]??8)};
    const ride=h=>h?HOODS[h].ride.mins:0;
    return leg(a,ha)+leg(b,hb)+(ha&&hb?Math.max(ride(ha),ride(hb))+6:ride(ha)+ride(hb))}}
const ghFare=(a,b)=>{const ha=ghHood(a),hb=ghHood(b);if(ha===hb)return 0;const rides=[ha,hb].filter(h=>h&&!/Walk/.test(HOODS[h].ride.via));return rides.length?gRp(GH_FARE):0};

// ---- the first job (16+) ----
const GH_JOBS={
  cafe:{id:'cafe',n:'the Copper Kettle',ic:'☕',role:'café crew',at:'dt_pacific',shifts:{1:[960,1140],3:[960,1140],5:[600,900]},
    when:'Tuesdays and Thursdays 4–7 PM, after school, and Saturdays 10 AM–3 PM',
    pitch:'A café in an old brick warehouse on Pacific Ave, across from Union Station (made up, like every business here). The manager, Rosalind, needs somebody for the register, the tables and, someday, the espresso machine.',
    work:['☕ Tables, the register, a line of UW Tacoma students who all want oat milk. Rosalind shows you how to steam it without screaming the pitcher. Almost.','☕ A slow afternoon: you restock cups, refill the sugar, and learn the regulars. The man in the bow tie wants “the usual.” You learn the usual.','☕ A rush right before close. You drop one muffin and save three. Rosalind says “That’s a good ratio,” and means it.','☕ You make your first real latte. The foam leaf looks like a potato. The customer tips a dollar anyway.']},
  gift:{id:'gift',n:'the Museum of Glass gift shop',ic:'🔮',role:'gift shop clerk',at:'dt_glass',shifts:{5:[600,960],6:[660,960]},
    when:'Saturdays 10 AM–4 PM and Sundays 11 AM–4 PM',
    pitch:'The shop by the museum doors: glass paperweights, art books, kids’ kits, and visitors from all over asking where the Hot Shop is. The shop lead, Mr. Ferreira, says the first rule is to carry everything with two hands.',
    work:['🔮 You wrap a glass bowl in four layers of tissue for a lady from Spokane. She says you have “museum hands.” You decide that’s a compliment.','🔮 Restocking paperweights, very slowly. A kid asks if they’re magic. You say “kind of.” His mom buys two.','🔮 A busy Saturday: tour groups, a field trip, a man who wants a receipt for a postcard. Between rushes you watch the glassblowers through the window.','🔮 Mr. Ferreira teaches you the register’s secret button. There is no secret button. It’s a joke he does with every new hire.']},
};
const ghWage=()=>{const y=dateOf(day()).y;return y<=2026?17.13:y===2027?17.73:Math.round(17.73*Math.pow(1.03,y-2027)*100)/100};   // Washington's minimum wage (L&I): $17.13 in 2026, $17.73 in 2027; 16- and 17-year-olds get the full rate
const ghJob=()=>{const g=ghS();return g.job?GH_JOBS[g.job.id]:null};
function ghShift(d=day()){const g=ghS(),J=ghJob();if(!J||d<g.job.since)return null;return J.shifts[((d%7)+7)%7]||null}
const ghDays=J=>Object.keys(J.shifts).map(k=>DAYS[k].slice(0,3)).join(', ');
function ghApply(J){
  modal(`${J.ic} A job at ${J.n}`,`<p>${J.pitch}</p><p>🗓️ <b>${J.when}</b>. Pay: <b>${$(ghWage())} an hour</b>, Washington’s minimum wage, and it goes straight into your Money.</p>
    <p>📝 Mom and Dad sign the parent/school authorization form (Washington wants one for every worker under 18), and you start tomorrow. Miss three shifts and they’ll find somebody else.</p>`,[
    {l:'✅ Take the job',s:`Shifts start tomorrow.`,fn:()=>{const g=ghS();g.job={id:J.id,since:day()+1,hired:day()};g.miss=0;adj('mood',6);adj('family',3);
      lifeMoment(J.ic,`First job: ${J.role} at ${J.n}.`);say(`${J.ic} You’re hired: ${J.role} at ${J.n}. Dad frames the offer email. Not literally. He prints it and puts it on the fridge. Mood +6.`)}},
    {l:'Not right now',fn:()=>{}}]);
}
function ghJobActs(loc,d,m){
  const a=[],g=ghS(),mine=ghJob();
  for(const J of Object.values(GH_JOBS)){if(J.at!==loc)continue;
    if(mine&&mine.id===J.id){
      const sh=ghShift(d),done=d in g.worked,wage=ghWage();
      if(sh&&!done&&m<sh[1]-60){const late=Math.max(0,m-sh[0]);
        a.push({ic:J.ic,l:`Work your shift (${fmt(sh[0])}–${fmt(sh[1])})`,s:m<sh[0]?`Starts in ${sh[0]-m} min: you wait in the back. ${$(wage)}/hr.`:late<=5?`On time. ${$(wage)}/hr, energy −${Math.round((sh[1]-m)/30)}.`:`You’re ${late} min late. Go in now.`,cat:'work',cls:'primary',
          fn:()=>{if(tod()<sh[0])pass(sh[0]-tod());const st=tod(),lt=Math.max(0,st-sh[0]-5),mins=sh[1]-st,pay=Math.round(mins/60*wage);pass(mins);
            g.worked[d]=lt;g.shifts++;g.paid+=pay;gEarn(pay);adj('energy',-Math.round(mins/30));adj('mood',2);
            say(`${pick(J.work)} You earn <b>${$(pay)}</b> for ${Math.round(mins/6)/10} hours${lt?`, and the ${lt} minutes late get a look. A nice look, but a look`:''}.`)}});
      }else if(sh&&done) a.push({ic:'✔️',l:'Shift done',s:`Next: ${ghDays(J)}.`,cat:'work',dis:true,fn:()=>{}});
      a.push({ic:'👋',l:`Give your notice at ${J.n}`,s:`You work ${J.when}. ${g.shifts} shift${g.shifts===1?'':'s'} so far, ${$(g.paid)} earned.`,cat:'work',fn:()=>{g.job=null;say(`${J.ic} You give your notice. The crew signs a card. You can come back any time, they say, and they mean it.`)}});
    }else if(ghAge()>=16&&!mine){
      a.push({ic:'💼',l:`Ask about the part-time job at ${J.n}`,s:`There’s a “Now hiring: 16+” sign. ${J.when}.`,cat:'work',fn:()=>{pass(15);ghApply(J)}});
    }else if(ghAge()<16) a.push({ic:'💼',l:`“Now hiring: 16+”`,s:`A sign in the window at ${J.n}. ${ghAge()===15?'Next year.':'Someday.'}`,cat:'work',dis:true,fn:()=>{}});
  }
  return a;
}

// ---- things to do: kid versions of each place ----
// A({k:once-a-day key, ic, l, mins, cost, e, mo, fa, gr, fr:friendship with a friend who comes along, open, closed, txt:[...], cat})
function ghPal(){const met=KIDS.filter(k=>gMet(k.id)).sort((a,b)=>gF(b.id)-gF(a.id));return met.length?met[Math.floor(Math.random()*Math.min(2,met.length))]:null}
function A(o){
  const d=day(),g=ghS(),key=o.k?`${d}|${S.loc}|${o.k}`:null,done=!!(key&&g.done[key]),c=o.cost?gRp(o.cost):0,open=o.open!==false,ok=S.money>=c;
  const fx=[o.e?`energy ${sg(o.e)}`:'',o.mo?`mood ${sg(o.mo)}`:'',o.fa?`family ${sg(o.fa)}`:'',o.gr?`grades ${sg(o.gr)}`:'',o.fr&&gMetCount()?'a friend comes along':''].filter(Boolean).join(', ');
  return {ic:o.ic,l:o.l+(c?` — ${$(c)}`:''),cat:o.cat||'fun',cls:o.cls||'',dis:!open||done||!ok,
    s:!open?o.closed:done?'Done for today.':!ok?`You have ${$(Math.round(S.money))}.`:`${o.mins} min.${fx?` ${cap(fx)}.`:''}${o.k?' Once a day.':''}`,
    fn:()=>{if(c)gSpend(c);if(key)g.done[key]=true;const p=o.fr?ghPal():null;pass(o.mins);
      if(o.e)adj('energy',o.e);if(o.mo)adj('mood',o.mo);if(o.fa)adj('family',o.fa);if(o.gr)S.grades=clamp(gGrades()+o.gr,0,100);if(p)gFriend(p.id,o.fr);
      const t=typeof o.txt==='function'?o.txt():pick(o.txt);say((p?`${p.ic} ${p.n} meets you there. `:'')+t)}};
}
const at=(lo,hi)=>tod()>=lo&&tod()<hi;
const GH_ACTS={
  st_park:()=>[
    A({k:'walk',ic:'🌳',l:'Walk under the big trees',mins:25,mo:4,cat:'rest',txt:['🌳 Trees older than the paved streets, a duck pond, a man doing slow tai chi by the water. You walk the long loop twice.','🌳 Squirrels the size of cats and a toddler negotiating with a pigeon. You sit on a bench and let the afternoon happen.']}),
    A({k:'dome',ic:'🏛️',l:'Wander through the conservatory',mins:40,mo:6,gr:1,open:at(600,960),closed:'The Seymour Conservatory is open about 10 AM to 4 PM.',txt:['🏛️ Under the old glass dome it smells like wet earth: palms, orchids, a fig tree and a lily pond. A volunteer shows you a plant that eats bugs. You will be telling people about it all week.','🏛️ A cactus room, a fern room and a sign about how the building was shipped here in pieces in 1908. You read every label. It counts as science.']}),
    A({k:'lawn',ic:'🥏',l:'Throw a frisbee on the lawn',mins:60,e:-6,mo:6,fr:3,txt:['🥏 Mostly you throw it into a tree. Once it flies perfectly, across the whole lawn, and you both scream.','🥏 A dog joins the game without asking. The dog is the best player.']}),
  ],
  st_shops:()=>{const o=isOpen('st_shops');return [
    A({k:'bun',ic:'☕',l:'Hot chocolate and a cardamom bun at The Slow Pour',mins:30,cost:6,e:6,mo:3,cat:'money',open:o,closed:hoursTxt('st_shops'),txt:['☕ The barista draws a heart in your hot chocolate without being asked. The bun is still warm. You sit at the window like a grown-up.','☕ A tiny table, a giant cardamom bun, and the sound of the espresso machine. You do your reading log here. It’s the best reading log of your life.']}),
    A({k:'book',ic:'📖',l:'Browse the teen shelf at Fern & Folio',mins:40,cost:8,mo:5,gr:1,cat:'money',open:o,closed:hoursTxt('st_shops'),txt:['📖 The shop cat, Comma, is asleep on the graphic novels. You read one standing up, then buy a used paperback with somebody’s notes in the margins.','📖 Odalys, the owner, asks what you liked last. Then she hands you exactly the right book. It’s a little scary how good she is.']}),
  ]},
  st_castle:()=>{const d=day(),ss=sunsetOn(d),ok=at(ss-50,ss+15);return [
    A({k:'look',ic:'🏰',l:'Look up at the castle school',mins:20,mo:3,cat:'here',txt:['🏰 It was built as a grand hotel in the 1890s, burned, and became a high school. Kids here have a castle for a hallway. Hilltop High has a really good mural, so it’s even.','🏰 Turrets, slate roofs and the bay behind it. A Stadium kid on the lawn says, “Yeah, we know. It’s our whole personality.”']}),
    A({k:'sunset',ic:'🌇',l:'Watch the sunset from the bluff',mins:30,mo:8,cat:'fun',open:ok,closed:tod()<ss?`Sunset ${fmt(ss)}. Best from ${fmt(ss-50)}.`:`Sunset was ${fmt(ss)}.`,txt:['🌇 The brick turns apricot and the bay turns to brass. Then you check the time and start walking: curfew.','🌇 The turrets go gold, then pink, then black against a purple sky. The port lights come on one by one below.']}),
  ]},
  dt_pacific:()=>[
    A({k:'station',ic:'🚉',l:'Look at the glass in Union Station',mins:25,mo:4,cat:'here',open:at(480,1020)&&day()%7<5,closed:'The station hall is open weekdays, during the day.',txt:['🚉 A huge chandelier of orange, blue and gold glass hangs in the window of the old train station. You lie down on the bench to see it better. A guard says that’s allowed. You think.','🚉 The station is a courthouse now, but nobody calls it that. The glass in the window glows even on a gray day.']}),
    A({k:'uwt',ic:'🎓',l:'Walk through UW Tacoma',mins:30,mo:3,gr:1,cat:'here',txt:['🎓 The old warehouses are classrooms now. You walk the brick stairs with college students and try to look like you belong. One of them holds the door for you.','🎓 A poster for a summer program for high schoolers. You take a picture of it. Mom will want to see.']}),
    A({k:'slice',ic:'🍕',l:'A slice and a soda on Pacific Ave',mins:25,cost:6,e:10,mo:2,cat:'money',open:at(660,1260),closed:'The pizza counter opens at 11 AM.',txt:['🍕 A slice the size of your head, folded in half like a local. You eat it watching the Link glide by.','🍕 The guy at the counter remembers you from last time. That’s how you know you’re a regular.']}),
  ],
  dt_dome:()=>[
    A({k:'trains',ic:'🚆',l:'Watch the trains at Tacoma Dome Station',mins:30,mo:4,cat:'here',txt:['🚆 The Sounder pulls in, a bus pulls out, and the Link waits at the end of its line. You count the cars. You’re not a train kid. You might be a train kid.','🚆 From the walkway you can see the whole Dome, wooden and enormous, like somebody parked a planet by the freeway.']}),
    A({k:'food',ic:'🥟',l:'Lunch at the Freighthouse Square food hall',mins:40,cost:8,e:12,mo:3,fr:2,cat:'money',open:at(660,1140),closed:'The food hall is open 11 AM to 7 PM.',txt:['🥟 Dumplings from one counter, a mango drink from another, a long table under the old warehouse beams.','🥟 You split three things three ways. The best one is the one you almost didn’t order.']}),
  ],
  dt_glass:()=>{const o=isOpen('dt_glass');return [
    A({k:'bridge',ic:'🌉',l:'Walk the Bridge of Glass',mins:20,mo:5,cat:'here',txt:['🌉 The ceiling of the bridge is filled with glass shapes lit by the sky: sea creatures, flowers, things with no names. Cars pass underneath, not knowing.','🌉 Two towers of blue glass glow like ice in the sun. You take the same picture four times.']}),
    A({k:'hot',ic:'🔥',l:'Watch the glassblowers in the Hot Shop — student ticket',mins:60,cost:8,mo:8,gr:1,cat:'money',open:o,closed:hoursTxt('dt_glass'),txt:['🔥 A furnace roars and a team spins a glowing blob on the end of a pipe until it is, suddenly, a vase. The announcer explains every step. You hold your breath through the whole thing.','🔥 A visiting artist makes an octopus out of orange glass, leg by leg. The whole room claps when the last leg holds.']}),
  ]},
  pr_main:()=>[
    A({k:'ice',ic:'🍦',l:'Ice cream from the shop with the line',mins:30,cost:5,mo:6,fr:2,cat:'money',open:at(720,1260),closed:'The ice-cream shop opens at noon.',txt:['🍦 The line is twenty minutes. It is worth twenty minutes. Marionberry, in a waffle cone, on the curb.','🍦 You try four samples and get the first one, which is what everybody does.']}),
    A({k:'movie',ic:'🎬',l:'A matinee at the Starlite',mins:120,cost:9,mo:9,fr:3,cat:'fun',open:at(720,1140),closed:'Matinees run noon to 7 PM.',txt:['🎬 An old theater with a red curtain and a popcorn machine older than your parents. The movie is fine. The theater is amazing.','🎬 A space movie in a theater with stars painted on the ceiling. Afterwards, everything outside looks too bright.']}),
  ],
  pr_market:()=>{const o=isOpen('pr_market');return [
    A({k:'peach',ic:'🍑',l:'Walk the market and buy a peach',mins:40,cost:3,mo:5,e:4,cat:'money',open:o,closed:'The farmers market is Saturdays, 9 AM to 2 PM.',txt:['🍑 Free samples of honey, a fiddle player, a man selling bread shaped like a turtle. The peach is so ripe you have to eat it bent over.','🍑 A farmer gives you a second peach “for your little sister.” Nia will never know how close it came.']}),
  ]},
  pr_north:()=>[A({k:'walk',ic:'🌉',l:'Walk the North End to see the Narrows',mins:40,mo:5,e:-3,cat:'rest',txt:['🌉 Big old houses with porches the size of your apartment, and at the end of the street the Narrows Bridge, small and green and far away.','🌉 A woman watering her roses tells you which house is haunted. She is very specific.']})],
  ru_park:()=>[A({k:'hike',ic:'🥾',l:'Hike the trails under the old firs',mins:75,e:-8,mo:9,cat:'fun',txt:['🥾 Douglas firs so tall the light comes down green. A banana slug crosses the trail at its own speed. You let it.','🥾 You find a stump bigger than your kitchen table. You count rings until you lose track at about two hundred.']})],
  ru_beach:()=>[
    A({k:'rocks',ic:'🪨',l:'Skip rocks at Owen Beach',mins:40,mo:6,fr:2,cat:'fun',txt:['🪨 Your record is five skips. Then, once, seven. Nobody saw it. You saw it.','🪨 Flat rocks, flat water, Vashon across the way. The ferry goes by twice.']}),
    A({k:'fort',ic:'🪵',l:'Build a driftwood fort',mins:60,e:-6,mo:7,fr:3,cat:'fun',txt:['🪵 Silver logs, a tarp somebody left, and a door that mostly closes. A little kid asks if he can live in it.','🪵 It takes an hour and it is the best building in Tacoma.']}),
  ],
  ru_zoo:()=>{const o=isOpen('ru_zoo');return [
    A({k:'zoo',ic:'🦈',l:'The zoo and aquarium — teen ticket',mins:120,cost:14,mo:9,gr:1,cat:'money',open:o,closed:hoursTxt('ru_zoo'),txt:['🦈 Sharks gliding over your head in the Pacific Seas tunnel, red wolves asleep in a pile, a walrus who seems to be showing off. You read every sign.','🐙 The octopus is hiding. Then it isn’t. It looks right at you for a full minute. You think about it on the whole bus ride home.']}),
  ]},
  so_a:()=>[
    A({k:'banh',ic:'🥖',l:'A bánh mì from the bakery',mins:25,cost:6,e:10,mo:3,cat:'money',open:at(420,1140),closed:'The bakery is open 7 AM to 7 PM.',txt:['🥖 Crackly bread, pickled carrots, a lot of cilantro. The lady at the counter calls you “con” like you’re family.','🥖 You get two. One for the bus.']}),
    A({k:'boba',ic:'🧋',l:'Bubble tea on South 38th',mins:30,cost:5,mo:4,fr:3,cat:'money',open:at(660,1260),closed:'The tea shop opens at 11 AM.',txt:['🧋 Taro, extra pearls, a table by the window and an argument about which superhero would win.','🧋 The tea shop has a wall of sticky notes. You add one. It says HILLTOP.']}),
  ],
  so_b:()=>{const fri=day()%7===4&&season()==='fall',game=fri&&at(1110,1290);return [
    A({k:'track',ic:'🏃',l:'Run laps at Lincoln Bowl',mins:40,e:-8,mo:5,cat:'fun',txt:['🏃 Four laps on the old track. A Lincoln runner passes you twice and says “good pace” both times. Liar. Nice liar.','🏃 The bleachers are empty and huge. You run the stairs once, and that is enough stairs.']}),
    ...(fri?[A({k:'game',ic:'🏈',l:'Friday night football at Lincoln Bowl — student ticket',mins:120,cost:5,mo:10,fr:3,cat:'fun',open:game,closed:'Kickoff is at 7 PM. Home by 10.',txt:['🏈 The band, the lights, the whole South End in the bleachers. You don’t know the rules all the way and you yell anyway.','🏈 A late touchdown, the band plays the fight song, and you leave at the start of the fourth quarter to make curfew. Worth it.']})]:[]),
  ]},
  so_c:()=>[A({k:'soccer',ic:'⚽',l:'Join the pickup soccer game',mins:60,e:-8,mo:7,cat:'fun',txt:['⚽ “We need one more!” You’re in. You score once, mostly by accident, and get high-fives from people whose names you never learn.','⚽ An uncle in sandals runs the whole game. He is the best player by a lot.']})],
  we_view:()=>[A({k:'bridge',ic:'🌉',l:'Read the sign about Galloping Gertie',mins:30,mo:4,gr:1,cat:'here',txt:['🌉 In 1940 the first bridge here twisted in the wind like a ribbon and fell into the Narrows. The new ones are fine. You watch them a long time anyway.','🌉 The sign has a photo of the bridge bending. Engineers learned a lot that day. So did you.']})],
  we_tcc:()=>{const g=ghS(),o=isOpen('we_tcc');return [
    ...(ghAge()>=16&&!g.rs?[{ic:'📝',l:'Ask about Running Start',s:o?'30 min. High school juniors and seniors in Washington can take college classes here, tuition-free. Grades +2.':hoursTxt('we_tcc'),cat:'school',dis:!o,
      fn:()=>{pass(30);g.rs=true;S.grades=clamp(gGrades()+2,0,100);adj('mood',4);lifeMoment('📝','Found out about Running Start at TCC.');
        say('📝 An advisor walks you through it: junior and senior year, college classes on this campus, credits for both high school and college, and no tuition. You leave with a folder and a feeling.')}}]:[]),
    A({k:'quad',ic:'🎓',l:'Sit on the quad and read',mins:40,mo:3,gr:1,cat:'rest',txt:['🎓 College students carrying coffee and textbooks walk past like it’s normal. It is normal. For them.','🎓 A bench, a book and nobody asking you to do anything. You finish two chapters.']}),
  ]},
  we_shops:()=>{const o=isOpen('we_shops');return [
    A({k:'noodle',ic:'🍜',l:'Noodles at the counter on Jackson Ave',mins:30,cost:7,e:12,mo:3,cat:'money',open:at(660,1230),closed:'The noodle counter opens at 11 AM.',txt:['🍜 A huge bowl, a counter stool and a cook who flips noodles like it’s nothing.','🍜 Too spicy. You finish it anyway, crying a little, proud.']}),
    A({k:'thrift',ic:'🧥',l:'Dig through the thrift store',mins:45,cost:6,mo:5,cat:'money',open:o,closed:hoursTxt('we_shops'),txt:['🧥 A jean jacket that fits perfectly, for six dollars. You will wear it until it falls apart.','🧥 A board game with all its pieces (you check), for the family. Family game night is happening whether they like it or not.']}),
  ]},
  ot_corner:()=>[
    A({k:'cabin',ic:'🪵',l:'Visit the Job Carr Cabin',mins:30,mo:3,gr:1,cat:'here',open:at(720,960)&&day()%7>=2,closed:'The cabin museum is open Wednesday to Sunday afternoons.',txt:['🪵 A one-room log cabin, Tacoma’s first post office. The volunteer lets you hold a quill pen.','🪵 The volunteer says the whole city started right here, with one family and a view. It’s a very good view.']}),
    A({k:'cider',ic:'☕',l:'Hot cider at the corner café',mins:25,cost:4,e:4,mo:3,cat:'money',open:at(420,1140),closed:'The café is open 7 AM to 7 PM.',txt:['☕ Hot cider with a cinnamon stick, at a table in the window of a building from the 1880s.','☕ The café has a jar of dog treats and a jar of lollipops. The owner says the lollipops are for you.']}),
  ],
  ot_dock:()=>{const ok=at(600,1110)&&season()!=='winter';return [
    A({k:'kayak',ic:'🛶',l:'Rent a kayak for an hour (life jacket on)',mins:75,cost:15,e:-8,mo:10,fr:2,cat:'fun',open:ok,closed:season()==='winter'?'The kayak shed is closed for the winter.':'Kayaks go out 10 AM to 6:30 PM.',txt:['🛶 You paddle out past the dock. A harbor seal pops up, looks at you like you owe it money, and sinks.','🛶 The city looks different from the water: the hill, the cranes, the mountain. You go in circles for a while. On purpose, you tell everyone.']}),
    A({k:'sit',ic:'⚓',l:'Sit on the end of the dock',mins:30,mo:5,cat:'rest',txt:['⚓ Your feet over the water, the boats creaking, a heron standing so still you think it’s a statue.','⚓ Gulls, a sailboat, the smell of salt. You don’t look at your phone once.']}),
  ]},
  ot_hill:()=>[A({k:'walk',ic:'🏡',l:'Climb the steep old street',mins:25,e:-4,mo:4,cat:'rest',txt:['🏡 Picket fences, porches, a cat on every third step, and the bay between the roofs.','🏡 Your legs hate this hill. Your eyes love it.']})],
  ea_portland:()=>{const o=isOpen('ea_portland'),sat=day()%7===5;return [
    A({k:'pantry',ic:'🥫',l:'Volunteer at the Family Hall food pantry',mins:120,e:-6,mo:7,fa:3,cat:'kids',open:o&&sat&&at(540,840),closed:'The pantry needs teen volunteers on Saturdays, 9 AM to 2 PM.',txt:['🥫 You stack cans, hand out bags, and learn how to say thank you in three languages. Mom is very proud and says so in front of people.','🥫 A grandma tells you you have good manners. You’re going to tell your mom that one.']}),
    A({k:'hoops',ic:'🏀',l:'Shoot around in the Family Hall gym',mins:45,e:-6,mo:5,fr:2,cat:'fun',open:o,closed:'The Family Hall opens at 8 AM.',txt:['🏀 Open gym. A pickup game with some Eastside kids. You hold your own.','🏀 The gym smells like every gym ever. You hit three in a row and pretend it was normal.']}),
  ]},
  ea_port:()=>[A({k:'cranes',ic:'🏗️',l:'Watch the cranes load a ship',mins:30,mo:4,cat:'here',txt:['🏗️ A crane the size of a building lifts a container like it’s a shoebox and sets it down without a sound.','🏗️ A ship from across the Pacific is being unloaded. Somewhere in there is somebody’s new sneakers.']})],
  ea_taco:()=>{const o=isOpen('ea_taco');return [A({k:'tacos',ic:'🌮',l:'Tacos from the truck',mins:25,cost:6,e:12,mo:4,fr:2,cat:'money',open:o,closed:hoursTxt('ea_taco'),txt:['🌮 Three tacos al pastor, a lime and a folding chair. Perfect.','🌮 The guy in the truck adds a free horchata because you said “please” right.']})]},
  fh_main:()=>{const o=isOpen('fh_main');return [
    A({k:'diner',ic:'🥞',l:'Breakfast at the diner',mins:40,cost:8,e:14,mo:4,cat:'money',open:o&&tod()<840,closed:'Breakfast is served until 2 PM.',txt:['🥞 Pancakes as big as the plate, and the waitress calls everyone “hon.” Including you.','🥞 A booth by the window and bottomless hot chocolate. You do not test the bottom.']}),
    A({k:'thrift',ic:'🧸',l:'Browse the thrift shop',mins:40,cost:5,mo:5,cat:'money',open:o,closed:hoursTxt('fh_main'),txt:['🧸 A box of old comics for five dollars. You read three on the bus.','🧸 A stuffed owl for Nia. It is the ugliest owl in Tacoma. She will love it.']}),
  ]},
  fh_library:()=>{const o=isOpen('fh_library');return [A({k:'study',ic:'📚',l:'Study at the library',mins:60,mo:-1,gr:2,cat:'school',open:o,closed:hoursTxt('fh_library'),txt:['📚 A quiet table, big windows and your whole chemistry chapter. You actually get it.','📚 The librarian finds you a practice test online and a free printer. Grades, here you come.']})]},
  fh_garden:()=>[A({k:'weed',ic:'🌻',l:'Help weed the community garden',mins:45,e:-5,mo:6,fa:2,cat:'kids',txt:['🌻 A gardener named Bea shows you which green things are weeds and which are dinner. She sends you home with zucchini. So much zucchini.','🌻 Dirt under your nails, a sunflower taller than you, and a jar of honey from the hive in the corner.']})],
  ne_point:()=>[A({k:'pools',ic:'🦀',l:'Explore the tide pools at Browns Point',mins:45,mo:7,gr:1,cat:'fun',txt:['🦀 Purple sea stars, a crab the size of a coin, anemones that close when you touch them. Gently. You touch them gently.','🦀 The little white lighthouse, the port across the water, and Rainier floating over all of it.']})],
  ne_trail:()=>[A({k:'trail',ic:'🌲',l:'Walk the Ravine Trail',mins:50,e:-5,mo:7,cat:'rest',txt:['🌲 Ferns on every tree, a creek you can hear but not see, and nobody else at all.','🌲 A woodpecker, a deer, then another deer. You stop breathing so they’ll stay.']})],
  ne_corner:()=>{const o=isOpen('ne_corner');return [A({k:'pastry',ic:'🥐',l:'A pastry from the bakery',mins:20,cost:4,e:6,mo:3,cat:'money',open:o,closed:hoursTxt('ne_corner'),txt:['🥐 A croissant that shatters all over your hoodie. Worth it.','🥐 The baker gives you yesterday’s cookie for free. It’s still great.']})]},
};
// kid-safe fallback for a place a future pack adds
const ghLook=k=>A({k:'look',ic:'👀',l:'Look around',mins:20,mo:3,cat:'here',txt:[`👀 ${(G_L[k]||{}).desc||'You take it all in.'}.`]});

{const ah=GROW.actionsHere;
  GROW.actionsHere=()=>{const a=ah(),h=ghHood(S.loc);if(!h)return a;const d=day(),m=tod();
    let mine=[];try{mine=[...ghJobActs(S.loc,d,m),...(GH_ACTS[S.loc]?GH_ACTS[S.loc]():[ghLook(S.loc)])]}catch(e){console.error(e)}
    const back=travelMins(S.loc,'home'),leave=gCurfew()-back;
    mine.push({ic:'🏠',l:`Head home (${back} min)`,s:m>=leave?`Curfew is ${fmt(gCurfew())}. Go now!`:`Curfew is ${fmt(gCurfew())}: leave by ${fmt(leave)}.`,cat:'rest',cls:m>=leave-30?'primary':'',fn:()=>go('home')});
    return mine.concat(a)}}
G_CATS.work='💼 Your job';

// ---- arriving, the fare, curfew ----
{const oa=GROW.onArrive;
  GROW.onArrive=(dest,from)=>{oa(dest,from);if(S.loc!==dest)return;const h=ghHood(dest),hf=ghHood(from);if(!h||h===hf)return;
    const g=ghS(),f=ghFare(from,dest);
    if(f>0)gSpend(f);
    if(!/Walk/.test(HOODS[h].ride.via)&&!g.orca){g.orca=day()+1;say('🪪 You tap your Youth ORCA card on the reader. Free: riders 18 and under ride Pierce Transit buses and the Link for nothing in this part of Washington.')}
    if(!g.hoods[h]){g.hoods[h]=day()+1;say(`${HOODS[h].ic} <b>${HOODS[h].name}</b>. ${GH_BLURB[h]||HOODS[h].blurb}`);const n=Object.keys(g.hoods).length;
      if(n===1)lifeMoment('🗺️',`First trip off the hill on your own: ${HOODS[h].name}.`);if(n===Object.keys(GH_OPEN).length)lifeMoment('🗺️','Been to every neighborhood in Tacoma.')}
    const back=travelMins(dest,'home');if(tod()+back>gCurfew()-20)say(`📱 Mom texts: “Curfew is ${fmt(gCurfew())}. It’s ${back} minutes home from there.”`)}}
{const ab=GROW.alertBar;
  GROW.alertBar=()=>{const r=ab();if(r)return r;const m=tod(),sh=ghShift();
    if(ghHood(S.loc)){const back=travelMins(S.loc,'home');if(m>=gCurfew()-back-30&&m<gCurfew())return {t:`🏠 Home by ${fmt(gCurfew())}. It’s ${back} minutes from here: leave by ${fmt(gCurfew()-back)}.`}}
    const J=ghJob();if(J&&sh&&!(day() in ghS().worked)&&m>=sh[0]-60&&m<sh[1]-60&&S.loc!==J.at)return {t:`${J.ic} Your shift at ${J.n} is ${fmt(sh[0])}–${fmt(sh[1])}. It’s ${travelMins(S.loc,J.at)} min away.`,kind:'info'};
    return null}}
{const stg=GROW.statusTags;
  GROW.statusTags=()=>{const t=stg(),J=ghJob(),sh=ghShift();if(J&&sh)t.push(`<span class="tag">${J.ic} shift ${fmt(sh[0])}–${fmt(sh[1])}${day() in ghS().worked?' ✔':''}</span>`);return t}}
{const td=GROW.todoItems;
  GROW.todoItems=()=>{const it=td(),J=ghJob(),sh=ghShift(),d=day();
    if(J&&sh)it.splice(1,0,{l:`${J.ic} Work your shift at ${J.n}`,s:`${fmt(sh[0])}–${fmt(sh[1])}, ${G_L[J.at].name}. ${$(ghWage())}/hr.`,ok:d in ghS().worked,fail:!(d in ghS().worked)&&tod()>=sh[1]-60,urgent:tod()>=sh[0]-60});
    return it}}
// a missed shift: three and they let you go
{const on=GROW.onNight;
  GROW.onNight=(where,notes,d)=>{on(where,notes,d);const g=ghS(),J=ghJob();if(!J||!ghShift(d)||d in g.worked)return;
    g.miss++;if(g.miss>=3){g.job=null;g.miss=0;adj('mood',-4);notes.push(`${J.ic} You missed a third shift at ${J.n}, and they let you go. It stings. You can ask again when you’re ready.`)}
    else notes.push(`${J.ic} You missed your shift at ${J.n}. The manager texts: “Everything okay? See you next time.” (${g.miss} of 3)`)}}

// ---- growing up: new neighborhoods on a birthday, and on the first morning of a save that's already old enough ----
function ghAnnounce(lines){
  if(!isGrow())return;const g=ghS(),nw=Object.keys(GH_OPEN).filter(h=>ghOpen(h)&&!g.told[h]);if(!nw.length)return;nw.forEach(h=>g.told[h]=true);
  const names=nw.map(h=>`${HOODS[h].ic} ${HOODS[h].name}`),list=names.length<2?names[0]:names.slice(0,-1).join(', ')+' and '+names[names.length-1];
  if(nw.includes('downtown')||nw.includes('stadium')){lines.push(`🪪 A Youth ORCA card in your birthday card from Mom and Dad: free rides for anyone 18 and under. You can go off the hill on your own now: ${list}. Home by ${fmt(gCurfew())}.`);lifeMoment('🪪','A Youth ORCA card, and the city opens up.')}
  else lines.push(`🗺️ Mom and Dad say you can take the bus farther on your own now: ${list}. Check Go somewhere.`);
  if(ghAge()===16)lines.push('💼 Downtown is hiring too: the Copper Kettle café on Pacific Ave and the Museum of Glass gift shop both have “Now hiring: 16+” signs.');
}
{const lb=lifeBirthday;lifeBirthday=function(age,played){const lines=lb(age,played);try{ghAnnounce(lines)}catch(e){console.error(e)}return lines}}
{const ng=GROW.onNewGame;GROW.onNewGame=()=>{ng();const g=ghS(),open=Object.keys(GH_OPEN).filter(ghOpen);
  if(open.length)say(`🪪 Your Youth ORCA card is in your backpack: free rides for anyone 18 and under. You’re allowed off the hill on your own: ${open.map(h=>HOODS[h].name).join(', ')}. Home by ${fmt(gCurfew())}.`)}}

// ---- the time between key weeks: a job keeps paying ----
{const lc=lifeChoices;lifeChoices=function(){const r=lc();if(!isGrow())return r;const J=ghJob();
  if(J)r.forEach(c=>{if(c.k==='work'){c.l=`${J.ic} Pick up extra shifts at ${J.n}`;c.s=`More weekend shifts at ${J.n}: money up, grades a little down.`}});return r}}
LIFE_HOOKS.skip.push((from,to,ch,notes)=>{if(!isGrow()||S.age>=18)return;const g=ghS(),J=ghJob();if(!J)return;
  const wk=Math.floor((to-from+1)/7);if(wk<1)return;
  const pay=ch==='work'?0:Math.round(wk*4*ghWage());   // the "extra shifts" choice is paid by 10-life.js; otherwise about one shift a week
  if(pay){gEarn(pay);g.shifts+=wk;g.paid+=pay}
  notes.push(`${J.ic} ${ch==='work'?'Extra':'Your'} shifts at ${J.n}${pay?`: ${$(pay)} into your Money`:''}.`)});

// ---- kid-appropriate things that happen in the neighborhoods ----
const ghEv=(id,places,tile,run,o)=>gEvent(Object.assign({id,hook:'arrive',tile,chance:0.3,cooldown:10,cond:c=>places.includes(c.at)&&S.loc===c.at&&tod()<gCurfew()-30,run},o||{}));
ghEv('gh_frisbee',['st_park'],['🥏','A frisbee at your feet','good'],()=>{pass(20);adj('mood',4);adj('energy',-2);say('🥏 A frisbee lands at your feet. “Little help?” Twenty minutes later you’re on a team with three college kids and a golden retriever, and you’re winning.')});
ghEv('gh_band',['st_castle'],['🎺','The band practices','good'],()=>{adj('mood',4);say('🎺 The Stadium marching band is practicing on the field below the castle. One long wobbly tuba note, a drum major yelling “again from bar twelve!”, and then, suddenly, it clicks. You clap. They bow, then groan, then start bar twelve again.')},{cond:c=>c.at==='st_castle'&&S.loc==='st_castle'&&season()==='fall'&&tod()>=900&&tod()<1140});
ghEv('gh_busker',['dt_pacific'],['🎷','A busker on Pacific Ave','good'],()=>{const c=Math.min(1,Math.floor(S.money));if(c)gSpend(c);adj('mood',4);say(`🎷 A saxophone player outside Union Station takes requests. You ask for the song your dad sings in the kitchen. He knows it.${c?` You drop ${$(c)} in the case.`:''}`)});
ghEv('gh_hotshop',['dt_glass'],['🔥','A free look at the furnace','good'],()=>{adj('mood',3);S.grades=clamp(gGrades()+1,0,100);say('🔥 Through the big window of the Hot Shop you watch a glassblower pull a glowing thread a meter long and twist it into a spiral. A little kid next to you says “whoa” for both of you.')});
ghEv('gh_eagle',['ru_park','ru_beach','ne_point'],['🦅','A bald eagle','good'],()=>{adj('mood',5);say('🦅 A bald eagle lands on a snag right above you, huge and unbothered, and stays there long enough for everybody on the path to stop and whisper.')});
ghEv('gh_seal',['ot_dock','ru_beach','ne_point'],['🦭','A harbor seal','good'],()=>{adj('mood',4);say('🦭 A harbor seal pokes its head out of the water, looks at you for a long time, and sinks without a ripple. You stay another ten minutes in case it comes back. It does.')});
ghEv('gh_lost',['pr_market','dt_dome','ru_zoo','st_park','fh_garden'],['🧒','A lost little kid','good'],()=>{pass(15);adj('mood',5);adj('family',2);say('🧒 A little boy is standing very still and very close to tears. You crouch down, ask his name, and walk him to the nearest grown-up in a vest. His mom finds him in four minutes and hugs you too. Family +2 when you tell the story at dinner.')},{cooldown:30});
ghEv('gh_samples',['pr_market'],['🍯','Free samples','good'],()=>{adj('mood',3);adj('energy',3);say('🍯 Honey on a tiny spoon, a cube of cheese, a slice of apple you can’t pronounce. You make the rounds twice. Nobody minds.')});
ghEv('gh_soccer',['so_c'],['⚽','They need a keeper','good'],()=>{pass(30);adj('mood',5);adj('energy',-4);say('⚽ The pickup game needs a goalkeeper. You stop exactly one shot, with your face, and the whole field cheers like it was the World Cup. It kind of was.')});
ghEv('gh_mural',['so_a','ea_portland'],['🎨','A mural going up','good'],()=>{pass(20);adj('mood',4);say('🎨 A crew is painting a mural on the side of a market: a grandmother, a dragon, a bus, a mountain. The artist lets you fill in a corner of the sky. It’s your second mural. You’re basically a professional.')},{cooldown:60});

// ---- tips, achievements and the end screen ----
G_TIPS.push(
  {id:'g_hoods',when:()=>S.loc==='home'&&Object.keys(GH_OPEN).some(ghOpen),get t(){return `🗺️ You can go off the hill on your own now. <b>🧭 Go somewhere</b> lists Tacoma by neighborhood: walk to the Stadium District, or ride the free Link downtown. Rides are free under 18. Home by <b>${fmt(gCurfew())}</b>.`}},
  {id:'g_job',when:()=>ghAge()>=16&&!ghS().job&&!gCh1(),t:'💼 Sixteen: you can work. The Copper Kettle on Pacific Ave and the Museum of Glass gift shop (both downtown) are hiring. Ask there.'});
ACH.push(...[
  {id:'g_orca',ic:'🪪',n:'Youth ORCA',d:'Growing Up: visit five neighborhoods beyond Hilltop.',test:()=>Object.keys(ghS().hoods).length>=5},
  {id:'g_paycheck',ic:'💼',n:'First Paycheck',d:'Growing Up: work a shift at your first job.',test:()=>ghS().shifts>=1},
].map(a=>{const t=a.test;return Object.assign(a,{test:c=>isGrow()&&!!S&&t(c)})}));
{const er=GROW.endRows;GROW.endRows=()=>{const r=er(),i=r.findIndex(x=>x[0]==='Places visited');
  if(i>=0){const ks=Object.keys(L).filter(k=>!L[k].hidden);r[i]=['Places visited',`${ks.filter(k=>S.visited[k]).length} of ${ks.length}`]}
  const g=ghS();if(g.shifts)r.push(['First job',`${g.job?GH_JOBS[g.job.id].n:'done'}: ${g.shifts} shift${g.shifts===1?'':'s'}, ${$(g.paid)}`]);return r}}

GROW.hoods={open:ghOpen,OPEN:GH_OPEN,JOBS:GH_JOBS,wage:ghWage,shift:ghShift,state:()=>ghS(),FARE:GH_FARE};
})();
