<!--
Generated Svelte scaffold from CMAD pseudo-HTML
Tag: div
ID: 
Attributes: {"style":"display:flex;gap:8px;align-items:center;margin-bottom:8px;"}
This file is a scaffold. Implement component logic and styles during development.
-->

<script lang="ts">
export const mockup = {
  "tag": "div",
  "id": null,
  "attrs": {
    "style": "display:flex;gap:8px;align-items:center;margin-bottom:8px;"
  }
};
</script>

<style>
/* Add component styles here */
</style>

<!-- Basic structural mapping: div → semantic section with class 'div' -->
<section class="div">
  {#if $$slots.default}
    <slot />
  {:else}
    <button>Run Analysis</button>
        <div style="color:var(--muted);font-size:12px">Editor — resizable (drag the gutter)
  {/if}
</section>
