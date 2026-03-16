import { browser } from '$app/environment';

export interface ActiveUser {
	userId: string;
	name?: string;
	status: 'active' | 'idle' | 'offline';
	lastSeen: number;
}

interface DocPresence {
	[docId: string]: ActiveUser[];
}

const IDLE_TIMEOUT_MS = 30_000; // 30 seconds
const OFFLINE_TIMEOUT_MS = 120_000; // 2 minutes

function createPresenceStore() {
	let docPresence = $state<DocPresence>({});
	let lastActivityTime = $state<number>(Date.now());

	function recordActivity(): void {
		lastActivityTime = Date.now();
	}

	function setPresence(docId: string, users: ActiveUser[]): void {
		const now = Date.now();
		const processed = users.map((u) => {
			const idleTime = now - u.lastSeen;
			const newStatus: ActiveUser['status'] =
				idleTime > OFFLINE_TIMEOUT_MS ? 'offline' : idleTime > IDLE_TIMEOUT_MS ? 'idle' : 'active';
			return { ...u, status: newStatus };
		});
		docPresence = { ...docPresence, [docId]: processed };
	}

	function getPresence(docId: string): ActiveUser[] {
		return docPresence[docId] ?? [];
	}

	function getActiveCount(docId: string): number {
		const users = getPresence(docId);
		return users.filter((u) => u.status !== 'offline').length;
	}

	function getActivityBadge(docId: string): { count: number; color: 'green' | 'blue' | 'red' } {
		const count = getActiveCount(docId);
		if (count === 0) return { count: 0, color: 'green' };
		if (count <= 2) return { count, color: 'green' };
		if (count <= 5) return { count, color: 'blue' };
		return { count, color: 'red' };
	}

	function cleanupOfflineUsers(docId: string): void {
		const users = getPresence(docId);
		const active = users.filter((u) => u.status !== 'offline');
		if (active.length === 0) {
			clearPresence(docId);
		} else {
			docPresence = { ...docPresence, [docId]: active };
		}
	}

	function clearPresence(docId: string): void {
		const next = { ...docPresence };
		delete next[docId];
		docPresence = next;
	}

	return { recordActivity, setPresence, getPresence, getActiveCount, getActivityBadge, cleanupOfflineUsers, clearPresence };
}

export const presenceStore = createPresenceStore();
