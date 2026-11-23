// ============================================================
//  TACOMPTON · LIFE IN TACOMA, part 1: school, deeper. Growing Up's longer games only (schOn() from 32-school.js).
//  Extends 32-school.js (the calendar, Go to school) and 30/31 (homework, Grades) rather than replacing them:
//  - Subjects: Math, English, Science, History, Art & PE (S.ls.subj, 0–100). A subject moving 5 moves the overall Grades 1;
//    at every report card the subjects lean toward the overall Grades, so the two always tell the same story.
//  - Homework asks which subject; office hours with a teacher after school; studying a subject at the Reading Room.
//  - Teachers with personalities at Summit View and Hilltop High, a counselor at each, and a coach who believes in you.
//  - Clubs and teams (basketball, robotics, band, art, drama, the school paper): practices on set days after school, and a season
//    moment once you've been to four (time skips count the meetings too).
//  - Getting to school: walk, the bus, or the Link up MLK (only once the T Line exists: eraHas('tline')). A route gets faster
//    after three trips.
//  - Report cards twice a year (late January, the last day of school): a good card earns a freedom, a bad one a talk at dinner.
//  - A high-school track at 15 (arts, sports, a career program, college prep), picked with the counselor (or picked for you by 16 in a
//    time skip, 17 in play) from your club, that changes the choice at 18.
//  State: S.ls, made on first use (old saves just work). Friends and family are in 68-life-friends.js.
// ============================================================

const LS_SUBJ=[['math','Math','➗'],['eng','English','📖'],['sci','Science','🔬'],['his','History','🏛️'],['art','Art & PE','🎨']];
const lsBlank=()=>({subj:{math:60,eng:60,sci:60,his:60,art:60},gfrac:0,tch:{},club:null,clubY:null,meet:{},cm:{},went:{},clubs:{},
  mode:'walk',trips:{},cards:{},free:{},track:null,coach:{},couns:{},beats:{},fam:{},bf:null,drift:{},back:{},over:{},trust:0,lastCard:null});
{const ns=GROW.newState;GROW.newState=()=>Object.assign(ns(),{ls:lsBlank()})}
function LS(){if(!S.ls){S.ls=lsBlank();const g=S.grades==null?60:S.grades;for(const [k] of LS_SUBJ)S.ls.subj[k]=g}
  const b=lsBlank();for(const k in b)if(S.ls[k]===undefined)S.ls[k]=b[k];return S.ls}
const lsOn=()=>typeof schOn==='function'&&schOn();
const lsSt=()=>stage(S.age||12)==='middle'?'middle':'high';
const lsSubjName=k=>(LS_SUBJ.find(x=>x[0]===k)||[k,k,'📚'])[1];
const lsSubjIc=k=>(LS_SUBJ.find(x=>x[0]===k)||[k,k,'📚'])[2];
const lsAvg=()=>{const s=LS().subj;return Math.round(LS_SUBJ.reduce((a,[k])=>a+s[k],0)/LS_SUBJ.length)};
const lsLetter=v=>v>=90?'A':v>=80?'B':v>=70?'C':v>=60?'D':'F';
// a subject up or down by n; the overall Grades follows by n/5 (fractions carried over)
function lsSubj(k,n,feed=true){const L=LS();L.subj[k]=clamp(Math.round(L.subj[k]+n),0,100);
  if(feed){L.gfrac+=n/5;const w=L.gfrac>0?Math.floor(L.gfrac):Math.ceil(L.gfrac);if(w){L.gfrac-=w;S.grades=clamp(gGrades()+w,0,100)}}}
// the subjects lean toward the overall Grades (other parts of the game move Grades directly)
function lsSync(){const L=LS(),g=gGrades(),dv=g-lsAvg();if(!dv)return;for(const [k] of LS_SUBJ)L.subj[k]=clamp(Math.round(L.subj[k]+dv*0.6),0,100)}

