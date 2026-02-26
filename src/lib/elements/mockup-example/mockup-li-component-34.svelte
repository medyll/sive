<!--
Generated Svelte scaffold from CMAD pseudo-HTML
Tag: li
ID: 
Attributes: {}
This file is a scaffold. Implement component logic and styles during development.
-->

<script lang="ts">
export const mockup = {
  "tag": "li",
  "id": null,
  "attrs": {}
};
</script>

<style>
/* Add component styles here */
</style>

<!-- Basic structural mapping: li → semantic section with class 'li' -->
<section class="li">
  {#if $$slots.default}
    <slot />
  {:else}
    <strong>Replace:</strong> "grey Peugeot" → "grey Peugeot 308"
  {/if}
</section>
