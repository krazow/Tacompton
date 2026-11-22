const { open, newGame, noErrors, assert } = require('./helpers');

// The guide's two chapters on the longer games (26-help.js), and four fixes in the longer Growing Up games.
const BAD = /\b(romance|romantic|crush\w*|dat(e|es|ing)|boyfriends?|girlfriends?|kiss\w*|flirt\w*|sexy?|sexual|couples?)\b/i;
const BAD_FISH = /\b(fish\w*|salmon|marina|charters?|wdfw)\b/i;

async function chapter(page, key) {
  await page.click('#helpBtn');
  await page.waitForSelector('#tut');
  return page.evaluate(k => { const el = document.getElementById('tut-' + k); return el ? el.innerText : null; }, key);
}
// in the page: start a life without the start sheet (no random weather, no snow), then play into the second key week
async function life(page, len = '6m', age = 12) {
  await page.evaluate(([len, age]) => {
    if (typeof SCH_SNOW !== 'undefined') SCH_SNOW = 0;
    if (typeof wxOf === 'function') wxOf = d => (S.wxSet && S.wxSet[d]) || 'gray';
    closeModals(); setMode(age < 18 ? 'grow' : 'adult');
    LIFE_PICK = { length: len, startAge: age, birthday: { m: 3, d: 14, label: 'March 14' } };
    newGame('normal'); render(); closeModals();
  }, [len, age]);
}

