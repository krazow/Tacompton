const { open, noErrors, assert } = require('./helpers');

// Growing Up's neighborhoods (src/js/34-grow-hoods.js): Tacoma opens up by age, kid versions of the packs' places, a first job at 16.
const BAD_KID = /\b(romance|romantic|crush\w*|dat(e|es|ing)|boyfriends?|girlfriends?|kiss\w*|flirt\w*|beer|wine|tavern|bar|cocktails?|concerts?)\b/i;
const BAD_FISH = /\b(fish\w*|salmon|marina|charters?|wdfw|chinook|coho|herring)\b/i;

async function startLife(page, length, startAge) {
  await page.evaluate(([length, startAge]) => {
    closeModals(); setMode('grow');
    LIFE_PICK = { length, startAge, birthday: { m: 3, d: 14, label: 'March 14' } };
    newGame('normal'); closeModals(); tab = 'act'; render();
  }, [length, startAge]);
}
const goList = page => page.evaluate(() => { const g = document.querySelector('details.go'); g.open = true;
  return { heads: [...g.querySelectorAll('.gohood')].map(x => x.textContent), dests: [...g.querySelectorAll('.dest b')].map(x => x.textContent) }; });
const acts = page => page.evaluate(() => [...document.querySelectorAll('#app .content button.act')].map(b => b.textContent));

