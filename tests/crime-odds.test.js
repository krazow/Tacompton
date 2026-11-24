const { open, noErrors, assert } = require('./helpers');

// Crime event odds by neighborhood and year (src/js/74-crime-odds.js), from public crime data.
async function start(page, { grow = false, length = '1y', place = null, year = 2026 } = {}) {
  await page.evaluate(([grow, length, place, year]) => {
    closeModals(); setMode(grow ? 'grow' : 'adult');
    LIFE_PICK = { length, startAge: grow ? 12 : 18, startYear: year, birthday: { m: 3, d: 14, label: 'March 14' } };
    if (place) LIFE_PICK.startPlace = place;
    newGame('normal'); closeModals(); if (!isGrow() && typeof pickJob === 'function') { pickJob('cafe'); closeModals(); } tab = 'act'; render();
  }, [grow, length, place, year]);
}

module.exports = [
  { name: 'crime odds: area and year multipliers, clamped; the Tacoma districts average 1.0', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page);
    const r = await page.evaluate(() => {
      const o = {}, D = CRIME_ODDS.district;
      o.avg = {}; for (const k of ['prowl', 'mvt', 'burg', 'rob', 'agg', 'vand', 'theft']) o.avg[k] = Object.values(D).reduce((t, x) => t + x[k], 0) / 8;
      o.hill = crimeOdds('prowl', 'hilltop', 2026); o.mlk = crimeOdds('prowl', 'mlk', 2026); o.cen = crimeOdds('prowl', 'Central', 2026);
      o.dt = crimeOdds('prowl', 'downtown', 2026); o.st = crimeOdds('prowl', 'stadium', 2026); o.ne = crimeOdds('prowl', 'netacoma', 2026);
      o.so = crimeOdds('rob', 'southend', 2026); o.fh = crimeOdds('rob', 'fernhill', 2026); o.stw = crimeOdds('theft', 'South Tacoma', 2026);
      o.up = crimeOdds('prowl', 'univplace', 2026); o.pu = crimeOdds('burg', 'puyallup', 2026); o.sum = crimeOdds('prowl', 'sumner', 2026);
      o.ort = crimeOdds('theft', 'orting', 2026); o.mtn = crimeOdds('agg', 'mountain', 2026); o.pk = crimeOdds('burg', 'parkland', 2026); o.jb = crimeOdds('burg', 'jblm', 2026);
      o.lw = crimeOdds('prowl', 'lakewood', 2026); o.fife = crimeOdds('rob', 'fife', 2026);
      o.gh = crimeOdds('rob', 'gigharbor', 2026);            // 0 in the data: clamped up
      o.dtagg22 = crimeOdds('mvt', 'downtown', 2022);        // 1.43 × 4.04: clamped down
      o.y2022 = crimeOdds('rob', 'hilltop', 2022); o.y2018 = crimeOdds('rob', 'hilltop', 2018); o.y1990 = crimeOdds('rob', 'hilltop', 1990);
      o.y2030 = crimeOdds('rob', 'hilltop', 2030); o.noYear = crimeOdds('rob', 'hilltop');
      o.shop = crimeOdds('shop', 'hilltop', 2022); o.unknown = crimeOdds('nope', 'hilltop', 2026);
      return o;
    });
    for (const [k, v] of Object.entries(r.avg)) assert.ok(Math.abs(v - 1) <= 0.03, `the citywide average for ${k} is 1.0 (${v})`);
    assert.strictEqual(r.hill, 0.7); assert.strictEqual(r.mlk, 0.7); assert.strictEqual(r.cen, 0.7);
    assert.strictEqual(r.dt, 1.99); assert.strictEqual(r.st, 1.99); assert.strictEqual(r.ne, 0.25);
    assert.strictEqual(r.so, 1.97); assert.strictEqual(r.fh, 1.97); assert.strictEqual(r.stw, 1.92);
    assert.strictEqual(r.up, 0.32); assert.strictEqual(r.pu, 0.58); assert.strictEqual(r.sum, 0.25);
    assert.strictEqual(r.ort, 0.38); assert.strictEqual(r.mtn, 0.25); assert.strictEqual(r.pk, 0.3); assert.strictEqual(r.jb, 0.3);
    assert.strictEqual(r.lw, 1); assert.strictEqual(r.fife, 1);
    assert.strictEqual(r.gh, 0.25, 'nowhere is crime-free'); assert.strictEqual(r.dtagg22, 2.5, 'nowhere is overwhelming');
    assert.ok(Math.abs(r.y2022 - 0.89 * 1.56 / 0.64) < 0.01, 'the 2022 trend: ' + r.y2022);
    assert.strictEqual(r.y1990, r.y2018, 'before 2018 uses 2018'); assert.strictEqual(r.y2030, 0.89, 'after 2026 uses 2026');
    assert.strictEqual(r.noYear, 0.89, 'no year given: yearNow() (2026 here)');
    assert.strictEqual(r.shop, 1.6, 'shoplifting has no year trend'); assert.strictEqual(r.unknown, 1);
    noErrors(errors);
  } },
  { name: 'crime odds: the start year sets the trend; Gig Harbor < the Tacoma average < the South End for car prowls', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page, { year: 2022 });
    const y = await page.evaluate(() => ({ y: yearNow(), m: crimeOdds('rob', 'hilltop'), e: crimeOdds('rob', 'hilltop', 2026) }));
    assert.strictEqual(y.y, 2022); assert.ok(y.m > y.e * 2, 'a 2022 life sees more robberies than 2026: ' + JSON.stringify(y));
    await start(page);
    const p = await page.evaluate(() => ({ gh: crimeOdds('prowl', 'gigharbor'), avg: crimeOdds('prowl', 'lakewood'), so: crimeOdds('prowl', 'southend'), dt: crimeOdds('prowl', 'downtown') }));
    assert.ok(p.gh < p.avg && p.avg < p.so && p.so < p.dt, JSON.stringify(p));
    noErrors(errors);
  } },
  { name: 'crime odds: street events use where you are, home events where you live; the safety habits still work', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page);
    let r = await page.evaluate(() => {
      const e = id => EV.find(x => x.id === id), o = {};
      o.phoneDt = crimeEvMul('lev_phone', { hook: 'arrive', at: 'dt_dome', from: 'link' });
      o.walletRide = crimeEvMul('lev_wallet', { hook: 'travel', from: 'home', to: 'dt_dome' });
      o.walletNone = crimeEvMul('lev_wallet', {});
      o.bikeSo = crimeEvMul('cb_bike_borrowed', { hook: 'arrive', at: 'so_a' }); o.bikeHill = crimeEvMul('cb_bike_borrowed', { hook: 'arrive', at: 'mlk' });
      S.loc = 'dt_dome';
      o.prowlHome = crimeEvMul('lev_prowl'); o.pkgHome = crimeEvMul('lev_package', { hook: 'wake' }); o.hood = crimeEvMul('hood_carstolen');
      o.other = crimeEvMul('lev_bus', { at: 'dt_dome' });
      // lev_prowl: the streetlight habit halves it, and the Hilltop multiplier comes on top
      window.LEV.S().light = false; o.dark = e('lev_prowl').chance({ hook: 'wake' });
      window.LEV.S().light = true; o.lit = e('lev_prowl').chance({ hook: 'wake' });
      window.CRIME_ODDS_OFF = true; o.litOff = e('lev_prowl').chance({ hook: 'wake' }); o.walletOff = e('lev_wallet').chance({ from: 'link', to: 'dt_dome' }); window.CRIME_ODDS_OFF = false;
      o.walletOn = e('lev_wallet').chance({ from: 'link', to: 'dt_dome' });
      return o;
    });
    assert.strictEqual(r.phoneDt, 1.32); assert.strictEqual(r.walletRide, 1.32, 'a ride: the busier end'); assert.strictEqual(r.walletNone, 1, 'no place: unchanged');
    assert.strictEqual(r.bikeSo, 1.5); assert.strictEqual(r.bikeHill, 0.86);
    assert.strictEqual(r.prowlHome, 0.7, 'at home: where home is, not where you are'); assert.strictEqual(r.pkgHome, 0.86); assert.strictEqual(r.hood, 0.79);
    assert.strictEqual(r.other, 1, 'other events are left alone');
    assert.ok(Math.abs(r.lit * 2 - r.dark) < 1e-9 && Math.abs(r.lit - r.litOff * 0.7) < 1e-9, JSON.stringify(r));
    assert.ok(Math.abs(r.walletOn - r.walletOff * 1.32) < 1e-9);
    // a home in a county town: the home events follow it
    await start(page, { place: 'gigharbor' });
    r = await page.evaluate(() => { S.loc = 'mlk'; return { home: hoodOf('home'), prowl: crimeEvMul('lev_prowl'), pkg: crimeEvMul('lev_package'), street: crimeEvMul('lev_phone', { at: 'dt_dome' }) }; });
    assert.strictEqual(r.home, 'gigharbor'); assert.strictEqual(r.prowl, 0.25); assert.strictEqual(r.pkg, 0.25); assert.strictEqual(r.street, 1.32);
    noErrors(errors);
  } },
  { name: 'crime odds: a Hilltop life changes by under 25%; Gig Harbor and Northeast see clearly fewer, downtown and the South End more', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page);
    // expected crime events a year: each event's own chance × the multiplier where it happens in that life
    // (street events in a Hilltop life: the wallet and phone grabs are downtown only, the bikes on the hill)
    const r = await page.evaluate(() => {
      const base = { lev_prowl: 0.05, lev_package: 0.05, lev_wallet: 0.035, lev_phone: 0.04, lev_g_bike: 0.07, cb_bike_borrowed: 0.08 };
      for (const id of HOOD.ids) if (CRIME_EV[id]) base[id] = 0.06 / 10;
      const street = { lev_wallet: 'dt_dome', lev_phone: 'dt_dome' };
      const life = home => { let on = 0, off = 0;
        for (const [id, p] of Object.entries(base)) { const sp = CRIME_EV[id];
          const at = sp.at === 'home' ? home : (street[id] || home);
          const m = crimeOdds(sp.k, at); on += p * m; off += p; }
        return on / off; };
      return { hill: life('hilltop'), gh: life('gigharbor'), ne: life('netacoma'), dt: life('downtown'), so: life('southend') };
    });
    assert.ok(Math.abs(r.hill - 1) <= 0.25, 'Hilltop about as before: ' + r.hill);
    assert.ok(r.gh < 0.6 && r.ne < 0.6, 'Gig Harbor and Northeast clearly fewer: ' + JSON.stringify(r));
    assert.ok(r.dt > 1.2 && r.so > 1.2, 'downtown and the South End more: ' + JSON.stringify(r));
    noErrors(errors);
  } },
  { name: 'crime odds: a calmer place also cuts the per-life limit; Hilltop and busier places keep theirs', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page, { place: 'gigharbor' });
    const r = await page.evaluate(() => { const o = {}, caps = [];
      for (let s = 0; s < 400; s++) { S.crOdds = { salt: s * 7 + 1 }; caps.push(crimeCap('lev_package', { hook: 'wake' })); }
      o.avg = caps.reduce((a, b) => a + b, 0) / caps.length; o.max = EV.find(x => x.id === 'lev_package').max;
      S.ev.count.lev_package = 0; S.ev.last = {}; S.crOdds = { salt: 1 }; o.cap = crimeCap('lev_package');
      o.street = crimeCap('lev_phone', { at: 'dt_dome' }); o.phoneMax = EV.find(x => x.id === 'lev_phone').max;
      window.CRIME_ODDS_OFF = true; o.off = crimeCap('lev_package'); window.CRIME_ODDS_OFF = false;
      return o; });
    assert.ok(Math.abs(r.avg - r.max * 0.25) < 0.15, 'Gig Harbor porch thefts: about a quarter of the limit on average ' + JSON.stringify(r));
    assert.strictEqual(r.street, r.phoneMax, 'downtown keeps its limit'); assert.strictEqual(r.off, r.max);
    await start(page);
    const h = await page.evaluate(() => { const caps = [];
      for (let s = 0; s < 400; s++) { S.crOdds = { salt: s * 7 + 1 }; caps.push(crimeCap('lev_package')); }
      return { avg: caps.reduce((a, b) => a + b, 0) / caps.length, max: EV.find(x => x.id === 'lev_package').max }; });
    assert.ok(h.avg / h.max >= 0.75, 'Hilltop: within 25% of the old limit ' + JSON.stringify(h));
    noErrors(errors);
  } },
  { name: 'crime odds: the guide says it in one plain line, in the events, Growing Up and Pierce County chapters', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page);
    const r = await page.evaluate(() => { const ch = helpChapters(), g = k => (ch.find(c => c[0] === k) || [])[2] || '';
      return { ev: g('events').includes(CRIME_GUIDE), co: g('county').includes(CRIME_GUIDE), gr: helpGrowing().includes(CRIME_GUIDE), n: ch.filter(c => typeof c[2] === 'string' && c[2].split(CRIME_GUIDE).length > 2).length,
        wn: (CHANGELOG['0.4.3'] || []).some(b => /public crime data/.test(b)) }; });
    assert.ok(r.ev && r.co && r.gr && r.n === 0 && r.wn, JSON.stringify(r));
    noErrors(errors);
  } },
];
