<!-- Generated scaffold for panel -->
<script lang="ts">
export const mockup = {
  "tag": "panel",
  "id": "ai-panel",
  "attrs": {
    "id": "ai-panel"
  }
};
</script>
<section class="panel">
  {#if $$slots.default}
    {@render $$slots.default()}
  {:else}
    <!-- placeholder -->
  {/if}
</section>