// ============================================================
//  TACOMPTON · START YEAR, part 3: the neighbors, the shops and the jobs fit the era.
//  63-era.js sets the year (yearNow, eraHas); this file changes only what is shown, never the keys, so travel and saves work:
//    places    a place that wasn't there yet gets a period stand-in (name, icon, description) or is hidden (ERA_PLACE_ALTS)
//    neighbors the same names and personalities, with jobs, gadgets and details of the year (ERA_PEOPLE_ALTS)
//    jobs      the day-one jobs and the career ladders carry the era's titles (ERA_JOB_ALTS); pay is already scaled by 63-era.js
//    text      everything on screen also goes through ERA_PEOPLE_TEXT (the shops' and actions' modern words), via eraText()
//  Every table is a list of [until, value]: the value is used while yearNow() is before `until` (the first match wins);
//  from the last `until` on, the 2026 original. A 2026 life (and Quick play) never changes.
//  Stand-ins are generic on purpose (a lunch counter, a diner): no real business names. A later places-timeline file can add
//  real places per year by pushing to ERA_PLACE_ALTS[key] or by wrapping eraPlaceAlt(key, year).
//    eraAlt(list)          → the value for the current year, or null (the original)
//    eraPlaceAlt(key, y)   → {name?, ic?, desc?, hidden?} for a place in year y, or null
//    eraPersonAlt(id, y)   → the neighbor's description in year y, or null
// ============================================================

const eraNowY=()=>typeof yearNow==='function'?yearNow():2026;
const eraIsOld=()=>typeof eraStartYear==='function'&&eraStartYear()<2026;
function eraAlt(list,y){if(!list||!eraIsOld())return null;y=y==null?eraNowY():y;for(const [u,v] of list)if(y<u)return v;return null}
window.eraAlt=eraAlt;

// ---- places ----
const ERA_PLACE_ALTS={
  // the bus stop before the T Line came up the hill (Sept 2023)
  link:[[2023,{ic:'🚏',desc:'The bus stop on MLK, a few blocks from your door: a bench, a schedule in a frame, a bus every fifteen minutes or so, and the best people-watching on the hill'}]],
  // Pacific Avenue: the trains left Union Station in 1984; a courthouse from 1992, the glass chandelier from 1994; the university in the warehouses from 1997
  dt_pacific:[[1984,{desc:'Old brick warehouses and wholesale houses, the bus down the middle, and Union Station’s copper dome, where the trains still stop'}],
    [1992,{desc:'Old brick warehouses, a lot of them empty, the bus down the middle, and Union Station’s copper dome, closed up since the trains moved away'}],
    [1994,{desc:'Old brick warehouses waiting for somebody to fix them up, the bus down the middle, and Union Station’s copper dome, a courthouse now'}],
    [1997,{desc:'Old brick warehouses waiting for the university to move in, the bus down the middle, and Union Station’s copper dome, with a glass chandelier of orange, blue and gold glowing in the big window'}],
    [2003,{desc:'Brick warehouses turned classrooms and cafés, the bus down the middle, and Union Station’s copper dome, with a glass chandelier of orange, blue and gold glowing in the big window'}]],
  // Growing Up's copies of the downtown places keep their own "hidden"; these follow the opening years there too
  dt_dome:[[1983,{hidden:true}]],
  dt_glass:[[2002,{hidden:true}]],
  // the Saturday market in Proctor started in the 2000s: before that, nothing to stand in for it
  pr_market:[[2004,{hidden:true}]],
  ru_zoo:[[2018,{desc:'Zoo and aquarium in the park: the aquarium with its sharks, red wolves, and paths shaded by big old trees'}]],
};
function eraPlaceAlt(key,y){return eraAlt(ERA_PLACE_ALTS[key],y)}
window.ERA_PLACE_ALTS=ERA_PLACE_ALTS;window.eraPlaceAlt=eraPlaceAlt;
function eraPlaceWrap(T){if(!T)return;
  for(const k in T){const p=T[k];if(!p||p.__eraP)continue;Object.defineProperty(p,'__eraP',{value:true});
    for(const f of ['name','ic','desc','hidden']){const d=Object.getOwnPropertyDescriptor(p,f);if(!d&&f!=='hidden')continue;if(d&&!d.configurable)continue;
      let v=d&&!d.get?d.value:undefined;const g=d&&d.get;
      const base=()=>g?g.call(p):v;
      Object.defineProperty(p,f,{configurable:true,enumerable:true,
        get(){const a=eraIsOld()?eraPlaceAlt(k):null;if(f==='hidden')return !!base()||!!(a&&a.hidden);return a&&a[f]!=null?a[f]:base()},
        set(x){if(d&&d.set)d.set.call(p,x);else v=x}})}}}
