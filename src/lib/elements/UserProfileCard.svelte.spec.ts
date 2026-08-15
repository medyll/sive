import { describe, it, expect, beforeEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import UserProfileCard from './UserProfileCard.svelte';
import { userProfileStore } from '$lib/userProfileStore.svelte';

describe('UserProfileCard', () => {
	beforeEach(() => {
		userProfileStore.reset();
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

	it('renders without errors with default props', () => {
		const { container } = render(UserProfileCard);
		expect(container.querySelector('.profile-card')).not.toBeNull();
	});

	it('has profile info container', () => {
		const { container } = render(UserProfileCard);
		const info = container.querySelector('.profile-info');
		expect(info).not.toBeNull();
	});

});
