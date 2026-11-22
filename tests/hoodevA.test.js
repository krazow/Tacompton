const { open, newGame, noErrors, assert } = require('./helpers');

const BAD = /\b(fish\w*|salmon|marina|charter|wdfw|chinook|coho|herring|romanc\w*|dating|date night|girlfriend|boyfriend|kiss\w*|sweetheart|flirt\w*|crush)\b/i;
const IDS = {
  social: ['downtown_concert_crowd', 'downtown_free_museum', 'downtown_market', 'ea_shift_change', 'fernhill_reading', 'fernhill_thrift', 'netacoma_openhouse', 'netacoma_barbecue', 'oldtown_tour', 'oldtown_tomatoes', 'fernhill_icecream', 'ea_garden_harvest'],
  chain: ['ea_quince', 'fernhill_cleanup'],
  ambient: ['downtown_busker', 'downtown_soundcheck', 'ea_ship_arrives', 'ea_river_heron', 'netacoma_tidepools', 'netacoma_doe', 'oldtown_dockevening', 'oldtown_kayaks'],
};
const ALL = [].concat(IDS.social, IDS.chain, IDS.ambient);

// Press every option of an event (restoring the state between them); returns what each one did.
const probe = id => {
  closeModals(); S.money = 500; S.energy = 60; S.stress = 50; S.loc = 'home'; S.t = day() * 1440 + 700;
  const e = EV.find(x => x.id === id), res = { id, n: 0, kinds: [], text: '', dflt: e && e.dflt, adult: null, errs: [] };
  if (!e) { res.errs.push('missing'); return res; }
  res.adult = /isGrow/.test(String(e.cond));
  const base = JSON.stringify(S), key = () => JSON.stringify([S.stress, S.energy, S.money, S.food, S.t, S.stats && S.stats.meals, S.community, S.stats && S.stats.neighbors]);
  const opts = e.choices();
  res.n = opts.length; res.labels = opts.map(o => o.l + ' ' + o.s);
  for (let i = 0; i < opts.length; i++) {
    S = JSON.parse(base);
    try { const o = e.choices()[i]; const k0 = key(); o.fn(); res.kinds.push(key() === k0 ? 'same' : key()); res.text += document.body.innerText + JSON.stringify(S.log || ''); closeModals(); }
    catch (err) { res.errs.push(i + ': ' + err.message); }
  }
  S = JSON.parse(base);
  return res;
};

module.exports = [
  { name: 'hoodevA: all 22 events in the five neighborhoods offer choices, with a default and the adult-only condition', fn: async ctx => {
    const { page, errors } = await open(ctx); await newGame(page);
    const r = await page.evaluate(ids => ids.map(id => { const e = EV.find(x => x.id === id); return { id, has: !!e && typeof e.choices === 'function', n: e && e.choices().length, dflt: e && e.dflt, grow: e && /isGrow/.test(String(e.cond)) }; }), ALL);
    assert.strictEqual(ALL.length, 22);
    for (const x of r) {
      assert.ok(x.has, x.id + ' has choices'); assert.ok(x.n >= 2 && x.n <= 3, x.id + ' offers 2–3 options');
      assert.ok(Number.isInteger(x.dflt) && x.dflt >= 0 && x.dflt < x.n, x.id + ' has a default');
      assert.ok(x.grow, x.id + ' stays adult-only');
    }
    noErrors(errors);
  } },
  { name: 'hoodevA: every option of every event runs, and the options do different things', fn: async ctx => {
    const { page, errors } = await open(ctx); await newGame(page);
    const rs = await page.evaluate(({ src, ids }) => ids.map(eval(src)), { src: probe.toString(), ids: ALL });
    for (const r of rs) {
      assert.deepStrictEqual(r.errs, [], r.id + ' errors');
      assert.ok(new Set(r.kinds).size >= 2, r.id + ' options differ: ' + r.kinds.join(' | '));
      assert.ok(!BAD.test(r.labels.join(' ')), r.id + ' option text has a banned word');
    }
    noErrors(errors);
  } },
  { name: 'hoodevA: ambient moments are Stop and watch / Keep going, with Keep going as the default', fn: async ctx => {
    const { page, errors } = await open(ctx); await newGame(page);
    const r = await page.evaluate(ids => ids.map(id => { const e = EV.find(x => x.id === id), o = e.choices(); const base = JSON.stringify(S), k = () => [S.stress, S.t].join(); const a = k(); o[0].fn(); const watched = k(); S = JSON.parse(base); const b = k(); o[1].fn(); const kept = k(); S = JSON.parse(base); return { id, n: o.length, dflt: e.dflt, watched: watched !== a, kept: kept === b, l: o.map(x => x.l).join('|') }; }), IDS.ambient);
    for (const x of r) { assert.strictEqual(x.n, 2, x.id); assert.strictEqual(x.dflt, 1, x.id + ' defaults to keep going'); assert.ok(x.watched, x.id + ' watching changes something'); assert.ok(x.kept, x.id + ' keep going is free'); assert.ok(/watch/i.test(x.l), x.id); }
    noErrors(errors);
  } },
  { name: 'hoodevA: chains remember the choice (quince invitation shapes the garden, the cleanup shapes the ice-cream social)', fn: async ctx => {
    const { page, errors } = await open(ctx); await newGame(page);
    const r = await page.evaluate(() => {
      closeModals(); const out = {};
      const q = EV.find(x => x.id === 'ea_quince'), g = EV.find(x => x.id === 'ea_garden_harvest'), c = EV.find(x => x.id === 'fernhill_cleanup'), ic = EV.find(x => x.id === 'fernhill_icecream');
      const base = JSON.stringify(S);
      q.choices()[0].fn(); out.q = eventFlag('ea_quince'); out.gGoing = g.choices()[0].s;
      S = JSON.parse(base); q.choices()[2].fn(); out.qNo = eventFlag('ea_quince'); out.gNo = g.choices()[0].s;
      S = JSON.parse(base); c.choices()[0].fn(); out.c = eventFlag('fh_cleanup'); out.icW = ic.choices()[0].s;
      S = JSON.parse(base); out.icN = ic.choices()[0].s; return out;
    });
    assert.strictEqual(r.q, 'going'); assert.strictEqual(r.qNo, 'no'); assert.notStrictEqual(r.gGoing, r.gNo, 'garden reflects the RSVP');
    assert.strictEqual(r.c, 'worked'); assert.notStrictEqual(r.icW, r.icN, 'ice-cream social reflects the cleanup');
    noErrors(errors);
  } },
  { name: 'hoodevA: choices that cost money are disabled when you are broke', fn: async ctx => {
    const { page, errors } = await open(ctx); await newGame(page);
    const r = await page.evaluate(() => { S.money = 0; return ['downtown_market', 'fernhill_thrift'].map(id => EV.find(x => x.id === id).choices().filter(o => o.dis).length); });
    assert.deepStrictEqual(r, [1, 1]);
    noErrors(errors);
  } },
];
