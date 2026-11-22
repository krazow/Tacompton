const { open, noErrors, assert } = require('./helpers');

// School years (src/js/32-school.js): school days, the middle- and high-school calendar, and the scheduler's school weeks.
// Friendship, family and school only: nothing romantic, and no fishing words.
const BAD = /\b(romance|romantic|crush\w*|dat(e|es|ing)|boyfriends?|girlfriends?|kiss\w*|flirt\w*|sexy?|sexual|couples?)\b/i;
const BAD_FISH = /\b(fish\w*|salmon|marina|charters?|chinook|coho|herring)\b/i;

// in the page: start a life without the start sheet, and helpers to step through it
async function setup(page) {
  await page.evaluate(() => {
    window.T = {
      // no random weather here: the school calendar is what's tested (33-seasons.js, if loaded, snows only on S.wxSet days)
      start(len, age) { SCH_SNOW = 0; if (typeof wxOf === 'function' && !T.wx0) { T.wx0 = wxOf; wxOf = d => (S.wxSet && S.wxSet[d]) || 'gray'; } closeModals(); setMode(age < 18 ? 'grow' : 'adult'); LIFE_PICK = { length: len, startAge: age, birthday: { m: 3, d: 14, label: 'March 14' } }; newGame('normal'); render(); closeModals(); },
      M() { const m = document.getElementById('mbg'); return m ? m.innerText : ''; },
      // end days (answering nothing) until the day with this label; T.text collects every pop-up on the way
      text: '',
      to(lbl) { let g = 0; while (dateOf(day()).label !== lbl && g++ < 500) { T.text += T.M(); closeModals(); S.family = Math.max(S.family, 50); S.mood = Math.max(S.mood, 50); endDay('home'); } },
      act(re) { return actionsHere().find(a => re.test(a.l)); },
      pick(i) { T.text += '\n' + T.M(); MBTN(i); },
      weeks() { return S.keyWeeks.map(k => dateOf(k.start).label); },
    };
  });
}

