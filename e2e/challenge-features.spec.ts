import { test, expect } from '@playwright/test';

test.describe('Challenge Features', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/challenges');
		await page.setViewportSize({ width: 1366, height: 900 });
	});

	test('create challenge from challenges page', async ({ page }) => {
		// Click create button
		const createBtn = page.getByText('+ Create');
		await createBtn.click();

		// Fill create challenge form
		await page.getByLabel('Title').fill('NaNoWriMo Challenge');
		await page.getByLabel('Description').fill('Write 50,000 words in November');
		await page.getByLabel('Target Words').fill('50000');
		await page.getByLabel('Duration (days)').fill('30');

		// Submit form
		const submitBtn = page.getByText('Create Challenge');
		await submitBtn.click();

		// Verify challenge created
		await expect(page.getByText('NaNoWriMo Challenge')).toBeVisible();
	});

	test('join challenge from card', async ({ page }) => {
		// Create a challenge first
		const createBtn = page.getByText('+ Create');
		await createBtn.click();
		await page.getByLabel('Title').fill('Test Challenge');
		await page.getByLabel('Target Words').fill('10000');
		await page.getByLabel('Duration (days)').fill('7');
		await page.getByText('Create Challenge').click();

		// Join the challenge
		const joinBtn = page.getByText('+ Join Challenge').first();
		await joinBtn.click();

		// Verify joined status
		await expect(page.getByText('✓ Joined')).toBeVisible();
	});

	test('leave challenge', async ({ page }) => {
		// Create and join a challenge
		const createBtn = page.getByText('+ Create');
		await createBtn.click();
		await page.getByLabel('Title').fill('Leave Test');
		await page.getByLabel('Target Words').fill('5000');
		await page.getByLabel('Duration (days)').fill('5');
		await page.getByText('Create Challenge').click();

		await page.getByText('+ Join Challenge').first().click();
		await expect(page.getByText('✓ Joined')).toBeVisible();

		// Leave the challenge
		const leaveBtn = page.getByText('✓ Joined').first();
		await leaveBtn.click();

		// Verify left status
		await expect(page.getByText('+ Join Challenge')).toBeVisible();
	});

	test('challenge progress updates on write', async ({ page }) => {
		// Create and join a challenge
		const createBtn = page.getByText('+ Create');
		await createBtn.click();
		await page.getByLabel('Title').fill('Progress Test');
		await page.getByLabel('Target Words').fill('1000');
		await page.getByLabel('Duration (days)').fill('7');
		await page.getByText('Create Challenge').click();
		await page.getByText('+ Join Challenge').first().click();

		// Navigate to editor and write
		await page.goto('/');
		const editor = page.locator('.editor-textarea');
		await editor.fill('Test content with some words');

		// Wait for save
		await page.waitForTimeout(2500);

		// Check challenge progress
		await page.goto('/challenges');
		await page.getByText('Joined (1)').click();
		
		// Progress should show some words
		const progressText = page.locator('.progress-label').first();
		await expect(progressText).toBeVisible();
	});

	test('challenge list filtering (active/joined tabs)', async ({ page }) => {
		// Create a challenge
		const createBtn = page.getByText('+ Create');
		await createBtn.click();
		await page.getByLabel('Title').fill('Filter Test');
		await page.getByLabel('Target Words').fill('5000');
		await page.getByLabel('Duration (days)').fill('7');
		await page.getByText('Create Challenge').click();

		// Verify All Active tab shows challenge
		await expect(page.getByText('Filter Test')).toBeVisible();

		// Join the challenge
		await page.getByText('+ Join Challenge').click();

		// Switch to Joined tab
		const joinedTab = page.getByText(/Joined \(\d+\)/);
		await joinedTab.click();

		// Verify challenge shows in joined tab
		await expect(page.getByText('Filter Test')).toBeVisible();

		// Switch back to All Active tab
		const activeTab = page.getByText('All Active');
		await activeTab.click();

		// Verify challenge still shows
		await expect(page.getByText('Filter Test')).toBeVisible();
	});

	test('challenge deadline notification appears', async ({ page }) => {
		// Create a short challenge (1 day)
		const createBtn = page.getByText('+ Create');
		await createBtn.click();
		await page.getByLabel('Title').fill('Urgent Challenge');
		await page.getByLabel('Target Words').fill('1000');
		await page.getByLabel('Duration (days)').fill('1');
		await page.getByText('Create Challenge').click();
		await page.getByText('+ Join Challenge').first().click();

		// Navigate away and back to trigger notification check
		await page.goto('/dashboard');
		await page.goto('/challenges');

		// Check for notification bell (notification should be queued)
		const notificationBell = page.locator('.bell-btn');
		await expect(notificationBell).toBeVisible();
	});

	test('challenge card shows days left', async ({ page }) => {
		// Create a challenge
		const createBtn = page.getByText('+ Create');
		await createBtn.click();
		await page.getByLabel('Title').fill('Days Left Test');
		await page.getByLabel('Target Words').fill('5000');
		await page.getByLabel('Duration (days)').fill('14');
		await page.getByText('Create Challenge').click();

		// Verify days left displayed
		const daysLeft = page.getByText(/d left/).first();
		await expect(daysLeft).toBeVisible();
	});

	test('challenge progress bar visible when joined', async ({ page }) => {
		// Create and join a challenge
		const createBtn = page.getByText('+ Create');
		await createBtn.click();
		await page.getByLabel('Title').fill('Progress Bar Test');
		await page.getByLabel('Target Words').fill('10000');
		await page.getByLabel('Duration (days)').fill('30');
		await page.getByText('Create Challenge').click();
		await page.getByText('+ Join Challenge').first().click();

		// Verify progress bar visible
		const progressBar = page.locator('.progress-bar').first();
		await expect(progressBar).toBeVisible();
	});

	test('challenge word count formatted with commas', async ({ page }) => {
		// Create a challenge with large word count
		const createBtn = page.getByText('+ Create');
		await createBtn.click();
		await page.getByLabel('Title').fill('Big Challenge');
		await page.getByLabel('Target Words').fill('100000');
		await page.getByLabel('Duration (days)').fill('90');
		await page.getByText('Create Challenge').click();

		// Verify formatted number
		await expect(page.getByText('100,000')).toBeVisible();
	});
});
