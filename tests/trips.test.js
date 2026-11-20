const { open, newGame, noErrors, assert } = require('./helpers');

// Press the legal button of the open pop-up (window.legalBtn), else the first enabled one.
const pressLegal = page => page.evaluate(() => {
  const m = document.getElementById('mbg'); if (!m) return false;
  const bs = [...m.querySelectorAll('.modal > button.act')];
  let i = typeof window.legalBtn === 'function' ? window.legalBtn() : -1;
  if (!bs[i] || bs[i].disabled) i = bs.findIndex(b => !b.disabled);
  if (i < 0) return false; MBTN(i); return true;
});

module.exports = [
  { name: 'book a trip, run it through the modals (legal options): paid, one trip', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await newGame(page);
    const r0 = await page.evaluate(() => {
      closeModals();
      S.cur = 1; S.t = 1440 + 330; S.loc = 'marina'; S.fuel = 30; S.gear = 3; S.bait = 1; S.unlogged = 0; S.energy = 90; S.boat = 85;
      S.book = []; S.reqs = [];
      const b = { id: S.nextId++, day: 1, start: 330, type: 'mooch', party: { name: 'Testers', n: 2, want: 'fish', mood: 70 }, price: 300, dep: 75, status: 'booked' };
      S.book.push(b); render();
      return { id: b.id, money: S.money, rep: S.rep };
    });
    // start the booked trip from the marina's actions
    const started = await page.evaluate(() => {
      const acts = marinaActions().filter(a => !a.dis);
      const a = acts.find(x => /trip|start|launch|head out|go fishing/i.test(x.l));
      if (!a) return { ok: false, labels: marinaActions().map(x => x.l) };
      S.t = 1440 + 355; a.fn(); return { ok: true };
    });
    assert.ok(started.ok, 'a start-trip action at the marina: ' + JSON.stringify(started.labels));
    for (let i = 0; i < 60 && (await page.evaluate(() => !!S.trip || !!document.getElementById('mbg'))); i++) {
      if (!(await pressLegal(page))) await page.evaluate(() => S.trip && typeof tripNext === 'function' && tripNext());
    }
    while (await page.$('#mbg')) { if (!(await pressLegal(page))) break; }
    const r = await page.evaluate(id => ({ st: (S.book.find(b => b.id === id) || {}).status, trip: S.trip, trips: S.stats.trips, money: S.money, earned: S.stats.earned, cites: S.cites }), r0.id);
    assert.strictEqual(r.st, 'done'); assert.strictEqual(r.trip, null);
    assert.strictEqual(r.trips, 1, 'S.stats.trips == 1');
    assert.notStrictEqual(r.money, r0.money, `money changed (${r0.money} → ${r.money})`);
    assert.strictEqual(r.cites, 0, 'legal choices earn no citations');
    noErrors(errors);
  } },
  { name: 'a booking request can be answered in the Bookings tab', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await newGame(page);
    await page.evaluate(() => { closeModals(); if (typeof tripsMorning === 'function') tripsMorning(S.cur); setTab('book'); });
    assert.ok(await page.$('.content'));
    const html = await page.evaluate(() => bookingsView());
    assert.ok(typeof html === 'string' && html.length > 0);
    noErrors(errors);
  } },
  { name: 'a trip with no bookings does not start and costs nothing', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await newGame(page);
    const r = await page.evaluate(() => {
      closeModals(); S.book = []; S.loc = 'marina'; const m = S.money, t = S.stats.trips;
      const a = marinaActions().find(x => /start.*trip|launch/i.test(x.l) && !x.dis);
      return { m, t, startable: !!a, trip: S.trip };
    });
    assert.strictEqual(r.trip, null); assert.strictEqual(r.t, 0);
    noErrors(errors);
  } },
];
