<!-- Generated scaffold for toolbar -->
<script lang="ts">
export const mockup = {
  "tag": "toolbar",
  "id": null,
  "attrs": {}
};
</script>
<section class="toolbar">
  {#if $$slots.default}
    {@render $$slots.default()}
  {:else}
    <!-- placeholder -->
  {/if}
</section>