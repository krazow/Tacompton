const { open, noErrors, assert } = require('./helpers');

// The paths at 18 (src/js/38-paths.js): the Army (recruiter, basic training, JBLM, promotions, the end of the enlistment),
// and college aid with a money check, so a careful student is never evicted.
async function startLife(page, length, job = 'cafe') {
  await page.evaluate(([length, job]) => {
    closeModals(); setMode('adult');
    LIFE_PICK = { length, startAge: 18, birthday: { m: 3, d: 14, label: 'March 14' } };
    newGame('normal'); closeModals(); pickJob(job); closeModals(); tab = 'act'; render();
  }, [length, job]);
}
const PAGE_HELPERS = () => {
  window.T_good = (st = 80) => { careerS(); S.career.habit = { s: 5, l: 0, m: 0, st }; S.standing = st; };
  window.T_run = d => { const out = []; careerDay(d, out); return out.filter(Boolean); };
  window.T_txt = html => { const b = document.createElement('div'); b.innerHTML = html; document.body.appendChild(b); const t = b.innerText; b.remove(); return t; };
};
const COMBAT = /\b(combat|kill\w*|shoot\w*|shot|weapons?|enemy|enemies|battle|firefight|wounded|casualt\w*)\b/i;
// a Lifetime from 15, played fast to the graduation sheet
async function toGraduation(page) {
  await page.evaluate(() => {
    closeModals(); setMode('grow'); LIFE_PICK = { length: 'life', startAge: 15, birthday: { m: 3, d: 14, label: 'March 14' } }; newGame('normal'); render();
    let guard = 0;
    while (guard++ < 5000) { const m = document.getElementById('mbg');
      if (m) { if (/Graduation/.test(m.querySelector('h2').textContent)) break; MBTN([...m.querySelectorAll('.modal > button.act')].findIndex(b => !b.disabled)); continue; }
      S.family = 80; S.loc = 'home'; endDay('home'); }
  });
  await page.click('#mbg button.act:has-text("What’s next")');
}

