// ============================================================
//  TACOMPTON · GROWING UP, part 1: the mode switch and the world.
//  A second way to play, picked on the start page (🎒 Growing Up). You are 12. Your family just moved to Hilltop, and you have one
//  week, Mon Aug 24 to Sun Aug 30, 2026, before the first day of middle school on Mon Aug 31 (day 8, the finale). No job, no rent:
//  Energy, Mood, Family, Friends, Ready (for school) and a little allowance money. Home by 8:30 PM, or Family drops.
//  This is Chapter 1. Later chapters (middle school, high school) end with the adult game ("Two weeks on Hilltop") as the last one,
//  so everything here lives in GROW and the per-mode tables below, and the adult game's own data is left exactly as it is.
//
//  How the two modes share one engine:
//    MODE (20-world.js) is 'adult' or 'grow'. Every contract function in 20-world.js / 21-story.js starts with
//    `if(isGrow()) return GROW.x()`, and setMode() swaps the per-mode data the engine reads by name. A save with no S.mode is adult.
//    Events and achievements of the adult game are wrapped below so they only run in the adult game; Growing Up's use gEvent().
//  Events, tips, goals, scoring, the finale and the start-page button live in 31-grow-story.js.
// ============================================================

// ---- the mode switch ----
const GROW={};
const L_ADULT=L;
const MODE_DATA={
  adult:{L,STATS,SCENE,EXTRA_TABS,ACT_CATS,TIPS,LOSSES,FINISH_TEXT,RULES_HTML,days:GAME.days,wake:GAME.wake,startLoc:GAME.startLoc,
    diffs:JSON.parse(JSON.stringify(DIFFS))},
  // grow is filled in at the end of 31-grow-story.js, once every table exists
};
function setMode(m){
  MODE=m==='grow'?'grow':'adult';
  const M=MODE_DATA[MODE];if(!M)return;
  L=M.L;STATS=M.STATS;SCENE=M.SCENE;EXTRA_TABS=M.EXTRA_TABS;ACT_CATS=M.ACT_CATS;TIPS=M.TIPS;LOSSES=M.LOSSES;FINISH_TEXT=M.FINISH_TEXT;RULES_HTML=M.RULES_HTML;
  GAME.days=M.days;GAME.wake=M.wake;GAME.startLoc=M.startLoc;
  for(const k in M.diffs) Object.assign(DIFFS[k],M.diffs[k]);
  lifeSync();   // 10-life.js: a longer game keeps its own GAME.days
}
// run fn in another mode for a moment (a save being read, the Help guide), then put the current mode back
function withMode(m,fn){const prev=MODE;if(m===prev)return fn();setMode(m);try{return fn()}finally{setMode(prev)}}
const saveMode=d=>d&&d.S&&d.S.mode==='grow'?'grow':'adult';
// Reading a save (Continue, the slot list, transfer codes, the update notice) uses that save's mode; adopting a save switches to it.
{const mig=migrate,adp=adopt;
  migrate=function(d){return withMode(saveMode(d),()=>mig(d))};
  adopt=function(d){setMode(saveMode(d));return adp(d)};}
// The adult game's events and achievements only run in the adult game.
EV.forEach(e=>{const c=e.cond;e.cond=c?ctx=>!isGrow()&&c(ctx):()=>!isGrow()});
ACH.forEach(a=>{const t=a.test;a.test=c=>!isGrow()&&t(c)});
// Growing Up's events: defEvent with the mode check built in
function gEvent(e){const c=e.cond;defEvent(Object.assign({},e,{cond:c?ctx=>isGrow()&&c(ctx):()=>isGrow()}))}

// ---- the game-specific part of a Growing Up save ----
GROW.newState=()=>({
  mode:'grow',chapter:1,
  money:20,                  // allowance; replaced by DF().money at new game
  energy:85,mood:60,family:60,
  kids:{},                   // KIDS id → {met: day+1, f: friendship 0–20}
  ready:{supplies:false,route:false,haircut:false,signed:false,turnedIn:false,outfit:false},
  boxes:0,                   // boxes unpacked in your room, out of G_BOXES
  // per-day trackers (day index → true)
  hw:{},pt:{},grades:null,
  chore:{},unpack:{},dinner:{},nia:{},grandma:{},rest:{},murals:{},swim:{},hoops:{},program:{},read:{},think:{},sunset:{},hang:{},walk:{},
  curfew:{},                 // day → missed curfew (Family −)
  bbq:false,giveaway:false,card:false,mural:false,shortcut:false,
  late:{},                   // day → went to bed after 10:30 PM
  firstDay:null,             // the finale's result (31-grow-story.js)
  visited:{home:true},
  stats:{chores:0,dinners:0,swims:0,books:0,sunsets:0,hoops:0,hangs:0,curfew:0,earned:0,spent:0,snacks:0},
});

// ---- small shared helpers ----
const G_BOXES=3;                                            // your room's boxes
const G_CURFEW=1230;                                        // 8:30 PM: home by then (middle school)
const gCurfew=()=>typeof S!=='undefined'&&S&&S.age&&stage(S.age)!=='middle'?1320:G_CURFEW;   // 10 PM from 14 (high school)
const G_SUNSET=1205;                                        // about 8:05 PM at the end of August
// the first day of school (the finale of the first week): the first isSchoolDay() of the run, Mon Aug 31, 2026 (day 7) from an Aug 24 start
const gSchoolDay=()=>{const sd=lifeStartDate();for(let i=0;i<40;i++)if(schoolOn(dAt(sd,i)))return i;return 7};
const gSat=()=>gSchoolDay()-2;                                // the Saturday before: the giveaway, the barbecue, allowance day
const gCh1=(d=day())=>d<=gSchoolDay();                       // still in the first week (Chapter 1): getting Ready for school
// the school, by stage: Summit View Middle School (12–13), Hilltop High (14–17, a fictional high school)
const gHigh=()=>typeof S!=='undefined'&&!!S&&stage(S.age||12)!=='middle';
const gSchool=()=>gHigh()?'Hilltop High':'Summit View Middle School';
const gSchoolShort=()=>gHigh()?'Hilltop High':'Summit View';
const gLevel=()=>gHigh()?'high school':'middle school';
const gGradeWord=()=>({12:'seventh',13:'eighth',14:'ninth',15:'tenth',16:'eleventh',17:'twelfth'})[(typeof S!=='undefined'&&S&&S.age)||12]||'seventh';
const G_NUM=['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty'];
const gAgeWord=(n=(typeof S!=='undefined'&&S&&S.age)||12)=>G_NUM[n]||String(n);
const G_BELL=495;                                           // 8:15 AM: the first bell
const G_GIVE=[600,840];                                     // the giveaway: 10 AM – 2 PM
const gDate=d=>dateOf(d).label;                              // day index → "Mon Aug 24" (any day of the year: 10-life.js)
const gLong=d=>longDate(d);
const gRp=c=>Math.round(c*(DF().cost||1));
const gSpend=c=>{money(-c);S.stats.spent+=c};
const gEarn=c=>{money(c);S.stats.earned+=c};
const gAt=(lo,hi)=>tod()>=lo&&tod()<hi;
const gRain=()=>S.ev.flags.rain===day();
const gWeekday=(d=day())=>d%7<5;
const gParentsHome=()=>!gWeekday()||tod()>=1050;           // Mom and Dad are home on weekends, and after 5:30 PM on weekdays

