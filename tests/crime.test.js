const fs = require('fs'), path = require('path');
const { open, noErrors, assert } = require('./helpers');

// Choices and consequences (src/js/60-crime.js): temptations, the punishment ladder, ways back, Growing Up's versions.
async function start(page, { grow = false, length = '1y', age, job = 'cafe' } = {}) {
  await page.evaluate(([grow, length, age, job]) => {
    closeModals(); setMode(grow ? 'grow' : 'adult');
    LIFE_PICK = length === 'quick' ? null : { length, startAge: age || (grow ? 12 : 18), birthday: { m: 3, d: 14, label: 'March 14' } };
    newGame('normal'); closeModals(); if (!isGrow()) { pickJob(job); closeModals(); } tab = 'act'; render();
  }, [grow, length, age, job]);
}
// run fn with Math.random fixed at v
const fixed = (v, body) => `(()=>{const rnd=Math.random;Math.random=()=>${v};try{${body}}finally{Math.random=rnd}})()`;
const ev = id => `EV.find(x=>x.id==='${id}')`;

module.exports = [
  { name: 'the ladder: a warning (no record), then a fine with a payment plan, then a third offense ends the adult game plainly', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page, { length: '1y' });
    const r = await page.evaluate(() => {
      closeModals(); S.money = 1000; const s0 = S.stress;
      const a = crimeOffense('test1', { label: 'Test one', sev: 1 }); closeModals();
      const rec1 = crimeHasRecord(), st1 = S.stress - s0;
      const m0 = S.money; const b = crimeOffense('test2', { label: 'Test two', sev: 1 }); closeModals();
      const fines = CRIMES.S().fines.map(x => ({ left: x.left, mo: x.mo }));
      const loss1 = checkLoss();
      const c = crimeOffense('test3', { label: 'Test three', sev: 1 }); closeModals();
      return { a, b, rec1, st1, fines, paidNow: m0 - S.money, loss1, loss2: checkLoss(), ladder: CRIME_LADDER.map(x => x.k), out: CRIMES.S().out };
    });
    assert.deepStrictEqual(r.ladder, ['warning', 'fine', 'service', 'court', 'record']);
    assert.strictEqual(r.a.step, 'warning'); assert.strictEqual(r.rec1, false); assert.ok(r.st1 > 0, 'some stress');
    assert.strictEqual(r.b.step, 'fine'); assert.ok(r.fines.length === 1 && r.fines[0].left === 150 && r.fines[0].mo > 0, JSON.stringify(r.fines));
    assert.strictEqual(r.paidNow, 0, 'a payment plan by default, nothing paid today');
    assert.strictEqual(r.loss1, null); assert.strictEqual(r.out, true); assert.strictEqual(r.loss2, 'crime');
    const end = await page.evaluate(() => { gameOver(checkLoss()); return document.body.innerText; });
    assert.ok(/A third offense/.test(end) && /fair and plain/.test(end), end.slice(0, 300));
    noErrors(errors);
  } },
  { name: 'fines: pay now or a plan on the 1st; community service at People’s; a court hearing (lawyer, on time) or a missed one (a record)', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page, { length: '2y' });
    const r = await page.evaluate(() => {
      closeModals(); S.money = 5000; const C = CRIMES.S();
      crimeOffense('f', { label: 'A fine', sev: 1, fine: 120 }); closeModals();
      const m0 = S.money; CRIMES.plans(null); const plan = m0 - S.money;
      const pay = actionsHere().find(x => /Pay off your fines/.test(x.l)); pay.fn(); closeModals();
      const left = C.fines.length;
      // community service (a second open offense: sev 2 → service)
      C.list.forEach(o => o.cleared = true);
      const sv = crimeOffense('s', { label: 'Service', sev: 2, service: 8 }); closeModals();
      S.loc = 'peoples'; S.t = S.cur * 1440 + 600; const c0 = S.community;
      const a1 = actionsHere().find(x => /Community service/.test(x.l)); a1.fn(); const h1 = C.svc && C.svc.left;
      actionsHere().find(x => /Community service/.test(x.l)).fn();
      return { plan, left, sv: sv.step, h1, done: C.svc, comm: S.community - c0 };
    });
    assert.ok(r.plan > 0 && r.plan < 120, 'a monthly payment ' + r.plan);
    assert.strictEqual(r.left, 0, 'paid off at home');
    assert.strictEqual(r.sv, 'service'); assert.strictEqual(r.h1, 4); assert.strictEqual(r.done, null); assert.ok(r.comm >= 6, 'Community up');
    // court: a serious offense (sev 3) with nothing open
    const ct = await page.evaluate(src => {
      closeModals(); const C = CRIMES.S(); C.list.forEach(o => o.cleared = true); S.money = 5000;
      const r1 = crimeOffense('y', { label: 'Court one', sev: 3 }); closeModals();
      const K = C.court; CRIMES.lawyer(); const law = K.lawyer;
      S.cur = K.d; S.t = K.d * 1440 + 480; S.loc = 'home';
      const act = actionsHere().find(x => /Go to court/.test(x.l));
      new Function(src)();
      return { step: r1.step, law, act: !!act, s: act && act.s, rec: crimeHasRecord(), court: C.court, t: tod() };
    }, fixed(0.1, `actionsHere().find(x=>/Go to court/.test(x.l)).fn();closeModals();`));
    assert.strictEqual(ct.step, 'court'); assert.ok(ct.law, 'hired a lawyer'); assert.ok(ct.act && /on time/.test(ct.s), JSON.stringify(ct));
    assert.strictEqual(ct.rec, false, 'dismissed: no record'); assert.strictEqual(ct.court, null); assert.ok(ct.t >= 840, 'most of the day');
    const miss = await page.evaluate(() => {
      closeModals(); const C = CRIMES.S(); C.list.forEach(o => o.cleared = true);
      crimeOffense('z', { label: 'Court two', sev: 3 }); closeModals();
      const d = C.court.d; const n = []; onNight('home', n, d); closeModals();
      return { rec: crimeHasRecord(), n: n.join(' ') };
    });
    assert.ok(miss.rec && /missed your court hearing/.test(miss.n), JSON.stringify(miss));
    noErrors(errors);
  } },
  { name: 'a record: the CNA listing’s background check, the Week tab, the life summary; vacated after a clean stretch (sooner if you made it right)', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page, { length: '2y', job: 'cafe' });
    const r = await page.evaluate(() => {
      closeModals(); const C = CRIMES.S(); C.list.push({ id: 'r', label: 'Old case', d: 0, age: 18, step: 4, sev: 3, fine: 0, restored: false, cleared: false, clearAt: 9999 });
      C.record = { d: 0, age: 18 }; C.last = 0;
      const has = crimeHasRecord();
      tab = 'week'; render(); const week = document.body.innerText;
      const lines = crimeRecordLines();
      const sum = lifeSummaryHTML();
      const n = []; CRIMES.tick(729, n); const early = crimeSealed();
      CRIMES.tick(1100, n); return { has, week, lines, sum, early, sealed: crimeSealed(), after: crimeHasRecord(), n };
    });
    assert.ok(r.has); assert.ok(/Your record/i.test(r.week) && /since age 18/.test(r.week), 'the Week tab');
    assert.ok(r.lines.some(l => /Old case/.test(l)) && /Choices and consequences/.test(r.sum), 'the life summary');
    assert.strictEqual(r.early, false); assert.ok(r.sealed && !r.after && r.n.some(l => /vacates your record/.test(l)), JSON.stringify(r.n));
    // the CNA listing and the application
    const j = await page.evaluate(() => {
      const C = CRIMES.S(); C.sealed = null; C.last = day(); phonePickPlan('prepaid'); if (!S.ph.apps.includes('jobs')) S.ph.apps.push('jobs');
      S.standing = 90; phoneOpen('jobs'); const t = document.querySelector('#phoneUI .ph-screen').textContent; phoneClose();
      const d = day(); S.ph.jobs = S.ph.jobs || {}; S.ph.jobs.app = { k: 'hospital', d }; PHONE_LIFE.jobsMorning(d + 1);
      return { t: t.slice(0, 300), bg: /background check would show your record/.test(t), offer: S.ph.jobs.offer || null, no: S.ph.jobs.no };
    });
    assert.ok(j.bg, 'the hospital listing is blocked: ' + j.t); assert.ok(!j.offer && j.no === 'hospital', 'no offer through the background check');
    // making it right halves the wait
    const fast = await page.evaluate(() => { const C = CRIMES.S(); C.list.forEach(o => o.restored = true); C.last = 0; C.sealed = null; const n = []; CRIMES.tick(740, n); return crimeSealed(); });
    assert.ok(fast, 'two years with amends');
    noErrors(errors);
  } },
  { name: 'make it right: the morning after, apologize and repay, with Mr. Harris once you’ve met him', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page, { length: '1y' });
    const r = await page.evaluate(() => {
      closeModals(); S.money = 500; crimeOffense('tag', { label: 'Tagging a wall', sev: 1, repay: 40 }); closeModals();
      const queued = S.ev.force.includes('cr_amends');
      const e = EV.find(x => x.id === 'cr_amends'); const o1 = e.choices().map(c => c.l);
      S.met.harris = 1; const o2 = e.choices().map(c => c.l);
      const off = CRIMES.S().list[0], ca = off.clearAt, m0 = S.money, c0 = S.community;
      e.choices()[1].fn();
      return { queued, o1, o2, restored: off.restored, sooner: off.clearAt < ca, paid: m0 - S.money, comm: S.community - c0, moment: S.life.moments.some(m => /Mr. Harris/.test(m.t)) };
    });
    assert.ok(r.queued, 'chained for the next morning');
    assert.strictEqual(r.o1.length, 2); assert.strictEqual(r.o2.length, 3); assert.ok(/Mr. Harris/.test(r.o2[1]) && /Let it be/.test(r.o2[2]));
    assert.ok(r.restored && r.sooner && r.paid === 40 && r.comm === 5 && r.moment, JSON.stringify(r));
    noErrors(errors);
  } },
  { name: 'adult temptations: each has a safe default; the fare ($124, doubled), the register, the bike, the mural tag', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page, { length: '1y', job: 'cafe' });
    const ids = ['cr_fare', 'cr_cash', 'cr_hot', 'cr_skim', 'cr_sick', 'cr_sublet', 'cr_noins'];
    const d = await page.evaluate(ids => ids.map(id => { const e = EV.find(x => x.id === id); S.ev.flags.crFare = 2; S.car = S.car || null; let o = [];
      try { if (id === 'cr_noins') S.car = { own: 'civic', ins: 95, lic: true }; o = e.choices({}); } catch (err) { return { id, err: String(err) }; }
      const k = typeof e.dflt === 'function' ? e.dflt() : e.dflt; return { id, n: o.length, dflt: k, safe: o[k] && o[k].l }; }), ids);
    for (const x of d) assert.ok(x.n >= 2 && x.dflt === (x.id === 'cr_hot' ? 2 : 0), JSON.stringify(x));
    const fare = await page.evaluate(src => { closeModals(); S.money = 1000; S.ev.flags.crFare = 2; return new Function(src)(); },
      `const out=[];const e=${ev('cr_fare')};for(let i=0;i<2;i++){const m0=S.money;${fixed(0.05, 'e.choices()[1].fn()')};closeModals();out.push(CRIMES.S().fines.map(x=>x.left));CRIMES.S().list.forEach(o=>o.cleared=true);}
       const m0=S.money;${fixed(0.5, 'e.choices()[1].fn()')};return {out,kept:S.money-m0};`);
    assert.deepStrictEqual(fare.out, [[124], [124, 248]], 'a $124 citation, doubled'); assert.strictEqual(fare.kept, 2, 'keep the fare when nobody checks');
    const skim = await page.evaluate(src => new Function(src)(), `const e=${ev('cr_skim')};const s0=e.choices()[1].s;const m0=S.money;${fixed(0.99, 'e.choices()[1].fn()')};const s1=e.choices()[1].s;
      return {s0,s1,got:S.money-m0};`);
    assert.ok(/10%/.test(skim.s0) && /25%/.test(skim.s1) && skim.got === 20, JSON.stringify(skim));
    // caught in Quick play: let go (its own ending)
    await start(page, { length: 'quick', job: 'cafe' });
    const q = await page.evaluate(src => { closeModals(); new Function(src)(); return { loss: checkLoss(), st: S.standing }; }, `${fixed(0.01, `${ev('cr_skim')}.choices()[1].fn()`)}`);
    assert.deepStrictEqual(q, { loss: 'letgo', st: 0 });
    // in a longer game: a new job somewhere else
    await start(page, { length: '1y', job: 'cafe' });
    const lg = await page.evaluate(src => { closeModals(); new Function(src)(); return { job: S.job, st: S.standing, loss: checkLoss() }; }, `${fixed(0.01, `${ev('cr_skim')}.choices()[1].fn()`)}`);
    assert.ok(lg.job !== 'cafe' && lg.st === 40 && lg.loss === null, JSON.stringify(lg));
    // the bike: 1 in 4 stolen → it goes back
    const bike = await page.evaluate(src => { closeModals(); S.money = 500; new Function(src)(); const C = CRIMES.S(); const q = S.ev.force.includes('cr_hot_back');
      S.cur += 1; EV.find(x => x.id === 'cr_hot_back').run(); return { q, bike: C.bike, hot: C.hot }; }, `${fixed(0.1, `${ev('cr_hot')}.choices()[1].fn()`)}`);
    assert.deepStrictEqual(bike, { q: true, bike: null, hot: null });
    // the mural: a fourth choice, tagging; caught → cleanup and community service
    const tag = await page.evaluate(src => { closeModals(); CRIMES.S().list.forEach(o => o.cleared = true); const e = EV.find(x => x.id === 'mural_painting'); const o = e.choices({}); new Function(src)(); closeModals();
      return { n: o.length, l: o[3].l, svc: CRIMES.S().svc, fine: CRIMES.S().fines.slice(-1)[0] }; }, `${fixed(0.1, `EV.find(x=>x.id==='mural_painting').choices({})[3].fn()`)}`);
    assert.ok(tag.n === 4 && /Tag the wall/.test(tag.l) && tag.svc && tag.svc.left === 8 && tag.fine && tag.fine.left === 150, JSON.stringify(tag));
    noErrors(errors);
  } },
  { name: 'adult temptations: the sick call on fair day, the cash job over a shift, the sublet (warning, then eviction), no car insurance', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page, { length: '1y', job: 'cafe' });
    const s2 = await page.evaluate(() => { closeModals(); let d = 1; while (!isShiftDay(d)) d++; S.cur = d; S.t = d * 1440 + 300; delete S.worked[d]; const st = S.standing, ms = S.stats.missed;
      EV.find(x => x.id === 'cr_sick').choices()[1].fn(); const n = []; const rnd = Math.random; Math.random = () => 0.1; try { onNight('home', n, d); } finally { Math.random = rnd; }
      return { drop: st - S.standing, missed: S.stats.missed - ms, n: n.join(' ') }; });
    assert.ok(s2.drop >= 20 && s2.missed === 0 && /street fair/.test(s2.n), JSON.stringify(s2));
    const cash = await page.evaluate(() => { closeModals(); let d = S.cur + 1; while (!isShiftDay(d)) d++; S.cur = d; S.t = d * 1440 + 300; delete S.worked[d]; const m0 = S.money, j0 = S.job;
      EV.find(x => x.id === 'cr_cash').choices()[1].fn(); const got = S.money - m0; const n = []; const rnd = Math.random; Math.random = () => 0.1; try { onNight('home', n, d); } finally { Math.random = rnd; }
      return { got, j0, job: S.job, n: n.join(' ') }; });
    assert.ok(cash.got === 80 && cash.job !== cash.j0 && /let go/.test(cash.n), JSON.stringify(cash));
    const sub = await page.evaluate(() => { closeModals(); const e = EV.find(x => x.id === 'cr_sublet'), rnd = Math.random; Math.random = () => 0.1;
      try { const m0 = S.money; e.choices()[1].fn(); const w = { got: S.money - m0, warn: CRIMES.S().subWarn, ev: !!S.evicted }; e.choices()[1].fn(); return { w, ev: !!S.evicted, loss: checkLoss() }; } finally { Math.random = rnd; } });
    assert.deepStrictEqual(sub, { w: { got: 300, warn: 1, ev: false }, ev: true, loss: 'sublet' });
    // no insurance: the bill stops, the crash costs everything and the license
    await start(page, { length: '1y' });
    const car = await page.evaluate(() => { closeModals(); S.money = 20000; CAR.buy('civic'); closeModals(); const e = EV.find(x => x.id === 'cr_noins');
      e.choices()[1].fn(); const o = dateOf(day()); const d1 = dayIndexOf(o.m === 12 ? o.y + 1 : o.y, o.m === 12 ? 1 : o.m + 1, 1); const m0 = S.money; CAR.bill(d1); const billed = m0 - S.money;
      S.loc = 'home'; S.t = S.cur * 1440 + 700; const reins = actionsHere().some(x => /car insurance again/.test(x.l));
      const m1 = S.money; CRIMES.crash(null); closeModals();
      return { billed, reins, paid: m1 - S.money, lic: S.car.lic, chip: driveChip('pr_main'), test: actionsHere().some(x => /license test/.test(x.l)), off: CRIMES.S().list.slice(-1)[0].label }; });
    assert.ok(car.billed === 0 && car.reins && car.paid >= 2800 && car.lic === false && car.chip === '' && !car.test && /insurance/.test(car.off), JSON.stringify(car));
    noErrors(errors);
  } },
  { name: 'Growing Up: family and school, never police; grounded is home and school only; the third time is a family meeting', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page, { grow: true, length: '2y', age: 12 });
    const r = await page.evaluate(() => {
      closeModals(); S.age = 13; KIDS.forEach(k => gFriend(k.id, 5)); const ids = ['cr_k_skip', 'cr_k_candy', 'cr_k_cheat', 'cr_k_sneak', 'cr_k_cover'];
      const out = {}, rnd = Math.random; Math.random = () => 0.1; let text = '';
      try { for (const id of ids) { const e = EV.find(x => x.id === id); uiNarr = []; try { e.run({}); } catch (err) {} const o = e.choices({}); const f0 = S.family;
        o[1].fn(); closeModals(); text += uiNarr.join(' ') + o.map(x => x.l + ' ' + x.s).join(' '); out[id] = { n: o.length, dflt: e.dflt, fam: S.family - f0 }; } } finally { Math.random = rnd; }
      const K = CRIMES.kid(); return { out, text, teach: K.teach, sweep: K.sweep, gr: K.gr, d: day(), serious: K.serious, list: K.list.length, adult: CRIMES.S().list.length };
    });
    for (const id in r.out) assert.ok(r.out[id].n === 2 && r.out[id].dflt === 0 && r.out[id].fam < 0, id + ' ' + JSON.stringify(r.out[id]));
    assert.ok(r.teach < 70 && r.sweep === 2 && r.gr >= r.d + 2 && r.serious >= 1 && r.list === 5 && r.adult === 0, JSON.stringify(r));
    assert.doesNotMatch(r.text, /\b(police|officer|arrest\w*|court|jail|citation|record)\b/i);
    assert.ok(/counselor/.test(r.text), 'the family meeting');
    const g = await page.evaluate(() => { S.t = S.cur * 1440 + 700; S.loc = 'home'; uiNarr = []; go('peoples'); const a = { loc: S.loc, say: uiNarr.join(' ') }; go('mlk'); a.mlk = S.loc;
      S.loc = 'mlk'; a.sweep = GROW.actionsHere().some(x => /Sweep the market/.test(x.l)); tab = 'week'; render(); a.week = document.body.innerText; return a; });
    assert.ok(g.loc === 'home' && /grounded/.test(g.say) && g.mlk === 'mlk' && g.sweep && /Teacher trust/i.test(g.week), JSON.stringify(g).slice(0, 300));
    noErrors(errors);
  } },
  { name: 'the guide has a Choices and consequences chapter; What’s new; no romance or fishing words; the time skip handles hours, hearings and plans', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await page.click('#helpBtn'); await page.waitForSelector('#tut');
    const t = await page.evaluate(() => document.getElementById('tut-choices').innerText);
    for (const s of ['bus fare', '$124', 'payment plan', 'community service', 'public defender', 'Mr. Harris', 'CNA', 'Growing Up', 'grounded', 'counselor']) assert.ok(t.toLowerCase().includes(s.toLowerCase()), 'mentions ' + s);
    assert.ok(await page.evaluate(() => CHANGELOG['0.4.1'].some(l => /Choices and consequences/.test(l))));
    const BAD = /\b(romance|romantic|crush\w*|dat(e|es|ing)|boyfriends?|girlfriends?|kiss\w*|flirt\w*|sexy?|sexual|couples?|fish\w*|salmon|marina|charters?|wdfw|gun\w*|weapons?|drugs?)\b/i;
    const src = fs.readFileSync(path.join(__dirname, '..', 'src/js/60-crime.js'), 'utf8');
    assert.ok(!BAD.test(src), 'banned word: ' + (src.match(BAD) || [])[0]);
    await page.evaluate(() => { document.querySelector('#tut .tut-x, #tut [aria-label="Close"]')?.click(); });
    await start(page, { length: '2y' });
    const sk = await page.evaluate(() => { closeModals(); S.money = 5000; const C = CRIMES.S();
      crimeOffense('a', { label: 'One', sev: 1, fine: 120 }); crimeOffense('b', { label: 'Two', sev: 2, service: 8 }); closeModals(); C.list.forEach(o => o.cleared = true);
      crimeOffense('c', { label: 'Three', sev: 3 }); closeModals();
      const n = [], m0 = S.money; const rnd = Math.random; Math.random = () => 0.1; try { lifeHook('skip', S.cur + 1, S.cur + 70, 'save', n); } finally { Math.random = rnd; }
      return { n, svc: C.svc, court: C.court, paid: m0 - S.money, open: document.getElementById('mbg') ? 1 : 0 }; });
    assert.ok(sk.svc === null && sk.court === null && sk.paid > 0, JSON.stringify(sk));
    assert.ok(sk.n.some(l => /community service/.test(l)) && sk.n.some(l => /court hearing/.test(l)) && sk.n.some(l => /Fine payment/.test(l)), JSON.stringify(sk.n));
    noErrors(errors);
  } },
];
