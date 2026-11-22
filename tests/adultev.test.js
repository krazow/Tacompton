// The adult game's 38 random events (21-story.js) each offer a choice: every option runs, the options differ, chains remember.
const { open, newGame, noErrors, assert } = require('./helpers');

const IDS = ['mountain_out', 'heat_wave', 'fair_morning', 'internet_bill', 'power_bill', 'priya_hall', 'church_choir', 'link_bell', 'link_musician',
  'link_delay', 'summer_shower', 'lorraine_porch', 'neighbor_bbq', 'bbq_leftovers', 'mural_painting', 'mural_done', 'free_fridge', 'corner_name',
  'jaylen_questions', 'ice_cream', 'block_party', 'bookstore', 'pho', 'santos_next_door', 'denise_elevator', 'malik_desk', 'eli_newcomer',
  'new_building', 'block_club', 'lost_dog', 'dog_found', 'power_blip', 'loud_night', 'medevac', 'hospital_thanks', 'cafe_regular', 'kitchen_rush', 'coworker_cover'];
const AMBIENT = ['mountain_out', 'link_bell', 'medevac'];
const ROMANCE = /\b(romance|romantic|crush\w*|dating|on a date|boyfriends?|girlfriends?|sweethearts?|kiss\w*|flirt\w*|sexy?|sexual)\b/i;
const FISHING = /\b(fish\w*|salmon|marina|charter|wdfw|chinook|coho|herring)\b/i;

// In the page: for one event, set a calm mid-day state, run it, then press every option from the same starting point.
function tryAll(ids) {
  closeModals();
  const out = {};
  for (const id of ids) {
    const e = EV.find(x => x.id === id);
    if (!e) { out[id] = { missing: true }; continue; }
    const snap = JSON.stringify(S);
    const prep = () => { S = JSON.parse(snap); S.t = day() * 1440 + 600; S.money = 600; S.food = 3; S.energy = 50; S.stress = 50; S.community = 40; S.standing = 70; S.job = id === 'hospital_thanks' ? 'hospital' : id === 'cafe_regular' ? 'cafe' : id === 'kitchen_rush' ? 'kitchen' : S.job; };
    prep(); const n0 = uiNarr.length; let text = '';
    try { e.run && e.run({ hook: e.hook, at: 'mlk', where: 'home', notes: [] }); } catch (err) { out[id] = { err: 'run: ' + err.message }; S = JSON.parse(snap); continue; }
    const opts = e.choices ? e.choices() : [];
    text += uiNarr.slice(n0).join(' ') + ' ' + opts.map(o => o.l + ' ' + (o.s || '')).join(' ');
    const sigs = [], errs = [];
    for (let i = 0; i < opts.length; i++) {
      prep(); try { e.run && e.run({ hook: e.hook, at: 'mlk', where: 'home', notes: [] }); } catch (_) {}
      const o = e.choices()[i], m = uiNarr.length, f0 = JSON.stringify(S.ev.flags || {}), force0 = S.ev.force.join();
      try { o.fn(); } catch (err) { errs.push(o.l + ': ' + err.message); }
      text += ' ' + uiNarr.slice(m).join(' ');
      sigs.push([S.money, S.energy, S.stress, S.community, S.standing, S.food, S.t, JSON.stringify(S.ev.flags || {}) !== f0 ? JSON.stringify(S.ev.flags) : '', S.ev.force.join() !== force0 ? S.ev.force.join() : ''].join('|'));
    }
    out[id] = { n: opts.length, dflt: e.dflt, urgent: !!e.urgent, sigs, errs, text };
    S = JSON.parse(snap);
  }
  return out;
}

