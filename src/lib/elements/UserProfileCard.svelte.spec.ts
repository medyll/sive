import { describe, it, expect, beforeEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import UserProfileCard from './UserProfileCard.svelte';
import { userProfileStore } from '$lib/userProfileStore.svelte';
import { goalsStore } from '$lib/writingGoalsStore.svelte';
import { badgesStore } from '$lib/badgesStore.svelte';
import { weeklyGoalsStore } from '$lib/weeklyGoalsStore.svelte';

describe('UserProfileCard', () => {
	beforeEach(() => {
		userProfileStore.reset();
		goalsStore.reset();
		badgesStore.reset();
		weeklyGoalsStore.reset();
	});

	it('renders profile card component', () => {
		const { container } = render(UserProfileCard);
		expect(container.querySelector('.profile-card')).not.toBeNull();
	});

	it('has profile header', () => {
		const { container } = render(UserProfileCard);
		const header = container.querySelector('.profile-header');
		expect(header).not.toBeNull();
	});

	it('has profile avatar', () => {
		const { container } = render(UserProfileCard);
		const avatar = container.querySelector('.profile-avatar');
		expect(avatar).not.toBeNull();
	});

	it('displays avatar emoji', () => {
		const { container } = render(UserProfileCard);
		const emoji = container.querySelector('.avatar-emoji');
		expect(emoji).not.toBeNull();
		expect(emoji?.textContent).toBe('✍️');
	});

	it('has profile name element', () => {
		const { container } = render(UserProfileCard);
		const name = container.querySelector('.profile-name');
		expect(name).not.toBeNull();
	});

	it('has visibility badge', () => {
		const { container } = render(UserProfileCard);
		const badge = container.querySelector('.visibility-badge');
		expect(badge).not.toBeNull();
	});

	it('has stats grid', () => {
		const { container } = render(UserProfileCard);
		const grid = container.querySelector('.stats-grid');
		expect(grid).not.toBeNull();
	});

	it('has stat cards', () => {
		const { container } = render(UserProfileCard);
		const cards = container.querySelectorAll('.stat-card');
		expect(cards.length).toBeGreaterThan(0);
	});

	it('displays current streak stat', () => {
		const { container } = render(UserProfileCard);
		const streakLabel = container.querySelector('.stat-label');
		expect(streakLabel?.textContent).toContain('Streak');
	});

	it('shows edit button when editable', () => {
		const onEditClick = () => {};
		const { container } = render(UserProfileCard, { props: { editable: true, onEditClick } });
		
		const editBtn = container.querySelector('.btn-edit');
		expect(editBtn).not.toBeNull();
		expect(editBtn?.getAttribute('aria-label')).toBe('Edit profile');
	});

	it('hides edit button when not editable', () => {
		const { container } = render(UserProfileCard, { props: { editable: false } });
		
		const editBtn = container.querySelector('.btn-edit');
		expect(editBtn).toBeNull();
	});

	it('has stat icons', () => {
		const { container } = render(UserProfileCard);
		const icons = container.querySelectorAll('.stat-icon');
		expect(icons.length).toBeGreaterThan(0);
	});

	it('has stat values', () => {
		const { container } = render(UserProfileCard);
		const values = container.querySelectorAll('.stat-value');
		expect(values.length).toBeGreaterThan(0);
	});

	it('renders without errors with default props', () => {
		const { container } = render(UserProfileCard);
		expect(container.querySelector('.profile-card')).not.toBeNull();
	});

	it('has profile info container', () => {
		const { container } = render(UserProfileCard);
		const info = container.querySelector('.profile-info');
		expect(info).not.toBeNull();
	});

	it('has stat labels', () => {
		const { container } = render(UserProfileCard);
		const labels = container.querySelectorAll('.stat-label');
		expect(labels.length).toBeGreaterThan(0);
	});

	it('has stat sublabels', () => {
		const { container } = render(UserProfileCard);
		const sublabels = container.querySelectorAll('.stat-sublabel');
		expect(sublabels.length).toBeGreaterThan(0);
	});
});
