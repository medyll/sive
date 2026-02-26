<!-- Generated scaffold for chat-bubble -->
<script lang="ts">
export const mockup = {
  "tag": "chat-bubble",
  "id": null,
  "attrs": {}
};
</script>
<section class="chat-bubble">
  {#if $$slots.default}
    {@render $$slots.default()}
  {:else}
    <!-- placeholder -->
  {/if}
</section>