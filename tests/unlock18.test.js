const { open, noErrors, assert } = require('./helpers');

// Turning 18 unlocks the adult game (src/js/73-adult-unlock.js): a save started at 12 or 15 that reaches 18 has exactly what a
// game started at 18 has, with one 🎉 You're 18 sheet; 18+ mode is never switched on silently.

async function start(page, len, age, year, bd) {
  await page.evaluate(([len, age, year, bd]) => {
    closeModals(); setMode(age < 18 ? 'grow' : 'adult'); LIFE_PICK = { length: len, startAge: age, startYear: year || 2026, birthday: bd || { m: 3, d: 14, label: 'March 14' } };
    newGame('normal'); closeModals(); if (!isGrow() && !S.jobPicked) { pickJob('cafe'); closeModals(); } tab = 'act'; render();
    if (!window.U18_WRAP) { window.U18_WRAP = true; window.U18N = 0; window.PATHS = []; const m = modal, ms = modalSwap;
      modal = function (t, b, btns) { if (/You’re 18/.test(t)) U18N++; if (/What comes next/.test(t)) PATHS.push(btns.map(x => x.l)); return m.apply(this, arguments); };
      modalSwap = function (t, b, btns) { if (/You’re 18/.test(t)) U18N++; if (/What comes next/.test(t)) PATHS.push(btns.map(x => x.l)); return ms.apply(this, arguments); }; }
    U18N = 0; PATHS = [];
  }, [len, age, year, bd]);
}
const sheetTitle = page => page.evaluate(() => { const m = document.querySelector('#mbg .modal'); return m ? (m.querySelector('h2') || m).textContent : ''; });
const sheetText = page => page.evaluate(() => { const m = document.querySelector('#mbg .modal'); return m ? m.innerText : ''; });
const sheetBtn = (page, re, peek = false) => page.evaluate(([src, peek]) => { const re = new RegExp(src); const bs = [...document.querySelectorAll('#mbg .modal > button.act')];
  const i = bs.findIndex(b => re.test(b.textContent)); if (i < 0) return null; const r = { dis: bs[i].disabled, s: bs[i].textContent }; if (!peek && !r.dis) MBTN(i); return r; }, [re.source, peek]);
const wait = page => page.waitForTimeout(30);

