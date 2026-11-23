// ---------------- 📱 phone: 💬 Messages (built in) ----------------
// Text the people in 📒 Contacts with pick-a-message buttons (no free typing). Replies arrive on game time (phoneOnTime): fast from
// close friends, after work or school from people who are busy, the next morning from people who are asleep. Friends text first
// now and then (check-ins and invitations). Unread badges, a history per contact, 1% battery a text, and phoneNet() for all of it.
// Shared with 📞 Phone (53-phone-calls.js): who someone is (msgWho), whether they're free (phAvail), closeness (msgCl), what a
// chat does to the game's own stats (msgBond), and favors: 🚗 a ride across town, 💵 a small loan, 📦 help moving heavy things.
// Old phone moments move in here when the phone works (msgOn()): the rent scam text (lev_scam), and the invitations from Ron
// (neighbor_bbq), the Santos family (santos_next_door), the block club (block_party) and Tavita (g_bbq_morning) arrive as texts
// with the event's own choices in the thread. With no phone, no battery or no service they work exactly as before.
// State: PH().msg = {th:{id:{m:[{f:0 them|1 me|2 note,t,x,ev?,inv?,ask?}],u}}, q:[replies on the way], cl:{id:0–10}, bond:{id:day},
//   plan:{d,at:[]}, ride:{id,until}, lift:{id,d}, loan:{id:{amt,d,nag}}, owe:{id:n}, fav:{id:day}}
const MSG_CAP=40;
function MSG(){const P=PH();const M=P.msg=P.msg||{};M.th=M.th||{};M.q=M.q||[];M.cl=M.cl||{};M.bond=M.bond||{};M.loan=M.loan||{};M.owe=M.owe||{};M.fav=M.fav||{};return M}
// texts and calls need a working phone with service; adults also need a plan (picked the first time the phone opens)
function msgOn(){return phoneNet()&&(isGrow()||!!PH().plan)}
const msgRnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const msgKind=id=>String(id).split(':')[0], msgKey=id=>String(id).split(':').slice(1).join(':');
const MSG_X={'x:scam':{id:'x:scam',n:'(253) 555-0147',ic:'❔',grp:'Unknown',how:'Not in your contacts'}};
function msgWho(id){return phoneContacts().find(c=>c.id===id)||MSG_X[id]||null}
const msgName=id=>{const c=msgWho(id);return c?c.n:'Someone'};
const MSG_FIRST={'n:santos':'Tita Rose'};
const msgFirst=id=>{if(MSG_FIRST[id])return MSG_FIRST[id];const n=msgName(id);return /^(The|Ms\.|Mr\.|Mrs\.|Dr\.|Your) /.test(n)?n:n.split(' ')[0]};
// who can't text: little Nia (no phone yet), Jaylen next door (eleven), unknown numbers; the 18+ people only with relActive()
function msgTextable(id){const k=msgKind(id);if(k==='x'||id==='fam:nia'||id==='n:jaylen')return false;if(k==='r')return typeof relActive==='function'&&relActive();return !!msgWho(id)}

// ---- closeness: the game's own stats for family and the kids on the hill, our own 0–10 for everyone else ----
const MSG_CL0={old:5,n:3,w:2,r:2,fam:6};
function msgCl(id){const k=msgKind(id);
  if(k==='k')return Math.round(gF(msgKey(id))/2);
  if(k==='fam')return Math.round((isGrow()?S.family:(S.life&&S.life.family!=null?S.life.family:60))/10);
  const M=MSG();return M.cl[id]!=null?M.cl[id]:(MSG_CL0[k]||2)}
function msgCloser(id,v){const k=msgKind(id);if(k==='k'||k==='fam')return;const M=MSG();M.cl[id]=Math.max(0,Math.min(10,Math.round((msgCl(id)+v)*10)/10))}
// a good exchange with someone: the friendship/family/community stats move (big: a call, small: a text). Once a day per person
// for texts; calls have their own once-a-day in 53-phone-calls.js.
function msgBond(id,big){const k=msgKind(id),n=big?2:1;
  if(k==='fam'){if(isGrow()){adj('family',n);adj('mood',n)}else{if(S.life)S.life.family=clamp(S.life.family+n,0,100);adj('stress',-n*2)}return}
  if(k==='k'){gFriend(msgKey(id),n);adj('mood',n+1);return}
  msgCloser(id,big?1:0.5);if(isGrow())adj('mood',n);else{adj('community',n);adj('stress',-n)}}

// ---- are they free? asleep, at work, at school or busy ----
// neighbors' days: [weekdays only?, from, to, what]. Retirees (Ms. Lorraine, Mr. Harris, Bev) are always around.
const PH_NB_DAYS={kim:[0,480,1200,'at the market'],imani:[0,600,1080,'at the bookstore'],linh:[0,600,1260,'at the phở shop'],dre:[0,540,1080,'at the barbershop'],
  marisol:[0,600,960,'up on the scaffold'],tasha:[1,480,1020,'at the clinic'],ron:[1,450,1020,'at the Port'],santos:[1,420,1140,'on shift'],denise:[1,540,1020,'at work'],
  malik:[1,540,1020,'at the front desk'],eli:[0,0,0,''],priya:[0,0,0,'']};