// ---- teachers: a few invented teachers at each school, each with a personality ----
const LS_TEACH={
  middle:{
    math:{n:'Ms. Delgado',p:'quick, funny and allergic to the word “guess”',l:['Ms. Delgado puts a problem on the board and waits, smiling, until somebody gets it. Today it’s you.','Ms. Delgado does fractions with a real pizza box. The pizza is imaginary. Everyone is upset about that.'],h:'Ms. Delgado walks you through the problem three ways until one of them clicks, then makes you explain it back.'},
    eng:{n:'Mr. Haugen',p:'reads out loud and does every voice',l:['Mr. Haugen reads the next chapter out loud and does the grandmother’s voice so well the room goes quiet.','Mr. Haugen hands back journals with one line of green ink in each. Yours says, “Keep going.”'],h:'Mr. Haugen reads your paragraph out loud to you. Hearing it, you find the two sentences that don’t belong.'},
    sci:{n:'Ms. Tran',p:'safety goggles on her head at all times, just in case',l:['Ms. Tran lets the lab get a little loud, “because that’s what science sounds like.”','Ms. Tran shows a picture of Mount Rainier and asks what it’s made of. The answer is mostly patience.'],h:'Ms. Tran draws the water cycle on a paper towel and gives it to you to keep.'},
    his:{n:'Mr. Whitebear',p:'brings old photos of Tacoma to every class',l:['Mr. Whitebear passes around a photo of K Street from 1950 and asks who recognizes the corner. Three kids do.','Mr. Whitebear tells the story of the Puyallup Tribe’s land under the city, and nobody looks at the clock.'],h:'Mr. Whitebear pulls out a shoebox of old maps and lets you find your own block on one from 1910.'},
    art:{n:'Coach Dawson',p:'PE teacher, whistle, never yells, always notices',l:['Coach Dawson runs the mile with the slowest group and talks the whole way.','In art, Ms. Fontaine hums while she walks the room and taps the one drawing she wants everybody to look at.'],h:'Coach Dawson shows you how to pace the mile: slow first lap, steady second, whatever you have left after that.'}},
  high:{
    math:{n:'Mr. Brandt',p:'strict, fair, and always in his room at lunch',l:['Mr. Brandt writes “Show your work” on the board for the four-hundredth time. He means it every time.','Mr. Brandt grades the quiz in front of you and circles one mistake, not the answer.'],h:'Mr. Brandt’s lunch office hours: a sandwich, a whiteboard and twenty minutes of “and then what?” until you see it.'},
    eng:{n:'Ms. Achebe',p:'green ink, big questions, no wrong answers said with confidence',l:['Ms. Achebe asks the class what the poem is “really” about and lets the silence go long enough that somebody brave answers.','Ms. Achebe’s essays come back covered in green ink. Somehow that feels like being taken seriously.'],h:'Ms. Achebe reads your essay with you, line by line, and asks “why?” until your argument stands up.'},
    sci:{n:'Dr. Liu',p:'deadpan, brilliant, keeps a cactus named Isaac',l:['Dr. Liu does the flame test, turns the lab green and says, “Anyway,” like nothing happened.','Dr. Liu explains moles with a bag of rice and absolute seriousness.'],h:'Dr. Liu works the chemistry problem backward with you. “Science is mostly checking,” he says.'},
    his:{n:'Mr. Castillo',p:'loves a debate, takes the other side on purpose',l:['Mr. Castillo splits the room for a debate about the railroad coming to Tacoma. It runs into lunch.','Mr. Castillo brings in his grandfather’s union card from the docks and passes it around carefully.'],h:'Mr. Castillo argues with your thesis until you can argue back. Then he says, “Good. Write that.”'},
    art:{n:'Coach Simmons',p:'runs PE and the basketball program, and believes in every kid in the gym',l:['Coach Simmons runs drills in PE and learns every name by the second week.','In art, Ms. Park pins one sketch from each student on the wall. Yours goes by the door.'],h:'Coach Simmons stays after PE to show you a stretch that fixes your bad knee. “You’ve got more in you than you think.”'}},
};
const LS_COUNS={middle:{n:'Ms. Reyes',d:'the Summit View counselor, with a bowl of mints and an office covered in college pennants'},high:{n:'Mr. Abernathy',d:'the Hilltop High counselor, who knows every program in Tacoma and how to get you into it'}};
const LS_COACH={middle:'Coach Dawson',high:'Coach Simmons'};
const lsTeach=k=>LS_TEACH[lsSt()][k];

