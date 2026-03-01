<script lang="ts">
  interface StyleSignalProps {
    location: string;
    signal: string;
    suggestion: string;
  }

  let { location, signal, suggestion }: StyleSignalProps = $props();

  const SIGNAL_COLORS: Record<string, string> = {
    'Repetition':      '#e07b39',
    'Sentence length': '#3b82f6',
    'Rhythm break':    '#8b5cf6',
    'Lexical density': '#10b981'
  };

  const badgeColor = $derived(SIGNAL_COLORS[signal] ?? '#6b7280');
</script>

<article class="style-signal">
  <div class="signal-header">
    <span class="signal-badge" style="background-color: {badgeColor}">{signal}</span>
    <span class="signal-location">{location}</span>
  </div>
  <p class="signal-suggestion">{suggestion}</p>
</article>

<style>
  .style-signal {
    border: 1px solid var(--color-border, #e0e0e0);
    border-radius: 0.5rem;
    padding: 0.75rem;
    background: var(--color-surface, #fafafa);
  }

  .signal-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.4rem;
  }

  .signal-badge {
    display: inline-block;
    padding: 0.15rem 0.5rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
    color: #fff;
  }

  .signal-location {
    font-size: 0.78rem;
    color: var(--color-text-muted, #888);
    font-style: italic;
  }

  .signal-suggestion {
    margin: 0;
    font-size: 0.85rem;
    color: var(--color-text, #333);
    line-height: 1.4;
  }
</style>
