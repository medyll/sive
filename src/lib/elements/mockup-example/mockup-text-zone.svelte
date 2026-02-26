<!-- Generated scaffold for text-zone -->
<script lang="ts">
export const mockup = {
  "tag": "text-zone",
  "id": null,
  "attrs": {}
};
</script>
<section class="text-zone">
  {#if $$slots.default}
    {@render $$slots.default()}
  {:else}
    <!-- placeholder -->
  {/if}
</section>