# Changelog

Release notes for Tacompton. `/releasenow` adds a section here for every release, and the GitHub release notes
are taken from it.

## Unreleased

### Added
- Try it for 2 weeks: the two-week game is no longer a length; it's a teaser on the New game sheet (2 weeks at 18, Growing Up's first week at 12 or 15) with a "Trying it out: N days left" HUD tag and a "Liked it? Start a new life" end button. Lengths are 6 months, 1 year, 2 years and Lifetime (default 1 year). The guide, title, rules, achievements and end screens no longer describe the game as two weeks. The age question is "Play as a kid" (12 or 15) or "Start at 18" everywhere a new game asks it.
- 🍕 **Historical Tacoma places:** real Tacoma restaurants, parks and landmarks open and close on their real dates (Pizza & Pipes 1974–1999, Bimbo's 1921–2001, Knapp's 1938–2026, The Harvester, Steve's Gay '90s, Kim Anh, Clinkerdagger's → Duke's, Johnny's Dock, the Lobster Shop, the Rialto and the Pantages, the Tacoma Mall and its Sears, Frisko Freeze, Bob's Java Jive, the Dune Peninsula), each with a visit, city news lines, a farewell visit in the month before it closes, a source note in the code, and a "Tacoma through the years" table in the guide. The life summary lists your most-visited places.
- 🎉 **Turning 18 unlocks everything an adult game has:** a save started at 12 or 15 gets, at 18, the same jobs and careers, rent, driver's license and used car, adult phone apps, prices, crime ladder and events as a game started at 18 (one "You're 18" sheet lists them). Graduation now comes on the 18th birthday when it's played. 18+ mode turns on at 18 only if the player asked for it; otherwise the sheet offers it, through the age check (`src/js/73-adult-unlock.js`).
- Polish: a 📔 Memory book (moments, birthdays, photos and places by year, saved with the game), 🌟 lifetime achievements kept per profile across games, 🗣️ read-aloud with the device's speech voices, and generated 🔊 sound effects and 🎵 time-of-day music with volumes (music off by default, nothing before a tap).
- 🏫 **Life in Tacoma (Growing Up):** five school subjects feeding Grades, homework and office hours by subject, teachers, a counselor and a coach; clubs and teams with practices and a season moment; walk, bus or Link to school with a route you learn; report cards that earn freedoms or a talk at dinner; a high-school track at 15 that changes the choice at 18; a best friend with a meter and story beats, friends who drift and come back, family stories, and trust that earns a later curfew and going downtown alone.

### Fixed
- 🕰️ **Era fixes:** the Growing Up job at 16 pays (and says) the start year's minimum wage instead of 2026's, and Growing Up pocket money in text now matches what is paid. Before cell phones the grab downtown is a wallet grab at the bus stop (no phone, no Link), and a few life events (the card freeze, the rent scam text, the first ride downtown, a rideshare) use the old way in the early years.

## 0.4.1 (2026-11-22)

