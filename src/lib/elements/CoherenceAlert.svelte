<script lang="ts">
  interface CoherenceAlertProps {
    entity: string;
    discrepancy_type: string;
    confidence: 'Low' | 'Medium' | 'High';
    note: string;
  }

  let { entity, discrepancy_type, confidence, note }: CoherenceAlertProps = $props();

  const CONFIDENCE_COLORS: Record<string, string> = {
    Low:    '#9ca3af',
    Medium: '#f97316',
    High:   '#ef4444'
  };

  const confidenceColor = $derived(CONFIDENCE_COLORS[confidence] ?? '#9ca3af');
</script>

<article class="coherence-alert">
  <div class="alert-header">
    <span class="alert-entity">{entity}</span>
    <span
      class="alert-confidence"
      style="background-color: {confidenceColor}"
      aria-label="Confidence: {confidence}"
    >{confidence}</span>
  </div>
  <span class="alert-type">{discrepancy_type}</span>
  <p class="alert-note">{note}</p>
</article>

<style>
  .coherence-alert {
    border: 1px solid var(--color-border, #e0e0e0);
    border-radius: 0.5rem;
    padding: 0.75rem;
    background: var(--color-surface, #fafafa);
  }

  .alert-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    margin-bottom: 0.25rem;
  }

  .alert-entity {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--color-text, #333);
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .alert-confidence {
    flex-shrink: 0;
    display: inline-block;
    padding: 0.15rem 0.5rem;
    border-radius: 9999px;
    font-size: 0.72rem;
    font-weight: 700;
    color: #fff;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .alert-type {
    display: block;
    font-size: 0.78rem;
    color: var(--color-text-muted, #888);
    font-style: italic;
    margin-bottom: 0.35rem;
  }

  .alert-note {
    margin: 0;
    font-size: 0.85rem;
    color: var(--color-text, #333);
    line-height: 1.4;
  }
</style>
