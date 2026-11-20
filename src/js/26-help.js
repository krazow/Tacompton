// ============================================================
//  TACOMPTON: the player's guide. "❓ Help" on the title screen and ⚙️ Settings → Help call helpModal(), which opens the
//  guide as a full-screen document (not a bottom sheet): a cover, a numbered table of contents with jump links, then one
//  chapter per topic, in the order a new player meets things, with a few small drawings and tip boxes.
//  It reads like a printed handbook: "📄 Print / save as PDF" opens the print dialog (print CSS in style.css hides the game).
//  Keyboard: Tab stays inside the guide, Esc closes it, every control is at least 44px. Works before a game exists and mid-game.
//  Numbers come from the game's own constants (JOBS, DIFFS, SCORE_W, GRADE_CUTS, TRAVEL, …) so the guide stays in step.
//  Write for players: short sentences, plain words, no code terms.
// ============================================================
const HELP_W=()=>typeof SCORE_W!=='undefined'?SCORE_W:{cash:0.5,community:20,standing:8,stress:5,shift:60,fair:100,early:100,unpacked:60,neighbors:100};
const HELP_CUTS=()=>typeof GRADE_CUTS!=='undefined'?GRADE_CUTS:[3850,3000,2200,1500];
const HELP_B=()=>typeof BAL!=='undefined'?BAL:{onTime:2,late:[2,6,15],lateStress:6,missed:[10,16],missedStress:8,midnightJob:3,midnightStress:6,sleep:3,goodSleep:5,goodSleepBy:1380};
const HELP_HALF=x=>x===0.5?'½':String(x);
const HELP_RENT=()=>typeof S!=='undefined'&&S&&S.rent?S.rent.amt:1150;
const hDays=j=>j.days[0]===0?'Monday to Friday':'Wednesday to Sunday';
const hShifts=j=>Array.from({length:GAME.days},(_,i)=>i).filter(i=>j.days.includes(i%7)).length;
const hTip=(t,b)=>`<aside class="tut-box tip"><b>${t}</b><p>${b}</p></aside>`;
const hWarn=(t,b)=>`<aside class="tut-box warn"><b>${t}</b><p>${b}</p></aside>`;
const hTable=(head,rows)=>`<div class="tut-tw"><table class="tut-t"><thead><tr>${head.map(h=>`<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map((c,i)=>i?`<td>${c}</td>`:`<th scope="row">${c}</th>`).join('')}</tr>`).join('')}</tbody></table></div>`;
const hFig=(svg,cap)=>`<figure class="tut-fig">${svg}<figcaption>${cap}</figcaption></figure>`;

// ---- drawings (plain SVG, colors from the game's palette) ----
const HSVG_COVER=()=>`<svg viewBox="0 0 320 120" role="img" aria-label="Hilltop: houses on the hill, the Link train on MLK and Mount Rainier behind">
  <defs><clipPath id="tutclip"><rect width="320" height="120" rx="10"/></clipPath></defs><g clip-path="url(#tutclip)"><rect width="320" height="120" fill="#f3ecdc"/><circle cx="58" cy="34" r="13" fill="#f2b630" opacity=".85"/>
  <polygon points="140,74 206,26 218,22 230,27 300,74" fill="#a9b9cc"/><polygon points="184,42 206,26 218,22 230,27 250,42 238,39 228,47 218,39 208,48 196,40" fill="#fff"/>
  <path d="M0 120 V82 Q50 66 110 74 Q170 82 220 72 Q270 62 320 76 V120 Z" fill="#5b7d68"/>
  ${[[18,'#b66a4a'],[70,'#d9b45a'],[122,'#6f9aa6'],[228,'#c97a5a'],[276,'#8fae7a']].map(([x,c],i)=>`<g transform="translate(${x},${86-i%2*4})"><rect width="34" height="20" fill="${c}"/><polygon points="-3,1 17,-11 37,1" fill="#5a3328"/><rect x="5" y="6" width="7" height="6" fill="#fbe9b0"/><rect x="22" y="6" width="7" height="6" fill="#fbe9b0"/></g>`).join('')}
  <rect y="104" width="320" height="16" fill="#55595d"/><path d="M0 109 H320 M0 113 H320" stroke="#a0a4a8"/>
  <g transform="translate(150,110)"><rect y="-16" width="96" height="14" rx="4" fill="#f4f5f2"/><rect y="-6" width="96" height="3" fill="#2f8f6a"/>${[0,1,2,3].map(i=>`<rect x="${7+i*22}" y="-14" width="14" height="6" rx="1" fill="#5d7f93"/>`).join('')}</g></g></svg>`;
const HSVG_HUD=()=>{const st=[['Cash','$900','#1f5d63','your money'],['Energy','85','#2f7d4f','high is good'],['Stress','25','#b8402a','high is bad'],['Food','3','#c98a12','meals left'],['Job','70','#24507a','high is safe']];
  return `<svg viewBox="0 0 340 128" role="img" aria-label="The top bar: Cash, Energy, Stress, Food and Job">
  <rect width="340" height="62" rx="10" fill="#1d3346"/><text x="12" y="20" font-size="12" font-weight="700" fill="#fff" font-family="Fraunces, Georgia, serif">Mon Aug 3</text><text x="328" y="20" font-size="12" font-weight="700" fill="#fff" text-anchor="end" font-family="DM Sans, sans-serif">5:30 AM</text>
  ${st.map(([l,v,c],i)=>`<g transform="translate(${10+i*66},28)"><rect width="60" height="26" rx="6" fill="#fff" fill-opacity=".1"/><text x="6" y="11" font-size="8" fill="#fff" fill-opacity=".8" font-family="DM Sans, sans-serif">${l}</text><text x="6" y="22" font-size="10" font-weight="700" fill="#fff" font-family="DM Sans, sans-serif">${v}</text><rect x="38" y="16" width="16" height="4" rx="2" fill="#fff" fill-opacity=".25"/><rect x="38" y="16" width="${[16,13,4,10,10][i]}" height="4" rx="2" fill="${['#fff','#7fd39a','#ff8a73','#f2c94c','#9ec6ff'][i]}"/></g>`).join('')}
  ${st.map(([l,,c,d],i)=>`<g transform="translate(${40+i*66},62)"><path d="M0 0 V${14+i%2*22}" stroke="${c}" stroke-width="1.5"/><text x="0" y="${26+i%2*22}" font-size="9" text-anchor="middle" fill="${c}" font-weight="700" font-family="DM Sans, sans-serif">${d}</text></g>`).join('')}</svg>`};
