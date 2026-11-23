const { ID, open, reload, noErrors, assert } = require('./helpers');

// Systems and polish (src/js/70-polish.js, 71-polish-audio.js): the memory book, lifetime achievements, read-aloud, sound and music.
async function start(page, { length = '1y', age = 18 } = {}) {
  await page.evaluate(([length, age]) => {
    closeModals(); setMode(age < 18 ? 'grow' : 'adult');
    LIFE_PICK = { length, startAge: age, birthday: { m: 3, d: 14, label: 'March 14' } };
    newGame('normal'); closeModals(); if (!isGrow() && !S.jobPicked) { pickJob('cafe'); closeModals(); } tab = 'act'; render(); closeModals();
  }, [length, age]);
}
// stubs that record what the page asks for: an AudioContext and speechSynthesis
function stubs() {
  window.AC_LOG = { made: 0, closed: 0, osc: 0, started: 0 };
  const node = () => ({ connect: n => n || node(), disconnect() {}, gain: { value: 1, setValueAtTime() {}, exponentialRampToValueAtTime() {}, setTargetAtTime() {} }, frequency: { value: 0, setValueAtTime() {}, exponentialRampToValueAtTime() {} }, type: '', start() { AC_LOG.started++; }, stop() {}, buffer: null });
  class FakeAC {
    constructor() { AC_LOG.made++; this.state = 'running'; this.currentTime = 0; this.sampleRate = 8000; this.destination = node(); }
    createOscillator() { AC_LOG.osc++; return node(); } createGain() { return node(); } createBiquadFilter() { return node(); } createBufferSource() { return node(); }
    createBuffer(c, n) { return { getChannelData: () => new Float32Array(n) }; }
    resume() { return Promise.resolve(); } suspend() { return Promise.resolve(); } close() { AC_LOG.closed++; this.state = 'closed'; return Promise.resolve(); }
  }
  window.AudioContext = FakeAC; window.webkitAudioContext = FakeAC;
  window.SAID = [];
  window.SpeechSynthesisUtterance = function (t) { this.text = t; };
  const ss = { speak: u => SAID.push(u), cancel() {}, getVoices: () => [{ name: 'Local A', lang: 'en-US', localService: true }, { name: 'Local B', lang: 'en-GB', localService: true }, { name: 'Cloud', lang: 'en-US', localService: false }] };
  Object.defineProperty(window, 'speechSynthesis', { value: ss, configurable: true });
}