### Added
- 📅 **Start year:** begin a life in 1980, 1990, 2000, 2010, 2020 or 2026. Prices, pay (Washington's minimum wage), rent, college aid and the GI Bill follow the year; places open in their real years (the Tacoma Dome, UW Tacoma, the Museum of Glass, the Link, the T Line); city news marks the smelter closing, the hard years on Hilltop, the Nisqually earthquake, the 2008 recession and the 2020 pandemic. Neighbors, shops and job titles fit the era. Starting ages stay 12, 15 or 18.
- 📱 **A phone:** a 📱 button slides up a phone with a battery, a monthly bill, three phone tiers and five app slots. Built in: Messages, Phone (calls and voicemail), Clock, Contacts, Camera and Photos, and the App Store. Apps: Transit, Maps, Weather, Rides, Bank, Jobs, Groceries, Telehealth, the block club chat, Flashlight and Notes; the dating app in 18+ mode only. Friends text and call, invitations arrive as texts, and you can ask for favors.
- 📞 **Phones through the years:** a landline and pay phones, pagers, flip phones, then smartphones; each app arrives in its real year, with the old way (a cab, the paper, the bank branch, a film camera) before it.
- 🎒 **A first phone at 12** from Mom and Dad, with rules you can earn your way out of, kid apps and screen time.
- 🚗 **Driving:** lessons and the license test at 16, buying a used car as an adult, insurance and gas, a faster Drive option, and the car prowl event.
- 🎖️ **The Army at 18:** a fourth choice beside work, college and a trade: basic training, service at Joint Base Lewis-McChord, promotions, and the GI Bill afterward.
- ⏩ **Skip to 18** in ⚙️ Settings → 🎮 Game options (Lifetime games), with a summary of the years skipped.
- ⚖️ **Choices and consequences:** optional shortcuts (skipping a fare, a cash job over a shift, a too-cheap bike and more), a fair punishment ladder from a warning to a court hearing and a record, and ways back. Growing Up's consequences come from family and school.
- 🏘️ **Growing up in the hood:** 30 hard-times events from 12 to young adulthood, each with a safe choice, plus a hoodie habit.
- 🧱 **An optional gang life path** in the longer games, with real costs (school, family, arrest, injury, a memorial ending) and five ways out that are always open.
- 🛒 **Inflation:** everyday prices rise each January in the longer games; savings stay realistic.

### Changed
- 🏠 **Start screen:** "Grow up, get by and make a life in Tacoma", with one 🆕 New game button: choose your starting age, how long to play and the start year.
- 🎓 **College aid:** a Pell Grant and a state grant cut tuition, and you're warned before rent runs short, with a cheaper room or moving home as options.
- Pay and rent: rent rises every August with no cap; the retirement pension always covers rent and everyday costs.

### Fixed
- Careful college students are no longer evicted at 19.
- In Growing Up at 15, the Dome and the Museum of Glass no longer show before they opened.

## 0.4.0 (2026-11-22)

### Added
- 🎭 Choices in Downtown, the Eastside, Fern Hill, Northeast Tacoma and Old Town: all 22 events there now let you decide. Join in, stop by briefly or keep going; calm moments offer a one-tap "Stop and watch". Saying yes to Camila's quinceañera invitation changes what happens at the Family Hall garden, and working the Fern Hill cleanup changes the ice-cream social.
- 🧯 Life events: everyday setbacks with choices in the moment, each softened by a habit or purchase you set up ahead of time. A wallet thief on a crowded game-day bus out of the Dome District (sit up front by the driver: lose $15, not $60), a phone grab at the downtown Link stop (a zipped pocket and it fails), a package stolen off the porch (the corner market's pickup locker), the bus breaking down on the way to work (leave early or know the T Line route), a rainstorm on your walk (an umbrella), a scam text about rent (call the landlord), the fridge dying (the savings jar pays), a power outage (a flashlight), a rent increase notice in the longer games (the block club's tenant-rights handout), a "lend me $20" story, a neighbor's dead car battery (jumper cables, and a favor comes back), a lost dog (the block club group chat) and a ride to the ER. Robbery is rare and never on Hilltop's own streets.
- 🎒 Growing Up versions: a bike gone from the rack outside the Reading Room (a lock), lunch money lost at school (an inside pocket keeps half), an older kid at the bus stop (walk with a friend), and the first Link ride downtown (study the route map).
- New things to do: a 🫙 savings jar at home (put in or take out $20), habits you switch on or off (a zipped pocket, sitting up front on the bus, lunch money in an inside pocket, walking to the stop with a friend), an umbrella, a flashlight, jumper cables and a bike lock at the corner market, the pickup locker, the T Line route map, the block club group chat (meet 5 neighbors) and the block club meeting on Thursday evenings at People's. Quick play gets fewer and lighter life events; the longer games space them out.
- 🤔 Your call: events can now ask what you do. A decision shows as a tile you can tap ("Tap to decide"), in a Decide card at the top of the Here tab and in the morning report. Pick an option, or choose Not now: anything left undecided goes the cautious way at bedtime, and the Log says so. Setbacks that can't wait ask right away; one that comes up overnight is first in the morning report and asks as soon as you close it. At most three decisions wait at once, and saves keep them. Small moments (Stop and watch) don't take a place: their tile is tappable while it shows, and if you let it go you keep going.
- 🤔 Every one of Hilltop's 38 everyday moments now asks what you do. Setbacks are real trade-offs (buy a box fan, cool off at People's, or tough out the heat; haggle with the internet company or pay full price; push through the Friday rush or hand off the big ticket). Neighbors offer a choice to join in, stop by or pass. Story chains remember: paint a patch of sky and it's in the finished mural, walk the alleys for Biscuit and the thank-you text says so, stay at Ron's cookout and there are two plates of leftovers, sign up at the new building and the block club reads your name. Ambient moments (the mountain, the Link bell, the helicopter) offer a Stop and watch.
- 🎒 Growing Up's events are choices now. Shoot hoops with Marcus (a full game or a few shots), help hang the barbecue lights or make lemonade, a tooth-fairy note for Nia, puddles or a blanket fort on the rainy day, Uno or a story when the power goes out, talking to Mom when the butterflies hit, and a thank-you call to Grandma. The mountain and the Link bell are a one-tap "Stop and watch".
- Choices follow you: the finished mural remembers whether you painted your patch of sky or watched, the barbecue lights come on, your family comes to the giveaway if you sent them the flyer, and Nia carries your card to second grade.
- Around Tacoma, kid events are choices too: join the frisbee game, tip the busker, play keeper, paint a corner of a mural, or stop and watch the eagle, the seal, the band and the Hot Shop. A lost little kid can't wait: that one asks right away.
- 🎲 Choices in the neighborhood events (Proctor, Ruston, South End, Stadium District, West End): 23 events now offer 2–3 trade-offs (stay or stop by, spend or save), the quiet moments get a one-tap Stop and watch, and the plant sale and class signup day have follow-ups.
- 🗺️ The rest of Tacoma: six new neighborhoods beyond Hilltop, each with its own places, drawings by day and night, neighbors, things to do and events. Stadium District, Downtown & the Dome District, Proctor & the North End, the Eastside & the Port, the South End & the Lincoln District, and Ruston & Point Defiance.
- Getting around: walk to the Stadium District, ride the free Link downtown, or take the bus (a fare) to the rest. Trips across town take longer, so plan them around your shifts.
- "Go somewhere" now groups places by neighborhood, and the guide has an "Around Tacoma" section.
- 🗺️ A new achievement, All Over Tacoma: visit every neighborhood.
- Four more neighborhoods: Old Town, Fern Hill, Northeast Tacoma and the West End, for ten beyond Hilltop.
- 🌱 New life: pick a length (Quick play, 6 months, 1 year, 2 years or Lifetime) and a starting age (12, 15 or 18) from the title screen. Your birthday is picked at random and shown before you start.
- Key weeks: the longer games play the important weeks (one a month, about every six weeks plus your birthday, one a season plus birthdays, or one or two a year at the milestones) and show a summary between them: money, stats, age, school or work, friends and family, after one choice about how to spend the time (extra shifts, saving, friends; or studying, helping at home, friends, and shifts at 16).
- A real calendar: every day has a date, rent is monthly (due on the 1st, or at the end of a key week that crosses it), the Hilltop Street Fair comes back on the second Saturday of every August, and the sunset follows the seasons.
- Growing up: a birthday every year with a small family celebration; high school at 14 (Hilltop High, curfew 10 PM), a learner's permit and a part-time job at 16; school days, homework and grades after the first week.
- Starting at 15: a sophomore at the fictional Hilltop High, with Growing Up's family, friends and places.
- At 18, one save carries on: graduation, then work (one of the three jobs), college at UW Tacoma (tuition and a part-time job) or a trade program, then your own apartment on Hilltop. Family, friends and grades turn into rent help, community and job standing.
- Lifetime ends at old age with a life summary: stages, work, people and moments.
- ⚙️ Settings → 🎮 Game options: lengthen or shorten the game (or finish here), change the difficulty one step a week, event pop-ups, tips, full weeks or highlights (3 days of each key week), and rename your character. Starting age and mode show grayed out, with the reason.
- 🏅 Best scores: scores are per month played, each length keeps its own best, and the list shows every run's length and starting age.
- 🏫 School years in the longer Growing Up games: on school days, Go to school (first bell 8:15 AM, out at 2:45 PM), then homework at home. Skipping school costs Grades and Family; a winter morning can bring a snow day (sledding at Wright Park, cocoa with Nia).
- Middle school at Summit View: the first day of eighth grade, the fall concert (band or choir, with the whole family in the third row), winter break, spring testing week (how you study moves your Grades) and the last day (yearbooks and summer plans).
- High school at Hilltop High: orientation, finals in December and June, prom as a friends' night out at 16 and 17 (photos at Wright Park, then dancing), a summer job at 16 (the corner market, lifeguarding at the People's pool or the Sunbreak Café, paid through the summer's time skips) and graduation week.
- Kids' key weeks now move onto those school dates when one is close, so a year at 12 plays the concert, winter break, testing week and the last day.
- 🌦️ Seasons and weather in the longer games: a daily roll by season. Tacoma rain and drizzle from October through spring, gray days and sun breaks, windstorms, a rare snow day in winter (school closes, and you can sled the hill), the first sunny day of spring that brings the whole block outside, and summer wildfire-smoke days. The weather shows over every place's drawing and as a tag on the Here tab, nudges your stats each morning, and changes outdoor plans: a little bonus in the sun, a little damp in the rain, and some are off in heavy rain, windstorms and smoke.
- 🌅 Sunrise and sunset all year, in both modes: about 7:55 AM and 4:20 PM in late December, 5:15 AM and 9:10 PM in late June. The sky in every scene follows them.
- 🏘️ A neighborhood that changes over the years: city news in the summaries between key weeks (new murals, The Juniper's apartments and bakery on MLK, the teriyaki spot closing and Kusina 253 opening in its place, a bigger street fair, a pocket park, and the T Line extension to Tacoma Community College, told as Sound Transit's plan: design from 2027, opening forecast for 2043). Rents go up a few percent every August, and each birthday notes how much the block has changed. Quick play is unchanged.
- 🗺️ Growing Up: Tacoma opens up as you grow. At 14 a Youth ORCA card (riders 18 and under ride free) opens the Stadium District (a walk) and Downtown & the Dome District (the free Link); Proctor, Ruston & Point Defiance and the South End at 15; Old Town, the West End and the Eastside at 16; Fern Hill and Northeast Tacoma at 17. The neighborhoods' own places and drawings, with kid versions of what to do there, trips through the hubs, curfew (10 PM) and a Head home button with the time to leave.
- 💼 A first job at 16: the Copper Kettle café on Pacific Ave (Tue/Thu after school, Saturdays) or the Museum of Glass gift shop (weekends), at Washington's minimum wage, paid into Money. Shifts keep paying between key weeks; miss three and they let you go.
- Kid-friendly happenings around town (a frisbee game, a harbor seal, the glassblowers, a lost little kid), Running Start at TCC at 16, and two achievements: Youth ORCA and First Paycheck. Growing Up's Go somewhere groups places by neighborhood, like the adult game.
- 📖 The guide has two new chapters: **Game lengths and ages** (Quick play to Lifetime, the key weeks and the summaries between them, starting ages 12, 15 and 18, changing the length later in ⚙️ Settings → 🎮 Game options, the other options, scores per month and how a Lifetime ends) and **Growing up** (middle school and Hilltop High, school days and homework, the school-year events, birthdays, curfew, neighborhoods by age with free youth rides, first jobs at 16, graduation and the choice at 18, seasons and the changing city), with numbers taken from the game.
- 🔞 Adults only (18+): an optional mode for adult relationships, off by default. Turn it on from the start page after a one-time "This mode is for players 18 and older" check, or any time in ⚙️ Settings → 🎮 Game options → 🔞 18+ mode. Under 18 it waits for your 18th (and your own place) or starts a new adult save; nothing of it ever shows in Growing Up. Turning it off hides it all and pauses relationships. The end screen and life summary list every switch.
- 📖 With 18+ mode on, the guide gets its own **18+ mode** chapter (turning it on and off, meeting people, the dates with their costs and times, consent, relationships, setbacks and the ❤️ tab). It never shows with the mode off, in Growing Up or under 18.
- ❤️ Meet people around Tacoma (the Link, a show at the Dome, the Proctor farmers market, a party down the hall, work) or on a dating app at home: a match or two a week. Twelve invented adults, 23 to 45, each with an age, a job, a neighborhood and interests; friends from Growing Up join only once you're both adults. Interest and chemistry follow shared interests and how you treat people.
- 🌹 Dates with real costs and time (tacos at the truck lot, a movie at the Starlite, Owen Beach at sunset, the Museum of Glass, Wright Park), flirting that's playful, sincere or bold, and a ❤️ Romance tab. Then going exclusive, meeting the friends and the family, moving in (shared rent and chores), engagement and a wedding at the Seymour Conservatory or the courthouse, or choosing not to marry; kids in Lifetime games.
- Consent is part of the game: anyone can say no, and the game takes it gracefully. Nothing explicit, ever: a fade to black and a morning-after line. Consequences: jealousy, cheating found out, breakups with a sad week, a pregnancy scare handled at the clinic, and a partner's job changing your plans.
- 📈 Raises and promotions in the longer adult games: a cost-of-living raise (2–3%) every job anniversary and a review every six months, with a merit raise (3–5%) for Job 60+ and good attendance, or a written warning below 40. Real titles with real pay: CNA → Senior CNA → LPN (an evening program you choose in a time skip, paid monthly, fewer shifts while you study) → RN (an optional bridge program); barista → shift lead → café manager; line cook → sous chef → kitchen manager. College now leads to IT support downtown (then systems administrator, IT manager) and the trade program to an electrician apprenticeship (journey-level after four years). Promotions are life moments and show in the time-skip summary, the Week tab, the Job stat and the life summary. Retirement brings a pension of 70% of your last pay. Rents now rise 3–5% every August with no cap (the old 20% cap and the tenant-protections line are gone), so a steady player keeps up and a sloppy one falls behind. Quick play is unchanged.

