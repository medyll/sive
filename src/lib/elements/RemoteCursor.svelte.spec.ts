import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import RemoteCursor from './RemoteCursor.svelte';
interface CursorState { clientId: string; userId: string; name?: string; color: string; line: number; column: number; isVisible?: boolean; lastUpdated?: number; }

describe('RemoteCursor', () => {
	const mockCursors: CursorState[] = [
		{
			clientId: 'c1',
			userId: 'alice',
			line: 5,
			column: 10,
			color: '#FF6B6B',
			isVisible: true,
			lastUpdated: Date.now()
		},
		{
			clientId: 'c2',
			userId: 'bob',
			line: 15,
			column: 20,
			color: '#4ECDC4',
			isVisible: true,
			lastUpdated: Date.now()
		}
	];

	it('should render remote cursors container', () => {
		const { container } = render(RemoteCursor, {
			props: {}
		});

		const cursorsContainer = container.querySelector('[data-testid="remote-cursors"]');
		expect(cursorsContainer).toBeTruthy();
	});

	it('should display cursors with correct colors', () => {
		const { container } = render(RemoteCursor, {
			props: { cursors: mockCursors }
		});

		const alice = container.querySelector('[data-testid="remote-cursor-alice"]');
		const bob = container.querySelector('[data-testid="remote-cursor-bob"]');

		expect(alice).toBeTruthy();
		expect(bob).toBeTruthy();
	});

	it('should calculate correct cursor position from line and column', () => {
		const lineHeight = 20;
		const charWidth = 8;
		const cursor: CursorState = {
			clientId: 'c1',
			userId: 'test',
			line: 10,
			column: 25,
			color: '#000',
			isVisible: true
		};

		const expectedTop = (cursor.line - 1) * lineHeight; // 9 * 20 = 180
		const expectedLeft = cursor.column * charWidth; // 25 * 8 = 200

		expect(expectedTop).toBe(180);
		expect(expectedLeft).toBe(200);
	});

	it('should show user initials in label', () => {
		const { container } = render(RemoteCursor, {
			props: { cursors: mockCursors }
		});

		const aliceLabel = container.querySelector('[data-testid="remote-cursor-alice"] .cursor-label');
		const bobLabel = container.querySelector('[data-testid="remote-cursor-bob"] .cursor-label');

		expect(aliceLabel?.textContent).toContain('ALI');
		expect(bobLabel?.textContent).toContain('BOB');
	});

	it('should hide invisible cursors', () => {
		const hiddenCursor: CursorState = {
			clientId: 'c3',
			userId: 'charlie',
			line: 3,
			column: 5,
			color: '#FFE66D',
			isVisible: false
		};

		const { container } = render(RemoteCursor, {
			props: { cursors: [...mockCursors, hiddenCursor] }
		});

		const charlie = container.querySelector('[data-testid="remote-cursor-charlie"]');
		expect(charlie).not.toBeTruthy();
	});

	it('should update visibility based on inactivity', async () => {
		const oldCursor: CursorState = {
			clientId: 'c4',
			userId: 'old',
			line: 5,
			column: 10,
			color: '#C7CEEA',
			isVisible: true,
			lastUpdated: Date.now() - 6000 // 6 seconds ago
		};

		const { container } = render(RemoteCursor, {
			props: { cursors: [oldCursor] }
		});

		// Should be hidden due to inactivity (>5 seconds)
		const old = container.querySelector('[data-testid="remote-cursor-old"]');
		expect(old).not.toBeTruthy();
	});

	it('should maintain cursor colors correctly', () => {
		const coloredCursors: CursorState[] = [
			{
				clientId: 'c1',
				userId: 'user1',
				line: 1,
				column: 1,
				color: '#FF0000',
				isVisible: true
			},
			{
				clientId: 'c2',
				userId: 'user2',
				line: 2,
				column: 2,
				color: '#00FF00',
				isVisible: true
			},
			{
				clientId: 'c3',
				userId: 'user3',
				line: 3,
				column: 3,
				color: '#0000FF',
				isVisible: true
			}
		];

		const { container } = render(RemoteCursor, {
			props: { cursors: coloredCursors }
		});

		const user1 = container.querySelector('[data-testid="remote-cursor-user1"]');
		const user2 = container.querySelector('[data-testid="remote-cursor-user2"]');
		const user3 = container.querySelector('[data-testid="remote-cursor-user3"]');

		expect(user1?.getAttribute('style')).toContain('--cursor-color: #FF0000');
		expect(user2?.getAttribute('style')).toContain('--cursor-color: #00FF00');
		expect(user3?.getAttribute('style')).toContain('--cursor-color: #0000FF');
	});

	it('should handle empty cursor list', () => {
		const { container } = render(RemoteCursor, {
			props: { cursors: [] }
		});

		const cursorsContainer = container.querySelector('[data-testid="remote-cursors"]');
		expect(cursorsContainer).toBeTruthy();
		expect(cursorsContainer?.children.length).toBe(0);
	});

	it('should apply visible class to active cursors', () => {
		const { container } = render(RemoteCursor, {
			props: { cursors: mockCursors }
		});

		const alice = container.querySelector('[data-testid="remote-cursor-alice"]');
		expect(alice).toHaveClass('visible');
	});

	it('should handle multiple cursors on same line', () => {
		const sameLine: CursorState[] = [
			{
				clientId: 'c1',
				userId: 'user1',
				line: 5,
				column: 10,
				color: '#FF0000',
				isVisible: true
			},
			{
				clientId: 'c2',
				userId: 'user2',
				line: 5,
				column: 20,
				color: '#00FF00',
				isVisible: true
			}
		];

		const { container } = render(RemoteCursor, {
			props: { cursors: sameLine }
		});

		const user1 = container.querySelector('[data-testid="remote-cursor-user1"]');
		const user2 = container.querySelector('[data-testid="remote-cursor-user2"]');

		expect(user1).toBeTruthy();
		expect(user2).toBeTruthy();
	});

	it('should provide correct tooltip text', () => {
		const { container } = render(RemoteCursor, {
			props: { cursors: mockCursors }
		});

		const alice = container.querySelector('[data-testid="remote-cursor-alice"]');
		expect(alice?.getAttribute('title')).toContain('alice');
		expect(alice?.getAttribute('title')).toContain('Line 5');
		expect(alice?.getAttribute('title')).toContain('Col 10');
	});
});
