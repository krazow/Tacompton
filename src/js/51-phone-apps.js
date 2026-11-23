// ---------------- 📱 phone: built-in apps (App Store, Clock, Contacts, Settings) and the first installables (Flashlight, Notes) ----------------
// See the API at the top of 50-phone.js. Small view helpers for every app file:
//   phCard(html,cls)  a card ('ok' green, 'warn' orange)    phNote(html)  small grey text    phSub(text)  a section heading
//   .ph-row / .ph-av / .ph-li / .ph-store / .ph-msg (them|me) / .ph-tabs+.ph-tab / .ph-call CSS classes are ready in style.css.
const phCard=(h,cls)=>`<div class="ph-card ${cls||''}">${h}</div>`;
const phNote=h=>`<p class="ph-note">${h}</p>`;
const phSub=t=>`<div class="ph-sub">${t}</div>`;

// ---- 🛍️ App Store (built in) ----
let PH_STORE_MSG=null;   // {h,t}: the last install/remove result, shown until game time moves on (not saved)
const phStoreMsg=h=>{PH_STORE_MSG={h,t:S.t}};
function phoneStoreApps(){return PHONE_APPS.filter(a=>!a.builtin&&phoneShown(a))}
function phoneStoreInstall(id){
  const a=phoneApp(id);if(!a)return false;
  if(phoneFree()<=0){phStoreMsg(`No room for ${a.name}: ${PHONE_SLOTS} of ${PHONE_SLOTS} slots used. Remove an app first.`);return false}
  if(!phoneNet()){phStoreMsg(PH().cut?'No service: pay the phone bill first.':'No signal.');return false}
  const t0=S.t;if(!phoneInstall(id)){phStoreMsg(`Couldn’t install ${a.name}.`);return false}
  const min=S.t-t0;phStoreMsg(`📲 ${a.ic} <b>${a.name}</b> installed in ${min} minute${min===1?'':'s'}.`);return true}
function phoneStoreRemove(id){const a=phoneApp(id);if(phoneUninstall(id))phStoreMsg(`🗑️ Removed ${a.name}. A slot is free.`)}
definePhoneApp({id:'store',name:'App Store',ic:'🛍️',builtin:true,order:90,desc:'Install up to 5 apps.',
  view(){
    const used=PH().apps.length,full=used>=PHONE_SLOTS,weak=phoneSignal()<=2,net=phoneNet();
    const M=PH_STORE_MSG&&PH_STORE_MSG.t===S.t?PH_STORE_MSG:null;let h=M?phCard(M.h,/^📲|^🗑️/.test(M.h)?'ok':'warn'):'';
    h+=phCard(!net?'📵 <b>No service.</b> Pay the phone bill to install apps.':full?`<b>${used} of ${PHONE_SLOTS} slots used</b>: remove an app to install another.`
      :`<b>${used} of ${PHONE_SLOTS} slots used.</b> ${weak?'Two bars out here: an install takes about 3 minutes.':'An install takes a minute.'}`,full||!net?'warn':'');
    const list=phoneStoreApps();if(!list.length)h+=phNote('Nothing in the store yet.');
    for(const a of list){const inst=PH().apps.includes(a.id);
      h+=`<div class="ph-store"><span class="ph-sic">${a.ic}</span><div class="ph-sinfo"><b>${a.name}</b><span>${a.desc}</span><small>${a.size}${inst?' · installed':''}</small></div><div class="ph-sbtns">`+
        (inst?phBtn('Open',()=>phoneGo(a.id),{cls:'primary'})+phBtn('Remove',()=>phoneStoreRemove(a.id))
          :phBtn('Install',()=>phoneStoreInstall(a.id),{cls:full?'':'primary',dis:full||!net,sub:full?'No free slot':!net?'No service':weak?'~3 min':'1 min'}))+`</div></div>`}
    return h}});

// ---- ⏰ Clock (built in): the morning alarm is your phone's ----
const PH_ALARMS_ADULT=[300,330,360,390,420,450,480,540,600],PH_ALARMS_GROW=[390,420,450,480,510,540];
function phoneSetAlarm(m){S.alarm=m;PH().clk=true;say(`⏰ Alarm set for ${fmt(m)}.`)}
definePhoneApp({id:'clock',name:'Clock',ic:'⏰',builtin:true,order:20,desc:'Your morning alarm.',
  view(){const P=PH(),g=isGrow(),o=g?PH_ALARMS_GROW:PH_ALARMS_ADULT,J=!g&&typeof job==='function'&&S.jobPicked?job():null;
    let h=`<div class="ph-big">${fmt(S.t)}</div><div style="text-align:center;color:var(--mute);margin-bottom:10px">${typeof longDate==='function'?longDate(day()):dayName(day())}</div>`;
    h+=phCard(`⏰ <b>Alarm: ${fmt(S.alarm)}</b>${J?`<br>${J.ic} Work starts at ${fmt(J.start)} on shift days.`:''}`);
    if(P.batt<=30)h+=phCard(`🔋 ${Math.round(P.batt)}%. Sleep at home and it charges overnight. A dead phone doesn’t ring.`,'warn');
    h+=phSub('Set the alarm');
    h+=o.map(m=>phBtn(`${m===S.alarm?'✅ ':''}${fmt(m)}`,()=>phoneSetAlarm(m),{cls:m===S.alarm?'primary':''})).join('');
    h+=phNote(g?'On school days Mom and Dad make sure you’re up.':'Once you set it yourself, there’s a small chance you sleep through the first alarm (the snooze gets you up 20 minutes later). No phone, or a dead one, means no alarm at all.');
    return h}});

