<script lang="ts">
	export let cursors: Array<{
		userId: string;
		name?: string;
		color: string;
		position: { offset: number; selection?: { start: number; end: number } | null };
	}> = [];
	
	export let containerWidth = 600;
	
	function getPositionStyle(cursor: typeof cursors[0]): { left: string; top: string } {
		// Calculate position based on offset (simplified - would need actual text metrics)
		const charWidth = 8; // Approximate
		const lineHeight = 24;
		
		const charsPerLine = Math.floor(containerWidth / charWidth);
		const line = Math.floor(cursor.position.offset / charsPerLine);
		const col = cursor.position.offset % charsPerLine;
		
		return {
			left: `${col * charWidth}px`,
			top: `${line * lineHeight}px`
		};
	}
</script>

<div class="collaborative-cursors relative" style="width: {containerWidth}px">
	{#each cursors as cursor (cursor.userId)}
		<div
			class="absolute pointer-events-none transition-all duration-150"
			style="
				left: {getPositionStyle(cursor).left};
				top: {getPositionStyle(cursor).top};
			"
		>
			<!-- Cursor line -->
			<div 
				class="w-0.5 h-6 absolute"
				style="background-color: {cursor.color}"
			></div>
			
			<!-- Selection highlight -->
			{#if cursor.position.selection}
				<div
					class="absolute h-6 opacity-30"
					style="
						background-color: {cursor.color};
						left: 0;
						width: {Math.abs(cursor.position.selection.end - cursor.position.selection.start) * 8}px;
					"
				></div>
			{/if}
			
			<!-- User label -->
			<div
				class="absolute -top-5 left-0 px-2 py-0.5 rounded text-xs text-white whitespace-nowrap"
				style="background-color: {cursor.color}"
			>
				{cursor.name || cursor.userId}
			</div>
		</div>
	{/each}
</div>

<style>
	.collaborative-cursors {
		height: 100%;
		overflow: hidden;
	}
</style>
