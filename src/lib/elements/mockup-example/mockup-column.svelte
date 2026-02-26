<!-- Generated scaffold for column -->
<script lang="ts">
export const mockup = {
  "tag": "column",
  "id": null,
  "attrs": {}
};
</script>
<section class="column">
  {#if $$slots.default}
    {@render $$slots.default()}
  {:else}
    <!-- placeholder -->
  {/if}
</section>