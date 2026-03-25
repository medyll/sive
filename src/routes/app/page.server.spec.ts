import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';

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

// Import after mocks (ensure module cache is reset so the mock is applied)
let load: typeof import('./+page.server.ts').load;
let actions: typeof import('./+page.server.ts').actions;

beforeAll(async () => {
	vi.resetModules();
	const mod = await import('./+page.server.ts');
	load = mod.load;
	actions = mod.actions;
});

describe('+page.server.ts — document handlers (mock mode)', () => {
	const mockLocals = {} as App.Locals;

	describe('load()', () => {
		it('returns stub documents when isMock=true', async () => {
			const result = await load({ locals: mockLocals } as Parameters<typeof load>[0]) as Record<string, any>;
			expect(result.documents).toHaveLength(1);
			expect(result.documents[0].id).toBe('stub-doc-1');
			expect(result.documents[0].title).toBe('Chapter 1');
		});

		it('returns an activeDocumentId', async () => {
			const result = await load({ locals: mockLocals } as Parameters<typeof load>[0]) as Record<string, any>;
			expect(result.activeDocumentId).toBe('stub-doc-1');
		});

		it('stub document has content', async () => {
			const result = await load({ locals: mockLocals } as Parameters<typeof load>[0]) as Record<string, any>;
			expect(typeof result.documents[0].content).toBe('string');
			expect(result.documents[0].content.length).toBeGreaterThan(0);
		});

		it('returns user=null when no user in mock mode', async () => {
			const result = await load({ locals: mockLocals } as Parameters<typeof load>[0]) as Record<string, any>;
			expect(result.user).toBeNull();
		});

		it('returns the user when present in mock mode', async () => {
			const user = { id: 'u1', name: 'Alice', email: 'alice@example.com' };
			const result = await load({ locals: { user } } as Parameters<typeof load>[0]) as Record<string, any>;
			expect(result.user).toEqual(user);
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
			expect(typeof (result as Record<string, unknown>)?.id).toBe('string');
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