eraPlaceWrap(typeof L_ADULT!=='undefined'?L_ADULT:L);if(typeof G_L!=='undefined')eraPlaceWrap(G_L);
// the T Line drawn at the stop: a city bus before 2023
if(typeof L_ADULT!=='undefined'||typeof L!=='undefined'){const T=typeof L_ADULT!=='undefined'?L_ADULT:L,lk=T.link;
  if(lk&&lk.art){const a0=lk.art;lk.art=o=>{let s=a0(o);if(!eraIsOld()||(typeof eraHas==='function'&&eraHas('tline')))return s;const n=o&&o.night;
    return s.replace(/<g transform="translate\(36,144\) scale\(1\)">[\s\S]*?<\/g>/,`<g transform="translate(40,144)"><rect x="0" y="-36" width="150" height="32" rx="5" fill="${n?'#c9ced2':'#f4f5f2'}"/><rect x="0" y="-14" width="150" height="5" fill="#2a6fa8"/>
      ${[0,1,2,3,4,5].map(i=>`<rect x="${12+i*22}" y="-31" width="16" height="12" rx="2" fill="${n?'#f2d58a':'#5d7f93'}"/>`).join('')}<rect x="136" y="-31" width="12" height="20" fill="${n?'#f2d58a':'#5d7f93'}"/>
      ${[28,120].map(c=>`<circle cx="${c}" cy="-3" r="6" fill="#2b2f33"/>`).join('')}${n?'<circle cx="148" cy="-10" r="2.5" fill="#fff6c8"/>':''}</g>`)}}}

// ---- neighbors: the same people, in the year you meet them ----
const ERA_PEOPLE_ALTS={
  kim:[[1988,'Works the counter at the corner market and is two classes from an accounting degree. Her parents are saving to buy a store of their own someday. Knows every hot sauce on the shelf and will argue about every one of them.']],
  linh:[[1994,'Her family came from Saigon with two suitcases and a soup pot. She works the counter at the corner bakery, makes phở at home on Sundays and talks about opening her own shop on the hill someday. The third time you come in, she asks how the new job is.']],
  dre:[[2005,'Has the chair by the window at the barbershop and a public-access TV show about Tacoma history that eleven people watch, all of them his clients. Coaches the middle-school debate team. Usually wins the argument.']],
  bev:[[2000,'Retired school librarian. Started the free food shelf in the laundromat and keeps it stocked, and runs the block club phone tree with an iron hand.'],
    [2012,'Retired school librarian. Started the free food shelf in the laundromat and keeps it stocked, and runs the block club email list with an iron hand.'],
    [2020,'Retired school librarian. Started the free food shelf in the laundromat and keeps it stocked, and runs the block club group chat with an iron hand.']],
  santos:[[1986,'Next door: Tita Rose, a respiratory therapist, Tito Ben, a Navy vet, three kids and a guitar that comes out every birthday. There is always a plate of pancit with your name on it.']],
  denise:[[2023,'Uses a wheelchair and chairs the block club’s transit committee: she knows which buses have working wheelchair lifts and which corners have no curb cut, and she has been fighting for curb cuts on her street for six years. She’s winning.']],
  malik:[[1996,'A sophomore at TCC studying computer programming, working the summer front desk at People’s. Grew up four blocks away and is going to put the block club’s mailing list on a computer whether they want it or not.'],
    [2006,'A sophomore at TCC studying computer science, working the summer front desk at People’s. Grew up four blocks away and is going to build a website for the block club whether they want one or not.'],
    [2008,'A sophomore at UW Tacoma studying computer science, working the summer front desk at People’s. Grew up four blocks away and is going to build a website for the block club whether they want one or not.']],
  eli:[[1990,'Moved in a month before you, from Seattle, for a job at the port: the office of a shipping company, all carbon paper and telexes. Trying, a little awkwardly, to learn the neighborhood instead of just living in it.'],
    [2000,'Moved in a month before you, from Seattle, where the rent keeps going up. Drives up I-5 every morning to a drafting job at an engineering firm, and is trying, a little awkwardly, to learn the neighborhood instead of just living in it.'],
    [2010,'Moved in a month before you, from Seattle, for the rent. Commutes up I-5 to a software company, and is trying, a little awkwardly, to learn the neighborhood instead of just living in it.'],
    [2020,'Moved in a month before you, from Seattle, for the rent. Works from home two days a week for a software company, and is trying, a little awkwardly, to learn the neighborhood instead of just living in it.']],
  dt_walt:[[1983,'Sixty-eight, a retired stagehand who spent thirty years pushing road cases into the theaters downtown. Plays trumpet on Pacific Avenue most afternoons, mostly Motown, and can tell you which band was loudest and which one tipped the crew best.']],
  dt_calla:[[2002,'A glassblower at a little glass studio in an old warehouse by the tideflats, with forearms like a blacksmith and a laugh you can hear over the furnace. She narrates every piece out loud to whoever wanders in, and has never once dropped one in front of a crowd. Yet.']],
  pr_margo:[[2004,'Grew up in a house on the North End and now sells peaches off a tailgate in Proctor on Saturdays, with fruit from her cousin’s orchard in Eastern Washington. Walks her old dog every evening and knows which porch has the best view of the sunset.']],
  so_sophea:[[1990,'Cambodian-American. Her parents came as refugees and bake baguettes in a rented kitchen on 38th, and she is in at 3 AM to help. She saves the first warm one for whoever is standing at the door.']],
};
function eraPersonAlt(id,y){return eraAlt(ERA_PEOPLE_ALTS[id],y)}
window.ERA_PEOPLE_ALTS=ERA_PEOPLE_ALTS;window.eraPersonAlt=eraPersonAlt;
function eraPeopleWrap(list){if(!list)return;for(const x of list){if(!x||x.__eraN)continue;Object.defineProperty(x,'__eraN',{value:true});
  const d=Object.getOwnPropertyDescriptor(x,'d');if(!d||!d.configurable)continue;let v=d.get?null:d.value;const g=d.get;
  Object.defineProperty(x,'d',{configurable:true,enumerable:true,get(){const a=eraPersonAlt(x.id);return a!=null?a:(g?g.call(x):v)},set(z){v=z}})}}
