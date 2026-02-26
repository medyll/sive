<!--
Generated Svelte scaffold from CMAD pseudo-HTML
Tag: overlay
ID: 
Attributes: {}
This file is a scaffold. Implement component logic and styles during development.
-->

<script lang="ts">
export const mockup = {
  "tag": "overlay",
  "id": null,
  "attrs": {}
};
</script>

<style>
/* Add component styles here */
</style>

<!-- Basic structural mapping: overlay → semantic section with class 'overlay' -->
<section class="overlay">
  {#if $$slots.default}
    <slot />
  {:else}
    <!-- overlay placeholder -->
  {/if}
</section>
