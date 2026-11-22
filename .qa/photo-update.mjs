import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
const page = await context.newPage();
const results = [];
const errors = [];
const assetErrors = [];
page.on('pageerror', (error) => errors.push(error.message));
page.on('response', (response) => {
  if (response.url().startsWith('http://127.0.0.1:5173/') && response.status() >= 400) assetErrors.push(`${response.status()} ${response.url()}`);
});

async function test(name, fn) {
  try {
    await fn();
    results.push({ name, status: 'PASS' });
    console.log(`PASS ${name}`);
  } catch (error) {
    results.push({ name, status: 'FAIL', error: error.message });
    console.error(`FAIL ${name}: ${error.message}`);
    await page.screenshot({ path: `/home/user/workspace/.qa/photo-update-failure-${results.length}.png` }).catch(() => {});
    if (await page.getByRole('dialog').count()) await page.keyboard.press('Escape');
  }
}

async function resetCards() {
  await page.getByRole('button', { name: 'Smile care', exact: true }).click();
  await page.getByRole('button', { name: 'All treatments', exact: true }).click();
}

await page.goto('http://127.0.0.1:5173/', { waitUntil: 'domcontentloaded' });
await page.evaluate(async () => {
  await document.fonts.ready;
  await Promise.all([...document.images].map((image) => { image.loading = 'eager'; return image.decode().catch(() => {}); }));
});

await test('Supplied photos replace both examples; clinician text follows the clinic sign', async () => {
  assert.match(await page.locator('.hero-image img').getAttribute('src'), /clinic-portrait\.webp$/);
  assert.match(await page.locator('.about-image img').getAttribute('src'), /clinic-exterior\.webp$/);
  assert.equal(await page.locator('img[src*="dental-care-hero"], img[src*="dental-room"]').count(), 0);
  const text = await page.locator('.clinic-specialists').innerText();
  assert.match(text, /Dr\. Nishant Sarda/);
  assert.match(text, /Dr\. Prerana Sarda/);
  assert.match(text, /MDS \(Gold Medal\)/);
  assert.equal(await page.locator('.hero-image img').getAttribute('alt'), 'Portrait supplied for SARDA Dental Care');
});

await test('Seven reference treatments have real photo assets and colour-coded front/back panels', async () => {
  const names = ['Dental implants', 'Root canal treatment', 'Orthodontics', 'Teeth whitening', 'Tooth extraction', 'Oral prophylaxis', 'Dentures & overdentures'];
  assert.equal(await page.locator('[data-service-card]').count(), names.length);
  for (const name of names) assert.equal(await page.getByRole('button', { name: `Explore ${name}`, exact: true }).count(), 1);
  assert.equal(await page.locator('.treatment-photo img').evaluateAll((images) => images.every((image) => image.complete && image.naturalWidth > 0)), true);
  assert.equal(await page.locator('.treatment-metrics > div').count(), 21);
  assert.equal(await page.locator('.treatment-front [inert]').count(), 0);
});

await test('Every card flips, hides inactive controls, supports Escape and restores button focus', async () => {
  const ids = await page.locator('[data-service-id]').evaluateAll((cards) => cards.map((card) => card.dataset.serviceId));
  for (const id of ids) {
    const card = page.locator(`[data-service-id="${id}"]`);
    await card.locator('.treatment-flip-button').click();
    await page.waitForFunction((value) => document.querySelector(`[data-service-id="${value}"] .treatment-back h3`) === document.activeElement, id);
    assert.equal(await card.locator('.treatment-front').getAttribute('aria-hidden'), 'true');
    assert.equal(await card.locator('.treatment-front').getAttribute('inert'), '');
    assert.equal(await card.locator('.treatment-back').getAttribute('aria-hidden'), 'false');
    assert.equal(await card.getByRole('button', { name: /^Learn about/ }).isVisible(), true);
    await page.keyboard.press('Escape');
    await page.waitForFunction((value) => document.querySelector(`[data-service-id="${value}"] .treatment-flip-button`) === document.activeElement, id);
    assert.equal(await card.evaluate((element) => element.classList.contains('is-flipped')), false);
  }
});

await test('Filtering resets flipped cards and preserves the correct treatment groups', async () => {
  await page.getByRole('button', { name: 'Explore Dental implants', exact: true }).click();
  await resetCards();
  assert.equal(await page.locator('.treatment-card.is-flipped').count(), 0);
  await page.getByRole('button', { name: 'Restore & repair', exact: true }).click();
  assert.equal(await page.locator('[data-service-card]').count(), 4);
  await page.getByRole('button', { name: 'Everyday care', exact: true }).click();
  assert.equal(await page.locator('[data-service-card]').count(), 1);
  await resetCards();
});

await test('Both supplied photographs open full-size and close accessibly', async () => {
  for (const [label, file] of [['View full clinic photo', 'clinic-exterior-full.webp'], ['View the supplied portrait', 'clinic-portrait-full.webp']]) {
    const opener = page.getByRole('button', { name: label, exact: true });
    await opener.click();
    const dialog = page.getByRole('dialog');
    assert.equal(await dialog.isVisible(), true);
    assert.ok((await dialog.locator('img').getAttribute('src')).endsWith(file));
    await dialog.locator('img').evaluate((image) => image.decode());
    assert.equal(await dialog.locator('img').evaluate((image) => image.naturalWidth > 0), true);
    const report = await new AxeBuilder({ page }).exclude('iframe').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    assert.equal(report.violations.length, 0, JSON.stringify(report.violations.map((violation) => ({ id: violation.id, targets: violation.nodes.map((node) => node.target) }))));
    await page.keyboard.press('Escape');
    assert.equal(await page.getByRole('dialog').count(), 0);
    assert.equal(await opener.evaluate((button) => document.activeElement === button), true);
  }
});

await test('All card backs pass automated WCAG checks on desktop and mobile', async () => {
  for (const card of await page.locator('[data-service-card]').all()) await card.locator('.treatment-flip-button').click();
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    const report = await new AxeBuilder({ page }).exclude('iframe').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    await fs.writeFile(`/home/user/workspace/.qa/accessibility-card-backs-${width}.json`, JSON.stringify(report.violations, null, 2));
    assert.equal(report.violations.length, 0, JSON.stringify(report.violations.map((violation) => ({ id: violation.id, targets: violation.nodes.map((node) => node.target) }))));
  }
});

await test('Cards and metrics remain within the viewport at seven responsive widths', async () => {
  for (const width of [320, 375, 390, 600, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, `Page overflow at ${width}px`);
    const overflows = await page.locator('.treatment-back, .treatment-metrics dd').evaluateAll((elements) => elements.filter((element) => element.scrollWidth > element.clientWidth + 1).map((element) => element.textContent.trim().slice(0, 60)));
    assert.deepEqual(overflows, [], `Card overflow at ${width}px`);
  }
});

await test('No fixed clinical-result guarantees, missing local assets or runtime exceptions', async () => {
  const text = (await page.locator('.treatment-back').allTextContents()).join(' ');
  assert.equal(/8\s*shades|15\+\s*yrs|\b2–3 days\b|lifetime solution|relieving pain instantly/i.test(text), false);
  assert.deepEqual(errors, []);
  assert.deepEqual(assetErrors, []);
});

await fs.writeFile('/home/user/workspace/.qa/photo-update-results.json', JSON.stringify(results, null, 2));
await browser.close();
const failures = results.filter((result) => result.status === 'FAIL');
console.log(`\n${results.length - failures.length}/${results.length} photo-update checks passed.`);
if (failures.length) process.exitCode = 1;
