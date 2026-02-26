<!-- Generated scaffold for panel -->
<script lang="ts">
export const mockup = {
  "tag": "panel",
  "id": "editor-panel",
  "attrs": {
    "id": "editor-panel"
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