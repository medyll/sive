/**
 * PWA engagement tracking — controls install prompt visibility
 */

const SAVES_KEY = 'sive:pwa:saves';
const DISMISSED_KEY = 'sive:pwa:dismissed-until';
const INSTALLED_KEY = 'sive:pwa:installed';
const COOLDOWN_DAYS = 7;
const GATE_SAVES = 2;

function createPwaStore() {
	const hasLocal = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
	let saveCount = $state(hasLocal ? parseInt(window.localStorage.getItem(SAVES_KEY) ?? '0', 10) : 0);
	let installed = $state(hasLocal ? window.localStorage.getItem(INSTALLED_KEY) === 'true' : false);

	function recordSave() {
		saveCount++;
		if (hasLocal) window.localStorage.setItem(SAVES_KEY, String(saveCount));
	}

	function dismiss() {
		const until = Date.now() + COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
		if (hasLocal) window.localStorage.setItem(DISMISSED_KEY, String(until));
	}

	function markInstalled() {
		installed = true;
		if (hasLocal) window.localStorage.setItem(INSTALLED_KEY, 'true');
	}

	function shouldShow(): boolean {
		if (installed) return false;
		if (saveCount < GATE_SAVES) return false;
		const until = hasLocal ? parseInt(window.localStorage.getItem(DISMISSED_KEY) ?? '0', 10) : 0;
		return Date.now() > until;
	}

	return {
		get saveCount() { return saveCount; },
		get installed() { return installed; },
		recordSave,
		dismiss,
		markInstalled,
		shouldShow
	};
}

export const pwaStore = createPwaStore();
