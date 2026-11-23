const { open, noErrors, assert } = require('./helpers');

// Start year, part 3 (src/js/65-era-people.js): the neighbors, the shops and the jobs fit the era.
async function start(page, year, { age = 18, job = 'cafe', len = 'life' } = {}) {
  await page.evaluate(([year, age, job, len]) => {
    closeModals(); setMode(age < 18 ? 'grow' : 'adult');
    LIFE_PICK = { length: len, startAge: age, startYear: year, birthday: { m: 3, d: 14, label: 'March 14' } };
    newGame('normal'); closeModals();
    if (age >= 18) { pickJob(job); closeModals(); }
    tab = 'act'; render();
  }, [year, age, job, len]);
}
const tick = page => page.evaluate(() => new Promise(r => setTimeout(r, 0)));
// what a player sees: the Here tab of every Hilltop place, the neighbors (all of them met) and the job sheet
async function screens(page) {
  return page.evaluate(async () => {
    const o = {}, wait = () => new Promise(r => setTimeout(r, 0)), T = isGrow() ? G_L : L;
    for (const k of Object.keys(T)) {
      if (T[k].hood || T[k].hidden) continue;
      S.loc = k; tab = 'act'; S.t = S.cur * 1440 + 720; render();
      document.querySelectorAll('#app details').forEach(d => d.open = true);
      await wait(); o['here:' + k] = document.getElementById('app').innerText;
    }
    if (!isGrow()) {
      NEIGHBORS.forEach(x => { S.met[x.id] = 1; });
      tab = 'hood'; render(); await wait(); o.neighbors = document.getElementById('app').innerText;
      for (const x of NEIGHBORS) { say(`👋 You meet <b>${x.n}</b>. ${x.d}`); }
      tab = 'act'; render(); await wait(); o.met = document.getElementById('app').innerText;
      jobModal(); await wait(); o.jobs = document.getElementById('mbg').innerText; closeModals();
    }
    tab = 'act'; render(); return o;
  });
}
const LATER = {
  1980: /smartphone|\bapps?\b|Wi-?Fi|latte|espresso|barista|rideshare|\bLink\b|T Line|ORCA|podcast|group chat|works remote|software|UW Tacoma|teriyaki|Hot Shop|Museum of Glass|Tacoma Dome|internet|online|\btext(s|ing)?\b|e-?mail|website|laptop|pickup locker|Upgrade your phone|IT support|community fridge|oat milk|Pacific Seas|chandelier/i,
  1990: /smartphone|\bapps?\b|Wi-?Fi|latte|espresso|barista|rideshare|\bLink\b|T Line|ORCA|podcast|group chat|works remote|software|teriyaki|Hot Shop|Museum of Glass|internet|online|\btext(s|ing)?\b|e-?mail|website|laptop|pickup locker|Upgrade your phone|IT support|community fridge|oat milk|Pacific Seas|chandelier/i,
};
const leaks = (o, re) => Object.entries(o).flatMap(([k, t]) => (t || '').split('\n').filter(l => re.test(l)).map(l => `${k}: ${l.slice(0, 160)}`));

