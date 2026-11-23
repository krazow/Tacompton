const { open, noErrors, assert } = require('./helpers');

// Growing up in the hood (src/js/61-hood-life.js): 30 hard-times events as choices. Each fires only in its age band and
// mode, every option does something different, the safe option is the default, Quick play sees at most one light one,
// a long life sees a fair share but not all, and no word is graphic, a how-to, a real gang name, romance or fishing.
const BAD_GRAPHIC = /\b(blood\w*|bloody|bullets?|ammo|ammunition|caliber|calibre|rounds? of|magazines?|clips?|triggers?|reload\w*|pistols?|glocks?|rifles?|shotguns?|9mm|gore|guts|brains?|corpses?|dead body|stab\w*|knif\w*|wounds?|kill\w*|murder\w*|execut\w*|cocaine|heroin|meth|fentanyl|crack|weed|pills?|baggies?|grams?|ounces?|weigh\w*|dealers?|dealing|deal drugs|cook(ed|ing)? (it|up)|how to|step by step|crips?|bloods|sure[nñ]os?|norte[nñ]os?|ms-?13|latin kings)\b/i;
const BAD_ROMANCE = /\b(romance|romantic|crush\w*|dat(e|es|ing)|boyfriends?|girlfriends?|kiss\w*|flirt\w*|sexy?|sexual|couples?)\b/i;
const BAD_FISH = /\b(fish\w*|salmon|marina|charters?|wdfw|chinook|coho|herring)\b/i;

async function start(page, { grow, length = '1y', age }) {
  await page.evaluate(([grow, length, age]) => {
    if (typeof SCH_SNOW !== 'undefined') SCH_SNOW = 0;
    closeModals(); setMode(grow ? 'grow' : 'adult');
    LIFE_PICK = length === 'quick' ? null : { length, startAge: age, birthday: { m: 3, d: 14, label: 'March 14' } };
    newGame('normal'); closeModals(); if (!isGrow()) { pickJob('cafe'); closeModals(); } tab = 'act'; render();
    // stubs for the gang and crime builders' functions (only if they aren't on main yet), recording every call
    window.__calls = { gang: [], crime: [] };
    if (typeof gangAdj !== 'function') window.gangAdj = o => { window.__calls.gang.push(o); };
    else { const g = gangAdj; window.gangAdj = o => { window.__calls.gang.push(o); return g(o); }; }
    if (typeof crimeOffense !== 'function') window.crimeOffense = (id, o) => { window.__calls.crime.push([id, o]); return { step: 'warning', text: '' }; };
    else { const c = crimeOffense; window.crimeOffense = (id, o) => { window.__calls.crime.push([id, o]); return c(id, o); }; }
  }, [grow, length, age]);
}

