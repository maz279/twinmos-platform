import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:5173/');
  await page.waitForTimeout(1000);
  console.log('Login page url:', page.url());

  const email = page.locator('input[type="email"]');
  if (await email.isVisible()) {
    await email.fill('admin@twinmos.dev');
    await page.locator('input[type="password"]').fill('DevOnly-ChangeMe-2026!');
    await page.locator('button:has-text("Sign in")').click();
    await page.waitForTimeout(3000);
  }

  console.log('URL after login:', page.url());
  console.log('Body snippet:', (await page.innerText('body')).slice(0, 600));

  await browser.close();
})();
