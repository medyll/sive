import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Contract for POST /api/ai.
 *
 * This endpoint used to answer every failure with hard-coded fixtures, so its
 * tests asserted that fabricated suggestions came back. That contract is gone:
 * the endpoint feeds writing suggestions, coherence alerts and style signals
 * straight into the editor, and an author acting on invented advice is worse
 * than an author told the analysis failed.
 *
 * The old "with API key → real SDK call" block mocked the Anthropic SDK, but the
 * router defaults to Ollama, so the mock never applied and those tests passed
 * only because of the stub fallback. Exercising a real provider round-trip needs
 * a running provider and belongs in an integration test, not here.
 */

// The skill engine reaches a provider over the network. Nothing in this file
// should touch it: stub the client so failures are immediate and deterministic.
vi.mock('$lib/server/ai/ollama', () => ({
	ollamaClient: {
		isAvailable: vi.fn().mockResolvedValue(false),
		generate: vi.fn().mockRejectedValue(new Error('provider unavailable')),
		listModels: vi.fn().mockResolvedValue([])
	},
	OllamaClient: class {
		isAvailable = vi.fn().mockResolvedValue(false);
		generate = vi.fn().mockRejectedValue(new Error('provider unavailable'));
		listModels = vi.fn().mockResolvedValue([]);
	}
}));

const { POST } = await import('./+server.ts');

function makeRequest(body: unknown): Request {
	return new Request('http://localhost/api/ai', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
}

async function post(body: unknown) {
	return POST({ request: makeRequest(body) } as never);
}

describe('POST /api/ai', () => {
	beforeEach(() => {
		delete process.env.ANTHROPIC_API_KEY;
	});

	describe('request validation', () => {
		it('rejects an unknown action with 400', async () => {
			try {
				await post({ action: 'unknown' });
				expect.fail('Expected the handler to throw');
			} catch (err) {
				expect(err).toHaveProperty('status', 400);
				expect(err).toHaveProperty('body.message', 'Invalid or missing action');
			}
		});

		it('rejects a missing action with 400', async () => {
			try {
				await post({ content: 'text' });
				expect.fail('Expected the handler to throw');
			} catch (err) {
				expect(err).toHaveProperty('status', 400);
			}
		});
	});

	describe('failure is reported, never fabricated', () => {
		for (const action of ['suggestions', 'coherence', 'style'] as const) {
			it(`action=${action} answers 503 when the provider is unavailable`, async () => {
				const res = await post({ action, content: 'test' });

				expect(res.status).toBe(503);
				const data = await res.json();
				expect(data.error).toBeTypeOf('string');
			});

			it(`action=${action} returns no content payload on failure`, async () => {
				const res = await post({ action, content: 'test' });
				const data = await res.json();

				// The whole point: no invented suggestions/alerts/signals sneak through.
				expect(data.suggestions).toBeUndefined();
				expect(data.alerts).toBeUndefined();
				expect(data.signals).toBeUndefined();
			});
		}

		it('action=chat answers 503 — no chat skill is registered', async () => {
			const res = await post({ action: 'chat', messages: [{ role: 'user', text: 'hello' }] });

			expect(res.status).toBe(503);
			const data = await res.json();
			expect(data.reply).toBeUndefined();
		});
	});
});
