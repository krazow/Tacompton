// ============================================================
//  TACOMPTON · HISTORICAL TACOMA PLACES: real Tacoma restaurants, parks and landmarks that open and close on their real
//  dates, so a life started in 1980 goes where people went then and watches them give way to newer places.
//
//  TP_PLACES is the timeline: {key, name, hood, opened:[y,m,d], closed?:[y,m,d], replacedBy?, source, ...}.
//    hood       a HOODS key, or 'hilltop' (Hilltop's own place list is fixed, so Hilltop places are a spot inside MLK)
//    opened     the first day it is there; closed: the first day it is gone (open while opened ≤ today < closed)
//    in         a place key: the spot shows as an action inside that place instead of its own stop in Go somewhere
//    existing   a place the game already has (Wright Park, Point Defiance): listed in the guide, nothing new added
//    sudden     it closed without warning (a fire, an overnight closing): no farewell visit
//  Only places with an opening and a closing year confirmed by a source are here; each `source` says where.
//  Left out for want of a confirmed year: Shakabrah Java (6th Ave), the Hob Nob (6th Ave), Sambo's (South Tacoma Way),
//  Shari's (two Tacoma diners, closed Jan 2022 and Jul 21, 2024; opening years not found), Hooters (opened Dec 2002;
//  no confirmed closing), Engine House No. 9 and Bob's Java Jive's bar (taverns: 21 and over).
//  Union Station (65-era-people.js) and the ASARCO stack (63-era.js) are already in the game and aren't repeated.
//
//  Each place is drawn, has a visit (a meal, a show or a look around, money through rp()), news lines in the city news as
//  it opens and closes (33-seasons.js CITY), a farewell visit in the month before it closes if you've been, and your
//  most-visited places in the life summary. Quick play and 2026 starts see only the places open on that day.
//    tpOpenOn(key, y, m, d) → true if the place is open on that day
//    tpOpenNow(key)          → open on the day being played
//    tpToday()               → [y, m, d] of the day being played (Aug 3, 2026 with no game)
//    TP_BY_KEY[key]          → the entry
// ============================================================

