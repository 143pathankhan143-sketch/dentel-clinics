import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { availableSlots, indiaClock, isSunday, normalisePhone, validateRequest } from '../src/lib/appointments.js';

const results = [];
async function test(name, fn) {
  try { await fn(); results.push({ name, status: 'PASS' }); console.log(`PASS ${name}`); }
  catch (error) { results.push({ name, status: 'FAIL', error: error.message }); console.error(`FAIL ${name}: ${error.message}`); }
}

await test('Indian timezone, phone validation, Sunday hours and past-date protection', () => {
  const monday = new Date('2026-11-23T04:00:00Z');
  const sunday = new Date('2026-11-22T04:00:00Z');
  assert.equal(indiaClock(monday).date, '2026-11-23');
  assert.equal(indiaClock(monday).minutes, 570);
  assert.equal(availableSlots('2026-11-23', monday).length, 4);
  assert.equal(availableSlots('2026-11-22', sunday).length, 2);
  assert.equal(availableSlots('2026-11-22', monday).length, 0);
  assert.equal(availableSlots('2026-11-23', new Date('2026-11-23T16:00:00Z')).length, 0);
  assert.equal(normalisePhone('+91 98765 43210'), '9876543210');
  assert.equal(normalisePhone('12345'), '');
  assert.equal(normalisePhone('abc9876543210'), '');
  assert.equal(normalisePhone('0000000000'), '');
  const invalid = validateRequest({ name: '', phone: '12345', date: '2026-11-21', time: '', treatment: 'Fake treatment' }, monday);
  assert.equal(Object.keys(invalid).length, 5);
  const impossible = validateRequest({ name: 'Demo Patient', phone: '9876543210', date: '2026-11-31', time: 'morning', treatment: 'General consultation' }, monday);
  assert.ok(impossible.date);
});

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
const page = await context.newPage();
const runtimeErrors = [];
page.on('pageerror', (error) => runtimeErrors.push(error.message));
await page.goto('http://127.0.0.1:5173/', { waitUntil: 'domcontentloaded' });
await page.evaluate(() => document.fonts.ready);

await test('Correct clinic identity, phone, map coordinates and complete page sections', async () => {
  assert.match(await page.title(), /SARDA DENTAL CARE/);
  for (const id of ['home', 'services', 'about', 'reviews', 'faq', 'contact']) assert.equal(await page.locator(`#${id}`).count(), 1);
  assert.equal(await page.locator('[data-service-card]').count(), 7);
  assert.equal(await page.locator('a[href="tel:+917020751388"]').count() > 3, true);
  assert.match(await page.locator('iframe').getAttribute('src'), /18\.3971121%2C76\.5697103/);
  assert.equal(await page.locator('body').innerText().then((text) => /Kodgi|Ashwin|8806333633|5000\+|10\+ Years/.test(text)), false);
  assert.equal(await page.locator('.review-bar-count').allTextContents().then((values) => values.join(',')), '101,0,0,0,0');
});

await test('All treatment filters show the correct cards and restore the full list', async () => {
  for (const [label, count] of [['Everyday care', 1], ['Restore & repair', 4], ['Smile care', 2]]) {
    await page.getByRole('button', { name: label, exact: true }).click();
    assert.equal(await page.locator('[data-service-card]').count(), count);
    assert.equal(await page.getByRole('button', { name: label, exact: true }).getAttribute('aria-pressed'), 'true');
  }
  await page.getByRole('button', { name: 'All treatments', exact: true }).click();
  assert.equal(await page.locator('[data-service-card]').count(), 7);
});

await test('Service details open and enquiries preselect the correct treatment', async () => {
  await page.getByRole('button', { name: 'Explore Root canal treatment', exact: true }).click();
  await page.getByRole('button', { name: 'Learn about Root canal treatment' }).click();
  assert.equal(await page.getByRole('dialog').isVisible(), true);
  assert.match(await page.getByRole('dialog').innerText(), /not a confirmed service listing/);
  await page.getByRole('button', { name: 'Ask about this treatment' }).click();
  assert.equal(await page.getByRole('dialog').locator('select[name="treatment"]').inputValue(), 'Root canal treatment');
  await page.keyboard.press('Escape');
  assert.equal(await page.getByRole('dialog').count(), 0);
});

let futureSunday = new Date(Date.now() + 10 * 86400000);
while (!isSunday(indiaClock(futureSunday).date)) futureSunday = new Date(futureSunday.getTime() + 86400000);
const date = indiaClock(futureSunday).date;

await test('Appointment validation, Sunday-only time windows and unsent WhatsApp preview', async () => {
  await page.locator('.header-book').click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: 'Prepare appointment request' }).click();
  assert.equal(await dialog.locator('[aria-invalid="true"]').count(), 4);
  assert.equal(await dialog.locator('input[name="name"]').evaluate((input) => document.activeElement === input), true);
  await dialog.locator('input[name="name"]').fill('Demo Patient');
  await dialog.locator('input[name="phone"]').fill('12345');
  await dialog.locator('input[name="date"]').fill(date);
  const options = await dialog.locator('select[name="time"] option').allTextContents();
  assert.equal(options.length, 3);
  assert.equal(options.some((option) => option.includes('9:00 PM')), false);
  await dialog.locator('select[name="time"]').selectOption('morning');
  await dialog.getByRole('button', { name: 'Prepare appointment request' }).click();
  assert.match(await dialog.innerText(), /valid 10-digit Indian mobile/);
  await dialog.locator('input[name="phone"]').fill('9876543210');
  await dialog.getByRole('button', { name: 'Prepare appointment request' }).click();
  assert.match(await dialog.innerText(), /not a confirmed booking/);
  const url = await dialog.getByRole('link', { name: /Send request on WhatsApp/ }).getAttribute('href');
  assert.ok(url.startsWith('https://wa.me/917020751388?text='));
  assert.match(decodeURIComponent(url), /Demo Patient/);
  assert.match(decodeURIComponent(url), /10:00 AM – 12:00 PM/);
  assert.match(decodeURIComponent(url), /Please confirm availability/);
  await dialog.getByRole('button', { name: 'Edit request', exact: true }).click();
  assert.equal(await dialog.locator('input[name="name"]').inputValue(), 'Demo Patient');
  await page.keyboard.press('Escape');
  assert.equal(await page.getByRole('dialog').count(), 0);
  assert.equal(await page.evaluate(() => document.body.style.overflow), '');
});

