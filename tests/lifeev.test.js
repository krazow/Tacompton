const fs = require('fs'), path = require('path');
const { open, noErrors, assert } = require('./helpers');

// Life events (src/js/36-life-events.js): everyday setbacks, each softened by a habit or purchase chosen ahead of time.
const BAD = /\b(romance|romantic|crush\w*|dat(e|es|ing)|boyfriends?|girlfriends?|kiss\w*|flirt\w*|sexy?|sexual|couples?|fish\w*|salmon|marina|charters?|wdfw|chinook|coho|herring)\b/i;

async function start(page, { grow = false, length = 'quick', age } = {}) {
  await page.evaluate(([grow, length, age]) => {
    closeModals(); setMode(grow ? 'grow' : 'adult');
    LIFE_PICK = length === 'quick' ? null : { length, startAge: age || (grow ? 12 : 18), birthday: { m: 3, d: 14, label: 'March 14' } };
    newGame('normal'); closeModals(); if (!isGrow()) { pickJob('cafe'); closeModals(); } tab = 'act'; render();
  }, [grow, length, age]);
}

// Fire an event (forced) with a setup, then press each of its options from the same starting state; returns what each did.
function runCases(page, cases) {
  return page.evaluate(cases => {
    const snap = () => ({ money: S.money, t: S.t, energy: S.energy, stress: S.stress, community: S.community, food: S.food, mood: S.mood, family: S.family,
      jar: S.lev ? S.lev.jar : 0, inv: JSON.stringify(S.lev ? S.lev.inv : {}), lev: JSON.stringify(S.lev || {}), flags: JSON.stringify(S.ev.flags), kids: JSON.stringify(S.kids || {}) });
    const diff = (a, b) => { const o = {}; for (const k in a) if (a[k] !== b[k]) o[k] = typeof a[k] === 'number' ? Math.round((b[k] - a[k]) * 100) / 100 : b[k]; return o; };
    const base = JSON.stringify(S), out = {};
    for (const c of cases) {
      const e = EV.find(x => x.id === c.id), r = { opts: [], fired: false, n: 0, lines: [] };
      for (let i = 0; i < 4; i++) {
        S = JSON.parse(base); closeModals(); uiNarr = [];
        new Function(c.setup || '')();
        S.ev.last = {}; S.ev.count = {}; EV.forEach(x => { if (!/^lev_/.test(x.id)) S.ev.count[x.id] = 9999; }); if (S.ev.pending) S.ev.pending = [];
        forceEvent(c.id);
        const ctx = Object.assign({ fired: [] }, c.ctx || {});
        const s0 = snap();
        const rnd = Math.random; Math.random = () => 0.99999; try { fireHook(c.hook, ctx); } finally { Math.random = rnd; }
        closeModals();
        r.fired = ctx.fired.includes(c.id);
        if (i === 0) { r.run = diff(s0, snap()); r.lines = uiNarr.slice(); }
        const ch = e.choices ? e.choices() : [];
        r.n = ch.length; r.dflt = e.dflt; r.urgent = !!e.urgent;
        if (i >= ch.length) break;
        if (ch[i].dis) { r.opts.push({ l: ch[i].l, dis: true }); continue; }
        const a = snap(); ch[i].fn(); r.opts.push({ i, l: ch[i].l, d: diff(a, snap()), say: uiNarr[uiNarr.length - 1] || '' });
      }
      out[c.name || c.id] = r;
    }
    S = JSON.parse(base); closeModals();
    return out;
  }, cases);
}
function check(r, name) {
  assert.ok(r.fired, name + ' fired');
  assert.ok(r.n >= 2 && r.n <= 3, `${name}: 2–3 options (${r.n})`);
  assert.ok(Number.isInteger(r.dflt) && r.dflt >= 0 && r.dflt < r.n, `${name}: a default index`);
  const on = r.opts.filter(o => !o.dis);
  assert.ok(on.length >= 2, `${name}: at least two options can be pressed`);
  const sig = new Set(on.map(o => JSON.stringify(o.d)));
  assert.ok(sig.size >= 2, `${name}: the options do different things ${JSON.stringify(on)}`);
  on.forEach(o => assert.ok(Object.keys(o.d).length > 0 || o.i === r.dflt, `${name}: "${o.l}" does something`));
}

