<!--
Generated Svelte scaffold from CMAD pseudo-HTML
Tag: a
ID: 
Attributes: {"href":"../src/routes/application/+page.svelte"}
This file is a scaffold. Implement component logic and styles during development.
-->

<script lang="ts">
export const mockup = {
  "tag": "a",
  "id": null,
  "attrs": {
    "href": "../src/routes/application/+page.svelte"
  }
};
</script>

<style>
/* Add component styles here */
</style>

<!-- Basic structural mapping: a → semantic section with class 'a' -->
<section class="a">
  {#if $$slots.default}
    <slot />
  {:else}
    src/routes/application/+page.svelte
  {/if}
</section>
