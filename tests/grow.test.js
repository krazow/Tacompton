const fs = require('fs'), path = require('path');
const { ID, open, reload, noErrors, assert } = require('./helpers');

// Growing Up: the second mode (src/js/30-grow-world.js, 31-grow-story.js). The adult game must stay exactly as it was.
const BAD_KID = /\b(romance|romantic|crush\w*|dat(e|es|ing)|boyfriends?|girlfriends?|kiss\w*|flirt\w*)\b/i;
const BAD_FISH = /\b(fish\w*|salmon|marina|charters?|wdfw|chinook|coho|herring)\b/i;
const SEEDS = [20261120, 11, 909090], STEPS = 4000;

async function startGrow(page) {
  await page.evaluate(() => startGrowUp());
  await page.waitForSelector('#mbg');
  assert.match(await page.textContent('#mbg'), /difficulty/i);
  await page.evaluate(() => MBTN(1));   // Hilltop (normal)
  await page.waitForSelector('.hud');
}
// every visible text of the running Growing Up game: each tab, each place at a few times of day
async function allText(page) {
  return page.evaluate(() => {
    closeModals(); let s = document.body.innerText;
    const t0 = S.t, loc0 = S.loc;
    for (const k of allTabs().map(t => t[0])) { closeModals(); setTab(k); s += '\n' + document.body.innerText; }
    setTab('act');
    for (const d of [0, 5, 7]) for (const m of [600, 900, 1100, 1250]) for (const k of Object.keys(L)) {
      S.cur = d; S.t = d * 1440 + m; S.loc = k; render(); s += '\n' + document.body.innerText;
      for (const x of ['todo', 'week', 'kids']) { setTab(x); s += '\n' + document.body.innerText; } setTab('act');
    }
    S.cur = 0; S.t = t0; S.loc = loc0; render();
    return s;
  });
}

