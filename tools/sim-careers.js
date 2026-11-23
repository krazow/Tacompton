#!/usr/bin/env node
// Career balance check: node tools/sim-careers.js [index.html]   (needs Playwright, like the tests; CHROME_PATH=/path/to/chrome)
// Plays an adult Lifetime from 18 for each job and path with two scripted players, and prints rent against pay at 25, 40 and 60.
//   sensible  works every shift on time in the key weeks, picks up extra shifts in the skips, and starts any training offered
//   sloppy    late to half the shifts and misses a third in the key weeks, sees friends in the skips, never trains
//   careless  (--college / --army only) the same, missing 70% of the shifts
// node tools/sim-careers.js index.html --college 20   many seeds of a college student from 18 to 23: evictions, warnings, cheaper rooms
// node tools/sim-careers.js index.html --army         the same for a soldier
// Pay is a month of full-time shifts at the current rate (plus average tips); "rent share" is rent ÷ that pay.
const path = require('path');
const { pathToFileURL } = require('url');
const { chromium } = require('playwright');

function simLife({ policy, jobKey, route, seed, ages, stopAge }) {
  let a = seed >>> 0;
  Math.random = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const R = Math.random, good = policy === 'sensible';
  closeModals(); setMode('adult'); LIFE_PICK = { length: 'life', startAge: 18, birthday: { m: 3, d: 14, label: 'March 14' } };
  newGame('normal'); closeModals(); pickJob(jobKey); closeModals();
  if (route === 'army' && typeof milEnlist === 'function') milEnlist();
  else if (route !== 'job') { Object.assign(S.life, { path: route, parttime: true, prog: 0, done: false, rentHelp: 180, rentHelpLeft: 12 }); }
  const log = { warned: null, cheaper: null, evictedAfterWarning: null, minCash: Infinity };
  const out = {}, rec = () => {
    const J = JOBS[S.job], pf = lifePayF(), tips = J.tips ? (J.tips[0] + J.tips[1]) / 2 : 0;
    const pay = Math.round((J.pay * pf + tips) * J.days.length * 52 / 12);
    return { age: S.age, rent: S.rent.amt, pay, share: Math.round(S.rent.amt / pay * 100), cash: Math.round(S.money), title: J.role, shift: Math.round(J.pay * pf) };
  };
  let guard = 0;
  while (S && !S.over && guard++ < 40000) {
    if (stopAge && S.age >= stopAge) break;
    log.minCash = Math.min(log.minCash, Math.round(S.money));
    if (log.warned == null && S.life && S.life.rentWarned != null) log.warned = S.age;
    for (const t of ages) if (!out[t] && S.age >= t && !S.life.retired) out[t] = rec();
    const m = document.getElementById('mbg');
    if (m) {
      const bs = [...m.querySelectorAll('.modal > button.act')].filter(b => !b.disabled), tx = b => b.textContent;
      let b = null;
      if (good) b = bs.find(x => /Start the|Enroll/.test(tx(x))) || bs.find(x => /somewhere cheaper|Move back in/.test(tx(x))) || bs.find(x => /extra shifts/.test(tx(x)));
      else b = bs.find(x => /See friends/.test(tx(x)));
      if (!b) b = bs[0];
      if (b && /somewhere cheaper|Move back in/.test(tx(b)) && log.cheaper == null) log.cheaper = S.age;
      if (b) b.click(); else m.remove();
      continue;
    }
    const d = day(), J = job();
    S.stress = Math.min(S.stress, 40); S.energy = Math.max(S.energy, 60); S.food = Math.max(S.food, 2);
    if (!good) S.standing = Math.max(S.standing, 30);
    if (isShiftDay(d) && !(d in S.worked)) {
      const miss = !good && R() < (policy === 'careless' ? 0.7 : 0.34), late = !good && R() < 0.5 ? 25 : 0;
      if (!miss) { S.loc = 'work'; S.t = d * 1440 + J.start + late; work(late); }
    }
    if (!S.rent.paid && S.money >= S.rent.amt) { money(-S.rent.amt); S.rent.paid = true; S.rent.paidDay = day(); }
    S.loc = 'home'; S.t = Math.max(S.t, d * 1440 + 1320); endDay('home');
  }
  const loss = typeof checkLoss === 'function' ? checkLoss() : null;
  if (loss === 'evicted' || (S.life && S.life.ended === 'evicted')) log.evictedAfterWarning = log.warned != null;
  return { log, out, over: S.over, ended: S.life && S.life.ended, age: S.age, cash: Math.round(S.money), rent: S.rent.amt, loss: typeof checkLoss === 'function' ? checkLoss() : null };
}

