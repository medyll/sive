<script lang="ts">
	import { countWords, countParagraphs, readingTimeMinutes } from '$lib/server/stats';

	interface Props { content: string; }
	let { content }: Props = $props();

	let words = $derived(countWords(content));
	let paras = $derived(countParagraphs(content));
	let readTime = $derived(readingTimeMinutes(content));

	function fmt(n: number): string { return n.toLocaleString(); }
</script>

{#if words > 0}
	<p class="badge" aria-live="polite" aria-label="{fmt(words)} words, {readTime} min read, {paras} paragraphs">
		<span>{fmt(words)} words</span>
		<span class="sep">·</span>
		<span>{readTime} min read</span>
		<span class="sep">·</span>
		<span>{paras} {paras === 1 ? 'paragraph' : 'paragraphs'}</span>
	</p>
{/if}

<style>
	.badge {
		margin: 0;
		display: flex;
		gap: 0.375rem;
		font-size: 0.75rem;
		color: #9ca3af;
		padding: 0.25rem 0;
		user-select: none;
	}
	.sep { color: #d1d5db; }
</style>
