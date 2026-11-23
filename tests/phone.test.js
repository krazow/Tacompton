const { open, noErrors, assert } = require('./helpers');

// The in-game phone (src/js/50-phone.js core, 51-phone-apps.js built-ins).
async function start(page, { grow = false, length = 'quick', age } = {}) {
  await page.evaluate(([grow, length, age]) => {
    closeModals(); setMode(grow ? 'grow' : 'adult');
    LIFE_PICK = length === 'quick' ? null : { length, startAge: age || (grow ? 12 : 18), birthday: { m: 3, d: 14, label: 'March 14' } };
    newGame('normal'); closeModals(); if (!isGrow()) { pickJob('cafe'); closeModals(); } tab = 'act'; render();
  }, [grow, length, age]);
}
// open the phone as an adult and pick prepaid on the first opening
const openAdult = page => page.evaluate(() => { phoneOpen(); const b = [...document.querySelectorAll('#phoneUI .ph-btn')].find(x => /Prepaid/.test(x.textContent)); if (b) b.click(); });

module.exports = [
  { name: 'open and close from the top bar, status bar, plan pick, home grid, every built-in opens', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page);
    assert.ok(await page.$('.hud .ph-top'), 'a 📱 button on the top bar');
    await page.click('.hud .ph-top');
    await page.waitForSelector('#phoneUI .ph');
    assert.match(await page.textContent('#phoneUI'), /Pick a phone plan/);
    const m0 = await page.evaluate(() => S.money);
    await page.evaluate(() => [...document.querySelectorAll('#phoneUI .ph-btn')].find(x => /Prepaid/.test(x.textContent)).click());
    const r = await page.evaluate(() => ({ plan: S.ph.plan, paid: S.money, status: document.querySelector('#phoneUI .ph-status').textContent, apps: [...document.querySelectorAll('#phoneUI .ph-app .ph-nm')].map(x => x.textContent) }));
    assert.strictEqual(r.plan, 'prepaid'); assert.ok(m0 - r.paid >= 20 && m0 - r.paid <= 30, 'the first month is paid: ' + (m0 - r.paid));
    assert.match(r.status, /%/); assert.match(r.status, /5G/);
    for (const n of ['App Store', 'Clock', 'Contacts', 'Settings']) assert.ok(r.apps.includes(n), 'built-in ' + n);
    assert.strictEqual(r.apps.filter(x => x === 'Empty').length, 5, 'five empty slots');
    for (const id of ['store', 'clock', 'contacts', 'settings']) {
      await page.evaluate(id => phoneGo(id), id);
      const t = await page.textContent('#phoneUI .ph-screen');
      assert.doesNotMatch(t, /Something went wrong/, id);
      await page.evaluate(() => phoneBack());
    }
    await page.keyboard.press('Escape');
    assert.strictEqual(await page.$('#phoneUI'), null, 'Esc puts it away');
    await page.evaluate(() => phoneOpen()); await page.click('#phoneUI .ph-nav button:last-child');
    assert.strictEqual(await page.$('#phoneUI'), null, 'Close puts it away');
    noErrors(errors);
  } },
  { name: 'battery drains with time and use, charges at an outlet and overnight; dead blocks apps', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page);
    await openAdult(page);
    const r = await page.evaluate(() => {
      phoneClose(); const o = {}; S.ph.batt = 100; S.ph.lt = S.t;
      pass(300); o.idle = S.ph.batt;                          // 5 hours idle: about 10%
      phoneUse(10); o.used = S.ph.batt;
      S.loc = 'peoples'; S.ph.batt = 30; o.act = actionsHere().some(a => /Charge your phone/.test(a.l));
      actionsHere().find(a => /Charge your phone/.test(a.l)).fn(); o.charged = S.ph.batt;
      S.ph.batt = 0; o.can = phoneCan(); phoneOpen(); o.dead = document.querySelector('#phoneUI').textContent; phoneGo('clock'); o.dead2 = document.querySelector('#phoneUI').textContent;
      phoneClose();
      onNight('home', [], day()); o.night = S.ph.batt;
      S.ph.tier = 'new'; S.ph.batt = 100; phoneUse(10); o.newT = S.ph.batt; S.ph.tier = 'old'; S.ph.batt = 100; phoneUse(10); o.oldT = S.ph.batt;
      return o;
    });
    assert.ok(r.idle >= 88 && r.idle <= 92, 'idle drain ' + r.idle);
    assert.ok(Math.abs(r.idle - 10 - r.used) < 0.5, 'use drains ' + r.used);
    assert.ok(r.act, 'charge at People’s');
    assert.ok(r.charged >= 79 && r.charged <= 80, 'charged ' + r.charged);
    assert.strictEqual(r.can, false);
    assert.match(r.dead, /Battery dead/); assert.match(r.dead2, /Battery dead/);
    assert.strictEqual(r.night, 100, 'charged overnight at home');
    assert.ok(r.newT > 90 && r.oldT < 90, `a new phone drains less (${r.newT} vs ${r.oldT})`);
    noErrors(errors);
  } },
  { name: 'dead phone: no alarm, you wake late', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page);
    const r = await page.evaluate(() => {
      PH(); S.ph.batt = 2; S.t = S.cur * 1440 + 1439; afterAction(); closeModals();   // up past midnight: no charger
      return { batt: S.ph.batt, late: tod() - S.alarm };
    });
    assert.strictEqual(r.batt, 0); assert.strictEqual(r.late, 75);
    noErrors(errors);
  } },
  { name: 'App Store: install takes a game minute, 5-slot limit, remove frees a slot; Flashlight and Notes work', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page);
    await openAdult(page);
    const r = await page.evaluate(() => {
      const o = {};
      for (let i = 0; i < 6; i++) definePhoneApp({ id: 'x' + i, name: 'X' + i, ic: '🧩', order: 80, desc: 'test', view: () => '<p>x' + i + '</p>' });
      definePhoneApp({ id: 'hidden', name: 'Hidden', ic: '🙈', desc: 'never', when: () => false, view: () => 'h' });
      const t0 = S.t; o.ok = phoneInstall('flash'); o.min = S.t - t0;
      phoneInstall('notes'); phoneInstall('x0'); phoneInstall('x1'); phoneInstall('x2');
      o.full = phoneStoreInstall('x3'); o.n = S.ph.apps.length;
      phoneGo('store'); o.storeHidden = !document.querySelector('#phoneUI').textContent.includes('Hidden'); o.storeFull = /5 of 5 slots used/.test(document.querySelector('#phoneUI').textContent);
      phoneStoreRemove('x2'); o.after = S.ph.apps.length; o.ok2 = phoneStoreInstall('x3');
      phoneHome(); o.grid = [...document.querySelectorAll('#phoneUI .ph-nm')].map(x => x.textContent);
      phoneGo('flash'); const b0 = S.ph.batt; [...document.querySelectorAll('#phoneUI .ph-btn')].find(x => /Turn it on/.test(x.textContent)).click(); o.flash = b0 - S.ph.batt;
      phoneHome(); phoneGo('notes'); document.getElementById('phNoteIn').value = 'Pay rent early'; document.getElementById('phNoteAdd').click();
      o.prios = S.prios.map(q => q.t); o.notesErr = /Something went wrong/.test(document.querySelector('#phoneUI').textContent);
      return o;
    });
    assert.ok(r.ok); assert.strictEqual(r.min, 1, 'an install takes a minute');
    assert.strictEqual(r.full, false); assert.strictEqual(r.n, 5);
    assert.ok(r.storeHidden, 'when() hides an app'); assert.ok(r.storeFull);
    assert.strictEqual(r.after, 4); assert.ok(r.ok2);
    assert.ok(r.grid.includes('Flashlight') && r.grid.includes('X3') && !r.grid.includes('X2') && !r.grid.includes('Empty'));
    assert.ok(r.flash >= 5, 'the flashlight drains the battery');
    assert.deepStrictEqual(r.prios, ['Pay rent early']); assert.ok(!r.notesErr);
    noErrors(errors);
  } },
  { name: 'Clock sets the alarm; Contacts lists neighbors, coworkers and family; notifications badge', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page);
    await openAdult(page);
    const r = await page.evaluate(() => {
      const o = {}; S.met = { lorraine: 1, kim: 1 };
      phoneGo('clock'); [...document.querySelectorAll('#phoneUI .ph-btn')].find(x => x.textContent.includes('7:00 AM')).click(); o.alarm = S.alarm; o.clk = S.ph.clk;
      o.c = phoneContacts().map(c => c.grp + ':' + c.n);
      phoneHome(); phoneGo('contacts'); o.list = document.querySelector('#phoneUI').textContent;
      phoneGo('contacts', 'n:lorraine'); o.page = document.querySelector('#phoneUI').textContent;
      phoneClose(); phoneNotify('contacts', 'Ms. Lorraine saved your number'); render(); o.badge = (document.querySelector('.hud .ph-top .ph-badge') || {}).textContent;
      phoneOpen('contacts'); phoneClose(); o.badge2 = !!document.querySelector('.hud .ph-top .ph-badge');
      return o;
    });
    assert.strictEqual(r.alarm, 420); assert.strictEqual(r.clk, true);
    assert.ok(r.c.includes('Neighbors:Ms. Lorraine') && r.c.includes('Neighbors:Grace Kim'), JSON.stringify(r.c));
    assert.ok(r.c.some(x => x.startsWith('Work:')) && r.c.some(x => x.startsWith('Family:')));
    assert.ok(!r.c.some(x => x.startsWith('People')), 'no 18+ people with the mode off');
    assert.match(r.list, /Ms\. Lorraine/); assert.match(r.page, /porch/);
    assert.strictEqual(r.badge, '1'); assert.strictEqual(r.badge2, false);
    noErrors(errors);
  } },
  { name: 'the phone bill: charged on the 1st and in time skips, unpaid cuts the service until paid', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page, { length: '6m' });
    await openAdult(page);
    const r = await page.evaluate(() => {
      phoneClose(); const o = {}, d1 = dayIndexOf(2026, 9, 1), d2 = dayIndexOf(2026, 10, 1);
      S.money = 500; phoneMorning(d1); o.paid = 500 - S.money; o.cut0 = S.ph.cut;
      phoneMorning(d1); o.twice = 500 - S.money;                            // once a month
      S.money = 5; phoneMorning(d2); o.cut = S.ph.cut; o.owe = S.ph.owe;
      o.net = phoneNet(); o.install = phoneInstall('flash');
      S.loc = 'home'; o.payAct = actionsHere().some(a => /Pay the phone bill/.test(a.l));
      S.money = 100; actionsHere().find(a => /Pay the phone bill/.test(a.l)).fn(); o.cutAfter = S.ph.cut; o.net2 = phoneNet();
      // a time skip over Nov 1 – Dec 31: two bills
      S.money = 3000; const m0 = S.money, from = dayIndexOf(2026, 10, 15), to = dayIndexOf(2026, 12, 31);
      const notes = lifeSimulate(from, to, 'save'); o.skip = notes.find(n => /Phone bill paid/.test(n)) || '';
      return o;
    });
    assert.ok(r.paid >= 20 && r.paid <= 30, 'bill ' + r.paid); assert.ok(!r.cut0);
    assert.strictEqual(r.twice, r.paid, 'once a month');
    assert.strictEqual(r.cut, true); assert.ok(r.owe >= 20);
    assert.strictEqual(r.net, false); assert.strictEqual(r.install, false);
    assert.ok(r.payAct); assert.strictEqual(r.cutAfter, false); assert.strictEqual(r.net2, true);
    assert.match(r.skip, /paid 2 times/);
    noErrors(errors);
  } },
  { name: 'stolen at the Link stop: no phone until replaced, apps come back from the cloud', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page);
    await openAdult(page);
    const r = await page.evaluate(() => {
      phoneInstall('flash'); phoneInstall('notes'); phoneClose();
      const o = {}, e = EV.find(x => x.id === 'lev_phone'); S.lev = S.lev || {}; window.LEV.S().zip = false;
      e.run({ at: 'dt_pacific', from: 'link' }); o.owned = phoneOwned(); render(); o.btn = (document.querySelector('.hud .phbtn') || {}).textContent;
      phoneOpen(); o.modal = !!document.getElementById('mbg'); closeModals();
      const base = JSON.stringify(S);
      const ch = e.choices(); S.money = 500; ch[0].fn(); o.refurb = [phoneOwned(), S.ph.tier, S.ph.apps.join()];
      S = JSON.parse(base); e.choices()[1].fn(); o.old = [phoneOwned(), S.ph.tier];
      S = JSON.parse(base); e.choices()[2].fn(); o.none = phoneOwned();
      S.loc = 'mlk'; S.money = 500; const a = actionsHere().find(x => /Replace your phone: refurbished/.test(x.l)); o.shop = !!a; a.fn(); o.shopped = [phoneOwned(), S.ph.apps.join()];
      return o;
    });
    assert.strictEqual(r.owned, false); assert.strictEqual(r.btn, '📵'); assert.ok(r.modal, 'a no-phone note');
    assert.deepStrictEqual(r.refurb, [true, 'refurb', 'flash,notes']);
    assert.deepStrictEqual(r.old, [true, 'old']);
    assert.strictEqual(r.none, false); assert.ok(r.shop); assert.deepStrictEqual(r.shopped, [true, 'flash,notes']);
    noErrors(errors);
  } },
  { name: 'the phone flashlight helps in the power outage', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page);
    await openAdult(page);
    const r = await page.evaluate(() => {
      phoneInstall('flash'); phoneClose(); const e = EV.find(x => x.id === 'lev_outage'); uiNarr = [];
      e.run(); const said = uiNarr.join(' '); const ch = e.choices(); const b = S.ph.batt; ch[0].fn();
      return { said, l: ch.map(c => c.l), used: b - S.ph.batt, inv: !!(S.lev && S.lev.inv && S.lev.inv.flashlight) };
    });
    assert.match(r.said, /flashlight on your phone/); assert.match(r.l[0], /flashlight/i); assert.ok(r.used >= 10); assert.strictEqual(r.inv, false);
    noErrors(errors);
  } },
  { name: 'Growing Up: a phone at 12, no plan or bill, opens without errors', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page, { grow: true });
    const r = await page.evaluate(() => { const o = {}; pgGiftScene(); MBTN(0); closeModals(); render(); o.owned = phoneOwned(); o.btn = !!document.querySelector('.hud .ph-top');   // the first-phone scene (57-phone-grow.js)
      phoneOpen(); o.txt = document.querySelector('#phoneUI').textContent;
      for (const id of ['store', 'clock', 'contacts', 'settings']) { phoneGo(id); o[id] = /Something went wrong/.test(document.querySelector('#phoneUI').textContent); phoneBack(); }
      o.people = phoneContacts().map(c => c.n); phoneClose(); return o; });
    assert.ok(r.owned && r.btn); assert.doesNotMatch(r.txt, /Pick a phone plan/);
    for (const id of ['store', 'clock', 'contacts', 'settings']) assert.strictEqual(r[id], false, id);
    assert.ok(r.people.includes('Mom') && r.people.includes('Nia'));
    noErrors(errors);
  } },
  { name: 'an old save without a phone loads, and S.ph survives save/load', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page);
    const r = await page.evaluate(() => {
      const d = JSON.parse(JSON.stringify(packSave())); delete d.S.ph;
      const m = migrate(d); adopt(m); closeModals(); render();
      const o = { btn: !!document.querySelector('.hud .ph-top'), has: !!S.ph };
      phoneOpen(); o.open = !!document.querySelector('#phoneUI .ph'); phoneClose();
      S.ph.apps = ['flash']; S.ph.batt = 42; saveGame();
      const d2 = migrate(JSON.parse(JSON.stringify(packSave()))); adopt(d2); closeModals(); render();
      o.kept = [S.ph.apps.join(), S.ph.batt]; return o;
    });
    assert.ok(r.btn && r.has && r.open); assert.deepStrictEqual(r.kept, ['flash', 42]);
    noErrors(errors);
  } },
  { name: 'the Phone chapter in Help, after the life chapters, with no dating words', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await page.click('#helpBtn'); await page.waitForSelector('#tut');
    const r = await page.evaluate(() => { const ids = [...document.querySelectorAll('.tut-ch')].map(s => s.id); return { ids, t: (document.getElementById('tut-phone') || {}).innerText || '' }; });
    assert.ok(r.t.includes('Battery') && r.t.includes('App Store') && r.t.includes('phone bill') && r.t.includes('stolen'));
    assert.ok(r.ids.indexOf('tut-phone') === r.ids.indexOf('tut-growup') + 1, r.ids.join());
    assert.doesNotMatch(r.t, /\b(romance|romantic|dat(e|es|ing)|boyfriends?|girlfriends?|fish\w*)\b/i);
    noErrors(errors);
  } },
  { name: 'phone: a first-time tip on the home screen, gone after Got it', fn: async ctx => {
    const { page, errors } = await open(ctx);
    const r = await page.evaluate(() => { setMode('adult'); newGame('normal'); closeModals(); PH().plan = 'prepaid'; phoneOpen();
      const a = document.body.innerText.includes('Your phone.'); PH().tipSeen = 1; phoneRender(); const b = document.body.innerText.includes('Your phone.'); phoneClose(); return [a, b]; });
    assert.deepStrictEqual(r, [true, false]);
    noErrors(errors);
  } },
];
