const { open, newGame, noErrors, assert } = require('./helpers');

const BAD = /\b(fish\w*|salmon|marina|charter|wdfw|chinook|coho|herring)\b/i;

module.exports = [
  { name: 'neighborhoods: ten Tacoma neighborhoods beyond Hilltop, each with places, a hub, neighbors and art', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await newGame(page);
    const r = await page.evaluate(() => Object.values(HOODS).map(h => ({ key: h.key, hub: h.hub, places: Object.keys(h.places), hubOk: !!L[h.hub] && L[h.hub].hood === h.key,
      neighbors: (h.neighbors || []).length, art: Object.keys(h.places).every(k => typeof L[k].art === 'function' && /<(rect|path|circle|polygon)/.test(L[k].art({ night: false })) && /<(rect|path|circle|polygon)/.test(L[k].art({ night: true }))) })));
    const keys = r.map(x => x.key);
    for (const k of ['downtown', 'eastside', 'proctor', 'ruston', 'southend', 'stadium', 'oldtown', 'fernhill', 'netacoma', 'westend']) assert.ok(keys.includes(k), 'missing neighborhood ' + k);
    for (const h of r) {
      assert.ok(h.places.length >= 2 && h.places.length <= 3, h.key + ' has 2–3 places');
      assert.ok(h.hubOk, h.key + ' hub is one of its places');
      assert.ok(h.neighbors >= 2, h.key + ' has neighbors');
      assert.ok(h.art, h.key + ' places draw by day and night');
    }
    noErrors(errors);
  } },
  { name: 'neighborhoods: travel goes through the stops, the bus charges a fare, the first visit is announced', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await newGame(page);
    const r = await page.evaluate(() => {
      closeModals(); S.t = 600; S.loc = 'home'; S.money = 1000;
      const out = {};
      for (const h of Object.values(HOODS)) {
        const k = h.hub, m = travelMins('home', k), back = travelMins(k, 'home');
        out[h.key] = { m, back, fare: hoodFare('home', k) };
      }
      const bus = Object.values(HOODS).find(h => h.ride.fare > 0);
      window.__t = { before: S.money, hub: bus.hub, key: bus.key }; go(bus.hub);
      out.inner = travelMins(...Object.keys(bus.places).slice(0, 2));
      return out;
    });
    await page.waitForFunction(() => S.loc === window.__t.hub, null, { timeout: 15000 });
    Object.assign(r, await page.evaluate(() => { closeModals(); return { paid: window.__t.before - S.money, visited: !!(S.hoods || {})[window.__t.key] }; }));
    for (const [k, v] of Object.entries(r)) if (v && typeof v === 'object' && 'm' in v) {
      assert.ok(v.m >= 10 && v.m <= 60, `${k}: ${v.m} min from home`);
      assert.strictEqual(v.m, v.back, k + ' travel is symmetric');
    }
    assert.ok(r.paid > 0, 'the bus fare was charged');
    assert.ok(r.visited, 'the first visit is recorded');
    assert.ok(r.inner >= 2 && r.inner <= 20, 'walking inside a neighborhood is short');
    noErrors(errors);
  } },
  { name: 'neighborhoods: every place renders, every action runs, at day and night, with no fishing words', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await newGame(page);
    const r = await page.evaluate(() => {
      closeModals(); const bad = []; let acts = 0, text = '';
      for (const h of Object.values(HOODS)) for (const k of Object.keys(h.places)) for (const t of [600, 1000, 1300]) {
        const snap = JSON.stringify(S);
        S.loc = k; S.t = day() * 1440 + t; S.money = 2000; render(); text += document.body.innerText;
        const a = actionsHere().filter(x => !x.dis && !/Wait a while/.test(x.l));
        for (const x of a) { try { x.fn(); acts++; closeModals(); text += document.body.innerText; } catch (e) { bad.push(k + ': ' + x.l + ': ' + e.message); } S = JSON.parse(snap); S.loc = k; S.t = day() * 1440 + t; }
        S = JSON.parse(snap);
      }
      return { bad, acts, text };
    });
    assert.deepStrictEqual(r.bad, []);
    assert.ok(r.acts >= 30, 'neighborhood actions ran: ' + r.acts);
    assert.doesNotMatch(r.text, BAD);
    noErrors(errors);
  } },
  { name: 'neighborhoods: Go somewhere groups places by neighborhood', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await newGame(page);
    await page.evaluate(() => { closeModals(); setPref('goOpen', true); render(); });
    const heads = await page.$$eval('.gohood', els => els.map(e => e.textContent));
    assert.ok(heads.length >= 11, 'Hilltop + ten neighborhood headings: ' + heads.length);
    assert.match(heads[0], /Hilltop/);
    noErrors(errors);
  } },
];
