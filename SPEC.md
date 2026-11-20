# Tacompton: build contract (Hilltop edition)

**Game:** Tacompton, a mobile PWA life game about **living on Hilltop in Tacoma, WA**. There is **NO fishing, boats, marina,
salmon, WDFW, charters or trips anywhere** (the earlier fishing version is being removed entirely, so don't mention it).
You've just moved into an apartment on Hilltop. Two weeks (14 days, `GAME.days=14`, Mon **Aug 3** to Sun **Aug 16, 2026**) to
settle in: hold down a job, make rent, keep food in the fridge, keep your energy up and your stress down, and become part of the
neighborhood. Every place is ON Hilltop (no Downtown, Ruston, Foss or Gig Harbor).

Hilltop context: a historically Black neighborhood, now gentrifying, with a strong community. Martin Luther King Jr. Way is the
main street. The Hilltop Link light rail (the T Line extension opened in 2023) runs along MLK with stops like St Joseph and
MLK Jr Way/S 11th. MultiCare Tacoma General Hospital and St. Joseph Medical Center are the big employers. People's Community
Center (pool, gym) and People's Park are on MLK. Murals, corner stores, barbershops, food spots, the Hilltop Street Fair (a real
summer event: keep it to one in-game Saturday, Aug 8), the views of Commencement Bay and Mount Rainier from the hill. Write it with
warmth and respect: real community, real neighbors, gentle humor, no crime-ridden "Tacompton" clichés. The name is a wink, the
game is a love letter. Generic or invented business names are fine ("the corner market", "Mama's Kitchen"), and don't invent facts
about real named businesses.

**Engine:** `src/js/00-09` came from Guide Master and are generic: don't edit them. APIs: `modal`, `modalSwap`, button
`{l, fn, stay}`, `showTile`, `say`, `pass(min)`, `adj(stat, n)`, `money(n)`, `$`, `$k`, `fmt`, `tod()`, `day()`, `dayName(d)`,
`pick`, `defEvent`, `chain`, `fireHook`, `endDay(where)`, `go(dest)`, `isOpen`, `hoursTxt`, `DF()`. The framework contract (every
name the engine needs) is at `/home/claude/framework/src/js/20-world.js` and `21-story.js`. That small life-sim sample
("Pocket Week": work shifts, pantry, energy, stress, job) is the closest model. The current `src/js/20-world.js` has an
"engine shims" block at its end (artOn, artNarrEvent, ART, LOGSUB, cabinName, reqKey, dlabel, …): **keep that block**.

## File ownership
| Agent | Files |
|---|---|
| GAME | `src/js/00-game.js` (DIFFS text, tagline, comments), `src/js/20-world.js`, `src/js/21-story.js`, `src/js/26-help.js`, `src/js/29-update-notice.js` (CHANGELOG object: only 0.1.0, described as the Hilltop game; WN_DATES `{'0.1.0':'2026-11-19'}`) |
| SHIP | `README.md`, `CHANGELOG.md`, `manifest.webmanifest`, `src/shell.html`, `release.json` (description), `package.json` (description), `install/ios.html`, `tests/*.test.js` |

## Places (`L` keys, exactly these)
- `home`: your apartment on Hilltop (bed, rest, cook from the fridge, call family, the alarm).
- `mlk`: MLK Jr Way. The corner market (groceries), a food spot, the barbershop or salon, the murals.
- `work`: your job. The player picks a job at the start (onNewGame modal): **hospital** (a CNA at Tacoma General: early shift
  7–3:30, better pay, more stress), **cafe** (a barista at a Hilltop café: 6:30–2:30), or **kitchen** (a line cook at a soul-food
  spot on MLK: 2–10 PM). Shifts Mon–Fri (the kitchen works Wed–Sun instead). `S.job` = which one; `S.standing` = 0–100 job standing.
- `link`: the Hilltop Link station (St Joseph). The streetcar costs $0 (Link is free), is quick to ride, and gives people-watching events.
- `peoples`: People's Community Center and People's Park: the pool, the gym, community programs, a pickup basketball game.
- `view`: the overlook / a bench with the Commencement Bay and Rainier view (the edge of the hill). Calm, sunset.

## State (S)
`money` (start per DF().money scaled to around 900), `energy`, `stress` (high is bad), `food` (meals in the fridge), `standing` (the job),
`community` (0–100: neighbors who know you), `rent:{due:13, amt:1150, paid:false}` (rent due by the end of day index 13),
`worked:{}`, `visited:{home:true}`, `stats:{shifts, late, missed, earned, spent, meals, neighbors, walks, swims}` plus per-day maps.

HUD: Cash, Energy, Stress, Food, Job (standing). Losses: `fired` (standing 0), `burnout` (stress 100), `evicted` (rent unpaid at the
end of day 13, or money < −500). Score: cash + community×15 + standing×8 − stress×5 + shifts×60 (+ bonuses), grades A–F tuned so
decent play gets a B. Content: 15+ events (the Link bell, a neighbor's barbecue, a mural being painted, the street fair on Sat
Aug 8, a heat wave, the mountain is out, a block party, a lost dog, a power blip, a free fridge, a church choir on Sunday), TIPS for a
new player, todoItems, 10+ achievements, a title SVG (the hill, the Link train, Rainier), and a short Help.

## Rules for all agents
- Plain browser JS globals in the engine style; each file must pass `node --check`. Don't run git. You MAY run
  `python3 tools/build.py` and the tests (`NODE_PATH=/opt/npm-tools/node_modules CHROME_PATH=/usr/bin/google-chrome node tests/run.js`)
  to check your work once the other agent's files exist.
- When done, reply briefly: the globals and S fields you defined, and anything the other agent must know.
