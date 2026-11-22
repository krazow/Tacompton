// ============================================================
//  TACOMPTON, part 1: the world.
//  Two weeks (Mon Aug 3 – Sun Aug 16, 2026) living on Hilltop in Tacoma, WA: a new apartment, a new job,
//  rent due on the last day, a fridge that keeps emptying and a neighborhood that's glad to meet you if you show up.
//  The shared state, the HUD, the jobs, the scenery, the six places, travel, the Here-tab actions, status tags,
//  the alert bar and the extra tabs. Events, tips, goals and scoring live in 21-story.js.
// ============================================================

// ---- game modes ----
// MODE 'adult' is this game, "Two weeks on Hilltop". MODE 'grow' is "Growing Up" (30-grow-world.js, 31-grow-story.js): the same
// engine, a 12-year-old's first week on Hilltop. setMode() (30-grow-world.js) swaps the per-mode data (L, STATS, SCENE, EXTRA_TABS,
// ACT_CATS, TIPS, LOSSES, FINISH_TEXT, RULES_HTML, GAME.days, the difficulty texts), and each contract function below hands off to
// GROW when MODE==='grow'. A save with no S.mode is an adult save.
let MODE='adult';
const isGrow=()=>MODE==='grow';

// ---- the game-specific part of the save (merged over the engine's fields in baseState()) ----
// Add a field here and old saves get it automatically (fillDefaults in 06-save.js).
function newState(){
  if(isGrow()) return GROW.newState();
  return {
    hoodFlags:{}, hoods:{},   // other Tacoma neighborhoods: once-a-day flags, and the day each was first visited
    money:900,               // replaced by DF().money at new game
    energy:85,stress:25,
    food:3,                  // meals in the fridge (you eat one every night)
    job:'cafe',              // a JOBS key; picked in the welcome pop-up (21-story.js)
    jobPicked:false,
    standing:70,             // 0–100: how work feels about you. 0 = fired
    community:5,             // 0–100: how many neighbors know you, and how well
    rent:{due:13,amt:1150,paid:false,paidDay:-1},
    worked:{},               // day → minutes late (0 = on time)
    extra:{},                // day → picked up extra hours
    met:{},                  // NEIGHBORS id → day you met
    visited:{home:true},
    fair:false,              // went to the Hilltop Street Fair (Sat Aug 8)
    // per-day trackers (day index → true / count)
    calm:{},cooked:{},called:{},chat:{},coffee:{},plate:{},swim:{},hoops:{},volunteer:{},sunset:{},ride:{},unpack:{},breakroom:{},
    unpacked:0,              // boxes unpacked, out of BOXES
    haircut:false,
    stats:{shifts:0,late:0,missed:0,earned:0,spent:0,meals:0,neighbors:0,walks:0,swims:0,hungry:0,rides:0,sunsets:0,extra:0,tips:0},
  };
}

// ---- small shared helpers (21-story.js uses these too) ----
const BOXES=6;                                             // moving boxes still taped shut on day one
const rp=c=>Math.round(c*(DF().cost||1));                  // a price scaled by the difficulty
function canAfford(c){return S.money>=c}
// Repeatable ways to unwind (rest, the bench, the park, the platform, the murals, the hill walk) work fully twice a day,
// then about a third as well: the big stress relief is in the once-a-day things (a swim, the sunset, a call home, a Link ride).
const CALM_FULL=2;
const calmN=()=>(S.calm&&S.calm[day()])||0;
const calmAmt=v=>calmN()<CALM_FULL?v:Math.ceil(v/3);
function calm(v){S.calm=S.calm||{};const d=day();adj('stress',-calmAmt(v));S.calm[d]=calmN()+1}
const cap=t=>t[0].toUpperCase()+t.slice(1);
const calmTxt=v=>`stress −${calmAmt(v)}${calmN()>=CALM_FULL?' (you’ve already unwound a lot today)':''}`;
function spend(c){money(-c);S.stats.spent+=c}
const augDate=d=>dateOf(d).label;                          // day index → "Mon Aug 3" (any date: 10-life.js dateOf)
const FAIR_DAY=5;                                          // Quick play's fair day, Sat Aug 8 (tools/sim.js). In the game: isFairDay(d), the second Saturday of August
// when rent is due (S.rent.due is a day index: day 13 in Quick play, the end of a key week that crosses the 1st in longer games)
const rentBy=()=>`${dayName(S.rent.due)} night, ${monthDay(S.rent.due)}`;      // "Sunday night, Aug 16"
const rentEarly=d=>d<=S.rent.due-7;                        // paid a week or more ahead
const FAIR_HOURS=[600,1080];                               // 10 AM – 6 PM
// Sunset over the Olympics: about 8:20 PM on Mon Aug 3, about 8:00 PM by Sun Aug 16 (a minute and a half earlier each day).
// In the longer games the sunset follows the calendar (about 4:20 PM in late December, 9:10 PM in late June).
const sunsetCal=d=>{const o=dateOf(d),doy=dayIndexOf(o.y,o.m,o.d)-dayIndexOf(o.y,1,1);return Math.round(1125+146*Math.sin(2*Math.PI*(doy-80)/365))};   // the calendar's (the guide reads it too)
const sunsetOn=d=>{if(typeof lifeLong!=='function'||!lifeLong())return Math.round(1220-(clamp(d,0,13))*20/13);return sunsetCal(d)};
const SUNSET=1220;                                         // day one's sunset (the Help guide's timeline uses it)
const sunsetNow=()=>sunsetOn(typeof S!=='undefined'&&S?day():0);
// How work, sleep and the night treat you (the Help guide reads these).
const BAL={
  onTime:2,                 // Job + for a shift on time
  late:[2,6,15],            // Job −(2 + 1 per 6 min late), at most −15
  lateStress:6,             // and stress +6
  missed:[10,16],           // Job − for the first missed shift, then each one after
  missedStress:8,
  midnightJob:3,            // up past midnight: Job −3 (you drag in tired)…
  midnightStress:6,         // …and stress +6
  sleep:3,                  // stress − for a night in your own bed
  goodSleep:5,              // stress − instead, in bed before goodSleepBy and not hungry
  goodSleepBy:1380,         // 11:00 PM
};
const shiftStress=(J=job())=>Math.round(J.stress*(DF().strain||1));

// ---- jobs: the player picks one on day one ----
// days: which weekdays (0 = Monday) have a shift. pay: a full shift's take-home. tips: [lo, hi] cash tips (the café).
const JOBS={
  hospital:{n:'CNA at Tacoma General',short:'the hospital',ic:'🏥',place:'Tacoma General',role:'certified nursing assistant',
    start:420,end:930,pay:172,days:[0,1,2,3,4],stress:20,energy:32,alarm:360,open:()=>[0,1440],
    blurb:'Early shift, 7:00 AM to 3:30 PM, Monday to Friday. The best pay of the three, and the hardest days: call lights, lifts, vitals and people at their worst and bravest.'},
  cafe:{n:'Barista at a Hilltop café',short:'the café',ic:'☕',place:'the café',role:'barista',
    start:390,end:870,pay:104,tips:[14,40],days:[0,1,2,3,4],stress:12,energy:24,alarm:330,open:d=>d%7<5?[360,1080]:[420,900],
    blurb:'Opening shift, 6:30 AM to 2:30 PM, Monday to Friday. Less pay, cash tips, and the whole neighborhood comes through your line before nine.'},
  kitchen:{n:'Line cook at a soul-food spot on MLK',short:'the kitchen',ic:'🍳',place:'Odessa’s Table',role:'line cook',
    start:840,end:1320,pay:138,days:[2,3,4,5,6],stress:16,energy:28,alarm:480,staffMeal:true,open:()=>[660,1380],
    blurb:'Evenings, 2:00 to 10:00 PM, Wednesday to Sunday. Hot, loud and fast, with a staff meal every shift. Your mornings are your own.'},
};
const job=()=>JOBS[(typeof S!=='undefined'&&S&&S.job)]||JOBS.cafe;
const isShiftDay=(d=day())=>!(typeof S!=='undefined'&&S&&S.life&&S.life.retired)&&job().days.includes(((d%7)+7)%7);
const shiftsTotal=()=>lifeWeekDays().filter(isShiftDay).length;   // the days played this key week (Quick play: all of them)
const shiftDays=()=>lifeWeekDays().filter(isShiftDay);

