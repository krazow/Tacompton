const { open, noErrors, assert } = require('./helpers');

// Growing Up's events as choices (src/js/31-grow-story.js, the kid events in 34-grow-hoods.js): each option does something
// different, no option throws, the default is a real option, and every word stays kid-appropriate.
const BAD_KID = /\b(romance|romantic|crush\w*|dat(e|es|ing)|boyfriends?|girlfriends?|kiss\w*|flirt\w*|beer|wine|tavern|cocktails?)\b/i;
const BAD_FISH = /\b(fish\w*|salmon|marina|charters?|wdfw|chinook|coho|herring)\b/i;

// id → [hook, setup] (setup puts the game where the event can happen: day, minute of the day, place, age)
const EVENTS = {
  g_hoops_invite: ['arrive', { d: 1, m: 900, loc: 'home' }], g_bbq_morning: ['wake', { d: 5, m: 540, loc: 'home' }],
  g_ice_cream: ['arrive', { d: 1, m: 900, loc: 'home' }], g_mural: ['arrive', { d: 1, m: 700, loc: 'mlk' }],
  g_mural_done: ['arrive', { d: 2, m: 700, loc: 'mlk', flags: { g_mural: 'helped' } }], g_link_bell: ['arrive', { d: 1, m: 700, loc: 'mlk' }],
  g_nia_tooth: ['wake', { d: 2, m: 500, loc: 'home' }], g_nia_pool: ['arrive', { d: 2, m: 800, loc: 'home' }],
  g_nia_card: ['night', { d: 6, m: 1300, loc: 'home' }], g_flyer: ['arrive', { d: 1, m: 700, loc: 'library' }],
  g_rain: ['wake', { d: 3, m: 500, loc: 'home' }], g_mountain: ['wake', { d: 2, m: 500, loc: 'home' }],
  g_lorraine: ['arrive', { d: 2, m: 700, loc: 'home' }], g_nerves: ['night', { d: 5, m: 1300, loc: 'home' }],
  g_power_out: ['night', { d: 2, m: 1300, loc: 'home' }], g_zay_shortcut: ['arrive', { d: 2, m: 800, loc: 'school', meet: 'zay' }],
  g_grandma_box: ['wake', { d: 3, m: 500, loc: 'home' }],
  gh_frisbee: ['arrive', { age: 15, d: 1, m: 800, loc: 'st_park' }], gh_band: ['arrive', { age: 15, d: 1, m: 960, loc: 'st_castle' }],
  gh_busker: ['arrive', { age: 15, d: 1, m: 800, loc: 'dt_pacific' }], gh_hotshop: ['arrive', { age: 15, d: 1, m: 800, loc: 'dt_glass' }],
  gh_eagle: ['arrive', { age: 15, d: 1, m: 800, loc: 'ru_park' }], gh_seal: ['arrive', { age: 15, d: 1, m: 800, loc: 'ru_beach' }],
  gh_lost: ['arrive', { age: 15, d: 1, m: 800, loc: 'st_park' }], gh_samples: ['arrive', { age: 15, d: 5, m: 600, loc: 'pr_market' }],
  gh_soccer: ['arrive', { age: 15, d: 1, m: 800, loc: 'so_c' }], gh_mural: ['arrive', { age: 15, d: 1, m: 800, loc: 'so_a', flags: { g_mural: 'helped' } }],
};