if(typeof NEIGHBORS!=='undefined')eraPeopleWrap(NEIGHBORS);

// ---- jobs: the era's titles (pay is already the era's, from 63-era.js) ----
const ERA_JOB_ALTS={
  // specialty-coffee cafés weren't common on Hilltop until the 1990s: a diner counter before that
  cafe:[[1993,{n:'Counter server at a Hilltop diner',short:'the diner',place:'the diner',role:'counter server',
    blurb:'Opening shift, 6:30 AM to 2:30 PM, Monday to Friday. Less pay, cash tips, and the whole neighborhood comes through for coffee and eggs before nine.',
    at:'a Hilltop diner',t:['Counter server','Head server','Diner manager'],roles:['counter server','head server','diner manager'],
    shift:['Opening shift: two hundred cups of coffee, a hundred plates of eggs, the bus outside the window every few minutes. The regulars start saying hi to you first.','A rush at 7:40 that nearly breaks you, then a slow sunny hour where a retired teacher tells you about Hilltop in the ’50s.','You remember a regular’s order before she says it. She looks at you like you did a magic trick.'],
    talk:['☕ The cook shows you how to crack two eggs at once. Yours land on the floor. He says the floor is a start.','☕ Your coworker has a theory about every regular. Most of the theories are wrong and all of them are great.','☕ Free coffee and a slice of pie, a minute on the back step, the bus going by.']}]],
  // computer work downtown: the computer room in the 1980s, the help desk in the 1990s, IT support from 2000
  tech:[[1990,{n:'Computer operator at an office downtown',role:'computer operator',
    blurb:'Eight to 4:30, Monday to Friday, on the twelfth floor downtown: the computer room, tape reels, green screens, stacks of printouts, data entry and patience.',
    at:'an office downtown',t:['Computer operator','Programmer','Data processing manager'],roles:['computer operator','programmer','data processing manager'],
    shift:['You load the tape reels for the overnight run, feed the big printer and keep the coffee off the keyboards. The reports go out on time.','Data entry all morning: two thousand invoices, typed in by hand. You find three mistakes in the paper copies and everyone acts like you found gold.','The computer goes down at 10:04 and back up at 10:31. For twenty-seven minutes you are the most important person on the floor.'],
    talk:['☕ The break room has a view of the bay and a coffee machine only you know how to fix. You fix it. Everyone cheers.','☕ Your manager asks what you want to learn next. Nobody has asked you that before.']}],
    [2000,{n:'Help desk tech at an office downtown',role:'help desk tech',
    blurb:'Eight to 4:30, Monday to Friday, on the twelfth floor downtown: desktop computers, printers, passwords and patience.',
    at:'an office downtown',t:['Help desk tech','Network administrator','MIS manager'],roles:['help desk tech','network administrator','MIS manager'],
    shift:['Forty calls: passwords, a printer that hates everyone and a vice president who “didn’t touch anything.” All closed.','You set up twelve desktop computers for the new hires, floppy disks and all, and walk a nervous intern through her first email. She brings you a cookie.','The network goes down at 10:04 and back up at 10:31. For twenty-seven minutes you are the most important person on the floor.']}]],
};
window.ERA_JOB_ALTS=ERA_JOB_ALTS;
const eraJobAlt=k=>eraAlt(ERA_JOB_ALTS[k]);
const ERA_JOB_ORIG={};   // each job's 2026 names, read before the getters go on
for(const k in ERA_JOB_ALTS){const J=JOBS[k];if(!J)continue;const Lo=typeof CAREER_LADDERS!=='undefined'&&CAREER_LADDERS[k];
  ERA_JOB_ORIG[k]={n0:J.n0||J.n,at:Lo?Lo.at:null,t:Lo?Lo.r.map(r=>r.t):[],roles:Lo?Lo.r.map(r=>r.role):[J.role0||J.role]};
  for(const f of ['n','role','place','short','blurb']){const d=Object.getOwnPropertyDescriptor(J,f);if(!d||!d.configurable)continue;let v=d.get?null:d.value;const g=d.get;
    Object.defineProperty(J,f,{configurable:true,enumerable:d.enumerable,get(){const b=g?g.call(J):v,a=eraJobAlt(k);if(!a)return b;
      if(f==='n'||f==='role')return eraJobStr(k,b);return a[f]!=null?a[f]:b},set(z){v=z}})}
  const Ld=typeof CAREER_LADDERS!=='undefined'&&CAREER_LADDERS[k];
  if(Ld){const at0=Ld.at;Object.defineProperty(Ld,'at',{configurable:true,enumerable:true,get(){const a=eraJobAlt(k);return a&&a.at?a.at:at0},set(){}});
    Ld.r.forEach((r,i)=>{const t0=r.t,r0=r.role;
      Object.defineProperty(r,'t',{configurable:true,enumerable:true,get(){const a=eraJobAlt(k);return a&&a.t&&a.t[i]?a.t[i]:t0},set(){}});
      Object.defineProperty(r,'role',{configurable:true,enumerable:true,get(){const a=eraJobAlt(k);return a&&a.roles&&a.roles[i]?a.roles[i]:r0},set(){}})})}
  for(const [T,f] of [[typeof SHIFT_LINES!=='undefined'?SHIFT_LINES:null,'shift'],[typeof WORK_TALK!=='undefined'?WORK_TALK:null,'talk']]){if(!T||!T[k])continue;const v0=T[k];
    Object.defineProperty(T,k,{configurable:true,enumerable:true,get(){const a=eraJobAlt(k);return a&&a[f]?a[f]:v0},set(){}})}}
