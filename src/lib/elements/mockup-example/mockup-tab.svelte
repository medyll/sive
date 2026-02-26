<!-- Generated scaffold for tab -->
<script lang="ts">
export const mockup = {
  "tag": "tab",
  "id": null,
  "attrs": {}
};
</script>
<section class="tab">
  {#if $$slots.default}
    {@render $$slots.default()}
  {:else}
    <!-- placeholder -->
  {/if}
</section>