module.exports = [
  { name: 'the guide: Game lengths and ages, with the real lengths, ages, key weeks and Game options', fn: async ctx => {
    const { page, errors } = await open(ctx);
    const t = await chapter(page, 'lengths');
    assert.ok(t, 'the chapter is there');
    for (const s of ['Quick play', '6 months', '1 year', '2 years', 'Lifetime', 'Starting ages', 'Mon Aug 24, 2026', 'Mon Aug 3, 2026', 'Summit View', 'Hilltop High',
      '8:30 PM', '10:00 PM', 'Key weeks', 'While you were away', 'Game options', 'Lengthen', 'Shorten', 'Too short now', 'Finish here', 'Highlights', 'Difficulty',
      'per month', 'Best scores', '67', 'A life on Hilltop', '80th birthday']) assert.ok(t.includes(s), 'mentions ' + s);
    // the key-week counts come from the scheduler
    const n = await page.evaluate(() => LIFE_ORDER.map(k => LIFE_AGES.map(a => lifeBuild(k, { startDate: LIFE_START[a], startAge: a, birthday: { m: 3, d: 14 } }).length)));
    const rng = a => Math.min(...a) === Math.max(...a) ? String(a[0]) : `${Math.min(...a)}–${Math.max(...a)}`;
    for (const a of n) assert.ok(t.includes(rng(a)), 'key weeks ' + rng(a));
    assert.ok(await page.$('#tut-lengths svg'), 'the key-week drawing');
    assert.doesNotMatch(t, BAD); assert.doesNotMatch(t, BAD_FISH);
    noErrors(errors);
  } },
  { name: 'the guide: Growing up, with stages, school days, events, curfew, neighborhoods by age, jobs, graduation, seasons and the city', fn: async ctx => {
    const { page, errors } = await open(ctx);
    const t = await chapter(page, 'growup');
    assert.ok(t, 'the chapter is there');
    for (const s of ['Middle school', '12–13', 'High school', '14–17', '18 and up', '8:15 AM', '2:45 PM', 'Grades +3', 'Grades −3, Family −5',
      'The fall concert', 'Winter break', 'Spring testing week', 'The last day of school', 'Orientation at Hilltop High', 'Finals week', 'Prom night with your friends',
      'A summer job', 'Senior week', 'Birthdays', 'Family −12', 'Youth ORCA', 'Stadium District', 'Northeast Tacoma', 'Copper Kettle', 'Museum of Glass',
      'UW Tacoma', 'trade program', 'snow day', 'first sunny day of spring', 'Sunrise and sunset', 'T Line', 'tenant protections']) assert.ok(t.includes(s), 'mentions ' + s);
    // neighborhoods open by age, from the code
    const opens = await page.evaluate(() => GROW.hoods.OPEN);
    for (const a of new Set(Object.values(opens))) assert.match(t, new RegExp('\\n' + a + '\\t'), 'a row for age ' + a);
    assert.doesNotMatch(t, BAD); assert.doesNotMatch(t, BAD_FISH);
    // nothing duplicated: the Growing Up chapter no longer carries the lengths or the neighborhoods
    const g = await page.evaluate(() => document.getElementById('tut-grow').innerText);
    assert.doesNotMatch(g, /New life: lengths and ages|Youth ORCA/);
    // the whole guide stays clean too
    assert.doesNotMatch(await page.textContent('#tut'), BAD);
    noErrors(errors);
  } },
  { name: 'longer Growing Up: “Unpack a box” only in the first week (Quick play keeps it)', fn: async ctx => {
    const { page, errors } = await open(ctx);
    const r = await page.evaluate(() => {
      setMode('grow'); newGame('normal'); closeModals(); S.loc = 'home';
      const quick = actionsHere().some(a => /Unpack a box/.test(a.l)) && todoItems().some(i => /Unpack/.test(i.l));
      return { quick };
    });
    assert.ok(r.quick, 'Quick play offers it');
    await life(page);
    const r2 = await page.evaluate(() => {
      S.loc = 'home'; const first = actionsHere().some(a => /Unpack a box/.test(a.l));
      lifeFF(1); closeModals(); S.loc = 'home'; S.boxes = 0;
      return { first, kwi: S.kwi, later: actionsHere().some(a => /Unpack a box/.test(a.l)), todo: todoItems().some(i => /Unpack/.test(i.l)) };
    });
    assert.ok(r2.first, 'the first key week offers it');
    assert.strictEqual(r2.kwi, 1);
    assert.ok(!r2.later, 'not in a later key week'); assert.ok(!r2.todo, 'not on the To-do tab');
    noErrors(errors);
  } },
  { name: 'longer Growing Up: the “last week of summer” morning line only in late August', fn: async ctx => {
    const { page, errors } = await open(ctx);
    const r = await page.evaluate(() => {
      const LINE = 'The last week of summer', R = Math.random;
      setMode('grow'); newGame('normal'); closeModals();
      Math.random = () => 0; uiNarr = []; S.cur = 2; GROW.onMorning(2); const quick = uiNarr.join(' ').includes(LINE); Math.random = R;
      return { quick, LINE };
    });
    assert.ok(r.quick, 'Quick play (Aug 26) still has it');
    await life(page);
    const r2 = await page.evaluate(LINE => {
      lifeFF(1); closeModals(); const R = Math.random, d = day(), out = { date: dateOf(d).label };
      Math.random = () => 0; uiNarr = []; GROW.onMorning(d + 1); out.later = uiNarr.join(' '); Math.random = R;
      out.hit = out.later.includes(LINE); return out;
    }, r.LINE);
    assert.ok(!/Aug/.test(r2.date), 'a later key week: ' + r2.date);
    assert.ok(!r2.hit, 'not outside late August: ' + r2.later);
    noErrors(errors);
  } },
  { name: 'longer Growing Up: Friends and every stat are whole numbers after a time skip', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await life(page);
    const r = await page.evaluate(() => {
      for (const k of KIDS) gFriend(k.id, 5);
      lifeFF(1); closeModals(); render();
      const hud = document.querySelector('.hud') ? document.querySelector('.hud').innerText : document.body.innerText;
      return { kwi: S.kwi, f: KIDS.map(k => S.kids[k.id].f), friends: gFriends(), stats: [S.money, S.energy, S.mood, S.family, S.grades], hud };
    });
    assert.strictEqual(r.kwi, 1);
    for (const v of [...r.f, r.friends, ...r.stats]) assert.ok(Number.isInteger(v), 'whole number: ' + v + ' in ' + JSON.stringify(r));
    assert.doesNotMatch(r.hud, /\d\.\d{2,}/, 'no long decimals on screen');
    noErrors(errors);
  } },
  { name: 'longer Growing Up: the day summary shows Grades after the first week, not “🎒 0%”', fn: async ctx => {
    const { page, errors } = await open(ctx);
    const q = await page.evaluate(() => { setMode('grow'); newGame('normal'); closeModals(); return daySummary(1).join(' '); });
    assert.match(q, /🎒 \d+%/, 'Quick play keeps Ready');
    await life(page);
    const r = await page.evaluate(() => { lifeFF(1); closeModals(); return { s: daySummary(day()).join(' '), g: gGrades() }; });
    assert.doesNotMatch(r.s, /🎒/);
    assert.ok(r.s.includes('📚 ' + r.g), r.s);
    noErrors(errors);
  } },
];