const TP_PLACES=[
  // ---- the West End ----
  {key:'pizzapipes',name:'Pizza & Pipes',hood:'westend',opened:[1974,2,1],closed:[1999,8,3],sudden:true,kind:'meal',ic:'🍕',art:'organ',sign:'PIZZA & PIPES',price:16,hours:[690,1290],
    where:'at 19th & Mildred, on the line with University Place',
    desc:'A pizza parlor at 19th & Mildred with a giant theater pipe organ behind glass: pipes, drums, bells and lights that flash with the music',
    act:'A pizza and the pipe organ',
    lines:['🍕 A pitcher of root beer, a pizza on a metal stand, and the organist rising out of the floor on a lift. The whole room claps along to a march, and the pipes behind the glass make your seat buzz.','🍕 Somebody’s birthday: the organ plays it so loud the drums and cymbals on the wall go off too. A kid at the next table forgets to eat.','🍕 Long tables, red pepper flakes in a shaker, and a song from an old movie you almost know. The lights on the organ pipes blink in time.'],
    openNews:null,closeNews:'🔥 Pizza & Pipes burns down. A fire in the night of August 3 destroys the pizza parlor at 19th & Mildred and its giant pipe organ, after 25 years of birthday parties.',
    source:'pstos.org “Pizza & Pipes” (the organ played daily from February 1974 until the restaurant was destroyed by fire on Aug 3, 1999); southsoundtalk.com “Pierce County restaurants long gone but not forgotten” (May 2022)'},
  {key:'kimanh',name:'Kim Anh',hood:'westend',opened:[1993,8,1],closed:[2023,4,22],kind:'meal',ic:'🍜',art:'diner',sign:'KIM ANH',col:'#b8402a',price:15,hours:[660,1260],
    where:'in the West End',
    desc:'A little Vietnamese restaurant in the West End: phở, rice plates, spring rolls and a pot of tea on every table',
    act:'Phở at Kim Anh',
    lines:['🍜 A bowl of phở bigger than your head, a plate of basil and bean sprouts, and a squeeze bottle of hot sauce. The broth fogs up the window.','🍜 Spring rolls, a rice plate and iced coffee so strong you feel it in your teeth. Everybody at the next table is a regular.'],
    openNews:'🍜 Kim Anh opens in the West End: a little Vietnamese restaurant with phở, rice plates and spring rolls. The line on a rainy day goes out the door.',
    closeNews:'🍜 Kim Anh closes after 30 years in the West End. Regulars fill the last week, and the thank-you notes cover the front window.',
    source:'The News Tribune, via AOL (Apr 27, 2023): opened August 1993 on N Pearl St in Westgate, later on S Mildred St; closed Apr 22, 2023'},
  // ---- Downtown ----
  {key:'bimbos',name:'Bimbo’s',hood:'downtown',opened:[1921,1,1],closed:[2001,10,1],replacedBy:'convention',kind:'meal',ic:'🍝',art:'diner',sign:'BIMBO’S',col:'#2f6f3e',price:22,hours:[690,1290],
    where:'downtown, near Union Station',
    desc:'An old Italian restaurant downtown in what used to be Little Italy: spaghetti, meatballs, red sauce and booths that have seen everything',
    act:'Spaghetti at Bimbo’s',
    lines:['🍝 Spaghetti and meatballs, garlic bread, and a booth with a rip in the seat taped over years ago. The waitress calls you “hon” and brings more bread without asking.','🍝 Ravioli in red sauce, a basket of bread and a cup of coffee after. The walls are covered in old photos of downtown.'],
    openNews:null,closeNews:'🍝 Bimbo’s serves its last spaghetti after 80 years downtown. The city bought the block for a new convention center, and the old building is coming down.',
    source:'tacomahistory.live “Bimbo’s” (2017): opened 1921 as the Avenue Cafe; closed late September 2001 after 80 years; the city bought and tore down the building for the convention center; southsoundtalk.com (May 2022)'},
  {key:'convention',name:'Greater Tacoma Convention Center',hood:'downtown',opened:[2004,12,1],kind:'look',ic:'🏢',art:'hall',sign:'CONVENTION CENTER',
    where:'downtown, where Bimbo’s was',
    desc:'A big glass-fronted convention hall downtown, on the block where Bimbo’s used to be: a trade show, a home show or a big meeting most weeks',
    act:'Look around the convention center lobby',
    lines:['🏢 A tall glass lobby, a banner for this weekend’s home and garden show, and a hundred name tags walking past. You take a free pen.','🏢 You wander the lobby during a big show: booths, free samples and a guy demonstrating a mop like his life depends on it.'],
    openNews:'🏢 The Greater Tacoma Convention Center opens downtown, on the block where Bimbo’s used to be: a glass front, big halls and its first trade shows.',closeNews:null,
    source:'Mortenson project page: Greater Tacoma Convention & Trade Center completed December 2004; built on the Bimbo’s block (tacomahistory.live)'},
  {key:'johnnys',name:'Johnny’s Dock',hood:'downtown',opened:[1977,1,1],closed:[2020,3,16],replacedBy:'johnnys2',kind:'meal',ic:'⚓',art:'water',sign:'JOHNNY’S DOCK',col:'#24507a',price:30,hours:[690,1290],
    where:'on the Thea Foss Waterway',
    desc:'A restaurant on the dock on the Foss Waterway: steaks, chowder and a window table over the boats',
    act:'Dinner at Johnny’s Dock',
    lines:['⚓ A cup of chowder, a steak and a window over the water. The boats on the Foss rock a little every time the wind comes up.','⚓ Dinner at a window table. The sun goes down behind downtown and the lights come on in the water.'],
    openNews:null,closeNews:'⚓ Johnny’s Dock on the Foss Waterway closes its doors in the pandemic. The chairs go up on the tables and stay there.',
    source:'The News Tribune, via Yahoo News: opened 1954 near Pier 3, moved to the Thea Foss Waterway in 1977, closed March 2020'},
  {key:'johnnys2',name:'Johnny’s Dock',hood:'downtown',opened:[2025,6,1],kind:'meal',ic:'⚓',art:'water',sign:'JOHNNY’S DOCK',col:'#24507a',price:30,hours:[690,1290],
    where:'on the Thea Foss Waterway',
    desc:'Johnny’s Dock, back on the Foss Waterway under new owners: a fresh menu, the same window tables over the boats',
    act:'Dinner at Johnny’s Dock',
    lines:['⚓ Chowder, a burger and a window over the water. The new menu is new; the view is the same one people have come for since the ’70s.','⚓ A table by the window as the sun goes behind downtown. A couple of old regulars at the bar are telling the new server how it used to be.'],
    openNews:'⚓ Johnny’s Dock is back: new owners reopen the old restaurant on the Foss Waterway after five years dark.',closeNews:null,
    source:'whatnow.com (Jun 27, 2025): Johnny’s Dock returned to the Thea Foss Waterway under new ownership; The News Tribune via Yahoo News (planned for summer 2025)'},
  {key:'rialto',name:'The Rialto Theater',hood:'downtown',opened:[1918,9,7],kind:'show',ic:'🎭',art:'theater',sign:'RIALTO',price:30,hours:[1110,1320],
    where:'in the Theater District',
    desc:'A 1918 theater downtown with a white front and a marquee, and the Pantages across the plaza: the Theater District',
    act:'A show at the Rialto',
    lines:['🎭 Velvet seats, a painted ceiling and a show that has the whole room on its feet at the end. You walk out into the cold feeling taller.','🎭 The lights go down in a theater older than anybody in it. Two hours later the crowd spills out onto the sidewalk, still humming.'],
    openNews:null,closeNews:null,
    source:'cinematreasures.org “Rialto Theater” (opened Sept 7, 1918; bought and remodeled for live shows around 1990 with City of Tacoma funding)'},
  {key:'pantages',name:'The Pantages Theater',hood:'downtown',in:'tp_rialto',opened:[1983,1,1],kind:'show',ic:'🎭',price:40,hours:[1110,1320],
    where:'in the Theater District, restored',
    desc:'The 1918 vaudeville palace on Broadway, restored to its gold and red',
    act:'A show at the Pantages, across the plaza',
    lines:['🎭 Gold, red velvet and a ceiling full of carved faces. A touring show fills the stage, and the balcony laughs a half-second after the floor.','🎭 You sit in the balcony of a theater built in 1918 and look down at the stage. It is the best seat you have ever paid for.'],
    openNews:'🎭 The Pantages reopens downtown, restored: the 1918 vaudeville palace on Broadway shines again, gold and red, as the heart of a new theater district.',closeNews:null,
    source:'HistoryLink essay 5182: the Pantages opened Jan 7, 1918; restored to its former glory in 1983 as the Broadway Center for the Performing Arts'},
  // ---- Proctor ----
  {key:'knapps',name:'Knapp’s',hood:'proctor',opened:[1938,1,1],closed:[2026,6,8],sudden:true,kind:'meal',ic:'🥞',art:'diner',sign:'KNAPP’S',col:'#8a3a2a',price:15,hours:[420,900],
    where:'in Proctor',
    desc:'The old diner on Proctor Street: pancakes, hash browns, a counter with stools and coffee in thick white mugs',
    act:'Breakfast at Knapp’s',
    lines:['🥞 A stack of pancakes, crispy hash browns and coffee in a thick white mug that keeps getting filled. Half of Proctor is here in its slippers.','🥞 Eggs, bacon and toast at the counter. The guy on the next stool reads the whole newspaper out loud to nobody in particular.','🥞 A booth by the window, a plate of biscuits and gravy, and the whole Saturday ahead of you.'],
    openNews:null,closeNews:'🥞 Knapp’s, the diner in Proctor, closes without warning after 88 years. A sign on the door, and a lot of people standing on the sidewalk reading it twice.',
    source:'KIRO 7 (Jun 9, 2026) “Historic 88-year-old Tacoma diner abruptly closes”: in Proctor since 1938, closed Monday, June 8, 2026; MyNorthwest'},
  // ---- the Stadium District ----
  {key:'harvester',name:'The Harvester',hood:'stadium',opened:[1930,1,1],closed:[2023,5,31],kind:'meal',ic:'🍳',art:'diner',sign:'HARVESTER',col:'#6a4a2a',price:15,hours:[420,900],
    names:[[1993,'Scotty’s']],
    where:'in the Stadium District',
    desc:'The corner diner on North Tacoma Avenue: breakfast all morning, a counter, and booths full of regulars',
    act:'Breakfast at the corner diner',
    lines:['🍳 Two eggs, hash browns, toast and bottomless coffee at the counter. The cook calls the orders out like a ballgame.','🍳 Biscuits and gravy and a window booth. Outside, the Stadium District’s big old trees drip from last night’s rain.'],
    openNews:'🍳 The old Scotty’s diner in the Stadium District has a new name: The Harvester. Same corner, same counter, same coffee.',
    closeNews:'🍳 The Harvester closes on the corner in the Stadium District after 93 years as one diner or another. A for-lease sign goes up in the window.',
    source:'The News Tribune, via AOL (Jun 7, 2023): opened 1930 as Scotty’s (Tacoma Public Library archives), renamed The Harvester in 1993, closed May 31, 2023'},
  // ---- the South End and South Tacoma Way ----
  {key:'javajive',name:'Bob’s Java Jive',hood:'southend',opened:[1930,1,1],kind:'look',ic:'☕',art:'pot',sign:'JAVA JIVE',
    where:'on South Tacoma Way',
    desc:'A building shaped like a giant coffee pot on South Tacoma Way, built around 1930, with a red neon sign',
    act:'Stop and look at the giant coffee pot',
    lines:['☕ A coffee pot twenty-five feet tall, with a handle, a spout and a little lid on top, sitting beside South Tacoma Way. You stand there grinning at it like a tourist.','☕ The neon on the giant coffee pot buzzes on at dusk. A car slows down so the kids in the back can look.'],
    openNews:null,closeNews:null,
    source:'pacific-hwy.net “The Historic Pacific Highway”: built after a 1927 purchase, opened in 1930 as the Coffee Pot Restaurant; Bob’s Java Jive from 1955; on the National Register'},
  {key:'steves',name:'Steve’s Gay ’90s',hood:'southend',opened:[1941,1,1],closed:[1997,12,1],kind:'meal',ic:'🎩',art:'diner',sign:'STEVE’S',col:'#7a2a4a',price:24,hours:[1020,1320],
    where:'on South Tacoma Way',
    desc:'A big old-fashioned dinner house on South Tacoma Way, all red velvet, gaslight-style lamps and 1890s decorations',
    act:'Dinner at Steve’s Gay ’90s',
    lines:['🎩 Red velvet, a chandelier, waiters in vests and a steak dinner with a baked potato the size of a shoe. A piano plays songs from a hundred years ago.','🎩 Prime rib, a relish tray and a room full of birthday and anniversary dinners. Somebody’s grandma sings along with the piano.'],
    openNews:null,closeNews:'🎩 Steve’s Gay ’90s on South Tacoma Way serves its last dinner after more than 50 years. The red velvet and the old lamps are sold off piece by piece.',
    source:'southsoundtalk.com “Pierce County restaurants long gone but not forgotten” (May 2022): 5200 block of South Tacoma Way, 1941 (first as Steve’s Friendly Tavern) to 1997'},
  {key:'mall',name:'Tacoma Mall',hood:'southend',opened:[1965,10,13],kind:'shop',ic:'🛍️',art:'mall',sign:'TACOMA MALL',price:9,
    where:'off I-5 in South Tacoma',
    desc:'The big mall off I-5: department stores at the ends, a food court, and the whole South Sound walking laps on a rainy Saturday',
    act:'Walk the mall and grab a snack',
    lines:['🛍️ A soft pretzel, a lap past every store window and a bench by the fountain. The mall on a rainy Saturday is the whole South Sound in one hallway.','🛍️ You try on a jacket you can’t afford, buy socks you can, and share a bench with somebody’s grandpa who is also just here to walk.'],
    openNews:null,closeNews:null,
    source:'Wikipedia “Tacoma Mall”: opened Oct 13, 1965, at 4502 S Steele St; Sears opened 1981 and closed Sept 2, 2018'},
  {key:'sears',name:'Sears at the Tacoma Mall',hood:'southend',in:'tp_mall',opened:[1981,1,1],closed:[2018,9,2],kind:'shop',ic:'🧰',price:12,
    where:'at the Tacoma Mall',
    desc:'The Sears at the mall: tools, appliances, a portrait studio and a wall of TVs',
    act:'Browse Sears',
    lines:['🧰 You look at every wrench in the tool department and buy a pair of work gloves. A wall of TVs shows the same game twenty times.','🧰 Washers, dryers, a lawnmower you could ride and a family getting their portrait taken in matching sweaters.'],
    openNews:'🧰 A new Sears opens at the Tacoma Mall: tools, appliances and a catalog counter.',closeNews:'🧰 The Sears at the Tacoma Mall closes after 37 years. The clearance signs are up for weeks, then the lights go off.',
    source:'Wikipedia “Tacoma Mall”: Sears opened at the mall in 1981; closing announced May 31, 2018, closed Sept 2, 2018'},
  // ---- Ruston Way and Old Town's waterfront ----
  {key:'clinker',name:'Clinkerdagger, Bickerstaff & Pett’s',hood:'oldtown',opened:[1972,3,1],closed:[2006,1,1],replacedBy:'dukes',kind:'meal',ic:'🍽️',art:'water',sign:'CLINKERDAGGER',col:'#5a3a2a',price:34,hours:[690,1290],
    where:'on Ruston Way',
    desc:'An old-English-style public house on the Ruston Way waterfront: dark wood, a fireplace and windows over Commencement Bay',
    act:'Dinner on Ruston Way',
    lines:['🍽️ Prime rib, dark wood, a fire going in the corner and the bay out the window. You eat slowly on purpose.','🍽️ A window table as the sun goes down over the Olympics. The ferries cross the bay like little lit-up shoeboxes.'],
    openNews:null,closeNews:'🍽️ Clinkerdagger’s on Ruston Way changes hands one last time and closes: the spot is becoming a Duke’s Chowder House.',
    source:'southsoundtalk.com (Tacoma restaurants remembered): opened March 1972 at 3327 Ruston Way; became Duke’s Chowder House in 2006'},
  {key:'dukes',name:'Duke’s Chowder House',hood:'oldtown',opened:[2006,1,1],kind:'meal',ic:'🥣',art:'water',sign:'DUKE’S',col:'#2a5a6a',price:30,hours:[690,1290],
    where:'on Ruston Way, where Clinkerdagger’s was',
    desc:'A chowder house on Ruston Way in the old Clinkerdagger’s spot: clam chowder, a deck and the whole bay out the window',
    act:'Chowder on Ruston Way',
    lines:['🥣 A bowl of clam chowder with a big chunk of bread, on the deck, with the bay and the Olympics doing their thing. Worth the bus ride.','🥣 Chowder and a burger at a window table. A sailboat tacks back and forth out on the bay like it can’t make up its mind.'],
    openNews:'🥣 Duke’s Chowder House opens on Ruston Way in the old Clinkerdagger’s spot: chowder, a deck and the same view of the bay.',closeNews:null,
    source:'southsoundtalk.com (Tacoma restaurants remembered): 3327 Ruston Way became Duke’s Chowder House in 2006'},
  {key:'harborlights',name:'Harbor Lights',hood:'oldtown',opened:[1959,1,1],kind:'meal',ic:'🦀',art:'water',sign:'HARBOR LIGHTS',col:'#24507a',price:38,hours:[690,1290],
    where:'on Ruston Way',
    desc:'The old waterfront restaurant on Ruston Way, out over the water on pilings, with a neon sign and a view straight across the bay',
    act:'Dinner at Harbor Lights',
    lines:['🦀 Crab cakes, a baked potato and a window right over the water. A tugboat goes by close enough to wave at.','🦀 Clam chowder and a table by the glass. The lights of Northeast Tacoma come on across the bay one at a time.'],
    openNews:null,closeNews:null,
    source:'Job Carr Cabin Museum blog “Seafood in Old Town Tacoma”: Harbor Lights on the Old Town waterfront since 1959; sold to Anthony’s Restaurants in 2000 and still open'},
  {key:'lobster',name:'Lobster Shop',hood:'oldtown',opened:[1981,1,1],kind:'meal',ic:'🦞',art:'water',sign:'LOBSTER SHOP',col:'#8a2a2a',price:45,hours:[960,1290],
    where:'on Ruston Way',
    desc:'A white-tablecloth restaurant on Ruston Way with big windows over Commencement Bay',
    act:'A fancy dinner at the Lobster Shop',
    lines:['🦞 White tablecloths, a candle, and the bay going pink, then blue, then dark out the big window. It costs a lot. It feels like a lot, in the good way.','🦞 You dress up a little, order the thing you can’t pronounce, and watch the lights come on across the bay.'],
    openNews:'🦞 The Lobster Shop opens on Ruston Way: white tablecloths and big windows over the bay, as the old mill waterfront slowly turns into a place to walk and eat.',closeNews:null,
    source:'southsoundtalk.com (2023 profile): the Lobster Shop at 4015 Ruston Way opened in 1981'},
  // ---- Point Defiance ----
  {key:'dune',name:'Dune Peninsula & Frank Herbert Trail',hood:'ruston',opened:[2019,7,6],kind:'walk',ic:'🏜️',art:'park',sign:'DUNE PENINSULA',
    where:'at Point Defiance',
    desc:'A grassy peninsula and loop trail at Point Defiance, built on the old smelter’s slag and named for the Tacoma-born author of Dune',
    act:'Walk the Frank Herbert Trail',
    lines:['🏜️ A paved loop around a grassy hill out in the bay, with the Narrows on one side and the Olympics on the other. Hard to believe this was a pile of smelter slag.','🏜️ Wind off the water, kids rolling down the grass hill, and a sign about Frank Herbert, who grew up in Tacoma and wrote about a desert planet. You do one more loop.'],
    openNews:'🏜️ Dune Peninsula opens at Point Defiance: a grassy hill and the Frank Herbert Trail on land that was smelter slag, with views of the Narrows and the Olympics.',closeNews:null,
    source:'HistoryLink essay 23007 and Parks Tacoma: Dune Peninsula at Point Defiance Park opened July 6, 2019, on slag from the ASARCO smelter'},
  // ---- Hilltop (a spot inside MLK: Hilltop's own place list stays the same) ----
  {key:'frisko',name:'Frisko Freeze',hood:'hilltop',in:'mlk',opened:[1950,7,1],kind:'meal',ic:'🍔',price:11,hours:[660,1320],
    where:'on Division Avenue',
    desc:'The walk-up burger stand on Division with the big neon sign',
    act:'A burger and a shake at Frisko Freeze, on Division',
    lines:['🍔 A burger in paper, fries in a paper boat and a shake so thick the straw stands up. You eat in the parking lot under the neon like everybody always has.','🍔 The line at the walk-up window is half high-school kids and half grandparents. The burger is hot, the shake is cold, and the neon hums.'],
    openNews:null,closeNews:null,
    source:'docomomo-wewa.org (from the 2008 Tacoma Register nomination): Frisko Freeze built July 1950 at 1201 Division Ave; still open'},
  // ---- parks and landmarks the game already has (the guide lists them; nothing new to add) ----
  {key:'wright',name:'Wright Park',hood:'stadium',existing:'st_park',opened:[1886,7,5],ic:'🌳',
    source:'HistoryLink essay 22453: Charles B. Wright gave the land and the city accepted it as a park on July 5, 1886'},
  {key:'seymour',name:'W. W. Seymour Conservatory',hood:'stadium',existing:'st_park',opened:[1908,1,1],ic:'🌿',
    source:'Parks Tacoma, W. W. Seymour Conservatory: opened in 1908 in Wright Park'},
  {key:'ptdef',name:'Point Defiance Park',hood:'ruston',existing:'ru_park',opened:[1888,1,1],ic:'🌲',
    source:'Parks Tacoma, Point Defiance Park history: a city park since 1888'},
  {key:'zoo',name:'Point Defiance Zoo & Aquarium',hood:'ruston',existing:'ru_zoo',opened:[1899,1,1],ic:'🐺',
    source:'Parks Tacoma, Point Defiance Park history: the zoo began with the first bear pit in 1899; the Pacific Rim zoo from the 1977 bond'},
];
// milestones with no place of their own: news lines and the guide
const TP_NEWS=[
  {id:'tp_foss1',at:[2010,9,1],g:'🚶 The Thea Foss esplanade’s first stretch opens',t:'🚶 The first stretch of the new esplanade opens along the Thea Foss Waterway downtown: a waterside walk where the old warehouses and rail yards were.',
    source:'City of Tacoma, Thea Foss Waterway Site 11 Esplanade: Phase 1 constructed in 2010'},
  {id:'tp_foss2',at:[2015,6,12],g:'🚶 More of the Thea Foss esplanade opens',t:'🚶 More of the Thea Foss esplanade opens: a longer walk by the water from the Museum of Glass toward the boats.',
    source:'City of Tacoma, Thea Foss Waterway Site 11 Esplanade Phase 2: opening June 12, 2015'},
  {id:'tp_ppark',at:[2013,5,22],g:'🌳 People’s Park on MLK reopens, fixed up',t:'🌳 People’s Park on MLK reopens with new trees, benches, a stage at the lower end, a moved play area and basketball court, and new public art. Music and a crowd for the celebration.',
    source:'Tacoma Daily Index: Peoples Park reopening and public art dedication, May 22, 2013 (paid for by the 2005 parks bond)'},
];
const TP_BY_KEY={};TP_PLACES.forEach(e=>{TP_BY_KEY[e.key]=e});
window.TP_PLACES=TP_PLACES;window.TP_NEWS=TP_NEWS;window.TP_BY_KEY=TP_BY_KEY;

