<script lang="ts">
	import { onMount } from 'svelte';

	export interface CursorState {
		clientId: string;
		userId: string;
		line: number;
		column: number;
		color: string;
		isVisible: boolean;
		lastUpdated?: number;
	}

	export let cursors: CursorState[] = [];
	export let lineHeight: number = 20;
	export let charWidth: number = 8;
	export let editorHeight: number = 600;
	export let editorWidth: number = 800;

	interface PositionedCursor extends CursorState {
		top: number;
		left: number;
		isRecent: boolean;
	}

	$: positionedCursors = cursors
		.filter((c) => c.isVisible)
		.map((cursor) => ({
			...cursor,
			top: (cursor.line - 1) * lineHeight,
			left: cursor.column * charWidth,
			isRecent: cursor.lastUpdated ? Date.now() - cursor.lastUpdated < 5000 : true
		})) as PositionedCursor[];

	onMount(() => {
		// Listen for cursor updates
		const handleCursorUpdate = (e: Event) => {
			const customEvent = e as CustomEvent;
			if (customEvent.detail?.cursors) {
				cursors = customEvent.detail.cursors;
			}
		};

		window.addEventListener('cursor-update', handleCursorUpdate);

		// Periodically update visibility based on recency
		const visibilityInterval = setInterval(() => {
			cursors = cursors.map((c) => ({
				...c,
				isVisible: c.lastUpdated ? Date.now() - c.lastUpdated < 5000 : true
			}));
		}, 1000);

		return () => {
			window.removeEventListener('cursor-update', handleCursorUpdate);
			clearInterval(visibilityInterval);
		};
	});
</script>

<div class="remote-cursors" data-testid="remote-cursors">
	{#each positionedCursors as cursor (cursor.clientId)}
		<div
			class="cursor-overlay"
			class:visible={cursor.isVisible}
			class:recent={cursor.isRecent}
			style="
				top: {cursor.top}px;
				left: {cursor.left}px;
				--cursor-color: {cursor.color};
			"
			data-testid="remote-cursor-{cursor.userId}"
			title="{cursor.userId} — Line {cursor.line}, Col {cursor.column}"
		>
			<div class="cursor-bar" aria-hidden="true"></div>
			<div class="cursor-label">{cursor.userId.slice(0, 3).toUpperCase()}</div>
		</div>
	{/each}
</div>

<style>
	.remote-cursors {
		position: relative;
		pointer-events: none;
		width: 100%;
		height: 100%;
	}

	.cursor-overlay {
		position: absolute;
		display: flex;
		align-items: flex-start;
		gap: 0;
		opacity: 0;
		transition: all 100ms ease;
		z-index: 100;
	}

	.cursor-overlay.visible {
		opacity: 1;
	}

	.cursor-overlay.recent {
		opacity: 1;
	}

	.cursor-bar {
		width: 2px;
		height: 20px;
		background: var(--cursor-color, #646cff);
		border-radius: 1px;
		box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
		animation: blink 1s infinite;
	}

	@keyframes blink {
		0%,
		49% {
			opacity: 1;
		}
		50%,
		100% {
			opacity: 0.5;
		}
	}

	.cursor-label {
		position: absolute;
		top: -20px;
		left: 0;
		padding: 2px 4px;
		background: var(--cursor-color, #646cff);
		color: white;
		font-size: 0.65rem;
		font-weight: 600;
		border-radius: 2px;
		white-space: nowrap;
		pointer-events: auto;
		cursor: pointer;
		transition: transform 100ms ease;
	}

	.cursor-overlay:hover .cursor-label {
		transform: scale(1.1);
	}

	@media (max-width: 640px) {
		.cursor-label {
			display: none;
		}
	}
</style>