// ---- the kids on the hill: any of them can become your best friend ----
// at: where they hang out; win: [from, to) minutes of the day; outdoor: not on the rainy day
const KIDS=[
  {id:'marcus',n:'Marcus',ic:'🏀',at:['peoples'],win:[840,1230],outdoor:true,
    hi:'A kid your age is shooting free throws alone on the far court, counting out loud.',
    d:'Twelve, all elbows and a jump shot he practices until the streetlights come on. Starting at Summit View too. Talks trash, but nicely.',
    hang:['🏀 You and Marcus play H-O-R-S-E until you both have H-O-R-S. He wins with a shot off the backboard he swears he called.','🏀 Two-on-two with a couple of high schoolers who let you win one. Marcus acts like it was a championship.','🏀 Marcus shows you his “secret move.” It is a regular layup. You practice it forty times anyway.']},
  {id:'ana',n:'Ana',ic:'🎨',at:['mlk'],win:[600,1080],
    hi:'A girl with a sketchbook is sitting on the curb by the market, drawing the street.',
    d:'Twelve. Carries a sketchbook everywhere and draws everybody on MLK, you included. Her aunt is painting the new mural.',
    hang:['🎨 You and Ana sit on the curb and draw the Link coming up the hill. Hers looks like a train. Yours looks like a loaf of bread with windows. She says it has “energy.”','🎨 Ana gives you a tour of every mural on MLK and who painted what. She knows them all.','🎨 Ana draws you as a superhero. Your power is “being new.” It is a better drawing than it sounds.']},
  {id:'tavita',n:'Tavita',ic:'🎸',at:['home'],win:[960,1230],
    hi:'On the steps of the fourplex across the street, a kid is playing ukulele for a little brother who is not listening.',
    d:'Turns thirteen in October and will not let anyone forget it. Lives across the street with a big, loud, friendly family. Plays ukulele on the steps.',
    hang:['🎸 Tavita teaches you three chords on his ukulele. You play them in the wrong order and his whole family claps from the window anyway.','🎸 You sit on his steps and trade stories about the places you both used to live. His has more cousins.','🎸 Tavita’s grandma brings out a plate of fried bread and won’t take no for an answer. You don’t try very hard.']},
  {id:'linh',n:'Linh',ic:'📚',at:['library'],win:[600,1080],
    hi:'At the homework table, a girl is building something out of a cereal box, rubber bands and a very small motor.',
    d:'Twelve. Has read every book on the Reading Room’s middle-grade shelf twice and is building a robot out of a cereal box. Starting at Summit View too.',
    hang:['📚 Linh recommends a book about a girl who lives on a space station. You read the first chapter together and argue about the ending you haven’t read yet.','🤖 You help Linh with the cereal-box robot. It rolls four inches and falls over. You both cheer like it landed on Mars.','📚 Linh quizzes you on the map of the school she printed off the website. She has already planned the fastest way to the cafeteria.']},
  {id:'zay',n:'Zay',ic:'🛹',at:['view','school'],win:[720,1200],outdoor:true,
    hi:'A kid on a skateboard keeps riding the same curb, falling, laughing and getting back on.',
    d:'Twelve, short for Isaiah. Skates every hill on Hilltop and knows every shortcut, including the one to school that skips the steepest block.',
    hang:['🛹 Zay lets you try his board. You make it three feet. He makes it look like walking.','🛹 You and Zay count container ships in the bay. He has names for all the cranes.','🛹 Zay shows you the stairs nobody uses and the alley with the best blackberries. You come back purple.']},
];
// the kids grow up with you: "Twelve" in a description follows your age, and so does the school
KIDS.forEach(k=>{const d0=k.d;Object.defineProperty(k,'d',{enumerable:true,get(){const a=(typeof S!=='undefined'&&S&&S.age)||12;
  return d0.replace(/^Twelve/,cap(gAgeWord(a))).replace(/\. Twelve\./,`. ${cap(gAgeWord(a))}.`).replace('Turns thirteen',`Turns ${gAgeWord(a+1)}`).replace('Summit View too',`${gSchoolShort()} too`)}})});
const gKid=id=>KIDS.find(k=>k.id===id);
const gMet=id=>!!(S.kids[id]&&S.kids[id].met);
const gMetCount=()=>KIDS.filter(k=>gMet(k.id)).length;
const gF=id=>(S.kids[id]&&S.kids[id].f)||0;
// Friends (0–100): everyone's friendship added up
const gFriends=()=>Math.min(100,KIDS.reduce((a,k)=>a+gF(k.id),0));
// meet a kid (if new) and add friendship; returns true when you just met
function gFriend(id,n){const k=S.kids[id]||(S.kids[id]={met:0,f:0}),first=!k.met;if(first)k.met=day()+1;k.f=clamp(k.f+n,0,20);return first}
function gBest(){let b=null;for(const k of KIDS){const f=gF(k.id);if(f>=12&&(!b||f>gF(b.id)))b=k}return b}
function gKidsHere(){return KIDS.filter(k=>k.at.includes(S.loc)&&gAt(k.win[0],k.win[1])&&!(k.outdoor&&gRain()))}

// ---- Ready: what you need for Monday ----
const G_READY=[
  {k:'supplies',ic:'🎒',l:'School supplies',w:20,how:'The corner market on MLK, or free at the giveaway at People’s, Sat 10 AM–2 PM.'},
  {k:'route',ic:'🗺️',l:'Learn the way to school',w:20,how:'Walk to Summit View Middle School once.'},
  {k:'haircut',ic:'💈',l:'A back-to-school haircut',w:15,how:'The barbershop and salon on MLK, Tue–Sat.'},
  {k:'signed',ic:'📝',l:'Get the forms signed',w:15,how:'At home, when Mom and Dad are home (evenings and the weekend).'},
  {k:'turnedIn',ic:'📬',l:'Turn the forms in',w:15,how:'The school office, Mon–Fri 9 AM–3 PM.'},
  {k:'outfit',ic:'👕',l:'Pick a first-day outfit',w:15,how:'In your room at home.'},
];
const gReady=()=>G_READY.reduce((a,r)=>a+(S.ready[r.k]?r.w:0),0);
const gGrades=()=>S.grades==null?gReady():S.grades;          // after the first week: school grades (10-life.js)
function gGetReady(k){if(S.ready[k])return;S.ready[k]=true}