// ---- clubs and teams: practice days (Mon=0 … Fri=4) after school, and a season moment after four meetings in a school year ----
const LS_CLUBS={
  hoops:{n:'Basketball',ic:'🏀',days:[0,2,3],kind:'practice',pals:['Deshawn','Kiana'],fx:{mood:3,energy:-10,friends:2},
    t:['Suicides, then layup lines, then a scrimmage where you finally hit the jumper you’ve been practicing.','Coach runs the press break until everyone can do it asleep. You can almost do it asleep.'],
    m:{h:'🏀 The home game',b:()=>lsSt()==='middle'?'Summit View against Truman in the little gym, the bleachers full of families, Nia with a sign again.':'Hilltop High against Lincoln, the gym packed to the rafters and the pep band playing every timeout.',
      c:[['🎯 Take the open shot when it comes',{mood:8,friends:3},'You take it. It goes in. The bench loses its mind, and Coach points at you from the sideline.'],['🤝 Make the extra pass',{mood:5,friends:5},'You find Kiana in the corner for the go-ahead three. In the locker room the team chants your name anyway.'],['🛡️ Lock down their best player',{mood:6,family:3},'Their best player scores two points in the second half. Dad tells everyone in the parking lot.']]}},
  robotics:{n:'Robotics club',ic:'🤖',days:[1,3],kind:'meeting',pals:['Priya','Mateo'],fx:{mood:2,grades:1,friends:2},
    t:['The arm finally lifts the cube. Then drops it. Then lifts it again, and everybody cheers like it’s the moon.','You rewire the drive motors twice and solder something correctly for the first time in your life.'],
    m:{h:'🤖 The regional competition',b:()=>'A gym at Mount Tahoma High full of robots, pit tables and kids in matching shirts. Your robot is named Big Dawg. It is not big.',
      c:[['🕹️ Drive in the final match',{mood:8,grades:2},'Your hands shake for the first ten seconds, then you forget anybody is watching. Third place, and a trophy shaped like a gear.'],['🔧 Fix the arm in the pit between rounds',{mood:5,grades:3,friends:2},'Four minutes, a zip tie and a lot of nerve. The judges write down your team number for the Spirit Award.'],['📣 Cheer the whole team on',{mood:6,friends:4},'You lose the semifinal and win the loudest-team award, which Priya says counts more.']]}},
  band:{n:'Band',ic:'🎺',days:[0,2,4],kind:'rehearsal',pals:['Jordan','Lupe'],fx:{mood:3,family:1,friends:2},
    t:['Sectionals: the trumpets against the clarinets, and for once you all land the same note.','The director stops you nine times on the same eight bars. The tenth time, it’s music.'],
    m:{h:'🎺 The Daffodil Parade',b:()=>'The band marches in the Daffodil Parade through downtown Tacoma, past the Pantages and up Pacific Ave, in matching jackets and wet shoes.',
      c:[['🎶 Play every note loud and proud',{mood:8,family:4},'Mom, Dad and Nia find a spot by the Spanish Steps. You can hear Nia over the drums.'],['🥁 Keep the line straight for the younger kids',{mood:5,friends:4},'Jordan says you were “basically the drum major.” The director says the same thing in fewer words.'],['📸 Wave at the crowd between songs',{mood:6,family:5},'A kid on her dad’s shoulders waves back the whole length of the block.']]}},
  art:{n:'Art club',ic:'🖌️',days:[1],kind:'meeting',pals:['Sione','Rae'],fx:{mood:4,grades:1,friends:2},
    t:['Charcoal day: everybody’s hands are black to the wrist and the drawings are the best they’ve been all year.','You paint the view from the art room window: the Narrows Bridge, gray on gray. It works.'],
    m:{h:'🖼️ The student art show',b:()=>'The student show at the Tacoma Public Library downtown. Your piece hangs at eye level with a little card that has your name on it.',
      c:[['🗣️ Talk to people who stop at your piece',{mood:7,friends:2},'A woman in a raincoat asks you three questions about it and says she’ll be back with her daughter.'],['👪 Walk your family through the whole show',{family:7,mood:5},'Grandma, on video, makes you hold the phone up to every single piece.'],['✏️ Sketch the room for your next piece',{mood:6,grades:1},'You fill four pages before they turn the lights off.']]}},
  drama:{n:'Drama club',ic:'🎭',days:[1,3],kind:'rehearsal',pals:['Imani','Theo'],fx:{mood:4,friends:3,energy:-4},
    t:['Blocking for act two: you finally know where to stand, and when to say the line that gets the laugh.','A warm-up game so silly that the custodian joins in.'],
    m:{h:'🎭 Opening night',b:()=>'Opening night of the spring play. The lights go down, somebody’s little brother says “It’s starting!” very loudly, and the curtain opens.',
      c:[['🌟 Nail your big scene',{mood:9,family:4},'You hit every line and the laugh lands right where it should. The curtain call takes a long time.'],['🎬 Save a scene when somebody forgets a line',{mood:6,friends:5},'Theo goes blank. You feed him the line in character and nobody in the audience knows.'],['🌹 Hand your family the program afterward',{family:7,mood:5},'Mom keeps the program in her purse for a year.']]}},
  paper:{n:'The school paper',ic:'📰',days:[2],kind:'meeting',pals:['Hana','Omar'],fx:{mood:2,grades:2,friends:2},
    t:['Layout night: you fight Omar for the front page and lose, gracefully.','You interview the lunch staff about the new menu. The story is better than the menu.'],
    m:{h:'📰 Your front-page story',b:()=>'The last issue of the year comes off the copier, and your story is on the front page.',
      c:[['🗞️ The story on the crosswalk at MLK',{grades:3,mood:6},'The city puts in a new signal at the corner in the spring. Your editor pins the article above the copier.'],['🎤 The story on the cafeteria workers',{family:2,mood:7,friends:3},'The lunch staff tape it to the window of the serving line.'],['🏀 The story on the girls’ team’s comeback',{friends:5,mood:6},'Kiana buys forty copies.']]}},
};
const lsSchoolY=d=>schY(d==null?day():d);
const lsClub=()=>{const L=LS();return L.club?LS_CLUBS[L.club]:null};   // a club carries on from year to year until you switch
const lsMeets=(d=day())=>{const c=lsClub();return !!c&&isSchoolDay(d)&&c.days.includes(dateOf(d).dow)};
const lsDayNames=a=>a.map(i=>['Mon','Tue','Wed','Thu','Fri'][i]).join(', ');
function lsJoin(k){const L=LS(),Y=lsSchoolY();L.club=k;L.clubY=Y;L.clubs[k]=(L.clubs[k]||0)+1;
  const c=LS_CLUBS[k];lifeMoment(c.ic,`Joined ${c.n.toLowerCase()} at ${gSchoolShort()}.`);
  say(`${c.ic} You sign up for <b>${c.n.toLowerCase()}</b>. ${cap(c.kind)}s are ${lsDayNames(c.days)} after school, until about 4:15. ${c.pals[0]} and ${c.pals[1]} show you where everything is.`)}
