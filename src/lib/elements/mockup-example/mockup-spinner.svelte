<!-- Generated scaffold for spinner -->
<script lang="ts">
export const mockup = {
  "tag": "spinner",
  "id": null,
  "attrs": {}
};
</script>
<section class="spinner">
  {#if $$slots.default}
    {@render $$slots.default()}
  {:else}
    <!-- placeholder -->
  {/if}
</section>