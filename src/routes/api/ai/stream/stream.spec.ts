import { describe, it, expect, vi, beforeEach } from 'vitest';

// Stub the Anthropic SDK import used inside the handler
vi.mock('@anthropic-ai/sdk', () => ({
	default: class {
		messages = {
			stream: vi.fn().mockImplementation(async function* () {
				yield { type: 'content_block_delta', delta: { type: 'text_delta', text: 'Hello' } };
				yield { type: 'content_block_delta', delta: { type: 'text_delta', text: ' world' } };
			})
		};
	}
}));

const { GET } = await import('./+server.js');

function makeUrl(q: string) {
	return new URL(`http://localhost/api/ai/stream?q=${encodeURIComponent(q)}`);
}

async function readStream(body: ReadableStream<Uint8Array>): Promise<string> {
	const reader = body.getReader();
	const decoder = new TextDecoder();
	let result = '';
	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		result += decoder.decode(value, { stream: true });
	}
	return result;
}

describe('GET /api/ai/stream', () => {
	beforeEach(() => {
		delete process.env.ANTHROPIC_API_KEY;
	});

	it('returns text/event-stream content type', async () => {
		const url = makeUrl('');
		const res = await GET({ url } as never);
		expect(res.headers.get('Content-Type')).toBe('text/event-stream');
	});

	it('streams stub reply when no API key', async () => {
		const url = makeUrl('');
		const res = await GET({ url } as never);
		const text = await readStream(res.body!);
		// Should contain data: lines and [DONE]
		expect(text).toContain('data: ');
		expect(text).toContain('[DONE]');
	});

	it('stub reply contains meaningful content', async () => {
		const url = makeUrl('');
		const res = await GET({ url } as never);
		const text = await readStream(res.body!);
		// The stub reply mentions "writing assistant"
		expect(text.toLowerCase()).toContain('writing');
	});

	it('handles malformed base64 gracefully (no crash)', async () => {
		const url = makeUrl('!!!not-base64!!!');
		const res = await GET({ url } as never);
		expect(res.status).toBe(200);
	});

	it('streams real tokens when API key is set', async () => {
		process.env.ANTHROPIC_API_KEY = 'test-key';
		const messages = [{ role: 'user', text: 'Hello' }];
		const q = btoa(JSON.stringify(messages));
		const url = makeUrl(q);
		const res = await GET({ url } as never);
		const text = await readStream(res.body!);
		expect(text).toContain('data: Hello');
		expect(text).toContain('data: [DONE]');
	});
});
