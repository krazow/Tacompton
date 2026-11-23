const fs = require('fs'), path = require('path');
const { ID, open, reload, noErrors, assert } = require('./helpers');

// The life engine (src/js/10-life.js): lengths, starting ages, key weeks and time skips, one save across stages.
const LENGTHS = ['quick', '6m', '1y', '2y', 'life'], AGES = [12, 15, 18];
// calendar words like "date" are fine here; romance of any kind is not
const BAD = /\b(romance|romantic|crush\w*|dating|boyfriends?|girlfriends?|kiss\w*|flirt\w*|sexy?|sexual)\b/i;

// start a run without the start sheet: the same path the sheet's Start button takes, minus the pickers
async function startLife(page, length, startAge, diff = 'normal') {
  await page.evaluate(([length, startAge, diff]) => {
    closeModals(); setMode(startAge < 18 ? 'grow' : 'adult');
    LIFE_PICK = { length, startAge, birthday: { m: 3, d: 14, label: 'March 14' } };
    newGame(diff); render();
  }, [length, startAge, diff]);
}
// (its cash floor covers the rent, which rises with no cap now)
// a random bot: answers pop-ups (mostly the first button), taps actions, sleeps now and then; it keeps the run alive
// (no firing, burnout or eviction) so the test checks the scheduler, not the bot's luck
async function bot(page, { steps = 9000, weeks = Infinity } = {}) {
  let st = { steps: 0, done: false, weeks: 0 };
  while (!st.done && st.steps < steps) {
    st = await page.evaluate(([st, n, weeks]) => {
      const rnd = Math.random, skip = /exit|transfer|settings|change name|save slots|delete|new game|play again|best scores|back to title|finish here/i;
      const ok = b => !b.disabled && !skip.test(b.textContent), pick = a => a[Math.floor(rnd() * a.length)];
      for (let i = 0; i < n && !st.done; i++, st.steps++) {
        if (document.querySelector('.end')) { st.done = true; break; }
        if (!S || S.over) { const b = document.querySelector('.life-sum .big'); if (b) { b.click(); continue } st.done = true; break; }
        if (S.kwi >= weeks) { st.done = true; break; }
        st.weeks = S.kwi;
        if (isGrow()) { S.family = Math.max(S.family, 35); } else { S.standing = Math.max(S.standing, 35); S.stress = Math.min(S.stress, 60); S.money = Math.max(S.money, 1400, Math.round(S.rent.amt * 1.2)); }
        const cross = document.querySelector('.cross'); if (cross) { cross.click(); continue; }
        const m = document.getElementById('mbg');
        if (m) { const bs = [...m.querySelectorAll('.modal > button.act')], any = bs.map((b, k) => k).filter(k => ok(bs[k]));
          const cb = choiceBtn();   // a choice sheet: half the time the default, otherwise any option
          if (cb >= 0 && rnd() < 0.5) MBTN(cb); else if (any.length) MBTN(rnd() < 0.7 ? any[0] : pick(any)); else m.remove(); continue; }
        if (rnd() < 0.04) { setTab(pick(allTabs().map(t => t[0]))); continue; }
        if (tab !== 'act') setTab('act');
        if (rnd() < 0.04) { endDay('home'); continue; }
        const bs = [...document.querySelectorAll('#app .content button.act, #app .content button.chip')].filter(ok);
        if (!bs.length) { endDay('home'); continue; }
        pick(bs).click();
      }
      return st;
    }, [st, 150, weeks]);
  }
  return st;
}

const runs = [];
for (const length of LENGTHS) for (const age of AGES) runs.push({ length, age });