### Changed
- Growing Up's night decisions (the butterflies before school, the power going out, Nia's card) ask first thing in the morning, right after the morning report.
- A car on the T Line tracks: walking the rest is the default now, so it doesn't make you late for a shift.
- Quick play is today's game, unchanged: Move in on Monday is the two weeks at 18 and Growing Up is the first week at 12. Saved games from earlier versions load as Quick play.

### Fixed
- Longer Growing Up games: “Unpack a box” is only offered in the first week; the “last week of summer” morning line only shows in late August; Friends and the other stats stay whole numbers after a time skip; the day summary shows Grades (📚) after the first week instead of “🎒 0%”.

## 0.2.0 (2026-11-19)

### Added
- 🎒 Growing Up (new), a second mode on the start page: you're 12, your family just moved to Hilltop, and Chapter 1 is the week before middle school (Mon Aug 24 to Sun Aug 30, 2026), ending with the first day of seventh grade on Mon Aug 31 and a "Chapter 1 complete" grade with a look at the next chapter.
- Growing Up stats: Energy, Mood, Family, Friends and Ready (school readiness), plus allowance money; chores, family dinner and your little sister Nia; a curfew (home by 8:30 PM or Family drops) instead of a job.
- Five kids to meet (Marcus, Ana, Tavita, Linh and Zay), any of whom can become your best friend, and Growing Up events: shooting hoops, the barbecue across the street, the ice cream truck, a mural going up, the Link bell, a back-to-school supply giveaway at People's, a rainy day and more.
- New places drawn for Growing Up (with night versions): the family apartment, the Reading Room and Summit View Middle School; Growing Up achievements, its own best score, and a "Growing Up" chapter in the Help guide.
- The adult game, "Two weeks on Hilltop", still starts with Move in on Monday, and existing saves load as before (see Changed for its new balance).
- 💬 Send feedback now sits right under ❓ Help on the start page, and messages go to the new feedback form.