// ---- the day being played ----
const tpN=a=>a?a[0]*10000+(a[1]||1)*100+(a[2]||1):null;
function tpToday(){try{if(typeof S!=='undefined'&&S&&typeof dateOf==='function'){const o=dateOf(day());return [o.y,o.m,o.d]}}catch(e){}return [2026,8,3]}
function tpOpenOn(key,y,m,d){const e=TP_BY_KEY[key];if(!e)return false;const t=tpN([y,m,d]);return t>=tpN(e.opened)&&(!e.closed||t<tpN(e.closed))}
const tpOpenNow=key=>tpOpenOn(key,...tpToday());
const tpPlaceKey=e=>e.in||e.existing?null:'tp_'+e.key;
function tpName(e,y){y=y==null?tpToday()[0]:y;if(e.names)for(const [u,n] of e.names)if(y<u)return n;return e.name}
const tpYear=a=>a[0];
const tpMonth=a=>a[1]?`${MONTHS[a[1]-1]} ${a[0]}`:String(a[0]);
window.tpToday=tpToday;window.tpOpenOn=tpOpenOn;window.tpOpenNow=tpOpenNow;window.tpName=tpName;
const tpS=()=>{S.tp=S.tp||{v:{},last:{},day:{},bye:{}};const T=S.tp;T.v=T.v||{};T.last=T.last||{};T.day=T.day||{};T.bye=T.bye||{};return T};