// ---- HUD ----
const G_STATS=[
  {l:'Money',v:()=>$(Math.round(S.money)),title:'Your allowance. Chores earn a little more, and Saturday is allowance day.'},
  {l:'Energy',v:()=>S.energy,m:()=>S.energy,warn:()=>S.energy<20},
  {l:'Mood',v:()=>S.mood,m:()=>S.mood,warn:()=>S.mood<25,title:'How you feel. Fun, friends and rest bring it up; nerves and a bad night bring it down.'},
  {l:'Family',v:()=>S.family,m:()=>S.family,warn:()=>S.family<30,title:'How things are at home. Chores, dinner and being home by 8:30 PM help.'},
  {l:'Friends',v:()=>gFriends(),m:()=>gFriends(),get title(){return `You know ${gMetCount()} of ${KIDS.length} kids on the hill.`}},
  {get l(){return gCh1()?'Ready':'Grades'},v:()=>gCh1()?gReady():gGrades(),m:()=>gCh1()?gReady():gGrades(),warn:()=>!gCh1()&&gGrades()<40,get title(){return gCh1()?`Ready for the first day of school: ${G_READY.filter(r=>S.ready[r.k]).length} of ${G_READY.length} things done.`:`Your grades at ${gSchoolShort()}. School days, homework and studying raise them.`}},
];

// ---- scenery: the end of August (sunrise about 6:25 AM, sunset about 8:05 PM) ----
const G_SCENE={sun:[385,G_SUNSET],skyDay:['#8fbbd9','#e6eef0'],skyDusk:['#5d5f97','#f4b183'],skyNight:['#0c1729','#1f2f4a'],ground:'#6f7a6c',groundNight:'#1f2526'};
// rain on the rainy day: streaks over any scene
const gRainArt=()=>typeof S!=='undefined'&&S&&gRain()?`<g stroke="#dfe8ee" stroke-width="1.2" opacity=".55">${Array.from({length:34},(_,i)=>{const x=(i*53)%480,y=(i*37)%130;return `<path d="M${x} ${y} l-5 12"/>`}).join('')}</g>`:'';
const G_ART={
  // the family apartment: upstairs in a green fourplex, boxes on the porch, chalk on the sidewalk
  home:({night:n})=>`${starsSky(n)}${rainier(n,420,.55,112)}${tree(34,n,18)}${tree(82,n,13)}
    <rect x="120" y="48" width="200" height="92" fill="${n?'#263a30':'#6f9a7a'}"/><polygon points="110,50 220,16 330,50" fill="${n?'#1d1a1c':'#4a3a36'}"/>
    <rect x="206" y="28" width="28" height="13" fill="${win(n,true)}"/><path d="M220 28 v13" stroke="${n?'#1d1a1c':'#4a3a36'}" stroke-width="2"/>
    ${[136,178,248,290].map((x,i)=>`<rect x="${x}" y="58" width="22" height="18" fill="${i===3?(n?'#ffcf7a':'#e9f1f4'):win(n,i!==1)}"/><rect x="${x-2}" y="76" width="26" height="3" fill="${n?'#33463c':'#e8e2d0'}"/>`).join('')}
    <circle cx="301" cy="66" r="3.2" fill="${n?'#fff3c0':'#f2b630'}" opacity=".9"/><path d="M294 72 h14" stroke="${n?'#c98a3a':'#b8402a'}" stroke-width="2"/>
    ${[186,232].map((x,i)=>`<rect x="${x}" y="90" width="22" height="16" fill="${win(n,i===0)}"/>`).join('')}
    <rect x="112" y="108" width="216" height="5" fill="${n?'#3a3434':'#efe6d6'}"/>${[114,170,220,270,322].map(x=>`<rect x="${x}" y="112" width="4" height="28" fill="${n?'#3a3434':'#efe6d6'}"/>`).join('')}
    <rect x="146" y="114" width="20" height="26" fill="${n?'#1a1412':'#7a3a2a'}"/><rect x="274" y="114" width="20" height="26" fill="${n?'#1a1412':'#2a5a7a'}"/>
    <rect x="236" y="126" width="18" height="14" fill="${n?'#4a3a2a':'#c49a6a'}"/><rect x="242" y="118" width="14" height="10" fill="${n?'#55432f':'#d6ae7c'}"/><path d="M236 133 h18 M242 123 h14" stroke="${n?'#3a2c20':'#9a744a'}" stroke-width="1"/>
    ${[126,196,306].map(x=>`<rect x="${x}" y="132" width="8" height="8" fill="${n?'#4a2e24':'#b8603a'}"/><circle cx="${x+4}" cy="129" r="5" fill="${HC.leaf2(n)}"/>`).join('')}
    <rect x="0" y="146" width="480" height="5" fill="${HC.walk(n)}"/>
    <g opacity="${n?.35:.9}"><path d="M352 160 h16 v6 h-16 z M368 160 h16 v6 h-16 z M384 160 h16 v6 h-16 z" stroke="#f08fb0" stroke-width="1.5" fill="none"/><path d="M420 160 l4 -6 l4 6 l-7 -4 h7 z" stroke="#f2d04a" stroke-width="1.5" fill="none"/></g>
    <g><circle cx="356" cy="134" r="6" stroke="${n?'#666':'#333'}" stroke-width="2" fill="none"/><circle cx="378" cy="134" r="6" stroke="${n?'#666':'#333'}" stroke-width="2" fill="none"/><path d="M356 134 l8 -9 h9 l5 9 M364 125 l-2 -4 h-3" stroke="${n?'#7a4a6a':'#c0392b'}" stroke-width="2" fill="none"/></g>
    ${person(404,n,'#e86fa0',150,.7)}${lamp(448,n)}${gRainArt()}`,
  // Summit View Middle School: brick, a clock over the doors, a readerboard counting down to Monday
  school:({night:n})=>`${starsSky(n)}${tree(22,n,16)}${tree(452,n,15)}
    <rect x="410" y="34" width="3" height="106" fill="${n?'#555':'#8a8f94'}"/><path d="M413 36 h22 l-5 6 l5 6 h-22 z" fill="${n?'#2a4a3a':'#2f8f6a'}"/>
    <rect x="90" y="58" width="300" height="82" fill="${n?'#3e2a26':'#a8553f'}"/><rect x="86" y="52" width="308" height="7" fill="${n?'#4a403a':'#e9dcc4'}"/>
    ${[102,130,158,182].map(x=>[66,98].map(y=>`<rect x="${x}" y="${y}" width="16" height="20" fill="${win(n,(x+y)%3===0)}"/><rect x="${x}" y="${y+9}" width="16" height="2" fill="${n?'#3e2a26':'#a8553f'}"/>`).join('')).join('')}
    ${[288,314,340,364].map(x=>[66,98].map(y=>`<rect x="${x}" y="${y}" width="16" height="20" fill="${win(n,(x+y)%4===0)}"/><rect x="${x}" y="${y+9}" width="16" height="2" fill="${n?'#3e2a26':'#a8553f'}"/>`).join('')).join('')}
    <rect x="204" y="38" width="72" height="102" fill="${n?'#352320':'#93462f'}"/><polygon points="198,40 240,16 282,40" fill="${n?'#4a403a':'#e9dcc4'}"/><circle cx="240" cy="31" r="6.5" fill="${n?'#d8d2b0':'#fff'}" stroke="${n?'#4a403a':'#5a4a3a'}"/><path d="M240 31 v-4 M240 31 h3" stroke="#333" stroke-width="1.2"/>
    <rect x="210" y="48" width="60" height="22" rx="2" fill="${n?'#2a2a30':'#f3ecdc'}"/><text x="240" y="58" text-anchor="middle" font-size="8.5" ${SVGF} fill="${n?'#b9b2a6':'#7a2f1e'}">${gHigh()?'HILLTOP':'SUMMIT VIEW'}</text><text x="240" y="66.5" text-anchor="middle" font-size="5.5" ${SVGF} fill="${n?'#b9b2a6':'#7a2f1e'}">${gHigh()?'HIGH SCHOOL':'MIDDLE SCHOOL'}</text>
    <rect x="216" y="80" width="48" height="20" fill="${win(n,false)}"/><rect x="222" y="106" width="36" height="34" fill="${n?'#1e2a36':'#2a5a7a'}"/><path d="M240 106 v34" stroke="#ddd" stroke-width="1.5"/>
    <rect x="212" y="136" width="56" height="4" fill="${n?'#5a5450':'#d8cfc0'}"/>
    <rect x="54" y="20" width="64" height="30" rx="3" fill="${n?'#1a2430':'#16324d'}"/><rect x="64" y="50" width="3" height="94" fill="#555"/><rect x="105" y="50" width="3" height="94" fill="#555"/>
    <text x="86" y="32" text-anchor="middle" font-size="7" ${SVGF} fill="#f4d27a">${gHigh()?'WELCOME BACK':'WELCOME, OWLS'}</text><text x="86" y="43" text-anchor="middle" font-size="6.5" ${SVGF} fill="#7fe0a0">1ST DAY · MON 8/31</text>
    ${[96,112,128].map(x=>`<path d="M${x} 140 v-9 a5 5 0 0 1 10 0 v9" stroke="${n?'#555':'#6a7076'}" stroke-width="2" fill="none"/>`).join('')}
    ${person(300,n,'#f2b630',146,.8)}${lamp(398,n,146)}${gRainArt()}`,
  // the Reading Room: a little community library in an old storefront
  library:({night:n})=>`${starsSky(n)}
    <rect x="8" y="36" width="112" height="104" fill="${n?'#2e2a30':'#b9a48a'}"/>${[0,1,2].map(r=>[0,1,2].map(c=>`<rect x="${20+c*34}" y="${46+r*30}" width="18" height="18" fill="${win(n,(r+c)%2===0)}"/>`).join('')).join('')}
    <rect x="360" y="44" width="112" height="96" fill="${n?'#2a2c34':'#9fb0b8'}"/>${[0,1].map(r=>[0,1,2].map(c=>`<rect x="${372+c*34}" y="${56+r*30}" width="18" height="18" fill="${win(n,(r+c)%3!==1)}"/>`).join('')).join('')}
    <rect x="130" y="26" width="220" height="114" fill="${n?'#3a3228':'#e2d2ae'}"/><rect x="126" y="20" width="228" height="8" fill="${n?'#241e18':'#5a4030'}"/>
    <rect x="150" y="32" width="180" height="22" rx="3" fill="${n?'#173840':'#1f4d5a'}"/><text x="240" y="47.5" text-anchor="middle" font-size="12" ${SVGF} fill="#f4d27a">THE READING ROOM</text>
    <path d="M130 58 h220 l-10 13 h-200 z" fill="${n?'#1f3a40':'#2f6d7a'}"/>${Array.from({length:11},(_,i)=>`<path d="M${138+i*20} 58 h10 l-1 13 h-9 z" fill="#fff" opacity=".35"/>`).join('')}
    ${[142,258].map(x=>`<rect x="${x}" y="76" width="80" height="58" fill="${win(n)}"/><rect x="${x}" y="100" width="80" height="2.5" fill="${n?'#4a3a2a':'#8a6b48'}"/>${Array.from({length:12},(_,i)=>`<rect x="${x+4+i*6}" y="${86-(i*7)%5}" width="5" height="${14+(i*7)%5}" fill="${['#b8402a','#2f8f6a','#24507a','#f2b630','#8e44ad'][i%5]}" opacity="${n?.7:.9}"/>`).join('')}`).join('')}
    <circle cx="300" cy="124" r="9" fill="${n?'#7a4a8a':'#e3642e'}" opacity=".85"/><circle cx="168" cy="124" r="8" fill="${n?'#3a6a5a':'#2f8f6a'}" opacity=".85"/>
    <rect x="226" y="80" width="28" height="60" fill="${n?'#1a1410':'#4a3226'}"/><rect x="230" y="84" width="20" height="18" fill="${win(n)}" opacity=".8"/>
    <rect x="374" y="104" width="26" height="18" fill="${n?'#3a4a6a':'#2a6fa8'}"/><polygon points="370,105 387,94 404,105" fill="${n?'#2a2a30':'#b8402a'}"/><rect x="378" y="108" width="18" height="10" fill="${n?'#d8c48a':'#fbe9b0'}"/><rect x="385" y="122" width="4" height="24" fill="${HC.trunk(n)}"/>
    <rect x="40" y="132" width="60" height="4" fill="${n?'#3e3228':'#8a6b48'}"/><rect x="44" y="136" width="3" height="10" fill="#444"/><rect x="93" y="136" width="3" height="10" fill="#444"/>
    ${person(70,n,'#2a6fa8',134,.75)}<rect x="74" y="114" width="8" height="6" fill="#f3efe0"/>${lamp(122,n)}${gRainArt()}`,
};

