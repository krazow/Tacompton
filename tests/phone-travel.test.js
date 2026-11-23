const { open, noErrors, assert } = require('./helpers');

// Phone apps for getting around (src/js/54-phone-travel.js): Transit, Maps, Weather, Rides.
async function start(page, { grow = false, length = 'quick', age } = {}) {
  await page.evaluate(([grow, length, age]) => {
    closeModals(); setMode(grow ? 'grow' : 'adult');
    LIFE_PICK = length === 'quick' ? null : { length, startAge: age || (grow ? 12 : 18), birthday: { m: 3, d: 14, label: 'March 14' } };
    newGame('normal'); closeModals(); if (!isGrow()) { pickJob('cafe'); closeModals(); } tab = 'act'; render();
    GAME.travelAnim = 9999; PH().plan = PH().plan || 'prepaid'; S.ph.billed = S.ph.billed || 1;
  }, [grow, length, age]);
}
const screen = page => page.evaluate(() => document.querySelector('#phoneUI .ph-screen').textContent);

module.exports = [
  { name: 'all four install; each opens without errors; no service hides live info', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page);
    const r = await page.evaluate(() => { const o = {};
      o.ok = ['transit', 'maps', 'weather', 'rides'].map(id => phoneInstall(id));
      o.txt = {};
      for (const id of ['transit', 'maps', 'weather', 'rides']) { phoneOpen(id); o.txt[id] = document.querySelector('#phoneUI .ph-screen').textContent; phoneClose(); }
      S.ph.cut = true; phoneOpen('transit'); o.cut = document.querySelector('#phoneUI .ph-screen').textContent; phoneClose(); S.ph.cut = false;
      return o; });
    assert.deepStrictEqual(r.ok, [true, true, true, true]);
    for (const id in r.txt) assert.doesNotMatch(r.txt[id], /Something went wrong/, id);
    assert.match(r.txt.transit, /ORCA card/); assert.match(r.txt.transit, /Downtown/); assert.match(r.txt.transit, /Proctor/);
    assert.match(r.txt.maps, /Hilltop/); assert.match(r.txt.weather, /Tomorrow/); assert.match(r.txt.weather, /August/);
    assert.match(r.txt.rides, /Proctor/);
    assert.match(r.cut, /No service/); assert.doesNotMatch(r.cut, /Next rides/);
    noErrors(errors);
  } },
  { name: 'ORCA: reload in the app, bus fares come off the card; departures follow the timetable', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page);
    const r = await page.evaluate(() => { const o = {}; phoneInstall('transit');
      const m0 = S.money; o.re = PHONE_TRAVEL.trReload(20); o.paid = m0 - S.money; o.bal = S.ph.tr.orca;
      const m1 = S.money; S.loc = 'home'; go('pr_main'); closeModals(); o.cash = m1 - S.money; o.after = S.ph.tr.orca;
      S.t = S.cur * 1440 + 720; o.bus = PHONE_TRAVEL.trDeps('proctor', 2); o.link = PHONE_TRAVEL.trDeps('downtown', 2);
      S.t = S.cur * 1440 + 1350; o.late = PHONE_TRAVEL.trDeps('proctor', 2);
      return o; });
    assert.ok(r.re); assert.strictEqual(r.paid, r.bal); assert.ok(r.bal >= 20);
    assert.strictEqual(r.cash, 0, 'the fare came off the card, not the wallet');
    assert.ok(r.after < r.bal && r.after > 0, 'card balance down: ' + r.after);
    assert.strictEqual(r.bus.length, 2); assert.strictEqual(r.bus[1] - r.bus[0], 15, 'buses every 15 min at noon');
    assert.strictEqual(r.link[1] - r.link[0], 10, 'the Link every 10 min at noon');
    assert.strictEqual(r.late.length, 0, 'no buses after 10 PM');
    noErrors(errors);
  } },
  { name: 'service alerts are rolled once and stored; seen the bus alert, the breakdown never happens', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page);
    const r = await page.evaluate(() => { const o = {}; phoneInstall('transit');
      const d = day() + 1; S.ph.tr = { orca: 0, al: { [d]: { bus: true, elev: true, st: 'Tacoma Dome Station' } }, seen: {} };
      o.same = JSON.stringify(PHONE_TRAVEL.trAlerts(d, true)) === JSON.stringify(PHONE_TRAVEL.trAlerts(d, true));
      phoneOpen('transit'); o.txt = document.querySelector('#phoneUI .ph-screen').textContent; phoneClose();
      o.seen = !!S.ph.tr.seen[d];
      const e = EV.find(x => x.id === 'lev_bus');
      S.cur = d; o.pSeen = e.chance({ to: 'work' });
      S.ph.tr.seen[d] = false; o.pUnseen = e.chance({ to: 'work' }) * DF().bad;
      S.ph.tr.al[d].bus = false; o.pNone = e.chance({ to: 'work' });
      return o; });
    assert.ok(r.same, 'the same roll every time');
    assert.match(r.txt, /Tomorrow/); assert.match(r.txt, /pulled from service/); assert.match(r.txt, /elevator/);
    assert.ok(r.seen);
    assert.strictEqual(r.pSeen, 0, 'seen: avoided');
    assert.ok(r.pUnseen >= 0.999, 'not seen: it happens as rolled');
    assert.strictEqual(r.pNone, 0, 'no alert rolled: no breakdown');
    noErrors(errors);
  } },
  { name: 'Weather: tomorrow is stored and wxOf keeps it; an evening notification for rain', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page, { length: '1y' });
    const r = await page.evaluate(() => { const o = {}; phoneInstall('weather');
      const d = day() + 1; S.ph.wx = { [d]: 'rain' };
      o.wx = wxOf(d); o.fc = PHONE_TRAVEL.wxFc(d);
      S.ph.wxN = null; S.t = S.cur * 1440 + 1150; pass(5);
      o.notes = phoneNotes('weather').map(n => n.x);
      delete S.ph.wx[d]; const k = PHONE_TRAVEL.wxFc(d); o.stored = S.ph.wx[d] === k && wxOf(d) === k;
      return o; });
    assert.strictEqual(r.wx, 'rain'); assert.strictEqual(r.fc, 'rain');
    assert.ok(r.notes.some(x => /Tomorrow: .*Rain/.test(x)), r.notes.join(' | '));
    assert.ok(r.stored);
    noErrors(errors);
  } },
  { name: 'Maps lists open neighborhoods and starts trips; drive only with a car', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page, { length: '1y' });
    const r = await page.evaluate(() => { const o = {}; phoneInstall('maps'); S.loc = 'home';
      phoneOpen('maps'); o.top = document.querySelector('#phoneUI .ph-screen').textContent;
      phoneGo('maps', 'proctor'); o.pr = document.querySelector('#phoneUI .ph-screen').textContent;
      const b = [...document.querySelectorAll('#phoneUI .ph-btn')].find(x => /Main Street|Proctor/.test(x.textContent) && /Go ·/.test(x.textContent));
      b.click(); closeModals(); o.loc = S.loc; o.hood = hoodOf(S.loc);
      S.car = { lic: true, own: 'civic', down: false, ins: 95, billed: null, trips: 0, gas: 0 }; S.loc = 'home';
      phoneOpen('maps'); o.car = document.querySelector('#phoneUI .ph-screen').textContent; phoneClose();
      return o; });
    assert.match(r.top, /Downtown/); assert.doesNotMatch(r.top, /🚗 \d+ min/, 'no drive times without a car');
    assert.match(r.pr, /Go ·/);
    assert.strictEqual(r.hood, 'proctor');
    assert.match(r.car, /🚗 \d+ min/);
    noErrors(errors);
  } },
  { name: 'Growing Up: Maps respects the age gates, Rides is hidden, Youth ORCA is free', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page, { grow: true, length: '1y', age: 15 });
    const r = await page.evaluate(() => { const o = {}; phoneInstall('maps'); phoneInstall('transit');
      o.rides = phoneStoreApps().some(a => a.id === 'rides'); o.inst = phoneInstall('rides');
      phoneOpen('maps'); o.maps = document.querySelector('#phoneUI .ph-screen').textContent;
      phoneGo('transit'); o.tr = document.querySelector('#phoneUI .ph-screen').textContent; phoneClose();
      return o; });
    assert.strictEqual(r.rides, false); assert.strictEqual(r.inst, false);
    assert.match(r.maps, /Stadium/); assert.match(r.maps, /Downtown/); assert.match(r.maps, /Proctor/); assert.doesNotMatch(r.maps, /Old Town|Fern Hill/);
    assert.match(r.tr, /Youth ORCA/);
    noErrors(errors);
  } },
  { name: 'Rides: priced by distance, surge after a Dome show, a short wait, then you arrive', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page, { length: '1y' });
    const r = await page.evaluate(() => { const o = {}; phoneInstall('rides'); S.loc = 'home'; S.money = 500;
      while (day() % 7 !== 4) S.cur++;
      S.t = S.cur * 1440 + 720; const a = PHONE_TRAVEL.rideQuote('downtown'), b = PHONE_TRAVEL.rideQuote('netacoma');
      o.near = a.price; o.far = b.price; o.wait = a.wait;
      S.t = S.cur * 1440 + 1290; o.surge = PHONE_TRAVEL.rideQuote('downtown').surge;
      S.t = S.cur * 1440 + 720; const m0 = S.money, t0 = S.t, q = PHONE_TRAVEL.rideQuote('proctor');
      o.go = PHONE_TRAVEL.rideGo('proctor'); closeModals(); o.loc = S.loc; o.cost = m0 - S.money; o.price = q.price; o.min = S.t - t0; o.exp = q.wait + q.mins;
      return o; });
    assert.ok(r.far > r.near, `farther costs more: ${r.near} vs ${r.far}`);
    assert.ok(r.wait >= 3 && r.wait <= 12, 'a short wait ' + r.wait);
    assert.strictEqual(r.surge, 1.8);
    assert.ok(r.go); assert.strictEqual(r.loc, 'pr_main');
    assert.strictEqual(r.cost, r.price, 'charged the quote, no bus fare');
    assert.ok(r.min >= r.exp, `${r.min} >= ${r.exp}`);
    noErrors(errors);
  } },
];
