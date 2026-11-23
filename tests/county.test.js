const { open, noErrors, assert } = require('./helpers');

// Pierce County (src/js/72-county.js): the contract, travel across the county, starting elsewhere, county jobs and the guide.
// Uses the real packs (Puyallup, Lakewood, …) plus a small test pack across the Narrows (no Peninsula pack yet).
async function packs(page) {
  await page.evaluate(() => {
    if (HOODS.tgig) return;
    const art = () => '<rect width="480" height="150" fill="#6f9a54"/>';
    defHood({ key: 'tgig', county: true, name: 'Gig Harbor', ic: '⛵', blurb: 'Across the Narrows.', hub: 'tg_main',
      ride: { via: 'bus', mins: 45, fare: 2, drive: 25 }, places: { tg_main: { name: 'Harborview Drive', ic: '⚓', desc: 'The waterfront street', art } },
      travel: {}, neighbors: [], actions: () => [] });
    COUNTY.prep();
  });
}
async function start(page, { length = '1y', age = 18, year = 2026, place } = {}) {
  await page.evaluate(([length, age, year, place]) => {
    closeModals(); setMode(age < 18 ? 'grow' : 'adult');
    LIFE_PICK = length === 'quick' ? null : { length, startAge: age, startYear: year, startPlace: place, birthday: { m: 3, d: 14, label: 'March 14' } };
    newGame('normal'); closeModals(); if (!isGrow() && !S.jobPicked) { pickJob('cafe'); closeModals(); } tab = 'act'; render();
  }, [length, age, year, place]);
}
// a weekday (Tuesday) at a given time
const at = (page, mins) => page.evaluate(m => { let d = 1; while (dateOf(d).dow !== 1) d++; S.cur = d; S.t = d * 1440 + m; }, mins);

