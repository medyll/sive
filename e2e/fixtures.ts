import { test as baseTest, expect } from '@playwright/test';

export const test = baseTest.extend({
  // Auto-dismiss onboarding modal by setting localStorage before any page loads
  page: async ({ context }, use) => {
    // Add init script that runs before page script executes
    await context.addInitScript(() => {
      try {
        localStorage.setItem('sive:onboarding_seen', '1');
      } catch (e) {
        // ignore localStorage errors
      }
    });

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
