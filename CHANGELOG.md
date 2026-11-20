# Changelog

Release notes for Tacompton. `/releasenow` adds a section here for every release, and the GitHub release notes
are taken from it.

## Unreleased

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
