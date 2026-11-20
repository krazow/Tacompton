// ============================================================
//  TACOMPTON: the Help sheet ("❓ Help!" on the title screen, ⚙️ Settings → Help; 08-settings.js calls helpModal()).
//  One bottom sheet: a table of contents (tap a topic to jump to it), then one short section per topic, in the order a new
//  player meets things. Each section is [icon, title, html, anchor]: a one-line summary (.help-sum), then a few bullets.
//  Works before a game exists and mid-game. Numbers come from the game's own constants where they exist.
//  Write for players: short sentences, plain words, no code terms.
// ============================================================
const HELP_W=()=>typeof SCORE_W!=='undefined'?SCORE_W:{community:15,standing:8,stress:5,shift:60};
const HELP_CUTS=()=>typeof GRADE_CUTS!=='undefined'?GRADE_CUTS:[3300,2500,1800,1100];
const HELP_RENT=()=>typeof S!=='undefined'&&S&&S.rent?S.rent.amt:1150;
const HELP=[
  ['🧭','Getting started',`<p class="help-sum">You just moved to <b>Hilltop</b> in Tacoma. Get through your first <b>two weeks</b>, Monday Aug 3 to Sunday Aug 16, 2026.</p><ul>
    <li>On day one you pick your job. You keep it the whole two weeks.</li>
    <li>Time moves only when you act. Tap an action on the <b>🧭 Here</b> tab, or open <b>Go somewhere</b> to walk across the hill.</li>
    <li><b>Energy</b> drops through the day and with every shift. <b>Go to bed</b> at home to get most of it back. Stay up past midnight and you wake up on the couch, tired.</li>
    <li>The top bar shows cash, energy, stress, the meals in your fridge and how work feels about you (Job).</li>
    <li>It ends early if your <b>job hits 0</b> (you’re let go), your <b>stress hits 100</b> (burnout), or <b>rent isn’t paid</b> by Sunday night, Aug 16.</li></ul>`,'start'],
  ['🗺️','Getting around Hilltop',`<p class="help-sum">Six places, all a short walk apart (4 to 14 minutes).</p><ul>
    <li><b>Your apartment</b>: bed, rest, cook, call home, unpack, pay rent.</li>
    <li><b>MLK Jr Way</b>: the corner market (groceries, 7 AM–10 PM), the teriyaki spot, the barbershop, the murals and the people on the corner.</li>
    <li><b>Work</b>: the hospital, the café or the kitchen, depending on the job you took.</li>
    <li><b>Hilltop Link: St Joseph</b>: the T Line stop. Riding is free, and it’s the quickest way to work.</li>
    <li><b>People’s Center &amp; Park</b>: the pool, community programs and the evening pickup game (about 5 to 8:30 PM).</li>
    <li><b>The overlook</b>: a bench with Commencement Bay and Mount Rainier. Come at sunset.</li></ul>`,'places'],
  ['💼','Your job',`<p class="help-sum">Show up on time and work treats you well. Miss shifts and it doesn’t.</p><ul>
    <li><b>🏥 CNA at Tacoma General:</b> 7:00 AM–3:30 PM, Monday to Friday. The best pay, the hardest days.</li>
    <li><b>☕ Barista at a Hilltop café:</b> 6:30 AM–2:30 PM, Monday to Friday. Less pay, plus tips.</li>
    <li><b>🍳 Line cook at a soul-food spot on MLK:</b> 2:00–10:00 PM, Wednesday to Sunday. A staff meal covers dinner on shift nights.</li>
    <li>Go to work and tap <b>Work your shift</b>: the clock jumps to the end of the shift and you get paid.</li>
    <li>Late means less pay and a hit to <b>Job</b>. A missed shift is a big hit. At 0 you’re let go.</li>
    <li>On a day off, work may offer <b>extra hours</b> if they count on you (Job 50 or more).</li></ul>`,'job'],
  ['🧾','Rent, food and money',`<p class="help-sum">Rent is the big one. Food is the everyday one.</p><ul>
    <li>Rent is <b>${typeof $==='function'?$(HELP_RENT()):'$1,150'}</b>, due by the end of <b>Sunday, Aug 16</b>. Pay it at home. Paying in the first week takes a weight off.</li>
    <li>If it’s still unpaid on the last night and you have the money, you pay it at the last minute. If you don’t have it, you lose the apartment.</li>
    <li>You eat <b>one meal from the fridge</b> every night. With an empty fridge you go to bed hungry: more stress, less sleep.</li>
    <li>The corner market sells 4 meals of groceries. A plate at the teriyaki spot is a treat, not dinner.</li>
    <li>A couple of bills come due along the way: the internet hookup and the power bill.</li></ul>`,'money'],
  ['😣','Energy and stress',`<p class="help-sum">Work wears you down. The neighborhood picks you back up.</p><ul>
    <li><b>Energy</b> goes down while you’re awake and with every shift. Sleep, rest, good food and a cold drink bring it back.</li>
    <li><b>Stress</b> goes up with work, being late, hunger and money worries. High is bad: at <b>100</b> you burn out.</li>
    <li>Bring it down with a swim at People’s, the bench at the overlook, a sunset, a call home, a Link ride, the murals, or a cut at the barbershop.</li></ul>`,'stress'],
  ['🤝','Neighbors and community',`<p class="help-sum">Hilltop is a neighborhood that notices who shows up.</p><ul>
    <li><b>Community</b> (0–100) grows when you talk on the corner, play pickup, help out at People’s, go to the street fair and say yes when a neighbor waves you over.</li>
    <li>There are ten neighbors to meet. The <b>🤝 Neighbors</b> tab lists who you know.</li>
    <li>The <b>Hilltop Street Fair</b> is <b>Saturday, Aug 8</b>, on MLK, 10 AM to 6 PM.</li>
    <li>Things happen: the mountain comes out, a barbecue two doors down, a mural going up, a lost dog, the choir on Sunday. Good days and bad show up in the <b>☀️ morning report</b>, as small tiles and in the 📜 Log.</li></ul>`,'hood'],
  ['🏆','Score and grades',`<p class="help-sum">The score adds up how your two weeks went.</p><ul>
    ${(w=>`<li><b>Score:</b> cash + community × ${w.community} + job × ${w.standing} − stress × ${w.stress} + shifts × ${w.shift}, plus bonuses for the street fair, rent paid in the first week, every box unpacked and every neighbor met. The end screen shows every line.</li>`)(HELP_W())}
    ${(c=>`<li><b>Grades:</b> A ${grp(c[0])}, B ${grp(c[1])}, C ${grp(c[2])}, D ${grp(c[3])}, F below. Two weeks that end early are an F.</li>`)(HELP_CUTS())}
    <li>Difficulty never changes the score or the cutoffs, only the game: starting savings, prices and luck.</li></ul>`,'score'],
  ['⚙️','Settings',`<p class="help-sum">Make the game look, sound and pop up the way you like in <b>⚙️ Settings</b>.</p><ul>
    <li><b>🔔 Event pop-ups</b> are off: events show as tiles and log lines. Turn them on for an OK pop-up each. The morning report always shows.</li>
    <li><b>♿ Accessibility:</b> bigger text, high contrast and reduce motion. Also: 💡 tips, 🔊 sound and three 💾 save slots.</li>
    <li>On a computer, number keys press buttons, a tab’s first letter opens it, <b>Esc</b> closes a pop-up and <b>?</b> lists the shortcuts.</li></ul>`,'settings'],
  ['💡','Tips for a good two weeks',`<p class="help-sum">A few habits that pay.</p><ul>
    <li>Set the alarm for your shift and get to bed before midnight.</li>
    <li>Buy groceries before the fridge is empty.</li>
    <li>Pay rent as soon as you have it.</li>
    <li>Do one thing for yourself every day.</li>
    <li>Say yes to the neighbors.</li></ul>`,'tips'],
  ['📲','Install the app and play offline',`<p class="help-sum">Install Tacompton on your phone or computer and it plays like an app, even with no signal.</p><ul>
    <li>Tap <b>Install</b> in the bar at the top of the title screen, or <b>📲 Install app</b>. On Android, Chrome and Edge your browser asks to install; other browsers show their menu steps.</li>
    <li>On an iPhone or iPad it opens <a href="install/ios.html">a short how-to</a>: in Safari, tap Share, then <b>Add to Home Screen</b>, then <b>Add</b>.</li>
    <li>Open it once from the new icon while online. After that it plays offline.</li>
    <li>Use <b>🔁 Transfer a saved game</b> to move a game to another device.</li></ul>`,'install'],
  ['💬','Feedback',`<p class="help-sum">Ideas, bugs, or something about Hilltop we got wrong? Tell the developer.</p><ul>
    <li>Tap <b>Send feedback</b> below, on the title screen or in ⚙️ Settings.</li>
    <li>Add your email if you’d like a reply. If you’re offline, it’s sent the next time you’re online.</li>
    <li>Wondering what changed in an update? <button class="linkbtn" onclick="whatsNewModal({back:helpModal})">🆕 What’s new</button> lists every update, newest first.</li></ul>`,'feedback'],
];
const helpId=k=>'help-'+k;
// tap a contents link: scroll the sheet to that section and move focus to its heading (keyboard and screen readers follow along)
window.helpJump=k=>{
  const el=document.getElementById(helpId(k));if(!el)return false;
  const rm=document.documentElement.classList.contains('rm')||(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
  try{el.scrollIntoView({block:'start',behavior:rm?'auto':'smooth'})}catch(e){el.scrollIntoView()}
  const h=el.matches('h3,nav')?el:el.querySelector('h3');if(h)try{h.focus({preventScroll:true})}catch(e){}
  return false;
};
function helpBody(){
  const toc=`<nav class="help-toc" id="${helpId('toc')}" tabindex="-1" aria-label="Help contents"><b>Contents</b><ul>${HELP.map(([ic,h,,k])=>
    `<li><a href="#${helpId(k)}" onclick="return helpJump('${k}')">${ic} ${h}</a></li>`).join('')}</ul></nav>`;
  const secs=HELP.map(([ic,h,t,k])=>`<section class="help-sec" id="${helpId(k)}" aria-labelledby="${helpId(k)}-h">
    <h3 id="${helpId(k)}-h" tabindex="-1"><span aria-hidden="true">${ic}</span> ${h}<a class="help-up" href="#${helpId('toc')}" onclick="return helpJump('toc')" aria-label="Back to contents" title="Back to contents">↑</a></h3>${t}</section>`).join('');
  return toc+secs+'<p class="help-note">Hilltop is a real neighborhood. The businesses, neighbors and events in the game are made up, written with love.</p>';
}
function helpModal(){
  modal('❓ Help! How to play Tacompton',helpBody(),
    [{l:'Got it',fn:()=>{}},...(typeof feedbackModal==='function'?[{l:'💬 Send feedback',s:'Questions, ideas or bugs: tell the developer.',fn:()=>feedbackModal(helpModal)}]:[])]);
}
window.helpModal=helpModal;
