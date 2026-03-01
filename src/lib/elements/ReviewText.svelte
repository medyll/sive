<!--
ReviewText — read-only manuscript text panel with highlight support.
Props: text, highlights[], onHighlightClick
-->
<script lang="ts">
  export interface Highlight {
    id: string;
    start: number;
    end: number;
    category: 'inconsistency' | 'pov' | 'style' | 'rhythm' | 'voice';
  }

  export interface ReviewTextProps {
    text?: string;
    highlights?: Highlight[];
    onHighlightClick?: (highlight: Highlight) => void;
  }

  const STUB_TEXT = `The morning light filtered through the dusty blinds as Martin set his coffee cup on the table. \
He hadn't slept — not really. The argument with Jean played on loop in his mind, each replay \
sharper than the last. Outside, the city was already humming, indifferent to his exhaustion.\n\n\
Marie knocked twice before entering. She had always done that, even after ten years of sharing \
the same office. "The report is ready," she said, sliding a folder across the desk without looking \
at him. Martin noticed her hands were shaking.\n\n\
"Sit down," he said. She didn't.`;

  let {
    text = STUB_TEXT,
    highlights = [],
    onHighlightClick
  }: ReviewTextProps = $props();

  /** Build HTML with highlighted <mark> spans from the flat text + highlights array. */
  function buildSegments(src: string, hl: Highlight[]) {
    if (!hl.length) return [{ text: src, highlight: null }];

    const sorted = [...hl].sort((a, b) => a.start - b.start);
    const segments: Array<{ text: string; highlight: Highlight | null }> = [];
    let cursor = 0;

    for (const h of sorted) {
      if (h.start > cursor) {
        segments.push({ text: src.slice(cursor, h.start), highlight: null });
      }
      segments.push({ text: src.slice(h.start, h.end), highlight: h });
      cursor = h.end;
    }
    if (cursor < src.length) {
      segments.push({ text: src.slice(cursor), highlight: null });
    }
    return segments;
  }

  let segments = $derived(buildSegments(text, highlights));
</script>

<div
  class="review-text"
  role="document"
  aria-label="Manuscript text — read only"
  aria-readonly="true"
>
  <div class="text-content">
    {#each segments as seg}
      {#if seg.highlight}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <mark
          class="highlight highlight--{seg.highlight.category}"
          data-category={seg.highlight.category}
          data-highlight-id={seg.highlight.id}
          tabindex="0"
          role="button"
          aria-label="Flagged passage: {seg.highlight.category}"
          onclick={() => onHighlightClick?.(seg.highlight!)}
          onkeydown={(e) => e.key === 'Enter' && onHighlightClick?.(seg.highlight!)}
        >{seg.text}</mark>
      {:else}
        {seg.text}
      {/if}
    {/each}
  </div>
</div>

<style>
  .review-text {
    height: 100%;
    overflow-y: auto;
    background: var(--color-background, #fff);
    border-right: 1px solid var(--color-border, #e0e0e0);
  }

  .text-content {
    padding: 2rem;
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 1rem;
    line-height: 1.8;
    color: var(--color-text, #333);
    white-space: pre-wrap;
    max-width: 65ch;
    margin: 0 auto;
  }

  .highlight {
    border-radius: 2px;
    cursor: pointer;
    padding: 0 1px;
  }

  .highlight--inconsistency { background: rgba(255, 100, 100, 0.25); }
  .highlight--pov           { background: rgba(255, 180, 50,  0.25); }
  .highlight--style         { background: rgba(100, 108, 255, 0.25); }
  .highlight--rhythm        { background: rgba(50,  200, 150, 0.25); }
  .highlight--voice         { background: rgba(200, 100, 255, 0.25); }
</style>
