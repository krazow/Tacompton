# Tacompton: build contract (for parallel agents)

**Game:** Tacompton, a mobile PWA game. You run a small Puget Sound salmon-guide business out of Tacoma, WA ("Tacompton" / "Grit City").
One season = 14 days, **Mon Aug 3 to Sun Aug 16, 2026** (`GAME.days=14`, day index 0–13, `day()`, `dayName(d)` from the engine).
The design is Guide Master (krazow/Guide-Master, cloned read-only at `/home/claude/krazow/guide-master`) cut down to one season:
clients → bookings → trips → dilemmas with shuffled legal and illegal options → reviews → ★ rating, cash, rep, citations.

**Engine:** `src/js/00-09` came from Guide Master and are generic. Don't edit them unless something is broken (tell the integrator).
Read them for the APIs: `modal(title, body, btns, noClose)`, `modalSwap(...)`, the button flag `{l, fn, stay:true, legal:true|false}`,
`showTile`, `say`, `pass(min)`, `adj(stat, n)`, `money(n)`, `$`, `$k`, `fmt(min)`, `tod()`, `day()`, `pick`, `defEvent`, `chain`,
`fireHook`, `endDay(where)`, `go(dest)`, `isOpen`, `hoursTxt`, `DF()`. For how the content side uses them, look at the Guide Master files
`src/js/20-world.js`, `21-story.js`, `22-trips.js`, `23-fish.js` and `33-day.js` (and copy patterns freely), but **no Alaska content**.
The framework's sample contract is at `/home/claude/framework/src/js/20-world.js` and `21-story.js`: every name defined there must exist.

## File ownership (only write your own files)
| Agent | Files |
|---|---|
| WORLD | `src/js/00-game.js` (DIFFS text only), `src/js/20-world.js` |
| TRIPS | `src/js/22-trips.js` (clients, bookings, trips, dilemmas, fish, regs, reviews) |
| STORY | `src/js/21-story.js`, `src/js/26-help.js`, `src/js/29-update-notice.js` |
| SHIP  | `README.md`, `CHANGELOG.md`, `release.json`, `manifest.webmanifest`, `src/shell.html`, `install/ios.html`, `tests/*.test.js`, `tools/sim/` (optional), `.github/` |

