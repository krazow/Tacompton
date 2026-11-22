const { open, noErrors, assert } = require('./helpers');

// Seasons (src/js/33-seasons.js): the weather, sunrise and sunset all year, and a neighborhood that changes over the years.
async function startLife(page, length, startAge, birthday = { m: 3, d: 14, label: 'March 14' }) {
  await page.evaluate(([length, startAge, birthday]) => {
    closeModals(); setMode(startAge < 18 ? 'grow' : 'adult');
    LIFE_PICK = { length, startAge, birthday };
    newGame('normal'); closeModals(); if (!isGrow()) { pickJob('cafe'); closeModals(); } tab = 'act'; render();
  }, [length, startAge, birthday]);
}
// jump to a calendar date inside the current key week's game (for checks that don't need the skip)
const at = (page, y, m, d, loc = 'view', t = 780) => page.evaluate(([y, m, d, loc, t]) => { S.cur = dayIndexOf(y, m, d); S.t = S.cur * 1440 + t; S.loc = loc; }, [y, m, d, loc, t]);

module.exports = [
  { name: 'sunrise and sunset follow the year in the longer games; Quick play keeps August', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await startLife(page, 'life', 18);
    const r = await page.evaluate(() => {
      const f = (y, m, d) => { const i = dayIndexOf(y, m, d); return [fmt(sunriseOn(i)), fmt(sunsetOn(i))] };
      S.cur = dayIndexOf(2026, 12, 21); const sc = SCENE.sun.map(fmt);
      return { dec: f(2026, 12, 21), jun: f(2027, 6, 21), mar: f(2027, 3, 20), sc };
    });
    const mins = t => { const [h, m] = t.split(/[: ]/); return (+h % 12) * 60 + +m + (/PM/.test(t) ? 720 : 0) };
    assert.ok(Math.abs(mins(r.dec[0]) - (7 * 60 + 55)) <= 3, 'Dec sunrise ' + r.dec[0]);
    assert.ok(Math.abs(mins(r.dec[1]) - (16 * 60 + 20)) <= 3, 'Dec sunset ' + r.dec[1]);
    assert.ok(Math.abs(mins(r.jun[0]) - (5 * 60 + 15)) <= 3, 'June sunrise ' + r.jun[0]);
    assert.ok(Math.abs(mins(r.jun[1]) - (21 * 60 + 10)) <= 3, 'June sunset ' + r.jun[1]);
    assert.deepStrictEqual(r.sc, r.dec, 'the scene uses the same times');
    // Quick play: unchanged
    await startLife(page, 'quick', 18);
    const q = await page.evaluate(() => ({ sun: SCENE.sun, wx: wxOf(), tags: statusTags().join(''), fx: sceneSVG().includes('wx-fx') }));
    assert.deepStrictEqual(q.sun, [370, 1220]);
    assert.strictEqual(q.wx, null); assert.doesNotMatch(q.tags, /sunset|🌅/); assert.strictEqual(q.fx, false);
    noErrors(errors);
  } },
  { name: 'the weather: Tacoma rain from fall through spring, smoke only in summer, snow only in winter, one first sunny spring day', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await startLife(page, 'life', 18);
    const r = await page.evaluate(() => {
      const by = {}, sp = {};
      for (let i = 0; i < 365 * 6; i++) { const o = dateOf(i), k = wxOf(i); (by[o.m] = by[o.m] || {})[k] = (by[o.m][k] || 0) + 1; if (k === 'spring1') sp[o.y] = (sp[o.y] || 0) + 1; }
      return { by, sp, same: wxOf(200) === wxOf(200) };
    });
    const wet = m => ((r.by[m].rain || 0) + (r.by[m].drizzle || 0)) / Object.values(r.by[m]).reduce((a, b) => a + b, 0);
    for (const m of [10, 11, 12, 1, 2, 3]) assert.ok(wet(m) > 0.4, `month ${m} is wet: ${wet(m)}`);
    for (const m of [7, 8]) assert.ok(wet(m) < 0.15, `month ${m} is dry: ${wet(m)}`);
    for (const m in r.by) { if (r.by[m].smoke) assert.ok([7, 8, 9].includes(+m), 'smoke in ' + m); if (r.by[m].snow) assert.ok([12, 1, 2].includes(+m), 'snow in ' + m); }
    assert.ok(Object.values(r.by).some(x => x.snow), 'a rare snow day'); assert.ok(Object.values(r.by).some(x => x.smoke), 'some smoke days');
    for (const y of [2027, 2028, 2029, 2030, 2031]) assert.strictEqual(r.sp[y], 1, 'one first sunny spring day in ' + y);
    assert.ok(r.same);
    noErrors(errors);
  } },
  { name: 'the weather shows in the scene and on the Here tab, and changes outdoor actions', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await startLife(page, '2y', 18);
    await at(page, 2026, 11, 10, 'view', 960);
    const r = await page.evaluate(() => {
      const out = {};
      for (const k of ['rain', 'smoke', 'sun', 'snow', 'wind']) {
        S.wxSet = { [day()]: k }; render();
        const a = actionsHere();
        out[k] = { fx: document.querySelector('.scene svg .wx-fx') ? document.querySelector('.scene svg .wx-fx').dataset.wx : null, tag: (document.querySelector('.status .tag.wx') || {}).textContent || '',
          sunset: a.find(x => /sunset/i.test(x.l)), sled: a.find(x => /Sled/.test(x.l)), wait: a.find(x => /Wait a while/.test(x.l)) };
      }
      return out;
    });
    assert.strictEqual(r.rain.fx, 'rain'); assert.match(r.rain.tag, /🌧️ rain · ☀️ .*AM · 🌅 4:\d\d PM/);
    assert.ok(r.rain.sunset && r.rain.sunset.dis, 'no sunset in heavy rain');
    assert.ok(r.smoke.sunset.dis && /smoke/i.test(r.smoke.sunset.s), 'smoke closes outdoor actions');
    assert.ok(r.wind.sunset.dis);
    assert.ok(!r.sun.sunset.dis || /Come back|Best from|was/.test(r.sun.sunset.s), 'sunny: the sunset follows its usual hours');
    assert.strictEqual(r.sun.fx, null, 'no overlay on a sunny day');
    assert.ok(r.snow.sled && !r.snow.sled.dis, 'sledding on a snow day'); assert.strictEqual(r.snow.fx, 'snow');
    assert.ok(r.rain.wait && !r.rain.wait.dis, 'waiting is never weather-bound');
    // a sunny day: an outdoor action carries a small bonus and applies it
    const b = await page.evaluate(() => { S.wxSet = { [day()]: 'sun' }; S.loc = 'mlk'; const a = actionsHere().find(x => /murals/.test(x.l)); const s0 = S.stress = 50; a.fn(); return { s: a.s, d: S.stress - s0 }; });
    assert.match(b.s, /☀️ Stress −2/); assert.ok(b.d < 0);
    noErrors(errors);
  } },
  { name: 'a snow day closes school in Growing Up; the morning report names the weather', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await startLife(page, '1y', 12);
    const r = await page.evaluate(() => {
      const d = dayIndexOf(2027, 1, 12), was = isSchoolDay(d); S.wxSet = { [d]: 'snow' };
      const now = isSchoolDay(d);
      S.cur = d; S.t = d * 1440 + S.alarm; S.loc = 'home'; uiNarr = []; onMorning(d);
      return { was, now, txt: uiNarr.join('\n'), school: S.t % 1440 };
    });
    assert.strictEqual(r.was, true); assert.strictEqual(r.now, false);
    assert.match(r.txt, /Snow!/); assert.match(r.txt, /closed: a snow day/); assert.match(r.txt, /Sunrise 7:\d\d AM, sunset 4:\d\d PM/);
    assert.ok(r.school < 900, 'no school day was played');
    noErrors(errors);
  } },
  { name: 'the neighborhood changes over the years: city news, rent, a closed shop replaced, The Juniper on MLK', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await startLife(page, 'life', 18);
    const rent0 = await page.evaluate(() => S.rent.amt);
    // play key weeks until mid-2029, collecting every summary
    const r = await page.evaluate(() => {
      const seen = [];
      LIFE_HOOKS.skip.push((f, t, c, notes) => seen.push(notes));
      let g = 0; while (dateOf(day()).y < 2029 || dateOf(day()).m < 7) { lifeFF(1); if (g++ > 40 || S.over) break; }
      closeModals();
      S.loc = 'mlk'; S.t = S.cur * 1440 + 720; tab = 'act'; render();
      const a = actionsHere();
      return { date: fullDate(day()), txt: seen.map(n => n.join('\n')).join('\n'), log: S.log.map(x => x.s).join('\n'), rent: S.rent.amt, f: S.city.f, art: sceneSVG(), desc: L.mlk.desc, a: a.map(x => x.l) };
    });
    assert.match(r.txt, /City news/); assert.match(r.txt, /T Line/); assert.match(r.txt, /2043/);
    assert.match(r.txt, /Your lease renews: rent goes from/);
    assert.match(r.txt + r.log, /\d years? on Hilltop\. Rents on the block are up \d+%/);
    assert.ok(r.rent > rent0 * 1.05, `rent went up: ${rent0} → ${r.rent}`);
    assert.ok(r.f.juniper && r.f.teriClosed && r.f.kusina, JSON.stringify(r.f));
    assert.match(r.art, /KUSINA 253/); assert.match(r.art, /THE JUNIPER/); assert.doesNotMatch(r.art, />TERIYAKI</);
    assert.match(r.desc, /Kusina 253/);
    assert.ok(r.a.some(l => /Kusina 253/.test(l)), 'the new shop’s action'); assert.ok(!r.a.some(l => /teriyaki spot/.test(l)));
    assert.ok(r.a.some(l => /Rise & Shine/.test(l)), 'the bakery');
    noErrors(errors);
  } },
  { name: 'Quick play has no weather, no city news and the same actions', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await startLife(page, 'quick', 18);
    const r = await page.evaluate(() => { S.loc = 'mlk'; S.t = 720; const a = actionsHere().map(x => x.l); cityCatchUp(400, null); return { a, city: S.city || null, desc: L.mlk.desc }; });
    assert.ok(r.a.some(l => /teriyaki spot/.test(l))); assert.strictEqual(r.city, null);
    assert.match(r.desc, /the teriyaki spot/);
    noErrors(errors);
  } },
];
