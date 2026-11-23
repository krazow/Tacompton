// ============================================================
//  TACOMPTON · SKIP TO 18: ⚙️ Settings → 🎮 Game options → ⏩ Skip to 18 (Growing Up, the longer games, under 18).
//  It uses the life engine's own time skip (lifeSimulate, LIFE_HOOKS.skip, lifeRound in 10-life.js): two or three quick
//  choices about how the years go (each one runs a stretch of the skip like the between-week choice), one summary,
//  then graduation, the path choice and your own place, exactly as normal play reaches them at 18 (lifeGraduation).
//    skip18Why()        → null when it's possible now, otherwise the reason it's grayed out
//    skip18Start(after) → the confirm sheet, then the skip; after() runs once you're 18 in your own place
//                         (37-relationships.js uses it to turn 18+ mode on: relSetOn); a string it returns goes in the log
// ============================================================

// the day you turn 18, and the key week you carry on in (the first one that still has days after that birthday)
function skip18Plan(){
  if(!S||!S.keyWeeks||!S.birthday)return null;
  const bd=lifeBday(S,18);if(bd<=day())return null;
  const j=S.keyWeeks.findIndex((k,i)=>i>=S.kwi&&k.end>bd);
  return j<0?null:{bd,j,from:day()+1};
}
function skip18Why(){
  if(!S||S.over)return 'No game is running.';
  if(!lifeLong())return 'Quick play is one short stretch. Skip to 18 is for the longer games.';
  if(!isGrow()||S.age>=18||(S.life&&S.life.graduated))return `You’re ${S.age}: already 18 or older.`;
  if(!skip18Plan())return `This game ends ${fullDate(lifeEndDay(S))}, before you turn 18. Lengthen it to 🌳 Lifetime first (📏 Game length).`;
  return null;
}
// the age on day d (birthdays between today and d)
function skip18AgeAt(d){let a=S.age;while(a<18&&lifeBday(S,a+1)<=d)a++;return a}
function skip18Btn(){const why=skip18Why(),p=why?null:skip18Plan();
  return {l:'⏩ Skip to 18',s:why||`Fast-forward to your 18th birthday, ${fullDate(p.bd)}: a few quick questions, one summary, then graduation.`,dis:!!why,fn:()=>skip18Start()}}
function skip18Start(after,back){
  back=back||(()=>gameOptionsModal());
  const why=skip18Why();if(why)return modal('⏩ Skip to 18',`<p>${why}</p>`,[{l:'Back',fn:back}]);
  const p=skip18Plan(),n=S.keyWeeks.slice(S.kwi+1,p.j).length,yrs=18-S.age;
  modal('⏩ Skip to 18?',`<p>Fast-forward from age <b>${S.age}</b> to your <b>18th birthday</b>, ${fullDate(p.bd)}: about ${yrs} year${yrs===1?'':'s'}${n?` and ${n} key week${n===1?'':'s'}`:''} skipped.</p>
    <p>${p.bd-p.from>=365?'Three':'Two'} quick questions about how those years go, one summary of what changed, then graduation and what comes next, the same as playing there. You can’t undo it.</p>`,
    [{l:'⏩ Skip to 18',s:'Answer a few questions, then on to graduation.',np:true,fn:()=>skip18Ask(p,[],after)},{l:'Back',fn:back}]);
}
// the stretches of the skip: three for a year or more, otherwise two
function skip18Parts(p){const n=p.bd-p.from>=365?3:2,len=p.bd-p.from+1,out=[];
  for(let i=0;i<n;i++){const a=p.from+Math.floor(len*i/n),b=i===n-1?p.bd:p.from+Math.floor(len*(i+1)/n)-1;out.push({a,b})}return out}
