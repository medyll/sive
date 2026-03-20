<script lang="ts">
	import { setQuery, clearSearch, selectResult, searchState, isSearchActive, resultCount } from '$lib/searchStore.svelte';
	import { formatDistanceToNow } from 'date-fns';
	import type { SearchResult } from '$lib/server/search';

	let searchInputValue = $state('');
	let isOpen = $state(false);

	// Subscribe to search state
	let query = $state('');
	let results: SearchResult[] = $state([]);
	let isSearching = $state(false);
	let error: string | null = $state(null);
	let selectedResult: string | null = $state(null);

	// Reactive updates from store
	$effect(() => {
		const unsubscribe = searchState.subscribe((state) => {
			query = state.query;
			results = state.results;
			isSearching = state.isSearching;
			error = state.error;
			selectedResult = state.selectedResult;
			searchInputValue = state.query;
		});

		return () => unsubscribe();
	});

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		searchInputValue = target.value;
		setQuery(target.value);

		// Open results if searching
		if (target.value.trim()) {
			isOpen = true;
		}
	}

	function handleClear() {
		searchInputValue = '';
		clearSearch();
		isOpen = false;
	}

	function handleSelectResult(docId: string) {
		selectResult(docId);
		// Dispatch event to parent (document list) to jump to doc
		window.dispatchEvent(
			new CustomEvent('search:selectDocument', {
				detail: { docId }
			})
		);
	}

	function formatSnippet(snippet: string): string {
		// Truncate to 100 chars if longer
		return snippet.length > 100 ? snippet.slice(0, 100) + '...' : snippet;
	}

	function highlightSnippet(snippet: string, highlights: Array<{ start: number; end: number }>) {
		if (!highlights || highlights.length === 0) {
			return snippet;
		}

		let result = '';
		let lastEnd = 0;

		for (const { start, end } of highlights) {
			result += snippet.slice(lastEnd, start);
			result += `<mark>${snippet.slice(start, end)}</mark>`;
			lastEnd = end;
		}
		result += snippet.slice(lastEnd);
		return result;
	}

	function getTagColor(index: number): string {
		const colors = ['bg-blue-100', 'bg-green-100', 'bg-purple-100', 'bg-orange-100', 'bg-pink-100'];
		return colors[index % colors.length];
	}
</script>