// ---- the neighbors you can meet (21-story.js lists them on the Neighbors tab) ----
// at: the places you're likely to meet them
const NEIGHBORS=[
  {id:'lorraine',n:'Ms. Lorraine',ic:'🪴',at:['home'],d:'On her porch across the street since 1968. Taught third grade at the school down the hill for thirty years, knows every house on the block, who built it and who sold it, and runs the block club like a principal.'},
  {id:'kim',n:'Grace Kim',ic:'🛒',at:['mlk'],d:'Runs the corner market her parents opened in 1988, and is two classes from an accounting degree. Stocks a whole shelf of hot sauces made on the hill and will argue about every one of them.'},
  {id:'imani',n:'Imani',ic:'📚',at:['mlk'],d:'Owns Hilltop Pages, the bookstore on MLK: a kids’ corner, a wall of Northwest Black history and poetry night on Thursdays. Hands you the right book before you know you need it.'},
  {id:'linh',n:'Linh',ic:'🍜',at:['mlk','link'],d:'Runs the phở shop on MLK her family opened in 1994. The second time you come in, she starts your order before you sit down, and the third time she asks how the new job is.'},
  {id:'dre',n:'Dre',ic:'💈',at:['mlk'],d:'Has the chair by the window at the barbershop and a podcast about Tacoma history that eleven people listen to, all of them his clients. Coaches the middle-school debate team. Usually wins the argument.'},
  {id:'marisol',n:'Marisol',ic:'🎨',at:['mlk','view'],d:'Painting a mural on the side wall by the bus stop. Let you fill in a patch of sky. You will point at it for years.'},
  {id:'tasha',n:'Tasha',ic:'🏀',at:['peoples'],d:'Physical therapist by day, runs the evening pickup game at People’s by night. Calls fouls fairly, which makes her the most powerful person on the court.'},
  {id:'ron',n:'Ron',ic:'🏗️',at:['home','mlk'],d:'Two doors down. A civil engineer at the Port of Tacoma: he designs the wharves the big cranes stand on. On weekends his smoker runs and he explains brisket the way he explains load-bearing piles.'},
  {id:'harris',n:'Mr. Harris',ic:'🔧',at:['view','link','mlk'],d:'Eighty-one. Thirty-one years welding hulls at the shipyard on the tideflats, the block’s elder, choir bass on Sundays. Sits on the overlook bench most evenings and can name every ship in the bay.'},
  {id:'bev',n:'Bev',ic:'🧺',at:['mlk','peoples'],d:'Retired school librarian. Started the free community fridge outside the laundromat and keeps it stocked, and runs the block club group chat with an iron hand.'},
  {id:'santos',n:'The Santos family',ic:'🎤',at:['home'],d:'Next door: Tita Rose, a respiratory therapist, Tito Ben, a Navy vet, three kids and a karaoke machine that comes out every birthday. There is always a plate of pancit with your name on it.'},
  {id:'priya',n:'Priya',ic:'🩺',at:['home','link','work'],d:'ICU nurse down your hall, coming off nights. Waves good night at 7 AM and good morning at dusk, and knows which washing machine eats quarters.'},
  {id:'denise',n:'Denise',ic:'♿',at:['link','mlk'],d:'Uses a wheelchair and chairs the block club’s transit committee: she knows which Link stops have working elevators, and she has been fighting for curb cuts on her street for six years. She’s winning.'},
  {id:'malik',n:'Malik',ic:'🎓',at:['peoples','link'],d:'A sophomore at UW Tacoma studying computer science, working the summer front desk at People’s. Grew up four blocks away and is going to build an app for the block club whether they want one or not.'},
  {id:'eli',n:'Eli',ic:'💻',at:['home','view'],d:'Moved in a month before you, from Seattle, for the rent. Works remote for a software company, and is trying, a little awkwardly, to learn the neighborhood instead of just living in it.'},
  {id:'jaylen',n:'Jaylen',ic:'🚲',at:['peoples','home','link'],d:'Eleven, owns the sidewalk on a BMX, and has questions. So many questions. Good ones, mostly.'},
];
const MEET_COMMUNITY=2;   // community for each new neighbor you meet
// Meet someone new here (or anyone not met yet). Returns the neighbor, or null when you know everybody.
function meetHere(loc=S.loc){
  const left=NEIGHBORS.filter(x=>!S.met[x.id]),here=left.filter(x=>x.at.includes(loc)),p=here.length?here:left;
  if(!p.length) return null;
  const x=pick(p);S.met[x.id]=day()+1;S.stats.neighbors=Object.keys(S.met).length;adj('community',MEET_COMMUNITY);
  return x;
}
const metCount=()=>Object.keys(S.met||{}).length;

// ---- HUD ----
let STATS=[
  {l:'Cash',  v:()=>$k(Math.round(S.money)),warn:()=>S.money<(S.rent.paid?0:S.rent.amt)&&day()>=S.rent.due-3,get title(){return 'Cash: '+$(Math.round(S.money))+(S.rent.paid?'. Rent is paid.':`. Rent (${$(S.rent.amt)}) is due by ${rentBy()}.`)}},
  {l:'Energy',v:()=>S.energy,m:()=>S.energy,warn:()=>S.energy<20},
  {l:'Stress',v:()=>S.stress,m:()=>S.stress,good:false,warn:()=>S.stress>=75,title:'Stress. High is bad: at 100 you burn out.'},
  {l:'Food',  v:()=>S.food,m:()=>Math.min(100,S.food*20),warn:()=>S.food<1,title:'Meals in the fridge. You eat one every night.'},
  {l:'Job',   v:()=>S.standing,m:()=>S.standing,warn:()=>S.standing<25,get title(){return `How ${job().short} feels about you. At 0 you’re let go.`}},
];

// ---- scenery ----
// August on Hilltop: sunrise about 6:10 AM, sunset about 8:20 PM. The engine draws the sky (y 0–140) and the ground (140–170).
let SCENE={get sun(){return [370,sunsetNow()]},skyDay:['#8fbbd9','#e6eef0'],skyDusk:['#5d5f97','#f4b183'],skyNight:['#0c1729','#1f2f4a'],ground:'#6f7a6c',groundNight:'#1f2526'};
const HC={
  bay:n=>n?'#13263a':'#4f8fae',bay2:n=>n?'#22405a':'#9ccbdd',mtn:n=>n?'#26344c':'#a9b9cc',snow:n=>n?.32:.96,
  hill:n=>n?'#1a2a28':'#5b7d68',hill2:n=>n?'#223530':'#77957f',leaf:n=>n?'#13261d':'#3d7a4e',leaf2:n=>n?'#18301f':'#58955f',
  street:n=>n?'#22272b':'#5a5f63',walk:n=>n?'#3a3c3a':'#b9b4a6',trunk:n=>n?'#2a1e16':'#5e4630',
};
const win=(n,lit=true)=>n?(lit?'#f7d77a':'#2b3442'):'#cfe0e6';
const SVGF='font-family="DM Sans, system-ui, sans-serif" font-weight="700"';
// Mount Rainier as Tacoma sees it: not a cone but a broad, glaciated massif, wide shoulders, a long low summit dome
// (Columbia Crest) with Liberty Cap a step down on the right, and the dark tooth of Little Tahoma on the left flank.
// Base at y, centered on x, scaled by s (about 360 wide and 86 tall at s=1).
const rainier=(n,x=360,s=1,y=110)=>{const rock=n?'#1d2839':'#7f8fa3',snow='#f5f8fa',o=HC.snow(n),shade=n?'#3a4a62':'#c9d5e2';
  return `<g transform="translate(${x},${y}) scale(${s})"><path d="M-182 0 C-150 -10 -122 -24 -98 -40 C-82 -51 -70 -58 -60 -63 L-53 -71 L-46 -64 C-34 -73 -20 -80 -4 -84 C8 -86 22 -86 33 -84 C42 -82 50 -80 56 -79 C64 -79 70 -77 78 -71 C102 -54 138 -28 186 0 Z" fill="${HC.mtn(n)}"/>
  <path d="M-108 -34 L-96 -40 L-88 -35 L-80 -46 L-71 -43 L-64 -54 L-60 -63 L-53 -71 L-46 -64 C-34 -73 -20 -80 -4 -84 C8 -86 22 -86 33 -84 C42 -82 50 -80 56 -79 C64 -79 70 -77 78 -71 C90 -62 100 -55 112 -46 L104 -44 L97 -49 L90 -36 L82 -47 L72 -38 L64 -51 L55 -33 L46 -49 L36 -40 L27 -56 L17 -38 L7 -53 L-3 -36 L-13 -51 L-23 -41 L-33 -55 L-43 -42 L-53 -50 L-63 -39 L-73 -47 L-84 -32 Z" fill="${snow}" opacity="${o}"/>
  <path d="M33 -84 C42 -82 50 -80 56 -79 C64 -79 70 -77 78 -71 C90 -62 100 -55 112 -46 L104 -44 L97 -49 L90 -36 L82 -47 L72 -38 L64 -51 L55 -33 L46 -49 L36 -40 L27 -56 C30 -66 31 -76 33 -84 Z" fill="${shade}" opacity="${n?.5:.55}"/>
  <path d="M-64 -55 L-53 -71 L-46 -64 L-43 -55 L-50 -58 Z" fill="${rock}"/>
  <path d="M-6 -36 l-6 20 M27 -38 l4 22 M64 -36 l10 20 M-63 -37 l-12 18 M100 -40 l14 18" stroke="${rock}" stroke-width="1.6" fill="none" opacity=".55"/>
  <path d="M51 -80 q5 -4 10 -1" stroke="${snow}" stroke-width="2" fill="none" opacity="${o}"/></g>`};
// a Port of Tacoma container crane: legs on the wharf at (x, b), the boom reaching left out over the water
const crane=(x,n,b=140,s=1)=>{const c=n?'#4a3434':'#c0412c',h=n?'#5a5050':'#f1ede4';
  return `<g transform="translate(${x},${b}) scale(${s})"><rect x="-12" y="-44" width="3" height="44" fill="${c}"/><rect x="10" y="-44" width="3" height="44" fill="${c}"/><rect x="-13" y="-30" width="27" height="2" fill="${c}"/>
  <rect x="-70" y="-48" width="104" height="4" fill="${c}"/><rect x="-6" y="-56" width="16" height="9" fill="${h}"/><path d="M-1 -48 L4 -70 L9 -48 M4 -70 L-68 -48 M4 -70 L32 -48" stroke="${c}" stroke-width="1.6" fill="none"/>
  <rect x="-40" y="-44" width="6" height="5" fill="${n?'#555':'#3a3f45'}"/><path d="M-37 -44 V-34" stroke="${n?'#555':'#3a3f45'}" stroke-width="1"/></g>`};
