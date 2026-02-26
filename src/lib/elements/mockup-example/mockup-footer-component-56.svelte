<!--
Generated Svelte scaffold from CMAD pseudo-HTML
Tag: footer
ID: 
Attributes: {"style":"position:fixed;left:12px;bottom:12px;color:var(--muted);font-size:12px"}
This file is a scaffold. Implement component logic and styles during development.
-->

<script lang="ts">
export const mockup = {
  "tag": "footer",
  "id": null,
  "attrs": {
    "style": "position:fixed;left:12px;bottom:12px;color:var(--muted);font-size:12px"
  }
};
</script>

<style>
/* Add component styles here */
</style>

<!-- Basic structural mapping: footer → semantic section with class 'footer' -->
<section class="footer">
  {#if $$slots.default}
    <slot />
  {:else}
    Référence: voir <a href="../src/routes/application/+page.svelte">src/routes/application/+page.svelte</a>
  {/if}
</section>