const ADULT = [
  { id: 'lev_wallet', name: 'wallet (back of the bus)', hook: 'travel', ctx: { from: 'link', to: 'dt_dome' }, setup: 'S.t=S.cur*1440+900;S.money=500;S.loc="dt_dome";' },
  { id: 'lev_wallet', name: 'wallet (up front)', hook: 'travel', ctx: { from: 'link', to: 'dt_dome' }, setup: 'S.t=S.cur*1440+900;S.money=500;S.loc="dt_dome";window.LEV.S().front=true;' },
  { id: 'lev_phone', name: 'phone (open pocket)', hook: 'arrive', ctx: { at: 'dt_pacific', from: 'link' }, setup: 'S.t=S.cur*1440+800;S.money=500;S.loc="dt_pacific";' },
  { id: 'lev_phone', name: 'phone (zipped)', hook: 'arrive', ctx: { at: 'dt_pacific', from: 'link' }, setup: 'S.t=S.cur*1440+800;S.money=500;S.loc="dt_pacific";window.LEV.S().zip=true;' },
  { id: 'lev_package', name: 'package (porch)', hook: 'wake', setup: 'S.cur=2;S.t=S.cur*1440+400;S.loc="home";S.money=500;' },
  { id: 'lev_package', name: 'package (locker)', hook: 'wake', setup: 'S.cur=2;S.t=S.cur*1440+400;S.loc="home";S.money=500;window.LEV.S().locker=1;' },
  { id: 'lev_package_back', hook: 'wake', setup: 'S.cur=4;S.t=S.cur*1440+400;S.loc="home";typeof setEventFlag==="function"?setEventFlag("lev_pkg_claim",2):(S.ev.flags.lev_pkg_claim=2);' },
  { id: 'lev_bus', name: 'bus (left late)', hook: 'travel', ctx: { from: 'home', to: 'work' }, setup: 'S.cur=0;S.t=S.cur*1440+job().start-2;S.loc="work";' },
  { id: 'lev_bus', name: 'bus (left early)', hook: 'travel', ctx: { from: 'home', to: 'work' }, setup: 'S.cur=0;S.t=S.cur*1440+job().start-30;S.loc="work";window.LEV.S().route=true;' },
  { id: 'lev_rain', name: 'rain (no umbrella)', hook: 'travel', ctx: { from: 'home', to: 'mlk' }, setup: 'S.t=S.cur*1440+700;S.loc="mlk";S.money=500;' },
  { id: 'lev_rain', name: 'rain (umbrella)', hook: 'travel', ctx: { from: 'home', to: 'mlk' }, setup: 'S.t=S.cur*1440+700;S.loc="mlk";window.LEV.S().inv.umbrella=1;' },
  { id: 'lev_scam', name: 'scam text', hook: 'wake', setup: 'S.cur=1;S.t=S.cur*1440+400;S.money=500;' },
  { id: 'lev_scam', name: 'scam text (group chat)', hook: 'wake', setup: 'S.cur=1;S.t=S.cur*1440+400;S.money=500;window.LEV.S().chat=1;' },
  { id: 'lev_fridge', name: 'fridge (empty jar)', hook: 'wake', setup: 'S.cur=2;S.t=S.cur*1440+400;S.loc="home";S.money=500;S.food=3;' },
  { id: 'lev_fridge', name: 'fridge (jar)', hook: 'wake', setup: 'S.cur=2;S.t=S.cur*1440+400;S.loc="home";S.money=500;S.food=3;window.LEV.S().jar=200;' },
  { id: 'lev_fridge_fixed', hook: 'wake', setup: 'S.cur=5;S.t=S.cur*1440+400;S.loc="home";S.money=500;typeof setEventFlag==="function"?setEventFlag("lev_fridge_wait",2):(S.ev.flags.lev_fridge_wait=2);' },
  { id: 'lev_outage', name: 'outage (dark)', hook: 'arrive', ctx: { at: 'home', from: 'mlk' }, setup: 'S.t=S.cur*1440+1200;S.loc="home";S.money=500;' },
  { id: 'lev_outage', name: 'outage (flashlight)', hook: 'arrive', ctx: { at: 'home', from: 'mlk' }, setup: 'S.t=S.cur*1440+1200;S.loc="home";window.LEV.S().inv.flashlight=1;' },
  { id: 'lev_hustle', name: 'hustle (new here)', hook: 'arrive', ctx: { at: 'dt_pacific', from: 'link' }, setup: 'S.t=S.cur*1440+700;S.loc="dt_pacific";S.money=500;S.community=5;' },
  { id: 'lev_hustle', name: 'hustle (knows the hill)', hook: 'arrive', ctx: { at: 'dt_pacific', from: 'link' }, setup: 'S.t=S.cur*1440+700;S.loc="dt_pacific";S.money=500;S.community=50;' },
  { id: 'lev_battery', name: 'battery (no cables)', hook: 'arrive', ctx: { at: 'home', from: 'mlk' }, setup: 'S.t=S.cur*1440+700;S.loc="home";S.money=500;' },
  { id: 'lev_battery', name: 'battery (cables)', hook: 'arrive', ctx: { at: 'home', from: 'mlk' }, setup: 'S.t=S.cur*1440+700;S.loc="home";S.money=500;window.LEV.S().inv.cables=1;' },
  { id: 'lev_favor', hook: 'wake', setup: 'S.cur=5;S.t=S.cur*1440+400;S.loc="home";typeof setEventFlag==="function"?setEventFlag("lev_favor",2):(S.ev.flags.lev_favor=2);' },
  { id: 'lev_dog', name: 'lost dog', hook: 'arrive', ctx: { at: 'mlk', from: 'home' }, setup: 'S.t=S.cur*1440+700;S.loc="mlk";' },
  { id: 'lev_dog', name: 'lost dog (group chat)', hook: 'arrive', ctx: { at: 'mlk', from: 'home' }, setup: 'S.t=S.cur*1440+700;S.loc="mlk";window.LEV.S().chat=1;' },
  { id: 'lev_er', name: 'ER ride', hook: 'arrive', ctx: { at: 'home', from: 'mlk' }, setup: 'S.t=S.cur*1440+1110;S.loc="home";S.money=500;' },
  { id: 'lev_er', name: 'ER ride (jar)', hook: 'arrive', ctx: { at: 'home', from: 'mlk' }, setup: 'S.t=S.cur*1440+1110;S.loc="home";S.money=500;window.LEV.S().jar=60;' },
];
const KIDS_CASES = [
  { id: 'lev_g_bike', name: 'bike (no lock)', hook: 'arrive', ctx: { at: 'library', from: 'home' }, setup: 'S.t=S.cur*1440+700;S.loc="library";S.money=20;' },
  { id: 'lev_g_bike', name: 'bike (lock)', hook: 'arrive', ctx: { at: 'library', from: 'home' }, setup: 'S.t=S.cur*1440+700;S.loc="library";window.LEV.S().inv.lock=1;' },
  { id: 'lev_g_bike_back', hook: 'wake', setup: 'S.cur=3;S.t=S.cur*1440+450;S.money=20;typeof setEventFlag==="function"?setEventFlag("lev_g_bike_back",1):(S.ev.flags.lev_g_bike_back=1);' },
  { id: 'lev_g_hassle', name: 'hassle (alone)', hook: 'travel', ctx: { from: 'home', to: 'school' }, setup: 'S.t=S.cur*1440+470;S.loc="school";S.money=20;' },
  { id: 'lev_g_hassle', name: 'hassle (with a friend)', hook: 'travel', ctx: { from: 'home', to: 'school' }, setup: 'S.t=S.cur*1440+470;S.loc="school";gFriend("ana",4);window.LEV.S().buddy=true;' },
];

