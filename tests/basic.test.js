const { open, newGame, noErrors, assert } = require('./helpers');

module.exports = [
  { name: 'new game: day 0, Monday, home, starting state', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await newGame(page);
    const r = await page.evaluate(() => ({ days: GAME.days, cur: S.cur, loc: S.loc, name: dayName(0), money: S.money, rent: S.rent, shifts: S.stats.shifts, comm: S.community }));
    assert.strictEqual(r.days, 14); assert.strictEqual(r.cur, 0); assert.strictEqual(r.loc, 'home');
    assert.strictEqual(r.name, 'Monday'); assert.ok(r.money > 0);
    assert.strictEqual(r.rent.due, 13); assert.strictEqual(r.rent.amt, 1150); assert.strictEqual(r.rent.paid, false);
    assert.strictEqual(r.shifts, 0);
    noErrors(errors);
  } },
  { name: 'the Hilltop places exist, and nothing else', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await newGame(page);
    const keys = await page.evaluate(() => Object.keys(L).sort());
    assert.deepStrictEqual(keys, ['home', 'link', 'mlk', 'peoples', 'view', 'work']);
    noErrors(errors);
  } },
  { name: 'the HUD shows the 5 stats', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await newGame(page);
    const labels = await page.evaluate(() => STATS.map(s => s.l));
    assert.deepStrictEqual(labels, ['Cash', 'Energy', 'Stress', 'Food', 'Job']);
    const txt = await page.textContent('.hud');
    for (const l of labels) assert.ok(txt.includes(l), `HUD shows ${l}`);
    noErrors(errors);
  } },
  { name: 'the job is picked at the start', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await page.evaluate(() => { newGame('normal'); });
    const m = await page.textContent('#mbg');
    assert.match(m, /hospital|CNA/i); assert.match(m, /caf/i); assert.match(m, /kitchen|line cook/i);
    const labels = await page.$$eval('#mbg .modal > button.act', bs => bs.map(b => b.textContent));
    const i = labels.findIndex(t => /kitchen|line cook/i.test(t));
    assert.ok(i >= 0, 'a kitchen button');
    await page.evaluate(i => MBTN(i), i);
    assert.strictEqual(await page.evaluate(() => S.job), 'kitchen');
    noErrors(errors);
  } },
  { name: 'every job has a standing and a place to work', fn: async ctx => {
    const { page, errors } = await open(ctx);
    for (const job of ['hospital', 'cafe', 'kitchen']) {
      await newGame(page);
      const r = await page.evaluate(j => { S.job = j; closeModals(); render(); return [S.standing >= 0 && S.standing <= 100, !!L.work]; }, job);
      assert.deepStrictEqual(r, [true, true]);
    }
    noErrors(errors);
  } },
  { name: 'every tab renders', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await newGame(page);
    const tabs = await page.evaluate(() => allTabs().map(t => t[0]));
    assert.ok(tabs.length >= 2);
    for (const k of tabs) { await page.evaluate(k => { closeModals(); setTab(k); }, k); assert.ok(await page.$('.content')); }
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
  { name: 'loss: fired when job standing hits 0', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await newGame(page);
    await page.evaluate(() => { closeModals(); S.standing = 0; afterAction(); });
    await page.waitForSelector('.end');
    assert.match(await page.textContent('.end'), /let go/i);
    noErrors(errors);
  } },
  { name: 'loss: burnout when stress hits 100', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await newGame(page);
    await page.evaluate(() => { closeModals(); S.stress = 100; afterAction(); });
    await page.waitForSelector('.end');
    assert.match(await page.textContent('.end'), /burned out/i);
    noErrors(errors);
  } },
  { name: 'loss: evicted when rent is unpaid at the end of day 13', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await newGame(page);
    await page.evaluate(() => {
      closeModals(); S.cur = 13; S.t = 13 * 1440 + 1200; S.rent.paid = false; S.evicted = false;
      S.money = 5; S.standing = 80; S.stress = 20; S.energy = 80; S.food = 3;
      endDay('home');
    });
    await page.waitForSelector('.end');
    assert.match(await page.textContent('.end'), /out of the apartment/i);
    noErrors(errors);
  } },
  { name: 'loss: evicted when deep in debt', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await newGame(page);
    await page.evaluate(() => { closeModals(); S.money = -600; afterAction(); });
    await page.waitForSelector('.end');
    assert.match(await page.textContent('.end'), /out of the apartment/i);
    noErrors(errors);
  } },
  { name: 'paid rent at the end of day 13 is not an eviction', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await newGame(page);
    const r = await page.evaluate(() => {
      closeModals(); S.job = S.job || 'cafe'; S.cur = 13; S.t = 13 * 1440 + 1200; S.rent.paid = true;
      S.money = 900; S.standing = 80; S.stress = 20; S.energy = 80; S.food = 3;
      return checkLoss();
    });
    assert.ok(!r, 'no loss, got ' + r);
    noErrors(errors);
  } },
  { name: 'a scripted 14-day run reaches the end screen and deletes the save', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await newGame(page);
    await page.evaluate(() => {
      closeModals(); S.job = S.job || 'cafe';
      for (let d = 0; d < GAME.days && S && !S.over; d++) {
        S.loc = 'home'; S.money = Math.max(S.money, 3000); S.standing = 80; S.stress = 20; S.energy = 80; S.food = 3;
        if (S.rent) S.rent.paid = true;
        endDay('home'); closeModals();
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
  { name: 'no fishing, Guide Master or Alaska leftovers in the visible text (all tabs and Help)', fn: async ctx => {
    const { page, errors } = await open(ctx);
    const title = await page.evaluate(() => document.body.innerText);
    await newGame(page);
    const txt = await page.evaluate(() => {
      closeModals(); let s = document.body.innerText;
      for (const k of allTabs().map(t => t[0])) { closeModals(); setTab(k); s += '\n' + document.body.innerText; }
      closeModals(); setTab('act');
      for (const k of Object.keys(L)) { S.loc = k; render(); s += '\n' + document.body.innerText; }
      S.loc = 'home';
      try { if (typeof openHelp === 'function') { openHelp(); s += '\n' + document.body.innerText; closeModals(); } } catch (e) {}
      return s;
    });
    const lossTxt = await page.evaluate(() => { closeModals(); S.stress = 100; afterAction(); return document.body.innerText; });
    const bad = /\b(fish\w*|salmon|marina|charters?|wdfw|chinook|coho|herring|waders?|guide master|kenai|soldotna|alaska)\b/i;
    assert.doesNotMatch(title + '\n' + txt + '\n' + lossTxt, bad);
    noErrors(errors);
  } },
  { name: 'the built index.html has no fishing words in its visible markup or text', fn: async ctx => {
    const fs = require('fs'), path = require('path');
    const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
    // the whole built file, case-insensitive, whole words
    const m = html.match(/\b(fish\w*|salmon|marina|charters?|wdfw|chinook|coho|herring)\b/ig);
    assert.strictEqual(m, null, 'fishing words in index.html: ' + (m || []).slice(0, 10).join(', '));
  } },
];
