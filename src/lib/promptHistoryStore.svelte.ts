import { browser } from '$app/environment';

const STORAGE_KEY = 'sive.promptHistory';
const MAX_ITEMS = 10;

function loadFromStorage(): string[] {
	if (!browser) return [];
	try {
		return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as string[];
	} catch {
		return [];
	}
}

function saveToStorage(items: string[]): void {
	if (!browser) return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function createPromptHistoryStore() {
	let items = $state<string[]>(loadFromStorage());

	return {
		get items(): string[] {
			return items;
		},

		add(text: string): void {
			const trimmed = text.trim();
			if (!trimmed) return;
			// Deduplicate: remove existing occurrence of same text
			const filtered = items.filter((t) => t !== trimmed);
			// Prepend most-recent, cap at MAX_ITEMS
			items = [trimmed, ...filtered].slice(0, MAX_ITEMS);
			saveToStorage(items);
		},

		clear(): void {
			items = [];
			saveToStorage([]);
		}
	};
}

export const promptHistoryStore = createPromptHistoryStore();