// a job's 2026 names (the day-one name, each title and role) → the era's
function eraJobPairs(k){const a=eraJobAlt(k),o=ERA_JOB_ORIG[k];if(!a||!o)return [];const out=[];
  if(a.n)out.push([o.n0,a.n]);
  o.t.forEach((t,i)=>{if(a.t&&a.t[i])out.push([`${t} at ${o.at}`,`${a.t[i]} at ${a.at||o.at}`])});
  o.roles.forEach((r,i)=>{const v=a.roles?a.roles[i]:(i===0?a.role:null);if(v)out.push([r,v])});
  return out}
function eraJobStr(k,s){if(!s||typeof s!=='string')return s;for(const [o,n] of eraJobPairs(k))if(s===o)return n;return s}
{const ct=careerTitle;careerTitle=function(k){const kk=arguments.length?k:(typeof S!=='undefined'&&S&&S.job);return eraJobStr(kk,ct(kk))};window.careerTitle=careerTitle}

// ---- on screen: the shops' and actions' modern words (added to eraText, which draws everything) ----
// {until, re, to}: applied while yearNow() is before `until`
const ERA_PEOPLE_TEXT=[
  // the teriyaki spot on MLK opened in 2007 (it closes after 22 years, 33-seasons.js): a fried-chicken lunch counter before
  {until:2007,re:/Chicken teriyaki, rice, that little salad with the orange dressing\. Tacoma runs on this plate\./g,to:'Fried chicken, rice and gravy, and a biscuit on the side. The hill runs on this plate.'},
  {until:2007,re:/Spicy chicken, extra sauce\./g,to:'Extra gravy, extra hot sauce.'},
  {until:2007,re:/Chicken, rice, that sauce\./g,to:'Fried chicken, rice and gravy.'},
  {until:2007,re:/\bthe teriyaki (spot|place)\b/g,to:'the lunch counter'},{until:2007,re:/\bteriyaki (spot|place)\b/g,to:'lunch counter'},
  {until:2007,re:/A teriyaki plate/g,to:'A lunch-counter plate'},{until:2007,re:/Takeout teriyaki/g,to:'Takeout fried chicken'},{until:2007,re:/late teriyaki/g,to:'late fried chicken'},
  {until:2007,re:/\bTERIYAKI\b/g,to:'LUNCH'},
  // the T Line stop's sign and platform
  {until:2023,re:/T · 3 MIN/g,to:'BUS STOP'},{until:2023,re:/Sit on the platform and people-watch/g,to:'Sit on the bus bench and people-watch'},
  {until:2023,re:/40 min\. Free\. (Stress −\d+\.) The whole hill rides this train\./g,to:'40 min, and a transfer gets you home. $1 The whole hill rides this bus.'},
  {until:2023,re:/The whole hill rides this train\./g,to:'The whole hill rides this bus.'},
  {until:2023,re:/the free bus/g,to:'the bus'},{until:2023,re:/on the free Link/g,to:'on the bus'},
  {until:2022,re:/free rides for anyone 18 and under/g,to:'cheaper rides for anyone 18 and under'},
  {until:2022,re:/Free: riders 18 and under ride Pierce Transit buses and the (Link|bus) for nothing in this part of Washington\./g,to:'Kids ride Pierce Transit for a youth fare.'},
  {until:2009,re:/You tap your Youth bus pass on the reader\./g,to:'You show the driver your youth bus pass.'},{until:2009,re:/You tap your youth bus pass on the reader\./g,to:'You show the driver your youth bus pass.'},
  // coffee: espresso drinks before specialty cafés were common here
  {until:1993,re:/A latte and a pastry at The Slow Pour/g,to:'Coffee and a doughnut at The Slow Pour'},
  {until:1993,re:/A cardamom bun and a latte with a leaf on top, at a window table\. The barista, wearing a very serious apron,/g,to:'A cinnamon roll and a cup of coffee, at a window table. The waitress, wearing a very serious apron,'},
  {until:1993,re:/The Slow Pour/g,to:'The Coffee Pot'},{until:1993,re:/THE SLOW POUR/g,to:'THE COFFEE POT'},
  {until:1993,re:/You make your first real latte\. The foam leaf looks like a potato\./g,to:'You make your first milkshake. It is mostly on your apron.'},
  {until:1993,re:/a line of (UW Tacoma|TCC and the UW) students who all want oat milk\. Rosalind shows you how to steam it without screaming the pitcher\. Almost\./g,to:'a line of office workers who all want the soup of the day. Rosalind shows you how to carry four bowls at once. Almost.'},
  {until:2016,re:/who all want oat milk/g,to:'who all want extra foam'},
  {until:1993,re:/teaches you the espresso machine/g,to:'teaches you the coffee urn'},{until:1993,re:/someday, the espresso machine/g,to:'someday, the grill'},
  {until:1993,re:/the sound of the espresso machine/g,to:'the sound of the coffee maker'},
  {until:1993,re:/The barista/g,to:'The waitress'},{until:1993,re:/\bbarista\b/g,to:'counter server'},{until:1993,re:/\bBarista\b/g,to:'Counter server'},
  {until:1993,re:/a Hilltop café/g,to:'a Hilltop diner'},{until:1993,re:/☕ CAFÉ/g,to:'☕ DINER'},
  {until:1993,re:/\blatte\b/g,to:'coffee'},
  // Proctor's ice cream, the zoo, the bridges, the station
  {until:2010,re:/Huckleberry, honey lavender or plain vanilla/g,to:'Huckleberry, rocky road or plain vanilla'},{until:2010,re:/Honey lavender, two scoops/g,to:'Rocky road, two scoops'},
  {until:2018,re:/the Pacific Seas (aquarium|tunnel)/g,to:'the aquarium'},{until:2018,re:/In the Pacific Seas aquarium/g,to:'In the aquarium'},
  {until:2007,re:/Watch the bridges/g,to:'Watch the bridge'},{until:2007,re:/the bridges hum over the water/g,to:'the bridge hums over the water'},{until:2007,re:/the two bridges hum/g,to:'the bridge hums'},
  {until:2007,re:/the Narrows, the bridges,/g,to:'the Narrows, the bridge,'},
  {until:1994,re:/Brick, arches and a glass chandelier in a copper-domed room\./g,to:'Brick, arches and a big copper dome.'},
  {until:1994,re:/In the copper-domed station, a glass chandelier of orange, blue and gold hangs over the lobby like a sunset somebody caught in a net\. You stand under it longer than you meant to\./g,to:'Union Station’s copper dome catches the afternoon light. You stand on the sidewalk and look up at it longer than you meant to.'},
  {until:1994,re:/A huge chandelier of orange, blue and gold glass hangs in the window of the old train station\. You lie down on the bench to see it better\. A guard says that’s allowed\. You think\./g,to:'You press your face to the dusty window of the old train station. Under the copper dome it’s all pigeons and echoes.'},
  {until:1983,re:/Union Station’s glass, the wooden Dome, and the Bridge of Glass/g,to:'old storefronts and Union Station’s copper dome'},
  {until:2002,re:/Union Station’s glass, the wooden Dome, and the Bridge of Glass/g,to:'Union Station’s copper dome and the wooden Dome'},
  {until:1983,re:/Downtown & the Dome District/g,to:'Downtown'},
  {until:1994,re:/Look at the glass in Union Station/g,to:'Look at Union Station’s copper dome'},
  {until:2002,re:/the Museum of Glass gift shop/g,to:'the art museum gift shop'},
  {until:2005,re:/bubble tea, /g,to:'egg rolls, '},
  // phones, computers and packages before they were part of everyday life
  {until:1996,re:/Use the public computers to catch up on paperwork/g,to:'Use the typewriter and the copier to catch up on paperwork'},
  {until:1996,re:/Look up Summit View on the computer/g,to:'Look up Summit View in the district binder'},
  {until:1996,re:/the map of the school she printed off the website/g,to:'the map of the school she copied from the office handout'},
  {until:1996,re:/on the phone with the internet company/g,to:'on the phone with the phone company'},
  {until:1996,re:/The librarian finds you a practice test online and a free printer\./g,to:'The librarian finds you a book of practice tests and lets you use the copier.'},
  {until:1996,re:/Dad frames the offer email\. Not literally\. He prints it and puts it on the fridge\./g,to:'Dad wants to frame the offer letter. He settles for the fridge.'},
  {until:1996,re:/he is building an app for the block club/g,to:'he is putting the block club’s mailing list on a computer'},
  {until:2008,re:/he is building an app for the block club/g,to:'he is building a website for the block club'},
  {until:1998,re:/phone in a zipped pocket/g,to:'wallet in a zipped pocket'},
  {until:2002,re:/Slower to answer texts, much harder to grab\./g,to:'Slower to get at, much harder to grab.'},
  {until:2005,re:/ and a podcast\./g,to:' and a Walkman.'},
  {until:2012,re:/block club group chat/g,to:'block club phone tree'},
  {until:2010,re:/video calls home tonight/g,to:'a long call home tonight'},
  {until:2004,re:/The Wi-Fi is named after your landlord’s dog\./g,to:'The modem screeches when it connects, like your landlord’s dog.'},
  {until:2004,re:/Skip it and use the café Wi-Fi/g,to:'Skip it and use the library computers'},
  {until:2004,re:/Every email for the next two weeks will happen on a café stool with your back to the wall outlet\./g,to:'Every email for the next two weeks will happen in the library, with your name on the sign-up sheet.'},
  {until:2010,re:/paid from your phone before the coffee’s ready/g,to:'a check in the mail before the coffee’s ready'},
];
// the jobs' 2026 names, as they appear anywhere (the phone's job listings, the summary, the messages)
function eraJobText(s){for(const k in ERA_JOB_ALTS)for(const [o,n] of eraJobPairs(k))if(o.length>12&&s.includes(o))s=s.split(o).join(n);return s}
window.ERA_PEOPLE_TEXT=ERA_PEOPLE_TEXT;
{const et=eraText;eraText=function(s){s=et(s);if(!s||typeof s!=='string'||!eraIsOld())return s;const y=eraNowY();
  for(const r of ERA_PEOPLE_TEXT){if(y>=r.until)continue;r.re.lastIndex=0;s=s.replace(r.re,r.to)}
  return eraJobText(s)};window.eraText=eraText}

