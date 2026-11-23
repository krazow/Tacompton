// ---------------- 📱 phone: 📞 Phone (built in): calls, voicemail, people calling you ----------------
// Call anyone you can text (52-phone-msg.js decides who that is). Asleep, at work, at school or busy: it rings out to their
// voicemail; leave one and they text you back. On a call: 💬 talk a while (stress down, and the game's own friendship, family or
// community numbers up, once a day per person; calling Mom or Dad counts as the day's 📞 Call home, calling Grandma as the day's
// Call Grandma), or ask a favor they can do (a ride across town, a small loan, help moving heavy stuff): the answer comes right away.
// Close friends and family call you every few days; missed calls go to Recents with a voicemail.
// State: PH().calls = {log:[{t,id,dir:'out'|'in'|'missed',ans,seen,vm,heard}], ring:{id,t,until}|null, next:abs time, chat:{id:day}}
// The live call (CALL_NOW) is transient, not saved.
let CALL_TAB='contacts', CALL_NOW=null;
function CL(){const P=PH();const c=P.calls=P.calls||{};c.log=c.log||[];c.chat=c.chat||{};return c}
function callLog(e){const c=CL();c.log.unshift(Object.assign({t:S.t},e));if(c.log.length>20)c.log.length=20}
function callRinging(){const c=CL();return c.ring&&S.t<=c.ring.until&&phoneCan()?c.ring:null}
function callBadge(){if(!S||!S.ph||!S.ph.calls)return 0;const c=CL();return (callRinging()?1:0)+c.log.filter(e=>(e.dir==='missed'&&!e.seen)||(e.vm&&!e.heard)).length}
// a call takes game time and battery: 1% per 5 minutes on top of the idle drain
function callTime(min){pass(min);phoneUse(Math.max(1,Math.round(min/5)))}
const callSay=s=>{if(CALL_NOW)CALL_NOW.lines.push(s)};

// ---- what they say ----
const CALL_CHAT={
  fam:['Mom wants to know if you’re eating. Dad wants to know about the Seahawks. You answer both, sort of.','They put you on speaker so the whole kitchen can say hi. It’s loud. It’s great.','Your dad reads you the weather like it’s news. It is, kind of.'],
  gma:['Grandma tells you about her neighbor’s new dog for ten minutes. You feel ten years younger and also calmer.','Grandma asks about school, the mountain and whether you’re wearing a jacket. Yes, yes and no.'],
  k:['You talk about nothing for twenty minutes and it’s the best part of the day.','You both watch the same video at the same time and laugh at the same part.','They tell you a long story about their cousin. You tell one back. Tie.'],
  n:['You trade news from the block: who’s fixing their porch, whose kid made the team, which landlord finally called back.','A slow, easy talk about nothing much. It helps more than you’d think.'],
  old:['You talk about school like it was a hundred years ago. It was four.','Twenty minutes of “remember when.” You hang up smiling.'],
  w:['You complain about the schedule together. It’s weirdly good for you.','Work talk turns into real talk. You know them better now.'],
  r:['An easy talk. Good to hear a friendly voice.'],
};
const CALL_P={'n:lorraine':['Ms. Lorraine gives you the history of the house on the corner, from 1952. You learn a lot about plumbing.'],'n:harris':['Mr. Harris names three ships coming in and the shipyard he welded the hull of one of them in. Probably.'],
  'n:ron':['Ron explains brisket the way he explains wharf pilings: slowly, lovingly, with diagrams you can hear.'],'n:santos':['Tita Rose puts you on speaker for the whole Santos dinner table. Everyone talks at once. Tito Ben wins.']};
const CALL_GREET={k:'“hey it’s me leave a message or just text me lol”',fam:'“You’ve reached us! Leave a message.”',gma:'“This is Grandma. I’m probably in the garden. Call back, sweetheart.”',n:'“Hi, you’ve reached me. Leave a message.”',old:'“It’s me. You know what to do.”',w:'“Leave a message and I’ll call you back after my shift.”',r:'“Hi! Leave a message.”'};
const CALL_IN=['“Hey! Just calling to say hi. Is now okay?”','“Hi! Got a minute?”','“Hey you! I was just thinking about you.”'];
const callGrp=id=>id==='fam:grandma'?'gma':msgKind(id);

