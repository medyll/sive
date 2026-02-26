<!--
Generated Svelte scaffold from CMAD pseudo-HTML
Tag: main
ID: 
Attributes: {"class":"workspace"}
This file is a scaffold. Implement component logic and styles during development.
-->

<script lang="ts">
export const mockup = {
  "tag": "main",
  "id": null,
  "attrs": {
    "class": "workspace"
  }
};
</script>

<style>
/* Add component styles here */
</style>

<!-- Basic structural mapping: main → semantic section with class 'main' -->
<section class="main">
  {#if $$slots.default}
    <slot />
  {:else}
    <!-- PSEUDO: <panel id="editor-panel"> → SVELTE: left editor pane (div.pane.left) -->
    <section class="left" id="editor-panel">
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px;">
        <button>Run Analysis</button>
        <div style="color:var(--muted);font-size:12px">Editor — resizable (drag the gutter)</div>
      </div>
      <!-- PSEUDO: <text-zone id="main-editor" multiline /> → SVELTE: <textarea class="editor"> -->
      <textarea style="width:100%;height:80%;background:#071028;color:#d6e6ff;border:0;padding:12px;font-family:monospace;">Start writing...</textarea>
    </section>

    <!-- PSEUDO: <resize-handle id="split-handle" /> → SVELTE: .resizer with pointer events -->
    <div class="resizer" role="separator" aria-orientation="vertical" title="Resize panels"></div>

    <!-- PSEUDO: <panel id="ai-panel"> with <tab-bar> and <tab> → SVELTE: right panel with .tabs and conditional content -->
    <aside class="right" id="ai-panel">
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
    </aside>
  {/if}
</section>
