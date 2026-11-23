const fs = require('fs'), path = require('path');
const { ID, open, reload, noErrors, assert } = require('./helpers');

// Adult relationships, the optional 18+ mode (src/js/37-relationships.js).
// The rules: adults only (18+, with their age on the profile), never in Growing Up, under 18 or with the mode off;
// nothing explicit; consent is part of the game.
const SRC = fs.readFileSync(path.join(__dirname, '..', 'src', 'js', '37-relationships.js'), 'utf8');
const STRINGS = (SRC.match(/(['`])(?:\\.|(?!\1)[^\\])*\1/g) || []).join('\n');
// anything from this feature, on screen
const REL_TEXT = /\b(romance|romantic|crush\w*|dat(e|es|ing)|boyfriends?|girlfriends?|kiss\w*|flirt\w*|hookup|exclusive|stay over|move in with|Tacoma Hearts)\b|\bAsk \S+ out\b|💘|💞/i;
// explicit or degrading words that must never appear in the feature
const EXPLICIT = /\b(sex|sexy|sexual\w*|nude|naked|undress\w*|strip\w*|lingerie|erotic\w*|porn\w*|orgasm\w*|aroused|horny|lust\w*|grop\w*|moan\w*|breasts?|butt|thighs?|curves|abs|bodies|body|hooker\w*|prostitut\w*|escorts?|sugar daddy|one-night stand)\b/i;
const SLURS = /\b(slut\w*|whore\w*|bitch\w*|hoes?|skank\w*|thots?|tramp\w*|f[a@]g\w*|tr[a@]nn\w*|r[e3]tard\w*|d[y]ke\w*|sh[e]male\w*)\b/i;
const PRESSURE = /\b(insist\w*|beg\w*|pressure\w*|convince\w*|guilt\w*|keep asking|ask again now|don’t take no|won’t take no)\b/i;

// the device's age check and the start page setting, already answered
async function adultsOn(page) { await page.evaluate(() => { setPref('age18', true); setPref('adult18', true); }); }
async function adultGame(page, length = 'quick') {
  await page.evaluate(len => { closeModals(); setMode('adult'); LIFE_PICK = { length: len, startAge: 18, birthday: { m: 3, d: 14, label: 'March 14' } }; newGame('normal'); closeModals(); tab = 'act'; render(); }, length);
}
async function growGame(page, length = 'quick', age = 12) {
  await page.evaluate(([len, age]) => { closeModals(); setMode('grow'); LIFE_PICK = { length: len, startAge: age, birthday: { m: 3, d: 14, label: 'March 14' } }; newGame('normal'); closeModals(); tab = 'act'; render(); }, [length, age]);
}
// every tab, a few places and times, the Game options sheet
async function screenText(page) {
  return page.evaluate(() => {
    closeModals(); let s = document.body.innerText; const t0 = S.t, loc0 = S.loc, c0 = S.cur;
    for (const k of allTabs().map(t => t[0])) { closeModals(); setTab(k); s += '\n' + document.body.innerText; }
    setTab('act');
    for (const m of [600, 1100, 1250]) for (const k of Object.keys(L).filter(k => !isGrow() || !L[k].hood)) { S.t = S.cur * 1440 + m; S.loc = k; render(); s += '\n' + document.body.innerText; }
    S.t = t0; S.loc = loc0; S.cur = c0; render();
    return s;
  });
}
// every feature event's cond, in the current state (all must be false when the mode can't run)
const relEventsOpen = page => page.evaluate(() => EV.filter(e => /^rel_/.test(e.id)).map(e => {
  const ctxs = ['link', 'dt_dome', 'pr_market', 'work', 'home', 'dt_pacific'].map(at => ({ at, hook: e.hook }));
  return ctxs.some(c => { try { return !!e.cond(c); } catch (x) { return false; } }) ? e.id : null; }).filter(Boolean));
// the button in the open sheet whose label matches re
const sheetBtn = (page, re) => page.evaluate(src => { const re = new RegExp(src); const bs = [...document.querySelectorAll('#mbg .modal > button.act')];
  const i = bs.findIndex(b => re.test(b.textContent)); if (i < 0) throw new Error('no button ' + src + ' in: ' + bs.map(b => b.textContent).join(' | ')); MBTN(i); return i; }, re.source);
const sheetText = page => page.evaluate(() => { const m = document.getElementById('mbg'); return m ? m.innerText : ''; });
const sheetLabels = page => page.$$eval('#mbg .modal > button.act', bs => bs.map(b => b.textContent));

module.exports = [
  { name: 'the start page: Adults only (18+) asks once, “This mode is for players 18 and older”, then turns on for new adult games', fn: async ctx => {
    const { page, errors } = await open(ctx);
    assert.match(await page.textContent('#adultBtn'), /Adults only \(18\+\): Off/);
    await page.click('#adultBtn');
    assert.match(await sheetText(page), /This mode is for players 18 and older/);
    await page.setViewportSize({ width: 400, height: 820 }); await page.waitForTimeout(600);
    await page.screenshot({ path: '/tmp/rel-agecheck.png' }).catch(() => {});
    await sheetBtn(page, /Cancel/);
    assert.match(await page.textContent('#adultBtn'), /Off/);
    assert.strictEqual(await page.evaluate(() => !!prefs().age18), false, 'Cancel does not count as the check');
    await page.click('#adultBtn'); await sheetBtn(page, /I’m 18 or older/);
    assert.match(await page.textContent('#adultBtn'), /On/);
    await reload(page);
    assert.match(await page.textContent('#adultBtn'), /On/);
    // once asked, no second sheet: off and on again directly
    await page.click('#adultBtn'); assert.strictEqual(await page.$('#mbg'), null); assert.match(await page.textContent('#adultBtn'), /Off/);
    await page.click('#adultBtn'); assert.strictEqual(await page.$('#mbg'), null); assert.match(await page.textContent('#adultBtn'), /On/);
    // the start page order is unchanged: Help, Feedback, Install still right under the big button
    const order = await page.$$eval('.title .body button', bs => bs.map(b => /\bbig\b/.test(b.className) ? 'big' : (b.id || b.className)));
    const big = order.findIndex(c => /\bbig\b/.test(c));
    assert.strictEqual(order[big + 1], 'helpBtn');
    // a new adult game starts with the mode on, and the log says so
    await adultGame(page);
    const r = await page.evaluate(() => ({ on: S.rel.on, act: relActive(), log: S.rel.log.map(x => x.to), tabs: allTabs().map(t => t[2]) }));
    assert.deepStrictEqual(r.log, ['on']); assert.ok(r.on && r.act); assert.ok(r.tabs.includes('Romance'));
    noErrors(errors);
  } },
  { name: 'off by default: no Romance tab, no actions, no events and no words of it in an adult game', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await adultGame(page);
    let r = await page.evaluate(() => ({ on: S.rel.on, act: relActive(), tabs: allTabs().map(t => t[0]), love: actionsHere().filter(a => a.cat === 'love').length }));
    assert.deepStrictEqual(r, { on: false, act: false, tabs: ['act', 'week', 'hood', 'todo', 'log'], love: 0 });
    assert.deepStrictEqual(await relEventsOpen(page), []);
    const txt = await screenText(page);
    assert.doesNotMatch(txt, REL_TEXT);
    // the start page setting on, but this device never confirmed 18+: still off
    await page.evaluate(() => setPref('adult18', true));
    await adultGame(page);
    r = await page.evaluate(() => { S.rel.on = true; return { act: relActive(), tabs: allTabs().map(t => t[0]).includes('rel') }; });
    assert.deepStrictEqual(r, { act: false, tabs: false });
    // a whole Quick play game, mode off: nothing of it in the end screen either
    const end = await page.evaluate(() => { S.rel.on = false; lifeFF(); return document.body.innerText; });
    assert.doesNotMatch(end, REL_TEXT); assert.doesNotMatch(end, /18\+ mode/);
    noErrors(errors);
  } },
  { name: 'Growing Up: never any of it, even with the mode on (and even if a save is tampered with)', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await adultsOn(page);
    await growGame(page);
    let r = await page.evaluate(() => ({ grow: isGrow(), age: S.age, on: S.rel.on, wait: S.rel.auto18, act: relActive(), tabs: allTabs().map(t => t[0]).includes('rel'), love: actionsHere().filter(a => a.cat === 'love').length }));
    assert.deepStrictEqual(r, { grow: true, age: 12, on: false, wait: true, act: false, tabs: false, love: 0 });
    let txt = await screenText(page);
    assert.doesNotMatch(txt, REL_TEXT);
    // tampered: the flag on in a kid's save changes nothing
    r = await page.evaluate(() => { S.rel.on = true; render(); return { act: relActive(), tabs: allTabs().map(t => t[0]).includes('rel'), elig: relIds().filter(relEligible), pool: ['link', 'party', 'market', 'dome', 'work', 'app'].map(relPool).flat() }; });
    assert.deepStrictEqual(r, { act: false, tabs: false, elig: [], pool: [] });
    assert.deepStrictEqual(await relEventsOpen(page), []);
    txt = await screenText(page);
    assert.doesNotMatch(txt, REL_TEXT);
    // a whole week of Growing Up with a bot: no feature event ever fires
    const fired = await page.evaluate(() => { lifeFF(); return S.ev.history.filter(h => /^rel_/.test(h.id)).length + document.body.innerText.match(/Romance|Tacoma Hearts/g)?.length || 0; });
    assert.strictEqual(fired, 0);
    noErrors(errors);
  } },
  { name: 'under 18: switching on is deferred to 18 (or a new adult save), and the save gets nothing until then', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await page.evaluate(() => setPref('age18', true));
    await growGame(page, 'life', 15);
    await page.evaluate(() => gameOptionsModal());
    assert.match(await sheetText(page), /18\+ mode: Off/);
    await sheetBtn(page, /18\+ mode/);
    let t = await sheetText(page);
    assert.match(t, /You’re 15 in this save/); assert.match(t, /Turn on automatically at 18/); assert.match(t, /Start a new adult save/);
    await sheetBtn(page, /Turn on automatically at 18/);
    let r = await page.evaluate(() => ({ on: S.rel.on, wait: S.rel.auto18, act: relActive(), log: S.rel.log.map(x => x.to) }));
    assert.deepStrictEqual(r, { on: false, wait: true, act: false, log: ['auto18'] });
    // play on to 18: graduation, your own place, and then it turns on (never before)
    r = await page.evaluate(() => { closeModals(); const seen = []; let guard = 0;
      while (isGrow() && guard++ < 40) { lifeFF(1); seen.push(relActive()); }
      lifeFF(1); return { grow: isGrow(), age: S.age, on: S.rel.on, act: relActive(), early: seen.slice(0, -1).some(Boolean), log: S.rel.log.map(x => x.to + '@' + x.age) }; });
    assert.strictEqual(r.grow, false); assert.ok(r.age >= 18); assert.strictEqual(r.early, false, 'not while growing up');
    assert.ok(r.on && r.act, 'on in the adult chapter'); assert.match(r.log.join(' '), /on@1[89]/);
    // a Quick play Growing Up game can never reach 18: the automatic option is grayed out; a new adult save goes to another slot
    await growGame(page);
    await page.evaluate(() => gameOptionsModal()); await sheetBtn(page, /18\+ mode/);
    const dis = await page.$$eval('#mbg .modal > button.act', bs => bs.filter(b => /automatically/.test(b.textContent)).map(b => b.disabled));
    assert.deepStrictEqual(dis, [true]);
    await sheetBtn(page, /Start a new adult save/);
    for (let i = 0; i < 3 && await page.$('#mbg'); i++) await page.evaluate(() => MBTN(0));   // the difficulty, then the job
    r = await page.evaluate(() => ({ grow: isGrow(), age: S.age, act: relActive(), slot: curSlot() }));
    assert.deepStrictEqual(r, { grow: false, age: 18, act: true, slot: 2 });
    noErrors(errors);
  } },
  { name: 'everyone is an adult with their age on the profile; Growing Up friends join only when both of you are 18+', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await adultsOn(page); await adultGame(page);
    const r = await page.evaluate(() => {
      const ages = REL_PEOPLE.map(p => p.age), prof = REL_PEOPLE.map(p => relProfile(p.id)).join('\n');
      const out = { min: Math.min(...ages), max: Math.max(...ages), n: REL_PEOPLE.length, everyAge: REL_PEOPLE.every(p => relProfile(p.id).includes(`${p.n}, ${p.age}</b>`)), prof };
      // not met in Growing Up: never in the pool
      out.unknown = relEligible('marcus');
      S.kids = { marcus: { met: true, f: 12 }, ana: { met: true, f: 9 } };
      S.age = 17; out.at17 = { act: relActive(), m: relEligible('marcus'), pool: relPool('party').filter(x => x === 'marcus').length };
      S.age = 18; out.at18 = { act: relActive(), m: relEligible('marcus'), age: relAge('marcus'), pool: relPool('party').includes('marcus'), prof: relProfile('marcus') };
      out.adultsOnly = relIds().filter(relEligible).every(id => relAge(id) >= 18);
      return out; });
    assert.ok(r.n >= 8 && r.n <= 12, 'between 8 and 12 people'); assert.ok(r.min >= 21 && r.max <= 45, 'ages 21–45');
    assert.ok(r.everyAge, 'the age is on every profile');
    assert.strictEqual(r.unknown, false);
    assert.deepStrictEqual(r.at17, { act: false, m: false, pool: 0 });
    assert.strictEqual(r.at18.act, true); assert.strictEqual(r.at18.m, true); assert.strictEqual(r.at18.age, 18); assert.ok(r.at18.pool); assert.match(r.at18.prof, /Marcus, 18/);
    assert.ok(r.adultsOnly);
    assert.doesNotMatch(r.prof, EXPLICIT);
    noErrors(errors);
  } },
  { name: 'the dating app: a profile in three questions, then a match or two a week (and no reply happens)', fn: async ctx => {
    const { page, errors } = await open(ctx, { seed: 7 });
    await adultsOn(page); await adultGame(page);
    await page.evaluate(() => { S.loc = 'home'; render(); });
    const acts = await page.evaluate(() => actionsHere().filter(a => a.cat === 'love').map(a => a.l));
    assert.ok(acts.includes('Open the dating app'));
    await page.evaluate(() => { const i = ACTS.length; render(); const b = [...document.querySelectorAll('#app .content button.act')].find(x => /dating app/.test(x.textContent)); b.click(); });
    assert.match(await sheetText(page), /Interested in/);
    await sheetBtn(page, /Everyone/); await sheetBtn(page, /See where it goes/); await sheetBtn(page, /Shows and records/);
    let t = await sheetText(page);
    assert.match(t, /new match(es)? this week/); assert.match(t, /21 or older/);
    const n = (t.match(/💬 Message/g) || []).length; assert.ok(n >= 1 && n <= 2, 'a match or two: ' + n);
    await page.setViewportSize({ width: 400, height: 820 }); await page.waitForTimeout(500); await page.screenshot({ path: '/tmp/rel-app.png' }).catch(() => {});
    // the same week: the same matches; a new week: new ones
    const w = await page.evaluate(() => { const a = S.rel.app.matches.slice(); closeModals(); relApp(); const b = S.rel.app.matches.slice(); closeModals(); S.cur += 7; S.t += 7 * 1440; relApp(); return { same: JSON.stringify(a) === JSON.stringify(b), next: S.rel.app.matches.filter(x => !a.includes(x)).length }; });
    assert.ok(w.same); assert.ok(w.next >= 1);
    // a message that gets no spark: gracefully, and they're out of the matches
    const r = await page.evaluate(() => { const id = S.rel.app.matches[0], r0 = Math.random; Math.random = () => 0; try { closeModals(); relApp(); } finally {}
      MBTN(0); MBTN(0); Math.random = r0; return { id, st: S.rel.people[id].stage, txt: document.getElementById('mbg').innerText, left: S.rel.app.matches.includes(id) }; });
    assert.strictEqual(r.st, 'passed'); assert.match(r.txt, /No reply|don’t feel a spark/); assert.strictEqual(r.left, false);
    noErrors(errors);
  } },
  { name: 'meet → text → dates (tones, costs, time) → exclusive → meet the friends → move in, through the screens', fn: async ctx => {
    const { page, errors } = await open(ctx, { seed: 3 });
    await adultsOn(page); await adultGame(page);
    // meet Jordan on the Link (the event's choice), with a spark
    let r = await page.evaluate(() => { closeModals(); S.loc = 'link'; S.t = S.cur * 1440 + 720; chain('rel_meet_link'); const r0 = Math.random; Math.random = () => 0.99;
      S.rel.pm = {}; fireHook('arrive', { at: 'link', from: 'home' }); Math.random = r0;
      const p = pendingList().find(x => x.id === 'rel_meet_link'); return { pending: !!p, who: S.rel.pm.rel_meet_link }; });
    assert.ok(r.pending, 'a decision: someone on the Link');
    await page.evaluate(() => openChoice('rel_meet_link'));
    assert.match(await sheetText(page), /Say hi to/);
    await page.evaluate(() => { const r0 = Math.random; Math.random = () => 0.99; try { MBTN(0); } finally { Math.random = r0; } });
    const who = r.who;
    r = await page.evaluate(id => ({ st: S.rel.people[id].stage, int: S.rel.people[id].int }), who);
    assert.strictEqual(r.st, 'talking');
    // the Romance tab lists them, with meters and an age
    await page.evaluate(() => { closeModals(); setTab('rel'); });
    const tabTxt = await page.textContent('#app .content');
    assert.match(tabTxt, /Relationships/); assert.match(tabTxt, /Interest/); assert.match(tabTxt, /Chemistry/);
    assert.match(tabTxt, new RegExp(await page.evaluate(id => relDef(id).n + ', ' + relAge(id), who)));
    // text them: three tones
    await page.evaluate(id => { S.rel.people[id].int = 70; S.rel.people[id].chem = 70; relText(id); }, who);
    const tl = (await sheetLabels(page)).slice(0, 3); ['Playful', 'Sincere', 'Bold'].forEach((t, i) => assert.ok(tl[i].includes(t), tl.join(' | ')));
    await sheetBtn(page, /Playful/); await sheetBtn(page, /OK/);
    // a date in Wright Park at noon: time passes and you end up there
    const t0 = await page.evaluate(() => { S.loc = 'home'; S.t = S.cur * 1440 + 720; S.energy = 90; S.money = 900; return S.t; });
    await page.evaluate(id => { closeModals(); setTab('rel'); const b = [...document.querySelectorAll('#app .content button.act')].find(x => /Ask .* out/.test(x.textContent)); b.click(); }, who);
    const where = await sheetText(page);
    for (const s of ['Tacos at the truck lot', 'A movie at the Starlite in Proctor', 'Owen Beach at sunset', 'The Museum of Glass', 'A walk in Wright Park']) assert.ok(where.includes(s), s);
    await page.evaluate(() => { window.__r0 = Math.random; Math.random = () => 0.01; });
    await sheetBtn(page, /Wright Park/);
    await page.evaluate(() => { Math.random = window.__r0; });
    assert.match(await sheetText(page), /How do you play it/);
    await page.setViewportSize({ width: 400, height: 820 }); await page.waitForTimeout(500); await page.screenshot({ path: '/tmp/rel-date.png' }).catch(() => {});
    await sheetBtn(page, /Sincere/);
    assert.match(await sheetText(page), /How does the night end/);
    await sheetBtn(page, /Say good night/); await sheetBtn(page, /OK/);
    r = await page.evaluate(id => ({ st: S.rel.people[id].stage, dates: S.rel.people[id].dates, loc: S.loc, t: S.t }), who);
    assert.strictEqual(r.st, 'dating'); assert.strictEqual(r.dates, 1); assert.strictEqual(r.loc, 'st_park'); assert.ok(r.t - t0 >= 60, 'the date took time');
    // a movie costs money; a second date
    r = await page.evaluate(id => { closeModals(); S.loc = 'home'; S.t = S.cur * 1440 + 1080; const m0 = S.money, r0 = Math.random; Math.random = () => 0.01; relAskOut(id);
      const bs = [...document.querySelectorAll('#mbg .modal > button.act')]; MBTN(bs.findIndex(b => /Starlite/.test(b.textContent))); Math.random = r0; MBTN(0); MBTN(0); MBTN(0); return { spent: m0 - S.money, dates: S.rel.people[id].dates }; }, who);
    assert.ok(r.spent >= 20, 'the movie cost money: ' + r.spent); assert.strictEqual(r.dates, 2);
    // the talk: exclusive (they say yes when it's mutual)
    await page.evaluate(id => { closeModals(); S.rel.people[id].int = 90; relTalk(id); }, who);
    await sheetBtn(page, /Ask to be exclusive/);
    assert.match(await sheetText(page), /It’s official/); await sheetBtn(page, /OK/);
    r = await page.evaluate(() => ({ p: S.rel.partner, st: S.rel.people[S.rel.partner].stage }));
    assert.strictEqual(r.p, who); assert.strictEqual(r.st, 'exclusive');
    // meet the friends, then move in after a week: rent is split
    r = await page.evaluate(id => { closeModals(); S.loc = 'home'; S.t = S.cur * 1440 + 1000; render(); setTab('rel');
      const click = re => { const b = [...document.querySelectorAll('#app .content button.act')].find(x => re.test(x.textContent)); if (!b) throw new Error('no ' + re + ' in ' + document.querySelector('#app .content').innerText); b.click(); };
      click(/friends/); const friends = S.rel.people[id].friends;
      S.rel.people[id].excl = day() - 8; S.rel.people[id].int = 85; S.t = S.cur * 1440 + 900; render(); setTab('rel');
      const rent0 = S.rent.amt; click(/move in/); return { friends, livein: S.rel.livein, rent0, rent: S.rent.amt, moment: S.life.moments.map(m => m.t).join(' | ') }; }, who);
    assert.ok(r.friends); assert.ok(r.livein); assert.strictEqual(r.rent, r.rent0 - Math.round(r.rent0 / 2)); assert.match(r.moment, /Moved in with/);
    await page.evaluate(() => { closeModals(); clearTiles(); pendingList().splice(0); setTab('rel'); window.scrollTo(0, 0); }); await page.setViewportSize({ width: 400, height: 820 }); await page.waitForTimeout(300);
    await page.screenshot({ path: '/tmp/rel-tab.png' }).catch(() => {});
    const tab2 = await page.textContent('#app .content');
    assert.match(tab2, /Your partner · Exclusive · living together/); assert.match(tab2, /Split the chores/);
    noErrors(errors);
  } },
  { name: 'rejection and consent: a no is taken gracefully, can’t be pushed, and twice is friends', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await adultsOn(page); await adultGame(page);
    let r = await page.evaluate(() => { closeModals(); S.loc = 'home'; S.t = S.cur * 1440 + 720; relMeet('sam', 'link'); const st = S.rel.people.sam; st.stage = 'talking'; st.int = 5; st.chem = 5;
      const r0 = Math.random; Math.random = () => 0.99; relAskOut('sam'); const bs = [...document.querySelectorAll('#mbg .modal > button.act')]; MBTN(bs.findIndex(b => /Wright Park/.test(b.textContent))); Math.random = r0;
      return { txt: document.getElementById('mbg').innerText, btns: [...document.querySelectorAll('#mbg .modal > button.act')].map(b => b.textContent), no: st.no, until: st.noUntil - day(), stage: st.stage }; });
    assert.match(r.txt, /No means no/); assert.deepStrictEqual(r.btns, ['OK']); assert.strictEqual(r.no, 1); assert.ok(r.until >= 3); assert.strictEqual(r.stage, 'talking');
    // the ask is grayed out on the tab until then
    r = await page.evaluate(() => { closeModals(); setTab('rel'); const b = [...document.querySelectorAll('#app .content button.act')].find(x => /Ask Sam out/.test(x.textContent)); return { dis: b.disabled, s: b.textContent }; });
    assert.ok(r.dis); assert.match(r.s, /said no/);
    // a second no: friends, and no more asking
    r = await page.evaluate(() => { closeModals(); const st = S.rel.people.sam; st.noUntil = -1; const r0 = Math.random; Math.random = () => 0.99; relAsk('sam', 'park'); Math.random = r0; const t = document.getElementById('mbg').innerText;
      closeModals(); setTab('rel'); return { t, stage: st.stage, ask: [...document.querySelectorAll('#app .content button.act')].some(x => /Ask Sam out/.test(x.textContent)) }; });
    assert.strictEqual(r.stage, 'friends'); assert.match(r.t, /Friends\?/); assert.strictEqual(r.ask, false);
    // an invitation back can be declined, gracefully, with no way to push
    r = await page.evaluate(() => { closeModals(); relMeet('kai', 'link'); const st = S.rel.people.kai; st.stage = 'dating'; st.dates = 1; st.int = 50; st.chem = 0;
      const r0 = Math.random; Math.random = () => 0; relInvite('kai'); Math.random = r0; return { t: document.getElementById('mbg').innerText, btns: [...document.querySelectorAll('#mbg .modal > button.act')].map(b => b.textContent), nights: st.nights }; });
    assert.match(r.t, /Not tonight/); assert.deepStrictEqual(r.btns, ['OK']); assert.strictEqual(r.nights, 0);
    // exclusive can be a no too
    r = await page.evaluate(() => { closeModals(); const st = S.rel.people.kai; st.int = 40; relTalk('kai'); const bs = [...document.querySelectorAll('#mbg .modal > button.act')]; MBTN(bs.findIndex(b => /exclusive/.test(b.textContent)));
      return { t: document.getElementById('mbg').innerText, p: S.rel.partner }; });
    assert.match(r.t, /not ready for exclusive/); assert.strictEqual(r.p, null);
    // no pressure options anywhere in the feature
    assert.doesNotMatch(STRINGS, PRESSURE);
    noErrors(errors);
  } },
  { name: 'a hookup is a choice: consent, protection, one sentence and a fade to black, then a morning-after line', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await adultsOn(page); await adultGame(page);
    let r = await page.evaluate(() => { closeModals(); S.loc = 'home'; S.t = S.cur * 1440 + 1200; relMeet('dani', 'dome'); const st = S.rel.people.dani; st.stage = 'dating'; st.dates = 1; st.int = 90; st.chem = 90;
      const r0 = Math.random; Math.random = () => 0.5; relInvite('dani'); const t1 = document.getElementById('mbg').innerText, b1 = [...document.querySelectorAll('#mbg .modal > button.act')].map(b => b.textContent);
      MBTN(0); Math.random = r0; const t2 = document.getElementById('mbg').innerText; return { t1, b1, t2, stage: st.stage, nights: st.nights, morning: S.rel.morning.slice() }; });
    assert.match(r.t1, /says yes/); assert.match(r.b1.join('|'), /Talk about protection first/);
    assert.match(r.t2, /fade|⋯/); assert.strictEqual((r.t2.replace(/Good night|OK/g, '').match(/[.!?](\s|$)/g) || []).length <= 1, true, 'one sentence: ' + r.t2);
    assert.strictEqual(r.nights, 1); assert.strictEqual(r.stage, 'casual'); assert.strictEqual(r.morning.length, 1);
    assert.doesNotMatch(r.t2, EXPLICIT);
    // the morning after shows at breakfast
    const m = await page.evaluate(() => { closeModals(); endDay('home'); return document.getElementById('mbg').innerText; });
    assert.match(m, /The morning after/);
    noErrors(errors);
  } },
  { name: 'consequences: cheating found out, a breakup with moving out and a sad week, a pregnancy scare at the clinic, a partner’s big news', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await adultsOn(page); await adultGame(page);
    // set up: living with Rashad, then a date with Mei
    let r = await page.evaluate(() => { closeModals(); relMeet('rashad', 'market'); relMeet('mei', 'market'); const a = S.rel.people.rashad, b = S.rel.people.mei;
      Object.assign(a, { stage: 'exclusive', int: 80, excl: 0, friends: true, dates: 4 }); Object.assign(b, { stage: 'talking', int: 90, chem: 80 }); S.rel.partner = 'rashad';
      S.rel.livein = true; S.rel.liveinD = 0; S.rel.split = 575; S.rent.amt = 575;
      S.loc = 'home'; S.t = S.cur * 1440 + 720; S.energy = 90; relAskOut('mei'); const warn = document.getElementById('mbg').innerText;
      const r0 = Math.random; Math.random = () => 0.01; const bs = [...document.querySelectorAll('#mbg .modal > button.act')]; MBTN(bs.findIndex(x => /Wright Park/.test(x.textContent))); MBTN(0); MBTN(0); MBTN(0); Math.random = r0;
      return { warn, cheat: S.rel.cheat }; });
    assert.match(r.warn, /would be cheating/); assert.deepStrictEqual([r.cheat.who, r.cheat.p], ['mei', 'rashad']);
    // found out the next morning
    r = await page.evaluate(() => { closeModals(); S.cur++; S.t = S.cur * 1440 + 420; const s0 = S.stress; chain('rel_caught'); fireHook('wake', {});
      const p = pendingList().find(x => x.id === 'rel_caught'); if (!p) return { p: false }; openChoice('rel_caught'); const t = document.getElementById('mbg').innerText;
      const bs = [...document.querySelectorAll('#mbg .modal > button.act')]; MBTN(bs.findIndex(x => /truth/.test(x.textContent))); return { p: true, t, int: S.rel.people.rashad.int, stress: S.stress - s0, cheat: S.rel.cheat }; });
    assert.ok(r.p); assert.match(r.t, /saw the messages/); assert.strictEqual(r.int, 45); assert.ok(r.stress >= 10); assert.strictEqual(r.cheat, null);
    // a breakup: one of you moves out, rent goes back up, then a sad week of mornings
    r = await page.evaluate(() => { closeModals(); relBreakup('rashad', 'you'); const o = { livein: S.rel.livein, rent: S.rent.amt, partner: S.rel.partner, stage: S.rel.people.rashad.stage, sad: S.rel.sadUntil - day() };
      const s0 = S.stress; S.t = S.cur * 1440 + 1300; endDay('home'); o.morning = document.getElementById('mbg').innerText; return o; });
    assert.deepStrictEqual([r.livein, r.rent, r.partner, r.stage, r.sad], [false, 1150, null, 'ex', 7]);
    assert.match(r.morning, /💔/);
    // a pregnancy scare: urgent, handled at the clinic
    r = await page.evaluate(() => { closeModals(); S.rel.scare = { who: 'mei', d: day() }; chain('rel_scare'); fireHook('wake', {}); const t = document.getElementById('mbg') ? document.getElementById('mbg').innerText : '';
      const bs = [...document.querySelectorAll('#mbg .modal > button.act')]; MBTN(bs.findIndex(x => /clinic/.test(x.textContent))); return { t, scare: S.rel.scare, careful: S.rel.careful, narr: uiNarr.join(' ') }; });
    assert.match(r.t, /pregnancy scare/); assert.strictEqual(r.scare, null); assert.ok(r.careful); assert.match(r.narr, /negative/);
    // a partner's big news: long distance
    r = await page.evaluate(() => { closeModals(); const a = S.rel.people.mei; Object.assign(a, { stage: 'exclusive', excl: day() - 20, int: 80 }); S.rel.partner = 'mei'; S.rel.plans = { raise: 1, place: 1 };
      chain('rel_plans'); fireHook('wake', {}); openChoice('rel_plans'); const t = document.getElementById('mbg').innerText; const bs = [...document.querySelectorAll('#mbg .modal > button.act')];
      MBTN(bs.findIndex(x => /long distance/.test(x.textContent))); return { t, ld: S.rel.ld }; });
    assert.match(r.t, /Spokane/); assert.ok(r.ld >= 0);
    noErrors(errors);
  } },
  { name: 'switching off hides everything and pauses (doesn’t end) relationships; the log shows on the end screen', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await page.evaluate(() => setPref('age18', true));
    await adultGame(page);
    // ⚙️ Settings → 🎮 Game options → 🔞 18+ mode
    await page.evaluate(() => openSettings()); await sheetBtn(page, /Game options/);
    assert.match(await sheetText(page), /18\+ mode: Off/);
    await sheetBtn(page, /18\+ mode/);
    assert.match(await sheetText(page), /18\+ mode: On/);
    let r = await page.evaluate(() => ({ act: relActive(), narr: uiNarr.join(' '), log: S.rel.log.length }));
    assert.ok(r.act); assert.match(r.narr, /18\+ mode is on in this save/); assert.strictEqual(r.log, 1);
    // a partner and a pending meeting, then off
    r = await page.evaluate(() => { closeModals(); relMeet('leilani', 'link'); Object.assign(S.rel.people.leilani, { stage: 'exclusive', excl: 0, int: 70 }); S.rel.partner = 'leilani';
      S.loc = 'link'; S.rel.pm = {}; chain('rel_meet_link'); fireHook('arrive', { at: 'link' }); const pend = pendingList().filter(p => /^rel_/.test(p.id)).length;
      gameOptionsModal(); const bs = [...document.querySelectorAll('#mbg .modal > button.act')]; MBTN(bs.findIndex(b => /18\+ mode/.test(b.textContent))); closeModals();
      S.loc = 'home'; render(); return { pend, after: pendingList().filter(p => /^rel_/.test(p.id)).length, act: relActive(), tabs: allTabs().map(t => t[0]).includes('rel'), love: actionsHere().filter(a => a.cat === 'love').length, kept: S.rel.people.leilani.stage, partner: S.rel.partner }; });
    assert.strictEqual(r.pend, 1); assert.deepStrictEqual([r.after, r.act, r.tabs, r.love, r.kept, r.partner], [0, false, false, 0, 'exclusive', 'leilani']);
    assert.deepStrictEqual(await relEventsOpen(page), []);
    const txt = await screenText(page);
    assert.doesNotMatch(txt, REL_TEXT);
    // nights don't wear it down while paused
    r = await page.evaluate(() => { const i0 = S.rel.people.leilani.int; for (let k = 0; k < 3; k++) { closeModals(); endDay('home'); } closeModals(); return { i0, i1: S.rel.people.leilani.int }; });
    assert.strictEqual(r.i1, r.i0);
    // back on: everything is where you left it
    r = await page.evaluate(() => { gameOptionsModal(); const bs = [...document.querySelectorAll('#mbg .modal > button.act')]; MBTN(bs.findIndex(b => /18\+ mode/.test(b.textContent))); closeModals();
      return { act: relActive(), p: relPartner(), log: S.rel.log.map(x => x.to) }; });
    assert.deepStrictEqual(r, { act: true, p: 'leilani', log: ['on', 'off', 'on'] });
    const end = await page.evaluate(() => { lifeFF(); return document.querySelector('.end').innerText; });
    assert.match(end, /18\+ mode/); assert.match(end, /switched 3×/);
    noErrors(errors);
  } },
  { name: 'longer games: time skips carry a relationship on, a wedding, and kids in Lifetime (the Parent note)', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await adultsOn(page); await adultGame(page, 'life');
    const r = await page.evaluate(() => { closeModals(); relMeet('yesenia', 'market'); Object.assign(S.rel.people.yesenia, { stage: 'married', excl: 0, int: 90, friends: true, family: true }); S.rel.partner = 'yesenia';
      S.rel.livein = true; S.rel.liveinD = 0; S.age = 26; S.rel.kidsPlan = 0; S.rel.married = { d: 0, age: 26, where: 'courthouse' };
      lifeFF(2); return { kids: S.rel.kids, stages: S.life.stages.map(s => s.stage), p: relPartner(), moments: S.life.moments.map(m => m.t).join(' | ') }; });
    assert.strictEqual(r.p, 'yesenia');
    assert.strictEqual(r.kids, 1); assert.ok(r.stages.includes('👶 Parent'));
    // the wedding sheet: the Seymour Conservatory or the courthouse
    const w = await page.evaluate(() => { closeModals(); relMeet('theo', 'market'); Object.assign(S.rel.people.theo, { stage: 'engaged' }); S.rel.engaged = day() - 10; S.money = 5000; relWedding('theo'); return document.getElementById('mbg').innerText; });
    assert.match(w, /Seymour Conservatory/); assert.match(w, /courthouse/);
    noErrors(errors);
  } },
  { name: 'word check: nothing explicit, no slurs or degrading labels, in the whole feature', fn: async ctx => {
    assert.doesNotMatch(STRINGS, EXPLICIT, 'explicit words');
    assert.doesNotMatch(STRINGS, SLURS, 'slurs');
    // intimacy is one line and a fade to black
    const fade = STRINGS.split('\n').filter(s => /⋯/.test(s));
    assert.strictEqual(fade.length, 1); assert.ok(fade[0].length < 160);
    const { page, errors } = await open(ctx);
    // the profiles, as shown
    const prof = await page.evaluate(() => { setPref('age18', true); setMode('adult'); newGame('normal'); closeModals(); S.rel.on = true; S.kids = Object.fromEntries(KIDS.map(k => [k.id, { met: true, f: 10 }])); return relIds().map(id => relProfile(id)).join('\n'); });
    assert.doesNotMatch(prof, EXPLICIT); assert.doesNotMatch(prof, SLURS);
    noErrors(errors);
  } },
  { name: 'Quick play with 18+ mode on: a random bot plays the two weeks, taps the Romance tab, no page errors; saves keep it', fn: async ctx => {
    const { page, errors } = await open(ctx, { seed: 99 });
    await adultsOn(page); await adultGame(page);
    await page.evaluate(() => { relMeet('jordan', 'link'); S.rel.people.jordan.stage = 'talking'; S.rel.people.jordan.int = 60; });
    let st = { steps: 0, done: false };
    while (!st.done && st.steps < 2500) {
      st = await page.evaluate(st => {
        const skip = /exit|transfer|settings|change name|save slots|delete|new game|play again|best scores|back to title|finish here|End things/i, ok = b => !b.disabled && !skip.test(b.textContent), pick = a => a[Math.floor(Math.random() * a.length)];
        for (let i = 0; i < 100 && !st.done; i++, st.steps++) {
          if (document.querySelector('.end') || !S || S.over) { st.done = true; break; }
          S.standing = Math.max(S.standing, 40); S.stress = Math.min(S.stress, 60); if (S.money < 1400) S.money = 1400;
          const cross = document.querySelector('.cross'); if (cross) { cross.click(); continue; }
          const m = document.getElementById('mbg');
          if (m) { const bs = [...m.querySelectorAll('.modal > button.act')], any = bs.map((b, k) => k).filter(k => ok(bs[k])); if (any.length) MBTN(pick(any)); else m.remove(); continue; }
          if (Math.random() < 0.08) { setTab(pick(['act', 'rel', 'rel', 'week'])); }
          if (Math.random() < 0.03) { endDay('home'); continue; }
          const bs = [...document.querySelectorAll('#app .content button.act, #app .content button.chip')].filter(ok);
          if (!bs.length) { setTab('act'); endDay('home'); continue; }
          pick(bs).click();
        }
        return st;
      }, st);
    }
    noErrors(errors);
    const r = await page.evaluate(() => ({ people: Object.keys(S.rel.people).length, over: S.over }));
    assert.ok(r.people >= 1);
    // a save in progress keeps S.rel; an old save without it gets a blank one
    await adultGame(page);
    const s = await page.evaluate(() => { relMeet('amara', 'work'); saveGame(); const d = loadSave(); const old = JSON.parse(JSON.stringify(packSave())); delete old.S.rel; const m = migrate(old);
      return { kept: !!d.S.rel.people.amara, filled: !!m.S.rel && m.S.rel.on === false && Array.isArray(m.S.rel.log) }; });
    assert.deepStrictEqual(s, { kept: true, filled: true });
    await reload(page); await page.click('.title button.big'); await page.waitForSelector('.hud');
    assert.ok(await page.evaluate(() => relActive() && !!S.rel.people.amara && allTabs().some(t => t[0] === 'rel')));
    noErrors(errors);
  } },
  { name: '18+ mode: the guide gets an "18+ mode" chapter only when the mode is on, never in Growing Up', fn: async ctx => {
    const { page, errors } = await open(ctx);
    const HC = `(typeof withMode==='function'?withMode('adult',helpChapters):helpChapters())`;
    const ids = () => page.evaluate(hc => eval(hc).map(c => c[0]), HC);
    // off by default, on the start page
    assert.ok(!(await ids()).includes('adult18'), 'hidden by default');
    // age check alone is not enough: the mode has to be on
    await page.evaluate(() => setPref('age18', true));
    assert.ok(!(await ids()).includes('adult18'), 'hidden until the mode is turned on');
    await adultsOn(page);
    const on = await ids();
    assert.ok(on.includes('adult18'), 'shown on the start page with the mode on');
    assert.strictEqual(on.indexOf('adult18'), on.indexOf('faq') - 1, 'sits just before the FAQ');
    // its content comes from the code
    const t = await page.evaluate(() => { helpModal(); const el = document.getElementById('tut-adult18'); const x = el ? el.innerText : ''; closeModals && closeModals(); return x; });
    for (const s of ['18+ mode', 'Turning it on and off', 'Consent is part of the game', 'fade to black', 'Romance tab', 'Seymour Conservatory'])
      assert.ok(t.includes(s), 'mentions ' + s);
    const d = await page.evaluate(() => Object.values(REL_DATES).map(x => x.n));
    for (const n of d) assert.ok(t.includes(n), 'lists the date ' + n);
    assert.doesNotMatch(t, EXPLICIT);
    // in a Growing Up game: never, even with the mode on
    const grow = await page.evaluate(() => { setMode('grow'); newGame('normal'); closeModals(); S.rel = S.rel || relBlank(); S.rel.on = true; return withMode('adult',helpChapters).map(c => c[0]); });
    assert.ok(!grow.includes('adult18'), 'not in Growing Up');
    // in an adult game: only while the mode is on in that save
    const adult = await page.evaluate(() => { setMode('adult'); newGame('normal'); closeModals(); const a = withMode('adult',helpChapters).map(c => c[0]).includes('adult18'); relSetOn(false, 'test'); const b = withMode('adult',helpChapters).map(c => c[0]).includes('adult18'); return [a, b]; });
    assert.deepStrictEqual(adult, [true, false], 'shown with the mode on in the save, hidden once it is off');
    noErrors(errors);
  } },
];
