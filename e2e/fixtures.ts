import { test as baseTest, expect } from '@playwright/test';

export const test = baseTest.extend({
  // Auto-dismiss onboarding modal by setting localStorage before any page loads
  // Skip auto-dismiss for onboarding.spec.ts so onboarding tests can run as authored
  page: async ({ context }, use, testInfo) => {
    // If the test file is not the onboarding spec, add init script to dismiss the onboarding
    const file = testInfo?.file || '';
    if (!file.includes('onboarding.spec.ts')) {
      // Add init script that runs before page script executes
      await context.addInitScript(() => {
        try {
          localStorage.setItem('sive:onboarding_seen', '1');
        } catch (e) {
          // ignore localStorage errors
        }
      });
    }

    // Create page after init script is set
    const page = await context.newPage();

    await use(page);
    await page.close();
  },

  // Helper fixture for navigation
  goto: async ({ page }, use) => {
    const goto = async (path: string) => {
      return page.goto(path);
    };
    await use(goto);
  }
});

export { expect };
