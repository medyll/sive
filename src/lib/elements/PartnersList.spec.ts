import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from 'vitest-browser-react';
import PartnersList from './PartnersList.svelte';
import { partnersStore } from '$lib/partnersStore.svelte';
import { toastStore } from '$lib/toastStore.svelte';

// Mock stores
vi.mock('$lib/partnersStore.svelte', () => ({
	partnersStore: {
		follow: vi.fn(),
		unfollow: vi.fn(),
		isFollowing: vi.fn(),
		getFollowing: vi.fn(() => []),
		followingCount: 0,
		reset: vi.fn()
	}
}));

vi.mock('$lib/toastStore.svelte', () => ({
	toastStore: {
		success: vi.fn(),
		error: vi.fn()
	}
}));

describe('PartnersList Component', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should display empty state when no partners', () => {
		const { container } = render(PartnersList);

		expect(screen.getByText('No Partners Yet')).toBeTruthy();
		expect(screen.getByText(/Start following writers/)).toBeTruthy();
	});

	it('should display partners header with count', () => {
		vi.mocked(partnersStore.getFollowing).mockReturnValue(['alice', 'bob']);
		// @ts-ignore
		partnersStore.followingCount = 2;

		const { container } = render(PartnersList);

		expect(screen.getByText('👥 Accountability Partners')).toBeTruthy();
		expect(screen.getByText('2')).toBeTruthy();
	});

	it('should display list of partners', () => {
		vi.mocked(partnersStore.getFollowing).mockReturnValue(['alice', 'bob', 'charlie']);
		// @ts-ignore
		partnersStore.followingCount = 3;

		const { container } = render(PartnersList);

		expect(screen.getByText('@alice')).toBeTruthy();
		expect(screen.getByText('@bob')).toBeTruthy();
		expect(screen.getByText('@charlie')).toBeTruthy();
	});

	it('should link to partner profiles', () => {
		vi.mocked(partnersStore.getFollowing).mockReturnValue(['alice']);
		// @ts-ignore
		partnersStore.followingCount = 1;

		const { container } = render(PartnersList);

		const link = screen.getByText('@alice') as HTMLAnchorElement;
		expect(link.href).toContain('/profile/@alice');
	});

	it('should call unfollow when unfollow button clicked', () => {
		vi.mocked(partnersStore.getFollowing).mockReturnValue(['alice']);
		// @ts-ignore
		partnersStore.followingCount = 1;

		const { container } = render(PartnersList);

		const unfollowButton = screen.getByText('Unfollow');
		unfollowButton.click();

		expect(partnersStore.unfollow).toHaveBeenCalledWith('alice');
	});

	it('should show toast notification on unfollow', () => {
		vi.mocked(partnersStore.getFollowing).mockReturnValue(['alice']);
		// @ts-ignore
		partnersStore.followingCount = 1;

		const { container } = render(PartnersList);

		const unfollowButton = screen.getByText('Unfollow');
		unfollowButton.click();

		expect(toastStore.success).toHaveBeenCalledWith('Unfollowed @alice');
	});

	it('should display partner cards in responsive grid', () => {
		vi.mocked(partnersStore.getFollowing).mockReturnValue(['alice', 'bob']);
		// @ts-ignore
		partnersStore.followingCount = 2;

		const { container } = render(PartnersList);

		// Check that partner-card elements exist
		const partnerCards = container.querySelectorAll('.partner-card');
		expect(partnerCards).toHaveLength(2);
	});
});
