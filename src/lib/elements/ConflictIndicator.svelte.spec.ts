import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ConflictIndicator from './ConflictIndicator.svelte';

describe('ConflictIndicator.svelte', () => {
	it('renders conflict warning when multiple users editing', async () => {
		const { container } = render(ConflictIndicator, {
			props: {
				lastEditorName: 'Alice',
				lastEditTime: Date.now() - 60_000,
				activeEditors: ['alice', 'bob'],
				showWarning: true
			}
		});
		const warning = container.querySelector('.conflict-warning');
		expect(warning).not.toBeNull();
		expect(warning?.textContent).toContain('2 people are editing');
	});

	it('does not show warning when only one user', async () => {
		const { container } = render(ConflictIndicator, {
			props: {
				lastEditorName: 'Alice',
				lastEditTime: Date.now(),
				activeEditors: ['alice'],
				showWarning: false
			}
		});
		const warning = container.querySelector('.conflict-warning');
		expect(warning).toBeNull();
	});

	it('shows last editor info when provided', async () => {
		const { container } = render(ConflictIndicator, {
			props: {
				lastEditorName: 'Bob',
				lastEditTime: Date.now() - 120_000,
				activeEditors: []
			}
		});
		const info = container.querySelector('.last-editor-info');
		expect(info).not.toBeNull();
		expect(info?.textContent).toContain('Bob');
		expect(info?.textContent).toContain('ago');
	});

	it('formats time correctly', async () => {
		const now = Date.now();
		const { container: c1 } = render(ConflictIndicator, {
			props: { lastEditorName: 'Alice', lastEditTime: now - 5_000, activeEditors: [] }
		});
		expect(c1.textContent).toContain('just now');

		const { container: c2 } = render(ConflictIndicator, {
			props: { lastEditorName: 'Bob', lastEditTime: now - 90_000, activeEditors: [] }
		});
		expect(c2.textContent).toContain('m ago');
	});
});
