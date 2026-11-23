const { open, noErrors, assert } = require('./helpers');

// 💬 Messages (src/js/52-phone-msg.js) and 📞 Phone (53-phone-calls.js).
async function start(page, { grow = false } = {}) {
  await page.evaluate(grow => {
    closeModals(); setMode(grow ? 'grow' : 'adult'); LIFE_PICK = null;
    newGame('normal'); closeModals(); if (!isGrow()) { pickJob('cafe'); closeModals(); PH().plan = 'prepaid'; } tab = 'act'; render();
  }, grow);
}
const btns = page => page.evaluate(() => [...document.querySelectorAll('#phoneUI .ph-btn')].map(b => b.textContent));
const click = (page, re) => page.evaluate(src => { const r = new RegExp(src); const b = [...document.querySelectorAll('#phoneUI .ph-btn')].find(x => r.test(x.textContent) && !x.disabled); if (!b) throw new Error('no button ' + src); b.click(); }, re.source);

module.exports = [
  { name: 'text a neighbor: reply on game time, unread badge, history, battery; no service blocks it', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page);
    const r = await page.evaluate(() => {
      const o = {}; S.met.ron = 1; S.met.harris = 1; S.t = S.cur * 1440 + 1140;   // 7 PM: Ron is home
      o.apps = PHONE_APPS.filter(a => a.builtin).map(a => a.id);
      phoneOpen('msg'); o.list = document.querySelector('#phoneUI').textContent;
      phoneGo('msg', 'n:ron'); const b0 = S.ph.batt;
      [...document.querySelectorAll('#phoneUI .ph-btn')].find(x => /How’s it going/.test(x.textContent)).click();
      o.batt = b0 - S.ph.batt; o.mine = MSGS.M().th['n:ron'].m.map(m => m.f); o.q = MSGS.M().q.length;
      o.dis = [...document.querySelectorAll('#phoneUI .ph-btn')].filter(x => /How’s it going/.test(x.textContent))[0].disabled;
      phoneClose(); const c0 = S.community; pass(40);
      const T = MSGS.M().th['n:ron']; o.n = T.m.length; o.u = T.u; o.badge = phoneBadgeTotal(); o.comm = S.community - c0;
      phoneOpen('msg', 'n:ron'); o.read = MSGS.M().th['n:ron'].u; phoneClose();
      S.ph.cut = true; o.on = MSGS.on(); phoneOpen('msg', 'n:ron'); o.cut = document.querySelector('#phoneUI').textContent; phoneClose(); S.ph.cut = false;
      return o;
    });
    assert.ok(r.apps.includes('msg') && r.apps.includes('call'), 'Messages and Phone are built in');
    assert.match(r.list, /Ron/);
    assert.ok(r.batt >= 1, 'a text costs battery: ' + r.batt);
    assert.deepStrictEqual(r.mine, [1]); assert.strictEqual(r.q, 1); assert.ok(r.dis, 'one text at a time');
    assert.strictEqual(r.n, 2, 'the reply arrived within 40 minutes'); assert.strictEqual(r.u, 1); assert.ok(r.badge >= 1, 'unread badge');
    assert.strictEqual(r.comm, 1, 'a good exchange: community +1');
    assert.strictEqual(r.read, 0, 'opening the thread reads it');
    assert.strictEqual(r.on, false); assert.match(r.cut, /No service/);
    noErrors(errors);
  } },
  { name: 'asleep, at work, at school: replies wait; friends text first and invite you', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page);
    const r = await page.evaluate(() => {
      const o = {}; S.met.ron = 1; S.met.lorraine = 1; S.met.bev = 1;
      S.t = S.cur * 1440 + 1400; o.sleep = MSGS.avail('n:ron');
      const d0 = S.cur; S.t = d0 * 1440 + 600; o.work = (d0 % 7 < 5) ? MSGS.avail('n:ron') : 'work';
      o.retired = MSGS.avail('n:lorraine');
      MSGS.send('n:ron', 'how', 'How’s it going?'); const it = MSGS.M().q[0]; o.wait = it.at - S.t;
      // they text first: an invitation answered with "I'm in" walks you there
      MSGS.M().q = []; const th = MSGS.M().th; delete th['n:lorraine'];
      msgIn('n:lorraine', 'Come by for a bit?', { inv: { p: 'view', until: S.t + 150 } });
      S.loc = 'home'; phoneOpen('msg', 'n:lorraine'); const t0 = S.t;
      [...document.querySelectorAll('#phoneUI .ph-btn')].find(x => /On my way/.test(x.textContent)).click();
      o.loc = S.loc; o.mins = S.t - t0; o.cl = MSGS.cl('n:lorraine');
      // the daily plan of incoming texts
      let n = 0; for (let i = 0; i < 20; i++) { MSGS.incoming(); } for (const id in th) n += th[id].m.filter(m => m.f === 0).length;
      o.inc = n;
      return o;
    });
    assert.strictEqual(r.sleep, 'asleep'); assert.strictEqual(r.work, 'work'); assert.notStrictEqual(r.retired, 'work');
    assert.ok(r.wait >= 20, 'Ron is at work: the reply waits ' + r.wait);
    assert.strictEqual(r.loc, 'view'); assert.ok(r.mins >= 45, 'walk there and 45 minutes together: ' + r.mins);
    assert.ok(r.cl > 3, 'closer to Ms. Lorraine');
    assert.ok(r.inc >= 20, 'incoming texts arrive: ' + r.inc);
    noErrors(errors);
  } },
  { name: 'favors by text: a loan, a ride across town with no fare, help moving at home', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page);
    const r = await page.evaluate(() => {
      const o = {}; const R = Math.random; Math.random = () => 0.01;   // they say yes
      S.t = S.cur * 1440 + 1140; S.loc = 'home';
      const id = phoneContacts().find(c => c.grp === 'Family').id; o.fam = id; o.perks = MSGS.perks(id);
      const m0 = S.money; MSGS.send(id, 'loan', 'Could you spot me?'); MSGS.deliverAll(); o.loan = S.money - m0; o.owed = !!MSGS.M().loan[id];
      phoneOpen('msg', id); o.payBtn = [...document.querySelectorAll('#phoneUI .ph-btn')].some(x => /Pay .* back/.test(x.textContent)); phoneClose();
      MSGS.M().fav = {}; MSGS.send(id, 'ride', 'A ride?'); MSGS.deliverAll(); o.ride = !!MSGS.M().ride;
      o.act = actionsHere().some(a => /Ride with/.test(a.l));
      phoneOpen('msg', id); const dest = [...document.querySelectorAll('#phoneUI .ph-btn')].find(x => /Pacific Avenue/.test(x.textContent) && /no fare/.test(x.textContent)); o.dest = !!dest;
      const m1 = S.money, t1 = S.t; dest.click(); closeModals(); o.where = hoodOf(S.loc); o.fare = m1 - S.money; o.mins = S.t - t1; o.rideGone = !MSGS.M().ride;
      S.loc = 'home'; MSGS.M().fav = {}; MSGS.send(id, 'lift', 'Help me move?'); MSGS.deliverAll(); o.lift = actionsHere().some(a => /Move the heavy stuff/.test(a.l));
      const s0 = S.stress; actionsHere().find(a => /Move the heavy stuff/.test(a.l)).fn(); o.liftStress = s0 - S.stress;
      Math.random = R; return o;
    });
    assert.ok(r.perks.loan && r.perks.ride && r.perks.lift, 'family can do all three');
    assert.ok(r.loan > 0 && r.owed && r.payBtn, 'loan: money now, pay back from the thread');
    assert.ok(r.ride && r.act && r.dest, 'a ride: from the thread or the Here tab');
    assert.ok(r.where, 'driven to another neighborhood'); assert.strictEqual(r.fare, 0, 'no bus fare'); assert.ok(r.rideGone);
    assert.ok(r.lift && r.liftStress > 0, 'help moving at home');
    noErrors(errors);
  } },
  { name: 'calls: voicemail when asleep, talk a while (stress down, Call home for the day), favors answered on the call, incoming calls', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page);
    const r = await page.evaluate(() => {
      const o = {}; S.met.ron = 1; const d = day();
      S.t = d * 1440 + 1400; CALLS.start('n:ron'); o.out = CALLS.now().st;
      phoneOpen('call'); [...document.querySelectorAll('#phoneUI .ph-btn')].find(x => /voicemail/.test(x.textContent)).click(); o.cb = MSGS.M().q.some(it => it.k === 'cb'); phoneClose(); CALLS.end();
      const av0 = phAvail; phAvail = (id, t) => id === 'n:ron' ? av0(id, t) : 'free';
      S.t = d * 1440 + 1140; S.stress = 50; const fam = phoneContacts().find(c => c.grp === 'Family').id;
      CALLS.start(fam); o.on = CALLS.now().st; phoneOpen('call');
      const b0 = S.ph.batt; [...document.querySelectorAll('#phoneUI .ph-btn')].find(x => /Talk a while/.test(x.textContent)).click();
      o.stress = 50 - S.stress; o.called = !!S.called[d]; o.batt = b0 - S.ph.batt; o.homeAct = actionsHere().some(a => a.l === 'Call home');
      o.fav = [...document.querySelectorAll('#phoneUI .ph-btn')].some(x => /ride across town/.test(x.textContent));
      phoneClose(); CALLS.end();
      CALLS.ring(fam); o.ringAct = actionsHere().some(a => /is calling/.test(a.l)); o.badge = CL() && callBadge();
      phoneOpen('call'); o.inc = document.querySelector('#phoneUI').textContent; phoneClose();
      pass(20); o.missed = CL().log[0].dir;
      return o;
    });
    assert.strictEqual(r.out, 'out'); assert.ok(r.cb, 'voicemail: they text back');
    assert.strictEqual(r.on, 'on'); assert.ok(r.stress >= 5, 'stress down ' + r.stress); assert.ok(r.called && !r.homeAct, 'counts as the day’s Call home');
    assert.ok(r.batt >= 3, 'a call uses battery ' + r.batt); assert.ok(r.fav, 'favors on the call');
    assert.ok(r.ringAct && r.badge >= 1); assert.match(r.inc, /is calling/); assert.strictEqual(r.missed, 'missed');
    noErrors(errors);
  } },
  { name: 'the rent scam text arrives in Messages with the same choices; no phone: as before', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page);
    const r = await page.evaluate(() => {
      const o = {}; S.cur = 2; S.t = 2 * 1440 + 400;
      forceEvent('lev_scam'); fireHook('wake', {}); closeModals();
      o.pending = isPending('lev_scam'); const T = MSGS.M().th['x:scam']; o.th = !!T && T.m[0].ev === 'lev_scam';
      phoneOpen('msg'); o.list = document.querySelector('#phoneUI').textContent; phoneGo('msg', 'x:scam');
      o.btns = [...document.querySelectorAll('#phoneUI .ph-btn')].map(b => b.textContent);
      const m0 = S.money; [...document.querySelectorAll('#phoneUI .ph-btn')].find(x => /Call the landlord/.test(x.textContent)).click();
      o.done = !isPending('lev_scam'); o.money = S.money - m0; phoneClose();
      // no phone: the event works as before, nothing in Messages
      S.ph.lost = 'lost'; delete MSGS.M().th['x:scam']; S.ev.count.lev_scam = 0; S.ev.last.lev_scam = -99; S.cur = 3; S.t = 3 * 1440 + 400;
      forceEvent('lev_scam'); fireHook('wake', {}); closeModals(); o.pending2 = isPending('lev_scam'); o.th2 = !!(S.ph.msg.th['x:scam']);
      return o;
    });
    assert.ok(r.pending && r.th, 'in Messages and waiting for a decision'); assert.match(r.list, /555/);
    assert.ok(r.btns.some(b => /Call the landlord/.test(b)) && r.btns.some(b => /Delete it/.test(b)), 'the event’s choices in the thread');
    assert.ok(r.done); assert.strictEqual(r.money, 0);
    assert.ok(r.pending2 && !r.th2, 'no phone: the old way');
    noErrors(errors);
  } },
  { name: 'Ron’s cookout invite arrives as a text, from anywhere on Hilltop; going walks you home', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page);
    const r = await page.evaluate(() => {
      const o = {}; S.met.ron = 1; S.cur = 5; S.t = 5 * 1440 + 1080; S.loc = 'mlk';
      fireHook('arrive', { at: 'mlk', from: 'home' }); closeModals();
      const e = EV.find(x => x.id === 'neighbor_bbq'); o.cond = e.cond({ at: 'mlk', hook: 'arrive' }); o.condFar = e.cond({ at: 'dt_pacific', hook: 'arrive' });
      forceEvent('neighbor_bbq'); fireHook('arrive', { at: 'mlk', from: 'home' }); closeModals();
      o.pending = isPending('neighbor_bbq'); const T = MSGS.M().th['n:ron']; o.th = !!T && T.m.some(m => m.ev === 'neighbor_bbq');
      phoneOpen('msg', 'n:ron'); o.btns = [...document.querySelectorAll('#phoneUI .ph-btn')].map(b => b.textContent);
      [...document.querySelectorAll('#phoneUI .ph-btn')].find(x => /Grab a plate/.test(x.textContent)).click(); o.loc = S.loc; phoneClose();
      // no phone service: as before (home only)
      S.ph.cut = true; o.condCut = e.cond({ at: 'mlk', hook: 'arrive' });
      return o;
    });
    assert.ok(r.cond, 'fires away from home when texted'); assert.ok(!r.condFar, 'not across town');
    assert.ok(r.pending && r.th);
    assert.ok(r.btns.some(b => /Walk home first/.test(b)), 'the option says it walks you home');
    assert.strictEqual(r.loc, 'home'); assert.strictEqual(r.condCut, false);
    noErrors(errors);
  } },
  { name: 'Growing Up: text a friend from the hill and Grandma; friendship and Call Grandma', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page, { grow: true });
    const r = await page.evaluate(() => {
      const o = {}; gFriend('marcus', 4); S.t = S.cur * 1440 + 900;
      o.on = MSGS.on(); o.contacts = phoneContacts().filter(c => MSGS.M() && msgTextable(c.id)).map(c => c.id);
      const f0 = gF('marcus'); MSGS.send('k:marcus', 'how', 'hey whats up'); MSGS.deliverAll(); o.fr = gF('marcus') - f0;
      o.nia = msgTextable('fam:nia'); o.perks = Object.keys(MSGS.perks('fam:mom')).length;
      const m0 = S.mood; CALLS.start('fam:grandma'); o.gst = CALLS.now().st; if (o.gst === 'on') { CALLS.chat('fam:grandma'); } o.gma = !!S.grandma[day()]; o.mood = S.mood - m0; CALLS.end();
      // the Saturday barbecue from Tavita
      gFriend('tavita', 2); S.cur = gSat(); S.t = S.cur * 1440 + 480; forceEvent('g_bbq_morning'); fireHook('wake', {}); closeModals();
      o.bbq = !!(MSGS.M().th['k:tavita'] && MSGS.M().th['k:tavita'].m.some(m => m.ev === 'g_bbq_morning')); o.bbqP = isPending('g_bbq_morning');
      return o;
    });
    assert.ok(r.on); assert.ok(r.contacts.includes('k:marcus') && r.contacts.includes('fam:mom'));
    assert.ok(r.fr >= 1, 'friendship up'); assert.strictEqual(r.nia, false); assert.strictEqual(r.perks, 0, 'no money favors for kids');
    assert.strictEqual(r.gst, 'on'); assert.ok(r.gma && r.mood > 0, 'counts as Call Grandma');
    assert.ok(r.bbq && r.bbqP, 'Tavita texts the barbecue');
    noErrors(errors);
  } },
  { name: 'Help: the phone chapter has Messages and Phone and no dating words; save and reload keeps threads', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page);
    const r = await page.evaluate(() => { S.met.ron = 1; S.t = S.cur * 1440 + 1140; MSGS.send('n:ron', 'how', 'How’s it going?'); MSGS.deliverAll();
      const g = phoneGuide(); saveGame(); const n = S.ph.msg.th['n:ron'].m.length; return { g, n, packed: JSON.stringify(packSave()).includes('n:ron') }; });
    assert.match(r.g, /💬 Messages/); assert.match(r.g, /📞 Phone/);
    assert.doesNotMatch(r.g, /\b(romance|romantic|crush\w*|dat(e|es|ing)|boyfriends?|girlfriends?|kiss\w*|flirt\w*)\b/i);
    assert.ok(r.n >= 2); assert.ok(r.packed, 'threads are in the save');
    noErrors(errors);
  } },
];
