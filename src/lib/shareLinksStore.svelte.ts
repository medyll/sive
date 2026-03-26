/**
 * shareLinksStore — Track created shareable goal links
 *
 * Stores links created by the current user so they can manage
 * (view, copy, revoke) their active goal share links.
 */

import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';

export interface ShareLink {
	token: string;
	url: string;
	expiresAt: string;
	createdAt: string;
}

export interface ShareLinksData {
	links: ShareLink[];
}

const STORAGE_KEY = 'sive:goal-share-links';

const DEFAULT: ShareLinksData = {
	links: []
};

function load(): ShareLinksData {
	if (typeof localStorage === 'undefined') return { ...DEFAULT };
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? { ...DEFAULT, ...JSON.parse(raw) } : { ...DEFAULT };
	} catch {
		return { ...DEFAULT };
	}
}

function save(data: ShareLinksData): void {
	if (typeof localStorage !== 'undefined') {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
	}
}

function createStore() {
	const { subscribe, set, update } = writable<ShareLinksData>(load());

	return {
		subscribe,

		/**
		 * Add a new share link
		 */
		addLink(link: ShareLink) {
			update((data) => {
				const newLink = { ...link, createdAt: new Date().toISOString() };
				const updated = {
					...data,
					links: [newLink, ...data.links]
				};
				save(updated);
				return updated;
			});
		},

		/**
		 * Remove a revoked link
		 */
		removeLink(token: string) {
			update((data) => {
				const updated = {
					...data,
					links: data.links.filter((l) => l.token !== token)
				};
				save(updated);
				return updated;
			});
		},

		/**
		 * Get active links (not expired) - reads current store state
		 */
		getActiveLinks(): ShareLink[] {
			let result: ShareLink[] = [];
			const unsubscribe = subscribe((data) => {
				const now = new Date();
				result = data.links.filter((l) => new Date(l.expiresAt) > now);
			});
			unsubscribe();
			return result;
		},

		/**
		 * Clear all links
		 */
		clear() {
			const clearedData = { ...DEFAULT };
			save(clearedData);
			set(clearedData);
		}
	};
}

export const shareLinksStore = createStore();
