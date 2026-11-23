// ============================================================
//  TACOMPTON · ADULT RELATIONSHIPS (the 18+ mode). Optional, off by default.
//
//  The rules this file keeps (tests/relationships.test.js checks them):
//   · Everyone you can date is an adult (21–45, or a Growing Up friend once BOTH of you are 18+), with the age on the profile.
//   · Nothing here ever runs in Growing Up, for a character under 18, or with the mode off: every action, event, tab
//     and line goes through relActive().
//   · Nothing explicit: intimacy is one non-graphic sentence and a fade to black. No slurs or degrading labels.
//   · Consent is part of the game: anyone can say no, the game takes it gracefully, and there is never a pressure option.
//
//  The mode: a one-time age check on this device (prefs.age18), then prefs.adult18 turns it on for new adult games.
//  In a game: ⚙️ Settings → 🎮 Game options → 🔞 18+ mode. Under 18 it waits for 18 (S.rel.auto18) , starts a new adult save, or skips to 18 (38-skip18.js) and turns on.
//  Turning it off hides everything; relationships pause, they don't end. S.rel holds it all, with a log of every switch.
//
//  Wraps (from here, nothing else edited): baseState, onNewGame, onMorning, onNight, actionsHere, render, allTabs,
//  gameOptionsModal, titleScreen, endScreen, lifeSummaryHTML; LIFE_HOOKS weekStart / skip / birthday.
// ============================================================

// ---- the people (all invented; all adults) ----
// g: 'm' | 'w' | 'nb' (who shows up for "Interested in"); tone: how each way of flirting lands with them (−1 to 2);
// wants: 'serious' | 'casual' | 'either'; spots: where you might meet them ('link','dome','market','party','work','app')
const REL_PEOPLE=[
  {id:'jordan',n:'Jordan Reyes',ic:'🚲',age:27,g:'m',pn:'he/him',job:'Bike mechanic at a shop in the Stadium District',hood:'Hilltop',likes:['music','outdoors','food'],tone:{playful:2,sincere:1,bold:0},wants:'either',spots:['link','party','app'],
    d:'Fixes bikes for half of Tacoma and rides one up the steepest hill on purpose. Knows every taco truck by its first name, and laughs with his whole face.'},
  {id:'amara',n:'Amara Okafor',ic:'🩺',age:31,g:'w',pn:'she/her',job:'Pediatric nurse at a children’s hospital downtown',hood:'Stadium District',likes:['books','art','food'],tone:{playful:0,sincere:2,bold:1},wants:'serious',spots:['work','market','app'],
    d:'Keeps small patients brave through twelve-hour shifts, then reads mysteries under the trees in Wright Park to come down. The oldest of five, and her jollof rice starts friendly arguments.'},
  {id:'sione',n:'Sione Faleolo',ic:'🏗️',age:29,g:'m',pn:'he/him',job:'Longshore worker at the Port of Tacoma',hood:'Eastside',likes:['sports','food','music'],tone:{playful:1,sincere:2,bold:0},wants:'serious',spots:['dome','party','app'],
    d:'Works the cranes on the tideflats and sings bass in his church choir on Sundays. Coaches his nephews’ flag football team, loudly and with snacks.'},
  {id:'mei',n:'Mei Tanaka',ic:'🫙',age:34,g:'w',pn:'she/her',job:'Glassblower at a hot shop by the Museum of Glass',hood:'Downtown',likes:['art','outdoors','movies'],tone:{playful:1,sincere:0,bold:2},wants:'either',spots:['market','dome','app'],
    d:'Turns sand and fire into bowls that catch the light all week, and kayaks the Narrows on weekends. Direct, funny, and allergic to small talk.'},
  {id:'dani',n:'Dani Morales',ic:'🎚️',age:25,g:'nb',pn:'they/them',job:'Sound tech for shows at the Tacoma Dome',hood:'South End',likes:['music','games','movies'],tone:{playful:2,sincere:0,bold:1},wants:'casual',spots:['dome','party','link','app'],
    d:'Runs the sound board for touring bands and a karaoke night at a South End noodle shop. Has opinions about every speaker in Tacoma and a board-game shelf that takes up a whole wall.'},
  {id:'rashad',n:'Rashad Greene',ic:'📖',age:38,g:'m',pn:'he/him',job:'High school history teacher',hood:'Fern Hill',likes:['books','food','outdoors'],tone:{playful:0,sincere:2,bold:0},wants:'serious',spots:['market','link','app'],
    d:'Teaches tenth-grade history so it sounds like neighborhood news. Divorced and on good terms, a weekend uncle to his sister’s twins, and honest that his brisket needs work.'},
  {id:'leilani',n:'Leilani Kahale',ic:'🐙',age:30,g:'w',pn:'she/her',job:'Aquarist at the Point Defiance aquarium',hood:'Ruston',likes:['outdoors','books','games'],tone:{playful:1,sincere:1,bold:1},wants:'either',spots:['link','market','app'],
    d:'Takes care of the giant Pacific octopus and swears it knows her. Walks Owen Beach most mornings and plays a mean game of cribbage.'},
  {id:'theo',n:'Theo Brennan',ic:'💿',age:42,g:'m',pn:'he/him',job:'Owns a used-record shop in Proctor',hood:'North End',likes:['music','movies','books'],tone:{playful:2,sincere:1,bold:-1},wants:'serious',spots:['market','dome','app'],
    d:'Runs a tiny record shop with a cat named Coltrane and a listening chair that is not for sale. Widowed a few years ago, and ready, he says, to laugh over dinner again.'},
  {id:'yesenia',n:'Yesenia Cruz',ic:'🥐',age:36,g:'w',pn:'she/her',job:'Runs her family’s panadería on South 38th',hood:'South End',likes:['food','music','sports'],tone:{playful:1,sincere:2,bold:1},wants:'serious',spots:['market','party','work','app'],
    d:'Up at four to bake conchas, dances salsa on Thursdays, cheers for the Mariners on principle, and remembers everyone’s order.'},
  {id:'kai',n:'Kai Nakamura',ic:'🗺️',age:23,g:'m',pn:'he/him',job:'Urban planning grad student at UW Tacoma',hood:'Downtown',likes:['games','books','outdoors'],tone:{playful:2,sincere:1,bold:0},wants:'either',spots:['link','work','app'],
    d:'Studies how cities move, which is why he can talk about the T Line for an hour. Hosts a trivia night, and keeps a houseplant named Gerald alive against the odds.'},
  {id:'nadia',n:'Nadia Haddad',ic:'🏛️',age:45,g:'w',pn:'she/her',job:'Architect who restores old houses',hood:'North End',likes:['art','outdoors','movies'],tone:{playful:0,sincere:1,bold:2},wants:'either',spots:['dome','market','app'],
    d:'Brings old North End houses back one porch at a time. Grew up in Dearborn, moved west for the mountains, and still hikes something every weekend.'},
  {id:'sam',n:'Sam Whitfield',ic:'🚒',age:33,g:'w',pn:'she/her',job:'Firefighter at a West End station',hood:'West End',likes:['sports','outdoors','food'],tone:{playful:2,sincere:1,bold:1},wants:'casual',spots:['link','party','work','app'],
    d:'Works twenty-four-hour shifts and cooks for the whole crew. Swims in the Sound all year and will try to talk you into it.'},
];
// Friends from Growing Up, as the adults they become. They are your classmates, so their age is your age, and they can only
// be in the pool when you are BOTH 18 or older (relEligible), in an adult save, with the mode on, and only if you met them.
const REL_GROWN={
  marcus:{ic:'🏀',g:'m',pn:'he/him',job:'Coaches youth hoops at People’s and studies kinesiology',likes:['sports','music','food'],tone:{playful:2,sincere:1,bold:0},wants:'either',spots:['party','link'],
    d:'The kid who practiced free throws until the streetlights came on is still on the far court, now teaching ten-year-olds the same jump shot. Still talks trash, still nicely.'},
  ana:{ic:'🎨',g:'w',pn:'she/her',job:'Art student and a muralist’s apprentice',likes:['art','books','movies'],tone:{playful:1,sincere:2,bold:0},wants:'serious',spots:['market','party'],
    d:'Still carries a sketchbook everywhere. Her first mural went up on MLK last spring, two blocks from the curb where you used to draw the Link together.'},
  tavita:{ic:'🎸',g:'m',pn:'he/him',job:'Plays in a band and works at a music shop',likes:['music','food','games'],tone:{playful:2,sincere:1,bold:1},wants:'either',spots:['party','dome'],
    d:'The ukulele turned into a band that plays the Hilltop Street Fair every August. His family across the street still claps from the window.'},
  linh:{ic:'🤖',g:'w',pn:'she/her',job:'Engineering student at UW Tacoma',likes:['books','games','outdoors'],tone:{playful:1,sincere:1,bold:1},wants:'either',spots:['link','market'],
    d:'The cereal-box robot grew up too: she builds rovers for a university team now, and still argues about the endings of books she hasn’t finished.'},
  zay:{ic:'🛹',g:'m',pn:'he/him',job:'Works at a skate shop on the Eastside',likes:['outdoors','sports','music'],tone:{playful:2,sincere:0,bold:1},wants:'casual',spots:['link','party'],
    d:'Still knows every shortcut on Hilltop, still names the cranes in the bay. Runs the free skate clinic on Saturdays.'},
};
const REL_LIKES={music:'🎶 music',art:'🎨 art',outdoors:'🥾 the outdoors',books:'📚 books',food:'🍳 food',sports:'🏀 sports',movies:'🎬 movies',games:'🎲 games'};
const REL_VIBES={shows:{l:'🎶 Shows and records',likes:['music','movies']},trails:{l:'🥾 Trails and the water',likes:['outdoors','sports']},books:{l:'📚 Books and museums',likes:['books','art']},food:{l:'🍳 Cooking and taco trucks',likes:['food','games']}};
const REL_STAGE={met:'Just met',talking:'Talking',dating:'Dating',casual:'Keeping it casual',exclusive:'Exclusive',engaged:'Engaged',married:'Married',partners:'Partners for life',friends:'Friends',ex:'Ex',passed:'Not a match'};
const REL_TOGETHER=['exclusive','engaged','married','partners'];

