import { expect, test } from '@playwright/test';

test.describe('Harden flow — /app', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/app');
	});

	test('clicking 💾 New version opens the HardenModal', async ({ page }) => {
		await page.getByRole('button', { name: '💾 New version' }).click();
		await expect(page.getByRole('dialog')).toBeVisible();
	});

	test('modal has label input and message textarea', async ({ page }) => {
		await page.getByRole('button', { name: '💾 New version' }).click();
		await expect(page.getByRole('textbox', { name: /version label/i })).toBeVisible();
		await expect(page.getByRole('textbox', { name: /description/i })).toBeVisible();
	});

	test('Confirm button is disabled when label is empty', async ({ page }) => {
		await page.getByRole('button', { name: '💾 New version' }).click();
		await expect(page.getByRole('button', { name: 'Confirm' })).toBeDisabled();
	});

	test('clicking Cancel closes the modal without adding an entry', async ({ page }) => {
		await page.getByRole('button', { name: '💾 New version' }).click();
		await page.getByRole('button', { name: 'Cancel' }).click();
		await expect(page.getByRole('dialog')).not.toBeVisible();
	});

	test('confirming a Harden adds it to the History tab timeline', async ({ page }) => {
		// Open modal and create a new version
		await page.getByRole('button', { name: '💾 New version' }).click();
		await page.getByRole('textbox', { name: /version label/i }).fill('test_sprint4');
		await page.getByRole('textbox', { name: /description/i }).fill('Sprint 4 E2E test version');
		await page.getByRole('button', { name: 'Confirm' }).click();

		// Modal should be closed
		await expect(page.getByRole('dialog')).not.toBeVisible();

		// Switch to History tab and verify new entry
		await page.getByRole('button', { name: 'History' }).click();
		await expect(page.getByRole('button', { name: /test_sprint4/ })).toBeVisible();
	});

	test('History tab shows stub Harden timeline points by default', async ({ page }) => {
		await page.getByRole('button', { name: 'History' }).click();
		await expect(page.getByRole('button', { name: /incipit/ })).toBeVisible();
		await expect(page.getByRole('button', { name: /end_act_1/ })).toBeVisible();
	});

	test('diff controls are visible in History tab', async ({ page }) => {
		await page.getByRole('button', { name: 'History' }).click();
		await expect(page.getByRole('button', { name: 'View differences' })).toBeVisible();
		await expect(page.getByRole('combobox', { name: 'Version A' })).toBeVisible();
		await expect(page.getByRole('combobox', { name: 'Version B' })).toBeVisible();
	});

	test('View differences is disabled until both versions are selected', async ({ page }) => {
		await page.getByRole('button', { name: 'History' }).click();
		await expect(page.getByRole('button', { name: 'View differences' })).toBeDisabled();

		await page.getByRole('combobox', { name: 'Version A' }).selectOption('h001');
		await expect(page.getByRole('button', { name: 'View differences' })).toBeDisabled();

		await page.getByRole('combobox', { name: 'Version B' }).selectOption('h002');
		await expect(page.getByRole('button', { name: 'View differences' })).not.toBeDisabled();
	});

	test('clicking View differences shows the diff panel', async ({ page }) => {
		await page.getByRole('button', { name: 'History' }).click();
		await page.getByRole('combobox', { name: 'Version A' }).selectOption('h001');
		await page.getByRole('combobox', { name: 'Version B' }).selectOption('h002');
		await page.getByRole('button', { name: 'View differences' }).click();
		await expect(page.getByRole('region', { name: 'Version diff' })).toBeVisible();
	});
});
