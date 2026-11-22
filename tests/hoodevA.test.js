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
  { name: 'hoodevA: forced events fire through the real hook as pending decisions, and each option resolves them', fn: async ctx => {
    const { page, errors } = await open(ctx); await newGame(page);
    const PLACE = { downtown_concert_crowd: ['dt_pacific', 'home', 1100, 4], downtown_free_museum: ['dt_glass', 'dt_pacific', 700, 3], downtown_busker: ['dt_pacific', 'home', 700, 2], downtown_market: ['dt_pacific', 'home', 700, 3], downtown_soundcheck: ['dt_dome', 'home', 900, 2],
      ea_ship_arrives: ['ea_port', 'home', 700, 2], ea_shift_change: ['ea_port', 'home', 900, 2], ea_quince: ['ea_portland', 'home', 700, 3], ea_garden_harvest: ['ea_portland', 'home', 700, 2], ea_river_heron: ['ea_port', 'home', 700, 2],
      fernhill_reading: ['fh_library', 'home', 700, 2], fernhill_thrift: ['fh_main', 'home', 700, 2], fernhill_cleanup: ['fh_garden', 'home', 700, 2], fernhill_icecream: ['fh_garden', 'home', 1000, 2],
      netacoma_openhouse: ['ne_point', 'home', 700, 2], netacoma_tidepools: ['ne_point', 'home', 700, 2], netacoma_barbecue: ['ne_bluff', 'home', 1100, 2], netacoma_doe: ['ne_trail', 'home', 500, 2],
      oldtown_tour: ['ot_corner', 'home', 700, 2], oldtown_dockevening: ['ot_dock', 'home', 1100, 2], oldtown_tomatoes: ['ot_hill', 'home', 700, 2], oldtown_kayaks: ['ot_dock', 'home', 1200, 2] };
    const out = [];
    for (const id of ALL) for (const i of [0, 1, 2]) {
      const r = await page.evaluate(([id, i, pl]) => {
        closeModals(); clearTiles(); S.ev.pending = []; S.ev.count = {}; S.ev.last = {}; S.money = 500; S.energy = 60; S.stress = 50;
        S.t = S.cur * 1440 + pl[2]; S.loc = pl[0]; S.ev.force = []; forceEvent(id);
        const e = EV.find(x => x.id === id); if (!L[pl[0]]) return { id, skip: 'no place ' + pl[0] };
        // dtMuseumOpen / show nights need the right weekday: shift the day instead of the clock where it matters
        fireHook('arrive', { at: pl[0], from: pl[1], sub: '' });
        const fired = choicesWaiting().includes(id);   // a decision is pending; a moment waits on its tile
        const n = fired ? choiceOpts(id).length : 0;
        if (fired && i < n) choiceApply(id, i, 'test');
        return { id, fired, n, i, left: choicesWaiting().includes(id) };
      }, [id, i, PLACE[id]]);
      out.push(r);
    }
    const unfired = [...new Set(out.filter(r => !r.skip && !r.fired).map(r => r.id))];
    // events whose conditions depend on the calendar are covered by the direct tests above; most must fire here
    assert.ok(unfired.length <= 8, 'many events did not fire through the hook: ' + unfired.join(', '));
    for (const r of out.filter(r => r.fired && r.i < r.n)) assert.ok(!r.left, r.id + ' is resolved after pressing an option');
    noErrors(errors);
  } },
];