// ---- the save ----
function relBlank(){return {on:false,auto18:false,log:[],people:{},partner:null,me:null,app:{wk:-1,matches:[]},livein:false,split:0,
  engaged:-1,married:null,kids:0,kidsPlan:-1,sadUntil:-1,cheat:null,scare:null,careful:false,ld:-1,raise:false,morning:[],pm:{},plans:{},day:{},texted:{},chores:{},liveinD:-1}}
{const bs=baseState;baseState=function(){const x=bs();x.rel=relBlank();return x}}   // old saves get S.rel through fillDefaults (06-save.js)
const relS=()=>S.rel||(S.rel=relBlank());

// ---- the gate ----
const relAgeOK=()=>!!prefs().age18;          // this device's one-time "18 or older" check
const relPrefOn=()=>!!prefs().adult18;       // new adult games start with the mode on
function relActive(){return typeof S!=='undefined'&&!!S&&!!S.rel&&S.rel.on===true&&!isGrow()&&(S.age==null?18:S.age)>=18&&relAgeOK()}
function relLog(to,why){relS().log.push({d:S.cur||0,age:S.age,to,why:why||''});if(S.rel.log.length>40)S.rel.log.splice(1,1)}
function relSetOn(on,why){const R=relS();if(R.on===on)return;R.on=on;relLog(on?'on':'off',why);
  if(!on){R.auto18=false;if(S.ev&&S.ev.pending)S.ev.pending=S.ev.pending.filter(p=>!/^rel_/.test(p.id));if(tab==='rel')tab='act'}}
function relGrown(id){return !!REL_GROWN[id]}
function relKidKnown(id){if(!S)return false;const k=typeof KIDS!=='undefined'?KIDS.find(x=>x.id===id):null;if(!k)return false;
  if(S.kids&&S.kids[id]&&S.kids[id].met)return true;return !!(S.life&&S.life.grow&&(S.life.grow.kids||[]).some(x=>x.n===k.n))}
// a person's age now: classmates are your age; everyone else ages along with you from when you met
function relAge(id){if(relGrown(id))return S.age;const p=REL_PEOPLE.find(x=>x.id===id),st=S.rel&&S.rel.people[id];return p?p.age+(st?Math.max(0,S.age-st.metAge):0):0}
function relDef(id){
  if(relGrown(id)){const k=(typeof KIDS!=='undefined'?KIDS.find(x=>x.id===id):null)||{n:id};return Object.assign({id,n:k.n,hood:'Hilltop',grown:true},REL_GROWN[id])}
  return REL_PEOPLE.find(x=>x.id===id)||null}
function relWants(g){const w=(relS().me&&S.rel.me.into)||'everyone';return w==='everyone'||(w==='men'&&g==='m')||(w==='women'&&g==='w')}
// can this person be in the dating pool right now? Both of you 18+, the mode on, an adult save
function relEligible(id){
  if(!relActive()||S.age<18)return false;const p=relDef(id);if(!p)return false;
  if(relAge(id)<18)return false;
  if(p.grown&&!relKidKnown(id))return false;
  return relWants(p.g);
}
const relIds=()=>REL_PEOPLE.map(p=>p.id).concat(Object.keys(REL_GROWN));
function relPool(spot){return relIds().filter(id=>!relS().people[id]&&relEligible(id)&&relDef(id).spots.includes(spot))}
const relSt=id=>relS().people[id]||null;
const relN=id=>(relDef(id)||{n:id}).n.split(' ')[0];
const relPartner=()=>{const p=relS().partner;return p&&S.rel.people[p]&&REL_TOGETHER.includes(S.rel.people[p].stage)?p:null};
const relRnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const relShared=id=>{const me=(relS().me&&S.rel.me.likes)||[];return relDef(id).likes.filter(x=>me.includes(x))};
function relProfile(id,opt={}){
  const p=relDef(id),sh=relShared(id);
  const ln='<span style="display:block;margin-top:2px">';
  return `<div class="todo rel-card" data-rel="${id}"><span class="ck">${p.ic}</span><div><b>${esc(p.n)}, ${relAge(id)}</b>${ln}${p.pn} · ${p.job} · ${p.hood}</span>${ln}${p.d}</span>${ln}Into: ${p.likes.map(k=>REL_LIKES[k]).join(', ')}${sh.length?` · <i>you both like ${sh.map(k=>REL_LIKES[k].replace(/^\S+\s/,'')).join(' and ')}</i>`:''}</span>${opt.extra?opt.extra.replace(/<span>/g,ln):''}</div></div>`;
}
function relMeters(id){const st=relSt(id);if(!st)return '';
  return `<div class="kv"><span>💘 Interest</span><b>${Math.round(st.int)}</b></div>${meter(st.int,true)}<div class="kv"><span>✨ Chemistry</span><b>${Math.round(st.chem)}</b></div>${meter(st.chem,true)}`}
const relBump=(id,k,v)=>{const st=relSt(id);if(st)st[k]=clamp(Math.round(st[k]+v),0,100)};

// ---- meeting someone ----
function relMeet(id,where){
  const R=relS(),p=relDef(id),sh=relShared(id).length;
  const chem=clamp(20+sh*14+relRnd(0,22),0,100),int=clamp(12+Math.round(chem/3)+relRnd(0,12),0,100);
  R.people[id]={met:day(),metAge:S.age,where,int,chem,stage:'met',dates:0,no:0,noUntil:-1,nights:0,excl:-1};
  const spark=chem+int+relRnd(0,30)>72;
  if(spark)R.people[id].stage='talking';
  return spark;
}
function relMeetLine(id,spark){const n=relN(id);
  return spark?pick([`✨ You and ${n} get talking and don’t stop until someone has to go. ${n} puts a number in your phone, “in case you want to get tacos.”`,`✨ ${n} laughs at your joke, then makes a better one. You trade numbers before the moment can get awkward.`])
    :pick([`🙂 ${n} smiles, friendly and polite, and goes back to what they were doing. Not every spark catches. That’s okay.`,`🙂 A nice chat with ${n}, and that’s all it is. You both say “good to meet you” and mean it.`])}
// a meeting event: someone at this spot; the person is picked when it fires (kept in S.rel.pm, so a reload rebuilds the same choice)
function relMeetEvent(id,spot,cond,tile,intro){
  defEvent({id,hook:'arrive',tile,chance:0.3,cooldown:2,max:6,priority:1,
    cond:c=>relActive()&&cond(c)&&relPool(spot).length>0,
    run:()=>{const who=pick(relPool(spot));relS().pm[id]=who;const p=relDef(who);
      say(`${p.ic} ${intro(relN(who))} <span class="rel-age">(${relN(who)}, ${relAge(who)}: ${p.job.toLowerCase()})</span>`)},
    choices:()=>{const who=relS().pm[id];if(!who||!relDef(who))return [];const n=relN(who);return [
      {ic:'👋',l:`Say hi to ${n}`,s:'10 min. You might hit it off, or not.',fn:()=>{if(!relActive()||relSt(who))return;pass(10);const sp=relMeet(who,spot);say(relMeetLine(who,sp));if(sp)adj('stress',-3)}},
      {ic:'🙂',l:'Just smile',s:'Leave it up to them.',fn:()=>{if(!relActive()||relSt(who))return;if(Math.random()<0.35){pass(10);const sp=relMeet(who,spot);say(`🙂 ${n} smiles back, then comes over. `+relMeetLine(who,sp))}else say(`🙂 ${n} smiles back. That’s all, and it’s nice.`)}},
      {ic:'🚶',l:'Keep to yourself',s:'Nothing happens.',fn:()=>{}}]},dflt:2});
}
relMeetEvent('rel_meet_link','link',c=>c.at==='link'||c.at==='dt_pacific',['🚋','Someone on the Link','info'],n=>`On the platform, ${n} catches you reading the same transit map upside down and grins.`);
relMeetEvent('rel_meet_dome','dome',c=>c.at==='dt_dome'&&tod()>=1020,['🎤','Someone at the show','info'],n=>`In the line at the Dome, ${n} is singing the opener’s chorus a little too loud, and turns around to see if you heard.`);
relMeetEvent('rel_meet_market','market',c=>c.at==='pr_market'&&isOpen('pr_market'),['🍑','Someone at the market','info'],n=>`At the peach stall, you and ${n} reach for the same box, and both say “go ahead” at once.`);
relMeetEvent('rel_meet_work','work',c=>c.at==='work',['💼','Someone at work','info'],n=>`A friendly new face at work today: ${n}, who asks where the good coffee is.`);
relMeetEvent('rel_meet_party','party',c=>c.at==='home'&&[4,5].includes(day()%7)&&tod()>=1080&&tod()<1290,['🎉','A friend’s party down the hall','info'],
  n=>`Eli from down the hall is having people over and waves you in. By the snack table, ${n} is losing an argument about hot sauce and looks happy about it.`);

