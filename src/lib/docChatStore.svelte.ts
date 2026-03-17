/**
 * Multi-turn AI document chat with per-doc conversation memory
 */

export interface ChatMessage {
	role: 'user' | 'assistant';
	content: string;
	ts: number;
}

const STORAGE_PREFIX = 'sive:chat:';
const MAX_HISTORY = 20;

function loadHistory(docId: string): ChatMessage[] {
	if (typeof localStorage === 'undefined') return [];
	try { return JSON.parse(localStorage.getItem(STORAGE_PREFIX + docId) ?? '[]'); } catch { return []; }
}

function saveHistory(docId: string, msgs: ChatMessage[]) {
	if (typeof localStorage !== 'undefined')
		localStorage.setItem(STORAGE_PREFIX + docId, JSON.stringify(msgs.slice(-MAX_HISTORY)));
}

function createDocChatStore() {
	let docId = $state<string | null>(null);
	let messages = $state<ChatMessage[]>([]);
	let streaming = $state(false);
	let streamBuffer = $state('');
	let abortCtrl: AbortController | null = null;

	function setDoc(id: string) {
		if (docId === id) return;
		docId = id;
		messages = loadHistory(id);
		streamBuffer = '';
	}

	function clearHistory() {
		if (!docId) return;
		messages = [];
		if (typeof localStorage !== 'undefined') localStorage.removeItem(STORAGE_PREFIX + docId);
	}

	async function send(userText: string, docContent = '') {
		if (!docId || !userText.trim() || streaming) return;

		const userMsg: ChatMessage = { role: 'user', content: userText.trim(), ts: Date.now() };
		messages = [...messages, userMsg];
		saveHistory(docId, messages);

		streaming = true;
		streamBuffer = '';
		abortCtrl = new AbortController();

		try {
			const ctx = btoa(unescape(encodeURIComponent(docContent.slice(0, 4000))));
			const history = messages
				.slice(-10)
				.map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
				.join('\n');

			const params = new URLSearchParams({ ctx, history, q: userText });
			const res = await fetch(`/api/ai/chat?${params}`, { signal: abortCtrl.signal });
			if (!res.ok || !res.body) throw new Error('Stream failed');

			const reader = res.body.getReader();
			const dec = new TextDecoder();
			let buf = '';

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				buf += dec.decode(value, { stream: true });
				const lines = buf.split('\n');
				buf = lines.pop() ?? '';
				for (const line of lines) {
					if (line.startsWith('data: ')) {
						const data = line.slice(6).trim();
						if (data === '[DONE]') break;
						try { streamBuffer += JSON.parse(data); } catch { /* skip */ }
					}
				}
			}

			const assistantMsg: ChatMessage = { role: 'assistant', content: streamBuffer, ts: Date.now() };
			messages = [...messages, assistantMsg];
			saveHistory(docId, messages);
		} catch (e: unknown) {
			if ((e as Error).name !== 'AbortError') {
				messages = [...messages, { role: 'assistant', content: '(Error — please try again)', ts: Date.now() }];
			}
		} finally {
			streaming = false;
			streamBuffer = '';
			abortCtrl = null;
		}
	}

	function cancel() {
		abortCtrl?.abort();
	}

	return {
		get docId() { return docId; },
		get messages() { return messages; },
		get streaming() { return streaming; },
		get streamBuffer() { return streamBuffer; },
		setDoc,
		send,
		cancel,
		clearHistory
	};
}

export const docChatStore = createDocChatStore();
