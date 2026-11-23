const { open, newGame, noErrors, assert } = require('./helpers');

// Historical Tacoma places (src/js/66-tacoma-places.js): real places open and close on their real dates.
async function start(page, year, len = 'life') {
  await page.evaluate(([year, len]) => {
    closeModals(); setMode('adult');
    LIFE_PICK = { length: len, startAge: 18, startYear: year, birthday: { m: 3, d: 14, label: 'March 14' } };
    newGame('normal'); closeModals(); pickJob('cafe'); closeModals(); tab = 'act'; render();
  }, [year, len]);
}
// jump the calendar to a day (no time skip: just where "today" is)
const jump = (page, y, m, d) => page.evaluate(([y, m, d]) => { const i = dayIndexOf(y, m, d); S.cur = i; S.t = i * 1440 + 720; }, [y, m, d]);
const goNames = page => page.evaluate(() => { tab = 'act'; render(); const g = document.querySelector('details.go'); g.open = true;
  return [...g.querySelectorAll('.dest b')].map(x => x.textContent); });

module.exports = [
  { name: 'tacoma places: every entry has a source note, a real neighborhood and its years in order', fn: async ctx => {
    const { page, errors } = await open(ctx);
    const r = await page.evaluate(() => TP_PLACES.map(e => ({ key: e.key, source: e.source, hood: e.hood, okHood: e.hood === 'hilltop' || !!HOODS[e.hood],
      o: e.opened, c: e.closed || null, rep: e.replacedBy || null, repOk: !e.replacedBy || !!TP_BY_KEY[e.replacedBy], place: e.existing ? !!L[e.existing] : e.in ? !!L[e.in] : !!L['tp_' + e.key],
      art: e.existing || e.in ? true : /<(rect|path)/.test(L['tp_' + e.key].art({ night: false })) && /<(rect|path)/.test(L['tp_' + e.key].art({ night: true })) })));
    assert.ok(r.length >= 20, 'a good number of places: ' + r.length);
    const keys = new Set();
    for (const e of r) {
      assert.ok(!keys.has(e.key), 'unique ' + e.key); keys.add(e.key);
      assert.ok(typeof e.source === 'string' && e.source.length > 30, e.key + ' has a source note');
      assert.ok(e.okHood, e.key + ' hood ' + e.hood);
      assert.ok(Array.isArray(e.o) && e.o[0] > 1800 && e.o[0] <= 2026, e.key + ' opened');
      if (e.c) assert.ok(e.c[0] * 1e4 + e.c[1] * 100 + (e.c[2] || 1) > e.o[0] * 1e4 + e.o[1] * 100 + (e.o[2] || 1), e.key + ' closes after it opens');
      assert.ok(e.repOk, e.key + ' replacement exists');
      assert.ok(e.place, e.key + ' has a place'); assert.ok(e.art, e.key + ' draws by day and night');
    }
    for (const k of ['pizzapipes', 'frisko', 'javajive', 'bimbos', 'knapps', 'harvester', 'mall', 'dune', 'rialto', 'pantages']) assert.ok(keys.has(k), 'has ' + k);
    assert.ok(await page.evaluate(() => TP_NEWS.every(n => n.source && n.source.length > 30)), 'every milestone has a source');
    noErrors(errors);
  } },
  { name: 'tacoma places: each opens and closes on its day, and the replacements take over', fn: async ctx => {
    const { page, errors } = await open(ctx);
    const r = await page.evaluate(() => {
      const prev = a => { const t = new Date(Date.UTC(a[0], a[1] - 1, (a[2] || 1) - 1)); return [t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate()] };
      const bad = [];
      for (const e of TP_PLACES) {
        const o = [e.opened[0], e.opened[1] || 1, e.opened[2] || 1];
        if (tpOpenOn(e.key, ...prev(o))) bad.push(e.key + ' open the day before it opened');
        if (!tpOpenOn(e.key, ...o)) bad.push(e.key + ' not open on its first day');
        if (e.closed) { const c = [e.closed[0], e.closed[1] || 1, e.closed[2] || 1];
          if (!tpOpenOn(e.key, ...prev(c))) bad.push(e.key + ' closed early');
          if (tpOpenOn(e.key, ...c)) bad.push(e.key + ' still open on its closing day');
          if (e.closed[0] !== c[0]) bad.push(e.key); }
        if (e.replacedBy) { const n = TP_BY_KEY[e.replacedBy], no = [n.opened[0], n.opened[1] || 1, n.opened[2] || 1];
          if (!tpOpenOn(n.key, ...no)) bad.push(e.key + ' replacement not open'); }
      }
      return { bad, pp99: [tpOpenOn('pizzapipes', 1999, 8, 2), tpOpenOn('pizzapipes', 1999, 8, 3)], clinker: [tpOpenOn('clinker', 2005, 12, 31), tpOpenOn('dukes', 2005, 12, 31), tpOpenOn('clinker', 2006, 1, 1), tpOpenOn('dukes', 2006, 1, 1)],
        bimbo: [tpOpenOn('bimbos', 2001, 9, 30), tpOpenOn('bimbos', 2002, 1, 1), tpOpenOn('convention', 2004, 11, 30), tpOpenOn('convention', 2004, 12, 1)],
        harv: [tpName(TP_BY_KEY.harvester, 1985), tpName(TP_BY_KEY.harvester, 1993)], knapps: [tpOpenOn('knapps', 2026, 6, 7), tpOpenOn('knapps', 2026, 6, 8)] };
    });
    assert.deepStrictEqual(r.bad, []);
    assert.deepStrictEqual(r.pp99, [true, false], 'Pizza & Pipes burns Aug 3, 1999');
    assert.deepStrictEqual(r.clinker, [true, false, false, true], 'Duke’s takes the Clinkerdagger’s spot in 2006');
    assert.deepStrictEqual(r.bimbo, [true, false, false, true], 'the convention center on the Bimbo’s block in Dec 2004');
    assert.deepStrictEqual(r.harv, ['Scotty’s', 'The Harvester']);
    assert.deepStrictEqual(r.knapps, [true, false]);
    noErrors(errors);
  } },
  { name: 'tacoma places: a 1980 life sees the places of 1980, nothing before it opened, and the newer ones later', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page, 1980);
    const g80 = await goNames(page);
    for (const n of ['Pizza & Pipes', 'Bimbo’s', 'Knapp’s', 'Scotty’s', 'Steve’s Gay ’90s', 'Clinkerdagger', 'Harbor Lights', 'Tacoma Mall', 'Bob’s Java Jive', 'Johnny’s Dock']) assert.ok(g80.some(x => x.includes(n)), '1980 has ' + n);
    for (const n of ['Dune Peninsula', 'Duke’s', 'Kim Anh', 'Convention Center', 'Lobster Shop', 'The Harvester']) assert.ok(!g80.some(x => x.includes(n)), '1980 has no ' + n);
    const h80 = await page.evaluate(() => ({ pantages: TP_BY_KEY.pantages && tpOpenNow('pantages'), sears: tpOpenNow('sears'), dune: L.tp_dune.hidden }));
    assert.deepStrictEqual(h80, { pantages: false, sears: false, dune: true });
    await jump(page, 2007, 3, 1);
    const g07 = await goNames(page);
    for (const n of ['Duke’s', 'Kim Anh', 'Convention Center', 'Lobster Shop', 'The Harvester', 'Knapp’s']) assert.ok(g07.some(x => x.includes(n)), '2007 has ' + n);
    for (const n of ['Pizza & Pipes', 'Bimbo’s', 'Clinkerdagger', 'Steve’s', 'Scotty’s', 'Dune Peninsula']) assert.ok(!g07.some(x => x.includes(n)), '2007 has no ' + n);
    await jump(page, 2020, 1, 10);
    const g20 = await goNames(page);
    assert.ok(g20.some(x => x.includes('Dune Peninsula')), 'Dune Peninsula from 2019');
    // the news: Pizza & Pipes burns down in 1999, Duke's opens in 2006
    const news = await page.evaluate(() => { S.city = null; cityState(); const o = {}; for (const y of [1999, 2006]) { const l = []; cityCatchUp(dayIndexOf(y, 12, 31), l); o[y] = l.join('\n'); } return o; });
    assert.match(news[1999], /Pizza & Pipes burns down/); assert.match(news[2006], /Duke’s Chowder House opens/);
    noErrors(errors);
  } },
  { name: 'tacoma places: 2026 and Quick play show today’s places only (Knapp’s is closed)', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await newGame(page);
    const q = await goNames(page);
    const today = await page.evaluate(() => TP_PLACES.filter(e => !e.existing && !e.in && tpOpenOn(e.key, 2026, 8, 3)).map(e => e.name));
    for (const n of today) assert.ok(q.some(x => x.includes(n)), 'Quick play has ' + n);
    for (const n of ['Knapp’s', 'Pizza & Pipes', 'Bimbo’s', 'Kim Anh', 'The Harvester', 'Clinkerdagger', 'Steve’s']) assert.ok(!q.some(x => x.includes(n)), 'Quick play has no ' + n);
    assert.ok(q.some(x => x.includes('Dune Peninsula')) && q.some(x => x.includes('Duke’s')));
    await start(page, 2026);
    const l = await goNames(page);
    assert.ok(!l.some(x => x.includes('Knapp’s')) && l.some(x => x.includes('Lobster Shop')), '2026 start');
    const fr = await page.evaluate(() => { S.loc = 'mlk'; S.t = S.cur * 1440 + 720; return actionsHere().map(a => a.l); });
    assert.ok(fr.some(x => /Frisko Freeze/.test(x)), 'Frisko Freeze on MLK');
    noErrors(errors);
  } },
  { name: 'tacoma places: a visit costs money and counts, a farewell visit before the close, and the summary lists the gone ones', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page, 1980);
    const r = await page.evaluate(() => {
      const out = {};
      S.money = 5000; S.loc = 'tp_bimbos'; S.t = S.cur * 1440 + 720;
      const a = actionsHere().find(x => /Spaghetti at Bimbo/.test(x.l)); const m0 = S.money; a.fn();
      out.paid = m0 - S.money; out.v = S.tp.v.bimbos; out.again = actionsHere().some(x => /Spaghetti at Bimbo/.test(x.l));
      // the month before it closes (late Sept 2001): a last visit, not for a place you never went to
      const i = dayIndexOf(2001, 9, 10); S.cur = i; S.t = i * 1440 + 720; S.money = 5000;
      const bye = actionsHere().find(x => /One last visit to Bimbo/.test(x.l)); out.bye = !!bye; out.byeTxt = bye && bye.s;
      bye.fn(); out.byeDone = S.tp.bye.bimbos != null; out.moment = S.life.moments.some(m => /last visit to Bimbo/.test(m.t));
      S.loc = 'tp_johnnys'; out.noBye = !actionsHere().some(x => /One last visit/.test(x.l));
      const j = dayIndexOf(2003, 1, 10); S.cur = j; S.t = j * 1440 + 720;
      out.sum = lifeSummaryHTML();
      return out;
    });
    assert.ok(r.paid > 0, 'paid ' + r.paid); assert.strictEqual(r.v, 1); assert.strictEqual(r.again, false, 'once a day');
    assert.ok(r.bye, 'a farewell visit'); assert.match(r.byeTxt, /closes for good/); assert.ok(r.byeDone && r.moment);
    assert.ok(r.noBye, 'no farewell where nothing is closing');
    assert.match(r.sum, /Your Tacoma places/); assert.match(r.sum, /Bimbo’s/); assert.match(r.sum, /2 visits · gone since 2001/);
    noErrors(errors);
  } },
  { name: 'tacoma places: the guide lists Tacoma through the years by decade', fn: async ctx => {
    const { page, errors } = await open(ctx);
    const h = await page.evaluate(() => { const d = document.createElement('div'); d.innerHTML = helpLengths(); return d.textContent; });
    assert.match(h, /Tacoma through the years/);
    for (const s of ['Already there in 1980', '1990s', '2000s', '2010s', '2020s', 'Pizza & Pipes burns down', 'Dune Peninsula', 'Knapp’s closes', 'Open in 2026']) assert.ok(h.includes(s), 'guide has ' + s);
    assert.doesNotMatch(h, /\bdat(e|es|ing)\b/i);
    noErrors(errors);
  } },
];