// ---- the drawings ----
const tpArtFns={
  diner:(e)=>({night:n})=>`${starsSky(n)}${tree(28,n,15)}${tree(452,n,16)}
    <rect x="110" y="58" width="260" height="82" fill="${n?'#3a3430':'#efe3c8'}"/><rect x="104" y="50" width="272" height="10" fill="${n?'#2a2420':e.col||'#6a3a2a'}"/>
    <rect x="160" y="22" width="160" height="26" rx="5" fill="${n?'#1c1614':'#2a1a14'}"/><text x="240" y="40" text-anchor="middle" font-size="12" ${SVGF} fill="${n?'#ffd36a':'#f4d27a'}">${e.sign}</text>
    <path d="M110 60 h260 l-10 12 h-240 z" fill="${n?'#4a2a24':e.col||'#b8402a'}"/>${Array.from({length:13},(_,i)=>`<rect x="${114+i*20}" y="60" width="10" height="11" fill="#fff" opacity=".35"/>`).join('')}
    <rect x="124" y="82" width="90" height="40" fill="${win(n)}"/><rect x="266" y="82" width="90" height="40" fill="${win(n)}"/><rect x="224" y="86" width="32" height="54" fill="${n?'#1e1612':'#4a3226'}"/>
    ${person(150,n,'#2a6fa8',124,.7)}${person(320,n,'#c98a12',124,.7)}${lamp(400,n)}<rect x="0" y="146" width="480" height="4" fill="${HC.walk(n)}"/>`,
  organ:(e)=>({night:n})=>`${starsSky(n)}${tree(30,n,16)}
    <rect x="90" y="50" width="300" height="90" fill="${n?'#3a2a2a':'#c98a5a'}"/><rect x="84" y="42" width="312" height="10" fill="${n?'#241a1a':'#5a2a1a'}"/>
    <rect x="150" y="16" width="180" height="24" rx="4" fill="#2a1a14"/><text x="240" y="33" text-anchor="middle" font-size="12" ${SVGF} fill="#f4d27a">${e.sign}</text>
    <rect x="120" y="62" width="160" height="62" fill="${n?'#1c1418':'#2a1a14'}"/>${Array.from({length:12},(_,i)=>`<rect x="${128+i*12.5}" y="${70+Math.abs(6-i)*3}" width="7" height="${50-Math.abs(6-i)*3}" rx="3" fill="${n?'#d9b84a':'#e8c75a'}"/>`).join('')}
    <rect x="300" y="70" width="70" height="40" fill="${win(n)}"/><rect x="314" y="112" width="30" height="28" fill="${n?'#1e1612':'#4a3226'}"/>
    ${person(190,n,'#8e44ad',146,.9)}${lamp(420,n)}<rect x="0" y="146" width="480" height="4" fill="${HC.walk(n)}"/>`,
  theater:(e)=>({night:n})=>`${starsSky(n)}
    <rect x="120" y="20" width="240" height="120" fill="${n?'#3a3a40':'#ece6da'}"/>${[0,1,2].map(i=>`<rect x="${140+i*76}" y="30" width="44" height="34" rx="20" fill="${win(n)}"/>`).join('')}
    <rect x="130" y="72" width="220" height="24" fill="${n?'#1c1418':'#2a1a14'}"/>${Array.from({length:18},(_,i)=>`<circle cx="${138+i*12}" cy="75" r="1.6" fill="#f7d77a" opacity="${n?1:.6}"/>`).join('')}
    <text x="240" y="90" text-anchor="middle" font-size="12" ${SVGF} fill="#f4d27a">${e.sign}</text>
    ${[0,1,2,3].map(i=>`<rect x="${160+i*44}" y="104" width="28" height="36" fill="${n?'#2a2024':'#7a2a2a'}"/>`).join('')}
    ${person(110,n,'#2a6fa8',146,.9)}${person(372,n,'#c0392b',146,.85)}${lamp(60,n)}${lamp(420,n)}<rect x="0" y="146" width="480" height="4" fill="${HC.walk(n)}"/>`,
  hall:(e)=>({night:n})=>`${starsSky(n)}
    <rect x="60" y="40" width="360" height="100" fill="${n?'#2e3440':'#c9d3da'}"/>${Array.from({length:10},(_,i)=>`<rect x="${70+i*35}" y="50" width="28" height="80" fill="${win(n,i%3!==1)}" opacity=".85"/>`).join('')}
    <rect x="150" y="18" width="180" height="20" rx="3" fill="${n?'#1c2026':'#2a3a4a'}"/><text x="240" y="32" text-anchor="middle" font-size="9" ${SVGF} fill="#f4e6c0">${e.sign}</text>
    ${person(120,n,'#c98a12',146,.9)}${person(140,n,'#2f8f6a',146,.85)}${person(330,n,'#8e44ad',146,.9)}${tree(24,n,15)}${tree(456,n,15)}<rect x="0" y="146" width="480" height="4" fill="${HC.walk(n)}"/>`,
  water:(e)=>({night:n})=>`${starsSky(n)}
    <path d="M260 84 L300 66 L340 78 L380 58 L430 74 L480 66 V92 H260 Z" fill="${HC.mtn(n)}"/>
    <rect x="0" y="90" width="480" height="50" fill="${HC.bay(n)}"/><path d="M30 110 q20 -3 40 0 M300 104 q20 -3 40 0 M380 122 q20 -3 40 0" stroke="${HC.bay2(n)}" stroke-width="1.6" fill="none" opacity=".7"/>
    ${[0,1,2,3,4,5,6].map(i=>`<rect x="${70+i*36}" y="112" width="5" height="34" fill="${n?'#2a2420':'#5a4430'}"/>`).join('')}
    <rect x="60" y="62" width="250" height="52" fill="${n?'#3a3430':'#e8dcc4'}"/><polygon points="52,64 185,40 318,64" fill="${n?'#2a2024':e.col||'#5a3a2a'}"/>
    <rect x="120" y="44" width="130" height="16" rx="3" fill="#2a1a14"/><text x="185" y="56" text-anchor="middle" font-size="9" ${SVGF} fill="#f4d27a">${e.sign}</text>
    ${[0,1,2,3,4].map(i=>`<rect x="${74+i*46}" y="74" width="34" height="26" fill="${win(n)}"/>`).join('')}
    ${person(380,n,'#c0392b',146,.8)}<rect x="320" y="140" width="160" height="6" fill="${n?'#3a3430':'#a8845a'}"/>${lamp(440,n)}`,
  pot:(e)=>({night:n})=>`${starsSky(n)}${tree(30,n,15)}${tree(448,n,16)}
    <path d="M170 140 Q160 80 190 56 L290 56 Q320 80 310 140 Z" fill="${n?'#3a2a24':'#6a3a24'}"/><rect x="186" y="44" width="108" height="14" rx="6" fill="${n?'#2a1e1a':'#4a2a1a'}"/><circle cx="240" cy="38" r="7" fill="${n?'#2a1e1a':'#4a2a1a'}"/>
    <path d="M310 80 Q350 84 340 120 Q334 132 312 128" stroke="${n?'#2a1e1a':'#4a2a1a'}" stroke-width="10" fill="none"/><path d="M172 76 L136 58 L140 70 L170 92 Z" fill="${n?'#2a1e1a':'#4a2a1a'}"/>
    <rect x="196" y="72" width="88" height="18" rx="3" fill="#1c1210"/><text x="240" y="85" text-anchor="middle" font-size="10" ${SVGF} fill="${n?'#ff5a4a':'#e8503a'}">${e.sign}</text>
    <rect x="226" y="110" width="28" height="30" fill="${n?'#1a1210':'#2a1a14'}"/><rect x="194" y="100" width="20" height="14" fill="${win(n)}"/><rect x="266" y="100" width="20" height="14" fill="${win(n)}"/>
    ${lamp(380,n)}<rect x="0" y="140" width="480" height="10" fill="${HC.street(n)}"/>`,
  mall:(e)=>({night:n})=>`${starsSky(n)}
    <rect x="20" y="60" width="440" height="80" fill="${n?'#3a3a3e':'#d8d0c0'}"/><rect x="20" y="52" width="440" height="10" fill="${n?'#2a2a2e':'#8a7a6a'}"/>
    <rect x="160" y="30" width="160" height="22" rx="3" fill="${n?'#1c1c20':'#2a3a4a'}"/><text x="240" y="45" text-anchor="middle" font-size="10" ${SVGF} fill="#f4e6c0">${e.sign}</text>
    <rect x="200" y="90" width="80" height="50" fill="${win(n)}"/><rect x="40" y="76" width="90" height="40" fill="${n?'#2a2a30':'#b8b0a0'}"/><rect x="350" y="76" width="90" height="40" fill="${n?'#2a2a30':'#b8b0a0'}"/>
    ${person(150,n,'#2a6fa8',146,.85)}${person(300,n,'#c98a12',146,.8)}${person(320,n,'#2f8f6a',146,.7)}<rect x="0" y="144" width="480" height="6" fill="${HC.street(n)}"/>`,
  park:(e)=>({night:n})=>`${starsSky(n)}
    <path d="M300 84 L340 66 L380 78 L420 60 L480 76 V94 H300 Z" fill="${HC.mtn(n)}"/>
    <rect x="0" y="90" width="480" height="60" fill="${HC.bay(n)}"/>
    <path d="M60 150 Q120 90 220 84 Q320 88 380 150 Z" fill="${n?'#2a3a2a':'#8fb87a'}"/><path d="M90 150 Q150 104 220 100 Q300 104 350 150" stroke="${n?'#5a5a50':'#e8e0c8'}" stroke-width="5" fill="none"/>
    <rect x="200" y="62" width="110" height="18" rx="3" fill="#4a3226"/><text x="255" y="75" text-anchor="middle" font-size="8" ${SVGF} fill="#f4d27a">${e.sign}</text><rect x="252" y="80" width="4" height="14" fill="#4a3226"/>
    ${person(160,n,'#c0392b',122,.8)}${person(290,n,'#2a6fa8',124,.75)}${n?'':bird(120,30)+bird(140,24)}`,
};
const tpArt=e=>(tpArtFns[e.art]||tpArtFns.diner)(e);