### Changed
- Balance: the two weeks are a real game now. Shifts cost more stress (CNA +20, line cook +16, barista +12), sleep takes off only −3 (−5 in bed before 11 PM), so a swim, the sunset, a call home or a Link ride matter. Community grows more slowly, late and missed shifts cost more Job, and a night past midnight costs Job −3. The rest, bench, park, platform, murals and hill walk work fully twice a day.
- Score: cash counts half and community ×20, so the better-paid job doesn't decide the grade. New grade cutoffs from a simulation (`node tools/sim.js`): A 3,850, B 3,000, C 2,200, D 1,500. A sensible player gets a B, a careful and social one an A, a sloppy one a C or D.
- Tight Month is harder: $450 savings, prices +20%, shifts hit 20% harder and unpaid rent weighs on you every night.
- Mount Rainier is redrawn as the broad, glaciated massif Tacoma sees (Liberty Cap, Little Tahoma), on the title, the overlook, home and the Link; the Port of Tacoma cranes replace the gate-like shapes. It sits to the southeast.
- More neighbors, beyond the usual cast: Imani at the bookstore, Linh at the phở shop, the Santos family next door, Denise from the transit committee, Malik from UW Tacoma, Eli who just moved up from Seattle, and Ron, Mr. Harris, Grace Kim, Bev, Tasha and Dre with fuller lives. The block club and a new building on the block give the changing neighborhood an honest place in the story.
- "What's the game about?" explains the name. The soul-food spot is now Odessa's Table.
- Day one opens 🧭 Go somewhere, and home shows a **Go to work (12 min)** button on shift days. The sunset is listed with its time and "best from", and moves from 8:20 PM to 8:00 PM over the two weeks. A one-time tip explains the event tiles.

