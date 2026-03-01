<script lang="ts">
  import type { SuggestionData } from '$lib/suggestionsStore.svelte.js';

  interface SuggestionItemProps {
    suggestion: SuggestionData;
    onAccept: (id: string) => void;
    onReject:  (id: string) => void;
  }

  let { suggestion, onAccept, onReject }: SuggestionItemProps = $props();

  const TYPE_COLORS: Record<string, string> = {
    addition:     '#16a34a',
    modification: '#2563eb',
    deletion:     '#dc2626'
  };

  const typeColor = $derived(TYPE_COLORS[suggestion.type] ?? '#6b7280');
</script>

<article class="suggestion-item">
  <div class="suggestion-header">
    <span class="suggestion-badge" style="background-color: {typeColor}">
      {suggestion.type}
    </span>
    {#if suggestion.context}
      <span class="suggestion-context">{suggestion.context}</span>
    {/if}
  </div>

  <div class="suggestion-diff">
    {#if suggestion.type === 'modification'}
      <p class="diff-line"><del class="diff-del">{suggestion.before}</del></p>
      <p class="diff-line"><ins class="diff-ins">{suggestion.after}</ins></p>
    {:else if suggestion.type === 'addition'}
      <p class="diff-line"><ins class="diff-ins">{suggestion.after}</ins></p>
    {:else}
      <p class="diff-line"><del class="diff-del">{suggestion.before}</del></p>
    {/if}
  </div>

  <div class="suggestion-actions">
    <button
      type="button"
      class="btn-accept"
      onclick={() => onAccept(suggestion.id)}
      aria-label="Accept suggestion"
    >Accept</button>
    <button
      type="button"
      class="btn-reject"
      onclick={() => onReject(suggestion.id)}
      aria-label="Reject suggestion"
    >Reject</button>
  </div>
</article>

<style>
  .suggestion-item {
    border: 1px solid var(--color-border, #e0e0e0);
    border-radius: 0.5rem;
    padding: 0.75rem;
    background: var(--color-surface, #fafafa);
  }

  .suggestion-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .suggestion-badge {
    flex-shrink: 0;
    display: inline-block;
    padding: 0.15rem 0.5rem;
    border-radius: 9999px;
    font-size: 0.72rem;
    font-weight: 700;
    color: #fff;
    text-transform: capitalize;
    letter-spacing: 0.03em;
  }

  .suggestion-context {
    font-size: 0.75rem;
    color: var(--color-text-muted, #888);
    font-style: italic;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .suggestion-diff {
    margin-bottom: 0.6rem;
  }

  .diff-line {
    margin: 0.15rem 0;
    font-size: 0.85rem;
    line-height: 1.4;
  }

  .diff-del {
    color: #dc2626;
    text-decoration: line-through;
    background: #fee2e2;
    padding: 0.05rem 0.2rem;
    border-radius: 0.2rem;
  }

  .diff-ins {
    color: #16a34a;
    text-decoration: none;
    background: #dcfce7;
    padding: 0.05rem 0.2rem;
    border-radius: 0.2rem;
  }

  .suggestion-actions {
    display: flex;
    gap: 0.5rem;
  }

  .btn-accept,
  .btn-reject {
    padding: 0.3rem 0.75rem;
    border: none;
    border-radius: 0.3rem;
    font-size: 0.8rem;
    font-weight: 500;
    cursor: pointer;
    transition: opacity 0.15s;
  }

  .btn-accept {
    background: #16a34a;
    color: #fff;
  }

  .btn-reject {
    background: #e5e7eb;
    color: #374151;
  }

  .btn-accept:hover { opacity: 0.85; }
  .btn-reject:hover { opacity: 0.75; }
</style>