// ---- the places: one stop each in its neighborhood, there only while it's open ----
const TP_HOURS=e=>e.hours?(()=>e.hours):null;
if(typeof L!=='undefined'&&typeof HOODS!=='undefined'){
  for(const e of TP_PLACES){const k=tpPlaceKey(e);if(!k||!HOODS[e.hood]||L[k])continue;
    L[k]={hood:e.hood,ic:e.ic,desc:e.desc,art:tpArt(e),hours:TP_HOURS(e),
      get name(){return tpName(e)},set name(v){},
      get hidden(){return !tpOpenNow(e.key)},set hidden(v){}}}
}
const tpHere=loc=>TP_PLACES.filter(e=>!e.existing&&(e.in?e.in===loc:tpPlaceKey(e)===loc));
const tpClosesIn=e=>{if(!e.closed)return Infinity;return dayIndexOf(...e.closed)-day()};

// a visit: a meal, a show or a look around (what a customer sees)
const TP_FX={meal:{energy:13,stress:-9,community:1,mins:45},show:{energy:-2,stress:-15,community:2,mins:150},look:{stress:-5,mins:20},shop:{energy:3,stress:-6,mins:60},walk:{energy:-4,stress:-12,mins:50}};
const tpMins=m=>m<60?`${m} min`:m===60?'1 hour':`${Math.round(m/30)/2} hours`;
function tpVisit(e,bye){
  const T=tpS(),d=day(),fx=TP_FX[e.kind]||TP_FX.look,c=e.price?rp(e.price):0,nm=tpName(e);
  if(c)spend(c);pass(fx.mins);
  if(fx.energy)adj('energy',fx.energy);if(fx.stress)adj('stress',fx.stress-(bye?6:0));if(fx.community||bye)adj('community',(fx.community||0)+(bye?2:0));
  T.v[e.key]=(T.v[e.key]||0)+1;T.last[e.key]=d;T.day[e.key]=d;
  if(e.kind==='meal')S.stats.meals=(S.stats.meals||0)+1;
  if(bye){T.bye[e.key]=d;
    say(`🕯️ One last time at <b>${nm}</b>. ${pick(e.lines)} You take your time. On the way out you look back at it, the way you’d look at a friend getting on a bus.`);
    if(typeof lifeMoment==='function')lifeMoment('🕯️',`A last visit to ${nm} before it closed.`)}
  else say(pick(e.lines));
}
function tpActions(loc){
  const out=[],d=day(),m=tod(),T=tpS();
  for(const e of tpHere(loc)){if(!tpOpenNow(e.key))continue;
    const nm=tpName(e),h=e.hours,open=!h||(m>=h[0]&&m<h[1]),c=e.price?rp(e.price):0,fx=TP_FX[e.kind]||TP_FX.look;
    const left=tpClosesIn(e),been=(T.v[e.key]||0)>0;
    const fxTxt=[fx.energy?`energy ${fx.energy>0?'+':'−'}${Math.abs(fx.energy)}`:'',fx.stress?`stress −${-fx.stress}`:'',fx.community?`community +${fx.community}`:''].filter(Boolean).join(', ');
    const hrs=h?`Open ${fmt(h[0])}–${fmt(h[1])}.`:'';
    if(!e.sudden&&been&&left>0&&left<=31&&T.bye[e.key]==null){
      out.push({ic:'🕯️',l:`One last visit to ${nm}${c?` — ${$(c)}`:''}`,s:open?`${nm} closes for good on ${fullDate(dayIndexOf(...e.closed))}. You’ve been ${T.v[e.key]} time${T.v[e.key]===1?'':'s'}. Stress −${-fx.stress+6}, community +${(fx.community||0)+2}.`:hrs,
        cat:e.kind==='meal'?'food':'here',cls:open?'primary':'',dis:!open||!canAfford(c),fn:()=>tpVisit(e,true)});continue}
    if(T.day[e.key]===d)continue;
    out.push({ic:e.ic,l:`${e.act}${c?` — ${$(c)}`:''}`,s:open?`${tpMins(fx.mins)}. ${cap(fxTxt)}. Once a day.`:hrs||'Closed now.',
      cat:e.kind==='meal'?'food':e.kind==='show'?'rest':'here',dis:!open||!canAfford(c),fn:()=>tpVisit(e,false)});
  }
  return out;
}
window.tpActions=tpActions;
{const ah=actionsHere;actionsHere=function(){const a=ah.apply(this,arguments);
  try{if(typeof isGrow==='function'&&isGrow())return a;a.push(...tpActions(S.loc))}catch(e){console.error(e)}
  return a}}