// ---- places: all on Hilltop ----
// hours: d=>[open,close] or null. MLK, People's and the overlook use the adult game's own drawings.
const G_L={
  home:{name:'Home',ic:'🏠',desc:'Upstairs in a green fourplex on a side street: your half-unpacked room, Nia’s drawings on the fridge, Mom’s plants on the porch',
    art:o=>G_ART.home(o)},
  mlk:{name:'MLK Jr Way',ic:'🛒',desc:'The main street: the corner market, the barbershop and the salon, the murals, and the Link dinging up the middle',
    art:o=>L_ADULT.mlk.art(o)+gRainArt()},
  peoples:{name:'People’s Center & Park',ic:'🏊',desc:'People’s Community Center on MLK: the pool, the hoop courts in the park and the summer rec program',hours:()=>[420,1260],
    art:o=>L_ADULT.peoples.art(o)+gRainArt()},
  library:{name:'The Reading Room',ic:'📚',desc:'A little community library in an old storefront: shelves to the ceiling, beanbags and Ms. Okafor, who knows everything',
    hours:d=>d%7===6?[720,1020]:[600,1080],art:o=>G_ART.library(o)},
  school:{get name(){return gSchool()},ic:'🏫',get desc(){return gHigh()?'Hilltop High, up the hill: the gym, the commons, the bus loop and a mural of the mountain in the front hall':'Your new school up the hill, home of the Owls. The office is open weekdays this week; classes start Mon Aug 31'},
    art:o=>G_ART.school(o)},
  view:{name:'The overlook',ic:'🌄',desc:'The bench at the edge of the hill: Commencement Bay, the port cranes, Vashon off to the right, and Rainier when the mountain is out',
    art:o=>L_ADULT.view.art(o)+gRainArt()},
};
// Minutes on foot between places (symmetric)
const G_TRAVEL={'home|mlk':6,'home|peoples':9,'home|library':8,'home|school':14,'home|view':12,
  'mlk|peoples':5,'mlk|library':4,'mlk|school':10,'mlk|view':10,
  'peoples|library':6,'peoples|school':9,'peoples|view':12,
  'library|school':8,'library|view':12,'school|view':14};
