<!--
Generated Svelte scaffold from CMAD pseudo-HTML
Tag: ul
ID: 
Attributes: {}
This file is a scaffold. Implement component logic and styles during development.
-->

<script lang="ts">
export const mockup = {
  "tag": "ul",
  "id": null,
  "attrs": {}
};
</script>

<style>
/* Add component styles here */
</style>

<!-- Basic structural mapping: ul → semantic section with class 'ul' -->
<section class="ul">
  {#if $$slots.default}
    <slot />
  {:else}
    <li><strong>Replace:</strong> "grey Peugeot" → "grey Peugeot 308"</li>
  {/if}
</section>