### Fixed
- Event tiles no longer cover pop-ups or the top bar or catch taps meant for a pop-up: they wait while a pop-up is open and come back after it closes.
- The difficulty picker no longer says "(last time)" before you've ever picked one.
- Keyboard number badges are hidden on touch screens; the place card shows only on the Here tab, in one line on a phone; MLK's storefront signs fit a 400 px screen.

## 0.1.1 (2026-11-19)

### Added
- A redesigned start page: the title art and name, the big Start/Continue button, then a clear ❓ Help button with 📲 Install app right under it. Save slots, feedback, What's new and transfer are still there as smaller buttons below.
- 📲 Install app is always on the start page (except in the single-file offline copy): it opens your browser's install prompt, the menu steps for your browser, or the iPhone/iPad how-to.
- A full player's guide under Help, laid out as a document: a table of contents with jump links and 16 numbered chapters, from your first day step by step to the score, tips and an FAQ, with the game's real prices, shift times, pay, rent and grade cutoffs, small drawings and tip boxes. It opens from the start page and from ⚙️ Settings → Help, closes with Esc, and has a 📄 Print / save as PDF button.

## 0.1.0 (2026-11-19)

First release.

### Added
- A two-week life game about moving onto Hilltop in Tacoma, WA (Mon Aug 3 to Sun Aug 16, 2026): hold down a job, make rent, keep food in the fridge, and get to know your neighbors.
- Pick your job at the start: a CNA at the hospital, a barista at a Hilltop café, or a line cook at a soul-food spot on MLK.
- Six places on the hill: your apartment, MLK Jr Way, work, the Hilltop Link station, People's Community Center and the overlook with the view of Commencement Bay and Rainier.
- Five stats on the HUD (cash, energy, stress, food, job standing), rent due at the end of the second week, and three ways to lose: fired, burned out or evicted.
- Neighborhood events including the Link bell, a block party, a mural going up, the Hilltop Street Fair, and a heat wave; achievements, Help, What's new, feedback, and an offline single-file version.
