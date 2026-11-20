#!/usr/bin/env node
// Balance check: node tools/sim.js [seeds]   (needs Playwright, like the tests; CHROME_PATH=/path/to/chrome to use an installed Chrome)
// Plays every policy × job × difficulty for several seeds in the built index.html and prints the grade table
// (most common grade, with the spread of grades, mean score, and mean final stress / community / job standing).
const path = require('path');
const { pathToFileURL } = require('url');
const { chromium } = require('playwright');
const { simGame, POLICIES, SIM_JOBS, SIM_DIFFS } = require('./sim-lib');

(async () => {
  const N = +(process.argv[2] || 6);
  const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
  const page = await (await browser.newContext({ viewport: { width: 400, height: 800 } })).newPage();
  page.on('pageerror', e => console.error('page error:', e.message));
  await page.addInitScript(() => { localStorage.setItem('tacompton.prefs', JSON.stringify({ tips: false, sound: false })); localStorage.setItem('tacompton.name', 'Sim'); });
  await page.goto(pathToFileURL(path.join(__dirname, '..', 'index.html')).href);
  await page.waitForSelector('.title');
  const rows = [];
  for (const policy of POLICIES) for (const diff of SIM_DIFFS) for (const job of SIM_JOBS) {
    const rs = [];
    for (let s = 1; s <= N; s++) rs.push(await page.evaluate(simGame, { policy, job, diff, seed: s * 7919 }));
    const g = {}; rs.forEach(r => g[r.grade] = (g[r.grade] || 0) + 1);
    const mode = Object.entries(g).sort((a, b) => b[1] - a[1])[0][0];
    const avg = k => Math.round(rs.reduce((t, r) => t + r[k], 0) / rs.length);
    rows.push({ policy, diff, job, mode, spread: Object.keys(g).sort().map(k => k + '×' + g[k]).join(' '), score: avg('score'), stress: avg('stress'), peak: avg('peak'), avgStress: avg('avgStress'), community: avg('community'), standing: avg('standing'), money: avg('money'),
      losses: rs.filter(r => r.loss).map(r => r.loss).join(',') });
  }
  console.log(`| policy | difficulty | job | grade | spread (${N} seeds) | score | stress end / avg / peak | community | job | cash |`);
  console.log('|---|---|---|---|---|---|---|---|---|---|');
  for (const r of rows) console.log(`| ${r.policy} | ${r.diff} | ${r.job} | **${r.mode}** | ${r.spread}${r.losses ? ' (' + r.losses + ')' : ''} | ${r.score} | ${r.stress} / ${r.avgStress} / ${r.peak} | ${r.community} | ${r.standing} | ${r.money} |`);
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