<div class="search-container">
	<!-- Search Input -->
	<div class="search-input-wrapper">
		<div class="search-input-group">
			<svg class="search-icon" viewBox="0 0 20 20" fill="currentColor">
				<path
					fill-rule="evenodd"
					d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
					clip-rule="evenodd"
				/>
			</svg>

			<input
				type="text"
				class="search-input"
				placeholder="Search documents... (try: title or &quot;exact phrase&quot;)"
				value={searchInputValue}
				onInput={handleInput}
				onFocus={() => (isOpen = true)}
				aria-label="Search documents"
				aria-expanded={isOpen}
			/>

			{#if searchInputValue}
				<button
					class="clear-button"
					onClick={handleClear}
					title="Clear search"
					aria-label="Clear search"
				>
					<svg viewBox="0 0 20 20" fill="currentColor">
						<path
							fill-rule="evenodd"
							d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
							clip-rule="evenodd"
						/>
					</svg>
				</button>
			{/if}
		</div>

		{#if $resultCount > 0}
			<span class="result-count">{$resultCount} result{$resultCount !== 1 ? 's' : ''}</span>
		{/if}
	</div>

	<!-- Results Dropdown -->
	{#if isOpen && searchInputValue.trim()}
		<div class="results-dropdown" role="listbox">
			{#if isSearching}
				<div class="loading">
					<div class="spinner"></div>
					<span>Searching...</span>
				</div>
			{:else if error}
				<div class="error">
					<svg viewBox="0 0 20 20" fill="currentColor">
						<path
							fill-rule="evenodd"
							d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
							clip-rule="evenodd"
						/>
					</svg>
					<span>{error}</span>
				</div>
			{:else if results.length === 0}
				<div class="empty-state">
					<svg viewBox="0 0 20 20" fill="currentColor">
						<path d="M5 5a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 11-4 0V7H7v3a2 2 0 11-4 0V5z" />
					</svg>
					<span>No documents found</span>
				</div>
			{:else}
				<ul class="results-list">
					{#each results as result (result.docId)}
						<li
							class={['result-item', result.docId === selectedResult && 'selected'].filter(Boolean).join(' ')}
							role="option"
							aria-selected={result.docId === selectedResult}
						>
							<button
								class="result-button"
								onclick={() => handleSelectResult(result.docId)}
							>
								<div class="result-header">
									<h3 class="result-title">{result.title}</h3>
									<span class="result-score">
										{result.score}% match
									</span>
								</div>

								<p
									class="result-snippet"
									{@html highlightSnippet(result.snippet, result.highlights)}
								></p>

								{#if result.tags && result.tags.length > 0}
									<div class="result-tags">
										{#each result.tags.slice(0, 3) as tag, i}
											<span class={['tag', getTagColor(i)].filter(Boolean).join(' ')}>
												{tag}
											</span>
										{/each}
										{#if result.tags.length > 3}
											<span class="tag-more">+{result.tags.length - 3}</span>
										{/if}
									</div>
								{/if}
							</button>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	{/if}

	<!-- Click outside to close -->
	{#if isOpen}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div class="backdrop" onClick={() => (isOpen = false)} />
	{/if}
</div>

<style>
	.search-container {
		position: relative;
		width: 100%;
	}

	.search-input-wrapper {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.search-input-group {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		padding: 0.5rem;
		background-color: #fff;
		transition: all 0.2s;
	}

	.search-input-group:focus-within {
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.search-icon {
		width: 1.25rem;
		height: 1.25rem;
		color: #9ca3af;
		flex-shrink: 0;
	}

	.search-input {
		flex: 1;
		border: none;
		outline: none;
		font-size: 0.875rem;
		padding: 0;
		background: transparent;
		font-family: inherit;
	}

	.clear-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.5rem;
		height: 1.5rem;
		padding: 0;
		border: none;
		background: transparent;
		color: #6b7280;
		cursor: pointer;
		transition: color 0.2s;
	}

	.clear-button:hover {
		color: #1f2937;
	}

	.clear-button svg {
		width: 1rem;
		height: 1rem;
	}

	.result-count {
		font-size: 0.75rem;
		color: #6b7280;
		padding: 0 0.5rem;
	}

	.results-dropdown {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		margin-top: 0.5rem;
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
		max-height: 400px;
		overflow-y: auto;
		z-index: 50;
	}

	.loading,
	.error,
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		padding: 2rem 1rem;
		text-align: center;
		color: #6b7280;
	}

	.loading svg,
	.error svg,
	.empty-state svg {
		width: 2rem;
		height: 2rem;
	}

	.spinner {
		width: 1.25rem;
		height: 1.25rem;
		border: 2px solid #e5e7eb;
		border-top-color: #3b82f6;
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.error {
		color: #dc2626;
	}

	.results-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.result-item {
		border-bottom: 1px solid #f3f4f6;
		transition: background-color 0.2s;
	}

	.result-item:last-child {
		border-bottom: none;
	}

	.result-item.selected {
		background-color: #f0f9ff;
	}

	.result-button {
		display: block;
		width: 100%;
		padding: 1rem;
		border: none;
		background: transparent;
		cursor: pointer;
		text-align: left;
		transition: background-color 0.2s;
	}

	.result-button:hover {
		background-color: #f9fafb;
	}

	.result-button:focus {
		outline: 2px solid #3b82f6;
		outline-offset: -2px;
	}

	.result-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}

	.result-title {
		margin: 0;
		font-size: 0.875rem;
		font-weight: 600;
		color: #1f2937;
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.result-score {
		font-size: 0.75rem;
		color: #9ca3af;
		white-space: nowrap;
		flex-shrink: 0;
	}

	.result-snippet {
		margin: 0.5rem 0;
		font-size: 0.75rem;
		color: #6b7280;
		line-height: 1.4;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
	}

	:global(.result-snippet mark) {
		background-color: #fef08a;
		color: inherit;
		font-weight: 600;
		padding: 0 2px;
	}

	.result-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.375rem;
		margin-top: 0.5rem;
	}

	.tag {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.25rem 0.5rem;
		font-size: 0.7rem;
		border-radius: 0.25rem;
		background-color: #f3f4f6;
		color: #374151;
		font-weight: 500;
	}

	.tag.color {
		background-color: var(--tag-color, #f3f4f6);
	}

	.tag-more {
		padding: 0.25rem 0.5rem;
		font-size: 0.7rem;
		color: #9ca3af;
	}

	.backdrop {
		position: fixed;
		inset: 0;
		z-index: 40;
	}

	/* Mobile responsive */
	@media (max-width: 640px) {
		.search-input {
			font-size: 1rem; /* Prevent zoom on iOS */
		}

		.results-dropdown {
			max-height: 300px;
		}

		.result-header {
			flex-direction: column;
			align-items: flex-start;
		}

		.result-score {
			align-self: flex-end;
		}
	}
</style>
