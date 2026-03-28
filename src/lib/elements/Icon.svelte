<!-- Icon components for professional UI -->

<script lang="ts">
	export interface IconProps {
		size?: number;
		className?: string;
	}
	
	let { 
		type = 'close',
		size = 16,
		className = ''
	} = $props();
</script>

<!-- Close / X icon -->
{#if type === 'close'}
	<svg 
		width={size} 
		height={size} 
		viewBox="0 0 16 16" 
		fill="none" 
		stroke="currentColor" 
		stroke-width="2"
		stroke-linecap="round"
		class={className}
	>
		<path d="M4 4l8 8M12 4l-8 8"/>
	</svg>

<!-- More actions / kebab menu -->
{:else if type === 'more'}
	<svg 
		width={size} 
		height={size} 
		viewBox="0 0 16 16" 
		fill="currentColor"
		class={className}
	>
		<circle cx="8" cy="4" r="1.5"/>
		<circle cx="8" cy="8" r="1.5"/>
		<circle cx="8" cy="12" r="1.5"/>
	</svg>

<!-- Add / plus icon -->
{:else if type === 'add'}
	<svg 
		width={size} 
		height={size} 
		viewBox="0 0 16 16" 
		fill="none" 
		stroke="currentColor" 
		stroke-width="2"
		stroke-linecap="round"
		class={className}
	>
		<path d="M8 4v8M4 8h8"/>
	</svg>

<!-- Remove tag / small X -->
{:else if type === 'remove'}
	<svg 
		width={size} 
		height={size} 
		viewBox="0 0 12 12" 
		fill="none" 
		stroke="currentColor" 
		stroke-width="2"
		stroke-linecap="round"
		class={className}
	>
		<path d="M3 3l6 6M9 3l-6 6"/>
	</svg>

<!-- Document icon -->
{:else if type === 'document'}
	<svg 
		width={size} 
		height={size} 
		viewBox="0 0 16 16" 
		fill="none" 
		stroke="currentColor" 
		stroke-width="1.5"
		class={className}
	>
		<path d="M6 2h4l4 4v8H2V2h4z"/>
		<path d="M6 2v4h4"/>
	</svg>

<!-- Search icon -->
{:else if type === 'search'}
	<svg 
		width={size} 
		height={size} 
		viewBox="0 0 16 16" 
		fill="none" 
		stroke="currentColor" 
		stroke-width="2"
		class={className}
	>
		<circle cx="6" cy="6" r="4"/>
		<path d="M10 10l4 4"/>
	</svg>

<!-- Default / fallback -->
{:else}
	<svg 
		width={size} 
		height={size} 
		viewBox="0 0 16 16" 
		fill="none" 
		stroke="currentColor" 
		stroke-width="2"
		class={className}
	>
		<circle cx="8" cy="8" r="6"/>
	</svg>
{/if}
