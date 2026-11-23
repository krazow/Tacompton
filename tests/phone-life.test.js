const { open, noErrors, assert } = require('./helpers');

// The everyday phone apps (src/js/55-phone-life.js): Bank, Jobs, Groceries, Telehealth, Block club, Camera/Photos, Tacoma Hearts.
const BAD = /\b(romance|romantic|crush\w*|dat(e|es|ing)|boyfriends?|girlfriends?|kiss\w*|flirt\w*|sexy?|sexual|couples?)\b|Tacoma Hearts|💘/i;
async function start(page, { grow = false, length = 'quick', age } = {}) {
  await page.evaluate(([grow, length, age]) => {
    closeModals(); setMode(grow ? 'grow' : 'adult');
    LIFE_PICK = length === 'quick' ? null : { length, startAge: age || (grow ? 12 : 18), birthday: { m: 3, d: 14, label: 'March 14' } };
    newGame('normal'); closeModals(); if (!isGrow() && !S.jobPicked) { pickJob('cafe'); closeModals(); } tab = 'act'; render();
    if (!isGrow()) phonePickPlan('prepaid');
    window.inst = (...ids) => ids.forEach(id => { if (!S.ph.apps.includes(id)) S.ph.apps.push(id); });
  }, [grow, length, age]);
}
const A = (page, re) => page.evaluate(src => { const r = new RegExp(src); return actionsHere().filter(a => r.test(a.l)).map(a => ({ l: a.l, dis: !!a.dis })); }, re.source);