function lsClubsModal(){
  const L=LS(),cur=lsClub();
  modal('📋 Clubs and teams',`<p>The board outside the ${lsSt()==='middle'?'Summit View':'Hilltop High'} office: sign-up sheets, a few thumbtacks, one flyer that just says <b>ROBOTS?</b></p>
    <p>${cur?`You’re in <b>${cur.n.toLowerCase()}</b> this year.`:'You can be in one club or team at a time. Each meets on set days after school.'}</p>`,
    Object.entries(LS_CLUBS).map(([k,c])=>({l:`${c.ic} ${c.n}`,s:`${cap(c.kind)}s ${lsDayNames(c.days)}, 2:45–4:15. ${cur&&L.club===k?'You’re in.':`${c.pals.join(' and ')} are in it.`}`,dis:!!cur&&L.club===k,fn:()=>lsJoin(k)}))
    .concat([{l:'Not now',fn:()=>{}}]));
}
function lsMeet(){
  const L=LS(),c=lsClub(),d=day(),Y=lsSchoolY();pass(90);L.went[d]=true;L.meet[Y]=(L.meet[Y]||0)+1;
  schFx(c.fx);say(`${c.ic} ${pick(c.t)} ${c.pals[d%2]} walks out with you after. (${schFxTxt(c.fx)}.)`);
  if(L.meet[Y]>=4&&!L.cm[Y])lsSeason(c,Y);
}
function lsSeason(c,Y){const L=LS();L.cm[Y]=true;
  modal(c.m.h,`<p>${c.m.b()}</p>`,c.m.c.map(([l,e,t])=>schBtn({l,e,t:`${c.ic} ${t}`})),true);
  lifeMoment(c.ic,`${c.m.h.replace(/^\S+\s/,'')}, with ${c.n.toLowerCase()} at ${gSchoolShort()}.`)}

// ---- getting to school: walk, the bus or the Link; a route gets faster once you know it ----
const lsLinkOK=()=>typeof eraHas!=='function'||eraHas('tline');
const LS_MODES={walk:{ic:'🚶',n:'Walk',base:null,cut:3,learn:'You know every crack in the sidewalk now, and the stairs that skip a block.'},
  bus:{ic:'🚌',n:'The bus',base:10,cut:2,learn:'You know which door the driver opens first and where to stand so you’re off at the school stop before anyone.'},
  link:{ic:'🚋',n:'The Link',base:8,cut:2,learn:'You know which car stops right by the stairs up to school. Two minutes saved, every time.'}};
const lsModes=()=>Object.keys(LS_MODES).filter(k=>k!=='link'||lsLinkOK());
const lsMode=()=>{const m=LS().mode;return LS_MODES[m]&&(m!=='link'||lsLinkOK())?m:'walk'};
const lsKnown=m=>(LS().trips[m]||0)>=3;
{const tm=GROW.travelMins;GROW.travelMins=(a,b)=>{const m=tm(a,b);
  try{if(typeof S==='undefined'||!S||!S.ls||!lsOn()||!((a==='home'&&b==='school')||(a==='school'&&b==='home')))return m;
    const k=lsMode(),M=LS_MODES[k];let x=M.base==null?m:M.base;if(lsKnown(k))x-=M.cut;return Math.max(4,x)}catch(e){return m}}}
// Go to school counts a trip, and the day's class gets a teacher
{const sg=schGo;schGo=function(){const L=LS(),from=S.loc,k=lsMode(),d=day(),sk=LS_SUBJ[d%LS_SUBJ.length][0];
  // these lines come first: the school day's own line stays the last one
  try{if(from!=='school'){L.trips[k]=(L.trips[k]||0)+1;if(L.trips[k]===3)say(`${LS_MODES[k].ic} ${LS_MODES[k].learn} (${travelMins('home','school')} min now.)`)}
    say(`${lsSubjIc(sk)} ${lsSubjName(sk)}: ${pick(lsTeach(sk).l)}`)}catch(e){console.error(e)}
  const r=sg.apply(this,arguments);
  try{if(S.sch.went[d]==='ok')lsSubj(sk,2);lsCoachBeat()}catch(e){console.error(e)}
  return r}}
