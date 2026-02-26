<!--
Generated Svelte scaffold from CMAD pseudo-HTML
Tag: header
ID: 
Attributes: {}
This file is a scaffold. Implement component logic and styles during development.
-->

<script lang="ts">
export const mockup = {
  "tag": "header",
  "id": null,
  "attrs": {}
};
</script>

<style>
/* Add component styles here */
</style>

<!-- Basic structural mapping: header → semantic section with class 'header' -->
<section class="header">
  {#if $$slots.default}
    <slot />
  {:else}
    <div>AI-Assisted Writer — Mockup (référence)</div>
  {/if}
</section>