function msgHash(s){let h=0;for(const c of s)h=(h*31+c.charCodeAt(0))>>>0;return h}
function phAvail(id,t){t=t==null?S.t:t;const m=((t%1440)+1440)%1440,d=Math.floor(t/1440),wk=((d%7)+7)%7<5,k=msgKind(id),key=msgKey(id),g=isGrow();
  const kid=k==='k'||(g&&k==='fam'&&key==='nia');
  if(id==='fam:grandma'){if(m<390||m>=1260)return 'asleep'}
  else if(kid){if(m<420||m>=1320)return 'asleep'}
  else if(key==='priya'){if(m>=480&&m<900)return 'asleep'}   // ICU nights: she sleeps through the morning
  else if(m<390||m>=1350)return 'asleep';
  if(kid&&typeof isSchoolDay==='function'&&isSchoolDay(d)&&m>=G_BELL&&m<900)return 'school';
  if(k==='fam'&&['mom','dad','home'].includes(key)&&wk&&m>=540&&m<1050)return 'work';
  if(k==='n'&&PH_NB_DAYS[key]){const [w,a,b]=PH_NB_DAYS[key];if(b>a&&(!w||wk)&&m>=a&&m<b)return 'work'}
  else if(k==='n'&&!['lorraine','harris','bev'].includes(key)&&!PH_NB_DAYS[key]&&wk&&m>=540&&m<1020)return 'work';
  if((k==='old'&&msgHash(id)%2===0||k==='r')&&wk&&m>=540&&m<1020)return 'work';
  if(k==='w'&&!g&&S.job&&typeof isShiftDay==='function'&&isShiftDay(d)){const J=job();if(m>=J.start&&m<J.end)return 'work'}
  if(msgHash(id+':'+d+':'+Math.floor(m/60))%100<12)return 'busy';
  return 'free'}
// minutes until they can answer
function msgWait(id){const av=phAvail(id),m=tod(),cl=msgCl(id);
  if(av==='asleep'){let a=0;while(a<1440&&phAvail(id,S.t+a)==='asleep')a+=30;return a+msgRnd(5,45)}
  if(av==='work'||av==='school'){if(Math.random()<0.35)return msgRnd(20,60);let a=0;while(a<720&&['work','school'].includes(phAvail(id,S.t+a)))a+=15;return a+msgRnd(5,25)}
  let d=cl>=7?msgRnd(2,10):msgRnd(3,25);if(id==='fam:grandma')d=d*3+10;if(av==='busy')d+=msgRnd(20,60);void m;return d}

// ---- what people have: the favors each kind of person can plausibly do (adults; the city's neighborhoods are adult-only) ----
const PH_CARS=['ron','eli','priya','tasha','dre','santos','imani','kim'];
function msgPerks(id){const k=msgKind(id),key=msgKey(id),o={};if(isGrow())return o;
  if(k==='fam'&&key!=='nia'){o.loan=rp(100);o.ride=true;o.lift=true}
  if(k==='old'){o.loan=rp(60);o.ride=msgHash(id)%3!==0;o.lift=true}
  if(k==='n'){if(PH_CARS.includes(key))o.ride=true;if(['ron','santos','eli','tasha','malik'].includes(key))o.lift=true;if(['lorraine','harris','bev','kim'].includes(key))o.loan=rp(40)}
  if(k==='w'&&msgHash(id)%2===0)o.ride=true;
  return o}
// the family lives back home (or across Hilltop): a ride and help moving from them come from farther, but they come
const PH_FAV={ride:{ic:'🚗',l:'Could you give me a ride across town?',min:3},loan:{ic:'💵',l:'Could you spot me a little cash until payday?',min:5},lift:{ic:'📦',l:'Could you help me move some heavy stuff?',min:3}};
// will they? [yes, why-not]: closeness, whether they're free, favors you already owe them, and a cooldown
function msgFavorAnswer(id,k){const M=MSG(),cl=msgCl(id),av=phAvail(id),fam=msgKind(id)==='fam';
  if(av==='asleep')return [false,'asleep'];
  if(k!=='loan'&&(av==='work'||av==='school'))return [false,'work'];
  if(k==='loan'&&M.loan[id])return [false,'loan'];
  if((M.owe[id]||0)>=2&&!fam)return [false,'owe'];
  if(M.fav[id]!=null&&day()-M.fav[id]<(fam?2:4))return [false,'soon'];
  if(cl<PH_FAV[k].min)return [false,'cl'];
  return [Math.random()<(fam?0.9:0.55+cl*0.05),'no']}
const PH_FAV_NO={asleep:'Sorry, I was asleep.',work:'At work, sorry! Can’t get away.',loan:'You still have my last loan, remember?',owe:'I think you still owe me a couple, friend.',
  soon:'I just helped you! Give me a few days.',cl:'Sorry, I don’t think I can.',no:'Ah, not today. Sorry!'};
// the yes: a ride (good for two hours), money now, or they come over to help (at home)
function msgFavorYes(id,k){const M=MSG(),n=msgFirst(id),fam=msgKind(id)==='fam';M.fav[id]=day();if(!fam)M.owe[id]=(M.owe[id]||0)+1;
  if(k==='ride'){M.ride={id,until:S.t+120};return `🚗 ${n} can drive you across town in the next two hours. Pick where in 💬 Messages, or tap <b>🚗 Ride with ${n}</b>.`}
  if(k==='loan'){const a=msgPerks(id).loan||rp(40);money(a);M.loan[id]={amt:a,d:day()};return `💵 ${n} sends you ${$(a)}. Pay it back from the thread when you can.`}
  if(k==='lift'){M.lift={id,d:day()};return `📦 ${n} will come over to help today. Tap <b>📦 Move the heavy stuff with ${n}</b> at home.`}}
