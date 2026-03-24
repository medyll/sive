/**
 * Theme store — persists light/dark preference and applies class to <html>
 */

const STORAGE_KEY = 'sive:theme';

type Theme = 'light' | 'dark';

function createThemeStore() {
	let theme = $state<Theme>(loadTheme());

	function loadTheme(): Theme {
		if (typeof localStorage === 'undefined') return 'light';
		const saved = localStorage.getItem(STORAGE_KEY);
		if (saved === 'dark' || saved === 'light') return saved;
		// Respect OS preference on first visit
		if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
			return 'dark';
		}
		return 'light';
	}

	function apply(t: Theme) {
		if (typeof document === 'undefined') return;
		if (t === 'dark') {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	}

	function setTheme(t: Theme) {
		theme = t;
		if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, t);
		apply(t);
		window.dispatchEvent(new CustomEvent('theme:change', { detail: { theme: t } }));
	}

	function init() {
		apply(theme);
	}

	return {
		get theme() { return theme; },
		setTheme,
		init
	};
}

export const themeStore = createThemeStore();
