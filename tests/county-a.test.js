const { open, newGame, noErrors, assert } = require('./helpers');

// Pierce County, south and west (src/js/23-county-up/lakewood/fife/puyallup/parkland.js)
const KEYS = ['univplace', 'lakewood', 'fife', 'puyallup', 'parkland'];
const BAD = /\b(fish\w*|salmon|marina|charter|wdfw|chinook|coho|herring|romanc\w*|dating|date night|girlfriend|boyfriend|kiss\w*|sweetheart|flirt\w*|crush)\b/i;
const EVS = ['up_train', 'up_pruning', 'up_lostball', 'lw_flyover', 'lw_homecoming', 'lw_lostdog', 'fi_bigship', 'fi_newtruck', 'fi_jam',
  'pu_fairday', 'pu_daffodil', 'pu_sirens', 'pk_christmas', 'pk_graduation', 'pk_geese'];

async function start(page, year, len = 'life') {
  await page.evaluate(([year, len]) => {
    closeModals(); setMode('adult');
    LIFE_PICK = { length: len, startAge: 18, startYear: year, birthday: { m: 3, d: 14, label: 'March 14' } };
    newGame('normal'); closeModals(); pickJob('cafe'); closeModals(); tab = 'act'; render();
    window.__countyOn0 = window.countyOn; window.countyOn = () => true;   // the engine (72-county.js) decides; here, open
  }, [year, len]);
}
// move the clock to a date (keeps the start year)
const goTo = (page, y, m, d, t = 720) => page.evaluate(([y, m, d, t]) => {
  for (let i = 0; i < 40000; i++) { const o = dateOf(i); if (o.y === y && o.m === m && o.d === d) { S.t = i * 1440 + t; S.cur = i; return i; } }
  return -1;
}, [y, m, d, t]);

