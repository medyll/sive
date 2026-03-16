<script lang="ts">
	import { setFilters, clearFilters, searchState } from '$lib/searchStore.svelte';
	import type { SearchFilter } from '$lib/server/search';

	export interface FilterPanelProps {
		allTags?: string[];
		documents?: Array<{ id: string; tags?: string[] }>;
	}

	let { allTags = [], documents = [] }: FilterPanelProps = $props();

	// Local filter state
	let selectedTags = $state<string[]>([]);
	let dateRangeStart = $state<string>('');
	let dateRangeEnd = $state<string>('');
	let sortBy = $state<'score' | 'date_modified' | 'date_created' | 'title'>('score');
	let sortOrder = $state<'asc' | 'desc'>('desc');

	// Restore from store on mount
	$effect(() => {
		const unsubscribe = searchState.subscribe((state) => {
			selectedTags = state.filters.tags || [];
			if (state.filters.dateRangeStart) {
				dateRangeStart = new Date(state.filters.dateRangeStart).toISOString().split('T')[0];
			}
			if (state.filters.dateRangeEnd) {
				dateRangeEnd = new Date(state.filters.dateRangeEnd).toISOString().split('T')[0];
			}
			sortBy = (state.filters.sortBy as any) || 'score';
			sortOrder = (state.filters.sortOrder as any) || 'desc';
		});

		return () => unsubscribe();
	});

	function toggleTag(tag: string) {
		selectedTags = selectedTags.includes(tag)
			? selectedTags.filter((t) => t !== tag)
			: [...selectedTags, tag].slice(-5); // Max 5 tags

		applyFilters();
	}

	function handleDateStartChange(e: Event) {
		dateRangeStart = (e.target as HTMLInputElement).value;
		applyFilters();
	}

	function handleDateEndChange(e: Event) {
		dateRangeEnd = (e.target as HTMLInputElement).value;
		applyFilters();
	}

	function handleSortByChange(e: Event) {
		sortBy = (e.target as HTMLSelectElement).value as any;
		applyFilters();
	}

	function handleSortOrderChange(e: Event) {
		sortOrder = (e.target as HTMLSelectElement).value as any;
		applyFilters();
	}

	function applyFilters() {
		const filter: SearchFilter = {
			sortBy: sortBy === 'score' ? undefined : sortBy,
			sortOrder: sortOrder === 'desc' ? sortOrder : undefined
		};

		if (selectedTags.length > 0) {
			filter.tags = selectedTags;
		}

		if (dateRangeStart) {
			filter.dateRangeStart = new Date(dateRangeStart).getTime();
		}

		if (dateRangeEnd) {
			const endDate = new Date(dateRangeEnd);
			endDate.setHours(23, 59, 59, 999); // Include entire end day
			filter.dateRangeEnd = endDate.getTime();
		}

		setFilters(filter);
	}

	function handleClearAllFilters() {
		selectedTags = [];
		dateRangeStart = '';
		dateRangeEnd = '';
		sortBy = 'score';
		sortOrder = 'desc';
		clearFilters();
	}

	function isFilterActive(): boolean {
		return selectedTags.length > 0 || dateRangeStart || dateRangeEnd || sortBy !== 'score';
	}
</script>

