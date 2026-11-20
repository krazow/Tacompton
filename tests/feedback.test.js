const { open, noErrors, assert } = require('./helpers');

module.exports = [
  { name: 'Send feedback from the start page posts to the Formspree form xkjrzdjw', only: 'index.html', fn: async ctx => {
    const { page, errors } = await open(ctx);
    let posted = null;
    await page.route('https://formspree.io/**', async route => {
      posted = { url: route.request().url(), method: route.request().method(), body: JSON.parse(route.request().postData() || '{}') };
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
    });
    await page.click('#feedbackBtn');
    await page.waitForSelector('#fbmsg');
    await page.fill('#fbmsg', 'Love the Link bell.');
    await page.fill('#fbmail', 'tester@example.com');
    await page.evaluate(() => { FBD.msg = document.getElementById('fbmsg').value; FBD.email = document.getElementById('fbmail').value; });
    await page.evaluate(() => MBTN(0));
    await page.waitForFunction(() => /Thanks/.test(document.querySelector('.modal') ? document.querySelector('.modal').textContent : ''), null, { timeout: 5000 });
    assert.ok(posted, 'a request went to Formspree');
    assert.strictEqual(posted.url, 'https://formspree.io/f/xkjrzdjw');
    assert.strictEqual(posted.method, 'POST');
    assert.strictEqual(posted.body.message, 'Love the Link bell.');
    assert.strictEqual(posted.body._replyto, 'tester@example.com');
    assert.strictEqual(posted.body._subject, 'Tacompton Feedback');
    noErrors(errors);
  } },
];
