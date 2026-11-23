const { open, noErrors, assert } = require('./helpers');

// Life in Tacoma (src/js/69-life-community.js): allowance, odd jobs, a first bank account, saving goals, a bike, the yearly days
// (Juneteenth, the block party, the giveaway), Tacoma moments, local heroes, everyday community events, and an adult's garden
// plot, volunteering and mentoring. The longer games only: Quick play is left alone.
const BAD_KID = /\b(romance|romantic|crush\w*|dat(e|es|ing)|boyfriends?|girlfriends?|kiss\w*|flirt\w*|beer|wine|tavern|bar|cocktails?|concerts?)\b/i;
const BAD_FISH = /\b(fish\w*|salmon|marina|charters?|wdfw|chinook|coho|herring)\b/i;

async function start(page, { grow = true, length = '1y', age = 12, year = 2026 } = {}) {
  await page.evaluate(([grow, length, age, year]) => {
    if (typeof SCH_SNOW !== 'undefined') SCH_SNOW = 0;
    closeModals(); setMode(grow ? 'grow' : 'adult');
    LIFE_PICK = length === 'quick' ? null : { length, startAge: age, startYear: year, birthday: { m: 3, d: 14, label: 'March 14' } };
    newGame('normal'); closeModals(); if (!isGrow()) { pickJob('cafe'); closeModals(); } tab = 'act'; render();
    S.wxSet = {};
  }, [grow, length, age, year]);
}
const ev = (page, code) => page.evaluate(`(()=>{${PRE}\n${code}})()`);
// in the page: jump to a day and a time, with that day's weather
const PRE = `window.jump=(y,m,d,t,w)=>{S.cur=dayIndexOf(y,m,d);S.t=S.cur*1440+t;S.wxSet=S.wxSet||{};S.wxSet[S.cur]=w||'sun';closeModals();uiNarr=[]};
  window.acts=()=>actionsHere().filter(Boolean);window.act=re=>acts().find(a=>re.test(a.l));`;