// ---- flirting: three tones, and how each lands with each person ----
const REL_TONES={playful:{ic:'😄',l:'Playful',s:'A joke, a little teasing.'},sincere:{ic:'💛',l:'Sincere',s:'Say what you actually liked.'},bold:{ic:'🔥',l:'Bold',s:'Confident and direct about wanting to see them again.'}};
function relTone(id,tone){
  const p=relDef(id),st=relSt(id),f=p.tone[tone]||0,d=Math.round(1+3*f+st.chem/30+relRnd(-2,2));
  relBump(id,'int',d);if(d>=5)relBump(id,'chem',1);
  const n=relN(id),lv=d>=6?2:d>=2?1:0;
  const L={playful:[`😄 ${n} groans at the pun, but you can hear the smile. A miss, mostly.`,`😄 ${n} laughs and fires one back. You’re even.`,`😄 ${n} laughs so hard they have to put the phone down. Point to you.`],
    sincere:[`💛 ${n} says “aw, thanks,” and changes the subject. A little much, a little soon.`,`💛 ${n} says they liked that too. Easy and warm.`,`💛 ${n} goes quiet for a second, then says that’s the nicest thing anyone has said to them in a while.`],
    bold:[`🔥 ${n} slows down: “Let’s see how it goes, okay?” Fair enough. You don’t push.`,`🔥 ${n} grins: “Confident. I like that.”`,`🔥 ${n} says “yes, soon,” before you’ve finished asking.`]}[tone][lv];
  return {d,line:L,lv};
}
function relToneBtns(id,after){return Object.entries(REL_TONES).map(([k,t])=>({ic:t.ic,l:`${t.ic} ${t.l}`,s:t.s,np:true,stay:true,fn:()=>{const r=relTone(id,k);say(r.line);after(r,k)}}))}

// ---- the phone: texts and the dating app ----
function relText(id){
  if(!relActive())return;const n=relN(id);
  modalSwap(`💬 Text ${n}`,`${relProfile(id)}${relMeters(id)}<p class="ch-q">How do you play it?</p>`,
    relToneBtns(id,r=>{pass(10);relS().texted[id]=day();S.rel.day[id]=day();
      modalSwap(`💬 ${n}`,`<p>${r.line}</p><div class="kv"><span>💘 Interest</span><b>${r.d>=0?'+':'−'}${r.d<0?-r.d:r.d}</b></div>`,[{l:'OK',fn:()=>afterAction()}])})
    .concat([{l:'Never mind',fn:()=>{}}]));
}
const relWeek=()=>Math.floor(day()/7);
// the week's matches (a match or two a week), and a first message to one of them: the modal app below and the 💘 Tacoma Hearts
// phone app (55-phone-life.js) share these
function relAppRoll(){const R=relS();
  if(R.app.wk!==relWeek()){R.app.wk=relWeek();const pool=relPool('app').filter(id=>!R.app.matches.includes(id));
    const n=Math.min(pool.length,1+(Math.random()<0.5?1:0)),got=[];for(let i=0;i<n;i++){const k=pool.splice(Math.floor(Math.random()*pool.length),1)[0];got.push(k)}
    R.app.matches=got;R.app.new=got.length}
  return R.app.matches.filter(id=>!relSt(id))}
function relAppSend(id,k){if(!relActive()||relSt(id))return null;const n=relN(id);pass(10);const R=relS();relMeet(id,'app');const st=relSt(id),r=relTone(id,k);
  const yes=st.int+st.chem/2+relRnd(0,25)>62;st.stage=yes?'talking':'passed';R.app.matches=R.app.matches.filter(x=>x!==id);
  const line=yes?`${r.line} Then: “Want to get together sometime?” You can ask ${n} out from the ❤️ Romance tab.`:pick([`📭 No reply from ${n}. That’s how the apps go sometimes, and it isn’t about you.`,`📭 ${n} writes back, kindly: “You seem great, but I don’t feel a spark. Good luck out there!” You wish them the same.`]);
  say(line);return {line,yes}}
const relAppLooking=()=>{const R=relS();return R.me?`Your profile: ${REL_VIBES[R.me.vibe].l} · looking for ${{serious:'something serious',casual:'something casual',open:'whatever happens'}[R.me.look]} · interested in ${R.me.into}. Everyone on the app is 21 or older.`:''};
// the phone app when it's installed and the phone works; the old pop-up app otherwise (no phone, a dead battery)
const relPhoneApp=()=>typeof phoneInstalled==='function'&&phoneInstalled('hearts')&&phoneCan();
function relOpenApp(){if(relPhoneApp()){closeModals();return phoneOpen('hearts')}return relApp()}
function relApp(){
  if(!relActive())return;const R=relS();
  if(!R.me)return relProfileSetup(()=>relApp());
  const ms=relAppRoll();
  const html=`<p>📱 <b>Tacoma Hearts</b>, the app everybody on the hill pretends not to use. ${ms.length?`${ms.length} new match${ms.length===1?'':'es'} this week:`:'No new matches right now. A match or two comes in each week.'}</p>`+ms.map(id=>relProfile(id)).join('')+
    `<p style="font-size:12px;color:var(--mute)">${relAppLooking()}</p>`;
  modalSwap('📱 The dating app',html,ms.map(id=>({ic:'💬',l:`💬 Message ${relN(id)}`,s:`${relAge(id)} · ${relDef(id).job}`,np:true,stay:true,fn:()=>relAppMsg(id)}))
    .concat([{l:'✏️ Edit your profile',np:true,stay:true,fn:()=>relProfileSetup(()=>relApp(),true)},{l:'Close',fn:()=>{}}]));
}
function relAppMsg(id){const n=relN(id);
  modalSwap(`💬 First message to ${n}`,relProfile(id)+'<p class="ch-q">How do you open?</p>',Object.entries(REL_TONES).map(([k,t])=>({l:`${t.ic} ${t.l}`,s:t.s,np:true,stay:true,fn:()=>{
    const r=relAppSend(id,k);if(!r)return;
    modalSwap(`💬 ${n}`,`<p>${r.line}</p>`,[{l:'Back to the app',np:true,stay:true,fn:()=>relApp()},{l:'Close',fn:()=>afterAction()}])}}))
    .concat([{l:'Back',stay:true,fn:()=>relApp()}]));
}
function relProfileSetup(then,edit){
  const R=relS(),me={};
  modalSwap('📱 Set up your profile',`<p>Three quick questions. ${edit?'This replaces your old answers.':''} The app only shows adults, 21 and over.</p><p class="ch-q">Interested in…</p>`,
    [['men','👨 Men'],['women','👩 Women'],['everyone','🌈 Everyone']].map(([k,l])=>({l,np:true,stay:true,fn:()=>{me.into=k;
      modalSwap('📱 Looking for…','<p>Be honest: the people who want the same thing find each other faster.</p>',[['serious','💞 Something serious'],['casual','🌤️ Something casual'],['open','🤷 See where it goes']].map(([k2,l2])=>({l:l2,np:true,stay:true,fn:()=>{me.look=k2;
        modalSwap('📱 Your photos and interests','<p>Pick the vibe your photos give off.</p>',Object.entries(REL_VIBES).map(([k3,v])=>({l:v.l,s:'Interests: '+v.likes.map(x=>REL_LIKES[x]).join(', '),np:true,stay:true,fn:()=>{me.vibe=k3;me.likes=v.likes.slice();R.me=me;say('📱 Profile done. Now the waiting.');then()}})))}})))}})));
}

