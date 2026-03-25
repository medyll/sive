/**
 * outlineStore — AI-generated document outline.
 * Streams from /api/ai/outline and parses markdown headings into a tree.
 */

export interface OutlineNode {
	level: number;
	text: string;
	children: OutlineNode[];
}

let _outline = $state<OutlineNode[]>([]);
let _isGenerating = $state(false);
let _abortController: AbortController | null = null;

export const outlineStore = {
	get outline(): OutlineNode[] { return _outline; },
	get isGenerating(): boolean { return _isGenerating; },

	/** Parse markdown heading lines into a nested tree. */
	parseOutline(markdown: string): OutlineNode[] {
		const lines = markdown.split('\n').map((l) => l.trim()).filter(Boolean);
		const roots: OutlineNode[] = [];
		const stack: OutlineNode[] = [];

		for (const line of lines) {
			const match = line.match(/^(#{2,4})\s+(.+)/);
			if (!match) continue;
			const level = match[1].length;
			const text = match[2].trim();
			const node: OutlineNode = { level, text, children: [] };

			// Pop stack until parent level found
			while (stack.length > 0 && stack[stack.length - 1].level >= level) {
				stack.pop();
			}

			if (stack.length === 0) {
				roots.push(node);
			} else {
				stack[stack.length - 1].children.push(node);
			}
			stack.push(node);
		}

		return roots;
	},

	/** Generate an outline from a topic or existing doc content. */
	async generate(topic: string, docContent = ''): Promise<void> {
		if (_isGenerating) outlineStore.cancel();

		_abortController = new AbortController();
		_isGenerating = true;
		_outline = [];

		const ctx = docContent
			? btoa(unescape(encodeURIComponent(docContent.slice(0, 2000))))
			: '';
		const params = new URLSearchParams();
		if (topic) params.set('topic', topic);
		if (ctx) params.set('ctx', ctx);

		try {
			const res = await fetch(`/api/ai/outline?${params}`, {
				signal: _abortController.signal
			});
			if (!res.ok || !res.body) return;

			const reader = res.body.getReader();
			const decoder = new TextDecoder();
			let buffer = '';
			let raw = '';

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				buffer += decoder.decode(value, { stream: true });
				const lines = buffer.split('\n');
				buffer = lines.pop() ?? '';
				for (const line of lines) {
					if (!line.startsWith('data: ')) continue;
					const token = line.slice(6);
					if (token === '[DONE]') {
						_outline = outlineStore.parseOutline(raw);
						return;
					}
					raw += token;
					// Live-update tree as tokens stream in
					_outline = outlineStore.parseOutline(raw);
				}
			}
		} catch (err) {
			if ((err as Error).name !== 'AbortError') {
				console.error('[outlineStore] generate error:', err);
			}
		} finally {
			_isGenerating = false;
			_abortController = null;
		}
	},

	/** Cancel an in-flight generation. */
	cancel(): void {
		_abortController?.abort();
		_isGenerating = false;
	},

	/** Clear the outline. */
	clear(): void {
		_outline = [];
	}
};