function callStart(id){if(!msgOn()||!msgTextable(id))return;const av=phAvail(id),n=msgFirst(id);callTime(1);
  CALL_NOW={id,t:S.t,lines:[],done:{}};
  if(av!=='free'){CALL_NOW.st='out';callSay(`It rings and rings. ${av==='asleep'?'It’s late: they’re probably asleep.':av==='work'?`${esc(n)} must be at work.`:av==='school'?`${esc(n)} is in class.`:`${esc(n)} must be busy.`}`);callSay(CALL_GREET[callGrp(id)]||'“Leave a message after the beep.”');callLog({id,dir:'out',ans:false})}
  else{CALL_NOW.st='on';callSay(`${esc(n)} picks up. “Hey, {{name}}!”`);callLog({id,dir:'out',ans:true})}}
function callEnd(){CALL_NOW=null}
// talking a while: the big once-a-day bonus, and the existing Call home / Call Grandma for the day
function callChat(id){const c=CL(),d=day(),first=c.chat[id]!==d,g=isGrow(),key=msgKey(id);callTime(g&&msgKind(id)==='k'?20:15);
  if(first){c.chat[id]=d;msgBond(id,true);if(g)adj('mood',4);else adj('stress',-5)}else if(!g)adj('stress',-2);else adj('mood',1);
  if(!g&&msgKind(id)==='fam'&&S.called&&!S.called[d]){S.called[d]=true;adj('stress',-3)}
  if(g&&key==='grandma'&&S.grandma&&!S.grandma[d]){S.grandma[d]=true;adj('mood',2)}
  const P=CALL_P[id];callSay(P&&Math.random()<0.6?pick(P):pick(CALL_CHAT[callGrp(id)]||CALL_CHAT.n));return first}
function callFavor(id,k){callTime(3);const [yes,why]=msgFavorAnswer(id,k);
  if(yes){const note=msgFavorYes(id,k);callSay(`“${pick(msgYesLine[k])}”`);say(note);callSay(note)}else callSay(`“${PH_FAV_NO[why]||PH_FAV_NO.no}”`)}
function callScreen(){const C=CALL_NOW,id=C.id,w=msgWho(id)||{ic:'🙂',n:'Someone',how:''},n=msgFirst(id),M=MSG();
  let h=`<div class="ph-call"><div class="ph-call-av">${w.ic}</div><b>${C.st==='out'?'Calling':C.st==='vm'?'Voicemail':'On a call with'} ${esc(n)}${C.st==='out'?'…':''}</b><span>${w.how}</span></div>`;
  h+=`<div class="ph-call-log">${C.lines.map(s=>`<p>${s}</p>`).join('')}</div>`;
  if(!phoneCan())return h+'<p>Your phone dies mid-sentence.</p>'+phBtn('OK',callEnd);
  if(C.st==='out'){
    h+=phBtn('🎙️ Leave a voicemail',()=>{callTime(2);C.st='vm';msgCloser(id,0.3);M.q.push({id,k:'cb',at:S.t+msgWait(id),d:day(),av:phAvail(id)});
      callSay('You leave a message: “Hey, it’s {{name}}. Just calling to say hi. Call me back.” Beep.')},{cls:'primary',sub:'Two minutes. They’ll text you back.'});
    h+=phBtn('📵 Hang up',callEnd)}
  else if(C.st==='vm')h+=phBtn('📵 Hang up',callEnd,{cls:'primary'});
  else{
    if(C.ask&&!C.done.ask){h+=phBtn('Sure, I’ll be right there.',()=>{C.done.ask=1;msgDoAsk(id,{},true);callSay('“You’re the best. See you in a minute.”')},{cls:'primary',sub:'45 minutes. Community +3, energy −4. Now you’re even.'});
      h+=phBtn('Sorry, I can’t today.',()=>{C.done.ask=1;msgCloser(id,-1);callSay('“No worries. Another time.”')})}
    if(!C.done.chat){const g=isGrow(),first=CL().chat[id]!==day();
      h+=phBtn('💬 Talk a while',()=>{C.done.chat=1;callChat(id)},{cls:C.ask?'':'primary',sub:`${g&&msgKind(id)==='k'?20:15} minutes. ${first?(g?'Mood up, and good for the friendship.':'Stress −5, and good for the friendship.'):'Already talked today: a little less stress.'}`})}
    const P=msgPerks(id);
    for(const k of Object.keys(PH_FAV)){if(!P[k]||C.done[k])continue;if(k==='lift'&&(S.loc!=='home'||M.lift))continue;if(k==='loan'&&M.loan[id])continue;if(k==='ride'&&M.ride)continue;
      h+=phBtn(`${PH_FAV[k].ic} ${PH_FAV[k].l}`,()=>{C.done[k]=1;callFavor(id,k)},{sub:k==='loan'?`About ${$(P.loan)}. They answer right away.`:'They answer right away.'})}
    h+=phBtn(C.lines.length>1?'📵 Hang up':'📵 Never mind',callEnd)}
  return h}