module.exports = [
  { name: 'the start screen: New life opens a sheet with lengths, ages and the birthday, and starts that life', fn: async ctx => {
    const { page, errors } = await open(ctx);
    assert.match(await page.textContent('#lifeBtn'), /New game/);
    // the old buttons are still the Quick play starts
    assert.match(await page.textContent('.title button.big'), /New game/);
    await page.click('#lifeBtn');
    const sheet = await page.textContent('#mbg');
    for (const t of ['Try it for 2 weeks', 'Play as a kid', 'Start at 18', '6 months', '1 year', '2 years', 'Lifetime', 'Starting age', 'Your birthday', 'Key weeks']) assert.ok(sheet.includes(t), t);
    await page.click('#mbg .lchip:has-text("1 year")');
    await page.click('#mbg .lchip:has-text("Play as a kid")');
    await page.click('#mbg .lchip:text-is("15")');
    const s2 = await page.textContent('#mbg');
    assert.match(s2, /Hilltop High/); assert.match(s2, /Mon Aug 24, 2026/);
    assert.strictEqual(await page.$$eval('#mbg .lchip.on', b => b.map(x => x.textContent.trim()).join('|')), '🎒 Play as a kid|15|📅 1 year|2026|🏘️ Hilltop');   // 72-county.js: Where you start, Hilltop by default
    await page.click('#mbg button.act:has-text("Start the game")');
    await page.waitForSelector('#mbg');
    assert.match(await page.textContent('#mbg'), /difficulty/i);
    await page.evaluate(() => MBTN(1));
    const r = await page.evaluate(() => ({ len: S.length, age: S.age, start: S.startAge, stage: stage(), mode: MODE, curfew: fmt(gCurfew()), school: L.school.name, weeks: S.keyWeeks.length, hud: document.querySelector('.hud').textContent, bday: S.birthday.label }));
    assert.deepStrictEqual([r.len, r.age, r.start, r.stage, r.mode, r.curfew, r.school], ['1y', 15, 15, 'high', 'grow', '10:00 PM', 'Hilltop High']);
    assert.ok(r.weeks >= 8 && r.weeks <= 11, 'about nine key weeks: ' + r.weeks);
    assert.match(r.hud, /Mon Aug 24 · Age 15 · Week 1 of/);
    noErrors(errors);
  } },
  { name: 'calendar helpers: dateOf, season, isSchoolDay, the yearly fair and stage', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await startLife(page, '1y', 18);
    const r = await page.evaluate(() => ({ d0: dateOf(0), d13: dateOf(13).label, fair: [...Array(400)].map((_, i) => i).filter(isFairDay).map(i => dateOf(i).label + ' ' + dateOf(i).y),
      seasons: [0, 40, 130, 220].map(season), school: [isSchoolDay(27), isSchoolDay(28), isSchoolDay(dayIndexOf(2026, 12, 21)), isSchoolDay(dayIndexOf(2027, 4, 2)), isSchoolDay(dayIndexOf(2027, 6, 14)), isSchoolDay(dayIndexOf(2027, 6, 16)), isSchoolDay(dayIndexOf(2026, 9, 5))],
      stages: [12, 13, 14, 17, 18].map(a => stage(a)) }));
    assert.deepStrictEqual(r.d0, { y: 2026, m: 8, d: 3, dow: 0, label: 'Mon Aug 3' });
    assert.strictEqual(r.d13, 'Sun Aug 16');
    assert.deepStrictEqual(r.fair, ['Sat Aug 8 2026', 'Sat Aug 14 2027']);
    assert.deepStrictEqual(r.seasons, ['summer', 'fall', 'winter', 'spring']);
    assert.deepStrictEqual(r.school, [false, true, false, false, true, false, false]);
    assert.deepStrictEqual(r.stages, ['middle', 'middle', 'high', 'high', 'adult']);
    noErrors(errors);
  } },
  ...runs.map(({ length, age }) => ({ name: `a bot reaches the end: ${length}, starting at ${age}`, fn: async ctx => {
    const { page, errors } = await open(ctx, { seed: 4242 + age });
    await startLife(page, length, age);
    const plan = await page.evaluate(() => ({ weeks: S.keyWeeks.length, days: GAME.days, kinds: S.keyWeeks.map(k => k.kind) }));
    if (length === 'quick') assert.strictEqual(plan.weeks, 1);
    if (length === 'quick') assert.strictEqual(plan.days, age === 18 ? 14 : 8);
    if (length === '6m') assert.strictEqual(plan.weeks, 6);
    if (length === '1y') assert.ok(plan.weeks >= 9 && plan.weeks <= 10, '1y: ' + plan.weeks);
    if (length === '2y') assert.ok(plan.weeks >= 9 && plan.weeks <= 12, '2y: ' + plan.weeks);
    let st;
    if (length === 'life') {
      st = await bot(page, { weeks: 2 });
      noErrors(errors);
      await page.evaluate(() => lifeFF());
      if (await page.$('.life-sum')) { assert.match(await page.textContent('.life-sum'), /A life on Hilltop/); await page.click('.life-sum .big'); }
    } else st = await bot(page);
    noErrors(errors);
    await page.waitForSelector('.end');
    const r = await page.evaluate(() => ({ kwi: S.kwi, n: S.keyWeeks.length, cur: S.cur, last: lifeEndDay(S), age: S.age, mode: MODE, txt: document.querySelector('.end').innerText }));
    if (length !== 'quick') {
      assert.doesNotMatch(r.txt, /GAME OVER/);
      assert.strictEqual(r.kwi, r.n - 1, 'played every key week');
      assert.strictEqual(r.cur, r.last, 'to the last day');
      assert.match(r.txt, /per month played/);
    }
    if (length === 'life') { assert.ok(r.age >= 80, 'old age'); assert.strictEqual(r.mode, 'adult'); }
    assert.doesNotMatch(r.txt, BAD);
    console.log(`       ${length}/${age}: ${st.steps} bot steps, ${r.n} key weeks, age ${r.age}, ${(r.txt.match(/Score[^\n]*\n([\d,]+)/) || [])[1] || ''}`);
  } })),
  { name: 'a time skip: one or two choices, then what changed', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await startLife(page, '6m', 18);
    await page.evaluate(() => { closeModals(); pickJob('cafe'); closeModals(); for (let i = 0; i < 6; i++) { S.money = 3000; S.standing = 90; endDay('home'); closeModals(); } S.rent.paid = true; endDay('home'); });
    const m1 = await page.textContent('#mbg');
    assert.match(m1, /Key week 1 of 6 is done/);
    for (const t of ['Pick up extra shifts', 'Save money', 'See friends more']) assert.ok(m1.includes(t), t);
    await page.click('#mbg button.act:has-text("Save money")');
    const m2 = await page.textContent('#mbg');
    for (const t of ['What changed', 'Cash', 'Stress', 'Job', 'Community', 'Family', 'Age', 'Rent paid']) assert.ok(m2.includes(t), t);
    await page.click('#mbg button.act');
    const r = await page.evaluate(() => ({ kwi: S.kwi, cur: S.cur, date: dateOf(S.cur).label, mode: MODE }));
    assert.deepStrictEqual(r, { kwi: 1, cur: 35, date: 'Mon Sep 7', mode: 'adult' });
    assert.match(await page.textContent('#mbg'), /Morning report/);
    noErrors(errors);
  } },
  { name: 'switching length: lengthen, shorten, too-short is grayed, Finish here ends with a score', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await startLife(page, 'quick', 18);
    // lengthen Quick play to a year, mid-way through the two weeks
    const a = await page.evaluate(() => { closeModals(); pickJob('cafe'); closeModals(); for (let i = 0; i < 3; i++) { endDay('home'); closeModals(); }
      const before = [S.keyWeeks.length, GAME.days];
      const ok = lifeSetLength('1y'); return { before, ok, len: S.length, weeks: S.keyWeeks.length, days: GAME.days, first: [S.keyWeeks[0].start, S.keyWeeks[0].end], rentDue: S.rent.due, log: S.lengthLog }; });
    assert.deepStrictEqual(a.before, [1, 14]); assert.ok(a.ok); assert.strictEqual(a.len, '1y');
    assert.ok(a.weeks >= 9); assert.strictEqual(a.days, 364); assert.deepStrictEqual(a.first, [0, 13]); assert.strictEqual(a.rentDue, 13);
    assert.deepStrictEqual(a.log, [{ d: 3, from: 'quick', to: '1y' }]);
    // shorten back to Quick play while it's still ahead
    const b = await page.evaluate(() => { const ok = lifeSetLength('quick'); return { ok, weeks: S.keyWeeks.length, days: GAME.days }; });
    assert.deepStrictEqual(b, { ok: true, weeks: 1, days: 14 });
    // play into a 1-year game's third key week: 6 months still fits, Quick play doesn't
    await page.evaluate(() => { lifeSetLength('1y'); lifeFF(2); });
    const c = await page.evaluate(() => ({ kwi: S.kwi, quick: !!lifePlan('quick'), six: !!lifePlan('6m'), life: !!lifePlan('life') }));
    assert.deepStrictEqual(c, { kwi: 2, quick: false, six: true, life: true });
    // the Game length sheet never offers the Try it teaser (it isn't a length), and offers Finish here
    await page.evaluate(() => { closeModals(); render(); openSettings(); });
    await page.click('#mbg button.act:has-text("Game options")');
    await page.click('#mbg button.act:has-text("Game length")');
    const q = await page.$eval('#mbg', m => [...m.querySelectorAll('button.act')].map(b => ({ t: b.textContent, dis: b.disabled })));
    assert.ok(!q.some(x => /Try it|Quick play/.test(x.t)), JSON.stringify(q));
    assert.ok(q.some(x => /Shorten to 🍂 6 months/.test(x.t) && !x.dis)); assert.ok(q.some(x => /Lengthen to 🌳 Lifetime/.test(x.t) && !x.dis));
    // lengthen to Lifetime through the confirmation sheet: it shows the new end and the key weeks left
    await page.click('#mbg button.act:has-text("Lengthen to 🌳 Lifetime")');
    const conf = await page.textContent('#mbg');
    assert.match(conf, /New end/); assert.match(conf, /Key weeks left/); assert.match(conf, /2088/);
    await page.click('#mbg button.act:has-text("Switch to Lifetime")');
    assert.strictEqual(await page.evaluate(() => S.length), 'life');
    // and shorten back to 6 months
    assert.ok(await page.evaluate(() => lifeSetLength('6m')));
    assert.deepStrictEqual(await page.evaluate(() => [S.length, GAME.days, S.lengthLog.map(x => x.to).join(',')]), ['6m', 182, '1y,quick,1y,life,6m']);
    // Finish here
    await page.evaluate(() => { closeModals(); openSettings(); });
    await page.click('#mbg button.act:has-text("Game options")');
    await page.click('#mbg button.act:has-text("Game length")');
    await page.click('#mbg button.act:has-text("Finish here"):not([disabled])');
    await page.click('#mbg button.act:has-text("Finish here")');
    await page.waitForSelector('.end');
    const e = await page.textContent('.end');
    assert.match(e, /called it here/); assert.match(e, /per month played/);
    assert.strictEqual(await page.evaluate(() => loadSave()), null, 'a finished game deletes its save');
    const runs = await page.evaluate(id => JSON.parse(localStorage.getItem(id + '.runs')), ID);
    assert.strictEqual(runs[0].len, '6m'); assert.strictEqual(runs[0].age, 18);
    noErrors(errors);
  } },
  { name: 'highlights: 3 days of each key week', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await startLife(page, '6m', 12);
    const r = await page.evaluate(() => { closeModals(); S.life.weekPlay = 'highlights'; lifeSync(); const d = GAME.days; lifeFF(1);
      const k = lifeKw(); return { kwi: S.kwi, n: k.to - k.from + 1, cur: S.cur, from: k.from, end: d, days: lifeWeekDays().length }; });
    assert.strictEqual(r.kwi, 1); assert.strictEqual(r.n, 3); assert.strictEqual(r.cur, r.from); assert.strictEqual(r.days, 3);
    noErrors(errors);
  } },
  { name: 'old saves load as Quick play (adult at 18, Growing Up at 12)', fn: async ctx => {
    const { page, errors } = await open(ctx);
    for (const [mode, age, days] of [['adult', 18, 14], ['grow', 12, 8]]) {
      // a save as 0.3.0 wrote it: schema 1, no life fields
      await page.evaluate(m => { setMode(m); newGame('normal'); closeModals(); S.money = 321; pass(90);
        const d = packSave(); d.schema = 1; d.app = '0.3.0';
        for (const k of ['length', 'startAge', 'age', 'birthday', 'stage', 'lengthLog', 'keyWeeks', 'kwi', 'life', 'startDate']) delete d.S[k];
        localStorage.setItem(KEY('save'), JSON.stringify(d)); S = null; titleScreen(); }, mode);
      await reload(page);
      await page.evaluate(() => closeModals());
      await page.click('.title button.big');
      await page.waitForSelector('.hud');
      await page.evaluate(() => closeModals());
      const r = await page.evaluate(() => ({ len: S.length, start: S.startAge, age: S.age, weeks: S.keyWeeks.length, days: GAME.days, money: S.money, mode: MODE, long: lifeLong(), bday: !!S.birthday.label }));
      assert.deepStrictEqual(r, { len: 'quick', start: age, age, weeks: 1, days, money: 321, mode, long: false, bday: true });
      // and it still plays to its usual end
      await page.evaluate(() => { for (let i = 0; i < 20 && S && !S.over; i++) { S.loc = 'home'; if (!isGrow()) { S.money = 3000; S.standing = 80; S.stress = 20; S.rent.paid = true; } endDay('home'); closeModals(); } });
      await page.waitForSelector('.end');
      assert.match(await page.textContent('.end'), mode === 'adult' ? /first two weeks/ : /Chapter 1 complete/);
      await page.evaluate(() => titleScreen());
    }
    noErrors(errors);
  } },
  { name: 'the 18 handoff: graduation, a path, the Hilltop apartment, all in one save', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await startLife(page, 'life', 15);
    // fast-forward to the graduation sheet
    const g = await page.evaluate(() => { let guard = 0;
      while (guard++ < 5000) { const m = document.getElementById('mbg');
        if (m) { if (/Graduation/.test(m.querySelector('h2').textContent)) break; MBTN([...m.querySelectorAll('.modal > button.act')].findIndex(b => !b.disabled)); continue; }
        S.family = 80; S.loc = 'home'; endDay('home'); }
      return { age: S.age, mode: MODE, kind: lifeKw().kind, saves: Object.keys(localStorage).filter(k => /\.save/.test(k)) }; });
    assert.deepStrictEqual([g.age, g.mode, g.kind], [18, 'grow', 'graduation']);
    await page.screenshot({ path: '/tmp/tc-life-shots/handoff-1-graduation.png' }).catch(() => {});
    const fam = await page.evaluate(() => S.family);
    await page.click('#mbg button.act:has-text("What’s next")');
    assert.match(await page.textContent('#mbg'), /UW Tacoma/);
    await page.click('#mbg button.act:has-text("College")');
    const own = await page.textContent('#mbg');
    assert.match(own, /Your own place/); assert.match(own, /a month toward rent/); assert.match(own, /Community starts at/); assert.match(own, /Job standing starts at/);
    const r = await page.evaluate(() => ({ mode: MODE, smode: S.mode, stage: S.stage, job: S.job, path: S.life.path, part: S.life.parttime, help: S.life.rentHelp, start: S.startAge, name: S.name, grow: !!S.life.grow, L: Object.keys(L).includes('work'),
      saves: Object.keys(localStorage).filter(k => /\.save/.test(k)), saved: JSON.parse(localStorage.getItem(KEY('save'))).S.mode }));
    assert.deepStrictEqual([r.mode, r.smode, r.stage, r.job, r.path, r.part, r.start, r.name, r.grow, r.L], ['adult', 'adult', 'adult', 'cafe', 'college', true, 15, 'T', true, true]);
    assert.strictEqual(r.help, Math.round(fam * 3 / 10) * 10);
    assert.deepStrictEqual(r.saves, [ID + '.save']); assert.deepStrictEqual(g.saves, r.saves, 'the same one save before and after');
    assert.strictEqual(r.saved, 'adult');
    await page.screenshot({ path: '/tmp/tc-life-shots/handoff-2-apartment.png' }).catch(() => {});
    await page.click('#mbg button.act:has-text("Pick up the keys")');
    // then a time skip into moving day, as an adult
    assert.match(await page.textContent('#mbg'), /Pick up extra shifts/);
    await page.click('#mbg button.act');
    await page.click('#mbg button.act');
    const m = await page.evaluate(() => ({ kind: lifeKw().kind, mode: MODE, stats: STATS.map(s => s.l).join(','), rent: S.rent.amt }));
    assert.deepStrictEqual(m, { kind: 'movein', mode: 'adult', stats: 'Cash,Energy,Stress,Food,Job', rent: 1150 });
    // and it reloads as the same life, now adult
    await page.evaluate(() => { closeModals(); saveGame(); });
    await reload(page);
    await page.click('.title button.big');
    await page.waitForSelector('.hud');
    const z = await page.evaluate(() => ({ mode: MODE, len: S.length, start: S.startAge, age: S.age, days: GAME.days === lifeEndDay(S) + 1 }));
    assert.deepStrictEqual(z, { mode: 'adult', len: 'life', start: 15, age: 18, days: true });
    noErrors(errors);
  } },
  { name: 'Game options: length first, start-only items grayed with a reason, difficulty once a week, week play, rename', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await startLife(page, '1y', 12);
    await page.evaluate(() => { closeModals(); render(); });
    await page.click('.hud .gear');
    await page.click('#mbg button.act:has-text("Game options")');
    const b = await page.$eval('#mbg', m => [...m.querySelectorAll('.modal > button.act')].map(x => ({ t: x.querySelector('b').textContent, s: (x.querySelector('.tx span') || {}).textContent || '', dis: x.disabled })));
    assert.match(b[0].t, /Game length/);
    const age = b.find(x => /Starting age/.test(x.t)), mode = b.find(x => /Mode/.test(x.t));
    assert.ok(age.dis && /new game/i.test(age.s), JSON.stringify(age)); assert.ok(mode.dis && /18/.test(mode.s), JSON.stringify(mode));
    for (const t of ['Difficulty', 'Event pop-ups', 'Tips', 'Week play: Full week', 'Rename']) assert.ok(b.some(x => x.t.includes(t) && !x.dis), t);
    await page.click('#mbg button.act:has-text("Difficulty")');
    await page.click('#mbg button.act:has-text("Harder")');
    assert.strictEqual(await page.evaluate(() => S.diff), 'hard');
    const d2 = await page.$eval('#mbg', m => [...m.querySelectorAll('button.act')].find(x => /Difficulty/.test(x.textContent)).disabled);
    assert.ok(d2, 'once a week');
    await page.click('#mbg button.act:has-text("Week play")');
    assert.strictEqual(await page.evaluate(() => S.life.weekPlay), 'highlights');
    noErrors(errors);
  } },
  { name: 'Quick play is today’s game: no birthdays, no skips, same two weeks', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await page.evaluate(() => startNewGame());
    await page.evaluate(() => MBTN(1));
    const r = await page.evaluate(() => ({ len: S.length, days: GAME.days, rent: S.rent.due, hud: document.querySelector('.hud').textContent, long: lifeLong() }));
    assert.deepStrictEqual([r.len, r.days, r.rent, r.long], ['quick', 14, 13, false]);
    assert.match(r.hud, /Mon Aug 3 · Day 1 of 14/);
    await page.evaluate(() => { closeModals(); S.birthday = { m: 8, d: 5, label: 'August 5' }; endDay('home'); closeModals(); endDay('home'); closeModals(); });
    assert.strictEqual(await page.evaluate(() => S.age), 18);
    noErrors(errors);
  } },
  { name: 'no romance words in the life engine or its screens', fn: async ctx => {
    const { page, errors } = await open(ctx);
    const src = fs.readFileSync(path.join(__dirname, '..', 'src', 'js', '10-life.js'), 'utf8');
    const strings = (src.match(/(['`])(?:\\.|(?!\1)[^\\])*\1/g) || []).join('\n');
    assert.doesNotMatch(strings, BAD);
    await page.click('#lifeBtn');
    let txt = await page.textContent('#mbg');
    await startLife(page, '1y', 12);
    txt += await page.evaluate(() => { lifeFF(3); let s = document.body.innerText; closeModals(); bestScoresModal(); s += document.body.innerText; closeModals(); lifeFF(); return s + document.body.innerText; });
    assert.doesNotMatch(txt, BAD);
    noErrors(errors);
  } },
];
