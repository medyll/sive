<!--
Generated Svelte scaffold from CMAD pseudo-HTML
Tag: resize-handle
ID: split-handle
Attributes: {"id":"split-handle"}
This file is a scaffold. Implement component logic and styles during development.
-->

<script lang="ts">
export const mockup = {
  "tag": "resize-handle",
  "id": "split-handle",
  "attrs": {
    "id": "split-handle"
  }
};
</script>

<style>
/* Add component styles here */
</style>

<!-- Basic structural mapping: resize-handle → semantic section with class 'resize-handle' -->
<section class="resize-handle">
  {#if $$slots.default}
    <slot />
  {:else}
    <!-- resize-handle placeholder -->
  {/if}
</section>
