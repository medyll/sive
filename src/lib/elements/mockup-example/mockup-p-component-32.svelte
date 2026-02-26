<!--
Generated Svelte scaffold from CMAD pseudo-HTML
Tag: p
ID: 
Attributes: {"style":"color:var(--muted)"}
This file is a scaffold. Implement component logic and styles during development.
-->

<script lang="ts">
export const mockup = {
  "tag": "p",
  "id": null,
  "attrs": {
    "style": "color:var(--muted)"
  }
};
</script>

<style>
/* Add component styles here */
</style>

<!-- Basic structural mapping: p → semantic section with class 'p' -->
<section class="p">
  {#if $$slots.default}
    <slot />
  {:else}
    Diff-based proposals, inline accept/ignore controls (mock).
  {/if}
</section>
