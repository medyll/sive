/**
 * PWA engagement tracking — controls install prompt visibility
 */

const SAVES_KEY = 'sive:pwa:saves';
const DISMISSED_KEY = 'sive:pwa:dismissed-until';
const INSTALLED_KEY = 'sive:pwa:installed';
const COOLDOWN_DAYS = 7;
const GATE_SAVES = 2;

function createPwaStore() {
	let saveCount = $state(parseInt(localStorage.getItem(SAVES_KEY) ?? '0', 10));
	let installed = $state(localStorage.getItem(INSTALLED_KEY) === 'true');

	function recordSave() {
		saveCount++;
		localStorage.setItem(SAVES_KEY, String(saveCount));
	}

	function dismiss() {
		const until = Date.now() + COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
		localStorage.setItem(DISMISSED_KEY, String(until));
	}

	function markInstalled() {
		installed = true;
		localStorage.setItem(INSTALLED_KEY, 'true');
	}

	function shouldShow(): boolean {
		if (installed) return false;
		if (saveCount < GATE_SAVES) return false;
		const until = parseInt(localStorage.getItem(DISMISSED_KEY) ?? '0', 10);
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
