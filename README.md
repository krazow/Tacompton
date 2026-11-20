# Tacompton

**Two weeks on Hilltop.** A mobile game (installable PWA, works offline) about moving into an apartment on Hilltop in Tacoma, WA. You have 14 days, Monday Aug 3 to Sunday Aug 16, 2026, to settle in: hold down a job, make rent, keep food in the fridge, keep your energy up and your stress down, and become part of the neighborhood. The name is a wink; the game is a love letter to a real community.

It is a sibling of [Guide Master](https://github.com/krazow/Guide-Master), built on the same engine.

## How to play

- **A day:** time moves only when you act. Tap actions on the Here tab, travel with *Go somewhere*, watch your energy, and go to bed at home.
- **Your job:** pick one at the start: a CNA at Tacoma General (early shift, better pay, more stress), a barista at a Hilltop café, or a line cook at a soul-food spot on MLK. Show up on time to keep your job standing up.
- **Rent:** $1,150, due by the end of the second week. Miss it and you are evicted.
- **Food:** cook from the fridge, or shop at the corner market on MLK.
- **Neighbors:** swim at People's Community Center, ride the Link, take in the view, show up to the Street Fair. The more people who know you, the better your score.
- **Losing:** you get fired (standing hits 0), burn out (stress hits 100) or get evicted.
- **The score:** cash, neighbors, job standing, shifts worked and low stress, graded A to F.

## Where it happens

Your apartment, MLK Jr Way, your job, the Hilltop Link station, People's Community Center and People's Park, and the overlook with the view of Commencement Bay and Mount Rainier.

## Structure

- `src/js/00-09`: the engine, shared with Guide Master and the Krazow framework. Rarely edited.
- `src/js/20-29`: the content. `20-world.js` places, stats and actions, `21-story.js` events, scoring and achievements, `26-help.js` the help, `29-update-notice.js` the update notice.
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

Tacompton is a game. Characters, jobs and businesses are made up.
