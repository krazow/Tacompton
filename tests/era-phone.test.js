const { open, noErrors, assert } = require('./helpers');

// The phone by era (src/js/64-era-phone.js). The year comes from yearNow() (63-era.js); here it is stubbed with Y(page, year)
// (window.yearNow), which also drives eraHas() once the start-year file is in.
async function start(page, { grow = false, length = 'quick', age, year } = {}) {
  await page.evaluate(([grow, length, age, year]) => {
    closeModals(); if (year) window.yearNow = () => year;
    setMode(grow ? 'grow' : 'adult');
    LIFE_PICK = length === 'quick' ? null : { length, startAge: age || (grow ? 12 : 18), birthday: { m: 3, d: 14, label: 'March 14' } };
    newGame('normal'); closeModals(); if (!isGrow()) { pickJob('cafe'); closeModals(); } tab = 'act'; render();
  }, [grow, length, age, year]);
}
const Y = (page, y) => page.evaluate(y => { window.yearNow = () => y; }, y);
// what the phone looks like now: device, visible apps (home screen + App Store), status bar
const look = page => page.evaluate(() => {
  closeModals(); if (!isGrow() && !S.ph?.plan) { PH().plan = 'prepaid'; PH().billMk = phMonth(); }
  const shown = PHONE_APPS.filter(a => phoneShown(a)).map(a => a.id);
  phoneOpen(); const home = [...document.querySelectorAll('#phoneUI .ph-app .ph-nm')].map(x => x.textContent);
  const status = (document.querySelector('#phoneUI .ph-status') || {}).textContent || '', screen = (document.querySelector('#phoneUI .ph-screen') || {}).textContent || '';
  phoneClose(); return { dev: ERAPHONE.dev(), shown, home, status, screen, hud: (document.querySelector('.hud .phbtn') || {}).textContent || '' };
});
const ALL = ['msg', 'call', 'clock', 'contacts', 'camera', 'photos', 'store', 'settings', 'flash', 'notes', 'transit', 'maps', 'weather', 'rides', 'bank', 'jobs', 'groc', 'health', 'club', 'chat', 'music', 'blocks'];

