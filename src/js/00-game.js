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
//    20-world.js     ← YOUR GAME: stats, starting state, places, actions, scenery
//    21-story.js     ← YOUR GAME: events, tips, to-do, achievements, scoring, migrations
//    31-supplies.js  ← YOUR GAME: food, home fuel storage, power outages and the generator
//    32-home.js      ← YOUR GAME: the cabin (the adapter for src/home/, the CabinUpkeep module)
//    41-install.js   the title screen's install bar and Install app button (Android/Chrome prompt, other browsers' steps, iPhone page)
//    45-names.js     ← YOUR GAME: the cabin carries your name, the boats carry the names you give them
//    99-boot.js      starts the app
//  Engine files (00–09) shouldn't need much editing; your game lives in 20+.
// ============================================================
const GAME={
  id:'tacompton',           // storage-key prefix and service-worker cache prefix (lowercase, no spaces)
  title:'Tacompton',
  tagline:'A salmon guide’s season in the Grit City',
  codePrefix:'TACOMPTON',   // transfer codes start with this, e.g. POCKETWEEK:eyJ…
  version:'0.1.0',           // bump on every release: shown in Settings, stamped into saves and sw.js
  schema:1,                  // bump when the shape of S changes, and add a MIGRATIONS entry (21-story.js)
  days:14,                   // one season: Mon Aug 3 – Sun Aug 16, 2026 (Puget Sound Marine Area 11 salmon)
  wake:270,                  // 4:30 AM: guides start early
  startLoc:'home',
  travelAnim:20,             // trips this many minutes or longer play the full-screen transition
  defaultName:'Skipper',      // used until the player picks a name
  slots:3,                   // save slots
};
const APP_VERSION=GAME.version, SAVE_SCHEMA=GAME.schema;
const KEY=k=>GAME.id+'.'+k;  // every localStorage key goes through this
const DAYS=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
// Difficulties: anything here is readable in your content as DF().something.
const DIFFS={
  // money: starting cash. bad: random-event multiplier. enforce: catch-chance multiplier (WDFW officers on the water). fine: fine multiplier;
  // esc: extra fine per citation already on your record. cost: fuel, moorage, bills and repairs.
  // mood: client happiness (tips, rep). book: how many booking requests come in. wear: boat wear. rateK: how many bookings a price rise loses (1 = the usual). craft: how much reading the water and skill pay (1 = fully). No difficulty changes the score.
  easy:  {n:'Rookie Season',ic:'🎣',d:'More cash, fewer fish cops on the water, cheaper bills and easygoing clients. For learning Marine Area 11.',money:3000,bad:0.6,enforce:0.7,fine:0.8,esc:0.1,cost:0.8,mood:5,book:1.08,wear:0.85,craft:1,rateK:1},
  normal:{n:'Licensed Guide',ic:'⚓',d:'Tacoma as it is: busy water off Point Defiance, the mountain out on good days, and WDFW patrolling the Sound.',money:1500,bad:1,enforce:1,fine:1,esc:0.2,cost:1,mood:0,book:1,wear:1,craft:1,rateK:1},
  hard:  {n:'Grit City',ic:'🏭',d:'Thin cash, more patrols, fines that climb steeply with every citation, dearer fuel and repairs, pickier clients, fewer calls and more bad luck. The crowded Clay Banks mean a price rise loses fewer bookings, but the fish have seen every herring in the Sound: reading the water pays less. Same score, tougher grade.',money:600,bad:1.5,enforce:1.4,fine:1.1,esc:0.3,cost:1.15,mood:-3,book:0.95,wear:1.25,craft:0,rateK:0.8},
};
const DF=()=>DIFFS[(typeof S!=='undefined'&&S&&S.diff)||'normal']||DIFFS.normal;
