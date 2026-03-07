import { test, expect } from '@playwright/test';

test.describe('Onboarding flow', () => {
  test('shows onboarding on first visit and can be completed', async ({ page }) => {
    await page.goto('/app');
    await expect(page.locator('.onboard-overlay')).toBeVisible();

    // Click Next until Done (there are a few steps)
    for (let i = 0; i < 4; i++) {
      await page.getByRole('button', { name: /Next|Done/ }).click();
    }

    // After completion the overlay should be gone and localStorage key set
    await expect(page.locator('.onboard-overlay')).not.toBeVisible();
    const seen = await page.evaluate(() => localStorage.getItem('sive:onboarding_seen'));
    expect(seen).toBe('1');
  });
});