module.exports = [
  { name: '2026: nothing changes (every app, the smartphone, 5G, no old-way actions)', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page);
    const r = await look(page);
    assert.strictEqual(r.dev, 'smart');
    for (const id of ALL) assert.ok(r.shown.includes(id), 'shown in 2026: ' + id);
    assert.match(r.status, /5G/); assert.ok(r.home.includes('App Store')); assert.ok(r.home.includes('Empty'));
    assert.match(r.hud, /📱/);
    const acts = await page.evaluate(() => { const o = {}; for (const loc of ['home', 'mlk']) { S.loc = loc; o[loc] = actionsHere().map(a => a.l); } return o; });
    for (const l of [...acts.home, ...acts.mlk]) assert.doesNotMatch(l, /Call a cab|Thomas Guide|MapQuest|morning paper|evening news|bank branch|Walkman|Discman|iPod|phone tree/, l);
    noErrors(errors);
  } },
  { name: 'each start year: the right device and apps, nothing early', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page);
    const dev = { 1990: 'land', 1999: 'cell', 2004: 'flip', 2008: 'smart', 2026: 'smart' };
    for (const y of [1990, 1995, 1999, 2004, 2008, 2010, 2012, 2014, 2016, 2021, 2026]) {
      await Y(page, y); const r = await look(page);
      if (dev[y]) assert.strictEqual(r.dev, dev[y], y + ' device');
      const exp = await page.evaluate(ids => ids.map(id => { const a = phoneApp(id), f = a.era, d = ERAPHONE.dev();
        if (!f) return [id, true]; const t = ERAPHONE.has(f), ok = f === 'text' || f === 'camera' ? d === 'flip' || d === 'smart' : d === 'smart';
        return [id, t && ok, ERAPHONE.fy(f)]; }), ALL);
      for (const [id, want, fy] of exp) assert.strictEqual(r.shown.includes(id), want, `${y}: ${id} (from ${fy})`);
      if (r.dev !== 'smart') assert.ok(!r.home.includes('Empty') && !r.home.includes('App Store'), y + ': no App Store slots');
      if (y < 2008) for (const id of ['store', 'maps', 'rides', 'bank', 'health', 'flash']) assert.ok(!r.shown.includes(id), `${y}: no ${id}`);
    }
    noErrors(errors);
  } },
  { name: 'before cell phones: the home phone, a pay phone for a quarter, the answering machine and a pager', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page, { year: 1992 });
    const r = await page.evaluate(() => {
      const o = {}; closeModals(); PH().plan = 'prepaid'; PH().billMk = phMonth(); S.loc = 'home'; S.t = S.cur * 1440 + 900; render();
      o.hud = document.querySelector('.hud .phbtn').textContent; o.name = phoneApp('call').name; o.msg = phoneShown(phoneApp('msg'));
      o.can = phoneCan(); phoneOpen(); o.home = document.querySelector('#phoneUI .ph-screen').textContent; o.status = document.querySelector('#phoneUI .ph-status').textContent; phoneClose();
      o.pager = ERAPHONE.pager();
      // a call from home: free
      const C = phoneContacts().filter(x => msgTextable(x.id)); o.n = C.length; const id = C[0].id; const m0 = S.money;
      callStart(id); o.callHome = !!CALLS.now(); o.costHome = m0 - S.money; CALLS.end();
      // a pay phone on MLK: a quarter
      S.loc = 'mlk'; o.canMlk = phoneCan(); const m1 = S.money; callStart(id); o.costPay = Math.round((m1 - S.money) * 100) / 100; o.callPay = !!CALLS.now(); CALLS.end();
      phoneOpen(); o.payScreen = document.querySelector('#phoneUI .ph-screen').textContent; phoneClose();
      // under the firs: no phone
      S.loc = 'ru_park'; o.canPark = phoneCan();
      // someone calls while you're out: the machine, and the pager
      S.loc = 'mlk'; CALLS.ring(id); S.ph.lt = S.t - 1; pass(1); o.ring = !!CL().ring; o.missed = CL().log[0].dir === 'missed' && !!CL().log[0].vm;
      o.pages = ERAPHONE.S().pages.length; o.act = actionsHere().some(a => /Call back .*a page/.test(a.l));
      const p = ERAPHONE.S().pages[0]; ERAPHONE.callBack(p.id); o.back = CALLS.now() && CALLS.now().st; CALLS.end(); o.pages2 = ERAPHONE.S().pages.length;
      // no battery drain on a landline
      S.ph.batt = 40; pass(60); o.batt = S.ph.batt;
      return o;
    });
    assert.match(r.hud, /☎️/); assert.strictEqual(r.name, 'Home phone'); assert.strictEqual(r.msg, false);
    assert.ok(r.can); assert.match(r.home, /kitchen wall/); assert.match(r.status, /Home phone/);
    assert.ok(r.pager, 'a pager in the 1990s'); assert.ok(r.n > 0);
    assert.ok(r.callHome); assert.strictEqual(r.costHome, 0);
    assert.ok(r.canMlk && r.callPay); assert.strictEqual(r.costPay, 0.25); assert.match(r.payScreen, /pay phone/i);
    assert.strictEqual(r.canPark, false);
    assert.ok(!r.ring && r.missed, 'away from home it goes to the machine');
    assert.strictEqual(r.pages, 1); assert.ok(r.act); assert.strictEqual(r.back, 'on', 'a call back gets through'); assert.strictEqual(r.pages2, 0);
    assert.strictEqual(r.batt, 100);
    noErrors(errors);
  } },
  { name: 'no texting before the 2000s: invitations stay in person; a flip phone texts for 10¢', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page, { year: 1999 });
    const r = await page.evaluate(() => {
      const o = {}; closeModals(); PH().plan = 'prepaid'; PH().billMk = phMonth(); S.loc = 'home'; S.t = S.cur * 1440 + 900;
      o.dev = ERAPHONE.dev(); o.msgOn = msgOn(); o.text = msgSend(phoneContacts().filter(x => msgTextable(x.id))[0].id, 'how', 'hi');
      const id = phoneContacts().filter(x => msgTextable(x.id))[0].id; callStart(id); o.call = !!CALLS.now(); CALLS.end();
      phoneOpen('contacts', id); o.contact = document.querySelector('#phoneUI .ph-screen').textContent; phoneClose();
      window.yearNow = () => 2005; o.dev2 = ERAPHONE.dev(); const m0 = S.money; o.text2 = msgSend(id, 'how', 'hi'); o.cost = Math.round((m0 - S.money) * 100) / 100;
      phoneOpen('msg', id); o.thread = document.querySelector('#phoneUI .ph-screen').textContent; phoneClose();
      return o;
    });
    assert.strictEqual(r.dev, 'cell'); assert.strictEqual(r.msgOn, false); assert.strictEqual(r.text, false);
    assert.ok(r.call, 'calls work on a cell phone'); assert.doesNotMatch(r.contact, /💬 Text/); assert.match(r.contact, /📞 Call/);
    assert.strictEqual(r.dev2, 'flip'); assert.strictEqual(r.text2, true); assert.strictEqual(r.cost, 0.1); assert.match(r.thread, /a text/);
    noErrors(errors);
  } },
  { name: 'an app arrives during the game: announced in the morning and in a time skip', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page, { year: 2013, length: '2y' });
    const r = await page.evaluate(() => {
      closeModals(); const o = { rides0: phoneShown(phoneApp('rides')) };
      window.yearNow = () => 2014; o.news = ERAPHONE.news().map(x => x[0]).join(' | '); o.again = ERAPHONE.news().length;
      window.yearNow = () => 2015; const notes = lifeSimulate(day(), day() + 2, null); o.skip = notes.join(' | ');
      window.yearNow = () => 2007; ERAPHONE.news(); window.yearNow = () => 2008; o.dev = ERAPHONE.news().map(x => x[0]).join(' | ');
      return o;
    });
    assert.strictEqual(r.rides0, false);
    assert.match(r.news, /New in the App Store: 🚗 <b>Rides<\/b>/); assert.strictEqual(r.again, 0, 'once');
    assert.match(r.skip, /New in the App Store: .*Jobs/);
    assert.match(r.dev, /smartphone/);
    noErrors(errors);
  } },
  { name: 'the old ways: a cab, the Thomas Guide, the paper and the news, the bank branch, a Walkman, the phone tree', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page, { year: 1995, length: '1y' });
    const r = await page.evaluate(() => {
      const o = {}; closeModals(); PH().plan = 'prepaid'; PH().billMk = phMonth(); S.loc = 'home'; S.money = 500;
      S.t = S.cur * 1440 + 480; let A = actionsHere().map(a => a.l); o.morning = A;
      actionsHere().find(a => a.l === 'Read the morning paper').fn(); o.paper = document.getElementById('mbg').textContent; closeModals();
      actionsHere().find(a => /Thomas Guide/.test(a.l)).fn(); o.guide = document.getElementById('mbg').textContent; closeModals();
      S.t = S.cur * 1440 + 1140; o.news = actionsHere().some(a => a.l === 'Watch the evening news');
      S.t = S.cur * 1440 + 900; o.walk = actionsHere().some(a => a.l === 'Put on your Walkman' || a.l === 'Put on your Discman');
      const h = Object.keys(HOODS).find(k => Object.keys(L).some(x => L[x].hood === k && !L[x].hidden)); const q = ERAPHONE.cabQuote(h); const m0 = S.money;
      o.cab = actionsHere().some(a => a.l === 'Call a cab'); ERAPHONE.cab(h); o.at = hoodOf(S.loc); o.fare = Math.round(m0 - S.money); o.price = q.price;
      S.loc = 'mlk'; o.bank = actionsHere().some(a => a.l === 'Stop by the bank branch');
      return o;
    });
    assert.ok(r.morning.includes('Read the morning paper')); assert.match(r.paper, /Weather/); assert.match(r.paper, /Classifieds/);
    assert.match(r.guide, /Thomas Guide/); assert.match(r.guide, /bus schedule/);
    assert.ok(r.news); assert.ok(r.walk); assert.ok(r.cab); assert.ok(r.at, 'the cab gets you there'); assert.ok(r.fare >= r.price, `cab fare ${r.fare} ≥ ${r.price}`);
    assert.ok(r.bank);
    noErrors(errors);
  } },
  { name: 'a film camera before camera phones', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page, { year: 1996 });
    const r = await page.evaluate(() => {
      closeModals(); S.loc = 'home'; const P = PH(); P.cam = { sc: { id: 'mountain_out', ic: '🏔️', title: 'The mountain is out', t: S.t, d: day(), at: S.loc } };
      const A = actionsHere(), o = { phone: A.some(a => a.ic === '📷'), film: A.find(a => a.ic === '📸') };
      const n0 = (P.photos || []).length; o.film.fn(); o.n = P.photos.length - n0; o.again = actionsHere().some(a => a.ic === '📸'); o.film = !!o.film; return o;
    });
    assert.strictEqual(r.phone, false); assert.ok(r.film); assert.strictEqual(r.n, 1); assert.strictEqual(r.again, false);
    noErrors(errors);
  } },
  { name: 'Growing Up by era: the home phone with a line limit, a first flip phone, a smartphone from 2010', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page, { grow: true, year: 1994 });
    const r = await page.evaluate(() => {
      const o = {}; o.scene = MQ.some(q => /phone of your own/.test(q[0])); closeModals(); render(); S.loc = 'home'; S.t = S.cur * 1440 + 900;
      o.dev = ERAPHONE.dev(); o.owned = phoneOwned(); o.talk = actionsHere().some(a => /Mom and Dad want to talk/.test(a.l));
      const id = phoneContacts().find(x => msgTextable(x.id)).id;
      ERAPHONE.S().line[day()] = ERAPHONE.LINE; callStart(id); o.blocked = !CALLS.now(); CALLS.end();
      window.yearNow = () => 2004; o.dev2 = ERAPHONE.dev(); o.owned2 = phoneOwned(); o.talk2 = actionsHere().some(a => /Mom and Dad want to talk/.test(a.l));
      pgGiftScene(); o.flip = document.getElementById('mbg').textContent; MBTN(0); closeModals(); o.owned3 = phoneOwned(); o.store = phoneShown(phoneApp('store'));
      window.yearNow = () => 2010; o.dev3 = ERAPHONE.dev(); o.store2 = phoneShown(phoneApp('store'));
      return o;
    });
    assert.strictEqual(r.scene, false, 'no first-phone talk before 2000'); assert.strictEqual(r.dev, 'land'); assert.ok(r.owned); assert.strictEqual(r.talk, false);
    assert.ok(r.blocked, 'the line limit');
    assert.strictEqual(r.dev2, 'flip'); assert.strictEqual(r.owned2, false); assert.ok(r.talk2);
    assert.match(r.flip, /flip phone/); assert.ok(r.owned3); assert.strictEqual(r.store, false);
    assert.strictEqual(r.dev3, 'smart'); assert.ok(r.store2);
    noErrors(errors);
  } },
  { name: 'guide: Phones through the years, with no dating words', fn: async ctx => {
    const { page, errors } = await open(ctx);
    const g = await page.evaluate(() => phoneGuide());
    assert.match(g, /Phones through the years/); assert.match(g, /pay phone/); assert.match(g, /Thomas Guide/);
    assert.doesNotMatch(g, /\b(dat(e|es|ing)|personal ads)\b/i);
    noErrors(errors);
  } },
];
// with the real start-year picker (63-era.js): no stubs
module.exports.push({ name: 'the real start year: 1990 home phone, 2000 Growing Up flip phone, 2010 smartphone, 2020 everything', fn: async ctx => {
  const { page, errors } = await open(ctx);
  const has = await page.evaluate(() => typeof eraStartYear === 'function');
  if (!has) return;   // before 63-era.js is on main
  const out = {};
  for (const [y, grow] of [[1990, false], [2000, true], [2010, false], [2020, false]]) {
    await page.evaluate(([y, grow]) => { closeModals(); setMode(grow ? 'grow' : 'adult');
      LIFE_PICK = { length: '1y', startAge: grow ? 12 : 18, startYear: y, birthday: { m: 3, d: 14, label: 'March 14' } };
      newGame('normal'); closeModals(); if (!isGrow()) { pickJob('cafe'); closeModals(); } tab = 'act'; render(); }, [y, grow]);
    out[y] = await page.evaluate(() => ({ y: yearNow(), dev: ERAPHONE.dev(), shown: PHONE_APPS.filter(a => phoneShown(a)).map(a => a.id) }));
  }
  assert.strictEqual(out[1990].y, 1990); assert.strictEqual(out[1990].dev, 'land'); assert.ok(!out[1990].shown.includes('msg'));
  assert.strictEqual(out[2000].dev, 'flip'); assert.ok(!out[2000].shown.includes('store'));
  assert.strictEqual(out[2010].dev, 'smart'); assert.ok(out[2010].shown.includes('maps')); assert.ok(!out[2010].shown.includes('rides'));
  for (const id of ['rides', 'bank', 'health', 'groc', 'jobs', 'club']) assert.ok(out[2020].shown.includes(id), '2020: ' + id);
  noErrors(errors);
} });
