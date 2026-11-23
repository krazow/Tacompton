const { open, noErrors, assert } = require('./helpers');

// Pierce County packs B (src/js/23-county-gigharbor.js, -jblm.js, -valley.js, -mountain.js): Gig Harbor, JBLM and DuPont,
// Sumner and Bonney Lake, Orting, and Eatonville and the mountain.
const KEYS = ['gigharbor', 'jblm', 'sumner', 'orting', 'mountain'];
const BAD = /\b(fish\w*|salmon|marina|charters?|wdfw|chinook|coho|herring|romance|romantic|crush\w*|dat(e|es|ing)|boyfriends?|girlfriends?|kiss\w*|flirt\w*|sexy?|sexual|couples?)\b/i;
const COMBAT = /\b(combat|kill\w*|shoot\w*|weapons?|enemy|enemies|battle|firefight|wounded|casualt\w*)\b/i;
async function startLife(page, { length = '1y', year = 2026, job = 'cafe' } = {}) {
  await page.evaluate(([length, year, job]) => {
    closeModals(); setMode('adult');
    LIFE_PICK = { length, startAge: 18, birthday: { m: 3, d: 14, label: 'March 14' }, year };
    newGame('normal'); closeModals(); if (typeof pickJob === 'function') pickJob(job); closeModals(); tab = 'act'; render();
    if (year !== 2026 && S.startYear !== year) { S.startYear = year; }
  }, [length, year, job]);
}