// stacked containers on the wharf
const boxesOnDock=(x,n,b=140)=>[['#2a6fa8',0,0],['#b8402a',22,0],['#2f8f6a',44,0],['#c98a12',8,-8],['#5d6a75',30,-8]].map(([c,dx,dy])=>`<rect x="${x+dx}" y="${b-8+dy}" width="21" height="7.5" fill="${n?'#2c3138':c}"/>`).join('');
// a round street tree standing on b
const tree=(x,n,r=16,b=140)=>`<rect x="${x-2}" y="${b-r-8}" width="4" height="${r+8}" fill="${HC.trunk(n)}"/><circle cx="${x}" cy="${b-r-14}" r="${r}" fill="${HC.leaf(n)}"/><circle cx="${x-r*.45}" cy="${b-r-8}" r="${r*.7}" fill="${HC.leaf2(n)}"/><circle cx="${x+r*.5}" cy="${b-r-10}" r="${r*.6}" fill="${HC.leaf(n)}"/>`;
// a streetlight that glows at night
const lamp=(x,n,b=150)=>`<rect x="${x}" y="${b-44}" width="2.5" height="44" fill="${n?'#4a4f55':'#3c4248'}"/><path d="M${x+1} ${b-44} q8 -4 14 0" stroke="${n?'#4a4f55':'#3c4248'}" stroke-width="2.5" fill="none"/><rect x="${x+11}" y="${b-44}" width="7" height="3" fill="${n?'#f7d77a':'#cfd5d8'}"/>${n?`<polygon points="${x+11},${b-41} ${x+18},${b-41} ${x+30},${b} ${x-2},${b}" fill="#f7d77a" opacity=".12"/>`:''}`;
// an old Hilltop craftsman: porch, gable, two windows up
const craftsman=(x,n,c,b=140,lit=[1,0,1])=>`<g><rect x="${x}" y="${b-52}" width="76" height="52" fill="${c}"/><polygon points="${x-6},${b-50} ${x+38},${b-80} ${x+82},${b-50}" fill="${n?'#2a2224':'#6a3f35'}"/>
  <rect x="${x+30}" y="${b-70}" width="16" height="12" fill="${win(n,lit[0])}"/><rect x="${x+8}" y="${b-44}" width="18" height="16" fill="${win(n,lit[1])}"/><rect x="${x+50}" y="${b-44}" width="18" height="16" fill="${win(n,lit[2])}"/>
  <rect x="${x-4}" y="${b-24}" width="84" height="4" fill="${n?'#3a3434':'#efe6d6'}"/>${[0,1,2,3].map(i=>`<rect x="${x-2+i*26}" y="${b-21}" width="4" height="21" fill="${n?'#3a3434':'#efe6d6'}"/>`).join('')}<rect x="${x+32}" y="${b-20}" width="12" height="20" fill="${n?'#1e1616':'#4a3226'}"/></g>`;
// the T Line streetcar: two linked cars on the rails at y
const linkTrain=(x,n,y=134,s=1)=>`<g transform="translate(${x},${y}) scale(${s})"><rect x="0" y="-30" width="150" height="26" rx="7" fill="${n?'#c9ced2':'#f4f5f2'}"/><rect x="0" y="-12" width="150" height="5" fill="#2f8f6a"/><rect x="0" y="-7" width="150" height="3" fill="#2a6fa8"/>
  ${[0,1,2,3,4,5].map(i=>`<rect x="${10+i*22}" y="-26" width="16" height="11" rx="2" fill="${n?'#f2d58a':'#5d7f93'}"/>`).join('')}<path d="M74 -30 v26" stroke="${n?'#8a9096':'#b9bfc3'}" stroke-width="2"/>
  <path d="M60 -30 l14 -12 l14 12" stroke="#555" stroke-width="1.5" fill="none"/>${[18,58,92,132].map(c=>`<circle cx="${c}" cy="-2" r="4" fill="#2b2f33"/>`).join('')}${n?'<circle cx="147" cy="-14" r="2.5" fill="#fff6c8"/>':''}</g>`;
