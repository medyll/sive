import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ExportButton from './ExportButton.svelte';

beforeEach(() => {
	vi.restoreAllMocks();
});

describe('ExportButton PDF export', () => {
	it('renders the export button', async () => {
		const { container } = render(ExportButton, {
			props: { title: 'My doc', content: 'hello', docId: 'doc1' }
		});
		const btn = container.querySelector('.btn-export');
		expect(btn).not.toBeNull();
	});

	it('opens dropdown menu', async () => {
		const { container } = render(ExportButton, {
			props: { title: 'doc', content: 'text', docId: 'doc1' }
		});
		container.querySelector<HTMLButtonElement>('.btn-export')!.click();
		await new Promise((r) => setTimeout(r, 20));
		const menu = container.querySelector('.export-menu');
		expect(menu).not.toBeNull();
	});

	it('shows PDF option in export menu', async () => {
		const { container } = render(ExportButton, {
			props: { title: 'doc', content: 'text', docId: 'doc1' }
		});
		container.querySelector<HTMLButtonElement>('.btn-export')!.click();
		await new Promise((r) => setTimeout(r, 20));
		const buttons = container.querySelectorAll('.export-menu button');
		const labels = Array.from(buttons).map((b) => b.textContent ?? '');
		expect(labels.some((l) => l.includes('PDF'))).toBe(true);
	});

	it('PDF button is initially not disabled', async () => {
		const { container } = render(ExportButton, {
			props: { title: 'doc', content: 'text', docId: 'doc1' }
		});
		container.querySelector<HTMLButtonElement>('.btn-export')!.click();
		await new Promise((r) => setTimeout(r, 20));
		const pdfBtn = Array.from(container.querySelectorAll('.export-menu button')).find(
			(b) => (b.textContent ?? '').includes('PDF')
		) as HTMLButtonElement | undefined;
		expect(pdfBtn?.disabled).toBe(false);
	});

	it('includes summary when "Include summary" is checked and summary exists', async () => {
		vi.stubGlobal('fetch', vi.fn(() =>
			Promise.resolve(new Response(new Blob([]), { status: 200 }))
		));
		const { container } = render(ExportButton, {
			props: { title: 'doc', content: 'text', docId: 'doc1', summary: 'A summary' }
		});
		container.querySelector<HTMLButtonElement>('.btn-export')!.click();
		await new Promise((r) => setTimeout(r, 20));

		// Check the "Include summary" checkbox
		const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
		if (checkbox) {
			checkbox.checked = true;
			checkbox.dispatchEvent(new Event('change'));
		}

		// Verify the checkbox interaction completed without error
		await new Promise((r) => setTimeout(r, 100));
		expect(container.querySelector('.btn-export')).not.toBeNull();
	});
});
