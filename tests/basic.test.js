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
  { name: 'the Hilltop places exist (other neighborhoods are tagged with .hood)', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await newGame(page);
    const keys = await page.evaluate(() => Object.keys(L).filter(k => !L[k].hood).sort());
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
  { name: 'start page: the big button, then Help, Send feedback right under it, then Install app', only: 'index.html', fn: async ctx => {
    const { page, errors } = await open(ctx);
    const order = await page.$$eval('.title .body button', bs => bs.map(b => b.id || b.className));
    const big = order.findIndex(c => /\bbig\b/.test(c)), help = order.indexOf('helpBtn'), fb = order.indexOf('feedbackBtn'), inst = order.indexOf('installBtn');
    assert.ok(big >= 0 && help === big + 1 && fb === help + 1 && inst === fb + 1, 'order: ' + order.join(', '));
    assert.match(await page.textContent('#feedbackBtn'), /Send feedback/);
    const fbBox = await page.$eval('#feedbackBtn', b => b.getBoundingClientRect().toJSON());
    assert.ok(fbBox.height >= 44, 'feedback is a 44px target');
    assert.match(await page.textContent('#helpBtn'), /Help/);
    assert.match(await page.textContent('#installBtn'), /Install app/);
    const [h, i] = await Promise.all(['#helpBtn', '#installBtn'].map(s => page.$eval(s, b => b.getBoundingClientRect().toJSON())));
    assert.ok(h.height >= 44 && i.height >= 44, '44px targets');
    assert.ok(fbBox.top >= h.bottom && i.top >= fbBox.bottom, 'Feedback sits beneath Help, Install beneath Feedback');
    // the other buttons are still there
    const txt = await page.textContent('.title .tgrid');
    for (const t of ['Save slots', 'What’s new', 'Transfer']) assert.ok(txt.includes(t), t);
    // Install with no browser offer shows the install steps
    await page.click('#installBtn');
    assert.match(await page.textContent('#mbg'), /Install Tacompton/);
    noErrors(errors);
  } },
  { name: 'start page: no Install app in the single-file offline build', only: 'offline', fn: async ctx => {
    const { page, errors } = await open(ctx);
    assert.ok(await page.$('#helpBtn'), 'Help is there');
    assert.strictEqual(await page.$('#installBtn'), null);
    noErrors(errors);
  } },
  { name: 'Help opens the guide: a document with every chapter and a working table of contents', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await page.click('#helpBtn');
    await page.waitForSelector('#tut');
    assert.strictEqual(await page.$('#mbg'), null, 'a full-screen document, not a pop-up');
    const r = await page.evaluate(() => {
      const t = document.getElementById('tut'), b = t.getBoundingClientRect();
      return { w: b.width, h: b.height, vw: innerWidth, vh: innerHeight, role: t.getAttribute('role'), title: document.getElementById('tut-h').textContent,
        toc: [...t.querySelectorAll('.tut-toc a')].map(a => a.textContent.replace(/^\d+/, '').trim()),
        heads: [...t.querySelectorAll('.tut-ch > h2')].map(h => h.textContent.replace(/^\d+/, '').trim()),
        hrefs: [...t.querySelectorAll('.tut-toc a')].map(a => a.getAttribute('href')),
        inert: document.getElementById('app').hasAttribute('inert') };
    });
    assert.ok(r.w >= r.vw - 1 && r.h >= r.vh - 1, 'fills the screen');
    assert.strictEqual(r.role, 'dialog'); assert.match(r.title, /How to play/); assert.ok(r.inert, 'the game behind is inert');
    const want = ['Getting started', 'Your first day step by step', 'The HUD stats explained', 'Places on Hilltop', 'Your job and shifts', 'Food and the fridge',
      'Energy and stress', 'Rent', 'Neighbors and community', 'Events', 'The Week and Neighbors tabs', 'Winning, losing and the score', 'Tips and strategy',
      'Settings, accessibility and saving', 'Installing the app', 'Growing Up (new)', 'Game lengths and ages', 'Growing up', 'FAQ'];
    assert.deepStrictEqual(r.toc, want); assert.deepStrictEqual(r.heads, want);
    for (const h of r.hrefs) assert.ok(await page.$(h), 'TOC target ' + h);
    // real numbers from the game
    const txt = await page.textContent('#tut');
    for (const s of ['$1,150', '$172', '$104', '$138', '7:00 AM', '6:30 AM', '2:00 PM', '$42', '3,850', '3,000', '× 20', '× 60', '× ½']) assert.ok(txt.includes(s), 'mentions ' + s);
    assert.doesNotMatch(txt, /\b(fish\w*|salmon|marina|charters?|wdfw)\b/i);
    // a TOC link jumps to its chapter and moves focus to the heading
    await page.click('.tut-toc a[href="#tut-score"]');
    await page.waitForFunction(() => { const h = document.getElementById('tut-score'); return h && Math.abs(h.getBoundingClientRect().top) < 120; });
    assert.strictEqual(await page.evaluate(() => document.activeElement.id), 'tut-score-h');
    // every control in it is at least 44px tall
    const small = await page.$$eval('#tut button, #tut .tut-toc a, #tut .tut-up', els => els.filter(e => e.getBoundingClientRect().height < 43.5).map(e => e.textContent));
    assert.deepStrictEqual(small, []);
    // print / save as PDF opens the print dialog
    await page.evaluate(() => { window.__printed = 0; window.print = () => { window.__printed++; }; });
    await page.click('.tut-pr');
    assert.strictEqual(await page.evaluate(() => window.__printed), 1);
    noErrors(errors);
  } },
  { name: 'the guide: Esc closes it, Tab stays inside, and the close button works', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await page.focus('#helpBtn');
    await page.keyboard.press('Enter');
    await page.waitForSelector('#tut');
    await page.waitForFunction(() => document.activeElement && document.activeElement.classList.contains('tut-x'));
    for (let i = 0; i < 5; i++) await page.keyboard.press('Shift+Tab');
    assert.ok(await page.evaluate(() => document.getElementById('tut').contains(document.activeElement)), 'focus stays in the guide');
    await page.keyboard.press('Escape');
    assert.strictEqual(await page.$('#tut'), null);
    assert.strictEqual(await page.$('#mbg'), null, 'Esc does not open anything else');
    assert.strictEqual(await page.evaluate(() => document.activeElement.id), 'helpBtn', 'focus goes back to Help');
    assert.ok(!(await page.evaluate(() => document.getElementById('app').hasAttribute('inert'))));
    await page.click('#helpBtn');
    await page.click('.tut-x');
    assert.strictEqual(await page.$('#tut'), null);
    noErrors(errors);
  } },
  { name: 'the guide opens from ⚙️ Settings → Help in a game, and closes back to the game', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await newGame(page);
    await page.evaluate(() => openSettings());
    const labels = await page.$$eval('#mbg .modal > button.act', bs => bs.map(b => b.textContent));
    const i = labels.findIndex(t => /Help/.test(t));
    assert.ok(i >= 0, 'Settings has Help');
    await page.evaluate(i => MBTN(i), i);
    await page.waitForSelector('#tut');
    await page.waitForTimeout(80);
    assert.ok(await page.evaluate(() => document.getElementById('app').hasAttribute('inert')), 'the game behind is inert');
    await page.keyboard.press('1');   // game shortcuts don't fire behind the guide
    assert.strictEqual(await page.evaluate(() => S.t), await page.evaluate(() => GAME.wake));
    await page.keyboard.press('Escape');
    assert.strictEqual(await page.$('#tut'), null);
    assert.ok(await page.$('.hud'), 'back in the game');
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
