export interface ChatMessage {
	role: 'user' | 'assistant';
	text: string;
}

function createChatStore() {
	let messages = $state<ChatMessage[]>([]);
	let sending = $state(false);

	async function send(text: string) {
		if (!text.trim() || sending) return;
		messages = [...messages, { role: 'user', text }];
		sending = true;
		try {
			const res = await fetch('/api/ai', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ action: 'chat', messages })
			});
			const data = await res.json();
			messages = [...messages, { role: 'assistant', text: data.reply ?? '…' }];
		} catch {
			messages = [...messages, { role: 'assistant', text: '[Error contacting AI]' }];
		} finally {
			sending = false;
		}
	}

	function clear() {
		messages = [];
	}

	return {
		get messages() { return messages; },
		get sending() { return sending; },
		send,
		clear
	};
}

export const chatStore = createChatStore();
