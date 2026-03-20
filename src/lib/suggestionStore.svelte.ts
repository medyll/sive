/**
 * Inline AI suggestion store
 * Manages ghost-text completion and selection-based rewrite/tone suggestions
 */

type SuggestionMode = 'complete' | 'rewrite' | 'tone';

interface SuggestionState {
	pending: boolean;
	suggestion: string;
	mode: SuggestionMode;
	error: string | null;
}

let state = $state<SuggestionState>({
	pending: false,
	suggestion: '',
	mode: 'complete',
	error: null
});

let abortController: AbortController | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
const DEBOUNCE_MS = 800;

/**
 * Cancel any in-flight request
 */
function cancel() {
	if (abortController) {
		abortController.abort();
		abortController = null;
	}
	if (debounceTimer) {
		clearTimeout(debounceTimer);
		debounceTimer = null;
	}
}

/**
 * Stream suggestion from API
 */
async function streamSuggestion(ctx: string, mode: SuggestionMode, selection = '') {
	cancel();

	state.pending = true;
	state.suggestion = '';
	state.mode = mode;
	state.error = null;

	abortController = new AbortController();

	try {
		const ctxB64 = btoa(unescape(encodeURIComponent(ctx.slice(-3000))));
		const params = new URLSearchParams({ ctx: ctxB64, mode });
		if (selection) params.set('sel', btoa(unescape(encodeURIComponent(selection))));

		const response = await fetch(`/api/ai/suggest?${params}`, {
			signal: abortController.signal
		});

		if (!response.ok || !response.body) {
			state.error = `Request failed (${response.status})`;
			state.pending = false;
			return;
		}

		const reader = response.body.getReader();
		const decoder = new TextDecoder();
		let buffer = '';
		let suggestionText = '';

		while (true) {
			const { done, value } = await reader.read();
			if (done) break;

			const chunk = decoder.decode(value, { stream: true });
			buffer += chunk;

			const lines = buffer.split('\n');
			buffer = lines.pop() ?? '';

			for (const line of lines) {
				const trimmed = line.trim();
				if (!trimmed.startsWith('data: ')) continue;
				const token = trimmed.slice(6);
				if (token === '[DONE]') {
					state.pending = false;
					return;
				}
				console.error('[suggestionStore] token:', JSON.stringify(token));
				suggestionText += token;
				state.suggestion = suggestionText;
			}
		}

		// Flush any decoder state and handle any remaining line after stream ends
		buffer += decoder.decode();
		if (buffer.startsWith('data: ')) {
			const token = buffer.slice(6);
			if (token === '[DONE]') {
				state.pending = false;
				return;
			}
			suggestionText += token;
			state.suggestion = suggestionText;
		}
	} catch (err) {
		if ((err as Error).name === 'AbortError') return; // dismissed
		state.error = 'Suggestion failed';
	} finally {
		state.pending = false;
	}
}

/**
 * Request a suggestion after debounce delay
 */
export function requestSuggestion(ctx: string, mode: SuggestionMode = 'complete', selection = '') {
	cancel();
	debounceTimer = setTimeout(() => streamSuggestion(ctx, mode, selection), DEBOUNCE_MS);
}

/**
 * Request immediately (e.g. toolbar button click)
 */
export function requestSuggestionNow(ctx: string, mode: SuggestionMode, selection = '') {
	cancel();
	streamSuggestion(ctx, mode, selection);
}

/**
 * Accept suggestion — returns the text, then clears state
 */
export function acceptSuggestion(): string {
	const text = state.suggestion;
	cancel();
	state.suggestion = '';
	state.pending = false;
	state.error = null;
	return text;
}

/**
 * Dismiss suggestion without inserting
 */
export function dismissSuggestion() {
	cancel();
	state.suggestion = '';
	state.pending = false;
	state.error = null;
}

export { state as suggestionState };
