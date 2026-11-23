const { open, noErrors, assert } = require('./helpers');

// ⏩ Skip to 18 (src/js/38-skip18.js): ⚙️ Settings → 🎮 Game options, and the 18+ mode switch for an under-18 character.

async function growGame(page, length, age) {
  await page.evaluate(([len, age]) => { closeModals(); setMode(age < 18 ? 'grow' : 'adult'); LIFE_PICK = { length: len, startAge: age, birthday: { m: 3, d: 14, label: 'March 14' } }; newGame('normal'); closeModals(); tab = 'act'; render(); }, [length, age]);
}
const sheetText = page => page.evaluate(() => { const m = document.querySelector('#mbg .modal'); return m ? m.innerText : ''; });
const sheetTitle = page => page.evaluate(() => { const m = document.querySelector('#mbg .modal'); return m ? (m.querySelector('h2,h3') || m).textContent : ''; });
// the button in the open sheet whose text matches re: { dis, s } (and taps it unless peek)
const sheetBtn = (page, re, peek = false) => page.evaluate(([src, peek]) => { const re = new RegExp(src); const bs = [...document.querySelectorAll('#mbg .modal > button.act')];
  const i = bs.findIndex(b => re.test(b.textContent)); if (i < 0) return null; const r = { dis: bs[i].disabled, s: bs[i].textContent }; if (!peek && !r.dis) MBTN(i); return r; }, [re.source, peek]);
// answer the questions, see the summary, graduate (college), pick up the keys
async function skipThrough(page, picks = [/Study hard/, /Friends/, /Work part-time|Family first/]) {
  assert.match(await sheetTitle(page), /Skip to 18\?/);
  await sheetBtn(page, /Skip to 18/);
  let n = 0;
  while (/Skip to 18 · /.test(await sheetTitle(page))) { assert.ok(await sheetBtn(page, picks[n] || /Study hard/), 'a choice'); n++; }
  assert.ok(n >= 2 && n <= 3, `2–3 questions, got ${n}`);
  const sum = await sheetText(page);
  assert.match(sum, /The years go by/); assert.match(sum, /Money/); assert.match(sum, /Grades/); assert.match(sum, /Family/); assert.match(sum, /Friends/); assert.match(sum, /school days?/);
  assert.match(sum, /to 18/);
  await sheetBtn(page, /On to graduation/);
  assert.match(await sheetText(page), /Graduation/);
  await sheetBtn(page, /What’s next/);
  await sheetBtn(page, /College/);
  await sheetBtn(page, /Pick up the keys/);
  return sum;
}
// an adult action works and a day ends
async function playOn(page) {
  return page.evaluate(() => { closeModals(); S.loc = 'home'; render();
    const a = actionsHere().find(x => !x.dis && x.fn && /Cook|Rest|Call home/.test(x.l)); const t0 = S.t; a.fn(); closeModals();
    const d0 = day(); endDay('home'); for (let i = 0; i < 20 && document.getElementById('mbg'); i++) { const bs = [...document.querySelectorAll('#mbg .modal > button.act')]; const j = bs.findIndex(b => !b.disabled); if (j < 0) break; MBTN(j); }
    return { act: a.l, moved: S.t > t0, d0, d: day(), over: S.over, grow: isGrow(), mode: S.mode, age: S.age, grad: S.life.graduated, path: S.life.path, apt: !!(S.rent && typeof S.rent.amt === 'number') }; });
}