// fire each event (forced) from a setup, then press every option from the same starting state
function runAll(cases) {
  const snap = () => ({ money: Math.round(S.money), energy: S.energy, mood: S.mood, family: isGrow() ? S.family : Math.round(S.life.family), stress: S.stress, community: S.community,
    grades: S.grades, friends: isGrow() ? gFriends() : 0, hood: JSON.stringify(Object.assign({}, S.hood, { log: 0, kw: 0, quick: 0 })), gang: window.__calls.gang.length, crime: window.__calls.crime.length });
  const diff = (a, b) => { const o = {}; for (const k in a) if (a[k] !== b[k]) o[k] = typeof a[k] === 'number' ? b[k] - a[k] : b[k]; return o; };
  const base = JSON.stringify(S), out = [];
  for (const c of cases) {
    const e = EV.find(x => x.id === c.id), r = { id: c.id, opts: [], words: [], fired: false };
    if (!e) { r.missing = true; out.push(r); continue; }
    const prep = () => {
      S = JSON.parse(base); closeModals(); uiNarr = []; window.__calls.gang = []; window.__calls.crime = [];
      new Function(c.setup || '')();
      S.ev.last = {}; S.ev.count = {}; EV.forEach(x => { if (!/^hood_/.test(x.id)) S.ev.count[x.id] = 9999; }); S.ev.pending = [];
    };
    prep(); forceEvent(c.id); const ctx = { fired: [] }; fireHook('wake', ctx); closeModals();
    r.fired = ctx.fired.includes(c.id); r.words.push(...uiNarr, e.tile[1]);
    const n = e.choices().length; r.n = n; r.dflt = e.dflt; r.urgent = !!e.urgent;
    for (let i = 0; i < n; i++) {
      prep(); forceEvent(c.id); fireHook('wake', { fired: [] }); closeModals();
      const o = e.choices()[i]; r.words.push(o.l, o.s || '');
      if (o.dis) { r.opts.push({ l: o.l, dis: true }); continue; }
      const a = snap(), n0 = uiNarr.length, g0 = window.__calls.gang.length, c0 = window.__calls.crime.length; let err = null;
      try { o.fn(); } catch (x) { err = String(x && x.stack || x); }
      r.words.push(...uiNarr.slice(n0));
      r.opts.push({ i, l: o.l, err, d: diff(a, snap()), gang: window.__calls.gang.slice(g0), crime: window.__calls.crime.slice(c0) });
    }
    out.push(r);
  }
  S = JSON.parse(base); closeModals();
  return out;
}
function check(r) {
  assert.ok(!r.missing, r.id + ' exists');
  assert.ok(r.fired, r.id + ' fired in its age band');
  assert.ok(r.n >= 2 && r.n <= 3, `${r.id}: 2–3 options (${r.n})`);
  assert.ok(Number.isInteger(r.dflt) && r.dflt >= 0 && r.dflt < r.n, `${r.id}: a default`);
  const on = r.opts.filter(o => !o.dis);
  on.forEach(o => assert.ok(!o.err, `${r.id} "${o.l}": ${o.err}`));
  assert.ok(on.length >= 2, `${r.id}: two options can be pressed`);
  on.forEach(o => assert.ok(Object.keys(o.d).length > 0, `${r.id}: "${o.l}" does something`));
  assert.ok(new Set(on.map(o => JSON.stringify(o.d))).size === on.length, `${r.id}: every option does something different ${JSON.stringify(on.map(o => o.d))}`);
  // the default never commits an offense, never raises Heat
  const d = r.opts[r.dflt];
  if (d && !d.dis) { assert.strictEqual(d.crime.length, 0, `${r.id}: the default is not an offense`); assert.ok(!d.gang.some(g => g.heat > 0), `${r.id}: the default doesn't raise Heat`); }
  for (const w of r.words) { assert.doesNotMatch(w, BAD_GRAPHIC, `${r.id}: ${w}`); assert.doesNotMatch(w, BAD_ROMANCE, `${r.id}: ${w}`); assert.doesNotMatch(w, BAD_FISH, `${r.id}: ${w}`); }
}

const MID = ['hood_gunshots', 'hood_lookout', 'hood_cousin', 'hood_jumped', 'hood_color', 'hood_gunpark', 'hood_skipping', 'hood_graffiti', 'hood_sweep', 'hood_glass'];
const HIGH = ['hood_package', 'hood_driveby', 'hood_friendshot', 'hood_funeral', 'hood_schoolfight', 'hood_witness', 'hood_og', 'hood_carstolen', 'hood_carjack', 'hood_juvie', 'hood_raid', 'hood_bbq', 'hood_nia', 'hood_gunoffer', 'hood_outreach'];
const YOUNG = ['hood_homie', 'hood_record', 'hood_crewtarget', 'hood_peacewalk', 'hood_baby'];
const school = 'S.cur=(()=>{for(let d=10;d<300;d++)if(isSchoolDay(d))return d;return 10})();S.t=S.cur*1440+420;';
const warm = 'S.cur=(()=>{for(let d=200;d<GAME.days;d++)if(["spring","summer"].includes(season(d)))return d;return 250})();S.t=S.cur*1440+420;';
const SET = {
  hood_skipping: school, hood_schoolfight: school + 'S.age=15;', hood_bbq: warm + 'S.age=16;', hood_carjack: 'S.age=16;',
  hood_juvie: 'window.HOOD.S().saw=true;', hood_record: 'window.HOOD.S().juvie=true;', hood_crewtarget: 'window.HOOD.S().g.rep=30;', hood_baby: 'S.age=25;',
  hood_color: '', hood_skipping_best: school,
};
const cases = ids => ids.map(id => ({ id, setup: 'S.cur=Math.max(S.cur,3);S.t=S.cur*1440+420;S.loc="home";S.money=300;' + (SET[id] || '') }));