const HSVG_MAP=()=>{
  // [x, y, label, label above (1) or below (0)]
  const P={home:[58,56,'🏠 Your apartment',1],mlk:[176,40,'🛒 MLK Jr Way',1],link:[280,78,'🚋 Link',1],work:[290,150,'💼 Work',0],peoples:[170,128,'🏊 People’s',0],view:[56,150,'🌄 The overlook',0]};
  const E=[['home','mlk'],['mlk','link'],['link','work'],['mlk','peoples'],['home','peoples'],['home','view'],['peoples','link']];
  const tm=(a,b)=>typeof travelMins==='function'?travelMins(a,b):'';
  return `<svg viewBox="0 0 340 180" role="img" aria-label="A map of the six places and the walking minutes between them">
  <rect width="340" height="180" rx="10" fill="#eef1ea"/>
  ${E.map(([a,b])=>{const [x1,y1]=P[a],[x2,y2]=P[b];return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#1f5d63" stroke-width="1.6" stroke-dasharray="4 3"/>`}).join('')}
  ${E.map(([a,b])=>{const [x1,y1]=P[a],[x2,y2]=P[b];return `<g transform="translate(${(x1+x2)/2},${(y1+y2)/2})"><rect x="-18" y="-8" width="36" height="16" rx="8" fill="#fff" stroke="#1f5d63" stroke-width="1"/><text y="3.5" font-size="9" text-anchor="middle" font-weight="700" fill="#1f5d63" font-family="DM Sans, sans-serif">${tm(a,b)} min</text></g>`}).join('')}
  ${Object.values(P).map(([x,y,l,up])=>`<circle cx="${x}" cy="${y}" r="6" fill="#e3642e" stroke="#fff" stroke-width="2"/><text x="${x}" y="${up?y-12:y+20}" font-size="10" text-anchor="middle" font-weight="700" fill="#1b2326" font-family="DM Sans, sans-serif">${l}</text>`).join('')}</svg>`};
const HSVG_SHIFTS=()=>{const x=m=>20+(m-300)/1140*300,J=Object.values(JOBS);
  return `<svg viewBox="0 0 340 ${44+J.length*30}" role="img" aria-label="When each job's shift runs, from 5 AM to midnight">
  ${[300,480,720,960,1200,1440].map(m=>`<line x1="${x(m)}" y1="14" x2="${x(m)}" y2="${20+J.length*30}" stroke="#ddd4c0"/><text x="${x(m)}" y="10" font-size="8.5" text-anchor="middle" fill="#6b7478" font-family="DM Sans, sans-serif">${m===1440?'12 AM':fmt(m).replace(':00','')}</text>`).join('')}
  <rect x="${x(typeof SUNSET!=='undefined'?SUNSET:1220)-1}" y="14" width="2" height="${8+J.length*30}" fill="#f2b630"/><text x="${x(typeof SUNSET!=='undefined'?SUNSET:1220)}" y="${36+J.length*30}" font-size="8.5" text-anchor="middle" fill="#a9441b" font-family="DM Sans, sans-serif">🌅 sunset</text>  ${J.map((j,i)=>`<g transform="translate(0,${22+i*30})"><rect x="${x(j.start)}" y="0" width="${x(j.end)-x(j.start)}" height="18" rx="5" fill="${['#24507a','#2f6d5a','#e3642e'][i]}"/><text x="${x(j.start)+6}" y="12.5" font-size="9" font-weight="700" fill="#fff" font-family="DM Sans, sans-serif">${j.ic} ${fmt(j.start)}–${fmt(j.end)}</text></g>`).join('')}
