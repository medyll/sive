<!--
Generated Svelte scaffold from CMAD pseudo-HTML
Tag: button
ID: 
Attributes: {}
This file is a scaffold. Implement component logic and styles during development.
-->

<script lang="ts">
export const mockup = {
  "tag": "button",
  "id": null,
  "attrs": {}
};
</script>

<style>
/* Add component styles here */
</style>

<!-- Basic structural mapping: button → semantic section with class 'button' -->
<section class="button">
  {#if $$slots.default}
    <slot />
  {:else}
    Run Analysis
  {/if}
</section>