// a coach who believes in you: once in middle school and once in high school
function lsCoachBeat(){const L=LS(),st=lsSt();if(L.coach[st]||S.kwi<1)return;L.coach[st]=true;const n=LS_COACH[st],hoops=L.club==='hoops';
  modal(`🏅 ${n}`,`<p>After PE, ${n} waves you over to the bleachers. ${hoops?'“I watch you at practice. You’re the first one there and the last one to leave.”':'“I see you in this gym. You don’t quit on the mile, and you help the kid who’s behind.”'}</p><p>“I’ve been doing this a long time. You’ve got something. Whatever you pick to do, I’m in your corner.”</p>`,
    [schBtn({l:'🙏 Say thank you, and mean it',e:{mood:6},t:`🏅 ${n} nods. “Door’s always open.” You walk taller all afternoon.`}),
     schBtn({l:'💬 Tell them what’s been hard lately',e:{mood:8,family:2},t:`🏅 You talk for ten minutes. ${n} mostly listens, then says, “Okay. We’ll figure it out.” It helps more than you expected.`}),
     schBtn({l:'🏀 Ask what you should work on',e:{mood:5,grades:1},t:`🏅 “Show up. Ask questions. Be the same person when nobody’s watching.” You write it on the inside of your binder.`})],true);
  lifeMoment('🏅',`${n} told you they believe in you.`)}

// ---- homework and studying, per subject ----
function lsStudyModal(title,body,mins,each,after){
  modal(title,body,LS_SUBJ.map(([k,n,ic])=>({l:`${ic} ${n}`,s:`${lsTeach(k).n}. Now: ${LS().subj[k]} (${lsLetter(LS().subj[k])}). ${n} +${each}.`,fn:()=>after(k)})))}
{const ah=GROW.actionsHere;GROW.actionsHere=()=>{
  let a=ah();if(!lsOn())return a;const d=day(),m=tod(),L=LS(),out=[];
  a=a.map(x=>{if(x.l!=='Do your homework')return x;const f=x.fn;
    return Object.assign({},x,{s:'45 min at the kitchen table. Pick a subject: that subject +5, Grades +3, mood −1. Once a school day.',
      fn:()=>lsStudyModal('📚 Homework: which subject?','<p>The kitchen table, a snack, Nia “helping.” What are you working on tonight?</p>',45,5,k=>{f();lsSubj(k,5,false);say(`${lsSubjIc(k)} ${lsSubjName(k)} homework: ${pick(['done, and checked twice.','harder than it looked, then easier.','finished before dinner, a personal record.'])} ${lsSubjName(k)} ${L.subj[k]}.`)})})});
  if(S.loc==='school'&&isSchoolDay(d)&&d>gSchoolDay()){
    const after=m>=SCH_OUT&&m<1000;
    out.push({ic:'📋',l:'Look at the clubs and teams board',s:lsClub()?`You’re in ${lsClub().n.toLowerCase()} (${lsDayNames(lsClub().days)}).`:'Basketball, robotics, band, art, drama, the school paper.',cat:'term',fn:()=>lsClubsModal()});
    const c=lsClub();
    if(c&&lsMeets(d)&&!L.went[d])out.push({ic:c.ic,l:`Go to ${c.n.toLowerCase()} ${c.kind}`,s:after?`90 min after school. ${schFxTxt(c.fx)}. ${(L.meet[lsSchoolY()]||0)} of 4 before the big moment.`:'After the last bell, 2:45 to about 4:15.',cat:'term',cls:after?'primary':'',dis:!after,fn:()=>lsMeet()});
    if(after&&!L.tch[d])out.push({ic:'🍎',l:'Office hours with a teacher',s:'30 min after school. A subject of your choice +4.',cat:'term',fn:()=>lsStudyModal('🍎 Office hours','<p>Most teachers stay after the bell for anyone who knocks. Whose door?</p>',30,4,k=>{pass(30);L.tch[d]=k;lsSubj(k,4);say(`🍎 ${lsTeach(k).h} ${lsSubjName(k)} ${L.subj[k]}.`)})});
    const cn=LS_COUNS[lsSt()];
    if(m>=SCH_OUT&&m<1000&&L.couns[S.kwi]==null)out.push({ic:'🗂️',l:`See the counselor, ${cn.n}`,s:S.age>=15&&!L.track&&lsSt()==='high'?'20 min. Time to pick your track at Hilltop High.':'20 min. How you’re doing, class by class. Mood +2.',cat:'term',fn:()=>lsCounselor()});
  }
  if(S.loc==='library'&&isOpen('library')&&!L.tch['lib'+d])out.push({ic:'📖',l:'Study a subject at the Reading Room',s:'An hour at the big table. A subject of your choice +6, mood −1.',cat:'term',
    fn:()=>lsStudyModal('📖 Study at the Reading Room','<p>Ms. Okafor saves you the corner of the big table. What are you studying?</p>',60,6,k=>{pass(60);L.tch['lib'+d]=k;adj('mood',-1);lsSubj(k,6);say(`📖 An hour of ${lsSubjName(k).toLowerCase()} at the Reading Room. ${lsSubjName(k)} ${L.subj[k]}.`)})});
  if(S.loc==='home'&&lsModes().length>1&&gAt(360,1320)){const k=lsMode(),M=LS_MODES[k];
    out.push({ic:M.ic,l:`Getting to school: ${M.n.toLowerCase()}`,s:`${travelMins('home','school')} min${lsKnown(k)?' (you know this route)':` (${3-Math.min(3,LS().trips[k]||0)} more trips to learn it)`}. Tap to switch: ${lsModes().map(x=>LS_MODES[x].n.toLowerCase()).join(', ')}.`,cat:'here',
      fn:()=>{const ms=lsModes();L.mode=ms[(ms.indexOf(k)+1)%ms.length];const N=LS_MODES[L.mode];say(`${N.ic} From now on you get to school by ${N.n.toLowerCase()}: ${travelMins('home','school')} minutes.${L.mode==='bus'?' Your student bus pass is in your phone case.':L.mode==='link'?' The T Line stop on MLK is right at the corner.':''}`)}});}
  return out.concat(a);
}}
function lsCounselor(){const L=LS(),cn=LS_COUNS[lsSt()];pass(20);L.couns[S.kwi]=day();
  if(S.age>=15&&!L.track&&lsSt()==='high')return lsTrackModal();
  adj('mood',2);const s=L.subj,best=LS_SUBJ.slice().sort((a,b)=>s[b[0]]-s[a[0]]),hi=best[0],lo=best[best.length-1];
  modal(`🗂️ ${cn.n}`,`<p>${cn.n}, ${cn.d}, pulls up your classes.</p>${lsSubjRows()}<p>“${lsSubjName(hi[0])} is your strong one. ${s[lo[0]]<70?`${lsSubjName(lo[0])} could use some office hours with ${lsTeach(lo[0]).n}.`:'Nothing to worry about here. Keep doing what you’re doing.'}”</p>`,[{l:'Thanks',fn:()=>{}}])}
