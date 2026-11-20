# Tacompton

**A salmon guide's season in the Grit City.** A mobile game (installable PWA, works offline) about running a small Puget Sound salmon-guide business out of Tacoma, WA. One season is 14 days, Monday Aug 3 to Sunday Aug 16, 2026. Book clients, run trips out of Point Defiance, handle the dilemmas the day throws at you, and finish with the best cash, reputation and ★ rating you can without losing your charter license.

It is a cut-down, single-season sibling of [Guide Master](https://github.com/krazow/Guide-Master): clients, bookings, trips, dilemmas with shuffled legal and illegal options, reviews, then ★ rating, cash, rep and citations.

## How to play

- **A day:** time moves only when you act. Tap actions on the 🧭 Here tab, travel with *Go somewhere*, watch your energy, and go to bed at the apartment.
- **Bookings:** requests wait on the 📅 Bookings tab. Accept the ones you can keep, and be at the marina on time. A missed trip costs reputation.
- **A trip:** fuel up, have bait and tackle, launch from Point Defiance, then make the calls through the day. Dilemmas come up along the way: the options are shuffled and none is highlighted, there is always a legal answer, and it costs something. Illegal ones can pay, if nobody is watching.
- **The water:** the 🐟 Fish tab rates today's spots Hot, Good, Fair or Poor, with tides. Chinook and coho only: no pinks in an even year.
- **The rules:** the 📖 Regs tab. Wild (adipose fin intact) Chinook are released, hooks are barbless, the catch record card gets filled in right after you land a fish. Three citations end your career.
- **The score:** cash + rep × 40 + ★ average × 1000 + trips × 150 − citations × 1500, graded A to F.

## Where it happens

Your apartment on the hilltop, downtown Tacoma (tackle shop, diner), Point Defiance Marina, Ruston Way, the Thea Foss Waterway and Gig Harbor across the Narrows Bridge. The water is Marine Area 11: the Clay Banks, the Slag Pile, Commencement Bay, Browns Point, Dalco Passage and the Narrows.

## Structure

- `src/js/00-09`: the engine, shared with Guide Master and the Krazow framework (state, modals, events, day loop, UI, saves, endings, settings, keys). Rarely edited.
- `src/js/20-29`: the content. `20-world.js` places, stats and actions, `21-story.js` events, scoring and achievements, `22-trips.js` clients, bookings, trips, dilemmas, fish and regulations, `26-help.js` the help, `29-update-notice.js` the update notice.
- `src/shell.html`, `src/style.css`: the page. `tools/build.py` builds `index.html`; `tools/build-offline.py` builds the single-file offline version.
- `tests/`: Playwright tests (headless Chromium) run by `tests/run.js`.

## Build and test

```
npm install                 # once (Playwright)
python3 tools/build.py      # build index.html
npm test                    # run every test (add a name filter: node tests/run.js smoke)
python3 tools/build-offline.py   # the single-file offline build
npm run serve               # http://localhost:8000
```

## Release process

Releases use the shared Krazow release kit ([krazow/release-kit](https://github.com/krazow/release-kit)). Type `/releasenow` in a Claude chat on this repo: it builds, tests, ships a beta, then promotes it to production. Pull requests merge automatically once CI passes; add the `no-automerge` label (or open a draft) to opt out. The Windows installer uses port 47851 and the offline file ships as `Tacompton-offline.html`.

## Disclaimer

Tacompton is a game. Its fishing regulations are simplified and may be out of date or wrong for real life. They are not legal advice. Before you fish, check the current Washington Department of Fish and Wildlife (WDFW) rules, emergency closures and your license requirements.
