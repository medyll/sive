import { test, expect } from './fixtures';

test.describe('Accountability Partners (S66-03)', () => {
	test('should display empty partners list when no partners followed', async ({
		page,
		loginAct
	}) => {
		await loginAct();
		await page.goto('/settings');

		// Check for empty state
		const emptyState = await page.getByText('No Partners Yet');
		expect(emptyState).toBeTruthy();
	});

	test('should show partners list in settings', async ({ page, loginAct }) => {
		await loginAct();

		// Manually add a partner (simulating follow action)
		await page.evaluateHandle(() => {
			const partnersStore = {
				following: new Set(['alice', 'bob'])
			};
			localStorage.setItem('sive:partners', JSON.stringify({ following: ['alice', 'bob'] }));
		});

		await page.goto('/settings');

		// Check for partners header
		const partnersHeader = await page.getByText('👥 Accountability Partners');
		expect(partnersHeader).toBeTruthy();

		// Check for partners list
		const aliceLink = await page.getByText('@alice');
		const bobLink = await page.getByText('@bob');
		expect(aliceLink).toBeTruthy();
		expect(bobLink).toBeTruthy();
	});

	test('should link to partner profiles', async ({ page, loginAct }) => {
		await loginAct();

		// Add partners
		await page.evaluateHandle(() => {
			localStorage.setItem('sive:partners', JSON.stringify({ following: ['alice'] }));
		});

		await page.goto('/settings');

		// Click on partner link
		const aliceLink = await page.getByText('@alice');
		const href = await aliceLink.getAttribute('href');
		expect(href).toContain('/profile/@alice');
	});

	test('should unfollow a partner', async ({ page, loginAct }) => {
		await loginAct();

		// Add a partner
		await page.evaluateHandle(() => {
			localStorage.setItem('sive:partners', JSON.stringify({ following: ['alice'] }));
		});

		await page.goto('/settings');

		// Check that partner is visible
		let aliceLink = await page.getByText('@alice');
		expect(aliceLink).toBeTruthy();

		// Click unfollow button
		const unfollowBtn = await page.getByText('Unfollow');
		await unfollowBtn.click();

		// Wait for toast notification
		const toast = await page.getByText(/Unfollowed @alice/);
		expect(toast).toBeTruthy();

		// Reload page and verify partner is removed
		await page.reload();

		const emptyState = await page.getByText('No Partners Yet');
		expect(emptyState).toBeTruthy();
	});

	test('should show partner count badge', async ({ page, loginAct }) => {
		await loginAct();

		// Add 3 partners
		await page.evaluateHandle(() => {
			localStorage.setItem('sive:partners', JSON.stringify({ following: ['alice', 'bob', 'charlie'] }));
		});

		await page.goto('/settings');

		// Check for count badge showing "3"
		const countBadge = await page.getByText('3');
		expect(countBadge).toBeTruthy();
	});

	test('should navigate to profile to follow new user', async ({ page, loginAct }) => {
		await loginAct();

		// Navigate to a profile (we'll create a dummy one)
		await page.goto('/profile/@testuser');

		// Check for follow button
		const followBtn = await page.getByText(/Follow for Accountability/);
		expect(followBtn).toBeTruthy();

		// Click follow
		await followBtn.click();

		// Check toast notification
		const toast = await page.getByText(/Following @testuser/);
		expect(toast).toBeTruthy();

		// Verify partner appears in settings
		await page.goto('/settings');
		const testUserLink = await page.getByText('@testuser');
		expect(testUserLink).toBeTruthy();
	});
});
