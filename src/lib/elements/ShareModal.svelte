<script lang="ts">
	import { onMount } from 'svelte';

	interface ShareEntry {
		id: string;
		user_id: string;
		role: 'owner' | 'editor' | 'viewer';
		email?: string;
		name?: string;
	}

	interface SearchUser {
		id: string;
		email: string;
		name?: string;
	}

	interface Props {
		documentId: string;
		isOwner: boolean;
		onClose: () => void;
		onShared?: (email: string) => void;
	}

	let { documentId, isOwner, onClose, onShared }: Props = $props();

	let shares: ShareEntry[] = $state([]);
	let searchQuery = $state('');
	let searchResults: SearchUser[] = $state([]);
	let selectedUser: SearchUser | null = $state(null);
	let selectedRole: 'editor' | 'viewer' = $state('editor');
	let isLoading = $state(false);
	let error = $state('');
	let searchDebounce: ReturnType<typeof setTimeout>;

	async function loadShares() {
		if (!documentId) return;
		try {
			const res = await fetch(`/api/shares?documentId=${encodeURIComponent(documentId)}`);
			if (res.ok) {
				const data = await res.json();
				shares = data.shares ?? [];
			}
		} catch {
			// shares remain empty on network error
		}
	}

	async function searchUsers(q: string) {
		if (q.length < 2) {
			searchResults = [];
			return;
		}
		try {
			const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`);
			if (res.ok) {
				const data = await res.json();
				searchResults = data.users ?? [];
			}
		} catch {
			searchResults = [];
		}
	}

	function onSearchInput() {
		clearTimeout(searchDebounce);
		selectedUser = null;
		searchDebounce = setTimeout(() => searchUsers(searchQuery), 300);
	}

	function selectUser(user: SearchUser) {
		selectedUser = user;
		searchQuery = user.email;
		searchResults = [];
	}

	async function inviteUser() {
		if (!selectedUser) return;
		isLoading = true;
		error = '';
		try {
			const res = await fetch('/api/shares', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ documentId, targetEmail: selectedUser.email, role: selectedRole })
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				error = (data as { message?: string }).message ?? 'Failed to invite user';
			} else {
				const sharedEmail = selectedUser.email;
				searchQuery = '';
				selectedUser = null;
				await loadShares();
				onShared?.(sharedEmail);
			}
		} catch {
			error = 'Network error';
		} finally {
			isLoading = false;
		}
	}

	async function updateRole(shareId: string, role: 'editor' | 'viewer') {
		if (!isOwner) return;
		const res = await fetch(`/api/shares/${shareId}`, {
			method: 'PATCH',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ role })
		});
		if (res.ok) {
			shares = shares.map((s) => (s.id === shareId ? { ...s, role } : s));
		}
	}

	async function removeShare(shareId: string) {
		if (!isOwner) return;
		const res = await fetch(`/api/shares/${shareId}`, { method: 'DELETE' });
		if (res.ok) {
			shares = shares.filter((s) => s.id !== shareId);
		}
	}

	function handleBackdropClick(e: MouseEvent) {
		if ((e.target as HTMLElement).classList.contains('modal-backdrop')) onClose();
	}

	onMount(() => {
		loadShares();
	});
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="modal-backdrop" role="button" tabindex="0" onclick={handleBackdropClick} onkeydown={(e) => { if (e.key==='Enter' || e.key===' ') handleBackdropClick(e as unknown as MouseEvent); }} data-testid="share-modal-backdrop">
	<div class="modal" role="dialog" aria-modal="true" aria-label="Share document" data-testid="share-modal">
		<div class="modal-header">
			<h2 class="modal-title">Share document</h2>
			<button class="close-btn" onclick={onClose} aria-label="Close">✕</button>
		</div>

		<!-- Invite section (owner only) -->
		{#if isOwner}
			<div class="invite-section">
				<label class="invite-label" for="user-search">Invite by email</label>
				<div class="invite-row">
					<div class="search-wrapper">
						<input
							id="user-search"
							type="email"
							class="search-input"
							placeholder="user@example.com"
							bind:value={searchQuery}
							oninput={onSearchInput}
							data-testid="user-search-input"
							autocomplete="off"
						/>
						{#if searchResults.length > 0}
							<ul class="search-suggestions" role="listbox">
								{#each searchResults as user (user.id)}
									<li
										class="suggestion-item"
										role="option"
										aria-selected={selectedUser?.id === user.id}
										onclick={() => selectUser(user)} onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') selectUser(user); }} tabindex="0"
										data-testid="user-suggestion"
									>
										<span class="suggestion-name">{user.name ?? user.email}</span>
										<span class="suggestion-email">{user.email}</span>
									</li>
								{/each}
							</ul>
						{/if}
					</div>

					<select class="role-select" bind:value={selectedRole} data-testid="role-select">
						<option value="editor">Editor</option>
						<option value="viewer">Viewer</option>
					</select>

					<button
						class="invite-btn"
						onclick={inviteUser}
						disabled={!selectedUser || isLoading}
						data-testid="invite-btn"
					>
						{isLoading ? 'Inviting…' : 'Invite'}
					</button>
				</div>
				{#if error}
					<p class="error-msg" data-testid="invite-error">{error}</p>
				{/if}
			</div>
		{/if}

		<!-- Collaborators list -->
		<div class="collaborators-section">
			<h3 class="section-title">Collaborators</h3>
			{#if shares.length === 0}
				<p class="empty-state">No collaborators yet.</p>
			{:else}
				<ul class="collaborator-list" data-testid="collaborator-list">
					{#each shares as share (share.id)}
						<li class="collaborator-item" data-testid="collaborator-item">
							<div class="collaborator-info">
								<span class="collaborator-name">{share.name ?? share.email ?? share.user_id}</span>
								{#if share.email}
									<span class="collaborator-email">{share.email}</span>
								{/if}
							</div>

							{#if share.role === 'owner' || !isOwner}
								<span class="role-badge role-{share.role}">{share.role}</span>
							{:else}
								<select
									class="role-select-inline"
									value={share.role}
									onchange={(e) => updateRole(share.id, (e.target as HTMLSelectElement).value as 'editor' | 'viewer')}
									data-testid="collaborator-role-select"
								>
									<option value="editor">Editor</option>
									<option value="viewer">Viewer</option>
								</select>
								<button
									class="remove-btn"
									onclick={() => removeShare(share.id)}
									title="Remove collaborator"
									data-testid="remove-collaborator-btn"
								>✕</button>
							{/if}
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</div>
</div>

<style>
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.45);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.modal {
		background: var(--color-surface, #fff);
		border-radius: 0.75rem;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
		padding: 1.5rem;
		width: min(480px, 95vw);
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.modal-title {
		margin: 0;
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--color-text, #333);
	}

	.close-btn {
		background: none;
		border: none;
		cursor: pointer;
		font-size: 1rem;
		color: var(--color-text-secondary, #666);
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
	}

	.close-btn:hover {
		background: var(--color-hover, #f5f5f5);
	}

	.invite-section {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.invite-label {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-text, #333);
	}

	.invite-row {
		display: flex;
		gap: 0.5rem;
		align-items: flex-start;
	}

	.search-wrapper {
		flex: 1;
		position: relative;
	}

	.search-input {
		width: 100%;
		padding: 0.5rem 0.75rem;
		border: 1px solid var(--color-border, #e0e0e0);
		border-radius: 0.375rem;
		font-size: 0.875rem;
		box-sizing: border-box;
	}

	.search-suggestions {
		position: absolute;
		top: calc(100% + 4px);
		left: 0;
		right: 0;
		background: var(--color-surface, #fff);
		border: 1px solid var(--color-border, #e0e0e0);
		border-radius: 0.375rem;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		list-style: none;
		margin: 0;
		padding: 0.25rem 0;
		z-index: 10;
	}

	.suggestion-item {
		display: flex;
		flex-direction: column;
		padding: 0.5rem 0.75rem;
		cursor: pointer;
		font-size: 0.875rem;
	}

	.suggestion-item:hover {
		background: var(--color-hover, #f5f5f5);
	}

	.suggestion-name {
		font-weight: 500;
	}

	.suggestion-email {
		color: var(--color-text-secondary, #666);
		font-size: 0.75rem;
	}

	.role-select,
	.role-select-inline {
		padding: 0.5rem;
		border: 1px solid var(--color-border, #e0e0e0);
		border-radius: 0.375rem;
		font-size: 0.875rem;
		background: var(--color-surface, #fff);
		cursor: pointer;
	}

	.invite-btn {
		padding: 0.5rem 1rem;
		background: var(--color-primary, #646cff);
		color: white;
		border: none;
		border-radius: 0.375rem;
		cursor: pointer;
		font-size: 0.875rem;
		font-weight: 500;
		white-space: nowrap;
	}

	.invite-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.error-msg {
		margin: 0;
		font-size: 0.8rem;
		color: #e53e3e;
	}

	.section-title {
		margin: 0 0 0.75rem;
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-secondary, #666);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.collaborators-section {
		border-top: 1px solid var(--color-border, #e0e0e0);
		padding-top: 1rem;
	}

	.empty-state {
		margin: 0;
		font-size: 0.875rem;
		color: var(--color-text-secondary, #999);
		text-align: center;
		padding: 1rem 0;
	}

	.collaborator-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.collaborator-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.5rem 0;
	}

	.collaborator-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.collaborator-name {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-text, #333);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.collaborator-email {
		font-size: 0.75rem;
		color: var(--color-text-secondary, #666);
	}

	.role-badge {
		font-size: 0.75rem;
		padding: 0.2rem 0.5rem;
		border-radius: 0.25rem;
		font-weight: 500;
		text-transform: capitalize;
	}

	.role-badge.role-owner {
		background: #e9d8fd;
		color: #553c9a;
	}

	.role-badge.role-editor {
		background: #bee3f8;
		color: #2b6cb0;
	}

	.role-badge.role-viewer {
		background: #f0fff4;
		color: #276749;
	}

	.remove-btn {
		background: none;
		border: none;
		cursor: pointer;
		color: var(--color-text-secondary, #999);
		padding: 0.25rem 0.4rem;
		border-radius: 0.25rem;
		font-size: 0.75rem;
		line-height: 1;
	}

	.remove-btn:hover {
		background: #fed7d7;
		color: #e53e3e;
	}
</style>
