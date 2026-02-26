<!-- Generated scaffold for badge -->
<script lang="ts">
export const mockup = {
  "tag": "badge",
  "id": null,
  "attrs": {}
};
</script>
<section class="badge">
  {#if $$slots.default}
    {@render $$slots.default()}
  {:else}
    <!-- placeholder -->
  {/if}
</section>