// ---- 📒 Contacts (built in): everyone you've met, and how you know them ----
const PH_COWORKERS={
  hospital:[{n:'Rosa',ic:'🩺',how:'Charge nurse on your floor at Tacoma General'},{n:'Kev',ic:'🧤',how:'A CNA on your shifts. Always has gum.'}],
  cafe:[{n:'June',ic:'☕',how:'Owns the café. Trained you on the espresso machine.'},{n:'Theo',ic:'🥐',how:'Opens with you most mornings'}],
  kitchen:[{n:'Odessa',ic:'🍳',how:'Owns Odessa’s Table and writes the schedule'},{n:'Big Lou',ic:'🔥',how:'On the grill next to yours'}],
};
const PH_REL_WHERE={link:'Met on the Link',dome:'Met at a game at the Dome',market:'Met at the market',party:'Met at a party',work:'Met through work',app:'Met online'};
const phFirst=s=>String(s.d||'').split(/(?<=[.!?])\s/)[0];
function phoneContacts(){if(!S)return [];const c=[],g=isGrow(),add=(grp,id,n,ic,how,d)=>c.push({grp,id,n,ic,how,d:d||''});
  if(g){add('Family','fam:mom','Mom','👩','Your mom');add('Family','fam:dad','Dad','👨','Your dad');add('Family','fam:nia','Nia','🧸','Your little sister');add('Family','fam:grandma','Grandma','👵','Back home, and she wants to hear everything');
    if(typeof KIDS!=='undefined')KIDS.filter(k=>typeof gMet==='function'&&gMet(k.id)).forEach(k=>{const p=L[k.at[0]];add('Friends','k:'+k.id,k.n,k.ic,`From ${p?p.name:'around the hill'}${typeof gBest==='function'&&gBest()&&gBest().id===k.id?' · your best friend':''}`,k.d)});
  }else{
    const G=S.life&&S.life.grow;
    if(G){add('Family','fam:mom','Mom','👩','Your mom, still in the green fourplex');add('Family','fam:dad','Dad','👨','Your dad');add('Family','fam:nia','Nia','🧸','Your little sister')}
    else add('Family','fam:home','Home','🏠','Mom and Dad, back home');
    if(G&&G.kids)G.kids.forEach((k,i)=>add('Friends','old:'+i,k.n,'🎓','A friend from school'));
    if(S.job&&S.jobPicked!==false){const J=typeof job==='function'?job():null,W=PH_COWORKERS[S.job]||(J?[{n:'Your manager',ic:J.ic,how:`At ${J.place}`}]:[]);
      W.forEach((w,i)=>add('Work','w:'+i,w.n,w.ic,w.how))}
    if(typeof NEIGHBORS!=='undefined')NEIGHBORS.filter(x=>S.met&&S.met[x.id]).forEach(x=>{const h=typeof hoodOf==='function'?hoodOf(x.at[0]):null;
      add('Neighbors','n:'+x.id,x.n,x.ic,`${h?'From '+hoodName(h):'A neighbor on Hilltop'}`,x.d)});
    if(typeof relActive==='function'&&relActive()&&S.rel&&S.rel.people)Object.keys(S.rel.people).forEach(id=>{const p=relDef(id),st=S.rel.people[id];if(!p)return;
      add('People you’ve met','r:'+id,p.n.split(' ')[0],'🙂',PH_REL_WHERE[st.where]||'Met around town')});
  }
  return c}
definePhoneApp({id:'contacts',name:'Contacts',ic:'📒',builtin:true,order:30,desc:'Everyone you know.',
  view(arg){const C=phoneContacts();
    if(arg){const x=C.find(y=>y.id===arg);if(!x)return phNote('Not in your contacts.');
      let h=`<div class="ph-call"><div class="ph-call-av">${x.ic}</div><b>${esc(x.n)}</b><span>${x.how}</span></div>`;
      if(x.d)h+=phCard(x.d);
      h+=PH_CONTACT_ACTS.map(f=>phTry(()=>f(x)||'','')).join('');
      return h}
    if(!C.length)return phNote('No contacts yet. Get out and meet people.');
    let h='',grp=null;
    for(const x of C){if(x.grp!==grp){grp=x.grp;h+=phSub(grp)}
      h+=`<button class="ph-row" onclick="phoneGo('contacts','${x.id}')"><span class="ph-av">${x.ic}</span><span><b>${esc(x.n)}</b><span>${x.how}</span></span></button>`}
    return h+phNote(`${C.length} contact${C.length===1?'':'s'}.`)}});