module.exports = [
  ...[12, 15].map(age => ({ name: `Skip to 18 from a Lifetime started at ${age}: two or three choices, a summary, graduation, then the adult game`, fn: async ctx => {
    const { page, errors } = await open(ctx);
    await growGame(page, 'life', age);
    await page.evaluate(() => gameOptionsModal());
    const b = await sheetBtn(page, /Skip to 18/, true);
    assert.ok(b && !b.dis, 'Skip to 18 is on: ' + (b && b.s));
    await sheetBtn(page, /Skip to 18/);
    const before = await page.evaluate(() => ({ kwi: S.kwi, money: S.money }));
    await skipThrough(page);
    const st = await page.evaluate(() => ({ grow: isGrow(), age: S.age, mode: S.mode, kwi: S.kwi, kind: lifeKw().kind, grad: S.life.graduated, path: S.life.path, skipped: S.keyWeeks.filter(k => k.skipped).length,
      bday: lifeBday(S, 18), cur: day(), stages: S.life.stages.map(x => x.stage), moment: S.life.moments.some(m => m.ic === '⏩') }));
    assert.strictEqual(st.grow, false); assert.strictEqual(st.age, 18); assert.strictEqual(st.mode, 'adult'); assert.strictEqual(st.grad, true); assert.strictEqual(st.path, 'college');
    assert.ok(st.kwi > before.kwi, 'a later key week'); assert.ok(st.cur > st.bday, 'after the 18th birthday'); assert.ok(['graduation', 'movein'].includes(st.kind), st.kind);
    assert.ok(st.skipped > 0); assert.ok(st.stages.includes('adult')); assert.ok(st.moment);
    if (age === 12) assert.ok(st.stages.includes('high'), 'high school on the way');
    const r = await playOn(page);
    assert.ok(r.moved, 'the action took time'); assert.strictEqual(r.over, false); assert.ok(r.d > r.d0, 'the day ended'); assert.strictEqual(r.grow, false); assert.strictEqual(r.age, 18);
    // and it carries on: the next key week plays as an adult
    const r2 = await page.evaluate(() => { const k = S.kwi; lifeFF(1); return { kwi: S.kwi, k, grow: isGrow(), over: S.over }; });
    assert.ok(r2.kwi > r2.k && !r2.grow && !r2.over);
    noErrors(errors);
  } })),
  { name: 'Skip to 18 is grayed out in Quick play, at 18+, and when the game ends before 18', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await growGame(page, 'quick', 12);
    await page.evaluate(() => gameOptionsModal());
    let b = await sheetBtn(page, /Skip to 18/, true);
    assert.ok(b && b.dis); assert.match(b.s, /Quick play/);
    await growGame(page, 'life', 18);
    await page.evaluate(() => gameOptionsModal());
    b = await sheetBtn(page, /Skip to 18/, true);
    assert.ok(b && b.dis); assert.match(b.s, /already 18/);
    await growGame(page, '1y', 15);
    await page.evaluate(() => gameOptionsModal());
    b = await sheetBtn(page, /Skip to 18/, true);
    assert.ok(b && b.dis); assert.match(b.s, /before you turn 18/);
    // calling it anyway changes nothing
    const r = await page.evaluate(() => { closeModals(); const a = S.age, d = day(); skip18Start(); return { a, d, age: S.age, day: day(), t: document.querySelector('#mbg .modal').innerText }; });
    assert.strictEqual(r.age, r.a); assert.strictEqual(r.day, r.d); assert.match(r.t, /before you turn 18/);
    // a Growing Up game that reached 18 the normal way: grayed too
    await growGame(page, 'life', 15);
    const g = await page.evaluate(() => { closeModals(); let guard = 0; while (isGrow() && guard++ < 40) lifeFF(1); closeModals(); gameOptionsModal();
      const bs = [...document.querySelectorAll('#mbg .modal > button.act')], x = bs.find(x => /Skip to 18/.test(x.textContent)); return { grow: isGrow(), age: S.age, dis: x.disabled, s: x.textContent }; });
    assert.strictEqual(g.grow, false); assert.ok(g.dis); assert.match(g.s, /already 18/);
    noErrors(errors);
  } },
  { name: '18+ mode under 18: refused without skipping; Skip to 18 then turns it on; off hides every adult option', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await page.evaluate(() => setPref('age18', true));
    await growGame(page, 'life', 15);
    await page.evaluate(() => gameOptionsModal());
    await sheetBtn(page, /18\+ mode/);
    let t = await sheetText(page);
    assert.match(t, /You’re 15 in this save/); assert.match(t, /Turn on automatically at 18/); assert.match(t, /Start a new adult save/); assert.match(t, /Skip to 18/);
    // not turned on by itself, and relActive refuses even if the flag is forced on a kid's save
    let r = await page.evaluate(() => ({ on: S.rel.on, act: relActive(), tab: allTabs().some(x => x[0] === 'rel') }));
    assert.deepStrictEqual(r, { on: false, act: false, tab: false });
    r = await page.evaluate(() => { const o = S.rel.on; S.rel.on = true; const x = { act: relActive(), tab: allTabs().some(x => x[0] === 'rel') }; S.rel.on = o; return x; });
    assert.deepStrictEqual(r, { act: false, tab: false });
    // Back from the confirm returns to the 18+ sheet
    await sheetBtn(page, /Skip to 18/);
    assert.match(await sheetTitle(page), /Skip to 18\?/);
    await sheetBtn(page, /^Back/);
    assert.match(await sheetText(page), /You’re 15 in this save/);
    await sheetBtn(page, /Skip to 18/);
    await skipThrough(page);
    r = await page.evaluate(() => ({ grow: isGrow(), age: S.age, on: S.rel.on, act: relActive(), tab: allTabs().some(x => x[0] === 'rel'), log: S.rel.log.map(x => x.to + ':' + x.why), said: S.log.slice(-30).some(l => /18\+ mode is on now/.test(JSON.stringify(l))) }));
    assert.strictEqual(r.grow, false); assert.strictEqual(r.age, 18); assert.strictEqual(r.on, true); assert.strictEqual(r.act, true); assert.strictEqual(r.tab, true);
    assert.ok(r.log.includes('on:skip to 18'), r.log.join()); assert.ok(r.said, 'a line in the log');
    const p = await playOn(page);
    assert.strictEqual(p.over, false); assert.ok(p.d > p.d0);
    // switch off: no ❤️ tab, no adult actions, no adult events waiting
    r = await page.evaluate(() => { closeModals(); gameOptionsModal(); const bs = [...document.querySelectorAll('#mbg .modal > button.act')], i = bs.findIndex(b => /18\+ mode: On/.test(b.textContent)); MBTN(i); closeModals();
      render(); return { on: S.rel.on, act: relActive(), tab: allTabs().some(x => x[0] === 'rel'), tabBtn: [...document.querySelectorAll('button')].some(b => /❤️/.test(b.textContent)), love: actionsHere().filter(a => a.cat === 'love').length,
        pend: (S.ev.pending || []).filter(x => /^rel_/.test(x.id)).length }; });
    assert.deepStrictEqual(r, { on: false, act: false, tab: false, tabBtn: false, love: 0, pend: 0 });
    noErrors(errors);
  } },
];
