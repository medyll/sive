<!-- Generated scaffold for row -->
<script lang="ts">
export const mockup = {
  "tag": "row",
  "id": null,
  "attrs": {}
};
</script>
<section class="row">
  {#if $$slots.default}
    {@render $$slots.default()}
  {:else}
    <!-- placeholder -->
  {/if}
</section>