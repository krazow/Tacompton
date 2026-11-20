const { open, newGame, noErrors, assert } = require('./helpers');

module.exports = [
  { name: 'new game: day 0, Monday, home, starting state', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await newGame(page);
    const r = await page.evaluate(() => ({ days: GAME.days, cur: S.cur, loc: S.loc, name: dayName(0), money: S.money, rep: S.rep, gear: S.gear, trips: S.stats.trips, book: Array.isArray(S.book), reqs: Array.isArray(S.reqs) }));
    assert.strictEqual(r.days, 14); assert.strictEqual(r.cur, 0); assert.strictEqual(r.loc, 'home');
    assert.strictEqual(r.name, 'Monday'); assert.ok(r.money > 0); assert.strictEqual(r.trips, 0);
    assert.ok(r.book && r.reqs);
    noErrors(errors);
  } },
  { name: 'the places exist', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await newGame(page);
    const miss = await page.evaluate(() => ['home', 'downtown', 'marina', 'ruston', 'foss', 'gigharbor'].filter(k => !L[k]));
    assert.deepStrictEqual(miss, []);
    noErrors(errors);
  } },
  { name: 'every tab renders (Bookings, Fish, Regs included)', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await newGame(page);
    const tabs = await page.evaluate(() => allTabs().map(t => t[0]));
    for (const k of ['book', 'fish', 'regs']) assert.ok(tabs.includes(k), `tab ${k}`);
    for (const k of tabs) { await page.evaluate(k => { closeModals(); setTab(k); }, k); assert.ok(await page.$('.content')); }
    noErrors(errors);
  } },
  { name: 'the cross-file functions exist', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await newGame(page);
    const r = await page.evaluate(() => ['marinaActions', 'homeTripActions', 'bookingsView', 'regsView', 'fishView', 'tripsMorning', 'tripsNight', 'ratingAvg', 'legalBtn', 'checkLoss']
      .filter(n => typeof (window[n] || (0, eval)('typeof ' + n + '==="function"?' + n + ':undefined')) !== 'function'));
    assert.deepStrictEqual(r, []);
    noErrors(errors);
  } },
  { name: 'staying up past midnight ends the day', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await newGame(page);
    await page.evaluate(() => { closeModals(); pass(1440); afterAction(); });
    assert.strictEqual(await page.evaluate(() => S.cur), 1);
    assert.ok(await page.$('#mbg'), 'a morning report opens');
    noErrors(errors);
  } },
  { name: 'three citations end the career', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await newGame(page);
    await page.evaluate(() => { closeModals(); S.cites = 3; afterAction(); });
    await page.waitForSelector('.end');
    noErrors(errors);
  } },
  { name: 'a scripted 14-day season reaches the end screen and deletes the save', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await newGame(page);
    await page.evaluate(() => {
      closeModals();
      for (let d = 0; d < GAME.days && S && !S.over; d++) {
        S.loc = 'home'; S.trip = null; S.money = Math.max(S.money, 3000); S.cites = 0;
        (S.book || []).forEach(b => { if (b.day === S.cur && b.status === 'booked') b.status = 'done'; });
        S.unlogged = 0; endDay('home'); closeModals();
      }
    });
    await page.waitForSelector('.end');
    assert.strictEqual(await page.evaluate(() => loadSave()), null, 'a finished game deletes its save');
    noErrors(errors);
  } },
  { name: 'keyboard: ? opens the shortcut list, Escape closes it', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await newGame(page);
    await page.evaluate(() => { closeModals(); render(); });
    await page.keyboard.press('?');
    assert.match(await page.textContent('#mbg'), /shortcuts/i);
    await page.keyboard.press('Escape');
    assert.strictEqual(await page.$('#mbg'), null);
    noErrors(errors);
  } },
  { name: 'title screen: Help! opens how to play', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await page.click('.title button >> text=Help!');
    assert.match(await page.textContent('#mbg'), /How to play/i);
    noErrors(errors);
  } },
  { name: 'no Guide Master or Alaska leftovers in the visible game text', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await newGame(page);
    const txt = await page.evaluate(() => { closeModals(); let s = document.body.innerText; for (const k of allTabs().map(t => t[0])) { setTab(k); s += '\n' + document.body.innerText; } return s; });
    assert.doesNotMatch(txt, /Guide Master|Kenai|Soldotna|Alaska/);
    noErrors(errors);
  } },
];
