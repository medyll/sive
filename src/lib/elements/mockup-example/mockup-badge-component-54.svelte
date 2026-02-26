<!--
Generated Svelte scaffold from CMAD pseudo-HTML
Tag: badge
ID: 
Attributes: {}
This file is a scaffold. Implement component logic and styles during development.
-->

<script lang="ts">
export const mockup = {
  "tag": "badge",
  "id": null,
  "attrs": {}
};
</script>

<style>
/* Add component styles here */
</style>

<!-- Basic structural mapping: badge → semantic section with class 'badge' -->
<section class="badge">
  {#if $$slots.default}
    <slot />
  {:else}
    <!-- badge placeholder -->
  {/if}
</section>
