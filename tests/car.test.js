const fs = require('fs'), path = require('path');
const { open, noErrors, assert } = require('./helpers');

// Driving (src/js/38-car.js, and the car prowl in 36-life-events.js): a license at 16, a used car, Drive, insurance, the prowl.
async function start(page, { grow = false, length = '1y', age } = {}) {
  await page.evaluate(([grow, length, age]) => {
    closeModals(); setMode(grow ? 'grow' : 'adult');
    LIFE_PICK = length === 'quick' ? null : { length, startAge: age || (grow ? 12 : 18), birthday: { m: 3, d: 14, label: 'March 14' } };
    newGame('normal'); closeModals(); if (!isGrow()) { pickJob('cafe'); closeModals(); } tab = 'act'; render();
  }, [grow, length, age]);
}
const find = (page, re) => page.evaluate(src => { const r = new RegExp(src); const a = actionsHere().filter(Boolean).find(x => r.test(x.l)); return a ? { l: a.l, s: a.s, dis: !!a.dis } : null; }, re);
const press = (page, re) => page.evaluate(src => { const r = new RegExp(src); const a = actionsHere().filter(Boolean).find(x => r.test(x.l)); a.fn(); closeModals(); }, re);

module.exports = [
  { name: 'Growing Up at 16: lessons with a parent, then the license test at the DOL office (odds grow with practice)', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page, { grow: true, length: '2y', age: 15 });
    // a Saturday morning at home, age 15: nothing yet
    await page.evaluate(() => { let d = 1; while (dateOf(d).dow !== 5) d++; S.cur = d; S.t = d * 1440 + 600; S.loc = 'home'; S.age = 15; });
    assert.strictEqual(await find(page, 'driving lesson'), null, 'no lessons at 15');
    await page.evaluate(() => { S.age = 16; });
    const les = await find(page, 'driving lesson');
    assert.ok(les && !les.dis, 'a lesson at 16 ' + JSON.stringify(les));
    const test = await find(page, 'license test');
    assert.ok(test && /DOL/.test(test.l) && /odds/.test(test.s), 'the license test ' + JSON.stringify(test));
    const o0 = await page.evaluate(() => CAR.odds());
    await press(page, 'driving lesson');
    const r = await page.evaluate(() => ({ p: S.car.practice, odds: CAR.odds() }));
    assert.strictEqual(r.p, 1); assert.ok(r.odds > o0, 'practice raises the odds');
    assert.strictEqual(await find(page, 'driving lesson'), null, 'once a day');
    // a fail, then (next day, more practice) a pass
    await page.evaluate(() => { const rnd = Math.random; Math.random = () => 0.999; try { actionsHere().find(x => /license test/.test(x.l)).fn(); } finally { Math.random = rnd; } closeModals(); });
    assert.strictEqual(await page.evaluate(() => S.car.lic), false, 'failed the test');
    assert.strictEqual(await find(page, 'license test'), null, 'one test a day');
    await page.evaluate(() => { S.cur += 1; S.t = S.cur * 1440 + 600; S.car.practice = 5; const rnd = Math.random; Math.random = () => 0.5; try { actionsHere().find(x => /license test/.test(x.l)).fn(); } finally { Math.random = rnd; } closeModals(); });
    const lic = await page.evaluate(() => ({ lic: S.car.lic, m: S.life.moments.some(m => /license/.test(m.t)), lesson: actionsHere().some(x => /driving lesson|license test/.test(x.l)) }));
    assert.ok(lic.lic && lic.m && !lic.lesson, 'licensed: ' + JSON.stringify(lic));
    // time skips add lessons for an unlicensed 16-year-old
    const sk = await page.evaluate(() => { S.car.lic = false; S.car.practice = 0; const n = []; lifeHook('skip', S.cur + 1, S.cur + 28, 'home', n); return { p: S.car.practice, n }; });
    assert.ok(sk.p >= 1 && sk.n.some(l => /Tacoma Dome/.test(l)), 'skip lessons ' + JSON.stringify(sk));
    noErrors(errors);
  } },
  { name: 'the adult game: buy a used car (tiers priced with rp), then Drive is faster than the bus, costs gas, no fare, parking downtown', fn: async ctx => {
    const { page, errors } = await open(ctx);
    // Quick play: no car
    await start(page, { length: 'quick' });
    assert.strictEqual(await find(page, 'used car'), null, 'no car in Quick play');
    await start(page, { length: '1y', age: 18 });
    await page.evaluate(() => { S.t = S.cur * 1440 + 700; S.loc = 'home'; S.money = 3000; });
    const shop = await find(page, 'used car');
    assert.ok(shop && /\$4,000/.test(shop.s), 'shop for a car ' + JSON.stringify(shop));
    // the sheet: three tiers, the Civic too dear at $3,000
    const sheet = await page.evaluate(() => { actionsHere().find(x => /used car/.test(x.l)).fn(); const b = MB.map(x => ({ l: x.l, dis: !!x.dis })); closeModals(); return b; });
    assert.strictEqual(sheet.length, 4, JSON.stringify(sheet));
    assert.ok(/Civic.*\$4,000/.test(sheet[0].l) && sheet[0].dis && /RAV4.*\$11,000/.test(sheet[2].l), JSON.stringify(sheet));
    const hard = await page.evaluate(() => { const k = S.diff; S.diff = 'hard'; const p = rp(CAR.tiers.civic.price); S.diff = k; return p; });
    assert.ok(hard > 4000, 'prices scale with rp()');
    const b = await page.evaluate(() => { S.money = 6000; CAR.buy('civic'); closeModals(); return { own: S.car.own, money: S.money, ins: S.car.ins }; });
    assert.strictEqual(b.own, 'civic'); assert.strictEqual(b.money, 6000 - 4000 - b.ins, 'price plus the first month of insurance');
    // the Drive chip shows next to Go for other neighborhoods, not for Hilltop places
    const html = await page.evaluate(() => { tab = 'act'; render(); return document.body.innerHTML; });
    assert.ok(/aria-label="Drive to [^"]*Proctor/.test(html) || /🚗 Drive · /.test(html), 'Drive chip shown');
    assert.ok(!/Drive to [^"]*Corner market/i.test(html), 'no Drive chip on Hilltop');
    const r = await page.evaluate(() => {
      const bus = travelMins('home', 'pr_main'), fare = hoodFare('home', 'pr_main'), m0 = S.money, t0 = S.t;
      driveGo('pr_main'); closeModals();
      return { bus, fare, loc: S.loc, mins: S.t - t0, spent: m0 - S.money, trips: S.car.trips, driving: CAR.driving(), after: travelMins('home', 'pr_main') };
    });
    assert.strictEqual(r.loc, 'pr_main');
    assert.ok(r.mins < r.bus, `driving (${r.mins}) is faster than the bus (${r.bus})`);
    assert.ok(r.fare > 0 && r.spent > 0 && r.spent < r.fare + 5, `gas instead of the fare: ${JSON.stringify(r)}`);
    assert.strictEqual(r.trips, 1); assert.strictEqual(r.driving, false); assert.strictEqual(r.after, r.bus, 'the bus time is back after the drive');
    const dt = await page.evaluate(() => { S.loc = 'home'; S.t = S.cur * 1440 + 700; const m0 = S.money; driveGo('dt_pacific'); closeModals(); return { loc: S.loc, spent: m0 - S.money, gas: S.car.gas }; });
    assert.strictEqual(dt.loc, 'dt_pacific');
    assert.ok(dt.spent >= dt.gas - 3 + 6, 'downtown parking on top of gas ' + JSON.stringify(dt));
    noErrors(errors);
  } },
  { name: 'insurance every month (played days and time skips), and a car in the shop can’t Drive', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page, { length: '1y', age: 18 });
    const r = await page.evaluate(() => {
      S.money = 20000; CAR.buy('rav4'); closeModals(); const ins = S.car.ins, o = dateOf(day());
      const m0 = S.money; CAR.bill(day()); const same = m0 - S.money;
      const d1 = dayIndexOf(o.m === 12 ? o.y + 1 : o.y, o.m === 12 ? 1 : o.m + 1, 1);
      const m1 = S.money; S.cur = d1; S.t = d1 * 1440 + 400; onMorning(d1); const next = m1 - S.money;
      const m2 = S.money; CAR.bill(d1); const again = m2 - S.money;
      const n = []; const m3 = S.money; lifeHook('skip', d1 + 1, d1 + 70, 'save', n); const sk = m3 - S.money;
      return { ins, same, next, again, sk, n };
    });
    assert.strictEqual(r.same, 0, 'nothing more the month you buy it');
    assert.ok(r.next >= r.ins, `the 1st of the next month: ${JSON.stringify(r)}`);
    assert.strictEqual(r.again, 0, 'once a month');
    assert.ok(r.n.some(l => /insurance: .*2 months/.test(l)) && r.n.some(l => /Gas/.test(l)) && r.sk >= 2 * r.ins, 'a time skip bills the months and gas ' + JSON.stringify(r.n));
    const down = await page.evaluate(() => { S.car.down = 300; S.loc = 'home'; S.t = S.cur * 1440 + 700; const can = CAR.canDrive(); driveGo('pr_main'); return { can, loc: S.loc, fix: actionsHere().some(x => /Get the car fixed/.test(x.l)) }; });
    assert.deepStrictEqual(down, { can: false, loc: 'home', fix: true });
    noErrors(errors);
  } },
  { name: 'the car prowl: only with a car; nothing on the seats and the streetlight keep the window whole; the three choices', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page, { length: '1y', age: 18 });
    const fire = setup => page.evaluate(setup => {
      closeModals(); uiNarr = []; new Function(setup)();
      S.cur = Math.max(S.cur, 2); S.t = S.cur * 1440 + 400; S.loc = 'home'; S.money = 1000;
      S.ev.last = {}; S.ev.count = {}; EV.forEach(x => { if (x.id !== 'lev_prowl') S.ev.count[x.id] = 9999; }); if (S.ev.pending) S.ev.pending = [];
      forceEvent('lev_prowl'); const ctx = { fired: [] };
      const rnd = Math.random; Math.random = () => 0.99999; try { fireHook('wake', ctx); } finally { Math.random = rnd; } closeModals();
      const e = EV.find(x => x.id === 'lev_prowl'), fired = ctx.fired.includes('lev_prowl');
      return { fired, flag: S.ev.flags.levProwl, opts: fired ? e.choices().map(c => c.l) : [], say: uiNarr.join(' ') };
    }, setup);
    assert.strictEqual((await fire('S.car=null;')).fired, false, 'no car, no prowl');
    await page.evaluate(() => { S.money = 9000; CAR.buy('civic'); closeModals(); });
    const base = await page.evaluate(() => JSON.stringify(S));
    const broken = await fire(`S=JSON.parse(${JSON.stringify(base)});`);
    assert.ok(broken.fired && broken.flag === 'broken' && broken.opts.length === 3, JSON.stringify(broken));
    assert.ok(/police report/.test(broken.opts[0]) && /\$250/.test(broken.opts[0]) && /plastic/.test(broken.opts[1]) && /insurance/.test(broken.opts[2]), JSON.stringify(broken.opts));
    const seats = await fire(`S=JSON.parse(${JSON.stringify(base)});LEV.S().seats=true;`);
    assert.strictEqual(seats.flag, 'broken', 'one habit is not enough');
    const safe = await fire(`S=JSON.parse(${JSON.stringify(base)});LEV.S().seats=true;LEV.S().light=true;`);
    assert.ok(safe.fired && safe.flag === 'safe' && safe.opts.length === 2 && /not a scratch/.test(safe.say), JSON.stringify(safe));
    // the choices: pay the glass, tape it (fix later at home), or claim it (deductible, a higher rate)
    const ch = await page.evaluate(base => {
      const out = [];
      for (let i = 0; i < 3; i++) { S = JSON.parse(base); S.cur = 2; S.t = S.cur * 1440 + 400; S.money = 1000; S.ev.flags.levProwl = 'broken'; S.ev.last.lev_prowl = 2;
        const ins = S.car.ins, m0 = S.money; EV.find(x => x.id === 'lev_prowl').choices()[i].fn();
        out.push({ spent: m0 - S.money, taped: !!S.car.taped, up: S.car.ins - ins, seats: !!LEV.S().seats, fix: actionsHere().some(x => /taped-up window/.test(x.l)) }); }
      S = JSON.parse(base); return out;
    }, base);
    assert.ok(ch[0].spent === 250 && !ch[0].taped && ch[0].seats, JSON.stringify(ch[0]));
    assert.ok(ch[1].taped && ch[1].fix && ch[1].spent < 20, JSON.stringify(ch[1]));
    assert.ok(ch[2].spent === 100 && ch[2].up > 0, JSON.stringify(ch[2]));
    // the habits are toggles at home, once you own a car
    const h = await page.evaluate(() => { S.loc = 'home'; return actionsHere().filter(x => /nothing on the car seats|streetlight/.test(x.l)).map(x => x.l); });
    assert.strictEqual(h.length, 2, JSON.stringify(h));
    noErrors(errors);
  } },
  { name: 'no romance or fishing words in the driving code', fn: async () => {
    const BAD = /\b(romance|romantic|crush\w*|dat(e|es|ing)|boyfriends?|girlfriends?|kiss\w*|flirt\w*|sexy?|sexual|couples?|fish\w*|salmon|marina|charters?|wdfw)\b/i;
    const src = fs.readFileSync(path.join(__dirname, '..', 'src/js/38-car.js'), 'utf8');
    assert.ok(!BAD.test(src), 'banned word: ' + (src.match(BAD) || [])[0]);
  } },
];
