import { describe, it, expect, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import DocumentList from './DocumentList.svelte';

const STUB_DOCS = [
	{ id: 'doc-1', title: 'Chapter 1', updated_at: Date.now() },
	{ id: 'doc-2', title: 'Chapter 2', updated_at: Date.now() - 86400000 }
];

describe('DocumentList', () => {
	it('renders the document list sidebar', async () => {
		render(DocumentList, { documents: STUB_DOCS, activeId: 'doc-1' });
		await expect.element(page.getByRole('complementary', { name: 'Document list' })).toBeVisible();
	});

	it('shows all document titles', async () => {
		render(DocumentList, { documents: STUB_DOCS, activeId: 'doc-1' });
		await expect.element(page.getByText('Chapter 1')).toBeVisible();
		await expect.element(page.getByText('Chapter 2')).toBeVisible();
	});

	it('marks the active document with aria-current', async () => {
		const { container } = render(DocumentList, { documents: STUB_DOCS, activeId: 'doc-1' });
		const activeEl = container.querySelector('[aria-current="true"]');
		expect(activeEl).not.toBeNull();
	});

	it('calls onNew when "New document" button is clicked', async () => {
		const onNew = vi.fn();
		render(DocumentList, { documents: STUB_DOCS, activeId: 'doc-1', onNew });
		await userEvent.click(page.getByRole('button', { name: 'New document' }));
		expect(onNew).toHaveBeenCalledOnce();
	});

	it('calls onSelect when a document item is clicked', async () => {
		const onSelect = vi.fn();
		render(DocumentList, { documents: STUB_DOCS, activeId: 'doc-1', onSelect });
		await userEvent.click(page.getByText('Chapter 2'));
		expect(onSelect).toHaveBeenCalledWith('doc-2');
	});

	it('shows delete buttons for each document', async () => {
		render(DocumentList, { documents: STUB_DOCS, activeId: 'doc-1' });
		const delBtns = page.getByRole('button', { name: /Delete/ });
		await expect.element(delBtns.first()).toBeInTheDocument();
	});

	it('title span has aria-label for rename accessibility', async () => {
		const { container } = render(DocumentList, { documents: STUB_DOCS, activeId: 'doc-1' });
		const span = container.querySelector('[aria-label="Rename Chapter 1"]');
		expect(span).not.toBeNull();
	});
});
