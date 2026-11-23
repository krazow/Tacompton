const { open, newGame, reload, noErrors, assert } = require('./helpers');

// The choices framework (03-events.js), tested with test-only events defined here (no content event is used).
// t_pick: a choice event on its own hook; option 0 costs $10, option 1 (the default) costs 5 stress points of calm.
const DEF = () => {
  if (EV.some(e => e.id === 't_pick')) return;
  const mk = (id, extra) => defEvent(Object.assign({ id, hook: 't_hook', tile: ['🧪', 'Test choice ' + id, 'bad'], chance: 1, max: 99,
    run: () => say('🧪 Something happened: ' + id),
    choices: () => [
      { ic: '💵', l: 'Pay for it', s: `${$(10)}`, fn: () => { money(-10); say('🧪 paid ' + id); } },
      { ic: '🚶', l: 'Let it go', s: 'Stress +5', fn: () => { adj('stress', 5); say('🧪 let go ' + id); } },
      { ic: '🚫', l: 'Cannot', s: 'disabled', dis: true, fn: () => { money(-999); } }],
    dflt: 1 }, extra || {}));
  mk('t_pick'); mk('t_two'); mk('t_three'); mk('t_four');
  mk('t_urgent', { hook: 't_urgent', urgent: true, tile: ['⚠️', 'Test urgent', 'bad'] });
  defEvent({ id: 't_watch', hook: 't_watch', tile: ['🌅', 'Test moment', 'good'], chance: 1, max: 99, choices: () => stopWatch({ mins: 20, calm: 8, text: '🌅 watched' }), dflt: 1 });
};
// a quiet adult game at 10 AM at home, with money and some stress, and nothing else that could fire on the test hooks
async function setup(ctx) {
  const { page, errors } = await open(ctx);
  await newGame(page);
  await page.evaluate(DEF);
  await page.evaluate(() => EV.forEach(e => { if (e.choices && !/^t_/.test(e.id)) e.cond = () => false; }));   // content events with choices stay quiet here
  await page.evaluate(() => { closeModals(); clearTiles(); S.t = S.cur * 1440 + 600; S.money = 500; S.stress = 40; S.ev.pending = []; tab = 'act'; render(); });
  return { page, errors };
}