// ⏩ Skip to 18 through the sheets: the questions, the summary, graduation, the job path, the keys
async function skipTo18(page) {
  await page.evaluate(() => { closeModals(); skip18Start(); });
  await sheetBtn(page, /Skip to 18/);
  while (/Skip to 18 · /.test(await sheetTitle(page))) await sheetBtn(page, /Study hard/);
  await sheetBtn(page, /On to graduation/);
  await sheetBtn(page, /What’s next/);
  const path = await page.evaluate(() => [...document.querySelectorAll('#mbg .modal > button.act')].map(b => b.textContent));
  await sheetBtn(page, /Go to work/);
  await sheetBtn(page, /Café|café|Barista|barista/);
  await sheetBtn(page, /Pick up the keys/);
  return path;
}
// play on, key week by key week (every pop-up gets its first button), until graduation
async function playTo18(page) {
  return page.evaluate(() => { let g = 0; while (isGrow() && !S.over && g++ < 80) lifeFF(1); lifeFF(0); closeModals();
    return { grow: isGrow(), age: S.age, gradDay: S.life.gradDay, bday: lifeBday(S, 18), kw: lifeKw().kind }; });
}
// close whatever is open (the morning report), then let the 🎉 sheet come up
async function settle(page) {
  for (let i = 0; i < 6; i++) { const t = await sheetTitle(page); if (!t || /You’re 18/.test(t)) break; await page.evaluate(() => { const bs = [...document.querySelectorAll('#mbg .modal > button.act')]; const j = bs.findIndex(b => !b.disabled); if (j >= 0) MBTN(j); else document.getElementById('mbg').remove(); }); await wait(page); }
  await wait(page);
}
// every adult feature, in the save as it is now
const adultChecks = page => page.evaluate(() => {
  closeModals(); const o = {}; S.money = 30000; S.loc = 'home'; S.standing = 70; S.t = S.cur * 1440 + 600;
  o.grow = isGrow(); o.age = S.age; o.mode = S.mode; o.rent = S.rent.amt > 0; o.career = !!careerS(); o.prices = typeof priceOn === 'function' && priceOn();
  // the phone: a plan, then Rides, Bank and Jobs from the App Store
  phonePickPlan('prepaid'); const store = phoneStoreApps().map(a => a.id); o.store = store;
  o.inst = ['rides', 'bank', 'jobs'].map(id => { phoneInstall(id); return S.ph.apps.includes(id); });
  // apply for an adult job in 💼 Jobs
  phoneOpen('jobs'); const ap = [...document.querySelectorAll('#phoneUI .ph-btn')].find(b => /Apply to/.test(b.textContent)); o.apply = !!ap; if (ap) ap.click(); o.applied = !!(S.ph.jobs && S.ph.jobs.app); phoneClose();
  // a driver's license and a used car
  o.lic = CAR.S().lic; const shop = actionsHere().find(a => /Shop for a used car/.test(a.l)); o.shop = !!shop && !shop.dis;
  if (shop) { shop.fn(); const bs = [...document.querySelectorAll('#mbg .modal > button.act')]; const j = bs.findIndex(b => !b.disabled && /—/.test(b.textContent)); if (j >= 0) MBTN(j); }
  o.car = !!(S.car && S.car.own); o.drive = CAR.canDrive();
  // the adult crime ladder (not Growing Up's family-and-school one)
  const k0 = (CRIMES.kid().list || []).length; crimeOffense('u18test', { label: 'Test', sev: 1 }); closeModals();
  o.crime = CRIMES.S().list.some(x => x.id === 'u18test'); o.kidCrime = CRIMES.kid().list.length > k0;
  // no kid content: curfew, phone rules, kid apps
  o.phKid = !!(S.ph.gr && !S.ph.gr.done); o.kidApps = PHONE_APPS.filter(a => a.kid && phoneShown(a)).map(a => a.id);
  return o;
});
function assertAdult(r, label) {
  assert.strictEqual(r.grow, false, label); assert.ok(r.age >= 18, label); assert.strictEqual(r.mode, 'adult', label); assert.ok(r.rent, label + ': rent');
  assert.ok(r.career, label + ': the careers ladder'); assert.ok(r.prices, label + ': prices rise');
  for (const id of ['rides', 'bank', 'jobs', 'groc', 'health', 'club']) assert.ok(r.store.includes(id), `${label}: ${id} in the App Store`);
  assert.deepStrictEqual(r.inst, [true, true, true], label + ': installed Rides, Bank, Jobs');
  assert.ok(r.apply && r.applied, label + ': applied for a job');
  assert.ok(r.lic, label + ': licensed'); assert.ok(r.shop, label + ': can shop for a car'); assert.ok(r.car && r.drive, label + ': bought a car and can drive');
  assert.ok(r.crime && !r.kidCrime, label + ': the adult crime ladder');
  assert.ok(!r.phKid, label + ': phone rules ended'); assert.deepStrictEqual(r.kidApps, [], label + ': no kid apps');
}
// what's on offer: actions everywhere (numbers and the clock left out), and the apps
const offer = page => page.evaluate(() => {
  closeModals(); const o = { acts: {}, apps: [] }; const d0 = S.cur, t0 = S.t, l0 = S.loc;
  const r0 = Object.assign({}, S.rent); S.rent.paid = false; S.rent.due = S.cur + 9;   // the same rent state (the first rent of a kid save comes with the next key week)
  S.cur = dayIndexOf(2026, 10, 14); S.t = S.cur * 1440 + 660;   // the same date and time in both saves (places and fairs follow the calendar)
  for (const k of Object.keys(L)) { S.loc = k; try { o.acts[k] = [...new Set(actionsHere().map(a => a.l.replace(/[\d$,.:]+|AM|PM/g, '#').replace(/\(.*?\)/g, '').trim()))].sort(); } catch (e) { o.acts[k] = ['ERR ' + e]; } }
  o.apps = PHONE_APPS.filter(a => phoneShown(a)).map(a => a.id).sort();
  o.tabs = typeof allTabs === 'function' ? allTabs().map(t => t[0]) : [];
  S.cur = d0; S.t = t0; S.loc = l0; S.rent = r0; return o;
});