// ---- dates ----
// at: the place (a key in L); win(start) → is this a good time to start; cost for two (scaled by the difficulty)
const REL_DATES={
  tacos:{ic:'🌮',n:'Tacos at the truck lot',at:'ea_taco',cost:24,mins:75,energy:-4,stress:-6,win:t=>t>=660&&t<=1170,when:'11 AM to 7:30 PM',
    t:n=>`Two plates of al pastor on the tailgate of the truck lot, the Port cranes lit up behind you. ${n} steals one of your limes and doesn’t apologize.`},
  movie:{ic:'🎬',n:'A movie at the Starlite in Proctor',at:'pr_main',cost:30,mins:150,energy:-3,stress:-8,win:t=>t>=1080&&t<=1230,when:'evening shows, 6 to 8:30 PM',
    t:n=>`The old Starlite, the balcony seats, one popcorn for two. ${n} whispers a running review that’s better than the movie.`},
  beach:{ic:'🌅',n:'Owen Beach at sunset',at:'ru_beach',cost:10,mins:110,energy:-5,stress:-12,win:t=>t>=sunsetNow()-150&&t<=sunsetNow()-20,get when(){return `the two hours before sunset (${fmt(sunsetNow())})`},
    t:n=>`Driftwood, cold toes, the sun going down orange behind Vashon. ${n} skips a stone seven times and makes you count out loud.`},
  glass:{ic:'🫙',n:'The Museum of Glass',at:'dt_glass',cost:36,mins:100,energy:-4,stress:-7,win:t=>dtMuseumOpen(day())&&t>=600&&t<=900,when:'Wednesday to Sunday, 10 AM to 3 PM',
    t:n=>`The hot shop, the glassblowers spinning fire into a vase, and then the Bridge of Glass glowing blue. ${n} reads every placard out loud in a museum voice.`},
  park:{ic:'🌳',n:'A walk in Wright Park',at:'st_park',cost:0,mins:60,energy:-3,stress:-6,win:t=>t>=480&&t<=sunsetNow()-30,get when(){return `8 AM to ${fmt(sunsetNow()-30)}`},
    t:n=>`Under the old trees, past the lawn bowlers, into the warm green air of the Conservatory. ${n} names three trees, gets two right.`},
};
const relDateCost=k=>rp(REL_DATES[k].cost);
function relDateTravel(k){const at=REL_DATES[k].at;return L[at]?travelMins(S.loc,at):30}
function relCanAsk(id){const st=relSt(id);return !!st&&!['passed','friends','ex','met'].includes(st.stage)&&day()>=st.noUntil}
function relAskOut(id){
  if(!relActive())return;const st=relSt(id),n=relN(id),p=relPartner();
  const warn=p&&p!==id?`<p class="ch-note">⚠️ You’re exclusive with ${relN(p)}. A date with ${n} would be cheating, and those things come out.</p>`:'';
  const btns=Object.entries(REL_DATES).map(([k,D])=>{const tv=relDateTravel(k),start=tod()+tv,c=relDateCost(k),ok=D.win(start),money=canAfford(c),en=S.energy>=15;
    return {l:`${D.ic} ${D.n}${c?` — ${$(c)}`:' — free'}`,s:!ok?`Best ${D.when}.`:!money?'Not enough cash.':!en?'Too tired for a date.':`${tv} min there, then ${D.mins<=60?D.mins+' min':(Math.round(D.mins/30)/2+' hours').replace('.5','½')} together.`,dis:!ok||!money||!en,np:true,stay:true,fn:()=>relAsk(id,k)}});
  modalSwap(`🌹 Ask ${n} out`,relProfile(id)+relMeters(id)+warn+'<p class="ch-q">Where to?</p>',btns.concat([{l:'Never mind',fn:()=>{}}]));
}
// consent: they decide. A no is final for a while, and twice is a no for good (you stay friends)
function relAsk(id,k){
  const st=relSt(id),n=relN(id),first=st.dates===0;
  const pYes=first?clamp((st.int+st.chem/2-25)/55,0.1,0.95):clamp((st.int-10)/50,0.3,0.97);
  pass(5);
  if(Math.random()<pYes)return relDate(id,k);
  st.no++;st.noUntil=day()+5;relBump(id,'int',-2);
  const line=st.no>=2&&first?`🙂 ${n} is kind about it: “I really like you, just not like that. Friends?” You say yes, and mean it. That’s worth something too.`
    :first?pick([`🙂 “I’m flattered, honestly, but I don’t feel it that way.” You thank ${n} for being straight with you. No harm done.`,`🙂 ${n} says no, gently: “Bad timing for me. I hope that’s okay.” It is.`])
    :`🙂 ${n} can’t tonight: “Rain check? I mean it.” You let it be.`;
  if(st.no>=2&&first)st.stage='friends';
  say(line);modalSwap(`🌹 ${n}`,`<p>${line}</p><p class="ch-note">No means no: you can’t ask ${n} again for a while${st.stage==='friends'?', and you’re friends now':''}.</p>`,[{l:'OK',fn:()=>afterAction()}]);
}
function relDate(id,k){
  const D=REL_DATES[k],st=relSt(id),n=relN(id),R=relS(),tv=relDateTravel(k);
  pass(tv);const fare=typeof hoodFare==='function'&&L[D.at]?hoodFare(S.loc,D.at):0;if(fare)spend(fare);
  if(L[D.at]){S.loc=D.at;S.visited[D.at]=true}
  pass(D.mins);spend(relDateCost(k));adj('energy',D.energy);calm(-D.stress);
  st.dates++;if(['met','talking'].includes(st.stage))st.stage='dating';R.day[id]=day();
  const p=relPartner();if(p&&p!==id)R.cheat={who:id,p,d:day()};
  say(`${D.ic} A date with ${n}: ${D.n.toLowerCase()}. ${D.t(n)}`);
  modalSwap(`${D.ic} ${D.n}`,`<p>${D.t(n)}</p>${relMeters(id)}<p class="ch-q">How do you play it?</p>`,relToneBtns(id,r=>relDateEnd(id,r)));
}
function relDateEnd(id,r){
  const st=relSt(id),n=relN(id),R=relS();
  const invite=st.int>=50&&st.dates>=1;
  const btns=[{l:'🚋 Say good night at the stop',s:'An easy, happy goodbye.',np:true,stay:true,fn:()=>{relBump(id,'int',2);relEnd(`🚋 A long goodbye at the stop, and a text from ${n} before you’re even home: “That was fun.”`)}},
    {l:'🌹 Ask for another date',s:'They might say yes.',np:true,stay:true,fn:()=>{const yes=st.int>=40&&Math.random()<0.85;relBump(id,'int',yes?3:0);
      relEnd(yes?`🌹 ${n} says yes before you finish the question. Same time next week?`:`🙂 ${n} says, “Let me think about it, okay?” You say of course, and leave it with them.`)}}];
  if(invite)btns.push({l:REL_TOGETHER.includes(st.stage)?`🌙 Ask ${n} to stay over`:`🌙 Invite ${n} back to your place`,s:'Only if they want to. They might say not tonight.',np:true,stay:true,fn:()=>relInvite(id)});
  modalSwap(`💞 The end of the night`,`<p>${r.line}</p><p class="ch-q">How does the night end?</p>`,btns);
}
function relEnd(line){say(line);modalSwap('💞 Good night',`<p>${line}</p>`,[{l:'OK',fn:()=>afterAction()}])}
// consent first; then a choice about protection; then one sentence and a fade to black; the morning-after line comes at breakfast
function relInvite(id){
  const st=relSt(id),n=relN(id),R=relS(),p=relDef(id),together=REL_TOGETHER.includes(st.stage);
  const yes=st.int+st.chem/2+(p.wants==='casual'?10:0)+(together?25:0)+relRnd(0,20)>88;
  if(!yes){relBump(id,'int',1);return relEnd(`🙂 ${n} smiles: “Not tonight. But I’m glad you asked like that.” You walk ${n} to the stop instead, and it’s a good night anyway.`)}
  modalSwap(`🌙 ${n} says yes`,`<p>${n} says yes, and means it.</p><p class="ch-q">Before anything else…</p>`,[
    {l:'💬 Talk about protection first',s:'Thirty awkward seconds that both of you appreciate.',np:true,stay:true,fn:()=>relNight(id,true)},
    {l:'🤷 Skip the talk',s:'Risky.',np:true,stay:true,fn:()=>relNight(id,false)}]);
}
function relNight(id,careful){
  const st=relSt(id),n=relN(id),R=relS(),p=relPartner();
  st.nights++;relBump(id,'int',4);relBump(id,'chem',2);calm(8);
  if(!REL_TOGETHER.includes(st.stage)&&st.dates<=2&&st.stage==='dating')st.stage='casual';
  if(p&&p!==id)R.cheat={who:id,p,d:day()};
  if(!R.scare&&Math.random()<(careful||R.careful?0.03:0.35))R.scare={who:id,d:day()+relRnd(4,9)};
  const line=`🌙 The door clicks shut, the lamp goes off, and the rest of the night belongs to the two of you. ⋯`;
  R.morning.push(`☀️ The morning after: coffee in two mismatched mugs, an easy laugh, and ${n} heading out with a promise to text.`);
  S.loc='home';relEnd(line);
}