function callIncoming(r){const w=msgWho(r.id)||{ic:'🙂'},n=msgFirst(r.id);
  return `<div class="ph-call ph-ringing"><div class="ph-call-av">${w.ic}</div><b>${esc(n)} is calling…</b><span>Incoming call</span></div>`+
    phBtn('📞 Answer',()=>{const c=CL();c.ring=null;callLog({id:r.id,dir:'in',ans:true});callTime(1);
      const ask=(MSG().owe[r.id]||0)>0&&Math.random()<0.5;CALL_NOW={id:r.id,t:S.t,st:'on',lines:[`${esc(n)}: ${ask?'“Hey, could you help me with something? I need a hand carrying a few things. Half an hour, maybe more.”':pick(CALL_IN)}`],done:{},ask}},{cls:'primary'})+
    phBtn('📵 Decline',()=>{const c=CL();c.ring=null;callLog({id:r.id,dir:'missed',seen:true})},{sub:'They’ll try another time.'})}
function callRow(ic,title,sub,fn,extra){const i=PH_ACTS.push(fn)-1;return `<button class="ph-row" onclick="PHA(${i})"><span class="ph-av">${ic}</span><span style="flex:1"><b>${title}</b><span>${sub}</span></span>${extra||''}</button>`}
function callTabs(){const c=CL(),n=c.log.filter(e=>(e.dir==='missed'&&!e.seen)||(e.vm&&!e.heard)).length;
  const t=(k,l)=>{const i=PH_ACTS.push(()=>{CALL_TAB=k})-1;return `<button class="ph-tab${CALL_TAB===k?' on':''}" onclick="PHA(${i})">${l}</button>`};
  return `<div class="ph-tabs">${t('contacts','Contacts')}${t('recents','Recents'+(n?` (${n})`:''))}</div>`}
const CALL_AV_TXT={asleep:' · 💤 probably asleep',work:' · 💼 at work',school:' · 🏫 at school',busy:'',free:''};
function callView(){const c=CL();
  if(CALL_NOW&&(S.t-CALL_NOW.t>180||!msgWho(CALL_NOW.id)))CALL_NOW=null;   // a call left hanging when the phone went away
  if(CALL_NOW)return callScreen();
  const r=callRinging();if(r)return callIncoming(r);
  let h=msgOn()?'':phCard(PH().cut?'📵 <b>No service.</b> Pay the phone bill to make calls.':'📵 No service right now.','warn');
  h+=callTabs();
  if(CALL_TAB==='contacts'){const C=phoneContacts().filter(x=>msgTextable(x.id));
    if(!C.length)return h+phNote('No one to call yet. People you meet show up in 📒 Contacts.');
    h+=C.map(x=>callRow(x.ic,esc(x.n),`${x.how}${CALL_AV_TXT[phAvail(x.id)]||''}`,()=>{if(msgOn())callStart(x.id)},'<span class="ph-dial">📞</span>')).join('')}
  else{c.log.forEach(e=>{if(e.dir==='missed')e.seen=true});
    if(!c.log.length)return h+phNote('No calls yet.');
    h+=c.log.map(e=>{const w=msgWho(e.id)||{ic:'🙂'},nm=esc(msgFirst(e.id)),when=fmtAbs(e.t);
      const sub=e.dir==='missed'?`Missed call · ${when}`:e.dir==='in'?`Incoming · ${when}`:`Outgoing${e.ans?'':' · no answer'} · ${when}`;
      let row=callRow(w.ic,e.dir==='missed'?`<span style="color:#c0392b">${nm}</span>`:nm,sub,()=>{if(msgOn()&&msgTextable(e.id))callStart(e.id)},'<span class="ph-dial">📞</span>');
      if(e.vm)row+=`<div class="ph-vm">${e.heard?`<p>🎙️ ${e.vm}</p>`:phBtn('▶️ Play voicemail',()=>{e.heard=true;phoneUse(1)},{sub:'New voicemail'})}</div>`;
      return row}).join('')}
  return h}