module.exports = [
  { name: 'at 12 Growing Up stays on Hilltop: no neighborhoods in Go somewhere', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await page.evaluate(() => { setMode('grow'); newGame('normal'); closeModals(); tab = 'act'; render(); });
    const r = await goList(page);
    assert.deepStrictEqual(r.heads, [], 'no neighborhood headings at 12');
    assert.strictEqual(r.dests.length, 5);
    const hidden = await page.evaluate(() => Object.keys(L).filter(k => L[k].hood).every(k => L[k].hidden));
    assert.ok(hidden, 'every neighborhood place is in the table, hidden');
    noErrors(errors);
  } },
  { name: 'at 15 Go somewhere groups by neighborhood: Stadium, Downtown and the 15s, not the 16s', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await startLife(page, '1y', 15);
    const r = await goList(page);
    assert.ok(r.heads[0].includes('Hilltop'), r.heads.join(' | '));
    for (const h of ['Stadium District', 'Downtown', 'Proctor', 'Ruston', 'South End']) assert.ok(r.heads.some(x => x.includes(h)), 'has ' + h);
    for (const h of ['Old Town', 'West End', 'Eastside', 'Fern Hill', 'Northeast']) assert.ok(!r.heads.some(x => x.includes(h)), 'no ' + h + ' yet');
    assert.ok(r.heads.some(x => /Downtown.*Link/.test(x)) && r.heads.some(x => /Stadium.*Walk/.test(x)), 'the ride shows on the heading');
    noErrors(errors);
  } },
  { name: 'riding downtown goes through MLK, is free under 18, and opens kid-safe actions', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await startLife(page, '1y', 15);
    const r = await page.evaluate(() => { S.t = S.cur * 1440 + 660; const m0 = S.money, tm = travelMins('home', 'dt_pacific'), tm2 = travelMins('mlk', 'st_park');
      go('dt_pacific'); closeModals(); render();
      return { tm, tm2, paid: m0 - S.money, loc: S.loc, hood: Object.keys(S.gh.hoods), orca: S.gh.orca > 0, narr: uiNarr.join(' '), stress: S.stress }; });
    assert.strictEqual(r.tm, 6 + 12); assert.strictEqual(r.tm2, 14 + 8);
    assert.strictEqual(r.paid, 0, 'youth ride free'); assert.strictEqual(r.loc, 'dt_pacific');
    assert.deepStrictEqual(r.hood, ['downtown']); assert.ok(r.orca); assert.match(r.narr, /Youth ORCA/);
    assert.strictEqual(r.stress, undefined, 'no adult stats leak in');
    const a = await acts(page);
    assert.ok(a.some(x => /Union Station/.test(x)) && a.some(x => /Head home/.test(x)), a.join(' | '));
    assert.ok(a.some(x => /Now hiring: 16\+/.test(x)), 'the job is for 16+');
    noErrors(errors);
  } },
  { name: 'curfew still holds across town', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await startLife(page, '1y', 15);
    const r = await page.evaluate(() => { S.loc = 'dt_glass'; S.t = S.cur * 1440 + 1290; render(); const alert = document.body.innerText;
      pass(45); return { loc: S.loc, missed: !!S.curfew[day()], alert }; });
    assert.match(r.alert, /Home by 10:00 PM/);
    assert.strictEqual(r.loc, 'home'); assert.ok(r.missed);
    noErrors(errors);
  } },
  { name: 'at 16: a job at the Copper Kettle, shifts pay minimum wage into Money, three missed shifts and you are let go', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await startLife(page, '1y', 15);
    const r = await page.evaluate(() => { S.age = 16; S.loc = 'dt_pacific'; S.t = S.cur * 1440 + 720; render();
      const b = [...document.querySelectorAll('button.act')].find(x => /part-time job at the Copper Kettle/.test(x.textContent)); b.click();
      const modalTxt = document.getElementById('mbg').textContent; MBTN(0); closeModals();
      const job = S.gh.job.id;
      let tue = S.gh.job.since; while (tue % 7 !== 1) tue++;
      S.cur = tue; S.t = tue * 1440 + 950; S.loc = 'dt_pacific'; render();
      const m0 = S.money; [...document.querySelectorAll('button.act')].find(x => /Work your shift/.test(x.textContent)).click();
      const pay = S.money - m0, end = tod(), shifts = S.gh.shifts;
      const notes = []; for (const d of [tue + 2, tue + 4, tue + 7]) GROW.onNight('home', notes, d);
      return { modalTxt, job, pay, end, shifts, notes: notes.filter(n => /Copper Kettle/.test(n)), after: S.gh.job }; });
    assert.match(r.modalTxt, /17\.13 an hour/);
    assert.strictEqual(r.job, 'cafe'); assert.strictEqual(r.pay, Math.round(3 * 17.13)); assert.strictEqual(r.end, 1140); assert.strictEqual(r.shifts, 1);
    assert.strictEqual(r.notes.length, 3); assert.match(r.notes[2], /let you go/); assert.strictEqual(r.after, null);
    noErrors(errors);
  } },
  { name: 'turning 14 brings a Youth ORCA card and opens the city; texts stay kid-safe at 17', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await startLife(page, '2y', 12);
    const r = await page.evaluate(() => { let g = 0; while (S.age < 14 && !S.over && g++ < 40) lifeFF(1); closeModals();
      return { age: S.age, open: GROW.hoods.open('downtown'), moments: S.life.moments.map(m => m.t).join(' | '), mode: MODE }; });
    assert.strictEqual(r.mode, 'grow'); assert.ok(r.age >= 14, 'age ' + r.age); assert.ok(r.open);
    assert.match(r.moments, /Youth ORCA/);
    const txt = await page.evaluate(() => { S.age = 17; let s = ''; const t0 = S.t;
      for (const k of Object.keys(L).filter(k => L[k].hood)) for (const m of [600, 1000, 1290]) for (const dd of [0, 4, 5]) {
        S.loc = k; S.t = (S.cur - (S.cur % 7) + dd) * 1440 + m; S.cur = Math.floor(S.t / 1440); render(); s += '\n' + document.body.innerText; }
      S.t = t0; S.cur = Math.floor(t0 / 1440); S.loc = 'home'; render(); return s; });
    assert.ok(!BAD_KID.test(txt), 'kid-unsafe word: ' + (txt.match(BAD_KID) || [])[0]);
    assert.ok(!BAD_FISH.test(txt), 'banned word: ' + (txt.match(BAD_FISH) || [])[0]);
    noErrors(errors);
  } },
];