// ---- the city news: openings and closings, and a month's notice before a place you could say goodbye to closes ----
const TP_CITY=[];
for(const e of TP_PLACES){if(e.existing)continue;
  if(e.openNews)TP_CITY.push({id:'tp_open_'+e.key,at:e.opened.slice(),talk:tpName(e,e.opened[0]),t:e.openNews});
  if(e.closed&&e.closeNews)TP_CITY.push({id:'tp_close_'+e.key,at:e.closed.slice(),talk:e.name+' closing',t:e.closeNews});
  if(e.closed&&!e.sudden){const t=new Date(Date.UTC(e.closed[0],e.closed[1]-1,(e.closed[2]||1)-30));
    TP_CITY.push({id:'tp_soon_'+e.key,at:[t.getUTCFullYear(),t.getUTCMonth()+1,t.getUTCDate()],t:`🗓️ Word is out: ${e.name} ${e.where?e.where+' ':''}closes for good next month. If it was one of your places, there’s still time for one last visit.`})}}
// the 1993 rename: Scotty's becomes The Harvester (its open line is about the new name)
{const h=TP_CITY.find(x=>x.id==='tp_open_harvester');if(h)h.at=[1993,1,1]}
for(const n of TP_NEWS)TP_CITY.push({id:n.id,at:n.at,t:n.t});
if(typeof CITY!=='undefined'){CITY.push(...TP_CITY);CITY.sort((a,b)=>(a.at[0]-b.at[0])||(a.at[1]-b.at[1])||(a.at[2]-b.at[2]))}
window.TP_CITY=TP_CITY;

