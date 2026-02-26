<!--
Generated Svelte scaffold from CMAD pseudo-HTML
Tag: strong
ID: 
Attributes: {}
This file is a scaffold. Implement component logic and styles during development.
-->

<script lang="ts">
export const mockup = {
  "tag": "strong",
  "id": null,
  "attrs": {}
};
</script>

<style>
/* Add component styles here */
</style>

<!-- Basic structural mapping: strong → semantic section with class 'strong' -->
<section class="strong">
  {#if $$slots.default}
    <slot />
  {:else}
    Replace:
  {/if}
</section>
