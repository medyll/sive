<!-- Generated scaffold for panel -->
<script lang="ts">
export const mockup = {
  "tag": "panel",
  "id": null,
  "attrs": {}
};
</script>
<section class="panel">
  {#if $$slots.default}
    {@render $$slots.default()}
  {:else}
    <!-- placeholder -->
  {/if}
</section>