GROW.travelMins=(a,b)=>{let m=G_TRAVEL[a+'|'+b]??G_TRAVEL[b+'|'+a]??10;if(S&&S.shortcut&&(a==='school'||b==='school'))m=Math.max(4,m-3);return m};

// ---- actions ----
const G_CATS={family:'🏠 Family',school:'🎒 Getting ready',kids:'🤝 Kids',fun:'🎈 Fun',money:'🛒 Spend',rest:'🛋️ Rest',here:'📍 Around here'};
GROW.actionsHere=()=>{
  const d=day(),m=tod(),a=[],rain=gRain(),school=d===gSchoolDay();
  // the finale: the first day of school
  if(school&&!S.firstDay){
    if(S.loc==='school') a.push({ic:'🔔',l:'Go in: the first day of middle school',s:m<=G_BELL?`The bell rings at ${fmt(G_BELL)}. You’re on time.`:`The bell rang at ${fmt(G_BELL)}. You’re late, but you’re here.`,cat:'school',cls:'primary',fn:()=>GROW.firstDayStart()});
    else if(S.loc==='home') a.push({ic:'🎒',l:'Head to school',s:`Summit View is ${travelMins('home','school')} minutes away. The bell rings at ${fmt(G_BELL)}.`,cat:'school',cls:'primary',fn:()=>go('school')});
  }
  // kids who are here right now
  for(const k of gKidsHere()){
    if(!gMet(k.id)) a.push({ic:'👋',l:'Say hi',s:k.hi,cat:'kids',cls:school?'':'primary',fn:()=>{pass(20);gFriend(k.id,4);adj('mood',5);S.stats.hangs++;
      say(`${k.ic} You walk over and say hi. It takes everything you have. It goes fine: this is <b>${k.n}</b>. ${k.d}`)}});
    else if(!S.hang[d+'|'+k.id]) a.push({ic:k.ic,l:`Hang out with ${k.n}`,s:`45 min. Friendship with ${k.n} +4, mood +4, energy −4. Once a day.`,cat:'kids',fn:()=>{pass(45);S.hang[d+'|'+k.id]=true;gFriend(k.id,4);adj('mood',4);adj('energy',-4);S.stats.hangs++;
      say(pick(k.hang));if(gF(k.id)>=12&&!(S.ev.flags['bf_'+k.id])){S.ev.flags['bf_'+k.id]=day();say(`${k.ic} On the way out, ${k.n} says, like it’s nothing, “Want to walk to school together Monday?” You say yes before they finish the question.`)}}});
  }
  if(S.loc==='home'){
    const late=m>=1290;
    a.push({ic:'🛏️',l:'Go to bed',s:`Ends the day. ${m>=1350?'It’s late: you’ll be tired tomorrow.':'Bed by 10:30 PM keeps your energy up.'} Wake-up: ${fmt(S.alarm)}.${d===gSchoolDay()-1?' Tomorrow is the first day of school.':''}`,cat:'rest',cls:m>=1260?'primary':'',fn:()=>endDay('home')});
    if(d<gSchoolDay()-1) a.push({ic:'⏰',l:`Wake up at ${fmt(S.alarm)}`,s:'Tap to change: 7:00 → 7:30 → 8:00 → 8:30 → 9:00.',cat:'rest',fn:()=>{const o=[420,450,480,510,540];S.alarm=o[(o.indexOf(S.alarm)+1)%o.length];say(`⏰ Your alarm is set for ${fmt(S.alarm)}.`)}});
    if(!S.rest[d]||S.energy<40) a.push({ic:'😴',l:'Rest in your room',s:'An hour with comics and the fan on. Energy +10, mood +3.',cat:'rest',dis:S.energy>=100,fn:()=>{pass(60);S.rest[d]=true;adj('energy',10);adj('mood',3);
      say(pick(['😴 You lie on your bed with a comic over your face and listen to the street: a bus, a dog, somebody laughing on a porch.','😴 Nap. Not on purpose. Nia puts a sticker on your forehead while you sleep. It says GREAT JOB.','😴 The fan turns back and forth. The ceiling has a crack shaped like Florida. You will know it well.']))}});
    if(!S.chore[d]&&!late){const c=GROW.chores[d%GROW.chores.length];
      a.push({ic:c[0],l:c[1],s:`30 min. Family +6, and Dad pays ${$(3)}. Energy −4. Once a day.`,cat:'family',fn:()=>{pass(30);S.chore[d]=true;S.stats.chores++;adj('family',6);adj('energy',-4);gEarn(3);say(c[2])}});}
    if(!S.dinner[d]&&gAt(1050,1170)) a.push({ic:'🍽️',l:'Family dinner',s:'45 min. Everybody at the table. Family +8, energy +12, mood +4.',cat:'family',cls:'primary',fn:()=>{pass(45);S.dinner[d]=true;S.stats.dinners++;adj('family',8);adj('energy',12);adj('mood',4);
      say(pick(GROW.dinners))}});
    if(!S.nia[d]&&gAt(480,1260)) a.push({ic:'🧸',l:'Play with Nia',s:'30 min. Your little sister is seven and has plans for you. Family +5, mood +3.',cat:'family',fn:()=>{pass(30);S.nia[d]=true;adj('family',5);adj('mood',3);adj('energy',-3);
      say(pick(['🧸 Nia runs a pretend restaurant out of a moving box. You order the special. It is a sock. Five stars.','🧸 You and Nia build a fort out of every couch cushion and both of your blankets. Mom pretends not to see it.','🧸 Nia wants to know if middle school has recess. You say yes. You are not sure. You will find out.','🖍️ You and Nia chalk a hopscotch court on the sidewalk. The kid from downstairs joins in. Nia is in charge.']))}});
    if(!S.grandma[d]&&gAt(540,1260)) a.push({ic:'📞',l:'Call Grandma',s:'20 min. She wants to hear everything. Mood +6.',cat:'family',fn:()=>{pass(20);S.grandma[d]=true;adj('mood',6);
      say(pick(['📞 Grandma asks if the new place has a yard. You say it has a view of a volcano. She says, “Well, la-di-da.”','📞 Grandma tells you she was nervous her first day of seventh grade too, in 1971, and she turned out fine. Mostly.','📞 Grandma puts you on speaker so the whole kitchen back home can say hi. It’s loud. It’s great.']))}});
    if(S.boxes<G_BOXES) a.push({ic:'📦',l:`Unpack a box in your room (${S.boxes} of ${G_BOXES})`,s:S.unpack[d]?'One a day. The rest can wait until tomorrow.':'30 min. Mood +4, energy −3. Your room starts to feel like yours.',cat:'here',dis:!!S.unpack[d],fn:()=>{pass(30);S.unpack[d]=true;S.boxes++;adj('mood',4);adj('energy',-3);
      say(S.boxes>=G_BOXES?'📦 The last box: your posters, your trophy from second-grade soccer, the lamp shaped like a moon. It’s your room now.':pick(['📦 Clothes, mostly. You find a hoodie you forgot you had. It still fits. Barely.','📦 Books and a jar of rocks from the old house. You put the rocks on the windowsill, facing the mountain.']))}});
    if(lifeLong()&&!gCh1()&&isSchoolDay(d)&&!S.hw[d]) a.push({ic:'📚',l:'Do your homework',s:'45 min at the kitchen table. Grades +3, mood −1. Once a school day.',cat:'school',cls:m<1080?'primary':'',fn:()=>{pass(45);S.hw[d]=true;S.grades=clamp(gGrades()+3,0,100);adj('mood',-1);adj('energy',-3);
      say(pick(['📚 Math, then a reading log, then a worksheet that was due yesterday. Done. Nia “helps.”','📚 You actually understand the science homework. You check it twice anyway.','📚 An essay outline, three sentences at a time. Mom reads it and says it’s good. It is, mostly.']))}});
    if(gCh1()&&!S.ready.signed){const ok=gParentsHome();
      a.push({ic:'📝',l:'Ask Mom and Dad to sign the school forms',s:ok?(S.family>=45?'15 min. The emergency card, the lunch form, the bus form.':'They’re home, but it’s been a week. Help out first (Family 45+).'):'They’re at work. Weekday evenings after 5:30 PM, or the weekend.',cat:'school',dis:!ok,
        fn:()=>{pass(15);if(S.family>=45){gGetReady('signed');adj('family',2);say('📝 Mom signs the emergency card, Dad signs the lunch form, and they both sign the bus form “just in case.” Mom writes your name on the folder in marker, very neatly, like it’s a big deal. It kind of is.')}
          else{adj('family',-2);say('📝 Dad is buried in boxes and Mom is on the phone with the internet company. “Tomorrow, okay? Help me with these first.” Do a chore or two, then ask again.')}}});}
    if(gCh1()&&!S.ready.outfit) a.push({ic:'👕',l:'Pick a first-day outfit',s:'20 min. Lay it out on the chair, shoes and all.',cat:'school',fn:()=>{pass(20);gGetReady('outfit');adj('mood',3);
      say('👕 You try on four outfits and pick the first one. It’s laid out on your chair, shoes underneath, like a person who is ready. Nia gives it a thumbs-up.')}});
    if(d===gSat()&&!S.bbq&&gAt(960,1230)) a.push({ic:'🍖',l:'Go to the barbecue across the street',s:'Tavita’s family is grilling and the whole block is invited. 90 min.',cat:'fun',cls:'primary',fn:()=>GROW.bbq()});
  }
  if(S.loc==='mlk'){
    const mk=gAt(420,1320),sn=gRp(2),sup=gRp(18),cut=gRp(15),shop=gWeekday()?d%7!==0:d%7===5;   // barbershop: Tue–Sat
    a.push({ic:'🍬',l:`A snack from the corner market — ${$(sn)}`,s:mk?'A cold drink and a bag of hot chips. Energy +6, mood +2.':'The market is open 7 AM to 10 PM.',cat:'money',dis:!mk||S.money<sn,fn:()=>{gSpend(sn);S.stats.snacks++;pass(10);adj('energy',6);adj('mood',2);
      say(pick(['🍬 Grace Kim rings you up and asks if you’re the new family on the side street. She says the good tortillas come in on Thursdays, and the good hot sauce is the one with the hand-drawn label.','🍬 A cold can from the back of the cooler and hot chips on the curb. Summer, perfected.','🍬 You count out quarters on the counter. Grace Kim waits like she has all day. She does, kind of.']))}});
    if(gCh1()&&!S.ready.supplies) a.push({ic:'🎒',l:`School supplies at the corner market — ${$(sup)}`,s:mk?`Binder, pencils, a calculator, a pack of paper. You have ${$(Math.round(S.money))}. (Or free at the giveaway at People’s, Sat 10–2.)`:'The market is open 7 AM to 10 PM.',cat:'school',dis:!mk||S.money<sup,
      fn:()=>{gSpend(sup);pass(20);gGetReady('supplies');say('🎒 A binder, a pack of pencils, a calculator with your initials scratched on the back, and paper that is going to be so organized for about one week. Mr. Kim throws in a free eraser shaped like a taco.')}});
    if(S.age>=16&&!S.pt[d]){const ok=gAt(600,1080)&&!(isSchoolDay(d)&&tod()<925);a.push({ic:'🧾',l:'Work a shift at the corner market',s:ok?'4 hours stocking shelves and ringing up. About $56, energy −14. Once a day.':'Shifts start between 10 AM and 6 PM (after school on school days).',cat:'money',dis:!ok,
      fn:()=>{pass(240);S.pt[d]=true;gEarn(56);adj('energy',-14);adj('mood',-1);say('🧾 Four hours at the corner market: stocking the hot-sauce shelf, ringing up neighbors, learning which regulars want a bag and which ones would be insulted. Grace Kim pays you in cash and a cold drink. $56.')}})}
    if(gCh1()&&!S.ready.haircut) a.push({ic:'💈',l:`A back-to-school cut at the barbershop or the salon — ${$(cut)}`,s:shop&&gAt(540,1080)?'45 min. Dre at the barbershop, or the braider at the salon next door. Ready, mood +5.':'Open Tuesday to Saturday, 9 AM to 6 PM.',cat:'school',dis:!(shop&&gAt(540,1080))||S.money<cut,
      fn:()=>{gSpend(cut);pass(45);gGetReady('haircut');adj('mood',5);say('💈 Dre, in the chair by the window, has opinions about the Seahawks, the weather and your old haircut. He fixes two of the three. You walk out feeling taller. The whole shop says “Looking sharp, new kid.”')}});
    if(!S.murals[d]) a.push({ic:'🖼️',l:'Look at the murals',s:'30 min. Mood +5. Once a day.',cat:'fun',fn:()=>{pass(30);S.murals[d]=true;adj('mood',5);
      say(pick(['🖼️ Three stories of faces on a brick wall: grandmothers, ballplayers, a kid on a bike who looks a little like you. HILLTOP PROUD, it says, in letters taller than your dad.','🖼️ A mural of the mountain, the bay and the Link, all in colors louder than the real ones. You stare until a bus honks hello.','🖼️ You find a small painted owl in the corner of one mural. Owls are the mascot at Summit View. You decide it’s a sign.']))}});
    a.push({ic:'🚋',l:'Watch the Link go by',s:'20 min. The streetcar dings up MLK every few minutes. Mood +2.',cat:'fun',fn:()=>{pass(20);adj('mood',2);say(pick(['🚋 The Link slides by, white and green, with its little bell. A baby in the window waves. You wave back.','🚋 You count three trains up and three trains down. The operator on the last one gives you a two-finger wave.']));fireHook('linkwatch',{sub:'On MLK'})}});
  }
  if(S.loc==='peoples'){
    const sw=gRp(1);
    if(!S.swim[d]) a.push({ic:'🏊',l:`Open swim at the pool — ${$(sw)}`,s:gAt(780,1080)?'An hour. Energy −8, mood +8. Once a day.':'Open swim is 1 PM to 6 PM.',cat:'fun',dis:!gAt(780,1080)||S.money<sw,fn:()=>{gSpend(sw);pass(60);S.swim[d]=true;S.stats.swims++;adj('energy',-8);adj('mood',8);
      say(pick(['🏊 Cannonball contest. You lose to a nine-year-old with no fear. The lifeguard gives you both a seven.','🏊 Laps, then floating, then floating some more. The water is the one place nobody is new.','🏊 Somebody’s dad runs a game of sharks and minnows with twenty kids. You are a minnow. You survive. Barely.']))}});
    if(!S.hoops[d]) a.push({ic:'🏀',l:'Shoot around on the courts',s:rain?'The courts are puddles today.':'45 min. Energy −8, mood +5. Once a day.',cat:'fun',dis:rain||!gAt(480,1230),fn:()=>{pass(45);S.hoops[d]=true;S.stats.hoops++;adj('energy',-8);adj('mood',5);
      say(pick(['🏀 You shoot around alone until your arms are noodles. Three in a row from the free-throw line. Nobody saw. It counts.','🏀 An older kid rebounds for you for ten minutes and says, “Bend your knees.” You do. It works.']))}});
    if(!S.program[d]&&gWeekday()&&!isSchoolDay(d)) a.push({ic:'🎨',l:'The summer rec program',s:gAt(600,840)?'2 hours of games and crafts with other kids, 10 AM–2 PM weekdays. Mood +5, and you might meet someone.':'Weekdays, 10 AM to 2 PM.',cat:'kids',dis:!gAt(600,840),fn:()=>{pass(120);S.program[d]=true;adj('mood',5);adj('energy',-6);
      const k=pick(KIDS.filter(x=>!gMet(x.id)).concat(KIDS.filter(x=>gMet(x.id))));const first=gFriend(k.id,3);
      say(`🎨 ${pick(['Capture the flag in the park, then friendship bracelets in the gym.','A water-balloon relay that turns into a water-balloon free-for-all.','Kickball, popsicles, and a counselor with a whistle she never uses.'])} ${first?`You end up on a team with <b>${k.n}</b>. ${k.d}`:`You end up next to ${k.n} again. Friendship +3.`}`)}});
    if(d===gSat()&&!S.giveaway) a.push({ic:'🎒',l:'The back-to-school giveaway',s:gAt(G_GIVE[0],G_GIVE[1])?'Free backpacks and supplies, on tables in the gym. 30 min.':'Saturday, 10 AM to 2 PM, in the gym.',cat:'school',cls:gAt(G_GIVE[0],G_GIVE[1])?'primary':'',dis:!gAt(G_GIVE[0],G_GIVE[1]),fn:()=>GROW.giveaway()});
  }
  if(S.loc==='library'){
    const op=isOpen('library');
    if(!S.read[d]) a.push({ic:'📖',l:'Read in a beanbag',s:op?'An hour. Mood +6, energy +4. Once a day.':hoursTxt('library'),cat:'rest',dis:!op,fn:()=>{pass(60);S.read[d]=true;S.stats.books++;adj('mood',6);adj('energy',4);
      say(pick(['📖 A graphic novel about a kid who moves to a new town and turns out to be a dragon. Relatable, mostly.','📖 You read a whole mystery in one sitting. The librarian, Ms. Okafor, asks who did it. You tell her. She says, “Called it.”','📖 A book of facts about volcanoes. Rainier is one. You read that part twice.']))}});
    if(!S.ev.flags.card) a.push({ic:'🪪',l:'Get a library card',s:op?'10 min. Ms. Okafor needs your name and your new address.':hoursTxt('library'),cat:'here',dis:!op,fn:()=>{pass(10);S.ev.flags.card=day()+1;adj('mood',4);
      say('🪪 Ms. Okafor types in your new address and hands you a card that is still warm from the printer. “Welcome to the neighborhood. Ten books at a time, and I want to hear about every one.”')}});
    if(gCh1()&&!S.ev.flags.map) a.push({ic:'💻',l:'Look up Summit View on the computer',s:op?'20 min. The school map, the bell schedule, which door is which.':hoursTxt('library'),cat:'school',dis:!op,fn:()=>{pass(20);S.ev.flags.map=day()+1;adj('mood',3);
      say(`💻 Summit View’s website: a map with the gym, the cafeteria and the 200 hall, and the bell schedule. First bell ${fmt(G_BELL)}. You print the map. It goes in your back pocket and stays there all week.`)}});
  }
  if(S.loc==='school'){
    const office=gWeekday()&&gAt(540,900)&&!school;
    if(!S.walk[d]&&!school) a.push({ic:'🗺️',l:'Walk around the building',s:'30 min. The front doors, the gym, the bike rack, the side door the eighth graders use. Mood +3.',cat:'school',fn:()=>{pass(30);S.walk[d]=true;adj('mood',3);
      say(pick(['🗺️ You walk all the way around Summit View. It is enormous. Your old school would fit in the gym. Through a window you can see a hallway of lockers, waiting.','🗺️ A custodian mopping the front steps tells you the trick: “The 200 hall is upstairs. Everybody gets that wrong. Not you, now.”','🗺️ You peek in the cafeteria window. Long tables, a stage, a banner that says WELCOME OWLS. Your stomach does a small flip.']))}});
    if(gCh1()&&!S.ready.turnedIn&&!school) a.push({ic:'📬',l:'Turn in your forms at the office',s:!S.ready.signed?'Get them signed at home first.':office?'15 min. You’ll get your schedule and a locker number.':'The office is open weekdays, 9 AM to 3 PM, this week.',cat:'school',cls:S.ready.signed&&office?'primary':'',dis:!S.ready.signed||!office,
      fn:()=>{pass(15);gGetReady('turnedIn');adj('mood',4);say('📬 The office secretary checks every form, stamps them, and slides a schedule across the counter: homeroom in room 214, science, math, PE, lunch, social studies, band. Locker 1142. “Try the combination now, everybody forgets.” You try it four times. It opens.')}});
  }
  if(S.loc==='view'){
    const ss=gSunsetOn(d);if(!S.sunset[d]) a.push({ic:'🌅',l:'Watch the sunset',s:gAt(ss-50,ss+15)?`30 min. Mood +8. Then hurry: home by ${fmt(gCurfew())}.`:`Best around ${fmt(ss-30)} to ${fmt(ss+10)}.`,cat:'fun',dis:!gAt(ss-50,ss+15),fn:()=>{pass(30);S.sunset[d]=true;S.stats.sunsets++;adj('mood',8);
      say(pick(['🌅 The sun drops behind the Olympics and the whole bay turns copper. Rainier goes pink, then blue, then gone.','🌅 Gold, orange, then a purple you don’t have a word for. Somebody on the next bench says “Every night,” like it’s a secret.']))}});
    if(!S.think[d]) a.push({ic:'💭',l:'Sit and think about school',s:'30 min. Nerves, mostly. It helps to look at something big. Mood +4.',cat:'here',fn:()=>{pass(30);S.think[d]=true;adj('mood',4);
      say(pick(['💭 What if you can’t open your locker? What if nobody talks to you? What if somebody does? A container ship the size of a building slides into the port, slow and sure. You breathe out.','💭 You make a list in your head: things you’re nervous about, things you’re excited about. The second list is longer than you expected.','💭 An older man on the bench, Deacon Harris, says he has watched a lot of first days from up here. “Everybody’s new once. Then they’re not.”']))}});
  }
  if(!(S.loc==='home'&&m>=1290)) a.push({ic:'⏳',l:'Wait a while…',s:'Skip ahead 30, 60 or 120 minutes.',cat:'rest',fn:()=>worldWait()});
  return a;
};
GROW.chores=[
  ['🧹','Help unpack the kitchen','🧹 Plates, cups and a whole box of mismatched forks. Dad hands you a dollar bill and three more for “a job well done.” Mom says the forks are a family heirloom. They are not.'],
  ['♻️','Take out the trash and the recycling','♻️ Down the stairs, past the mailboxes, to the bins in the alley. Ms. Lorraine on her porch across the way calls, “You must be the new family!” You are.'],
  ['🧺','Fold the laundry','🧺 Towels into thirds, the way Mom likes. Nia’s socks are the size of mittens. It takes forever and Dad pays you anyway.'],
  ['🪴','Water Mom’s porch plants','🪴 Eleven plants survived the move. Mom has names for all of them. You learn three.'],
  ['🍽️','Do the dishes','🍽️ You wash, Nia “dries,” which means she holds one plate for ten minutes. Clean kitchen. Mom ruffles your hair on her way past.'],
  ['📦','Break down the moving boxes','📦 Twenty flattened boxes, tied with string. You stand on each one like you’re winning a fight. You are.'],
  ['🛒','Carry the groceries up the stairs','🛒 Four bags, two trips, three flights. Dad calls you “the muscle.” You’ll take it.'],
];
GROW.dinners=['🍽️ Spaghetti night. Dad asks everybody for one good thing about today. Nia’s is “spaghetti.”','🍽️ Takeout teriyaki from MLK, eaten on moving boxes because the table legs are still in a bag somewhere. Best dinner of the summer.','🍽️ Mom’s chicken and rice, the first real dinner in the new kitchen. Everybody is quiet for a minute, the good kind of quiet.','🍽️ Tacos. Mom asks what you’re nervous about for school. You say “nothing.” She waits. You tell her. She gets it.','🍽️ Breakfast for dinner: pancakes and eggs at seven PM because Dad says rules are different the week you move.'];