module.exports = [
  { name: 'county B: five county packs with 3–6 places, a hub, neighbors, a ride with a drive time, art by day and night', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await startLife(page);
    const r = await page.evaluate(keys => keys.map(k => { const H = HOODS[k]; if (!H) return { k, missing: true };
      const ps = Object.keys(H.places);
      return { k, county: H.county, n: ps.length, hub: !!L[H.hub] && L[H.hub].hood === k, nb: (H.neighbors || []).length, drive: (H.ride0 || H.ride).drive,
        art: ps.every(p => /<(rect|path|circle|polygon)/.test(L[p].art({ night: false })) && /<(rect|path|circle|polygon)/.test(L[p].art({ night: true })) && L[p].art({ night: true }) !== L[p].art({ night: false })),
        desc: ps.every(p => typeof L[p].desc === 'string' && L[p].desc.length > 40), startable: !!H.startable }; }), KEYS);
    for (const h of r) {
      assert.ok(!h.missing, h.k + ' registered');
      assert.ok(h.county, h.k + ' is a county pack');
      assert.ok(h.n >= 3 && h.n <= 6, h.k + ' has 3–6 places: ' + h.n);
      assert.ok(h.hub, h.k + ' hub'); assert.ok(h.nb >= 2, h.k + ' neighbors');
      assert.ok(h.drive > 0, h.k + ' drive time'); assert.ok(h.art, h.k + ' art by day and night'); assert.ok(h.desc, h.k + ' descriptions');
    }
    const st = Object.fromEntries(r.map(h => [h.k, h.startable]));
    assert.deepStrictEqual(st, { gigharbor: true, jblm: false, sumner: true, orting: true, mountain: false });
    assert.ok(await page.evaluate(() => HOODS.gigharbor.narrows === true), 'Gig Harbor is across the Narrows (the toll)');
    noErrors(errors);
  } },
  { name: 'county B: every place renders and every action runs, morning, afternoon and night, in summer and winter, with no fishing, romance or combat words', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await startLife(page);
    const r = await page.evaluate(keys => {
      closeModals(); const bad = []; let acts = 0, text = '';
      if (S.life && !S.life.mil) S.life.mil = { start: 0, ets: 9999, basic: 0, basicDone: true, term: 1, reup: 0, housing: 'barracks', out: false };
      const days = [day(), day() + 120];   // August and early December
      for (const job of ['cafe', 'army']) for (const d0 of days) for (const k of keys) for (const p of Object.keys(HOODS[k].places)) for (const t of [600, 1300]) {
        const snap = JSON.stringify(S);
        S.job = job; S.cur = d0; S.loc = p; S.t = d0 * 1440 + t; S.money = 5000; S.energy = 80;
        try { render(); text += document.body.innerText; } catch (e) { bad.push(p + ' render: ' + e.message); }
        const a = hoodActions().filter(x => !x.dis);
        for (const x of a) { if (/Turn in/.test(x.l)) { text += x.l + x.s; continue; }
          try { x.fn(); acts++; closeModals(); text += x.l + ' ' + x.s + ' ' + document.body.innerText; } catch (e) { bad.push(p + ': ' + x.l + ': ' + e.message); }
          S = JSON.parse(snap); S.job = job; S.cur = d0; S.loc = p; S.t = d0 * 1440 + t; S.money = 5000; S.energy = 80; }
        S = JSON.parse(snap);
      }
      for (const k of keys) { const H = HOODS[k]; text += H.name + H.blurb + (H.startBlurb || '') + Object.values(H.places).map(p => p.name + p.desc).join(' ') + H.neighbors.map(n => n.d).join(' '); }
      return { bad, acts, text };
    }, KEYS);
    assert.deepStrictEqual(r.bad, []);
    assert.ok(r.acts >= 60, 'county actions ran: ' + r.acts);
    assert.doesNotMatch(r.text, BAD); assert.doesNotMatch(r.text, COMBAT);
    noErrors(errors);
  } },
  { name: 'county B: the events offer 2–3 choices and every choice runs', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await startLife(page);
    const r = await page.evaluate(() => {
      closeModals(); const ids = EV.filter(e => /^(gig_|jb_|vly_|mtn_)/.test(e.id)).map(e => e.id), bad = [], counts = {}; let text = '';
      for (const id of ids) { const e = EV.find(x => x.id === id), snap = JSON.stringify(S);
        try { S.money = 5000; e.run({}); const ch = typeof e.choices === 'function' ? e.choices({}) : e.choices; counts[id] = ch.length;
          ch.forEach((c, i) => { const s2 = JSON.stringify(S); text += c.l + ' ' + (c.s || ''); try { c.fn(); } catch (err) { bad.push(id + ' #' + i + ': ' + err.message); } S = JSON.parse(s2); });
        } catch (err) { bad.push(id + ': ' + err.message); }
        S = JSON.parse(snap); }
      text += document.body.innerText + (S.log || []).map(x => typeof x === 'string' ? x : JSON.stringify(x)).join(' ');
      return { ids, bad, counts, text };
    });
    assert.deepStrictEqual(r.bad, []);
    for (const p of ['gig_', 'jb_', 'vly_', 'mtn_']) { const n = r.ids.filter(i => i.startsWith(p)).length; assert.ok(n >= 2 && n <= 4, p + ' events: ' + n); }
    for (const [id, n] of Object.entries(r.counts)) assert.ok(n >= 2 && n <= 3, id + ' choices: ' + n);
    assert.doesNotMatch(r.text, BAD);
    noErrors(errors);
  } },
  { name: 'county B: the years: Narrows second span from 2007, Skansie park from 2002, Sounder in Sumner from 2000, Orting sirens from 2000, Fort Lewis before 2010', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await startLife(page);
    const r = await page.evaluate(() => {
      const out = {}, y0 = yearNow;
      for (const y of [1990, 2001, 2005, 2008, 2012]) { yearNow = () => y; window.yearNow = yearNow;
        out[y] = { bridge: L.gig_bridge.desc, skansie: L.gig_skansie.desc, station: L.vly_station.name, orting: L.vly_orting.desc, jblm: HOODS.jblm.name, art2: L.gig_bridge.art({ night: false }).length }; }
      yearNow = y0; window.yearNow = y0; return out;
    });
    assert.match(r[1990].bridge, /One green suspension bridge/); assert.match(r[2008].bridge, /2007 span/);
    assert.ok(r[2008].art2 > r[2005].art2, 'two spans drawn from 2007');
    assert.match(r[2001].skansie, /still private/); assert.match(r[2005].skansie, /park/);
    assert.match(r[1990].station, /bus stop/); assert.strictEqual(r[2001].station, 'Sumner Station');
    assert.doesNotMatch(r[1990].orting, /siren/); assert.match(r[2001].orting, /siren/);
    assert.match(r[2008].jblm, /Fort Lewis/); assert.match(r[2012].jblm, /JBLM/);
    noErrors(errors);
  } },
  { name: 'county B: the mountain is a drive: no bus, a park fee once a week, and the winter road to Paradise', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await startLife(page);
    const r = await page.evaluate(() => {
      closeModals(); const out = {}; S.money = 1000; S.loc = 'home'; S.t = S.cur * 1440 + 480;
      // no car: the trip stops before it starts
      go('mtn_eatonville'); out.noBus = S.loc; out.noBusMsg = document.body.innerText.includes('No bus goes out');
      // with the car: the fee at the gate, then a pass for the week
      const drv = CAR.driving; CAR.driving = () => true; S.loc = 'mtn_ashford'; const m0 = S.money;
      onArrive('mtn_gate', 'mtn_ashford'); out.fee = Math.round(m0 - S.money); out.paid = S.hoodFlags.mtn_fee === day();
      const m1 = S.money; onArrive('mtn_paradise', 'mtn_ashford'); out.second = Math.round(m1 - S.money);
      CAR.driving = drv;
      // the winter road: shut at night and on a snow day, open in a winter afternoon, always open in summer
      const dec = (() => { for (let d = day(); d < day() + 400; d++) if (dateOf(d).m === 12) return d; })();
      const aug = (() => { for (let d = dec; d < dec + 400; d++) if (dateOf(d).m === 8) return d; })();
      out.decNight = mtnRoad(dec * 1440 + 1000).open; out.decNoon = mtnRoad(dec * 1440 + 720).open;
      S.wxSet = { [dec]: 'snow' }; out.decSnow = mtnRoad(dec * 1440 + 720).open; S.wxSet = {};
      out.augNight = mtnRoad(aug * 1440 + 1300).open;
      // going up at night in December from the gate: the gate stays shut
      S.cur = dec; S.t = dec * 1440 + 1000; S.loc = 'mtn_gate'; go('mtn_paradise'); out.blocked = S.loc;
      return out;
    });
    assert.strictEqual(r.noBus, 'home'); assert.ok(r.noBusMsg, 'says there is no bus');
    assert.ok(r.fee > 0 && r.paid, 'park fee at the gate: ' + r.fee); assert.strictEqual(r.second, 0, 'the pass is good for the week');
    assert.strictEqual(r.decNight, false); assert.strictEqual(r.decNoon, true); assert.strictEqual(r.decSnow, false); assert.strictEqual(r.augNight, true);
    assert.strictEqual(r.blocked, 'mtn_gate');
    noErrors(errors);
  } },
  { name: 'county B: the barracks are home base for a soldier who lives on base, and hidden from everyone else', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await startLife(page);
    const r = await page.evaluate(() => {
      closeModals(); const out = {};
      out.civ = L.jb_barracks.hidden;
      S.job = 'army'; S.life.mil = { start: 0, ets: 9999, basic: 0, basicDone: true, term: 1, reup: 0, housing: 'barracks', out: false };
      const raw = Object.getOwnPropertyDescriptor(L.jb_barracks, 'hidden').get;
      S.loc = 'jb_barracks'; S.t = S.cur * 1440 + 1300; const a = hoodActions(); out.acts = a.map(x => x.l);
      const d0 = day(); a.find(x => /Turn in/.test(x.l)).fn(); out.next = day() === d0 + 1; out.loc = S.loc;
      S.life.mil.housing = 'bah'; out.bah = hoodActions().some(x => /Turn in/.test(x.l));
      return out;
    });
    assert.strictEqual(r.civ, true, 'hidden for a civilian');
    assert.ok(r.acts.some(l => /Turn in for the night/.test(l)), 'turn in from the barracks');
    assert.ok(r.next, 'the night ends the day'); assert.strictEqual(r.loc, 'jb_barracks', 'and you wake up on base');
    assert.strictEqual(r.bah, false, 'a sergeant on a housing allowance lives off base');
    noErrors(errors);
  } },
  { name: 'county B: the guide sections come through countyGuideAreas() when the engine is there, and Quick play keeps the places hidden', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await page.evaluate(() => { closeModals(); setMode('adult'); LIFE_PICK = { length: 'quick', startAge: 18 }; newGame('normal'); closeModals(); });
    const r = await page.evaluate(() => ({ eng: typeof countyGuideAreas === 'function', g: typeof countyGuideAreas === 'function' ? countyGuideAreas() : '',
      hidden: ['gig_harbor', 'jb_gate', 'vly_sumner', 'vly_orting', 'mtn_paradise'].every(k => L[k].hidden) }));
    assert.ok(r.hidden, 'county places are hidden in Quick play');
    if (r.eng) for (const s of ['Gig Harbor', 'DuPont', 'Sumner', 'Orting', 'Paradise', 'Northwest Trek', 'toll', 'lahar']) assert.ok(r.g.includes(s), 'guide: ' + s);
    assert.doesNotMatch(r.g, BAD);
    noErrors(errors);
  } },
];
