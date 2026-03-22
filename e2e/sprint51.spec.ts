import { test, expect } from './fixtures';

test.describe('Sprint 51 — Document CRUD, Mobile UX, Onboarding v2', () => {
  // ── A: Document CRUD ──────────────────────────────────────────────────────

  test('duplicate: context menu shows Duplicate option', async ({ page }) => {
    await page.goto('/app');
    // Hover a doc item to reveal the ⋯ menu button
    const menuBtn = page.locator('.btn-doc-menu').first();
    await menuBtn.click();
    const duplicateItem = page.locator('[role="menuitem"]', { hasText: 'Duplicate' }).first();
    await expect(duplicateItem).toBeVisible();
  });

  test('duplicate: Duplicate menu item is enabled and not disabled', async ({ page }) => {
    await page.goto('/app');
    const menuBtn = page.locator('.btn-doc-menu').first();
    await menuBtn.click();
    const duplicateItem = page.locator('[role="menuitem"]', { hasText: 'Duplicate' }).first();
    await expect(duplicateItem).toBeVisible();
    await expect(duplicateItem).toBeEnabled();
  });

  test('bulk delete: select mode can be toggled', async ({ page }) => {
    await page.goto('/app');
    const bulkBtn = page.locator('.btn-bulk-mode').first();
    await bulkBtn.click();
    // In bulk mode, checkboxes appear
    await expect(page.locator('.doc-checkbox').first()).toBeVisible();
    // Cancel bulk mode
    await page.locator('.btn-bulk-cancel').click();
    await expect(page.locator('.doc-checkbox').first()).not.toBeVisible();
  });

  test('bulk delete: select all then delete shows count', async ({ page }) => {
    await page.goto('/app');
    await page.locator('.btn-bulk-mode').first().click();
    await page.locator('.btn-select-all').click();
    // Delete button should now be visible with count
    const deleteBtn = page.locator('.btn-bulk-delete');
    await expect(deleteBtn).toBeVisible();
    await expect(deleteBtn).toContainText('Delete');
  });

  test('inline rename: double-click on title shows input', async ({ page }) => {
    await page.goto('/app');
    const docTitle = page.locator('.doc-title').first();
    await docTitle.dblclick();
    await expect(page.locator('.doc-title-input').first()).toBeVisible();
  });

  test('inline rename: Escape cancels edit', async ({ page }) => {
    await page.goto('/app');
    const docTitle = page.locator('.doc-title').first();
    await docTitle.dblclick();
    const input = page.locator('.doc-title-input').first();
    await input.press('Escape');
    await expect(input).not.toBeVisible();
  });

  // ── B: Mobile UX ──────────────────────────────────────────────────────────

  test('bottom nav: visible on mobile viewport (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/app');
    const nav = page.locator('[data-testid="bottom-nav"]');
    await expect(nav).toBeVisible();
  });

  test('bottom nav: hidden on desktop viewport (1280px)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/app');
    const nav = page.locator('[data-testid="bottom-nav"]');
    // display:none on desktop — not visible
    await expect(nav).not.toBeVisible();
  });

  // ── D: Onboarding v2 ──────────────────────────────────────────────────────

  test("what's new banner: shown on first visit", async ({ page, context }) => {
    // Clear the whats-new key so banner appears
    await context.addInitScript(() => {
      try {
        localStorage.removeItem('sive:whatsnew:3.1.0');
      } catch { /* ignore */ }
    });
    await page.goto('/app');
    await expect(page.locator('[data-testid="whats-new-banner"]')).toBeVisible();
  });

  test("what's new banner: dismissed on click and hidden", async ({ page, context }) => {
    await context.addInitScript(() => {
      try {
        localStorage.removeItem('sive:whatsnew:3.1.0');
      } catch { /* ignore */ }
    });
    await page.goto('/app');
    const banner = page.locator('[data-testid="whats-new-banner"]');
    await expect(banner).toBeVisible();
    await page.locator('[data-testid="whats-new-dismiss"]').click();
    await expect(banner).not.toBeVisible();
  });

  test("what's new banner: stays dismissed after reload", async ({ page }) => {
    // Load page first, then clear key via evaluate (not addInitScript which runs on every nav)
    await page.goto('/app');
    await page.evaluate(() => localStorage.removeItem('sive:whatsnew:3.1.0'));
    await page.reload();
    await expect(page.locator('[data-testid="whats-new-banner"]')).toBeVisible();
    await page.locator('[data-testid="whats-new-dismiss"]').click();
    // Reload without clearing localStorage — dismiss must persist
    await page.reload();
    await expect(page.locator('[data-testid="whats-new-banner"]')).not.toBeVisible();
  });
});