module.exports = [
  { name: 'a choice event: pending, a tappable tile, a Decide card, a sheet with its default, and the option applies', fn: async ctx => {
    const { page, errors } = await setup(ctx);
    await page.evaluate(() => fireHook('t_hook', {}));   // all four fire? no: three at most
    let r = await page.evaluate(() => ({ pending: S.ev.pending.map(p => p.id), count: S.ev.count.t_four || 0 }));
    assert.deepStrictEqual(r.pending, ['t_pick', 't_two', 't_three'], 'three pending at most');
    await page.evaluate(() => { S.ev.pending = S.ev.pending.filter(p => p.id !== 't_three'); render(); });
    assert.strictEqual(r.count, 0, 'the fourth choice event does not fire while three wait');
    // the tile is a button with an aria-label
    await page.waitForSelector('#tiles .tile.decide button.tdec');
    assert.match(await page.getAttribute('#tiles button.tdec', 'aria-label'), /tap to decide/i);
    // the Decide card on the Here tab
    await page.evaluate(() => render());
    const card = await page.textContent('#app .decide');
    assert.match(card, /Decide · 2 waiting/); assert.match(card, /Test choice t_pick/);
    // tapping the tile opens the sheet
    await page.click('#tiles button.tdec');
    await page.waitForSelector('#mbg .choice-sheet', { state: 'attached' });
    assert.strictEqual(await page.evaluate(() => choiceBtn()), 1);
    const sheet = await page.textContent('#mbg');
    assert.match(sheet, /Something happened: t_pick/); assert.match(sheet, /If you don’t decide by tonight: Let it go/);
    const bs = await page.$$eval('#mbg .modal > button.act', b => b.map(x => ({ t: x.textContent, dis: x.disabled, h: x.getBoundingClientRect().height })));
    assert.strictEqual(bs.length, 4, '3 options + Not now');
    assert.ok(bs[2].dis, 'a disabled option stays disabled');
    assert.match(bs[3].t, /Not now/);
    assert.ok(bs.every(b => b.h >= 44), 'buttons are at least 44px');
    // number keys work: 1 is "Pay for it"
    await page.keyboard.press('1');
    r = await page.evaluate(() => ({ money: S.money, stress: S.stress, pending: S.ev.pending.map(p => p.id), open: !!document.getElementById('mbg'), narr: uiNarr.join(' ') }));
    assert.strictEqual(r.money, 490); assert.strictEqual(r.stress, 40);
    assert.deepStrictEqual(r.pending, ['t_two']); assert.ok(!r.open); assert.match(r.narr, /paid t_pick/);
    // the Decide card opens the other one; Not now keeps it pending; the second option differs
    await page.evaluate(() => { clearTiles(); render(); });
    await page.click('#app .decide button.act');
    await page.waitForSelector('#mbg .choice-sheet', { state: 'attached' });
    await page.keyboard.press('Escape');   // Esc = Not now
    assert.deepStrictEqual(await page.evaluate(() => S.ev.pending.map(p => p.id)), ['t_two']);
    await page.click('#app .decide button.act');
    await page.waitForSelector('#mbg .choice-sheet', { state: 'attached' });
    await page.evaluate(() => MBTN(1));
    r = await page.evaluate(() => ({ money: S.money, stress: S.stress, pending: S.ev.pending.length, card: !!document.querySelector('#app .decide') }));
    assert.deepStrictEqual(r, { money: 490, stress: 45, pending: 0, card: false });
    noErrors(errors);
  } },
  { name: 'a decision left until night takes its default, with a log line and a line in the morning report', fn: async ctx => {
    const { page, errors } = await setup(ctx);
    await page.evaluate(() => { S.ev.force.push('t_pick'); fireHook('t_hook', {}); S.ev.pending = S.ev.pending.filter(p => p.id === 't_pick'); });
    const before = await page.evaluate(() => ({ money: S.money, stress: S.stress }));
    await page.evaluate(() => { clearTiles(); endDay('home'); });
    const r = await page.evaluate(() => ({ pending: S.ev.pending.length, log: S.log.map(l => l.s).join('\n'), report: (document.getElementById('mbg') || {}).textContent || '' }));
    assert.strictEqual(r.pending, 0);
    assert.match(r.log, /You let it go: 🧪 Test choice t_pick \(🚶 Let it go\)/);
    assert.match(r.log, /let go t_pick/);
    assert.match(r.report, /You let it go: Test choice t_pick/);
    noErrors(errors);
    assert.ok(before.money === 500);
  } },
  { name: 'an urgent decision opens at once with pop-ups off, and has no Not now', fn: async ctx => {
    const { page, errors } = await setup(ctx);
    await page.evaluate(() => fireHook('t_urgent', {}));
    await page.waitForSelector('#mbg .choice-sheet', { state: 'attached' });
    const bs = await page.$$eval('#mbg .modal > button.act', b => b.map(x => x.textContent));
    assert.strictEqual(bs.length, 3); assert.ok(!bs.some(t => /Not now/.test(t)));
    await page.keyboard.press('Escape');
    assert.ok(await page.evaluate(() => !!document.getElementById('mbg')), 'Esc does not close an urgent sheet');
    await page.waitForTimeout(80);
    assert.strictEqual(await page.evaluate(() => document.activeElement && document.activeElement.closest('#mbg') !== null), true, 'focus is in the sheet');
    await page.evaluate(() => MBTN(choiceBtn()));
    assert.deepStrictEqual(await page.evaluate(() => [S.stress, S.ev.pending.length]), [45, 0]);
    noErrors(errors);
  } },
  { name: 'a forced choice event past the limit takes its default at once', fn: async ctx => {
    const { page, errors } = await setup(ctx);
    await page.evaluate(() => { fireHook('t_hook', {}); S.ev.force.push('t_four'); fireHook('t_hook', {}); });
    const r = await page.evaluate(() => ({ pending: S.ev.pending.map(p => p.id), stress: S.stress, count: S.ev.count.t_four }));
    assert.deepStrictEqual(r.pending, ['t_pick', 't_two', 't_three']); assert.strictEqual(r.count, 1); assert.strictEqual(r.stress, 45);
    noErrors(errors);
  } },
  { name: 'saves keep pending decisions, and the options come back after a reload', fn: async ctx => {
    const { page, errors } = await setup(ctx);
    await page.evaluate(() => { S.ev.force.push('t_pick'); fireHook('t_hook', {}); S.ev.pending = S.ev.pending.filter(p => p.id === 't_pick'); saveGame(); });
    await reload(page);
    await page.evaluate(DEF);
    await page.click('text=Continue as T');
    await page.waitForSelector('#app .decide');
    assert.deepStrictEqual(await page.evaluate(() => S.ev.pending.map(p => p.id)), ['t_pick']);
    await page.click('#app .decide button.act');
    await page.waitForSelector('#mbg .choice-sheet', { state: 'attached' });
    await page.evaluate(() => MBTN(0));
    assert.deepStrictEqual(await page.evaluate(() => [S.money, S.ev.pending.length]), [490, 0]);
    noErrors(errors);
  } },
  { name: 'a morning decision is in the morning report, with a Decide button that opens it in place', fn: async ctx => {
    const { page, errors } = await setup(ctx);
    await page.evaluate(() => { defEvent({ id: 't_wake', hook: 'wake', tile: ['🌄', 'Test morning choice', 'info'], chance: 0, max: 99, choices: () => stopWatch({ mins: 10, calm: 4 }), dflt: 1 });
      S.ev.force.push('t_wake'); clearTiles(); endDay('home'); });
    const rep = await page.textContent('#mbg');
    assert.match(rep, /Morning report/); assert.doesNotMatch(rep, /decision is waiting/, 'a moment is not a decision'); assert.match(rep, /Test morning choice/);
    assert.deepStrictEqual(await page.evaluate(() => S.ev.pending.length), 0, 'a moment takes no pending slot');
    await page.click('#mbg button.act:has-text("🌄 Test morning choice")');
    await page.waitForSelector('#mbg .choice-sheet', { state: 'attached' });
    const t0 = await page.evaluate(() => S.t);
    await page.click('#mbg button.act:has-text("Stop and watch")');
    assert.strictEqual(await page.evaluate(() => S.t), t0 + 10);
    noErrors(errors);
  } },
  { name: 'stopWatch gives "Stop and watch" (time, calm) and "Keep going" (nothing); eventFlag stores chain flags', fn: async ctx => {
    const { page, errors } = await setup(ctx);
    const r = await page.evaluate(() => {
      const o = stopWatch({ mins: 20, calm: 8, text: '🌅 watched' });
      const t = S.t, s = S.stress; o[1].fn(); const keep = [S.t - t, S.stress - s];
      o[0].fn(); const watch = [S.t - t, S.stress - s];
      setEventFlag('t_chain', 'painted'); setEventFlag('t_on');
      return { n: o.length, l: o.map(x => x.l), keep, watch, f: eventFlag('t_chain'), on: eventFlag('t_on'), none: eventFlag('t_none') };
    });
    assert.strictEqual(r.n, 2); assert.deepStrictEqual(r.l, ['Stop and watch', 'Keep going']);
    assert.deepStrictEqual(r.keep, [0, 0]); assert.strictEqual(r.watch[0], 20); assert.ok(r.watch[1] < 0);
    assert.strictEqual(r.f, 'painted'); assert.strictEqual(r.on, true); assert.strictEqual(r.none, undefined);
    noErrors(errors);
  } },
  { name: 'with pop-ups on, a choice event opens its sheet at once', fn: async ctx => {
    const { page, errors } = await setup(ctx);
    await page.evaluate(() => { localStorage.setItem(KEY('popups'), 'on'); fireHook('t_watch', {}); });
    await page.waitForSelector('#mbg .choice-sheet', { state: 'attached' });
    assert.strictEqual(await page.evaluate(() => choiceBtn()), 1);
    await page.evaluate(() => MBTN(1));
    assert.ok(await page.evaluate(() => !document.getElementById('mbg') && S.ev.pending.length === 0));
    noErrors(errors);
  } },
  { name: 'ambient moments take no pending slot: a tappable tile while it shows, then Keep going on its own', fn: async ctx => {
    const { page, errors } = await setup(ctx);
    await page.evaluate(() => fireHook('t_hook', {}));   // three decisions wait
    await page.evaluate(() => { clearTiles(); fireHook('t_watch', {}); });
    let r = await page.evaluate(() => ({ pending: S.ev.pending.length, waiting: choicesWaiting(), count: S.ev.count.t_watch || 0 }));
    assert.strictEqual(r.pending, 3); assert.strictEqual(r.count, 1, 'a moment fires even with three decisions waiting'); assert.ok(r.waiting.includes('t_watch'));
    await page.waitForSelector('#tiles .tile.decide button.tdec');
    assert.match(await page.getAttribute('#tiles button.tdec', 'aria-label'), /stop and watch/i);
    const t0 = await page.evaluate(() => S.t);
    await page.click('#tiles button.tdec');
    await page.waitForSelector('#mbg .choice-sheet', { state: 'attached' });
    const bs = await page.$$eval('#mbg .modal > button.act', b => b.map(x => x.textContent).filter(t => !/^📷/.test(t)));   // (55-phone-life.js adds 📷 Stop and take a photo)
    assert.strictEqual(bs.length, 2, 'Stop and watch / Keep going, no Not now');
    await page.evaluate(() => MBTN(0));
    r = await page.evaluate(() => ({ dt: S.t, waiting: choicesWaiting() }));
    assert.strictEqual(r.dt - t0, 20); assert.ok(!r.waiting.includes('t_watch'));
    // untapped: the tile goes and the moment passes (Keep going), with no log line
    await page.evaluate(() => { S.ev.last = {}; clearTiles(); fireHook('t_watch', {}); });
    const t1 = await page.evaluate(() => S.t);
    await page.click('#tiles .tile.decide .ok');
    await page.waitForTimeout(400);
    r = await page.evaluate(() => ({ t: S.t, waiting: choicesWaiting(), log: S.log.map(l => l.s).join('\n') }));
    assert.strictEqual(r.t, t1); assert.ok(!r.waiting.includes('t_watch')); assert.doesNotMatch(r.log, /Test moment/);
    noErrors(errors);
  } },
  { name: 'an urgent decision overnight is first in the morning report, and its sheet opens when the report closes', fn: async ctx => {
    const { page, errors } = await setup(ctx);
    await page.evaluate(() => { defEvent({ id: 't_night_urgent', hook: 'night', urgent: true, tile: ['🚨', 'Test night urgent', 'bad'], chance: 0, max: 99,
      run: () => say('🚨 Something at night'), choices: () => [{ ic: '💵', l: 'Pay', fn: () => money(-10) }, { ic: '🚶', l: 'Wait', fn: () => adj('stress', 5) }], dflt: 1 });
      S.ev.force.push('t_night_urgent'); clearTiles(); endDay('home'); });
    const rep = await page.textContent('#mbg .digest');
    assert.match(rep, /^\s*🚨\s*Needs an answer now: Test night urgent/, 'at the top of the report');
    assert.ok(await page.evaluate(() => !document.querySelector('#mbg .choice-sheet')));
    await page.click('#mbg button.act:has-text("Wake up")');
    await page.waitForSelector('#mbg .choice-sheet', { state: 'attached' });
    assert.match(await page.textContent('#mbg'), /Test night urgent/);
    const m0 = await page.evaluate(() => S.money);
    await page.evaluate(() => MBTN(0));
    assert.deepStrictEqual(await page.evaluate(() => [S.money, S.ev.pending.length]), [m0 - 10, 0]);
    noErrors(errors);
  } },
];