module.exports = [
  { name: 'a save started at 12 skips to 18: one You’re 18 sheet, the Army choice, then every adult feature works', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page, 'life', 12);
    const path = await skipTo18(page);
    assert.ok(path.some(l => /Enlist in the Army/.test(l)), 'the Army choice at 18');
    await settle(page);
    assert.match(await sheetTitle(page), /You’re 18/);
    const t = await sheetText(page);
    assert.match(t, /Your own place/); assert.match(t, /used car/); assert.match(t, /Rides/); assert.match(t, /Bank/); assert.match(t, /No curfew/);
    assert.ok(await sheetBtn(page, /Turn on 18\+ mode/, true), 'offered, not switched on');
    await sheetBtn(page, /Got it/);
    const n = await page.evaluate(() => { render(); lifeFF(1); closeModals(); render(); return { n: U18N, rel: !!(S.rel && S.rel.on), u: S.life.u18 }; });
    await wait(page);
    assert.strictEqual(await page.evaluate(() => U18N), 1, 'one sheet'); assert.strictEqual(n.rel, false, '18+ mode stays off'); assert.strictEqual(n.u, 'shown');
    assertAdult(await adultChecks(page), 'from 12');
    noErrors(errors);
  } },
  { name: 'a save started at 15 plays to 18: graduation on the birthday, one You’re 18 sheet, the Army choice, every adult feature', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page, 'life', 15);
    const r = await playTo18(page);
    assert.strictEqual(r.grow, false); assert.strictEqual(r.age, 18);
    assert.strictEqual(r.gradDay, r.bday, 'graduated on the 18th birthday, not at the end of the week');
    const p = await page.evaluate(() => ({ n: U18N, paths: PATHS, u: S.life.u18 }));
    assert.strictEqual(p.n, 1, 'one sheet'); assert.strictEqual(p.u, 'shown');
    assert.ok(p.paths.some(b => b.some(l => /Enlist in the Army/.test(l))), 'the Army choice at 18');
    assertAdult(await adultChecks(page), 'from 15');
    // a time skip later: still adult, no second sheet
    await page.evaluate(() => { lifeFF(1); closeModals(); render(); }); await wait(page);
    assert.strictEqual(await page.evaluate(() => U18N), 1);
    noErrors(errors);
  } },
  { name: 'a game started at 18 and a kid save at 18 offer the same actions, apps and tabs', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page, 'life', 18);
    const A = await offer(page);
    assert.strictEqual(await page.evaluate(() => U18N), 0, 'no You’re 18 sheet for a game started at 18');
    for (const age of [12, 15]) {
      await start(page, 'life', age, 2027 - (18 - age), { m: 8, d: 30, label: 'August 30' });   // 18 in late August 2026, when the adult game starts: the same city
      await page.evaluate(() => { closeModals(); render(); });
      await skipTo18(page); await settle(page); await page.evaluate(() => closeModals());
      const K = await offer(page);
      assert.strictEqual(await page.evaluate(() => yearNow()), 2026);
      assert.deepStrictEqual(K.apps, A.apps, `apps from ${age}`);
      assert.deepStrictEqual(K.tabs, A.tabs, `tabs from ${age}`);
      for (const k of Object.keys(A.acts)) { const a = A.acts[k], b = K.acts[k] || []; assert.deepStrictEqual({ only18: a.filter(x => !b.includes(x)), onlyKid: b.filter(x => !a.includes(x)) }, { only18: [], onlyKid: [] }, `actions at ${k}, from ${age}`); }
    }
    noErrors(errors);
  } },
  { name: '18+ mode at 18: on as asked, offered with one tap (through the age check) otherwise, never on silently', fn: async ctx => {
    const { page, errors } = await open(ctx);
    // asked for earlier: on, with a line
    await start(page, 'life', 15);
    await page.evaluate(() => { setPref('age18', true); S.rel.auto18 = true; });
    await skipTo18(page); await settle(page);
    let r = await page.evaluate(() => ({ on: S.rel.on, t: document.querySelector('#mbg .modal').innerText, log: S.log.map(x => x.t || x).join(' ') }));
    assert.strictEqual(r.on, true); assert.match(r.t, /18\+ mode is on/); assert.doesNotMatch(r.t, /Turn on 18\+ mode/);
    // not asked for, no age check yet: off; the button goes through the age check first
    await page.evaluate(() => { localStorage.clear(); for (const k of Object.keys(prefs())) delete prefs()[k]; setPref('age18', false); setPref('adult18', false); });
    await start(page, 'life', 15);
    await skipTo18(page); await settle(page);
    assert.strictEqual(await page.evaluate(() => S.rel.on), false, 'off until the player says so');
    await sheetBtn(page, /Turn on 18\+ mode/); await wait(page);
    assert.match(await sheetTitle(page), /Adults only/);
    await sheetBtn(page, /I’m 18 or older/);
    assert.strictEqual(await page.evaluate(() => S.rel.on && relActive()), true);
    noErrors(errors);
  } },
];
