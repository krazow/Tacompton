const fs = require('fs'), path = require('path');
const { open, noErrors, assert } = require('./helpers');

// The gang life path (src/js/62-gang.js): optional, longer games only, real costs and ways out that always work.
const SRC = fs.readFileSync(path.join(__dirname, '../src/js/62-gang.js'), 'utf8');
// nothing graphic, no how-to, no real set names, nothing about romance or fishing
const GRAPHIC = /\b(blood\w*|bleed\w*|shoot\w*|shot|shots|stab\w*|bullets?|knife|knives|pistol|glock|rifle|ammo|trigger|cocaine|crack|heroin|meth|fentanyl|cook\w*|deal(s|er|ers|ing)?|ounces?|grams?|kilos?|weigh\w*|stash\w*|murder\w*|kill\w*|corpse|gore|crips?|bloods|piru|sure[nñ]os?|norte[nñ]os?|gun\w*)\b/i;
const OTHER = /\b(romance|romantic|crush\w*|dat(e|es|ing)|boyfriends?|girlfriends?|kiss\w*|flirt\w*|sexy?|sexual|fish\w*|salmon|marina|charters?|wdfw)\b/i;

async function life(page, { len = '1y', age = 12, quick = false } = {}) {
  await page.evaluate(([len, age, quick]) => {
    if (typeof SCH_SNOW !== 'undefined') SCH_SNOW = 0;
    closeModals(); setMode(age < 18 ? 'grow' : 'adult');
    LIFE_PICK = quick ? null : { length: len, startAge: age, birthday: { m: 3, d: 14, label: 'March 14' } };
    newGame('normal'); closeModals(); if (age >= 18 && !S.jobPicked) { pickJob('cafe'); closeModals(); } tab = 'act'; render();
  }, [len, age, quick]);
}
// run an event's choice by index from a copy of the state; returns the gang meters and a few stats after
function choose(page, id, i, setup) {
  return page.evaluate(([id, i, setup]) => {
    new Function(setup || '')();
    const e = EV.find(x => x.id === id); closeModals(); uiNarr = [];
    const ok = e.cond({}); if (ok) e.run({});
    const ch = e.choices ? e.choices({}) : []; const n = ch.length;
    if (ch[i]) ch[i].fn();
    const g = GANG.S();
    return { ok, n, dflt: e.dflt, g: JSON.parse(JSON.stringify(g)), family: isGrow() ? S.family : S.life.family, grades: S.grades, money: S.money, said: uiNarr.join(' ') };
  }, [id, i, setup]);
}

