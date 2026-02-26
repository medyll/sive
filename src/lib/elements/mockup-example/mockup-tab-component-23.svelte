<!--
Generated Svelte scaffold from CMAD pseudo-HTML
Tag: tab
ID: 
Attributes: {}
This file is a scaffold. Implement component logic and styles during development.
-->

<script lang="ts">
export const mockup = {
  "tag": "tab",
  "id": null,
  "attrs": {}
};
</script>

<style>
/* Add component styles here */
</style>

<!-- Basic structural mapping: tab → semantic section with class 'tab' -->
<section class="tab">
  {#if $$slots.default}
    <slot />
  {:else}
    <!-- tab placeholder -->
  {/if}
</section>
