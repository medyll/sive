import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── S52-04: doc:search command registered ───────────────────────────────────
describe('S52-04 — doc:search command', () => {
	it('doc:search is registered in the command registry', async () => {
		const { searchCommands, registerStaticCommands } = await import('./commandRegistry');
		registerStaticCommands(() => {});
		const results = searchCommands('search documents');
		expect(results.some(c => c.id === 'doc:search')).toBe(true);
	});

	it('doc:search dispatches palette:focusSearch event', async () => {
		const { searchCommands, registerStaticCommands } = await import('./commandRegistry');
		registerStaticCommands(() => {});
		const dispatched: string[] = [];
		vi.stubGlobal('window', {
			...globalThis.window,
			dispatchEvent: (e: Event) => { dispatched.push(e.type); return true; }
		});
		const cmd = searchCommands('search documents').find(c => c.id === 'doc:search');
		cmd?.action();
		expect(dispatched).toContain('palette:focusSearch');
		vi.unstubAllGlobals();
	});
});

// ── S52-03: writing goal persisted via goalsStore ───────────────────────────
describe('S52-03 — writing goal target', () => {
	const store: Record<string, string> = {};
	beforeEach(() => {
		for (const k in store) delete store[k];
		vi.stubGlobal('localStorage', {
			getItem: (k: string) => store[k] ?? null,
			setItem: (k: string, v: string) => { store[k] = v; },
			removeItem: (k: string) => { delete store[k]; },
			clear: () => { for (const k in store) delete store[k]; }
		});
	});

	it('setDailyTarget persists to localStorage', async () => {
		const { goalsStore } = await import('./writingGoalsStore.svelte');
		goalsStore.setDailyTarget(750);
		expect(goalsStore.goals.dailyTarget).toBe(750);
		const saved = JSON.parse(store['sive:goals'] ?? '{}');
		expect(saved.dailyTarget).toBe(750);
	});
});

// ── S52-01: notification push API payload shape ──────────────────────────────
describe('S52-01 — notification push payload', () => {
	it('push() creates a notification with correct fields', async () => {
		const { push } = await import('./server/notifications');
		const n = push({
			userId: 'user-1',
			type: 'doc_shared',
			title: 'Shared with you',
			body: '"My Doc" was shared',
			docId: 'doc-42'
		});
		expect(n.id).toBeTruthy();
		expect(n.type).toBe('doc_shared');
		expect(n.read).toBe(false);
		expect(n.docId).toBe('doc-42');
	});
});
