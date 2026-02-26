<!--
Generated Svelte scaffold from CMAD pseudo-HTML
Tag: text-zone
ID: main-editor
Attributes: {"id":"main-editor","multiline":true}
This file is a scaffold. Implement component logic and styles during development.
-->

<script lang="ts">
export const mockup = {
  "tag": "text-zone",
  "id": "main-editor",
  "attrs": {
    "id": "main-editor",
    "multiline": true
  }
};
</script>

<style>
/* Add component styles here */
</style>

<!-- Basic structural mapping: text-zone → semantic section with class 'text-zone' -->
<section class="text-zone">
  {#if $$slots.default}
    <slot />
  {:else}
    <!-- text-zone placeholder -->
  {/if}
</section>