</svg>`};
const HSVG_GRADES=()=>{const c=HELP_CUTS(),max=c[0]+900,x=v=>20+v/max*300,G=[['F',0,c[3],'#b8402a'],['D',c[3],c[2],'#c98a12'],['C',c[2],c[1],'#8a8f5a'],['B',c[1],c[0],'#2f6d5a'],['A',c[0],max,'#1f5d63']];
  return `<svg viewBox="0 0 340 58" role="img" aria-label="The grade bands from F to A">${G.map(([g,a,b,col])=>`<rect x="${x(a)}" y="8" width="${x(b)-x(a)}" height="24" fill="${col}"/><text x="${(x(a)+x(b))/2}" y="25" font-size="12" font-weight="700" text-anchor="middle" fill="#fff" font-family="Fraunces, Georgia, serif">${g}</text>`).join('')}
  ${c.map(v=>`<text x="${x(v)}" y="46" font-size="8.5" text-anchor="middle" fill="#6b7478" font-family="DM Sans, sans-serif">${grp(v)}</text>`).join('')}</svg>`};

// ---- the chapters: [key, title, html] (numbered in this order) ----
function helpChapters(){
  const J=JOBS,w=HELP_W(),c=HELP_CUTS(),B=HELP_B(),rent=$(HELP_RENT()),D=DIFFS,N=typeof NEIGHBORS!=='undefined'?NEIGHBORS:[],boxes=typeof BOXES!=='undefined'?BOXES:6;
  const sun=`${fmt(typeof sunsetOn==='function'?sunsetOn(0):1220)} at the start, ${fmt(typeof sunsetOn==='function'?sunsetOn(GAME.days-1):1200)} by the end`,ach=typeof ACH!=='undefined'?ACH:[];
  const places=['home','mlk','work','link','peoples','view'];
  return [
  ['start','Getting started',`
    <p>You just moved into a third-floor walk-up on <b>Hilltop</b>, the old neighborhood on the hill in Tacoma, Washington. The game is your first <b>${GAME.days} days</b> there: Monday, Aug 3 to Sunday, Aug 16, 2026.</p>
    <p>Your job for those two weeks: <b>hold down a job, make rent, keep food in the fridge, keep your energy up and your stress down, and become part of the neighborhood.</b> Make it to Sunday night and you get a score and a grade from A to F.</p>
    <h3>Starting a game</h3>
    <ol><li>Tap the big orange button on the title screen (<b>${esc(TITLE.start)}</b>, or <b>Continue</b> if you have a game saved).</li>
    <li>The first time, type the name everyone in the game will call you.</li>
    <li>Pick a difficulty. It changes your savings, prices, how hard shifts hit and your luck, never the score:</li></ol>
    ${hTable(['Difficulty','Savings','Prices','Shifts','Bad luck'],Object.values(D).map(d=>[`${d.ic} ${d.n}`,$(d.money),d.cost===1?'normal':(d.cost<1?`${Math.round((1-d.cost)*100)}% cheaper`:`${Math.round((d.cost-1)*100)}% pricier`),(d.strain||1)===1?'normal':(d.strain<1?'easier':'harder'),d.bad===1?'normal':(d.bad<1?'less often':'more often')]))}
    <ol start="4"><li>Pick your job (chapter 5). You keep it for the whole two weeks.</li><li>Read the welcome note and tap <b>Open the blinds</b>. You’re in.</li></ol>
    ${hTip('The one rule to remember','Time only moves when you act. Nothing happens while you read, so take your time.')}`],
  ['day1','Your first day step by step',`
    <p>Day one starts at <b>${fmt(GAME.wake)}</b>, Monday, Aug 3, in your apartment. You have ${boxes} boxes, a fridge with 3 meals and your savings (${$(D.normal.money)} on ${D.normal.n}). Here is a good first day.</p>
    <ol class="tut-steps">
    <li><b>Look at the top bar.</b> Cash, Energy, Stress, Food and Job (chapter 3).</li>
    <li><b>Check when you work.</b> The 🧭 <b>Here</b> tab shows a tag like “☕ work 6:30 AM–2:30 PM”. The CNA and barista jobs start today. The line cook starts on Wednesday.</li>
    <li><b>Walk to work.</b> Tap <b>Go to work</b> at the top of the Here tab (or <b>Go somewhere</b> and pick <b>Work</b>). It’s ${typeof travelMins==='function'?travelMins('home','work'):12} minutes from home. Leave yourself a little room.</li>
    <li><b>Tap “Work your shift”.</b> The clock jumps to the end of the shift and you get paid. If you’re early you wait for the start.</li>
    <li><b>Go to MLK Jr Way</b> and buy groceries at the corner market (${$(42)} for 4 meals). Stop and talk on the corner while you’re there: you might meet a neighbor.</li>
    <li><b>Do one thing for yourself.</b> A swim at People’s, the bench at the overlook, the sunset around ${sun}, or a call home.</li>
    <li><b>Go home and unpack a box</b> (once a day), then <b>Go to bed</b> before ${fmt(B.goodSleepBy)} for a real night’s sleep. Dinner comes out of the fridge on its own.</li>
    <li><b>Read the morning report.</b> It says what happened overnight and what today holds.</li></ol>
    ${hTip('If you took the kitchen job','Monday and Tuesday are yours. Use them to unpack, stock the fridge, ride the Link and meet people before your first shift on Wednesday at 2:00 PM.')}`],
  ['hud','The HUD stats explained',`
    <p>The bar at the top of the screen is the HUD. Tap or hover a stat for a short reminder of what it means.</p>
    ${hFig(HSVG_HUD(),'The top bar on your first morning (Hilltop difficulty).')}
    ${hTable(['Stat','Start','What it means'],[
      ['💵 Cash','savings','Money in the bank. Turns red in the last days if you can’t cover rent yet. Below −$500 you lose the apartment.'],
      ['⚡ Energy','85','0 to 100. Being awake drains a little over 1 an hour; shifts drain a lot. Sleep brings it back. Red under 20.'],
      ['😣 Stress','25','0 to 100, and high is bad. Red at 75. At <b>100</b> you burn out and the game ends.'],
      ['🍽️ Food','3','Meals in the fridge. You eat one every night. Red at 0.'],
      ['💼 Job','70','0 to 100: how work feels about you. Red under 25. At <b>0</b> you’re let go.']])}
    <p>Two more numbers live off the bar: <b>Community</b> (0–100, starts at 5) on the 🤝 Neighbors tab, and the <b>day</b>, shown as “Mon Aug 3 · Day 1 of ${GAME.days}”.</p>`],
  ['places','Places on Hilltop',`
    <p>Six places, all a short walk apart. Open <b>Go somewhere</b> on the Here tab to move. Walking takes the minutes shown.</p>
    ${hFig(HSVG_MAP(),'Walking minutes between the places (the full table is below).')}
    ${places.map(k=>{const p=L[k],nm=k==='work'?'Work':p.name;const H={
      home:'Bed, rest, cook, call home, unpack, set your alarm and pay rent.',
      mlk:'The corner market (7 AM–10 PM), the teriyaki spot (11 AM–9 PM), the barbershop (9 AM–7 PM), the murals and the people on the corner. The street fair is here on Sat Aug 8.',
      work:'Your job: the hospital, the café or the kitchen. Shifts, extra hours and break-room coffee.',
      link:'The T Line stop. Riding is free and quick, with the best people-watching on the hill.',
      peoples:'Open 6 AM–9 PM. The pool (6 AM–8 PM), community programs (9 AM–6 PM), the evening pickup game (about 5–8:30 PM) and the park.',
      view:`A bench with Commencement Bay and Mount Rainier. Come for the sunset, around ${sun}.`}[k];
      return `<p class="tut-place"><b>${p.ic} ${nm}.</b> ${H}</p>`}).join('')}
    <h3>Walking times (minutes)</h3>
    ${hTable(['From \\ to',...places.map(k=>L[k].ic)],places.map(a=>[`${L[a].ic} ${a==='work'?'Work':L[a].name}`,...places.map(b=>a===b?'·':travelMins(a,b))]))}
    <h3>What you can do where</h3>
    <div class="tut-tw"><table class="tut-t tut-acts"><thead><tr><th scope="col">Action</th><th scope="col">Cost, time</th><th scope="col">Effect</th></tr></thead>
    ${[
      ['🏠 Your apartment',[['Rest for an hour†','free, 1 h','Energy +10, stress −5'],['Cook something proper*','1 meal, 45 min','Energy +14, stress −4'],['Call home*','free, 30 min','Stress −8'],['Unpack a box*','free, 45 min','Energy −4, stress −3']]],
      ['🛒 MLK Jr Way',[['Groceries','$42, 25 min','Food +4'],['A cold drink and chips','$5, 10 min','Energy +6'],['A teriyaki plate*','$14, 30 min','Energy +15, stress −4'],['A cut at the barbershop (once)','$25, 1 h','Community +6, stress −6'],['Talk on the corner*','free, 30 min','A new neighbor (community +3), or +1'],['Look at the murals†','free, 30 min','Stress −6']]],
      ['🚋 Hilltop Link',[['Ride the T Line and back*','free, 40 min','Stress −8'],['People-watch on the platform†','free, 20 min','Stress −3']]],
      ['🏊 People’s Center & Park',[['Swim laps*','$5, 45 min','Energy −6, stress −14'],['Pickup game* (energy 15+)','free, 1 h','Energy −12, stress −10, community +1'],['Help out with a program*','free, 2 h','Energy −8, community +3, stress −4'],['Sit in the park†','free, 30 min','Stress −5']]],
      ['🌄 The overlook',[['Sit on the bench†','free, 30 min','Stress −8'],['Watch the sunset*','free, 45 min','Stress −18'],['Walk the edge of the hill†','free, 45 min','Stress −8, energy −4']]]].map(([pl,rs])=>`<tbody><tr class="tut-grp"><th colspan="3" scope="colgroup">${pl}</th></tr>${rs.map(r=>`<tr><th scope="row">${r[0]}</th><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}</tbody>`).join('')}</table></div>
    <p class="tut-small">* Once a day. † Full effect twice a day, then about a third. Prices are for the ${D.normal.n} difficulty. ${D.easy.n} is ${Math.round((1-D.easy.cost)*100)}% cheaper and ${D.hard.n} is ${Math.round((D.hard.cost-1)*100)}% pricier. Everywhere, <b>Wait a while</b> skips ahead 30, 60 or 120 minutes.</p>`],
  ['job','Your job and shifts',`
    <p>You moved here for work. On day one you pick one of three jobs, and you keep it for the two weeks.</p>
    ${hFig(HSVG_SHIFTS(),'When each shift runs, 5 AM to midnight.')}
    ${hTable(['Job','Shift','Pay','Each shift costs'],Object.values(J).map(j=>[`${j.ic} ${j.role==='certified nursing assistant'?'CNA':j.role[0].toUpperCase()+j.role.slice(1)}`,`${fmt(j.start)}–${fmt(j.end)}, ${j.days[0]===0?'Mon–Fri':'Wed–Sun'} (${hShifts(j)} shifts)`,`${$(j.pay)}${j.tips?` + ${$(j.tips[0])}–${$(j.tips[1])} tips`:''}`,`Energy −${j.energy}, stress +${j.stress}${DIFFS.hard.strain&&DIFFS.hard.strain!==1?` (+${Math.round(j.stress*DIFFS.hard.strain)} on ${DIFFS.hard.n})`:''}`]))}
    <ul><li><b>🏥 CNA:</b> the best pay and the hardest days. Your alarm is set to ${fmt(J.hospital.alarm)}.</li>
    <li><b>☕ Barista:</b> less pay, cash tips that grow with your job standing. Alarm ${fmt(J.cafe.alarm)}.</li>
    <li><b>🍳 Line cook:</b> evenings, and a <b>staff meal</b> covers dinner on every shift night, so you use less food. Alarm ${fmt(J.kitchen.alarm)}.</li></ul>
    <h3>How a shift works</h3>
    <ul><li>Go to Work on a shift day and tap <b>Work your shift</b>. The clock jumps to the end and you’re paid.</li>
    <li><b>On time:</b> full pay and Job +${B.onTime}.</li>
    <li><b>Late:</b> pay for the part you work, Job −${B.late[0]} and −1 more for every ${B.late[1]} minutes late (up to −${B.late[2]}), and stress +${B.lateStress}.</li>
    <li>In the last hour of a shift it’s too late to clock in.</li>
    <li><b>Missed:</b> the first one costs Job −${B.missed[0]}, each one after that −${B.missed[1]}, and stress +${B.missedStress} each time.</li>
    <li><b>Up past midnight:</b> you drag in tired the next day: Job −${B.midnightJob}.</li>
    <li><b>Extra hours:</b> on a day off, if your Job is 50 or more, work offers 4 hours for half a shift’s pay (Energy −16, stress +8, Job +3). They start between 9 AM and 1 PM (the kitchen: 9 AM to 6 PM).</li>
    <li><b>Break-room coffee</b> (once a day, 15 min): Energy +5, Job +1.</li></ul>
    ${hWarn('Watch the clock','An alert bar warns you an hour before your shift and when you’re late. Ten on-time shifts is the backbone of a good score.')}`],
  ['food','Food and the fridge',`
    <p>Food is the everyday thing. The 🍽️ number on the top bar is the meals in your fridge.</p>
    <ul><li>Every night, when the day ends, you eat <b>one meal</b> from the fridge (the kitchen’s staff meal covers shift nights).</li>
    <li><b>With an empty fridge</b> you go to bed hungry: stress +10 and only half the sleep.</li>
    <li><b>Groceries:</b> ${$(42)} at the corner market on MLK buys 4 meals. Open 7 AM to 10 PM.</li>
    <li><b>Cook something proper</b> at home uses one extra meal for Energy +14 and stress −4.</li>
    <li><b>Eating out</b> doesn’t touch the fridge: a teriyaki plate (${$(14)}) is a lift, not dinner.</li>
    <li>Neighbors help, too: tomatoes from across the street, a barbecue plate and the free community fridge on MLK can each add a meal or two. A power blip at night can spoil one.</li></ul>
    ${hTip('Rule of thumb',`Shop when you’re down to 1 meal. Three grocery runs (about ${$(126)}) keep you fed for the whole two weeks.`)}`],
  ['energy','Energy and stress',`
    <p>Work wears you down. The neighborhood picks you back up.</p>
    <h3>Energy</h3>
    <ul><li>Being awake costs about 1 energy every 50 minutes. Shifts cost ${Object.values(J).map(j=>`${j.energy} (${j.ic})`).join(', ')}.</li>
    <li>A night in your own bed gives <b>+58</b> energy and only stress −${B.sleep}. In bed before <b>${fmt(B.goodSleepBy)}</b> (and not hungry), it’s a real night’s sleep: stress −${B.goodSleep}. Hungry, you get half the energy.</li>
    <li>Stay up past midnight and you wake up on the couch: only +28, stress +${B.midnightStress} and Job −${B.midnightJob}.</li>
    <li>Going to bed with energy under 15 adds stress +6.</li>
    <li>Rest, a proper meal, a teriyaki plate, a cold drink and break-room coffee all help during the day.</li></ul>
    <h3>Stress</h3>
    <ul><li>It goes up with shifts (the biggest part), being late, missed shifts, hunger, bad nights and, until rent is paid, a little every night (${Object.values(D).map(d=>`${d.ic} +${d.worry||0}`).join(', ')}).</li>
    <li>Sleep barely touches it. It comes down with the things you do for yourself: the sunset (−18), a swim (−14), the pickup game (−10), a call home or a ride on the Link (−8), the bench or a walk on the edge of the hill (−8), the murals (−6), and the Street Fair (−20).</li>
    <li>The ones marked † in chapter 4 (rest, the bench, the park, the platform, the murals, the hill walk) work fully twice a day; after that each gives about a third.</li>
    <li>At <b>100</b> you burn out and the game ends. At 70 the Here tab marks you “stressed”; the morning report warns you at 80.</li></ul>
    ${hTip('One thing a day',`Do one thing for yourself every day. A ${$(5)} swim after work and a call home take off about what a hard shift puts on.`)}`],
  ['rent','Rent',`
    <p>Rent is the big one: <b>${rent}</b>, due by the end of <b>Sunday, Aug 16</b>, the last day.</p>
    <ul><li>Pay it at home with <b>Pay rent</b> as soon as you have the money.</li>
    <li>Paying in the <b>first week</b> (by Sunday, Aug 9) takes a weight off: stress −10 and a <b>+${w.early}</b> score bonus. Later, it’s stress −4.</li>
    <li>If it’s still unpaid on the last night and you have the money, you pay at 11:58 PM (stress +4). If you don’t, you lose the apartment.</li>
    <li>Two bills come out on their own: the internet hookup (${$(60)}) on Tuesday, Aug 4 and the power bill (${$(72)}) on Tuesday, Aug 11.</li></ul>
    <h3>Will I make it?</h3>
    ${hTable(['Job','About what you earn','With'],Object.values(J).map(j=>[`${j.ic} ${j.n}`,$(j.pay*hShifts(j)),`${hShifts(j)} on-time shifts${j.tips?', plus tips':''}`]))}
    <p>Starting with ${$(D.normal.money)}, every job covers rent, food and bills if you show up. On ${D.hard.n} (${$(D.hard.money)}) it’s tight: skip the extras until rent is paid.</p>
    ${hWarn('Two ways to lose the apartment','Rent unpaid at the end of Sunday, Aug 16, or more than $500 in the hole at any time.')}`],
  ['hood','Neighbors and community',`
    <p>Hilltop is a neighborhood that notices who shows up. <b>Community</b> (0 to 100) measures how many people know you, and how well. Each point is worth <b>${w.community}</b> on your score.</p>
    <ul><li><b>Stop and talk on the corner</b> on MLK, <b>help out</b> at People’s, play <b>pickup</b>, get a <b>haircut</b>, go to the <b>Street Fair</b> and say yes when a neighbor waves you over.</li>
    <li>Meeting someone new adds community +${typeof MEET_COMMUNITY!=='undefined'?MEET_COMMUNITY:2}. There are <b>${N.length} neighbors</b>. You often meet them in their own places:</li></ul>
    ${hTable(['Neighbor','Where you might meet them'],N.map(x=>[`${x.ic} ${x.n}`,x.at.map(k=>k==='work'?'work':L[k].name).join(', ')]))}
    ${hTip('Everybody',`Meet all ${N.length} for a +${w.neighbors} bonus. The 🤝 Neighbors tab shows who you know and how many are left.`)}`],
  ['events','Events',`
    <p>Things happen on the hill. Some are good, some aren’t, and most are a little of both. They show up as small tiles, in the 📜 Log, and in the ☀️ morning report.</p>
    ${hTable(['Event','When','What happens'],[
      ['🎪 Hilltop Street Fair','Sat Aug 8, 10 AM–6 PM on MLK',`${$(20)}, 2 hours: stress −20, community +8, +${w.fair} score`],
      ['🏔️ The mountain is out','some mornings','Stress −5'],
      ['🍅 Tomatoes from across the street','arriving home in the day','Food +1, meet Ms. Lorraine'],
      ['🍖 Ron’s smoker','evenings, late in the week','Energy +8, stress −8, community +4, leftovers tomorrow'],
      ['📚 🍜 🎤 New faces','on MLK, at the Link, at home','A bookstore, a phở shop, karaoke next door: a new neighbor each'],
      ['🗳️ The block club','People’s, Thursdays and evenings, second week','Community +3: curb cuts, a tenants’-rights clinic, who needs a hand'],
      ['🏗️ A new building','on MLK or your block','Stress +2: the hill is changing'],
      ['🎨 A mural going up','on MLK in the day','Stress −5, community +3; later the finished mural'],
      ['🧺 The free community fridge','on MLK','Food +2 if you’re low, or give a meal for community +4'],
      ['🎶 The choir on Sunday','Sunday late morning','Stress −8, community +3'],
      ['🎉 A block party','weekend evenings, second week','Community +8, stress −10'],
      ['🐕 A lost dog','in the day','Help look: community +4 now and more when Biscuit is home'],
      ['🔔 🎷 On the Link','riding or at the station','Small lifts, and a chance to meet Jaylen'],
      ['🥵 A hot one','some mornings','Energy −6, stress +4'],
      ['💡 🔊 Bad nights','at home','A power blip spoils a meal; a loud night costs energy −10'],
      ['🚋 A car on the tracks','on the way','+10 minutes, stress +3'],
      ['💐 💵 🔥 At work','after a shift','A thank-you card, a big tip or a rush: usually Job up']])}
    <p class="tut-small">Event pop-ups are off at first: each one shows as a tile and a log line. Turn on an OK window for each in ⚙️ Settings.</p>`],
  ['tabs','The Week and Neighbors tabs',`
    <p>The tabs along the bottom: <b>🧭 Here</b> (what you can do where you are), <b>📅 Week</b>, <b>🤝 Neighbors</b>, <b>📋 To-do</b> and <b>📜 Log</b>.</p>
    <h3>📅 Week</h3>
    <ul><li>All ${GAME.days} days, from Mon Aug 3 to Sun Aug 16. 👉 marks today and ✔️ the days behind you.</li>
    <li>Each day says <b>work</b> with the shift times, or <b>day off</b>. Past days say how the shift went: on time, late, or missed.</li>
    <li>The Street Fair (Sat Aug 8) and rent due (Sun Aug 16) are marked. The bottom line says whether rent is paid.</li></ul>
    <h3>🤝 Neighbors</h3>
    <ul><li>Your community score and how many of the ${N.length} neighbors know your name.</li>
    <li>Each neighbor you’ve met, with a line about them and the day you met.</li></ul>
    <h3>📋 To-do and 📜 Log</h3>
    <ul><li><b>To-do</b> lists today’s goals: work, rent, food, stress under 70, job in good standing, neighbors, boxes and the fair. Urgent ones are marked on the tab.</li>
    <li><b>Log</b> keeps every line of your two weeks.</li></ul>`],
  ['score','Winning, losing and the score',`
    <p>There’s no single way to win. Make it to Sunday night, Aug 16, and the score adds up how your two weeks went.</p>
    <h3>Three ways it ends early</h3>
    <ul><li><b>Let go:</b> your Job reaches 0.</li><li><b>Burned out:</b> your stress reaches 100.</li><li><b>Out of the apartment:</b> rent unpaid at the end of Aug 16, or cash below −$500.</li></ul>
    <h3>The score</h3>
    <div class="tut-formula">cash × ${HELP_HALF(w.cash)} + community × ${w.community} + job × ${w.standing} − stress × ${w.stress} + shifts × ${w.shift}</div>
    ${hTable(['Bonus','Points'],[['Went to the Street Fair',`+${w.fair}`],['Rent paid in the first week',`+${w.early}`],[`All ${boxes} boxes unpacked`,`+${w.unpacked}`],[`Met all ${N.length} neighbors`,`+${w.neighbors}`]])}
    <h3>Grades</h3>
    ${hFig(HSVG_GRADES(),'The grade cutoffs. The same on every difficulty.')}
    ${hTable(['Grade','Score','Title'],[['A',`${grp(c[0])}+`,'Hilltop Local'],['B',`${grp(c[1])}+`,'Settling In'],['C',`${grp(c[2])}+`,'Getting By'],['D',`${grp(c[3])}+`,'Still Unpacking'],['F',`below ${grp(c[3])}, or ended early`,'Starting Over']])}
    ${(()=>{const ex=[800*w.cash,65*w.community,90*w.standing,-20*w.stress,10*w.shift,w.unpacked],t=ex.reduce((a,b)=>a+b,0),g=t>=c[0]?'an A':t>=c[1]?'a B':t>=c[2]?'a C':t>=c[3]?'a D':'an F';return `<p>An example: ${$(800)} cash, community 65, job 90, stress 20, 10 shifts and every box unpacked is ${ex.map((v,i)=>(i?(v<0?' − ':' + '):'')+grp(Math.abs(v))).join('')} = <b>${grp(t)}</b>, ${g}. The end screen shows every line of your own score.</p>`})()}
    ${ach.length?`<h3>Achievements</h3><p>${ach.length} to earn, kept on this device across all your games (⚙️ Settings → Achievements):</p><ul class="tut-cols">${ach.map(a=>`<li>${a.ic} <b>${a.n}</b>: ${a.d}</li>`).join('')}</ul>`:''}`],
  ['tips','Tips and strategy',`
    <ol class="tut-steps">
    <li><b>Never miss a shift.</b> Each one is worth ${$(J.cafe.pay)}–${$(J.hospital.pay)} in pay, Job +${B.onTime} and ${w.shift} points. Check the alarm before bed.</li>
    <li><b>Get to bed before ${fmt(B.goodSleepBy)}.</b> That’s the only sleep that really lowers stress. Couch nights after midnight cost energy, stress and Job.</li>
    <li><b>Shop at 1 meal.</b> An empty fridge is stress +10 and half a night’s sleep.</li>
    <li><b>Pay rent in the first week</b> if you can: stress −10 and +${w.early} points.</li>
    <li><b>One thing for yourself every day.</b> Swims and sunsets keep stress far from 100.</li>
    <li><b>Talk on the corner every day.</b> It’s free and it’s how you meet people. Each community point is ${w.community} points of score.</li>
    <li><b>Unpack one box a day</b> for the first ${boxes} days: stress −3 each and +${w.unpacked} at the end.</li>
    <li><b>Keep Saturday, Aug 8 open</b> for the Street Fair.</li>
    <li><b>Mind the math at the end.</b> Every point of stress costs ${w.stress} points, so a last-day sunset (stress −18) is worth ${18*w.stress} points, the same as ${$(18*w.stress/(w.cash||1))} in the bank.</li></ol>
    ${hTip('Kitchen players','You have mornings free. Swim, volunteer and talk on the corner before your 2:00 PM shift, and remember the staff meal saves groceries.')}`],
  ['settings','Settings, accessibility and saving',`
    <p>Open <b>⚙️ Settings</b> from the gear on the title screen or in the game.</p>
    <ul><li><b>👤 Change name</b>, <b>🔊 Sound</b>, <b>💡 Tips</b> (one short tip at a time) and <b>🔔 Event pop-ups</b>.</li>
    <li><b>♿ Accessibility:</b> text size (Normal, Large, Extra large), high contrast, and reduce motion.</li>
    <li><b>⌨️ Keyboard:</b> on a computer, 1–9 press the numbered buttons, a tab’s first letter opens it, Enter presses the highlighted button, Esc closes a pop-up (and this guide), and ? lists the shortcuts.</li>
    <li><b>🏆 Achievements</b> and <b>❓ Help</b> (this guide).</li></ul>
    <h3>Saving</h3>
    <ul><li>The game <b>saves itself</b> after every tap and when you switch away. <b>Continue</b> on the title screen picks up where you left off.</li>
    <li><b>💾 Save slots:</b> ${GAME.slots} games side by side, each in its own slot.</li>
    <li><b>🔁 Transfer a saved game</b> moves a game to another device or browser with a code.</li>
    <li>A finished game clears its slot. Saves live in this browser, so clearing site data deletes them.</li></ul>`],
  ['install','Installing the app',`
    <p>Install Tacompton and it opens full screen from your home screen, like an app, and plays offline.</p>
    <ul><li>Tap <b>📲 Install app</b> on the title screen (it’s right under Help), or <b>Install</b> in the bar at the top on a phone.</li>
    <li><b>Android, Chrome and Edge:</b> your browser asks to install. Tap <b>Install</b>.</li>
    <li><b>iPhone and iPad:</b> it opens <a href="install/ios.html">a short how-to</a>: in Safari, tap <b>Share</b>, then <b>Add to Home Screen</b>, then <b>Add</b>.</li>
    <li><b>Other browsers:</b> it shows the menu steps for yours.</li>
    <li>Open it once from the new icon while online. After that it plays with no signal.</li>
    <li>There’s also a one-file offline copy you can open by double-clicking; it doesn’t need installing.</li></ul>`],
  ['grow','Growing Up (new)',`
    <p><b>🎒 Growing Up</b> is a second way to play, on the title screen under Help. You start life on Hilltop at <b>12</b>, and live it chapter by chapter: middle school, high school, and one day a place of your own. The two weeks in the rest of this guide stay just as they are.</p>
    <h3>Chapter 1: the new kid</h3>
    <p>Your family (Mom, Dad, your little sister Nia and you) just moved to Hilltop. You have one week, <b>Monday, Aug 24 to Sunday, Aug 30, 2026</b>, and then the first day of seventh grade at <b>Summit View Middle School</b> on Monday, Aug 31. No job and no rent: just your allowance, your family and the kids on the hill.</p>
    ${hTable(['On the top bar','What it means'],[['Money','Your allowance. Chores pay $3, and Saturday is allowance day ($10).'],['Energy','Rest, dinner and bed by 10:30 PM keep it up.'],['Mood','Fun, friends and the view bring it up; nerves bring it down.'],['Family','Chores, family dinner (5:30–7:30 PM), playing with Nia. Missing curfew costs 12.'],['Friends','Every kid you know, and how well. Hang out once a day.'],['Ready','Supplies, the way to school, a haircut, the forms signed and turned in, and an outfit.']])}
    <ul><li><b>Curfew:</b> be home by <b>8:30 PM</b>, or Family drops and you’re sent straight home.</li>
    <li><b>Places:</b> home, MLK Jr Way (the corner market, the barbershop and salon, the murals), People’s Center and Park (the pool, the courts, the summer rec program), the Reading Room (a little community library), Summit View Middle School and the overlook.</li>
    <li><b>Five kids</b> to meet: Marcus on the courts, Ana on MLK, Tavita across the street, Linh at the Reading Room and Zay at the overlook. Any of them can become your best friend.</li>
    <li><b>Saturday:</b> a free back-to-school giveaway at People’s (10 AM–2 PM) and a barbecue across the street in the evening.</li>
    <li><b>Monday, Aug 31:</b> walk to school by the 8:15 AM bell, and Chapter 1 ends with your grade. There’s no game over in Growing Up: every week gets to Monday.</li></ul>
    ${hTip('Get the forms done early','Mom and Dad sign them at home in the evening or on the weekend; the school office takes them weekdays, 9 AM to 3 PM. Friday is the last chance.')}`],
  ['faq','FAQ',`<dl class="tut-faq">
    <dt>Does time pass while I read?</dt><dd>No. The clock only moves when you take an action, travel or wait.</dd>
    <dt>What happens at midnight?</dt><dd>If you’re still up, the day ends anyway and you wake on the couch: less energy, more stress.</dd>
    <dt>Can I change my job?</dt><dd>No. You keep the job you pick for the two weeks. Start a new game to try another.</dd>
    <dt>I can’t clock in. Why?</dt><dd>It’s not a shift day, the shift is in its last hour, or you already worked today. The 📅 Week tab shows your shift days.</dd>
    <dt>Why is an action greyed out?</dt><dd>It’s closed right now, you can’t afford it, or it’s once a day and you already did it. The line under it says which.</dd>
    <dt>Does difficulty change my grade?</dt><dd>No. The score and the cutoffs are the same on every difficulty. Only savings, prices, how hard shifts hit and luck change, so the same play scores lower on a Tight Month.</dd>
    <dt>I went to bed hungry. What now?</dt><dd>Get groceries first thing tomorrow. The market opens at 7 AM.</dd>
    <dt>Where did my save go?</dt><dd>Check 💾 Save slots. Saves are kept in this browser; private windows and clearing site data remove them.</dd>
    <dt>Are the places real?</dt><dd>Hilltop, MLK Jr Way, the Link, People’s Community Center and the views are real. The businesses, neighbors and events are made up.</dd>
    <dt>How do I report a bug or an idea?</dt><dd>${typeof feedbackModal==='function'?'<button class="linkbtn" onclick="feedbackModal()">💬 Send feedback</button>':'Send feedback'} from here, the title screen or ⚙️ Settings. ${typeof whatsNewModal==='function'?'<button class="linkbtn" onclick="whatsNewModal()">🆕 What’s new</button> lists every update.':''}</dd></dl>`],
  ];
}
const helpId=k=>'tut-'+k;
const tutRM=()=>document.documentElement.classList.contains('rm')||(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
// tap a contents link: scroll the guide to that chapter and move focus to its heading (keyboard and screen readers follow along)
window.helpJump=k=>{
  const el=document.getElementById(helpId(k));if(!el)return false;
  try{el.scrollIntoView({block:'start',behavior:tutRM()?'auto':'smooth'})}catch(e){el.scrollIntoView()}
  const h=el.matches('h2,nav')?el:el.querySelector('h2');if(h)try{h.focus({preventScroll:true})}catch(e){}
  return false;
};
function helpDoc(){
  const ch=typeof withMode==='function'?withMode('adult',helpChapters):helpChapters();   // the guide always describes the adult game's numbers, whatever mode is playing
  const toc=`<nav class="tut-toc" id="${helpId('toc')}" tabindex="-1" aria-labelledby="tut-toc-h"><h2 id="tut-toc-h">Contents</h2><ol>${ch.map(([k,h],i)=>
    `<li><a href="#${helpId(k)}" onclick="return helpJump('${k}')"><span class="tut-tn">${i+1}</span>${h}</a></li>`).join('')}</ol></nav>`;
  const secs=ch.map(([k,h,t],i)=>`<section class="tut-ch" id="${helpId(k)}" aria-labelledby="${helpId(k)}-h">
    <h2 id="${helpId(k)}-h" tabindex="-1"><span class="tut-n">${i+1}</span><span>${h}</span></h2>${t}
    <a class="tut-up" href="#${helpId('toc')}" onclick="return helpJump('toc')">↑ Back to contents</a></section>`).join('');
  return `<article class="tut-doc"><header class="tut-cover">${HSVG_COVER()}<h1 id="tut-h">How to play ${esc(GAME.title)}</h1>
    <p class="tut-lede">A player’s guide to your first two weeks on Hilltop: ${ch.length} short chapters, from your first morning to your final grade.</p>
    <p class="tut-small">Version ${APP_VERSION}. Prices are for the ${DIFFS.normal.n} difficulty.</p></header>${toc}${secs}
    <footer class="tut-foot"><p>Hilltop is a real neighborhood. The businesses, neighbors and events in the game are made up, written with love.</p></footer></article>`;
}
let TUT_RET=null;
function helpClose(){
  const el=document.getElementById('tut');if(!el)return;
  el.remove();document.documentElement.classList.remove('tut-open');
  const a=document.getElementById('app');if(a&&!document.getElementById('mbg'))a.removeAttribute('inert');
  const r=TUT_RET;TUT_RET=null;
  const back=(r&&document.body.contains(r)&&r.offsetParent!==null)?r:document.getElementById('helpBtn');
  if(back)try{back.focus({preventScroll:true})}catch(e){}
}
window.helpClose=helpClose;
window.helpPrint=()=>{try{window.print()}catch(e){}};
function helpModal(){
  if(document.getElementById('tut'))return helpJump('toc');
  const ae=document.activeElement;TUT_RET=ae&&ae!==document.body&&!ae.closest('#mbg')?ae:null;
  const el=document.createElement('div');el.className='tut';el.id='tut';
  el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-labelledby','tut-h');el.tabIndex=-1;
  el.innerHTML=withName(`<div class="tut-bar"><button class="tut-x" onclick="helpClose()" aria-label="Close the guide">✕ Close</button>
    <button class="tut-pr" onclick="helpPrint()">📄 Print / save as PDF</button></div>${helpDoc()}`);
  // keys stay inside the guide: Esc closes it, Tab cycles through its links and buttons, and game shortcuts don't fire behind it
  el.addEventListener('keydown',e=>{
    if(document.getElementById('mbg'))return;
    e.stopPropagation();
    if(e.key==='Escape'){e.preventDefault();helpClose();return}
    if(e.key!=='Tab')return;
    const f=[...el.querySelectorAll(FOCUSABLE)].filter(x=>x.offsetParent!==null);if(!f.length)return;
    const first=f[0],last=f[f.length-1],cur=document.activeElement;
    if(!el.contains(cur)||cur===el){e.preventDefault();(e.shiftKey?last:first).focus();return}
    if(e.shiftKey&&cur===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&cur===last){e.preventDefault();first.focus()}});
  document.body.appendChild(el);document.documentElement.classList.add('tut-open');
  const inert=()=>{const a=document.getElementById('app');if(a&&document.getElementById('tut'))a.setAttribute('inert','')};
  inert();
  // opened from a pop-up (⚙️ Settings → Help): that pop-up's close hands focus back and un-inerts the game afterwards, so take both back
  setTimeout(()=>{if(!document.body.contains(el))return;inert();if(!document.getElementById('mbg'))try{el.querySelector('.tut-x').focus({preventScroll:true})}catch(e){}},40);
}
window.helpModal=helpModal;