// ---- getting serious: the talk, friends, family, moving in, the future ----
function relTalk(id){
  if(!relActive())return;const st=relSt(id),n=relN(id),p=relDef(id),R=relS(),other=relPartner();
  modal(`💞 The talk with ${n}`,`${relMeters(id)}<p>${st.dates} date${st.dates===1?'':'s'} so far. What do you want this to be?</p>`,[
    {l:'💞 Ask to be exclusive',s:other&&other!==id?`You’re already exclusive with ${relN(other)}.`:'Just the two of you. They decide too.',dis:!!(other&&other!==id),np:true,stay:true,fn:()=>{
      const yes=st.int>=60&&(p.wants!=='casual'||st.int>=85);
      if(yes){st.stage='exclusive';st.excl=day();R.partner=id;lifeMoment('💞',`Started dating ${p.n}, exclusively.`);relEnd(`💞 ${n} says yes, grinning: “I was hoping you’d ask.” It’s official.`)}
      else{relBump(id,'int',-1);relEnd(`🙂 ${n} is honest: “I like this a lot, but I’m not ready for exclusive.” You say that’s okay, and it is.`)}}},
    {l:'🌤️ Keep it casual',s:'Fun, no labels.',np:true,stay:true,fn:()=>{
      if(p.wants==='serious'&&st.int>=50&&Math.random()<0.5){st.stage='friends';relEnd(`🙂 ${n} says, kindly, “I think I want more than casual. Maybe we’re better as friends?” You agree, and the hug is real.`)}
      else{st.stage='casual';relEnd(`🌤️ ${n} laughs: “Casual works for me.” No labels, good times.`)}}},
    {l:'Not yet',fn:()=>{}}]);
}
const relDaysSince=d=>d==null||d===-1?0:day()-d;
// the next step with your partner, if there is one (shown on the Here tab at home and on the ❤️ tab)
function relSteps(){
  const p=relPartner();if(!p)return [];const st=relSt(p),n=relN(p),R=relS(),a=[];
  if(!st.friends)a.push({ic:'🎲',l:`Meet ${n}’s friends`,s:'Game night at their place, about 3 hours. They decide if they’re ready.',fn:()=>relMeetCircle(p,'friends')});
  else if(!st.family)a.push({ic:'🍽️',l:`Meet ${n}’s family`,s:`Sunday dinner, about 3 hours, ${$(rp(20))} for flowers.`,fn:()=>relMeetCircle(p,'family')});
  if(!R.livein&&st.friends){const ready=relDaysSince(st.excl)>=7&&st.int>=70;a.push({ic:'📦',l:`Ask ${n} to move in`,s:ready?'Shared rent and shared chores. They might say not yet.':'Give it a little more time (a week of being exclusive, and interest 70+).',dis:!ready,fn:()=>relMoveIn(p)})}
  if(R.livein&&st.stage==='exclusive'){const ready=relDaysSince(R.liveinD)>=30&&st.int>=80;
    a.push({ic:'💍',l:'Talk about the future',s:ready?'Propose, or decide together that you don’t need to marry.':'After a month or so of living together (interest 80+).',dis:!ready,fn:()=>relFuture(p)})}
  if(st.stage==='engaged')a.push({ic:'💒',l:'Plan the wedding',s:relDaysSince(R.engaged)>=7?'The Seymour Conservatory or the courthouse.':'Enjoy being engaged for a week or so first.',dis:relDaysSince(R.engaged)<7,fn:()=>relWedding(p)});
  if(S.length==='life'&&['married','partners'].includes(st.stage)&&R.kids===0&&R.kidsPlan<0&&S.age>=24&&S.age<=45)a.push({ic:'👶',l:'Talk about kids',s:'Only if you both want to. Lifetime games only.',fn:()=>relKidsTalk(p)});
  if(R.livein&&!R.chores[day()])a.push({ic:'🧺',l:'Split the chores',s:'20 min. Stress −3, and the place stays nice.',fn:()=>{pass(20);R.chores[day()]=true;calm(3);relBump(p,'int',1);say(pick([`🧺 You wash, ${n} dries. A podcast, a dish towel fight, a clean kitchen.`,`🧺 Laundry folded, trash out, plants watered. ${n} says you’re a good roommate, and a great everything else.`]))}});
  a.push({ic:'💔',l:`End things with ${n}`,s:'Kindly, but for good.',cls:'danger',fn:()=>modal('💔 End things?',`<p>Break up with ${n}?${R.livein?' One of you will have to move out.':''}</p>`,[{l:'Yes, end it kindly',fn:()=>{relBreakup(p,'you')}},{l:'No, never mind',fn:()=>{}}])});
  return a;
}
function relMeetCircle(id,who){
  const st=relSt(id),n=relN(id);if(!relActive())return;
  if(st.int<55){relBump(id,'int',0);return modal('🙂 Not yet',`<p>${n}: “Soon, I promise. I want them to meet you when it’s not so new.” Fair.</p>`,[{l:'OK',fn:()=>{}}])}
  pass(180);adj('energy',-8);st[who]=true;relBump(id,'int',6);
  if(who==='family'){spend(rp(20));S.life&&(S.life.family=clamp(S.life.family+2,0,100))}else adj('community',3);
  const line=who==='friends'?`🎲 Game night with ${n}’s friends: a loud round of charades and a group chat you are now in. One of them takes you aside: “We like you.”`
    :`🍽️ Sunday dinner with ${n}’s family: three kinds of rice, a grandmother who asks your intentions, and an uncle who wants your opinion on the Seahawks. You pass.`;
  say(line);lifeMoment(who==='friends'?'🎲':'🍽️',who==='friends'?`Met ${relDef(id).n}’s friends.`:`Met ${relDef(id).n}’s family.`);afterAction();
}
function relMoveIn(id){
  const st=relSt(id),n=relN(id),R=relS();
  if(st.int<75&&Math.random()<0.5)return modal('📦 Not yet',`<p>${n} takes your hand: “I want to. Just not yet. Ask me again in a few weeks?” You will.</p>`,[{l:'OK',fn:()=>{st.excl=day()}}]);
  R.livein=true;R.liveinD=day();R.split=Math.round(S.rent.amt/2);S.rent.amt=S.rent.amt-R.split;R.chores={};pass(120);
  const line=`📦 ${n} moves in: four boxes, a record player and a plant with a name. Rent is split now: you pay ${$(S.rent.amt)} a month. The chores are split too, in theory.`;
  say(line);lifeMoment('📦',`Moved in with ${relDef(id).n}.`);afterAction();
}
function relFuture(id){
  const st=relSt(id),n=relN(id),R=relS();
  modal('💍 The future',`<p>A slow Sunday on the couch with ${n}. The conversation turns where it’s been heading for a while.</p>`,[
    {l:`💍 Propose, with a ring — ${$(rp(600))}`,np:true,dis:!canAfford(rp(600)),fn:()=>{spend(rp(600));relPropose(id)}},
    {l:'💬 Propose, no ring, just the question',np:true,fn:()=>relPropose(id)},
    {l:'🤝 Decide together: you don’t need to marry',s:'Partners for life, on your own terms.',np:true,fn:()=>{st.stage='partners';lifeMoment('🤝',`Decided with ${relDef(id).n}: partners for life, no wedding needed.`);say(`🤝 You and ${n} agree: no wedding, no paperwork, just this. It feels exactly right.`)}},
    {l:'Not now',fn:()=>{}}]);
}
function relPropose(id){const st=relSt(id),n=relN(id),R=relS();
  if(st.int<88&&Math.random()<0.35){st.int=clamp(st.int-2,0,100);return modal('🙂 Not yet',`<p>${n} hugs you for a long time: “I love you. I’m not ready to say yes to that yet.” You say you’ll be here.</p>`,[{l:'OK',fn:()=>{R.liveinD=day()}}])}
  st.stage='engaged';R.engaged=day();lifeMoment('💍',`Engaged to ${relDef(id).n}.`);say(`💍 ${n} says yes. Then yes again, louder, so the neighbors hear. They do, and they cheer.`)}
function relWedding(id){const st=relSt(id),n=relN(id),R=relS(),big=rp(3200),small=rp(150);
  const wed=(where,c)=>{spend(c);st.stage='married';R.married={d:day(),age:S.age,where};pass(300);calm(15);
    if(where==='conservatory'){adj('community',6);S.life&&(S.life.family=clamp(S.life.family+5,0,100))}
    const line=where==='conservatory'?`💒 You and ${n} get married in the Seymour Conservatory in Wright Park: glass dome, palms, both families crying in the best way, and the block club on folding chairs out on the lawn.`
      :`💒 You and ${n} get married at the courthouse downtown, two witnesses and a judge with a bow tie, then tacos on the tailgate after. Perfect.`;
    say(line);lifeMoment('💒',`Married ${relDef(id).n}${where==='conservatory'?' at the Seymour Conservatory':' at the courthouse'}.`)};
  modal('💒 The wedding',`<p>Where do you and ${n} say it?</p>`,[
    {l:`🌿 The Seymour Conservatory — ${$(big)}`,s:'Family, friends, flowers. Community and family up.',np:true,dis:!canAfford(big),fn:()=>wed('conservatory',big)},
    {l:`🏛️ The courthouse — ${$(small)}`,s:'Small, quick, just right.',np:true,dis:!canAfford(small),fn:()=>wed('courthouse',small)},
    {l:'Not yet',fn:()=>{}}]);
}
function relKidsTalk(id){const n=relN(id),R=relS();
  modal('👶 Kids?',`<p>You and ${n} talk about it for a long time, over a lot of tea.</p>`,[
    {l:'👶 Yes, let’s try',s:'A baby might come in a later key week.',np:true,fn:()=>{R.kidsPlan=day();say(`👶 You and ${n} decide to try for a family. Someday soon, maybe.`)}},
    {l:'🙂 Not for us',s:'A good life either way.',np:true,fn:()=>{R.kidsPlan=-2;say(`🙂 You and ${n} agree: no kids, lots of nieces and nephews to spoil.`)}},
    {l:'Not now',fn:()=>{}}]);
}
// a breakup: moving out, then a sad week
function relBreakup(id,by){
  const R=relS(),st=relSt(id),n=relN(id);if(!st)return;
  st.stage='ex';st.int=Math.min(st.int,20);if(R.partner===id)R.partner=null;R.ld=-1;
  let move='';if(R.livein){S.rent.amt=S.rent.amt+(R.split||0);R.split=0;R.livein=false;move=` ${by==='you'?n:'You help '+n} pack${by==='you'?'s':''} the boxes, and the apartment is very quiet. Rent goes back to ${$(S.rent.amt)}.`}
  R.sadUntil=day()+7;adj('stress',10);R.liveinD=-1;
  const line=by==='you'?`💔 You tell ${n} it’s over, as kindly as you can. ${n} cries a little; so do you.${move}`:`💔 ${n} ends it: “I think we both know.” It still hurts.${move}`;
  say(line);lifeMoment('💔',`Broke up with ${relDef(id).n}.`);return line;
}

