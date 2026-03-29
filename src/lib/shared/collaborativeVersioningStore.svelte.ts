/**
 * Collaborative Versioning Store
 * 
 * Manages version history in collaborative editing context.
 * Tracks multiple authors and merge versions.
 */

import type { Version } from '../elements/CollaborativeVersioning.svelte';

interface VersionInput extends Omit<Version, 'id' | 'created_at'> {
	id?: string;
	created_at?: string;
}

function createCollaborativeVersioningStore() {
	let versions = $state<Version[]>([]);
	let selectedVersion = $state<Version | null>(null);
	let showCollaborators = $state(true);
	
	/**
	 * Generate unique version ID
	 */
	function generateId(): string {
		return `v${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
	}
	
	/**
	 * Create a new version
	 */
	function createVersion(version: VersionInput): Version {
		const newVersion: Version = {
			...version,
			id: version.id || generateId(),
			created_at: version.created_at || new Date().toISOString()
		};
		
		versions.unshift(newVersion);
		return newVersion;
	}
	
	/**
	 * Create a merge version (from collaborative edit)
	 */
	function createMergeVersion(
		label: string,
		message: string,
		authors: string[],
		collaborators: string[]
	): Version {
		return createVersion({
			label,
			message,
			author: authors.join(', '),
			collaborators,
			isMerge: true
		});
	}
	
	/**
	 * Get version by ID
	 */
	function getVersion(id: string): Version | undefined {
		return versions.find(v => v.id === id);
	}
	
	/**
	 * Select a version
	 */
	function selectVersion(version: Version | null): void {
		selectedVersion = version;
	}
	
	/**
	 * Get versions by author
	 */
	function getVersionsByAuthor(author: string): Version[] {
		return versions.filter(v => v.author === author || v.collaborators?.includes(author));
	}
	
	/**
	 * Get recent versions
	 */
	function getRecentVersions(limit: number = 10): Version[] {
		return versions.slice(0, limit);
	}
	
	/**
	 * Delete a version
	 */
	function deleteVersion(id: string): void {
		versions = versions.filter(v => v.id !== id);
		if (selectedVersion?.id === id) {
			selectedVersion = null;
		}
	}
	
	/**
	 * Clear all versions
	 */
	function clear(): void {
		versions = [];
		selectedVersion = null;
	}
	
	return {
		get versions() { return versions; },
		get selectedVersion() { return selectedVersion; },
		get showCollaborators() { return showCollaborators; },
		createVersion,
		createMergeVersion,
		getVersion,
		selectVersion,
		getVersionsByAuthor,
		getRecentVersions,
		deleteVersion,
		clear,
		setShowCollaborators: (value: boolean) => { showCollaborators = value; }
	};
}

export const collaborativeVersioningStore = createCollaborativeVersioningStore();
