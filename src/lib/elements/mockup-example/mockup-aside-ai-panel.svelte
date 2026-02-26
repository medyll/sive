<!--
Generated Svelte scaffold from CMAD pseudo-HTML
Tag: aside
ID: ai-panel
Attributes: {"class":"right","id":"ai-panel"}
This file is a scaffold. Implement component logic and styles during development.
-->

<script lang="ts">
export const mockup = {
  "tag": "aside",
  "id": "ai-panel",
  "attrs": {
    "class": "right",
    "id": "ai-panel"
  }
};
</script>

<style>
/* Add component styles here */
</style>

<!-- Basic structural mapping: aside → semantic section with class 'aside' -->
<section class="aside">
  {#if $$slots.default}
    <slot />
  {:else}
    <nav class="tabs" role="tablist" aria-label="AI tools tabs">
        <button class="tab">Suggestions</button>
        <button class="tab">Coherence</button>
        <button class="tab">Style</button>
        <button class="tab">History</button>
      </nav>

      <section style="background:#fbfdff;border-radius:6px;padding:8px;">
        <h3>AI Suggestions</h3>
        <p style="color:var(--muted)">Diff-based proposals, inline accept/ignore controls (mock).</p>
        <ul>
          <li><strong>Replace:</strong> "grey Peugeot" → "grey Peugeot 308"</li>
        </ul>
      </section>
  {/if}
</section>
