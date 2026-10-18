/* eslint-disable @typescript-eslint/no-require-imports -- Standalone CommonJS CI harness; not application code. */
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');

(async () => {
  const browser = await chromium.launch();
  fs.mkdirSync('browser-evidence', { recursive: true });
  let checks = 0;
  let interceptedSignups = 0;
  for (const width of [375, 768, 1024, 1280]) {
    for (const reducedMotion of ['no-preference', 'reduce']) {
      const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion });
      await context.route('**/*', route => {
        const url = new URL(route.request().url());
        return url.origin === 'http://localhost:3002' ? route.continue() : route.abort();
      });
      const page = await context.newPage();
      await page.goto('http://localhost:3002', { waitUntil: 'networkidle' });
      const explore = page.getByRole('link', { name: 'Explorar las 6 etapas', exact: true }).filter({ visible: true });
      assert.equal(await explore.count(), 1);
      const entryBox = await explore.boundingBox();
      const pathBox = await page.locator('[data-tour="hero-path"]').filter({ visible: true }).boundingBox();
      assert.ok(entryBox && pathBox && entryBox.y + entryBox.height <= pathBox.y + 1, `hero controls overlap path ${width}`);
      await explore.click();
      await page.locator('#journey').waitFor({ state: 'visible' });
      assert.deepEqual(await page.locator('#journey li h3').allTextContents(), ['Llega', 'Establécete', 'Emprende', 'Protégete', 'Crece', 'Evoluciona']);
      assert.equal(await page.locator('#journey li').count(), 6);
      assert.equal(await page.locator('#journey li a[href="/onboarding"]').count(), 6);
      assert.ok(await page.locator('#journey').getByText('Guía educativa EVOLUSA').isVisible());
      assert.ok(await page.locator('#journey').getByText(/no constituye asesoría legal/).isVisible());
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `overflow ${width}`);
      await page.locator('#journey').screenshot({ path: `browser-evidence/roadmap-${width}-${reducedMotion}.png` });
      await page.getByRole('link', { name: 'Crear mi roadmap', exact: true }).click();
      await page.waitForURL('**/onboarding');
      assert.ok(!page.url().includes('signup'));
      checks++;
      await context.close();
    }
  }
  const context = await browser.newContext({ viewport: { width: 375, height: 1000 } });
  await context.route('**/*', async route => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.origin === 'http://localhost:3002') return route.continue();
    if (url.hostname === 'auth-test.invalid' && url.pathname === '/auth/v1/signup' && request.method() === 'POST') {
      interceptedSignups++;
      return route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ code: 'unexpected_failure', msg: 'Error sending confirmation email' }) });
    }
    if (url.hostname === 'auth-test.invalid' && url.pathname === '/auth/v1/settings') return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ external: { google: false } }) });
    return route.abort();
  });
  const page = await context.newPage();
  await page.goto('http://localhost:3002/signup', { waitUntil: 'networkidle' });
  await page.getByLabel('Correo electrónico', { exact: true }).fill('synthetic@example.invalid');
  await page.getByLabel('Contraseña', { exact: true }).fill('Synthetic-Password-123!');
  await page.getByRole('button', { name: 'Crear cuenta', exact: true }).click();
  await page.getByText('No se pudo enviar el correo de acceso. El administrador debe revisar la configuración de correo.', { exact: true }).waitFor();
  assert.equal(interceptedSignups, 1);
  assert.equal(await page.getByLabel('Correo electrónico', { exact: true }).inputValue(), 'synthetic@example.invalid');
  checks++;
  await context.close();
  await browser.close();
  console.log(JSON.stringify({ checks, interceptedSignups, realAuthRequests: 0 }));
})().catch(error => { console.error(error); process.exit(1); });