const msgYesLine={ride:['On my way. Text me where you’re headed.','Sure! I was going out anyway. Where to?','Yep. Give me ten minutes to find my keys.'],
  loan:['Sent. Pay me back whenever.','Done. Don’t make it a habit, ha.','Sent! No rush.'],
  lift:['I’ll be there. Have water ready.','Sure, I’ll bring the dolly.','Yeah, I can swing by today. Lift with your legs.']};

// ---- a ride across town: driven door to door, no fare, about half the bus time (like 🚗 Drive in 38-car.js) ----
let PH_RIDE=null;
function msgRideMins(a,b){const ha=hoodOf(a),hb=hoodOf(b);if(ha===hb)return null;const r=h=>h?HOODS[h].ride.mins:0;return Math.max(6,Math.round(Math.max(r(ha),r(hb))*0.5)+2)}
{const tm=travelMins;travelMins=function(a,b){const m=tm(a,b);if(!PH_RIDE||isGrow())return m;const x=msgRideMins(a,b);return x==null?m:Math.min(m,x)}}
{const hf=hoodFare;hoodFare=function(a,b){return PH_RIDE?0:hf(a,b)}}
{const oa=onArrive;onArrive=function(dest,from){const r=PH_RIDE;try{return oa.apply(this,arguments)}finally{if(r){PH_RIDE=null;say(`🚗 ${r.n} drops you off at ${L[dest].name}. “Text me if you need a ride back.”`)}}}}
if(window.CAR){const dr=CAR.driving;CAR.driving=()=>!!PH_RIDE||dr()}   // in a friend's car, not on the bus
function msgRideDests(){const out=[];for(const h of Object.keys(HOODS)){const k=HOODS[h].hub;if(L[k]&&!L[k].hidden&&hoodOf(S.loc)!==h)out.push(k)}if(hoodOf(S.loc))out.unshift('link');return out.filter(k=>L[k])}
function msgRideGo(k){const M=MSG(),r=M.ride;if(!r||S.t>r.until||!L[k])return;delete M.ride;PH_RIDE={n:msgFirst(r.id)};phoneClose();go(k)}
function msgLiftDo(){const M=MSG(),f=M.lift;if(!f||f.d!==day()||S.loc!=='home')return;delete M.lift;const n=msgFirst(f.id);pass(60);adj('stress',-6);adj('energy',-4);if(!isGrow())adj('community',1);msgCloser(f.id,1);
  say(pick([`📦 ${n} takes the heavy end. The couch goes up the stairs, the dresser goes against the other wall, and the bed frame finally stops wobbling. An hour, half the work, twice the laughs.`,
    `📦 You and ${n} move every heavy thing you own to where it should have been all along. ${n} turns down pizza money and accepts a cold drink.`]))}

// ---- the thread ----
function msgThread(id){const M=MSG();return M.th[id]=M.th[id]||{m:[],u:0}}
function msgPush(id,f,x,o){const T=msgThread(id);T.m.push(Object.assign({f,t:S.t,x},o||{}));if(T.m.length>MSG_CAP)T.m.splice(0,T.m.length-MSG_CAP);if(f===0)T.u++;return T}
function msgTile(id,x){if(!phoneCan())return;try{showTile('💬',msgName(id),x.length>70?x.slice(0,68)+'…':x,'info')}catch(e){}}
// an incoming text, from the game or from a person: in the thread, unread, a tile
function msgIn(id,x,o){msgPush(id,0,x,o);msgTile(id,x)}
const msgUnread=()=>{if(!S||!S.ph||!S.ph.msg)return 0;const th=S.ph.msg.th||{};return Object.keys(th).reduce((n,id)=>n+(th[id].u||0),0)};
const msgLastIn=id=>{const T=MSG().th[id];if(!T)return null;for(let i=T.m.length-1;i>=0;i--){if(T.m[i].f===1)return null;if(T.m[i].f===0)return T.m[i]}return null};