module.exports = [
  { name: 'no joining under 14 or in Quick play, and no gang events in Quick play', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await life(page, { quick: true, age: 12 });
    const q = await page.evaluate(() => { S.age = 15; GANG.adj({ rep: 60 }); const fire = GANG.ids.filter(id => EV.find(e => e.id === id).cond({}));
      return { can: GANG.canJoin(), rec: GANG.canRecruit(), join: GANG.join(), member: GANG.member(), fire, week: GANG.weekHTML() }; });
    assert.strictEqual(q.can, false); assert.strictEqual(q.rec, false); assert.strictEqual(q.join, false); assert.strictEqual(q.member, false);
    assert.deepStrictEqual(q.fire, [], 'no gang event can fire in Quick play'); assert.strictEqual(q.week, '', 'no meters in Quick play');
    await life(page, { len: '1y', age: 12 });
    const l = await page.evaluate(() => { const r = {}; GANG.adj({ rep: 40 });
      S.age = 12; r.rec12 = GANG.canRecruit(); S.age = 13; r.rec13 = GANG.canRecruit(); r.join13 = GANG.canJoin(); r.inv13 = EV.find(e => e.id === 'gang_invite').cond({});
      S.age = 14; r.join14 = GANG.canJoin(); r.inv14 = EV.find(e => e.id === 'gang_invite').cond({}); return r; });
    assert.deepStrictEqual(l, { rec12: false, rec13: true, join13: false, inv13: false, join14: true, inv14: true });
    noErrors(errors);
  } },
  { name: 'Street Rep 30+ for an invitation, two at most, and two refusals close the door for a year', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await life(page, { len: '1y', age: 15 });
    const low = await page.evaluate(() => { GANG.adj({ rep: 29 }); return GANG.inviteOpen(); });
    assert.strictEqual(low, false, 'not under Street Rep 30');
    let r = await choose(page, 'gang_invite', 1, 'GANG.adj({rep:5});');
    assert.ok(r.ok && r.n === 2 && r.dflt === 1, 'the first invitation, two options, saying no is the default');
    assert.strictEqual(r.g.invites, 1); assert.strictEqual(r.g.refused, 1); assert.strictEqual(r.g.member, false);
    r = await choose(page, 'gang_invite', 1);
    assert.ok(r.ok, 'a second invitation'); assert.strictEqual(r.g.refused, 0); assert.ok(r.g.closedUntil >= 365, 'the door closes for a year');
    const later = await page.evaluate(() => { const a = GANG.inviteOpen(); S.cur += 366; GANG.adj({ rep: 30 }); return [a, GANG.inviteOpen()]; });
    assert.deepStrictEqual(later, [false, true], 'closed, then open again a year later');
    // say yes: the initiation is one off-screen beat
    r = await choose(page, 'gang_invite', 0, 'S.family=70;S.energy=90;');
    assert.ok(r.g.member && r.g.rank === 'lookout'); assert.ok(r.g.rep >= 50, 'Street Rep +20'); assert.strictEqual(r.family, 50, 'Family −20');
    const m = await page.evaluate(() => { const t = document.getElementById('mbg').innerText; MBTN(0); return { t, e: S.energy, tired: GANG.S().tired }; });
    assert.match(m.t, /off-screen/); assert.ok(m.e <= 50 && m.tired === 7, 'a week of lost energy');
    noErrors(errors);
  } },
  { name: 'ranks by age and Street Rep, only up; the meters clamp', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await life(page, { len: 'life', age: 12 });
    const t = await page.evaluate(() => [[13, 90], [14, 0], [15, 39], [15, 40], [16, 60], [20, 100], [21, 70], [21, 69]].map(([a, r]) => GANG.rankFor(a, r)));
    assert.deepStrictEqual(t, [null, 'lookout', 'lookout', 'runner', 'soldier', 'soldier', 'og', 'soldier']);
    const p = await page.evaluate(() => { S.age = 14; GANG.adj({ rep: 30 }); GANG.join(); closeModals(); const a = [GANG.rank()];
      S.age = 15; GANG.adj({ rep: 100 }); GANG.promote(); a.push(GANG.rank()); S.age = 16; lifeHook('birthday', 16); a.push(GANG.rank());
      GANG.adj({ rep: -100 }); GANG.promote(); a.push(GANG.rank()); return a; });
    assert.deepStrictEqual(p, ['lookout', 'runner', 'soldier', 'soldier']);
    const c = await page.evaluate(() => [GANG.adj({ rep: 500, heat: -50, loyalty: 1e3 }), GANG.adj({ rep: -999, heat: 999, loyalty: -5e3 })]);
    assert.deepStrictEqual(c, [{ rep: 100, heat: 0, loyalty: 100 }, { rep: 0, heat: 100, loyalty: 0 }]);
    // safe to call any time, even before a save has S.gang
    const f = await page.evaluate(() => { delete S.gang; return [GANG.adj({ heat: 5 }).heat, GANG.member(), GANG.rank()]; });
    assert.deepStrictEqual(f, [5, false, null]);
    noErrors(errors);
  } },
  { name: 'the costs: grades, graduation odds and family fall each week; Heat fades lying low; the Week tab shows the meters', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await life(page, { len: 'life', age: 12 });
    const r = await page.evaluate(() => { S.age = 15; S.grades = 70; S.family = 80; GANG.adj({ rep: 45 }); GANG.join(); closeModals(); GANG.promote();
      const a = { g0: S.grades, f0: S.family, o0: GANG.gradOdds() }; lifeHook('weekStart', lifeKw());
      a.g1 = S.grades; a.f1 = S.family; const notes = []; lifeHook('skip', 0, 69, 'study', notes); a.g2 = S.grades; a.f2 = S.family; a.o2 = GANG.gradOdds(); a.notes = notes.join(' ');
      tab = 'week'; render(); a.week = document.getElementById('app').innerText;
      GANG.out('outreach'); GANG.adj({ heat: 60 }); const h = GANG.S().heat; lifeHook('skip', 70, 139, 'study', []); a.h = [h, GANG.S().heat]; return a; });
    assert.ok(r.g1 < r.g0 && r.g2 < r.g1, 'grades drop each week ' + [r.g0, r.g1, r.g2]);
    assert.ok(r.f1 < r.f0 && r.f2 < r.f1, 'family falls ' + [r.f0, r.f1, r.f2]);
    assert.ok(r.o2 < 0.95, 'graduation odds drop'); assert.match(r.notes, /from the crew/);
    for (const s of ['Street Rep', 'Heat', 'Loyalty', 'Runner', 'Graduation odds', 'Ways out']) assert.ok(r.week.includes(s), 'Week tab: ' + s);
    assert.ok(r.h[1] < r.h[0], 'Heat fades once you lie low');
    // a missed graduation when the odds fail
    const g = await page.evaluate(() => { GANG.S().weeks = 200; S.grades = 20; const rnd = Math.random; Math.random = () => 0.99; try { lifeGraduation(() => {}); } finally { Math.random = rnd; }
      return { t: document.getElementById('mbg').innerText, nd: GANG.S().noDiploma }; });
    assert.match(g.t, /Not this June/); assert.ok(g.nd);
    noErrors(errors);
  } },
  { name: 'arrests: juvenile detention with diversion under 18, adult charges and prison with reentry from 18', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await life(page, { len: 'life', age: 12 });
    let r = await choose(page, 'gang_sweep', 0, 'S.age=16;GANG.adj({rep:60,heat:90});GANG.join();closeModals();GANG.promote();');
    assert.ok(r.ok && r.n === 2); assert.strictEqual(r.g.juv, 1); assert.strictEqual(r.g.member, false); assert.strictEqual(r.g.out, 'outreach');
    assert.match(r.said, /Remann Hall/); assert.match(r.said, /diversion/);
    await life(page, { len: 'life', age: 18 });
    r = await page.evaluate(() => { GANG.adj({ rep: 80, heat: 90 }); GANG.join(); closeModals(); GANG.promote(); const k0 = S.kwi, a0 = S.age;
      const i = GANG.prison(3); const t = document.getElementById('mbg').innerText; MBTN(0);
      return { k0, a0, i, kwi: S.kwi, age: S.age, job: S.job, t, g: GANG.S(), sum: GANG.summary().map(x => x.join(' ')).join(' | ') }; });
    assert.ok(r.kwi > r.k0 && r.kwi === r.i, 'the years pass in one jump'); assert.ok(r.age >= r.a0 + 3, 'three years older ' + r.age);
    assert.strictEqual(r.job, 'kitchen', 'a reentry job'); assert.ok(r.g.record && r.g.out === 'prison'); assert.match(r.t, /record/);
    assert.match(r.sum, /Prison/);
    noErrors(errors);
  } },
  { name: 'every way out works: outreach, the glass-art studio (an arts career), moving away, prison and mentoring', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await life(page, { len: 'life', age: 12 });
    const o = await page.evaluate(() => { S.age = 15; GANG.adj({ rep: 40 }); GANG.join(); closeModals(); GANG.adj({ loyalty: 30 }); const l0 = GANG.S().loyalty;
      tab = 'week'; render(); gangWaysOut(); const t = document.getElementById('mbg').innerText; MBTN(0); closeModals();
      const g = GANG.S(); return { t, l0, l1: g.loyalty, member: g.member, out: g.out, tense: g.tense, linger: g.linger, tenseOk: EV.find(e => e.id === 'gang_tense').cond({}), rivalOk: EV.find(e => e.id === 'gang_rival').cond({}) }; });
    for (const s of ['outreach', 'glass-art studio', 'moving away']) assert.ok(o.t.toLowerCase().includes(s), 'Ways out offers ' + s);
    assert.ok(!o.member && o.out === 'outreach'); assert.strictEqual(o.l1, Math.max(0, o.l0 - 40), 'leaving costs Loyalty'); assert.ok(o.tense === 3 && o.tenseOk && o.rivalOk, 'tense weeks and rivals after');
    // the studio: out, and an arts path at 18
    await life(page, { len: 'life', age: 12 });
    const a = await page.evaluate(() => { S.age = 14; GANG.adj({ rep: 40 }); GANG.join(); closeModals(); GANG.art(); const g = GANG.S(); const r = { out: g.out, arts: g.arts };
      lifePathSheet(() => {}); const btns = [...document.querySelectorAll('#mbg .modal > button.act')].map(b => b.innerText); r.btns = btns.join(' | ');
      const i = btns.findIndex(b => /Glass art/.test(b)); MBTN(i); r.jobs = S.life.jobs.map(j => j.t || j.job).join(','); r.career = GANG.S().artsCareer; closeModals(); return r; });
    assert.ok(a.out === 'art' && a.arts); assert.match(a.btns, /Glass art/); assert.match(a.jobs, /glass-art/); assert.ok(a.career);
    // moving away ends the Hilltop chapter
    await life(page, { len: 'life', age: 12 });
    const m = await page.evaluate(() => { S.age = 15; GANG.adj({ rep: 40 }); GANG.join(); closeModals(); const to = GANG.move(true); const t = document.querySelector('.end').innerText;
      lifeToScore(); return { to, t, over: S.over, t2: document.querySelector('.end').innerText }; });
    assert.ok(m.over); assert.match(m.t, /The Hilltop chapter ends/); assert.ok(m.t.includes(m.to)); assert.match(m.t2, /fresh start/);
    // the parent's move, from the event
    await life(page, { len: 'life', age: 12 });
    const pm = await page.evaluate(() => { S.age = 15; GANG.adj({ rep: 40 }); GANG.join(); closeModals(); S.family = 10; const e = EV.find(x => x.id === 'gang_parent_move'); const ok = e.cond({}); e.run({}); e.choices()[0].fn(); return ok; });
    assert.ok(pm); await page.waitForFunction(() => S.over && /Hilltop chapter/.test(document.body.innerText));
    // mentoring: an OG at 21+, or an ex-member
    await life(page, { len: 'life', age: 18 });
    const mt = await page.evaluate(() => { S.age = 21; GANG.adj({ rep: 80 }); GANG.join(); closeModals(); GANG.promote(); const r = { rank: GANG.rank(), open: GANG.mentorOpen() };
      const c0 = S.community; gangWaysOut(); const btns = [...document.querySelectorAll('#mbg .modal > button.act')].map(b => b.innerText); MBTN(btns.findIndex(b => /mentor/i.test(b))); closeModals();
      const g = GANG.S(); r.mentor = g.mentor; r.member = g.member; r.out = g.out; r.c = S.community - c0; const notes = []; lifeHook('skip', day() + 1, day() + 120, 'friends', notes); r.notes = notes.join(' '); return r; });
    assert.deepStrictEqual([mt.rank, mt.open, mt.mentor, mt.member, mt.out], ['og', true, true, false, 'mentor']); assert.ok(mt.c > 0); assert.match(mt.notes, /outreach program/);
    noErrors(errors);
  } },
  { name: 'the memorial ending: plain, the people left behind, no detail of how', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await life(page, { len: 'life', age: 12 });
    const t = await page.evaluate(() => { S.age = 16; GANG.adj({ rep: 60 }); GANG.join(); closeModals(); GANG.promote(); GANG.die(); return { t: document.querySelector('.end').innerText, over: S.over, ended: S.life.ended, hook: LIFE_HOOKS.memorial }; });
    assert.ok(t.over && t.ended === 'death'); assert.match(t.t, /In memory of/); assert.match(t.t, /people you left behind/i); assert.match(t.t, /Mom, Dad, Nia and Grandma/);
    assert.match(t.t, /Nobody talks about how/); assert.doesNotMatch(t.t, GRAPHIC); assert.strictEqual(t.hook, null, 'the memorial hook is put back');
    noErrors(errors);
  } },
  { name: 'every gang event fires and offers 2–3 different choices', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await life(page, { len: 'life', age: 12 });
    const setups = { gang_notice: 'S.age=13;', gang_lookout: 'S.age=13;GANG.adj({rep:10});', gang_invite: 'S.age=14;GANG.adj({rep:35});',
      gang_l_night: 'S.age=14;GANG.adj({rep:30});GANG.join();', gang_l_hold: 'S.age=14;GANG.adj({rep:30});GANG.join();',
      gang_r_run: 'S.age=15;GANG.adj({rep:45});GANG.join();GANG.promote();', gang_r_car: 'S.age=15;GANG.adj({rep:45});GANG.join();GANG.promote();',
      gang_r_school: 'S.age=15;GANG.adj({rep:45});GANG.join();GANG.promote();S.cur=dayIndexOf(2026,10,6);',
      gang_s_back: 'S.age=16;GANG.adj({rep:60});GANG.join();GANG.promote();', gang_s_protect: 'S.age=16;GANG.adj({rep:60});GANG.join();GANG.promote();',
      gang_s_hold: 'S.age=16;GANG.adj({rep:60});GANG.join();GANG.promote();', gang_loss: 'S.age=16;GANG.adj({rep:60});GANG.join();GANG.promote();',
      gang_threat: 'S.age=15;GANG.adj({rep:40});GANG.join();GANG.adj({loyalty:-100});', gang_sweep: 'S.age=16;GANG.adj({rep:60,heat:90});GANG.join();',
      gang_hurt: 'S.age=16;GANG.adj({rep:60});GANG.join();', gang_parent_move: 'S.age=15;GANG.adj({rep:40});GANG.join();S.family=5;',
      gang_tense: 'S.age=15;GANG.adj({rep:40});GANG.join();GANG.out("outreach");', gang_rival: 'S.age=15;GANG.adj({rep:40});GANG.join();GANG.out("art");' };
    const r = await page.evaluate(setups => {
      const base = JSON.stringify(S), out = {};
      const snap = () => JSON.stringify([S.money, S.energy, S.mood, S.family, S.grades, S.stress, S.community, S.life.family, GANG.S().rep, GANG.S().heat, GANG.S().loyalty, GANG.S().member, GANG.S().out, GANG.S().kids]);
      for (const id in setups) { const e = EV.find(x => x.id === id), o = { opts: [] };
        for (let i = 0; i < 3; i++) { S = JSON.parse(base); closeModals(); uiNarr = []; new Function(setups[id])(); closeModals();
          o.ok = e.cond({}); if (!o.ok) break; const rnd = Math.random; Math.random = () => 0.99999;
          try { e.run({}); const ch = e.choices(); o.n = ch.length; if (i >= ch.length) break; const a = snap(); ch[i].fn(); o.opts.push(a !== snap()); } finally { Math.random = rnd; } }
        out[id] = o; }
      S = JSON.parse(base); closeModals(); return out; }, setups);
    for (const id in r) { assert.ok(r[id].ok, id + ' can fire'); assert.ok(r[id].n >= 2 && r[id].n <= 3, id + ' has 2–3 choices');
      assert.ok(r[id].opts.filter(Boolean).length >= r[id].n - 1, id + ' choices do something ' + JSON.stringify(r[id].opts)); }
    const all = await page.evaluate(() => GANG.ids.filter(id => !['gang_dead', 'gang_og_pay', 'gang_og_kids', 'gang_og_sit', 'gang_mentor'].includes(id)));
    assert.deepStrictEqual(all.filter(id => !(id in setups)), [], 'every event is covered');
    noErrors(errors);
  } },
  { name: 'no graphic, how-to, real-set, romance or fishing words; the guide section and What’s new', fn: async ctx => {
    const { page, errors } = await open(ctx);
    const strings = SRC.replace(/\/\/[^\n]*/g, '').match(/(['`])(?:\\.|(?!\1)[^\\])*\1/g).join(' ');
    assert.doesNotMatch(strings, GRAPHIC); assert.doesNotMatch(strings, OTHER);
    assert.doesNotMatch(SRC.replace(/^\s*\/\/.*$/gm, ''), /\bSafe Streets\b|Hilltop Artists/, 'real programs are described generically');
    await page.click('#helpBtn'); await page.waitForSelector('#tut');
    const g = await page.evaluate(() => document.getElementById('tut').innerText);
    for (const s of ['The gang life path', 'Street Rep', 'Heat', 'Loyalty', 'Lookout', 'Runner', 'Soldier', 'OG', 'Ways out', 'outreach', 'glass-art studio', 'mentor', 'never Quick play']) assert.ok(g.includes(s), 'guide: ' + s);
    assert.doesNotMatch(GANG_GUIDE = await page.evaluate(() => GANG.guide()), GRAPHIC);
    const w = await page.evaluate(() => CHANGELOG['0.4.1'].join(' '));
    assert.match(w, /Gang life path/i);
    noErrors(errors);
  } },
];
let GANG_GUIDE;