<div class="filter-panel">
	<!-- Filter header -->
	<div class="filter-header">
		<h3 class="filter-title">Filters</h3>
		{#if isFilterActive()}
			<button
				class="clear-all-button"
				onClick={handleClearAllFilters}
				title="Clear all filters"
				aria-label="Clear all filters"
			>
				Clear All
			</button>
		{/if}
	</div>

	<!-- Tag Filter -->
	{#if allTags.length > 0}
		<div class="filter-section">
			<h4 class="filter-label">Tags</h4>
			<div class="tags-grid">
				{#each allTags.slice(0, 10) as tag (tag)}
					<label class="tag-checkbox">
						<input
							type="checkbox"
							checked={selectedTags.includes(tag)}
							onChange={() => toggleTag(tag)}
							disabled={selectedTags.length >= 5 && !selectedTags.includes(tag)}
						/>
						<span class="tag-label">{tag}</span>
						<span class="tag-count">
							({documents.filter((d) => d.tags?.includes(tag)).length})
						</span>
					</label>
				{/each}

				{#if allTags.length > 10}
					<div class="tag-more-hint">
						+{allTags.length - 10} more tags
					</div>
				{/if}
			</div>

			{#if selectedTags.length >= 5}
				<p class="tag-limit-warning">Max 5 tags selected</p>
			{/if}
		</div>
	{/if}

	<!-- Date Range Filter -->
	<div class="filter-section">
		<h4 class="filter-label">Date Range</h4>
		<div class="date-inputs">
			<div class="date-input-group">
				<label for="date-start" class="date-input-label">From</label>
				<input
					id="date-start"
					type="date"
					class="date-input"
					value={dateRangeStart}
					onChange={handleDateStartChange}
				/>
			</div>

			<div class="date-input-group">
				<label for="date-end" class="date-input-label">To</label>
				<input
					id="date-end"
					type="date"
					class="date-input"
					value={dateRangeEnd}
					onChange={handleDateEndChange}
				/>
			</div>
		</div>
	</div>

	<!-- Sort Options -->
	<div class="filter-section">
		<h4 class="filter-label">Sort</h4>
		<div class="sort-controls">
			<select
				class="sort-select"
				value={sortBy}
				onChange={handleSortByChange}
				aria-label="Sort by"
			>
				<option value="score">Relevance</option>
				<option value="date_modified">Modified Date</option>
				<option value="date_created">Created Date</option>
				<option value="title">Title</option>
			</select>

			<select
				class="sort-select"
				value={sortOrder}
				onChange={handleSortOrderChange}
				aria-label="Sort order"
			>
				<option value="desc">Newest First</option>
				<option value="asc">Oldest First</option>
			</select>
		</div>
	</div>

	<!-- Active Filters Display -->
	{#if selectedTags.length > 0 || dateRangeStart || dateRangeEnd}
		<div class="active-filters">
			<h4 class="active-filters-label">Active Filters</h4>
			<div class="active-filter-chips">
				{#each selectedTags as tag (tag)}
					<span class="filter-chip">
						{tag}
						<button
							class="chip-remove"
							onClick={() => toggleTag(tag)}
							aria-label={`Remove ${tag} filter`}
						>
							×
						</button>
					</span>
				{/each}

				{#if dateRangeStart}
					<span class="filter-chip">
						From {dateRangeStart}
						<button
							class="chip-remove"
							onClick={() => {
								dateRangeStart = '';
								applyFilters();
							}}
							aria-label="Remove start date filter"
						>
							×
						</button>
					</span>
				{/if}

				{#if dateRangeEnd}
					<span class="filter-chip">
						To {dateRangeEnd}
						<button
							class="chip-remove"
							onClick={() => {
								dateRangeEnd = '';
								applyFilters();
							}}
							aria-label="Remove end date filter"
						>
							×
						</button>
					</span>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.filter-panel {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		padding: 1rem;
		background: white;
		border-radius: 0.5rem;
	}

	.filter-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
	}

	.filter-title {
		margin: 0;
		font-size: 1rem;
		font-weight: 700;
		color: #1f2937;
	}

	.clear-all-button {
		padding: 0.25rem 0.75rem;
		border: 1px solid #e5e7eb;
		border-radius: 0.375rem;
		background: white;
		font-size: 0.75rem;
		color: #6b7280;
		cursor: pointer;
		transition: all 0.2s;
	}

	.clear-all-button:hover {
		border-color: #d1d5db;
		background: #f9fafb;
	}

	.filter-section {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.filter-label {
		margin: 0;
		font-size: 0.875rem;
		font-weight: 600;
		color: #374151;
	}

	/* Tag Filter */
	.tags-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 0.5rem;
	}

	.tag-checkbox {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.375rem;
		cursor: pointer;
		border-radius: 0.375rem;
		transition: background-color 0.2s;
	}

	.tag-checkbox:hover {
		background-color: #f3f4f6;
	}

	.tag-checkbox input[type='checkbox'] {
		cursor: pointer;
	}

	.tag-checkbox input[type='checkbox']:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.tag-label {
		font-size: 0.875rem;
		color: #374151;
		flex: 1;
	}

	.tag-count {
		font-size: 0.75rem;
		color: #9ca3af;
	}

	.tag-more-hint {
		font-size: 0.75rem;
		color: #9ca3af;
		padding: 0.375rem;
		font-style: italic;
	}

	.tag-limit-warning {
		margin: 0;
		padding: 0.5rem;
		font-size: 0.75rem;
		color: #dc2626;
		background: #fef2f2;
		border-radius: 0.375rem;
	}

	/* Date Range Filter */
	.date-inputs {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.75rem;
	}

	.date-input-group {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.date-input-label {
		font-size: 0.75rem;
		color: #6b7280;
		font-weight: 500;
	}

	.date-input {
		padding: 0.5rem;
		border: 1px solid #e5e7eb;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		font-family: inherit;
	}

	.date-input:focus {
		outline: 2px solid #3b82f6;
		outline-offset: -2px;
	}

	/* Sort Options */
	.sort-controls {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.75rem;
	}

	.sort-select {
		padding: 0.5rem;
		border: 1px solid #e5e7eb;
		border-radius: 0.375rem;
		background: white;
		font-size: 0.875rem;
		font-family: inherit;
		cursor: pointer;
	}

	.sort-select:focus {
		outline: 2px solid #3b82f6;
		outline-offset: -2px;
	}

	/* Active Filters */
	.active-filters {
		padding: 1rem;
		background: #f0f9ff;
		border-radius: 0.375rem;
		border-left: 3px solid #3b82f6;
	}

	.active-filters-label {
		margin: 0 0 0.5rem 0;
		font-size: 0.75rem;
		font-weight: 600;
		color: #1e40af;
		text-transform: uppercase;
	}

	.active-filter-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.filter-chip {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.375rem 0.75rem;
		background: white;
		border: 1px solid #93c5fd;
		border-radius: 9999px;
		font-size: 0.75rem;
		color: #1e40af;
	}

	.chip-remove {
		margin-left: 0.25rem;
		padding: 0;
		border: none;
		background: transparent;
		color: #1e40af;
		cursor: pointer;
		font-size: 1rem;
		line-height: 1;
		transition: color 0.2s;
	}

	.chip-remove:hover {
		color: #dc2626;
	}

	/* Mobile responsive */
	@media (max-width: 640px) {
		.filter-panel {
			padding: 0.75rem;
		}

		.sort-controls,
		.date-inputs {
			grid-template-columns: 1fr;
		}
	}
</style>