// the catenary wire over MLK, and the rails
const wire=(n,y=86)=>`<path d="M0 ${y} H480" stroke="${n?'#3a3f45':'#4a4f55'}" stroke-width="1"/>${[40,200,360].map(x=>`<rect x="${x}" y="${y}" width="3" height="${150-y}" fill="${n?'#3a3f45':'#5a6066'}"/>`).join('')}`;
const rails=(n,y=146)=>`<rect y="${y-6}" width="480" height="12" fill="${HC.street(n)}"/><path d="M0 ${y-2} H480 M0 ${y+3} H480" stroke="${n?'#5a5f63':'#9a9ea2'}" stroke-width="1.2"/>`;
const bird=(x,y)=>`<path d="M${x} ${y} q5 -5 10 0 q5 -5 10 0" stroke="#fff" stroke-width="1.6" fill="none"/>`;
const starsSky=n=>n?[[30,20],[96,34],[150,14],[214,28],[290,12],[340,30],[420,18],[460,40]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="1" fill="#fff" opacity=".7"/>`).join(''):'';
// a person: head, body (c), standing on b
const person=(x,n,c,b=146,h=1)=>`<circle cx="${x}" cy="${b-22*h}" r="${4*h}" fill="${['#6b4430','#a26c48','#e3b892','#3e2a20'][Math.abs(Math.round(x))%4]}"/><rect x="${x-4*h}" y="${b-18*h}" width="${8*h}" height="${12*h}" rx="2" fill="${c}"/><rect x="${x-3*h}" y="${b-6*h}" width="${2.5*h}" height="${6*h}" fill="${n?'#222':'#333'}"/><rect x="${x+.5*h}" y="${b-6*h}" width="${2.5*h}" height="${6*h}" fill="${n?'#222':'#333'}"/>`;

// ---- places ----
// L keys are fixed by SPEC.md. hours: d=>[open,close] minutes (or null = closed that day). art: ({night,dusk,m})=>svg
let L={
  home:{name:'Your apartment',ic:'🏠',desc:'Third floor of an old brick walk-up on Hilltop. Boxes, a bed, a fridge, a window that looks at the mountain',
    art:({night:n})=>`${starsSky(n)}${rainier(n,400,.7,112)}
      <rect x="40" y="38" width="170" height="102" fill="${n?'#3e2621':'#94503c'}"/><rect x="36" y="32" width="178" height="8" fill="${n?'#271714':'#5c2f25'}"/>
      ${[0,1,2,3].map(r=>[0,1,2,3].map(c=>{const lit=(r*5+c*3)%4!==1;return `<rect x="${54+c*38}" y="${48+r*22}" width="20" height="14" fill="${r===0&&c===1?(n?'#f9c86a':'#e9f1f4'):win(n,lit)}"/><rect x="${52+c*38}" y="${62+r*22}" width="24" height="2" fill="${n?'#5a3a30':'#d8c3a8'}"/>`}).join('')).join('')}
      <rect x="110" y="114" width="30" height="26" fill="${n?'#1f1410':'#43291f'}"/><rect x="104" y="110" width="42" height="5" fill="${n?'#271714':'#5c2f25'}"/><text x="125" y="30" text-anchor="middle" font-size="7" ${SVGF} fill="${n?'#7a6a62':'#5c2f25'}">THE ALDER · 1924</text>
      <rect x="73" y="45" width="6" height="7" fill="${n?'#c97f3a':'#c8a06a'}" opacity=".9"/>${tree(240,n,18)}${craftsman(280,n,n?'#2e3a40':'#7ea0a8',140,[0,1,0])}${tree(380,n,14)}${lamp(20,n)}${lamp(440,n)}
      <rect x="0" y="146" width="480" height="4" fill="${HC.walk(n)}"/>`},
  mlk:{name:'MLK Jr Way',ic:'🛒',desc:'Hilltop’s main street: the corner market, the teriyaki spot, the barbershop, murals and the Link rails down the middle',
    art:({night:n})=>`${starsSky(n)}${wire(n,80)}<g transform="translate(40 25.7) scale(.8333)">   <!-- scaled to the middle 400 px so a phone (which crops the sides) shows every sign -->
      ${[['CORNER MARKET','#2f6b4a',6,'#e4d6b6'],['TERIYAKI','#b8402a',128,'#e8ddc4'],['BARBER','#24507a',250,'#d9cfc0']].map(([t,c,x,w])=>`<rect x="${x}" y="70" width="114" height="70" fill="${n?'#3a3530':w}"/><rect x="${x-3}" y="62" width="120" height="12" fill="${c}"/><text x="${x+57}" y="71" text-anchor="middle" font-size="8" ${SVGF} fill="#fff">${t}</text>
        <path d="M${x} 78 h114 l-8 10 h-98 z" fill="${c}" opacity=".85"/>${[0,1,2,3,4,5].map(i=>`<rect x="${x+6+i*18}" y="78" width="9" height="10" fill="#fff" opacity=".25"/>`).join('')}<rect x="${x+10}" y="96" width="40" height="28" fill="${win(n)}"/><rect x="${x+62}" y="96" width="20" height="44" fill="${n?'#241c16':'#4a3a2c'}"/><rect x="${x+88}" y="96" width="20" height="28" fill="${win(n)}"/>`).join('')}
      <g transform="translate(341,50)"><rect width="18" height="90" fill="${n?'#2c2c34':'#e3d5bc'}"/><rect x="5" y="0" width="8" height="90" fill="#fff" opacity=".2"/></g>
      <rect x="362" y="44" width="118" height="96" fill="${n?'#2a2830':'#d0c2a8'}"/>
      <g opacity="${n?.55:1}"><circle cx="420" cy="76" r="22" fill="#f2b630"/><path d="M366 120 Q400 92 440 112 T480 104 V140 H366 Z" fill="#2f8f6a"/><path d="M366 136 Q410 118 480 128 V140 H366 Z" fill="#24507a"/><circle cx="398" cy="104" r="7" fill="#6b4430"/><path d="M391 112 q7 10 14 0 v22 h-14 z" fill="#b8402a"/><path d="M440 60 q10 -8 20 0" stroke="#b8402a" stroke-width="4" fill="none"/></g>
      <text x="421" y="54" text-anchor="middle" font-size="7" ${SVGF} fill="${n?'#888':'#5a4a3a'}">HILLTOP PROUD</text>
      ${person(150,n,'#2a6fa8')}${person(196,n,'#c98a12',146,.9)}${person(300,n,'#8e44ad')}${lamp(120,n)}${lamp(352,n)}</g>${rails(n,154)}`},
  work:{get name(){return job().place},get ic(){return job().ic},get desc(){const j=job();return `Where you work: ${j.role}, ${fmt(j.start)}–${fmt(j.end)}, ${j.days[0]===0?'Monday to Friday':'Wednesday to Sunday'}`},
    hours:d=>job().open(d),
    art:o=>(WORK_ART[(typeof S!=='undefined'&&S&&S.job)]||WORK_ART.cafe)(o)},
  link:{name:'Hilltop Link: St Joseph',ic:'🚋',desc:'The T Line stop on MLK, a few blocks from your door. Free to ride, every few minutes, and the best people-watching on the hill',
    art:({night:n})=>`${starsSky(n)}${rainier(n,110,.6,104)}<path d="M0 104 Q120 92 240 100 T480 96 V112 H0 Z" fill="${HC.hill(n)}"/>${wire(n,70)}
      <rect x="0" y="104" width="480" height="36" fill="${n?'#2a2c30':'#9a978c'}"/>${tree(30,n,13,112)}${tree(456,n,15,112)}
      <rect x="250" y="88" width="210" height="6" fill="${n?'#3a4a5a':'#2a6fa8'}"/>${[260,330,400,450].map(x=>`<rect x="${x}" y="94" width="4" height="38" fill="${n?'#4a4f55':'#6a7076'}"/>`).join('')}
      <rect x="272" y="96" width="60" height="16" rx="2" fill="${n?'#1a2a3a':'#16324d'}"/><text x="302" y="107" text-anchor="middle" font-size="7" ${SVGF} fill="#7fe0a0">T · 3 MIN</text>
      <rect x="370" y="112" width="60" height="5" fill="${n?'#4a3e34':'#8a6b48'}"/><rect x="374" y="117" width="3" height="12" fill="#555"/><rect x="423" y="117" width="3" height="12" fill="#555"/>
      ${person(392,n,'#c0392b',112,.9)}${person(410,n,'#2f8f6a',112,.9)}${person(350,n,'#f2b630',132)}
      <rect x="0" y="132" width="480" height="4" fill="${n?'#d9c84a':'#f2d04a'}" opacity=".8"/>${rails(n,146)}${linkTrain(36,n,144)}${lamp(240,n,132)}`},
  peoples:{name:'People’s Center & Park',ic:'🏊',desc:'People’s Community Center on MLK: the pool, the gym, the programs, and People’s Park next door with the courts',hours:()=>[360,1260],
    art:({night:n})=>`${starsSky(n)}${tree(20,n,18)}${tree(70,n,22)}
      <rect x="100" y="60" width="200" height="80" fill="${n?'#3a3f46':'#d8d2c2'}"/><rect x="96" y="54" width="208" height="8" fill="${n?'#2a2f36':'#8a3b22'}"/>
      <text x="200" y="76" text-anchor="middle" font-size="9" ${SVGF} fill="${n?'#b9b2a6':'#8a3b22'}">PEOPLE’S COMMUNITY CENTER</text>
      ${[0,1,2,3,4,5].map(i=>`<rect x="${112+i*30}" y="84" width="20" height="22" fill="${win(n,i!==2)}"/>`).join('')}<rect x="186" y="112" width="28" height="28" fill="${n?'#1e2a36':'#2a6fa8'}"/><rect x="199" y="112" width="2" height="28" fill="#ddd"/>
      <path d="M104 132 q30 -16 60 0" stroke="#f2b630" stroke-width="3" fill="none" opacity=".9"/><path d="M236 132 q30 -16 60 0" stroke="#2f8f6a" stroke-width="3" fill="none" opacity=".9"/>
      <rect x="318" y="118" width="150" height="26" fill="${n?'#2a3e34':'#5f9a6e'}"/><path d="M393 118 v26 M318 131 h150" stroke="#fff" stroke-width="1" opacity=".6"/><circle cx="393" cy="131" r="7" stroke="#fff" stroke-width="1" fill="none" opacity=".6"/>
      <rect x="456" y="82" width="3" height="40" fill="#555"/><rect x="444" y="80" width="18" height="12" fill="${n?'#888':'#fff'}" stroke="#555"/><path d="M444 94 h10" stroke="#e3642e" stroke-width="2"/>
      ${person(360,n,'#c0392b',140)}${person(420,n,'#2a6fa8',140)}<circle cx="388" cy="108" r="4" fill="#e3642e"/>${lamp(306,n)}`},
  view:{name:'The overlook',ic:'🌄',desc:'A bench over Commencement Bay: the port cranes, Vashon to the left, Rainier to the southeast',
    art:({night:n,dusk})=>`${starsSky(n)}${rainier(n,350,.82,98)}<rect y="96" width="480" height="44" fill="${HC.bay(n)}"/>
      ${dusk&&!n?'<rect y="96" width="480" height="10" fill="#f4b183" opacity=".35"/>':''}<path d="M200 118 q24 -4 48 0 M320 108 q24 -4 48 0 M250 130 q24 -4 48 0 M390 124 q24 -4 48 0" stroke="${HC.bay2(n)}" stroke-width="2" fill="none" opacity=".7"/>
      <path d="M0 96 Q20 90 46 93 V100 H0 Z" fill="${HC.hill2(n)}"/><rect x="20" y="104" width="190" height="5" fill="${n?'#2a2e33':'#8a8d86'}"/>${boxesOnDock(120,n,104)}${crane(60,n,104,.62)}${crane(104,n,104,.62)}${crane(196,n,104,.62)}
      <path d="M240 112 h40 l6 -4 h-50 z" fill="${n?'#3a3f45':'#b8402a'}"/><rect x="250" y="102" width="20" height="6" fill="${n?'#4a4f55':'#e8e2d4'}"/>
      ${n?[40,80,120,160,200,252,300,350].map((x,i)=>`<circle cx="${x}" cy="${100+i%3*3}" r="1.3" fill="#f7d77a"/>`).join(''):bird(236,56)+bird(258,46)}
      <path d="M0 132 Q90 118 180 128 T340 126 T480 132 V140 H0 Z" fill="${HC.hill(n)}"/>${tree(36,n,20,142)}${tree(450,n,17,142)}
      <rect x="196" y="130" width="90" height="5" fill="${n?'#3e3228':'#8a6b48'}"/><rect x="196" y="122" width="90" height="4" fill="${n?'#3e3228':'#8a6b48'}"/><rect x="202" y="135" width="4" height="10" fill="#444"/><rect x="276" y="135" width="4" height="10" fill="#444"/>
      ${person(226,n,'#24507a',134,.9)}${lamp(320,n,146)}`},
};
// Each job's workplace, drawn on its own
const WORK_ART={
  hospital:({night:n})=>`${starsSky(n)}<rect x="150" y="18" width="180" height="122" fill="${n?'#3a4048':'#dfe3e4'}"/><rect x="146" y="14" width="188" height="6" fill="${n?'#2a3038':'#9aa6ae'}"/>
    ${[0,1,2,3,4].map(r=>[0,1,2,3,4,5,6].map(c=>`<rect x="${160+c*24}" y="${28+r*18}" width="14" height="10" fill="${win(n,(r+c*2)%5!==3)}"/>`).join('')).join('')}
    <rect x="60" y="64" width="90" height="76" fill="${n?'#363b42':'#cfd4d6'}"/>${[0,1,2].map(r=>[0,1,2].map(c=>`<rect x="${70+c*26}" y="${74+r*18}" width="16" height="10" fill="${win(n,(r+c)%3!==1)}"/>`).join('')).join('')}
    <rect x="200" y="112" width="80" height="28" fill="${n?'#1e2a36':'#2a6fa8'}"/><text x="240" y="108" text-anchor="middle" font-size="8" ${SVGF} fill="${n?'#ff6a5a':'#c0392b'}">EMERGENCY · ENTRANCE</text>
    <rect x="318" y="6" width="24" height="10" fill="${n?'#c0392b':'#e74c3c'}"/><rect x="328" y="2" width="4" height="18" fill="#fff"/><rect x="322" y="9" width="16" height="4" fill="#fff"/>
    ${tree(30,n,16)}${tree(380,n,18)}${tree(440,n,14)}${person(290,n,'#5aa0c0',146)}${person(304,n,'#5aa0c0',146)}${lamp(352,n)}`,
  cafe:({night:n})=>`${starsSky(n)}${tree(30,n,16)}<rect x="90" y="56" width="280" height="84" fill="${n?'#3a3026':'#e8dcc0'}"/><rect x="84" y="48" width="292" height="10" fill="${n?'#2a2018':'#3a2a1e'}"/>
    <path d="M90 58 h280 l-12 16 h-256 z" fill="${n?'#4a2a20':'#b8402a'}"/>${Array.from({length:14},(_,i)=>`<rect x="${92+i*20}" y="58" width="10" height="14" fill="#fff" opacity=".35"/>`).join('')}
    <rect x="104" y="84" width="92" height="44" fill="${win(n)}"/><rect x="264" y="84" width="92" height="44" fill="${win(n)}"/><rect x="214" y="84" width="32" height="56" fill="${n?'#20160f':'#4a3226'}"/>
    <rect x="190" y="26" width="80" height="20" rx="4" fill="#3a2a1e"/><text x="230" y="40" text-anchor="middle" font-size="11" ${SVGF} fill="#f4d27a">☕ CAFÉ</text>
    ${person(140,n,'#2f8f6a',128,.8)}${person(310,n,'#8e44ad',128,.8)}<rect x="392" y="122" width="30" height="4" fill="#555"/><rect x="405" y="126" width="3" height="18" fill="#555"/><rect x="430" y="114" width="12" height="30" fill="${n?'#555':'#222'}"/><text x="436" y="132" text-anchor="middle" font-size="6" fill="#fff">OPEN</text>${lamp(450,n)}`,
  kitchen:({night:n})=>`${starsSky(n)}<rect x="70" y="50" width="320" height="90" fill="${n?'#3a2420':'#c76a3a'}"/><rect x="64" y="42" width="332" height="10" fill="${n?'#2a1814':'#6a2f1e'}"/>
    <rect x="150" y="18" width="160" height="26" rx="5" fill="#2a1a14"/><text x="230" y="36" text-anchor="middle" font-size="12" ${SVGF} fill="#f2b630">ODESSA’S TABLE</text>
    <rect x="90" y="68" width="110" height="52" fill="${win(n)}"/><rect x="260" y="68" width="110" height="52" fill="${win(n)}"/><rect x="214" y="80" width="32" height="60" fill="${n?'#1a100c':'#3a2218'}"/>
    <text x="145" y="64" text-anchor="middle" font-size="7" ${SVGF} fill="#fff">FRIED CHICKEN · GREENS</text><text x="315" y="64" text-anchor="middle" font-size="7" ${SVGF} fill="#fff">MAC · CORNBREAD · PIE</text>
    <rect x="370" y="20" width="10" height="24" fill="#555"/>${[0,1,2].map(i=>`<circle cx="${376+i*6}" cy="${12-i*6}" r="${5+i*2}" fill="#ddd" opacity="${.5-i*.12}"/>`).join('')}
    ${person(120,n,'#fff',118,.8)}${person(300,n,'#2a6fa8',118,.8)}${tree(30,n,16)}${tree(440,n,18)}${lamp(406,n)}`,
};
// Minutes between places, on foot or by Link (symmetric). All short: Hilltop is a walking neighborhood.
const TRAVEL={'home|mlk':6,'home|work':12,'home|link':8,'home|peoples':10,'home|view':12,
  'mlk|work':8,'mlk|link':4,'mlk|peoples':5,'mlk|view':10,
  'work|link':4,'work|peoples':10,'work|view':14,
  'link|peoples':6,'link|view':12,'peoples|view':12};
function travelMins(a,b){if(isGrow())return GROW.travelMins(a,b);
  const ha=(L[a]||{}).hood,hb=(L[b]||{}).hood;
  if(ha===hb) return TRAVEL[a+'|'+b]??TRAVEL[b+'|'+a]??10;
  // across neighborhoods: walk to your stop, ride, walk from the other stop. Hilltop's stop is the Link station.
  const leg=(k,h)=>{const hub=h?HOODS[h].hub:'link';return k===hub?0:(TRAVEL[k+'|'+hub]??TRAVEL[hub+'|'+k]??8)};
  const ride=h=>h?HOODS[h].ride.mins:0;
  return leg(a,ha)+leg(b,hb)+(ha&&hb?Math.max(ride(ha),ride(hb))+6:ride(ha)+ride(hb));
}

// ---- Tacoma beyond Hilltop: each src/js/22-hood-*.js file registers one neighborhood with defHood() ----
// defHood({key, name, ic, blurb, hub:'<place key where the ride arrives>', ride:{via:'🚈 Link'|'🚌 Bus'|'🚶 Walk', mins, fare},
//          places:{key:{name, ic, desc, art, hours?}}, travel:{'a|b':mins}, neighbors:[{id,n,ic,at:[place keys],d}],
//          actions:(loc,d,m)=>[...actions like actionsHere's], tips?:[...]})
// Places get .hood=key; the adult game only (Growing Up keeps to Hilltop for now).
const HOODS={};
function defHood(h){
  HOODS[h.key]=h;
  for(const [k,p] of Object.entries(h.places)){ if(L[k]) throw new Error('defHood: place key taken: '+k); L[k]=Object.assign({hood:h.key},p) }
  Object.assign(TRAVEL,h.travel||{});
  (h.neighbors||[]).forEach(x=>NEIGHBORS.push(x));
}
const hoodOf=k=>(L[k]||{}).hood||null;
const hoodName=h=>h?HOODS[h].name:'Hilltop';
// fare for a trip between neighborhoods (the rider pays the bus; the Link is free)
function hoodFare(a,b){const ha=hoodOf(a),hb=hoodOf(b);if(ha===hb)return 0;const f=h=>h?(HOODS[h].ride.fare||0):0;return rp(Math.max(f(ha),f(hb)))}
// the neighborhood's own actions, merged into actionsHere()
function hoodActions(){S.hoodFlags=S.hoodFlags||{};S.hoods=S.hoods||{};const h=hoodOf(S.loc);if(!h||!HOODS[h].actions)return [];try{return HOODS[h].actions(S.loc,day(),tod())||[]}catch(e){console.error(e);return []}}

// ---- actions ----
// Each: {ic, l, s, fn, cat (an ACT_CATS key), cls:'primary'|'danger', dis:true}. fn changes S, calls pass(min) and say('…').
let ACT_CATS={work:'💼 Work',money:'🧾 Bills & money',food:'🛒 Food',people:'🤝 Neighbors',rest:'🛋️ Rest & recharge',here:'📍 Around here'};
function actionsHere(){
  if(isGrow()) return GROW.actionsHere();
  const d=day(),m=tod(),a=[],J=job(),at=(lo,hi)=>m>=lo&&m<hi;
  if(S.loc==='home'){
    const tomorrow=d+1<GAME.days&&isShiftDay(d+1);
    if(isShiftDay(d)&&!(d in S.worked)&&m<J.end-60){const tm=travelMins('home','work'),leave=J.start-tm;   // the quick way to work on a shift day
      a.push({ic:J.ic,l:`Go to work (${tm} min)`,s:m<=leave?`${J.place}, ${fmt(J.start)}–${fmt(J.end)}. Leave by ${fmt(leave)} to be on time.`:`${J.place}. Your shift started at ${fmt(J.start)}: go now.`,cat:'work',cls:'primary',fn:()=>go('work')});}
    a.push({ic:'🛏️',l:'Go to bed',s:`Ends the day. You eat dinner from the fridge (${S.food} meal${S.food===1?'':'s'}). Alarm ${fmt(S.alarm)}.${tomorrow?` Tomorrow: work at ${fmt(J.start)}.`:''}`,cat:'rest',cls:m>=1290?'primary':'',fn:()=>endDay('home')});
    a.push({ic:'⏰',l:`Alarm: ${fmt(S.alarm)}`,s:'Tap to cycle 5:00 → 5:30 → 6:00 → 6:30 → 7:00 → 8:00 → 9:00.',cat:'rest',fn:()=>{const o=[300,330,360,390,420,480,540];S.alarm=o[(o.indexOf(S.alarm)+1)%o.length];say(`⏰ Alarm set for ${fmt(S.alarm)}.`)}});
    a.push({ic:'😴',l:'Rest for an hour',s:`Energy +10, ${calmTxt(5)}.`,cat:'rest',dis:S.energy>=100&&S.stress<=0,fn:()=>{pass(60);adj('energy',10);calm(5);say(pick(['😴 An hour on the couch with the window open. A bus sighs at the corner, somebody laughs on a porch, then nothing.','😴 You close your eyes “for a second.” It’s an hour. It helps.','😴 Blinds down, phone face down. The radiator ticks even in August.']))}});
    if(!S.cooked[d]) a.push({ic:'🍲',l:'Cook something proper',s:S.food>0?'45 min. Uses 1 extra meal from the fridge. Energy +14, stress −4. Once a day.':'The fridge is empty. The corner market is on MLK.',cat:'food',dis:S.food<1,
      fn:()=>{S.food--;S.cooked[d]=true;S.stats.meals++;pass(45);adj('energy',14);adj('stress',-4);say(pick(['🍲 Rice, beans, an onion and whatever’s green. The whole hallway smells like home.','🍲 Your grandmother’s recipe, mostly from memory. Close enough to count.','🍲 Eggs, toast, hot sauce. Not fancy. Exactly right.']))}});
    if(!S.called[d]) a.push({ic:'📞',l:'Call home',s:'30 min. Stress −8. Once a day.',cat:'rest',fn:()=>{pass(30);S.called[d]=true;adj('stress',-8);say(pick(['📞 Your mom asks if you’re eating. You lie a little. She knows.','📞 Your cousin wants to hear everything about Tacoma. You tell her the mountain thing. She doesn’t believe you.','📞 Your dad reads you the weather back home like it’s news. It is, kind of.']))}});
    if(S.unpacked<BOXES&&!S.unpack[d]) a.push({ic:'📦',l:`Unpack a box (${S.unpacked} of ${BOXES} done)`,s:'45 min. Energy −4, stress −3. The place feels more like yours. Once a day.',cat:'here',
      fn:()=>{pass(45);S.unpack[d]=true;S.unpacked++;adj('energy',-4);adj('stress',-3);say(S.unpacked>=BOXES?'📦 The last box. Your books are on a shelf, your photos are on the wall, and the apartment finally looks like somebody lives here. You do.':pick(['📦 Kitchen stuff. You find the good knife and the mug you thought you’d lost.','📦 Books. You line them up on the windowsill, spines toward the mountain.','📦 Winter clothes in August. You put the box in the closet, still mostly packed. Progress.','📦 Photos. You hang two and lean the rest against the wall “for now.”']))}});
    if(!S.rent.paid){const r=S.rent.amt;
      a.push({ic:'🧾',l:`Pay rent — ${$(r)}`,s:canAfford(r)?`Due by ${rentBy()}. ${rentEarly(d)?'Paying in the first week takes a weight off: stress −10.':'Pay it and it’s done.'}`:`You have ${$(Math.round(S.money))}. Due by ${rentBy()} (${S.rent.due-d} day${S.rent.due-d===1?'':'s'} left).`,cat:'money',cls:canAfford(r)&&d>=S.rent.due-3?'primary':'',dis:!canAfford(r),
        fn:()=>{spend(r);S.rent.paid=true;S.rent.paidDay=d;pass(10);adj('stress',rentEarly(d)?-10:-4);say(`🧾 Rent paid through the landlord’s portal: ${$(r)}. ${rentEarly(d)?'A week early. You exhale for what feels like the first time since the moving truck.':'Done. The roof is yours another month.'}`)}});}
  }
  if(S.loc==='mlk'){
    const mk=at(420,1320),g=rp(42),sn=rp(5),pl=rp(14),cut=rp(25);
    a.push({ic:'🧺',l:`Groceries at the corner market — ${$(g)}`,s:mk?`4 meals for the fridge (you have ${S.food}).`:'The market is open 7 AM to 10 PM.',cat:'food',cls:S.food<=1&&mk?'primary':'',dis:!mk||!canAfford(g),
      fn:()=>{spend(g);S.food+=4;pass(25);say(pick(['🧺 Rice, eggs, greens, a chicken, tortillas, hot sauce. Grace Kim rings it up and throws in a peach. “For the new neighbor.”','🧺 A basket of the basics. The guy behind you in line recommends the frozen dumplings. He’s right.','🧺 Four dinners, if you’re careful. You are learning to be careful.']));if(!S.met.kim&&Math.random()<.5){S.met.kim=d+1;S.stats.neighbors=metCount();adj('community',MEET_COMMUNITY);say('🛒 You meet <b>Grace Kim</b>, who runs the market. She remembers your name the second time, and your hot-sauce opinion the third.')}}});
    a.push({ic:'🥤',l:`A cold drink and chips — ${$(sn)}`,s:mk?'Energy +6.':'The market is closed.',cat:'food',dis:!mk||!canAfford(sn),fn:()=>{spend(sn);adj('energy',6);pass(10);say('🥤 A cold can from the back of the cooler and a bag of chips on the curb. August, perfected.')}});
    if(!S.plate[d]) a.push({ic:'🍱',l:`A plate at the teriyaki spot — ${$(pl)}`,s:at(660,1260)?'30 min. Energy +15, stress −4. Once a day. Chicken, rice, that sauce.':'Open 11 AM to 9 PM.',cat:'food',dis:!at(660,1260)||!canAfford(pl),
      fn:()=>{spend(pl);S.plate[d]=true;S.stats.meals++;pass(30);adj('energy',15);adj('stress',-4);say(pick(['🍱 Chicken teriyaki, rice, that little salad with the orange dressing. Tacoma runs on this plate.','🍱 Spicy chicken, extra sauce. The owner nods at you like you passed a test.','🍱 You eat at the window counter and watch the Link slide by. Better than TV.']))}});
    if(!S.haircut) a.push({ic:'💈',l:`A cut at the barbershop — ${$(cut)}`,s:at(540,1140)?'1 hour. Community +6, stress −6. The chair is where the neighborhood talks.':'Open 9 AM to 7 PM.',cat:'people',dis:!at(540,1140)||!canAfford(cut),
      fn:()=>{spend(cut);S.haircut=true;pass(60);adj('community',6);adj('stress',-6);if(!S.met.dre){S.met.dre=d+1;S.stats.neighbors=metCount()}say('💈 <b>Dre</b> lines you up and catches you up: who’s opening what, whose kid made the team, which landlord is fixing things and which one isn’t. You leave looking sharp and knowing the hill.')}});
    if(!S.chat[d]) a.push({ic:'👋',l:'Stop and talk on the corner',s:'30 min. You might meet someone (community +2), or catch up with someone you know (+1). Once a day.',cat:'people',
      fn:()=>{pass(30);S.chat[d]=true;const x=meetHere();if(x)say(`👋 You meet <b>${x.n}</b>. ${x.d}`);else{adj('community',1);say(pick(['👋 Ms. Lorraine’s grandson waves from his car. Grace waves from the market door. You wave at everybody. Everybody waves back.','👋 You stand on the corner long enough to be part of it.']))}}});
    a.push({ic:'🎨',l:'Walk MLK and look at the murals',s:`30 min. ${cap(calmTxt(6))}.`,cat:'here',
      fn:()=>{pass(30);S.stats.walks++;calm(6);say(pick(['🎨 Faces three stories tall: elders, kids, a saxophone, a fist full of flowers. Hilltop’s history, painted where everybody can see it.','🎨 A mural of a grandmother in a church hat looks down at the bus stop like she’s keeping an eye on things. She is.','🎨 You find a mural you hadn’t noticed, tucked behind the laundromat: the old neighborhood, every porch with someone on it.']))}});
    if(isFairDay(d)&&at(FAIR_HOURS[0],FAIR_HOURS[1])&&!S.fair){const f=rp(20);
      a.push({ic:'🎪',l:`The Hilltop Street Fair — ${$(f)}`,s:'2 hours. Food, music, booths, half the hill out on MLK. Stress −20, community +8. Today only.',cat:'people',cls:'primary',dis:!canAfford(f),
        fn:()=>{spend(f);S.fair=true;pass(120);adj('stress',-20);adj('community',8);const x=meetHere();say(`🎪 The Hilltop Street Fair: a band on the stage playing old soul like they mean it, kids with painted faces, lemonade, a line for barbecue that goes around the block and is worth it. Somebody hands you a flyer for a block club. ${x?`You meet <b>${x.n}</b> in the barbecue line.`:'You know half the people here now. Wild.'}`)}});}
  }
  if(S.loc==='work'){
    const sd=isShiftDay(d),done=d in S.worked,late=Math.max(0,m-J.start),open=isOpen('work');
    if(sd&&!done&&m<J.end-60) a.push({ic:J.ic,l:'Work your shift',s:late?`${late} min late. Pay is docked and it gets noticed.`:m<J.start-30?`Starts ${fmt(J.start)}. You can wait, or clock in on time from here.`:`Until ${fmt(J.end)}. About ${$(J.pay)}${J.tips?' plus tips':''}.`,cat:'work',cls:'primary',fn:()=>work(late)});
    else if(sd&&done) a.push({ic:'✅',l:'Shift done for today',s:'See you tomorrow.',cat:'work',dis:true,fn:()=>{}});
    else if(sd&&!done) a.push({ic:'❌',l:'Too late to clock in today',s:'The shift is nearly over.',cat:'work',dis:true,fn:()=>{}});
    if(!sd&&!S.extra[d]&&!(d in S.worked)){const ok=S.standing>=50&&at(540,J.end>1000?1080:780),pay=Math.round(J.pay*.5);
      a.push({ic:'🕓',l:`Pick up a few extra hours — about ${$(pay)}`,s:ok?'4 hours. Energy −16, stress +8, job +3. Your day off, so it’s your call.':S.standing<50?'They only offer extra hours to people they count on (job 50+).':'Extra hours start between 9 AM and early afternoon.',cat:'work',dis:!ok,
        fn:()=>{S.extra[d]=true;S.stats.extra++;pass(240);money(pay);S.stats.earned+=pay;adj('energy',-16);adj('stress',8);adj('standing',3);say(`🕓 Four hours covering for someone’s kid’s birthday. ${$(pay)}, and a “you’re a lifesaver” you’ll be cashing in later.`)}});}
    if(!S.breakroom[d]&&open) a.push({ic:'☕',l:'Break-room coffee and five minutes with coworkers',s:'15 min. Energy +5, job +1. Once a day.',cat:'work',
      fn:()=>{S.breakroom[d]=true;pass(15);adj('energy',5);adj('standing',1);say(pick(WORK_TALK[S.job]||WORK_TALK.cafe))}});
    if(!open) a.push({ic:'🔒',l:`${J.place} is closed right now`,s:hoursTxt('work'),cat:'work',dis:true,fn:()=>{}});
  }
  if(S.loc==='link'){
    if(!S.ride[d]) a.push({ic:'🚋',l:'Ride the T Line and back',s:'40 min. Free. Stress −8. The whole hill rides this train. Once a day.',cat:'here',
      fn:()=>{S.ride[d]=true;S.stats.rides++;pass(40);adj('stress',-8);say(pick(['🚋 Down MLK past the hospitals, around the bend and back. A grandma and a toddler share a window seat and narrate every single dog.','🚋 Two nurses in scrubs asleep against each other, a guy with a guitar who doesn’t play it, and a kid reading a library book with total focus. The train dings. Nobody looks up.','🚋 You ride to the end of the line and back for no reason. The best reason.']));fireHook('ride',{sub:'On the T Line'})}});
    a.push({ic:'🪑',l:'Sit on the platform and people-watch',s:`20 min. ${cap(calmTxt(3))}.`,cat:'rest',fn:()=>{pass(20);calm(3);say(pick(['🪑 A train every few minutes. Every one brings somebody home.','🪑 A man in a church hat tips it to you. You don’t have a hat, so you nod hard.','🪑 Two teenagers argue about the best burger in Tacoma with the seriousness of a court case.']))}});
  }
  if(S.loc==='peoples'){
    const open=isOpen('peoples'),sw=rp(5);
    if(!S.swim[d]) a.push({ic:'🏊',l:`Swim laps — ${$(sw)}`,s:open&&at(360,1200)?'45 min. Energy −6, stress −14. Once a day.':'Pool hours are 6 AM to 8 PM.',cat:'rest',dis:!open||!at(360,1200)||!canAfford(sw),
      fn:()=>{spend(sw);S.swim[d]=true;S.stats.swims++;pass(45);adj('energy',-6);adj('stress',-14);say(pick(['🏊 Twenty laps in the cool blue. The lifeguard blows the whistle at a cannonball, then grins.','🏊 You swim until your head goes quiet. Then a few more.','🏊 Lap lanes on one side, a swim lesson on the other: six little kids blowing bubbles like it’s their job.']))}});
    if(!S.hoops[d]) a.push({ic:'🏀',l:'Get in on the pickup game',s:at(1020,1230)?'1 hour. Energy −12, stress −10, community +1. Once a day.':'The pickup game runs about 5 to 8:30 PM.',cat:'people',dis:!at(1020,1230)||S.energy<15,
      fn:()=>{S.hoops[d]=true;pass(60);adj('energy',-12);adj('stress',-10);adj('community',1);let x=null;if(!S.met.tasha){S.met.tasha=d+1;S.stats.neighbors=metCount();x=NEIGHBORS.find(y=>y.id==='tasha')}
        say(x?`🏀 <b>Tasha</b> picks you for her team because you were standing there. You hit one jumper all night and she acts like it was the game-winner. ${x.d}`:pick(['🏀 Next game is to eleven, ones and twos. You hold your own. Somebody calls you by name.','🏀 You get dunked on by a sixteen-year-old. The whole court groans in sympathy. It’s an honor, honestly.','🏀 Tasha calls a foul on herself. The court goes silent with respect. Then trash talk resumes.']))}});
    if(!S.volunteer[d]) a.push({ic:'🤲',l:'Help out with a community program',s:open&&at(540,1080)?'2 hours. Energy −8, community +3, stress −4. Once a day.':'Programs run 9 AM to 6 PM.',cat:'people',dis:!open||!at(540,1080),
      fn:()=>{S.volunteer[d]=true;pass(120);adj('energy',-8);adj('community',3);adj('stress',-4);const x=Math.random()<.5?meetHere():null;say(pick(['🤲 You hand out free lunches at the summer meal program. A kid trades you a drawing for an extra milk. You keep the drawing.','🤲 Tutoring at the summer reading program. A third grader reads you a whole chapter book, every word, and then explains it to you.','🤲 You set up chairs for the elders’ lunch and stay for dominoes. You lose, loudly, and are invited back.'])+(x?` You meet <b>${x.n}</b>.`:''))}});
    a.push({ic:'🌳',l:'Sit in People’s Park',s:`30 min. ${cap(calmTxt(5))}.`,cat:'rest',fn:()=>{pass(30);calm(5);S.stats.walks++;say(pick(['🌳 Shade, a breeze, somebody’s speaker playing Earth, Wind & Fire at a polite volume.','🌳 Pigeons, toddlers, an old man feeding both.','🌳 The courts thump, the pool shrieks, the trees don’t care. Perfect.']))}});
  }
  if(S.loc==='view'){
    a.push({ic:'🌄',l:'Sit on the bench',s:`30 min. ${cap(calmTxt(8))}.`,cat:'rest',fn:()=>{pass(30);calm(8);say(pick(['🌄 The bay, the cranes, the ferry to Vashon cutting its slow white line. The whole city is down there working, and you’re up here, breathing.','🌄 A container ship eases toward the port. From up here it looks like a toy somebody’s very careful with.','🌄 '+(S.ev.flags.mtn===d?'The mountain is out, all of it, so big it looks painted on.':'Rainier is behind the haze today. Everybody on the bench knows it’s there anyway.')]))}});
    if(!S.sunset[d]){const ss=sunsetOn(d),ok=at(ss-45,ss+20);a.push({ic:'🌅',l:'Watch the sunset',s:ok?`Sunset ${fmt(ss)}, best from ${fmt(ss-45)}. 45 min. Stress −18. Once a day. Worth it every time.`:m<ss?`Sunset ${fmt(ss)} tonight, best from ${fmt(ss-45)}. Come back then.`:`Sunset was ${fmt(ss)}. Tomorrow’s is a minute or two earlier.`,cat:'rest',cls:ok?'primary':'',dis:!ok,
      fn:()=>{S.sunset[d]=true;S.stats.sunsets++;pass(45);adj('stress',-18);const x=!S.met.harris&&Math.random()<.5;if(x){S.met.harris=d+1;S.stats.neighbors=metCount();adj('community',MEET_COMMUNITY)}
        say(pick(['🌅 The sun drops behind the Olympics and the whole bay goes copper. Rainier catches the last of it, pink as a shell.','🌅 Gold, then orange, then a purple you don’t have a word for. Somebody on the next bench says “Every night,” like a prayer.','🌅 The port lights come on one by one. The mountain goes blue, then gone.'])+(x?' An older man in a pressed shirt shares the bench and hums the whole time: <b>Mr. Harris</b>, eighty-one, thirty-one years welding ships on the tideflats. He points out the one he worked on in 1979. “Best seat in Tacoma,” he says. “Don’t tell anybody.”':''))}});}
    a.push({ic:'🚶',l:'Walk the edge of the hill',s:`45 min. ${cap(calmTxt(8))}, energy −4.`,cat:'here',fn:()=>{pass(45);S.stats.walks++;calm(8);adj('energy',-4);say(pick(['🚶 Old houses with deep porches and new ones with big windows, side by side, everybody’s tomatoes coming in at once.','🚶 Stairs down, stairs back up. Hilltop is a hill. Your legs have noticed.','🚶 A yard sign says “Hilltop is home.” A kid’s chalk on the sidewalk says the same thing with more hearts.']))}});
  }
  if(!(S.loc==='home'&&m>=1290)) a.push({ic:'⏳',l:'Wait a while…',s:'Skip ahead 30, 60 or 120 minutes.',cat:'rest',fn:()=>worldWait()});
  a.push(...hoodActions());
  return a;
}
const WORK_TALK={
  hospital:['☕ The charge nurse tells you which patient asks for you by name. You pretend that doesn’t make your whole week.','☕ A respiratory therapist shows you pictures of her garden. Every tomato has a name.','☕ Someone brought donuts. Someone always brings donuts. Hospitals run on donuts.'],
  cafe:['☕ The owner shows you how to pour a rosetta. Yours looks like a potato. She says potatoes are a start.','☕ Your coworker has a theory about every regular. Most of the theories are wrong and all of them are great.','☕ Free shift drink, a minute on the back step, the Link going by.'],
  kitchen:['☕ The pitmaster tells you the greens take a whole day and a whole life to get right. He’s on year thirty.','☕ The dishwasher is the funniest person you’ve ever met. You laugh so hard you have to sit on a milk crate.','☕ Miss Odessa herself checks your station, says nothing, nods once. You will remember that nod forever.'],
};
function work(late){
  const d=day(),J=job(),m=tod();
  if(m<J.start){pass(J.start-m)}   // early: you wait for the shift to start
  const start=Math.max(J.start,tod()),frac=Math.max(0,(J.end-start)/(J.end-J.start));
  let pay=Math.round(J.pay*frac*lifePayF()),tip=0;   // lifePayF: part-time while in college or a trade program, a raise after
  if(J.tips){tip=Math.round((J.tips[0]+Math.random()*(J.tips[1]-J.tips[0]))*(.6+S.standing/250)*frac);S.stats.tips+=tip}
  S.worked[d]=late;S.stats.shifts++;pass(J.end-tod());money(pay+tip);S.stats.earned+=pay+tip;
  adj('energy',-J.energy);adj('stress',shiftStress(J));
  if(late){S.stats.late++;adj('standing',-Math.min(BAL.late[2],BAL.late[0]+Math.ceil(late/BAL.late[1])));adj('stress',BAL.lateStress);say(`${J.ic} You slip in ${late} minutes late. ${S.job==='hospital'?'The charge nurse just looks at the clock.':S.job==='kitchen'?'The ticket rail is already full. Nobody says a word, which is worse.':'The line is out the door and your coworker is drowning.'} Paid ${$(pay)}${tip?` plus ${$(tip)} in tips`:''}.`)}
  else{adj('standing',BAL.onTime);say(`${J.ic} ${pick(SHIFT_LINES[S.job]||SHIFT_LINES.cafe)} Paid ${$(pay)}${tip?` plus ${$(tip)} in tips`:''}.`)}
  if(J.staffMeal) say('🍗 Staff meal after close: fried chicken, greens, a square of cornbread. Dinner’s covered tonight.');
  fireHook('shift',{sub:`At ${J.place}`});
}
const SHIFT_LINES={
  hospital:['A full shift on the fourth floor: vitals, baths, call lights, a man who tells you about his longshore days at the Port for twenty minutes while you change his sheets.','Eight and a half hours on your feet. You help a woman walk the hall for the first time since her surgery. She cries; you nearly do.','A hard one. Two admissions, a fall risk who will not stay in bed, and a family that needed someone to sit with them. You sat with them.'],
  cafe:['Opening shift: four hundred drinks, a hundred names, the Link outside the window every few minutes. The regulars start saying hi to you first.','A rush at 7:40 that nearly breaks you, then a slow sunny hour where a retired teacher tells you about Hilltop in the ’70s.','You remember a regular’s order before she says it. She looks at you like you did a magic trick.'],
  kitchen:['Saturday-night energy on a Wednesday: chicken, oxtails, mac and cheese, ticket after ticket. You keep up. Barely, then fully.','Sixty plates of smothered pork chops and a birthday party of twenty-two. The pitmaster says “Not bad,” which in this kitchen is a medal.','Hot, loud and fast. You burn one batch of cornbread and nail the next six. The servers start calling you by name.'],
};
function worldWait(){
  const m=tod(),o=[30,60,120].filter(x=>m+x<1439);
  modal('⏳ Wait a while',`<p style="font-size:13px;color:var(--mute)">It’s ${fmt(S.t)}. Time passes and nothing else happens.</p>`,
    o.map(x=>({l:`${x} minutes`,s:`Until ${fmt(S.t+x)}.`,fn:()=>{pass(x);say(`⏳ You wait ${x} minutes at ${L[S.loc].name}.`)}})).concat([{l:'Never mind',fn:()=>{}}]));
}

// ---- small extras on the Here tab ----
function statusTags(){
  if(isGrow()) return GROW.statusTags();
  const t=[],d=day(),J=job();
  if(isShiftDay(d)&&!(d in S.worked)) t.push(`<span class="tag">${J.ic} work ${fmt(J.start)}–${fmt(J.end)}</span>`);
  t.push(`<span class="tag ${S.food<1?'bad':''}">🍽️ ${S.food} meal${S.food===1?'':'s'} in the fridge</span>`);
  t.push(S.rent.paid?'<span class="tag">🧾 rent paid</span>':`<span class="tag ${d>=S.rent.due-3&&!canAfford(S.rent.amt)?'bad':''}">🧾 rent ${$(S.rent.amt)} due ${augDate(S.rent.due)}</span>`);
  if(S.energy<25) t.push('<span class="tag bad">🥱 running on empty</span>');
  if(S.stress>=70) t.push('<span class="tag bad">😣 stressed</span>');
  if(isFairDay(d)&&!S.fair&&tod()<FAIR_HOURS[1]) t.push('<span class="tag">🎪 street fair on MLK today</span>');
  return t;
}
function alertBar(){
  if(isGrow()) return GROW.alertBar();
  const d=day(),m=tod(),J=job();
  if(isShiftDay(d)&&!(d in S.worked)&&m>J.start&&m<J.end-60) return {t:`⏰ You’re late for work at ${J.place} (your shift started at ${fmt(J.start)}).`};
  if(isShiftDay(d)&&!(d in S.worked)&&m>=J.start-60&&m<=J.start&&S.loc!=='work') return {t:`${J.ic} Work at ${fmt(J.start)}. ${cap(J.place)} is ${travelMins(S.loc,'work')} min away.`,kind:'info'};
  if(isFairDay(d)&&m<FAIR_HOURS[1]&&!S.fair) return {t:'🎪 The Hilltop Street Fair is on MLK today, 10 AM to 6 PM.',kind:'info'};
  if(!S.rent.paid&&d>=S.rent.due-2) return {t:`🧾 Rent (${$(S.rent.amt)}) is due by ${dayName(S.rent.due)} night. ${canAfford(S.rent.amt)?'You have it: pay it at home.':`You have ${$(Math.round(S.money))}.`}`};
  if(S.food<1&&m>=960) return {t:'🍽️ The fridge is empty and dinner is coming. The corner market on MLK is open until 10 PM.',kind:'info'};
  return null;
}

// ---- extra tabs ----
// keyboard shortcuts use the label's first letter: W(eek), N(eighbors)
let EXTRA_TABS=[
  {k:'week',ic:'📅',l:'Week',view:()=>weekView()},
  {k:'hood',ic:'🤝',l:'Neighbors',view:()=>hoodView()},
];
function weekView(){
  const J=job(),d0=day();
  return `<div class="sect">${lifeLong()?`This week · ${kwName(lifeKw())}`:'Your two weeks'} · ${J.ic} ${J.n}</div>`+lifeWeekDays().map(i=>{
    const sd=isShiftDay(i),w=S.worked[i];
    let s=sd?(i in S.worked?(w?`worked, ${w} min late`:'worked, on time'):i<d0?'missed work':`work ${fmt(J.start)}–${fmt(J.end)}`):(S.extra[i]?'day off (picked up extra hours)':'day off');
    if(isFairDay(i)) s+=` · 🎪 street fair${S.fair?' (went)':''}`;
    if(i===S.rent.due) s+=` · 🧾 rent due${S.rent.paid?' (paid)':''}`;
    return `<div class="todo"><span class="ck">${i<d0?'✔️':i===d0?'👉':'·'}</span><div><b>${augDate(i)}</b><span>${s}</span></div></div>`}).join('')
    +`<div class="rules">Rent: ${S.rent.paid?`paid on ${augDate(S.rent.paidDay)} ✔️`:`${$(S.rent.amt)}, due by the end of ${longDate(S.rent.due)}. Pay it at home.`}</div>`+lifeWeekList();
}
function hoodView(){
  const met=NEIGHBORS.filter(x=>S.met[x.id]);
  return `<div class="sect">Neighbors · community ${S.community}/100</div><div class="rules">${met.length} of ${NEIGHBORS.length} neighbors know your name. Talk on the corner, play ball, help out, go to the fair: Hilltop meets you halfway.</div>`
    +met.map(x=>`<div class="todo"><span class="ck">${x.ic}</span><div><b>${x.n}</b><span>${x.d} (met ${augDate(S.met[x.id]-1)})</span></div></div>`).join('')
    +(met.length<NEIGHBORS.length?`<div class="todo"><span class="ck">·</span><div><b>${NEIGHBORS.length-met.length} more to meet</b><span>Somewhere on MLK, at People’s, on the porches and at the overlook.</span></div></div>`:'');
}

// ---- engine shims ----
// The engine (02–09) still calls a few Guide Master helpers without typeof guards (40-art.js, 45-names.js, the morning report).
// These no-op versions only fill in names nobody else defines: a real function or const elsewhere always wins.
(function(){
  const w=window,def=(k,v)=>{if(typeof w[k]==='undefined')w[k]=v};
  def('artOn',()=>false);def('artPref',()=>false);def('artScene',()=>'');def('artFirst',()=>'');def('artSlot',()=>'');def('artEventCtx',()=>null);
  def('artMorning',D=>({top:'',night:(D&&D.night)||''}));
  def('artNarrEvent',()=>null);def('ART',{any:()=>false});def('ART_NARR',null);def('LOGSUB','log');
  def('cabinName',()=>'Home');
  def('dlabel',d=>augDate(d));
  def('reqKey',r=>{if(!r)return 'a trip';const n=(r.party&&r.party.n)||r.n;return `${r.type||'trip'}${n?` for ${n}`:''}${typeof r.start==='number'?` at ${fmt(r.start)}`:''}`});
})();
