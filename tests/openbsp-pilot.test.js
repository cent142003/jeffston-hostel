'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const puppeteer = require('puppeteer-core');

const pilotFile = path.resolve(__dirname, '..', 'openbsp-pilot.html');
let browser;

test.describe('OpenBSP preview-only trial (no real messages)', () => {
  test.before(async () => {
    const chrome = process.env.PUPPETEER_EXECUTABLE_PATH
      ? { executablePath: process.env.PUPPETEER_EXECUTABLE_PATH }
      : { channel: 'chrome' };
    browser = await puppeteer.launch({
      ...chrome,
      headless: true,
      args: ['--disable-background-networking', '--host-resolver-rules=MAP * ~NOTFOUND']
    });
  });

  test.after(async () => {
    await browser?.close();
  });

  async function page() {
    const p = await browser.newPage();
    await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    const requested = [];
    await p.setRequestInterception(true);
    p.on('request', r => { requested.push(r.url()); r.abort('blockedbyclient'); });
    await p.setContent(fs.readFileSync(pilotFile, 'utf8'), { waitUntil: 'load' });
    await p.evaluate(() => {
      window.openedWhatsappUrls = [];
      HTMLAnchorElement.prototype.click = function () {
        window.openedWhatsappUrls.push(this.href);
      };
    });
    return { p, requested };
  }

  test('initial page has no auto-send, network request, or guest-data collection', async () => {
    const { p, requested } = await page();
    try {
      const state = await p.evaluate(() => ({
        title: document.title,
        testLabel: document.querySelector('label[for="test-number"]')?.textContent,
        sendButton: document.querySelector('button[type="submit"]')?.textContent?.trim(),
        whatsappLinks: document.querySelectorAll('a[href^="https://wa.me/"]').length,
        hasBookingForm: !!document.querySelector('#booking-form'),
        pageWidth: document.documentElement.scrollWidth,
        viewportWidth: innerWidth,
      }));
      assert.match(state.title, /OpenBSP trial/);
      assert.match(state.testLabel, /test WhatsApp Business number/i);
      assert.match(state.sendButton, /Open WhatsApp test chat/);
      assert.equal(state.whatsappLinks, 0, 'No WhatsApp action before manual submission');
      assert.equal(state.hasBookingForm, false, 'Pilot must not change booking or payments');
      assert.equal(requested.length, 0, 'Pilot should not issue API or third-party requests');
      assert.ok(state.pageWidth <= state.viewportWidth, 'Must fit phone-sized screens');
    } finally { await p.close(); }
  });

  test('invalid number and absent ownership prevent an outbound link', async () => {
    const { p } = await page();
    try {
      await p.type('#test-number', '123');
      await p.click('button[type="submit"]');
      assert.deepEqual(await p.evaluate(() => window.openedWhatsappUrls), []);
      assert.match(await p.$eval('#status', e => e.textContent), /valid international test number/i);

      await p.$eval('#test-number', e => { e.value = '+233555000000'; });
      await p.click('button[type="submit"]');
      assert.deepEqual(await p.evaluate(() => window.openedWhatsappUrls), []);
      assert.match(await p.$eval('#status', e => e.textContent), /Confirm you control/i);
    } finally { await p.close(); }
  });

  test('authorized test opens only a manually sendable WhatsApp link', async () => {
    const { p } = await page();
    try {
      await p.$eval('#test-number', e => { e.value = '+233 555 000 000'; });
      await p.click('#ownership');
      await p.click('button[type="submit"]');
      const urls = await p.evaluate(() => window.openedWhatsappUrls);
      assert.equal(urls.length, 1);
      const u = new URL(urls[0]);
      assert.equal(u.origin + u.pathname, 'https://wa.me/233555000000');
      assert.match(u.searchParams.get('text'), /TEST ONLY/);
      assert.match(u.searchParams.get('text'), /No booking or payment/);
      assert.match(await p.$eval('#status', e => e.textContent), /Nothing has been sent yet/);
      assert.equal(p.url(), 'about:blank', 'No navigation to external service');
    } finally { await p.close(); }
  });
});