module.exports = [
  { name: 'nothing from a later year: every Hilltop place, the neighbors and the job sheet in 1980 and 1990', fn: async ctx => {
    const { page, errors } = await open(ctx);
    for (const y of [1980, 1990]) {
      for (const job of ['cafe', 'hospital', 'kitchen']) {
        await start(page, y, { job });
        const o = await screens(page);
        assert.ok(Object.keys(o).filter(k => k.startsWith('here:')).length >= 6, 'every Hilltop place');
        assert.deepStrictEqual(leaks(o, LATER[y]), [], `${y}, ${job}`);
      }
      for (const age of [12, 15]) {
        await start(page, y, { age });
        const o = await screens(page);
        assert.deepStrictEqual(leaks(o, LATER[y]), [], `${y}, Growing Up at ${age}`);
      }
    }
    noErrors(errors);
  } },
  { name: 'the shops in their era: a lunch counter, a bus stop, a TV & radio repair shop, and places that weren’t there yet', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page, 1980);
    const r = await page.evaluate(async () => {
      S.loc = 'mlk'; render(); await new Promise(r => setTimeout(r, 0));
      const mlk = document.getElementById('app').innerText, acts = actionsHere().map(a => a.l);
      S.loc = 'link'; render(); await new Promise(r => setTimeout(r, 0));
      return { mlk, acts, link: document.getElementById('app').innerText, art: L.link.art({ night: false }), market: L.pr_market.hidden,
        pac: L.dt_pacific.desc, kw: Object.keys(L) };
    });
    assert.match(r.mlk, /lunch counter/); assert.match(r.mlk, /LUNCH/); assert.doesNotMatch(r.mlk, /teriyaki/i);
    assert.ok(r.acts.some(l => /TV & radio repair/.test(l)) && !r.acts.some(l => /your phone|pickup locker/.test(l)), r.acts.join(' | '));
    assert.match(r.link, /BUS STOP/); assert.doesNotMatch(r.art, /scale\(1\)"><rect x="0" y="-30" width="150"/, 'a bus, not the train');
    assert.strictEqual(r.market, true, 'no Proctor Farmers Market yet');
    assert.match(r.pac, /trains still stop/);
    // a 1980 Growing Up at 15: the Dome and the Museum of Glass aren't on the map yet
    await start(page, 1980, { age: 15 });
    const g = await page.evaluate(() => ({ dome: G_L.dt_dome.hidden, glass: G_L.dt_glass.hidden, pac: G_L.dt_pacific.desc }));
    assert.deepStrictEqual([g.dome, g.glass], [true, true]); assert.match(g.pac, /trains still stop/);
    // the keys stay: travel works
    await start(page, 1980);
    const t = await page.evaluate(() => { return travelMins('home', 'pr_main'); });
    assert.ok(t > 0);
    noErrors(errors);
  } },
  { name: 'the neighbors and the jobs by era, and the career titles', fn: async ctx => {
    const { page, errors } = await open(ctx);
    const d = {};
    for (const y of [1980, 1990, 2000, 2010, 2026]) {
      await start(page, y);
      d[y] = await page.evaluate(() => {
        const nb = id => NEIGHBORS.find(x => x.id === id).d;
        return { dre: nb('dre'), eli: nb('eli'), denise: nb('denise'), malik: nb('malik'), cafe: JOBS.cafe.n, role: JOBS.cafe.role, place: JOBS.cafe.place,
          tech: JOBS.tech.n, techRole: JOBS.tech.role, elec: JOBS.elec.n, cna: JOBS.hospital.n, ladder: CAREER_LADDERS.tech.r.map(r => r.t), cafeL: CAREER_LADDERS.cafe.r.map(r => r.t), title: careerTitle('cafe') };
      });
    }
    assert.match(d[1980].dre, /public-access TV/); assert.match(d[2026].dre, /podcast/);
    assert.match(d[1980].eli, /port/); assert.doesNotMatch(d[1990].eli, /software|remote/); assert.match(d[2026].eli, /Works remote/);
    assert.match(d[1980].denise, /wheelchair lifts/); assert.match(d[2026].denise, /Link stops/);
    assert.match(d[1980].malik, /TCC/); assert.match(d[2026].malik, /app/);
    assert.deepStrictEqual([d[1980].cafe, d[1980].role, d[1980].place, d[1980].title], ['Counter server at a Hilltop diner', 'counter server', 'the diner', 'Counter server at a Hilltop diner']);
    assert.strictEqual(d[1990].cafe, 'Counter server at a Hilltop diner'); assert.strictEqual(d[2000].cafe, 'Barista at a Hilltop café');
    assert.deepStrictEqual(d[1980].cafeL, ['Counter server', 'Head server', 'Diner manager']);
    assert.deepStrictEqual([d[1980].tech, d[1990].tech, d[2000].tech], ['Computer operator at an office downtown', 'Help desk tech at an office downtown', 'IT support tech at an office downtown']);
    assert.deepStrictEqual(d[1980].ladder, ['Computer operator', 'Programmer', 'Data processing manager']);
    assert.deepStrictEqual(d[2026].ladder, ['IT support tech', 'Systems administrator', 'IT manager']);
    for (const y in d) { assert.strictEqual(d[y].cna, 'CNA at Tacoma General'); assert.match(d[y].elec, /Electrician apprentice/); }
    // the shift lines follow the job's era
    await start(page, 1980);
    const s = await page.evaluate(() => { S.t = S.cur * 1440 + JOBS.cafe.start; S.loc = 'work'; work(0); return uiNarr[uiNarr.length - 1]; });
    assert.match(s, /Paid/);
    assert.doesNotMatch(s, /Link|drinks|latte/);
    noErrors(errors);
  } },
  { name: '2026 is unchanged: the same places, neighbors and jobs', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page, 2026);
    const r = await page.evaluate(async () => {
      S.loc = 'mlk'; render(); await new Promise(r => setTimeout(r, 0));
      return { t: document.getElementById('app').innerText, cafe: JOBS.cafe.n, role: JOBS.cafe.role, tech: JOBS.tech.n, link: L.link.desc, mk: L.pr_market.hidden,
        eli: NEIGHBORS.find(x => x.id === 'eli').d, alt: eraPlaceAlt('link'), p: eraPersonAlt('eli'), txt: eraText('A latte and a pastry at The Slow Pour'),
        acts: actionsHere().map(a => a.l) };
    });
    assert.match(r.t, /teriyaki spot/); assert.strictEqual(r.cafe, 'Barista at a Hilltop café'); assert.strictEqual(r.role, 'barista');
    assert.strictEqual(r.tech, 'IT support tech at an office downtown'); assert.match(r.link, /T Line stop/); assert.strictEqual(r.mk, false);
    assert.match(r.eli, /Works remote for a software company/); assert.strictEqual(r.alt, null); assert.strictEqual(r.p, null);
    assert.strictEqual(r.txt, 'A latte and a pastry at The Slow Pour');
    assert.ok(r.acts.some(l => /phone/.test(l)), 'the phone counter is still there');
    // Quick play too
    await start(page, 1980, { len: 'quick' });
    assert.strictEqual(await page.evaluate(() => JOBS.cafe.n), 'Barista at a Hilltop café');
    noErrors(errors);
  } },
  { name: 'the guide: places, neighbors and jobs change with the era', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await page.click('#helpBtn'); await page.waitForSelector('#tut');
    const t = await page.evaluate(() => document.getElementById('tut-lengths').innerText);
    assert.match(t, /neighbors, the shops and the jobs fit the year/);
    noErrors(errors);
  } },
];