module.exports = [
  { name: 'the start page has a Growing Up button, and it starts Growing Up', fn: async ctx => {
    const { page, errors } = await open(ctx);
    assert.match(await page.textContent('.title button.big'), /New game/);
    await startGrow(page);
    const r = await page.evaluate(() => ({ mode: MODE, smode: S.mode, days: GAME.days, cur: S.cur, loc: S.loc, t: S.t, keys: Object.keys(L).filter(k => !L[k].hood).sort(), stats: STATS.map(s => s.l),
      money: S.money, day: dayName(0), hud: document.querySelector('.hud').textContent, modal: document.getElementById('mbg') && document.getElementById('mbg').textContent }));
    assert.strictEqual(r.mode, 'grow'); assert.strictEqual(r.smode, 'grow'); assert.strictEqual(r.days, 8);
    assert.strictEqual(r.cur, 0); assert.strictEqual(r.loc, 'home'); assert.strictEqual(r.day, 'Monday'); assert.strictEqual(r.t, 480);
    assert.deepStrictEqual(r.keys, ['home', 'library', 'mlk', 'peoples', 'school', 'view']);
    assert.deepStrictEqual(r.stats, ['Money', 'Energy', 'Mood', 'Family', 'Friends', 'Ready']);
    assert.strictEqual(r.money, 20);
    assert.match(r.hud, /Mon Aug 24/);
    assert.match(r.modal, /Growing Up/); assert.match(r.modal, /Summit View/);
    noErrors(errors);
  } },
  ...SEEDS.map(seed => ({ name: `a random bot reaches the Chapter 1 end screen (seed ${seed})`, fn: async ctx => {
    const { page, errors } = await open(ctx, { seed });
    await startGrow(page);
    let st = { steps: 0, done: false, log: '' };
    while (!st.done && st.steps < STEPS && !errors.length) {
      st = await page.evaluate(([st, n]) => {
        const rnd = Math.random, skip = /exit|transfer|settings|change name|save slots|delete|new game|play again/i;
        const ok = b => !b.disabled && !skip.test(b.textContent);
        const pick = a => a[Math.floor(rnd() * a.length)];
        for (let i = 0; i < n && !st.done; i++, st.steps++) {
          if (document.querySelector('.end')) { st.done = true; break; }
          if (!S || S.over) { st.done = true; break; }
          st.log = S.log.map(e => e.s).join('\n');
          const cross = document.querySelector('.cross'); if (cross) { cross.click(); continue; }
          const m = document.getElementById('mbg');
          if (m) {
            const bs = [...m.querySelectorAll('.modal > button.act')];
            const any = bs.map((b, k) => k).filter(k => ok(bs[k]));
            if (any.length) MBTN(rnd() < 0.7 ? any[0] : pick(any)); else m.remove();
            continue;
          }
          if (rnd() < 0.05) { setTab(pick(allTabs().map(t => t[0]))); continue; }
          if (tab !== 'act') setTab('act');
          if (rnd() < 0.03) { endDay('home'); continue; }
          const bs = [...document.querySelectorAll('#app .content button.act, #app .content button.chip')].filter(ok);
          if (!bs.length) { endDay('home'); continue; }
          pick(bs).click();
        }
        return st;
      }, [st, 100]);
    }
    noErrors(errors);
    assert.ok(st.done, `Chapter 1 should finish within ${STEPS} steps (got ${st.steps})`);
    const end = await page.textContent('.end');
    assert.match(end, /Chapter 1 complete/); assert.match(end, /Coming next, Chapter 2/); assert.match(end, /Your first week/);
    assert.doesNotMatch(end + '\n' + st.log, BAD_KID); assert.doesNotMatch(end + '\n' + st.log, BAD_FISH);
    console.log(`       bot: ${st.steps} steps · ${(end.match(/Score\s*([\d,]+)/) || [])[1]} · grade ${await page.textContent('.end .grade')}`);
  } })),
  { name: 'curfew: out past 8:30 PM costs Family and sends you home', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await startGrow(page);
    const r = await page.evaluate(() => {
      closeModals(); S.loc = 'mlk'; S.t = 1200; const f = S.family;
      pass(20); const before = [S.family, S.loc, !!S.curfew[0]];
      pass(20); const after = [f - S.family, S.loc, !!S.curfew[0], S.stats.curfew];
      pass(60); const again = f - S.family;   // only once a night
      S.loc = 'home'; S.t = 1440 + 1250; S.cur = 1; const f2 = S.family; pass(30);   // at home: no penalty
      return { before, after, again, home: f2 - S.family, f };
    });
    assert.deepStrictEqual(r.before, [r.f, 'mlk', false]);
    assert.deepStrictEqual(r.after, [12, 'home', true, 1]);
    assert.strictEqual(r.again, 12); assert.strictEqual(r.home, 0);
    // going out after curfew turns you right around
    const r2 = await page.evaluate(() => { S.cur = 2; S.t = 2 * 1440 + 1240; S.loc = 'home'; go('view'); return S.loc; });
    assert.strictEqual(r2, 'home');
    noErrors(errors);
  } },
  { name: 'the first day of school is the finale, and the end screen follows', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await startGrow(page);
    await page.evaluate(() => { closeModals(); for (let d = 0; d < 7; d++) { endDay('home'); closeModals(); } });
    const r = await page.evaluate(() => ({ cur: S.cur, alarm: fmt(S.t), hud: document.querySelector('.hud').textContent }));
    assert.strictEqual(r.cur, 7); assert.strictEqual(r.alarm, '6:45 AM'); assert.match(r.hud, /First day of school/);
    await page.evaluate(() => { go('school'); render(); });
    await page.click('text=Go in: the first day of middle school');
    for (let i = 0; i < 4; i++) { await page.click('#mbg button.act'); }
    await page.click('text=Finish Chapter 1');
    await page.waitForSelector('.end');
    assert.match(await page.textContent('.end'), /Chapter 1 complete/);
    assert.strictEqual(await page.evaluate(() => loadSave()), null, 'a finished chapter deletes its save');
    noErrors(errors);
  } },
  { name: 'the adult game still starts and plays (after a Growing Up game)', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await startGrow(page);
    await page.evaluate(() => { closeModals(); S = null; titleScreen(); });
    await page.evaluate(() => startNewGame());
    await page.waitForSelector('#mbg');
    await page.evaluate(() => MBTN(1));
    const m = await page.textContent('#mbg');
    assert.match(m, /Your new job/);
    const r = await page.evaluate(() => ({ mode: MODE, smode: S.mode, days: GAME.days, keys: Object.keys(L).filter(k => !L[k].hood).sort(), stats: STATS.map(s => s.l), rent: S.rent.amt, diff: DF().n }));
    assert.deepStrictEqual(r, { mode: 'adult', smode: undefined, days: 14, keys: ['home', 'link', 'mlk', 'peoples', 'view', 'work'], stats: ['Cash', 'Energy', 'Stress', 'Food', 'Job'], rent: 1150, diff: 'Hilltop' });
    await page.evaluate(() => { closeModals(); S.job = 'cafe';
      for (let d = 0; d < GAME.days && S && !S.over; d++) { S.loc = 'home'; S.money = Math.max(S.money, 3000); S.standing = 80; S.stress = 20; S.energy = 80; S.food = 3; S.rent.paid = true; endDay('home'); closeModals(); } });
    await page.waitForSelector('.end');
    assert.match(await page.textContent('.end'), /first two weeks/);
    noErrors(errors);
  } },
  { name: 'an adult save still loads and plays, even after Growing Up was played', fn: async ctx => {
    const { page, errors } = await open(ctx);
    // an adult save as 0.1.1 wrote it: no mode field
    await page.evaluate(() => { setMode('adult'); newGame('normal'); closeModals(); S.job = 'kitchen'; S.money = 1234; S.standing = 66; saveGame(); });
    const raw = await page.evaluate(id => localStorage.getItem(id + '.save'), ID);
    assert.ok(!JSON.parse(raw).S.mode, 'adult saves have no mode');
    // play some Growing Up in slot 2
    await page.evaluate(() => { setSlot(2); S = null; titleScreen(); });
    await startGrow(page);
    await page.evaluate(() => { closeModals(); pass(60); saveGame(); setSlot(1); S = null; titleScreen(); });
    await reload(page);
    const label = await page.textContent('.title button.big');
    assert.match(label, /^Continue as T/);
    await page.click('text=Continue as T');
    await page.waitForSelector('.hud');
    const r = await page.evaluate(() => ({ mode: MODE, job: S.job, money: S.money, standing: S.standing, days: GAME.days, keys: Object.keys(L).filter(k => !L[k].hood).sort(), hud: document.querySelector('.hud').textContent }));
    assert.strictEqual(r.mode, 'adult'); assert.strictEqual(r.job, 'kitchen'); assert.strictEqual(r.money, 1234); assert.strictEqual(r.standing, 66); assert.strictEqual(r.days, 14);
    assert.deepStrictEqual(r.keys, ['home', 'link', 'mlk', 'peoples', 'view', 'work']);
    assert.match(r.hud, /Cash/); assert.doesNotMatch(r.hud, /Friends/);
    // and it plays: a whole day passes
    await page.evaluate(() => { closeModals(); endDay('home'); closeModals(); });
    assert.strictEqual(await page.evaluate(() => S.cur), 1);
    // the Growing Up save in slot 2 is still a Growing Up save
    const g = await page.evaluate(() => { const d = loadSave(2); return [d.S.mode, MODE, Object.keys(L).includes('work')]; });
    assert.deepStrictEqual(g, ['grow', 'adult', true]);
    noErrors(errors);
  } },
  { name: 'a Growing Up save reloads and continues as Growing Up', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await startGrow(page);
    await page.evaluate(() => { closeModals(); S.family = 77; S.ready.haircut = true; pass(90); saveGame(); });
    await reload(page);
    assert.match(await page.textContent('.title button.big'), /🎒 Continue as T/);
    await page.click('.title button.big');
    await page.waitForSelector('.hud');
    const r = await page.evaluate(() => ({ mode: MODE, family: S.family, hair: S.ready.haircut, days: GAME.days, school: !!L.school, stats: STATS.map(s => s.l).join(',') }));
    assert.deepStrictEqual(r, { mode: 'grow', family: 77, hair: true, days: 8, school: true, stats: 'Money,Energy,Mood,Family,Friends,Ready' });
    noErrors(errors);
  } },
  { name: 'no romance, crush, dating or fishing words anywhere in Growing Up', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await startGrow(page);
    const welcome = await page.textContent('#mbg');
    const txt = await allText(page);
    const end = await page.evaluate(() => { closeModals(); S.cur = 7; S.t = 7 * 1440 + 1200; endDay('home'); return document.body.innerText; });
    for (const s of [welcome, txt, end]) { assert.doesNotMatch(s, BAD_KID); assert.doesNotMatch(s, BAD_FISH); }
    // and in every string in the Growing Up source (events and lines that only show now and then)
    for (const f of ['30-grow-world.js', '31-grow-story.js']) {
      const src = fs.readFileSync(path.join(__dirname, '..', 'src', 'js', f), 'utf8');
      const strings = (src.match(/(['`])(?:\\.|(?!\1)[^\\])*\1/g) || []).join('\n');
      assert.doesNotMatch(strings, BAD_KID, f); assert.doesNotMatch(strings, BAD_FISH, f);
    }
    noErrors(errors);
  } },
];
