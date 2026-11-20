const { open, newGame, noErrors, assert } = require('./helpers');

// A random bot plays a whole 14 days by clicking. Any modal: press the first enabled button (or a random one now and then).
// It must reach the end screen (14 days, or a loss) with no page errors.
const STEPS = 6000, SEEDS = [20261119, 7, 424242];

module.exports = SEEDS.map(seed => ({ name: `bot plays 14 days (seed ${seed})`, fn: async ctx => {
  const { page, errors } = await open(ctx, { seed });
  await newGame(page);
  await page.evaluate(() => { newGame('normal'); }); // keep the job-choice modal: the bot answers it
  let st = { steps: 0, done: false };
  while (!st.done && st.steps < STEPS && !errors.length) {
    st = await page.evaluate(([st, n]) => {
      const rnd = Math.random, skip = /exit|transfer|settings|change name|save slots|delete|new game|play again/i;
      const ok = b => !b.disabled && !skip.test(b.textContent);
      const pick = a => a[Math.floor(rnd() * a.length)];
      for (let i = 0; i < n && !st.done; i++, st.steps++) {
        if (document.querySelector('.end')) { st.done = true; break; }
        if (!S || S.over) { st.done = true; break; }
        const cross = document.querySelector('.cross'); if (cross) { cross.click(); continue; }
        const m = document.getElementById('mbg');
        if (m) {
          const bs = [...m.querySelectorAll('.modal > button.act')];
          const any = bs.map((b, k) => k).filter(k => ok(bs[k]));
          if (any.length) MBTN(rnd() < 0.7 ? any[0] : pick(any)); else m.remove();
          continue;
        }
        if (rnd() < 0.05) { setTab(pick(allTabs().map(t => t[0]))); continue; }
        if (tab !== 'act') setTab('act');
        // a bot that never sleeps never finishes: now and then, call it a day
        if (rnd() < 0.03) { endDay('home'); continue; }
        const bs = [...document.querySelectorAll('#app .content button.act, #app .content button.chip')].filter(ok);
        if (!bs.length) { endDay('home'); continue; }
        pick(bs).click();
      }
      return st;
    }, [st, 100]);
  }
  noErrors(errors);
  assert.ok(st.done, `the 14 days should finish within ${STEPS} steps (got ${st.steps})`);
  console.log(`       bot: ${st.steps} steps, day ${await page.evaluate(() => S ? S.cur : 'end')}`);
} }));