// ---- consequences: events that only run with the mode on ----
defEvent({id:'rel_caught',hook:'wake',tile:['😬','Found out','bad'],urgent:true,chance:0.35,priority:3,cond:()=>relActive()&&!!relS().cheat&&relPartner()===S.rel.cheat.p&&day()>S.rel.cheat.d,
  run:()=>{const c=S.rel.cheat;say(`😬 ${relN(c.p)} saw the messages from ${relN(c.who)}. ${relN(c.p)} is sitting at the kitchen table, very still, waiting for you.`)},
  choices:()=>{const c=S.rel.cheat;if(!c)return [];const p=c.p,n=relN(p);return [
    {ic:'🙏',l:'Tell the truth and apologize',s:'It still costs a lot.',fn:()=>{S.rel.cheat=null;relBump(p,'int',-35);adj('stress',15);
      if(relSt(p).int<35)relBreakup(p,'them');else say(`🙏 You tell ${n} everything. It’s the worst night in a long time. In the morning, ${n} says: “I don’t know yet. Don’t make me regret staying.”`)}},
    {ic:'🙈',l:'Make excuses',s:'Worse, probably.',fn:()=>{S.rel.cheat=null;relBump(p,'int',-50);adj('stress',18);
      if(relSt(p).int<45)relBreakup(p,'them');else say(`🙈 ${n} doesn’t believe a word, and says so. Something between you has cracked.`)}}]},dflt:0});
defEvent({id:'rel_jealous',hook:'wake',tile:['😟','A jealous moment','warn'],chance:0.06,cooldown:6,cond:()=>relActive()&&!!relPartner(),
  run:()=>{const p=relPartner(),o=Object.keys(S.rel.people).filter(x=>x!==p&&!['ex','passed'].includes(S.rel.people[x].stage));
    S.rel.pm.rel_jealous=o.length?pick(o):null;say(`😟 ${relN(p)} goes quiet over breakfast, then asks about ${S.rel.pm.rel_jealous?relN(S.rel.pm.rel_jealous):'that coworker who keeps texting you'}.`)},
  choices:()=>{const p=relPartner();if(!p)return [];const n=relN(p);return [
    {ic:'🤝',l:'Reassure them, honestly',s:'15 min. Stress −2.',fn:()=>{pass(15);relBump(p,'int',3);calm(2);say(`🤝 You tell ${n} the truth: there’s nothing there, and you’re glad they asked instead of stewing. ${n} relaxes.`)}},
    {ic:'😤',l:'Get defensive',s:'Feels good for a second.',fn:()=>{relBump(p,'int',-8);adj('stress',6);say(`😤 You snap that ${n} is being ridiculous. The rest of breakfast is very quiet.`)}}]},dflt:0});
defEvent({id:'rel_scare',hook:'wake',tile:['😰','A pregnancy scare','warn'],urgent:true,priority:3,chance:1,cond:()=>relActive()&&!!relS().scare&&day()>=S.rel.scare.d,
  run:()=>{const w=S.rel.scare.who;say(`😰 A text from ${relN(w)}: “Can we talk? I think we might have a pregnancy scare.” Your stomach drops.`);adj('stress',8)},
  choices:()=>{const sc=S.rel.scare;if(!sc)return [];const n=relN(sc.who),c=rp(25);return [
    {ic:'🏥',l:`Go to the clinic together — ${$(c)}`,s:'About 2 hours at the community clinic. Calm, kind staff, real answers.',fn:()=>{pass(120);spend(c);S.rel.scare=null;S.rel.careful=true;calm(10);relBump(sc.who,'int',4);
      say(`🏥 At the clinic, a nurse is calm and kind and explains everything. The test is negative. On the bus home, you and ${n} agree: protection every time from now on. Stress down.`)}},
    {ic:'🧪',l:`A test from the pharmacy — ${$(rp(15))}`,s:'Quick, at home, together.',fn:()=>{pass(40);spend(rp(15));S.rel.scare=null;S.rel.careful=true;calm(6);
      say(`🧪 Three very long minutes on the edge of the tub with ${n}. Negative. You both laugh, mostly from relief, and agree to be careful from here on.`)}}]},dflt:0});
// a partner's job or goals change your plans
defEvent({id:'rel_plans',hook:'wake',tile:['🧳','Big news from your partner','info'],chance:0.04,cooldown:20,cond:()=>{const p=relPartner();return relActive()&&!!p&&relDaysSince(relSt(p).excl)>=14&&relS().ld<0&&(!S.rel.plans.far||!S.rel.plans.raise||!S.rel.plans.place)},
  run:()=>{const P=S.rel.plans,k=pick(['far','raise','place'].filter(x=>!P[x]));P[k]=day();S.rel.pm.rel_plans=k;const n=relN(relPartner());
    say({far:`🧳 ${n} got an offer: a dream job in Spokane, five hours east, starting next month.`,raise:`🎉 ${n} got a promotion, with a real raise.`,place:`🏠 ${n} found a bigger apartment two blocks over: light, a second bedroom, a little more rent.`}[k])},
  choices:()=>{const p=relPartner(),k=S.rel.pm.rel_plans;if(!p||!k)return [];const n=relN(p),R=S.rel;
    if(k==='far')return [
      {ic:'📞',l:'Try long distance',s:'Video calls and long drives. Harder, not impossible.',fn:()=>{R.ld=day();adj('stress',6);say(`📞 You decide to try long distance. ${n} leaves on a Sunday; the first video call is that same night.`)}},
      {ic:'🙏',l:'Ask them to turn it down',s:'They decide.',fn:()=>{if(Math.random()<0.5){relBump(p,'int',-6);say(`🙂 ${n} thinks it over and stays: “Tacoma’s home. You’re home.” A little wistful, though.`)}else{R.ld=day();say(`🙂 ${n} says, gently, “I have to take it.” So: long distance, then.`)}}},
      {ic:'💔',l:'Let them go, kindly',s:'A breakup, with love.',fn:()=>{relBreakup(p,'you')}}];
    if(k==='raise')return [
      {ic:'🎉',l:'Celebrate',s:`A dinner out — ${$(rp(40))}. Stress −6.`,fn:()=>{spend(rp(40));calm(6);R.raise=true;relBump(p,'int',3);say(`🎉 Dinner out to celebrate ${n}. ${R.livein?'With a second income in the house, money feels less tight: they cover more of the groceries now.':''}`);if(R.livein)money(rp(150))}},
      {ic:'🙂',l:'Congratulate them at home',s:'Free.',fn:()=>{R.raise=true;say(`🙂 You make ${n} breakfast for dinner, their favorite.`);if(R.livein)money(rp(150))}}];
    return [
      {ic:'🏠',l:'Move to the bigger place together',s:'Rent goes up $200, split two ways. More room, more calm.',fn:()=>{if(!R.livein){R.livein=true;R.liveinD=day();R.split=Math.round(S.rent.amt/2);S.rent.amt-=R.split;R.chores={}}S.rent.amt+=100;R.split+=100;calm(6);relBump(p,'int',5);say(`🏠 New keys, a second bedroom, and ${n}’s plant gets a window of its own.`)}},
      {ic:'🙂',l:'Stay put for now',s:'Nothing changes.',fn:()=>say(`🙂 You and ${n} decide to stay put a little longer.`)}];
  },dflt:()=>S.rel&&S.rel.pm.rel_plans==='far'?0:1});

// ---- the day: mornings, nights, time skips, birthdays ----
function relAutoCheck(){const R=S&&S.rel;if(R&&R.auto18&&!R.on&&!isGrow()&&S.age>=18&&relAgeOK()){R.auto18=false;relSetOn(true,'at 18');say('🔞 18+ mode is on now, as you asked: you’re 18 and in your own place.')}}
{const om=onMorning;onMorning=function(d){om(d);relAutoCheck();if(!relActive())return;const R=S.rel;
  R.morning.splice(0).forEach(l=>{say(l);digestLine(l)});
  if(R.sadUntil>d){adj('stress',4);adj('energy',-4);const l=pick(['💔 A sad morning. The other mug in the cupboard. You make coffee anyway.','💔 You reach for your phone to text them, then remember. It gets a little easier each day.','💔 A heavy week. Your friends keep checking in. Let them.']);say(l);digestLine(l)}}}
{const on=onNight;onNight=function(where,notes,d){on(where,notes,d);if(!relActive())return;const R=S.rel,p=relPartner();
  if(p&&!R.livein&&R.day[p]!==d&&d%2===0)relBump(p,'int',R.ld>=0?-2:-1);
  if(p&&relSt(p).int<=12)notes.push(relBreakup(p,'them'))}}
LIFE_HOOKS.weekStart.push(()=>relAutoCheck());
LIFE_HOOKS.skip.push((from,to,choice,notes)=>{if(!relActive())return;const R=S.rel,p=relPartner(),wk=Math.max(1,Math.round((to-from+1)/7));
  for(const id in R.people){const st=R.people[id];if(id!==p&&['talking','dating','casual'].includes(st.stage)){st.int=clamp(st.int-wk*3,0,100);if(st.int<20){st.stage='met';notes.push(`📱 You and ${relN(id)} drift apart. No hard feelings.`)}}}
  if(!p)return;const st=relSt(p),n=relN(p);
  st.int=clamp(st.int+(choice==='friends'?2:choice==='extra'?-3:1)*Math.min(wk,6)/2-(R.ld>=0?wk:0),0,100);
  if(R.ld>=0&&to-R.ld>120){R.ld=-1;notes.push(`🚗 The long-distance stretch is over: ${n} found work back in Tacoma.`)}
  if(st.int<15){relBreakup(p,'them');notes.push(`💔 You and ${n} grew apart over these weeks, and ended it.`);return}
  if(R.raise&&R.livein){const m=Math.round(wk/4.3)*rp(150);if(m>0){money(m);notes.push(`💵 ${n}’s second income helped with groceries: +${$(m)}.`)}}
  notes.push(pick([`❤️ You and ${n}: Sunday dinners, a standing taco night, and one argument about the thermostat.`,`❤️ ${n} and you, through these weeks: long walks, short fights, good mornings.`,`❤️ You and ${n} got a little closer. Interest ${Math.round(st.int)}.`]));
  if(R.kidsPlan>=0&&to-R.kidsPlan>=270&&R.kids===0&&S.length==='life'){R.kids=1;const b=pick(['Maya','Elijah','Noa','Leo','Imani','Kai']);
    notes.push(`👶 A baby: ${b}. Tiny, loud, perfect. You are a parent now.`);lifeMoment('👶',`Became a parent: ${b}.`);if(S.life)S.life.stages.push({stage:'👶 Parent',age:S.age,d:to})}});
