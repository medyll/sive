import { test, expect } from '@playwright/test';

test.describe('Onboarding tour', () => {
  test('tour displays on page load', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
    // Tour should be visible on first visit (before localStorage is set)
    await expect(page.locator('.tour-overlay')).toBeVisible();
    await expect(page.locator('.tour-tooltip')).toBeVisible();
  });

  test('can navigate through tour steps with Next button', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.tour-overlay')).toBeVisible();

    // Get initial step counter
    const stepText1 = await page.locator('.tour-step').textContent();
    expect(stepText1).toBe('1 / 5');

    // Click Next button (primary button in tour-actions)
    await page.locator('.tour-actions .primary').click();
    await page.waitForTimeout(200);

    // Verify step changed
    const stepText2 = await page.locator('.tour-step').textContent();
    expect(stepText2).toBe('2 / 5');
  });

  test('can skip tour immediately', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.tour-overlay')).toBeVisible();

    // Click skip button
    await page.locator('.tour-skip').click();
    await page.waitForTimeout(200);

    // Tour should disappear
    await expect(page.locator('.tour-overlay')).not.toBeVisible();
  });

  test('tour completes after all steps', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.tour-overlay')).toBeVisible();

    // Click through all 5 steps
    for (let i = 0; i < 5; i++) {
      await page.locator('.tour-actions .primary').click();
      await page.waitForTimeout(100);
    }

    // Tour should be gone after completing
    await expect(page.locator('.tour-overlay')).not.toBeVisible();
  });
});