// ---- what people say ----
const MSG_LINES={
  how:{fam:['We’re good! Your dad fixed the gutter. Sort of. Call us this week?','All fine here. Eat a vegetable. Love you.','Good! Missing you. The house is too quiet.'],
    k:['good!! bored tho','chillin. u?','my mom made me clean my room 😩 u?','pretty good. did u see the thing at People’s?'],
    gma:['Oh, sweetheart! I’m fine. I learned how to send a picture. 📷 Did it work?','Just doing my crossword. Call me when you can, I like hearing your voice.'],
    n:['Not bad! Hot one today. You?','Good, good. Busy week. You settling in?','Can’t complain. Well, I can, but I won’t.'],
    old:['Surviving! Work is work. We should get together.','Good! Miss seeing you every day like at school.','Living the dream. The dream is tired. You?'],
    w:['Good! See you next shift.','Tired. You know how it is. You?','Not bad! Did you hear about the new schedule? Ugh.'],
    r:['Doing well! Good to hear from you.','Good! Busy day, but good.']},
  hi:{fam:['Just thinking about you. Are you eating okay?','Your sister drew you a picture. It’s you and a mountain. Very accurate.','Did you see the weather up there? Stay dry!'],
    k:['yo','what r u doing','guess what','r u going to People’s later?','i’m soooo bored'],
    gma:['Thinking of you today, sweetheart. Grandma loves you.','I saw a show about Mount Rainier and I thought of you!'],
    n:['The mountain’s out tonight. Go look.','Saw you walk by this morning. Hope the day went easy!','Somebody left a box of free tomatoes on the corner. Go get some before they’re gone.'],
    old:['Remember Mr. Okafor’s class? I still can’t do fractions.','Saw a guy who looked just like you at the Dome. It was not you. Hi though.','Still alive over here. You?'],
    w:['Did you leave your jacket in the break room? Someone’s been wearing it.','Next shift’s going to be a long one. Bring snacks.'],
    r:['Hey! Hope your week’s going well.']},
  otw:{fam:['Okay! Dinner’s at six.','Thanks for letting us know. Careful crossing MLK.','👍 See you soon.']},
  thx:{any:['Anytime!','Of course. You’d do the same.','That’s what neighbors are for.','No problem at all.']},
  sorry:{asleep:['Sorry, was asleep! What’s up?','Just woke up. Hi!'],work:['Sorry, was at work! What’s up?','Just got off. Hey!'],school:['sorry was in class','just got out lol'],busy:['Sorry, crazy afternoon. Hi!']},
};
const MSG_P={   // a few people's own voices
  'n:lorraine':{how:['I am fine, thank you for asking. The block club meets Thursday. You are coming.','Tomatoes are in. Come get some before Ron does.'],hi:['The new people on the corner put their trash out on the wrong day. I have handled it.','The mountain is out. Do not waste it.']},
  'n:harris':{how:['Doing all right. Knees are talking. Ships are coming in.','Fine. Watched a car carrier come into Commencement Bay. Biggest I’ve seen this year.'],hi:['Big ship coming in around six. Overlook bench. Bring a sweater.']},
  'n:ron':{how:['Good! Smoker’s clean, ready for Saturday.','Long day at the Port. A crane got a new hip. Long story.'],hi:['Brisket test run this weekend. You’re on the tasting panel.']},
  'n:bev':{how:['Busy! The free fridge needed restocking twice today.','Good. Somebody donated forty jars of pickles. Forty.'],hi:['Free fridge is full of peaches. Go!','Reminder: block club chat rules. No politics, no lost-cat spam. Found cats are fine.']},
  'n:santos':{how:['We are good! The kids are loud. Tito Ben says hi. – Rose','Busy busy! Come eat sometime. – Rose'],hi:['We made too much pancit again. Come get a plate! – Rose']},
  'n:eli':{how:['Good! I finally learned which bus goes where. Mostly.','Working from the coffee shop. Trying to be a local.'],hi:['Is it weird that I like the Link bell? It’s nice. It’s a nice bell.']},
  'k:marcus':{hi:['1v1 me at People’s','i made 10 free throws in a row. ok 7']},'k:ana':{hi:['drew u a thing','the mural on MLK is almost done!! come see']},
  'k:tavita':{hi:['my cousins are over. it’s so loud. come save me','learned a new song on the uke']},'k:linh':{hi:['the robot moved 6 inches today 🤖','what book r u reading']},
  'k:zay':{hi:['found a new hill. it’s so steep','the blackberries by the alley are ready']},
};
function msgLine(id,k){const g=msgKind(id),p=MSG_P[id]&&MSG_P[id][k],grp=id==='fam:grandma'?'gma':g;
  if(p&&Math.random()<0.6)return pick(p);const L0=MSG_LINES[k]||{};return pick(L0[grp]||L0.any||L0.n||['👍'])}
// invitations: where people would meet you
function msgInvPlace(id){const k=msgKind(id),key=msgKey(id);
  if(k==='k'){const K=gKid(key);return K?K.at[0]:'peoples'}
  if(k==='n'){const N=NEIGHBORS.find(x=>x.id===key);return N&&L[N.at[0]]?N.at[0]:'mlk'}
  return isGrow()?'peoples':pick(['mlk','peoples','view'])}
const MSG_INV={k:p=>p==='home'?'come over! i’m on the steps across the street':`wanna hang out? i’m at ${L[p].name}`,n:p=>p==='home'?'Come by for a bit? Porch is open and there’s iced tea.':`Want to meet up at ${L[p].name}? I’ll be there a while.`,
  old:p=>`Want to hang out? I could meet you at ${L[p].name}.`,fam:p=>`We’re at ${L[p].name}. Come say hi?`,w:p=>`A few of us are going to ${L[p].name} after. Come!`,r:p=>`Want to meet up at ${L[p].name}?`};
// they ask you for a favor back (once you owe them)
const MSG_ASK=['Could you help me carry a dresser up my stairs? Twenty minutes, tops. Probably.','Any chance you could water my plants tonight? I’m stuck late.','Could you grab my package off the porch before it rains? I’m out till late.','Could you help me jump my car? It’s being dramatic again.'];

// ---- sending: the buttons in a thread ----
function msgSend(id,k,txt,extra){if(!msgOn()||!msgTextable(id))return false;const M=MSG(),last=msgLastIn(id);
  phoneUse(1);msgPush(id,1,txt);
  const it=Object.assign({id,k,at:S.t+msgWait(id),d:day(),av:phAvail(id)},extra||{});
  if(k==='hang'){it.place=msgInvPlace(id);it.yes=it.av==='free'||Math.random()<0.4}
  if(last&&last.t>S.t-720)it.bond=true;   // answering their text: good for the friendship
  if(['how','hi','ans','thx'].includes(k))it.bond=true;
  M.q.push(it);
  return true}