module.exports = [
  { name: 'the scheduler moves a kid’s month and season weeks onto school dates, and keeps the number of key weeks', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await setup(page);
    const r = await page.evaluate(() => {
      const out = {};
      for (const [len, age] of [['6m', 12], ['1y', 12], ['2y', 12], ['1y', 15], ['2y', 15], ['life', 12], ['life', 15], ['1y', 18]]) {
        setMode(age < 18 ? 'grow' : 'adult');
        const o = { startDate: LIFE_START[age], startAge: age, birthday: { m: 3, d: 14, label: 'March 14' } };
        const hk = LIFE_HOOKS.plan.splice(0), raw = lifeBuild(len, o); LIFE_HOOKS.plan.push(...hk);
        const w = lifeBuild(len, o), lab = ws => ws.map(k => dAt(o.startDate, k.start).label + ' ' + dAt(o.startDate, k.start).y);
        out[len + age] = { n: [raw.length, w.length], raw: lab(raw), now: lab(w), sorted: w.every((k, i) => !i || k.start > w[i - 1].end) };
      }
      setMode('grow'); return out;
    });
    for (const k in r) { assert.strictEqual(r[k].n[0], r[k].n[1], k + ': same number of key weeks'); assert.ok(r[k].sorted, k + ': weeks in order, no overlap'); }
    // 6 months at 12: the fall concert week and winter break
    assert.ok(r['6m12'].now.includes('Mon Nov 16 2026'), 'the fall concert week: ' + r['6m12'].now);
    assert.ok(r['6m12'].now.includes('Mon Dec 21 2026'), 'winter break: ' + r['6m12'].now);
    // a year at 12: concert, winter break, testing week, the last day
    for (const w of ['Mon Nov 16 2026', 'Mon Dec 21 2026', 'Mon May 10 2027', 'Mon Jun 14 2027']) assert.ok(r['1y12'].now.includes(w), '1y12 ' + w + ': ' + r['1y12'].now);
    // high school at 15: December finals, prom week (16 by then), June
    for (const w of ['Mon Dec 14 2026', 'Mon May 10 2027']) assert.ok(r['2y15'].now.includes(w), '2y15 ' + w + ': ' + r['2y15'].now);
    // lifetime: the half-year milestones land on a first day, a last day, finals…
    assert.ok(r.life12.now.includes('Mon Aug 30 2027'), 'the first day of eighth grade: ' + r.life12.now.slice(0, 12));
    // the adult game is untouched
    assert.deepStrictEqual(r['1y18'].now, r['1y18'].raw);
    noErrors(errors);
  } },
  { name: 'a school day: Go to school (8:15 AM to 2:45 PM), homework after, and skipping costs Grades and Family', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await setup(page);
    const r = await page.evaluate(() => {
      T.start('6m', 12); lifeFF(1); closeModals();
      const o = { date: dateOf(day()).label, school: isSchoolDay(), t0: tod() };
      const go = T.act(/^Go to school$/); o.go = go && { cls: go.cls, s: go.s }; o.hw0 = !!T.act(/homework/);
      o.alert = alertBar() && alertBar().t; o.todo = todoItems()[0].l;
      const g0 = S.grades; go.fn(); render();
      o.after = { t: fmt(S.t), loc: S.loc, dg: S.grades - g0, went: S.sch.went[day()], narr: uiNarr[uiNarr.length - 1] };
      S.loc = 'home'; o.hw1 = !!T.act(/homework/); o.go1 = !!T.act(/^Go to school$/);
      endDay('home'); closeModals();
      // Tuesday: stay home
      const g1 = S.grades, f1 = S.family; S.t = day() * 1440 + 740; o.goLate = !!T.act(/^Go to school$/);
      endDay('home'); o.rep = T.M(); closeModals();
      o.skip = { dg: S.grades - g1, df: S.family - f1, n: S.sch.skips };
      return o;
    });
    assert.strictEqual(r.date, 'Mon Sep 28'); assert.ok(r.school);
    assert.ok(r.go, 'Go to school'); assert.strictEqual(r.go.cls, 'primary'); assert.match(r.go.s, /8:15 AM/); assert.match(r.go.s, /2:45 PM/);
    assert.ok(!r.hw0, 'homework waits until after school');
    assert.match(r.alert, /School day/); assert.match(r.todo, /Go to school/);
    assert.deepStrictEqual([r.after.t, r.after.loc, r.after.went], ['2:45 PM', 'school', 'ok']);
    assert.ok(r.after.dg >= 0 && r.after.dg <= 1); assert.match(r.after.narr, /Out at 2:45 PM/);
    assert.ok(r.hw1, 'homework at home after school'); assert.ok(!r.go1);
    assert.ok(!r.goLate, 'no Go to school after noon');
    assert.match(r.rep, /skipped school/); assert.deepStrictEqual(r.skip, { dg: -3, df: -5, n: 1 });
    noErrors(errors);
  } },
  { name: 'middle school: the fall concert, winter break, spring testing week and the last day, with moments', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await setup(page);
    const r = await page.evaluate(() => {
      T.start('1y', 12); const o = { weeks: T.weeks() };
      // the fall concert: practice, then the evening (band or choir first)
      lifeFF(2); closeModals(); o.k = dateOf(day()).label; o.list = schWeekList().map(x => x.t.id + '@' + dateOf(x.d).label);
      o.week = (setTab('week'), /At school this week/i.test(document.querySelector('#app').innerText)); setTab('act');
      S.t = day() * 1440 + 1100; S.loc = 'home'; T.act(/Practice for the fall concert/).fn();
      T.to('Thu Nov 19'); closeModals(); S.t = day() * 1440 + 1080; S.loc = 'home';
      const c = T.act(/Go to the fall concert/); o.concert = c && c.cls;
      const f0 = S.family; c.fn(); o.ens = T.M(); T.pick(1); o.cm = T.M(); T.pick(0); o.cf = S.family - f0; o.ct = fmt(S.t); o.ens2 = S.sch.ens;
      // winter break: the plan pops up on the first morning of the week
      lifeFF(1); o.k2 = dateOf(day()).label; o.wb = Object.keys(S.sch.done).includes('winter:2026'); o.school = isSchoolDay();
      closeModals(); S.t = day() * 1440 + 700; o.game = !!T.act(/Family game night/);
      // testing week
      while (dateOf(lifeKw().start).label !== 'Mon May 10') { closeModals(); lifeFF(1); }
      closeModals(); o.k3 = dateOf(day()).label; o.tplan = S.sch.plan['testing:2026'];
      const g0 = S.grades; T.act(/^Go to school$/).fn(); o.test = uiNarr[uiNarr.length - 1]; o.tg = S.grades - g0;
      // the last day of seventh grade
      while (dateOf(lifeKw().start).label !== 'Mon Jun 14') { closeModals(); lifeFF(1); }
      closeModals(); T.to('Tue Jun 15'); closeModals(); o.lastAm = uiNarr.join(' ');
      T.act(/^Go to school$/).fn(); o.last = T.M(); T.pick(0);
      o.mom = S.life.moments.map(m => m.t).join(' | ');
      o.all = T.text;
      return o;
    });
    assert.ok(r.weeks.includes('Mon Nov 16') && r.weeks.includes('Mon Dec 21'), r.weeks.join(', '));
    assert.strictEqual(r.k, 'Mon Nov 16'); assert.deepStrictEqual(r.list, ['concert@Thu Nov 19']); assert.ok(r.week);
    assert.strictEqual(r.concert, 'primary');
    assert.match(r.ens, /Band or choir/); assert.match(r.cm, /the choir/); assert.match(r.cm, /Mom, Dad and Nia/); assert.match(r.cm, /Take the solo you practiced/);
    assert.ok(r.cf >= 8, 'family came: ' + r.cf); assert.strictEqual(r.ens2, 'choir'); assert.strictEqual(r.ct, '8:55 PM');
    assert.strictEqual(r.k2, 'Mon Dec 21'); assert.ok(r.wb, 'the winter break plan'); assert.ok(!r.school); assert.ok(r.game);
    assert.strictEqual(r.k3, 'Mon May 10'); assert.strictEqual(r.tplan, 'good'); assert.match(r.test, /Testing:/); assert.ok(r.tg >= 2, 'a test day you studied for: ' + r.tg);
    assert.match(r.lastAm, /last day of seventh grade/); assert.match(r.last, /yearbook/i);
    for (const t of ['fall concert', 'Winter break', 'last day of seventh grade']) assert.ok(r.mom.includes(t), t + ' in ' + r.mom);
    assert.doesNotMatch(r.all + r.cm + r.last, BAD); assert.doesNotMatch(r.all + r.cm + r.last, BAD_FISH);
    noErrors(errors);
  } },
  { name: 'high school: orientation, finals, prom with friends (no pairs), and a summer job that pays in the time skip', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await setup(page);
    const r = await page.evaluate(() => {
      T.start('2y', 15); const o = { weeks: T.weeks() };
      T.to('Thu Aug 27'); closeModals(); S.t = day() * 1440 + 540;
      const ori = T.act(/orientation/); o.ori = ori && ori.cls; ori.fn(); o.om = T.M(); T.pick(0); o.oloc = [S.loc, fmt(S.t), S.sch.orient];
      // December finals: the study plan, then a test day
      while (dateOf(lifeKw().start).label !== 'Mon Dec 14') { closeModals(); lifeFF(1); }
      o.fplan = S.sch.plan['finalsDec:2026']; closeModals(); T.act(/^Go to school$/).fn(); o.fin = uiNarr[uiNarr.length - 1];
      // prom, at 16
      while (dateOf(lifeKw().start).label !== 'Mon May 10') { closeModals(); lifeFF(1); }
      closeModals(); o.age = S.age; gFriend('ana', 16); gFriend('marcus', 12); gFriend('linh', 9);
      T.to('Sat May 15'); closeModals(); S.t = day() * 1440 + 1080; S.loc = 'home'; S.money = 200;
      const p = T.act(/prom/); o.prom = p && p.cls; p.fn(); o.p1 = T.M(); T.pick(0); o.p2 = T.M(); T.pick(0); o.pt = fmt(S.t); o.pmoney = S.money;
      // the summer job
      while (dateOf(lifeKw().start).label !== 'Mon Jun 21') { closeModals(); lifeFF(1); }
      o.jm = S.sch.job[2027] === 'market'; closeModals();
      S.sch.job[2027] = 'pool'; S.loc = 'peoples'; S.t = day() * 1440 + 700;
      const sh = T.act(/Lifeguard shift/); const m0 = S.money; sh.fn(); o.shift = S.money - m0;
      // the time skip after this week pays two shifts a week through the summer
      T.to(dateOf(lifeRange(lifeKw()).to).label); closeModals(); S.loc = 'home'; endDay('home');
      [...document.querySelectorAll('#mbg .modal > button.act')][1].click(); o.res = T.M();
      o.mom = S.life.moments.map(m => m.t).join(' | ');
      return o;
    });
    assert.ok(r.weeks.includes('Mon Dec 14') && r.weeks.includes('Mon May 10'), r.weeks.join(', '));
    assert.strictEqual(r.ori, 'primary'); assert.match(r.om, /Orientation at Hilltop High/); assert.deepStrictEqual(r.oloc, ['school', '12:30 PM', true]);
    assert.ok(r.fplan, 'a finals plan'); assert.match(r.fin, /Finals:/);
    assert.strictEqual(r.age, 16);
    assert.strictEqual(r.prom, 'primary'); assert.match(r.p1, /what are you wearing/); assert.match(r.p2, /friends’ night out/); assert.match(r.p2, /Wright Park/); assert.match(r.p2, /No pairs/);
    assert.match(r.p2, /Ana, Marcus and Linh/); assert.strictEqual(r.pt, '11:00 PM'); assert.strictEqual(r.pmoney, 175);
    assert.doesNotMatch(r.p1 + r.p2, BAD);
    assert.ok(r.jm, 'the summer job offer'); assert.strictEqual(r.shift, 80);
    assert.match(r.res, /shifts at your summer job \(lifeguard at the People’s pool\)/);
    for (const t of ['Orientation at Hilltop High', 'Prom with Ana, Marcus and Linh', 'First summer job']) assert.ok(r.mom.includes(t), t + ' in ' + r.mom);
    noErrors(errors);
  } },
  { name: 'a snow day closes school: no Go to school, no skip, cocoa with Nia, and the concert moves to another night', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await setup(page);
    const r = await page.evaluate(() => {
      // snow on a day: 33-seasons.js's weather when it's loaded, else this file's own winter roll
      const snow = d => { if (typeof wxOf === 'function') { S.wxSet = S.wxSet || {}; S.wxSet[d] = 'snow'; } else SCH_SNOW = 1; };
      T.start('6m', 12);
      while (dateOf(lifeKw().start).label !== 'Mon Jan 11') { closeModals(); lifeFF(1); }
      closeModals(); snow(day() + 1); endDay('home'); closeModals(); SCH_SNOW = 0;
      const d = day(), o = { date: dateOf(d).label, school: isSchoolDay(d) && !schSnow(d) };
      S.t = d * 1440 + 600; S.loc = 'home'; o.go = !!T.act(/^Go to school$/); o.cocoa = !!T.act(/Hot cocoa/);
      o.todo = todoItems()[0].l;
      const g = S.grades; endDay('home'); o.rep = T.M(); closeModals(); o.dg = S.grades - g;
      // the fall concert, snowed out on its Thursday, moves to Friday
      T.start('1y', 12); lifeFF(2); closeModals();
      const thu = dayIndexOf(2026, 11, 19); S.sch.snow[thu] = true; o.concert = schWeekList().map(x => x.t.id + '@' + dateOf(x.d).label);
      return o;
    });
    assert.strictEqual(r.date, 'Tue Jan 12'); assert.ok(!r.school, 'school is closed');
    assert.ok(!r.go); assert.ok(r.cocoa); assert.match(r.todo, /Snow day/);
    assert.doesNotMatch(r.rep, /skipped school/);
    assert.deepStrictEqual(r.concert, ['concert@Fri Nov 20']);
    noErrors(errors);
  } },
  { name: 'graduation week (Lifetime from 15) has its own choice, then the engine’s graduation', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await setup(page);
    const r = await page.evaluate(() => {
      T.start('life', 15); const gi = S.keyWeeks.findIndex(k => k.kind === 'graduation');
      lifeFF(gi - 1); closeModals(); const wk = S.kwi; let g = 0;
      while (S.kwi === wk && g++ < 30) { closeModals(); S.loc = 'home'; endDay('home'); if (/How do you spend/.test(T.M())) { MBTN(0); MBTN(0); } }
      const o = { kind: lifeKw().kind, narr: uiNarr.join(' '), text: '' };
      let n = 0; while (n++ < 8) { if (document.getElementById('mbg')) { o.text += T.M(); MBTN(0); } else if (!S.sch.gradWeek) { S.loc = 'home'; endDay('home'); } else break; }
      o.flag = S.sch.gradWeek; o.mom = S.life.moments.map(m => m.t).join(' | ');
      return o;
    });
    assert.strictEqual(r.kind, 'graduation'); assert.match(r.narr, /Graduation week/);
    assert.match(r.text, /Senior sunset at the overlook/); assert.ok(r.flag); assert.match(r.mom, /Graduation week at Hilltop High/);
    noErrors(errors);
  } },
  { name: 'with the kid neighborhoods: Go to school from downtown, and a downtown job means no second summer job', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await setup(page);
    const r = await page.evaluate(() => {
      T.start('2y', 15); while (dateOf(lifeKw().start).label !== 'Mon Oct 12') { closeModals(); lifeFF(1); }
      closeModals(); const dt = Object.keys(L).find(k => L[k].hood === 'downtown'); S.loc = dt; S.t = day() * 1440 + 450;
      const go = T.act(/^Go to school$/), o = { dt: !!dt, go: !!go, mins: travelMins(dt, 'school') };
      go.fn(); o.t = fmt(S.t); o.loc = S.loc;
      S.gh = S.gh || { hoods: {}, told: {}, done: {}, worked: {}, miss: 0, shifts: 0, paid: 0, orca: 0, rs: false }; S.gh.job = { id: 'cafe', since: 1e9, hired: 0 };   // hired, shifts not started (no missed shifts)
      while (dateOf(lifeKw().start).label !== 'Mon Jun 21') { closeModals(); lifeFF(1); }
      o.job = S.sch.job[2027]; o.done = !!S.sch.done['job:2026'];
      return o;
    });
    assert.ok(r.dt && r.go); assert.deepStrictEqual([r.t, r.loc], ['2:45 PM', 'school']);
    assert.strictEqual(r.job, undefined); assert.ok(r.done);
    noErrors(errors);
  } },
  { name: 'Quick play and the adult game have no school calendar', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await setup(page);
    const r = await page.evaluate(() => {
      T.start('quick', 15); T.to('Thu Aug 27'); closeModals(); S.t = day() * 1440 + 540;
      const o = { q: actionsHere().map(a => a.l).filter(l => /orientation|Go to school/.test(l)), on: schOn() };
      T.start('1y', 18); closeModals(); o.adult = schOn(); o.sch = 'sch' in S;
      return o;
    });
    assert.deepStrictEqual(r, { q: [], on: false, adult: false, sch: false });
    noErrors(errors);
  } },
];
