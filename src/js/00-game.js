// ============================================================
//  GAME CONFIG: start here when you make a new game.
//  tools/new-game.py rewrites id / title / codePrefix / colors for you
//  (in this file, src/shell.html, the web manifest and sw.js).
//
//  Files, in build order (tools/build.py concatenates src/js/*.js by name):
//    00-game.js      this config
//    01-core.js      state, preferences, sound, player name, time + stat helpers
//    02-kit.js       bottom-sheet modals, event tiles, full-screen transitions
//    03-events.js    random-event engine (hooks, chances, cooldowns, chains)
//    04-loop.js      new game, days, nights, travel, the passing of time
//    05-ui.js        HUD, scene, tabs, action list, to-do + priorities, log, tips
//    06-save.js      autosave, 3 slots, migrations, transfer codes, service worker
//    07-endings.js   end screen, score, best score, achievements
//    08-settings.js  title screen, name/difficulty pickers, settings, accessibility, slots
//    09-keys.js      keyboard shortcuts for desktop
//    20-world.js     ← YOUR GAME: stats, starting state, the six Hilltop places, jobs, actions, scenery
//    21-story.js     ← YOUR GAME: the job pick, events, tips, to-do, neighbors, achievements, scoring, migrations
//    26-help.js      the Help sheet
//    29-update-notice.js  the "updated to version X" notice and What's new
//    41-install.js   the title screen's install bar and Install app button (Android/Chrome prompt, other browsers' steps, iPhone page)
//    99-boot.js      starts the app
//  Engine files (00–09) shouldn't need much editing; your game lives in 20+.
// ============================================================
const GAME={
  id:'tacompton',           // storage-key prefix and service-worker cache prefix (lowercase, no spaces)
  title:'Tacompton',
  tagline:'Two weeks on Hilltop',
  codePrefix:'TACOMPTON',   // transfer codes start with this, e.g. POCKETWEEK:eyJ…
  version:'0.1.0',           // bump on every release: shown in Settings, stamped into saves and sw.js
  schema:1,                  // bump when the shape of S changes, and add a MIGRATIONS entry (21-story.js)
  days:14,                   // two weeks: Mon Aug 3 – Sun Aug 16, 2026, your first two weeks on Hilltop
  wake:330,                  // 5:30 AM on day one (the job you pick sets your own alarm after that)
  startLoc:'home',
  travelAnim:20,             // trips this many minutes or longer play the full-screen transition
  defaultName:'Neighbor',     // used until the player picks a name
  slots:3,                   // save slots
};
const APP_VERSION=GAME.version, SAVE_SCHEMA=GAME.schema;
const KEY=k=>GAME.id+'.'+k;  // every localStorage key goes through this
const DAYS=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
// Difficulties: anything here is readable in your content as DF().something.
const DIFFS={
  // money: starting cash. bad: random-event multiplier (the bad ones only). cost: groceries, food, bills. No difficulty changes the score.
  easy:  {n:'Soft Landing',ic:'🌱',d:'More savings in the bank, cheaper groceries and fewer things going sideways. For learning the neighborhood.',money:1300,bad:0.6,cost:0.85},
  normal:{n:'Hilltop',     ic:'🏘️',d:'The two weeks as they come: rent is due, the fridge empties, and the neighborhood is right outside your door.',money:900,bad:1,cost:1},
  hard:  {n:'Tight Month', ic:'🔥',d:'Thin savings, pricier everything and more bad luck. Rent is the same $1,150. Same score, tougher two weeks.',money:500,bad:1.5,cost:1.15},
};
const DF=()=>DIFFS[(typeof S!=='undefined'&&S&&S.diff)||'normal']||DIFFS.normal;