const lsSubjRows=()=>LS_SUBJ.map(([k,n,ic])=>`<div class="kv"><span>${ic} ${n} · ${lsTeach(k).n}</span><b>${LS().subj[k]} (${lsLetter(LS().subj[k])})</b></div>`).join('');

// ---- report cards: late January and the last day of school ----
function lsCardDays(Y){const c=schCal(lifeStartDate(),Y);let j=dayIndexOf(Y+1,1,28);let g=0;while(!isSchoolDay(j)&&g++<14)j++;return [[Y+'-1',j,'winter'],[Y+'-2',c.last,'spring']]}
function lsCardsIn(from,to){const out=[],L=LS();for(const Y of [schY(from)-1,schY(from),schY(to)])for(const [k,d,t] of lsCardDays(Y))if(d>=from&&d<=to&&!L.cards[k]&&!out.some(x=>x.k===k))out.push({k,d,t});return out.sort((a,b)=>a.d-b.d)}
const LS_FREE=[
  {k:'curfew',ic:'🌙',n:'A later curfew',s:'Home 30 minutes later every night.'},
  {k:'downtown',ic:'🚋',n:'Going downtown on your own',s:'Downtown & the Dome District opens to you before 14.',ok:()=>S.age<14},
  {k:'weekend',ic:'🎉',n:'A later weekend curfew',s:'Another 30 minutes on Friday and Saturday nights.'},
];
function lsFree(k){return !!(typeof S!=='undefined'&&S&&S.ls&&S.ls.free&&S.ls.free[k])}
function lsCurfewPlus(){if(typeof S==='undefined'||!S||!S.ls||!S.ls.free||!isGrow())return 0;let x=lsFree('curfew')?30:0;
  if(lsFree('weekend'))try{const w=dateOf(day()).dow;if(w===4||w===5)x+=30}catch(e){}return x}
function lsEarnFree(){const L=LS(),f=LS_FREE.find(x=>!L.free[x.k]&&(!x.ok||x.ok()));if(!f)return null;L.free[f.k]=day()+1;lifeMoment(f.ic,`Earned a new freedom: ${f.n.toLowerCase()}.`);return f}
// grade the term; returns {avg, kind, fx text}; played=true opens the card (and a talk at dinner after a bad one)
function lsCard(x,played,notes){
  const L=LS();L.cards[x.k]=day()+1;lsSync();const avg=lsAvg(),kind=avg>=82?'good':avg<60?'bad':'ok',term=x.t==='winter'?'winter':'end-of-year';
  L.lastCard={k:x.k,avg,kind};
  const fam=kind==='good'?6:kind==='bad'?-5:2;adj('family',fam);
  const f=kind==='good'?lsEarnFree():null;
  const rows=LS_SUBJ.map(([k,n,ic])=>`${ic} ${n} ${lsLetter(L.subj[k])}`).join(' · ');
  const line=kind==='good'?`Mom sticks it on the fridge with the good magnet. Family +${fam}.${f?` ${f.ic} You earned <b>${f.n.toLowerCase()}</b>: ${f.s}`:''}`
    :kind==='bad'?`Dad reads it twice and folds it into his pocket. “We’ll talk at dinner.” Family −${-fam}.`:`“Solid,” Dad says, and means it. Family +${fam}.`;
  if(!played){notes.push(`📄 The ${term} report card: ${rows}. ${line.replace(' “We’ll talk at dinner.”',' A long talk at dinner follows.')}`);if(kind==='bad')lsTalk(false);return}
  modal(`📄 The ${term} report card`,`<p>${gSchool()}, ${dateOf(day()).label}.</p>${lsSubjRows()}<p>${line}</p>`,[{l:kind==='bad'?'Dinner, then':'Nice',fn:()=>{if(kind==='bad')lsTalk(true)}}],true);
  lifeMoment('📄',`The ${term} report card: ${rows}.`);
}
function lsTalk(played){const L=LS(),lo=LS_SUBJ.slice().sort((a,b)=>L.subj[a[0]]-L.subj[b[0]])[0][0];
  if(!played){lsSubj(lo,4);adj('family',2);return}
  modal('🍽️ A talk at dinner',`<p>Spaghetti, nobody reaching for seconds. Dad puts the report card on the table, face up. Mom says, “We’re not mad. We want to know what’s going on.” Nia suddenly finds her plate very interesting.</p>`,
    [schBtn({l:'🙋 Own it, and make a plan',e:{family:5,mood:2},t:()=>{lsSubj(lo,5);return `🙋 Homework before the phone, office hours with ${lsTeach(lo).n} once a week. Dad writes it on the fridge. ${lsSubjName(lo)} +5.`}}),
     schBtn({l:'🧑‍🏫 Ask for a tutor at the Reading Room',e:{family:3},t:()=>{lsSubj(lo,4);return `🧑‍🏫 Ms. Okafor knows a retired teacher who tutors on Tuesdays, free. ${lsSubjName(lo)} +4.`}}),
     schBtn({l:'🙄 Say the teachers are unfair',e:{family:-4,mood:-2},t:'🙄 Mom just looks at you until you look away. Dinner is quiet after that.'})],true)}