// a reply arrives
function msgDeliver(it){const M=MSG(),id=it.id;if(!msgWho(id))return;
  const late=it.av!=='free'&&MSG_LINES.sorry[it.av]&&Math.random()<0.6?pick(MSG_LINES.sorry[it.av])+' ':'';
  if(it.bond&&M.bond[id]!==day()){M.bond[id]=day();msgBond(id,false)}
  if(PH_FAV[it.k]){const [yes,why]=msgFavorAnswer(id,it.k);
    if(yes){const note=msgFavorYes(id,it.k);msgIn(id,late+pick(msgYesLine[it.k]));msgPush(id,2,note);say(note)}
    else msgIn(id,PH_FAV_NO[why]||PH_FAV_NO.no);
    return}
  if(it.k==='hang'){if(it.yes){msgIn(id,late+MSG_INV[msgKind(id)](it.place),{inv:{p:it.place,until:S.t+150}})}else msgIn(id,late+pick(['Can’t right now, sorry! Another day?','Ugh, I wish. Rain check?']));return}
  if(it.k==='payback'){msgIn(id,pick(['Got it, thanks!','Received. You’re good people.','Thanks! Didn’t even need it back yet.']));return}
  if(it.k==='cb'){msgIn(id,pick(['Sorry I missed your call! What’s up?','Saw you called. Everything okay?','Missed you! Call again later?']));return}
  if(it.k==='thx'){msgIn(id,msgLine(id,'thx'));return}
  if(it.k==='ans'){msgIn(id,pick(['😊','Ha, right?','Talk soon!','👍']));return}
  msgIn(id,late+msgLine(id,it.k==='hi'?'how':it.k))}

// ---- they text first: about one a day once you know people (more with closer people) ----
function msgPool(){return phoneContacts().filter(c=>msgTextable(c.id)&&phAvail(c.id)!=='asleep'&&phAvail(c.id)!=='school')}
function msgIncoming(){const M=MSG(),C=msgPool();if(!C.length)return;
  const owed=C.filter(c=>(M.owe[c.id]||0)>0);
  if(owed.length&&Math.random()<0.45){const c=pick(owed);msgIn(c.id,pick(MSG_ASK),{ask:{until:S.t+240}});return}
  const w=C.map(c=>1+msgCl(c.id));let r=Math.random()*w.reduce((a,b)=>a+b,0),c=C[0];for(let i=0;i<C.length;i++){r-=w[i];if(r<0){c=C[i];break}}
  const lim=isGrow()?gCurfew()-90:1230;
  if(msgKind(c.id)!=='fam'&&Math.random()<0.35&&tod()<lim&&tod()>=600){const p=msgInvPlace(c.id);if(L[p]&&p!==S.loc){msgIn(c.id,MSG_INV[msgKind(c.id)](p),{inv:{p,until:S.t+150}});return}}
  msgIn(c.id,msgLine(c.id,'hi'))}
function msgPlan(M){const r=Math.random(),n=r<0.3?0:r<0.8?1:2,from=Math.max(tod(),480)+20,at=[];
  for(let i=0;i<n&&from<1260;i++)at.push(day()*1440+msgRnd(from,1260));M.plan={d:day(),at:at.sort((a,b)=>a-b)}}
// loans you haven't paid back: a nudge after three weeks (closeness −2), once
function msgLoanNag(){const M=MSG();for(const id of Object.keys(M.loan)){const l=M.loan[id];if(!l.nag&&day()-l.d>=21&&msgWho(id)){l.nag=1;msgCloser(id,-2);msgIn(id,`Hey, no pressure, but about that ${$(l.amt)}…`)}}}
function msgPump(){const M=MSG();
  for(const it of M.q.slice().sort((a,b)=>a.at-b.at)){if(it.at>S.t)break;M.q=M.q.filter(x=>x!==it);phTry(()=>msgDeliver(it))}
  if(!M.plan||M.plan.d!==day())msgPlan(M);
  while(M.plan.at.length&&M.plan.at[0]<=S.t){M.plan.at.shift();msgIncoming()}
  msgLoanNag()}
phoneOnTime(min=>{if(!S||S.over)return;const M=MSG();
  if(min===0){M.q=M.q.filter(it=>it.d>=day()-1);delete M.plan;if(M.ride&&S.t>M.ride.until)delete M.ride}   // a night or a time skip: stale replies are gone
  if(msgOn())msgPump()});

// ---- answering an invitation or a favor they ask ----
function msgGoInv(id,inv){const M=MSG(),p=inv.p,n=msgFirst(id),tm=S.loc===p?0:travelMins(S.loc,p);
  msgPush(id,1,pick(['On my way!','Be right there.','omw!']));phoneUse(1);inv.done=1;
  if(tm){pass(tm);S.loc=p;S.visited&&(S.visited[p]=true)}pass(45);
  if(M.bond[id]!==day()){M.bond[id]=day();msgBond(id,true)}else msgBond(id,false);
  if(isGrow())adj('mood',3);else adj('stress',-5);
  say(`🤝 ${tm?`You head over to ${L[p].name} (${tm} min) and`:'You'} hang out with ${n} for a while. ${pick(['The time goes fast.','You laugh harder than you have all week.','It’s easy, the way it should be.'])}`);phoneClose()}
