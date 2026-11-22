// Headless balance simulation: plays whole two-week games with scripted player policies, inside the built game page.
// Used by tools/sim.js (the grade table) and tests/balance.test.js.
// simGame runs in the page (page.evaluate(simGame, {policy, job, diff, seed})) and must stay self-contained.
//   sensible       works every shift on time, buys groceries before the fridge empties, pays rent when it can,
//                  calls home, unpacks, says hi on the corner, one nice thing on days off, bed by about 10:30 PM.
//   careful-social everything sensible does, plus pickup ball, volunteering, sunsets, swims when stressed,
//                  break-room coffee and the street fair; bed by 10:30 PM.
//   sloppy         often late, misses a shift now and then, rarely looks after stress, up past midnight some nights,
//                  groceries only when the fridge is empty, rent on the last weekend.
function simGame({ policy, job, diff, seed }) {
  let a = seed >>> 0;
  Math.random = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const R = Math.random, ssNow = () => typeof sunsetNow === 'function' ? sunsetNow() : SUNSET;
  let peak = 0, sum = 0, n = 0;
  let deciding = false; const seen = new Set();
  // Decisions (03-events.js) are answered as they come up, the way a player taps the tile: sensible takes the default (the
  // cautious option), careful-social the first option (join in, help out) once the day's shift is done, and the default for setbacks, sloppy ignores most (they default at night) and picks any option now and then. Moments (Stop and watch):
  // careful-social stops, sensible stops when stress is up, sloppy keeps going.
  const decide = () => {
    if (deciding || !alive() || typeof choicesWaiting !== 'function') return 0; deciding = true; let done = 0;
    try {
      for (const id of choicesWaiting()) {
        if (!alive()) break;
        const o = choiceOpts(id) || [], ok = o.map((x, i) => i).filter(i => !o[i].dis), d = choiceDflt(id), amb = !!AMB[id];
        const busy = isShiftDay(day()) && tod() < JOBS[S.job].end;   // a shift still ahead today (or now): no time to spare
        let i = d;
        if (amb) i = !busy && (P === 'careful-social' || (P === 'sensible' && S.stress > 30)) ? 0 : d;
        else if (P === 'careful-social') {   // decides after work (or it defaults tonight); setbacks the cautious way, neighbors and good news: join in
          if (busy) continue; const e = EV.find(x => x.id === id), setback = e && e.tile && e.tile[2] === 'bad';
          i = !setback && o[0] && !o[0].dis ? 0 : d; }
        else if (P === 'sloppy') { if (seen.has(id)) continue; seen.add(id); if (R() >= 0.3) continue; i = ok[Math.floor(R() * ok.length)] ?? d; }   // mostly lets it slide to tonight
        uiNarr = []; choiceApply(id, i, 'pick'); afterAction(); done++;
      }
    } finally { deciding = false; }
    return done;
  };
  const flush = () => { if (S && !S.over) { peak = Math.max(peak, S.stress); sum += S.stress; n++; } let k = 0; while (document.getElementById('mbg') && k++ < 30) MBTN(choiceBtn() >= 0 ? choiceBtn() : 0); const c = document.querySelector('.cross'); if (c) c.click(); clearTiles(); if (!deciding && alive() && decide()) flush(); };
  const alive = () => S && !S.over;
  const act = re => { if (!alive()) return false; const x = actionsHere().find(y => re.test(y.l) && !y.dis); if (!x) return false; uiNarr = []; x.fn(); afterAction(); flush(); return true; };
  const goTo = k => { if (!alive() || S.loc === k) return; go(k); flush(); };
  const until = m => { if (!alive()) return; if (tod() < m) { pass(m - tod()); afterAction(); flush(); } };
  const bed = m => { if (!alive()) return; goTo('home'); if (!alive()) return; until(m); if (alive()) { endDay('home'); flush(); } };
  const stayUp = () => { if (!alive()) return; until(1438); pass(5); afterAction(); flush(); };
  const tryAll = list => list.forEach(re => act(re));

  if (typeof setMode === 'function') setMode('adult');
  newGame(diff); closeModals(); clearTiles(); pickJob(job); closeModals(); render();
  const J = JOBS[job], early = J.start < 720;
  const P = policy;
  let guard = 0;
  while (alive() && guard++ < 20) {
    const d = day(), sd = isShiftDay(d);
    const lateBy = P === 'sloppy' && sd ? (R() < 0.12 ? -1 : R() < 0.3 ? 20 + Math.floor(R() * 30) : 0) : 0;   // −1: misses it
    const shift = () => {
      if (!sd || lateBy < 0 || !alive()) return;
      const leave = J.start - travelMins(S.loc, 'work') - 5 + lateBy;
      until(leave); goTo('work'); act(/Work your shift/);
      if (P === 'careful-social') act(/Break-room coffee/);
    };
    const errands = () => {
      if (S.loc !== 'mlk') goTo('mlk');
      if (S.food <= (P === 'sloppy' ? 0 : 2) && tod() >= 420 && tod() < 1300) act(/Groceries/);
      if (P !== 'sloppy' || R() < 0.3) act(/Stop and talk/);
      if (d === FAIR_DAY && P !== 'sloppy') act(/Street Fair/);
      if (P === 'careful-social') act(/murals/);
    };
    const homeStuff = () => {
      goTo('home');
      if (P !== 'sloppy') tryAll([/Unpack a box/, /Call home/]);
      else if (R() < 0.3) act(/Unpack a box/);
      if (!S.rent.paid && canAfford(S.rent.amt) && (P !== 'sloppy' || d >= 11)) act(/Pay rent/);
      if (P !== 'sloppy' && S.food >= 3) act(/Cook something/);
    };
    const leisure = () => {   // a free afternoon or evening
      if (P === 'sloppy') {   // does something fun about half the time, and reacts once stress shows red
        if (S.stress >= 70) { goTo('home'); act(/Call home/); if (tod() < 1180) { goTo('peoples'); act(/Swim laps/); } return; }
        const r = R(); if (r < 0.2) { goTo('view'); act(/Sit on the bench/); } else if (r < 0.35) { goTo('link'); act(/Ride the T Line/); } else if (r < 0.5 && tod() < 1180) { goTo('peoples'); act(/Swim laps/); }
        return; }
      if (P === 'careful-social') {
        if (tod() < 1080 && tod() >= 540) { goTo('peoples'); act(/community program/); }
        if (S.stress > 15) { goTo('peoples'); act(/Swim laps/); }
        if (tod() < 1230) { goTo('peoples'); until(1020); act(/pickup game/); }
        if (tod() < ssNow() + 10) { goTo('view'); until(ssNow() - 40); act(/Watch the sunset/); }
        if (d % 3 === 0) { goTo('link'); act(/Ride the T Line/); }
        return;
      }
      // sensible: one nice thing on days off, or when stress climbs past 40; alternating
      if (sd && S.stress <= 40) return;
      if (d % 2 === 0) { if (tod() < ssNow() + 10) { goTo('view'); until(ssNow() - 40); act(/Watch the sunset/); } }
      else if (tod() < 1180) { goTo('peoples'); act(/Swim laps/); }
    };
    const bedtime = () => {
      if (P === 'sloppy') { if (R() < 0.3) stayUp(); else bed(1425); }
      else bed(1350);
    };
    if (early) {
      shift(); errands(); homeStuff(); leisure(); if (!sd || P === 'careful-social') { errands(); }
      bedtime();
    } else {   // the kitchen: mornings free, shift 2–10 PM
      until(Math.max(tod(), P === 'sloppy' ? 600 : 480));
      homeStuff(); errands();
      if (sd) { if (P === 'careful-social' && tod() < 780) { goTo('peoples'); act(/community program/); } if (S.stress > 20 && P !== 'sloppy') { goTo('peoples'); act(/Swim laps/); } if (P === 'sloppy' && tod() < 780) leisure(); shift(); }
      else leisure();
      bedtime();
    }
  }
  const sc = Math.round(scoreOf()), lost = !!checkLoss() || (S.cur < GAME.days - 1);
  return { grade: lost ? 'F' : gradeOf(sc)[0], score: sc, stress: S.stress, community: S.community, standing: S.standing, money: Math.round(S.money), peak, avgStress: Math.round(sum / Math.max(1, n)), met: metCount(), day: S.cur, loss: checkLoss() };
}
const POLICIES = ['sensible', 'careful-social', 'sloppy'];
const SIM_JOBS = ['hospital', 'cafe', 'kitchen'];
const SIM_DIFFS = ['easy', 'normal', 'hard'];
module.exports = { simGame, POLICIES, SIM_JOBS, SIM_DIFFS };