// played days: the card comes out in the morning
{const om=onMorning;onMorning=function(d){om(d);try{if(isGrow()&&d>0&&lsOn()&&S.ls)for(const x of lsCardsIn(d,d))lsCard(x,true)}catch(e){console.error(e)}}}

// ---- a high-school track at 15 ----
const LS_TRACK={
  arts:{ic:'🎭',n:'The arts track',s:'Art, music, theater, a portfolio by senior year. At 18: Community +10 and a portfolio for any path.'},
  sports:{ic:'🏀',n:'The sports track',s:'PE leadership, a team every season, Coach Simmons’s reference letter. At 18: job standing +5, Community +6.'},
  career:{ic:'🔧',n:'A career program at Bates Technical College',s:'Half days at Bates downtown from eleventh grade. At 18: the trade program starts a quarter done; a job starts with standing +8.'},
  prep:{ic:'🎓',n:'College prep',s:'AP classes, Running Start, the SAT. At 18: a $1,500 scholarship for UW Tacoma, and standing +3 on any path.'},
};
function lsSetTrack(k){const L=LS();L.track=k;const T=LS_TRACK[k];lifeMoment(T.ic,`Picked a track at Hilltop High: ${T.n.toLowerCase()}.`);
  if(k==='prep')lsSubj('eng',2);else if(k==='career')lsSubj('math',2);else if(k==='arts'||k==='sports')lsSubj('art',3)}
function lsTrackModal(){const cn=LS_COUNS.high;
  modal('🧭 Your track at Hilltop High',`<p>${cn.n} spreads four folders on the desk. “By eleventh grade, most kids pick a track. It changes your classes, and it changes your options after graduation. None of them closes a door for good.”</p>`,
    Object.entries(LS_TRACK).map(([k,t])=>({l:`${t.ic} ${t.n}`,s:t.s,fn:()=>{lsSetTrack(k);say(`${t.ic} ${t.n}: ${cn.n} signs the form and shakes your hand. Mom and Dad sign it at dinner.`)}})),true)}
LIFE_HOOKS.weekStart.push(kw=>{try{if(!isGrow()||!lsOn()||kw.kind==='graduation')return;LS();lsSync();
  if(S.age>=15&&lsSt()==='high'&&!S.ls.track){
    if(S.age>=17){const k=lsAutoTrack();lsSetTrack(k);say(`${LS_TRACK[k].ic} ${LS_COUNS.high.n} signed you up for ${LS_TRACK[k].n.toLowerCase()}, the one that fits what you already do.`)}
    else say(`🧭 ${LS_COUNS.high.n} wants to see you after school this week: it’s time to pick your track at Hilltop High. (🗂️ See the counselor, at school after the last bell.)`)}}catch(e){console.error(e)}});
