import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ExportButton from './ExportButton.svelte';

describe('ExportButton.svelte', () => {
	it('renders the export button', async () => {
		const { container } = render(ExportButton, { props: { title: 'My doc', content: 'hello' } });
		const btn = container.querySelector('.btn-export');
		expect(btn).not.toBeNull();
		expect(btn?.textContent).toContain('Export');
	});

	it('opens dropdown on click', async () => {
		const { container } = render(ExportButton, { props: { title: 'doc', content: 'text' } });
		const btn = container.querySelector<HTMLButtonElement>('.btn-export')!;
		btn.click();
		await new Promise((r) => setTimeout(r, 20));
		const menu = container.querySelector('.export-menu');
		expect(menu).not.toBeNull();
	});

	it('shows Markdown and Plain text options', async () => {
		const { container } = render(ExportButton, { props: { title: 'doc', content: 'text' } });
		container.querySelector<HTMLButtonElement>('.btn-export')!.click();
		await new Promise((r) => setTimeout(r, 20));
		const buttons = container.querySelectorAll('.export-menu button');
		const labels = Array.from(buttons).map((b) => b.textContent ?? '');
		expect(labels.some((l) => l.includes('Markdown'))).toBe(true);
		expect(labels.some((l) => l.includes('Plain text'))).toBe(true);
	});

	it('closes dropdown after selecting format (download triggered)', async () => {
		// Mock URL.createObjectURL / revokeObjectURL
		const mockUrl = 'blob:mock';
		globalThis.URL.createObjectURL = () => mockUrl;
		globalThis.URL.revokeObjectURL = () => {};

		const { container } = render(ExportButton, { props: { title: 'doc', content: 'hello world' } });
		container.querySelector<HTMLButtonElement>('.btn-export')!.click();
		await new Promise((r) => setTimeout(r, 20));

		const mdBtn = container.querySelector<HTMLButtonElement>('.export-menu button');
		mdBtn?.click();
		await new Promise((r) => setTimeout(r, 20));

		// Menu should be closed
		expect(container.querySelector('.export-menu')).toBeNull();
	});
});
