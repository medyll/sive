import { test as baseTest } from '@playwright/test';

export const test = baseTest.extend({
  // Auto-dismiss onboarding modal before each test
  page: async ({ page }, use) => {
    page.on('load', async () => {
      try {
        // Mark onboarding as seen so modal doesn't appear
        await page.evaluate(() => {
          localStorage.setItem('sive:onboarding_seen', '1');
        });
      } catch (e) {
        // ignore
      }
    });

    // Set before navigating
    await page.evaluate(() => {
      localStorage.setItem('sive:onboarding_seen', '1');
    });

    await use(page);
  }
});

export { expect } from '@playwright/test';
