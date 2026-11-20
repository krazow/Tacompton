// ============================================================
//  TACOMPTON: the Help sheet ("❓ Help!" on the title screen, ⚙️ Settings → Help; 08-settings.js calls helpModal()).
//  One bottom sheet: a table of contents (tap a topic to jump to it), then one short section per topic, in the order a new
//  player meets things. Each section is [icon, title, html, anchor]: a one-line summary (.help-sum), then a few bullets.
//  Works before a game exists and mid-game. Numbers come from the game's own constants where they exist.
//  Write for players: short sentences, plain words, no code terms.
// ============================================================
const HELP_W=()=>typeof SCORE_W!=='undefined'?SCORE_W:{rep:40,star:1000,trip:150,cite:1500};
const HELP_CUTS=()=>typeof GRADE_CUTS!=='undefined'?GRADE_CUTS:[14000,11000,8000,5000];
const HELP=[
  ['🧭','Getting started',`<p class="help-sum">Run a one-boat salmon guide business out of Tacoma for <b>two weeks</b>: Monday Aug 3 to Sunday Aug 16, 2026.</p><ul>
    <li>Time moves only when you act. Tap an action on the <b>🧭 Here</b> tab, or open <b>Go somewhere</b> to drive across town.</li>
    <li>You live in an apartment on <b>Hilltop</b>, with the boat on a trailer out back. Trips leave from the <b>Point Defiance Marina</b>.</li>
    <li><b>Energy</b> drops through the day and with every trip. <b>Go to bed</b> at home to get most of it back. Stay up past midnight and you wake up on the couch, tired.</li>
    <li>Tabs: <b>🧭 Here</b> (what you can do), <b>📅 Bookings</b> (requests and your schedule), <b>🐟 Fish</b> (spots and tides), <b>📖 Regs</b>, <b>📋 To-do</b> and <b>📜 Log</b>.</li>
    <li>The top bar shows cash, reputation, energy, the boat’s condition and your record (citations out of 3).</li>
    <li>The season ends early with <b>3 citations</b>, <b>reputation at 0</b> or <b>more than $2,000 in debt</b>.</li></ul>`,'start'],
  ['🗺️','Getting around Tacoma',`<p class="help-sum">Six places, 8 to 30 minutes apart. Plan the morning so you’re at the marina on time.</p><ul>
    <li><b>Home</b> (Hilltop): bed, rest and the logbook.</li>
    <li><b>Downtown</b> (6th Ave): the tackle shop for herring and gear, a diner, urgent care. Open 6 AM to 9 PM.</li>
    <li><b>Point Defiance Marina</b> (Ruston): the launch, the fuel dock and the start of every trip.</li>
    <li><b>Ruston Way</b>: the waterfront and Les Davis Pier. Scout the bay, sometimes meet clients.</li>
    <li><b>Thea Foss Waterway</b>: the Museum of Glass, a waterfront bar and the evening crowd.</li>
    <li><b>Gig Harbor</b>, across the Narrows Bridge: well-off clients and the marine repair shop. The bridge toll is paid <b>eastbound only</b>, so it’s the trip back to Tacoma that costs about $5.</li>
    <li>I-5 at the Tacoma Dome jams up. Leave a little slack.</li></ul>`,'places'],
  ['🛶','Your first trip',`<p class="help-sum">Stock up, get to the marina before the start time, fish the day, then get paid at the dock.</p><ul>
    <li>Your schedule is on <b>📅 Bookings</b>. Each trip has a start time and a party: how many, and what they want.</li>
    <li>Before you go: <b>herring</b> (one tray on ice per trip, bought Downtown; it spoils after a day), <b>tackle</b> (flashers, hoochies, leaders) and <b>fuel</b> (the tank holds 40 gallons; fill up at the marina’s fuel dock).</li>
    <li>On the water you pick spots and tactics: mooching cut-plug herring, or trolling flashers and hoochies on the downriggers. The <b>🐟 Fish</b> tab shows which spots are Hot, Good, Fair or Poor today, and the tides.</li>
    <li><b>Dilemmas</b> come up along the way. The answers are shuffled and none is marked. There is always a legal answer, and it usually costs something.</li>
    <li>Back at the dock you see the catch, the fare, the tip and the party’s review.</li>
    <li>Late, or not there at all? The party leaves, your reputation drops and they post about it.</li></ul>`,'trip'],
  ['🎯','Clients and reviews',`<p class="help-sum">Every party wants something. Give them that day and the tip follows.</p><ul>
    <li>Some want a cooler full of silvers, some one big king, some an easy day with the kids and a view of the mountain.</li>
    <li>Happy clients tip. Unhappy ones leave bad reviews and tell their friends.</li>
    <li>Each review is 1 to 5 stars. Your <b>★ rating</b> is the average of your last 20.</li>
    <li>Booking requests come in every morning and wait on <b>📅 Bookings</b> for a day or two (look for the dot). Say yes, or decline.</li></ul>`,'clients'],
  ['🐟','Fish and water',`<p class="help-sum">Marine Area 11 runs from Point Defiance to Vashon and the Narrows. Read it before you launch.</p><ul>
    <li><b>Chinook</b> (kings) and <b>coho</b> (silvers) are in the Sound in August. No pinks in 2026: they come back in odd years.</li>
    <li>Spots: the Clay Banks and Owen Beach at Point Defiance, Gibson Point, the Slag Pile off Ruston, Commencement Bay, Browns Point, Dalco Passage, the Narrows, Quartermaster Harbor and the Foss and Hylebos mouths.</li>
    <li>Tides move the fish. Fog, wind and the crowds change the day. The 🐟 Fish tab has it all.</li>
    <li>On a treaty fishery opener the Puyallup Tribe’s nets are in the bay. Give them room: it’s their fishery and their right.</li></ul>`,'fish'],
  ['📖','Rules and the law',`<p class="help-sum">Play it by the book. Bending a rule can pay today, but three citations end the season.</p><ul>
    <li>The <b>📖 Regs</b> tab lists your licenses and the rules: the daily limit, the Chinook minimum size and the closed areas.</li>
    <li><b>Barbless hooks</b> only. <b>Wild Chinook</b> (adipose fin still on) go back in the water. No culling: a kept fish counts.</li>
    <li>Fill in the <b>catch record card</b> right after a fish is landed, and the <b>logbook</b> at home before bed.</li>
    <li>You need your WA charter license and a legal vessel, and a six-pack license means six passengers at most.</li>
    <li>WDFW officers check boats at the launch. A small slip can be a warning; after that it’s a <b>citation</b> and a fine.</li></ul>`,'rules'],
  ['⛽','Boat, fuel and tackle',`<p class="help-sum">Keep the boat running, the tank full and the bait fresh.</p><ul>
    <li><b>Boat:</b> it wears with every trip. Worn boats break down and clients notice. Repairs are at the marine shop in Gig Harbor.</li>
    <li><b>Fuel:</b> 40-gallon tank. Fuel up at the marina before a trip. Running dry on the Sound costs a tow, a refund and your reputation.</li>
    <li><b>Herring</b> spoils at the end of the day after you buy it. Buy it the evening before or that morning.</li>
    <li>The trailer, the bilge pump and the Narrows wind all have opinions. Some days things just break.</li></ul>`,'boat'],
  ['💵','Money and score',`<p class="help-sum">Trips pay the bills. The score adds up how the season went.</p><ul>
    <li>A trip pays its fare plus a tip. Every night costs moorage, trailer parking, insurance and the phone.</li>
    <li>Fuel, herring, tackle, repairs, bridge tolls and fines come out of the same account.</li>
    ${(w=>`<li><b>Score:</b> cash + reputation × ${w.rep} + ★ rating × ${grp(w.star)} + trips × ${w.trip} − citations × ${grp(w.cite)}. The end screen shows every line.</li>`)(HELP_W())}
    ${(c=>`<li><b>Grades:</b> A ${grp(c[0])}, B ${grp(c[1])}, C ${grp(c[2])}, D ${grp(c[3])}, F below. A season that ends early is an F.</li>`)(HELP_CUTS())}
    <li>Difficulty never changes the score or the cutoffs, only the game: starting cash, patrols, fines and luck.</li></ul>`,'money'],
  ['🌄','Tacoma life',`<p class="help-sum">Things happen around town. Some help, some cost you time.</p><ul>
    <li><b>The mountain is out:</b> Rainier in full view puts clients in a good mood.</li>
    <li><b>The Tacoma Aroma</b> drifts up on a south wind. Clients notice.</li>
    <li>Fog in Dalco Passage, a sea lion asleep on your slip, a seal at the cleaning station, orcas off Point Defiance, I-5 parked at the Dome and a Seahawks Sunday all come and go.</li>
    <li>Good days and bad show up in the <b>☀️ morning report</b>, as small tiles and in the 📜 Log.</li></ul>`,'life'],
  ['⚙️','Settings',`<p class="help-sum">Make the game look, sound and pop up the way you like in <b>⚙️ Settings</b>.</p><ul>
    <li><b>🔔 Event pop-ups</b> are off: events show as tiles and log lines. Turn them on for an OK pop-up each. The morning report always shows.</li>
    <li><b>🛶 Show every trip step</b> gives each choice on a trip its own pop-up.</li>
    <li><b>♿ Accessibility:</b> bigger text, high contrast and reduce motion. Also: 💡 tips, 🔊 sound and three 💾 save slots.</li>
    <li>On a computer, number keys press buttons, a tab’s first letter opens it, <b>Esc</b> closes a pop-up and <b>?</b> lists the shortcuts.</li></ul>`,'settings'],
  ['💡','Tips for a good season',`<p class="help-sum">A few habits that pay.</p><ul>
    <li>Answer booking requests every morning.</li>
    <li>Buy herring, tackle and fuel the evening before.</li>
    <li>Read the 🐟 Fish tab before you pick a spot.</li>
    <li>Fit the day to the party.</li>
    <li>Take the legal answer in a dilemma. It’s cheaper than a citation.</li>
    <li>Fill in the logbook and get to bed.</li></ul>`,'tips'],
  ['📲','Install the app and play offline',`<p class="help-sum">Install Tacompton on your phone or computer and it plays like an app, even with no signal.</p><ul>
    <li>Tap <b>Install</b> in the bar at the top of the title screen, or <b>📲 Install app</b>. On Android, Chrome and Edge your browser asks to install; other browsers show their menu steps.</li>
    <li>On an iPhone or iPad it opens <a href="install/ios.html">a short how-to</a>: in Safari, tap Share, then <b>Add to Home Screen</b>, then <b>Add</b>.</li>
    <li>Open it once from the new icon while online. After that it plays offline.</li>
    <li>Use <b>🔁 Transfer a saved game</b> to move a game to another device.</li></ul>`,'install'],
  ['💬','Feedback',`<p class="help-sum">Ideas, bugs, or a rule or fact we got wrong? Tell the developer.</p><ul>
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
  return toc+secs+'<p class="help-note">The rules follow a simplified version of the 2026 WDFW Puget Sound salmon regulations. This is a game: always check the current regulations and emergency rules at wdfw.wa.gov before you fish.</p>';
}
function helpModal(){
  modal('❓ Help! How to play Tacompton',helpBody(),
    [{l:'Got it',fn:()=>{}},...(typeof feedbackModal==='function'?[{l:'💬 Send feedback',s:'Questions, ideas or bugs: tell the developer.',fn:()=>feedbackModal(helpModal)}]:[])]);
}
window.helpModal=helpModal;