// ---- the phone counter on MLK before cell phones: a TV & radio repair shop; no pickup lockers before there were any ----
{const ah=actionsHere;actionsHere=function(){let a=ah.apply(this,arguments);
  try{if(!eraIsOld()||isGrow()||typeof eraHas!=='function')return a;
    if(!eraHas('cell'))a=a.flatMap(x=>{if(!x||!/^(Upgrade|Replace) your phone/.test(x.l||''))return [x];
      if(S.loc!=='mlk')return [];const d=day();S.eraDid=S.eraDid||{};if(S.eraDid.tv===d)return [];
      return [{ic:'📺',l:'Look in at the TV & radio repair shop',s:'15 min. Stress −2. Tubes, knobs and a counter piled with radios. Once a day.',cat:x.cat||'here',
        fn:()=>{S.eraDid.tv=d;pass(15);adj('stress',-2);say(pick(['📺 A wall of TVs all showing the same ballgame, and a man with a magnifier on his forehead soldering a radio. He says it’ll play better than new.','📺 The repairman shows you the inside of a TV: tubes, wires and dust. “Everything can be fixed,” he says, “if you have the part.”']))}}]});
    if(!eraHas('grocery'))a=a.filter(x=>!(x&&/pickup locker/.test(x.l||'')))}catch(e){console.error(e)}
  return a}}