GROW.statusTags=()=>{
  const t=[],d=day(),m=tod();
  t.push(gCh1()?`<span class="tag">🎒 ready ${gReady()}%</span>`:`<span class="tag">📚 grades ${gGrades()}</span>`);
  if(S.loc!=='home'&&m<gCurfew()) t.push(`<span class="tag ${m>=gCurfew()-45?'bad':''}">🏠 home by ${fmt(gCurfew())}</span>`);
  if(gRain()) t.push('<span class="tag">🌧️ rainy day</span>');
  if(S.energy<25) t.push('<span class="tag bad">🥱 tired</span>');
  if(S.mood<30) t.push('<span class="tag bad">😕 low mood</span>');
  if(d===gSat()&&!S.giveaway&&m<G_GIVE[1]) t.push('<span class="tag">🎒 giveaway at People’s 10–2</span>');
  if(d===gSchoolDay()&&!S.firstDay) t.push(`<span class="tag">🏫 first day · bell ${fmt(G_BELL)}</span>`);
  return t;
};
GROW.alertBar=()=>{
  const d=day(),m=tod();
  if(d===gSchoolDay()&&!S.firstDay) return {t:S.loc==='school'?'🔔 You made it. Tap Go in when you’re ready.':`🏫 First day of middle school! The bell rings at ${fmt(G_BELL)}. Summit View is ${travelMins(S.loc,'school')} min away.`,kind:m>G_BELL?'':'info'};
  if(S.loc!=='home'&&m>=gCurfew()-45&&m<gCurfew()) return {t:`🏠 Home by ${fmt(gCurfew())}. You’re ${travelMins(S.loc,'home')} minutes away.`};
  if(d===gSat()&&m<G_GIVE[1]&&!S.giveaway) return {t:'🎒 The back-to-school giveaway is at People’s today, 10 AM to 2 PM: free backpacks and supplies.',kind:'info'};
  if(d===gSchoolDay()-1&&gReady()<100) return {t:`🎒 School is tomorrow. Ready: ${gReady()}%. Check the To-do tab.`,kind:'info'};
  return null;
};

