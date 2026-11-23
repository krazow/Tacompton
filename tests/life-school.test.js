const { open, noErrors, assert } = require('./helpers');

// Life in Tacoma (src/js/67-life-school.js, 68-life-friends.js): subjects, homework by subject, teachers, clubs and teams,
// getting to school, report cards and freedoms, the track at 15, best friends, drifting, family stories, trust.
// Friendship, family and school only: nothing romantic, and no fishing words.
const BAD = /\b(romance|romantic|crush\w*|dat(e|es|ing)|boyfriends?|girlfriends?|kiss\w*|flirt\w*|sexy?|sexual|couples?)\b/i;
const BAD_FISH = /\b(fish\w*|salmon|marina|charters?|chinook|coho|herring)\b/i;

async function setup(page) {
  await page.evaluate(() => {
    window.T = {
      start(len, age) { SCH_SNOW = 0; if (typeof wxOf === 'function' && !T.wx0) { T.wx0 = wxOf; wxOf = d => 'gray'; } closeModals(); setMode(age < 18 ? 'grow' : 'adult'); LIFE_PICK = { length: len, startAge: age, birthday: { m: 3, d: 14, label: 'March 14' } }; newGame('normal'); render(); closeModals(); },
      M() { const m = document.getElementById('mbg'); return m ? m.innerText : ''; },
      act(re) { return actionsHere().find(a => re.test(a.l)); },
      narr() { return uiNarr.join('\n'); },
      // to the next school day at home, in the morning
      school() { let g = 0; while ((!isSchoolDay() || schSnow(day())) && g++ < 30) { closeModals(); endDay('home'); } closeModals(); S.loc = 'home'; S.t = day() * 1440 + 420; S.energy = 80; S.mood = 70; },
    };
  });
}

