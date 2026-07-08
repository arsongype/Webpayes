import { test, expect } from '@playwright/test';

test('signup flow creates account and stores token', async ({ page }) => {
  await page.goto('/register');
  await page.fill('#firstName', 'arson');
  await page.fill('#lastName', 'preson gype');
  const email = `arson.e2e+${Date.now()}@example.com`;
  await page.fill('#email', email);
  await page.fill('#password', '123azerty');
  await Promise.all([
    page.waitForResponse((resp) => resp.url().includes('/auth/register') && resp.status() === 200, { timeout: 5000 }),
    page.click('button:has-text("Créer mon compte")'),
  ]);

  // Check token saved in localStorage
  const token = await page.evaluate(() => localStorage.getItem('token'));
  expect(token).toBeTruthy();
});
