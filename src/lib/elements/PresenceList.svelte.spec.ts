import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import PresenceList from './PresenceList.svelte';
import type { OnlineUser } from './PresenceList.svelte';

describe('PresenceList', () => {
	it('renders empty list', async () => {
		const { container } = render(PresenceList, { props: { users: [] } });
		const list = container.querySelector('[data-testid="presence-list"]');
		expect(list).not.toBeNull();
	});

	it('renders avatars for users', async () => {
		const users: OnlineUser[] = [
			{ userId: 'user1', clientId: 'c1', status: 'active' },
			{ userId: 'user2', clientId: 'c2', status: 'idle' }
		];
		const { container } = render(PresenceList, { props: { users } });
		expect(container.querySelector('[data-testid="presence-avatar-user1"]')).not.toBeNull();
		expect(container.querySelector('[data-testid="presence-avatar-user2"]')).not.toBeNull();
	});

	it('shows initials from user ID', async () => {
		const users: OnlineUser[] = [{ userId: 'alice', clientId: 'c1', status: 'active' }];
		const { container } = render(PresenceList, { props: { users } });
		const avatar = container.querySelector('[data-testid="presence-avatar-alice"]');
		expect(avatar?.textContent).toContain('AL');
	});

	it('marks current user with special styling', async () => {
		const users: OnlineUser[] = [
			{ userId: 'user1', clientId: 'c1', status: 'active' },
			{ userId: 'user2', clientId: 'c2', status: 'active' }
		];
		const { container } = render(PresenceList, { props: { users, currentUserId: 'user1' } });
		const avatar = container.querySelector('[data-testid="presence-avatar-user1"]');
		expect(avatar?.classList.contains('current')).toBe(true);
	});

	it('limits visible avatars with maxVisible prop', async () => {
		const users: OnlineUser[] = Array.from({ length: 6 }, (_, i) => ({
			userId: `user${i + 1}`,
			clientId: `c${i + 1}`,
			status: 'active' as const
		}));
		const { container } = render(PresenceList, { props: { users, maxVisible: 3 } });
		expect(container.querySelector('[data-testid="presence-avatar-user1"]')).not.toBeNull();
		expect(container.querySelector('[data-testid="presence-avatar-user4"]')).toBeNull();
	});

	it('shows count of hidden users', async () => {
		const users: OnlineUser[] = Array.from({ length: 8 }, (_, i) => ({
			userId: `user${i + 1}`,
			clientId: `c${i + 1}`,
			status: 'active' as const
		}));
		const { container } = render(PresenceList, { props: { users, maxVisible: 3 } });
		const count = container.querySelector('[data-testid="presence-count"]');
		expect(count?.textContent).toContain('+5');
	});

	it('has accessible title attributes', async () => {
		const users: OnlineUser[] = [
			{ userId: 'alice', clientId: 'c1', status: 'active', name: 'Alice' }
		];
		const { container } = render(PresenceList, { props: { users } });
		const avatar = container.querySelector('[data-testid="presence-avatar-alice"]') as HTMLElement;
		expect(avatar?.getAttribute('title')).toBeTruthy();
	});

	it('renders different user lists', async () => {
		const users1: OnlineUser[] = [{ userId: 'user1', clientId: 'c1', status: 'active' }];
		const { container: c1 } = render(PresenceList, { props: { users: users1 } });
		expect(c1.querySelector('[data-testid="presence-avatar-user1"]')).not.toBeNull();
	});

	it('handles offline status', async () => {
		const users: OnlineUser[] = [
			{ userId: 'user1', clientId: 'c1', status: 'offline' }
		];
		const { container } = render(PresenceList, { props: { users } });
		expect(container.querySelector('[data-testid="presence-avatar-user1"]')).not.toBeNull();
	});

	it('maintains count accuracy', async () => {
		const users: OnlineUser[] = Array.from({ length: 10 }, (_, i) => ({
			userId: `user${i + 1}`,
			clientId: `c${i + 1}`,
			status: 'active' as const
		}));
		const { container } = render(PresenceList, { props: { users, maxVisible: 3 } });
		const count = container.querySelector('[data-testid="presence-count"]');
		expect(count?.textContent).toContain('+7');
	});

	it('renders with multiple statuses', async () => {
		const users: OnlineUser[] = [
			{ userId: 'user1', clientId: 'c1', status: 'active' },
			{ userId: 'user2', clientId: 'c2', status: 'idle' },
			{ userId: 'user3', clientId: 'c3', status: 'offline' }
		];
		const { container } = render(PresenceList, { props: { users } });
		expect(container.querySelector('[data-testid="presence-avatar-user1"]')).not.toBeNull();
		expect(container.querySelector('[data-testid="presence-avatar-user2"]')).not.toBeNull();
		expect(container.querySelector('[data-testid="presence-avatar-user3"]')).not.toBeNull();
	});
});
