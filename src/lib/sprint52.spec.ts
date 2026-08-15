import { describe, it, expect, vi } from 'vitest';

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