function skip18Opts(age1){
  return [{k:'study',l:'📚 Study hard',s:'Grades up. A little less fun, a little less time with friends.'},
    ...(age1>=16?[{k:'work',l:'🧾 Work part-time',s:'Weekend shifts from 16: money up, grades a little down.'}]:[]),
    {k:'home',l:'🏠 Family first',s:'Chores, dinners, Nia. Family up, and a few extra dollars from chores.'},
    {k:'friends',l:'🤝 Friends',s:'Friends and mood up. Grades and home slip a little.'}];
}
function skip18Ask(p,picks,after){
  const parts=skip18Parts(p),i=picks.length;
  if(i>=parts.length)return skip18Run(p,parts,picks,after);
  const x=parts[i],a0=skip18AgeAt(x.a),a1=skip18AgeAt(x.b),ages=a0===a1?`age ${a0}`:`ages ${a0} to ${a1}`;
  const when=['The first stretch','The middle years','The last stretch'][parts.length===2&&i===1?2:i];
  modal(`⏩ Skip to 18 · ${i+1} of ${parts.length}`,`<p><b>${when}</b>, ${ages}: ${fullDate(x.a)} to ${fullDate(x.b)}.</p><p>How do those years mostly go?</p>`,
    skip18Opts(a1).map(c=>({l:c.l,s:c.s,np:true,fn:()=>skip18Ask(p,picks.concat([c]),after)})).concat([{l:'Cancel',s:'Nothing is skipped.',fn:()=>gameOptionsModal()}]));
}
function skip18Run(p,parts,picks,after){
  closeModals();
  const kw=lifeKw(),m0=S.life.moments.length,age0=S.age,cash0=S.money;
  // the week you were in counts for the score up to here, like the end of a key week (lifeWeekEnd)
  S.life.snaps=S.life.snaps.filter(x=>x.kw!==S.kwi);S.life.snaps.push({kw:S.kwi,start:kw.start,score:lifeWeekScore(),mode:MODE});
  if(S.grades==null)S.grades=clamp(40+Math.round(gReady()*0.5),0,100);
  lifeHook('weekEnd',kw);
  const before=lifeSnapRows();let notes=[];
  parts.forEach((x,i)=>{const c=picks[i];
    // years of school: you get to know a classmate or two (more if you see friends), then the days run as usual
    const nw=KIDS.filter(k=>!gMet(k.id)).slice(0,c.k==='friends'?2:1);nw.forEach(k=>gFriend(k.id,c.k==='friends'?6:3));
    if(c.k==='friends')KIDS.filter(k=>gMet(k.id)&&!nw.includes(k)).forEach(k=>gFriend(k.id,3));
    if(nw.length)notes.push(`🤝 You got to know ${nw.map(k=>k.n).join(' and ')}.`);
    const nt=lifeSimulate(x.a,x.b,c.k);S.life.lastSkip={from:x.a,to:x.b,choice:c.k};lifeHook('skip',x.a,x.b,c.k,nt);notes=notes.concat(nt)});
  lifeRound();
  if(typeof gBest==='function'){const b=gBest();if(b&&!S.life.best){S.life.best=b.id;lifeMoment('🤝',`Became best friends with ${b.n}.`)}}
  // the key weeks in between were skipped: they play no days
  for(let i=S.kwi+1;i<p.j;i++){const k=S.keyWeeks[i];k.from=k.start;k.to=k.start-1;k.skipped=true}
  S.life.skip18={from:p.from,to:p.bd,age:age0,picks:picks.map(c=>c.k)};
  lifeMoment('⏩',`Skipped ahead from ${age0} to 18: ${picks.map(c=>c.l.replace(/^\S+\s/,'').toLowerCase()).join(', then ')}.`);
  S.cur=p.bd;S.t=p.bd*1440+1200;S.loc='home';
  // one summary: totals, not a line per stretch
  let sd=0;notes=notes.filter(n=>{const m=/^🏫 (\d+) school days?/.exec(n);if(m){sd+=+m[1];return false}return !/^💵 /.test(n)&&!/^🎂 You turn/.test(n)});
  const after0=lifeSnapRows();
  const rows=after0.map(([k,v,f])=>{const b=before.find(x=>x[0]===k),bv=b?b[1]:v,dv=Math.round(v-bv),fm=f||(x=>Math.round(x));
    const col=dv===0?'var(--mute)':dv>0?'var(--good,#2f8f6a)':'var(--bad,#c0392b)';
    return `<div class="kv"><span>${k}</span><b>${fm(bv)} → ${fm(v)} <small style="color:${col}">${dv===0?'':(dv>0?'+':'−')+(f===$?$(Math.abs(dv)):Math.abs(dv))}</small></b></div>`}).join('');
  const kids=KIDS.filter(x=>gMet(x.id)).sort((a,b)=>gF(b.id)-gF(a.id)).slice(0,3),dm=Math.round(S.money-cash0);
  const mom=S.life.moments.slice(m0).filter(m=>m.ic!=='⏩').map(m=>`<div class="todo"><span class="ck">${m.ic}</span><div><b>Age ${m.age}</b><span>${m.t}</span></div></div>`).join('');
  const body=`<p>${fullDate(p.from)} to ${fullDate(p.bd)}: age ${age0} to 18. You chose ${picks.map(c=>`<b>${c.l.replace(/^\S+\s/,'')}</b>`).join(', then ')}.</p>
    <div class="sect">What changed</div>${rows}
    <div class="kv"><span>🏫 School</span><b>${sd} school day${sd===1?'':'s'} · ${gSchoolShort()} · grades ${S.grades}</b></div>
    <div class="kv"><span>💵 Money</span><b>${dm>=0?'saved':'spent down'} ${$(Math.abs(dm))}</b></div>
    ${kids.length?`<div class="kv"><span>🤝 Closest friends</span><b>${kids.map(x=>x.n).join(', ')}</b></div>`:''}
    ${mom?`<div class="sect">Milestones</div>${mom}`:''}
    ${notes.length?`<div class="sect">Along the way</div>${notes.slice(-10).map(n=>`<p>${n}</p>`).join('')}`:''}`;
  saveGame();
  modal('📋 The years go by',body,[{l:'🎓 On to graduation',fn:()=>skip18Land(p,after)}],true);
}
// at 18: graduation and the path choice (lifeGraduation), your own place, then the rest of that key week as an adult
function skip18Land(p,after){
  const k=S.keyWeeks[p.j];
  if(k.start<=p.bd){k.from=p.bd+1;k.to=k.end}
  const go=()=>{const msg=after?after():null;lifeEnter(p.j);if(msg){say(msg);render()}saveGame()};
  if(isGrow()&&!S.life.graduated)return lifeGraduation(go);
  go();
}
window.skip18Start=skip18Start;window.skip18Why=skip18Why;

// the Game options button, right under 🎒 Mode
{const gm=gameOptionsModal;gameOptionsModal=function(){if(!S||S.over)return gm();const m0=modal;
  modal=function(t,b,btns,nc){if(t==='🎮 Game options'&&Array.isArray(btns)){const i=btns.findIndex(x=>/^🎒/.test(x.l));btns.splice(i<0?btns.length-2:i+1,0,skip18Btn())}return m0(t,b,btns,nc)};
  try{return gm()}finally{modal=m0}}}
window.gameOptionsModal=gameOptionsModal;
