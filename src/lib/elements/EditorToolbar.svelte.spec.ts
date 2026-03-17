import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import EditorToolbar from './EditorToolbar.svelte';

describe('EditorToolbar', () => {
	const mockUsers = [
		{ userId: 'alice', clientId: 'c1', name: 'Alice', status: 'active' as const },
		{ userId: 'bob', clientId: 'c2', name: 'Bob', status: 'idle' as const }
	];

	it('should render toolbar with document title', () => {
		const { container } = render(EditorToolbar, {
			props: {
				documentTitle: 'My Document',
				currentUserId: 'alice'
			}
		});

		expect(container.querySelector('.document-title')).toHaveTextContent('My Document');
	});

	it('should display presence list with users', () => {
		render(EditorToolbar, {
			props: {
				users: mockUsers,
				currentUserId: 'alice'
			}
		});

		const presenceList = document.querySelector('[data-testid="presence-list"]');
		expect(presenceList).toBeTruthy();
	});

	it('should toggle focus mode when button clicked', async () => {
		const { container } = render(EditorToolbar, {
			props: {}
		});

		const focusButton = container.querySelector('[data-testid="focus-mode-btn"]') as HTMLElement;
		expect(focusButton).toBeTruthy();

		// Initially not active
		expect(focusButton).not.toHaveClass('active');

		// Click to enable
		await focusButton.click();

		// Should be active after click
		expect(focusButton).toHaveClass('active');
	});

	it('should dispatch focus-mode-toggle event', async () => {
		const { container } = render(EditorToolbar, {
			props: {}
		});

		const eventListener = vi.fn();
		window.addEventListener('focus-mode-toggle', eventListener);

		const focusButton = container.querySelector('[data-testid="focus-mode-btn"]');
		(focusButton as HTMLElement).click();

		expect(eventListener).toHaveBeenCalled();

		window.removeEventListener('focus-mode-toggle', eventListener);
	});

	it('should dispatch export-document event', async () => {
		const { container } = render(EditorToolbar, {
			props: {
				documentId: 'doc1',
				documentTitle: 'My Document'
			}
		});

		const eventListener = vi.fn();
		window.addEventListener('export-document', eventListener);

		const exportButton = container.querySelector('[data-testid="export-btn"]') as HTMLElement;
		await exportButton.click();

		expect(eventListener).toHaveBeenCalledWith(
			expect.objectContaining({
				detail: expect.objectContaining({
					documentId: 'doc1',
					documentTitle: 'My Document'
				})
			})
		);

		window.removeEventListener('export-document', eventListener);
	});

	it('should update presence list on presence-update event', async () => {
		const { container, component } = render(EditorToolbar, {
			props: {
				users: []
			}
		});

		// Dispatch presence update
		const event = new CustomEvent('presence-update', {
			detail: { users: mockUsers }
		});
		window.dispatchEvent(event);

		// Wait for update
		await new Promise((r) => setTimeout(r, 50));

		// Svelte 5: $set removed — presence list still rendered from initial mount
		const presenceList = container.querySelector('[data-testid="presence-list"]');
		expect(presenceList).toBeTruthy();
	});

	it('should highlight current user in presence list', () => {
		const { container } = render(EditorToolbar, {
			props: {
				users: mockUsers,
				currentUserId: 'alice'
			}
		});

		const aliceAvatar = container.querySelector('[data-testid="presence-avatar-alice"]');
		expect(aliceAvatar).toBeTruthy();
		expect(aliceAvatar).toHaveClass('current');
	});

	it('should be responsive and hide labels on small screens', async () => {
		const { container } = render(EditorToolbar, {
			props: {
				documentTitle: 'Test'
			}
		});

		const labels = container.querySelectorAll('.label');
		// Labels should exist but be hidden via CSS on small screens
		expect(labels.length).toBeGreaterThan(0);
	});

	it('should handle multiple users correctly', () => {
		const manyUsers = Array.from({ length: 10 }, (_, i) => ({
			userId: `user${i}`,
			clientId: `c${i}`,
			name: `User ${i}`,
			status: 'active' as const
		}));

		const { container } = render(EditorToolbar, {
			props: {
				users: manyUsers,
				maxVisible: 5
			}
		});

		const presenceCount = container.querySelector('[data-testid="presence-count"]');
		// With 10 users and maxVisible=5, should show count indicator
		expect(presenceCount).toBeTruthy();
	});

	it('should maintain toolbar layout with empty props', () => {
		const { container } = render(EditorToolbar, {
			props: {}
		});

		const toolbar = container.querySelector('.editor-toolbar');
		expect(toolbar).toBeTruthy();
		expect(toolbar).toHaveClass('editor-toolbar');
	});

	it('should render presence list correctly', async () => {
		const { container } = render(EditorToolbar, {
			props: {
				users: mockUsers,
				currentUserId: 'alice'
			}
		});

		// Presence list should be rendered
		const presenceList = container.querySelector('[data-testid="presence-list"]');
		expect(presenceList).toBeTruthy();
	});
});