await test('FAQ accordion opens, closes and updates accessible state', async () => {
  const question = page.getByRole('button', { name: 'What are the clinic timings?', exact: true });
  await question.click();
  assert.equal(await question.getAttribute('aria-expanded'), 'true');
  assert.equal(await page.locator('#faq-answer-1').isVisible(), true);
  assert.equal(await page.locator('#faq-answer-0').isVisible(), false);
  await question.click();
  assert.equal(await question.getAttribute('aria-expanded'), 'false');
  assert.equal(await page.locator('#faq-answer-1').isVisible(), false);
});

await test('Privacy notice is readable and closable by keyboard', async () => {
  await page.getByRole('button', { name: 'Privacy notice', exact: true }).click();
  assert.match(await page.getByRole('dialog').innerText(), /does not save appointment details/);
  await page.keyboard.press('Escape');
  assert.equal(await page.getByRole('dialog').count(), 0);
});

await test('No horizontal overflow at 320, 375, 390, 768, 1024 and 1440 pixels', async () => {
  for (const width of [320, 375, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const dimensions = await page.evaluate(() => ({ content: document.documentElement.scrollWidth, viewport: innerWidth }));
    assert.ok(dimensions.content <= dimensions.viewport, `${width}px viewport overflows: ${JSON.stringify(dimensions)}`);
  }
});

await test('Mobile navigation and sticky booking action work', async () => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.getByRole('button', { name: 'Open navigation menu' }).click();
  assert.equal(await page.getByRole('navigation', { name: 'Mobile navigation' }).isVisible(), true);
  await page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link', { name: 'Services', exact: true }).click();
  assert.equal(await page.getByRole('navigation', { name: 'Mobile navigation' }).count(), 0);
  await page.getByRole('button', { name: 'Open navigation menu' }).click();
  await page.keyboard.press('Escape');
  assert.equal(await page.getByRole('navigation', { name: 'Mobile navigation' }).count(), 0);
  await page.locator('.mobile-bottom-bar').getByRole('button', { name: 'Book a visit' }).click();
  assert.equal(await page.getByRole('dialog').isVisible(), true);
  await page.getByRole('button', { name: 'Close dialog' }).click();
  assert.equal(await page.getByRole('dialog').count(), 0);
});

for (const width of [1440, 390]) {
  await test(`WCAG 2.1 AA automated accessibility audit at ${width}px`, async () => {
    await page.setViewportSize({ width, height: 1000 });
    await page.evaluate(() => window.scrollTo(0, 0));
    const report = await new AxeBuilder({ page }).exclude('iframe').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    await fs.writeFile(`/home/user/workspace/.qa/accessibility-${width}.json`, JSON.stringify(report.violations, null, 2));
    if (report.violations.length) console.log(JSON.stringify(report.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.map((n) => ({ target: n.target, failure: n.failureSummary })) })), null, 2));
    assert.equal(report.violations.length, 0, `${report.violations.length} accessibility violations (details in .qa/accessibility-${width}.json)`);
  });
}

await test('Dialog traps keyboard focus and returns it to the opener', async () => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.locator('.header-book').click();
  await page.getByRole('button', { name: 'Close dialog' }).focus();
  await page.keyboard.press('Shift+Tab');
  assert.equal(await page.evaluate(() => document.activeElement?.closest('dialog') !== null), true);
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(() => document.activeElement?.closest('dialog') !== null), true);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('.header-book').evaluate((button) => document.activeElement === button), true);
});

await test('Booking form and request-review dialog pass automated accessibility checks', async () => {
  await page.locator('.header-book').click();
  let report = await new AxeBuilder({ page }).exclude('iframe').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  await fs.writeFile('/home/user/workspace/.qa/accessibility-booking.json', JSON.stringify(report.violations, null, 2));
  assert.equal(report.violations.length, 0, 'Booking accessibility: ' + report.violations.map((v) => v.id).join(', '));
  const dialog = page.getByRole('dialog');
  await dialog.locator('input[name="name"]').fill('Demo Patient');
  await dialog.locator('input[name="phone"]').fill('9876543210');
  await dialog.locator('input[name="date"]').fill(date);
  await dialog.locator('select[name="time"]').selectOption('morning');
  await dialog.getByRole('button', { name: 'Prepare appointment request' }).click();
  report = await new AxeBuilder({ page }).exclude('iframe').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  await fs.writeFile('/home/user/workspace/.qa/accessibility-request-review.json', JSON.stringify(report.violations, null, 2));
  assert.equal(report.violations.length, 0, 'Review accessibility: ' + report.violations.map((v) => v.id).join(', '));
  await page.keyboard.press('Escape');
});

await test('No uncaught browser runtime errors', () => assert.deepEqual(runtimeErrors, []));
await fs.writeFile('/home/user/workspace/.qa/test-results.json', JSON.stringify(results, null, 2));
await browser.close();
const failed = results.filter((result) => result.status === 'FAIL');
console.log(`\n${results.length - failed.length}/${results.length} checks passed.`);
if (failed.length) process.exitCode = 1;
