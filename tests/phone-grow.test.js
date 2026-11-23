const { open, noErrors, assert } = require('./helpers');

// Growing Up phone (src/js/57-phone-grow.js): the first phone, the rules, kid apps, screen time, 18.
async function start(page, { length = 'quick', age = 12 } = {}) {
  await page.evaluate(([length, age]) => {
    closeModals(); setMode('grow');
    LIFE_PICK = length === 'quick' ? null : { length, startAge: age, birthday: { m: 3, d: 14, label: 'March 14' } };
    newGame('normal'); tab = 'act'; render();
  }, [length, age]);
}
// take the phone from the first-phone scene (it waits behind the welcome)
const gift = page => page.evaluate(() => { closeModals(); pgGiftScene(); MBTN(0); closeModals(); render(); });
const at = (page, m) => page.evaluate(m => { S.t = S.cur * 1440 + m; }, m);

module.exports = [
  { name: 'no phone before the first-phone scene; the scene queues after the welcome and hands one over', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page);
    const r = await page.evaluate(() => {
      const o = { queued: MQ.some(q => /A phone of your own/.test(q[0])), owned: phoneOwned(), btn: !!document.querySelector('.hud .ph-top') };
      closeModals(); render(); S.loc = 'home';
      o.act = actionsHere().some(a => /Mom and Dad want to talk/.test(a.l));
      phoneOpen(); o.noPhone = (document.getElementById('mbg') || {}).textContent || ''; closeModals();
      actionsHere().find(a => /Mom and Dad want to talk/.test(a.l)).fn();
      o.scene = document.getElementById('mbg').textContent; MBTN(0);
      o.after = phoneOwned(); o.tier = S.ph.tier; render(); o.btn2 = !!document.querySelector('.hud .ph-top');
      o.act2 = actionsHere().some(a => /Mom and Dad want to talk/.test(a.l));
      return o;
    });
    assert.ok(r.queued, 'the scene waits behind the welcome');
    assert.strictEqual(r.owned, false); assert.strictEqual(r.btn, false);
    assert.ok(r.act); assert.match(r.noPhone, /No phone yet/);
    assert.match(r.scene, /Off at 9:00 PM/); assert.match(r.scene, /No paid apps/); assert.match(r.scene, /location/);
    assert.ok(r.after && r.btn2); assert.strictEqual(r.tier, 'old'); assert.strictEqual(r.act2, false);
    noErrors(errors);
  } },
  { name: 'starting at 15 the phone is already yours; an old save without phone-rule state keeps its phone', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page, { length: '1y', age: 15 });
    const r = await page.evaluate(() => { closeModals(); const o = { owned: phoneOwned() };
      delete S.ph.gr; o.old = phoneOwned(); return o; });
    assert.ok(r.owned && r.old);
    noErrors(errors);
  } },
  { name: 'rules in Settings; 9 PM lock (kitchen), earned 10 PM and one paid app a month', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page); await gift(page);
    const r = await page.evaluate(() => {
      const o = {}; S.loc = 'home'; S.t = S.cur * 1440 + 900; S.money = 50;
      phoneOpen(); phoneGo('settings'); o.set = document.querySelector('#phoneUI .ph-screen').textContent; phoneClose();
      S.t = S.cur * 1440 + 1270; o.can = phoneCan(); phoneOpen(); o.lock = document.querySelector('#phoneUI .ph-screen').textContent; phoneClose();
      o.inst0 = phoneStoreInstall('chat');
      S.t = S.cur * 1440 + 900; S.ph.lt = S.t;
      o.paid0 = phoneStoreInstall('blocks'); o.msg0 = PH_STORE_MSG.h;
      S.family = 80; S.grades = 80; o.earned = pgEarned(); o.off = pgOff();
      S.t = S.cur * 1440 + 1270; o.can2 = phoneCan();
      S.t = S.cur * 1440 + 900; S.ph.lt = S.t; const m0 = S.money;
      o.paid1 = phoneStoreInstall('blocks'); o.cost = m0 - S.money;
      phoneUninstall('blocks'); S.ph.inst.blocks = 0; o.paid2 = phoneStoreInstall('blocks'); o.msg2 = PH_STORE_MSG.h;
      phoneOpen(); phoneGo('settings'); o.set2 = document.querySelector('#phoneUI .ph-screen').textContent; phoneClose();
      return o;
    });
    assert.match(r.set, /Phone off at 9:00 PM/); assert.match(r.set, /No paid apps/); assert.match(r.set, /Mom can see your location/); assert.match(r.set, /What would change them/); assert.match(r.set, /Family 70\+/); assert.match(r.set, /Screen time/);
    assert.strictEqual(r.can, false); assert.match(r.lock, /kitchen/); assert.strictEqual(r.inst0, false, 'no installs after 9');
    assert.strictEqual(r.paid0, false); assert.match(r.msg0, /no paid apps/i);
    assert.ok(r.earned); assert.strictEqual(r.off, 1320); assert.strictEqual(r.can2, true, '9:10 PM is fine once earned');
    assert.strictEqual(r.paid1, true); assert.ok(r.cost >= 3, 'charged ' + r.cost);
    assert.strictEqual(r.paid2, false); assert.match(r.msg2, /one paid app this month/);
    assert.match(r.set2, /10:00 PM/); assert.match(r.set2, /Earned/);
    noErrors(errors);
  } },
  { name: 'adult-only apps are hidden in the App Store under 18', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page); await gift(page);
    const r = await page.evaluate(() => {
      definePhoneApp({ id: 'zz_adult', name: 'Grown-up thing', ic: '🍷', adult: true, view: () => 'x' });
      const o = { kid: phoneStoreApps().map(a => a.id) };
      setMode('adult'); o.adult = phoneStoreApps().map(a => a.id); setMode('grow');
      PHONE_APPS.splice(PHONE_APPS.findIndex(a => a.id === 'zz_adult'), 1); return o;
    });
    assert.ok(!r.kid.includes('zz_adult')); assert.ok(r.adult.includes('zz_adult'));
    for (const id of ['chat', 'homework', 'music', 'blocks']) assert.ok(r.kid.includes(id), id);
    assert.ok(!r.adult.includes('homework'), 'Homework Helper is for kids');
    noErrors(errors);
  } },
  { name: 'kid apps: group chat, homework on a school night, music', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page, { length: '1y' }); await gift(page);
    const r = await page.evaluate(() => {
      const o = {};
      let d = gSchoolDay() + 1; while (!isSchoolDay(d + 1)) d++;
      S.cur = d; S.t = d * 1440 + 960; S.loc = 'home'; S.ph.lt = S.t; S.grades = 60; S.mood = 50;
      KIDS.slice(0, 2).forEach(k => gFriend(k.id, 2));
      S.ph.apps = ['chat', 'homework', 'music'];
      phoneOpen('chat'); o.chat = document.querySelector('#phoneUI .ph-screen').textContent;
      const f0 = gFriends(); [...document.querySelectorAll('#phoneUI .ph-btn')].find(b => /Jump in/.test(b.textContent)).click(); o.fr = gFriends() - f0;
      phoneGo('homework'); const t0 = S.t; [...document.querySelectorAll('#phoneUI .ph-btn')].find(b => /Study/.test(b.textContent)).click(); o.gr = S.grades; o.mins = S.t - t0;
      phoneGo('music'); const m0 = S.mood; [...document.querySelectorAll('#phoneUI .ph-btn')].find(b => /Listen/.test(b.textContent)).click(); o.mood = S.mood - m0;
      o.scr = pgToday(); phoneClose(); return o;
    });
    assert.match(r.chat, new RegExp('and you'));
    assert.strictEqual(r.fr, 1); assert.strictEqual(r.gr, 62, 'Grades +2 on a school night'); assert.strictEqual(r.mins, 30);
    assert.ok(r.mood >= 3, 'mood ' + r.mood);
    assert.ok(r.scr >= 75, 'screen time from the apps ' + r.scr);
    noErrors(errors);
  } },
  { name: 'strikes: skipped school and missed curfew (with and without location); a bad report card', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page, { length: '1y' }); await gift(page);
    const r = await page.evaluate(() => {
      const o = {};
      let d = gSchoolDay() + 1; while (!isSchoolDay(d)) d++;
      S.cur = d; S.t = d * 1440 + 1000; S.loc = 'home'; S.ph.lt = S.t;
      const notes = []; GROW.onNight('home', notes, d); o.skip = notes.join(' '); o.back = S.ph.gr.back - d; o.owned = phoneOwned();
      render(); o.hud = !!document.querySelector('.hud .phbtn.off');
      phoneOpen(); o.taken = (document.getElementById('mbg') || {}).textContent || ''; closeModals();
      S.ph.gr.back = null; S.ph.gr.hold = null;
      // curfew, phone on: softer
      const c = gCurfew(); S.cur = d + 5; S.t = S.cur * 1440 + c + 5; S.loc = 'wright'; S.family = 60; S.ph.batt = 50; S.ph.lt = S.t; uiNarr = [];
      GROW.onTime(5); o.fam1 = S.family; o.c1 = uiNarr.join(' '); o.owned1 = phoneOwned(); o.held = pgHeld();
      // curfew, phone dead: full hit and the phone is taken
      S.cur = d + 6; S.t = S.cur * 1440 + c + 5; S.loc = 'wright'; S.family = 60; S.ph.batt = 0; uiNarr = [];
      GROW.onTime(5); o.fam2 = S.family; o.owned2 = phoneOwned();
      S.ph.gr.back = null; S.ph.batt = 100;
      // a bad report card at the start of a key week
      S.grades = 40; S.kwi = 2; uiNarr = []; LIFE_HOOKS.weekStart.forEach(f => { try { f(lifeKw()) } catch (e) {} }); o.rep = uiNarr.join(' '); o.owned3 = phoneOwned();
      return o;
    });
    assert.match(r.skip, /Mom takes your phone/); assert.strictEqual(r.back, 3); assert.strictEqual(r.owned, false);
    assert.ok(r.hud, '📵 on the top bar'); assert.match(r.taken, /Mom has your phone/);
    assert.strictEqual(r.fam1, 54, 'Family −6 with location on'); assert.match(r.c1, /dot on the map/); assert.ok(r.owned1); assert.ok(r.held);
    assert.strictEqual(r.fam2, 48, 'Family −12 with no location'); assert.strictEqual(r.owned2, false);
    assert.match(r.rep, /report card/); assert.strictEqual(r.owned3, false);
    noErrors(errors);
  } },
  { name: 'screen time: late use costs sleep and Grades, putting the phone away helps, a weekly note', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page, { length: '1y' }); await gift(page);
    const r = await page.evaluate(() => {
      const o = {}; let d = gSchoolDay() + 2;
      S.cur = d; S.loc = 'home'; S.grades = 60; S.family = 90; S.grades = 90;   // earned: phone until 10
      S.t = d * 1440 + 1250; S.ph.lt = S.t; S.ph.batt = 100; phoneOpen(); pass(50); phoneClose();
      o.late = S.ph.gr.late[d]; S.grades = 60; S.family = 60;
      const e0 = S.energy, notes = []; S.sch.went[d] = true; GROW.onNight('home', notes, d); o.night = notes.join(' '); o.en = S.energy - e0; o.gr = S.grades;
      // put it away: no penalty
      d++; S.cur = d; S.t = d * 1440 + 1140; S.ph.lt = S.t; S.ph.gr.scr[d] = 120;
      const a = actionsHere().find(x => /Put the phone away/.test(x.l)); o.act = !!a; a.fn(); o.can = phoneCan();
      const n2 = []; S.sch.went[d] = true; const g0 = S.grades; GROW.onNight('home', n2, d); o.n2 = n2.join(' '); o.g2 = S.grades - g0;
      tab = 'week'; render(); o.week = document.body.textContent;
      return o;
    });
    assert.ok(r.late >= 30, 'late minutes ' + r.late);
    assert.match(r.night, /after 9:00 PM/); assert.strictEqual(r.gr, 59);
    assert.ok(r.act); assert.strictEqual(r.can, false); assert.match(r.n2, /kitchen/); assert.strictEqual(r.g2, 0);
    assert.match(r.week, /Screen time this week/);
    noErrors(errors);
  } },
  { name: 'at 18 the rules end, the plan pick comes up and the contacts stay', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page, { length: '1y' }); await gift(page);
    const r = await page.evaluate(() => {
      S.ph.apps = ['homework', 'music']; S.age = 18;
      lifeHandoff('job', 'cafe', () => {}); closeModals(); render();
      const o = { owned: phoneOwned(), apps: S.ph.apps.join(), kid: phKid() };
      S.t = S.cur * 1440 + 1300; o.can = phoneCan();
      phoneOpen(); o.scr = document.querySelector('#phoneUI .ph-screen').textContent;
      [...document.querySelectorAll('#phoneUI .ph-btn')].find(x => /Prepaid/.test(x.textContent)).click();
      o.plan = S.ph.plan; o.people = phoneContacts().map(c => c.n); phoneClose(); return o;
    });
    assert.ok(r.owned); assert.strictEqual(r.kid, false); assert.strictEqual(r.apps, 'music');
    assert.ok(r.can, 'no 9 PM rule at 18'); assert.match(r.scr, /Pick a phone plan/); assert.strictEqual(r.plan, 'prepaid');
    assert.ok(r.people.includes('Mom'));
    noErrors(errors);
  } },
  { name: 'the Phone chapter in Help has the Growing Up rules, with no dating words', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await page.click('#helpBtn'); await page.waitForSelector('#tut');
    const t = await page.evaluate(() => (document.getElementById('tut-phone') || {}).innerText || '');
    assert.match(t, /Mom and Dad’s rules/); assert.match(t, /Screen time/);
    assert.doesNotMatch(t, /\b(romance|romantic|dat(e|es|ing)|boyfriends?|girlfriends?|fish\w*)\b/i);
    noErrors(errors);
  } },
];
