<!--
Generated Svelte scaffold from CMAD pseudo-HTML
Tag: div
ID: 
Attributes: {"style":"color:var(--muted);font-size:12px"}
This file is a scaffold. Implement component logic and styles during development.
-->

<script lang="ts">
export const mockup = {
  "tag": "div",
  "id": null,
  "attrs": {
    "style": "color:var(--muted);font-size:12px"
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
    Editor — resizable (drag the gutter)
  {/if}
</section>
