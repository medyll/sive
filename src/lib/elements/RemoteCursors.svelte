<script lang="ts">
	import { onDestroy } from 'svelte';

	interface CursorData {
		userId: string;
		userName: string;
		color: string;
		offset: number;
		selection: { start: number; end: number } | null;
	}

	interface Props {
		docId: string | null;
		editorEl?: HTMLElement | null;
	}

	let { docId, editorEl = null }: Props = $props();

	let cursors = $state<Map<string, CursorData & { labelVisible: boolean }>>(new Map());
	let es: EventSource | null = null;

	// Label fade timers
	const labelTimers = new Map<string, ReturnType<typeof setTimeout>>();

	$effect(() => {
		if (!docId) return;
		connect(docId);
		return () => disconnect();
	});

	function connect(id: string) {
		disconnect();
		es = new EventSource(`/api/presence/cursor/stream?docId=${encodeURIComponent(id)}`);

		es.addEventListener('init', (e) => {
			const list: CursorData[] = JSON.parse(e.data);
			const next = new Map<string, CursorData & { labelVisible: boolean }>();
			for (const c of list) next.set(c.userId, { ...c, labelVisible: true });
			cursors = next;
		});

		es.addEventListener('cursor', (e) => {
			const c: CursorData = JSON.parse(e.data);
			cursors = new Map(cursors).set(c.userId, {
				...c,
				labelVisible: true
			});
			// Auto-hide label after 2s
			if (labelTimers.has(c.userId)) clearTimeout(labelTimers.get(c.userId));
			labelTimers.set(
				c.userId,
				setTimeout(() => {
					const updated = new Map(cursors);
					const entry = updated.get(c.userId);
					if (entry) updated.set(c.userId, { ...entry, labelVisible: false });
					cursors = updated;
				}, 2000)
			);
		});
	}

	function disconnect() {
		es?.close();
		es = null;
	}

	onDestroy(disconnect);

	// Convert character offset to pixel position within editorEl
	function offsetToRect(offset: number): { top: number; left: number } | null {
		if (!editorEl) return null;
		try {
			const walker = document.createTreeWalker(editorEl, NodeFilter.SHOW_TEXT);
			let remaining = offset;
			let node: Text | null = null;
			while ((node = walker.nextNode() as Text | null)) {
				if (remaining <= node.length) break;
				remaining -= node.length;
			}
			if (!node) return null;
			const range = document.createRange();
			range.setStart(node, Math.min(remaining, node.length));
			range.collapse(true);
			const rect = range.getBoundingClientRect();
			const editorRect = editorEl.getBoundingClientRect();
			return { top: rect.top - editorRect.top, left: rect.left - editorRect.left };
		} catch {
			return null;
		}
	}

	function selectionToRects(
		sel: { start: number; end: number }
	): DOMRect[] {
		if (!editorEl || sel.end <= sel.start) return [];
		try {
			// Simplified: use a single range for the selection
			const walker = document.createTreeWalker(editorEl, NodeFilter.SHOW_TEXT);
			let startNode: Text | null = null, endNode: Text | null = null;
			let startOffset = sel.start, endOffset = sel.end;
			let node: Text | null;
			while ((node = walker.nextNode() as Text | null)) {
				if (!startNode && startOffset <= node.length) { startNode = node; }
				else if (!startNode) { startOffset -= node.length; }
				if (!endNode && endOffset <= node.length) { endNode = node; }
				else if (!endNode) { endOffset -= node.length; }
				if (startNode && endNode) break;
			}
			if (!startNode || !endNode) return [];
			const range = document.createRange();
			range.setStart(startNode, startOffset);
			range.setEnd(endNode, endOffset);
			return [...range.getClientRects()];
		} catch {
			return [];
		}
	}
</script>

{#if cursors.size > 0}
	<div class="remote-cursors" aria-hidden="true">
		{#each [...cursors.values()] as c (c.userId)}
			{@const pos = offsetToRect(c.offset)}
			{#if pos}
				<!-- Cursor caret -->
				<div
					class="cursor-caret"
					style="top:{pos.top}px; left:{pos.left}px; --color:{c.color}"
				>
					<div class="caret-bar"></div>
					{#if c.labelVisible}
						<div class="cursor-label">{c.userName}</div>
					{/if}
				</div>
			{/if}

			<!-- Selection highlight -->
			{#if c.selection && c.selection.end > c.selection.start}
				{#each selectionToRects(c.selection) as rect}
					{@const editorRect = editorEl?.getBoundingClientRect()}
					{#if editorRect}
						<div
							class="selection-highlight"
							style="
								top:{rect.top - editorRect.top}px;
								left:{rect.left - editorRect.left}px;
								width:{rect.width}px;
								height:{rect.height}px;
								--color:{c.color}
							"
						></div>
					{/if}
				{/each}
			{/if}
		{/each}
	</div>
{/if}

<style>
	.remote-cursors {
		position: absolute;
		inset: 0;
		pointer-events: none;
		overflow: hidden;
	}
	.cursor-caret {
		position: absolute;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		z-index: 5;
	}
	.caret-bar {
		width: 2px;
		height: 1.2em;
		background: var(--color, #6366f1);
		border-radius: 1px;
		animation: blink 1.2s step-end infinite;
	}
	@keyframes blink {
		0%, 100% { opacity: 1; }
		50% { opacity: 0; }
	}
	.cursor-label {
		background: var(--color, #6366f1);
		color: #fff;
		font-size: 0.65rem;
		padding: 0.1em 0.35em;
		border-radius: 3px;
		white-space: nowrap;
		margin-top: 1px;
		animation: fadeout 2s forwards;
	}
	@keyframes fadeout {
		0%, 80% { opacity: 1; }
		100% { opacity: 0; }
	}
	.selection-highlight {
		position: absolute;
		background: var(--color, #6366f1);
		opacity: 0.2;
		border-radius: 2px;
		z-index: 4;
	}
</style>