async function start(page, age) {
  await page.evaluate(age => {
    closeModals(); setMode('grow');
    if (age > 12) LIFE_PICK = { length: '1y', startAge: age, birthday: { m: 3, d: 14, label: 'March 14' } };
    newGame('normal'); closeModals(); tab = 'act'; render();
  }, age);
}
// every option of one event, each from the same starting state: what it changed, its words, and the default
function tryAll([id, setup]) {
  const e = EV.find(x => x.id === id); if (!e) return { id, missing: true };
  const base = JSON.stringify(S), out = { id, opts: [], words: [] };
  const prep = () => {
    S = JSON.parse(base); S.cur = setup.d; S.t = setup.d * 1440 + setup.m; S.loc = setup.loc; S.money = 20; S.energy = 60; S.mood = 50; S.family = 50;
    if (setup.meet) gFriend(setup.meet, 2);
    for (const k in setup.flags || {}) setEventFlag(k, setup.flags[k]);
  };
  prep(); const list = e.choices(); out.n = list.length; out.dflt = typeof e.dflt === 'number' ? e.dflt : -1; out.urgent = !!e.urgent;
  for (let i = 0; i < list.length; i++) {
    prep(); const opt = e.choices()[i], n0 = uiNarr.length;
    out.words.push(opt.l, opt.s || '');
    let err = null; try { if (!opt.dis) opt.fn(); } catch (x) { err = String(x && x.stack || x); }
    out.words.push(...uiNarr.slice(n0));
    out.opts.push({ dis: !!opt.dis, err, sig: JSON.stringify([Math.round(S.money), Math.round(S.energy), S.mood, S.family, gFriends(), gGrades(), S.t, S.loc, S.ev.flags]) });
  }
  S = JSON.parse(base); render();
  return out;
}