module.exports = [
  { name: 'the Army is a fourth choice at 18: the recruiter, basic training as one time skip, then JBLM on the Week tab, Job stat and life summary', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await page.evaluate(PAGE_HELPERS);
    await toGraduation(page);
    const paths = await page.$$eval('#mbg .modal > button.act b', b => b.map(x => x.textContent));
    assert.deepStrictEqual(paths.map(p => p.replace(/^\S+\s/, '').split(':')[0]), ['Go to work', 'College', 'A trade program', 'Enlist in the Army']);
    await page.click('#mbg button.act:has-text("Enlist in the Army")');
    const rec = await page.textContent('#mbg');
    for (const s of ['recruiting office', '4 years', 'Joint Base Lewis-McChord', 'basic training', 'barracks', 'GI Bill', '$2,190']) assert.ok(rec.includes(s), 'recruiter: ' + s);
    await page.click('#mbg button.act:has-text("Sign up")');
    const ship = await page.textContent('#mbg');
    assert.match(ship, /Shipping out/); assert.match(ship, /Enlistment ends/); assert.match(ship, /no rent/);
    const st = await page.evaluate(() => ({ job: S.job, mode: MODE, mil: S.life.mil, next: S.keyWeeks[S.kwi + 1], path: S.life.path, jobs: S.life.jobs, m: S.life.moments.map(x => x.t) }));
    assert.deepStrictEqual([st.job, st.mode, st.path], ['army', 'adult', 'job']);
    assert.ok(st.next.start > st.mil.basic, 'no key week during basic training');
    assert.ok(st.mil.ets - st.mil.start > 1460, 'four years');
    assert.ok(st.jobs.some(j => j.job === 'army' && j.path === 'army'));
    assert.ok(st.m.includes('Graduated from Hilltop High, then enlisted in the Army.'), st.m.join('\n'));
    await page.click('#mbg button.act:has-text("Get on the bus")');
    const skip = await page.$$eval('#mbg .modal > button.act b', b => b.map(x => x.textContent));
    assert.deepStrictEqual(skip, ['🎒 Basic training and signal school']);
    await page.click('#mbg button.act');
    const res = await page.textContent('#mbg');
    assert.match(res, /Basic training: ten weeks/); assert.match(res, /Joint Base Lewis-McChord/); assert.doesNotMatch(res, COMBAT);
    assert.match(res, /Private \(E-2\)|private/i);
    await page.click('#mbg button.act');
    const r = await page.evaluate(() => { closeModals(); return { week: T_txt(weekView()), hud: STATS.find(s => s.l === 'Job').title, sum: T_txt(lifeSummaryHTML()), rent: S.rent.paid, title: careerTitle() }; });
    assert.match(r.week, /Your service/i); assert.match(r.week, /barracks room on JBLM/); assert.match(r.week, /Enlistment ends/); assert.match(r.week, /Your career/i);
    assert.match(r.hud, /^Private \(E-[12]\) at JBLM: \$\d+ a shift\./);
    assert.match(r.sum, /enlisted in the Army/);
    assert.strictEqual(r.rent, true, 'no rent to pay in the barracks');
    noErrors(errors);
  } },
  { name: 'Army promotions on a schedule (E-2, E-3, E-4), a yearly pay raise and no merit raises; sergeant only after re-enlisting', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await page.evaluate(PAGE_HELPERS);
    await startLife(page, 'life', 'cafe');
    const r = await page.evaluate(() => {
      milEnlist(0); const p = [careerShift()], lines = [], t = [careerTitle()];
      for (let n = 1; n <= 8; n++) { T_good(); lines.push(...T_run(careerRevDay(S.career, S.career.n + 1))); p.push(careerShift()); t.push(careerTitle()); }
      return { p, t, lines, r: S.career.r, housing: S.life.mil.housing, choices: lifeChoices().map(c => c.l) };
    });
    assert.strictEqual(r.p[0], 101);
    assert.strictEqual(r.t[1], 'Private (E-2) at JBLM'); assert.strictEqual(r.t[2], 'Private First Class (E-3) at JBLM'); assert.strictEqual(r.t[4], 'Specialist (E-4) at JBLM');
    assert.strictEqual(r.r, 3, 'E-4 is the top before re-enlisting');
    assert.ok(r.lines.some(l => /One year in the Army: the yearly military pay raise \([23]%\)/.test(l)), r.lines.join('\n'));
    assert.ok(!r.lines.some(l => /merit raise/.test(l)), 'no merit raises');
    assert.ok(r.p[4] >= 132 && r.p[4] <= 146, 'E-4 pay ' + r.p[4]);
    assert.strictEqual(r.housing, 'barracks');
    // a bad record: a counseling statement and no promotion
    const w = await page.evaluate(() => { milEnlist(day()); S.career.habit = { s: 3, l: 2, m: 2, st: 30 }; S.standing = 30; const out = T_run(careerRevDay(S.career, 1)); return { out, r: S.career.r }; });
    assert.ok(w.out.some(l => /counseling statement/.test(l)) && w.r === 0, w.out.join('\n'));
    // standing at 0 in the Army is an early discharge, not "let go"
    const loss = await page.evaluate(() => { S.standing = 0; const l = checkLoss(); S.standing = 60; return [l, LOSSES[l][0]]; });
    assert.deepStrictEqual(loss, ['discharged', 'Discharged early']);
    noErrors(errors);
  } },
  { name: 'a deployment is one summarized time skip with Family and stress effects; the end of the enlistment offers re-enlist, the GI Bill or a civilian job', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await page.evaluate(PAGE_HELPERS);
    await startLife(page, 'life', 'cafe');
    const d = await page.evaluate(() => {
      milEnlist(0); const M = S.life.mil; M.basicDone = true; M.dep = { at: day() + 5 }; S.stress = 20; S.life.family = 60;
      LIFE_HOOKS.weekEnd.forEach(f => f(lifeKw()));
      const ch = lifeChoices().map(c => c.k), next = S.keyWeeks[S.kwi + 1].start, dep = Object.assign({}, M.dep);
      const fam = S.life.family, from = day() + 1, to = lifeRange(S.keyWeeks[S.kwi + 1]).from - 1, m0 = S.money;
      const notes = lifeSimulate(from, to, 'mil:depcall');
      return { ch, next, dep, notes, fam0: fam, fam: S.life.family, stress: S.stress, gain: S.money - m0, done: M.dep.done };
    });
    assert.deepStrictEqual(d.ch, ['mil:depcall', 'mil:depsave']);
    assert.ok(d.next > d.dep.to, 'no key week during the deployment');
    assert.match(d.notes[0], /deploys for nine months/); assert.doesNotMatch(d.notes.join('\n'), COMBAT);
    assert.ok(d.fam < d.fam0 && d.stress > 20 && d.gain > 0 && d.done, JSON.stringify(d));
    // the end of the enlistment
    const e = await page.evaluate(() => {
      const M = S.life.mil; M.ets = day() + 3; S.career.r = 3; S.career.since = 0;
      const ch = lifeChoices().map(c => c.l), from = day() + 1, to = from + 40;
      S.money = 10000; const snap = JSON.stringify(S);
      const reup = lifeSimulate(from, to, 'mil:reup'), a = { ets: M.ets, term: M.term, job: S.job };
      for (let n = 0; n < 4; n++) { T_good(); T_run(careerRevDay(S.career, S.career.n + 1)); }
      a.title = careerTitle(); a.housing = M.housing;
      S = JSON.parse(snap); S.money = 10000; const gi = lifeSimulate(from, to, 'mil:gi');
      const b = { job: S.job, path: S.life.path, part: S.life.parttime, fee: lifePathFee(), out: S.life.mil.out, week: T_txt(weekView()), sum: T_txt(lifeSummaryHTML()) };
      S = JSON.parse(snap); const civ = lifeSimulate(from, to, 'mil:civ');
      return { ch, reup, a, gi, b, civ, c: { job: S.job, out: S.life.mil.out, rent: S.rent.amt } };
    });
    assert.deepStrictEqual(e.ch, ['🎖️ Re-enlist for four more years', '🎓 The GI Bill: college at UW Tacoma', '💼 A civilian job: IT support downtown']);
    assert.ok(e.reup.some(l => /re-enlist for four more years/.test(l)) && e.a.term === 2 && e.a.job === 'army', e.reup.join('\n'));
    assert.strictEqual(e.a.title, 'Sergeant (E-5) at JBLM'); assert.strictEqual(e.a.housing, 'bah');
    assert.ok(e.gi.some(l => /honorable discharge/.test(l)) && e.gi.some(l => /The GI Bill: you start at UW Tacoma/.test(l)), e.gi.join('\n'));
    assert.deepStrictEqual([e.b.job, e.b.path, e.b.part, e.b.fee, e.b.out], ['cafe', 'college', true, 0, true]);
    assert.match(e.b.week, /covered by the GI Bill/); assert.match(e.b.sum, /with the GI Bill/);
    assert.ok(e.civ.some(l => /IT support tech<\/b> at an office downtown/.test(l)) && e.c.job === 'tech' && e.c.out, e.civ.join('\n'));
    noErrors(errors);
  } },
  { name: 'college at 18: financial aid at enrollment brings tuition to about $120 a month', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await page.evaluate(PAGE_HELPERS);
    await toGraduation(page);
    await page.click('#mbg button.act:has-text("College")');
    const own = await page.textContent('#mbg');
    for (const s of ['Financial aid', 'Pell Grant', 'Washington College Grant', '$1,050', 'You pay', '$120']) assert.ok(own.includes(s), 'aid sheet: ' + s);
    const r = await page.evaluate(() => ({ fee: lifePathFee(), aid: S.life.aid, week: (closeModals(), T_txt(weekView())), m: S.life.moments.map(x => x.t).join('\n') }));
    assert.strictEqual(r.fee, 120); assert.match(r.week, /College costs/i); assert.match(r.m, /Financial aid for UW Tacoma/);
    noErrors(errors);
  } },
  { name: 'a low-effort college student gets a warning and a cheaper room first; an eviction only comes after a warning', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await page.evaluate(PAGE_HELPERS);
    await startLife(page, 'life', 'cafe');
    // the money check on the time-skip sheet
    const w = await page.evaluate(() => {
      Object.assign(S.life, { path: 'college', parttime: true, prog: 10, done: false, rentHelpLeft: 0 }); S.money = 50; S.rent.amt = 1500;   // a few rent raises in
      const low = lifeMoneyLow(), ch = lifeChoices().map(c => c.l);
      lifeSkipSheet(day(), ''); const sheet = document.getElementById('mbg').innerText; closeModals();
      return { low, ch, sheet, warn: S.life.warnUntil };
    });
    assert.ok(w.low && w.low.need >= 1150, JSON.stringify(w.low));
    assert.ok(w.ch.includes('🏠 Move somewhere cheaper: a shared room') && w.ch.includes('🏡 Move back in with your family'), w.ch.join('\n'));
    assert.match(w.sheet, /Money check: at this pace you’ll be short on rent on/); assert.match(w.sheet, /financial aid office/);
    assert.ok(w.warn > 0);
    // a cheaper room: rent drops, Family up, and the money check goes quiet
    const room = await page.evaluate(() => { const f0 = S.life.family, from = day() + 1, notes = lifeSimulate(from, from + 60, 'room:family');
      return { notes, rent: S.rent.amt, fam: S.life.family - f0, low: lifeForecast(day() + 1, day() + 120), week: T_txt(weekView()) }; });
    assert.ok(room.notes[0].startsWith('🏡 You move back into your old room') && room.rent <= 1500 * 0.25 && room.fam > 0, JSON.stringify(room));
    assert.strictEqual(room.low, null); assert.match(room.week, /back with your family/);
    // no warning yet: the first shortfall in a time skip is covered by family, and that's the warning
    await startLife(page, 'life', 'cafe');
    const g = await page.evaluate(() => {
      Object.assign(S.life, { path: 'college', parttime: true, prog: 10, done: false, rentHelpLeft: 0 }); S.money = -400;
      const d1 = dayIndexOf(2026, 9, 1), notes = lifeSimulate(d1 - 1, d1 + 2, 'friends');
      return { notes, loss: checkLoss(), cash: S.money, warn: S.life.warnUntil };
    });
    assert.ok(g.notes.some(l => /short on rent.*Your family covers it this time/.test(l)), g.notes.join('\n'));
    assert.strictEqual(g.loss, null); assert.ok(g.cash >= 0 && g.warn > 0, JSON.stringify(g));
    // after the warning, a truly careless month can still end in an eviction
    const e = await page.evaluate(() => { S.money = -900; const d1 = dayIndexOf(2026, 10, 1); lifeSimulate(d1 - 1, d1 + 1, 'friends'); return checkLoss(); });
    assert.strictEqual(e, 'evicted');
    // a played week: the first short rent night is covered (with a warning); the next one, after the warning, is an eviction
    await startLife(page, 'life', 'cafe');
    const p = await page.evaluate(() => {
      const d = S.rent.due; S.cur = d; S.t = d * 1440 + 1300; S.money = 200; S.rent.paid = false;
      const a = []; onNight('home', a, d); const first = { evicted: !!S.evicted, paid: S.rent.paid, notes: a };
      S.rent.paid = false; S.money = 100; const b = []; onNight('home', b, d);
      return { first, second: !!S.evicted };
    });
    assert.ok(!p.first.evicted && p.first.paid && p.first.notes.some(l => /short on rent tonight\. Your family sends the rest/.test(l)), JSON.stringify(p.first));
    assert.strictEqual(p.second, true);
    noErrors(errors);
  } },
  { name: 'the guide: the Army and college aid in Growing up, and the Army ladder in the careers table', fn: async ctx => {
    const { page, errors } = await open(ctx);
    const h = await page.evaluate(() => { const c = helpChapters().find(x => x[0] === 'growup'); const b = document.createElement('div'); b.innerHTML = c[2]; document.body.appendChild(b); const s = b.innerText; b.remove(); return s; });
    for (const s of ['The Army', 'Joint Base Lewis-McChord', 'GI Bill', 'Pell Grant', 'Washington College Grant', 'Money check', 'Private (E-1)', 'Specialist (E-4)', 'After enlisting', '6 months as Private (E-1)', 'after you re-enlist'])
      assert.ok(h.includes(s), 'guide mentions ' + s);
    assert.doesNotMatch(h, COMBAT);
    noErrors(errors);
  } },
];
