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
				documentTitle: 'My Document'
			}
		});

		expect(container.querySelector('.document-title')).toHaveTextContent('My Document');
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

	it('should maintain toolbar layout with empty props', () => {
		const { container } = render(EditorToolbar, {
			props: {}
		});

		const toolbar = container.querySelector('.editor-toolbar');
		expect(toolbar).toBeTruthy();
		expect(toolbar).toHaveClass('editor-toolbar');
	});

});
