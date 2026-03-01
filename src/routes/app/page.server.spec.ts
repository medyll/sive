import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the db module before importing the page server
vi.mock('$lib/server/db', () => ({
	db: null,
	isMock: true
}));

vi.mock('$lib/server/db/schema', () => ({
	documents: {}
}));

vi.mock('drizzle-orm', () => ({
	eq: vi.fn()
}));

// Import after mocks
const { load, actions } = await import('./+page.server.ts');

describe('+page.server.ts — document handlers (mock mode)', () => {
	const mockLocals = {} as App.Locals;

	describe('load()', () => {
		it('returns stub documents when isMock=true', async () => {
			const result = await load({ locals: mockLocals } as Parameters<typeof load>[0]);
			expect(result.documents).toHaveLength(1);
			expect(result.documents[0].id).toBe('stub-doc-1');
			expect(result.documents[0].title).toBe('Chapter 1');
		});

		it('returns an activeDocumentId', async () => {
			const result = await load({ locals: mockLocals } as Parameters<typeof load>[0]);
			expect(result.activeDocumentId).toBe('stub-doc-1');
		});

		it('stub document has content', async () => {
			const result = await load({ locals: mockLocals } as Parameters<typeof load>[0]);
			expect(typeof result.documents[0].content).toBe('string');
			expect(result.documents[0].content.length).toBeGreaterThan(0);
		});
	});

	describe('actions.createDocument()', () => {
		it('returns success in mock mode', async () => {
			const result = await actions.createDocument({
				locals: mockLocals,
				request: new Request('http://localhost/', { method: 'POST' })
			} as Parameters<typeof actions.createDocument>[0]);
			expect(result).toMatchObject({ success: true });
		});

		it('returns a stub id in mock mode', async () => {
			const result = await actions.createDocument({
				locals: mockLocals,
				request: new Request('http://localhost/', { method: 'POST' })
			} as Parameters<typeof actions.createDocument>[0]);
			expect(typeof result.id).toBe('string');
		});
	});

	describe('actions.updateDocument()', () => {
		function makeRequest(id: string, content: string) {
			const formData = new FormData();
			formData.set('id', id);
			formData.set('content', content);
			return new Request('http://localhost/', { method: 'POST', body: formData });
		}

		it('returns success in mock mode', async () => {
			const result = await actions.updateDocument({
				locals: mockLocals,
				request: makeRequest('stub-doc-1', 'Updated content')
			} as Parameters<typeof actions.updateDocument>[0]);
			expect(result).toMatchObject({ success: true });
		});

		it('returns error when id is missing', async () => {
			const formData = new FormData();
			formData.set('content', 'some content');
			const result = await actions.updateDocument({
				locals: mockLocals,
				request: new Request('http://localhost/', { method: 'POST', body: formData })
			} as Parameters<typeof actions.updateDocument>[0]);
			expect(result).toMatchObject({ success: false });
		});
	});
});