module.exports = [
  { name: 'subjects feed Grades: homework asks which subject, a teacher teaches the day’s class, office hours and the Reading Room', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await setup(page);
    const r = await page.evaluate(() => {
      T.start('1y', 12); lifeFF(1); closeModals(); T.school();
      const o = { subj: Object.keys(S.ls.subj) };
      S.grades = 70; for (const k in S.ls.subj) S.ls.subj[k] = 70;
      uiNarr = []; T.act(/^Go to school$/).fn(); closeModals();
      o.teacher = /(Math|English|Science|History|Art & PE): /.test(T.narr());
      const g0 = S.grades; lsSubj('sci', 5); o.feed = S.grades - g0;
      o.board = !!T.act(/clubs and teams board/); const oh = T.act(/Office hours/); o.oh = !!oh;
      const m0 = S.ls.subj.eng; oh.fn(); o.ohM = T.M(); MBTN(1); o.ohD = S.ls.subj.eng - m0;
      S.loc = 'home'; const hw = T.act(/^Do your homework$/); o.hwS = hw.s;
      const g1 = S.grades, mt = S.ls.subj.math; hw.fn(); o.hwM = T.M(); MBTN(0); o.hw = [S.grades - g1, S.ls.subj.math - mt];
      S.loc = 'library'; S.t = day() * 1440 + 1000; const st = T.act(/Study a subject/); o.lib = !!st;
      const h0 = S.ls.subj.his; st.fn(); MBTN(3); o.libD = S.ls.subj.his - h0;
      o.week = GROW.weekView();
      return o;
    });
    assert.deepStrictEqual(r.subj, ['math', 'eng', 'sci', 'his', 'art']);
    assert.ok(r.teacher, 'a teacher line for the day’s class');
    assert.strictEqual(r.feed, 1, 'a subject +5 moves Grades +1');
    assert.ok(r.board && r.oh, 'the clubs board and office hours at school after class');
    assert.match(r.ohM, /Ms\. Delgado/); assert.match(r.ohM, /Mr\. Haugen/); assert.ok(r.ohD >= 4);
    assert.match(r.hwS, /Pick a subject/); assert.match(r.hwM, /which subject/i);
    assert.deepStrictEqual(r.hw, [3, 5], 'homework: Grades +3 and Math +5');
    assert.ok(r.lib); assert.ok(r.libD >= 6);
    assert.match(r.week, /Your classes at Summit View/);
    noErrors(errors);
  } },
  { name: 'clubs and teams: join at the board, practice on set days after school, and a season moment after four', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await setup(page);
    const r = await page.evaluate(() => {
      T.start('1y', 12); lifeFF(1); closeModals();
      const o = { clubs: Object.keys(LS_CLUBS) };
      // to a Tuesday (robotics meets Tue and Thu)
      let g = 0; while (!(isSchoolDay() && dateOf(day()).dow === 1) && g++ < 30) { closeModals(); endDay('home'); } closeModals(); T.school();
      T.act(/^Go to school$/).fn(); closeModals();
      T.act(/clubs and teams board/).fn(); o.boardM = T.M(); MBTN(1); o.club = S.ls.club;
      const p = T.act(/robotics club meeting/); o.p = p && { cls: p.cls, dis: p.dis };
      S.ls.meet[schY(day())] = 3; p.fn(); o.moment = T.M(); MBTN(0);
      o.cm = !!S.ls.cm[schY(day())]; o.again = !!T.act(/robotics club meeting/);
      o.moments = S.life.moments.map(m => m.t).join(' | ');
      return o;
    });
    assert.deepStrictEqual(r.clubs, ['hoops', 'robotics', 'band', 'art', 'drama', 'paper']);
    for (const w of ['Basketball', 'Robotics', 'Band', 'Art club', 'Drama', 'school paper']) assert.match(r.boardM, new RegExp(w));
    assert.strictEqual(r.club, 'robotics');
    assert.ok(r.p, 'a meeting today'); assert.strictEqual(r.p.cls, 'primary'); assert.ok(!r.p.dis);
    assert.match(r.moment, /regional competition/i); assert.ok(r.cm); assert.ok(!r.again, 'once a day');
    assert.match(r.moments, /Joined robotics club/); assert.match(r.moments, /regional competition/);
    noErrors(errors);
  } },
  { name: 'getting to school: walk, bus or the Link (only with the T Line), and a route gets faster after three trips', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await setup(page);
    const r = await page.evaluate(() => {
      T.start('1y', 12); lifeFF(1); closeModals(); T.school();
      const o = { walk: travelMins('home', 'school') };
      const sw = T.act(/^Getting to school/); o.sw = sw && sw.l; sw.fn(); o.mode = S.ls.mode; o.bus = travelMins('home', 'school');
      T.act(/^Getting to school/).fn(); o.mode2 = S.ls.mode; o.link = travelMins('home', 'school');
      S.ls.trips.link = 2; uiNarr = []; T.act(/^Go to school$/).fn(); closeModals(); o.learned = /You know which car/.test(T.narr()); o.link2 = travelMins('home', 'school');
      const eh = eraHas; eraHas = f => f === 'tline' ? false : eh(f); o.modes = lsModes(); o.fallback = lsMode(); eraHas = eh;
      return o;
    });
    assert.match(r.sw, /walk/); assert.strictEqual(r.mode, 'bus'); assert.strictEqual(r.bus, 10);
    assert.strictEqual(r.mode2, 'link'); assert.strictEqual(r.link, 8);
    assert.ok(r.learned); assert.strictEqual(r.link2, 6);
    assert.deepStrictEqual(r.modes, ['walk', 'bus']); assert.strictEqual(r.fallback, 'walk');
    noErrors(errors);
  } },
  { name: 'report cards: late January and the last day; a good card earns a freedom, a bad one a talk at dinner', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await setup(page);
    const r = await page.evaluate(() => {
      T.start('1y', 12); lifeFF(1); closeModals();
      const o = { days: lsCardsIn(0, 400).map(x => dateOf(x.d).label) };
      const c0 = gCurfew(); S.grades = 90; for (const k in S.ls.subj) S.ls.subj[k] = 90; const f0 = S.family;
      lsCard({ k: 'x-1', d: day(), t: 'winter' }, true); o.good = T.M(); MBTN(0);
      o.df = S.family - f0; o.free = Object.keys(S.ls.free); o.curfew = gCurfew() - c0;
      S.grades = 50; for (const k in S.ls.subj) S.ls.subj[k] = 50;
      lsCard({ k: 'x-2', d: day(), t: 'spring' }, true); o.bad = T.M(); MBTN(0); o.talk = T.M(); MBTN(0);
      // a second good card: going downtown on your own, before 14
      S.grades = 92; for (const k in S.ls.subj) S.ls.subj[k] = 92; lsCard({ k: 'x-3', d: day(), t: 'spring' }, true); closeModals();
      o.downtown = lsFree('downtown'); o.week = GROW.weekView();
      // in a time skip: a note
      const notes = []; S.grades = 85; lsCard({ k: 'x-4', d: day(), t: 'winter' }, false, notes); o.note = notes.join(' ');
      return o;
    });
    assert.deepStrictEqual(r.days, ['Thu Jan 28', 'Tue Jun 15']);
    assert.match(r.good, /report card/); assert.match(r.good, /Math/); assert.match(r.good, /later curfew/i);
    assert.strictEqual(r.df, 6); assert.deepStrictEqual(r.free, ['curfew']); assert.strictEqual(r.curfew, 30);
    assert.match(r.bad, /talk at dinner/i); assert.match(r.talk, /A talk at dinner/); assert.match(r.talk, /Own it/);
    assert.ok(r.downtown); assert.match(r.week, /Freedoms: a later curfew, going downtown/);
    assert.match(r.note, /report card/);
    noErrors(errors);
  } },
  { name: 'a track at 15 (arts, sports, career, college prep) changes the choice at 18', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await setup(page);
    const r = await page.evaluate(() => {
      T.start('1y', 15); const o = {};
      // the first key week after the start: a note, then the counselor's folders after school
      lifeFF(1, true); closeModals(); o.note = S.log.map(x => x.s).join('\n'); o.none = S.ls.track; T.school(); T.act(/^Go to school$/).fn(); closeModals();
      const c = T.act(/See the counselor/); o.cs = c && c.s; c.fn(); o.folders = T.M(); MBTN(2); o.track = S.ls.track;
      // the choice at 18 with college prep
      S.ls.track = 'prep'; closeModals(); lifePathSheet(() => {}); o.sheet = T.M();
      const m0 = S.money, i = [...document.querySelectorAll('#mbg .modal > button.act')].findIndex(b => /College/.test(b.innerText)); MBTN(i);
      o.mode = S.mode; o.dm = S.money - m0; o.bonus = S.life.trackBonus;
      return o;
    });
    assert.match(r.note, /pick your track/); assert.strictEqual(r.none, null);
    assert.match(r.cs, /pick your track/); assert.match(r.folders, /Your track at Hilltop High/); assert.strictEqual(r.track, 'career');
    assert.match(r.sheet, /College prep/); assert.match(r.sheet, /\$1,500 scholarship/);
    assert.strictEqual(r.mode, 'adult'); assert.ok(r.dm >= 1500, 'scholarship money: ' + r.dm);
    assert.strictEqual(r.bonus.k, 'prep'); assert.strictEqual(r.bonus.path, 'college');
    noErrors(errors);
  } },
  { name: 'a best friend: chosen through play, comes over, a fight, a make-up and a big moment; friends drift and come back', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await setup(page);
    const r = await page.evaluate(() => {
      T.start('2y', 12); lifeFF(1); closeModals(); const o = {};
      gFriend('linh', 14); gFriend('zay', 8);
      lfBeat(); o.bf = S.ls.bf; o.k1 = GROW.kidsView();
      S.t = day() * 1440 + 960; S.loc = 'home'; const ov = T.act(/Linh comes over/); o.over = !!ov; const f0 = gF('linh'); ov.fn(); o.dOver = gF('linh') - f0; o.over2 = !!T.act(/Linh comes over/);
      S.kwi += 2; lfBeat(); o.fight = T.M(); MBTN(0);
      S.kwi += 1; lfBeat(); o.make = T.M(); MBTN(0);
      S.kwi += 1; S.age = 16; lfBeat(); o.big = T.M(); MBTN(0); S.age = 12;
      o.story = GROW.kidsView();
      // drifting in a long skip, back with "see friends more"
      const notes = []; LIFE_HOOKS.skip.forEach(f => f(day(), day() + 40, 'study', notes)); o.drift = notes.join(' '); o.drifted = Object.keys(S.ls.drift);
      const n2 = []; LIFE_HOOKS.skip.forEach(f => f(day(), day() + 40, 'friends', n2)); o.back = n2.join(' ');
      return o;
    });
    assert.strictEqual(r.bf, 'linh'); assert.match(r.k1, /Your best friend/); assert.match(r.k1, /Linh/);
    assert.ok(r.over); assert.strictEqual(r.dOver, 3); assert.ok(!r.over2, 'once a key week');
    assert.match(r.fight, /fight with Linh/); assert.match(r.make, /Making up with Linh/); assert.match(r.big, /summer engineering program/);
    assert.match(r.story, /best friends → a fight → made up/);
    assert.deepStrictEqual(r.drifted, ['zay']); assert.match(r.drift, /less of Zay/); assert.match(r.back, /Zay find each other again/);
    noErrors(errors);
  } },
  { name: 'family stories, dinners and trust: Dad’s new job, Nia, Grandma, and freedoms earned at home', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await setup(page);
    const r = await page.evaluate(() => {
      T.start('2y', 12); lifeFF(1); closeModals(); const o = {};
      o.dad = !!S.ls.fam.dadjob; o.ids = LF_FAM.map(b => b.id);
      // a skip past 16: the stories you were away for, one line each
      S.age = 17; const notes = []; LIFE_HOOKS.skip.forEach(f => f(day(), day() + 10, 'home', notes)); o.notes = notes.join(' '); S.age = 12;
      o.kids = GROW.kidsView();
      // trust: dinners and chores → a freedom
      S.ls.free = {}; S.ls.tf = 0; S.life.tot.chores = 10; S.life.tot.dinners = 8; o.tf = lfTrustFree(); o.free = Object.keys(S.ls.free);
      o.dinner = Array.from({ length: 30 }, () => lfDinner()).join(' ');
      return o;
    });
    assert.ok(r.dad, 'Dad’s new job in the second key week');
    assert.deepStrictEqual(r.ids, ['dadjob', 'niabike', 'grandmavisit', 'momjob', 'niaplay', 'grandmamoves', 'niams', 'grandma80']);
    assert.match(r.notes, /Nia learns to ride a bike/); assert.match(r.notes, /Grandma moves in/); assert.doesNotMatch(r.notes, /Grandma turns eighty/);
    assert.match(r.kids, /Your family/); assert.match(r.kids, /Trust at home/);
    assert.ok(r.tf); assert.deepStrictEqual(r.free, ['curfew']);
    assert.match(r.dinner, /seagull|Nia/);
    noErrors(errors);
  } },
  { name: 'grown-up relationships stay in 37 (every kid is in REL_GROWN, only for adults), and the new text has no dating or fishing words', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await setup(page);
    const r = await page.evaluate(() => {
      T.start('1y', 12); const o = {};
      o.grown = KIDS.every(k => !!REL_GROWN[k.id]); o.active = relActive(); o.elig = relEligible('linh');
      o.text = JSON.stringify([LS_CLUBS, LF_FAM, LS_TRACK, Object.values(LS_CLUBS).map(c => c.m.b())]) + helpGrowing();
      const bf = window.LF_BF || null; o.guide = /Classes and teachers/.test(helpGrowing()) && /Best friends/.test(helpGrowing());
      o.wn = (CHANGELOG['0.4.2'] || []).join(' ');
      return o;
    });
    assert.ok(r.grown); assert.strictEqual(r.active, false); assert.strictEqual(r.elig, false);
    assert.doesNotMatch(r.text, BAD); assert.doesNotMatch(r.text, BAD_FISH);
    assert.ok(r.guide, 'the Growing up chapter has the new sections');
    assert.match(r.wn, /Clubs and teams/); assert.doesNotMatch(r.wn, BAD);
    noErrors(errors);
  } },
  { name: 'a two-year game from 12 and from 15 plays through with clubs, cards, a track and friends, without errors', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await setup(page);
    const r = await page.evaluate(() => {
      const o = {};
      for (const age of [12, 15]) {
        T.start('2y', age); S.ls.club = 'band'; lifeFF();
        o[age] = { over: S.over, cards: Object.keys(S.ls.cards).length, meet: Object.values(S.ls.meet).reduce((a, b) => a + b, 0), track: S.ls.track, fam: Object.keys(S.ls.fam).length };
        closeModals();
      }
      return o;
    });
    for (const a of ['12', '15']) { assert.ok(r[a].cards >= 2, a + ' report cards: ' + JSON.stringify(r[a])); assert.ok(r[a].meet >= 4, a + ' band rehearsals'); assert.ok(r[a].fam >= 1, a + ' family stories'); }
    assert.ok(r['15'].track, 'a track by 17');
    noErrors(errors);
  } },
];