definePhoneApp({id:'call',name:'Phone',ic:'📞',builtin:true,order:15,desc:'Call the people you know.',badge:callBadge,view:callView});
phoneContactActs(c=>msgTextable(c.id)?phBtn('📞 Call',()=>{if(!msgOn())return;phoneGo('call');callStart(c.id)},{dis:!msgOn()}):'');

// ---- they call you: every few days, someone close, during waking hours ----
const CALL_VM=['“Hey, it’s me. Nothing urgent, just wanted to hear your voice. Call me back.”','“Hi! Just checking in. Call when you can.”','“It’s me. Call me back when you get a second, okay?”'];
function callSchedule(c){c.next=S.t+Math.round((1.5+Math.random()*2.5)*1440)}
phoneOnTime(min=>{if(!S||S.over)return;const c=CL();
  if(min===0){if(c.ring){c.ring=null}if(c.next==null||c.next<S.t)callSchedule(c);return}
  if(c.ring&&S.t>c.ring.until){const r=c.ring;c.ring=null;const vm=Math.random()<0.7?pick(CALL_VM):null;callLog({id:r.id,t:r.t,dir:'missed',seen:false,vm,heard:false})}
  if(c.next==null){callSchedule(c);return}
  if(c.ring||S.t<c.next||!msgOn()||CALL_NOW)return;
  const m=tod();if(m<540||m>1260){if(m>1260)c.next=(day()+1)*1440+540+msgRnd(0,600);return}
  const C=phoneContacts().filter(x=>msgTextable(x.id)&&phAvail(x.id)==='free'&&msgCl(x.id)>=4);callSchedule(c);if(!C.length)return;
  const x=pick(C);c.ring={id:x.id,t:S.t,until:S.t+15};
  try{if(phoneCan())showTile('📞',`${msgFirst(x.id)} is calling`,'Open your 📱 phone to answer.','info')}catch(e){}});
// on the main screen while it rings
{const a0=actionsHere;actionsHere=function(){const a=a0.apply(this,arguments);if(!S||!S.ph||!S.ph.calls||!phoneOwned())return a;return phTry(()=>{const r=callRinging();
  if(r)a.unshift({ic:'📞',l:`${msgFirst(r.id)} is calling`,s:'Answer on your phone.',cat:'here',cls:'primary',fn:()=>phoneOpen('call')});return a},a)}}

// ---- ❓ Help ----
{const g0=phoneGuide;phoneGuide=function(){return g0.apply(this,arguments)+`<h3>📞 Phone</h3>
  <ul><li>Call anyone you can text. If they’re asleep, at work, in class or busy, it goes to voicemail: leave one and they text you back.</li>
  <li><b>💬 Talk a while</b> (15 minutes): stress down, and the same bonus as a good text, bigger, once a day per person. Calling Mom or Dad counts as the day’s 📞 Call home; in Growing Up, calling Grandma counts as the day’s Call Grandma.</li>
  <li>Ask a favor on a call and they answer right away: a ride across town, a small loan or help moving heavy stuff, from people who could plausibly do it.</li>
  <li>Close friends and family call you every few days. A call rings for 15 minutes; a missed one goes to <b>Recents</b>, often with a voicemail.</li>
  <li>Calls use battery: about 1% every 5 minutes.</li></ul>`}}
window.CALLS={CL:()=>CL(),start:callStart,now:()=>CALL_NOW,end:callEnd,chat:callChat,favor:callFavor,ring:id=>{CL().ring={id,t:S.t,until:S.t+15}}};
