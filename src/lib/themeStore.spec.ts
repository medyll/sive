import { describe, it, expect, beforeEach, vi } from 'vitest';

const store: Record<string, string> = {};
vi.stubGlobal('localStorage', {
	getItem: (k: string) => store[k] ?? null,
	setItem: (k: string, v: string) => { store[k] = v; },
	removeItem: (k: string) => { delete store[k]; },
	clear: () => { for (const k in store) delete store[k]; }
});

const classes = new Set<string>();
vi.stubGlobal('document', {
	documentElement: {
		classList: {
			add: (c: string) => classes.add(c),
			remove: (c: string) => classes.delete(c),
			contains: (c: string) => classes.has(c)
		}
	}
});

const dispatched: string[] = [];
vi.stubGlobal('window', {
	matchMedia: () => ({ matches: false }),
	dispatchEvent: (e: Event) => { dispatched.push(e.type); return true; }
});

beforeEach(async () => {
	for (const k in store) delete store[k];
	classes.clear();
	dispatched.length = 0;
	vi.resetModules();
});

describe('themeStore', () => {
	it('defaults to light when no preference saved', async () => {
		const { themeStore } = await import('./themeStore.svelte');
		expect(themeStore.theme).toBe('light');
	});

	it('loads dark from localStorage', async () => {
		store['sive:theme'] = 'dark';
		const { themeStore } = await import('./themeStore.svelte');
		expect(themeStore.theme).toBe('dark');
	});

	it('setTheme(dark) adds .dark class to <html>', async () => {
		const { themeStore } = await import('./themeStore.svelte');
		themeStore.setTheme('dark');
		expect(classes.has('dark')).toBe(true);
	});

	it('setTheme(light) removes .dark class', async () => {
		const { themeStore } = await import('./themeStore.svelte');
		themeStore.setTheme('dark');
		themeStore.setTheme('light');
		expect(classes.has('dark')).toBe(false);
	});

	it('setTheme persists to localStorage', async () => {
		const { themeStore } = await import('./themeStore.svelte');
		themeStore.setTheme('dark');
		expect(store['sive:theme']).toBe('dark');
	});

	it('setTheme dispatches theme:change event', async () => {
		const { themeStore } = await import('./themeStore.svelte');
		themeStore.setTheme('dark');
		expect(dispatched).toContain('theme:change');
	});
});