module.exports = [
  { name: 'adult life events: each fires, offers 2–3 choices that do different things, and habits soften the blow', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page);
    const r = await runCases(page, ADULT);
    for (const k in r) check(r[k], k);
    // the habit or purchase chosen ahead of time changes the setback itself
    assert.ok(r['wallet (back of the bus)'].run.money < r['wallet (up front)'].run.money, 'sitting up front loses less');
    assert.strictEqual(r['wallet (up front)'].run.money, -11, 'up front: $15, lighter in Quick play'); assert.strictEqual(r['wallet (back of the bus)'].run.money, -42);
    assert.match(r['phone (zipped)'].lines.join(' '), /zipper, gives up/); assert.match(r['phone (open pocket)'].lines.join(' '), /snatches/);
    assert.match(r['package (locker)'].lines.join(' '), /safe behind a code/);
    assert.ok(r['bus (left early)'].opts.every(o => !/late\b/.test(o.l)) && r['bus (left early)'].opts.length === 3);
    const ff = r['fridge (jar)'].opts[0].d; assert.strictEqual(ff.money, undefined, 'the jar pays the repair, not the wallet'); assert.ok(ff.jar < 0);
    assert.ok(r['fridge (empty jar)'].opts[0].d.money < 0);
    assert.ok(r['fridge (empty jar)'].urgent && r["bus (left late)"].urgent);
    assert.match(r['outage (flashlight)'].lines.join(' '), /normal evening/);
    assert.match(r['hustle (knows the hill)'].lines.join(' '), /Bev warned/);
    assert.ok(r['scam text (group chat)'].opts.some(o => /group chat/.test(o.l)) && !r['scam text'].opts.some(o => /group chat/.test(o.l)));
    assert.ok(r['lost dog (group chat)'].opts[0].d.t < r['lost dog'].opts[0].d.t, 'the group chat finds the owner faster');
    assert.strictEqual(r['ER ride (jar)'].opts[0].d.money, undefined, 'the jar pays for the ride');
    // chains: a choice sets a flag, the follow-up reads it
    assert.ok(/lev_pkg_claim/.test(r['package (porch)'].opts[0].d.flags || ''), 'filing a claim sets up the replacement');
    assert.ok(/lev_favor/.test(r['battery (cables)'].opts[0].d.flags || ''), 'jumping the car earns a favor');
    noErrors(errors);
  } },
  { name: 'Growing Up life events: the bike lock, the inside pocket, walking with a friend, the Link route map', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page, { grow: true, length: '1y', age: 12 });
    const r = await runCases(page, KIDS_CASES);
    for (const k in r) check(r[k], k);
    assert.match(r['bike (lock)'].lines.join(' '), /Yours is right where you left it/);
    assert.match(r['hassle (with a friend)'].lines.join(' '), /two of you/);
    // lunch money (a school day in the fall) and the first Link ride (at 14)
    await page.evaluate(() => { S.cur = dayIndexOf(2026, 10, 14); S.t = S.cur * 1440 + 600; S.loc = 'school'; S.money = 20; });
    const l = await runCases(page, [
      { id: 'lev_g_lunch', name: 'lunch (back pocket)', hook: 'arrive', ctx: { at: 'school', from: 'home' }, setup: 'S.money=20;' },
      { id: 'lev_g_lunch', name: 'lunch (inside pocket)', hook: 'arrive', ctx: { at: 'school', from: 'home' }, setup: 'S.money=20;window.LEV.S().kpocket=true;' },
      { id: 'lev_g_lunch_found', hook: 'wake', setup: 'S.cur+=1;S.t=S.cur*1440+450;typeof setEventFlag==="function"?setEventFlag("lev_g_lunch_found",S.cur-1):(S.ev.flags.lev_g_lunch_found=S.cur-1);' },
      { id: 'lev_g_linklost', name: 'first Link ride (no map)', hook: 'travel', ctx: { from: 'mlk', to: 'dt_pacific' }, setup: 'S.age=14;S.loc="dt_pacific";' },
      { id: 'lev_g_linklost', name: 'first Link ride (map)', hook: 'travel', ctx: { from: 'mlk', to: 'dt_pacific' }, setup: 'S.age=14;S.loc="dt_pacific";window.LEV.S().kmap=true;' },
    ]);
    for (const k in l) check(l[k], k);
    assert.strictEqual(l['lunch (back pocket)'].run.money, -6); assert.strictEqual(l['lunch (inside pocket)'].run.money, -3, 'the inside pocket keeps half');
    assert.ok(l['first Link ride (no map)'].run.t > 0 && !l['first Link ride (map)'].run.t, 'the route map gets you there on time');
    noErrors(errors);
  } },
  { name: 'the supporting actions: the savings jar, habits, corner-market items, the locker, the group chat and the block club', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page);
    const r = await page.evaluate(() => {
      const A = re => actionsHere().find(x => re.test(x.l)), o = {};
      S.loc = 'home'; S.t = S.cur * 1440 + 700; S.money = 300;
      A(/Put \$20 in the savings jar/).fn(); A(/Put \$20 in the savings jar/).fn(); o.jar = [S.lev.jar, S.money];
      A(/Take \$20 out/).fn(); o.jar2 = [S.lev.jar, S.money]; o.tag = statusTags().join('');
      A(/zipped pocket/).fn(); o.zip = S.lev.zip;
      o.chat = A(/group chat/).dis; ['lorraine', 'kim', 'dre', 'ron', 'bev'].forEach(k => S.met[k] = 1); A(/group chat/).fn(); o.chat2 = !!S.lev.chat;
      S.loc = 'mlk'; for (const re of [/umbrella/, /flashlight/, /Jumper cables/, /pickup locker/]) A(re).fn();
      o.inv = Object.keys(S.lev.inv).sort(); o.locker = !!S.lev.locker; o.gone = !A(/umbrella/);
      S.loc = 'link'; A(/Sit up front/).fn(); o.front = S.lev.front; A(/route map/).fn(); o.route = S.lev.route;
      S.loc = 'peoples'; S.cur = 3; S.t = S.cur * 1440 + 1100; o.thu = dayName(day()); A(/block club meeting/).fn(); o.tenant = S.lev.tenant; o.once = !A(/block club meeting/);
      return o;
    });
    assert.deepStrictEqual(r.jar, [40, 260]); assert.deepStrictEqual(r.jar2, [20, 280]); assert.match(r.tag, /🫙 jar \$20/);
    assert.ok(r.zip && r.chat && r.chat2 && r.locker && r.gone && r.front && r.route && r.tenant && r.once);
    assert.strictEqual(r.thu, 'Thursday');
    assert.deepStrictEqual(r.inv, ['cables', 'flashlight', 'umbrella']);
    // Growing Up: the bike lock, the habits and the route map
    await start(page, { grow: true, length: '1y', age: 12 });
    const g = await page.evaluate(() => { S.age = 13;
      const A = re => GROW.actionsHere().find(x => re.test(x.l)), o = {};
      S.money = 20; S.loc = 'mlk'; S.t = S.cur * 1440 + 700; A(/bike lock/).fn(); o.lock = !!S.lev.inv.lock;
      S.loc = 'home'; A(/inside pocket/).fn(); o.pocket = S.lev.kpocket; o.buddy0 = !A(/walk to the bus stop/);
      gFriend('ana', 4); A(/walk to the bus stop/).fn(); o.buddy = S.lev.buddy;
      S.loc = 'library'; S.t = S.cur * 1440 + 700; A(/Link route map/).fn(); o.map = S.lev.kmap;
      return o;
    });
    assert.deepStrictEqual(g, { lock: true, pocket: true, buddy0: true, buddy: true, map: true });
    noErrors(errors);
  } },
  { name: 'Quick play gets fewer life events; the longer games space them out; robbery stays off Hilltop', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page);
    const r = await page.evaluate(() => {
      const e = id => EV.find(x => x.id === id), o = {};
      S.t = S.cur * 1440 + 900; S.ev.last = {}; S.ev.count = {};
      o.ok = e('lev_wallet').cond({ hook: 'travel', from: 'link', to: 'dt_dome' });
      o.hill = e('lev_wallet').cond({ hook: 'travel', from: 'home', to: 'mlk' }) || e('lev_phone').cond({ hook: 'arrive', at: 'link', from: 'home' });
      o.chance = e('lev_wallet').chance({});
      ['lev_scam', 'lev_rain', 'lev_dog', 'lev_hustle'].forEach(id => { S.ev.count[id] = 1; S.ev.last[id] = -5; });
      o.capped = e('lev_wallet').cond({ hook: 'travel', from: 'link', to: 'dt_dome' });
      S.ev.count = { lev_wallet: 1 }; S.ev.last = { lev_wallet: -5 }; o.once = e('lev_wallet').cond({ hook: 'travel', from: 'link', to: 'dt_dome' });
      S.ev.count = {}; S.ev.last = { lev_scam: day() }; o.sameDay = e('lev_wallet').cond({ hook: 'travel', from: 'link', to: 'dt_dome' });
      return o;
    });
    assert.ok(r.ok, 'can happen on a downtown ride'); assert.ok(!r.hill, 'never on Hilltop'); assert.ok(r.chance < 0.035, 'Quick play: rarer');
    assert.ok(!r.capped && !r.once && !r.sameDay, 'Quick play: at most 4, one of each, one a day');
    await start(page, { length: '1y', age: 18 });
    const l = await page.evaluate(() => {
      const e = EV.find(x => x.id === 'lev_wallet'), c = { hook: 'travel', from: 'link', to: 'dt_dome' }; S.t = S.cur * 1440 + 900;
      S.ev.count = { lev_wallet: 1, lev_scam: 1, lev_rain: 2, lev_dog: 1, lev_hustle: 1 }; S.ev.last = { lev_scam: day() - 5 };
      const ok = e.cond(c); S.ev.last = { lev_scam: day() - 1 }; const near = e.cond(c);
      return { ok, near, cd: e.cooldown, ch: e.chance({}) };
    });
    assert.ok(l.ok && !l.near, 'longer games: more of them, never two within two days');
    assert.ok(l.cd >= 28 && l.ch === 0.035);
    noErrors(errors);
  } },
  { name: 'no romance, dating or fishing words in the life events', fn: async () => {
    const src = fs.readFileSync(path.join(__dirname, '..', 'src/js/36-life-events.js'), 'utf8');
    const m = src.match(new RegExp(BAD.source, 'ig'));
    assert.strictEqual(m, null, 'words: ' + (m || []).join(', '));
  } },
];
