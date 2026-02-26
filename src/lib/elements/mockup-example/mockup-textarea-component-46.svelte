<!--
Generated Svelte scaffold from CMAD pseudo-HTML
Tag: textarea
ID: 
Attributes: {}
This file is a scaffold. Implement component logic and styles during development.
-->

<script lang="ts">
export const mockup = {
  "tag": "textarea",
  "id": null,
  "attrs": {}
};
</script>

<style>
/* Add component styles here */
</style>

<!-- Basic structural mapping: textarea → semantic section with class 'textarea' -->
<section class="textarea">
  {#if $$slots.default}
    <slot />
  {:else}
    <!-- textarea placeholder -->
  {/if}
</section>
