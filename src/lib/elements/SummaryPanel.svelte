<!--
  SummaryPanel — one-click AI-assisted document summarisation.
  Opens as a dropdown panel from the toolbar badge.
  Keyboard: Ctrl+Alt+S opens/closes; Escape closes.
-->
<script lang="ts">
  import { summaryStore, type SummaryLength } from '$lib/summaryStore.svelte';

  interface Props {
    docId: string;
    content: string;
    onClose?: () => void;
  }

  let { docId, content, onClose }: Props = $props();

  let selectedLength = $state<SummaryLength>('medium');
  let streaming = $state(false);
  let streamingText = $state('');
  let error = $state('');

  let cachedSummary = $derived(summaryStore.get(docId, selectedLength));
  let displayText = $derived(streaming ? streamingText : (cachedSummary ?? ''));

  let now = $state(Date.now());

  $effect(() => {
    const id = setInterval(() => { now = Date.now(); }, 60_000);
    return () => clearInterval(id);
  });

  function formatRelative(ts: number): string {
    const diffMs = now - ts;
    const mins = Math.floor(diffMs / 60_000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`;
    const days = Math.floor(hrs / 24);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  }

  let cachedTs = $derived(summaryStore.getTs(docId, selectedLength));
  let timestampLabel = $derived(cachedTs && !streaming ? formatRelative(cachedTs) : null);

  let abortController: AbortController | null = null;

  async function generate(forceRefresh = false) {
    if (streaming) return;

    if (forceRefresh) {
      summaryStore.refreshSummary(docId, selectedLength);
    }

    // Use cache if available and not forcing refresh
    if (!forceRefresh && cachedSummary) return;

    error = '';
    streamingText = '';
    streaming = true;

    if (abortController) abortController.abort();
    abortController = new AbortController();

    const ctx = content ? btoa(unescape(encodeURIComponent(content.slice(0, 2000)))) : '';
    const url = `/api/ai/summary?length=${selectedLength}${ctx ? `&ctx=${ctx}` : ''}`;

    try {
      const res = await fetch(url, { signal: abortController.signal });
      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const token = line.slice(6);
          if (token === '[DONE]') {
            summaryStore.set(docId, selectedLength, streamingText.trim());
            streaming = false;
            return;
          }
          streamingText += token;
        }
      }
      summaryStore.set(docId, selectedLength, streamingText.trim());
    } catch (err: unknown) {
      if ((err as Error).name !== 'AbortError') {
        error = 'Failed to generate summary. Please try again.';
      }
    } finally {
      streaming = false;
    }
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') onClose?.();
  }

  function onBackdropClick(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains('summary-backdrop')) onClose?.();
  }

  // Auto-generate when panel opens if no cache
  $effect(() => {
    if (!cachedSummary && !streaming) {
      generate();
    }
  });
</script>

<svelte:window onkeydown={onKeydown} />

<!-- svelte-ignore a11y_click_events_have_key_events -->
<div class="summary-backdrop" role="presentation" onclick={onBackdropClick}>
  <div class="summary-panel" role="dialog" aria-modal="true" aria-label="Document summary">
    <header class="summary-header">
      <span class="summary-title">📄 Summary</span>
      <div class="length-tabs" role="group" aria-label="Summary length">
        {#each (['short', 'medium', 'long'] as SummaryLength[]) as len}
          <button
            type="button"
            class={['tab', selectedLength === len && 'active'].filter(Boolean).join(' ')}
            onclick={() => { selectedLength = len; generate(); }}
          >{len}</button>
        {/each}
      </div>
      <button type="button" class="btn-close" aria-label="Close summary panel" onclick={onClose}>✕</button>
    </header>

    <div class="summary-body" aria-live="polite" aria-busy={streaming}>
      {#if error}
        <p class="summary-error">{error}</p>
      {:else if displayText}
        <p class="summary-text">{displayText}{#if streaming}<span class="cursor">▍</span>{/if}</p>
      {:else}
        <p class="summary-placeholder">Generating summary…</p>
      {/if}
      {#if timestampLabel}
        <p class="summary-ts">Last updated: {timestampLabel}</p>
      {/if}
    </div>

    <footer class="summary-footer">
      <button
        type="button"
        class="btn-refresh"
        disabled={streaming}
        onclick={() => generate(true)}
        aria-label="Regenerate summary"
      >↻ Refresh</button>
    </footer>
  </div>
</div>

<style>
  .summary-backdrop {
    position: fixed;
    inset: 0;
    z-index: 200;
  }

  .summary-panel {
    position: fixed;
    top: 3.5rem;
    right: 1rem;
    width: 28rem;
    max-width: calc(100vw - 2rem);
    background: var(--color-background, #fff);
    border: 1px solid var(--color-border, #e0e0e0);
    border-radius: 0.75rem;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.14);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .summary-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--color-border, #e0e0e0);
    flex-shrink: 0;
  }

  .summary-title {
    font-weight: 600;
    font-size: 0.875rem;
    flex: 1;
  }

  .length-tabs {
    display: flex;
    gap: 0.25rem;
  }

  .tab {
    padding: 0.2rem 0.55rem;
    font-size: 0.75rem;
    border: 1px solid var(--color-border, #e0e0e0);
    border-radius: 0.3rem;
    background: none;
    cursor: pointer;
    text-transform: capitalize;
    color: var(--color-text-muted, #6b7280);
    transition: background 0.1s, color 0.1s;
  }

  .tab.active {
    background: var(--color-primary, #646cff);
    border-color: var(--color-primary, #646cff);
    color: #fff;
  }

  .btn-close {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 0.9rem;
    color: var(--color-text-muted, #9ca3af);
    padding: 0.15rem 0.3rem;
    border-radius: 0.25rem;
    line-height: 1;
  }

  .btn-close:hover { color: var(--color-text, #1a1a1a); background: var(--color-hover, #f0f0f0); }

  .summary-body {
    padding: 1rem;
    min-height: 6rem;
    max-height: 18rem;
    overflow-y: auto;
  }

  .summary-text {
    font-size: 0.875rem;
    line-height: 1.6;
    color: var(--color-text, #1a1a1a);
    margin: 0;
    white-space: pre-wrap;
  }

  .summary-placeholder {
    font-size: 0.875rem;
    color: var(--color-text-muted, #9ca3af);
    margin: 0;
    font-style: italic;
  }

  .summary-error {
    font-size: 0.875rem;
    color: #dc2626;
    margin: 0;
  }

  .cursor {
    display: inline-block;
    animation: blink 0.7s step-end infinite;
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  .summary-ts {
    font-size: 0.75rem;
    color: var(--color-text-muted, #9ca3af);
    margin: 0.5rem 0 0;
  }

  .summary-footer {
    display: flex;
    justify-content: flex-end;
    padding: 0.5rem 1rem;
    border-top: 1px solid var(--color-border, #e0e0e0);
  }

  .btn-refresh {
    font-size: 0.8rem;
    padding: 0.25rem 0.65rem;
    border: 1px solid var(--color-border, #e0e0e0);
    border-radius: 0.3rem;
    background: none;
    cursor: pointer;
    color: var(--color-text-muted, #6b7280);
    transition: background 0.1s;
  }

  .btn-refresh:hover:not(:disabled) { background: var(--color-hover, #f0f0f0); }
  .btn-refresh:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