function msgDoAsk(id,a,call){const M=MSG(),n=msgFirst(id);a.done=1;if(!call){msgPush(id,1,'Sure, I’ll be right there.');phoneUse(1)}pass(45);adj('energy',-4);if(!isGrow())adj('community',3);msgCloser(id,1);M.owe[id]=Math.max(0,(M.owe[id]||0)-1);
  say(`🤝 You help ${n} out: 45 minutes, and now you’re even. ${n} is grateful.`)}

// ---- screens ----
const msgWhen=t=>fmtAbs(t);
function msgList(){const M=MSG(),C=phoneContacts().filter(c=>msgTextable(c.id)||(M.th[c.id]&&M.th[c.id].m.length));
  Object.keys(MSG_X).forEach(id=>{if(M.th[id]&&M.th[id].m.length)C.push(MSG_X[id])});
  let h=msgOn()?'':phCard(PH().cut?'📵 <b>No service.</b> Pay the phone bill to send and get texts.':!phoneNet()?'📵 No signal.':'📶 Pick a phone plan first.','warn');
  if(!C.length)return h+phNote('No one to text yet. Get out and meet people: they show up in 📒 Contacts and here.');
  const last=id=>{const T=M.th[id];return T&&T.m.length?T.m[T.m.length-1]:null};
  C.sort((a,b)=>((last(b.id)||{t:-1e9}).t)-((last(a.id)||{t:-1e9}).t));
  return h+C.map(c=>{const l=last(c.id),u=(M.th[c.id]||{}).u||0;
    return `<button class="ph-row msg-row${u?' msg-unread':''}" onclick="phoneGo('msg','${c.id}')"><span class="ph-av">${c.ic}</span><span class="msg-mid"><b>${esc(c.n)}</b><span>${l?(l.f===1?'You: ':'')+esc(String(l.x).replace(/<[^>]+>/g,'')):'Say hi 👋'}</span></span><span class="msg-side">${l?`<small>${msgWhen(l.t)}</small>`:''}${u?'<i class="msg-dot" aria-label="unread"></i>':''}</span></button>`}).join('')}