// ---- ⚙️ Settings (built in): battery, the phone itself, the plan and the bill ----
definePhoneApp({id:'settings',name:'Settings',ic:'⚙️',builtin:true,order:95,desc:'Battery, phone and plan.',
  view(){const P=PH(),T=phoneTier(),g=isGrow();
    let h=phCard(`🔋 <b>Battery ${Math.round(P.batt)}%</b><br>${T.n}: ${T.d}`);
    if(phoneOutletHere()&&P.batt<95)h+=phBtn('🔌 Plug it in here',()=>{pass(30);phoneCharge(50);say(`🔌 Half an hour on the charger: ${Math.round(PH().batt)}%.`)},{sub:'30 min. Battery +50%.'});
    h+=phSub('Signal');h+=phCard(`${'▮'.repeat(phoneSignal())} ${phoneSignal()} of 4 bars${phoneSignal()<=2?' · the firs and the ravines eat signal':''}.`);
    h+=phSub('Plan');
    if(g)h+=phCard('👪 On the family plan. Mom and Dad pay the bill.');
    else if(P.plan){const pl=PHONE_PLANS[P.plan];
      h+=phCard(`📶 <b>${pl.n}</b>: ${$(phoneBillAmt())} on the 1st of every month.<br>${pl.d}`,P.cut?'warn':'');
      if(P.cut)h+=phBtn(`💳 Pay the phone bill: ${$(P.owe)}`,()=>phonePayBill(),{cls:'primary',dis:S.money<P.owe,sub:S.money<P.owe?'Not enough cash.':'Service back on right away.'});
      const o=P.plan==='plan'?'prepaid':'plan';h+=phBtn(`Switch to ${PHONE_PLANS[o].n.toLowerCase()} (${$(rp(PHONE_PLANS[o].price))} a month)`,()=>{P.plan=o;say(`📶 Switched to ${PHONE_PLANS[o].n.toLowerCase()}, from the next bill.`)},{sub:'From the next bill on the 1st.',dis:P.cut})}
    return h}});

// ---- 🔦 Flashlight (install) ----
definePhoneApp({id:'flash',name:'Flashlight',ic:'🔦',order:60,size:'2 MB',desc:'A light when the power goes out. Uses the battery.',
  view(){const on=PH_FLASH===S.t;
    return `<div class="ph-card ${on?'ph-flash':''}" style="text-align:center;font-size:${on?48:36}px;padding:24px 0">${on?'💡':'🔦'}</div>`+
      phBtn(on?'Turn it off':'Turn it on',()=>{if(on){PH_FLASH=null;return}PH_FLASH=S.t;phoneUse(5)},{cls:on?'':'primary',sub:on?'':'Battery −5%.'})+
      phNote('When the power goes out at home, this is your flashlight: no trip to the corner market, as long as the battery lasts.')}});
let PH_FLASH=null;   // on for the moment you turned it on (not saved)

// ---- 📝 Notes (install): the week's priorities, the same list as My priorities on the To-do tab ----
function phNoteAdd(){const el=document.getElementById('phNoteIn'),t=String(el?el.value:'').replace(/\s+/g,' ').trim().slice(0,PRIO_LEN);
  if(!t||S.prios.length>=PRIO_MAX)return;S.prios.push({t,done:false})}
definePhoneApp({id:'notes',name:'Notes',ic:'📝',order:70,size:'4 MB',desc:'A short to-do list of the week’s priorities.',
  view(){const P=S.prios;let h=phNote('The same list as My priorities on the To-do tab. Tap one to check it off.');
    if(!P.length)h+=phCard('Nothing on the list. What matters this week?');
    P.forEach((q,i)=>{h+=phBtn(`${q.done?'✅':'⬜'} ${esc(q.t)}`,()=>{q.done=!q.done},{cls:q.done?'done':''})});
    if(P.length<PRIO_MAX)h+=`<div class="ph-note-in"><input id="phNoteIn" maxlength="${PRIO_LEN}" placeholder="Add a priority…" autocomplete="off" aria-label="New priority" onkeydown="if(event.key==='Enter'){event.preventDefault();document.getElementById('phNoteAdd').click()}">${phBtn('Add',phNoteAdd,{id:'phNoteAdd',cls:'primary'})}</div>`;
    if(P.some(q=>q.done))h+=phBtn('Clear checked-off items',()=>{S.prios=S.prios.filter(q=>!q.done)});
    return h}});
