const { open, noErrors, assert, reload } = require('./helpers');

// Start year (src/js/63-era.js): a life can begin in 1980, 1990, 2000, 2010, 2020 or 2026.
async function start(page, len, age, year, job = 'cafe') {
  await page.evaluate(([len, age, year, job]) => {
    if (typeof SCH_SNOW !== 'undefined') SCH_SNOW = 0;
    closeModals(); setMode(age < 18 ? 'grow' : 'adult');
    LIFE_PICK = { length: len, startAge: age, startYear: year, birthday: { m: 3, d: 14, label: 'March 14' } };
    newGame('normal'); closeModals();
    if (age >= 18 && typeof pickJob === 'function') { pickJob(job); closeModals(); }
    tab = 'act'; render();
  }, [len, age, year, job]);
}
const YEARS = [1980, 1990, 2000, 2010, 2020, 2026];

module.exports = [
  { name: 'the contract: yearNow and eraHas, 2026 with no game and in Quick play', fn: async ctx => {
    const { page, errors } = await open(ctx);
    const r = await page.evaluate(() => ({ y: yearNow(), link: eraHas('link'), x: eraHas('no-such-thing'), keys: Object.keys(ERA_FEATURES) }));
    assert.strictEqual(r.y, 2026); assert.ok(r.link && r.x);
    for (const k of ['cell', 'pager', 'text', 'camera', 'apps', 'maps', 'transitLive', 'orca', 'weather', 'phoneBank', 'onlineBank', 'rideshare', 'gig', 'nextdoor', 'grocery', 'telehealth', 'streaming', 'datingApp', 'link', 'tline', 'dome', 'uwt', 'museumGlass'])
      assert.ok(r.keys.includes(k), 'ERA_FEATURES.' + k);
    // Quick play is 2026, whatever year was picked
    await start(page, 'quick', 18, 1980);
    const q = await page.evaluate(() => ({ y: yearNow(), sy: S.startYear, sd: S.startDate, rent: S.rent.amt, pay: JOBS.cafe.pay, f: eraPriceF() }));
    assert.deepStrictEqual(q, { y: 2026, sy: 2026, sd: '2026-08-03', rent: 1150, pay: 104, f: 1 });
    noErrors(errors);
  } },
  { name: 'the New life sheet: start-year chips with the birth year, and Quick play stays 2026', fn: async ctx => {
    const { page, errors } = await open(ctx);
    const r = await page.evaluate(() => {
      lifeStartModal(); lifePick('length', '1y'); lifePick('startAge', '12'); LP.birthday = { m: 3, d: 14, label: 'March 14' }; lifePick('startYear', '1980');
      const m = document.getElementById('mbg').innerText;
      lifePick('length', 'quick'); const q = document.getElementById('mbg').innerText, dis = [...document.querySelectorAll('#mbg .lchip')].filter(b => b.disabled).length;
      return { m, q, dis };
    });
    for (const y of YEARS) assert.ok(r.m.includes(String(y)), 'chip ' + y);
    assert.ok(r.m.includes('Born in 1968'), r.m);
    assert.ok(r.m.includes('1980'), 'starts in 1980');
    assert.ok(/Mon Aug 25, 1980/.test(r.m), 'the start day in 1980: ' + r.m);
    assert.ok(r.q.includes('Quick play is always 2026') && r.dis === 5, 'Quick play: 2026 only');
    noErrors(errors);
  } },
  { name: 'each start year starts on a Monday and plays a week, at 18 and at 12', fn: async ctx => {
    const { page, errors } = await open(ctx);
    for (const y of YEARS) for (const age of [18, 12]) {
      await start(page, '6m', age, y);
      const r = await page.evaluate(() => { const o = dateOf(0), a = { y: o.y, dow: o.dow, m: o.m, sy: S.startYear, now: yearNow() };
        lifeFF(1); closeModals(); render(); a.kwi = S.kwi; a.over = S.over; a.txt = document.getElementById('app').innerText.length; return a; });
      assert.strictEqual(r.y, y, `${y}/${age}`); assert.strictEqual(r.dow, 0, 'a Monday'); assert.strictEqual(r.sy, y); assert.strictEqual(r.now, y);
      assert.strictEqual(r.m, age >= 18 ? 8 : 8, 'August');
      assert.ok(r.kwi >= 1 && !r.over, `${y}/${age}: into the second key week`); assert.ok(r.txt > 100);
    }
    noErrors(errors);
  } },
  { name: 'money by era: prices, rent and pay at the start year’s level, 2026 unchanged', fn: async ctx => {
    const { page, errors } = await open(ctx);
    const out = {};
    for (const y of YEARS) {
      await start(page, '1y', 18, y);
      out[y] = await page.evaluate(() => ({ rent: S.rent.amt, pay: JOBS.hospital.pay, p: rp(100), mw: eraMinWage(yearNow()), f: eraPriceF(), car: null }));
    }
    assert.deepStrictEqual([out[2026].rent, out[2026].pay, out[2026].p], [1150, 172, 100]);
    assert.ok(Math.abs(out[1980].p - 25) <= 1, '1980 prices about a quarter: ' + out[1980].p);
    assert.ok(Math.abs(out[1990].p - 40) <= 1 && Math.abs(out[2000].p - 52) <= 1 && Math.abs(out[2010].p - 66) <= 1 && Math.abs(out[2020].p - 78) <= 1, JSON.stringify(out));
    assert.deepStrictEqual(YEARS.map(y => out[y].mw), [3.10, 4.25, 6.50, 8.55, 13.50, 17.13]);
    for (let i = 1; i < YEARS.length; i++) {
      assert.ok(out[YEARS[i]].rent > out[YEARS[i - 1]].rent, 'rent climbs by era');
      assert.ok(out[YEARS[i]].pay > out[YEARS[i - 1]].pay, 'pay climbs by era');
    }
    assert.ok(out[1980].rent >= 200 && out[1980].rent <= 300, '1980 rent ' + out[1980].rent);
    noErrors(errors);
  } },
  { name: 'nothing from a later year appears early: a 1980 Hilltop', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page, 'life', 18, 1980);
    const r = await page.evaluate(async () => {
      const later = Object.keys(ERA_FEATURES).filter(k => ERA_FEATURES[k] > 1980 && eraHas(k));
      S.loc = 'home'; render(); const det = document.querySelector('details.go'); if (det) det.open = true; render();
      await new Promise(r => setTimeout(r, 0));
      const t = document.getElementById('app').innerText;
      return { later, dome: L.dt_dome.hidden, glass: L.dt_glass.hidden, via: HOODS.downtown.ride.via, link: L.link.name, t,
        car: [CAR_TIERS.civic.n, CAR_TIERS.rav4.n], intro: S.log.map(x => x.t || x).join(' ') };
    });
    assert.deepStrictEqual(r.later, []);
    assert.ok(r.dome && r.glass, 'no Dome or Museum of Glass yet');
    assert.strictEqual(r.via, '🚌 Bus');
    assert.ok(/K Street/.test(r.link), r.link);
    assert.doesNotMatch(r.t, /T Line|\bLink\b|\bMLK\b|ORCA|Tacoma Dome|Museum of Glass/, 'on screen: ' + r.t.slice(0, 400));
    assert.ok(/K Street/.test(r.t), 'K Street on screen');
    assert.deepStrictEqual(r.car, ['a 1963 Honda Civic', 'a 1971 Chevy Blazer']);
    noErrors(errors);
  } },
  { name: 'unlocks come in the right year in a long life, with a news line', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page, 'life', 18, 1980);
    const r = await page.evaluate(() => {
      const seen = {}, out = [];
      for (let y = 1981; y <= 2030; y++) {
        const d = dayIndexOf(y, 12, 31), lines = []; cityCatchUp(d, lines);
        for (const l of lines) for (const e of ERA_NEWS) if (l === e.t) seen[e.id] = y;
        S.cur = d; S.t = d * 1440 + 600; out.push({ y, dome: !L.dt_dome.hidden, tline: eraHas('tline'), via: HOODS.downtown.ride.via });
      }
      return { seen, out };
    });
    assert.strictEqual(r.seen.era_dome, 1983); assert.strictEqual(r.seen.era_link, 2003); assert.strictEqual(r.seen.era_tline, 2023);
    assert.strictEqual(r.seen.era_orca, 2009); assert.strictEqual(r.seen.era_glass, 2002); assert.strictEqual(r.seen.era_mlk, 1993);
    for (const o of r.out) { assert.strictEqual(o.dome, o.y >= 1983, 'Dome ' + o.y); assert.strictEqual(o.via, o.y >= 2023 ? '🚈 Link' : '🚌 Bus', 'ride ' + o.y) }
    // and in real play: a 1982 start reaches April 1983 with the Dome opening in the summary
    await start(page, '1y', 18, 1982);
    const p = await page.evaluate(() => {
      const before = !L.dt_dome.hidden; let notes = [], g = 0;
      while (!S.over && yearNow() < 1983 || (yearNow() === 1983 && dateOf(day()).m < 5)) { if (g++ > 20) break; lifeFF(1); closeModals(); }
      notes = S.log.map(x => typeof x === 'string' ? x : x.t || '').join('\n') + document.body.innerText;
      return { before, after: !L.dt_dome.hidden, y: yearNow(), lifeY: S.startYear, m: dateOf(day()).m };
    });
    assert.strictEqual(p.before, false); assert.strictEqual(p.after, true, JSON.stringify(p));
    noErrors(errors);
  } },
  { name: 'saves record the start year, and old saves load as 2026', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page, '1y', 18, 1990);
    await page.evaluate(() => saveGame());
    await reload(page);
    const a = await page.evaluate(() => { resumeGame(); closeModals(); return { y: S.startYear, now: yearNow(), rent: S.rent.amt }; });
    assert.strictEqual(a.y, 1990); assert.strictEqual(a.now, 1990); assert.ok(a.rent < 600);
    // an older save: no start year
    await start(page, '1y', 18, 2026);
    await page.evaluate(() => { delete S.startYear; delete S.eraY; saveGame(); });
    await reload(page);
    const b = await page.evaluate(() => { resumeGame(); closeModals(); return { y: eraStartYear(), now: yearNow(), f: eraPriceF(), p: eraPayF(), pay: JOBS.cafe.pay, sd: S.startDate }; });
    assert.deepStrictEqual(b, { y: 2026, now: 2026, f: 1, p: 1, pay: 104, sd: '2026-08-03' });
    noErrors(errors);
  } },
  { name: 'the guide: a Start year section in Game lengths and ages, from ERA_FEATURES', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await page.click('#helpBtn'); await page.waitForSelector('#tut');
    const t = await page.evaluate(() => document.getElementById('tut-lengths').innerText);
    for (const s of ['Start year', '1980', 'Tacoma Dome', '1983', 'UW Tacoma', '1990', 'ORCA', '2009', 'T Line', '2023', 'Minimum wage', '$3.10', '$17.13']) assert.ok(t.includes(s), 'mentions ' + s);
    assert.doesNotMatch(t, /\b(romance|romantic|dat(e|es|ing)|couples?)\b/i);
    noErrors(errors);
  } },
];
