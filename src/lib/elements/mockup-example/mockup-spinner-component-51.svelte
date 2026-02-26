<!--
Generated Svelte scaffold from CMAD pseudo-HTML
Tag: spinner
ID: 
Attributes: {}
This file is a scaffold. Implement component logic and styles during development.
-->

<script lang="ts">
export const mockup = {
  "tag": "spinner",
  "id": null,
  "attrs": {}
};
</script>

<style>
/* Add component styles here */
</style>

<!-- Basic structural mapping: spinner → semantic section with class 'spinner' -->
<section class="spinner">
  {#if $$slots.default}
    <slot />
  {:else}
    <!-- spinner placeholder -->
  {/if}
</section>