module.exports = [
  { name: 'county: the contract (countyOn, COUNTY_KEYS, START_PLACES, lifeStartPlace) and Quick play stays in Tacoma', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await packs(page);
    await start(page, { length: 'quick' });
    let r = await page.evaluate(() => ({ on: countyOn(), keys: COUNTY_KEYS, places: START_PLACES.map(p => p.key), sp: lifeStartPlace(), hidden: L.pu_pioneer.hidden,
      go: (actView().match(/Pierce County/g) || []).length, jobs: Object.keys(JOBS) }));
    assert.strictEqual(r.on, false, 'Quick play: no county');
    for (const k of ['fife', 'lakewood', 'parkland', 'puyallup', 'univplace', 'tgig']) assert.ok(r.keys.includes(k), 'county key ' + k);
    assert.strictEqual(r.places[0], 'hilltop'); assert.ok(r.places.includes('puyallup') && r.places.includes('lakewood') && !r.places.includes('tgig'), 'only startable packs, Hilltop first');
    assert.strictEqual(r.sp, 'hilltop'); assert.strictEqual(r.hidden, true, 'county places hidden in Quick play');
    assert.strictEqual(r.go, 0, 'no Pierce County heading in Quick play');
    assert.deepStrictEqual(r.jobs, ['hospital', 'cafe', 'kitchen'], 'the three day-one jobs are unchanged');
    await start(page, { length: '1y' });
    await at(page, 720);
    r = await page.evaluate(() => ({ on: countyOn(), hidden: L.pu_pioneer.hidden, go: actView(), via: HOODS.puyallup.ride.via }));
    assert.strictEqual(r.on, true); assert.strictEqual(r.hidden, false);
    assert.ok(/🏙️ Tacoma/.test(r.go) && /🌲 Pierce County/.test(r.go), 'Go somewhere groups Tacoma and Pierce County');
    assert.ok(r.go.indexOf('🌲 Pierce County') > r.go.indexOf('Stadium District'), 'the county comes after Tacoma');
    assert.ok(/Bus/.test(r.via), 'the ride label: ' + r.via);
    // reachable: Go somewhere lists Lakewood and Puyallup, and the trip gets you there
    assert.ok(/Lakewood Towne Center/.test(r.go) && /aria-label="Go to [^"]*·/.test(r.go), 'a county place to go to');
    r = await page.evaluate(() => { S.money = 500; go('lw_towne'); document.querySelectorAll('.cross').forEach(e => e.click()); closeModals(); return { loc: S.loc, seen: !!(S.county && S.county.seen && S.county.seen.lakewood), m: S.life.moments.some(x => /Pierce County/.test(x.t)) }; });
    assert.deepStrictEqual(r, { loc: 'lw_towne', seen: true, m: true });
    // Growing Up: closed at 12, open at 16
    await start(page, { length: '2y', age: 12 });
    r = await page.evaluate(() => { const a = countyOn(), h = L.pu_pioneer && L.pu_pioneer.hidden; S.age = 16; return { a, h, b: countyOn(), h2: L.pu_pioneer.hidden }; });
    assert.deepStrictEqual(r, { a: false, h: true, b: true, h2: false });
    noErrors(errors);
  } },
  { name: 'county: buses by distance, express and Sounder at rush hour in their years, driving and the Narrows toll from 2007', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await packs(page);
    await start(page, { length: '1y', year: 2010 });
    await at(page, 600);
    let r = await page.evaluate(() => ({ midday: countyRide('puyallup'), gig: countyRide('tgig'), t: travelMins('home', 'pu_pioneer'), across: travelMins('pu_pioneer', 'tg_main'), stadium: travelMins('pu_pioneer', 'st_park') }));
    assert.strictEqual(r.midday.via, 'bus'); assert.strictEqual(r.midday.mins, 50);
    assert.ok(r.t >= 50, 'home to Puyallup by bus: ' + r.t);
    assert.ok(r.across > r.midday.mins + 20, 'Puyallup to Gig Harbor goes through town: ' + r.across);
    assert.ok(r.stadium > 50 && r.stadium < r.across, 'Puyallup to the Stadium District: ' + r.stadium);
    await at(page, 420);
    r = await page.evaluate(() => ({ puy: countyRide('puyallup'), gig: countyRide('tgig'), lw: countyRide('lakewood') }));
    assert.strictEqual(r.puy.via, 'sounder', 'Sounder at rush hour from 2000'); assert.ok(r.puy.mins < 50);
    assert.strictEqual(r.lw.via, 'express', 'Lakewood: no Sounder before 2012, the express bus');
    assert.strictEqual(r.gig.via, 'express', 'the express bus to Gig Harbor');
    await start(page, { length: '1y', year: 2014 });
    await at(page, 420);
    assert.strictEqual(await page.evaluate(() => countyRide('lakewood').via), 'sounder', 'Lakewood Sounder from 2012');
    // 1990: no Sounder yet, one Narrows bridge (slower)
    await start(page, { length: '1y', year: 1990 });
    await at(page, 420);
    r = await page.evaluate(() => ({ puy: countyRide('puyallup'), gig: countyRide('tgig'), toll: COUNTY_API.toll(true) }));
    assert.strictEqual(r.puy.via, 'bus'); assert.ok(r.gig.mins > 45, 'one bridge before 2007: ' + r.gig.mins); assert.strictEqual(r.toll, 0, 'no toll before 2007');
    // driving home from Gig Harbor in 2010: the toll at the booth, then with a Good To Go! pass
    await start(page, { length: '1y', year: 2010 });
    await at(page, 600);
    r = await page.evaluate(() => {
      const skip = () => document.querySelectorAll('.cross').forEach(e => e.click());
      S.money = 9000; CAR.S().lic = true; CAR.buy('civic'); closeModals(); S.loc = 'tg_main';
      const dm = (() => { let m; const d0 = CAR.driving; CAR.driving = () => true; try { m = travelMins('tg_main', 'home'); } finally { CAR.driving = d0; } return m; })();
      const m0 = S.money; driveGo('home'); skip(); closeModals(); const paid = Math.round((m0 - S.money) * 100) / 100, tolls = S.county.tolls;
      const pass = actionsHere().find(a => /Good To Go/.test(a.l)); pass.fn(); closeModals();
      S.loc = 'tg_main'; const m1 = S.money; driveGo('home'); skip(); closeModals();
      return { dm, paid, tolls, gtg: S.county.gtg, tolls2: S.county.tolls, paid2: Math.round((m1 - S.money) * 100) / 100, out: (() => { S.loc = 'home'; const t = S.county.tolls; driveGo('tg_main'); skip(); closeModals(); return S.county.tolls - t; })() };
    });
    assert.ok(r.dm <= 35, 'driving from Gig Harbor: ' + r.dm);
    assert.strictEqual(r.tolls, 1, 'one toll into Tacoma'); assert.ok(r.paid >= 4, 'toll and gas: ' + r.paid);
    assert.strictEqual(r.gtg, true); assert.strictEqual(r.tolls2, 2); assert.ok(r.paid2 < r.paid, 'cheaper with the pass');
    assert.strictEqual(r.out, 0, 'free on the way out');
    // the phone: Maps groups Tacoma and Pierce County, with the toll note
    const maps = await page.evaluate(() => { S.loc = 'home'; return phoneApp('maps').view(); });
    assert.ok(/🏙️ Tacoma/.test(maps) && /🌲 Pierce County/.test(maps) && /Narrows Bridge/.test(maps), 'Maps groups and the toll note');
    assert.ok(maps.indexOf('🌲 Pierce County') < maps.indexOf('Puyallup'));
    noErrors(errors);
  } },
  { name: 'county: starting in a county town (the New game row, home and rent there, the school names in Growing Up)', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await packs(page);
    // the New game sheet: a Where you start row with Hilltop on by default
    let r = await page.evaluate(() => { closeModals(); lifeStartModal(); const t = document.querySelector('#mbg').innerHTML; lifePick('startPlace', 'puyallup'); const t2 = document.querySelector('#mbg').innerHTML; closeModals(); return { t, t2, lp: LP.startPlace }; });
    assert.ok(/Where you start/.test(r.t) && /aria-pressed="true"[^>]*>🏘️ Hilltop/.test(r.t), 'Hilltop is the default');
    assert.ok(/aria-pressed="true"[^>]*>🎡 Puyallup/.test(r.t2) && /rent there/.test(r.t2), 'picking Puyallup');
    await page.evaluate(() => { LP.startPlace = 'hilltop'; });
    // Hilltop start (the default) has the old rent and home
    await start(page, { length: '1y' });
    const base = await page.evaluate(() => ({ rent: S.rent.amt, hood: L.home.hood, sp: S.startPlace, t: travelMins('home', 'mlk') }));
    assert.strictEqual(base.hood, undefined); assert.strictEqual(base.sp, undefined); assert.ok(base.t < 15);
    await start(page, { length: '1y', place: 'puyallup' });
    r = await page.evaluate(() => ({ rent: S.rent.amt, hood: L.home.hood, sp: lifeStartPlace(), t: travelMins('home', 'mlk'), local: travelMins('home', 'pu_pioneer'), desc: L.home.desc, m: S.life.moments.map(x => x.t).join('|'),
      go: actView(), opt: (gameOptionsModal(), document.querySelector('#mbg').textContent) }));
    await page.evaluate(() => closeModals());
    assert.strictEqual(r.hood, 'puyallup'); assert.strictEqual(r.sp, 'puyallup');
    assert.ok(r.rent > base.rent, `rent in Puyallup ${r.rent} vs ${base.rent}`);
    assert.ok(r.t > 25, 'MLK is a bus or train ride away: ' + r.t); assert.ok(r.local <= 12, 'the town is next door: ' + r.local);
    assert.ok(/Puyallup/.test(r.desc) && /in Puyallup/.test(r.m), 'home and the life story');
    assert.ok(/Started in Puyallup/.test(r.opt), 'Game options say where');
    // Growing Up at 12 in Puyallup: the home and the school are there, the town is open, the school has the town's name on screen
    await start(page, { length: '2y', age: 12, place: 'puyallup' });
    r = await page.evaluate(() => ({ on: countyOn(), hidden: L.pu_pioneer.hidden, gig: L.tg_main.hidden, home: L.home.hood, school: L.school.hood, t: travelMins('home', 'school'),
      txt: startText('Summit View is 10 minutes away. Then Hilltop High.'), acts: actionsHere().map(a => a.l).join('|') }));
    assert.strictEqual(r.on, false); assert.strictEqual(r.hidden, false, 'your own town is open'); assert.strictEqual(r.gig, true, 'the rest of the county is not');
    assert.strictEqual(r.home, 'puyallup'); assert.strictEqual(r.school, 'puyallup'); assert.ok(r.t <= 12);
    assert.strictEqual(r.txt, 'Puyallup Middle School is 10 minutes away. Then Puyallup High School.');
    assert.ok(!/Head home/.test(r.acts), 'no Head home at home');
    await page.evaluate(() => { render(); });
    assert.ok(!/Summit View/.test(await page.textContent('#app')), 'no Summit View on screen');
    noErrors(errors);
  } },
  { name: 'county: county jobs (listings, commutes, ladders) and the Pierce County guide chapter', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page, { length: '1y' });
    let r = await page.evaluate(() => {
      closeModals(); jobModal(); const t = document.querySelector('#mbg').textContent, n = document.querySelectorAll('#mbg .mbtns button, #mbg button').length; closeModals();
      pickJob('port'); closeModals();
      return { t, n, job: S.job, hood: L.work.hood, t1: travelMins('home', 'work'), title: careerTitle(), ladder: !!CAREER_LADDERS.port, pay: job().pay, keys: Object.keys(JOBS), pickers: Object.values(JOBS).length };
    });
    assert.ok(/Around Pierce County/.test(r.t) && /JBLM/.test(r.t) && /Port of Tacoma/.test(r.t) && /Good Samaritan/.test(r.t) && /Lakewood/.test(r.t) && /Puyallup valley/.test(r.t), 'the job sheet lists the county jobs');
    assert.strictEqual(r.job, 'port'); assert.strictEqual(r.hood, 'eastside', 'the Port is on the Eastside');
    assert.ok(r.t1 > 15, 'a commute: ' + r.t1); assert.ok(r.ladder); assert.ok(r.pay > 150);
    assert.deepStrictEqual(r.keys, ['hospital', 'cafe', 'kitchen']); assert.strictEqual(r.pickers, 3);
    // a promotion on the county ladder
    r = await page.evaluate(() => { const C = careerS(); C.since = day() - 800; C.hire = C.since; S.standing = 90; const out = []; careerPromote(C, day(), out); return { out: out.join(' '), t: careerTitle(), n: JOBS.port.n }; });
    assert.ok(/Marine clerk/.test(r.out) && /Marine clerk at the Port of Tacoma/.test(r.t), 'promoted: ' + r.t);
    // JBLM with no Lakewood pack: a commute; the name follows the year
    r = await page.evaluate(() => { S.job = 'jblm'; S.career = null; return { hood: L.work.hood, t: travelMins('home', 'work'), place: job().place }; });
    assert.strictEqual(r.hood, 'lakewood', 'the base is out past Lakewood'); assert.ok(r.t >= 25, 'commute to the base: ' + r.t); assert.strictEqual(r.place, 'Joint Base Lewis-McChord');
    // a county job with no pack for its town (none yet): a commute from Hilltop
    r = await page.evaluate(() => { const a = COUNTY_JOBS.para.area; COUNTY_JOBS.para.area = [/Nowhere/]; S.job = 'para'; S.career = null; const o = { hood: L.work.hood, t: travelMins('home', 'work') }; COUNTY_JOBS.para.area = a; return o; });
    assert.strictEqual(r.hood, undefined); assert.ok(r.t >= 35, 'the fallback commute: ' + r.t);
    // the Jobs app: county listings, and Hilltop ones while you hold a county job
    r = await page.evaluate(() => { S.ph = S.ph || {}; const h = phoneApp('jobs').view(); return h; });
    assert.ok(/Around Pierce County/.test(r) && /Port of Tacoma/.test(r) && /Apply to Tacoma General/.test(r), 'the Jobs app');
    // the guide chapter
    await page.evaluate(() => { closeModals(); });
    const g = await page.evaluate(() => { const c = helpChapters().find(x => x[0] === 'county'); return c ? c[2] : null; });
    assert.ok(g, 'the chapter is there');
    for (const s of ['Pierce Transit', 'Sounder', '2000', '2012', 'Narrows', 'Good To Go', '2007', 'Where you start', 'JBLM', 'Port of Tacoma']) assert.ok(g.includes(s), 'mentions ' + s);
    assert.doesNotMatch(g.replace(/<[^>]+>/g, ' '), /\b(romance|romantic|crush\w*|dat(e|es|ing)|boyfriends?|girlfriends?|kiss\w*|flirt\w*|sexy?|sexual|couples?|fish\w*|salmon|marina|charters?)\b/i);
    noErrors(errors);
  } },
];
