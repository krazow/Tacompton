// ============================================================
//  TACOMPTON · TURNING 18 UNLOCKS THE ADULT GAME. The owner's rule: a game started as a kid has, at 18, exactly what a game
//  started at 18 has. Every adult feature is gated on the current age and mode (isGrow() is false after the move into your own
//  place; S.age is the age today), never on the starting age, so this file only closes the gaps at the turn:
//    · Graduation comes on the 18th birthday itself when it's played (right after that morning's report), instead of at the
//      end of that key week: the ceremony and the party take the day, the key week ends that night, and the time skip comes
//      next (the Army's basic training, college, work), as at the end of any week. Time skips and ⏩ Skip to 18 already
//      graduate at 18 (10-life.js). A shift on graduation day is excused.
//    · lifeHandoff (the keys to your own place): the driver's license an 18-year-old start has (38-car.js), and the
//      refurbished phone an 18-year-old start has instead of Mom's old one (50-phone.js). Growing Up's phone rules end in
//      57-phone-grow.js; 18+ mode follows 37-relationships.js relAt18() (on as asked, or offered with one tap, never silently).
//    · One "🎉 You're 18" sheet, the first time no other sheet is open after the keys (after the morning report, after the
//      Skip to 18 summary): what just unlocked, short and plain. S.life.u18 = 'due' | 'shown'.
//  Kid content stays off after 18: it is all behind isGrow() and S.age<18.
// ============================================================
(function(){
const U18_APPS=['rides','bank','jobs','groc','health','club'];
let GQ=false;   // graduation is waiting behind the morning report
const kidSave=()=>!!S&&!!S.life&&(S.startAge||18)<18;

// ---- graduation on the 18th birthday ----
function u18GradDue(){return !!S&&!S.over&&lifeLong()&&isGrow()&&(S.age||0)>=18&&!!S.life&&!S.life.graduated}
{const sd=startDay;startDay=function(){const r=sd.apply(this,arguments);
  try{if(u18GradDue()&&!GQ){GQ=true;   // modal() waits behind the morning report while it's being put together
    const d=day();
    lifeGraduation(()=>{GQ=false;S.life.gradDay=d;S.loc='home';
      // the ceremony and the party take the day; the key week ends tonight and the time skip comes next, as at the end of a week
      const kw=lifeKw();if(kw){const r0=lifeRange(kw);kw.from=r0.from;kw.to=Math.max(r0.from,d)}
      S.t=Math.max(S.t,d*1440+1320);
      say('🎓 Graduation day: the ceremony in the Hilltop High gym, then the whole family at the party until dark. Tonight you sleep in your own place.');
      saveGame();endDay('home')})}}
  catch(e){console.error(e)}return r}}
// work starts the day after graduation
{const on=onNight;onNight=function(where,notes,d){
  try{if(!isGrow()&&S.life&&S.life.gradDay===d&&isShiftDay(d)&&!(d in S.worked))S.worked[d]=0}catch(e){console.error(e)}
  return on.apply(this,arguments)}}

// ---- the keys: what an 18-year-old start already has ----
{const lh=lifeHandoff;lifeHandoff=function(){const r=lh.apply(this,arguments);
  try{if(S&&S.life){
    if(S.car&&!S.car.lic)S.car.lic=true;        // no S.car yet: 38-car.js CS() starts it licensed once you've graduated
    if(S.ph&&S.ph.tier==='old')S.ph.tier='refurb';
    if(!S.life.u18)S.life.u18='due'}}catch(e){console.error(e)}
  return r}}

// ---- the 🎉 You're 18 sheet ----
const li=(ic,t)=>`<div class="todo"><span class="ck">${ic}</span><div><span>${t}</span></div></div>`;
function u18List(){const out=[],J=S.jobPicked&&JOBS[S.job]?job():null,mil=typeof milActive==='function'&&milActive();
  out.push(li('🏠',mil?'Your own room: a barracks room on JBLM.':`Your own place. Rent ${$(S.rent.amt)} on the 1st: pay it at home${phoneShown(phoneApp('bank'))?' or in 🏦 Bank':''}.`));
  if(J)out.push(li(J.ic,mil?`The Army: ${J.role}. Promotions come on a schedule.`:`Work: ${J.role}, ${J.place}${S.life.parttime?' (part-time, with school)':''}. Raises and promotions at your reviews${lifeLong()?', and new jobs in 💼 Jobs on your phone':''}.`));
  if(lifeLong()&&!mil)out.push(li('🚗','Your driver’s license, and a used car: 🔑 Shop for a used car at home.'));
  const apps=U18_APPS.map(phoneApp).filter(a=>a&&phoneShown(a));
  if(apps.length)out.push(li('📱',`Your own phone and plan (pick one the next time you open it), and the adult apps in 🛍️ App Store: ${apps.map(a=>`${a.ic} ${a.name}`).join(', ')}.`));
  else out.push(li('📱','The phone and its bill are yours now.'));
  if(typeof countyOn==='function')try{if(countyOn())out.push(li('🗺️','Trips around Pierce County, on your own.'))}catch(e){}
  if(typeof priceOn==='function'&&priceOn())out.push(li('🛒','Everyday prices rise a little every January now, and you pay them.'));
  out.push(li('🕰️','No curfew and no phone rules. Your choices are your own, and so is what comes of them.'));
  return out.join('');
}
function u18Sheet(){
  if(!S||!S.life)return;S.life.u18='shown';
  const R=typeof relAt18==='function'?relAt18(()=>u18Sheet()):null;
  modal('🎉 You’re 18',`<p>Everything a grown-up on Hilltop has is open to you now.</p>${u18List()}${R&&R.line?`<p style="font-size:13px;color:var(--mute)">${R.line}</p>`:''}`,
    [{l:'Got it',fn:()=>{}}].concat(R?R.btns:[]));
  saveGame();
}
{const r0=render;render=function(){const r=r0.apply(this,arguments);
  try{if(S&&!S.over&&S.life&&S.life.u18==='due'&&!isGrow()&&!DIGEST&&!document.getElementById('mbg')&&!document.querySelector('.title,.end'))setTimeout(()=>{
    if(S&&!S.over&&S.life&&S.life.u18==='due'&&!document.getElementById('mbg'))u18Sheet()},0)}catch(e){console.error(e)}
  return r}}
window.u18Sheet=u18Sheet;window.u18List=u18List;window.u18KidSave=kidSave;
})();
