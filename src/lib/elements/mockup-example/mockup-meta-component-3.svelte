<!--
Generated Svelte scaffold from CMAD pseudo-HTML
Tag: meta
ID: 
Attributes: {"charset":"utf-8"}
This file is a scaffold. Implement component logic and styles during development.
-->

<script lang="ts">
export const mockup = {
  "tag": "meta",
  "id": null,
  "attrs": {
    "charset": "utf-8"
  }
};
</script>

<style>
/* Add component styles here */
</style>

<!-- Basic structural mapping: meta → semantic section with class 'meta' -->
<section class="meta">
  {#if $$slots.default}
    <slot />
  {:else}
    <!-- meta placeholder -->
  {/if}
</section>
