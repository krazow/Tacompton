const { open, newGame, noErrors, assert } = require('./helpers');

const BAD = /\b(fish\w*|salmon|marina|charter|wdfw|chinook|coho|herring|date|dating|romance|romantic|kiss\w*|flirt\w*|girlfriend|boyfriend|crush)\b/i;
// id -> [kind, place, minute of day]
const EVENTS = {
  proctor_peaches: ['social', 'pr_market', 600], proctor_movie_night: ['social', 'pr_main', 1100], proctor_garage_sale: ['social', 'pr_main', 600], proctor_lemonade: ['social', 'pr_main', 700],
  ruston_eagle: ['ambient', 'ru_park', 600], ruston_seal: ['ambient', 'ru_beach', 600], ruston_dog: ['social', 'ru_park', 600], ruston_concert: ['social', 'ru_park', 1100],
  so_bread_6am: ['social', 'so_a', 360], so_night_market: ['social', 'so_a', 1100], so_lion_dance: ['ambient', 'so_a', 1050], so_pickup_kids: ['social', 'so_c', 600], so_friday_lights: ['ambient', 'so_b', 1200],
  stadium_picnic: ['social', 'st_park', 700], stadium_plantsale: ['chain', 'st_park', 700], stadium_jade_grows: ['chain', 'home', 420], stadium_band: ['ambient', 'st_castle', 960], stadium_wedding: ['social', 'st_castle', 700],
  westend_fog: ['ambient', 'we_view', 480], westend_wind: ['setback', 'we_view', 700], westend_openhouse: ['chain', 'we_tcc', 700], westend_advisor: ['chain', 'we_tcc', 700], westend_carshow: ['social', 'we_shops', 700],
};

module.exports = [
  { name: 'hood events B: every converted event offers 2-3 real options with different effects and clean text', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await newGame(page);
    const r = await page.evaluate(EV_TABLE => {
      closeModals(); const out = []; const snapKey = () => [S.stress, S.energy, S.community, Math.round(S.money), S.food, S.t].join('|');
      for (const [id, [kind, place, m]] of Object.entries(EV_TABLE)) {
        const e = EV.find(x => x.id === id);
        if (!e) { out.push({ id, missing: true }); continue; }
        const base = JSON.stringify(S), res = { id, kind, n: 0, distinct: 0, text: '', err: '' };
        const setup = () => { S = JSON.parse(base); S.money = 2000; S.loc = place; S.t = day() * 1440 + m;
          for (let k = 0; k < 14; k++) { try { if (e.cond({ at: place, hook: e.hook })) break; } catch (x) {} S.cur++; S.t += 1440; } S.stress = 50; S.energy = 50; S.community = 20;
          if (id === 'stadium_jade_grows') setEventFlag('stadium_jade', day()); if (id === 'westend_advisor') setEventFlag('westend_advisor', day()); };
        try {
          setup(); res.cond = e.cond ? !!e.cond({ at: place, hook: e.hook }) : true;
          const opts = e.choices(); res.n = opts.length; res.dflt = e.dflt;
          const seen = new Set();
          for (let i = 0; i < opts.length; i++) {
            setup(); const o = e.choices()[i]; res.text += ' ' + o.l + ' ' + o.s + ' ' + e.tile[1];
            if (o.dis) { res.err += 'option ' + i + ' disabled with plenty of money; '; continue; }
            const before = snapKey(); o.fn(); const after = snapKey(); if (before === after && !/Nothing changes/.test(o.s) && !(kind === 'ambient' && /Keep going/.test(o.l))) res.err += 'option ' + i + ' did nothing; ';
            seen.add(after); closeModals();
          }
          res.distinct = seen.size;
          if (kind === 'ambient') { setup(); res.ambientLast = e.choices().length === 2 && e.dflt === 1; }
        } catch (er) { res.err += er.message; }
        out.push(res);
      }
      return out;
    }, EVENTS);
    for (const x of r) {
      assert.ok(!x.missing, x.id + ' exists');
      assert.ok(x.cond !== false, x.id + ' cond holds in its place');
      assert.ok(!x.err, x.id + ': ' + x.err);
      assert.ok(x.n >= 2 && x.n <= 3, x.id + ' has 2-3 options, got ' + x.n);
      assert.ok(x.distinct >= 2, x.id + ' options differ in effect');
      assert.ok(typeof x.dflt === 'number' && x.dflt >= 0 && x.dflt < x.n, x.id + ' has a valid dflt');
      assert.ok(!BAD.test(x.text), x.id + ' text clean: ' + (x.text.match(BAD) || [''])[0]);
      if (x.kind === 'ambient') assert.ok(x.ambientLast, x.id + ' ambient defaults to Keep going');
    }
    assert.strictEqual(r.length, 23, 'covers all events');
    noErrors(errors);
  } },
  { name: 'hood events B: the plant sale and class signup set flags that their follow-ups read', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await newGame(page);
    const r = await page.evaluate(() => {
      closeModals(); S.money = 2000; S.loc = 'st_park';
      EV.find(x => x.id === 'stadium_plantsale').choices()[0].fn(); const jade = EV.find(x => x.id === 'stadium_jade_grows');
      const same = jade.cond({ at: 'home', hook: 'wake' }); S.cur++; S.t += 1440; const next = jade.cond({ at: 'home', hook: 'wake' });
      S.loc = 'we_tcc'; EV.find(x => x.id === 'westend_openhouse').choices()[0].fn(); const adv = EV.find(x => x.id === 'westend_advisor');
      S.t = day() * 1440 + 700; const advSame = adv.cond({ at: 'we_tcc', hook: 'arrive' }); S.cur++; S.t += 1440; const advNext = adv.cond({ at: 'we_tcc', hook: 'arrive' });
      return { same, next, advSame, advNext };
    });
    assert.ok(!r.same && r.next, 'the jade plant follow-up waits for the next day');
    assert.ok(!r.advSame && r.advNext, 'the advisor follow-up waits for the next day');
    noErrors(errors);
  } },
];