module.exports = [
  { name: 'the apps are in the App Store (adults), Camera and Photos are built in, and every view opens', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page);
    const r = await page.evaluate(() => {
      const store = phoneStoreApps().map(a => a.id), o = { store };
      inst('bank', 'jobs', 'groc', 'health', 'club'); phoneOpen(); o.home = [...document.querySelectorAll('#phoneUI .ph-app .ph-nm')].map(x => x.textContent);
      o.bad = [];
      for (const id of ['bank', 'jobs', 'groc', 'health', 'club', 'camera', 'photos']) { phoneGo(id); const t = document.querySelector('#phoneUI .ph-screen').textContent; if (/Something went wrong/.test(t)) o.bad.push(id); phoneBack(); }
      phoneClose(); return o;
    });
    for (const id of ['bank', 'jobs', 'groc', 'health', 'club']) assert.ok(r.store.includes(id), 'in the store: ' + id);
    assert.ok(!r.store.includes('hearts'), 'no 18+ app with the mode off');
    for (const n of ['Camera', 'Photos', 'Bank', 'Jobs', 'Groceries', 'Telehealth', 'Block club']) assert.ok(r.home.includes(n), 'on the home screen: ' + n);
    assert.deepStrictEqual(r.bad, []);
    // Growing Up: only the camera and the album (the adult apps are hidden)
    await start(page, { grow: true, length: '1y', age: 12 });
    const g = await page.evaluate(() => ({ store: phoneStoreApps().map(a => a.id), cam: phoneInstalled('camera'), ph: phoneInstalled('photos') }));
    assert.ok(g.cam && g.ph); for (const id of ['bank', 'jobs', 'groc', 'health', 'club', 'hearts']) assert.ok(!g.store.includes(id), 'not for kids: ' + id);
    noErrors(errors);
  } },
  { name: '🏦 Bank: bills, pay rent from anywhere, autopay with an overdraft fee or a bounce, the jar, and Freeze card against the wallet thief', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page);
    const r = await page.evaluate(() => {
      inst('bank'); const o = {}, base = JSON.stringify(S);
      phoneOpen('bank'); o.view = document.querySelector('#phoneUI .ph-screen').textContent; phoneClose();
      // pay from the Link stop
      S.loc = 'link'; S.money = 3000; phoneOpen('bank'); [...document.querySelectorAll('#phoneUI .ph-btn')].find(b => /Pay rent now/.test(b.textContent)).click(); o.paid = S.rent.paid; o.left = S.money; phoneClose();
      // autopay: enough, a little short, far short
      const due = d => { S = JSON.parse(base); S.ph.bank = { auto: true }; S.rent.paid = false; S.rent.due = d; };
      due(S.cur); S.money = S.rent.amt + 10; PHONE_LIFE.bankAutopay(S.cur); o.auto = [S.rent.paid, S.money];
      due(S.cur); S.money = S.rent.amt - 100; PHONE_LIFE.bankAutopay(S.cur); o.od = [S.rent.paid, S.money];
      due(S.cur); S.money = 100; PHONE_LIFE.bankAutopay(S.cur); o.bounce = [S.rent.paid, S.money];
      due(S.cur + 2); S.money = 5000; PHONE_LIFE.bankAutopay(S.cur); o.early = S.rent.paid;
      // the jar
      S = JSON.parse(base); inst('bank'); S.money = 100; phoneOpen('bank'); [...document.querySelectorAll('#phoneUI .ph-btn')].find(b => /Put \$20 in/.test(b.textContent)).click();
      o.jar = [window.LEV.S().jar, S.money]; [...document.querySelectorAll('#phoneUI .ph-btn')].find(b => /Take \$20 out/.test(b.textContent)).click(); o.jar2 = [window.LEV.S().jar, S.money]; phoneClose();
      // the wallet thief: not frozen → charged after 90 minutes; frozen in time → declined
      const theft = () => { S = JSON.parse(base); inst('bank'); S.money = 500; S.t = S.cur * 1440 + 900; S.loc = 'dt_dome'; S.ev.last = {}; S.ev.count = {}; S.ev.pending = []; forceEvent('lev_wallet'); fireHook('travel', { from: 'link', to: 'dt_dome' }); closeModals(); };
      theft(); const m1 = S.money; o.alert = (S.ph.notes.bank || []).length; pass(100); o.charged = m1 - S.money;
      theft(); const m2 = S.money; pass(20); phoneOpen('bank'); [...document.querySelectorAll('#phoneUI .ph-btn')].find(b => /Freeze your card/.test(b.textContent)).click(); phoneClose(); pass(100); o.frozen = m2 - S.money;
      theft(); const m3 = S.money; const opts = choiceOpts('lev_wallet'); const k = opts.findIndex(x => /Freeze your card/.test(x.l)); choiceApply('lev_wallet', k, 'pick'); const m3b = S.money; pass(100); o.choiceFreeze = [m3 - m3b, m3b - S.money];
      theft(); S.cur++; S.t = S.cur * 1440 + 420; pass(1); o.overnight = S.ph.bank.theft.done;
      return o;
    });
    assert.match(r.view, /Rent/); assert.match(r.view, /Phone bill/); assert.match(r.view, /autopay/i); assert.match(r.view, /Freeze your card/);
    assert.ok(r.paid, 'rent paid from the Link stop');
    assert.ok(r.auto[0] && r.auto[1] === 10, 'autopay pays: ' + r.auto);
    assert.ok(r.od[0] && r.od[1] === -135, 'a little short: paid, minus a $35 fee: ' + r.od);
    assert.ok(!r.bounce[0] && r.bounce[1] === 65, 'far short: it bounces with a fee: ' + r.bounce);
    assert.ok(!r.early, 'autopay waits for the due day');
    assert.deepStrictEqual(r.jar, [20, 80]); assert.deepStrictEqual(r.jar2, [0, 100]);
    assert.ok(r.alert >= 1, 'a card alert in the Bank app');
    assert.ok(r.charged >= 25 && r.charged <= 35, 'the stolen card is used: ' + r.charged);
    assert.strictEqual(r.frozen, 0, 'frozen in time: nothing more lost');
    assert.strictEqual(r.choiceFreeze[1], 0, 'the event’s own Freeze option freezes it');
    assert.ok(r.overnight, 'the charge resolves by the next day');
    noErrors(errors);
  } },
  { name: '💼 Jobs: a gig a day (not into a shift), listings in the longer games only, apply → offer → accept → a new job and a new ladder', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page);
    const q = await page.evaluate(() => {
      inst('jobs'); const o = {}; S.cur = 5; S.t = S.cur * 1440 + 600; S.energy = 80; const m = S.money, g = PHONE_LIFE.GIGS[0];   // a Saturday: no café shift
      phoneOpen('jobs'); o.txt = document.querySelector('#phoneUI .ph-screen').textContent;
      [...document.querySelectorAll('#phoneUI .ph-btn')].find(b => b.textContent.includes(g.n)).click(); o.earned = S.money - m; o.t = S.t - (S.cur * 1440 + 600);
      o.again = [...document.querySelectorAll('#phoneUI .ph-btn')].find(b => b.textContent.includes(PHONE_LIFE.GIGS[1].n)).disabled; phoneClose();
      S.cur = 7; S.t = S.cur * 1440 + 600; S.worked = {}; phoneOpen('jobs'); o.shift = [...document.querySelectorAll('#phoneUI .ph-btn')].find(b => b.textContent.includes(PHONE_LIFE.GIGS[1].n)).textContent; phoneClose();
      return o;
    });
    assert.match(q.txt, /Quick play you keep the job/); assert.doesNotMatch(q.txt, /Apply to/);
    assert.ok(q.earned >= 40 && q.earned <= 60 && q.t === 120, 'a delivery run: ' + JSON.stringify(q));
    assert.ok(q.again, 'one gig a day'); assert.match(q.shift, /Your shift/);
    await start(page, { length: '1y' });
    const r = await page.evaluate(() => {
      inst('jobs'); const o = {}; S.standing = 70; const d = day();
      phoneOpen('jobs'); [...document.querySelectorAll('#phoneUI .ph-btn')].find(b => /Apply to Tacoma General/.test(b.textContent)).click(); o.app = !!S.ph.jobs.app; phoneClose();
      PHONE_LIFE.jobsMorning(d + 1); o.offer = S.ph.jobs.offer && S.ph.jobs.offer.k; if (!o.offer) { S.ph.jobs.offer = { k: 'hospital', until: d + 4 }; o.forced = true; }
      phoneOpen('jobs'); [...document.querySelectorAll('#phoneUI .ph-btn')].find(b => /Accept/.test(b.textContent)).click(); phoneClose();
      o.before = S.job; careerS(); PHONE_LIFE.jobsMorning(d + 2); o.after = S.job; o.alarm = S.alarm; o.career = S.career; o.jobs = S.life.jobs.map(j => j.job);
      o.ladder = careerS().k; o.title = careerTitle();
      return o;
    });
    assert.ok(r.app, 'applied'); assert.strictEqual(r.offer, 'hospital', 'good standing gets an offer');
    assert.strictEqual(r.before, 'cafe'); assert.strictEqual(r.after, 'hospital'); assert.strictEqual(r.alarm, 360);
    assert.strictEqual(r.career, null, 'a new ladder'); assert.strictEqual(r.ladder, 'hospital'); assert.match(r.title, /CNA/);
    assert.ok(r.jobs.includes('hospital'), 'in the life summary’s jobs');
    noErrors(errors);
  } },
  { name: '🛒 Groceries: pickup on MLK in 5 minutes, or delivery to the door for a fee', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page);
    const r = await page.evaluate(() => {
      inst('groc'); const o = {}; S.t = S.cur * 1440 + 600; S.loc = 'home'; S.money = 500; S.food = 1;
      PHONE_LIFE.grocOrder('pick'); o.cost = 500 - S.money; S.loc = 'mlk'; o.early = actionsHere().find(a => /Pick up your grocery order/.test(a.l)).dis;
      pass(60); const a = actionsHere().find(a => /Pick up your grocery order/.test(a.l)); const t = S.t; a.fn(); o.pick = [S.food, S.t - t];
      S.loc = 'home'; const m = S.money; PHONE_LIFE.grocOrder('deliv'); o.dcost = m - S.money; pass(60); o.mid = S.food; pass(40); o.deliv = S.food;
      S.t = S.cur * 1440 + 1290; phoneOpen('groc'); o.late = [...document.querySelectorAll('#phoneUI .ph-btn')].every(b => !/Order/.test(b.textContent) || b.disabled); phoneClose();
      return o;
    });
    assert.ok(r.cost >= 40 && r.cost <= 44, 'the market’s price: ' + r.cost);
    assert.ok(r.early, 'not ready yet'); assert.deepStrictEqual(r.pick, [5, 5]);
    assert.ok(r.dcost > r.cost, 'delivery costs a fee'); assert.strictEqual(r.mid, 5); assert.strictEqual(r.deliv, 9);
    assert.ok(r.late, 'no orders late at night');
    noErrors(errors);
  } },
  { name: '🩺 Telehealth: the video visit in the sick-day event and for Tito Ben’s wrist, only with the app', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page);
    const r = await page.evaluate(() => {
      const o = {}, e = id => EV.find(x => x.id === id); S.cur = 2; S.t = S.cur * 1440 + 420; S.loc = 'home'; S.money = 500;
      o.without = e('ph_sick').choices().map(x => x.l); o.erWithout = e('lev_er').choices().length;
      inst('health'); o.with = e('ph_sick').choices().map(x => x.l); o.dflt = e('ph_sick').dflt(); o.erWith = e('lev_er').choices().map(x => x.l);
      S.ev.last = {}; S.ev.count = {}; S.ev.pending = []; forceEvent('ph_sick'); fireHook('wake', {}); closeModals();
      o.sick = S.ph.th.sick === day(); const en = S.energy, m = S.money; e('ph_sick').choices()[0].fn(); o.visit = [S.energy - en, m - S.money, !!S.ph.th.sick];
      return o;
    });
    assert.ok(!r.without.some(l => /video visit/i.test(l)) && r.without.length === 2);
    assert.ok(r.with[0].includes('video visit') && r.with.length === 3 && r.dflt === 2, JSON.stringify(r.with));
    assert.strictEqual(r.erWithout, 3); assert.ok(r.erWith.length === 4 && /video visit/.test(r.erWith[3]));
    assert.ok(r.sick); assert.ok(r.visit[0] >= 7 && r.visit[1] >= 14 && r.visit[1] <= 16 && !r.visit[2], JSON.stringify(r.visit));
    noErrors(errors);
  } },
  { name: '🏘️ Block club: join in the app, posts for the lost dog and package thieves, the Thursday reminder; the old action without the app', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page);
    const r = await page.evaluate(() => {
      const o = {}; S.loc = 'home'; ['lorraine', 'kim', 'dre', 'ron', 'bev'].forEach(k => S.met[k] = 1);
      o.old = actionsHere().some(a => a.l === 'Join the block club group chat');
      inst('club'); o.hidden = !actionsHere().some(a => a.l === 'Join the block club group chat');
      phoneOpen('club'); [...document.querySelectorAll('#phoneUI .ph-btn')].find(b => /Join the group chat/.test(b.textContent)).click(); o.chat = !!S.lev.chat; phoneClose();
      S.t = S.cur * 1440 + 700; S.loc = 'mlk'; S.ev.last = {}; S.ev.count = {}; EV.forEach(x => { if (!/^lev_/.test(x.id)) S.ev.count[x.id] = 9999; }); S.ev.pending = []; forceEvent('lev_dog'); fireHook('arrive', { at: 'mlk', from: 'home' }); closeModals();
      let thu = 0; while (dayName(thu) !== 'Thursday') thu++; PHONE_LIFE.clubMorning(thu);
      o.posts = S.ph.club.posts.map(p => p.x).join(' | '); o.badge = phoneBadge(phoneApp('club'));
      phoneOpen('club'); o.view = document.querySelector('#phoneUI .ph-screen').textContent; phoneClose();
      return o;
    });
    assert.ok(r.old, 'the old join action at home without the app'); assert.ok(r.hidden, 'with the app it moves into the app');
    assert.ok(r.chat); assert.match(r.posts, /terrier/); assert.match(r.posts, /meeting tonight/); assert.ok(r.badge >= 2);
    assert.match(r.view, /Thursdays, 6 to 8 PM/); assert.match(r.view, /Post on the board/);
    noErrors(errors);
  } },
  { name: '📷 Camera: a photo at the mountain (sheet button and Here action), the sunset, graduation; Photos, the life summary and the end screen', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page);
    const r = await page.evaluate(() => {
      const o = {}; S.cur = 2; S.t = S.cur * 1440 + 420; S.loc = 'home'; S.ev.last = {}; S.ev.count = {}; S.ev.pending = []; clearTiles();
      o.n = EV.find(x => x.id === 'mountain_out').choices().length;
      forceEvent('mountain_out'); fireHook('wake', {}); closeModals();
      o.act = actionsHere().some(a => /^Take a photo: The mountain/.test(a.l));
      openChoice('mountain_out'); const b = [...document.querySelectorAll('#mbg button')].map(x => x.textContent); o.sheet = b.some(t => /Stop and take a photo/.test(t));
      const i = b.findIndex(t => /Stop and take a photo/.test(t)); const t0 = S.t; MBTN(i); o.watched = S.t - t0;
      o.photos = S.ph.photos.map(p => p.cap + ' @ ' + p.pl); o.after = actionsHere().some(a => /^Take a photo/.test(a.l));
      // the sunset at the overlook
      S.loc = 'view'; S.t = S.cur * 1440 + sunsetOn(S.cur) - 30; S.sunset = {}; actionsHere().find(a => /^Watch the sunset/.test(a.l)).fn();
      actionsHere().find(a => /^Take a photo/.test(a.l)).fn(); o.sunset = S.ph.photos[S.ph.photos.length - 1].cap;
      phoneOpen('photos'); o.album = document.querySelector('#phoneUI .ph-screen').textContent; phoneClose();
      lifeMoment('🎓', 'Graduated from Hilltop High, then went to work.'); o.grad = S.ph.photos[S.ph.photos.length - 1].cap;
      o.sum = lifeSummaryHTML(); finish(); closeModals(); o.end = document.querySelector('.end') ? document.querySelector('.end').innerText : '';
      return o;
    });
    assert.strictEqual(r.n, 2, 'the moment itself still has two options');
    assert.ok(r.act, 'a Take a photo action'); assert.ok(r.sheet, 'a 📷 button on the moment');
    assert.strictEqual(r.watched, 15, 'stop and watch, with the photo');
    assert.ok(r.photos.length === 1 && /Rainier/.test(r.photos[0]) && /apartment/i.test(r.photos[0]), r.photos.join());
    assert.ok(!r.after, 'one photo per moment');
    assert.match(r.sunset, /Sunset/); assert.match(r.album, /Rainier/); assert.match(r.album, /2026/);
    assert.match(r.grad, /Graduation day/);
    assert.match(r.sum, /Photos taken/); assert.match(r.end, /Photos taken\s*3/);
    noErrors(errors);
  } },
  { name: '💘 the 18+ app: only with the mode on, sends a first message, hides (and frees its slot) when the mode is off; Help stays clean', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await page.evaluate(() => { setPref('age18', true); setPref('adult18', true); });
    await start(page);
    const r = await page.evaluate(() => {
      const o = {}; o.on = relActive(); o.store = phoneStoreApps().some(a => a.id === 'hearts');
      S.ph.apps = []; phoneStoreInstall('hearts'); o.inst = phoneInstalled('hearts');
      S.rel.me = { into: 'everyone', look: 'open', vibe: Object.keys(REL_VIBES)[0], likes: [] };
      phoneOpen('hearts'); o.view = document.querySelector('#phoneUI .ph-screen').textContent;
      const b = [...document.querySelectorAll('#phoneUI .ph-btn')].find(x => /Playful/.test(x.textContent)); o.had = !!b;
      if (b) { const t = S.t; b.click(); o.sent = S.t - t; o.after = document.querySelector('#phoneUI .ph-screen').textContent; }
      phoneClose();
      S.loc = 'link'; setTab('rel'); o.tab = document.body.innerText.includes('Open Tacoma Hearts on your phone'); setTab('act');
      S.rel.on = false; pass(1); o.off = [phoneInstalled('hearts'), S.ph.apps.includes('hearts'), phoneStoreApps().some(a => a.id === 'hearts')];
      S.rel.on = true; pass(1); o.back = S.ph.apps.includes('hearts');
      return o;
    });
    assert.ok(r.on && r.store && r.inst, JSON.stringify(r));
    assert.match(r.view, /match/);
    if (r.had) { assert.strictEqual(r.sent, 10); }
    assert.ok(r.tab, 'the ❤️ tab points at the phone app');
    assert.deepStrictEqual(r.off, [false, false, false], 'invisible with the mode off');
    assert.ok(r.back, 'and back when the mode is on again');
    // the Your phone chapter: the new apps, and nothing from the 18+ mode
    await page.evaluate(() => { S.rel.on = false; closeModals(); });
    await page.evaluate(() => helpModal()); await page.waitForSelector('#tut');
    const t = await page.evaluate(() => document.getElementById('tut-phone').innerText);
    for (const s of ['Bank', 'autopay', 'Freeze card', 'Jobs', 'gigs', 'Groceries', 'Telehealth', 'Block club', 'Camera', 'Photos']) assert.ok(t.includes(s), 'Help mentions ' + s);
    assert.doesNotMatch(t, BAD);
    const g = await page.evaluate(() => relGuideChapter());
    assert.match(g, /Tacoma Hearts on your phone/);
    noErrors(errors);
  } },
  { name: 'phone-life state survives a save and reload', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page);
    await page.evaluate(() => { inst('bank', 'groc'); S.ph.bank = { auto: true, frozen: true }; PHONE_LIFE.photoSave('🏔️', 'Test photo', 'home'); saveGame(); });
    await page.reload(); await page.waitForSelector('.title');
    const r = await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /Continue/.test(x.textContent)); if (b) b.click(); closeModals(); return { auto: S.ph.bank.auto, n: S.ph.photos.length, apps: S.ph.apps }; });
    assert.ok(r.auto && r.n === 1 && r.apps.includes('bank'), JSON.stringify(r));
    noErrors(errors);
  } },
];
