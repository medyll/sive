<!-- Generated scaffold for diff-view -->
<script lang="ts">
export const mockup = {
  "tag": "diff-view",
  "id": null,
  "attrs": {}
};
</script>
<section class="diff-view">
  {#if $$slots.default}
    {@render $$slots.default()}
  {:else}
    <!-- placeholder -->
  {/if}
</section>