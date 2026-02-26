<!-- Generated scaffold for tab-bar -->
<script lang="ts">
export const mockup = {
  "tag": "tab-bar",
  "id": null,
  "attrs": {}
};
</script>
<section class="tab-bar">
  {#if $$slots.default}
    {@render $$slots.default()}
  {:else}
    <!-- placeholder -->
  {/if}
</section>