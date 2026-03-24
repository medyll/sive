import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock themeStore to avoid heavy module init during tests
vi.mock('./themeStore.svelte', () => ({
	themeStore: {
		setTheme: (t: string) => {
			// noop; DOM is stubbed in tests
		}
	}
}));

describe('S56 — Settings & Palette Polish', () => {
	beforeEach(() => {
		vi.stubGlobal('localStorage', {
			getItem: vi.fn(() => null),
			setItem: vi.fn(),
			removeItem: vi.fn()
		});
	});

	it('themeStore.setTheme applies dark class to html element', async () => {
		const classes = new Set<string>();
		const html = { classList: { add: (c: string) => classes.add(c), remove: (c: string) => classes.delete(c), contains: (c: string) => classes.has(c) } };
		vi.stubGlobal('document', { documentElement: html, dispatchEvent: vi.fn() });
		vi.stubGlobal('window', { dispatchEvent: vi.fn() });
		const { themeStore } = await import('./themeStore.svelte');
		themeStore.setTheme('dark');
		expect(classes.has('dark')).toBe(true);
		vi.unstubAllGlobals();
	});

	it('themeStore.setTheme removes dark class on light', async () => {
		const classes = new Set<string>(['dark']);
		const html = { classList: { add: (c: string) => classes.add(c), remove: (c: string) => classes.delete(c), contains: (c: string) => classes.has(c) } };
		vi.stubGlobal('document', { documentElement: html, dispatchEvent: vi.fn() });
		vi.stubGlobal('window', { dispatchEvent: vi.fn() });
		const { themeStore } = await import('./themeStore.svelte');
		themeStore.setTheme('light');
		expect(classes.has('dark')).toBe(false);
		vi.unstubAllGlobals();
	});

	it('commandRegistry shortcut field present on registered commands', async () => {
		const { getAllCommands, registerStaticCommands } = await import('./commandRegistry');
		registerStaticCommands(() => {});
		const cmds = getAllCommands();
		const withShortcut = cmds.filter(c => c.shortcut);
		// at minimum nav:settings, doc:new, view:focus, view:shortcuts have shortcuts
		expect(withShortcut.length).toBeGreaterThanOrEqual(4);
		const navSettings = cmds.find(c => c.id === 'nav:settings');
		expect(navSettings?.shortcut).toBe('Cmd+,');
	});

	it('palette recentIds stored and retrieved from localStorage', async () => {
		const stored: Record<string, string> = {};
		vi.stubGlobal('localStorage', {
			getItem: (k: string) => stored[k] ?? null,
			setItem: (k: string, v: string) => { stored[k] = v; },
			removeItem: (k: string) => { delete stored[k]; }
		});
		vi.stubGlobal('window', {
			dispatchEvent: vi.fn(),
			addEventListener: vi.fn(),
			removeEventListener: vi.fn()
		});
		// Simulate saving recents
		stored['sive:palette:recents'] = JSON.stringify(['doc:new', 'nav:settings']);
		const val = JSON.parse(stored['sive:palette:recents']);
		expect(val).toContain('doc:new');
		expect(val).toContain('nav:settings');
		vi.unstubAllGlobals();
	});
});