module.exports = [
  { name: 'county A: five area packs with 4 places, hubs, neighbors, rides, guide text and art by day and night', fn: async ctx => {
    const { page, errors } = await open(ctx); await newGame(page);
    const r = await page.evaluate(keys => keys.map(k => { const h = HOODS[k]; if (!h) return { k, missing: true };
      return { k, county: h.county, startable: h.startable, places: Object.keys(h.places), hubOk: !!L[h.hub] && L[h.hub].hood === k, nb: (h.neighbors || []).length,
        ride: Object.assign({}, h.ride, h.ride0 ? { via: h.ride0.via } : {}), guide: typeof h.guide === 'string' ? h.guide : '',
        art: Object.keys(h.places).every(p => /<(rect|path|circle|polygon)/.test(L[p].art({ night: false })) && /<(rect|path|circle|polygon)/.test(L[p].art({ night: true })) && L[p].art({ night: true }) !== L[p].art({ night: false })) }; }), KEYS);
    for (const h of r) {
      assert.ok(!h.missing, h.k + ' is registered');
      assert.strictEqual(h.county, true, h.k + ' is a county pack'); assert.strictEqual(h.startable, true, h.k + ' is startable');
      assert.ok(h.places.length >= 4 && h.places.length <= 6, h.k + ' has 4–6 places');
      assert.ok(h.hubOk, h.k + ' hub'); assert.ok(h.nb >= 2 && h.nb <= 4, h.k + ' neighbors');
      assert.strictEqual(h.ride.via, 'bus'); assert.ok(h.ride.mins >= 20 && h.ride.drive > 0 && h.ride.drive < h.ride.mins, h.k + ' ride and drive');
      assert.ok(h.guide.length > 80 && !BAD.test(h.guide), h.k + ' guide text'); assert.ok(h.art, h.k + ' art');
    }
    noErrors(errors);
  } },
  { name: 'county A: hidden until the county is open (Quick play keeps to Tacoma), and out of the Tacoma-only lists', fn: async ctx => {
    const { page, errors } = await open(ctx); await newGame(page);
    const r = await page.evaluate(keys => {
      const ks = keys.flatMap(k => Object.keys(HOODS[k].places)), real = window.countyOn;
      const shut = ks.every(k => L[k].hidden); window.countyOn = () => true; const openAll = ks.every(k => !L[k].hidden);
      window.countyOn = () => false; const off = ks.every(k => L[k].hidden); window.countyOn = real;
      const ach = ACH.find(a => a.id === 'tacoma'); S.hoods = {}; Object.keys(HOODS).filter(h => !HOODS[h].county).forEach(h => S.hoods[h] = 1);
      return { shut, openAll, off, ach: ach.test(), dests: msgRideDests().filter(k => ks.includes(k)).length };
    }, KEYS);
    assert.ok(r.shut, 'hidden with no county engine or a closed county'); assert.ok(r.openAll, 'shown when countyOn()'); assert.ok(r.off, 'hidden when countyOn() is false');
    assert.ok(r.ach, 'All Over Tacoma needs only the Tacoma neighborhoods'); assert.strictEqual(r.dests, 0, 'no friend rides to a closed county');
    noErrors(errors);
  } },
  { name: 'county A: every place renders and every action runs, day and night, in 2026 and 1980, with no banned words', fn: async ctx => {
    const { page, errors } = await open(ctx);
    for (const y of [2026, 1980]) {
      await start(page, y);
      const r = await page.evaluate(keys => {
        closeModals(); const bad = []; let acts = 0, text = '';
        for (const h of keys) for (const k of Object.keys(HOODS[h].places)) for (const t of [600, 1000, 1300]) for (const dd of [0, 40]) {
          const snap = JSON.stringify(S), d0 = day();
          S.loc = k; S.cur = d0 + dd; S.t = (d0 + dd) * 1440 + t; S.money = 2000; render(); text += document.body.innerText;
          const a = actionsHere().filter(x => !x.dis && !/Wait a while/.test(x.l));
          for (const x of a) { if (!/sunset|Sun/.test(x.l + x.s) && x.cat !== 'work') text += x.l + ' ' + x.s; try { x.fn(); acts++; closeModals(); text += document.body.innerText; } catch (e) { bad.push(k + ': ' + x.l + ': ' + e.message); } S = JSON.parse(snap); S.loc = k; S.cur = d0 + dd; S.t = (d0 + dd) * 1440 + t; }
          S = JSON.parse(snap);
        }
        return { bad, acts, text };
      }, KEYS);
      assert.deepStrictEqual(r.bad, [], y + ' actions');
      assert.ok(r.acts >= 80, y + ' county actions ran: ' + r.acts);
      assert.doesNotMatch(r.text, BAD);
    }
    noErrors(errors);
  } },
  { name: 'county A: the era: Chambers Bay from 2007, Villa Plaza to Lakewood Mall to Towne Center, Fort Lewis before JBLM, the Puyallup Fair before 2013', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page, 1980);
    const state = () => page.evaluate(() => ({ y: yearNow(), ch: L.up_chambers.hidden, or: L.up_orchard.hidden, mall: L.lw_towne.name, gate: L.lw_gate.desc, fair: HOODS.puyallup.fairName(),
      hub: ['up_bridgeport', 'lw_towne', 'fi_hwy', 'pu_pioneer', 'pk_garfield'].every(k => !L[k].hidden), towneArt: L.lw_towne.art({ night: false }) }));
    const a = await state();
    assert.strictEqual(a.y, 1980); assert.ok(a.ch && a.or, 'no Chambers Bay or orchard park in 1980'); assert.strictEqual(a.mall, 'Villa Plaza'); assert.match(a.towneArt, /VILLA PLAZA/);
    assert.match(a.gate, /Fort Lewis and McChord/); assert.strictEqual(a.fair, 'Puyallup Fair'); assert.ok(a.hub, 'every hub is there in 1980');
    await goTo(page, 1995, 3, 1); const b = await state();
    assert.strictEqual(b.mall, 'Lakewood Mall'); assert.ok(b.ch && b.or);
    await goTo(page, 2001, 6, 1); assert.match((await state()).mall, /old Lakewood Mall site/);
    await goTo(page, 2002, 8, 2); const c = await state(); assert.strictEqual(c.mall, 'Lakewood Towne Center'); assert.ok(!c.or && c.ch, 'the orchard park, not yet Chambers Bay');
    await goTo(page, 2007, 6, 22); assert.ok((await state()).ch, 'Chambers Bay the day before it opens');
    await goTo(page, 2007, 6, 23); assert.ok(!(await state()).ch, 'Chambers Bay opens June 23, 2007');
    await goTo(page, 2010, 2, 1); assert.match((await state()).gate, /Joint Base Lewis-McChord/);
    await goTo(page, 2013, 9, 10); const d = await state(); assert.strictEqual(d.fair, 'Washington State Fair');
    // a 2026 start has all of it
    await start(page, 2026); const e = await state();
    assert.ok(!e.ch && !e.or); assert.strictEqual(e.mall, 'Lakewood Towne Center'); assert.match(e.gate, /Joint Base/);
    noErrors(errors);
  } },
  { name: 'county A: the fair is a September thing: scones, the coaster, the barns and the fair-day event', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page, 2026);
    const acts = () => page.evaluate(() => { S.loc = 'pu_fair'; S.money = 2000; return { l: actionsHere().map(a => a.l + ' | ' + a.s), name: L.pu_fair.name, ev: EV.find(e => e.id === 'pu_fairday').cond({ at: 'pu_fair' }) }; });
    await goTo(page, 2026, 8, 20, 720); const aug = await acts();
    assert.ok(aug.l.some(l => /quiet fairgrounds/.test(l)) && !aug.l.some(l => /scones/.test(l)), aug.l.join(' / ')); assert.strictEqual(aug.ev, false); assert.strictEqual(aug.name, 'The fairgrounds');
    await goTo(page, 2026, 9, 12, 720); const sep = await acts();
    for (const re of [/Washington State Fair/, /scones/, /roller coaster/, /animal barns/]) assert.ok(sep.l.some(l => re.test(l)), re + ' in ' + sep.l.join(' / '));
    assert.strictEqual(sep.ev, true); assert.match(sep.name, /Washington State Fair/);
    await goTo(page, 2026, 9, 12, 1380); assert.strictEqual((await acts()).ev, false, 'closed at 11 PM');
    noErrors(errors);
  } },
  { name: 'county A: 15 events, adult-only, each with 2–4 options and a default, and every option runs', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page, 2026);
    const r = await page.evaluate(ids => ids.map(id => {
      const e = EV.find(x => x.id === id); if (!e) return { id, missing: true };
      const base = JSON.stringify(S), errs = []; let labels = '';
      S.money = 500; const n = e.choices().length, snap = JSON.stringify(S);
      for (let i = 0; i < n; i++) { S = JSON.parse(snap); try { const o = e.choices()[i]; labels += o.l + ' ' + o.s + ' '; if (!o.dis) o.fn(); closeModals(); } catch (err) { errs.push(i + ': ' + err.message); } }
      S = JSON.parse(base);
      return { id, n, dflt: e.dflt, grow: /isGrow/.test(String(e.cond)), errs, labels };
    }), EVS);
    for (const x of r) {
      assert.ok(!x.missing, x.id + ' exists'); assert.deepStrictEqual(x.errs, [], x.id);
      assert.ok(x.n >= 2 && x.n <= 4, x.id + ' options'); assert.ok(Number.isInteger(x.dflt) && x.dflt < x.n, x.id + ' default'); assert.ok(x.grow, x.id + ' adult-only');
      assert.doesNotMatch(x.labels, BAD);
    }
    noErrors(errors);
  } },
];