module.exports = [
  ...[12, 15].map(age => ({ name: `every converted event (age ${age}): 2–3 options, a real default, and each option does something different`, fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page, age);
    const ids = Object.entries(EVENTS).filter(([, [, s]]) => (s.age || 12) === age);
    const res = await page.evaluate(([src, ids]) => { eval(src); return ids.map(x => tryAll(x)); }, [tryAll.toString(), ids]);
    for (const r of res) {
      assert.ok(!r.missing, `${r.id} exists`);
      assert.ok(r.n >= 2 && r.n <= 3, `${r.id}: ${r.n} options`);
      assert.ok(r.dflt >= 0 && r.dflt < r.n, `${r.id}: default ${r.dflt}`);
      assert.ok(!r.opts[r.dflt].dis, `${r.id}: the default can always be taken`);
      for (const o of r.opts) assert.strictEqual(o.err, null, `${r.id}: ${o.err}`);
      const live = r.opts.filter(o => !o.dis).map(o => o.sig);
      assert.strictEqual(new Set(live).size, live.length, `${r.id}: two options do the same thing`);
      const txt = r.words.join(' \n ');
      assert.ok(!BAD_KID.test(txt), `${r.id}: ${txt.match(BAD_KID)}`);
      assert.ok(!BAD_FISH.test(txt), `${r.id}: ${txt.match(BAD_FISH)}`);
    }
    noErrors(errors);
  } })),
  { name: 'a lost little kid can’t wait (urgent); urgent night events open right after the morning report; ambient moments are “Stop and watch” with “Keep going” as the default', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page, 12);
    const r = await page.evaluate(() => {
      const g = id => EV.find(x => x.id === id);
      return { urgent: ['gh_lost'].map(id => !!g(id).urgent).concat(['g_nerves', 'g_power_out', 'g_nia_card'].map(id => !!g(id).urgent && g(id).hook === 'night')),
        watch: ['g_link_bell', 'g_mountain', 'gh_band', 'gh_eagle', 'gh_seal', 'gh_hotshop'].map(id => { const c = g(id).choices(); return [c.length, g(id).dflt, /watch/i.test(c[0].l), /keep going/i.test(c[1].l)]; }) };
    });
    assert.ok(r.urgent.every(Boolean), JSON.stringify(r.urgent));
    for (const w of r.watch) assert.deepStrictEqual(w, [2, 1, true, true]);
    noErrors(errors);
  } },
  { name: 'chains: the mural remembers whether you helped, and the barbecue, the giveaway and the first day remember your choices', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page, 12);
    const r = await page.evaluate(() => {
      const g = id => EV.find(x => x.id === id), base = JSON.stringify(S), out = {};
      const at = (d, m, loc) => { S = JSON.parse(base); S.cur = d; S.t = d * 1440 + m; S.loc = loc; };
      // helping paints your patch of sky into the finished mural, and queues it
      at(1, 700, 'mlk'); g('g_mural').choices()[0].fn();
      out.helped = { flag: eventFlag('g_mural'), queued: S.ev.force.includes('g_mural_done'), ach: S.mural };
      let n0 = uiNarr.length; g('g_mural_done').run({ at: 'mlk', hook: 'arrive' }); out.doneHelped = uiNarr.slice(n0).join(' ');
      at(1, 700, 'mlk'); g('g_mural').choices()[1].fn(); out.watched = eventFlag('g_mural');
      n0 = uiNarr.length; g('g_mural_done').run({ at: 'mlk', hook: 'arrive' }); out.doneWatched = uiNarr.slice(n0).join(' ');
      at(1, 700, 'mlk'); g('g_mural').choices()[2].fn(); out.passed = { flag: eventFlag('g_mural') || null, queued: S.ev.force.includes('g_mural_done') };
      // the barbecue: the lights you hung come on
      at(5, 540, 'home'); g('g_bbq_morning').choices()[0].fn(); S.t = 5 * 1440 + 960; n0 = uiNarr.length; GROW.bbq(); out.bbq = uiNarr.slice(n0).join(' ');
      // the giveaway: your family came because of your picture of the flyer
      at(1, 700, 'library'); g('g_flyer').choices()[0].fn(); const f0 = S.family; S.cur = 5; S.t = 5 * 1440 + 660; S.loc = 'peoples'; n0 = uiNarr.length; GROW.giveaway(); out.give = { txt: uiNarr.slice(n0).join(' '), fam: S.family - f0 };
      // the shortcut: walking it with Zay, or keeping to the long way
      at(2, 800, 'school'); gFriend('zay', 2); g('g_zay_shortcut').choices()[0].fn(); out.zay = [S.shortcut, eventFlag('g_zay_shortcut')];
      at(2, 800, 'school'); gFriend('zay', 2); g('g_zay_shortcut').choices()[2].fn(); out.zayNo = S.shortcut;
      S = JSON.parse(base); render();
      return out;
    });
    assert.deepStrictEqual(r.helped, { flag: 'helped', queued: true, ach: true });
    assert.match(r.doneHelped, /Yours/); assert.strictEqual(r.watched, 'watched'); assert.match(r.doneWatched, /watched that sky/);
    assert.deepStrictEqual(r.passed, { flag: null, queued: false });
    assert.match(r.bbq, /lights you hung/);
    assert.match(r.give.txt, /picture of the flyer/); assert.ok(r.give.fam >= 3, 'family came along');
    assert.deepStrictEqual(r.zay, [true, 'walked']); assert.strictEqual(r.zayNo, false);
    noErrors(errors);
  } },
  { name: 'a forced event fires through its hook and offers its choices, and the default applies at night', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page, 12);
    const r = await page.evaluate(() => {
      S.cur = 2; S.t = 2 * 1440 + 700; S.loc = 'home'; closeModals();
      const f0 = S.family; forceEvent('g_lorraine'); fireHook('arrive', { at: 'home', from: 'mlk' });
      const fired = (S.ev.count.g_lorraine || 0) === 1, pend = JSON.stringify(S.ev.pending || []);
      closeModals(); endDay('home'); closeModals();
      return { fired, pend, after: JSON.stringify(S.ev.pending || []), log: S.log.map(e => e.s).join('\n'), fam: S.family - f0 };
    });
    assert.ok(r.fired, 'it fired');
    assert.match(r.pend, /g_lorraine/, 'a pending decision');
    assert.doesNotMatch(r.after, /g_lorraine/, 'decided by morning');
    assert.match(r.log, /Come by any time/, 'the default (wave and say hi) was applied');
    noErrors(errors);
  } },
];
