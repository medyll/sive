import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import UserProfileCard from './UserProfileCard.svelte';

describe('UserProfileCard', () => {
	it('renders profile card', async () => {
		render(UserProfileCard);
		await expect.element(page.container).toBeVisible();
	});

	it('has profile header', () => {
		render(UserProfileCard);
		const header = page.container.querySelector('.profile-header');
		expect(header).not.toBeNull();
	});

	it('has stats grid', () => {
		render(UserProfileCard);
		const grid = page.container.querySelector('.stats-grid');
		expect(grid).not.toBeNull();
	});

	it('has stat cards', () => {
		render(UserProfileCard);
		const cards = page.container.querySelectorAll('.stat-card');
		expect(cards.length).toBeGreaterThan(0);
	});

	it('shows edit button when editable', async () => {
		const onEditClick = () => {};
		render(UserProfileCard, { props: { editable: true, onEditClick } });
		const btn = page.container.querySelector('.btn-edit');
		expect(btn).not.toBeNull();
	});

	it('hides edit button when not editable', () => {
		render(UserProfileCard, { props: { editable: false } });
		const btn = page.container.querySelector('.btn-edit');
		expect(btn).toBeNull();
	});

	it('has visibility badge', () => {
		render(UserProfileCard);
		const badge = page.container.querySelector('.visibility-badge');
		expect(badge).not.toBeNull();
	});

	it('has profile avatar', () => {
		render(UserProfileCard);
		const avatar = page.container.querySelector('.profile-avatar');
		expect(avatar).not.toBeNull();
	});
});