LIFE_HOOKS.birthday.push(age=>{if(!relActive())return;const p=relPartner();if(p)say(`🎂 ${relN(p)} remembered, of course: breakfast in the window seat and a card that’s mostly jokes.`)});

// ---- the Here tab: a ❤️ section at home ----
{const ah=actionsHere;actionsHere=function(){const a=ah();if(!relActive())return a;if(!ACT_CATS.love)ACT_CATS.love='❤️ Romance';
  if(S.loc==='home'){
    a.push({ic:'📱',l:'Open the dating app',s:relS().me?(relS().app.wk!==relWeek()?'New matches this week.':'Check your matches.'):'Set up a profile: three questions. Adults only, 21+.',cat:'love',fn:()=>relOpenApp()});
    const known=relKnownIds();if(known.length)a.push({ic:'❤️',l:'People you’re seeing',s:'Text, ask out or talk: open the ❤️ Romance tab.',cat:'love',fn:()=>setTab('rel')});
    relSteps().forEach(x=>a.push(Object.assign({cat:'love'},x)));
  }
  return a}}
const relKnownIds=()=>Object.keys(relS().people).filter(id=>!['passed','ex'].includes(S.rel.people[id].stage)&&relDef(id));

// ---- the ❤️ Romance tab (only with the mode on, in an adult game at 18+) ----
let REL_UI=[];
window.relUI=i=>{uiNarr=[];const f=REL_UI[i];if(!f||!relActive())return;f();afterAction();if(S&&!S.over&&!document.querySelector('.title,.end')&&!document.getElementById('mbg'))render()};
function relView(){
  REL_UI=[];const R=relS(),p=relPartner();
  const btn=(l,fn,dis,s)=>{const i=REL_UI.push(fn)-1;return `<button class="act" ${dis?'disabled':''} onclick="relUI(${i})"><span class="tx"><b>${l}</b>${s?`<span>${s}</span>`:''}</span></button>`};
  let h=`<div class="sect">❤️ Relationships</div><div class="rules">18+ mode is on. Everyone here is an adult; their ages are on their profiles. Anyone can say no, and the game takes it gracefully. Turn the mode off any time in ⚙️ Settings → 🎮 Game options: relationships pause, they don’t end.</div>`;
  if(p){const st=relSt(p);h+=`<div class="sect">Your partner · ${REL_STAGE[st.stage]}${R.livein?' · living together':''}${R.ld>=0?' · long distance':''}</div>`+relProfile(p,{extra:`<span>Together since ${fullDate(st.excl)}${R.married?` · married ${fullDate(R.married.d)}`:''}${R.kids?` · 👶 Parent`:''}</span>`})+relMeters(p);
    h+=btn(`💬 Text ${relN(p)}`,()=>relText(p),R.texted[p]===day(),R.texted[p]===day()?'Already texted today.':'10 min.');
    h+=btn(`🌹 Plan a date with ${relN(p)}`,()=>{closeModals();relAskOut(p)},false,'Pick a place and a time.');
    relSteps().forEach(x=>{h+=btn(`${x.ic} ${x.l}`,x.fn,x.dis,x.s)})}
  const others=relKnownIds().filter(id=>id!==p);
  if(others.length){h+=`<div class="sect">People you know · ${others.length}</div>`;
    others.forEach(id=>{const st=relSt(id),n=relN(id);h+=relProfile(id,{extra:`<span>${REL_STAGE[st.stage]} · met ${fullDate(st.met)}${st.dates?` · ${st.dates} date${st.dates===1?'':'s'}`:''}</span>`})+relMeters(id);
      if(st.stage==='friends'){h+=`<div class="rules">You’re friends with ${n}. That’s a good thing too.</div>`;return}
      if(['talking','dating','casual'].includes(st.stage))h+=btn(`💬 Text ${n}`,()=>relText(id),R.texted[id]===day(),R.texted[id]===day()?'Already texted today.':'10 min.');
      if(st.stage==='met')h+=`<div class="rules">You met ${n}, but it didn’t spark. Maybe you’ll run into each other again.</div>`;
      else h+=btn(`🌹 Ask ${n} out`,()=>{closeModals();relAskOut(id)},!relCanAsk(id),!relCanAsk(id)?`${n} said no. Give it time.`:p?`⚠️ You’re exclusive with ${relN(p)}.`:'They decide.');
      if(['dating','casual'].includes(st.stage)&&st.dates>=2&&!p)h+=btn(`💞 Have the talk with ${n}`,()=>relTalk(id),false,'Exclusive, or casual?')})}
  if(!p&&!others.length)h+=`<div class="rules">No one yet. Open the dating app at home, or get out there: the Link, a show at the Dome, the Proctor farmers market on Saturday, a party down the hall on a Friday or Saturday night, or work.</div>`;
  const ex=Object.keys(R.people).filter(id=>R.people[id].stage==='ex');
  if(ex.length)h+=`<div class="sect">Exes</div><div class="rules">${ex.map(relN).join(', ')}. ${R.sadUntil>day()?'A sad week: it gets easier.':'You’ve both moved on.'}</div>`;
  if(relPhoneApp())h+=btn('💘 Open Tacoma Hearts on your phone',()=>relOpenApp(),false,'A match or two a week, wherever you are.');
  else if(S.loc==='home')h+=btn('📱 Open the dating app',()=>relApp(),false,'A match or two a week.');else h+='<div class="rules">📱 The dating app is a home thing: open it from your apartment, or install 💘 Tacoma Hearts on your phone.</div>';
  return h;
}
const REL_TAB={k:'rel',ic:'❤️',l:'Romance',view:()=>relView()};
{const r0=render;render=function(){if(!S||S.over)return r0();if(relActive()){const E=EXTRA_TABS;EXTRA_TABS=E.concat([REL_TAB]);try{return r0()}finally{EXTRA_TABS=E}}if(tab==='rel')tab='act';return r0()}}
{const at=allTabs;allTabs=function(){const t=at();if(relActive()&&!t.some(x=>x[0]==='rel'))t.splice(t.length-2,0,['rel',REL_TAB.ic,REL_TAB.l]);return t}}

// ---- the mode: the age check, the start page, Game options ----
function relAgeCheck(then,back){
  modal('🔞 Adults only (18+)',`<p><b>This mode is for players 18 and older.</b></p><p>It adds relationships between grown-up characters: meeting people around Tacoma, a dating app, dates, moving in, and the ups and downs. Nothing explicit, ever. Only adult characters, always 18 or older, with their ages shown.</p><p style="font-size:13px;color:var(--mute)">You’ll only be asked once on this device. You can turn the mode off any time.</p>`,[
    {l:'✅ I’m 18 or older',fn:()=>{setPref('age18',true);then&&then()}},
    {l:'Cancel',fn:()=>{back&&back()}}]);
}
window.relAgeCheck=relAgeCheck;
window.relTitleToggle=()=>{const go=()=>{setPref('adult18',!relPrefOn());titleScreen()};if(!relAgeOK()&&!relPrefOn())return relAgeCheck(go);go()};
{const ts=titleScreen;titleScreen=function(){ts();try{const g=document.querySelector('.title .tgrid');if(!g||g.querySelector('#adultBtn'))return;
  g.insertAdjacentHTML('beforeend',`<button id="adultBtn" class="ghost" onclick="relTitleToggle()" aria-pressed="${relPrefOn()}">🔞 Adults only (18+): ${relPrefOn()?'On':'Off'}</button>`);
  const c=[...g.children];c.forEach(x=>x.classList.remove('wide'));if(c.length%2)c[c.length-1].classList.add('wide');fitTitle()}catch(e){}}}
// a new game: the mode follows the start page's setting; under 18 it waits for your 18th (and your own place)
{const ng=onNewGame;onNewGame=function(){ng();if(!S.rel)S.rel=relBlank();if(relPrefOn()&&relAgeOK()){if(!isGrow()&&S.age>=18)relSetOn(true,'new game');else{S.rel.auto18=true;relLog('auto18','new game')}}}}
// ⚙️ Settings → 🎮 Game options → 🔞 18+ mode
function relModeBtn(){const R=relS(),on=R.on&&relActive(),young=isGrow()||S.age<18;
  return {l:`🔞 18+ mode: ${R.on?'On':R.auto18?'Waits for 18':'Off'}`,s:R.on?'Adult relationships are on in this save. Tap to turn off (they pause, they don’t end).':young?`For players 18 and older, for characters 18 and older. You’re ${S.age}: tap for options.`:'Adult relationships, for players 18 and older. Tap to turn on in this save.',fn:()=>relModeSwitch()}}