module.exports = [
  { name: 'allowance every Saturday by age (and in the year’s dollars), odd jobs by season, one a day, babysitting at 13, shoveling on snow days', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page);
    const r = await ev(page, `
      const o={};const sat=()=>{let d=gSchoolDay()+1;while(d%7!==5)d++;return d};
      let d=sat();S.cur=d;S.t=d*1440+480;const m0=S.money;lifeMorning(d);o.a12=S.money-m0;o.line=uiNarr.join(' ');
      S.age=16;const m1=S.money;lifeMorning(d+7);S.cur=d+7;o.a16=S.money-m1;const m2=S.money;lifeMorning(d+7);o.twice=S.money-m2;
      S.age=12;S.loc='home';
      jump(2027,5,8,600,'sun');o.may=acts().filter(a=>a.cat==='odd').map(a=>a.l);
      const mow=act(/Mow/);const mm=S.money,t0=S.t;mow.fn();o.mowPay=S.money-mm;o.mowMin=S.t-t0;o.after=acts().filter(a=>a.cat==='odd').every(a=>a.dis);
      jump(2027,5,15,600,'rain');o.rain=acts().filter(a=>a.cat==='odd').map(a=>a.l);
      jump(2027,10,16,600,'gray');o.oct=acts().filter(a=>a.cat==='odd').map(a=>a.l);
      S.age=13;jump(2027,10,19,1000,'gray');o.sit13=acts().filter(a=>a.cat==='odd').map(a=>a.l+' | '+(a.dis?'dis':'ok'));
      jump(2028,1,11,600,'snow');o.snow=acts().filter(a=>a.cat==='odd').map(a=>a.l);o.snowPrimary=act(/Shovel/).cls;
      jump(2028,1,11,600,'snow');o.school=isSchoolDay()?act(/Shovel/).s:'no school';
      o.week=GROW.weekView();return o;`);
    assert.strictEqual(r.a12, 10); assert.match(r.line, /allowance day/); assert.strictEqual(r.a16, 20); assert.strictEqual(r.twice, 0, 'once a Saturday');
    assert.ok(r.may.some(x => /Mow/.test(x)) && r.may.some(x => /Biscuit/.test(x)), r.may.join(' | '));
    assert.ok(!r.may.some(x => /Rake|Shovel|Babysit/.test(x)), 'no leaves in May, no snow, no babysitting at 12');
    assert.strictEqual(r.mowPay, 15); assert.strictEqual(r.mowMin, 60); assert.ok(r.after, 'one odd job a day');
    assert.ok(!r.rain.some(x => /Mow/.test(x)), 'no mowing in the rain');
    assert.ok(r.oct.some(x => /Rake/.test(x)) && !r.oct.some(x => /Mow/.test(x)));
    assert.ok(r.sit13.some(x => /Babysit.*ok/.test(x)), r.sit13.join(' | '));
    assert.ok(r.snow.some(x => /Shovel/.test(x)), 'shoveling on a snow day');
    assert.match(r.week, /Money and goals/); assert.match(r.week, /Odd jobs/); assert.match(r.week, /1 done/);
    // the same allowance in 1980 dollars
    await start(page, { year: 1980 });
    const a80 = await page.evaluate(() => { let d = gSchoolDay() + 1; while (d % 7 !== 5) d++; S.cur = d; const m0 = S.money; lifeMorning(d); return Math.round((S.money - m0) * 100) / 100; });
    assert.ok(a80 > 1 && a80 < 4, '1980: about $2.50, got ' + a80);
    noErrors(errors);
  } },
  { name: 'a youth savings account at the credit union on MLK: open with Mom, deposit, withdraw, a moment, interest in a skip, and it comes along at 18', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page);
    const r = await ev(page, `
      const o={};S.loc='mlk';S.money=40;jump(2026,10,3,600,'gray');
      const op=act(/Open a youth savings account/);o.open=op.s;op.fn();o.bal=CB.S().acct.bal;o.money=S.money;
      o.moment=S.life.moments.some(m=>/first bank account/.test(m.t));
      act(/Deposit \\$20/).fn();o.bal2=CB.S().acct.bal;act(/Take out \\$10/).fn();o.bal3=CB.S().acct.bal;o.money3=S.money;
      jump(2026,10,4,600,'gray');o.sunday=act(/credit union/).dis;
      const notes=[];LIFE_HOOKS.skip.forEach(f=>f(S.cur+1,S.cur+60,'home',notes));o.notes=notes.join(' ');o.int=CB.S().acct.int;
      o.tag=GROW.statusTags().join(' ');
      return o;`);
    assert.match(r.open, /Mom meets you there/); assert.strictEqual(r.bal, 5); assert.strictEqual(r.money, 35); assert.ok(r.moment);
    assert.strictEqual(r.bal2, 25); assert.strictEqual(r.bal3, 15); assert.strictEqual(r.money3, 25);
    assert.ok(r.sunday, 'closed on Sunday'); assert.match(r.notes, /Interest on your savings/); assert.ok(r.int > 0);
    assert.match(r.tag, /savings/);
    // 1990: a passbook
    await start(page, { year: 1990 });
    const pb = await ev(page, `S.loc='mlk';S.money=10;jump(1990,10,6,600,'gray');const a=act(/Open/);a.fn();return a.l+' '+uiNarr.join(' ');`);
    assert.match(pb, /passbook/);
    // at 18 the savings move into Money
    const h = await page.evaluate(() => { const c = CB.S(); c.acct.bal = 100; S.age = 18; const m0 = S.money; lifeHandoff('job', 'cafe', () => {}); closeModals(); return { d: S.money - m0, bal: c.acct.bal, mode: S.mode }; });
    assert.ok(h.d >= 100, 'the savings come along: +' + h.d); assert.strictEqual(h.bal, 0); assert.strictEqual(h.mode, 'adult');
    noErrors(errors);
  } },
  { name: 'saving goals: pick one at home, the Week tab tracks Money + savings, a moment when you reach it, Buy it; and the first paycheck', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page);
    const r = await ev(page, `
      const o={};S.loc='home';jump(2026,10,10,600,'gray');S.money=50;
      act(/Pick a saving goal/).fn();o.modal=document.getElementById('mbg').textContent;
      const btns=[...document.querySelectorAll('#mbg button')];const i=btns.findIndex(b=>/new bike/.test(b.textContent));MBTN(i);closeModals();
      o.goal=CB.S().goal.k;o.price=CB.S().goal.price;o.week=GROW.weekView();o.tracker=act(/Saving for/).l;
      S.money=260;const notes=[];GROW.onNight('home',notes,day());o.notes=notes.join(' ');o.hit=!!CB.S().goal.hit;o.moment=S.life.moments.some(m=>/Saved up for a new bike/.test(m.t));
      const b=act(/Buy it/);o.buy=b.l;const m0=S.money;b.fn();o.spent=m0-S.money;o.bike=CB.S().bike&&CB.S().bike.kind;o.noBikeGoal=!CB.GOALS.bike.ok();
      // the first paycheck: a shift at the market at 16
      S.age=16;S.pt[day()]=true;const n2=[];GROW.onNight('home',n2,day());o.pay=n2.join(' ');o.payMoment=S.life.moments.some(m=>/First paycheck/.test(m.t));
      const n3=[];GROW.onNight('home',n3,day()+1);o.payTwice=n3.join(' ');
      S.age=12;S.loc='home';o.carAt12=Object.values(CB.GOALS).length;act(/Pick a saving goal/).fn();o.m12=document.getElementById('mbg').textContent;closeModals();
      return o;`);
    assert.match(r.modal, /New shoes/); assert.match(r.modal, /new bike/); assert.doesNotMatch(r.modal, /first car/, 'no car goal at 12');
    assert.strictEqual(r.goal, 'bike'); assert.strictEqual(r.price, 250);
    assert.match(r.week, /Saving for a new bike: \$50 of \$250/); assert.match(r.week, /role="meter"/); assert.match(r.tracker, /Saving for a new bike/);
    assert.match(r.notes, /You did it/); assert.ok(r.hit && r.moment);
    assert.match(r.buy, /Buy it: a new bike/); assert.strictEqual(r.spent, 250); assert.strictEqual(r.bike, 'new'); assert.ok(r.noBikeGoal, 'no bike goal once you have one');
    assert.match(r.pay, /first paycheck/i); assert.ok(r.payMoment); assert.doesNotMatch(r.payTwice, /first paycheck/i, 'once');
    noErrors(errors);
  } },
  { name: 'a bike: used or new at the bike shop on MLK, a Ride chip (faster, free, nearby neighborhoods), never in rain or snow, and the lock', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page, { age: 15 });
    const r = await ev(page, `
      const o={};S.loc='mlk';S.money=300;jump(2026,10,10,660,'sun');
      o.shop=acts().filter(a=>/bike shop/.test(a.l)).map(a=>a.l);const m0=S.money;act(/used bike/).fn();o.cost=m0-S.money;o.kind=CB.S().bike.kind;
      o.moment=S.life.moments.some(m=>/bike/.test(m.t));
      S.loc='home';render();const g=document.querySelector('details.go');g.open=true;
      o.chips=[...g.querySelectorAll('.dest')].map(x=>x.textContent);
      o.walk=travelMins('home','peoples');o.ride=CB.bikeMins('home','peoples');o.dt=CB.bikeMins('home','dt_pacific');o.ru=CB.bikeMins('home','ru_park');
      const m1=S.money,t1=S.t;CB.rideGo('dt_pacific');closeModals();o.at=S.loc;o.mins=S.t-t1;o.fare=m1-S.money;o.walkAfter=travelMins('home','dt_pacific');
      S.loc='home';jump(2026,10,11,660,'rain');render();const g2=document.querySelector('details.go');g2.open=true;o.rainChips=g2.innerHTML.includes('🚲 Ride');
      o.rideRain=act(/Ride around/).s;
      jump(2026,10,12,1000,'sun');S.loc='home';const ra=act(/Ride around/);o.rideOk=!ra.dis;ra.fn();o.rideDone=act(/Ride around/).dis;
      // the bike rack (36-life-events.js): no lock, gone; it comes back
      S.loc='library';CB.S().bikeGone=-1;EV.find(x=>x.id==='lev_g_bike').run({at:'library'});o.gone=CB.S().bikeGone>=0;o.noRide=!CB.rideOk();
      EV.find(x=>x.id==='lev_g_bike_back').run({});o.back=CB.S().bikeGone<0;
      window.LEV.S().inv.lock=1;EV.find(x=>x.id==='lev_g_bike').run({at:'library'});o.locked=CB.S().bikeGone<0;
      o.week=GROW.weekView();
      return o;`);
    assert.ok(r.shop.some(x => /used bike.*\$60/.test(x)) && r.shop.some(x => /new bike.*\$250/.test(x)), r.shop.join(' | '));
    assert.strictEqual(r.cost, 60); assert.strictEqual(r.kind, 'used'); assert.ok(r.moment);
    assert.ok(r.chips.some(x => /People’s.*🚲 Ride/.test(x)), 'a Ride chip on Hilltop');
    assert.ok(r.chips.some(x => /Union Station|Pacific/.test(x) && /🚲 Ride/.test(x)), 'downtown by bike');
    assert.ok(r.ride < r.walk, `faster: ${r.ride} < ${r.walk}`); assert.ok(r.dt > 0); assert.strictEqual(r.ru, null, 'not to Point Defiance');
    assert.strictEqual(r.at, 'dt_pacific'); assert.strictEqual(r.mins, r.dt); assert.strictEqual(r.fare, 0); assert.ok(r.walkAfter > r.dt, 'walking time is back after the ride');
    assert.ok(!r.rainChips, 'no riding in the rain'); assert.match(r.rideRain, /Not in this weather/);
    assert.ok(r.rideOk && r.rideDone);
    assert.ok(r.gone && r.noRide && r.back && r.locked);
    assert.match(r.week, /Bike/);
    noErrors(errors);
  } },
  { name: 'every year: Juneteenth (a picnic before 2021, a festival after), the block party and the giveaway, played or in a skip', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page, { grow: false, length: '2y', age: 18 });
    const r = await ev(page, `
      const o={},D=CB.yDays(2027);o.dows=[D.jt,D.bp,D.ga].map(d=>dateOf(d));
      S.cur=D.jt;S.t=S.cur*1440+420;uiNarr=[];lifeMorning(S.cur);o.morn=uiNarr.join(' ');
      S.loc='peoples';S.t=S.cur*1440+720;const j=act(/Juneteenth/);o.jt=j.l;const c0=S.community;j.fn();o.com=S.community-c0;o.txt=uiNarr.join(' ');o.again=!act(/Juneteenth/);
      o.moment=S.life.moments.some(m=>/Juneteenth/.test(m.t));
      S.cur=D.bp;S.t=S.cur*1440+1000;S.loc='home';o.bp=!!act(/block party/);
      S.cur=D.ga;S.t=S.cur*1440+660;S.loc='peoples';o.ga=(act(/backpacks/)||{}).l;
      const notes=[];const D8=CB.yDays(2028);LIFE_HOOKS.skip.forEach(f=>f(D8.jt-3,D8.ga+3,'friends',notes));o.skip=notes.filter(n=>/Juneteenth|block party|giveaway/.test(n));
      o.week=weekView();return o;`);
    for (const x of r.dows) assert.strictEqual(x.dow, 5, 'a Saturday: ' + x.label);
    assert.ok(Math.abs(r.dows[0].d - 19) <= 3 && r.dows[0].m === 6, 'nearest June 19');
    assert.strictEqual(r.dows[1].m, 7); assert.ok(r.dows[1].d >= 15 && r.dows[1].d <= 21, 'third Saturday of July');
    assert.ok(r.dows[2].m === 8 || r.dows[2].m === 9);
    assert.match(r.morn, /Juneteenth/); assert.match(r.morn, /celebration walk/);
    assert.match(r.jt, /celebration/); assert.ok(r.com > 0); assert.ok(r.again, 'once a year'); assert.ok(r.moment);
    assert.ok(r.bp); assert.match(r.ga, /Help hand out backpacks/);
    assert.strictEqual(r.skip.length, 3, r.skip.join(' | ')); assert.match(r.week, /Next on the hill/);
    // before 2021: the picnic in the park
    await start(page, { grow: true, length: '2y', age: 12, year: 1990 });
    const old = await page.evaluate(() => { const D = CB.yDays(1991); S.cur = D.jt; S.t = S.cur * 1440 + 420; uiNarr = []; lifeMorning(S.cur); return uiNarr.join(' '); });
    assert.match(old, /picnic in People’s Park/); assert.doesNotMatch(old, /celebration walk/);
    noErrors(errors);
  } },
  { name: 'Tacoma moments, local heroes and community events: each fires with 2–3 choices that differ, heroes move through four steps, kid-safe words', fn: async ctx => {
    const { page, errors } = await open(ctx);
    const run = mode => ev(page, `
      const AT={cb_mountain:'view',cb_aroma:'view',cb_narrows:'we_view',cb_dome:'dt_dome',cb_zoo:'ru_zoo',cb_bike_borrowed:'mlk',cb_hero_barber:'mlk',cb_hero_coach:'peoples',cb_hero_librarian:isGrow()?'library':'mlk',cb_hero_auntie:'home',
        cb_moving:'home',cb_meals:'home',cb_pancakes:'mlk',cb_crosswalk:'mlk',cb_welcome:'home',cb_cleanup:'home',cb_porch:'home'};
      const out={},words=[];S.money=200;CB.S().bike={kind:'used',d:0};
      for(const id of CB.events){const e=EV.find(x=>x.id===id);const rep=/hero/.test(id)?4:1;out[id]={fired:0,opts:[],steps:[]};
        for(let k=0;k<rep;k++){
          jump(2027,8,7,id==='cb_dome'?1080:id==='cb_porch'?1100:600,'sun');S.age=isGrow()?15:25;S.loc=AT[id];S.ev.pending=[];S.ev.count[id]=0;S.ev.last={};
          if(id==='cb_bike_borrowed')CB.S().bikeGone=-1;
          window.__ride=id==='cb_bike_borrowed';
          forceEvent(id);const ctx={at:AT[id],from:'home',fired:[]};
          if(id==='cb_bike_borrowed'){ /* riding: the event reads the ride flag through its cond */ }
          fireHook('arrive',ctx);closeModals();
          if(ctx.fired.includes(id))out[id].fired++;words.push(...uiNarr);
          const o=e.choices();out[id].n=o.length;out[id].steps.push(CB.S().hero[id.replace('cb_hero_','')]||0);
          const snap=JSON.stringify([S.money,S.energy,S.mood,S.family,S.stress,S.community,S.t]);const base=JSON.stringify(S);const res=[];
          for(let i=0;i<o.length;i++){S=JSON.parse(base);const oo=e.choices()[i];words.push(oo.l,oo.s||'');if(oo.dis){res.push('dis');continue}const n0=uiNarr.length;oo.fn();words.push(...uiNarr.slice(n0));res.push(JSON.stringify([S.money,S.energy,S.mood,S.family,S.stress,S.community,S.t,uiNarr.slice(n0).join('')]))}
          S=JSON.parse(base);out[id].opts.push(res);
        }}
      out.words=words.join(' ');out.moments=S.life.moments.map(m=>m.t).join(' | ');out.week=isGrow()?GROW.weekView():weekView();return out;`);
    for (const mode of ['grow', 'adult']) {
      await start(page, mode === 'grow' ? { age: 15 } : { grow: false, age: 18 });
      // the borrowed bike needs a ride: start one from the page (RIDING is set by rideGo, and read in the arrive hook)
      const r = await run(mode);
      for (const id of Object.keys(r).filter(k => /^cb_/.test(k))) {
        const x = r[id];
        if (id === 'cb_bike_borrowed') continue;   // checked below, on a real ride
        assert.ok(x.fired >= 1, `${mode}: ${id} fires`);
        assert.ok(x.n >= 2 && x.n <= 3, `${mode}: ${id} has 2–3 choices (${x.n})`);
        for (const res of x.opts) { const ok = res.filter(v => v !== 'dis'); assert.strictEqual(new Set(ok).size, ok.length, `${mode}: ${id}: every choice does something different`); }
        if (/hero/.test(id)) assert.deepStrictEqual(x.steps, [1, 2, 3, 4], `${mode}: ${id} moves through its four steps`);
      }
      assert.match(r.moments, /became one of your people/);
      assert.match(r.week, /Local heroes/);
      if (mode === 'grow') assert.doesNotMatch(r.words, BAD_KID);
      assert.doesNotMatch(r.words, BAD_FISH);
    }
    // the borrowed bike: riding somewhere without a lock
    await start(page, { age: 15 });
    const b = await ev(page, `jump(2027,8,7,600,'sun');S.loc='home';CB.S().bike={kind:'used',d:0};S.ev.count={};S.ev.last={};forceEvent('cb_bike_borrowed');
      CB.rideGo('mlk');closeModals();return {gone:CB.S().bikeGone>=0,flag:eventFlag('lev_g_bike_back'),txt:uiNarr.join(' ')};`);
    assert.ok(b.gone, b.txt); assert.ok(b.flag != null, 'the bike-back chain is set');
    noErrors(errors);
  } },
  { name: 'the Tacoma Aroma fades by era, moments roll from the save (no more than one of these a day), and Quick play is unchanged', fn: async ctx => {
    const { page, errors } = await open(ctx);
    const count = y => page.evaluate(([y]) => {
      const e = EV.find(x => x.id === 'cb_aroma'); let n = 0; S.loc = 'view'; S.ev.force = [];
      for (let i = 0; i < 600; i++) { S.cur = 20 + i; S.t = S.cur * 1440 + 600; S.wxSet = { [S.cur]: 'gray' }; CB.S().evDay = -1; if (e.cond({ at: 'view', hook: 'arrive' })) n++; }
      return n; }, [y]);
    await start(page, { grow: false, length: 'life', age: 18, year: 1980 }); const n80 = await count(1980);
    await start(page, { grow: false, length: 'life', age: 18, year: 2026 }); const n26 = await count(2026);
    assert.ok(n80 > n26 * 3, `1980 ${n80} vs 2026 ${n26}`); assert.ok(n26 > 0);
    const once = await page.evaluate(() => { const e = EV.find(x => x.id === 'cb_aroma'); S.ev.force = []; CB.S().evDay = day(); return e.cond({ at: 'view', hook: 'arrive' }); });
    assert.strictEqual(once, false, 'one a day');
    // Quick play: none of it
    await start(page, { length: 'quick' });
    const q = await ev(page, `S.loc='home';S.t=S.cur*1440+600;const a=acts().map(x=>x.l).join(' | ');S.loc='mlk';const b=acts().map(x=>x.l).join(' | ');
      const e=EV.find(x=>x.id==='cb_hero_barber');return {a,b,ev:e.cond({at:'mlk'}),week:GROW.weekView()};`);
    assert.doesNotMatch(q.a + q.b, /Odd|Mow|credit union|bike shop|saving goal|Biscuit/); assert.strictEqual(q.ev, false); assert.doesNotMatch(q.week, /Money and goals/);
    noErrors(errors);
  } },
  { name: 'adults: a community garden plot, the Saturday community lunch, and mentoring from 21', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await start(page, { grow: false, length: '2y', age: 18 });
    const r = await ev(page, `
      const o={};S.money=500;S.loc='peoples';jump(2027,4,6,600,'sun');
      const g=act(/Sign up for a plot/);o.plot=g.l;g.fn();o.has=!!CB.S().plot;o.m1=S.life.moments.some(m=>/community garden/.test(m.t));
      const t=act(/Tend your garden plot/);o.tend=!t.dis;t.fn();o.tended=act(/garden plot/).dis;
      jump(2027,8,3,600,'sun');S.loc='peoples';const f0=S.food;const h=act(/Harvest/);h.fn();o.food=S.food-f0;o.m2=S.life.moments.some(m=>/first harvest/.test(m.t));
      o.mentor18=!!act(/mentor/);S.age=21;S.community=10;o.lowCom=act(/mentor/).dis;S.community=40;const me=act(/mentor/);me.fn();o.mentee=uiNarr.join(' ');
      jump(2027,8,3,990,'sun');S.loc='peoples';const k=act(/Meet with Kendrick/);o.meet=!k.dis;k.fn();o.n=CB.S().mentor.n;
      jump(2027,8,4,990,'sun');S.loc='peoples';o.wed=act(/Meet with Kendrick/).dis;
      jump(2027,8,7,700,'sun');S.loc='mlk';const l=act(/community lunch/);const c0=S.community;l.fn();o.lunch=S.community-c0;o.vol=CB.S().vol;
      const notes=[];LIFE_HOOKS.skip.forEach(f=>f(S.cur+1,S.cur+40,'friends',notes));o.skip=notes.filter(n=>/garden|Kendrick/.test(n)).join(' | ');
      o.week=weekView();return o;`);
    assert.match(r.plot, /\$25 a year/); assert.ok(r.has && r.m1 && r.tend && r.tended);
    assert.strictEqual(r.food, 2); assert.ok(r.m2);
    assert.ok(!r.mentor18, 'not at 18'); assert.ok(r.lowCom, 'the neighborhood has to know you'); assert.match(r.mentee, /Kendrick/);
    assert.ok(r.meet); assert.strictEqual(r.n, 1); assert.ok(r.wed, 'Tuesdays and Thursdays');
    assert.strictEqual(r.lunch, 4); assert.strictEqual(r.vol, 1);
    assert.match(r.skip, /garden/); assert.match(r.skip, /Kendrick/);
    assert.match(r.week, /Your community/); assert.match(r.week, /Garden plot/); assert.match(r.week, /Mentoring/);
    noErrors(errors);
  } },
  { name: 'the guide has a Money, a bike and the neighborhood chapter, and What’s new 0.4.2 says so', fn: async ctx => {
    const { page, errors } = await open(ctx);
    await page.click('#helpBtn'); await page.waitForSelector('#tut');
    const t = await page.evaluate(() => { const el = document.getElementById('tut-community'); return el ? el.innerText : null; });
    assert.ok(t, 'the chapter is there');
    for (const s of ['Allowance', 'Mowing', 'Babysitting', 'Shoveling snow', 'youth savings account', 'passbook', 'Saving goals', 'Week', 'Ride', 'lock', 'Juneteenth', '2021',
      'block party', 'giveaway', 'Tacoma Aroma', 'Narrows', 'Local heroes', 'real people’s details are always left out', 'garden plot', 'community lunch', 'Mentoring']) assert.ok(t.includes(s), 'mentions ' + s);
    assert.doesNotMatch(t, BAD_KID); assert.doesNotMatch(t, BAD_FISH);
    const w = await page.evaluate(() => (CHANGELOG['0.4.2'] || []).join(' '));
    assert.match(w, /odd jobs/i); assert.match(w, /bike/i); assert.match(w, /Juneteenth/);
    noErrors(errors);
  } },
];
