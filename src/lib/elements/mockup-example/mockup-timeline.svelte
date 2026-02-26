<!-- Generated scaffold for timeline -->
<script lang="ts">
export const mockup = {
  "tag": "timeline",
  "id": null,
  "attrs": {}
};
</script>
<section class="timeline">
  {#if $$slots.default}
    {@render $$slots.default()}
  {:else}
    <!-- placeholder -->
  {/if}
</section>