module.exports = [
  { name: 'adult events: all 38 offer 2–3 options, every option runs, and no two options do the same thing', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await newGame(page);
    const r = await page.evaluate(`(${tryAll})(${JSON.stringify(IDS)})`);
    for (const id of IDS) {
      const x = r[id];
      assert.ok(x && !x.missing, id + ' exists'); assert.ok(!x.err, id + ': ' + x.err);
      assert.ok(x.n >= 2 && x.n <= 3, `${id} has 2–3 options (${x.n})`);
      assert.ok(Number.isInteger(x.dflt) && x.dflt >= 0 && x.dflt < x.n, id + ' has a valid default');
      assert.deepStrictEqual(x.errs, [], id + ' options threw');
      assert.strictEqual(new Set(x.sigs).size, x.sigs.length, `${id}: two options have the same effect\n${x.sigs.join('\n')}`);
    }
    for (const id of AMBIENT) assert.strictEqual(r[id].n, 2, id + ' is a stop-and-watch moment');
    for (const id of ['internet_bill', 'link_delay', 'kitchen_rush']) assert.ok(r[id].urgent, id + ' asks at once');
    noErrors(errors);
  } },
  { name: 'adult events: no romance or fishing words in any event, option or outcome', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await newGame(page);
    const r = await page.evaluate(`(${tryAll})(${JSON.stringify(IDS)})`);
    const all = IDS.map(id => r[id].text || '').join(' ');
    assert.ok(all.length > 5000, 'collected the text');
    assert.ok(!ROMANCE.test(all), 'romance word: ' + (all.match(ROMANCE) || [])[0]);
    assert.ok(!FISHING.test(all), 'fishing word: ' + (all.match(FISHING) || [])[0]);
    noErrors(errors);
  } },
  { name: 'adult events: chains remember the choice (mural, Biscuit, Ron’s leftovers, the block club)', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await newGame(page);
    const r = await page.evaluate(() => {
      closeModals(); S.t = day() * 1440 + 600; S.money = 600; S.food = 3;
      const ev = id => EV.find(x => x.id === id), last = () => uiNarr[uiNarr.length - 1] || '';
      const out = {};
      ev('mural_painting').run({}); ev('mural_painting').choices()[0].fn();
      out.muralForced = S.ev.force.includes('mural_done'); ev('mural_done').run({}); out.mural = last();
      ev('lost_dog').run({}); ev('lost_dog').choices()[0].fn(); out.dogForced = S.ev.force.includes('dog_found');
      ev('dog_found').run({}); out.dog = last();
      ev('lost_dog').choices()[2].fn(); out.dogPassFlag = eventFlag('dog');
      ev('neighbor_bbq').run({}); const f0 = S.food; ev('neighbor_bbq').choices()[0].fn();
      out.bbqForced = S.ev.force.includes('bbq_leftovers'); ev('bbq_leftovers').choices()[1].fn(); out.bbqFood = S.food - f0;
      ev('new_building').choices()[1].fn(); out.clubChance = ev('block_club').chance(); ev('block_club').run({}); out.club = last();
      return out;
    });
    assert.ok(r.muralForced && /Yours/.test(r.mural), 'your patch of sky is in the finished mural');
    assert.ok(r.dogForced && /walking the alleys/.test(r.dog), 'the Biscuit text remembers you searched');
    assert.strictEqual(r.dogPassFlag, 'watch');
    assert.ok(r.bbqForced && r.bbqFood === 2, 'staying at Ron’s means two saved meals');
    assert.ok(r.clubChance > 0.6 && /your name is on it/.test(r.club), 'the block club remembers the clinic sign-up');
    noErrors(errors);
  } },
  { name: 'adult events: forced through the hook, a choice event waits for a decision and the default resolves it', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await newGame(page);
    const r = await page.evaluate(() => {
      closeModals(); S.t = day() * 1440 + 600; S.money = 600;
      forceEvent('lost_dog'); fireHook('arrive', { at: 'mlk', from: 'home' });
      const pend = (S.ev.pending || []).map(p => p.id), count = S.ev.count.lost_dog || 0;
      openChoice('lost_dog'); const sheet = choiceBtn();
      choiceApply('lost_dog', 0, 'pick'); const picked = eventFlag('dog'), searchForced = S.ev.force.includes('dog_found');
      closeModals(); S.cur = 3; S.t = 3 * 1440 + 600;
      forceEvent('new_building'); fireHook('arrive', { at: 'mlk', from: 'home' });
      const pend2 = (S.ev.pending || []).map(p => p.id); choiceNight([]);
      return { pend, count, sheet, picked, searchForced, pend2, left: (S.ev.pending || []).length, nb: eventFlag('new_building') };
    });
    assert.strictEqual(r.count, 1, 'the event fired');
    assert.ok(r.pend.includes('lost_dog'), 'a decision is pending');
    assert.strictEqual(r.sheet, 1, 'the sheet defaults to sharing the poster');
    assert.ok(r.picked === 'searched' && r.searchForced, 'picking "help look" sets up Biscuit coming home');
    assert.ok(r.pend2.includes('new_building') && r.left === 0 && r.nb === 'walked', 'at night the default (keep walking) is applied');
    noErrors(errors);
  } },
];