function msgView(id){const M=MSG(),c=msgWho(id);if(!c)return msgList();
  const T=msgThread(id);T.u=0;const on=msgOn(),pend=M.q.find(it=>it.id===id),av=phAvail(id),n=msgFirst(id);
  const avTxt={asleep:'💤 probably asleep',work:'💼 probably at work',school:'🏫 at school',busy:'busy right now',free:''}[av]||'';
  let h=`<div class="msg-head"><span class="ph-av">${c.ic}</span><div><b>${esc(c.n)}</b><span>${c.how}${avTxt&&msgTextable(id)?' · '+avTxt:''}</span></div></div><div class="msg-thread">`;
  h+=T.m.length?T.m.map(m=>m.f===2?`<p class="msg-status" style="text-align:center">${m.x}</p>`:`<div class="ph-msg ${m.f?'me':'them'}">${m.f?esc(m.x):esc(m.x).replace(/\[link\]/,'<u>[link]</u>')}<small>${msgWhen(m.t)}</small></div>`).join(''):`<p class="msg-empty">No messages yet.</p>`;
  if(pend)h+=`<div class="msg-status">${av==='asleep'?`Delivered. ${esc(n)} is probably asleep.`:av==='work'||av==='school'?`Delivered. ${esc(n)} will see it later.`:'Delivered. Waiting for a reply…'}</div>`;
  h+='</div>';
  // a game moment in the thread (the rent scam, an invitation): its choices, the same ones as the 🤔 Decide sheet
  const evm=T.m.slice().reverse().find(m=>m.ev);
  if(evm&&typeof isPending==='function'&&isPending(evm.ev)){const opts=choiceOpts(evm.ev)||[];h+=phSub('What do you do?');
    h+=opts.map((o,i)=>phBtn(`${o.ic?o.ic+' ':''}${o.l}`,()=>{if(!isPending(evm.ev))return;msgPush(id,2,`You chose: ${o.ic||''} ${untag(o.l)}`);choiceApply(evm.ev,i,'pick')},{sub:o.s||'',dis:!!o.dis})).join('')}
  if(!msgTextable(id))return h+(id==='fam:nia'?phNote('Nia doesn’t have a phone yet. “When you’re twelve,” Mom says.'):id==='n:jaylen'?phNote('Jaylen is eleven: no phone yet. Say hi on the sidewalk.'):'');
  if(!on)return h+phCard(PH().cut?'📵 No service: pay the phone bill to text.':'📵 No service right now.','warn');
  // a ride or help they said yes to
  if(M.ride&&M.ride.id===id&&S.t<=M.ride.until){h+=phSub(`🚗 Ride with ${esc(n)}`);h+=msgRideDests().map(k=>phBtn(`${L[k].ic||'📍'} ${esc(L[k].name)}`,()=>msgRideGo(k),{sub:`${msgRideMins(S.loc,k)||travelMins(S.loc,k)} min, no fare.`})).join('')}
  if(M.lift&&M.lift.id===id&&M.lift.d===day())h+=phBtn(`📦 Move the heavy stuff with ${esc(n)}`,msgLiftDo,{cls:'primary',dis:S.loc!=='home',sub:S.loc!=='home'?'At home.':'An hour. Stress −6, energy −4: half the work.'});
  if(M.loan[id])h+=phBtn(`💵 Pay ${esc(n)} back ${$(M.loan[id].amt)}`,()=>{const l=M.loan[id];if(S.money<l.amt)return;spend(l.amt);delete M.loan[id];msgCloser(id,0.5);msgSend(id,'payback','Sent you the money. Thank you!')},{dis:S.money<M.loan[id].amt,sub:S.money<M.loan[id].amt?'Not enough cash.':'Square up.'});
  // answering what they sent
  const last=msgLastIn(id),opts=[];
  if(last&&last.inv&&!last.inv.done&&S.t<=last.inv.until){const p=last.inv.p,tm=S.loc===p?0:travelMins(S.loc,p),late=isGrow()&&tod()+tm+45>gCurfew()-15;
    h+=phSub('Reply');h+=phBtn('I’m in. On my way!',()=>msgGoInv(id,last.inv),{cls:'primary',dis:late,sub:late?`No time before curfew (${fmt(gCurfew())}).`:`${tm?tm+' min there, then ':''}45 min together. ${isGrow()?'Friendship up, mood +3.':'Stress −5, and good for the friendship.'}`});
    h+=phBtn('Can’t today. Rain check?',()=>{last.inv.done=1;msgSend(id,'ans','Can’t today. Rain check?')})}
  else if(last&&last.ask&&!last.ask.done&&S.t<=last.ask.until){h+=phSub('Reply');
    h+=phBtn('Sure, I’ll be right there.',()=>msgDoAsk(id,last.ask),{cls:'primary',sub:'45 minutes. Community +3, energy −4. Now you’re even.'});
    h+=phBtn('Sorry, I can’t today.',()=>{last.ask.done=1;msgCloser(id,-1);msgSend(id,'ans','Sorry, I can’t today.')},{sub:'They’ll understand. Mostly.'})}
  else if(last&&last.t>S.t-720&&!last.ev)opts.push(['ans',pick(['Ha, yes!','Good to hear from you!','😂','Same here.']),'Answer them: good for the friendship.'],);
  const g=isGrow(),k=msgKind(id),dis=!!pend;
  opts.push(['how',k==='k'?'hey whats up':k==='fam'?(g?'Hi! What are you doing?':'Hi! How is everyone?'):'How’s it going?','Keeping in touch is good for a friendship.']);
  if(k==='fam'&&g&&S.loc!=='home')opts.push(['otw','On my way home!','So they don’t worry.']);
  if(k==='fam'&&!g)opts.push(['how','Miss you all. Call soon?','Family +1.']);
  if(k==='k'||(['old','n','w','r'].includes(k)&&msgCl(id)>=4&&!g))if(tod()>=600&&tod()<(g?gCurfew()-90:1230))opts.push(['hang',k==='k'?'wanna hang out?':'Want to hang out today?','If they’re free, they’ll say where.']);
  if(M.fav[id]!=null&&day()-M.fav[id]<=3)opts.push(['thx','Thanks again for the help!','']);
  const P=msgPerks(id);
  if(P.ride&&!M.ride&&Object.keys(HOODS).length)opts.push(['ride',PH_FAV.ride.l,'A ride to another neighborhood: no fare, faster than the bus.']);
  if(P.loan&&!M.loan[id])opts.push(['loan',PH_FAV.loan.l,`About ${$(P.loan)}. Pay it back from here.`]);
  if(P.lift&&S.loc==='home'&&!M.lift)opts.push(['lift',PH_FAV.lift.l,'They come over and help for an hour.']);
  if(opts.length){h+=phSub('Write…');h+=opts.map(([k2,t,s])=>phBtn(t,()=>msgSend(id,k2,t),{sub:s+(pend?' Wait for their reply first.':''),dis})).join('')}
  h+=`<p class="msg-foot">Each text uses a little battery.${pend?' One text at a time: wait for the reply.':''}</p>`;
  setTimeout(()=>{const b=document.querySelector('#phoneUI .ph-body'),t=document.querySelector('#phoneUI .msg-thread');if(b&&t)b.scrollTop=Math.max(0,t.offsetTop+t.offsetHeight-b.offsetTop-b.clientHeight*0.6)},0);
  return h}
definePhoneApp({id:'msg',name:'Messages',ic:'💬',builtin:true,order:10,desc:'Text the people you know.',badge:msgUnread,view:arg=>arg?msgView(arg):msgList()});
phoneContactActs(c=>msgTextable(c.id)||(MSG().th[c.id]&&MSG().th[c.id].m.length)?phBtn('💬 Text',()=>phoneGo('msg',c.id),{cls:'primary'}):'');

// ---- on the main screen: a ride or help someone said yes to ----
{const a0=actionsHere;actionsHere=function(){const a=a0.apply(this,arguments);if(!S||!S.ph||!S.ph.msg||!phoneOwned())return a;return phTry(()=>{const M=MSG();
  if(M.ride&&S.t<=M.ride.until){const n=msgFirst(M.ride.id);a.unshift({ic:'🚗',l:`Ride with ${n}`,s:'Pick a neighborhood: no fare, faster than the bus.',cat:'here',cls:'primary',fn:()=>phoneOpen('msg',M.ride.id)})}
  if(M.lift&&M.lift.d===day()&&S.loc==='home'){const n=msgFirst(M.lift.id);a.unshift({ic:'📦',l:`Move the heavy stuff with ${n}`,s:'An hour. Stress −6, energy −4: half the work.',cat:'here',fn:msgLiftDo})}
  return a},a)}}

