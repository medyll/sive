import { describe, it, expect, vi } from 'vitest';

// Verify all palette commands are registered
describe('S55 — palette commands coverage', () => {
	it('all expected palette commands are registered', async () => {
		const { getAllCommands, registerStaticCommands } = await import('./commandRegistry');
		registerStaticCommands(() => {});
		const ids = getAllCommands().map(c => c.id);

		const required = [
			'doc:new',
			'doc:search',
			'doc:export:pdf',
			'view:focus',
			'view:shortcuts',
			'view:theme',
			'nav:settings',
		];
		for (const id of required) {
			expect(ids, `missing command: ${id}`).toContain(id);
		}
	});

	it('palette:toggleTheme action dispatches event', async () => {
		const { getAllCommands, registerStaticCommands } = await import('./commandRegistry');
		registerStaticCommands(() => {});
		const dispatched: string[] = [];
		vi.stubGlobal('window', {
			...globalThis.window,
			dispatchEvent: (e: Event) => { dispatched.push(e.type); return true; }
		});
		const cmd = getAllCommands().find(c => c.id === 'view:theme');
		cmd?.action();
		expect(dispatched).toContain('palette:toggleTheme');
		vi.unstubAllGlobals();
	});
});