// ---- between key weeks: you keep going to your regular places, while they're open ----
if(typeof LIFE_HOOKS!=='undefined')LIFE_HOOKS.skip.push((from,to)=>{
  try{if(isGrow())return;const T=tpS();
    for(const e of TP_PLACES){if((T.v[e.key]||0)<2)continue;const o=dateOf(from);if(!tpOpenOn(e.key,o.y,o.m,o.d))continue;
      const end=e.closed?Math.min(to,dayIndexOf(...e.closed)):to,n=Math.min(24,Math.floor((end-from)/45));if(n>0)T.v[e.key]+=n}}catch(err){console.error(err)}});

// ---- older start years: a neighborhood's main stop mentions the real places down the street (65-era-people.js) ----
if(typeof eraPlaceAlt==='function'){const ea=eraPlaceAlt;eraPlaceAlt=function(key,y){const a=ea.apply(this,arguments);
  try{if(typeof HOODS==='undefined'||!eraIsOld())return a;const H=Object.values(HOODS).find(h=>h.hub===key);if(!H)return a;
    const t=tpToday(),yy=y==null?t[0]:y,on=TP_PLACES.filter(e=>e.hood===H.key&&!e.existing&&!e.in&&tpOpenOn(e.key,yy,yy===t[0]?t[1]:7,yy===t[0]?t[2]:1)).map(e=>tpName(e,yy));
    if(!on.length)return a;const base=(a&&a.desc)||(H.places[key]&&H.places[key].desc)||'';
    return Object.assign({},a||{},{desc:`${base}. Nearby: ${on.join(', ')}`})}catch(e){return a}};
  window.eraPlaceAlt=eraPlaceAlt}

