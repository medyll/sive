/**
 * Plugin / user-command system
 * Plugins are JS snippets stored in localStorage that register custom commands.
 */

import { registerCommand, unregisterCommand } from './commandRegistry';

export interface Plugin {
	id: string;
	name: string;
	description: string;
	shortcut?: string;
	script: string; // JS body — receives (ctx) => void
	enabled: boolean;
	createdAt: string;
}

const STORAGE_KEY = 'sive:plugins';
const MAX_PLUGINS = 10;

function load(): Plugin[] {
	if (typeof localStorage === 'undefined') return [];
	try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'); } catch { return []; }
}

function persist(list: Plugin[]) {
	if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function createPluginStore() {
	let plugins = $state<Plugin[]>(load());

	function add(input: Omit<Plugin, 'id' | 'createdAt' | 'enabled'>): Plugin | null {
		if (plugins.length >= MAX_PLUGINS) return null;
		const plugin: Plugin = {
			...input,
			id: 'plugin:' + crypto.randomUUID(),
			enabled: true,
			createdAt: new Date().toISOString()
		};
		plugins = [...plugins, plugin];
		persist(plugins);
		if (plugin.enabled) mountPlugin(plugin);
		return plugin;
	}

	function remove(id: string) {
		unmountPlugin(id);
		plugins = plugins.filter((p) => p.id !== id);
		persist(plugins);
	}

	function toggle(id: string) {
		plugins = plugins.map((p) => {
			if (p.id !== id) return p;
			const updated = { ...p, enabled: !p.enabled };
			updated.enabled ? mountPlugin(updated) : unmountPlugin(id);
			return updated;
		});
		persist(plugins);
	}

	function mountPlugin(p: Plugin) {
		try {
			const fn = new Function('ctx', p.script) as (ctx: object) => void;
			registerCommand({
				id: p.id,
				label: p.name,
				keywords: p.name.toLowerCase().split(/\s+/),
				category: 'plugin',
				shortcut: p.shortcut,
				action: () => {
					try { fn({ toast: (m: string) => console.info('[plugin]', m) }); }
					catch (e) { console.error('[plugin error]', p.name, e); }
				}
			});
		} catch (e) {
			console.error('[plugin mount error]', p.name, e);
		}
	}

	function unmountPlugin(id: string) {
		unregisterCommand(id);
	}

	// Mount all enabled plugins on init
	function init() {
		for (const p of plugins) if (p.enabled) mountPlugin(p);
	}

	return {
		get plugins() { return plugins; },
		add,
		remove,
		toggle,
		init
	};
}

export const pluginStore = createPluginStore();
