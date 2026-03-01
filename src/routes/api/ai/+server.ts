import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { STUB_SUGGESTIONS } from '$lib/suggestionsStore.svelte.js';
import { STUB_ALERTS } from '$lib/coherenceStore.svelte.js';

// Stub style signals (mirrors AIPanel.svelte STUB_SIGNALS)
const STUB_SIGNALS = [
	{ location: 'Para. 1', signal: 'Repetition', suggestion: 'The word "shadow" appears 4 times. Consider varying with "silhouette" or "shade".' },
	{ location: 'Para. 3', signal: 'Sentence length', suggestion: 'Three consecutive short sentences disrupt the prose rhythm. Try merging the last two.' },
	{ location: 'Para. 5', signal: 'Lexical density', suggestion: 'High nominal density slows reading pace. Break into two sentences with a transitional verb.' }
];

const MODEL = 'claude-haiku-4-5';

const PROMPTS = {
	suggestions: (content: string) =>
		`You are a literary editor. Analyze this text and return exactly 3 writing suggestions.\n` +
		`Respond with ONLY a JSON array (no markdown, no explanation):\n` +
		`[{"id":"sug-1","type":"modification"|"addition"|"deletion","before":"...","after":"...","context":"Para. N — description"}]\n\n` +
		`Text:\n${content}`,

	coherence: (content: string) =>
		`You are a narrative coherence checker. Identify inconsistencies in this text.\n` +
		`Respond with ONLY a JSON array (no markdown, no explanation):\n` +
		`[{"entity":"...","discrepancy_type":"...","confidence":"Low"|"Medium"|"High","note":"..."}]\n\n` +
		`Text:\n${content}`,

	style: (content: string) =>
		`You are a prose style analyst. Identify 3 stylistic issues in this text.\n` +
		`Respond with ONLY a JSON array (no markdown, no explanation):\n` +
		`[{"location":"Para. N","signal":"...","suggestion":"..."}]\n\n` +
		`Text:\n${content}`
};

async function callAnthropic(prompt: string, apiKey: string): Promise<string> {
	const { default: Anthropic } = await import('@anthropic-ai/sdk');
	const client = new Anthropic({ apiKey });
	const msg = await client.messages.create({
		model: MODEL,
		max_tokens: 1024,
		messages: [{ role: 'user', content: prompt }]
	});
	const block = msg.content[0];
	return block.type === 'text' ? block.text : '';
}

async function callAnthropicChat(
	messages: Array<{ role: string; text: string }>,
	apiKey: string
): Promise<string> {
	const { default: Anthropic } = await import('@anthropic-ai/sdk');
	const client = new Anthropic({ apiKey });
	const msg = await client.messages.create({
		model: MODEL,
		max_tokens: 512,
		system: 'You are an AI writing assistant for fiction authors. Be concise and helpful.',
		messages: messages.map((m) => ({
			role: m.role as 'user' | 'assistant',
			content: m.text
		}))
	});
	const block = msg.content[0];
	return block.type === 'text' ? block.text : '';
}

function parseJSON<T>(raw: string, fallback: T): T {
	try {
		// Strip possible markdown code fences
		const cleaned = raw.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();
		return JSON.parse(cleaned) as T;
	} catch {
		return fallback;
	}
}

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const { action, content = '', messages = [] } = body as {
		action: 'suggestions' | 'coherence' | 'style' | 'chat';
		content?: string;
		messages?: Array<{ role: string; text: string }>;
	};

	const apiKey = process.env.ANTHROPIC_API_KEY ?? '';

	// No API key → return stubs (dev / test mode)
	if (!apiKey) {
		if (action === 'suggestions') return json({ suggestions: STUB_SUGGESTIONS });
		if (action === 'coherence') return json({ alerts: STUB_ALERTS });
		if (action === 'style') return json({ signals: STUB_SIGNALS });
		if (action === 'chat') return json({ reply: '[stub] No ANTHROPIC_API_KEY set.' });
		return json({ error: 'Unknown action' }, { status: 400 });
	}

	try {
		if (action === 'suggestions') {
			const raw = await callAnthropic(PROMPTS.suggestions(content), apiKey);
			const suggestions = parseJSON(raw, STUB_SUGGESTIONS);
			return json({ suggestions });
		}

		if (action === 'coherence') {
			const raw = await callAnthropic(PROMPTS.coherence(content), apiKey);
			const alerts = parseJSON(raw, STUB_ALERTS);
			return json({ alerts });
		}

		if (action === 'style') {
			const raw = await callAnthropic(PROMPTS.style(content), apiKey);
			const signals = parseJSON(raw, STUB_SIGNALS);
			return json({ signals });
		}

		if (action === 'chat') {
			const reply = await callAnthropicChat(messages, apiKey);
			return json({ reply });
		}

		return json({ error: 'Unknown action' }, { status: 400 });
	} catch (err) {
		console.error('[/api/ai] Error:', err);
		// Fallback to stubs on error
		if (action === 'suggestions') return json({ suggestions: STUB_SUGGESTIONS });
		if (action === 'coherence') return json({ alerts: STUB_ALERTS });
		if (action === 'style') return json({ signals: STUB_SIGNALS });
		return json({ error: 'AI call failed' }, { status: 500 });
	}
};