// ---- the life summary: the places you went most, the gone ones too ----
function tpSummaryRows(){
  if(typeof S==='undefined'||!S||!S.tp||!S.tp.v)return [];
  const t=tpToday();
  return Object.entries(S.tp.v).filter(([k,n])=>TP_BY_KEY[k]&&n>0).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([k,n])=>{const e=TP_BY_KEY[k],gone=!tpOpenOn(k,...t);
    return [`${e.ic} ${e.name}`,`${n} visit${n===1?'':'s'}${gone&&e.closed?` · gone since ${e.closed[0]}`:''}`]});
}
window.tpSummaryRows=tpSummaryRows;
if(typeof lifeSummaryHTML==='function'){const ls=lifeSummaryHTML;lifeSummaryHTML=function(){const h=ls.apply(this,arguments),R=tpSummaryRows();
  return R.length?h+`<div class="sect" style="margin-top:14px">📍 Your Tacoma places</div>`+R.map(([k,v])=>`<div class="kv"><span>${k}</span><b style="text-align:right">${v}</b></div>`).join(''):h}}

// ---- the guide: Tacoma through the years, by decade, in the Start year section ----
function tpGuideHTML(){
  const ev=[];   // [sortKey, year, line]
  for(const e of TP_PLACES){const nm=e.names?e.names[0][1]:e.name;
    if(e.opened[0]>=1980)ev.push([tpN(e.opened),e.opened[0],`${e.ic} ${e.name}${e.key==='pantages'?' reopens, restored':e.key==='johnnys2'?' reopens':' opens'} (${tpMonth(e.opened)})`]);
    if(e.names)for(const [u,n] of e.names)if(u>=1980)ev.push([u*10000+101,u,`${e.ic} ${n} becomes ${e.name} (${u})`]);
    if(e.closed&&e.closed[0]>=1980){const r=e.replacedBy&&TP_BY_KEY[e.replacedBy];
      ev.push([tpN(e.closed),e.closed[0],`${e.ic} ${e.key==='pizzapipes'?'Pizza & Pipes burns down':`${e.name} closes`} (${tpMonth(e.closed)})${r?`; ${r.name} ${r.key===e.key+'2'?'comes back':'takes the spot'} in ${r.opened[0]}`:''}`])}}
  for(const n of TP_NEWS)ev.push([tpN(n.at),n.at[0],`${n.g} (${tpMonth(n.at)})`]);
  ev.sort((a,b)=>a[0]-b[0]);
  const dec={};for(const [,y,l] of ev){const k=Math.floor(y/10)*10;(dec[k]=dec[k]||[]).push(l)}
  const before=TP_PLACES.filter(e=>e.opened[0]<1980&&(!e.closed||e.closed[0]>=1980)).map(e=>`${e.ic} ${e.names?e.names[0][1]:e.name} (from ${e.opened[0]})`);
  const now=TP_PLACES.filter(e=>tpOpenOn(e.key,2026,8,3)).map(e=>`${e.ic} ${e.name}`);
  const T=(h,r)=>typeof hTable==='function'?hTable(h,r):`<table>${r.map(x=>`<tr>${x.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</table>`;
  const rows=[['Already there in 1980',before.join(', ')]].concat(Object.keys(dec).map(Number).sort((a,b)=>a-b).map(k=>[`${k}s`,dec[k].join('; ')]));
  return `<h3>Tacoma through the years</h3>
    <p>Real Tacoma places open and close in the years they really did. A life that starts in 1980 can have pizza under the pipe organ at 19th & Mildred, spaghetti at Bimbo’s downtown and dinner on South Tacoma Way, then watch them give way to newer places. Each one is a stop in its neighborhood (Frisko Freeze is a spot on MLK), with a meal, a show or a look around.</p>
    <ul><li>Openings and closings are in the city news between key weeks.</li>
    <li>If you’ve been to a place, you get a month’s notice and a 🕯️ last visit before it closes. Some close without warning: a fire, or a sign on the door one morning.</li>
    <li>The life summary lists the places you went most, the gone ones too.</li>
    <li>Quick play and 2026 starts show the places open today.</li></ul>
    ${T(['When','Tacoma places'],rows)}
    <p>Open in 2026: ${now.join(', ')}.</p>`;
}
window.tpGuideHTML=tpGuideHTML;
if(typeof eraGuideHTML==='function'){const g=eraGuideHTML;eraGuideHTML=function(){return g.apply(this,arguments)+tpGuideHTML()};window.eraGuideHTML=eraGuideHTML}