(async () => {
  const file = process.argv[2] || path.join(__dirname, '..', 'index.html');
  const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
  const page = await (await browser.newContext({ viewport: { width: 400, height: 800 } })).newPage();
  page.on('pageerror', e => console.error('page error:', e.message));
  await page.addInitScript(() => { localStorage.setItem('tacompton.prefs', JSON.stringify({ tips: false, sound: false })); localStorage.setItem('tacompton.name', 'Sim'); localStorage.setItem('tacompton.popups', 'off'); });
  await page.goto(pathToFileURL(path.resolve(file)).href);
  await page.waitForSelector('.title');
  const flag = process.argv.indexOf('--college'), mil = process.argv.includes('--army');
  if (flag > 0 || mil) {
    // many seeds, from 18 to 23: does a college student (or a soldier) ever get evicted, and was there a warning first?
    const n = flag > 0 ? Number(process.argv[flag + 1]) || 20 : 10, route = mil ? 'army' : 'college', job = mil ? 'cafe' : 'cafe';
    const tally = {};
    for (const policy of ['sensible', 'sloppy', 'careless']) for (let i = 0; i < n; i++) {
      await page.reload(); await page.waitForSelector('.title');
      const seed = 1000 + i * 7919;
      const r = await page.evaluate(simLife, { policy, jobKey: job, route, seed, ages: [19, 20, 22], stopAge: 23 });
      const t = tally[policy] || (tally[policy] = { runs: 0, evicted: 0, warnedFirst: 0, warned: 0, cheaper: 0, minCash: [] });
      t.runs++; if (r.log.evictedAfterWarning != null) { t.evicted++; if (r.log.evictedAfterWarning) t.warnedFirst++; }
      if (r.log.warned != null) t.warned++; if (r.log.cheaper != null) t.cheaper++; t.minCash.push(r.log.minCash);
      console.log(`${route} ${policy} seed ${seed}: ${r.over ? 'ended ' + (r.ended || r.loss) : 'ok'} at ${r.age}, cash $${r.cash}, lowest $${r.log.minCash}, warned ${r.log.warned ?? '-'}, cheaper room ${r.log.cheaper ?? '-'}`);
    }
    for (const p in tally) { const t = tally[p]; console.log(`${p}: ${t.runs} runs, ${t.evicted} evicted (${t.warnedFirst} after a warning), ${t.warned} warned, ${t.cheaper} took a cheaper room, lowest cash ${Math.min(...t.minCash)}`); }
    await browser.close(); return;
  }
  const ages = [25, 40, 60];
  const cases = [['hospital', 'job'], ['cafe', 'job'], ['kitchen', 'job'], ['kitchen', 'trade'], ['cafe', 'college']];
  console.log('| start | player | ' + ages.map(a => `age ${a}: title · rent / pay (share) · cash`).join(' | ') + ' | the end |');
  console.log('|---|---|' + ages.map(() => '---').join('|') + '|---|');
  for (const [job, route] of cases) for (const policy of ['sensible', 'sloppy']) {
    await page.reload(); await page.waitForSelector('.title');
    const r = await page.evaluate(simLife, { policy, jobKey: job, route, seed: 7919, ages });
    const cell = a => { const x = r.out[a]; return x ? `${x.title} · $${x.rent} / $${x.pay} (${x.share}%) · $${x.cash}` : '—'; };
    console.log(`| ${route === 'job' ? job : route} | ${policy} | ${ages.map(cell).join(' | ')} | ${r.over ? (r.ended || r.loss || 'over') : 'running'} at ${r.age}, cash $${r.cash} |`);
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