## Shared state (S). WORLD defines these in `newState()`; everyone else may read and write them
```
money:1500, rep:50, energy:90, boat:85, cites:0, warns:0, fuel:20 (gallons in the boat, tank 40)
gear:3            // trips' worth of tackle (herring, flashers, hoochies, leaders)
bait:0            // trays of herring on ice (1 per trip, spoils at end of day it was bought + 1)
book:[]           // bookings {id, day, start(min), type, party:{name, n, want, mood}, price, status:'booked'|'done'|'noshow'|'cancelled'}
nextId:1
reqs:[]           // booking requests waiting {id, r:{...same as a booking without status}, exp:dayIndex}
trip:null         // the trip in progress (TRIPS owns its shape)
reviews:[]        // {day, who, type, stars:1-5, text}
dil:{}            // dilemma key → times shown
unlogged:0        // catch-record cards / logbook not filled in
licensed:{guide:true, boat:true, crc:true} // the credentials: WA charter license, vessel, catch record cards
stats:{trips:0, clients:0, fish:0, chinook:0, coho:0, earned:0, spent:0, tips:0, viol:0, fines:0, noshow:0, fuelGal:0, seen:{}}
visited:{home:true}
water:{}          // TRIPS: per-day spot conditions
```
The HUD (WORLD's `STATS`): Cash, Rep, Energy, Boat, Record (`S.cites/3`). Three citations = the career ends (`checkLoss()` in STORY returns `'permit'`).

## Places (WORLD's `L` keys; use exactly these)
- `home`: Apartment, Hilltop. Bed, logbook, rest. Boat on a trailer out back.
- `downtown`: Downtown Tacoma / 6th Ave. Tackle shop (gear, bait), diner, urgent care. Hours 6 AM–9 PM.
- `marina`: Point Defiance Marina and boathouse, Ruston. Boat launch, fuel dock, where trips start.
- `ruston`: Ruston Way waterfront. Les Davis Pier, walk, scout the bay, meet clients sometimes.
- `foss`: Thea Foss Waterway. Marina, Museum of Glass, a waterfront bar, the evening crowd.
- `gigharbor`: Gig Harbor, across the Narrows Bridge (the toll is paid eastbound only, so going back to Tacoma costs ~$5). Rich clients, marine repair shop.

Travel minutes come from WORLD's `TRAVEL` (realistic, 8–30 min).

## Cross-file functions (exact names)
TRIPS exports these; WORLD and STORY call them, each guarded with `typeof fn==='function'`:
- `marinaActions()` → an array of actions (the same shape as `actionsHere` items) for the marina: start today's booked trip, fuel up, launch.
- `homeTripActions()` → actions at home: fill in the catch record / logbook (`S.unlogged`).
- `bookingsView()` → HTML for the 📅 Bookings tab (waiting requests with answer buttons at the top, then the schedule).
- `regsView()` → HTML for the 📖 Regs tab.
- `fishView()` → HTML for the 🐟 Fish tab (today's spots Hot/Good/Fair/Poor, tides).
- `tripsMorning(d)` → called from STORY `onMorning`: it generates new booking requests and the day's water.
- `tripsNight(notes, d)` → called from STORY `onNight`: no-shows, a missed trip costs rep, bait spoils, the `unlogged` penalty.
- `ratingAvg()` → the ★ average of the last 20 reviews (or null).
- `window.legalBtn()` → the index of the legal button in the open modal (for the tests and bots).

WORLD's `EXTRA_TABS`: `{k:'book', ic:'📅', l:'Bookings', view:bookingsView}`, `{k:'fish', ic:'🐟', l:'Fish', view:fishView}`, `{k:'regs', ic:'📖', l:'Regs', view:regsView}`.

## Content facts (Tacoma, 2026; TRIPS researches and checks the regulations)
- Water: Marine Area 11 (Tacoma–Vashon): Point Defiance ("the Clay Banks", Owen Beach, Gibson Point), the Slag Pile at Ruston,
  Commencement Bay, Browns Point, Dalco Passage, the Narrows, Point Dalco, Quartermaster Harbor (Vashon), the Foss and Hylebos mouths.
- Fish: Chinook (king), coho (silver). No pinks in 2026 (an even year: pinks return in odd years). Mooching cut-plug herring, trolling flashers and hoochies, downriggers.
- Regs flavor (simplified, with the real 2026 numbers where TRIPS can find them): the daily limit, wild Chinook release (adipose fin
  intact = wild = release), barbless hooks required, catch record card filled in right after you land a fish, the charter license and
  vessel requirements, no culling, the Chinook minimum size, closed areas (e.g. Commencement Bay east of a line, when applicable), USCG six-pack (OUPV) limits.
- Lore: the Tacoma Aroma, the Narrows bridges and Galloping Gertie (1940), Mount Rainier ("the mountain is out"), Point Defiance Zoo,
  the Puyallup River, the Port of Tacoma cranes, Dick's/Frisko Freeze/Shake Shake Shake (generic diner names are fine), the Tacoma Dome,
  the Puyallup Tribe's treaty fishery (treat it respectfully), the "Grit City" pride, The Spar in Old Town.
- Tone: warm, wry, local. Short sentences. Emoji icons like Guide Master. US English.

## Scoring (STORY)
Score = cash + rep×40 + ★avg×1000 + trips×150 − cites×1500. Grades: A ≥ 14000, B ≥ 11000, C ≥ 8000, D ≥ 5000. Tune after the sim.

## Rules for all agents
- Plain browser JS, no modules, the global functions style of the engine. Each file must parse on its own (`node --check`).
- Don't run `tools/build.py` or `git` (the integrator does). Keep each file under ~60 KB.
- When done, reply with: the functions and globals you defined, any S fields you added, and anything the other files must do.