// ---- extra tabs: the week, and the kids you know ----
const G_TABS=[
  {k:'week',ic:'📅',l:'Week',view:()=>GROW.weekView()},
  {k:'kids',ic:'🤝',l:'Friends',view:()=>GROW.kidsView()},
];
GROW.weekView=()=>{
  const d0=day();
  return `<div class="sect">${lifeLong()&&!gCh1(lifeWeekDays()[0])?`This week · ${kwName(lifeKw())}`:'Your first week on Hilltop'}</div>`+lifeWeekDays().map(i=>{
    const s=[];
    if(i===0) s.push('📦 moving-in day');
    if(i<5&&gCh1(i)) s.push('🎨 summer rec program 10–2 · 📬 school office 9–3');
    if(i===gSat()) s.push(`💵 allowance day · 🎒 giveaway 10–2${S.giveaway?' (went)':''} · 🍖 barbecue across the street${S.bbq?' (went)':''}`);
    if(i===6) s.push('☀️ the last day of summer');
    if(i>gSchoolDay()&&isSchoolDay(i)) s.push(`🏫 school at ${gSchoolShort()}`);
    if(i===gSchoolDay()) s.push(`🏫 first day of middle school, bell ${fmt(G_BELL)}`);
    if(S.curfew[i]) s.push('⏰ missed curfew');
    return `<div class="todo"><span class="ck">${i<d0?'✔️':i===d0?'👉':'·'}</span><div><b>${gDate(i)}</b><span>${s.join(' · ')||'a summer day'}</span></div></div>`}).join('')
    +`<div class="rules">Home by ${fmt(gCurfew())} every night, or Family drops.</div>`+lifeWeekList();
};
GROW.kidsView=()=>{
  const met=KIDS.filter(k=>gMet(k.id)),b=gBest();
  const hearts=f=>'❤️'.repeat(Math.min(5,Math.floor(f/4)))+'🤍'.repeat(5-Math.min(5,Math.floor(f/4)));
  return `<div class="sect">Friends · ${gFriends()}/100</div><div class="rules">You know ${met.length} of ${KIDS.length} kids. Say hi, hang out once a day, and any of them can become your best friend.${b?` Right now, your closest friend is <b>${b.n}</b>.`:''}</div>`
    +met.map(k=>`<div class="todo"><span class="ck">${k.ic}</span><div><b>${k.n} ${hearts(gF(k.id))}</b><span>${k.d} (met ${gDate(S.kids[k.id].met-1)})</span></div></div>`).join('')
    +(met.length<KIDS.length?`<div class="todo"><span class="ck">·</span><div><b>${KIDS.length-met.length} more to meet</b><span>Try the courts at People’s, MLK, the Reading Room, the overlook, the school and your own street.</span></div></div>`:'');
};
