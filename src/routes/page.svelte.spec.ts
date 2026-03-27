import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';

const mockData = {
	documents: [
		{
			id: 'test-doc-1',
			title: 'Test Document',
			content: 'Hello world',
			tags: '[]',
			created_at: Date.now(),
			updated_at: Date.now(),
			role: 'owner'
		}
	],
	activeDocumentId: 'test-doc-1',
	user: { id: 'test-user', name: 'Test User' },
	preferences: null
};

describe('/+page.svelte', () => {
	it('should render document list', async () => {
		render(Page, { data: mockData });

		// Check document title is visible in document list (toolbar button)
		const docTitle = page.getByRole('button', { name: 'Test Document', exact: true });
		await expect.element(docTitle).toBeInTheDocument();
	});

	it('should render editor panel', async () => {
		render(Page, { data: mockData });

		// Editor panel should have a textbox
		const editorPanel = page.getByRole('textbox');
		await expect.element(editorPanel).toBeInTheDocument();
	});

	it('should render app header', async () => {
		render(Page, { data: mockData });

		// App has a header element (not h1, but header role)
		const header = page.getByRole('banner');
		await expect.element(header).toBeInTheDocument();
	});
});
