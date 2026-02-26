<!-- Generated scaffold for overlay -->
<script lang="ts">
export const mockup = {
  "tag": "overlay",
  "id": null,
  "attrs": {}
};
</script>
<section class="overlay">
  {#if $$slots.default}
    {@render $$slots.default()}
  {:else}
    <!-- placeholder -->
  {/if}
</section>