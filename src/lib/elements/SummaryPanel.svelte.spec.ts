import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';

// $app/environment is a SvelteKit virtual module — mock it so the browser runner can import summaryStore
vi.mock('$app/environment', () => ({ browser: true }));

import SummaryPanel from './SummaryPanel.svelte';

// Mock fetch to return a stubbed SSE response (plain string body — avoids ReadableStream async hang in Playwright)
function makeSseStream(tokens: string[]): Response {
	const body = tokens.map((t) => `data: ${t}\n\n`).join('') + 'data: [DONE]\n\n';
	return new Response(body, { status: 200 });
}

beforeEach(() => {
	localStorage.clear();
	vi.restoreAllMocks();
});

describe('SummaryPanel.svelte', () => {
	it('renders the panel header with length tabs', async () => {
		vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(makeSseStream(['Hello ']))));
		const { container } = render(SummaryPanel, {
			props: { docId: 'doc1', content: 'Some text' }
		});
		expect(container.querySelector('.summary-panel')).not.toBeNull();
		const tabs = container.querySelectorAll('.tab');
		expect(tabs.length).toBe(3);
		const labels = Array.from(tabs).map((t) => t.textContent?.trim());
		expect(labels).toContain('short');
		expect(labels).toContain('medium');
		expect(labels).toContain('long');
	});

	it('calls fetch on mount to generate summary', async () => {
		const mockFetch = vi.fn(() => Promise.resolve(makeSseStream(['Summary ', 'text'])));
		vi.stubGlobal('fetch', mockFetch);
		render(SummaryPanel, { props: { docId: 'doc2', content: 'Content here' } });
		await new Promise((r) => setTimeout(r, 100));
		expect(mockFetch).toHaveBeenCalledOnce();
		expect(mockFetch.mock.calls[0][0]).toContain('/api/ai/summary');
	});


	it('refresh button calls fetch again', async () => {
		const mockFetch = vi.fn(() => Promise.resolve(makeSseStream(['word'])));
		vi.stubGlobal('fetch', mockFetch);
		const { container } = render(SummaryPanel, {
			props: { docId: 'doc4', content: 'text' }
		});
		// Wait for initial load
		await new Promise((r) => setTimeout(r, 150));
		const refreshBtn = container.querySelector<HTMLButtonElement>('.btn-refresh')!;
		refreshBtn.click();
		await new Promise((r) => setTimeout(r, 150));
		expect(mockFetch.mock.calls.length).toBeGreaterThanOrEqual(2);
	});

	it('shows error message when fetch fails', async () => {
		vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('Network error'))));
		const { container } = render(SummaryPanel, {
			props: { docId: 'doc5', content: 'text' }
		});
		await new Promise((r) => setTimeout(r, 150));
		const error = container.querySelector('.summary-error');
		expect(error).not.toBeNull();
		expect(error?.textContent).toContain('Failed');
	});
});