const lsAutoTrack=()=>{const c=LS().club;return c==='hoops'?'sports':['art','band','drama'].includes(c)?'arts':c==='robotics'?'career':'prep'};
// at 18 the track shows on the choice, and pays off after it
const lsTrackLine=(path,k)=>({prep:{college:'🎓 Your college-prep track: a $1,500 scholarship.'},career:{trade:'🔧 Your career program: a quarter of the program already done.',job:'🔧 Your career program: job standing +8.'},
  sports:{job:'🏀 Your sports track: Coach Simmons’s reference letter.'},arts:{}})[k][path]||'';
{const lp=lifePathSheet;lifePathSheet=function(next){const k=S&&S.ls&&S.ls.track;if(!k)return lp(next);
  const ms=modalSwap;let cap=null;modalSwap=(...a)=>{cap=a};try{lp(next)}finally{modalSwap=ms}if(!cap)return;
  const T=LS_TRACK[k],paths=['job','college','trade'];
  const btns=cap[2].map((b,i)=>{const p=paths[i],x=p?lsTrackLine(p,k):'';return x?Object.assign({},b,{s:`${b.s} ${x}`,cls:'primary'}):b});
  modalSwap(cap[0],cap[1]+`<p>${T.ic} <b>${T.n}</b> at Hilltop High: ${T.s.replace(/^.*?At 18: /,'at 18, ')}</p>`,btns,cap[3])}}
{const lh=lifeHandoff;lifeHandoff=function(path,jk,next){const k=S&&S.ls&&S.ls.track;const r=lh.apply(this,arguments);
  try{if(!k)return r;const st=v=>{S.standing=clamp(S.standing+v,0,100)},cm=v=>{S.community=clamp(S.community+v,0,100)};let t='';
    if(k==='prep'){st(3);if(path==='college'){money(1500);t='🎓 A $1,500 scholarship from the Hilltop High PTSA, for UW Tacoma.'}}
    else if(k==='career'){if(path==='trade'){S.life.prog=Math.max(S.life.prog||0,25);t='🔧 Your Bates credits count: the trade program starts a quarter done.'}else if(path==='job'){st(8);t='🔧 Your career program shows on your application: standing +8.'}}
    else if(k==='sports'){st(5);cm(6);t='🏀 Coach Simmons’s letter, and a whole team that still texts: standing +5, Community +6.'}
    else if(k==='arts'){cm(10);t='🎭 Your portfolio and the people from every show: Community +10.'}
    S.life.trackBonus={k,path,t};if(t)say(t)}catch(e){console.error(e)}   // no life moment here: the graduation moment stays the last one (38-paths.js reads it)
  return r}}

// ---- time skips: subjects, club meetings and season moments, report cards, the track ----
LIFE_HOOKS.skip.push((from,to,ch,notes)=>{
  if(!isGrow()||!S.ls)return;const L=LS();
  if(ch==='study')for(const [k] of LS_SUBJ)lsSubj(k,3,false);
  // club meetings: the club stays on from year to year unless you switch
  let n=0;for(let d=from;d<=to;d++){const Y=schY(d),c=L.club?LS_CLUBS[L.club]:null;if(!c||!isSchoolDay(d)||!c.days.includes(dateOf(d).dow))continue;
    n++;L.meet[Y]=(L.meet[Y]||0)+1;if(L.meet[Y]>=4&&!L.cm[Y]){L.cm[Y]=true;const o=c.m.c[0];schFx(o[1]);notes.push(`${c.ic} ${c.m.h.replace(/^\S+\s/,'')}: ${o[2]}`);lifeMoment(c.ic,`${c.m.h.replace(/^\S+\s/,'')}, with ${c.n.toLowerCase()}.`)}}
  if(n&&L.club)notes.push(`${LS_CLUBS[L.club].ic} ${n} ${LS_CLUBS[L.club].kind}s with ${LS_CLUBS[L.club].n.toLowerCase()}.`);
  for(const x of lsCardsIn(from,to))lsCard(x,false,notes);
  if(S.age>=16&&!L.track&&S.age<18){const k=lsAutoTrack();lsSetTrack(k);
    notes.push(`${LS_TRACK[k].ic} With ${LS_COUNS.high.n}, you picked ${LS_TRACK[k].n.toLowerCase()}.`)}
});

// ---- the Week tab: your classes, your club, the way to school, report cards, freedoms, the track ----
{const wv=GROW.weekView;GROW.weekView=()=>{const h=wv();if(!lsOn()||!S.ls)return h;const L=LS(),c=lsClub(),k=lsMode();
  const fr=LS_FREE.filter(f=>L.free[f.k]);
  return h+`<div class="sect">Your classes at ${gSchoolShort()}</div>${lsSubjRows()}`
    +`<div class="rules">${c?`${c.ic} ${c.n}: ${lsDayNames(c.days)} after school (${L.meet[lsSchoolY()]||0} this year). `:'📋 No club or team yet: the board is at school. '}`
    +`${LS_MODES[k].ic} To school by ${LS_MODES[k].n.toLowerCase()}, ${travelMins('home','school')} min${lsKnown(k)?', a route you know':''}. `
    +`${L.lastCard?`📄 Last report card: ${L.lastCard.avg} (${lsLetter(L.lastCard.avg)}). `:'📄 Report cards come home in late January and on the last day. '}`
    +`${fr.length?`🔓 Freedoms: ${fr.map(f=>f.n.toLowerCase()).join(', ')}. `:'🔓 A good report card earns a freedom. '}`
    +`${L.track?`${LS_TRACK[L.track].ic} ${LS_TRACK[L.track].n}.`:S.age>=14?'🧭 You pick a track at 15.':''}</div>`}}
window.lsAvg=lsAvg;window.lsCard=lsCard;window.lsCardsIn=lsCardsIn;window.LS_CLUBS=LS_CLUBS;window.LS_TRACK=LS_TRACK;
