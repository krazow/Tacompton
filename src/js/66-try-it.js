// ============================================================
//  TACOMPTON · 🧪 TRY IT: the short teaser (internal length key 'quick').
//  Two weeks at 18, or Growing Up's first week (its chapter 1) at 12 and 15. No birthdays, no time skips, always 2026.
//  The New game sheet (10-life.js lifeStartModal) offers it apart from the lengths. This file adds:
//    the HUD tag "🧪 Trying it out: N days left", the end screen's invitation ("Liked it? Start a new life",
//    which opens the New game sheet with the same age), and "Play again" keeping the teaser's own age.
// ============================================================
const tryOn=()=>typeof S!=='undefined'&&!!S&&S.length==='quick';
function tryDaysLeft(){return Math.max(0,GAME.days-day())}
function tryTag(){const n=tryDaysLeft();return `<span class="try-tag">🧪 Trying it out: ${n<=1?'last day':`${n} days left`}</span>`}
{const hd=hudDay;hudDay=function(d){const t=hd(d);return tryOn()&&!S.over?`${t} ${tryTag()}`:t}}

// the invitation at the end of the teaser (won or lost)
function tryInvite(){
  const e=document.querySelector('.end');if(!e||e.querySelector('#tryNewLife'))return;
  const a=(S&&S.startAge)||18;
  e.insertAdjacentHTML('beforeend',`<div class="try-end"><p style="margin:0 0 8px"><b>🧪 That was a taste.</b> A new life plays the same way for six months, a year, two years or a whole lifetime: birthdays, school, work, rent and the years in between.</p>
    <button id="tryNewLife" class="big" style="width:100%" onclick="tryNewLife(${a})">🌱 Liked it? Start a new life</button></div>`);
}
{const es=endScreen;endScreen=function(h1,sub,lost){const t=tryOn();es(h1,sub,lost);if(t)tryInvite()}}

// "Play again" on the teaser's end screen: the teaser again, at the same age
{const sng=window.startNewGame;window.startNewGame=()=>{
  if(tryOn()&&S.over&&document.querySelector('.end')&&typeof lifeStartWith==='function')
    return lifeStartWith({length:'quick',startAge:S.startAge||18,startYear:2026,birthday:lifeRandBirthday()});
  return sng()}}
