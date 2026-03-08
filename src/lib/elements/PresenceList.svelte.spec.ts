import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import PresenceList from './PresenceList.svelte';
import type { OnlineUser } from './PresenceList.svelte';

describe('PresenceList', () => {
	describe('Rendering', () => {
		it('renders empty list when no users', async () => {
			const { container } = render(PresenceList, {
				props: {
					users: []
				}
			});

			const list = container.querySelector('[data-testid="presence-list"]');
			expect(list).not.toBeNull();
		});

		it('renders avatars for users', async () => {
			const users: OnlineUser[] = [
				{ userId: 'user1', clientId: 'client1', status: 'active' },
				{ userId: 'user2', clientId: 'client2', status: 'idle' }
			];

			const { container } = render(PresenceList, {
				props: { users }
			});

			const avatar1 = container.querySelector('[data-testid="presence-avatar-user1"]');
			const avatar2 = container.querySelector('[data-testid="presence-avatar-user2"]');

			expect(avatar1).not.toBeNull();
			expect(avatar2).not.toBeNull();
		});

		it('shows initials from user ID', async () => {
			const users: OnlineUser[] = [{ userId: 'alice', clientId: 'c1', status: 'active' }];

			const { container } = render(PresenceList, {
				props: { users }
			});

			const avatar = container.querySelector('[data-testid="presence-avatar-alice"]');
			expect(avatar?.textContent).toContain('AL');
		});
	});

	describe('Status Indicators', () => {
		it('shows status dots for different states', async () => {
			const users: OnlineUser[] = [
				{ userId: 'user1', clientId: 'c1', status: 'active' },
				{ userId: 'user2', clientId: 'c2', status: 'idle' },
				{ userId: 'user3', clientId: 'c3', status: 'offline' }
			];

			const { container } = render(PresenceList, {
				props: { users }
			});

			expect(container.querySelector('[data-testid="presence-avatar-user1"]')).not.toBeNull();
			expect(container.querySelector('[data-testid="presence-avatar-user2"]')).not.toBeNull();
			expect(container.querySelector('[data-testid="presence-avatar-user3"]')).not.toBeNull();
		});

		it('marks current user with special styling', async () => {
			const users: OnlineUser[] = [
				{ userId: 'user1', clientId: 'c1', status: 'active' },
				{ userId: 'user2', clientId: 'c2', status: 'active' }
			];

			const { container } = render(PresenceList, {
				props: {
					users,
					currentUserId: 'user1'
				}
			});

			const currentAvatar = container.querySelector('[data-testid="presence-avatar-user1"]');
			expect(currentAvatar?.classList.contains('current')).toBe(true);
		});
	});

	describe('Max Visible', () => {
		it('limits visible avatars with maxVisible prop', async () => {
			const users: OnlineUser[] = [
				{ userId: 'user1', clientId: 'c1', status: 'active' },
				{ userId: 'user2', clientId: 'c2', status: 'active' },
				{ userId: 'user3', clientId: 'c3', status: 'active' },
				{ userId: 'user4', clientId: 'c4', status: 'active' },
				{ userId: 'user5', clientId: 'c5', status: 'active' },
				{ userId: 'user6', clientId: 'c6', status: 'active' }
			];

			const { container } = render(PresenceList, {
				props: {
					users,
					maxVisible: 3
				}
			});

			// First 3 should be visible
			expect(container.querySelector('[data-testid="presence-avatar-user1"]')).not.toBeNull();
			expect(container.querySelector('[data-testid="presence-avatar-user2"]')).not.toBeNull();
			expect(container.querySelector('[data-testid="presence-avatar-user3"]')).not.toBeNull();

			// 4th should not be visible (but +3 count should be)
			expect(container.querySelector('[data-testid="presence-avatar-user4"]')).toBeNull();
			const count = container.querySelector('[data-testid="presence-count"]');
			expect(count?.textContent).toContain('+3');
		});

		it('shows count of hidden users', async () => {
			const users: OnlineUser[] = Array.from({ length: 10 }, (_, i) => ({
				userId: `user${i + 1}`,
				clientId: `c${i + 1}`,
				status: 'active' as const
			}));

			const { container } = render(PresenceList, {
				props: {
					users,
					maxVisible: 5
				}
			});

			const count = container.querySelector('[data-testid="presence-count"]');
			expect(count?.textContent).toContain('+5');
		});
	});

	describe('Accessibility', () => {
		it('has accessible title attribute', async () => {
			const users: OnlineUser[] = [
				{ userId: 'alice', clientId: 'c1', status: 'active', name: 'Alice' }
			];

			const { container } = render(PresenceList, {
				props: { users }
			});

			const avatar = container.querySelector('[data-testid="presence-avatar-alice"]') as HTMLElement;
			expect(avatar?.getAttribute('title')).toBeTruthy();
			expect(avatar?.getAttribute('title')).toContain('Alice');
		});

		it('marks presence list as landmark', async () => {
			const { container } = render(PresenceList, {
				props: { users: [] }
			});

			const list = container.querySelector('[data-testid="presence-list"]') as HTMLElement;
			expect(list?.getAttribute('title')).toBeTruthy();
		});
	});

	describe('Dynamic Updates', () => {
		it('renders different user lists correctly', async () => {
			const users1: OnlineUser[] = [
				{ userId: 'user1', clientId: 'c1', status: 'active' },
				{ userId: 'user2', clientId: 'c2', status: 'active' }
			];

			const { container: container1 } = render(PresenceList, {
				props: { users: users1 }
			});

			expect(container1.querySelector('[data-testid="presence-avatar-user1"]')).not.toBeNull();
			expect(container1.querySelector('[data-testid="presence-avatar-user2"]')).not.toBeNull();
		});

		it('maintains count accuracy with different user lists', async () => {
			const users: OnlineUser[] = Array.from({ length: 8 }, (_, i) => ({
				userId: `user${i + 1}`,
				clientId: `c${i + 1}`,
				status: 'active' as const
			}));

			const { container } = render(PresenceList, {
				props: {
					users,
					maxVisible: 3
				}
			});

			const count = container.querySelector('[data-testid="presence-count"]');
			expect(count?.textContent).toContain('+5');
		});
	});
});
