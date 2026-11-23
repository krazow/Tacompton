const { open, noErrors, assert } = require('./helpers');

// 🧪 Try it (src/js/66-try-it.js, 10-life.js lifeStartModal): the two-week game is a teaser, not a length.
const TWO = /two weeks|two-week|Quick play|first 14 days/i;
const sheet = page => page.evaluate(() => { const m = document.querySelector('#mbg .modal'); return m ? m.innerText : ''; });
const onChips = page => page.$$eval('#mbg .lchip.on', b => b.map(x => x.textContent.trim()).join('|'));

// play every day to the end, keeping the run alive
async function playOut(page) {
  await page.evaluate(() => { closeModals(); if (!isGrow()) S.job = 'cafe';
    for (let i = 0; i < 30 && S && !S.over; i++) { S.loc = 'home'; if (!isGrow()) { S.money = Math.max(S.money, 3000); S.standing = 80; S.stress = 20; S.energy = 80; S.food = 3; S.rent.paid = true; } endDay('home'); closeModals(); } });
  await page.waitForSelector('.end');
}

module.exports = [
  { name: 'the New game sheet: kid or 18, four lengths, and Try it apart from them', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await page.click('#lifeBtn');
    const chips = await page.$$eval('#mbg .lchip', b => b.map(x => x.textContent.trim()));
    for (const t of ['🎒 Play as a kid', '🧑 Start at 18', '🍂 6 months', '📅 1 year', '🗓️ 2 years', '🌳 Lifetime']) assert.ok(chips.includes(t), t);
    assert.ok(!chips.some(t => /Quick|⚡/.test(t)), 'no Quick play length');
    assert.strictEqual(await page.evaluate(() => LIFE_ORDER.join(',')), '6m,1y,2y,life');
    assert.strictEqual(await onChips(page), '🧑 Start at 18|📅 1 year|2026|🏘️ Hilltop');   // 72-county.js: Where you start (Hilltop by default)
    let t = await sheet(page);
    assert.match(t, /Not sure yet\? Try it for 2 weeks: a short taste, moving in at 18, no birthdays or time skips/);
    assert.ok(!chips.includes('12') && !chips.includes('15'), 'the kid ages show only after Play as a kid');
    await page.click('#mbg .lchip:has-text("Play as a kid")');
    assert.strictEqual(await onChips(page), '🎒 Play as a kid|12|📅 1 year|2026|🏘️ Hilltop');
    await page.click('#mbg .lchip:text-is("15")');
    assert.strictEqual(await onChips(page), '🎒 Play as a kid|15|📅 1 year|2026|🏘️ Hilltop');
    t = await sheet(page);
    assert.match(t, /Try it for a week/);
    await page.click('#mbg .lchip:has-text("Start at 18")');
    assert.strictEqual(await page.evaluate(() => LP.startAge), 18);
    noErrors(errors);
  } },
  ...[12, 15, 18].map(age => ({ name: `Try it starts the teaser at ${age}, tags the HUD, and ends with Start a new life`, fn: async ctx => {
    const { page, errors } = await open(ctx);
    await page.click('#lifeBtn');
    if (age < 18) { await page.click('#mbg .lchip:has-text("Play as a kid")'); await page.click(`#mbg .lchip:text-is("${age}")`); }
    await page.click('#tryItBtn');
    await page.waitForSelector('#mbg');
    assert.match(await sheet(page), /difficulty/i);
    await page.evaluate(() => MBTN(1));
    await page.waitForSelector('.hud');
    const r = await page.evaluate(() => ({ len: S.length, start: S.startAge, days: GAME.days, long: lifeLong(), year: S.startYear, grow: isGrow() }));
    assert.deepStrictEqual(r, { len: 'quick', start: age, days: age === 18 ? 14 : 8, long: false, year: 2026, grow: age < 18 });
    await page.evaluate(() => { closeModals(); render(); });
    assert.match(await page.textContent('.hud'), new RegExp(`🧪 Trying it out: ${r.days} days left`));
    await playOut(page);
    const end = await page.textContent('.end');
    assert.match(end, /Liked it\? Start a new life/);
    assert.ok(await page.evaluate(() => { const e = document.querySelector('.end'); return e.lastElementChild.querySelector('#tryNewLife') != null; }), 'the invitation ends the screen');
    await page.click('#tryNewLife');
    await page.waitForSelector('#mbg .lchip');
    assert.strictEqual(await page.evaluate(() => LP.startAge), age);
    assert.match(await onChips(page), age < 18 ? new RegExp(`^🎒 Play as a kid\\|${age}\\|`) : /^🧑 Start at 18\|/);
    noErrors(errors);
  } })),
  { name: 'no “two weeks” framing in the title, Help, rules or a longer game’s screens', fn: async ctx => {
    const { page, errors } = await open(ctx);
    const r = await page.evaluate(() => ({ title: document.querySelector('.title').innerText + ' ' + TITLE.intro + ' ' + TITLE.bullets.join(' '),
      help: (() => { const d = document.createElement('div'); d.innerHTML = helpDoc(); return d.textContent; })(),
      ach: ACH.map(a => a.d).join(' '), diffs: Object.values(DIFFS).map(d => d.d).join(' ') }));
    for (const k in r) assert.doesNotMatch(r[k], TWO, k + ': ' + (r[k].match(new RegExp('.{0,80}(' + TWO.source + ').{0,40}', 'i')) || [''])[0]);
    assert.match(r.help, /Try it for 2 weeks/);
    // a 6-month game: the rules tab and its end screen
    await page.evaluate(() => { closeModals(); setMode('adult'); LIFE_PICK = { length: '6m', startAge: 18, birthday: { m: 3, d: 14, label: 'March 14' } }; newGame('normal'); closeModals(); S.job = 'cafe'; render(); });
    assert.doesNotMatch(await page.evaluate(() => RULES_HTML), TWO);
    await page.evaluate(() => { endDay('home'); closeModals(); lifeFinish('here'); });
    await page.waitForSelector('.end');
    const end = await page.textContent('.end');
    assert.doesNotMatch(end, TWO); assert.match(end, /per month played/); assert.doesNotMatch(end, /Start a new life/);
    noErrors(errors);
  } },
  { name: 'Best scores label the teaser “Try it”, and Play again keeps its age', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await page.evaluate(() => { closeModals(); setMode('grow'); LIFE_PICK = { length: 'quick', startAge: 15, birthday: { m: 3, d: 14, label: 'March 14' } }; newGame('normal'); });
    await playOut(page);
    await page.evaluate(() => bestScoresModal());
    const b = await sheet(page);
    assert.match(b, /🧪 Try it/); assert.doesNotMatch(b, /Quick/);
    await page.evaluate(() => { closeModals(); startNewGame(); });
    await page.waitForSelector('#mbg');
    await page.evaluate(() => MBTN(1));
    assert.deepStrictEqual(await page.evaluate(() => [S.length, S.startAge]), ['quick', 15]);
    noErrors(errors);
  } },
];
