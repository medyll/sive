<!--
Generated Svelte scaffold from CMAD pseudo-HTML
Tag: textarea
ID: 
Attributes: {"style":"width:100%;height:80%;background:#071028;color:#d6e6ff;border:0;padding:12px;font-family:monospace;"}
This file is a scaffold. Implement component logic and styles during development.
-->

<script lang="ts">
export const mockup = {
  "tag": "textarea",
  "id": null,
  "attrs": {
    "style": "width:100%;height:80%;background:#071028;color:#d6e6ff;border:0;padding:12px;font-family:monospace;"
  }
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
    Start writing...
  {/if}
</section>