// ---- old phone moments, now in Messages (only when the phone works; otherwise exactly as before) ----
function msgEvText(evId,id,text,narr){const e=EV.find(x=>x.id===evId);void e;msgIn(id,text,{ev:evId});say(narr||`💬 A text from <b>${esc(msgName(id))}</b>: “${esc(text)}” It’s in 💬 Messages, with what you can do.`)}
// the rent scam: the same text, now in your Messages from an unknown number; the choices work from the thread
{const e=EV.find(x=>x.id==='lev_scam');if(e){const r0=e.run;e.run=function(){const r=r0.apply(this,arguments);
  if(phTry(msgOn,false))phTry(()=>{msgIn('x:scam',`URGENT: your rent payment FAILED. Pay ${$(rp(75))} late fee within 2 hrs to avoid eviction: [link]`,{ev:'lev_scam'});say('💬 It’s sitting in your Messages from a number you don’t know. You can decide from there.')});return r}}}
// invitations from people you know: the event's own choices, from the text. Ron's cookout and the Santos karaoke can reach you
// anywhere on Hilltop (going means walking home first); the block party and Tavita's barbecue arrive as you'd find them anyway.
function msgInvite(evId,who,text,anywhere){const e=EV.find(x=>x.id===evId);if(!e)return;const r0=e.run,c0=e.cond,ch0=e.choices;
  const texted=()=>phTry(()=>msgOn()&&!!who()&&!!msgWho(who()),false);
  e.run=function(){const id=texted()?who():null;if(!id)return r0.apply(this,arguments);msgEvText(evId,id,typeof text==='function'?text():text);return {}};
  if(anywhere){
    e.cond=function(c){if(c0(c))return true;return !!c&&c.at!=='home'&&!hoodOf(c.at)&&texted()&&c0(Object.assign({},c,{at:'home'}))};
    e.choices=function(){const opts=ch0.apply(this,arguments)||[];if(S.loc==='home')return opts;const tm=travelMins(S.loc,'home');
      return opts.map((o,i)=>i===opts.length-1?o:Object.assign({},o,{s:`Walk home first (${tm} min). `+(o.s||''),fn:function(){if(S.loc!=='home'){pass(travelMins(S.loc,'home'));S.loc='home'}return o.fn.apply(this,arguments)}}))}}}
msgInvite('neighbor_bbq',()=>S.met&&S.met.ron?'n:ron':null,'Smoker’s been going since noon. Ribs, links, Tita Rose’s lumpia, six people arguing about the Seahawks. Come on over, two doors down.',true);
msgInvite('santos_next_door',()=>S.met&&S.met.santos?'n:santos':null,'Karaoke night!! The machine is out. Come sing one. Just one. We have pancit. – Rose',true);
msgInvite('block_party',()=>S.met&&S.met.lorraine?'n:lorraine':S.met&&S.met.bev?'n:bev':null,()=>S.met&&S.met.lorraine?'Block party at the end of the street. Sawhorses are up, the grill is going. I expect to see you.':'Block party at the end of the street tonight! Grill, raffle, music. Come down!');
msgInvite('g_bbq_morning',()=>isGrow()&&gMet('tavita')?'k:tavita':null,'my family is doing a bbq tonight 4 to 8:30!!! everybody’s coming. my uncle is hanging lights rn, come help? or bring something');

// ---- ❓ Help: Your phone chapter ----
{const g0=phoneGuide;phoneGuide=function(){return g0.apply(this,arguments)+`<h3>💬 Messages</h3>
  <ul><li>Text anyone in 📒 Contacts: family, friends from school, coworkers and neighbors. You pick what to say from a few messages that fit the person and the moment; there’s no typing.</li>
  <li>Replies come on game time: a few minutes from close friends, after work or school from people who are busy, and the next morning from people who are asleep. One text at a time per person.</li>
  <li>People text you first sometimes: a check-in, or an invitation to meet up somewhere. Answer the same day; it’s good for the friendship. Going means walking there and 45 minutes together.</li>
  <li>A good exchange moves the game’s own numbers, once a day per person: Family with family, friendship with the kids on the hill, Community and a little less stress with everyone else.</li>
  <li>Favors (adults): <b>🚗 a ride across town</b> (no fare, about half the bus time), <b>💵 a small loan</b> until payday (pay it back from the thread; three weeks late and they’ll mention it) and <b>📦 help moving heavy stuff</b> at home. People say yes more when you’re close and they’re free, and they’ll ask you for a favor back.</li>
  <li>Some moments arrive as texts when your phone works: the scam text about a “failed rent payment” (same choices, from the thread) and invitations from neighbors you know (Ron’s cookout, karaoke at the Santos’, the block party; in Growing Up, Tavita’s family barbecue). With no phone, a dead battery or no service, they happen the old way.</li>
  <li>Each text uses 1% battery. No service (an unpaid bill) means no texts.</li></ul>`}}
window.MSGS={M:()=>MSG(),send:msgSend,on:msgOn,avail:phAvail,cl:msgCl,perks:msgPerks,incoming:msgIncoming,deliverAll:()=>{const M=MSG();M.q.forEach(it=>it.at=S.t);msgPump()}};
