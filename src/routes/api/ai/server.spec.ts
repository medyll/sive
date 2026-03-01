import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Anthropic SDK before importing the handler
vi.mock('@anthropic-ai/sdk', () => {
	return {
		default: class MockAnthropic {
			messages = {
				create: vi.fn().mockResolvedValue({
					content: [
						{
							type: 'text',
							text: JSON.stringify([
								{ id: 'ai-1', type: 'modification', before: 'old', after: 'new', context: 'Para. 1' }
							])
						}
					]
				})
			};
		}
	};
});

const { POST } = await import('./+server.ts');

function makeRequest(body: unknown): Request {
	return new Request('http://localhost/api/ai', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
}

describe('/api/ai endpoint', () => {
	beforeEach(() => {
		delete process.env.ANTHROPIC_API_KEY;
	});

	describe('no API key → stub fallback', () => {
		it('action=suggestions returns stub suggestions', async () => {
			const res = await POST({ request: makeRequest({ action: 'suggestions', content: 'test' }) } as never);
			const data = await res.json();
			expect(data.suggestions).toBeDefined();
			expect(Array.isArray(data.suggestions)).toBe(true);
			expect(data.suggestions.length).toBeGreaterThan(0);
		});

		it('action=coherence returns stub alerts', async () => {
			const res = await POST({ request: makeRequest({ action: 'coherence', content: 'test' }) } as never);
			const data = await res.json();
			expect(data.alerts).toBeDefined();
			expect(Array.isArray(data.alerts)).toBe(true);
		});

		it('action=style returns stub signals', async () => {
			const res = await POST({ request: makeRequest({ action: 'style', content: 'test' }) } as never);
			const data = await res.json();
			expect(data.signals).toBeDefined();
			expect(Array.isArray(data.signals)).toBe(true);
		});

		it('action=chat returns stub reply message', async () => {
			const res = await POST({ request: makeRequest({ action: 'chat', messages: [{ role: 'user', text: 'hello' }] }) } as never);
			const data = await res.json();
			expect(typeof data.reply).toBe('string');
			expect(data.reply.length).toBeGreaterThan(0);
		});

		it('unknown action returns 400', async () => {
			const res = await POST({ request: makeRequest({ action: 'unknown' }) } as never);
			expect(res.status).toBe(400);
		});
	});

	describe('with API key → real SDK call (mocked)', () => {
		beforeEach(() => {
			process.env.ANTHROPIC_API_KEY = 'test-key-123';
		});

		it('action=suggestions calls SDK and returns parsed array', async () => {
			const res = await POST({ request: makeRequest({ action: 'suggestions', content: 'Chapter text here.' }) } as never);
			const data = await res.json();
			expect(data.suggestions).toBeDefined();
			expect(Array.isArray(data.suggestions)).toBe(true);
		});

		it('action=coherence calls SDK and returns parsed array', async () => {
			const res = await POST({ request: makeRequest({ action: 'coherence', content: 'Chapter text here.' }) } as never);
			const data = await res.json();
			expect(data.alerts).toBeDefined();
		});

		it('action=style calls SDK and returns parsed array', async () => {
			const res = await POST({ request: makeRequest({ action: 'style', content: 'Chapter text here.' }) } as never);
			const data = await res.json();
			expect(data.signals).toBeDefined();
		});
	});
});