// ---- the day-one hookup: the phone company before home internet ----
if(typeof EV!=='undefined'){const e=EV.find(x=>x.id==='internet_bill');
  if(e){const r0=e.run,c0=e.choices,t0=e.tile,old=()=>eraIsOld()&&eraNowY()<1997;
    Object.defineProperty(e,'tile',{configurable:true,enumerable:true,get(){return old()?['🧾','Phone hookup','bad']:t0},set(){}});
    e.run=function(){if(!old())return r0.apply(this,arguments);say('🧾 The phone company man is at your door at 8 sharp with a clipboard and a beige phone. Hookup plus the first month, or you can sign the line that says you’ll do it some other time.')};
    e.choices=function(){if(!old())return c0.apply(this,arguments);const c=rp(60),h=rp(42);return [
      {ic:'☎️',l:`Get the phone hooked up now (${$(c)})`,s:'The full price. Stress −4: a long call home tonight.',dis:S.money<c,fn:()=>{spend(c);adj('stress',-4);say(`🧾 Fifteen minutes and a dial tone. ${$(c)} for the hookup and the first month. Your number is one digit off the pizza place’s.`)}},
      {ic:'📞',l:`Call and haggle for the basic plan (${$(h)})`,s:'30 minutes on hold. Cheaper. Energy −5.',dis:S.money<h,fn:()=>{stPass(30);spend(h);adj('energy',-5);say(`☎️ Thirty minutes of hold music later, a very tired operator finds you the basic plan: ${$(h)}. You both say “have a good one” like you mean it.`)}},
      {ic:'🪙',l:'Skip it and use the pay phone on the corner',s:'Saves the money. Stress +6.',fn:()=>{adj('stress',6);say('🪙 You send him away. Every call for the next two weeks will happen at the pay phone outside the market, with a pocket of quarters.')}}]}}}

// ---- the guide: one line in the Start year section ----
if(typeof eraGuideHTML==='function'){const g=eraGuideHTML;eraGuideHTML=function(){return g.apply(this,arguments).replace('<li>Your save remembers its start year.',
  '<li>The neighbors, the shops and the jobs fit the year: a diner counter before the coffee shops, a computer operator before the help desk, a lunch counter where the teriyaki spot will be, and nobody with a smartphone before there were any.</li><li>Your save remembers its start year.')};window.eraGuideHTML=eraGuideHTML}
