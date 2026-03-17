<script lang="ts">
	interface Doc {
		id: string;
		title: string;
		updated_at?: string;
		[key: string]: unknown;
	}

	interface Props {
		docs: Doc[];
		activeId?: string | null;
		onselect?: (doc: Doc) => void;
		rowHeight?: number;
		overscan?: number;
	}

	let {
		docs,
		activeId = null,
		onselect,
		rowHeight = 64,
		overscan = 3
	}: Props = $props();

	let container = $state<HTMLElement | null>(null);
	let containerHeight = $state(400);
	let scrollTop = $state(0);

	// Word count cache: docId → count (lazy, idle)
	const wordCountCache = new Map<string, number>();
	let wordCounts = $state<Map<string, number>>(new Map());

	// Visible window calculation
	const firstIdx = $derived(Math.max(0, Math.floor(scrollTop / rowHeight) - overscan));
	const lastIdx = $derived(
		Math.min(docs.length - 1, Math.ceil((scrollTop + containerHeight) / rowHeight) + overscan)
	);
	const visibleDocs = $derived(docs.slice(firstIdx, lastIdx + 1));
	const totalHeight = $derived(docs.length * rowHeight);
	const offsetTop = $derived(firstIdx * rowHeight);

	function onscroll(e: Event) {
		scrollTop = (e.currentTarget as HTMLElement).scrollTop;
	}

	// ResizeObserver
	$effect(() => {
		if (!container) return;
		const ro = new ResizeObserver((entries) => {
			for (const entry of entries) {
				containerHeight = entry.contentRect.height;
			}
		});
		ro.observe(container);
		containerHeight = container.clientHeight;
		return () => ro.disconnect();
	});

	// Lazy word count via requestIdleCallback
	$effect(() => {
		// Reset cache when docs change
		wordCountCache.clear();
		scheduleWordCounts();
	});

	function scheduleWordCounts() {
		if (typeof requestIdleCallback === 'undefined') {
			// Fallback: compute synchronously in small batches
			let i = 0;
			function step() {
				const batch = docs.slice(i, i + 5);
				if (batch.length === 0) return;
				for (const doc of batch) {
					if (!wordCountCache.has(doc.id)) {
						wordCountCache.set(doc.id, countWords(doc.content as string ?? ''));
					}
				}
				i += 5;
				wordCounts = new Map(wordCountCache);
				if (i < docs.length) setTimeout(step, 0);
			}
			step();
			return;
		}

		let docIndex = 0;
		function processChunk(deadline: IdleDeadline) {
			const BATCH = 5;
			let processed = 0;
			while (processed < BATCH && docIndex < docs.length && deadline.timeRemaining() > 0) {
				const doc = docs[docIndex];
				if (!wordCountCache.has(doc.id)) {
					wordCountCache.set(doc.id, countWords((doc.content as string) ?? ''));
				}
				docIndex++;
				processed++;
			}
			wordCounts = new Map(wordCountCache);
			if (docIndex < docs.length) {
				requestIdleCallback(processChunk);
			}
		}
		requestIdleCallback(processChunk);
	}

	function countWords(text: string): number {
		return text.trim() ? text.trim().split(/\s+/).length : 0;
	}

	function relativeTime(dateStr?: string): string {
		if (!dateStr) return '';
		const diff = Date.now() - new Date(dateStr).getTime();
		const mins = Math.floor(diff / 60000);
		if (mins < 1) return 'just now';
		if (mins < 60) return `${mins}m ago`;
		const hrs = Math.floor(mins / 60);
		if (hrs < 24) return `${hrs}h ago`;
		return `${Math.floor(hrs / 24)}d ago`;
	}
</script>

<div
	bind:this={container}
	class="virtual-list"
	role="listbox"
	aria-label="Document list"
	{onscroll}
>
	<!-- Total height spacer -->
	<div class="spacer" style="height:{totalHeight}px">
		<!-- Visible rows positioned absolutely within spacer -->
		<div class="rows" style="transform:translateY({offsetTop}px)">
			{#each visibleDocs as doc, i (doc.id)}
				{@const absIdx = firstIdx + i}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<div
					class="row"
					class:active={doc.id === activeId}
					role="option"
					aria-selected={doc.id === activeId}
					aria-posinset={absIdx + 1}
					aria-setsize={docs.length}
					style="height:{rowHeight}px"
					onclick={() => onselect?.(doc)}
				>
					<span class="title">{doc.title || 'Untitled'}</span>
					<span class="meta">
						{#if wordCounts.has(doc.id)}
							<span class="words">{wordCounts.get(doc.id)} words</span>
						{/if}
						<span class="time">{relativeTime(doc.updated_at)}</span>
					</span>
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	.virtual-list {
		height: 100%;
		overflow-y: auto;
		position: relative;
	}
	.spacer {
		position: relative;
	}
	.rows {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
	}
	.row {
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: 0 1rem;
		cursor: pointer;
		border-bottom: 1px solid var(--border, #e5e7eb);
		box-sizing: border-box;
		transition: background 0.1s;
	}
	.row:hover {
		background: var(--surface-hover, #f9fafb);
	}
	.row.active {
		background: var(--accent-light, #ede9fe);
	}
	.title {
		font-size: 0.875rem;
		font-weight: 500;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.meta {
		display: flex;
		gap: 0.5rem;
		font-size: 0.72rem;
		color: var(--muted, #9ca3af);
	}
</style>
