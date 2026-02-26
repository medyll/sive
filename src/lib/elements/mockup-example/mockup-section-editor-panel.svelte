<!--
Generated Svelte scaffold from CMAD pseudo-HTML
Tag: section
ID: editor-panel
Attributes: {"class":"left","id":"editor-panel"}
This file is a scaffold. Implement component logic and styles during development.
-->

<script lang="ts">
export const mockup = {
  "tag": "section",
  "id": "editor-panel",
  "attrs": {
    "class": "left",
    "id": "editor-panel"
  }
};
</script>

<style>
/* Add component styles here */
</style>

<!-- Basic structural mapping: section → semantic section with class 'section' -->
<section class="section">
  {#if $$slots.default}
    <slot />
  {:else}
    <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px;">
        <button>Run Analysis</button>
        <div style="color:var(--muted);font-size:12px">Editor — resizable (drag the gutter)</div>
      </div>
      <!-- PSEUDO: <text-zone id="main-editor" multiline /> → SVELTE: <textarea class="editor"> -->
      <textarea style="width:100%;height:80%;background:#071028;color:#d6e6ff;border:0;padding:12px;font-family:monospace;">Start writing...</textarea>
  {/if}
</section>