module.exports = [
  { name: 'middle school (12–14): all 10 fire at 12, each with 2–3 different options and a safe default, no banned words', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page, { grow: true, age: 12 });
    const res = await page.evaluate(([src, c]) => { eval('var runAll=' + src); return runAll(c); }, [runAll.toString(), cases(MID)]);
    res.forEach(check);
    noErrors(errors);
  } },
  { name: 'high school (14–18): all 15 fire at 15, each with 2–3 different options and a safe default, no banned words', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page, { grow: true, age: 15, length: '2y' });
    const res = await page.evaluate(([src, c]) => { eval('var runAll=' + src); return runAll(c); }, [runAll.toString(), cases(HIGH)]);
    res.forEach(check);
    noErrors(errors);
  } },
  { name: 'young adult (18+): all 5 fire in the adult game, each with different options and a safe default, no banned words', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page, { grow: false, age: 18, length: 'life' });
    const res = await page.evaluate(([src, c]) => { eval('var runAll=' + src); return runAll(c); }, [runAll.toString(), cases(YOUNG)]);
    res.forEach(check);
    noErrors(errors);
  } },
  { name: 'every event stays in its own mode and age band (forced or not)', fn: async ctx => {
    const { page, errors } = await open(ctx);
    const probe = () => page.evaluate(() => {
      const out = {};
      for (const id of window.HOOD.ids) {
        const b = window.HOOD.band(id), r = [];
        for (const a of [11, 12, 13, 14, 15, 16, 17, 18, 19, 25, 30, 41, 60]) {
          S.age = a; S.hood = Object.assign(window.HOOD.S(), { juvie: true, saw: true, g: { rep: 30, heat: 0, loyalty: 0 } });
          const inb = b.grow === isGrow() && a >= b.lo && a <= b.hi;
          S.ev.last = {}; S.ev.count = {}; EV.forEach(x => { if (x.id !== id) S.ev.count[x.id] = 9999; }); S.ev.pending = [];
          forceEvent(id); const c = { fired: [] }; fireHook('wake', c); closeModals(); S.ev.force = [];
          if (!inb && c.fired.includes(id)) r.push(`fired at ${a} (${isGrow() ? 'grow' : 'adult'})`);
        }
        out[id] = r;
      }
      return out;
    });
    for (const [grow, age, length] of [[true, 12, '1y'], [false, 18, 'life']]) {
      await start(page, { grow, age, length });
      await page.evaluate(() => { S.cur = 200; S.t = S.cur * 1440 + 420; S.length = 'life'; });
      const r = await probe();
      for (const [id, bad] of Object.entries(r)) assert.deepStrictEqual(bad, [], id);
    }
    // the bands are what the to-do list says
    const bands = await page.evaluate(() => Object.fromEntries(window.HOOD.ids.map(id => [id, window.HOOD.band(id)])));
    assert.strictEqual(Object.keys(bands).length, 30, '30 events');
    for (const id of ['hood_gunshots', 'hood_lookout', 'hood_cousin', 'hood_jumped', 'hood_color', 'hood_gunpark', 'hood_skipping', 'hood_graffiti', 'hood_sweep', 'hood_glass']) assert.ok(bands[id].grow && bands[id].lo === 12 && bands[id].hi === 14, id);
    for (const id of ['hood_package', 'hood_driveby', 'hood_friendshot', 'hood_funeral', 'hood_schoolfight', 'hood_witness', 'hood_og', 'hood_carstolen', 'hood_juvie', 'hood_raid', 'hood_nia', 'hood_gunoffer', 'hood_outreach']) assert.ok(bands[id].grow && bands[id].lo === 14 && bands[id].hi === 18, id);
    for (const id of ['hood_homie', 'hood_record', 'hood_crewtarget', 'hood_peacewalk', 'hood_baby']) assert.ok(!bands[id].grow && bands[id].lo >= 18, id);
    noErrors(errors);
  } },
  { name: 'Quick play: only light events, at most one a game; a long life sees a fair share, one per key week at most', fn: async ctx => {
    const { page, errors } = await open(ctx);
    for (const grow of [true, false]) {
      await start(page, { grow, length: 'quick' });
      const q = await page.evaluate(() => {
        const elig = window.HOOD.ids.filter(id => window.HOOD.ok(id));
        const heavy = elig.filter(id => !window.HOOD.band(id).light);
        let fired = 0;
        for (let salt = 1; salt <= 60; salt++) {
          S.hood = null; window.HOOD.S().salt = salt * 7919; S.ev.count = {}; S.ev.last = {};
          for (let d = 0; d < GAME.days; d++) { S.cur = d; S.t = d * 1440 + 420;
            for (const id of window.HOOD.ids) { const e = EV.find(x => x.id === id); if ((S.ev.count[id] || 0) < 1 && e.cond({})) { S.ev.count[id] = 1; e.run({}); fired++; } } }
          if (window.HOOD.S().quick > 1) return { bad: 'more than one in a game' };
        }
        return { heavy, fired, n: elig.length };
      });
      assert.ok(!q.bad, q.bad);
      assert.deepStrictEqual(q.heavy, [], 'only light events in Quick play');
      assert.ok(q.n >= 1 && q.fired <= 60 && q.fired >= 5, `Quick play: some games get one (${q.fired} of 60)`);
    }
    // Lifetime from 12: walk the key weeks to 18 and count
    await start(page, { grow: true, age: 12, length: 'life' });
    const L = await page.evaluate(() => {
      const res = [];
      for (let salt = 1; salt <= 12; salt++) {
        S.hood = null; window.HOOD.S().salt = salt * 104729; S.ev.count = {}; S.ev.last = {}; let n = 0, perWeek = 0, worst = 0;
        for (let i = 1; i < S.keyWeeks.length; i++) { const k = S.keyWeeks[i]; S.kwi = i; perWeek = 0;
          for (let d = k.start; d <= k.end; d++) { S.cur = d; S.t = d * 1440 + 420; S.age = 12 + Math.floor(d / 365.25); if (S.age >= 18) break;
            for (const id of window.HOOD.ids) { const e = EV.find(x => x.id === id); if ((S.ev.count[id] || 0) < 1 && e.cond({})) { S.ev.count[id] = 1; e.run({}); n++; perWeek++; } } }
          worst = Math.max(worst, perWeek); if (S.age >= 18) break; }
        res.push({ n, worst });
      }
      return res;
    });
    const avg = L.reduce((a, r) => a + r.n, 0) / L.length;
    assert.ok(L.every(r => r.worst <= 1), 'at most one a key week');
    assert.ok(avg >= 5 && avg <= 18, `a fair share of the 25 kid events, not all (average ${avg})`);
    assert.ok(L.every(r => r.n < 25), 'never all of them');
    noErrors(errors);
  } },
  { name: 'the habits and flags: the hoodie, the gun is never a reward, offenses and the street meters, the ways out', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page, { grow: true, age: 12 });
    const r = await page.evaluate(() => {
      const out = {}; const base = JSON.stringify(S);
      S.cur = 40; S.t = S.cur * 1440 + 900; S.loc = 'home'; S.life.weekPlay = 'full';
      const act = GROW.actionsHere().find(a => /plain hoodie/.test(a.l));
      out.toggle = !!act; if (act) act.fn(); out.hoodie = window.HOOD.S().hoodie;
      const e = EV.find(x => x.id === 'hood_color');
      out.withHoodie = e.choices().length; const t1 = EV.find(x => x.id === 'hood_color');
      window.HOOD.S().hoodie = false; out.without = t1.choices().length;
      // the gun in the park: taking it brings fear and a parent, no money, no rep
      const g = EV.find(x => x.id === 'hood_gunpark').choices(); const take = g.find(o => /Take it/.test(o.l));
      const m0 = S.money, rep0 = window.HOOD.S().g.rep, f0 = S.family; window.__calls.gang = []; window.__calls.crime = [];
      take.fn(); out.gun = { money: S.money - m0, rep: window.HOOD.S().g.rep - rep0, family: S.family - f0, gang: window.__calls.gang.length, crime: window.__calls.crime.length, said: uiNarr[uiNarr.length - 1] };
      // the lookout: an offense (kid) and the street meters
      window.__calls.gang = []; window.__calls.crime = [];
      EV.find(x => x.id === 'hood_lookout').choices().find(o => /Take the forty/.test(o.l)).fn();
      out.lookout = { gang: window.__calls.gang, crime: window.__calls.crime };
      // ways out
      EV.find(x => x.id === 'hood_glass').choices()[0].fn();
      out.ways = hoodWaysOut();
      S = JSON.parse(base);
      return out;
    });
    assert.ok(r.toggle && r.hoodie, 'the hoodie habit at home');
    assert.strictEqual(r.withHoodie, 2); assert.strictEqual(r.without, 3);
    assert.ok(r.gun.money <= 0 && r.gun.rep <= 0 && r.gun.family < 0 && r.gun.gang === 0, 'the gun is never a reward ' + JSON.stringify(r.gun));
    assert.match(r.gun.said, /Dad|Mr\. Harris|Mom/); assert.match(r.gun.said, /police/);
    assert.strictEqual(r.lookout.crime.length, 1); assert.strictEqual(r.lookout.crime[0][1].kid, true);
    assert.ok(r.lookout.gang.some(g => g.rep > 0) && r.lookout.gang.some(g => g.heat > 0), 'Street Rep and Heat');
    assert.ok(r.ways.includes('glass'), 'the glass studio is a way out');
    noErrors(errors);
  } },
  { name: 'the guide: Hard times on the block in Growing up, plain and with no banned words', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await page.click('#helpBtn'); await page.waitForSelector('#tut');
    const t = await page.evaluate(() => document.getElementById('tut-growup').innerText);
    assert.ok(t.includes('Hard times on the block'), 'the section');
    const sec = t.slice(t.indexOf('Hard times on the block'));
    for (const s of ['Street Rep', 'Heat', 'safe choice', 'seal', 'Quick play']) assert.ok(sec.includes(s), 'mentions ' + s);
    assert.doesNotMatch(sec, BAD_GRAPHIC); assert.doesNotMatch(t, BAD_ROMANCE); assert.doesNotMatch(sec, BAD_FISH);
    noErrors(errors);
  } },
];