function relModeSwitch(){
  const R=relS();
  if(R.on||R.auto18){relSetOn(false,'settings');R.auto18=false;say('🔞 18+ mode is off. Relationships are paused, not ended.');saveGame();return gameOptionsModal()}
  if(!relAgeOK())return relAgeCheck(()=>relModeSwitch(),()=>gameOptionsModal());
  if(!isGrow()&&S.age>=18){relSetOn(true,'settings');say('🔞 18+ mode is on in this save.');saveGame();return gameOptionsModal()}
  relUnder18();
}
function relUnder18(){
  const free=[...Array(GAME.slots)].map((_,i)=>i+1).find(n=>n!==curSlot()&&!rawSave(n));
  modal('🔞 18+ mode',`<p>You’re <b>${S.age}</b> in this save. 18+ mode only starts when your character is 18 and living in their own place; until then, this save has none of it.</p>`,[
    {l:'🎂 Turn on automatically at 18',s:lifeLong()?'When you turn 18 and move into your own place, it turns on, with a note in the log.':'This game ends before you turn 18, so it would never turn on here.',dis:!lifeLong(),np:true,fn:()=>{relS().auto18=true;relLog('auto18','settings');say('🔞 18+ mode will turn on at 18, once you’re in your own place.');saveGame();gameOptionsModal()}},
    {l:'🆕 Start a new adult save',s:free?`Starts at 18 in empty slot ${free}. This save stays in slot ${curSlot()}.`:`Replaces the game in slot ${curSlot()}: every slot is full.`,np:true,fn:()=>{saveGame();if(free)setSlot(free);setPref('adult18',true);
      const len=S.length||'quick';S=null;lifeStartWith({length:len,startAge:18,birthday:lifeRandBirthday()})}},
    ...(typeof skip18Start==='function'?[(()=>{const why=skip18Why();return {l:'⏩ Skip to 18',s:why||'Fast-forward this save to your 18th birthday (a few quick questions, then graduation and your own place), then 18+ mode turns on.',dis:!!why,np:true,
      fn:()=>skip18Start(()=>{relS().auto18=false;relSetOn(true,'skip to 18');return '🔞 18+ mode is on now: you’re 18 and in your own place.'},()=>relUnder18())}})()]:[]),
    {l:'Back',fn:()=>gameOptionsModal()}]);
}
{const gm=gameOptionsModal;gameOptionsModal=function(){if(!S||S.over)return gm();const m0=modal;
  modal=function(t,b,btns,nc){if(t==='🎮 Game options'&&Array.isArray(btns)){const i=btns.findIndex(x=>/^✏️/.test(x.l));btns.splice(i<0?btns.length-2:i,0,relModeBtn())}return m0(t,b,btns,nc)};
  try{return gm()}finally{modal=m0}}}
window.gameOptionsModal=gameOptionsModal;

// ---- the end: the mode's log of switches (and, with the mode on, your partner) ----
function relSummary(){const R=S&&S.rel;if(!R||!R.log.length&&!R.on)return '';
  const kv=(k,v)=>`<div class="kv"><span>${k}</span><b style="text-align:right">${v}</b></div>`;
  const sw=R.log.map(x=>`${x.to==='on'?'on':x.to==='off'?'off':'waiting for 18'} at ${x.age} (${fullDate(x.d).slice(4)})`).join(' · ');
  let h=kv('🔞 18+ mode',`${R.on?'On':'Off'} · switched ${R.log.length}×`)+(sw?`<div class="rules">${sw}</div>`:'');
  const p=relActive()?relPartner():null;if(p)h+=kv('❤️ Partner',`${relDef(p).n} · ${REL_STAGE[relSt(p).stage]}${R.kids?' · 👶 Parent':''}`);
  return `<div class="sect" style="margin-top:14px">18+ mode</div>${h}`;
}
{const ls=lifeSummaryHTML;lifeSummaryHTML=function(){return ls()+relSummary()}}
{const es=endScreen;endScreen=function(h1,sub,lost){es(h1,sub,lost);if(lifeLong())return;   // the longer games show it in the life summary
  try{const e=document.querySelector('.end'),h=relSummary();if(e&&h&&!e.querySelector('.rel-sum')){const b=e.querySelector('button.big');const d=document.createElement('div');d.className='rel-sum';d.innerHTML=h;if(b)b.before(d);else e.appendChild(d)}}catch(err){}}}

// ---- the guide: an "18+ mode" chapter, only when the mode is on (the rest of the guide stays free of it) ----
// On the start page it shows once this device passed the age check and turned the mode on for new games;
// during a game it shows only when relActive() (an adult game, 18+, mode on). Never in Growing Up.
function relGuideOn(){
  if(!relAgeOK()) return false;
  const inGame=typeof S!=='undefined'&&!!S&&!S.over;
  if(inGame) return relActive();
  return relPrefOn();
}
function relGuideChapter(){
  const D=REL_DATES,dates=Object.values(D).map(x=>[`${x.ic} ${x.n}`,x.cost?$(rp(x.cost)):'Free',`${Math.round(x.mins/5)*5} min`,x.when]);
  const tones=Object.values(REL_TONES).map(t=>`${t.ic} <b>${t.l}</b>: ${t.s}`).join('<br>');
  const ages=REL_PEOPLE.map(p=>p.age),lo=Math.min(...ages),hi=Math.max(...ages);
  return `
    <p><b>18+ mode</b> adds adult relationships to the adult game: meeting people around Tacoma, going on dates, and building a life with someone, or not. It is off unless you turn it on, and it never appears in Growing Up or for a character under 18.</p>
    ${hTip('Everyone is an adult',`The ${REL_PEOPLE.length} people you can meet are all invented adults, ${lo} to ${hi}, with their age on their profile. Friends from Growing Up join only once both of you are 18 or older.`)}
    <h3>Turning it on and off</h3>
    <ul>
      <li><b>On the start page:</b> 🔞 Adults only (18+). The first time, you confirm you're 18 or older. New adult games then start with the mode on.</li>
      <li><b>During a game:</b> ⚙️ Settings → 🎮 Game options → 🔞 18+ mode. At 18 or older it turns on right away in that save.</li>
      <li><b>Under 18:</b> choose to turn it on automatically once your character is 18 and in their own place, or start a new adult save. Nothing changes in the current save before then.</li>
      <li><b>Turning it off</b> hides the ❤️ tab, the actions and the events. Relationships pause; they pick up again if you turn it back on.</li>
    </ul>
    <h3>Meeting people</h3>
    <p>You can meet someone on the Link, at a show at the Tacoma Dome, at the Proctor Farmers Market, at a party down the hall, at work, or on the dating app at home (a match or two a week, after three quick profile questions). Each person has two meters: <b>interest</b> and <b>chemistry</b>. Shared interests help; so does being kind. Some people aren't interested, and that's fine: the game moves on.</p>
    <h3>💘 Tacoma Hearts on your phone</h3>
    <p>With the mode on, the App Store has <b>💘 Tacoma Hearts</b>, the same dating app as a phone app: it takes one of your five slots and works anywhere with signal, not just at home. The week's matches, a first message in one of three tones, and your profile. It disappears from the phone and the App Store when the mode is off, and the old way (📱 Open the dating app, at home) still works without a phone or with a dead battery.</p>
    <h3>Dates</h3>
    ${hTable(['Date','Cost','Time','When'],dates)}
    <p>How you flirt matters, and everyone reacts differently:</p><p>${tones}</p>
    ${hTip('Consent is part of the game','Anyone can say no to a date or to coming back to your place, and the game takes it gracefully: there is never an option to push. Talking about protection is a choice, and it matters. What happens behind closed doors is one line and a fade to black.')}
    <h3>Relationships</h3>
    <ul>
      <li><b>Keep it casual or go exclusive:</b> it's a conversation, and both of you have a say.</li>
      <li><b>Meet the friends, then the family.</b></li>
      <li><b>Move in together:</b> the rent splits in half, and so do the chores.</li>
      <li><b>The future:</b> propose with a ring or without, a wedding at the Seymour Conservatory (${$(rp(3200))}) or the courthouse (${$(rp(150))}), or decide together not to marry.</li>
      <li><b>Kids:</b> in Lifetime games, a talk about kids can lead to the parent stage of your life.</li>
    </ul>
    <h3>When things go wrong</h3>
    <ul>
      <li><b>Jealousy</b> comes up as a decision. <b>Seeing someone else</b> while you're exclusive warns you first; if it comes out, it can end things.</li>
      <li><b>Breakups</b> hurt: a partner who lived with you moves out, the rent goes back up, and a sad week follows.</li>
      <li><b>A pregnancy scare</b> means a clinic or a pharmacy test, and you both get more careful afterwards.</li>
      <li><b>A partner's news</b> can change your plans: a job across the state, a promotion, a bigger place.</li>
    </ul>
    <h3>The ❤️ Romance tab</h3>
    <p>Lists your partner and the people you know, with their meters and what you can do next: text, ask out, talk, or step back.</p>`;
}
{const hc=helpChapters;helpChapters=function(...a){const ch=hc(...a);
  if(!relGuideOn()) return ch;
  const i=ch.findIndex(c=>c[0]==='faq');ch.splice(i<0?ch.length:i,0,['adult18','18+ mode',relGuideChapter()]);return ch}}
