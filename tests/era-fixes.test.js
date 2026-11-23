const { open, noErrors, assert } = require('./helpers');

// Era fixes: the right wage at 16, no phone grabs before cell phones.
async function start(page, year, age) {
  await page.evaluate(([year, age]) => {
    closeModals(); setMode(age < 18 ? 'grow' : 'adult');
    LIFE_PICK = { length: 'life', startAge: age, startYear: year, birthday: { m: 3, d: 14, label: 'March 14' } };
    newGame('normal'); closeModals();
    if (age >= 18) { pickJob('cafe'); closeModals(); }
    tab = 'act'; render();
  }, [year, age]);
}
// open the Growing Up job sheet the way a player does: ask about the part-time job at the first job place
const SHEET = `(() => { S.age = 16; const J = Object.values(GROW.hoods.JOBS)[0]; S.loc = J.at; S.t = S.cur * 1440 + 800;
  const a = actionsHere().find(x => /part-time job/.test(x.l)); a.fn();
  const t = document.getElementById('mbg').innerText; closeModals(); return t; })()`;
const sheet = async page => ({ t: await page.evaluate(SHEET), wage: await page.evaluate(() => GROW.hoods.wage()) });
// run lev_phone, with its text and choices, in the open and zipped versions
const grab = page => page.evaluate(() => {
  const e = EV.find(x => x.id === 'lev_phone'), out = {}, said = [];
  const s0 = say; say = (...a) => { said.push(a[0]); return s0(...a); };
  try {
    for (const z of [false, true]) {
      S.lev = S.lev || {}; S.lev.zip = z; said.length = 0;
      e.run({ at: 'dt_pacific', from: 'link' });
      const ch = e.choices();
      out[z ? 'zip' : 'open'] = [...said, e.tile.join(' '), ...ch.map(c => c.l + ' ' + c.s)].join('\n');
    }
  } finally { say = s0; }
  return out;
});

module.exports = [
  { name: 'the Growing Up job sheet at 16 shows the start year’s wage, the one actually paid', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page, 1990, 15);
    const r = await sheet(page);
    Object.assign(r, await page.evaluate(() => { const m0 = S.money; GROW.hoods.earn(10); return { mw: eraMinWage(dateOf(day()).y), paid: Math.round((S.money - m0) * 100) / 100 } }));
    assert.strictEqual(r.wage, 4.25); assert.strictEqual(r.wage, r.mw);
    assert.match(r.t, /\$4\.25 an hour/); assert.doesNotMatch(r.t, /17\.13/);
    assert.strictEqual(r.paid, 10, 'a wage is paid as it is, not scaled twice');
    await start(page, 2026, 15);
    const n = await sheet(page);
    assert.strictEqual(n.wage, 17.13); assert.match(n.t, /\$17\.13 an hour/);
    noErrors(errors);
  } },
  { name: 'pocket money text in Growing Up matches the year’s dollars', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page, 1990, 15);
    const a = await page.evaluate(() => [gAmt(10), gAmt(56)]);
    assert.ok(a[0] < 10 && a[1] < 56, a.join());
    await start(page, 2026, 15);
    assert.deepStrictEqual(await page.evaluate(() => [gAmt(10), gAmt(56)]), [10, 56]);
    noErrors(errors);
  } },
  { name: 'the downtown grab in 1980 is a wallet at the bus stop: no phone, no Link', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page, 1980, 18);
    const cond = await page.evaluate(() => { S.t = S.cur * 1440 + 800; S.loc = 'dt_pacific'; return !!EV.find(x => x.id === 'lev_phone').cond({ hook: 'arrive', at: 'dt_pacific', from: 'link' }); });
    assert.ok(cond, 'it can still happen');
    const o = await grab(page);
    for (const k of ['open', 'zip']) {
      assert.doesNotMatch(o[k], /phone|\btext|Link|T Line|refurbished/i, k + ': ' + o[k]);
      assert.match(o[k], /wallet|bus/i);
    }
    noErrors(errors);
  } },
  { name: 'the grab in 2026 is unchanged', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page, 2026, 18);
    const o = await grab(page);
    assert.match(o.open, /phone/); assert.match(o.open, /Link stop/); assert.match(o.open, /refurbished phone/);
    assert.match(o.zip, /Your phone is right where you put it/);
    noErrors(errors);
  } },
];
