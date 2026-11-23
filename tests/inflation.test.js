const { open, noErrors, assert } = require('./helpers');

// Prices (src/js/38-prices.js): the price level rises every January in the longer adult games; rp() follows it.
async function startLife(page, length, job = 'cafe') {
  await page.evaluate(([length, job]) => {
    closeModals(); setMode('adult');
    LIFE_PICK = length === 'quick' ? null : { length, startAge: 18, birthday: { m: 3, d: 14, label: 'March 14' } };
    newGame('normal'); closeModals(); pickJob(job); closeModals(); tab = 'act'; render();
  }, [length, job]);
}

module.exports = [
  { name: 'the price level rises every January in a long game, with a city news line', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await startLife(page, 'life');
    const r = await page.evaluate(() => {
      const y0 = dateOf(0).y, lv0 = S.prices, out = [];
      priceDay(0, out);
      const j1 = dayIndexOf(y0 + 1, 1, 1), j3 = dayIndexOf(y0 + 3, 1, 1);
      priceDay(j1 - 1, out); const before = S.prices;
      for (let d = j1; d <= j3 + 5; d++) priceDay(d, out);
      const pcts = [1, 2, 3].map(k => pricePct(y0 + k)), want = pcts.reduce((a, p) => a * (1 + p / 100), 1);
      return { lv0, before, lv: S.prices, want, pcts, out, y: S.pricesY, y0 };
    });
    assert.strictEqual(r.lv0, 1);
    assert.strictEqual(r.before, 1, 'no rise before the first January');
    assert.ok(r.pcts.every(p => p >= 2.5 && p <= 3.5), r.pcts.join());
    assert.ok(Math.abs(r.lv - r.want) < 1e-3, `${r.lv} vs ${r.want}`);
    assert.strictEqual(r.y, r.y0 + 3);
    assert.strictEqual(r.out.length, 3, r.out.join('\n'));
    assert.ok(r.out.every(l => /^<b>City news<\/b> · 🛒 Prices are up [\d.]+% on a year ago/.test(l)), r.out.join('\n'));
    // a time skip across January: the summary has the city news and what everyday life cost
    const s = await page.evaluate(() => { const y = S.pricesY, j = dayIndexOf(y + 1, 1, 1), lv = S.prices;
      const n = lifeSimulate(j - 20, j + 20, 'save'); return { n, rose: S.prices > lv, rows: lifeSnapRows().map(x => x[0]) }; });
    assert.ok(s.rose);
    assert.ok(s.n.some(l => /City news.*Prices are up/.test(l)), s.n.join('\n'));
    assert.ok(s.n.some(l => /^🛒 Everyday life cost \$[\d,]+ while you were away.*prices are up \d+% since you got your own place/.test(l)), s.n.join('\n'));
    assert.ok(s.rows.includes('🛒 Prices since your own place'));
    noErrors(errors);
  } },
  { name: 'everyday prices follow the level: groceries, fares, tuition, skip costs', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await startLife(page, 'life');
    const r = await page.evaluate(() => {
      const g0 = rp(42), fare0 = hoodFare('home', 'fh_main'), fee0 = priceAmt(380);
      S.rent.paid = true; const live0 = lifeLiving('', day());
      S.prices = 1.5;
      const g1 = rp(42), fare1 = hoodFare('home', 'fh_main'), fee1 = priceAmt(380), live1 = lifeLiving('', day());
      S.loc = 'mlk'; S.t = day() * 1440 + 600; const groc = actionsHere().find(a => /Groceries/.test(a.l));
      return { g0, g1, fare0, fare1, fee0, fee1, live0, live1, groc: groc && groc.l };
    });
    assert.strictEqual(r.g0, 42); assert.strictEqual(r.g1, 63);
    assert.ok(r.fare1 > r.fare0, JSON.stringify(r));
    assert.deepStrictEqual([r.fee0, r.fee1], [380, 570]);
    assert.ok(r.live1 > r.live0, JSON.stringify(r));
    assert.match(r.groc || '', /\$63/);
    noErrors(errors);
  } },
  { name: 'rent and wages do not follow the price level', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await startLife(page, 'life', 'hospital');
    const r = await page.evaluate(() => {
      const rent0 = S.rent.amt, shift0 = careerShift(), pay0 = job().pay * lifePayF();
      S.prices = 2; const out = []; const y = dateOf(day()).y; priceDay(dayIndexOf(y + 2, 1, 15), out);
      S.loc = 'home'; S.rent.paid = false; S.t = day() * 1440 + 600; const pr = actionsHere().find(a => /Pay rent/.test(a.l));
      return { rent0, rent1: S.rent.amt, shift0, shift1: careerShift(), pay0, pay1: job().pay * lifePayF(), pr: pr && pr.l, lv: S.prices };
    });
    assert.ok(r.lv > 2, 'the level rose');
    assert.strictEqual(r.rent1, r.rent0);
    assert.strictEqual(r.shift1, r.shift0);
    assert.strictEqual(r.pay1, r.pay0);
    assert.ok(r.pr && r.pr.includes('$' + r.rent0.toLocaleString('en-US')), r.pr);
    noErrors(errors);
  } },
  { name: 'Quick play stays at 1.0', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await startLife(page, 'quick');
    const r = await page.evaluate(() => {
      const out = []; for (let d = 0; d < 14; d++) priceDay(d, out); priceDay(400, out);
      const lv = priceLv(), g = rp(42); S.prices = 3; return { lv, g, g2: rp(42), lv2: priceLv(), out, p: S.prices };
    });
    assert.deepStrictEqual([r.lv, r.g, r.g2, r.lv2, r.out.length], [1, 42, 42, 1, 0]);
    noErrors(errors);
  } },
  { name: 'an old save without a price level loads at 1.0 and starts rising next January', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await startLife(page, 'life');
    const r = await page.evaluate(() => {
      const d = JSON.parse(JSON.stringify(packSave())); delete d.S.prices; delete d.S.pricesY;
      const m = migrate(d); adopt(m); closeModals();
      const lv = S.prices, g = rp(42), y = dateOf(day()).y;
      priceDay(day(), null); const y1 = S.pricesY, lv1 = S.prices;
      priceDay(dayIndexOf(y + 1, 1, 2), []);
      return { lv, g, y, y1, lv1, lv2: S.prices };
    });
    assert.deepStrictEqual([r.lv, r.g, r.y1, r.lv1], [1, 42, r.y, 1]);
    assert.ok(r.lv2 >= 1.025 && r.lv2 <= 1.035, String(r.lv2));
    noErrors(errors);
  } },
];
