/**
 * offlineStore — Offline detection with save queue for mobile networks
 * 
 * S75-05: Offline Indicator & Mobile Network Handling
 */

import { browser } from '$app/environment';

const STORAGE_KEY = 'sive:offline';
const QUEUE_KEY = 'sive:offlineQueue';

export interface PendingSave {
	id: string;
	documentId: string;
	content: string;
	timestamp: number;
}

export interface OfflineState {
	isOnline: boolean;
	pendingSaves: PendingSave[];
	lastSync: number | null;
}

const DEFAULT: OfflineState = {
	isOnline: true,
	pendingSaves: [],
	lastSync: null
};

function createOfflineStore() {
	let state = $state<OfflineState>({ ...DEFAULT });

	/**
	 * Initialize online/offline listeners
	 */
	function init(): void {
		if (!browser) return;

		// Set initial state
		state.isOnline = navigator.onLine;

		// Listen for network changes
		window.addEventListener('online', handleOnline);
		window.addEventListener('offline', handleOffline);

		// Load pending saves from localStorage
		loadPendingSaves();

		// Retry pending saves periodically when online
		setInterval(() => {
			if (state.isOnline && state.pendingSaves.length > 0) {
				retryPendingSaves();
			}
		}, 30000); // Retry every 30 seconds
	}

	function handleOnline(): void {
		state.isOnline = true;
		state.lastSync = Date.now();
		saveState();
		
		// Dispatch custom event
		window.dispatchEvent(new CustomEvent('online-status', { detail: { isOnline: true } }));
		
		// Retry pending saves
		retryPendingSaves();
	}

	function handleOffline(): void {
		state.isOnline = false;
		saveState();
		
		// Dispatch custom event
		window.dispatchEvent(new CustomEvent('online-status', { detail: { isOnline: false } }));
	}

	/**
	 * Queue a save for later (when offline)
	 */
	function queueSave(documentId: string, content: string): string {
		const save: PendingSave = {
			id: `save_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
			documentId,
			content,
			timestamp: Date.now()
		};

		state.pendingSaves = [...state.pendingSaves, save];
		
		// Limit queue to 10 saves
		if (state.pendingSaves.length > 10) {
			state.pendingSaves = state.pendingSaves.slice(-10);
		}
		
		savePendingSaves();
		return save.id;
	}

	/**
	 * Retry pending saves (called when back online)
	 */
	async function retryPendingSaves(): Promise<void> {
		if (state.pendingSaves.length === 0) return;

		const successful: string[] = [];

		for (const save of state.pendingSaves) {
			try {
				// Dispatch event for parent component to handle save
				window.dispatchEvent(new CustomEvent('retry-save', { 
					detail: { 
						documentId: save.documentId, 
						content: save.content 
					}
				}));
				successful.push(save.id);
			} catch (err) {
				console.error('Failed to retry save:', err);
			}
		}

		// Remove successful saves from queue
		state.pendingSaves = state.pendingSaves.filter(s => !successful.includes(s.id));
		savePendingSaves();
		
		if (successful.length > 0) {
			state.lastSync = Date.now();
			saveState();
		}
	}

	/**
	 * Clear pending saves
	 */
	function clearPendingSaves(): void {
		state.pendingSaves = [];
		savePendingSaves();
	}

	function saveState(): void {
		if (!browser) return;
		localStorage.setItem(STORAGE_KEY, JSON.stringify({
			isOnline: state.isOnline,
			lastSync: state.lastSync
		}));
	}

	function loadPendingSaves(): void {
		if (!browser) return;
		try {
			const raw = localStorage.getItem(QUEUE_KEY);
			if (raw) {
				state.pendingSaves = JSON.parse(raw);
			}
		} catch (err) {
			console.error('Failed to load pending saves:', err);
			state.pendingSaves = [];
		}
	}

	function savePendingSaves(): void {
		if (!browser) return;
		localStorage.setItem(QUEUE_KEY, JSON.stringify(state.pendingSaves));
	}

	/**
	 * Get pending save count
	 */
	const pendingCount = $derived(state.pendingSaves.length);

	/**
	 * Check if there are pending saves
	 */
	const hasPendingSaves = $derived(state.pendingSaves.length > 0);

	function destroy(): void {
		window.removeEventListener('online', handleOnline);
		window.removeEventListener('offline', handleOffline);
	}

	return {
		get state() { return state; },
		get isOnline() { return state.isOnline; },
		get isOffline() { return !state.isOnline; },
		get pendingCount() { return pendingCount; },
		get hasPendingSaves() { return hasPendingSaves; },
		get lastSync() { return state.lastSync; },
		init,
		queueSave,
		retryPendingSaves,
		clearPendingSaves,
		destroy
	};
}

export const offlineStore = createOfflineStore();
