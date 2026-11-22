const { open, noErrors, assert } = require('./helpers');

// Careers (src/js/35-careers.js): raises, reviews, promotions, nursing programs, the college and trade jobs, the pension.
async function startLife(page, length, job = 'cafe') {
  await page.evaluate(([length, job]) => {
    closeModals(); setMode('adult');
    LIFE_PICK = { length, startAge: 18, birthday: { m: 3, d: 14, label: 'March 14' } };
    newGame('normal'); closeModals(); pickJob(job); closeModals(); tab = 'act'; render();
  }, [length, job]);
}
const BAD = /\b(romance|romantic|crush\w*|dating|boyfriends?|girlfriends?|kiss\w*|flirt\w*)\b/i;
// in the page: a good (or bad) record from the key weeks, and run the career up to day d
const PAGE_HELPERS = () => {
  window.T_good = (st = 80) => { careerS(); S.career.habit = { s: 5, l: 0, m: 0, st }; S.standing = st; };
  window.T_bad = () => { careerS(); S.career.habit = { s: 3, l: 2, m: 2, st: 30 }; S.standing = 30; };
  window.T_run = d => { const out = []; careerDay(d, out); return out.filter(Boolean); };
};

module.exports = [
  { name: 'Quick play is unchanged: no raises, the classic titles, three jobs in the pickers', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await page.evaluate(PAGE_HELPERS);
    await startLife(page, 'quick', 'hospital');
    const r = await page.evaluate(() => { const out = []; for (let d = 0; d < 14; d++) careerDay(d, out);
      return { f: careerPayF(), lp: lifePayF(), n: JOBS.hospital.n, role: JOBS.hospital.role, keys: Object.keys(JOBS), career: S.career || null, out, week: weekView(), tips: JOBS.cafe.tips };
    });
    assert.deepStrictEqual([r.f, r.lp, r.n, r.role, r.keys.join(), r.career, r.out.length], [1, 1, 'CNA at Tacoma General', 'certified nursing assistant', 'hospital,cafe,kitchen', null, 0]);
    assert.doesNotMatch(r.week, /Your career/);
    assert.deepStrictEqual(r.tips, [14, 40]);
    // a whole two weeks on shift: the pay is the same as ever
    const pay = await page.evaluate(() => { const got = []; for (let d = 0; d < 14 && !S.over; d++) { closeModals(); if (isShiftDay(d)) { S.loc = 'work'; S.t = d * 1440 + job().start; const m = S.money; work(0); got.push(S.money - m) } S.rent.paid = true; S.loc = 'home'; S.stress = 30; endDay('home'); }
      return got; });
    assert.ok(pay.length >= 9 && pay.every(x => x === 172), 'every shift pays $172: ' + pay.join(','));
    noErrors(errors);
  } },
  { name: 'raises: a merit raise at six months, a cost-of-living raise and another merit raise at a year; a warning below 40', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await page.evaluate(PAGE_HELPERS);
    await startLife(page, 'life', 'kitchen');
    const r = await page.evaluate(() => {
      T_good(); const p0 = careerShift(), a = T_run(careerRevDay(S.career, 1)), p1 = careerShift(); T_good(); const b = T_run(careerRevDay(S.career, 2)), p2 = careerShift();
      return { p0, p1, p2, a, b, cola: S.career.cola, merit: S.career.merit, title: careerTitle() };
    });
    assert.strictEqual(r.p0, 138);
    assert.ok(r.a.some(l => /six-month review at Odessa’s Table: a [345]% merit raise/.test(l)), r.a.join('\n'));
    assert.ok(r.p1 >= 142 && r.p1 <= 145, 'merit raise: ' + r.p1);
    assert.ok(r.b.some(l => /One year at Odessa’s Table: a [23]% cost-of-living raise, and a [345]% merit raise\. Pay goes from/.test(l)), r.b.join('\n'));
    assert.ok(r.cola >= 1.02 && r.cola <= 1.03 && r.p2 > r.p1, JSON.stringify(r));
    // a bad record: no merit raise, and a written warning (the cost-of-living raise still comes)
    const w = await page.evaluate(() => { T_bad(); const m = S.career.merit, c = S.career.cola, out = T_run(365 + 183); T_bad(); const out2 = T_run(730);
      return { out, out2, same: S.career.merit === m, cola: S.career.cola > c, warn: S.career.warn }; });
    assert.ok(w.out.some(l => /no merit raise, and a written warning/.test(l)), w.out.join('\n'));
    assert.ok(w.out2.some(l => /2 years at Odessa’s Table: a [23]% cost-of-living raise/.test(l)), w.out2.join('\n'));
    assert.ok(w.same && w.cola && w.warn === 2, JSON.stringify(w));
    // merit raises stop at the top of the band
    const top = await page.evaluate(() => { for (let n = 0; n < 12; n++) { T_good(60); T_run(careerRevDay(S.career, S.career.n + 1)); } return S.career.merit; });
    assert.ok(top > 1.19 && top <= 1.2 + 1e-9, 'band top ' + top);
    noErrors(errors);
  } },
  { name: 'promotions: barista → shift lead → café manager, with the title on the Week tab, the Job stat and the life summary', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await page.evaluate(PAGE_HELPERS);
    await startLife(page, 'life', 'cafe');
    const r = await page.evaluate(() => {
      const lines = [];
      for (let n = 1; n <= 9; n++) { T_good(); lines.push(...T_run(careerRevDay(S.career, S.career.n + 1))); }
      closeModals(); render();
      const box = document.createElement('div'); box.innerHTML = weekView(); document.body.appendChild(box); const week = box.innerText; box.remove();
      return { lines, r: S.career.r, n: JOBS.cafe.n, role: JOBS.cafe.role, week, hud: STATS.find(s => s.l === 'Job').title,
        moments: S.life.moments.map(m => m.t), jobs: S.life.jobs, sum: lifeSummaryHTML(), tips: JOBS.cafe.tips, pickers: Object.values(JOBS).map(j => j.n) };
    });
    assert.ok(r.lines.some(l => /Promoted: <b>Shift lead at a Hilltop café<\/b>\. Pay goes from \$\d+ to \$\d+ a shift/.test(l)), r.lines.join('\n'));
    assert.ok(r.lines.some(l => /Promoted: <b>Café manager at a Hilltop café<\/b>/.test(l)), r.lines.join('\n'));
    assert.strictEqual(r.r, 2); assert.strictEqual(r.n, 'Café manager at a Hilltop café'); assert.strictEqual(r.role, 'café manager');
    assert.match(r.week, /Your career/i); assert.match(r.week, /Café manager at a Hilltop café/); assert.match(r.week, /since you started/); assert.match(r.week, /Next review/);
    assert.match(r.hud, /^Café manager at a Hilltop café: \$\d+ a shift\./);
    assert.ok(r.moments.includes('Promoted to Shift lead at a Hilltop café.') && r.moments.includes('Promoted to Café manager at a Hilltop café.'), r.moments.join('\n'));
    assert.deepStrictEqual(r.jobs.map(j => j.t || j.job), ['cafe', 'Shift lead', 'Café manager']);
    assert.match(r.sum, /Barista/); assert.match(r.sum, /Shift lead/); assert.match(r.sum, /Café manager/);
    assert.ok(r.tips[0] > 14, 'tips follow the cost of living');
    // the Help guide still shows the day-one jobs
    const h = await page.evaluate(() => helpChapters().find(c => c[0] === 'job')[2]);
    assert.match(h, /☕ Barista/); assert.doesNotMatch(h, /Café manager/);
    noErrors(errors);
  } },
  { name: 'nursing: Senior CNA, then the LPN program in a time skip (fees, fewer shifts), then LPN, then the RN bridge', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await page.evaluate(PAGE_HELPERS);
    await startLife(page, 'life', 'hospital');
    const r = await page.evaluate(() => {
      const lines = [];
      for (let n = 1; n <= 6; n++) { T_good(); lines.push(...T_run(careerRevDay(S.career, S.career.n + 1))); }
      const t1 = careerTitle(), ch = lifeChoices().map(c => c.l + ' | ' + c.s), offer = S.career.offer, p0 = careerShift();
      const d0 = day() > careerRevDay(S.career, S.career.n) ? day() : careerRevDay(S.career, S.career.n) + 1;
      S.money = 50000; const m0 = S.money;
      const notes = lifeSimulate(d0, d0 + 60, 'prog:lpn'), inProg = !!S.career.prog, pt = careerShift();
      const fees = S.stats.spent;
      T_good(); const more = [], end = S.career.prog.end; for (let d = d0 + 61; d <= end + 1; d++) more.push(...T_run(d));
      return { lines, t1, ch, offer, p0, notes, inProg, pt, fees, more, t2: careerTitle(), p2: careerShift(), moments: S.life.moments.map(m => m.t), offer2: S.career.offer };
    });
    assert.strictEqual(r.t1, 'Senior CNA at Tacoma General');
    assert.ok(r.lines.some(l => /you’d make a good LPN/.test(l)), r.lines.join('\n'));
    assert.strictEqual(r.offer, 'lpn');
    assert.ok(r.ch.some(c => /^🎓 Start the LPN program \| .*12 months, \$300 a month, and 75% of your shifts/.test(c)), r.ch.join('\n'));
    assert.match(r.notes[0], /You start the LPN program/);
    assert.ok(r.inProg && Math.abs(r.pt - r.p0 * 0.75) <= 1, `75% shifts: ${r.p0} → ${r.pt}`);
    assert.ok(r.fees >= 300, 'fees paid: ' + r.fees);
    assert.ok(r.more.some(l => /You finish the practical nursing program and pass your boards\. Promoted: <b>LPN at Tacoma General<\/b>/.test(l)), r.more.join('\n'));
    assert.strictEqual(r.t2, 'LPN at Tacoma General');
    assert.ok(r.p2 > r.p0 * 1.12, `LPN pay ${r.p2} vs Senior CNA ${r.p0}`);
    assert.ok(r.moments.includes('Started the LPN program.'));
    // a year as an LPN: the RN bridge is offered (optional)
    const rn = await page.evaluate(() => { const out = []; for (let n = 0; n < 3; n++) { T_good(); out.push(...T_run(careerRevDay(S.career, S.career.n + 1))); } return { out, ch: lifeChoices().map(c => c.l) }; });
    assert.ok(rn.ch.includes('🎓 Start the RN bridge program'), rn.ch.join('\n'));
    noErrors(errors);
  } },
  { name: 'after the trade program: electrician apprentice, then journey-level; after college: IT support downtown', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await page.evaluate(PAGE_HELPERS);
    await startLife(page, 'life', 'kitchen');
    const r = await page.evaluate(() => {
      Object.assign(S.life, { path: 'trade', parttime: true, prog: 99.9, done: false });
      const p0 = careerShift(); S.money = 20000;
      const notes = lifeSimulate(day() + 1, day() + 20, 'save');
      const a = { job: S.job, n: JOBS[S.job].n, pay: careerShift(), notes, p0, part: S.life.parttime };
      for (let n = 0; n < 9; n++) { T_good(); notes.push(...T_run(careerRevDay(S.career, S.career.n + 1))); }
      return Object.assign(a, { t2: careerTitle(), p2: careerShift(), all: notes, sum: lifeSummaryHTML() });
    });
    assert.strictEqual(r.job, 'elec'); assert.strictEqual(r.part, false);
    assert.ok(r.notes.some(l => /You finish the electrical pre-apprenticeship/.test(l)) && r.notes.some(l => /electrician apprentice<\/b>/.test(l)), r.notes.join('\n'));
    assert.strictEqual(r.pay, 150);
    assert.strictEqual(r.t2, 'Journey-level electrician at a Tacoma electrical contractor');
    assert.ok(r.p2 >= 255, 'journey-level pay ' + r.p2);
    assert.match(r.sum, /Electrician apprentice/); assert.match(r.sum, /Journey-level electrician/);
    // the job site has its own art and shift lines
    const art = await page.evaluate(() => { S.loc = 'work'; return sceneSVG(); });
    assert.match(art, /HARD HATS/);
    await startLife(page, 'life', 'cafe');
    const c = await page.evaluate(() => { Object.assign(S.life, { path: 'college', parttime: true, prog: 99.99, done: false }); S.money = 20000; const notes = lifeSimulate(day() + 1, day() + 20, 'save'); return { job: S.job, notes, n: JOBS[S.job].n }; });
    assert.strictEqual(c.job, 'tech');
    assert.ok(c.notes.some(l => /You finish your degree/.test(l)) && c.notes.some(l => /IT support tech<\/b> at an office downtown/.test(l)), c.notes.join('\n'));
    noErrors(errors);
  } },
  { name: 'rents rise with no cap; a promotion shows in the time-skip summary; the pension follows your pay', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await page.evaluate(PAGE_HELPERS);
    await startLife(page, 'life', 'cafe');
    const r = await page.evaluate(() => {
      const seen = [];
      LIFE_HOOKS.skip.push((f, t, c, notes) => seen.push(...notes));
      LIFE_HOOKS.weekEnd.push(() => { if (S.career) { S.career.att = { s: 5, l: 0, m: 0 }; S.career.habit = { s: 5, l: 0, m: 0, st: 85 }; S.standing = 85; } });   // a good week, every week
      let g = 0; while (S.age < 24 && g++ < 60 && !S.over) lifeFF(1);
      return { seen, age: S.age, rentF: S.city.rentF, rent: S.rent.amt, title: careerTitle(), sheet: document.getElementById('mbg') ? document.getElementById('mbg').innerText : '' };
    });
    assert.ok(r.rentF > 1.2, 'rents past the old 20% cap: ' + r.rentF);
    assert.ok(r.rent > 1150 * 1.2, 'rent ' + r.rent);
    assert.ok(!r.seen.some(l => /tenant protections/.test(l)));
    assert.ok(r.seen.some(l => /Promoted: <b>Shift lead/.test(l)), 'the promotion is in a summary');
    assert.ok(r.seen.some(l => /cost-of-living raise/.test(l)) && r.seen.some(l => /merit raise/.test(l)));
    assert.match(r.title, /Café manager|Shift lead/);
    assert.doesNotMatch(r.seen.join('\n'), BAD);
    // the result sheet's Work line shows the title
    const sheet = await page.evaluate(() => { closeModals(); const b = lifeSnapRows(); lifeResultSheet(b, ['x'], S.kwi + 1, { l: '🐷 Save money' }); return document.getElementById('mbg').innerText; });
    assert.match(sheet, /café manager|shift lead/);
    // retirement: a pension of 70% of the last pay, not the flat $500 a week
    const p = await page.evaluate(() => { closeModals(); const wk = careerShiftAll() * 5; S.life.retired = true; T_run(day() + 1); return { wk, per: careerPension() * 7 }; });
    assert.ok(Math.abs(p.per - p.wk * 0.7) < 2 && p.per > 500, JSON.stringify(p));
    noErrors(errors);
  } },
  { name: 'a sensible Lifetime player keeps up with rent and a sloppy one falls behind', fn: async ctx => {
    const { page, errors } = await open(ctx);
    const run = good => page.evaluate(good => {
      closeModals(); setMode('adult'); LIFE_PICK = { length: 'life', startAge: 18, birthday: { m: 3, d: 14, label: 'March 14' } };
      newGame('normal'); closeModals(); pickJob('cafe'); closeModals();
      let g = 0, at40 = null;
      while (S && !S.over && g++ < 20000 && S.age < 41) {
        if (S.age >= 40 && !at40) at40 = { rent: S.rent.amt, month: careerMonth(), title: careerTitle() };
        const m = document.getElementById('mbg');
        if (m) { const bs = [...m.querySelectorAll('.modal > button.act')].filter(b => !b.disabled); const b = bs.find(x => (good ? /Start the|extra shifts/ : /See friends/).test(x.textContent)) || bs[0]; if (b) b.click(); else m.remove(); continue; }
        const d = day(), J = job(); S.stress = Math.min(S.stress, 40); S.food = Math.max(S.food, 2); S.energy = 70;
        if (isShiftDay(d) && !(d in S.worked) && (good || d % 3)) { const late = good ? 0 : d % 2 ? 25 : 0; S.loc = 'work'; S.t = d * 1440 + J.start + late; work(late); }
        if (!good) S.standing = Math.max(S.standing, 30);
        if (!S.rent.paid && S.money >= S.rent.amt) { money(-S.rent.amt); S.rent.paid = true; S.rent.paidDay = day(); }
        S.loc = 'home'; S.t = Math.max(S.t, d * 1440 + 1320); endDay('home');
      }
      return at40;
    }, good);
    const a = await run(true), b = await run(false);
    const sa = a.rent / a.month, sb = b.rent / b.month, start = 1150 / Math.round((104 + 27) * 5 * 52 / 12);
    console.log(`       at 40: sensible ${a.title} ${Math.round(sa * 100)}% of pay on rent, sloppy ${b.title} ${Math.round(sb * 100)}% (at 18: ${Math.round(start * 100)}%)`);
    assert.ok(sa <= start * 1.05, 'sensible keeps up: ' + sa);
    assert.ok(sb >= start * 1.2, 'sloppy falls behind: ' + sb);
    noErrors(errors);
  } },
];
