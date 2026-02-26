<!--
Generated Svelte scaffold from CMAD pseudo-HTML
Tag: meta
ID: viewport
Attributes: {"name":"viewport","content":"width=device-width,initial-scale=1"}
This file is a scaffold. Implement component logic and styles during development.
-->

<script lang="ts">
export const mockup = {
  "tag": "meta",
  "id": "viewport",
  "attrs": {
    "name": "viewport",
    "content": "width=device-width,initial-scale=1"
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