module.exports = [
  { name: 'the memory book collects moments, photos, birthdays and places, by year, and survives a save and reload', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page);
    const r = await page.evaluate(() => {
      lifeMoment('💼', 'Promoted to shift lead at the café.');
      PHONE_LIFE.photoSave('🏔️', 'The mountain out over the Narrows', S.loc);
      lifeBirthday(19, true); closeModals();
      S.hoods = S.hoods || {}; S.hoods[Object.keys(HOODS)[0]] = day() + 1;
      render(); saveGame();
      return { n: S.mbook.items.length, kinds: [...new Set(S.mbook.items.map(x => x.k))].sort() };
    });
    assert.ok(r.n >= 5, 'items: ' + r.n);
    assert.deepStrictEqual(r.kinds, ['bday', 'moment', 'photo', 'place']);
    // the Week tab has the button; the book opens with years and the photo's caption
    await page.evaluate(() => { tab = 'week'; render(); });
    await page.click('.mb-open');
    await page.waitForSelector('#mbg .mb-year');
    const t = await page.textContent('#mbg');
    for (const s of ['Memory book', 'Promoted to shift lead', 'The mountain out over the Narrows', 'Turned 19', 'First time in', 'Moved into your own apartment']) assert.ok(t.includes(s), 'shows ' + s);
    assert.match(t, /20\d\d · age 1[89]/);
    await page.evaluate(() => closeModals());
    await reload(page);
    await page.click('text=Continue as T');
    await page.waitForSelector('.hud');
    const r2 = await page.evaluate(() => ({ n: S.mbook.items.length, cap: S.mbook.items.some(x => x.k === 'photo' && /Narrows/.test(x.t)) }));
    assert.strictEqual(r2.n, r.n); assert.ok(r2.cap);
    // the last screen has the book too
    await page.evaluate(() => { closeModals(); lifeToScore(); });
    await page.waitForSelector('#memBtn');
    noErrors(errors);
  } },
  { name: 'an older save without a book starts it from the life moments and photos', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page);
    const r = await page.evaluate(() => { const m = S.life.moments.length; delete S.mbook; S.ph = S.ph || {}; S.ph.photos = [{ d: 0, t: 600, at: 'home', pl: 'Home', ic: '📷', cap: 'An old photo', age: 18 }];
      return { m, n: POLISH.MBK().items.length, photo: S.mbook.items.some(x => x.t === 'An old photo') }; });
    assert.strictEqual(r.n, r.m + 1); assert.ok(r.photo);
    noErrors(errors);
  } },
  { name: 'lifetime achievements unlock, persist across games for the profile, and are listed in Settings and Best scores', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page);
    const r = await page.evaluate(() => {
      S.car = Object.assign(S.car || {}, { own: 'civic' }); S.life.graduated = true; S.startYear = 1990; S.mbook.vol = {}; for (let i = 0; i < 50; i++) S.mbook.vol[i] = 1;
      render(); return Object.keys(POLISH.lachGot()).sort();
    });
    for (const id of ['firstcar', 'graduated', 'volunteer', 'decades']) assert.ok(r.includes(id), 'unlocked ' + id + ': ' + r);
    assert.ok(!r.includes('eighty'));
    // a new game: they're still there; another name doesn't have them
    await reload(page);
    await start(page, { length: '6m' });
    const r2 = await page.evaluate(() => ({ got: Object.keys(POLISH.lachGot()), key: POLISH.lachKey(), raw: localStorage.getItem(POLISH.lachKey()) }));
    assert.ok(r2.got.includes('firstcar') && r2.got.includes('graduated'));
    assert.ok(r2.key.includes('lifeach.t'));
    await page.evaluate(() => { closeModals(); openSettings(); });
    await page.waitForSelector('#mbg');
    assert.match(await page.textContent('#mbg'), /🌟 Lifetime achievements \(\d+\/1\d\)/);
    await page.evaluate(() => { closeModals(); bestScoresModal(); });
    const bs = await page.textContent('#mbg');
    assert.ok(bs.includes('Lifetime achievements') && bs.includes('First Car') && bs.includes('Three Decades'));
    await page.evaluate(() => closeModals());
    const other = await page.evaluate(id => { localStorage.setItem(id + '.name', 'Someone Else'); return Object.keys(POLISH.lachGot()).length; }, ID);
    assert.strictEqual(other, 0, 'per profile');
    noErrors(errors);
  } },
  { name: 'read aloud: off by default; on, it reads pop-ups with a local voice, the 🔊 button reads again, and nothing before a tap', fn: async ctx => {
    await ctx.context.addInitScript(stubs);
    const { page, errors } = await open(ctx);
    await start(page);
    let r = await page.evaluate(() => { modal('Test pop-up', '<p>Hello from Hilltop.</p>', [{ l: 'OK', fn: () => {} }]); return { said: SAID.length, btn: !!document.querySelector('#mbg .ra-btn'), ra: prefs().ra }; });
    assert.deepStrictEqual(r, { said: 0, btn: false, ra: false });
    await page.evaluate(() => { closeModals(); setPref('ra', true); modal('Before a tap', '<p>Quiet.</p>', [{ l: 'OK', fn: () => {} }]); });
    await page.waitForTimeout(200);
    assert.strictEqual(await page.evaluate(() => SAID.length), 0, 'no speech before a gesture');
    await page.click('#mbg button.act');   // a gesture
    await page.evaluate(() => { closeModals(); modal('☀️ Morning report', '<p>☀️ The rain stopped on MLK.</p>', [{ l: 'Wake up', fn: () => {} }]); });
    await page.waitForTimeout(250);
    r = await page.evaluate(() => ({ said: SAID.map(u => u.text), voice: SAID.length && SAID[SAID.length - 1].voice.name, btn: !!document.querySelector('#mbg .ra-btn') }));
    assert.ok(r.said.some(t => t.includes('Morning report') && t.includes('The rain stopped on MLK') && !/☀/.test(t)), JSON.stringify(r.said));
    assert.strictEqual(r.voice, 'Local A'); assert.ok(r.btn);
    const n = r.said.length;
    await page.click('#mbg .ra-btn');   // still reading: the first tap stops it
    assert.strictEqual(await page.evaluate(() => SAID.length), n, 'a tap while reading stops it');
    await page.click('#mbg .ra-btn');
    assert.strictEqual(await page.evaluate(() => SAID.length), n + 1, '🔊 reads it again');
    // the Accessibility sheet has the option, with voice and speed (local voices only)
    await page.evaluate(() => { closeModals(); raModal(() => {}); });
    const t = await page.textContent('#mbg');
    assert.ok(t.includes('Read aloud: On') && t.includes('Voice: Local A') && t.includes('2 on this device') && t.includes('Speed: 1×'));
    noErrors(errors);
  } },
  { name: 'sound and music: no AudioContext before a tap; music on makes one and plays, off stops it; settings rows', fn: async ctx => {
    await ctx.context.addInitScript(stubs);
    const { page, errors } = await open(ctx);
    await start(page);
    let r = await page.evaluate(() => { setPref('sound', true); sfx('good'); sfx('money'); setPref('music', true); POLISH_AUDIO.musicSync(); return { ...AC_LOG, on: POLISH_AUDIO.MUS.on, def: PREF_DEF.music }; });
    assert.strictEqual(r.made, 0, 'nothing made before a gesture'); assert.strictEqual(r.started, 0); assert.strictEqual(r.on, false); assert.strictEqual(r.def, false, 'music off by default');
    await page.evaluate(() => { setPref('music', false); setPref('sound', false); closeModals(); soundModal(() => {}); });
    let t = await page.textContent('#mbg');
    assert.ok(t.includes('Sound effects: Off') && t.includes('Music: Off') && t.includes('Music volume: 50%'));
    await page.click('#mbg button.act:has-text("Music: Off")');   // the tap is the gesture, and turns music on
    await page.waitForTimeout(100);
    r = await page.evaluate(() => ({ ...AC_LOG, on: POLISH_AUDIO.MUS.on, pref: prefs().music }));
    assert.strictEqual(r.made, 1); assert.ok(r.on && r.pref); assert.ok(r.started > 0, 'notes play');
    await page.click('#mbg button.act:has-text("Music: On")');
    await page.waitForTimeout(100);
    r = await page.evaluate(() => ({ ...AC_LOG, on: POLISH_AUDIO.MUS.on }));
    assert.strictEqual(r.on, false); assert.strictEqual(r.closed, 1, 'with sound effects off too, the AudioContext is closed');
    // effects: money and the Link bell play through the context once sound is on
    r = await page.evaluate(() => { closeModals(); setPref('sound', true); const s0 = AC_LOG.started; sfx('bell'); sfx('money'); const s1 = AC_LOG.started; setPref('rm', true); sfx('tap'); sfx('rain'); return { s0, s1, s2: AC_LOG.started }; });
    assert.ok(r.s1 > r.s0, 'effects play'); assert.strictEqual(r.s2, r.s1, 'taps and rain stay quiet with Reduce motion');
    await page.evaluate(() => { closeModals(); openSettings(); });
    t = await page.textContent('#mbg');
    assert.ok(t.includes('Sound and music') && t.includes('Read aloud: Off'));
    noErrors(errors);
  } },
  { name: 'the guide: the Settings chapter covers the new options', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await page.click('#helpBtn');
    await page.waitForSelector('#tut');
    const t = await page.evaluate(() => document.getElementById('tut-settings').innerText);
    for (const s of ['Sound and music', 'Read aloud', 'Memory book', 'Lifetime achievements', 'works offline']) assert.ok(t.includes(s), 'mentions ' + s);
    assert.doesNotMatch(t, /\b(romance|dat(e|es|ing)|fish\w*)\b/i);
    noErrors(errors);
  } },
];
