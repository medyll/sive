<script lang="ts">
	import {
		paletteState,
		closePalette,
		setQuery,
		selectNext,
		selectPrev,
		executeSelected
	} from '$lib/commandPaletteStore.svelte';
	import type { Command, CommandCategory } from '$lib/commandRegistry';

	const CATEGORY_LABELS: Record<CommandCategory, string> = {
		navigation: 'Navigation',
		document: 'Document',
		ai: 'AI',
		settings: 'Settings',
		view: 'View'
	};

	// Group results by category
	let grouped = $derived(() => {
		const map = new Map<string, Command[]>();
		for (const cmd of paletteState.results) {
			const key = paletteState.query.trim() ? cmd.category : (map.size === 0 && paletteState.recentIds.includes(cmd.id) ? 'recent' : cmd.category);
			if (!map.has(key)) map.set(key, []);
			map.get(key)!.push(cmd);
		}
		return map;
	});

	// Flat index for aria-activedescendant
	function cmdId(cmd: Command) {
		return `palette-cmd-${cmd.id.replace(/:/g, '-')}`;
	}

	function handleInput(e: Event) {
		setQuery((e.target as HTMLInputElement).value);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'ArrowDown') { e.preventDefault(); selectNext(); }
		else if (e.key === 'ArrowUp') { e.preventDefault(); selectPrev(); }
		else if (e.key === 'Enter') { e.preventDefault(); executeSelected(); }
		else if (e.key === 'Escape') { e.preventDefault(); closePalette(); }
	}

	let inputEl: HTMLInputElement | undefined = $state();

	$effect(() => {
		if (paletteState.open && inputEl) {
			// Use rAF to ensure DOM is painted before focus
			requestAnimationFrame(() => inputEl?.focus());
		}
	});
</script>

