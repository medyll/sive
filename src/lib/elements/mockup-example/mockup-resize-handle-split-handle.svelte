<!-- Generated scaffold for resize-handle -->
<script lang="ts">
export const mockup = {
  "tag": "resize-handle",
  "id": "split-handle",
  "attrs": {
    "id": "split-handle"
  }
};
</script>
<section class="resize-handle">
  {#if $$slots.default}
    {@render $$slots.default()}
  {:else}
    <!-- placeholder -->
  {/if}
</section>