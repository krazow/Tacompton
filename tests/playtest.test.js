const path = require('path');
const { open, newGame, noErrors, assert } = require('./helpers');
const { simGame } = require('../tools/sim-lib');

// Fixes from the play-test: tiles vs pop-ups, balance, the day-one Go to work button.
module.exports = [
  { name: 'tiles wait behind an open pop-up and come out after it closes', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await newGame(page);
    await page.evaluate(() => { modal('A pop-up', '<p>Read me.</p>', [{ l: 'OK', fn: () => {} }]); showTile('🔔', 'Test tile', 'sub', 'info'); });
    assert.strictEqual(await page.$$eval('#tiles .tile', t => t.length), 0, 'no tile while the pop-up is open');
    await page.evaluate(() => MBTN(0));
    await page.waitForSelector('#tiles .tile');
    assert.match(await page.textContent('#tiles'), /Test tile/);
    // a tile already showing hides behind a new pop-up, can't take taps, and stays until it closes
    await page.evaluate(() => modal('Another', '<p>x</p>', [{ l: 'OK', fn: () => {} }]));
    const st = await page.evaluate(() => { const b = document.getElementById('tiles'), t = b.querySelector('.tile');
      return { vis: getComputedStyle(b).visibility, pe: getComputedStyle(t).pointerEvents, z: +getComputedStyle(b).zIndex, mz: +getComputedStyle(document.getElementById('mbg')).zIndex }; });
    assert.strictEqual(st.vis, 'hidden'); assert.strictEqual(st.pe, 'none'); assert.ok(st.z < st.mz, 'tiles sit below pop-ups');
    await page.waitForTimeout(4200);
    assert.strictEqual(await page.$$eval('#tiles .tile', t => t.length), 1, 'kept while hidden');
    // the pop-up's button is clickable (nothing intercepts it)
    await page.click('#mbg .modal > button.act');
    assert.strictEqual(await page.$('#mbg'), null);
    noErrors(errors);
  } },
  { name: 'tiles sit below the HUD, not on it', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await newGame(page);
    await page.evaluate(() => showTile('🔔', 'Below the bar', '', 'info'));
    await page.waitForSelector('#tiles .tile');
    await page.waitForTimeout(500);   // after the slide-in
    const r = await page.evaluate(() => ({ hud: document.querySelector('.hud').getBoundingClientRect().bottom, tile: document.querySelector('#tiles .tile').getBoundingClientRect().top }));
    assert.ok(r.tile >= r.hud, `tile top ${r.tile} under HUD bottom ${r.hud}`);
    noErrors(errors);
  } },
  { name: 'day one: Go somewhere is open and Go to work takes you to work', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await newGame(page);
    await page.evaluate(() => { pickJob('cafe'); closeModals(); render(); });
    assert.ok(await page.$eval('details.go', d => d.open), 'Go somewhere open on day one');
    const b = await page.$$eval('#app .content button.act', bs => bs.map(x => ({ t: x.textContent, p: x.classList.contains('primary') })).find(x => /Go to work \(\d+ min\)/.test(x.t)));
    assert.ok(b && b.p, 'a primary Go to work button: ' + JSON.stringify(b));
    await page.click('#app .content button.act:has-text("Go to work")');
    assert.strictEqual(await page.evaluate(() => S.loc), 'work');
    await page.waitForSelector('#app .content button.act:has-text("Work your shift")');
    // no Go to work button on a day off
    await page.evaluate(() => { S.loc = 'home'; S.cur = 5; S.t = 5 * 1440 + 480; render(); });
    assert.strictEqual(await page.$('#app .content button.act:has-text("Go to work")'), null);
    noErrors(errors);
  } },
  { name: 'balance: a sensible player gets B or better, a sloppy one never an A', fn: async ctx => {
    const { page, errors } = await open(ctx);
    const res = [];
    for (const job of ['hospital', 'cafe', 'kitchen']) for (const seed of [11, 29]) {
      res.push(['sensible', job, await page.evaluate(simGame, { policy: 'sensible', job, diff: 'normal', seed })]);
      res.push(['sloppy', job, await page.evaluate(simGame, { policy: 'sloppy', job, diff: 'normal', seed })]);
    }
    for (const [p, job, r] of res) {
      if (p === 'sensible') assert.ok(['A', 'B'].includes(r.grade), `sensible ${job}: ${JSON.stringify(r)}`);
      else assert.notStrictEqual(r.grade, 'A', `sloppy ${job}: ${JSON.stringify(r)}`);
    }
    assert.ok(res.some(([p, , r]) => p === 'sensible' && r.stress + r.peak > 20), 'stress is not stuck at 0');
    noErrors(errors);
  } },
  { name: 'the difficulty picker says "(last time)" only after a difficulty was picked', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await page.evaluate(() => diffModal(() => {}));
    assert.doesNotMatch(await page.textContent('#mbg'), /last time/);
    await page.evaluate(() => { closeModals(); setPref('diff', 'hard'); diffModal(() => {}); });
    assert.match(await page.textContent('#mbg'), /Tight Month \(last time\)/);
    noErrors(errors);
  } },
  { name: 'the sunset moves from about 8:20 PM to about 8:00 PM, and the overlook says when', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await newGame(page);
    const r = await page.evaluate(() => { const a = fmt(sunsetOn(0)), b = fmt(sunsetOn(13)); S.loc = 'view'; S.cur = 4; S.t = 4 * 1440 + 900;
      const s = actionsHere().find(x => x.l === 'Watch the sunset').s; return { a, b, s, ss: fmt(sunsetOn(4)) }; });
    assert.strictEqual(r.a, '8:20 PM'); assert.strictEqual(r.b, '8:00 PM');
    assert.ok(r.s.includes(`Sunset ${r.ss}`) && /best from/.test(r.s), r.s);
    noErrors(errors);
  } },
];