{#if paletteState.open}
	<!-- Backdrop -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div class="backdrop" onclick={closePalette} aria-hidden="true"></div>

	<!-- Modal -->
	<div class="palette" role="dialog" aria-label="Command palette" aria-modal="true">
		<!-- Input -->
		<div class="search-row">
			<svg class="search-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
				<path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
			</svg>
			<input
				bind:this={inputEl}
				class="search-input"
				type="text"
				placeholder="Search commands…"
				value={paletteState.query}
				oninput={handleInput}
				onkeydown={handleKeydown}
				role="combobox"
				aria-expanded="true"
				aria-controls="palette-listbox"
				aria-autocomplete="list"
				aria-activedescendant={paletteState.results[paletteState.selectedIndex]
					? cmdId(paletteState.results[paletteState.selectedIndex])
					: undefined}
				autocomplete="off"
				spellcheck={false}
			/>
			<kbd class="esc-hint">Esc</kbd>
		</div>

		<!-- Results -->
		<ul
			id="palette-listbox"
			class="results"
			role="listbox"
			aria-label="Commands"
		>
			{#if paletteState.results.length === 0}
				<li class="empty">
					<span>No commands found</span>
					<span class="empty-hint">Try searching by name or keyword</span>
				</li>
			{:else}
				{@const groupedResults = grouped()}
				{#each groupedResults as [category, cmds] (category)}
					<li class="group-header" role="presentation">
						{category === 'recent' ? 'Recent' : CATEGORY_LABELS[category as CommandCategory] ?? category}
					</li>
					{#each cmds as cmd (cmd.id)}
						{@const flatIdx = paletteState.results.indexOf(cmd)}
						<li
							id={cmdId(cmd)}
												class={['result-item', flatIdx === paletteState.selectedIndex && 'selected'].filter(Boolean).join(' ')}
							role="option"
							aria-selected={flatIdx === paletteState.selectedIndex}
						>
							<!-- svelte-ignore a11y_click_events_have_key_events -->
							<button
								class="result-btn"
								onclick={() => { paletteState.selectedIndex = flatIdx; executeSelected(); }}
								tabindex="-1"
							>
								{#if cmd.icon}
									<span class="cmd-icon" aria-hidden="true">{cmd.icon}</span>
								{/if}
								<span class="cmd-label">{cmd.label}</span>
								<span class="cmd-right">
									{#if cmd.shortcut}
										<kbd class="shortcut">{cmd.shortcut}</kbd>
									{/if}
									<span class="cmd-category">{CATEGORY_LABELS[cmd.category]}</span>
								</span>
							</button>
						</li>
					{/each}
				{/each}
			{/if}
		</ul>

		<!-- Footer hint -->
		<div class="palette-footer" aria-hidden="true">
			<span><kbd>↑↓</kbd> navigate</span>
			<span><kbd>↵</kbd> execute</span>
			<span><kbd>Esc</kbd> close</span>
		</div>
	</div>
{/if}

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.45);
		backdrop-filter: blur(2px);
		z-index: 300;
		animation: fade-in 0.1s ease;
	}

	.palette {
		position: fixed;
		top: 20%;
		left: 50%;
		transform: translateX(-50%);
		width: min(560px, 92vw);
		background: white;
		border-radius: 0.875rem;
		box-shadow: 0 24px 60px rgba(0, 0, 0, 0.22), 0 0 0 1px rgba(0,0,0,0.06);
		z-index: 301;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		animation: pop-in 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	@keyframes fade-in {
		from { opacity: 0; }
		to   { opacity: 1; }
	}

	@keyframes pop-in {
		from { opacity: 0; transform: translateX(-50%) scale(0.95); }
		to   { opacity: 1; transform: translateX(-50%) scale(1); }
	}

	/* Search row */
	.search-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.875rem 1rem;
		border-bottom: 1px solid #f3f4f6;
	}

	.search-icon {
		width: 1.125rem;
		height: 1.125rem;
		color: #9ca3af;
		flex-shrink: 0;
	}

	.search-input {
		flex: 1;
		border: none;
		outline: none;
		font-size: 1rem;
		font-family: inherit;
		color: #111827;
		background: transparent;
	}

	.search-input::placeholder { color: #9ca3af; }

	.esc-hint {
		padding: 0.2rem 0.4rem;
		background: #f3f4f6;
		border: 1px solid #e5e7eb;
		border-radius: 0.25rem;
		font-size: 0.7rem;
		color: #6b7280;
		flex-shrink: 0;
	}

	/* Results */
	.results {
		list-style: none;
		margin: 0;
		padding: 0.375rem 0;
		max-height: 380px;
		overflow-y: auto;
	}

	.group-header {
		padding: 0.375rem 1rem 0.25rem;
		font-size: 0.7rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.07em;
		color: #9ca3af;
	}

	.result-item { }

	.result-item.selected .result-btn,
	.result-btn:hover {
		background: #f5f3ff;
	}

	.result-btn {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		width: 100%;
		padding: 0.5rem 1rem;
		border: none;
		background: transparent;
		text-align: left;
		cursor: pointer;
		font-family: inherit;
		font-size: 0.9rem;
		color: #111827;
		transition: background-color 0.1s;
	}

	.cmd-icon {
		font-size: 1rem;
		width: 1.25rem;
		text-align: center;
		flex-shrink: 0;
	}

	.cmd-label {
		flex: 1;
		font-weight: 500;
	}

	.cmd-right {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-shrink: 0;
	}

	.shortcut {
		padding: 0.15rem 0.375rem;
		background: #f3f4f6;
		border: 1px solid #e5e7eb;
		border-radius: 0.25rem;
		font-size: 0.7rem;
		color: #6b7280;
	}

	.cmd-category {
		font-size: 0.7rem;
		color: #d1d5db;
	}

	/* Empty state */
	.empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.375rem;
		padding: 2rem 1rem;
		font-size: 0.9rem;
		color: #6b7280;
	}

	.empty-hint { font-size: 0.75rem; color: #9ca3af; }

	/* Footer */
	.palette-footer {
		display: flex;
		gap: 1.25rem;
		padding: 0.5rem 1rem;
		border-top: 1px solid #f3f4f6;
		font-size: 0.7rem;
		color: #9ca3af;
		justify-content: center;
	}

	.palette-footer kbd {
		padding: 0.1rem 0.3rem;
		background: #f9fafb;
		border: 1px solid #e5e7eb;
		border-radius: 0.2rem;
		font-size: 0.65rem;
		color: #6b7280;
		margin-right: 0.2rem;
	}

	@media (max-width: 600px) {
		.palette { top: 10%; }
		.cmd-category { display: none; }
	}
</style>
